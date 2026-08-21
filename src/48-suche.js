/* ================================================================
   VANI — Suche: ein Feld, alles. Mit Filtern und Nachsicht
   bei Tippfehlern.
   ================================================================ */

const SUCH_GRUPPEN = [
  ['schnipsel', 'Schnipsel', 'schnipsel'],
  ['blatt', 'Blätter', 'blatt'],
  ['seite', 'Heftseiten', 'hefte'],
  ['szene', 'Szenen', 'projekte'],
  ['heft', 'Hefte', 'hefte'],
  ['projekt', 'Projekte', 'projekte'],
  ['blase', 'Blasen', 'cluster'],
  ['zettel', 'Zettel', 'pin'],
  ['wort', 'Wörter', 'woerter'],
  ['faden', 'Faden', 'faden'],
  ['funkeln', 'Funken', 'woerter'],
  ['mischung', 'Klang-Szenen', 'klang']
];

function oeffneSuche() {
  const feld = el('input', { type: 'text', placeholder: 'Wonach suchst du?' });
  const treffer = el('div', { class: 'suchtreffer' });
  let filter = null;

  const chips = el('div', { class: 'suchchips' });
  const baueChips = () => {
    chips.innerHTML = '';
    for (const [typ, name] of SUCH_GRUPPEN) {
      if (typ === 'faden' && !vomTyp('faden').length) continue;
      chips.append(el('button', {
        class: 'suchchip' + (filter === typ ? ' an' : ''),
        onclick: () => { filter = filter === typ ? null : typ; baueChips(); suche(); }
      }, name));
    }
  };
  baueChips();

  const kasten = el('div', { class: 'suchkasten' },
    el('div', { class: 'suchzeile' },
      el('span', { html: ik('suche'), style: 'display:flex;color:var(--blass)' }),
      feld,
      el('button', { class: 'rundknopf zart', style: 'width:32px;height:32px', html: ik('kreuz'), title: 'Suche schließen', onclick: () => zu() })
    ),
    chips,
    treffer
  );
  const bogen = el('div', { class: 'suchbogen' }, kasten);
  bogen.addEventListener('pointerdown', (e) => { if (e.target === bogen) zu(); });
  document.body.append(bogen);
  const zu = () => bogen.remove();
  setTimeout(() => feld.focus(), 60);

  function eintrag(d, umfeldHtml) {
    return el('button', { onclick: () => { zu(); merkeSuche(feld.value); oeffneDoc(d); } },
      el('span', { class: 'ttitel' }, d.titel || ((d.text || '').split('\n')[0] || 'Ohne Titel').slice(0, 50)),
      umfeldHtml ? el('span', { class: 'tprobe', html: umfeldHtml }) : null
    );
  }

  function leererZustand() {
    treffer.innerHTML = '';
    const letzte = JSON.parse(localStorage.getItem('vani-suchen') || '[]');
    if (letzte.length) {
      treffer.append(el('div', { class: 'gruppe' }, 'ZULETZT GESUCHT'));
      for (const q of letzte.slice(0, 5)) {
        treffer.append(el('button', { onclick: () => { feld.value = q; suche(); } },
          el('span', { class: 'ttitel', style: 'font-weight:400' }, q)));
      }
    }
    const frisch = [...D.docs.values()]
      .filter((d) => ['blatt', 'szene', 'seite', 'schnipsel'].includes(d.typ) && (d.text || '').trim())
      .sort((a, b) => b.geaendert - a.geaendert).slice(0, 5);
    if (frisch.length) {
      treffer.append(el('div', { class: 'gruppe' }, 'ZULETZT ANGEFASST'));
      for (const d of frisch) treffer.append(eintrag(d, esc((d.text || '').replace(/\s+/g, ' ').slice(0, 70))));
    }
    if (!letzte.length && !frisch.length) {
      treffer.append(el('div', { style: 'padding:22px;text-align:center;color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' },
        'Alles, was du je geschrieben hast, liegt hier drin.'));
    }
  }

  function merkeSuche(q) {
    if (!q || q.length < 2) return;
    const letzte = JSON.parse(localStorage.getItem('vani-suchen') || '[]').filter((x) => x !== q);
    letzte.unshift(q);
    localStorage.setItem('vani-suchen', JSON.stringify(letzte.slice(0, 8)));
  }

  function suche() {
    const roh = feld.value.trim();
    if (roh.length < 2) { leererZustand(); return; }
    treffer.innerHTML = '';
    const q = normalisiere(roh);
    let gesamt = 0;
    for (const [typ, name] of SUCH_GRUPPEN) {
      if (filter && typ !== filter) continue;
      const funde = [];
      for (const d of D.docs.values()) {
        if (d.typ !== typ) continue;
        const titelN = normalisiere(d.titel || '');
        const suchText = d.text || '';
        const textN = normalisiere(suchText);
        let stelle = titelN.indexOf(q);
        let woText = -1;
        if (stelle === -1) { woText = textN.indexOf(q); }
        let unscharf = false;
        if (stelle === -1 && woText === -1 && q.length >= 5) {
          if (fastGleich(titelN, q) || fastGleich(textN, q)) unscharf = true;
          else continue;
        } else if (stelle === -1 && woText === -1) continue;
        funde.push({ d, woText, unscharf, suchText });
      }
      funde.sort((a, b) => b.d.geaendert - a.d.geaendert);
      if (!funde.length) continue;
      treffer.append(el('div', { class: 'gruppe' }, name.toUpperCase()));
      for (const { d, woText, unscharf, suchText } of funde.slice(0, filter ? 40 : 6)) {
        gesamt++;
        let umfeld = '';
        const text = suchText || '';
        if (woText >= 0) {
          const von = Math.max(0, woText - 28);
          const stueck = text.slice(von, woText + q.length + 50).replace(/\n/g, ' ');
          const rel = woText - von;
          umfeld = (von > 0 ? '… ' : '') + esc(stueck.slice(0, rel)) + '<mark>' + esc(stueck.slice(rel, rel + q.length)) + '</mark>' + esc(stueck.slice(rel + q.length)) + ' …';
        } else {
          umfeld = esc(text.replace(/\s+/g, ' ').slice(0, 78)) + (unscharf ? ' <i style="opacity:.6">(ähnlich)</i>' : '');
        }
        treffer.append(eintrag(d, umfeld.trim() || null));
      }
    }
    if (!gesamt) {
      treffer.append(el('div', { style: 'padding:22px;text-align:center;color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' },
        'Nichts. Vielleicht muss es erst noch geschrieben werden.'));
    }
  }
  feld.addEventListener('input', entprellt(suche, 140));
  feld.addEventListener('keydown', (e) => { if (e.key === 'Escape') zu(); });
  leererZustand();
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); oeffneSuche(); }
});
