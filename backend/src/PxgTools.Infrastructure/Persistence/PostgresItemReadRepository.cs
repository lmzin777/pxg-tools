using Npgsql;
using PxgTools.Application.Items;
using PxgTools.Domain.Items;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresItemReadRepository(NpgsqlDataSource dataSource) : IItemReadRepository
{
    public async Task<ItemsOverview> ListAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select
              c.slug,
              c.title,
              c.group_name,
              c.summary,
              c.icon_url,
              c.source_url,
              count(i.id)::int as item_count
            from item_categories c
            left join items i on i.category_id = c.id
            group by c.id
            order by c.sort_order, c.title;
            """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var categories = new List<ItemCategorySummary>();

        while (await reader.ReadAsync(cancellationToken))
        {
            categories.Add(new ItemCategorySummary(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetInt32(6)));
        }

        return new ItemsOverview(categories);
    }

    public async Task<ItemCategoryDetail?> GetCategoryAsync(string slug, CancellationToken cancellationToken)
    {
        const string sql = """
            select id, slug, title, group_name, summary, icon_url, source_url
            from item_categories
            where slug = @slug;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("slug", slug);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var categoryId = reader.GetGuid(0);
        var category = new
        {
            Slug = reader.GetString(1),
            Title = reader.GetString(2),
            Group = reader.GetString(3),
            Summary = reader.GetString(4),
            IconUrl = reader.GetString(5),
            SourceUrl = reader.GetString(6),
        };
        await reader.DisposeAsync();

        return new ItemCategoryDetail(
            category.Slug,
            category.Title,
            category.Group,
            category.Summary,
            category.IconUrl,
            category.SourceUrl,
            await ReadSectionsAsync(categoryId, cancellationToken),
            await ReadItemsAsync(categoryId, cancellationToken));
    }

    public async Task<ItemDetail?> GetItemAsync(string slug, CancellationToken cancellationToken)
    {
        const string sql = """
            select
              i.id,
              i.slug,
              i.name,
              i.icon_url,
              i.description,
              i.section_title,
              i.table_title,
              i.source_url,
              c.slug,
              c.title,
              c.group_name
            from items i
            join item_categories c on c.id = i.category_id
            where i.slug = @slug
            limit 1;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("slug", slug);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var itemId = reader.GetGuid(0);
        var item = new
        {
            Slug = reader.GetString(1),
            Name = reader.GetString(2),
            IconUrl = reader.GetString(3),
            Description = reader.GetString(4),
            Section = reader.GetString(5),
            Table = reader.GetString(6),
            SourceUrl = reader.GetString(7),
            CategorySlug = reader.GetString(8),
            CategoryTitle = reader.GetString(9),
            CategoryGroup = reader.GetString(10),
        };
        await reader.DisposeAsync();

        var attributes = await ReadAttributesAsync([itemId], cancellationToken);
        return new ItemDetail(
            item.Slug,
            item.Name,
            item.IconUrl,
            item.Description,
            item.Section,
            item.Table,
            item.SourceUrl,
            item.CategorySlug,
            item.CategoryTitle,
            item.CategoryGroup,
            attributes.GetValueOrDefault(itemId, []));
    }

    private async Task<IReadOnlyList<ItemCategorySection>> ReadSectionsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        const string sql = """
            select title, anchor, level
            from item_category_sections
            where category_id = @categoryId
            order by sort_order, title;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("categoryId", categoryId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var sections = new List<ItemCategorySection>();

        while (await reader.ReadAsync(cancellationToken))
        {
            sections.Add(new ItemCategorySection(reader.GetString(0), reader.GetString(1), reader.GetInt32(2)));
        }

        return sections;
    }

    private async Task<IReadOnlyList<ItemSummary>> ReadItemsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        const string sql = """
            select id, slug, name, icon_url, description, section_title, table_title, source_url
            from items
            where category_id = @categoryId
            order by sort_order, name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("categoryId", categoryId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<(Guid Id, string Slug, string Name, string IconUrl, string Description, string Section, string Table, string SourceUrl)>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add((
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetString(6),
                reader.GetString(7)));
        }

        await reader.DisposeAsync();

        var attributes = await ReadAttributesAsync(rows.Select(row => row.Id).ToArray(), cancellationToken);
        return rows
            .Select(row => new ItemSummary(
                row.Slug,
                row.Name,
                row.IconUrl,
                row.Description,
                row.Section,
                row.Table,
                row.SourceUrl,
                attributes.GetValueOrDefault(row.Id, [])))
            .ToList();
    }

    private async Task<IReadOnlyDictionary<Guid, IReadOnlyList<ItemAttribute>>> ReadAttributesAsync(
        Guid[] itemIds,
        CancellationToken cancellationToken)
    {
        if (itemIds.Length == 0)
        {
            return new Dictionary<Guid, IReadOnlyList<ItemAttribute>>();
        }

        const string sql = """
            select item_id, name, value
            from item_attributes
            where item_id = any(@ids)
            order by item_id, sort_order, name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("ids", itemIds);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var result = new Dictionary<Guid, List<ItemAttribute>>();

        while (await reader.ReadAsync(cancellationToken))
        {
            var itemId = reader.GetGuid(0);
            if (!result.TryGetValue(itemId, out var attributes))
            {
                attributes = [];
                result[itemId] = attributes;
            }

            attributes.Add(new ItemAttribute(reader.GetString(1), reader.GetString(2)));
        }

        return result.ToDictionary(entry => entry.Key, entry => (IReadOnlyList<ItemAttribute>)entry.Value);
    }
}
