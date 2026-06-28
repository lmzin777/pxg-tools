namespace PxgTools.Domain.Clans;

public sealed record Clan(
    string Slug,
    string Name,
    string Focus,
    string Summary,
    string SourceUrl,
    IReadOnlyList<string> Types);

public sealed record ClanBonus(string Type, string Attack, string Defense);

public sealed record ClanNpcPokemon(string Label, string Pokemon, string Npc, string Location);

public sealed record ClanTierGroup(string Tier, IReadOnlyList<string> Pokemon);

public sealed record ClanRotationPokemon(string Pokemon, string Role, string RoleIcon, string Tier);

public sealed record ClanRotationGroup(string Element, IReadOnlyList<ClanRotationPokemon> Rows);

public sealed record ClanDetail(
    string Slug,
    string Name,
    string SourceUrl,
    IReadOnlyList<ClanBonus> Bonus,
    IReadOnlyList<ClanNpcPokemon> NpcPokemon,
    IReadOnlyList<ClanTierGroup> Tiers,
    IReadOnlyList<ClanRotationGroup> Rotation,
    IReadOnlyList<string> PvpExclusive,
    string PvpNote);
