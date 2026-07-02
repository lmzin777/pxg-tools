export type PokemonListItem = {
  slug: string;
  dexNumber: number;
  dex: string;
  name: string;
  generation: string;
  spriteUrl: string;
  sourceUrl: string;
  level: string;
  boost: string;
  material: string;
  elements: string[];
  clanNames?: string[];
};

export type PokemonEvolution = {
  name: string;
  level: string;
};

export type PokemonEffectivenessGroup = {
  category: string;
  types: string[];
};

export type PokemonMove = {
  name: string;
  type: string;
  cooldown: string;
  level: string;
  description: string;
  icons: PokemonMoveIcon[];
};

export type PokemonMoveIcon = {
  label: string;
  iconUrl: string;
};

export type PokemonVersion = {
  name: string;
  slug: string;
  iconUrl: string;
  sourceUrl: string;
};

export type PokemonLootItem = {
  itemName: string;
  itemNameEn: string;
  itemNamePtBr: string;
  itemSlug: string;
  iconUrl: string;
  category: string;
  sourceUrl: string;
  pokemonName: string;
  pokemonSlug: string;
  isVariant: boolean;
};

export type PokemonDetail = PokemonListItem & {
  detailSpriteUrl: string;
  abilities: string;
  boost: string;
  material: string;
  evolutionStone: string;
  evolutions: PokemonEvolution[];
  description: string;
  effectiveness: PokemonEffectivenessGroup[];
  moves?: PokemonMove[];
  pvpMoves: PokemonMove[];
  pveMoves: PokemonMove[];
  otherVersions: PokemonVersion[];
  loot?: PokemonLootItem[];
};

export type PokemonOverview = {
  generations: string[];
  pokemon: PokemonListItem[];
};
