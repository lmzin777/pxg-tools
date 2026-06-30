import { StatusPanel } from '@/components/status-panel';

export default function LoadingItems() {
  return (
    <StatusPanel
      title="Carregando itens"
      description="Buscando categorias de itens na API .NET."
    />
  );
}
