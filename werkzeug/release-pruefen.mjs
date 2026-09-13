/* ================================================================
   Passt ein gebautes Desktop-Release zusammen? Läuft im Workflow direkt
   vor dem Hochladen.

   Die Desktop-App holt sich neue Fassungen über latest.yml. Stehen dort
   eine andere Version, ein anderer Dateiname oder eine Prüfsumme, die nicht
   zur Setup-Datei passt, lehnt sie die Aktualisierung ab — und zwar auf jedem
   Rechner, auf dem VANI installiert ist. Das soll vorher auffallen, nicht
   danach.

   Aufruf:  node werkzeug/release-pruefen.mjs 5.60.0 [ordner]
   ================================================================ */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Nur die Felder, auf die es ankommt. latest.yml nennt sha512 zweimal (in
   files und oben); gelesen wird der obere Wert, die Größe steht nur in files. */
export function latestYmlLesen(text) {
  const t = String(text || '');
  const oben = (name) => {
    const m = t.match(new RegExp('^' + name + ':\\s*(.+)$', 'm'));
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
  };
  const groesse = t.match(/^\s+size:\s*(\d+)\s*$/m);
  return { version: oben('version'), path: oben('path'), sha512: oben('sha512'), size: groesse ? Number(groesse[1]) : null };
}

export function releasePruefen(ordner, version) {
  const v = String(version || '').trim();
  const fehler = [];
  const yml = join(ordner, 'latest.yml');
  if (!existsSync(yml)) return ['latest.yml fehlt'];
  const y = latestYmlLesen(readFileSync(yml, 'utf8'));
  const setup = `VANI-${v}-x64-Setup.exe`;
  if (y.version !== v) fehler.push(`latest.yml nennt Version ${y.version}, gebaut werden sollte ${v}`);
  if (y.path !== setup) fehler.push(`latest.yml zeigt auf ${y.path}, erwartet ${setup}`);
  for (const name of [setup, setup + '.blockmap', `VANI-${v}-x64-Portable.exe`]) {
    if (!existsSync(join(ordner, name))) fehler.push(name + ' fehlt');
  }
  if (existsSync(join(ordner, setup))) {
    const inhalt = readFileSync(join(ordner, setup));
    if (createHash('sha512').update(inhalt).digest('base64') !== y.sha512) fehler.push('Die Prüfsumme in latest.yml passt nicht zur Setup-Datei');
    if (y.size === null) fehler.push('latest.yml nennt keine Größe');
    else if (y.size !== inhalt.length) fehler.push(`latest.yml nennt ${y.size} Bytes, die Setup-Datei hat ${inhalt.length}`);
  }
  return fehler;
}

const direkt = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (direkt) {
  const version = process.argv[2];
  const ordner = process.argv[3] || 'release';
  const fehler = releasePruefen(ordner, version);
  if (fehler.length) {
    console.error('Das Release ' + version + ' passt nicht zusammen:\n  · ' + fehler.join('\n  · '));
    process.exit(1);
  }
  console.log('Release ' + version + ' passt zusammen: latest.yml, Setup, Blockmap und Portable.');
}
