import { PokedexExplorer } from '@/components/pokedex-explorer';
import { getPokemon } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function PokedexPage() {
  const data = await getPokemon();

  return <PokedexExplorer pokemon={data.pokemon} generations={data.generations} />;
}
