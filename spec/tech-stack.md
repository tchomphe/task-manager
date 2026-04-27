# Tech Stack

## Repository Structure

Single monorepo (`task-manager`) containing both `backend/` and `frontend/` at the root. One clone, one README, one `.gitignore`. No separate repos or git submodules.

```
task-manager/
├── backend/
├── frontend/
├── README.md
└── .gitignore
```

---

## Backend

| Concern | Choice | Rationale |
|---|---|---|
| Framework | ASP.NET Core 8 Web API | Required by assignment; mature, performant, strong DI support |
| ORM | EF Core 8 + SQLite | Persistent (not in-memory), zero external server dependencies, migrations included for reproducibility |
| Validation | FluentValidation | Declarative rules; keeps controllers thin and validation testable in isolation |
| Auth | ASP.NET Core Identity + JWT Bearer | Standard library, no external services; `userId` claim enforces data ownership on every request |
| API Docs | Swashbuckle (Swagger UI) | Reviewers can explore and test the API at `/swagger` without any extra tooling |
| Error handling | Global `IExceptionHandler` middleware | Single source of truth for structured error responses; correct HTTP status codes everywhere |
| Unit testing | xUnit + Moq | Service logic tested in isolation by mocking `ITaskRepository` / `ITagRepository`; no DB involved |
| Integration testing | xUnit + EF Core InMemory | Full request pipeline exercised (controller → service → repository); run locally with `dotnet test --logger "console;verbosity=detailed"` |

### Backend Project Structure

```
backend/
└── TaskManager.Api/
    ├── Controllers/      # Thin — parse request, call service, return DTO
    ├── Services/         # Business logic; depends on repository interfaces, not EF directly
    ├── Repositories/     # ITaskRepository, ITagRepository + EF Core implementations
    ├── DTOs/             # Request and response shapes; never expose EF entities
    ├── Models/           # EF Core entity classes
    ├── Data/             # AppDbContext + EF migrations
    └── Middleware/       # Global exception handler
```

### Data Schema

#### Users
Managed by ASP.NET Core Identity. No custom columns beyond Identity defaults.

| Column | Type | Notes |
|---|---|---|
| Id | `string` (GUID) | PK, provided by Identity |
| Email | `string` | Unique, used as username |
| PasswordHash | `string` | Bcrypt via Identity |

#### Tasks

| Column | Type | Notes |
|---|---|---|
| Id | `Guid` | PK |
| Title | `string` | Required |
| Description | `string?` | Nullable |
| Status | `enum` | `Todo` \| `InProgress` \| `Done` |
| Priority | `enum` | `Low` \| `Medium` \| `High` |
| DueDate | `DateTime?` | UTC, nullable |
| CreatedAt | `DateTime` | UTC, set on insert |
| UpdatedAt | `DateTime` | UTC, updated on every save |
| UserId | `string` | FK → Users.Id |

#### Tags

| Column | Type | Notes |
|---|---|---|
| Id | `Guid` | PK |
| Name | `string` | Required |
| Color | `string?` | Hex color code (e.g. `#3B82F6`), nullable |
| UserId | `string` | FK → Users.Id — tags are user-scoped, never shared |

#### TaskTags (junction)

| Column | Type | Notes |
|---|---|---|
| TaskId | `Guid` | FK → Tasks.Id |
| TagId | `Guid` | FK → Tags.Id |

Composite PK on `(TaskId, TagId)`.

#### Relationships

```
Users ──< Tasks        (one user → many tasks)
Users ──< Tags         (one user → many tags)
Tasks >──< Tags        (many-to-many via TaskTags)
```

#### Key Data Rules

- **Ownership enforced at query level** — every `Tasks` and `Tags` query filters by `UserId` extracted from the JWT claim, never from the request body.
- **Tags are user-scoped** — a tag belongs to the user who created it; tags with the same name from different users are distinct rows.
- **Tags are pre-created** — tags must be created explicitly via `POST /api/tags` before being referenced on tasks. Task create/update accepts tag names by string; `TagRepository.GetManyByNamesAsync` resolves them and throws 400 if any name is not found for that user.
- **UTC everywhere** — `DueDate`, `CreatedAt`, and `UpdatedAt` are stored and returned as UTC ISO 8601. Clients handle timezone display.
- **Soft delete not in scope** — tasks and tags are hard-deleted. No `DeletedAt` column.

---

### Key Backend Decisions

- **Repository pattern** — `ITaskRepository` and `ITagRepository` interfaces sit between services and EF Core. Services depend on the interface, not the implementation — this makes unit tests clean (mock the interface with Moq) and keeps EF Core details out of business logic.
- **DTOs on every boundary** — `CreateTaskRequest`, `UpdateTaskRequest`, `TaskResponse` etc. ensure the API contract is explicit and decoupled from the data model.
- **UTC throughout** — All `DateTime` fields stored and returned as UTC ISO 8601. Clients handle local display.
- **Ownership enforcement** — Every task query includes `.Where(t => t.UserId == currentUserId)`. The `currentUserId` is extracted from the validated JWT claim, never from the request body.

---

## Frontend

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Vite + React 18 (SPA) | Lightweight, fast HMR, TypeScript-first; no SSR complexity for a pure SPA against a separate API |
| Routing | React Router v6 | Standard SPA routing; protected routes redirect unauthenticated users |
| Data fetching | TanStack Query v5 | Handles all server state: caching, background refetch, mutation invalidation, loading/error states |
| Client state | React Context + `useState` | Auth token and thin UI state only; no dedicated state library needed when server state lives in TanStack Query |
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

- **Functional components + hooks only** — No class components. All state and side effects handled with React hooks (`useState`, `useEffect`, `useContext`) and custom hooks.
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
