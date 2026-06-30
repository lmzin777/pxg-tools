export type WikiDomainConfig = {
  domain: string;
  title: string;
  description: string;
  priority: number;
  sourceUrl: string;
};

export const wikiDomains: WikiDomainConfig[] = [
  { domain: 'helds', title: 'Helds', description: 'Held items e informacoes relacionadas.', priority: 1, sourceUrl: 'https://wiki.pokexgames.com/index.php/Held_Items' },
  { domain: 'bosses', title: 'Bosses', description: 'Bosses, recompensas e locais.', priority: 2, sourceUrl: 'https://wiki.pokexgames.com/index.php/Bosses' },
  { domain: 'dungeons', title: 'Dungeons', description: 'Dungeons e informacoes de entrada.', priority: 3, sourceUrl: 'https://wiki.pokexgames.com/index.php/Dungeons' },
  { domain: 'quests', title: 'Quests', description: 'Quests relevantes da Wiki.', priority: 4, sourceUrl: 'https://wiki.pokexgames.com/index.php/Quests' },
  { domain: 'npcs', title: 'NPCs', description: 'NPCs, localizacao e funcoes.', priority: 5, sourceUrl: 'https://wiki.pokexgames.com/index.php/NPCs' },
  { domain: 'berries', title: 'Berries', description: 'Berries e efeitos.', priority: 6, sourceUrl: 'https://wiki.pokexgames.com/index.php/Berries' },
  { domain: 'addons', title: 'Addons', description: 'Addons de Pokemon.', priority: 7, sourceUrl: 'https://wiki.pokexgames.com/index.php/Addons' },
  { domain: 'outfits', title: 'Outfits', description: 'Outfits de jogadores.', priority: 8, sourceUrl: 'https://wiki.pokexgames.com/index.php/Outfits' },
  { domain: 'tasks', title: 'Tasks', description: 'Tasks e recompensas.', priority: 9, sourceUrl: 'https://wiki.pokexgames.com/index.php/Tasks' },
  { domain: 'respawns', title: 'Respawns', description: 'Respawns e rotas.', priority: 10, sourceUrl: 'https://wiki.pokexgames.com/index.php/Respawns' },
  { domain: 'mapas', title: 'Mapas', description: 'Mapas e coordenadas.', priority: 11, sourceUrl: 'https://wiki.pokexgames.com/index.php/Mapas' },
];

export function getWikiDomain(domain: string) {
  const config = wikiDomains.find((item) => item.domain === domain);
  if (!config) {
    throw new Error(`Unknown wiki domain: ${domain}`);
  }
  return config;
}
