import { CraftExplorer } from '@/components/craft-explorer';
import { getCrafts } from '@/lib/api';

export const dynamic = 'force-dynamic';

type CraftsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CraftsPage({ searchParams }: CraftsPageProps) {
  const params = await searchParams;
  const query = firstParam(params.item) || firstParam(params.ingredient) || '';
  const data = await getCrafts({
    item: firstParam(params.item),
    ingredient: firstParam(params.ingredient),
    profession: firstParam(params.profession),
  });

  return (
    <CraftExplorer
      crafts={data.crafts}
      showProfessionFilter
      showSubprofessionFilter
      showRankFilter
      initialQuery={query}
      initialProfession={firstParam(params.profession)}
      initialSubprofession={firstParam(params.subprofession)}
      initialRank={firstParam(params.rank)}
      title="Crafts"
      description="Busca central de crafts por item criado, ingrediente, profissao, especializacao, rank, habilidade e tempo."
    />
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}
