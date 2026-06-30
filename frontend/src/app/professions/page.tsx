import { ProfessionsExplorer } from '@/components/professions-explorer';
import { getProfessions } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ProfessionsPage() {
  const data = await getProfessions();

  return <ProfessionsExplorer professions={data.professions} />;
}
