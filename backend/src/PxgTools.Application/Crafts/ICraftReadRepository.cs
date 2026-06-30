using PxgTools.Domain.Crafts;

namespace PxgTools.Application.Crafts;

public interface ICraftReadRepository
{
    Task<CraftsOverview> ListAsync(CraftQuery query, CancellationToken cancellationToken);
}

public sealed record CraftQuery(
    string? Item,
    string? Profession,
    string? Ingredient);
