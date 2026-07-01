import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const PAGE_TITLE = 'Alchemy Lab';
const SOURCE_URL = `${WIKI_ORIGIN}/index.php/Alchemy_Lab`;
const ITEMS_PATH = resolve(ROOT_DIR, 'data/items.json');
const CRAFTS_PATH = resolve(ROOT_DIR, 'data/crafts.json');

type WikiSection = {
  line: string;
  anchor: string;
  level: string;
};

type WikiParseResponse = {
  parse: {
    title: string;
    text: { '*': string };
    sections?: WikiSection[];
  };
};

type ItemRecord = {
  slug: string;
  name: string;
  iconUrl: string;
  description: string;
  section: string;
  table: string;
  sourceUrl: string;
  attributes: Record<string, string>;
};

type ItemCategoryRecord = {
  slug: string;
  title: string;
  group: string;
  sourceUrl: string;
  iconUrl: string;
  summary: string;
  sections: Array<{ title: string; anchor: string; level: number }>;
  items: ItemRecord[];
};

type ItemsPayload = {
  sourceUrl: string;
  scrapedAt?: string;
  categories: ItemCategoryRecord[];
};

type CraftIngredientRecord = {
  name: string;
  itemSlug: string;
  quantity: string;
  iconUrl: string;
};

type CraftRecord = {
  slug: string;
  itemName: string;
  itemSlug: string;
  imageUrl: string;
  profession: string;
  professionSlug: string;
  subprofession: string;
  subprofessionSlug: string;
  category: string;
  rank: string;
  skill: string;
  craftTime: string;
  requirements: string;
  sourcePage: string;
  sourceUrl: string;
  columns: Record<string, string>;
  ingredients: CraftIngredientRecord[];
};

type CraftsPayload = {
  sourceUrl: string;
  scrapedAt?: string;
  crafts: CraftRecord[];
};

function fixMojibake(value: string) {
  return /Ãƒ|Ã‚/.test(value) ? Buffer.from(value, 'latin1').toString('utf8') : value;
}

function normalizeText(value: string) {
  return fixMojibake(value.replace(/\s+/g, ' ').trim());
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function absoluteUrl(value: string) {
  return new URL(value, WIKI_ORIGIN).toString();
}

async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
}

async function fetchPage(page: string): Promise<WikiParseResponse> {
  const url = new URL('/api.php', WIKI_ORIGIN);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', page);
  url.searchParams.set('prop', 'text|sections');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PXGTools/0.1 (alchemy lab scraper)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WikiParseResponse;
}

function cleanHeading(value: string) {
  return normalizeText(value.replace(/\[editar\]/g, ''));
}

function cleanCellText($cell: cheerio.Cheerio<any>) {
  const clone = $cell.clone();
  clone.find('img').remove();
  return normalizeText(clone.text());
}

function firstImageUrl($cell: cheerio.Cheerio<any>) {
  const src = $cell.find('img').first().attr('src') ?? '';
  return src ? absoluteUrl(src) : '';
}

function cleanImageName(value: string) {
  return normalizeText(value)
    .replace(/\.(?:png|gif|webp|jpg|jpeg)$/i, '')
    .replace(/^Image:\s*/i, '');
}

function mapSections(sections: WikiSection[] = []) {
  return sections.map((section) => ({
    title: normalizeText(section.line.replace(/<[^>]+>/g, '')),
    anchor: section.anchor,
    level: Number(section.level),
  }));
}

function extractSummary(html: string) {
  const $ = cheerio.load(html);
  $('.toc, script, style, table.seeMore').remove();

  const paragraph = $('.mw-parser-output > p')
    .map((_, element) => normalizeText($(element).text()))
    .get()
    .find((text) => text.length > 40);

  return paragraph
    ?? 'Alchemy Lab contem laboratorios, chemicals e materias produzidos por Professor Alquimista.';
}

function normalizeMaterialName(name: string) {
  return normalizeText(name)
    .replace(/\s+\((?:\d+x|x\d+)\)$/i, '')
    .replace(/s$/i, '');
}

function buildItemIndex(items: ItemsPayload) {
  const index = new Map<string, string>();

  for (const category of items.categories) {
    for (const item of category.items) {
      index.set(slugify(item.name), item.slug);
      index.set(slugify(normalizeMaterialName(item.name)), item.slug);
    }
  }

  return index;
}

function linkedItemSlug(name: string, itemIndex: Map<string, string>) {
  return itemIndex.get(slugify(name))
    ?? itemIndex.get(slugify(normalizeMaterialName(name)))
    ?? '';
}

function quantityFromText(materialsText: string, materialName: string) {
  const normalizedText = normalizeText(materialsText);
  const normalizedName = normalizeMaterialName(materialName);
  const pluralName = normalizedName.endsWith('s') ? normalizedName : `${normalizedName}s`;
  const pattern = new RegExp(
    `(?:^|\\s)(\\d+(?:[.,]\\d+)?(?:\\s*x)?|\\d+K?)\\s+(${escapeRegExp(normalizedName)}|${escapeRegExp(pluralName)})(?=\\s|$)`,
    'i',
  );
  const match = normalizedText.match(pattern);
  return match ? normalizeText(match[1]) : '';
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseMaterialEntries(materialsText: string) {
  const entries: Array<{ quantity: string; name: string }> = [];
  const pattern = /(\d+(?:[.,]\d+)?(?:\s*x)?|[0-9]+K?)\s+(.+?)(?=\s+\d+(?:[.,]\d+)?(?:\s*x)?\s+|\s+[0-9]+K?\s+|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalizeText(materialsText))) !== null) {
    const name = normalizeText(match[2]).replace(/[.;,]$/g, '');
    if (name) {
      entries.push({ quantity: normalizeText(match[1]), name });
    }
  }

  return entries;
}

function extractIngredients($cell: cheerio.Cheerio<any>, itemIndex: Map<string, string>) {
  const materialsText = cleanCellText($cell);
  const parsedMaterials = parseMaterialEntries(materialsText);
  const seen = new Set<string>();

  return $cell
    .find('img')
    .toArray()
    .map((image, index) => {
      const attrs = image.attribs ?? {};
      const rawName = cleanImageName(attrs.alt ?? attrs.title ?? '');
      const parsedMaterial = parsedMaterials[index];
      const name = parsedMaterial?.name || rawName || materialsText;
      const iconUrl = attrs.src ? absoluteUrl(attrs.src) : '';

      return {
        name,
        itemSlug: linkedItemSlug(name, itemIndex),
        quantity: parsedMaterial?.quantity || quantityFromText(materialsText, name),
        iconUrl,
      };
    })
    .filter((ingredient) => {
      const key = `${ingredient.name}:${ingredient.iconUrl}`;
      if (!ingredient.name || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function headerIndex(headers: string[], matcher: RegExp) {
  return headers.findIndex((header) => matcher.test(header));
}

function isAlchemyCraftTable(headers: string[]) {
  const normalized = headers.map((header) => header.toLowerCase());
  return normalized.some((header) => /item|nome/.test(header))
    && normalized.some((header) => /materiais|itens necessarios|itens necess[aã]rios/.test(header));
}

function sourceUrlForSection(section: string) {
  const anchor = section ? `#${section.replace(/\s+/g, '_')}` : '';
  return `${SOURCE_URL}${anchor}`;
}

function parseAlchemyTables(html: string, itemIndex: Map<string, string>) {
  const $ = cheerio.load(html);
  $('.toc, script, style, table.seeMore').remove();

  const seenCrafts = new Map<string, number>();
  const producedItems = new Map<string, ItemRecord>();
  const crafts: CraftRecord[] = [];
  let currentSection = PAGE_TITLE;

  $('.mw-parser-output')
    .children()
    .each((_, element) => {
      const tag = element.tagName?.toLowerCase() ?? '';

      if (/^h[1-6]$/.test(tag)) {
        currentSection = cleanHeading($(element).text());
        return;
      }

      const tables = tag === 'table' ? [element] : $(element).find('table').toArray();
      for (const table of tables) {
        const rows = $(table).find('tr').toArray();
        const headerRow = rows.find((row) => $(row).children('th,td').length > 1);
        if (!headerRow) {
          continue;
        }

        const headers = $(headerRow)
          .children('th,td')
          .toArray()
          .map((cell, index) => normalizeText($(cell).text()) || `Coluna ${index + 1}`);

        if (!isAlchemyCraftTable(headers)) {
          continue;
        }

        const itemColumn = headerIndex(headers, /^(item|nome)$/i);
        const skillColumn = headerIndex(headers, /habilidade|skill/i);
        const timeColumn = headerIndex(headers, /tempo/i);
        const materialColumn = headerIndex(headers, /materiais|itens necessarios|itens necess[aã]rios/i);
        const dataRows = rows.slice(rows.indexOf(headerRow) + 1);

        for (const row of dataRows) {
          const cells = $(row).children('th,td').toArray();
          if (cells.length < 2 || materialColumn < 0) {
            continue;
          }

          const $itemCell = $(cells[itemColumn >= 0 ? itemColumn : 0]);
          const itemName = normalizeText($itemCell.find('a[title]').first().attr('title') ?? cleanCellText($itemCell));
          if (!itemName || /^(item|nome)$/i.test(itemName)) {
            continue;
          }

          const skill = skillColumn >= 0 ? cleanCellText($(cells[skillColumn])) : '';
          const craftTime = timeColumn >= 0 ? cleanCellText($(cells[timeColumn])) : '';
          const imageUrl = firstImageUrl($itemCell);
          const itemSlug = linkedItemSlug(itemName, itemIndex) || slugify(itemName);
          const columns = Object.fromEntries(
            cells.map((cell, index) => [headers[index] ?? `Coluna ${index + 1}`, cleanCellText($(cell))]),
          );
          const baseSlug = slugify(`professor-alquimista-${currentSection}-${itemName}`);
          const duplicateCount = seenCrafts.get(baseSlug) ?? 0;
          seenCrafts.set(baseSlug, duplicateCount + 1);
          const craftSlug = duplicateCount ? `${baseSlug}-${duplicateCount + 1}` : baseSlug;
          const ingredients = extractIngredients($(cells[materialColumn]), itemIndex);

          producedItems.set(itemSlug, {
            slug: itemSlug,
            name: itemName,
            iconUrl: imageUrl,
            description: `Item produzido no Alchemy Lab por Professor Alquimista.`,
            section: currentSection,
            table: PAGE_TITLE,
            sourceUrl: sourceUrlForSection(currentSection),
            attributes: {
              Origem: PAGE_TITLE,
              Profissao: 'Professor',
              Especializacao: 'Alquimista',
              ...(skill ? { Habilidade: skill } : {}),
              ...(craftTime ? { 'Tempo de espera': craftTime } : {}),
              Materiais: ingredients.map((ingredient) => `${ingredient.quantity} ${ingredient.name}`.trim()).join(', '),
            },
          });

          itemIndex.set(slugify(itemName), itemSlug);
          itemIndex.set(slugify(normalizeMaterialName(itemName)), itemSlug);

          crafts.push({
            slug: craftSlug,
            itemName,
            itemSlug,
            imageUrl,
            profession: 'Professor',
            professionSlug: 'professor',
            subprofession: 'Alquimista',
            subprofessionSlug: 'alquimista',
            category: currentSection || PAGE_TITLE,
            rank: '',
            skill,
            craftTime,
            requirements: skill ? `Habilidade ${skill}` : '',
            sourcePage: PAGE_TITLE,
            sourceUrl: sourceUrlForSection(currentSection),
            columns,
            ingredients,
          });
        }
      }
    });

  return {
    items: [...producedItems.values()],
    crafts,
  };
}

function mergeAlchemyItems(payload: ItemsPayload, alchemyItems: ItemRecord[], summary: string, sections: ItemCategoryRecord['sections']) {
  const category: ItemCategoryRecord = {
    slug: 'alchemy-lab',
    title: 'Alchemy Lab',
    group: 'Profissoes',
    sourceUrl: SOURCE_URL,
    iconUrl: alchemyItems.find((item) => item.iconUrl)?.iconUrl ?? '',
    summary,
    sections,
    items: alchemyItems,
  };

  return {
    ...payload,
    scrapedAt: new Date().toISOString(),
    categories: [
      ...payload.categories.filter((existing) => existing.slug !== category.slug),
      category,
    ],
  };
}

function mergeAlchemyCrafts(payload: CraftsPayload, alchemyCrafts: CraftRecord[]) {
  return {
    ...payload,
    scrapedAt: new Date().toISOString(),
    crafts: [
      ...payload.crafts.filter((craft) => craft.sourcePage !== PAGE_TITLE),
      ...alchemyCrafts,
    ],
  };
}

async function main() {
  const [itemsPayload, craftsPayload, alchemyPage] = await Promise.all([
    readJson<ItemsPayload>(ITEMS_PATH),
    readJson<CraftsPayload>(CRAFTS_PATH),
    fetchPage(PAGE_TITLE),
  ]);
  const itemIndex = buildItemIndex(itemsPayload);
  const html = alchemyPage.parse.text['*'];
  const alchemy = parseAlchemyTables(html, itemIndex);

  if (!alchemy.items.length || !alchemy.crafts.length) {
    throw new Error('No Alchemy Lab items or crafts were parsed.');
  }

  await writeFile(
    ITEMS_PATH,
    `${JSON.stringify(mergeAlchemyItems(itemsPayload, alchemy.items, extractSummary(html), mapSections(alchemyPage.parse.sections)), null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    CRAFTS_PATH,
    `${JSON.stringify(mergeAlchemyCrafts(craftsPayload, alchemy.crafts), null, 2)}\n`,
    'utf8',
  );

  console.log(`Merged ${alchemy.items.length} Alchemy Lab items and ${alchemy.crafts.length} crafts.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
