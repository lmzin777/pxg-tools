import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ClanDetail, ClanIconLabel } from '@/types/clans';

export function ClanDetailView({ clan }: { clan: ClanDetail }) {
  return (
    <article className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos clas
          </Link>
          <h2 className="mt-3 text-3xl font-black text-white">{clan.name}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Dados detalhados de bonus, NPCs, tiers, rotacao e exclusividade PvP.
          </p>
        </div>
        <a
          href={clan.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-black text-slate-100 hover:border-amber-300/50 hover:text-amber-100"
        >
          Wiki
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        {clan.bonus.map((bonus) => (
          <div key={bonus.type} className="rounded-lg border border-cyan-300/20 bg-cyan-300/8 p-4">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              {bonus.type}
            </span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric label="Ataque" value={bonus.attack} />
              <Metric label="Defesa" value={bonus.defense} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Pokemon de NPC</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {clan.npcPokemon.map((row) => (
            <div key={`${row.npc}-${row.pokemon}`} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                {row.label}
              </span>
              <p className="mt-2 text-sm font-black text-white">{row.pokemon}</p>
              <p className="mt-1 text-sm text-slate-300">
                {row.npc} - {row.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Tiers de Pokemon</h3>
        <div className="mt-4 grid gap-4">
          {clan.tiers.map((tier) => (
            <div key={tier.tier} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <h4 className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">
                {tier.tier}
              </h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tier.pokemon.map((pokemon) => (
                  <div
                    key={`${tier.tier}-${pokemon.name}-${pokemon.dex}`}
                    className="grid grid-cols-[48px_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3"
                  >
                    {pokemon.icon ? (
                      <img
                        src={pokemon.icon}
                        alt={pokemon.name}
                        className="h-12 w-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-slate-900" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white">{pokemon.name}</p>
                      <p className="text-xs text-slate-400">{pokemon.dex}</p>
                      <IconLabelRow labels={pokemon.elements} />
                      <IconLabelRow labels={[...pokemon.pveRoles, ...pokemon.pvpRoles, ...pokemon.helds]} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-lg font-black text-white">Rotacao</h3>
          <div className="mt-3 grid gap-3">
            {clan.rotation.map((group) => (
              <div key={group.element} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
                <h4 className="text-sm font-black uppercase tracking-[0.14em] text-amber-200">
                  {group.element}
                </h4>
                <div className="mt-3 grid gap-2">
                  {group.rows.map((row) => (
                    <div
                      key={`${group.element}-${row.pokemon}-${row.role}`}
                      className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] px-3 py-2"
                    >
                      <span className="text-sm font-bold text-white">{row.pokemon}</span>
                      <span className="text-xs text-slate-300">{row.role} - {row.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-rose-300/20 bg-rose-300/8 p-4">
          <h3 className="text-lg font-black text-white">Exclusivo PvP</h3>
          <p className="mt-2 text-sm text-slate-300">{clan.pvpNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {clan.pvpExclusive.map((pokemon) => (
              <span key={pokemon} className="rounded-full border border-rose-300/25 px-2.5 py-1 text-xs font-bold text-rose-100">
                {pokemon}
              </span>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function IconLabelRow({ labels, compact = false }: { labels: ClanIconLabel[]; compact?: boolean }) {
  if (!labels.length) {
    return null;
  }

  return (
    <div className={compact ? 'mt-2 flex flex-wrap gap-1.5' : 'mt-2 flex flex-wrap gap-2'}>
      {labels.map((label) => (
        <span
          key={`${label.label}-${label.icon}`}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-200"
        >
          {label.icon ? (
            <img src={label.icon} alt="" className="h-4 w-4 object-contain" loading="lazy" />
          ) : null}
          {label.label}
        </span>
      ))}
    </div>
  );
}
