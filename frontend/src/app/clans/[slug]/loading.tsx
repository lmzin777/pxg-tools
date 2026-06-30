import { StatusPanel } from '@/components/status-panel';

export default function LoadingClanDetail() {
  return (
    <StatusPanel
      title="Carregando detalhe do cla"
      description="Buscando bonus, tiers, NPCs e rotacao na API .NET."
    />
  );
}
