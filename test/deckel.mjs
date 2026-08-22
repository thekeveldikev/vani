/* Der Umschlag: was auf einem Deckel stehen darf, ist begrenzt und hat Vorgaben —
   sonst kippt ein kaputtes Paket aus der Sicherung das ganze Regal. */
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

test('saubererDeckel: Vorgaben für alles, Unbekanntes fällt auf die Vorgabe zurück', async () => {
  const k = await frisch();
  const leer = roh(k.saubererDeckel(undefined));
  assert.deepEqual(leer, { stoff: 'leinen', etikett: 'schild', schrift: 'serif', ecken: 'rund', gummi: false, gummifarbe: '#2c251c', abgegriffen: 0, sticker: [] });
  const wild = roh(k.saubererDeckel({ stoff: 'gold', etikett: 'hand', schrift: 'x', ecken: 'metall', gummi: 'ja', gummifarbe: 'red', abgegriffen: 7, sticker: 'nein' }));
  assert.equal(wild.stoff, 'leinen');
  assert.equal(wild.etikett, 'hand');
  assert.equal(wild.schrift, 'serif');
  assert.equal(wild.ecken, 'metall');
  assert.equal(wild.gummi, false, 'nur echtes true zählt');
  assert.equal(wild.gummifarbe, '#2c251c');
  assert.equal(wild.abgegriffen, 1, 'Abnutzung ist höchstens 1');
  assert.deepEqual(wild.sticker, []);
  assert.deepEqual(roh(k.saubererDeckel([1, 2])), leer, 'eine Liste ist kein Deckel');
});

test('saubererDeckel: Sticker behalten Bild und Lage, Unsinn fliegt, höchstens 24', async () => {
  const k = await frisch();
  const d = roh(k.saubererDeckel({ sticker: [
    { bild: 'sticker:schmu', pos: { x: 40, y: 60, rot: 12, w: 30 } },
    { bild: 'abc', pos: { x: 900, y: -900, rot: 720, w: 1 } },
    { pos: { x: 1 } }, null, 'x',
    ...Array.from({ length: 40 }, (_, i) => ({ bild: 'b' + i }))
  ] }));
  assert.equal(d.sticker.length, 24);
  assert.deepEqual(d.sticker[0], { bild: 'sticker:schmu', pos: { x: 40, y: 60, rot: 12, w: 30 } });
  assert.deepEqual(d.sticker[1].pos, { x: 110, y: -20, rot: 180, w: 8 }, 'Lage wird eingefangen');
  assert.deepEqual(d.sticker[2].pos, { x: 50, y: 50, rot: 0, w: 34 }, 'ohne Lage: Mitte');
});

test('Listen der Stoffe, Etiketten und Ansichten sind eindeutig benannt', async () => {
  const k = await frisch();
  for (const liste of [k.DECKEL_STOFFE, k.DECKEL_ETIKETTEN, k.HEFTE_ANSICHTEN]) {
    const ids = roh(liste).map((e) => e[0]);
    assert.equal(new Set(ids).size, ids.length);
    for (const e of roh(liste)) assert.ok(e[1] && e[1].length <= 20);
  }
  assert.deepEqual(roh(k.HEFTE_ANSICHTEN).map((e) => e[0]), ['karten', 'regal', 'tisch']);
});
