import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const PAGE_TITLE = 'Profissões';
const OUTPUT_PATH = resolve(ROOT_DIR, 'data/professions.json');
const PRIMARY_PROFESSIONS = ['Engenheiro', 'Professor', 'Estilista', 'Aventureiro'];
const SPECIALIZATIONS = new Set([
  'Mecânico',
  'Hacker',
  'Alquimista',
  'Acadêmico',
  'Decorador',
  'Designer',
  'Cozinheiro',
  'Arqueólogo',
]);

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

type LinkRecord = {
  slug: string;
  title: string;
  kind: string;
  sourceUrl: string;
  iconUrl: string;
  summary: string;
  sections: Array<{ title: string; anchor: string; level: number }>;
  craftItems: CraftItemRecord[];
};

type CraftMaterialRecord = {
  name: string;
  quantity: string;
  iconUrl: string;
};

type CraftItemRecord = {
  rank: string;
  name: string;
  iconUrl: string;
  skill: string;
  cooldown: string;
  materialsText: string;
  materials: CraftMaterialRecord[];
  columns: Record<string, string>;
  sourceUrl: string;
};

type RawLink = {
  title: string;
  sourceUrl: string;
  iconUrl: string;
};

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

function pageFromSourceUrl(sourceUrl: string) {
  const url = new URL(sourceUrl);
  const page = url.pathname.replace(/^\/index\.php\//, '').split('#')[0];
  return decodeURIComponent(page.replace(/_/g, ' '));
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
      'User-Agent': 'PXGTools/0.1 (professions scraper)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WikiParseResponse;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
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
  return withoutIndex.length > 600 ? `${withoutIndex.slice(0, 597)}...` : withoutIndex;
}

function mapSections(sections: WikiSection[] = []) {
  return sections.map((section) => ({
    title: section.line,
    anchor: section.anchor,
    level: Number(section.level),
  }));
}

function cleanHeading(value: string) {
  return normalizeText(value.replace(/\[editar\]/g, ''));
}

function extractCellText($cell: cheerio.Cheerio<any>) {
  const clone = $cell.clone();
  clone.find('img').remove();
  return normalizeText(clone.text());
}

function extractFirstImageUrl($cell: cheerio.Cheerio<any>) {
  const src = $cell.find('img').first().attr('src') ?? '';
  return src ? absoluteUrl(src) : '';
}

function extractMaterials($cell: cheerio.Cheerio<any>) {
  const materialsText = extractCellText($cell);
  const images = $cell
    .find('img')
    .toArray()
    .map((image) => {
      const attrs = image.attribs ?? {};
      const src = attrs.src ?? '';
      const title = attrs.alt ?? '';
      return {
        name: title ? normalizeText(title) : materialsText,
        quantity: '',
        iconUrl: src ? absoluteUrl(src) : '',
      };
    })
    .filter((material) => material.name || material.iconUrl);

  if (images.length) {
    return { materialsText, materials: images };
  }

  return {
    materialsText,
    materials: materialsText ? [{ name: materialsText, quantity: '', iconUrl: '' }] : [],
  };
}

function parseCraftTable(
  $: cheerio.CheerioAPI,
  table: any,
  rank: string,
  sourceUrl: string,
): CraftItemRecord[] {
  const rows = $(table).find('tr').toArray();
  if (rows.length < 2) {
    return [];
  }

  const headers = $(rows[0])
    .children('th,td')
    .toArray()
    .map((cell, index) => normalizeText($(cell).text()) || `Column ${index + 1}`);

  return rows.slice(1).flatMap((row): CraftItemRecord[] => {
    const cells = $(row).children('th,td').toArray();
    if (cells.length < 2) {
      return [];
    }

    const $itemCell = $(cells[0]);
    const name = extractCellText($itemCell);
    if (!name) {
      return [];
    }

    const columns = Object.fromEntries(
      cells.map((cell, index) => [headers[index] ?? `Column ${index + 1}`, extractCellText($(cell))]),
    );
    const materialCell = cells[3] ? $(cells[3]) : cheerio.load('')('body');
    const materialInfo = extractMaterials(materialCell);

    return [
      {
        rank,
        name,
        iconUrl: extractFirstImageUrl($itemCell),
        skill: cells[1] ? extractCellText($(cells[1])) : '',
        cooldown: cells[2] ? extractCellText($(cells[2])) : '',
        materialsText: materialInfo.materialsText,
        materials: materialInfo.materials,
        columns,
        sourceUrl: `${sourceUrl}#${rank.replace(/\s+/g, '_')}`,
      },
    ];
  });
}

function parseCraftItems(html: string, sourceUrl: string): CraftItemRecord[] {
  const $ = cheerio.load(html);
  $('.toc, script, style').remove();

  const items: CraftItemRecord[] = [];
  let currentRank = '';

  $('.mw-parser-output')
    .children()
    .each((_, element) => {
      const tag = element.tagName?.toLowerCase() ?? '';

      if (/^h[1-6]$/.test(tag)) {
        const heading = cleanHeading($(element).text());
        currentRank = /^Rank\s+[A-Z]$/i.test(heading) ? heading : '';
        return;
      }

      if (tag === 'table' && currentRank) {
        items.push(...parseCraftTable($, element, currentRank, sourceUrl));
      }
    });

  return items;
}

function classifyLink(title: string) {
  if (title.startsWith('Craft Profissões') || title.startsWith('Crafts de')) {
    return 'craft';
  }

  if (SPECIALIZATIONS.has(title)) {
    return 'specialization';
  }

  if (title.includes('Workshop')) {
    return 'workshop';
  }

  if (title.includes('Recursos')) {
    return 'resource';
  }

  if (title.includes('Minigame')) {
    return 'minigame';
  }

  if (title.includes('Quantias')) {
    return 'collection';
  }

  return 'subsection';
}

async function enrichLink(raw: Omit<LinkRecord, 'summary' | 'sections' | 'craftItems'>): Promise<LinkRecord> {
  const detail = await fetchPage(pageFromSourceUrl(raw.sourceUrl));
  const html = detail.parse.text['*'];

  return {
    ...raw,
    summary: extractSummary(html),
    sections: mapSections(detail.parse.sections),
    craftItems: raw.kind === 'craft' ? parseCraftItems(html, raw.sourceUrl) : [],
  };
}

async function main() {
  const page = await fetchPage(PAGE_TITLE);
  const $ = cheerio.load(page.parse.text['*']);
  const intro = extractSummary(page.parse.text['*']);
  const grid = $('table.hover-minimizeAndRotate').first();
  const matrix = grid
    .find('tr')
    .toArray()
    .map((row) =>
      $(row)
        .find('td')
        .toArray()
        .map((cell): RawLink | null => {
          const link = $(cell).find('a').first();
          const image = link.find('img').first();
          const title = link.attr('title')?.trim() ?? '';
          const href = link.attr('href') ?? '';

          if (!title || !href) {
            return null;
          }

          return {
            title: title === 'Arqueólogo' && href.includes('#Dungeons') ? 'Dungeons de Arqueólogo' : title,
            sourceUrl: absoluteUrl(href),
            iconUrl: image.attr('src') ? absoluteUrl(image.attr('src') ?? '') : '',
          };
        }),
    );

  const professions = [];

  for (let column = 0; column < PRIMARY_PROFESSIONS.length; column += 1) {
    const primary = matrix[0]?.[column];
    if (!primary || !PRIMARY_PROFESSIONS.includes(primary.title)) {
      continue;
    }

    const primaryDetail = await fetchPage(primary.title);
    const rawLinks = matrix
      .slice(1)
      .map((row) => row[column])
      .filter((link): link is RawLink => Boolean(link));
    const enrichedLinks = await Promise.all(
      rawLinks.map((link) =>
        enrichLink({
          slug: slugify(link.title),
          title: link.title,
          kind: classifyLink(link.title),
          sourceUrl: link.sourceUrl,
          iconUrl: link.iconUrl,
        }),
      ),
    );

    professions.push({
      slug: slugify(primary.title),
      name: primary.title,
      sourceUrl: primary.sourceUrl,
      iconUrl: primary.iconUrl,
      summary: extractSummary(primaryDetail.parse.text['*']),
      sections: mapSections(primaryDetail.parse.sections),
      crafts: enrichedLinks.filter((link) => link.kind === 'craft'),
      specializations: enrichedLinks.filter((link) => link.kind === 'specialization'),
      subsections: enrichedLinks.filter((link) => link.kind !== 'craft' && link.kind !== 'specialization'),
    });
  }

  const relatedLinks = await Promise.all(
    $('table.seeMore a')
      .toArray()
      .map((element) => {
        const title = $(element).attr('title')?.trim() ?? normalizeText($(element).text());
        const href = $(element).attr('href') ?? '';
        return enrichLink({
          slug: slugify(title),
          title,
          kind: classifyLink(title),
          sourceUrl: absoluteUrl(href),
          iconUrl: '',
        });
      }),
  );

  const payload = {
    sourceUrl: `${WIKI_ORIGIN}/index.php/Profiss%C3%B5es`,
    scrapedAt: new Date().toISOString(),
    intro,
    professions,
    relatedLinks,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${professions.length} professions to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
