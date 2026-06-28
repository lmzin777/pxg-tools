using PxgTools.Application.Clans;
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

app.Run();
