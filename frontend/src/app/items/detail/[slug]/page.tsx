import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ItemDetailView } from '@/components/item-detail';
import { ApiError, getCrafts, getItemDetail, getPokemon } from '@/lib/api';

export const dynamic = 'force-dynamic';

type ItemDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await getItemDetail(slug);
    return { title: `${item.name} | PXG Tools`, description: item.description };
  } catch {
    return { title: 'Item | PXG Tools' };
  }
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { slug } = await params;

  try {
    const [item, craftData, pokemonData] = await Promise.all([getItemDetail(slug), getCrafts(), getPokemon()]);
    return <ItemDetailView item={item} crafts={craftData.crafts} pokemon={pokemonData.pokemon} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
