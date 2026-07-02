import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type {
  AdventurerMapsPayload,
  MonumentsPayload,
  ProfessionDetail,
  ProfessionsOverview,
  ProfessorStudentsPayload,
} from '@/types/professions';
import type { Clan, ClanDetail, ClanIconLabel, ClanTierPokemon } from '@/types/clans';
import type { Craft, CraftsOverview } from '@/types/crafts';
import type { ItemCategoryDetail, ItemDetail, ItemsOverview } from '@/types/items';
import type { PokemonDetail, PokemonOverview, PokemonVersion } from '@/types/pokemon';
import type { SearchOverview, SearchResult } from '@/types/search';

const DATA_DIR = resolve(process.cwd(), 'data');

async function readDataFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(resolve(DATA_DIR, fileName), 'utf8');
    return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matches(value: string, query: string) {
  return normalize(value).includes(normalize(query));
}

export function getProfessorStudentsData() {
  return readDataFile<ProfessorStudentsPayload>('professor-students.json', { groups: [] });
}

export function getMonumentsData() {
  return readDataFile<MonumentsPayload>('monuments.json', {
    sourceUrl: '',
    intro: '',
    groups: [],
  });
}

export function getAdventurerMapsData() {
  return readDataFile<AdventurerMapsPayload>('adventurer-maps.json', {
    sourceUrl: '',
    mapTypes: [],
  });
}

export async function getLocalClans(): Promise<Clan[]> {
  const payload = await readDataFile<{ clans: Array<Partial<Clan> & { iconUrl?: string }> }>('clans.json', {
    clans: [],
  });

  return payload.clans.map((clan) => ({
    slug: clan.slug || slugify(clan.name || ''),
    name: clan.name || '',
    focus: clan.focus || '',
    summary: clan.summary || '',
    iconUrl: clan.iconUrl || '',
    sourceUrl: clan.sourceUrl || '',
    types: clan.types || [],
  }));
}

export async function getLocalClanDetail(slug: string): Promise<ClanDetail | null> {
  type LegacyClanTier = {
    tier: string;
    pokemon?: string[];
    rows?: Array<Partial<ClanTierPokemon>>;
  };
  type LegacyClanDetail = Omit<ClanDetail, 'tiers'> & {
    tiers: LegacyClanTier[];
  };

  const payload = await readDataFile<{ clans: LegacyClanDetail[] }>('clan-details.json', { clans: [] });
  const clan = payload.clans.find((currentClan) => currentClan.slug === slug);
  if (!clan) {
    return null;
  }

  return {
    ...clan,
    bonus: clan.bonus || [],
    npcPokemon: clan.npcPokemon || [],
    tiers: (clan.tiers || []).map((tier) => ({
      tier: tier.tier,
      pokemon: normalizeTierPokemon(tier),
    })),
    rotation: clan.rotation || [],
    pvpExclusive: clan.pvpExclusive || [],
    pvpNote: clan.pvpNote || 'A exclusividade e aplicada apenas em conteudos PvP. No PvE, o uso e liberado para todos os clas.',
  };
}

function normalizeTierPokemon(tier: { pokemon?: string[]; rows?: Array<Partial<ClanTierPokemon>> }) {
  if (tier.rows?.length) {
    return tier.rows.map((pokemon) => ({
      dex: pokemon.dex || '',
      icon: pokemon.icon || '',
      name: pokemon.name || '',
      elements: normalizeIconLabels(pokemon.elements),
      pveRoles: normalizeIconLabels(pokemon.pveRoles),
      pvpRoles: normalizeIconLabels(pokemon.pvpRoles),
      helds: normalizeIconLabels(pokemon.helds),
    }));
  }

  return (tier.pokemon || []).map((pokemon) => ({
    dex: '',
    icon: '',
    name: pokemon,
    elements: [],
    pveRoles: [],
    pvpRoles: [],
    helds: [],
  }));
}

function normalizeIconLabels(labels?: ClanIconLabel[]) {
  return (labels || []).map((label) => ({
    label: label.label || '',
    icon: label.icon || '',
  }));
}

export async function getLocalProfessions(): Promise<ProfessionsOverview> {
  const payload = await readDataFile<ProfessionsOverview>('professions.json', {
    professions: [],
    relatedLinks: [],
  });

  return {
    professions: payload.professions || [],
    relatedLinks: payload.relatedLinks || [],
  };
}

export async function getLocalProfessionDetail(slug: string): Promise<ProfessionDetail | null> {
  const payload = await readDataFile<{ professions: ProfessionDetail[] }>('professions.json', {
    professions: [],
  });

  return payload.professions.find((profession) => profession.slug === slug) || null;
}

export async function getLocalCrafts(filters?: {
  item?: string;
  profession?: string;
  ingredient?: string;
}): Promise<CraftsOverview> {
  const payload = await readDataFile<CraftsOverview>('crafts.json', { crafts: [] });
  let crafts = payload.crafts || [];

  if (filters?.item) {
    crafts = crafts.filter((craft) => matches([craft.itemName, craft.itemSlug].join(' '), filters.item || ''));
  }

  if (filters?.profession) {
    crafts = crafts.filter((craft) =>
      matches(
        [craft.profession, craft.professionSlug, craft.subprofession, craft.subprofessionSlug].join(' '),
        filters.profession || '',
      ),
    );
  }

  if (filters?.ingredient) {
    crafts = crafts.filter((craft) =>
      craft.ingredients.some((ingredient) => matches([ingredient.name, ingredient.itemSlug].join(' '), filters.ingredient || '')),
    );
  }

  return { crafts };
}

export async function getLocalCraft(slug: string): Promise<Craft | null> {
  const payload = await getLocalCrafts();
  return payload.crafts.find((craft) => craft.slug === slug) || null;
}

export async function getLocalPokemon(): Promise<PokemonOverview> {
  const payload = await readDataFile<PokemonOverview>('pokemon.json', {
    generations: [],
    pokemon: [],
  });

  return {
    generations: payload.generations || [],
    pokemon: payload.pokemon || [],
  };
}

export async function getLocalPokemonDetail(slug: string): Promise<PokemonDetail | null> {
  const payload = await readDataFile<{ pokemon: PokemonDetail[] }>('pokemon.json', { pokemon: [] });
  const exactMatch = payload.pokemon.find((pokemon) => pokemon.slug === slug);
  if (exactMatch) {
    return exactMatch;
  }

  const versionMatch = findPokemonVersionDetail(payload.pokemon, slug);
  if (versionMatch) {
    return versionMatch;
  }

  const index = new Map<string, PokemonDetail>();
  for (const pokemon of payload.pokemon) {
    addPokemonLookupAlias(index, pokemon.slug, pokemon);
    addPokemonLookupAlias(index, pokemon.name, pokemon);
  }

  for (const candidate of pokemonLookupCandidates(slug)) {
    const match = index.get(normalize(candidate));
    if (match) {
      return isNamedVariantPokemon(slug) && match.slug !== slug ? buildAdHocVersionPokemonDetail(match, slug) : match;
    }
  }

  return null;
}

function findPokemonVersionDetail(pokemonList: PokemonDetail[], slug: string): PokemonDetail | null {
  const requestedSlug = slugify(slug);

  for (const basePokemon of pokemonList) {
    const versions = Array.isArray(basePokemon.otherVersions) ? basePokemon.otherVersions : [];
    const version = versions.find((currentVersion) => {
      const versionSlug = currentVersion.slug || slugify(currentVersion.name);
      return versionSlug === requestedSlug;
    });

    if (version) {
      return buildVersionPokemonDetail(basePokemon, version, requestedSlug);
    }
  }

  return null;
}

function buildVersionPokemonDetail(basePokemon: PokemonDetail, version: PokemonVersion, requestedSlug: string): PokemonDetail {
  const versionSlug = version.slug || requestedSlug;
  const versionImage = version.iconUrl || basePokemon.detailSpriteUrl || basePokemon.spriteUrl;
  const siblingVersions = (basePokemon.otherVersions || []).filter((currentVersion) => {
    const currentSlug = currentVersion.slug || slugify(currentVersion.name);
    return currentSlug !== versionSlug;
  });

  return {
    ...basePokemon,
    slug: versionSlug,
    name: version.name,
    spriteUrl: versionImage,
    detailSpriteUrl: versionImage,
    sourceUrl: version.sourceUrl || basePokemon.sourceUrl,
    otherVersions: [
      {
        name: basePokemon.name,
        slug: basePokemon.slug,
        iconUrl: basePokemon.spriteUrl || basePokemon.detailSpriteUrl,
        sourceUrl: basePokemon.sourceUrl,
      },
      ...siblingVersions,
    ],
  };
}

function buildAdHocVersionPokemonDetail(basePokemon: PokemonDetail, requestedSlug: string): PokemonDetail {
  const versionName = titleizePokemonSlug(requestedSlug);

  return {
    ...basePokemon,
    slug: slugify(requestedSlug),
    name: versionName,
    otherVersions: [
      {
        name: basePokemon.name,
        slug: basePokemon.slug,
        iconUrl: basePokemon.spriteUrl || basePokemon.detailSpriteUrl,
        sourceUrl: basePokemon.sourceUrl,
      },
      ...(basePokemon.otherVersions || []),
    ].filter((version) => (version.slug || slugify(version.name)) !== slugify(requestedSlug)),
  };
}

function isNamedVariantPokemon(value: string) {
  return /^(mega|shiny|baby|alolan|galarian|hisuian)(-|_|\s+)/i.test(value.trim());
}

function titleizePokemonSlug(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bTm\b/g, 'TM')
    .replace(/\bTr\b/g, 'TR');
}

function addPokemonLookupAlias(index: Map<string, PokemonDetail>, value: string, pokemon: PokemonDetail) {
  const key = normalize(value);
  if (key && !index.has(key)) {
    index.set(key, pokemon);
  }
}

function pokemonLookupCandidates(value: string) {
  const normalized = value.replace(/[-_]+/g, ' ');
  const withoutParentheses = normalized.replace(/\([^)]*\)/g, ' ');
  const withoutPrefixes = withoutParentheses.replace(/^(mega|shiny|baby|alolan|galarian|hisuian)\s+/i, '');
  const withoutSuffixes = withoutPrefixes.replace(/\s+(female|male|tm|tr|x|y)$/i, '');

  return [
    value,
    normalized,
    withoutParentheses,
    withoutPrefixes,
    withoutSuffixes,
  ].filter(Boolean);
}

export async function getLocalItems(): Promise<ItemsOverview> {
  const payload = await readDataFile<{ categories: ItemCategoryDetail[] }>('items.json', { categories: [] });

  return {
    categories: payload.categories.map((category) => ({
      slug: category.slug,
      title: category.title,
      group: category.group,
      summary: category.summary,
      iconUrl: category.iconUrl,
      sourceUrl: category.sourceUrl,
      itemCount: category.items?.length || 0,
    })),
  };
}

export async function getLocalItemCategory(slug: string): Promise<ItemCategoryDetail | null> {
  const payload = await readDataFile<{ categories: ItemCategoryDetail[] }>('items.json', { categories: [] });
  return payload.categories.find((category) => category.slug === slug) || null;
}

export async function getLocalItemDetail(slug: string): Promise<ItemDetail | null> {
  const payload = await readDataFile<{ categories: ItemCategoryDetail[] }>('items.json', { categories: [] });

  for (const category of payload.categories) {
    const item = category.items?.find((currentItem) => currentItem.slug === slug);
    if (item) {
      return {
        ...item,
        categorySlug: category.slug,
        categoryTitle: category.title,
        categoryGroup: category.group,
      };
    }
  }

  return null;
}

export async function searchLocalData(query: string): Promise<SearchOverview> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { results: [] };
  }

  const [clans, professions, pokemon, items, crafts] = await Promise.all([
    getLocalClans(),
    getLocalProfessions(),
    getLocalPokemon(),
    getLocalItems(),
    getLocalCrafts(),
  ]);

  const results: SearchResult[] = [];
  const pushIfMatch = (result: SearchResult, haystack: string) => {
    if (matches(haystack, trimmedQuery)) {
      results.push(result);
    }
  };

  clans.forEach((clan) =>
    pushIfMatch(
      {
        type: 'Clas',
        title: clan.name,
        slug: clan.slug,
        url: `/clans/${clan.slug}`,
        imageUrl: clan.iconUrl,
        summary: clan.summary,
      },
      [clan.name, clan.focus, clan.summary, clan.types.join(' ')].join(' '),
    ),
  );

  professions.professions.forEach((profession) =>
    pushIfMatch(
      {
        type: 'Profissoes',
        title: profession.name,
        slug: profession.slug,
        url: `/professions/${profession.slug}`,
        imageUrl: profession.iconUrl,
        summary: profession.summary,
      },
      [profession.name, profession.summary].join(' '),
    ),
  );

  pokemon.pokemon.forEach((entry) =>
    pushIfMatch(
      {
        type: 'Pokemon',
        title: entry.name,
        slug: entry.slug,
        url: `/pokedex/${entry.slug}`,
        imageUrl: entry.spriteUrl,
        summary: [entry.dex, entry.generation, entry.elements.join(', ')].filter(Boolean).join(' | '),
      },
      [entry.name, entry.dex, entry.generation, entry.elements.join(' '), entry.level].join(' '),
    ),
  );

  items.categories.forEach((category) =>
    pushIfMatch(
      {
        type: 'Itens',
        title: category.title,
        slug: category.slug,
        url: `/items/${category.slug}`,
        imageUrl: category.iconUrl,
        summary: category.summary,
      },
      [category.title, category.group, category.summary].join(' '),
    ),
  );

  crafts.crafts.forEach((craft) =>
    pushIfMatch(
      {
        type: 'Crafts',
        title: craft.itemName,
        slug: craft.slug,
        url: `/crafts/${craft.slug}`,
        imageUrl: craft.imageUrl,
        summary: [craft.profession, craft.subprofession, craft.rank, craft.skill].filter(Boolean).join(' | '),
      },
      [
        craft.itemName,
        craft.profession,
        craft.subprofession,
        craft.rank,
        craft.skill,
        craft.ingredients.map((ingredient) => ingredient.name).join(' '),
      ].join(' '),
    ),
  );

  return { results: results.slice(0, 60) };
}
