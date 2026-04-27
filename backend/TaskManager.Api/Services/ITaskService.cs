using TaskManager.Api.DTOs.Tasks;

namespace TaskManager.Api.Services;

public interface ITaskService
{
    Task<PagedResponse<TaskResponse>> GetTasksAsync(string userId, TaskQueryParams queryParams);
    Task<TaskResponse> GetTaskAsync(string userId, Guid taskId);
    Task<TaskResponse> CreateTaskAsync(string userId, CreateTaskRequest request);
    Task<TaskResponse> UpdateTaskAsync(string userId, Guid taskId, UpdateTaskRequest request);
    Task DeleteTaskAsync(string userId, Guid taskId);
}
