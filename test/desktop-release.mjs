/* Die Desktop-App: was sie darf (desktop/berechtigung.cjs) und wie sie zu
   neuen Fassungen kommt (.github/workflows/desktop-release.yml mit
   werkzeug/release-pruefen.mjs und werkzeug/release-notizen.mjs).

   Beides war bis 5.59.0 still kaputt. Die App lehnte jede Berechtigung ab —
   auch Mikrofon und Zwischenablage, die sie selbst braucht. Und der Workflow
   lief nur bei gepushten Tags, die es nie gab: kein einziges Release, jede
   Update-Suche endete in einem 404. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { releasePruefen, latestYmlLesen } from '../werkzeug/release-pruefen.mjs';
import { releaseNotizen } from '../werkzeug/release-notizen.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(join(wurzel, p), 'utf8');
const b = createRequire(import.meta.url)('../desktop/berechtigung.cjs');
const VANI = 'vani://app/index.html?desktop=1';

test('Desktop: das Mikrofon darf VANI — nur Ton, nie die Kamera', () => {
  assert.equal(b.darfAnfrage('media', VANI, ['audio']), true, 'Tonaufnahme im Heft');
  assert.equal(b.darfAnfrage('media', VANI, ['video']), false, 'keine Kamera');
  assert.equal(b.darfAnfrage('media', VANI, ['audio', 'video']), false, 'wer die Kamera mitwill, bekommt gar nichts');
  assert.equal(b.darfAnfrage('media', VANI, []), false);
  assert.equal(b.darfAnfrage('media', VANI, undefined), false);
  assert.equal(b.darfPruefung('media', 'vani://app', 'audio'), true);
  assert.equal(b.darfPruefung('media', 'vani://app', 'video'), false);
  assert.equal(b.darfPruefung('media', 'vani://app', 'unknown'), false);
});

test('Desktop: die Zwischenablage darf VANI — sonst lässt sich kein Kopplungscode kopieren', () => {
  for (const p of ['clipboard-read', 'clipboard-sanitized-write']) {
    assert.equal(b.darfAnfrage(p, VANI), true, p);
    assert.equal(b.darfPruefung(p, 'vani://app'), true, p);
  }
});

test('Desktop: alles andere bleibt verboten, und fremde Adressen dürfen gar nichts', () => {
  for (const p of ['geolocation', 'notifications', 'midi', 'midiSysex', 'openExternal', 'fullscreen', 'display-capture', 'hid', 'serial', 'usb', 'pointerLock']) {
    assert.equal(b.darfAnfrage(p, VANI, ['audio']), false, p);
    assert.equal(b.darfPruefung(p, 'vani://app', 'audio'), false, p);
  }
  for (const fremd of ['https://thekeveldikev.github.io/vani/', 'file:///C:/x.html', 'vani://anders/index.html', 'http://app/', '', null, undefined, 'kaputt', 'javascript:alert(1)']) {
    assert.equal(b.darfAnfrage('media', fremd, ['audio']), false, String(fremd));
    assert.equal(b.darfAnfrage('clipboard-read', fremd), false, String(fremd));
    assert.equal(b.darfPruefung('media', fremd, 'audio'), false, String(fremd));
    assert.equal(b.darfPruefung('clipboard-sanitized-write', fremd), false, String(fremd));
  }
});

test('Desktop: main.cjs fragt wirklich die Regel — und lehnt nicht mehr pauschal ab', () => {
  const main = lies('desktop/main.cjs');
  assert.match(main, /require\('\.\/berechtigung\.cjs'\)/);
  assert.match(main, /setPermissionRequestHandler\([\s\S]{0,400}darfAnfrage/);
  assert.match(main, /setPermissionCheckHandler\([\s\S]{0,400}darfPruefung/);
  assert.doesNotMatch(main, /setPermissionCheckHandler\(\(\) => false\)/, 'die alte Pauschalsperre ist weg');
  /* Die Regel muss auch im gepackten Programm liegen */
  assert.ok(JSON.parse(lies('package.json')).build.files.includes('desktop/**'));
});

/* Ein kleines, echtes Release im Wegwerf-Ordner */
function baueRelease(ordner, v, { yVersion = v, pfad, falscheSumme = false, ohne = [] } = {}) {
  const setup = `VANI-${v}-x64-Setup.exe`;
  const inhalt = Buffer.from('so tut ein Installer ' + v);
  writeFileSync(join(ordner, setup), inhalt);
  if (!ohne.includes('blockmap')) writeFileSync(join(ordner, setup + '.blockmap'), 'bm');
  if (!ohne.includes('portable')) writeFileSync(join(ordner, `VANI-${v}-x64-Portable.exe`), 'p');
  const summe = createHash('sha512').update(falscheSumme ? 'etwas anderes' : inhalt).digest('base64');
  if (!ohne.includes('yml')) {
    writeFileSync(join(ordner, 'latest.yml'), `version: ${yVersion}\nfiles:\n  - url: ${pfad || setup}\n    sha512: ${summe}\n    size: ${inhalt.length}\npath: ${pfad || setup}\nsha512: ${summe}\nreleaseDate: '2026-09-13T12:00:00.000Z'\n`);
  }
}
function mitOrdner(fn) {
  const ordner = mkdtempSync(join(tmpdir(), 'vani-release-'));
  try { return fn(ordner); } finally { rmSync(ordner, { recursive: true, force: true }); }
}

test('Release-Prüfung: ein stimmiges Release geht durch', () => {
  mitOrdner((o) => { baueRelease(o, '5.60.0'); assert.deepEqual(releasePruefen(o, '5.60.0'), []); });
});

test('Release-Prüfung: alles, woran die Desktop-App ein Update ablehnen würde, fällt vorher auf', () => {
  mitOrdner((o) => { baueRelease(o, '5.60.0', { yVersion: '5.59.0' }); assert.ok(releasePruefen(o, '5.60.0').some((f) => f.includes('Version 5.59.0')), 'alte Versionsnummer'); });
  mitOrdner((o) => { baueRelease(o, '5.60.0', { falscheSumme: true }); assert.ok(releasePruefen(o, '5.60.0').some((f) => f.includes('Prüfsumme')), 'falsche Prüfsumme'); });
  mitOrdner((o) => { baueRelease(o, '5.60.0', { pfad: 'VANI-Setup.exe' }); assert.ok(releasePruefen(o, '5.60.0').some((f) => f.includes('zeigt auf')), 'falscher Dateiname'); });
  mitOrdner((o) => { baueRelease(o, '5.60.0', { ohne: ['blockmap'] }); assert.ok(releasePruefen(o, '5.60.0').some((f) => f.includes('.blockmap fehlt'))); });
  mitOrdner((o) => { baueRelease(o, '5.60.0', { ohne: ['portable'] }); assert.ok(releasePruefen(o, '5.60.0').some((f) => f.includes('Portable.exe fehlt'))); });
  mitOrdner((o) => { baueRelease(o, '5.60.0', { ohne: ['yml'] }); assert.deepEqual(releasePruefen(o, '5.60.0'), ['latest.yml fehlt']); });
});

test('Release-Prüfung: liest die latest.yml so, wie electron-builder sie wirklich schreibt', () => {
  /* Wörtlich die Datei, die 5.59.0 gebaut hat */
  const echt = 'version: 5.59.0\nfiles:\n  - url: VANI-5.59.0-x64-Setup.exe\n    sha512: Sbn0T6iplDChD/DYMC6jgXejpIUu5H/BUZy2erDefIr4BmU9HqwyYqAlLM8Hgv2EvxNxTTUuI6uo6cqVL4vEyQ==\n    size: 145280100\npath: VANI-5.59.0-x64-Setup.exe\nsha512: Sbn0T6iplDChD/DYMC6jgXejpIUu5H/BUZy2erDefIr4BmU9HqwyYqAlLM8Hgv2EvxNxTTUuI6uo6cqVL4vEyQ==\nreleaseDate: \'2026-08-30T01:02:31.085Z\'\n';
  const y = latestYmlLesen(echt);
  assert.equal(y.version, '5.59.0');
  assert.equal(y.path, 'VANI-5.59.0-x64-Setup.exe');
  assert.equal(y.size, 145280100);
  assert.equal(y.sha512.length, 88);
});

test('Release-Notizen: nennen die Dateien dieser Version und warnen vor der Windows-Meldung', () => {
  const n = releaseNotizen('5.60.0');
  assert.ok(n.includes('VANI-5.60.0-x64-Setup.exe') && n.includes('VANI-5.60.0-x64-Portable.exe'));
  assert.ok(n.includes('Trotzdem ausführen'), 'der Weg an SmartScreen vorbei');
  assert.ok(!/undefined|null|\$\{/.test(n), 'kein leerer Platzhalter');
  assert.throws(() => releaseNotizen(''));
  assert.throws(() => releaseNotizen('v5.60'));
});

test('Workflow: eine neue Version pushen genügt — geprüft, gebaut, erst dann veröffentlicht', () => {
  const wf = lies('.github/workflows/desktop-release.yml');
  assert.match(wf, /push:\s*\n\s*branches:\s*\[main\]/, 'läuft beim Push auf main');
  assert.match(wf, /-\s*package\.json/, 'sobald sich die Versionsnummer ändern kann');
  assert.match(wf, /workflow_dispatch/, 'und lässt sich von Hand anstoßen');
  assert.doesNotMatch(wf, /tags:/, 'nicht mehr nur bei Tags — die gab es nie');
  assert.match(wf, /contents:\s*write/);
  assert.match(wf, /gh release view "v\$version"/, 'ein vorhandenes Release wird nicht noch einmal gebaut');
  let zuletzt = -1;
  for (const schritt of ['npm ci', 'npm test', 'desktop:win', 'release-pruefen.mjs', 'gh release create', 'gh release edit']) {
    const i = wf.indexOf(schritt);
    assert.ok(i > zuletzt, schritt + ' steht an der richtigen Stelle');
    zuletzt = i;
  }
  assert.match(wf, /gh release create[^\n]*--draft/, 'erst als Entwurf');
  assert.match(wf, /--draft=false --latest/, 'dann veröffentlicht und als neueste markiert');
  for (const datei of ['-x64-Setup.exe"', '-x64-Setup.exe.blockmap"', '-x64-Portable.exe"', 'release/latest.yml']) {
    assert.ok(wf.includes(datei), datei + ' wird hochgeladen');
  }
});

test('Desktop-Icon: ein fertiges .ico, damit der Bau nichts umwandeln muss', () => {
  /* Aus dem PNG ein .ico zu machen, übernahm electron-builder mit einem
     WebAssembly-Werkzeug (libvips). Das bekam auf dem Laptop plötzlich keinen
     Speicher mehr — „WebAssembly.Memory(): could not allocate memory“ —, und
     der ganze Bau stand, obwohl er am Tag davor noch lief. Mit einem fertigen
     .ico wird dieser Schritt übersprungen, hier wie bei GitHub. */
  const build = JSON.parse(lies('package.json')).build;
  assert.equal(build.win.icon, 'icons/icon.ico');
  const ico = readFileSync(join(wurzel, build.win.icon));
  assert.equal(ico.readUInt16LE(0), 0, 'reservierte Null am Anfang');
  assert.equal(ico.readUInt16LE(2), 1, 'Typ 1 heißt Icon');
  const groessen = [];
  for (let i = 0; i < ico.readUInt16LE(4); i++) {
    const o = 6 + i * 16, laenge = ico.readUInt32LE(o + 8), ab = ico.readUInt32LE(o + 12);
    assert.ok(ab + laenge <= ico.length, 'kein Eintrag reicht über das Dateiende');
    groessen.push(ico[o] || 256);
  }
  for (const g of [16, 32, 48, 256]) assert.ok(groessen.includes(g), g + 'er fehlt — Taskleiste, Explorer und Startmenü brauchen verschiedene Größen');
});

test('Workflow: die Desktop-App sucht genau dort, wo der Workflow veröffentlicht', () => {
  const config = JSON.parse(lies('desktop/config.json'));
  assert.equal(config.updateUrl, 'https://github.com/thekeveldikev/vani/releases/latest/download');
  assert.equal(JSON.parse(lies('package.json')).build.publish[0].url, config.updateUrl);
});
