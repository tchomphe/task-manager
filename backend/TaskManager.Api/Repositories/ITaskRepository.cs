using TaskManager.Api.DTOs.Tasks;
using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public interface ITaskRepository
{
    Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetAllAsync(string userId, TaskQueryParams queryParams);
    Task<TaskItem?> GetByIdAsync(string userId, Guid taskId);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task<TaskItem> UpdateAsync(TaskItem task);
    Task DeleteAsync(TaskItem task);
}
