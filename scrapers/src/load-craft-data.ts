import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadProjectEnv, ROOT_DIR } from './env.js';

const { Pool } = pg;
const CRAFTS_PATH = resolve(ROOT_DIR, 'data/crafts.json');

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
  crafts: CraftRecord[];
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
    if (chunk.length === 0) {
      continue;
    }

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

function createCraftRows(crafts: CraftRecord[]) {
  return crafts.map((craft, index) => [
    craft.slug,
    craft.itemName,
    craft.itemSlug ?? '',
    craft.imageUrl ?? '',
    craft.profession,
    craft.professionSlug,
    craft.subprofession ?? '',
    craft.subprofessionSlug ?? '',
    craft.category ?? '',
    craft.rank ?? '',
    craft.skill ?? '',
    craft.craftTime ?? '',
    craft.requirements ?? '',
    craft.sourcePage ?? '',
    craft.sourceUrl ?? '',
    JSON.stringify(craft.columns ?? {}),
    index,
  ]);
}

async function main() {
  loadProjectEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to load craft data into PostgreSQL.');
  }

  const payload = await readJson<CraftsPayload>(CRAFTS_PATH);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query("insert into sync_runs (source, scope, status, started_at, message) values ($1, $2, $3, now(), $4)", [
      payload.sourceUrl,
      'crafts',
      'running',
      'Loading craft JSON into PostgreSQL.',
    ]);

    await client.query('delete from crafts');

    const craftColumns = [
      'slug',
      'item_name',
      'item_slug',
      'image_url',
      'profession_name',
      'profession_slug',
      'subprofession_name',
      'subprofession_slug',
      'category',
      'rank_name',
      'skill',
      'craft_time',
      'requirements',
      'source_page',
      'source_url',
      'columns_json',
      'sort_order',
    ];
    const craftRows = createCraftRows(payload.crafts);
    const placeholders = craftRows
      .map((row, rowIndex) => {
        const offset = rowIndex * craftColumns.length;
        return `(${row.map((_, columnIndex) => `$${offset + columnIndex + 1}`).join(', ')})`;
      })
      .join(', ');
    const craftResult = await client.query<{ id: string; slug: string; sort_order: number }>(
      `
        insert into crafts (${craftColumns.join(', ')})
        values ${placeholders}
        returning id, slug, sort_order
      `,
      craftRows.flat(),
    );
    const craftIds = new Map(craftResult.rows.map((row) => [`${row.slug}:${row.sort_order}`, row.id]));
    const ingredientRows: unknown[][] = [];

    for (const [craftIndex, craft] of payload.crafts.entries()) {
      const craftId = craftIds.get(`${craft.slug}:${craftIndex}`);
      if (!craftId) {
        continue;
      }

      for (const [ingredientIndex, ingredient] of (craft.ingredients ?? []).entries()) {
        ingredientRows.push([
          craftId,
          ingredient.name,
          ingredient.itemSlug ?? '',
          ingredient.quantity ?? '',
          ingredient.iconUrl ?? '',
          ingredientIndex,
        ]);
      }
    }

    await insertChunked(
      client,
      'craft_ingredients',
      ['craft_id', 'name', 'item_slug', 'quantity', 'icon_url', 'sort_order'],
      ingredientRows,
    );

    await client.query("update sync_runs set status = 'succeeded', finished_at = now(), message = $1 where scope = 'crafts' and status = 'running'", [
      'Craft data loaded successfully.',
    ]);
    await client.query('commit');
    console.log(`Loaded ${payload.crafts.length} crafts into PostgreSQL.`);
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
