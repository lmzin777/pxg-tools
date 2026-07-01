import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ClanDetail, ClanIconLabel } from '@/types/clans';

export function ClanDetailView({ clan }: { clan: ClanDetail }) {
  const pokemonVisuals = buildPokemonVisualIndex(clan);

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
              <Link href={pokemonHref(row.pokemon)} className="mt-2 inline-flex text-sm font-black text-cyan-100 hover:text-amber-100">
                {row.pokemon}
              </Link>
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
                      <Link href={pokemonHref(pokemon.name)} className="text-sm font-black text-cyan-100 hover:text-amber-100">
                        {pokemon.name}
                      </Link>
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
              <div key={group.element} className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/50">
                <div className="flex items-center justify-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2">
                  <IconLabel label={{ label: group.element, icon: pokemonVisuals.elementIcons.get(group.element) || '' }} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-sm">
                    <thead className="bg-cyan-300/10 text-cyan-100">
                      <tr>
                        <th className="border border-white/10 p-2 text-left">Pokemon</th>
                        <th className="border border-white/10 p-2 text-left">Elemento</th>
                        <th className="border border-white/10 p-2 text-left">Funcao</th>
                        <th className="border border-white/10 p-2 text-left">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row) => {
                        const visual = pokemonVisuals.byName.get(normalizePokemonName(row.pokemon));
                        const roleIcon = row.roleIcon || visual?.roleIcon || '';
                        return (
                          <tr key={`${group.element}-${row.pokemon}-${row.role}-${row.tier}`} className="odd:bg-white/[0.025] even:bg-white/[0.05]">
                            <td className="border border-white/10 p-2">
                              <div className="flex items-center gap-2 font-bold text-white">
                                {visual?.icon ? <img src={visual.icon} alt="" className="h-8 w-8 object-contain" loading="lazy" /> : null}
                                <Link href={pokemonHref(row.pokemon)} className="text-cyan-100 hover:text-amber-100">
                                  {row.pokemon}
                                </Link>
                              </div>
                            </td>
                            <td className="border border-white/10 p-2">
                              <IconLabelRow labels={visual?.elements || [{ label: group.element, icon: pokemonVisuals.elementIcons.get(group.element) || '' }]} compact />
                            </td>
                            <td className="border border-white/10 p-2">
                              <IconLabel label={{ label: row.role, icon: roleIcon }} />
                            </td>
                            <td className="border border-white/10 p-2 text-slate-200">{row.tier}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
              <Link key={pokemon} href={pokemonHref(pokemon)} className="rounded-full border border-rose-300/25 px-2.5 py-1 text-xs font-bold text-rose-100 hover:border-amber-300/50 hover:text-amber-100">
                {pokemon}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

function buildPokemonVisualIndex(clan: ClanDetail) {
  const byName = new Map<string, { icon: string; elements: ClanIconLabel[]; roleIcon: string }>();
  const elementIcons = new Map<string, string>();

  for (const tier of clan.tiers) {
    for (const pokemon of tier.pokemon) {
      for (const element of pokemon.elements) {
        if (element.label && element.icon && !elementIcons.has(element.label)) {
          elementIcons.set(element.label, element.icon);
        }
      }

      const firstRole = [...pokemon.pveRoles, ...pokemon.pvpRoles].find((role) => role.icon);
      byName.set(normalizePokemonName(pokemon.name), {
        icon: pokemon.icon,
        elements: pokemon.elements,
        roleIcon: firstRole?.icon || '',
      });
    }
  }

  return { byName, elementIcons };
}

function normalizePokemonName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function pokemonHref(name: string) {
  return `/pokedex/${slugifyPokemonName(name)}`;
}

function slugifyPokemonName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
        <IconLabel key={`${label.label}-${label.icon}`} label={label} />
      ))}
    </div>
  );
}

function IconLabel({ label }: { label: ClanIconLabel }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-200">
      {label.icon ? (
        <img src={label.icon} alt="" className="h-4 w-4 object-contain" loading="lazy" />
      ) : null}
      {label.label}
    </span>
  );
}
