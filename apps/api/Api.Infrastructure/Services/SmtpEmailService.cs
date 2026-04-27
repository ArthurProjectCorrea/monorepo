using Api.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Mail;

namespace Api.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var host = _configuration["SMTP_HOST"] ?? "localhost";
        var portStr = _configuration["SMTP_PORT"] ?? "1025";
        int.TryParse(portStr, out int port);
        
        _logger.LogInformation("Sending email to {To} via {Host}:{Port}", to, host, port);
        
        try
        {
            using var client = new SmtpClient(host, port > 0 ? port : 1025);
            var mailMessage = new MailMessage
            {
                From = new MailAddress(_configuration["SMTP_FROM"] ?? "no-reply@project.com"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            throw;
        }
    }
}
