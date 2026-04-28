using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.DTOs.Tags;
using TaskManager.Api.Services;

namespace TaskManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tags")]
public class TagsController : ControllerBase
{
    private readonly ITagService _tags;

    public TagsController(ITagService tags) => _tags = tags;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>List all tags for the authenticated user.</summary>
    /// <response code="200">Array of tags (may be empty).</response>
    [HttpGet]
    [ProducesResponseType<TagResponse[]>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTags()
        => Ok(await _tags.GetTagsAsync(UserId));

    /// <summary>Create a new tag. Names are unique per user (case-insensitive).</summary>
    /// <response code="201">Tag created; Location header points to the tag list.</response>
    /// <response code="400">Validation error — missing name, invalid color, or duplicate name.</response>
    [HttpPost]
    [ProducesResponseType<TagResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTag([FromBody] CreateTagRequest request)
    {
        var tag = await _tags.CreateTagAsync(UserId, request);
        return CreatedAtAction(nameof(GetTags), new { id = tag.Id }, tag);
    }

    /// <summary>Update a tag's name and/or color. Returns 404 if the tag belongs to another user.</summary>
    /// <response code="200">Updated tag.</response>
    /// <response code="400">Duplicate tag name.</response>
    /// <response code="404">Tag not found or not owned by the caller.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType<TagResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTag(Guid id, [FromBody] UpdateTagRequest request)
        => Ok(await _tags.UpdateTagAsync(UserId, id, request));

    /// <summary>
    /// Delete a tag. Automatically removes it from all tasks that reference it.
    /// Returns 404 if the tag belongs to another user.
    /// </summary>
    /// <response code="204">Tag deleted.</response>
    /// <response code="404">Tag not found or not owned by the caller.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTag(Guid id)
    {
        await _tags.DeleteTagAsync(UserId, id);
        return NoContent();
    }
}
