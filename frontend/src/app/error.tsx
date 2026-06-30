'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="rounded-lg border border-rose-300/30 bg-rose-300/10 p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-md border border-rose-300/30 bg-rose-300/10 p-2 text-rose-100">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-black text-white">Nao foi possivel carregar os dados</h2>
          <p className="mt-2 text-sm text-rose-100">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-black text-white hover:border-rose-200/60"
          >
            <RotateCcw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    </section>
  );
}
