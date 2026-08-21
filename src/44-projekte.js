/* ================================================================
   VANI — Projekte: Kapitel, Szenen, Pinnwand, Leseansicht
   ================================================================ */

function projektWorte(p) {
  let n = 0;
  for (const d of D.docs.values()) if (d.typ === 'szene' && d.projekt === p.id) n += worte(d.text);
  return n;
}

RENDER.projekte = function (haupt) {
  haupt.append(raumkopf('Projekte', null,
    el('button', { class: 'rundknopf voll', html: ik('plus'), title: 'Neues Projekt', onclick: () => neuesProjekt() })
  ));
  const inhalt = el('div', { class: 'inhalt' });
  const alle = vomTyp('projekt');

  if (!alle.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Hier entsteht Größeres.',
      el('div', { class: 'klein' }, 'Ein Roman, eine Sammlung, eine Welt — alles fängt mit einem Namen an.')));
  }

  const liste = el('div', { class: 'projektliste' });
  for (const p of alle) {
    const w = projektWorte(p);
    const szenen = [...D.docs.values()].filter((d) => d.typ === 'szene' && d.projekt === p.id).length;
    const karte = el('button', { class: 'karte projektkarte', onclick: () => { location.hash = '#/projekt/' + p.id; } },
      el('div', { class: 'pzeile1' },
        el('h3', {}, p.titel),
        el('span', { class: 'artmarke' }, p.art || 'Projekt')
      ),
      el('div', { class: 'pzahlen' },
        w.toLocaleString('de-DE') + ' Wörter · ' + (szenen === 1 ? 'eine Szene' : szenen + ' Szenen') + ' · ' + vorZeit(p.geaendert)),
      p.ziel ? el('div', { class: 'zielbalken' }, el('i', { style: 'width:' + Math.min(100, Math.round(w / p.ziel * 100)) + '%' })) : null
    );
    langdruck(karte, () => projektMenue(p, () => zeichne()));
    liste.append(karte);
  }
  inhalt.append(liste);
  haupt.append(inhalt);
};

function neuesProjekt() {
  let art = 'Roman';
  const name = el('input', { type: 'text', placeholder: 'Der Arbeitstitel' });
  const ziel = el('input', { type: 'text', inputmode: 'numeric', placeholder: 'Wortziel — leer lassen ist auch gut' });
  const artWahl = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' },
    PROJEKT_ARTEN.map((a) => el('button', {
      class: a === art ? 'an' : '', onclick: (e) => {
        art = a;
        $$('button', artWahl).forEach((b) => b.classList.toggle('an', b === e.currentTarget));
      }
    }, a))
  );
  const kasten = el('div', { class: 'modal' },
    el('h2', {}, 'Etwas Neues, Größeres'),
    name,
    el('div', { style: 'margin-top:12px' }, artWahl),
    el('div', { style: 'margin-top:12px' }, ziel),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', {
        class: 'knopf voll', onclick: () => {
          const t = name.value.trim();
          if (!t) return;
          const p = neuDoc('projekt', { titel: t, art, ziel: parseInt(ziel.value, 10) || 0 });
          neuDoc('kapitel', { parent: p.id, titel: 'Kapitel 1', ord: 0 });
          zu();
          location.hash = '#/projekt/' + p.id;
        }
      }, 'Anlegen')
    )
  );
  const zu = zeigeDeck(kasten);
  setTimeout(() => name.focus(), 60);
}

async function projektMenue(p, danach) {
  const wahl = await menue([
    { text: 'Umbenennen', icon: 'stift', wert: 'name' },
    { text: 'Wortziel: ' + (p.ziel ? p.ziel.toLocaleString('de-DE') : 'keins'), icon: 'ziel', wert: 'ziel' },
    { text: 'Leseansicht', icon: 'lesen', wert: 'lesen' },
    { text: 'Verbindungen ansehen', icon: 'verbinden', wert: 'bezug' },
    { text: 'Projekt löschen', icon: 'muell', wert: 'weg', rot: true }
  ], p.titel);
  if (wahl === 'name') {
    const neu = await eingabe({ titel: 'Das Projekt heißt jetzt …', wert: p.titel });
    if (neu) { p.titel = neu; speichere(p); }
  } else if (wahl === 'ziel') {
    const neu = await eingabe({ titel: 'Wortziel (0 = keins)', wert: String(p.ziel || '') });
    if (neu !== null) { p.ziel = parseInt(neu, 10) || 0; speichereStill(p); }
  } else if (wahl === 'lesen') {
    zeigeLeseansicht(p);
    return;
  } else if (wahl === 'bezug') {
    zeigeBeziehungen(p);
    return;
  } else if (wahl === 'weg') {
    if (await frage('„' + p.titel + '" mit allem darin in den Papierkorb legen?', { ja: 'In den Papierkorb', gefahr: true })) {
      await loesche(p.id);
      location.hash = '#/projekte';
      return;
    }
  }
  if (danach) danach();
}

RENDER.projekt = function (haupt, pid) {
  const p = D.docs.get(pid);
  if (!p) { location.hash = '#/projekte'; return; }
  const w = projektWorte(p);

  haupt.append(el('div', { class: 'kopf' },
    zurueckknopf('#/projekte'),
    el('h1', {}, p.titel, el('div', { class: 'unter' },
      w.toLocaleString('de-DE') + ' Wörter' + (p.ziel ? ' von ' + p.ziel.toLocaleString('de-DE') : '') + ' · ' + (p.art || ''))),
    el('button', { class: 'rundknopf zart', html: ik('lesen'), title: 'Leseansicht', onclick: () => zeigeLeseansicht(p) }),
    el('button', { class: 'rundknopf zart', html: ik('mehr'), title: 'Projekt-Menü', onclick: () => projektMenue(p, () => zeichne()) })
  ));

  const inhalt = el('div', { class: 'inhalt' });
  if (p.ziel) {
    inhalt.append(el('div', { class: 'zielbalken', style: 'margin-top:4px' },
      el('i', { style: 'width:' + Math.min(100, Math.round(w / p.ziel * 100)) + '%' })));
  }

  const kapitel = kinder(p.id, 'kapitel');
  for (const k of kapitel) inhalt.append(baueKapitel(k, p));

  const projektHefte = vomTyp('heft').filter((h) => h.projektRef === p.id);
  const heftband = el('div', { class: 'projekt-hefte' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('hefte') }), 'HEFTE AM PROJEKT', el('span', { class: 'rest' }),
      el('button', { class: 'knopf zart', onclick: async () => {
        const hefte = vomTyp('heft').filter((h) => !h.projektRef || h.projektRef === p.id);
        const wahl = await menue([
          ...hefte.map((h) => ({ text: (h.projektRef === p.id ? '✓ ' : '') + h.titel, icon: 'hefte', wert: h.id })),
          { text: 'Neues Heft für dieses Projekt', icon: 'plus', wert: '_neu' }
        ], 'Welches Heft gehört dazu?');
        if (!wahl) return;
        let heft;
        if (wahl === '_neu') {
          const name = await eingabe({ titel: 'Ein neues Heft', platzhalter: 'Wie soll es heißen?' });
          if (!name) return;
          heft = neuDoc('heft', { titel: name, farbe: zufall(HEFTFARBEN), farbe2: zufall(HEFTFARBEN), band: '#d6bd92', muster: 'leinen', papier: 'liniert', ansicht: 'seiten' });
        } else heft = D.docs.get(wahl);
        if (heft) { heft.projektRef = heft.projektRef === p.id ? null : p.id; if (!heft.projektRef) delete heft.projektRef; speichere(heft); zeichne(); }
      } }, 'Heft dazulegen')),
    el('div', { class: 'projekt-heftband' }, projektHefte.length ? projektHefte.map((h) =>
      el('button', { class: 'projekt-heftchip', onclick: () => { location.hash = '#/heft/' + h.id; } },
        (() => { const d = heftDeckelDaten(h); return el('span', { class: 'mini-deckel muster-' + d.muster, style: d.style }); })(), el('span', {}, h.titel),
        el('small', {}, kinder(h.id, 'seite').length + ' S.'))) : el('span', { class: 'projekt-hefte-leer' }, 'Noch kein Heft liegt daneben.')));
  inhalt.append(heftband);

  inhalt.append(el('button', {
    class: 'plusskarte', style: 'width:100%;margin-top:22px', onclick: async () => {
      const name = await eingabe({ titel: 'Neues Kapitel', wert: 'Kapitel ' + (kapitel.length + 1) });
      if (!name) return;
      neuDoc('kapitel', { parent: p.id, titel: name, ord: kapitel.length });
      zeichne();
    }
  }, el('span', { html: ik('plus'), style: 'display:flex' }), 'Neues Kapitel'));

  haupt.append(inhalt);
};

function baueKapitel(k, p) {
  const szenen = kinder(k.id, 'szene');
  const kw = szenen.reduce((n, s) => n + worte(s.text), 0);
  const block = el('div', { class: 'kapitelblock' });
  const zeile = el('div', { class: 'kapitelzeile' },
    el('h3', {}, k.titel),
    el('span', { class: 'kworte' }, kw ? kw.toLocaleString('de-DE') + ' Wörter' : ''),
    el('button', {
      class: 'rundknopf zart', style: 'width:32px;height:32px', html: ik('mehr'), title: 'Kapitel-Menü', onclick: async () => {
        const geschwister = kinder(p.id, 'kapitel');
        const i = geschwister.findIndex((x) => x.id === k.id);
        const wahl = await menue([
          { text: 'Umbenennen', icon: 'stift', wert: 'name' },
          i > 0 ? { text: 'Nach oben', icon: 'senden', wert: 'hoch' } : null,
          i < geschwister.length - 1 ? { text: 'Nach unten', icon: 'aufklappen', wert: 'runter' } : null,
          { text: 'Kapitel löschen', icon: 'muell', wert: 'weg', rot: true }
        ], k.titel);
        if (wahl === 'name') {
          const neu = await eingabe({ titel: 'Das Kapitel heißt jetzt …', wert: k.titel });
          if (neu) { k.titel = neu; speichereStill(k); zeichne(); }
        } else if (wahl === 'hoch' || wahl === 'runter') {
          const j = wahl === 'hoch' ? i - 1 : i + 1;
          geschwister.forEach((x, n2) => { x.ord = n2; });
          [geschwister[i].ord, geschwister[j].ord] = [j, i];
          geschwister.forEach((x) => speichereStill(x));
          zeichne();
        } else if (wahl === 'weg') {
          if (await frage('„' + k.titel + '" mit ' + szenen.length + ' Szenen löschen?', { ja: 'Löschen', gefahr: true })) {
            await loesche(k.id); zeichne();
          }
        }
      }
    })
  );
  const wand = el('div', { class: 'pinnwand', 'data-kapitel': k.id });
  for (const s of szenen) wand.append(baueSzenenkarte(s, p));
  wand.append(el('button', {
    class: 'plusskarte', onclick: () => {
      const s = neuDoc('szene', { parent: k.id, projekt: p.id, ord: szenen.length, titel: '', text: '', status: 'funke', farbe: '' });
      oeffneSchreibraum(s.id);
    }
  }, el('span', { html: ik('plus'), style: 'display:flex' }), 'Szene'));
  block.append(zeile, wand);
  return block;
}

function baueSzenenkarte(s, p) {
  const karte = el('div', { class: 'szkarte', 'data-id': s.id });
  const probe = (s.text || '').trim().replace(/\s+/g, ' ').slice(0, 110);

  const notizFeld = el('textarea', { placeholder: 'Zweifel, Ideen, Alternativen — nur für dich.' });
  notizFeld.value = s.notiz || '';
  notizFeld.addEventListener('input', entprellt(() => { s.notiz = notizFeld.value; speichereStill(s); }, 400));
  notizFeld.addEventListener('pointerdown', (e) => e.stopPropagation());

  const statusFolge = ['funke', 'entwurf', 'steht'];
  const statusPunkt = el('button', {
    class: 'statuspunkt ' + (s.status || 'funke'), title: 'Status', onpointerdown: (e) => e.stopPropagation(), onclick: (e) => {
      e.stopPropagation();
      s.status = statusFolge[(statusFolge.indexOf(s.status || 'funke') + 1) % 3];
      speichereStill(s);
      e.currentTarget.className = 'statuspunkt ' + s.status;
    }
  });

  const dreher = el('div', { class: 'dreher' },
    el('div', { class: 'szvorn', style: s.farbe ? '--szfarbe:' + s.farbe : '' },
      el('div', { class: 'sztitel' }, s.titel || 'Ohne Titel'),
      el('div', { class: 'szprobe' }, probe || 'Noch leer. Noch alles möglich.'),
      el('div', { class: 'szfusszeile' },
        statusPunkt,
        el('span', { class: 'szworte' }, worte(s.text) ? worte(s.text) + ' W.' : ''),
        el('button', {
          class: 'rundknopf zart', style: 'width:28px;height:28px', html: ik('drehen'), title: 'Karte umdrehen',
          onpointerdown: (e) => e.stopPropagation(),
          onclick: (e) => { e.stopPropagation(); karte.classList.add('rueckseite'); }
        })
      )
    ),
    el('div', { class: 'szhinten' },
      el('div', { class: 'hintenhinweis' }, 'RÜCKSEITE'),
      notizFeld,
      el('div', { style: 'display:flex;justify-content:flex-end' },
        el('button', {
          class: 'rundknopf zart', style: 'width:28px;height:28px', html: ik('drehen'), title: 'Karte zurückdrehen',
          onpointerdown: (e) => e.stopPropagation(),
          onclick: (e) => { e.stopPropagation(); karte.classList.remove('rueckseite'); }
        }))
    )
  );
  karte.append(dreher);

  szenenGesten(karte, s, p);
  return karte;
}

/* Halten hebt die Karte an, dann ziehen; kurzes Tippen öffnet. */
function szenenGesten(karte, s, p) {
  let start = null, geist = null, gezogen = false, hebeTimer = null;
  const sperreScrollen = (e) => { if (gezogen) e.preventDefault(); };
  karte.addEventListener('touchmove', sperreScrollen, { passive: false });

  const hebeAn = (e) => {
    gezogen = true;
    karte._zieht = true;
    karte.classList.add('zieht');
    try { karte.setPointerCapture(e.pointerId); } catch (x) {}
    geist = karte.cloneNode(true);
    geist.classList.add('szgeist');
    geist.classList.remove('zieht');
    geist.style.left = (e.clientX - 95) + 'px';
    geist.style.top = (e.clientY - 30) + 'px';
    document.body.append(geist);
  };

  karte.addEventListener('pointerdown', (e) => {
    if (karte.classList.contains('rueckseite')) return;
    if (e.target.closest('button') || e.target.closest('textarea')) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    if (e.pointerType === 'mouse') return;
    hebeTimer = setTimeout(() => { hebeTimer = null; if (start) hebeAn(e); }, 300);
  });
  karte.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!gezogen) {
      if (Math.hypot(dx, dy) > 10) {
        if (e.pointerType === 'mouse') { hebeAn(e); }
        else { clearTimeout(hebeTimer); hebeTimer = null; start = null; }
      }
      return;
    }
    if (geist) {
      geist.style.left = (e.clientX - 95) + 'px';
      geist.style.top = (e.clientY - 30) + 'px';
    }
  });
  karte.addEventListener('pointerup', async (e) => {
    clearTimeout(hebeTimer); hebeTimer = null;
    if (!start && !gezogen) return;
    const warGezogen = gezogen;
    start = null; gezogen = false;
    karte.classList.remove('zieht');
    setTimeout(() => { karte._zieht = false; }, 0);
    if (geist) { geist.remove(); geist = null; }
    if (!warGezogen) {
      if (!e.target.closest('button') && !e.target.closest('textarea')) oeffneSchreibraum(s.id);
      return;
    }
    /* Ablegen: wohin? */
    const unter = document.elementsFromPoint(e.clientX, e.clientY);
    const zielKarte = unter.find((x) => x.classList && x.classList.contains('szkarte') && x !== karte);
    const zielWand = unter.find((x) => x.classList && x.classList.contains('pinnwand'));
    if (!zielWand) return;
    const zielKapitelId = zielWand.dataset.kapitel;
    const geschwister = kinder(zielKapitelId, 'szene').filter((x) => x.id !== s.id);
    let einfuegen = geschwister.length;
    if (zielKarte) {
      const zielSzene = D.docs.get(zielKarte.dataset.id);
      const zi = geschwister.findIndex((x) => x.id === zielSzene.id);
      const r = zielKarte.getBoundingClientRect();
      einfuegen = e.clientX < r.left + r.width / 2 ? zi : zi + 1;
    }
    s.parent = zielKapitelId;
    geschwister.splice(einfuegen, 0, s);
    geschwister.forEach((x, i) => { x.ord = i; speichereStill(x); });
    zeichne();
  });
  karte.addEventListener('pointercancel', () => {
    clearTimeout(hebeTimer); hebeTimer = null;
    start = null; gezogen = false;
    karte.classList.remove('zieht');
    if (geist) { geist.remove(); geist = null; }
  });

  langdruck(karte, async () => {
    if (karte._zieht || gezogen) return;
    const wahl = await menue([
      { text: 'Umbenennen', icon: 'stift', wert: 'name' },
      { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' },
      { text: 'Duplizieren', icon: 'wandel', wert: 'doppel' },
      { text: 'In anderes Kapitel …', icon: 'projekte', wert: 'zieh' },
      { text: 'Teilen', icon: 'teilen', wert: 'teilen' },
      { text: 'Szene löschen', icon: 'muell', wert: 'weg', rot: true }
    ], s.titel || 'Szene');
    if (wahl === 'name') {
      const neu = await eingabe({ titel: 'Die Szene heißt jetzt …', wert: s.titel });
      if (neu !== null) { s.titel = neu || s.titel; speichereStill(s); zeichne(); }
    } else if (wahl === 'farbe') {
      const i = (SZENENFARBEN.indexOf(s.farbe || '') + 1) % SZENENFARBEN.length;
      s.farbe = SZENENFARBEN[i]; speichereStill(s); zeichne();
    } else if (wahl === 'doppel') {
      neuDoc('szene', { parent: s.parent, projekt: s.projekt, ord: (s.ord || 0) + .5, titel: (s.titel || 'Szene') + ' (Fassung 2)', text: s.text, status: s.status, farbe: s.farbe, notiz: s.notiz });
      kinder(s.parent, 'szene').forEach((x, i) => { x.ord = i; speichereStill(x); });
      zeichne();
    } else if (wahl === 'zieh') {
      const wo = await waehleProjektKapitel();
      if (!wo) return;
      s.parent = wo.kapitel.id;
      s.projekt = wo.projekt.id;
      s.ord = kinder(wo.kapitel.id, 'szene').length;
      speichereStill(s);
      toast('Umgezogen nach „' + wo.projekt.titel + '".');
      zeichne();
    } else if (wahl === 'teilen') {
      teileText((s.titel ? s.titel + '\n\n' : '') + (s.text || ''));
    } else if (wahl === 'weg') {
      await loesche(s.id); zeichne();
    }
  });
}

/* ----- Leseansicht ----- */
function zeigeLeseansicht(p) {
  const kapitel = kinder(p.id, 'kapitel');
  let gesamt = '';
  const innen = el('div', { class: 'innen' });
  innen.append(el('h1', {}, p.titel));
  let w = 0;
  for (const k of kapitel) {
    const szenen = kinder(k.id, 'szene').filter((s) => (s.text || '').trim());
    if (!szenen.length) continue;
    innen.append(el('h2', {}, k.titel));
    gesamt += '\n\n' + k.titel.toUpperCase() + '\n\n';
    const texte = szenen.map((s) => s.text.trim());
    gesamt += texte.join('\n\n*\n\n');
    innen.append(el('div', { class: 'lesetext' }, texte.join('\n\n*\n\n')));
    szenen.forEach((s) => { w += worte(s.text); });
  }
  const h1 = innen.querySelector('h1');
  h1.after(el('div', { class: 'lmeta' }, w.toLocaleString('de-DE') + ' Wörter am Stück'));
  gesamt = p.titel.toUpperCase() + '\n' + gesamt;

  const bogen = el('div', { class: 'lesebogen' }, innen);
  const leiste = el('div', { class: 'schwebeleiste' },
    el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Leseansicht schließen', onclick: () => { bogen.remove(); leiste.remove(); } }),
    el('button', {
      class: 'knopf', onclick: async () => {
        try { await navigator.clipboard.writeText(gesamt); toast('Alles in der Zwischenablage.'); }
        catch (e) { toast('Die Zwischenablage wollte nicht.'); }
      }
    }, 'Kopieren'),
    el('button', { class: 'knopf', onclick: () => teileDatei(p.titel.replace(/[^\wäöüß -]/gi, '') + '.txt', gesamt) }, 'Als Datei')
  );
  document.body.append(bogen, leiste);
}
