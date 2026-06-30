export type PokemonListItem = {
  slug: string;
  dexNumber: number;
  dex: string;
  name: string;
  generation: string;
  spriteUrl: string;
  sourceUrl: string;
  level: string;
  elements: string[];
};

export type PokemonEvolution = {
  name: string;
  level: string;
};

export type PokemonEffectivenessGroup = {
  category: string;
  types: string[];
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
};

export type PokemonOverview = {
  generations: string[];
  pokemon: PokemonListItem[];
};
