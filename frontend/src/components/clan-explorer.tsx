'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getTypeIconSrc } from '@/lib/tools-data';
import type { Clan } from '@/types/clans';

export function ClanExplorer({ clans }: { clans: Clan[] }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredClans = useMemo(() => {
    if (!normalizedQuery) {
      return clans;
    }

    return clans.filter((clan) =>
      [
        clan.name,
        clan.focus,
        clan.summary,
        clan.types.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [clans, normalizedQuery]);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            clas
          </span>
          <h2 className="mt-1 text-2xl font-black text-white">Escolha um cla</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Consulte foco, tipos e detalhes de cada cla usando os dados servidos pela API .NET.
          </p>
        </div>
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Buscar cla
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Volcanic, Fire, support..."
              className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            />
          </span>
        </label>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredClans.map((clan) => (
          <ClanCard key={clan.slug} clan={clan} />
        ))}
      </div>

      {!filteredClans.length ? (
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-4 text-sm text-amber-100">
          Nenhum cla encontrado para esse filtro.
        </div>
      ) : null}
    </div>
  );
}

function ClanCard({ clan }: { clan: Clan }) {
  return (
    <Link
      href={`/clans/${clan.slug}`}
      className="group grid min-h-60 gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/70 hover:bg-white/[0.06]"
    >
      <div>
        <div className="flex items-start gap-3">
          {clan.iconUrl ? (
            <img
              src={clan.iconUrl}
              alt={`Simbolo do cla ${clan.name}`}
              className="h-16 w-16 shrink-0 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="h-16 w-16 shrink-0 rounded-lg border border-white/10 bg-slate-950" />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {clan.types.map((type) => (
                <ElementPill key={type} type={type} />
              ))}
            </div>
            <h3 className="mt-3 text-xl font-black text-white group-hover:text-cyan-100">
              {clan.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-amber-100">{clan.focus}</p>
          </div>
        </div>
      </div>
      <p className="line-clamp-4 text-sm leading-6 text-slate-300">{clan.summary}</p>
      <span className="mt-auto text-sm font-black text-cyan-200">Abrir detalhes</span>
    </Link>
  );
}

function ElementPill({ type }: { type: string }) {
  const iconSrc = getTypeIconSrc(type);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
      {iconSrc ? <img src={iconSrc} alt="" className="h-4 w-4" loading="lazy" /> : null}
      {type}
    </span>
  );
}
