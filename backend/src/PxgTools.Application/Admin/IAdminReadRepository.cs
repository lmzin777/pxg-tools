using PxgTools.Domain.Admin;

namespace PxgTools.Application.Admin;

public interface IAdminReadRepository
{
    Task<AdminHealth> GetHealthAsync(CancellationToken cancellationToken);

    Task<AdminStats> GetStatsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<SyncRunSummary>> ListSyncRunsAsync(CancellationToken cancellationToken);
}
