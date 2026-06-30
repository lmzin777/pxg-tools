import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClanDetailView } from '@/components/clan-detail';
import { ApiError, getClanDetail } from '@/lib/api';

export const dynamic = 'force-dynamic';

type ClanPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ClanPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const clan = await getClanDetail(slug);
    return {
      title: `${clan.name} | PXG Tools`,
    };
  } catch {
    return {
      title: 'Cla | PXG Tools',
    };
  }
}

export default async function ClanPage({ params }: ClanPageProps) {
  const { slug } = await params;

  try {
    const clan = await getClanDetail(slug);
    return <ClanDetailView clan={clan} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
