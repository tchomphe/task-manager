using TaskManager.Api.Models;

namespace TaskManager.Api.DTOs.Tasks;

public class TaskQueryParams
{
    public string? Search { get; set; }
    public TaskItemStatus? Status { get; set; }
    public Priority? Priority { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
