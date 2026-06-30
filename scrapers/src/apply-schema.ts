import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadProjectEnv, ROOT_DIR } from './env.js';

const { Pool } = pg;

async function main() {
  loadProjectEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to apply the PostgreSQL schema.');
  }

  const schema = await readFile(resolve(ROOT_DIR, 'database/schema.sql'), 'utf8');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(schema);
    console.log('PostgreSQL schema applied successfully.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
