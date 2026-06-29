import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const PAGE_TITLE = 'Pokémon';
const OUTPUT_PATH = resolve(ROOT_DIR, 'data/pokemon.json');
const DETAIL_CONCURRENCY = 6;

type WikiParseResponse = {
  parse: {
    title: string;
    text: { '*': string };
    wikitext?: { '*': string };
  };
};

type PokemonListRecord = {
  dexNumber: number;
  dex: string;
  name: string;
  slug: string;
  generation: string;
  spriteUrl: string;
  sourceUrl: string;
  pageTitle: string;
};

type PokemonEvolutionRecord = {
  name: string;
  level: string;
};

type PokemonEffectivenessRecord = {
  category: string;
  types: string[];
};

type PokemonRecord = PokemonListRecord & {
  detailSpriteUrl: string;
  level: string;
  elements: string[];
  abilities: string;
  boost: string;
  material: string;
  evolutionStone: string;
  evolutions: PokemonEvolutionRecord[];
  description: string;
  effectiveness: PokemonEffectivenessRecord[];
};

const GENERATION_TITLES = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea',
];

function absoluteUrl(value: string) {
  return new URL(value, WIKI_ORIGIN).toString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function fixMojibake(value: string) {
  return /Ã|Â/.test(value) ? Buffer.from(value, 'latin1').toString('utf8') : value;
}

function normalizeText(value: string) {
  return fixMojibake(value.replace(/\s+/g, ' ').trim());
}

function cleanHeading(value: string) {
  return normalizeText(value.replace(/\[editar\]/g, ''));
}

function pageFromSourceUrl(sourceUrl: string) {
  const url = new URL(sourceUrl);
  const page = url.pathname.replace(/^\/index\.php\//, '').split('#')[0];
  return decodeURIComponent(page.replace(/_/g, ' '));
}

async function fetchPage(page: string, props = 'text|wikitext'): Promise<WikiParseResponse> {
  const url = new URL('/api.php', WIKI_ORIGIN);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', page);
  url.searchParams.set('prop', props);
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PXGTools/0.1 (pokemon scraper)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WikiParseResponse;
}

function detectGeneration(title: string) {
  return GENERATION_TITLES.find((generation) => title.includes(generation)) ?? '';
}

function parsePokemonIndex(html: string) {
  const $ = cheerio.load(html);
  const pokemon = new Map<string, PokemonListRecord>();
  let currentGeneration = '';

  $('.mw-parser-output')
    .children()
    .each((_, element) => {
      const tag = element.tagName?.toLowerCase() ?? '';

      if (/^h[1-6]$/.test(tag)) {
        currentGeneration = detectGeneration(cleanHeading($(element).text()));
        return;
      }

      if (!currentGeneration) {
        return;
      }

      const tables = tag === 'table' ? [element] : $(element).find('table').toArray();

      tables.forEach((table) => {
        $(table)
        .find('tr')
        .each((__, row) => {
          const cells = $(row).children('td').toArray();

          for (let index = 0; index + 2 < cells.length; index += 3) {
            const $iconCell = $(cells[index]);
            const $dexCell = $(cells[index + 1]);
            const $nameCell = $(cells[index + 2]);
            const link = $nameCell.find('a').first();
            const image = $iconCell.find('img').first();
            const dex = normalizeText($dexCell.text());
            const dexNumber = Number(dex.replace(/\D/g, ''));
            const name = normalizeText(link.attr('title') ?? $nameCell.text());
            const href = link.attr('href') ?? '';

            if (!dexNumber || !name || !href) {
              continue;
            }

            const sourceUrl = absoluteUrl(href);
            const record: PokemonListRecord = {
              dexNumber,
              dex: `#${String(dexNumber).padStart(3, '0')}`,
              name,
              slug: slugify(name),
              generation: currentGeneration,
              spriteUrl: image.attr('src') ? absoluteUrl(image.attr('src') ?? '') : '',
              sourceUrl,
              pageTitle: pageFromSourceUrl(sourceUrl),
            };

            pokemon.set(`${record.dexNumber}-${record.slug}`, record);
          }
        });
      });
    });

  return [...pokemon.values()].sort((left, right) => left.dexNumber - right.dexNumber || left.name.localeCompare(right.name));
}

function cleanWikiText(value: string) {
  return normalizeText(
    value
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/\{\{[\s\S]*?\}\}/g, ' ')
      .replace(/\[\[Arquivo:[^\]]+\]\]/gi, ' ')
      .replace(/\[\[File:[^\]]+\]\]/gi, ' ')
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/'{2,}/g, '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function extractField(wikitext: string, label: string) {
  const pattern = new RegExp(`'''${label}:'''\\s*([\\s\\S]*?)(?:<br\\s*\\/?>|\\n)`, 'i');
  const match = wikitext.match(pattern);
  return match ? cleanWikiText(match[1]) : '';
}

function extractSection(wikitext: string, title: string) {
  const pattern = new RegExp(`==\\s*'''${title}'''\\s*==([\\s\\S]*?)(?=\\n==|$)`, 'i');
  const match = wikitext.match(pattern);
  return match ? match[1].trim() : '';
}

function splitTypes(value: string) {
  return value
    .split(/\s*(?:\/|,|\band\b)\s*|\s+e\s+/i)
    .map((type) => normalizeText(type).replace(/[.;:]$/g, ''))
    .filter(Boolean);
}

function parseEvolutions(wikitext: string) {
  const section = extractSection(wikitext, 'Evoluções');
  const evolutions: PokemonEvolutionRecord[] = [];
  const pattern = /'''([^']+)'''\s+precisa de Level\s+([^.<\n]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(section)) !== null) {
    evolutions.push({
      name: cleanWikiText(match[1]),
      level: cleanWikiText(match[2]),
    });
  }

  return evolutions;
}

function parseDescription(wikitext: string) {
  const section = extractSection(wikitext, 'Descrição:') || extractSection(wikitext, 'Descrição');
  return cleanWikiText(section);
}

function parseEffectiveness(wikitext: string) {
  const section = cleanWikiText(extractSection(wikitext, 'Efetividades'));
  const categoryPattern = /(Muito Efetivo|Muito Inefetivo|Efetivo|Normal|Inefetivo|Imune|Nulo):/gi;
  const matches = [...section.matchAll(categoryPattern)];
  const result: PokemonEffectivenessRecord[] = [];

  for (const [index, match] of matches.entries()) {
    const nextMatch = matches[index + 1];
    const valueStart = (match.index ?? 0) + match[0].length;
    const valueEnd = nextMatch?.index ?? section.length;
    const category = normalizeText(match[1]).replace(/\b\w/g, (letter) => letter.toUpperCase());
    const value = section.slice(valueStart, valueEnd).replace(/\.$/, '');

    result.push({
      category,
      types: splitTypes(value),
    });
  }

  return result;
}

function extractDetailSprite(html: string) {
  const $ = cheerio.load(html);
  const image = $('.mw-parser-output > center img').first();
  return image.attr('src') ? absoluteUrl(image.attr('src') ?? '') : '';
}

async function enrichPokemon(base: PokemonListRecord): Promise<PokemonRecord> {
  try {
    const detail = await fetchPage(base.pageTitle);
    const html = detail.parse.text['*'];
    const wikitext = detail.parse.wikitext?.['*'] ?? '';

    return {
      ...base,
      detailSpriteUrl: extractDetailSprite(html),
      level: extractField(wikitext, 'Level'),
      elements: splitTypes(extractField(wikitext, 'Elemento')),
      abilities: extractField(wikitext, 'Habilidades'),
      boost: extractField(wikitext, 'Boost'),
      material: extractField(wikitext, 'Materia') || extractField(wikitext, 'Matéria'),
      evolutionStone: extractField(wikitext, 'Pedra de Evolução'),
      evolutions: parseEvolutions(wikitext),
      description: parseDescription(wikitext),
      effectiveness: parseEffectiveness(wikitext),
    };
  } catch (error) {
    console.warn(`Pokemon detail skipped for ${base.name}:`, error instanceof Error ? error.message : error);
    return {
      ...base,
      detailSpriteUrl: '',
      level: '',
      elements: [],
      abilities: '',
      boost: '',
      material: '',
      evolutionStone: '',
      evolutions: [],
      description: '',
      effectiveness: [],
    };
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
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
  const indexPage = await fetchPage(PAGE_TITLE, 'text');
  const pokemonIndex = parsePokemonIndex(indexPage.parse.text['*']);
  console.log(`Found ${pokemonIndex.length} Pokemon in the official index.`);

  const pokemon = await mapWithConcurrency(pokemonIndex, DETAIL_CONCURRENCY, async (entry, index) => {
    if ((index + 1) % 50 === 0) {
      console.log(`Enriched ${index + 1}/${pokemonIndex.length} Pokemon.`);
    }

    return enrichPokemon(entry);
  });

  const generations = [...new Set(pokemon.map((entry) => entry.generation))];
  const payload = {
    sourceUrl: `${WIKI_ORIGIN}/index.php/Pok%C3%A9mon`,
    scrapedAt: new Date().toISOString(),
    generations,
    pokemon,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${pokemon.length} Pokemon to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
