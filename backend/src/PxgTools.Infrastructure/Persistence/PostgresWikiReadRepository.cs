using System.Text.Json;
using Npgsql;
using PxgTools.Application.Wiki;
using PxgTools.Domain.Wiki;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresWikiReadRepository(NpgsqlDataSource dataSource) : IWikiReadRepository
{
    private static readonly WikiDomainSummary[] FallbackDomains =
    [
        Domain("helds", "Helds", "Held items e informacoes relacionadas.", 1),
        Domain("bosses", "Bosses", "Bosses, recompensas e locais.", 2),
        Domain("dungeons", "Dungeons", "Dungeons e informacoes de entrada.", 3),
        Domain("quests", "Quests", "Quests relevantes da Wiki.", 4),
        Domain("npcs", "NPCs", "NPCs, localizacao e funcoes.", 5),
        Domain("berries", "Berries", "Berries e efeitos.", 6),
        Domain("addons", "Addons", "Addons de Pokemon.", 7),
        Domain("outfits", "Outfits", "Outfits de jogadores.", 8),
        Domain("tasks", "Tasks", "Tasks e recompensas.", 9),
        Domain("respawns", "Respawns", "Respawns e rotas.", 10),
        Domain("mapas", "Mapas", "Mapas e coordenadas.", 11),
    ];

    public async Task<WikiDomainsOverview> ListDomainsAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select
              d.domain,
              d.title,
              d.description,
              d.priority,
              d.source_url,
              d.scraper_script,
              d.loader_script,
              d.status,
              d.updated_at,
              count(e.id) as record_count
            from wiki_domains d
            left join wiki_entities e on e.domain = d.domain
            group by d.domain, d.title, d.description, d.priority, d.source_url, d.scraper_script, d.loader_script, d.status, d.updated_at
            order by d.priority, d.title;
            """;

        try
        {
            await using var command = dataSource.CreateCommand(sql);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            var rows = new List<WikiDomainSummary>();

            while (await reader.ReadAsync(cancellationToken))
            {
                rows.Add(ReadDomain(reader));
            }

            return new WikiDomainsOverview(rows);
        }
        catch (PostgresException exception) when (exception.SqlState == "42P01")
        {
            return new WikiDomainsOverview(FallbackDomains);
        }
    }

    public async Task<WikiDomainDetail?> GetDomainAsync(string domain, CancellationToken cancellationToken)
    {
        var overview = await ListDomainsAsync(cancellationToken);
        var summary = overview.Domains.FirstOrDefault(item => item.Domain.Equals(domain, StringComparison.OrdinalIgnoreCase));
        if (summary is null)
        {
            return null;
        }

        var entities = await ListEntitiesAsync(summary.Domain, cancellationToken);
        return new WikiDomainDetail(
            summary.Domain,
            summary.Title,
            summary.Description,
            summary.Priority,
            summary.SourceUrl,
            summary.ScraperScript,
            summary.LoaderScript,
            summary.Status,
            summary.UpdatedAt,
            summary.RecordCount,
            entities);
    }

    private async Task<IReadOnlyList<WikiEntitySummary>> ListEntitiesAsync(string domain, CancellationToken cancellationToken)
    {
        const string sql = """
            select slug, name, summary, image_url, source_url, scraped_at, metadata_json
            from wiki_entities
            where domain = @domain
            order by sort_order, name
            limit 500;
            """;

        try
        {
            await using var command = dataSource.CreateCommand(sql);
            command.Parameters.AddWithValue("domain", domain);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            var rows = new List<WikiEntitySummary>();

            while (await reader.ReadAsync(cancellationToken))
            {
                rows.Add(new WikiEntitySummary(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetString(4),
                    reader.GetDateTime(5),
                    JsonSerializer.Deserialize<Dictionary<string, string>>(reader.GetString(6)) ?? []));
            }

            return rows;
        }
        catch (PostgresException exception) when (exception.SqlState == "42P01")
        {
            return [];
        }
    }

    private static WikiDomainSummary ReadDomain(NpgsqlDataReader reader)
    {
        return new WikiDomainSummary(
            reader.GetString(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetInt32(3),
            reader.GetString(4),
            reader.GetString(5),
            reader.GetString(6),
            reader.GetString(7),
            reader.GetDateTime(8),
            reader.GetInt64(9));
    }

    private static WikiDomainSummary Domain(string domain, string title, string description, int priority)
    {
        return new WikiDomainSummary(
            domain,
            title,
            description,
            priority,
            $"https://wiki.pokexgames.com/index.php/{Uri.EscapeDataString(title)}",
            $"scrape:{domain}",
            $"db:load-wiki -- {domain}",
            "planned",
            DateTimeOffset.UtcNow,
            0);
    }
}
