# Mission

## Purpose

Task Manager is a production-quality, full-stack task management application. It demonstrates strong fundamentals — clean API design, data ownership enforcement, proper validation, and a polished frontend — treated as a small, shippable MVP rather than a toy project.

## Problem Statement

Users need a reliable personal task manager where their data is theirs alone. Every task, tag, and interaction must be scoped to the authenticated user. No two users should ever see or touch each other's data.

## Goals

1. **Authentication & ownership** — Secure JWT-based register/login; every API endpoint enforces per-user data isolation.
2. **Full task lifecycle** — Create, read, update, and delete tasks with rich metadata: title, description, status, priority, due date, and tags.
3. **Discoverability** — Server-side search (title/description) and pagination so the UI stays fast regardless of task count.
4. **Clean API contract** — All responses use DTOs (never raw EF entities), validated inputs, correct HTTP status codes, and Swagger docs so reviewers can test without extra tooling.
5. **Polished frontend** — Every data state is handled explicitly: loading skeletons, empty states, error messages, and optimistic feedback. Frontend and backend contracts match exactly.
6. **Developer experience** — One `README.md` runbook covers setup, running, testing, assumptions, and trade-offs. No secrets committed. Migrations included so the app is reproducible from a clean clone.

## MVP Scope

### In scope
- User registration and login (JWT, no OAuth)
- Task CRUD with: title, description, status (`Todo` / `InProgress` / `Done`), priority (`Low` / `Medium` / `High`), due date (UTC), tags
- User-scoped tags (created explicitly via `POST /api/tags` before referencing on tasks; no shared/global tags)
- Search tasks by title or description
- Paginated task list (server-side)
- Global error handling with structured JSON error responses
- Swagger UI for API exploration
- At least one integration test (backend) and one component test (frontend)

### Out of scope
- Email verification or password reset
- Team workspaces or task sharing
- File attachments
- Real-time updates (WebSockets)
- Deployment / CI pipeline

## Success Criteria

| Criterion | Definition of done |
|---|---|
| Data isolation | A task created by User A is never returned in User B's responses, even by direct ID lookup |
| DTO contract | No EF entity type appears in any API response; all fields match frontend TypeScript types |
| Validation | Invalid inputs return `400` with a structured error body; missing resources return `404` |
| API docs | Swagger UI loads at `/swagger` and all endpoints are exercisable without external tools |
| Frontend states | Every list/form shows distinct loading, empty, and error states |
| Runbook | A developer can clone, run migrations, start both servers, and hit the app in under 5 minutes following `README.md` |
| Tests | At least one backend integration test and one frontend component test pass in CI |
