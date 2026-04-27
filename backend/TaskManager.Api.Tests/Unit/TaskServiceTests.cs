using FluentValidation;
using FluentValidation.Results;
using Moq;
using TaskManager.Api.DTOs.Tasks;
using TaskManager.Api.Middleware;
using TaskManager.Api.Models;
using TaskManager.Api.Repositories;
using TaskManager.Api.Services;
using Xunit;

namespace TaskManager.Api.Tests.Unit;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepo = new();
    private readonly Mock<ITagRepository> _tagRepo = new();
    private readonly TaskService _sut;

    public TaskServiceTests() => _sut = new TaskService(_taskRepo.Object, _tagRepo.Object);

    [Fact]
    public async Task GetTask_WrongUserId_ThrowsNotFoundException()
    {
        _taskRepo.Setup(r => r.GetByIdAsync("user1", It.IsAny<Guid>()))
            .ReturnsAsync((TaskItem?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.GetTaskAsync("user1", Guid.NewGuid()));
    }

    [Fact]
    public async Task CreateTask_CallsRepositoryWithCorrectEntity()
    {
        var request = new CreateTaskRequest { Title = "Buy groceries" };
        _taskRepo.Setup(r => r.CreateAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem t) => t);

        var result = await _sut.CreateTaskAsync("user1", request);

        _taskRepo.Verify(r => r.CreateAsync(It.Is<TaskItem>(t =>
            t.Title == "Buy groceries" && t.UserId == "user1")), Times.Once);
        Assert.Equal("Buy groceries", result.Title);
    }

    [Fact]
    public async Task CreateTask_UnknownTagName_ThrowsValidationException()
    {
        var request = new CreateTaskRequest { Title = "Test", Tags = ["nonexistent"] };
        _tagRepo
            .Setup(r => r.GetManyByNamesAsync("user1", It.IsAny<string[]>()))
            .ThrowsAsync(new ValidationException(
                [new ValidationFailure("Tags", "Tag 'nonexistent' not found.")]));

        await Assert.ThrowsAsync<ValidationException>(
            () => _sut.CreateTaskAsync("user1", request));
    }

    [Fact]
    public async Task UpdateTask_TagsPresent_ReplacesTagsWholesale()
    {
        var taskId = Guid.NewGuid();
        var oldTag = new Tag { Id = Guid.NewGuid(), Name = "old", UserId = "user1" };
        var newTag = new Tag { Id = Guid.NewGuid(), Name = "new", UserId = "user1" };
        var task = new TaskItem
        {
            Id = taskId, UserId = "user1", Title = "T",
            Tags = new List<Tag> { oldTag }
        };

        _taskRepo.Setup(r => r.GetByIdAsync("user1", taskId)).ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).ReturnsAsync((TaskItem t) => t);
        _tagRepo.Setup(r => r.GetManyByNamesAsync("user1", new[] { "new" }))
            .ReturnsAsync([newTag]);

        var result = await _sut.UpdateTaskAsync("user1", taskId,
            new UpdateTaskRequest { Tags = ["new"] });

        Assert.Single(result.Tags);
        Assert.Equal("new", result.Tags[0].Name);
    }

    [Fact]
    public async Task UpdateTask_TagsOmitted_LeavesTagsUnchanged()
    {
        var taskId = Guid.NewGuid();
        var existingTag = new Tag { Id = Guid.NewGuid(), Name = "existing", UserId = "user1" };
        var task = new TaskItem
        {
            Id = taskId, UserId = "user1", Title = "Old",
            Tags = new List<Tag> { existingTag }
        };

        _taskRepo.Setup(r => r.GetByIdAsync("user1", taskId)).ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).ReturnsAsync((TaskItem t) => t);

        var result = await _sut.UpdateTaskAsync("user1", taskId,
            new UpdateTaskRequest { Title = "New title" });

        Assert.Single(result.Tags);
        Assert.Equal("existing", result.Tags[0].Name);
        _tagRepo.Verify(
            r => r.GetManyByNamesAsync(It.IsAny<string>(), It.IsAny<string[]>()),
            Times.Never);
    }

    [Fact]
    public async Task DeleteTask_WrongUserId_ThrowsNotFoundException()
    {
        _taskRepo.Setup(r => r.GetByIdAsync("user1", It.IsAny<Guid>()))
            .ReturnsAsync((TaskItem?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.DeleteTaskAsync("user1", Guid.NewGuid()));
    }
}
