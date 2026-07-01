import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { EntityLink, entityQueryHref } from '@/components/entity-link';
import { FavoriteButton } from '@/components/favorite-button';
import { RelatedCrafts } from '@/components/related-sections';
import { findCraftsForPokemonMaterials } from '@/lib/relationships';
import { canonicalPokemonType, getTypeIconSrc } from '@/lib/tools-data';
import type { Craft } from '@/types/crafts';
import type { PokemonDetail, PokemonEffectivenessGroup, PokemonEvolution, PokemonMove, PokemonVersion } from '@/types/pokemon';

export function PokemonDetailView({ pokemon, crafts = [] }: { pokemon: PokemonDetail; crafts?: Craft[] }) {
  const safePokemon = normalizePokemonDetail(pokemon);
  const materialCrafts = findCraftsForPokemonMaterials(safePokemon, crafts);

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <Link href="/pokedex" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pokedex
        </Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[160px_1fr_auto] lg:items-start">
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-white/10 bg-slate-950/60">
            {safePokemon.detailSpriteUrl || safePokemon.spriteUrl ? (
              <img src={safePokemon.detailSpriteUrl || safePokemon.spriteUrl} alt={safePokemon.name} className="h-36 w-36 object-contain" loading="lazy" />
            ) : null}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{safePokemon.dex} / {safePokemon.generation}</span>
            <h2 className="mt-1 text-3xl font-black text-white">{safePokemon.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {safePokemon.elements.map((element) => <Pill key={element}>{element}</Pill>)}
            </div>
            <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{safePokemon.description || 'Descricao nao listada na Wiki.'}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <a href={safePokemon.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-black text-slate-100 hover:border-amber-300/50">
              Wiki <ExternalLink className="h-4 w-4" />
            </a>
            <FavoriteButton
              entity={{
                type: 'Pokemon',
                slug: safePokemon.slug,
                title: safePokemon.name,
                url: `/pokedex/${safePokemon.slug}`,
                imageUrl: safePokemon.detailSpriteUrl || safePokemon.spriteUrl,
                summary: safePokemon.description,
              }}
            />
          </div>
        </div>
      </section>

      <PokemonInfoPanel pokemon={safePokemon} />
      <RelatedCrafts
        title="Crafts ligados aos materiais"
        crafts={materialCrafts}
        empty="Nenhum craft ligado aos materiais deste Pokemon foi encontrado nos dados atuais."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <PokemonEvolutionChain evolutions={safePokemon.evolutions} />
        <PokemonVersionsGrid versions={safePokemon.otherVersions} fallbackImageUrl={safePokemon.detailSpriteUrl || safePokemon.spriteUrl} />
      </div>
      <PokemonMovesSection pokemon={safePokemon} />
      <PokemonEffectivenessTable groups={safePokemon.effectiveness} />
    </article>
  );
}

function normalizePokemonDetail(pokemon: PokemonDetail): PokemonDetail {
  return {
    ...pokemon,
    elements: Array.isArray(pokemon.elements) ? pokemon.elements : [],
    evolutions: Array.isArray(pokemon.evolutions) ? pokemon.evolutions : [],
    effectiveness: Array.isArray(pokemon.effectiveness) ? pokemon.effectiveness : [],
    moves: Array.isArray(pokemon.moves) ? pokemon.moves : [],
    pvpMoves: Array.isArray(pokemon.pvpMoves) ? pokemon.pvpMoves : [],
    pveMoves: Array.isArray(pokemon.pveMoves) ? pokemon.pveMoves : [],
    otherVersions: withInferredVersions(pokemon, Array.isArray(pokemon.otherVersions) ? pokemon.otherVersions : []),
  };
}

function PokemonInfoPanel({ pokemon }: { pokemon: PokemonDetail }) {
  const infoCards = [
    <Info key="level" title="Level" value={pokemon.level} />,
    <Info key="abilities" title="Habilidades" value={pokemon.abilities} wide />,
    <Info key="boost" title="Boost" value={pokemon.boost} />,
    <Info key="material" title="Materia" value={pokemon.material} linkValue />,
    pokemon.evolutionStone ? <Info key="evolution-stone" title="Pedra de evolucao" value={pokemon.evolutionStone} linkValue /> : null,
  ].filter(Boolean);

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {infoCards}
    </section>
  );
}

function PokemonEvolutionChain({ evolutions = [] }: { evolutions?: PokemonEvolution[] }) {
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

function PokemonMovesTable({ title, moves = [] }: { title: string; moves?: PokemonMove[] }) {
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
                  <td className="border border-white/10 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{move.name}</span>
                      <MoveIconRow move={move} />
                    </div>
                  </td>
                  <td className="border border-white/10 p-3 text-slate-300">
                    <MoveTypeCell move={move} />
                  </td>
                  <td className="border border-white/10 p-3 text-slate-300">{move.cooldown || '-'}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{move.level || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-white/10 p-3 text-slate-400" colSpan={5}>Nenhum movimento listado para esta categoria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MoveIconRow({ move }: { move: PokemonMove }) {
  const icons = (Array.isArray(move.icons) ? move.icons : []).filter((icon) => !isMoveTypeIcon(move, icon.label));

  if (!icons.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {icons.map((icon, index) => (
        <span
          key={`${move.name}-${icon.label}-${index}`}
          title={icon.label}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-slate-950"
        >
          <img src={icon.iconUrl} alt={icon.label} className="h-6 w-6 object-contain" loading="lazy" />
        </span>
      ))}
    </div>
  );
}

function MoveTypeCell({ move }: { move: PokemonMove }) {
  const type = canonicalPokemonType(move.type) || move.type;
  const typeIcon = (Array.isArray(move.icons) ? move.icons : []).find((icon) => isMoveTypeIcon(move, icon.label))?.iconUrl
    || getTypeIconSrc(type);

  if (!type) {
    return <span className="text-slate-500">-</span>;
  }

  return (
    <span className="inline-flex items-center gap-2">
      {typeIcon ? <img src={typeIcon} alt="" className="h-5 w-5 object-contain" loading="lazy" /> : null}
      {type}
    </span>
  );
}

function isMoveTypeIcon(move: PokemonMove, label: string) {
  const moveType = canonicalPokemonType(move.type) || move.type;
  const iconType = canonicalPokemonType(label) || label;
  return Boolean(moveType && iconType && moveType.toLowerCase() === iconType.toLowerCase());
}

function PokemonMovesSection({ pokemon }: { pokemon: PokemonDetail }) {
  const genericMoves = pokemon.moves?.length ? pokemon.moves : [];
  const hasPvp = pokemon.pvpMoves.length > 0;
  const hasPve = pokemon.pveMoves.length > 0;

  if (genericMoves.length) {
    return <PokemonMovesTable title="Movimentos" moves={genericMoves} />;
  }

  if (hasPve && !hasPvp) {
    return <PokemonMovesTable title="Movimentos" moves={pokemon.pveMoves} />;
  }

  if (hasPvp && !hasPve) {
    return <PokemonMovesTable title="Movimentos" moves={pokemon.pvpMoves} />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <PokemonMovesTable title="Movimentos PvP" moves={pokemon.pvpMoves} />
      <PokemonMovesTable title="Movimentos PvE" moves={pokemon.pveMoves} />
    </div>
  );
}

function PokemonEffectivenessTable({ groups = [] }: { groups?: PokemonEffectivenessGroup[] }) {
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

function PokemonVersionsGrid({ versions = [], fallbackImageUrl = '' }: { versions?: PokemonVersion[]; fallbackImageUrl?: string }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Outras versoes</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {versions.length ? (
          versions.map((version) => (
            <PokemonVersionLink key={version.sourceUrl || version.slug || version.name} version={version} fallbackImageUrl={fallbackImageUrl} />
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhuma outra versao listada.</p>
        )}
      </div>
    </section>
  );
}

function PokemonVersionLink({ version, fallbackImageUrl }: { version: PokemonVersion; fallbackImageUrl: string }) {
  const imageUrl = version.iconUrl || fallbackImageUrl;
  const content = (
    <span className="grid grid-cols-[36px_1fr] items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-2 text-sm font-black text-cyan-100 transition hover:border-amber-300/50 hover:text-amber-100">
      {imageUrl ? <img src={imageUrl} alt="" className="h-9 w-9 object-contain" loading="lazy" /> : <span className="h-9 w-9 rounded-md bg-slate-900" />}
      {version.name}
    </span>
  );

  if (version.sourceUrl) {
    return (
      <a href={version.sourceUrl} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <EntityLink href={`/pokedex/${version.slug || slugify(version.name)}`}>{content}</EntityLink>;
}

function Info({ title, value, linkValue = false, wide = false }: { title: string; value: string; linkValue?: boolean; wide?: boolean }) {
  const content = value || 'Nao listado';
  return (
    <div className={['rounded-lg border border-white/10 bg-white/[0.03] p-4', wide ? 'xl:col-span-2' : ''].join(' ')}>
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</span>
      <p className="mt-2 text-sm font-bold text-white">
        {linkValue && value ? <LinkedValueParts value={value} /> : content}
      </p>
    </div>
  );
}

function LinkedValueParts({ value }: { value: string }) {
  return (
    <>
      {splitLinkedValue(value).map((part, index) =>
        part.type === 'separator' ? (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ) : (
          <EntityLink key={`${part.value}-${index}`} href={entityQueryHref('/items', 'item', cleanItemQuery(part.value))}>
            {part.value}
          </EntityLink>
        ),
      )}
    </>
  );
}

function splitLinkedValue(value: string) {
  return value
    .split(/(\s+ou\s+|\s*\/\s*|\s*,\s*)/i)
    .filter(Boolean)
    .map((part) => (/^\s*(ou|\/|,)\s*$/i.test(part) ? { type: 'separator' as const, value: part } : { type: 'value' as const, value: part.trim() }));
}

function cleanItemQuery(value: string) {
  const cleaned = value
    .replace(/\([^)]*\)/g, '')
    .replace(/[.,;:]+$/g, '')
    .trim();

  if (/\b(enhanced|superior|mastered)\b/i.test(cleaned) && !/\bmateria\b/i.test(cleaned)) {
    return `${cleaned} Materia`;
  }

  return cleaned;
}

function withInferredVersions(pokemon: PokemonDetail, versions: PokemonVersion[]) {
  if (versions.length || !pokemon.sourceUrl || /^(baby|shiny|mega|alolan|galarian|hisuian)\s+/i.test(pokemon.name)) {
    return versions;
  }

  const baseSource = pokemon.sourceUrl.replace(/\/index\.php\/.+$/, '/index.php/');
  return ['Baby', 'Shiny'].map((prefix) => ({
    name: `${prefix} ${pokemon.name}`,
    slug: '',
    iconUrl: '',
    sourceUrl: `${baseSource}${encodeURIComponent(`${prefix} ${pokemon.name}`).replace(/%20/g, '_')}`,
  }));
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
