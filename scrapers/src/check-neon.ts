import { neon } from '@neondatabase/serverless';
import { loadProjectEnv } from './env.js';

loadProjectEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Add it to .env or scrapers/.env before running this command.');
}

const sql = neon(connectionString);
const result = await sql`select version()`;

console.log('Neon connection OK.');
console.log(result[0].version);
