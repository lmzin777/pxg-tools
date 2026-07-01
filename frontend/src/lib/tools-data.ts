export const pokemonTypes = [
  'Normal',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
  'Crystal',
] as const;

export type PokemonType = (typeof pokemonTypes)[number];

export const typeIconFiles: Record<PokemonType, string> = {
  Fighting: '01_fighting_circle.png',
  Psychic: '02_psychic_circle.png',
  Poison: '03_poison_circle.png',
  Dragon: '04_dragon_circle.png',
  Ghost: '05_ghost_circle.png',
  Dark: '06_dark_circle.png',
  Ground: '07_ground_circle.png',
  Fire: '08_fire_circle.png',
  Fairy: '09_fairy_circle.png',
  Water: '10_water_circle.png',
  Flying: '11_flying_circle.png',
  Normal: '12_normal_circle.png',
  Rock: '13_rock_circle.png',
  Electric: '14_electric_circle.png',
  Bug: '15_bug_circle.png',
  Grass: '16_grass_circle.png',
  Ice: '17_ice_circle.png',
  Steel: '18_steel_circle.png',
  Crystal: '19_crystal_circle.png',
};

const typeAliases: Record<string, PokemonType> = {
  normal: 'Normal',
  fire: 'Fire',
  fogo: 'Fire',
  water: 'Water',
  agua: 'Water',
  grass: 'Grass',
  planta: 'Grass',
  electric: 'Electric',
  eletrico: 'Electric',
  ice: 'Ice',
  gelo: 'Ice',
  fighting: 'Fighting',
  lutador: 'Fighting',
  poison: 'Poison',
  posion: 'Poison',
  veneno: 'Poison',
  ground: 'Ground',
  terra: 'Ground',
  flying: 'Flying',
  voador: 'Flying',
  psychic: 'Psychic',
  psiquico: 'Psychic',
  bug: 'Bug',
  inseto: 'Bug',
  rock: 'Rock',
  pedra: 'Rock',
  ghost: 'Ghost',
  fantasma: 'Ghost',
  dragon: 'Dragon',
  dragao: 'Dragon',
  dark: 'Dark',
  noturno: 'Dark',
  steel: 'Steel',
  metal: 'Steel',
  fairy: 'Fairy',
  fada: 'Fairy',
  crystal: 'Crystal',
  cristal: 'Crystal',
};

function normalizeTypeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function canonicalPokemonType(value: string): PokemonType | null {
  return typeAliases[normalizeTypeText(value)] || null;
}

export function parsePokemonTypes(value: string) {
  return value
    .split(/&|\/|,/)
    .map((part) => canonicalPokemonType(part))
    .filter((type): type is PokemonType => Boolean(type));
}

export function getTypeIconSrc(value: string) {
  const type = canonicalPokemonType(value);
  return type ? `/assets/type-icons/${typeIconFiles[type]}` : '';
}

type TypeRules = {
  superEffective?: PokemonType[];
  resisted?: PokemonType[];
  noEffect?: PokemonType[];
};

const typeRules: Record<PokemonType, TypeRules> = {
  Normal: {
    resisted: ['Rock', 'Steel', 'Crystal'],
    noEffect: ['Ghost'],
  },
  Fire: {
    superEffective: ['Grass', 'Ice', 'Bug', 'Steel', 'Crystal'],
    resisted: ['Fire', 'Water', 'Rock', 'Dragon'],
  },
  Water: {
    superEffective: ['Fire', 'Ground', 'Rock'],
    resisted: ['Water', 'Grass', 'Dragon', 'Crystal'],
  },
  Grass: {
    superEffective: ['Water', 'Ground', 'Rock', 'Crystal'],
    resisted: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
  },
  Electric: {
    superEffective: ['Water', 'Flying'],
    resisted: ['Grass', 'Electric', 'Dragon'],
    noEffect: ['Ground', 'Crystal'],
  },
  Ice: {
    superEffective: ['Grass', 'Ground', 'Flying', 'Dragon'],
    resisted: ['Fire', 'Water', 'Ice', 'Steel', 'Crystal'],
  },
  Fighting: {
    superEffective: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel', 'Crystal'],
    resisted: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
    noEffect: ['Ghost'],
  },
  Poison: {
    superEffective: ['Grass', 'Fairy', 'Crystal'],
    resisted: ['Poison', 'Ground', 'Rock', 'Ghost'],
    noEffect: ['Steel'],
  },
  Ground: {
    superEffective: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel', 'Crystal'],
    resisted: ['Grass', 'Bug'],
    noEffect: ['Flying'],
  },
  Flying: {
    superEffective: ['Grass', 'Fighting', 'Bug'],
    resisted: ['Electric', 'Rock', 'Steel', 'Crystal'],
  },
  Psychic: {
    superEffective: ['Fighting', 'Poison'],
    resisted: ['Psychic', 'Steel', 'Crystal'],
    noEffect: ['Dark'],
  },
  Bug: {
    superEffective: ['Grass', 'Psychic', 'Dark'],
    resisted: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
  },
  Rock: {
    superEffective: ['Fire', 'Ice', 'Flying', 'Bug'],
    resisted: ['Fighting', 'Ground', 'Steel', 'Crystal'],
  },
  Ghost: {
    superEffective: ['Psychic', 'Ghost'],
    resisted: ['Dark'],
    noEffect: ['Normal'],
  },
  Dragon: {
    superEffective: ['Dragon'],
    resisted: ['Steel', 'Crystal'],
    noEffect: ['Fairy'],
  },
  Dark: {
    superEffective: ['Psychic', 'Ghost'],
    resisted: ['Fighting', 'Dark', 'Fairy'],
  },
  Steel: {
    superEffective: ['Ice', 'Rock', 'Fairy', 'Crystal'],
    resisted: ['Fire', 'Water', 'Electric', 'Steel'],
  },
  Fairy: {
    superEffective: ['Fighting', 'Dragon', 'Dark'],
    resisted: ['Fire', 'Poison', 'Steel'],
  },
  Crystal: {},
};

export function getTypeMultiplier(attackType: PokemonType, defenseType: PokemonType) {
  const rules = typeRules[attackType];
  if (rules.noEffect?.includes(defenseType)) return 0;
  if (rules.superEffective?.includes(defenseType)) return 2;
  if (rules.resisted?.includes(defenseType)) return 0.5;
  return 1;
}

export function getCombinedMultiplier(attackType: PokemonType, defenseTypes: PokemonType[]) {
  return defenseTypes.reduce(
    (multiplier, defenseType) => multiplier * getTypeMultiplier(attackType, defenseType),
    1,
  );
}

export const elementalBallByType: Partial<Record<PokemonType, string>> = {
  Dark: 'Moon Ball',
  Ghost: 'Moon Ball',
  Electric: 'Tinker Ball',
  Steel: 'Tinker Ball',
  Ice: 'Sora Ball',
  Flying: 'Sora Ball',
  Rock: 'Dusk Ball',
  Fighting: 'Dusk Ball',
  Normal: 'Yume Ball',
  Psychic: 'Yume Ball',
  Dragon: 'Tale Ball',
  Fairy: 'Tale Ball',
  Crystal: 'Tale Ball',
  Bug: 'Net Ball',
  Water: 'Net Ball',
  Poison: 'Janguru Ball',
  Grass: 'Janguru Ball',
  Fire: 'Magu Ball',
  Ground: 'Magu Ball',
};

export const ballIconFiles: Record<string, string> = {
  'Poke Ball': 'poke-ball.png',
  'Great Ball': 'great-ball.png',
  'Super Ball': 'super-ball.png',
  'Ultra Ball': 'ultra-ball.png',
  'Moon Ball': 'moon-ball.png',
  'Tinker Ball': 'tinker-ball.png',
  'Sora Ball': 'sora-ball.png',
  'Dusk Ball': 'dusk-ball.png',
  'Yume Ball': 'yume-ball.png',
  'Tale Ball': 'tale-ball.png',
  'Net Ball': 'net-ball.png',
  'Janguru Ball': 'janguru-ball.png',
  'Magu Ball': 'magu-ball.png',
  'Fast Ball': 'fast-ball.png',
  'Heavy Ball': 'heavy-ball.png',
  'Premier Ball': 'premier-ball.png',
  'Nightmare Ball': 'nightmare-ball.png',
  'Beast Ball': 'beast-ball.png',
};

export function getBallIconSrc(ballName: string) {
  const fileName = ballIconFiles[ballName];
  return fileName ? `/assets/ball-icons/${fileName}` : '';
}

export const ballCatalog = [
  { name: 'Poke Ball', bestFor: 'Universal', rate: '1x' },
  { name: 'Great Ball', bestFor: 'Universal', rate: '2x' },
  { name: 'Super Ball', bestFor: 'Universal', rate: '3x' },
  { name: 'Ultra Ball', bestFor: 'Universal', rate: '4x' },
  { name: 'Moon Ball', bestFor: 'Dark ou Ghost', rate: '5x' },
  { name: 'Tinker Ball', bestFor: 'Electric ou Steel', rate: '5x' },
  { name: 'Sora Ball', bestFor: 'Ice ou Flying', rate: '5x' },
  { name: 'Dusk Ball', bestFor: 'Rock ou Fighting', rate: '5x' },
  { name: 'Yume Ball', bestFor: 'Normal ou Psychic', rate: '5x' },
  { name: 'Tale Ball', bestFor: 'Dragon, Fairy ou Crystal', rate: '5x' },
  { name: 'Net Ball', bestFor: 'Bug ou Water', rate: '5x' },
  { name: 'Janguru Ball', bestFor: 'Poison ou Grass', rate: '5x' },
  { name: 'Magu Ball', bestFor: 'Fire ou Ground', rate: '5x' },
  { name: 'Fast Ball', bestFor: 'Pokemon rapidos', rate: '5x' },
  { name: 'Heavy Ball', bestFor: 'Pokemon pesados', rate: '5x' },
  { name: 'Premier Ball', bestFor: 'Universal + aura', rate: '4x' },
  { name: 'Nightmare Ball', bestFor: 'Nightmare World', rate: '6x' },
  { name: 'Beast Ball', bestFor: 'Pokemon sem facilitacao de captura', rate: '10x' },
];

export const boostTypes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 50] as const;

export function normalizePrice(price: number) {
  return price > 1000 ? price / 1000 : price;
}

export function formatCurrency(value: number) {
  const amount = Math.abs(Number(value) || 0);
  if (amount >= 1000) return `${(amount / 1000).toFixed(2).replace('.', ',')} KK`;
  if (amount > 0) return `${Math.round(amount)} K`;
  return '0 K';
}

export function formatMoneyLabel(value: number) {
  return `$${Math.ceil(Math.abs(value || 0) / 1000)}k`;
}

function useCommonStone(requiredStones: number, stonePrice: number, boostStonePrice: number) {
  if (boostStonePrice <= 0) return true;
  return requiredStones * stonePrice < boostStonePrice;
}

export function calculateBoostCost(input: {
  currentBoost: number;
  targetBoost: number;
  boostType: number;
  stonePrice: number;
  boostStonePrice: number;
  useSpecial: boolean;
}) {
  const stonePrice = normalizePrice(input.stonePrice);
  const boostStonePrice = normalizePrice(input.boostStonePrice);
  let commonStones = 0;
  let boostStones = 0;
  const boostStoneLevels: number[] = [];

  if (input.currentBoost > input.targetBoost) {
    return { error: 'O boost atual nao pode ser maior que o boost desejado.' };
  }

  if (input.currentBoost === input.targetBoost) {
    return { commonStones, boostStones, boostStoneLevels, totalStoneCost: 0, totalBoostCost: 0, totalCost: 0 };
  }

  let stonesPerBoost = input.useSpecial ? 1 : 0;
  const start = input.useSpecial ? 1 : 0;
  for (let level = start; level <= input.currentBoost; level += 1) {
    if (input.useSpecial && level < 10) continue;
    if (level % input.boostType === 0) stonesPerBoost += 1;
  }

  for (let level = input.currentBoost + 1; level <= input.targetBoost; level += 1) {
    if (input.useSpecial && level < 10 && level % 2 !== 0) continue;

    if (useCommonStone(stonesPerBoost, stonePrice, boostStonePrice)) {
      commonStones += stonesPerBoost;
    } else {
      boostStones += 1;
      boostStoneLevels.push(level);
    }

    if (level % input.boostType === 0) stonesPerBoost += 1;
  }

  const totalStoneCost = commonStones * stonePrice;
  const totalBoostCost = boostStones * boostStonePrice;
  return {
    commonStones,
    boostStones,
    boostStoneLevels,
    totalStoneCost,
    totalBoostCost,
    totalCost: totalStoneCost + totalBoostCost,
  };
}

export function buildBoostTable(boostType: number, useSpecial: boolean) {
  let stonesPerBoost = useSpecial ? 1 : 0;
  const rows: Array<{ level: number; stones: number }> = [];

  for (let level = 1; level <= 50; level += 1) {
    if (useSpecial && level < 10 && level % 2 !== 0) continue;
    if (!useSpecial && level === 1) stonesPerBoost = 1;

    rows.push({ level, stones: stonesPerBoost });

    if (level % boostType === 0) stonesPerBoost += 1;
  }

  return rows;
}
