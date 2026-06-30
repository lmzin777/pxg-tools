import * as cheerio from 'cheerio';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ROOT_DIR } from './env.js';
import { getWikiDomain } from './wiki-domains.js';

type WikiEntityRecord = {
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  metadata: Record<string, string>;
};

async function main() {
  const domain = process.argv[2];
  if (!domain) {
    throw new Error('Usage: npm run scrape:wiki-domain -- <domain>');
  }

  const config = getWikiDomain(domain);
  const response = await fetch(config.sourceUrl, {
    headers: { 'user-agent': 'pxg-tools-scraper/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${config.sourceUrl}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const records = extractSectionRecords($, config.sourceUrl);
  const payload = {
    domain: config.domain,
    title: config.title,
    description: config.description,
    priority: config.priority,
    sourceUrl: config.sourceUrl,
    scrapedAt: new Date().toISOString(),
    records,
  };

  await mkdir(resolve(ROOT_DIR, 'data'), { recursive: true });
  await writeFile(resolve(ROOT_DIR, 'data', `wiki-${config.domain}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Scraped ${records.length} records for ${config.domain}.`);
}

function extractSectionRecords($: cheerio.CheerioAPI, sourceUrl: string): WikiEntityRecord[] {
  const records: WikiEntityRecord[] = [];

  $('h2, h3').each((index, element) => {
    const heading = $(element);
    const name = heading.text().replace(/\[editar\]/gi, '').trim();
    if (!name || /^contents$/i.test(name)) {
      return;
    }

    const summary = heading
      .nextUntil('h2, h3')
      .filter('p')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    records.push({
      slug: slugify(name),
      name,
      summary,
      imageUrl: '',
      sourceUrl,
      metadata: { headingLevel: element.tagName.toLowerCase(), sourceIndex: String(index) },
    });
  });

  return records;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
