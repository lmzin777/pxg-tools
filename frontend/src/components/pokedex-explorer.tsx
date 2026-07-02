'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FavoriteButton } from '@/components/favorite-button';
import { normalizeText } from '@/lib/format';
import { canonicalPokemonType, getTypeIconSrc, parsePokemonTypes, pokemonTypes, type PokemonType } from '@/lib/tools-data';
import type { PokemonListItem } from '@/types/pokemon';

type SortMode = 'dex-asc' | 'dex-desc' | 'name-asc' | 'name-desc' | 'level-asc' | 'level-desc';

type PokedexFilters = {
  query?: string;
  region?: string;
  generation?: string;
  primaryType?: string;
  secondaryType?: string;
  minLevel?: string;
  maxLevel?: string;
  sort?: string;
};

export function PokedexExplorer({
  pokemon,
  generations,
  initialFilters = {},
}: {
  pokemon: PokemonListItem[];
  generations: string[];
  initialFilters?: PokedexFilters;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialFilters.query || '');
  const [region, setRegion] = useState(initialFilters.region || '');
  const [generation, setGeneration] = useState(initialFilters.generation || '');
  const [primaryType, setPrimaryType] = useState(initialFilters.primaryType || '');
  const [secondaryType, setSecondaryType] = useState(initialFilters.secondaryType || '');
  const [minLevel, setMinLevel] = useState(initialFilters.minLevel || '');
  const [maxLevel, setMaxLevel] = useState(initialFilters.maxLevel || '');
  const [sort, setSort] = useState<SortMode>(isSortMode(initialFilters.sort) ? initialFilters.sort : 'dex-asc');
  const normalizedQuery = normalizeText(query);
  const minLevelValue = parseOptionalNumber(minLevel);
  const maxLevelValue = parseOptionalNumber(maxLevel);
  const regions = useMemo(
    () => generations.length ? generations : uniqueSorted(pokemon.map((entry) => entry.generation).filter(Boolean)),
    [generations, pokemon],
  );
  const generationOptions = useMemo(
    () => uniqueSorted(
      pokemon
        .map((entry) => generationLabelForRegion(entry.generation))
        .filter(Boolean),
    ),
    [pokemon],
  );
  const typeOptions = useMemo(() => {
    const presentTypes = new Set<PokemonType>();
    pokemon.forEach((entry) => {
      entry.elements.forEach((element) => {
        parsePokemonTypes(element).forEach((type) => presentTypes.add(type));
      });
    });

    return pokemonTypes.filter((type) => presentTypes.has(type));
  }, [pokemon]);
  const filteredPokemon = useMemo(() => {
    const rows = pokemon.filter((entry) => {
        const entryTypes = getEntryTypes(entry.elements);
        const entryLevel = parsePokemonLevel(entry.level);
        const searchable = [
          entry.name,
          entry.dex,
          entry.generation,
          generationLabelForRegion(entry.generation),
          entry.level,
          entry.elements.join(' '),
          entryTypes.join(' '),
        ].join(' ');
        return (
          (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) &&
          (!region || entry.generation === region) &&
          (!generation || generationLabelForRegion(entry.generation) === generation) &&
          (!primaryType || entryTypes.includes(primaryType as PokemonType)) &&
          (!secondaryType || entryTypes.includes(secondaryType as PokemonType)) &&
          (!minLevelValue || (entryLevel !== null && entryLevel >= minLevelValue)) &&
          (!maxLevelValue || (entryLevel !== null && entryLevel <= maxLevelValue))
        );
      });

    return sortPokemon(rows, sort);
  }, [generation, maxLevelValue, minLevelValue, normalizedQuery, pokemon, primaryType, region, secondaryType, sort]);

  const hasActiveFilters = Boolean(query || region || generation || primaryType || secondaryType || minLevel || maxLevel || sort !== 'dex-asc');

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (region) params.set('region', region);
    if (generation) params.set('generation', generation);
    if (primaryType) params.set('type', primaryType);
    if (secondaryType) params.set('type2', secondaryType);
    if (minLevel) params.set('minLevel', minLevel);
    if (maxLevel) params.set('maxLevel', maxLevel);
    if (sort !== 'dex-asc') params.set('sort', sort);

    const nextUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, '', nextUrl);
  }, [generation, maxLevel, minLevel, pathname, primaryType, query, region, secondaryType, sort]);

  function clearFilters() {
    setQuery('');
    setRegion('');
    setGeneration('');
    setPrimaryType('');
    setSecondaryType('');
    setMinLevel('');
    setMaxLevel('');
    setSort('dex-asc');
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          {filteredPokemon.length} de {pokemon.length}
        </span>
        <h2 className="mt-1 text-2xl font-black text-white">Pokedex</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Nome
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pikachu, #025..." className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-300" />
            </span>
          </label>
          <Select label="Regiao" value={region} onChange={setRegion} options={regions} />
          <Select label="Geracao" value={generation} onChange={setGeneration} options={generationOptions} />
          <Select label="Elemento 1" value={primaryType} onChange={setPrimaryType} options={typeOptions} />
          <Select label="Elemento 2" value={secondaryType} onChange={setSecondaryType} options={typeOptions} />
          <NumberInput label="Nivel minimo" value={minLevel} onChange={setMinLevel} placeholder="20" />
          <NumberInput label="Nivel maximo" value={maxLevel} onChange={setMaxLevel} placeholder="80" />
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filteredPokemon.map((entry) => (
          <article key={entry.slug} className="relative rounded-lg border border-white/10 bg-white/[0.035] transition hover:border-cyan-300/70 hover:bg-white/[0.06]">
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton
                compact
                entity={{
                  type: 'Pokemon',
                  slug: entry.slug,
                  title: entry.name,
                  url: `/pokedex/${entry.slug}`,
                  imageUrl: entry.spriteUrl,
                  summary: [entry.dex, entry.generation, entry.elements.join(', ')].filter(Boolean).join(' | '),
                }}
              />
            </div>
            <Link href={`/pokedex/${entry.slug}`} className="group grid min-h-64 gap-3 p-4 pr-14">
              <div className="flex items-center gap-3">
                {entry.spriteUrl ? <img src={entry.spriteUrl} alt={entry.name} className="h-16 w-16 object-contain" loading="lazy" /> : null}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-400">{entry.dex}</span>
                  <h3 className="truncate font-black text-white group-hover:text-cyan-100">{entry.name}</h3>
                  <p className="text-xs text-slate-400">{entry.generation} - {generationLabelForRegion(entry.generation)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {getEntryTypes(entry.elements).map((element) => <TypePill key={element} type={element} />)}
              </div>
              <div className="mt-auto grid gap-2 text-sm text-slate-300">
                <InfoLine label="Nivel" value={entry.level} strong highlight />
                <InfoLine label="Boost" value={formatCompactPokemonInfo(entry.boost)} />
                <InfoLine label="Materia" value={formatCompactPokemonInfo(entry.material)} />
              </div>
            </Link>
          </article>
        ))}
      </div>

      {!filteredPokemon.length ? (
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-4">
          <p className="text-sm font-bold text-amber-100">Nenhum Pokemon encontrado para os filtros atuais.</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-slate-950 px-3 text-sm font-black text-white transition hover:border-amber-300/50 hover:text-amber-100"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
        <option value="">Todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function NumberInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
      />
    </label>
  );
}

function SortSelect({ value, onChange }: { value: SortMode; onChange: (value: SortMode) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      Ordenar
      <select value={value} onChange={(event) => onChange(event.target.value as SortMode)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
        <option value="dex-asc">Dex crescente</option>
        <option value="dex-desc">Dex decrescente</option>
        <option value="name-asc">Nome A-Z</option>
        <option value="name-desc">Nome Z-A</option>
        <option value="level-asc">Menor nivel</option>
        <option value="level-desc">Maior nivel</option>
      </select>
    </label>
  );
}

function TypePill({ type }: { type: string }) {
  const displayType = canonicalPokemonType(type) || type;
  const iconSrc = getTypeIconSrc(displayType);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
      {iconSrc ? <img src={iconSrc} alt="" className="h-4 w-4" loading="lazy" /> : null}
      {displayType}
    </span>
  );
}

function getEntryTypes(elements: string[]) {
  return [...new Set(elements.flatMap((element) => parsePokemonTypes(element)))];
}

function generationLabelForRegion(region: string) {
  const generationNumber = regionGenerationMap[region];
  return generationNumber ? `${generationNumber}a geracao` : '';
}

const regionGenerationMap: Record<string, number> = {
  Kanto: 1,
  Johto: 2,
  Hoenn: 3,
  Sinnoh: 4,
  Unova: 5,
  Kalos: 6,
  Alola: 7,
  Galar: 8,
  Paldea: 9,
};

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function parsePokemonLevel(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parseOptionalNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function sortPokemon(pokemon: PokemonListItem[], sort: SortMode) {
  const rows = [...pokemon];
  rows.sort((a, b) => {
    if (sort === 'name-asc') return a.name.localeCompare(b.name, 'pt-BR');
    if (sort === 'name-desc') return b.name.localeCompare(a.name, 'pt-BR');
    if (sort === 'level-asc') return sortableLevel(a, 'asc') - sortableLevel(b, 'asc');
    if (sort === 'level-desc') return sortableLevel(b, 'desc') - sortableLevel(a, 'desc');
    if (sort === 'dex-desc') return b.dexNumber - a.dexNumber;
    return a.dexNumber - b.dexNumber;
  });
  return rows;
}

function sortableLevel(pokemon: PokemonListItem, direction: 'asc' | 'desc') {
  const level = parsePokemonLevel(pokemon.level);
  if (level === null) {
    return direction === 'asc' ? Number.MAX_SAFE_INTEGER : -1;
  }

  return level;
}

function isSortMode(value: string | undefined): value is SortMode {
  return value === 'dex-asc'
    || value === 'dex-desc'
    || value === 'name-asc'
    || value === 'name-desc'
    || value === 'level-asc'
    || value === 'level-desc';
}

function formatCompactPokemonInfo(value: string) {
  return value
    .replace(/\([^)]*\)/g, '')
    .replace(/\bEnhanced\b/gi, '')
    .replace(/\s+ou\s+/gi, ' ou ')
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/g, '')
    .trim();
}

function InfoLine({ label, value, strong = false, highlight = false }: { label: string; value: string; strong?: boolean; highlight?: boolean }) {
  if (!value) return null;

  return (
    <span className={['grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3 rounded-md border px-2.5 py-1.5', highlight ? 'border-amber-300/25 bg-amber-300/10' : 'border-white/10 bg-slate-950/60'].join(' ')}>
      <span className={['text-xs font-bold uppercase tracking-[0.12em]', highlight ? 'text-amber-200' : 'text-slate-500'].join(' ')}>{label}</span>
      <span className={strong ? 'min-w-0 truncate text-right font-black text-amber-100' : 'min-w-0 truncate text-right font-bold text-slate-200'} title={value}>
        {value}
      </span>
    </span>
  );
}
