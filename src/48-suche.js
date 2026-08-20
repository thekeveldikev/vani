/* ================================================================
   VANI — Suche: ein Feld, alles
   ================================================================ */

function oeffneSuche() {
  const feld = el('input', { type: 'text', placeholder: 'Wonach suchst du?' });
  const treffer = el('div', { class: 'suchtreffer' });
  const kasten = el('div', { class: 'suchkasten' },
    el('div', { class: 'suchzeile' },
      el('span', { html: ik('suche'), style: 'display:flex;color:var(--blass)' }),
      feld,
      el('button', { class: 'rundknopf zart', style: 'width:32px;height:32px', html: ik('kreuz'), onclick: () => zu() })
    ),
    treffer
  );
  const bogen = el('div', { class: 'suchbogen' }, kasten);
  bogen.addEventListener('pointerdown', (e) => { if (e.target === bogen) zu(); });
  document.body.append(bogen);
  const zu = () => bogen.remove();
  setTimeout(() => feld.focus(), 60);

  const GRUPPEN = [
    ['schnipsel', 'SCHNIPSEL', 'schnipsel'],
    ['seite', 'HEFTSEITEN', 'hefte'],
    ['szene', 'SZENEN', 'projekte'],
    ['heft', 'HEFTE', 'hefte'],
    ['projekt', 'PROJEKTE', 'projekte'],
    ['blase', 'BLASEN', 'cluster'],
    ['zettel', 'ZETTEL', 'pin'],
    ['wort', 'WÖRTER', 'woerter']
  ];

  function suche() {
    const q = feld.value.trim().toLowerCase();
    treffer.innerHTML = '';
    if (q.length < 2) {
      treffer.append(el('div', { style: 'padding:22px;text-align:center;color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' },
        'Alles, was du je geschrieben hast, liegt hier drin.'));
      return;
    }
    let gesamt = 0;
    for (const [typ, name, icon] of GRUPPEN) {
      const funde = [...D.docs.values()]
        .filter((d) => d.typ === typ && ((d.titel || '').toLowerCase().includes(q) || (d.text || '').toLowerCase().includes(q)))
        .sort((a, b) => b.geaendert - a.geaendert)
        .slice(0, 8);
      if (!funde.length) continue;
      treffer.append(el('div', { class: 'gruppe' }, name));
      for (const d of funde) {
        gesamt++;
        const text = d.text || '';
        const wo = text.toLowerCase().indexOf(q);
        const umfeld = wo >= 0 ? '… ' + text.slice(Math.max(0, wo - 30), wo + 60).replace(/\n/g, ' ') + ' …' : text.slice(0, 80);
        treffer.append(el('button', { onclick: () => { zu(); oeffneDoc(d); } },
          el('span', { class: 'ttitel' }, d.titel || (text.split('\n')[0] || 'Ohne Titel').slice(0, 50)),
          umfeld.trim() ? el('span', { class: 'tprobe' }, umfeld) : null
        ));
      }
    }
    if (!gesamt) {
      treffer.append(el('div', { style: 'padding:22px;text-align:center;color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' },
        'Nichts. Vielleicht muss es erst noch geschrieben werden.'));
    }
  }
  feld.addEventListener('input', entprellt(suche, 160));
  feld.addEventListener('keydown', (e) => { if (e.key === 'Escape') zu(); });
  suche();
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); oeffneSuche(); }
});
