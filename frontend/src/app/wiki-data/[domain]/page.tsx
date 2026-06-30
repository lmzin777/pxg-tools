import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WikiDomainDetailView } from '@/components/wiki-domain-explorer';
import { ApiError, getWikiDomain } from '@/lib/api';

export const dynamic = 'force-dynamic';

type WikiDomainPageProps = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: WikiDomainPageProps): Promise<Metadata> {
  const { domain } = await params;
  try {
    const data = await getWikiDomain(domain);
    return { title: `${data.title} | PXG Tools` };
  } catch {
    return { title: 'Wiki Data | PXG Tools' };
  }
}

export default async function WikiDomainPage({ params }: WikiDomainPageProps) {
  const { domain } = await params;

  try {
    const data = await getWikiDomain(domain);
    return <WikiDomainDetailView domain={data} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
