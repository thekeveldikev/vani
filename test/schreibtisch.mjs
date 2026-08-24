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
  assert.deepEqual(roh(k.saubererSchreibtisch(undefined)), { holz: 'nuss', lampe: .8, lampeAn: true, kerzen: true, wetterFolgtKlang: true, unordnung: .7, verse: true, zitatModus: 'gefunden', jahreszeitDeko: true, blaetterModus: 'vani', blaetter: [], uhrTickt: false, wachs: 0, kerzenGewechselt: 0, kleckse: [], federKratzt: false, offenesBuch: true, tageszeit: 'echt', jahreszeit: 'echt', blattId: null });
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
  assert.ok(k.schreibtischTageslicht(um(13)) > .95, 'heller Junitag');
  assert.ok(k.schreibtischTageslicht(um(22)) < .45 && k.schreibtischTageslicht(um(22)) > 0, 'Dämmerung nach dem Untergang (Juni 21:30)');
  assert.ok(k.schreibtischTageslicht(um(5)) > 0 && k.schreibtischTageslicht(um(5)) < .5, 'erstes Grau vor dem Aufgang');
  /* Sonnenzeiten wandern mit dem Jahr */
  const juni = k.schreibtischSonnenzeiten(new Date(2026, 5, 21).getTime()), dez = k.schreibtischSonnenzeiten(new Date(2026, 11, 21).getTime());
  assert.ok(juni.aufgang < 5.5 && juni.untergang > 21, 'Juni: lang');
  assert.ok(dez.aufgang > 7.8 && dez.untergang < 16.8, 'Dezember: kurz');
  /* Die Tageszeit-Info: Mittag hoch, Nacht nichts, feste Wahl überstimmt die Uhr */
  const mittag = k.schreibtischTageszeitInfo(um(13));
  assert.ok(mittag.sonne > .9 && mittag.phase === 'tag' && mittag.waerme < .05);
  const nacht = k.schreibtischTageszeitInfo(um(2));
  assert.ok(nacht.sonne === 0 && nacht.licht === 0 && nacht.phase === 'nacht');
  const golden = k.schreibtischTageszeitInfo(um(2), 'golden');
  assert.ok(golden.sonne > 0 && golden.sonne < .5 && golden.waerme > .3 && ['golden', 'sonnenuntergang'].includes(golden.phase), 'feste Wahl: goldene Stunde ' + JSON.stringify(golden));
  assert.ok(k.schreibtischTageszeitInfo(um(13), 'nacht').licht === 0, 'feste Wahl: Nacht am Mittag');
  const morgen = k.schreibtischTageszeitInfo(um(13), 'morgen');
  assert.ok(morgen.u > 0 && morgen.u < .2, 'Morgen liegt kurz nach dem Aufgang');
  assert.ok(k.TAGESZEIT_WAHLEN.includes('zufall') && k.JAHRESZEIT_WAHLEN.includes('winter'));
  /* Himmelsfarben: drei rgb, Tag blau, Nacht dunkel, Winter blasser, Regen grau */
  const tagH = roh(k.schreibtischHimmelFarben(mittag, 'sommer')), nachtH = roh(k.schreibtischHimmelFarben(nacht, 'sommer'));
  assert.equal(tagH.length, 3); assert.match(tagH[0], /^rgb\(/);
  const kanal = (s) => s.match(/\d+/g).map(Number);
  assert.ok(kanal(tagH[0])[2] > 150 && kanal(nachtH[0])[2] < 60, 'Tag blau, Nacht dunkel');
  assert.ok(kanal(roh(k.schreibtischHimmelFarben(mittag, 'sommer', 'regen'))[0])[2] < kanal(tagH[0])[2], 'Regen nimmt das Blau');
  const winterH = roh(k.schreibtischHimmelFarben(mittag, 'winter'));
  assert.ok(Math.abs(kanal(winterH[0])[0] - kanal(winterH[0])[2]) < Math.abs(kanal(tagH[0])[0] - kanal(tagH[0])[2]), 'Winter blasser');
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

test('Schreibfeuer: Flammenhöhe am Tagesziel, Scheite nach Tagen in Folge, Bild je Stufe', async () => {
  const k = await frisch();
  /* Ohne eigenes Ziel misst sich die Flamme an 800 Wörtern */
  assert.equal(k.feuerStaerke(0, 0), 0);
  assert.equal(k.feuerStaerke(400, 0), .5);
  assert.equal(k.feuerStaerke(4000, 0), 1, 'mehr als voll gibt es nicht');
  assert.equal(k.feuerStaerke(150, 300), .5, 'mit Ziel zählt das Ziel');
  assert.equal(k.feuerStaerke(-20, 300), 0);
  assert.equal(k.feuerStaerke('keine Zahl', 300), 0);
  /* Ein Scheit, ab zwei Tagen zwei, ab einer Woche drei */
  assert.deepEqual([0, 1, 2, 6, 7, 40].map((n) => k.feuerScheite(n)), [1, 1, 2, 2, 3, 3]);
  assert.equal(k.feuerScheite(null), 1);
  /* Das Bild trägt seine Stufe und wächst mit dem Tag */
  const aus = k.feuerBild('aus', { staerke: 0, serie: 0, id: 't1' });
  assert.match(aus, /class="feuerbild aus"/);
  assert.match(aus, /class="rauch"/, 'wenn es aus ist, steht ein Faden Rauch');
  const ziel = k.feuerBild('lodert', { staerke: 1, serie: 9, zielErreicht: true, id: 't2' });
  assert.match(ziel, /class="feuerbild lodert ziel"/);
  assert.equal((ziel.match(/class="scheit"/g) || []).length, 3, 'nach einer Woche liegen drei Scheite');
  assert.equal((k.feuerBild('brennt', { staerke: .5, serie: 0, id: 't3' }).match(/class="scheit"/g) || []).length, 1);
  /* Die Höhe der Flamme hängt an der Stärke */
  const klein = k.feuerBild('brennt', { staerke: 0, id: 't4' }).match(/scale\(([\d.]+) ([\d.]+)\)/);
  const gross = k.feuerBild('brennt', { staerke: 1, id: 't5' }).match(/scale\(([\d.]+) ([\d.]+)\)/);
  assert.ok(Number(klein[2]) < Number(gross[2]), 'volle Tage brennen höher');
  assert.ok(Number(klein[1]) < Number(gross[1]), 'und breiter');
  /* Die Farbverläufe brauchen je Bild eigene Kennungen, sonst mischen sie sich */
  assert.ok(k.feuerBild('brennt', { id: 'a' }).includes('feuera-aussen'));
  assert.ok(!k.feuerBild('brennt', { id: 'b' }).includes('feuera-aussen'));
});

test('Salon: vier Stimmen, echte Zitate mit Quelle, Rat wiederholbar und unerschöpflich', async () => {
  const k = await frisch();
  assert.equal(k.SALON_AUTOREN.length, 4);
  assert.equal(k.SALON_GAESTE.length, 2);
  assert.equal(k.SALON_FEST.length, 11);
  for (const g of k.SALON_GAESTE) { assert.ok(g.gast && g.zitate.length >= 5 && g.saetze.length >= 12 && g.kern.length >= 10 && g.foto && g.foto.lizenz, g.name + ' als Gast vollständig'); }
  /* Werke und Aufgaben bei den Hausherren */
  for (const a of k.SALON_AUTOREN) { assert.ok(a.werke.length >= 4, a.name + ' hat ein Regal'); assert.ok(a.aufgaben.length >= 5, a.name + ' stellt Aufgaben'); for (const au of a.aufgaben) assert.ok(au.t.length > 20 && typeof au.min === 'number'); }
  assert.ok(k.SALON_AUTOREN.filter((a) => a.en).length === 2, 'King und Rothfuss sind englische Stimmen');
  for (const a of k.SALON_AUTOREN.filter((x) => x.en)) for (const z of a.zitate) assert.ok(z.o, a.name + ': englische Zitate tragen das Original');
  /* Fragen finden ihr Thema */
  assert.equal(k.salonThemaAusFrage('Mein Anfang ist langweilig'), 'anfang');
  assert.equal(k.salonThemaAusFrage('Wie bleibe ich jeden Tag dran?'), 'routine');
  assert.equal(k.salonThemaAusFrage('Ich bin müde und blockiert'), 'pause');
  assert.equal(k.salonThemaAusFrage('Hallo'), null);
  for (const a of k.SALON_AUTOREN) {
    assert.ok(a.zitate.length >= 5, a.name + ' hat Zitate');
    for (const z of a.zitate) { assert.ok(z.t.length > 10); assert.ok(z.q && z.q.length > 2, a.name + ': jedes Zitat trägt eine Quelle'); }
    assert.ok(k.salonVorrat(a) >= 3000, a.name + ' hat genug Rat: ' + k.salonVorrat(a));
    assert.ok(a.saetze.length >= 30, a.name + ' hat handgeschriebene Sätze');
    assert.ok(a.foto && a.foto.lizenz && a.foto.urheber, a.name + ': Foto mit Lizenz');
    /* jedes Thema kommt im Baukasten vor */
    for (const [id] of k.SALON_THEMEN) assert.ok(a.kern.some((x) => x[0] === id), a.name + ' kann zu ' + id + ' raten');
  }
  const king = k.SALON_AUTOREN[0];
  const r1 = k.salonRat(king, 42), r2 = k.salonRat(king, 42), r3 = k.salonRat(king, 43);
  assert.equal(r1.text, r2.text, 'gleiche Saat, gleicher Rat');
  assert.ok(r1.text.length > 20);
  const texte = new Set(); for (let i = 0; i < 200; i++) texte.add(k.salonRat(king, i).text);
  assert.ok(texte.size > 150, 'zweihundert Saaten geben viele verschiedene Räte: ' + texte.size);
  /* Thema grenzt ein: mit Thema kommt ein Rat aus diesem Thema (oder selten ein Satz) */
  let imThema = 0; for (let i = 0; i < 60; i++) { const r = k.salonRat(king, i, 'dialog'); if (r.art === 'baukasten') { assert.equal(r.thema, 'dialog'); imThema++; } }
  assert.ok(imThema > 40);
  assert.equal(k.salonRatDesTages(king, '2026-08-24').text, k.salonRatDesTages(king, '2026-08-24').text);
  assert.notEqual(k.salonRatDesTages(king, '2026-08-24').text, k.salonRatDesTages(k.SALON_AUTOREN[1], '2026-08-24').text);
  assert.equal(k.salonRat(null, 1), null);
  assert.equal(typeof k.salonHash('abc'), 'number');
});

test('Orte: standardmäßig aus, je Raum schaltbar, Routen finden ihren Ort', async () => {
  const k = await frisch();
  const o = roh(k.saubereOrte(undefined));
  assert.equal(o.an, false, 'Orte sind standardmäßig aus');
  assert.equal(o.tueren, true); assert.equal(o.geraeusche, false);
  for (const [id] of k.ORTE_RAEUME) assert.equal(o[id], true, id + ' ist vorbereitet, sobald man einschaltet');
  const o2 = roh(k.saubereOrte({ an: true, schnipsel: false, geraeusche: true, unsinn: 3 }));
  assert.equal(o2.an, true); assert.equal(o2.schnipsel, false); assert.equal(o2.geraeusche, true); assert.equal(o2.unsinn, undefined);
  assert.equal(k.orteRaumFuer('heft'), 'hefte'); assert.equal(k.orteRaumFuer('projekt'), 'projekte'); assert.equal(k.orteRaumFuer('brett'), 'cluster'); assert.equal(k.orteRaumFuer('klang'), 'klang');
  assert.ok(k.ORTE_RAEUME.length >= 10);
});

test('Diktat: gesprochene Zeichen, Großschreibung nach Satzende', async () => {
  const k = await frisch();
  assert.equal(k.diktatSaeubern('hallo welt punkt wie geht es dir fragezeichen'), 'Hallo welt. Wie geht es dir?');
  assert.equal(k.diktatSaeubern('erstens komma zweitens neuer absatz drittens'), 'Erstens, zweitens\n\nDrittens');
  assert.equal(k.diktatSaeubern('  '), '');
  assert.equal(k.diktatSaeubern('ein Satz ausrufezeichen'), 'Ein Satz!');
});

test('Wort-Diff: gleich, neu, weg — ohne Verluste, Bilanz stimmt', async () => {
  const k = await frisch();
  const a = 'Der Abend gehört den Seiten. Ein Satz reicht.', b = 'Der Abend gehört den Büchern. Ein Satz reicht völlig.';
  const d = roh(k.wortDiff(a, b));
  assert.equal(d.filter((x) => x.art === 'gleich').map((x) => x.text).join('').replace(/\s+/g, ' ').trim(), 'Der Abend gehört den Ein Satz');
  assert.deepEqual(d.filter((x) => x.art === 'weg').map((x) => x.text.trim()), ['Seiten.', 'reicht.']);
  assert.deepEqual(d.filter((x) => x.art === 'neu').map((x) => x.text.trim()), ['Büchern.', 'reicht völlig.']);
  assert.deepEqual(roh(k.wortDiffBilanz(d)), { neu: 3, weg: 2 });
  /* Zusammengesetzt ergibt „neu+gleich" den neuen Text */
  assert.equal(d.filter((x) => x.art !== 'weg').map((x) => x.text).join('').replace(/\s+/g, ' ').trim(), b);
  assert.deepEqual(roh(k.wortDiff('', 'Neu')), [{ art: 'neu', text: 'Neu' }]);
  assert.deepEqual(roh(k.wortDiff('Alt', '')), [{ art: 'weg', text: 'Alt' }]);
  assert.deepEqual(roh(k.wortDiff('gleich', 'gleich')), [{ art: 'gleich', text: 'gleich' }]);
  /* Sehr lange Texte: die Grenze greift, aber nichts geht verloren */
  const lang = 'wort '.repeat(7000), lang2 = lang + 'Ende.';
  const dl = roh(k.wortDiff(lang, lang2, 100));
  assert.ok(dl.some((x) => x.art === 'neu' && /Ende/.test(x.text)));
});

test('Sitzung: der Fundsatz ist der längste neue Satz', async () => {
  const k = await frisch();
  const vorher = 'Alter Text. ', nachher = 'Alter Text. Ein kurzer. Dieser Satz hier ist länger und trägt etwas, das man behalten möchte. Noch einer kurz.';
  assert.equal(k.sitzungFundsatz(vorher, nachher), 'Dieser Satz hier ist länger und trägt etwas, das man behalten möchte.');
  assert.equal(k.sitzungFundsatz('x', 'x kurz.'), '', 'zu kurz zählt nicht');
  assert.equal(k.sitzungFundsatz('', ''), '');
  assert.equal(roh(k.saubereOrte(undefined)).raumklang, false);
});

test('Textlupe: Wiederholungen, Füllwörter, Rhythmus — pur', async () => {
  const k = await frisch();
  const l = roh(k.textLupe('Der Nebel kam plötzlich. Der Nebel blieb. Der Nebel ging sehr langsam, wirklich sehr langsam. Ein kurzer.'));
  assert.equal(l.saetze, 4);
  assert.ok(l.wiederholungen.some((w) => w.wort === 'nebel' && w.n === 3), 'nebel dreimal');
  assert.ok(l.fuell.some((w) => w.wort === 'sehr' && w.n === 2));
  assert.ok(l.laengster >= 7 && l.kuerzester === 2);
  assert.ok(l.fuellAnteil > 0 && l.fuellAnteil < 50);
  const leer = roh(k.textLupe(''));
  assert.equal(leer.woerter, 0); assert.equal(leer.saetze, 0); assert.deepEqual(leer.wiederholungen, []);
});

test('Jahresringe: zwölf Monate, Anteile, Narben, Jahre; das Bild ist ein SVG mit zwölf Ringen', async () => {
  const k = await frisch();
  const tage = { '2025-01-03': 500, '2025-01-09': 300, '2025-07-20': 1600, '2024-12-31': 40, '2026-02-02': 10 };
  const d = roh(k.jahresringeDaten(tage, 2025));
  assert.equal(d.monate.length, 12); assert.equal(d.gesamt, 2400); assert.equal(d.tage, 3);
  assert.equal(d.monate[0].worte, 800); assert.equal(d.monate[0].tage, 2); assert.equal(d.monate[6].anteil, 1);
  assert.equal(d.monate[6].jahreszeit, 'sommer'); assert.equal(d.monate[11].jahreszeit, 'winter');
  assert.deepEqual(roh(k.jahresringeJahre(tage)).slice(0, 3), [2024, 2025, 2026]);
  const svg = k.jahresringeSVG(d, { groesse: 300 });
  assert.ok(svg.startsWith('<svg') && (svg.match(/class="ring"/g) || []).length === 12);
  assert.ok(svg.includes('Juli'));
});

test('Heute vor einem Jahr: nur gleicher Tag und Monat, ältere Jahre, das nächste zuerst', async () => {
  const k = await frisch();
  const heute = new Date(2026, 7, 24, 15).getTime();
  const docs = [
    { id: 'a', typ: 'blatt', text: 'vor einem Jahr geschrieben, lang genug', angelegt: new Date(2025, 7, 24, 9).getTime() },
    { id: 'b', typ: 'blatt', text: 'vor zwei Jahren', angelegt: new Date(2024, 7, 24, 9).getTime() },
    { id: 'c', typ: 'blatt', text: 'gestern', angelegt: new Date(2025, 7, 23, 9).getTime() },
    { id: 'd', typ: 'heft', text: 'falscher Typ', angelegt: new Date(2025, 7, 24, 9).getTime() },
    { id: 'e', typ: 'blatt', text: '', angelegt: new Date(2025, 7, 24, 9).getTime() }
  ];
  const f = roh(k.heuteVorEinemJahr(docs, heute));
  assert.equal(f.doc.id, 'a'); assert.equal(f.jahre, 1);
  assert.equal(k.heuteVorEinemJahr([], heute), null);
  assert.equal(roh(k.heuteVorEinemJahr(docs.filter((x) => x.id !== 'a'), heute)).doc.id, 'b');
});

test('Salon-Briefe: Liste wird gesäubert und begrenzt', async () => {
  const k = await frisch();
  const l = roh(k.saubereSalonBriefe([{ an: 'king', docId: 'x', wann: 5, beantwortet: 'ja', frage: 'f' }, null, 'nix', { an: 7 }]));
  assert.equal(l.length, 1); assert.equal(l[0].beantwortet, false); assert.equal(l[0].an, 'king');
  assert.deepEqual(roh(k.saubereSalonBriefe(undefined)), []);
});
