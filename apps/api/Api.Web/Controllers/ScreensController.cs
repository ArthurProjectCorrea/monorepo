using Api.Core.Entities;
using Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/parameters/screens")]
public class ScreensController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDatabase _redis;

    public ScreensController(
        AppDbContext context,
        IConnectionMultiplexer redis)
    {
        _context = context;
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

    [HttpGet]
    public async Task<IActionResult> GetScreens()
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var screens = await _context.Screens
            .Where(s => s.ClientId == clientId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                id = s.Id,
                screenKey = s.ScreenKey,
                title = s.Title,
                description = s.Description,
                isActive = s.IsActive,
                updatedAt = s.UpdatedAt
            })
            .ToListAsync();

        var screenParameter = await _context.Screens.FirstOrDefaultAsync(s => s.ScreenKey == "screen_parameters" && s.ClientId == clientId);

        return Ok(new
        {
            status = "success",
            data = screens,
            screen = screenParameter != null ? new
            {
                title = screenParameter.Title,
                description = screenParameter.Description,
                screenKey = screenParameter.ScreenKey
            } : null
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateScreen(Guid id, [FromBody] UpdateScreenRequest request)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var screen = await _context.Screens.FirstOrDefaultAsync(s => s.Id == id && s.ClientId == clientId);
        if (screen == null) return NotFound(new { error = new { code = "SCREEN_NOT_FOUND", message = "Screen not found." } });

        screen.Title = request.Title;
        screen.Description = request.Description;
        screen.IsActive = request.IsActive;
        screen.UpdatedAt = DateTime.UtcNow;

        _context.Screens.Update(screen);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            status = "success",
            data = new
            {
                id = screen.Id,
                screenKey = screen.ScreenKey,
                title = screen.Title,
                description = screen.Description,
                isActive = screen.IsActive,
                updatedAt = screen.UpdatedAt
            }
        });
    }
}

public class UpdateScreenRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
