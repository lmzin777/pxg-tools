import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadProjectEnv, ROOT_DIR } from './env.js';

const { Pool } = pg;
const PROFESSIONS_PATH = resolve(ROOT_DIR, 'data/professions.json');

type SectionRecord = {
  title: string;
  anchor: string;
  level: number;
};

type ProfessionLinkRecord = {
  slug: string;
  title: string;
  kind: string;
  sourceUrl: string;
  iconUrl: string;
  summary: string;
  sections: SectionRecord[];
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

type ProfessionRecord = {
  slug: string;
  name: string;
  sourceUrl: string;
  iconUrl: string;
  summary: string;
  sections: SectionRecord[];
  crafts: ProfessionLinkRecord[];
  specializations: ProfessionLinkRecord[];
  subsections: ProfessionLinkRecord[];
};

type ProfessionsPayload = {
  sourceUrl: string;
  intro: string;
  professions: ProfessionRecord[];
  relatedLinks: ProfessionLinkRecord[];
};

async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
}

async function insertSections(
  client: pg.PoolClient,
  table: string,
  keyColumn: string,
  ownerId: string,
  sections: SectionRecord[],
) {
  for (const [index, section] of sections.entries()) {
    await client.query(
      `insert into ${table} (${keyColumn}, title, anchor, level, sort_order) values ($1, $2, $3, $4, $5)`,
      [ownerId, section.title, section.anchor, section.level, index],
    );
  }
}

async function insertProfessionLinks(
  client: pg.PoolClient,
  professionId: string,
  links: ProfessionLinkRecord[],
) {
  for (const [index, link] of links.entries()) {
    const result = await client.query<{ id: string }>(
      `
        insert into profession_links
          (profession_id, slug, title, kind, summary, icon_url, source_url, sort_order)
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning id
      `,
      [professionId, link.slug, link.title, link.kind, link.summary, link.iconUrl, link.sourceUrl, index],
    );

    const professionLinkId = result.rows[0].id;
    await insertSections(client, 'profession_link_sections', 'profession_link_id', professionLinkId, link.sections);
    await insertCraftItems(client, professionLinkId, link.craftItems ?? []);
  }
}

async function insertCraftItems(
  client: pg.PoolClient,
  professionLinkId: string,
  craftItems: CraftItemRecord[],
) {
  for (const [index, item] of craftItems.entries()) {
    const result = await client.query<{ id: string }>(
      `
        insert into profession_craft_items
          (profession_link_id, rank_name, item_name, icon_url, skill, cooldown, materials_text, columns_json, source_url, sort_order)
        values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
        returning id
      `,
      [
        professionLinkId,
        item.rank,
        item.name,
        item.iconUrl,
        item.skill,
        item.cooldown,
        item.materialsText,
        JSON.stringify(item.columns ?? {}),
        item.sourceUrl,
        index,
      ],
    );

    const craftItemId = result.rows[0].id;
    for (const [materialIndex, material] of (item.materials ?? []).entries()) {
      await client.query(
        `
          insert into profession_craft_materials
            (craft_item_id, material_name, quantity, icon_url, sort_order)
          values ($1, $2, $3, $4, $5)
        `,
        [craftItemId, material.name, material.quantity, material.iconUrl, materialIndex],
      );
    }
  }
}

async function main() {
  loadProjectEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to load profession data into PostgreSQL.');
  }

  const payload = await readJson<ProfessionsPayload>(PROFESSIONS_PATH);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query("insert into sync_runs (source, scope, status, started_at, message) values ($1, $2, $3, now(), $4)", [
      payload.sourceUrl,
      'professions',
      'running',
      'Loading profession JSON into PostgreSQL.',
    ]);

    await client.query('delete from profession_related_links');
    await client.query('delete from professions');

    for (const [index, profession] of payload.professions.entries()) {
      const result = await client.query<{ id: string }>(
        `
          insert into professions (slug, name, summary, icon_url, source_url, sort_order)
          values ($1, $2, $3, $4, $5, $6)
          returning id
        `,
        [profession.slug, profession.name, profession.summary, profession.iconUrl, profession.sourceUrl, index],
      );
      const professionId = result.rows[0].id;

      await insertSections(client, 'profession_sections', 'profession_id', professionId, profession.sections);
      await insertProfessionLinks(client, professionId, profession.crafts);
      await insertProfessionLinks(client, professionId, profession.specializations);
      await insertProfessionLinks(client, professionId, profession.subsections);
    }

    for (const [index, link] of payload.relatedLinks.entries()) {
      await client.query(
        `
          insert into profession_related_links (slug, title, kind, summary, icon_url, source_url, sort_order)
          values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [link.slug, link.title, link.kind, link.summary, link.iconUrl, link.sourceUrl, index],
      );
    }

    await client.query("update sync_runs set status = 'succeeded', finished_at = now(), message = $1 where scope = 'professions' and status = 'running'", [
      'Profession data loaded successfully.',
    ]);
    await client.query('commit');
    console.log(`Loaded ${payload.professions.length} professions into PostgreSQL.`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
