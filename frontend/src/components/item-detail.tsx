import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { FavoriteButton } from '@/components/favorite-button';
import { RelatedCrafts, RelatedProfessions, RelatedPokemon } from '@/components/related-sections';
import { findCraftsCreatingItem, findCraftsUsingItem, findProfessionsForItem } from '@/lib/relationships';
import type { Craft } from '@/types/crafts';
import type { ItemDetail } from '@/types/items';
import type { PokemonListItem } from '@/types/pokemon';

export function ItemDetailView({ item, crafts, pokemon = [] }: { item: ItemDetail; crafts: Craft[]; pokemon?: PokemonListItem[] }) {
  const createdBy = findCraftsCreatingItem(crafts, item);
  const usedBy = findCraftsUsingItem(crafts, item);
  const professions = findProfessionsForItem(crafts, item);
  const relatedPokemon = pokemon.filter((entry) =>
    [entry.name, entry.level, entry.elements.join(' ')].join(' ').toLowerCase().includes(item.name.toLowerCase()),
  );

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href={`/items/${item.categorySlug}`} className="text-sm font-black text-cyan-200 hover:text-cyan-100">Voltar para {item.categoryTitle}</Link>
        <div className="mt-4 grid gap-4 md:grid-cols-[88px_1fr_auto] md:items-start">
          {item.iconUrl ? <img src={item.iconUrl} alt={item.name} className="h-20 w-20 object-contain" loading="lazy" /> : null}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{item.categoryGroup} / {item.section || item.table}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{item.name}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{item.description || 'Sem descricao.'}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <FavoriteButton
              entity={{
                type: 'Item',
                slug: item.slug,
                title: item.name,
                url: `/items/detail/${item.slug}`,
                imageUrl: item.iconUrl,
                summary: item.description,
              }}
            />
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-black text-slate-100 hover:border-amber-300/50">
              Wiki <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Atributos</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.attributes.length ? (
            item.attributes.map((attr) => <span key={`${attr.name}-${attr.value}`} className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">{attr.name}: {attr.value}</span>)
          ) : (
            <p className="text-sm text-slate-400">Nenhum atributo listado.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <RelatedCrafts title="Crafts que criam este item" crafts={createdBy} empty="Nenhum craft cria este item nos dados atuais." />
        <RelatedCrafts title="Crafts que usam este item" crafts={usedBy} empty="Nenhum craft usa este item nos dados atuais." />
      </div>
      <RelatedProfessions professions={professions} />
      <RelatedPokemon pokemon={relatedPokemon} />
    </article>
  );
}
