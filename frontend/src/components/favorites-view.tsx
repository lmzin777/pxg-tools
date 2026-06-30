'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type FavoriteEntity, favoriteKey, readFavorites, writeFavorites } from '@/components/favorite-button';

const favoriteTypes: FavoriteEntity['type'][] = ['Pokemon', 'Item', 'Craft', 'Profissao'];

export function FavoritesView() {
  const [favorites, setFavorites] = useState<FavoriteEntity[]>([]);
  const grouped = useMemo(
    () => favoriteTypes.map((type) => ({ type, items: favorites.filter((favorite) => favorite.type === type) })),
    [favorites],
  );

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  function removeFavorite(entity: FavoriteEntity) {
    const next = favorites.filter((favorite) => favoriteKey(favorite) !== favoriteKey(entity));
    setFavorites(next);
    writeFavorites(next);
  }

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">localStorage</span>
        <h2 className="mt-1 text-2xl font-black text-white">Favoritos</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Seus favoritos ficam salvos localmente neste navegador, sem login.
        </p>
      </section>

      {grouped.map((group) => (
        <section key={group.type} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-lg font-black text-white">{group.type}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {group.items.length ? (
              group.items.map((item) => (
                <article key={favoriteKey(item)} className="grid grid-cols-[44px_1fr_auto] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-11 w-11 object-contain" loading="lazy" /> : <span className="h-11 w-11 rounded-md bg-slate-900" />}
                  <span className="min-w-0">
                    <Link href={item.url} className="font-black text-cyan-100 hover:text-amber-100">{item.title}</Link>
                    <span className="mt-1 line-clamp-2 block text-xs text-slate-400">{item.summary || item.type}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFavorite(item)}
                    aria-label={`Remover ${item.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-rose-300/60 hover:text-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhum favorito deste tipo ainda.</p>
            )}
          </div>
        </section>
      ))}
    </article>
  );
}
