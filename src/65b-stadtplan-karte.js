/* ===================== 65b — DIE KARTE =====================
   Ein Stadtplan, wie ihn ein Kupferstecher gemacht hätte: flach, ohne
   Schatten, mit klaren Kanten und einer Handvoll Töne. Alles Wichtige
   passiert in der Reihenfolge, in der gezeichnet wird — Land, Wasser,
   Blöcke, Straßen, Häuser, Mauer, Namen.

   Zwei Kniffe tragen das Bild:

   1. STRASSEN ZWEIMAL. Erst alle Straßen dick in der Tintenfarbe, dann
      schmaler in der Pflasterfarbe darüber. Weil sich die dunklen Striche
      überlappen, verschmelzen sie zu EINEM Netz mit durchgehender Kontur —
      an keiner Kreuzung sieht man eine Naht.

   2. DIE KARTE HÄNGT. Eine Stadt mit vierhundert Häusern wird nicht bei
      jedem Klick neu gerechnet. Sie wird einmal gebaut und bleibt, bis sich
      wirklich etwas an ihr ändert. */

const KARTE_NS = 'http://www.w3.org/2000/svg';
function kv(art, attrs) {
  const k = document.createElementNS(KARTE_NS, art);
  if (attrs) for (const a of Object.keys(attrs)) { if (attrs[a] != null) k.setAttribute(a, String(attrs[a])); }
  return k;
}
function kz(n) { return (Math.round(n * 10) / 10).toString(); }
function kpfad(punkte, zu) {
  if (!punkte.length) return '';
  let d = 'M ' + kz(punkte[0][0]) + ' ' + kz(punkte[0][1]);
  for (let i = 1; i < punkte.length; i++) d += ' L ' + kz(punkte[i][0]) + ' ' + kz(punkte[i][1]);
  return d + (zu ? ' Z' : '');
}
/* Weich durch die Punkte — Straßen und Ufer sind nie eckig. */
function kweich(punkte, zu) {
  const n = punkte.length;
  if (n < 3) return kpfad(punkte, zu);
  const hol = (i) => punkte[zu ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = 'M ' + kz(punkte[0][0]) + ' ' + kz(punkte[0][1]);
  const bis = zu ? n : n - 1;
  for (let i = 0; i < bis; i++) {
    const p0 = hol(i - 1), p1 = hol(i), p2 = hol(i + 1), p3 = hol(i + 2);
    d += ' C ' + kz(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + kz(p1[1] + (p2[1] - p0[1]) / 6) +
      ', ' + kz(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + kz(p2[1] - (p3[1] - p1[1]) / 6) +
      ', ' + kz(p2[0]) + ' ' + kz(p2[1]);
  }
  return d + (zu ? ' Z' : '');
}

/* Was gerade auf dem Tisch liegt — und welche Ebenen davon sichtbar sind.
   Die Ebenen sind Ansichtssache, kein Teil des Belegs: sie gehören zum
   Schauen, nicht zur Stadt, und werden darum auch nicht gespeichert. */
let _kt = {
  id: '', zoom: 1, werkzeug: 'hand', markeArt: 'stern', nurMarke: '',
  zeigeNamen: true, zeigeUmland: true, zeigeLegende: true, zeigeWappen: true,
  zeigeGitter: true, zeigeAlterung: true, zeigeRundgang: false,
  messenVon: null, offen: false
};

/* Die Ebenen als Liste — einmal beschrieben, überall verwendet: im
   Knopf, im Tastenkürzel und in der Klasse am Blatt. */
const KT_EBENEN = [
  ['zeigeNamen', 'Namen', 'ohne-namen', 'Gassen, Viertel, Tore'],
  ['zeigeUmland', 'Umland', 'ohne-umland', 'Felder, Wälder, Höfe, Hügel'],
  ['zeigeLegende', 'Zeichenerklärung', 'ohne-legende', 'Das Feld unten rechts'],
  ['zeigeWappen', 'Wappen', 'ohne-wappen', 'Schild und Blasonierung'],
  ['zeigeGitter', 'Gradnetz', 'ohne-gitter', 'Die feinen Linien über dem Blatt'],
  ['zeigeAlterung', 'Alterung', 'ohne-alterung', 'Stockflecken, Falten, Schatten'],
  ['zeigeRundgang', 'Rundgang', 'mit-rundgang', 'Ein Weg durch alle Marken']
];

/* ===================== DAS WERKZEUG IM KABINETT ===================== */
function stadtplanWerkzeug(zurueck) {
  const buehne = el('div', { class: 'kt-werkzeug' });
  const zeichne = () => {
    const liste = stadtplaene();
    buehne.innerHTML = '';
    anfuegen(buehne,
      el('div', { class: 'kt-wkopf' },
        el('button', { class: 'kt-zurueck', onclick: () => { if (zurueck) zurueck(); } }, '‹ Kabinett'),
        el('div', { class: 'kt-wtitel' }, el('b', {}, 'Der Kartentisch'),
          el('small', {}, 'Stadtpläne für Orte, die es nur bei dir gibt.')),
        el('button', { class: 'knopf voll', onclick: () => planNeu((id) => { zeichne(); planOeffnen(id); }) }, 'Eine Stadt gründen')),
      liste.length
        ? el('div', { class: 'kt-regal' }, ...liste.map((d, i) => planKachel(d, i, zeichne)))
        : el('div', { class: 'kt-leer' },
          el('div', { class: 'kt-leerbild', html: planLeerBild() }),
          el('b', {}, 'Noch liegt keine Karte auf dem Tisch.'),
          el('p', {}, 'Eine Stadt zeichnet man nicht Haus für Haus. Sag, wo sie liegt und wie alt sie ist — den Rest rechnet VANI. Danach gehst du hinein und gibst den Stellen Namen, die dir wichtig sind.'),
          el('button', { class: 'knopf voll', onclick: () => planNeu((id) => { zeichne(); planOeffnen(id); }) }, 'Die erste gründen')));
  };
  zeichne();
  return buehne;
}

function planKachel(doc, i, neu) {
  const plan = saubererPlan(doc);
  const welt = planFarbwelt(plan.welt);
  const papier = planPapier(plan.papier || welt.papier);
  const z = planZahlen(plan);
  const kachel = el('button', {
    class: 'kt-kachel', style: '--n:' + Math.min(i, 20) + ';--papier:' + papier[2] + ';--tinte:' + welt.tinte + ';--wasser:' + welt.wasser,
    onclick: () => planOeffnen(doc.id)
  },
    el('span', { class: 'kt-vorschau', html: planVorschau(plan) }),
    el('span', { class: 'kt-kschild' },
      el('b', {}, plan.titel),
      plan.unterzeile ? el('small', {}, plan.unterzeile) : null,
      el('i', {}, [
        planGroesse(plan.stadt.groesse)[1],
        z.haeuser + ' Häuser',
        z.marken ? z.marken + (z.marken === 1 ? ' Marke' : ' Marken') : ''
      ].filter(Boolean).join('  ·  '))));
  kachel.addEventListener('contextmenu', (ev) => { ev.preventDefault(); planKachelMenue(doc, neu); });
  return kachel;
}

/* Ein winziges Bild der Stadt für die Kachel — nur Umriss, Wasser, Mauer. */
function planVorschau(plan) {
  const g = planBauen(plan);
  const welt = planFarbwelt(plan.welt);
  const G = PLAN_GROESSE;
  let d = '<svg viewBox="0 0 ' + G + ' ' + G + '" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">';
  for (const poly of g.wasser.polygone) d += '<path d="' + kpfad(poly, true) + '" fill="' + welt.wasser + '"/>';
  if (g.wasser.insel) d += '<path d="' + kpfad(g.wasser.insel, true) + '" fill="none" stroke="' + welt.wasserrand + '" stroke-width="6"/>';
  let bl = '';
  for (const b of g.stadt.bloecke) bl += kpfad(b.ecken, true) + ' ';
  d += '<path d="' + bl + '" fill="' + welt.dach + '" fill-opacity=".5"/>';
  if (g.stadt.mauer) d += '<path d="' + kweich(g.stadt.mauer.punkte, true) + '" fill="none" stroke="' + welt.tinte + '" stroke-width="9" stroke-opacity=".55"/>';
  return d + '</svg>';
}

function planLeerBild() {
  return '<svg viewBox="0 0 120 90" width="150" height="112" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 22 L40 12 L80 24 L112 14 V70 L80 80 L40 68 L8 78 Z"/>' +
    '<path d="M40 12 V68 M80 24 V80"/>' +
    '<path d="M14 40 C 30 36 44 44 60 40 C 74 37 92 44 106 40" stroke-dasharray="3 3"/>' +
    '<circle cx="60" cy="46" r="3"/><path d="M60 40 V30 M60 52 V62 M54 46 H44 M66 46 H76"/>' +
    '</svg>';
}

/* ===================== DIE KARTE AUFSCHLAGEN ===================== */
function planOeffnen(id) {
  const doc = D.docs.get(id);
  if (!doc) return;
  _kt.id = id;
  _kt.nurMarke = '';
  _kt.messenVon = null;
  if (!_kt.zoom || !Number.isFinite(_kt.zoom)) _kt.zoom = 1;

  const flaeche = el('div', { class: 'kt-flaeche' });
  const leiste = el('div', { class: 'kt-leiste' });
  /* Der Tisch: dunkles Holz, ein Lichtkegel von links oben, und in den Ecken
     das Werkzeug eines Kartografen — Messingbeschwerer, ein Zirkel, ein
     Lineal. Ohne sie ist die Karte eine Datei; mit ihnen liegt sie irgendwo. */
  const rahmen = el('div', { class: 'kt-rahmen' },
    el('i', { class: 'kt-tischlicht', 'aria-hidden': 'true' }),
    flaeche,
    el('i', { class: 'kt-zirkel', 'aria-hidden': 'true', html: KT_ZIRKEL }),
    el('i', { class: 'kt-lineal', 'aria-hidden': 'true' }));
  const tafel = el('div', { class: 'kt-tafel' }, leiste, rahmen);
  const huelle = el('div', { class: 'kt-huelle' }, tafel);
  const zu = zeigeDeck(huelle, () => { document.removeEventListener('keydown', taste); _kt.offen = false; });
  _kt.offen = true;

  const neu = () => planZeichne(tafel, flaeche, rahmen, neu, zu);

  /* Wird irgendwo etwas zurückgenommen, zeichnet die offene Karte neu. */
  const beiZug = () => { if (tafel.isConnected) { flaeche.dataset.sig = ''; neu(); } else document.removeEventListener('vani-zug', beiZug); };
  document.addEventListener('vani-zug', beiZug);

  /* Mit zwei Fingern heran und wieder weg. Ein SVG lässt sich über seine
     Größe verlustfrei skalieren — deshalb kostet das Kneifen nichts, und
     die Karte wird erst neu gebaut, wenn die Finger wieder weg sind. */
  zweiFingerZoom(flaeche, {
    min: 0.25, max: 4,
    hole: () => _kt.zoom || 1,
    bild: () => flaeche.querySelector('.kt-blatt'),
    fertig: (z) => { _kt.zoom = Math.round(z * 100) / 100; neu(); }
  });
  const taste = (ev) => {
    if (!tafel.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 2) return;
    if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); planZoom(0.2, flaeche, neu); }
    else if (ev.key === '-') { ev.preventDefault(); planZoom(-0.2, flaeche, neu); }
    else if (ev.key === '0') { ev.preventDefault(); _kt.zoom = 1; neu(); }
    else if (ev.key === '1') { ev.preventDefault(); _kt.werkzeug = 'hand'; neu(); }
    else if (ev.key === '2') { ev.preventDefault(); _kt.werkzeug = 'marke'; neu(); }
    else if (ev.key === '3') { ev.preventDefault(); _kt.werkzeug = 'messen'; _kt.messenVon = null; neu(); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); _kt.zeigeNamen = !_kt.zeigeNamen; neu(); }
    else if (ev.key === 'e' || ev.key === 'E') { ev.preventDefault(); planEbenenwahl(neu); }
    else if (ev.key === 'v' || ev.key === 'V') { ev.preventDefault(); planVerzeichnis(D.docs.get(_kt.id), neu); }
    else if (ev.key === 'Escape' && (_kt.nurMarke || _kt.messenVon)) { ev.preventDefault(); _kt.nurMarke = ''; _kt.messenVon = null; neu(); }
  };
  document.addEventListener('keydown', taste);

  tafel.classList.add('rollt-auf');
  setTimeout(() => tafel.classList.remove('rollt-auf'), 900);
  neu();
  setTimeout(() => planEinpassen(flaeche, neu), 60);
}

/* Ein Schritt naeher oder weiter weg. Multiplikativ, nicht additiv: von 30 %
   aus sind 0,2 ein Sprung, von 300 % aus ein Nichts. Und die Bewegung wird
   gezeigt, statt gesprungen — `zoomSanft` skaliert erst weich hin und laesst
   dann einmal richtig zeichnen. */
function planZoom(delta, flaeche, neu) {
  const alt = _kt.zoom;
  const ziel = Math.max(0.3, Math.min(3.2, Math.round(alt * (delta > 0 ? 1.25 : 1 / 1.25) * 100) / 100));
  if (Math.abs(ziel - alt) < 0.005) return;
  const fertig = (z) => {
    _kt.zoom = z;
    const mx = flaeche ? (flaeche.scrollLeft + flaeche.clientWidth / 2) / alt : 0;
    const my = flaeche ? (flaeche.scrollTop + flaeche.clientHeight / 2) / alt : 0;
    neu();
    if (flaeche) {
      flaeche.scrollLeft = mx * _kt.zoom - flaeche.clientWidth / 2;
      flaeche.scrollTop = my * _kt.zoom - flaeche.clientHeight / 2;
    }
  };
  if (typeof zoomSanft === 'function' && flaeche) {
    zoomSanft(flaeche, () => flaeche.querySelector('.kt-blatt'), alt, ziel, () => { _kt.zoom = ziel; neu(); });
  } else fertig(ziel);
}
function planEinpassen(flaeche, neu) {
  if (!flaeche || !flaeche.clientWidth) return;
  const passt = Math.min(flaeche.clientWidth / PLAN_GROESSE, flaeche.clientHeight / PLAN_GROESSE) * 0.96;
  _kt.zoom = Math.max(0.3, Math.min(3.2, Math.round(passt * 40) / 40));
  neu();
  setTimeout(() => {
    flaeche.scrollLeft = (flaeche.scrollWidth - flaeche.clientWidth) / 2;
    flaeche.scrollTop = (flaeche.scrollHeight - flaeche.clientHeight) / 2;
  }, 0);
}

/* ===================== ZEICHNEN ===================== */
function planZeichne(tafel, flaeche, rahmen, neu, schliessen) {
  const doc = D.docs.get(_kt.id);
  if (!doc) { schliessen(); return; }
  const plan = saubererPlan(doc);
  const welt = planFarbwelt(plan.welt);
  const papier = planPapier(plan.papier || welt.papier);

  /* Die ganze Farbwelt wird durchgereicht, nicht nur fuenf Werte: Hafen,
     Legende und Wappen sollen der Welt folgen, in der die Karte steht —
     sonst haetten sie fest eingetragene Farben, die bei jeder anderen
     Farbwelt daneben liegen. */
  for (const [k, v] of [
    ['--kpapier', papier[2]], ['--kpapier2', papier[3]],
    ['--ktinte', welt.tinte], ['--ktintezart', welt.tintezart],
    ['--kwasser', welt.wasser], ['--kwasserrand', welt.wasserrand],
    ['--kgruen', welt.gruen], ['--kgruendunkel', welt.gruendunkel],
    ['--kdach', welt.dach], ['--kdachdunkel', welt.dachdunkel],
    ['--kmauer', welt.mauer], ['--kstrasse', welt.strasse],
    ['--kgold', welt.gold]
  ]) {
    tafel.style.setProperty(k, v);
    flaeche.style.setProperty(k, v);
  }

  const leiste = tafel.querySelector('.kt-leiste');
  leiste.innerHTML = '';
  anfuegen(leiste, ...planLeisteInhalt(doc, plan, flaeche, neu, schliessen));

  /* Die Karte hängt: neu gerechnet wird nur, wenn sich die Stadt selbst
     ändert. Marken, Namen und der Blick kommen obenauf. */
  /* Der Rundgang steht mit in der Signatur: er ist die einzige Ebene, die
     wirklich etwas HINZUZEICHNET, statt nur etwas auszublenden — und wer
     ihn nur über eine Klasse versteckte, ließ ihn bei vierhundert Marken
     bei jedem Zeichnen mitrechnen. Über eine Sekunde für einen Weg, den
     niemand sieht. */
  const signatur = _kt.id + '|' + planSignatur(plan) + '|' + plan.welt + '|' + (plan.papier || '') +
    '|' + (_kt.zeigeRundgang ? 'rund' : '');
  const markenSig = JSON.stringify(plan.marken) + '|' + JSON.stringify(plan.namen) + '|' + plan.titel + '|' + plan.unterzeile;
  let innen = flaeche.querySelector('.kt-innen');
  let svg = innen ? innen.querySelector('svg') : null;

  if (!innen || flaeche.dataset.sig !== signatur) {
    const gebaut = planBauen(plan);
    flaeche._gebaut = gebaut;
    flaeche.innerHTML = '';
    flaeche.dataset.sig = signatur;
    flaeche.dataset.marken = '';
    svg = planSVG(plan, gebaut, neu);
    /* Die Beschwerer liegen AUF dem Papier, an seinen Ecken. */
    innen = el('div', { class: 'kt-innen' },
      el('div', { class: 'kt-blattkasten' }, svg,
        ...['e1', 'e2', 'e3', 'e4'].map((e) => el('i', { class: 'kt-beschwerer ' + e, 'aria-hidden': 'true' }))));
    flaeche.append(innen);
  }
  if (flaeche.dataset.marken !== markenSig) {
    flaeche.dataset.marken = markenSig;
    planMarkenAuftragen(svg, plan, flaeche._gebaut, neu);
  }
  if (svg) {
    svg.setAttribute('width', Math.round(PLAN_GROESSE * _kt.zoom));
    svg.setAttribute('height', Math.round(PLAN_GROESSE * _kt.zoom));
  }
  for (const [feld, , klasse] of KT_EBENEN) {
    /* „mit-…“ wird gesetzt, wenn AN; „ohne-…“, wenn AUS. */
    const an = _kt[feld] !== false;
    svg.classList.toggle(klasse, klasse.startsWith('mit-') ? an : !an);
  }
  svg.classList.toggle('eine-im-blick', !!_kt.nurMarke);
  for (const m of svg.querySelectorAll('.kt-marke')) {
    m.classList.toggle('imblick', m.getAttribute('data-marke') === _kt.nurMarke);
  }

  const alteKarte = tafel.querySelector('.kt-markenkarte');
  if (alteKarte) alteKarte.remove();
  if (_kt.nurMarke) {
    const karte = planMarkenkarte(doc, plan, _kt.nurMarke, neu);
    if (karte) rahmen.append(karte);
  }
  const alteMessung = tafel.querySelector('.kt-messband');
  if (alteMessung) alteMessung.remove();
  if (_kt.messenVon) rahmen.append(planMessband(plan, neu));
}

/* ===================== DIE LEISTE ===================== */
function planLeisteInhalt(doc, plan, flaeche, neu, schliessen) {
  const z = planZahlen(plan, flaeche._gebaut);
  const suchfeld = el('input', { type: 'search', class: 'kt-suchfeld', placeholder: 'Auf der Karte suchen …' });
  const treffer = el('div', { class: 'kt-treffer' });
  suchfeld.addEventListener('input', entprellt(() => {
    treffer.innerHTML = '';
    const q = suchfeld.value.trim();
    if (!q) return;
    const funde = planSuche(plan, q, flaeche._gebaut);
    if (!funde.length) { treffer.append(el('span', { class: 'kt-keintreffer' }, 'Nichts gefunden.')); return; }
    for (const f of funde.slice(0, 8)) {
      treffer.append(el('button', {
        class: 'kt-trefferzeile', onclick: () => { planHinschauen(flaeche, f.x, f.y); if (f.marke) { _kt.nurMarke = f.marke.id; neu(); } }
      }, el('i', {}, f.art === 'marke' ? '◆' : f.art === 'gasse' ? '—' : '▣'), f.name));
    }
  }, 220, true));

  const wz = (id, name, titel, bild) => el('button', {
    class: 'kt-wz' + (_kt.werkzeug === id ? ' an' : ''), title: titel,
    onclick: () => { _kt.werkzeug = id; _kt.messenVon = null; neu(); }
  }, el('span', { class: 'kt-wzbild', html: bild }), name);

  return [
    el('div', { class: 'kt-leistezeile' },
      el('div', { class: 'kt-titelblock' },
        el('button', { class: 'kt-titel', title: 'Namen und Aussehen ändern', onclick: () => planEinrichten(doc, neu) },
          el('b', {}, plan.titel),
          plan.unterzeile ? el('small', {}, plan.unterzeile) : null),
        el('span', { class: 'kt-zahlen' }, z.haeuser + ' Häuser  ·  ' + z.marken + (z.marken === 1 ? ' Marke' : ' Marken'))),
      el('div', { class: 'kt-suche' }, el('span', { class: 'kt-lupe', html: ik('suche') }), suchfeld, treffer),
      el('div', { class: 'kt-werkzeuge' },
        wz('hand', 'Hand', 'Schauen und schieben (1)', KT_WZ_HAND),
        wz('marke', 'Marke', 'Eine Stelle benennen — auf die Karte tippen (2)', KT_WZ_MARKE),
        wz('messen', 'Messen', 'Wie weit ist es? Zwei Stellen antippen (3)', KT_WZ_MESSEN)),
      el('div', { class: 'kt-knopfreihe' },
        el('button', { class: 'kt-wk', title: 'Kleiner (−)', onclick: () => planZoom(-0.2, flaeche, neu) }, '−'),
        el('button', { class: 'kt-wk zahl', title: 'Normalgröße (0)', onclick: () => { _kt.zoom = 1; neu(); } }, Math.round(_kt.zoom * 100) + '%'),
        el('button', { class: 'kt-wk', title: 'Größer (+)', onclick: () => planZoom(0.2, flaeche, neu) }, '+'),
        el('button', { class: 'kt-wk', title: 'Ganz einpassen', onclick: () => planEinpassen(flaeche, neu) }, '⤢'),
        el('button', { class: 'kt-werkzeugknopf' + (_kt.zeigeNamen ? ' an' : ''), title: 'Namen zeigen oder ausblenden (n)', onclick: () => { _kt.zeigeNamen = !_kt.zeigeNamen; neu(); } }, 'Namen'),
        el('button', { class: 'kt-werkzeugknopf', title: 'Welche Ebenen liegen auf dem Blatt? (e)', onclick: () => planEbenenwahl(neu) }, 'Ebenen'),
        zugKnopf(neu),
        el('button', { class: 'kt-werkzeugknopf', title: 'Alle Marken und Gassen (v)', onclick: () => planVerzeichnis(doc, neu) }, 'Verzeichnis'),
        el('button', { class: 'kt-werkzeugknopf', title: 'Aussehen, Lage, Größe', onclick: () => planEinrichten(doc, neu) }, 'Der Grundriss'),
        el('button', { class: 'kt-zuknopf', title: 'Die Karte einrollen', onclick: () => schliessen() }, '×'))),
    _kt.werkzeug === 'marke' ? planMarkenwahl(neu) : null,
    _kt.werkzeug === 'messen' ? el('div', { class: 'kt-hinweiszeile' }, 'Tipp zwei Stellen an — VANI sagt dir, wie lange man dazwischen geht.') : null
  ];
}

/* Die Ebenenwahl: ein kleines Fenster mit einem Schalter je Ebene.
   Kein Speichern — wer die Karte wieder aufschlägt, sieht sie ganz. */
function planEbenenwahl(neu) {
  const liste = el('div', { class: 'kt-ebenenliste' });
  const zu = zeigeDeck(el('div', { class: 'modal kt-ebenenfenster' },
    el('div', { class: 'kartenkopf' }, 'EBENEN'),
    el('small', { class: 'kt-ebenenhilfe' }, 'Was liegt auf dem Blatt? Nimm weg, was gerade stört — die Stadt bleibt, wie sie ist.'),
    liste,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { for (const [f] of KT_EBENEN) _kt[f] = f !== 'zeigeRundgang'; zeichnen(); neu(); } }, 'Alles zeigen'),
      el('button', { class: 'knopf voll', onclick: () => zu() }, 'Fertig'))));

  const zeichnen = () => {
    liste.innerHTML = '';
    for (const [feld, name, , was] of KT_EBENEN) {
      const an = _kt[feld] !== false;
      liste.append(el('button', {
        class: 'ktg-schalter' + (an ? ' an' : ''),
        onclick: () => { _kt[feld] = !(_kt[feld] !== false); zeichnen(); neu(); }
      }, el('i', {}), el('b', {}, name), el('small', {}, was)));
    }
  };
  zeichnen();
  return zu;
}

function planMarkenwahl(neu) {
  const reihe = el('div', { class: 'kt-markenwahl' });
  for (const [gid, gname] of PLAN_MARKENGRUPPEN) {
    reihe.append(el('span', { class: 'kt-mwgruppe' }, gname));
    for (const m of PLAN_MARKEN.filter((x) => x.gruppe === gid)) {
      reihe.append(el('button', {
        class: 'kt-mw' + (_kt.markeArt === m.id ? ' an' : ''), title: m.name,
        onclick: () => { _kt.markeArt = m.id; neu(); }
      }, el('span', { html: planMarkenSymbol(m.id, 17) })));
    }
  }
  return reihe;
}

function planHinschauen(flaeche, x, y) {
  if (!flaeche) return;
  flaeche.scrollTo({
    left: x * _kt.zoom - flaeche.clientWidth / 2,
    top: y * _kt.zoom - flaeche.clientHeight / 2,
    behavior: 'smooth'
  });
}

const KT_ZIRKEL = '<svg viewBox="0 0 60 90" width="60" height="90" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
  '<circle cx="30" cy="9" r="5" fill="currentColor" fill-opacity=".2"/>' +
  '<path d="M28 13 L12 80"/><path d="M32 13 L48 80"/>' +
  '<path d="M12 80 l-3 7 l6 -2 z" fill="currentColor"/><path d="M48 80 l3 7 l-6 -2 z" fill="currentColor"/>' +
  '<path d="M20 46 q10 5 20 0" stroke-width="1.6"/></svg>';

const KT_WZ_HAND = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-6-2.5-6-6v-3a1.5 1.5 0 0 1 3 0"/></svg>';
const KT_WZ_MARKE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>';
const KT_WZ_MESSEN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 21 7"/><path d="M6 13v3M10 11v3M14 9v3M18 7v3"/></svg>';

/* ===================== DAS BLATT ===================== */
function planSVG(plan, g, neu) {
  const welt = planFarbwelt(plan.welt);
  const papier = planPapier(plan.papier || welt.papier);
  const G = PLAN_GROESSE;
  let svg = kv('svg', {
    viewBox: '0 0 ' + G + ' ' + G,
    width: Math.round(G * _kt.zoom), height: Math.round(G * _kt.zoom),
    class: 'kt-blatt', 'shape-rendering': 'geometricPrecision'
  });
  const defs = planDefs(plan, welt, papier);
  /* Der Zuschnitt: alles Gezeichnete liegt in dieser Form, was daneben
     faellt, bleibt Papier. Genau das macht aus einem Ausschnitt ein Bild. */
  const clip = kv('clipPath', { id: 'kt-zuschnitt' });
  clip.append(planZuschnittForm(plan.zuschnitt));
  defs.append(clip);
  svg.append(defs);

  /* --- Das Papier --- */
  svg.append(kv('rect', { x: 0, y: 0, width: G, height: G, fill: papier[2] }));
  svg.append(kv('rect', { x: 0, y: 0, width: G, height: G, fill: 'url(#kt-faser)' }));
  /* Alles Weitere wird beschnitten. */
  const bild = kv('g', { class: 'kt-bild', 'clip-path': plan.zuschnitt === 'blatt' ? null : 'url(#kt-zuschnitt)' });
  const svgEcht = svg;
  svg = { append: (...k) => bild.append(...k), addEventListener: (...a) => svgEcht.addEventListener(...a), querySelector: (q) => svgEcht.querySelector(q), getBoundingClientRect: () => svgEcht.getBoundingClientRect(), classList: svgEcht.classList, setAttribute: (...a) => svgEcht.setAttribute(...a) };

  /* --- Das Umland --- */
  const gUmland = kv('g', { class: 'kt-umland' });
  for (const f of g.umland.felder) {
    gUmland.append(kv('path', { d: kpfad(f.ecken, true), class: 'kt-feld' + (f.gepfluegt ? ' gepfluegt' : ''), fill: f.gepfluegt ? 'url(#kt-acker)' : 'url(#kt-wiese)' }));
  }
  for (const w of g.umland.waelder) {
    /* Ein Wald ist keine Kachel: sein Rand ist weich, und die Kronen stehen
       unregelmaessig darin. */
    gUmland.append(kv('path', { d: kweich(w.ecken, true), class: 'kt-waldgrund', fill: welt.gruendunkel }));
    const wieViele = w.gross ? 22 : 7;
    for (let t = 0; t < wieViele; t++) {
      const p = netzPunktDrin(w.ecken, plan.saat, 'wt' + w.n + '_' + t);
      gUmland.append(planBaum(p[0], p[1], 3.2 + planZufall(plan.saat, 'wtr' + w.n + t) * 2.6, welt));
    }
  }
  for (const h of g.umland.hoefe) {
    gUmland.append(kv('rect', { x: kz(h.punkt[0] - 5), y: kz(h.punkt[1] - 4), width: 10, height: 8, class: 'kt-hof' }));
  }
  svg.append(gUmland);

  /* --- Das Wasser --- */
  const gWasser = kv('g', { class: 'kt-wasser' });
  if (g.wasser.art === 'insel') {
    /* Draußen ist Wasser: das ganze Blatt, die Insel ausgespart. */
    gWasser.append(kv('path', {
      d: 'M 0 0 H ' + G + ' V ' + G + ' H 0 Z ' + kpfad(g.wasser.insel, true),
      'fill-rule': 'evenodd', fill: 'url(#kt-tiefe)'
    }));
    gWasser.append(kv('path', { d: kweich(g.wasser.insel, true), class: 'kt-ufer', stroke: welt.wasserrand }));
    planUferstriche(gWasser, g.wasser.insel, true, welt, -1);
  } else {
    for (const poly of g.wasser.polygone) {
      gWasser.append(kv('path', { d: kweich(poly, true), fill: 'url(#kt-tiefe)' }));
    }
    if (g.wasser.art === 'fluss') {
      gWasser.append(kv('path', { d: kweich(g.wasser.links), class: 'kt-ufer', stroke: welt.wasserrand }));
      gWasser.append(kv('path', { d: kweich(g.wasser.rechts), class: 'kt-ufer', stroke: welt.wasserrand }));
      planUferstriche(gWasser, g.wasser.links, false, welt, 1);
      planUferstriche(gWasser, g.wasser.rechts, false, welt, -1);
    } else if (g.wasser.art === 'kueste') {
      gWasser.append(kv('path', { d: kweich(g.wasser.linie), class: 'kt-ufer', stroke: welt.wasserrand }));
      planUferstriche(gWasser, g.wasser.linie, false, welt, 1);
    } else if (g.wasser.art === 'see' && g.wasser.polygone[0]) {
      gWasser.append(kv('path', { d: kweich(g.wasser.polygone[0], true), class: 'kt-ufer', stroke: welt.wasserrand }));
      planUferstriche(gWasser, g.wasser.polygone[0], true, welt, 1);
    }
  }
  /* Punktierung in der Tiefe: wo die Uferstriche schon ausgelaufen sind,
     bleibt kein leeres Blau, sondern ein feines Korn. */
  if (g.wasser.art !== 'keins') {
    let korn = '';
    for (let i = 0; i < 900; i++) {
      const x = planZufall(plan.saat, 'kx' + i) * G;
      const y = planZufall(plan.saat, 'ky' + i) * G;
      if (!g.wasser.drin(x, y)) continue;
      korn += ' M ' + kz(x) + ' ' + kz(y) + ' h .01';
    }
    gWasser.append(kv('path', { d: korn.trim(), class: 'kt-wasserkorn' }));
  }
  svg.append(gWasser);

  /* --- Die Werder ---
     Sie liegen im Wasser und müssen deshalb darüber, aber unter allem,
     was an Land steht. */
  if (g.inseln && g.inseln.length) svg.append(planInselnZeichnen(g.inseln, welt, plan.saat, papier[2]));

  /* --- Die Blöcke: ein ruhiger Grund unter den Häusern --- */
  const gBloecke = kv('g', { class: 'kt-bloecke' });
  for (const b of g.stadt.bloecke) {
    const gruen = b.sonder === 'garten' || b.sonder === 'friedhof';
    gBloecke.append(kv('path', {
      d: kweich(b.ecken, true),
      fill: gruen ? 'url(#kt-wiese)' : welt.strasse,
      class: 'kt-block' + (gruen ? ' gruen' : '')
    }));
  }
  svg.append(gBloecke);

  /* --- Der Marktplatz --- */
  if (g.stadt.markt.length) {
    svg.append(kv('path', { d: kweich(g.stadt.markt, true), fill: 'url(#kt-pflaster)', class: 'kt-markt' }));
    svg.append(kv('path', { d: kweich(g.stadt.markt, true), class: 'kt-marktrand' }));
  }

  /* --- Die Straßen: zweimal, damit sie zu einem Netz verschmelzen --- */
  const gStrassenRand = kv('g', { class: 'kt-strassenrand' });
  const gStrassen = kv('g', { class: 'kt-strassen' });
  /* Eine Landstraße ist schmaler als eine Hauptstraße in der Stadt —
     draußen wird nicht gepflastert. */
  const breiteVon = (s) => s.art === 'haupt' ? 13 : s.art === 'ring' ? 10 : s.art === 'mauerweg' ? 11 : s.art === 'land' ? 9 : 7;
  for (const s of g.stadt.strassen) {
    /* Was im Wasser laege, wird gar nicht erst gezeichnet — vorher liefen die
       Ausfallstrassen ungeruehrt ins Meer hinaus. */
    for (const stueck of planTrockeneWege(s.punkte, g.wasser, !!s.geschlossen)) {
      const d = kweich(stueck.punkte, stueck.geschlossen);
      gStrassenRand.append(kv('path', { d, class: 'kt-strassekante', 'stroke-width': breiteVon(s) + 3.4 }));
      gStrassen.append(kv('path', { d, class: 'kt-strasse art-' + s.art, 'stroke-width': breiteVon(s), stroke: welt.strasse }));
    }
  }
  svg.append(gStrassenRand, gStrassen);

  /* --- Die Häuser --- */
  const gHaeuser = kv('g', { class: 'kt-haeuser' });
  for (const h of g.stadt.haeuser) {
    if (h.sonder === 'kirche') { gHaeuser.append(planKirche(h, welt)); continue; }
    const toene = welt.daecher || [welt.dach];
    gHaeuser.append(kv('path', {
      d: kpfad(h.umriss || h.ecken, true),
      class: 'kt-haus' + (h.gross ? ' gross' : ''),
      fill: h.gross ? welt.dachdunkel : toene[h.ton % toene.length]
    }));
  }
  svg.append(gHaeuser);

  /* --- Gärten und Friedhöfe bekommen ihre Zeichen --- */
  const gGruen = kv('g', { class: 'kt-gruenzeug' });
  for (const b of g.stadt.bloecke) {
    if (b.sonder === 'garten') {
      for (let t = 0; t < 9; t++) {
        const p = netzPunktDrin(b.ecken, plan.saat, 'g' + b.i + b.j + t);
        gGruen.append(planBaum(p[0], p[1], 3 + planZufall(plan.saat, 'gr' + b.i + b.j + t) * 2.2, welt));
      }
    } else if (b.sonder === 'friedhof') {
      for (let t = 0; t < 12; t++) {
        const p = netzPunktDrin(b.ecken, plan.saat, 'f' + b.i + b.j + t);
        gGruen.append(kv('path', { d: 'M ' + kz(p[0]) + ' ' + kz(p[1] - 4) + ' v 7 M ' + kz(p[0] - 2.4) + ' ' + kz(p[1] - 1.4) + ' h 4.8', class: 'kt-grabkreuz' }));
      }
    }
  }
  svg.append(gGruen);

  /* --- Die Mauer --- */
  if (g.stadt.mauer) {
    const gm = kv('g', { class: 'kt-mauerwerk' });
    gm.append(kv('path', { d: kweich(g.stadt.mauer.punkte, true), class: 'kt-mauer' }));
    gm.append(kv('path', { d: kweich(g.stadt.mauer.punkte, true), class: 'kt-mauerzinnen' }));
    for (const t of g.stadt.mauer.tuerme) {
      gm.append(kv('circle', { cx: kz(t.punkt[0]), cy: kz(t.punkt[1]), r: 6.5, class: 'kt-turm' }));
    }
    for (const t of g.stadt.mauer.tore) {
      gm.append(kv('rect', { x: kz(t.punkt[0] - 7), y: kz(t.punkt[1] - 7), width: 14, height: 14, rx: 1.5, class: 'kt-tor' }));
      gm.append(kv('path', { d: 'M ' + kz(t.punkt[0] - 3) + ' ' + kz(t.punkt[1] + 7) + ' v -6 a 3 3 0 0 1 6 0 v 6', class: 'kt-torbogen' }));
    }
    svg.append(gm);
  }

  /* --- Die Burg --- */
  if (g.stadt.burg) svg.append(planBurg(g.stadt.burg, welt, plan.saat));

  /* --- Die Brücken --- */
  for (const b of g.stadt.bruecken) {
    const gb = kv('g', { class: 'kt-bruecke', transform: 'translate(' + kz(b.punkt[0]) + ' ' + kz(b.punkt[1]) + ') rotate(' + Math.round(b.winkel) + ')' });
    gb.append(kv('rect', { x: -6, y: -11, width: 12, height: 22, rx: 1, class: 'kt-brueckenkoerper' }));
    gb.append(kv('path', { d: 'M -6 -6 H 6 M -6 6 H 6', class: 'kt-brueckenstrich' }));
    svg.append(gb);
  }

  /* --- Was auf dem Markt steht ---
     Brunnen, Rathaus, Pranger, Stände. Vorher lag genau in der Mitte der
     Karte eine gepflasterte Leerstelle — dort, wo das Auge zuerst hinsieht. */
  if (g.marktplatz) svg.append(planMarktZeichnen(g.marktplatz, welt, plan.saat));

  /* --- Der Hafen ---
     Er greift vom Land ins Wasser und gehört deshalb über beides. */
  if (g.hafen && g.hafen.hat) svg.append(planHafenZeichnen(g.hafen, welt, plan.saat));

  /* --- Die Mühle --- */
  if (g.muehle) svg.append(planMuehleZeichnen(g.muehle, welt));

  /* --- Hügel im Umland ---
     Leeres Land ist totes Land. Hügel mit Schraffur auf der Schattenseite
     sind das älteste Mittel, einer Karte Gelände zu geben — und sie füllen
     genau die Flächen, die sonst leer bleiben. */
  if (plan.stadt.umland) svg.append(planHuegel(plan, g, welt));

  /* --- Was auf dem Wasser fährt ---
     Ein Schiff auf der Reede, ein Wesen in der Tiefe. Kein Kartograf hat je
     eine leere Wasserfläche stehen lassen. */
  if (g.wasser.art !== 'keins') svg.append(planWasserleben(plan, g, welt));

  /* --- Namen: Gassen, Viertel, Tore --- */
  svg.append(planNamen(plan, g, welt));

  /* --- Kompass, Maßstab, Kartusche --- */
  svg.append(planKompass(G - 128, 128, plan));
  /* Der Maßstab stand links unten — genau dort, wo jetzt die Blasonierung
     unter der Kartusche steht; „400 Schritt“ lag mitten im Wappenspruch.
     Er rückt in die Lücke zwischen Kartusche und Zeichenerklärung. */
  svg.append(planMassstab(G / 2 - 38, G - 68));
  svg.append(planKartusche(plan, g));
  /* Die Zeichenerklärung steht der Kartusche gegenüber — unten rechts,
     wo auf jedem gestochenen Blatt die Legende steht. */
  if (g.legende && g.legende.length) {
    const spalten = g.legende.length > 8 ? 2 : 1;
    const breite = 16 + spalten * 132;
    const hoehe = 34 + Math.ceil(g.legende.length / spalten) * 15.5;
    svg.append(planLegendeSVG(g.legende, G - 62 - breite, G - 58 - hoehe, welt));
  }

  /* --- Wohin die Straßen führen ---
     Auf jeder alten Karte steht am Blattrand, wohin eine Ausfallstraße
     geht. Das ist der billigste Trick der Kartografie, um eine Stadt in
     eine Welt zu setzen: plötzlich gibt es ein Dahinter. */
  if (g.nachbarn && g.nachbarn.length) svg.append(planNachbarnZeichnen(g.nachbarn, welt));

  /* --- Das Gradnetz ---
     Die Striche am Randband deuten es an; hier laufen sie wirklich über
     das Blatt. Ganz blass: ein Gradnetz soll man finden, wenn man es
     sucht, und übersehen, wenn man die Stadt anschaut. */
  svg.append(planGradnetz());

  /* --- Der Rundgang ---
     Marken sind einzelne Punkte. Der Rundgang macht daraus einen Weg. */
  if (_kt.zeigeRundgang) svg.append(planRundgangZeichnen(plan));

  /* --- Das Papier altert -----
     Ohne das hier ist es eine Vektorgrafik. Mit Stockflecken, Faltlinien und
     einem Schatten in den Ecken ist es ein Blatt, das schon eine Weile auf
     einem Tisch liegt. */
  svg.append(planAlterung(plan, g));

  /* --- Marken kommen in eine eigene Ebene obenauf --- */
  svg.append(kv('g', { class: 'kt-markenebene' }));

  svgEcht.append(bild);
  /* --- Der Rand liegt AUF dem Zuschnitt, nicht darin --- */
  svgEcht.append(planRandwerk(welt, plan.zuschnitt));

  /* --- Tippen auf die Karte --- */
  svgEcht.addEventListener('click', (ev) => {
    if (ev.target.closest && ev.target.closest('.kt-marke')) return;
    const p = planPunktAus(svg, ev);
    if (!p) return;
    if (_kt.werkzeug === 'marke') { planMarkeAnlegen(D.docs.get(_kt.id), p.x, p.y, neu); return; }
    if (_kt.werkzeug === 'messen') {
      if (!_kt.messenVon) _kt.messenVon = { x: p.x, y: p.y };
      else _kt.messenBis = { x: p.x, y: p.y };
      neu();
      return;
    }
    if (_kt.nurMarke) { _kt.nurMarke = ''; neu(); }
  });
  return svgEcht;
}

/* Die Form, in die die Karte geschnitten ist. */
/* Das Gradnetz — dieselbe Teilung wie am Randband, damit die Striche
   dort aufhören, wo die Felder anfangen. */
/* Ein Wegweiser am Blattrand: eine Hand, ein Name, eine Gehzeit. */
function planNachbarnZeichnen(orte, welt) {
  const g = kv('g', { class: 'kt-nachbarn' });
  const G = PLAN_GROESSE;
  for (const o of orte) {
    /* Die Beschriftung rückt vom Rand weg ins Blatt hinein, sonst liegt
       sie im Randband. */
    /* Weit genug herein, dass Pfeil UND Schrift auf dem Papier stehen —
       am Rand verschwand die Beschriftung unter dem Randband. */
    const ein = 74;
    const x = Math.max(PLAN_FELD_RAND + ein, Math.min(G - PLAN_FELD_RAND - ein, o.punkt[0]));
    const y = Math.max(PLAN_FELD_RAND + ein, Math.min(G - PLAN_FELD_RAND - ein, o.punkt[1]));
    const grad = Math.round(o.richtung * 180 / Math.PI);
    /* Kopfüber liest sich nichts: über neunzig Grad wird umgedreht. */
    const gedreht = grad > 90 || grad < -90;
    const gr = kv('g', { class: 'kt-nachbar', transform: 'translate(' + kz(x) + ' ' + kz(y) + ') rotate(' + (gedreht ? grad + 180 : grad) + ')' });
    const seite = gedreht ? -1 : 1;
    /* Der Pfeil zeigt IMMER nach draußen, auch wenn die Schrift gedreht ist. */
    gr.append(kv('path', {
      d: 'M ' + kz(seite * 4) + ' 0 H ' + kz(seite * 15) + ' M ' + kz(seite * 15) + ' 0 l ' + kz(-seite * 4) + ' -2.8 M ' + kz(seite * 15) + ' 0 l ' + kz(-seite * 4) + ' 2.8',
      class: 'kt-nachbarpfeil'
    }));
    const t = kv('text', { x: kz(seite * 19), y: -2, class: 'kt-nachbarname', 'text-anchor': gedreht ? 'end' : 'start' });
    t.textContent = 'Nach ' + o.name;
    gr.append(t);
    const u = kv('text', { x: kz(seite * 19), y: 8, class: 'kt-nachbarzeit', 'text-anchor': gedreht ? 'end' : 'start' });
    u.textContent = o.stunden + (o.stunden === 1 ? ' Stunde' : ' Stunden') + ' zu Fuß';
    gr.append(u);
    g.append(gr);
  }
  return g;
}

function planGradnetz() {
  const G = PLAN_GROESSE;
  const g = kv('g', { class: 'kt-gradnetz', 'aria-hidden': 'true' });
  const AUSSEN = 30, BAND = 12, ECKE = 26;
  const innen = AUSSEN + BAND;
  const felder = 24;
  const feld = (G - (innen + ECKE) * 2) / felder;
  let d = '';
  for (let i = 0; i <= felder; i++) {
    const a = innen + ECKE + i * feld;
    d += ' M ' + kz(a) + ' ' + kz(innen) + ' V ' + kz(G - innen);
    d += ' M ' + kz(innen) + ' ' + kz(a) + ' H ' + kz(G - innen);
  }
  g.append(kv('path', { d: d.trim(), class: 'kt-gradlinie' }));
  return g;
}

/* Der Rundgang: der Weg selbst und an jeder Marke eine Nummer. */
function planRundgangZeichnen(plan) {
  const g = kv('g', { class: 'kt-rundgang' });
  const rund = planRundgang(plan, plan.marken);
  if (rund.punkte.length < 3) return g;
  const d = kweich(rund.punkte);
  g.append(kv('path', { d, class: 'kt-rundweg-rand' }));
  g.append(kv('path', { d, class: 'kt-rundweg' }));
  rund.marken.forEach((m, i) => {
    g.append(kv('circle', { cx: kz(m.x), cy: kz(m.y - 17), r: 8, class: 'kt-rundnummer' }));
    const t = kv('text', { x: kz(m.x), y: kz(m.y - 13.4), class: 'kt-rundziffer', 'text-anchor': 'middle' });
    t.textContent = String(i + 1);
    g.append(t);
  });
  return g;
}

function planZuschnittForm(art) {
  const G = PLAN_GROESSE, m = G / 2, r = G / 2 - 34;
  if (art === 'kreis') return kv('circle', { cx: m, cy: m, r });
  if (art === 'oval') return kv('ellipse', { cx: m, cy: m, rx: r, ry: r * 0.78 });
  if (art === 'bogen') {
    return kv('path', { d: 'M 34 ' + kz(m + r * 0.72) + ' V ' + kz(m) + ' A ' + kz(r) + ' ' + kz(r) + ' 0 0 1 ' + kz(G - 34) + ' ' + kz(m) + ' V ' + kz(m + r * 0.72) + ' Z' });
  }
  if (art === 'achteck') {
    const a = G * 0.2;
    return kv('path', { d: 'M ' + kz(a) + ' 34 H ' + kz(G - a) + ' L ' + kz(G - 34) + ' ' + kz(a) + ' V ' + kz(G - a) + ' L ' + kz(G - a) + ' ' + kz(G - 34) + ' H ' + kz(a) + ' L 34 ' + kz(G - a) + ' V ' + kz(a) + ' Z' });
  }
  return kv('rect', { x: 24, y: 24, width: G - 48, height: G - 48 });
}

/* Wo auf der Karte wurde getippt? */
function planPunktAus(svg, ev) {
  const r = svg.getBoundingClientRect();
  if (!r.width) return null;
  return {
    x: ((ev.clientX - r.left) / r.width) * PLAN_GROESSE,
    y: ((ev.clientY - r.top) / r.height) * PLAN_GROESSE
  };
}

/* Uferstriche: Linien, die dem Ufer folgen und nach außen blasser werden.
   Das älteste Mittel der Kartografie, um Wasser als Wasser zu zeigen. */
/* Uferstriche — das älteste und schönste Mittel der Kartografie.
   Nicht drei Linien in großem Abstand, sondern ZWÖLF: dicht am Ufer eng
   beieinander, nach außen immer weiter auseinander und immer blasser. Sie
   füllen die Wasserfläche, ohne sie zuzudecken — und erst dadurch sieht
   Wasser nach Wasser aus statt nach blauem Papier. */
/* Die Geometrie der Uferstriche — ohne Zeichnen, damit sie sich prüfen
   lässt. Gibt für eine Stufe die Stücke zurück, aus denen der Strich besteht. */
function planUferlinien(linie, stufe, richtung) {
  const n = linie.length;
  if (n < 3) return [];
  const richtungen = planUferNormalen(linie);
  let abstand = 0;
  for (let s = 1; s <= stufe; s++) abstand += 3.2 + s * 1.15;
  const stuecke = [];
  let lauf = [];
  for (let i = 0; i < n; i++) {
    const r = richtungen[i];
    if (!r) { if (lauf.length > 2) stuecke.push(lauf); lauf = []; continue; }
    const zittern = Math.sin(i * 0.7 + stufe * 1.3) * stufe * 0.34;
    const weit = (abstand + zittern) * richtung;
    lauf.push([linie[i][0] - r[1] * weit, linie[i][1] + r[0] * weit]);
  }
  if (lauf.length > 2) stuecke.push(lauf);
  return stuecke;
}

function planUferstriche(g, linie, geschlossen, welt, richtung) {
  const n = linie.length;
  if (n < 3) return;
  /* Die Richtung „nach außen“ steht senkrecht auf dem Ufer. Sie über den
     übernächsten Nachbarn zu bestimmen ist bequem — aber an einer KEHRE geht
     es schief: ein Flusspolygon läuft die eine Seite hinunter und die andere
     wieder herauf, und am Umkehrpunkt zeigen Vorgänger und Nachfolger fast
     genau aufeinander. Dann ist die Differenz beinahe null, die Normale kippt
     ins Beliebige, und aus den Uferstrichen wird ein Fächer, der über das
     halbe Blatt schießt. (Genau das war zu sehen.)

     Also: die Normale aus den beiden ANLIEGENDEN Strecken mitteln, und an
     einer echten Kehre den Punkt lieber auslassen. */
  for (let s = 1; s <= 12; s++) {
    /* Die Striche brechen an den Kehren ab, laufen also in Stücken. */
    const stuecke = planUferlinien(linie, s, richtung);
    const zu = geschlossen && stuecke.length === 1 && stuecke[0].length === n;
    for (const st of stuecke) {
      g.append(kv('path', {
        d: kweich(st, zu), class: 'kt-uferstrich',
        stroke: welt.wasserrand,
        'stroke-width': (1.4 - s * 0.05).toFixed(2),
        'stroke-opacity': (0.92 * Math.pow(1 - s / 14, 1.15)).toFixed(3)
      }));
    }
  }
}

/* Für jeden Punkt die Richtung „nach außen“ — oder null an einer Kehre. */
function planUferNormalen(linie) {
  const n = linie.length;
  const richtungen = [];
  for (let i = 0; i < n; i++) {
    const vor = linie[(i - 1 + n) % n], hier = linie[i], nach = linie[(i + 1) % n];
    const e1 = [hier[0] - vor[0], hier[1] - vor[1]];
    const e2 = [nach[0] - hier[0], nach[1] - hier[1]];
    const l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
    const u1 = [e1[0] / l1, e1[1] / l1], u2 = [e2[0] / l2, e2[1] / l2];
    /* Kehre? Dann kein Strich an dieser Stelle. */
    if (u1[0] * u2[0] + u1[1] * u2[1] < -0.55) { richtungen.push(null); continue; }
    const mx = u1[0] + u2[0], my = u1[1] + u2[1];
    const ml = Math.hypot(mx, my);
    if (ml < 0.2) { richtungen.push(null); continue; }
    richtungen.push([mx / ml, my / ml]);
  }
  return richtungen;
}

function planKirche(h, welt) {
  const g = kv('g', { class: 'kt-kirche' });
  const [a, b, c, d] = h.ecken;
  const mx = (a[0] + b[0] + c[0] + d[0]) / 4, my = (a[1] + b[1] + c[1] + d[1]) / 4;
  const w = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  const lang = strecke(a, b) * 0.62, breit = strecke(a, d) * 0.5;
  const gg = kv('g', { transform: 'translate(' + kz(mx) + ' ' + kz(my) + ') rotate(' + Math.round(w) + ')' });
  gg.append(kv('path', {
    d: 'M ' + kz(-lang / 2) + ' ' + kz(-breit / 4) + ' H ' + kz(lang / 6) + ' V ' + kz(-breit / 2) +
      ' H ' + kz(lang / 3) + ' V ' + kz(breit / 2) + ' H ' + kz(lang / 6) + ' V ' + kz(breit / 4) +
      ' H ' + kz(-lang / 2) + ' Z',
    class: 'kt-kirchekoerper', fill: welt.dachdunkel
  }));
  gg.append(kv('path', { d: 'M ' + kz(-lang / 2 - 3) + ' 0 v -8 m 0 3 h -3 m 3 0 h 3', class: 'kt-kirchekreuz' }));
  g.append(gg);
  return g;
}

function planBurg(burg, welt, saat) {
  const g = kv('g', { class: 'kt-burg', transform: 'translate(' + kz(burg.mitte[0]) + ' ' + kz(burg.mitte[1]) + ') rotate(' + Math.round(burg.winkel) + ')' });
  const s = burg.groesse;
  g.append(kv('rect', { x: kz(-s / 2), y: kz(-s / 2), width: kz(s), height: kz(s), class: 'kt-burgmauer', fill: welt.mauer }));
  for (const [ex, ey] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    g.append(kv('circle', { cx: kz(ex * s / 2), cy: kz(ey * s / 2), r: kz(s * 0.16), class: 'kt-burgturm', fill: welt.mauer }));
  }
  g.append(kv('rect', { x: kz(-s * 0.17), y: kz(-s * 0.17), width: kz(s * 0.34), height: kz(s * 0.34), class: 'kt-bergfried', fill: welt.dachdunkel }));
  return g;
}

/* ===================== NAMEN AUF DER KARTE ===================== */
function planNamen(plan, g, welt) {
  const gruppe = kv('g', { class: 'kt-namen' });
  const defs = kv('defs', {});
  gruppe.append(defs);

  /* Gassennamen laufen der Gasse nach. Nur die breiteren — sonst wird es
     ein Buchstabensalat. */
  let nr = 0;
  for (const s of g.stadt.strassen) {
    if (s.art === 'gasse') continue;
    const name = planStrassenname(plan, s);
    if (!name) continue;
    const id = 'kt-gasse-' + (nr++);
    /* Der Text soll nicht auf dem Kopf stehen: bei Speichen, die nach links
       zeigen, den Weg umdrehen. */
    let punkte = s.punkte;
    if (s.richtung === 'speiche' && punkte[punkte.length - 1][0] < punkte[0][0]) punkte = punkte.slice().reverse();
    defs.append(kv('path', { id, d: kweich(punkte, !!s.geschlossen), fill: 'none' }));
    const t = kv('text', { class: 'kt-gassenname art-' + s.art, dy: -3.4 });
    const tp = kv('textPath', { href: '#' + id, startOffset: s.richtung === 'ring' ? '18%' : '58%' });
    tp.textContent = name;
    t.append(tp);
    gruppe.append(t);
  }

  /* Viertelnamen: gesperrt gesetzt, wie ein Stempel. */
  for (const v of g.stadt.viertel) {
    const drin = g.stadt.bloecke.filter((b) => !b.vorstadt && b.viertel && b.viertel.nr === v.nr);
    if (drin.length < 2) continue;
    const mx = drin.reduce((s2, b) => s2 + b.mitte[0], 0) / drin.length;
    const my = drin.reduce((s2, b) => s2 + b.mitte[1], 0) / drin.length;
    const t = kv('text', { x: kz(mx), y: kz(my), class: 'kt-viertelname', 'text-anchor': 'middle' });
    t.textContent = planViertelnameVon(plan, v).toUpperCase();
    gruppe.append(t);
  }

  /* Die Tore */
  if (g.stadt.mauer) {
    for (const tor of g.stadt.mauer.tore) {
      const t = kv('text', { x: kz(tor.punkt[0]), y: kz(tor.punkt[1] - 12), class: 'kt-torname', 'text-anchor': 'middle' });
      t.textContent = planTornameVon(plan, tor);
      gruppe.append(t);
    }
  }
  return gruppe;
}

/* ===================== KOMPASS, MASSSTAB, KARTUSCHE ===================== */
function planKompass(x, y, plan) {
  const g = kv('g', { class: 'kt-kompass', transform: 'translate(' + x + ' ' + y + ')' });
  const dreh = planStreu(plan.saat, 'kompass') * 4;
  const innen = kv('g', { transform: 'rotate(' + dreh.toFixed(1) + ')' });
  innen.append(kv('circle', { r: 44, class: 'kt-kompassring' }));
  innen.append(kv('circle', { r: 36, class: 'kt-kompassring zart' }));
  for (let i = 0; i < 16; i++) {
    const w = (i / 16) * Math.PI * 2;
    const lang = i % 4 === 0 ? 10 : i % 2 === 0 ? 6 : 3.5;
    innen.append(kv('path', {
      d: 'M ' + kz(Math.cos(w) * 36) + ' ' + kz(Math.sin(w) * 36) + ' L ' + kz(Math.cos(w) * (36 + lang)) + ' ' + kz(Math.sin(w) * (36 + lang)),
      class: 'kt-kompassstrich'
    }));
  }
  /* Die Windrose: vier lange Spitzen, vier kurze, halb hell, halb dunkel. */
  for (let i = 0; i < 4; i++) {
    const w = i * 90 - 90;
    innen.append(kv('path', { d: 'M 0 0 L ' + kz(Math.cos((w - 8) * Math.PI / 180) * 12) + ' ' + kz(Math.sin((w - 8) * Math.PI / 180) * 12) + ' L ' + kz(Math.cos(w * Math.PI / 180) * 33) + ' ' + kz(Math.sin(w * Math.PI / 180) * 33) + ' Z', class: 'kt-nadel hell' }));
    innen.append(kv('path', { d: 'M 0 0 L ' + kz(Math.cos((w + 8) * Math.PI / 180) * 12) + ' ' + kz(Math.sin((w + 8) * Math.PI / 180) * 12) + ' L ' + kz(Math.cos(w * Math.PI / 180) * 33) + ' ' + kz(Math.sin(w * Math.PI / 180) * 33) + ' Z', class: 'kt-nadel dunkel' }));
  }
  for (let i = 0; i < 4; i++) {
    const w = i * 90 - 45;
    innen.append(kv('path', { d: 'M 0 0 L ' + kz(Math.cos((w - 10) * Math.PI / 180) * 8) + ' ' + kz(Math.sin((w - 10) * Math.PI / 180) * 8) + ' L ' + kz(Math.cos(w * Math.PI / 180) * 20) + ' ' + kz(Math.sin(w * Math.PI / 180) * 20) + ' Z', class: 'kt-nadel dunkel' }));
  }
  const n = kv('text', { x: 0, y: -50, class: 'kt-kompassbuchstabe', 'text-anchor': 'middle' });
  n.textContent = 'N';
  innen.append(n);
  g.append(innen);
  return g;
}

function planMassstab(x, y) {
  const g = kv('g', { class: 'kt-massstab', transform: 'translate(' + x + ' ' + y + ')' });
  /* Zweihundert Schritt je Feld — die Einheit, in der Leute wirklich denken. */
  const feld = 200 / PLAN_SCHRITT_PRO_EINHEIT / 2;
  for (let i = 0; i < 4; i++) {
    g.append(kv('rect', { x: kz(i * feld), y: -5, width: kz(feld), height: 10, class: 'kt-massfeld' + (i % 2 ? ' voll' : '') }));
  }
  g.append(kv('rect', { x: 0, y: -5, width: kz(feld * 4), height: 10, class: 'kt-massrahmen' }));
  const t0 = kv('text', { x: 0, y: -11, class: 'kt-masstext', 'text-anchor': 'middle' });
  t0.textContent = '0';
  const t1 = kv('text', { x: kz(feld * 4), y: -11, class: 'kt-masstext', 'text-anchor': 'middle' });
  t1.textContent = '400 Schritt';
  g.append(t0, t1);
  return g;
}

/* Die Kartusche: der Name der Stadt in einem Rahmen, wie auf jedem
   ordentlichen Kupferstich. */
/* Die Kartusche: kein Rechteck mit Text darin, sondern das Schmuckstück der
   Karte. Ein Schild mit eingerollten Enden, doppelter Rahmen, ein Fleuron
   darüber und Voluten an den Seiten — so hat es jeder Kupferstecher
   gemacht, und aus gutem Grund: hier ruht das Auge. */
function planKartusche(plan, g) {
  const G = PLAN_GROESSE;
  /* Links im Schild steht das Wappen; die Schrift rückt entsprechend nach
     rechts und wird in dem Platz zentriert, der ihr bleibt. Ohne diese
     Rechnung säße der Titel schief unter dem Schild. */
  const wappenPlatz = g.wappen ? 78 : 0;
  const breite = Math.max(280, plan.titel.length * 17 + 96) + wappenPlatz;
  const h = 92;
  const mitte = wappenPlatz + (breite - wappenPlatz) / 2;
  const gr = kv('g', { class: 'kt-kartusche', transform: 'translate(148 ' + (G - 208) + ')' });

  /* Die Voluten: eingerollte Enden links und rechts. */
  for (const seite of [-1, 1]) {
    const x = seite < 0 ? -6 : breite + 6;
    const v = kv('g', { transform: 'translate(' + kz(x) + ' ' + kz(h / 2) + ') scale(' + seite + ' 1)' });
    v.append(kv('path', { class: 'kt-volute', d: 'M 0 -30 C -20 -30 -30 -18 -30 -4 C -30 8 -21 16 -12 16 C -5 16 0 11 0 5 C 0 0 -4 -3 -8 -3 C -11 -3 -13 -1 -13 2' }));
    v.append(kv('path', { class: 'kt-volute', d: 'M 0 30 C -20 30 -30 18 -30 4' }));
    gr.append(v);
  }

  /* Das Schild */
  gr.append(kv('path', {
    class: 'kt-kartuschengrund',
    d: 'M 0 10 Q 0 0 12 0 H ' + kz(breite - 12) + ' Q ' + kz(breite) + ' 0 ' + kz(breite) + ' 10 ' +
       'V ' + kz(h - 10) + ' Q ' + kz(breite) + ' ' + kz(h) + ' ' + kz(breite - 12) + ' ' + kz(h) +
       ' H 12 Q 0 ' + kz(h) + ' 0 ' + kz(h - 10) + ' Z'
  }));
  gr.append(kv('path', {
    class: 'kt-kartuschenrahmen',
    d: 'M 7 14 Q 7 7 17 7 H ' + kz(breite - 17) + ' Q ' + kz(breite - 7) + ' 7 ' + kz(breite - 7) + ' 14 ' +
       'V ' + kz(h - 14) + ' Q ' + kz(breite - 7) + ' ' + kz(h - 7) + ' ' + kz(breite - 17) + ' ' + kz(h - 7) +
       ' H 17 Q 7 ' + kz(h - 7) + ' 7 ' + kz(h - 14) + ' Z'
  }));

  /* Ein Fleuron oben auf dem Schild */
  const fl = kv('g', { class: 'kt-kfleuron', transform: 'translate(' + kz(mitte) + ' -3)' });
  fl.append(kv('path', { d: 'M -22 0 Q -11 -9 0 -3 Q 11 -9 22 0' }));
  fl.append(kv('circle', { cx: 0, cy: -4.5, r: 2.6 }));
  fl.append(kv('path', { d: 'M -30 0 H -24 M 30 0 H 24' }));
  gr.append(fl);

  const t = kv('text', { x: kz(mitte), y: 42, class: 'kt-kartuschentitel', 'text-anchor': 'middle' });
  t.textContent = plan.titel;
  gr.append(t);
  /* Eine Zierlinie zwischen Titel und Zeile darunter */
  gr.append(kv('path', { class: 'kt-kstrich', d: 'M ' + kz(mitte - 46) + ' 52 H ' + kz(mitte - 8) +
    ' M ' + kz(mitte + 8) + ' 52 H ' + kz(mitte + 46) +
    ' M ' + kz(mitte) + ' 48 l 4 4 l -4 4 l -4 -4 Z' }));
  const u = kv('text', { x: kz(mitte), y: 70, class: 'kt-kartuschenunter', 'text-anchor': 'middle' });
  u.textContent = plan.unterzeile || (planGroesse(plan.stadt.groesse)[1] + ' — ' + g.stadt.haeuser.length + ' Häuser');
  gr.append(u);

  /* Das Wappen steht links im Schild — und darunter, außerhalb, die
     Blasonierung: klein, kursiv, in der Sprache, in der Wappen seit
     siebenhundert Jahren beschrieben werden. Sie ist der Beweis, dass an
     diesem Zeichen nichts zufällig ist. */
  if (g.wappen) {
    const gw = kv('g', { transform: 'translate(42 ' + kz(h / 2) + ')' });
    gw.append(planWappenSVG(g.wappen, 58));
    gr.append(gw);
    const bl = kv('text', { x: kz(breite / 2), y: kz(h + 20), class: 'kt-blason', 'text-anchor': 'middle' });
    bl.textContent = planBlason(g.wappen);
    gr.append(bl);
  }
  return gr;
}

function planRandwerk(welt, zuschnitt) {
  const G = PLAN_GROESSE;
  const g = kv('g', { class: 'kt-randwerk' });
  if (zuschnitt && zuschnitt !== 'blatt') {
    /* Ist die Karte beschnitten, bekommt die Schnittkante selbst den Rand —
       eine doppelte Linie, wie bei einem Kupferstich. */
    const a = planZuschnittForm(zuschnitt);
    a.setAttribute('class', 'kt-randlinie aussen');
    const b = planZuschnittForm(zuschnitt);
    b.setAttribute('class', 'kt-randlinie innen');
    b.setAttribute('transform', 'translate(' + (G / 2) + ' ' + (G / 2) + ') scale(.982) translate(' + (-G / 2) + ' ' + (-G / 2) + ')');
    g.append(a, b);
    return g;
  }
  /* Das graduierte Randband — das Erkennungszeichen jeder gestochenen Karte.
     Zwei Linien mit einem Band dazwischen, und das Band ist gefeldert:
     abwechselnd voll und leer, wie ein Lineal. Vorher standen hier nur zwei
     dünne Rechtecke und ein paar Striche; das Blatt hatte keinen Abschluss.

     Die Felder sind nicht Zierde allein, sie zählen: jedes steht für hundert
     Schritt, und der Maßstab unten sagt dasselbe noch einmal in Worten. */
  /* Weit genug nach innen, dass die Bütten­kante des Papiers das Band nicht
     anknabbert — an den Ecken verschwand es sonst im Ausriss. */
  const AUSSEN = 30, BAND = 12, ECKE = 26;
  const innen = AUSSEN + BAND;
  g.append(kv('rect', { x: AUSSEN, y: AUSSEN, width: G - AUSSEN * 2, height: G - AUSSEN * 2, class: 'kt-randlinie aussen' }));
  g.append(kv('rect', { x: innen, y: innen, width: G - innen * 2, height: G - innen * 2, class: 'kt-randlinie innen' }));

  /* Die Felder laufen zwischen den Ecken, damit die Ecke frei für den
     Zierrat bleibt. */
  const laenge = G - (innen + ECKE) * 2;
  const felder = 24;
  const feld = laenge / felder;
  for (let i = 0; i < felder; i++) {
    if (i % 2) continue;
    const a = innen + ECKE + i * feld;
    for (const [x, y, w, h] of [
      [a, AUSSEN, feld, BAND],                 /* oben */
      [a, G - innen, feld, BAND],              /* unten */
      [AUSSEN, a, BAND, feld],                 /* links */
      [G - innen, a, BAND, feld]               /* rechts */
    ]) g.append(kv('rect', { x: kz(x), y: kz(y), width: kz(w), height: kz(h), class: 'kt-randfeld' }));
  }

  /* In jeder Ecke ein kleines Quadrat mit Raute — der Punkt, an dem der
     Stecher sein Werkzeug absetzt. */
  for (const [ex, ey] of [[AUSSEN, AUSSEN], [G - innen, AUSSEN], [AUSSEN, G - innen], [G - innen, G - innen]]) {
    g.append(kv('rect', { x: kz(ex), y: kz(ey), width: BAND, height: BAND, class: 'kt-randecke' }));
    const m = BAND / 2;
    g.append(kv('path', {
      d: 'M ' + kz(ex + m) + ' ' + kz(ey + 2.6) + ' L ' + kz(ex + BAND - 2.6) + ' ' + kz(ey + m) +
         ' L ' + kz(ex + m) + ' ' + kz(ey + BAND - 2.6) + ' L ' + kz(ex + 2.6) + ' ' + kz(ey + m) + ' Z',
      class: 'kt-randraute'
    }));
  }

  /* Die Planquadrate: Buchstaben quer, Zahlen längs — damit das
     Verzeichnis nicht nur Namen nennt, sondern Fundstellen. */
  const feldG = planFeldGroesse();
  for (let i = 0; i < PLAN_FELDER; i++) {
    const mitteFeld = PLAN_FELD_RAND + (i + 0.5) * feldG;
    const buchstabe = PLAN_FELD_BUCHSTABEN[i];
    const zahl = String(i + 1);
    /* Die Bezeichner stehen INNEN neben dem Band, nicht darin.
       Im Band wechseln gefüllte und leere Felder — und eine helle Schrift
       auf einem leeren Feld ist unsichtbar. Innen liegen sie auf Papier
       und sind immer zu lesen. */
    for (const [x, y, text] of [
      [mitteFeld, innen + 11, buchstabe],
      [mitteFeld, G - innen - 4.5, buchstabe],
      [innen + 7.5, mitteFeld + 3.6, zahl],
      [G - innen - 7.5, mitteFeld + 3.6, zahl]
    ]) {
      const t2 = kv('text', { x: kz(x), y: kz(y), class: 'kt-feldname', 'text-anchor': 'middle' });
      t2.textContent = text;
      g.append(t2);
    }
  }

  /* Feinere Teilstriche innerhalb jedes Feldes. */
  for (let i = 0; i <= felder; i++) {
    const a = innen + ECKE + i * feld;
    for (const [x1, y1, x2, y2] of [
      [a, innen - 3.4, a, innen], [a, G - innen, a, G - innen + 3.4],
      [innen - 3.4, a, innen, a], [G - innen, a, G - innen + 3.4, a]
    ]) g.append(kv('path', { d: 'M ' + kz(x1) + ' ' + kz(y1) + ' L ' + kz(x2) + ' ' + kz(y2), class: 'kt-gradstrich' }));
  }
  return g;
}

/* Ein Baum, wie ihn ein Stecher setzt: eine Krone aus drei Bögen und ein
   Stämmchen. Ein Kreis ist ein Kreis; das hier ist ein Baum. */
function planBaum(x, y, r, welt) {
  const g = kv('g', { class: 'kt-baumzeichen', transform: 'translate(' + kz(x) + ' ' + kz(y) + ')' });
  g.append(kv('path', {
    d: 'M 0 ' + kz(r * 1.1) + ' V ' + kz(r * 0.35),
    class: 'kt-baumstamm'
  }));
  g.append(kv('path', {
    d: 'M ' + kz(-r) + ' ' + kz(r * 0.3) +
      ' q ' + kz(-r * 0.3) + ' ' + kz(-r * 0.9) + ' ' + kz(r * 0.45) + ' ' + kz(-r * 1.05) +
      ' q ' + kz(r * 0.4) + ' ' + kz(-r * 0.7) + ' ' + kz(r * 1.1) + ' 0' +
      ' q ' + kz(r * 0.75) + ' ' + kz(r * 0.15) + ' ' + kz(r * 0.45) + ' ' + kz(r * 1.05) + ' Z',
    class: 'kt-baumkrone', fill: welt.gruendunkel
  }));
  return g;
}

/* ----- Hügel -----
   Eine Kuppe, dazu Schraffurstriche, die vom Kamm nach unten laufen. Wo die
   Stadt ist, wächst kein Hügel; wo Wasser ist, auch nicht. */
function planHuegel(plan, g, welt) {
  const gr = kv('g', { class: 'kt-huegel' });
  const G = PLAN_GROESSE;
  const [mx, my] = g.stadt.mitte;
  const anzahl = 9;
  for (let i = 0; i < anzahl; i++) {
    const w = (i / anzahl) * Math.PI * 2 + planStreu(plan.saat, 'hw' + i) * 0.3;
    const cw = Math.cos(w), sw = Math.sin(w) * 0.9;
    /* Wie weit reicht das Blatt in diese Richtung? Vorher wurde blind ein
       Abstand gewaehlt — und alle neun Huegel landeten ausserhalb. */
    const bisRand = Math.min(
      Math.abs(cw) < 0.02 ? 1e9 : ((cw > 0 ? G - 96 - mx : 96 - mx) / cw),
      Math.abs(sw) < 0.02 ? 1e9 : ((sw > 0 ? G - 96 - my : 96 - my) / sw)
    );
    const r = Math.min(bisRand * (0.55 + planZufall(plan.saat, 'hr' + i) * 0.35), g.stadt.Rmax * (1.1 + planZufall(plan.saat, 'hr2' + i) * 0.45));
    if (r < g.stadt.Rmax * 1.04) continue;
    const x = mx + cw * r, y = my + sw * r;
    if (g.wasser.drin(x, y)) continue;
    const breite = 34 + planZufall(plan.saat, 'hb' + i) * 46;
    const hoehe = breite * (0.34 + planZufall(plan.saat, 'hh' + i) * 0.22);
    /* Die Kuppe: eine weiche Welle, keine Halbkugel. */
    const punkte = [];
    const n = 14;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const buckel = Math.sin(t * Math.PI) * hoehe * (1 + Math.sin(t * 7 + i) * 0.16);
      punkte.push([x - breite / 2 + breite * t, y - buckel]);
    }
    gr.append(kv('path', { d: kweich(punkte) + ' L ' + kz(x + breite / 2) + ' ' + kz(y) + ' L ' + kz(x - breite / 2) + ' ' + kz(y) + ' Z', class: 'kt-huegelgrund', fill: welt.gruen }));
    gr.append(kv('path', { d: kweich(punkte), class: 'kt-huegelkamm' }));
    /* Schraffur auf der rechten Flanke */
    let schraffur = '';
    for (let k = 3; k < n - 1; k++) {
      const p = punkte[k];
      const tief = (y - p[1]) * (0.35 + planZufall(plan.saat, 'hs' + i + k) * 0.45);
      if (tief < 3) continue;
      schraffur += ' M ' + kz(p[0]) + ' ' + kz(p[1] + 1) + ' L ' + kz(p[0] + 2.4) + ' ' + kz(p[1] + 1 + tief);
    }
    gr.append(kv('path', { d: schraffur.trim(), class: 'kt-huegelschraffur' }));
  }
  return gr;
}

/* ----- Was auf dem Wasser ist ----- */
function planWasserleben(plan, g, welt) {
  const gr = kv('g', { class: 'kt-wasserleben' });
  const G = PLAN_GROESSE;
  /* Stellen suchen, die wirklich im Wasser liegen und nicht am Rand kleben. */
  const stellen = [];
  for (let i = 0; i < 200 && stellen.length < 4; i++) {
    const x = 90 + planZufall(plan.saat, 'wx' + i) * (G - 180);
    const y = 90 + planZufall(plan.saat, 'wy' + i) * (G - 180);
    if (!g.wasser.drin(x, y)) continue;
    if (stellen.some((q) => strecke(q, [x, y]) < 230)) continue;
    stellen.push([x, y]);
  }
  stellen.forEach((q, i) => {
    const dreh = planStreu(plan.saat, 'wd' + i) * 40;
    const gross = 0.8 + planZufall(plan.saat, 'wg' + i) * 0.6;
    const t = kv('g', { transform: 'translate(' + kz(q[0]) + ' ' + kz(q[1]) + ') rotate(' + dreh.toFixed(0) + ') scale(' + gross.toFixed(2) + ')' });
    if (i === 0 && (g.wasser.art === 'kueste' || g.wasser.art === 'insel')) {
      /* Ein Wesen in der Tiefe — hic sunt dracones. */
      t.append(kv('path', { class: 'kt-seewesen', d: 'M -26 4 q 8 -12 16 0 q 8 12 16 0 q 8 -12 16 0' }));
      t.append(kv('path', { class: 'kt-seewesen', d: 'M 22 4 q 5 -9 11 -3 q -5 1 -6 5 z' }));
      t.append(kv('circle', { cx: 27, cy: 0.5, r: 1.1, class: 'kt-seewesenauge' }));
      t.append(kv('path', { class: 'kt-seewesen', d: 'M -26 4 q -7 -4 -10 2 q 7 1 10 2 z' }));
    } else {
      /* Ein Segler */
      t.append(kv('path', { class: 'kt-schiffrumpf', d: 'M -15 6 q 15 7 30 0 l -3 -5 h -24 z' }));
      t.append(kv('path', { class: 'kt-schiffmast', d: 'M 2 1 V -22' }));
      t.append(kv('path', { class: 'kt-schiffsegel', d: 'M 2 -21 q 13 8 0 17 z' }));
      t.append(kv('path', { class: 'kt-schiffsegel', d: 'M 1 -19 q -11 7 0 14 z' }));
      t.append(kv('path', { class: 'kt-schiffwelle', d: 'M -22 10 q 6 3 11 0 q 6 -3 11 0 q 6 3 11 0' }));
    }
    gr.append(t);
  });
  return gr;
}

/* ----- Die Alterung -----
   Stockflecken, zwei Faltlinien, ein Schatten in den Ecken. Alles aus der
   Saat gerechnet, damit dasselbe Blatt immer dieselben Flecken hat. */
function planAlterung(plan, g) {
  const G = PLAN_GROESSE;
  const gr = kv('g', { class: 'kt-alterung', 'aria-hidden': 'true' });
  /* Die Falten: ein Blatt, das oft zusammengelegt wurde. */
  gr.append(kv('path', { d: 'M ' + kz(G / 2) + ' 0 V ' + kz(G), class: 'kt-falte' }));
  gr.append(kv('path', { d: 'M 0 ' + kz(G / 2) + ' H ' + kz(G), class: 'kt-falte quer' }));
  /* Stockflecken */
  for (let i = 0; i < 22; i++) {
    const x = planZufall(plan.saat, 'fx' + i) * G;
    const y = planZufall(plan.saat, 'fy' + i) * G;
    const r = 3 + planZufall(plan.saat, 'fr' + i) * 13;
    gr.append(kv('ellipse', {
      cx: kz(x), cy: kz(y), rx: kz(r), ry: kz(r * (0.6 + planZufall(plan.saat, 'fe' + i) * 0.6)),
      class: 'kt-fleck', transform: 'rotate(' + Math.round(planZufall(plan.saat, 'fd' + i) * 180) + ' ' + kz(x) + ' ' + kz(y) + ')'
    }));
  }
  /* Der Schatten in den Ecken — das Blatt liegt nicht ganz flach. */
  gr.append(kv('rect', { x: 0, y: 0, width: G, height: G, fill: 'url(#kt-vignette)' }));
  return gr;
}

function planDefs(plan, welt, papier) {
  const defs = kv('defs', {});
  /* Die Faser des Papiers */
  const faser = kv('pattern', { id: 'kt-faser', width: 7, height: 7, patternUnits: 'userSpaceOnUse' });
  faser.append(kv('rect', { width: 7, height: 7, fill: 'none' }));
  faser.append(kv('path', { d: 'M0 3.5 H7 M3.5 0 V7', stroke: papier[3], 'stroke-width': 0.5, 'stroke-opacity': 0.5 }));
  defs.append(faser);
  /* Der Acker: Pflugfurchen */
  const acker = kv('pattern', { id: 'kt-acker', width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(34)' });
  acker.append(kv('rect', { width: 9, height: 9, fill: welt.gruen }));
  acker.append(kv('path', { d: 'M0 4.5 H9', stroke: welt.gruendunkel, 'stroke-width': 1.5 }));
  defs.append(acker);
  /* Das Pflaster des Marktes */
  const pflaster = kv('pattern', { id: 'kt-pflaster', width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
  pflaster.append(kv('rect', { width: 12, height: 12, fill: welt.strasse }));
  pflaster.append(kv('path', { d: 'M0 6 H12 M6 0 V12', stroke: welt.tintezart, 'stroke-width': 0.8 }));
  defs.append(pflaster);
  /* Die Wiese: kleine Grasbüschel statt einer glatten Fläche. */
  const wiese = kv('pattern', { id: 'kt-wiese', width: 14, height: 14, patternUnits: 'userSpaceOnUse' });
  wiese.append(kv('rect', { width: 14, height: 14, fill: welt.gruen }));
  wiese.append(kv('path', { d: 'M3 10 l1.6 -4 M4.6 6 l1.6 4 M9 13 l1.6 -4 M10.6 9 l1.6 4', stroke: welt.gruendunkel, 'stroke-width': .9, 'stroke-linecap': 'round', fill: 'none' }));
  defs.append(wiese);
  /* Das Wasser wird nach außen tiefer. */
  const tiefe = kv('linearGradient', { id: 'kt-tiefe', x1: '0', y1: '0', x2: '.7', y2: '1' });
  tiefe.append(kv('stop', { offset: '0%', 'stop-color': welt.wasser }));
  tiefe.append(kv('stop', { offset: '100%', 'stop-color': welt.wasser, 'stop-opacity': .78 }));
  defs.append(tiefe);
  /* Die Vignette: zu den Ecken hin wird das Papier dunkler, als hätte es
     Jahre in einer Mappe gelegen. */
  const vig = kv('radialGradient', { id: 'kt-vignette', cx: '50%', cy: '46%', r: '72%' });
  vig.append(kv('stop', { offset: '52%', 'stop-color': 'rgba(0,0,0,0)' }));
  vig.append(kv('stop', { offset: '82%', 'stop-color': 'rgba(60,42,20,.09)' }));
  vig.append(kv('stop', { offset: '100%', 'stop-color': 'rgba(50,34,14,.24)' }));
  defs.append(vig);
  return defs;
}

/* ===================== DIE MARKEN =====================
   Sie liegen in einer eigenen Ebene über allem und werden für sich neu
   aufgetragen — so kostet das Benennen einer Stelle nicht die ganze Stadt. */
function planMarkenAuftragen(svg, plan, g, neu) {
  const ebene = svg.querySelector('.kt-markenebene');
  if (!ebene) return;
  ebene.innerHTML = '';
  for (const m of plan.marken) {
    const art = planMarke(m.art);
    const gr = kv('g', {
      class: 'kt-marke art-' + m.art + (m.wichtig ? ' wichtig' : ''),
      'data-marke': m.id,
      transform: 'translate(' + kz(m.x) + ' ' + kz(m.y) + ')',
      tabindex: '0', role: 'button'
    });
    /* Der Griff wächst, wenn die Karte klein ist: fünfzehn Einheiten sind
       bei halbem Zoom nur sieben Bildpunkte, und danach trifft kein Finger
       mehr. Gemessen wird in Bildpunkten, nicht in Karteneinheiten. */
    gr.append(kv('circle', { r: kz(Math.max(15, 24 / (_kt.zoom || 1))), class: 'kt-markenfang' }));
    const zeichen = kv('g', { class: 'kt-markenzeichen' });
    zeichen.innerHTML = planMarkenSymbol(m.art, 22);
    gr.append(zeichen);
    if (m.name) {
      const t = kv('text', { x: 0, y: 23, class: 'kt-markenname', 'text-anchor': 'middle' });
      t.textContent = m.name;
      const hinter = kv('text', { x: 0, y: 23, class: 'kt-markenname hinter', 'text-anchor': 'middle' });
      hinter.textContent = m.name;
      gr.append(hinter, t);
    }
    const titel = kv('title', {});
    titel.textContent = (m.name || art.name) + (m.name ? ' — ' + art.name : '');
    gr.append(titel);

    /* Ziehen verschiebt die Marke, Tippen nimmt sie in den Blick. */
    let zug = null;
    gr.addEventListener('pointerdown', (ev) => {
      if (ev.button != null && ev.button !== 0) return;
      ev.stopPropagation();
      zug = { x: ev.clientX, y: ev.clientY, x0: m.x, y0: m.y, gezogen: false, schwelle: ev.pointerType === 'mouse' ? 4 : 9 };
      try { gr.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    gr.addEventListener('pointermove', (ev) => {
      if (!zug) return;
      const dx = ev.clientX - zug.x, dy = ev.clientY - zug.y;
      /* Ein Finger zittert mehr als eine Maus. Fünf Bildpunkte sind für
         eine Maus richtig und für einen Finger zu wenig — jeder Tipp wurde
         zum Zug. */
      if (!zug.gezogen && Math.abs(dx) + Math.abs(dy) < zug.schwelle) return;
      zug.gezogen = true;
      gr.classList.add('zieht');
      const r = svg.getBoundingClientRect();
      const s = r.width / PLAN_GROESSE;
      zug.neuX = Math.max(0, Math.min(PLAN_GROESSE, zug.x0 + dx / s));
      zug.neuY = Math.max(0, Math.min(PLAN_GROESSE, zug.y0 + dy / s));
      gr.setAttribute('transform', 'translate(' + kz(zug.neuX) + ' ' + kz(zug.neuY) + ')');
    });
    const los = (ev) => {
      if (!zug) return;
      const s = zug; zug = null;
      gr.classList.remove('zieht');
      try { gr.releasePointerCapture(ev.pointerId); } catch (e) {}
      if (!s.gezogen) { _kt.nurMarke = _kt.nurMarke === m.id ? '' : m.id; if (neu) neu(); return; }
      planSchreiben(D.docs.get(_kt.id), (p) => {
        const z = p.marken.find((x) => x.id === m.id);
        if (z) { z.x = Math.round(s.neuX); z.y = Math.round(s.neuY); }
        return p;
      }).then(() => { if (neu) neu(); });
    };
    gr.addEventListener('pointerup', los);
    gr.addEventListener('pointercancel', () => { if (zug) { zug = null; gr.classList.remove('zieht'); if (neu) neu(); } });
    gr.addEventListener('dblclick', (ev) => { ev.stopPropagation(); planMarkeBearbeiten(D.docs.get(_kt.id), m, neu); });
    gr.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); planMarkeBearbeiten(D.docs.get(_kt.id), m, neu); }
      else if (ev.key === ' ') { ev.preventDefault(); _kt.nurMarke = _kt.nurMarke === m.id ? '' : m.id; if (neu) neu(); }
    });
    ebene.append(gr);
  }
}

/* ===================== DIE KARTE ZUR MARKE ===================== */
function planMarkenkarte(doc, plan, markeId, neu) {
  const m = plan.marken.find((x) => x.id === markeId);
  if (!m) return null;
  const art = planMarke(m.art);
  const nah = planMarkenNah(plan, m, 4);
  const figur = m.albumId ? D.docs.get(m.albumId) : null;

  const karte = el('div', { class: 'kt-markenkarte' },
    el('div', { class: 'kt-mkkopf' },
      el('span', { class: 'kt-mkzeichen', html: planMarkenSymbol(m.art, 20) }),
      el('b', {}, m.name || art.name),
      el('button', { class: 'kt-mkzu', title: 'Loslassen', onclick: () => { _kt.nurMarke = ''; neu(); } }, '×')),
    el('div', { class: 'kt-mkart' }, art.name),
    m.notiz ? el('p', { class: 'kt-mknotiz' }, m.notiz) : null,
    figur && figur.typ === 'albumfigur' && !figur.geloescht
      ? el('button', { class: 'kt-mkfigur', onclick: () => { if (typeof albumSpringeZu === 'function') { const h = document.querySelector('.kt-huelle'); const s = h && h.closest('.schleier'); if (s) s.remove(); albumSpringeZu(figur.id); } } },
        'Im Album: ', el('b', {}, figur.name || 'ohne Namen'))
      : null);

  if (nah.length) {
    const liste = el('div', { class: 'kt-mknah' }, el('span', { class: 'kt-mknahkopf' }, 'In der Nähe'));
    for (const n of nah) {
      const zeit = planWegzeit(m, n.marke);
      liste.append(el('button', {
        class: 'kt-mknahzeile',
        onclick: () => { _kt.nurMarke = n.marke.id; neu(); planHinschauen(document.querySelector('.kt-flaeche'), n.marke.x, n.marke.y); }
      },
        el('i', { html: planMarkenSymbol(n.marke.art, 13) }),
        el('span', {}, n.marke.name || planMarke(n.marke.art).name),
        el('small', {}, zeit.text)));
    }
    karte.append(liste);
  }
  karte.append(el('div', { class: 'kt-mkfuss' },
    el('button', { class: 'knopf zart klein', onclick: () => planMarkeBearbeiten(doc, m, neu) }, 'Ändern'),
    el('button', { class: 'knopf zart klein', onclick: () => { _kt.messenVon = { x: m.x, y: m.y, name: m.name || art.name }; _kt.werkzeug = 'messen'; neu(); } }, 'Von hier messen')));
  return karte;
}

/* ===================== DAS MESSBAND ===================== */
function planMessband(plan, neu) {
  const von = _kt.messenVon, bis = _kt.messenBis;
  const kasten = el('div', { class: 'kt-messband' });
  if (!bis) {
    kasten.append(el('span', {}, 'Und wohin? Tipp die zweite Stelle an.'),
      el('button', { class: 'kt-mbzu', onclick: () => { _kt.messenVon = null; _kt.messenBis = null; neu(); } }, '×'));
    return kasten;
  }
  const zuFuss = planWegzeit(von, bis, 'ruhig');
  const eilig = planWegzeit(von, bis, 'eilig');
  const pferd = planWegzeit(von, bis, 'pferd');
  kasten.append(
    el('div', { class: 'kt-mbzeile' }, el('b', {}, zuFuss.meter + ' Schritt'), el('small', {}, 'Luftlinie mal Umweg')),
    el('div', { class: 'kt-mbzeiten' },
      el('span', {}, 'gemächlich ', el('b', {}, zuFuss.text)),
      el('span', {}, 'eilig ', el('b', {}, eilig.text)),
      el('span', {}, 'zu Pferd ', el('b', {}, pferd.text))),
    el('button', { class: 'kt-mbzu', title: 'Fertig', onclick: () => { _kt.messenVon = null; _kt.messenBis = null; neu(); } }, '×'));
  return kasten;
}
