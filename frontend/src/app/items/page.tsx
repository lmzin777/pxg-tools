import { ItemsExplorer } from '@/components/items-explorer';
import { getItemCategory, getItems } from '@/lib/api';
import type { ItemCategoryDetail } from '@/types/items';

export const dynamic = 'force-dynamic';

type ItemsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const data = await getItems();
  const categoryDetails = (
    await Promise.all(
      data.categories.map(async (category) => {
        try {
          return await getItemCategory(category.slug);
        } catch {
          return null;
        }
      }),
    )
  ).filter((category): category is ItemCategoryDetail => Boolean(category));

  return <ItemsExplorer categories={data.categories} categoryDetails={categoryDetails} initialQuery={firstParam(params.item) || firstParam(params.q)} />;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}
