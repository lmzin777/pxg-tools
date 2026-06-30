# PXG Tools Frontend

Frontend em Next.js 16, TypeScript e Tailwind para consumir a API .NET.

## Desenvolvimento

```bash
npm install
npm run dev
```

Configure `API_BASE_URL` em `.env.local`:

```bash
API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Rotas iniciais

- `/` lista os clas usando `GET /api/clans`.
- `/clans/[slug]` mostra detalhe usando `GET /api/clans/{slug}`.
- `/professions` lista profissoes usando `GET /api/professions`.
- `/professions/[slug]` mostra detalhe usando `GET /api/professions/{slug}` e crafts de `/api/crafts`.
- `/crafts` mostra busca central usando `GET /api/crafts`.
- `/crafts/[slug]` mostra detalhe usando `GET /api/crafts/{slug}`.
- `/pokedex` lista Pokemon usando `GET /api/pokemon`.
- `/pokedex/[slug]` mostra detalhe usando `GET /api/pokemon/{slug}`.
- `/items` lista categorias usando `GET /api/items`.
- `/items/[slug]` mostra itens da categoria usando `GET /api/items/categories/{slug}`.
- `/items/detail/[slug]` mostra detalhe usando `GET /api/items/detail/{slug}`.
- `/wiki-data` lista dominios novos usando `GET /api/wiki-domains`.
- `/wiki-data/[domain]` mostra registros de um dominio usando `GET /api/wiki-domains/{domain}`.
- `/admin`, `/admin/sync` e `/admin/scrapers` usam `GET /api/admin/*`.
- `/search` usa `GET /api/search?q=termo`.
- `/favorites` usa `localStorage` para favoritos sem login.

Dados auxiliares temporarios, como estudantes, monumentos e mapas de aventureiro, sao lidos de `../data/*.json` no server side.

## Integracao cruzada

Os helpers em `src/lib/relationships.ts` cruzam crafts, itens, profissoes e Pokemon. Isso alimenta os componentes reutilizaveis:

- `RelatedCrafts`
- `RelatedItems`
- `RelatedProfessions`
- `RelatedPokemon`
- `EntityLink`

O detalhe de craft inclui calculadora de ingredientes por quantidade desejada, preparando a base para um planejador de multiplos crafts futuramente.
