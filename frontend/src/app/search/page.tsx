import { SearchResultsView } from '@/components/search-results';
import { searchAll } from '@/lib/api';

export const dynamic = 'force-dynamic';

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: 'Busca | PXG Tools',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const data = query ? await searchAll(query) : { results: [] };
  return <SearchResultsView query={query} results={data.results} />;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}
