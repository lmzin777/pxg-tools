import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { EntityLink, entityQueryHref } from '@/components/entity-link';
import { FavoriteButton } from '@/components/favorite-button';
import { RelatedCrafts } from '@/components/related-sections';
import { findCraftsForPokemonMaterials } from '@/lib/relationships';
import type { Craft } from '@/types/crafts';
import type { PokemonDetail, PokemonEffectivenessGroup, PokemonEvolution, PokemonMove, PokemonVersion } from '@/types/pokemon';

export function PokemonDetailView({ pokemon, crafts = [] }: { pokemon: PokemonDetail; crafts?: Craft[] }) {
  const materialCrafts = findCraftsForPokemonMaterials(pokemon, crafts);

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/pokedex" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pokedex
        </Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[160px_1fr_auto] lg:items-start">
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-white/10 bg-slate-950/60">
            {pokemon.detailSpriteUrl || pokemon.spriteUrl ? (
              <img src={pokemon.detailSpriteUrl || pokemon.spriteUrl} alt={pokemon.name} className="h-36 w-36 object-contain" loading="lazy" />
            ) : null}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{pokemon.dex} / {pokemon.generation}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{pokemon.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {pokemon.elements.map((element) => <Pill key={element}>{element}</Pill>)}
            </div>
            <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{pokemon.description || 'Descricao nao listada na Wiki.'}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <a href={pokemon.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-black text-slate-100 hover:border-amber-300/50">
              Wiki <ExternalLink className="h-4 w-4" />
            </a>
            <FavoriteButton
              entity={{
                type: 'Pokemon',
                slug: pokemon.slug,
                title: pokemon.name,
                url: `/pokedex/${pokemon.slug}`,
                imageUrl: pokemon.detailSpriteUrl || pokemon.spriteUrl,
                summary: pokemon.description,
              }}
            />
          </div>
        </div>
      </section>

      <PokemonInfoPanel pokemon={pokemon} />
      <RelatedCrafts
        title="Crafts ligados aos materiais"
        crafts={materialCrafts}
        empty="Nenhum craft ligado aos materiais deste Pokemon foi encontrado nos dados atuais."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <PokemonEvolutionChain evolutions={pokemon.evolutions} />
        <PokemonVersionsGrid versions={pokemon.otherVersions} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <PokemonMovesTable title="Movimentos PvP" moves={pokemon.pvpMoves} />
        <PokemonMovesTable title="Movimentos PvE" moves={pokemon.pveMoves} />
      </div>
      <PokemonEffectivenessTable groups={pokemon.effectiveness} />
    </article>
  );
}

function PokemonInfoPanel({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Info title="Level" value={pokemon.level} />
      <Info title="Habilidades" value={pokemon.abilities} wide />
      <Info title="Boost" value={pokemon.boost} />
      <Info title="Materia" value={pokemon.material} linkValue />
      <Info title="Pedra de evolucao" value={pokemon.evolutionStone} linkValue />
    </section>
  );
}

function PokemonEvolutionChain({ evolutions }: { evolutions: PokemonEvolution[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Evolucoes</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {evolutions.length ? (
          evolutions.map((evolution) => (
            <EntityLink key={`${evolution.name}-${evolution.level}`} href={`/pokedex/${slugify(evolution.name)}`}>
              <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-sm">
                {evolution.name}{evolution.level ? ` - ${evolution.level}` : ''}
              </span>
            </EntityLink>
          ))
        ) : (
          <span className="text-sm text-slate-400">Sem evolucoes listadas.</span>
        )}
      </div>
    </section>
  );
}

function PokemonMovesTable({ title, moves }: { title: string; moves: PokemonMove[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead className="bg-cyan-300/10 text-left text-cyan-100">
            <tr>
              <th className="border border-white/10 p-3">Movimento</th>
              <th className="border border-white/10 p-3">Tipo</th>
              <th className="border border-white/10 p-3">Cooldown</th>
              <th className="border border-white/10 p-3">Level</th>
            </tr>
          </thead>
          <tbody>
            {moves.length ? (
              moves.map((move) => (
                <tr key={`${title}-${move.name}`} className="bg-slate-950/40">
                  <td className="border border-white/10 p-3 font-bold text-white">{move.name}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{move.type || '-'}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{move.cooldown || '-'}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{move.level || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-white/10 p-3 text-slate-400" colSpan={4}>Nenhum movimento listado para esta categoria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PokemonEffectivenessTable({ groups }: { groups: PokemonEffectivenessGroup[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Efetividades</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.length ? (
          groups.map((group) => (
            <div key={group.category} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <h4 className="font-black text-white">{group.category}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.types.map((type) => <Pill key={`${group.category}-${type}`}>{type}</Pill>)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">Efetividades nao listadas.</p>
        )}
      </div>
    </section>
  );
}

function PokemonVersionsGrid({ versions }: { versions: PokemonVersion[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Outras versoes</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {versions.length ? (
          versions.map((version) => (
            <EntityLink key={version.slug || version.name} href={`/pokedex/${version.slug || slugify(version.name)}`}>
              <span className="grid grid-cols-[36px_1fr] items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-2 text-sm">
                {version.iconUrl ? <img src={version.iconUrl} alt="" className="h-9 w-9 object-contain" loading="lazy" /> : <span className="h-9 w-9 rounded-md bg-slate-900" />}
                {version.name}
              </span>
            </EntityLink>
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhuma outra versao listada.</p>
        )}
      </div>
    </section>
  );
}

function Info({ title, value, linkValue = false, wide = false }: { title: string; value: string; linkValue?: boolean; wide?: boolean }) {
  const content = value || 'Nao listado';
  return (
    <div className={['rounded-lg border border-white/10 bg-white/[0.03] p-4', wide ? 'xl:col-span-2' : ''].join(' ')}>
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</span>
      <p className="mt-2 text-sm font-bold text-white">
        {linkValue && value ? <EntityLink href={entityQueryHref('/items', 'item', value)}>{content}</EntityLink> : content}
      </p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
      {children}
    </span>
  );
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
