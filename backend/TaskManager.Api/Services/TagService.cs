using FluentValidation;
using FluentValidation.Results;
using TaskManager.Api.DTOs.Tags;
using TaskManager.Api.Middleware;
using TaskManager.Api.Models;
using TaskManager.Api.Repositories;

namespace TaskManager.Api.Services;

public class TagService : ITagService
{
    private readonly ITagRepository _tags;

    public TagService(ITagRepository tags) => _tags = tags;

    public async Task<TagResponse> CreateTagAsync(string userId, CreateTagRequest request)
    {
        var tag = new Tag
        {
            UserId = userId,
            Name = request.Name,
            Color = request.Color
        };
        await _tags.CreateAsync(tag);
        return MapToResponse(tag);
    }

    public async Task<TagResponse> UpdateTagAsync(string userId, Guid tagId, UpdateTagRequest request)
    {
        var tag = await _tags.GetByIdAsync(userId, tagId)
            ?? throw new NotFoundException($"Tag {tagId} not found.");

        if (request.Name != null)
        {
            var allTags = await _tags.GetAllByUserAsync(userId);
            var duplicate = allTags.FirstOrDefault(t =>
                t.Id != tagId &&
                t.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase));

            if (duplicate != null)
                throw new ValidationException(
                    [new ValidationFailure("Name", $"A tag named '{request.Name}' already exists.")]);

            tag.Name = request.Name;
        }

        if (request.Color != null)
            tag.Color = request.Color;

        await _tags.UpdateAsync(tag);
        return MapToResponse(tag);
    }

    public async Task DeleteTagAsync(string userId, Guid tagId)
    {
        var tag = await _tags.GetByIdAsync(userId, tagId)
            ?? throw new NotFoundException($"Tag {tagId} not found.");
        await _tags.DeleteAsync(tag);
    }

    public async Task<IEnumerable<TagResponse>> GetTagsAsync(string userId)
    {
        var tags = await _tags.GetAllByUserAsync(userId);
        return tags.Select(MapToResponse);
    }

    private static TagResponse MapToResponse(Tag tag) => new()
    {
        Id = tag.Id,
        Name = tag.Name,
        Color = tag.Color
    };
}
