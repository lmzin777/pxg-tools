import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WIKI_BASE_URL = 'https://wiki.pokexgames.com';
const API_URL = `${WIKI_BASE_URL}/api.php`;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(SCRIPT_DIR, '../../data/clan-details.json');

const CLAN_PAGES = [
  'Volcanic',
  'Raibolt',
  'Orebound',
  'Naturia',
  'Gardestrike',
  'Ironhard',
  'Wingeon',
  'Psycraft',
  'Seavell',
  'Malefic',
];

type ClanBonus = {
  type: string;
  attack: string;
  defense: string;
};

type NpcPokemon = {
  label: string;
  pokemon: string;
  npc: string;
  location: string;
};

type IconItem = {
  label: string;
  icon: string;
};

type TierPokemon = {
  dex: string;
  icon: string;
  name: string;
  elements: IconItem[];
  pveRoles: IconItem[];
  pvpRoles: IconItem[];
  helds: IconItem[];
};

type TierGroup = {
  tier: string;
  pokemon: string[];
  rows: TierPokemon[];
};

type RotationPokemon = {
  pokemon: string;
  role: string;
  roleIcon: string;
  tier: string;
};

type RotationGroup = {
  element: string;
  rows: RotationPokemon[];
};

type ClanDetail = {
  slug: string;
  name: string;
  sourceUrl: string;
  bonus: ClanBonus[];
  npcPokemon: NpcPokemon[];
  tiers: TierGroup[];
  rotation: RotationGroup[];
  pvpExclusive: string[];
  pvpNote: string;
};

type ParseResponse = {
  parse?: {
    text?: {
      '*': string;
    };
  };
};

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function findSection(html: string, startIds: string[], endIds: string[]) {
  const start = startIds
    .map((id) => html.indexOf(`id="${id}"`))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (start === undefined) {
    return '';
  }

  const end = endIds
    .map((id) => html.indexOf(`id="${id}"`, start + 1))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0] ?? html.length;

  return html.slice(start, end);
}

function getCells(rowHtml: string) {
  return [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1] ?? '');
}

function getTitle(cellHtml: string) {
  return cellHtml.match(/<a href="\/index\.php\/[^"]+" title="([^"]+)">/i)?.[1] ?? stripHtml(cellHtml);
}

function getAbsoluteWikiUrl(src: string) {
  return /^https?:\/\//i.test(src) ? src : `${WIKI_BASE_URL}${src}`;
}

function getImageItems(cellHtml: string): IconItem[] {
  return [...cellHtml.matchAll(/<img\s+([^>]+)>/gi)]
    .map((match) => {
      const attrs = match[1] ?? '';
      const src = attrs.match(/src="([^"]+)"/i)?.[1] ?? '';
      const alt = attrs.match(/alt="([^"]*)"/i)?.[1] ?? '';
      const title = attrs.match(/title="([^"]*)"/i)?.[1] ?? '';
      const label = (title || alt).replace(/\.png$/i, '').replace(/_/g, ' ').trim();

      return src ? { label, icon: getAbsoluteWikiUrl(src) } : null;
    })
    .filter((item): item is IconItem => Boolean(item));
}

function getRoleItems(cellHtml: string): IconItem[] {
  return getImageItems(cellHtml)
    .filter((item) => /^Interface /i.test(item.label))
    .map((item) => {
      const label = /OffensiveTanker/i.test(item.label)
        ? 'Offensive Tank'
        : /Tanker|Tank PVE|Tank PVP/i.test(item.label)
          ? 'Tank'
          : /OTDD/i.test(item.label)
            ? 'Over Time Damage Dealer'
            : /BDD/i.test(item.label)
              ? 'Burst Damage Dealer'
              : /Support/i.test(item.label)
                ? 'Support'
                : /Speedster/i.test(item.label)
                  ? 'Speedster'
                  : /Disrupter/i.test(item.label)
                    ? 'Disrupter'
                    : item.label.replace(/^Interface\s+/i, '').replace(/\s+PVE$/i, '').replace(/\s+PVP$/i, '');

      return { label, icon: item.icon };
    });
}

function getElementItems(cellHtml: string): IconItem[] {
  return getImageItems(cellHtml)
    .filter((item) => item.label && !/Interface|Atk|Def|Boost|Held|Blank|Not/i.test(item.label))
    .map((item) => ({ label: item.label.replace(/\d+$/g, ''), icon: item.icon }));
}

function getRole(cellHtml: string) {
  const role = getRoleItems(cellHtml)[0];
  if (!role) {
    return { role: '', roleIcon: '' };
  }

  return {
    role: role.label,
    roleIcon: role.icon,
  };
}

function parseBonus(html: string): ClanBonus[] {
  const section = findSection(html, ['B.C3.B4nus_de_Cl.C3.A3', 'Bônus_de_Clã'], ['Tiers']);
  const text = stripHtml(section);

  return [...text.matchAll(/([A-Za-z]+):\s*Atk\s*(\d+%),\s*Def\s*(\d+%)/g)].map((match) => ({
    type: match[1],
    attack: match[2],
    defense: match[3],
  }));
}

function parseNpcPokemon(html: string): NpcPokemon[] {
  const section = findSection(
    html,
    ['Pok.C3.A9mon_obtido_via_NPC_de_Cl.C3.A3', 'Pokémon_obtido_via_NPC_de_Clã'],
    ['Efetividades', 'Efetividade', 'Outfits_Exclusivas'],
  );
  const text = stripHtml(section);

  return [...text.matchAll(/Para obter um(?:a)?[,]?\s+(.+?)\s*,?\s*fale com a NPC\s+(.+?)\s*,\s+(.+?)(?=\.?\s+Shiny|\.\s+Efetividade|\.\s+Efetividades|$)/g)]
    .map((match) => ({
      label: 'NPC de Cla',
      pokemon: match[1].trim(),
      npc: match[2].trim(),
      location: match[3].trim().replace(/^localizada\s+/, '').replace(/\.\s*<span.*$/, ''),
    }));
}

function parseTiers(html: string): TierGroup[] {
  const section = findSection(html, ['Tiers'], ['Rota.C3.A7.C3.A3o_Mid-Late_Game', 'Rotação_Mid-Late_Game']);
  const tierIds = [
    'Tier_1A',
    'Tier_1B',
    'Tier_1C',
    'Technical_Machine_(TM)',
    'Technical_Records_(TR)',
    'Tier_1H',
    'Tier_2',
    'Tier_3',
  ];

  return tierIds.flatMap((tierId, index) => {
    const nextIds = index < tierIds.length - 1
      ? [tierIds[index + 1]]
      : ['Rota.C3.A7.C3.A3o_Mid-Late_Game', 'Rotação_Mid-Late_Game'];
    const tierSection = findSection(section, [tierId], nextIds);
    const tier = tierId
      .replace(/_/g, ' ')
      .replace('Technical Machine (TM)', 'Technical Machine (TM)')
      .replace('Technical Records (TR)', 'Technical Records (TR)');
    const seen = new Set<string>();
    const rows = [...tierSection.matchAll(/<tr[\s\S]*?<\/tr>/gi)]
      .map((row) => getCells(row[0]))
      .filter((cells) => cells.length >= 7)
      .map((cells) => {
        const name = getTitle(cells[2]);
        const icon = getImageItems(cells[1])[0]?.icon ?? '';

        return {
          dex: stripHtml(cells[0]),
          icon,
          name,
          elements: getElementItems(cells[3]),
          pveRoles: getRoleItems(cells[4]),
          pvpRoles: getRoleItems(cells[5]),
          helds: getImageItems(cells[6]),
        };
      })
      .filter((row) => {
        if (!row.name || /^(Nome|Pokemon|Pokémon|Held|Funcao|Função|Tier|PvP|PvE)$/i.test(row.name) || seen.has(row.name)) {
          return false;
        }
        seen.add(row.name);
        return true;
      });
    const pokemon = rows.map((row) => row.name);

    return rows.length ? [{ tier, pokemon, rows }] : [];
  });
}

function parseRotation(html: string): RotationGroup[] {
  const section = findSection(
    html,
    ['Rota.C3.A7.C3.A3o_Mid-Late_Game', 'Rotação_Mid-Late_Game'],
    ['Exclusividade_do_Cl.C3.A3_no_PvP', 'Exclusividade_de_Cl.C3.A3_no_PvP', 'Exclusividade_do_Clã_no_PvP', 'Exclusividade_de_Clã_no_PvP'],
  );

  return [...section.matchAll(/<table[\s\S]*?<\/table>/gi)].flatMap((tableMatch) => {
    const table = tableMatch[0];
    const header = stripHtml(table.match(/<th[^>]*colspan="4"[\s\S]*?<\/th>/i)?.[0] ?? '');

    if (!header) {
      return [];
    }

    const element = header.split(' ').at(-1) ?? header;
    const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)]
      .map((row) => getCells(row[0]))
      .filter((cells) => cells.length >= 4)
      .map((cells) => {
        const { role, roleIcon } = getRole(cells[2]);
        return {
          pokemon: getTitle(cells[1]),
          role,
          roleIcon,
          tier: stripHtml(cells[3]),
        };
      })
      .filter((row) => row.pokemon && row.pokemon !== 'Nome');

    return rows.length ? [{ element, rows }] : [];
  });
}

function parsePvpExclusive(html: string): string[] {
  const section = findSection(
    html,
    ['Exclusividade_do_Cl.C3.A3_no_PvP', 'Exclusividade_do_Clã_no_PvP', 'Exclusividade_de_Cl.C3.A3_no_PvP', 'Exclusividade_de_Clã_no_PvP'],
    ['Pok.C3.A9mon_obtido_via_NPC_de_Cl.C3.A3', 'Pokémon_obtido_via_NPC_de_Clã'],
  );
  const ignored = new Set(['Pokémon', ...CLAN_PAGES]);

  return [...section.matchAll(/<a href="\/index\.php\/[^"]+" title="([^"]+)">/gi)]
    .map((match) => match[1])
    .filter((name, index, names) => !ignored.has(name) && names.indexOf(name) === index);
}

async function fetchClanHtml(page: string) {
  const url = `${API_URL}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'PXGToolsCommunityScraper/0.2 (+local development)',
    },
  });

  if (!response.ok) {
    throw new Error(`Wiki request for ${page} failed with HTTP ${response.status}.`);
  }

  const payload = await response.json() as ParseResponse;
  const html = payload.parse?.text?.['*'];

  if (!html) {
    throw new Error(`Wiki response for ${page} did not include parse text.`);
  }

  return html;
}

async function scrapeClanDetail(page: string): Promise<ClanDetail> {
  const html = await fetchClanHtml(page);

  return {
    slug: page.toLowerCase(),
    name: page,
    sourceUrl: `${WIKI_BASE_URL}/index.php/${page}`,
    bonus: parseBonus(html),
    npcPokemon: parseNpcPokemon(html),
    tiers: parseTiers(html),
    rotation: parseRotation(html),
    pvpExclusive: parsePvpExclusive(html),
    pvpNote: 'A exclusividade e aplicada apenas em conteudos PvP. No PvE, o uso e liberado para todos os clas.',
  };
}

async function main() {
  const clans = [];

  for (const page of CLAN_PAGES) {
    clans.push(await scrapeClanDetail(page));
  }

  const payload = {
    source: WIKI_BASE_URL,
    scrapedAt: new Date().toISOString(),
    clans,
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Saved ${clans.length} clan detail records to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
