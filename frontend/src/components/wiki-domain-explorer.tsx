'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalizeText } from '@/lib/format';
import type { WikiDomain, WikiDomainDetail } from '@/types/wiki';

export function WikiDomainExplorer({ domains }: { domains: WikiDomain[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const normalizedQuery = normalizeText(query);
  const statuses = useMemo(() => [...new Set(domains.map((domain) => domain.status).filter(Boolean))].sort(), [domains]);
  const filteredDomains = domains
    .filter((domain) => {
      const searchable = [domain.title, domain.domain, domain.description, domain.status].join(' ');
      return (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) && (!status || domain.status === status);
    })
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title, 'pt-BR'));

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{filteredDomains.length} dominios</span>
        <h2 className="mt-1 text-2xl font-black text-white">Wiki Data</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Modulos de dados preparados para expansao gradual: helds, bosses, dungeons, quests, NPCs, berries, addons, outfits, tasks, respawns e mapas.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Buscar
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-300" />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
              <option value="">Todos</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredDomains.map((domain) => (
          <Link key={domain.domain} href={`/wiki-data/${domain.domain}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/70">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">Prioridade {domain.priority}</span>
            <h3 className="mt-1 text-lg font-black text-white">{domain.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-slate-300">{domain.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
              <span className="rounded-full border border-white/10 px-2.5 py-1">{domain.status}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1">{domain.recordCount} registros</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function WikiDomainDetailView({ domain }: { domain: WikiDomainDetail }) {
  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/wiki-data" className="text-sm font-black text-cyan-200 hover:text-cyan-100">Voltar para Wiki Data</Link>
        <span className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Prioridade {domain.priority} / {domain.status}</span>
        <h2 className="mt-1 text-3xl font-black text-white">{domain.title}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{domain.description}</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
          <span>Scraper: <strong className="text-white">{domain.scraperScript}</strong></span>
          <span>Loader: <strong className="text-white">{domain.loaderScript}</strong></span>
        </div>
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Registros</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {domain.entities.length ? (
            domain.entities.map((entity) => (
              <article key={entity.slug} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
                <h4 className="font-black text-white">{entity.name}</h4>
                <p className="mt-2 text-sm text-slate-300">{entity.summary || 'Sem resumo carregado ainda.'}</p>
                <a href={entity.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-black text-cyan-200 hover:text-cyan-100">Wiki</a>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-400">Nenhum registro carregado para este dominio ainda.</p>
          )}
        </div>
      </section>
    </article>
  );
}
