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

const PAPIERFARBEN = [['hell', 'Hell'], ['weiss', 'Weiß'], ['creme', 'Creme'], ['kraft', 'Kraft'], ['nacht', 'Nacht']];
function papierKlassen(heft, extra = '') {
  return 'papierseite ' + (heft.papier || 'liniert') + ' papierfarbe-' + (heft.papierfarbe || 'hell') + (heft.rand ? ' mit-rand' : '') + extra;
}

/* Umschlag gestalten und die Übersicht wohnen in 43e-deckel.js. */
async function heftGestalten(h, danach) { return heftAtelier(h, danach); }

RENDER.hefte = function (haupt) { return renderHefteRegal(haupt); };

/* ----- Text von außen hereinholen -----
   Auf einem verwalteten iPad lässt sich oft keine Datei auswählen. Kopieren und
   Einfügen geht immer. Hier landet alles in einem ruhigen Feld, wird von fremden
   Schriftgrößen, Farben und Hintergründen befreit und danach als Seite abgelegt. */
async function textHereinholen(heft, danach) {
  const feld = el('div', {
    class: 'rich-editor text einfuegefeld', contenteditable: 'true', role: 'textbox',
    'aria-multiline': 'true', 'data-placeholder': 'Hier hinein einfügen — ⌘V oder lange tippen und „Einsetzen“.'
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
      el('h2', {}, 'Aus einer anderen App in „' + heft.titel + '“'),
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
          toast(worte(text).toLocaleString('de-DE') + ' Wörter sind angekommen. In der Ansicht „Am Stück“ liegt alles auf einer langen Seite.', 5200);
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
    { text: 'Ansicht: ' + ({ rolle: 'Rolle (ein Textblock)', fluss: 'eine lange Seite am Stück' }[h.ansicht] || 'einzelne Seiten'), icon: 'lesen', wert: 'ansicht' },
    h.ansicht === 'rolle' ? { text: (h.rollenGrenzen ? 'Seitengrenzen in der Rolle verbergen' : 'Seitengrenzen und Überschriften in der Rolle zeigen'), icon: 'gliederung', wert: 'grenzen' } : null,
    { text: h.projektRef ? 'Projekt-Zuordnung ändern' : 'Einem Projekt zuordnen', icon: 'projekte', wert: 'projekt' },
    { text: 'Text aus einer anderen App hereinholen', icon: 'runter', wert: 'einfuegen' },
    { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'dazu' },
    h.archiv ? { text: 'Zurück auf den Tisch', icon: 'archiv', wert: 'zurueck' } : { text: 'Ins Regal stellen', icon: 'archiv', wert: 'archiv' },
    { text: 'Heft verbrennen', icon: 'muell', wert: 'weg', rot: true }
  ].filter(Boolean), h.titel);
  if (wahl === 'name') {
    const neu = await eingabe({ titel: 'Das Heft heißt jetzt …', wert: h.titel });
    if (neu) { h.titel = neu; speichere(h); }
  } else if (wahl === 'gestalten') {
    await heftGestalten(h, danach); return;
  } else if (wahl === 'ansicht') {
    h.ansicht = { seiten: 'rolle', rolle: 'fluss' }[h.ansicht || 'seiten'] || 'seiten'; speichere(h);
  } else if (wahl === 'grenzen') {
    h.rollenGrenzen = !h.rollenGrenzen; speichere(h);
  } else if (wahl === 'einfuegen') {
    await textHereinholen(h, danach); return;
  } else if (wahl === 'projekt') {
    await ordneHeftProjektZu(h);
  } else if (wahl === 'dazu') {
    await hinzufuegenMenue(h);
  } else if (wahl === 'archiv') {
    if (typeof merkeHeftLagen === 'function') merkeHeftLagen();
    h.archiv = Date.now(); speichereStill(h);
    toast('Feierlich ins Regal gestellt.');
  } else if (wahl === 'zurueck') {
    if (typeof merkeHeftLagen === 'function') merkeHeftLagen();
    delete h.archiv; speichereStill(h);
  } else if (wahl === 'weg') {
    const seiten = kinder(h.id, 'seite').length;
    if (await frage('„' + h.titel + '“ mit ' + (seiten === 1 ? 'einer Seite' : seiten + ' Seiten') + ' in den Papierkorb legen?', { ja: 'In den Papierkorb', gefahr: true })) {
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
  /* Das Lesezeichen öffnet das Heft dort, wo ich zuletzt „hierher“ gesagt habe —
     nur beim ersten Öffnen in dieser Sitzung, danach zählt die letzte Seite. */
  if (!sessionStorage.getItem('heftSeite:' + heftId) && heft.lesezeichen) {
    const li = seiten.findIndex((s) => s.id === heft.lesezeichen);
    if (li >= 0) idx = li;
  }
  /* Ein Sprungziel (Inhalt, Suche, verschobene oder verdoppelte Seite) wird
     genau einmal eingelöst — in jeder Ansicht, und ohne später nachzuwirken. */
  let springZu = null;
  const zielAufnehmen = () => {
    const z = sessionStorage.getItem('zielSeite');
    if (!z) return null;
    sessionStorage.removeItem('zielSeite');
    return z;
  };
  const ziel = zielAufnehmen();
  if (ziel) {
    const zi = seiten.findIndex((s) => s.id === ziel);
    if (zi >= 0) { idx = zi; springZu = ziel; }
  }
  const scrolleZuZiel = () => {
    if (!springZu) return;
    requestAnimationFrame(() => {
      const z = halter.querySelector('[data-seite="' + springZu + '"]');
      if (z) z.scrollIntoView({ behavior: 'smooth', block: 'start' });
      springZu = null;
    });
  };

  haupt.append(el('div', { class: 'kopf heft-kopf viele-aktionen' },
    zurueckknopf('#/hefte'),
    el('button', { class: 'heft-minideckel', title: 'Umschlag gestalten', onclick: () => heftGestalten(heft, () => zeichne()) }, baueDeckelElement(heft, { seitenzahl: seiten.length })),
    el('h1', {}, heft.titel),
    el('div', { class: 'kopf-aktionen' },
      el('div', { class: 'heft-ansichtswahl', role: 'group', 'aria-label': 'Heftansicht' },
        el('button', { class: (heft.ansicht || 'seiten') === 'seiten' ? 'an' : '', title: 'Einzelne Seiten', onclick: () => { heft.ansicht = 'seiten'; speichere(heft); zeichne(); } }, 'Seiten'),
        el('button', { class: heft.ansicht === 'rolle' ? 'an' : '', title: 'Seite für Seite untereinander', onclick: () => { heft.ansicht = 'rolle'; speichere(heft); zeichne(); } }, 'Rolle'),
        el('button', { class: heft.ansicht === 'fluss' ? 'an' : '', title: 'Eine einzige lange Seite, ohne Umbruch', onclick: () => { heft.ansicht = 'fluss'; speichere(heft); zeichne(); } }, 'Am Stück')),
      el('button', { class: 'rundknopf zart', html: ik('inhalt'), title: 'Inhalt: alle Seiten', onclick: () => heftInhalt(heft, (seite) => {
        sessionStorage.setItem('zielSeite', seite.id); zeichne();
      }) }),
      heftHatUeberschriften(heft) ? el('button', { class: 'rundknopf zart', html: ik('gliederung'), title: 'Gliederung aus Überschriften', onclick: () => heftGliederung(heft) }) : null,
      el('button', { class: 'rundknopf zart', html: ik('mehr'), title: 'Heft-Menü', onclick: () => heftMenue(heft, () => zeichne()) }))
  ));
  /* Farbige Reiter: springen zu ihren Seiten — in jeder Ansicht. */
  if (Array.isArray(heft.reiter) && heft.reiter.length) {
    const leiste = el('div', { class: 'heftreiter-leiste' });
    for (const r of heft.reiter) {
      const si = seiten.findIndex((x) => x.id === r.seite);
      if (si < 0) continue;
      leiste.append(el('button', { class: 'heftreiter ' + (r.farbe || 'rot'), title: 'Seite ' + (si + 1), onclick: () => { sessionStorage.setItem('zielSeite', r.seite); sessionStorage.setItem('heftSeite:' + heftId, String(si)); zeichne(); } },
        el('b', {}, String(si + 1)), r.name || ''));
    }
    haupt.append(leiste);
  }

  const inhalt = el('div', { class: 'inhalt' });
  const halter = el('div', { class: 'seitenhalter' });
  const fuss = el('div', { class: 'seitenfuss' });
  inhalt.append(halter, fuss);
  haupt.append(inhalt);

  function zeigeRolle() {
    seiten = kinder(heft.id, 'seite');
    { const z = zielAufnehmen(); if (z) springZu = z; }
    halter.className = 'heftrolle ' + (heft.papier || 'liniert') + ' papierfarbe-' + (heft.papierfarbe || 'hell') + (heft.rand ? ' mit-rand' : '') + (heft.rollenGrenzen ? ' zeigt-grenzen' : '');
    fuss.style.display = 'none'; halter.innerHTML = '';
    /* Ein Werkzeug für die ganze Rolle: es wirkt auf die Seite, in der gerade
       geschrieben wird — sonst auf die letzte. */
    const aktuellesStueck = () => {
      const aktiv = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.papierseite') : null;
      const blatt = (aktiv && halter.contains(aktiv)) ? aktiv : $$('.papierseite', halter).pop();
      if (!blatt) return null;
      const s = D.docs.get(blatt.dataset.seite);
      return s ? { seite: s, blatt, heft } : null;
    };
    halter.append(seitenWerkzeuge(aktuellesStueck, { neuZeichnen: zeigeRolle, klasse: 'fluss-werkzeuge' }));
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
    scrolleZuZiel();
  }

  /* Am Stück: alles Geschriebene auf einer einzigen langen Seite. Kein Umbruch,
     keine Seitenkanten dazwischen — zum Lesen und zum Hineinschütten großer
     Textmengen aus anderen Apps. */
  function zeigeFluss() {
    seiten = kinder(heft.id, 'seite');
    { const z = zielAufnehmen(); if (z) springZu = z; }
    halter.className = 'heftfluss'; fuss.style.display = 'none'; halter.innerHTML = '';
    const bogen = el('div', { class: 'fluss-bogen ' + (heft.papier || 'liniert') + ' papierfarbe-' + (heft.papierfarbe || 'hell') + (heft.rand ? ' mit-rand' : '') });
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
    scrolleZuZiel();
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
    { const z = zielAufnehmen(); if (z) { const zi = seiten.findIndex((s) => s.id === z); if (zi >= 0) idx = zi; } }
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
        if (weiter && weiter.still && naechste && !leerUndFrei && naechste.format === paket.format && !naechste.titel) {
          /* Stilles Weiterreichen: der Überhang kommt VOR den Anfang der
             nächsten Seite — wie im Heft, wenn man oben Platz braucht. */
          if (paket.format === 'rich') { naechste.rich = paket.rich + (naechste.rich || ''); naechste.text = richReinerText(naechste.rich).trimEnd(); }
          else naechste.text = paket.text + (naechste.text ? '\n' + naechste.text : '');
          speichere(naechste);
        } else if (!leerUndFrei) {
          for (let i = seiten.length - 1; i > idx; i--) { seiten[i].ord = i + 1; speichereStill(seiten[i]); }
          naechste = neuDoc('seite', { parent: heft.id, ord: idx + 1, titel: '', text: paket.text, rich: paket.rich, format: paket.format });
        } else {
          naechste.text = paket.text; naechste.rich = paket.rich; naechste.format = paket.format;
          speichere(naechste); D.stats.letzte[naechste.id] = worte(paket.text);
        }
        heft.geaendert = Date.now(); speichereStill(heft);
        if (weiter && weiter.still) {
          /* Der Überhang liegt jetzt auf der nächsten Seite; hier bleibt alles. */
          seiten = kinder(heft.id, 'seite');
          return;
        }
        idx++;
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
        /* Die sichtbare Seitenzahl und der Cursor zeigen den Wechsel bereits.
           Bei einem langen Paste können hier in wenigen Augenblicken viele
           Seiten entstehen; ein Toast pro Seite würde danach noch über ganz
           anderen Räumen hängen und die App scheinbar blockieren. */
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

/* Das Inhaltsverzeichnis: jede Seite mit Titel oder erster Zeile, Wörtern und
   Lesezeichen. Ein Tipp springt hin — in jeder Ansicht. */
function heftInhalt(heft, wohin) {
  const seiten = kinder(heft.id, 'seite');
  return menue(seiten.map((s, i) => {
    const erste = (s.titel || (s.text || '').trim().split('\n').find((z) => z.trim()) || '').trim();
    const w = worte(s.text);
    const anlagen = kinder(s.id).length;
    return {
      text: (i + 1) + ' · ' + (erste ? erste.slice(0, 44) : 'Leere Seite') + (w ? '  —  ' + w + ' W.' : '') + (anlagen ? ' · ' + anlagen + ' angeklebt' : ''),
      icon: heft.lesezeichen === s.id ? 'lesezeichen' : (s.skizze ? 'stift' : null), wert: s.id
    };
  }), 'Inhalt · ' + seiten.length + (seiten.length === 1 ? ' Seite' : ' Seiten')).then((id) => {
    const seite = id && D.docs.get(id);
    if (seite && wohin) wohin(seite);
  });
}

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
    el('button', { class: 'rundknopf', title: 'Sticker aufkleben', html: ik('sticker'), onclick: async () => {
      const z = ziel(); if (!z) return;
      const s = await stickerAufkleben(z.seite);
      if (s) auffrischen();
    } }),
    tonUnterstuetzt() ? el('button', { class: 'rundknopf', title: 'Tonnotiz aufnehmen', html: ik('mikro'), onclick: async () => {
      const z = ziel(); if (!z) return;
      const t = await tonAufnehmen();
      if (!t) return;
      neuDoc('ton', { parent: z.seite.id, datei: t.datei, dauer: t.dauer, mime: t.mime, befestigung: 'tesa', pos: { x: 50 + Math.random() * 25, y: 68 + Math.random() * 14, rot: -3 + Math.random() * 6, w: 36 } });
      auffrischen();
    } }) : null,
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
        const geschwister = kinder(z.heft.id, 'seite');
        const i = geschwister.findIndex((x) => x.id === z.seite.id);
        const istLesezeichen = z.heft.lesezeichen === z.seite.id;
        const wahl = await menue([
          { text: 'Im Schreibraum öffnen', icon: 'stift', wert: 'sr' },
          { text: istLesezeichen ? 'Lesezeichen entfernen' : 'Lesezeichen hierher', icon: 'lesezeichen', wert: 'lesezeichen' },
          { text: (z.heft.reiter || []).some((r) => r.seite === z.seite.id) ? 'Reiter abnehmen' : 'Farbigen Reiter anheften', icon: 'lesezeichen', wert: 'reiter' },
          i > 0 ? { text: 'Seite nach vorn', icon: 'auf', wert: 'vor' } : null,
          i < geschwister.length - 1 ? { text: 'Seite nach hinten', icon: 'ab', wert: 'zurueck' } : null,
          { text: 'Seite verdoppeln', icon: 'wandel', wert: 'doppel' },
          { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'dazu' },
          { text: 'Als loses Blatt herausnehmen', icon: 'blatt', wert: 'blatt' },
          { text: 'Seite herausreißen', icon: 'muell', wert: 'weg', rot: true }
        ], 'Seite ' + (i + 1) + ' von ' + geschwister.length);
        if (wahl === 'sr') oeffneSchreibraum(z.seite.id);
        else if (wahl === 'reiter') {
          const reiter = Array.isArray(z.heft.reiter) ? z.heft.reiter : [];
          const da = reiter.findIndex((r) => r.seite === z.seite.id);
          if (da >= 0) { reiter.splice(da, 1); z.heft.reiter = reiter; speichereStill(z.heft); toast('Reiter abgenommen.'); }
          else {
            const farbe = await menue(REITERFARBEN.map(([id, name]) => ({ text: name, icon: 'lesezeichen', wert: id })), 'Welche Farbe?');
            if (!farbe) return;
            const name = await eingabe({ titel: 'Was steht auf dem Reiter?', wert: (z.seite.titel || '').slice(0, 24), platzhalter: 'kurz — z. B. Figuren', ok: 'Anheften' });
            if (name === null) return;
            reiter.push({ seite: z.seite.id, farbe, name: (name || '').slice(0, 40) });
            z.heft.reiter = reiter.slice(0, 40); speichereStill(z.heft);
            toast('Reiter hängt an Seite ' + (i + 1) + '.');
          }
          if (neuZeichnen) neuZeichnen();
        }
        else if (wahl === 'lesezeichen') {
          if (istLesezeichen) delete z.heft.lesezeichen; else z.heft.lesezeichen = z.seite.id;
          speichereStill(z.heft);
          toast(istLesezeichen ? 'Lesezeichen entfernt.' : 'Lesezeichen liegt auf Seite ' + (i + 1) + '. Das Heft öffnet sich hier.');
          if (neuZeichnen) neuZeichnen();
        } else if (wahl === 'vor' || wahl === 'zurueck') {
          const j = wahl === 'vor' ? i - 1 : i + 1;
          geschwister.forEach((x, n) => { x.ord = n; });
          [geschwister[i].ord, geschwister[j].ord] = [j, i];
          geschwister.forEach((x) => speichereStill(x));
          sessionStorage.setItem('zielSeite', z.seite.id);
          if (neuZeichnen) neuZeichnen();
        } else if (wahl === 'doppel') {
          geschwister.forEach((x, n) => { x.ord = n >= i + 1 ? n + 1 : n; speichereStill(x); });
          const kopie = neuDoc('seite', { parent: z.heft.id, ord: i + 1, titel: z.seite.titel ? z.seite.titel + ' (Abschrift)' : '', text: z.seite.text || '', rich: z.seite.rich || '', format: z.seite.format || 'plain' });
          for (const a of kinder(z.seite.id)) {
            if (a.typ === 'zettel') neuDoc('zettel', { parent: kopie.id, text: a.text, farbe: a.farbe, schrift: a.schrift, befestigung: a.befestigung, pos: Object.assign({}, a.pos) });
            else if (a.typ === 'sticker') neuDoc('sticker', { parent: kopie.id, bild: a.bild, verhaeltnis: a.verhaeltnis, befestigung: 'lose', pos: Object.assign({}, a.pos) });
          }
          sessionStorage.setItem('zielSeite', kopie.id);
          toast('Verdoppelt. Fotos und Kritzeleien bleiben beim Original.');
          if (neuZeichnen) neuZeichnen();
        }
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
  const blatt = el('div', { class: papierKlassen(heft, optionen.fluss ? ' fluss' : ''), 'data-seite': seite.id });

  /* Werkzeuge: auf einer einzelnen Seite oben rechts auf dem Papier. In der
     Ansicht „Am Stück“ gibt es sie nur einmal ganz oben — dort ist alles eine
     einzige lange Seite, und eine Werkzeugreihe je Stück wäre bloß Lärm. */
  /* Eine Werkzeugreihe je Seite gibt es nur in der Einzelansicht. Rolle und
     „Am Stück“ sind ein einziger Text — dort steht sie einmal oben rechts. */
  const werkzeuge = (optionen.fluss || optionen.rolle) ? null : seitenWerkzeuge(
    () => ({ seite, blatt, heft }), { neuZeichnen, frisch: () => baueAnlagen() });

  /* Titel + Text */
  const titel = el('input', { class: 'stitel serif', type: 'text', value: seite.titel || '', placeholder: 'Überschrift, wenn du magst' });
  titel.addEventListener('input', entprellt(() => { seite.titel = titel.value; speichere(seite); }, 400, () => titel.isConnected));

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
        /* Steht der Cursor am Ende, folgt er dem Text auf die nächste Seite.
           Schreibt man mittendrin auf einer vollen Seite, wandert nur der
           Überhang still hinüber — die Seite bleibt, die Tastatur auch. */
        const amEnde = (() => { try { const s = window.getSelection(); if (!s || !s.rangeCount || !text.contains(s.anchorNode)) return true; const r = s.getRangeAt(0).cloneRange(); r.selectNodeContents(text); r.setStart(s.getRangeAt(0).endContainer, s.getRangeAt(0).endOffset); return r.toString().trim().length === 0; } catch (e) { return true; } })();
        const cursorIm = amEnde ? null : (() => { try { const s = window.getSelection(); const r = s.getRangeAt(0).cloneRange(); r.selectNodeContents(text); r.setEnd(s.getRangeAt(0).startContainer, s.getRangeAt(0).startOffset); return r.toString().length; } catch (e) { return null; } })();
        const still = !amEnde && cursorIm !== null && cursorIm < richReinerText(teil.hier).length;
        richBlaettert = true; rp.sichern.sofort();
        if (still) {
          /* Cursor retten: Textposition merken, Inhalt kürzen, Cursor zurücksetzen. */
          text.innerHTML = teil.hier; seite.rich = teil.hier; seite.text = richReinerText(teil.hier).trimEnd(); seite.format = 'rich'; speichere(seite);
          D.stats.letzte[seite.id] = worte(seite.text); speichereStats();
          try {
            const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT); let rest = cursorIm, knoten = null;
            while ((knoten = walker.nextNode())) { if (rest <= knoten.nodeValue.length) break; rest -= knoten.nodeValue.length; }
            if (knoten) { const r = document.createRange(); r.setStart(knoten, Math.max(0, Math.min(rest, knoten.nodeValue.length))); r.collapse(true); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
          } catch (e) {}
          optionen.autoWeiter({ rich: teil.weiter, text: richReinerText(teil.weiter).trimStart(), format: 'rich', still: true });
          richBlaettert = false;
          return;
        }
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
    }, 400, () => text.isConnected);
    let blaettert = false;
    text.addEventListener('input', () => {
      sichereText();
      if (!optionen.autoWeiter || blaettert) return;
      const mittendrin = text.selectionStart < text.value.length - 2;
      requestAnimationFrame(() => {
        if (blaettert || !text.isConnected) return;
        if (mittendrin) {
          /* Volle Seite, Cursor mittendrin: nur der Überhang geht still weiter. */
          if (text.scrollHeight <= text.clientHeight + 2) return;
          const passtStill = (wert) => { const messer = text.cloneNode(); messer.className = text.className; messer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:auto;min-height:0;max-height:none;overflow:hidden;width:' + text.clientWidth + 'px'; messer.value = wert; blatt.append(messer); const ok = messer.scrollHeight <= text.clientHeight + 2; messer.remove(); return ok; };
          const teilStill = seitenUmbruch(text.value, passtStill);
          if (!teilStill || text.selectionStart > teilStill.hier.length) return;
          const c = text.selectionStart;
          sichereText.sofort();
          text.value = teilStill.hier; seite.text = teilStill.hier; speichere(seite);
          D.stats.letzte[seite.id] = worte(teilStill.hier); speichereStats();
          text.setSelectionRange(c, c);
          optionen.autoWeiter({ text: teilStill.weiter, rich: '', format: 'plain', still: true });
          return;
        }
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
     den sichtbaren Text „null“ — auf jeder schlichten Heftseite. */
  blatt.append(...[skizzenbild, titel, formatleiste, text, werkzeuge].filter(Boolean));
  /* Aus der Gliederung kommend: zur n-ten Überschrift dieser Seite scrollen. */
  const zielUe = sessionStorage.getItem('zielUeberschrift');
  if (zielUe !== null && sessionStorage.getItem('zielSeiteGerade') !== seite.id) {
    const wartend = sessionStorage.getItem('zielSeite');
    if (!wartend) {
      sessionStorage.removeItem('zielUeberschrift');
      requestAnimationFrame(() => { const u = $$('h1,h2,h3', text)[Number(zielUe)]; if (u) u.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    }
  }

  /* Angeklebtes */
  function baueAnlagen() {
    $$('.anlage', blatt).forEach((a) => a.remove());
    for (const a of kinder(seite.id)) {
      if (a.typ === 'zettel') blatt.append(baueZettel(a, blatt, baueAnlagen));
      else if (a.typ === 'foto') blatt.append(baueFoto(a, blatt, baueAnlagen));
      else if (a.typ === 'sticker') blatt.append(baueSticker(a, blatt, baueAnlagen));
      else if (a.typ === 'ton') blatt.append(baueTon(a, blatt, baueAnlagen));
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
    /* Über den Rand hinaus ist erlaubt — nur nicht ganz weg. */
    a.pos.x = Math.max(-30, Math.min(100, zieht.px + dx / zieht.r.width * 100));
    a.pos.y = Math.max(-14, Math.min(106, zieht.py + dy / zieht.r.height * 100));
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
    a.pos.w = Math.max(a.typ === 'sticker' ? 6 : 12, Math.min(92, groesse.w + (e.clientX - groesse.sx) / groesse.r.width * 100));
    elem.style.width = a.pos.w + '%';
  });
  const groesseEnde = () => { if (groesse) speichereStill(a); groesse = null; };
  griff.addEventListener('pointerup', groesseEnde);
  griff.addEventListener('pointercancel', groesseEnde);
  elem.append(griff);

  /* Drehgriff: um die Mitte drehen, nahe null rastet es gerade ein. */
  const dreh = el('div', { class: 'drehgriff', html: ik('drehen'), title: 'Drehen' });
  let drehung = null;
  dreh.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); e.preventDefault();
    const r = elem.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    drehung = { cx, cy, start: Math.atan2(e.clientY - cy, e.clientX - cx), rot0: a.pos.rot || 0 };
    try { dreh.setPointerCapture(e.pointerId); } catch (x) {}
  });
  dreh.addEventListener('pointermove', (e) => {
    if (!drehung) return;
    const w = Math.atan2(e.clientY - drehung.cy, e.clientX - drehung.cx);
    let grad = drehung.rot0 + (w - drehung.start) * 180 / Math.PI;
    grad = ((grad + 180) % 360 + 360) % 360 - 180;
    if (Math.abs(grad) < 2.5) grad = 0;
    a.pos.rot = Math.round(grad * 10) / 10;
    elem.style.transform = 'rotate(' + a.pos.rot + 'deg)';
  });
  const drehEnde = () => { if (drehung) speichereStill(a); drehung = null; };
  dreh.addEventListener('pointerup', drehEnde); dreh.addEventListener('pointercancel', drehEnde);
  elem.append(dreh);

  langdruck(elem, async () => {
    const inKiste = a.typ === 'sticker' && vomTyp('stickervorlage').some((v) => v.bild === a.bild);
    const wahl = await menue([
      a.typ === 'sticker' && !inKiste ? { text: 'In die Stickerkiste legen', icon: 'archiv', wert: 'kiste' } : null,
      a.typ === 'sticker' ? { text: 'Noch einmal aufkleben', icon: 'plus', wert: 'nochmal' } : null,
      a.typ === 'ton' ? { text: 'Beschriften', icon: 'stift', wert: 'label' } : null,
      a.typ === 'zettel' ? { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' } : null,
      a.typ === 'zettel' ? { text: 'Schrift: ' + ({ hand: 'Handschrift', klar: 'Klar', serif: 'Serife' }[a.schrift || 'hand']), icon: 'stift', wert: 'schrift' } : null,
      a.typ === 'zettel' ? { text: 'Form: ' + (a.pos.w <= 24 ? 'schmal' : a.pos.w >= 44 ? 'breit' : 'normal'), icon: 'wandel', wert: 'form' } : null,
      { text: 'Befestigung: ' + ({ tesa: 'Tesa', pin: 'Reißzwecke', lose: 'lose aufgelegt' }[a.befestigung || 'tesa']), icon: 'pin', wert: 'befestigung' },
      { text: 'Etwas drehen', icon: 'drehen', wert: 'drehen' },
      { text: 'Gerade rücken', icon: 'ausBlock', wert: 'gerade' },
      { text: 'Abmachen', icon: 'muell', wert: 'weg', rot: true }
    ]);
    if (wahl === 'kiste') {
      neuDoc('stickervorlage', { bild: a.bild, verhaeltnis: a.verhaeltnis, zuletzt: Date.now() });
      toast('Liegt in der Stickerkiste.');
    } else if (wahl === 'label') {
      const n = await eingabe({ titel: 'Wie heißt die Tonnotiz?', wert: a.label || '', platzhalter: 'z. B. Tonfall Kapitel 3' });
      if (n != null) { a.label = n; speichereStill(a); neuBauen(); }
    } else if (wahl === 'nochmal') {
      neuDoc('sticker', { parent: a.parent, bild: a.bild, verhaeltnis: a.verhaeltnis, befestigung: 'lose', pos: { x: Math.min(90, a.pos.x + 8), y: Math.min(100, a.pos.y + 8), rot: a.pos.rot, w: a.pos.w } });
      neuBauen();
    } else if (wahl === 'farbe') {
      a.farbe = ZETTELFARBEN[(ZETTELFARBEN.indexOf(a.farbe) + 1) % ZETTELFARBEN.length];
      speichereStill(a); neuBauen();
    } else if (wahl === 'schrift') {
      a.schrift = { hand: 'klar', klar: 'serif', serif: 'hand' }[a.schrift || 'hand'];
      speichereStill(a); neuBauen();
    } else if (wahl === 'form') {
      a.pos.w = a.pos.w <= 24 ? 30 : a.pos.w >= 44 ? 22 : 46;
      speichereStill(a); neuBauen();
    } else if (wahl === 'gerade') {
      a.pos.rot = 0; speichereStill(a);
      elem.style.transform = 'rotate(0deg)';
    } else if (wahl === 'befestigung') {
      a.befestigung = { tesa: 'pin', pin: 'lose', lose: 'tesa' }[a.befestigung || 'tesa']; speichereStill(a); neuBauen();
    } else if (wahl === 'drehen') {
      a.pos.rot = ((a.pos.rot || 0) + 4.5);
      if (a.pos.rot > 10) a.pos.rot = -9;
      speichereStill(a);
      elem.style.transform = 'rotate(' + a.pos.rot + 'deg)';
    } else if (wahl === 'weg') {
      if (await frage(a.typ === 'zettel' ? 'Zettel abmachen und wegwerfen?' : a.typ === 'sticker' ? 'Sticker abmachen?' : a.typ === 'ton' ? 'Tonnotiz abmachen? Die Aufnahme geht mit.' : 'Foto abmachen?', { ja: 'Abmachen', gefahr: true })) {
        await loesche(a.id); neuBauen();
      }
    }
  });
}

const ZETTELFARBEN = ['gelb', 'rosa', 'blau', 'gruen', 'orange', 'lila', 'weiss', 'grau'];
function baueZettel(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage befestigung-' + (a.befestigung || 'tesa') });
  positioniere(halter, a);
  const z = el('div', { class: 'zettel ' + (ZETTELFARBEN.includes(a.farbe) ? a.farbe : 'gelb') + ' schrift-' + (a.schrift || 'hand') });
  const ta = el('textarea', { placeholder: '…', rows: 1 });
  ta.value = a.text || '';
  autogrow(ta);
  ta.addEventListener('input', entprellt(() => { a.text = ta.value; speichereStill(a); }, 400, () => ta.isConnected));
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
  /* Lasso und Formen: Striche sind Punktfolgen und bleiben greifbar. */
  let werkzeug = 'stift';
  let lasso = null, auswahl = [], zieheAuswahl = null, formTimer = null;

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
    /* Auswahlrahmen und Lasso-Schlinge — nur Anzeige, nie im gespeicherten Bild. */
    if (auswahl.length) {
      const box = strichBox(auswahl.map((i) => striche[i]).filter(Boolean));
      if (box) {
        ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(60,100,200,.9)'; ctx.lineWidth = 1.2;
        ctx.strokeRect(box.x0 * breite - 6, box.y0 * breite - 6, box.w * breite + 12, box.h * breite + 12);
        ctx.restore();
      }
    }
    if (lasso && lasso.length > 1) {
      ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(60,100,200,.9)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(lasso[0].x * breite, lasso[0].y * breite);
      for (const q of lasso) ctx.lineTo(q.x * breite, q.y * breite);
      ctx.stroke(); ctx.restore();
    }
  }
  function auswahlLeisteAuffrischen() {
    const an = auswahl.length > 0;
    for (const k of [auswahlWegKnopf, auswahlFarbeKnopf, auswahlAufhebenKnopf]) { k.disabled = !an; k.style.opacity = an ? '' : '.35'; }
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
    if (werkzeug === 'lasso') {
      /* In der Auswahl angefasst: verschieben. Sonst: neue Schlinge ziehen. */
      const box = auswahl.length ? strichBox(auswahl.map((i) => striche[i]).filter(Boolean)) : null;
      if (box && p.x >= box.x0 - .01 && p.x <= box.x1 + .01 && p.y >= box.y0 - .01 && p.y <= box.y1 + .01) {
        zieheAuswahl = { sx: p.x, sy: p.y, vorher: striche };
      } else { auswahl = []; lasso = [p]; }
      alleszeichnen(); auswahlLeisteAuffrischen();
      e.preventDefault();
      return;
    }
    strich = { farbe, radierer, punkte: [{ x: p.x, y: p.y, w: strichbreite(e) }] };
    striche.push(strich);
    zurueckgelegt = [];
    kritzelZeichneStrich(ctx, strich, breite);
    ctx.globalCompositeOperation = 'source-over';
    knoepfeAuffrischen();
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (werkzeug === 'lasso') {
      const p = punktAus(e);
      if (zieheAuswahl) { striche = stricheVerschieben(zieheAuswahl.vorher, auswahl, p.x - zieheAuswahl.sx, p.y - zieheAuswahl.sy); alleszeichnen(); }
      else if (lasso) { lasso.push(p); alleszeichnen(); }
      return;
    }
    if (!strich || strich.geformt) return;
    /* Form halten: bleibt der Stift am Ende kurz stehen, wird der Strich zur Form. */
    clearTimeout(formTimer);
    formTimer = setTimeout(() => {
      if (!strich || strich.geformt || strich.radierer) return;
      const f = formErkennen(strich.punkte);
      if (!f) return;
      strich.punkte = f.punkte; strich.geformt = true; alleszeichnen();
    }, 560);
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
  const strichEnde = () => {
    clearTimeout(formTimer);
    if (werkzeug === 'lasso') {
      if (lasso) { auswahl = stricheImLasso(striche, lasso); lasso = null; if (!auswahl.length) toast('Nichts in der Schlinge.'); }
      zieheAuswahl = null; alleszeichnen(); auswahlLeisteAuffrischen();
    }
    strich = null;
  };
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
  const lassoKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('lasso'), title: 'Lasso: Striche greifen, verschieben, löschen', onclick: () => {
      werkzeug = werkzeug === 'lasso' ? 'stift' : 'lasso';
      lassoKnopf.classList.toggle('an', werkzeug === 'lasso');
      if (werkzeug !== 'lasso') { auswahl = []; lasso = null; }
      canvas.style.cursor = werkzeug === 'lasso' ? 'crosshair' : '';
      alleszeichnen(); auswahlLeisteAuffrischen();
      if (werkzeug === 'lasso') toast('Eine Schlinge um Striche ziehen. Dann anfassen und verschieben, oder löschen.', 3600);
    }
  });
  const auswahlWegKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('kreuz'), title: 'Ausgewählte Striche löschen', onclick: () => {
      if (!auswahl.length) return;
      const menge = new Set(auswahl);
      striche = striche.filter((s, i) => !menge.has(i)); auswahl = []; zurueckgelegt = [];
      alleszeichnen(); knoepfeAuffrischen(); auswahlLeisteAuffrischen();
    }
  });
  const auswahlFarbeKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('farbe'), title: 'Ausgewählte Striche in der Stiftfarbe', onclick: () => {
      if (!auswahl.length) return;
      const menge = new Set(auswahl);
      striche = striche.map((s, i) => menge.has(i) && !s.radierer ? { ...s, farbe } : s);
      alleszeichnen();
    }
  });
  const auswahlAufhebenKnopf = el('button', {
    class: 'rundknopf kritzel-werkzeug', html: ik('haken'), title: 'Auswahl aufheben', onclick: () => { auswahl = []; alleszeichnen(); auswahlLeisteAuffrischen(); }
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

  const beiWeg = () => aufraeumen();
  window.addEventListener('hashchange', beiWeg);
  const aufraeumen = () => {
    try { beobachter.disconnect(); } catch (e) {}
    window.removeEventListener('resize', beiGroesse); window.removeEventListener('hashchange', beiWeg);
    leiste.remove(); canvas.remove();
  };
  const fertigKnopf = el('button', {
    class: 'knopf voll', style: 'padding:7px 14px', onclick: async () => {
      const leer = !striche.length && !basis;
      /* Ein altes Bild ohne Striche bleibt als Grundlage erhalten — unter
         eigener Kennung, damit das fertige Bild darüber nicht die Grundlage
         überschreibt und beim nächsten Öffnen alles doppelt dasteht. */
      /* „Alles löschen“ gilt auch für die Grundlage: sonst taucht das alte Bild beim nächsten Strich wieder auf */
      const geleert = striche.some((s) => s && s.leeren);
      if (geleert) { basis = null; if (seite.skizzeBasis) { dbDel('media', seite.skizzeBasis).catch(() => {}); delete seite.skizzeBasis; } }
      if (basis && seite.skizze && !seite.skizzeBasis) {
        try { const alt = await dbGet('media', seite.skizze); if (alt) { const neuId = uid(); await dbPut('media', alt, neuId); seite.skizzeBasis = neuId; if (typeof syncMediaGeaendert === 'function') syncMediaGeaendert(neuId); } } catch (x) {}
      }
      auswahl = []; lasso = null; alleszeichnen();
      seite.striche = leer ? [] : saubereStriche(striche.map((s) => strichVerdichten(s)));
      const neuId = leer ? seite.skizze : await speichereKritzelei(canvas, seite.skizze);
      if (!leer && !neuId) toast('Das Bild ließ sich nicht sichern — die Striche selbst sind gespeichert.'); else seite.skizze = neuId;
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
    radierKnopf, lassoKnopf,
    el('span', { class: 'kritzel-trenner' }),
    zurueckKnopf, vorKnopf, leerKnopf,
    el('span', { class: 'kritzel-trenner' }),
    auswahlWegKnopf, auswahlFarbeKnopf, auswahlAufhebenKnopf,
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

  /* Gespeicherte Striche sind die Wahrheit; ein altes Bild ist nur noch
     Grundlage (skizzeBasis) oder, ganz ohne Striche, das Einzige, was es gibt. */
  const hatStriche = Array.isArray(seite.striche) && seite.striche.length > 0;
  if (hatStriche) striche = seite.striche.map((s) => ({ ...s, punkte: (s.punkte || []).map((q) => ({ ...q })) }));
  const basisId = hatStriche ? seite.skizzeBasis : seite.skizze;
  if (basisId) {
    const url = await bildURL(basisId);
    if (url && canvas.isConnected) {
      const alt = new Image();
      await new Promise((res) => { alt.onload = res; alt.onerror = res; alt.src = url; });
      if (alt.width && alt.height) basis = alt;
    }
  }
  if (!canvas.isConnected) { aufraeumen(); return; }
  messen(); alleszeichnen(); knoepfeAuffrischen(); auswahlLeisteAuffrischen();
}

/* ----- Reiter und Gliederung ----- */
const REITERFARBEN = [['rot', 'Rot'], ['gelb', 'Gelb'], ['gruen', 'Grün'], ['blau', 'Blau'], ['lila', 'Lila'], ['grau', 'Grau']];

function heftHatUeberschriften(heft) {
  return kinder(heft.id, 'seite').some((s) => s.format === 'rich' && /<h[1-3][\s>]/i.test(s.rich || ''));
}

/* Gliederung: alle Überschriften aller Seiten, eingerückt nach Ebene; antippen
   springt zur Seite und scrollt zur Überschrift. */
function heftGliederung(heft) {
  const seiten = kinder(heft.id, 'seite');
  const liste = el('div', { class: 'gliederung' });
  let gesamt = 0;
  seiten.forEach((s, i) => {
    const ue = s.format === 'rich' ? gliederungAusHTML(s.rich) : [];
    if (!ue.length && !s.titel) return;
    liste.append(el('div', { class: 'gliederung-seite' }, 'Seite ' + (i + 1) + (s.titel ? ' · ' + s.titel : '')));
    ue.forEach((u, n) => {
      gesamt++;
      liste.append(el('button', { class: 'gliederung-punkt ebene-' + u.ebene, onclick: () => {
        zu(); sessionStorage.setItem('zielSeite', s.id); sessionStorage.setItem('zielUeberschrift', String(n)); zeichne();
      } }, u.text));
    });
  });
  if (!gesamt) { toast('Noch keine Überschriften — mit „Ü“ in der Formatleiste entstehen sie.'); return; }
  const kasten = el('div', { class: 'modal gliederung-kasten' }, el('h2', {}, 'Gliederung'), liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Schließen')));
  const zu = zeigeDeck(kasten);
}
