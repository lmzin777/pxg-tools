using PxgTools.Domain.Items;

namespace PxgTools.Application.Items;

public interface IItemReadRepository
{
    Task<ItemsOverview> ListAsync(CancellationToken cancellationToken);

    Task<ItemCategoryDetail?> GetCategoryAsync(string slug, CancellationToken cancellationToken);

    Task<ItemDetail?> GetItemAsync(string slug, CancellationToken cancellationToken);
}
