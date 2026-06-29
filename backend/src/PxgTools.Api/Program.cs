using PxgTools.Application.Clans;
using PxgTools.Application.Items;
using PxgTools.Application.Pokemon;
using PxgTools.Application.Professions;
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

app.Run();
