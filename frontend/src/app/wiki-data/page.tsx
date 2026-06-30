import { WikiDomainExplorer } from '@/components/wiki-domain-explorer';
import { getWikiDomains } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Wiki Data | PXG Tools',
  description: 'Dominios de dados preparados para expansao dos scrapers.',
};

export default async function WikiDataPage() {
  const data = await getWikiDomains();
  return <WikiDomainExplorer domains={data.domains} />;
}
