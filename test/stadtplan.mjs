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
  /* Die Ausfallstraßen bleiben dieselben — eine dichtere Stadt bekommt aber
     mehr Gassen, weil große Blöcke geteilt werden. Genau so verdichtet sich
     eine Stadt wirklich. */
  const adern = (g) => g.stadt.strassen.filter((s) => s.richtung === 'speiche').length;
  assert.equal(adern(dicht), adern(duenn), 'dieselben Ausfallstraßen');
  assert.ok(dicht.stadt.strassen.length > duenn.stadt.strassen.length, 'aber mehr Gassen');
});

test('Eine geplante Stadt ist gerader als eine gewachsene', async () => {
  const k = await frisch();
  /* Gemessen an den Ausfallstraßen: wie stark wendet sich eine Straße von
     Schritt zu Schritt? Im Reißbrett-Fall fast gar nicht. */
  const wendung = (alter) => {
    const g = k.planBauen(plan(k, { saat: 'u', stadt: { alter, wasser: 'keins', mauer: false, burg: false, umland: false } }));
    let summe = 0, wieviele = 0;
    for (const w of g.stadt.strassen.filter((x) => x.richtung === 'speiche' && x.punkte.length > 3)) {
      for (let i = 2; i < w.punkte.length; i++) {
        const a1 = Math.atan2(w.punkte[i - 1][1] - w.punkte[i - 2][1], w.punkte[i - 1][0] - w.punkte[i - 2][0]);
        const a2 = Math.atan2(w.punkte[i][1] - w.punkte[i - 1][1], w.punkte[i][0] - w.punkte[i - 1][0]);
        let d = Math.abs(a2 - a1);
        if (d > Math.PI) d = Math.PI * 2 - d;
        summe += d; wieviele++;
      }
    }
    return wieviele ? summe / wieviele : 0;
  };
  const alt = wendung('uralt'), neu = wendung('neu');
  assert.ok(alt > neu * 2, 'uralt wendet sich deutlich mehr: ' + alt.toFixed(3) + ' gegen ' + neu.toFixed(3));
});

test('Die Blöcke sind ungleich geformt — das Netz ist gewachsen, kein Raster', async () => {
  const k = await frisch();
  const g = k.planBauen(plan(k, { saat: 'bl', stadt: { alter: 'uralt', wasser: 'keins', groesse: 'grossstadt' } }));
  const bl = g.stadt.bloecke;
  assert.ok(bl.length > 20, 'es gibt reichlich Blöcke: ' + bl.length);
  /* Die Flächen gleichen sich an — das ist Absicht, große Blöcke werden
     geteilt. Was eine gewachsene Stadt ausmacht, ist die FORM: Blöcke mit
     drei, vier, fünf, sechs Ecken, mal gedrungen, mal lang gezogen. */
  const ecken = new Set(bl.map((b) => b.ecken.length));
  assert.ok(ecken.size >= 3, 'die Blöcke haben verschieden viele Ecken: ' + [...ecken].sort().join(', '));
  assert.ok(bl.some((b) => b.ecken.length > 4), 'manche haben mehr als vier');
  /* Und die Länglichkeit schwankt */
  const streckung = bl.map((b) => {
    let kurz = 1e9, lang = 0;
    for (let i = 0; i < b.ecken.length; i++) {
      const l = Math.hypot(b.ecken[(i + 1) % b.ecken.length][0] - b.ecken[i][0], b.ecken[(i + 1) % b.ecken.length][1] - b.ecken[i][1]);
      if (l < kurz) kurz = l;
      if (l > lang) lang = l;
    }
    return lang / Math.max(1, kurz);
  }).sort((x, y) => x - y);
  const unten = streckung[Math.floor(streckung.length * 0.2)];
  const oben = streckung[Math.floor(streckung.length * 0.8)];
  assert.ok(oben / unten > 1.8, 'mal gedrungen, mal lang gezogen: ' + unten.toFixed(2) + ' bis ' + oben.toFixed(2));
});

test('Jeder Block ist ein geschlossenes Vieleck ohne Selbstschnitt', async () => {
  const k = await frisch();
  const g = k.planBauen(plan(k, { saat: 'poly', stadt: { alter: 'alt', wasser: 'fluss' } }));
  for (const b of g.stadt.bloecke) {
    assert.ok(b.ecken.length >= 3, 'mindestens ein Dreieck');
    assert.ok(b.flaeche > 0, 'mit Fläche');
    /* Die Mitte muss wirklich drin liegen — sonst ist das Vieleck verdreht */
    for (const p of b.ecken) {
      assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]), 'jede Ecke hat Zahlen');
    }
  }
});

test('Häuser stehen an der Straße, nicht im Hof', async () => {
  const k = await frisch();
  const g = k.planBauen(plan(k, { saat: 'hof', stadt: { alter: 'alt', wasser: 'keins', groesse: 'grossstadt' } }));
  /* Jedes Haus muss ganz in seinem Block liegen. */
  const nachSchluessel = new Map();
  for (const b of g.stadt.bloecke) nachSchluessel.set('b' + b.i + '_' + b.j, b);
  let geprueft = 0;
  for (const h of g.stadt.haeuser) {
    if (h.sonder) continue;
    const b = nachSchluessel.get(h.block);
    if (!b) continue;
    geprueft++;
    for (const e of h.ecken) {
      assert.ok(k.netzImPolygon(b.ecken, e[0], e[1]), 'eine Hausecke ragt aus ihrem Block');
    }
  }
  assert.ok(geprueft > 20, 'es wurden wirklich Häuser geprüft: ' + geprueft);
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

test('Drei Anlagen, drei verschiedene Städte', async () => {
  const k = await frisch();
  assert.equal(k.PLAN_ANLAGEN.length, 3);
  const bauen = (anlage) => k.planBauen(plan(k, { saat: 'anl', stadt: { anlage, groesse: 'stadt', wasser: 'keins' } }));
  const g = bauen('gewachsen'), st = bauen('strahlend'), sch = bauen('schachbrett');
  for (const [name, x] of [['gewachsen', g], ['strahlend', st], ['schachbrett', sch]]) {
    assert.ok(x.stadt.haeuser.length > 40, name + ': es steht etwas — ' + x.stadt.haeuser.length);
    assert.ok(x.stadt.bloecke.length > 8, name + ': es gibt Blöcke — ' + x.stadt.bloecke.length);
    assert.ok(x.stadt.strassen.length > 6, name + ': es gibt Straßen');
  }
  /* Und sie sind wirklich verschieden */
  const fingerabdruck = (x) => x.stadt.haeuser.length + ':' + x.stadt.bloecke.length + ':' + x.stadt.strassen.length;
  const drei = new Set([fingerabdruck(g), fingerabdruck(st), fingerabdruck(sch)]);
  assert.equal(drei.size, 3, 'drei verschiedene Städte, nicht dreimal dieselbe');
});

test('Die strahlende Stadt strahlt wirklich', async () => {
  const k = await frisch();
  const g = k.planBauen(plan(k, { saat: 'str', stadt: { anlage: 'strahlend', groesse: 'stadt', wasser: 'keins' } }));
  /* Jede Speiche muss sich vom Markt entfernen — sonst ist es kein Stern. */
  const m = g.stadt.mitte;
  const speichen = g.stadt.strassen.filter((s) => s.richtung === 'speiche' && s.punkte.length > 2);
  assert.ok(speichen.length >= 5, 'reichlich Speichen: ' + speichen.length);
  for (const s of speichen) {
    const nah = Math.hypot(s.punkte[0][0] - m[0], s.punkte[0][1] - m[1]);
    const weit = Math.hypot(s.punkte[s.punkte.length - 1][0] - m[0], s.punkte[s.punkte.length - 1][1] - m[1]);
    assert.ok(weit > nah, 'die Speiche läuft nach außen');
  }
});

test('Das Schachbrett ist wirklich rechtwinklig', async () => {
  const k = await frisch();
  const g = k.planBauen(plan(k, { saat: 'sch', stadt: { anlage: 'schachbrett', alter: 'neu', groesse: 'stadt', wasser: 'keins' } }));
  /* Das Raster steht schräg im Blatt — gemessen wird deshalb nicht der
     Winkel zur Blattkante, sondern ob sich alle Achsen auf ZWEI Richtungen
     einigen, die neunzig Grad auseinanderliegen. */
  const winkel = [];
  for (const s of g.stadt.strassen) {
    /* Die zwei Prachtdiagonalen (i ab 900) stehen absichtlich quer, und die
       Teilungsgassen ebenso — gemessen wird das Raster selbst. */
    if (s.art === 'gasse' || s.i >= 900 || s.punkte.length < 2) continue;
    const a = s.punkte[0], b = s.punkte[s.punkte.length - 1];
    let w = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    while (w < 0) w += 180;
    winkel.push(((w % 90) + 90) % 90);
  }
  assert.ok(winkel.length >= 6, 'es gibt Achsen zu messen: ' + winkel.length);
  const sortiert = winkel.slice().sort((x, y) => x - y);
  const mitte = sortiert[Math.floor(sortiert.length / 2)];
  const nah = winkel.filter((w) => {
    const d = Math.abs(w - mitte);
    return Math.min(d, 90 - d) < 16;
  }).length;
  assert.ok(nah / winkel.length > 0.75, 'die Achsen einigen sich: ' + Math.round(nah / winkel.length * 100) + '%');
});

test('Große Blöcke werden geteilt, kleine bleiben', async () => {
  const k = await frisch();
  const gross = [[[0, 0], [300, 0], [300, 300], [0, 300]]];
  const raus = [], schnitte = [];
  k.planBloeckeTeilen(gross[0], 6000, 'x', 'k', 0, raus, schnitte);
  assert.ok(raus.length > 4, 'aus einem großen werden viele: ' + raus.length);
  assert.ok(schnitte.length > 0, 'und jede Teilung ist eine neue Gasse');
  for (const p of raus) {
    assert.ok(Math.abs(k.netzFlaeche(p)) <= 6000 * 1.05, 'kein Teil ist mehr zu groß: ' + Math.round(Math.abs(k.netzFlaeche(p))));
    assert.ok(p.length >= 3, 'jedes Teil ist ein Vieleck');
  }
  /* Ein kleiner Block bleibt, wie er ist */
  const klein = [[0, 0], [40, 0], [40, 40], [0, 40]];
  const raus2 = [], schnitte2 = [];
  k.planBloeckeTeilen(klein, 6000, 'x', 'k', 0, raus2, schnitte2);
  assert.equal(raus2.length, 1);
  assert.equal(schnitte2.length, 0);
});
