using Npgsql;
using PxgTools.Application.Pokemon;
using PxgTools.Domain.Pokemon;

namespace PxgTools.Infrastructure.Persistence;

public sealed class PostgresPokemonReadRepository(NpgsqlDataSource dataSource) : IPokemonReadRepository
{
    public async Task<PokemonOverview> ListAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select
              p.slug,
              p.dex_number,
              p.dex_label,
              p.name,
              p.generation_name,
              p.sprite_url,
              p.source_url,
              p.required_level,
              coalesce(array_agg(pe.type_name order by pe.sort_order) filter (where pe.type_name is not null), '{}') as elements
            from pokemon p
            left join pokemon_elements pe on pe.pokemon_id = p.id
            group by p.id
            order by p.sort_order, p.dex_number, p.name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var pokemon = new List<PokemonListItem>();
        var generations = new List<string>();

        while (await reader.ReadAsync(cancellationToken))
        {
            var generation = reader.GetString(4);
            if (!generations.Contains(generation))
            {
                generations.Add(generation);
            }

            pokemon.Add(new PokemonListItem(
                reader.GetString(0),
                reader.GetInt32(1),
                reader.GetString(2),
                reader.GetString(3),
                generation,
                reader.GetString(5),
                reader.GetString(6),
                reader.GetString(7),
                reader.GetFieldValue<string[]>(8)));
        }

        return new PokemonOverview(generations, pokemon);
    }

    public async Task<PokemonDetail?> GetDetailAsync(string slug, CancellationToken cancellationToken)
    {
        const string sql = """
            select
              p.id,
              p.slug,
              p.dex_number,
              p.dex_label,
              p.name,
              p.generation_name,
              p.sprite_url,
              p.detail_sprite_url,
              p.source_url,
              p.required_level,
              p.abilities,
              p.boost,
              p.material,
              p.evolution_stone,
              p.description,
              coalesce(array_agg(pe.type_name order by pe.sort_order) filter (where pe.type_name is not null), '{}') as elements
            from pokemon p
            left join pokemon_elements pe on pe.pokemon_id = p.id
            where p.slug = @slug
            group by p.id;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("slug", slug);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var pokemonId = reader.GetGuid(0);
        var detail = new
        {
            Slug = reader.GetString(1),
            DexNumber = reader.GetInt32(2),
            Dex = reader.GetString(3),
            Name = reader.GetString(4),
            Generation = reader.GetString(5),
            SpriteUrl = reader.GetString(6),
            DetailSpriteUrl = reader.GetString(7),
            SourceUrl = reader.GetString(8),
            Level = reader.GetString(9),
            Abilities = reader.GetString(10),
            Boost = reader.GetString(11),
            Material = reader.GetString(12),
            EvolutionStone = reader.GetString(13),
            Description = reader.GetString(14),
            Elements = reader.GetFieldValue<string[]>(15),
        };
        await reader.DisposeAsync();

        return new PokemonDetail(
            detail.Slug,
            detail.DexNumber,
            detail.Dex,
            detail.Name,
            detail.Generation,
            detail.SpriteUrl,
            detail.DetailSpriteUrl,
            detail.SourceUrl,
            detail.Level,
            detail.Elements,
            detail.Abilities,
            detail.Boost,
            detail.Material,
            detail.EvolutionStone,
            await ReadEvolutionsAsync(pokemonId, cancellationToken),
            detail.Description,
            await ReadEffectivenessAsync(pokemonId, cancellationToken));
    }

    private async Task<IReadOnlyList<PokemonEvolution>> ReadEvolutionsAsync(Guid pokemonId, CancellationToken cancellationToken)
    {
        const string sql = """
            select pokemon_name, required_level
            from pokemon_evolutions
            where pokemon_id = @pokemonId
            order by sort_order, pokemon_name;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("pokemonId", pokemonId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var evolutions = new List<PokemonEvolution>();

        while (await reader.ReadAsync(cancellationToken))
        {
            evolutions.Add(new PokemonEvolution(reader.GetString(0), reader.GetString(1)));
        }

        return evolutions;
    }

    private async Task<IReadOnlyList<PokemonEffectivenessGroup>> ReadEffectivenessAsync(Guid pokemonId, CancellationToken cancellationToken)
    {
        const string sql = """
            select category, array_agg(type_name order by sort_order, type_name) as types
            from pokemon_effectiveness
            where pokemon_id = @pokemonId
            group by category
            order by min(sort_order), category;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("pokemonId", pokemonId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var groups = new List<PokemonEffectivenessGroup>();

        while (await reader.ReadAsync(cancellationToken))
        {
            groups.Add(new PokemonEffectivenessGroup(reader.GetString(0), reader.GetFieldValue<string[]>(1)));
        }

        return groups;
    }
}
