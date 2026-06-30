using PxgTools.Application.Admin;
using PxgTools.Application.Clans;
using PxgTools.Application.Crafts;
using PxgTools.Application.Items;
using PxgTools.Application.Pokemon;
using PxgTools.Application.Professions;
using PxgTools.Application.Search;
using PxgTools.Application.Wiki;
using PxgTools.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? []);
    });
});

var app = builder.Build();

app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/admin/health", async (IAdminReadRepository repository, CancellationToken cancellationToken) =>
{
    var health = await repository.GetHealthAsync(cancellationToken);
    return Results.Ok(health);
});

app.MapGet("/api/admin/stats", async (IAdminReadRepository repository, CancellationToken cancellationToken) =>
{
    var stats = await repository.GetStatsAsync(cancellationToken);
    return Results.Ok(stats);
});

app.MapGet("/api/admin/sync-runs", async (IAdminReadRepository repository, CancellationToken cancellationToken) =>
{
    var runs = await repository.ListSyncRunsAsync(cancellationToken);
    return Results.Ok(runs);
});

app.MapGet("/api/clans", async (IClanReadRepository repository, CancellationToken cancellationToken) =>
{
    var clans = await repository.ListAsync(cancellationToken);
    return Results.Ok(clans);
});

app.MapGet("/api/clans/{slug}", async (string slug, IClanReadRepository repository, CancellationToken cancellationToken) =>
{
    var clan = await repository.GetDetailAsync(slug, cancellationToken);
    return clan is null ? Results.NotFound() : Results.Ok(clan);
});

app.MapGet("/api/professions", async (IProfessionReadRepository repository, CancellationToken cancellationToken) =>
{
    var professions = await repository.ListAsync(cancellationToken);
    return Results.Ok(professions);
});

app.MapGet("/api/professions/{slug}", async (string slug, IProfessionReadRepository repository, CancellationToken cancellationToken) =>
{
    var profession = await repository.GetDetailAsync(slug, cancellationToken);
    return profession is null ? Results.NotFound() : Results.Ok(profession);
});

app.MapGet("/api/crafts", async (
    string? item,
    string? profession,
    string? ingredient,
    ICraftReadRepository repository,
    CancellationToken cancellationToken) =>
{
    var crafts = await repository.ListAsync(new CraftQuery(item, profession, ingredient), cancellationToken);
    return Results.Ok(crafts);
});

app.MapGet("/api/crafts/items/{item}", async (string item, ICraftReadRepository repository, CancellationToken cancellationToken) =>
{
    var crafts = await repository.ListAsync(new CraftQuery(item, null, null), cancellationToken);
    return Results.Ok(crafts);
});

app.MapGet("/api/crafts/professions/{profession}", async (string profession, ICraftReadRepository repository, CancellationToken cancellationToken) =>
{
    var crafts = await repository.ListAsync(new CraftQuery(null, profession, null), cancellationToken);
    return Results.Ok(crafts);
});

app.MapGet("/api/crafts/ingredients/{ingredient}", async (string ingredient, ICraftReadRepository repository, CancellationToken cancellationToken) =>
{
    var crafts = await repository.ListAsync(new CraftQuery(null, null, ingredient), cancellationToken);
    return Results.Ok(crafts);
});

app.MapGet("/api/crafts/{slug}", async (string slug, ICraftReadRepository repository, CancellationToken cancellationToken) =>
{
    var craft = await repository.GetAsync(slug, cancellationToken);
    return craft is null ? Results.NotFound() : Results.Ok(craft);
});

app.MapGet("/api/pokemon", async (IPokemonReadRepository repository, CancellationToken cancellationToken) =>
{
    var pokemon = await repository.ListAsync(cancellationToken);
    return Results.Ok(pokemon);
});

app.MapGet("/api/pokemon/{slug}", async (string slug, IPokemonReadRepository repository, CancellationToken cancellationToken) =>
{
    var pokemon = await repository.GetDetailAsync(slug, cancellationToken);
    return pokemon is null ? Results.NotFound() : Results.Ok(pokemon);
});

app.MapGet("/api/items", async (IItemReadRepository repository, CancellationToken cancellationToken) =>
{
    var items = await repository.ListAsync(cancellationToken);
    return Results.Ok(items);
});

app.MapGet("/api/items/categories/{slug}", async (string slug, IItemReadRepository repository, CancellationToken cancellationToken) =>
{
    var category = await repository.GetCategoryAsync(slug, cancellationToken);
    return category is null ? Results.NotFound() : Results.Ok(category);
});

app.MapGet("/api/items/detail/{slug}", async (string slug, IItemReadRepository repository, CancellationToken cancellationToken) =>
{
    var item = await repository.GetItemAsync(slug, cancellationToken);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

app.MapGet("/api/wiki-domains", async (IWikiReadRepository repository, CancellationToken cancellationToken) =>
{
    var domains = await repository.ListDomainsAsync(cancellationToken);
    return Results.Ok(domains);
});

app.MapGet("/api/wiki-domains/{domain}", async (string domain, IWikiReadRepository repository, CancellationToken cancellationToken) =>
{
    var detail = await repository.GetDomainAsync(domain, cancellationToken);
    return detail is null ? Results.NotFound() : Results.Ok(detail);
});

app.MapGet("/api/search", async (string? q, ISearchReadRepository repository, CancellationToken cancellationToken) =>
{
    var results = await repository.SearchAsync(q ?? string.Empty, cancellationToken);
    return Results.Ok(results);
});

app.Run();
