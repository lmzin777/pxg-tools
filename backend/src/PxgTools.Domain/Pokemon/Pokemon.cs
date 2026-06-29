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
    IReadOnlyList<string> Elements);

public sealed record PokemonEvolution(
    string Name,
    string Level);

public sealed record PokemonEffectivenessGroup(
    string Category,
    IReadOnlyList<string> Types);

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
    IReadOnlyList<PokemonEffectivenessGroup> Effectiveness);

public sealed record PokemonOverview(
    IReadOnlyList<string> Generations,
    IReadOnlyList<PokemonListItem> Pokemon);
