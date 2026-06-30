namespace PxgTools.Domain.Admin;

public sealed record SyncRunSummary(
    string Id,
    string Source,
    string Scope,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? FinishedAt,
    int DurationSeconds,
    string Message,
    string ErrorMessage,
    int RecordsLoaded);

public sealed record AdminTableStat(
    string Scope,
    string TableName,
    long Records);

public sealed record AdminStats(
    DateTimeOffset GeneratedAt,
    IReadOnlyList<AdminTableStat> Tables,
    IReadOnlyList<SyncRunSummary> RecentErrors);

public sealed record AdminHealth(
    string Status,
    string Database,
    DateTimeOffset CheckedAt);
