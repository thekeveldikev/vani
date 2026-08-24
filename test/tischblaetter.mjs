/* Die Blätter auf dem Tisch (54e) und das Diktat (45c).
   Der Kern der Blätterwahl: Sie darf nie veralten. Was gelöscht ist, liegt
   nicht mehr da; was neu ist, lässt sich sofort wählen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function doc(k, id, felder) {
  const d = k.sauberesDokument({ id, typ: 'blatt', angelegt: 1, geaendert: 1, ...felder });
  k.D.docs.set(d.id, d);
  return d;
}

test('Die Weisen: VANI legt hin, solange nichts anderes gewählt ist', async () => {
  const k = await frisch();
  assert.equal(k.tischblattModus(undefined), 'vani');
  assert.equal(k.tischblattModus({ blaetterModus: 'selbst' }), 'selbst');
  assert.equal(k.tischblattModus({ blaetterModus: 'unfug' }), 'vani', 'Unsinn wird zur Vorgabe');
  assert.equal(k.TISCHBLATT_MODI.length, 2);
});

test('Die Wahl nimmt höchstens drei, keine doppelt, nur Kennungen', async () => {
  const k = await frisch();
  assert.equal(JSON.stringify(k.saubereTischblattWahl(['a', 'b', 'a', 'c', 'd'])), JSON.stringify(['a', 'b', 'c']));
  assert.equal(JSON.stringify(k.saubereTischblattWahl(['a', 42, null, 'b'])), JSON.stringify(['a', 'b']), 'nur Zeichenketten');
  assert.equal(JSON.stringify(k.saubereTischblattWahl(undefined)), '[]');
  assert.equal(JSON.stringify(k.saubereTischblattWahl('kein Feld')), '[]');
});

test('Gelöschtes liegt nicht mehr auf dem Tisch — die Wahl bleibt aber stehen', async () => {
  const k = await frisch();
  doc(k, 'a', { titel: 'Erstes' });
  doc(k, 'b', { titel: 'Zweites' });
  doc(k, 'c', { titel: 'Drittes' });
  const e = { blaetterModus: 'selbst', blaetter: ['a', 'b', 'c'] };
  assert.equal(k.tischblaetter(e).map((d) => d.titel).join(','), 'Erstes,Zweites,Drittes');
  /* Das mittlere wandert in den Papierkorb */
  k.D.docs.get('b').geloescht = true;
  assert.equal(k.tischblaetter(e).map((d) => d.titel).join(','), 'Erstes,Drittes', 'weg vom Tisch');
  assert.equal(JSON.stringify(e.blaetter), JSON.stringify(['a', 'b', 'c']), 'die Wahl selbst bleibt — es kann ja zurückkommen');
  /* Und es kommt zurück */
  delete k.D.docs.get('b').geloescht;
  assert.equal(k.tischblaetter(e).map((d) => d.titel).join(','), 'Erstes,Zweites,Drittes');
  /* Ein Text, den es gar nicht gibt, stört nicht */
  assert.equal(k.tischblaetter({ blaetterModus: 'selbst', blaetter: ['gibtsnicht', 'a'] }).map((d) => d.id).join(','), 'a');
});

test('Neu Geschriebenes steht sofort zur Wahl, Gelöschtes nicht mehr', async () => {
  const k = await frisch();
  doc(k, 'alt', { titel: 'Alt', geaendert: 100 });
  assert.equal(k.tischblattWaehlbar().length, 1);
  doc(k, 'neu', { titel: 'Neu', geaendert: 900 });
  const w = k.tischblattWaehlbar();
  assert.equal(w.length, 2);
  assert.equal(w[0].titel, 'Neu', 'das Neueste zuerst');
  k.D.docs.get('alt').geloescht = true;
  assert.equal(k.tischblattWaehlbar().map((d) => d.titel).join(','), 'Neu', 'Gelöschtes fällt heraus');
  /* Ein Typ, der nicht auf den Tisch gehört, taucht nicht auf */
  doc(k, 'kante', { typ: 'kante', titel: 'Verbindung' });
  assert.equal(k.tischblattWaehlbar().map((d) => d.titel).join(','), 'Neu');
});

test('Jedes Blatt hat einen lesbaren Namen, auch ohne Titel', async () => {
  const k = await frisch();
  assert.equal(k.tischblattName(doc(k, 'x1', { titel: 'Mit Titel' })), 'Mit Titel');
  assert.equal(k.tischblattName(doc(k, 'x2', { titel: '', text: 'Der erste Satz steht hier und ist etwas länger als vierzig Zeichen.' })), 'Der erste Satz steht hier und ist etwas …');
  assert.equal(k.tischblattName(doc(k, 'x3', { titel: '', text: '' })), 'Blatt');
  assert.equal(k.tischblattName(doc(k, 'x4', { typ: 'seite', titel: '', text: '' })), 'Heftseite');
  assert.equal(k.tischblattArt(doc(k, 'x5', { typ: 'projekt' })), 'Projekt');
  assert.equal(k.tischblattName(null), '');
});

test('Diktat: gesprochene Satzzeichen werden Zeichen', async () => {
  const k = await frisch();
  assert.equal(k.diktatSaeubern('das war knapp punkt'), 'Das war knapp.');
  assert.equal(k.diktatSaeubern('wirklich fragezeichen'), 'Wirklich?');
  assert.equal(k.diktatSaeubern('erstens komma zweitens'), 'Erstens, zweitens');
  assert.ok(k.diktatSaeubern('eins neuer absatz zwei').includes('\n\n'));
  /* Nach einem Satzende wird groß weitergeschrieben */
  assert.equal(k.diktatSaeubern('er ging punkt sie blieb punkt'), 'Er ging. Sie blieb.');
  assert.equal(k.diktatSaeubern(''), '');
  assert.equal(k.diktatSaeubern(null), '');
});

test('Ein Bildverweis ist eine Kennung — auch wenn ein Objekt hineingeriet', async () => {
  const k = await frisch();
  /* Genau der Fehler aus dem Album: waehleBild liefert { id, breite, hoehe },
     und das ganze Objekt landete als Bild am Dokument. Danach sucht die
     Medienablage nach einem Objekt und findet nie etwas. */
  const d = k.sauberesDokument({ id: 'b1', typ: 'albumfigur', bild: { id: 'm-42', breite: 800, hoehe: 600 }, angelegt: 1, geaendert: 1 });
  assert.equal(d.bild, 'm-42', 'die Kennung wird herausgeholt');
  /* Und was schon als Text verdorben gespeichert wurde, faellt weg —
     dann steht wieder das Monogramm da statt einer leeren Platte. */
  const kaputt = k.sauberesDokument({ id: 'b2', typ: 'albumfigur', bild: '[object Object]', angelegt: 1, geaendert: 1 });
  assert.equal(kaputt.bild, undefined, 'ein verdorbener Verweis wird weggeraeumt');
  /* Eine echte Kennung bleibt unangetastet */
  assert.equal(k.sauberesDokument({ id: 'b3', typ: 'foto', bild: 'm-7', angelegt: 1, geaendert: 1 }).bild, 'm-7');
  /* Dasselbe gilt fuer die anderen Verweise */
  assert.equal(k.sauberesDokument({ id: 'b4', typ: 'seite', skizze: { id: 'm-9' }, angelegt: 1, geaendert: 1 }).skizze, 'm-9');
});

test('Jahreszeiten: zwölf Monate, jeder mit einem eigenen Stück', async () => {
  const k = await frisch();
  /* Alle zwölf sind da und vollständig — keiner fällt in ein Loch. */
  for (let m = 1; m <= 12; m++) {
    const d = k.JAHRESZEIT_DEKO[m];
    assert.ok(d, 'Monat ' + m + ' fehlt');
    assert.ok(d.name && d.was && d.satz, 'Monat ' + m + ': Name, Sache und Satz');
    assert.ok(d.stueck.startsWith('<svg') && d.stueck.includes('</svg>'), 'Monat ' + m + ': ein ganzes Bild');
    assert.ok(Array.isArray(d.lose) && d.lose.length >= 1, 'Monat ' + m + ': mindestens eine Kleinigkeit');
    for (const l of d.lose) assert.ok(l.startsWith('<svg'), 'Monat ' + m + ': Kleinigkeit ist ein Bild');
  }
  /* Der echte Monat entscheidet — nicht die Jahreszeit. */
  assert.equal(k.jahreszeitMonat({}, Date.UTC(2026, 9, 14)), 10, 'Oktober');
  assert.equal(k.jahreszeitDeko({}, Date.UTC(2026, 9, 14)).name, 'Oktober');
  assert.equal(k.jahreszeitDeko({}, Date.UTC(2026, 3, 2)).name, 'April');
  assert.equal(k.jahreszeitDeko({}, Date.UTC(2026, 11, 24)).name, 'Dezember');
  /* Wer eine feste Jahreszeit gewählt hat, bekommt deren Mitte — sonst
     hätte die Wahl am Schreibtisch hier keine Wirkung. */
  assert.equal(k.jahreszeitMonat({ jahreszeit: 'winter' }, Date.UTC(2026, 6, 1)), 1);
  assert.equal(k.jahreszeitMonat({ jahreszeit: 'herbst' }, Date.UTC(2026, 6, 1)), 10);
  assert.equal(k.jahreszeitMonat({ jahreszeit: 'echt' }, Date.UTC(2026, 6, 1)), 7, 'echt heißt: der echte Monat');
  /* Standardmäßig an, abschaltbar */
  assert.equal(k.jahreszeitAn(undefined), true);
  assert.equal(k.jahreszeitAn({ jahreszeitDeko: false }), false);
  assert.equal(k.jahreszeitAn({ jahreszeitDeko: true }), true);
});
