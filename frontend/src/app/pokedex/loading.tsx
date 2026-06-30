import { StatusPanel } from '@/components/status-panel';

export default function LoadingPokedex() {
  return (
    <StatusPanel
      title="Carregando Pokedex"
      description="Buscando Pokemon, tipos e geracoes na API .NET."
    />
  );
}
