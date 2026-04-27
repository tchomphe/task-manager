using Microsoft.AspNetCore.Identity;

namespace TaskManager.Api.Models;

public class AppUser : IdentityUser
{
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
