export function StatusPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <div className="h-2 w-24 animate-pulse rounded-full bg-cyan-300/50" />
      <h2 className="mt-4 text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
