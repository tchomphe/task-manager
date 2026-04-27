using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public class TagRepository : ITagRepository
{
    private readonly AppDbContext _db;

    public TagRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Tag>> GetManyByNamesAsync(string userId, string[] names)
    {
        var lowerNames = names.Select(n => n.ToLower()).ToHashSet();
        var found = await _db.Tags
            .Where(t => t.UserId == userId && lowerNames.Contains(t.Name.ToLower()))
            .ToListAsync();

        foreach (var name in names)
        {
            if (!found.Any(t => t.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
                throw new ValidationException(
                    [new ValidationFailure("Tags", $"Tag '{name}' not found.")]);
        }

        return found;
    }

    public async Task<Tag?> GetByIdAsync(string userId, Guid tagId)
        => await _db.Tags.FirstOrDefaultAsync(t => t.UserId == userId && t.Id == tagId);

    public async Task<Tag> CreateAsync(Tag tag)
    {
        var exists = await _db.Tags.AnyAsync(t =>
            t.UserId == tag.UserId &&
            t.Name.ToLower() == tag.Name.ToLower());

        if (exists)
            throw new ValidationException(
                [new ValidationFailure("Name", $"A tag named '{tag.Name}' already exists.")]);

        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();
        return tag;
    }

    public async Task<Tag> UpdateAsync(Tag tag)
    {
        await _db.SaveChangesAsync();
        return tag;
    }

    public async Task DeleteAsync(Tag tag)
    {
        // Load Tasks so EF's ChangeTracker can cascade-delete the TaskTag join entries.
        // Needed for EF InMemory (SQLite handles cascade via FK constraints without this).
        await _db.Entry(tag).Collection(t => t.Tasks).LoadAsync();
        _db.Tags.Remove(tag);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Tag>> GetAllByUserAsync(string userId)
        => await _db.Tags
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .ToListAsync();
}
