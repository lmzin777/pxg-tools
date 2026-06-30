using Npgsql;
using NpgsqlTypes;
using PxgTools.Application.Crafts;
using PxgTools.Domain.Crafts;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresCraftReadRepository(NpgsqlDataSource dataSource) : ICraftReadRepository
{
    public async Task<CraftsOverview> ListAsync(CraftQuery query, CancellationToken cancellationToken)
    {
        var sql = """
            select
              c.id,
              c.slug,
              c.item_name,
              c.item_slug,
              c.image_url,
              c.profession_name,
              c.profession_slug,
              c.subprofession_name,
              c.subprofession_slug,
              c.category,
              c.rank_name,
              c.skill,
              c.craft_time,
              c.requirements,
              c.source_page,
              c.source_url
            from crafts c
            where
              (@item is null or c.item_slug = @item or c.item_name ilike @itemLike)
              and (@profession is null or c.profession_slug = @profession or c.profession_name ilike @professionLike)
              and (
                @ingredient is null
                or exists (
                  select 1
                  from craft_ingredients ci
                  where ci.craft_id = c.id
                    and (ci.item_slug = @ingredient or ci.name ilike @ingredientLike)
                )
              )
            order by c.profession_name, c.subprofession_name, c.sort_order, c.item_name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        AddFilter(command, "item", query.Item);
        AddFilter(command, "profession", query.Profession);
        AddFilter(command, "ingredient", query.Ingredient);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<CraftRow>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new CraftRow(
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetString(6),
                reader.GetString(7),
                reader.GetString(8),
                reader.GetString(9),
                reader.GetString(10),
                reader.GetString(11),
                reader.GetString(12),
                reader.GetString(13),
                reader.GetString(14),
                reader.GetString(15)));
        }

        await reader.DisposeAsync();

        var ingredients = await ReadIngredientsAsync(rows.Select(row => row.Id).ToArray(), cancellationToken);
        return new CraftsOverview(rows
            .Select(row => new CraftSummary(
                row.Slug,
                row.ItemName,
                row.ItemSlug,
                row.ImageUrl,
                row.Profession,
                row.ProfessionSlug,
                row.Subprofession,
                row.SubprofessionSlug,
                row.Category,
                row.Rank,
                row.Skill,
                row.CraftTime,
                row.Requirements,
                row.SourcePage,
                row.SourceUrl,
                ingredients.GetValueOrDefault(row.Id, [])))
            .ToList());
    }

    private static void AddFilter(NpgsqlCommand command, string name, string? value)
    {
        object normalized = string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
        command.Parameters.AddWithValue(name, NpgsqlDbType.Text, normalized);
        command.Parameters.AddWithValue($"{name}Like", NpgsqlDbType.Text, normalized is DBNull ? DBNull.Value : $"%{normalized}%");
    }

    private async Task<IReadOnlyDictionary<Guid, IReadOnlyList<CraftIngredient>>> ReadIngredientsAsync(
        Guid[] craftIds,
        CancellationToken cancellationToken)
    {
        if (craftIds.Length == 0)
        {
            return new Dictionary<Guid, IReadOnlyList<CraftIngredient>>();
        }

        const string sql = """
            select craft_id, name, item_slug, quantity, icon_url
            from craft_ingredients
            where craft_id = any(@ids)
            order by craft_id, sort_order, name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("ids", craftIds);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var result = new Dictionary<Guid, List<CraftIngredient>>();

        while (await reader.ReadAsync(cancellationToken))
        {
            var craftId = reader.GetGuid(0);
            if (!result.TryGetValue(craftId, out var ingredients))
            {
                ingredients = [];
                result[craftId] = ingredients;
            }

            ingredients.Add(new CraftIngredient(
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4)));
        }

        return result.ToDictionary(entry => entry.Key, entry => (IReadOnlyList<CraftIngredient>)entry.Value);
    }

    private sealed record CraftRow(
        Guid Id,
        string Slug,
        string ItemName,
        string ItemSlug,
        string ImageUrl,
        string Profession,
        string ProfessionSlug,
        string Subprofession,
        string SubprofessionSlug,
        string Category,
        string Rank,
        string Skill,
        string CraftTime,
        string Requirements,
        string SourcePage,
        string SourceUrl);
}
