/* Zitate auf der Platte (54d): Die Verteilung muss zufällig aussehen und
   trotzdem nie auf etwas drauffallen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
/* Ein berechenbarer Zufall, damit die Prüfung immer dasselbe sagt */
function wuerfel(saat) { let s = saat >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

test('Die Weisen: was gilt, wenn nichts gewählt wurde', async () => {
  const k = await frisch();
  assert.equal(k.tischzitatModus(undefined), 'gefunden', 'ohne Wahl: die gefundenen');
  assert.equal(k.tischzitatModus({ zitatModus: 'geritzt' }), 'geritzt');
  assert.equal(k.tischzitatModus({ zitatModus: 'unfug' }), 'gefunden', 'Unsinn wird zur Vorgabe');
  /* Wer den alten Schalter aus hatte, bekommt nicht plötzlich Zeilen auf den Tisch */
  assert.equal(k.tischzitatModus({ verse: false }), 'nichts');
  assert.equal(k.TISCHZITAT_MODI.length, 4);
});

test('Nichts wird dorthin gelegt, wo schon etwas liegt', async () => {
  const k = await frisch();
  /* Ein Manuskript mitten auf dem Tisch */
  const papier = [{ x1: .3, x2: .7, y1: 0, y2: .4 }];
  assert.equal(k.tischzitatFrei(.5, .2, papier), false, 'mittendrauf');
  assert.equal(k.tischzitatFrei(.5, .8, papier), true, 'weit darunter');
  assert.equal(k.tischzitatFrei(.1, .2, papier), true, 'links daneben');
  /* Ein Satz ist breit: sein Rand darf auch nicht drauffallen */
  assert.equal(k.tischzitatFrei(.2, .2, papier, { w: .3, h: .1 }), false, 'der rechte Rand ragt darauf');
  assert.equal(k.tischzitatFrei(.05, .2, papier, { w: .1, h: .1 }), true, 'ganz links passt');
  assert.equal(k.tischzitatFrei(.5, .45, papier, { w: .2, h: .1 }), true, 'knapp darunter passt');
  assert.equal(k.tischzitatFrei(.5, .35, papier, { w: .2, h: .1 }), false, 'knapp darauf nicht');
});

test('Die Plätze streuen, ohne sich zu berühren', async () => {
  const k = await frisch();
  const rnd = wuerfel(4711);
  const platz = [];
  for (let i = 0; i < 6; i++) platz.push(k.tischzitatPlatz(platz, rnd));
  /* Kein Platz doppelt und keiner am anderen kleben */
  for (let i = 0; i < platz.length; i++) {
    for (let j = i + 1; j < platz.length; j++) {
      const d = Math.hypot(platz[i].x - platz[j].x, platz[i].y - platz[j].y);
      assert.ok(d > .12, 'Platz ' + i + ' und ' + j + ' liegen zu dicht: ' + d.toFixed(3));
    }
    assert.ok(platz[i].x >= 0 && platz[i].x <= 1 && platz[i].y >= 0 && platz[i].y <= 1);
    assert.ok(Math.abs(platz[i].dreh) <= 5.1, 'nur leicht schief: ' + platz[i].dreh);
  }
  /* Und sie sehen nicht nach Raster aus: die x-Werte sind verschieden */
  assert.equal(new Set(platz.map((p) => p.x.toFixed(2))).size, platz.length);
});

test('Hindernisse werden umgangen, auch mit Breite', async () => {
  const k = await frisch();
  const rnd = wuerfel(99);
  const hindernisse = [{ x1: .2, x2: .8, y1: .0, y2: .55 }, { x1: 0, x2: .25, y1: .6, y2: 1 }];
  for (let i = 0; i < 25; i++) {
    const p = k.tischzitatPlatz([], rnd, hindernisse, { w: .18, h: .1 });
    assert.equal(k.tischzitatFrei(p.x, p.y, hindernisse, { w: .18, h: .1 }), true,
      'Platz ' + JSON.stringify(p) + ' faellt auf ein Hindernis');
  }
});

test('Ist wirklich alles belegt, wird trotzdem ein Platz genannt', async () => {
  const k = await frisch();
  const alles = [{ x1: -1, x2: 2, y1: -1, y2: 2 }];
  const p = k.tischzitatPlatz([], wuerfel(3), alles, { w: .2, h: .1 });
  assert.ok(p && Number.isFinite(p.x) && Number.isFinite(p.y), 'lieber ein Kompromiss als gar nichts');
});

test('Ein geritzter Satz wird gekappt, nicht abgewiesen', async () => {
  const k = await frisch();
  const d = k.tischzitatAnlegen('  ' + 'w'.repeat(300) + '  ');
  assert.equal(d.text.length, 160);
  assert.equal(k.tischzitatAnlegen('   '), null, 'aus Leere wird nichts geritzt');
  assert.equal(k.tischzitate().length, 1);
  assert.ok(d.x >= 0 && d.x <= 1 && d.y >= 0 && d.y <= 1, 'mit Platz auf der Platte');
});
