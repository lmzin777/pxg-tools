using PxgTools.Domain.Items;

namespace PxgTools.Application.Items;

public interface IItemReadRepository
{
    Task<ItemsOverview> ListAsync(CancellationToken cancellationToken);

    Task<ItemCategoryDetail?> GetCategoryAsync(string slug, CancellationToken cancellationToken);
}
