import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CLANS_PATH = resolve(ROOT_DIR, 'data/clans.json');
const CLAN_DETAILS_PATH = resolve(ROOT_DIR, 'data/clan-details.json');

type ClanCatalogPayload = {
  clans: Array<{
    name: string;
    types: string[];
    focus: string;
    summary: string;
  }>;
};

type ClanDetailPayload = {
  clans: Array<{
    slug: string;
    name: string;
    sourceUrl: string;
    bonus: Array<{ type: string; attack: string; defense: string }>;
    npcPokemon: Array<{ label: string; pokemon: string; npc: string; location: string }>;
    tiers: Array<{ tier: string; pokemon: string[] }>;
    rotation: Array<{
      element: string;
      rows: Array<{ pokemon: string; role: string; roleIcon: string; tier: string }>;
    }>;
    pvpExclusive: string[];
  }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to load clan data into PostgreSQL.');
  }

  const [catalog, details] = await Promise.all([
    readJson<ClanCatalogPayload>(CLANS_PATH),
    readJson<ClanDetailPayload>(CLAN_DETAILS_PATH),
  ]);
  const detailBySlug = new Map(details.clans.map((detail) => [detail.slug, detail]));
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query("insert into sync_runs (source, scope, status, started_at, message) values ($1, $2, $3, now(), $4)", [
      'https://wiki.pokexgames.com',
      'clans',
      'running',
      'Loading clan JSON into PostgreSQL.',
    ]);
    await client.query('delete from clans');

    for (const clan of catalog.clans) {
      const slug = slugify(clan.name);
      const detail = detailBySlug.get(slug);
      const sourceUrl = detail?.sourceUrl ?? `https://wiki.pokexgames.com/index.php/${encodeURIComponent(clan.name)}`;
      const clanResult = await client.query<{ id: string }>(
        `
          insert into clans (slug, name, focus, summary, source_url)
          values ($1, $2, $3, $4, $5)
          returning id
        `,
        [slug, clan.name, clan.focus, clan.summary, sourceUrl],
      );
      const clanId = clanResult.rows[0].id;

      for (const [index, type] of clan.types.entries()) {
        await client.query(
          'insert into clan_types (clan_id, type_name, sort_order) values ($1, $2, $3)',
          [clanId, type, index],
        );
      }

      if (!detail) {
        continue;
      }

      for (const bonus of detail.bonus) {
        await client.query(
          'insert into clan_bonus (clan_id, type_name, attack_bonus, defense_bonus) values ($1, $2, $3, $4)',
          [clanId, bonus.type, bonus.attack, bonus.defense],
        );
      }

      for (const [index, pokemon] of detail.npcPokemon.entries()) {
        await client.query(
          `
            insert into clan_npc_pokemon (clan_id, label, pokemon_name, npc_name, location, sort_order)
            values ($1, $2, $3, $4, $5, $6)
          `,
          [clanId, pokemon.label, pokemon.pokemon, pokemon.npc, pokemon.location, index],
        );
      }

      for (const [groupIndex, tier] of detail.tiers.entries()) {
        const tierResult = await client.query<{ id: string }>(
          'insert into clan_tier_groups (clan_id, tier_name, sort_order) values ($1, $2, $3) returning id',
          [clanId, tier.tier, groupIndex],
        );
        const tierGroupId = tierResult.rows[0].id;

        for (const [pokemonIndex, pokemon] of tier.pokemon.entries()) {
          await client.query(
            'insert into clan_tier_pokemon (tier_group_id, pokemon_name, sort_order) values ($1, $2, $3)',
            [tierGroupId, pokemon, pokemonIndex],
          );
        }
      }

      for (const [groupIndex, rotation] of detail.rotation.entries()) {
        const rotationResult = await client.query<{ id: string }>(
          'insert into clan_rotation_groups (clan_id, element_name, sort_order) values ($1, $2, $3) returning id',
          [clanId, rotation.element, groupIndex],
        );
        const rotationGroupId = rotationResult.rows[0].id;

        for (const [rowIndex, row] of rotation.rows.entries()) {
          await client.query(
            `
              insert into clan_rotation_pokemon (rotation_group_id, pokemon_name, role_name, role_icon_url, tier, sort_order)
              values ($1, $2, $3, $4, $5, $6)
            `,
            [rotationGroupId, row.pokemon, row.role, row.roleIcon, row.tier, rowIndex],
          );
        }
      }

      for (const [index, pokemon] of detail.pvpExclusive.entries()) {
        await client.query(
          'insert into clan_pvp_exclusive_pokemon (clan_id, pokemon_name, sort_order) values ($1, $2, $3)',
          [clanId, pokemon, index],
        );
      }
    }

    await client.query("update sync_runs set status = 'succeeded', finished_at = now(), message = $1 where scope = 'clans' and status = 'running'", [
      'Clan data loaded successfully.',
    ]);
    await client.query('commit');
    console.log(`Loaded ${catalog.clans.length} clans into PostgreSQL.`);
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
