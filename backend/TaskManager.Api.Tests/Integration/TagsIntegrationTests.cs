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
using Microsoft.IdentityModel.Tokens;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs.Tags;
using Xunit;

namespace TaskManager.Api.Tests.Integration;

public class TagsIntegrationTests
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
    public async Task CreateTag_ValidBody_Returns201WithColor()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.PostAsJsonAsync("/api/tags",
            new { name = "work", color = "#6366F1" });

        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(body);
        Assert.Equal("work", body.Name);
        Assert.Equal("#6366F1", body.Color);
        Assert.NotNull(resp.Headers.Location);
    }

    [Fact]
    public async Task CreateTag_DuplicateName_Returns400()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await client.PostAsJsonAsync("/api/tags", new { name = "work" });
        var resp = await client.PostAsJsonAsync("/api/tags", new { name = "work" });

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task GetTags_ReturnsOnlyCurrentUsersTags()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var clientA = factory.CreateClient();
        var clientB = factory.CreateClient();

        var tokenA = await RegisterAndGetToken(clientA, "a@test.com", "Password123!");
        var tokenB = await RegisterAndGetToken(clientB, "b@test.com", "Password123!");

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        await clientA.PostAsJsonAsync("/api/tags", new { name = "tag-a" });
        await clientB.PostAsJsonAsync("/api/tags", new { name = "tag-b" });

        var resp = await clientA.GetFromJsonAsync<TagResponse[]>("/api/tags");

        Assert.NotNull(resp);
        Assert.Single(resp);
        Assert.Equal("tag-a", resp[0].Name);
    }

    [Fact]
    public async Task UpdateTag_ChangesNameAndColor_Returns200()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var created = await (await client.PostAsJsonAsync("/api/tags", new { name = "old" }))
            .Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(created);

        var resp = await client.PutAsJsonAsync($"/api/tags/{created.Id}",
            new { name = "new", color = "#3B82F6" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var updated = await resp.Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(updated);
        Assert.Equal("new", updated.Name);
        Assert.Equal("#3B82F6", updated.Color);
    }

    [Fact]
    public async Task UpdateTag_DuplicateName_Returns400()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await client.PostAsJsonAsync("/api/tags", new { name = "alpha" });
        var beta = await (await client.PostAsJsonAsync("/api/tags", new { name = "beta" }))
            .Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(beta);

        var resp = await client.PutAsJsonAsync($"/api/tags/{beta.Id}", new { name = "alpha" });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task UpdateTag_OtherUsersTag_Returns404()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var clientA = factory.CreateClient();
        var clientB = factory.CreateClient();

        var tokenA = await RegisterAndGetToken(clientA, "a@test.com", "Password123!");
        var tokenB = await RegisterAndGetToken(clientB, "b@test.com", "Password123!");

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        var tagA = await (await clientA.PostAsJsonAsync("/api/tags", new { name = "a-tag" }))
            .Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(tagA);

        var resp = await clientB.PutAsJsonAsync($"/api/tags/{tagA.Id}", new { name = "stolen" });
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteTag_ValidId_Returns204()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var tag = await (await client.PostAsJsonAsync("/api/tags", new { name = "deleteme" }))
            .Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(tag);

        var resp = await client.DeleteAsync($"/api/tags/{tag.Id}");
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteTag_OtherUsersTag_Returns404()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var clientA = factory.CreateClient();
        var clientB = factory.CreateClient();

        var tokenA = await RegisterAndGetToken(clientA, "a@test.com", "Password123!");
        var tokenB = await RegisterAndGetToken(clientB, "b@test.com", "Password123!");

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        var tagA = await (await clientA.PostAsJsonAsync("/api/tags", new { name = "a-tag" }))
            .Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(tagA);

        var resp = await clientB.DeleteAsync($"/api/tags/{tagA.Id}");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteTag_RemovesTagFromAssociatedTasks()
    {
        var dbName = Guid.NewGuid().ToString();
        using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();

        var token = await RegisterAndGetToken(client, "user@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var tag = await (await client.PostAsJsonAsync("/api/tags", new { name = "work" }))
            .Content.ReadFromJsonAsync<TagResponse>();
        Assert.NotNull(tag);

        var task = await (await client.PostAsJsonAsync("/api/tasks",
            new { title = "Task with tag", tags = new[] { "work" } }))
            .Content.ReadFromJsonAsync<JsonElement>();
        var taskId = task.GetProperty("id").GetString();

        await client.DeleteAsync($"/api/tags/{tag.Id}");

        var taskResp = await client.GetFromJsonAsync<JsonElement>($"/api/tasks/{taskId}");
        var tags = taskResp.GetProperty("tags").EnumerateArray().ToList();
        Assert.Empty(tags);
    }
}
