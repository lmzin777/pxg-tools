'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems } from '@/lib/navigation';
import { SearchBox } from '@/components/search-box';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                PXG Tools
              </span>
              <h1 className="text-2xl font-black text-white">Database de jogo</h1>
            </div>
            <p className="max-w-2xl text-sm text-slate-300">
              Consulte ferramentas, clas, Pokemon, itens, crafts e profissoes em um so lugar.
            </p>
            <SearchBox />
          </div>

          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/' ? pathname === '/' || pathname.startsWith('/clans') : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'group flex min-h-20 items-start gap-3 rounded-lg border p-3 transition',
                    isActive
                      ? 'border-cyan-300/70 bg-cyan-300/12'
                      : 'border-white/10 bg-white/[0.03] hover:border-amber-300/60 hover:bg-white/[0.06]',
                  ].join(' ')}
                >
                  <span className="rounded-md border border-white/10 bg-slate-900 p-2 text-cyan-200 group-hover:text-amber-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-black text-white">
                      {item.label}
                      {!item.ready ? (
                        <span className="rounded-full border border-amber-300/30 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">
                          em breve
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
