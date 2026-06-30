export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </section>
  );
}
