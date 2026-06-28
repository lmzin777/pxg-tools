import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function loadProjectEnv() {
  config({ path: resolve(ROOT_DIR, '.env'), quiet: true });
  config({ path: resolve(ROOT_DIR, 'scrapers/.env'), quiet: true });
}
