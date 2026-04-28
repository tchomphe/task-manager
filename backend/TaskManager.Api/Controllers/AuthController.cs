using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.DTOs.Auth;
using TaskManager.Api.Services;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>Register a new user account.</summary>
    /// <response code="201">Registration successful; returns JWT token and expiry.</response>
    /// <response code="400">Validation error — email already taken, weak password, or passwords don't match.</response>
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var response = await authService.RegisterAsync(request);
        return StatusCode(201, response);
    }

    /// <summary>Authenticate with email and password, receive a JWT token.</summary>
    /// <response code="200">Login successful; returns JWT token and expiry.</response>
    /// <response code="401">Invalid email or password.</response>
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        return Ok(response);
    }
}
