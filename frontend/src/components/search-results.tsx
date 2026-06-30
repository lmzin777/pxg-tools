import Link from 'next/link';
import type { SearchResult } from '@/types/search';

export function SearchResultsView({ query, results }: { query: string; results: SearchResult[] }) {
  const groups = [...new Set(results.map((result) => result.type))].map((type) => ({
    type,
    results: results.filter((result) => result.type === type),
  }));

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{results.length} resultados</span>
        <h2 className="mt-1 text-2xl font-black text-white">Busca global</h2>
        <p className="mt-2 text-sm text-slate-300">{query ? `Resultado para "${query}".` : 'Digite algo na busca do topo para comecar.'}</p>
      </section>

      {groups.length ? (
        groups.map((group) => (
          <section key={group.type} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-lg font-black text-white">{group.type}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.results.map((result) => (
                <Link key={`${result.type}-${result.slug}-${result.url}`} href={result.url} className="grid grid-cols-[44px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3 transition hover:border-cyan-300/60">
                  {result.imageUrl ? <img src={result.imageUrl} alt="" className="h-11 w-11 object-contain" loading="lazy" /> : <span className="h-11 w-11 rounded-md bg-slate-900" />}
                  <span className="min-w-0">
                    <span className="font-black text-white">{result.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs text-slate-400">{result.summary || result.type}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-4 text-sm text-amber-100">
          Nenhum resultado encontrado.
        </div>
      )}
    </article>
  );
}
