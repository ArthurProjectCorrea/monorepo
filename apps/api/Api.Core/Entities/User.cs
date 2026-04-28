using Microsoft.AspNetCore.Identity;

namespace Api.Core.Entities;

public class User : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;

    public Guid? ClientId { get; set; }

    public virtual Client? Client { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
