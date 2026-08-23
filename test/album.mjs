/* Das Album (62). Der Kern, an dem alles hängt: nichts muss ausgefüllt sein,
   und was leer ist, steht nicht auf der Seite. Dazu die alphabetische
   Ordnung, die Suche, die Verweise — und dass eine Seite bei jedem
   Aufschlagen gleich aussieht. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function figur(k, id, name, felder, mehr) {
  const d = { id, typ: 'albumfigur', angelegt: 1, geaendert: 1, name, felder: felder || {}, eigene: [], zettel: [], farbe: '', ...(mehr || {}) };
  k.D.docs.set(id, d);
  return d;
}

test('Es gibt viele Felder, in guten Gruppen, jedes genau einmal', async () => {
  const k = await frisch();
  assert.ok(k.ALBUM_FELDER.length >= 45, 'reichlich Felder: ' + k.ALBUM_FELDER.length);
  assert.equal(new Set(k.ALBUM_FELD_IDS).size, k.ALBUM_FELD_IDS.length, 'keine Kennung doppelt');
  const gruppen = new Set(k.ALBUM_GRUPPEN.map(([g]) => g));
  for (const f of k.ALBUM_FELDER) {
    assert.ok(gruppen.has(f.gruppe), f.id + ': unbekannte Gruppe ' + f.gruppe);
    assert.ok(f.name && f.form, f.id + ': Name und Form');
  }
  /* Jede Gruppe hat auch wirklich Felder — sonst stünde ein leerer Reiter da */
  for (const [g, name] of k.ALBUM_GRUPPEN) {
    assert.ok(k.ALBUM_FELDER.some((f) => f.gruppe === g), 'Gruppe ohne Felder: ' + name);
  }
});

test('Der Wortschatz ist wirklich groß und ohne Doppelte', async () => {
  const k = await frisch();
  assert.ok(k.ALBUM_WESEN_ALLE.length >= 300, 'mindestens dreihundert Wörter: ' + k.ALBUM_WESEN_ALLE.length);
  assert.equal(new Set(k.ALBUM_WESEN_ALLE).size, k.ALBUM_WESEN_ALLE.length, 'kein Wort doppelt');
  assert.ok(k.ALBUM_WESEN.length >= 10, 'in mehreren Gruppen');
  for (const [id, name, worte] of k.ALBUM_WESEN) {
    assert.ok(id && name && Array.isArray(worte) && worte.length >= 10, name + ': ordentlich gefüllt');
  }
});

test('Der Name wird in die Beschriftungen eingesetzt', async () => {
  const k = await frisch();
  assert.equal(k.albumBeschriftung('Wichtig in {du}s Vergangenheit', 'Nore'), 'Wichtig in Nores Vergangenheit');
  assert.equal(k.albumBeschriftung('Was {du} tut', ''), 'Was ihr tut', 'ohne Namen ein neutrales Wort');
  assert.equal(k.albumBeschriftung('Ohne Platzhalter', 'Nore'), 'Ohne Platzhalter');
});

test('Eine Figur darf fast leer sein — und wird trotzdem sauber angenommen', async () => {
  const k = await frisch();
  const leer = k.saubereAlbumFigur({ name: '  ', felder: {}, zettel: [] });
  assert.equal(leer.name, '');
  assert.equal(Object.keys(leer.felder).length, 0);
  assert.equal(k.albumIstLeer(Object.assign({ id: 'x' }, leer)), true);
  /* Leere Zeichenketten fallen heraus, sie sollen nicht auf der Seite stehen */
  const halb = k.saubereAlbumFigur({ name: 'Nore', felder: { haare: '   ', augen: 'grau', nennung: ['', 'Nori', 'Nori', ' '] } });
  assert.equal(halb.felder.haare, undefined, 'leer bleibt leer');
  assert.equal(halb.felder.augen, 'grau');
  assert.equal(JSON.stringify(halb.felder.nennung), JSON.stringify(['Nori']), 'Doppelte und Leere fliegen');
  assert.equal(k.albumIstLeer(Object.assign({ id: 'y' }, halb)), false);
});

test('Nur Gefülltes kommt auf die Seite — in fester Reihenfolge', async () => {
  const k = await frisch();
  const f = figur(k, 'a', 'Nore', { augen: 'grau', zitat: ['Ich bleibe.'], haare: '' });
  const stuecke = k.albumStuecke(f);
  assert.equal(stuecke.length, 2, 'nur zwei gefüllte Felder');
  /* Die Reihenfolge folgt der Felderliste, nicht der Eingabe */
  const reihenfolge = stuecke.map((s) => s.feld.id);
  const soll = k.ALBUM_FELD_IDS.filter((id) => reihenfolge.includes(id));
  assert.equal(JSON.stringify(reihenfolge), JSON.stringify(soll), 'feste Reihenfolge');
  /* Eigene Kategorien hängen hinten dran */
  f.eigene = [{ name: 'Lieblingswort', wert: 'trotzdem', gruppe: 'rand' }];
  const mitEigen = k.albumStuecke(f);
  assert.equal(mitEigen.length, 3);
  assert.equal(mitEigen[2].feld.eigen, true);
});

test('Alphabetisch geordnet — auch wenn zuerst das C angelegt wurde', async () => {
  const k = await frisch();
  figur(k, 'c1', 'Caspar', {}, { angelegt: 10 });
  figur(k, 'a1', 'Alma', {}, { angelegt: 20 });
  figur(k, 'b1', 'Ärger', {}, { angelegt: 30 });
  figur(k, 'x1', '', {}, { angelegt: 5 });
  const namen = k.albumFiguren().map((f) => f.name);
  assert.equal(JSON.stringify(namen), JSON.stringify(['Alma', 'Ärger', 'Caspar', '']),
    'Umlaute einsortiert, Namenlose ganz hinten');
});

test('Die Suche findet über den Namen — und notfalls über alles', async () => {
  const k = await frisch();
  figur(k, 'a', 'Nore', { augen: 'grau wie Deichwasser' });
  figur(k, 'b', 'Halvar', { zitat: ['Nore hat recht.'] });
  figur(k, 'c', 'Norbert', {});
  assert.equal(k.albumSuche('nore').map((f) => f.name).join(','), 'Nore,Halvar', 'Name schlägt Volltext');
  assert.equal(k.albumSuche('nor').map((f) => f.name).join(','), 'Norbert,Nore,Halvar', 'Namensanfänge zuerst, dann wer sie erwähnt');
  assert.equal(k.albumSuche('deichwasser').map((f) => f.name).join(','), 'Nore', 'Volltext greift auch');
  assert.equal(k.albumSuche('').length, 3, 'ohne Frage alles');
  assert.equal(k.albumSuche('gibtsnicht').length, 0);
});

test('Verweise werden erkannt: Rolle davor, Name dahinter', async () => {
  const k = await frisch();
  figur(k, 'a', 'Ilva', {});
  figur(k, 'b', 'Nore', { familie: ['Mutter — Ilva', 'Bruder — Halvar', 'Ilva'] });
  assert.equal(k.albumVerweisRolle('Mutter — Ilva'), 'Mutter');
  assert.equal(k.albumVerweisName('Mutter — Ilva'), 'Ilva');
  assert.equal(k.albumVerweisRolle('Ilva'), '', 'ohne Gedankenstrich keine Rolle');
  assert.equal(k.albumVerweisName('Ilva'), 'Ilva');
  assert.equal(k.albumFindeFigur('ilva').id, 'a', 'Groß und klein egal');
  assert.equal(k.albumFindeFigur('Halvar'), null, 'wer nicht im Album steht, wird nicht erfunden');
  const b = k.albumBeziehungen();
  assert.equal(b.length, 3);
  assert.equal(b[0].zu, 'a', 'Mutter zeigt auf Ilva');
  assert.equal(b[1].zu, '', 'Halvar gibt es noch nicht');
});

test('Dieselbe Seite sieht jedes Mal gleich aus', async () => {
  const k = await frisch();
  const a = k.albumDreh('figur-1', 'augen'), b = k.albumDreh('figur-1', 'augen');
  assert.equal(a, b, 'gerechnet, nicht gewürfelt');
  assert.notEqual(k.albumDreh('figur-1', 'augen'), k.albumDreh('figur-1', 'haare'), 'aber nicht überall gleich');
  assert.ok(Math.abs(a) <= 1.6, 'nur leicht schief: ' + a);
  /* Auch die Farbe bleibt, solange keine gewählt ist */
  const f = { id: 'figur-1', name: 'Nore' };
  assert.equal(k.albumFarbe(f), k.albumFarbe(f));
  assert.ok(k.ALBUM_FARBEN.includes(k.albumFarbe(f)));
  assert.equal(k.albumFarbe({ id: 'x', farbe: '#123456' }), '#123456', 'gewählt schlägt gerechnet');
  assert.ok(k.ALBUM_FARBEN.includes(k.albumFarbe({ id: 'x', farbe: 'unfug' })), 'Unsinn fällt auf die gerechnete zurück');
});

test('Das Register bündelt nach Buchstaben', async () => {
  const k = await frisch();
  figur(k, 'a', 'Alma'); figur(k, 'b', 'Ärger'); figur(k, 'c', 'Bo'); figur(k, 'd', '');
  assert.equal(k.albumBuchstabe({ name: 'Ärger' }), 'A', 'Umlaute zählen zum Grundbuchstaben');
  assert.equal(k.albumBuchstabe({ name: '' }), '#');
  assert.equal(k.albumBuchstabe({ name: '3 Uhr nachts' }), '#');
  const r = k.albumRegister();
  assert.equal(JSON.stringify(r.map((x) => x.buchstabe + x.anzahl)), JSON.stringify(['A2', 'B1', '#1']));
  assert.equal(r[1].von, 2, 'B fängt an dritter Stelle an');
});

test('Klebezettel: höchstens fünfzehn, leere fallen weg', async () => {
  const k = await frisch();
  const viele = Array.from({ length: 30 }, (_, i) => ({ text: 'Zettel ' + i }));
  const f = k.saubereAlbumFigur({ name: 'Nore', zettel: [...viele, { text: '  ' }] });
  assert.equal(f.zettel.length, k.ALBUM_ZETTEL_MAX);
  assert.equal(f.zettel[0].text, 'Zettel 0');
  assert.ok(k.ALBUM_ZETTELTOENE.includes(f.zettel[0].ton), 'jeder Zettel hat einen Ton');
  const leer = k.saubereAlbumFigur({ name: 'X', zettel: [{ text: '   ' }, null, 42] });
  assert.equal(leer.zettel.length, 0);
});

test('Was noch fehlt, wird vorgeschlagen — aber nie das Notizfeld', async () => {
  const k = await frisch();
  const f = { id: 'a', name: 'Nore', felder: {} };
  const fehlt = k.albumFehlt(f, 0);
  assert.ok(fehlt && fehlt.id, 'bei einer leeren Figur fehlt reichlich');
  /* Über alle Startpunkte: nie das Notizfeld */
  for (let i = 0; i < 60; i++) {
    const v = k.albumFehlt(f, i);
    assert.notEqual(v.form, 'notizfeld', 'Notizen sind kein Versäumnis');
  }
  /* Ist alles gefüllt, gibt es nichts vorzuschlagen */
  const voll = { id: 'b', name: 'X', felder: {} };
  for (const feld of k.ALBUM_FELDER) voll.felder[feld.id] = feld.mehrfach ? ['x'] : 'x';
  assert.equal(k.albumFehlt(voll, 0), null);
});

test('Das Alter kommt aus dem Kalender', async () => {
  const k = await frisch();
  assert.equal(k.albumAlterText({ felder: { geboren: '2001-04-12' } }, '2026-08-23'), 'heute 25 Jahre');
  assert.equal(k.albumAlterText({ felder: { geboren: '2001-04-12', gestorben: '2025-02-01' } }), 'wurde 23 Jahre alt');
  assert.equal(k.albumAlterText({ felder: {} }), '', 'ohne Datum kein Alter');
  assert.equal(k.albumAlterText({ felder: { geboren: 'irgendwann' } }), '', 'Unlesbares gibt nichts');
});

test('Eine beschädigte Figur zerlegt die Seite nicht', async () => {
  const k = await frisch();
  const kaputt = { id: 'k', typ: 'albumfigur', name: 'Bruch', felder: 'kein Objekt', eigene: 'auch nicht', zettel: 'schon gar nicht' };
  k.D.docs.set('k', kaputt);
  assert.doesNotThrow(() => k.albumStuecke(kaputt));
  assert.equal(k.albumStuecke(kaputt).length, 0);
  assert.equal(JSON.stringify(k.albumZettel(kaputt)), '[]');
  assert.doesNotThrow(() => k.albumIstLeer(kaputt));
  /* Auch halb kaputte Einträge fallen still heraus */
  const halb = { id: 'h', typ: 'albumfigur', name: 'Halb', felder: { augen: 'grau' }, eigene: [null, { name: 'x' }, { wert: 'y' }, { name: 'Gut', wert: 'so' }], zettel: [null, { text: '  ' }, { text: 'bleibt' }] };
  assert.equal(k.albumStuecke(halb).length, 2, 'nur augen und die eine gute eigene Kategorie');
  assert.equal(k.albumZettel(halb).length, 1);
});

test('Offene Fäden: ein Haken davor heißt eingelöst', async () => {
  const k = await frisch();
  assert.equal(k.albumFadenErledigt('✓ Der Schlüssel'), true);
  assert.equal(k.albumFadenErledigt('✔ Der Cousin'), true);
  assert.equal(k.albumFadenErledigt('Der Obstgarten'), false);
  assert.equal(k.albumFadenText('✓ Der Schlüssel'), 'Der Schlüssel');
  assert.equal(k.albumFadenText('Der Obstgarten'), 'Der Obstgarten');
  assert.equal(k.albumFadenSetzen('Der Schlüssel', true), '✓ Der Schlüssel');
  assert.equal(k.albumFadenSetzen('✓ Der Schlüssel', false), 'Der Schlüssel', 'Haken wieder weg');
  assert.equal(k.albumFadenSetzen('✓ Der Schlüssel', true), '✓ Der Schlüssel', 'nicht zweimal haken');
  const f = figur(k, 'a', 'Nore', { faden: ['Der Schlüssel', '✓ Der Cousin', 'Der Obstgarten'] });
  assert.equal(k.albumFaeden(f).filter((x) => !x.erledigt).length, 2);
  assert.equal(k.albumOffeneFaeden().length, 2);
  assert.equal(k.albumOffeneFaeden()[0].text, 'Der Schlüssel');
});

test('Der Name wird als ganzes Wort gefunden, nicht mittendrin', async () => {
  const k = await frisch();
  assert.equal(k.albumFundstelle('Nore ging fort', 'Nore'), 0);
  assert.equal(k.albumFundstelle('Sie hieß Nore.', 'Nore'), 9);
  assert.equal(k.albumFundstelle('Norwegen ist kalt', 'Nore'), -1, 'nicht innerhalb eines Wortes');
  assert.equal(k.albumFundstelle('Er kannte Norebert', 'Nore'), -1);
  assert.equal(k.albumFundstelle('„Nore!", rief er', 'Nore'), 1, 'Anführungszeichen zählen als Grenze');
  assert.equal(k.albumFundstelle('nore klein geschrieben', 'Nore'), 0, 'Groß und klein egal');
  assert.equal(k.albumFundstelle('Da war O Brien', 'O Brien'), 7, 'Namen mit Leerzeichen');
  assert.equal(k.albumFundstelle('nichts davon', ''), -1);
  assert.equal(k.albumIstWortzeichen('a'), true);
  assert.equal(k.albumIstWortzeichen('7'), true);
  assert.equal(k.albumIstWortzeichen(' '), false);
  assert.equal(k.albumIstWortzeichen(undefined), false);
});

test('Erwähnungen findet die Figur in den eigenen Texten', async () => {
  const k = await frisch();
  const f = figur(k, 'a', 'Nore', {});
  k.D.docs.set('t1', k.sauberesDokument({ id: 't1', typ: 'blatt', titel: 'Am Deich', text: 'Nore stand am Wasser.', angelegt: 1, geaendert: 1 }));
  k.D.docs.set('t2', k.sauberesDokument({ id: 't2', typ: 'blatt', titel: 'Norwegen', text: 'Nur eine Reise.', angelegt: 1, geaendert: 1 }));
  k.D.docs.set('t3', k.sauberesDokument({ id: 't3', typ: 'schnipsel', titel: '', text: 'Was Nore nie sagte.', angelegt: 1, geaendert: 1 }));
  const funde = k.albumErwaehnungen(f);
  assert.equal(funde.length, 2, 'zwei echte Treffer, Norwegen zählt nicht');
  assert.ok(funde[0].stelle.includes('Nore'), funde[0].stelle);
  /* Zu kurze Namen werden nicht gesucht — sonst trifft alles */
  assert.equal(k.albumErwaehnungen(figur(k, 'b', 'Bo', {})).length, 0);
  /* Gelöschte Texte zählen nicht */
  k.D.docs.get('t1').geloescht = true;
  assert.equal(k.albumErwaehnungen(f).length, 1);
});

test('Das Album merkt, was nicht zusammenpasst', async () => {
  const k = await frisch();
  assert.equal(k.albumWidersprueche(figur(k, 'a', 'A', { geboren: '2010-01-01', gestorben: '2000-01-01' }))[0], 'Gestorben vor der Geburt.');
  const alt = k.albumWidersprueche(figur(k, 'b', 'B', { geboren: '2001-04-12', alter: '12' }));
  assert.ok(alt.some((x) => x.includes('wären es')), JSON.stringify(alt));
  assert.equal(k.albumWidersprueche(figur(k, 'c', 'C', { geboren: '2001-04-12', alter: '25' })).length, 0, 'ein Jahr Abweichung ist in Ordnung');
  assert.ok(k.albumWidersprueche(figur(k, 'd', 'D', { gestorben: '2020-01-01', status: 'lebt' })).some((x) => x.includes('lebend')));
  assert.ok(k.albumWidersprueche(figur(k, 'e', 'Ilva', { familie: ['Schwester — Ilva'] })).some((x) => x.includes('sich selbst')));
  assert.equal(k.albumWidersprueche(figur(k, 'f', 'F', {})).length, 0, 'wer nichts einträgt, macht nichts falsch');
});

test('Genannte, die noch nicht im Album wohnen, werden vorgeschlagen', async () => {
  const k = await frisch();
  figur(k, 'a', 'Nore', { familie: ['Vater — Coster'], naehe: ['Halvar'] });
  figur(k, 'b', 'Ilva', { bewundert: ['Coster'] });
  const fehlt = k.albumFehlendeFiguren();
  assert.equal(fehlt.length, 2);
  assert.equal(fehlt[0].name, 'Coster', 'der am häufigsten genannte zuerst');
  assert.equal(fehlt[0].wo.length, 2);
  /* Sobald Coster angelegt ist, verschwindet der Vorschlag */
  figur(k, 'c', 'Coster', {});
  assert.equal(k.albumFehlendeFiguren().map((x) => x.name).join(','), 'Halvar');
});

test('Das Monogramm steht da, wenn kein Bildnis hängt', async () => {
  const k = await frisch();
  assert.equal(k.albumMonogramm({ name: 'Nore Kaltenbach' }), 'NK');
  assert.equal(k.albumMonogramm({ name: 'Coster' }), 'CO');
  assert.equal(k.albumMonogramm({ name: '' }), '?');
  assert.equal(k.albumHatBild({ name: 'X' }), false);
  assert.equal(k.albumHatBild({ bild: 'abc' }), true);
  assert.equal(k.albumHatBild({ striche: [[[0, 0], [1, 1]]] }), true);
  assert.equal(k.albumHatBild({ striche: [] }), false);
});

test('Die Zeitleiste holt die Termine dieser Figur', async () => {
  const k = await frisch();
  const f = figur(k, 'a', 'Nore', {});
  const t = k.saubererTermin({ wann: '2001-04-12', art: 'geburt', titel: 'Nore kommt zur Welt', leute: [{ id: 'a', name: 'Nore' }] });
  k.D.docs.set('t1', { id: 't1', typ: 'termin', angelegt: 1, geaendert: 1, ...t });
  const t2 = k.saubererTermin({ wann: '2020-06-01', art: 'reise', titel: 'Fort', leute: [{ name: 'Halvar' }] });
  k.D.docs.set('t2', { id: 't2', typ: 'termin', angelegt: 1, geaendert: 1, ...t2 });
  const zl = k.albumZeitleiste(f);
  assert.equal(zl.length, 1);
  assert.equal(zl[0].titel, 'Nore kommt zur Welt');
});
