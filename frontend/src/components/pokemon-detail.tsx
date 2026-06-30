import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { EntityLink, entityQueryHref } from '@/components/entity-link';
import { FavoriteButton } from '@/components/favorite-button';
import { RelatedCrafts } from '@/components/related-sections';
import { findCraftsForPokemonMaterials } from '@/lib/relationships';
import type { Craft } from '@/types/crafts';
import type { PokemonDetail } from '@/types/pokemon';

export function PokemonDetailView({ pokemon, crafts = [] }: { pokemon: PokemonDetail; crafts?: Craft[] }) {
  const materialCrafts = findCraftsForPokemonMaterials(pokemon, crafts);

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/pokedex" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pokedex
        </Link>
        <div className="mt-4 grid gap-4 md:grid-cols-[120px_1fr_auto] md:items-start">
          {pokemon.detailSpriteUrl || pokemon.spriteUrl ? <img src={pokemon.detailSpriteUrl || pokemon.spriteUrl} alt={pokemon.name} className="h-28 w-28 object-contain" loading="lazy" /> : null}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{pokemon.dex}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{pokemon.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{pokemon.description || 'Descricao nao listada.'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pokemon.elements.map((element) => <span key={element} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">{element}</span>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
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
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Info title="Level" value={pokemon.level} />
        <Info title="Boost" value={pokemon.boost} />
        <Info title="Material" value={pokemon.material} linkValue />
        <Info title="Evolution Stone" value={pokemon.evolutionStone} linkValue />
      </section>
      <RelatedCrafts
        title="Crafts ligados aos materiais"
        crafts={materialCrafts}
        empty="Nenhum craft ligado aos materiais deste Pokemon foi encontrado nos dados atuais."
      />
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Evolucoes</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {pokemon.evolutions.length ? pokemon.evolutions.map((evolution) => <span key={`${evolution.name}-${evolution.level}`} className="rounded-full border border-white/10 px-3 py-1 text-sm font-bold text-slate-200">{evolution.name} - {evolution.level}</span>) : <span className="text-sm text-slate-400">Sem evolucoes listadas.</span>}
        </div>
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Efetividade</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {pokemon.effectiveness.map((group) => (
            <div key={group.category} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <h4 className="font-black text-white">{group.category}</h4>
              <p className="mt-2 text-sm text-slate-300">{group.types.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function Info({ title, value, linkValue = false }: { title: string; value: string; linkValue?: boolean }) {
  const content = value || 'Nao listado';
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</span>
      <p className="mt-2 text-sm font-bold text-white">
        {linkValue && value ? <EntityLink href={entityQueryHref('/items', 'item', value)}>{content}</EntityLink> : content}
      </p>
    </div>
  );
}
