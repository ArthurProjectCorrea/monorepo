namespace Api.Core.Entities;

public class PasswordRecoveryRequest
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string Status { get; set; } = "PENDING"; // PENDING, OTP_VERIFIED, COMPLETED
    public string? OtpHash { get; set; }
    public DateTime? OtpExpiresAt { get; set; }
    public string? ResetTokenHash { get; set; }
    public DateTime? ResetTokenExpiresAt { get; set; }
    public int OtpAttemptCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
