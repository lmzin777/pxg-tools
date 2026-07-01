create extension if not exists pgcrypto;

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  scope text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  message text,
  error_message text not null default '',
  records_loaded integer not null default 0
);

alter table sync_runs add column if not exists error_message text not null default '';
alter table sync_runs add column if not exists records_loaded integer not null default 0;

create table if not exists clans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  focus text not null,
  summary text not null,
  icon_url text not null default '',
  source_url text not null,
  updated_at timestamptz not null default now()
);

alter table clans add column if not exists icon_url text not null default '';

create table if not exists clan_types (
  clan_id uuid not null references clans(id) on delete cascade,
  type_name text not null,
  sort_order integer not null default 0,
  primary key (clan_id, type_name)
);

create table if not exists clan_bonus (
  clan_id uuid not null references clans(id) on delete cascade,
  type_name text not null,
  attack_bonus text not null,
  defense_bonus text not null,
  primary key (clan_id, type_name)
);

create table if not exists clan_npc_pokemon (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  label text not null,
  pokemon_name text not null,
  npc_name text not null,
  location text not null,
  sort_order integer not null default 0
);

create table if not exists clan_tier_groups (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  tier_name text not null,
  sort_order integer not null default 0
);

create table if not exists clan_tier_pokemon (
  id uuid primary key default gen_random_uuid(),
  tier_group_id uuid not null references clan_tier_groups(id) on delete cascade,
  dex_number text not null default '',
  icon_url text not null default '',
  pokemon_name text not null,
  sort_order integer not null default 0
);

alter table clan_tier_pokemon add column if not exists dex_number text not null default '';
alter table clan_tier_pokemon add column if not exists icon_url text not null default '';

create table if not exists clan_tier_pokemon_elements (
  tier_pokemon_id uuid not null references clan_tier_pokemon(id) on delete cascade,
  label text not null,
  icon_url text not null,
  sort_order integer not null default 0,
  primary key (tier_pokemon_id, label)
);

create table if not exists clan_tier_pokemon_pve_roles (
  tier_pokemon_id uuid not null references clan_tier_pokemon(id) on delete cascade,
  label text not null,
  icon_url text not null,
  sort_order integer not null default 0,
  primary key (tier_pokemon_id, label)
);

create table if not exists clan_tier_pokemon_pvp_roles (
  tier_pokemon_id uuid not null references clan_tier_pokemon(id) on delete cascade,
  label text not null,
  icon_url text not null,
  sort_order integer not null default 0,
  primary key (tier_pokemon_id, label)
);

create table if not exists clan_tier_pokemon_helds (
  tier_pokemon_id uuid not null references clan_tier_pokemon(id) on delete cascade,
  label text not null,
  icon_url text not null,
  sort_order integer not null default 0,
  primary key (tier_pokemon_id, label)
);

create table if not exists clan_rotation_groups (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  element_name text not null,
  sort_order integer not null default 0
);

create table if not exists clan_rotation_pokemon (
  id uuid primary key default gen_random_uuid(),
  rotation_group_id uuid not null references clan_rotation_groups(id) on delete cascade,
  pokemon_name text not null,
  pokemon_icon_url text not null default '',
  role_name text not null,
  role_icon_url text not null,
  tier text not null,
  sort_order integer not null default 0
);

alter table clan_rotation_pokemon
  add column if not exists pokemon_icon_url text not null default '';

create table if not exists clan_pvp_exclusive_pokemon (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  pokemon_name text not null,
  sort_order integer not null default 0
);

create table if not exists professions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  icon_url text not null,
  source_url text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists profession_sections (
  id uuid primary key default gen_random_uuid(),
  profession_id uuid not null references professions(id) on delete cascade,
  title text not null,
  anchor text not null,
  level integer not null default 1,
  sort_order integer not null default 0
);

create table if not exists profession_links (
  id uuid primary key default gen_random_uuid(),
  profession_id uuid not null references professions(id) on delete cascade,
  slug text not null,
  title text not null,
  kind text not null,
  summary text not null,
  icon_url text not null,
  source_url text not null,
  sort_order integer not null default 0
);

create table if not exists profession_link_sections (
  id uuid primary key default gen_random_uuid(),
  profession_link_id uuid not null references profession_links(id) on delete cascade,
  title text not null,
  anchor text not null,
  level integer not null default 1,
  sort_order integer not null default 0
);

create table if not exists profession_craft_items (
  id uuid primary key default gen_random_uuid(),
  profession_link_id uuid not null references profession_links(id) on delete cascade,
  rank_name text not null,
  item_name text not null,
  icon_url text not null,
  skill text not null,
  cooldown text not null,
  materials_text text not null,
  columns_json jsonb not null default '{}'::jsonb,
  source_url text not null,
  sort_order integer not null default 0
);

create table if not exists profession_craft_materials (
  id uuid primary key default gen_random_uuid(),
  craft_item_id uuid not null references profession_craft_items(id) on delete cascade,
  material_name text not null,
  quantity text not null,
  icon_url text not null,
  sort_order integer not null default 0
);

create table if not exists crafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  item_name text not null,
  item_slug text not null default '',
  image_url text not null default '',
  profession_name text not null,
  profession_slug text not null,
  subprofession_name text not null default '',
  subprofession_slug text not null default '',
  category text not null default '',
  rank_name text not null default '',
  skill text not null default '',
  craft_time text not null default '',
  requirements text not null default '',
  source_page text not null default '',
  source_url text not null default '',
  columns_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists craft_ingredients (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid not null references crafts(id) on delete cascade,
  name text not null,
  item_slug text not null default '',
  quantity text not null default '',
  icon_url text not null default '',
  sort_order integer not null default 0
);

create table if not exists profession_related_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  kind text not null,
  summary text not null,
  icon_url text not null,
  source_url text not null,
  sort_order integer not null default 0
);

create table if not exists pokemon (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  dex_number integer not null,
  dex_label text not null,
  name text not null,
  generation_name text not null,
  sprite_url text not null,
  detail_sprite_url text not null,
  source_url text not null,
  required_level text not null,
  abilities text not null,
  boost text not null,
  material text not null,
  evolution_stone text not null,
  description text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists pokemon_elements (
  pokemon_id uuid not null references pokemon(id) on delete cascade,
  type_name text not null,
  sort_order integer not null default 0,
  primary key (pokemon_id, type_name)
);

create table if not exists pokemon_evolutions (
  id uuid primary key default gen_random_uuid(),
  pokemon_id uuid not null references pokemon(id) on delete cascade,
  pokemon_name text not null,
  required_level text not null,
  sort_order integer not null default 0
);

create table if not exists pokemon_effectiveness (
  id uuid primary key default gen_random_uuid(),
  pokemon_id uuid not null references pokemon(id) on delete cascade,
  category text not null,
  type_name text not null,
  sort_order integer not null default 0
);

create table if not exists pokemon_moves (
  id uuid primary key default gen_random_uuid(),
  pokemon_id uuid not null references pokemon(id) on delete cascade,
  battle_mode text not null,
  move_name text not null,
  move_type text not null default '',
  cooldown text not null default '',
  required_level text not null default '',
  description text not null default '',
  sort_order integer not null default 0
);

create table if not exists pokemon_versions (
  id uuid primary key default gen_random_uuid(),
  pokemon_id uuid not null references pokemon(id) on delete cascade,
  pokemon_name text not null,
  pokemon_slug text not null default '',
  icon_url text not null default '',
  source_url text not null default '',
  sort_order integer not null default 0
);

create table if not exists item_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  group_name text not null,
  summary text not null,
  icon_url text not null,
  source_url text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists item_category_sections (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references item_categories(id) on delete cascade,
  title text not null,
  anchor text not null,
  level integer not null default 1,
  sort_order integer not null default 0
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references item_categories(id) on delete cascade,
  slug text not null,
  name text not null,
  icon_url text not null,
  description text not null,
  section_title text not null,
  table_title text not null,
  source_url text not null,
  attributes_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists item_attributes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  name text not null,
  value text not null,
  sort_order integer not null default 0
);

create table if not exists wiki_domains (
  domain text primary key,
  title text not null,
  description text not null,
  priority integer not null default 100,
  source_url text not null default '',
  scraper_script text not null default '',
  loader_script text not null default '',
  status text not null default 'planned',
  updated_at timestamptz not null default now()
);

create table if not exists wiki_entities (
  id uuid primary key default gen_random_uuid(),
  domain text not null references wiki_domains(domain) on delete cascade,
  slug text not null,
  name text not null,
  summary text not null default '',
  image_url text not null default '',
  source_url text not null default '',
  metadata_json jsonb not null default '{}'::jsonb,
  scraped_at timestamptz not null default now(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (domain, slug)
);

insert into wiki_domains (domain, title, description, priority, source_url, scraper_script, loader_script, status)
values
  ('helds', 'Helds', 'Held items e informacoes relacionadas.', 1, 'https://wiki.pokexgames.com/index.php/Held_Items', 'scrape:helds', 'db:load-wiki -- helds', 'planned'),
  ('bosses', 'Bosses', 'Bosses, recompensas e locais.', 2, 'https://wiki.pokexgames.com/index.php/Bosses', 'scrape:bosses', 'db:load-wiki -- bosses', 'planned'),
  ('dungeons', 'Dungeons', 'Dungeons e informacoes de entrada.', 3, 'https://wiki.pokexgames.com/index.php/Dungeons', 'scrape:dungeons', 'db:load-wiki -- dungeons', 'planned'),
  ('quests', 'Quests', 'Quests relevantes da Wiki.', 4, 'https://wiki.pokexgames.com/index.php/Quests', 'scrape:quests', 'db:load-wiki -- quests', 'planned'),
  ('npcs', 'NPCs', 'NPCs, localizacao e funcoes.', 5, 'https://wiki.pokexgames.com/index.php/NPCs', 'scrape:npcs', 'db:load-wiki -- npcs', 'planned'),
  ('berries', 'Berries', 'Berries e efeitos.', 6, 'https://wiki.pokexgames.com/index.php/Berries', 'scrape:berries', 'db:load-wiki -- berries', 'planned'),
  ('addons', 'Addons', 'Addons de Pokemon.', 7, 'https://wiki.pokexgames.com/index.php/Addons', 'scrape:addons', 'db:load-wiki -- addons', 'planned'),
  ('outfits', 'Outfits', 'Outfits de jogadores.', 8, 'https://wiki.pokexgames.com/index.php/Outfits', 'scrape:outfits', 'db:load-wiki -- outfits', 'planned'),
  ('tasks', 'Tasks', 'Tasks e recompensas.', 9, 'https://wiki.pokexgames.com/index.php/Tasks', 'scrape:tasks', 'db:load-wiki -- tasks', 'planned'),
  ('respawns', 'Respawns', 'Respawns e rotas.', 10, 'https://wiki.pokexgames.com/index.php/Respawns', 'scrape:respawns', 'db:load-wiki -- respawns', 'planned'),
  ('mapas', 'Mapas', 'Mapas e coordenadas.', 11, 'https://wiki.pokexgames.com/index.php/Mapas', 'scrape:mapas', 'db:load-wiki -- mapas', 'planned')
on conflict (domain) do update set
  title = excluded.title,
  description = excluded.description,
  priority = excluded.priority,
  source_url = excluded.source_url,
  scraper_script = excluded.scraper_script,
  loader_script = excluded.loader_script;

create index if not exists ix_clans_slug on clans(slug);
create index if not exists ix_clan_types_type_name on clan_types(type_name);
create index if not exists ix_sync_runs_scope_started_at on sync_runs(scope, started_at desc);
create index if not exists ix_clan_tier_pokemon_tier_group_id on clan_tier_pokemon(tier_group_id);
create index if not exists ix_clan_rotation_groups_clan_id on clan_rotation_groups(clan_id);
create index if not exists ix_clan_tier_groups_clan_id on clan_tier_groups(clan_id);
create index if not exists ix_professions_slug on professions(slug);
create index if not exists ix_profession_links_profession_id on profession_links(profession_id);
create index if not exists ix_profession_links_kind on profession_links(kind);
create index if not exists ix_profession_craft_items_link_id on profession_craft_items(profession_link_id);
create index if not exists ix_profession_craft_items_rank on profession_craft_items(rank_name);
create index if not exists ix_profession_craft_materials_item_id on profession_craft_materials(craft_item_id);
create index if not exists ix_crafts_slug on crafts(slug);
create index if not exists ix_crafts_item_slug on crafts(item_slug);
create index if not exists ix_crafts_item_name on crafts(item_name);
create index if not exists ix_crafts_profession_slug on crafts(profession_slug);
create index if not exists ix_crafts_category on crafts(category);
create index if not exists ix_craft_ingredients_craft_id on craft_ingredients(craft_id);
create index if not exists ix_craft_ingredients_item_slug on craft_ingredients(item_slug);
create index if not exists ix_craft_ingredients_name on craft_ingredients(name);
create index if not exists ix_pokemon_slug on pokemon(slug);
create index if not exists ix_pokemon_dex_number on pokemon(dex_number);
create index if not exists ix_pokemon_generation_name on pokemon(generation_name);
create index if not exists ix_pokemon_elements_type_name on pokemon_elements(type_name);
create index if not exists ix_pokemon_evolutions_pokemon_id on pokemon_evolutions(pokemon_id);
create index if not exists ix_pokemon_effectiveness_pokemon_id on pokemon_effectiveness(pokemon_id);
create index if not exists ix_pokemon_moves_pokemon_id on pokemon_moves(pokemon_id);
create index if not exists ix_pokemon_moves_battle_mode on pokemon_moves(battle_mode);
create index if not exists ix_pokemon_versions_pokemon_id on pokemon_versions(pokemon_id);
create index if not exists ix_item_categories_slug on item_categories(slug);
create index if not exists ix_item_categories_group_name on item_categories(group_name);
create index if not exists ix_items_category_id on items(category_id);
create index if not exists ix_items_slug on items(slug);
create index if not exists ix_items_name on items(name);
create index if not exists ix_item_attributes_item_id on item_attributes(item_id);
create index if not exists ix_item_attributes_name on item_attributes(name);
create index if not exists ix_wiki_domains_priority on wiki_domains(priority);
create index if not exists ix_wiki_entities_domain on wiki_entities(domain);
create index if not exists ix_wiki_entities_slug on wiki_entities(slug);
create index if not exists ix_wiki_entities_name on wiki_entities(name);
