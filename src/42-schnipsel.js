/* ================================================================
   VANI — Schnipsel: der Chat mit mir selbst
   ================================================================ */

RENDER.schnipsel = function (haupt) {
  const raum = el('div', { class: 'schnipsel-raum' });

  raum.append(el('div', { class: 'kopf', style: 'position:static;background:none' },
    el('h1', {}, 'Schnipsel', el('div', { class: 'unter' }, 'an mich, für später'))
  ));

  const pinnzeile = el('div', { class: 'pinnzeile' });
  const lauf = el('div', { class: 'schnipsel-lauf' });
  const innen = el('div', { class: 'innen' });
  lauf.append(innen);

  const feld = el('textarea', { placeholder: 'An mich …', rows: 1 });
  autogrow(feld);
  const zeile = el('div', { class: 'schreibzeile' },
    el('button', {
      class: 'rundknopf zart', html: ik('kamera'), onclick: async () => {
        const bild = await waehleBild();
        if (!bild) return;
        neuDoc('schnipsel', { text: feld.value.trim(), bild: bild.id });
        feld.value = ''; feld.style.height = 'auto';
        baueLauf(); runter();
      }
    }),
    feld,
    el('button', {
      class: 'rundknopf voll', html: ik('senden'), onclick: () => {
        const t = feld.value.trim();
        if (!t) return;
        neuDoc('schnipsel', { text: t });
        feld.value = ''; feld.style.height = 'auto';
        baueLauf(); runter();
        feld.focus();
      }
    })
  );

  raum.append(pinnzeile, lauf, zeile);
  haupt.append(raum);

  function runter() { requestAnimationFrame(() => { lauf.scrollTop = lauf.scrollHeight; }); }

  function baueLauf() {
    innen.innerHTML = '';
    pinnzeile.innerHTML = '';
    const alle = vomTyp('schnipsel').sort((a, b) => a.angelegt - b.angelegt);

    for (const s of alle.filter((x) => x.gepinnt)) {
      pinnzeile.append(el('button', {
        class: 'pinnchip', onclick: () => {
          const ziel = innen.querySelector('[data-id="' + s.id + '"]');
          if (ziel) { ziel.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
      }, s.text || '[Bild]'));
    }

    if (!alle.length) {
      innen.append(el('div', { class: 'leer' }, 'Noch still hier.',
        el('div', { class: 'klein' }, 'Der erste Gedanke findet von allein den Weg.')));
      return;
    }

    let letzterTag = '';
    for (const s of alle) {
      const tag = tagKey(s.angelegt);
      if (tag !== letzterTag) {
        letzterTag = tag;
        const heute = tagKey();
        const gestern = tagKey(Date.now() - 86400000);
        innen.append(el('div', { class: 'datumstrenner' },
          tag === heute ? 'Heute' : tag === gestern ? 'Gestern' : fmtDatum(s.angelegt)));
      }
      const blase = el('div', { class: 'blase' + (s.gepinnt ? ' gepinnt' : ''), 'data-id': s.id });
      if (s.bild) {
        const img = el('img', { alt: '' });
        setzeBild(img, s.bild);
        blase.append(img);
      }
      if (s.text) blase.append(el('div', { class: 'btext', html: schmuecke(s.text) }));
      blase.append(el('div', { class: 'bzeit' },
        s.gepinnt ? el('span', { html: ik('pin'), style: 'display:flex;width:11px;color:var(--gold)' }) : null,
        fmtZeit(s.angelegt)));
      blase.addEventListener('click', (e) => {
        if (e.target.closest('.verweis') || e.target.closest('textarea')) return;
        schnipselMenue(s, blase, baueLauf);
      });
      innen.append(blase);
    }
  }

  baueLauf();
  runter();
};

async function schnipselMenue(s, blase, neuZeichnen) {
  const wahl = await menue([
    { text: s.gepinnt ? 'Losmachen' : 'Anpinnen', icon: 'pin', wert: 'pin' },
    s.text ? { text: 'Bearbeiten', icon: 'stift', wert: 'edit' } : null,
    { text: 'Verwandeln …', icon: 'wandel', wert: 'wandel' },
    { text: 'Löschen', icon: 'muell', wert: 'weg', rot: true }
  ]);
  if (wahl === 'pin') { s.gepinnt = !s.gepinnt; speichereStill(s); neuZeichnen(); }
  else if (wahl === 'edit') {
    const neu = await eingabe({ titel: 'Schnipsel', wert: s.text, mehrzeilig: true });
    if (neu !== null) { s.text = neu; speichere(s); neuZeichnen(); }
  }
  else if (wahl === 'weg') {
    if (await frage('Diesen Schnipsel wegwerfen?', { ja: 'Wegwerfen', gefahr: true })) { await loesche(s.id); neuZeichnen(); }
  }
  else if (wahl === 'wandel') verwandleSchnipsel(s, neuZeichnen);
}

async function verwandleSchnipsel(s, neuZeichnen) {
  const ziel = await menue([
    { text: 'Als Blatt in den Stapel', icon: 'blatt', wert: 'blatt' },
    { text: 'Auf eine Heftseite kleben', icon: 'hefte', wert: 'seite' },
    { text: 'Als Szene in ein Projekt', icon: 'projekte', wert: 'szene' },
    { text: 'Als Blase auf ein Brett', icon: 'cluster', wert: 'blase' },
    { text: 'Als Wort in die Kiste', icon: 'woerter', wert: 'wort' }
  ], 'Woraus soll das werden?');
  if (!ziel) return;

  if (ziel === 'blatt') {
    blattAusText('', s.text || '');
    await loesche(s.id, true);
    toast('Liegt jetzt bei den Blättern.');
    if (neuZeichnen) neuZeichnen();
    return;
  }
  if (ziel === 'wort') {
    neuDoc('wort', { text: (s.text || '').slice(0, 60) });
    toast('Liegt in der Wortschatzkiste.');
    return;
  }
  if (ziel === 'seite') {
    const heft = await waehleHeft();
    if (!heft) return;
    const geschwister = kinder(heft.id, 'seite');
    const seite = neuDoc('seite', { parent: heft.id, ord: geschwister.length, titel: '', text: s.text || '' });
    if (s.bild) {
      neuDoc('foto', { parent: seite.id, bild: s.bild, pos: { x: 55, y: 8, rot: -2 + Math.random() * 4, w: 38 } });
      delete s.bild;
    }
    await loesche(s.id);
    toast('Eingeklebt: ' + heft.titel);
    if (neuZeichnen) neuZeichnen();
    return;
  }
  if (ziel === 'szene') {
    const wo = await waehleProjektKapitel();
    if (!wo) return;
    const geschwister = kinder(wo.kapitel.id, 'szene');
    neuDoc('szene', {
      parent: wo.kapitel.id, projekt: wo.projekt.id, ord: geschwister.length,
      titel: (s.text || '').split('\n')[0].slice(0, 40), text: s.text || '', status: 'funke', farbe: ''
    });
    await loesche(s.id);
    toast('Jetzt eine Szene in „' + wo.projekt.titel + '".');
    if (neuZeichnen) neuZeichnen();
    return;
  }
  if (ziel === 'blase') {
    const brett = await waehleBrett();
    if (!brett) return;
    neuDoc('blase', { parent: brett.id, text: s.text || '', farbe: '', pos: { x: 80 + Math.random() * 300, y: 80 + Math.random() * 300 } });
    await loesche(s.id);
    toast('Schwebt jetzt auf „' + brett.titel + '".');
    if (neuZeichnen) neuZeichnen();
  }
}

/* Auswahl-Helfer */
async function waehleHeft() {
  const hefte = vomTyp('heft').filter((h) => !h.archiv);
  const wahl = await menue([
    ...hefte.map((h) => ({ text: h.titel, icon: 'hefte', wert: h.id })),
    { text: 'Neues Heft', icon: 'plus', wert: '_neu' }
  ], 'In welches Heft?');
  if (!wahl) return null;
  if (wahl === '_neu') {
    const name = await eingabe({ titel: 'Ein neues Heft', platzhalter: 'Wie soll es heißen?' });
    if (!name) return null;
    return neuDoc('heft', { titel: name, farbe: zufall(HEFTFARBEN), papier: 'liniert' });
  }
  return D.docs.get(wahl);
}
async function waehleProjektKapitel() {
  const projekte = vomTyp('projekt');
  if (!projekte.length) { toast('Noch kein Projekt. Leg erst eins an.'); return null; }
  const pWahl = await menue(projekte.map((p) => ({ text: p.titel, icon: 'projekte', wert: p.id })), 'Welches Projekt?');
  if (!pWahl) return null;
  const projekt = D.docs.get(pWahl);
  const kapitel = kinder(projekt.id, 'kapitel');
  if (!kapitel.length) {
    const k = neuDoc('kapitel', { parent: projekt.id, titel: 'Kapitel 1', ord: 0 });
    return { projekt, kapitel: k };
  }
  if (kapitel.length === 1) return { projekt, kapitel: kapitel[0] };
  const kWahl = await menue(kapitel.map((k) => ({ text: k.titel, wert: k.id })), 'Wohin genau?');
  if (!kWahl) return null;
  return { projekt, kapitel: D.docs.get(kWahl) };
}
async function waehleBrett() {
  const bretter = vomTyp('board');
  const wahl = await menue([
    ...bretter.map((b) => ({ text: b.titel, icon: 'cluster', wert: b.id })),
    { text: 'Neues Brett', icon: 'plus', wert: '_neu' }
  ], 'Auf welches Brett?');
  if (!wahl) return null;
  if (wahl === '_neu') {
    const name = await eingabe({ titel: 'Ein neues Brett', platzhalter: 'Wofür ist es?' });
    if (!name) return null;
    return neuDoc('board', { titel: name });
  }
  return D.docs.get(wahl);
}
