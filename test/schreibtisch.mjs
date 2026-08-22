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
  assert.deepEqual(roh(k.saubererSchreibtisch(undefined)), { holz: 'nuss', lampe: .8, kerzen: true, wetterFolgtKlang: true, unordnung: .7, verse: true });
  const w = roh(k.saubererSchreibtisch({ holz: 'plastik', lampe: 9, kerzen: false, unordnung: -1, verse: 'ja' }));
  assert.equal(w.holz, 'nuss'); assert.equal(w.lampe, 1); assert.equal(w.kerzen, false); assert.equal(w.unordnung, 0); assert.equal(w.verse, true);
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
