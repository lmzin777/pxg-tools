import { AdminDashboard } from '@/components/admin-dashboard';
import { getAdminHealth, getAdminStats, getSyncRuns } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Scrapers | PXG Tools',
};

export default async function AdminScrapersPage() {
  const [health, stats, syncRuns] = await Promise.all([getAdminHealth(), getAdminStats(), getSyncRuns()]);
  return <AdminDashboard health={health} stats={stats} syncRuns={syncRuns} mode="scrapers" />;
}
