/* Der Kartentisch (65). Geprüft wird, was bei einem Generator wirklich
   schiefgehen kann: dass dieselbe Saat NICHT dieselbe Stadt ergibt, dass
   Häuser im Wasser stehen, dass ein Weiler so viele Häuser bekommt wie eine
   Metropole — und dass ein Beleg mit Unsinn darin die App anhält. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function plan(k, mehr) {
  const stadt = Object.assign(
    { groesse: 'stadt', alter: 'alt', wasser: 'fluss', mauer: true, burg: true, umland: true, dichte: 1 },
    (mehr || {}).stadt || {});
  return k.saubererPlan(Object.assign({ titel: 'Probe', saat: 'probe-1' }, mehr || {}, { stadt }));
}

test('Dieselbe Saat ergibt dieselbe Stadt — bis auf den letzten Dachfirst', async () => {
  const k = await frisch();
  const p = plan(k);
  const eins = k.planBauen(p), zwei = k.planBauen(p);
  assert.equal(eins.stadt.haeuser.length, zwei.stadt.haeuser.length);
  assert.equal(JSON.stringify(eins.stadt.haeuser[0].ecken), JSON.stringify(zwei.stadt.haeuser[0].ecken), 'gerechnet, nicht gewürfelt');
  assert.equal(JSON.stringify(eins.stadt.mitte), JSON.stringify(zwei.stadt.mitte));
  const andere = k.planBauen(plan(k, { saat: 'probe-2' }));
  assert.notEqual(JSON.stringify(andere.stadt.haeuser[0].ecken), JSON.stringify(eins.stadt.haeuser[0].ecken), 'eine andere Saat, eine andere Stadt');
});

test('Kein Haus steht im Wasser, kein Acker schwimmt', async () => {
  const k = await frisch();
  for (const wasser of ['fluss', 'kueste', 'see', 'insel']) {
    const p = plan(k, { saat: 'w-' + wasser, stadt: { groesse: 'grossstadt', wasser } });
    const g = k.planBauen(p);
    assert.ok(g.stadt.haeuser.length > 20, wasser + ': es steht überhaupt etwas — ' + g.stadt.haeuser.length);
    for (const h of g.stadt.haeuser) {
      const m = [(h.ecken[0][0] + h.ecken[2][0]) / 2, (h.ecken[0][1] + h.ecken[2][1]) / 2];
      assert.ok(!g.wasser.drin(m[0], m[1]), wasser + ': ein Haus steht im Wasser bei ' + m.map(Math.round));
    }
    for (const f of g.umland.felder) {
      assert.ok(!g.wasser.drin(f.ecken[0][0], f.ecken[0][1]), wasser + ': ein Acker liegt im Wasser');
    }
  }
});

test('Straßen laufen nicht ins Meer', async () => {
  const k = await frisch();
  const g = k.planBauen(plan(k, { saat: 'kw', stadt: { wasser: 'kueste', groesse: 'grossstadt' } }));
  for (const s of g.stadt.strassen) {
    for (const stueck of k.planTrockeneWege(s.punkte, g.wasser, !!s.geschlossen)) {
      for (const q of stueck.punkte) {
        assert.ok(!g.wasser.drin(q[0], q[1]), 'ein Stück Straße liegt im Wasser bei ' + q.map(Math.round));
      }
    }
  }
  /* Ohne Wasser bleibt jeder Weg, wie er ist */
  const trocken = k.planBauen(plan(k, { stadt: { wasser: 'keins' } }));
  const w = trocken.stadt.strassen[0];
  const stuecke = k.planTrockeneWege(w.punkte, trocken.wasser, false);
  assert.equal(stuecke.length, 1);
  assert.equal(stuecke[0].punkte.length, w.punkte.length);
});

test('Ein Weiler ist kleiner als eine Metropole', async () => {
  const k = await frisch();
  const zahl = (g) => k.planBauen(plan(k, { stadt: { groesse: g, wasser: 'keins' } })).stadt.haeuser.length;
  const weiler = zahl('weiler'), stadt = zahl('stadt'), gross = zahl('metropole');
  assert.ok(weiler < stadt, 'Weiler ' + weiler + ' < Stadt ' + stadt);
  assert.ok(stadt < gross, 'Stadt ' + stadt + ' < Metropole ' + gross);
  assert.ok(weiler > 5, 'aber auch ein Weiler hat Häuser: ' + weiler);
});

test('Dichter gebaut heißt mehr Häuser, nicht andere Straßen', async () => {
  const k = await frisch();
  const bau = (d) => k.planBauen(plan(k, { stadt: { wasser: 'keins', dichte: d } }));
  const duenn = bau(0.6), dicht = bau(1.5);
  assert.ok(dicht.stadt.haeuser.length > duenn.stadt.haeuser.length, 'dichter: ' + dicht.stadt.haeuser.length + ' gegen ' + duenn.stadt.haeuser.length);
  assert.equal(dicht.stadt.strassen.length, duenn.stadt.strassen.length, 'die Straßen bleiben dieselben');
});

test('Eine geplante Stadt ist gerader als eine gewachsene', async () => {
  const k = await frisch();
  const unruhe = (alter) => {
    const g = k.planBauen(plan(k, { saat: 'u', stadt: { alter, wasser: 'keins', mauer: false, burg: false, umland: false } }));
    const ring = g.stadt.strassen.find((s) => s.richtung === 'ring' && s.j === 2);
    const r = ring.punkte.map((p) => Math.hypot(p[0] - g.stadt.mitte[0], p[1] - g.stadt.mitte[1]));
    const schnitt = r.reduce((a, b) => a + b, 0) / r.length;
    return Math.sqrt(r.reduce((a, b) => a + (b - schnitt) ** 2, 0) / r.length) / schnitt;
  };
  assert.ok(unruhe('uralt') > unruhe('neu') * 2, 'uralt ist deutlich krummer als am Reißbrett');
});

test('Eine gewachsene Stadt hat ungleich große Blöcke', async () => {
  const k = await frisch();
  const spanne = (alter) => {
    const g = k.planBauen(plan(k, { saat: 'bl', stadt: { alter, wasser: 'keins', groesse: 'grossstadt' } }));
    const b = g.stadt.bloecke.filter((x) => x.j === 2).map((x) => x.breit);
    return Math.max(...b) / Math.min(...b);
  };
  /* Wo eine Straße fehlt, wachsen zwei Blöcke zusammen — dann ist der
     breiteste deutlich breiter als der schmalste. */
  assert.ok(spanne('uralt') > 1.5, 'uralt: die Blöcke sind ungleich (' + spanne('uralt').toFixed(2) + ')');
});

test('Ohne Mauer keine Tore, ohne Umland keine Felder', async () => {
  const k = await frisch();
  const ohne = k.planBauen(plan(k, { stadt: { wasser: 'keins', mauer: false, burg: false, umland: false } }));
  assert.equal(ohne.stadt.mauer, null);
  assert.equal(ohne.stadt.burg, null);
  assert.equal(ohne.umland.felder.length, 0);
  const mit = k.planBauen(plan(k, { stadt: { wasser: 'keins' } }));
  assert.ok(mit.stadt.mauer.tore.length >= 2, 'eine Mauer hat Tore');
  assert.ok(mit.umland.felder.length + mit.umland.waelder.length > 5);
  for (const t of mit.stadt.mauer.tore) assert.ok(t.name && t.name.endsWith('tor'), 'jedes Tor heißt irgendwie: ' + t.name);
});

test('Ein Fluss bekommt Brücken, trockenes Land nicht', async () => {
  const k = await frisch();
  const fluss = k.planBauen(plan(k, { saat: 'br', stadt: { groesse: 'grossstadt', wasser: 'fluss' } }));
  assert.ok(fluss.stadt.bruecken.length >= 1, 'über den Fluss führt etwas: ' + fluss.stadt.bruecken.length);
  const trocken = k.planBauen(plan(k, { stadt: { wasser: 'keins' } }));
  assert.equal(trocken.stadt.bruecken.length, 0);
});

test('Der Beleg wird geputzt — Unsinn hält nichts an', async () => {
  const k = await frisch();
  const p = k.saubererPlan({
    titel: '   ', saat: '', welt: 'gibtsnicht', papier: 'gibtsnicht', zuschnitt: 'gibtsnicht',
    stadt: { groesse: 'riesig', alter: 'steinzeit', wasser: 'lava', dichte: 99 },
    marken: [
      { id: 'a', art: 'kirche', name: '  Sankt Nore  ', x: 100, y: 200 },
      { id: 'a', art: 'burg', name: 'Doppelt', x: 1, y: 1 },
      { id: 'b', art: 'gibtsnicht', name: 'Unbekannt', x: 5000, y: -900 },
      { id: 'c', art: 'turm', x: 'unfug', y: 3 },
      null, 'quatsch'
    ],
    namen: { 'gasse:speiche:0': '  Krummgasse  ', leer: '   ' }
  });
  assert.equal(p.titel, 'Ohne Namen');
  assert.ok(p.saat, 'ohne Saat keine Stadt — es wird eine gesetzt');
  assert.equal(p.welt, 'tinte', 'unbekannte Farbwelt fällt zurück');
  assert.equal(p.zuschnitt, 'blatt');
  assert.equal(p.stadt.groesse, 'stadt');
  assert.equal(p.stadt.wasser, 'fluss');
  assert.ok(p.stadt.dichte <= 1.6, 'die Dichte bleibt in ihren Grenzen');
  assert.equal(p.marken.length, 2, 'Doppelte und Punktlose fallen heraus');
  assert.equal(p.marken[0].name, 'Sankt Nore');
  assert.equal(p.marken[1].art, 'stern', 'unbekannte Art wird zum Stern');
  assert.ok(p.marken[1].x <= 1200 && p.marken[1].y >= 0, 'Marken bleiben auf dem Blatt');
  assert.equal(p.namen['gasse:speiche:0'], 'Krummgasse');
  assert.equal(p.namen.leer, undefined);
  const leer = k.saubererPlan({});
  assert.ok(k.planBauen(leer).stadt.haeuser.length > 0, 'auch aus nichts wird eine Stadt');
});

test('Eigene Namen schlagen die gerechneten', async () => {
  const k = await frisch();
  const p = plan(k, { namen: { 'gasse:ring:1': 'Der alte Wall', 'viertel:0': 'Das Rabenviertel' } });
  const g = k.planBauen(p);
  const ring = g.stadt.strassen.find((s) => s.richtung === 'ring' && s.j === 1);
  assert.equal(k.planStrassenname(p, ring), 'Der alte Wall');
  assert.equal(k.planViertelnameVon(p, g.stadt.viertel[0]), 'Das Rabenviertel');
  const anderer = g.stadt.strassen.find((s) => s.richtung === 'ring' && s.j === 2);
  assert.equal(k.planStrassenname(p, anderer), anderer.name, 'ohne eigenen Namen der gerechnete');
  assert.equal(k.planGassenname('probe-1', 'ri2', 'ring'), k.planGassenname('probe-1', 'ri2', 'ring'), 'und der ist stabil');
});

test('Wegzeiten lesen sich wie Sätze, nicht wie Zahlen', async () => {
  const k = await frisch();
  const a = { x: 100, y: 100 }, b = { x: 400, y: 500 };
  const zuFuss = k.planWegzeit(a, b), pferd = k.planWegzeit(a, b, 'pferd');
  assert.ok(zuFuss.minuten > pferd.minuten, 'zu Pferd geht es schneller');
  assert.ok(zuFuss.meter > 0);
  assert.equal(k.planZeitText(0.4), 'keine Minute');
  assert.equal(k.planZeitText(1.4), 'eine Minute');
  assert.equal(k.planZeitText(24), '24 Minuten');
  assert.equal(k.planZeitText(60), 'eine Stunde');
  assert.equal(k.planZeitText(150), '2 Stunden und 30 Minuten');
  assert.equal(k.planZeitText(121), '2 Stunden', 'eine Minute Rest wird nicht genannt');
  assert.equal(k.planWegzeit(a, a).meter, 0, 'dieselbe Stelle: kein Weg');
});

test('Die Suche findet Marken, Gassen und Viertel', async () => {
  const k = await frisch();
  const p = plan(k, {
    marken: [{ id: 'a', art: 'wirtshaus', name: 'Zum blinden Reiher', notiz: 'Hier trinkt Alma.', x: 400, y: 400 }],
    namen: { 'viertel:0': 'Das Rabenviertel' }
  });
  const g = k.planBauen(p);
  assert.equal(k.planSuche(p, 'reiher', g)[0].name, 'Zum blinden Reiher');
  assert.equal(k.planSuche(p, 'alma', g)[0].art, 'marke', 'auch die Notiz zählt');
  assert.equal(k.planSuche(p, 'raben', g).some((x) => x.art === 'viertel'), true);
  assert.equal(k.planSuche(p, 'wirtshaus', g).length, 1, 'auch über die Art');
  assert.equal(k.planSuche(p, '', g).length, 0, 'ohne Frage keine Antwort');
  assert.equal(k.planSuche(p, 'gibtsnicht', g).length, 0);
});

test('Was auffällt, wird gezeigt — nicht bemängelt', async () => {
  const k = await frisch();
  const p = plan(k, {
    saat: 'auf', stadt: { wasser: 'see' },
    marken: [
      { id: 'a', art: 'wirtshaus', name: 'Doppelt', x: 300, y: 300 },
      { id: 'b', art: 'schmiede', name: 'Doppelt', x: 500, y: 500 },
      { id: 'c', art: 'turm', name: '', x: 520, y: 520 },
      { id: 'd', art: 'turm', name: '', x: 530, y: 530 },
      { id: 'e', art: 'turm', name: '', x: 540, y: 540 },
      { id: 'f', art: 'turm', name: '', x: 550, y: 550 }
    ]
  });
  const auff = k.planAuffaelligkeiten(p);
  assert.ok(auff.some((a) => a.art === 'doppelt'), 'derselbe Name zweimal fällt auf');
  assert.ok(auff.some((a) => a.art === 'namenlos'), 'viele Namenlose fallen auf');
});

test('Namen für Gassen, Viertel, Tore und Städte sind deutsch und stabil', async () => {
  const k = await frisch();
  for (const art of ['haupt', 'gasse', 'ring']) {
    const n = k.planGassenname('s', 'x', art);
    assert.ok(n.length > 4, art + ': ' + n);
    assert.equal(n, k.planGassenname('s', 'x', art), 'stabil');
    assert.ok(n.indexOf(' ') < 0, 'ein Wort, wie im Deutschen: ' + n);
  }
  assert.ok(k.planStadtname('abc').length > 4);
  assert.equal(k.planStadtname('abc'), k.planStadtname('abc'));
  assert.equal(k.planViertelnameVon({ namen: {} }, { nr: 0, art: 'hafen', name: 'Am Hafen' }), 'Am Hafen');
  assert.notEqual(k.planNeueSaat(), k.planNeueSaat(), 'zwei frische Saaten sind nicht dieselbe');
});

test('Marken, Zeichen und Gruppen gehören zusammen', async () => {
  const k = await frisch();
  assert.ok(k.PLAN_MARKEN.length >= 24, 'reichlich Arten: ' + k.PLAN_MARKEN.length);
  assert.equal(new Set(k.PLAN_MARKEN_IDS).size, k.PLAN_MARKEN_IDS.length, 'keine Kennung doppelt');
  const gruppen = new Set(k.PLAN_MARKENGRUPPEN.map((g) => g[0]));
  for (const m of k.PLAN_MARKEN) {
    assert.ok(gruppen.has(m.gruppe), m.id + ': unbekannte Gruppe');
    assert.ok(m.name, m.id + ': ohne Namen');
    assert.ok(k.PLAN_ZEICHEN[m.id], m.id + ': ohne Zeichen');
  }
  for (const [gid, gname] of k.PLAN_MARKENGRUPPEN) {
    assert.ok(k.PLAN_MARKEN.some((m) => m.gruppe === gid), 'Gruppe ohne Marken: ' + gname);
  }
});

test('Jede Farbwelt ist vollständig', async () => {
  const k = await frisch();
  assert.ok(k.PLAN_FARBWELTEN.length >= 5);
  for (const w of k.PLAN_FARBWELTEN) {
    for (const feld of ['wasser', 'wasserrand', 'gruen', 'gruendunkel', 'dach', 'dachdunkel', 'mauer', 'strasse', 'tinte', 'gold']) {
      assert.ok(w[feld], w.id + ': ' + feld + ' fehlt');
    }
    assert.ok(Array.isArray(w.daecher) && w.daecher.length >= 3, w.id + ': zu wenige Dachtöne');
    assert.ok(k.PLAN_PAPIERE.some((p) => p[0] === w.papier), w.id + ': unbekanntes Papier');
  }
});

test('Ein großer Plan wird schnell genug gebaut', async () => {
  const k = await frisch();
  const p = plan(k, { stadt: { groesse: 'metropole', alter: 'uralt', wasser: 'fluss', dichte: 1.6 } });
  const start = Date.now();
  const g = k.planBauen(p);
  const dauer = Date.now() - start;
  assert.ok(dauer < 900, 'unter einer Sekunde: ' + dauer + ' ms für ' + g.stadt.haeuser.length + ' Häuser');
  assert.ok(g.stadt.haeuser.length > 200, 'und es ist wirklich viel: ' + g.stadt.haeuser.length);
});
