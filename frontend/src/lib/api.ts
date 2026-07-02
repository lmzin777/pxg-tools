import type { Clan, ClanDetail } from '@/types/clans';
import type { Craft, CraftsOverview } from '@/types/crafts';
import type { ItemCategoryDetail, ItemsOverview } from '@/types/items';
import type { ItemDetail } from '@/types/items';
import type { PokemonDetail, PokemonOverview } from '@/types/pokemon';
import type { ProfessionDetail, ProfessionsOverview } from '@/types/professions';
import type { AdminHealth, AdminStats, SyncRun } from '@/types/admin';
import type { SearchOverview } from '@/types/search';
import type { WikiDomainDetail, WikiDomainsOverview } from '@/types/wiki';
import {
  getLocalClanDetail,
  getLocalClans,
  getLocalCraft,
  getLocalCrafts,
  getLocalItemCategory,
  getLocalItemDetail,
  getLocalItems,
  getLocalPokemon,
  getLocalPokemonDetail,
  getLocalProfessionDetail,
  getLocalProfessions,
  searchLocalData,
} from '@/lib/local-data';

const DEFAULT_API_BASE_URL = 'http://localhost:5000';
const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS || '4000');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, '');
}

function getConnectionErrorMessage(baseUrl: string) {
  if (process.env.NODE_ENV === 'production') {
    return 'Nao foi possivel conectar a API publica. Tente novamente em alguns instantes.';
  }

  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    return 'A API local nao esta rodando. Inicie a API em http://localhost:5000.';
  }

  return 'Nao foi possivel conectar a API configurada. Tente novamente em alguns instantes.';
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number.isFinite(API_TIMEOUT_MS) ? API_TIMEOUT_MS : 4000);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        accept: 'application/json',
        ...init?.headers,
      },
      cache: 'no-store',
      signal: init?.signal || controller.signal,
    });
  } catch {
    throw new ApiError(getConnectionErrorMessage(apiBaseUrl));
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (process.env.NODE_ENV === 'production') {
      console.error('PXG Tools API response error', {
        path,
        apiBaseUrl,
        status: response.status,
      });
    }

    throw new ApiError(
      process.env.NODE_ENV === 'production'
        ? 'A API publica respondeu com erro. Tente novamente em alguns instantes.'
        : `A API respondeu ${response.status} para ${path}.`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

async function withLocalFallback<T>(remote: Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await remote;
  } catch (error) {
    if (error instanceof ApiError) {
      return fallback();
    }

    throw error;
  }
}

async function withNonEmptyLocalFallback<T>(
  remote: Promise<T>,
  fallback: () => Promise<T>,
  isEmpty: (value: T) => boolean,
): Promise<T> {
  const value = await withLocalFallback(remote, fallback);
  if (isEmpty(value)) {
    return fallback();
  }

  return value;
}

async function withNullableLocalFallback<T>(remote: Promise<T>, fallback: () => Promise<T | null>): Promise<T> {
  try {
    return await remote;
  } catch (error) {
    if (error instanceof ApiError) {
      const localValue = await fallback();
      if (localValue) {
        return localValue;
      }
    }

    throw error;
  }
}

export async function getClans() {
  try {
    const remoteClans = await apiFetch<Clan[]>('/api/clans');
    const localClans = await getLocalClans();
    if (!remoteClans.length) {
      return localClans;
    }

    const localBySlug = new Map(localClans.map((clan) => [clan.slug, clan]));

    return remoteClans.map((clan) => ({
      ...clan,
      iconUrl: clan.iconUrl || localBySlug.get(clan.slug)?.iconUrl || '',
    }));
  } catch (error) {
    if (error instanceof ApiError) {
      return getLocalClans();
    }

    throw error;
  }
}

export async function getClanDetail(slug: string) {
  try {
    const remoteClan = await apiFetch<ClanDetail>(`/api/clans/${encodeURIComponent(slug)}`);
    if (!remoteClan.tiers.length || !remoteClan.rotation.length) {
      return (await getLocalClanDetail(slug)) || remoteClan;
    }

    return remoteClan;
  } catch (error) {
    if (error instanceof ApiError) {
      const localClan = await getLocalClanDetail(slug);
      if (localClan) {
        return localClan;
      }
    }

    throw error;
  }
}

export function getProfessions() {
  return withNonEmptyLocalFallback(
    apiFetch<ProfessionsOverview>('/api/professions'),
    getLocalProfessions,
    (overview) => !overview.professions.length,
  );
}

export function getProfessionDetail(slug: string) {
  return withNullableLocalFallback(
    apiFetch<ProfessionDetail>(`/api/professions/${encodeURIComponent(slug)}`),
    () => getLocalProfessionDetail(slug),
  );
}

export function getCrafts(filters?: {
  item?: string;
  profession?: string;
  ingredient?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.item) params.set('item', filters.item);
  if (filters?.profession) params.set('profession', filters.profession);
  if (filters?.ingredient) params.set('ingredient', filters.ingredient);
  const suffix = params.size ? `?${params.toString()}` : '';
  return getCraftsWithLocalComplements(`/api/crafts${suffix}`, filters);
}

export function getCraft(slug: string) {
  return withNullableLocalFallback(
    apiFetch<Craft>(`/api/crafts/${encodeURIComponent(slug)}`),
    () => getLocalCraft(slug),
  );
}

export function getPokemon() {
  return withNonEmptyLocalFallback(
    apiFetch<PokemonOverview>('/api/pokemon'),
    getLocalPokemon,
    (overview) => !overview.pokemon.length,
  );
}

export async function getPokemonDetail(slug: string) {
  const localPokemon = await getLocalPokemonDetail(slug);

  try {
    const remotePokemon = await apiFetch<PokemonDetail>(`/api/pokemon/${encodeURIComponent(slug)}`);
    return localPokemon ? mergePokemonDetail(remotePokemon, localPokemon) : remotePokemon;
  } catch (error) {
    if (error instanceof ApiError && localPokemon) {
      return localPokemon;
    }

    throw error;
  }
}

export function getItems() {
  return withNonEmptyLocalFallback(
    apiFetch<ItemsOverview>('/api/items'),
    getLocalItems,
    (overview) => !overview.categories.length,
  );
}

export function getItemCategory(slug: string) {
  return withNullableLocalFallback(
    apiFetch<ItemCategoryDetail>(`/api/items/categories/${encodeURIComponent(slug)}`),
    () => getLocalItemCategory(slug),
  );
}

export function getItemDetail(slug: string) {
  return withNullableLocalFallback(
    apiFetch<ItemDetail>(`/api/items/detail/${encodeURIComponent(slug)}`),
    () => getLocalItemDetail(slug),
  );
}

export function getAdminHealth() {
  return apiFetch<AdminHealth>('/api/admin/health');
}

export function getAdminStats() {
  return apiFetch<AdminStats>('/api/admin/stats');
}

export function getSyncRuns() {
  return apiFetch<SyncRun[]>('/api/admin/sync-runs');
}

export function getWikiDomains() {
  return apiFetch<WikiDomainsOverview>('/api/wiki-domains');
}

export function getWikiDomain(domain: string) {
  return apiFetch<WikiDomainDetail>(`/api/wiki-domains/${encodeURIComponent(domain)}`);
}

export function searchAll(query: string) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  return withLocalFallback(apiFetch<SearchOverview>(`/api/search?${params.toString()}`), () =>
    searchLocalData(query),
  );
}

async function getCraftsWithLocalComplements(
  path: string,
  filters?: {
    item?: string;
    profession?: string;
    ingredient?: string;
  },
): Promise<CraftsOverview> {
  const localCrafts = await getLocalCrafts(filters);
  const remoteCrafts = await withLocalFallback(apiFetch<CraftsOverview>(path), () => Promise.resolve(localCrafts));

  if (!remoteCrafts.crafts.length) {
    return localCrafts;
  }

  if (!localCrafts.crafts.length) {
    return remoteCrafts;
  }

  const remoteSlugs = new Set(remoteCrafts.crafts.map((craft) => craft.slug));
  return {
    crafts: [...remoteCrafts.crafts, ...localCrafts.crafts.filter((craft) => !remoteSlugs.has(craft.slug))],
  };
}

function mergePokemonDetail(remotePokemon: PokemonDetail, localPokemon: PokemonDetail): PokemonDetail {
  return {
    ...remotePokemon,
    detailSpriteUrl: remotePokemon.detailSpriteUrl || localPokemon.detailSpriteUrl,
    abilities: remotePokemon.abilities || localPokemon.abilities,
    boost: remotePokemon.boost || localPokemon.boost,
    material: remotePokemon.material || localPokemon.material,
    evolutionStone: remotePokemon.evolutionStone || localPokemon.evolutionStone,
    description: remotePokemon.description || localPokemon.description,
    elements: remotePokemon.elements?.length ? remotePokemon.elements : localPokemon.elements,
    evolutions: remotePokemon.evolutions?.length ? remotePokemon.evolutions : localPokemon.evolutions,
    effectiveness: remotePokemon.effectiveness?.length ? remotePokemon.effectiveness : localPokemon.effectiveness,
    moves: remotePokemon.moves?.length ? remotePokemon.moves : localPokemon.moves,
    pvpMoves: remotePokemon.pvpMoves?.length ? remotePokemon.pvpMoves : localPokemon.pvpMoves,
    pveMoves: remotePokemon.pveMoves?.length ? remotePokemon.pveMoves : localPokemon.pveMoves,
    otherVersions: remotePokemon.otherVersions?.length ? remotePokemon.otherVersions : localPokemon.otherVersions,
    loot: remotePokemon.loot?.length ? remotePokemon.loot : localPokemon.loot,
  };
}
