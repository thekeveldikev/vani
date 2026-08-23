/* ===================== 54e — DIE BLÄTTER AUF DEM TISCH =====================
   Drei Manuskripte liegen auf der Platte. Wer sie aussucht, ist eine Frage
   der Laune:

     · „VANI legt sie hin“ — die drei zuletzt beschriebenen Texte, wie bisher.
       Man kommt an den Tisch und sieht, woran man dran war.
     · „Ich lege sie hin“  — drei selbst gewählte. Die bleiben liegen, auch
       wenn man wochenlang woanders schreibt.

   Was gewählt ist, wird als Kennung gemerkt, nicht als Abschrift. Deshalb ist
   die Liste immer aktuell: ein neuer Text taucht sofort in der Auswahl auf,
   ein gelöschter verschwindet von selbst vom Tisch — es wird bei jedem
   Aufbau frisch nachgesehen, ob es ihn noch gibt. */

const TISCHBLATT_MODI = [
  ['vani', 'VANI legt sie hin', 'Die drei zuletzt beschriebenen Texte — der Tisch zeigt, woran du dran warst.'],
  ['selbst', 'Ich lege sie hin', 'Drei, die du selbst aussuchst. Die bleiben liegen.']
];
function tischblattModus(e) {
  const m = e && e.blaetterModus;
  return TISCHBLATT_MODI.some(([id]) => id === m) ? m : 'vani';
}
/* Was sich überhaupt auf den Tisch legen lässt. */
const TISCHBLATT_TYPEN = ['blatt', 'seite', 'szene', 'heft', 'projekt', 'schnipsel'];
function tischblattWaehlbar() {
  return [...D.docs.values()]
    .filter((d) => !d.geloescht && TISCHBLATT_TYPEN.includes(d.typ))
    .sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0));
}
function tischblattName(d) {
  if (!d) return '';
  const t = String(d.titel || '').trim();
  if (t) return t;
  const text = String(d.text || '').replace(/\s+/g, ' ').trim();
  if (text) { const kurz = text.slice(0, 40).trimEnd(); return kurz + (text.length > 40 ? ' …' : ''); }
  return { blatt: 'Blatt', seite: 'Heftseite', szene: 'Szene', heft: 'Heft', projekt: 'Projekt', schnipsel: 'Schnipsel' }[d.typ] || d.typ;
}
function tischblattArt(d) {
  return { blatt: 'Blatt', seite: 'Heftseite', szene: 'Szene', heft: 'Heft', projekt: 'Projekt', schnipsel: 'Schnipsel' }[d && d.typ] || '';
}
/* Nur Kennungen, höchstens drei, keine doppelt. Pur. */
function saubereTischblattWahl(liste) {
  if (!Array.isArray(liste)) return [];
  const raus = [];
  for (const x of liste) {
    const id = typeof x === 'string' ? x.slice(0, 200) : '';
    if (id && !raus.includes(id)) raus.push(id);
    if (raus.length >= 3) break;
  }
  return raus;
}
/* Die Blätter, die wirklich auf dem Tisch liegen — immer frisch nachgesehen. */
function tischblaetter(e) {
  if (tischblattModus(e) !== 'selbst') return schreibtischLetzteTexte(3);
  /* Gelöschtes fällt hier heraus, ohne dass die Wahl angefasst werden muss:
     die Kennung darf ruhig stehen bleiben, falls der Text aus dem Papierkorb
     zurückkommt. */
  return saubereTischblattWahl(e && e.blaetter).map((id) => D.docs.get(id)).filter((d) => d && !d.geloescht);
}

/* ----- Ein Blatt aussuchen ----- */
function tischblattWaehlen(vorhanden, fertig) {
  const alle = tischblattWaehlbar();
  const liste = el('div', { class: 'tb-liste' });
  const suchfeld = el('input', { type: 'search', class: 'tb-suche', placeholder: 'Suchen …' });
  const zeichne = () => {
    const q = suchfeld.value.trim().toLowerCase();
    const treffer = alle.filter((d) => !q || (tischblattName(d) + ' ' + (d.text || '')).toLowerCase().includes(q));
    liste.innerHTML = '';
    if (!treffer.length) { liste.append(el('div', { class: 'tb-leer' }, q ? 'Nichts gefunden.' : 'Noch nichts geschrieben.')); return; }
    for (const d of treffer.slice(0, 300)) {
      const schon = vorhanden.includes(d.id);
      liste.append(el('button', {
        class: 'tb-eintrag' + (schon ? ' schon' : ''), disabled: schon ? '' : null,
        title: schon ? 'Liegt schon auf dem Tisch' : 'Auf den Tisch legen',
        onclick: () => { zu(); fertig(d.id); }
      },
        el('span', { class: 'tb-art' }, tischblattArt(d)),
        el('span', { class: 'tb-name' }, tischblattName(d)),
        el('small', {}, schon ? 'liegt schon' : (d.geaendert ? vorZeit(d.geaendert) : ''))));
    }
  };
  suchfeld.addEventListener('input', zeichne);
  const kasten = el('div', { class: 'modal tb-fenster' },
    el('div', { class: 'kartenkopf' }, 'WAS SOLL DA LIEGEN?'),
    el('p', { class: 'tb-hinweis' }, 'Alles, was du geschrieben hast — das Neueste zuerst. Was du später schreibst, steht beim nächsten Mal ganz oben; was du löschst, verschwindet von selbst vom Tisch.'),
    suchfeld, liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen')));
  const zu = zeigeDeck(kasten);
  zeichne();
  setTimeout(() => suchfeld.focus(), 60);
}

/* ----- Der Abschnitt in „Schreibtisch einrichten“ ----- */
function tischblattEinstellung(e, danach) {
  const kasten = el('div', { class: 'einstellgruppe' });
  const zeichne = () => {
    kasten.innerHTML = '';
    const modus = tischblattModus(e);
    const wahl = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
    for (const [id, name] of TISCHBLATT_MODI) {
      wahl.append(el('button', { class: modus === id ? 'an' : '', onclick: () => { e.blaetterModus = id; D.einst.schreibtisch = { ...e }; speichereEinst(); zeichne(); if (danach) danach(); } }, name));
    }
    anfuegen(kasten,
      el('b', {}, 'Blätter auf dem Tisch'),
      el('div', { class: 'einstell-unter' }, TISCHBLATT_MODI.map(([id, name, was]) => name + ': ' + was).join('  ·  ')),
      wahl);
    if (modus !== 'selbst') return;
    const gewaehlt = saubereTischblattWahl(e.blaetter);
    const reihe = el('div', { class: 'tb-plaetze' });
    for (let i = 0; i < 3; i++) {
      const id = gewaehlt[i];
      const d = id ? D.docs.get(id) : null;
      const lebt = d && !d.geloescht;
      const setzen = (neuId) => {
        const w = saubereTischblattWahl(e.blaetter);
        if (neuId) w[i] = neuId; else w.splice(i, 1);
        e.blaetter = saubereTischblattWahl(w);
        D.einst.schreibtisch = { ...e }; speichereEinst(); zeichne(); if (danach) danach();
      };
      reihe.append(el('div', { class: 'tb-platz' + (lebt ? ' voll' : '') },
        el('span', { class: 'tb-nummer' }, String(i + 1)),
        el('button', { class: 'tb-platzknopf', onclick: () => tischblattWaehlen(gewaehlt.filter(Boolean), setzen) },
          lebt ? el('span', { class: 'tb-name' }, tischblattName(d)) : el('span', { class: 'tb-frei' }, 'leer — hier etwas hinlegen'),
          lebt ? el('small', {}, tischblattArt(d)) : null),
        lebt || id ? el('button', { class: 'tb-weg', title: 'Wieder wegnehmen', onclick: () => setzen('') }, '×') : null));
    }
    anfuegen(kasten, reihe,
      el('div', { class: 'einstell-unter' }, gewaehlt.length
        ? 'Was du löschst, verschwindet von selbst vom Tisch — die Wahl bleibt aber stehen, falls es aus dem Papierkorb zurückkommt.'
        : 'Noch nichts gewählt. Solange kein Platz belegt ist, bleibt die Platte an dieser Stelle leer.'));
  };
  zeichne();
  return kasten;
}
