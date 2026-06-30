import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const PROFESSIONS_PATH = resolve(ROOT_DIR, 'data/professions.json');
const ITEMS_PATH = resolve(ROOT_DIR, 'data/items.json');
const OUTPUT_PATH = resolve(ROOT_DIR, 'data/crafts.json');

type WikiParseResponse = {
  parse: {
    title: string;
    text: { '*': string };
  };
};

type ProfessionLinkRecord = {
  slug: string;
  title: string;
  kind: string;
  sourceUrl: string;
};

type ProfessionRecord = {
  slug: string;
  name: string;
  crafts: ProfessionLinkRecord[];
  specializations: ProfessionLinkRecord[];
  subsections: ProfessionLinkRecord[];
};

type ProfessionsPayload = {
  professions: ProfessionRecord[];
};

type ItemsPayload = {
  categories: Array<{
    items: Array<{ slug: string; name: string }>;
  }>;
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

type CraftPageRecord = {
  profession: string;
  professionSlug: string;
  subprofession: string;
  subprofessionSlug: string;
  title: string;
  sourceUrl: string;
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

function pageFromSourceUrl(sourceUrl: string) {
  const url = new URL(sourceUrl);
  const page = url.pathname.replace(/^\/index\.php\//, '').split('#')[0];
  return decodeURIComponent(page.replace(/_/g, ' '));
}

async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
}

async function fetchPage(page: string): Promise<WikiParseResponse> {
  const url = new URL('/api.php', WIKI_ORIGIN);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', page);
  url.searchParams.set('prop', 'text');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PXGTools/0.1 (crafts scraper)',
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

function removeProducedQuantity(name: string) {
  return normalizeText(name.replace(/\s+\((?:\d+x|x\d+)\)$/i, ''));
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
    ?? itemIndex.get(slugify(removeProducedQuantity(name)))
    ?? itemIndex.get(slugify(normalizeMaterialName(name)))
    ?? '';
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function quantityForMaterial(materialsText: string, materialName: string) {
  const normalizedName = normalizeText(materialName);
  const pluralName = normalizedName.endsWith('s') ? normalizedName : `${normalizedName}s`;
  const pattern = new RegExp(`(?:^|\\s)(\\d+(?:[.,]\\d+)?(?:\\s*x)?|\\d+K?)\\s+(${escapeRegExp(normalizedName)}|${escapeRegExp(pluralName)})(?=\\s|$)`, 'i');
  const match = normalizeText(materialsText).match(pattern);
  return match ? normalizeText(match[1]) : '';
}

function parseMaterialEntries(materialsText: string) {
  const entries: Array<{ quantity: string; name: string }> = [];
  const pattern = /(\d+(?:[.,]\d+)?(?:\s*x)?|[0-9]+K?)\s+(.+?)(?=\s+\d+(?:[.,]\d+)?(?:\s*x)?\s+|\s+[0-9]+K?\s+|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalizeText(materialsText))) !== null) {
    const name = normalizeText(match[2]).replace(/[.;,]$/g, '');

    if (name) {
      entries.push({
        quantity: normalizeText(match[1]),
        name,
      });
    }
  }

  return entries;
}

function extractIngredients($cell: cheerio.Cheerio<any>, itemIndex: Map<string, string>): CraftIngredientRecord[] {
  const materialsText = cleanCellText($cell);
  const parsedMaterials = parseMaterialEntries(materialsText);
  const seen = new Set<string>();

  return $cell
    .find('img')
    .toArray()
    .map((image, index) => {
      const attrs = image.attribs ?? {};
      const rawName = normalizeText(attrs.alt ?? attrs.title ?? '');
      const parsedMaterial = parsedMaterials[index];
      const name = parsedMaterial?.name || rawName.replace(/\.(?:png|gif|webp|jpg|jpeg)$/i, '') || materialsText;
      const iconUrl = attrs.src ? absoluteUrl(attrs.src) : '';
      return {
        name,
        itemSlug: linkedItemSlug(name, itemIndex),
        quantity: parsedMaterial?.quantity || quantityForMaterial(materialsText, name),
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

function inferSubprofession(profession: ProfessionRecord, link: ProfessionLinkRecord) {
  const title = normalizeText(link.title);
  const candidates = profession.specializations.map((specialization) => normalizeText(specialization.title));

  if (/cozinheiro/i.test(title)) {
    return 'Cozinheiro';
  }

  if (/decorator|decorador/i.test(title)) {
    return 'Decorador';
  }

  if (/designer/i.test(title)) {
    return 'Designer';
  }

  if (/hacker/i.test(title)) {
    return 'Hacker';
  }

  if (/mec[aÃ¢]nico|ammunition|factory/i.test(title)) {
    return 'MecÃ¢nico';
  }

  if (/alquimista|philosopher/i.test(title)) {
    return 'Alquimista';
  }

  if (/acad[eÃª]mico/i.test(title)) {
    return 'AcadÃªmico';
  }

  return candidates.find((candidate) => title.includes(candidate)) ?? '';
}

function shouldInspectLink(link: ProfessionLinkRecord) {
  return link.kind === 'craft'
    || link.kind === 'specialization'
    || link.kind === 'workshop'
    || /craft|workshop|factory|stone|computadores/i.test(link.title);
}

function collectCraftPages(professions: ProfessionRecord[]) {
  const pages = new Map<string, CraftPageRecord>();

  for (const profession of professions) {
    for (const link of [...profession.crafts, ...profession.subsections, ...profession.specializations]) {
      if (!shouldInspectLink(link)) {
        continue;
      }

      const subprofession = inferSubprofession(profession, link);
      pages.set(link.sourceUrl, {
        profession: profession.name,
        professionSlug: profession.slug,
        subprofession,
        subprofessionSlug: subprofession ? slugify(subprofession) : '',
        title: link.title,
        sourceUrl: link.sourceUrl,
      });
    }
  }

  return [...pages.values()];
}

function isCraftTable(headers: string[]) {
  const lowerHeaders = headers.map((header) => header.toLowerCase());
  return lowerHeaders.some((header) => /materiais|itens necess[aÃ¡]rios/.test(header))
    && lowerHeaders.some((header) => /item|comida|nome/.test(header));
}

function parseCraftTable(
  $: cheerio.CheerioAPI,
  table: any,
  page: CraftPageRecord,
  currentSection: string,
  itemIndex: Map<string, string>,
  seen: Map<string, number>,
) {
  const rows = $(table).find('tr').toArray();
  if (rows.length < 2) {
    return [];
  }

  const headerRow = rows.find((row) => $(row).children('th,td').length > 1);
  if (!headerRow) {
    return [];
  }

  const headers = $(headerRow)
    .children('th,td')
    .toArray()
    .map((cell, index) => normalizeText($(cell).text()) || `Column ${index + 1}`);

  if (!isCraftTable(headers)) {
    return [];
  }

  const dataRows = rows.slice(rows.indexOf(headerRow) + 1);
  const itemIndexInRow = headers.findIndex((header) => /^(item|comidas?|nome)$/i.test(header));
  const skillIndex = headers.findIndex((header) => /habilidade|skill/i.test(header));
  const timeIndex = headers.findIndex((header) => /tempo/i.test(header));
  const materialIndex = headers.findIndex((header) => /materiais|itens necess[aÃ¡]rios/i.test(header));
  const requirementIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header, index }) =>
      index !== skillIndex
      && index !== timeIndex
      && index !== materialIndex
      && index !== itemIndexInRow
      && /requisito|pode ser feito|feito em|rank|local/i.test(header),
    );
  const crafts: CraftRecord[] = [];

  for (const row of dataRows) {
    const cells = $(row).children('th,td').toArray();
    if (cells.length < 2) {
      continue;
    }

    const $itemCell = $(cells[itemIndexInRow >= 0 ? itemIndexInRow : 0]);
    const itemName = cleanCellText($itemCell);
    if (!itemName || /^(item|comida|nome)$/i.test(itemName)) {
      continue;
    }

    const columns = Object.fromEntries(cells.map((cell, index) => [headers[index] ?? `Column ${index + 1}`, cleanCellText($(cell))]));
    const requirementParts = requirementIndexes
      .map(({ header, index }) => columns[header])
      .filter(Boolean);
    const skill = skillIndex >= 0 ? cleanCellText($(cells[skillIndex])) : '';
    const rank = /^Rank\s+[A-Z]$/i.test(currentSection) ? currentSection : '';
    const baseSlug = slugify(`${page.profession}-${page.subprofession || 'geral'}-${currentSection}-${itemName}`);
    const duplicateCount = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, duplicateCount + 1);

    crafts.push({
      slug: duplicateCount ? `${baseSlug}-${duplicateCount + 1}` : baseSlug,
      itemName,
      itemSlug: linkedItemSlug(itemName, itemIndex),
      imageUrl: firstImageUrl($itemCell),
      profession: page.profession,
      professionSlug: page.professionSlug,
      subprofession: page.subprofession,
      subprofessionSlug: page.subprofessionSlug,
      category: currentSection || page.title,
      rank,
      skill,
      craftTime: timeIndex >= 0 ? cleanCellText($(cells[timeIndex])) : '',
      requirements: [...(skill ? [skill] : []), ...requirementParts].join(' | '),
      sourcePage: page.title,
      sourceUrl: `${page.sourceUrl}${rank ? `#${rank.replace(/\s+/g, '_')}` : ''}`,
      columns,
      ingredients: materialIndex >= 0 ? extractIngredients($(cells[materialIndex]), itemIndex) : [],
    });
  }

  return crafts;
}

function parseCraftsFromHtml(html: string, page: CraftPageRecord, itemIndex: Map<string, string>) {
  const $ = cheerio.load(html);
  $('.toc, script, style, table.seeMore').remove();
  const seen = new Map<string, number>();
  const crafts: CraftRecord[] = [];
  let currentSection = page.title;

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
        crafts.push(...parseCraftTable($, table, page, currentSection, itemIndex, seen));
      }
    });

  return crafts;
}

async function main() {
  const professions = await readJson<ProfessionsPayload>(PROFESSIONS_PATH);
  const items = await readJson<ItemsPayload>(ITEMS_PATH);
  const itemIndex = buildItemIndex(items);
  const craftPages = collectCraftPages(professions.professions);
  const crafts: CraftRecord[] = [];

  for (const [index, page] of craftPages.entries()) {
    console.log(`Scraping ${index + 1}/${craftPages.length}: ${page.title}`);
    const detail = await fetchPage(pageFromSourceUrl(page.sourceUrl));
    crafts.push(...parseCraftsFromHtml(detail.parse.text['*'], page, itemIndex));
  }

  const payload = {
    sourceUrl: professions.professions.map((profession) => profession.crafts.map((link) => link.sourceUrl)).flat()[0] ?? '',
    scrapedAt: new Date().toISOString(),
    crafts,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${crafts.length} crafts to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
