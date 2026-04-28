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

    public ClientController(
        AppDbContext context,
        IStorageService storageService,
        IConnectionMultiplexer redis)
    {
        _context = context;
        _storageService = storageService;
        _redis = redis.GetDatabase();
    }

    private async Task<Guid?> GetClientIdFromSession()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ")) return null;

        var sessionId = authHeader.Substring("Bearer ".Length).Trim();
        var sessionJson = await _redis.StringGetAsync($"session:{sessionId}");

        if (!sessionJson.HasValue) return null;

        var sessionData = JsonSerializer.Deserialize<Dictionary<string, object>>((string)sessionJson!);
        var clientIdStr = sessionData?.ContainsKey("client_id") == true ? sessionData["client_id"]?.ToString() : null;

        return string.IsNullOrEmpty(clientIdStr) ? null : Guid.Parse(clientIdStr);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyClient()
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var client = await _context.Clients.FindAsync(clientId);
        if (client == null) return NotFound(new { error = new { code = "CLIENT_NOT_FOUND", message = "Client not found." } });

        var screen = await _context.Screens.FirstOrDefaultAsync(s => s.ScreenKey == "general" && s.IsActive);

        return Ok(new
        {
            status = "success",
            client = new
            {
                id = client.Id,
                name = client.Name,
                domain = client.Domain,
                description = client.Description,
                logo_url = client.LogoUrl
            },
            screen = screen != null ? new
            {
                title = screen.Title,
                description = screen.Description
            } : null
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyClient([FromBody] UpdateClientRequest request)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var client = await _context.Clients.FindAsync(clientId);
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
