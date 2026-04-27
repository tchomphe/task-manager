using FluentValidation;

namespace TaskManager.Api.DTOs.Tasks;

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DueDate)
            .Must(d => d == null || d.Value.Kind == DateTimeKind.Utc)
            .WithMessage("DueDate must be UTC.");
    }
}
