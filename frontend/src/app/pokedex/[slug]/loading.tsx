import { StatusPanel } from '@/components/status-panel';

export default function LoadingPokemonDetail() {
  return (
    <StatusPanel
      title="Carregando Pokemon"
      description="Buscando detalhe do Pokemon na API .NET."
    />
  );
}
