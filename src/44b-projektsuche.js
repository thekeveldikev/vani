/* ===================== 44b — DIE SUCHE IM PROJEKT =====================
   Jedes Zimmer in VANI hat sein eigenes Suchfeld: die Blätter, die Wörter,
   das Album, der Stammbaum, die Karte, der Kalender, der Klangraum, die
   Anleitung. Nur das Projekt hatte keins — und ausgerechnet dort liegen die
   Szenen, also die längsten Texte und die meisten davon.

   Wer in einem Projekt mit acht Kapiteln eine bestimmte Szene sucht, musste
   bisher den Raum verlassen, die große Suche aufmachen und über das Ergebnis
   wieder hereinkommen. Das ist der Weg, der sich anfühlt, als ginge die Suche
   „hier nicht“.

   Gesucht wird über Titel, Text und die eigene Notiz an der Szene — die
   Notiz ist oft die einzige Stelle, an der steht, worum es in der Szene
   eigentlich geht.

   Gefiltert wird über Klassen, nicht über einen Neubau der Seite: sonst
   verlöre das Feld bei jedem Buchstaben den Fokus, und auf dem iPad klappte
   die Tastatur zu. */

/* ----- Pur: passt diese Szene zur Eingabe? ----- */
function projektSuchFelder(d) {
  if (!d) return '';
  return [d.titel, d.text, d.notiz].filter(Boolean).join('\n');
}
function projektSuchPasst(d, q) {
  const n = normalisiere(String(q || '').trim());
  if (!n) return true;
  return normalisiere(projektSuchFelder(d)).includes(n);
}
/* Wo genau steht es? 'titel' | 'text' | 'notiz' | '' — fuer die Zeile auf der Karte. */
function projektSuchWo(d, q) {
  const n = normalisiere(String(q || '').trim());
  if (!n || !d) return '';
  if (normalisiere(d.titel || '').includes(n)) return 'titel';
  if (normalisiere(d.text || '').includes(n)) return 'text';
  if (normalisiere(d.notiz || '').includes(n)) return 'notiz';
  return '';
}
/* Ein Stück Text um die Fundstelle — damit man sieht, warum die Karte bleibt. */
function projektSuchUmfeld(d, q, laenge = 90) {
  const text = String((d && d.text) || '').replace(/\s+/g, ' ').trim();
  const stelle = typeof suchStelle === 'function' ? suchStelle(text, q) : null;
  if (!stelle) return text.slice(0, laenge);
  const von = Math.max(0, stelle.von - 30);
  return (von > 0 ? '… ' : '') + text.slice(von, von + laenge).trim();
}
/* Wie viele Szenen eines Projekts passen? Für die Zeile unter dem Feld. */
function projektSuchZahl(p, q, docs) {
  const alle = docs || (typeof D !== 'undefined' ? [...D.docs.values()] : []);
  const n = normalisiere(String(q || '').trim());
  if (!n) return 0;
  return alle.filter((d) => d && d.typ === 'szene' && !d.geloescht && d.projekt === (p && p.id) && projektSuchPasst(d, q)).length;
}

/* ----- Das Feld und was es mit der Seite macht ----- */
function baueProjektsuche(inhalt, p) {
  const feld = el('input', { type: 'search', class: 'projektsuche-feld', placeholder: 'In diesem Projekt suchen — Titel, Text, Notiz …', 'aria-label': 'Im Projekt suchen' });
  const zaehler = el('span', { class: 'projektsuche-zahl' }, '');
  const kasten = el('div', { class: 'projektsuche' }, el('span', { class: 'projektsuche-lupe', html: ik('suche') }), feld, zaehler);

  const anwenden = () => {
    const q = feld.value.trim();
    inhalt.classList.toggle('sucht', !!q);
    if (!q) {
      for (const x of inhalt.querySelectorAll('.sucht-weg')) x.classList.remove('sucht-weg');
      for (const x of inhalt.querySelectorAll('.szfund')) x.remove();
      zaehler.textContent = '';
      kasten.classList.remove('leer');
      return;
    }
    let gesamt = 0;
    for (const block of inhalt.querySelectorAll('.kapitelblock')) {
      let hier = 0;
      for (const karte of block.querySelectorAll('.szkarte')) {
        const d = D.docs.get(karte.dataset.id);
        const passt = d && projektSuchPasst(d, q);
        karte.classList.toggle('sucht-weg', !passt);
        /* Warum diese Karte bleibt: die Stelle, an der es steht. */
        const alt = karte.querySelector('.szfund');
        if (alt) alt.remove();
        if (passt && d) {
          const wo = projektSuchWo(d, q);
          const vorn = karte.querySelector('.szvorn');
          const sagen = wo === 'text' ? projektSuchUmfeld(d, q) : wo === 'notiz' ? 'steht in deiner Notiz' : wo === 'titel' ? 'steht im Titel' : '';
          if (vorn && sagen) vorn.append(el('div', { class: 'szfund' }, sagen));
          hier++;
        }
      }
      /* Ein Kapitel ohne Treffer steht nur im Weg. */
      block.classList.toggle('sucht-weg', hier === 0);
      const plus = block.querySelector('.plusskarte');
      if (plus) plus.classList.add('sucht-weg');
      gesamt += hier;
    }
    zaehler.textContent = gesamt === 0 ? 'nichts' : gesamt === 1 ? 'eine Szene' : gesamt + ' Szenen';
    kasten.classList.toggle('leer', gesamt === 0);
  };

  feld.addEventListener('input', entprellt(anwenden, 90));
  feld.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { feld.value = ''; anwenden(); feld.blur(); return; }
    /* Enter öffnet die erste übrig gebliebene Szene — und landet dort auf
       dem gesuchten Wort, weil die Suche den Zettel dafür hinterlässt. */
    if (e.key === 'Enter') {
      const erste = inhalt.querySelector('.szkarte:not(.sucht-weg)');
      if (!erste) return;
      e.preventDefault();
      if (typeof suchZielMerken === 'function') suchZielMerken(erste.dataset.id, feld.value);
      oeffneSchreibraum(erste.dataset.id);
    }
  });
  return kasten;
}
