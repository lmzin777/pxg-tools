import { ItemsExplorer } from '@/components/items-explorer';
import { getItems } from '@/lib/api';

export const dynamic = 'force-dynamic';

type ItemsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const data = await getItems();

  return <ItemsExplorer categories={data.categories} initialQuery={firstParam(params.item) || firstParam(params.q)} />;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}
