'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalizeText } from '@/lib/format';
import type { ProfessionSummary } from '@/types/professions';

export function ProfessionsExplorer({ professions }: { professions: ProfessionSummary[] }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalizeText(query);
  const filteredProfessions = useMemo(() => {
    if (!normalizedQuery) return professions;
    return professions.filter((profession) =>
      normalizeText([profession.name, profession.summary].join(' ')).includes(normalizedQuery),
    );
  }, [normalizedQuery, professions]);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            profissoes
          </span>
          <h2 className="mt-1 text-2xl font-black text-white">Escolha uma profissao</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Consulte especializacoes, caracteristicas, recursos e crafts por profissao.
          </p>
        </div>
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Buscar profissao
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Engenheiro, Professor..."
              className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            />
          </span>
        </label>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {filteredProfessions.map((profession) => (
          <Link
            key={profession.slug}
            href={`/professions/${profession.slug}`}
            className="grid grid-cols-[72px_1fr] gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/70 hover:bg-white/[0.06]"
          >
            {profession.iconUrl ? (
              <img src={profession.iconUrl} alt={profession.name} className="h-20 w-20 object-contain" loading="lazy" />
            ) : (
              <div className="h-20 w-20 rounded-md bg-slate-900" />
            )}
            <span className="min-w-0">
              <span className="text-xl font-black text-white">{profession.name}</span>
              <span className="mt-2 line-clamp-3 block text-sm leading-6 text-slate-300">{profession.summary}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
