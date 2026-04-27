using TaskManager.Api.DTOs.Tags;

namespace TaskManager.Api.Services;

public interface ITagService
{
    Task<TagResponse> CreateTagAsync(string userId, CreateTagRequest request);
    Task<TagResponse> UpdateTagAsync(string userId, Guid tagId, UpdateTagRequest request);
    Task DeleteTagAsync(string userId, Guid tagId);
    Task<IEnumerable<TagResponse>> GetTagsAsync(string userId);
}
