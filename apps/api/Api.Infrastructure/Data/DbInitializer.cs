using Api.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager, AppDbContext context)
    {
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        // Seed Default Client
        var defaultClient = context.Clients.FirstOrDefault(c => c.Domain == "main");
        if (defaultClient == null)
        {
            defaultClient = new Client
            {
                Name = "Main Client",
                Domain = "main",
                Description = "Default system client",
                IsActive = true
            };
            context.Clients.Add(defaultClient);
            await context.SaveChangesAsync();
        }

        // Seed Screens
        var generalScreen = context.Screens.FirstOrDefault(s => s.ScreenKey == "general");
        if (generalScreen == null)
        {
            generalScreen = new Screen
            {
                Title = "Configurações Gerais",
                Description = "Gerencie suas preferências e configurações gerais.",
                ScreenKey = "general",
                IsActive = true
            };
            context.Screens.Add(generalScreen);
            await context.SaveChangesAsync();
        }

        var defaultUser = await userManager.FindByEmailAsync("admin@project.com");
        if (defaultUser == null)
        {
            defaultUser = new User
            {
                UserName = "admin@project.com",
                Email = "admin@project.com",
                DisplayName = "Administrator",
                EmailConfirmed = true,
                ClientId = defaultClient.Id,
                IsActive = true
            };

            await userManager.CreateAsync(defaultUser, "Admin123!");
            await userManager.AddToRoleAsync(defaultUser, "Admin");
        }
        else if (defaultUser.ClientId == null)
        {
            defaultUser.ClientId = defaultClient.Id;
            await userManager.UpdateAsync(defaultUser);
        }
    }
}
