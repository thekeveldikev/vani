/* ===================================================================
   66c — DIE STERNWARTE: DAS WERKZEUG
   -------------------------------------------------------------------
   Der Himmel liegt da; hier wird er bedient. Das Wichtigste ist der
   Vorgang, um den es geht: einen Stern antippen, den nächsten antippen,
   und zwischen beiden entsteht eine Linie. So macht man ein Sternbild —
   und so hat es die Menschheit gemacht.
   =================================================================== */

async function sternSchreiben(doc, aenderung, was) {
  if (!doc) return false;
  schrittMerken(was || 'Am Himmel geändert', [doc]);
  const himmel = saubererHimmel(doc);
  const neu = aenderung(himmel);
  const sauber = saubererHimmel(neu || himmel);
  Object.assign(doc, sauber);
  doc.geaendert = Date.now();
  markiereAenderung(doc, false);
  D.docs.set(doc.id, doc);
  const gut = await sicherSpeichern('docs', doc);
  if (!gut) toast('Der Speicher nimmt gerade nichts an — die Änderung steht noch auf dem Bildschirm, aber noch nicht auf der Platte.', 9000);
  return gut;
}

/* ===================== DAS FACH IM KABINETT ===================== */
function sternwarteWerkzeug(zurueck) {
  const buehne = el('div', { class: 'sh-werkzeug' });
  const zeichne = () => {
    const liste = sternhimmel();
    buehne.innerHTML = '';
    anfuegen(buehne,
      el('div', { class: 'sh-wkopf' },
        el('button', { class: 'sh-zurueck', onclick: () => { if (zurueck) zurueck(); } }, '‹ Kabinett'),
        el('div', { class: 'sh-wtitel' }, el('b', {}, 'Die Sternwarte'),
          el('small', {}, 'Der Himmel wird gerechnet. Die Sternbilder ziehst du selbst.')),
        el('button', { class: 'knopf voll', onclick: () => sternNeu((id) => { zeichne(); sternOeffnen(id); }) }, 'Einen Himmel aufspannen')),
      liste.length
        ? el('div', { class: 'sh-regal' }, ...liste.map((d, i) => sternKachel(d, i, zeichne)))
        : el('div', { class: 'sh-leer' },
          el('div', { class: 'sh-leerbild', html: sternLeerBild() }),
          el('b', {}, 'Noch steht kein Himmel offen.'),
          el('p', {}, 'Ein Sternbild entsteht nicht dadurch, dass Sterne beieinander stehen — sie stehen zufällig da. Es entsteht, weil jemand beschließt, dass zwischen diesen sieben Punkten ein Reiher ist. VANI rechnet die Punkte; das Bild bestimmst du.'),
          el('button', { class: 'knopf voll', onclick: () => sternNeu((id) => { zeichne(); sternOeffnen(id); }) }, 'Den ersten aufspannen')));
  };
  zeichne();
  return buehne;
}

function sternLeerBild() {
  let d = '';
  for (let i = 0; i < 60; i++) {
    const x = 10 + sternZufall('leer', 'x' + i) * 180;
    const y = 10 + sternZufall('leer', 'y' + i) * 100;
    const r = 0.5 + Math.pow(sternZufall('leer', 'r' + i), 3) * 2.2;
    d += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '"/>';
  }
  return '<svg viewBox="0 0 200 120" width="200" height="120" fill="currentColor">' + d +
    '<path d="M40 80 L72 44 L104 58 L138 30" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity=".55"/></svg>';
}

function sternKachel(doc, i, neu) {
  const himmel = saubererHimmel(doc);
  const w = sternWelt(himmel.welt);
  const z = sternZahlen(himmel);
  const kachel = el('button', {
    class: 'sh-kachel', style: '--n:' + Math.min(i, 20) + ';--grund:' + w.grund + ';--stern:' + w.stern + ';--linie:' + w.linie,
    onclick: () => sternOeffnen(doc.id)
  },
    el('span', { class: 'sh-vorschau', html: sternVorschau(himmel) }),
    el('span', { class: 'sh-kschild' },
      el('b', {}, himmel.titel),
      himmel.unterzeile ? el('small', {}, himmel.unterzeile) : null,
      el('i', {}, [
        sternDichte(himmel.dichte)[1],
        z.bilder ? z.bilder + (z.bilder === 1 ? ' Sternbild' : ' Sternbilder') : 'noch kein Sternbild'
      ].join('  ·  '))));
  langdruck(kachel, () => sternKachelMenue(doc, neu));
  return kachel;
}

/* Eine kleine Vorschau: ein Ausschnitt des Himmels mit seinen Linien. */
function sternVorschau(himmel) {
  const gebaut = sternHimmelBauen(himmel);
  const s = 120, f = s / STERN_GROESSE;
  let punkte = '', linien = '';
  for (const st of gebaut.sterne) {
    if (st.gr < 1.6) continue;
    punkte += '<circle cx="' + (st.x * f).toFixed(1) + '" cy="' + (st.y * f).toFixed(1) + '" r="' + Math.min(1.6, st.gr * 0.32).toFixed(2) + '"/>';
  }
  for (const b of himmel.sternbilder) {
    for (const [a, c] of b.linien) {
      const p1 = gebaut.sterne[b.sterne[a]], p2 = gebaut.sterne[b.sterne[c]];
      if (!p1 || !p2) continue;
      linien += '<path d="M' + (p1.x * f).toFixed(1) + ' ' + (p1.y * f).toFixed(1) + 'L' + (p2.x * f).toFixed(1) + ' ' + (p2.y * f).toFixed(1) + '"/>';
    }
  }
  return '<svg viewBox="0 0 ' + s + ' ' + s + '" width="100%" height="100%">' +
    '<circle cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + (s / 2 - 2) + '" fill="var(--grund)"/>' +
    '<g fill="var(--stern)">' + punkte + '</g>' +
    '<g fill="none" stroke="var(--linie)" stroke-width=".8" stroke-opacity=".85">' + linien + '</g>' +
    '<circle cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + (s / 2 - 2) + '" fill="none" stroke="var(--linie)" stroke-width=".7" stroke-opacity=".5"/></svg>';
}

function sternKachelMenue(doc, neu) {
  const himmel = saubererHimmel(doc);
  const zu = zeigeDeck(el('div', { class: 'modal' },
    el('div', { class: 'kartenkopf' }, himmel.titel.toUpperCase()),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf voll', onclick: () => { zu(); sternOeffnen(doc.id); } }, 'Aufschlagen'),
      el('button', { class: 'knopf zart', onclick: () => { zu(); sternEinrichten(doc, neu); } }, 'Der Himmel'),
      el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (!(await frage('„' + himmel.titel + '“ einrollen?', { ja: 'Einrollen' }))) return;
        await loesche(doc.id);
        zu(); if (neu) neu();
      } }, 'Einrollen'))));
}

/* ===================== EINEN NEUEN HIMMEL ===================== */
function sternNeu(danach) {
  const saat = sternNeueSaat();
  sternEinrichten(null, danach, {
    titel: '', unterzeile: '', saat, welt: 'tinte', dichte: 'voll',
    tag: 1, milchstrasse: true, ekliptik: true, horizont: true, sternbilder: []
  });
}

/* ===================== DAS BLATT AUFSCHLAGEN ===================== */
function sternOeffnen(id) {
  const doc = D.docs.get(id);
  if (!doc || doc.typ !== 'sternhimmel' || doc.geloescht) { toast('Der Himmel ist nicht mehr da.'); return; }
  _st.id = id;
  _st.imBlick = '';
  _st.zieht = null;
  _st.werkzeug = 'schauen';
  if (!_st.zoom || !Number.isFinite(_st.zoom)) _st.zoom = 1;

  const flaeche = el('div', { class: 'sh-flaeche' });
  const leiste = el('div', { class: 'sh-leiste' });
  const rahmen = el('div', { class: 'sh-rahmen' }, flaeche);
  const tafel = el('div', { class: 'sh-tafel' }, leiste, rahmen);
  const huelle = el('div', { class: 'sh-huelle' }, tafel);
  const zu = zeigeDeck(huelle, () => { document.removeEventListener('keydown', taste); _st.offen = false; });
  _st.offen = true;

  const neu = () => sternZeichne(tafel, flaeche, rahmen, neu, zu);

  /* Wird irgendwo etwas zurückgenommen, zeichnet der offene Himmel neu. */
  const beiZug = () => { if (tafel.isConnected) { flaeche.dataset.sig = ''; neu(); } else document.removeEventListener('vani-zug', beiZug); };
  document.addEventListener('vani-zug', beiZug);

  /* Mit zwei Fingern heran und wieder weg — wie bei Karte und Teppich. */
  zweiFingerZoom(flaeche, {
    min: 0.3, max: 4,
    hole: () => _st.zoom || 1,
    bild: () => flaeche.querySelector('.sh-blatt'),
    zeige: (z) => {
      const svg = flaeche.querySelector('.sh-blatt');
      if (!svg) return;
      svg.setAttribute('width', Math.round(STERN_GROESSE * z));
      svg.setAttribute('height', Math.round(STERN_GROESSE * z));
    },
    fertig: (z) => { _st.zoom = Math.round(z * 100) / 100; neu(); }
  });

  const taste = (ev) => {
    if (!tafel.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 2) return;
    if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); sternZoom(0.2, flaeche, neu); }
    else if (ev.key === '-') { ev.preventDefault(); sternZoom(-0.2, flaeche, neu); }
    else if (ev.key === '0') { ev.preventDefault(); _st.zoom = 1; neu(); }
    else if (ev.key === '1') { ev.preventDefault(); _st.werkzeug = 'schauen'; _st.zieht = null; neu(); }
    else if (ev.key === '2') { ev.preventDefault(); _st.werkzeug = 'ziehen'; neu(); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); _st.zeigeNamen = !_st.zeigeNamen; neu(); }
    else if (ev.key === 'f' || ev.key === 'F') {
      ev.preventDefault();
      _st.rohrAn = !_st.rohrAn;
      if (_st.rohrAn && !_st.rohr) _st.rohr = { x: STERN_MITTE, y: STERN_MITTE - STERN_R * 0.3 };
      neu();
    }
    else if (ev.key === 'Escape' && _st.zieht) { ev.preventDefault(); _st.zieht = null; neu(); }
  };
  document.addEventListener('keydown', taste);
  neu();
  setTimeout(() => sternEinpassen(flaeche, neu), 60);
}

function sternZoom(delta, flaeche, neu) {
  const alt = _st.zoom;
  _st.zoom = Math.max(0.3, Math.min(4, Math.round((alt + delta) * 20) / 20));
  if (_st.zoom === alt) return;
  const mx = (flaeche.scrollLeft + flaeche.clientWidth / 2) / (STERN_GROESSE * alt);
  const my = (flaeche.scrollTop + flaeche.clientHeight / 2) / (STERN_GROESSE * alt);
  neu();
  flaeche.scrollLeft = mx * STERN_GROESSE * _st.zoom - flaeche.clientWidth / 2;
  flaeche.scrollTop = my * STERN_GROESSE * _st.zoom - flaeche.clientHeight / 2;
}

function sternEinpassen(flaeche, neu) {
  if (!flaeche || !flaeche.clientWidth) return;
  const passt = Math.min(flaeche.clientWidth, flaeche.clientHeight) / STERN_GROESSE;
  _st.zoom = Math.max(0.3, Math.min(4, Math.round(passt * 100) / 100));
  neu();
  flaeche.scrollLeft = (flaeche.scrollWidth - flaeche.clientWidth) / 2;
  flaeche.scrollTop = (flaeche.scrollHeight - flaeche.clientHeight) / 2;
}

/* ===================== ZEICHNEN ===================== */
function sternZeichne(tafel, flaeche, rahmen, neu, schliessen) {
  const doc = D.docs.get(_st.id);
  if (!doc) { if (schliessen) schliessen(); return; }
  const himmel = saubererHimmel(doc);
  const w = sternWelt(himmel.welt);

  for (const [k, v] of [['--shgrund', w.grund], ['--shstern', w.stern], ['--shlinie', w.linie],
    ['--shschrift', w.schrift], ['--shrand', w.rand], ['--shmilch', w.milch]]) {
    tafel.style.setProperty(k, v);
    flaeche.style.setProperty(k, v);
  }

  const leiste = tafel.querySelector('.sh-leiste');
  leiste.innerHTML = '';
  anfuegen(leiste, ...sternLeisteInhalt(doc, himmel, flaeche, neu, schliessen));

  /* Neu gerechnet wird nur, wenn sich der Himmel selbst ändert. */
  const signatur = _st.id + '|' + himmel.saat + '|' + himmel.dichte + '|' + himmel.welt + '|' +
    himmel.tag + '|' + himmel.milchstrasse + '|' + himmel.ekliptik + '|' +
    JSON.stringify(himmel.sternbilder) + '|' + himmel.titel + '|' + himmel.unterzeile +
    '|' + _st.zeigeNamen + '|' + _st.zeigeMilch + '|' + _st.zeigeGitter + '|' + _st.zeigeSagen +
    '|' + _st.imBlick +
    /* Der laufende Zug gehoert in die Signatur: er wird ins Blatt gezeichnet,
       und ohne ihn taete sich beim Tippen nichts. */
    '|' + (_st.zieht ? JSON.stringify(_st.zieht) : '');
  /* Die Stelle des Okulars steht mit Absicht NICHT in der Signatur: sie
     ändert sich bei jedem Schub, und der ganze Himmel dafür neu gebaut
     hätte jede Bewegung zäh gemacht. Das Okular zieht allein um. */
  let innen = flaeche.querySelector('.sh-innen');
  let svg = innen ? innen.querySelector('svg') : null;

  if (!innen || flaeche.dataset.sig !== signatur) {
    const scrollL = flaeche.scrollLeft, scrollT = flaeche.scrollTop;
    const gebaut = sternHimmelBauen(himmel);
    flaeche._gebaut = gebaut;
    flaeche.innerHTML = '';
    flaeche.dataset.sig = signatur;
    svg = sternSVG(himmel, gebaut, neu);
    innen = el('div', { class: 'sh-innen' }, el('div', { class: 'sh-blattkasten' }, svg));
    flaeche.append(innen);
    flaeche.scrollLeft = scrollL; flaeche.scrollTop = scrollT;
    sternBedienungAnhaengen(svg, flaeche, doc, neu);
  }
  if (svg) {
    svg.setAttribute('width', Math.round(STERN_GROESSE * _st.zoom));
    svg.setAttribute('height', Math.round(STERN_GROESSE * _st.zoom));
    flaeche._rohrAktualisieren = () => {
      if (!svg.isConnected) return;
      sternRohrAktualisieren(tafel, flaeche, rahmen, himmel, w, svg, neu);
    };
    flaeche._rohrAktualisieren();
  }

  /* Die Karte des Sternbilds im Blick. */
  const alte = tafel.querySelector('.sh-bildkarte');
  if (alte) alte.remove();
  if (_st.imBlick) {
    const karte = sternBildkarte(doc, himmel, _st.imBlick, neu);
    if (karte) rahmen.append(karte);
  }
  /* Der Hinweis beim Ziehen. */
  const alterHinweis = tafel.querySelector('.sh-zughinweis');
  if (alterHinweis) alterHinweis.remove();
  if (_st.werkzeug === 'ziehen') rahmen.append(sternZughinweis(doc, neu));

}

/* Das Fernrohr ist die einzige Schicht, die beim Fuehren wechseln muss.
   Toolbar, Himmel, Karten und Hinweise bleiben unangetastet. Das ist auf
   einem 120-Hz-iPad der Unterschied zwischen einem Werkzeug, das am Finger
   klebt, und einem, das sichtbar hinterher springt. */
function sternRohrAktualisieren(tafel, flaeche, rahmen, himmel, w, svg, neu) {
  const altesRohr = svg.querySelector('.sh-fernrohr');
  if (altesRohr) altesRohr.remove();

  const feldKey = himmel.saat + '|' + himmel.dichte + '|' + himmel.tag;
  if (flaeche._rohrfeldKey !== feldKey) {
    flaeche._rohrfeldKey = feldKey;
    flaeche._rohrfeld = sternRohrfeld(himmel).map((s) => {
      const stelle = sternStelle(s, himmel.tag);
      return Object.assign({}, s, { x: stelle[0], y: stelle[1] });
    });
  }
  if (_st.rohrAn && flaeche._gebaut) {
    svg.append(sternFernrohrZeichnen(himmel, flaeche._gebaut, w, 'sh-alles', flaeche._rohrfeld));
  }

  let befund = tafel.querySelector('.sh-rohrbefund');
  if (!_st.rohrAn || !_st.rohr || !flaeche._gebaut) {
    if (befund) befund.remove();
    return;
  }
  if (!befund) {
    befund = el('div', { class: 'sh-rohrbefund' },
      el('b', {}), el('span', {}), el('small', {}),
      el('button', { class: 'sh-bkzu', title: 'Fernrohr abnehmen', onclick: () => { _st.rohrAn = false; neu(); } }, '×'));
    rahmen.append(befund);
  }
  const b = sternRohrBefund(himmel, flaeche._gebaut, _st.rohr.x, _st.rohr.y, flaeche._rohrfeld);
  const teile = befund.children;
  teile[0].textContent = b.sterne + (b.sterne === 1 ? ' Stern' : ' Sterne') + ' im Glas';
  teile[1].textContent = b.hoehe + ', ' + b.richtung;
  teile[2].textContent = b.nah.length ? 'Dabei: ' + b.nah.join(', ') : '';
  teile[2].hidden = !b.nah.length;
}

/* ===================== DIE BEDIENUNG AM BLATT ===================== */
function sternBedienungAnhaengen(svg, flaeche, doc, neu) {
  /* --- Das Fernrohr führen ---
     Es folgt dem Finger, solange man zieht. Ein Tipp setzt es dorthin.
     Beides ohne Neurechnung: das Okular ist ein <use> auf den Himmel, und
     verschoben wird nur seine Stelle. */
  let fuehrt = 0, rohrRaf = 0;
  const finger = new Set();
  const zeichneRohrVoll = () => {
    if (rohrRaf) return;
    rohrRaf = requestAnimationFrame(() => {
      rohrRaf = 0;
      if (flaeche._rohrAktualisieren) flaeche._rohrAktualisieren();
    });
  };
  /* Während der Finger fährt, verschiebt die Grafikkarte nur die bestehende
     Okulargruppe. Sterne, Clip und Befund werden erst beim Loslassen einmal
     neu gerechnet. So bleibt das Rohr auch auf 120-Hz-iPads am Finger. */
  const verschiebeRohr = () => {
    const rohr = svg.querySelector('.sh-fernrohr');
    if (!rohr || !_st.rohr) { zeichneRohrVoll(); return; }
    const x0 = Number(rohr.getAttribute('data-rohr-x'));
    const y0 = Number(rohr.getAttribute('data-rohr-y'));
    if (!Number.isFinite(x0) || !Number.isFinite(y0)) { zeichneRohrVoll(); return; }
    rohr.setAttribute('transform', 'translate(' + stz(_st.rohr.x - x0) + ' ' + stz(_st.rohr.y - y0) + ')');
  };
  const setzeRohr = (ev, voll = false) => {
    const p = sternPunktAus(svg, ev);
    if (!p) return;
    /* Innerhalb der Scheibe bleiben — ein Okular über dem Papierrand
       zeigt nichts. */
    const dx = p.x - STERN_MITTE, dy = p.y - STERN_MITTE;
    const d = Math.hypot(dx, dy);
    const grenze = STERN_R - 20;
    if (d > grenze) {
      _st.rohr = { x: STERN_MITTE + dx / d * grenze, y: STERN_MITTE + dy / d * grenze };
    } else {
      _st.rohr = { x: p.x, y: p.y };
    }
    if (voll) zeichneRohrVoll(); else verschiebeRohr();
  };
  svg.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType !== 'mouse') finger.add(ev.pointerId);
    if (!_st.rohrAn) return;
    if (ev.button != null && ev.button !== 0) return;
    /* Nur die Fassung selbst ist ein Griff. Auf dem restlichen Himmel darf
       ein Finger wieder ganz normal rollen. Ein kurzer Tipp daneben setzt
       das Glas spaeter ueber den click-Handler um. */
    const aufRohr = ev.target.closest && ev.target.closest('.sh-fernrohr');
    if (!aufRohr || finger.size > 1) {
      if (finger.size > 1 && fuehrt) {
        try { svg.releasePointerCapture(fuehrt); } catch (e) {}
        fuehrt = 0;
        flaeche.classList.remove('rohr-bewegt');
      }
      return;
    }
    fuehrt = ev.pointerId;
    flaeche.classList.add('rohr-bewegt');
    try { svg.setPointerCapture(ev.pointerId); } catch (e) {}
    setzeRohr(ev);
  });
  svg.addEventListener('pointermove', (ev) => {
    if (fuehrt !== ev.pointerId || !_st.rohrAn || finger.size > 1) return;
    ev.preventDefault();
    setzeRohr(ev);
  });
  const los = (ev) => {
    finger.delete(ev.pointerId);
    if (fuehrt !== ev.pointerId) return;
    fuehrt = 0;
    flaeche.classList.remove('rohr-bewegt');
    try { svg.releasePointerCapture(ev.pointerId); } catch (e) {}
    zeichneRohrVoll();
  };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('pointerleave', (ev) => { if (fuehrt !== ev.pointerId) finger.delete(ev.pointerId); });

  svg.addEventListener('click', async (ev) => {
    /* Ein Tipp neben das Okular setzt es einmal um. Scrollen erzeugt in
       Safari keinen click und bleibt deshalb ungestoert. */
    if (_st.rohrAn) {
      if (!(ev.target.closest && ev.target.closest('.sh-fernrohr'))) setzeRohr(ev, true);
      return;
    }
    const aufBild = ev.target.closest && ev.target.closest('.sh-bild');
    const p = sternPunktAus(svg, ev);
    if (!p) return;

    if (_st.werkzeug === 'ziehen') {
      const gebaut = flaeche._gebaut;
      const stern = sternBei(gebaut, p.x, p.y, 30 / Math.max(0.4, _st.zoom));
      if (!stern) { toast('Daneben. Tipp einen Stern an.', 2600); return; }
      await sternZugSchritt(doc, stern.n, neu);
      return;
    }
    /* Schauen: ein Sternbild in den Blick nehmen. */
    if (aufBild) {
      const id = aufBild.getAttribute('data-bild');
      _st.imBlick = _st.imBlick === id ? '' : id;
      neu();
      return;
    }
    if (_st.imBlick) { _st.imBlick = ''; neu(); }
  });
}

/* Ein Schritt beim Ziehen: der erste Stern eröffnet ein Sternbild, jeder
   weitere hängt eine Linie daran. Denselben Stern noch einmal zu tippen
   schließt es ab. */
async function sternZugSchritt(doc, sternNr, neu) {
  if (!_st.zieht) {
    _st.zieht = { sterne: [sternNr], linien: [] };
    toast('Angefangen. Tipp den nächsten Stern — noch einmal denselben, und es ist fertig.', 5200);
    neu();
    return;
  }
  const z = _st.zieht;
  const letzter = z.sterne[z.sterne.length - 1];
  if (sternNr === letzter) {
    await sternZugFertig(doc, neu);
    return;
  }
  /* Ein Stern, den es schon gibt? Dann nur eine Linie dorthin — so lassen
     sich Ringe und Gabeln ziehen, nicht nur Ketten. */
  let stelle = z.sterne.indexOf(sternNr);
  if (stelle < 0) { z.sterne.push(sternNr); stelle = z.sterne.length - 1; }
  const vonStelle = z.sterne.indexOf(letzter);
  if (!z.linien.some((l) => (l[0] === vonStelle && l[1] === stelle) || (l[0] === stelle && l[1] === vonStelle))) {
    z.linien.push([vonStelle, stelle]);
  }
  neu();
}

async function sternZugFertig(doc, neu) {
  const z = _st.zieht;
  _st.zieht = null;
  if (!z || !z.sterne.length) { neu(); return; }
  const himmel = saubererHimmel(doc);
  const name = sternNeuerName(himmel);
  const id = uid();
  await sternSchreiben(doc, (h) => {
    h.sternbilder = h.sternbilder.concat([{ id, name, sage: '', zeichen: 'keins', sterne: z.sterne, linien: z.linien }]);
    return h;
  }, 'Ein Sternbild gezogen');
  _st.imBlick = id;
  _st.werkzeug = 'schauen';
  if (neu) neu();
  toastMitAktion('„' + name + '“ steht am Himmel.', 'Benennen', () => {
    sternBildBearbeiten(D.docs.get(_st.id), id, neu);
  }, 7000);
}

function sternZughinweis(doc, neu) {
  const z = _st.zieht;
  const kasten = el('div', { class: 'sh-zughinweis' });
  if (!z) {
    kasten.append(el('span', {}, 'Tipp einen Stern an. Dann den nächsten — dazwischen entsteht eine Linie.'));
  } else {
    kasten.append(
      el('b', {}, z.sterne.length + (z.sterne.length === 1 ? ' Stern' : ' Sterne')),
      el('span', {}, z.linien.length ? z.linien.length + (z.linien.length === 1 ? ' Linie' : ' Linien') : 'noch keine Linie'),
      el('button', { class: 'knopf voll klein', onclick: () => sternZugFertig(doc, neu) }, 'Fertig'),
      el('button', { class: 'knopf zart klein', onclick: () => { _st.zieht = null; neu(); } }, 'Verwerfen'));
  }
  return kasten;
}

/* ===================== DIE LEISTE ===================== */
function sternLeisteInhalt(doc, himmel, flaeche, neu, schliessen) {
  const z = sternZahlen(himmel);
  const wz = (id, name, hilfe) => el('button', {
    class: 'sh-wz' + (_st.werkzeug === id ? ' an' : ''), title: hilfe,
    onclick: () => { _st.werkzeug = id; if (id !== 'ziehen') _st.zieht = null; neu(); }
  }, name);

  /* Der Tageslauf: der Himmel dreht sich einmal im Jahr. Ein Schieber
     dafür ist kein Zierrat — er beantwortet die Frage, was zur
     Wintersonnenwende oben steht. */
  const tag = el('input', { type: 'range', min: '1', max: '365', step: '1', value: String(himmel.tag), class: 'sh-tagregler' });
  const tagText = el('small', { class: 'sh-tagtext' }, sternDatumText(himmel.tag));
  tag.addEventListener('input', () => { tagText.textContent = sternDatumText(Number(tag.value)); });
  tag.addEventListener('change', entprellt(async () => {
    await sternSchreiben(doc, (h) => { h.tag = Number(tag.value); return h; }, 'Der Himmel gedreht');
    neu();
  }, 120, true));

  return [
    el('div', { class: 'sh-lzeile' },
      el('div', { class: 'sh-ltitel' },
        el('b', {}, himmel.titel),
        el('small', {}, [
          z.bilder ? z.bilder + (z.bilder === 1 ? ' Sternbild' : ' Sternbilder') : 'noch kein Sternbild',
          sternDichte(himmel.dichte)[1]
        ].join('  ·  '))),
      el('div', { class: 'sh-ltag' }, tag, tagText),
      el('div', { class: 'sh-lknoepfe' },
        el('div', { class: 'sh-werkzeuge' },
          wz('schauen', 'Schauen', 'Schauen und schieben (1)'),
          wz('ziehen', 'Sternbild ziehen', 'Sterne verbinden — tipp einen an, dann den nächsten (2)')),
        el('button', { class: 'sh-wk', title: 'Kleiner (−)', onclick: () => sternZoom(-0.2, flaeche, neu) }, '−'),
        el('button', { class: 'sh-wk zahl', title: 'Normalgröße (0)', onclick: () => { _st.zoom = 1; neu(); } }, Math.round(_st.zoom * 100) + '%'),
        el('button', { class: 'sh-wk', title: 'Größer (+)', onclick: () => sternZoom(0.2, flaeche, neu) }, '+'),
        el('button', { class: 'sh-wk', title: 'Ganz einpassen', onclick: () => sternEinpassen(flaeche, neu) }, '⤢'),
        el('button', {
          class: 'sh-werkzeugknopf' + (_st.rohrAn ? ' an' : ''),
          title: 'Das Fernrohr auflegen und über den Himmel führen (f)',
          onclick: () => {
            _st.rohrAn = !_st.rohrAn;
            if (_st.rohrAn && !_st.rohr) _st.rohr = { x: STERN_MITTE, y: STERN_MITTE - STERN_R * 0.3 };
            if (_st.rohrAn) { _st.werkzeug = 'schauen'; _st.zieht = null; }
            neu();
          }
        }, 'Fernrohr'),
        el('button', { class: 'sh-werkzeugknopf' + (_st.zeigeNamen ? ' an' : ''), title: 'Namen zeigen (n)', onclick: () => { _st.zeigeNamen = !_st.zeigeNamen; neu(); } }, 'Namen'),
        zugKnopf(neu),
        el('button', { class: 'sh-werkzeugknopf', title: 'Alle Sternbilder', onclick: () => sternVerzeichnis(doc, neu) }, 'Verzeichnis'),
        el('button', { class: 'sh-werkzeugknopf', title: 'Aussehen, Dichte, Saat', onclick: () => sternEinrichten(doc, neu) }, 'Der Himmel'),
        el('button', { class: 'sh-zuknopf', title: 'Den Himmel schließen', onclick: () => schliessen() }, '×')))
  ];
}

/* ===================== DIE KARTE EINES STERNBILDS ===================== */
function sternBildkarte(doc, himmel, bildId, neu) {
  const bild = himmel.sternbilder.find((b) => b.id === bildId);
  if (!bild) return null;
  const gebaut = sternHimmelBauen(himmel);
  const m = sternbildMitte(bild, gebaut.sterne);
  return el('div', { class: 'sh-bildkarte' },
    el('div', { class: 'sh-bkkopf' },
      el('b', {}, bild.name || 'Ohne Namen'),
      el('button', { class: 'sh-bkzu', title: 'Loslassen', onclick: () => { _st.imBlick = ''; neu(); } }, '×')),
    m ? el('div', { class: 'sh-bkstand' },
      'Heute steht es ' + sternHoehe(m[0], m[1]) + ', ' + sternRichtung(m[0], m[1]) + '.') : null,
    el('div', { class: 'sh-bkzahlen' },
      bild.sterne.length + (bild.sterne.length === 1 ? ' Stern' : ' Sterne') + '  ·  ' +
      bild.linien.length + (bild.linien.length === 1 ? ' Linie' : ' Linien')),
    bild.sage ? el('p', { class: 'sh-bksage' }, bild.sage) : null,
    el('div', { class: 'reihe sh-bkfuss' },
      el('button', { class: 'knopf zart klein', onclick: () => sternBildBearbeiten(doc, bildId, neu) }, 'Ändern'),
      el('button', { class: 'knopf zart klein', title: 'An welchem Tag steht es am höchsten?', onclick: () => sternHoechststand(himmel, bildId) }, 'Wann am höchsten?')));
}

/* An welchem Tag im Jahr steht dieses Sternbild am höchsten?
   Durchgerechnet, nicht geschätzt: 365 Stellungen, die beste gewinnt. */
function sternHoechststand(himmel, bildId) {
  const bild = himmel.sternbilder.find((b) => b.id === bildId);
  if (!bild) return;
  const feld = sternFeld(himmel);
  const drin = bild.sterne.map((n) => feld[n]).filter(Boolean);
  if (!drin.length) return;
  let besterTag = 1, hoch = Infinity;
  for (let t = 1; t <= 365; t++) {
    let sx = 0, sy = 0;
    for (const s of drin) { const [x, y] = sternStelle(s, t); sx += x; sy += y; }
    sx /= drin.length; sy /= drin.length;
    const d = Math.hypot(sx - STERN_MITTE, sy - STERN_MITTE);
    if (d < hoch) { hoch = d; besterTag = t; }
  }
  const zu = zeigeDeck(el('div', { class: 'modal' },
    el('div', { class: 'kartenkopf' }, (bild.name || 'DAS STERNBILD').toUpperCase()),
    el('p', { class: 'sh-hochsatz' }, 'Am höchsten steht es am ', el('b', {}, sternDatumText(besterTag)), '.'),
    el('small', { class: 'ktg-hilfe' }, 'Wer an diesem Tag geboren wird, kommt unter diesem Zeichen zur Welt — wenn du es so erzählen willst.'),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut'))));
}

/* ===================== EIN STERNBILD ÄNDERN ===================== */
function sternBildBearbeiten(doc, bildId, neu) {
  const himmel = saubererHimmel(doc);
  const bild = himmel.sternbilder.find((b) => b.id === bildId);
  if (!bild) return;
  const stand = Object.assign({}, bild);

  const namensfeld = el('input', { type: 'text', class: 'sh-name', value: stand.name, maxlength: '80', placeholder: 'Wie heißt es?' });
  namensfeld.addEventListener('input', () => { stand.name = namensfeld.value; });
  const wuerfel = el('button', { class: 'knopf zart klein', title: 'Einen Namen vorschlagen', onclick: () => {
    stand.name = sternName(himmel.saat, Math.floor(Math.random() * 900));
    namensfeld.value = stand.name;
  } }, '⚄');

  const sagenfeld = el('textarea', { class: 'sh-sage', rows: '5', maxlength: '1200',
    placeholder: 'Was erzählt man sich darüber? Wer sieht es? Was bedeutet es, wenn es aufgeht?' }, stand.sage);
  sagenfeld.addEventListener('input', () => { stand.sage = sagenfeld.value; });

  const zeichenreihe = el('div', { class: 'sh-zeichenwahl' });
  const zeichenZeichnen = () => {
    zeichenreihe.innerHTML = '';
    for (const [id, name] of STERN_ZEICHEN) {
      zeichenreihe.append(el('button', {
        class: 'sh-zw' + (stand.zeichen === id ? ' an' : ''),
        onclick: () => { stand.zeichen = id; zeichenZeichnen(); }
      }, name));
    }
  };
  zeichenZeichnen();

  const zu = zeigeDeck(el('div', { class: 'modal sh-bildfenster' },
    el('div', { class: 'kartenkopf' }, 'DAS STERNBILD'),
    el('div', { class: 'sh-abschnitt' }, 'Wie es heißt'),
    el('div', { class: 'reihe eng' }, namensfeld, wuerfel),
    el('div', { class: 'sh-abschnitt' }, 'Was es zeigt'),
    zeichenreihe,
    el('div', { class: 'sh-abschnitt' }, 'Die Sage'),
    sagenfeld,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (!(await frage('„' + (bild.name || 'Dieses Sternbild') + '“ vom Himmel nehmen? Die Sterne bleiben stehen.', { ja: 'Abnehmen' }))) return;
        await sternSchreiben(doc, (h) => { h.sternbilder = h.sternbilder.filter((b) => b.id !== bildId); return h; },
          '„' + (bild.name || 'Ein Sternbild') + '“ abgenommen');
        _st.imBlick = '';
        zu(); if (neu) neu();
        toastMitAktion('Abgenommen. Die Sterne stehen noch.', 'Rückgängig', () => { schrittZurueck(); }, 7000);
      } }, 'Vom Himmel nehmen'),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: async () => {
        await sternSchreiben(doc, (h) => {
          const b = h.sternbilder.find((x) => x.id === bildId);
          if (b) { b.name = stand.name.trim(); b.sage = stand.sage.trim(); b.zeichen = stand.zeichen; }
          return h;
        }, 'Ein Sternbild benannt');
        zu(); if (neu) neu();
      } }, 'Übernehmen'))));
  setTimeout(() => namensfeld.focus(), 60);
}

/* ===================== DAS VERZEICHNIS ===================== */
function sternVerzeichnis(doc, neu) {
  let reiter = 'bilder';
  const suchfeld = el('input', { type: 'search', class: 'sh-vsuche', placeholder: 'Suchen …' });
  const inhalt = el('div', { class: 'sh-vinhalt' });
  const koepfe = el('div', { class: 'sh-vreiter' });

  const zeichne = () => {
    const h = saubererHimmel(D.docs.get(_st.id) || doc);
    const auff = sternAuffaelligkeiten(h);
    koepfe.innerHTML = '';
    for (const [id, name, zahl] of [['bilder', 'Sternbilder', h.sternbilder.length], ['auff', 'Was auffällt', auff.length]]) {
      koepfe.append(el('button', { class: 'sh-vr' + (reiter === id ? ' an' : ''), onclick: () => { reiter = id; zeichne(); } },
        name, zahl ? el('i', {}, String(zahl)) : null));
    }
    inhalt.innerHTML = '';
    const q = suchfeld.value.trim();
    if (reiter === 'bilder') {
      const liste = sternSuche(h, q).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'));
      if (!liste.length) inhalt.append(el('div', { class: 'leer klein' }, q ? 'Nichts passt dazu.' : 'Noch ist kein Sternbild gezogen.'));
      const gebaut = sternHimmelBauen(h);
      for (const b of liste) {
        const m = sternbildMitte(b, gebaut.sterne);
        inhalt.append(el('button', {
          class: 'sh-vzeile',
          onclick: () => { zu(); _st.imBlick = b.id; if (neu) neu(); }
        },
          el('b', {}, b.name || 'Ohne Namen'),
          el('span', {}, [b.sterne.length + ' Sterne', m ? sternHoehe(m[0], m[1]) : ''].filter(Boolean).join('  ·  ')),
          b.sage ? el('small', {}, b.sage.length > 70 ? b.sage.slice(0, 68) + '…' : b.sage) : null));
      }
    } else {
      if (!auff.length) inhalt.append(el('div', { class: 'leer klein' }, 'Nichts fällt auf.'));
      for (const a of auff) {
        inhalt.append(el('button', {
          class: 'sh-vzeile auff',
          onclick: () => { if (a.wer) { zu(); _st.imBlick = a.wer; if (neu) neu(); } }
        }, el('b', {}, a.text)));
      }
    }
  };
  suchfeld.addEventListener('input', entprellt(zeichne, 180, true));
  zeichne();

  const zu = zeigeDeck(el('div', { class: 'modal sh-verzeichnis' },
    el('div', { class: 'kartenkopf' }, 'DAS VERZEICHNIS'),
    koepfe, suchfeld, inhalt,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Zurück zum Himmel'))));
}

/* ===================== DEN HIMMEL EINRICHTEN ===================== */
function sternEinrichten(doc, danach, vorgabe) {
  const frisch = !doc;
  const stand = Object.assign({}, vorgabe || saubererHimmel(doc));

  const vorschau = el('div', { class: 'sh-gvorschau' });
  const zeigen = () => {
    const h = saubererHimmel(stand);
    const w = sternWelt(h.welt);
    vorschau.style.setProperty('--grund', w.grund);
    vorschau.style.setProperty('--stern', w.stern);
    vorschau.style.setProperty('--linie', w.linie);
    vorschau.innerHTML = sternVorschau(h);
  };

  const namensfeld = el('input', { type: 'text', class: 'sh-gname', value: stand.titel, maxlength: '90', placeholder: 'Wie heißt dieser Himmel?' });
  namensfeld.addEventListener('input', () => { stand.titel = namensfeld.value; });
  const unterfeld = el('input', { type: 'text', class: 'sh-gunter', value: stand.unterzeile, maxlength: '120', placeholder: 'Eine Zeile darunter — über welchem Land steht er?' });
  unterfeld.addEventListener('input', () => { stand.unterzeile = unterfeld.value; });

  const saatfeld = el('input', { type: 'text', class: 'sh-gsaat', value: stand.saat, maxlength: '60' });
  saatfeld.addEventListener('input', () => { stand.saat = saatfeld.value; zeigen(); });
  const wuerfel = el('button', { class: 'knopf zart', title: 'Neu würfeln', onclick: () => { stand.saat = sternNeueSaat(); saatfeld.value = stand.saat; zeigen(); } }, '⚄');

  const reihe = (werte, holen, setzen) => {
    const kasten = el('div', { class: 'sh-greihe' });
    const male = () => {
      kasten.innerHTML = '';
      for (const [id, name] of werte) {
        kasten.append(el('button', {
          class: 'sh-gk' + (holen() === id ? ' an' : ''),
          onclick: () => { setzen(id); male(); zeigen(); }
        }, name));
      }
    };
    male();
    return kasten;
  };

  const schalter = (name, holen, setzen, was) => el('button', {
    class: 'ktg-schalter' + (holen() ? ' an' : ''),
    onclick: (ev) => { setzen(!holen()); ev.currentTarget.classList.toggle('an', holen()); zeigen(); }
  }, el('i', {}), el('b', {}, name), el('small', {}, was));

  zeigen();

  const zu = zeigeDeck(el('div', { class: 'modal sh-gfenster' },
    el('div', { class: 'kartenkopf' }, frisch ? 'EIN NEUER HIMMEL' : 'DER HIMMEL'),
    el('div', { class: 'sh-gzwei' },
      el('div', { class: 'sh-glinks' },
        el('div', { class: 'sh-abschnitt' }, 'Wie er heißt'),
        namensfeld, unterfeld,
        el('div', { class: 'sh-abschnitt' }, 'Wie voll'),
        reihe(STERN_DICHTEN.map((d) => [d[0], d[1]]), () => stand.dichte, (v) => { stand.dichte = v; }),
        el('div', { class: 'sh-abschnitt' }, 'Wie er aussieht'),
        reihe(STERN_WELTEN.map((w) => [w.id, w.name]), () => stand.welt, (v) => { stand.welt = v; }),
        el('div', { class: 'sh-abschnitt' }, 'Was dazugehört'),
        el('div', { class: 'ktg-schalter-reihe' },
          schalter('Die Milchstraße', () => stand.milchstrasse !== false, (v) => { stand.milchstrasse = v; }, 'Ein Band aus zu vielen Sternen, um sie zu zählen'),
          schalter('Die Ekliptik', () => stand.ekliptik !== false, (v) => { stand.ekliptik = v; }, 'Der Weg, den Sonne und Mond übers Jahr nehmen')),
        el('div', { class: 'sh-abschnitt' }, 'Die Saat'),
        el('small', { class: 'ktg-hilfe' }, 'Aus ihr wird jeder Stern gerechnet. Dieselbe Saat ergibt immer denselben Himmel — und deine Sternbilder bleiben daran hängen. Würfelst du neu, stehen sie woanders.'),
        el('div', { class: 'reihe eng' }, saatfeld, wuerfel)),
      el('div', { class: 'sh-grechts' },
        vorschau,
        el('small', { class: 'sh-gvorschautext' }, 'So steht er am ersten Tag. Die Sternbilder ziehst du danach.'))),
    el('div', { class: 'reihe' },
      doc ? el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (!(await frage('„' + saubererHimmel(doc).titel + '“ einrollen?', { ja: 'Einrollen' }))) return;
        await loesche(doc.id);
        zu();
        const h = document.querySelector('.sh-huelle');
        const s = h && h.closest('.schleier');
        if (s) s.remove();
        if (danach) danach();
      } }, 'Einrollen') : null,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: async () => {
        stand.titel = (namensfeld.value || '').trim() || 'Der Himmel über allem';
        stand.unterzeile = (unterfeld.value || '').trim();
        if (frisch) {
          const neuDok = neuDoc('sternhimmel', saubererHimmel(stand));
          neuDok.titel = stand.titel;
          await speichere(neuDok);
          zu();
          if (danach) danach(neuDok.id);
        } else {
          await sternSchreiben(doc, (h) => Object.assign(h, saubererHimmel(stand)), 'Den Himmel eingerichtet');
          zu();
          if (danach) danach();
        }
      } }, frisch ? 'Aufspannen' : 'Übernehmen'))));
  setTimeout(() => namensfeld.focus(), 60);
}
