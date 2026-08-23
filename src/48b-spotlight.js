/* ===================== 48b — SPOTLIGHT UND TASTATURKÜRZEL =====================
   ⌘/Strg+K: eine Zeile tippen, Treffer mit Vorschau daneben, Pfeile, Enter.
   „>" davor zeigt Befehle (Räume, Neues, Kerze …). „?" außerhalb eines
   Feldes zeigt die Kürzel. */

const SPOTLIGHT_BEFEHLE = () => [
  ...((typeof ALLE_RAEUME !== 'undefined' ? ALLE_RAEUME : []).map((r) => ({ text: r.name, unter: 'Raum', icon: r.icon, tu: () => { location.hash = '#/' + r.id; } }))),
  { text: 'Sitzung beginnen', unter: 'Uhr, Klang, Kerze, ein Rat — und die Bilanz danach', icon: 'feuer', tu: () => { if (typeof sitzungBeginnen === 'function') sitzungBeginnen(); } },
  { text: 'Das Jahr in Ringen', unter: 'Schreibtage als Baumquerschnitt', icon: 'feinheiten', tu: () => { if (typeof zeigeJahresringe === 'function') zeigeJahresringe(); } },
  { text: 'Personenblatt öffnen', unter: 'Eine Figur aus deinen Texten auf einer Seite', icon: 'rahmen', tu: async () => {
    if (typeof salonKenntnis !== 'function') return;
    const k = salonKenntnis();
    if (!k || k.leer) { toast('Es liegen noch keine Texte da.'); return; }
    const punkte = [...(k.figuren || []).slice(0, 12), ...(k.orte || []).slice(0, 4)].map((f) => ({ text: f.name, icon: 'rahmen', wert: f.name }));
    if (!punkte.length) { toast('Die Wand hat noch niemanden gefunden.'); return; }
    const wahl = await menue(punkte, 'Wen möchtest du sehen?');
    if (wahl) zeigePersonenblatt(wahl);
  } },
  { text: 'An die Schreibmaschine', unter: 'Tippen wie früher — mit Glocke und Wagenrücklauf', icon: 'stift', tu: () => { if (typeof schreibmaschineOeffnen === 'function') schreibmaschineOeffnen(); } },
  { text: 'Brief an die Wand', unter: 'an King, Kästner, Funke, Rothfuss … — Antwort in drei Tagen', icon: 'brief', tu: () => { if (typeof salonBriefSchreiben === 'function') salonBriefSchreiben(); } },
  { text: 'Neues Blatt', unter: 'im Schreibraum', icon: 'blatt', tu: () => { const b = blattAusText('', ''); oeffneSchreibraum(b.id); } },
  { text: 'Schneller Schnipsel', unter: 'ein Satz, ein Gedanke', icon: 'schnipsel', tu: async () => { const t = await eingabe({ titel: 'Schnell notiert', platzhalter: 'ein Satz, ein Wort, ein Gedanke …', mehrzeilig: true, ok: 'Ablegen' }); if (t) { neuDoc('schnipsel', { text: t }); toast('Liegt in den Schnipseln.'); } } },
  { text: 'Suche', unter: 'die große Suche mit Gruppen', icon: 'suche', tu: () => { if (typeof oeffneSuche === 'function') oeffneSuche(); } },
  { text: 'Tastaturkürzel', unter: 'Übersicht', icon: 'feinheiten', tu: () => kuerzelZeigen() },
  { text: 'Anleitung', unter: 'alles, was VANI kann', icon: 'lesen', tu: () => { if (typeof oeffneAnleitung === 'function') oeffneAnleitung(); } },
  { text: 'Sicherung in die Zwischenablage', unter: 'alles, ohne Datei', icon: 'sichern', tu: () => { if (typeof inZwischenablageSichern === 'function') inZwischenablageSichern(); } }
].filter((b) => b.text);

/* Treffer zu einer Eingabe: Titel- und Textsuche, pro Dokument ein Eintrag. Pur bis auf D.docs. */
function spotlightTreffer(roh, docs, max = 14) {
  const q = normalisiere(String(roh || '').trim());
  if (q.length < 2) return [];
  const gruppen = typeof SUCH_GRUPPEN !== 'undefined' ? SUCH_GRUPPEN : [];
  const name = (typ) => { const g = gruppen.find((x) => x[0] === typ); return g ? g[1] : typ; };
  const funde = [];
  for (const d of docs) {
    if (!d || !d.typ || !gruppen.some((g) => g[0] === d.typ)) continue;
    const titelN = normalisiere(d.titel || ''), text = [d.text, d.notiz].filter(Boolean).join('\n'), textN = normalisiere(text);
    let wo = titelN.indexOf(q), inTitel = wo >= 0;
    if (!inTitel) wo = textN.indexOf(q);
    if (wo < 0) continue;
    funde.push({ d, inTitel, wo, text, gruppe: name(d.typ), gewicht: (inTitel ? 1000 : 0) + (d.geaendert || 0) / 1e12 });
  }
  funde.sort((a, b) => b.gewicht - a.gewicht || (b.d.geaendert || 0) - (a.d.geaendert || 0));
  return funde.slice(0, max);
}

function spotlightOeffnen() {
  if (document.querySelector('.spotlight-bogen')) return;
  const feld = el('input', { type: 'text', placeholder: 'Suchen … oder > für Befehle', autocomplete: 'off', spellcheck: 'false' });
  const liste = el('div', { class: 'spotlight-liste' });
  const vorschau = el('div', { class: 'spotlight-vorschau' });
  const kasten = el('div', { class: 'spotlight' },
    el('div', { class: 'spotlight-zeile' }, el('span', { html: ik('suche'), style: 'display:flex;color:var(--blass)' }), feld, el('kbd', {}, 'Esc')),
    el('div', { class: 'spotlight-koerper' }, liste, vorschau));
  const bogen = el('div', { class: 'spotlight-bogen' }, kasten);
  bogen.addEventListener('pointerdown', (e) => { if (e.target === bogen) zu(); });
  document.body.append(bogen);
  let eintraege = [], wahl = 0;
  const zu = () => { document.removeEventListener('keydown', tasten, true); bogen.remove(); };
  const zeigeVorschau = () => {
    vorschau.innerHTML = '';
    const e = eintraege[wahl];
    if (!e) { vorschau.append(el('div', { class: 'spotlight-leer' }, eintraege.length ? '' : feld.value.trim().length < 2 ? 'Tippe, was du suchst — oder > für Befehle.' : 'Nichts. Vielleicht muss es erst noch geschrieben werden.')); return; }
    if (e.befehl) { vorschau.append(el('div', { class: 'spotlight-leer' }, el('b', {}, e.befehl.text), el('div', {}, e.befehl.unter || ''))); return; }
    const d = e.d, q = normalisiere(feld.value.trim());
    const text = (e.text || '').replace(/\r/g, '');
    let auszug = text.slice(0, 1400), html;
    const n = normalisiere(auszug), wo = n.indexOf(q);
    if (wo >= 0 && normalisiere(auszug.slice(0, wo)).length === wo) {
      /* normalisiere ändert die Länge nicht, solange keine Ligaturen dabei sind — dann markieren wir sicher */
      html = esc(auszug.slice(0, wo)) + '<mark>' + esc(auszug.slice(wo, wo + q.length)) + '</mark>' + esc(auszug.slice(wo + q.length));
    } else html = esc(auszug);
    vorschau.append(
      el('div', { class: 'spotlight-vtitel' }, d.titel || (text.split('\n')[0] || 'Ohne Titel').slice(0, 60)),
      el('div', { class: 'spotlight-vmeta' }, e.gruppe + (d.geaendert ? ' · ' + fmtDatum(d.geaendert) + ', ' + fmtZeit(d.geaendert) : '') + (text ? ' · ' + worte(text) + ' Wörter' : '')),
      el('div', { class: 'spotlight-vtext', html: html.replace(/\n/g, '<br>') + (text.length > 1400 ? ' …' : '') },),
      el('div', { class: 'spotlight-vhinweis' }, 'Enter öffnet · ↑↓ wählen'));
  };
  const zeigeListe = () => {
    liste.innerHTML = '';
    eintraege.forEach((e, i) => {
      const b = el('button', { class: 'spotlight-eintrag' + (i === wahl ? ' an' : ''), onclick: () => { wahl = i; ausfuehren(); } },
        el('span', { class: 'sp-icon', html: ik(e.befehl ? e.befehl.icon || 'stern' : SUCH_ICON(e.d.typ)) }),
        el('span', { class: 'sp-text' }, el('b', {}, e.befehl ? e.befehl.text : (e.d.titel || (e.text || '').split('\n')[0] || 'Ohne Titel').slice(0, 70)), el('small', {}, e.befehl ? e.befehl.unter || '' : e.gruppe)));
      b.addEventListener('pointerenter', () => { wahl = i; [...liste.children].forEach((c, j) => c.classList.toggle('an', j === wahl)); zeigeVorschau(); });
      liste.append(b);
    });
    zeigeVorschau();
  };
  const SUCH_ICON = (typ) => ({ blatt: 'blatt', szene: 'projekte', seite: 'hefte', schnipsel: 'schnipsel', blase: 'cluster', faden: 'faden', funkeln: 'woerter', wortkiste: 'woerter', buch: 'lesen', brief: 'brief' }[typ] || 'suche');
  const suche = () => {
    const roh = feld.value;
    wahl = 0;
    if (roh.trim().startsWith('>')) {
      const q = normalisiere(roh.trim().slice(1).trim());
      eintraege = SPOTLIGHT_BEFEHLE().filter((b) => !q || normalisiere(b.text + ' ' + (b.unter || '')).includes(q)).map((b) => ({ befehl: b }));
    } else eintraege = spotlightTreffer(roh, [...D.docs.values()]);
    zeigeListe();
  };
  const ausfuehren = () => {
    const e = eintraege[wahl]; if (!e) return;
    zu();
    if (e.befehl) { try { e.befehl.tu(); } catch (x) {} return; }
    if (typeof _sr !== 'undefined' && _sr && typeof schliesseSchreibraum === 'function') schliesseSchreibraum();
    oeffneDoc(e.d);
  };
  const tasten = (ev) => {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); zu(); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); if (eintraege.length) { wahl = (wahl + 1) % eintraege.length; zeigeListe(); } }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (eintraege.length) { wahl = (wahl - 1 + eintraege.length) % eintraege.length; zeigeListe(); } }
    else if (ev.key === 'Enter') { ev.preventDefault(); ausfuehren(); }
  };
  document.addEventListener('keydown', tasten, true);
  feld.addEventListener('input', entprellt(suche, 90));
  suche();
  setTimeout(() => feld.focus(), 40);
}

/* Die Kürzel, einmal gesammelt. Pur. */
const TASTENKUERZEL = [
  ['Überall', [['⌘/Strg + K', 'Spotlight: suchen, springen, Befehle'], ['⌘/Strg + ⇧ + K', 'Die große Suche'], ['?', 'Diese Übersicht (außerhalb eines Feldes)'], ['Esc', 'Fenster, Leser oder Schreibraum schließen']]],
  ['Spotlight', [['↑ ↓', 'Treffer wählen'], ['Enter', 'Öffnen'], ['> …', 'Befehle statt Treffer']]],
  ['Schreibraum', [['⌘/Strg + S', 'Stand einfrieren'], ['⌘/Strg + F', 'Suchen und Ersetzen'], ['⌘/Strg + Enter', 'Schließen und speichern'], ['Tab', 'Einrücken (Klartext)'], ['⌘/Strg + B / I / U', 'Fett, kursiv, unterstrichen (Rich-Text)']]],
  ['Lesen', [['→ / Leertaste', 'Nächste Seite'], ['←', 'Seite zurück'], ['Pos1 / Ende', 'Anfang / Ende (PDF)'], ['Esc', 'Buch zuklappen']]],
  ['Schreibtisch', [['An der Schnur ziehen', 'Lampe an oder aus'], ['Esc im Blatt', 'Blatt weglegen']]],
  ['Karteikarten', [['← →', 'Karte umdrehen / weiter'], ['1 / 2 / 3', 'Gewusst, halb, nicht']]]
];
function kuerzelZeigen() {
  const kasten = el('div', { class: 'modal kuerzel' }, el('h2', {}, 'Tastaturkürzel'),
    ...TASTENKUERZEL.map(([gruppe, liste]) => el('div', { class: 'kuerzel-gruppe' }, el('b', {}, gruppe), ...liste.map(([k, t]) => el('div', { class: 'kuerzel-zeile' }, el('kbd', {}, k), el('span', {}, t))))),
    el('div', { class: 'stickerblock-hinweis' }, 'Auf dem iPad mit Tastatur gilt ⌘, am Laptop Strg.'),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}
document.addEventListener('keydown', (e) => {
  const imFeld = (el_) => !!(el_ && (el_.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')));
  if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (e.shiftKey) { if (typeof oeffneSuche === 'function') oeffneSuche(); } else spotlightOeffnen();
  } else if (e.key === '?' && !e.metaKey && !e.ctrlKey && !imFeld(e.target) && !document.querySelector('.schleier, .spotlight-bogen')) { e.preventDefault(); kuerzelZeigen(); }
});
