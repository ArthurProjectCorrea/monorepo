using Api.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Web.Controllers;

[ApiController]
[Route("v1/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
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
            return Ok(new
            {
                status = "authenticated",
                session = new
                {
                    session_id = Guid.NewGuid().ToString(), // Simplified for now
                    expires_in = 3600
                },
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    display_name = user.DisplayName,
                    roles = roles
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
    public async Task<IActionResult> GetSession()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null) return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            status = "active",
            user = new
            {
                id = user.Id,
                email = user.Email,
                display_name = user.DisplayName,
                roles = roles
            }
        });
    }

    [HttpPost("sign-out")]
    public new async Task<IActionResult> SignOut()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { status = "signed_out" });
    }
}

public record SignInRequest(string Identifier, string Password, bool RememberMe = false);
