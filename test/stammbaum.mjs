/* Der Wandteppich (63). Geprüft wird das, was beim Aufhängen schiefgehen
   kann: dass aus Fäden ein Baum wird und keine Wolke, dass ein Kreis in der
   Abstammung die App nicht anhält, dass ein Faden ins Leere gar nicht erst
   entsteht — und dass dieselbe Wand zweimal gleich aussieht. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function P(id, name, mehr) { return Object.assign({ id, name, albumId: '', von: '', bis: '', notiz: '', zeichen: 'keins', gebrannt: false }, mehr || {}); }
function F(art, von, zu, wort) { return { id: art + von + zu, art, von, zu, wort: wort || '', still: false }; }
function baum(k, leute, faeden, mehr) {
  return k.saubererStammbaum(Object.assign({ titel: 'Probe', leute, faeden }, mehr || {}));
}

test('Was hereinkommt, wird geputzt — und was nicht sein kann, kommt nicht herein', async () => {
  const k = await frisch();
  const b = baum(k,
    [P('a', '  Alma  '), P('b', 'Bo'), P('a', 'Doppelt'), P('', 'Ohne Kennung'), null, 'Unsinn'],
    [
      F('kind', 'b', 'a'),
      F('kind', 'b', 'a'),          /* derselbe Faden zweimal */
      F('kind', 'a', 'a'),          /* auf sich selbst */
      F('kind', 'b', 'gibtsnicht'), /* ins Leere */
      F('gibtsnichtsart', 'a', 'b'),/* unbekannte Art */
      { art: 'kennt' }              /* ohne Enden */
    ]);
  assert.equal(b.leute.length, 2, 'Doppelte, Namenlose und Unsinn fallen heraus');
  assert.equal(b.leute[0].name, 'Alma', 'Leerzeichen weg');
  assert.equal(b.faeden.length, 1, 'nur der eine gültige Faden bleibt');
  assert.equal(b.faeden[0].von, 'b');
  assert.equal(b.stoff, 'moos', 'ohne Angabe das Standardtuch');
});

test('Ungerichtete Fäden gibt es nur einmal, egal herum', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'Alma'), P('b', 'Bo')], [
    F('heirat', 'a', 'b'),
    F('heirat', 'b', 'a'),   /* dasselbe */
    F('toetete', 'a', 'b'),
    F('toetete', 'b', 'a')   /* NICHT dasselbe — das ist eine andere Geschichte */
  ]);
  assert.equal(b.faeden.filter((f) => f.art === 'heirat').length, 1);
  assert.equal(b.faeden.filter((f) => f.art === 'toetete').length, 2, 'wer wen tötet, ist keine Frage der Reihenfolge');
});

test('Blut baut den Baum: jedes Kind steht unter jedem Elternteil', async () => {
  const k = await frisch();
  const b = baum(k,
    [P('alma', 'Alma'), P('halvar', 'Halvar'), P('nore', 'Nore'), P('ilva', 'Ilva'), P('mira', 'Mira'), P('jonas', 'Jonas')],
    [
      F('heirat', 'alma', 'halvar'),
      F('kind', 'nore', 'alma'), F('kind', 'nore', 'halvar'),
      F('heirat', 'nore', 'ilva'),
      F('kind', 'mira', 'nore'), F('kind', 'mira', 'ilva'),
      F('kind', 'jonas', 'ilva')
    ]);
  const gen = k.teppichGenerationen(b);
  assert.equal(gen.get('alma'), 0);
  assert.equal(gen.get('halvar'), 0);
  assert.equal(gen.get('nore'), 1);
  assert.equal(gen.get('ilva'), 1, 'die Angeheiratete rückt zum Partner');
  assert.equal(gen.get('mira'), 2);
  /* Der eigentliche Fund von damals: Jonas hing eine Reihe zu hoch, weil das
     Nachrücken der Angeheirateten die Kinder nicht mitnahm. */
  assert.equal(gen.get('jonas'), 2, 'das Kind rückt mit, wenn der Elternteil rückt');
  for (const f of b.faeden.filter((x) => x.art === 'kind')) {
    assert.ok(gen.get(f.von) > gen.get(f.zu), 'Kind unter Elternteil: ' + f.von + ' unter ' + f.zu);
  }
});

test('Ein Kreis in der Abstammung hält nichts an', async () => {
  const k = await frisch();
  /* Unmöglich in der Welt, eintippbar in der App. Wichtig ist nur: es kommt
     eine Antwort, und zwar schnell. */
  const b = baum(k, [P('a', 'A'), P('b', 'B'), P('c', 'C')],
    [F('kind', 'a', 'b'), F('kind', 'b', 'c'), F('kind', 'c', 'a')]);
  const start = Date.now();
  const o = k.teppichOrdnung(b);
  assert.ok(Date.now() - start < 2000, 'kein Stehenbleiben');
  assert.equal(o.knoten.length, 3, 'alle drei hängen trotzdem an der Wand');
  for (const n of o.knoten) assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y), n.id + ' hat einen Platz');
  const auff = k.teppichAuffaelligkeiten(b);
  assert.ok(auff.some((a) => a.art === 'kreis'), 'und es wird gemeldet');
});

test('Jeder bekommt einen Platz — auch wer an keinem Faden hängt', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'Alma'), P('b', 'Bo'), P('einsam', 'Niemand')], [F('kind', 'b', 'a')]);
  const o = k.teppichOrdnung(b);
  assert.equal(o.knoten.length, 3);
  assert.equal(o.inseln, 2, 'wer an keinem Faden hängt, ist seine eigene Insel');
  const reihen = o.knoten.map((n) => n.y);
  assert.equal(new Set(reihen.map((r) => Math.round(r * 100))).size >= 2, true, 'sie liegen nicht alle übereinander');
  /* Zwei Leute in derselben Spalte halten Abstand */
  const proSpalte = new Map();
  for (const n of o.knoten) {
    if (!proSpalte.has(n.x)) proSpalte.set(n.x, []);
    proSpalte.get(n.x).push(n.y);
  }
  for (const [, ys] of proSpalte) {
    const s = ys.slice().sort((p, q) => p - q);
    for (let i = 1; i < s.length; i++) assert.ok(s[i] - s[i - 1] >= 0.99, 'kein Band liegt auf einem anderen');
  }
});

test('Ein leerer Teppich ergibt eine leere Wand, keinen Absturz', async () => {
  const k = await frisch();
  const b = baum(k, [], []);
  const o = k.teppichOrdnung(b);
  assert.equal(o.knoten.length, 0);
  assert.equal(o.spalten, 0);
  assert.equal(k.teppichZahlen(b).leute, 0);
  assert.equal(k.teppichAuffaelligkeiten(b).length, 0);
  assert.equal(k.teppichSuche(b, 'irgendwas').length, 0);
});

test('Eheleute liegen nebeneinander, nicht irgendwo', async () => {
  const k = await frisch();
  const leute = [P('a', 'Alma'), P('b', 'Bo'), P('c', 'Caspar'), P('d', 'Dora'), P('e', 'Emil')];
  const b = baum(k, leute, [
    F('kind', 'a', 'e'), F('kind', 'b', 'e'), F('kind', 'c', 'e'),
    F('heirat', 'a', 'd')
  ]);
  const o = k.teppichOrdnung(b);
  const wo = new Map(o.knoten.map((n) => [n.id, n]));
  assert.equal(wo.get('a').gen, wo.get('d').gen, 'ein Paar steht in derselben Generation');
  assert.ok(Math.abs(wo.get('a').y - wo.get('d').y) <= 1.05, 'und in benachbarten Reihen');
});

test('Dieselbe Wand sieht zweimal gleich aus', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'Alma'), P('b', 'Bo'), P('c', 'Caspar')],
    [F('kind', 'b', 'a'), F('kind', 'c', 'a'), F('liebt', 'b', 'c')]);
  const eins = JSON.stringify(k.teppichOrdnung(b).knoten.map((n) => [n.id, n.x, n.y]));
  const zwei = JSON.stringify(k.teppichOrdnung(b).knoten.map((n) => [n.id, n.x, n.y]));
  assert.equal(eins, zwei, 'gerechnet, nicht gewürfelt');
  assert.equal(k.teppichDreh('a', 'band'), k.teppichDreh('a', 'band'));
  assert.notEqual(k.teppichDreh('a', 'band'), k.teppichDreh('b', 'band'));
  assert.ok(Math.abs(k.teppichDreh('a', 'band', 3)) <= 3);
});

test('Fadenarten: jede hat einen Satz, eine Farbe und einen Strich', async () => {
  const k = await frisch();
  assert.ok(k.FADEN_ARTEN.length >= 25, 'reichlich Arten: ' + k.FADEN_ARTEN.length);
  assert.equal(new Set(k.FADEN_ART_IDS).size, k.FADEN_ART_IDS.length, 'keine Kennung doppelt');
  const gruppen = new Set(k.FADEN_GRUPPEN.map((g) => g[0]));
  for (const a of k.FADEN_ARTEN) {
    assert.ok(gruppen.has(a.gruppe), a.id + ': unbekannte Gruppe');
    assert.ok(a.name && a.satz, a.id + ': Name und Satz');
    assert.ok(a.satz.includes('{a}') && a.satz.includes('{b}'), a.id + ': der Satz nennt beide');
    assert.ok(k.FADEN_STRICHE.includes(a.strich), a.id + ': bekannter Strich');
    assert.ok(/^#[0-9a-f]{6}$/i.test(a.farbe), a.id + ': echte Farbe');
  }
  /* Jede Gruppe hat auch wirklich Arten — sonst stünde ein leerer Reiter da */
  for (const [gid, gname] of k.FADEN_GRUPPEN) {
    assert.ok(k.FADEN_ARTEN.some((a) => a.gruppe === gid), 'Gruppe ohne Arten: ' + gname);
  }
  /* Was es nicht gibt, wird nicht erfunden, aber auch nicht verweigert */
  const ersatz = k.fadenArt('gibtsnicht');
  assert.equal(ersatz.unbekannt, true);
  assert.ok(ersatz.name && ersatz.farbe);
});

test('Eine eigene Fadenart gilt nur für ihren Teppich', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'Alma'), P('b', 'Bo')], [F('eigen-1', 'a', 'b')], {
    eigeneArten: [
      { id: 'eigen-1', name: 'Erbte den Fluch von', gruppe: 'band', satz: '{a} erbte den Fluch von {b}', farbe: '#123456', strich: 'gepunktet' },
      { id: 'eigen-1', name: 'Doppelt', gruppe: 'band' },      /* dieselbe Kennung */
      { id: 'kind', name: 'Blut überschreiben' },              /* eine feste Art überschreiben */
      { id: '', name: 'ohne Kennung' }
    ]
  });
  assert.equal(b.eigeneArten.length, 1, 'Doppelte und Übergriffe fallen heraus');
  assert.equal(b.faeden.length, 1, 'der Faden mit der eigenen Art bleibt');
  const a = k.fadenArt('eigen-1', b);
  assert.equal(a.name, 'Erbte den Fluch von');
  assert.equal(a.eigen, true);
  assert.equal(a.farbe, '#123456');
  /* Ohne den Teppich kennt niemand diese Art */
  assert.equal(k.fadenArt('eigen-1').unbekannt, true);
});

test('Der Satz zu einem Faden setzt die Namen ein', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'Alma'), P('b', 'Bo')], [F('toetete', 'a', 'b', 'im Winter am Deich')]);
  const satz = k.fadenSatz(b.faeden[0], b, b.leute);
  assert.equal(satz, 'Alma hat Bo getötet — im Winter am Deich');
});

test('Was auffällt, fällt auf — aber nur, was wirklich nicht sein kann', async () => {
  const k = await frisch();
  const b = baum(k,
    [P('kind', 'Kind', { von: '1800' }), P('vater', 'Vater', { von: '1810' }), P('tot', 'Tot', { bis: '1820' }), P('opfer', 'Opfer', { bis: '1850' })],
    [F('kind', 'kind', 'vater'), F('toetete', 'tot', 'opfer')]);
  const a = k.teppichAuffaelligkeiten(b).map((x) => x.art);
  assert.ok(a.includes('jahre'), 'ein Kind, das älter wäre als sein Vater');
  assert.ok(a.includes('zeit'), 'jemand, der nach seinem Tod noch tötet');
  /* Was stimmt, wird nicht angemeckert */
  const gut = baum(k, [P('k', 'Kind', { von: '1830' }), P('v', 'Vater', { von: '1800' })], [F('kind', 'k', 'v')]);
  assert.equal(k.teppichAuffaelligkeiten(gut).filter((x) => x.art === 'jahre').length, 0);
});

test('Der Name folgt dem Album, wenn die Person daran hängt', async () => {
  const k = await frisch();
  k.D.docs.set('f1', { id: 'f1', typ: 'albumfigur', name: 'Alma aus dem Album', felder: {}, eigene: [], zettel: [] });
  const p = P('a', 'Alter Name', { albumId: 'f1' });
  assert.equal(k.teppichName(p), 'Alma aus dem Album');
  /* Ist die Figur weg, gilt wieder der eigene Name — kein leeres Band */
  k.D.docs.get('f1').geloescht = true;
  assert.equal(k.teppichName(p), 'Alter Name');
  assert.equal(k.teppichName(P('b', 'Bo')), 'Bo');
  assert.equal(k.teppichName(null), '');
});

test('Jahre lesen sich als Jahre', async () => {
  const k = await frisch();
  assert.equal(k.teppichJahre(P('a', 'A', { von: '1783', bis: '1845' })), '1783–1845');
  assert.equal(k.teppichJahre(P('a', 'A', { von: '1783' })), '* 1783');
  assert.equal(k.teppichJahre(P('a', 'A', { bis: '1845' })), '† 1845');
  assert.equal(k.teppichJahre(P('a', 'A')), '');
});

test('Die Suche findet über den Namen, dann über alles', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'Nore', { notiz: 'riecht nach Teer' }), P('b', 'Norbert'), P('c', 'Halvar', { notiz: 'kennt Nore' })], []);
  assert.equal(k.teppichSuche(b, 'nore').map((p) => p.name).join(','), 'Nore,Halvar');
  assert.equal(k.teppichSuche(b, 'nor').map((p) => p.name).join(','), 'Norbert,Nore,Halvar');
  assert.equal(k.teppichSuche(b, 'teer').map((p) => p.name).join(','), 'Nore');
  assert.equal(k.teppichSuche(b, '').length, 3);
  assert.equal(k.teppichSuche(b, 'gibtsnicht').length, 0);
});

test('Ein Tuch trägt nicht unbegrenzt viel', async () => {
  const k = await frisch();
  const viele = [];
  for (let i = 0; i < k.TEPPICH_MAX_LEUTE + 60; i++) viele.push(P('p' + i, 'Nr ' + i));
  const b = baum(k, viele, []);
  assert.equal(b.leute.length, k.TEPPICH_MAX_LEUTE, 'gekappt, nicht abgestürzt');
});

test('Viele Namen ordnen sich in vertretbarer Zeit', async () => {
  const k = await frisch();
  /* Eine Kette über zwanzig Generationen mit Geschwistern — der ungünstigste
     Fall für die Reihenrechnung. */
  const leute = [], faeden = [];
  for (let g = 0; g < 20; g++) {
    for (let i = 0; i < 8; i++) {
      const id = 'g' + g + 'i' + i;
      leute.push(P(id, 'Nr ' + g + '-' + i));
      if (g > 0) faeden.push(F('kind', id, 'g' + (g - 1) + 'i' + (i % 8)));
    }
  }
  const b = baum(k, leute, faeden);
  const start = Date.now();
  const o = k.teppichOrdnung(b);
  const dauer = Date.now() - start;
  assert.equal(o.knoten.length, 160);
  assert.equal(o.spalten, 20);
  assert.ok(dauer < 1500, 'geordnet in ' + dauer + ' ms');
});

test('Das Kabinett kennt seine Fächer', async () => {
  const k = await frisch();
  assert.ok(k.KABINETT_FAECHER.length >= 2);
  const ids = k.KABINETT_FAECHER.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, 'keine Kennung doppelt');
  for (const f of k.KABINETT_FAECHER) {
    assert.ok(f.name && f.unter && f.emblem, f.id + ': Name, Untertitel, Emblem');
    assert.ok(f.baustelle || typeof f.oeffnen === 'function', f.id + ': lässt sich öffnen oder ist ehrlich als Baustelle markiert');
  }
  assert.ok(ids.includes('stammbaum'));
});

test('Die Fadenarten sind reichlich, in sechs Gruppen, jede mit eigenem Bild', async () => {
  const k = await frisch();
  assert.ok(k.FADEN_ARTEN.length >= 55, 'reichlich Arten: ' + k.FADEN_ARTEN.length);
  assert.equal(k.FADEN_GRUPPEN.length, 6, 'Blut, Bund, Herz, Klinge, Band, Schicksal');
  assert.equal(k.FADEN_STRICHE.length, 6, 'sechs Strichbilder');
  for (const st of k.FADEN_STRICHE) assert.ok(k.FADEN_STRICH_NAMEN[st], st + ' hat einen Namen');
  /* Jedes Strichbild wird auch wirklich benutzt — sonst wäre es totes Gewicht */
  for (const st of k.FADEN_STRICHE) {
    assert.ok(k.FADEN_ARTEN.some((a) => a.strich === st), 'niemand benutzt: ' + st);
  }
  /* Jede Gruppe hat Arten */
  for (const [gid, gname] of k.FADEN_GRUPPEN) {
    assert.ok(k.FADEN_ARTEN.some((a) => a.gruppe === gid), 'Gruppe ohne Arten: ' + gname);
  }
});

test('Farben werden geprüft, nicht geglaubt', async () => {
  const k = await frisch();
  assert.equal(k.fadenFarbeSauber('#A8452F'), '#a8452f', 'klein geschrieben');
  assert.equal(k.fadenFarbeSauber('rot'), k.FADEN_FARBEN[0], 'Unsinn fällt auf die erste zurück');
  assert.equal(k.fadenFarbeSauber('', '#123456'), '#123456', 'mit eigenem Ersatz');
  assert.equal(k.fadenFarbeSauber('#12345'), k.FADEN_FARBEN[0], 'zu kurz ist keine Farbe');
});

test('Die Bibliothek gilt in allen Stammbäumen, die eigene Art nur in ihrem', async () => {
  const k = await frisch();
  k.D.einst.fadenBibliothek = [
    { id: 'bib-eid', name: 'Hat den Eid gebrochen', gruppe: 'klinge', satz: '{a} hat {b} gegenüber den Eid gebrochen', farbe: '#8f2f22', strich: 'wellig' },
    { id: 'bib-eid', name: 'Doppelt', gruppe: 'band' },   /* dieselbe Kennung */
    { id: 'kind', name: 'Blut überschreiben', gruppe: 'band' },
    { id: '', name: 'ohne Kennung' },
    null
  ];
  const bib = k.fadenBibliothek();
  assert.equal(bib.length, 1, 'Doppelte, Übergriffe und Unsinn fallen heraus');
  assert.equal(bib[0].name, 'Hat den Eid gebrochen');
  assert.equal(bib[0].strich, 'wellig');

  /* Ein Faden mit einer Bibliotheksart überlebt das Putzen */
  const b = baum(k, [P('a', 'Alma'), P('b', 'Bo')], [F('bib-eid', 'a', 'b')]);
  assert.equal(b.faeden.length, 1, 'der Faden bleibt');
  assert.equal(k.fadenArt('bib-eid', b).name, 'Hat den Eid gebrochen');
  assert.equal(k.fadenArt('bib-eid', b).bibliothek, true);
  assert.equal(k.fadenHeimat('bib-eid', b), 'bibliothek');
  assert.equal(k.fadenHeimat('kind', b), 'fest');
  assert.equal(k.fadenHeimat('gibtsnicht', b), 'unbekannt');

  /* Der Teppich schlägt die Bibliothek */
  const c = baum(k, [P('a', 'Alma'), P('b', 'Bo')], [F('bib-eid', 'a', 'b')], {
    eigeneArten: [{ id: 'bib-eid', name: 'Hier heisst es anders', gruppe: 'herz', farbe: '#123456' }]
  });
  assert.equal(k.fadenArt('bib-eid', c).name, 'Hier heisst es anders');
  assert.equal(k.fadenArt('bib-eid', c).eigen, true);
  assert.equal(k.fadenHeimat('bib-eid', c), 'teppich');
});

test('Die Auswahl kennt feste, Bibliotheks- und eigene Arten — jede einmal', async () => {
  const k = await frisch();
  k.D.einst.fadenBibliothek = [{ id: 'bib-1', name: 'Aus der Bibliothek', gruppe: 'band' }];
  const b = baum(k, [P('a', 'A')], [], { eigeneArten: [{ id: 'eig-1', name: 'Nur hier', gruppe: 'herz' }] });
  const alle = k.fadenAlleArten(b);
  const ids = alle.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, 'keine Art doppelt in der Auswahl');
  assert.ok(ids.includes('kind') && ids.includes('bib-1') && ids.includes('eig-1'));
  assert.equal(alle.find((a) => a.id === 'bib-1').bibliothek, true);
  assert.equal(alle.find((a) => a.id === 'eig-1').eigen, true);
  /* Steht eine Art in beiden, zählt die des Teppichs — und nur einmal */
  const c = baum(k, [P('a', 'A')], [], { eigeneArten: [{ id: 'bib-1', name: 'Hier anders', gruppe: 'herz' }] });
  const ids2 = k.fadenAlleArten(c).map((a) => a.id);
  assert.equal(ids2.filter((x) => x === 'bib-1').length, 1);
});

test('Eine Fadenart wird geputzt wie alles andere', async () => {
  const k = await frisch();
  const a = k.saubereFadenart({ id: '  x  ', name: '  Name  ', gruppe: 'unfug', strich: 'unfug', farbe: 'unfug' });
  assert.equal(a.id, 'x');
  assert.equal(a.name, 'Name');
  assert.equal(a.gruppe, 'band', 'unbekannte Gruppe wird zu Band');
  assert.equal(a.strich, 'gestrichelt');
  assert.ok(/^#[0-9a-f]{6}$/.test(a.farbe));
  assert.ok(a.satz.includes('{a}') && a.satz.includes('{b}'), 'ohne Satz baut VANI einen');
  assert.equal(a.gerichtet, true, 'im Zweifel gerichtet');
  assert.equal(k.saubereFadenart({ id: 'x' }), null, 'ohne Namen keine Art');
  assert.equal(k.saubereFadenart(null), null);
});

test('Die Bibliothek nimmt nicht unbegrenzt viel', async () => {
  const k = await frisch();
  const viele = [];
  for (let i = 0; i < k.FADEN_BIBLIOTHEK_MAX + 30; i++) viele.push({ id: 'a' + i, name: 'Nr ' + i });
  k.fadenBibliothekSetzen(viele);
  assert.equal(k.fadenBibliothek().length, k.FADEN_BIBLIOTHEK_MAX);
  /* Und eine, die es schon gibt, kommt nicht zweimal hinein */
  k.fadenBibliothekSetzen([{ id: 'eins', name: 'Eins' }]);
  assert.equal(k.fadenBibliothekHinzu({ id: 'eins', name: 'Nochmal' }), false);
  assert.equal(k.fadenBibliothek().length, 1);
});

/* --- Die Sippe: Verwandtschaft, Wege, Häuser --- */

/* Ein Baum, an dem sich alles ablesen lässt:
     Alma
     ├── Rosa ── Lene ── Nora
     └── Karl ── Jonas
   dazu Piet (mit Lene verheiratet) und Mats (von Karl aufgezogen). */
function sippenbaum(k) {
  return baum(k, [
    P('ug', 'Alma Wiek', { geschlecht: 'w' }),
    P('g1', 'Rosa Wiek', { geschlecht: 'w' }),
    P('g2', 'Karl Wiek', { geschlecht: 'm' }),
    P('m1', 'Lene Wiek', { geschlecht: 'w' }),
    P('k1', 'Nora Wiek', { geschlecht: 'w' }),
    P('c1', 'Jonas Wiek', { geschlecht: 'm' }),
    P('e1', 'Piet Halm', { geschlecht: 'm' }),
    P('x1', 'Mats', { geschlecht: '' })
  ], [
    F('kind', 'g1', 'ug'), F('kind', 'g2', 'ug'),
    F('kind', 'm1', 'g1'), F('kind', 'k1', 'm1'),
    F('kind', 'c1', 'g2'),
    F('heirat', 'm1', 'e1'),
    F('ziehkind', 'x1', 'g2')
  ]);
}

test('Verwandtschaft: die Wörter stimmen', async () => {
  const k = await frisch();
  const b = sippenbaum(k);
  const satz = (a, c) => k.teppichVerwandtschaft(b, a, c).satz;

  /* Gerade Linie nach oben und unten. */
  assert.equal(satz('k1', 'm1'), 'Lene Wiek ist Nora Wieks Mutter.');
  assert.equal(satz('k1', 'g1'), 'Rosa Wiek ist Nora Wieks Großmutter.');
  assert.equal(satz('k1', 'ug'), 'Alma Wiek ist Nora Wieks Urgroßmutter.');
  assert.equal(satz('ug', 'k1'), 'Nora Wiek ist Alma Wieks Urenkelin.');
  assert.equal(satz('m1', 'k1'), 'Nora Wiek ist Lene Wieks Tochter.');

  /* Zur Seite. */
  assert.equal(satz('g1', 'g2'), 'Karl Wiek ist Rosa Wieks Bruder.');
  assert.equal(satz('m1', 'c1'), 'Jonas Wiek ist Lene Wieks Cousin ersten Grades.');
  assert.equal(satz('k1', 'g2'), 'Karl Wiek ist Nora Wieks Großonkel.');
  assert.equal(satz('g2', 'k1'), 'Nora Wiek ist Karl Wieks Großnichte.');
  assert.equal(satz('m1', 'g2'), 'Karl Wiek ist Lene Wieks Onkel.');
  assert.equal(satz('g2', 'm1'), 'Lene Wiek ist Karl Wieks Nichte.');

  /* Versetzt: der Fall, an dem die meisten Rechner scheitern. */
  assert.equal(satz('k1', 'c1'), 'Jonas Wiek ist Nora Wieks Cousin ersten Grades, einmal entfernt.');

  /* Angeheiratet und aufgezogen. */
  assert.equal(satz('k1', 'e1'), 'Piet Halm ist Nora Wieks Stiefvater.');
  assert.equal(satz('m1', 'e1'), 'Piet Halm ist Lene Wieks Ehemann.');
  assert.equal(satz('g2', 'x1'), 'Mats ist Karl Wieks Ziehkind.');
  assert.equal(satz('x1', 'g2'), 'Karl Wiek ist Mats’ Ziehvater.');

  /* Der Genitiv beachtet Namen auf -s: kein „Mats’s“. */
  assert.ok(satz('x1', 'c1').startsWith('Jonas Wiek ist Mats’ '), satz('x1', 'c1'));
});

test('Verwandtschaft: ohne Geschlecht wird nichts geraten', async () => {
  const k = await frisch();
  /* Ein Name sagt nichts über das Geschlecht. Wer nichts angibt, bekommt
     beide Formen — nicht die wahrscheinlichere. */
  const b = baum(k, [
    P('a', 'Toni'), P('b', 'Kim'), P('c', 'Robin')
  ], [F('kind', 'b', 'a'), F('kind', 'c', 'b')]);
  assert.equal(k.teppichVerwandtschaft(b, 'b', 'a').wort, 'Elternteil');
  assert.equal(k.teppichVerwandtschaft(b, 'c', 'a').wort, 'Großelternteil');
  assert.equal(k.teppichVerwandtschaft(b, 'a', 'c').wort, 'Enkelkind');
  /* Wo es keine neutrale Form gibt, stehen beide da. */
  const d = baum(k, [P('a', 'Toni'), P('b', 'Kim'), P('c', 'Robin'), P('e', 'Sam')],
    [F('kind', 'b', 'a'), F('kind', 'c', 'a'), F('kind', 'e', 'c')]);
  assert.equal(k.teppichVerwandtschaft(d, 'e', 'b').wort, 'Tante oder Onkel');
});

test('Verwandtschaft: sich selbst, Fremde und Kreise halten sie nicht an', async () => {
  const k = await frisch();
  const b = sippenbaum(k);
  assert.equal(k.teppichVerwandtschaft(b, 'k1', 'k1'), null, 'sich selbst gegenüber ist niemand verwandt');
  assert.equal(k.teppichVerwandtschaft(b, 'k1', 'gibtsnicht'), null);

  /* Zwei ohne jede Verbindung. */
  const fremd = baum(k, [P('a', 'Ada'), P('b', 'Bo')], []);
  const v = k.teppichVerwandtschaft(fremd, 'a', 'b');
  assert.equal(v.art, 'nichts');
  assert.ok(v.satz.includes('noch nicht'), v.satz);

  /* Ein Kreis in der Abstammung darf die Rechnung nicht aufhängen. */
  const kreis = baum(k, [P('a', 'Ada'), P('b', 'Bo'), P('c', 'Cil')],
    [F('kind', 'a', 'b'), F('kind', 'b', 'c'), F('kind', 'c', 'a')]);
  const w = k.teppichVerwandtschaft(kreis, 'a', 'c');
  assert.ok(w && w.satz, 'auch im Kreis kommt eine Antwort heraus');
});

test('Verwandtschaft: nicht verwandt, aber verbunden', async () => {
  const k = await frisch();
  /* Für eine Geschichte ist oft wichtiger, DASS zwei verbunden sind, als
     ob sie blutsverwandt sind. */
  const b = baum(k, [P('a', 'Ada'), P('b', 'Bo'), P('c', 'Cil')],
    [F('hasst', 'a', 'b'), F('kennt', 'b', 'c')]);
  const v = k.teppichVerwandtschaft(b, 'a', 'c');
  assert.equal(v.art, 'weg');
  assert.equal(v.schritte.length, 2);
  assert.ok(v.satz.includes('nicht verwandt'), v.satz);

  const weg = k.teppichWegZwischen(b, 'a', 'c');
  assert.equal(weg.laenge, 2);
  const satz = k.teppichWegSatz(b, weg);
  assert.ok(satz.startsWith('Ada') && satz.endsWith('Cil'), satz);
});

test('Die Häuser fallen von selbst auseinander', async () => {
  const k = await frisch();
  const b = baum(k, [
    P('w1', 'Alma Wiek'), P('w2', 'Rosa Wiek'), P('w3', 'Nora Wiek'),
    P('v1', 'Ilse Voss'), P('v2', 'Ove Voss'),
    P('allein', 'Thies')
  ], [
    F('kind', 'w2', 'w1'), F('kind', 'w3', 'w2'),
    F('kind', 'v2', 'v1')
  ]);
  const h = k.teppichHaeuser(b);
  assert.equal(h.length, 2, 'zwei Häuser, der Einzelne zählt nicht als Haus');
  assert.equal(h[0].name, 'Wiek');
  assert.equal(h[0].wieViele, 3);
  assert.equal(h[1].name, 'Voss');
  assert.equal(h[1].wieViele, 2);
  assert.ok(!k.teppichHausVon(h, 'allein'), 'wer allein hängt, gehört zu keinem Haus');
  assert.equal(k.teppichHausVon(h, 'w3').name, 'Wiek');

  /* Das Wappen hängt am Namen, nicht an der Reihenfolge: dasselbe Haus
     bekommt in jedem Teppich dasselbe Zeichen. */
  const b2 = baum(k, [P('x1', 'Jonas Wiek'), P('x2', 'Karl Wiek')], [F('kind', 'x1', 'x2')]);
  const h2 = k.teppichHaeuser(b2);
  assert.deepEqual(
    [h2[0].wappen.grund, h2[0].wappen.figur, h2[0].wappen.bild],
    [h[0].wappen.grund, h[0].wappen.figur, h[0].wappen.bild],
    'Haus Wiek führt überall dasselbe Wappen');
  /* Und es ist heraldisch sauber. */
  assert.notEqual(h[0].wappen.figur, h[0].wappen.grund);
  assert.notEqual(h[0].wappen.figur, h[0].wappen.zweit);
});

test('Der Umkreis zeigt nur, was nah ist', async () => {
  const k = await frisch();
  const b = baum(k, [P('a', 'A'), P('b', 'B'), P('c', 'C'), P('d', 'D'), P('e', 'E')],
    [F('kind', 'b', 'a'), F('kind', 'c', 'b'), F('kind', 'd', 'c'), F('kind', 'e', 'd')]);
  const eins = k.teppichUmkreis(b, 'a', 1);
  assert.equal(eins.size, 2, 'A und B');
  const zwei = k.teppichUmkreis(b, 'a', 2);
  assert.equal(zwei.size, 3);
  assert.equal(zwei.get('a'), 0);
  assert.equal(zwei.get('c'), 2);
  const weit = k.teppichUmkreis(b, 'a', 6);
  assert.equal(weit.size, 5, 'bei genug Schritten alle');
});

test('Jede Fadenart wird auch irgendwo gezeichnet', async () => {
  const k = await frisch();
  /* Der Teppich zeichnet auf drei Arten: Gerüstfäden werden zu ÄSTEN,
     Paarfäden zu einem BUND-Bogen, alles andere zu RANKEN. Die Ranken
     filtern Gerüst und Paar heraus — wer also in FADEN_ARTEN `geruest`
     trägt, aber nicht in TEPPICH_GERUEST steht, fällt durch BEIDE Raster
     und ist nirgends zu sehen.

     Genau das war „Uneheliches Kind von“: eine Blutsbeziehung, die man
     eintragen konnte und nie wiederfand. */
  for (const art of k.FADEN_ARTEN) {
    if (art.geruest) {
      assert.ok(k.TEPPICH_GERUEST.includes(art.id),
        '„' + art.name + '“ gilt als Gerüst, wird aber nie als Ast gezeichnet');
    }
    if (k.TEPPICH_GERUEST.includes(art.id)) {
      assert.ok(art.geruest, '„' + art.name + '“ wird als Ast gezeichnet, gilt aber nicht als Gerüst');
    }
    /* Und niemals beides: ein Faden kann nicht Ast und Bund sein. */
    assert.ok(!(art.geruest && art.paar), '„' + art.name + '“ wäre Ast und Bund zugleich');
  }

  /* Was Blut ist, muss auch Gerüst sein — sonst zählt die Verwandtschaft
     eine Abstammung, die der Baum nicht kennt. */
  for (const id of k.TEPPICH_BLUT) {
    assert.ok(k.TEPPICH_GERUEST.includes(id), id + ' ist Blut, aber kein Gerüst');
  }
  assert.ok(!k.TEPPICH_BLUT.includes('ziehkind'), 'eine Ziehelternschaft ist kein Blut');
  assert.ok(k.TEPPICH_BLUT.includes('unehelich'), 'ein uneheliches Kind ist ein Kind');

  /* Jede Art ist vollständig beschrieben — sonst steht irgendwo
     „undefined“ auf dem Tuch. */
  const gruppen = k.FADEN_GRUPPEN.map((g) => g[0]);
  for (const art of k.FADEN_ARTEN) {
    assert.ok(art.id && art.name && art.satz && art.farbe && art.strich, 'unvollständig: ' + art.id);
    assert.ok(gruppen.includes(art.gruppe), art.id + ' gehört zu keiner Gruppe: ' + art.gruppe);
    assert.ok(k.FADEN_STRICHE.includes(art.strich), art.id + ' hat einen Strich, den es nicht gibt: ' + art.strich);
    assert.match(art.satz, /\{a\}/, art.id + ': im Satz fehlt {a}');
    assert.match(art.satz, /\{b\}/, art.id + ': im Satz fehlt {b}');
    /* Ein gerichteter Faden braucht ein Gegenwort — „Kind von“ / „Elternteil von“. */
    if (art.gerichtet && art.geruest) assert.ok(art.gegen, art.id + ': ein Gerüstfaden braucht sein Gegenwort');
  }
});

test('Ein unehelicher Zweig ist Blut, kein Ziehverhältnis', async () => {
  const k = await frisch();
  const b = baum(k, [
    P('o', 'Ada Reet', { geschlecht: 'w' }),
    P('v', 'Bo Reet', { geschlecht: 'm' }),
    P('u', 'Cil Reet', { geschlecht: 'w' }),
    P('e', 'Dorn Reet', { geschlecht: 'm' })
  ], [
    F('kind', 'v', 'o'),
    F('unehelich', 'u', 'v'),
    F('kind', 'e', 'u')
  ]);
  /* Der Zweig hängt wirklich am Baum. */
  assert.equal((k.teppichEltern(b).get('u') || []).join(','), 'v', 'das uneheliche Kind hat seinen Vater');
  const gen = k.teppichGenerationen(b);
  assert.equal(gen.get('u'), 2);
  assert.equal(gen.get('e'), 3);
  /* Und die Verwandtschaft rechnet ihn als Blut. */
  assert.equal(k.teppichVerwandtschaft(b, 'u', 'o').wort, 'Großmutter');
  assert.equal(k.teppichVerwandtschaft(b, 'e', 'o').wort, 'Urgroßmutter');
  assert.ok(!/Zieh/.test(k.teppichVerwandtschaft(b, 'e', 'o').satz), 'kein Ziehverhältnis');
  /* Ein Ziehkind dagegen schon. */
  const z = baum(k, [P('a', 'Ada'), P('b', 'Bo')], [F('ziehkind', 'b', 'a')]);
  assert.match(k.teppichVerwandtschaft(z, 'b', 'a').wort, /^Zieh/, 'ein Ziehkind bleibt ein Ziehkind');
});

test('Was auffällt: der Rechner sieht Widersprüche, die kein Faden zeigt', async () => {
  const k = await frisch();
  const finde = (liste, teil) => liste.find((a) => a.text.includes(teil));

  /* Ein Bund zwischen nahen Verwandten. Kein Fehler — in vielen
     Geschichten der Kern der Sache —, aber nichts, was man versehentlich
     einträgt. Erst der Verwandtschaftsrechner kann das überhaupt sehen. */
  const bund = baum(k, [
    P('a', 'Ada Reet', { geschlecht: 'w', von: '1900' }),
    P('b', 'Bo Reet', { geschlecht: 'm', von: '1925' }),
    P('c', 'Cil Reet', { geschlecht: 'w', von: '1928' })
  ], [F('kind', 'b', 'a'), F('kind', 'c', 'a'), F('heirat', 'b', 'c')]);
  const auff = k.teppichAuffaelligkeiten(bund);
  const paar = finde(auff, 'sind ein Paar');
  assert.ok(paar, 'der Bund unter Geschwistern fällt auf');
  /* Und es steht im richtigen Deutsch da — nicht „und schwester zueinander“. */
  assert.match(paar.text, /Cil Reet ist Bo Reets Schwester\./, paar.text);

  /* Zwei Fäden, die einander widersprechen. */
  const gegen = baum(k, [P('a', 'Ada'), P('b', 'Bo')], [F('liebt', 'a', 'b'), F('hasst', 'a', 'b')]);
  assert.ok(finde(k.teppichAuffaelligkeiten(gegen), 'zugleich'), 'Liebe und Hass zugleich fällt auf');

  /* Zeitliche Unmöglichkeiten. */
  const zeit = baum(k, [
    P('m', 'Mutter', { von: '1900', bis: '1940' }),
    P('k', 'Kind', { von: '1950' }),
    P('j', 'Jung', { von: '1912' }),
    P('s', 'Spross', { von: '1920' }),
    P('t', 'Tot', { von: '1980', bis: '1970' }),
    P('u', 'Uralt', { von: '1800', bis: '1990' })
  ], [F('kind', 'k', 'm'), F('kind', 's', 'j')]);
  const z = k.teppichAuffaelligkeiten(zeit);
  assert.ok(finde(z, 'Jahre tot'), 'ein Kind lange nach dem Tod des Elternteils');
  assert.ok(finde(z, 'erst 8 gewesen'), 'ein Elternteil, das selbst noch Kind war');
  assert.ok(finde(z, 'vor der eigenen Geburt'), 'Tod vor Geburt');
  assert.ok(finde(z, '190 Jahre alt'), 'ein unmögliches Alter');

  /* Ein Faden auf jemanden, den es zu Lebzeiten nie gab. */
  const nie = baum(k, [
    P('a', 'Alt', { von: '1800', bis: '1850' }),
    P('n', 'Neu', { von: '1900' })
  ], [F('kennt', 'a', 'n')]);
  assert.ok(finde(k.teppichAuffaelligkeiten(nie), 'wurde erst 1900 geboren'), 'zwei, die sich nie begegnet sein können');

  /* Ein sauberer Baum bleibt still — bis auf die Einzelgänger. */
  const heil = baum(k, [
    P('a', 'Ada', { von: '1900' }), P('b', 'Bo', { von: '1930' })
  ], [F('kind', 'b', 'a')]);
  assert.equal(k.teppichAuffaelligkeiten(heil).length, 0, 'nichts zu meckern');
});
