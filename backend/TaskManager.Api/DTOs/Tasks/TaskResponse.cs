using TaskManager.Api.DTOs.Tags;
using TaskManager.Api.Models;

namespace TaskManager.Api.DTOs.Tasks;

public class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public TagResponse[] Tags { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
