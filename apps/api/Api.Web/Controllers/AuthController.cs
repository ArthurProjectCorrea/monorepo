using Api.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text.Json;
using Api.Infrastructure.Data;
using Api.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/auth")]
public partial class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IDatabase _redis;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        AppDbContext context,
        IEmailService emailService,
        IConnectionMultiplexer redis)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _emailService = emailService;
        _redis = redis.GetDatabase();
    }

    [HttpPost("sign-in")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Identifier);
        if (user == null)
        {
            return Unauthorized(new { error = new { code = "INVALID_CREDENTIALS", message = "Invalid email or password." } });
        }

        var result = await _signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true);

        if (result.Succeeded)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var sessionId = Guid.NewGuid().ToString();
            var expiresInSeconds = 3600; // 1 hour

            // Fetch complete access tree for session
            var teamAccesses = await _context.UserTeamAccesses
                .Where(uta => uta.UserId == user.Id)
                .Include(uta => uta.Team)
                .Include(uta => uta.AccessProfile)
                    .ThenInclude(ap => ap.Permissions)
                        .ThenInclude(p => p.Screen)
                .ToListAsync();

            var sessionData = new
            {
                user_id = user.Id,
                email = user.Email,
                display_name = user.DisplayName,
                roles = roles,
                client_id = user.ClientId,
                teams = teamAccesses.Select(uta => new
                {
                    id = uta.TeamId,
                    name = uta.Team?.Name,
                    access_profile = new
                    {
                        id = uta.AccessProfileId,
                        name = uta.AccessProfile?.Name,
                        permissions = uta.AccessProfile?.Permissions?
                            .Where(p => p.Screen != null)
                            .GroupBy(p => p.Screen!.ScreenKey)
                            .Select(g => new
                            {
                                screen_key = g.Key,
                                actions = g.Select(p => p.ActionId).ToList()
                            })
                            .ToList()

                    }
                }).ToList()
            };

            var sessionJson = JsonSerializer.Serialize(sessionData);

            // Store session in Redis
            await _redis.StringSetAsync($"session:{sessionId}", sessionJson, TimeSpan.FromSeconds(expiresInSeconds));

            string? domain = null;
            if (user.ClientId.HasValue)
            {
                var client = await _context.Clients.FindAsync(user.ClientId.Value);
                if (client != null)
                {
                    domain = client.Domain;
                    var clientCache = new
                    {
                        id = client.Id,
                        name = client.Name,
                        domain = client.Domain,
                        logo_url = client.LogoUrl
                    };
                    await _redis.StringSetAsync($"client:{client.Id}", JsonSerializer.Serialize(clientCache), TimeSpan.FromDays(7));
                }
            }

            // Store session mapping for global logout (set of session IDs for a user)
            await _redis.SetAddAsync($"user_sessions:{user.Id}", sessionId);
            // Expire the set reasonably (e.g., 7 days)
            await _redis.KeyExpireAsync($"user_sessions:{user.Id}", TimeSpan.FromDays(7));

            return Ok(new
            {
                status = "authenticated",
                session = new
                {
                    session_id = sessionId,
                    expires_in = expiresInSeconds
                },
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    display_name = user.DisplayName,
                    roles = roles,
                    client_id = user.ClientId,
                    domain = domain
                }
            });
        }

        if (result.IsLockedOut)
        {
            return StatusCode(429, new { error = new { code = "USER_LOCKED_OUT", message = "Too many failed attempts." } });
        }

        return Unauthorized(new { error = new { code = "INVALID_CREDENTIALS", message = "Invalid email or password." } });
    }

    [HttpGet("session")]
    public async Task<IActionResult> GetSession([FromHeader(Name = "Authorization")] string? authHeader)
    {
        string? sessionId = null;

        // Extract session ID from Authorization header (Bearer <token>)
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            sessionId = authHeader.Substring("Bearer ".Length).Trim();
        }

        if (string.IsNullOrEmpty(sessionId))
        {
            return Unauthorized(new { error = new { code = "MISSING_SESSION", message = "No session ID provided." } });
        }

        var sessionKey = $"session:{sessionId}";
        var sessionJson = await _redis.StringGetAsync(sessionKey);

        if (!sessionJson.HasValue)
        {
            return Unauthorized(new { error = new { code = "INVALID_SESSION", message = "Session is invalid or has expired." } });
        }

        var sessionData = JsonSerializer.Deserialize<Dictionary<string, object>>((string)sessionJson!);
        var userId = sessionData?["user_id"]?.ToString();
        var clientId = sessionData?.ContainsKey("client_id") == true ? sessionData["client_id"]?.ToString() : null;

        if (userId == null) return Unauthorized();

        // Renew session if TTL is close to expiring (e.g. less than 15 mins)
        var ttl = await _redis.KeyTimeToLiveAsync(sessionKey);
        if (ttl.HasValue && ttl.Value.TotalMinutes < 15)
        {
            await _redis.KeyExpireAsync(sessionKey, TimeSpan.FromHours(1));
            await _redis.KeyExpireAsync($"user_sessions:{userId}", TimeSpan.FromDays(7));
        }

        // Fetch client info from cache or DB
        object? clientInfo = null;
        if (!string.IsNullOrEmpty(clientId))
        {
            var clientCacheKey = $"client:{clientId}";
            var clientJson = await _redis.StringGetAsync(clientCacheKey);

            if (clientJson.HasValue)
            {
                clientInfo = JsonSerializer.Deserialize<object>((string)clientJson!);
            }
            else
            {
                var client = await _context.Clients.FindAsync(Guid.Parse(clientId));
                if (client != null)
                {
                    var clientCache = new
                    {
                        id = client.Id,
                        name = client.Name,
                        domain = client.Domain,
                        logo_url = client.LogoUrl
                    };
                    clientInfo = clientCache;
                    await _redis.StringSetAsync(clientCacheKey, JsonSerializer.Serialize(clientCache), TimeSpan.FromDays(7));
                }
            }
        }

        return Ok(new
        {
            status = "active",
            user = new
            {
                id = userId,
                email = sessionData?["email"]?.ToString(),
                display_name = sessionData?["display_name"]?.ToString(),
                roles = sessionData?["roles"],
                client_id = clientId
            },
            client = clientInfo
        });
    }

    [HttpPost("sign-out")]
    public async Task<IActionResult> SignOut([FromHeader(Name = "Authorization")] string? authHeader, [FromQuery] bool all = false)
    {
        string? sessionId = null;
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            sessionId = authHeader.Substring("Bearer ".Length).Trim();
        }

        if (!string.IsNullOrEmpty(sessionId))
        {
            var sessionKey = $"session:{sessionId}";

            if (all)
            {
                var sessionJson = await _redis.StringGetAsync(sessionKey);
                if (sessionJson.HasValue)
                {
                    var sessionData = JsonSerializer.Deserialize<Dictionary<string, object>>((string)sessionJson!);
                    var userId = sessionData?["user_id"]?.ToString();

                    if (!string.IsNullOrEmpty(userId))
                    {
                        var userSessionsKey = $"user_sessions:{userId}";
                        var sessionIds = await _redis.SetMembersAsync(userSessionsKey);

                        foreach (var id in sessionIds)
                        {
                            await _redis.KeyDeleteAsync($"session:{id}");
                        }

                        await _redis.KeyDeleteAsync(userSessionsKey);
                    }
                }
            }
            else
            {
                // Try to remove from user's active sessions set
                var sessionJson = await _redis.StringGetAsync(sessionKey);
                if (sessionJson.HasValue)
                {
                    var sessionData = JsonSerializer.Deserialize<Dictionary<string, object>>((string)sessionJson!);
                    var userId = sessionData?["user_id"]?.ToString();
                    if (!string.IsNullOrEmpty(userId))
                    {
                        await _redis.SetRemoveAsync($"user_sessions:{userId}", sessionId);
                    }
                }

                // Sign out current session only
                await _redis.KeyDeleteAsync(sessionKey);
            }
        }

        return Ok(new { status = "signed_out" });
    }
}

public record SignInRequest(string Identifier, string Password, bool RememberMe = false);
