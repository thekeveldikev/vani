/* ================================================================
   VANI — Hefte: Papier, Zettel, Fotos, Kritzeleien
   ================================================================ */

function heftDeckelDaten(h) {
  const farbe = /^#[0-9a-f]{6}$/i.test(h && h.farbe || '') ? h.farbe : HEFTFARBEN[0];
  const farbe2 = /^#[0-9a-f]{6}$/i.test(h && h.farbe2 || '') ? h.farbe2 : farbe;
  const band = /^#[0-9a-f]{6}$/i.test(h && h.band || '') ? h.band : '#d6bd92';
  const muster = HEFT_MUSTER.some((m) => m[0] === (h && h.muster)) ? h.muster : 'schlicht';
  return { farbe, farbe2, band, muster, style: '--heft1:' + farbe + ';--heft2:' + farbe2 + ';--heftband:' + band };
}

async function heftGestalten(h, danach) {
  const vorschau = el('div', { class: 'heftdeckel heft-vorschau' }, el('div', { class: 'htitel' }, h.titel));
  const farben = el('div', { class: 'heft-farben' });
  const muster = el('div', { class: 'wahlgruppe heft-musterwahl', style: 'flex-wrap:wrap' });
  const frei = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(h.farbe || '') ? h.farbe : HEFTFARBEN[0], title: 'Eigene Grundfarbe' });
  const zweit = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(h.farbe2 || '') ? h.farbe2 : (h.farbe || HEFTFARBEN[0]), title: 'Zweite Farbe' });
  const band = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(h.band || '') ? h.band : '#d6bd92', title: 'Buchband' });
  const aktualisiere = () => {
    const d = heftDeckelDaten(h); vorschau.className = 'heftdeckel heft-vorschau muster-' + d.muster; vorschau.style.cssText = d.style;
  };
  for (const f of HEFTFARBEN) farben.append(el('button', { class: 'heft-farbpunkt', style: 'background:' + f, title: f, onclick: () => { h.farbe = f; frei.value = f; aktualisiere(); } }));
  for (const [id, name] of HEFT_MUSTER) muster.append(el('button', { class: (h.muster || 'schlicht') === id ? 'an' : '', onclick: (e) => {
    h.muster = id; $$('button', muster).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); aktualisiere();
  } }, name));
  frei.addEventListener('input', () => { h.farbe = frei.value; aktualisiere(); });
  zweit.addEventListener('input', () => { h.farbe2 = zweit.value; aktualisiere(); });
  band.addEventListener('input', () => { h.band = band.value; aktualisiere(); });
  const papier = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
  for (const [id, name] of [['liniert', 'Liniert'], ['breit', 'Breite Linien'], ['kariert', 'Kariert'], ['punkte', 'Punktraster'], ['blank', 'Blanko']]) papier.append(el('button', {
    class: (h.papier || 'liniert') === id ? 'an' : '', onclick: (e) => { h.papier = id; $$('button', papier).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); }
  }, name));
  let behalten = false;
  const kasten = el('div', { class: 'modal heft-atelier' }, el('h2', {}, 'Heft gestalten'), vorschau,
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Grundfarbe'), farben,
      el('div', { class: 'heft-freifarben' }, el('label', {}, 'Grundton ', frei), el('label', {}, 'Zweitton ', zweit), el('label', {}, 'Band ', band))),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Muster'), muster),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Papier'), papier),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => { behalten = true; speichere(h); zu(); if (danach) danach(); } }, 'So bleibt es')));
  const alt = { farbe: h.farbe, farbe2: h.farbe2, band: h.band, muster: h.muster, papier: h.papier };
  const zu = zeigeDeck(kasten, () => { if (!behalten) { Object.assign(h, alt); if (danach) danach(); } });
  aktualisiere();
}

RENDER.hefte = function (haupt) {
  haupt.append(raumkopf('Hefte', null,
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), title: 'Neues Heft', onclick: async () => {
        const name = await eingabe({ titel: 'Ein neues Heft', platzhalter: 'Wie soll es heißen?' });
        if (!name) return;
        const h = neuDoc('heft', { titel: name, farbe: zufall(HEFTFARBEN), farbe2: zufall(HEFTFARBEN), band: '#d6bd92', muster: 'leinen', papier: 'liniert', ansicht: 'seiten' });
        location.hash = '#/heft/' + h.id;
      }
    })
  ));
  const inhalt = el('div', { class: 'inhalt' });

  const alle = vomTyp('heft').sort((a, b) => b.geaendert - a.geaendert);
  const aktive = alle.filter((h) => !h.archiv);
  const imRegal = alle.filter((h) => h.archiv);

  if (!alle.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Ein leeres Regal.',
      el('div', { class: 'klein' }, 'Das erste Heft ist das beste Versprechen, das es gibt.')));
  }

  const baueDeckel = (h) => {
    const seiten = kinder(h.id, 'seite').length;
    const stil = heftDeckelDaten(h);
    const deckel = el('button', {
      class: 'heftdeckel muster-' + stil.muster + (h.archiv ? ' archiv' : ''),
      style: stil.style,
      onclick: () => { location.hash = '#/heft/' + h.id; }
    },
      h.archiv ? el('div', { class: 'hdatum' }, 'INS REGAL · ' + fmtDatum(h.archiv)) : null,
      el('div', { class: 'htitel' }, h.titel),
      el('div', { class: 'hseiten' }, seiten === 1 ? '1 Seite' : seiten + ' Seiten')
    );
    langdruck(deckel, () => heftMenue(h, () => zeichne()));
    return deckel;
  };

  if (aktive.length) {
    const regal = el('div', { class: 'regal' });
    aktive.forEach((h) => regal.append(baueDeckel(h)));
    inhalt.append(regal);
  }
  if (imRegal.length) {
    inhalt.append(el('div', { class: 'regal-trenner' }, 'IM REGAL'));
    const regal = el('div', { class: 'regal' });
    imRegal.forEach((h) => regal.append(baueDeckel(h)));
    inhalt.append(regal);
  }
  haupt.append(inhalt);
};

async function heftMenue(h, danach) {
  const wahl = await menue([
    { text: 'Umbenennen', icon: 'stift', wert: 'name' },
    { text: 'Umschlag & Papier gestalten', icon: 'farbe', wert: 'gestalten' },
    { text: 'Ansicht: ' + ((h.ansicht || 'seiten') === 'rolle' ? 'durchgehend scrollen' : 'einzelne Seiten'), icon: 'lesen', wert: 'ansicht' },
    { text: h.projektRef ? 'Projekt-Zuordnung ändern' : 'Einem Projekt zuordnen', icon: 'projekte', wert: 'projekt' },
    { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'dazu' },
    h.archiv ? { text: 'Zurück auf den Tisch', icon: 'archiv', wert: 'zurueck' } : { text: 'Ins Regal stellen', icon: 'archiv', wert: 'archiv' },
    { text: 'Heft verbrennen', icon: 'muell', wert: 'weg', rot: true }
  ], h.titel);
  if (wahl === 'name') {
    const neu = await eingabe({ titel: 'Das Heft heißt jetzt …', wert: h.titel });
    if (neu) { h.titel = neu; speichere(h); }
  } else if (wahl === 'gestalten') {
    await heftGestalten(h, danach); return;
  } else if (wahl === 'ansicht') {
    h.ansicht = (h.ansicht || 'seiten') === 'rolle' ? 'seiten' : 'rolle'; speichere(h);
  } else if (wahl === 'projekt') {
    await ordneHeftProjektZu(h);
  } else if (wahl === 'dazu') {
    await hinzufuegenMenue(h);
  } else if (wahl === 'archiv') {
    h.archiv = Date.now(); speichereStill(h);
    toast('Feierlich ins Regal gestellt.');
  } else if (wahl === 'zurueck') {
    delete h.archiv; speichereStill(h);
  } else if (wahl === 'weg') {
    const seiten = kinder(h.id, 'seite').length;
    if (await frage('„' + h.titel + '" mit ' + (seiten === 1 ? 'einer Seite' : seiten + ' Seiten') + ' in den Papierkorb legen?', { ja: 'In den Papierkorb', gefahr: true })) {
      await loesche(h.id);
      if (location.hash.includes(h.id)) location.hash = '#/hefte';
    }
  }
  if (danach) danach();
}

/* ----- Ein Heft, eine Seite ----- */
RENDER.heft = function (haupt, heftId) {
  const heft = D.docs.get(heftId);
  if (!heft) { location.hash = '#/hefte'; return; }

  let seiten = kinder(heft.id, 'seite');
  if (!seiten.length) {
    neuDoc('seite', { parent: heft.id, ord: 0, titel: '', text: '' });
    seiten = kinder(heft.id, 'seite');
  }

  let idx = Math.min(seiten.length - 1, parseInt(sessionStorage.getItem('heftSeite:' + heftId) || '0', 10) || 0);
  const ziel = sessionStorage.getItem('zielSeite');
  if (ziel) {
    sessionStorage.removeItem('zielSeite');
    const zi = seiten.findIndex((s) => s.id === ziel);
    if (zi >= 0) idx = zi;
  }

  haupt.append(el('div', { class: 'kopf' },
    zurueckknopf('#/hefte'),
    el('h1', {}, heft.titel),
    el('div', { class: 'heft-ansichtswahl', role: 'group', 'aria-label': 'Heftansicht' },
      el('button', { class: (heft.ansicht || 'seiten') === 'seiten' ? 'an' : '', title: 'Einzelne Seiten', onclick: () => { heft.ansicht = 'seiten'; speichere(heft); zeichne(); } }, 'Seiten'),
      el('button', { class: heft.ansicht === 'rolle' ? 'an' : '', title: 'Durchgehend scrollen', onclick: () => { heft.ansicht = 'rolle'; speichere(heft); zeichne(); } }, 'Rolle')),
    el('button', { class: 'rundknopf zart', html: ik('mehr'), title: 'Heft-Menü', onclick: () => heftMenue(heft, () => zeichne()) })
  ));

  const inhalt = el('div', { class: 'inhalt' });
  const halter = el('div', { class: 'seitenhalter' });
  const fuss = el('div', { class: 'seitenfuss' });
  inhalt.append(halter, fuss);
  haupt.append(inhalt);

  function zeigeRolle() {
    seiten = kinder(heft.id, 'seite');
    halter.className = 'heftrolle'; fuss.style.display = 'none'; halter.innerHTML = '';
    for (let i = 0; i < seiten.length; i++) {
      const seite = seiten[i];
      halter.append(el('section', { class: 'rollen-seite', 'data-seite': seite.id },
        el('div', { class: 'rollen-seitennummer' }, 'Seite ' + (i + 1)),
        baueSeite(seite, heft, zeigeRolle, { rolle: true })));
    }
    halter.append(el('button', { class: 'plusskarte rollen-plus', onclick: () => {
      neuDoc('seite', { parent: heft.id, ord: seiten.length, titel: '', text: '' });
      heft.geaendert = Date.now(); speichereStill(heft); zeigeRolle();
      requestAnimationFrame(() => { const letzte = halter.lastElementChild && halter.lastElementChild.previousElementSibling; if (letzte) letzte.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    } }, el('span', { html: ik('plus'), style: 'display:flex' }), 'Neue Seite darunter'));
  }

  function zeigeSeite() {
    seiten = kinder(heft.id, 'seite');
    /* Ein Heft bleibt immer benutzbar, auch wenn seine letzte Seite
       herausgenommen oder gelöscht wurde. */
    if (!seiten.length) {
      neuDoc('seite', { parent: heft.id, ord: 0, titel: '', text: '' });
      seiten = kinder(heft.id, 'seite');
      idx = 0;
    }
    idx = Math.max(0, Math.min(idx, seiten.length - 1));
    sessionStorage.setItem('heftSeite:' + heftId, String(idx));
    const seite = seiten[idx];
    halter.innerHTML = '';
    fuss.innerHTML = '';
    halter.append(baueSeite(seite, heft, zeigeSeite, {
      autoWeiter: D.einst.autoSeitenwechsel !== false ? (weiter) => {
        const paket = weiter && typeof weiter === 'object'
          ? { text: String(weiter.text || ''), rich: String(weiter.rich || ''), format: weiter.format === 'rich' ? 'rich' : 'plain' }
          : { text: String(weiter || ''), rich: '', format: 'plain' };
        seiten = kinder(heft.id, 'seite');
        let naechste = seiten[idx + 1];
        const leerUndFrei = naechste && !(naechste.text || '').trim() && !kinder(naechste.id).length;
        if (!leerUndFrei) {
          for (let i = seiten.length - 1; i > idx; i--) { seiten[i].ord = i + 1; speichereStill(seiten[i]); }
          naechste = neuDoc('seite', { parent: heft.id, ord: idx + 1, titel: '', text: paket.text, rich: paket.rich, format: paket.format });
        } else {
          naechste.text = paket.text; naechste.rich = paket.rich; naechste.format = paket.format;
          speichere(naechste); D.stats.letzte[naechste.id] = worte(paket.text);
        }
        idx++;
        heft.geaendert = Date.now(); speichereStill(heft);
        zeigeSeite();
        requestAnimationFrame(() => {
          const feld = $('.schreibflaeche', halter);
          if (feld) {
            feld.focus();
            if (feld.setSelectionRange) feld.setSelectionRange(feld.value.length, feld.value.length);
            else { const r = document.createRange(), s = window.getSelection(); r.selectNodeContents(feld); r.collapse(false); s.removeAllRanges(); s.addRange(r); }
            /* Ein großer Paste kann mehrere Seiten auf einmal füllen. Der
               neue Rest wird daher erneut geprüft, bis die letzte Seite
               tatsächlich hineinpasst. */
            if (feld.scrollHeight > feld.clientHeight + 2) {
              feld.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        });
        toast('Weiter auf Seite ' + (idx + 1) + '.');
      } : null
    }));

    fuss.append(
      el('button', { class: 'rundknopf zart', html: ik('zurueck'), title: 'Vorherige Seite', style: idx === 0 ? 'opacity:.25;pointer-events:none' : '', onclick: () => { idx--; zeigeSeite(); } }),
      el('div', { class: 'snummer' }, 'Seite ' + (idx + 1) + ' von ' + seiten.length),
      el('button', { class: 'rundknopf zart', html: ik('rechts'), title: 'Nächste Seite', style: idx === seiten.length - 1 ? 'opacity:.25;pointer-events:none' : '', onclick: () => { idx++; zeigeSeite(); } }),
      el('button', {
        class: 'rundknopf', html: ik('plus'), title: 'Neue Seite', onclick: () => {
          neuDoc('seite', { parent: heft.id, ord: seiten.length, titel: '', text: '' });
          heft.geaendert = Date.now(); speichereStill(heft);
          idx = seiten.length; zeigeSeite();
        }
      }),
      el('button', {
        class: 'auto-weiter-schalter' + (D.einst.autoSeitenwechsel !== false ? ' an' : ''),
        title: 'Automatisch auf die nächste Seite', onclick: () => {
          D.einst.autoSeitenwechsel = D.einst.autoSeitenwechsel === false;
          speichereEinst(); zeigeSeite();
        }
      }, 'Auto weiter ' + (D.einst.autoSeitenwechsel !== false ? 'an' : 'aus'))
    );
  }
  if (heft.ansicht === 'rolle') zeigeRolle(); else zeigeSeite();
};

function baueSeite(seite, heft, neuZeichnen, optionen = {}) {
  const blatt = el('div', { class: 'papierseite ' + (heft.papier || 'liniert') });

  /* Werkzeuge oben rechts */
  const werkzeuge = el('div', { class: 'seitenwerkzeuge' },
    el('button', {
      class: 'rundknopf', title: 'Zettel ankleben', html: ik('pin'), onclick: () => {
        neuDoc('zettel', { parent: seite.id, text: '', farbe: zufall(['gelb', 'rosa', 'blau', 'gruen']), pos: { x: 8 + Math.random() * 40, y: 6 + Math.random() * 20, rot: -4 + Math.random() * 8, w: 30 } });
        baueAnlagen();
      }
    }),
    el('button', {
      class: 'rundknopf', title: 'Foto einkleben', html: ik('kamera'), onclick: async () => {
        const bild = await waehleBild();
        if (!bild) return;
        neuDoc('foto', { parent: seite.id, bild: bild.id, pos: { x: 12 + Math.random() * 35, y: 8 + Math.random() * 20, rot: -3 + Math.random() * 6, w: 42 } });
        baueAnlagen();
      }
    }),
    el('button', { class: 'rundknopf', title: 'Kritzeln', html: ik('stift'), onclick: () => starteKritzeln(blatt, seite) }),
    el('button', { class: 'rundknopf format-seite-knopf', title: seite.format === 'rich' ? 'Formatleiste ist geöffnet' : 'Text formatieren', onclick: () => {
      if (seite.format !== 'rich') { seite.format = 'rich'; seite.rich = richAusText(seite.text || ''); speichere(seite); neuZeichnen(); }
      else { const leiste = $('.formatleiste', blatt); if (leiste) leiste.classList.toggle('eingeklappt'); }
    } }, 'Aa'),
    el('button', {
      class: 'rundknopf', title: 'Mehr', html: ik('mehr'), onclick: async () => {
        const wahl = await menue([
          { text: 'Im Schreibraum öffnen', icon: 'stift', wert: 'sr' },
          { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'dazu' },
          { text: 'Als loses Blatt herausnehmen', icon: 'blatt', wert: 'blatt' },
          { text: 'Seite herausreißen', icon: 'muell', wert: 'weg', rot: true }
        ]);
        if (wahl === 'sr') oeffneSchreibraum(seite.id);
        else if (wahl === 'dazu') await hinzufuegenMenue(seite);
        else if (wahl === 'blatt') {
          seiteZuBlatt(seite); toast('Liegt jetzt wieder bei den Blättern.'); neuZeichnen();
        }
        else if (wahl === 'weg' && await frage('Diese Seite herausreißen? Alles darauf geht mit.', { ja: 'Herausreißen', gefahr: true })) {
          await loesche(seite.id);
          kinder(heft.id, 'seite').forEach((s, i) => { s.ord = i; speichereStill(s); });
          neuZeichnen();
        }
      }
    })
  );

  /* Titel + Text */
  const titel = el('input', { class: 'stitel serif', type: 'text', value: seite.titel || '', placeholder: 'Überschrift, wenn du magst' });
  titel.addEventListener('input', entprellt(() => { seite.titel = titel.value; speichere(seite); }, 400));

  let text, formatleiste = null;
  if (seite.format === 'rich') {
    const rp = baueRichEditor(seite, { class: 'schreibflaeche', platzhalter: 'Hier darf alles stehen.', kompakt: true });
    text = rp.editor; formatleiste = rp.leiste;
    if (optionen.rolle) text.classList.add('rollen-rich');
    if (optionen.autoWeiter) {
      text.classList.add('auto-weiter');
      let richBlaettert = false;
      const pruefeRich = () => requestAnimationFrame(() => {
        if (richBlaettert || !text.isConnected || text.scrollHeight <= text.clientHeight + 2) return;
        const passt = (html) => {
          const messer = text.cloneNode(false);
          messer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;min-height:0;max-height:none;overflow:hidden;width:' + text.clientWidth + 'px';
          messer.innerHTML = html; blatt.append(messer);
          const ok = messer.scrollHeight <= text.clientHeight + 2; messer.remove(); return ok;
        };
        const teil = richTeileFuerHoehe(text, passt);
        if (!teil) return;
        richBlaettert = true; rp.sichern.sofort();
        text.innerHTML = teil.hier; seite.rich = teil.hier; seite.text = richReinerText(teil.hier).trimEnd(); seite.format = 'rich'; speichere(seite);
        D.stats.letzte[seite.id] = worte(seite.text); speichereStats();
        optionen.autoWeiter({ rich: teil.weiter, text: richReinerText(teil.weiter).trimStart(), format: 'rich' });
      });
      text.addEventListener('input', pruefeRich);
      requestAnimationFrame(() => { if (text.isConnected && text.scrollHeight > text.clientHeight + 2) pruefeRich(); });
    }
  } else {
    text = el('textarea', { class: 'schreibflaeche text', placeholder: 'Hier darf alles stehen.' });
    text.value = seite.text || '';
    if (optionen.autoWeiter) text.classList.add('auto-weiter'); else autogrow(text);
    const sichereText = entprellt(() => {
      seite.text = text.value;
      speichere(seite);
      zaehleWorte(seite.id, seite.text);
    }, 400, true);
    let blaettert = false;
    text.addEventListener('input', () => {
      sichereText();
      if (!optionen.autoWeiter || blaettert || text.selectionStart < text.value.length - 2) return;
      requestAnimationFrame(() => {
        if (blaettert || !text.isConnected) return;
        const passt = (wert) => {
          const messer = text.cloneNode();
          messer.className = text.className;
          messer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:auto;min-height:0;max-height:none;overflow:hidden;width:' + text.clientWidth + 'px';
          messer.value = wert; blatt.append(messer);
          const ok = messer.scrollHeight <= text.clientHeight + 2;
          messer.remove(); return ok;
        };
        const teil = seitenUmbruch(text.value, passt);
        if (!teil) return;
        blaettert = true;
        sichereText.sofort(); /* zählt den eben geschriebenen Zuwachs noch auf dieser Seite */
        text.value = teil.hier; seite.text = teil.hier; speichere(seite);
        D.stats.letzte[seite.id] = worte(teil.hier); speichereStats();
        optionen.autoWeiter(teil.weiter);
      });
    });
    if (optionen.autoWeiter) requestAnimationFrame(() => { if (text.isConnected && text.scrollHeight > text.clientHeight + 2) text.dispatchEvent(new Event('input', { bubbles: true })); });
  }

  const skizzenbild = el('div', { class: 'skizzenbild' });
  if (seite.skizze) {
    const img = el('img', { alt: '' });
    setzeBild(img, seite.skizze);
    skizzenbild.append(img);
  }

  blatt.append(skizzenbild, titel, formatleiste, text, werkzeuge);

  /* Angeklebtes */
  function baueAnlagen() {
    $$('.anlage', blatt).forEach((a) => a.remove());
    for (const a of kinder(seite.id)) {
      if (a.typ === 'zettel') blatt.append(baueZettel(a, blatt, baueAnlagen));
      else if (a.typ === 'foto') blatt.append(baueFoto(a, blatt, baueAnlagen));
    }
  }
  baueAnlagen();

  blatt.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.anlage')) $$('.anlage.aktiv', blatt).forEach((a) => a.classList.remove('aktiv'));
  });

  return blatt;
}

function positioniere(elem, a) {
  const p = a.pos || (a.pos = { x: 10, y: 10, rot: 0, w: 30 });
  elem.style.left = p.x + '%';
  elem.style.top = p.y + '%';
  elem.style.width = p.w + '%';
  elem.style.transform = 'rotate(' + (p.rot || 0) + 'deg)';
}

function anlageGesten(elem, a, blatt, neuBauen) {
  let zieht = null;
  elem.addEventListener('pointerdown', (e) => {
    if (e.target.tagName === 'TEXTAREA' && elem.classList.contains('aktiv')) return;
    $$('.anlage.aktiv', blatt).forEach((x) => { if (x !== elem) x.classList.remove('aktiv'); });
    const r = blatt.getBoundingClientRect();
    zieht = { sx: e.clientX, sy: e.clientY, px: a.pos.x, py: a.pos.y, r, bewegt: false };
    try { elem.setPointerCapture(e.pointerId); } catch (x) {}
    e.preventDefault();
  });
  elem.addEventListener('pointermove', (e) => {
    if (!zieht) return;
    const dx = e.clientX - zieht.sx, dy = e.clientY - zieht.sy;
    if (!zieht.bewegt && Math.hypot(dx, dy) < 6) return;
    zieht.bewegt = true;
    elem._zieht = true;
    a.pos.x = Math.max(-10, Math.min(96, zieht.px + dx / zieht.r.width * 100));
    a.pos.y = Math.max(-2, Math.min(102, zieht.py + dy / zieht.r.height * 100));
    elem.style.left = a.pos.x + '%';
    elem.style.top = a.pos.y + '%';
  });
  const ende = (e) => {
    if (!zieht) return;
    if (zieht.bewegt) speichereStill(a);
    else elem.classList.add('aktiv');
    zieht = null;
    setTimeout(() => { elem._zieht = false; }, 0);
  };
  elem.addEventListener('pointerup', ende);
  elem.addEventListener('pointercancel', ende);

  /* Griff: Größe ziehen */
  const griff = el('div', { class: 'griff', html: ik('rechts') });
  griff.style.transform = 'rotate(45deg)';
  let groesse = null;
  griff.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const r = blatt.getBoundingClientRect();
    groesse = { sx: e.clientX, w: a.pos.w, r };
    try { griff.setPointerCapture(e.pointerId); } catch (x) {}
  });
  griff.addEventListener('pointermove', (e) => {
    if (!groesse) return;
    a.pos.w = Math.max(12, Math.min(92, groesse.w + (e.clientX - groesse.sx) / groesse.r.width * 100));
    elem.style.width = a.pos.w + '%';
  });
  griff.addEventListener('pointerup', () => { if (groesse) speichereStill(a); groesse = null; });
  elem.append(griff);

  langdruck(elem, async () => {
    const wahl = await menue([
      a.typ === 'zettel' ? { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' } : null,
      { text: 'Befestigung: ' + ({ tesa: 'Tesa', pin: 'Reißzwecke', lose: 'lose aufgelegt' }[a.befestigung || 'tesa']), icon: 'pin', wert: 'befestigung' },
      { text: 'Etwas drehen', icon: 'drehen', wert: 'drehen' },
      { text: 'Abmachen', icon: 'muell', wert: 'weg', rot: true }
    ]);
    if (wahl === 'farbe') {
      const folge = ['gelb', 'rosa', 'blau', 'gruen'];
      a.farbe = folge[(folge.indexOf(a.farbe) + 1) % folge.length];
      speichereStill(a); neuBauen();
    } else if (wahl === 'befestigung') {
      a.befestigung = { tesa: 'pin', pin: 'lose', lose: 'tesa' }[a.befestigung || 'tesa']; speichereStill(a); neuBauen();
    } else if (wahl === 'drehen') {
      a.pos.rot = ((a.pos.rot || 0) + 4.5);
      if (a.pos.rot > 10) a.pos.rot = -9;
      speichereStill(a);
      elem.style.transform = 'rotate(' + a.pos.rot + 'deg)';
    } else if (wahl === 'weg') {
      if (await frage(a.typ === 'zettel' ? 'Zettel abmachen und wegwerfen?' : 'Foto abmachen?', { ja: 'Abmachen', gefahr: true })) {
        await loesche(a.id); neuBauen();
      }
    }
  });
}

function baueZettel(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage befestigung-' + (a.befestigung || 'tesa') });
  positioniere(halter, a);
  const z = el('div', { class: 'zettel ' + (a.farbe || 'gelb') });
  const ta = el('textarea', { placeholder: '…', rows: 1 });
  ta.value = a.text || '';
  autogrow(ta);
  ta.addEventListener('input', entprellt(() => { a.text = ta.value; speichereStill(a); }, 400));
  z.append(ta);
  halter.append(z);
  anlageGesten(halter, a, blatt, neuBauen);
  return halter;
}

function baueFoto(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage befestigung-' + (a.befestigung || 'tesa') });
  positioniere(halter, a);
  const rahmen = el('div', { class: 'foto-anlage' });
  const img = el('img', { alt: '' });
  setzeBild(img, a.bild);
  rahmen.append(img);
  halter.append(rahmen);
  anlageGesten(halter, a, blatt, neuBauen);
  return halter;
}

/* ----- Kritzeln ----- */
const STIFTFARBEN = ['#2c251c', '#6a5742', '#b0552f', '#cb6b62', '#d08b31', '#b8923f', '#5f7752', '#2f7c72', '#41597a', '#5c6fb3', '#765187', '#a34f77'];
async function starteKritzeln(blatt, seite) {
  if ($('.kritzelflaeche', blatt)) return;
  const r = blatt.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = el('canvas', { class: 'kritzelflaeche' });
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (seite.skizze) {
    const url = await bildURL(seite.skizze);
    if (url) {
      const alt = new Image();
      await new Promise((res) => { alt.onload = res; alt.onerror = res; alt.src = url; });
      try { ctx.drawImage(alt, 0, 0, r.width, alt.height / alt.width * r.width); } catch (e) {}
    }
  }
  const altesBild = $('.skizzenbild', blatt);
  if (altesBild) altesBild.style.display = 'none';

  let farbe = /^#[0-9a-f]{6}$/i.test(D.einst.stiftFarbe || '') ? D.einst.stiftFarbe : (D.einst.thema === 'tinte' || D.einst.thema === 'kerze' ? '#eae0cd' : STIFTFARBEN[0]);
  let dicke = begrenze(D.einst.stiftDicke, 1, 24, 3.5);
  let radierer = false;
  let strich = null;
  let letzterStand = null;

  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    try { letzterStand = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (x) { letzterStand = null; }
    strich = { x: e.offsetX, y: e.offsetY };
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!strich) return;
    const punkte = (e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e]);
    for (const p of punkte) {
      const cr = canvas.getBoundingClientRect();
      const x = p.clientX - cr.left, y = p.clientY - cr.top;
      const druck = p.pressure && p.pressure > 0 ? p.pressure : .5;
      ctx.globalCompositeOperation = radierer ? 'destination-out' : 'source-over';
      ctx.strokeStyle = farbe;
      ctx.lineWidth = radierer ? Math.max(20, dicke * 4) : dicke * (.55 + druck * .9);
      ctx.beginPath();
      ctx.moveTo(strich.x, strich.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      strich = { x, y };
    }
  });
  const strichEnde = () => { strich = null; };
  canvas.addEventListener('pointerup', strichEnde);
  canvas.addEventListener('pointercancel', strichEnde);

  const eigeneFarbe = el('input', { type: 'color', value: farbe, title: 'Eigene Stiftfarbe', 'aria-label': 'Eigene Stiftfarbe' });
  const dickeRegler = el('input', { type: 'range', min: '1', max: '18', step: '.5', value: String(dicke), title: 'Stiftdicke', 'aria-label': 'Stiftdicke' });
  const dickeProbe = el('span', { class: 'stift-dicke-probe', style: 'width:' + dicke + 'px;height:' + dicke + 'px;background:' + farbe });
  eigeneFarbe.addEventListener('input', () => {
    farbe = eigeneFarbe.value; D.einst.stiftFarbe = farbe; speichereEinst(); radierer = false;
    dickeProbe.style.background = farbe; $$('.stiftfarbe', leiste).forEach((x) => x.classList.remove('an')); radierKnopf.classList.remove('an');
  });
  dickeRegler.addEventListener('input', () => {
    dicke = Number(dickeRegler.value); D.einst.stiftDicke = dicke; speichereEinst();
    dickeProbe.style.width = dicke + 'px'; dickeProbe.style.height = dicke + 'px';
  });
  const leiste = el('div', { class: 'kritzelleiste' },
    STIFTFARBEN.map((f) =>
      el('button', {
        class: 'stiftfarbe' + (f === farbe ? ' an' : ''), style: 'background:' + f, onclick: (e) => {
          farbe = f; eigeneFarbe.value = f; D.einst.stiftFarbe = f; speichereEinst(); radierer = false; dickeProbe.style.background = f;
          $$('.stiftfarbe', leiste).forEach((k) => k.classList.toggle('an', k === e.currentTarget));
          radierKnopf.classList.remove('an');
        }
      })
    ),
    el('label', { class: 'stift-eigen', title: 'Eigene Farbe' }, '＋', eigeneFarbe),
    el('label', { class: 'stift-dicke' }, dickeProbe, dickeRegler),
    (() => {
      const k = el('button', {
        class: 'rundknopf', style: 'width:34px;height:34px', html: ik('kreuz'), title: 'Radierer', onclick: () => {
          radierer = !radierer;
          k.classList.toggle('an', radierer);
          if (radierer) $$('.stiftfarbe', leiste).forEach((x) => x.classList.remove('an'));
          k.style.background = radierer ? 'var(--akzent)' : '';
          k.style.color = radierer ? 'var(--papier)' : '';
        }
      });
      return k;
    })(),
    el('button', { class: 'rundknopf', style: 'width:34px;height:34px', title: 'Letzten Strich rückgängig', html: ik('zurueck'), onclick: () => {
      if (!letzterStand) { toast('Noch kein Strich zum Rückgängigmachen.'); return; }
      try { ctx.putImageData(letzterStand, 0, 0); letzterStand = null; } catch (e) {}
    } }),
    el('button', {
      class: 'knopf voll', style: 'padding:7px 14px', onclick: async () => {
        seite.skizze = await speichereKritzelei(canvas, seite.skizze);
        speichere(seite);
        leiste.remove();
        canvas.remove();
        if (altesBild) {
          altesBild.style.display = '';
          altesBild.innerHTML = '';
          const img = el('img', { alt: '' });
          setzeBild(img, seite.skizze);
          altesBild.append(img);
        }
      }
    }, 'Fertig')
  );
  const radierKnopf = leiste.children[STIFTFARBEN.length + 2];

  blatt.closest('.inhalt').prepend(leiste);
  blatt.append(canvas);
}
