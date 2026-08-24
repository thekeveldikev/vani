/* Die Sternwarte (66). Geprüft wird das, worauf es ankommt: dass derselbe
   Himmel zweimal gleich herauskommt, dass er nach Himmel aussieht und
   nicht nach Konfetti, dass ein Sternbild seine Sterne behält, wenn sich
   der Himmel dreht — und dass die Auskünfte auf Deutsch aufgehen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function himmel(k, mehr) { return k.saubererHimmel(Object.assign({ titel: 'Probe', saat: 'probe' }, mehr || {})); }

test('Derselbe Himmel kommt zweimal gleich heraus', async () => {
  const k = await frisch();
  const a = k.sternFeld(himmel(k));
  const b = k.sternFeld(himmel(k));
  assert.equal(a.length, b.length);
  for (let i = 0; i < a.length; i++) {
    assert.equal(a[i].w, b[i].w, 'Stern ' + i + ' steht woanders');
    assert.equal(a[i].r, b[i].r);
    assert.equal(a[i].gr, b[i].gr);
  }
  /* Eine andere Saat gibt einen anderen Himmel. */
  const c = k.sternFeld(himmel(k, { saat: 'anders' }));
  assert.notEqual(a[10].w, c[10].w);
});

test('Der Himmel sieht nach Himmel aus, nicht nach Konfetti', async () => {
  const k = await frisch();
  /* Am echten Himmel wächst die Zahl der Sterne mit jeder Größenklasse
     stark an: eine Handvoll sehr heller, Tausende, die man kaum sieht.
     Der erste Versuch nahm die vierte Potenz einer Gleichverteilung und
     machte jeden fünften Stern zu einem hellen — 278 Sterne mit Hof und
     Strahlen auf einem Blatt. Das sah aus wie Schneetreiben. */
  for (const dichte of k.STERN_DICHTEN.map((d) => d[0])) {
    const feld = k.sternFeld(himmel(k, { dichte }));
    const leit = feld.filter((s) => s.gr > 3.2).length;
    const hell = feld.filter((s) => s.gr > 2.4).length;
    const schwach = feld.filter((s) => s.gr < 0.9).length;
    assert.ok(leit >= 1 && leit <= feld.length * 0.02, dichte + ': ' + leit + ' Leitsterne von ' + feld.length);
    assert.ok(hell <= feld.length * 0.05, dichte + ': ' + hell + ' helle von ' + feld.length + ' — zu viele');
    assert.ok(schwach > feld.length * 0.5, dichte + ': nur ' + schwach + ' schwache — der Himmel ist zu grell');
  }
});

test('Kein Stern liegt neben dem Blatt', async () => {
  const k = await frisch();
  for (const dichte of k.STERN_DICHTEN.map((d) => d[0])) {
    for (const tag of [1, 100, 200, 300, 365]) {
      const g = k.sternHimmelBauen(himmel(k, { dichte, tag }));
      for (const s of g.sterne) {
        assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y), 'Zahlen');
        const d = Math.hypot(s.x - k.STERN_MITTE, s.y - k.STERN_MITTE);
        assert.ok(d <= k.STERN_R + 0.5, 'ein Stern steht außerhalb der Scheibe: ' + Math.round(d));
      }
    }
  }
});

test('Der Himmel dreht sich einmal im Jahr — und die Sternbilder mit ihm', async () => {
  const k = await frisch();
  const h = himmel(k, { sternbilder: [{ id: 'a', name: 'Der Reiher', sterne: [5, 20, 60], linien: [[0, 1], [1, 2]] }] });
  const richtungen = new Set();
  for (const tag of [1, 92, 183, 274]) {
    const g = k.sternHimmelBauen(Object.assign({}, h, { tag }));
    const m = k.sternbildMitte(h.sternbilder[0], g.sterne);
    assert.ok(m, 'das Sternbild hat eine Mitte');
    richtungen.add(k.sternRichtung(m[0], m[1]));
  }
  assert.ok(richtungen.size >= 3, 'übers Jahr wandert es wirklich: ' + [...richtungen].join(', '));

  /* Nach einem vollen Jahr steht alles wieder da, wo es war. */
  const a = k.sternHimmelBauen(Object.assign({}, h, { tag: 1 }));
  const b = k.sternHimmelBauen(Object.assign({}, h, { tag: 366 }));
  assert.ok(Math.abs(a.sterne[7].x - b.sterne[7].x) < 0.001, 'nach einem Jahr wieder am selben Ort');

  /* Der Abstand zur Mitte bleibt: eine Drehung ändert die Höhe nicht. */
  for (const tag of [1, 55, 200]) {
    const g = k.sternHimmelBauen(Object.assign({}, h, { tag }));
    const d = Math.hypot(g.sterne[7].x - k.STERN_MITTE, g.sterne[7].y - k.STERN_MITTE);
    assert.ok(Math.abs(d - a.sterne[7].r) < 0.001, 'der Abstand bleibt');
  }
});

test('Ein Sternbild überlebt das Putzen', async () => {
  const k = await frisch();
  /* Ein Sternbild hängt an SternNUMMERN, nicht an Koordinaten — sonst wäre
     es nach jeder Drehung woanders. */
  const roh = {
    titel: 'Probe', saat: 'probe',
    sternbilder: [
      { id: 'a', name: '  Der Reiher  ', sterne: [3, 8, 8, 'x', -5, 99999], linien: [[0, 1], [1, 2], [0, 0], [0, 9], 'unsinn'] },
      { id: 'a', name: 'Doppelt', sterne: [1, 2] },
      { id: '', name: 'Ohne Kennung', sterne: [1, 2] },
      { id: 'leer', name: 'Ohne Sterne', sterne: [] },
      null, 'Unsinn'
    ]
  };
  const h = k.saubererHimmel(roh);
  assert.equal(h.sternbilder.length, 1, 'nur eines bleibt übrig');
  const b = h.sternbilder[0];
  assert.equal(b.name, 'Der Reiher', 'der Name wird geputzt');
  assert.ok(b.sterne.every((n) => Number.isFinite(n) && n >= 0), 'nur brauchbare Nummern: ' + b.sterne.join(','));
  /* Eine Linie auf sich selbst und eine ins Leere fallen weg. */
  assert.ok(b.linien.every((l) => l[0] !== l[1] && l[0] < b.sterne.length && l[1] < b.sterne.length),
    'nur Linien, die es geben kann: ' + JSON.stringify(b.linien));
});

test('Die Auskünfte gehen im Deutschen auf', async () => {
  const k = await frisch();
  const M = k.STERN_MITTE;
  /* Höhe und Richtung. Oben ist Norden — in SVG zeigt y nach unten, das
     geht leicht schief. */
  assert.equal(k.sternRichtung(M, M - 100), 'im Norden');
  assert.equal(k.sternRichtung(M, M + 100), 'im Süden');
  assert.equal(k.sternRichtung(M + 100, M), 'im Osten');
  assert.equal(k.sternRichtung(M - 100, M), 'im Westen');
  assert.equal(k.sternHoehe(M, M), 'im Zenit');
  assert.ok(/Horizont/.test(k.sternHoehe(M, M + k.STERN_R * 0.95)));

  /* Das Datum. */
  assert.equal(k.sternTagAusDatum('1949-01-01'), 1);
  assert.equal(k.sternTagAusDatum('1949-12-31'), 365);
  assert.equal(k.sternTagAusDatum('14.06.1949'), k.sternTagAusDatum('1949-06-14'));
  assert.equal(k.sternTagAusDatum('irgendwann'), null);
  assert.equal(k.sternTagAusDatum(''), null);

  assert.equal(k.sternDatumText(1), '1. Januar');
  assert.equal(k.sternDatumText(365), '31. Dezember');
  assert.equal(k.sternDatumText(60), '1. März');

  /* Der Geburtssatz. Der Name trägt seinen Artikel („Die Stille Sichel“) —
     mitten im Satz stünde er dann groß, wo Deutsch klein verlangt. Darum
     steht er am Ende. */
  const h = himmel(k, { sternbilder: [{ id: 'a', name: 'Die Stille Sichel', sterne: [3, 17, 42], linien: [[0, 1]] }] });
  const satz = k.sternGeburtssatz(h, '1949-06-14');
  assert.match(satz, /^An diesem Tag stand am höchsten: Die Stille Sichel\.$/, satz);
  assert.ok(!/stand Die /.test(satz), 'kein großer Artikel mitten im Satz');
  assert.equal(k.sternGeburtssatz(h, 'irgendwann'), '');
  assert.equal(k.sternGeburtssatz(himmel(k), '1949-06-14'), '', 'ohne Sternbild kein Satz');
});

test('Namen für Sternbilder sind deutsch und stabil', async () => {
  const k = await frisch();
  const gesehen = new Set();
  for (let i = 0; i < 120; i++) {
    const n = k.sternName('probe', i);
    assert.match(n, /^(Der|Die|Das) /, 'mit Artikel: ' + n);
    assert.ok(!/undefined|NaN|\s\s/.test(n), n);
    gesehen.add(n);
  }
  assert.ok(gesehen.size > 40, 'es gibt genug verschiedene: ' + gesehen.size);
  assert.equal(k.sternName('probe', 7), k.sternName('probe', 7), 'derselbe Wurf, derselbe Name');
  /* Der Vorschlag nimmt keinen, den es schon gibt. */
  const h = himmel(k, { sternbilder: [{ id: 'a', name: k.sternName('probe', 0), sterne: [1] }] });
  assert.notEqual(k.sternNeuerName(h), h.sternbilder[0].name);
});

test('Einen Stern treffen — auch mit dem Finger', async () => {
  const k = await frisch();
  const g = k.sternHimmelBauen(himmel(k));
  const ziel = g.sterne.find((s) => s.gr > 3) || g.sterne[0];
  /* Genau darauf. */
  assert.equal(k.sternBei(g, ziel.x, ziel.y, 26).n, ziel.n);
  /* Ein Stück daneben findet ihn noch. */
  const nah = k.sternBei(g, ziel.x + 7, ziel.y + 5, 26);
  assert.ok(nah, 'ein Finger trifft nicht auf den Punkt genau');
  /* Weit daneben findet nichts — dann soll auch nichts passieren. */
  assert.equal(k.sternBei(g, 5, 5, 12), null);
});

test('Was auffällt, wird gezeigt', async () => {
  const k = await frisch();
  const leer = k.sternAuffaelligkeiten(himmel(k));
  assert.ok(leer.some((a) => a.art === 'leer'), 'ein leerer Himmel sagt, wie man anfängt');

  const h = himmel(k, { sternbilder: [
    { id: 'a', name: '', sterne: [1, 2], linien: [[0, 1]] },
    { id: 'b', name: 'Der Reiher', sterne: [3, 4], linien: [] },
    { id: 'c', name: 'Der Wolf', sterne: [5, 6], linien: [[0, 1]] },
    { id: 'd', name: 'Der Wolf', sterne: [7, 8], linien: [[0, 1]] }
  ] });
  const auff = k.sternAuffaelligkeiten(h);
  assert.ok(auff.some((a) => a.art === 'name'), 'ein Sternbild ohne Namen');
  assert.ok(auff.some((a) => a.art === 'linien'), 'Sterne ohne Linien');
  assert.ok(auff.some((a) => a.art === 'doppelt'), 'zweimal derselbe Name');
});

test('Jede Farbwelt ist vollständig', async () => {
  const k = await frisch();
  assert.ok(k.STERN_WELTEN.length >= 4);
  for (const w of k.STERN_WELTEN) {
    for (const feld of ['id', 'name', 'grund', 'grund2', 'milch', 'stern', 'hell', 'linie', 'schrift', 'rand', 'ekliptik']) {
      assert.ok(w[feld], w.id + ': ' + feld + ' fehlt');
    }
    /* Alle Farben sind wirklich Farben — ein Tippfehler im Wert fällt
       sonst erst auf, wenn das Blatt seltsam aussieht. */
    for (const feld of ['grund', 'grund2', 'milch', 'stern', 'hell', 'linie', 'schrift', 'rand', 'ekliptik']) {
      assert.match(w[feld], /^#[0-9a-f]{3,8}$/i, w.id + '/' + feld + ': keine Farbe — ' + w[feld]);
    }
  }
});

test('Ein großer Himmel wird schnell genug gerechnet', async () => {
  const k = await frisch();
  const h = himmel(k, { dichte: 'ueberwaeltigend' });
  let dauer = Infinity, g = null;
  for (let lauf = 0; lauf < 2; lauf++) {
    const start = Date.now();
    g = k.sternHimmelBauen(h);
    dauer = Math.min(dauer, Date.now() - start);
  }
  assert.ok(dauer < 400, dauer + ' ms für ' + g.sterne.length + ' Sterne');
  assert.ok(g.sterne.length > 2000, 'und es sind wirklich viele: ' + g.sterne.length);
});

/* --- Was sich bewegt: Wandelsterne, Mond, Nebel, Komet --- */

test('Die Wandelsterne wandern — und zwar jeder anders', async () => {
  const k = await frisch();
  /* Der Unterschied zwischen einem Bild und einem Himmel ist, dass sich
     etwas darin bewegt, und zwar ANDERS als der Rest. Fixsterne stehen
     zueinander immer gleich; ein Wandelstern zieht seine eigene Bahn. */
  const h = himmel(k, { saat: 'wandel' });
  const w = k.sternWandler(h);
  assert.ok(w.length >= 2 && w.length <= 7, w.length + ' Wandelsterne');
  for (const p of w) {
    assert.ok(p.name && p.sage, 'jeder hat Namen und Sage');
    assert.ok(p.umlauf >= 140 && p.umlauf <= 4400, 'eine Umlaufzeit, die man erleben kann: ' + p.umlauf);
  }
  assert.equal(new Set(w.map((p) => p.name)).size, w.length, 'keiner heißt wie ein anderer');

  /* Über ein halbes Jahr steht er woanders — und zwar woanders als ein
     Fixstern, der nur mitgedreht wurde. */
  const einer = w[0];
  const [x1, y1] = k.sternWandlerStelle(einer, 1);
  const [x2, y2] = k.sternWandlerStelle(einer, 183);
  assert.ok(Math.hypot(x2 - x1, y2 - y1) > 40, 'er ist wirklich gewandert');

  /* Und er bleibt auf dem Blatt. */
  for (let t = 1; t <= 365; t += 17) {
    const [x, y] = k.sternWandlerStelle(einer, t);
    assert.ok(Math.hypot(x - k.STERN_MITTE, y - k.STERN_MITTE) <= k.STERN_R + 1, 'Tag ' + t + ': von der Scheibe gelaufen');
  }
});

test('Der Mond läuft durch alle Phasen', async () => {
  const k = await frisch();
  /* Der erste Versuch legte bei Vollmond einen Schattenkreis genau auf den
     Mond — und löschte ihn damit aus. Es sah aus wie eine graue Münze.
     Der Wert `voll` sagt, wie viel leuchtet: 0 ist Neumond, 1 Vollmond. */
  const h = himmel(k, { saat: 'mond' });
  const gesehen = new Set();
  let hoechst = 0, niedrigst = 1;
  for (let t = 1; t <= 40; t++) {
    const m = k.sternMond(Object.assign({}, h, { tag: t }));
    assert.ok(m, 'es gibt einen Mond');
    assert.ok(m.voll >= 0 && m.voll <= 1, 'die Phase liegt zwischen 0 und 1: ' + m.voll);
    assert.ok(m.name, 'sie hat einen deutschen Namen');
    hoechst = Math.max(hoechst, m.voll);
    niedrigst = Math.min(niedrigst, m.voll);
    gesehen.add(m.name);
  }
  assert.ok(hoechst > 0.9, 'innerhalb eines Monats gibt es einen Vollmond: ' + hoechst.toFixed(2));
  assert.ok(niedrigst < 0.1, 'und einen Neumond: ' + niedrigst.toFixed(2));
  assert.ok(gesehen.size >= 5, 'er läuft durch mehrere Phasen: ' + [...gesehen].join(', '));

  /* Die Namen sind deutsch und sagen, was sie meinen. */
  assert.equal(k.sternMondphaseName(0), 'Neumond');
  assert.equal(k.sternMondphaseName(0.5), 'Vollmond');
  assert.match(k.sternMondphaseName(0.15), /zunehmend/);
  assert.match(k.sternMondphaseName(0.85), /abnehmend/);

  /* Ohne Haken kein Mond. */
  assert.equal(k.sternMond(himmel(k, { mond: false })), null);
});

test('Nebel, Haufen und Komet bleiben auf dem Blatt', async () => {
  const k = await frisch();
  for (const saat of ['a', 'b', 'c', 'd']) {
    const h = himmel(k, { saat });
    for (const n of k.sternNebel(h)) {
      for (const tag of [1, 120, 300]) {
        const [x, y] = k.sternNebelStelle(n, tag);
        assert.ok(Math.hypot(x - k.STERN_MITTE, y - k.STERN_MITTE) <= k.STERN_R + 1, saat + ': ein Nebel ist von der Scheibe gelaufen');
      }
      assert.ok(n.ecken.length >= 9, 'ein Nebel hat einen ausgefransten Umriss');
    }
    const komet = k.sternKomet(h);
    if (komet) {
      assert.ok(komet.name, 'der Komet hat einen Namen');
      /* Der Schweif zeigt IMMER von der Sonne weg — und die steht, von
         hier aus gesehen, in der Mitte des Blattes. Das ist die eine
         Regel, an der man einen falsch gezeichneten Kometen erkennt. */
      const zurMitte = Math.atan2(k.STERN_MITTE - komet.y, k.STERN_MITTE - komet.x);
      let d = Math.abs(komet.schweif - zurMitte);
      while (d > Math.PI) d = Math.PI * 2 - d;
      assert.ok(Math.abs(d - Math.PI) < 0.01, 'der Schweif zeigt von der Mitte weg');
    }
  }
  /* Nicht jeder Himmel hat einen Kometen — einer, den es immer gibt, ist
     keiner mehr. */
  const mitKomet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].filter((s) => k.sternKomet(himmel(k, { saat: s })));
  assert.ok(mitKomet.length > 0 && mitKomet.length < 8, 'manche haben einen, manche nicht: ' + mitKomet.length + ' von 8');
});

test('Die Sternhaufen ändern keine Sternnummer', async () => {
  const k = await frisch();
  /* Ein Sternbild speichert die NUMMERN seiner Sterne. Wer neue Sterne
     vorne in die Liste legt, verschiebt jede Nummer dahinter — und alle
     bestehenden Sternbilder zeigen danach auf fremde Sterne: die Linien
     liefen quer über den Himmel. Genau das ist passiert. */
  const ohne = k.sternFeld(himmel(k, { saat: 'h', haufen: false }));
  const mit = k.sternFeld(himmel(k, { saat: 'h', haufen: true }));
  assert.ok(mit.length > ohne.length, 'die Haufen bringen wirklich Sterne mit');
  for (let i = 0; i < ohne.length; i++) {
    assert.equal(mit[i].w, ohne[i].w, 'Stern ' + i + ' ist verrutscht');
    assert.equal(mit[i].r, ohne[i].r, 'Stern ' + i + ' ist verrutscht');
  }
  /* Und die Haufen liegen wirklich als Knoten beieinander. */
  const haufen = k.sternHaufen(himmel(k, { saat: 'h' }));
  assert.ok(haufen.length >= 2);
  const drin = mit.filter((s) => s.haufen === 0);
  assert.ok(drin.length > 10, 'im ersten Haufen stehen viele: ' + drin.length);
});

test('Sternfarben sind Farben, keine Filter', async () => {
  const k = await frisch();
  /* Vorher drehte ein CSS-Filter den Farbton der ganzen Form — bei einem
     weißen Stern auf dunklem Grund war davon nichts zu sehen. */
  const w = k.sternWelt('tinte');
  const kalt = k.sternFarbe(0.02, w);
  const warm = k.sternFarbe(0.99, w);
  const mitte = k.sternFarbe(0.5, w);
  for (const f of [kalt, warm, mitte]) assert.match(f, /^#[0-9a-f]{3,8}$/i, 'eine echte Farbe: ' + f);
  assert.notEqual(kalt, warm, 'kalt und warm sind verschieden');
  assert.equal(mitte, w.stern, 'die Mitte ist die Grundfarbe');
  /* Jede Welt bringt ihre eigenen mit. */
  for (const welt of k.STERN_WELTEN) {
    for (const feld of ['kalt', 'kuehl', 'warm', 'rot']) {
      assert.match(welt[feld], /^#[0-9a-f]{3,8}$/i, welt.id + '/' + feld);
    }
  }
});
