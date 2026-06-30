'use client';

import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type FavoriteEntity = {
  type: 'Pokemon' | 'Item' | 'Craft' | 'Profissao';
  slug: string;
  title: string;
  url: string;
  imageUrl?: string;
  summary?: string;
};

const STORAGE_KEY = 'pxg-tools:favorites';

export function FavoriteButton({ entity }: { entity: FavoriteEntity }) {
  const [favorites, setFavorites] = useState<FavoriteEntity[]>([]);
  const key = favoriteKey(entity);
  const isFavorite = useMemo(() => favorites.some((favorite) => favoriteKey(favorite) === key), [favorites, key]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  function toggleFavorite() {
    const next = isFavorite
      ? favorites.filter((favorite) => favoriteKey(favorite) !== key)
      : [...favorites, entity];
    setFavorites(next);
    writeFavorites(next);
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      className={[
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-black transition',
        isFavorite
          ? 'border-amber-300/60 bg-amber-300/15 text-amber-100'
          : 'border-white/10 bg-slate-900 text-slate-100 hover:border-amber-300/50 hover:text-amber-100',
      ].join(' ')}
    >
      <Heart className={['h-4 w-4', isFavorite ? 'fill-amber-200' : ''].join(' ')} />
      {isFavorite ? 'Favorito' : 'Favoritar'}
    </button>
  );
}

export function readFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteEntity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(favorites: FavoriteEntity[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function favoriteKey(entity: FavoriteEntity) {
  return `${entity.type}:${entity.slug}`;
}
