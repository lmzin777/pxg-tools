using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using PxgTools.Application.Clans;
using PxgTools.Infrastructure.Persistence;

namespace PxgTools.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PxgTools")
            ?? throw new InvalidOperationException("Connection string 'PxgTools' is required.");

        services.AddSingleton(_ => new NpgsqlDataSourceBuilder(connectionString).Build());
        services.AddScoped<IClanReadRepository, PostgresClanReadRepository>();

        return services;
    }
}
