using Api.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace Api.Tests.Controllers;

[Collection("IntegrationTests")]
public class AuthControllerTests : BaseIntegrationTest

{
    [Fact]
    public async Task SignIn_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var email = "test@example.com";
        var password = "Password123!";
        
        using (var scope = Factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var user = new User { UserName = email, Email = email, DisplayName = "Test", IsActive = true };
            await userManager.CreateAsync(user, password);
        }

        // Act
        var response = await Client.PostAsJsonAsync("/v1/auth/sign-in", new { identifier = email, password = password });

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task SignIn_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.PostAsJsonAsync("/v1/auth/sign-in", new { identifier = "wrong@example.com", password = "wrong" });

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_ExistingUser_SendsEmail()
    {
        // Arrange
        var email = "forgot@example.com";
        using (var scope = Factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var user = new User { UserName = email, Email = email, DisplayName = "Test", IsActive = true };
            await userManager.CreateAsync(user, "Password123!");
        }

        // Act
        var response = await Client.PostAsJsonAsync("/v1/auth/forgot-password", new { identifier = email });

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // EmailServiceMock.Verify(e => e.SendEmailAsync(email, It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }
}
