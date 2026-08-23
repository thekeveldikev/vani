/* ===================== 62b — DAS ALBUM, AUFGESCHLAGEN =====================
   Der Raum zeigt ein dickes Buch. Ein Tippen, und es klappt auf.

   Geblättert wird wie in einem Buch: Ein Blatt hebt sich, dreht sich um den
   Falz und legt sich auf die andere Seite. Vorderseite des Blattes ist die
   rechte Seite, die man verlässt; Rückseite ist die linke Seite, auf die man
   kommt — genau wie bei Papier. Deshalb sieht man beim Drehen auch beides.

   Eine Doppelseite gehört einer Figur. Links steht, wer sie ist und wie sie
   aussieht; rechts, was für ein Mensch das ist, was ihr geschah, wie sie
   klingt und wohin sie gehört. Diese Aufteilung ändert sich nie — nur so
   findet man nach dreißig Figuren noch etwas wieder. */

const ALB_LINKS = ['kopf', 'aussehen'];
const ALB_RECHTS = ['wesen', 'leben', 'stimme', 'welt', 'rand'];

let _alb = { i: 0, suche: '', offen: false, dreht: false };

/* ----- Der Raum: das Buch liegt da ----- */
RENDER.album = function (haupt) {
  const figuren = albumFiguren();
  const dicke = Math.min(38, 10 + figuren.length * 1.4);
  const buch = el('button', {
    class: 'alb-regalbuch', title: figuren.length ? 'Das Album — ' + figuren.length + (figuren.length === 1 ? ' Figur' : ' Figuren') : 'Das Album — noch leer',
    style: '--dicke:' + dicke.toFixed(1) + 'px',
    onclick: () => albumOeffnen(0)
  },
    el('i', { class: 'alb-rb-block' }),
    el('div', { class: 'alb-rb-deckel' },
      el('i', { class: 'alb-rb-praegung' }),
      el('span', { class: 'alb-rb-titel' }, 'ALBUM'),
      el('span', { class: 'alb-rb-unter' }, figuren.length ? figuren.length + (figuren.length === 1 ? ' Figur' : ' Figuren') : 'noch leer'),
      el('i', { class: 'alb-rb-ecke e1' }), el('i', { class: 'alb-rb-ecke e2' }),
      el('i', { class: 'alb-rb-ecke e3' }), el('i', { class: 'alb-rb-ecke e4' })),
    el('i', { class: 'alb-rb-band' }));

  const kopf = raumkopf('Das Album', figuren.length
    ? figuren.length + (figuren.length === 1 ? ' Figur wohnt darin.' : ' Figuren wohnen darin.')
    : 'Ein dickes Buch mit lauter leeren Seiten. Eine Doppelseite für jede Figur.',
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
  const kasten = el('div', { class: 'alb-buch' }, buehne);
  const huelle = el('div', { class: 'alb-huelle' }, kasten);
  const zu = zeigeDeck(huelle, () => { document.removeEventListener('keydown', taste); _alb.offen = false; });
  _alb.offen = true;
  /* Der Deckel klappt auf */
  kasten.classList.add('schlaegt-auf');
  setTimeout(() => kasten.classList.remove('schlaegt-auf'), 900);

  const neu = (i) => { if (i != null) _alb.i = i; albumZeichne(buehne, neu, zu); };
  const taste = (ev) => {
    if (!kasten.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 1) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); albumBlaettern(1, buehne, neu); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); albumBlaettern(-1, buehne, neu); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); albumNeueFigur((id) => { const f = albumFiguren(); neu(Math.max(0, f.findIndex((x) => x.id === id))); }); }
  };
  document.addEventListener('keydown', taste);
  albumZeichne(buehne, neu, zu);
}

/* Welche Figuren gerade im Buch stehen (Suche wirkt wie ein Register). */
function albumSichtbare() {
  const alle = albumFiguren();
  return _alb.suche.trim() ? albumSuche(_alb.suche, alle) : alle;
}

function albumZeichne(buehne, neu, schliessen) {
  const liste = albumSichtbare();
  /* Hinter der letzten Figur liegt immer eine leere Doppelseite: dort wird
     die nächste angelegt. So ist das Buch nie zu Ende. */
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

  /* Wischen zum Blättern */
  let start = null;
  block.addEventListener('pointerdown', (ev) => { if (ev.target.closest('button, input, textarea, a')) return; start = { x: ev.clientX, y: ev.clientY, t: Date.now() }; });
  block.addEventListener('pointerup', (ev) => {
    if (!start) return;
    const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
    const s = start; start = null;
    if (Date.now() - s.t > 700 || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    albumBlaettern(dx < 0 ? 1 : -1, buehne, neu);
  });
}

/* ----- Die feste Leiste oben: Suche, Register, Zuklappen ----- */
function albumKopfleiste(liste, neu, schliessen) {
  const suchfeld = el('input', { type: 'search', class: 'alb-suchfeld', placeholder: 'Figur suchen …', value: _alb.suche });
  suchfeld.addEventListener('input', entprellt(() => { _alb.suche = suchfeld.value; _alb.i = 0; neu(); setTimeout(() => { const f = document.querySelector('.alb-suchfeld'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0); }, 240, true));

  const register = el('div', { class: 'alb-register' });
  for (const r of albumRegister(liste)) {
    register.append(el('button', { class: 'alb-regknopf' + (_alb.i >= r.von && _alb.i < r.von + r.anzahl ? ' an' : ''), title: r.anzahl + (r.anzahl === 1 ? ' Figur' : ' Figuren'), onclick: () => neu(r.von) }, r.buchstabe));
  }

  return el('div', { class: 'alb-kopf' },
    el('div', { class: 'alb-kopfzeile' },
      el('div', { class: 'alb-suche' }, el('span', { class: 'alb-lupe', html: ik('suche') }), suchfeld),
      el('div', { class: 'alb-kopfrechts' },
        el('button', { class: 'alb-neuknopf', title: 'Eine neue Figur anlegen (n)', onclick: () => albumNeueFigur((id) => { _alb.suche = ''; const f = albumFiguren(); neu(Math.max(0, f.findIndex((x) => x.id === id))); }) }, '+ Figur'),
        el('button', { class: 'alb-zuknopf', title: 'Das Album zuklappen', onclick: () => schliessen() }, '×'))),
    register.children.length ? register : null,
    _alb.suche.trim() ? el('div', { class: 'alb-suchhinweis' }, liste.length === 1 ? 'eine Figur passt' : liste.length + ' Figuren passen') : null);
}

/* ----- Der Fuß: blättern und wissen, wo man ist ----- */
function albumFuss(liste, neu) {
  const anzahl = liste.length + 1;
  const figur = liste[_alb.i] || null;
  return el('div', { class: 'alb-fuss' },
    el('button', { class: 'alb-blaetter links', title: 'Zurückblättern', disabled: _alb.i <= 0 ? '' : null, onclick: () => albumBlaettern(-1, document.querySelector('.alb-buehne'), neu) }, '‹'),
    el('div', { class: 'alb-seitenzahl' },
      figur ? el('b', {}, figur.name || 'ohne Namen') : el('b', { class: 'leer' }, 'leere Doppelseite'),
      el('small', {}, (_alb.i + 1) + ' von ' + anzahl)),
    el('button', { class: 'alb-blaetter rechts', title: 'Weiterblättern', disabled: _alb.i >= anzahl - 1 ? '' : null, onclick: () => albumBlaettern(1, document.querySelector('.alb-buehne'), neu) }, '›'));
}

/* ----- Das Blättern: ein Blatt dreht sich um den Falz ----- */
function albumBlaettern(richtung, buehne, neu) {
  if (!buehne || _alb.dreht) return;
  const liste = albumSichtbare();
  const anzahl = liste.length + 1;
  const ziel = _alb.i + richtung;
  if (ziel < 0 || ziel > anzahl - 1) return;

  const block = buehne.querySelector('.alb-block');
  const stillsteht = (typeof document !== 'undefined' && document.hidden) ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!block || stillsteht) { neu(ziel); return; }

  const alt = liste[_alb.i] || null, neuF = liste[ziel] || null;
  /* Vorder- und Rückseite des Blattes, das sich dreht. */
  const vorn = richtung > 0 ? albumSeite(alt, 'rechts', neu, true) : albumSeite(alt, 'links', neu, true);
  const hinten = richtung > 0 ? albumSeite(neuF, 'links', neu, true) : albumSeite(neuF, 'rechts', neu, true);
  const blatt = el('div', { class: 'alb-blatt ' + (richtung > 0 ? 'vor' : 'zurueck') },
    el('div', { class: 'alb-blattseite vorn' }, vorn),
    el('div', { class: 'alb-blattseite hinten' }, hinten),
    el('i', { class: 'alb-blattschatten' }));
  block.append(blatt);
  _alb.dreht = true;
  /* Erst wenn das Blatt oben liegt, wird darunter schon die neue Seite gebaut. */
  setTimeout(() => {
    const untenLinks = block.querySelector('.alb-seite.links'), untenRechts = block.querySelector('.alb-seite.rechts');
    if (richtung > 0 && untenRechts) untenRechts.replaceWith(albumSeite(neuF, 'rechts', neu));
    if (richtung < 0 && untenLinks) untenLinks.replaceWith(albumSeite(neuF, 'links', neu));
  }, 30);
  requestAnimationFrame(() => blatt.classList.add('laeuft'));
  /* Kein requestAnimationFrame zum Aufräumen: der steht bei verstecktem
     Fenster still, und dann bliebe das Blatt für immer quer im Buch liegen. */
  setTimeout(() => { _alb.dreht = false; neu(ziel); }, 620);
}

/* ----- Eine Seite ----- */
function albumSeite(figur, welche, neu, flach) {
  const seite = el('div', { class: 'alb-seite ' + welche });
  if (!figur) {
    /* Die leere Doppelseite: links das Angebot, rechts nur Papier. */
    if (welche === 'links') {
      seite.append(el('button', { class: 'alb-neuefigur', onclick: () => albumNeueFigur((id) => { const f = albumFiguren(); if (neu) neu(Math.max(0, f.findIndex((x) => x.id === id))); }) },
        el('span', { class: 'alb-nf-kreuz' }, '+'),
        el('span', { class: 'alb-nf-text' }, el('b', {}, 'Eine Figur anlegen'), el('small', {}, 'Hier wohnt noch niemand.'))));
      seite.append(el('div', { class: 'alb-leerhinweis' }, 'Trag ein, was du weißt. Alles andere darf leer bleiben — es steht dann einfach nicht auf der Seite, und man sieht ihm nicht an, dass es fehlt.'));
    }
    return seite;
  }
  const farbe = albumFarbe(figur);
  seite.style.setProperty('--figurfarbe', farbe);

  if (welche === 'links') {
    seite.append(albumSeitenkopf(figur, neu));
    const stuecke = albumStuecke(figur).filter((s) => ALB_LINKS.includes(s.feld.gruppe));
    seite.append(albumStueckFeld(figur, stuecke, flach));
  } else {
    const stuecke = albumStuecke(figur).filter((s) => ALB_RECHTS.includes(s.feld.gruppe));
    seite.append(albumStueckFeld(figur, stuecke, flach));
    if (albumZettel(figur).length) seite.append(albumZettelBrett(figur));
    seite.append(el('i', { class: 'alb-seitenband', style: 'background:' + farbe }));
  }
  return seite;
}

/* Der Kopf der linken Seite: Name, Lebensdaten, Alter — und der Weg zum Ändern. */
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

/* Alle gefüllten Stücke einer Seite, jedes in seiner festen Form. */
function albumStueckFeld(figur, stuecke, flach) {
  const feld = el('div', { class: 'alb-stuecke' });
  if (!stuecke.length) return feld;
  /* Etiketten sammeln sich in einer Reihe — sonst zerfasert der Kopf. */
  const etiketten = stuecke.filter((s) => s.feld.form === 'etikett');
  const rest = stuecke.filter((s) => s.feld.form !== 'etikett');
  if (etiketten.length) {
    const reihe = el('div', { class: 'alb-etikettreihe' });
    for (const s of etiketten) reihe.append(albumStueck(figur, s, flach));
    feld.append(reihe);
  }
  for (const s of rest) feld.append(albumStueck(figur, s, flach));
  return feld;
}

function albumStueck(figur, s, flach) {
  const { feld, wert } = s;
  const name = albumBeschriftung(feld.name, figur.name);
  const dreh = flach ? 0 : albumDreh(figur.id, feld.id, feld.form === 'zettel' ? 2.6 : 1.4);
  const stil = 'transform: rotate(' + dreh + 'deg)';
  const liste = Array.isArray(wert) ? wert : [wert];

  if (feld.form === 'etikett') {
    return el('span', { class: 'alb-etikett', style: stil, title: name },
      el('i', {}, name), el('b', {}, liste.join(' · ')));
  }
  if (feld.form === 'spruch') {
    return el('div', { class: 'alb-sprueche' }, ...liste.map((z, i) => el('blockquote', {
      class: 'alb-spruch', style: flach ? '' : 'transform: rotate(' + albumDreh(figur.id, feld.id + i, 1.1) + 'deg)'
    }, el('span', { class: 'alb-anfuehrung' }, '„'), z, el('i', {}, name))));
  }
  if (feld.form === 'wolke') {
    return el('div', { class: 'alb-wolke', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('div', { class: 'alb-wolkeworte' }, ...liste.map((w, i) => el('span', {
        class: 'alb-wort', style: flach ? '' : 'transform: rotate(' + albumDreh(figur.id, feld.id + ':' + i, 2.2) + 'deg)'
      }, w))));
  }
  if (feld.form === 'band') {
    return el('div', { class: 'alb-band', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('b', {}, liste.join('  ·  ')));
  }
  if (feld.form === 'liste') {
    return el('div', { class: 'alb-liste', style: stil },
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
    return el('div', { class: 'alb-notiz', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      el('div', { class: 'alb-notiztext' }, liste.join('\n')));
  }
  if (feld.form === 'karte') {
    return el('div', { class: 'alb-karte', style: stil },
      el('span', { class: 'alb-feldname' }, name),
      ...liste.map((z) => el('p', {}, z)));
  }
  /* zeile: mit der Hand auf die Seite geschrieben */
  return el('div', { class: 'alb-zeile', style: stil },
    el('span', { class: 'alb-feldname' }, name),
    el('span', { class: 'alb-zeiletext' }, liste.join(' · ')));
}

/* Die Klebezettel: geordnet an einer Stelle, nicht wild über die Seite. */
function albumZettelBrett(figur) {
  const brett = el('div', { class: 'alb-zettelbrett' });
  albumZettel(figur).forEach((z, i) => {
    brett.append(el('div', {
      class: 'alb-zettel ton-' + (z.ton || 'butter'),
      style: 'transform: rotate(' + albumDreh(figur.id, 'zettel' + i, 3.2) + 'deg)'
    }, el('i', { class: 'alb-klebstreifen' }), el('span', {}, z.text)));
  });
  return brett;
}

/* Von einem Verweis zur Figur springen — auch quer durch die Suche. */
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
