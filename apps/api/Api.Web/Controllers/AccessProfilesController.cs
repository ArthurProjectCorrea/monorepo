using Api.Core.Entities;
using Api.Core.Interfaces;
using Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/access-profiles")]
public class AccessProfilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDatabase _redis;
    private readonly IPermissionService _permissionService;

    public AccessProfilesController(
        AppDbContext context,
        IConnectionMultiplexer redis,
        IPermissionService permissionService)
    {
        _context = context;
        _redis = redis.GetDatabase();
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
    public async Task<IActionResult> GetAccessProfiles()
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "access_profiles", "view"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var profiles = await _context.AccessProfiles
            .Include(ap => ap.Permissions)
            .Where(ap => ap.ClientId == clientId && ap.DeletedAt == null)
            .OrderByDescending(ap => ap.CreatedAt)
            .ToListAsync();

        var screens = await _context.Screens
            .Where(s => s.ClientId == clientId) // Include screens for the current client
            .Select(s => new { id = s.Id, name = s.Title, key = s.ScreenKey })
            .ToListAsync();

        // Hardcoded actions as they are strings in DB
        var actions = new[]
        {
            new { id = "view", name = "View", key = "view" },
            new { id = "create", name = "Create", key = "create" },
            new { id = "update", name = "Update", key = "update" },
            new { id = "delete", name = "Delete", key = "delete" }
        };

        var screenMetadata = await _context.Screens
            .FirstOrDefaultAsync(s => s.ScreenKey == "access_profiles" && s.ClientId == clientId);

        return Ok(new
        {
            status = "success",
            data = profiles.Select(ap => new
            {
                id = ap.Id,
                name = ap.Name,
                description = ap.Description,
                is_active = ap.IsActive,
                created_at = ap.CreatedAt,
                updated_at = ap.UpdatedAt,
                accesses = ap.Permissions.Select(p => new
                {
                    screen_id = p.ScreenId,
                    action_id = p.ActionId
                })
            }),
            screen_access_profiles = screenMetadata != null ? new
            {
                id = screenMetadata.Id,
                description = screenMetadata.Description,
                key = screenMetadata.ScreenKey,
                title = screenMetadata.Title
            } : null,
            other = new
            {
                actions = actions,
                screens = screens
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccessProfile(Guid id)
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "access_profiles", "view"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var profile = await _context.AccessProfiles
            .Include(ap => ap.Permissions)
            .FirstOrDefaultAsync(ap => ap.Id == id && ap.ClientId == clientId && ap.DeletedAt == null);

        if (profile == null) return NotFound(new { error = new { code = "PROFILE_NOT_FOUND", message = "Access profile not found." } });

        return Ok(new
        {
            status = "success",
            data = new
            {
                id = profile.Id,
                name = profile.Name,
                description = profile.Description,
                is_active = profile.IsActive,
                created_at = profile.CreatedAt,
                updated_at = profile.UpdatedAt,
                permissions = profile.Permissions.Select(p => new
                {
                    screen_id = _context.Screens.FirstOrDefault(s => s.Id == p.ScreenId)?.ScreenKey ?? p.ScreenId.ToString(),
                    action_id = p.ActionId
                })
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateAccessProfile([FromBody] CreateAccessProfileRequest request)
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "access_profiles", "create"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var profile = new AccessProfile
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive,
            ClientId = clientId.Value
        };

        foreach (var p in request.Permissions)
        {
            var screen = await _context.Screens.FirstOrDefaultAsync(s => (s.ScreenKey == p.ScreenId || s.Id.ToString() == p.ScreenId) && s.ClientId == clientId);
            if (screen != null)
            {
                profile.Permissions.Add(new AccessProfilePermission
                {
                    ScreenId = screen.Id,
                    ActionId = p.ActionId
                });
            }
        }

        _context.AccessProfiles.Add(profile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAccessProfile), new { id = profile.Id }, new
        {
            status = "success",
            data = new { id = profile.Id }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccessProfile(Guid id, [FromBody] UpdateAccessProfileRequest request)
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "access_profiles", "update"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var profile = await _context.AccessProfiles
                .Include(ap => ap.Permissions)
                .FirstOrDefaultAsync(ap => ap.Id == id && ap.ClientId == clientId && ap.DeletedAt == null);

            if (profile == null) return NotFound(new { error = new { code = "PROFILE_NOT_FOUND", message = "Access profile not found." } });

            profile.Name = request.Name;
            profile.Description = request.Description;
            profile.IsActive = request.IsActive;
            profile.UpdatedAt = DateTime.UtcNow;

            // Clear existing permissions from database directly to avoid tracker issues
            await _context.AccessProfilePermissions
                .Where(p => p.AccessProfileId == id)
                .ExecuteDeleteAsync();

            // Clear the tracked collection to ensure EF doesn't try to update them
            profile.Permissions.Clear();

            foreach (var p in request.Permissions)
            {
                var screen = await _context.Screens.FirstOrDefaultAsync(s => (s.ScreenKey == p.ScreenId || s.Id.ToString() == p.ScreenId) && s.ClientId == clientId);
                if (screen != null)
                {
                    _context.AccessProfilePermissions.Add(new AccessProfilePermission
                    {
                        AccessProfileId = profile.Id,
                        ScreenId = screen.Id,
                        ActionId = p.ActionId
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { status = "success" });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccessProfile(Guid id)
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "access_profiles", "delete"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var profile = await _context.AccessProfiles.FirstOrDefaultAsync(ap => ap.Id == id && ap.ClientId == clientId && ap.DeletedAt == null);
        if (profile == null) return NotFound(new { error = new { code = "PROFILE_NOT_FOUND", message = "Access profile not found." } });

        profile.DeletedAt = DateTime.UtcNow;
        _context.AccessProfiles.Update(profile);
        await _context.SaveChangesAsync();

        return Ok(new { status = "success" });
    }
}

public class PermissionRequest
{
    public string ScreenId { get; set; } = string.Empty;
    public string ActionId { get; set; } = string.Empty;
}

public class CreateAccessProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<PermissionRequest> Permissions { get; set; } = new();
}

public class UpdateAccessProfileRequest : CreateAccessProfileRequest
{
}
