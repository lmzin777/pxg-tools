'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EntityLink, itemHref } from '@/components/entity-link';
import { RelatedCrafts, RelatedProfessions } from '@/components/related-sections';
import { normalizeText } from '@/lib/format';
import { findCraftsCreatingItem, findCraftsUsingItem, findProfessionsForItem } from '@/lib/relationships';
import type { Craft } from '@/types/crafts';
import type { ItemAttribute, ItemCategoryDetail, ItemCategorySummary } from '@/types/items';

export function ItemsExplorer({
  categories,
  categoryDetails = [],
  initialQuery = '',
}: {
  categories: ItemCategorySummary[];
  categoryDetails?: ItemCategoryDetail[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [group, setGroup] = useState('');
  const normalizedQuery = normalizeText(query);
  const groups = useMemo(() => [...new Set(categories.map((category) => category.group))].sort(), [categories]);
  const itemResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return categoryDetails
      .flatMap((category) =>
        category.items.map((item) => ({
          item,
          category,
          attributes: getItemAttributes(item),
        })),
      )
      .filter(({ item, category, attributes }) => {
        const searchable = [
          item.name,
          item.description,
          item.section,
          item.table,
          category.title,
          category.group,
          ...attributes.flatMap((attribute) => [attribute.name, attribute.value]),
        ].join(' ');
        return normalizeText(searchable).includes(normalizedQuery);
      })
      .slice(0, 80);
  }, [categoryDetails, normalizedQuery]);
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

      {normalizedQuery && itemResults.length ? (
        <section className="grid gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{itemResults.length} itens encontrados</span>
            <h3 className="mt-1 text-xl font-black text-white">Resultados por item</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {itemResults.map(({ item, category, attributes }) => (
              <Link
                key={`${category.slug}-${item.slug}-${item.name}`}
                href={itemHref(item.slug, item.name)}
                className="grid grid-cols-[48px_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-cyan-300/70"
              >
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-12 w-12 object-contain" loading="lazy" /> : <span />}
                <span className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{category.title}</span>
                  <span className="mt-1 block font-black text-white">{item.name}</span>
                  <span className="mt-1 line-clamp-2 block text-xs text-slate-300">{item.description || attributes.map((attribute) => `${attribute.name}: ${attribute.value}`).join(' | ')}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
  if (category.slug === 'held-itens') {
    return <HeldItemsView category={category} />;
  }

  return <DefaultItemCategoryView category={category} crafts={crafts} />;
}

function DefaultItemCategoryView({ category, crafts = [] }: { category: ItemCategoryDetail; crafts?: Craft[] }) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('');
  const [attribute, setAttribute] = useState('');
  const normalizedQuery = normalizeText(query);
  const sections = useMemo(() => [...new Set(category.items.map((item) => item.section).filter(Boolean))].sort(), [category.items]);
  const attributes = useMemo(() => [...new Set(category.items.flatMap((item) => getItemAttributes(item).map((attr) => attr.name)).filter(Boolean))].sort(), [category.items]);
  const filteredItems = category.items.filter((item) => {
    const itemAttributes = getItemAttributes(item);
    const searchable = [item.name, item.description, item.section, item.table, ...itemAttributes.flatMap((attr) => [attr.name, attr.value])].join(' ');
    return (
      (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) &&
      (!section || item.section === section) &&
      (!attribute || itemAttributes.some((attr) => attr.name === attribute))
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

type CategoryItem = ItemCategoryDetail['items'][number];

function HeldItemsView({ category }: { category: ItemCategoryDetail }) {
  const [utilityType, setUtilityType] = useState<'X' | 'Y'>('X');
  const [combatType, setCombatType] = useState<'Ofensivos' | 'Defensivos'>('Ofensivos');
  const removalPokemon = itemsBySection(category, 'Como remover um Held Item de seu Pokémon');
  const removalDevice = itemsBySection(category, 'Como remover um Held Item de seu Device');
  const offensiveDefensive = itemsBySection(category, 'Ofensivos e Defensivos');
  const offensiveItems = offensiveDefensive.filter((item) => offensiveHeldNames.has(item.name));
  const defensiveItems = offensiveDefensive.filter((item) => defensiveHeldNames.has(item.name));
  const combatItems = combatType === 'Ofensivos' ? offensiveItems : defensiveItems;
  const utilityItems = itemsBySection(category, 'Utilitários').filter((item) => item.name.startsWith(`${utilityType}-`));
  const xBoostRows = buildXBoostRows(itemsBySection(category, 'Informações sobre o X-Boost'));
  const ticketItems = itemsBySection(category, 'Held Item Ticket');

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/items" className="text-sm font-black text-cyan-200 hover:text-cyan-100">Voltar para itens</Link>
        <div className="mt-4 grid gap-4 sm:grid-cols-[72px_1fr]">
          {category.iconUrl ? <img src={category.iconUrl} alt="" className="h-20 w-20 object-contain" loading="lazy" /> : null}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{category.group}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{category.title}</h2>
            <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-300">{category.summary}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Utilitarios</span>
            <h3 className="mt-1 text-xl font-black text-white">Held Items {utilityType}</h3>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-slate-950 p-1">
            {(['X', 'Y'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUtilityType(type)}
                className={[
                  'min-h-9 rounded-md px-4 text-sm font-black transition',
                  utilityType === type ? 'bg-cyan-300/20 text-cyan-100' : 'text-slate-300 hover:text-white',
                ].join(' ')}
              >
                Utilitarios {type}
              </button>
            ))}
          </div>
        </div>
        <HeldTierTable items={utilityItems} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Categorias</span>
            <h3 className="mt-1 text-xl font-black text-white">{combatType}</h3>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-slate-950 p-1">
            {(['Ofensivos', 'Defensivos'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCombatType(type)}
                className={[
                  'min-h-9 rounded-md px-4 text-sm font-black transition',
                  combatType === type ? 'bg-cyan-300/20 text-cyan-100' : 'text-slate-300 hover:text-white',
                ].join(' ')}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <HeldTierTable items={combatItems} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xl font-black text-white">Informacoes sobre o X-Boost</h3>
        <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-300">
          O X-Boost concede bonus de boost que escalam por tier e faixa de nivel do jogador. O bonus de vida acompanha o valor do boost,
          e o bonus de ataque usa o dobro desse valor fora das excecoes de PvP.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-cyan-300/10 text-left text-cyan-100">
              <tr>
                <th className="border border-white/10 p-3">Tier</th>
                <th className="border border-white/10 p-3">0 a 99</th>
                <th className="border border-white/10 p-3">100 a 149</th>
                <th className="border border-white/10 p-3">150 a 399</th>
                <th className="border border-white/10 p-3">400 a 625</th>
              </tr>
            </thead>
            <tbody>
              {xBoostRows.map((row) => (
                <tr key={row.tier} className="odd:bg-slate-950/40 even:bg-white/[0.03]">
                  <td className="border border-white/10 p-3 font-black text-white">{row.tier}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.tier}-${index}`} className="border border-white/10 p-3 text-slate-300">{value || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xl font-black text-white">Preco para Remover Held Item</h3>
        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          <RemovalPriceTable title="Held Item direto no Pokemon" items={removalPokemon} />
          <RemovalPriceTable title="Held Item do Device" items={removalDevice} />
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xl font-black text-white">Held Item Ticket</h3>
        <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-300">
          O ticket pode ser trocado com a NPC Victoria por alguns Held Items X selecionados. Tiers 3 a 7 aparecem como recompensas
          de quests e eventos especificos.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ticketItems.map((item) => (
            <div key={item.slug} className="grid grid-cols-[56px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3">
              {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-14 w-14 object-contain" loading="lazy" /> : <span />}
              <span>
                <span className="font-black text-white">{item.name}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-300">{attributeValue(item, 'Descrição') || item.description}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xl font-black text-white">Detalhes Especificos</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {heldSpecificDetails.map((detail) => (
            <div key={detail.name} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <h4 className="font-black text-cyan-100">{detail.name}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">{detail.description}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function HeldTierTable({ items }: { items: CategoryItem[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead className="bg-cyan-300/10 text-left text-cyan-100">
          <tr>
            <th className="border border-white/10 p-3">Icone</th>
            <th className="border border-white/10 p-3">Nome</th>
            {tierHeaders.map((tier) => <th key={tier} className="border border-white/10 p-3">{tier}</th>)}
            <th className="border border-white/10 p-3">Descricao</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.section}-${item.name}`} className="odd:bg-slate-950/40 even:bg-white/[0.03]">
              <td className="border border-white/10 p-3">
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-8 w-8 object-contain" loading="lazy" /> : null}
              </td>
              <td className="border border-white/10 p-3 font-black text-white">{item.name}</td>
              {tierHeaders.map((tier) => (
                <td key={`${item.name}-${tier}`} className="border border-white/10 p-3 text-slate-300">{attributeValue(item, tier) || '-'}</td>
              ))}
              <td className="border border-white/10 p-3 text-slate-300">{attributeValue(item, 'Descrição') || item.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RemovalPriceTable({ title, items }: { title: string; items: CategoryItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/50">
      <h4 className="border-b border-white/10 bg-white/[0.04] p-3 font-black text-white">{title}</h4>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-cyan-300/10 text-left text-cyan-100">
          <tr>
            <th className="border border-white/10 p-3">Held</th>
            <th className="border border-white/10 p-3">Preco</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${title}-${attributeValue(item, 'Held')}`} className="odd:bg-slate-950/40 even:bg-white/[0.03]">
              <td className="border border-white/10 p-3 font-bold text-white">{attributeValue(item, 'Held')}</td>
              <td className="border border-white/10 p-3 text-slate-300">{attributeValue(item, 'Preço') || item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tierHeaders = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5', 'Tier 6', 'Tier 7', 'Tier 8', 'Tier 9'];
const offensiveHeldNames = new Set(['X-Attack', 'X-Critical', 'X-Boost']);
const defensiveHeldNames = new Set(['X-Defense', 'X-Block', 'X-Vitality', 'X-Harden']);

const heldSpecificDetails = [
  {
    name: 'X-Haste',
    description: 'Nao aumenta a velocidade de Fly ou Ride.',
  },
  {
    name: 'X-Lucky',
    description: 'Aumenta a chance final de drop com base na chance original do item.',
  },
  {
    name: 'X-Return',
    description: 'O retorno contra Pokemon selvagem usa multiplicador maior do que contra Pokemon de jogadores.',
  },
  {
    name: 'X-Boost',
    description: 'Mesmo com boost alto, o bonus de desvio de status negativo respeita o limite equivalente a um Pokemon +50.',
  },
  {
    name: 'X-Harden, X-Agility, X-Strafe e X-Rage',
    description: 'Funcionam apenas enquanto o Pokemon estiver atacando o adversario.',
  },
  {
    name: 'X-Elemental',
    description: 'Em Pokemon com dois elementos, a passiva escolhe um elemento aleatorio. Jogadores abaixo do level 100 recebem reducao de dano.',
  },
  {
    name: 'X-Cooldown',
    description: 'Nao reduz ataques que ja tenham recarga igual ou menor que 10 segundos.',
  },
  {
    name: 'X-Upgrade',
    description: 'Funciona apenas com Held X e evolui o Held equipado no Pokemon ou no Attachment Device.',
  },
  {
    name: 'Y-Cure',
    description: 'Nao funciona em duelo.',
  },
  {
    name: 'Y-Regeneration',
    description: 'A regeneracao e limitada para jogadores de level baixo e tambem nao funciona em duelo.',
  },
  {
    name: 'Y-Upgrade',
    description: 'Funciona apenas com Held Y e evolui o Held equipado no Pokemon ou no Attachment Device.',
  },
];

function itemsBySection(category: ItemCategoryDetail, section: string) {
  return category.items.filter((item) => item.section === section && !item.section.toLowerCase().includes('fusao'));
}

function attributeValue(item: CategoryItem, name: string) {
  return getItemAttributes(item).find((attribute) => attribute.name === name)?.value || '';
}

function buildXBoostRows(items: CategoryItem[]) {
  const ranges = ['0 a 99', '100 a 149', '150 a 399', '400 a 625'];
  const rows: Array<{ tier: string; values: string[] }> = [];

  for (let start = 0; start < items.length; start += ranges.length) {
    const group = items.slice(start, start + ranges.length);
    if (!group.length) {
      continue;
    }

    rows.push({
      tier: `Tier ${rows.length + 1}`,
      values: ranges.map((range) => {
        const match = group.find((item) => attributeValue(item, 'Faixa de Nível') === range);
        return match ? attributeValue(match, 'Boost') || match.name : '';
      }),
    });
  }

  return rows;
}

function ItemCard({ item, crafts }: { item: ItemCategoryDetail['items'][number]; crafts: Craft[] }) {
  const createdBy = findCraftsCreatingItem(crafts, item);
  const usedBy = findCraftsUsingItem(crafts, item);
  const professions = findProfessionsForItem(crafts, item);
  const attributes = getItemAttributes(item);

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
        {attributes.slice(0, 6).map((attr) => <span key={`${item.slug}-${attr.name}-${attr.value}`} className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">{attr.name}: {attr.value}</span>)}
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

function getItemAttributes(item: ItemCategoryDetail['items'][number]): ItemAttribute[] {
  const rawAttributes = item.attributes as unknown;

  if (Array.isArray(rawAttributes)) {
    return rawAttributes
      .map((attribute) => ({
        name: String(attribute?.name || ''),
        value: String(attribute?.value || ''),
      }))
      .filter((attribute) => attribute.name || attribute.value);
  }

  if (rawAttributes && typeof rawAttributes === 'object') {
    return Object.entries(rawAttributes).map(([name, value]) => ({
      name,
      value: Array.isArray(value) ? value.join(', ') : String(value ?? ''),
    }));
  }

  return [];
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
