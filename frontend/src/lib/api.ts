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

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        accept: 'application/json',
        ...init?.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(getConnectionErrorMessage(apiBaseUrl));
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
  return withLocalFallback(apiFetch<ProfessionsOverview>('/api/professions'), getLocalProfessions);
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
  return withLocalFallback(apiFetch<CraftsOverview>(`/api/crafts${suffix}`), () => getLocalCrafts(filters));
}

export function getCraft(slug: string) {
  return withNullableLocalFallback(
    apiFetch<Craft>(`/api/crafts/${encodeURIComponent(slug)}`),
    () => getLocalCraft(slug),
  );
}

export function getPokemon() {
  return withLocalFallback(apiFetch<PokemonOverview>('/api/pokemon'), getLocalPokemon);
}

export function getPokemonDetail(slug: string) {
  return withNullableLocalFallback(
    apiFetch<PokemonDetail>(`/api/pokemon/${encodeURIComponent(slug)}`),
    () => getLocalPokemonDetail(slug),
  );
}

export function getItems() {
  return withLocalFallback(apiFetch<ItemsOverview>('/api/items'), getLocalItems);
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
