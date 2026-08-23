/* Die Kenntnis (56e), das Gespräch (56f) und das Mehr (56g): die puren Teile. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';
const deep = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }

const TEXT = 'Das Mädchen heißt Val. Val fühlt sich sehr normal. Sie redet sich ein, dass es nicht an ihr liegt. Nicky Wilholm lachte, als Val ihn ansah. „Komm mit nach Westchester", sagte Nicky. Val nickte. Später saßen Val und Nicky in der Küche. Nicky seufzte. Vals Heft lag auf dem Tisch. Das Mädchen schwieg. In Westchester regnete es. Val schüttelte den Kopf und ging nach Hause.';

test('Kenntnis: Figuren, Orte, Sätze aus eigenen Texten — ohne Wörterbuch', async () => {
  const k = await frisch();
  const docs = new Map();
  docs.set('h1', { id: 'h1', typ: 'heft', titel: 'Perfektion' });
  docs.set('s1', { id: 's1', typ: 'seite', parent: 'h1', titel: 'Eins', text: TEXT, angelegt: 1000, geaendert: 2000 });
  docs.set('b1', { id: 'b1', typ: 'blatt', titel: 'Notiz', text: 'Ein Blatt über Val. Val schreibt jeden Abend.', angelegt: 3000, geaendert: 4000 });
  docs.set('x', { id: 'x', typ: 'wortkiste', titel: 'Kiste' });
  const kk = k.kenntnisSammeln(docs, { statsTage: { '2026-08-20': 100, '2026-08-21': 0 } });
  assert.equal(kk.texte, 2); assert.ok(kk.woerter > 50);
  deep(kk.werke.map((w) => w.name), ['Perfektion', 'Notiz']);
  const namen = kk.figuren.map((f) => f.name);
  assert.ok(namen.includes('Val') && namen.includes('Nicky'), 'Val und Nicky sind Figuren: ' + namen.join());
  assert.ok(!namen.includes('Das') && !namen.includes('Sie') && !namen.includes('Mädchen') && !namen.includes('Küche') && !namen.includes('Hause'), 'keine Stoppwörter, Artikel-Nomen oder Orte: ' + namen.join());
  const val = kk.figuren.find((f) => f.name === 'Val');
  assert.ok(val.n >= 6, 'Val zählt auch den Genitiv: ' + val.n);
  assert.ok(val.begleiter.some((b) => b.name === 'Nicky'), 'Nicky begleitet Val');
  assert.equal(val.werke.length, 2, 'Val in beiden Werken');
  assert.ok(val.erster && val.erster.satz.includes('Val'));
  assert.ok(kk.orte.some((o) => o.name === 'Westchester'), 'Westchester ist ein Ort: ' + kk.orte.map((o) => o.name).join());
  assert.ok(!kk.figuren.some((f) => f.name === 'Westchester'));
  assert.equal(kk.zeit.schreibtage, 1);
  assert.ok(kk.saetze.length > 0 && kk.saetze.every((s) => s.werk && s.id));
  /* Signatur ändert sich mit dem Text */
  const sig1 = k.kenntnisSignatur(docs); docs.get('b1').text += ' Noch ein Satz.'; docs.get('b1').geaendert = 5000;
  assert.notEqual(sig1, k.kenntnisSignatur(docs));
  /* Fragen lesen */
  const f1 = k.kenntnisFrage(kk, 'Wer ist Val?'); assert.equal(f1.absicht, 'wer'); assert.equal(f1.wesen.name, 'Val'); assert.equal(f1.wesen.art, 'figur');
  const f2 = k.kenntnisFrage(kk, 'Zeig mir eine Stelle mit Nicky'); assert.equal(f2.absicht, 'stelle'); assert.equal(f2.wesen.name, 'Nicky'); assert.ok(f2.belege.length >= 1);
  const f3 = k.kenntnisFrage(kk, 'Wie viele Wörter habe ich?'); assert.equal(f3.absicht, 'zahl'); assert.equal(f3.wesen, null);
  const f4 = k.kenntnisFrage(kk, 'Wo spielt das?'); assert.equal(f4.absicht, 'wo');
  assert.equal(k.kenntnisFrage(kk, 'Hallo, wie geht es dir?'), null, 'keine Materialfrage → null');
  /* Sätze trennen */
  deep(k.kenntnisSaetze('Er kam. „Hallo!", sagte sie. Dann ging er… Und?'), ['Er kam.', '„Hallo!", sagte sie.', 'Dann ging er…', 'Und?']);
  const leer = k.kenntnisSammeln(new Map(), {}); assert.ok(leer.leer && leer.texte === 0);
});

test('Gespräch: jede Stimme antwortet in ihrer Sprache, deutsche Fassung parallel, Belege dabei', async () => {
  const k = await frisch();
  const docs = new Map();
  docs.set('s1', { id: 's1', typ: 'blatt', titel: 'Perfektion', text: TEXT, angelegt: 1000, geaendert: 2000 });
  const kk = k.kenntnisSammeln(docs, {});
  for (const a of k.SALON_FEST) {
    assert.ok(k.GESPRAECH_STIMMEN[a.id], a.id + ' hat Gesprächsmuster');
    if (a.en) assert.ok(k.GESPRAECH_DE[a.id], a.id + ' hat deutsche Fassung');
    for (const key of ['gruss', 'figur', 'figurFrage', 'ort', 'begriff', 'satz', 'zahl', 'werke', 'wann', 'liste', 'unbekannt', 'leer']) {
      assert.ok(k.GESPRAECH_STIMMEN[a.id][key].length >= 1, a.id + ':' + key);
      if (a.en) assert.equal(k.GESPRAECH_DE[a.id][key].length, k.GESPRAECH_STIMMEN[a.id][key].length, a.id + ':' + key + ' parallel');
    }
    const frage = k.kenntnisFrage(kk, 'Wer ist Val?');
    const ant = k.gespraechAntwort(a, frage, kk, { anrede: 'Probe', saat: 7 });
    assert.equal(ant.art, 'figur');
    assert.ok(ant.text.includes('Val'), a.id + ': nennt die Figur');
    assert.ok(!/\{\w+\}/.test(ant.text), a.id + ': keine offenen Platzhalter: ' + ant.text);
    if (a.en) assert.ok(ant.de && ant.de.includes('Val') && !/\{\w+\}/.test(ant.de), a.id + ': deutsche Fassung');
    else assert.equal(ant.de, '');
    assert.ok(ant.belege.length >= 1 && ant.belege[0].id === 's1');
    const gruss = k.gespraechAntwort(a, { absicht: 'gruss' }, kk, { anrede: 'Probe', saat: 3 });
    assert.ok(gruss.text.includes('Probe') && !/\{\w+\}/.test(gruss.text), a.id + ': Gruß mit Anrede: ' + gruss.text);
    const leer = k.gespraechAntwort(a, null, { leer: true, figuren: [], orte: [], begriffe: [], werke: [], saetze: [] }, { anrede: 'Probe' });
    assert.equal(leer.art, 'leer'); assert.ok(leer.text.length > 20);
    const zahl = k.gespraechAntwort(a, { absicht: 'zahl' }, kk, { anrede: 'Probe', saat: 9 });
    assert.ok(/\d/.test(zahl.text), a.id + ': Zahlen');
  }
  /* Gleiche Saat → gleiche Antwort; englische und deutsche Fassung aus demselben Muster */
  const twain = k.SALON_FEST.find((x) => x.id === 'twain');
  const a1 = k.gespraechAntwort(twain, { absicht: 'gruss' }, kk, { anrede: 'Probe', saat: 11 }), a2 = k.gespraechAntwort(twain, { absicht: 'gruss' }, kk, { anrede: 'Probe', saat: 11 });
  assert.equal(a1.text, a2.text);
  const iEn = k.GESPRAECH_STIMMEN.twain.gruss.findIndex((m) => a1.text.startsWith(m.slice(0, 8)));
  const iDe = k.GESPRAECH_DE.twain.gruss.findIndex((m) => a1.de.startsWith(m.slice(0, 6)));
  assert.equal(iEn, iDe, 'Gruß und Übersetzung aus demselben Muster');
  assert.equal(k.gespraechListe(['a', 'b', 'c'], false), 'a, b und c');
  assert.equal(k.gespraechListe(['a', 'b'], true), 'a and b');
  assert.equal(k.gespraechListe([], false), 'noch niemand');
  assert.ok(k.gespraechKurz('eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf', 30).endsWith('…'));
  assert.equal(k.gespraechFuellen('{a} und {b}', { a: 1 }), '1 und …');
});

test('Mehr: lange Über-Texte, acht Themen, Aufgaben in Kategorien — für alle zehn Stimmen', async () => {
  const k = await frisch();
  assert.equal(k.SALON_THEMEN.length, 19);
  for (const a of k.SALON_FEST) {
    assert.ok(Array.isArray(a.ueber) && a.ueber.length >= 3 && a.ueber.join(' ').length > 900, a.name + ': langer Über-Text');
    for (const [id] of k.SALON_THEMEN) assert.ok(a.kern.some((x) => x[0] === id), a.name + ' kann zu ' + id + ' raten');
    if (a.en) assert.equal(a.de.kern.length, a.kern.length, a.name + ': de-Kern parallel');
    assert.ok(a.aufgaben.length >= 10, a.name + ': mindestens zehn Aufgaben');
    for (const au of a.aufgaben) assert.ok(au.kat && k.SALON_AUFGABEN_KATEGORIEN.includes(au.kat), a.name + ': Aufgabe mit Kategorie: ' + au.kat);
    assert.ok(new Set(a.aufgaben.map((x) => x.kat)).size >= 4, a.name + ': mehrere Kategorien');
  }
  assert.equal(k.salonThemaAusFrage('Wie finde ich einen Titel?'), 'titel');
  assert.equal(k.salonThemaAusFrage('Ich-Erzähler oder dritte Person?'), 'perspektive');
  assert.equal(k.salonAufgabeKategorie('Schreib den ersten Satz'), 'Anfänge');
  assert.equal(k.salonAufgabeKategorie('Ein Dialog zwischen zwei Leuten'), 'Dialog');
});
