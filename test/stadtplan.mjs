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
  for (const b of g.stadt.bloecke) nachSchluessel.set(b.schluessel, b);
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
  /* Eine feste Millisekundenzahl misst die Maschine, nicht den Bau. In einer
     parallel laufenden Prüfreihe ist sie deshalb wertlos: derselbe Rechner ist
     mal frei und mal voll, und der Test war mal grün und mal rot.

     Gemessen wird stattdessen das VERHÄLTNIS zu einem kleinen Plan im selben
     Lauf. Das sagt, worum es wirklich geht: ob der Bau mit der Größe aus dem
     Ruder läuft. Fünfundvierzigmal so viele Häuser kosten etwa siebzehnmal so
     viel Zeit — der Bau skaliert also besser als linear. Wird daraus je ein
     quadratisches Verhalten, schlägt das hier an, egal wie schnell die
     Maschine gerade ist. */
  const messe = (was) => { let t = Infinity; for (let i = 0; i < 2; i++) { const s = Date.now(); k.planBauen(was); t = Math.min(t, Date.now() - s); } return t; };
  const klein = plan(k, { stadt: { groesse: 'dorf', alter: 'jung', wasser: 'keins', dichte: 1 } });
  const tk = Math.max(1, messe(klein));
  const tg = messe(p);
  const g = k.planBauen(p);
  const gk = k.planBauen(klein);
  const haeuserMehr = g.stadt.haeuser.length / Math.max(1, gk.stadt.haeuser.length);
  assert.ok(tg < tk * 40, 'der Bau läuft nicht aus dem Ruder: ' + (tg / tk).toFixed(1) + '× die Zeit für ' + haeuserMehr.toFixed(1) + '× die Häuser');
  /* Und ein grober Deckel, der eine Endlosschleife trotzdem fängt. */
  assert.ok(tg < 4000, 'und bleibt in jedem Fall im Rahmen: ' + tg + ' ms');
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
  const g = k.planBauen(plan(k, { saat: 'sch', stadt: { anlage: 'schachbrett', alter: 'neu', groesse: 'metropole', wasser: 'keins' } }));
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

/* --- Was in dieser Runde kaputt war und nicht wieder kaputtgehen darf --- */

test('Die Blöcke liegen nebeneinander, nicht übereinander', async () => {
  const k = await frisch();
  /* Die Flächensuche verwarf früher nur die GRÖSSTE Runde als Außenwelt.
     Hing irgendwo ein Straßenzug frei in der Landschaft, hatte auch der seine
     eigene Außenrunde — und die legte sich als Riesenblock über alles, was
     darin lag. Beim Marktflecken kamen so 189 Blöcke mit einer Million
     Flächeneinheiten auf einer Stadt von 155 000 zusammen. */
  for (const groesse of ['flecken', 'stadt', 'grossstadt', 'metropole']) {
    for (const anlage of ['gewachsen', 'strahlend', 'schachbrett']) {
      const g = k.planBauen(plan(k, { saat: 'uebereinander', stadt: { groesse, anlage, alter: 'alt', wasser: 'fluss', mauer: true } }));
      const st = g.stadt;
      const summe = st.bloecke.reduce((s, b) => s + Math.abs(k.netzFlaeche(b.ecken)), 0);
      const kreis = Math.PI * st.Rmax * st.Rmax;
      assert.ok(summe < kreis * 1.1,
        groesse + '/' + anlage + ': die Blöcke belegen ' + (summe / kreis).toFixed(2) + '× die Stadtfläche');
    }
  }
});

test('Jeder Block hat seinen eigenen Schlüssel', async () => {
  const k = await frisch();
  /* Der Schlüssel war die gerundete Mitte. Bei zweihundertfünfzig Blöcken
     fallen zwei auf dieselbe — und dann gehört ein Haus zum falschen Block. */
  const g = k.planBauen(plan(k, { saat: 'schluessel', stadt: { groesse: 'metropole', anlage: 'gewachsen', alter: 'alt', wasser: 'keins', mauer: true } }));
  const gesehen = new Set();
  for (const b of g.stadt.bloecke) {
    assert.ok(b.schluessel, 'jeder Block hat einen Schlüssel');
    assert.ok(!gesehen.has(b.schluessel), 'kein Schlüssel doppelt: ' + b.schluessel);
    gesehen.add(b.schluessel);
  }
  assert.ok(gesehen.size > 100, 'es waren wirklich viele Blöcke: ' + gesehen.size);
});

test('Der Zufall streut auch in einer durchnummerierten Reihe', async () => {
  const k = await frisch();
  /* FNV allein ließ das letzte Zeichen fast nur die unteren Bits erreichen,
     planZufall liest aber die oberen: 'ww0', 'ww1', 'ww2' ergaben
     0.382, 0.379, 0.390 — praktisch derselbe Wert. Damit war jede Reihe auf
     der Karte gleichgeschaltet statt gestreut. */
  for (const stamm of ['ww', 'feld', 'x']) {
    const reihe = [];
    for (let i = 0; i < 40; i++) reihe.push(k.planZufall('saat', stamm + i));
    const faecher = new Array(10).fill(0);
    reihe.forEach((r) => faecher[Math.min(9, Math.floor(r * 10))]++);
    const belegt = faecher.filter((f) => f > 0).length;
    assert.ok(belegt >= 7, stamm + ': vierzig Werte füllen mindestens sieben Zehntel, nicht ' + belegt);
    const spanne = Math.max(...reihe) - Math.min(...reihe);
    assert.ok(spanne > 0.85, stamm + ': die Spanne ist ' + spanne.toFixed(2));
  }
  /* Und trotzdem: derselbe Schlüssel gibt immer denselben Wert. */
  assert.equal(k.planZufall('a', 'b'), k.planZufall('a', 'b'));
});

test('Die Uferstriche bleiben am Ufer', async () => {
  const k = await frisch();
  /* Die Richtung „nach außen“ wurde früher aus dem übernächsten Nachbarn
     bestimmt. An einer scharfen Ecke ist diese Differenz beinahe null, die
     Normale kippt ins Beliebige, und der Strich schießt davon — gemessen
     rund 140 Einheiten weiter, als er dürfte. Jeder Punkt eines Strichs muss
     nahe an SEINEM Ufer bleiben. */
  const HOECHSTABSTAND = 136;   /* die zwölfte Stufe (128,1) plus Zittern (4,1) */
  for (const wasser of ['fluss', 'kueste', 'see', 'muendung']) {
    const doc = k.saubererPlan({ saat: 'ufer-' + wasser, stadt: { groesse: 'stadt', wasser } });
    const linie = k.planWasser(doc).polygone[0];
    for (const richtung of [1, -1]) {
      for (const stufe of [1, 6, 12]) {
        for (const stueck of k.planUferlinien(linie, stufe, richtung)) {
          for (const p of stueck) {
            let nah = Infinity;
            for (const q of linie) nah = Math.min(nah, k.strecke(p, q));
            assert.ok(nah <= HOECHSTABSTAND,
              wasser + '/Stufe ' + stufe + ': ein Strich liegt ' + Math.round(nah) + ' vom Ufer entfernt');
          }
        }
      }
    }
  }

  /* Und an einer echten Kehre bricht der Strich ab, statt zu schleudern. */
  /* Hin bis 700 und auf fast derselben Linie zurück: am Wendepunkt zeigen
     Vorgänger und Nachfolger genau aufeinander. */
  const kehre = [[100, 600], [400, 600], [700, 600], [400, 601], [100, 601]];
  const normalen = k.planUferNormalen(kehre);
  assert.ok(normalen.some((n) => n === null), 'die Kehre wird erkannt');
  assert.ok(normalen.filter((n) => n === null).length < kehre.length - 2, 'aber nicht die ganze Linie verworfen');
});

/* --- Der Hafen, das Wappen, die Legende, der Rundgang --- */

test('Molen greifen ins Wasser, nicht ins Land', async () => {
  const k = await frisch();
  /* Eine Mole, die auf halber Strecke an Land endet, ist keine Mole. */
  for (const wasser of ['fluss', 'kueste', 'see', 'muendung']) {
    const doc = k.saubererPlan({ saat: 'hafen-' + wasser, stadt: { groesse: 'grossstadt', wasser, mauer: true } });
    const g = k.planBauen(doc);
    if (!g.hafen.hat) continue;
    for (const m of g.hafen.molen) {
      assert.ok(g.wasser.drin(m.kopf[0], m.kopf[1]), wasser + ': der Molenkopf steht auf dem Trockenen');
      assert.ok(k.strecke(m.wurzel, m.kopf) >= 20, wasser + ': die Mole ist ein Stummel');
    }
    for (const s of g.hafen.schiffe) {
      assert.ok(g.wasser.drin(s.punkt[0], s.punkt[1]), wasser + ': ein Schiff liegt an Land');
    }
    /* Ein Leuchtfeuer weist den Weg von See herein — am Binnenfluss und am
       See steht keins. */
    if (wasser === 'fluss' || wasser === 'see') {
      assert.ok(!g.hafen.leuchtturm, wasser + ': hier gehoert kein Leuchtfeuer hin');
    }
  }
  /* Ohne Wasser kein Hafen, und ohne Haken auch nicht. */
  assert.ok(!k.planBauen(k.saubererPlan({ saat: 'trocken', stadt: { wasser: 'keins' } })).hafen.hat);
  assert.ok(!k.planBauen(k.saubererPlan({ saat: 'ohne', stadt: { wasser: 'kueste', hafen: false } })).hafen.hat);
});

test('Die Muehle steht trocken, ihr Rad im Wasser', async () => {
  const k = await frisch();
  for (const wasser of ['fluss', 'muendung']) {
    const doc = k.saubererPlan({ saat: 'muehle-' + wasser, stadt: { groesse: 'stadt', wasser } });
    const g = k.planBauen(doc);
    if (!g.muehle) continue;
    assert.ok(!g.wasser.drin(g.muehle.punkt[0], g.muehle.punkt[1]), 'das Muehlenhaus steht im Fluss');
    assert.ok(g.wasser.drin(g.muehle.rad[0], g.muehle.rad[1]), 'das Rad haengt in der Luft');
  }
  /* Am Meer und am See gibt es keine Wassermuehle. */
  for (const wasser of ['kueste', 'see', 'keins']) {
    assert.equal(k.planBauen(k.saubererPlan({ saat: 'm', stadt: { wasser } })).muehle, null, wasser + ': hier mahlt nichts');
  }
});

test('Die Mauer umschliesst die Stadt und bleibt am Ufer', async () => {
  const k = await frisch();
  /* Zwei Fehler auf einmal: erst lag der aeusserste Ring der strahlenden
     Anlage INNERHALB der Bebauung — im Dorf standen zweiundachtzig Prozent
     der Haeuser draussen. Dann trieb das Einschliessen den Kranz so weit
     hinaus, dass die Mauer in grossem Bogen durchs offene Meer lief. */
  for (const anlage of ['gewachsen', 'strahlend', 'schachbrett']) {
    for (const groesse of ['weiler', 'dorf', 'stadt', 'metropole']) {
      for (const wasser of ['kueste', 'see', 'keins']) {
        const doc = k.saubererPlan({ saat: 'mauer', stadt: { groesse, anlage, wasser, mauer: true, umland: true } });
        const g = k.planBauen(doc);
        const M = g.stadt.mauer;
        const wo = anlage + '/' + groesse + '/' + wasser;
        assert.ok(M, wo + ': gar keine Mauer');

        /* Kein Stueck im Wasser. (Ein Fluss quer durch die Stadt ist die
           Ausnahme — den muss die Mauer queren, und darum steht er hier
           nicht in der Liste.) */
        const nass = M.punkte.filter((p) => g.wasser.drin(p[0], p[1])).length;
        assert.equal(nass, 0, wo + ': ' + nass + ' Mauerpunkte liegen im Wasser');

        /* Der Kern liegt drinnen. */
        const vorstadt = new Set(g.stadt.bloecke.filter((b) => b.vorstadt).map((b) => b.schluessel));
        const kern = g.stadt.haeuser.filter((h) => !vorstadt.has(h.block));
        if (kern.length > 20) {
          const drin = kern.filter((h) => h.ecken.every((p) => k.netzImPolygon(M.punkte, p[0], p[1]))).length / kern.length;
          assert.ok(drin > 0.94, wo + ': nur ' + Math.round(drin * 100) + '% des Kerns liegen in der Mauer');
        }
        /* Und eine uebersichtliche Zahl Tore. */
        assert.ok(M.tore.length >= 1 && M.tore.length <= 9, wo + ': ' + M.tore.length + ' Tore');
      }
    }
  }
});

test('Ohne Haken keine Mauer, kein Hafen, keine Werder', async () => {
  const k = await frisch();
  const g = k.planBauen(k.saubererPlan({
    saat: 'nackt',
    stadt: { groesse: 'stadt', wasser: 'kueste', mauer: false, burg: false, umland: false, hafen: false, muehle: false, inseln: false }
  }));
  assert.equal(g.stadt.mauer, null);
  assert.equal(g.stadt.burg, null);
  assert.equal(g.hafen.hat, false);
  assert.equal(g.muehle, null);
  /* Nicht deepEqual: der Sandkasten legt seine Felder in einem eigenen
     Bereich an, und dann sind zwei leere Listen zwar gleich aufgebaut, aber
     nicht dasselbe Array. */
  assert.equal(g.inseln.length, 0);
  assert.equal(g.umland.felder.length, 0);
});

test('Das Wappen folgt der heraldischen Farbregel', async () => {
  const k = await frisch();
  /* Farbe auf Metall oder Metall auf Farbe — und ueber einer Teilung muss
     sich die Figur von BEIDEN Haelften abheben. "Schraeggeteilt von Schwarz
     und Gold, darin drei Anker in Gold" war auf der goldenen Haelfte
     unsichtbar. */
  const metalle = ['gold', 'silber'];
  for (let i = 0; i < 80; i++) {
    const w = k.planBauen(k.saubererPlan({ saat: 'w' + i, stadt: { wasser: i % 2 ? 'fluss' : 'kueste' } })).wappen;
    assert.notEqual(w.figur, w.grund, 'Figur wie Grund: ' + k.planBlason(w));
    assert.notEqual(w.figur, w.zweit, 'Figur wie zweites Feld: ' + k.planBlason(w));
    const grundMetall = metalle.includes(w.grund);
    assert.notEqual(grundMetall, metalle.includes(w.figur), 'Farbe auf Farbe: ' + k.planBlason(w));
    assert.ok(w.wieViele >= 1 && w.wieViele <= 3);
  }
});

test('Die Blasonierung geht im Deutschen auf', async () => {
  const k = await frisch();
  /* "belegt mit" verlangt den Wemfall — und der sieht bei "ein Turm",
     "eine Bruecke" und "drei Anker" jedes Mal anders aus. Zusammengeklebt
     kam "belegt mit eine Bruecke" heraus. */
  assert.equal(k.planBildWerfall('bruecke', 1), 'eine Brücke');
  assert.equal(k.planBildWemfall('bruecke', 1), 'einer Brücke');
  assert.equal(k.planBildWerfall('turm', 1), 'ein Turm');
  assert.equal(k.planBildWemfall('turm', 1), 'einem Turm');
  assert.equal(k.planBildWerfall('eichenblatt', 1), 'ein Eichenblatt');
  assert.equal(k.planBildWemfall('eichenblatt', 1), 'einem Eichenblatt');
  assert.equal(k.planBildWerfall('anker', 3), 'drei Anker');
  assert.equal(k.planBildWemfall('anker', 3), 'drei Ankern');
  assert.equal(k.planBildWemfall('bruecke', 2), 'zwei Brücken');   /* endet schon auf -n */
  assert.equal(k.planBildWemfall('schluessel', 2), 'zwei Schlüsseln');

  /* Und in ganzen Saetzen: kein falscher Fall, kein doppelter Punkt. */
  for (let i = 0; i < 120; i++) {
    const satz = k.planBlason(k.planBauen(k.saubererPlan({ saat: 'b' + i })).wappen);
    assert.ok(/^[A-ZÄÖÜ]/.test(satz), 'beginnt gross: ' + satz);
    assert.ok(satz.endsWith('.') && !satz.endsWith('..'), 'endet mit genau einem Punkt: ' + satz);
    assert.ok(!/ mit eine /.test(satz), 'falscher Fall: ' + satz);
    assert.ok(!/ mit ein [A-ZÄÖÜ]/.test(satz), 'falscher Fall: ' + satz);
    assert.ok(!/\s\s/.test(satz), 'doppelte Leerzeichen: ' + satz);
  }
});

test('Die Legende erklaert nur, was auch da ist', async () => {
  const k = await frisch();
  /* Eine Legende, die Dinge erklaert, die es nicht gibt, ist eine Luege auf
     Papier. */
  const trocken = k.planBauen(k.saubererPlan({ saat: 'leg1', stadt: { groesse: 'stadt', wasser: 'keins', mauer: false, umland: false } }));
  const worte = trocken.legende.map((e) => e.zeichen);
  assert.ok(!worte.includes('wasser'), 'kein Wasser, kein Wasserzeichen');
  assert.ok(!worte.includes('hafen'), 'kein Hafen ohne Wasser');
  assert.ok(!worte.includes('mauer'), 'keine Mauer, kein Mauerzeichen');
  assert.ok(!worte.includes('acker') && !worte.includes('wald'), 'kein Umland, keine Felder');
  assert.ok(worte.includes('haus'), 'Haeuser gibt es immer');

  const voll = k.planBauen(k.saubererPlan({ saat: 'leg2', stadt: { groesse: 'grossstadt', wasser: 'kueste', mauer: true, burg: true, umland: true } }));
  const w2 = voll.legende.map((e) => e.zeichen);
  for (const muss of ['haus', 'mauer', 'tor', 'wasser', 'hafen', 'burg']) {
    assert.ok(w2.includes(muss), 'die Legende vergisst: ' + muss);
  }
  /* Jeder Eintrag hat einen deutschen Text und kommt nur einmal vor. */
  const gesehen = new Set();
  for (const e of voll.legende) {
    assert.ok(e.text && e.text.length > 2, 'jeder Eintrag hat einen Text');
    assert.ok(/^[A-ZÄÖÜ]/.test(e.text), 'und der beginnt gross: ' + e.text);
    assert.ok(!gesehen.has(e.zeichen), 'kein Zeichen doppelt: ' + e.zeichen);
    gesehen.add(e.zeichen);
  }
});

test('Der Rundgang kreuzt sich nicht selbst', async () => {
  const k = await frisch();
  /* Ein Rundgang, der sich kreuzt, sieht nach Irrweg aus. */
  for (const wieViele of [2, 3, 8, 25]) {
    const marken = [];
    for (let i = 0; i < wieViele; i++) {
      marken.push({ id: 'm' + i, x: k.planZufall('rg', 'x' + i) * 1100 + 50, y: k.planZufall('rg', 'y' + i) * 1100 + 50 });
    }
    const r = k.planRundgang({ saat: 'rg' }, marken);
    assert.equal(r.marken.length, wieViele, 'jede Marke kommt genau einmal vor');
    assert.equal(new Set(r.marken.map((m) => m.id)).size, wieViele, 'und keine doppelt');
    assert.equal(r.punkte.length, wieViele + 1, 'der Weg ist geschlossen');

    const P = r.punkte;
    let kreuz = 0;
    for (let i = 0; i < P.length - 1; i++) {
      for (let j = i + 2; j < P.length - 1; j++) {
        if (i === 0 && j === P.length - 2) continue;
        if (k.netzSchneidet(P[i], P[i + 1], P[j], P[j + 1])) kreuz++;
      }
    }
    assert.equal(kreuz, 0, wieViele + ' Marken: der Weg kreuzt sich ' + kreuz + '-mal');
  }
  /* Zu wenige Marken: kein Weg, aber auch kein Absturz. */
  assert.equal(k.planRundgang({ saat: 'x' }, []).punkte.length, 0);
  assert.equal(k.planRundgang({ saat: 'x' }, [{ id: 'a', x: 1, y: 1 }]).punkte.length, 0);
});

test('Keine Groesse, kein Gewaesser und keine Anlage stuerzt ab', async () => {
  const k = await frisch();
  /* Bricht eine Speiche schon am innersten Ring ab, weil dort Wasser
     liegt, war `spur` leer — und die naechste Zeile griff auf ein Nichts zu.
     Die ganze Karte stuerzte ab. Gefunden hat das erst ein Rundumlauf. */
  let gebaut = 0;
  for (const anlage of k.PLAN_ANLAGEN.map((a) => a[0])) {
    for (const groesse of k.PLAN_GROESSEN.map((g) => g[0])) {
      for (const wasser of k.PLAN_WASSER.map((w) => w[0])) {
        const doc = k.saubererPlan({ saat: 'rundum', stadt: { groesse, anlage, wasser, mauer: true, burg: true, umland: true } });
        const g = k.planBauen(doc);
        const wo = anlage + '/' + groesse + '/' + wasser;
        assert.ok(g.stadt.haeuser.length >= 5, wo + ': nur ' + g.stadt.haeuser.length + ' Haeuser — das Blatt bleibt leer');
        for (const h of g.stadt.haeuser) {
          for (const p of h.ecken) {
            assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]), wo + ': ein Haus ohne Zahlen');
          }
        }
        gebaut++;
      }
    }
  }
  assert.ok(gebaut >= 90, 'es wurden wirklich viele Staedte gebaut: ' + gebaut);
  /* Und keine davon bleibt leer — ein Blatt mit einer Legende und ohne
     Stadt ist kein Stadtplan. */
});

/* --- Planquadrate, Wegweiser, Landstraßen --- */

test('Die Planquadrate decken das Blatt und nur das Blatt', async () => {
  const k = await frisch();
  /* Acht mal acht Felder, A1 oben links, H8 unten rechts — und daneben
     nichts. Ein Verzeichnis, das auf ein Feld verweist, das es nicht
     gibt, schickt einen ins Leere. */
  assert.equal(k.planFeldVon(k.PLAN_FELD_RAND + 1, k.PLAN_FELD_RAND + 1), 'A1');
  assert.equal(k.planFeldVon(k.PLAN_GROESSE - k.PLAN_FELD_RAND - 1, k.PLAN_GROESSE - k.PLAN_FELD_RAND - 1), 'H8');
  assert.equal(k.planFeldVon(k.PLAN_GROESSE / 2, k.PLAN_GROESSE / 2), 'E5');
  assert.equal(k.planFeldVon(k.PLAN_FELD_RAND - 2, 600), '', 'links daneben');
  assert.equal(k.planFeldVon(600, k.PLAN_GROESSE - k.PLAN_FELD_RAND + 2), '', 'unten daneben');

  /* Jedes Feld kommt genau einmal vor. */
  const gesehen = new Set();
  const g = k.planFeldGroesse();
  for (let sy = 0; sy < k.PLAN_FELDER; sy++) {
    for (let sx = 0; sx < k.PLAN_FELDER; sx++) {
      const f = k.planFeldVon(k.PLAN_FELD_RAND + (sx + 0.5) * g, k.PLAN_FELD_RAND + (sy + 0.5) * g);
      assert.ok(f, 'jedes Feld hat einen Namen');
      assert.ok(!gesehen.has(f), 'kein Feld doppelt: ' + f);
      gesehen.add(f);
    }
  }
  assert.equal(gesehen.size, 64);

  /* Eine Straße nennt ihre Felder, aber nicht endlos viele. */
  const quer = [];
  for (let i = 0; i <= 20; i++) quer.push([60 + i * 54, 600]);
  const text = k.planFundstelle(quer);
  assert.ok(/^[A-H]\d–[A-H]\d$/.test(text), 'eine lange Straße wird zusammengefasst: ' + text);
  assert.equal(k.planFundstelle([[600, 600], [610, 610]]), 'E5');
  assert.equal(k.planFundstelle([]), '');
});

test('Die Wegweiser stehen am Rand und sagen, wohin', async () => {
  const k = await frisch();
  for (const anlage of ['gewachsen', 'strahlend', 'schachbrett']) {
    const doc = k.saubererPlan({ saat: 'wegweiser', stadt: { groesse: 'grossstadt', anlage, wasser: 'kueste', mauer: true, umland: true } });
    const g = k.planBauen(doc);
    assert.ok(g.nachbarn.length >= 1, anlage + ': kein einziger Wegweiser');
    assert.ok(g.nachbarn.length <= 8, anlage + ': zu viele Wegweiser');
    for (const n of g.nachbarn) {
      assert.ok(n.name && /^[A-ZÄÖÜ]/.test(n.name), 'der Ort hat einen deutschen Namen: ' + n.name);
      assert.ok(n.stunden >= 1 && n.stunden <= 12, 'eine Gehzeit, die man gehen kann: ' + n.stunden);
      assert.ok(k.PLAN_HIMMEL.includes(n.himmel), 'eine Himmelsrichtung: ' + n.himmel);
      assert.ok(!g.wasser.drin(n.punkt[0], n.punkt[1]), 'kein Wegweiser im Wasser');
    }
    /* Dieselbe Saat, dieselben Nachbarn. */
    const nochmal = k.planBauen(k.saubererPlan({ saat: 'wegweiser', stadt: { groesse: 'grossstadt', anlage, wasser: 'kueste', mauer: true, umland: true } }));
    assert.deepEqual(nochmal.nachbarn.map((n) => n.name), g.nachbarn.map((n) => n.name), anlage + ': dieselbe Saat, andere Nachbarn');
  }
  /* Oben ist Norden — in SVG zeigt y nach unten, das geht leicht schief. */
  assert.equal(k.planHimmelsrichtung(-Math.PI / 2), 'Norden');
  assert.equal(k.planHimmelsrichtung(Math.PI / 2), 'Süden');
  assert.equal(k.planHimmelsrichtung(0), 'Osten');
  assert.equal(k.planHimmelsrichtung(Math.PI), 'Westen');
});

test('Die Landstraßen laufen vom Blatt, aber nicht ins Wasser', async () => {
  const k = await frisch();
  const G = k.PLAN_GROESSE;
  for (const wasser of ['keins', 'fluss', 'kueste']) {
    const doc = k.saubererPlan({ saat: 'land', stadt: { groesse: 'stadt', wasser, mauer: true, umland: true } });
    const g = k.planBauen(doc);
    const land = g.stadt.strassen.filter((s) => s.art === 'land');
    assert.ok(land.length >= 1, wasser + ': keine einzige Landstraße');
    for (const l of land) {
      assert.ok(l.punkte.length >= 3, 'eine Landstraße ist mehr als ein Strich');
      for (const p of l.punkte) {
        assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]), 'Zahlen');
        assert.ok(!g.wasser.drin(p[0], p[1]), wasser + ': eine Landstraße läuft ins Wasser');
        assert.ok(p[0] > -20 && p[0] < G + 20 && p[1] > -20 && p[1] < G + 20, 'und nicht weit neben das Blatt');
      }
    }
  }
  /* Ohne Umland keine Landstraßen — dann endet die Welt an der Mauer. */
  const ohne = k.planBauen(k.saubererPlan({ saat: 'land', stadt: { groesse: 'stadt', wasser: 'keins', umland: false } }));
  assert.equal(ohne.stadt.strassen.filter((s) => s.art === 'land').length, 0);
});

test('Kein Haus steht neben dem Papier', async () => {
  const k = await frisch();
  /* Bei der strahlenden Anlage können Ringknoten über den Blattrand
     rutschen. Der Zuschnitt schneidet das weg — gerechnet und gespeichert
     wurde es trotzdem: Häuser bei x = −59. */
  const G = k.PLAN_GROESSE;
  let geprueft = 0;
  for (const anlage of ['gewachsen', 'strahlend', 'schachbrett']) {
    for (const groesse of ['stadt', 'metropole']) {
      const g = k.planBauen(k.saubererPlan({ saat: 'rand', stadt: { groesse, anlage, wasser: 'keins', mauer: true, umland: true } }));
      for (const h of g.stadt.haeuser) {
        for (const p of h.ecken) {
          assert.ok(p[0] >= 0 && p[0] <= G && p[1] >= 0 && p[1] <= G,
            anlage + '/' + groesse + ': ein Haus steht bei ' + Math.round(p[0]) + ',' + Math.round(p[1]));
        }
        geprueft++;
      }
    }
  }
  assert.ok(geprueft > 500, 'es wurden wirklich viele Häuser geprüft: ' + geprueft);
});
