using PxgTools.Domain.Professions;

namespace PxgTools.Application.Professions;

public interface IProfessionReadRepository
{
    Task<ProfessionsOverview> ListAsync(CancellationToken cancellationToken);

    Task<ProfessionDetail?> GetDetailAsync(string slug, CancellationToken cancellationToken);
}
