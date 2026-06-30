'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EntityLink, itemHref } from '@/components/entity-link';
import { FavoriteButton } from '@/components/favorite-button';
import { RelatedCrafts } from '@/components/related-sections';
import { findSimilarCrafts } from '@/lib/relationships';
import type { Craft } from '@/types/crafts';

export function CraftDetailView({ craft, crafts }: { craft: Craft; crafts: Craft[] }) {
  const [amount, setAmount] = useState(1);
  const similarCrafts = findSimilarCrafts(craft, crafts);
  const totals = useMemo(
    () =>
      craft.ingredients.map((ingredient) => ({
        ...ingredient,
        total: multiplyQuantity(ingredient.quantity, amount),
      })),
    [amount, craft.ingredients],
  );

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/crafts" className="text-sm font-black text-cyan-200 hover:text-cyan-100">Voltar para crafts</Link>
        <div className="mt-4 grid gap-4 md:grid-cols-[96px_1fr_auto] md:items-start">
          {craft.imageUrl ? <img src={craft.imageUrl} alt={craft.itemName} className="h-24 w-24 object-contain" loading="lazy" /> : null}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{craft.rank || craft.category || 'Craft'}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{craft.itemName}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              <EntityLink href={itemHref(craft.itemSlug, craft.itemName)}>Item criado</EntityLink>
              {' por '}
              <EntityLink href={`/professions/${craft.professionSlug}`}>{craft.profession}</EntityLink>
              {craft.subprofession ? <> / {craft.subprofession}</> : null}
            </p>
          </div>
          <FavoriteButton
            entity={{
              type: 'Craft',
              slug: craft.slug,
              title: craft.itemName,
              url: `/crafts/${craft.slug}`,
              imageUrl: craft.imageUrl,
              summary: `${craft.profession}${craft.subprofession ? ` / ${craft.subprofession}` : ''}`,
            }}
          />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Info title="Habilidade" value={craft.skill} />
        <Info title="Tempo de craft" value={craft.craftTime} />
        <Info title="Categoria" value={craft.category} />
        <Info title="Requisitos" value={craft.requirements} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Calculadora de ingredientes</h3>
            <p className="mt-1 text-sm text-slate-300">Informe quantas unidades deseja craftar.</p>
          </div>
          <div className="flex items-end gap-2">
            <label className="grid gap-2 text-sm font-bold text-slate-300">
              Quantidade
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(Math.max(1, Number(event.target.value) || 1))}
                className="h-11 w-32 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
              />
            </label>
            <button
              type="button"
              onClick={() => setAmount(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-slate-950 text-slate-200 hover:border-cyan-300/60"
              aria-label="Resetar quantidade"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {totals.length ? (
            totals.map((ingredient) => (
              <div key={`${ingredient.name}-${ingredient.quantity}`} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3">
                {ingredient.iconUrl ? <img src={ingredient.iconUrl} alt="" className="h-9 w-9 object-contain" loading="lazy" /> : <span />}
                <EntityLink href={itemHref(ingredient.itemSlug, ingredient.name)}>{ingredient.name}</EntityLink>
                <span className="text-sm font-black text-amber-100">{ingredient.total}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Ingredientes nao listados.</p>
          )}
        </div>
      </section>

      <RelatedCrafts title="Crafts similares" crafts={similarCrafts} empty="Nenhum craft similar encontrado." />
    </article>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</span>
      <p className="mt-2 text-sm font-bold text-white">{value || 'Nao listado'}</p>
    </div>
  );
}

function multiplyQuantity(quantity: string, amount: number) {
  const normalized = quantity.replace(',', '.').match(/\d+(\.\d+)?/);
  if (!normalized) {
    return `${quantity} x ${amount}`;
  }

  const value = Number(normalized[0]);
  const total = value * amount;
  return Number.isInteger(total) ? String(total) : total.toFixed(2);
}
