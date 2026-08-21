import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(join(wurzel, p), 'utf8');

test('Quellverträge: jede JavaScript-Datei ist syntaktisch gültig', () => {
  const dateien = lies('build.sh').match(/src\/[\w-]+\.js/g) || [];
  assert.ok(dateien.length >= 18, 'Buildliste darf nicht versehentlich schrumpfen');
  for (const d of new Set(dateien)) assert.doesNotThrow(() => new vm.Script(lies(d), { filename: d }), d);
  assert.doesNotThrow(() => new vm.Script(lies('sw.js'), { filename: 'sw.js' }));
  assert.doesNotThrow(() => new vm.Script(lies('server.js'), { filename: 'server.js' }));
});

test('PWA-Vertrag: stabile Identität, Versionen und Offline-Kern passen zusammen', () => {
  const manifest = JSON.parse(lies('manifest.json'));
  assert.equal(manifest.id, './');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  const appVersion = lies('src/30-core.js').match(/APP_VERSION\s*=\s*'([^']+)'/)[1];
  const swVersion = lies('sw.js').match(/VERSION\s*=\s*'([^']+)'/)[1];
  assert.equal(swVersion, appVersion);
  for (const pfad of lies('sw.js').match(/'\.\/[^']+'/g).map((s) => s.slice(3, -1)).filter(Boolean)) {
    if (pfad === '') continue;
    assert.ok(existsSync(join(wurzel, pfad)), 'Offline-Datei fehlt: ' + pfad);
  }
});

test('Buildvertrag: neue Räume stehen vor Router und Boot in der richtigen Reihenfolge', () => {
  const build = lies('build.sh');
  const pos = (s) => build.indexOf(s);
  assert.ok(pos('30-core.js') < pos('39-beziehungen.js'));
  assert.ok(pos('30-core.js') < pos('29-profile.js'));
  assert.ok(pos('29-profile.js') < pos('31-sync.js'));
  assert.ok(pos('31-sync.js') < pos('35-richtext.js'));
  assert.ok(pos('35-richtext.js') < pos('43-hefte.js'));
  assert.ok(pos('39-beziehungen.js') < pos('40-router.js'));
  assert.ok(pos('42d-goodnotes.js') < pos('49-feinheiten.js'));
  assert.ok(pos('50-audio.js') < pos('51-klangraum.js'));
  assert.ok(pos('51-klangraum.js') < pos('60-boot.js'));
});

test('Update- und Klangvertrag: ein Icon bleibt stabil und iOS bekommt eine Medienbrücke', () => {
  const boot = lies('src/60-boot.js'), audio = lies('src/50-audio.js');
  assert.match(boot, /sucheAppUpdate\(neuLaden = false\)/);
  assert.match(boot, /_swReg\.update\(\)/);
  assert.match(boot, /location\.reload\(\)/);
  assert.match(audio, /_audioMedienBruecke/);
  assert.match(audio, /createObjectURL/);
  assert.match(audio, /ctx\.state === 'interrupted'/);
  assert.match(lies('src/49-feinheiten.js'), /Ein Icon genügt für immer/);
});

test('Profilvertrag: veröffentlichter Code enthält keine angeforderten Nutzerpasswörter', () => {
  const profil = lies('src/29-profile.js');
  assert.doesNotMatch(profil, /Sarah|Kevin/);
  assert.doesNotMatch(profil, /(?:PASSWORT|BENUTZER|USERS)\s*=\s*\{/);
  assert.match(profil, /PBKDF2/);
  assert.match(profil, /AES-GCM/);
});

test('Rich-Toolbar-Regressionsvertrag: sichtbarer Titel wird gebunden, kein freier Bezeichner bleibt', () => {
  const rich = lies('src/35-richtext.js');
  assert.match(rich, /class: 'format-knopf', title: titel, 'aria-label': titel/);
  assert.doesNotMatch(rich, /class: 'format-knopf', title, 'aria-label': titel/);
});

test('Goodnotes-Vertrag: Archiv bleibt aus der allgemeinen Suche heraus', () => {
  assert.ok(!lies('src/48-suche.js').includes("['goodnote'"));
  assert.match(lies('src/42d-goodnotes.js'), /Im Archiv nach Titel, Stichwort oder Notiz suchen/);
});

test('Wortkisten-Vertrag: Kisten sind synchronisierte Dokumente und alte lose Wörter bleiben sichtbar', () => {
  const woerter = lies('src/47-woerter.js');
  assert.match(woerter, /neuDoc\('wortkiste'/);
  assert.match(woerter, /kistenId === 'lose'/);
  assert.match(woerter, /Nur Kiste löschen · Wörter bleiben lose/);
  assert.match(lies('src/48-suche.js'), /\['wortkiste', 'Wortkisten'/);
  assert.match(lies('src/31-sync.js'), /'titel'.*'notiz'/);
});

test('Desktop-Vertrag: eigenes sicheres Protokoll wird erkannt und Fremdseiten bleiben ausgesperrt', () => {
  const main = lies('desktop/main.cjs');
  assert.match(main, /u\.protocol === 'vani:' && u\.hostname === 'app'/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /sandbox:\s*true/);
  assert.match(main, /safeStorage\.encryptString/);
  assert.match(main, /setPermissionRequestHandler/);
});
