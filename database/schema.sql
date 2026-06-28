create extension if not exists pgcrypto;

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  scope text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  message text
);

create table if not exists clans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  focus text not null,
  summary text not null,
  source_url text not null,
  updated_at timestamptz not null default now()
);

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
  pokemon_name text not null,
  sort_order integer not null default 0
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
  role_name text not null,
  role_icon_url text not null,
  tier text not null,
  sort_order integer not null default 0
);

create table if not exists clan_pvp_exclusive_pokemon (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  pokemon_name text not null,
  sort_order integer not null default 0
);

create index if not exists ix_clans_slug on clans(slug);
create index if not exists ix_clan_types_type_name on clan_types(type_name);
create index if not exists ix_sync_runs_scope_started_at on sync_runs(scope, started_at desc);
