/* Ein Gerät tritt einem Bereich bei (31-sync.js) — mit echtem Sync-Dienst,
   echtem Client-Code und echtem Yjs.

   Festgehalten wird hier ein Fehler, der auf einem echten Laptop auffiel: frisch
   verbunden, und trotzdem stand dort kein einziger Text. Fünf Dinge griffen
   ineinander, alle mit genau diesem Aufbau nachgestellt:

     · Jeder Start schickte den kompletten Stand noch einmal, mit neuer
       Kennung. Der Dienst hob jede Kopie auf — 150 Texte (6 MB) lagen nach
       vier Starts mit 29,7 MB auf dem Server.
     · Zwei offene Geräte schickten sich die Einstellungen endlos hin und her,
       ohne dass jemand etwas änderte: zwei neue Pakete alle 0,7 Sekunden.
     · Ein großer Bestand ging als EIN Paket hinaus, größer, als der Dienst
       annimmt. Er wies es jedes Mal ab, alles dahinter blieb liegen — und
       beide Geräte zeigten „live verbunden“.
     · Ein neues Gerät holte bis zu 200 Pakete in einer Antwort und hatte dafür
       15 Sekunden. Brach das ab, fing es wieder bei null an: bei 10 Mbit/s
       kamen 0 von 150 Texten an.
     · Direkt nach dem Verbinden stand trotzdem „live verbunden“ da. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { webcrypto } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import * as Y from 'yjs';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';
import { erzeugeSyncDienst } from '../sync-server/server.mjs';

let server, basis, temp, dbPfad;
before(async () => {
  temp = mkdtempSync(join(tmpdir(), 'vani-beitritt-'));
  dbPfad = join(temp, 'sync.sqlite');
  server = erzeugeSyncDienst({ datenbankPfad: dbPfad, statikWurzel: join(import.meta.dirname, '..') });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  basis = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (server) await new Promise((r) => server.close(r));
  rmSync(temp, { recursive: true, force: true });
});

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/* Die lokale Yjs-Ablage, wie y-indexeddb sie führt: Was ein Gerät einmal
   hatte, liegt beim nächsten Start wieder im Dokument, bevor „synced“ kommt. */
function ablageIn(speicher) {
  return class Ablage {
    constructor(name, doc) {
      this.doc = doc;
      if (speicher.has(name)) Y.applyUpdate(doc, speicher.get(name), this);
      this.merke = (update) => speicher.set(name, speicher.has(name) ? Y.mergeUpdates([speicher.get(name), update]) : update);
      doc.on('update', this.merke);
    }
    once(ereignis, fn) { if (ereignis === 'synced') setTimeout(fn, 0); }
    destroy() { this.doc.off('update', this.merke); }
  };
}
/* Eine Ablage, die nichts behält — so sieht es aus, wenn der Browser die
   lokale Kopie des Bereichs verworfen hat. */
class VergesslicheAblage { once(ereignis, fn) { if (ereignis === 'synced') setTimeout(fn, 0); } destroy() {} }

/* Ein Gerät. `abbrechen(n)` entscheidet für die n-te Hol-Anfrage, ob die
   Leitung gerade abreißt. */
async function geraet({ abbrechen, vergesslich = false, abweisen } = {}) {
  const k = baueSandkasten();
  await k.ladeAlles(); await mikrotasksLeeren();
  k.VaniY = { Y, IndexeddbPersistence: vergesslich ? VergesslicheAblage : ablageIn(new Map()) };
  k.navigator.onLine = true;
  k.document.visibilityState = 'visible';
  k.AbortController = AbortController;
  const log = { holen: 0, abgebrochen: 0, groessteSeite: 0 };
  k.fetch = async (url, opt = {}) => {
    if (abweisen && opt.method === 'POST' && /\/updates$/.test(url) && abweisen(JSON.parse(opt.body))) {
      return new Response(JSON.stringify({ fehler: 'ungueltiges_update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if ((opt.method || 'GET') === 'GET' && /\/updates\?/.test(url)) {
      log.holen++;
      log.groessteSeite = Math.max(log.groessteSeite, Number(new URL(url).searchParams.get('limit')));
      if (abbrechen && abbrechen(log.holen)) { log.abgebrochen++; throw new DOMException('Leitung abgerissen', 'AbortError'); }
    }
    const { signal, ...rest } = opt;
    return fetch(url, rest);
  };
  /* Kein Zeitgeber im Hintergrund — die Prüfungen gleichen selbst ab. */
  vm.runInContext('syncPlanePoll = function () {}; syncPlaneWiederanlauf = function () {};', k);
  return { k, log, s: (code) => vm.runInContext(code, k) };
}

function fuelleBestand(k, anzahl, vorsilbe = 'szene') {
  const satz = 'Sie stand am Fenster und sah dem Regen zu, der die Gasse in einen Fluss aus Licht verwandelte. ';
  for (let i = 0; i < anzahl; i++) {
    const text = satz.repeat(40) + vorsilbe + ' ' + i;
    const staende = Array.from({ length: 6 }, (_, j) => ({ wann: Date.now() - j * 900000, titel: vorsilbe + ' ' + i, text, auto: true }));
    const d = k.sauberesDokument({ id: vorsilbe + '-' + i, typ: 'blatt', titel: vorsilbe + ' ' + i, text, rich: '<p>' + text + '</p>', format: 'rich', staende, angelegt: 1, geaendert: 1 });
    k.D.docs.set(d.id, d);
  }
}

/* Die Worte der Sync-Karte stehen in 49-feinheiten.js, das der Sandkasten nicht
   lädt. Genau diese beiden Funktionen kommen dazu — mit zaehl() aus dem Kern. */
function karteLaden(k) {
  const quelle = readFileSync(join(import.meta.dirname, '..', 'src', '49-feinheiten.js'), 'utf8');
  for (const name of ['syncStatusWorte', 'syncZahlenText']) {
    const stelle = quelle.match(new RegExp('function ' + name + '\\([\\s\\S]*?\\n\\}'));
    assert.ok(stelle, name + ' steht in 49-feinheiten.js');
    vm.runInContext(stelle[0], k);
  }
  return k;
}

let nummer = 0;
async function neuerBereich() {
  nummer++;
  const vault = ('Bereich' + nummer).padEnd(24, 'x');
  const c = { v: 1, name: 'Test', server: basis, vault, token: 't'.repeat(48), key: Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('base64url') };
  const r = await fetch(basis + '/v1/vaults', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vaultId: vault, token: c.token }) });
  assert.equal(r.status, 201);
  return c;
}

function serverStand(vault) {
  const db = new DatabaseSync(dbPfad, { readOnly: true });
  try {
    return db.prepare('SELECT COUNT(*) AS pakete, COALESCE(SUM(LENGTH(ciphertext)), 0) AS bytes, COALESCE(MAX(LENGTH(ciphertext)), 0) AS groesstes FROM updates WHERE vault_id = ?').get(vault);
  } finally { db.close(); }
}

/* Bis die Warteschlange eines Geräts wirklich leer ist. */
async function fertigGesendet(g) {
  for (let i = 0; i < 300; i++) {
    const offen = (await g.k.dbAlle('sync-pending')).length;
    if (!offen && !g.s('_sync.sendet') && !g.s('_sync.merkenOffen')) return;
    await g.k.syncSendeWartend();
    await warte(20);
  }
  throw new Error('Die Warteschlange leert sich nicht');
}

/* Ein iPad, das einen Bereich mit seinem Bestand anlegt. */
async function ipadMitBereich(anzahl) {
  const c = await neuerBereich();
  const ipad = await geraet();
  fuelleBestand(ipad.k, anzahl);
  await ipad.k.syncStarte(c, 'erstellen');
  await fertigGesendet(ipad);
  return { c, ipad };
}

test('Der erste Abgleich geht in Portionen hinaus, nicht als ein riesiges Paket', async () => {
  const { c, ipad } = await ipadMitBereich(60);
  const stand = serverStand(c.vault);
  ipad.k.syncStoppe();
  assert.ok(stand.pakete >= 3, 'mehrere Portionen statt eines Blocks (' + stand.pakete + ')');
  assert.ok(stand.groesstes < 1.2 * 1048576, 'kein Paket wird riesig: ' + stand.groesstes + ' Zeichen');
});

test('Neustarts schicken den Bestand nicht jedes Mal noch einmal', async () => {
  const { c, ipad } = await ipadMitBereich(60);
  const nachAnlegen = serverStand(c.vault);
  for (let i = 0; i < 3; i++) {
    ipad.k.syncStoppe();
    await ipad.k.syncStarte(c, 'start');
    await fertigGesendet(ipad);
  }
  const nachStarts = serverStand(c.vault);
  ipad.k.syncStoppe();
  assert.equal(nachStarts.pakete, nachAnlegen.pakete, 'drei Neustarts, kein zusätzliches Paket');
  assert.equal(nachStarts.bytes, nachAnlegen.bytes);
});

test('Verwirft der Browser die lokale Kopie, holt das Gerät neu, statt alles noch einmal zu schicken', async () => {
  const c = await neuerBereich();
  const ipad = await geraet({ vergesslich: true });
  fuelleBestand(ipad.k, 30);
  await ipad.k.syncStarte(c, 'erstellen');
  await fertigGesendet(ipad);
  const nachAnlegen = serverStand(c.vault);
  for (let i = 0; i < 3; i++) {
    ipad.k.syncStoppe();
    await ipad.k.syncStarte(c, 'start');
    await fertigGesendet(ipad);
  }
  const nachStarts = serverStand(c.vault);
  assert.equal(ipad.k.D.docs.size, 30, 'kein Text ist verschwunden');
  assert.equal(ipad.s('_sync.status.art'), 'synchron');
  ipad.k.syncStoppe();
  assert.equal(nachStarts.pakete, nachAnlegen.pakete, 'kein zusätzliches Paket');
});

test('Zwei offene Geräte schicken sich die Einstellungen nicht endlos hin und her', async () => {
  const { c, ipad } = await ipadMitBereich(3);
  const laptop = await geraet();
  await laptop.k.syncStarte(c, 'ersetzen');
  const runde = async () => {
    await warte(700);
    await ipad.k.syncJetzt(); await laptop.k.syncJetzt();
    await fertigGesendet(ipad); await fertigGesendet(laptop);
  };
  for (let i = 0; i < 2; i++) await runde();
  const ruhig = serverStand(c.vault).pakete;
  for (let i = 0; i < 5; i++) await runde();
  assert.equal(serverStand(c.vault).pakete, ruhig, 'nichts Neues geschrieben, also kein neues Paket');

  laptop.s('D.einst.groesse = 22; speichereEinst()');
  for (let i = 0; i < 3; i++) await runde();
  assert.equal(ipad.s('D.einst.groesse'), 22, 'eine echte Änderung kommt drüben an');
  assert.equal(serverStand(c.vault).pakete, ruhig + 1, 'als genau ein Paket');

  laptop.s('D.einst.groesse = 19; speichereEinst()');
  for (let i = 0; i < 3; i++) await runde();
  assert.equal(ipad.s('D.einst.groesse'), 19, 'auch das Zurückstellen kommt an');
  ipad.k.syncStoppe(); laptop.k.syncStoppe();
});

test('Eine echte Änderung nach einem Neustart geht trotzdem hinaus', async () => {
  const { c, ipad } = await ipadMitBereich(10);
  ipad.k.syncStoppe();
  await ipad.k.syncStarte(c, 'start');
  const vorher = serverStand(c.vault).pakete;
  const d = ipad.k.D.docs.get('szene-3');
  d.text += ' Ein neuer Satz nach dem Neustart.';
  ipad.k.syncDokumentGeaendert(d);
  await fertigGesendet(ipad);
  ipad.k.syncStoppe();
  assert.ok(serverStand(c.vault).pakete > vorher, 'die Änderung ist auf dem Dienst');

  const laptop = await geraet();
  await laptop.k.syncStarte(c, 'ersetzen');
  await warte(200);
  assert.ok(laptop.k.D.docs.get('szene-3').text.endsWith('Ein neuer Satz nach dem Neustart.'), 'und kommt auf dem anderen Gerät an');
  laptop.k.syncStoppe();
});

test('Ein neues Gerät bekommt alles, auch wenn die Leitung zwischendurch abreißt', async () => {
  const { c, ipad } = await ipadMitBereich(60);
  ipad.k.syncStoppe();
  const laptop = await geraet({ abbrechen: (n) => n % 2 === 0 });
  laptop.s('_sync.seite = 2');
  await laptop.k.syncStarte(c, 'ersetzen');
  for (let i = 0; i < 80 && laptop.s('_sync.status.art') !== 'synchron'; i++) await laptop.k.syncJetzt();
  await warte(250);
  assert.ok(laptop.log.abgebrochen > 0, 'die Leitung ist wirklich abgerissen');
  assert.equal(laptop.k.D.docs.size, 60, 'alle Texte sind da');
  assert.equal(laptop.s('_sync.status.art'), 'synchron');
  laptop.k.syncStoppe();
});

test('Nie mehr als 200 Pakete auf einmal, und nach einem Abbruch deutlich weniger', async () => {
  const k = baueSandkasten();
  assert.equal(k.syncSeitenGroesse(20, 0, true), 5, 'Abbruch: ein Viertel');
  assert.equal(k.syncSeitenGroesse(1, 0, true), 1, 'nie weniger als eins');
  assert.equal(k.syncSeitenGroesse(20, 100, false), 40, 'kleine Antwort: doppelt so viele');
  assert.equal(k.syncSeitenGroesse(150, 100, false), 200, 'höchstens 200');
  assert.equal(k.syncSeitenGroesse(20, 6 * 1048576, false), 10, 'große Antwort: halb so viele');
  assert.equal(k.syncSeitenGroesse(20, 1048576, false), 20, 'dazwischen: bleibt');
});

test('Solange nicht alles da ist, räumt „ersetzen“ nichts weg und sagt nicht „live verbunden“', async () => {
  const { c, ipad } = await ipadMitBereich(20);
  ipad.k.syncStoppe();
  let netz = false;
  const laptop = await geraet({ abbrechen: () => !netz });
  fuelleBestand(laptop.k, 3, 'eigen');
  await laptop.k.syncStarte(c, 'ersetzen');
  assert.equal(laptop.k.D.docs.size, 3, 'der eigene Bestand bleibt, solange der neue nicht sicher da ist');
  assert.notEqual(laptop.s('_sync.status.art'), 'synchron', 'kein „live verbunden“ ohne Bestand');

  netz = true;
  for (let i = 0; i < 20 && laptop.s('_sync.status.art') !== 'synchron'; i++) await laptop.k.syncJetzt();
  await warte(250);
  assert.equal(laptop.k.D.docs.size, 20, 'jetzt ist ersetzt');
  assert.ok(![...laptop.k.D.docs.keys()].some((id) => id.startsWith('eigen-')), 'und erst jetzt ist der alte Bestand weg');
  laptop.k.syncStoppe();
});

test('Zeit richtet sich nach der Arbeit, und ein Bestand wird in Portionen geteilt', async () => {
  const k = baueSandkasten();
  assert.equal(k.syncZeitFuer(0), 15000, 'eine kleine Anfrage wie bisher');
  assert.ok(k.syncZeitFuer(10 * 1048576) >= 8 * 60000, '10 MB bekommen Minuten, nicht 15 Sekunden');
  assert.equal(k.syncZeitFuer(1e12), 15 * 60000, 'aber nie endlos');

  const docs = Array.from({ length: 10 }, (_, i) => ({ id: 'd' + i, text: 'x'.repeat(100000) }));
  const portionen = k.syncSeedPortionen(docs, 250000);
  assert.ok(portionen.length >= 4, 'geteilt: ' + portionen.length);
  assert.equal(JSON.stringify(portionen.flat().map((d) => d.id)), JSON.stringify(docs.map((d) => d.id)), 'nichts geht verloren, die Reihenfolge bleibt');
  assert.equal(k.syncSeedPortionen([{ id: 'riesig', text: 'x'.repeat(900000) }], 250000).length, 1, 'ein schweres Dokument ist seine eigene Portion');
  assert.equal(k.syncSeedPortionen([]).length, 0);
});

test('Große Pakete reisen in Teilen und setzen sich drüben wieder zusammen', () => {
  const k = baueSandkasten();
  const gross = new Uint8Array(Math.round(2.5 * 1048576));
  for (let i = 0; i < gross.length; i++) gross[i] = (i * 31) % 251;
  const teile = k.syncTeileBauen(gross, undefined, 1048576);
  assert.equal(teile.length, 3);
  assert.ok(teile.every((t) => t.length <= 1048576 + 32), 'kein Teil größer als ein Megabyte und Kopf');
  const gelesen = teile.map((t) => k.syncTeilLesen(t));
  assert.equal(JSON.stringify(gelesen.map((t) => [t.index, t.gesamt])), '[[0,3],[1,3],[2,3]]');
  assert.equal(new Set(gelesen.map((t) => t.gruppe)).size, 1, 'alle gehören zusammen');
  const zusammen = Buffer.concat(gelesen.map((t) => Buffer.from(t.daten.buffer, t.daten.byteOffset, t.daten.byteLength)));
  assert.ok(zusammen.equals(Buffer.from(gross)), 'zusammengesetzt ist es wieder genau das Ganze');
  const doc = new Y.Doc();
  doc.getText('t').insert(0, 'Ein ganz gewöhnliches Update.');
  assert.equal(k.syncTeilLesen(Y.encodeStateAsUpdate(doc)), null, 'ein gewöhnliches Update ist kein Teil');
  assert.equal(k.syncTeilLesen(new Uint8Array(10)), null);
});

test('Ein zu großes Paket aus einer älteren Fassung hält nichts mehr auf und reist nur einmal', async () => {
  const c = await neuerBereich();
  const ipad = await geraet();
  fuelleBestand(ipad.k, 90);
  ipad.k.navigator.onLine = false;
  await ipad.k.syncStarte(c, 'erstellen');
  for (let i = 0; i < 300 && ipad.s('_sync.merkenOffen'); i++) await warte(10);
  /* So lag es mit 5.60.0 in der Warteschlange: der ganze Stand als EIN Paket,
     nach zwei Starts zweimal — und keines ging je hinaus. */
  for (const p of await ipad.k.dbAlle('sync-pending')) await ipad.k.dbDel('sync-pending', p.vault + ':' + p.id);
  await ipad.k.dbDel('kv', 'sync-sv:' + c.vault);
  const ganz = Y.encodeStateAsUpdate(ipad.s('_sync.ydoc'));
  let alt = 0;
  for (let i = 0; i < 2; i++) {
    const p = await ipad.k.syncVerschluessle(ganz);
    await ipad.s('dbPut')('sync-pending', p, p.vault + ':' + p.id);
    alt = p.ciphertext.length;
  }
  assert.ok(alt > ipad.s('SYNC_PAKET_ZEICHEN_MAX'), 'das alte Paket ist wirklich zu groß (' + alt + ')');

  ipad.k.syncStoppe();
  ipad.k.navigator.onLine = true;
  await ipad.k.syncStarte(c, 'start');
  await fertigGesendet(ipad);
  await ipad.k.syncJetzt();
  const stand = serverStand(c.vault);
  assert.equal((await ipad.k.dbAlle('sync-pending')).length, 0, 'die Warteschlange ist leer');
  assert.equal(ipad.s('_sync.status.art'), 'synchron');
  assert.ok(stand.groesstes <= ipad.s('SYNC_PAKET_ZEICHEN_MAX'), 'kein Paket über der Grenze: ' + stand.groesstes);
  assert.ok(stand.bytes < 1.5 * alt, 'zwei alte Kopien reisen als eine: ' + stand.bytes + ' statt ' + 2 * alt);
  ipad.k.syncStoppe();

  const laptop = await geraet({ abbrechen: (n) => n % 3 === 0 });
  laptop.s('_sync.seite = 1');
  await laptop.k.syncStarte(c, 'ersetzen');
  /* Mitten im Holen neu gestartet: die ersten Teile müssen noch da sein. */
  laptop.k.syncStoppe();
  await laptop.k.syncStarte(c, 'ersetzen');
  for (let i = 0; i < 200 && laptop.s('_sync.status.art') !== 'synchron'; i++) await laptop.k.syncJetzt();
  await warte(250);
  assert.ok(laptop.log.abgebrochen > 0, 'die Leitung ist wirklich abgerissen');
  assert.equal(laptop.k.D.docs.size, 90, 'alle Texte sind drüben');
  const reste = (await laptop.s("dbTu('kv', 'readonly', (s) => s.getAllKeys())")).filter((k) => String(k).startsWith('sync-teile:'));
  assert.equal(reste.length, 0, 'keine Teile bleiben liegen');
  laptop.k.syncStoppe();
});

test('Weist der Dienst ein Paket ab, gehen die anderen trotzdem hinaus — und dort steht nicht „live verbunden“', async () => {
  const sperre = new Set();
  const c = await neuerBereich();
  const ipad = await geraet({ abweisen: (body) => sperre.has(body.id) });
  fuelleBestand(ipad.k, 3);
  await ipad.k.syncStarte(c, 'erstellen');
  await fertigGesendet(ipad);
  const vorher = serverStand(c.vault).pakete;

  ipad.k.navigator.onLine = false;
  for (const id of ['szene-0', 'szene-1']) {
    const d = ipad.k.D.docs.get(id);
    d.text += ' Noch ein Satz.';
    ipad.k.syncDokumentGeaendert(d);
    await ipad.s('_sync.merken');
  }
  const wartend = await ipad.k.dbAlle('sync-pending');
  assert.equal(wartend.length, 2);
  sperre.add(wartend[0].id);
  ipad.k.navigator.onLine = true;
  await ipad.k.syncJetzt();
  assert.equal(serverStand(c.vault).pakete, vorher + 1, 'das andere Paket ist trotzdem angekommen');
  assert.equal(ipad.s('_sync.status.art'), 'fehler', 'kein „live verbunden“, solange etwas hängt');
  assert.equal(ipad.k.syncInfo().wartend, 1);
  assert.match(karteLaden(ipad.k).syncStatusWorte(ipad.k.syncInfo().status)[1], /ein Paket abgewiesen/);

  sperre.clear();
  await ipad.k.syncJetzt();
  assert.equal(serverStand(c.vault).pakete, vorher + 2);
  assert.equal(ipad.s('_sync.status.art'), 'synchron');
  assert.equal(ipad.k.syncInfo().wartend, 0);
  ipad.k.syncStoppe();
});

test('Die Karte sagt auf Deutsch, was gerade hinausgeht und wo es hängt', () => {
  const k = karteLaden(baueSandkasten());
  assert.match(k.syncStatusWorte({ art: 'sendet', rest: 1 })[1], /noch ein Paket\./);
  assert.match(k.syncStatusWorte({ art: 'sendet', rest: 12 })[1], /noch 12 Pakete\./);
  assert.match(k.syncStatusWorte({ art: 'fehler', abgewiesen: 2 })[1], /hat 2 Pakete abgewiesen/);
  assert.equal(k.syncZahlenText({ verbunden: true, hier: 1, imBereich: 0, wartend: 0 }), 'Auf diesem Gerät: 1 Eintrag · im Bereich: 0');
  assert.equal(k.syncZahlenText({ verbunden: true, hier: 152, imBereich: 1520, wartend: 1 }), 'Auf diesem Gerät: 152 Einträge · im Bereich: 1.520 · noch zu senden: 1 Paket');
  assert.equal(k.syncZahlenText({ verbunden: false }), '');
});
