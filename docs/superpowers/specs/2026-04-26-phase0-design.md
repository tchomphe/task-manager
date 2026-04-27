# Phase 0 — Repository Scaffold Design

**Date:** 2026-04-26  
**Status:** Approved

---

## Goal

Establish the full directory skeleton, project files, and baseline configuration. No application logic. Every subsequent phase starts from a known, reproducible state.

---

## Architecture

Two top-level directories:

- `backend/` — ASP.NET Core 8 solution with API project and test project
- `frontend/` — Vite + React 18 + TypeScript app

No application logic anywhere in this phase. Entry points compile and start clean; all subdirectories exist but are empty (tracked via `.gitkeep`).

---

## Backend

### Projects

**`TaskManager.Api`** (`backend/TaskManager.Api/TaskManager.Api.csproj`)

NuGet references (pinned to spec versions):
- `Microsoft.EntityFrameworkCore.Sqlite` 8.x
- `Microsoft.EntityFrameworkCore.Tools` 8.x
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 8.x
- `Microsoft.AspNetCore.Authentication.JwtBearer` 8.x
- `FluentValidation.AspNetCore`
- `Swashbuckle.AspNetCore`

`Program.cs` — minimal stub only:
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.Run();
```

`appsettings.json` — placeholder keys:
```json
{
  "JwtSettings": {
    "Secret": "",
    "ExpiryMinutes": 60,
    "Issuer": "",
    "Audience": ""
  },
  "ConnectionStrings": {
    "DefaultConnection": ""
  }
}
```

`appsettings.Development.json` — dev values (not committed to prod):
```json
{
  "JwtSettings": {
    "Secret": "dev-secret-min-32-chars-long-placeholder",
    "Issuer": "TaskManagerApi",
    "Audience": "TaskManagerClient"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=taskmanager.db"
  }
}
```

Empty subdirectories (each with `.gitkeep`): `Controllers/`, `Services/`, `Repositories/`, `DTOs/`, `Models/`, `Data/`, `Middleware/`

---

**`TaskManager.Api.Tests`** (`backend/TaskManager.Api.Tests/TaskManager.Api.Tests.csproj`)

NuGet references:
- `xunit`
- `xunit.runner.visualstudio`
- `Moq`
- `Microsoft.EntityFrameworkCore.InMemory` 8.x
- `Microsoft.AspNetCore.Mvc.Testing` 8.x

Project reference to `TaskManager.Api`.

---

### Solution File

`backend/TaskManager.sln` — includes both projects.

---

## Frontend

Baseline wired manually (not via `npm create vite` defaults) to ensure exact dependency versions.

### `package.json` dependencies

**Runtime:**
- `react@^18`
- `react-dom@^18`
- `react-router-dom@^6`
- `@tanstack/react-query@^5`
- `axios`
- `react-hook-form`
- `zod`

**Dev:**
- `typescript`
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `@types/react`
- `@types/react-dom`
- `jsdom`

### `vite.config.ts`

- `/api` proxy → `http://localhost:5000`
- Vitest environment: `jsdom`
- Vitest setup file: `src/setupTests.ts`

### `tailwind.config.ts`

Content paths: `./index.html`, `./src/**/*.{ts,tsx}`

### `src/main.tsx`

Minimal shell — renders `<App />` into `#root`.

### `src/App.tsx`

Empty shell — returns a single `<div>` placeholder.

### `src/setupTests.ts`

Imports `@testing-library/jest-dom` for Vitest matchers.

### Empty subdirectories (each with `.gitkeep`)

`src/pages/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`

---

## Root Files

**`.gitignore`**
Covers: `*.db`, `*.db-shm`, `*.db-wal`, `bin/`, `obj/`, `node_modules/`, `.env*`

**`api.http`**
Placeholder comment only — populated in Phase 2.

**`README.md`**
Placeholder comment only — populated in Phase 7.

---

## Key Decision

`.csproj` files are written by hand (not via `dotnet new webapi`) so package versions are pinned exactly to what the spec requires and no scaffolding noise (weather forecasts controller, etc.) is introduced.

---

## Definition of Done

1. `dotnet build backend/TaskManager.sln` exits 0
2. `npm install` inside `frontend/` exits 0
3. `npm run dev` starts Vite without errors
4. No secrets or build artifacts present in git
