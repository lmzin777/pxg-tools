namespace PxgTools.Domain.Professions;

public sealed record ProfessionSummary(
    string Slug,
    string Name,
    string Summary,
    string IconUrl,
    string SourceUrl);

public sealed record ProfessionSection(
    string Title,
    string Anchor,
    int Level);

public sealed record ProfessionLink(
    string Slug,
    string Title,
    string Kind,
    string Summary,
    string IconUrl,
    string SourceUrl,
    IReadOnlyList<ProfessionSection> Sections);

public sealed record ProfessionDetail(
    string Slug,
    string Name,
    string Summary,
    string IconUrl,
    string SourceUrl,
    IReadOnlyList<ProfessionSection> Sections,
    IReadOnlyList<ProfessionLink> Crafts,
    IReadOnlyList<ProfessionLink> Specializations,
    IReadOnlyList<ProfessionLink> Subsections);

public sealed record ProfessionsOverview(
    IReadOnlyList<ProfessionSummary> Professions,
    IReadOnlyList<ProfessionLink> RelatedLinks);
