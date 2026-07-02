import { PokedexExplorer } from '@/components/pokedex-explorer';
import { getPokemon } from '@/lib/api';

export const dynamic = 'force-dynamic';

type PokedexPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PokedexPage({ searchParams }: PokedexPageProps) {
  const params = await searchParams;
  const data = await getPokemon();

  return (
    <PokedexExplorer
      pokemon={data.pokemon}
      generations={data.generations}
      initialFilters={{
        query: firstParam(params.q),
        region: firstParam(params.region),
        generation: firstParam(params.generation),
        primaryType: firstParam(params.type),
        secondaryType: firstParam(params.type2),
        minLevel: firstParam(params.minLevel),
        maxLevel: firstParam(params.maxLevel),
        sort: firstParam(params.sort),
      }}
    />
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}
