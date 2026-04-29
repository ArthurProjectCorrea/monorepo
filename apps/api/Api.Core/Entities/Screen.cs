using System.ComponentModel.DataAnnotations;

namespace Api.Core.Entities;

public class Screen
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    [MaxLength(50)]
    public string ScreenKey { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [Required]
    public Guid ClientId { get; set; }

    public Client? Client { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
