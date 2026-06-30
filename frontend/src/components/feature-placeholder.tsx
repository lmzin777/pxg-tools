import { EmptyState } from '@/components/empty-state';

export function FeaturePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          modulo preparado
        </span>
        <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
      </div>
      <EmptyState title="Estrutura pronta" description={description} />
    </div>
  );
}
