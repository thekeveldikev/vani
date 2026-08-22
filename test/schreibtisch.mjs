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
  assert.deepEqual(roh(k.saubererSchreibtisch(undefined)), { holz: 'nuss', lampe: .8, lampeAn: true, kerzen: true, wetterFolgtKlang: true, unordnung: .7, verse: true, uhrTickt: false, wachs: 0, kerzenGewechselt: 0 });
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
  assert.deepEqual(e, { helligkeit: .4, waerme: 1, nacht: false, doppel: 'auto', blaettern: false, zoom: 'seite' });
  assert.deepEqual(roh(k.saubereLeseEinstellung(null)), { helligkeit: 1, waerme: .15, nacht: false, doppel: 'auto', blaettern: true, zoom: 'seite' });
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
