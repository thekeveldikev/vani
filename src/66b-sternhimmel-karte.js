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
  zeigeNamen: true, zeigeMilch: true, zeigeGitter: true, zeigeSagen: false,
  /* Das Fernrohr: wo es steht und ob es aufliegt. */
  rohrAn: false, rohr: null
};

/* ===================== DAS BLATT ===================== */
function sternSVG(himmel, gebaut, neu) {
  const w = sternWelt(himmel.welt);
  const G = STERN_GROESSE;
  /* Bewusst „let“ und nicht „const“: weiter unten wird `svg` auf die
     Himmelsgruppe umgebogen, damit alles Folgende dort hineinwandert und
     das Fernrohr es als Ganzes wiederverwenden kann. */
  let svg = stv('svg', {
    viewBox: '0 0 ' + G + ' ' + G,
    width: Math.round(G * _st.zoom), height: Math.round(G * _st.zoom),
    class: 'sh-blatt', 'shape-rendering': 'geometricPrecision',
    'data-breite': G, 'data-hoehe': G
  });

  /* --- Das Licht ---
     Der erste Wurf hatte harte Kanten: Kreise auf einer flachen Fläche.
     Ein Nachthimmel besteht aber fast nur aus WEICHEM Licht — nichts
     daran hat einen Rand. Deshalb steht hier zuerst eine Handvoll Filter,
     und danach wird alles Leuchtende dadurch gezeichnet.

     Geblurrt wird sparsam: die dreißig hellen Sterne als Gruppe, die
     Nebel, das Milchstraßenband, der Schweif, der Mondhof. Tausend
     einzeln geweichzeichnete Punkte wären unbezahlbar — und unnötig,
     weil die kleinen Sterne ohnehin nur ein Korn sind. */
  const defs = stv('defs', {});

  const filter = (id, stdAbw, dazu) => {
    const f = stv('filter', { id, x: '-60%', y: '-60%', width: '220%', height: '220%',
      'color-interpolation-filters': 'sRGB' });
    if (dazu) {
      f.append(stv('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: String(stdAbw), result: 'unscharf' }));
      const m = stv('feMerge', {});
      m.append(stv('feMergeNode', { in: 'unscharf' }));
      m.append(stv('feMergeNode', { in: 'unscharf' }));
      m.append(stv('feMergeNode', { in: 'SourceGraphic' }));
      f.append(m);
    } else {
      f.append(stv('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: String(stdAbw) }));
    }
    defs.append(f);
  };
  filter('sh-weich', 26);        /* Nebel: so weich, dass kein Rand bleibt */
  filter('sh-halbweich', 9);     /* Milchstraßenband und Schweif */
  filter('sh-glimmen', 2.6, true); /* die hellen Sterne: Kern plus Schein */
  filter('sh-mondlicht', 7);
  /* Ein sanfter Schein für die MITTELKLASSE.
     Der Versuch, das Okular nachträglich glänzen zu lassen, war der
     falsche Weg: was im Glas flach aussah, sah auch draußen flach aus —
     nur kleiner. Die mittleren Sterne hatten schlicht keinen Schein, und
     sie sind das meiste, was man sieht. Hier gehört es hin, dann stimmt
     beides auf einmal. */
  filter('sh-schimmer', 1.15, true);

  /* Der Himmelsgrund. Drei Stufen statt zwei, und die äußerste ist
     dunkler als der Papiergrund: zum Horizont hin steht mehr Luft im Weg,
     und genau das macht die Wölbung, die einen Himmel zum Himmel macht. */
  const lauf = stv('radialGradient', { id: 'sh-himmelgrund', cx: '50%', cy: '44%', r: '68%' });
  lauf.append(stv('stop', { offset: '0%', 'stop-color': w.grund2 }));
  lauf.append(stv('stop', { offset: '52%', 'stop-color': w.grund2, 'stop-opacity': '.55' }));
  lauf.append(stv('stop', { offset: '100%', 'stop-color': w.grund }));
  defs.append(lauf);

  /* Der Saum: ganz außen wird es noch einmal dunkler. Ohne ihn liegt die
     Scheibe flach auf dem Papier. */
  const saum = stv('radialGradient', { id: 'sh-saum' });
  saum.append(stv('stop', { offset: '62%', 'stop-color': '#000', 'stop-opacity': '0' }));
  saum.append(stv('stop', { offset: '92%', 'stop-color': '#000', 'stop-opacity': '.16' }));
  saum.append(stv('stop', { offset: '100%', 'stop-color': '#000', 'stop-opacity': '.34' }));
  defs.append(saum);

  /* Ein Hof um die hellsten Sterne. */
  const hof = stv('radialGradient', { id: 'sh-hof' });
  hof.append(stv('stop', { offset: '0%', 'stop-color': w.hell, 'stop-opacity': '.5' }));
  hof.append(stv('stop', { offset: '45%', 'stop-color': w.hell, 'stop-opacity': '.12' }));
  hof.append(stv('stop', { offset: '100%', 'stop-color': w.hell, 'stop-opacity': '0' }));
  defs.append(hof);
  svg.append(defs);

  svg.append(stv('rect', { x: 0, y: 0, width: G, height: G, fill: w.grund }));

  /* Alles, was zum Himmel gehört, kommt in EINE Gruppe mit einer Kennung.
     Das Fernrohr verwendet sie über <use> noch einmal — verschoben und
     vergrößert. Deshalb kostet das Okular fast nichts, und deshalb kann
     es dem Finger folgen, ohne dass etwas neu gerechnet wird. */
  const allesId = 'sh-alles';
  const alles = stv('g', { id: allesId, class: 'sh-alles' });
  const svgEcht = svg;
  svg = { append: (...k) => alles.append(...k) };

  svg.append(stv('circle', { cx: STERN_MITTE, cy: STERN_MITTE, r: STERN_R, fill: 'url(#sh-himmelgrund)' }));

  /* --- Das Luftleuchten ---
     Ein klarer Nachthimmel ist nirgends gleich dunkel: über dem Horizont
     schimmert es, an anderen Stellen liegt ein kaum wahrnehmbarer Hauch
     Farbe. Drei sehr große, sehr schwache Schwaden — man sieht sie nicht,
     man merkt nur, dass die Fläche lebt. */
  const gLuft = stv('g', { class: 'sh-luftleuchten', filter: 'url(#sh-weich)' });
  for (let i = 0; i < 3; i++) {
    const a = sternZufall(himmel.saat, 'lw' + i) * Math.PI * 2;
    const d = (0.3 + sternZufall(himmel.saat, 'ld' + i) * 0.55) * STERN_R;
    gLuft.append(stv('ellipse', {
      cx: stz(STERN_MITTE + Math.cos(a) * d), cy: stz(STERN_MITTE + Math.sin(a) * d),
      rx: stz(STERN_R * (0.32 + sternZufall(himmel.saat, 'lx' + i) * 0.3)),
      ry: stz(STERN_R * (0.22 + sternZufall(himmel.saat, 'ly' + i) * 0.26)),
      fill: i === 1 ? (w.rot || w.milch) : i === 2 ? (w.kalt || w.milch) : w.milch,
      'fill-opacity': '.055', class: 'sh-luftschwade'
    }));
  }
  svg.append(gLuft);

  /* --- Die Milchstraße ---
     Sie ist kein Nebel, den man aufmalt, sondern zu viele Sterne, um sie
     einzeln zu sehen. Also wird sie auch so gezeichnet: als Korn. */
  if (himmel.milchstrasse && _st.zeigeMilch) {
    const g = stv('g', { class: 'sh-milch' });
    /* Der Schein wird geweichzeichnet, das Korn nicht — sonst wird aus
       den Sternen im Band ein Schleier. */
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
      fill: 'url(#' + scheinId + ')', class: 'sh-milchschein', filter: 'url(#sh-weich)',
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

  /* --- Die Nebel ---
     Sie liegen UNTER den Sternen: was in ihnen steht, soll darin stehen
     und nicht davor. */
  if (gebaut.nebel && gebaut.nebel.length) svg.append(sternNebelZeichnen(gebaut.nebel, w, himmel.saat));

  /* --- Die Sterne ---
     Drei Ebenen: Korn (die vielen), Punkte (die mittleren), und die
     hellen mit Hof und Strahlen. Getrennt, damit die hellen wirklich
     obenauf liegen. */
  const gKorn = stv('g', { class: 'sh-sterne korn' });
  const gMittel = stv('g', { class: 'sh-sterne mittel', filter: 'url(#sh-schimmer)' });
  /* Die hellen Sterne bekommen ihren Schein aus dem Filter, nicht aus
     einem gemalten Kreis: so leuchtet der Kern durch, statt zu verwaschen. */
  const gHell = stv('g', { class: 'sh-sterne hell', filter: 'url(#sh-glimmen)' });
  let kornPfad = '';

  for (const s of gebaut.sterne) {
    if (s.gr < 0.9) { kornPfad += ' M ' + stz(s.x) + ' ' + stz(s.y) + ' h .01'; continue; }
    /* Der Farbton: bläulich für die heißen, gelblich für die kühlen. Sehr
       zurückhaltend — eine Sternkarte ist kein Farbfoto. */
    /* Die Farbe kommt jetzt aus der Temperatur, nicht aus einem
       CSS-Filter: ein Filter dreht den Farbton der ganzen Form, und bei
       einem weißen Stern auf dunklem Grund war davon nichts zu sehen. */
    const farbe = sternFarbe(s.ton, w);
    if (s.gr < 2.4) {
      /* Ab anderthalb bekommt auch ein mittlerer Stern seinen Hof. Das ist
         der Unterschied zwischen Salz auf Papier und einem Himmel. */
      if (s.gr > 1.45) {
        gMittel.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 2.2), fill: 'url(#sh-hof)', class: 'sh-kleinhof' }));
      }
      gMittel.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 0.52), class: 'sh-stern', fill: farbe }));
      continue;
    }
    /* Die hellen: Hof, Kern, und vier Strahlen — so, wie ein Stecher es
       gemacht hätte, und so, wie das Auge einen hellen Stern sieht. */
    const g = stv('g', { class: 'sh-hellstern' });
    /* Einen Hof bekommen nur die wirklich hellen. Gab man ihn jedem, der
       über der Schwelle liegt, verschwamm der ganze Himmel. */
    if (s.gr > 3.2) g.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 2.6), fill: 'url(#sh-hof)', class: 'sh-sternhof' }));
    const l = s.gr * 2.2;
    g.append(stv('path', {
      d: 'M ' + stz(s.x - l) + ' ' + stz(s.y) + ' H ' + stz(s.x + l) +
         ' M ' + stz(s.x) + ' ' + stz(s.y - l) + ' V ' + stz(s.y + l),
      class: 'sh-sternstrahl', stroke: farbe
    }));
    g.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 0.62), class: 'sh-stern gross', fill: w.hell }));
    g.append(stv('circle', { cx: stz(s.x), cy: stz(s.y), r: stz(s.gr * 1.05), class: 'sh-sternsaum', stroke: farbe }));
    gHell.append(g);
  }
  gKorn.append(stv('path', { d: kornPfad.trim(), class: 'sh-sternkorn', stroke: w.stern }));
  svg.append(gKorn, gMittel, gHell);

  /* --- Was wandert ---
     Wandelsterne, Mond und Komet stehen über den Fixsternen: sie sind
     das, was sich bewegt, und das darf man sehen. */
  if (gebaut.wandler && gebaut.wandler.length) svg.append(sternWandlerZeichnen(gebaut.wandler, w));
  if (gebaut.komet) svg.append(sternKometZeichnen(gebaut.komet, w));
  if (gebaut.mond) svg.append(sternMondZeichnen(gebaut.mond, w));

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

  /* Hier endet der Himmel. Was danach kommt — Saum, Randwerk, Kartusche,
     das Fernrohr — gehört zum BLATT, nicht zum Himmel, und darf deshalb
     im Okular nicht noch einmal auftauchen. */
  svgEcht.append(alles);
  svg = svgEcht;

  /* --- Der Saum ---
     Ganz zum Schluss über alles: zum Horizont hin wird es dunkler. Das
     ist keine Zierde, sondern der Grund, warum eine Himmelsscheibe
     gewölbt aussieht statt flach aufgeklebt. */
  svg.append(stv('circle', {
    cx: STERN_MITTE, cy: STERN_MITTE, r: STERN_R,
    fill: 'url(#sh-saum)', class: 'sh-saum'
  }));

  /* Das Fernrohr wird NICHT hier gezeichnet, sondern nachträglich ins
     fertige Blatt gehängt — siehe sternZeichne. Sonst müsste für jeden
     Schub des Okulars der ganze Himmel neu gebaut werden, und das kostete
     dreiundvierzig Millisekunden statt zwei. */

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

/* ===================== DIE NEBEL =====================
   Ein Nebel ist das Gegenteil eines Sterns: kein Punkt, sondern eine
   Stelle, an der das Dunkel weniger dunkel ist. Deshalb wird er in drei
   immer weicheren Lagen gezeichnet, keine davon mit einem Rand — ein
   Nebel mit Kontur ist eine Wolke aus Papier. */
function sternNebelZeichnen(nebel, w, saat) {
  /* Der ganze Nebel geht durch den Weichzeichner. Vorher waren es drei
     Polygone übereinander — mit Kanten, und damit sah es aus wie
     ausgeschnittenes Papier. */
  const g = stv('g', { class: 'sh-nebel', filter: 'url(#sh-weich)' });
  for (const n of nebel) {
    const gr = stv('g', { transform: 'translate(' + stz(n.x) + ' ' + stz(n.y) + ')' });
    const pfad = 'M ' + n.ecken.map((p, i) => (i ? 'L ' : '') + stz(p[0]) + ' ' + stz(p[1])).join(' ') + ' Z';
    for (const [weite, deckung] of [[1.7, 0.05], [1.2, 0.07], [0.75, 0.09]]) {
      gr.append(stv('path', {
        d: pfad, class: 'sh-nebelschicht',
        transform: 'scale(' + weite + ')',
        fill: n.ton > 0.6 ? (w.rot || w.milch) : w.milch,
        'fill-opacity': String(deckung)
      }));
    }
    g.append(gr);
  }
  /* Die eingebetteten Fünkchen kommen NEBEN den Weichzeichner, nicht
     hinein — sonst verschwimmen sie mit und der Nebel bleibt ein Fleck
     ohne Sterne darin. */
  const funken = stv('g', { class: 'sh-nebelfunken' });
  for (const n of nebel) {
    for (let i = 0; i < 11; i++) {
      const a = sternZufall(saat, 'nf' + n.n + '_' + i) * Math.PI * 2;
      const d = Math.sqrt(sternZufall(saat, 'nd' + n.n + '_' + i)) * 30;
      funken.append(stv('circle', {
        cx: stz(n.x + Math.cos(a) * d), cy: stz(n.y + Math.sin(a) * d * 0.8),
        r: stz(0.5 + sternZufall(saat, 'ng' + n.n + '_' + i) * 0.85),
        class: 'sh-nebelfunke', fill: w.hell
      }));
    }
  }
  const zusammen = stv('g', { class: 'sh-nebelwerk' });
  zusammen.append(g, funken);
  return zusammen;
}

/* ===================== DIE WANDELSTERNE =====================
   Sie sehen anders aus als Fixsterne, und das mit Absicht: ein Ring statt
   Strahlen. Am echten Himmel erkennt man sie daran, dass sie nicht
   funkeln — hier daran, dass sie eine Scheibe haben. */
function sternWandlerZeichnen(wandler, w) {
  const g = stv('g', { class: 'sh-wandler' });
  for (const p of wandler) {
    const gr = stv('g', { class: 'sh-wandelstern', 'data-wandler': String(p.n) });
    gr.append(stv('circle', { cx: stz(p.x), cy: stz(p.y), r: stz(p.gr * 3), fill: 'url(#sh-hof)', class: 'sh-sternhof' }));
    gr.append(stv('circle', {
      cx: stz(p.x), cy: stz(p.y), r: stz(p.gr * 0.95),
      class: 'sh-wandelscheibe', fill: sternFarbe(p.ton, w)
    }));
    gr.append(stv('circle', {
      cx: stz(p.x), cy: stz(p.y), r: stz(p.gr * 2.1),
      class: 'sh-wandelring', stroke: sternFarbe(p.ton, w)
    }));
    const t = stv('title', {});
    t.textContent = p.name + ' — ' + p.sage;
    gr.append(t);
    g.append(gr);
  }
  return g;
}

/* ===================== DER MOND =====================
   Die Phase wird nicht als Sichel gemalt, sondern so, wie sie entsteht:
   eine helle Scheibe, über die ein Schatten liegt. Der Schatten ist eine
   Ellipse, die von voll bis flach zusammenläuft — genau das macht aus
   dem Halbmond einen Halbmond und nicht ein halbiertes Rund. */
function sternMondZeichnen(mond, w) {
  const g = stv('g', { class: 'sh-mond' });
  const r = 23;
  const id = 'sh-mondschatten';

  /* Die Phase.
     Der erste Versuch legte bei Vollmond einen Schattenkreis genau auf den
     Mond — und löschte ihn damit aus. Es sah aus wie eine graue Münze.

     Richtig geht es so: `k` ist der Kosinus der Phase und läuft von +1
     (Neumond) über 0 (Halbmond) bis −1 (Vollmond). Der Terminator, also
     die Grenze zwischen Tag und Nacht auf dem Mond, ist von hier aus
     gesehen eine ELLIPSE mit der halben Breite r·|k| — bei Halbmond wird
     sie zur geraden Linie, bei Voll- und Neumond zum vollen Kreis.

     Ist weniger als die Hälfte beleuchtet (k > 0), schneidet die Ellipse
     aus der hellen Seite heraus; ist mehr als die Hälfte beleuchtet
     (k < 0), legt sie hell dazu. Diese eine Fallunterscheidung ist der
     ganze Trick, und ohne sie wird jede Sichel falsch. */
  const k = Math.cos(mond.phase * Math.PI * 2);
  const zunehmend = mond.phase < 0.5;
  const hellRechts = zunehmend;

  const defs = stv('defs', {});
  const maske = stv('mask', { id, maskUnits: 'userSpaceOnUse' });
  maske.append(stv('rect', { x: stz(mond.x - r * 1.6), y: stz(mond.y - r * 1.6), width: stz(r * 3.2), height: stz(r * 3.2), fill: '#000' }));
  maske.append(stv('circle', { cx: stz(mond.x), cy: stz(mond.y), r: stz(r), fill: '#fff' }));
  /* Die dunkle Hälfte abdecken … */
  maske.append(stv('rect', {
    x: stz(hellRechts ? mond.x - r * 1.2 : mond.x), y: stz(mond.y - r * 1.2),
    width: stz(r * 1.2), height: stz(r * 2.4), fill: '#000'
  }));
  /* … und den Terminator formen. */
  maske.append(stv('ellipse', {
    cx: stz(mond.x), cy: stz(mond.y), rx: stz(Math.abs(k) * r), ry: stz(r),
    fill: k > 0 ? '#000' : '#fff'
  }));
  defs.append(maske);
  g.append(defs);

  /* Der Hof liegt unter allem und ist so hell wie die Phase: ein Neumond
     leuchtet nicht. */
  g.append(stv('circle', {
    cx: stz(mond.x), cy: stz(mond.y), r: stz(r * 3.4),
    fill: 'url(#sh-hof)', class: 'sh-mondhof', filter: 'url(#sh-mondlicht)',
    opacity: (0.25 + mond.voll * 0.75).toFixed(2)
  }));
  /* Auch bei Neumond ist der Mond da — man sieht ihn nur nicht. Ein
     hauchfeiner Ring sagt das. */
  g.append(stv('circle', { cx: stz(mond.x), cy: stz(mond.y), r: stz(r), class: 'sh-mondrund', stroke: w.schrift }));

  const hell = stv('g', { mask: 'url(#' + id + ')' });
  hell.append(stv('circle', { cx: stz(mond.x), cy: stz(mond.y), r: stz(r), class: 'sh-mondhell', fill: w.hell }));
  /* Die Meere — sonst ist es eine Münze. Und ein Saum am Rand: zum Rand
     hin steht die Sonne flacher, dort ist es dunkler. */
  for (const [dx, dy, rr] of [[-7, -5, 6], [4, 3, 8], [-3, 8, 4.5], [9, -7, 3.5], [1, -9, 3]]) {
    hell.append(stv('ellipse', {
      cx: stz(mond.x + dx), cy: stz(mond.y + dy), rx: stz(rr), ry: stz(rr * 0.78),
      class: 'sh-mondmeer'
    }));
  }
  hell.append(stv('circle', { cx: stz(mond.x), cy: stz(mond.y), r: stz(r), class: 'sh-mondsaum' }));
  g.append(hell);

  const t = stv('title', {});
  t.textContent = 'Der Mond — ' + mond.name;
  g.append(t);
  return g;
}

/* ===================== DER KOMET =====================
   Der Schweif zeigt IMMER von der Sonne weg. Das ist die eine Regel, an
   der man einen falsch gezeichneten Kometen sofort erkennt — und sie
   kostet nichts, wenn man sie kennt. */
function sternKometZeichnen(komet, w) {
  const g = stv('g', { class: 'sh-komet' });
  const grad = komet.schweif * 180 / Math.PI;
  const gr = stv('g', { transform: 'translate(' + stz(komet.x) + ' ' + stz(komet.y) + ') rotate(' + stz(grad) + ')' });
  /* Der Schweif fächert auf und wird nach hinten durchsichtig. */
  const defs = stv('defs', {});
  const lauf = stv('linearGradient', { id: 'sh-schweif', x1: '0', y1: '0', x2: '1', y2: '0' });
  lauf.append(stv('stop', { offset: '0%', 'stop-color': w.hell, 'stop-opacity': '.5' }));
  lauf.append(stv('stop', { offset: '100%', 'stop-color': w.hell, 'stop-opacity': '0' }));
  defs.append(lauf);
  g.append(defs);
  const l = komet.laenge;
  gr.append(stv('path', {
    d: 'M 0 -3 Q ' + stz(l * 0.5) + ' ' + stz(-l * 0.16) + ' ' + stz(l) + ' ' + stz(-l * 0.3) +
       ' L ' + stz(l) + ' ' + stz(l * 0.3) + ' Q ' + stz(l * 0.5) + ' ' + stz(l * 0.16) + ' 0 3 Z',
    fill: 'url(#sh-schweif)', class: 'sh-kometschweif', filter: 'url(#sh-halbweich)'
  }));
  gr.append(stv('circle', { cx: 0, cy: 0, r: 9, fill: 'url(#sh-hof)', class: 'sh-sternhof' }));
  gr.append(stv('circle', { cx: 0, cy: 0, r: 2.6, class: 'sh-kometkern', fill: w.hell }));
  g.append(gr);
  const t = stv('title', {});
  t.textContent = komet.name;
  g.append(t);
  return g;
}

/* ===================== DAS FERNROHR =====================
   Ein Okular, das über den Himmel fährt. Es vergrößert nicht nur — es
   zeigt MEHR: Sterne, die mit bloßem Auge nicht dastehen.

   Das ist der eigentliche Grund, warum ein Fernrohr etwas anderes ist als
   ein Zoom. Wer hindurchsieht, findet Dinge, die vorher nicht da waren:
   ein Haufen löst sich in einzelne Sterne auf, ein schwacher Doppelstern
   wird zu zweien, und zwischen den bekannten stehen plötzlich hundert
   weitere.

   Technisch: der ganze Himmel steht einmal als Gruppe im Blatt und wird
   im Okular über <use> noch einmal verwendet, verschoben und vergrößert.
   Das kostet fast nichts — und deshalb kann das Okular dem Finger folgen,
   ohne dass irgendetwas neu gerechnet wird. */

const STERN_ROHR_R = 168;         /* der Halbmesser des Okulars auf dem Blatt */
const STERN_ROHR_V = 3.4;         /* wie stark es vergrößert */

/* Die Sterne, die erst im Fernrohr auftauchen.
   Sie gehören zum Himmel wie die anderen — sie sind nur zu schwach, um
   ohne Glas gezeichnet zu werden. Darum stehen sie in einer eigenen
   Rechnung mit eigener Saat und werden nur dort gezeichnet, wo das Okular
   gerade steht. */
function sternRohrfeld(himmel) {
  const saat = himmel.saat;
  const wieViele = Math.round(sternDichte(himmel.dichte)[2] * 2.6);
  const sterne = [];
  for (let i = 0; i < wieViele; i++) {
    const w = sternZufall(saat, 'rw' + i) * Math.PI * 2;
    const r = Math.sqrt(sternZufall(saat, 'rr' + i)) * STERN_R;
    sterne.push({
      n: i, w, r,
      /* Alle schwach — sonst wären sie ja schon zu sehen. */
      gr: 0.22 + sternZufall(saat, 'rg' + i) * 0.34,
      ton: sternZufall(saat, 'rt' + i)
    });
  }
  return sterne;
}

/* Was steht gerade unter dem Okular? Die Auskunft macht aus dem Blick
   eine Beobachtung. */
function sternRohrBefund(himmel, gebaut, x, y, rohrfeld) {
  const weite = STERN_ROHR_R / STERN_ROHR_V;
  const nah = [];
  for (const b of himmel.sternbilder) {
    const m = sternbildMitte(b, gebaut.sterne);
    if (!m) continue;
    const d = Math.hypot(m[0] - x, m[1] - y);
    if (d < weite * 2.2) nah.push({ was: b.name || 'ein Sternbild', d });
  }
  for (const p of gebaut.wandler || []) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < weite) nah.push({ was: p.name, d });
  }
  if (gebaut.mond) {
    const d = Math.hypot(gebaut.mond.x - x, gebaut.mond.y - y);
    if (d < weite + 30) nah.push({ was: 'der Mond', d });
  }
  if (gebaut.komet) {
    const d = Math.hypot(gebaut.komet.x - x, gebaut.komet.y - y);
    if (d < weite + 30) nah.push({ was: gebaut.komet.name, d });
  }
  for (const n of gebaut.nebel || []) {
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < weite) nah.push({ was: 'ein Nebel', d });
  }
  nah.sort((a, b) => a.d - b.d);
  let gezaehlt = 0;
  for (const s of gebaut.sterne || []) if (Math.hypot(s.x - x, s.y - y) < weite) gezaehlt++;
  /* Im Befund muessen auch die Sterne stehen, die erst das Glas sichtbar
     macht. Vorher meldete die Gravur am Okular z. B. 105 Sterne, die Karte
     darunter aber nur 13 — beide zaehlten unterschiedliche Himmel. */
  for (const s of rohrfeld || []) {
    const [sx, sy] = Number.isFinite(s.x) && Number.isFinite(s.y) ? [s.x, s.y] : sternStelle(s, himmel.tag);
    if (Math.hypot(sx - x, sy - y) < weite) gezaehlt++;
  }
  return {
    nah: nah.slice(0, 3).map((n) => n.was),
    sterne: gezaehlt,
    richtung: sternRichtung(x, y),
    hoehe: sternHoehe(x, y)
  };
}

/* Das Okular selbst. */
function sternFernrohrZeichnen(himmel, gebaut, w, allesId, rohrfeld) {
  const rohr = _st.rohr || { x: STERN_MITTE, y: STERN_MITTE };
  const g = stv('g', { class: 'sh-fernrohr' });
  const R = STERN_ROHR_R;
  const V = STERN_ROHR_V;
  const id = 'sh-okular';

  const defs = stv('defs', {});
  const clip = stv('clipPath', { id });
  clip.append(stv('circle', { cx: stz(rohr.x), cy: stz(rohr.y), r: stz(R) }));
  defs.append(clip);
  /* Zum Rand des Okulars hin wird es dunkler — jedes Fernrohr vignettiert,
     und ohne das sieht der Ausschnitt aus wie ein Loch im Papier. */
  const saum = stv('radialGradient', { id: 'sh-okularsaum' });
  saum.append(stv('stop', { offset: '55%', 'stop-color': '#000', 'stop-opacity': '0' }));
  saum.append(stv('stop', { offset: '88%', 'stop-color': '#000', 'stop-opacity': '.22' }));
  saum.append(stv('stop', { offset: '100%', 'stop-color': '#000', 'stop-opacity': '.62' }));
  defs.append(saum);
  g.append(defs);

  /* Der Grund unter dem Okular: sonst schiene der Himmel durch. */
  g.append(stv('circle', { cx: stz(rohr.x), cy: stz(rohr.y), r: stz(R), fill: w.grund, class: 'sh-okulargrund' }));

  const drin = stv('g', { 'clip-path': 'url(#' + id + ')' });
  /* Der ganze Himmel noch einmal — verschoben, sodass die Stelle unter dem
     Okular in dessen Mitte liegt, und vergrößert. */
  const t = 'translate(' + stz(rohr.x) + ' ' + stz(rohr.y) + ') scale(' + V + ') translate(' + stz(-rohr.x) + ' ' + stz(-rohr.y) + ')';
  const kopie = stv('use', { href: '#' + allesId, transform: t });
  kopie.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + allesId);
  drin.append(kopie);

  /* Und das, was erst im Glas sichtbar wird. Gezeichnet wird nur, was
     wirklich ins Okular fällt — alles andere wäre verschenkte Arbeit. */
  const weite = R / V + 6;
  const feld = rohrfeld || sternRohrfeld(himmel);
  const zusatz = stv('g', { class: 'sh-rohrsterne', transform: t });
  let d = '';
  let wieViele = 0;
  for (const s of gebaut.sterne || []) {
    if (Math.hypot(s.x - rohr.x, s.y - rohr.y) < R / V) wieViele++;
  }
  for (const s of feld) {
    const [x, y] = Number.isFinite(s.x) && Number.isFinite(s.y) ? [s.x, s.y] : sternStelle(s, himmel.tag);
    const abstand = Math.hypot(x - rohr.x, y - rohr.y);
    if (abstand > weite) continue;
    if (abstand < R / V) wieViele++;
    if (s.gr < 0.34) { d += ' M ' + stz(x) + ' ' + stz(y) + ' h .01'; continue; }
    /* Die kräftigeren unter den Fernrohrsternen bekommen einen Hof — im
       Glas sammelt sich das Licht, und genau das soll man sehen. */
    if (s.gr > 0.46) {
      zusatz.append(stv('circle', { cx: stz(x), cy: stz(y), r: stz(s.gr * 3.4), fill: 'url(#sh-hof)', class: 'sh-rohrhof' }));
    }
    zusatz.append(stv('circle', { cx: stz(x), cy: stz(y), r: stz(s.gr * 0.62), fill: sternFarbe(s.ton, w), class: 'sh-rohrstern' }));
  }
  if (d) zusatz.append(stv('path', { d: d.trim(), class: 'sh-rohrkorn', stroke: w.stern }));
  drin.append(zusatz);
  g.append(drin);

  /* Das Fadenkreuz: fein, unterbrochen, mit einem freien Kreis in der
     Mitte — man will sehen, worauf man zielt, nicht ein Kreuz darüber. */
  const kreuz = stv('g', { class: 'sh-fadenkreuz' });
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    kreuz.append(stv('path', {
      d: 'M ' + stz(rohr.x + dx * 16) + ' ' + stz(rohr.y + dy * 16) +
         ' L ' + stz(rohr.x + dx * (R - 26)) + ' ' + stz(rohr.y + dy * (R - 26)),
      class: 'sh-kreuzstrich', stroke: w.rand
    }));
  }
  kreuz.append(stv('circle', { cx: stz(rohr.x), cy: stz(rohr.y), r: 16, class: 'sh-kreuzring', stroke: w.rand }));
  g.append(kreuz);

  /* Der Saum im Glas. */
  g.append(stv('circle', { cx: stz(rohr.x), cy: stz(rohr.y), r: stz(R), fill: 'url(#sh-okularsaum)', class: 'sh-okularsaum' }));

  /* Die Fassung: zwei Messingringe und ein Griff, an dem man zieht. */
  g.append(stv('circle', { cx: stz(rohr.x), cy: stz(rohr.y), r: stz(R), class: 'sh-okularglas', stroke: w.rand }));
  g.append(stv('circle', { cx: stz(rohr.x), cy: stz(rohr.y), r: stz(R + 9), class: 'sh-okularfassung', stroke: w.rand }));
  /* Feine Riffelung auf der Fassung — daran erkennt man Messing. */
  /* Eine einzige Kontur statt 72 einzelner SVG-Knoten. Das sieht gleich aus,
     spart aber bei jeder Fingerbewegung sehr viel DOM-Arbeit. */
  let riffel = '';
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    riffel += 'M ' + stz(rohr.x + Math.cos(a) * (R + 4)) + ' ' + stz(rohr.y + Math.sin(a) * (R + 4)) +
      ' L ' + stz(rohr.x + Math.cos(a) * (R + 9)) + ' ' + stz(rohr.y + Math.sin(a) * (R + 9)) + ' ';
  }
  g.append(stv('path', { d: riffel.trim(), class: 'sh-okularriffel', stroke: w.rand }));

  /* Die Vergrößerung steht unten an der Fassung, wie eingraviert. */
  const zahl = stv('text', {
    x: stz(rohr.x), y: stz(rohr.y + R + 26), class: 'sh-okularzahl',
    'text-anchor': 'middle', fill: w.schrift
  });
  zahl.textContent = STERN_ROHR_V.toFixed(1).replace('.', ',') + '×  ·  ' + wieViele + ' Sterne im Glas';
  g.append(zahl);

  return g;
}
