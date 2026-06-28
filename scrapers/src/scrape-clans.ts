import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLANS_URL = 'https://wiki.pokexgames.com/index.php/Cl%C3%A3s';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(SCRIPT_DIR, '../../data/clans.json');

const KNOWN_CLANS = [
  { name: 'Volcanic', aliases: ['Volcanic'], types: ['Fire'], focus: 'Fire specialists', summary: 'Volcanic clan members are the most destructive trainers, constantly training their Fire-type Pokemon to become stronger than any opponent.' },
  { name: 'Raibolt', aliases: ['Raibolt'], types: ['Electric'], focus: 'Electric specialists', summary: 'Raibolt clan members are highly intelligent and know everything needed to handle Electric-type Pokemon and defeat enemies with ease.' },
  { name: 'Orebound', aliases: ['Orebound', 'Oreobund'], types: ['Ground', 'Rock'], focus: 'Ground and rock specialists', summary: 'Orebound clan members dedicate their lives to mastering the strongest Ground- and Rock-type Pokemon to defeat any opponent they encounter.' },
  { name: 'Naturia', aliases: ['Naturia'], types: ['Grass', 'Bug'], focus: 'Grass and bug specialists', summary: 'Naturia clan members are known for their passion for nature, preferring to live in forests and jungles alongside Grass- and Bug-type Pokemon.' },
  { name: 'Gardestrike', aliases: ['Gardestrike', 'Garde Strike'], types: ['Normal', 'Fighting'], focus: 'Normal and fighting specialists', summary: 'Gardestrike clan members are strong, earning their power through long training with Normal- and Fighting-type Pokemon.' },
  { name: 'Ironhard', aliases: ['Ironhard'], types: ['Steel', 'Crystal'], focus: 'Steel and crystal specialists', summary: 'Ironhard clan Pokemon are known for brute force, resistance, and range, mastering Steel techniques after years of breaking every limit.' },
  { name: 'Wingeon', aliases: ['Wingeon'], types: ['Flying', 'Dragon'], focus: 'Flying and dragon specialists', summary: 'Wingeon clan members live far from cities, preferring the highest mountains among Flying- and Dragon-type Pokemon.' },
  { name: 'Psycraft', aliases: ['Psycraft'], types: ['Psychic', 'Fairy'], focus: 'Psychic and fairy specialists', summary: 'Psycraft clan members are enigmatic, said to control the minds of Psychic-type Pokemon and share a strong bond with affectionate Fairy-type Pokemon.' },
  { name: 'Seavell', aliases: ['Seavell'], types: ['Water', 'Ice'], focus: 'Water and ice specialists', summary: 'Seavell clan members are known for their knowledge of the sea and its creatures, handling the most powerful Water- and Ice-type Pokemon.' },
  { name: 'Malefic', aliases: ['Malefic'], types: ['Ghost', 'Dark', 'Poison'], focus: 'Ghost, dark and poison specialists', summary: 'Malefic clan members are mysterious, rarely speaking about their personal lives while controlling Ghost-, Dark-, and Poison-type Pokemon.' },
];

const CLAN_ICON_URLS: Record<string, string> = {
  Volcanic: 'https://wiki.pokexgames.com/images/thumb/5/55/Volcanicvetorr.png/120px-Volcanicvetorr.png',
  Raibolt: 'https://wiki.pokexgames.com/images/thumb/4/46/Raiboltvetor.png/120px-Raiboltvetor.png',
  Orebound: 'https://wiki.pokexgames.com/images/thumb/6/6f/Oreboundvetor.png/120px-Oreboundvetor.png',
  Naturia: 'https://wiki.pokexgames.com/images/thumb/7/7a/Naturiavetor.png/120px-Naturiavetor.png',
  Gardestrike: 'https://wiki.pokexgames.com/images/thumb/8/82/Gardestrikevetor.png/120px-Gardestrikevetor.png',
  Ironhard: 'https://wiki.pokexgames.com/images/thumb/8/82/Ironhardvetor.png/120px-Ironhardvetor.png',
  Wingeon: 'https://wiki.pokexgames.com/images/thumb/5/58/Wingeonvetor.png/120px-Wingeonvetor.png',
  Psycraft: 'https://wiki.pokexgames.com/images/thumb/7/76/Psycraftvetor.png/120px-Psycraftvetor.png',
  Seavell: 'https://wiki.pokexgames.com/images/thumb/a/a8/Seavellvetor.png/120px-Seavellvetor.png',
  Malefic: 'https://wiki.pokexgames.com/images/thumb/a/a6/Maleficvetor.png/120px-Maleficvetor.png',
};

type ClanRecord = {
  name: string;
  iconUrl: string;
  sourceUrl: string;
  status: 'synced' | 'missing_details';
  types: string[];
  focus: string;
  summary: string;
  rawMatches: string[];
};

function stripTags(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function assertWikiResponse(html: string) {
  if (/Acesso n.{0,3}o autorizado/i.test(html)) {
    throw new Error('The network returned an unauthorized access page instead of the official PXG wiki.');
  }

  if (!/PokeXGames|Cl.s|MediaWiki/i.test(html)) {
    throw new Error('The response does not look like the official PXG wiki clans page.');
  }
}

function parseClans(html: string): ClanRecord[] {
  const text = stripTags(html);

  return KNOWN_CLANS.map((clan) => {
    const rawMatches = clan.aliases.flatMap((alias) => {
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const htmlPattern = new RegExp(`.{0,120}${escapedAlias}.{0,220}`, 'gi');
      const textPattern = new RegExp(`.{0,120}${escapedAlias}.{0,220}`, 'gi');
      const htmlMatches = html.match(htmlPattern) || [];
      const textMatches = text.match(textPattern) || [];

      return [...htmlMatches, ...textMatches].map((match) => match
        .replace(/[<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim());
    });

    return {
      name: clan.name,
      iconUrl: CLAN_ICON_URLS[clan.name],
      sourceUrl: CLANS_URL,
      status: rawMatches.length ? 'synced' : 'missing_details',
      types: clan.types,
      focus: clan.focus,
      summary: clan.summary,
      rawMatches: rawMatches.slice(0, 5),
    };
  });
}

async function main() {
  const response = await fetch(CLANS_URL, {
    headers: {
      'user-agent': 'PXGToolsCommunityScraper/0.1 (+local development)',
    },
  });

  if (!response.ok) {
    throw new Error(`Wiki request failed with HTTP ${response.status}.`);
  }

  const html = await response.text();
  assertWikiResponse(html);

  const payload = {
    sourceUrl: CLANS_URL,
    scrapedAt: new Date().toISOString(),
    clans: parseClans(html),
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(`${OUTPUT_PATH}`, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Saved ${payload.clans.length} clan records to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
