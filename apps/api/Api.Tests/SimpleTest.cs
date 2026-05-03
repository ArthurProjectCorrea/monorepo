using Microsoft.AspNetCore.Mvc.Testing;

namespace Api.Tests;

public class SimpleTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SimpleTest(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AppStarts()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/v1/auth/sign-in");
        Assert.NotNull(response);
    }
}
