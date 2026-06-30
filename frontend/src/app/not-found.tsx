import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-5">
      <h2 className="text-lg font-black text-white">Pagina nao encontrada</h2>
      <p className="mt-2 text-sm text-amber-100">
        O recurso solicitado nao existe ou ainda nao foi migrado para o frontend Next.js.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-black text-white hover:border-amber-200/60"
      >
        Voltar para clas
      </Link>
    </section>
  );
}
