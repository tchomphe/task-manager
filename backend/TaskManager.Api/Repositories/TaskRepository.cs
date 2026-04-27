using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs.Tasks;
using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _db;

    public TaskRepository(AppDbContext db) => _db = db;

    public async Task<(IReadOnlyList<TaskItem> Items, int TotalCount)> GetAllAsync(
        string userId, TaskQueryParams queryParams)
    {
        var query = _db.Tasks
            .Include(t => t.Tags)
            .AsNoTracking()
            .Where(t => t.UserId == userId);

        if (queryParams.Status != null)
            query = query.Where(t => t.Status == queryParams.Status);

        if (queryParams.Priority != null)
            query = query.Where(t => t.Priority == queryParams.Priority);

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
            query = query.Where(t =>
                t.Title.Contains(queryParams.Search) ||
                (t.Description != null && t.Description.Contains(queryParams.Search)));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<TaskItem?> GetByIdAsync(string userId, Guid taskId)
        => await _db.Tasks
            .Include(t => t.Tags)
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Id == taskId);

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem> UpdateAsync(TaskItem task)
    {
        await _db.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(TaskItem task)
    {
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
    }
}
