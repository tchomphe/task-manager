using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace TaskManager.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        switch (exception)
        {
            case ValidationException ve:
                httpContext.Response.StatusCode = 400;
                var errors = ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray());
                await httpContext.Response.WriteAsJsonAsync(
                    new { title = "Validation failed", status = 400, errors },
                    cancellationToken);
                break;

            case UnauthorizedAccessException:
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsJsonAsync(
                    new { error = "Invalid credentials" },
                    cancellationToken);
                break;

            case NotFoundException nfe:
                httpContext.Response.StatusCode = 404;
                await httpContext.Response.WriteAsJsonAsync(
                    new { error = nfe.Message },
                    cancellationToken);
                break;

            default:
                logger.LogError(exception, "Unhandled exception for {Method} {Path}",
                    httpContext.Request.Method, httpContext.Request.Path);
                httpContext.Response.StatusCode = 500;
                await httpContext.Response.WriteAsJsonAsync(
                    new { error = "An unexpected error occurred", traceId = httpContext.TraceIdentifier },
                    cancellationToken);
                break;
        }

        return true;
    }
}
