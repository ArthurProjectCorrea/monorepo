using Api.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        var defaultUser = await userManager.FindByEmailAsync("admin@project.com");
        if (defaultUser == null)
        {
            defaultUser = new User
            {
                UserName = "admin@project.com",
                Email = "admin@project.com",
                DisplayName = "Administrator",
                EmailConfirmed = true
            };

            await userManager.CreateAsync(defaultUser, "Admin123!");
            await userManager.AddToRoleAsync(defaultUser, "Admin");
        }
    }
}
