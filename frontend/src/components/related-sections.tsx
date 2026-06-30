import { EntityLink, itemHref } from '@/components/entity-link';
import type { Craft } from '@/types/crafts';
import type { ItemSummary } from '@/types/items';
import type { PokemonListItem } from '@/types/pokemon';
import type { RelatedProfession } from '@/lib/relationships';

export function RelatedCrafts({
  title,
  crafts,
  empty = 'Nenhum craft relacionado encontrado nos dados atuais.',
}: {
  title: string;
  crafts: Craft[];
  empty?: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-3 grid gap-2">
        {crafts.length ? (
          crafts.slice(0, 8).map((craft) => (
            <div key={`${title}-${craft.slug}`} className="grid grid-cols-[36px_1fr] gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-2">
              {craft.imageUrl ? <img src={craft.imageUrl} alt="" className="h-9 w-9 object-contain" loading="lazy" /> : <span />}
              <span className="min-w-0 text-sm">
                <EntityLink href={`/crafts/${craft.slug}`}>{craft.itemName}</EntityLink>
                <span className="block text-xs text-slate-400">
                  {craft.profession}
                  {craft.subprofession ? ` / ${craft.subprofession}` : ''} - {craft.rank || craft.category || 'Craft'}
                </span>
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">{empty}</p>
        )}
      </div>
    </section>
  );
}

export function RelatedItems({ title, items }: { title: string; items: ItemSummary[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? (
          items.slice(0, 18).map((item) => (
            <EntityLink key={`${title}-${item.slug}-${item.name}`} href={itemHref(item.slug, item.name)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-2.5 py-1 text-xs">
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-5 w-5 object-contain" loading="lazy" /> : null}
                {item.name}
              </span>
            </EntityLink>
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhum item relacionado encontrado.</p>
        )}
      </div>
    </section>
  );
}

export function RelatedProfessions({ professions }: { professions: RelatedProfession[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Profissoes relacionadas</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {professions.length ? (
          professions.map((profession) => (
            <EntityLink key={`${profession.slug}-${profession.subprofessionSlug || 'general'}`} href={`/professions/${profession.slug}`}>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs">
                {profession.name}
                {profession.subprofession ? ` / ${profession.subprofession}` : ''}
              </span>
            </EntityLink>
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhuma profissao relacionada encontrada.</p>
        )}
      </div>
    </section>
  );
}

export function RelatedPokemon({ pokemon }: { pokemon: PokemonListItem[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Pokemon relacionados</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {pokemon.length ? (
          pokemon.slice(0, 18).map((entry) => (
            <EntityLink key={entry.slug} href={`/pokedex/${entry.slug}`}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-2.5 py-1 text-xs">
                {entry.spriteUrl ? <img src={entry.spriteUrl} alt="" className="h-5 w-5 object-contain" loading="lazy" /> : null}
                {entry.name}
              </span>
            </EntityLink>
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhum Pokemon relacionado encontrado.</p>
        )}
      </div>
    </section>
  );
}
