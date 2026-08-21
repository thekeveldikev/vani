import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hosting = join(dirname(fileURLToPath(import.meta.url)), '..');
const wurzel = join(hosting, '..');
const publicDir = join(hosting, 'public');
mkdirSync(join(publicDir, 'icons'), { recursive: true });
for (const name of ['index.html', 'manifest.json', 'sw.js', 'faden.enc', 'robots.txt']) cpSync(join(wurzel, name), join(publicDir, name));
cpSync(join(wurzel, 'icons'), join(publicDir, 'icons'), { recursive: true, force: true });
