/* ================================================================
   VANI — Blätter: nur Texte, nichts sonst.
   ================================================================ */

function blattAusText(titel, text) {
  return neuDoc('blatt', { titel: titel || '', text: text || '', ord: Date.now() });
}

RENDER.blaetter = function (haupt) {
  haupt.append(raumkopf('Blätter', 'ein Stapel Texte, mehr nicht',
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), onclick: () => {
        const b = blattAusText('', '');
        oeffneSchreibraum(b.id);
      }
    })
  ));
  const inhalt = el('div', { class: 'inhalt' });

  const sortierung = D.einst.blattSortierung || 'zuletzt';
  const alle = vomTyp('blatt');
  if (sortierung === 'az') alle.sort((a, b) => (a.titel || a.text || '').localeCompare(b.titel || b.text || '', 'de'));
  else if (sortierung === 'aeltest') alle.sort((a, b) => a.angelegt - b.angelegt);

  if (alle.length > 1) {
    const wahl = el('div', { class: 'wahlgruppe', style: 'margin-bottom:12px' });
    for (const [id, name] of [['zuletzt', 'Zuletzt'], ['aeltest', 'Älteste zuerst'], ['az', 'A–Z']]) {
      wahl.append(el('button', {
        class: sortierung === id ? 'an' : '', onclick: () => { D.einst.blattSortierung = id; speichereEinst(); zeichne(); }
      }, name));
    }
    inhalt.append(wahl);
  }

  if (!alle.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Ein leerer Stapel.',
      el('div', { class: 'klein' }, 'Für alles, was einfach nur geschrieben werden will.')));
  }

  const liste = el('div', { class: 'blattliste' });
  for (const b of alle) {
    const worteZahl = worte(b.text);
    const erste = (b.text || '').trim().split('\n')[0] || '';
    const karte = el('button', { class: 'karte blattkarte', onclick: () => oeffneSchreibraum(b.id) },
      el('div', { class: 'btitel serif' }, b.titel || erste.slice(0, 60) || 'Ohne Titel'),
      el('div', { class: 'bprobe' }, (b.text || '').trim().replace(/\s+/g, ' ').slice(0, 140) || 'Noch leer.'),
      el('div', { class: 'bfuss' }, (worteZahl ? worteZahl + ' Wörter · ' : '') + vorZeit(b.geaendert))
    );
    langdruck(karte, async () => {
      const wahl = await menue([
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Teilen', icon: 'teilen', wert: 'teilen' },
        { text: 'Duplizieren', icon: 'wandel', wert: 'doppel' },
        { text: 'Löschen', icon: 'muell', wert: 'weg', rot: true }
      ], b.titel || 'Blatt');
      if (wahl === 'name') {
        const neu = await eingabe({ titel: 'Das Blatt heißt jetzt …', wert: b.titel });
        if (neu !== null) { b.titel = neu; speichereStill(b); zeichne(); }
      } else if (wahl === 'teilen') {
        teileText((b.titel ? b.titel + '\n\n' : '') + (b.text || ''));
      } else if (wahl === 'doppel') {
        neuDoc('blatt', { titel: (b.titel || 'Blatt') + ' (Abschrift)', text: b.text, ord: Date.now() });
        zeichne();
      } else if (wahl === 'weg') {
        await loesche(b.id); zeichne();
      }
    });
    liste.append(karte);
  }
  inhalt.append(liste);
  haupt.append(inhalt);
};
