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

    [HttpGet]
    public async Task<IActionResult> GetTags()
        => Ok(await _tags.GetTagsAsync(UserId));

    [HttpPost]
    public async Task<IActionResult> CreateTag([FromBody] CreateTagRequest request)
    {
        var tag = await _tags.CreateTagAsync(UserId, request);
        return CreatedAtAction(nameof(GetTags), new { id = tag.Id }, tag);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTag(Guid id, [FromBody] UpdateTagRequest request)
        => Ok(await _tags.UpdateTagAsync(UserId, id, request));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTag(Guid id)
    {
        await _tags.DeleteTagAsync(UserId, id);
        return NoContent();
    }
}
