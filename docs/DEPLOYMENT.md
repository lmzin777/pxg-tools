# PXG Tools Deployment

Este guia prepara o deploy de producao com:

- Frontend Next.js no Netlify.
- API .NET em host com suporte a Docker, como Render, Railway, Fly.io, Azure Container Apps ou similar.
- Banco Neon Postgres.

## Variaveis De Ambiente

### Neon

Use a connection string Postgres do Neon como secret. Nao commit secrets.

```text
DATABASE_URL=postgresql://...
```

O `DATABASE_URL` e usado pelos scrapers/loaders.

### API .NET

Configure no host da API:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__PxgTools=postgresql://...
CORS_ORIGINS=https://your-frontend.example.com
```

Alternativa para CORS usando formato nativo .NET:

```text
Cors__Origins__0=https://your-frontend.example.com
```

### Frontend Next.js

Configure no host do frontend:

```text
API_BASE_URL=https://your-api.example.com
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

## Banco Neon

1. Crie ou selecione um projeto Neon.
2. Copie a connection string do branch de producao.
3. Configure `DATABASE_URL` no GitHub Actions.
4. Configure `ConnectionStrings__PxgTools` no host da API.
5. Aplique o schema:

```bash
cd scrapers
npm ci
npm run db:apply-schema
```

6. Rode uma carga inicial:

```bash
npm run scrape:all
npm run db:load:all
```

## API .NET

O Dockerfile principal fica na raiz:

```text
Dockerfile
```

Tambem mantemos uma copia especifica da API em:

```text
backend/src/PxgTools.Api/Dockerfile
```

Ao criar o servico Docker, use:

```text
Dockerfile path: Dockerfile
Docker context: repository root
Port: 8080
Health check: /health
```

Variaveis obrigatorias:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__PxgTools=postgresql://...
CORS_ORIGINS=https://your-frontend.example.com
```

Depois de publicar, valide:

```text
https://your-api.example.com/health
https://your-api.example.com/api/pokemon
```

## Frontend Next.js no Netlify

O Netlify publica somente o que esta commitado e enviado para o GitHub. A raiz do repositorio possui `netlify.toml` apontando para `frontend/`, para impedir que a versao estatica antiga seja publicada.

Configuracao esperada:

```text
Base directory: frontend
Build Command: npm run build
Install Command: npm ci
Publish directory: .next
Plugin: @netlify/plugin-nextjs
```

Variaveis:

```text
API_BASE_URL=https://your-api.example.com
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

Depois de publicar, valide:

```text
https://your-frontend.example.com/pokedex
https://your-frontend.example.com/pokedex/pikachu
https://your-frontend.example.com/items
https://your-frontend.example.com/crafts
https://your-frontend.example.com/professions
https://your-frontend.example.com/admin
```

`/admin` e `/wiki-data` sao rotas internas. Elas nao aparecem no menu publico, mas podem ser acessadas por URL direta por quem opera o projeto.

Se o layout antigo aparecer no site publico, verifique se o deploy do Netlify esta lendo o `netlify.toml` commitado e se o build realmente usa `frontend/` como base directory.

## GitHub Actions

Configure secrets:

```text
DATABASE_URL
```

Configure variables do repositorio, se quiser builds de producao com a URL real:

```text
API_BASE_URL=https://your-api.example.com
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

Workflows existentes:

- `PXG Build`: valida frontend, backend, scrapers e Docker da API.
- `PXG Scrapers`: roda scraping, aplica schema e carrega dados no Neon.

## Checklist De Producao

- Neon tem schema aplicado.
- Neon tem carga inicial.
- API publica responde `/health`.
- API publica responde `/api/pokemon`.
- Frontend usa `API_BASE_URL` publico.
- API tem CORS liberado para o dominio do frontend.
- `/pokedex`, `/pokedex/[slug]`, `/items`, `/crafts`, `/professions` e `/admin` funcionam fora do localhost.
