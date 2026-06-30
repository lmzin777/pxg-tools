import type { Clan, ClanDetail } from '@/types/clans';
import type { Craft, CraftsOverview } from '@/types/crafts';
import type { ItemCategoryDetail, ItemsOverview } from '@/types/items';
import type { ItemDetail } from '@/types/items';
import type { PokemonDetail, PokemonOverview } from '@/types/pokemon';
import type { ProfessionDetail, ProfessionsOverview } from '@/types/professions';
import type { AdminHealth, AdminStats, SyncRun } from '@/types/admin';
import type { SearchOverview } from '@/types/search';
import type { WikiDomainDetail, WikiDomainsOverview } from '@/types/wiki';

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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;

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
  } catch (error) {
    throw new ApiError(
      `Nao foi possivel conectar na API .NET em ${getApiBaseUrl()}. Confirme se o backend esta rodando e se API_BASE_URL esta correto.`,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `A API respondeu ${response.status} para ${path}.`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export function getClans() {
  return apiFetch<Clan[]>('/api/clans');
}

export function getClanDetail(slug: string) {
  return apiFetch<ClanDetail>(`/api/clans/${encodeURIComponent(slug)}`);
}

export function getProfessions() {
  return apiFetch<ProfessionsOverview>('/api/professions');
}

export function getProfessionDetail(slug: string) {
  return apiFetch<ProfessionDetail>(`/api/professions/${encodeURIComponent(slug)}`);
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
  return apiFetch<CraftsOverview>(`/api/crafts${suffix}`);
}

export function getCraft(slug: string) {
  return apiFetch<Craft>(`/api/crafts/${encodeURIComponent(slug)}`);
}

export function getPokemon() {
  return apiFetch<PokemonOverview>('/api/pokemon');
}

export function getPokemonDetail(slug: string) {
  return apiFetch<PokemonDetail>(`/api/pokemon/${encodeURIComponent(slug)}`);
}

export function getItems() {
  return apiFetch<ItemsOverview>('/api/items');
}

export function getItemCategory(slug: string) {
  return apiFetch<ItemCategoryDetail>(`/api/items/categories/${encodeURIComponent(slug)}`);
}

export function getItemDetail(slug: string) {
  return apiFetch<ItemDetail>(`/api/items/detail/${encodeURIComponent(slug)}`);
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
  return apiFetch<SearchOverview>(`/api/search?${params.toString()}`);
}
