# PXG Tools Scrapers

Node.js + TypeScript scrapers for the official PokeXGames wiki.

## Scripts

```bash
npm install
npm run scrape:clans
npm run scrape:clan-details
npm run scrape:all
npm run scrape:helds
npm run scrape:wiki-domain -- bosses
DATABASE_URL="postgresql://..." npm run db:load-clans
DATABASE_URL="postgresql://..." npm run db:apply-schema
DATABASE_URL="postgresql://..." npm run db:load:all
DATABASE_URL="postgresql://..." npm run db:load-wiki -- helds
```

Outputs:

- `../data/clans.json`
- `../data/clan-details.json`
- `../data/professions.json`
- `../data/pokemon.json`
- `../data/items.json`
- `../data/crafts.json`
- `../data/professor-students.json`
- `../data/wiki-<domain>.json`

## Dominios novos da Wiki

Os scripts `scrape:<domain>` e `db:load-wiki -- <domain>` foram criados para:

- helds
- bosses
- dungeons
- quests
- npcs
- berries
- addons
- outfits
- tasks
- respawns
- mapas

Eles ainda nao fazem parte de `scrape:all` porque devem ser refinados e validados individualmente antes de entrarem no cron principal.

## GitHub Actions

The root workflow `.github/workflows/scrapers.yml` runs the scrapers and loads the scraped JSON into Neon.

Configure a repository secret named `DATABASE_URL` in `Settings > Secrets and variables > Actions`.

The workflow supports:

- `workflow_dispatch` for manual runs.
- A daily cron schedule at `0 9 * * *` UTC.
- `npm run scrape:all` to regenerate scraper outputs.
- `npm run db:apply-schema` to apply `database/schema.sql`.
- `npm run db:load:all` to load clans, professions, Pokemon, items, and crafts into Neon.

The PowerShell extractor is kept temporarily as a migration reference and can be removed after the TypeScript scraper is validated in a Node-enabled environment.
