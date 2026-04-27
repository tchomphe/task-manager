using TaskManager.Api.Models;

namespace TaskManager.Api.DTOs.Tasks;

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public Priority? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public string[]? Tags { get; set; }
}
