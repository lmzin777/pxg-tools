import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadProjectEnv, ROOT_DIR } from './env.js';
import { getWikiDomain } from './wiki-domains.js';

const { Pool } = pg;

type WikiEntityRecord = {
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  metadata: Record<string, string>;
};

type WikiDomainPayload = {
  domain: string;
  title: string;
  description: string;
  priority: number;
  sourceUrl: string;
  scrapedAt: string;
  records: WikiEntityRecord[];
};

async function main() {
  loadProjectEnv();

  const domain = process.argv[2];
  if (!domain) {
    throw new Error('Usage: npm run db:load-wiki -- <domain>');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to load wiki domain data into PostgreSQL.');
  }

  const config = getWikiDomain(domain);
  const payload = await readJson<WikiDomainPayload>(resolve(ROOT_DIR, 'data', `wiki-${config.domain}.json`));
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query("insert into sync_runs (source, scope, status, started_at, message) values ($1, $2, $3, now(), $4)", [
      payload.sourceUrl,
      payload.domain,
      'running',
      `Loading ${payload.domain} JSON into PostgreSQL.`,
    ]);
    await client.query(
      `
        insert into wiki_domains (domain, title, description, priority, source_url, scraper_script, loader_script, status, updated_at)
        values ($1, $2, $3, $4, $5, $6, $7, 'loaded', now())
        on conflict (domain) do update set
          title = excluded.title,
          description = excluded.description,
          priority = excluded.priority,
          source_url = excluded.source_url,
          scraper_script = excluded.scraper_script,
          loader_script = excluded.loader_script,
          status = excluded.status,
          updated_at = now()
      `,
      [
        payload.domain,
        payload.title,
        payload.description,
        payload.priority,
        payload.sourceUrl,
        `scrape:${payload.domain}`,
        `db:load-wiki -- ${payload.domain}`,
      ],
    );
    await client.query('delete from wiki_entities where domain = $1', [payload.domain]);

    for (const [index, record] of payload.records.entries()) {
      await client.query(
        `
          insert into wiki_entities (domain, slug, name, summary, image_url, source_url, metadata_json, scraped_at, sort_order)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict (domain, slug) do update set
            name = excluded.name,
            summary = excluded.summary,
            image_url = excluded.image_url,
            source_url = excluded.source_url,
            metadata_json = excluded.metadata_json,
            scraped_at = excluded.scraped_at,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [
          payload.domain,
          record.slug,
          record.name,
          record.summary ?? '',
          record.imageUrl ?? '',
          record.sourceUrl ?? payload.sourceUrl,
          JSON.stringify(record.metadata ?? {}),
          payload.scrapedAt,
          index,
        ],
      );
    }

    await client.query("update sync_runs set status = 'succeeded', finished_at = now(), records_loaded = $1, message = $2 where scope = $3 and status = 'running'", [
      payload.records.length,
      `${payload.domain} data loaded successfully.`,
      payload.domain,
    ]);
    await client.query('commit');
    console.log(`Loaded ${payload.records.length} ${payload.domain} records into PostgreSQL.`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
