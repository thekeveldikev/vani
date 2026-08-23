/* ===================== 63b — DER TEPPICH, AUFGEHÄNGT =====================
   Ein gewebtes Tuch in einem schweren Rahmen. Oben und unten läuft ein
   heller Streifen mit einem Spruch in Versalien. Auf dem Tuch: helle Äste,
   die von unten links aufsteigen, Eichenlaub daran, und auf jedem Ast ein
   Band mit einem Namen darauf.

   Keine Bilder. Ein Name auf einem Band, daneben ein geritztes Zeichen, wenn
   man eines geben will — mehr braucht es nicht, und mehr legt auch nichts
   fest.

   Alles wird als SVG gezeichnet: das bleibt scharf, wenn man hineinzoomt,
   lässt sich anfassen, und ein Ast ist wirklich eine Kurve und keine
   gedrehte Kiste. */

const TEP_SPALTE = 300;     /* Breite einer Generation in Bildpunkten */
const TEP_REIHE = 118;      /* Höhe einer Namensreihe — hoch genug, dass ein
                               Zeichen über dem Band nicht in die Reihe
                               darüber ragt, und ein Brandloch erst recht nicht */
const TEP_RAND_X = 230;
const TEP_RAND_Y = 150;
const TEP_BAND_B = 168;     /* Mindestbreite eines Namensbands */
const TEP_BAND_H = 30;

/* Wie breit das Band einer Person wirklich wird. Die Äste müssen es wissen,
   sonst laufen sie bei langen Namen mitten durch die Schrift. */
function teppichBandBreite(person) {
  const n = (teppichName(person) || 'ohne Namen').toUpperCase();
  return Math.max(TEP_BAND_B, Math.min(340, n.length * 6.6 + 26));
}

let _tep = {
  id: '', zoom: 1, suche: '', stumm: [], nurPerson: '', werkzeug: 'zeigen',
  laub: true, wind: true, tiere: true
};

/* ================= DER RAUM DES WERKZEUGS ================= */
function stammbaumWerkzeug(zurueck) {
  const baeume = stammbaeume();
  const buehne = el('div', { class: 'stb-werkzeug' });

  const zeichne = () => {
    const liste = stammbaeume();
    buehne.innerHTML = '';
    anfuegen(buehne,
      el('div', { class: 'stb-wkopf' },
        el('button', { class: 'stb-zurueck', onclick: () => { if (zurueck) zurueck(); } }, '‹ Kabinett'),
        el('div', { class: 'stb-wtitel' }, el('b', {}, 'Der Wandteppich'),
          el('small', {}, 'Ein Stammbaum, der auch die Fäden kennt, die keine Familie sind.')),
        el('button', { class: 'knopf voll', onclick: () => stammbaumNeu((id) => { zeichne(); teppichOeffnen(id); }) }, 'Einen weben')),
      liste.length
        ? el('div', { class: 'stb-regal' }, ...liste.map((b, i) => stammbaumKachel(b, i, zeichne)))
        : el('div', { class: 'stb-leer' },
          el('div', { class: 'stb-leerbild', html: teppichLeerBild() }),
          el('b', {}, 'Noch hängt keiner an der Wand.'),
          el('p', {}, 'Ein Wandteppich ist kein Formular. Fang mit einem Namen an, häng einen zweiten daneben und spinn einen Faden dazwischen — der Baum ordnet sich von allein.'),
          el('button', { class: 'knopf voll', onclick: () => stammbaumNeu((id) => { zeichne(); teppichOeffnen(id); }) }, 'Den ersten weben')));
  };
  zeichne();
  return buehne;
}

function stammbaumKachel(doc, i, neu) {
  const baum = saubererStammbaum(doc);
  const z = teppichZahlen(baum);
  const stoff = teppichStoff(baum.stoff);
  return el('button', {
    class: 'stb-kachel', style: '--tuch:' + stoff[2] + ';--tuch2:' + stoff[3] + ';--n:' + Math.min(i, 20),
    onclick: () => teppichOeffnen(doc.id)
  },
    el('span', { class: 'stb-k-tuch' }, el('i', { class: 'stb-k-ast' }), el('i', { class: 'stb-k-ast zwei' })),
    el('span', { class: 'stb-k-band' }, baum.titel || 'Ohne Titel'),
    el('span', { class: 'stb-k-zahlen' },
      z.leute + (z.leute === 1 ? ' Name' : ' Namen'),
      z.faeden ? '  ·  ' + z.faeden + (z.faeden === 1 ? ' Faden' : ' Fäden') : '',
      z.generationen > 1 ? '  ·  ' + z.generationen + ' Generationen' : ''),
    el('i', { class: 'stb-k-rahmen' }));
}

function stammbaumNeu(danach) {
  const doc = neuDoc('stammbaum', Object.assign({ titel: '' }, saubererStammbaum({ titel: '' })));
  teppichEinstellungen(doc, () => { if (danach) danach(doc.id); }, true);
}

function teppichLeerBild() {
  return '<svg viewBox="0 0 120 80" width="150" height="100" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
    '<path d="M12 74 C 20 60 26 52 38 44 C 50 36 58 30 74 24"/>' +
    '<path d="M38 44 C 44 36 52 34 64 36"/><path d="M50 39 C 54 30 60 26 70 24"/>' +
    '<path d="M26 55 C 30 48 36 46 44 47"/>' +
    '<ellipse cx="76" cy="22" rx="5" ry="3.4"/><ellipse cx="66" cy="37" rx="4.4" ry="3"/><ellipse cx="46" cy="48" rx="4" ry="2.8"/>' +
    '</svg>';
}

/* ================= DEN TEPPICH AUFSCHLAGEN ================= */
function teppichOeffnen(id) {
  const doc = D.docs.get(id);
  if (!doc || doc.typ !== 'stammbaum' || doc.geloescht) { toast('Der Wandteppich ist nicht mehr da.'); return; }
  _tep.id = id;
  if (!_tep.zoom || !Number.isFinite(_tep.zoom)) _tep.zoom = 1;

  const flaeche = el('div', { class: 'tep-flaeche' });
  /* Das fallende Laub liegt in einer eigenen Scheibe UEBER dem Tuch, nicht
     darin. Lag es im scrollenden Bereich, machte jedes Blatt die Flaeche
     groesser und der Teppich bekam Rollraum, den es gar nicht gab. */
  const laubscheibe = el('div', { class: 'tep-laubfall', 'aria-hidden': 'true' });
  const buehnenkasten = el('div', { class: 'tep-buehne' }, flaeche, laubscheibe);
  const rahmen = el('div', { class: 'tep-rahmen' },
    el('div', { class: 'tep-randband oben' }),
    buehnenkasten,
    el('div', { class: 'tep-randband unten' }));
  const kasten = el('div', { class: 'tep-fenster' }, el('div', { class: 'tep-leiste' }), rahmen);
  const zu = zeigeDeck(kasten, () => { document.removeEventListener('keydown', taste); teppichAnimationenAus(); });

  const neu = () => teppichZeichne(kasten, flaeche, rahmen, neu, zu);
  const taste = (ev) => {
    if (!kasten.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 1) return;
    if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); teppichZoom(0.2, flaeche, neu); }
    else if (ev.key === '-' || ev.key === '_') { ev.preventDefault(); teppichZoom(-0.2, flaeche, neu); }
    else if (ev.key === '0') { ev.preventDefault(); _tep.zoom = 1; neu(); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); teppichPersonNeu(D.docs.get(_tep.id), '', neu); }
    else if (ev.key === 'v' || ev.key === 'V') { ev.preventDefault(); teppichVerzeichnis(D.docs.get(_tep.id), neu); }
  };
  document.addEventListener('keydown', taste);
  neu();
}

function teppichZoom(delta, flaeche, neu) {
  const alt = _tep.zoom;
  _tep.zoom = Math.max(0.3, Math.min(2.4, Math.round((alt + delta) * 20) / 20));
  if (_tep.zoom === alt) return;
  /* Die Mitte des Blicks soll die Mitte bleiben, sonst rutscht der Teppich
     bei jedem Zoomen unter dem Finger weg. */
  const mx = flaeche ? (flaeche.scrollLeft + flaeche.clientWidth / 2) / alt : 0;
  const my = flaeche ? (flaeche.scrollTop + flaeche.clientHeight / 2) / alt : 0;
  neu();
  if (flaeche) {
    flaeche.scrollLeft = mx * _tep.zoom - flaeche.clientWidth / 2;
    flaeche.scrollTop = my * _tep.zoom - flaeche.clientHeight / 2;
  }
}

function teppichZeichne(kasten, flaeche, rahmen, neu, schliessen) {
  const doc = D.docs.get(_tep.id);
  if (!doc) { schliessen(); return; }
  const baum = saubererStammbaum(doc);
  const stoff = teppichStoff(baum.stoff);
  const ordnung = teppichOrdnung(baum);

  kasten.style.setProperty('--tuch', stoff[2]);
  kasten.style.setProperty('--tuch2', stoff[3]);
  /* Auch die Flaeche um das Tuch herum bekommt den Stoff — sonst sitzt ein
     kleiner Baum auf einem dunklen Loch statt auf einer Wand. */
  flaeche.style.setProperty('--tuch', stoff[2]);
  flaeche.style.setProperty('--tuch2', stoff[3]);

  /* --- Die Leiste oben --- */
  const leiste = kasten.querySelector('.tep-leiste');
  leiste.innerHTML = '';
  anfuegen(leiste, ...teppichLeisteInhalt(doc, baum, ordnung, flaeche, neu, schliessen));

  /* --- Das Randband --- */
  const spruch = (baum.spruch || baum.titel || 'STIRPS NOBILIS').toUpperCase();
  const bandText = new Array(14).fill(spruch).join('  ◆  ');
  for (const b of rahmen.querySelectorAll('.tep-randband')) {
    b.innerHTML = '';
    b.append(el('span', {}, bandText));
  }

  /* --- Das Tuch --- */
  const scrollL = flaeche.scrollLeft, scrollT = flaeche.scrollTop, warSchon = flaeche.dataset.gemalt === _tep.id;
  flaeche.innerHTML = '';
  flaeche.dataset.gemalt = _tep.id;
  const svg = teppichSVG(doc, baum, ordnung, neu);
  flaeche.append(svg);

  if (warSchon) { flaeche.scrollLeft = scrollL; flaeche.scrollTop = scrollT; }
  else {
    /* Beim ersten Aufschlagen auf den Stamm blicken — unten links. */
    setTimeout(() => { flaeche.scrollLeft = 0; flaeche.scrollTop = Math.max(0, flaeche.scrollHeight - flaeche.clientHeight); }, 0);
  }
  teppichAnimationenAn(flaeche, svg, baum);
}

/* ----- Die Leiste ----- */
function teppichLeisteInhalt(doc, baum, ordnung, flaeche, neu, schliessen) {
  const z = teppichZahlen(baum);
  const suchfeld = el('input', { type: 'search', class: 'tep-suchfeld', placeholder: 'Namen suchen …', value: _tep.suche });
  suchfeld.addEventListener('input', entprellt(() => {
    _tep.suche = suchfeld.value; neu();
    setTimeout(() => { const f = document.querySelector('.tep-suchfeld'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0);
  }, 240, true));

  const arten = teppichSichtbareArten(baum);
  return [
    el('div', { class: 'tep-lzeile' },
      el('div', { class: 'tep-ltitel' },
        el('b', {}, baum.titel || 'Ohne Titel'),
        el('small', {}, z.leute + (z.leute === 1 ? ' Name' : ' Namen') + '  ·  ' + z.faeden + (z.faeden === 1 ? ' Faden' : ' Fäden') +
          (z.inseln > 1 ? '  ·  ' + z.inseln + ' getrennte Zweige' : ''))),
      el('div', { class: 'tep-lwerkzeug' }, el('span', { class: 'tep-lupe', html: ik('suche') }), suchfeld),
      el('div', { class: 'tep-lknoepfe' },
        el('button', { class: 'tep-wk', title: 'Kleiner (−)', onclick: () => teppichZoom(-0.2, flaeche, neu) }, '−'),
        el('button', { class: 'tep-wk zahl', title: 'Wieder auf Normalgröße (0)', onclick: () => { _tep.zoom = 1; neu(); } }, Math.round(_tep.zoom * 100) + '%'),
        el('button', { class: 'tep-wk', title: 'Größer (+)', onclick: () => teppichZoom(0.2, flaeche, neu) }, '+'),
        el('button', { class: 'tep-wk', title: 'Alles ins Bild', onclick: () => teppichEinpassen(flaeche, neu) }, '⤢'),
        el('span', { class: 'tep-ltrenner' }),
        el('button', { class: 'knopf zart klein', title: 'Alle Namen und Fäden (v)', onclick: () => teppichVerzeichnis(doc, neu) }, 'Verzeichnis'),
        el('button', { class: 'knopf zart klein', title: 'Tuch, Spruch, Titel', onclick: () => teppichEinstellungen(doc, neu) }, 'Der Rahmen'),
        el('button', { class: 'knopf voll klein', title: 'Einen Namen aufhängen (n)', onclick: () => teppichPersonNeu(doc, '', neu) }, '+ Name'),
        el('button', { class: 'tep-zuknopf', title: 'Den Teppich abhängen', onclick: () => schliessen() }, '×'))),
    arten.length ? el('div', { class: 'tep-legende' },
      ...arten.map((a) => el('button', {
        class: 'tep-lg' + (_tep.stumm.includes(a.id) ? ' stumm' : ''),
        style: '--fadenfarbe:' + a.farbe,
        title: _tep.stumm.includes(a.id) ? 'Wieder zeigen' : 'Diese Fäden ausblenden',
        onclick: () => {
          _tep.stumm = _tep.stumm.includes(a.id) ? _tep.stumm.filter((x) => x !== a.id) : _tep.stumm.concat([a.id]);
          neu();
        }
      }, el('i', { class: 'strich-' + a.strich }), a.name, el('small', {}, String(a.anzahl)))),
      _tep.stumm.length ? el('button', { class: 'tep-lgalle', onclick: () => { _tep.stumm = []; neu(); } }, 'alle zeigen') : null,
      _tep.nurPerson ? el('button', { class: 'tep-lgalle', onclick: () => { _tep.nurPerson = ''; neu(); } }, 'nicht mehr nur eine Person') : null) : null
  ];
}

function teppichSichtbareArten(baum) {
  const zaehler = new Map();
  for (const f of baum.faeden) zaehler.set(f.art, (zaehler.get(f.art) || 0) + 1);
  return [...zaehler.entries()].map(([id, anzahl]) => {
    const a = fadenArt(id, baum);
    return { id, name: a.name, farbe: a.farbe, strich: a.strich, gruppe: a.gruppe, anzahl };
  }).sort((a, b) => {
    const ga = FADEN_GRUPPEN.findIndex((g) => g[0] === a.gruppe), gb = FADEN_GRUPPEN.findIndex((g) => g[0] === b.gruppe);
    return (ga < 0 ? 99 : ga) - (gb < 0 ? 99 : gb) || b.anzahl - a.anzahl;
  });
}

/* Alles ins Bild. Zweimal gerechnet: nach dem ersten Neuzeichnen aendert
   sich die Flaeche noch (ein Rollbalken kommt oder geht), und dann waere das
   Mass schief. */
function teppichEinpassen(flaeche, neu) {
  const messen = () => {
    const svg = flaeche.querySelector('svg');
    if (!svg || !svg.viewBox || !svg.viewBox.baseVal || !svg.viewBox.baseVal.width) return null;
    const k = svg.viewBox.baseVal;
    const r = flaeche.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return Math.min((r.width - 8) / k.width, (r.height - 8) / k.height);
  };
  const eins = messen();
  if (eins == null) return;
  _tep.zoom = Math.max(0.3, Math.min(2.4, Math.round(eins * 40) / 40));
  neu();
  setTimeout(() => {
    const zwei = messen();
    if (zwei != null) {
      const besser = Math.max(0.3, Math.min(2.4, Math.round(zwei * 40) / 40));
      if (Math.abs(besser - _tep.zoom) > 0.02) { _tep.zoom = besser; neu(); }
    }
    flaeche.scrollLeft = 0; flaeche.scrollTop = 0;
  }, 30);
}

/* ================= DAS TUCH ZEICHNEN ================= */
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(art, attrs, ...kinder) {
  const k = document.createElementNS(SVGNS, art);
  for (const a of Object.keys(attrs || {})) {
    if (attrs[a] == null) continue;
    k.setAttribute(a, String(attrs[a]));
  }
  for (const kind of kinder) if (kind) k.append(kind);
  return k;
}

function teppichSVG(doc, baum, ordnung, neu) {
  const knoten = ordnung.knoten;
  const wo = new Map(knoten.map((k) => [k.id, k]));
  const breite = TEP_RAND_X * 2 + Math.max(1, ordnung.spalten) * TEP_SPALTE;
  const hoehe = TEP_RAND_Y * 2 + Math.max(1, ordnung.reihen) * TEP_REIHE;

  const px = (k) => TEP_RAND_X + k.x * TEP_SPALTE;
  const py = (k) => TEP_RAND_Y + k.y * TEP_REIHE;

  const svg = sv('svg', {
    viewBox: '0 0 ' + Math.round(breite) + ' ' + Math.round(hoehe),
    width: Math.round(breite * _tep.zoom), height: Math.round(hoehe * _tep.zoom),
    class: 'tep-tuch', 'shape-rendering': 'geometricPrecision'
  });

  svg.append(teppichDefs());

  /* --- Der Grund --- */
  svg.append(sv('rect', { x: 0, y: 0, width: breite, height: hoehe, class: 'tep-grund' }));
  svg.append(sv('rect', { x: 0, y: 0, width: breite, height: hoehe, class: 'tep-webung', fill: 'url(#tep-webe)' }));
  svg.append(sv('rect', { x: 0, y: 0, width: breite, height: hoehe, class: 'tep-schatten', fill: 'url(#tep-vignette)' }));

  const gAeste = sv('g', { class: 'tep-aeste' });
  const gLaub = sv('g', { class: 'tep-laub' });
  const gRanken = sv('g', { class: 'tep-ranken' });
  const gBaender = sv('g', { class: 'tep-baender' });
  const gTiere = sv('g', { class: 'tep-tiere' });

  /* --- Der Stamm --- Er steigt unten links auf und gabelt sich in die
     Ältesten. Der Ansatz ist dick, die Gabel schon dünner: so sieht man dem
     Baum an, wo er anfängt. */
  const wurzeln = knoten.filter((k) => !k.eltern.length);
  const stammX = 92, stammY = hoehe - 26;
  /* Die Gabel sitzt tief — der Stamm ist kurz und dick, das Klettern
     übernehmen die Äste. Stand die Gabel weit oben, sah der Stamm aus wie
     ein Mast und nicht wie ein Baum. */
  const zielY = wurzeln.length ? wurzeln.reduce((s, k) => s + py(k), 0) / wurzeln.length : hoehe / 2;
  const gabelX = stammX + 46;
  const gabelY = stammY - Math.max(120, Math.min(300, (stammY - zielY) * 0.45));
  if (knoten.length) {
    gAeste.append(sv('path', { d: teppichWurzelPfad(stammX, stammY), class: 'tep-wurzel' }));
    /* Ein Körper, keine Linie: unten breit, oben schmal, mit zwei
       Rindenrissen darin. */
    gAeste.append(sv('path', { d: teppichStammPfad(stammX, stammY, gabelX, gabelY, 40, 15), class: 'tep-stammkoerper' }));
    gAeste.append(sv('path', { d: teppichRinde(stammX, stammY, gabelX, gabelY), class: 'tep-rinde' }));
    for (const k of wurzeln) {
      gAeste.append(teppichAst({ x: gabelX, y: gabelY }, { x: px(k) - teppichBandBreite(k.person) / 2 - 8, y: py(k) }, 8, k.id + ':stamm'));
    }
  }

  /* --- Die Äste: Eltern zu Kindern --- */
  for (const k of knoten) {
    for (const eId of k.eltern) {
      const e = wo.get(eId);
      if (!e) continue;
      const dicke = Math.max(2.4, 7 - k.gen * 0.55);
      gAeste.append(teppichAst(
        { x: px(e) + teppichBandBreite(e.person) / 2 + 5, y: py(e) },
        { x: px(k) - teppichBandBreite(k.person) / 2 - 5, y: py(k) },
        dicke, eId + '>' + k.id));
    }
    /* Paare: ein kurzer Bogen dazwischen */
    for (const pId of k.paare) {
      if (k.id > pId) continue;   /* nur einmal je Paar */
      const p = wo.get(pId);
      if (!p) continue;
      /* Der Bund läuft unter den Bändern durch, nicht mitten hindurch. */
      const oben = py(k) < py(p) ? k : p, unten = py(k) < py(p) ? p : k;
      gAeste.append(sv('path', {
        d: teppichBogen(px(oben), py(oben) + TEP_BAND_H / 2 + 3, px(unten), py(unten) - TEP_BAND_H / 2 - 3),
        class: 'tep-bund'
      }));
    }
  }

  /* --- Das Laub --- */
  for (const pfad of gAeste.querySelectorAll('path.tep-ast')) {
    for (const blatt of teppichBlaetterAn(pfad)) gLaub.append(blatt);
  }

  /* --- Die Ranken: alles, was kein Gerüst ist --- */
  const nurWer = _tep.nurPerson;
  for (const f of baum.faeden) {
    const art = fadenArt(f.art, baum);
    if (art.geruest || art.paar) continue;
    if (_tep.stumm.includes(f.art) || f.still) continue;
    if (nurWer && f.von !== nurWer && f.zu !== nurWer) continue;
    const a = wo.get(f.von), b = wo.get(f.zu);
    if (!a || !b) continue;
    gRanken.append(teppichRanke(px(a), py(a), px(b), py(b), art, f, baum, neu));
  }

  /* --- Die Namensbänder --- */
  const treffer = _tep.suche.trim() ? new Set(teppichSuche(baum, _tep.suche).map((p) => p.id)) : null;
  knoten.forEach((k, i) => {
    gBaender.append(teppichBand(k, px(k), py(k), baum, treffer, i, neu));
  });

  /* --- Das Wappen des Hauses, unten am Stamm --- */
  if (knoten.length) gBaender.append(teppichWappen(stammX + 26, Math.min(stammY - 130, (stammY + gabelY) / 2), baum));

  /* --- Kleines Getier --- */
  if (_tep.tiere && knoten.length > 2) gTiere.append(teppichEichhoernchen(breite, hoehe));

  svg.append(gAeste, gLaub, gRanken, gBaender, gTiere);
  return svg;
}

function teppichDefs() {
  const defs = sv('defs', {});
  /* Webung: feine Kett- und Schussfäden */
  const muster = sv('pattern', { id: 'tep-webe', width: 6, height: 6, patternUnits: 'userSpaceOnUse' });
  muster.append(sv('rect', { width: 6, height: 6, fill: 'none' }));
  muster.append(sv('path', { d: 'M0 0 H6', stroke: 'rgba(255,255,255,.035)', 'stroke-width': 1 }));
  muster.append(sv('path', { d: 'M0 3 H6', stroke: 'rgba(0,0,0,.06)', 'stroke-width': 1 }));
  muster.append(sv('path', { d: 'M0 0 V6', stroke: 'rgba(255,255,255,.022)', 'stroke-width': 1 }));
  defs.append(muster);

  const vig = sv('radialGradient', { id: 'tep-vignette', cx: '50%', cy: '46%', r: '72%' });
  vig.append(sv('stop', { offset: '55%', 'stop-color': 'rgba(0,0,0,0)' }));
  vig.append(sv('stop', { offset: '100%', 'stop-color': 'rgba(0,0,0,.42)' }));
  defs.append(vig);

  /* Brandloch: versengter Rand statt sauberem Kreis */
  const brand = sv('filter', { id: 'tep-brand', x: '-40%', y: '-40%', width: '180%', height: '180%' });
  brand.append(sv('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.06', numOctaves: '4', seed: '7', result: 'rauschen' }));
  brand.append(sv('feDisplacementMap', { in: 'SourceGraphic', in2: 'rauschen', scale: '11', xChannelSelector: 'R', yChannelSelector: 'G' }));
  defs.append(brand);

  const glut = sv('radialGradient', { id: 'tep-glut', cx: '50%', cy: '50%', r: '50%' });
  glut.append(sv('stop', { offset: '0%', 'stop-color': '#0a0806' }));
  glut.append(sv('stop', { offset: '62%', 'stop-color': '#120d09' }));
  glut.append(sv('stop', { offset: '84%', 'stop-color': '#3a2313' }));
  glut.append(sv('stop', { offset: '100%', 'stop-color': 'rgba(90,60,30,0)' }));
  defs.append(glut);

  return defs;
}

/* Ein Ast: kein Strich, sondern eine Kurve, die zum Ende hin dünner wird. */
function teppichAst(a, b, dicke, salz) {
  const dx = b.x - a.x;
  const hoch = teppichZufall(salz, 'hoch') * 26 - 13;
  const c1x = a.x + dx * 0.42, c1y = a.y + hoch * 0.4;
  const c2x = a.x + dx * 0.62, c2y = b.y - hoch * 0.6;
  return sv('path', {
    d: 'M ' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1),
    class: 'tep-ast', 'stroke-width': dicke.toFixed(1), 'data-salz': salz
  });
}
function teppichBogen(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const weg = Math.abs(y2 - y1) > Math.abs(x2 - x1) ? 22 : 0;
  return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + (mx + weg).toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
}
/* Der Stamm als Fläche: zwei Kurven, die sich nach oben annähern. So
   verjüngt er sich wirklich, statt nur dünner gestrichelt zu sein. */
function teppichStammPfad(x0, y0, x1, y1, unten, oben) {
  const hu = unten / 2, ho = oben / 2;
  const my = (y0 + y1) / 2, mx = (x0 + x1) / 2;
  return 'M ' + (x0 - hu) + ' ' + y0 +
    ' C ' + (x0 - hu * 0.9) + ' ' + (my + 30) + ', ' + (mx - ho * 1.5) + ' ' + (my - 10) + ', ' + (x1 - ho) + ' ' + y1 +
    ' L ' + (x1 + ho) + ' ' + y1 +
    ' C ' + (mx + ho * 1.7) + ' ' + (my - 6) + ', ' + (x0 + hu * 1.05) + ' ' + (my + 34) + ', ' + (x0 + hu) + ' ' + y0 + ' Z';
}
function teppichRinde(x0, y0, x1, y1) {
  const my = (y0 + y1) / 2, mx = (x0 + x1) / 2;
  return 'M ' + (x0 - 7) + ' ' + (y0 - 14) + ' C ' + (x0 - 5) + ' ' + (my + 20) + ', ' + (mx - 4) + ' ' + (my - 20) + ', ' + (x1 - 3) + ' ' + (y1 + 12) +
    ' M ' + (x0 + 9) + ' ' + (y0 - 22) + ' C ' + (x0 + 8) + ' ' + (my + 10) + ', ' + (mx + 5) + ' ' + (my - 26) + ', ' + (x1 + 4) + ' ' + (y1 + 18);
}
function teppichWurzelPfad(x, y) {
  return 'M ' + x + ' ' + y + ' C ' + (x - 26) + ' ' + (y + 6) + ', ' + (x - 46) + ' ' + (y + 2) + ', ' + (x - 64) + ' ' + (y + 12) +
    ' M ' + x + ' ' + y + ' C ' + (x + 22) + ' ' + (y + 8) + ', ' + (x + 44) + ' ' + (y + 6) + ', ' + (x + 66) + ' ' + (y + 14);
}

/* Eichenlaub entlang eines Astes. Gerechnet aus der Kennung des Astes, damit
   dasselbe Blatt beim nächsten Aufschlagen an derselben Stelle sitzt. */
function teppichBlaetterAn(pfad) {
  const raus = [];
  let laenge = 0;
  try { laenge = pfad.getTotalLength(); } catch (e) { return raus; }
  if (!laenge || !Number.isFinite(laenge)) return raus;
  const salz = pfad.getAttribute('data-salz') || '';
  const wieviele = Math.max(2, Math.min(6, Math.round(laenge / 76)));
  for (let i = 0; i < wieviele; i++) {
    const t = (i + 0.5) / wieviele + (teppichZufall(salz, 'l' + i) - 0.5) * 0.12;
    let p; try { p = pfad.getPointAtLength(Math.max(0, Math.min(laenge, t * laenge))); } catch (e) { continue; }
    const dreh = teppichDreh(salz, 'd' + i, 80);
    const gross = 0.46 + teppichZufall(salz, 'g' + i) * 0.3;
    const seite = teppichZufall(salz, 's' + i) > 0.5 ? 1 : -1;
    const g = sv('g', {
      class: 'tep-blatt', style: '--wiege:' + (2.6 + teppichZufall(salz, 'w' + i) * 2.4).toFixed(1) + 's;--versatz:' + (teppichZufall(salz, 'v' + i) * 3).toFixed(2) + 's',
      transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + dreh.toFixed(0) + ') scale(' + (gross * seite).toFixed(2) + ' ' + gross.toFixed(2) + ')'
    });
    g.append(sv('path', { d: TEP_EICHENBLATT, class: 'tep-blattform' }));
    raus.push(g);
  }
  return raus;
}
/* Ein Eichenblatt, gelappt — gezeichnet, nicht gerundet. */
const TEP_EICHENBLATT = 'M0 0 C 3 -1 5 -4 4 -6 C 7 -6 9 -8 8 -10 C 11 -10 13 -12 12 -14 C 14 -15 15 -17 13 -18 C 15 -20 14 -22 12 -22 C 11 -24 8 -24 7 -22 C 5 -23 3 -22 3 -20 C 1 -21 -1 -19 0 -17 L 0 0 Z M0 0 C -3 -1 -5 -4 -4 -6 C -7 -6 -9 -8 -8 -10 C -11 -10 -13 -12 -12 -14 C -14 -15 -15 -17 -13 -18 C -15 -20 -14 -22 -12 -22 C -11 -24 -8 -24 -7 -22 C -5 -23 -3 -22 -3 -20 C -1 -21 1 -19 0 -17';

/* Eine Ranke: alles, was kein Gerüst ist. Sie schwingt weit aus, damit sie
   nicht mit den Ästen verwechselt wird — und ist anfassbar. */
function teppichRanke(x1, y1, x2, y2, art, faden, baum, neu) {
  const g = sv('g', { class: 'tep-ranke gruppe-' + art.gruppe + (art.schwer ? ' schwer' : ''), style: '--fadenfarbe:' + art.farbe });
  const dx = x2 - x1, dy = y2 - y1;
  const weite = Math.sqrt(dx * dx + dy * dy);
  const bauch = Math.max(30, Math.min(150, weite * 0.32));
  const richtung = dy >= 0 ? 1 : -1;
  const mx = (x1 + x2) / 2 - (dy / (weite || 1)) * bauch;
  const my = (y1 + y2) / 2 + (dx / (weite || 1)) * bauch * richtung * 0.6;
  const d = 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);

  g.append(sv('path', { d, class: 'tep-rankeschatten' }));
  const linie = sv('path', { d, class: 'tep-rankelinie strich-' + art.strich });
  g.append(linie);
  /* Ein kleiner Widerhaken zeigt, wohin der Faden läuft. */
  if (art.gerichtet) {
    const t = 0.82;
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
    const wx = x2 - bx, wy = y2 - by;
    const w = Math.sqrt(wx * wx + wy * wy) || 1;
    const winkel = Math.atan2(wy, wx) * 180 / Math.PI;
    g.append(sv('path', { d: 'M 0 0 L -9 -4 L -6 0 L -9 4 Z', class: 'tep-spitze', transform: 'translate(' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ') rotate(' + winkel.toFixed(0) + ')' }));
  }
  if (faden.wort) {
    const t = 0.5;
    const bx = 0.25 * x1 + 0.5 * mx + 0.25 * x2;
    const by = 0.25 * y1 + 0.5 * my + 0.25 * y2;
    const text = faden.wort.length > 34 ? faden.wort.slice(0, 33) + '…' : faden.wort;
    const b = Math.max(38, text.length * 5.4 + 14);
    const kl = sv('g', { class: 'tep-rankenband', transform: 'translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ')' });
    kl.append(sv('rect', { x: (-b / 2).toFixed(1), y: -8, width: b.toFixed(1), height: 16, rx: 2, class: 'tep-rbgrund' }));
    const t2 = sv('text', { x: 0, y: 4, class: 'tep-rbtext', 'text-anchor': 'middle' });
    t2.textContent = text;
    kl.append(t2);
    g.append(kl);
  }
  const titel = sv('title', {});
  titel.textContent = fadenSatz(faden, baum, baum.leute);
  g.append(titel);
  g.addEventListener('click', (ev) => { ev.stopPropagation(); teppichFadenBearbeiten(D.docs.get(_tep.id), faden, neu); });
  return g;
}

/* Ein Namensband: ein Streifen mit eingeschlagenen Enden, der Name darauf
   in Versalien, darunter die Jahre. Ist die Person ausgebrannt, liegt statt
   des Zeichens ein Loch im Tuch — der Name bleibt trotzdem stehen. */
function teppichBand(k, x, y, baum, treffer, i, neu) {
  const p = k.person;
  const name = (teppichName(p) || 'ohne Namen').toUpperCase();
  const jahre = teppichJahre(p);
  const dreh = teppichDreh(p.id, 'band', 2.4);
  const blass = treffer && !treffer.has(p.id);
  const hell = _tep.nurPerson && _tep.nurPerson === p.id;

  const g = sv('g', {
    class: 'tep-person' + (blass ? ' blass' : '') + (hell ? ' hervor' : '') + (p.gebrannt ? ' gebrannt' : ''),
    transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + dreh + ')',
    style: '--n:' + Math.min(i, 40), tabindex: '0', role: 'button'
  });

  /* Das Brandloch liegt hinter dem Band, leicht versetzt nach oben. */
  if (p.gebrannt) {
    const r = 24 + teppichZufall(p.id, 'brand') * 8;
    g.append(sv('circle', { cx: 0, cy: -30, r: (r + 7).toFixed(1), fill: 'url(#tep-glut)', class: 'tep-glut' }));
    g.append(sv('circle', { cx: 0, cy: -30, r: r.toFixed(1), class: 'tep-loch', filter: 'url(#tep-brand)' }));
  } else if (p.zeichen && p.zeichen !== 'keins') {
    const z = sv('g', { class: 'tep-zeichen', transform: 'translate(0 -30)' });
    z.append(sv('circle', { cx: 0, cy: 0, r: 17, class: 'tep-zkreis' }));
    z.append(sv('path', { d: TEP_ZEICHEN_PFADE[p.zeichen] || '', class: 'tep-zform' }));
    g.append(z);
  }

  const b = teppichBandBreite(p);
  const h = TEP_BAND_H + (jahre ? 8 : 0);
  g.append(sv('path', { d: teppichBandPfad(b, h), class: 'tep-bandgrund' }));
  g.append(sv('path', { d: teppichBandZipfel(b, h, -1), class: 'tep-bandzipfel' }));
  g.append(sv('path', { d: teppichBandZipfel(b, h, 1), class: 'tep-bandzipfel' }));

  const t = sv('text', { x: 0, y: jahre ? -2 : 4, class: 'tep-name', 'text-anchor': 'middle' });
  t.textContent = name.length > 46 ? name.slice(0, 45) + '…' : name;
  g.append(t);
  if (jahre) {
    const j = sv('text', { x: 0, y: 11, class: 'tep-jahre', 'text-anchor': 'middle' });
    j.textContent = jahre;
    g.append(j);
  }

  const titel = sv('title', {});
  const anzahl = teppichFaedenVon(baum, p.id).length;
  titel.textContent = (teppichName(p) || 'ohne Namen') + (jahre ? ' · ' + jahre : '') +
    ' · ' + anzahl + (anzahl === 1 ? ' Faden' : ' Fäden') + (p.gebrannt ? ' · ausgebrannt' : '');
  g.append(titel);

  const auf = (ev) => { ev.stopPropagation(); teppichKartusche(D.docs.get(_tep.id), p.id, neu); };
  g.addEventListener('click', auf);
  g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); auf(ev); } });
  return g;
}

/* Der Streifen selbst: oben und unten leicht gewellt, wie gewebter Stoff. */
function teppichBandPfad(b, h) {
  const hb = b / 2, hh = h / 2;
  return 'M ' + (-hb) + ' ' + (-hh) +
    ' C ' + (-hb / 2) + ' ' + (-hh - 3) + ', ' + (hb / 2) + ' ' + (-hh + 2) + ', ' + hb + ' ' + (-hh) +
    ' L ' + hb + ' ' + hh +
    ' C ' + (hb / 2) + ' ' + (hh + 3) + ', ' + (-hb / 2) + ' ' + (hh - 2) + ', ' + (-hb) + ' ' + hh + ' Z';
}
/* Die eingeschlagenen Enden — dunkler, weil der Stoff dort doppelt liegt. */
function teppichBandZipfel(b, h, seite) {
  const hb = b / 2, hh = h / 2;
  const x = seite < 0 ? -hb : hb;
  const t = seite < 0 ? -13 : 13;
  return 'M ' + x + ' ' + (-hh) + ' L ' + (x + t) + ' ' + (-hh - 5) + ' L ' + (x + t) + ' ' + (hh + 5) + ' L ' + x + ' ' + hh + ' Z';
}

/* Das Wappen des Hauses: geritzt, nicht gemalt. */
function teppichWappen(x, y, baum) {
  const g = sv('g', { class: 'tep-wappen', transform: 'translate(' + x + ' ' + y + ')' });
  g.append(sv('path', { d: 'M -34 -40 L 34 -40 L 34 6 C 34 26 16 40 0 46 C -16 40 -34 26 -34 6 Z', class: 'tep-wschild' }));
  g.append(sv('path', { d: 'M -34 -40 L 34 -40 L 34 6 C 34 26 16 40 0 46 C -16 40 -34 26 -34 6 Z', class: 'tep-wrand' }));
  g.append(sv('path', { d: 'M 0 -40 L 0 46 M -34 -8 L 34 -8', class: 'tep-wteilung' }));
  /* Kein Spruch darunter: der läuft schon oben und unten am Rand entlang,
     und hier unten lief er regelmäßig aus dem Bild. */
  const titel = sv('title', {});
  titel.textContent = baum.titel || 'Das Haus';
  g.append(titel);
  return g;
}

/* Die geritzten Zeichen. Klein, streng, ohne Farbe — ein Wappentier statt
   eines Gesichts. */
const TEP_ZEICHEN_PFADE = {
  stern: 'M0 -11 L2.6 -3.4 L10.5 -3.4 L4.1 1.3 L6.5 8.9 L0 4.2 L-6.5 8.9 L-4.1 1.3 L-10.5 -3.4 L-2.6 -3.4 Z',
  krone: 'M-10 5 L-10 -4 L-5 1 L0 -7 L5 1 L10 -4 L10 5 Z M-10 7 H10',
  schwert: 'M0 -11 L2 -6 L2 4 L-2 4 L-2 -6 Z M-6 5 H6 M0 5 V10',
  kelch: 'M-7 -8 H7 C7 -1 4 2 0 2 C-4 2 -7 -1 -7 -8 Z M0 2 V8 M-5 9 H5',
  rabe: 'M-9 2 C-5 -4 2 -7 8 -6 L10 -8 L9 -4 C10 0 7 5 1 6 C-3 6 -7 5 -9 2 Z M-9 2 L-11 6',
  schlange: 'M-9 6 C-4 6 -4 0 0 0 C4 0 4 -6 9 -6 M9 -6 L11 -8 M9 -6 L11 -4',
  wolf: 'M-9 6 L-6 -3 L-9 -7 L-4 -5 L0 -8 L4 -5 L9 -7 L6 -3 L9 6 Z M-3 -1 h1 M2 -1 h1',
  hirsch: 'M0 8 V-1 M0 -1 L-6 -8 M-6 -8 L-9 -6 M-6 -8 L-7 -11 M0 -1 L6 -8 M6 -8 L9 -6 M6 -8 L7 -11',
  rose: 'M0 -8 C5 -8 8 -4 8 0 C8 5 4 8 0 8 C-4 8 -8 5 -8 0 C-8 -4 -5 -8 0 -8 Z M0 -4 C3 -4 4 -1 4 1 M0 0 C1 0 2 1 2 2',
  eiche: 'M0 9 V-2 M0 -2 C-4 -3 -7 -6 -6 -9 C-3 -10 -1 -8 0 -6 C1 -8 3 -10 6 -9 C7 -6 4 -3 0 -2',
  schluessel: 'M0 -9 A3.4 3.4 0 1 1 0 -2 A3.4 3.4 0 1 1 0 -9 M0 -2 V9 M0 4 H5 M0 7 H4',
  auge: 'M-11 0 C-6 -6 6 -6 11 0 C6 6 -6 6 -11 0 Z M0 0 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
  mond: 'M4 -9 A9.5 9.5 0 1 0 4 9 A7.5 7.5 0 1 1 4 -9 Z',
  sonne: 'M0 0 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M0 -11 V-8 M0 8 V11 M-11 0 H-8 M8 0 H11 M-8 -8 L-6 -6 M6 6 L8 8 M8 -8 L6 -6 M-6 6 L-8 8',
  anker: 'M0 -9 m-2.2 0 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 M0 -7 V9 M-6 -3 H6 M-9 4 C-7 9 7 9 9 4',
  turm: 'M-7 9 V-4 L-7 -8 L-4 -8 L-4 -6 L-2 -6 L-2 -8 L2 -8 L2 -6 L4 -6 L4 -8 L7 -8 L7 -4 V9 Z M-2 9 V3 h4 v6',
  feder: 'M-7 9 C-2 2 4 -4 8 -10 C4 -3 0 3 -3 9 Z M-7 9 L-9 11',
  flamme: 'M0 9 C-6 6 -7 0 -3 -4 C-3 -1 -1 -1 -1 -3 C-1 -7 -3 -9 0 -11 C3 -8 7 -5 6 0 C5 5 3 8 0 9 Z',
  kette: 'M-8 -4 a4 4 0 1 0 0 8 a4 4 0 1 0 0 -8 M8 -4 a4 4 0 1 0 0 8 a4 4 0 1 0 0 -8 M-4 0 H4',
  dolch: 'M0 -11 L2.4 -5 L2.4 3 L0 6 L-2.4 3 L-2.4 -5 Z M-7 -5 H7 M0 6 V10'
};

/* Ein Eichhörnchen, das ab und zu über den Teppich huscht. */
function teppichEichhoernchen(breite, hoehe) {
  const g = sv('g', { class: 'tep-tier eichhorn', 'aria-hidden': 'true' });
  g.append(sv('path', {
    class: 'tep-tierform',
    d: 'M0 0 C -2 -4 -1 -8 3 -9 C 6 -10 9 -8 9 -5 C 9 -3 8 -2 7 -1 L 12 -1 C 14 -1 15 1 14 2 L 4 3 C 1 3 -1 2 0 0 Z ' +
      'M 12 2 C 18 0 20 -6 17 -11 C 21 -8 22 -1 16 3 Z M 4 -6 a1 1 0 1 0 .1 0'
  }));
  return g;
}

/* ================= DIE BEWEGUNG =================
   Fallendes Laub, wiegende Blätter, das Eichhörnchen. Alles hört auf, wenn
   das Fenster verdeckt ist oder jemand keine Bewegung will — und alles
   räumt sich selbst weg. */
let _tepAnimation = null;
function teppichAnimationenAus() {
  if (!_tepAnimation) return;
  clearInterval(_tepAnimation.fall);
  clearTimeout(_tepAnimation.tier);
  _tepAnimation = null;
}
function teppichAnimationenAn(flaeche, svg, baum) {
  teppichAnimationenAus();
  const stillsteht = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (stillsteht) { svg.classList.add('ohne-wind'); return; }
  if (!_tep.wind) svg.classList.add('ohne-wind');

  const scheibe = flaeche.parentNode ? flaeche.parentNode.querySelector('.tep-laubfall') : null;
  const fall = setInterval(() => {
    if (document.hidden || !svg.isConnected || !_tep.laub || !scheibe) return;
    teppichBlattFallen(scheibe);
  }, 3400);

  let tier = null;
  const tierLaufen = () => {
    if (!svg.isConnected) return;
    if (!document.hidden && _tep.tiere) {
      const e = svg.querySelector('.tep-tier');
      if (e) {
        const aeste = [...svg.querySelectorAll('path.tep-ast')];
        if (aeste.length) {
          const welcher = aeste[Math.floor(Math.random() * aeste.length)];
          e.style.offsetPath = 'path("' + welcher.getAttribute('d') + '")';
          e.classList.remove('laeuft');
          /* Ein Neustart der Animation braucht einen Takt Pause. */
          setTimeout(() => e.classList.add('laeuft'), 30);
          setTimeout(() => e.classList.remove('laeuft'), 5200);
        }
      }
    }
    tier = setTimeout(tierLaufen, 14000 + Math.random() * 16000);
    if (_tepAnimation) _tepAnimation.tier = tier;
  };
  tier = setTimeout(tierLaufen, 4000);
  _tepAnimation = { fall, tier };
}

/* Ein Blatt löst sich und segelt nach unten. Es liegt über dem Tuch, nicht
   darin — sonst müsste bei jedem Blatt der ganze Teppich neu gezeichnet
   werden. */
function teppichBlattFallen(flaeche) {
  const b = el('i', { class: 'tep-fallblatt' });
  const x = 10 + Math.random() * 80;
  b.style.left = x + '%';
  b.style.setProperty('--drift', (Math.random() * 90 - 45).toFixed(0) + 'px');
  b.style.setProperty('--dauer', (7 + Math.random() * 5).toFixed(1) + 's');
  b.style.setProperty('--dreh', (Math.random() * 720 - 360).toFixed(0) + 'deg');
  flaeche.append(b);
  setTimeout(() => b.remove(), 13000);
}
