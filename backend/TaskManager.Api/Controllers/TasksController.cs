using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.DTOs.Tasks;
using TaskManager.Api.Services;

namespace TaskManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _tasks;

    public TasksController(ITaskService tasks) => _tasks = tasks;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>List tasks for the authenticated user with optional search, filters, and pagination.</summary>
    /// <response code="200">Paginated task list.</response>
    [HttpGet]
    [ProducesResponseType<PagedResponse<TaskResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTasks([FromQuery] TaskQueryParams queryParams)
        => Ok(await _tasks.GetTasksAsync(UserId, queryParams));

    /// <summary>Create a new task. Tag names in the <c>tags</c> array must already exist for the user.</summary>
    /// <response code="201">Task created; Location header points to the new resource.</response>
    /// <response code="400">Validation error — missing title, invalid due date, or unknown tag name.</response>
    [HttpPost]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var task = await _tasks.CreateTaskAsync(UserId, request);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    /// <summary>Get a single task by ID. Returns 404 if the task doesn't exist or belongs to another user.</summary>
    /// <response code="200">Task details.</response>
    /// <response code="404">Task not found or not owned by the caller.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTask(Guid id)
        => Ok(await _tasks.GetTaskAsync(UserId, id));

    /// <summary>
    /// Update a task (PATCH semantics — omit any field to leave it unchanged).
    /// Pass <c>tags: []</c> to clear all tags; omit <c>tags</c> entirely to leave tags unchanged.
    /// </summary>
    /// <response code="200">Updated task.</response>
    /// <response code="404">Task not found or not owned by the caller.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
        => Ok(await _tasks.UpdateTaskAsync(UserId, id, request));

    /// <summary>Delete a task. Returns 404 if the task doesn't exist or belongs to another user.</summary>
    /// <response code="204">Task deleted.</response>
    /// <response code="404">Task not found or not owned by the caller.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        await _tasks.DeleteTaskAsync(UserId, id);
        return NoContent();
    }
}
