FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/src/PxgTools.Domain/PxgTools.Domain.csproj backend/src/PxgTools.Domain/
COPY backend/src/PxgTools.Application/PxgTools.Application.csproj backend/src/PxgTools.Application/
COPY backend/src/PxgTools.Infrastructure/PxgTools.Infrastructure.csproj backend/src/PxgTools.Infrastructure/
COPY backend/src/PxgTools.Api/PxgTools.Api.csproj backend/src/PxgTools.Api/
RUN dotnet restore backend/src/PxgTools.Api/PxgTools.Api.csproj

COPY backend/src backend/src
RUN dotnet publish backend/src/PxgTools.Api/PxgTools.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PxgTools.Api.dll"]
