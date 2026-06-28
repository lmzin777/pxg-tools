# PXG Tools API

Initial Clean Architecture scaffold for the future PXG Tools backend.

## Projects

- `PxgTools.Domain`: clan domain records.
- `PxgTools.Application`: read repository contracts.
- `PxgTools.Infrastructure`: PostgreSQL/Npgsql data access.
- `PxgTools.Api`: minimal HTTP API.

## Local run

Install the .NET 10 SDK, apply `database/schema.sql` to PostgreSQL/Neon, then run:

```bash
dotnet run --project src/PxgTools.Api/PxgTools.Api.csproj
```

Endpoints:

- `GET /health`
- `GET /api/clans`
- `GET /api/clans/{slug}`

Set the Neon connection string in `ConnectionStrings:PxgTools`.
