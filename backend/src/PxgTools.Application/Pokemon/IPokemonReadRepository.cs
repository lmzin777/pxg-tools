using PxgTools.Domain.Pokemon;

namespace PxgTools.Application.Pokemon;

public interface IPokemonReadRepository
{
    Task<PokemonOverview> ListAsync(CancellationToken cancellationToken);

    Task<PokemonDetail?> GetDetailAsync(string slug, CancellationToken cancellationToken);
}
