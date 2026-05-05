using Api.Core.Entities;
using Api.Core.Interfaces;
using Api.Infrastructure.Data;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly AppDbContext _context;
    private readonly IDatabase _redis;
    private readonly IEmailService _emailService;
    private readonly IPermissionService _permissionService;

    public UsersController(
        UserManager<User> userManager,
        AppDbContext context,
        IConnectionMultiplexer redis,
        IEmailService emailService,
        IPermissionService permissionService)
    {
        _userManager = userManager;
        _context = context;
        _redis = redis.GetDatabase();
        _emailService = emailService;
        _permissionService = permissionService;
    }


    private string GetSessionId()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ")) return string.Empty;
        return authHeader.Substring("Bearer ".Length).Trim();
    }

    private async Task<Guid?> GetClientIdFromSession()
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return null;

        var sessionJson = await _redis.StringGetAsync($"session:{sessionId}");
        if (!sessionJson.HasValue) return null;

        var sessionData = JsonSerializer.Deserialize<Dictionary<string, object>>((string)sessionJson!);
        var clientIdStr = sessionData?.ContainsKey("client_id") == true ? sessionData["client_id"]?.ToString() : null;

        return string.IsNullOrEmpty(clientIdStr) ? null : Guid.Parse(clientIdStr);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        if (!await _permissionService.HasPermissionAsync(sessionId, "users", "view"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var users = await _userManager.Users
            .Where(u => u.ClientId == clientId && u.DeletedAt == null)
            .Include(u => u.TeamAccesses)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var teams = await _context.Teams
            .Where(t => t.ClientId == clientId && t.DeletedAt == null)
            .Select(t => new { id = t.Id, name = t.Name })
            .ToListAsync();

        var profiles = await _context.AccessProfiles
            .Where(ap => ap.ClientId == clientId)
            .Select(ap => new { id = ap.Id, name = ap.Name })
            .ToListAsync();

        var screenMetadata = await _context.Screens
            .FirstOrDefaultAsync(s => s.ScreenKey == "users" && s.ClientId == clientId);

        return Ok(new
        {
            status = "success",
            data = users.Select(u => new
            {
                id = u.Id,
                name = u.DisplayName,
                email = u.Email,
                is_active = u.IsActive,
                created_at = u.CreatedAt,
                updated_at = u.UpdatedAt ?? u.CreatedAt,
                accesses = u.TeamAccesses.Select(ta => new
                {
                    team_id = ta.TeamId,
                    access_profile_id = ta.AccessProfileId
                }).ToList()
            }),
            screen_users = screenMetadata != null ? new
            {
                id = screenMetadata.Id,
                description = screenMetadata.Description,
                key = screenMetadata.ScreenKey,
                title = screenMetadata.Title
            } : null,
            other = new
            {
                teams = teams,
                access_profiles = profiles
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        if (!await _permissionService.HasPermissionAsync(sessionId, "users", "view"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var user = await _context.Users
            .Include(u => u.TeamAccesses)
            .FirstOrDefaultAsync(u => u.Id == id && u.ClientId == clientId && u.DeletedAt == null);

        if (user == null) return NotFound(new { error = new { code = "USER_NOT_FOUND", message = "User not found." } });

        return Ok(new
        {
            status = "success",
            data = new
            {
                id = user.Id,
                name = user.DisplayName,
                email = user.Email,
                is_active = user.IsActive,
                created_at = user.CreatedAt,
                updated_at = user.UpdatedAt ?? user.CreatedAt,
                accesses = user.TeamAccesses.Select(ta => new
                {
                    team_id = ta.TeamId,
                    access_profile_id = ta.AccessProfileId
                }).ToList()
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] SaveUserRequest request)
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        if (!await _permissionService.HasPermissionAsync(sessionId, "users", "create"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        // Check for duplicate teams in request
        if (request.Teams.Select(t => t.TeamId).Distinct().Count() != request.Teams.Count)
        {
            return BadRequest(new { error = new { code = "DUPLICATE_TEAMS", message = "A user cannot be linked to the same team more than once." } });
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.Name,
            IsActive = request.IsActive,
            ClientId = clientId,
            CreatedAt = DateTime.UtcNow
        };

        // Use a temporary default password (complex enough to pass validation)
        var tempPassword = "A" + Guid.NewGuid().ToString("N") + "!";
        var result = await _userManager.CreateAsync(user, tempPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new { error = new { code = "CREATE_FAILED", message = result.Errors.FirstOrDefault()?.Description } });
        }

        foreach (var ta in request.Teams)
        {
            var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == ta.TeamId && t.ClientId == clientId);
            var profile = await _context.AccessProfiles.FirstOrDefaultAsync(ap => ap.Id == ta.ProfileId && ap.ClientId == clientId);

            if (team != null && profile != null)
            {
                _context.UserTeamAccesses.Add(new UserTeamAccess
                {
                    UserId = user.Id,
                    TeamId = team.Id,
                    AccessProfileId = profile.Id
                });
            }
        }

        await _context.SaveChangesAsync();

        // Trigger password reset flow automatically
        await SendResetEmailInternal(user, clientId.Value);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
        {
            status = "success",
            data = user.Id
        });
    }

    [HttpPost("{id}/resend-reset")]
    public async Task<IActionResult> ResendResetLink(string id)
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        if (!await _permissionService.HasPermissionAsync(sessionId, "users", "update"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null || user.ClientId != clientId)
        {
            return NotFound(new { error = new { code = "USER_NOT_FOUND", message = "User not found." } });
        }

        await SendResetEmailInternal(user, clientId.Value);

        return Ok(new { status = "success" });
    }

    private async Task SendResetEmailInternal(User user, Guid clientId)
    {
        var client = await _context.Clients.FindAsync(clientId);
        var domain = client?.Domain ?? "main";

        var resetToken = Guid.NewGuid().ToString();
        var recoveryRequest = new PasswordRecoveryRequest
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Identifier = user.Email!,
            OtpHash = "AUTO_GENERATED", // Not using OTP for this flow
            OtpExpiresAt = DateTime.UtcNow,
            Status = "OTP_VERIFIED", // Pre-verified
            ResetTokenHash = resetToken,
            ResetTokenExpiresAt = DateTime.UtcNow.AddDays(1)
        };

        _context.PasswordRecoveryRequests.Add(recoveryRequest);
        await _context.SaveChangesAsync();

        // Link format: /reset-password?token={token}&email={email}
        // In a real multi-tenant app, the base URL would come from configuration or request
        var lang = "pt"; // Default
        var resetLink = $"https://{domain}/{lang}/reset-password?token={resetToken}&email={user.Email}";

        await _emailService.SendEmailAsync(
            user.Email!,
            "Bem-vindo - Defina sua senha",
            $"<p>Olá {user.DisplayName},</p>" +
            $"<p>Sua conta foi criada. Clique no link abaixo para definir sua senha de acesso:</p>" +
            $"<p><a href='{resetLink}'>{resetLink}</a></p>" +
            $"<p>Este link é válido por 24 horas.</p>");
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] SaveUserRequest request)
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        if (!await _permissionService.HasPermissionAsync(sessionId, "users", "update"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var user = await _context.Users
            .Include(u => u.TeamAccesses)
            .FirstOrDefaultAsync(u => u.Id == id && u.ClientId == clientId);

        if (user == null) return NotFound(new { error = new { code = "USER_NOT_FOUND", message = "User not found." } });

        // Check for duplicate teams in request
        if (request.Teams.Select(t => t.TeamId).Distinct().Count() != request.Teams.Count)
        {
            return BadRequest(new { error = new { code = "DUPLICATE_TEAMS", message = "A user cannot be linked to the same team more than once." } });
        }

        user.DisplayName = request.Name;
        user.Email = request.Email;
        user.UserName = request.Email;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        // Sync team accesses
        _context.UserTeamAccesses.RemoveRange(user.TeamAccesses);
        foreach (var ta in request.Teams)
        {
            var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == ta.TeamId && t.ClientId == clientId);
            var profile = await _context.AccessProfiles.FirstOrDefaultAsync(ap => ap.Id == ta.ProfileId && ap.ClientId == clientId);

            if (team != null && profile != null)
            {
                _context.UserTeamAccesses.Add(new UserTeamAccess
                {
                    UserId = user.Id,
                    TeamId = team.Id,
                    AccessProfileId = profile.Id
                });
            }
        }

        await _context.SaveChangesAsync();
        await _userManager.UpdateAsync(user);

        // Invalidate session in Redis if permissions changed
        // For simplicity, we invalidate all user sessions
        await _redis.KeyDeleteAsync($"user_sessions:{user.Id}");

        return Ok(new { status = "success" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrEmpty(sessionId)) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        if (!await _permissionService.HasPermissionAsync(sessionId, "users", "delete"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.ClientId == clientId && u.DeletedAt == null);
        if (user == null) return NotFound(new { error = new { code = "USER_NOT_FOUND", message = "User not found." } });

        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { status = "success" });
    }
}

public class SaveUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<TeamAccessDto> Teams { get; set; } = new();
}

public class TeamAccessDto
{
    public Guid TeamId { get; set; }
    public Guid ProfileId { get; set; }
}
