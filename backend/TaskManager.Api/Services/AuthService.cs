using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using TaskManager.Api.DTOs.Auth;
using TaskManager.Api.Models;
using ValidationFailure = FluentValidation.Results.ValidationFailure;

namespace TaskManager.Api.Services;

public class AuthService(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager,
    IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var user = new AppUser { UserName = request.Email, Email = request.Email };
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var failures = result.Errors.Select(e => e.Code switch
            {
                "DuplicateEmail" or "DuplicateUserName" => new ValidationFailure("Email", e.Description),
                var code when code.StartsWith("Password") => new ValidationFailure("Password", e.Description),
                _ => new ValidationFailure(string.Empty, e.Description)
            });
            throw new ValidationException(failures);
        }

        return IssueToken(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            throw new UnauthorizedAccessException();

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
            throw new UnauthorizedAccessException();

        return IssueToken(user);
    }

    private AuthResponse IssueToken(AppUser user)
    {
        var secret = configuration["JwtSettings:Secret"];
        if (string.IsNullOrEmpty(secret))
            throw new InvalidOperationException("JwtSettings:Secret is not configured.");

        var issuer = configuration["JwtSettings:Issuer"] ?? "TaskManagerApi";
        var audience = configuration["JwtSettings:Audience"] ?? "TaskManagerClient";
        var expiryMinutes = int.TryParse(configuration["JwtSettings:ExpiryMinutes"], out var mins) ? mins : 60;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt
        };
    }
}
