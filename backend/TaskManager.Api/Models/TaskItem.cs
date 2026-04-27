namespace TaskManager.Api.Models;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime? DueDate { get; set; }
    public required string UserId { get; set; }
    public AppUser User { get; set; } = null!; // EF nav property — always set after eager load
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
