/* ===================== 56i — DAS PERSONENBLATT =====================
   Eine Figur auf einer Seite: wie oft sie vorkommt und wo, in welchen Werken,
   mit wem sie im Satz steht, was sie am häufigsten tut, wie viel sie spricht,
   ihre erste und ihre letzte Stelle — und darunter alle Stellen zum Antippen.
   Dazu, wenn die Einlesung offen ist, was die Wand über sie weiß und was die
   Stimmen zu ihr gesagt haben. Alles aus den eigenen Texten auf dem Gerät. */

/* Alles über eine Figur, aus der Kenntnis. Pur. */
function personenblattDaten(name, k) {
  if (!k || k.leer) return null;
  const n = String(name || '').trim(); if (!n) return null;
  const figur = (k.figuren || []).find((f) => f.name === n) || null;
  const ort = !figur ? (k.orte || []).find((o) => o.name === n) : null;
  const begriff = !figur && !ort ? (k.begriffe || []).find((b) => b.name === n) : null;
  const wesen = figur || ort || begriff;
  if (!wesen) return null;
  const art = figur ? 'figur' : ort ? 'ort' : 'begriff';
  const werke = (wesen.werke || []).slice();
  const summe = werke.reduce((s, w) => s + w.n, 0) || 1;
  const stellen = [];
  const gesehen = new Set();
  for (const b of (wesen.beispiele || [])) { if (!gesehen.has(b.satz)) { gesehen.add(b.satz); stellen.push(b); } }
  for (const s of (k.saetze || [])) {
    if (stellen.length >= 40) break;
    if (s.text.includes(n) && !gesehen.has(s.text)) { gesehen.add(s.text); stellen.push({ satz: s.text, werk: s.werk, id: s.id }); }
  }
  return {
    name: n, art, n: wesen.n || 0,
    werke: werke.map((w) => ({ name: w.name, n: w.n, anteil: Math.round(w.n / summe * 100) })),
    begleiter: (wesen.begleiter || []).slice(0, 8),
    verben: (wesen.verben || []).slice(0, 6),
    dialog: wesen.dialog || 0,
    dialogAnteil: wesen.n ? Math.round((wesen.dialog || 0) / wesen.n * 100) : 0,
    erster: wesen.erster || null,
    stellen: stellen.slice(0, 40),
    ortScore: wesen.ortScore || 0
  };
}
/* Ein Satz, der die Figur in einem Atemzug beschreibt. Pur. */
function personenblattSatz(d) {
  if (!d) return '';
  const teile = [];
  const wo = d.werke.length === 1 ? 'nur in ' + d.werke[0].name : d.werke.length > 1 ? 'in ' + d.werke.length + ' Texten, meist in ' + d.werke[0].name : '';
  teile.push(d.name + ' kommt ' + d.n + '-mal vor' + (wo ? ', ' + wo : '') + '.');
  if (d.art === 'figur') {
    if (d.begleiter.length) teile.push('Am häufigsten steht ' + (d.begleiter[0].name) + ' im selben Satz.');
    if (d.verben.length) teile.push('Das häufigste Verb: „' + d.verben[0].verb + '".');
    if (d.n >= 6) teile.push(d.dialogAnteil > 70 ? 'Fast immer in der Nähe von Anführungszeichen — ' + d.name + ' redet viel.' : d.dialogAnteil < 15 ? d.name + ' wird eher beschrieben als gehört.' : 'Reden und Handeln halten sich ungefähr die Waage.');
  }
  return teile.join(' ');
}

/* ----- Das Fenster ----- */
function zeigePersonenblatt(name, autor) {
  const k = typeof salonKenntnis === 'function' ? salonKenntnis() : null;
  const d = personenblattDaten(name, k);
  const ein = typeof einlesungFigur === 'function' ? einlesungFigur(name) : null;
  if (!d && !ein) { toast('Zu „' + name + '" findet die Wand gerade nichts.'); return; }
  const art = d ? d.art : 'figur';
  const kasten = el('div', { class: 'modal personenblatt' });
  const kopf = el('div', { class: 'pb-kopf' },
    el('div', {}, el('h2', {}, name), el('div', { class: 'salon-fenster-unter' }, art === 'figur' ? 'Figur' : art === 'ort' ? 'Schauplatz' : 'Begriff'), d ? el('div', { class: 'pb-satz' }, personenblattSatz(d)) : null),
    el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Schließen', onclick: () => zu() }));
  kasten.append(kopf);

  /* Was die Wand aus der Einlesung weiß */
  if (ein) kasten.append(el('div', { class: 'sw-einlesungkarte' },
    el('span', { class: 'sw-belege-titel' }, 'Aus der Einlesung' + (ein.werk ? ' · ' + ein.werk : '')),
    el('i', {}, ein.kurz), ein.mehr ? el('small', {}, ein.mehr) : null));

  if (d) {
    /* Werke als Balken */
    if (d.werke.length) {
      const balken = el('div', { class: 'pb-werke' });
      for (const w of d.werke) balken.append(el('div', { class: 'pb-werk' },
        el('span', { class: 'pb-wname' }, w.name), el('span', { class: 'pb-balken' }, el('i', { style: 'width:' + Math.max(4, w.anteil) + '%' })), el('span', { class: 'pb-wzahl' }, w.n + '×')));
      kasten.append(el('div', { class: 'pb-block' }, el('span', { class: 'sw-belege-titel' }, 'Wo'), balken));
    }
    /* Begleiter */
    if (d.begleiter.length) {
      const chips = el('div', { class: 'sw-chips' });
      for (const b of d.begleiter) chips.append(el('button', { class: 'suchchip figur', onclick: () => { zu(); zeigePersonenblatt(b.name, autor); } }, b.name + ' · ' + b.n + '×'));
      kasten.append(el('div', { class: 'pb-block' }, el('span', { class: 'sw-belege-titel' }, 'Mit wem im selben Satz'), chips));
    }
    /* Verben und Redeanteil */
    if (d.verben.length || d.n >= 4) {
      const zeile = el('div', { class: 'pb-zahlen' });
      for (const v of d.verben) zeile.append(el('span', { class: 'pb-verb' }, v.verb, el('i', {}, String(v.n))));
      if (d.art === 'figur' && d.n >= 4) zeile.append(el('span', { class: 'pb-verb still' }, 'im Dialog', el('i', {}, d.dialogAnteil + ' %')));
      kasten.append(el('div', { class: 'pb-block' }, el('span', { class: 'sw-belege-titel' }, 'Was ' + name + ' tut'), zeile));
    }
    /* Alle Stellen */
    if (d.stellen.length) {
      const liste = el('div', { class: 'sw-belege' });
      for (const s of d.stellen) liste.append(el('button', { class: 'sw-beleg', onclick: () => { const doc = D.docs.get(s.id); zu(); if (doc) oeffneDoc(doc); } }, el('i', {}, '„' + (s.satz.length > 220 ? s.satz.slice(0, 217) + ' …' : s.satz) + '"'), el('small', {}, s.werk)));
      kasten.append(el('div', { class: 'pb-block' }, el('span', { class: 'sw-belege-titel' }, d.stellen.length >= 40 ? 'Vierzig Stellen' : d.stellen.length + (d.stellen.length === 1 ? ' Stelle' : ' Stellen')), liste));
    }
  } else {
    kasten.append(el('div', { class: 'sw-hinweis' }, 'In den Texten auf diesem Gerät kommt ' + name + ' gerade nicht vor — die Wand kennt sie oder ihn nur aus der Einlesung.'));
  }

  /* Was die Stimmen gesagt haben */
  const stimmen = typeof einlesungStimmenZu === 'function' ? einlesungStimmenZu(name) : [];
  if (stimmen.length) {
    const block = el('div', { class: 'pb-block' }, el('span', { class: 'sw-belege-titel' }, 'Was die Wand dazu gesagt hat'));
    for (const id of stimmen) {
      const a = typeof salonFinde === 'function' ? salonFinde(id) : null; if (!a) continue;
      const notiz = einlesungNotiz(id, name); if (!notiz) continue;
      const karte = el('div', { class: 'pb-stimme' }, el('span', { class: 'st-mini' }, salonPortraet(a)), el('div', {}, el('b', {}, a.name), el('i', { class: a.en ? 'en' : '' }, notiz.text)));
      if (notiz.de) { const u = el('small', { hidden: 'hidden' }, notiz.de); karte.lastChild.append(u, el('button', { class: 'sw-mini', onclick: (ev) => { u.hidden = !u.hidden; ev.currentTarget.textContent = u.hidden ? 'Übersetzung' : 'verbergen'; } }, 'Übersetzung')); }
      block.append(karte);
    }
    kasten.append(block);
  }
  /* Und eine Frage dazu, von der Stimme, mit der man gerade spricht */
  if (autor && typeof gespraechAntwort === 'function' && k && !k.leer) {
    const ant = typeof salonFrageAntwort === 'function' ? salonFrageAntwort(autor, 'Wer ist ' + name + '?') : null;
    if (ant) kasten.append(el('div', { class: 'pb-block' }, el('span', { class: 'sw-belege-titel' }, (autor.anrede || autor.name) + ' dazu'), el('div', { class: 'salon-rat' + (autor.en ? ' en' : '') }, ant.text)));
  }
  kasten.append(el('div', { class: 'reihe' },
    el('button', { class: 'knopf', onclick: () => { const b = blattAusText('Über ' + name, 'Über ' + name + '\n\n' + (d ? personenblattSatz(d) : (ein ? ein.kurz : '')) + '\n\n'); zu(); oeffneSchreibraum(b.id); } }, 'Ein Blatt darüber anfangen'),
    el('button', { class: 'knopf voll', onclick: () => zu() }, 'Zu')));
  const zu = zeigeDeck(kasten);
}
