import { ClanExplorer } from '@/components/clan-explorer';
import { getClans } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const clans = await getClans();

  return <ClanExplorer clans={clans} />;
}
