import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CraftDetailView } from '@/components/craft-detail';
import { ApiError, getCraft, getCrafts } from '@/lib/api';

export const dynamic = 'force-dynamic';

type CraftDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CraftDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const craft = await getCraft(slug);
    return { title: `${craft.itemName} | PXG Tools`, description: `${craft.profession} ${craft.category}` };
  } catch {
    return { title: 'Craft | PXG Tools' };
  }
}

export default async function CraftDetailPage({ params }: CraftDetailPageProps) {
  const { slug } = await params;

  try {
    const [craft, craftData] = await Promise.all([getCraft(slug), getCrafts()]);
    return <CraftDetailView craft={craft} crafts={craftData.crafts} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
