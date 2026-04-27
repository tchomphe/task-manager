using FluentValidation;

namespace TaskManager.Api.DTOs.Tasks;

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x)
            .Must(r => r.Title != null || r.Description != null || r.Status != null
                    || r.Priority != null || r.DueDate != null || r.Tags != null)
            .WithMessage("At least one field must be provided.");

        RuleFor(x => x.Title).MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.DueDate)
            .Must(d => d!.Value.Kind == DateTimeKind.Utc)
            .When(x => x.DueDate != null)
            .WithMessage("DueDate must be UTC.");
    }
}
