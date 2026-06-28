using PxgTools.Domain.Clans;

namespace PxgTools.Application.Clans;

public interface IClanReadRepository
{
    Task<IReadOnlyList<Clan>> ListAsync(CancellationToken cancellationToken);

    Task<ClanDetail?> GetDetailAsync(string slug, CancellationToken cancellationToken);
}
