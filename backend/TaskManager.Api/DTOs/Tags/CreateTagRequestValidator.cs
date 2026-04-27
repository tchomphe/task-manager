using FluentValidation;

namespace TaskManager.Api.DTOs.Tags;

public class CreateTagRequestValidator : AbstractValidator<CreateTagRequest>
{
    public CreateTagRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Color)
            .Matches(@"^#[0-9A-Fa-f]{6}$")
            .When(x => x.Color != null)
            .WithMessage("Color must be a valid hex color (e.g. #3B82F6).");
    }
}
