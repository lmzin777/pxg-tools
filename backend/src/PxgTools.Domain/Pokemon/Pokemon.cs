namespace PxgTools.Domain.Pokemon;

public sealed record PokemonListItem(
    string Slug,
    int DexNumber,
    string Dex,
    string Name,
    string Generation,
    string SpriteUrl,
    string SourceUrl,
    string Level,
    string Boost,
    string Material,
    IReadOnlyList<string> Elements);

public sealed record PokemonEvolution(
    string Name,
    string Level);

public sealed record PokemonEffectivenessGroup(
    string Category,
    IReadOnlyList<string> Types);

public sealed record PokemonMove(
    string Name,
    string Type,
    string Cooldown,
    string Level,
    string Description);

public sealed record PokemonVersion(
    string Name,
    string Slug,
    string IconUrl,
    string SourceUrl);

public sealed record PokemonDetail(
    string Slug,
    int DexNumber,
    string Dex,
    string Name,
    string Generation,
    string SpriteUrl,
    string DetailSpriteUrl,
    string SourceUrl,
    string Level,
    IReadOnlyList<string> Elements,
    string Abilities,
    string Boost,
    string Material,
    string EvolutionStone,
    IReadOnlyList<PokemonEvolution> Evolutions,
    string Description,
    IReadOnlyList<PokemonEffectivenessGroup> Effectiveness,
    IReadOnlyList<PokemonMove> PvpMoves,
    IReadOnlyList<PokemonMove> PveMoves,
    IReadOnlyList<PokemonVersion> OtherVersions);

public sealed record PokemonOverview(
    IReadOnlyList<string> Generations,
    IReadOnlyList<PokemonListItem> Pokemon);
