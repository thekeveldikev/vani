/* VANI — adversariale Prüfungen der Kernlogik.
   Ausführen mit:  node --test test/  */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';
import { parseWhatsApp } from '../werkzeug/faden-parser.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');

async function frisch() {
  const k = baueSandkasten();
  await k.ladeAlles();
  await mikrotasksLeeren();
  return k;
}
/* Werte aus der Sandbox-Realm in hiesige Objekte umbetten (deepEqual über Realms) */
const roh = (x) => JSON.parse(JSON.stringify(x));

/* ---------- Wörter zählen ---------- */
test('worte: Leeres, Weißraum, Umbrüche, Unicode', async () => {
  const k = await frisch();
  assert.equal(k.worte(''), 0);
  assert.equal(k.worte('   \n\t  '), 0);
  assert.equal(k.worte('ein'), 1);
  assert.equal(k.worte('ein  zwei\ndrei\t vier'), 4);
  assert.equal(k.worte('„Gänsefüßchen" — und mehr…'), 4);
  assert.equal(k.worte(null), 0);
  assert.equal(k.worte(undefined), 0);
  const gross = 'wort '.repeat(50000);
  assert.equal(k.worte(gross), 50000);
});

test('zaehleWorte: nur Zuwachs zählt, Löschen zählt nie negativ', async () => {
  const k = await frisch();
  const d = k.neuDoc('blatt', { text: '' });
  k.zaehleWorte(d.id, 'eins zwei drei');
  assert.equal(k.D.stats.tage[k.tagKey()], 3);
  k.zaehleWorte(d.id, 'eins');
  assert.equal(k.D.stats.tage[k.tagKey()], 3, 'Löschen darf den Tag nicht schrumpfen');
  k.zaehleWorte(d.id, 'eins zwei');
  assert.equal(k.D.stats.tage[k.tagKey()], 4, 'Wieder-Tippen zählt ab neuer Basis');
});

test('zaehleWorte: Doc mit vorbefülltem Text zählt beim Anlegen nicht', async () => {
  const k = await frisch();
  const d = k.neuDoc('blatt', { text: 'zehn worte '.repeat(5) });
  assert.equal(k.D.stats.tage[k.tagKey()] || 0, 0, 'Import/Verwandeln ist kein Schreiben');
  k.zaehleWorte(d.id, d.text + ' dazu');
  assert.equal(k.D.stats.tage[k.tagKey()], 1);
});

/* ---------- Strähne & Feuer ---------- */
test('straehne: heute + gestern zählen, Loch unterbricht', async () => {
  const k = await frisch();
  const tag = (vor) => { const d = new Date(); d.setDate(d.getDate() - vor); return k.tagKey(d.getTime()); };
  k.D.stats.tage = { [tag(0)]: 10, [tag(1)]: 5, [tag(2)]: 5 };
  assert.equal(k.straehne(), 3);
  k.D.stats.tage = { [tag(1)]: 5, [tag(2)]: 5 };
  assert.equal(k.straehne(), 2, 'heute noch nichts: gestrige Strähne hält');
  k.D.stats.tage = { [tag(0)]: 10, [tag(2)]: 5 };
  assert.equal(k.straehne(), 1, 'Loch gestern unterbricht');
  k.D.stats.tage = {};
  assert.equal(k.straehne(), 0);
});

test('feuerstufe: aus → glut → brennt → lodert', async () => {
  const k = await frisch();
  const tag = (vor) => { const d = new Date(); d.setDate(d.getDate() - vor); return k.tagKey(d.getTime()); };
  k.D.stats.tage = {};
  assert.equal(k.feuerstufe(), 'aus');
  k.D.stats.tage = { [tag(2)]: 40 };
  assert.equal(k.feuerstufe(), 'glut');
  k.D.stats.tage = { [tag(0)]: 40 };
  assert.equal(k.feuerstufe(), 'brennt');
  k.D.stats.tage = { [tag(0)]: 900 };
  assert.equal(k.feuerstufe(), 'lodert');
});

/* ---------- Schmücken (XSS & Verweise) ---------- */
test('schmuecke: HTML wird immer entschärft', async () => {
  const k = await frisch();
  const böse = '<script>alert(1)</script> <img src=x onerror=alert(1)>';
  const raus = k.schmuecke(böse);
  assert.ok(!raus.includes('<script'), 'kein rohes script');
  assert.ok(!raus.includes('<img'), 'kein rohes img');
  assert.ok(raus.includes('&lt;script&gt;'));
});

test('schmuecke: Verweis-Titel mit Anführungszeichen bricht kein Attribut', async () => {
  const k = await frisch();
  const raus = k.schmuecke('siehe [[Titel" onmouseover="x]]');
  assert.ok(raus.includes('data-ziel="Titel&quot; onmouseover=&quot;x"'), raus);
  assert.ok(!/data-ziel="[^"]*" onmouseover/.test(raus), 'Attribut bleibt zu: ' + raus);
  assert.ok(!raus.includes('&amp;quot;'), 'nicht doppelt kodiert: ' + raus);
});

test('schmuecke: Klammern und Schlagworte', async () => {
  const k = await frisch();
  assert.ok(k.schmuecke('[[Sturmnacht]]').includes('class="verweis"'));
  assert.ok(!k.schmuecke('[[' + 'x'.repeat(120) + ']]').includes('class="verweis"'), 'überlange Titel sind keine Verweise');
  assert.ok(k.schmuecke('#ideen').includes('class="schlagwort"'));
  assert.ok(k.schmuecke('Träume #später-vielleicht').includes('schlagwort'));
  assert.ok(!k.schmuecke('nummer#7').includes('schlagwort'), 'mitten im Wort kein Schlagwort');
});

/* ---------- Suche ---------- */
test('normalisiere: Umlaute, ß, Groß/Klein', async () => {
  const k = await frisch();
  assert.equal(k.normalisiere('Hütte'), 'hutte');
  assert.equal(k.normalisiere('STRAßE'), k.normalisiere('Strasse'));
  assert.equal(k.normalisiere('Café'), 'cafe');
  assert.equal(k.normalisiere(null), '');
});

test('fastGleich: ein Tippfehler wird verziehen, zwei nicht', async () => {
  const k = await frisch();
  assert.ok(k.fastGleich('der leuchtturm brennt', 'leuchtturm'));
  assert.ok(k.fastGleich('der leuchtturm brennt', 'leuchttorm'), '1 Buchstabe daneben');
  assert.ok(!k.fastGleich('der leuchtturm brennt', 'leuchttxxm'), '2 daneben ist zu viel');
  assert.ok(!k.fastGleich('kurz', 'lang'), 'kurze Wörter nur exakt');
  assert.ok(k.fastGleich('exakt', 'exakt'));
});

/* ---------- Kluge Zeichen ---------- */
test('klugeZeichen: Gedankenstrich und deutsche Anführungszeichen', async () => {
  const k = await frisch();
  assert.deepEqual(roh(k.klugeZeichen('Wort--', 6)), { text: 'Wort–', caret: 5 });
  assert.deepEqual(roh(k.klugeZeichen('"', 1)), { text: '„', caret: 1 });
  assert.deepEqual(roh(k.klugeZeichen('Wort "', 6)), { text: 'Wort „', caret: 6 });
  assert.deepEqual(roh(k.klugeZeichen('Wort"', 5)), { text: 'Wort"', caret: 5 });
  assert.deepEqual(roh(k.klugeZeichen("sagt'", 5)), { text: 'sagt’', caret: 5 });
  assert.deepEqual(roh(k.klugeZeichen("('", 2)), { text: '(‚', caret: 2 });
  assert.equal(k.klugeZeichen('nichts zu tun', 5), null);
  assert.equal(k.klugeZeichen('', 0), null);
});

/* ---------- Papierkorb ---------- */
test('loesche: Nachfahren wandern mit in den Papierkorb und kommen zurück', async () => {
  const k = await frisch();
  const heft = k.neuDoc('heft', { titel: 'H' });
  const seite = k.neuDoc('seite', { parent: heft.id, ord: 0, text: 'x' });
  const zettel = k.neuDoc('zettel', { parent: seite.id, text: 'z', pos: {} });
  await mikrotasksLeeren();
  await k.loesche(heft.id, true);
  await mikrotasksLeeren();
  assert.ok(!k.D.docs.has(heft.id) && !k.D.docs.has(seite.id) && !k.D.docs.has(zettel.id));
  const korb = await k.dbAlle('papierkorb');
  await mikrotasksLeeren();
  assert.equal(korb.length, 1);
  assert.equal(korb[0].docs.length, 3);
  await k.holeZurueck(korb[0].id);
  await mikrotasksLeeren();
  assert.ok(k.D.docs.has(heft.id) && k.D.docs.has(seite.id) && k.D.docs.has(zettel.id));
});

test('loesche: Kanten sterben mit ihren Blasen', async () => {
  const k = await frisch();
  const brett = k.neuDoc('board', { titel: 'B' });
  const b1 = k.neuDoc('blase', { parent: brett.id, text: '1', pos: { x: 0, y: 0 } });
  const b2 = k.neuDoc('blase', { parent: brett.id, text: '2', pos: { x: 0, y: 0 } });
  const kante = k.neuDoc('kante', { parent: brett.id, von: b1.id, zu: b2.id });
  await mikrotasksLeeren();
  await k.loesche(b1.id, true);
  await mikrotasksLeeren();
  assert.ok(!k.D.docs.has(kante.id), 'Kante hängt nicht verwaist herum');
  assert.ok(k.D.docs.has(b2.id));
});

test('papierkorbLeeren(30): Junges bleibt, Altes geht', async () => {
  const k = await frisch();
  const alt = { id: 'altb', wann: Date.now() - 40 * 86400000, name: 'alt', typ: 'blatt', docs: [{ id: 'x1', typ: 'blatt' }] };
  const jung = { id: 'jungb', wann: Date.now() - 2 * 86400000, name: 'jung', typ: 'blatt', docs: [{ id: 'x2', typ: 'blatt' }] };
  await k.dbPut('papierkorb', alt);
  await k.dbPut('papierkorb', jung);
  await mikrotasksLeeren();
  await k.papierkorbLeeren(30);
  await mikrotasksLeeren();
  const rest = await k.dbAlle('papierkorb');
  await mikrotasksLeeren();
  assert.deepEqual(rest.map((b) => b.id), ['jungb']);
});

/* ---------- Sicherung ---------- */
test('pruefeSicherung: nimmt nur echte Pakete', async () => {
  const k = await frisch();
  assert.ok(k.pruefeSicherung({ vani: 1, docs: [] }));
  assert.ok(k.pruefeSicherung({ vani: 1, docs: [{ id: 'a', typ: 'blatt' }] }));
  assert.ok(k.pruefeSicherung({ vani: 2, docs: [], media: {}, sync: [] }));
  assert.ok(!k.pruefeSicherung(null));
  assert.ok(!k.pruefeSicherung({}));
  assert.ok(!k.pruefeSicherung({ vani: 3, docs: [] }));
  assert.ok(!k.pruefeSicherung({ vani: 1, docs: 'nope' }));
  assert.ok(!k.pruefeSicherung({ vani: 1, docs: [{ ohneId: true }] }));
  assert.ok(!k.pruefeSicherung({ vani: 1, docs: [null] }));
  assert.ok(!k.pruefeSicherung({ vani: 2, docs: [], media: [] }));
  assert.ok(!k.pruefeSicherung({ vani: 2, docs: [], sync: {} }));
  assert.ok(!k.pruefeSicherung({ vani: 2, docs: [{ id: 'doppelt', typ: 'blatt' }, { id: 'doppelt', typ: 'seite' }] }));
  const feldbombe = { id: 'zu-viel', typ: 'blatt' };
  for (let i = 0; i < 251; i++) feldbombe['feld' + i] = i;
  assert.ok(!k.pruefeSicherung({ vani: 2, docs: [feldbombe] }));
});

test('dataURL-Umwandlung: Bytes überleben die Rundreise', async () => {
  const k = baueSandkasten();
  const quelle = readFileSync(join(wurzel, 'src', '49-feinheiten.js'), 'utf8');
  const fn = quelle.match(/function dataURLZuBlob[\s\S]*?\n\}/)[0];
  const kontext = { atob: (s) => Buffer.from(s, 'base64').toString('binary'), Uint8Array, Blob };
  const dataURLZuBlob = new Function('atob', 'Uint8Array', 'Blob', fn + '; return dataURLZuBlob;')(kontext.atob, Uint8Array, Blob);
  const bytes = new Uint8Array([0, 1, 2, 250, 255, 128, 66]);
  const durl = 'data:image/png;base64,' + Buffer.from(bytes).toString('base64');
  const blob = dataURLZuBlob(durl);
  assert.equal(blob.type, 'image/png');
  const zurueck = new Uint8Array(await blob.arrayBuffer());
  assert.deepEqual([...zurueck], [...bytes]);
  assert.throws(() => dataURLZuBlob('data:text/html;evil;base64,PHNjcmlwdD4='));
  assert.throws(() => dataURLZuBlob('data:image/png;base64,AAA'));
  assert.throws(() => dataURLZuBlob('https://example.invalid/bild.png'));
});

/* ---------- Räume-Konfiguration ---------- */
test('raumConfig: repariert Unbekanntes und trägt Neues nach', async () => {
  const k = await frisch();
  k.D.einst.raeume = [{ id: 'kaputt', an: true }, { id: 'hefte', an: false }];
  const cfg = k.raumConfig();
  assert.ok(!cfg.some((x) => x.id === 'kaputt'));
  assert.ok(cfg.some((x) => x.id === 'zuhause'));
  assert.equal(cfg.find((x) => x.id === 'hefte').an, false, 'bestehende Wahl bleibt');
  assert.equal(cfg.find((x) => x.id === 'faden').an, false, 'Faden startet aus');
  const aktiv = k.aktiveRaeume().map((r) => r.id);
  assert.ok(aktiv.includes('zuhause'), 'Zuhause ist unabschaltbar');
  assert.ok(!aktiv.includes('hefte'));
});

/* ---------- Zeit ---------- */
test('vorZeit: Zukunft und Grenzen kippen nicht', async () => {
  const k = await frisch();
  assert.equal(k.vorZeit(Date.now() + 60000), 'gerade eben');
  assert.equal(k.vorZeit(Date.now() - 30 * 60000), 'vor 30 Minuten');
  assert.ok(k.vorZeit(Date.now() - 26 * 3600000).includes('Tag'));
  assert.ok(k.vorZeit(Date.now() - 400 * 86400000).includes('Jahr'));
});

test('funkeDesTages ist heute stabil, neuerFunke liefert immer etwas', async () => {
  const k = await frisch();
  assert.equal(k.funkeDesTages(), k.funkeDesTages());
  for (let i = 0; i < 50; i++) {
    assert.ok(k.neuerFunke(false).length > 10);
    const kombi = k.neuerFunke(true);
    assert.ok(kombi.includes('aber'), kombi);
  }
});

/* ---------- WhatsApp-Parser ---------- */
const beispiel = [
  '17.05.25, 17:55 - Nachrichten und Anrufe sind Ende-zu-Ende-verschlüsselt. Nur Personen…',
  '17.05.25, 17:55 - Du hast diese Gruppe erstellt',
  '17.05.25, 17:58 - A. Beispiel: Hi',
  '19.05.25, 13:57 - A. Beispiel: ABSTIMMUNG:',
  'Are you mad?',
  'OPTION: Ja (‎1 Stimme)',
  '',
  '20.05.25, 16:45 - A. Beispiel: Erste Zeile',
  'zweite Zeile ohne Kopf',
  'dritte Zeile',
  '05.06.25, 16:46 - A. Beispiel: ‎IMG-20231119-WA0000.jpg (Datei angehängt)',
  '22.06.25, 17:26 - A. Beispiel: ‎DOC-20250622-WA0000. (Datei angehängt)',
  '05.03.26, 18:14 - A. Beispiel: Boller-Wagen. <Diese Nachricht wurde bearbeitet.>',
  '20.08.26, 21:05 - A. Beispiel: ',
  '31.12.25, 23:59 - A. Beispiel: Silvester!'
].join('\n');

test('parseWhatsApp: Systemzeilen raus, Mehrzeiler bleiben ganz', () => {
  const n = parseWhatsApp(beispiel);
  const texte = n.map((x) => x.text);
  assert.ok(!texte.some((t) => t.includes('Ende-zu-Ende')), 'Systemzeile weg');
  assert.ok(!texte.some((t) => t.includes('Gruppe erstellt')), 'Systemzeile weg');
  assert.ok(texte.includes('Hi'));
  assert.ok(texte.some((t) => t.startsWith('ABSTIMMUNG:') && t.includes('Are you mad?')), 'Umfrage als ein Stück');
  assert.ok(texte.some((t) => t === 'Erste Zeile\nzweite Zeile ohne Kopf\ndritte Zeile'), 'Mehrzeiler zusammengeklebt');
});

test('parseWhatsApp: Medien und Leeres fallen weg, Bearbeitet-Marker verschwindet', () => {
  const n = parseWhatsApp(beispiel);
  const texte = n.map((x) => x.text);
  assert.ok(!texte.some((t) => t.includes('Datei angehängt')), 'Anhangs-Zeilen weg');
  assert.ok(!texte.some((t) => t === ''), 'Leere Nachricht weg');
  assert.ok(texte.includes('Boller-Wagen.'), 'Marker abgeschnitten: ' + JSON.stringify(texte));
});

test('parseWhatsApp: Zeitstempel stimmen aufs Jahr und die Minute', () => {
  const n = parseWhatsApp(beispiel);
  const hi = n.find((x) => x.text === 'Hi');
  const d = new Date(hi.wann);
  assert.deepEqual([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()], [2025, 4, 17, 17, 58]);
  const silvester = n.find((x) => x.text === 'Silvester!');
  assert.equal(new Date(silvester.wann).getFullYear(), 2025);
});

test('parseWhatsApp: kaputter/leerer Export explodiert nicht', () => {
  assert.deepEqual(parseWhatsApp(''), []);
  assert.deepEqual(parseWhatsApp('nur wirrer Text\nohne jeden Kopf'), []);
  assert.deepEqual(parseWhatsApp('99.99.99, 99:99 - X: kaputtes Datum ist trotzdem eine Nachricht').length, 1);
});

/* ---------- Doppel-Anlage & IDs ---------- */
test('uid: 5000 Stück ohne Kollision', async () => {
  const k = await frisch();
  const menge = new Set();
  for (let i = 0; i < 5000; i++) menge.add(k.uid());
  assert.equal(menge.size, 5000);
});

test('kinder: sortiert nach ord, Gleichstand nach Alter', async () => {
  const k = await frisch();
  const p = k.neuDoc('heft', { titel: 'H' });
  const a = k.neuDoc('seite', { parent: p.id, ord: 2 });
  const b = k.neuDoc('seite', { parent: p.id, ord: 0 });
  const c = k.neuDoc('seite', { parent: p.id, ord: 1 });
  assert.deepEqual([...k.kinder(p.id, 'seite')].map((x) => x.id), [b.id, c.id, a.id]);
});
