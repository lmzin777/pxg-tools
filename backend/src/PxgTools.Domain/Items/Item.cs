namespace PxgTools.Domain.Items;

public sealed record ItemCategorySummary(
    string Slug,
    string Title,
    string Group,
    string Summary,
    string IconUrl,
    string SourceUrl,
    int ItemCount);

public sealed record ItemCategorySection(
    string Title,
    string Anchor,
    int Level);

public sealed record ItemAttribute(
    string Name,
    string Value);

public sealed record ItemSummary(
    string Slug,
    string Name,
    string IconUrl,
    string Description,
    string Section,
    string Table,
    string SourceUrl,
    IReadOnlyList<ItemAttribute> Attributes);

public sealed record ItemCategoryDetail(
    string Slug,
    string Title,
    string Group,
    string Summary,
    string IconUrl,
    string SourceUrl,
    IReadOnlyList<ItemCategorySection> Sections,
    IReadOnlyList<ItemSummary> Items);

public sealed record ItemDetail(
    string Slug,
    string Name,
    string IconUrl,
    string Description,
    string Section,
    string Table,
    string SourceUrl,
    string CategorySlug,
    string CategoryTitle,
    string CategoryGroup,
    IReadOnlyList<ItemAttribute> Attributes);

public sealed record ItemsOverview(IReadOnlyList<ItemCategorySummary> Categories);
