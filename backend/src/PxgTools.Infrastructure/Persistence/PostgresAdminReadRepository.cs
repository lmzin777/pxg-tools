using Npgsql;
using PxgTools.Application.Admin;
using PxgTools.Domain.Admin;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresAdminReadRepository(NpgsqlDataSource dataSource) : IAdminReadRepository
{
    private static readonly (string Scope, string TableName)[] CountedTables =
    [
        ("clans", "clans"),
        ("professions", "professions"),
        ("pokemon", "pokemon"),
        ("items", "items"),
        ("crafts", "crafts"),
        ("students", "wiki_entities"),
        ("monuments", "wiki_entities"),
        ("adventurer maps", "wiki_entities"),
        ("helds", "wiki_entities"),
        ("bosses", "wiki_entities"),
        ("dungeons", "wiki_entities"),
        ("quests", "wiki_entities"),
        ("npcs", "wiki_entities"),
        ("berries", "wiki_entities"),
        ("addons", "wiki_entities"),
        ("outfits", "wiki_entities"),
        ("tasks", "wiki_entities"),
        ("respawns", "wiki_entities"),
        ("mapas", "wiki_entities"),
    ];

    public async Task<AdminHealth> GetHealthAsync(CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand("select current_database(), now()");
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        await reader.ReadAsync(cancellationToken);

        return new AdminHealth("ok", reader.GetString(0), reader.GetDateTime(1));
    }

    public async Task<AdminStats> GetStatsAsync(CancellationToken cancellationToken)
    {
        var tableStats = new List<AdminTableStat>();
        foreach (var (scope, tableName) in CountedTables)
        {
            tableStats.Add(new AdminTableStat(scope, tableName, await CountRowsAsync(tableName, scope, cancellationToken)));
        }

        var recentErrors = await ListSyncRunsAsync(cancellationToken);
        return new AdminStats(DateTimeOffset.UtcNow, tableStats, recentErrors
            .Where(run => run.Status.Contains("fail", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrWhiteSpace(run.ErrorMessage))
            .Take(8)
            .ToList());
    }

    public async Task<IReadOnlyList<SyncRunSummary>> ListSyncRunsAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select
              id::text,
              source,
              scope,
              status,
              started_at,
              finished_at,
              extract(epoch from (coalesce(finished_at, now()) - started_at))::int as duration_seconds,
              coalesce(message, ''),
              coalesce(error_message, ''),
              coalesce(records_loaded, 0)
            from sync_runs
            order by started_at desc
            limit 100;
            """;

        try
        {
            await using var command = dataSource.CreateCommand(sql);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            var rows = new List<SyncRunSummary>();

            while (await reader.ReadAsync(cancellationToken))
            {
                rows.Add(new SyncRunSummary(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetDateTime(4),
                    reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                    reader.GetInt32(6),
                    reader.GetString(7),
                    reader.GetString(8),
                    reader.GetInt32(9)));
            }

            return rows;
        }
        catch (PostgresException exception) when (exception.SqlState is "42P01" or "42703")
        {
            return [];
        }
    }

    private async Task<long> CountRowsAsync(string tableName, string scope, CancellationToken cancellationToken)
    {
        var sql = tableName == "wiki_entities"
            ? "select count(*) from wiki_entities where domain = @scope"
            : $"select count(*) from {tableName}";

        try
        {
            await using var command = dataSource.CreateCommand(sql);
            if (tableName == "wiki_entities")
            {
                command.Parameters.AddWithValue("scope", scope);
            }

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return result is null ? 0 : Convert.ToInt64(result);
        }
        catch (PostgresException exception) when (exception.SqlState == "42P01")
        {
            return 0;
        }
    }
}
