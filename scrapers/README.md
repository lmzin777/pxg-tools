# PXG Tools Scrapers

Node.js + TypeScript scrapers for the official PokeXGames wiki.

## Scripts

```bash
npm install
npm run scrape:clans
npm run scrape:clan-details
npm run scrape:all
DATABASE_URL="postgresql://..." npm run db:load-clans
```

Outputs:

- `../data/clans.json`
- `../data/clan-details.json`

The PowerShell extractor is kept temporarily as a migration reference and can be removed after the TypeScript scraper is validated in a Node-enabled environment.
