import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ItemCategoryView } from '@/components/items-explorer';
import { ApiError, getCrafts, getItemCategory } from '@/lib/api';

export const dynamic = 'force-dynamic';

type ItemCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ItemCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getItemCategory(slug);
    return { title: `${category.title} | PXG Tools` };
  } catch {
    return { title: 'Itens | PXG Tools' };
  }
}

export default async function ItemCategoryPage({ params }: ItemCategoryPageProps) {
  const { slug } = await params;

  try {
    const [category, craftData] = await Promise.all([getItemCategory(slug), getCrafts()]);
    return <ItemCategoryView category={category} crafts={craftData.crafts} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
