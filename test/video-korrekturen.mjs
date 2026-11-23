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

/* ===== Zweite Runde: die offenen Funde ===== */

test('Kalender: ungenaue Daten sind Spannen, kein falscher Widerspruch', async () => {
  const k = await frisch();
  const t = (felder) => k.saubererTermin(felder);
  const liste = [
    t({ wann: '1783-04-09', art: 'geburt', titel: 'Geburt', leute: [{ name: 'Ilva' }] }),
    t({ wann: '1783-04', art: 'ereignis', titel: 'Taufe', leute: [{ name: 'Ilva' }] }),
    t({ wann: '1790', art: 'tod', titel: 'Tod', leute: [{ name: 'Ilva' }] }),
    t({ wann: '1790-12', art: 'ereignis', titel: 'Brief', leute: [{ name: 'Ilva' }] })
  ];
  assert.equal(k.kalWidersprueche(liste).length, 0, 'April 1783 und Dezember 1790 können stimmen');
  const falsch = liste.concat([t({ wann: '1782-12-24', art: 'ereignis', titel: 'Fest', leute: [{ name: 'Ilva' }] })]);
  const w = k.kalWidersprueche(falsch);
  assert.equal(w.length, 1);
  assert.match(w[0].text, /kommt am 24\. Dezember 1782 vor — geboren aber erst am 9\. April 1783/);
  assert.equal(k.kalAmText('1783-04'), 'im April 1783', 'im April, nicht am April');
  assert.equal(k.kalAmText('1783'), 'im Jahr 1783');
});

test('Album: „X markiert die Stelle“ ist ein offener Faden, Akzente im Register, 1970 zählt', async () => {
  const k = await frisch();
  assert.equal(k.albumFadenErledigt('X markiert die Stelle'), false);
  assert.equal(k.albumFadenText('X markiert die Stelle'), 'X markiert die Stelle');
  assert.equal(k.albumFadenErledigt('✓ Brief zurückgeben'), true);
  assert.equal(k.albumFadenText(k.albumFadenSetzen('Brief zurückgeben', true)), 'Brief zurückgeben');
  assert.equal(k.albumBuchstabe({ name: 'Éowyn' }), 'E');
  assert.equal(k.albumBuchstabe({ name: 'Çelik' }), 'C');
  assert.equal(k.albumBuchstabe({ name: 'Ödön' }), 'O');
  assert.equal(k.albumBuchstabe({ name: '7 Raben' }), '#');
  const mehr = lies('src/62d-album-mehr.js');
  assert.match(mehr, /if \(gx != null\) return -1;/, 'der 1. Januar 1970 ist ein Datum');
  assert.ok(!/'schwaeche'/.test(mehr), 'kein Feld, das es nicht gibt');
});

test('Album: die Vorschlagsliste hängt an jedem neuen Verweisfeld', () => {
  const blatt = lies('src/62c-album-blatt.js');
  assert.match(blatt, /if \(feld\.verweis\) t\.setAttribute\('list', 'albb-verweise-' \+ feld\.id\)/);
});

/* ===== Gestaltung v2 (5.63) ===== */

test('Gestaltung v2: eine abschaltbare Schicht, Bewegung extra, nichts ohne Schalter', async () => {
  const k = await frisch();
  const css = lies('src/10-style.css');
  const v2 = css.slice(css.indexOf('GESTALTUNG v2 (5.63)'));
  assert.ok(v2.length > 2000, 'die Schicht gibt es');
  /* Jede Regel der Schicht haengt am Schalter — sonst saehe „aus“ nicht aus wie frueher. */
  const ohneKommentar = v2.slice(v2.indexOf('*/') + 2).replace(/\/\*[\s\S]*?\*\//g, '');
  const regeln = ohneKommentar.match(/(^|[{}])\s*([^{}]+)\{/g) || [];
  const ohne = regeln.map((r) => r.replace(/^[{}]?\s*/, '').replace(/\{$/, '').trim())
    .filter((sel) => sel && !sel.startsWith('@') && !/^(from|to|\d+%)/.test(sel) && !/^\d+%, \d+%$/.test(sel) && sel !== '.gruss-vignette, .gruss-ranke' && sel !== '.gruss-text')
    .filter((sel) => sel.split(',').some((s) => !/html\[data-v2="an"\]/.test(s)));
  assert.deepEqual(ohne, [], 'jede v2-Regel steht hinter html[data-v2="an"]');
  /* Bewegung nur mit dem eigenen Schalter und ohne „Bewegung reduzieren“. */
  const animiert = ohneKommentar.match(/[^{}]*\{[^{}]*animation:[^{}]*\}/g) || [];
  for (const a of animiert) {
    const sel = a.slice(0, a.indexOf('{'));
    assert.match(sel, /data-v2bewegung="an"/, 'Animation ohne Bewegungsschalter: ' + sel.trim());
  }
  assert.match(v2, /@media \(prefers-reduced-motion: no-preference\)/);

  /* Standard: an (Kevins Wunsch); ausgeschaltet bleibt aus. */
  k.D.einst.v2 = undefined; k.D.einst.v2Bewegung = undefined;
  k.setzeGestaltung();
  assert.equal(k.document.documentElement.dataset.v2, 'an');
  k.D.einst.v2 = false; k.D.einst.v2Bewegung = false;
  k.setzeGestaltung();
  assert.equal(k.document.documentElement.dataset.v2, 'aus');
  assert.equal(k.document.documentElement.dataset.v2bewegung, 'aus');
  assert.match(lies('src/49-feinheiten.js'), /'Gestaltung v2'/, 'der Schalter steht in den Feinheiten');
});

test('Gestaltung v2: die Tagesvignette ist gezeichnet und folgt der Stunde', async () => {
  const k = await frisch();
  assert.equal(k.grussTageszeit(3), 'nacht');
  assert.equal(k.grussTageszeit(7), 'morgen');
  assert.equal(k.grussTageszeit(12), 'tag');
  assert.equal(k.grussTageszeit(19), 'abend');
  assert.equal(k.grussTageszeit(23), 'nacht');
  for (const z of ['morgen', 'tag', 'abend', 'nacht']) {
    const svg = k.grussVignette(z);
    assert.match(svg, /^<svg class="gruss-vignette-bild"/);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(svg), 'keine Emoji oder Schriftsymbole — iOS malt sie bunt');
  }
  assert.match(k.grussVignette('nacht'), /gv-stern/);
  assert.match(k.grussVignette('tag'), /gv-strahlen/);
});

test('Gestaltung v2: die Malschicht der Diele faengt keine Tipps ab', () => {
  const orte = lies('src/57-orte.js');
  const unten = orte.slice(orte.indexOf('function orteV2DieleUnten('), orte.indexOf('function orteV2DieleOben('));
  const oben = orte.slice(orte.indexOf('function orteV2DieleOben('), orte.indexOf('/* ----- Die Kulissen'));
  assert.match(unten, /<g pointer-events="none">/);
  assert.match(oben, /<g pointer-events="none"/);
  const css = lies('src/10-style.css');
  assert.match(css, /\.ort-kulisse::before \{[^}]*pointer-events: none/);
  assert.match(css, /\.ort-kulisse::after \{[^}]*pointer-events: none/);
});

/* ===== Gestaltung v2, zweite Runde (5.64): alle Raeume ===== */

test('v2: jede Kulisse hat eine eigene Zierschicht, und keine faengt Tipps ab', async () => {
  const k = await frisch();
  k.document.documentElement.dataset.v2 = 'an';
  for (const r of ['schnipsel', 'blaetter', 'hefte', 'projekte', 'cluster', 'woerter', 'klang', 'faden', 'feinheiten']) {
    const z = k.orteV2Zier(r);
    assert.ok(z.length > 200, r + ' hat eine Zierschicht');
    assert.ok(!/data-tipp|ort-tipp|onclick/.test(z), r + ': nichts Antippbares in der Zierschicht');
  }
  k.document.documentElement.dataset.v2 = 'aus';
  assert.equal(k.orteV2Zier('hefte'), '', 'ohne v2 keine Zierschicht');
  const orte = lies('src/57-orte.js');
  assert.match(orte, /z\.classList\.add\('ort-v2-zier'\); z\.setAttribute\('pointer-events', 'none'\)/);
  assert.match(lies('src/10-style.css'), /\.ort-v2-zier \{[^}]*pointer-events: none/);
});

test('v2: die nasse Scheibe am Schreibtisch haengt am Schalter', () => {
  const m = lies('src/54b-schreibtisch-malerei.js');
  assert.match(m, /if \(v2An\(\)\) \{ maleNasseScheibe\(dt, fx, fy, fw, fh\); \} else for \(const g of glasTropfen\)/, 'ohne v2 die alten Tropfen');
  assert.match(m, /function maleBlitzStrahl\([^)]*\) \{\s*if \(!v2An\(\)/, 'der Blitzstrahl nur mit v2');
  assert.match(m, /function maleEisUndSchnee\([^)]*\) \{\s*if \(!v2An\(\)/, 'Eisblumen nur mit v2');
  /* Tropfen laufen um eine feste Mitte — sonst werden aus Spuren Kometenschweife. */
  assert.match(m, /l\.x = l\.mitte \+ l\.ruck \+ Math\.sin\(l\.zick\) \* \.0012;/);
});

/* ===== 5.65: neu ausgemalt ===== */

test('Neu ausgemalt: zwei Malschichten je Kulisse, still, ohne Zeiger, nur mit v2', async () => {
  const k = await frisch();
  k.document.documentElement.dataset.v2 = 'an';
  for (const r of ['schnipsel', 'blaetter', 'hefte', 'projekte', 'cluster', 'woerter', 'klang', 'faden', 'feinheiten']) {
    const unten = k.orteV2Malerei(r, 'unten'), oben = k.orteV2Malerei(r, 'oben');
    assert.ok(unten.length > 150 && oben.length > 150, r + ': beide Schichten');
    assert.ok(!/class="v2-|data-tipp|ort-tipp/.test(unten + oben), r + ': keine Bewegung, nichts Antippbares');
  }
  assert.ok(k.orteV2Malerei('zuhause', 'oben').length > 150, 'die Diele bekommt Rundung und Glanz');
  k.document.documentElement.dataset.v2 = 'aus';
  assert.equal(k.orteV2Malerei('hefte', 'unten'), '');
  /* Die untere Schicht steht in jedem Buehnenbild VOR den Dingen. */
  const orte = lies('src/57-orte.js');
  for (const r of ['schnipsel', 'blaetter', 'hefte', 'projekte', 'cluster', 'woerter', 'klang', 'faden', 'feinheiten']) {
    assert.match('x', orte.includes("orteV2Malerei('" + r + "', 'unten')") ? /./ : /^$/, r + ' haengt die untere Schicht ein');
  }
});

test('Schallplatte: die Ellipse dreht sich nicht, nur die Marke auf dem Etikett', () => {
  const orte = lies('src/57-orte.js'), css = lies('src/10-style.css');
  assert.match(orte, /class="ort-plattenmarke"/);
  assert.match(css, /\.ort-platte\.dreht \{ animation: none; \}/, 'keine Drehung der ganzen Platte — eine gedrehte Ellipse kippt');
  assert.match(css, /\.ort-kulisse\.lebt \.ort-platte\.dreht \.ort-plattenmarke \{ animation: ort-dreht/);
  assert.ok(!/@keyframes ort-dreht \{ to \{ transform: rotate\(360deg\)/.test(css));
});

test('Cluster: die Teetasse steht in Dreiviertelansicht', () => {
  const orte = lies('src/57-orte.js');
  const tasse = orte.slice(orte.indexOf("T('tasse', 'Der Tee dampft noch. Kein Grund zur Eile.')"), orte.indexOf("T('keks'"));
  assert.match(tasse, /url\(#ortporz\)/, 'gerundeter Porzellankoerper');
  assert.match(tasse, /url\(#orttee\)/, 'Tee mit Verlauf');
  assert.match(tasse, /url\(#orthenkel\)/, 'Henkel mit Volumen');
});

test('Realistisch neu gemalt: Diele, Becher, Horn, Flieger, Rosmarin', () => {
  const orte = lies('src/57-orte.js');
  for (const id of ['orthutfilz', 'ortschalL', 'ortleder', 'ortstaender', 'orthbecher', 'orthorn2', 'ortkehle', 'ortterra']) {
    assert.ok(orte.includes('id="' + id + '"'), 'Verlauf ' + id + ' fehlt');
    assert.ok(orte.includes('url(#' + id + ')'), 'Verlauf ' + id + ' wird nicht benutzt');
  }
  // Die Schal-Rippen sind Kurven: ohne fill="none" malt der Browser sie schwarz aus.
  assert.match(orte, /<g stroke="rgba\(60,20,5,\.28\)" stroke-width="\.7" fill="none">/);
  assert.match(orte, /<g class="ort-schal" style="transform-origin:250px 48px">/, 'Schal behaelt seine Wackel-Klasse');
  assert.match(orte, /<g class="ort-blaetter" stroke-linecap="round">/, 'Rosmarin behaelt seine Wackel-Klasse');
  // Kelch und Schallwellen sitzen an derselben Stelle
  assert.ok(orte.includes('rotate(25 478 36)') && orte.includes('transform-origin:484px 40px'));
  assert.ok(!orte.includes('rotate(-25 478 36)'), 'Kelch war einmal falsch herum geneigt');
});

/* ===== 5.66: alle Dinge neu gemalt, eigene Tipp-Bewegungen, Teilchen ===== */

test('5.66: die neue Dinge-Datei steht in Bau, Desktop-Bau und Sandkasten', () => {
  assert.match(lies('build.sh'), /src\/57c-katze\.js src\/57d-orte-dinge\.js /);
  assert.match(lies('werkzeug/build-web.mjs'), /'src\/57c-katze\.js', 'src\/57d-orte-dinge\.js', /);
  assert.match(lies('test/sandkasten.mjs'), /'57c-katze\.js', '57d-orte-dinge\.js', /);
});

test('5.66: der Glanz haengt am Ding, nicht mehr in der Schicht darueber', async () => {
  const k = await frisch();
  k.document.documentElement.dataset.v2 = 'an';
  const oben = ['zuhause', 'schnipsel', 'blaetter', 'hefte', 'cluster', 'woerter', 'klang', 'faden', 'feinheiten'].map((r) => k.orteV2Malerei(r, 'oben')).join('');
  /* Formen antippbarer Dinge duerfen oben nicht mehr stehen — sie blieben beim Wackeln stehen. */
  for (const form of ['M86 56h70l-12-26H98z', 'x="544" y="92" width="32"', 'x="24" y="30" width="32"', 'M70 50c-18 0-26 14-26 26h52', 'x="364" y="28" width="96"', 'cx="700" cy="30" r="15.5"', 'x="90" y="26" width="40" height="18"', 'M680 118l10-70h20l10 70z', 'x="590" y="64" width="70"']) {
    assert.ok(!oben.includes(form), 'noch Glanz eines Dings oben: ' + form);
  }
  assert.ok(k.odGlanz('lampe').length > 100, 'der Glanz kommt mit dem Ding');
  /* Die Reiter im Zettelkasten liegen ueber dem Kastenglanz, nicht darunter. */
  const orte = lies('src/57-orte.js');
  assert.ok(orte.indexOf("orteV2Malerei('schnipsel', 'mitte')") < orte.indexOf("T('reiter'"), 'Kastenglanz vor den Reitern');
  k.document.documentElement.dataset.v2 = 'aus';
  assert.equal(k.odGlanz('lampe'), '', 'ohne v2 kein Glanz');
});

test('5.66: jedes antippbare Ding hat eine eigene Bewegung (mit v2 und Bewegung)', () => {
  const orte = lies('src/57-orte.js'), css = lies('src/10-style.css');
  const ids = [...new Set([...orte.matchAll(/T\('([a-z0-9]+)'/g)].map((m) => m[1]))];
  assert.ok(ids.length > 40);
  const ohne = ids.filter((id) => id !== 'spiegel' && !css.includes('html[data-v2="an"][data-v2bewegung="an"] .ort-tipp.ort-' + id + '.tippt'));
  assert.deepEqual(ohne, [], 'ohne eigene Tipp-Bewegung');
  /* Mit Kamera wackelt der Spiegel nicht — das Videobild koennte nicht mit. */
  assert.match(css, /\.ort-kulisse\.kamera \.ort-tipp\.ort-spiegel\.tippt \{ animation: none; \}/);
  /* Zweimal schnell tippen: der alte Zeitgeber bricht die neue Bewegung nicht ab. */
  assert.match(orte, /clearTimeout\(ding\._tippZeit\); ding\._tippZeit = setTimeout/);
});

test('5.66: Teilchen nur mit v2, Bewegung und ohne „Bewegung reduzieren“', async () => {
  const k = await frisch();
  const h = k.document.documentElement;
  h.dataset.v2 = 'an'; h.dataset.v2bewegung = 'aus';
  assert.equal(k.orteFunkenAn(), false);
  h.dataset.v2 = 'aus'; h.dataset.v2bewegung = 'an';
  assert.equal(k.orteFunkenAn(), false);
  const d = lies('src/57d-orte-dinge.js');
  assert.match(d, /prefers-reduced-motion: reduce/);
  assert.match(d, /childElementCount > 48\) return 0/, 'eine Obergrenze fuer wildes Tippen');
  assert.match(d, /setAttribute\('pointer-events', 'none'\)/, 'Teilchen fangen keine Tipps ab');
  assert.ok(!/ORTE_KLANG\b/.test(d), 'kein Namenszusammenstoss mit dem Klang der Orte');
});

test('5.66: neu gemalt — Schreibmaschine, Werkzeugwand, Grammophon, Bank, Feder', () => {
  const d = lies('src/57d-orte-dinge.js'), orte = lies('src/57-orte.js');
  for (const f of ['odSchreibmaschine', 'odHutAmHaken', 'odTintenfass', 'odFarbwalze', 'odGrammophonKasten', 'odMetronom', 'odKerze', 'odHammer', 'odSaege', 'odZange', 'odSchrauber', 'odWasserwaage', 'odMassband', 'odWerkzeugkiste', 'odStempel', 'odBriefe', 'odUhr', 'odJahreszeitHaken', 'odFarn', 'odBank']) {
    assert.match(d, new RegExp('function ' + f + '\\('), f + ' fehlt');
    assert.ok(orte.includes(f + '('), f + ' wird nicht benutzt');
  }
  /* Klassen, an denen Bewegung haengt, ueberleben das Neumalen */
  for (const kl of ['ort-taste', 'ort-pendel', 'ort-flamme', 'ort-libelle', 'ort-sekunde', 'ort-blaetter']) assert.ok(d.includes('class="' + kl + '"') || d.includes('class="' + kl + ' '), kl);
  /* Astloecher statt Blattumrissen auf dem Kuechentisch */
  assert.ok(!orte.includes('M300 40c-10 8-10 20 0 28 10-8 10-20 0-28z'));
});

test('5.66: die Dielenuhr geht weiter', async () => {
  const d = lies('src/57d-orte-dinge.js'), orte = lies('src/57-orte.js');
  assert.match(d, /class="' \+ kl \+ '"/);
  assert.match(d, /'ort-stunde'\) \+ zeiger\(11, m \* Math\.PI \/ 30, 1\.5, '#2c2218', 'ort-minute'\)/);
  assert.match(d, /if \(!wrap\.isConnected\) \{ clearInterval\(t\); return; \}/, 'der Zeitgeber raeumt sich weg');
  assert.match(orte, /orteUhrLaufen\(wrap\)/);
});

/* ===== 5.67: grosse Bugjagd ueber die ganze App ===== */

test('5.67: Einstellungen ueberleben den Neustart (v2, Bewegung, Album, Faden-Bibliothek)', async () => {
  const k = await frisch();
  k.uebernehmeEinstellungen({ v2: false, v2Bewegung: false, albumMarke: 'f1', albumBildnis: true, albumWorte: ['Ahnin', 7], fadenBibliothek: [{ x: 1 }] });
  assert.equal(k.D.einst.v2, false);
  assert.equal(k.D.einst.v2Bewegung, false);
  assert.equal(k.D.einst.albumMarke, 'f1');
  assert.equal(k.D.einst.albumBildnis, true);
  assert.deepEqual([...k.D.einst.albumWorte], ['Ahnin'], 'nur Woerter, keine Zahlen');
  assert.equal(k.D.einst.fadenBibliothek.length, 1);
  /* Jeder gesetzte D.einst-Schluessel hat einen Standard — sonst wirft die Uebernahme ihn beim Start weg. */
  const fs = await import('node:fs');
  const quellen = fs.readdirSync(join(wurzel, 'src')).filter((f) => f.endsWith('.js')).map((f) => lies('src/' + f)).join('\n');
  const gesetzt = new Set([...quellen.matchAll(/D\.einst\.(\w+)\s*(?:=[^=]|\|\|=|\?\?=)/g)].map((m) => m[1]));
  const core = lies('src/30-core.js'), std = core.slice(core.indexOf('const STANDARD_EINST'), core.indexOf('const D = {'));
  const bekannt = new Set([...std.matchAll(/(\w+)\s*:/g)].map((m) => m[1]));
  const fehlt = [...gesetzt].filter((s) => s !== 'klang' && !bekannt.has(s));
  assert.deepEqual(fehlt, [], 'Einstellungen ohne Standardwert gehen beim Neustart verloren');
});

test('5.67: fehlertolerante Suche bleibt richtig, wird aber nicht mehr teuer', async () => {
  const k = await frisch();
  assert.equal(k.fastGleich('der kartoffelsalat war kalt', 'kartofelsalat'.padEnd(13, 't')), false);
  assert.equal(k.fastGleich('der kartoffelsalat war kalt', 'kartoffelsalaz'), true, 'ein Tippfehler am Ende');
  assert.equal(k.fastGleich('der kartoffelsalat war kalt', 'xartoffelsalat'), true, 'ein Tippfehler am Anfang');
  assert.equal(k.fastGleich('ganz anderer text ohne treffer', 'kartoffelsalat'), false);
  const lang = 'abcdefghij '.repeat(60000);
  const t0 = Date.now(); k.fastGleich(lang, 'kartoffelsalat'); assert.ok(Date.now() - t0 < 150, 'langer Text ohne Treffer ist schnell');
});

test('5.67: Wortziel versteht deutsche Tausenderpunkte', async () => {
  const k = await frisch();
  assert.equal(k.zielZahl('80.000'), 80000);
  assert.equal(k.zielZahl('80 000'), 80000);
  assert.equal(k.zielZahl('2500'), 2500);
  assert.equal(k.zielZahl(''), 0);
  assert.equal(k.zielZahl('abc'), 0);
});

test('5.67: Daten — Import meldet sich beim Sync, Sync loescht in den Papierkorb, offener Text bleibt', () => {
  const an = lies('src/49b-ankommen.js'), fh = lies('src/49-feinheiten.js'), sy = lies('src/31-sync.js');
  assert.match(an, /syncDokumentGeaendert\(d, false\)/);
  assert.match(fh, /syncDokumentGeaendert\(d, false\)/);
  assert.match(an, /'vorImport'/, 'vor dem Ersetzen ein Netz');
  assert.match(sy, /herkunft: 'sync'/, 'Loeschen vom anderen Geraet geht in den Papierkorb');
  assert.match(sy, /_sr\.doc\.id === id && \(d\.text !== alt\.text \|\| d\.rich !== alt\.rich\)/, 'offener Text wird nicht unter den Haenden ersetzt');
  assert.match(sy, /standEinfrieren\(alt, 'Fassung vom anderen Gerät', d\.text, d\.rich\)/);
});

test('5.67: Speicher — tote Verbindung wird neu geoeffnet, Bildfehler haengen nicht', () => {
  const c = lies('src/30-core.js'), m = lies('src/38-media.js');
  assert.match(c, /if \(!e \|\| e\.name !== 'InvalidStateError'\) throw e;\s*_db = null; await dbAuf\(\);/);
  assert.match(c, /_db\.onversionchange = /);
  assert.match(m, /\} catch \(e\) \{ res\(null\); \}\s*\}, 'image\/png'\);/, 'Speicherfehler im toBlob loest auf');
});

test('5.67: Schreiben — Kritzeln, Schreibmaschine, Ansehen ohne Aendern, Rettung', () => {
  const h = lies('src/43-hefte.js'), sm = lies('src/57b-schreibmaschine.js'), sr = lies('src/45-schreibraum.js'), rt = lies('src/35-richtext.js'), si = lies('src/32-sicherheit.js');
  assert.match(h, /const beiWeg = async \(\) => \{ if \(kritzelVeraendert\) \{ try \{ await kritzelSichern\(\); \} catch \(e\) \{\} \} aufraeumen\(\); \};/, 'Weggehen sichert die Striche');
  assert.match(h, /document\.addEventListener\('visibilitychange', beiVersteckt\)/, 'Hintergrund sichert');
  assert.match(h, /Math\.sqrt\(16e6 \/ \(b \* h\)\)/, 'Pixelgrenze fuer iOS');
  assert.match(sm, /\{ ja: 'Verwerfen', nein: 'Ablegen', gefahr: true \}\); if \(!weg\) ablegen\(\);/, 'Escape legt ab, verwirft nicht');
  assert.match(sm, /d\.rich = richAusText\(t\); d\.format = 'rich';/, 'zweites Ablegen auch formatiert');
  assert.match(sr, /if \(doc\.text === ta\.value\) return;/);
  assert.match(rt, /if \(rich === doc\.rich && doc\.format === 'rich'\) return;/);
  assert.match(sr, /_sr\.rettung\.loesen\(\)/, 'der Rettungs-Spueler wird ausgetragen');
  assert.match(si, /ohneLeer\(doc\.text\) === ohneLeer\(r\.text\)/, 'kein grundloses „Da war noch etwas“');
});

test('5.67: Klang — Ausklang speichert nicht, Freigabe nur einmal gleichzeitig, zu lange Aufnahmen', () => {
  const a = lies('src/53-ambience.js'), au = lies('src/50-audio.js'), kr = lies('src/51-klangraum.js');
  const ausklang = a.slice(a.indexOf('function ausklangStarten'), a.indexOf('_ausklang = { ende'));
  assert.ok(!/setzeLautstaerke\(start \* /.test(ausklang), 'der Ausklang ueberschreibt die gespeicherte Lautstaerke nicht');
  assert.match(au, /if \(_audioFreigabeLaeuft\) return _audioFreigabeLaeuft/);
  assert.match(a, /f\.zuLang = true/);
  assert.match(a, /\(fehler && fehler\.zuLang\)\) throw fehler;/, 'eine zu lange eigene Aufnahme wird nicht weggeworfen');
  assert.match(kr, /await audioFreigeben\(\);\s*\/\* Erst jetzt lesen/, 'Mischung erst nach der Freigabe lesen');
});

test('5.67: Bedienung — Raumleiste zeigt den aktiven Raum, Tippflaechen auf Touch, Raumfehler ohne leere Seite', () => {
  const css = lies('src/10-style.css'), r = lies('src/40-router.js');
  const vorV2 = css.slice(0, css.indexOf('GESTALTUNG v2 (5.63)'));
  assert.match(vorV2, /@media \(max-height: 860px\) and \(min-width: 701px\)/);
  assert.match(vorV2, /\.raumrolle\.mehr-unten \{/);
  assert.match(vorV2, /@media \(pointer: coarse\) \{\s*\.format-knopf \{ min-width: 38px; min-height: 40px; \}/);
  assert.match(r, /Dieser Raum hakt gerade\. Deine Texte sind sicher\./);
  assert.match(r, /const gleicherRaum = haupt\.dataset\.ansicht === location\.hash;/, 'Leseposition bleibt beim Neuzeichnen');
  assert.match(r, /Der aktive Raum liegt in der Rolle immer im Sichtbaren/);
});

test('5.67: Raeume — Schnipsel, Karteikarten, Cluster-Export, Uhr, Malschleifen', () => {
  const s = lies('src/42-schnipsel.js'), kk = lies('src/47b-karteikarten.js'), cl = lies('src/46-cluster.js'), st = lies('src/54-schreibtisch.js');
  assert.match(s, /Das Bild kann nur auf eine Heftseite mit/);
  assert.match(s, /Der Schnipsel ist länger als ein Wort/);
  assert.match(kk, /e\.target\.closest\('button, input, textarea, select, \[contenteditable\]'\) && e\.target !== karte\) return;/);
  assert.match(cl, /Math\.sqrt\(14e6 \/ \(breite \* hoehe\)\)/);
  assert.match(st, /timer\._glocke !== d\.getHours\(\)/);
  for (const f of ['src/54b-schreibtisch-malerei.js', 'src/56b-salon-malerei.js']) assert.match(lies(f), /if \(canvas\.isConnected\) canvas\._warDran = true; else if \(canvas\._warDran\) \{ laeuft = false; return; \}/, f);
});

/* ===================== 5.68 ===================== */
const roh568 = (x) => JSON.parse(JSON.stringify(x));

test('5.68: Etiketten — sauber, und die Suche findet sie mit #, auch mit Leerzeichen', async () => {
  const k = await frisch();
  assert.deepEqual(roh568(k.etikettenSauber(['Plot', 'plot', '#Mira', '  Rot ', '', 'x'.repeat(50), null])), ['Plot', 'Mira', 'Rot', 'x'.repeat(40)]);
  assert.equal(k.etikettenSauber(Array.from({ length: 40 }, (_, i) => 'e' + i)).length, 24, 'hoechstens 24');
  const a = doc(k, { typ: 'blatt', titel: 'Hafen', text: 'Mira stand am Hafen.', etiketten: ['Kapitel 3', 'Wasser'] });
  doc(k, { typ: 'blatt', titel: 'Turm', text: 'Mira stand im Turm.', etiketten: ['Kapitel 4'] });
  const titel = (r) => roh568(k.suchErgebnisse(k.D.docs.values(), r).flatMap((g) => g.liste.map((x) => x.d.titel)));
  assert.deepEqual(titel('#Kapitel3'), ['Hafen'], 'Leerzeichen im Etikett zaehlen nicht');
  assert.deepEqual(titel('#kap').sort(), ['Hafen', 'Turm'], 'der Anfang genuegt');
  assert.deepEqual(titel('#Kapitel3 #Wasser Mira'), ['Hafen'], 'mehrere Etiketten und Text zugleich');
  assert.deepEqual(titel('#zzz Mira'), [], 'ein unbekanntes # bleibt Suchtext');
  assert.equal(a.etiketten.length, 2);
});

test('5.68: Randnotizen — saubere Liste, nur der Notiz-Span ueberlebt die Saeuberung', async () => {
  const k = await frisch();
  const liste = k.randnotizenSauber([{ id: 'nabc12', text: 'Hallo', wann: 5 }, { id: 'boese"><x', text: 'x' }, null, { id: 'n1', text: 'zu kurz' }]);
  assert.deepEqual(roh568(liste).map((n) => n.id), ['nabc12']);
  const viele = Array.from({ length: 310 }, (_, i) => ({ id: 'nid' + String(i).padStart(4, '0'), text: 't' + i }));
  const gekappt = k.randnotizenSauber(viele);
  assert.equal(gekappt.length, 300);
  assert.equal(gekappt[gekappt.length - 1].id, 'nid0309', 'die neueste bleibt, die aeltesten fallen');
  /* Die Saeuberung (braucht ein DOM, darum am Quelltext): nur SPAN, nur gepruefte Kennung, alles andere faellt */
  const rt = lies('src/35-richtext.js');
  assert.match(rt, /const notizId = node\.tagName === 'SPAN' \? String\(node\.getAttribute\('data-notiz'\) \|\| ''\) : '';/);
  assert.match(rt, /if \(notizId && \/\^n\[a-z0-9\]\{4,24\}\$\/\.test\(notizId\)\) node\.setAttribute\('data-notiz', notizId\);/);
  assert.equal(k.randnotizStelle({ rich: '<p>Am <span data-notiz="nabc12" style="color:red">Hafen</span>.</p>' }, 'nabc12'), 'Hafen', 'auch mit Zusatz am Span');
  const md = lies('src/35b-randnotizen.js');
  assert.match(md, /gemeinsam\.nodeType === 1 \? gemeinsam : gemeinsam\.parentElement/, 'keine Notiz in einer Notiz');
  assert.match(md, /function randnotizenAufraeumen/, 'doppelte Kennungen nach Einfuegen werden geloest');
});

test('5.68: Manuskript — ZIP mit richtiger Pruefsumme, Normseiten 60 x 30, Kapitel rechts, PDF heil', async () => {
  const k = await frisch();
  assert.equal(k.crc32(new TextEncoder().encode('123456789')) >>> 0, 0xcbf43926);
  const zip = k.zipBauen([{ name: 'mimetype', daten: 'application/epub+zip' }, { name: 'a/ä.txt', daten: 'Grüße' }]);
  const dv = new DataView(zip.buffer);
  assert.equal(dv.getUint32(0, true), 0x04034b50);
  assert.equal(new TextDecoder().decode(zip.slice(30, 38)), 'mimetype', 'mimetype zuerst und ungepackt');
  assert.equal(dv.getUint32(zip.length - 22, true), 0x06054b50);
  const zeilen = k.nsUmbrechen('Wort '.repeat(40) + 'https://beispiel.de/' + 'x'.repeat(130), true);
  assert.ok(zeilen.every((z) => z.length <= k.NS_SPALTEN), 'keine Zeile ueber 60 Zeichen');
  assert.ok(k.nsUmbrechen('y'.repeat(150), false).every((z) => z.length <= 60), 'auch ein ueberlanges erstes Wort wird gebrochen');
  const absatz = { art: 'absatz', laeufe: [{ t: 'Satz. '.repeat(400) }] };
  const kapitel = [{ titel: 'Eins', szenen: [{ titel: '', absaetze: [absatz] }] }, { titel: 'Zwei', szenen: [{ titel: '', absaetze: [{ art: 'absatz', laeufe: [{ t: 'kurz' }] }] }] }];
  const seiten = k.nsSeiten(kapitel);
  assert.ok(seiten.every((s) => s.length <= k.NS_ZEILEN), 'hoechstens 30 Zeilen je Seite');
  const zwei = seiten.findIndex((s) => s.some((z) => z.t === 'Zwei'));
  assert.equal(zwei % 2, 0, 'Kapitel zwei beginnt auf einer ungeraden Seite (rechts)');
  /* Langer Titel mit Klammer: die Kopfzeile darf den Inhaltsstrom nicht brechen */
  const p = { id: 'p1', titel: 'T'.repeat(88) + '(x) „Hafen“', art: 'Roman' };
  const { bytes } = k.pdfNormseiten(p, kapitel, { name: 'A', worte: 10 });
  const pdf = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  for (const zeile of pdf.split('\n').filter((z) => / Tj ET$/.test(z))) {
    const inhalt = zeile.slice(zeile.indexOf('(') + 1, zeile.lastIndexOf(') Tj'));
    assert.ok(!/(^|[^\\])(\\\\)*[()]/.test(inhalt.replace(/\\[()\\]/g, '')), 'ungeschuetzte Klammer in: ' + zeile.slice(0, 80));
    assert.ok(!/\\$/.test(inhalt.replace(/\\\\/g, '')), 'kein einsamer Backslash am Ende');
  }
  assert.match(pdf, /\/Info \d+ 0 R/, 'Info als eigenes Objekt');
  assert.match(pdf, /\/Title <FEFF/, 'Titel als Unicode');
  const xref = +pdf.match(/startxref\n(\d+)/)[1];
  assert.equal(pdf.slice(xref, xref + 4), 'xref', 'Versatztabelle sitzt');
  const m = lies('src/44c-manuskript.js');
  assert.match(m, /sect\(ki === 0 \? 'nextPage' : 'oddPage', false, ki === 0\)/, 'Kapitel 1 direkt nach dem Titelblatt, Zaehlung ab 1');
  assert.match(m, /'-4' \+ hex\.slice\(13, 16\)/, 'gueltige UUID im EPUB');
});

test('5.68: Synonyme — Index, Hauptform zuerst, einfache Beugung, Grossschreibung', async () => {
  const k = await frisch();
  const probe = '# Kommentar\nschön;hübsch;ansprechend\neinverstanden (ugs.);schön;gut\nHund;Köter (ugs.);Vierbeiner\nkalt (Hauptform);frostig;eisig\nallein\n';
  const { saetze, index } = k.synBaueIndex(probe);
  assert.equal(saetze.length, 4, 'Kommentare und Einzelwoerter zaehlen nicht');
  assert.ok(index.has('schon') && index.has('koter'), 'normalisierte Schluessel ohne Zusatz');
  k.SYN.saetze = saetze; k.SYN.index = index;
  const schoen = k.synonymeFuer('schön');
  assert.deepEqual(roh568(schoen[0]), ['hübsch', 'ansprechend'], 'die schlichte Bedeutung zuerst, das Wort selbst fehlt');
  assert.deepEqual(roh568(k.synonymeFuer('Hunde')[0]), ['Köter (ugs.)', 'Vierbeiner'], 'Hunde → Hund, die Grundform selbst nicht');
  assert.deepEqual(roh568(k.synonymeFuer('kalt')[0]), ['frostig', 'eisig']);
  assert.deepEqual(roh568(k.synonymeFuer('Quatschwort')), []);
  assert.equal(k.synAnpassen('Schön', 'hübsch'), 'Hübsch');
  assert.equal(k.synAnpassen('kalt', 'eisig (geh.)'), 'eisig');
  const s = lies('src/35c-synonyme.js');
  assert.match(s, /cache: 'no-cache'/, 'nie einen alten Fehler aus dem Browser-Cache');
  assert.match(s, /text\.length < 100000 \|\| \/\^\\s\*<\/\.test\(text\)/, 'eine Startseite statt Thesaurus wird nicht gemerkt');
  /* Ausgeliefert wird der Ordner ueberall */
  for (const f of ['server.js', 'sync-server/server.mjs', 'desktop/main.cjs']) assert.match(lies(f), /OEFFENTLICHE_ORDNER = new Set\(\[[^\]]*'synonyme'/, f);
  assert.match(lies('package.json'), /"synonyme\/\*\*"/);
  assert.match(lies('hosting/scripts/copy-vani.mjs'), /kopiereOrdner\('synonyme'\)/);
  assert.match(lies('sw.js'), /url\.pathname\.indexOf\('\/synonyme\/'\) !== -1\) return;/, 'nicht doppelt im SW-Cache');
  assert.match(lies('synonyme/LIZENZ.txt'), /LESSER GENERAL PUBLIC LICENSE/);
  /* Der Knopf liegt ueber dem Schreibraum, unter den Fenstern */
  const css = lies('src/10-style.css');
  const z = +css.match(/\.syn-pille \{ position: fixed; z-index: (\d+);/)[1];
  const sr = +css.match(/\.schreibraum \{[^}]*z-index: (\d+)/)[1];
  assert.ok(z > sr && z < 100, 'z-index ' + z);
});

test('5.68: Figuren-Auftritte — Namen ohne Anrede, keine Doppelzaehlung, Geschichtsreihenfolge', async () => {
  const k = await frisch();
  assert.deepEqual(roh568(k.figurNamen({ name: 'Mira Stern', felder: { nennung: 'Mimi; Sternchen' } })), ['Mira Stern', 'Mira', 'Mimi', 'Sternchen']);
  assert.deepEqual(roh568(k.figurNamen({ name: 'Frau Meier' })), ['Frau Meier'], 'keine Anrede als Vorname');
  assert.deepEqual(roh568(k.figurNamen({ name: 'Der Alte' })), ['Der Alte']);
  const n = (t, namen) => k.figurZaehlen(k.normalisiere(t), namen.map((x) => k.normalisiere(x)));
  assert.equal(n('Dann kam Mira Stern. Mira lachte.', ['Mira Stern', 'Mira']), 2, 'der volle Name zaehlt einmal');
  assert.equal(n('Miras Hut. Mirabelle.', ['Mira']), 0, 'nur ganze Woerter');
  assert.equal(n('Jürgen, jurgen und JÜRGEN', ['Jürgen']), 3, 'Umlaute und Gross egal');
  const proj = doc(k, { typ: 'projekt', titel: 'Roman' });
  const k1 = doc(k, { typ: 'kapitel', parent: proj.id, titel: 'Eins', ord: 0 });
  const k2 = doc(k, { typ: 'kapitel', parent: proj.id, titel: 'Zwei', ord: 1 });
  doc(k, { typ: 'szene', parent: k2.id, projekt: proj.id, ord: 0, titel: 'Spaet', text: 'Mira ging.' });
  doc(k, { typ: 'szene', parent: k1.id, projekt: proj.id, ord: 0, titel: 'Frueh', text: 'Mira kam.' });
  doc(k, { typ: 'szene', parent: k1.id, projekt: proj.id, ord: 1, titel: 'Ohne', text: 'Niemand.' });
  const { treffer } = k.figurAuftritte({ name: 'Mira' });
  assert.deepEqual(roh568(treffer.map((t) => t.d.titel)), ['Frueh', 'Spaet'], 'in der Reihenfolge der Geschichte');
  assert.match(lies('src/62d-album-mehr.js'), /\$\$\('\.schleier'\)\.forEach\(\(s\) => schliesseDeck\(s\)\)/, 'Fenster ordentlich schliessen');
});

test('5.68: Rueckgaengig nach dem Loeschen holt Verweise zurueck und raeumt den Korb', async () => {
  const k = await frisch();
  k.schritteVergessen();
  const a = doc(k, { typ: 'blatt', titel: 'A', text: 'a' });
  const b = doc(k, { typ: 'blatt', titel: 'B', text: 'b', quelle: a.id });
  await k.sicherSpeichern('docs', a); await k.sicherSpeichern('docs', b);
  const korb = async () => (await k.dbAlle('papierkorb')).length;
  const vorher = await korb();
  await k.loesche(a.id, true); await mikrotasksLeeren();
  assert.equal(k.D.docs.has(a.id), false);
  assert.equal(k.D.docs.get(b.id).quelle, undefined, 'der Verweis ist geputzt');
  assert.equal(await korb(), vorher + 1);
  await k.schrittZurueck(); await mikrotasksLeeren();
  assert.equal(k.D.docs.has(a.id), true, 'A ist wieder da');
  assert.equal(k.D.docs.get(b.id).quelle, a.id, 'und B zeigt wieder auf A');
  assert.equal((await k.dbGet('docs', b.id)).quelle, a.id, 'auch im Speicher');
  assert.equal(await korb(), vorher, 'kein Duplikat im Korb');
  /* Zwischendurch weitergeschrieben — Wiederholen nimmt den neuen Stand mit in den Korb */
  k.D.docs.get(a.id).text = 'a, weitergeschrieben';
  await k.schrittVor(); await mikrotasksLeeren();
  assert.equal(k.D.docs.has(a.id), false);
  const buendel = (await k.dbAlle('papierkorb')).find((x) => x.docs.some((d) => d.id === a.id));
  assert.equal(buendel.docs.find((d) => d.id === a.id).text, 'a, weitergeschrieben');
});

test('5.68: Staende liegen getrennt — Dokument klein, Staende nur bei Aenderung, Geloeschtes kommt nicht zurueck', async () => {
  const k = await frisch();
  const d = doc(k, { typ: 'blatt', titel: 'S', text: 'jetzt', staende: [{ wann: 1000, text: 'frueher', worte: 1 }] });
  await k.sicherSpeichern('docs', d);
  const imDoc = await k.dbGet('docs', d.id);
  assert.equal('staende' in imDoc, false, 'das Dokument reist ohne Staende');
  assert.equal(imDoc.text, 'jetzt');
  assert.equal((await k.dbGet('staende', d.id)).length, 1);
  await k.dbPut('staende', ['marke'], d.id);
  await k.sicherSpeichern('docs', d);
  assert.deepEqual(roh568(await k.dbGet('staende', d.id)), ['marke'], 'unveraenderte Staende werden nicht neu geschrieben');
  d.staende.push({ wann: 2000, text: 'neuer', worte: 1 });
  await k.sicherSpeichern('docs', d);
  assert.equal((await k.dbGet('staende', d.id)).length, 2);
  const s = lies('src/32-sicherheit.js');
  assert.match(s, /if \(typeof istWeggeraeumt === 'function' && istWeggeraeumt\(wert\)\) return true;\n?\s*\/\* Der Text ist wichtiger/, 'nach dem Warten auf die Staende erneut pruefen');
  assert.match(s, /const textOk = await sicherSpeichern\('docs-roh'/, 'der Text wird auch ohne Staende gesichert');
  assert.match(lies('src/30-core.js'), /getAllKeys\(\), w = s\.getAll\(\); return \{ get result\(\)/, 'Schluessel und Werte in einer Transaktion');
});

test('5.68: Profil — Pruefwert ist nicht mehr der Schluessel, alte Profile ziehen um', async () => {
  const k = await frisch();
  const p = await k.profilErstelle('Pruefling', 'eine-lange-test-tuer', true);
  assert.match(p.pruefung, /^v2_[A-Za-z0-9_-]{43}$/);
  const ab = await k.profilLeiteAb('eine-lange-test-tuer', p.salz);
  assert.notEqual(p.pruefung.slice(3), ab.pruefungAlt, 'der gespeicherte Wert ist nicht das Schluesselmaterial');
  assert.ok(await k.profilPruefePasswort(p, 'eine-lange-test-tuer'));
  /* Ein Profil im alten Format */
  const reg = k.profilLadeRegistry();
  reg[0].pruefung = ab.pruefungAlt;
  k.profilSpeichereRegistry(reg);
  const alt = k.profilLadeRegistry()[0];
  assert.equal(alt.pruefung, ab.pruefungAlt, 'die Registry nimmt das alte Format an');
  assert.ok(await k.profilPruefePasswort(alt, 'eine-lange-test-tuer'), 'altes Format laesst herein');
  assert.match(k.profilLadeRegistry()[0].pruefung, /^v2_/, 'und wird umgestellt');
  assert.equal(await k.profilPruefePasswort(p, 'falsch'), null);
});

test('5.68: Sicherung, Speicher, Einstellungen', async () => {
  const k = await frisch();
  assert.equal(k.STANDARD_EINST.synonyme, true);
  assert.equal(k.STANDARD_EINST.manuskriptName, '');
  k.D.stats.letzteSicherung = 0;
  assert.equal(k.sicherungAmpel().farbe, 'rot');
  k.D.stats.letzteSicherung = Date.now() - 3 * 86400000;
  assert.equal(k.sicherungAmpel().farbe, 'gruen');
  k.D.stats.letzteSicherung = Date.now() - 10 * 86400000;
  assert.equal(k.sicherungAmpel().farbe, 'gelb');
  const c = lies('src/30-core.js');
  assert.match(c, /if \(!statsInDenSync\.haengt\(\)\) statsInDenSync\(\);/, 'Statistik gedrosselt, nicht nur entprellt');
  assert.match(lies('src/49-feinheiten.js'), /if \(typeof inhalt !== 'string'\) \{ toast\('Das hat leider nicht geklappt\.'\); return false; \}/, 'Binaeres nie in die Zwischenablage');
});
