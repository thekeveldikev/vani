/* ===================================================================
   66b — DAS HIMMELSBLATT
   -------------------------------------------------------------------
   Gezeichnet wird eine Himmelskarte, wie sie in einem Atlas des
   siebzehnten Jahrhunderts liegt: die Scheibe des sichtbaren Himmels,
   ein graduierter Rand, die Ekliptik als Band — und darauf die Sterne.

   Zwei Dinge entscheiden darüber, ob es nach Himmel aussieht:

   1. Die Staffelung. Ein Stern ist nicht ein Punkt, sondern eine
      Helligkeit. Die hellen bekommen Strahlen und einen Hof, die
      schwachen sind kaum mehr als ein Korn. Wer alle gleich malt,
      bekommt Konfetti.

   2. Die Milchstraße. Ein Band aus Tausenden zu kleinen Punkten,
      nicht ein aufgemalter Nebel. Deshalb wird sie gestreut, nicht
      gefüllt.
   =================================================================== */

const STERN_NS = 'http://www.w3.org/2000/svg';
function stv(art, attr) {
  const e = document.createElementNS(STERN_NS, art);
  for (const k in attr) if (attr[k] != null) e.setAttribute(k, attr[k]);
  return e;
}
function stz(n) { return Math.round(n * 10) / 10; }

/* Der Blick auf das Blatt — Zoom und was gerade angefasst wird. */
let _st = {
  id: '', zoom: 1, werkzeug: 'schauen', offen: false,
  zieht: null,          /* das Sternbild, an dem gerade gezogen wird */
  imBlick: '',          /* welches Sternbild vorn liegt */
  zeigeNamen: true, zeigeMilch: true, zeigeGitter: true, zeigeSagen: false
};

/* ===================== DAS BLATT ===================== */
function sternSVG(himmel, gebaut, neu) {
  const w = sternWelt(himmel.welt);
  const G = STERN_GROESSE;
  const svg = stv('svg', {
    viewBox: '0 0 ' + G + ' ' + G,
    width: Math.round(G * _st.zoom), height: Math.round(G * _st.zoom),
    class: 'sh-blatt', 'shape-rendering': 'geometricPrecision',
    'data-breite': G, 'data-hoehe': G
  });

  /* --- Der Grund: kein flaches Schwarz, sondern ein Verlauf --- */
  const defs = stv('defs', {});
  const lauf = stv('radialGradient', { id: 'sh-himmelgrund', cx: '50%', cy: '46%', r: '62%' });
  lauf.append(stv('stop', { offset: '0%', 'stop-color': w.grund2 }));
  lauf.append(stv('stop', { offset: '100%', 'stop-color': w.grund }));
  defs.append(lauf);
  /* Ein Hof um die hellsten Sterne. */
  const hof = stv('radialGradient', { id: 'sh-hof' });
  hof.append(stv('stop', { offset: '0%', 'stop-color': w.hell, 'stop-opacity': '.55' }));
  hof.append(stv('stop', { offset: '100%', 'stop-color': w.hell, 'stop-opacity': '0' }));
  defs.append(hof);
  svg.append(defs);

  svg.append(stv('rect', { x: 0, y: 0, width: G, height: G, fill: w.grund }));
  svg.append(stv('circle', { cx: STERN_MITTE, cy: STERN_MITTE, r: STERN_R, fill: 'url(#sh-himmelgrund)' }));

  /* --- Die Milchstraße ---
     Sie ist kein Nebel, den man aufmalt, sondern zu viele Sterne, um sie
     einzeln zu sehen. Also wird sie auch so gezeichnet: als Korn. */
  if (himmel.milchstrasse && _st.zeigeMilch) {
    const g = stv('g', { class: 'sh-milch' });
    let d = '';
    const bandWinkel = sternZufall(himmel.saat, 'bw') * Math.PI;
    const dreh = (himmel.tag - 1) / 365 * Math.PI * 2;
    const kos = Math.cos(bandWinkel + dreh), sin = Math.sin(bandWinkel + dreh);
    const breite = STERN_R * (0.17 + sternZufall(himmel.saat, 'bb') * 0.1);

    /* Unter dem Korn liegt ein weicher Schein.
       Nur gestreute Punkte reichen nicht: das Band war da, aber man sah es
       erst, wenn man die einzelnen Sterne zählte. Am Himmel erkennt man
       die Milchstraße als HELLIGKEIT, bevor man einen einzigen Stern
       darin unterscheidet — der Schein macht genau das. */
    const scheinId = 'sh-milchschein';
    const scheinDef = stv('defs', {});
    const lauf = stv('linearGradient', { id: scheinId, x1: '0', y1: '0', x2: '0', y2: '1' });
    lauf.append(stv('stop', { offset: '0%', 'stop-color': w.milch, 'stop-opacity': '0' }));
    lauf.append(stv('stop', { offset: '50%', 'stop-color': w.milch, 'stop-opacity': '.20' }));
    lauf.append(stv('stop', { offset: '100%', 'stop-color': w.milch, 'stop-opacity': '0' }));
    scheinDef.append(lauf);
    g.append(scheinDef);
    const grad = (bandWinkel + dreh) * 180 / Math.PI;
    g.append(stv('rect', {
      x: stz(STERN_MITTE - STERN_R), y: stz(-breite * 2.2),
      width: stz(STERN_R * 2), height: stz(breite * 4.4),
      fill: 'url(#' + scheinId + ')', class: 'sh-milchschein',
      transform: 'rotate(' + stz(grad) + ' ' + STERN_MITTE + ' ' + STERN_MITTE + ') translate(0 ' + STERN_MITTE + ')'
    }));
    for (let i = 0; i < 2600; i++) {
      const laengs = (sternZufall(himmel.saat, 'ml' + i) * 2 - 1) * STERN_R;
      /* Zur Mitte des Bandes dichter: drei Würfe gemittelt geben eine
         Glocke, und die sieht aus wie ein Band, nicht wie ein Streifen. */
      const q = (sternZufall(himmel.saat, 'mq' + i) + sternZufall(himmel.saat, 'mr' + i) + sternZufall(himmel.saat, 'ms' + i)) / 3;
      const quer = (q * 2 - 1) * breite * 1.9;
      const x = STERN_MITTE + laengs * kos - quer * sin;
      const y = STERN_MITTE + laengs * sin + quer * kos;
      if (Math.hypot(x - STERN_MITTE, y - STERN_MITTE) > STERN_R - 2) continue;
      d += ' M ' + stz(x) + ' ' + stz(y) + ' h .01';
    }
    g.append(stv('path', { d: d.trim(), class: 'sh-milchkorn', stroke: w.milch }));
    svg.append(g);
  }

  /* --- Das Gradnetz: Höhenkreise und Richtungslinien --- */
  if (_st.zeigeGitter) {
    const g = stv('g', { class: 'sh-gitter' });
    for (const anteil of [0.25, 0.5, 0.75]) {
      g.append(stv('circle', { cx: STERN_MITTE, cy: STERN_MITTE, r: stz(STERN_R * anteil), class: 'sh-hoehenkreis', stroke: w.schrift }));
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.append(stv('path', {
        d: 'M ' + stz(STERN_MITTE + Math.cos(a) * STERN_R * 0.08) + ' ' + stz(STERN_MITTE + Math.sin(a) * STERN_R * 0.08) +
           ' L ' + stz(STERN_MITTE + Math.cos(a) * STERN_R) + ' ' + stz(STERN_MITTE + Math.sin(a) * STERN_R),
        class: 'sh-richtstrich', stroke: w.schrift
      }));
    }
    svg.append(g);
  }

  /* --- Die Ekliptik ---
     Der Weg, den Sonne und Mond übers Jahr nehmen. Auf einer Himmelskarte
     ist sie das Band, an dem alles hängt, was mit Jahreszeiten zu tun hat. */
  if (himmel.ekliptik) {
    const g = stv('g', { class: 'sh-ekliptik' });
    const neigung = 0.41;
    let d = '';
    for (let i = 0; i <= 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const r = STERN_R * (0.62 + Math.sin(a * 2) * 0.06);
      const x = STERN_MITTE + Math.cos(a) * r;
      const y = STERN_MITTE + Math.sin(a) * r * (1 - neigung * 0.34);
      d += (i ? ' L ' : 'M ') + stz(x) + ' ' + stz(y);
    }
    g.append(stv('path', { d: d + ' Z', class: 'sh-ekliptiklinie', stroke: w.ekliptik }));
    svg.append(g);
  }

  /* --- Die Sterne ---
     Drei Ebenen: Korn (die vielen), Punkte (die mittleren), und die
     hellen mit Hof und Strahlen. Getrennt, damit die hellen wirklich
     obenauf liegen. */
  const gKorn = stv('g', { class: 'sh-sterne korn' });
  const gMittel = stv('g', { class: 'sh-sterne mittel' });
  const gHell = stv('g', { class: 'sh-sterne hell' });
  let kornPfad = '';

  for (const s of gebaut.sterne) {
    if (s.gr < 0.9) { kornPfad += ' M ' + stz(s.x) + ' ' + stz(s.y) + ' h .01'; continue; }
    /* Der Farbton: bläulich für die heißen, gelblich für die kühlen. Sehr
       zurückhaltend — eine Sternkarte ist kein Farbfoto. */
    const ton = s.ton < 0.16 ? 'kalt' : s.ton > 0.84 ? 'warm' : '';
    if (s.gr < 2.4) {
      gMittel.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 0.52), class: 'sh-stern ' + ton, fill: w.stern }));
      continue;
    }
    /* Die hellen: Hof, Kern, und vier Strahlen — so, wie ein Stecher es
       gemacht hätte, und so, wie das Auge einen hellen Stern sieht. */
    const g = stv('g', { class: 'sh-hellstern ' + ton });
    /* Einen Hof bekommen nur die wirklich hellen. Gab man ihn jedem, der
       über der Schwelle liegt, verschwamm der ganze Himmel. */
    if (s.gr > 3.2) g.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 2.6), fill: 'url(#sh-hof)', class: 'sh-sternhof' }));
    const l = s.gr * 2.2;
    g.append(stv('path', {
      d: 'M ' + stz(s.x - l) + ' ' + stz(s.y) + ' H ' + stz(s.x + l) +
         ' M ' + stz(s.x) + ' ' + stz(s.y - l) + ' V ' + stz(s.y + l),
      class: 'sh-sternstrahl', stroke: w.stern
    }));
    g.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 0.62), class: 'sh-stern gross', fill: w.hell }));
    gHell.append(g);
  }
  gKorn.append(stv('path', { d: kornPfad.trim(), class: 'sh-sternkorn', stroke: w.stern }));
  svg.append(gKorn, gMittel, gHell);

  /* --- Die Sternbilder ---
     Sie liegen ÜBER den Sternen: die Linie gehört dem Menschen, nicht dem
     Himmel, und darf das auch zeigen. */
  const gBilder = stv('g', { class: 'sh-bilder' });
  for (const bild of himmel.sternbilder) {
    const g = stv('g', {
      class: 'sh-bild' + (_st.imBlick === bild.id ? ' imblick' : ''),
      'data-bild': bild.id, tabindex: '0', role: 'button'
    });
    const punkte = bild.sterne.map((n) => gebaut.sterne[n]).filter(Boolean);
    if (!punkte.length) continue;

    for (const [a, b] of bild.linien) {
      const p1 = gebaut.sterne[bild.sterne[a]], p2 = gebaut.sterne[bild.sterne[b]];
      if (!p1 || !p2) continue;
      g.append(stv('path', {
        d: 'M ' + stz(p1.x) + ' ' + stz(p1.y) + ' L ' + stz(p2.x) + ' ' + stz(p2.y),
        class: 'sh-bildlinie', stroke: w.linie
      }));
    }
    /* Ein Ring um jeden Stern, der zum Bild gehört — sonst weiß man
       hinterher nicht mehr, welche Punkte gemeint waren. */
    for (const p of punkte) {
      g.append(stv('circle', { cx: stz(p.x), cy: stz(p.y), r: stz(Math.max(4.5, p.gr * 1.7)), class: 'sh-bildstern', stroke: w.linie }));
    }
    /* Der Name, unter das Bild gesetzt. */
    if (_st.zeigeNamen && bild.name) {
      const m = sternbildMitte(bild, gebaut.sterne);
      const tief = Math.max(...punkte.map((p) => p.y));
      const t = stv('text', { x: stz(m[0]), y: stz(tief + 26), class: 'sh-bildname', 'text-anchor': 'middle', fill: w.schrift });
      t.textContent = bild.name.toUpperCase();
      g.append(t);
      if (_st.zeigeSagen && bild.sage) {
        const u = stv('text', { x: stz(m[0]), y: stz(tief + 42), class: 'sh-bildsage', 'text-anchor': 'middle', fill: w.schrift });
        u.textContent = bild.sage.length > 60 ? bild.sage.slice(0, 58) + '…' : bild.sage;
        g.append(u);
      }
    }
    const titel = stv('title', {});
    titel.textContent = (bild.name || 'Ohne Namen') + ' — ' + bild.sterne.length + ' Sterne';
    g.append(titel);
    gBilder.append(g);
  }
  svg.append(gBilder);

  /* --- Was gerade gezogen wird ---
     Ohne das zieht man blind. Der halbfertige Zug liegt ganz oben: die
     angetippten Sterne bekommen einen Ring, die Linien dazwischen sind
     gestrichelt, und der zuletzt getippte Stern leuchtet auf — er ist
     der, von dem die nächste Linie ausgeht. */
  if (_st.zieht && _st.zieht.sterne.length) {
    const g = stv('g', { class: 'sh-zug' });
    const z = _st.zieht;
    for (const [a, b] of z.linien) {
      const p1 = gebaut.sterne[z.sterne[a]], p2 = gebaut.sterne[z.sterne[b]];
      if (!p1 || !p2) continue;
      g.append(stv('path', {
        d: 'M ' + stz(p1.x) + ' ' + stz(p1.y) + ' L ' + stz(p2.x) + ' ' + stz(p2.y),
        class: 'sh-zuglinie', stroke: w.linie
      }));
    }
    z.sterne.forEach((n, i) => {
      const p = gebaut.sterne[n];
      if (!p) return;
      const letzter = i === z.sterne.length - 1;
      g.append(stv('circle', {
        cx: stz(p.x), cy: stz(p.y), r: stz(letzter ? 11 : 7),
        class: 'sh-zugstern' + (letzter ? ' zuletzt' : ''), stroke: w.linie
      }));
    });
    svg.append(g);
  }

  /* --- Der Rand: Himmelsrichtungen und ein graduiertes Band --- */
  svg.append(sternRandwerk(w, himmel));

  /* --- Die Kartusche mit Titel und Tag --- */
  svg.append(sternKartusche(himmel, w, gebaut));

  return svg;
}

/* ----- Das Randwerk -----
   Ein Kreis mit Gradmarken, die vier Himmelsrichtungen in Versalien, und
   ein Ring, der das Blatt abschließt. */
function sternRandwerk(w, himmel) {
  const g = stv('g', { class: 'sh-randwerk' });
  const G = STERN_GROESSE;

  g.append(stv('circle', { cx: STERN_MITTE, cy: STERN_MITTE, r: stz(STERN_R), class: 'sh-horizont', stroke: w.rand }));
  g.append(stv('circle', { cx: STERN_MITTE, cy: STERN_MITTE, r: stz(STERN_R + 20), class: 'sh-randring', stroke: w.rand }));
  g.append(stv('circle', { cx: STERN_MITTE, cy: STERN_MITTE, r: stz(STERN_R + 34), class: 'sh-randring aussen', stroke: w.rand }));

  /* Dreihundertsechzig Grad, alle zehn ein Strich, alle dreißig ein
     langer. Das ist die Übereinkunft, an der man eine Himmelskarte
     erkennt, noch bevor man die Sterne ansieht. */
  for (let grad = 0; grad < 360; grad += 5) {
    const a = (grad / 180) * Math.PI - Math.PI / 2;
    const lang = grad % 30 === 0 ? 13 : grad % 10 === 0 ? 8 : 4;
    g.append(stv('path', {
      d: 'M ' + stz(STERN_MITTE + Math.cos(a) * (STERN_R + 20)) + ' ' + stz(STERN_MITTE + Math.sin(a) * (STERN_R + 20)) +
         ' L ' + stz(STERN_MITTE + Math.cos(a) * (STERN_R + 20 + lang)) + ' ' + stz(STERN_MITTE + Math.sin(a) * (STERN_R + 20 + lang)),
      class: 'sh-gradstrich', stroke: w.rand
    }));
    if (grad % 30 === 0) {
      const t = stv('text', {
        x: stz(STERN_MITTE + Math.cos(a) * (STERN_R + 40)),
        y: stz(STERN_MITTE + Math.sin(a) * (STERN_R + 40) + 3.4),
        class: 'sh-gradzahl', 'text-anchor': 'middle', fill: w.schrift
      });
      t.textContent = String(grad);
      g.append(t);
    }
  }

  /* Die vier Richtungen. Oben ist Norden — auf einer Himmelskarte für den
     Blick nach oben stimmt das, weil man sie über den Kopf hält. */
  for (const [grad, wort] of [[0, 'NORDEN'], [90, 'OSTEN'], [180, 'SÜDEN'], [270, 'WESTEN']]) {
    const a = (grad / 180) * Math.PI - Math.PI / 2;
    const t = stv('text', {
      x: stz(STERN_MITTE + Math.cos(a) * (STERN_R + 50)),
      y: stz(STERN_MITTE + Math.sin(a) * (STERN_R + 50) + 5),
      class: 'sh-richtung', 'text-anchor': 'middle', fill: w.schrift
    });
    t.textContent = wort;
    g.append(t);
  }
  return g;
}

/* ----- Die Kartusche -----
   Unten am Blatt: wie der Himmel heißt und an welchem Tag er so steht. */
const STERN_MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
function sternDatumText(tag) {
  const grenzen = [31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  let m = 0;
  while (m < 11 && tag > grenzen[m]) m++;
  const vorher = m === 0 ? 0 : grenzen[m - 1];
  return (tag - vorher) + '. ' + STERN_MONATE[m];
}

function sternKartusche(himmel, w, gebaut) {
  const g = stv('g', { class: 'sh-kartusche' });
  /* Die Kartusche sitzt ganz unten, unter der Himmelsrichtung — sonst
     liegt „SÜDEN“ mitten im Titel. */
  const y = STERN_GROESSE - 14;
  const t = stv('text', { x: STERN_MITTE, y: stz(y - 16), class: 'sh-titel', 'text-anchor': 'middle', fill: w.schrift });
  t.textContent = himmel.titel;
  g.append(t);
  const u = stv('text', { x: STERN_MITTE, y: stz(y + 4), class: 'sh-unterzeile', 'text-anchor': 'middle', fill: w.schrift });
  const z = sternZahlen(himmel);
  u.textContent = (himmel.unterzeile ? himmel.unterzeile + '  ·  ' : '') +
    'wie er am ' + sternDatumText(himmel.tag) + ' steht' +
    (z.bilder ? '  ·  ' + z.bilder + (z.bilder === 1 ? ' Sternbild' : ' Sternbilder') : '');
  g.append(u);
  return g;
}

/* ===================== EINEN STERN FINDEN =====================
   Wer auf das Blatt tippt, meint einen Stern — nicht die Stelle. Gesucht
   wird der nächste, und zwar mit einem Vorzug für die hellen: bei zwei
   Sternen nebeneinander meint man fast immer den auffälligeren. */
function sternBei(gebaut, x, y, weite) {
  const grenze = weite || 26;
  let bester = null, nah = Infinity;
  for (const s of gebaut.sterne) {
    const d = Math.hypot(s.x - x, s.y - y);
    if (d > grenze) continue;
    /* Der Helligkeitsbonus: ein heller Stern „zieht“ etwas stärker. */
    const gewicht = d - Math.min(8, s.gr * 2.2);
    if (gewicht < nah) { nah = gewicht; bester = s; }
  }
  return bester;
}

/* Aus einem Zeigerereignis eine Stelle auf dem Blatt machen. */
function sternPunktAus(svg, ev) {
  const r = svg.getBoundingClientRect();
  if (!r.width) return null;
  return {
    x: ((ev.clientX - r.left) / r.width) * STERN_GROESSE,
    y: ((ev.clientY - r.top) / r.height) * STERN_GROESSE
  };
}
