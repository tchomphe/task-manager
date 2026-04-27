using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs.Auth;
using Xunit;

namespace TaskManager.Api.Tests.Integration;

public class AuthIntegrationTests
{
    private static HttpClient CreateClient()
    {
        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, config) =>
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["JwtSettings:Secret"] = "test-only-secret-min-32-chars-long!!",
                        ["JwtSettings:Issuer"] = "TaskManagerApi",
                        ["JwtSettings:Audience"] = "TaskManagerClient",
                        ["JwtSettings:ExpiryMinutes"] = "60"
                    }));

                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                    if (descriptor is not null) services.Remove(descriptor);

                    services.AddDbContext<AppDbContext>(o =>
                        o.UseInMemoryDatabase(Guid.NewGuid().ToString()));
                });
            });

        return factory.CreateClient();
    }

    [Fact]
    public async Task Register_ValidBody_Returns201WithToken()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(body?.Token);
        Assert.True(body!.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns400()
    {
        var client = CreateClient();
        var request = new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        await client.PostAsJsonAsync("/api/auth/register", request);
        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var client = CreateClient();

        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = "logintest@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        });

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "logintest@example.com",
            Password = "WrongPassword!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        var client = CreateClient();

        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = "validlogin@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        });

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "validlogin@example.com",
            Password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(body?.Token);
    }
}
