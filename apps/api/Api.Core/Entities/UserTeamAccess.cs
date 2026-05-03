using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Core.Entities;

public class UserTeamAccess
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [Required]
    public Guid TeamId { get; set; }

    [ForeignKey(nameof(TeamId))]
    public virtual Team? Team { get; set; }

    [Required]
    public Guid AccessProfileId { get; set; }

    [ForeignKey(nameof(AccessProfileId))]
    public virtual AccessProfile? AccessProfile { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
