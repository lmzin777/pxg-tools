'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalizeText } from '@/lib/format';
import type { PokemonListItem } from '@/types/pokemon';

export function PokedexExplorer({
  pokemon,
  generations,
}: {
  pokemon: PokemonListItem[];
  generations: string[];
}) {
  const [query, setQuery] = useState('');
  const [generation, setGeneration] = useState('');
  const [type, setType] = useState('');
  const normalizedQuery = normalizeText(query);
  const typeOptions = useMemo(
    () => [...new Set(pokemon.flatMap((entry) => entry.elements))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [pokemon],
  );
  const filteredPokemon = useMemo(
    () =>
      pokemon.filter((entry) => {
        const searchable = [entry.name, entry.dex, entry.generation, entry.level, entry.elements.join(' ')].join(' ');
        return (
          (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) &&
          (!generation || entry.generation === generation) &&
          (!type || entry.elements.includes(type))
        );
      }),
    [generation, normalizedQuery, pokemon, type],
  );

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          {filteredPokemon.length} de {pokemon.length}
        </span>
        <h2 className="mt-1 text-2xl font-black text-white">Pokedex</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Nome
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pikachu, #025..." className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-300" />
            </span>
          </label>
          <Select label="Geracao" value={generation} onChange={setGeneration} options={generations} />
          <Select label="Tipo" value={type} onChange={setType} options={typeOptions} />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filteredPokemon.map((entry) => (
          <Link key={entry.slug} href={`/pokedex/${entry.slug}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/70">
            <div className="flex items-center gap-3">
              {entry.spriteUrl ? <img src={entry.spriteUrl} alt={entry.name} className="h-16 w-16 object-contain" loading="lazy" /> : null}
              <div>
                <span className="text-xs font-bold text-slate-400">{entry.dex}</span>
                <h3 className="font-black text-white">{entry.name}</h3>
                <p className="text-xs text-slate-400">{entry.generation}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.elements.map((element) => <Pill key={element}>{element}</Pill>)}
            </div>
            {entry.level ? <p className="mt-3 text-sm text-slate-300">Level: {entry.level}</p> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
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

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">{children}</span>;
}
