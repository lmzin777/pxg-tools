# PXG Tools

PXG Tools e um app publico de consulta para clas, profissoes, Pokemon, itens, crafts e dados auxiliares da Wiki.

O site publicado vem do GitHub via Netlify. O que estiver commitado e enviado para o repositorio sera a base do deploy publico.

## Frontend oficial

O unico frontend oficial fica em:

```text
frontend/
```

Ele usa Next.js 16, TypeScript e Tailwind. Novas telas, correcoes e melhorias devem ser feitas somente nessa pasta.

O frontend estatico antigo foi movido para:

```text
legacy-static/
```

Esse legado existe apenas como referencia e nao deve ser usado como app principal nem como origem de deploy.

## Deploy publico

O Netlify deve publicar o frontend Next.js em `frontend/`. A configuracao oficial fica em `netlify.toml` na raiz:

```text
base: frontend
build command: npm run build
publish: .next
plugin: @netlify/plugin-nextjs
```

Isso impede que o Netlify publique o antigo `index.html` da raiz.

Variaveis obrigatorias no painel do Netlify:

```text
API_BASE_URL=https://URL-PUBLICA-DA-API
NEXT_PUBLIC_API_BASE_URL=https://URL-PUBLICA-DA-API
```

Em producao, essas URLs nunca devem apontar para `localhost:5000`.

## API publica

A API .NET deve estar publicada em uma URL publica e usar Neon como banco.

Variaveis obrigatorias no host da API:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__PxgTools=postgresql://...
CORS_ORIGINS=https://pxgtools.netlify.app
```

Tambem e possivel configurar CORS no formato nativo .NET:

```text
Cors__Origins__0=https://pxgtools.netlify.app
```

A API deve manter o endpoint:

```text
/health
```

`localhost:5000` serve apenas para desenvolvimento. O site publico precisa apontar para a API publica.

## Banco Neon

Neon e a fonte principal dos dados em producao.

- `ConnectionStrings__PxgTools`: usado pela API .NET.
- `DATABASE_URL`: usado apenas por scrapers, loaders e GitHub Actions.

Nao coloque connection strings reais no repositorio.

## GitHub Actions

O workflow `.github/workflows/build.yml` valida:

- frontend Next.js em `frontend/`
- backend .NET
- scrapers TypeScript
- build Docker da API

O workflow `.github/workflows/scrapers.yml` roda os scrapers e carrega dados no Neon usando o secret `DATABASE_URL`.

## Rotas principais

- `/`: lista de clas
- `/tools`
- `/pokedex`
- `/pokedex/[slug]`
- `/items`
- `/crafts`
- `/professions`
- `/favorites`

As rotas `/admin` e `/wiki-data` continuam acessiveis por URL direta, mas nao aparecem no menu publico.

### Filtros da Pokedex

A rota `/pokedex` aceita filtros pela URL para compartilhar buscas:

```text
/pokedex?q=char&type=Fire&maxLevel=80&sort=level-asc
```

Parametros disponiveis: `q`, `region`, `generation`, `type`, `type2`, `minLevel`, `maxLevel` e `sort`.

## Regras do projeto

- Nao implementar login por enquanto.
- Nao implementar loot/drop.
- O usuario comum acessa tudo pela URL publica e nao precisa baixar codigo nem rodar nada localmente.

## Guia completo

O guia de producao fica em:

```text
docs/DEPLOYMENT.md
```
