'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EntityLink, itemHref } from '@/components/entity-link';
import { RelatedCrafts, RelatedProfessions } from '@/components/related-sections';
import { normalizeText } from '@/lib/format';
import { findCraftsCreatingItem, findCraftsUsingItem, findProfessionsForItem } from '@/lib/relationships';
import type { Craft } from '@/types/crafts';
import type { ItemCategoryDetail, ItemCategorySummary } from '@/types/items';

export function ItemsExplorer({ categories, initialQuery = '' }: { categories: ItemCategorySummary[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [group, setGroup] = useState('');
  const normalizedQuery = normalizeText(query);
  const groups = useMemo(() => [...new Set(categories.map((category) => category.group))].sort(), [categories]);
  const filteredCategories = categories.filter((category) => {
    const searchable = [category.title, category.group, category.summary].join(' ');
    return (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) && (!group || category.group === group);
  });

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{filteredCategories.length} categorias</span>
        <h2 className="mt-1 text-2xl font-black text-white">Itens</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_260px]">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Buscar
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ball, berry, addon..." className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-300" />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Grupo
            <select value={group} onChange={(event) => setGroup(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
              <option value="">Todos</option>
              {groups.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredCategories.map((category) => (
          <Link key={category.slug} href={`/items/${category.slug}`} className="grid grid-cols-[56px_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/70">
            {category.iconUrl ? <img src={category.iconUrl} alt="" className="h-14 w-14 object-contain" loading="lazy" /> : <span />}
            <span className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{category.group}</span>
              <span className="mt-1 block text-lg font-black text-white">{category.title}</span>
              <span className="mt-1 line-clamp-3 block text-sm text-slate-300">{category.summary}</span>
              <span className="mt-3 block text-sm font-bold text-amber-100">{category.itemCount} itens</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ItemCategoryView({ category, crafts = [] }: { category: ItemCategoryDetail; crafts?: Craft[] }) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('');
  const [attribute, setAttribute] = useState('');
  const normalizedQuery = normalizeText(query);
  const sections = useMemo(() => [...new Set(category.items.map((item) => item.section).filter(Boolean))].sort(), [category.items]);
  const attributes = useMemo(() => [...new Set(category.items.flatMap((item) => item.attributes.map((attr) => attr.name)).filter(Boolean))].sort(), [category.items]);
  const filteredItems = category.items.filter((item) => {
    const searchable = [item.name, item.description, item.section, item.table, ...item.attributes.flatMap((attr) => [attr.name, attr.value])].join(' ');
    return (
      (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) &&
      (!section || item.section === section) &&
      (!attribute || item.attributes.some((attr) => attr.name === attribute))
    );
  });

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/items" className="text-sm font-black text-cyan-200 hover:text-cyan-100">Voltar para itens</Link>
        <div className="mt-4 grid gap-4 sm:grid-cols-[72px_1fr]">
          {category.iconUrl ? <img src={category.iconUrl} alt="" className="h-20 w-20 object-contain" loading="lazy" /> : null}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{category.group}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{category.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{category.summary}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Buscar item
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300" />
          </label>
          <Filter label="Secao" value={section} onChange={setSection} options={sections} />
          <Filter label="Atributo" value={attribute} onChange={setAttribute} options={attributes} />
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <ItemCard key={`${item.slug}-${item.name}`} item={item} crafts={crafts} />
        ))}
      </div>
    </article>
  );
}

function ItemCard({ item, crafts }: { item: ItemCategoryDetail['items'][number]; crafts: Craft[] }) {
  const createdBy = findCraftsCreatingItem(crafts, item);
  const usedBy = findCraftsUsingItem(crafts, item);
  const professions = findProfessionsForItem(crafts, item);

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start gap-3">
        {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-12 w-12 object-contain" loading="lazy" /> : null}
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{item.section || item.table}</span>
          <h3 className="mt-1 font-black text-white">
            <EntityLink href={itemHref(item.slug, item.name)}>{item.name}</EntityLink>
          </h3>
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{item.description || 'Sem descricao.'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.attributes.slice(0, 6).map((attr) => <span key={`${item.slug}-${attr.name}-${attr.value}`} className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">{attr.name}: {attr.value}</span>)}
      </div>
      {createdBy.length || usedBy.length ? (
        <div className="mt-4 grid gap-3">
          <RelatedCrafts title="Crafts que criam" crafts={createdBy} empty="Nenhum craft cria esse item nos dados atuais." />
          <RelatedCrafts title="Crafts que usam" crafts={usedBy} empty="Nenhum craft usa esse item como ingrediente nos dados atuais." />
          <RelatedProfessions professions={professions} />
        </div>
      ) : null}
    </article>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
        <option value="">Todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
