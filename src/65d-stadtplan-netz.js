/* ===================== 65d — DAS STRASSENNETZ =====================
   Eine Stadt ist kein Rad. Sie ist ein Netz, das gewachsen ist: von einem
   Platz gehen Straßen fort, sie biegen sich, verzweigen sich, treffen
   einander wieder. Was zwischen ihnen eingeschlossen bleibt, ist ein Block —
   und ein Block ist selten viereckig.

   Vorher war die Stadt ein Polarraster: Speichen mal Ringe. Das sieht auch
   mit viel Unruhe immer noch aus wie ein Spinnennetz, weil es eines IST.

   Hier wächst das Netz stattdessen wirklich:

   1. WACHSEN — Ausfallstraßen gehen vom Markt fort, Schritt für Schritt,
      jeder mit einer eigenen kleinen Wendung. Unterwegs zweigen Gassen ab.
   2. VERKNÜPFEN — Querverbindungen schließen benachbarte Straßen zu
      Schleifen. Erst dadurch entstehen überhaupt Blöcke.
   3. VERSCHMELZEN — was dicht beieinander liegt, wird derselbe Punkt.
   4. FLÄCHEN FINDEN — das Netz ist jetzt ein ebener Graph. Seine Facetten
      sind die Blöcke. Gefunden werden sie, indem man an jedem Punkt immer
      die nächste Kante im Uhrzeigersinn nimmt; läuft man so im Kreis, hat
      man eine Fläche umrundet.
   5. BEBAUEN — Häuser stellen sich an die Straße, nicht in die Mitte. Der
      Innenhof bleibt frei. Genau so ist jede Altstadt gebaut.

   Alles gerechnet, nichts gewürfelt. */

const NETZ_RASTER = 15;          /* Punkte darunter gelten als derselbe */

/* ----- Kleine Geometrie ----- */
function netzWinkel(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]); }
function netzFlaeche(poly) {
  let f = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    f += a[0] * b[1] - b[0] * a[1];
  }
  return f / 2;
}
function netzMitte(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return [x / poly.length, y / poly.length];
}
function netzImPolygon(poly, x, y) {
  let drin = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) drin = !drin;
  }
  return drin;
}
/* Ein Punkt im Polygon, gerechnet statt geraten — für Bäume und Gräber. */
function netzPunktDrin(poly, saat, k) {
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (const p of poly) {
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  for (let i = 0; i < 24; i++) {
    const x = minX + planZufall(saat, k + 'x' + i) * (maxX - minX);
    const y = minY + planZufall(saat, k + 'y' + i) * (maxY - minY);
    if (netzImPolygon(poly, x, y)) return [x, y];
  }
  return netzMitte(poly);
}

/* ===================== DER GRAPH ===================== */
function netzBauen() {
  const knoten = [];
  const kanten = [];
  const raster = new Map();

  const schluessel = (x, y) => Math.round(x / NETZ_RASTER) + ':' + Math.round(y / NETZ_RASTER);
  const punkt = (x, y) => {
    /* Erst im eigenen Rasterfeld und den acht daneben nachsehen — sonst
       liegen zwei Kreuzungen zwei Pixel nebeneinander und der Block dazwischen
       wird ein Splitter. */
    const rx = Math.round(x / NETZ_RASTER), ry = Math.round(y / NETZ_RASTER);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const treffer = raster.get((rx + dx) + ':' + (ry + dy));
        if (treffer == null) continue;
        const k = knoten[treffer];
        if ((k.x - x) ** 2 + (k.y - y) ** 2 < NETZ_RASTER * NETZ_RASTER) return treffer;
      }
    }
    const id = knoten.length;
    knoten.push({ id, x, y, aus: [] });
    raster.set(schluessel(x, y), id);
    return id;
  };
  const kante = (a, b, art) => {
    if (a === b) return -1;
    for (const ki of knoten[a].aus) {
      const k = kanten[ki];
      if ((k.a === a && k.b === b) || (k.a === b && k.b === a)) return ki;
    }
    const id = kanten.length;
    kanten.push({ id, a, b, art: art || 'gasse' });
    knoten[a].aus.push(id);
    knoten[b].aus.push(id);
    return id;
  };
  return { knoten, kanten, punkt, kante };
}

/* ===================== DIE FLÄCHEN =====================
   Der ebene Graph wird umrundet: von jeder gerichteten Kante aus nimmt man
   am Zielpunkt immer die nächste Kante im Uhrzeigersinn. Läuft man so
   weiter, kommt man um genau eine Fläche herum. Die größte davon ist die
   Außenwelt — die fällt weg. */
function netzFlaechen(netz) {
  const { knoten, kanten } = netz;
  /* An jedem Punkt die abgehenden Kanten nach Winkel sortieren. */
  const sortiert = knoten.map((k) => {
    const liste = k.aus.map((ki) => {
      const kk = kanten[ki];
      const ziel = kk.a === k.id ? kk.b : kk.a;
      return { ki, ziel, w: netzWinkel([k.x, k.y], [knoten[ziel].x, knoten[ziel].y]) };
    });
    liste.sort((a, b) => a.w - b.w);
    return liste;
  });

  const besucht = new Set();
  const flaechen = [];
  for (const start of kanten) {
    for (const richtung of [[start.a, start.b], [start.b, start.a]]) {
      const marke0 = richtung[0] + '>' + richtung[1];
      if (besucht.has(marke0)) continue;
      const runde = [];
      let von = richtung[0], nach = richtung[1];
      let sicher = 0;
      while (sicher++ < 400) {
        besucht.add(von + '>' + nach);
        runde.push(von);
        /* Am Zielpunkt: die Kante suchen, die zurückführt, und die davor
           im Uhrzeigersinn nehmen. */
        const liste = sortiert[nach];
        const zurueckW = netzWinkel([knoten[nach].x, knoten[nach].y], [knoten[von].x, knoten[von].y]);
        let beste = null, besterAbstand = 1e9;
        for (const e of liste) {
          let d = zurueckW - e.w;
          while (d <= 0) d += Math.PI * 2;
          while (d > Math.PI * 2) d -= Math.PI * 2;
          if (d < besterAbstand) { besterAbstand = d; beste = e; }
        }
        if (!beste) break;
        von = nach;
        nach = beste.ziel;
        if (von === richtung[0] && nach === richtung[1]) break;
      }
      if (runde.length >= 3) flaechen.push(runde.map((i) => [knoten[i].x, knoten[i].y]));
    }
  }
  /* Die Außenwelt hat die größte Fläche und läuft andersherum. */
  let groesste = 0, weg = -1;
  flaechen.forEach((f, i) => {
    const a = Math.abs(netzFlaeche(f));
    if (a > groesste) { groesste = a; weg = i; }
  });
  return flaechen.filter((f, i) => i !== weg && Math.abs(netzFlaeche(f)) > 260);
}

/* ===================== DAS WACHSTUM ===================== */
function planNetzWachsen(plan, wasser, mitte, Rmax, krumm) {
  const saat = plan.saat;
  const netz = netzBauen();
  const wege = [];         /* die Straßen als Linienzüge, zum Zeichnen und Beschriften */
  const bruecken = [];     /* wo eine Straße das Wasser quert */
  const [mx, my] = mitte;
  const [, , speichen] = planGroesse(plan.stadt.groesse);
  const schritt = 46 + planZufall(saat, 'sl') * 14;

  /* --- Der Markt in der Mitte: ein kleines Vieleck, kein Punkt --- */
  const marktR = Rmax * 0.085;
  const marktEcken = [];
  const marktKnoten = [];
  const marktSeiten = 5 + (planHash(saat, 'ms') % 3);
  for (let i = 0; i < marktSeiten; i++) {
    const w = (i / marktSeiten) * Math.PI * 2 + planZufall(saat, 'mw') * 1.4;
    const r = marktR * (1 + planStreu(saat, 'mr' + i) * 0.22);
    const p = [mx + Math.cos(w) * r, my + Math.sin(w) * r * 0.9];
    marktEcken.push(p);
    marktKnoten.push(netz.punkt(p[0], p[1]));
  }
  for (let i = 0; i < marktKnoten.length; i++) {
    netz.kante(marktKnoten[i], marktKnoten[(i + 1) % marktKnoten.length], 'platz');
  }

  /* --- Die Ausfallstraßen wachsen --- */
  const adern = [];
  for (let i = 0; i < speichen; i++) {
    const start = marktKnoten[i % marktKnoten.length];
    let w = (i / speichen) * Math.PI * 2 + planStreu(saat, 'aw' + i) * 0.22;
    let x = netz.knoten[start].x, y = netz.knoten[start].y;
    let vorher = start;
    const spur = [[x, y]];
    const haupt = i % 2 === 0 || speichen < 9;
    const weit = Rmax * (haupt ? 1.0 : 0.62 + planZufall(saat, 'al' + i) * 0.3);
    let gelaufen = 0, schritte = 0;
    while (gelaufen < weit && schritte++ < 40) {
      /* Die Wendung: eine Straße geht nie ganz gerade, aber auch nicht wild. */
      w += planStreu(saat, 'ab' + i + '_' + schritte) * 0.30 * krumm;
      const s = schritt * (0.8 + planZufall(saat, 'as' + i + '_' + schritte) * 0.5);
      x += Math.cos(w) * s;
      y += Math.sin(w) * s * 0.92;
      if (wasser.drin(x, y)) {
        /* Wasser vor uns. Ist es schmal, wird hier eine Bruecke gebaut und
           es geht drueben weiter — sonst hoert die Strasse am Ufer auf.
           Vorher brach jede Strasse ab, und eine Stadt am Fluss hatte
           deshalb keine einzige Bruecke. */
        let ueber = null;
        for (let sprung = 1; sprung <= 4; sprung++) {
          const px = x + Math.cos(w) * s * sprung, py = y + Math.sin(w) * s * sprung * 0.92;
          if (!wasser.drin(px, py)) { ueber = [px, py]; break; }
        }
        if (!ueber || !haupt) break;
        if (ueber[0] < 70 || ueber[0] > PLAN_GROESSE - 70 || ueber[1] < 70 || ueber[1] > PLAN_GROESSE - 70) break;
        const drueben = netz.punkt(ueber[0], ueber[1]);
        netz.kante(vorher, drueben, 'haupt');
        bruecken.push({ punkt: [(x + ueber[0]) / 2, (y + ueber[1]) / 2], winkel: w * 180 / Math.PI });
        spur.push([netz.knoten[drueben].x, netz.knoten[drueben].y]);
        vorher = drueben;
        x = netz.knoten[drueben].x; y = netz.knoten[drueben].y;
        gelaufen += s * 2;
        continue;
      }
      if (x < 70 || x > PLAN_GROESSE - 70 || y < 70 || y > PLAN_GROESSE - 70) break;
      const jetzt = netz.punkt(x, y);
      netz.kante(vorher, jetzt, haupt ? 'haupt' : 'gasse');
      spur.push([netz.knoten[jetzt].x, netz.knoten[jetzt].y]);
      vorher = jetzt;
      gelaufen += s;
    }
    adern.push({ i, haupt, knoten: spur, endeKnoten: vorher, winkel: w, weit: gelaufen });
    if (spur.length > 1) {
      wege.push({
        art: haupt ? 'haupt' : 'gasse', richtung: 'speiche', i, punkte: spur,
        name: planGassenname(saat, 'sp' + i, haupt ? 'haupt' : 'gasse')
      });
    }
  }

  /* --- Querverbindungen: erst daraus werden Blöcke --- */
  const ringe = 2 + Math.round(Rmax / 190);
  for (let r = 1; r <= ringe; r++) {
    const anteil = r / (ringe + 0.4);
    const vorherKnoten = [];
    for (const ader of adern) {
      const wieViele = ader.knoten.length;
      const stelle = Math.round(anteil * (wieViele - 1));
      if (stelle < 1 || stelle >= wieViele) { vorherKnoten.push(null); continue; }
      const p = ader.knoten[stelle];
      vorherKnoten.push(netz.punkt(p[0], p[1]));
    }
    const ringSpur = [];
    for (let i = 0; i < vorherKnoten.length; i++) {
      const a = vorherKnoten[i], b = vorherKnoten[(i + 1) % vorherKnoten.length];
      if (a == null || b == null || a === b) continue;
      const pa = netz.knoten[a], pb = netz.knoten[b];
      if (strecke([pa.x, pa.y], [pb.x, pb.y]) > Rmax * 0.9) continue;
      /* Nicht als gerade Linie, sondern über ein, zwei Zwischenpunkte, die
         nach außen ausbauchen — sonst wird der Ring wieder ein Kreis. */
      const zwischen = 1 + (planHash(saat, 'qz' + r + '_' + i) % 2);
      let vorigerKnoten = a;
      for (let z = 1; z <= zwischen; z++) {
        const t = z / (zwischen + 1);
        const zx = pa.x + (pb.x - pa.x) * t;
        const zy = pa.y + (pb.y - pa.y) * t;
        /* nach außen drücken */
        const rw = Math.atan2(zy - my, zx - mx);
        const raus = (10 + planZufall(saat, 'qr' + r + '_' + i + '_' + z) * 34) * krumm;
        const px = zx + Math.cos(rw) * raus, py = zy + Math.sin(rw) * raus;
        if (wasser.drin(px, py)) { vorigerKnoten = null; break; }
        const k = netz.punkt(px, py);
        netz.kante(vorigerKnoten, k, r === ringe ? 'mauerweg' : 'ring');
        vorigerKnoten = k;
      }
      if (vorigerKnoten != null) netz.kante(vorigerKnoten, b, r === ringe ? 'mauerweg' : 'ring');
      /* Für das Zeichnen: der Ring als ein durchlaufender Zug. */
      ringSpur.push([pa.x, pa.y]);
    }
    if (ringSpur.length > 2) {
      wege.push({
        art: r === ringe ? 'mauerweg' : 'ring', richtung: 'ring', j: r,
        punkte: ringSpur.concat([ringSpur[0]]), geschlossen: true,
        name: planGassenname(saat, 'ri' + r, 'ring')
      });
    }
  }

  /* --- Gassen: kurze Wege, die zwei Straßen verbinden --- */
  const wieVieleGassen = Math.round(speichen * 2.2);
  for (let i = 0; i < wieVieleGassen; i++) {
    const von = netz.knoten[planHash(saat, 'gv' + i) % netz.knoten.length];
    if (!von || von.aus.length < 2) continue;
    /* Den nächsten Punkt suchen, der noch nicht verbunden ist. */
    let ziel = null, weit = 1e9;
    for (const k of netz.knoten) {
      if (k.id === von.id) continue;
      const d = strecke([von.x, von.y], [k.x, k.y]);
      if (d < 26 || d > schritt * 2.4 || d >= weit) continue;
      if (von.aus.some((ki) => netz.kanten[ki].a === k.id || netz.kanten[ki].b === k.id)) continue;
      weit = d; ziel = k;
    }
    if (!ziel) continue;
    const zx = (von.x + ziel.x) / 2 + planStreu(saat, 'gx' + i) * 16 * krumm;
    const zy = (von.y + ziel.y) / 2 + planStreu(saat, 'gy' + i) * 16 * krumm;
    if (wasser.drin(zx, zy)) continue;
    const m = netz.punkt(zx, zy);
    netz.kante(von.id, m, 'gasse');
    netz.kante(m, ziel.id, 'gasse');
    wege.push({ art: 'gasse', richtung: 'quer', i: 1000 + i, punkte: [[von.x, von.y], [zx, zy], [ziel.x, ziel.y]], name: planGassenname(saat, 'qg' + i, 'gasse') });
  }

  return { netz, adern, wege, bruecken, marktEcken, marktKnoten, ringe };
}

/* ----- Der Umriss eines Hauses -----
   Vier Ecken sind ein Rechteck. Ein Haus auf einer gestochenen Karte hat
   aber einen Rücksprung, eine abgeschnittene Ecke, einen Hof — und keine
   Kante ist ganz gerade. Genau das wird hier gebaut, gerechnet aus der Saat,
   damit dasselbe Haus immer dieselbe Schiefe hat. */
function planHausUmriss(ecken, saat, k) {
  const zittern = (p, i) => [
    p[0] + planStreu(saat, 'hz' + k + '_' + i) * 0.9,
    p[1] + planStreu(saat, 'hy' + k + '_' + i) * 0.9
  ];
  const wuerfel = planZufall(saat, 'hf' + k);
  const ring = ecken.slice(0, 4);
  if (ring.length < 4) return ecken.map(zittern);

  const knick = (ecke, t, doppelt) => {
    const raus = [];
    for (let i = 0; i < 4; i++) {
      if (i !== ecke) { raus.push(ring[i]); continue; }
      const vor = ring[(i + 3) % 4], nach = ring[(i + 1) % 4];
      raus.push([vor[0] + (ring[i][0] - vor[0]) * (1 - t), vor[1] + (ring[i][1] - vor[1]) * (1 - t)]);
      if (doppelt) {
        raus.push([
          ring[i][0] - (ring[i][0] - vor[0]) * t - (ring[i][0] - nach[0]) * t,
          ring[i][1] - (ring[i][1] - vor[1]) * t - (ring[i][1] - nach[1]) * t
        ]);
      }
      raus.push([ring[i][0] + (nach[0] - ring[i][0]) * t, ring[i][1] + (nach[1] - ring[i][1]) * t]);
    }
    return raus;
  };

  /* Ein Winkelbau: hinten fehlt ein Viertel — dort liegt der Hof. */
  if (wuerfel > 0.84) return knick(planHash(saat, 'hw' + k) % 4, 0.42 + planZufall(saat, 'ht' + k) * 0.16, true).map(zittern);
  /* Eine abgeschnittene Ecke — das Haus steht schräg an der Gasse. */
  if (wuerfel > 0.66) return knick(planHash(saat, 'he' + k) % 4, 0.24 + planZufall(saat, 'hs' + k) * 0.16, false).map(zittern);
  return ring.map(zittern);
}

/* Ein Weg, der ins Wasser laeuft, hoert dort auf. Zerfaellt er dabei in
   mehrere Stuecke (eine Strasse quert den Fluss), werden es mehrere Wege —
   und an der Bruchstelle liegt spaeter eine Bruecke. */
function planTrockeneWege(punkte, wasser, geschlossen) {
  if (!wasser || wasser.art === 'keins') return [{ punkte, geschlossen }];
  const nass = punkte.map((q) => wasser.drin(q[0], q[1]));
  if (!nass.some(Boolean)) return [{ punkte, geschlossen }];
  const stuecke = [];
  let jetzt = [];
  for (let i = 0; i < punkte.length; i++) {
    if (nass[i]) {
      if (jetzt.length > 1) stuecke.push({ punkte: jetzt, geschlossen: false });
      jetzt = [];
    } else jetzt.push(punkte[i]);
  }
  if (jetzt.length > 1) stuecke.push({ punkte: jetzt, geschlossen: false });
  return stuecke;
}

/* ===================== DIE STRAHLENDE STADT =====================
   Ein Fürst setzt einen Punkt und richtet alles darauf aus: Straßen gehen
   sternförmig fort, Ringe legen sich darum. Das ist keine gewachsene Stadt,
   es ist eine Entscheidung — und man sieht ihr das an.

   Gebaut wird sie als derselbe Graph wie jede andere: Speiche mal Ring gibt
   die Kreuzungen, dazwischen liegen die Blöcke. Alles danach — Flächen,
   Bebauung, Mauer — ist für alle Anlagen dasselbe. */
function planNetzStrahlend(plan, wasser, mitte, Rmax, krumm) {
  const saat = plan.saat;
  const netz = netzBauen();
  const wege = [], bruecken = [], adern = [];
  const [mx, my] = mitte;
  const [, , speichen, ringe] = planGroesse(plan.stadt.groesse);
  const hoch = 0.9 + planZufall(saat, 'hh') * 0.16;

  const drall = [], phase = [], ringPhase = [], ringPhase2 = [];
  for (let i = 0; i < speichen; i++) {
    drall.push(planStreu(saat, 'sd' + i) * 8 * krumm);
    phase.push(planZufall(saat, 'sp' + i) * 6.3);
  }
  for (let j = 0; j <= ringe; j++) {
    ringPhase.push(planZufall(saat, 'rp' + j) * 6.3);
    ringPhase2.push(planZufall(saat, 'rq' + j) * 6.3);
  }
  const ringR = [];
  for (let j = 0; j <= ringe; j++) ringR.push(Rmax * (0.09 + 0.91 * Math.pow(j / ringe, 1.3)));

  const winkelVon = (i, j) => (i / speichen) * 360 + drall[i] +
    Math.sin(j * 0.85 + phase[i]) * 7 * krumm + planStreu(saat, 'w' + i + '_' + j) * 2.4 * krumm;
  const P = (i, j) => {
    const ii = ((i % speichen) + speichen) % speichen;
    const w = winkelVon(ii, j) * Math.PI / 180;
    const wobble = 1 + (Math.sin(w * 2 + ringPhase[j]) * 0.06 + Math.sin(w * 3.7 + ringPhase2[j]) * 0.04) * krumm;
    const r = ringR[j] * wobble;
    return [mx + Math.cos(w) * r, my + Math.sin(w) * r * hoch];
  };

  /* Die Kreuzungen — einmal angelegt, damit sie sich teilen lassen. */
  const K = [];
  for (let j = 0; j <= ringe; j++) {
    K.push([]);
    for (let i = 0; i < speichen; i++) {
      const p = P(i, j);
      K[j].push(wasser.drin(p[0], p[1]) ? null : netz.punkt(p[0], p[1]));
    }
  }

  /* Der Markt in der Mitte */
  const marktEcken = [], marktKnoten = [];
  for (let i = 0; i < speichen; i++) {
    if (K[0][i] == null) continue;
    marktEcken.push([netz.knoten[K[0][i]].x, netz.knoten[K[0][i]].y]);
    marktKnoten.push(K[0][i]);
  }
  for (let i = 0; i < marktKnoten.length; i++) netz.kante(marktKnoten[i], marktKnoten[(i + 1) % marktKnoten.length], 'platz');

  /* Die Speichen */
  for (let i = 0; i < speichen; i++) {
    const haupt = i % 2 === 0 || speichen < 9;
    const spur = [];
    for (let j = 0; j <= ringe; j++) {
      if (K[j][i] == null) break;
      spur.push([netz.knoten[K[j][i]].x, netz.knoten[K[j][i]].y]);
      if (j > 0 && K[j - 1][i] != null) netz.kante(K[j - 1][i], K[j][i], haupt ? 'haupt' : 'gasse');
    }
    /* Hinaus ins Land */
    if (haupt && plan.stadt.umland && K[ringe][i] != null) {
      const letzte = spur[spur.length - 1];
      const w = winkelVon(i, ringe) * Math.PI / 180;
      for (const weit of [0.1, 0.3]) {
        const q = [letzte[0] + Math.cos(w) * PLAN_GROESSE * weit, letzte[1] + Math.sin(w) * PLAN_GROESSE * weit * hoch];
        if (wasser.drin(q[0], q[1]) || q[0] < 60 || q[0] > PLAN_GROESSE - 60 || q[1] < 60 || q[1] > PLAN_GROESSE - 60) break;
        spur.push(q);
      }
    }
    if (spur.length > 1) {
      wege.push({ art: haupt ? 'haupt' : 'gasse', richtung: 'speiche', i, punkte: spur, name: planGassenname(saat, 'sp' + i, haupt ? 'haupt' : 'gasse') });
      adern.push({ i, haupt, knoten: spur });
    }
  }

  /* Die Ringe */
  for (let j = 1; j <= ringe; j++) {
    const spur = [];
    for (let i = 0; i <= speichen; i++) {
      const a = K[j][i % speichen], b = K[j][(i + 1) % speichen];
      if (a == null) continue;
      spur.push([netz.knoten[a].x, netz.knoten[a].y]);
      if (b != null && i < speichen) netz.kante(a, b, j === ringe ? 'mauerweg' : 'ring');
    }
    if (spur.length > 2) {
      wege.push({
        art: j === ringe ? 'mauerweg' : (j % 2 === 1 ? 'ring' : 'gasse'), richtung: 'ring', j,
        punkte: spur.concat([spur[0]]), geschlossen: true, name: planGassenname(saat, 'ri' + j, 'ring')
      });
    }
  }

  /* Brücken, wo eine Speiche das Wasser quert */
  if (wasser.art === 'fluss') {
    for (const w of wege) {
      if (w.richtung !== 'speiche') continue;
      for (let k = 1; k < w.punkte.length; k++) {
        const a = w.punkte[k - 1], b = w.punkte[k];
        if (wasser.drin(a[0], a[1]) !== wasser.drin(b[0], b[1])) {
          bruecken.push({ punkt: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], winkel: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI });
          break;
        }
      }
    }
  }
  return { netz, adern, wege, bruecken, marktEcken, marktKnoten, ringe };
}

/* ===================== DAS SCHACHBRETT =====================
   Ein Ingenieur, ein Lineal, ein Auftrag. Gerade Achsen, gleiche Blöcke.
   Damit es kein Millimeterpapier wird, steht das Raster schräg im Blatt,
   zittert leicht, und zwei Diagonalen schneiden hindurch — ohne die sähe
   selbst eine Planstadt tot aus. */
function planNetzSchachbrett(plan, wasser, mitte, Rmax, krumm) {
  const saat = plan.saat;
  const netz = netzBauen();
  const wege = [], bruecken = [], adern = [];
  const [mx, my] = mitte;
  const [, , speichen] = planGroesse(plan.stadt.groesse);
  const feld = 62 + planZufall(saat, 'gf') * 16;
  const n = Math.max(4, Math.round(Rmax * 2 / feld));
  const dreh = planZufall(saat, 'gd') * Math.PI / 2;
  const cos = Math.cos(dreh), sin = Math.sin(dreh);

  const stelle = (a, b) => {
    const lx = (a - n / 2) * feld, ly = (b - n / 2) * feld;
    /* Ein wenig Zittern — auch ein Ingenieur baut auf gewachsenem Boden. */
    const zx = planStreu(saat, 'gx' + a + '_' + b) * 5 * (0.3 + krumm);
    const zy = planStreu(saat, 'gy' + a + '_' + b) * 5 * (0.3 + krumm);
    return [mx + lx * cos - ly * sin + zx, my + lx * sin + ly * cos + zy];
  };
  const drin = (a, b) => {
    const p = stelle(a, b);
    if (wasser.drin(p[0], p[1])) return false;
    if (p[0] < 70 || p[0] > PLAN_GROESSE - 70 || p[1] < 70 || p[1] > PLAN_GROESSE - 70) return false;
    /* Eine abgerundete Grenze — ein Rechteck wäre zu hart. */
    const d = strecke(p, [mx, my]);
    return d < Rmax * (0.94 + planStreu(saat, 'gr' + a + '_' + b) * 0.1);
  };

  const K = [];
  for (let a = 0; a <= n; a++) {
    K.push([]);
    for (let b = 0; b <= n; b++) {
      const p = stelle(a, b);
      K[a].push(drin(a, b) ? netz.punkt(p[0], p[1]) : null);
    }
  }
  /* Die Zeilen und Spalten */
  for (let a = 0; a <= n; a++) {
    let spur = [];
    for (let b = 0; b <= n; b++) {
      if (K[a][b] == null) { if (spur.length > 1) wege.push({ art: a % 3 === 0 ? 'haupt' : 'gasse', richtung: 'speiche', i: a, punkte: spur, name: planGassenname(saat, 'ga' + a, a % 3 === 0 ? 'haupt' : 'gasse') }); spur = []; continue; }
      spur.push([netz.knoten[K[a][b]].x, netz.knoten[K[a][b]].y]);
      if (b > 0 && K[a][b - 1] != null) netz.kante(K[a][b - 1], K[a][b], a % 3 === 0 ? 'haupt' : 'gasse');
    }
    if (spur.length > 1) wege.push({ art: a % 3 === 0 ? 'haupt' : 'gasse', richtung: 'speiche', i: a, punkte: spur, name: planGassenname(saat, 'ga' + a, a % 3 === 0 ? 'haupt' : 'gasse') });
  }
  for (let b = 0; b <= n; b++) {
    let spur = [];
    for (let a = 0; a <= n; a++) {
      if (K[a][b] == null) { if (spur.length > 1) wege.push({ art: b % 3 === 0 ? 'ring' : 'gasse', richtung: 'ring', j: b, punkte: spur, name: planGassenname(saat, 'gb' + b, 'ring') }); spur = []; continue; }
      spur.push([netz.knoten[K[a][b]].x, netz.knoten[K[a][b]].y]);
      if (a > 0 && K[a - 1][b] != null) netz.kante(K[a - 1][b], K[a][b], b % 3 === 0 ? 'ring' : 'gasse');
    }
    if (spur.length > 1) wege.push({ art: b % 3 === 0 ? 'ring' : 'gasse', richtung: 'ring', j: b, punkte: spur, name: planGassenname(saat, 'gb' + b, 'ring') });
  }
  /* Zwei Diagonalen als Prachtstraßen */
  for (const [dx, dy] of [[1, 1], [1, -1]]) {
    const spur = [];
    let vorher = null;
    for (let t = 0; t <= n; t++) {
      const a = dx > 0 ? t : t, b = dy > 0 ? t : n - t;
      if (a > n || b > n || a < 0 || b < 0 || K[a][b] == null) { vorher = null; continue; }
      spur.push([netz.knoten[K[a][b]].x, netz.knoten[K[a][b]].y]);
      if (vorher != null) netz.kante(vorher, K[a][b], 'haupt');
      vorher = K[a][b];
    }
    if (spur.length > 1) {
      wege.push({ art: 'haupt', richtung: 'speiche', i: 900 + (dy > 0 ? 0 : 1), punkte: spur, name: planGassenname(saat, 'gd' + dy, 'haupt') });
      adern.push({ i: 900, haupt: true, knoten: spur });
    }
  }
  /* Der Markt: ein Block in der Mitte bleibt frei */
  const m = Math.round(n / 2);
  const marktEcken = [];
  for (const [a, b] of [[m, m], [m + 1, m], [m + 1, m + 1], [m, m + 1]]) {
    if (K[a] && K[a][b] != null) marktEcken.push([netz.knoten[K[a][b]].x, netz.knoten[K[a][b]].y]);
  }
  for (const w of wege) if (w.richtung === 'speiche' && w.art === 'haupt') adern.push({ i: w.i, haupt: true, knoten: w.punkte });

  if (wasser.art === 'fluss') {
    for (const w of wege) {
      for (let k = 1; k < w.punkte.length; k++) {
        const a = w.punkte[k - 1], b = w.punkte[k];
        if (strecke(a, b) > feld * 1.6) {
          bruecken.push({ punkt: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], winkel: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI });
        }
      }
    }
  }
  return { netz, adern, wege, bruecken, marktEcken, marktKnoten: [], ringe: Math.round(n / 2) };
}

/* ===================== BLOCKTEILUNG =====================
   Eine Stadt verdichtet sich: ist ein Block zu gross, wird eine Gasse
   hindurchgelegt und aus einem werden zwei. Das wiederholt sich, bis die
   Bloecke eine Groesse haben, an der Haeuser stehen koennen.

   Geteilt wird zwischen den Mitten zweier gegenueberliegender Kanten. So
   entstehen immer zwei geschlossene Vielecke — der Schnitt kann nicht
   danebengehen, und die neue Gasse ist gleich mitgezeichnet. */
function planBloeckeTeilen(poly, grenze, saat, k, tiefe, raus, schnitte) {
  const flaeche = Math.abs(netzFlaeche(poly));
  /* Sechs Teilungen: ein sehr grosser Block wird sonst nicht klein genug,
     und mitten im Haeusermeer bliebe ein leeres Feld stehen. */
  /* Sechs Teilungen: ein sehr grosser Block wird sonst nicht klein genug,
     und mitten im Haeusermeer bliebe ein leeres Feld stehen. Auch Dreiecke
     werden geteilt — sonst blieb ein grosses Dreieck ungeteilt liegen. */
  if (flaeche <= grenze || tiefe > 6 || poly.length < 3) { raus.push(poly); return; }

  /* Welcher Schnitt halbiert am besten?
     Zuerst wurde immer von der laengsten Kante zur entferntesten geschnitten.
     Bei einem langen schmalen Block lief der Schnitt dann DER LAENGE NACH und
     nahm kaum Flaeche weg — nach sechs Teilungen lagen immer noch Riesen
     dazwischen. Jetzt werden alle Kantenpaare durchprobiert und das genommen,
     bei dem die groessere Haelfte am kleinsten ist. Bei hoechstens einem
     Dutzend Kanten ist das ein Klacks und es halbiert wirklich. */
  const kantenMitte = (i, t) => [
    poly[i][0] + (poly[(i + 1) % poly.length][0] - poly[i][0]) * t,
    poly[i][1] + (poly[(i + 1) % poly.length][1] - poly[i][1]) * t
  ];
  const teile = (i, j, t) => {
    const pa = kantenMitte(i, 0.5), pb = kantenMitte(j, t);
    const eins = [pa], zwei = [pb];
    for (let x = (i + 1) % poly.length; x !== (j + 1) % poly.length; x = (x + 1) % poly.length) eins.push(poly[x]);
    eins.push(pb);
    for (let x = (j + 1) % poly.length; x !== (i + 1) % poly.length; x = (x + 1) % poly.length) zwei.push(poly[x]);
    zwei.push(pa);
    return [eins, zwei, pa, pb];
  };
  const t = 0.5 + planStreu(saat, 'bt' + k + tiefe) * 0.14;
  let bestes = null, besteGroesse = Infinity;
  for (let i = 0; i < poly.length; i++) {
    for (let j = 0; j < poly.length; j++) {
      if (i === j) continue;
      const [eins, zwei] = teile(i, j, t);
      if (eins.length < 3 || zwei.length < 3) continue;
      const groesser = Math.max(Math.abs(netzFlaeche(eins)), Math.abs(netzFlaeche(zwei)));
      if (groesser < besteGroesse) { besteGroesse = groesser; bestes = [i, j]; }
    }
  }
  if (!bestes) { raus.push(poly); return; }
  const [eins, zwei, mitteA, mitteB] = teile(bestes[0], bestes[1], t);
  schnitte.push([mitteA, mitteB]);
  planBloeckeTeilen(eins, grenze, saat, k + 'a', tiefe + 1, raus, schnitte);
  planBloeckeTeilen(zwei, grenze, saat, k + 'b', tiefe + 1, raus, schnitte);
}

/* ===================== DIE BEBAUUNG =====================
   Häuser stellen sich an die Straße. Der Hof bleibt frei. Deshalb wird
   nicht die Fläche geteilt, sondern jede Blockkante entlanggelaufen und
   Parzelle an Parzelle gesetzt. */
function planBlockBebauen(poly, saat, schluessel, va, dichte, wasser, haeuser) {
  const flaeche = Math.abs(netzFlaeche(poly));
  if (flaeche < 380) return;
  const mitte = netzMitte(poly);
  /* Umlaufrichtung: nach innen zeigt die Normale immer zur Mitte. */
  const plotBreite = 17 / (va.dichte * dichte) * va.haus;
  const tiefeGrund = Math.min(26, Math.max(11, Math.sqrt(flaeche) * 0.22));
  let nr = 0;

  for (let e = 0; e < poly.length; e++) {
    const a = poly[e], b = poly[(e + 1) % poly.length];
    const laenge = strecke(a, b);
    if (laenge < plotBreite * 0.9) continue;
    const dx = (b[0] - a[0]) / laenge, dy = (b[1] - a[1]) / laenge;
    /* Die Normale, die zur Blockmitte zeigt */
    let nx = -dy, ny = dx;
    const probe = [(a[0] + b[0]) / 2 + nx * 4, (a[1] + b[1]) / 2 + ny * 4];
    if (!netzImPolygon(poly, probe[0], probe[1])) { nx = -nx; ny = -ny; }

    const wieViele = Math.max(1, Math.floor(laenge / plotBreite));
    const echteBreite = laenge / wieViele;
    for (let i = 0; i < wieViele; i++) {
      const k = schluessel + '_' + e + '_' + i;
      if (planZufall(saat, 'lu' + k) < va.hoefe * 0.3) continue;   /* eine Lücke */
      const randA = 0.07 + planZufall(saat, 'ra' + k) * 0.14;
      const randB = 0.07 + planZufall(saat, 'rb' + k) * 0.14;
      const tiefe = tiefeGrund * (0.72 + planZufall(saat, 'rt' + k) * 0.56) * va.haus;
      const zurueck = 1.6 + planZufall(saat, 'rz' + k) * 2.4;

      const t0 = (i + randA) * echteBreite, t1 = (i + 1 - randB) * echteBreite;
      const p0 = [a[0] + dx * t0 + nx * zurueck, a[1] + dy * t0 + ny * zurueck];
      const p1 = [a[0] + dx * t1 + nx * zurueck, a[1] + dy * t1 + ny * zurueck];
      const p2 = [p1[0] + nx * tiefe, p1[1] + ny * tiefe];
      const p3 = [p0[0] + nx * tiefe, p0[1] + ny * tiefe];
      /* Das Haus muss GANZ im Block liegen — alle vier Ecken. Bei einem
         einspringenden Block liegt der Rücksprung sonst schon außerhalb,
         obwohl die Mitte der Kante noch drin war. */
      if (!netzImPolygon(poly, p0[0], p0[1]) || !netzImPolygon(poly, p1[0], p1[1]) ||
          !netzImPolygon(poly, p2[0], p2[1]) || !netzImPolygon(poly, p3[0], p3[1])) continue;
      if (wasser.drin(p0[0], p0[1]) || wasser.drin(p2[0], p2[1])) continue;
      const ecken = [p0, p1, p2, p3];
      const gr = Math.abs(netzFlaeche(ecken));
      if (gr < 30) continue;
      haeuser.push({
        ecken,
        umriss: planHausUmriss(ecken, saat, k),
        ton: planHash(saat, 'dt' + k) % 5,
        gross: gr > 520,
        viertel: va.id,
        sonder: '',
        /* Zu welchem Block das Haus gehoert — ueber den Mittelpunkt laesst
           sich das nicht zurueckrechnen, weil Flaechen einander enthalten
           koennen. */
        block: schluessel,
        n: haeuser.length
      });
      nr++;
    }
  }
  return nr;
}
