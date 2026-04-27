using FluentValidation;

namespace TaskManager.Api.DTOs.Tags;

public class UpdateTagRequestValidator : AbstractValidator<UpdateTagRequest>
{
    public UpdateTagRequestValidator()
    {
        RuleFor(x => x)
            .Must(r => r.Name != null || r.Color != null)
            .WithMessage("At least one field must be provided.");

        RuleFor(x => x.Name).MaximumLength(50).When(x => x.Name != null);
        RuleFor(x => x.Color)
            .Matches(@"^#[0-9A-Fa-f]{6}$")
            .WithMessage("Color must be a valid hex color (e.g. #3B82F6).")
            .When(x => x.Color != null);
    }
}
