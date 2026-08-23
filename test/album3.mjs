/* Das Album, Ausbaustufe 3 (62d). Was hier geprüft wird, ist genau das, was
   beim Blättern schiefgehen kann: die Rechnerei, welche Doppelseite gerade
   dran ist, die Ordnungen, der Geschichten-Filter, die Abschrift (die
   Datumsfelder NICHT mitnehmen darf) und das Netz. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function figur(k, id, name, felder, mehr) {
  const d = { id, typ: 'albumfigur', angelegt: 1, geaendert: 1, name, felder: felder || {}, eigene: [], zettel: [], farbe: '', ...(mehr || {}) };
  k.D.docs.set(id, d);
  return d;
}

test('Das Buch hat vorn ein Titelblatt und hinten eine leere Doppelseite', async () => {
  const k = await frisch();
  const liste = [figur(k, 'a', 'Alma'), figur(k, 'b', 'Bo')];
  assert.equal(k.albumBlattAnzahl(liste), 4, 'Titel + zwei Figuren + leere');
  assert.equal(k.albumBlattArt(0, liste), 'titel');
  assert.equal(k.albumBlattArt(1, liste), 'figur');
  assert.equal(k.albumBlattArt(2, liste), 'figur');
  assert.equal(k.albumBlattArt(3, liste), 'neu');
  assert.equal(k.albumFigurBei(0, liste), null, 'auf dem Titelblatt wohnt niemand');
  assert.equal(k.albumFigurBei(1, liste).name, 'Alma');
  assert.equal(k.albumFigurBei(3, liste), null, 'die leere gehört auch niemandem');
  /* Auch ein ganz leeres Album hat zwei Doppelseiten und stürzt nirgends ab */
  assert.equal(k.albumBlattAnzahl([]), 2);
  assert.equal(k.albumBlattArt(1, []), 'neu');
  assert.equal(k.albumFigurBei(1, []), null);
});

test('Wer nicht in der Liste steht, landet am Titelblatt statt im Nichts', async () => {
  const k = await frisch();
  const liste = [figur(k, 'a', 'Alma'), figur(k, 'b', 'Bo')];
  assert.equal(k.albumBlattVon('b', liste), 2);
  assert.equal(k.albumBlattVon('a', liste), 1);
  assert.equal(k.albumBlattVon('gibtsnicht', liste), 0, 'kein -1, das wäre eine kaputte Seite');
  assert.equal(k.albumBlattVon('a', []), 0);
});

test('Die Ordnungen ordnen — und lassen die Ausgangsliste in Ruhe', async () => {
  const k = await frisch();
  const alle = [
    figur(k, 'c', 'Caspar', { augen: 'grau', haare: 'rot', beruf: 'Fischer' }, { angelegt: 30, geaendert: 30 }),
    figur(k, 'a', 'Alma', {}, { angelegt: 10, geaendert: 90 }),
    figur(k, 'b', 'Bo', { augen: 'braun' }, { angelegt: 20, geaendert: 20 })
  ];
  const vorher = alle.map((f) => f.id).join(',');
  assert.equal(k.albumGeordnet(alle, 'alphabet').map((f) => f.name).join(','), 'Alma,Bo,Caspar');
  assert.equal(k.albumGeordnet(alle, 'gefuellt')[0].name, 'Caspar', 'der Vollste zuerst');
  assert.equal(k.albumGeordnet(alle, 'leer')[0].name, 'Alma', 'die Leerste zuerst');
  assert.equal(k.albumGeordnet(alle, 'geaendert')[0].name, 'Alma', 'zuletzt angefasst');
  assert.equal(k.albumGeordnet(alle, 'angelegt')[0].name, 'Alma', 'zuerst angelegt');
  assert.equal(k.albumGeordnet(alle, 'unfug').map((f) => f.name).join(','), 'Alma,Bo,Caspar', 'Unsinn fällt aufs Alphabet zurück');
  assert.equal(alle.map((f) => f.id).join(','), vorher, 'die Ausgangsliste bleibt, wie sie war');
});

test('Nach Geburtstag: die Ältesten voran, Datumslose danach — alphabetisch', async () => {
  const k = await frisch();
  const alle = [
    figur(k, 'a', 'Alma', { geboren: '1990-05-04' }),
    figur(k, 'b', 'Bo', { geboren: '1978-12-31' }),
    figur(k, 'c', 'Caspar', {}),
    figur(k, 'd', 'Dora', { geboren: 'unfug' })
  ];
  assert.equal(k.albumGeordnet(alle, 'geburt').map((f) => f.name).join(','), 'Bo,Alma,Caspar,Dora');
});

test('Der Geschichten-Filter zählt, was frei hineingeschrieben wurde', async () => {
  const k = await frisch();
  const alle = [
    figur(k, 'a', 'Alma', { geschichte: ['Deichroman', 'Kurzes'] }),
    figur(k, 'b', 'Bo', { geschichte: ['deichroman'] }),
    figur(k, 'c', 'Caspar', {})
  ];
  const g = k.albumGeschichten(alle);
  assert.equal(g.length, 2, 'Groß und klein ist dieselbe Geschichte');
  assert.equal(g[0].name, 'Deichroman');
  assert.equal(g[0].anzahl, 2);
  assert.equal(k.albumInGeschichte(alle[1], 'Deichroman'), true, 'Schreibweise egal');
  assert.equal(k.albumInGeschichte(alle[2], 'Deichroman'), false);
  assert.equal(k.albumInGeschichte(alle[2], ''), true, 'ohne Filter ist jeder dabei');
  const nurDeich = k.albumAuswahl(alle, { geschichte: 'Deichroman' });
  assert.equal(nurDeich.map((f) => f.name).join(','), 'Alma,Bo');
  /* Wird gesucht, ordnet die Suche — nach Güte, nicht nach Alphabet */
  assert.equal(k.albumAuswahl(alle, { suche: 'bo' })[0].name, 'Bo');
});

test('Eine Abschrift nimmt alles mit — außer Geburts- und Todestag', async () => {
  const k = await frisch();
  const f = figur(k, 'a', 'Alma', {
    augen: 'grau', geboren: '1990-05-04', gestorben: '2044-01-02',
    wesen: ['still', 'zäh'], geschichte: ['Deichroman']
  }, { zettel: [{ text: 'riecht nach Teer', ton: 'moos' }], eigene: [{ name: 'Lieblingswort', wert: 'trotzdem', gruppe: 'rand' }], farbe: '#123456' });

  const kopie = k.albumAbschrift(f);
  assert.equal(kopie.name, 'Alma (Abschrift)');
  assert.equal(kopie.felder.augen, 'grau');
  assert.equal(kopie.felder.geboren, undefined, 'der Geburtstag bleibt der einen Figur');
  assert.equal(kopie.felder.gestorben, undefined, 'und der Todestag auch');
  assert.equal(JSON.stringify(kopie.felder.wesen), JSON.stringify(['still', 'zäh']));
  assert.equal(kopie.zettel.length, 1);
  assert.equal(kopie.eigene[0].name, 'Lieblingswort');
  assert.equal(kopie.farbe, '#123456');
  /* Die Listen sind Kopien, keine Verweise — sonst änderte man beide zugleich */
  kopie.felder.wesen.push('laut');
  assert.equal(f.felder.wesen.length, 2, 'das Original bleibt unberührt');
  /* Ein eigener Name schlägt den Vorschlag */
  assert.equal(k.albumAbschrift(f, '  Almas Schwester  ').name, 'Almas Schwester');
  /* Und eine namenlose Figur bleibt namenlos */
  assert.equal(k.albumAbschrift(figur(k, 'x', '')).name, '');
});

test('Zwei nebeneinander: verglichen wird nur, wo mindestens eine etwas sagt', async () => {
  const k = await frisch();
  const a = figur(k, 'a', 'Alma', { augen: 'grau', beruf: 'Fischerin' });
  const b = figur(k, 'b', 'Bo', { augen: 'Grau', haare: 'rot' });
  const z = k.albumGegenueber(a, b);
  const felder = z.map((x) => x.feld.id);
  assert.ok(felder.includes('augen') && felder.includes('beruf') && felder.includes('haare'));
  assert.ok(!felder.includes('nennung'), 'wo beide schweigen, steht keine Zeile');
  const augen = z.find((x) => x.feld.id === 'augen');
  assert.equal(augen.gleich, true, 'Groß und klein ist dasselbe Wort');
  assert.equal(augen.nurEiner, false);
  assert.equal(z.find((x) => x.feld.id === 'beruf').nurEiner, true);
  /* Die Reihenfolge folgt der Felderliste, nicht der Eingabe */
  const soll = k.ALBUM_FELD_IDS.filter((id) => felder.includes(id));
  assert.equal(JSON.stringify(felder), JSON.stringify(soll));
});

test('Ähnlichkeit: nur wo beide etwas sagen, wird überhaupt gezählt', async () => {
  const k = await frisch();
  const a = figur(k, 'a', 'Alma', { wesen: ['still', 'zäh'], geschichte: ['Deich'] });
  const b = figur(k, 'b', 'Bo', { wesen: ['still', 'zäh'], geschichte: ['Deich'] });
  const c = figur(k, 'c', 'Caspar', { wesen: ['laut'] });
  const d = figur(k, 'd', 'Dora', {});
  assert.equal(k.albumAehnlichkeit(a, b), 1, 'wortgleich ist ganz gleich');
  assert.equal(k.albumAehnlichkeit(a, c), 0);
  assert.equal(k.albumAehnlichkeit(a, d), 0, 'gegen eine Leere gibt es nichts zu zählen');
  const zw = k.albumZwillinge([a, b, c, d]);
  assert.equal(zw.length, 1, 'nur ein auffälliges Paar');
  assert.equal(zw[0].a.name + '+' + zw[0].b.name, 'Alma+Bo');
});

test('Das Netz: Kanten nur zwischen Figuren, die es wirklich gibt', async () => {
  const k = await frisch();
  const alle = [
    figur(k, 'a', 'Alma', { familie: ['Tochter — Bo', 'Bruder — Niemand'] }),
    figur(k, 'b', 'Bo', { bewundert: ['Alma'] }),
    figur(k, 'c', 'Caspar', {})
  ];
  const n = k.albumNetz(alle);
  assert.equal(n.knoten.length, 3);
  assert.equal(n.kanten.length, 2, 'Familie und Bewunderung — „Niemand" wohnt nicht hier');
  assert.equal(n.kanten[0].von.name, 'Alma');
  assert.equal(n.kanten[0].zu.name, 'Bo');
  assert.equal(n.allein.map((x) => x.name).join(','), 'Caspar');
  /* Die Punkte liegen auf einem Kreis um die Mitte, sauber im Bild */
  for (const p of n.knoten) {
    assert.ok(p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100, 'im Bild: ' + p.x + '/' + p.y);
  }
  /* Ein leeres Album ergibt ein leeres Netz und keinen Absturz */
  const leer = k.albumNetz([]);
  assert.equal(leer.knoten.length, 0);
  assert.equal(leer.kanten.length, 0);
});

test('Dieselbe Figur bekommt dieselbe Frage — bis man weiterdreht', async () => {
  const k = await frisch();
  const f = figur(k, 'a', 'Nore', {});
  assert.equal(k.albumFrage(f, 0), k.albumFrage(f, 0), 'gerechnet, nicht gewürfelt');
  assert.notEqual(k.albumFrage(f, 0), k.albumFrage(f, 1), 'aber weiterdrehen geht');
  assert.notEqual(k.albumFrage(f, 0), k.albumFrage(figur(k, 'b', 'Halvar'), 0), 'jede ihre eigene');
  /* Der Name wird eingesetzt, und ohne Namen steht ein neutrales Wort da */
  const mitName = k.ALBUM_FRAGEN.map((_, i) => k.albumFrage({ id: 'x' + i, name: 'Nore' }, 0));
  assert.ok(mitName.every((s) => s.indexOf('{du}') < 0), 'kein Platzhalter bleibt stehen');
  assert.ok(k.albumFrage({ id: 'z', name: '' }, 0).indexOf('{du}') < 0);
  /* Der Vorrat ist groß und ohne Doppelte */
  assert.ok(k.ALBUM_FRAGEN.length >= 60, 'reichlich Fragen: ' + k.ALBUM_FRAGEN.length);
  assert.equal(new Set(k.ALBUM_FRAGEN).size, k.ALBUM_FRAGEN.length, 'keine Frage doppelt');
  for (const q of k.ALBUM_FRAGEN) assert.ok(q.trim().endsWith('?'), 'ist eine Frage: ' + q);
});

test('Das Titelblatt zählt, was wirklich dasteht', async () => {
  const k = await frisch();
  figur(k, 'a', 'Alma', { augen: 'grau', faden: ['Der Schlüssel', '✓ Der Brief'] }, { angelegt: 50, geaendert: 80, zettel: [{ text: 'x' }] });
  figur(k, 'b', 'Bo', { geschichte: ['Deich'] }, { angelegt: 20, geaendert: 20 });
  figur(k, 'c', '', {}, { angelegt: 90, geaendert: 90 });
  const d = k.albumTitelDaten(k.albumFiguren());
  assert.equal(d.anzahl, 3);
  assert.equal(d.gefuellt, 2, 'die ganz leere zählt nicht als gefüllt');
  assert.equal(d.zettel, 1);
  assert.equal(d.offen, 1, 'der abgehakte Faden ist keiner mehr');
  assert.equal(d.geschichten, 1);
  assert.equal(d.angelegt, 20, 'das früheste Anlegedatum');
  assert.equal(d.beruehrt, 90);
  /* Ein leeres Album stürzt nicht ab */
  const leer = k.albumTitelDaten([]);
  assert.equal(leer.anzahl, 0);
  assert.equal(leer.angelegt, 0);
});

test('Der Blattstapel bleibt in seinen Grenzen', async () => {
  const k = await frisch();
  assert.equal(JSON.stringify(k.albumStapel(0, 10)), JSON.stringify({ links: 0, rechts: 9, anteil: 0 }));
  assert.equal(JSON.stringify(k.albumStapel(9, 10)), JSON.stringify({ links: 9, rechts: 0, anteil: 1 }));
  assert.equal(k.albumStapel(50, 200).links, 16, 'gedeckelt — zweihundert Kanten helfen niemandem');
  assert.equal(k.albumStapel(150, 200).rechts, 16);
  /* Unsinn kippt nicht ins Negative */
  assert.equal(k.albumStapel(-5, 10).links, 0);
  assert.equal(k.albumStapel(99, 1).links, 0);
  assert.equal(k.albumStapel(0, 0).rechts, 0);
});

test('Ordnungen und Namen bleiben zusammen', async () => {
  const k = await frisch();
  assert.ok(k.ALBUM_ORDNUNGEN.length >= 5);
  for (const o of k.ALBUM_ORDNUNGEN) {
    assert.ok(o[0] && o[1] && o[2], 'Kennung, Name und ein Satz dazu: ' + o[0]);
    assert.equal(k.albumOrdnungName(o[0]), o[1]);
  }
  assert.equal(new Set(k.ALBUM_ORDNUNGEN.map((o) => o[0])).size, k.ALBUM_ORDNUNGEN.length);
  assert.equal(k.albumOrdnungName('gibtsnicht'), k.ALBUM_ORDNUNGEN[0][1], 'im Zweifel alphabetisch');
});

test('Das Bildnis bleibt aus, bis man es einschaltet', async () => {
  const k = await frisch();
  assert.equal(k.albumBildnisAn(), false, 'standardmäßig aus');
  k.D.einst.albumBildnis = true;
  assert.equal(k.albumBildnisAn(), true);
  k.D.einst.albumBildnis = 'ja';
  assert.equal(k.albumBildnisAn(), false, 'nur ein echtes Ja zählt');
});

test('Auch eine Figur von 1783 hat ein Alter und eine Reihenfolge', async () => {
  const k = await frisch();
  /* Der Kalender reicht bis 1600 zurueck — angezeigt wird er ab 2000, aber
     eintragen kann man weiter. Das Album rechnet mit derselben Rechnung; eine
     zweite waere ein zweiter Ort zum Kaputtgehen. */
  assert.equal(k.kalGueltig('1783-04-09'), true, 'so weit reicht der Kalender');
  assert.equal(k.kalGueltig('1599-12-31'), false, 'davor nicht mehr');
  const alt = figur(k, 'a', 'Alma', { geboren: '1783-04-09', gestorben: '1845-04-09' });
  const jung = figur(k, 'b', 'Bo', { geboren: '2011-04-09' });
  const ohne = figur(k, 'c', 'Caspar', {});
  const kaputt = figur(k, 'd', 'Dora', { geboren: 'unfug' });
  assert.equal(k.albumGeordnet([jung, kaputt, ohne, alt], 'geburt').map((f) => f.name).join(','), 'Alma,Bo,Caspar,Dora');
  assert.equal(k.albumAlterText(alt), 'wurde 62 Jahre alt');
});

test('Ein Widerspruch fällt auch bei alten Jahreszahlen auf', async () => {
  const k = await frisch();
  const f = figur(k, 'a', 'Alma', { geboren: '1783-04-09', gestorben: '1770-01-01' });
  assert.ok(k.albumWidersprueche(f).some((t) => t.indexOf('vor der Geburt') >= 0));
  const g = figur(k, 'b', 'Bo', { geboren: '1783-04-09', gestorben: '1845-04-09', alter: '30 Jahre' });
  assert.ok(k.albumWidersprueche(g).some((t) => t.indexOf('62') >= 0), 'das Feld sagt 30, gerechnet sind es 62');
  const h = figur(k, 'c', 'Caspar', { geboren: '1783-04-09', gestorben: '1845-04-09', alter: '62' });
  assert.equal(k.albumWidersprueche(h).length, 0, 'was stimmt, wird nicht angemeckert');
});
