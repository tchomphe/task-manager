# Task Manager

A full-stack task management app built as a production-quality MVP.

**Backend:** ASP.NET Core 8 · EF Core 8 + SQLite · ASP.NET Identity + JWT · FluentValidation · Swashbuckle  
**Frontend:** React 18 · TypeScript · TanStack Query v5 · React Router v6 · Tailwind CSS · React Hook Form + Zod

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [Node.js 20+](https://nodejs.org/) and npm
- [`dotnet-ef` CLI tool](https://learn.microsoft.com/en-us/ef/core/cli/dotnet):
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## Quick Start

Clone → database → backend → frontend. Target: working app in under 5 minutes.

```bash
# 1. Clone
git clone <repo-url>
cd task-manager

# 2. Apply database migrations (creates taskmanager.db)
cd backend/TaskManager.Api
dotnet ef database update

# 3. Start the API (http://localhost:5000)
dotnet run

# 4. In a new terminal, install frontend deps and start Vite (http://localhost:5173)
cd ../../frontend
npm install
npm run dev
```

Open **http://localhost:5173**, register an account, and start managing tasks.

> **Note:** The frontend proxies `/api` requests to `http://localhost:5000` via Vite's dev server — no CORS configuration needed.

---

## Running Tests

### Backend tests

All tests (unit + integration):
```bash
cd backend
dotnet test
```

Unit tests only (no HTTP, no DB — fast):
```bash
dotnet test --filter "FullyQualifiedName~Unit"
```

Integration tests only (spins up WebApplicationFactory + EF InMemory):
```bash
dotnet test --filter "FullyQualifiedName~Integration"
```

Run a specific test class:
```bash
dotnet test --filter "FullyQualifiedName~TasksIntegrationTests"
```

Expected output: **32 tests, 0 failures**

### Frontend tests

All tests (single run, CI mode):
```bash
cd frontend
npx vitest run
```

Watch mode (re-runs on file save):
```bash
npm test
```

Run a specific test file:
```bash
npx vitest run src/components/__tests__/TaskCard.test.tsx
```

Expected output: **74 tests, 0 failures**

### TypeScript type check (no emit)
```bash
cd frontend
npx tsc --noEmit
```

---

## Environment Variables

All configuration lives in `backend/TaskManager.Api/appsettings.Development.json`. No `.env` files.

| Key | Default (dev) | Notes |
|-----|---------------|-------|
| `JwtSettings:Secret` | `dev-secret-at-least-32-chars-long-placeholder!` | Must be ≥32 chars. Rotate for any non-local deployment. |
| `JwtSettings:ExpiryMinutes` | `60` | Token lifetime in minutes. |
| `JwtSettings:Issuer` | `TaskManagerApi` | Must match on issue and validate. |
| `JwtSettings:Audience` | `TaskManagerClient` | Must match on issue and validate. |
| `ConnectionStrings:DefaultConnection` | `Data Source=taskmanager.db` | SQLite file path, relative to the project directory. |

> The dev secret is committed intentionally for local-only use. Never use it in a deployed environment.

---

## API Reference

Interactive docs: **http://localhost:5000/swagger**

Click **Authorize**, paste your JWT token (from `/api/auth/login` or `/api/auth/register`), then exercise any endpoint.

For scripted testing, see [`api.http`](./api.http) — compatible with VS Code REST Client and JetBrains HTTP Client.

### Endpoint summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register; returns JWT |
| POST | `/api/auth/login` | — | Login; returns JWT |
| GET | `/api/tasks` | ✓ | List tasks (search, filter, paginate) |
| POST | `/api/tasks` | ✓ | Create task |
| GET | `/api/tasks/{id}` | ✓ | Get task by ID |
| PUT | `/api/tasks/{id}` | ✓ | Update task (all fields optional) |
| DELETE | `/api/tasks/{id}` | ✓ | Delete task |
| GET | `/api/tags` | ✓ | List tags for current user |
| POST | `/api/tags` | ✓ | Create tag |
| PUT | `/api/tags/{id}` | ✓ | Update tag name/color |
| DELETE | `/api/tags/{id}` | ✓ | Delete tag (cascades off tasks) |

---

## Architecture Notes

### Why the repository pattern?
Services depend on `ITaskRepository` and `ITagRepository` interfaces, not EF Core directly. This makes unit tests straightforward — Moq can stub repository calls without spinning up a database. The integration tests use `WebApplicationFactory` with `UseInMemoryDatabase` for the real HTTP pipeline.

### Why SQLite?
Zero-setup, file-based, and sufficient for a single-user local app. EF Core's value converters ensure all `DateTime` columns are stored and read back as UTC, so there are no timezone surprises regardless of the host OS.

### Tag design
Tags are user-scoped and must be created explicitly before being referenced on tasks. Task create/update accepts `string[]` tag names; the backend resolves them to entities — unknown names return 400. This keeps the API explicit and prevents accidental tag creation through task updates.

Updating a task's tags always **replaces** them wholesale:
- Omit `tags` → tags unchanged
- `"tags": []` → all tags removed
- `"tags": ["x", "y"]` → exactly those two tags

### AuthContext over scattered localStorage
A single React context owns the token. The Axios interceptor reads from it, and the 401 handler clears it and redirects — one place, no duplication.

---

## Assumptions and Trade-offs

- **JWT in localStorage** — simple for a local MVP. For a deployed app, `HttpOnly` cookies with CSRF protection would be the right call.
- **No refresh tokens** — the token expires after 60 minutes. The user must log in again. Acceptable for a local tool.
- **Tags replaced on update, not merged** — explicit and predictable. A merge strategy requires the client to send the full desired set anyway, so this doesn't add client-side complexity.
- **EF InMemory for tests only** — InMemory doesn't enforce relational constraints, but it's fast and sufficient for testing service-layer behaviour. SQLite integration tests would add coverage for DB-specific rules at the cost of test setup complexity.
- **No CORS** — the Vite dev server proxies `/api` to `localhost:5000`, so the browser never makes a cross-origin request. A deployed version would need a CORS policy.

---

## Known Limitations / Out of Scope

- No refresh token — re-login required after 60 minutes
- No email verification
- No password reset flow
- No multi-user collaboration (all data is strictly user-scoped)
- No file attachments
- No real-time updates (polling or WebSockets)
- SQLite is not suitable for concurrent multi-user production deployments
