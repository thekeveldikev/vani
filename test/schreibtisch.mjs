/* Der Schreibtisch und der Lesestapel: die reinen Teile — Einrichtung,
   Mondphase, Brief-Siegel, Fortschritt, Leseeinstellungen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() {
  const k = baueSandkasten();
  await k.ladeAlles();
  await mikrotasksLeeren();
  return k;
}
const roh = (x) => JSON.parse(JSON.stringify(x));

test('saubererSchreibtisch: Vorgaben, Grenzen, nur bekannte Hölzer', async () => {
  const k = await frisch();
  assert.deepEqual(roh(k.saubererSchreibtisch(undefined)), { holz: 'nuss', lampe: .8, lampeAn: true, kerzen: true, wetterFolgtKlang: true, unordnung: .7, verse: true, uhrTickt: false, wachs: 0, kerzenGewechselt: 0, kleckse: [], federKratzt: false, offenesBuch: true, blattId: null });
  const w = roh(k.saubererSchreibtisch({ holz: 'plastik', lampe: 9, kerzen: false, unordnung: -1, verse: 'ja', wachs: 99999, lampeAn: false, uhrTickt: true }));
  assert.equal(w.holz, 'nuss'); assert.equal(w.lampe, 1); assert.equal(w.kerzen, false); assert.equal(w.unordnung, 0); assert.equal(w.verse, true);
  assert.equal(w.wachs, 1200, 'Wachs endet bei zwanzig Stunden'); assert.equal(w.lampeAn, false); assert.equal(w.uhrTickt, true);
  assert.equal(roh(k.saubererSchreibtisch({ holz: 'ebenholz', lampe: .1 })).lampe, .25, 'nie ganz dunkel');
});

test('mondphase: 0 … 1, Neumond am Bezugspunkt, Vollmond eine halbe Lunation später, zyklisch', async () => {
  const k = await frisch();
  const neumond = Date.UTC(2000, 0, 6, 18, 14);
  assert.ok(Math.abs(k.mondphase(neumond)) < 1e-6);
  const halb = neumond + 29.530588853 * 86400000 / 2;
  assert.ok(Math.abs(k.mondphase(halb) - .5) < 1e-6);
  const eineLunation = neumond + 29.530588853 * 86400000;
  assert.ok(k.mondphase(eineLunation) < 1e-6 || k.mondphase(eineLunation) > .999999);
  /* Ein bekannter Vollmond: 31. Januar 2018 (Blutmond) — Phase nahe .5 */
  const p = k.mondphase(Date.UTC(2018, 0, 31, 13, 27));
  assert.ok(Math.abs(p - .5) < .03, 'Vollmond erkannt: ' + p.toFixed(3));
  for (const t of [0, 1e12, 2e12, -5e11]) { const x = k.mondphase(t); assert.ok(x >= 0 && x < 1); }
});

test('briefIstOffen: erst wenn das Datum erreicht ist', async () => {
  const k = await frisch();
  const jetzt = 1_800_000_000_000;
  assert.equal(k.briefIstOffen({ oeffnen: jetzt - 1 }, jetzt), true);
  assert.equal(k.briefIstOffen({ oeffnen: jetzt + 1 }, jetzt), false);
  assert.equal(k.briefIstOffen({ oeffnen: jetzt }, jetzt), true);
  assert.equal(k.briefIstOffen({}, jetzt), true, 'ohne Datum war er nie versiegelt');
  assert.equal(k.briefIstOffen(null, jetzt), false);
});

test('schnurSchritt: die Zugschnur federt zurück und kommt zur Ruhe', async () => {
  const k = await frisch();
  const z = { x: 80, v: 0 };
  let schritte = 0, minX = 80;
  while ((z.x !== 0 || z.v !== 0) && schritte < 2000) { k.schnurSchritt(z, 1 / 60); minX = Math.min(minX, z.x); schritte++; }
  assert.equal(z.x, 0); assert.equal(z.v, 0);
  assert.ok(schritte > 20 && schritte < 600, 'in ein paar Sekunden zur Ruhe: ' + schritte + ' Schritte');
  assert.ok(minX < 0, 'sie schwingt einmal über die Ruhelage hinaus: ' + minX.toFixed(1));
  assert.ok(minX > -80, 'aber gedämpft');
});

test('leuchterStand und Jahreszeit/Tageslicht/Himmel', async () => {
  const k = await frisch();
  assert.equal(k.leuchterStand(0), 0);
  assert.equal(k.leuchterStand(600), .5);
  assert.equal(k.leuchterStand(99999), 1);
  assert.equal(k.leuchterStand('x'), 0);
  assert.equal(k.schreibtischJahreszeit(Date.UTC(2026, 0, 15)), 'winter');
  assert.equal(k.schreibtischJahreszeit(Date.UTC(2026, 3, 15)), 'fruehling');
  assert.equal(k.schreibtischJahreszeit(Date.UTC(2026, 6, 15)), 'sommer');
  assert.equal(k.schreibtischJahreszeit(Date.UTC(2026, 9, 15)), 'herbst');
  assert.equal(k.schreibtischJahreszeit(Date.UTC(2026, 11, 15)), 'winter');
  const um = (h) => { const d = new Date(2026, 5, 10, h, 0); return d.getTime(); };
  assert.equal(k.schreibtischTageslicht(um(1)), 0, 'tiefe Nacht');
  assert.equal(k.schreibtischTageslicht(um(12)), .55, 'grauer Tag');
  assert.ok(k.schreibtischTageslicht(um(18)) < .55 && k.schreibtischTageslicht(um(18)) > .2, 'Dämmerung dazwischen');
  assert.ok(k.schreibtischTageslicht(um(5)) > 0 && k.schreibtischTageslicht(um(5)) < .3, 'erstes Grau');
  const n = roh(k.schreibtischHimmelFarben(0)), t = roh(k.schreibtischHimmelFarben(1));
  assert.equal(n.length, 3); assert.match(n[0], /^rgb\(/); assert.notDeepEqual(n, t);
  assert.equal(k.buchStatistikWorte({}), '');
});

test('buchFortschritt und saubereLeseEinstellung', async () => {
  const k = await frisch();
  assert.equal(k.buchFortschritt(0, 0), 0);
  assert.equal(k.buchFortschritt(50, 200), 25);
  assert.equal(k.buchFortschritt(999, 200), 100);
  assert.equal(k.buchFortschritt(-3, 200), 0);
  const e = roh(k.saubereLeseEinstellung({ helligkeit: 0, waerme: 2, nacht: 'ja', doppel: 'manchmal', zoom: 'riesig', blaettern: false }));
  const rest = { stimme: null, rand: false, epubSchrift: 'serif', epubGroesse: 19, epubZeile: 1.6, epubRand: 36 };
  assert.deepEqual(e, { helligkeit: .4, waerme: 1, nacht: false, doppel: 'auto', blaettern: false, zoom: 'seite', ...rest });
  assert.deepEqual(roh(k.saubereLeseEinstellung(null)), { helligkeit: 1, waerme: .15, nacht: false, doppel: 'auto', blaettern: true, zoom: 'seite', ...rest });
  assert.deepEqual(roh(k.saubereLeseEinstellung({ stimme: 'Anna', rand: true, epubSchrift: 'sans', epubGroesse: 99, epubZeile: 1, epubRand: 1 })).epubGroesse, 28);
});

test('isbnZu10 und isbnAusText: Prüfziffer, Bindestriche, Impressumszeilen', async () => {
  const k = await frisch();
  assert.equal(k.isbnZu10('978-3-608-93828-6'), '3608938281');
  assert.equal(k.isbnZu10('3791504673'), '3791504673');
  assert.equal(k.isbnZu10('9783453435773'), '345343577X');
  assert.equal(k.isbnZu10('979-10-90636-07-1'), null, '979er haben keine ISBN-10');
  assert.equal(k.isbnZu10('12345'), null);
  const t = 'Impressum\nISBN 978-3-608-93828-6 (Gebunden)\nISBN: 3-7915-0467-3\nISBN 978-3-608-93828-6';
  assert.deepEqual([...k.isbnAusText(t)], ['9783608938286', '3791504673']);
  assert.deepEqual([...k.isbnAusText('')], []);
});

test('saubererAutor: Katalogzeilen werden zu Namen', async () => {
  const k = await frisch();
  assert.equal(k.saubererAutor('Fowler, Aisling Verfasser'), 'Aisling Fowler');
  assert.equal(k.saubererAutor('Silvana de [Mari, Silvana de] Mari'), 'Silvana de Mari');
  assert.equal(k.saubererAutor('Stephen King'), 'Stephen King');
  assert.equal(k.saubererAutor('Tolkien, John R'), 'John R Tolkien');
  assert.equal(k.saubererAutor(''), '');
});

/* ----- Die nächste Welle: der Tisch lebt, EPUB, Spotlight, Stände ----- */
test('schreibtischAlter, leuchterWoche, teelichterWoche, leseSerie, saubereKleckse', async () => {
  const k = await frisch();
  assert.deepEqual(roh(k.schreibtischAlter({ a: 50000, b: 70000 })), { worte: 120000, ringe: 2, abnutzung: .48 });
  assert.equal(k.schreibtischAlter(null).ringe, 1);
  assert.equal(k.schreibtischAlter({ a: 9e6 }).ringe, 6);
  /* Mittwoch, 19. August 2026 */
  const mi = new Date(2026, 7, 19, 12).getTime();
  const tage = { '2026-08-17': 300, '2026-08-18': 0, '2026-08-19': 120, '2026-08-22': 50 };
  const w = roh(k.leuchterWoche(tage, mi));
  assert.equal(w.length, 7);
  assert.deepEqual(w.map((t) => t.tag), ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23']);
  assert.deepEqual(w.map((t) => t.brennt), [true, false, true, true, true, true, true], 'Dienstag ohne Wörter ist erloschen');
  assert.ok(w[2].heute && !w[2].zukunft && w[3].zukunft && w[0].vorbei);
  assert.deepEqual(roh(k.teelichterWoche(tage, 100, mi)).map((t) => t.erreicht), [true, false, true, false, false, false, false]);
  assert.deepEqual(roh(k.teelichterWoche(tage, 0, mi)), [], 'ohne Ziel keine Teelichter');
  const heute = new Date(2026, 7, 19, 20).getTime();
  const ls = roh(k.leseSerie([{ statistik: { '2026-08-19': 3, '2026-08-18': 2 } }, { statistik: { '2026-08-17': 1, '2026-08-19': 1 } }], heute));
  assert.equal(ls.heute, 4); assert.equal(ls.serie, 3);
  assert.equal(roh(k.leseSerie([], heute)).serie, 0);
  assert.deepEqual(roh(k.saubereKleckse([{ x: 2, y: -1, r: 99, s: 5.7 }, null, 'x'])), [{ x: 1, y: 0, r: 9, s: 6 }]);
  assert.equal(roh(k.saubereKleckse(Array.from({ length: 60 }, (_, i) => ({ x: .5, y: .5, r: 2, s: i })))).length, 40);
});

test('staendeAutomatisch: alle 15 Minuten ein stiller Stand, höchstens 20, automatische weichen zuerst', async () => {
  const k = await frisch();
  const d = { typ: 'blatt', text: 'x'.repeat(200), titel: 'T' };
  const t0 = 1000000;
  assert.equal(k.staendeAutomatisch(d, t0), true);
  assert.equal(k.staendeAutomatisch(d, t0 + 60000), false, 'zu früh');
  d.text = 'y'.repeat(200);
  assert.equal(k.staendeAutomatisch(d, t0 + 16 * 60000), true);
  assert.equal(k.staendeAutomatisch(d, t0 + 40 * 60000), false, 'unveränderter Text');
  assert.equal(k.staendeAutomatisch({ typ: 'blatt', text: 'kurz' }, t0), false);
  assert.equal(k.staendeAutomatisch({ typ: 'heft', text: 'x'.repeat(300) }, t0), false);
  const voll = { typ: 'szene', text: 'a'.repeat(200), staende: [{ wann: 1, titel: '', text: 'hand' }, ...Array.from({ length: 19 }, (_, i) => ({ wann: 2 + i, titel: '', text: 'auto' + i, auto: true }))] };
  assert.equal(k.staendeAutomatisch(voll, t0 + 1e9), true);
  assert.equal(voll.staende.length, 20);
  assert.equal(voll.staende[0].text, 'hand', 'der von Hand eingefrorene bleibt');
  assert.ok(voll.staende[voll.staende.length - 1].auto);
});

test('zipEintraege/zipLies: gespeichert und deflate, istEpub', async () => {
  const k = await frisch();
  const { deflateRawSync } = await import('node:zlib');
  const te = new TextEncoder();
  const eintraege = [['mimetype', te.encode('application/epub+zip'), 0], ['OEBPS/a.xhtml', te.encode('<html><body><p>Hallo Welt</p></body></html>'), 8]];
  const teile = [], cd = []; let off = 0;
  const le16 = (n) => [n & 255, n >> 8 & 255], le32 = (n) => [n & 255, n >> 8 & 255, n >> 16 & 255, n >>> 24 & 255];
  for (const [name, daten, methode] of eintraege) {
    const nb = te.encode(name), comp = methode === 8 ? new Uint8Array(deflateRawSync(daten)) : daten;
    const lokal = new Uint8Array([0x50, 0x4b, 3, 4, ...le16(20), ...le16(0), ...le16(methode), ...le16(0), ...le16(0), ...le32(0), ...le32(comp.length), ...le32(daten.length), ...le16(nb.length), ...le16(0), ...nb, ...comp]);
    cd.push(new Uint8Array([0x50, 0x4b, 1, 2, ...le16(20), ...le16(20), ...le16(0), ...le16(methode), ...le16(0), ...le16(0), ...le32(0), ...le32(comp.length), ...le32(daten.length), ...le16(nb.length), ...le16(0), ...le16(0), ...le16(0), ...le16(0), ...le32(0), ...le32(off), ...nb]));
    teile.push(lokal); off += lokal.length;
  }
  const cdLen = cd.reduce((a, c) => a + c.length, 0);
  const eocd = new Uint8Array([0x50, 0x4b, 5, 6, ...le16(0), ...le16(0), ...le16(cd.length), ...le16(cd.length), ...le32(cdLen), ...le32(off), ...le16(0)]);
  const alle = new Uint8Array([...teile.flatMap((t) => [...t]), ...cd.flatMap((c) => [...c]), ...eocd]);
  const bytes = alle.buffer.slice(alle.byteOffset, alle.byteOffset + alle.byteLength);
  const z = k.zipEintraege(bytes);
  assert.deepEqual([...z.keys()], ['mimetype', 'OEBPS/a.xhtml']);
  assert.equal(z.get('OEBPS/a.xhtml').methode, 8);
  assert.equal(new TextDecoder().decode(await k.zipLies(bytes, z.get('mimetype'))), 'application/epub+zip');
  if (typeof DecompressionStream !== 'undefined') {
    assert.equal(new TextDecoder().decode(await k.zipLies(bytes, z.get('OEBPS/a.xhtml'))), '<html><body><p>Hallo Welt</p></body></html>');
  }
  assert.equal(k.istEpub(bytes, 'buch.bin'), true);
  assert.equal(k.istEpub(new Uint8Array(80).buffer, 'x.pdf'), false);
  assert.equal(k.istEpub(null, 'roman.epub'), true);
  assert.throws(() => k.zipEintraege(new Uint8Array(30).buffer), /Kein ZIP/);
});

test('spotlightTreffer: Titel vor Text, Gruppenname, Grenze', async () => {
  const k = await frisch();
  const docs = [
    { id: '1', typ: 'blatt', titel: 'Der Nebel', text: 'morgens', geaendert: 5 },
    { id: '2', typ: 'schnipsel', titel: '', text: 'Im Nebel stand ein Haus', geaendert: 9 },
    { id: '3', typ: 'seite', titel: 'Regen', text: 'nichts', geaendert: 1 },
    { id: '4', typ: 'heft', titel: 'Nebelheft', text: '', geaendert: 2 }
  ];
  const t = roh(k.spotlightTreffer('nebel', docs));
  assert.equal(t.length, 3, 'Regen passt nicht');
  assert.deepEqual(t.map((x) => x.d.id), ['1', '4', '2'], 'Titeltreffer zuerst, darin jüngste zuerst, dann Texttreffer');
  assert.ok(t[2].gruppe);
  assert.deepEqual(roh(k.spotlightTreffer('n', docs)), []);
  assert.ok(k.TASTENKUERZEL.length >= 4 && k.TASTENKUERZEL[0][1].some((z) => /Spotlight/.test(z[1])));
});

test('caretZiel: der Cursor wird von unten und von oben ins Bild geholt', async () => {
  const k = await frisch();
  const halter = { top: 100, bottom: 600, height: 500, scrollTop: 400 };
  /* Cursor tief unten, hinter der Tastatur: es wird so weit gescrollt, dass er über dem Rand steht */
  assert.equal(k.caretZiel({ top: 560, bottom: 580, height: 20 }, halter), 400 + (580 - (600 - 108)));
  /* Cursor mitten im Bild: nichts tun */
  assert.equal(k.caretZiel({ top: 300, bottom: 320, height: 20 }, halter), null);
  /* Cursor zu weit oben (unter dem Kopf verborgen) */
  assert.equal(k.caretZiel({ top: 120, bottom: 140, height: 20 }, halter), 400 - ((100 + 76) - 120));
  /* Nie über den Anfang hinaus */
  assert.equal(k.caretZiel({ top: -400, bottom: -380, height: 20 }, { ...halter, scrollTop: 10 }), 0);
  /* Eigene Ränder, und bei kleinen Haltern werden sie anteilig kleiner */
  assert.equal(k.caretZiel({ top: 560, bottom: 580, height: 20 }, halter, { oben: 0, unten: 0 }), null, 'ohne Raender steht er noch im Bild');
  assert.equal(k.caretZiel({ top: 600, bottom: 620, height: 20 }, halter, { oben: 0, unten: 0 }), 400 + 620 - 600);
  const klein = { top: 0, bottom: 100, height: 100, scrollTop: 0 };
  assert.equal(k.caretZiel({ top: 90, bottom: 98, height: 8 }, klein), 98 - (100 - 40));
  /* Ohne Maß kein Ziel */
  assert.equal(k.caretZiel(null, halter), null);
  assert.equal(k.caretZiel({ top: 1, bottom: 2 }, { top: 0, bottom: 0, height: 0, scrollTop: 0 }), null);
});
