using Npgsql;
using PxgTools.Application.Clans;
using PxgTools.Domain.Clans;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresClanReadRepository(NpgsqlDataSource dataSource) : IClanReadRepository
{
    public async Task<IReadOnlyList<Clan>> ListAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select c.slug, c.name, c.focus, c.summary, c.source_url,
                   coalesce(array_agg(ct.type_name order by ct.sort_order) filter (where ct.type_name is not null), '{}') as types
            from clans c
            left join clan_types ct on ct.clan_id = c.id
            group by c.id
            order by c.name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var clans = new List<Clan>();

        while (await reader.ReadAsync(cancellationToken))
        {
            clans.Add(new Clan(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetFieldValue<string[]>(5)));
        }

        return clans;
    }

    public async Task<ClanDetail?> GetDetailAsync(string slug, CancellationToken cancellationToken)
    {
        const string clanSql = """
            select id, slug, name, source_url
            from clans
            where slug = @slug;
            """;

        await using var clanCommand = dataSource.CreateCommand(clanSql);
        clanCommand.Parameters.AddWithValue("slug", slug);
        await using var clanReader = await clanCommand.ExecuteReaderAsync(cancellationToken);

        if (!await clanReader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var clanId = clanReader.GetGuid(0);
        var clanSlug = clanReader.GetString(1);
        var clanName = clanReader.GetString(2);
        var sourceUrl = clanReader.GetString(3);
        await clanReader.DisposeAsync();

        return new ClanDetail(
            clanSlug,
            clanName,
            sourceUrl,
            await ReadBonusAsync(clanId, cancellationToken),
            await ReadNpcPokemonAsync(clanId, cancellationToken),
            await ReadTiersAsync(clanId, cancellationToken),
            await ReadRotationAsync(clanId, cancellationToken),
            await ReadPvpExclusiveAsync(clanId, cancellationToken),
            "A exclusividade e aplicada apenas em conteudos PvP. No PvE, o uso e liberado para todos os clas.");
    }

    private async Task<IReadOnlyList<ClanBonus>> ReadBonusAsync(Guid clanId, CancellationToken cancellationToken)
    {
        const string sql = """
            select type_name, attack_bonus, defense_bonus
            from clan_bonus
            where clan_id = @clanId
            order by type_name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("clanId", clanId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<ClanBonus>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new ClanBonus(reader.GetString(0), reader.GetString(1), reader.GetString(2)));
        }

        return rows;
    }

    private async Task<IReadOnlyList<ClanNpcPokemon>> ReadNpcPokemonAsync(Guid clanId, CancellationToken cancellationToken)
    {
        const string sql = """
            select label, pokemon_name, npc_name, location
            from clan_npc_pokemon
            where clan_id = @clanId
            order by sort_order;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("clanId", clanId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<ClanNpcPokemon>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new ClanNpcPokemon(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetString(3)));
        }

        return rows;
    }

    private async Task<IReadOnlyList<ClanTierGroup>> ReadTiersAsync(Guid clanId, CancellationToken cancellationToken)
    {
        const string groupSql = """
            select id, tier_name
            from clan_tier_groups
            where clan_id = @clanId
            order by sort_order;
            """;

        await using var command = dataSource.CreateCommand(groupSql);
        command.Parameters.AddWithValue("clanId", clanId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var groups = new List<(Guid Id, string Name)>();

        while (await reader.ReadAsync(cancellationToken))
        {
            groups.Add((reader.GetGuid(0), reader.GetString(1)));
        }

        await reader.DisposeAsync();

        var result = new List<ClanTierGroup>();
        foreach (var group in groups)
        {
            result.Add(new ClanTierGroup(group.Name, await ReadTierPokemonAsync(group.Id, cancellationToken)));
        }

        return result;
    }

    private async Task<IReadOnlyList<ClanTierPokemon>> ReadTierPokemonAsync(Guid groupId, CancellationToken cancellationToken)
    {
        const string sql = """
            select id, dex_number, icon_url, pokemon_name
            from clan_tier_pokemon
            where tier_group_id = @groupId
            order by sort_order;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("groupId", groupId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<(Guid Id, string Dex, string Icon, string Name)>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add((reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetString(3)));
        }

        await reader.DisposeAsync();

        var ids = rows.Select(row => row.Id).ToArray();
        var elements = await ReadIconLabelsAsync("clan_tier_pokemon_elements", ids, cancellationToken);
        var pveRoles = await ReadIconLabelsAsync("clan_tier_pokemon_pve_roles", ids, cancellationToken);
        var pvpRoles = await ReadIconLabelsAsync("clan_tier_pokemon_pvp_roles", ids, cancellationToken);
        var helds = await ReadIconLabelsAsync("clan_tier_pokemon_helds", ids, cancellationToken);

        return rows
            .Select(row => new ClanTierPokemon(
                row.Dex,
                row.Icon,
                row.Name,
                elements.GetValueOrDefault(row.Id, []),
                pveRoles.GetValueOrDefault(row.Id, []),
                pvpRoles.GetValueOrDefault(row.Id, []),
                helds.GetValueOrDefault(row.Id, [])))
            .ToList();
    }

    private async Task<Dictionary<Guid, IReadOnlyList<ClanIconLabel>>> ReadIconLabelsAsync(
        string tableName,
        Guid[] tierPokemonIds,
        CancellationToken cancellationToken)
    {
        if (tierPokemonIds.Length == 0)
        {
            return [];
        }

        var sql = $"""
            select tier_pokemon_id, label, icon_url
            from {tableName}
            where tier_pokemon_id = any(@ids)
            order by tier_pokemon_id, sort_order;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("ids", tierPokemonIds);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new Dictionary<Guid, List<ClanIconLabel>>();

        while (await reader.ReadAsync(cancellationToken))
        {
            var tierPokemonId = reader.GetGuid(0);
            if (!rows.TryGetValue(tierPokemonId, out var labels))
            {
                labels = [];
                rows[tierPokemonId] = labels;
            }

            labels.Add(new ClanIconLabel(reader.GetString(1), reader.GetString(2)));
        }

        return rows.ToDictionary(row => row.Key, row => (IReadOnlyList<ClanIconLabel>)row.Value);
    }

    private async Task<IReadOnlyList<ClanRotationGroup>> ReadRotationAsync(Guid clanId, CancellationToken cancellationToken)
    {
        const string groupSql = """
            select id, element_name
            from clan_rotation_groups
            where clan_id = @clanId
            order by sort_order;
            """;

        await using var command = dataSource.CreateCommand(groupSql);
        command.Parameters.AddWithValue("clanId", clanId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var groups = new List<(Guid Id, string Element)>();

        while (await reader.ReadAsync(cancellationToken))
        {
            groups.Add((reader.GetGuid(0), reader.GetString(1)));
        }

        await reader.DisposeAsync();

        var result = new List<ClanRotationGroup>();
        foreach (var group in groups)
        {
            result.Add(new ClanRotationGroup(group.Element, await ReadRotationRowsAsync(group.Id, cancellationToken)));
        }

        return result;
    }

    private async Task<IReadOnlyList<ClanRotationPokemon>> ReadRotationRowsAsync(Guid groupId, CancellationToken cancellationToken)
    {
        const string sql = """
            select pokemon_name, role_name, role_icon_url, tier
            from clan_rotation_pokemon
            where rotation_group_id = @groupId
            order by sort_order;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("groupId", groupId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<ClanRotationPokemon>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new ClanRotationPokemon(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetString(3)));
        }

        return rows;
    }

    private async Task<IReadOnlyList<string>> ReadPvpExclusiveAsync(Guid clanId, CancellationToken cancellationToken)
    {
        const string sql = """
            select pokemon_name
            from clan_pvp_exclusive_pokemon
            where clan_id = @clanId
            order by sort_order;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("clanId", clanId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<string>();

        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(reader.GetString(0));
        }

        return rows;
    }
}
