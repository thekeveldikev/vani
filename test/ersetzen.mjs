/* Suchen & Ersetzen in formatiertem Text (35, 45).

   Der Fehler, den das hier festhält: Ersetzen nahm bisher die reine
   Textfassung, tauschte darin die Wörter und baute das HTML daraus neu auf.
   Das Ergebnis las sich richtig — und war nackt. Fett, kursiv, Farben,
   Überschriften, Zitate: alles weg, ohne Warnung, ohne Rückweg außer dem
   eingefrorenen Stand.

   Szenen sind standardmäßig formatiert. Deshalb traf es genau sie. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }

test('Ersetzt wird Stück für Stück — das Gerüst bleibt unberührt', async () => {
  const k = await frisch();
  /* So sehen die Textknoten eines formatierten Absatzes aus:
     <p>Der <b>Wald</b> schweigt.</p> — drei Stücke, ein Wort in der Mitte fett. */
  const stuecke = ['Der ', 'Wald', ' schweigt. Der Wald atmet.'];
  const r = k.textStueckeErsetzen(stuecke, 'Wald', 'Forst');
  assert.equal(r.anzahl, 2, 'beide Vorkommen — das fette und das im Fliesstext');
  assert.equal(r.stuecke[0], 'Der ');
  assert.equal(r.stuecke[1], 'Forst', 'das fette Wort bleibt sein eigenes Stück — und damit fett');
  assert.equal(r.stuecke[2], ' schweigt. Der Forst atmet.');
  assert.equal(r.stuecke.length, stuecke.length, 'kein Stück kommt dazu, keins fällt weg');
});

test('Ohne Suchwort wird nichts angefasst', async () => {
  const k = await frisch();
  const stuecke = ['Der ', 'Wald'];
  for (const nichts of ['', null, undefined]) {
    const r = k.textStueckeErsetzen(stuecke, nichts, 'Forst');
    assert.equal(r.anzahl, 0);
    assert.equal(r.stuecke.join(''), 'Der Wald', 'unverändert');
  }
  /* Und die Vorlage selbst wird nicht verändert — das Einfrieren muss
     hinterher noch den alten Stand haben. */
  assert.equal(stuecke.join(''), 'Der Wald');
});

test('Ersetzen durch nichts löscht das Wort, statt „undefined“ hinzuschreiben', async () => {
  const k = await frisch();
  assert.equal(k.textStueckeErsetzen(['sehr sehr gut'], 'sehr ', undefined).stuecke[0], 'gut');
  assert.equal(k.textStueckeErsetzen(['sehr sehr gut'], 'sehr ', null).stuecke[0], 'gut');
  assert.equal(k.textStueckeErsetzen(['sehr sehr gut'], 'sehr ', '').anzahl, 2);
});

test('Gezählt wird genau das, was auch ersetzt werden kann', async () => {
  const k = await frisch();
  /* Der ehrliche Fall: „Wald“ steht zweimal ganz in einem Stück. */
  assert.equal(k.textStueckeZaehlen(['Der Wald, der Wald.'], 'Wald'), 2);

  /* Der unehrliche Fall, den der Zähler früher mitgezählt hätte: das Wort
     ist quer durch eine Auszeichnung zerschnitten — „Wa“ fett, „ld“ normal.
     Ersetzen könnte es nur, indem es die Auszeichnung zerschneidet. Also
     wird es nicht mitgezählt, und der Schreibraum sagt es dazu. */
  assert.equal(k.textStueckeZaehlen(['Der Wa', 'ld schweigt.'], 'Wald'), 0, 'quer durch die Formatierung: nicht versprechen');
  /* Im ganzen Text stünde es sehr wohl da — daran erkennt der Schreibraum
     den Unterschied und sagt ihn an. */
  assert.equal(['Der Wa', 'ld schweigt.'].join('').split('Wald').length - 1, 1);
});

test('Leere und kaputte Stücke stören nicht', async () => {
  const k = await frisch();
  assert.equal(k.textStueckeErsetzen([], 'x', 'y').anzahl, 0);
  assert.equal(k.textStueckeErsetzen(undefined, 'x', 'y').anzahl, 0);
  const r = k.textStueckeErsetzen(['a', null, undefined, 'xa'], 'a', 'b');
  assert.equal(r.anzahl, 2);
  assert.equal(r.stuecke.join('|'), 'b|||xb', 'aus nichts wird nichts, nicht „null“');
});
