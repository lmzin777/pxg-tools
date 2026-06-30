import { StatusPanel } from '@/components/status-panel';

export default function LoadingCrafts() {
  return (
    <StatusPanel
      title="Carregando crafts"
      description="Buscando crafts, ingredientes, profissoes e tempos na API .NET."
    />
  );
}
