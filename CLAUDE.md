# CLAUDE.md

## Project Overview

Task Manager is a production-quality full-stack take-home assessment app. Treat it as a small, shippable MVP — not a toy. Every decision should reflect clean fundamentals: strict data isolation, explicit API contracts, and polished UI states.

See `spec/mission.md` for goals and MVP scope. See `spec/tech-stack.md` for stack choices and rationale.

---

## Tech Stack

**Backend:** ASP.NET Core 8 Web API · EF Core 8 + SQLite · FluentValidation · ASP.NET Identity + JWT · Swashbuckle
**Frontend:** Vite + React 18 + TypeScript · TanStack Query v5 · React Router v6 · Tailwind CSS · Axios · React Hook Form + Zod
**Testing:** xUnit (backend) · Vitest + React Testing Library (frontend)

---

## Hard Rules

These are non-negotiable regardless of what seems convenient:

- **Never expose EF entities in API responses.** All responses use DTOs (`TaskResponse`, etc.).
- **Never trust `userId` from the request body.** Always extract it from the validated JWT claim.
- **Every task query must scope to the current user.** `.Where(t => t.UserId == currentUserId)` on every query — no exceptions.
- **All datetimes are UTC.** Store and return UTC ISO 8601. Clients handle display.
- **No secrets committed.** `.env*`, `*.db`, `bin/`, `obj/`, `node_modules/` are gitignored.

---

## Architecture Conventions

### Backend
- **Controllers are thin.** Parse request → call service → return DTO. No business logic in controllers.
- **Services own all business logic.** One service per domain area (e.g. `TaskService`, `AuthService`).
- **Repository interfaces per domain area** (`ITaskRepository`, `ITagRepository`). Services depend on interfaces, not EF Core directly. No separate class libraries.
- **Global `IExceptionHandler` middleware** handles all unhandled exceptions. Do not scatter try/catch for error formatting.
- **FluentValidation** for all input validation. Validators live alongside their request DTOs.
- **XML doc comments on all controller actions.** Every public action must have `/// <summary>`, `/// <response code="NNN">` tags, and `[ProducesResponseType]` attributes. These power the Swagger UI.

### Frontend
- **Hooks own all data logic.** Page components call hooks; they never call Axios directly.
- **Types in `src/types/` mirror backend DTOs 1:1.** If a backend field changes, TypeScript must surface the mismatch.
- **Every list and form renders three states explicitly:** loading skeleton, empty state, error message. No silent failures.
- **Axios instance in `src/lib/`** attaches JWT on every request and handles 401 redirects in one place.
- **Toast feedback on all mutations.** Use `useToast()` from `components/Toast.tsx` in every mutation hook — `onSuccess` and `onError` callbacks show user-facing feedback. Never leave a mutation silent.

---

## Project Structure

```
task-manager/
├── backend/
│   └── TaskManager.Api/
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       ├── DTOs/
│       ├── Models/
│       ├── Data/         # AppDbContext + EF migrations
│       └── Middleware/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── spec/
│   ├── mission.md
│   └── tech-stack.md
└── api.http              # Manual API testing alongside Swagger
```

---

## Conventions

### Commit messages
Conventional commits: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore` with optional scope — e.g. `feat(ui):`, `docs(api):`, `test(hooks):`.

### Branch strategy
Feature branches per phase (`feature/phase-N`), isolated via git worktrees (`.worktrees/`), merged to `main` as fast-forward. No long-lived branches.

### Test coverage expectations
- **Backend unit tests:** cover service logic via Moq-stubbed repositories. Happy path + key error cases (not found, unauthorized, validation).
- **Backend integration tests:** cover HTTP endpoints via `WebApplicationFactory` + EF InMemory. One test class per controller.
- **Frontend tests:** component tests with React Testing Library, hook tests with `renderHook`. All three render states (loading, empty, error) must be covered for any list or form component.

### Environment variables
All config lives in `backend/TaskManager.Api/appsettings.Development.json`. Keys: `JwtSettings:Secret` (≥32 chars), `JwtSettings:ExpiryMinutes`, `JwtSettings:Issuer`, `JwtSettings:Audience`, `ConnectionStrings:DefaultConnection`.

### Migration workflow
1. Make model change in `Models/`
2. `cd backend/TaskManager.Api && dotnet ef migrations add <DescriptiveName>`
3. Review the generated file in `Data/Migrations/`
4. `dotnet ef database update` to apply
