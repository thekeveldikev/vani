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

/* ----- Text von außen hereinholen -----
   Auf einem verwalteten iPad lässt sich oft keine Datei auswählen. Kopieren und
   Einfügen geht immer. Hier landet alles in einem ruhigen Feld, wird von fremden
   Schriftgrößen, Farben und Hintergründen befreit und danach als Seite abgelegt. */
async function textHereinholen(heft, danach) {
  const feld = el('div', {
    class: 'rich-editor text einfuegefeld', contenteditable: 'true', role: 'textbox',
    'aria-multiline': 'true', 'data-placeholder': 'Hier hinein einfügen — ⌘V oder lange tippen und „Einsetzen".'
  });
  const zaehler = el('div', { class: 'einfuege-zaehler' }, 'Noch nichts eingesetzt.');
  const messen = () => {
    const w = worte(richReinerText(feld.innerHTML));
    zaehler.textContent = w ? (w === 1 ? 'Ein Wort bereit.' : w.toLocaleString('de-DE') + ' Wörter bereit.') : 'Noch nichts eingesetzt.';
  };
  feld.addEventListener('paste', (e) => {
    if (!e.clipboardData) return;
    const html = e.clipboardData.getData('text/html');
    const roh = e.clipboardData.getData('text/plain');
    if (!html && !roh) return;
    e.preventDefault();
    richBefehl(feld, 'insertHTML', html ? einfuegeHTML(html) : einfuegeAusText(roh));
    setTimeout(messen, 0);
  });
  feld.addEventListener('input', messen);

  return new Promise((res) => {
    const kasten = el('div', { class: 'modal einfuege-modal' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('runter') }), 'TEXT HEREINHOLEN'),
      el('h2', {}, 'Aus einer anderen App in „' + heft.titel + '"'),
      el('p', { class: 'einfuege-hinweis' }, 'In Goodnotes alles markieren und kopieren, dann hier einsetzen. VANI nimmt die fremden Schriftgrößen, Farben und Hintergründe heraus und behält Absätze, Überschriften, Listen und Hervorhebungen.'),
      feld, zaehler,
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => { res(null); zu(); } }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: () => {
          const rich = sauberesRichHTML(feld.innerHTML);
          const text = richReinerText(rich).replace(/\n{3,}/g, '\n\n').trim();
          if (!text) { toast('Da ist noch nichts zum Hereinholen.'); return; }
          const seiten = kinder(heft.id, 'seite');
          const letzte = seiten[seiten.length - 1];
          const zielIstLeer = letzte && !(letzte.text || '').trim() && !kinder(letzte.id).length;
          let seite;
          if (zielIstLeer) {
            seite = letzte;
            seite.rich = rich; seite.text = text; seite.format = 'rich';
            speichere(seite);
          } else {
            seite = neuDoc('seite', { parent: heft.id, ord: seiten.length, titel: '', text, rich, format: 'rich' });
          }
          D.stats.letzte[seite.id] = worte(text); speichereStats();
          heft.geaendert = Date.now(); speichereStill(heft);
          res(seite);
          zu();
          toast(worte(text).toLocaleString('de-DE') + ' Wörter sind angekommen. In der Ansicht „Am Stück" liegt alles auf einer langen Seite.', 5200);
          if (danach) danach();
        } }, 'Hereinholen')));
    const zu = zeigeDeck(kasten, () => res(null));
    setTimeout(() => feld.focus(), 80);
  });
}

async function heftMenue(h, danach) {
  const wahl = await menue([
    { text: 'Umbenennen', icon: 'stift', wert: 'name' },
    { text: 'Umschlag & Papier gestalten', icon: 'farbe', wert: 'gestalten' },
    { text: 'Ansicht: ' + ({ rolle: 'Seiten untereinander', fluss: 'eine lange Seite am Stück' }[h.ansicht] || 'einzelne Seiten'), icon: 'lesen', wert: 'ansicht' },
    { text: h.projektRef ? 'Projekt-Zuordnung ändern' : 'Einem Projekt zuordnen', icon: 'projekte', wert: 'projekt' },
    { text: 'Text aus einer anderen App hereinholen', icon: 'runter', wert: 'einfuegen' },
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
    h.ansicht = { seiten: 'rolle', rolle: 'fluss' }[h.ansicht || 'seiten'] || 'seiten'; speichere(h);
  } else if (wahl === 'einfuegen') {
    await textHereinholen(h, danach); return;
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
      el('button', { class: heft.ansicht === 'rolle' ? 'an' : '', title: 'Seite für Seite untereinander', onclick: () => { heft.ansicht = 'rolle'; speichere(heft); zeichne(); } }, 'Rolle'),
      el('button', { class: heft.ansicht === 'fluss' ? 'an' : '', title: 'Eine einzige lange Seite, ohne Umbruch', onclick: () => { heft.ansicht = 'fluss'; speichere(heft); zeichne(); } }, 'Am Stück')),
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

  /* Am Stück: alles Geschriebene auf einer einzigen langen Seite. Kein Umbruch,
     keine Seitenkanten dazwischen — zum Lesen und zum Hineinschütten großer
     Textmengen aus anderen Apps. */
  function zeigeFluss() {
    seiten = kinder(heft.id, 'seite');
    halter.className = 'heftfluss'; fuss.style.display = 'none'; halter.innerHTML = '';
    const bogen = el('div', { class: 'fluss-bogen ' + (heft.papier || 'liniert') });
    /* Ein Werkzeug für die ganze lange Seite. Es wirkt auf das Stück, in dem
       gerade geschrieben wird — sonst auf das letzte. */
    const aktuellesStueck = () => {
      const aktiv = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('.papierseite.fluss')
        : null;
      const blatt = (aktiv && bogen.contains(aktiv)) ? aktiv : $$('.papierseite.fluss', bogen).pop();
      if (!blatt) return null;
      const seite = D.docs.get(blatt.dataset.seite);
      return seite ? { seite, blatt, heft } : null;
    };
    bogen.append(seitenWerkzeuge(aktuellesStueck, { neuZeichnen: zeigeFluss, klasse: 'fluss-werkzeuge' }));
    for (const seite of seiten) bogen.append(baueSeite(seite, heft, zeigeFluss, { fluss: true }));
    halter.append(bogen);
    halter.append(el('button', { class: 'plusskarte rollen-plus', onclick: () => {
      neuDoc('seite', { parent: heft.id, ord: kinder(heft.id, 'seite').length, titel: '', text: '' });
      heft.geaendert = Date.now(); speichereStill(heft); zeigeFluss();
    } }, el('span', { html: ik('plus'), style: 'display:flex' }), 'Noch ein Stück anfügen'));
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
  if (heft.ansicht === 'rolle') zeigeRolle();
  else if (heft.ansicht === 'fluss') zeigeFluss();
  else zeigeSeite();
};

/* Eine Werkzeugreihe, zwei Verwendungen: fest an einer Seite oder oben an der
   langen Seite. ziel() sagt beim Antippen, welches Stück gerade gemeint ist. */
function seitenWerkzeuge(ziel, { neuZeichnen, frisch, klasse } = {}) {
  const auffrischen = () => { if (frisch) frisch(); else if (neuZeichnen) neuZeichnen(); };
  return el('div', { class: 'seitenwerkzeuge' + (klasse ? ' ' + klasse : '') },
    el('button', {
      class: 'rundknopf', title: 'Zettel ankleben', html: ik('pin'), onclick: () => {
        const z = ziel(); if (!z) return;
        neuDoc('zettel', { parent: z.seite.id, text: '', farbe: zufall(['gelb', 'rosa', 'blau', 'gruen']), pos: { x: 8 + Math.random() * 40, y: 6 + Math.random() * 20, rot: -4 + Math.random() * 8, w: 30 } });
        auffrischen();
      }
    }),
    el('button', {
      class: 'rundknopf', title: 'Foto einkleben', html: ik('kamera'), onclick: async () => {
        const z = ziel(); if (!z) return;
        const bild = await waehleBild();
        if (!bild) return;
        neuDoc('foto', { parent: z.seite.id, bild: bild.id, pos: { x: 12 + Math.random() * 35, y: 8 + Math.random() * 20, rot: -3 + Math.random() * 6, w: 42 } });
        auffrischen();
      }
    }),
    el('button', { class: 'rundknopf', title: 'Kritzeln', html: ik('stift'), onclick: () => {
      const z = ziel(); if (z) starteKritzeln(z.blatt, z.seite);
    } }),
    el('button', { class: 'rundknopf format-seite-knopf', title: 'Text formatieren', onclick: () => {
      const z = ziel(); if (!z) return;
      if (z.seite.format !== 'rich') {
        z.seite.format = 'rich'; z.seite.rich = richAusText(z.seite.text || ''); speichere(z.seite);
        if (neuZeichnen) neuZeichnen();
      } else {
        const leiste = $('.formatleiste', z.blatt);
        if (leiste) leiste.classList.toggle('eingeklappt');
      }
    } }, 'Aa'),
    el('button', {
      class: 'rundknopf', title: 'Mehr', html: ik('mehr'), onclick: async () => {
        const z = ziel(); if (!z) return;
        const wahl = await menue([
          { text: 'Im Schreibraum öffnen', icon: 'stift', wert: 'sr' },
          { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'dazu' },
          { text: 'Als loses Blatt herausnehmen', icon: 'blatt', wert: 'blatt' },
          { text: 'Seite herausreißen', icon: 'muell', wert: 'weg', rot: true }
        ]);
        if (wahl === 'sr') oeffneSchreibraum(z.seite.id);
        else if (wahl === 'dazu') await hinzufuegenMenue(z.seite);
        else if (wahl === 'blatt') {
          seiteZuBlatt(z.seite); toast('Liegt jetzt wieder bei den Blättern.');
          if (neuZeichnen) neuZeichnen();
        } else if (wahl === 'weg' && await frage('Diese Seite herausreißen? Alles darauf geht mit.', { ja: 'Herausreißen', gefahr: true })) {
          await loesche(z.seite.id);
          kinder(z.heft.id, 'seite').forEach((x, i) => { x.ord = i; speichereStill(x); });
          if (neuZeichnen) neuZeichnen();
        }
      }
    })
  );
}

function baueSeite(seite, heft, neuZeichnen, optionen = {}) {
  const blatt = el('div', { class: 'papierseite ' + (heft.papier || 'liniert') + (optionen.fluss ? ' fluss' : ''), 'data-seite': seite.id });

  /* Werkzeuge: auf einer einzelnen Seite oben rechts auf dem Papier. In der
     Ansicht „Am Stück" gibt es sie nur einmal ganz oben — dort ist alles eine
     einzige lange Seite, und eine Werkzeugreihe je Stück wäre bloß Lärm. */
  const werkzeuge = optionen.fluss ? null : seitenWerkzeuge(
    () => ({ seite, blatt, heft }), { neuZeichnen, frisch: () => baueAnlagen() });

  /* Titel + Text */
  const titel = el('input', { class: 'stitel serif', type: 'text', value: seite.titel || '', placeholder: 'Überschrift, wenn du magst' });
  titel.addEventListener('input', entprellt(() => { seite.titel = titel.value; speichere(seite); }, 400));

  let text, formatleiste = null;
  if (seite.format === 'rich') {
    const rp = baueRichEditor(seite, { class: 'schreibflaeche', platzhalter: 'Hier darf alles stehen.', kompakt: true });
    text = rp.editor; formatleiste = rp.leiste;
    if (optionen.rolle || optionen.fluss) text.classList.add('rollen-rich');
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

  /* Ohne Filter macht die native append-Methode aus einem fehlenden Element
     den sichtbaren Text „null" — auf jeder schlichten Heftseite. */
  blatt.append(...[skizzenbild, titel, formatleiste, text, werkzeuge].filter(Boolean));

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
/* ----- Kritzeln -----
   Ein Strich ist eine Folge von Punkten, nicht nur eine Spur Pixel. Die Punkte
   liegen auf die Breite normiert vor. Dadurch landet jeder Strich exakt unter
   dem Stift — auch wenn sich das Layout danach noch verschiebt — und
   Rückgängig, Wiederholen und Alles löschen brauchen keinen Bildspeicher. */
function kritzelZeichneStrich(ctx, s, breite) {
  const p = s.punkte || [];
  if (!p.length) return;
  ctx.globalCompositeOperation = s.radierer ? 'destination-out' : 'source-over';
  ctx.strokeStyle = s.farbe || '#000';
  ctx.fillStyle = s.farbe || '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (p.length === 1) {
    ctx.beginPath();
    ctx.arc(p[0].x * breite, p[0].y * breite, Math.max(.35, p[0].w * breite / 2), 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  for (let i = 1; i < p.length; i++) {
    ctx.lineWidth = Math.max(.4, p[i].w * breite);
    ctx.beginPath();
    ctx.moveTo(p[i - 1].x * breite, p[i - 1].y * breite);
    ctx.lineTo(p[i].x * breite, p[i].y * breite);
    ctx.stroke();
  }
}

async function starteKritzeln(blatt, seite) {
  if ($('.kritzelflaeche', blatt)) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = el('canvas', { class: 'kritzelflaeche' });
  const ctx = canvas.getContext('2d');

  let farbe = /^#[0-9a-f]{6}$/i.test(D.einst.stiftFarbe || '') ? D.einst.stiftFarbe : (D.einst.thema === 'tinte' || D.einst.thema === 'kerze' ? '#eae0cd' : STIFTFARBEN[0]);
  let dicke = begrenze(D.einst.stiftDicke, 1, 24, 3.5);
  let radierer = false;
  let striche = [];
  let zurueckgelegt = [];
  let basis = null;
  let breite = 0, hoehe = 0;
  let strich = null;

  const altesBild = $('.skizzenbild', blatt);
  if (altesBild) altesBild.style.display = 'none';

  /* Der Stift folgt immer der wirklichen Zeichenfläche, nie einer alten Messung. */
  function messen() {
    const cr = canvas.getBoundingClientRect();
    const b = Math.max(1, Math.round(cr.width)), h = Math.max(1, Math.round(cr.height));
    if (b === breite && h === hoehe) return false;
    breite = b; hoehe = h;
    canvas.width = Math.round(b * dpr);
    canvas.height = Math.round(h * dpr);
    return true;
  }
  function punktAus(e) {
    const cr = canvas.getBoundingClientRect();
    const skalaX = cr.width ? breite / cr.width : 1;
    const skalaY = cr.height ? hoehe / cr.height : 1;
    return { x: (e.clientX - cr.left) * skalaX / breite, y: (e.clientY - cr.top) * skalaY / breite };
  }
  function strichbreite(e) {
    if (radierer) return Math.max(8, dicke * 3.4) / breite;
    const druck = e && e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : .5;
    return dicke * (.72 + druck * .56) / breite;
  }
  function alleszeichnen() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, breite, hoehe);
    ctx.globalCompositeOperation = 'source-over';
    if (basis) {
      try { ctx.drawImage(basis, 0, 0, breite, basis.height / basis.width * breite); } catch (e) {}
    }
    for (const s of striche) {
      if (s.leeren) { ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, breite, hoehe); continue; }
      kritzelZeichneStrich(ctx, s, breite);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  function knoepfeAuffrischen() {
    zurueckKnopf.disabled = !striche.length;
    vorKnopf.disabled = !zurueckgelegt.length;
    zurueckKnopf.style.opacity = striche.length ? '' : '.35';
    vorKnopf.style.opacity = zurueckgelegt.length ? '' : '.35';
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button > 0) return;
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    const p = punktAus(e);
    strich = { farbe, radierer, punkte: [{ x: p.x, y: p.y, w: strichbreite(e) }] };
    striche.push(strich);
    zurueckgelegt = [];
    kritzelZeichneStrich(ctx, strich, breite);
    ctx.globalCompositeOperation = 'source-over';
    knoepfeAuffrischen();
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!strich) return;
    const punkte = (e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e]);
    ctx.globalCompositeOperation = strich.radierer ? 'destination-out' : 'source-over';
    ctx.strokeStyle = strich.farbe;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const roh of punkte) {
      const p = punktAus(roh);
      const w = strichbreite(roh.pressure != null ? roh : e);
      const vorher = strich.punkte[strich.punkte.length - 1];
      if (Math.abs(p.x - vorher.x) * breite < .35 && Math.abs(p.y - vorher.y) * breite < .35) continue;
      ctx.lineWidth = Math.max(.4, w * breite);
      ctx.beginPath();
      ctx.moveTo(vorher.x * breite, vorher.y * breite);
      ctx.lineTo(p.x * breite, p.y * breite);
      ctx.stroke();
      strich.punkte.push({ x: p.x, y: p.y, w });
    }
    ctx.globalCompositeOperation = 'source-over';
  });
  const strichEnde = () => { strich = null; };
  canvas.addEventListener('pointerup', strichEnde);
  canvas.addEventListener('pointercancel', strichEnde);

  /* Werkzeuge */
  const eigeneFarbe = el('input', { type: 'color', value: farbe, title: 'Eigene Stiftfarbe', 'aria-label': 'Eigene Stiftfarbe' });
  const dickeRegler = el('input', { type: 'range', min: '1', max: '18', step: '.5', value: String(dicke), title: 'Stiftdicke', 'aria-label': 'Stiftdicke' });
  const dickeProbe = el('span', { class: 'stift-dicke-probe', style: 'width:' + dicke + 'px;height:' + dicke + 'px;background:' + farbe });
  const stiftWaehlen = (f, knopf) => {
    farbe = f; eigeneFarbe.value = f; D.einst.stiftFarbe = f; speichereEinst();
    radierer = false; radierKnopf.classList.remove('an');
    dickeProbe.style.background = f;
    $$('.stiftfarbe', leiste).forEach((k) => k.classList.toggle('an', k === knopf));
  };
  eigeneFarbe.addEventListener('input', () => stiftWaehlen(eigeneFarbe.value, null));
  dickeRegler.addEventListener('input', () => {
    dicke = Number(dickeRegler.value); D.einst.stiftDicke = dicke; speichereEinst();
    dickeProbe.style.width = dicke + 'px'; dickeProbe.style.height = dicke + 'px';
  });

  const radierKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('radierer'), title: 'Radierer', onclick: () => {
      radierer = !radierer;
      radierKnopf.classList.toggle('an', radierer);
      if (radierer) $$('.stiftfarbe', leiste).forEach((x) => x.classList.remove('an'));
    }
  });
  const zurueckKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('zurueck'), title: 'Einen Schritt zurück', onclick: () => {
      if (!striche.length) return;
      zurueckgelegt.push(striche.pop());
      alleszeichnen(); knoepfeAuffrischen();
    }
  });
  const vorKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('rechts'), title: 'Schritt wiederherstellen', onclick: () => {
      if (!zurueckgelegt.length) return;
      striche.push(zurueckgelegt.pop());
      alleszeichnen(); knoepfeAuffrischen();
    }
  });
  const leerKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('muell'), title: 'Alles löschen', onclick: async () => {
      if (!striche.length && !basis) { toast('Hier ist noch nichts.'); return; }
      if (!await frage('Die ganze Zeichnung von dieser Seite nehmen?', { ja: 'Alles löschen', gefahr: true })) return;
      striche.push({ leeren: true });
      zurueckgelegt = [];
      alleszeichnen(); knoepfeAuffrischen();
      toast('Weg. Der Pfeil zurück holt es wieder.');
    }
  });

  const aufraeumen = () => {
    try { beobachter.disconnect(); } catch (e) {}
    window.removeEventListener('resize', beiGroesse);
    leiste.remove(); canvas.remove();
  };
  const fertigKnopf = el('button', {
    class: 'knopf voll', style: 'padding:7px 14px', onclick: async () => {
      const leer = !striche.length && !basis;
      seite.skizze = leer ? seite.skizze : await speichereKritzelei(canvas, seite.skizze);
      speichere(seite);
      aufraeumen();
      if (altesBild) {
        altesBild.style.display = '';
        altesBild.innerHTML = '';
        if (seite.skizze) {
          const img = el('img', { alt: '' });
          setzeBild(img, seite.skizze);
          altesBild.append(img);
        }
      }
    }
  }, 'Fertig');
  const abbrechenKnopf = el('button', {
    class: 'knopf zart', style: 'padding:7px 14px', onclick: async () => {
      if (striche.length && !await frage('Diese Zeichnung verwerfen? Der Stand von vorher bleibt.', { ja: 'Verwerfen', gefahr: true })) return;
      aufraeumen();
      if (altesBild) altesBild.style.display = '';
    }
  }, 'Abbrechen');

  const leiste = el('div', { class: 'kritzelleiste' },
    STIFTFARBEN.map((f) => {
      const k = el('button', { class: 'stiftfarbe' + (f === farbe ? ' an' : ''), style: 'background:' + f, title: 'Stiftfarbe', onclick: () => stiftWaehlen(f, k) });
      return k;
    }),
    el('label', { class: 'stift-eigen', title: 'Eigene Farbe' }, '＋', eigeneFarbe),
    el('label', { class: 'stift-dicke' }, dickeProbe, dickeRegler),
    radierKnopf,
    el('span', { class: 'kritzel-trenner' }),
    zurueckKnopf, vorKnopf, leerKnopf,
    el('span', { class: 'kritzel-trenner' }),
    abbrechenKnopf, fertigKnopf
  );

  /* Erst einbauen, dann messen — die Leiste verändert das Layout der Seite. */
  blatt.append(canvas);
  document.body.append(leiste);
  messen();
  knoepfeAuffrischen();

  const beiGroesse = () => { if (messen()) alleszeichnen(); };
  window.addEventListener('resize', beiGroesse);
  const beobachter = typeof ResizeObserver === 'function' ? new ResizeObserver(beiGroesse) : { observe() {}, disconnect() {} };
  try { beobachter.observe(canvas); } catch (e) {}

  if (seite.skizze) {
    const url = await bildURL(seite.skizze);
    if (url && canvas.isConnected) {
      const alt = new Image();
      await new Promise((res) => { alt.onload = res; alt.onerror = res; alt.src = url; });
      if (alt.width && alt.height) basis = alt;
    }
  }
  if (canvas.isConnected) { messen(); alleszeichnen(); }
}
