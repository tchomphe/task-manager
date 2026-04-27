namespace TaskManager.Api.Models;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string UserId { get; set; }
    public AppUser User { get; set; } = null!; // EF nav property — always set after eager load
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
