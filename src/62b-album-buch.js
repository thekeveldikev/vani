/* ===================== 62b — DAS ALBUM, AUFGESCHLAGEN =====================
   Ein in Leder gebundenes Buch mit erhabenen Bünden auf dem Rücken,
   Messingecken und einer Schließe. Innen Bütten mit Wasserzeichen, ein
   doppelter Rahmen um den Satzspiegel, Fleurons in den Ecken, unten die
   Seitenzahl.

   Geblättert wird wie in einem Buch: Ein Blatt hebt sich, dreht sich um den
   Falz und legt sich auf die andere Seite. Vorderseite des Blattes ist die
   rechte Seite, die man verlässt; Rückseite ist die linke Seite, auf die man
   kommt — genau wie bei Papier.

   Eine Doppelseite gehört einer Figur. Links: das Bildnis, der Name, wer sie
   ist und wie sie aussieht. Rechts: was für ein Mensch das ist, was ihr
   geschah, wie sie klingt, wohin sie gehört — und was das Buch selbst über
   sie weiß (Zeitleiste, Erwähnungen, offene Fäden).

   Beide Seiten sind immer gleich groß. Eine halb leere Seite in einem
   kostbaren Buch ist keine Lücke, sondern Raum. */

const ALB_LINKS = ['kopf', 'aussehen'];
const ALB_RECHTS = ['wesen', 'leben', 'stimme', 'welt', 'rand'];

let _alb = { i: 0, suche: '', offen: false, dreht: false, ansicht: 'buch' };

/* ----- Der Raum: das Buch liegt auf dem Pult ----- */
RENDER.album = function (haupt) {
  const figuren = albumFiguren();
  const dicke = Math.min(46, 12 + figuren.length * 1.6);
  const buch = el('button', {
    class: 'alb-regalbuch', title: figuren.length ? 'Das Album — ' + figuren.length + (figuren.length === 1 ? ' Figur' : ' Figuren') : 'Das Album — noch leer',
    style: '--dicke:' + dicke.toFixed(1) + 'px',
    onclick: () => albumOeffnen(0)
  },
    el('i', { class: 'alb-rb-schnitt' }),
    el('i', { class: 'alb-rb-ruecken' },
      el('i', { class: 'alb-bund b1' }), el('i', { class: 'alb-bund b2' }), el('i', { class: 'alb-bund b3' })),
    el('div', { class: 'alb-rb-deckel' },
      el('i', { class: 'alb-rb-praegung' }),
      el('i', { class: 'alb-rb-praegung innen' }),
      el('span', { class: 'alb-rb-titel' }, 'ALBUM'),
      el('i', { class: 'alb-rb-fleuron' }),
      el('span', { class: 'alb-rb-unter' }, figuren.length ? figuren.length + (figuren.length === 1 ? ' Figur' : ' Figuren') : 'noch leer'),
      ...['e1', 'e2', 'e3', 'e4'].map((e) => el('i', { class: 'alb-rb-ecke ' + e })),
      el('i', { class: 'alb-rb-schliesse' })),
    el('i', { class: 'alb-rb-band' }));

  const kopf = raumkopf('Das Album', figuren.length
    ? figuren.length + (figuren.length === 1 ? ' Figur wohnt darin.' : ' Figuren wohnen darin.')
    : 'Ein dickes Buch mit lauter leeren Seiten. Eine Doppelseite für jede Figur.',
    figuren.length ? el('button', { class: 'knopf zart', title: 'Alle Figuren auf einen Blick', onclick: () => albumRegal() }, 'Übersicht') : null,
    el('button', { class: 'knopf voll', onclick: () => albumNeueFigur() }, 'Eine Figur anlegen'));

  const inhalt = el('div', { class: 'inhalt alb-raum' }, buch,
    el('p', { class: 'alb-raumtext' }, figuren.length
      ? 'Schlag es auf und blättere. Oben links auf jeder Doppelseite steht der Name — ein Tippen darauf, und du kannst alles nachtragen oder wieder wegnehmen.'
      : 'Noch steht nichts darin. Leg die erste Figur an — und lass ruhig fast alles leer. Was leer bleibt, steht später einfach nicht auf der Seite.'));
  haupt.append(kopf, inhalt);
};

/* ----- Das Buch aufschlagen ----- */
function albumOeffnen(start, zuFigurId) {
  const figuren = albumFiguren();
  _alb.suche = '';
  _alb.i = zuFigurId ? Math.max(0, figuren.findIndex((f) => f.id === zuFigurId)) : begrenze(start, 0, Math.max(0, figuren.length), 0);

  const buehne = el('div', { class: 'alb-buehne' });
  const kasten = el('div', { class: 'alb-buch' },
    el('i', { class: 'alb-buchruecken' }, el('i', { class: 'alb-bund b1' }), el('i', { class: 'alb-bund b2' }), el('i', { class: 'alb-bund b3' })),
    buehne);
  const huelle = el('div', { class: 'alb-huelle' }, kasten);
  const zu = zeigeDeck(huelle, () => { document.removeEventListener('keydown', taste); _alb.offen = false; });
  _alb.offen = true;
  kasten.classList.add('schlaegt-auf');
  setTimeout(() => kasten.classList.remove('schlaegt-auf'), 1000);

  const neu = (i) => { if (i != null) _alb.i = i; albumZeichne(buehne, neu, zu); };
  const taste = (ev) => {
    if (!kasten.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 1) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); albumBlaettern(1, buehne, neu); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); albumBlaettern(-1, buehne, neu); }
    else if (ev.key === 'Home') { ev.preventDefault(); neu(0); }
    else if (ev.key === 'End') { ev.preventDefault(); neu(albumSichtbare().length); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); albumNeueFigur((id) => { const f = albumFiguren(); neu(Math.max(0, f.findIndex((x) => x.id === id))); }); }
    else if (ev.key === 'z' || ev.key === 'Z') { ev.preventDefault(); const l = albumSichtbare(); if (l.length) neu(Math.floor(Math.random() * l.length)); }
  };
  document.addEventListener('keydown', taste);
  albumZeichne(buehne, neu, zu);
}

function albumSichtbare() {
  const alle = albumFiguren();
  return _alb.suche.trim() ? albumSuche(_alb.suche, alle) : alle;
}

function albumZeichne(buehne, neu, schliessen) {
  const liste = albumSichtbare();
  const anzahl = liste.length + 1;
  _alb.i = begrenze(_alb.i, 0, anzahl - 1, 0);
  const figur = liste[_alb.i] || null;

  buehne.innerHTML = '';
  buehne.append(albumKopfleiste(liste, neu, schliessen));

  const block = el('div', { class: 'alb-block' },
    albumSeite(figur, 'links', neu),
    el('i', { class: 'alb-falz', 'aria-hidden': 'true' }),
    albumSeite(figur, 'rechts', neu));
  buehne.append(block);
  buehne.append(albumFuss(liste, neu));

  /* Die Stücke setzen sich wie Tinte — der Reihe nach, ganz kurz. */
  const stillsteht = (typeof document !== 'undefined' && document.hidden) ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!stillsteht) {
    const stuecke = [...block.querySelectorAll('.alb-stueck')];
    stuecke.forEach((s, i) => s.style.setProperty('--n', String(Math.min(i, 18))));
    block.classList.add('setzt-sich');
    setTimeout(() => block.classList.remove('setzt-sich'), 1400);
  }

  /* Wischen zum Blättern */
  let start = null;
  block.addEventListener('pointerdown', (ev) => { if (ev.target.closest('button, input, textarea, a, .alb-seite')) { if (!ev.target.closest('button, input, textarea, a')) start = { x: ev.clientX, y: ev.clientY, t: Date.now() }; return; } start = { x: ev.clientX, y: ev.clientY, t: Date.now() }; });
  block.addEventListener('pointerup', (ev) => {
    if (!start) return;
    const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
    const s = start; start = null;
    if (Date.now() - s.t > 700 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * .6) return;
    albumBlaettern(dx < 0 ? 1 : -1, buehne, neu);
  });
}

/* ----- Die feste Leiste oben ----- */
function albumKopfleiste(liste, neu, schliessen) {
  const suchfeld = el('input', { type: 'search', class: 'alb-suchfeld', placeholder: 'Figur suchen …', value: _alb.suche });
  suchfeld.addEventListener('input', entprellt(() => {
    _alb.suche = suchfeld.value; _alb.i = 0; neu();
    setTimeout(() => { const f = document.querySelector('.alb-suchfeld'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0);
  }, 240, true));

  const register = el('div', { class: 'alb-register' });
  for (const r of albumRegister(liste)) {
    register.append(el('button', { class: 'alb-regknopf' + (_alb.i >= r.von && _alb.i < r.von + r.anzahl ? ' an' : ''), title: r.anzahl + (r.anzahl === 1 ? ' Figur' : ' Figuren'), onclick: () => neu(r.von) }, r.buchstabe));
  }

  return el('div', { class: 'alb-kopf' },
    el('div', { class: 'alb-kopfzeile' },
      el('div', { class: 'alb-suche' }, el('span', { class: 'alb-lupe', html: ik('suche') }), suchfeld),
      el('div', { class: 'alb-kopfrechts' },
        el('button', { class: 'alb-werkzeug', title: 'Alle Figuren auf einen Blick', onclick: () => albumRegal(neu) }, 'Übersicht'),
        liste.length > 2 ? el('button', { class: 'alb-werkzeug', title: 'Irgendeine Figur aufschlagen (z)', onclick: () => neu(Math.floor(Math.random() * liste.length)) }, 'Zufall') : null,
        el('button', { class: 'alb-neuknopf', title: 'Eine neue Figur anlegen (n)', onclick: () => albumNeueFigur((id) => { _alb.suche = ''; const f = albumFiguren(); neu(Math.max(0, f.findIndex((x) => x.id === id))); }) }, '+ Figur'),
        el('button', { class: 'alb-zuknopf', title: 'Das Album zuklappen', onclick: () => schliessen() }, '×'))),
    register.children.length ? register : null,
    _alb.suche.trim() ? el('div', { class: 'alb-suchhinweis' }, liste.length === 1 ? 'eine Figur passt' : liste.length + ' Figuren passen') : null);
}

function albumFuss(liste, neu) {
  const anzahl = liste.length + 1;
  const figur = liste[_alb.i] || null;
  const offene = figur ? albumFaeden(figur).filter((x) => !x.erledigt).length : 0;
  return el('div', { class: 'alb-fuss' },
    el('button', { class: 'alb-blaetter links', title: 'Zurückblättern', disabled: _alb.i <= 0 ? '' : null, onclick: () => albumBlaettern(-1, document.querySelector('.alb-buehne'), neu) }, '‹'),
    el('div', { class: 'alb-seitenzahl' },
      figur ? el('b', {}, figur.name || 'ohne Namen') : el('b', { class: 'leer' }, 'leere Doppelseite'),
      el('small', {}, (_alb.i + 1) + ' von ' + anzahl + (offene ? '  ·  ' + offene + (offene === 1 ? ' offener Faden' : ' offene Fäden') : ''))),
    el('button', { class: 'alb-blaetter rechts', title: 'Weiterblättern', disabled: _alb.i >= anzahl - 1 ? '' : null, onclick: () => albumBlaettern(1, document.querySelector('.alb-buehne'), neu) }, '›'));
}

/* ----- Das Blättern ----- */
function albumBlaettern(richtung, buehne, neu) {
  if (!buehne || _alb.dreht) return;
  const liste = albumSichtbare();
  const anzahl = liste.length + 1;
  const ziel = _alb.i + richtung;
  if (ziel < 0 || ziel > anzahl - 1) return;

  const block = buehne.querySelector('.alb-block');
  const stillsteht = (typeof document !== 'undefined' && document.hidden) ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    (typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches);
  if (!block || stillsteht) { neu(ziel); return; }

  const alt = liste[_alb.i] || null, neuF = liste[ziel] || null;
  const vorn = richtung > 0 ? albumSeite(alt, 'rechts', neu, true) : albumSeite(alt, 'links', neu, true);
  const hinten = richtung > 0 ? albumSeite(neuF, 'links', neu, true) : albumSeite(neuF, 'rechts', neu, true);
  const blatt = el('div', { class: 'alb-blatt ' + (richtung > 0 ? 'vor' : 'zurueck') },
    el('div', { class: 'alb-blattseite vorn' }, vorn, el('i', { class: 'alb-blattglanz' })),
    el('div', { class: 'alb-blattseite hinten' }, hinten, el('i', { class: 'alb-blattglanz' })));
  block.append(blatt);
  block.classList.add('blaettert');
  _alb.dreht = true;
  setTimeout(() => {
    const untenLinks = block.querySelector(':scope > .alb-seite.links'), untenRechts = block.querySelector(':scope > .alb-seite.rechts');
    if (richtung > 0 && untenRechts) untenRechts.replaceWith(albumSeite(neuF, 'rechts', neu));
    if (richtung < 0 && untenLinks) untenLinks.replaceWith(albumSeite(neuF, 'links', neu));
  }, 30);
  requestAnimationFrame(() => blatt.classList.add('laeuft'));
  setTimeout(() => { _alb.dreht = false; neu(ziel); }, 660);
}

/* ----- Eine Seite ----- */
function albumSeite(figur, welche, neu, flach) {
  const seite = el('div', { class: 'alb-seite ' + welche });
  /* Der Inhalt liegt in einem eigenen Bereich; der Seitenfuss ist ein
     Geschwisterelement danach. So laeuft der Text nie unter die Seitenzahl —
     ein aufgelegtes Band davor war eine Verlegenheitsloesung und sah beim
     Scrollen aus wie ein Fehler. */
  const inhalt = el('div', { class: 'alb-seiteninhalt' });
  const anhaengen = (...k) => anfuegen(inhalt, ...k);
  /* Der Schmuck, den jede Seite trägt — auch eine leere. */
  const schmuck = () => [
    el('i', { class: 'alb-rahmen', 'aria-hidden': 'true' }),
    ...['e1', 'e2', 'e3', 'e4'].map((e) => el('i', { class: 'alb-fleuron ' + e, 'aria-hidden': 'true' }))
  ];

  if (!figur) {
    seite.append(...schmuck());
    seite.append(el('div', { class: 'alb-laufkopf' }, welche === 'links' ? 'DAS ALBUM' : ''));
    if (welche === 'links') {
      anhaengen(el('div', { class: 'alb-leereseite' },
        el('button', { class: 'alb-neuefigur', onclick: () => albumNeueFigur((id) => { const f = albumFiguren(); if (neu) neu(Math.max(0, f.findIndex((x) => x.id === id))); }) },
          el('span', { class: 'alb-nf-kreuz' }, '+'),
          el('span', { class: 'alb-nf-text' }, el('b', {}, 'Eine Figur anlegen'), el('small', {}, 'Hier wohnt noch niemand.'))),
        el('div', { class: 'alb-leerhinweis' }, 'Trag ein, was du weißt. Alles andere darf leer bleiben — es steht dann einfach nicht auf der Seite, und man sieht ihm nicht an, dass es fehlt.')));
    } else {
      anhaengen(el('div', { class: 'alb-leerornament' }, el('i'), el('span', {}, 'leer'), el('i')));
    }
    seite.append(inhalt);
    seite.append(el('div', { class: 'alb-seitenfuss' }, ''));
    return seite;
  }

  const farbe = albumFarbe(figur);
  seite.style.setProperty('--figurfarbe', farbe);
  seite.append(...schmuck());
  /* Eine grosse, blasse Initiale liegt im Papier — wie in einem alten Buch.
     Sie fuellt die Seite, ohne etwas zu behaupten: ein Buchstabe legt kein
     Gesicht fest. */
  seite.append(el('i', { class: 'alb-initiale', 'aria-hidden': 'true' }, welche === 'links' ? albumMonogramm(figur)[0] : albumBuchstabe(figur)));
  seite.append(el('div', { class: 'alb-laufkopf' },
    welche === 'links' ? albumBuchstabe(figur) + ' · DAS ALBUM' : (figur.name || '').toUpperCase()));

  const motto = (figur.felder || {}).motto;

  if (welche === 'links') {
    if (motto) anhaengen(el('div', { class: 'alb-stueck alb-motto' }, el('span', {}, motto)));
    if (albumBildnisAn()) anhaengen(albumBildplatte(figur, neu));
    anhaengen(albumSeitenkopf(figur, neu));
    const stuecke = albumStuecke(figur).filter((s) => ALB_LINKS.includes(s.feld.gruppe));
    anhaengen(albumStueckFeld(figur, stuecke, flach));
    /* Die Zeitleiste steht links: sie gehoert zur Biografie, nicht zum Wesen —
       und sie gibt der linken Seite das Gewicht, das ihr sonst fehlt. */
    let zeit = null;
    if (!flach) { zeit = albumZeitleisteBlock(figur, neu); if (zeit) anhaengen(zeit); }
    if (!stuecke.length && !zeit) anhaengen(el('div', { class: 'alb-leerornament zart' }, el('i'), el('span', {}, 'noch nichts eingetragen'), el('i')));
  } else {
    const stuecke = albumStuecke(figur).filter((s) => ALB_RECHTS.includes(s.feld.gruppe) && s.feld.id !== 'motto');
    anhaengen(albumStueckFeld(figur, stuecke, flach));
    if (!flach) {
      const erw = albumErwaehnungenBlock(figur);
      if (erw) anhaengen(erw);
      const w = albumWiderspruchBlock(figur);
      if (w) anhaengen(w);
    }
    if (albumZettel(figur).length) anhaengen(albumZettelBrett(figur));
    if (!stuecke.length && !albumZettel(figur).length) anhaengen(el('div', { class: 'alb-leerornament zart' }, el('i'), el('span', {}, 'noch nichts eingetragen'), el('i')));
  }
  seite.append(inhalt);
  seite.append(el('i', { class: 'alb-seitenband', style: 'background:' + farbe, title: figur.name }));
  seite.append(el('div', { class: 'alb-seitenfuss' }, welche === 'links' ? String(_alb.i * 2 + 1) : String(_alb.i * 2 + 2)));
  return seite;
}

/* Das Bildnis: Foto, selbst gezeichnet — oder ein Monogramm, das aussieht,
   als wäre es so gemeint. Eine leere Platte ist kein Mangel. */
function albumBildplatte(figur, neu) {
  const platte = el('button', {
    class: 'alb-bildplatte' + (albumHatBild(figur) ? ' voll' : ''),
    title: albumHatBild(figur) ? 'Das Bildnis ändern' : 'Ein Bildnis geben — Foto oder selbst gezeichnet',
    onclick: () => albumBildWaehlen(figur, () => { if (neu) neu(); })
  }, el('i', { class: 'alb-bp-rahmen' }));
  if (figur.bild) {
    const img = el('img', { class: 'alb-bp-foto', alt: figur.name || '', draggable: 'false' });
    if (typeof setzeBild === 'function') setzeBild(img, figur.bild);
    platte.append(img);
  } else if (Array.isArray(figur.striche) && figur.striche.length) {
    platte.append(el('span', { class: 'alb-bp-zeichnung', html: albumStricheSVG(figur.striche) }));
  } else {
    platte.append(el('span', { class: 'alb-bp-monogramm' }, albumMonogramm(figur)));
  }
  platte.append(el('i', { class: 'alb-bp-ecke e1' }), el('i', { class: 'alb-bp-ecke e2' }),
    el('i', { class: 'alb-bp-ecke e3' }), el('i', { class: 'alb-bp-ecke e4' }));
  return platte;
}
/* Ein selbst gezeichnetes Bildnis, groß gesetzt. */
function albumStricheSVG(striche, groesse = 150) {
  const linien = (striche || []).slice(0, 200).map((st) => {
    const p = (st || []).slice(0, 600).map(([x, y]) => (x * 100).toFixed(1) + ',' + (y * 100).toFixed(1)).join(' ');
    return p ? '<polyline points="' + p + '"/>' : '';
  }).join('');
  return '<svg viewBox="0 0 100 100" width="' + groesse + '" height="' + groesse + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + linien + '</svg>';
}

function albumSeitenkopf(figur, neu) {
  const alter = albumAlterText(figur);
  const g = (figur.felder || {}).geboren, t = (figur.felder || {}).gestorben;
  const lebensdaten = [g && kalGueltig(g) ? '✻ ' + kalKurz(g) : '', t && kalGueltig(t) ? '† ' + kalKurz(t) : ''].filter(Boolean).join('   ');
  return el('div', { class: 'alb-seitenkopf' },
    el('button', { class: 'alb-name', title: 'Alles zu dieser Figur — nachtragen, ändern, wegnehmen', onclick: () => albumBearbeiten(figur, () => { if (neu) neu(); }) },
      el('b', {}, figur.name || 'ohne Namen'),
      el('i', { class: 'alb-nameunter' }, 'ändern')),
    lebensdaten ? el('div', { class: 'alb-lebensdaten' }, lebensdaten) : null,
    alter ? el('div', { class: 'alb-alter' }, alter) : null,
    el('i', { class: 'alb-namenlinie' }));
}

function albumStueckFeld(figur, stuecke, flach) {
  const feld = el('div', { class: 'alb-stuecke' });
  if (!stuecke.length) return feld;
  const etiketten = stuecke.filter((s) => s.feld.form === 'etikett');
  const rest = stuecke.filter((s) => s.feld.form !== 'etikett');
  if (etiketten.length) {
    const reihe = el('div', { class: 'alb-etikettreihe alb-stueck' });
    for (const s of etiketten) reihe.append(albumStueck(figur, s, flach));
    feld.append(reihe);
  }
  for (const s of rest) feld.append(albumStueck(figur, s, flach));
  return feld;
}

function albumStueck(figur, s, flach) {
  const { feld, wert } = s;
  const name = albumBeschriftung(feld.name, figur.name);
  const dreh = flach ? 0 : albumDreh(figur.id, feld.id, 1.3);
  const stil = 'transform: rotate(' + dreh + 'deg)';
  const liste = Array.isArray(wert) ? wert : [wert];

  if (feld.form === 'etikett') {
    return el('span', { class: 'alb-etikett', style: stil, title: name },
      el('i', {}, name), el('b', {}, liste.join(' · ')));
  }
  if (feld.form === 'motto') {
    return el('div', { class: 'alb-stueck alb-motto', style: stil }, el('span', {}, liste.join(' ')));
  }
  if (feld.form === 'faeden') {
    const faeden = liste.map((e) => ({ roh: e, text: albumFadenText(e), erledigt: albumFadenErledigt(e) }));
    return el('div', { class: 'alb-stueck alb-faeden', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      ...faeden.map((x, i) => el('button', {
        class: 'alb-faden' + (x.erledigt ? ' erledigt' : ''),
        title: x.erledigt ? 'Wieder als offen führen' : 'Als eingelöst abhaken',
        onclick: () => {
          const a = ((figur.felder || {}).faden || []).slice();
          a[i] = albumFadenSetzen(a[i], !x.erledigt);
          figur.felder = Object.assign({}, figur.felder, { faden: a });
          speichere(figur);
          const buehne = document.querySelector('.alb-buehne');
          if (buehne) { const n = (j) => { if (j != null) _alb.i = j; albumZeichne(buehne, n, () => {}); }; n(); }
        }
      }, el('i', { class: 'alb-fadenhaken' }, x.erledigt ? '✓' : ''), el('span', {}, x.text))));
  }
  if (feld.form === 'spruch') {
    /* Zitate stehen fuer sich. Unter jedem noch einmal „Sagt" zu schreiben,
       waere Beiwerk — die Anfuehrungszeichen sagen es bereits. Nur wo der
       Feldname etwas HINZUFUEGT (die erste Zeile), steht er einmal darueber. */
    const eigenerName = feld.id !== 'zitat';
    return el('div', { class: 'alb-stueck alb-sprueche' + (eigenerName ? ' benannt' : '') },
      eigenerName ? el('span', { class: 'alb-feldname' }, name) : null,
      ...liste.map((z) => el('blockquote', { class: 'alb-spruch' },
        el('span', { class: 'alb-anfuehrung' }, '„'),
        el('span', { class: 'alb-spruchtext' }, z))));
  }
  if (feld.form === 'wolke') {
    return el('div', { class: 'alb-stueck alb-wolke', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('div', { class: 'alb-wolkeworte' }, ...liste.map((w, i) => el('span', {
        class: 'alb-wort', style: flach ? '' : 'transform: rotate(' + albumDreh(figur.id, feld.id + ':' + i, 2) + 'deg)'
      }, w))));
  }
  if (feld.form === 'band') {
    return el('div', { class: 'alb-stueck alb-band', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('b', {}, liste.join('  ·  ')));
  }
  if (feld.form === 'liste') {
    return el('div', { class: 'alb-stueck alb-liste', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('ul', {}, ...liste.map((z) => {
        const ziel = feld.verweis ? albumFindeFigur(albumVerweisName(z)) : null;
        const rolle = feld.verweis ? albumVerweisRolle(z) : '';
        return el('li', {},
          rolle ? el('i', { class: 'alb-rolle' }, rolle) : null,
          ziel ? el('button', { class: 'alb-verweis', title: 'Im Album nachschlagen', onclick: () => albumSpringeZu(ziel.id) }, albumVerweisName(z)) : (rolle ? albumVerweisName(z) : z));
      })));
  }
  if (feld.form === 'notizfeld') {
    return el('div', { class: 'alb-stueck alb-notiz', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('div', { class: 'alb-notiztext' }, liste.join('\n')));
  }
  if (feld.form === 'karte') {
    return el('div', { class: 'alb-stueck alb-karte', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      ...liste.map((z) => el('p', {}, z)));
  }
  return el('div', { class: 'alb-stueck alb-zeile', style: stil },
    el('span', { class: 'alb-feldname' }, name),
    el('span', { class: 'alb-zeiletext' }, liste.join(' · ')));
}

/* ----- Was das Buch selbst über die Figur weiß ----- */
function albumZeitleisteBlock(figur, neu) {
  const termine = albumZeitleiste(figur);
  if (!termine.length) return null;
  return el('div', { class: 'alb-stueck alb-zeitleiste' },
    el('span', { class: 'alb-feldname' }, 'Im Kalender'),
    el('div', { class: 'alb-zl-spur' }, ...termine.slice(0, 14).map((t) => {
      const art = kalArt(t.art);
      const g = (figur.felder || {}).geboren;
      const a = g && t.art !== 'geburt' && kalGueltig(g) ? kalAlter(g, t.wann) : null;
      return el('button', { class: 'alb-zl-punkt', style: '--artfarbe:' + art.farbe, title: (t.titel || art.name) + ' · ' + kalLesbar(t.wann) + (a ? ' · ' + kalAlterText(a) : ''), onclick: () => { if (typeof kalenderOeffnen === 'function') kalenderOeffnen(t.wann); } },
        el('i', { html: kalIcon(t.icon || art.icon, 13) }),
        el('span', {}, el('b', {}, t.titel || art.name), el('small', {}, kalKurz(t.wann) + (a ? '  ·  ' + kalAlterText(a) : ''))));
    })));
}

function albumErwaehnungenBlock(figur) {
  const funde = albumErwaehnungen(figur, 6);
  if (!funde.length) return null;
  return el('details', { class: 'alb-stueck alb-erwaehnungen' },
    el('summary', {}, 'Kommt in ' + funde.length + (funde.length === 1 ? ' deiner Texte vor' : ' deiner Texte vor')),
    ...funde.map((x) => el('button', { class: 'alb-erwaehnung', onclick: () => { if (typeof oeffneDoc === 'function') oeffneDoc(x.doc); else if (typeof oeffneDokument === 'function') oeffneDokument(x.doc); } },
      el('b', {}, x.doc.titel || tischblattArt(x.doc) || 'Text'),
      el('span', {}, x.stelle))));
}

function albumWiderspruchBlock(figur) {
  const w = albumWidersprueche(figur);
  if (!w.length) return null;
  return el('div', { class: 'alb-stueck alb-widerspruch' },
    el('span', { class: 'alb-wsym' }, '!'),
    el('div', {}, ...w.map((t) => el('div', {}, t))));
}

function albumZettelBrett(figur) {
  const brett = el('div', { class: 'alb-stueck alb-zettelbrett' });
  albumZettel(figur).forEach((z, i) => {
    brett.append(el('div', {
      class: 'alb-zettel ton-' + (z.ton || 'butter'),
      style: 'transform: rotate(' + albumDreh(figur.id, 'zettel' + i, 3) + 'deg)'
    }, el('i', { class: 'alb-klebstreifen' }), el('span', {}, z.text)));
  });
  return brett;
}

function albumSpringeZu(id) {
  const liste = albumFiguren();
  const i = liste.findIndex((f) => f.id === id);
  if (i < 0) return;
  _alb.suche = '';
  const buehne = document.querySelector('.alb-buehne');
  if (!buehne) { albumOeffnen(i); return; }
  const zu = () => { const h = document.querySelector('.alb-huelle'); const s = h && h.closest('.schleier'); if (s) s.remove(); };
  const neu = (j) => { if (j != null) _alb.i = j; albumZeichne(buehne, neu, zu); };
  neu(i);
}

/* ----- Die Übersicht: alle Figuren auf einem Tisch ----- */
function albumRegal(neu) {
  const alle = albumFiguren();
  const fehlend = albumFehlendeFiguren(alle);
  const offene = albumOffeneFaeden(alle);
  const suchfeld = el('input', { type: 'search', class: 'albr-suche', placeholder: 'Suchen …' });
  const gitter = el('div', { class: 'albr-gitter' });

  const zeichne = () => {
    const treffer = albumSuche(suchfeld.value, alle);
    gitter.innerHTML = '';
    if (!treffer.length) { gitter.append(el('div', { class: 'albb-leer' }, 'Niemand passt dazu.')); return; }
    for (const f of treffer) {
      const farbe = albumFarbe(f);
      const anzahl = albumStuecke(f).length;
      const karte = el('button', { class: 'albr-karte', style: '--figurfarbe:' + farbe, onclick: () => { zu(); if (neu) { _alb.suche = ''; const i = albumFiguren().findIndex((x) => x.id === f.id); neu(Math.max(0, i)); } else albumOeffnen(0, f.id); } },
        el('span', { class: 'albr-bild' }, f.bild
          ? (() => { const i = el('img', { alt: '', draggable: 'false' }); if (typeof setzeBild === 'function') setzeBild(i, f.bild); return i; })()
          : Array.isArray(f.striche) && f.striche.length
            ? el('span', { class: 'albr-zeichnung', html: albumStricheSVG(f.striche, 54) })
            : el('span', { class: 'albr-monogramm' }, albumMonogramm(f))),
        el('span', { class: 'albr-text' },
          el('b', {}, f.name || 'ohne Namen'),
          el('small', {}, [anzahl + (anzahl === 1 ? ' Eintrag' : ' Einträge'),
            albumZettel(f).length ? albumZettel(f).length + ' Zettel' : '',
            albumFaeden(f).filter((x) => !x.erledigt).length ? albumFaeden(f).filter((x) => !x.erledigt).length + ' offen' : ''].filter(Boolean).join('  ·  '))),
        el('i', { class: 'albr-fuelle', style: 'width:' + Math.round(albumFuelle(f) * 100) + '%' }));
      gitter.append(karte);
    }
  };
  suchfeld.addEventListener('input', zeichne);

  const kasten = el('div', { class: 'modal albr-fenster' },
    el('div', { class: 'kartenkopf' }, 'ALLE FIGUREN'),
    suchfeld, gitter,
    offene.length ? el('details', { class: 'albr-faeden' },
      el('summary', {}, offene.length === 1 ? 'Ein offener Faden im ganzen Album' : offene.length + ' offene Fäden im ganzen Album'),
      ...offene.slice(0, 40).map((x) => el('button', { class: 'albr-fadenzeile', onclick: () => { zu(); albumSpringeZu(x.figur.id); } },
        el('i', {}, x.figur.name || 'ohne Namen'), el('span', {}, x.text)))) : null,
    fehlend.length ? el('details', { class: 'albr-fehlend' },
      el('summary', {}, fehlend.length === 1 ? 'Ein Name wird genannt, wohnt aber noch nicht im Album' : fehlend.length + ' Namen werden genannt, wohnen aber noch nicht im Album'),
      ...fehlend.slice(0, 30).map((x) => el('div', { class: 'albr-fehlendzeile' },
        el('b', {}, x.name),
        el('span', {}, 'genannt bei ' + [...new Set(x.wo)].slice(0, 3).join(', ')),
        el('button', { class: 'albr-anlegen', onclick: () => { zu(); albumNeueFigurMitNamen(x.name, (id) => { if (neu) { const i = albumFiguren().findIndex((y) => y.id === id); neu(Math.max(0, i)); } }); } }, 'anlegen')))) : null,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Zurück ins Buch')));
  const zu = zeigeDeck(kasten);
  zeichne();
  setTimeout(() => suchfeld.focus(), 60);
}
