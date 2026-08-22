/* Die Kerze ist Malerei — aber ihre Geometrie ist pur und wird hier geprüft:
   sie brennt von ganz oben bis zum Stumpf, nie darunter, und ihre Flamme hat
   ein Profil, das breit wird und weich ausläuft statt spitz zuzulaufen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() {
  const k = baueSandkasten();
  await k.ladeAlles();
  await mikrotasksLeeren();
  return k;
}

test('kerzeStand: brennt linear von der vollen Höhe bis zum Stumpf, nie darüber hinaus', async () => {
  const k = await frisch();
  assert.equal(k.kerzeStand(0), 150);
  assert.equal(k.kerzeStand(1), 14);
  assert.equal(k.kerzeStand(.5), 82);
  assert.equal(k.kerzeStand(-3), 150, 'vor dem Anzünden ist sie ganz');
  assert.equal(k.kerzeStand(7), 14, 'nach der Zeit bleibt der Stumpf');
  assert.equal(k.kerzeStand(NaN), 150);
  assert.equal(k.kerzeStand(.25, 100, 20), 80, 'eigene Maße gehen auch');
});

test('kerzeFlammenBreite: null am Docht, breit unten, weich zur Spitze — keine Dreiecksflamme', async () => {
  const k = await frisch();
  const f = k.kerzeFlammenBreite;
  assert.ok(f(0) < .2, 'am Docht fast nichts');
  assert.ok(f(1) < .2, 'an der Spitze fast nichts');
  let breitesteStelle = 0, max = 0;
  for (let u = 0; u <= 1; u += .01) { const w = f(u); if (w > max) { max = w; breitesteStelle = u; } }
  assert.ok(breitesteStelle > .2 && breitesteStelle < .45, 'am breitesten bei etwa einem Drittel, war ' + breitesteStelle.toFixed(2));
  assert.ok(max > 1, 'eine Flamme hat Bauch');
  /* Oberhalb des Bauchs wird sie stetig schmaler (weiches Auslaufen). */
  for (let u = .5; u < .95; u += .05) assert.ok(f(Math.min(1, u + .05)) <= f(u) + 1e-9, 'läuft nach oben aus');
});

test('kerzeZufall: mit Saat reproduzierbar, ohne Saat brauchbar', async () => {
  const k = await frisch();
  const a = k.kerzeZufall(42), b = k.kerzeZufall(42), c = k.kerzeZufall(43);
  const ra = [a(), a(), a()], rb = [b(), b(), b()], rc = [c(), c(), c()];
  assert.deepEqual(ra, rb, 'dieselbe Saat, dieselben Wachsbahnen');
  assert.notDeepEqual(ra, rc);
  for (const x of ra) assert.ok(x >= 0 && x < 1);
  const n = k.kerzeZufall(0);
  assert.ok(Number.isFinite(n()), 'Saat 0 darf nicht hängen bleiben');
});
