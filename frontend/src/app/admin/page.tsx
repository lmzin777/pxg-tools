import { AdminDashboard } from '@/components/admin-dashboard';
import { getAdminHealth, getAdminStats, getSyncRuns } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin | PXG Tools',
  description: 'Painel operacional de sincronizacoes e scrapers.',
};

export default async function AdminPage() {
  const [health, stats, syncRuns] = await Promise.all([getAdminHealth(), getAdminStats(), getSyncRuns()]);
  return <AdminDashboard health={health} stats={stats} syncRuns={syncRuns} />;
}
