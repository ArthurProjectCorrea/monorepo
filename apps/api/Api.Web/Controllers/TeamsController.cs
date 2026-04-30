using Api.Core.Entities;
using Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/teams")]
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDatabase _redis;

    public TeamsController(
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
    public async Task<IActionResult> GetTeams()
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var teams = await _context.Teams
            .Where(t => t.ClientId == clientId && t.DeletedAt == null)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                id = t.Id,
                name = t.Name,
                icon = t.Icon,
                status = t.IsActive,
                updated_at = t.UpdatedAt ?? t.CreatedAt
            })
            .ToListAsync();

        var screenMetadata = await _context.Screens
            .FirstOrDefaultAsync(s => s.ScreenKey == "teams" && s.ClientId == clientId);

        return Ok(new
        {
            status = "success",
            data = teams,
            screen = screenMetadata != null ? new
            {
                title = screenMetadata.Title,
                description = screenMetadata.Description,
                screenKey = screenMetadata.ScreenKey
            } : null
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeam(Guid id)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == id && t.ClientId == clientId && t.DeletedAt == null);
        if (team == null) return NotFound(new { error = new { code = "TEAM_NOT_FOUND", message = "Team not found." } });

        return Ok(new
        {
            status = "success",
            data = new
            {
                id = team.Id,
                name = team.Name,
                icon = team.Icon,
                status = team.IsActive,
                updated_at = team.UpdatedAt ?? team.CreatedAt
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var team = new Team
        {
            Name = request.Name,
            Icon = request.Icon,
            IsActive = request.IsActive,
            ClientId = clientId.Value
        };

        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, new
        {
            status = "success",
            data = new
            {
                id = team.Id,
                name = team.Name,
                icon = team.Icon,
                status = team.IsActive,
                updated_at = team.CreatedAt
            }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] UpdateTeamRequest request)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == id && t.ClientId == clientId && t.DeletedAt == null);
        if (team == null) return NotFound(new { error = new { code = "TEAM_NOT_FOUND", message = "Team not found." } });

        team.Name = request.Name;
        team.Icon = request.Icon;
        team.IsActive = request.IsActive;
        team.UpdatedAt = DateTime.UtcNow;

        _context.Teams.Update(team);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            status = "success",
            data = new
            {
                id = team.Id,
                name = team.Name,
                icon = team.Icon,
                status = team.IsActive,
                updated_at = team.UpdatedAt
            }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTeam(Guid id)
    {
        var clientId = await GetClientIdFromSession();
        if (clientId == null) return Unauthorized(new { error = new { code = "UNAUTHORIZED", message = "Invalid session." } });

        var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == id && t.ClientId == clientId && t.DeletedAt == null);
        if (team == null) return NotFound(new { error = new { code = "TEAM_NOT_FOUND", message = "Team not found." } });

        team.DeletedAt = DateTime.UtcNow;
        _context.Teams.Update(team);
        await _context.SaveChangesAsync();

        return Ok(new { status = "success" });
    }
}

public class CreateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public bool IsActive { get; set; }
}
