'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { EntityLink, itemHref } from '@/components/entity-link';
import { FavoriteButton } from '@/components/favorite-button';
import { normalizeText, parseCraftTimeMinutes, parseSkillValue, rankOrder } from '@/lib/format';
import type { Craft } from '@/types/crafts';

type SortMode = 'default' | 'name-asc' | 'name-desc' | 'time-desc' | 'time-asc' | 'skill-desc' | 'skill-asc';

type CraftExplorerProps = {
  crafts: Craft[];
  compact?: boolean;
  showProfessionFilter?: boolean;
  showSubprofessionFilter?: boolean;
  showRankFilter?: boolean;
  title?: string;
  description?: string;
  initialQuery?: string;
  initialProfession?: string;
  initialSubprofession?: string;
  initialCategory?: string;
  initialRank?: string;
};

export function CraftExplorer({
  crafts,
  compact = false,
  showProfessionFilter = false,
  showSubprofessionFilter = false,
  showRankFilter = true,
  title = 'Crafts',
  description = 'Busque por item criado ou ingrediente e combine filtros para refinar a lista.',
  initialQuery = '',
  initialProfession = '',
  initialSubprofession = '',
  initialCategory = '',
  initialRank = '',
}: CraftExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [profession, setProfession] = useState(initialProfession);
  const [subprofession, setSubprofession] = useState(initialSubprofession);
  const [category, setCategory] = useState(initialCategory);
  const [rank, setRank] = useState(initialRank);
  const [sort, setSort] = useState<SortMode>('default');
  const normalizedQuery = normalizeText(query);

  const professionOptions = useMemo(
    () => uniqueSorted(crafts.map((craft) => craft.profession).filter(Boolean)),
    [crafts],
  );
  const subprofessionOptions = useMemo(
    () => uniqueSorted(crafts.map((craft) => craft.subprofession).filter(Boolean)),
    [crafts],
  );
  const categoryOptions = useMemo(
    () => uniqueSorted(crafts.map((craft) => craft.category).filter(Boolean)),
    [crafts],
  );
  const rankOptions = useMemo(() => {
    const values = new Set(crafts.map((craft) => craft.rank || craft.category).filter(Boolean));
    return [
      ...rankOrder.filter((value) => values.has(value)),
      ...[...values].filter((value) => !rankOrder.includes(value)).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ];
  }, [crafts]);

  const filteredCrafts = useMemo(() => {
    const rows = crafts.filter((craft) => {
      const searchable = [
        craft.itemName,
        craft.itemSlug,
        craft.profession,
        craft.subprofession,
        craft.category,
        craft.rank,
        craft.skill,
        craft.craftTime,
        ...craft.ingredients.flatMap((ingredient) => [ingredient.name, ingredient.itemSlug]),
      ].join(' ');

      return (
        (!normalizedQuery || normalizeText(searchable).includes(normalizedQuery)) &&
        (!profession || craft.profession === profession) &&
        (!subprofession || craft.subprofession === subprofession) &&
        (!category || craft.category === category) &&
        (!rank || craft.rank === rank || craft.category === rank)
      );
    });

    return sortCrafts(rows, sort);
  }, [category, crafts, normalizedQuery, profession, rank, sort, subprofession]);

  const visibleCrafts = compact ? filteredCrafts.slice(0, 24) : filteredCrafts;

  return (
    <section className="grid gap-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              {filteredCrafts.length} de {crafts.length}
            </span>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-2 text-sm font-bold text-slate-300 xl:col-span-2">
            Nome ou ingrediente
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Poke Ball, Food Bag, Hidden Relic..."
                className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              />
            </span>
          </label>
          {showProfessionFilter ? (
            <FilterSelect label="Profissao" value={profession} onChange={setProfession} options={professionOptions} />
          ) : null}
          {showSubprofessionFilter ? (
            <FilterSelect label="Subprofissao" value={subprofession} onChange={setSubprofession} options={subprofessionOptions} />
          ) : null}
          <FilterSelect label="Categoria" value={category} onChange={setCategory} options={categoryOptions} />
          {showRankFilter ? (
            <FilterSelect label="Rank" value={rank} onChange={setRank} options={rankOptions} allLabel="Todos os ranks" />
          ) : null}
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            Ordenar
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
            >
              <option value="default">Ordem original</option>
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
              <option value="time-desc">Maior tempo</option>
              <option value="time-asc">Menor tempo</option>
              <option value="skill-desc">Maior habilidade</option>
              <option value="skill-asc">Menor habilidade</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {visibleCrafts.map((craft) => (
          <CraftCard key={`${craft.slug}-${craft.professionSlug}-${craft.subprofessionSlug}`} craft={craft} />
        ))}
      </div>

      {!visibleCrafts.length ? (
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-4 text-sm text-amber-100">
          Nenhum craft encontrado para os filtros atuais.
        </div>
      ) : null}

      {compact && filteredCrafts.length > visibleCrafts.length ? (
        <p className="text-sm text-slate-400">Mostrando {visibleCrafts.length} de {filteredCrafts.length} crafts filtrados.</p>
      ) : null}
    </section>
  );
}

export function CraftCard({ craft }: { craft: Craft }) {
  return (
    <article className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] gap-3">
        {craft.imageUrl ? (
          <img src={craft.imageUrl} alt={craft.itemName} className="h-14 w-14 object-contain" loading="lazy" />
        ) : (
          <div className="h-14 w-14 rounded-md bg-slate-900" />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Pill>{craft.profession}</Pill>
            {craft.subprofession ? <Pill>{craft.subprofession}</Pill> : null}
            <Pill>{craft.rank || craft.category || 'Craft'}</Pill>
          </div>
          <h3 className="mt-2 text-lg font-black text-white">
            <EntityLink href={`/crafts/${craft.slug}`}>{craft.itemName}</EntityLink>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {[craft.skill ? `Habilidade: ${craft.skill}` : '', craft.craftTime ? `Tempo: ${craft.craftTime}` : '']
              .filter(Boolean)
              .join(' - ')}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Item:{' '}
            <EntityLink href={itemHref(craft.itemSlug, craft.itemName)}>{craft.itemName}</EntityLink>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Profissao:{' '}
            <EntityLink href={`/professions/${craft.professionSlug}`}>{craft.profession}</EntityLink>
            {craft.subprofession ? (
              <>
                {' / '}
                <EntityLink href={`/professions/${craft.professionSlug}`}>{craft.subprofession}</EntityLink>
              </>
            ) : null}
          </p>
        </div>
        <FavoriteButton
          compact
          entity={{
            type: 'Craft',
            slug: craft.slug,
            title: craft.itemName,
            url: `/crafts/${craft.slug}`,
            imageUrl: craft.imageUrl,
            summary: [craft.profession, craft.subprofession, craft.rank || craft.category].filter(Boolean).join(' | '),
          }}
        />
      </div>

      <div className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Ingredientes</span>
        <div className="flex flex-wrap gap-2">
          {craft.ingredients.length ? (
            craft.ingredients.map((ingredient, index) => (
              <span
                key={`${craft.slug}-${ingredient.name}-${ingredient.quantity}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-2.5 py-1 text-xs font-bold text-slate-200"
              >
                {ingredient.iconUrl ? (
                  <img src={ingredient.iconUrl} alt="" className="h-5 w-5 object-contain" loading="lazy" />
                ) : null}
                {ingredient.quantity}{' '}
                <EntityLink href={itemHref(ingredient.itemSlug, ingredient.name)}>
                  {ingredient.name}
                </EntityLink>
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">Ingredientes nao listados.</span>
          )}
        </div>
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = 'Todos',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
      {children}
    </span>
  );
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function sortCrafts(crafts: Craft[], sort: SortMode) {
  const rows = [...crafts];
  rows.sort((a, b) => {
    if (sort === 'name-asc') return a.itemName.localeCompare(b.itemName, 'pt-BR');
    if (sort === 'name-desc') return b.itemName.localeCompare(a.itemName, 'pt-BR');
    if (sort === 'time-desc') return parseCraftTimeMinutes(b.craftTime) - parseCraftTimeMinutes(a.craftTime);
    if (sort === 'time-asc') return parseCraftTimeMinutes(a.craftTime) - parseCraftTimeMinutes(b.craftTime);
    if (sort === 'skill-desc') return parseSkillValue(b.skill) - parseSkillValue(a.skill);
    if (sort === 'skill-asc') return parseSkillValue(a.skill) - parseSkillValue(b.skill);
    return 0;
  });
  return rows;
}
