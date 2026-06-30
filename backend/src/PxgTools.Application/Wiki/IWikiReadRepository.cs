using PxgTools.Domain.Wiki;

namespace PxgTools.Application.Wiki;

public interface IWikiReadRepository
{
    Task<WikiDomainsOverview> ListDomainsAsync(CancellationToken cancellationToken);

    Task<WikiDomainDetail?> GetDomainAsync(string domain, CancellationToken cancellationToken);
}
