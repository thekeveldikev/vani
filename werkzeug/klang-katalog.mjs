/* ================================================================
   Baut klang/katalog.json aus den vorhandenen Aufnahmen.

   Die Aufnahmen selbst entstehen lokal mit einem eigenen Werkzeug
   (Herunterladen, ruhigen Abschnitt schneiden, kodieren) und liegen in
   klang/. Dieses Skript liest nur, was da ist, und schreibt die Liste, aus
   der die App ihren Fundus aufbaut.

   Kodiert wird als AAC in .m4a, nicht mehr als Ogg-Opus. Opus ist sparsamer,
   aber Safari kann Ogg je nach Systemfassung nicht abspielen: auf einem
   neueren iPad lief der Klang, auf einem aelteren kam nur „Diese Aufnahme
   versteht der Browser nicht“. AAC koennen alle.

   Aufruf:  node werkzeug/klang-katalog.mjs
   ================================================================ */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const klang = join(wurzel, 'klang');
if (!existsSync(klang)) { console.log('Kein klang/-Ordner — nichts zu tun.'); process.exit(0); }

/* Name, Kategorie und Herkunft je Aufnahme. Wer eine neue Datei hinzufügt,
   trägt sie hier ein; alles Übrige ergibt sich aus der Datei selbst. */
const BEKANNT = JSON.parse(readFileSync(join(wurzel, 'werkzeug', 'klang-namen.json'), 'utf8'));

const REIHENFOLGE = ['Wetter', 'Wasser', 'Feuer', 'Natur', 'Draußen', 'Orte', 'Innen', 'Reise', 'Sonst'];
const dateien = readdirSync(klang).filter((f) => f.endsWith('.m4a'));
const katalog = [];
const fehlend = [];

for (const datei of dateien.sort()) {
  const id = datei.replace(/\.m4a$/, '');
  const mb = +(statSync(join(klang, datei)).size / 1048576).toFixed(2);
  if (mb < 0.05) { console.log('übersprungen (zu klein, vermutlich still): ' + datei); continue; }
  const b = BEKANNT[id];
  if (!b) { fehlend.push(id); continue; }
  katalog.push({ id, name: b.name, kat: b.kat, datei, mb, quelle: b.quelle });
}

katalog.sort((a, b) => {
  const ka = REIHENFOLGE.indexOf(a.kat), kb = REIHENFOLGE.indexOf(b.kat);
  return (ka < 0 ? 99 : ka) - (kb < 0 ? 99 : kb) || a.name.localeCompare(b.name, 'de');
});

writeFileSync(join(klang, 'katalog.json'), JSON.stringify(katalog, null, 1) + '\n');

const proKat = {};
for (const k of katalog) proKat[k.kat] = (proKat[k.kat] || 0) + 1;
console.log(katalog.length + ' Klänge, zusammen ' + katalog.reduce((n, k) => n + k.mb, 0).toFixed(1) + ' MB');
for (const [kat, n] of Object.entries(proKat)) console.log('  ' + kat.padEnd(10) + n);
if (fehlend.length) {
  console.log('\nOhne Eintrag in werkzeug/klang-namen.json (nicht im Katalog):');
  for (const f of fehlend) console.log('  ' + f);
  process.exitCode = 1;
}
