using Api.Core.Entities;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Api.Infrastructure.Data;

namespace Api.Tests.Controllers;

[Collection("IntegrationTests")]
public class UsersControllerTests : BaseIntegrationTest

{
    [Fact]
    public async Task GetUsers_WhenAuthenticated_ReturnsOk()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        await AuthenticateAsync("admin@example.com", clientId);

        // Act
        var response = await Client.GetAsync("/v1/users");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_WhenNotAuthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("/v1/users");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        await AuthenticateAsync("admin@example.com", clientId);

        var request = new
        {
            name = "New User",
            email = "newuser@example.com",
            isActive = true,
            teams = new List<object>()
        };

        // Act
        var response = await Client.PostAsJsonAsync("/v1/users", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_DuplicateTeams_ReturnsBadRequest()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        await AuthenticateAsync("admin@example.com", clientId);

        var teamId = Guid.NewGuid();
        var profileId = Guid.NewGuid();

        var request = new
        {
            name = "Duplicate Team User",
            email = "duplicate@example.com",
            isActive = true,
            teams = new List<object>
            {
                new { teamId = teamId, profileId = profileId },
                new { teamId = teamId, profileId = profileId }
            }
        };

        // Act
        var response = await Client.PostAsJsonAsync("/v1/users", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<dynamic>();
        // Assert.Contains("DUPLICATE_TEAMS", error?.ToString());
    }
}
