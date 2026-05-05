using Api.Core.Entities;
using Api.Core.Interfaces;
using Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/clients")]
public class ClientController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storageService;
    private readonly IDatabase _redis;
    private readonly IPermissionService _permissionService;

    public ClientController(
        AppDbContext context,
        IStorageService storageService,
        IConnectionMultiplexer redis,
        IPermissionService permissionService)
    {
        _context = context;
        _storageService = storageService;
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

    [HttpGet("me")]
    public async Task<IActionResult> GetMyClient()
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "general", "view"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.DeletedAt == null);
        if (client == null) return NotFound(new { error = new { code = "CLIENT_NOT_FOUND", message = "Client not found." } });

        var screen = await _context.Screens.FirstOrDefaultAsync(s => s.ScreenKey == "general" && s.IsActive);

        return Ok(new
        {
            status = "success",
            data = new
            {
                id = client.Id,
                name = client.Name,
                domain = client.Domain,
                description = client.Description,
                logo_url = client.LogoUrl,
                is_active = client.IsActive,
                created_at = client.CreatedAt,
                updated_at = client.UpdatedAt
            },
            screen_general = screen != null ? new
            {
                id = screen.Id,
                description = screen.Description,
                key = screen.ScreenKey,
                title = screen.Title
            } : null
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyClient([FromBody] UpdateClientRequest request)
    {
        var sessionId = GetSessionId();
        if (!await _permissionService.HasPermissionAsync(sessionId, "general", "update"))
        {
            return Forbid();
        }

        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.DeletedAt == null);
        if (client == null) return NotFound(new { error = new { code = "CLIENT_NOT_FOUND", message = "Client not found." } });

        client.Name = request.Name;
        client.Description = request.Description;
        client.Domain = request.Domain;
        client.UpdatedAt = DateTime.UtcNow;

        _context.Clients.Update(client);
        await _context.SaveChangesAsync();

        var clientCache = new { id = client.Id, name = client.Name, domain = client.Domain, logo_url = client.LogoUrl };
        await _redis.StringSetAsync($"client:{client.Id}", JsonSerializer.Serialize(clientCache), TimeSpan.FromDays(7));

        return Ok(new { status = "success", client = clientCache });
    }

    [HttpPost("me/logo")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateLogo([FromForm] IFormFile logo)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var client = await _context.Clients.FindAsync(clientId);
        if (client == null) return NotFound(new { error = new { code = "CLIENT_NOT_FOUND", message = "Client not found." } });

        if (logo != null && logo.Length > 0)
        {
            if (!string.IsNullOrEmpty(client.LogoUrl))
            {
                await _storageService.DeleteFileAsync(client.LogoUrl);
            }

            using var stream = logo.OpenReadStream();
            client.LogoUrl = await _storageService.SaveFileAsync(stream, logo.FileName);

            client.UpdatedAt = DateTime.UtcNow;
            _context.Clients.Update(client);
            await _context.SaveChangesAsync();

            var clientCache = new { id = client.Id, name = client.Name, domain = client.Domain, logo_url = client.LogoUrl };
            await _redis.StringSetAsync($"client:{client.Id}", JsonSerializer.Serialize(clientCache), TimeSpan.FromDays(7));

            return Ok(new { status = "success", logo_url = client.LogoUrl });
        }

        return BadRequest(new { error = new { code = "INVALID_FILE", message = "No file provided." } });
    }
}

public class UpdateClientRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Domain { get; set; } = string.Empty;
}
