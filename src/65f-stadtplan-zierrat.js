/* ===================================================================
   DAS GEZEICHNETE: HAFEN, MÜHLE, WERDER, WAPPEN, LEGENDE
   -------------------------------------------------------------------
   Die Geometrie steht in 65e; hier wird sie zu Strichen. Getrennt, weil
   das Rechnen sich prüfen lässt und das Zeichnen ein Auge braucht.
   =================================================================== */

/* ----- Der Hafen ----- */
function planHafenZeichnen(hafen, welt, saat) {
  const g = kv('g', { class: 'kt-hafen' });
  if (!hafen || !hafen.hat) return g;

  /* Der Wellenbrecher liegt am weitesten draußen und damit zuunterst. */
  if (hafen.wellenbrecher) {
    for (const stueck of [hafen.wellenbrecher.links, hafen.wellenbrecher.rechts]) {
      g.append(kv('path', { d: kweich(stueck), class: 'kt-wellenbrecher-rand' }));
      g.append(kv('path', { d: kweich(stueck), class: 'kt-wellenbrecher' }));
    }
  }

  /* Die Kaimauer: ein voller Streifen, kein Strich. */
  if (hafen.kai.length > 2) {
    g.append(kv('path', { d: kweich(hafen.kai), class: 'kt-kai-rand' }));
    g.append(kv('path', { d: kweich(hafen.kai), class: 'kt-kai' }));
  }

  /* Die Molen — erst dunkel und breit, dann hell und schmal: so
     verschmelzen Kai und Molen zu EINEM Umriss statt zu lauter Stücken,
     die einander überlappen. Derselbe Kniff wie beim Straßennetz. */
  for (const m of hafen.molen) {
    const d = 'M ' + kz(m.wurzel[0]) + ' ' + kz(m.wurzel[1]) + ' L ' + kz(m.kopf[0]) + ' ' + kz(m.kopf[1]);
    g.append(kv('path', { d, class: 'kt-mole-rand', 'stroke-width': kz(m.breit + 3.2) }));
  }
  for (const m of hafen.molen) {
    const d = 'M ' + kz(m.wurzel[0]) + ' ' + kz(m.wurzel[1]) + ' L ' + kz(m.kopf[0]) + ' ' + kz(m.kopf[1]);
    g.append(kv('path', { d, class: 'kt-mole', 'stroke-width': kz(m.breit) }));
  }

  /* Poller: kleine Punkte auf dem Stein. */
  for (const p of hafen.poller) {
    g.append(kv('circle', { cx: kz(p[0]), cy: kz(p[1]), r: 1.5, class: 'kt-poller' }));
  }

  /* Die Schiffe, längsseits vertäut. */
  for (const s of hafen.schiffe) {
    const w = Math.atan2(s.laengs[1], s.laengs[0]) * 180 / Math.PI;
    g.append(planSchiff(s, w, saat));
  }

  /* Die Kräne. */
  for (const k of hafen.kraene) {
    const w = Math.atan2(k.auslage[1], k.auslage[0]) * 180 / Math.PI;
    const gk = kv('g', { class: 'kt-kran', transform: 'translate(' + kz(k.punkt[0]) + ' ' + kz(k.punkt[1]) + ') rotate(' + Math.round(w) + ')' });
    /* Ein Tretkran: ein Häuschen mit einem Ausleger darüber. */
    gk.append(kv('rect', { x: -4.5, y: -4.5, width: 9, height: 9, rx: 1, class: 'kt-kranhaus' }));
    gk.append(kv('path', { d: 'M 0 0 L ' + kz(k.hoehe) + ' ' + kz(-k.hoehe * 0.55), class: 'kt-kranarm' }));
    gk.append(kv('path', { d: 'M ' + kz(k.hoehe) + ' ' + kz(-k.hoehe * 0.55) + ' v 5', class: 'kt-kranseil' }));
    g.append(gk);
  }

  /* Das Leuchtfeuer. */
  if (hafen.leuchtturm) {
    const [x, y] = hafen.leuchtturm.punkt;
    const gl = kv('g', { class: 'kt-leuchtturm', transform: 'translate(' + kz(x) + ' ' + kz(y) + ')' });
    gl.append(kv('path', { d: 'M -3.6 4 L -2.4 -6 H 2.4 L 3.6 4 Z', class: 'kt-leuchtkoerper' }));
    gl.append(kv('path', { d: 'M -3.4 -0.6 H 3.4', class: 'kt-leuchtstrich' }));
    gl.append(kv('path', { d: 'M -3 -6 H 3 L 2 -8.6 H -2 Z', class: 'kt-leuchtlaterne' }));
    /* Die Strahlen — das Zeichen, dass es brennt. */
    for (const [dx, dy] of [[-1, -0.45], [1, -0.45], [-0.8, -1], [0.8, -1]]) {
      gl.append(kv('path', { d: 'M ' + kz(dx * 4) + ' ' + kz(-8 + dy * 1.4) + ' l ' + kz(dx * 3.4) + ' ' + kz(dy * 3), class: 'kt-leuchtstrahl' }));
    }
    g.append(gl);
  }
  return g;
}

/* Ein Schiff von oben: Rumpf mit Spitze, Deckstrich, Masten mit Rah. */
function planSchiff(s, winkel, saat) {
  const g = kv('g', { class: 'kt-hafenschiff', transform: 'translate(' + kz(s.punkt[0]) + ' ' + kz(s.punkt[1]) + ') rotate(' + Math.round(winkel) + ')' });
  const l = s.laenge / 2, b = s.breite / 2;
  g.append(kv('path', {
    d: 'M ' + kz(-l) + ' 0 C ' + kz(-l * 0.6) + ' ' + kz(-b) + ', ' + kz(l * 0.55) + ' ' + kz(-b) + ', ' + kz(l) + ' 0' +
       ' C ' + kz(l * 0.55) + ' ' + kz(b) + ', ' + kz(-l * 0.6) + ' ' + kz(b) + ', ' + kz(-l) + ' 0 Z',
    class: 'kt-schiffleib'
  }));
  g.append(kv('path', { d: 'M ' + kz(-l * 0.7) + ' 0 H ' + kz(l * 0.8), class: 'kt-schiffdeck' }));
  for (let m = 0; m < s.masten; m++) {
    const x = -l * 0.5 + (m / Math.max(1, s.masten - 1 || 1)) * l * 1.1;
    g.append(kv('path', { d: 'M ' + kz(x) + ' ' + kz(-b * 0.9) + ' V ' + kz(b * 0.9), class: 'kt-schiffrah' }));
  }
  return g;
}

/* ----- Die Mühle -----
   Ein Haus am Ufer und ein Rad im Wasser. Das Rad hat Speichen, sonst
   ist es ein Kreis, und ein Kreis ist keine Mühle. */
function planMuehleZeichnen(muehle, welt) {
  const g = kv('g', { class: 'kt-muehle' });
  if (!muehle) return g;
  const w = Math.atan2(muehle.laengs[1], muehle.laengs[0]) * 180 / Math.PI;

  const gh = kv('g', { transform: 'translate(' + kz(muehle.punkt[0]) + ' ' + kz(muehle.punkt[1]) + ') rotate(' + Math.round(w) + ')' });
  gh.append(kv('rect', { x: -7, y: -5.5, width: 14, height: 11, rx: 1, class: 'kt-muehlenhaus' }));
  gh.append(kv('path', { d: 'M -7 -1.4 H 7', class: 'kt-muehlenfirst' }));
  g.append(gh);

  const gr = kv('g', { transform: 'translate(' + kz(muehle.rad[0]) + ' ' + kz(muehle.rad[1]) + ') rotate(' + Math.round(w) + ')' });
  gr.append(kv('circle', { cx: 0, cy: 0, r: 5.4, class: 'kt-muehlrad' }));
  gr.append(kv('circle', { cx: 0, cy: 0, r: 1.5, class: 'kt-muehlnabe' }));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    gr.append(kv('path', {
      d: 'M ' + kz(Math.cos(a) * 1.5) + ' ' + kz(Math.sin(a) * 1.5) +
         ' L ' + kz(Math.cos(a) * 5.4) + ' ' + kz(Math.sin(a) * 5.4),
      class: 'kt-muehlspeiche'
    }));
  }
  g.append(gr);
  return g;
}

/* ----- Die Werder im Wasser ----- */
function planInselnZeichnen(inseln, welt, saat, papier) {
  const g = kv('g', { class: 'kt-werder' });
  for (const i of inseln || []) {
    g.append(kv('path', { d: kweich(i.ecken, true), class: 'kt-werdergrund', fill: papier }));
    g.append(kv('path', { d: kweich(i.ecken, true), class: 'kt-werderrand' }));
    for (let t = 0; t < i.baeume; t++) {
      const p = netzPunktDrin(i.ecken, saat, 'wb' + i.n + '_' + t);
      g.append(planBaum(p[0], p[1], 2.4 + planZufall(saat, 'wbr' + i.n + t) * 1.6, welt));
    }
  }
  return g;
}

/* ===================== DAS WAPPEN =====================
   Die heraldische Schraffur nach Silvestro Petra Sancta (1638): jede
   Tinktur hat ihre Strichlage. So kann ein Kupferstich, der nur Schwarz
   kennt, ein farbiges Wappen vollständig wiedergeben — und wer die
   Übereinkunft kennt, liest die Farben ab. */
function planTinkturStriche(art, x, y, breite, hoehe, dicht) {
  const d = dicht || 3;
  let pfad = '';
  if (art === 'senkrecht' || art === 'gitter') {
    for (let a = x; a <= x + breite; a += d) pfad += ' M ' + kz(a) + ' ' + kz(y) + ' V ' + kz(y + hoehe);
  }
  if (art === 'waagerecht' || art === 'gitter') {
    for (let b = y; b <= y + hoehe; b += d) pfad += ' M ' + kz(x) + ' ' + kz(b) + ' H ' + kz(x + breite);
  }
  if (art === 'schraeg') {
    for (let a = x - hoehe; a <= x + breite; a += d) pfad += ' M ' + kz(a) + ' ' + kz(y) + ' l ' + kz(hoehe) + ' ' + kz(hoehe);
  }
  if (art === 'gegenschraeg') {
    for (let a = x; a <= x + breite + hoehe; a += d) pfad += ' M ' + kz(a) + ' ' + kz(y) + ' l ' + kz(-hoehe) + ' ' + kz(hoehe);
  }
  if (art === 'punkte') {
    for (let b = y; b <= y + hoehe; b += d) {
      const versatz = (Math.round((b - y) / d) % 2) * (d / 2);
      for (let a = x + versatz; a <= x + breite; a += d) pfad += ' M ' + kz(a) + ' ' + kz(b) + ' h .01';
    }
  }
  return pfad.trim();
}

/* Der Schild: die deutsche Form mit gerader Schulter und rundem Fuß. */
function planSchildPfad(b, h) {
  const x = -b / 2, y = -h / 2;
  return 'M ' + kz(x) + ' ' + kz(y) +
    ' H ' + kz(x + b) +
    ' V ' + kz(y + h * 0.44) +
    ' C ' + kz(x + b) + ' ' + kz(y + h * 0.82) + ', ' + kz(x + b * 0.62) + ' ' + kz(y + h) + ', 0 ' + kz(y + h) +
    ' C ' + kz(x + b * 0.38) + ' ' + kz(y + h) + ', ' + kz(x) + ' ' + kz(y + h * 0.82) + ', ' + kz(x) + ' ' + kz(y + h * 0.44) +
    ' Z';
}

/* Die Felder einer Teilung, jedes als eigener Pfad, damit es seine
   eigene Schraffur bekommen kann. */
function planWappenFelder(teilung, b, h) {
  const x = -b / 2, y = -h / 2;
  const ganz = 'M ' + kz(x) + ' ' + kz(y) + ' h ' + kz(b) + ' v ' + kz(h) + ' h ' + kz(-b) + ' Z';
  if (teilung === 'pfahl') return [
    'M ' + kz(x) + ' ' + kz(y) + ' h ' + kz(b / 2) + ' v ' + kz(h) + ' h ' + kz(-b / 2) + ' Z',
    'M 0 ' + kz(y) + ' h ' + kz(b / 2) + ' v ' + kz(h) + ' h ' + kz(-b / 2) + ' Z'
  ];
  if (teilung === 'balken') return [
    'M ' + kz(x) + ' ' + kz(y) + ' h ' + kz(b) + ' v ' + kz(h / 2) + ' h ' + kz(-b) + ' Z',
    'M ' + kz(x) + ' 0 h ' + kz(b) + ' v ' + kz(h / 2) + ' h ' + kz(-b) + ' Z'
  ];
  if (teilung === 'schraeg') return [
    'M ' + kz(x) + ' ' + kz(y) + ' L ' + kz(x + b) + ' ' + kz(y) + ' L ' + kz(x) + ' ' + kz(y + h) + ' Z',
    'M ' + kz(x + b) + ' ' + kz(y) + ' L ' + kz(x + b) + ' ' + kz(y + h) + ' L ' + kz(x) + ' ' + kz(y + h) + ' Z'
  ];
  if (teilung === 'geviert') return [
    'M ' + kz(x) + ' ' + kz(y) + ' h ' + kz(b / 2) + ' v ' + kz(h / 2) + ' h ' + kz(-b / 2) + ' Z' +
    ' M 0 0 h ' + kz(b / 2) + ' v ' + kz(h / 2) + ' h ' + kz(-b / 2) + ' Z',
    'M 0 ' + kz(y) + ' h ' + kz(b / 2) + ' v ' + kz(h / 2) + ' h ' + kz(-b / 2) + ' Z' +
    ' M ' + kz(x) + ' 0 h ' + kz(b / 2) + ' v ' + kz(h / 2) + ' h ' + kz(-b / 2) + ' Z'
  ];
  if (teilung === 'spitze') return [
    ganz,
    'M 0 ' + kz(y) + ' C ' + kz(b * 0.3) + ' ' + kz(y + h * 0.55) + ', ' + kz(b * 0.32) + ' ' + kz(y + h * 0.8) + ', ' + kz(b * 0.28) + ' ' + kz(y + h) +
    ' H ' + kz(-b * 0.28) +
    ' C ' + kz(-b * 0.32) + ' ' + kz(y + h * 0.8) + ', ' + kz(-b * 0.3) + ' ' + kz(y + h * 0.55) + ', 0 ' + kz(y) + ' Z'
  ];
  return [ganz, ''];
}

let _wappenZaehler = 0;
/* Das ganze Wappen als Gruppe. `hoehe` bestimmt alles Übrige. */
function planWappenSVG(wappen, hoehe, welt) {
  const w = wappen || {};
  const h = hoehe || 54;
  const b = h * 0.84;
  const g = kv('g', { class: 'kt-wappen' });
  const id = 'kt-schild-' + (++_wappenZaehler);

  const defs = kv('defs', {});
  const clip = kv('clipPath', { id });
  clip.append(kv('path', { d: planSchildPfad(b, h) }));
  defs.append(clip);
  g.append(defs);

  const drin = kv('g', { 'clip-path': 'url(#' + id + ')' });
  /* Der Grund liegt hell; die Schraffur macht daraus eine Farbe. */
  drin.append(kv('path', { d: planSchildPfad(b, h), class: 'kt-schildgrund' }));

  const felder = planWappenFelder(w.teilung || 'ganz', b, h);
  const tinkturen = [planTinktur(w.grund), planTinktur(w.zweit)];
  felder.forEach((pfad, i) => {
    if (!pfad) return;
    const t = tinkturen[i] || tinkturen[0];
    if (t.strich === 'leer') return;
    const feldId = id + '-f' + i;
    const feldClip = kv('clipPath', { id: feldId });
    feldClip.append(kv('path', { d: pfad }));
    defs.append(feldClip);
    drin.append(kv('path', {
      d: planTinkturStriche(t.strich, -b / 2 - 2, -h / 2 - 2, b + 4, h + 4, 2.6),
      class: 'kt-tinktur' + (t.strich === 'punkte' ? ' korn' : ''),
      'clip-path': 'url(#' + feldId + ')'
    }));
  });

  /* Die Figuren: eine mittig, zwei nebeneinander, drei im Dreipass —
     zwei oben, eine unten. So werden Wappen seit jeher gestellt. */
  const zahl = Math.max(1, Math.min(3, w.wieViele || 1));
  const stellen = zahl === 1 ? [[0, h * 0.02, h * 0.46]]
    : zahl === 2 ? [[-b * 0.22, h * 0.02, h * 0.34], [b * 0.22, h * 0.02, h * 0.34]]
      : [[-b * 0.24, -h * 0.14, h * 0.3], [b * 0.24, -h * 0.14, h * 0.3], [0, h * 0.22, h * 0.3]];
  const figurStrich = planTinktur(w.figur).strich;
  for (const [fx, fy, fh] of stellen) {
    const gf = kv('g', { transform: 'translate(' + kz(fx) + ' ' + kz(fy) + ') scale(' + (fh / 20).toFixed(3) + ')' });
    gf.append(planWappenbildPfad(w.bild, figurStrich));
    drin.append(gf);
  }

  g.append(drin);
  /* Der Schildrand liegt AUF allem — sonst franst die Schraffur aus. */
  g.append(kv('path', { d: planSchildPfad(b, h), class: 'kt-schildrand' }));
  return g;
}

/* Die vierzehn Wappenbilder, jedes in einem Feld von etwa zwanzig
   Einheiten Höhe. Geritzt, nicht gemalt: ein Umriss und ein paar
   Binnenstriche, mehr braucht ein Wappentier nie. */
function planWappenbildPfad(id, strich) {
  const voll = strich === 'gitter' || strich === 'senkrecht' || strich === 'waagerecht';
  const g = kv('g', { class: 'kt-wappenbild' + (voll ? ' dunkel' : '') });
  const p = (d, klasse) => g.append(kv('path', { d, class: klasse || 'kt-wbstrich' }));

  if (id === 'turm') {
    p('M -6 10 V -4 h 12 V 10 Z', 'kt-wbleib');
    p('M -7 -4 h 14 M -7 -4 v -2.4 h 2.6 v 2.4 M -1.3 -6.4 h 2.6 v 2.4 M 4.4 -6.4 h 2.6 v 2.4');
    p('M -2 10 V 3 a 2 2 0 0 1 4 0 v 7');
    p('M -4 -1 h 2 M 2 -1 h 2');
  } else if (id === 'schluessel') {
    p('M 0 -9 a 4 4 0 1 1 -0.01 0 Z M 0 -6.4 a 1.4 1.4 0 1 0 0.01 0 Z', 'kt-wbleib');
    p('M 0 -5 V 9 M 0 5 h 4 M 0 8 h 3.2', 'kt-wbdick');
  } else if (id === 'stern') {
    let d = '';
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (i / 12) * Math.PI * 2;
      const r = i % 2 ? 4 : 10;
      d += (i ? ' L ' : 'M ') + kz(Math.cos(a) * r) + ' ' + kz(Math.sin(a) * r);
    }
    p(d + ' Z', 'kt-wbleib');
  } else if (id === 'fisch') {
    p('M -9 0 C -5 -6, 4 -6, 8 0 C 4 6, -5 6, -9 0 Z', 'kt-wbleib');
    p('M 8 0 l 4 -4 v 8 Z', 'kt-wbleib');
    p('M 3 -1.4 a 1 1 0 1 0 0.01 0 Z', 'kt-wbdick');
    p('M -3 -3.4 C 0 0, 0 0, -3 3.4');
  } else if (id === 'eichenblatt') {
    p('M 0 10 V -1 M 0 -1 C -6 -2, -7 -6, -4 -9 C -2 -7, -1 -8, 0 -10 C 1 -8, 2 -7, 4 -9 C 7 -6, 6 -2, 0 -1 Z', 'kt-wbleib');
    p('M 0 2 l -3 -2 M 0 5 l 3 -2');
  } else if (id === 'rad') {
    p('M 0 -10 a 10 10 0 1 1 -0.01 0 Z', 'kt-wbring');
    p('M 0 -3 a 3 3 0 1 1 -0.01 0 Z', 'kt-wbleib');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      p('M ' + kz(Math.cos(a) * 3) + ' ' + kz(Math.sin(a) * 3) + ' L ' + kz(Math.cos(a) * 10) + ' ' + kz(Math.sin(a) * 10));
    }
  } else if (id === 'anker') {
    p('M 0 -8 V 8', 'kt-wbdick');
    p('M 0 -10 a 2 2 0 1 1 -0.01 0 Z', 'kt-wbring');
    p('M -5 -5 H 5', 'kt-wbdick');
    p('M -8 3 C -8 9, -3 10, 0 8 C 3 10, 8 9, 8 3', 'kt-wbdick');
    p('M -8 3 l -1.6 -2 M -8 3 l 2.2 -0.6 M 8 3 l 1.6 -2 M 8 3 l -2.2 -0.6');
  } else if (id === 'mond') {
    p('M 3 -9 A 10 10 0 1 0 3 9 A 8 8 0 1 1 3 -9 Z', 'kt-wbleib');
  } else if (id === 'krone') {
    p('M -9 6 H 9 L 8 -2 L 4.5 2 L 0 -6 L -4.5 2 L -8 -2 Z', 'kt-wbleib');
    p('M -9 6 h 18', 'kt-wbdick');
    p('M -8 -3.4 a 1.4 1.4 0 1 0 0.01 0 Z M 0 -7.6 a 1.4 1.4 0 1 0 0.01 0 Z M 8 -3.4 a 1.4 1.4 0 1 0 0.01 0 Z', 'kt-wbdick');
  } else if (id === 'bruecke') {
    p('M -10 6 V -1 h 20 V 6 Z', 'kt-wbleib');
    p('M -10 -1 h 20', 'kt-wbdick');
    p('M -7 6 V 2 a 3 3 0 0 1 6 0 v 4 M 1 6 V 2 a 3 3 0 0 1 6 0 v 4');
    p('M -10 -1 v -3 M 10 -1 v -3');
  } else if (id === 'ross') {
    p('M -2 10 C -6 6, -7 0, -5 -4 C -4 -7, -1 -9, 3 -9 L 5 -11 L 6 -8 C 8 -6, 8 -2, 6 1 C 4 4, 3 7, 3 10 Z', 'kt-wbleib');
    p('M 3 -6.4 a 1 1 0 1 0 0.01 0 Z', 'kt-wbdick');
    p('M -3 -3 C 0 -1, 2 -1, 5 -2');
  } else if (id === 'lilie') {
    p('M 0 -10 C 2 -5, 5 -3, 5 0 C 5 3, 2 4, 0 2 C -2 4, -5 3, -5 0 C -5 -3, -2 -5, 0 -10 Z', 'kt-wbleib');
    p('M -7 2 h 14', 'kt-wbdick');
    p('M -5 2 C -6 6, -4 9, 0 10 C 4 9, 6 6, 5 2');
  } else if (id === 'hammer') {
    p('M -7 -8 h 14 v 5 h -14 Z', 'kt-wbleib');
    p('M -1.6 -3 h 3.2 V 10 h -3.2 Z', 'kt-wbleib');
  } else if (id === 'aehre') {
    p('M 0 10 V -4', 'kt-wbdick');
    for (let i = 0; i < 5; i++) {
      const y = -4 - i * 1.9;
      p('M 0 ' + kz(y) + ' C -3 ' + kz(y - 1) + ', -3.4 ' + kz(y - 3) + ', 0 ' + kz(y - 3.4));
      p('M 0 ' + kz(y) + ' C 3 ' + kz(y - 1) + ', 3.4 ' + kz(y - 3) + ', 0 ' + kz(y - 3.4));
    }
    p('M 0 4 C -4 3, -5 0, -4.6 -2 M 0 6 C 4 5, 5 2, 4.6 0');
  } else {
    p('M -6 -6 h 12 v 12 h -12 Z', 'kt-wbleib');
  }
  return g;
}

/* ===================== DIE LEGENDE =====================
   Ein Feld am Rand, in dem jedes Zeichen einmal steht und dahinter, was
   es bedeutet. Zwei Spalten, weil eine bei achtzehn Einträgen bis zum
   Fuß der Karte liefe. */
function planLegendeSVG(eintraege, x, y, welt) {
  const g = kv('g', { class: 'kt-legende', transform: 'translate(' + kz(x) + ' ' + kz(y) + ')' });
  const liste = (eintraege || []).slice(0, 20);
  if (!liste.length) return g;

  const spalten = liste.length > 8 ? 2 : 1;
  const jeSpalte = Math.ceil(liste.length / spalten);
  const zeile = 15.5;
  const spaltenBreite = 132;
  const breite = 16 + spalten * spaltenBreite;
  const hoehe = 34 + jeSpalte * zeile;

  g.append(kv('rect', { x: 0, y: 0, width: kz(breite), height: kz(hoehe), rx: 3, class: 'kt-legendegrund' }));
  g.append(kv('rect', { x: 3.5, y: 3.5, width: kz(breite - 7), height: kz(hoehe - 7), rx: 2, class: 'kt-legenderahmen' }));
  const t = kv('text', { x: kz(breite / 2), y: 21, class: 'kt-legendetitel', 'text-anchor': 'middle' });
  t.textContent = 'Zeichenerklärung';
  g.append(t);
  g.append(kv('path', { d: 'M 16 26 H ' + kz(breite - 16), class: 'kt-legendestrich' }));

  liste.forEach((e, i) => {
    const sp = Math.floor(i / jeSpalte);
    const zi = i % jeSpalte;
    const zx = 14 + sp * spaltenBreite;
    const zy = 34 + zi * zeile + zeile / 2;
    const gz = kv('g', { transform: 'translate(' + kz(zx + 8) + ' ' + kz(zy) + ')' });
    gz.append(planLegendeZeichen(e.zeichen, welt));
    g.append(gz);
    const tx = kv('text', { x: kz(zx + 21), y: kz(zy + 3.2), class: 'kt-legendetext' });
    tx.textContent = e.text;
    g.append(tx);
  });
  return g;
}

/* Die Zeichen der Legende: dieselben Formen wie auf der Karte, nur klein
   und ohne Umgebung. Ein Legendenzeichen, das anders aussieht als das
   Ding auf der Karte, ist schlimmer als gar keins. */
function planLegendeZeichen(art, welt) {
  const g = kv('g', { class: 'kt-lz' });
  const p = (d, klasse) => g.append(kv('path', { d, class: klasse }));
  if (art === 'haus') p('M -4 -3 h 8 v 6 h -8 Z', 'kt-lz-haus');
  else if (art === 'grosshaus') p('M -5 -3.4 h 10 v 7 h -10 Z', 'kt-lz-grosshaus');
  else if (art === 'kirche') { p('M -4 -2 h 8 v 5 h -8 Z', 'kt-lz-haus'); p('M 0 -8 V -2 M -1.6 -6.4 h 3.2', 'kt-lz-strich'); }
  else if (art === 'burg') { p('M -5 -1 h 10 v 5 h -10 Z', 'kt-lz-grosshaus'); p('M -5 -1 v -2.6 h 2 v 2.6 M -1 -3.6 h 2 v 2.6 M 3 -3.6 h 2 v 2.6', 'kt-lz-grosshaus'); }
  else if (art === 'mauer') { p('M -6 1 H 6', 'kt-lz-mauer'); p('M -6 -1.6 h 1.6 v 1.6 M -2.4 -1.6 h 1.6 v 1.6 M 1.2 -1.6 h 1.6 v 1.6 M 4.8 -1.6 h 1.2 v 1.6', 'kt-lz-strich'); }
  else if (art === 'tor') { p('M -4 -4 h 8 v 8 h -8 Z', 'kt-lz-tor'); p('M -1.8 4 V 0 a 1.8 1.8 0 0 1 3.6 0 v 4', 'kt-lz-strich'); }
  else if (art === 'markt') p('M -5 -3.4 h 10 v 6.8 h -10 Z', 'kt-lz-markt');
  else if (art === 'garten') { p('M 0 3.4 V 1', 'kt-lz-strich'); p('M 0 -4.4 C 3.4 -2.6, 3.4 1.4, 0 1.4 C -3.4 1.4, -3.4 -2.6, 0 -4.4 Z', 'kt-lz-gruen'); }
  else if (art === 'friedhof') p('M 0 -4 V 4 M -2.4 -1.4 H 2.4', 'kt-lz-strich');
  else if (art === 'bruecke') { p('M -5 1 H 5', 'kt-lz-mauer'); p('M -3 3 V 1 M 3 3 V 1', 'kt-lz-strich'); }
  else if (art === 'hafen') { p('M -6 2 H 6', 'kt-lz-mauer'); p('M -2 2 V -3 M 3 2 V -1', 'kt-lz-strich'); }
  else if (art === 'leuchtturm') { p('M -2.4 4 L -1.4 -4 h 2.8 L 2.4 4 Z', 'kt-lz-tor'); p('M -3.4 -5.4 l -2 -1.4 M 3.4 -5.4 l 2 -1.4', 'kt-lz-strich'); }
  else if (art === 'muehle') { p('M 0 -4.6 a 4.6 4.6 0 1 1 -0.01 0 Z', 'kt-lz-rad'); p('M 0 -4.6 V 4.6 M -4.6 0 H 4.6 M -3.2 -3.2 L 3.2 3.2 M -3.2 3.2 L 3.2 -3.2', 'kt-lz-strich'); }
  else if (art === 'wasser') p('M -6 -2 C -3 -4, -1 0, 2 -2 C 4 -3.4, 5 -2.4, 6 -2 M -6 2 C -3 0, -1 4, 2 2 C 4 0.6, 5 1.6, 6 2', 'kt-lz-welle');
  else if (art === 'acker') { p('M -6 -3.4 h 12 v 6.8 h -12 Z', 'kt-lz-feld'); p('M -3.4 -3.4 V 3.4 M 0 -3.4 V 3.4 M 3.4 -3.4 V 3.4', 'kt-lz-strich'); }
  else if (art === 'wiese') { p('M -6 -3.4 h 12 v 6.8 h -12 Z', 'kt-lz-feld'); p('M -3.4 2 v -2.4 M 0 2.6 v -3 M 3.4 2 v -2.4', 'kt-lz-strich'); }
  else if (art === 'wald') { p('M -6 -3.4 h 12 v 6.8 h -12 Z', 'kt-lz-wald'); p('M -3 1.4 C -1.4 -1, -1.4 -1, -3 -1.6 M 0 1.4 C 1.6 -1, 1.6 -1, 0 -1.6 M 3 1.4 C 4.6 -1, 4.6 -1, 3 -1.6', 'kt-lz-strich'); }
  else if (art === 'hof') { p('M -3.4 -2.4 h 6.8 v 4.8 h -6.8 Z', 'kt-lz-haus'); }
  else if (art === 'insel') { p('M -5 0 C -4 -3, 4 -3.4, 5 0 C 4 2.6, -4 3, -5 0 Z', 'kt-lz-werder'); }
  else p('M -3 -3 h 6 v 6 h -6 Z', 'kt-lz-haus');
  return g;
}

/* ----- Der Marktplatz ----- */
function planMarktZeichnen(markt, welt, saat) {
  const g = kv('g', { class: 'kt-marktleben' });
  if (!markt) return g;
  const dreh = (v) => Math.round(Math.atan2(v[1], v[0]) * 180 / Math.PI);

  /* Das Rathaus: ein längliches Haus mit Stufengiebel und einem
     Glockentürmchen — daran erkennt man es unter allen Häusern. */
  const r = markt.rathaus;
  const gr = kv('g', { class: 'kt-rathaus', transform: 'translate(' + kz(r.punkt[0]) + ' ' + kz(r.punkt[1]) + ') rotate(' + dreh(r.laengs) + ')' });
  const rb = r.breite / 2, rt = r.tiefe / 2;
  gr.append(kv('rect', { x: kz(-rb), y: kz(-rt), width: kz(rb * 2), height: kz(rt * 2), class: 'kt-rathausleib' }));
  gr.append(kv('path', { d: 'M ' + kz(-rb) + ' 0 H ' + kz(rb), class: 'kt-rathausfirst' }));
  /* Stufengiebel an beiden Schmalseiten. */
  for (const seite of [-1, 1]) {
    const x = seite * rb;
    gr.append(kv('path', {
      d: 'M ' + kz(x) + ' ' + kz(-rt) + ' l ' + kz(seite * 2.4) + ' 0 l 0 ' + kz(rt * 0.5) +
         ' l ' + kz(seite * 2) + ' 0 l 0 ' + kz(rt * 0.5),
      class: 'kt-rathausgiebel'
    }));
  }
  gr.append(kv('circle', { cx: 0, cy: 0, r: 2.6, class: 'kt-rathausturm' }));
  g.append(gr);

  /* Der Brunnen: ein Ring mit einem Kreuz darüber — der Galgen, an dem
     der Eimer hängt. */
  const b = markt.brunnen;
  const gb = kv('g', { class: 'kt-brunnen', transform: 'translate(' + kz(b.punkt[0]) + ' ' + kz(b.punkt[1]) + ')' });
  const br = b.gross ? 5.2 : 4;
  gb.append(kv('circle', { cx: 0, cy: 0, r: kz(br), class: 'kt-brunnenring' }));
  gb.append(kv('circle', { cx: 0, cy: 0, r: kz(br * 0.5), class: 'kt-brunnenloch' }));
  gb.append(kv('path', { d: 'M ' + kz(-br) + ' 0 H ' + kz(br) + ' M 0 ' + kz(-br) + ' V ' + kz(br), class: 'kt-brunnengalgen' }));
  g.append(gb);

  /* Der Pranger. */
  if (markt.pranger) {
    const [px, py] = markt.pranger.punkt;
    g.append(kv('path', {
      d: 'M ' + kz(px) + ' ' + kz(py + 3.4) + ' V ' + kz(py - 4.6) + ' M ' + kz(px - 2.4) + ' ' + kz(py - 3.4) + ' H ' + kz(px + 2.4),
      class: 'kt-pranger'
    }));
  }

  /* Die Stände. */
  for (const s of markt.staende) {
    const gs = kv('g', { class: 'kt-stand', transform: 'translate(' + kz(s.punkt[0]) + ' ' + kz(s.punkt[1]) + ') rotate(' + Math.round(dreh(s.laengs) + s.dreh) + ')' });
    gs.append(kv('rect', { x: kz(-s.breite / 2), y: kz(-s.tiefe / 2), width: kz(s.breite), height: kz(s.tiefe), rx: .8, class: 'kt-standdach' }));
    gs.append(kv('path', { d: 'M ' + kz(-s.breite / 2) + ' 0 H ' + kz(s.breite / 2), class: 'kt-standstrich' }));
    g.append(gs);
  }
  return g;
}
