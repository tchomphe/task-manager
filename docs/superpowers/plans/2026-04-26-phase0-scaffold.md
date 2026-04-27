# Phase 0 — Repository Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the full directory skeleton, project files, and baseline configuration so every subsequent phase starts from a known, reproducible state.

**Architecture:** Two top-level directories — `backend/` holds an ASP.NET Core 8 solution with an API project and a test project; `frontend/` holds a Vite + React 18 + TypeScript app. No application logic in this phase — only the files required to make `dotnet build` and `npm run dev` pass.

**Tech Stack:** ASP.NET Core 8, EF Core 8, xUnit, Vite 5, React 18, TypeScript 5, TanStack Query v5, Tailwind CSS 3, Vitest

---

## File Map

```
.gitignore
api.http
README.md

backend/
  TaskManager.sln
  TaskManager.Api/
    TaskManager.Api.csproj
    Program.cs
    appsettings.json
    appsettings.Development.json
    Controllers/.gitkeep
    Services/.gitkeep
    Repositories/.gitkeep
    DTOs/.gitkeep
    Models/.gitkeep
    Data/.gitkeep
    Middleware/.gitkeep
  TaskManager.Api.Tests/
    TaskManager.Api.Tests.csproj

frontend/
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  src/
    index.css
    main.tsx
    App.tsx
    setupTests.ts
    pages/.gitkeep
    components/.gitkeep
    hooks/.gitkeep
    lib/.gitkeep
    types/.gitkeep
```

---

## Task 1: Root config files

**Files:**
- Create: `.gitignore`
- Create: `api.http`
- Create: `README.md`

- [ ] **Step 1: Create `.gitignore`**

File: `.gitignore`
```
# Build outputs
bin/
obj/

# Database files
*.db
*.db-shm
*.db-wal

# Node
node_modules/

# Environment
.env
.env.*

# IDE
.vscode/
.idea/
*.user
*.suo

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 2: Create `api.http` placeholder**

File: `api.http`
```http
# API requests — populated in Phase 2
```

- [ ] **Step 3: Create `README.md` placeholder**

File: `README.md`
```markdown
# Task Manager

> README populated in Phase 7.
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore api.http README.md
git commit -m "chore(scaffold): add root config files"
```

---

## Task 2: Backend API project files

**Files:**
- Create: `backend/TaskManager.Api/TaskManager.Api.csproj`
- Create: `backend/TaskManager.Api/Program.cs`
- Create: `backend/TaskManager.Api/appsettings.json`
- Create: `backend/TaskManager.Api/appsettings.Development.json`
- Create: `backend/TaskManager.Api/Controllers/.gitkeep`
- Create: `backend/TaskManager.Api/Services/.gitkeep`
- Create: `backend/TaskManager.Api/Repositories/.gitkeep`
- Create: `backend/TaskManager.Api/DTOs/.gitkeep`
- Create: `backend/TaskManager.Api/Models/.gitkeep`
- Create: `backend/TaskManager.Api/Data/.gitkeep`
- Create: `backend/TaskManager.Api/Middleware/.gitkeep`

- [ ] **Step 1: Create the API project directory structure**

```bash
mkdir -p backend/TaskManager.Api/{Controllers,Services,Repositories,DTOs,Models,Data,Middleware}
```

- [ ] **Step 2: Create `TaskManager.Api.csproj`**

File: `backend/TaskManager.Api/TaskManager.Api.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>TaskManager.Api</RootNamespace>
    <AssemblyName>TaskManager.Api</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>

</Project>
```

- [ ] **Step 3: Create `Program.cs`**

File: `backend/TaskManager.Api/Program.cs`
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.Run();
```

- [ ] **Step 4: Create `appsettings.json`**

File: `backend/TaskManager.Api/appsettings.json`
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "JwtSettings": {
    "Secret": "",
    "ExpiryMinutes": 60,
    "Issuer": "",
    "Audience": ""
  },
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "AllowedHosts": "*"
}
```

- [ ] **Step 5: Create `appsettings.Development.json`**

File: `backend/TaskManager.Api/appsettings.Development.json`
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "JwtSettings": {
    "Secret": "dev-secret-at-least-32-chars-long-placeholder!",
    "ExpiryMinutes": 60,
    "Issuer": "TaskManagerApi",
    "Audience": "TaskManagerClient"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=taskmanager.db"
  }
}
```

- [ ] **Step 6: Add `.gitkeep` to each empty subdirectory**

```bash
touch backend/TaskManager.Api/Controllers/.gitkeep
touch backend/TaskManager.Api/Services/.gitkeep
touch backend/TaskManager.Api/Repositories/.gitkeep
touch backend/TaskManager.Api/DTOs/.gitkeep
touch backend/TaskManager.Api/Models/.gitkeep
touch backend/TaskManager.Api/Data/.gitkeep
touch backend/TaskManager.Api/Middleware/.gitkeep
```

- [ ] **Step 7: Commit**

```bash
git add backend/TaskManager.Api/
git commit -m "chore(scaffold): add backend API project files"
```

---

## Task 3: Backend test project

**Files:**
- Create: `backend/TaskManager.Api.Tests/TaskManager.Api.Tests.csproj`

- [ ] **Step 1: Create the test project directory**

```bash
mkdir -p backend/TaskManager.Api.Tests
```

- [ ] **Step 2: Create `TaskManager.Api.Tests.csproj`**

File: `backend/TaskManager.Api.Tests/TaskManager.Api.Tests.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
    <RootNamespace>TaskManager.Api.Tests</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
    <PackageReference Include="xunit" Version="2.7.0" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.7">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Moq" Version="4.20.70" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\TaskManager.Api\TaskManager.Api.csproj" />
  </ItemGroup>

</Project>
```

- [ ] **Step 3: Commit**

```bash
git add backend/TaskManager.Api.Tests/
git commit -m "chore(scaffold): add backend test project"
```

---

## Task 4: Create solution file and verify dotnet build

**Files:**
- Create: `backend/TaskManager.sln` (via dotnet CLI)

- [ ] **Step 1: Create the solution file**

```bash
cd backend && dotnet new sln -n TaskManager
```

Expected: `The template "Solution File" was created successfully.`

- [ ] **Step 2: Add projects to the solution**

```bash
dotnet sln TaskManager.sln add TaskManager.Api/TaskManager.Api.csproj
dotnet sln TaskManager.sln add TaskManager.Api.Tests/TaskManager.Api.Tests.csproj
cd ..
```

Expected output for each add: `Project ... added to the solution.`

- [ ] **Step 3: Verify the build passes**

```bash
dotnet build backend/TaskManager.sln
```

Expected: `Build succeeded.` with 0 errors and 0 warnings.

If NuGet restore fails due to network issues, run `dotnet restore backend/TaskManager.sln` first.

- [ ] **Step 4: Commit**

```bash
git add backend/TaskManager.sln
git commit -m "chore(scaffold): create solution file and verify dotnet build"
```

---

## Task 5: Frontend project config files

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`

- [ ] **Step 1: Create the frontend directory**

```bash
mkdir -p frontend
```

- [ ] **Step 2: Create `package.json`**

File: `frontend/package.json`
```json
{
  "name": "task-manager-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-hook-form": "^7.51.0",
    "react-router-dom": "^6.23.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.3.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

File: `frontend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

File: `frontend/tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `vite.config.ts`**

File: `frontend/vite.config.ts`
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
})
```

- [ ] **Step 6: Create `tailwind.config.ts`**

File: `frontend/tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 7: Create `postcss.config.js`**

File: `frontend/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Create `index.html`**

File: `frontend/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Commit**

```bash
git add frontend/package.json frontend/tsconfig.json frontend/tsconfig.node.json \
        frontend/vite.config.ts frontend/tailwind.config.ts frontend/postcss.config.js \
        frontend/index.html
git commit -m "chore(scaffold): add frontend project config files"
```

---

## Task 6: Frontend source files and empty directories

**Files:**
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/setupTests.ts`
- Create: `frontend/src/pages/.gitkeep`
- Create: `frontend/src/components/.gitkeep`
- Create: `frontend/src/hooks/.gitkeep`
- Create: `frontend/src/lib/.gitkeep`
- Create: `frontend/src/types/.gitkeep`

- [ ] **Step 1: Create the src directory structure**

```bash
mkdir -p frontend/src/{pages,components,hooks,lib,types}
```

- [ ] **Step 2: Create `src/index.css`**

File: `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Create `src/main.tsx`**

File: `frontend/src/main.tsx`
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Create `src/App.tsx`**

File: `frontend/src/App.tsx`
```tsx
export default function App() {
  return <div />
}
```

- [ ] **Step 5: Create `src/setupTests.ts`**

File: `frontend/src/setupTests.ts`
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add `.gitkeep` to each empty subdirectory**

```bash
touch frontend/src/pages/.gitkeep
touch frontend/src/components/.gitkeep
touch frontend/src/hooks/.gitkeep
touch frontend/src/lib/.gitkeep
touch frontend/src/types/.gitkeep
```

- [ ] **Step 7: Commit source files**

```bash
git add frontend/src/
git commit -m "chore(scaffold): add frontend source shell and empty dirs"
```

---

## Task 7: Install frontend dependencies and verify

- [ ] **Step 1: Install npm dependencies**

```bash
cd frontend && npm install
```

Expected: exits 0, `node_modules/` created, `package-lock.json` created.

- [ ] **Step 2: Verify `npm run dev` starts without errors**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
kill %1
cd ..
```

Expected: HTTP 200 (Vite serves `index.html`). If the port differs, check the Vite output for the actual URL.

- [ ] **Step 3: Verify `tsc --noEmit` passes**

```bash
cd frontend && npx tsc --noEmit && cd ..
```

Expected: exits 0, no output.

- [ ] **Step 4: Commit `package-lock.json`**

```bash
git add frontend/package-lock.json
git commit -m "chore(scaffold): add package-lock.json after npm install"
```

---

## Task 8: Final verification

- [ ] **Step 1: Confirm no secrets or build artifacts in git**

```bash
git ls-files | grep -E '\.(db|db-shm|db-wal)$|^(bin|obj|node_modules)/' || echo "Clean"
```

Expected: `Clean` — none of those patterns match any tracked file.

- [ ] **Step 2: Re-run dotnet build from repo root**

```bash
dotnet build backend/TaskManager.sln
```

Expected: `Build succeeded.` with 0 errors.

- [ ] **Step 3: Re-run npm install from repo root**

```bash
cd frontend && npm install && cd ..
```

Expected: exits 0 (no changes, already installed).

- [ ] **Step 4: Final commit (if any loose files remain)**

```bash
git status
```

If any untracked files appear, stage and commit them:
```bash
git add <file>
git commit -m "chore(scaffold): finalize phase 0 scaffold"
```

If `git status` is clean, no commit needed.
