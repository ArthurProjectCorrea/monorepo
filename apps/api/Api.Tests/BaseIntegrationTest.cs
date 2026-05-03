using Api.Core.Entities;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using Api.Core.Interfaces;
using Api.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using StackExchange.Redis;
using System.Text.Json;
using Microsoft.AspNetCore.TestHost;


namespace Api.Tests;

public abstract class BaseIntegrationTest : IDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly Mock<IConnectionMultiplexer> RedisMultiplexerMock;
    protected readonly Mock<IDatabase> RedisDbMock;
    protected readonly Mock<IEmailService> EmailServiceMock;


    protected BaseIntegrationTest()
    {
        RedisMultiplexerMock = new Mock<IConnectionMultiplexer>();
        RedisDbMock = new Mock<IDatabase>();
        EmailServiceMock = new Mock<IEmailService>();

        RedisMultiplexerMock.Setup(m => m.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(RedisDbMock.Object);


        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=127.0.0.1;Port=5432;Database=project_test_db;Username=postgres;Password=postgres;Include Error Detail=true");
                builder.UseSetting("SkipSeeding", "true");

                builder.ConfigureAppConfiguration((context, config) =>
                {
                    // Ensure it's also in the configuration
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["SkipSeeding"] = "true",
                        ["ConnectionStrings:DefaultConnection"] = "Host=127.0.0.1;Port=5432;Database=project_test_db;Username=postgres;Password=postgres;Include Error Detail=true"
                    });
                });


                builder.ConfigureTestServices(services =>
                {


                    // Replace Redis
                    services.RemoveAll<IConnectionMultiplexer>();
                    services.AddSingleton<IConnectionMultiplexer>(RedisMultiplexerMock.Object);

                    // Replace Email Service
                    services.RemoveAll<IEmailService>();
                    services.AddSingleton<IEmailService>(EmailServiceMock.Object);
                });
            });

        Client = Factory.CreateClient();

        // Prepare a fresh test database
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        db.Database.EnsureDeleted();
        db.Database.Migrate();
    }


    protected async Task<(string sessionId, User user)> AuthenticateAsync(string email = "admin@example.com", Guid? clientId = null)
    {
        using var scope = Factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var effectiveClientId = clientId ?? Guid.NewGuid();

        // Ensure Client exists
        var client = await context.Clients.FindAsync(effectiveClientId);
        if (client == null)
        {
            client = new Client
            {
                Id = effectiveClientId,
                Name = "Test Client",
                Domain = effectiveClientId.ToString(),
                IsActive = true
            };
            context.Clients.Add(client);
            await context.SaveChangesAsync();
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new User
            {
                UserName = email,
                Email = email,
                DisplayName = "Test User",
                ClientId = effectiveClientId,
                IsActive = true
            };
            var result = await userManager.CreateAsync(user, "Test@123456");
            if (!result.Succeeded)
            {
                throw new Exception($"Failed to create test user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }



        var sessionId = Guid.NewGuid().ToString();
        var sessionData = new
        {
            user_id = user.Id,
            email = user.Email,
            display_name = user.DisplayName,
            client_id = user.ClientId
        };

        RedisDbMock.Setup(db => db.StringGetAsync($"session:{sessionId}", It.IsAny<CommandFlags>()))
            .ReturnsAsync(JsonSerializer.Serialize(sessionData));

        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", sessionId);

        return (sessionId, user);
    }

    public void Dispose()
    {
        Client.Dispose();
        Factory.Dispose();
    }

}
