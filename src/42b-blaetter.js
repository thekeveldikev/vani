/* ================================================================
   VANI — Blätter: nur Texte, nichts sonst.
   ================================================================ */

/* Blätter sind von Anfang an formatierbar — Rich-Text überall, wo man schreibt. */
function blattAusText(titel, text) {
  return neuDoc('blatt', { titel: titel || '', text: text || '', rich: richAusText(text || ''), format: 'rich', ord: Date.now() });
}

RENDER.blaetter = function (haupt) {
  haupt.append(raumkopf('Blätter', 'ein Stapel Texte, mehr nicht',
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), title: 'Neues Blatt', onclick: () => {
        const b = blattAusText('', '');
        oeffneSchreibraum(b.id);
      }
    })
  ));
  const inhalt = el('div', { class: 'inhalt' });

  const sortierung = D.einst.blattSortierung || 'zuletzt';
  let alle = vomTyp('blatt');
  /* Ab einer Handvoll Blättern hilft ein Suchfeld mehr als Scrollen. */
  const suchfeld = el('input', { type: 'search', class: 'blattsuche', placeholder: 'In den Blättern suchen …' });
  const filter = normalisiere((sessionStorage.getItem('blattSuche') || '').trim());
  if (filter) {
    suchfeld.value = sessionStorage.getItem('blattSuche') || '';
    alle = alle.filter((b) => normalisiere((b.titel || '') + ' ' + (b.text || '')).includes(filter));
  }
  suchfeld.addEventListener('input', entprellt(() => {
    sessionStorage.setItem('blattSuche', suchfeld.value);
    const stelle = suchfeld.selectionStart;
    zeichne();
    requestAnimationFrame(() => { const f = $('.blattsuche'); if (f) { f.focus(); f.setSelectionRange(stelle, stelle); } });
  }, 220));
  if (sortierung === 'az') alle.sort((a, b) => (a.titel || a.text || '').localeCompare(b.titel || b.text || '', 'de'));
  else if (sortierung === 'aeltest') alle.sort((a, b) => a.angelegt - b.angelegt);
  /* Angepinnte Blätter liegen oben — in jeder Sortierung. */
  alle.sort((a, b) => Number(!!b.gepinnt) - Number(!!a.gepinnt));

  if (alle.length > 1) {
    const wahl = el('div', { class: 'wahlgruppe', style: 'margin-bottom:12px' });
    for (const [id, name] of [['zuletzt', 'Zuletzt'], ['aeltest', 'Älteste zuerst'], ['az', 'A–Z']]) {
      wahl.append(el('button', {
        class: sortierung === id ? 'an' : '', onclick: () => { D.einst.blattSortierung = id; speichereEinst(); zeichne(); }
      }, name));
    }
    inhalt.append(wahl);
  }
  if (vomTyp('blatt').length > 5 || filter) inhalt.append(suchfeld);

  if (!alle.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Ein leerer Stapel.',
      el('div', { class: 'klein' }, 'Für alles, was einfach nur geschrieben werden will.')));
  }

  const liste = el('div', { class: 'blattliste' });
  for (const b of alle) {
    const worteZahl = worte(b.text);
    const erste = (b.text || '').trim().split('\n')[0] || '';
    const karte = el('button', { class: 'karte blattkarte' + (b.gepinnt ? ' gepinnt' : ''), onclick: () => oeffneSchreibraum(b.id) },
      b.gepinnt ? el('span', { class: 'blatt-nadel', html: ik('pin') }) : null,
      el('div', { class: 'btitel serif' }, b.titel || erste.slice(0, 60) || 'Ohne Titel'),
      el('div', { class: 'bprobe' }, (b.text || '').trim().replace(/\s+/g, ' ').slice(0, 140) || 'Noch leer.'),
      el('div', { class: 'bfuss' }, (worteZahl ? zaehl(worteZahl, 'Wort', 'Wörter') + ' · ' : '') + vorZeit(b.geaendert)
        + (worteZahl > 60 ? ' · ' + Math.max(1, Math.round(worteZahl / 200)) + ' Min.' : ''))
    );
    langdruck(karte, async () => {
      const wahl = await menue([
        { text: b.gepinnt ? 'Losmachen' : 'Oben anpinnen', icon: 'pin', wert: 'pin' },
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Vorlesen lassen', icon: 'vorlesen', wert: 'vorlesen' },
        { text: 'Teilen', icon: 'teilen', wert: 'teilen' },
        { text: 'Duplizieren', icon: 'wandel', wert: 'doppel' },
        { text: 'In ein Heft legen …', icon: 'hefte', wert: 'heft' },
        { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'dazu' },
        { text: 'Löschen', icon: 'muell', wert: 'weg', rot: true }
      ], b.titel || 'Blatt');
      if (wahl === 'pin') {
        b.gepinnt = !b.gepinnt; speichereStill(b); zeichne();
      } else if (wahl === 'vorlesen') {
        vorlesen((b.titel ? b.titel + '. ' : '') + (b.text || ''));
      } else if (wahl === 'name') {
        const neu = await eingabe({ titel: 'Das Blatt heißt jetzt …', wert: b.titel });
        if (neu !== null) { b.titel = neu; speichereStill(b); zeichne(); }
      } else if (wahl === 'teilen') {
        teileText((b.titel ? b.titel + '\n\n' : '') + (b.text || ''));
      } else if (wahl === 'doppel') {
        neuDoc('blatt', { titel: (b.titel || 'Blatt') + ' (Abschrift)', text: b.text, rich: b.rich || '', format: b.format || 'plain', ord: Date.now() });
        zeichne();
      } else if (wahl === 'heft') {
        if (await legeBlattInHeft(b)) zeichne();
      } else if (wahl === 'dazu') {
        await hinzufuegenMenue(b); zeichne();
      } else if (wahl === 'weg') {
        await loesche(b.id); zeichne();
      }
    });
    liste.append(karte);
  }
  inhalt.append(liste);
  haupt.append(inhalt);
};
