using Npgsql;
using PxgTools.Application.Professions;
using PxgTools.Domain.Professions;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresProfessionReadRepository(NpgsqlDataSource dataSource) : IProfessionReadRepository
{
    public async Task<ProfessionsOverview> ListAsync(CancellationToken cancellationToken)
    {
        const string professionsSql = """
            select slug, name, summary, icon_url, source_url
            from professions
            order by sort_order, name;
            """;

        await using var professionsCommand = dataSource.CreateCommand(professionsSql);
        await using var professionsReader = await professionsCommand.ExecuteReaderAsync(cancellationToken);
        var professions = new List<ProfessionSummary>();

        while (await professionsReader.ReadAsync(cancellationToken))
        {
            professions.Add(new ProfessionSummary(
                professionsReader.GetString(0),
                professionsReader.GetString(1),
                professionsReader.GetString(2),
                professionsReader.GetString(3),
                professionsReader.GetString(4)));
        }

        return new ProfessionsOverview(professions, await ReadRelatedLinksAsync(cancellationToken));
    }

    public async Task<ProfessionDetail?> GetDetailAsync(string slug, CancellationToken cancellationToken)
    {
        const string professionSql = """
            select id, slug, name, summary, icon_url, source_url
            from professions
            where slug = @slug;
            """;

        await using var professionCommand = dataSource.CreateCommand(professionSql);
        professionCommand.Parameters.AddWithValue("slug", slug);
        await using var reader = await professionCommand.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var professionId = reader.GetGuid(0);
        var professionSlug = reader.GetString(1);
        var name = reader.GetString(2);
        var summary = reader.GetString(3);
        var iconUrl = reader.GetString(4);
        var sourceUrl = reader.GetString(5);
        await reader.DisposeAsync();

        var links = await ReadProfessionLinksAsync(professionId, cancellationToken);

        return new ProfessionDetail(
            professionSlug,
            name,
            summary,
            iconUrl,
            sourceUrl,
            await ReadSectionsAsync("profession_sections", "profession_id", professionId, cancellationToken),
            links.Where(link => link.Kind == "craft").ToList(),
            links.Where(link => link.Kind == "specialization").ToList(),
            links.Where(link => link.Kind != "craft" && link.Kind != "specialization").ToList());
    }

    private async Task<IReadOnlyList<ProfessionLink>> ReadProfessionLinksAsync(Guid professionId, CancellationToken cancellationToken)
    {
        const string sql = """
            select id, slug, title, kind, summary, icon_url, source_url
            from profession_links
            where profession_id = @professionId
            order by sort_order, title;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("professionId", professionId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<(Guid Id, string Slug, string Title, string Kind, string Summary, string IconUrl, string SourceUrl)>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add((
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetString(6)));
        }

        await reader.DisposeAsync();

        var result = new List<ProfessionLink>();
        foreach (var row in rows)
        {
            result.Add(new ProfessionLink(
                row.Slug,
                row.Title,
                row.Kind,
                row.Summary,
                row.IconUrl,
                row.SourceUrl,
                await ReadSectionsAsync("profession_link_sections", "profession_link_id", row.Id, cancellationToken)));
        }

        return result;
    }

    private async Task<IReadOnlyList<ProfessionLink>> ReadRelatedLinksAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select slug, title, kind, summary, icon_url, source_url
            from profession_related_links
            order by sort_order, title;
            """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<ProfessionLink>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new ProfessionLink(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                []));
        }

        return rows;
    }

    private async Task<IReadOnlyList<ProfessionSection>> ReadSectionsAsync(
        string tableName,
        string keyColumn,
        Guid ownerId,
        CancellationToken cancellationToken)
    {
        var sql = $"""
            select title, anchor, level
            from {tableName}
            where {keyColumn} = @ownerId
            order by sort_order, title;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("ownerId", ownerId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var sections = new List<ProfessionSection>();

        while (await reader.ReadAsync(cancellationToken))
        {
            sections.Add(new ProfessionSection(reader.GetString(0), reader.GetString(1), reader.GetInt32(2)));
        }

        return sections;
    }
}
