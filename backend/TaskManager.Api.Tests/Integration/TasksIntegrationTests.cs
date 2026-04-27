using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs.Tasks;
using Xunit;

namespace TaskManager.Api.Tests.Integration;

public class TasksIntegrationTests
{
    private const string TestJwtSecret = "dev-secret-at-least-32-chars-long-placeholder!";

    private static WebApplicationFactory<Program> CreateFactory(string dbName)
        => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["JwtSettings:Secret"] = TestJwtSecret,
                    ["JwtSettings:Issuer"] = "TaskManagerApi",
                    ["JwtSettings:Audience"] = "TaskManagerClient",
                    ["JwtSettings:ExpiryMinutes"] = "60"
                }));
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null) services.Remove(descriptor);
                services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase(dbName));

                // Re-configure JWT bearer to use the same test secret that AuthService will use.
                // Program.cs captures the JWT signing key at startup before test overrides apply,
                // so we must explicitly update the validation parameters here.
                services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtSecret)),
                        ValidateIssuer = true,
                        ValidIssuer = "TaskManagerApi",
                        ValidateAudience = true,
                        ValidAudience = "TaskManagerClient",
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                });
            });
        });

    private static async Task<string> RegisterAndGetToken(HttpClient client, string email, string password)
    {
        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password, confirmPassword = password });
        resp.EnsureSuccessStatusCode();
        var body = await resp.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("token").GetString()!;
    }

    [Fact]
    public async Task GetTasks_ReturnsOnlyCurrentUsersTasks()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var clientA = factory.CreateClient();
        var clientB = factory.CreateClient();

        var tokenA = await RegisterAndGetToken(clientA, "a@test.com", "Password123!");
        var tokenB = await RegisterAndGetToken(clientB, "b@test.com", "Password123!");

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        await clientA.PostAsJsonAsync("/api/tasks", new { title = "Task A1" });
        await clientA.PostAsJsonAsync("/api/tasks", new { title = "Task A2" });
        await clientB.PostAsJsonAsync("/api/tasks", new { title = "Task B1" });

        var resp = await clientA.GetFromJsonAsync<PagedResponse<TaskResponse>>("/api/tasks");

        Assert.NotNull(resp);
        Assert.Equal(2, resp.TotalCount);
        Assert.All(resp.Items, t => Assert.Contains("A", t.Title));
    }

    [Fact]
    public async Task GetTask_OtherUserTaskId_Returns404()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var clientA = factory.CreateClient();
        var clientB = factory.CreateClient();

        var tokenA = await RegisterAndGetToken(clientA, "a@test.com", "Password123!");
        var tokenB = await RegisterAndGetToken(clientB, "b@test.com", "Password123!");

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        var createResp = await clientB.PostAsJsonAsync("/api/tasks", new { title = "B's task" });
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var taskBId = created.GetProperty("id").GetString();

        var resp = await clientA.GetAsync($"/api/tasks/{taskBId}");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task CreateTask_ValidBody_Returns201()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.PostAsJsonAsync("/api/tasks", new
        {
            title = "My task",
            description = "Some description",
            status = "Todo",
            priority = "High"
        });

        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(body);
        Assert.Equal("My task", body.Title);
        Assert.NotNull(resp.Headers.Location);
    }

    [Fact]
    public async Task CreateTask_MissingTitle_Returns400()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.PostAsJsonAsync("/api/tasks", new { description = "no title" });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task CreateTask_NonExistentTagName_Returns400()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.PostAsJsonAsync("/api/tasks",
            new { title = "Test", tags = new[] { "nonexistent" } });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteTask_AsNonOwner_Returns404()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var clientA = factory.CreateClient();
        var clientB = factory.CreateClient();

        var tokenA = await RegisterAndGetToken(clientA, "a@test.com", "Password123!");
        var tokenB = await RegisterAndGetToken(clientB, "b@test.com", "Password123!");

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        var createResp = await clientA.PostAsJsonAsync("/api/tasks", new { title = "A's task" });
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var taskId = created.GetProperty("id").GetString();

        var resp = await clientB.DeleteAsync($"/api/tasks/{taskId}");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }
}
