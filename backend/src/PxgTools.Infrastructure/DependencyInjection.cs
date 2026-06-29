using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using PxgTools.Application.Clans;
using PxgTools.Application.Items;
using PxgTools.Application.Pokemon;
using PxgTools.Application.Professions;
using PxgTools.Infrastructure.Persistence;

namespace PxgTools.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PxgTools")
            ?? throw new InvalidOperationException("Connection string 'PxgTools' is required.");

        services.AddSingleton(_ => new NpgsqlDataSourceBuilder(NormalizeConnectionString(connectionString)).Build());
        services.AddScoped<IClanReadRepository, PostgresClanReadRepository>();
        services.AddScoped<IProfessionReadRepository, PostgresProfessionReadRepository>();
        services.AddScoped<IPokemonReadRepository, PostgresPokemonReadRepository>();
        services.AddScoped<IItemReadRepository, PostgresItemReadRepository>();

        return services;
    }

    private static string NormalizeConnectionString(string connectionString)
    {
        if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return connectionString;
        }

        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':', 2);
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(0) ?? string.Empty),
            Password = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(1) ?? string.Empty),
            SslMode = query["sslmode"]?.Equals("disable", StringComparison.OrdinalIgnoreCase) == true
                ? SslMode.Disable
                : SslMode.Require,
        };

        return builder.ConnectionString;
    }
}
