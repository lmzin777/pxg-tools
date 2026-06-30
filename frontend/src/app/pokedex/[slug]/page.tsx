import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PokemonDetailView } from '@/components/pokemon-detail';
import { ApiError, getCrafts, getPokemonDetail } from '@/lib/api';

export const dynamic = 'force-dynamic';

type PokemonPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PokemonPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const pokemon = await getPokemonDetail(slug);
    return { title: `${pokemon.name} | PXG Tools` };
  } catch {
    return { title: 'Pokemon | PXG Tools' };
  }
}

export default async function PokemonPage({ params }: PokemonPageProps) {
  const { slug } = await params;

  try {
    const [pokemon, craftData] = await Promise.all([getPokemonDetail(slug), getCrafts()]);
    return <PokemonDetailView pokemon={pokemon} crafts={craftData.crafts} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
