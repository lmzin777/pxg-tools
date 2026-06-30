# PXG Tools

Ferramentas e dados auxiliares para o projeto PXG Tools.

## GitHub Actions: scrapers e carga no Neon

O workflow `.github/workflows/scrapers.yml` roda os scrapers automaticamente e carrega os dados no Neon.

Ele pode ser executado de duas formas:

- Manualmente pela aba GitHub Actions, usando o workflow `PXG Scrapers`.
- Automaticamente pelo cron diario configurado para `0 9 * * *` em UTC.

## Configurando o secret DATABASE_URL

1. No Neon, copie a connection string PostgreSQL do projeto/branch desejado.
2. No GitHub, abra `Settings > Secrets and variables > Actions`.
3. Clique em `New repository secret`.
4. Use o nome `DATABASE_URL`.
5. Cole a connection string completa, por exemplo `postgresql://user:password@host/dbname?sslmode=require`.
6. Salve o secret.

O workflow usa `DATABASE_URL` apenas via GitHub Secrets. Nao coloque a connection string em arquivos versionados.

## Ordem do workflow

1. Instala dependencias em `scrapers`.
2. Roda `npm run scrape:all`.
3. Aplica `database/schema.sql` com `npm run db:apply-schema`.
4. Carrega os dados no Neon com `npm run db:load:all`.

Os logs usam grupos do GitHub Actions para separar scraping, schema e carga no banco, com mensagens claras quando algum passo falha.

## Frontend Next.js

A migracao do frontend fica em `frontend/` e usa Next.js 16, TypeScript e Tailwind.

Para rodar localmente:

1. Suba a API .NET.
2. Copie `frontend/.env.example` para `frontend/.env.local`.
3. Ajuste `API_BASE_URL` para a URL da API, por exemplo `http://localhost:5000`.
4. Instale e rode o frontend:

```bash
cd frontend
npm install
npm run dev
```

A primeira tela do app e a lista de clas consumindo `GET /api/clans`. O detalhe usa `GET /api/clans/{slug}`.

Modulos migrados para o frontend Next:

- `/` e `/clans/[slug]`: lista e detalhe de clas.
- `/professions` e `/professions/[slug]`: lista e detalhe de profissoes, especializacoes, caracteristicas e crafts.
- `/crafts`: busca central de crafts.
- `/crafts/[slug]`: detalhe individual de craft com calculadora de ingredientes.
- `/pokedex` e `/pokedex/[slug]`: lista e detalhe de Pokemon.
- `/items` e `/items/[slug]`: categorias de itens e itens por categoria.
- `/items/detail/[slug]`: detalhe individual de item com crafts que criam/usam e profissoes relacionadas.
- `/wiki-data` e `/wiki-data/[domain]`: dominios novos da Wiki preparados para expansao.
- `/admin`, `/admin/sync` e `/admin/scrapers`: painel operacional para syncs, contagens e erros recentes.
- `/search`: busca global em clas, profissoes, Pokemon, itens, crafts e Wiki Data.
- `/favorites`: favoritos locais salvos no navegador.

Os dados auxiliares ainda sem endpoint dedicado, como estudantes, monumentos e mapas de aventureiro, sao lidos dos JSONs locais em `data/` pelo frontend server-side.

## Integracao cruzada

O frontend tem helpers em `frontend/src/lib/relationships.ts` para cruzar dados entre crafts, itens, Pokemon e profissoes sem duplicar logica nas paginas.

Onde isso aparece:

- Itens mostram crafts que criam/usam o item e profissoes relacionadas.
- Pokemon mostram links de materiais e crafts que usam esses materiais quando o dado existe.
- Crafts mostram detalhe individual com links para item criado, ingredientes e profissao.
- Profissoes mostram crafts gerais/exclusivos e itens importantes derivados dos crafts.
- Favoritos usam `localStorage` e nao exigem login.

## Admin e API

A API .NET expoe:

- `GET /api/admin/health`
- `GET /api/admin/stats`
- `GET /api/admin/sync-runs`
- `GET /api/wiki-domains`
- `GET /api/wiki-domains/{domain}`
- `GET /api/items/detail/{slug}`
- `GET /api/crafts/{slug}`
- `GET /api/search?q=termo`

O painel admin le a tabela `sync_runs`, contagens principais e registros dos dominios em `wiki_domains`/`wiki_entities`.

## Novos dominios da Wiki

Foram preparados dominios para expansao gradual:

1. helds
2. bosses
3. dungeons
4. quests
5. NPCs
6. berries
7. addons
8. outfits
9. tasks
10. respawns
11. mapas

Scripts iniciais:

```bash
cd scrapers
npm run scrape:helds
npm run scrape:wiki-domain -- bosses
npm run db:load-wiki -- helds
```

Esses scripts preservam `sourceUrl`, `scrapedAt` e `metadata`. Eles ainda ficam separados do cron principal ate cada dominio ser refinado e validado.

## Build e deploy

O workflow `.github/workflows/build.yml` valida frontend, backend e scrapers em push, PR e execucao manual.

Variaveis/secrets recomendados para producao:

- `DATABASE_URL`: connection string Neon usada por scrapers/loaders.
- `ConnectionStrings__PxgTools`: connection string da API .NET em producao.
- `API_BASE_URL`: URL publica da API consumida pelo Next.
- `NEXT_PUBLIC_API_BASE_URL`: mesma URL quando precisar expor ao cliente.
- `Cors__Origins__0`: dominio publico do frontend permitido pela API.

Comandos locais de validacao:

```bash
cd frontend
npm run typecheck
npm run build
cd ..
dotnet build backend/src/PxgTools.Api/PxgTools.Api.csproj
cd scrapers
npm exec tsc -- --noEmit
```

Para publicar, configure o Neon com `database/schema.sql`, rode a carga inicial com `npm run db:load:all`, publique a API com `ConnectionStrings__PxgTools` e publique o Next com `API_BASE_URL` apontando para a API.
