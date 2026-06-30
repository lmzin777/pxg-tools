namespace PxgTools.Domain.Search;

public sealed record SearchResult(
    string Type,
    string Title,
    string Slug,
    string Url,
    string ImageUrl,
    string Summary);

public sealed record SearchOverview(IReadOnlyList<SearchResult> Results);
