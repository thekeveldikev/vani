/* Karteikarten: Reihenfolge und Bilanz sind pur — hier geprüft. */
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

test('karteikartenReihenfolge: Verfehltes und nie Gefragtes zuerst, sicher Gewusstes zuletzt, Leeres fliegt', async () => {
  const k = await frisch();
  const jetzt = 1_800_000_000_000;
  const woerter = [
    { id: 'sicher', text: 'sicher', gewusst: 9, verfehlt: 0, abgefragt: jetzt - 3600000 },
    { id: 'schwer', text: 'schwer', gewusst: 1, verfehlt: 4, abgefragt: jetzt - 3600000 },
    { id: 'neu', text: 'neu' },
    { id: 'leer', text: '   ' },
    null
  ];
  const reihe = roh(k.karteikartenReihenfolge(woerter, () => .5, jetzt)).map((w) => w.id);
  assert.deepEqual(reihe, ['schwer', 'neu', 'sicher']);
  /* Zufall bewegt nur innerhalb ähnlicher Gewichte — das Sichere bleibt hinten. */
  for (let i = 0; i < 20; i++) {
    const r = roh(k.karteikartenReihenfolge(woerter, Math.random, jetzt)).map((w) => w.id);
    assert.equal(r[r.length - 1], 'sicher');
    assert.equal(r.length, 3);
  }
  assert.deepEqual(roh(k.karteikartenReihenfolge([])), []);
  assert.deepEqual(roh(k.karteikartenReihenfolge(null)), []);
});

test('karteikartenBilanz: zählt, rechnet die Quote und findet Worte', async () => {
  const k = await frisch();
  assert.deepEqual(roh(k.karteikartenBilanz([true, true, false, true])), { gewusst: 3, nochmal: 1, quote: 75, wort: 'Fast alles sitzt — 1 noch einmal.' });
  assert.equal(roh(k.karteikartenBilanz([true, true])).wort, 'Alles gewusst. Die Kiste sitzt.');
  assert.equal(roh(k.karteikartenBilanz([false, false, true])).quote, 33);
  assert.equal(roh(k.karteikartenBilanz([])).wort, 'Nichts abgefragt.');
  assert.equal(roh(k.karteikartenBilanz(null)).quote, 0);
});
