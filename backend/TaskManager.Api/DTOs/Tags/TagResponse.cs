namespace TaskManager.Api.DTOs.Tags;

public class TagResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
}
