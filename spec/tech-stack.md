# Tech Stack

## Backend

| Concern | Choice | Rationale |
|---|---|---|
| Framework | ASP.NET Core 8 Web API | Required by assignment; mature, performant, strong DI support |
| ORM | EF Core 8 + SQLite | Persistent (not in-memory), zero external server dependencies, migrations included for reproducibility |
| Validation | FluentValidation | Declarative rules; keeps controllers thin and validation testable in isolation |
| Auth | ASP.NET Core Identity + JWT Bearer | Standard library, no external services; `userId` claim enforces data ownership on every request |
| API Docs | Swashbuckle (Swagger UI) | Reviewers can explore and test the API at `/swagger` without any extra tooling |
| Error handling | Global `IExceptionHandler` middleware | Single source of truth for structured error responses; correct HTTP status codes everywhere |
| Testing | xUnit + EF Core InMemory (test only) | Integration tests exercise the real service layer; InMemory DB kept to tests only, not production |

### Backend Project Structure

```
backend/
└── TaskManager.Api/
    ├── Controllers/      # Thin — parse request, call service, return DTO
    ├── Services/         # All business logic; one service per domain area
    ├── DTOs/             # Request and response shapes; never expose EF entities
    ├── Models/           # EF Core entity classes
    ├── Data/             # AppDbContext + EF migrations
    └── Middleware/       # Global exception handler
```

### Key Backend Decisions

- **Single project** — No separate class libraries or repository pattern. The problem size does not justify the overhead; service classes provide sufficient separation.
- **DTOs on every boundary** — `CreateTaskRequest`, `UpdateTaskRequest`, `TaskResponse` etc. ensure the API contract is explicit and decoupled from the data model.
- **UTC throughout** — All `DateTime` fields stored and returned as UTC ISO 8601. Clients handle local display.
- **Ownership enforcement** — Every task query includes `.Where(t => t.UserId == currentUserId)`. The `currentUserId` is extracted from the validated JWT claim, never from the request body.

---

## Frontend

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Vite + React 18 (SPA) | Lightweight, fast HMR, TypeScript-first; no SSR complexity for a pure SPA against a separate API |
| Routing | React Router v6 | Standard SPA routing; protected routes redirect unauthenticated users |
| Data fetching | TanStack Query v5 | Built-in caching, background refetch, mutation invalidation, and loading/error states |
| Styling | Tailwind CSS | Utility-first; fast to iterate without a design system dependency |
| HTTP client | Axios with interceptors | Attaches JWT on every request and redirects to `/login` on 401 in one place |
| Forms & validation | React Hook Form + Zod | Zod schemas mirror backend validation rules; client-side errors before any network call |
| Testing | Vitest + React Testing Library | ESM-native, integrates natively with Vite; tests components the way users interact with them |

### Frontend Project Structure

```
frontend/
├── src/
│   ├── pages/          # Route-level components (TaskListPage, TaskDetailPage, LoginPage, etc.)
│   ├── components/     # Presentational, reusable UI pieces
│   ├── hooks/          # TanStack Query hooks (useTasks, useCreateTask, etc.) — data logic lives here
│   ├── lib/            # Axios client instance, Zod schemas, auth token helpers
│   └── types/          # TypeScript interfaces matching backend DTO shapes 1:1
├── vite.config.ts
└── index.html
```

### Key Frontend Decisions

- **Hooks own data logic** — Page components call hooks; they never call Axios directly. This separates concerns and makes components straightforward to test.
- **Types mirror DTOs** — `TaskResponse`, `CreateTaskRequest`, etc. in `src/types/` are kept in sync with the backend contract. If the backend changes a field, TypeScript surfaces the mismatch immediately.
- **All three data states explicit** — Every list and form renders distinct UI for loading, empty, and error conditions. No silent failures.
- **Token storage** — JWT stored in `localStorage` (acceptable for an MVP assessment context). A production hardening note is included in `README.md`.

---

## Tooling

| Tool | Purpose |
|---|---|
| `dotnet CLI` | Build, run migrations, start backend dev server |
| `npm` | Install frontend dependencies, run Vite dev server and tests |
| `.gitignore` | Excludes `*.db`, `bin/`, `obj/`, `node_modules/`, `.env*` — no secrets committed |
| `.http` collection | `api.http` file at repo root for quick manual API testing alongside Swagger |
