# Phase 1 — Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define EF Core entities, configure AppDbContext with UTC converters and Identity, wire DbContext into Program.cs, and produce the initial migration so the schema is reproducible from a clean clone.

**Architecture:** Five entity files in `Models/` define the domain (`AppUser`, `TaskItem`, `Tag`, `TaskTag`, `Enums`). `AppDbContext` extends `IdentityDbContext<AppUser>`, configures the composite PK on `TaskTag`, the many-to-many relationship, and a UTC value converter applied to every `DateTime` column. `Program.cs` registers the DbContext and Identity — no middleware yet.

**Tech Stack:** ASP.NET Core 8, EF Core 8 + SQLite, ASP.NET Identity

---

## File Map

```
backend/TaskManager.Api/Models/
  Enums.cs          — TaskStatus and Priority enums
  AppUser.cs        — IdentityUser subclass with navigation properties
  TaskItem.cs       — Task entity with FK, timestamps, and nav properties
  Tag.cs            — Tag entity with FK and nav properties
  TaskTag.cs        — Join entity for TaskItem ↔ Tag many-to-many

backend/TaskManager.Api/Data/
  AppDbContext.cs   — IdentityDbContext<AppUser>, DbSets, model configuration

backend/TaskManager.Api/
  Program.cs        — Modified: registers DbContext + Identity
```

---

## Task 1: Model files

**Files:**
- Create: `backend/TaskManager.Api/Models/Enums.cs`
- Create: `backend/TaskManager.Api/Models/AppUser.cs`
- Create: `backend/TaskManager.Api/Models/TaskItem.cs`
- Create: `backend/TaskManager.Api/Models/Tag.cs`
- Create: `backend/TaskManager.Api/Models/TaskTag.cs`

All five files are created before the first build — they reference each other via navigation properties, so the compiler needs them all present at once.

- [ ] **Step 1: Create `Enums.cs`**

File: `backend/TaskManager.Api/Models/Enums.cs`
```csharp
namespace TaskManager.Api.Models;

public enum TaskStatus { Todo, InProgress, Done }
public enum Priority { Low, Medium, High }
```

- [ ] **Step 2: Create `AppUser.cs`**

File: `backend/TaskManager.Api/Models/AppUser.cs`
```csharp
using Microsoft.AspNetCore.Identity;

namespace TaskManager.Api.Models;

public class AppUser : IdentityUser
{
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
```

- [ ] **Step 3: Create `TaskItem.cs`**

File: `backend/TaskManager.Api/Models/TaskItem.cs`
```csharp
namespace TaskManager.Api.Models;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime? DueDate { get; set; }
    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public TaskItem()
    {
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
```

- [ ] **Step 4: Create `Tag.cs`**

File: `backend/TaskManager.Api/Models/Tag.cs`
```csharp
namespace TaskManager.Api.Models;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!;
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
```

- [ ] **Step 5: Create `TaskTag.cs`**

File: `backend/TaskManager.Api/Models/TaskTag.cs`
```csharp
namespace TaskManager.Api.Models;

public class TaskTag
{
    public Guid TaskId { get; set; }
    public Guid TagId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

- [ ] **Step 6: Verify build passes**

```bash
dotnet build backend/TaskManager.sln
```

Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 7: Commit**

```bash
git add backend/TaskManager.Api/Models/
git commit -m "feat(data): add domain entity models"
```

---

## Task 2: AppDbContext

**Files:**
- Create: `backend/TaskManager.Api/Data/AppDbContext.cs`

- [ ] **Step 1: Create `AppDbContext.cs`**

File: `backend/TaskManager.Api/Data/AppDbContext.cs`
```csharp
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TaskManager.Api.Models;

namespace TaskManager.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<TaskTag> TaskTags => Set<TaskTag>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<TaskTag>()
            .HasKey(tt => new { tt.TaskId, tt.TagId });

        builder.Entity<TaskItem>()
            .HasMany(t => t.Tags)
            .WithMany(t => t.Tasks)
            .UsingEntity<TaskTag>();

        var utcConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableUtcConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(utcConverter);
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(nullableUtcConverter);
            }
        }
    }
}
```

- [ ] **Step 2: Verify build passes**

```bash
dotnet build backend/TaskManager.sln
```

Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 3: Commit**

```bash
git add backend/TaskManager.Api/Data/AppDbContext.cs
git commit -m "feat(data): add AppDbContext with Identity, UTC converter, and many-to-many config"
```

---

## Task 3: Program.cs — register DbContext and Identity

**Files:**
- Modify: `backend/TaskManager.Api/Program.cs`

- [ ] **Step 1: Replace `Program.cs` with the updated version**

File: `backend/TaskManager.Api/Program.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<AppUser>()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();
app.Run();
```

- [ ] **Step 2: Verify build passes**

```bash
dotnet build backend/TaskManager.sln
```

Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 3: Commit**

```bash
git add backend/TaskManager.Api/Program.cs
git commit -m "feat(data): wire DbContext and Identity into Program.cs"
```

---

## Task 4: EF migration and database verification

**Files:**
- Create: `backend/TaskManager.Api/Data/Migrations/` (generated by EF tools)

- [ ] **Step 1: Verify `dotnet ef` is installed**

```bash
dotnet ef --version
```

If the command is not found, install it:
```bash
dotnet tool install --global dotnet-ef
```

Expected: prints a version like `Entity Framework Core .NET Command-line Tools 8.x.x`

- [ ] **Step 2: Run the migration**

```bash
dotnet ef migrations add InitialCreate --project backend/TaskManager.Api
```

Expected output includes:
```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

This generates three files under `backend/TaskManager.Api/Data/Migrations/`:
- `<timestamp>_InitialCreate.cs` — the migration operations
- `<timestamp>_InitialCreate.Designer.cs` — the snapshot metadata
- `AppDbContextModelSnapshot.cs` — the full model snapshot

If you get an error about a missing connection string, set the environment variable first:
```bash
ASPNETCORE_ENVIRONMENT=Development dotnet ef migrations add InitialCreate --project backend/TaskManager.Api
```

- [ ] **Step 3: Verify the migration looks correct**

Open `backend/TaskManager.Api/Data/Migrations/<timestamp>_InitialCreate.cs` and confirm:
- `Up()` contains `CreateTable` calls for: `AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens`, `AspNetRoleClaims`, `Tasks`, `Tags`, `TaskTags`
- `Tasks` table has columns: `Id`, `Title`, `Description`, `Status`, `Priority`, `DueDate`, `UserId`, `CreatedAt`, `UpdatedAt`
- `Tags` table has columns: `Id`, `Name`, `UserId`
- `TaskTags` table has composite PK on `(TaskId, TagId)`

- [ ] **Step 4: Apply the migration**

```bash
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update --project backend/TaskManager.Api
```

Expected: ends with `Done.`

- [ ] **Step 5: Verify the database was created**

```bash
ls backend/TaskManager.Api/taskmanager.db
```

Expected: file exists.

Spot-check the schema (optional but recommended):
```bash
sqlite3 backend/TaskManager.Api/taskmanager.db ".tables"
```

Expected output includes: `AspNetUsers  Tags  TaskTags  Tasks` (plus other Identity tables)

- [ ] **Step 6: Confirm `taskmanager.db` is gitignored**

```bash
git check-ignore -v backend/TaskManager.Api/taskmanager.db
```

Expected: `.gitignore:4:*.db  backend/TaskManager.Api/taskmanager.db`

- [ ] **Step 7: Commit the migration files**

```bash
git add backend/TaskManager.Api/Data/Migrations/
git commit -m "feat(data): add InitialCreate migration"
```

- [ ] **Step 8: Final build verification**

```bash
dotnet build backend/TaskManager.sln
```

Expected: `Build succeeded. 0 Error(s) 0 Warning(s)`
