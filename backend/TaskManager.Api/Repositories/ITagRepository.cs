using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public interface ITagRepository
{
    Task<IEnumerable<Tag>> GetManyByNamesAsync(string userId, string[] names);
    Task<Tag?> GetByIdAsync(string userId, Guid tagId);
    Task<Tag> CreateAsync(Tag tag);
    Task<Tag> UpdateAsync(Tag tag);
    Task DeleteAsync(Tag tag);
    Task<IEnumerable<Tag>> GetAllByUserAsync(string userId);
}
