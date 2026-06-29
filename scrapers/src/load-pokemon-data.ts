import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadProjectEnv, ROOT_DIR } from './env.js';

const { Pool } = pg;
const POKEMON_PATH = resolve(ROOT_DIR, 'data/pokemon.json');

type PokemonEvolutionRecord = {
  name: string;
  level: string;
};

type PokemonEffectivenessRecord = {
  category: string;
  types: string[];
};

type PokemonRecord = {
  slug: string;
  dexNumber: number;
  dex: string;
  name: string;
  generation: string;
  spriteUrl: string;
  sourceUrl: string;
  detailSpriteUrl: string;
  level: string;
  elements: string[];
  abilities: string;
  boost: string;
  material: string;
  evolutionStone: string;
  evolutions: PokemonEvolutionRecord[];
  description: string;
  effectiveness: PokemonEffectivenessRecord[];
};

type PokemonPayload = {
  sourceUrl: string;
  pokemon: PokemonRecord[];
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

    await client.query(
      `insert into ${tableName} (${columns.join(', ')}) values ${placeholders}`,
      values,
    );
  }
}

async function main() {
  loadProjectEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to load Pokemon data into PostgreSQL.');
  }

  const payload = await readJson<PokemonPayload>(POKEMON_PATH);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query("insert into sync_runs (source, scope, status, started_at, message) values ($1, $2, $3, now(), $4)", [
      payload.sourceUrl,
      'pokemon',
      'running',
      'Loading Pokemon JSON into PostgreSQL.',
    ]);

    await client.query('delete from pokemon');

    const pokemonRows = payload.pokemon.map((pokemon, index) => [
      pokemon.slug,
      pokemon.dexNumber,
      pokemon.dex,
      pokemon.name,
      pokemon.generation,
      pokemon.spriteUrl,
      pokemon.detailSpriteUrl,
      pokemon.sourceUrl,
      pokemon.level,
      pokemon.abilities,
      pokemon.boost,
      pokemon.material,
      pokemon.evolutionStone,
      pokemon.description,
      index,
    ]);
    const pokemonColumns = [
      'slug',
      'dex_number',
      'dex_label',
      'name',
      'generation_name',
      'sprite_url',
      'detail_sprite_url',
      'source_url',
      'required_level',
      'abilities',
      'boost',
      'material',
      'evolution_stone',
      'description',
      'sort_order',
    ];
    const pokemonPlaceholders = pokemonRows
      .map((row, rowIndex) => {
        const offset = rowIndex * pokemonColumns.length;
        return `(${row.map((_, columnIndex) => `$${offset + columnIndex + 1}`).join(', ')})`;
      })
      .join(', ');
    const pokemonResult = await client.query<{ id: string; slug: string }>(
      `
        insert into pokemon (${pokemonColumns.join(', ')})
        values ${pokemonPlaceholders}
        returning id, slug
      `,
      pokemonRows.flat(),
    );
    const pokemonIds = new Map(pokemonResult.rows.map((row) => [row.slug, row.id]));
    const elementRows: unknown[][] = [];
    const evolutionRows: unknown[][] = [];
    const effectivenessRows: unknown[][] = [];

    for (const pokemon of payload.pokemon) {
      const pokemonId = pokemonIds.get(pokemon.slug);

      if (!pokemonId) {
        continue;
      }

      pokemon.elements.forEach((element, index) => {
        elementRows.push([pokemonId, element, index]);
      });
      pokemon.evolutions.forEach((evolution, index) => {
        evolutionRows.push([pokemonId, evolution.name, evolution.level, index]);
      });
      pokemon.effectiveness.forEach((group) => {
        group.types.forEach((type, index) => {
          effectivenessRows.push([pokemonId, group.category, type, index]);
        });
      });
    }

    await insertChunked(client, 'pokemon_elements', ['pokemon_id', 'type_name', 'sort_order'], elementRows);
    await insertChunked(client, 'pokemon_evolutions', ['pokemon_id', 'pokemon_name', 'required_level', 'sort_order'], evolutionRows);
    await insertChunked(client, 'pokemon_effectiveness', ['pokemon_id', 'category', 'type_name', 'sort_order'], effectivenessRows);

    await client.query("update sync_runs set status = 'succeeded', finished_at = now(), message = $1 where scope = 'pokemon' and status = 'running'", [
      'Pokemon data loaded successfully.',
    ]);
    await client.query('commit');
    console.log(`Loaded ${payload.pokemon.length} Pokemon into PostgreSQL.`);
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
