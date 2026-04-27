namespace TaskManager.Api.DTOs.Tags;

public class CreateTagRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
}
