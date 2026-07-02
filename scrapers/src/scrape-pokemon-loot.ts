import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const OUTPUT_PATH = resolve(ROOT_DIR, 'data/pokemon.json');
const ITEM_CONCURRENCY = 8;

const LOOT_PAGES = [
  { title: 'Itens_de_Loot', label: 'Loots Gerais' },
  { title: 'Mega_Evoluções', label: 'Mega Stones' },
  { title: 'Dimensional_Zone_Itens', label: 'Dimensional Zone Itens' },
  { title: 'Nightmare_Itens', label: 'Nightmare Itens' },
  { title: 'Itens:Outros', label: 'Outros Itens' },
];

type WikiParseResponse = {
  parse: {
    title: string;
    text: { '*': string };
  };
};

type PokemonVersionRecord = {
  name: string;
  slug: string;
  iconUrl: string;
  sourceUrl: string;
};

type PokemonLootRecord = {
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

type PokemonRecord = {
  slug: string;
  name: string;
  otherVersions?: PokemonVersionRecord[];
  loot?: PokemonLootRecord[];
};

type PokemonPayload = {
  sourceUrl: string;
  pokemon: PokemonRecord[];
};

type ItemLink = {
  title: string;
  category: string;
};

type PokemonMatch = {
  owner: PokemonRecord;
  pokemonName: string;
  pokemonSlug: string;
  isVariant: boolean;
};

async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
}

async function fetchWikiPage(title: string) {
  const url = new URL('/api.php', WIKI_ORIGIN);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', title);
  url.searchParams.set('prop', 'text');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wiki request failed for ${title}: ${response.status}`);
  }

  const payload = (await response.json()) as WikiParseResponse;
  if (!payload.parse?.text?.['*']) {
    throw new Error(`Wiki parse response did not include page text for ${title}`);
  }
  return payload.parse;
}

function wikiPageUrl(title: string) {
  return `${WIKI_ORIGIN}/index.php/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

function absoluteUrl(value: string) {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `${WIKI_ORIGIN}${value}`;
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
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function collectItemLinks(html: string, fallbackCategory: string) {
  const $ = cheerio.load(html);
  const links = new Map<string, ItemLink>();
  let currentCategory = fallbackCategory;

  $('.mw-parser-output')
    .children()
    .each((_, element) => {
      const tagName = element.type === 'tag' ? element.name.toLowerCase() : '';
      if (tagName === 'h2' || tagName === 'h3') {
        const heading = $(element).text().replace(/\[edit\]/gi, '').trim();
        if (heading) {
          currentCategory = heading;
        }
      }

      $(element)
        .find('a[href^="/index.php/"]')
        .each((__, anchor) => {
          const title = ($(anchor).attr('title') || $(anchor).text()).trim();
          const href = $(anchor).attr('href') || '';

          if (!title || title.includes(':') || title.startsWith('NPC ') || href.includes('#')) {
            return;
          }

          links.set(title, { title, category: currentCategory || fallbackCategory });
        });
    });

  return [...links.values()];
}

function buildPokemonMatchers(pokemon: PokemonRecord[]) {
  const bySlug = new Map<string, PokemonRecord>();
  const byName = new Map<string, PokemonRecord>();
  const variantOwners = new Map<string, { owner: PokemonRecord; version: PokemonVersionRecord }>();

  for (const entry of pokemon) {
    bySlug.set(entry.slug, entry);
    byName.set(normalize(entry.name), entry);

    for (const version of entry.otherVersions || []) {
      const versionSlug = version.slug || slugify(version.name);
      variantOwners.set(versionSlug, { owner: entry, version: { ...version, slug: versionSlug } });
      variantOwners.set(slugify(version.name), { owner: entry, version: { ...version, slug: versionSlug } });
    }
  }

  return { bySlug, byName, variantOwners };
}

function resolvePokemon(title: string, pokemon: PokemonRecord[], matchers: ReturnType<typeof buildPokemonMatchers>): PokemonMatch | null {
  const pokemonSlug = slugify(title);
  const exact = matchers.bySlug.get(pokemonSlug) || matchers.byName.get(normalize(title));
  if (exact) {
    return { owner: exact, pokemonName: exact.name, pokemonSlug: exact.slug, isVariant: false };
  }

  const versionMatch = matchers.variantOwners.get(pokemonSlug);
  if (versionMatch) {
    return {
      owner: versionMatch.owner,
      pokemonName: versionMatch.version.name,
      pokemonSlug: versionMatch.version.slug || pokemonSlug,
      isVariant: true,
    };
  }

  const baseName = title
    .replace(/\([^)]*\)/g, ' ')
    .replace(/^(mega|shiny|baby|alolan|galarian|hisuian)\s+/i, '')
    .replace(/\s+(female|male|tm|tr|x|y)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const base = matchers.bySlug.get(slugify(baseName)) || matchers.byName.get(normalize(baseName));

  return base ? { owner: base, pokemonName: title, pokemonSlug, isVariant: true } : null;
}

function parseItemLoot(html: string, itemTitle: string, itemCategory: string, pokemon: PokemonRecord[], matchers: ReturnType<typeof buildPokemonMatchers>) {
  const $ = cheerio.load(html);
  const obtainRow = $('tr')
    .filter((_, row) => $(row).children('td').first().text().replace(/\s+/g, ' ').trim().toLowerCase() === 'como obter')
    .first();

  if (!obtainRow.length) {
    return [];
  }

  const itemName = $('center > b').first().text().trim() || itemTitle;
  const itemSlug = slugify(itemName);
  const iconUrl = absoluteUrl($('.mw-parser-output img').first().attr('src') || '');
  const itemSourceUrl = wikiPageUrl(itemTitle);
  const matches: Array<PokemonMatch & { loot: PokemonLootRecord }> = [];

  obtainRow
    .children('td')
    .eq(1)
    .find('a[title]')
    .each((_, anchor) => {
      const pokemonTitle = ($(anchor).attr('title') || '').trim();
      const match = resolvePokemon(pokemonTitle, pokemon, matchers);

      if (!match) {
        return;
      }

      matches.push({
        ...match,
        loot: {
          itemName,
          itemNameEn: itemName,
          itemNamePtBr: itemName,
          itemSlug,
          iconUrl,
          category: itemCategory,
          sourceUrl: itemSourceUrl,
          pokemonName: match.pokemonName,
          pokemonSlug: match.pokemonSlug,
          isVariant: match.isVariant,
        },
      });
    });

  return matches;
}

async function mapConcurrent<T, R>(items: T[], concurrency: number, mapper: (item: T, index: number) => Promise<R>) {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  const payload = await readJson<PokemonPayload>(OUTPUT_PATH);
  const matchers = buildPokemonMatchers(payload.pokemon);
  const itemLinks = new Map<string, ItemLink>();

  for (const page of LOOT_PAGES) {
    const parsed = await fetchWikiPage(page.title);
    for (const link of collectItemLinks(parsed.text['*'], page.label)) {
      if (!itemLinks.has(link.title)) {
        itemLinks.set(link.title, link);
      }
    }
  }

  for (const pokemon of payload.pokemon) {
    pokemon.loot = [];
  }

  let relationCount = 0;
  const links = [...itemLinks.values()];
  await mapConcurrent(links, ITEM_CONCURRENCY, async (link) => {
    let parsed;
    try {
      parsed = await fetchWikiPage(link.title);
    } catch {
      return;
    }

    const relations = parseItemLoot(parsed.text['*'], parsed.title, link.category, payload.pokemon, matchers);

    for (const relation of relations) {
      const currentLoot = relation.owner.loot ?? [];
      const duplicate = currentLoot.some((loot) => loot.itemSlug === relation.loot.itemSlug && loot.pokemonSlug === relation.loot.pokemonSlug);
      if (!duplicate) {
        currentLoot.push(relation.loot);
        relation.owner.loot = currentLoot;
        relationCount += 1;
      }
    }
  });

  for (const pokemon of payload.pokemon) {
    pokemon.loot = (pokemon.loot ?? []).sort((first, second) => {
      if (first.isVariant !== second.isVariant) return Number(first.isVariant) - Number(second.isVariant);
      if (first.pokemonSlug !== second.pokemonSlug) return first.pokemonSlug.localeCompare(second.pokemonSlug);
      return first.itemName.localeCompare(second.itemName);
    });
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Scraped ${relationCount} Pokemon loot relations from ${links.length} item pages.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
