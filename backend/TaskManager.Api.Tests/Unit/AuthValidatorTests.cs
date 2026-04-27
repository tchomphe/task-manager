using FluentValidation.TestHelper;
using TaskManager.Api.DTOs.Auth;
using Xunit;

namespace TaskManager.Api.Tests.Unit;

public class AuthValidatorTests
{
    private readonly RegisterRequestValidator _register = new();
    private readonly LoginRequestValidator _login = new();

    [Fact]
    public void Register_ValidInput_Passes()
    {
        var result = _register.TestValidate(new RegisterRequest
        {
            Email = "user@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Register_InvalidEmail_FailsOnEmail()
    {
        var result = _register.TestValidate(new RegisterRequest
        {
            Email = "not-an-email",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        });
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Register_PasswordTooShort_FailsOnPassword()
    {
        var result = _register.TestValidate(new RegisterRequest
        {
            Email = "user@example.com",
            Password = "short",
            ConfirmPassword = "short"
        });
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Register_PasswordMismatch_FailsOnConfirmPassword()
    {
        var result = _register.TestValidate(new RegisterRequest
        {
            Email = "user@example.com",
            Password = "Password123!",
            ConfirmPassword = "Different456!"
        });
        result.ShouldHaveValidationErrorFor(x => x.ConfirmPassword);
    }

    [Fact]
    public void Login_ValidInput_Passes()
    {
        var result = _login.TestValidate(new LoginRequest
        {
            Email = "user@example.com",
            Password = "Password123!"
        });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Login_EmptyEmail_FailsOnEmail()
    {
        var result = _login.TestValidate(new LoginRequest
        {
            Email = "",
            Password = "Password123!"
        });
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Login_EmptyPassword_FailsOnPassword()
    {
        var result = _login.TestValidate(new LoginRequest
        {
            Email = "user@example.com",
            Password = ""
        });
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
