using TaskManager.Api.DTOs.Tags;
using TaskManager.Api.DTOs.Tasks;
using TaskManager.Api.Middleware;
using TaskManager.Api.Models;
using TaskManager.Api.Repositories;

namespace TaskManager.Api.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _tasks;
    private readonly ITagRepository _tags;

    public TaskService(ITaskRepository tasks, ITagRepository tags)
    {
        _tasks = tasks;
        _tags = tags;
    }

    public async Task<PagedResponse<TaskResponse>> GetTasksAsync(string userId, TaskQueryParams queryParams)
    {
        var (items, total) = await _tasks.GetAllAsync(userId, queryParams);
        return new PagedResponse<TaskResponse>
        {
            Items = items.Select(MapToResponse).ToList(),
            TotalCount = total,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<TaskResponse> GetTaskAsync(string userId, Guid taskId)
    {
        var task = await _tasks.GetByIdAsync(userId, taskId)
            ?? throw new NotFoundException($"Task {taskId} not found.");
        return MapToResponse(task);
    }

    public async Task<TaskResponse> CreateTaskAsync(string userId, CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Tags is { Length: > 0 })
            task.Tags = (await _tags.GetManyByNamesAsync(userId, request.Tags)).ToList();

        await _tasks.CreateAsync(task);
        return MapToResponse(task);
    }

    public async Task<TaskResponse> UpdateTaskAsync(string userId, Guid taskId, UpdateTaskRequest request)
    {
        var task = await _tasks.GetByIdAsync(userId, taskId)
            ?? throw new NotFoundException($"Task {taskId} not found.");

        if (request.Title != null) task.Title = request.Title;
        if (request.Description != null) task.Description = request.Description;
        if (request.Status != null) task.Status = request.Status.Value;
        if (request.Priority != null) task.Priority = request.Priority.Value;
        if (request.DueDate != null) task.DueDate = request.DueDate;

        if (request.Tags != null)
        {
            task.Tags = request.Tags.Length == 0
                ? []
                : (await _tags.GetManyByNamesAsync(userId, request.Tags)).ToList();
        }

        task.UpdatedAt = DateTime.UtcNow;
        await _tasks.UpdateAsync(task);
        return MapToResponse(task);
    }

    public async Task DeleteTaskAsync(string userId, Guid taskId)
    {
        var task = await _tasks.GetByIdAsync(userId, taskId)
            ?? throw new NotFoundException($"Task {taskId} not found.");
        await _tasks.DeleteAsync(task);
    }

    private static TaskResponse MapToResponse(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        Status = task.Status,
        Priority = task.Priority,
        DueDate = task.DueDate,
        Tags = task.Tags
            .Select(t => new TagResponse { Id = t.Id, Name = t.Name, Color = t.Color })
            .ToArray(),
        CreatedAt = task.CreatedAt,
        UpdatedAt = task.UpdatedAt
    };
}
