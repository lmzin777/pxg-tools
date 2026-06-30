import { StatusPanel } from '@/components/status-panel';

export default function Loading() {
  return (
    <StatusPanel
      title="Carregando clas"
      description="Buscando a lista de clas na API .NET."
    />
  );
}
