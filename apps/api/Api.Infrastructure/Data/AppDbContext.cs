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
    public DbSet<Team> Teams { get; set; }
    public DbSet<AccessProfile> AccessProfiles { get; set; }
    public DbSet<AccessProfilePermission> AccessProfilePermissions { get; set; }

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
            entity.HasIndex(s => new { s.ScreenKey, s.ClientId }).IsUnique();
        });

        builder.Entity<Team>(entity =>
        {
            entity.HasOne(t => t.Client)
                  .WithMany()
                  .HasForeignKey(t => t.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<AccessProfile>(entity =>
        {
            entity.HasOne(ap => ap.Client)
                  .WithMany()
                  .HasForeignKey(ap => ap.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasIndex(ap => new { ap.Name, ap.ClientId }).IsUnique();
        });

        builder.Entity<AccessProfilePermission>(entity =>
        {
            entity.HasOne(app => app.AccessProfile)
                  .WithMany(ap => ap.Permissions)
                  .HasForeignKey(app => app.AccessProfileId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(app => app.Screen)
                  .WithMany()
                  .HasForeignKey(app => app.ScreenId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(app => new { app.AccessProfileId, app.ScreenId, app.ActionId }).IsUnique();
        });
    }
}
