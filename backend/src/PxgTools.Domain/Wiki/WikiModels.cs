namespace PxgTools.Domain.Wiki;

public sealed record WikiDomainSummary(
    string Domain,
    string Title,
    string Description,
    int Priority,
    string SourceUrl,
    string ScraperScript,
    string LoaderScript,
    string Status,
    DateTimeOffset UpdatedAt,
    long RecordCount);

public sealed record WikiEntitySummary(
    string Slug,
    string Name,
    string Summary,
    string ImageUrl,
    string SourceUrl,
    DateTimeOffset ScrapedAt,
    IReadOnlyDictionary<string, string> Metadata);

public sealed record WikiDomainsOverview(IReadOnlyList<WikiDomainSummary> Domains);

public sealed record WikiDomainDetail(
    string Domain,
    string Title,
    string Description,
    int Priority,
    string SourceUrl,
    string ScraperScript,
    string LoaderScript,
    string Status,
    DateTimeOffset UpdatedAt,
    long RecordCount,
    IReadOnlyList<WikiEntitySummary> Entities);
