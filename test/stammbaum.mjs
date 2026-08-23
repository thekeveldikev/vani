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
