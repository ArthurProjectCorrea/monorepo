using Api.Core.Entities;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Api.Infrastructure.Data;

namespace Api.Tests.Controllers;

[Collection("IntegrationTests")]
public class TeamsControllerTests : BaseIntegrationTest

{
    [Fact]
    public async Task GetTeams_WhenAuthenticated_ReturnsOk()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        await AuthenticateAsync("admin@example.com", clientId);

        using (var scope = Factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Teams.Add(new Team { Name = "Test Team", ClientId = clientId, IsActive = true });
            await context.SaveChangesAsync();
        }

        // Act
        var response = await Client.GetAsync("/v1/teams");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateTeam_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        await AuthenticateAsync("admin@example.com", clientId);

        var request = new
        {
            name = "New Team",
            icon = "users",
            isActive = true
        };

        // Act
        var response = await Client.PostAsJsonAsync("/v1/teams", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
