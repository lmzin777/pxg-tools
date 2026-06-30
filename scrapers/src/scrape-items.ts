import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const PAGE_TITLE = 'Itens Gerais';
const OUTPUT_PATH = resolve(ROOT_DIR, 'data/items.json');

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

function fixMojibake(value: string) {
  return /Ã|Â/.test(value) ? Buffer.from(value, 'latin1').toString('utf8') : value;
}

function normalizeText(value: string) {
  return fixMojibake(value.replace(/\s+/g, ' ').trim());
}

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

async function fetchPage(page: string): Promise<WikiParseResponse> {
  const url = new URL('/api.php', WIKI_ORIGIN);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', page);
  url.searchParams.set('prop', 'text|sections');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PXGTools/0.1 (items scraper)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WikiParseResponse;
}

function pageFromSourceUrl(sourceUrl: string) {
  const url = new URL(sourceUrl);
  const page = url.pathname.replace(/^\/index\.php\//, '').split('#')[0];
  return decodeURIComponent(page.replace(/_/g, ' '));
}

function cleanHeading(value: string) {
  return normalizeText(value.replace(/\[editar\]/g, ''));
}

function cleanCellText($cell: cheerio.Cheerio<any>) {
  const clone = $cell.clone();
  clone.find('img').remove();
  return normalizeText(clone.text());
}

function firstImageUrl($element: cheerio.Cheerio<any>) {
  const src = $element.find('img').first().attr('src') ?? '';
  return src ? absoluteUrl(src) : '';
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
    .find((text) => text.length > 80);

  if (paragraph) {
    return paragraph;
  }

  const text = normalizeText($('.mw-parser-output').text());
  const withoutIndex = text.includes('Índice') ? text.split('Índice')[0].trim() : text;
  return withoutIndex.length > 500 ? `${withoutIndex.slice(0, 497)}...` : withoutIndex;
}

function parseCategoryHub(html: string) {
  const $ = cheerio.load(html);
  const categories: Omit<ItemCategoryRecord, 'summary' | 'sections' | 'items'>[] = [];

  $('table.wikitable')
    .not('.seeMore')
    .each((_, table) => {
      const group = normalizeText($(table).find('th').first().text()) || 'Itens Gerais';

      $(table)
        .find('td')
        .each((__, cell) => {
          const $cell = $(cell);
          const link = $cell.find('a').last();
          const href = link.attr('href') ?? '';
          const title = normalizeText(link.text() || link.attr('title') || '');

          if (!href || !title) {
            return;
          }

          categories.push({
            slug: slugify(title),
            title,
            group,
            sourceUrl: absoluteUrl(href),
            iconUrl: firstImageUrl($cell),
          });
        });
    });

  return categories;
}

function descriptionFromAttributes(attributes: Record<string, string>) {
  const preferred = [
    'Descrição',
    'Descricao',
    'Utilidade',
    'Como conseguir',
    'Como Conseguir',
    'Obtenção',
    'Obtenção e utilização',
    'Efeito',
  ];

  return preferred.map((key) => attributes[key]).find(Boolean) ?? '';
}

function uniqueSlug(base: string, seen: Map<string, number>) {
  const current = seen.get(base) ?? 0;
  seen.set(base, current + 1);
  return current === 0 ? base : `${base}-${current + 1}`;
}

function parseItemFromCells(
  $: cheerio.CheerioAPI,
  cells: any[],
  headers: string[],
  category: string,
  section: string,
  tableTitle: string,
  sourceUrl: string,
  seen: Map<string, number>,
): ItemRecord | null {
  const $row = cheerio.load('<row></row>')('row');
  cells.forEach((cell) => $row.append($(cell).clone()));

  const attributes = Object.fromEntries(
    cells.map((cell, index) => [headers[index] || `Coluna ${index + 1}`, cleanCellText($(cell))]),
  );
  const exactNameIndex = headers.findIndex((header) => /^nome$/i.test(header));
  const semanticNameIndex = headers.findIndex((header) =>
    /^(item|token|moeda|berry|comida|holder|câmera|camera|mochila)$/i.test(header),
  );
  const nameIndex = exactNameIndex >= 0 ? exactNameIndex : semanticNameIndex;
  const firstUsefulText = cells.map((cell) => cleanCellText($(cell))).find(Boolean) ?? '';
  const linkTitle = normalizeText($row.find('a').first().attr('title') ?? '');
  const selectedName = nameIndex >= 0 ? cleanCellText($(cells[nameIndex])) : '';
  const name = selectedName
    ? selectedName
    : linkTitle || (cells.length > 1 ? cleanCellText($(cells[1])) : firstUsefulText);

  if (!name || /^(nome|item|ícone|icone|preço|preco|descrição|descricao)$/i.test(name)) {
    return null;
  }

  return {
    slug: uniqueSlug(slugify(name), seen),
    name,
    iconUrl: firstImageUrl($row),
    description: descriptionFromAttributes(attributes),
    section,
    table: tableTitle || category,
    sourceUrl,
    attributes,
  };
}

function parseCardCell(
  $: cheerio.CheerioAPI,
  cell: any,
  category: string,
  section: string,
  tableTitle: string,
  sourceUrl: string,
  seen: Map<string, number>,
): ItemRecord | null {
  const $cell = $(cell);
  const text = cleanCellText($cell);
  const linkTitle = normalizeText($cell.find('a').first().attr('title') ?? '');
  const name = text.split(/\s*\$|\s+\d/)[0]?.trim() || linkTitle || text;

  if (!name || name.length < 2) {
    return null;
  }

  return {
    slug: uniqueSlug(slugify(name), seen),
    name,
    iconUrl: firstImageUrl($cell),
    description: text,
    section,
    table: tableTitle || category,
    sourceUrl,
    attributes: {
      Texto: text,
    },
  };
}

function parseItemsFromTable(
  $: cheerio.CheerioAPI,
  table: any,
  category: string,
  section: string,
  sourceUrl: string,
  seen: Map<string, number>,
) {
  const $table = $(table);

  if ($table.hasClass('seeMore')) {
    return [];
  }

  const rows = $table.find('tr').toArray();
  const headerRowIndex = rows.findIndex((row) => $(row).children('th').length > 1);
  const titleRows = headerRowIndex > 0 ? rows.slice(0, headerRowIndex) : [];
  const headerCells = headerRowIndex >= 0 ? $(rows[headerRowIndex]).children('th').toArray() : [];
  const headers = headerCells.map((cell) => normalizeText($(cell).text())).filter(Boolean);
  const tableTitle = titleRows
    .map((row) => normalizeText($(row).text()))
    .filter(Boolean)
    .join(' / ');
  const dataRows = headers.length ? rows.slice(headerRowIndex + 1) : rows;
  const itemHeaders = headers.length > 1 ? headers : [];
  const items: ItemRecord[] = [];

  for (const row of dataRows) {
    const cells = $(row).children('td').toArray();

    if (!cells.length) {
      continue;
    }

    if (itemHeaders.length && cells.length >= itemHeaders.length) {
      for (let index = 0; index + itemHeaders.length <= cells.length; index += itemHeaders.length) {
        const item = parseItemFromCells(
          $,
          cells.slice(index, index + itemHeaders.length),
          itemHeaders,
          category,
          section,
          tableTitle,
          sourceUrl,
          seen,
        );

        if (item) {
          items.push(item);
        }
      }
      continue;
    }

    for (const cell of cells) {
      const item = parseCardCell($, cell, category, section, tableTitle, sourceUrl, seen);
      if (item) {
        items.push(item);
      }
    }
  }

  return items;
}

function parseCategoryItems(html: string, category: string, sourceUrl: string) {
  const $ = cheerio.load(html);
  const items: ItemRecord[] = [];
  const seen = new Map<string, number>();
  let currentSection = category;

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
        items.push(...parseItemsFromTable($, table, category, currentSection, sourceUrl, seen));
      }
    });

  return items;
}

async function main() {
  const hub = await fetchPage(PAGE_TITLE);
  const categories = parseCategoryHub(hub.parse.text['*']);
  const enrichedCategories: ItemCategoryRecord[] = [];

  for (const [index, category] of categories.entries()) {
    console.log(`Scraping ${index + 1}/${categories.length}: ${category.title}`);
    const detail = await fetchPage(pageFromSourceUrl(category.sourceUrl));
    const html = detail.parse.text['*'];

    enrichedCategories.push({
      ...category,
      summary: extractSummary(html),
      sections: mapSections(detail.parse.sections),
      items: parseCategoryItems(html, category.title, category.sourceUrl),
    });
  }

  const payload = {
    sourceUrl: `${WIKI_ORIGIN}/index.php/Itens_Gerais`,
    scrapedAt: new Date().toISOString(),
    categories: enrichedCategories,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${enrichedCategories.length} item categories to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
