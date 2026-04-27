# Phase 1 — Data Layer Design

**Date:** 2026-04-26  
**Status:** Approved

---

## Goal

Define EF Core entities and produce the initial migration so the schema is reproducible from a clean clone. No application logic, no API endpoints.

---

## Entities (`backend/TaskManager.Api/Models/`)

### `Enums.cs`

```csharp
public enum TaskStatus { Todo, InProgress, Done }
public enum Priority { Low, Medium, High }
```

### `AppUser.cs`

Extends `IdentityUser`. Adds navigation properties:
- `ICollection<TaskItem> Tasks`
- `ICollection<Tag> Tags`

### `TaskItem.cs`

| Property | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK, default `Guid.NewGuid()` |
| `Title` | `string` | Required, non-nullable |
| `Description` | `string?` | Optional |
| `Status` | `TaskStatus` | Enum |
| `Priority` | `Priority` | Enum |
| `DueDate` | `DateTime?` | Nullable, UTC |
| `UserId` | `string` | FK to AppUser, non-nullable |
| `User` | `AppUser` | Navigation |
| `CreatedAt` | `DateTime` | UTC, set in constructor |
| `UpdatedAt` | `DateTime` | UTC, set in constructor |
| `Tags` | `ICollection<Tag>` | Many-to-many via TaskTag |

Constructor defaults `CreatedAt` and `UpdatedAt` to `DateTime.UtcNow`.

### `Tag.cs`

| Property | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK, default `Guid.NewGuid()` |
| `Name` | `string` | Required, non-nullable |
| `UserId` | `string` | FK to AppUser, non-nullable |
| `User` | `AppUser` | Navigation |
| `Tasks` | `ICollection<TaskItem>` | Many-to-many via TaskTag |

### `TaskTag.cs`

Join entity for the `TaskItem` ↔ `Tag` many-to-many:

| Property | Type | Notes |
|---|---|---|
| `TaskId` | `Guid` | FK to TaskItem, composite PK |
| `TagId` | `Guid` | FK to Tag, composite PK |

Composite PK configured in `AppDbContext.OnModelCreating`.

---

## DbContext (`backend/TaskManager.Api/Data/AppDbContext.cs`)

Extends `IdentityDbContext<AppUser>`.

**DbSets:**
- `DbSet<TaskItem> Tasks`
- `DbSet<Tag> Tags`
- `DbSet<TaskTag> TaskTags`

**`OnModelCreating` configures:**

1. **Composite PK on TaskTag:** `modelBuilder.Entity<TaskTag>().HasKey(tt => new { tt.TaskId, tt.TagId })`
2. **Many-to-many via TaskTag:**
   ```
   TaskItem → HasMany(Tags) → WithMany(Tasks) → UsingEntity<TaskTag>
   ```
3. **UTC value converter** on every `DateTime` column — inline `ValueConverter<DateTime, DateTime>` that sets `DateTimeKind.Utc` on reads, preserving UTC through SQLite round-trips.

---

## Program.cs

Adds to the service container only — no middleware:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<AppUser>()
    .AddEntityFrameworkStores<AppDbContext>();
```

---

## Key Rules

- `TaskItem.UserId` and `Tag.UserId` are non-nullable — enforced in entity definition and DB schema
- `CreatedAt` and `UpdatedAt` default to `DateTime.UtcNow` in constructors — never rely on DB defaults
- `DueDate` nullable; UTC kind preserved via value converter
- No soft delete — hard deletes only
- No business logic in entities — plain data containers

---

## Migration

```bash
dotnet ef migrations add InitialCreate --project backend/TaskManager.Api
dotnet ef database update --project backend/TaskManager.Api
```

Produces `Data/Migrations/` directory. The generated `taskmanager.db` is gitignored.

---

## Definition of Done

1. `dotnet ef migrations add InitialCreate` produces a valid migration and snapshot
2. `dotnet ef database update` creates `taskmanager.db` with all tables (Tasks, Tags, TaskTags + Identity tables)
3. `AppDbContext` compiles; entity relationships visible in migration snapshot
4. `dotnet build backend/TaskManager.sln` exits 0
