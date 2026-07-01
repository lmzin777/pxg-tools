namespace PxgTools.Domain.Clans;

public sealed record Clan(
    string Slug,
    string Name,
    string Focus,
    string Summary,
    string IconUrl,
    string SourceUrl,
    IReadOnlyList<string> Types);

public sealed record ClanBonus(string Type, string Attack, string Defense);

public sealed record ClanNpcPokemon(string Label, string Pokemon, string Npc, string Location);

public sealed record ClanIconLabel(string Label, string Icon);

public sealed record ClanTierPokemon(
    string Dex,
    string Icon,
    string Name,
    IReadOnlyList<ClanIconLabel> Elements,
    IReadOnlyList<ClanIconLabel> PveRoles,
    IReadOnlyList<ClanIconLabel> PvpRoles,
    IReadOnlyList<ClanIconLabel> Helds);

public sealed record ClanTierGroup(string Tier, IReadOnlyList<ClanTierPokemon> Pokemon);

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
