/* ===================== 62b — DAS ALBUM, AUFGESCHLAGEN =====================
   Ein in Leder gebundenes Buch mit erhabenen Bünden auf dem Rücken,
   Messingecken und einer Schließe. Innen Bütten mit Wasserzeichen, ein
   doppelter Rahmen um den Satzspiegel, Fleurons in den Ecken, unten die
   Seitenzahl.

   Vorn liegt ein Titelblatt. Dann kommt für jede Figur eine Doppelseite.
   Ganz hinten wartet eine leere, auf der die nächste angelegt wird.

   Geblättert wird wie in einem Buch: Ein Blatt hebt sich, dreht sich um den
   Falz und legt sich auf die andere Seite. Vorderseite des Blattes ist die
   rechte Seite, die man verlässt; Rückseite ist die linke Seite, auf die man
   kommt — genau wie bei Papier. Springt man weiter als eine Seite, fliegen
   mehrere Blätter versetzt hintereinander, wie wenn man den Daumen
   durchlaufen lässt.

   Links: der Name, wer sie ist, wie sie aussieht, ihre Zeitleiste und die
   Klebezettel. Rechts: was für ein Mensch das ist, was ihr geschah, wie sie
   klingt, wohin sie gehört — und was das Buch selbst über sie weiß.

   Beide Seiten sind immer gleich groß. Eine halb leere Seite in einem
   kostbaren Buch ist keine Lücke, sondern Raum. */

const ALB_LINKS = ['kopf', 'aussehen'];
const ALB_RECHTS = ['wesen', 'leben', 'stimme', 'welt', 'rand'];
/* Was der Seitenkopf schon zeigt, steht nicht noch einmal als Etikett. */
const ALB_IM_KOPF = ['geboren', 'gestorben'];

let _alb = { i: 0, suche: '', offen: false, dreht: false, ordnung: 'alphabet', geschichte: '', frageSalz: 0 };

/* ----- Der Raum: das Buch liegt auf dem Pult ----- */
RENDER.album = function (haupt) {
  const figuren = albumFiguren();
  const dicke = Math.min(46, 12 + figuren.length * 1.6);
  const marke = albumMarkeFigur();
  const buch = el('button', {
    class: 'alb-regalbuch', title: figuren.length ? 'Das Album — ' + figuren.length + (figuren.length === 1 ? ' Figur' : ' Figuren') : 'Das Album — noch leer',
    style: '--dicke:' + dicke.toFixed(1) + 'px',
    onclick: () => albumOeffnen(0, marke ? marke.id : null)
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
    el('i', { class: 'alb-rb-band' + (marke ? ' gesetzt' : '') }));

  const kopf = raumkopf('Das Album', figuren.length
    ? figuren.length + (figuren.length === 1 ? ' Figur wohnt darin.' : ' Figuren wohnen darin.')
    : 'Ein dickes Buch mit lauter leeren Seiten. Eine Doppelseite für jede Figur.',
    figuren.length ? el('button', { class: 'knopf zart', title: 'Alle Figuren auf einen Blick', onclick: () => albumRegal() }, 'Übersicht') : null,
    figuren.length > 1 ? el('button', { class: 'knopf zart', title: 'Wer mit wem zu tun hat', onclick: () => albumNetzFenster() }, 'Das Netz') : null,
    el('button', { class: 'knopf voll', onclick: () => albumNeueFigur() }, 'Eine Figur anlegen'));

  const inhalt = el('div', { class: 'inhalt alb-raum' }, buch,
    marke ? el('button', { class: 'alb-markezeile', onclick: () => albumOeffnen(0, marke.id) },
      el('i', { style: 'background:' + albumFarbe(marke) }),
      el('span', {}, 'Das Bändchen liegt bei ', el('b', {}, marke.name || 'ohne Namen'))) : null,
    el('p', { class: 'alb-raumtext' }, figuren.length
      ? 'Schlag es auf und blättere. Oben links auf jeder Doppelseite steht der Name — ein Tippen darauf, und du kannst alles nachtragen oder wieder wegnehmen.'
      : 'Noch steht nichts darin. Leg die erste Figur an — und lass ruhig fast alles leer. Was leer bleibt, steht später einfach nicht auf der Seite.'));
  haupt.append(kopf, inhalt);
};

/* ----- Das Lesebändchen -----
   Ein Band, das man irgendwo hineinlegt und beim nächsten Mal wiederfindet.
   Gemerkt wird die Figur, nicht die Seitenzahl: sortiert man das Buch um,
   liegt das Band trotzdem bei ihr. */
function albumMarkeFigur() {
  const id = D.einst.albumMarke;
  if (!id) return null;
  const d = D.docs.get(id);
  return d && d.typ === 'albumfigur' && !d.geloescht ? d : null;
}
function albumMarkeSetzen(figur) {
  const marke = albumMarkeFigur();
  D.einst.albumMarke = marke && figur && marke.id === figur.id ? '' : (figur ? figur.id : '');
  speichereEinst();
  return !!D.einst.albumMarke;
}

/* ----- Das Buch aufschlagen ----- */
function albumOeffnen(start, zuFigurId) {
  _alb.suche = '';
  const figuren = albumSichtbare();
  /* Ein leeres Album auf dem Titelblatt aufzuschlagen hiesse: erst blaettern,
     dann anfangen. Wo noch niemand wohnt, liegt gleich die leere Doppelseite
     oben — das Titelblatt bleibt trotzdem davor. */
  _alb.i = zuFigurId ? albumBlattVon(zuFigurId, figuren)
    : figuren.length ? Math.max(0, Math.min(albumBlattAnzahl(figuren) - 1, start || 0)) : 1;

  const buehne = el('div', { class: 'alb-buehne' });
  const kasten = el('div', { class: 'alb-buch' },
    el('i', { class: 'alb-buchruecken' }, el('i', { class: 'alb-bund b1' }), el('i', { class: 'alb-bund b2' }), el('i', { class: 'alb-bund b3' })),
    el('i', { class: 'alb-stapel links', 'aria-hidden': 'true' }),
    el('i', { class: 'alb-stapel rechts', 'aria-hidden': 'true' }),
    buehne);
  const huelle = el('div', { class: 'alb-huelle' }, kasten);
  const zu = zeigeDeck(huelle, () => { document.removeEventListener('keydown', taste); _alb.offen = false; });
  _alb.offen = true;
  kasten.classList.add('schlaegt-auf');
  setTimeout(() => kasten.classList.remove('schlaegt-auf'), 1100);

  const neu = (i) => { if (i != null) _alb.i = i; albumZeichne(buehne, neu, zu); };
  const taste = (ev) => {
    if (!kasten.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 1) return;
    const liste = albumSichtbare();
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); albumBlaettern(1, buehne, neu); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); albumBlaettern(-1, buehne, neu); }
    else if (ev.key === 'Home') { ev.preventDefault(); albumSpringen(0, neu); }
    else if (ev.key === 'End') { ev.preventDefault(); albumSpringen(albumBlattAnzahl(liste) - 1, neu); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); albumNeueFigur((id) => { _alb.suche = ''; neu(albumBlattVon(id, albumSichtbare())); }); }
    else if (ev.key === 'z' || ev.key === 'Z') { ev.preventDefault(); if (liste.length) albumSpringen(1 + Math.floor(Math.random() * liste.length), neu); }
    else if (ev.key === 'b' || ev.key === 'B') { ev.preventDefault(); const f = albumFigurBei(_alb.i, liste); if (f) { toast(albumMarkeSetzen(f) ? 'Das Bändchen liegt jetzt hier.' : 'Das Bändchen ist wieder heraus.'); neu(); } }
  };
  document.addEventListener('keydown', taste);
  albumZeichne(buehne, neu, zu);
}

function albumSichtbare() {
  return albumAuswahl(albumFiguren(), { suche: _alb.suche, geschichte: _alb.geschichte, ordnung: _alb.ordnung });
}

function albumZeichne(buehne, neu, schliessen) {
  const liste = albumSichtbare();
  const anzahl = albumBlattAnzahl(liste);
  _alb.i = Math.max(0, Math.min(anzahl - 1, _alb.i));

  buehne.innerHTML = '';
  buehne.append(albumKopfleiste(liste, neu, schliessen));

  const block = el('div', { class: 'alb-block' },
    albumSeite(_alb.i, liste, 'links', neu),
    el('i', { class: 'alb-falz', 'aria-hidden': 'true' }),
    albumSeite(_alb.i, liste, 'rechts', neu));
  buehne.append(block);
  buehne.append(albumFuss(liste, neu));

  /* Dem Buch ansehen, wie weit man ist: die Blattkanten links und rechts. */
  const stapel = albumStapel(_alb.i, anzahl);
  const buch = buehne.closest('.alb-buch');
  if (buch) {
    buch.style.setProperty('--stapel-links', String(stapel.links));
    buch.style.setProperty('--stapel-rechts', String(stapel.rechts));
  }

  /* Das Lesebändchen hängt bei der Figur, bei der es liegt. */
  const marke = albumMarkeFigur();
  if (marke) {
    const wo = albumBlattVon(marke.id, liste);
    if (wo) block.append(el('button', {
      class: 'alb-band' + (wo === _alb.i ? ' hier' : ''),
      style: '--bandfarbe:' + albumFarbe(marke),
      title: wo === _alb.i ? 'Das Bändchen liegt hier — noch einmal tippen, und es kommt heraus' : 'Zum Bändchen: ' + (marke.name || 'ohne Namen'),
      onclick: () => { if (wo === _alb.i) { albumMarkeSetzen(marke); neu(); } else albumSpringen(wo, neu); }
    }, el('i', {})));
  }

  /* Die Stücke setzen sich wie Tinte — der Reihe nach, ganz kurz. */
  const stillsteht = (typeof document !== 'undefined' && document.hidden) ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!stillsteht) {
    const stuecke = [...block.querySelectorAll('.alb-stueck')];
    stuecke.forEach((s, i) => s.style.setProperty('--n', String(Math.min(i, 18))));
    block.classList.add('setzt-sich');
    setTimeout(() => block.classList.remove('setzt-sich'), 1500);
  }

  /* Wischen zum Blättern */
  let start = null;
  block.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('button, input, textarea, a')) { start = null; return; }
    start = { x: ev.clientX, y: ev.clientY, t: Date.now() };
  });
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
    _alb.suche = suchfeld.value; _alb.i = _alb.suche.trim() ? 1 : 0; neu();
    setTimeout(() => { const f = document.querySelector('.alb-suchfeld'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0);
  }, 240, true));

  const register = el('div', { class: 'alb-register' });
  for (const r of albumRegister(liste)) {
    register.append(el('button', {
      class: 'alb-regknopf' + (_alb.i >= r.von + 1 && _alb.i < r.von + 1 + r.anzahl ? ' an' : ''),
      title: r.anzahl + (r.anzahl === 1 ? ' Figur' : ' Figuren'),
      onclick: () => albumSpringen(r.von + 1, neu)
    }, r.buchstabe));
  }

  const geschichten = albumGeschichten(albumFiguren());
  const gefiltert = !!_alb.geschichte;
  const alle = albumFiguren().length;

  return el('div', { class: 'alb-kopf' },
    el('div', { class: 'alb-kopfzeile' },
      el('div', { class: 'alb-suche' }, el('span', { class: 'alb-lupe', html: ik('suche') }), suchfeld),
      el('div', { class: 'alb-kopfrechts' },
        alle > 1 ? el('button', { class: 'alb-werkzeug' + (_alb.ordnung !== 'alphabet' ? ' anders' : ''), title: 'In welcher Ordnung die Seiten liegen', onclick: () => albumOrdnungWaehlen(neu) }, albumOrdnungName(_alb.ordnung)) : null,
        geschichten.length ? el('button', { class: 'alb-werkzeug' + (gefiltert ? ' anders' : ''), title: 'Nur eine Geschichte zeigen', onclick: () => albumGeschichteWaehlen(geschichten, neu) }, gefiltert ? _alb.geschichte : 'Alle Geschichten') : null,
        el('button', { class: 'alb-werkzeug', title: 'Alle Figuren auf einen Blick', onclick: () => albumRegal(neu) }, 'Übersicht'),
        alle > 1 ? el('button', { class: 'alb-werkzeug', title: 'Wer mit wem zu tun hat', onclick: () => albumNetzFenster() }, 'Netz') : null,
        liste.length > 2 ? el('button', { class: 'alb-werkzeug', title: 'Irgendeine Figur aufschlagen (z)', onclick: () => albumSpringen(1 + Math.floor(Math.random() * liste.length), neu) }, 'Zufall') : null,
        el('button', { class: 'alb-neuknopf', title: 'Eine neue Figur anlegen (n)', onclick: () => albumNeueFigur((id) => { _alb.suche = ''; neu(albumBlattVon(id, albumSichtbare())); }) }, '+ Figur'),
        el('button', { class: 'alb-zuknopf', title: 'Das Album zuklappen', onclick: () => schliessen() }, '×'))),
    register.children.length ? register : null,
    _alb.suche.trim() || gefiltert
      ? el('div', { class: 'alb-suchhinweis' },
        el('span', {}, liste.length === 1 ? 'eine Figur' : liste.length + ' Figuren'),
        gefiltert ? el('button', { class: 'alb-hinweisweg', onclick: () => { _alb.geschichte = ''; _alb.i = 0; neu(); } }, 'Filter weg') : null,
        _alb.suche.trim() ? el('button', { class: 'alb-hinweisweg', onclick: () => { _alb.suche = ''; _alb.i = 0; neu(); } }, 'Suche weg') : null)
      : null);
}

/* Springen statt blättern, aber nicht ohne Bewegung: über mehrere Seiten
   fliegen mehrere Blätter. */
function albumSpringen(ziel, neu) {
  const buehne = document.querySelector('.alb-buehne');
  const weite = ziel - _alb.i;
  if (!buehne || !weite) { if (neu) neu(ziel); return; }
  albumBlaettern(weite > 0 ? 1 : -1, buehne, neu, ziel);
}

function albumFuss(liste, neu) {
  const anzahl = albumBlattAnzahl(liste);
  const art = albumBlattArt(_alb.i, liste);
  const figur = albumFigurBei(_alb.i, liste);
  const offene = figur ? albumFaeden(figur).filter((x) => !x.erledigt).length : 0;
  const marke = albumMarkeFigur();
  return el('div', { class: 'alb-fuss' },
    el('button', { class: 'alb-blaetter links', title: 'Zurückblättern', disabled: _alb.i <= 0 ? '' : null, onclick: () => albumBlaettern(-1, document.querySelector('.alb-buehne'), neu) }, '‹'),
    el('div', { class: 'alb-seitenzahl' },
      art === 'titel' ? el('b', { class: 'ohnenamen' }, 'Titelblatt')
        : art === 'neu' ? el('b', { class: 'ohnenamen' }, 'leere Doppelseite')
          : el('b', {}, figur.name || 'ohne Namen'),
      el('small', {}, (_alb.i + 1) + ' von ' + anzahl + (offene ? '  ·  ' + offene + (offene === 1 ? ' offener Faden' : ' offene Fäden') : ''))),
    figur ? el('button', {
      class: 'alb-merken' + (marke && marke.id === figur.id ? ' an' : ''),
      title: marke && marke.id === figur.id ? 'Das Bändchen wieder herausnehmen (b)' : 'Das Lesebändchen hier hineinlegen (b)',
      onclick: () => { toast(albumMarkeSetzen(figur) ? 'Das Bändchen liegt jetzt hier.' : 'Das Bändchen ist wieder heraus.'); neu(); }
    }, el('i', { class: 'alb-merkband', style: '--bandfarbe:' + albumFarbe(figur) })) : null,
    el('button', { class: 'alb-blaetter rechts', title: 'Weiterblättern', disabled: _alb.i >= anzahl - 1 ? '' : null, onclick: () => albumBlaettern(1, document.querySelector('.alb-buehne'), neu) }, '›'));
}

/* ----- Das Blättern -----
   Ein Blatt hebt sich und dreht sich um den Falz. Geht es über mehrere
   Seiten, fliegen bis zu vier — versetzt, damit es aussieht wie ein
   durchlaufender Daumen und nicht wie ein Sprung. */
const ALB_BLATT_MS = 620;
function albumBlaettern(richtung, buehne, neu, zielSprung) {
  if (!buehne || _alb.dreht) return;
  const liste = albumSichtbare();
  const anzahl = albumBlattAnzahl(liste);
  const ziel = Math.max(0, Math.min(anzahl - 1, zielSprung != null ? zielSprung : _alb.i + richtung));
  if (ziel === _alb.i) return;

  const block = buehne.querySelector('.alb-block');
  const stillsteht = (typeof document !== 'undefined' && document.hidden) ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    (typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches);
  if (!block || stillsteht) { if (neu) neu(ziel); return; }

  const vor = ziel > _alb.i;
  const weite = Math.abs(ziel - _alb.i);
  const blaetter = Math.min(4, weite);
  const versatz = blaetter > 1 ? 70 : 0;
  _alb.dreht = true;

  for (let n = 0; n < blaetter; n++) {
    /* Die Zwischenblätter zeigen die Seiten, über die man hinwegfliegt. */
    const vonStelle = vor ? Math.min(_alb.i + n, anzahl - 1) : Math.max(_alb.i - n, 0);
    const nachStelle = vor ? Math.min(vonStelle + 1, anzahl - 1) : Math.max(vonStelle - 1, 0);
    const vorn = albumSeite(vonStelle, liste, vor ? 'rechts' : 'links', neu, true);
    const hinten = albumSeite(nachStelle, liste, vor ? 'links' : 'rechts', neu, true);
    const blatt = el('div', { class: 'alb-blatt ' + (vor ? 'vor' : 'zurueck'), style: 'z-index:' + (30 - n) },
      el('div', { class: 'alb-blattseite vorn' }, vorn, el('i', { class: 'alb-blattglanz' }), el('i', { class: 'alb-blattfalz' })),
      el('div', { class: 'alb-blattseite hinten' }, hinten, el('i', { class: 'alb-blattglanz' }), el('i', { class: 'alb-blattfalz' })));
    block.append(blatt);
    /* Kein requestAnimationFrame: der steht still, sobald das Fenster
       verdeckt ist — dann bliebe das Blatt für immer hochkant stehen. */
    setTimeout(() => blatt.classList.add('laeuft'), 16 + n * versatz);
  }
  block.classList.add('blaettert');

  /* Die ruhende Seite darunter wird schon getauscht, damit hinter dem
     fliegenden Blatt nicht das Alte durchscheint. */
  setTimeout(() => {
    const untenLinks = block.querySelector(':scope > .alb-seite.links');
    const untenRechts = block.querySelector(':scope > .alb-seite.rechts');
    if (vor && untenRechts) untenRechts.replaceWith(albumSeite(ziel, liste, 'rechts', neu));
    if (!vor && untenLinks) untenLinks.replaceWith(albumSeite(ziel, liste, 'links', neu));
  }, 30);

  setTimeout(() => { _alb.dreht = false; if (neu) neu(ziel); }, ALB_BLATT_MS + (blaetter - 1) * versatz + 40);
}

/* ----- Eine Seite -----
   `stelle` ist die Doppelseite im Buch, nicht die Figur: 0 ist das
   Titelblatt, ganz hinten liegt die leere. So steht die Rechnerei an einer
   Stelle und nicht an sieben. */
function albumSeite(stelle, liste, welche, neu, flach) {
  const art = albumBlattArt(stelle, liste);
  const figur = albumFigurBei(stelle, liste);
  const seite = el('div', { class: 'alb-seite ' + welche + ' ist-' + art });
  /* Der Inhalt liegt in einem eigenen Bereich; der Seitenfuß ist ein
     Geschwisterelement danach. So läuft der Text nie unter die Seitenzahl —
     ein aufgelegtes Band davor war eine Verlegenheitslösung und sah beim
     Scrollen aus wie ein Fehler. */
  const inhalt = el('div', { class: 'alb-seiteninhalt' });
  const anhaengen = (...k) => anfuegen(inhalt, ...k);
  seite.append(el('i', { class: 'alb-rahmen', 'aria-hidden': 'true' }),
    ...['e1', 'e2', 'e3', 'e4'].map((e) => el('i', { class: 'alb-fleuron ' + e, 'aria-hidden': 'true' })));

  if (art === 'titel') {
    seite.append(el('div', { class: 'alb-laufkopf' }, ''));
    anhaengen(...albumTitelseite(welche, liste, neu));
    seite.append(inhalt);
    seite.append(el('div', { class: 'alb-seitenfuss' }, welche === 'links' ? '' : 'i'));
    return seite;
  }

  if (art === 'neu') {
    seite.append(el('div', { class: 'alb-laufkopf' }, welche === 'links' ? 'DAS ALBUM' : ''));
    if (welche === 'links') {
      anhaengen(el('div', { class: 'alb-leereseite' },
        el('button', { class: 'alb-neuefigur', onclick: () => albumNeueFigur((id) => { if (neu) neu(albumBlattVon(id, albumSichtbare())); }) },
          el('span', { class: 'alb-nf-kreuz' }, '+'),
          el('span', { class: 'alb-nf-text' }, el('b', {}, 'Eine Figur anlegen'), el('small', {}, liste.length ? 'Die nächste Doppelseite gehört ihr.' : 'Hier wohnt noch niemand.'))),
        el('div', { class: 'alb-leerhinweis' }, 'Trag ein, was du weißt. Alles andere darf leer bleiben — es steht dann einfach nicht auf der Seite, und man sieht ihm nicht an, dass es fehlt.')));
    } else {
      anhaengen(el('div', { class: 'alb-leerornament' }, el('i'), el('span', {}, 'leer'), el('i')));
    }
    seite.append(inhalt);
    seite.append(el('div', { class: 'alb-seitenfuss' }, ''));
    return seite;
  }

  const farbe = albumFarbe(figur);
  const nummer = (stelle - 1) * 2 + (welche === 'links' ? 1 : 2);
  seite.style.setProperty('--figurfarbe', farbe);
  /* Eine große, blasse Initiale liegt im Papier — wie in einem alten Buch.
     Sie füllt die Seite, ohne etwas zu behaupten: ein Buchstabe legt kein
     Gesicht fest. */
  seite.append(el('i', { class: 'alb-initiale', 'aria-hidden': 'true' }, welche === 'links' ? albumMonogramm(figur)[0] : albumBuchstabe(figur)));
  seite.append(el('div', { class: 'alb-laufkopf' },
    welche === 'links' ? albumBuchstabe(figur) + ' · DAS ALBUM' : (figur.name || '').toUpperCase()));

  const motto = (figur.felder || {}).motto;

  if (welche === 'links') {
    if (motto) anhaengen(el('div', { class: 'alb-stueck alb-motto' }, el('span', {}, motto)));
    if (albumBildnisAn()) anhaengen(albumBildplatte(figur, neu));
    anhaengen(albumSeitenkopf(figur, neu, flach));
    /* Geburts- und Todestag stehen bereits im Seitenkopf, mit Stern und
       Kreuz und in Sprache statt in Ziffern. Noch einmal als Etikett mit
       „1783-04-09" darunter waere Doppelung — und die haesslichere. */
    const stuecke = albumStuecke(figur).filter((s) => ALB_LINKS.includes(s.feld.gruppe) && !ALB_IM_KOPF.includes(s.feld.id));
    anhaengen(albumStueckFeld(figur, stuecke, flach));
    /* Die Zeitleiste steht links: sie gehört zur Biografie, nicht zum Wesen. */
    let zeit = null;
    if (!flach) { zeit = albumZeitleisteBlock(figur, neu); if (zeit) anhaengen(zeit); }
    /* Die Klebezettel kleben links, unter dem Steckbrief — dort haben sie
       Platz, und die linke Seite bekommt das Gewicht, das ihr sonst fehlt. */
    const zettel = albumZettel(figur);
    if (zettel.length) anhaengen(albumZettelBrett(figur));
    if (!stuecke.length && !zeit && !zettel.length) anhaengen(el('div', { class: 'alb-leerornament zart' }, el('i'), el('span', {}, 'noch nichts eingetragen'), el('i')));
  } else {
    const stuecke = albumStuecke(figur).filter((s) => ALB_RECHTS.includes(s.feld.gruppe) && s.feld.id !== 'motto');
    anhaengen(albumStueckFeld(figur, stuecke, flach));
    if (!flach) {
      const erw = albumErwaehnungenBlock(figur);
      if (erw) anhaengen(erw);
      const w = albumWiderspruchBlock(figur);
      if (w) anhaengen(w);
      anhaengen(albumFrageBlock(figur, neu));
    }
    if (!stuecke.length) anhaengen(el('div', { class: 'alb-leerornament zart' }, el('i'), el('span', {}, 'noch nichts eingetragen'), el('i')));
  }
  seite.append(inhalt);
  seite.append(el('i', { class: 'alb-seitenband', style: 'background:' + farbe, title: figur.name }));
  seite.append(el('div', { class: 'alb-seitenfuss' }, String(nummer)));
  return seite;
}

/* ----- Das Titelblatt -----
   Links steht, was das Buch ist. Rechts steht, was darin vorkommt — das
   Verzeichnis, in dem man mit einem Tippen landet. */
function albumTitelseite(welche, liste, neu) {
  const d = albumTitelDaten(albumFiguren());
  if (welche === 'links') {
    const zeilen = [
      d.anzahl ? d.anzahl + (d.anzahl === 1 ? ' Figur' : ' Figuren') : 'noch keine Figur',
      d.eintraege ? d.eintraege + (d.eintraege === 1 ? ' Eintrag' : ' Einträge') : '',
      d.zettel ? d.zettel + ' Klebezettel' : '',
      d.geschichten ? d.geschichten + (d.geschichten === 1 ? ' Geschichte' : ' Geschichten') : ''
    ].filter(Boolean);
    return [
      el('div', { class: 'alb-titelblatt' },
        el('i', { class: 'alb-tb-fleuron oben', 'aria-hidden': 'true' }),
        el('div', { class: 'alb-tb-titel' }, 'Das Album'),
        el('div', { class: 'alb-tb-unter' }, 'Ein Buch der Figuren'),
        el('i', { class: 'alb-tb-linie', 'aria-hidden': 'true' }),
        el('div', { class: 'alb-tb-zahlen' }, ...zeilen.map((z) => el('span', {}, z))),
        d.angelegt ? el('div', { class: 'alb-tb-datum' }, 'Angefangen ' + fmtDatum(d.angelegt)) : null,
        el('i', { class: 'alb-tb-fleuron unten', 'aria-hidden': 'true' }))
    ];
  }
  const register = albumRegister(liste);
  return [
    el('div', { class: 'alb-tb-inhaltkopf' }, 'Was darin steht'),
    liste.length
      ? el('div', { class: 'alb-tb-verzeichnis' }, ...register.map((r) => el('div', { class: 'alb-tb-gruppe' },
        el('button', { class: 'alb-tb-buchstabe', title: r.anzahl + (r.anzahl === 1 ? ' Figur' : ' Figuren'), onclick: () => albumSpringen(r.von + 1, neu) }, r.buchstabe),
        el('div', { class: 'alb-tb-namen' }, ...liste.slice(r.von, r.von + r.anzahl).map((f, k) => el('button', {
          class: 'alb-tb-name', style: '--figurfarbe:' + albumFarbe(f),
          onclick: () => albumSpringen(r.von + 1 + k, neu)
        }, el('span', {}, f.name || 'ohne Namen'), el('i', {}, String((r.von + k) * 2 + 1))))))))
      : el('div', { class: 'alb-leerornament zart' }, el('i'), el('span', {}, 'noch niemand'), el('i')),
    d.offen ? el('div', { class: 'alb-tb-offen' }, d.offen === 1 ? 'Ein Faden ist noch offen.' : d.offen + ' Fäden sind noch offen.') : null
  ];
}

/* ----- Die Frage an die Figur -----
   Kein Feld, keine Pflicht: ein Satz, der da steht und wartet. Wer mag,
   nimmt ihn und klebt die Antwort als Zettel auf die andere Seite. */
function albumFrageBlock(figur, neu) {
  const frage = albumFrage(figur, _alb.frageSalz);
  return el('div', { class: 'alb-stueck alb-frage' },
    el('span', { class: 'alb-feldname' }, 'Eine Frage'),
    el('p', { class: 'alb-fragetext' }, frage),
    el('div', { class: 'alb-fragereihe' },
      el('button', { class: 'alb-fragewuerfel', title: 'Eine andere Frage', onclick: () => { _alb.frageSalz++; if (neu) neu(); } }, '↻'),
      el('button', { class: 'alb-frageschreiben', title: 'Die Antwort als Klebezettel ins Album kleben', onclick: () => albumFrageBeantworten(figur, frage, neu) }, 'antworten')));
}
async function albumFrageBeantworten(figur, frage, neu) {
  if (albumZettel(figur).length >= ALBUM_ZETTEL_MAX) { toast('Fünfzehn Klebezettel sind genug — nimm erst einen ab.'); return; }
  const antwort = await eingabe({ titel: frage, platzhalter: 'Was fällt dir ein?', ok: 'Ankleben', mehrzeilig: true });
  if (!antwort || !antwort.trim()) return;
  const zettel = (Array.isArray(figur.zettel) ? figur.zettel : []).slice();
  zettel.push({ text: antwort.trim().slice(0, 400), ton: ALBUM_ZETTELTOENE[albumHash(figur.id, frage) % ALBUM_ZETTELTOENE.length] });
  figur.zettel = zettel;
  speichere(figur);
  toast('Klebt links auf der Seite.');
  if (neu) neu();
}

/* ----- Die Ordnung und der Geschichten-Filter ----- */
function albumOrdnungWaehlen(neu) {
  const kasten = el('div', { class: 'modal albo-fenster' },
    el('div', { class: 'kartenkopf' }, 'IN WELCHER ORDNUNG'),
    el('p', { class: 'albo-vor' }, 'Alphabetisch ist die Ruhelage — dort liegt jede Figur immer an derselben Stelle. Die anderen Ordnungen sind zum Suchen gedacht, nicht zum Wohnen.'),
    ...ALBUM_ORDNUNGEN.map((o) => el('button', {
      class: 'albo-wahl' + (_alb.ordnung === o[0] ? ' an' : ''),
      onclick: () => { _alb.ordnung = o[0]; _alb.i = 0; zu(); if (neu) neu(); }
    }, el('b', {}, o[1]), el('small', {}, o[2]))),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Zurück')));
  const zu = zeigeDeck(kasten);
}
function albumGeschichteWaehlen(geschichten, neu) {
  const kasten = el('div', { class: 'modal albo-fenster' },
    el('div', { class: 'kartenkopf' }, 'WELCHE GESCHICHTE'),
    el('p', { class: 'albo-vor' }, 'Was du bei „Kommt vor in" eingetragen hast, steht hier. Es wird nur gezählt, nicht verwaltet — schreib hinein, was du willst.'),
    el('button', { class: 'albo-wahl' + (!_alb.geschichte ? ' an' : ''), onclick: () => { _alb.geschichte = ''; _alb.i = 0; zu(); if (neu) neu(); } },
      el('b', {}, 'Alle Geschichten'), el('small', {}, 'Das ganze Album')),
    ...geschichten.map((g) => el('button', {
      class: 'albo-wahl' + (_alb.geschichte === g.name ? ' an' : ''),
      onclick: () => { _alb.geschichte = g.name; _alb.i = 0; zu(); if (neu) neu(); }
    }, el('b', {}, g.name), el('small', {}, g.anzahl + (g.anzahl === 1 ? ' Figur' : ' Figuren')))),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Zurück')));
  const zu = zeigeDeck(kasten);
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

function albumSeitenkopf(figur, neu, flach) {
  const alter = albumAlterText(figur);
  const g = (figur.felder || {}).geboren, t = (figur.felder || {}).gestorben;
  const lebensdaten = [g && kalGueltig(g) ? '✻ ' + kalKurz(g) : '', t && kalGueltig(t) ? '† ' + kalKurz(t) : ''].filter(Boolean).join('   ');
  return el('div', { class: 'alb-seitenkopf' },
    el('button', { class: 'alb-name' + (flach ? '' : ' schreibt'), title: 'Alles zu dieser Figur — nachtragen, ändern, wegnehmen', onclick: () => albumBearbeiten(figur, () => { if (neu) neu(); }) },
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
    /* Zitate stehen für sich. Unter jedem noch einmal „Sagt" zu schreiben,
       wäre Beiwerk — die Anführungszeichen sagen es bereits. Nur wo der
       Feldname etwas HINZUFÜGT (die erste Zeile), steht er einmal darüber. */
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
    /* Geschichten sind anklickbar: ein Tippen, und das Buch zeigt nur noch,
       wer darin vorkommt. */
    if (feld.id === 'geschichte') {
      return el('div', { class: 'alb-stueck alb-band', style: stil },
        el('span', { class: 'alb-feldname' }, name),
        el('span', { class: 'alb-bandreihe' }, ...liste.map((z) => el('button', {
          class: 'alb-geschichte' + (_alb.geschichte === z ? ' an' : ''),
          title: _alb.geschichte === z ? 'Wieder alle Figuren zeigen' : 'Nur die Figuren aus „' + z + '" zeigen',
          onclick: () => {
            _alb.geschichte = _alb.geschichte === z ? '' : z; _alb.suche = '';
            _alb.i = albumBlattVon(figur.id, albumSichtbare()) || 0;
            const buehne = document.querySelector('.alb-buehne');
            if (buehne) { const n = (j) => { if (j != null) _alb.i = j; albumZeichne(buehne, n, () => {}); }; n(); }
          }
        }, z))));
    }
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
      style: 'transform: rotate(' + albumDreh(figur.id, 'zettel' + i, 3) + 'deg); --nz:' + i
    }, el('i', { class: 'alb-klebstreifen' }), el('span', {}, z.text)));
  });
  return brett;
}

function albumSpringeZu(id) {
  _alb.suche = '';
  /* Steckt gerade ein Geschichten-Filter drin, in dem die gesuchte Figur
     nicht vorkommt, muss er weg — sonst landet man wortlos am Titelblatt. */
  if (!albumBlattVon(id, albumSichtbare())) _alb.geschichte = '';
  const stelle = albumBlattVon(id, albumSichtbare());
  const buehne = document.querySelector('.alb-buehne');
  if (!buehne) { albumOeffnen(stelle); return; }
  const neu = (j) => {
    if (j != null) _alb.i = j;
    albumZeichne(buehne, neu, () => { const h = document.querySelector('.alb-huelle'); const s = h && h.closest('.schleier'); if (s) s.remove(); });
  };
  albumSpringen(stelle, neu);
}

/* ----- Das Netz: wer mit wem zu tun hat ----- */
function albumNetzFenster() {
  const alle = albumFiguren();
  const netz = albumNetz(alle);
  const zwillinge = albumZwillinge(alle);
  const punkte = netz.knoten.length;
  const radius = punkte > 34 ? 3.2 : punkte > 18 ? 4.2 : 5.4;

  const NS = 'http://www.w3.org/2000/svg';
  const mach = (art, attrs) => {
    const k = document.createElementNS(NS, art);
    for (const a of Object.keys(attrs)) k.setAttribute(a, String(attrs[a]));
    return k;
  };
  const svg = mach('svg', { viewBox: '0 0 100 100', class: 'albn-svg', preserveAspectRatio: 'xMidYMid meet' });

  netz.kanten.forEach((k, i) => {
    /* Eine Sehne, die sich zur Mitte hin krümmt — gerade Linien quer durch
       den Kreis sähen aus wie ein zerbrochenes Rad. */
    const mx = (k.von.x + k.zu.x) / 2, my = (k.von.y + k.zu.y) / 2;
    const cx = 50 + (mx - 50) * 0.32, cy = 50 + (my - 50) * 0.32;
    const pfad = mach('path', {
      d: 'M' + k.von.x + ',' + k.von.y + ' Q' + cx.toFixed(2) + ',' + cy.toFixed(2) + ' ' + k.zu.x + ',' + k.zu.y,
      class: 'albn-kante art-' + k.art, style: '--n:' + Math.min(i, 40)
    });
    const titel = mach('title', {});
    titel.textContent = k.von.name + ' — ' + (k.rolle || k.artName) + ' — ' + k.zu.name;
    pfad.append(titel);
    svg.append(pfad);
  });
  netz.knoten.forEach((k, i) => {
    const g = mach('g', { class: 'albn-knoten' + (k.grad ? '' : ' allein'), style: '--n:' + Math.min(i, 40), tabindex: '0', role: 'button' });
    g.append(mach('circle', { cx: k.x, cy: k.y, r: radius, fill: k.farbe, class: 'albn-punkt' }));
    const rechts = k.x >= 50;
    const t = mach('text', {
      x: (k.x + (rechts ? radius + 1.6 : -(radius + 1.6))).toFixed(2), y: (k.y + 1.1).toFixed(2),
      class: 'albn-name', 'text-anchor': rechts ? 'start' : 'end'
    });
    t.textContent = k.name.length > 15 ? k.name.slice(0, 14) + '…' : k.name;
    g.append(t);
    const titel = mach('title', {});
    titel.textContent = k.name + (k.grad ? ' · ' + k.grad + (k.grad === 1 ? ' Verbindung' : ' Verbindungen') : ' · steht allein');
    g.append(titel);
    const hin = () => { zu(); albumSpringeZu(k.id); };
    g.addEventListener('click', hin);
    g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); hin(); } });
    svg.append(g);
  });

  const kasten = el('div', { class: 'modal albn-fenster' },
    el('div', { class: 'kartenkopf' }, 'DAS NETZ'),
    el('p', { class: 'albn-vor' }, 'Wer bei Familie, Nähe, Bewunderung oder Verachtung genannt wird und selbst im Album wohnt, bekommt eine Linie. Wer keine hat, steht allein — das ist kein Fehler, aber oft ein Hinweis.'),
    el('div', { class: 'albn-buehne' }, svg),
    el('div', { class: 'albn-legende' },
      ...Object.keys(ALBUM_NETZ_ARTEN).map((a) => el('span', { class: 'albn-le art-' + a }, el('i', {}), ALBUM_NETZ_ARTEN[a]))),
    netz.allein.length ? el('div', { class: 'albn-allein' },
      el('b', {}, netz.allein.length === 1 ? 'Eine Figur steht allein: ' : netz.allein.length + ' Figuren stehen allein: '),
      ...netz.allein.slice(0, 12).map((k, i) => el('button', { class: 'albn-alleinname', onclick: () => { zu(); albumSpringeZu(k.id); } }, (i ? ', ' : '') + k.name))) : null,
    zwillinge.length ? el('details', { class: 'albn-zwillinge' },
      el('summary', {}, zwillinge.length === 1 ? 'Zwei Figuren ähneln sich auffällig' : zwillinge.length + ' Paare ähneln sich auffällig'),
      el('p', {}, 'Gezählt über gemeinsame Wesenswörter, Schwächen, Leidenschaften, Eigenheiten und Geschichten. Das muss nichts heißen — Geschwister dürfen sich gleichen.'),
      ...zwillinge.map((z) => el('div', { class: 'albn-zwilling' },
        el('button', { onclick: () => { zu(); albumSpringeZu(z.a.id); } }, z.a.name || 'ohne Namen'),
        el('i', {}, Math.round(z.wert * 100) + '%'),
        el('button', { onclick: () => { zu(); albumSpringeZu(z.b.id); } }, z.b.name || 'ohne Namen'),
        el('button', { class: 'albn-vergleichen', onclick: () => { zu(); albumGegenueberFenster(z.a, z.b); } }, 'nebeneinander')))) : null,
    el('div', { class: 'reihe' },
      alle.length > 1 ? el('button', { class: 'knopf zart', onclick: () => { zu(); albumVergleichWaehlen(); } }, 'Zwei vergleichen') : null,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Zurück ins Buch')));
  const zu = zeigeDeck(kasten);
}

/* ----- Zwei nebeneinander ----- */
function albumVergleichWaehlen(vorgabe) {
  const alle = albumFiguren();
  let a = vorgabe || null, b = null;
  const gitter = el('div', { class: 'albv-wahl' });
  const stand = el('div', { class: 'albv-stand' });
  const losKnopf = el('button', { class: 'knopf voll', onclick: () => { const x = a, y = b; zu(); albumGegenueberFenster(x, y); } }, 'Nebeneinander legen');
  const zeichne = () => {
    gitter.innerHTML = '';
    for (const f of alle) {
      gitter.append(el('button', {
        class: 'albv-kandidat' + (a && a.id === f.id ? ' a' : '') + (b && b.id === f.id ? ' b' : ''),
        style: '--figurfarbe:' + albumFarbe(f),
        onclick: () => {
          if (a && a.id === f.id) a = null;
          else if (b && b.id === f.id) b = null;
          else if (!a) a = f;
          else if (!b) b = f;
          else { a = b; b = f; }
          zeichne();
        }
      }, el('span', { class: 'albv-mono' }, albumMonogramm(f)), el('span', {}, f.name || 'ohne Namen')));
    }
    losKnopf.disabled = !(a && b);
    stand.textContent = a && b ? (a.name || 'ohne Namen') + ' und ' + (b.name || 'ohne Namen') : a ? 'Und wer noch?' : 'Wähl zwei aus.';
  };
  const kasten = el('div', { class: 'modal albv-fenster' },
    el('div', { class: 'kartenkopf' }, 'ZWEI VERGLEICHEN'),
    stand, gitter,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'), losKnopf));
  const zu = zeigeDeck(kasten);
  zeichne();
}

function albumGegenueberFenster(a, b) {
  if (!a || !b) return;
  const zeilen = albumGegenueber(a, b);
  const gleiche = zeilen.filter((z) => z.gleich).length;
  const kasten = el('div', { class: 'modal albg-fenster' },
    el('div', { class: 'kartenkopf' }, 'NEBENEINANDER'),
    el('div', { class: 'albg-kopf' },
      el('div', { class: 'albg-wer', style: '--figurfarbe:' + albumFarbe(a) }, el('b', {}, a.name || 'ohne Namen'), el('small', {}, albumStuecke(a).length + ' Einträge')),
      el('i', { class: 'albg-mitte', title: 'Wie viele der mehrfach besetzten Felder — Wesen, Schwächen, Leidenschaften, Eigenheiten, Geschichten, Spitznamen — die beiden gemeinsam haben.' }, Math.round(albumAehnlichkeit(a, b) * 100) + '%'),
      el('div', { class: 'albg-wer', style: '--figurfarbe:' + albumFarbe(b) }, el('b', {}, b.name || 'ohne Namen'), el('small', {}, albumStuecke(b).length + ' Einträge'))),
    gleiche ? el('p', { class: 'albg-hinweis' }, gleiche === 1 ? 'Ein Feld ist wortgleich — das ist markiert.' : gleiche + ' Felder sind wortgleich — das ist markiert.') : null,
    zeilen.length
      ? el('div', { class: 'albg-tafel' }, ...zeilen.map((z, i) => el('div', { class: 'albg-zeile' + (z.gleich ? ' gleich' : '') + (z.nurEiner ? ' einer' : ''), style: '--n:' + Math.min(i, 30) },
        el('div', { class: 'albg-links' }, z.a || el('i', { class: 'albg-nichts' }, '—')),
        el('div', { class: 'albg-feld' }, albumBeschriftung(z.feld.name, '')),
        el('div', { class: 'albg-rechts' }, z.b || el('i', { class: 'albg-nichts' }, '—')))))
      : el('p', { class: 'albg-hinweis' }, 'Beide sind noch leer — da gibt es nichts zu vergleichen.'),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { zu(); albumSpringeZu(a.id); } }, 'Zu ' + (a.name || 'links')),
      el('button', { class: 'knopf zart', onclick: () => { zu(); albumSpringeZu(b.id); } }, 'Zu ' + (b.name || 'rechts')),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Schließen')));
  const zu = zeigeDeck(kasten);
}

/* ----- Die Übersicht: alle Figuren auf einem Tisch ----- */
function albumRegal(neu) {
  const alle = albumFiguren();
  const fehlend = albumFehlendeFiguren(alle);
  const offene = albumOffeneFaeden(alle);
  const geschichten = albumGeschichten(alle);
  let ordnung = _alb.ordnung, filter = '';
  const suchfeld = el('input', { type: 'search', class: 'albr-suche', placeholder: 'Suchen …' });
  const gitter = el('div', { class: 'albr-gitter' });
  const leiste = el('div', { class: 'albr-leiste' });

  const springe = (f) => {
    zu();
    if (!neu) { albumOeffnen(0, f.id); return; }
    _alb.suche = '';
    if (!albumBlattVon(f.id, albumSichtbare())) _alb.geschichte = '';
    neu(albumBlattVon(f.id, albumSichtbare()));
  };

  const zeichne = () => {
    leiste.innerHTML = '';
    for (const o of ALBUM_ORDNUNGEN) {
      leiste.append(el('button', { class: 'albr-ord' + (ordnung === o[0] ? ' an' : ''), title: o[2], onclick: () => { ordnung = o[0]; zeichne(); } }, o[1]));
    }
    if (geschichten.length) {
      leiste.append(el('span', { class: 'albr-trenner' }));
      leiste.append(el('button', { class: 'albr-ord' + (!filter ? ' an' : ''), onclick: () => { filter = ''; zeichne(); } }, 'Alle'));
      for (const g of geschichten.slice(0, 8)) {
        leiste.append(el('button', { class: 'albr-ord' + (filter === g.name ? ' an' : ''), onclick: () => { filter = filter === g.name ? '' : g.name; zeichne(); } }, g.name));
      }
    }
    const treffer = albumAuswahl(alle, { suche: suchfeld.value, geschichte: filter, ordnung });
    gitter.innerHTML = '';
    if (!treffer.length) { gitter.append(el('div', { class: 'albb-leer' }, 'Niemand passt dazu.')); return; }
    treffer.forEach((f, i) => {
      const anzahl = albumStuecke(f).length;
      const offen = albumFaeden(f).filter((x) => !x.erledigt).length;
      gitter.append(el('button', { class: 'albr-karte', style: '--figurfarbe:' + albumFarbe(f) + ';--n:' + Math.min(i, 24), onclick: () => springe(f) },
        el('span', { class: 'albr-bild' }, f.bild
          ? (() => { const im = el('img', { alt: '', draggable: 'false' }); if (typeof setzeBild === 'function') setzeBild(im, f.bild); return im; })()
          : Array.isArray(f.striche) && f.striche.length
            ? el('span', { class: 'albr-zeichnung', html: albumStricheSVG(f.striche, 54) })
            : el('span', { class: 'albr-monogramm' }, albumMonogramm(f))),
        el('span', { class: 'albr-text' },
          el('b', {}, f.name || 'ohne Namen'),
          el('small', {}, [anzahl + (anzahl === 1 ? ' Eintrag' : ' Einträge'),
            albumZettel(f).length ? albumZettel(f).length + ' Zettel' : '',
            offen ? offen + ' offen' : ''].filter(Boolean).join('  ·  '))),
        el('i', { class: 'albr-fuelle', style: 'width:' + Math.round(albumFuelle(f) * 100) + '%' })));
    });
  };
  suchfeld.addEventListener('input', zeichne);

  const kasten = el('div', { class: 'modal albr-fenster' },
    el('div', { class: 'kartenkopf' }, 'ALLE FIGUREN'),
    suchfeld, leiste, gitter,
    offene.length ? el('details', { class: 'albr-faeden' },
      el('summary', {}, offene.length === 1 ? 'Ein offener Faden im ganzen Album' : offene.length + ' offene Fäden im ganzen Album'),
      ...offene.slice(0, 40).map((x) => el('button', { class: 'albr-fadenzeile', onclick: () => { zu(); albumSpringeZu(x.figur.id); } },
        el('i', {}, x.figur.name || 'ohne Namen'), el('span', {}, x.text)))) : null,
    fehlend.length ? el('details', { class: 'albr-fehlend' },
      el('summary', {}, fehlend.length === 1 ? 'Ein Name wird genannt, wohnt aber noch nicht im Album' : fehlend.length + ' Namen werden genannt, wohnen aber noch nicht im Album'),
      ...fehlend.slice(0, 30).map((x) => el('div', { class: 'albr-fehlendzeile' },
        el('b', {}, x.name),
        el('span', {}, 'genannt bei ' + [...new Set(x.wo)].slice(0, 3).join(', ')),
        el('button', { class: 'albr-anlegen', onclick: () => { zu(); albumNeueFigurMitNamen(x.name, (id) => { if (neu) neu(albumBlattVon(id, albumSichtbare())); }); } }, 'anlegen')))) : null,
    el('div', { class: 'reihe' },
      alle.length > 1 ? el('button', { class: 'knopf zart', onclick: () => { zu(); albumVergleichWaehlen(); } }, 'Zwei vergleichen') : null,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Zurück ins Buch')));
  const zu = zeigeDeck(kasten);
  zeichne();
  setTimeout(() => suchfeld.focus(), 60);
}
