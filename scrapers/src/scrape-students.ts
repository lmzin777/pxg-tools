import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { ROOT_DIR } from './env.js';

const WIKI_ORIGIN = 'https://wiki.pokexgames.com';
const OUTPUT_PATH = resolve(ROOT_DIR, 'data/professor-students.json');

type WikiParseResponse = {
  parse: {
    text: { '*': string };
  };
};

function absoluteUrl(value: string) {
  return value ? new URL(value, WIKI_ORIGIN).toString() : '';
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

async function fetchStudentsPage() {
  const url = new URL('/api.php', WIKI_ORIGIN);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', 'Estudantes');
  url.searchParams.set('prop', 'text');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PXGTools/0.1 (students scraper)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Estudantes: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WikiParseResponse;
}

async function main() {
  const payload = await fetchStudentsPage();
  const $ = cheerio.load(payload.parse.text['*']);
  const groups: Array<{
    clan: string;
    students: Array<{
      name: string;
      level: number;
      iconUrl: string;
      pokemon: Array<{ name: string; iconUrl: string }>;
    }>;
  }> = [];

  $('.tabber__panel').each((_, panel) => {
    const clan = normalizeText($(panel).attr('data-title') || '');
    const students: Array<{
      name: string;
      level: number;
      iconUrl: string;
      pokemon: Array<{ name: string; iconUrl: string }>;
    }> = [];

    $(panel).find('table tr').each((__, row) => {
      const cells = $(row).children('td');
      if (cells.length < 3) {
        return;
      }

      const cardCell = cells.eq(0);
      const levelCell = cells.eq(1);
      const pokemonCell = cells.eq(2);
      const cardText = normalizeText(cardCell.text());
      const level = Number(normalizeText(levelCell.text()));
      const nameMatch = cardText.match(/(.+?Student Card)/i);

      if (!nameMatch || !Number.isFinite(level)) {
        return;
      }

      const pokemon = pokemonCell.find('img').toArray().map((image) => {
        const attrs = image.attribs ?? {};
        return {
          name: normalizeText(attrs.alt || attrs.title || '').replace(/\.(?:png|gif|webp|jpg|jpeg)$/i, ''),
          iconUrl: absoluteUrl(attrs.src || ''),
        };
      }).filter((entry) => entry.name && entry.iconUrl);

      students.push({
        name: normalizeText(nameMatch[1]),
        level,
        iconUrl: absoluteUrl(cardCell.find('img').first().attr('src') || ''),
        pokemon,
      });
    });

    if (clan && students.length) {
      groups.push({ clan, students });
    }
  });

  await writeFile(OUTPUT_PATH, `${JSON.stringify({ sourceUrl: `${WIKI_ORIGIN}/index.php/Estudantes`, groups }, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${groups.reduce((sum, group) => sum + group.students.length, 0)} students to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
