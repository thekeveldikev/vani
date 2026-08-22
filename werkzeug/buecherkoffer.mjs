/* ================================================================
   Der Bücherkoffer: PDFs verschlüsselt neben die App legen.

   Aufruf:  node werkzeug/buecherkoffer.mjs <Ordner-mit-PDFs> [Passwort]

   Jede PDF wird mit AES-256-GCM verschlüsselt; der Schlüssel kommt aus dem
   Passwort per PBKDF2-SHA-256 (200 000 Runden). Ohne Passwort bleibt alles
   Rauschen — auch in einem öffentlichen Repo. Die App holt die Dateien über
   buecher/koffer.json, fragt das Passwort ab und legt die Bücher in den
   eigenen Medienvorrat. Danach dürfen die Dateien aus dem Repo verschwinden.

   Format je Datei: "VANIBUCH1" (9 Byte) + Salz (16) + IV (12) + Chiffrat+Tag.
   Wird kein Passwort übergeben, würfelt das Werkzeug eines und zeigt es an —
   es steht nirgends sonst.
   ================================================================ */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const quelle = process.argv[2];
if (!quelle) { console.log('Aufruf: node werkzeug/buecherkoffer.mjs <Ordner-mit-PDFs> [Passwort]'); process.exit(1); }

const WOERTER = ['Tinte', 'Feder', 'Kerze', 'Nacht', 'Garten', 'Fenster', 'Regen', 'Mond', 'Wachs', 'Papier', 'Brief', 'Lampe', 'Holz', 'Atem', 'Stille', 'Funke', 'Stern', 'Wind', 'Glas', 'Tasche'];
const passwort = process.argv[3] || (Array.from({ length: 4 }, () => WOERTER[randomBytes(1)[0] % WOERTER.length]).join('-') + '-' + (100 + randomBytes(1)[0] % 900));

const ziel = join(wurzel, 'buecher');
mkdirSync(ziel, { recursive: true });
const dateien = readdirSync(quelle).filter((n) => /\.pdf$/i.test(n)).sort();
const manifest = [];
for (const name of dateien) {
  const pfad = join(quelle, name);
  const roh = readFileSync(pfad);
  const salz = randomBytes(16), iv = randomBytes(12);
  const schluessel = pbkdf2Sync(passwort, salz, 200000, 32, 'sha256');
  const chiffre = createCipheriv('aes-256-gcm', schluessel, iv);
  const chiffrat = Buffer.concat([chiffre.update(roh), chiffre.final(), chiffre.getAuthTag()]);
  /* Dateiname im Koffer: nur Kennziffer, kein Titel — der Titel steht verschlüsselt
     im Manifest nicht, sondern kommt aus der PDF selbst. */
  const kennung = 'buch-' + String(manifest.length + 1).padStart(2, '0') + '.enc';
  writeFileSync(join(ziel, kennung), Buffer.concat([Buffer.from('VANIBUCH1', 'ascii'), salz, iv, chiffrat]));
  /* Ein sprechender Name hilft in der App; Tauschbörsen-Zusätze bleiben draußen. */
  const titel = basename(name, '.pdf').replace(/\s*\((?:[^()]*(?:z-lib|1lib|library|epdf)[^()]*)\)\s*/gi, ' ').replace(/^\[[^\]]*\]\s*•?\s*/, '').replace(/\s+/g, ' ').trim();
  manifest.push({ datei: kennung, groesse: statSync(pfad).size, name: titel.slice(0, 120) });
  console.log(kennung.padEnd(14) + (statSync(pfad).size / 1048576).toFixed(1).padStart(6) + ' MB  ' + titel.slice(0, 70));
}
writeFileSync(join(ziel, 'koffer.json'), JSON.stringify({ version: 1, runden: 200000, buecher: manifest }, null, 1) + '\n');
console.log('\n' + manifest.length + ' Bücher im Koffer. Passwort (steht nirgends sonst):\n\n    ' + passwort + '\n');
