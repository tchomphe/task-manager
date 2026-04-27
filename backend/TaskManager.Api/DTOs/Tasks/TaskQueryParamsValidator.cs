using FluentValidation;

namespace TaskManager.Api.DTOs.Tasks;

public class TaskQueryParamsValidator : AbstractValidator<TaskQueryParams>
{
    public TaskQueryParamsValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
