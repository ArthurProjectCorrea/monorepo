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
        var generalScreen = context.Screens.FirstOrDefault(s => s.ScreenKey == "general" && s.ClientId == defaultClient.Id);
        if (generalScreen == null)
        {
            generalScreen = new Screen
            {
                Title = "Informações Gerais",
                Description = "Configurações básicas do sistema.",
                ScreenKey = "general",
                ClientId = defaultClient.Id,
                IsActive = true
            };
            context.Screens.Add(generalScreen);
            await context.SaveChangesAsync();
        }

        var screenParameters = context.Screens.FirstOrDefault(s => s.ScreenKey == "screen_parameters" && s.ClientId == defaultClient.Id);
        if (screenParameters == null)
        {
            screenParameters = new Screen
            {
                Title = "Parâmetros de Tela",
                Description = "Gerencie as telas, títulos e descrições do sistema.",
                ScreenKey = "screen_parameters",
                ClientId = defaultClient.Id,
                IsActive = true
            };
            context.Screens.Add(screenParameters);
            await context.SaveChangesAsync();
        }

        var teamsScreen = context.Screens.FirstOrDefault(s => s.ScreenKey == "teams" && s.ClientId == defaultClient.Id);
        if (teamsScreen == null)
        {
            teamsScreen = new Screen
            {
                Title = "Cadastro de Equipes",
                Description = "Gerencie os times, usuários e permissões do sistema.",
                ScreenKey = "teams",
                ClientId = defaultClient.Id,
                IsActive = true
            };
            context.Screens.Add(teamsScreen);
            await context.SaveChangesAsync();
        }

        var accessProfilesScreen = context.Screens.FirstOrDefault(s => s.ScreenKey == "access_profiles" && s.ClientId == defaultClient.Id);
        if (accessProfilesScreen == null)
        {
            accessProfilesScreen = new Screen
            {
                Title = "Perfil de Acesso",
                Description = "Gerencie as permissões e perfis de acesso do sistema.",
                ScreenKey = "access_profiles",
                ClientId = defaultClient.Id,
                IsActive = true
            };
            context.Screens.Add(accessProfilesScreen);
            await context.SaveChangesAsync();
        }

        // Seed Default Access Profile (Admin)
        var adminProfile = context.AccessProfiles.FirstOrDefault(ap => ap.Name == "Administrador" && ap.ClientId == defaultClient.Id);
        if (adminProfile == null)
        {
            adminProfile = new AccessProfile
            {
                Name = "Administrador",
                Description = "Perfil com acesso total ao sistema.",
                IsActive = true,
                ClientId = defaultClient.Id
            };
            context.AccessProfiles.Add(adminProfile);
            await context.SaveChangesAsync();

            // Seed Permissions for Admin
            var allScreens = context.Screens.Where(s => s.ClientId == defaultClient.Id).ToList();
            var screenPermissions = new Dictionary<string, string[]>
            {
                { "general", new[] { "view", "update" } },
                { "screen_parameters", new[] { "view", "update" } },
                { "teams", new[] { "view", "create", "update", "delete" } },
                { "access_profiles", new[] { "view", "create", "update", "delete" } }
            };

            foreach (var screen in allScreens)
            {
                if (screenPermissions.TryGetValue(screen.ScreenKey, out var allowedActions))
                {
                    foreach (var action in allowedActions)
                    {
                        context.AccessProfilePermissions.Add(new AccessProfilePermission
                        {
                            AccessProfileId = adminProfile.Id,
                            ScreenId = screen.Id,
                            ActionId = action
                        });
                    }
                }
            }
            await context.SaveChangesAsync();
        }

        // Seed Default Team
        if (!context.Teams.Any(t => t.ClientId == defaultClient.Id))
        {
            context.Teams.Add(new Team
            {
                Name = "Administração",
                Icon = "shield-cog",
                IsActive = true,
                ClientId = defaultClient.Id
            });
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
