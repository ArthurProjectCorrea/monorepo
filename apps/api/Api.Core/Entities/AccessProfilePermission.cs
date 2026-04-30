using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Core.Entities;

public class AccessProfilePermission
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AccessProfileId { get; set; }

    [ForeignKey("AccessProfileId")]
    public AccessProfile? AccessProfile { get; set; }

    [Required]
    public Guid ScreenId { get; set; }

    [ForeignKey("ScreenId")]
    public Screen? Screen { get; set; }

    [Required]
    [MaxLength(50)]
    public string ActionId { get; set; } = string.Empty; // view, create, update, delete

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
