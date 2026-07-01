import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = join(scriptDir, '..');
const sourceDir = join(frontendDir, '..', 'data');
const targetDir = join(frontendDir, 'data');

await mkdir(targetDir, { recursive: true });

const files = await readdir(sourceDir);
const jsonFiles = files.filter((file) => file.endsWith('.json'));

await Promise.all(
  jsonFiles.map((file) => copyFile(join(sourceDir, file), join(targetDir, file))),
);

console.log(`Synced ${jsonFiles.length} fallback data files to frontend/data.`);
