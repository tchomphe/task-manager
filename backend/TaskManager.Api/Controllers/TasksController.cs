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

    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] TaskQueryParams queryParams)
        => Ok(await _tasks.GetTasksAsync(UserId, queryParams));

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var task = await _tasks.CreateTaskAsync(UserId, request);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTask(Guid id)
        => Ok(await _tasks.GetTaskAsync(UserId, id));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
        => Ok(await _tasks.UpdateTaskAsync(UserId, id, request));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        await _tasks.DeleteTaskAsync(UserId, id);
        return NoContent();
    }
}
