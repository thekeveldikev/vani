/* Die Korrekturen aus den Rückmelde-Videos (22. November 2026), festgenagelt.

   1. Kabinett: Kneifen auf dem iPad stotterte, der Baum sprang zwischen zwei
      Groessen — Safari brach die Zeiger-Ereignisse fuer sein eigenes Rollen ab.
   2. Suche: „Zander“ markierte im Umfeld ein „und“ (jedes ß davor schob die
      Marke um ein Zeichen), unscharfe Treffer wie „anderen“ verdraengten die
      echten, Album/Teppich/Kalender wurden gar nicht durchsucht.
   3. Klang: ein eigenes Klangbild blieb beim Antippen still — es war
      eine leere Mischung.
   4. Album: mit offener Tastatur war das Feld, in das man tippte, unsichtbar.
   5. Ein weisser Nebel oben unter der Statusleiste ueber der dunklen Kulisse. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(join(wurzel, p), 'utf8');

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function doc(k, felder) {
  const d = k.sauberesDokument({ id: k.uid(), angelegt: 1, geaendert: 1, ...felder });
  k.D.docs.set(d.id, d);
  return d;
}

test('Suche: die Marke im Umfeld sitzt auf dem Wort, auch hinter vielen ß', async () => {
  const k = await frisch();
  const text = 'Er weiß, dass sie heißt, wie sie heißt. Groß, süß, bloß: „Jemand hat Zander und mir geschrieben.“';
  const stellen = k.suchFundstellen(text, k.normalisiere('Zander'));
  assert.equal(stellen.length, 1);
  assert.equal(text.slice(stellen[0].von, stellen[0].bis), 'Zander', 'nicht „und“, nicht verschoben');

  /* Mehrere Fundstellen werden alle gefunden — und richtig gezaehlt. */
  const viele = 'Zander ging. Straße. Zander kam. Größe. zander blieb.';
  const s2 = k.suchFundstellen(viele, 'zander');
  assert.equal(JSON.stringify(s2.map((s) => viele.slice(s.von, s.bis))), JSON.stringify(['Zander', 'Zander', 'zander']));
  assert.equal(k.suchFundstellen('', 'x').length, 0);
  assert.equal(k.suchFundstellen('abc', '').length, 0);
});

test('Suche: echte Treffer stehen vor ähnlichen, und ähnliche nur, wenn es kaum echte gibt', async () => {
  const k = await frisch();
  /* Viele Blaetter mit „anderen“ (ähnlich zu „zander“), juenger als die echten. */
  for (let i = 0; i < 8; i++) doc(k, { typ: 'blatt', titel: 'Notiz ' + i, text: 'Mit den anderen am See.', geaendert: 1000 + i });
  doc(k, { typ: 'blatt', titel: 'Brief an den Bruder', text: 'Jemand hat Zander und mir geschrieben.', geaendert: 10 });
  doc(k, { typ: 'blatt', titel: 'Am Hafen', text: 'Zander lachte. Zander ging.', geaendert: 5 });
  doc(k, { typ: 'blatt', titel: 'Zander', text: 'Eine Seite über ihn.', geaendert: 1 });

  const gruppen = k.suchErgebnisse(k.D.docs.values(), 'Zander', null);
  const blaetter = gruppen.find((g) => g.typ === 'blatt');
  assert.ok(blaetter, 'Blätter werden gefunden');
  assert.equal(blaetter.liste.length, 3, 'drei echte Treffer — kein „anderen“ dazwischen');
  assert.ok(blaetter.liste.every((f) => !f.unscharf), 'nichts Ähnliches, solange es echte gibt');
  assert.equal(blaetter.liste[0].d.titel, 'Zander', 'der Titeltreffer zuerst');
  assert.equal(blaetter.liste[1].d.titel, 'Am Hafen', 'dann der mit den meisten Fundstellen');

  /* Gibt es keinen echten Treffer, darf die Nachsicht helfen. */
  const vertippt = k.suchErgebnisse(k.D.docs.values(), 'Zandor', null);
  const v = vertippt.find((g) => g.typ === 'blatt');
  assert.ok(v && v.liste.some((f) => f.unscharf), 'bei einem Tippfehler hilft die Nachsicht');

  /* Gelöschtes wird nicht gefunden. */
  const weg = doc(k, { typ: 'blatt', titel: 'Zander im Papierkorb', text: '', geaendert: 2 });
  weg.geloescht = true;
  const ohne = k.suchErgebnisse(k.D.docs.values(), 'Zander', null).find((g) => g.typ === 'blatt');
  assert.ok(!ohne.liste.some((f) => f.d.id === weg.id), 'der Papierkorb bleibt draußen');
});

test('Suche: Album, Wandteppich, Stadtplan, Sternhimmel und Kalender werden mit durchsucht', async () => {
  const k = await frisch();
  doc(k, { typ: 'albumfigur', name: 'Ilva Brannholt', felder: { spitzname: 'Ivi' } });
  doc(k, { typ: 'stammbaum', titel: 'Familie', leute: [{ id: 'p1', name: 'Ilva Brannholt', notiz: 'die Älteste' }] });
  doc(k, { typ: 'termin', titel: 'Geburtstag', wann: '1989-11-03', leute: [{ id: '', name: 'Ilva' }] });
  doc(k, { typ: 'stadtplan', titel: 'Kesselfurt', marken: [{ id: 'm1', name: 'Haus Brannholt' }] });
  doc(k, { typ: 'sternhimmel', titel: 'Nordhimmel', sternbilder: [{ id: 's1', name: 'Brannholts Krone', sage: '' }] });

  const typen = k.suchErgebnisse(k.D.docs.values(), 'Brannholt', null).map((g) => g.typ);
  for (const t of ['albumfigur', 'stammbaum', 'stadtplan', 'sternhimmel']) assert.ok(typen.includes(t), t + ' wird gefunden');
  assert.ok(k.suchErgebnisse(k.D.docs.values(), 'Ilva', null).some((g) => g.typ === 'termin'), 'der Kalender kennt die Namen');
  assert.ok(k.suchErgebnisse(k.D.docs.values(), 'Ivi', null).some((g) => g.typ === 'albumfigur'), 'auch Felder im Album zählen');
  assert.equal(k.suchTitelFuer({ typ: 'albumfigur', name: 'Ilva' }), 'Ilva', 'eine Figur heißt nach ihrem Namen');

  /* Wer die Fundstelle antippt, kommt auch hin. */
  const kern = lies('src/30-core.js');
  const oeffne = kern.slice(kern.indexOf('function oeffneDoc('), kern.indexOf('function oeffneDoc(') + 3500);
  for (const t of ['albumfigur', 'stammbaum', 'stadtplan', 'sternhimmel', 'termin']) {
    assert.match(oeffne, new RegExp("d\\.typ === '" + t + "'"), 'oeffneDoc kennt ' + t);
  }
});

test('Spotlight: die Vorschau zeigt die Stelle des Fundes, nicht nur den Anfang', () => {
  const quelle = lies('src/48b-spotlight.js');
  assert.match(quelle, /suchStelle\(text, feld\.value\.trim\(\)\)/, 'die Stelle kommt aus 48c, mit Rückrechnung von ß und Umlauten');
  assert.ok(!/normalisiere\(auszug\.slice\(0, wo\)\)\.length === wo/.test(quelle), 'der alte Vergleich, der immer stimmte, ist weg');
});

test('Klang: ein leeres Klangbild wird erkannt, gemeldet und gar nicht erst gemerkt', async () => {
  const k = await frisch();
  assert.equal(k.klangbildHatKlang({ pegel: {}, gewebt: {} }), false);
  assert.equal(k.klangbildHatKlang({ pegel: { regen: 0 }, gewebt: null }), false, 'Null zählt nicht');
  assert.equal(k.klangbildHatKlang({}), false);
  assert.equal(k.klangbildHatKlang(null), false);
  assert.equal(k.klangbildHatKlang({ pegel: { donner_fern: .6 } }), true);
  assert.equal(k.klangbildHatKlang({ gewebt: { regen: .3 } }), true);

  const raum = lies('src/51-klangraum.js');
  assert.match(raum, /ohneklang/, 'ein leeres Klangbild sieht man');
  assert.match(raum, /ist leer — es wurde gemerkt/, 'und antippen erklärt, warum es still bleibt');
  const merken = raum.slice(raum.indexOf("'Klangbild merken'") - 900, raum.indexOf("'Klangbild merken'"));
  assert.match(merken, /klangbildHatKlang/, 'ohne laufenden Klang wird nichts gemerkt');

  const amb = lies('src/53-ambience.js');
  const anwenden = amb.slice(amb.indexOf('async function klangbildAnwenden('), amb.indexOf('async function klangbildAnwenden(') + 1400);
  assert.match(anwenden, /ambienceKatalogSicher/, 'vor dem Anwenden ist der Fundus geladen');
  assert.match(anwenden, /toast\(/, 'scheitert ein Klang, wird es gesagt');
  assert.match(anwenden, /doc\.lautstaerke > 0/, 'eine gemerkte Lautstärke 0 macht nicht stumm');
});

test('Kabinett: auf dem iPad führen Touch-Ereignisse das Kneifen, Safari rollt nicht dazwischen', () => {
  const kern = lies('src/30-core.js');
  const stueck = kern.slice(kern.indexOf('function zweiFingerZoom('), kern.indexOf('\nfunction zoomSanft('));
  assert.match(stueck, /addEventListener\('touchmove', tBewegt, \{ passive: false \}\)/, 'touchmove darf das Rollen anhalten');
  assert.match(stueck, /if \(ev\.cancelable\) ev\.preventDefault\(\)/, 'und tut es, solange zwei Finger liegen');
  assert.match(stueck, /mitTouch && ev\.pointerType === 'touch'/, 'Zeiger und Touch kneifen nicht doppelt');
  assert.match(stueck, /gesturestart/, 'Safaris Seitenzoom bleibt draußen');
  assert.match(stueck, /removeEventListener\('touchmove', tBewegt\)/, 'und alles wird wieder abgemeldet');
  /* Ein Finger muss weiter nativ rollen: kein preventDefault ohne laufendes Kneifen. */
  const bewegt = stueck.slice(stueck.indexOf('const tBewegt'), stueck.indexOf('const tEnde'));
  assert.match(bewegt, /if \(!tAktiv\) return;/, 'ohne Kneifen bleibt die Bewegung beim Browser');
});

test('Album: mit offener Tastatur bleibt das Feld sichtbar', () => {
  const css = lies('src/10-style.css');
  assert.match(css, /\.albb-blatt \{[^}]*max-height: min\(92vh, calc\(var\(--vvh/, 'das Blatt richtet sich nach der sichtbaren Höhe');
  assert.match(css, /\.tastatur-offen \.albb-blatt \.albb-impuls/, '„Noch offen“ tritt beim Tippen zurück');
  assert.match(css, /\.tastatur-offen \.albb-blatt \.albb-fuss \.knopf\.zart/, 'die Nebenknöpfe auch — „Fertig“ bleibt');
  assert.match(css, /\.tastatur-offen \.albb-blatt \.albb-inhalt \{ min-height: 96px; \}/, 'die Felder behalten Platz');
});

test('Nebel: unter der Statusleiste steht die Farbe der Kulisse, nicht der Papierton', async () => {
  const orte = lies('src/57-orte.js');
  assert.match(orte, /orteStatusFarbe\(kulisse\)/, 'jeder Raumwechsel stellt die Farbe neu');
  assert.match(orte, /IntersectionObserver/, 'rollt die Kulisse weg, kommt der Papierton zurück');
  assert.match(orte, /statusband/, 'ein festes Band für Safari 26');
  const css = lies('src/10-style.css');
  assert.match(css, /#statusband \{[^}]*height: env\(safe-area-inset-top, 0px\)[^}]*pointer-events: none/, 'so hoch wie die Statusleiste, nie im Weg');
});

/* ===== Funde der Bugjagd (Album, Wandteppich, Kalender) ===== */

test('Weggeräumt bleibt weggeräumt: Nachsichern beim Schließen holt nichts zurück', async () => {
  const k = await frisch();
  const fig = k.sauberesDokument({ id: 'f1', typ: 'albumfigur', name: 'Nore', felder: {}, angelegt: 1, geaendert: 1 });
  k.D.docs.set(fig.id, fig);
  await k.dbPut('docs', fig);
  await k.loesche('f1', true);
  assert.equal(await k.dbGet('docs', 'f1'), undefined, 'gelöscht');

  /* Genau das tat das Album-Fenster beim Schließen: noch einmal sichern. */
  k.speichere(fig);
  await mikrotasksLeeren();
  assert.equal(await k.dbGet('docs', 'f1'), undefined, 'kein Zurückschreiben in die Datenbank');
  const marke = await k.dbGet('sync', 'f1');
  assert.equal(marke && marke.geloescht, true, 'der Sync hört weiter „gelöscht“');

  /* Zurückholen bleibt möglich — es legt das Dokument wieder in den Bestand. */
  const korb = (await k.dbAlle('papierkorb')).find((b) => (b.docs || []).some((d) => d.id === 'f1'));
  await k.holeZurueck(korb.id);
  assert.ok(k.D.docs.has('f1'), 'wieder da');
  k.speichere(k.D.docs.get('f1'));
  await mikrotasksLeeren();
  assert.ok(await k.dbGet('docs', 'f1'), 'und darf wieder gesichert werden');
});

test('Album: „Anna-Lena“ ist ein Name, „Mutter - Ilva“ und „Mutter — Ilva“ sind Rolle und Name', async () => {
  const k = await frisch();
  assert.equal(k.albumVerweisName('Anna-Lena'), 'Anna-Lena');
  assert.equal(k.albumVerweisRolle('Anna-Lena'), '');
  assert.equal(k.albumVerweisName('Schwester — Anna-Lena'), 'Anna-Lena');
  assert.equal(k.albumVerweisRolle('Schwester — Anna-Lena'), 'Schwester');
  assert.equal(k.albumVerweisName('Mutter - Ilva'), 'Ilva');
  assert.equal(k.albumVerweisName('Mutter–Ilva'), 'Ilva', 'der Halbgeviertstrich trennt auch ohne Leerzeichen');
});

test('Album und Kalender: der Abgleich lässt Notiz, Ort und Zeichen des Termins stehen', () => {
  const blatt = lies('src/62c-album-blatt.js');
  const abgleich = blatt.slice(blatt.indexOf('function albumKalenderAbgleich('), blatt.indexOf('function albumBearbeiten('));
  assert.match(abgleich, /const neu = \{ wann: felder\.wann, art: felder\.art, titel: felder\.titel, leute: felder\.leute \}/, 'nur die Album-Felder');
  assert.ok(!/Object\.assign\(vorhanden, felder\)/.test(abgleich), 'nicht mehr der ganze frische Termin');
  assert.match(blatt, /t\.ausAlbum\.startsWith\('album:' \+ doc\.id \+ ':'\)/, 'beim Herausnehmen gehen ihre Termine mit');
  assert.match(blatt, /if \(istWeggeraeumt\(doc\)\) return;/, 'ein herausgenommenes Blatt sichert nicht nach');
});

test('Kalender: „stirbt vor der Geburt“ bricht die Leben-Ansicht nicht mehr ab', () => {
  const ansicht = lies('src/61b-kalender-ansicht.js');
  assert.ok(!/kalLebensalter\(p\)\.jahre/.test(ansicht), 'kein Zugriff auf .jahre von null');
  assert.match(ansicht, /const la = lebt \? kalLebensalter\(p\) : null;/);
});

test('Album: das × schließt auch nach Abhaken eines Fadens oder Wahl einer Geschichte', () => {
  const buch = lies('src/62b-album-buch.js');
  assert.ok(!/albumZeichne\(buehne, n, \(\) => \{\}\)/.test(buch), 'keine leere Schließ-Funktion mehr');
});
