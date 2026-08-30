/* Eingefrorene Stände (45) und der Papierkorb-Zähler (30).

   Beide Dinge hier waren Aufrufe an Funktionen, die es nicht gab — jeweils
   hinter einem typeof-Schutz, also still wirkungslos:

     · 32-sicherheit rief standEinfrieren, bevor es einen geretteten Text
       zurückschrieb, und meldete danach „Der Stand von vorher liegt als
       Version daneben“. Er lag nicht daneben.
     · Der Schreibtisch fragte papierkorbZahl, um zu merken, ob sich am Korb
       etwas geändert hat. Er bekam immer 0.

   Und ein dritter Fehler steckte darin: ein Stand hielt nur den reinen Text
   fest. Eine formatierte Szene kam nackt zurück. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }

test('Einfrieren geht auch ohne offenen Schreibraum', async () => {
  const k = await frisch();
  const doc = { id: 's1', typ: 'szene', titel: 'Der Regen', text: 'Sie stand am Fenster.' };
  const stand = k.standEinfrieren(doc, 'vor der Rettung');
  assert.ok(stand, 'es kommt ein Stand heraus');
  assert.equal(doc.staende.length, 1);
  assert.equal(doc.staende[0].text, 'Sie stand am Fenster.');
  assert.equal(doc.staende[0].titel, 'Der Regen');
  assert.equal(doc.staende[0].grund, 'vor der Rettung', 'der Grund steht dabei');
  assert.ok(doc.staende[0].wann > 0);
  /* Ohne Dokument passiert nichts, statt dass es kracht */
  assert.equal(k.standEinfrieren(null, 'egal'), null);
});

test('Die Formatierung wird mit eingefroren — sonst kommt eine Szene nackt zurück', async () => {
  const k = await frisch();
  const doc = { id: 's2', typ: 'szene', format: 'rich', titel: 'Der Wald', text: 'Sie ging in den Wald.', rich: '<h2>Der Wald</h2><p>Sie ging in den <b>Wald</b>.</p>' };
  k.standEinfrieren(doc, 'von Hand');
  const st = doc.staende[0];
  assert.equal(st.rich, '<h2>Der Wald</h2><p>Sie ging in den <b>Wald</b>.</p>', 'das Gerüst ist mit dabei');
  assert.equal(st.text, 'Sie ging in den Wald.', 'und der reine Text auch — für die Vorschau und den Vergleich');

  /* Ein einfacher Text hat nichts zu formatieren und bekommt auch nichts. */
  const blatt = { id: 'b1', typ: 'blatt', format: 'plain', text: 'Nur Text.', rich: '<p>alt und egal</p>' };
  k.standEinfrieren(blatt);
  assert.equal(blatt.staende[0].rich, undefined, 'kein rich, wo nichts formatiert ist');
  assert.equal(blatt.staende[0].grund, undefined, 'ohne Grund steht auch keiner da');
});

test('Grund und Formatierung überleben das Speichern', async () => {
  const k = await frisch();
  /* Der Reiniger warf früher alles weg, was nicht wann/titel/text/auto hieß.
     Ein Grund und ein rich wären beim nächsten Laden spurlos verschwunden. */
  const d = k.sauberesDokument({
    id: 's3', typ: 'szene', angelegt: 1, geaendert: 1,
    staende: [{ wann: 5000, titel: 'T', text: 'Text', rich: '<p><b>fett</b></p>', grund: 'vor dem Ersetzen', auto: true }]
  });
  assert.equal(d.staende.length, 1);
  assert.equal(d.staende[0].grund, 'vor dem Ersetzen');
  /* Dass die Auszeichnung selbst erhalten bleibt, haengt an sauberesRichHTML
     und damit an einem echten DOM — das ist im Browser geprueft. Hier zaehlt
     nur: das Feld faellt nicht heraus. Genau das war der Fehler. */
  assert.equal(typeof d.staende[0].rich, 'string');
  assert.ok(d.staende[0].rich.length > 0, 'das Geruest wird durchgereicht, nicht weggeworfen');
  assert.equal(d.staende[0].auto, true);
  /* Unsinn wird weggeräumt, nicht durchgereicht */
  const kaputt = k.sauberesDokument({ id: 's4', typ: 'szene', angelegt: 1, geaendert: 1, staende: [{ wann: 1, text: 'x', grund: 'g'.repeat(500) }] });
  assert.equal(kaputt.staende[0].grund.length, 80, 'ein zu langer Grund wird gekürzt');
});

test('Höchstens zwanzig Stände — der älteste geht', async () => {
  const k = await frisch();
  const doc = { id: 's5', typ: 'blatt', text: 'x' };
  for (let i = 0; i < 25; i++) k.standEinfrieren(doc, 'Nummer ' + i, 'Fassung ' + i);
  assert.equal(doc.staende.length, 20);
  assert.equal(doc.staende[0].text, 'Fassung 5', 'die ersten fünf sind heraus');
  assert.equal(doc.staende[19].text, 'Fassung 24');
});

test('Der Papierkorb zählt — und nie ins Minus', async () => {
  const k = await frisch();
  k.papierkorbZahlSetzen(0);
  assert.equal(k.papierkorbZahl(), 0);
  k.papierkorbZahlSetzen(3);
  assert.equal(k.papierkorbZahl(), 3);
  k.papierkorbZahlSetzen(-2);
  assert.equal(k.papierkorbZahl(), 0, 'ein doppeltes Zurückholen darf nicht ins Minus laufen');
  k.papierkorbZahlSetzen('7');
  assert.equal(k.papierkorbZahl(), 7, 'auch aus einer Zeichenkette wird eine Zahl');
  k.papierkorbZahlSetzen(undefined);
  assert.equal(k.papierkorbZahl(), 0);
  k.papierkorbZahlSetzen(2.6);
  assert.equal(k.papierkorbZahl(), 3, 'ganze Bündel, keine halben');
});

test('Löschen füllt den Korb, Zurückholen leert ihn wieder', async () => {
  const k = await frisch();
  k.papierkorbZahlSetzen(0);
  const d = k.sauberesDokument({ id: 'weg1', typ: 'blatt', titel: 'Weg damit', text: 'Ein Text.', angelegt: 1, geaendert: 1 });
  k.D.docs.set(d.id, d);
  await k.loesche(d.id, true);
  await mikrotasksLeeren();
  assert.equal(k.papierkorbZahl(), 1, 'ein Bündel liegt drin');
  assert.equal(k.D.docs.has('weg1'), false, 'und aus dem Bestand ist es raus');
});
