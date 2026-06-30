import Link from 'next/link';
import { Activity, AlertTriangle, Database, Timer } from 'lucide-react';
import type { AdminHealth, AdminStats, SyncRun } from '@/types/admin';

type AdminDashboardProps = {
  health: AdminHealth;
  stats: AdminStats;
  syncRuns: SyncRun[];
  mode?: 'overview' | 'sync' | 'scrapers';
};

export function AdminDashboard({ health, stats, syncRuns, mode = 'overview' }: AdminDashboardProps) {
  const visibleRuns = mode === 'overview' ? syncRuns.slice(0, 10) : syncRuns;

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">interno</span>
        <h2 className="mt-1 text-2xl font-black text-white">Admin e Scrapers</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Painel operacional para acompanhar sincronizacoes, contagens carregadas no Neon e erros recentes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminTab href="/admin" active={mode === 'overview'}>Resumo</AdminTab>
          <AdminTab href="/admin/sync" active={mode === 'sync'}>Sincronizacoes</AdminTab>
          <AdminTab href="/admin/scrapers" active={mode === 'scrapers'}>Scrapers</AdminTab>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Activity} title="API" value={health.status} detail={`DB: ${health.database}`} />
        <Metric icon={Database} title="Tabelas" value={`${stats.tables.length}`} detail="escopos monitorados" />
        <Metric icon={AlertTriangle} title="Erros recentes" value={`${stats.recentErrors.length}`} detail="ultimas falhas em sync_runs" />
        <Metric icon={Timer} title="Ultima leitura" value={formatDate(stats.generatedAt)} detail={formatDate(health.checkedAt)} />
      </section>

      {mode !== 'scrapers' ? <StatsTable stats={stats} /> : null}
      {mode !== 'overview' ? <SyncRunTable runs={visibleRuns} /> : <SyncRunTable runs={visibleRuns} compact />}
      {mode === 'scrapers' ? <ScraperRunbook /> : null}
    </article>
  );
}

function AdminTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        'rounded-lg border px-3 py-2 text-sm font-black transition',
        active ? 'border-cyan-300/70 bg-cyan-300/15 text-white' : 'border-white/10 bg-slate-950 text-slate-300 hover:border-cyan-300/50',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

function Metric({ icon: Icon, title, value, detail }: { icon: typeof Activity; title: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.16em]">{title}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function StatsTable({ stats }: { stats: AdminStats }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Registros por escopo</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead className="bg-cyan-300/10 text-left text-cyan-100">
            <tr>
              <th className="border border-white/10 p-3">Escopo</th>
              <th className="border border-white/10 p-3">Tabela</th>
              <th className="border border-white/10 p-3">Registros</th>
            </tr>
          </thead>
          <tbody>
            {stats.tables.map((table) => (
              <tr key={`${table.scope}-${table.tableName}`} className="bg-slate-950/40">
                <td className="border border-white/10 p-3 font-bold text-white">{table.scope}</td>
                <td className="border border-white/10 p-3 text-slate-300">{table.tableName}</td>
                <td className="border border-white/10 p-3 text-slate-300">{table.records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SyncRunTable({ runs, compact = false }: { runs: SyncRun[]; compact?: boolean }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">{compact ? 'Ultimas sincronizacoes' : 'Historico de sincronizacoes'}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-cyan-300/10 text-left text-cyan-100">
            <tr>
              <th className="border border-white/10 p-3">Escopo</th>
              <th className="border border-white/10 p-3">Status</th>
              <th className="border border-white/10 p-3">Inicio</th>
              <th className="border border-white/10 p-3">Fim</th>
              <th className="border border-white/10 p-3">Duracao</th>
              <th className="border border-white/10 p-3">Registros</th>
              <th className="border border-white/10 p-3">Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {runs.length ? (
              runs.map((run) => (
                <tr key={run.id} className="bg-slate-950/40">
                  <td className="border border-white/10 p-3 font-bold text-white">{run.scope}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{run.status}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{formatDate(run.startedAt)}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{formatDate(run.finishedAt)}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{run.durationSeconds ? `${run.durationSeconds}s` : '-'}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{run.recordsLoaded || '-'}</td>
                  <td className="border border-white/10 p-3 text-slate-300">{run.errorMessage || run.message || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-white/10 p-3 text-slate-400" colSpan={7}>Nenhuma sincronizacao registrada ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ScraperRunbook() {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Runbook</h3>
      <div className="mt-3 grid gap-2 text-sm text-slate-300">
        <code className="rounded-md border border-white/10 bg-slate-950 px-3 py-2">cd scrapers</code>
        <code className="rounded-md border border-white/10 bg-slate-950 px-3 py-2">npm run scrape:all</code>
        <code className="rounded-md border border-white/10 bg-slate-950 px-3 py-2">npm run db:apply-schema</code>
        <code className="rounded-md border border-white/10 bg-slate-950 px-3 py-2">npm run db:load:all</code>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
