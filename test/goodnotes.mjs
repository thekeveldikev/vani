/* Einfügen aus Goodnotes und anderen Apps: die drei Reparaturen sind pur und
   werden hier mit dem gefüttert, was wirklich ankam — „&#x20;" als Text,
   weiche Zeilenumbrüche mitten im Satz, Kurzschrift wie _kursiv_. */
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

test('entitaetenReparieren: Goodnotes-Reste werden Zeichen, Unbekanntes bleibt stehen', async () => {
  const k = await frisch();
  assert.equal(k.entitaetenReparieren('Doch jetzt war es still.&#x20;'), 'Doch jetzt war es still. ');
  assert.equal(k.entitaetenReparieren('a&#32;b&#8230;c&nbsp;d'), 'a b…c d');
  assert.equal(k.entitaetenReparieren('Tom &amp; Jerry &lt;3'), 'Tom & Jerry <3');
  assert.equal(k.entitaetenReparieren('&bdquo;Oh.&ldquo; &ndash; sagte er'), '„Oh.“ – sagte er');
  /* Was keine Entität ist, bleibt, wie es war — auch ein einsames &. */
  assert.equal(k.entitaetenReparieren('Fisch & Chips; &unbekannt; &#xZZ;'), 'Fisch & Chips; &unbekannt; &#xZZ;');
  /* Steuerzeichen und Surrogate werden nicht erzeugt. */
  assert.equal(k.entitaetenReparieren('&#1;&#xD800;'), '&#1;&#xD800;');
  assert.equal(k.entitaetenReparieren(''), '');
  assert.equal(k.entitaetenReparieren(null), '');
});

test('kurzschriftZuHTML: _kursiv_, *fett*, ~durch~ — aber nicht mitten im Wort und nicht über Tags', async () => {
  const k = await frisch();
  assert.equal(k.kurzschriftZuHTML('„_Incredibile!_“, rief ich'), '„<i>Incredibile!</i>“, rief ich');
  assert.equal(k.kurzschriftZuHTML('_Wort_ am Anfang'), '<i>Wort</i> am Anfang');
  assert.equal(k.kurzschriftZuHTML('das ist *wichtig* und ~falsch~.'), 'das ist <b>wichtig</b> und <s>falsch</s>.');
  assert.equal(k.kurzschriftZuHTML('ein_schnitt_wort bleibt'), 'ein_schnitt_wort bleibt', 'Unterstriche im Wort sind keine Kurzschrift');
  assert.equal(k.kurzschriftZuHTML('_ kein Leerraum innen _'), '_ kein Leerraum innen _');
  assert.equal(k.kurzschriftZuHTML('a * b * c'), 'a * b * c', 'Sternchen mit Leerraum drumherum sind Sternchen');
  assert.equal(k.kurzschriftZuHTML('<b>_kursiv im Fetten_</b>'), '<b><i>kursiv im Fetten</i></b>');
  assert.equal(k.kurzschriftZuHTML('ohne alles'), 'ohne alles');
});

test('verbindeWeicheUmbrueche: Sätze über Zeilenkanten werden wieder ganz, echte Absätze bleiben', async () => {
  const k = await frisch();
  const b = (inhalt, tag = 'p') => ({ tag, inhalt });
  const weich = roh(k.verbindeWeicheUmbrueche([
    b('weil sein Vater ihm einen Ferrari geschenkt'), b('hatte, als er vierzehn wurde.'),
    b('Neuer Absatz beginnt groß.'), b('und dieser gehört nicht dazu, weil davor ein Punkt stand')
  ]));
  assert.deepEqual(weich.map((x) => x.inhalt), [
    'weil sein Vater ihm einen Ferrari geschenkt hatte, als er vierzehn wurde.',
    'Neuer Absatz beginnt groß.',
    'und dieser gehört nicht dazu, weil davor ein Punkt stand'
  ]);
  /* Anführungszeichen, Doppelpunkt, Gedankenstrich am Ende schließen den Absatz. */
  const zu = roh(k.verbindeWeicheUmbrueche([b('Er sagte:'), b('nichts.'), b('„Und?“'), b('fragte er.'), b('Dann —'), b('stille.')]));
  assert.equal(zu.length, 6);
  /* Listen und Überschriften werden nie verbunden. */
  const liste = roh(k.verbindeWeicheUmbrueche([b('erstens', 'li'), b('zweitens', 'li'), b('Titel', 'h2'), b('text danach')]));
  assert.equal(liste.length, 4);
  /* Aufzählungszeichen am Zeilenanfang bleiben eigene Zeilen. */
  const punkte = roh(k.verbindeWeicheUmbrueche([b('Einkaufen'), b('- milch'), b('- brot')]));
  assert.equal(punkte.length, 3);
  /* Leere Zeile (<br>) trennt hart. */
  const leer = roh(k.verbindeWeicheUmbrueche([b('Satz ohne Ende'), b('<br>'), b('kleiner Anfang')]));
  assert.equal(leer.length, 3);
  assert.deepEqual(roh(k.verbindeWeicheUmbrueche([])), []);
});
