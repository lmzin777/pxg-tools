export type Clan = {
  slug: string;
  name: string;
  focus: string;
  summary: string;
  iconUrl: string;
  sourceUrl: string;
  types: string[];
};

export type ClanBonus = {
  type: string;
  attack: string;
  defense: string;
};

export type ClanNpcPokemon = {
  label: string;
  pokemon: string;
  npc: string;
  location: string;
};

export type ClanIconLabel = {
  label: string;
  icon: string;
};

export type ClanTierPokemon = {
  dex: string;
  icon: string;
  name: string;
  elements: ClanIconLabel[];
  pveRoles: ClanIconLabel[];
  pvpRoles: ClanIconLabel[];
  helds: ClanIconLabel[];
};

export type ClanTierGroup = {
  tier: string;
  pokemon: ClanTierPokemon[];
};

export type ClanRotationPokemon = {
  pokemon: string;
  role: string;
  roleIcon: string;
  tier: string;
};

export type ClanRotationGroup = {
  element: string;
  rows: ClanRotationPokemon[];
};

export type ClanDetail = {
  slug: string;
  name: string;
  sourceUrl: string;
  bonus: ClanBonus[];
  npcPokemon: ClanNpcPokemon[];
  tiers: ClanTierGroup[];
  rotation: ClanRotationGroup[];
  pvpExclusive: string[];
  pvpNote: string;
};
