import { AdminDashboard } from '@/components/admin-dashboard';
import { getAdminHealth, getAdminStats, getSyncRuns } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sincronizacoes | PXG Tools',
};

export default async function AdminSyncPage() {
  const [health, stats, syncRuns] = await Promise.all([getAdminHealth(), getAdminStats(), getSyncRuns()]);
  return <AdminDashboard health={health} stats={stats} syncRuns={syncRuns} mode="sync" />;
}
