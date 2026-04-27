# Phase 2 — Auth Endpoints + Infrastructure

**Date:** 2026-04-27
**Status:** Approved

## Goal

Register and login endpoints, JWT issuance, Swagger UI, and global error handling. This is the foundation all feature endpoints depend on. No changes to the data layer.

---

## Architecture

Four layers added on top of the existing data layer:

1. **DTOs + Validators** — request/response shapes with FluentValidation rules
2. **AuthService** — business logic for register/login and JWT issuance
3. **AuthController** — thin HTTP surface for auth endpoints
4. **Infrastructure** — `GlobalExceptionHandler`, `NotFoundException`, and full `Program.cs` wiring

---

## DTOs & Validators

Location: `backend/TaskManager.Api/DTOs/Auth/`

| File | Shape |
|---|---|
| `RegisterRequest.cs` | `Email`, `Password`, `ConfirmPassword` |
| `LoginRequest.cs` | `Email`, `Password` |
| `AuthResponse.cs` | `Token (string)`, `ExpiresAt (DateTime UTC)` |
| `RegisterRequestValidator.cs` | Valid email format; password min 8 chars; `ConfirmPassword` must equal `Password` |
| `LoginRequestValidator.cs` | Both fields required; email format |

FluentValidation runs via **AutoValidation** (`AddFluentValidationAutoValidation()`). Validators execute before the action body — controllers never call `ValidateAsync`. A failed validator short-circuits to `400` with ProblemDetails before any service code runs.

---

## AuthService

Location: `backend/TaskManager.Api/Services/`

### Interface (`IAuthService`)

```csharp
Task<AuthResponse> RegisterAsync(RegisterRequest request);
Task<AuthResponse> LoginAsync(LoginRequest request);
```

### Implementation (`AuthService`)

**Register:**
- Calls `UserManager<AppUser>.CreateAsync`
- On identity failure (duplicate email, policy violation): maps `IdentityError` list to FluentValidation `ValidationException` with field-level errors → `GlobalExceptionHandler` returns `400` ProblemDetails

**Login:**
- Calls `SignInManager.CheckPasswordSignInAsync`
- On failure: throws `UnauthorizedAccessException` → `GlobalExceptionHandler` returns `401`

**JWT issuance (shared private method):**
- Claims: `sub = userId`, `email`, `jti = Guid.NewGuid()`
- Expiry: `JwtSettings:ExpiryMinutes` from config (default 60)
- Signing key: `JwtSettings:Secret` from config — never hardcoded
- Returns `AuthResponse` with `Token` and `ExpiresAt` (UTC)

---

## Controllers

Location: `backend/TaskManager.Api/Controllers/`

### `AuthController` — no `[Authorize]`

| Method | Route | Success | Body |
|---|---|---|---|
| `POST` | `/api/auth/register` | `201 Created` | `AuthResponse` |
| `POST` | `/api/auth/login` | `200 OK` | `AuthResponse` |

Each action body: extract request from `[FromBody]`, call service method, return result. No validation logic — AutoValidation handles it.

---

## Middleware

Location: `backend/TaskManager.Api/Middleware/`

### `NotFoundException`

```csharp
public class NotFoundException(string message) : Exception(message) { }
```

### `GlobalExceptionHandler` (implements `IExceptionHandler`)

| Exception | Status | Response shape |
|---|---|---|
| `ValidationException` (FluentValidation) | `400` | ProblemDetails: `{ title, status, errors: { "Field": ["message"] } }` |
| `UnauthorizedAccessException` | `401` | `{ error: "Invalid credentials" }` |
| `NotFoundException` | `404` | `{ error: <exception message> }` |
| All others | `500` | `{ error: "An unexpected error occurred", traceId }` |

---

## Program.cs Wiring

Services registered (in order):

1. `AddControllers()` + `AddFluentValidationAutoValidation()` + `AddValidatorsFromAssemblyContaining<Program>()`
2. JWT Bearer auth — reads `JwtSettings:Secret`, `JwtSettings:Issuer`, `JwtSettings:Audience` from config; validates lifetime and issuer signing key
3. Swashbuckle — `AddSwaggerGen()` with JWT `SecurityDefinition` ("Bearer") and global `SecurityRequirement` so the "Authorize" button appears
4. `AddExceptionHandler<GlobalExceptionHandler>()` + `AddProblemDetails()`

Middleware pipeline (in order):

```csharp
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI(c => c.RoutePrefix = "swagger");
app.MapControllers();
app.Run();
```

---

## api.http

```http
### Register
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

# @token = <paste token from login response>
```

---

## Definition of Done

- `POST /api/auth/register` valid body → `201` + token
- `POST /api/auth/register` duplicate email → `400` with field-level ProblemDetails errors
- `POST /api/auth/login` wrong password → `401`
- `GET /swagger` renders Swagger UI with both endpoints exercisable and "Authorize" button present
- Unhandled exceptions return structured JSON, not HTML stack traces
- `JwtSettings:Secret` read from config — never hardcoded
- `dotnet build` exits 0 with no warnings
