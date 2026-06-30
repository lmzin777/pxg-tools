using PxgTools.Domain.Crafts;

namespace PxgTools.Application.Crafts;

public interface ICraftReadRepository
{
    Task<CraftsOverview> ListAsync(CraftQuery query, CancellationToken cancellationToken);

    Task<CraftSummary?> GetAsync(string slug, CancellationToken cancellationToken);
}

public sealed record CraftQuery(
    string? Item,
    string? Profession,
    string? Ingredient);
