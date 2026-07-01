using Npgsql;
using NpgsqlTypes;
using PxgTools.Application.Search;
using PxgTools.Domain.Search;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresSearchReadRepository(NpgsqlDataSource dataSource) : ISearchReadRepository
{
    public async Task<SearchOverview> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new SearchOverview([]);
        }

        const string sql = """
            select 'Cla' as type, name as title, slug, '/clans/' || slug as url, icon_url as image_url, summary
            from clans
            where name ilike @queryLike or focus ilike @queryLike or summary ilike @queryLike

            union all

            select 'Profissao' as type, name as title, slug, '/professions/' || slug as url, icon_url as image_url, summary
            from professions
            where name ilike @queryLike or summary ilike @queryLike

            union all

            select 'Pokemon' as type, name as title, slug, '/pokedex/' || slug as url, sprite_url as image_url, description as summary
            from pokemon
            where name ilike @queryLike or dex_label ilike @queryLike or generation_name ilike @queryLike or description ilike @queryLike

            union all

            select 'Item' as type, i.name as title, i.slug, '/items/detail/' || i.slug as url, i.icon_url as image_url, i.description as summary
            from items i
            join item_categories c on c.id = i.category_id
            where i.name ilike @queryLike or i.description ilike @queryLike or i.section_title ilike @queryLike or c.title ilike @queryLike

            union all

            select 'Craft' as type, item_name as title, slug, '/crafts/' || slug as url, image_url, coalesce(requirements, '') as summary
            from crafts
            where item_name ilike @queryLike or profession_name ilike @queryLike or subprofession_name ilike @queryLike or category ilike @queryLike or rank_name ilike @queryLike

            union all

            select 'Wiki Data' as type, name as title, slug, '/wiki-data/' || domain as url, image_url, summary
            from wiki_entities
            where name ilike @queryLike or summary ilike @queryLike or domain ilike @queryLike

            order by type, title
            limit 80;
            """;

        try
        {
            await using var command = dataSource.CreateCommand(sql);
            command.Parameters.AddWithValue("queryLike", NpgsqlDbType.Text, $"%{query.Trim()}%");
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            var results = new List<SearchResult>();

            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new SearchResult(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetString(4),
                    reader.GetString(5)));
            }

            return new SearchOverview(results);
        }
        catch (PostgresException exception) when (exception.SqlState == "42P01")
        {
            return new SearchOverview([]);
        }
    }
}
