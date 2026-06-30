using PxgTools.Domain.Search;

namespace PxgTools.Application.Search;

public interface ISearchReadRepository
{
    Task<SearchOverview> SearchAsync(string query, CancellationToken cancellationToken);
}
