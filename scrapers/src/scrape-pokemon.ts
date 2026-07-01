import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
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

type PokemonMoveRecord = {
  name: string;
  type: string;
  cooldown: string;
  level: string;
  description: string;
  icons: PokemonMoveIconRecord[];
};

type PokemonMoveIconRecord = {
  label: string;
  iconUrl: string;
};

type PokemonVersionRecord = {
  name: string;
  slug: string;
  iconUrl: string;
  sourceUrl: string;
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
  moves: PokemonMoveRecord[];
  pvpMoves: PokemonMoveRecord[];
  pveMoves: PokemonMoveRecord[];
  otherVersions: PokemonVersionRecord[];
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
const MOVE_TYPE_NAMES = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
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

function normalizeKey(value: string) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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

function extractSectionLoose(wikitext: string, titles: string[]) {
  const expected = titles.map(normalizeKey);
  const headingPattern = /^={2,6}\s*'?([^=\n'].*?)'?\s*={2,6}\s*$/gm;
  const headings = [...wikitext.matchAll(headingPattern)].map((match) => ({
    index: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
    title: normalizeKey(match[1]),
  }));

  const heading = headings.find((candidate) => expected.some((title) => candidate.title.includes(title)));
  if (!heading) {
    return '';
  }

  const next = headings.find((candidate) => candidate.index > heading.index);
  return wikitext.slice(heading.end, next?.index ?? wikitext.length).trim();
}

function splitTypes(value: string) {
  return value
    .split(/\s*(?:\/|,|\band\b)\s*|\s+e\s+/i)
    .map((type) => normalizeText(type).replace(/[.;:]$/g, ''))
    .filter(Boolean);
}

function parseEvolutions(wikitext: string) {
  const section = extractSection(wikitext, 'Evoluções') || extractSectionLoose(wikitext, ['Evolucoes', 'Evoluções']);
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
  const section =
    extractSection(wikitext, 'Descrição:') ||
    extractSection(wikitext, 'Descrição') ||
    extractSectionLoose(wikitext, ['Descricao', 'Descrição']);
  return cleanWikiText(section);
}

function parseEffectiveness(wikitext: string) {
  const section = cleanWikiText(extractSection(wikitext, 'Efetividades') || extractSectionLoose(wikitext, ['Efetividades']));
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

function sectionElementsByHeading($: cheerio.CheerioAPI, headingNames: string[]) {
  const expected = headingNames.map(normalizeKey);
  const result: Element[] = [];
  let collecting = false;

  $('.mw-parser-output')
    .children()
    .each((_, element) => {
      const tag = element.tagName?.toLowerCase() ?? '';
      const isHeading = /^h[1-6]$/.test(tag);

      if (isHeading) {
        const title = normalizeKey($(element).text());
        if (expected.some((heading) => title.includes(heading))) {
          collecting = true;
          return;
        }

        if (collecting && tag === 'h2') {
          collecting = false;
        }
      }

      if (collecting && !isHeading) {
        result.push(element);
      }
    });

  return result;
}

function parseMovesFromHtml(html: string) {
  const $ = cheerio.load(html);
  const section = sectionElementsByHeading($, ['Movimentos']);
  const rowMoves = parseMoveRowsFromSection($, section);

  if (rowMoves.length) {
    return { moves: rowMoves, pvpMoves: [], pveMoves: [] };
  }

  const moves: PokemonMoveRecord[] = [];
  const pvpMoves: PokemonMoveRecord[] = [];
  const pveMoves: PokemonMoveRecord[] = [];
  let currentMode: 'pvp' | 'pve' = 'pve';
  let hasModeHeading = false;

  for (const element of section) {
    const tag = element.tagName?.toLowerCase() ?? '';
    if (/^h[3-6]$/.test(tag)) {
      const title = normalizeKey($(element).text());
      if (title.includes('pvp')) {
        currentMode = 'pvp';
        hasModeHeading = true;
      }
      if (title.includes('pve')) {
        currentMode = 'pve';
        hasModeHeading = true;
      }
      continue;
    }

    $(element)
      .find('tr')
      .each((_, row) => {
        const cells = $(row).children('td').toArray();
        if (cells.length === 0) return;

        const firstTextCell = cells.find((cell) => {
          const text = normalizeText($(cell).text());
          return text.length > 1 && !/^\d+$/.test(text);
        });
        const link = firstTextCell ? $(firstTextCell).find('a[title]').first() : $(row).find('a[title]').first();
        const name = normalizeText(link.attr('title') ?? $(firstTextCell ?? cells[0]).text());

        if (!name || /arquivo|file|editar/i.test(name)) return;

        const move: PokemonMoveRecord = {
          name,
          type: normalizeText($(cells[1]).text()),
          cooldown: normalizeText($(cells[2]).text()),
          level: normalizeText($(cells[3]).text()),
          description: normalizeText($(cells.slice(4)).text()),
          icons: extractMoveIcons($, row),
        };
        const target = hasModeHeading ? (currentMode === 'pvp' ? pvpMoves : pveMoves) : moves;
        if (!target.some((entry) => entry.name === move.name)) {
          target.push(move);
        }
      });
  }

  const sectionText = normalizeText(section.map((element) => $(element).text()).join(' '));
  const textMoves = parseMovesFromText(sectionText);

  if (textMoves.length) {
    return { moves: textMoves, pvpMoves, pveMoves };
  }

  return { moves, pvpMoves, pveMoves };
}

function parseMoveRowsFromSection($: cheerio.CheerioAPI, section: Element[]) {
  const moves: PokemonMoveRecord[] = [];
  const rows = cheerio.load('<root></root>')('root');
  section.forEach((element) => rows.append($(element).clone()));

  rows.find('tr').each((_, row) => {
    const moveNumber = normalizeText($(row).children('th').first().text());
    if (!/^M\d+$/i.test(moveNumber)) {
      return;
    }

    const moveCell = $(row)
      .children('td')
      .toArray()
      .find((cell) => /\([^)]+\)/.test(normalizeText($(cell).text())));
    const moveText = moveCell ? normalizeText($(moveCell).text()) : '';
    const moveMatch = moveText.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (!moveMatch) {
      return;
    }

    const nextRowText = normalizeText($(row).next('tr').text());
    const levelMatch = nextRowText.match(/Level\s*([0-9]+)/i);

    moves.push({
      name: normalizeText(moveMatch[1]),
      type: findMoveTypeInRow($, row),
      cooldown: normalizeText(moveMatch[2]),
      level: normalizeText(levelMatch?.[1] ?? ''),
      description: '',
      icons: extractMoveIcons($, row),
    });
  });

  return moves;
}

function findMoveTypeInRow($: cheerio.CheerioAPI, row: any) {
  const labels = $(row)
    .find('a[title], img[alt], img[title]')
    .toArray()
    .flatMap((element) => [
      normalizeText($(element).attr('title') ?? ''),
      normalizeText($(element).attr('alt') ?? ''),
    ])
    .filter(Boolean);

  return MOVE_TYPE_NAMES.find((type) => labels.some((label) => label.toLowerCase() === type.toLowerCase())) ?? '';
}

function parseMovesFromText(text: string) {
  const moves: PokemonMoveRecord[] = [];
  const pattern = /\bM\d+\s+(.+?)\s*\(([^)]+)\)(.*?)(?:Level\s*([0-9]+))?(?=\s+M\d+\s+|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const name = normalizeText(match[1]).replace(/\s+\([^)]+\)$/g, '');
    if (!name || /arquivo|file|editar|level\s+\d+/i.test(name)) {
      continue;
    }

    const description = normalizeMoveDescription(match[3] ?? '');
    moves.push({
      name,
      type: inferMoveType(description),
      cooldown: normalizeText(match[2]),
      level: normalizeText(match[4] ?? ''),
      description,
      icons: [],
    });
  }

  return moves;
}

function extractMoveIcons($: cheerio.CheerioAPI, row: any) {
  const seen = new Set<string>();

  return $(row)
    .find('img')
    .toArray()
    .map((image) => {
      const label = normalizeText($(image).attr('alt') ?? $(image).attr('title') ?? '');
      const src = $(image).attr('src') ?? '';
      return {
        label,
        iconUrl: src ? absoluteUrl(src) : '',
      };
    })
    .filter((icon) => {
      const key = `${icon.label}:${icon.iconUrl}`;
      if (!icon.label || !icon.iconUrl || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function normalizeMoveDescription(value: string) {
  return normalizeText(value)
    .replace(/\bImage:\s*/gi, '')
    .replace(/\s+Level\s+\d+$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferMoveType(description: string) {
  const tokens = description.split(/\s+/).map((token) => normalizeText(token));
  return [...MOVE_TYPE_NAMES]
    .reverse()
    .find((type) => tokens.some((token) => token.toLowerCase() === type.toLowerCase())) ?? '';
}

function parseOtherVersionsFromHtml(html: string, currentName: string) {
  const $ = cheerio.load(html);
  const section = sectionElementsByHeading($, ['Outras Versoes', 'Outras Versões']);
  const versions = new Map<string, PokemonVersionRecord>();

  for (const element of section) {
    $(element)
      .find('a[href]')
      .each((_, anchor) => {
        const href = $(anchor).attr('href') ?? '';
        const title = normalizeText($(anchor).attr('title') ?? $(anchor).text());
        if (!href.startsWith('/index.php/') || !title || title === currentName || /arquivo|file|editar/i.test(title)) {
          return;
        }

        const image = $(anchor).find('img').first();
        const sourceUrl = absoluteUrl(href);
        versions.set(title, {
          name: title,
          slug: slugify(title),
          iconUrl: image.attr('src') ? absoluteUrl(image.attr('src') ?? '') : '',
          sourceUrl,
        });
      });
  }

  return [...versions.values()];
}

async function enrichPokemon(base: PokemonListRecord): Promise<PokemonRecord> {
  try {
    const detail = await fetchPage(base.pageTitle);
    const html = detail.parse.text['*'];
    const wikitext = detail.parse.wikitext?.['*'] ?? '';
    const moves = parseMovesFromHtml(html);

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
      moves: moves.moves,
      pvpMoves: moves.pvpMoves,
      pveMoves: moves.pveMoves,
      otherVersions: parseOtherVersionsFromHtml(html, base.name),
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
      moves: [],
      pvpMoves: [],
      pveMoves: [],
      otherVersions: [],
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
