'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FavoriteButton } from '@/components/favorite-button';
import { normalizeText } from '@/lib/format';
import { canonicalPokemonType, getTypeIconSrc, parsePokemonTypes, pokemonTypes, type PokemonType } from '@/lib/tools-data';
import type { PokemonListItem } from '@/types/pokemon';

export function PokedexExplorer({
  pokemon,
  generations,
}: {
  pokemon: PokemonListItem[];
  generations: string[];
}) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [generation, setGeneration] = useState('');
  const [primaryType, setPrimaryType] = useState('');
  const [secondaryType, setSecondaryType] = useState('');
  const normalizedQuery = normalizeText(query);
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
  const filteredPokemon = useMemo(
    () =>
      pokemon.filter((entry) => {
        const entryTypes = getEntryTypes(entry.elements);
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
          (!secondaryType || entryTypes.includes(secondaryType as PokemonType))
        );
      }),
    [generation, normalizedQuery, pokemon, primaryType, region, secondaryType],
  );

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          {filteredPokemon.length} de {pokemon.length}
        </span>
        <h2 className="mt-1 text-2xl font-black text-white">Pokedex</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Nome
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pikachu, #025..." className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-300" />
            </span>
          </label>
          <Select label="Regiao" value={region} onChange={setRegion} options={regions} />
          <Select label="Geracao" value={generation} onChange={setGeneration} options={generationOptions} />
          <Select label="Tipo 1" value={primaryType} onChange={setPrimaryType} options={typeOptions} />
          <Select label="Tipo 2" value={secondaryType} onChange={setSecondaryType} options={typeOptions} />
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
                <InfoLine label="Level" value={entry.level} strong />
                <InfoLine label="Boost" value={formatCompactPokemonInfo(entry.boost)} />
                <InfoLine label="Materia" value={formatCompactPokemonInfo(entry.material)} />
              </div>
            </Link>
          </article>
        ))}
      </div>
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

function formatCompactPokemonInfo(value: string) {
  return value
    .replace(/\([^)]*\)/g, '')
    .replace(/\bEnhanced\b/gi, '')
    .replace(/\s+ou\s+/gi, ' ou ')
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/g, '')
    .trim();
}

function InfoLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  if (!value) return null;

  return (
    <span className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3 rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className={strong ? 'min-w-0 truncate text-right font-black text-amber-100' : 'min-w-0 truncate text-right font-bold text-slate-200'} title={value}>
        {value}
      </span>
    </span>
  );
}
