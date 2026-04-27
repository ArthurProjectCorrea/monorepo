using Api.Core.Entities;
using Api.Core.Interfaces;
using Api.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Api.Web.Controllers;

public partial class AuthController
{
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Identifier);

        if (user != null)
        {
            var otp = new Random().Next(100000, 999999).ToString();

            var recoveryRequest = new PasswordRecoveryRequest
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Identifier = user.Email!,
                OtpHash = otp,
                OtpExpiresAt = DateTime.UtcNow.AddMinutes(15),
                Status = "PENDING"
            };

            _context.PasswordRecoveryRequests.Add(recoveryRequest);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email!,
                "Recuperação de Senha",
                $"<p>Seu código de recuperação é: <strong>{otp}</strong></p><p>Este código expira em 15 minutos.</p>");
        }

        return Ok(new { status = "accepted", expires_in = 900 });
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Identifier);
        if (user == null) return Ok(new { status = "resent", expires_in = 900 });

        var existingRequest = await _context.PasswordRecoveryRequests
            .Where(r => r.Identifier == request.Identifier && r.Status == "PENDING")
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (existingRequest != null && existingRequest.CreatedAt > DateTime.UtcNow.AddMinutes(-1))
        {
            return StatusCode(429, new { error = new { code = "TOO_MANY_REQUESTS", message = "Please wait before resending." } });
        }

        var otp = new Random().Next(100000, 999999).ToString();
        var recoveryRequest = new PasswordRecoveryRequest
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Identifier = user.Email!,
            OtpHash = otp,
            OtpExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Status = "PENDING"
        };

        _context.PasswordRecoveryRequests.Add(recoveryRequest);
        await _context.SaveChangesAsync();

        await _emailService.SendEmailAsync(
            user.Email!,
            "Novo Código de Recuperação",
            $"<p>Seu novo código é: <strong>{otp}</strong></p>");

        return Ok(new { status = "resent", expires_in = 900 });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyRecoveryOtpRequest request)
    {
        var recoveryRequest = await _context.PasswordRecoveryRequests
            .Where(r => r.Identifier == request.Identifier && r.Status == "PENDING")
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (recoveryRequest == null || recoveryRequest.OtpHash != request.OtpCode || recoveryRequest.OtpExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { error = new { code = "INVALID_OTP", message = "Código inválido ou expirado." } });
        }

        var resetToken = Guid.NewGuid().ToString();
        recoveryRequest.Status = "OTP_VERIFIED";
        recoveryRequest.ResetTokenHash = resetToken;
        recoveryRequest.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            status = "verified",
            reset_token = resetToken,
            reset_token_expires_in = 1800
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var recoveryRequest = await _context.PasswordRecoveryRequests
            .Where(r => r.Identifier == request.Identifier && r.ResetTokenHash == request.ResetToken && r.Status == "OTP_VERIFIED")
            .FirstOrDefaultAsync();

        if (recoveryRequest == null || recoveryRequest.ResetTokenExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { error = new { code = "INVALID_TOKEN", message = "Token inválido ou expirado." } });
        }

        var user = await _userManager.FindByIdAsync(recoveryRequest.UserId);
        if (user == null) return NotFound();

        var result = await _userManager.RemovePasswordAsync(user);
        if (result.Succeeded)
        {
            result = await _userManager.AddPasswordAsync(user, request.NewPassword);
        }

        if (result.Succeeded)
        {
            recoveryRequest.Status = "COMPLETED";
            recoveryRequest.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { status = "password_updated" });
        }

        return BadRequest(new { error = new { code = "RESET_FAILED", message = "Não foi possível atualizar a senha." } });
    }
}

public record ForgotPasswordRequest(
    [property: JsonPropertyName("identifier")] string Identifier
);

public record ResendOtpRequest(
    [property: JsonPropertyName("identifier")] string Identifier
);

public record VerifyRecoveryOtpRequest(
    [property: JsonPropertyName("identifier")] string Identifier,
    [property: JsonPropertyName("otp_code")] string OtpCode
);

public record ResetPasswordRequest(
    [property: JsonPropertyName("identifier")] string Identifier,
    [property: JsonPropertyName("reset_token")] string ResetToken,
    [property: JsonPropertyName("new_password")] string NewPassword
);
