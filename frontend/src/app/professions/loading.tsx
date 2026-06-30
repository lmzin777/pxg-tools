import { StatusPanel } from '@/components/status-panel';

export default function LoadingProfessions() {
  return (
    <StatusPanel
      title="Carregando profissoes"
      description="Buscando lista de profissoes na API .NET."
    />
  );
}
