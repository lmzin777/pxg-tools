namespace PxgTools.Domain.Crafts;

public sealed record CraftIngredient(
    string Name,
    string ItemSlug,
    string Quantity,
    string IconUrl);

public sealed record CraftSummary(
    string Slug,
    string ItemName,
    string ItemSlug,
    string ImageUrl,
    string Profession,
    string ProfessionSlug,
    string Subprofession,
    string SubprofessionSlug,
    string Category,
    string Rank,
    string Skill,
    string CraftTime,
    string Requirements,
    string SourcePage,
    string SourceUrl,
    IReadOnlyList<CraftIngredient> Ingredients);

public sealed record CraftsOverview(IReadOnlyList<CraftSummary> Crafts);
