using Api.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<PasswordRecoveryRequest> PasswordRecoveryRequests { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<Screen> Screens { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.HasOne(u => u.Client)
                  .WithMany(c => c.Users)
                  .HasForeignKey(u => u.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Client>(entity =>
        {
            entity.HasIndex(c => c.Domain).IsUnique();
        });

        builder.Entity<Screen>(entity =>
        {
            entity.HasIndex(s => s.ScreenKey).IsUnique();
        });
    }
}
