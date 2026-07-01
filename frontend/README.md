# PXG Tools Frontend

Frontend em Next.js 16, TypeScript e Tailwind para consumir a API .NET.

## Producao

O frontend oficial do PXG Tools e publicado pelo Netlify a partir do GitHub.

A configuracao fica em `../netlify.toml`:

```text
base: frontend
build command: npm run build
publish: .next
plugin: @netlify/plugin-nextjs
```

Configure no painel do Netlify:

```bash
API_BASE_URL=https://sua-api-publica.example.com
NEXT_PUBLIC_API_BASE_URL=https://sua-api-publica.example.com
```

A API publica precisa liberar o dominio do frontend em `CORS_ORIGINS` ou `Cors__Origins__0`.

O guia completo fica em `../docs/DEPLOYMENT.md`.

## Rotas iniciais

- `/` lista os clas usando `GET /api/clans`.
- `/tools` reune as ferramentas antigas: Chance de Drop Lucky, Media de Balls, Tipos de Balls, Calculadora de Boost, Tabela de Tipos e Tabela de Boost.
- `/clans/[slug]` mostra detalhe usando `GET /api/clans/{slug}`.
- `/professions` lista profissoes usando `GET /api/professions`.
- `/professions/[slug]` mostra detalhe usando `GET /api/professions/{slug}` e crafts de `/api/crafts`.
- `/crafts` mostra busca central usando `GET /api/crafts`.
- `/crafts/[slug]` mostra detalhe usando `GET /api/crafts/{slug}`.
- `/pokedex` lista Pokemon usando `GET /api/pokemon`.
- `/pokedex/[slug]` mostra detalhe usando `GET /api/pokemon/{slug}`, com ficha estilo Wiki, evolucoes, movimentos PvP/PvE, efetividades e outras versoes.
- `/items` lista categorias usando `GET /api/items`.
- `/items/[slug]` mostra itens da categoria usando `GET /api/items/categories/{slug}`.
- `/items/detail/[slug]` mostra detalhe usando `GET /api/items/detail/{slug}`.
- `/wiki-data` lista dominios novos usando `GET /api/wiki-domains`.
- `/wiki-data/[domain]` mostra registros de um dominio usando `GET /api/wiki-domains/{domain}`.
- `/admin`, `/admin/sync` e `/admin/scrapers` usam `GET /api/admin/*`.
- `/search` usa `GET /api/search?q=termo`.
- `/favorites` usa `localStorage` para favoritos sem login.

`/admin` e `/wiki-data` sao mantidas como rotas internas e nao aparecem no menu publico do app.

Dados auxiliares temporarios, como estudantes, monumentos e mapas de aventureiro, sao lidos de `../data/*.json` no server side.

## Integracao cruzada

Os helpers em `src/lib/relationships.ts` cruzam crafts, itens, profissoes e Pokemon. Isso alimenta os componentes reutilizaveis:

- `RelatedCrafts`
- `RelatedItems`
- `RelatedProfessions`
- `RelatedPokemon`
- `EntityLink`

O detalhe de craft inclui calculadora de ingredientes por quantidade desejada, preparando a base para um planejador de multiplos crafts futuramente.

## Pokemon

A tela de Pokemon nao implementa loot/drop. O scraper e o frontend focam em dados exibidos nas paginas individuais da Wiki, como informacoes gerais, movimentos, efetividades, evolucoes e outras versoes.
