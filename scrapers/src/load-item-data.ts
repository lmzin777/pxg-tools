import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadProjectEnv, ROOT_DIR } from './env.js';

const { Pool } = pg;
const ITEMS_PATH = resolve(ROOT_DIR, 'data/items.json');

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
  categories: ItemCategoryRecord[];
};

async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
}

async function insertChunked(
  client: pg.PoolClient,
  tableName: string,
  columns: string[],
  rows: unknown[][],
  chunkSize = 1000,
) {
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const values = chunk.flat();
    const placeholders = chunk
      .map((row, rowIndex) => {
        const offset = rowIndex * columns.length;
        return `(${row.map((_, columnIndex) => `$${offset + columnIndex + 1}`).join(', ')})`;
      })
      .join(', ');

    await client.query(`insert into ${tableName} (${columns.join(', ')}) values ${placeholders}`, values);
  }
}

async function main() {
  loadProjectEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to load item data into PostgreSQL.');
  }

  const payload = await readJson<ItemsPayload>(ITEMS_PATH);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query("insert into sync_runs (source, scope, status, started_at, message) values ($1, $2, $3, now(), $4)", [
      payload.sourceUrl,
      'items',
      'running',
      'Loading item JSON into PostgreSQL.',
    ]);

    await client.query('delete from item_categories');

    for (const [categoryIndex, category] of payload.categories.entries()) {
      const categoryResult = await client.query<{ id: string }>(
        `
          insert into item_categories (slug, title, group_name, summary, icon_url, source_url, sort_order)
          values ($1, $2, $3, $4, $5, $6, $7)
          returning id
        `,
        [category.slug, category.title, category.group, category.summary, category.iconUrl, category.sourceUrl, categoryIndex],
      );
      const categoryId = categoryResult.rows[0].id;

      const sectionRows = category.sections.map((section, index) => [
        categoryId,
        section.title,
        section.anchor,
        section.level,
        index,
      ]);
      await insertChunked(
        client,
        'item_category_sections',
        ['category_id', 'title', 'anchor', 'level', 'sort_order'],
        sectionRows,
      );

      const itemRows = category.items.map((item, index) => [
        categoryId,
        item.slug,
        item.name,
        item.iconUrl,
        item.description,
        item.section,
        item.table,
        item.sourceUrl,
        JSON.stringify(item.attributes ?? {}),
        index,
      ]);

      if (!itemRows.length) {
        continue;
      }

      const itemColumns = [
        'category_id',
        'slug',
        'name',
        'icon_url',
        'description',
        'section_title',
        'table_title',
        'source_url',
        'attributes_json',
        'sort_order',
      ];
      const placeholders = itemRows
        .map((row, rowIndex) => {
          const offset = rowIndex * itemColumns.length;
          return `(${row.map((_, columnIndex) => `$${offset + columnIndex + 1}`).join(', ')})`;
        })
        .join(', ');
      const itemResult = await client.query<{ id: string; slug: string; sort_order: number }>(
        `
          insert into items (${itemColumns.join(', ')})
          values ${placeholders}
          returning id, slug, sort_order
        `,
        itemRows.flat(),
      );
      const itemIds = new Map(itemResult.rows.map((row) => [`${row.slug}:${row.sort_order}`, row.id]));
      const attributeRows: unknown[][] = [];

      for (const [itemIndex, item] of category.items.entries()) {
        const itemId = itemIds.get(`${item.slug}:${itemIndex}`);
        if (!itemId) {
          continue;
        }

        Object.entries(item.attributes ?? {}).forEach(([name, value], attributeIndex) => {
          if (value) {
            attributeRows.push([itemId, name, value, attributeIndex]);
          }
        });
      }

      await insertChunked(
        client,
        'item_attributes',
        ['item_id', 'name', 'value', 'sort_order'],
        attributeRows,
      );
    }

    await client.query("update sync_runs set status = 'succeeded', finished_at = now(), message = $1 where scope = 'items' and status = 'running'", [
      'Item data loaded successfully.',
    ]);
    await client.query('commit');
    console.log(`Loaded ${payload.categories.length} item categories into PostgreSQL.`);
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
