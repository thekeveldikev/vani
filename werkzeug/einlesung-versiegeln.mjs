/* ================================================================
   Die Einlesung versiegeln.

   Aufruf:  node werkzeug/einlesung-versiegeln.mjs [Passwort]

   Was die Wand über die eigenen Texte weiß (Werke, Figuren, Orte, Begriffe,
   Notizen der Stimmen) liegt als `einlesung/einlesung.json` im Klartext —
   diese Datei gehört NICHT ins Repo (.gitignore). Dieses Werkzeug macht daraus
   `einlesung/einlesung.enc`: AES-256-GCM, Schlüssel aus dem Passwort per
   PBKDF2-SHA-256 (200 000 Runden). Ohne Passwort ist die Datei Rauschen —
   auch in einem öffentlichen Repo.

   Daneben entsteht `einlesung/umschlag.json` mit dem, was auch außen stehen
   darf: Datum der Lesung und die Zahl der Werke. Keine Titel, keine Namen.

   Format: "VANIEINL1" (9 Byte) + Salz (16) + IV (12) + Chiffrat+Tag.
   Wird kein Passwort übergeben, würfelt das Werkzeug eines und zeigt es an —
   es steht danach nirgends sonst.
   ================================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const quelle = join(wurzel, 'einlesung', 'einlesung.json');
if (!existsSync(quelle)) {
  console.log('Es gibt kein einlesung/einlesung.json. Lege es an (Klartext, bleibt lokal) und ruf mich wieder.');
  process.exit(1);
}
const WOERTER = ['Tinte', 'Feder', 'Kerze', 'Nacht', 'Garten', 'Fenster', 'Regen', 'Mond', 'Wachs', 'Papier', 'Brief', 'Lampe', 'Holz', 'Atem', 'Stille', 'Funke', 'Salon', 'Rahmen', 'Sessel', 'Kamin', 'Spiegel', 'Diele', 'Faden', 'Splitter'];
const passwort = process.argv[2] || (Array.from({ length: 4 }, () => WOERTER[randomBytes(1)[0] % WOERTER.length]).join('-') + '-' + (100 + randomBytes(1)[0] % 900));

const roh = Buffer.from(readFileSync(quelle, 'utf8'), 'utf8');
let daten = null;
try { daten = JSON.parse(roh.toString('utf8')); } catch (e) { console.log('einlesung.json ist kein gültiges JSON:', e.message); process.exit(1); }
for (const feld of ['stand', 'woerter', 'werke', 'figuren', 'stimmen']) {
  if (daten[feld] == null) { console.log('Im JSON fehlt das Feld "' + feld + '".'); process.exit(1); }
}

const salz = randomBytes(16), iv = randomBytes(12);
const schluessel = pbkdf2Sync(passwort, salz, 200000, 32, 'sha256');
const chiffre = createCipheriv('aes-256-gcm', schluessel, iv);
const chiffrat = Buffer.concat([chiffre.update(roh), chiffre.final(), chiffre.getAuthTag()]);
const paket = Buffer.concat([Buffer.from('VANIEINL1', 'utf8'), salz, iv, chiffrat]);

const ziel = join(wurzel, 'einlesung');
mkdirSync(ziel, { recursive: true });
writeFileSync(join(ziel, 'einlesung.enc'), paket);
writeFileSync(join(ziel, 'umschlag.json'), JSON.stringify({
  fassung: 1, datei: 'einlesung/einlesung.enc', runden: 200000,
  stand: daten.stand, werke: Array.isArray(daten.werke) ? daten.werke.length : 0,
  stimmen: Object.keys(daten.stimmen || {}).length,
  hinweis: 'Versiegelt. Die App fragt einmal nach dem Passwort und merkt sich den Inhalt dann auf dem Gerät.'
}, null, 1) + '\n', 'utf8');

console.log('Versiegelt: einlesung/einlesung.enc (' + paket.length.toLocaleString('de-DE') + ' Bytes)');
console.log('Umschlag:   einlesung/umschlag.json (Datum und Zahlen, sonst nichts)');
console.log('');
console.log('Passwort:   ' + passwort);
console.log('');
console.log('Merk es dir — es steht nirgendwo sonst. Ohne das Passwort ist die Datei Rauschen.');
