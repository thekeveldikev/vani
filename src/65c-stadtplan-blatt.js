/* ===================== 65c — MARKEN UND EINRICHTEN =====================
   Die Zeichen auf der Karte und alles, was man an einem Plan verstellen
   kann. Die Zeichen sind geritzt, nicht gemalt: eine Linie, ein paar
   Striche, fertig. Ein buntes Symbol wäre ein Aufkleber; ein geritztes
   gehört zur Karte. */

const PLAN_ZEICHEN = {
  kirche: '<path d="M12 3v5M9.6 5.4h4.8"/><path d="M7 21v-8.6L12 8l5 4.4V21"/><path d="M10.6 21v-3.6h2.8V21"/>',
  burg: '<path d="M4 21V9h2.4V6.6h2.4V9h6.4V6.6h2.4V9H20v12Z"/><path d="M10.4 21v-4.6h3.2V21"/><path d="M7.6 12.4h1.6M14.8 12.4h1.6"/>',
  turm: '<path d="M8.6 21V7.4h6.8V21Z"/><path d="M8.6 7.4V5h1.7v1.4h1.8V5h1.7v1.4h1.6V7.4"/><path d="M11.2 21v-3.4h1.6V21"/><path d="M10.8 11.4h2.4"/>',
  tor: '<path d="M4 21V7h16v14"/><path d="M8.4 21v-6.6a3.6 3.6 0 0 1 7.2 0V21"/><path d="M4 7l8-4 8 4"/>',
  bruecke: '<path d="M3 15h18"/><path d="M6 15a6 6 0 0 1 12 0"/><path d="M3 15v4M21 15v4"/><path d="M9.6 15v-2.4M14.4 15v-2.4"/>',
  muehle: '<path d="M9 21V12h6v9Z"/><path d="M12 12V8"/><path d="M12 8 5.4 4.6M12 8l6.6 3.4M12 8l3.4-6M12 8l-3.4 6" stroke-linecap="round"/>',
  ruine: '<path d="M4 21V10l3-2v3l3-2.6V21"/><path d="M13 21V9l2.6 2.2V7.4L19 10v11"/><path d="M4 21h16"/>',
  markt: '<path d="M3 10.4 5.4 6h13.2L21 10.4Z"/><path d="M5 10.4V20h14v-9.6"/><path d="M9.4 20v-5.4h5.2V20"/><path d="M3 10.4h18"/>',
  brunnen: '<circle cx="12" cy="16.6" r="4.4"/><path d="M7.6 16.6h8.8"/><path d="M12 12.2V5.4"/><path d="M8 5.4h8"/><path d="M10.4 5.4 12 9l1.6-3.6"/>',
  platz: '<rect x="4" y="7" width="16" height="12" rx="1"/><path d="M4 11h16M4 15h16M9 7v12M15 7v12"/>',
  friedhof: '<path d="M12 21V7"/><path d="M8 11h8"/><path d="M4 21h16"/><path d="M6 21v-4a2 2 0 0 1 4 0v4"/>',
  garten: '<path d="M12 21v-6"/><path d="M12 15c-3.4 0-5.4-2-5.4-5S9 5 12 5s5.4 2 5.4 5-2 5-5.4 5Z"/><path d="M6 21h12"/>',
  hafen: '<path d="M12 21V7"/><circle cx="12" cy="4.4" r="2"/><path d="M8 9h8"/><path d="M5 14c0 4 3.4 7 7 7s7-3 7-7"/><path d="M5 14H3M19 14h2"/>',
  wirtshaus: '<path d="M7 4h8v6a4 4 0 0 1-8 0Z"/><path d="M15 5.4h2.6a2 2 0 0 1 0 4H15"/><path d="M11 14v6"/><path d="M7 20h8"/>',
  schmiede: '<path d="M4 12h9l6-4v8l-6-4"/><path d="M4 12v6"/><path d="M13 12v3.4"/><path d="M6 18h10" stroke-linecap="round"/>',
  baecker: '<path d="M4 15a8 4.6 0 0 1 16 0Z"/><path d="M4 15v2.4a8 4.6 0 0 0 16 0V15"/><path d="M8.6 12.4c.8-1.4 2-2 3.4-2s2.6.6 3.4 2"/>',
  buecher: '<path d="M4 5.4h6a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H4Z"/><path d="M20 5.4h-6a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h6Z"/>',
  apotheke: '<path d="M9.4 4h5.2v3.6H18v5.2h-3.4V21H9.4v-8.2H6V7.6h3.4Z"/>',
  wohnhaus: '<path d="M4 11 12 4l8 7"/><path d="M6.4 10v11h11.2V10"/><path d="M10.4 21v-5.4h3.2V21"/>',
  werkstatt: '<path d="M4 20V9l4-3 4 3v11Z"/><path d="M12 20V11l4-2.4 4 2.4v9Z"/><path d="M7.4 13.4h1.4M15.4 15h1.4"/>',
  galgen: '<path d="M6 21V4h9"/><path d="M15 4v4"/><circle cx="15" cy="10.4" r="2.4"/><path d="M4 21h5"/>',
  kerker: '<path d="M4 6h16v15H4Z"/><path d="M8 6v15M12 6v15M16 6v15"/><path d="M4 13h16"/>',
  grab: '<path d="M7 21V11a5 5 0 0 1 10 0v10Z"/><path d="M12 15.6V8.4M9.6 11h4.8"/><path d="M5 21h14"/>',
  unheil: '<path d="M12 3 22 20H2Z"/><path d="M12 9.6v5.2"/><circle cx="12" cy="17.4" r="1"/>',
  stern: '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6Z"/>',
  baum: '<path d="M12 21v-7"/><circle cx="12" cy="9" r="5.4"/><path d="M12 14 8.6 10.6M12 12l3-3"/>',
  stein: '<path d="M5 19 7 9l5-3 6 3 1 10Z"/><path d="M7 9l5 3 6-3M12 12v7"/>',
  weg: '<path d="M4 21c3-6 3-10 6-13s5-2 5-2"/><path d="M15 6h5M15 6l2.4-2.4M15 6l2.4 2.4"/>'
};
function planMarkenSymbol(art, groesse) {
  const g = groesse || 22;
  const inhalt = PLAN_ZEICHEN[art] || PLAN_ZEICHEN.stern;
  return '<svg viewBox="0 0 24 24" width="' + g + '" height="' + g + '" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inhalt + '</svg>';
}

/* ===================== ANLEGEN UND SCHREIBEN ===================== */
async function planSchreiben(doc, aendern) {
  if (!doc) return null;
  const plan = saubererPlan(doc);
  const neu = aendern(plan) || plan;
  Object.assign(doc, saubererPlan(neu));
  doc.titel = doc.titel || 'Ohne Namen';
  await speichere(doc);
  return doc;
}

function planNeu(danach) {
  const saat = planNeueSaat();
  const stand = {
    titel: planStadtname(saat), unterzeile: '', saat, welt: 'tinte', papier: '',
    stadt: { groesse: 'stadt', alter: 'alt', anlage: 'gewachsen', wasser: 'fluss', mauer: true, burg: true, umland: true, hafen: true, muehle: true, inseln: true, dichte: 1 },
    marken: [], namen: {}, notiz: ''
  };
  planGrundrissFenster(stand, 'Eine Stadt gründen', 'Gründen', () => {
    const doc = neuDoc('stadtplan', saubererPlan(stand));
    doc.titel = stand.titel;
    speichere(doc);
    toast('„' + stand.titel + '" liegt auf dem Tisch.', 4600);
    if (danach) danach(doc.id);
  });
}

function planEinrichten(doc, danach) {
  const stand = saubererPlan(doc);
  planGrundrissFenster(stand, 'Der Grundriss', 'Übernehmen', async () => {
    await planSchreiben(doc, () => stand);
    if (danach) danach();
  }, doc, danach);
}

/* ----- Das Fenster, in dem die Stadt entsteht -----
   Links steht, was man einstellt; rechts sieht man sofort, was daraus wird.
   Ohne diese Vorschau wäre jede Einstellung ein Blindflug. */
function planGrundrissFenster(stand, titel, okText, fertig, doc, danach) {
  const vorschau = el('div', { class: 'ktg-vorschau' });
  const zeigen = () => { vorschau.innerHTML = planVorschau(saubererPlan(stand)); };

  const namensfeld = el('input', { type: 'text', class: 'ktg-name', value: stand.titel, maxlength: '90', placeholder: 'Wie heißt die Stadt?' });
  namensfeld.addEventListener('input', () => { stand.titel = namensfeld.value; });
  const unterfeld = el('input', { type: 'text', value: stand.unterzeile, maxlength: '120', placeholder: 'Eine Zeile darunter — „an der Mündung", „im Jahr 1783"' });
  unterfeld.addEventListener('input', () => { stand.unterzeile = unterfeld.value; });

  const wuerfel = el('button', {
    class: 'ktg-wuerfel', title: 'Eine ganz andere Stadt aus derselben Vorgabe',
    onclick: () => { stand.saat = planNeueSaat(); saatfeld.value = stand.saat; zeigen(); }
  }, '↻ Andere Stadt');
  const saatfeld = el('input', { type: 'text', class: 'ktg-saat', value: stand.saat, maxlength: '60', placeholder: 'Saat' });
  saatfeld.addEventListener('input', entprellt(() => { stand.saat = saatfeld.value.trim() || planNeueSaat(); zeigen(); }, 320, true));
  const namenswuerfel = el('button', {
    class: 'ktg-wuerfel zart', title: 'Einen anderen Namen vorschlagen',
    onclick: () => { stand.titel = planStadtname(planNeueSaat()); namensfeld.value = stand.titel; }
  }, '↻ Name');

  const reihe = (liste, hol, setz, mitText) => {
    const kasten = el('div', { class: 'ktg-wahl' + (mitText ? ' breit' : '') });
    const zeichne = () => {
      kasten.innerHTML = '';
      for (const eintrag of liste) {
        const [id, name, text] = eintrag;
        kasten.append(el('button', {
          class: 'ktg-w' + (hol() === id ? ' an' : ''), title: text || name,
          onclick: () => { setz(id); zeichne(); zeigen(); }
        }, el('b', {}, name), mitText && text ? el('small', {}, text) : null));
      }
    };
    zeichne();
    return kasten;
  };

  const schalter = (name, hol, setz, hilfe) => el('button', {
    class: 'ktg-schalter' + (hol() ? ' an' : ''), title: hilfe,
    onclick: (ev) => { setz(!hol()); ev.currentTarget.classList.toggle('an', hol()); zeigen(); }
  }, el('i', {}), name);

  const dichte = el('input', { type: 'range', min: '50', max: '160', step: '5', value: String(Math.round(stand.stadt.dichte * 100)), class: 'ktg-regler' });
  const dichteText = el('small', { class: 'ktg-reglertext' });
  const dichteZeigen = () => {
    const v = stand.stadt.dichte;
    dichteText.textContent = v < 0.75 ? 'weit gebaut — Höfe, Gärten, Luft' : v > 1.25 ? 'eng gebaut — Haus an Haus, kaum Licht' : 'gewöhnlich dicht';
  };
  dichte.addEventListener('input', () => { stand.stadt.dichte = Number(dichte.value) / 100; dichteZeigen(); zeigen(); });

  const kasten = el('div', { class: 'modal ktg-fenster' },
    el('div', { class: 'kartenkopf' }, titel.toUpperCase()),
    el('div', { class: 'ktg-zwei' },
      el('div', { class: 'ktg-links' },
        el('div', { class: 'ktg-abschnitt' }, 'Wie sie heißt'),
        el('div', { class: 'reihe eng' }, namensfeld, namenswuerfel),
        unterfeld,
        el('div', { class: 'ktg-abschnitt' }, 'Wo sie liegt'),
        reihe(PLAN_WASSER, () => stand.stadt.wasser, (v) => { stand.stadt.wasser = v; }, true),
        el('div', { class: 'ktg-abschnitt' }, 'Wie groß'),
        reihe(PLAN_GROESSEN.map((g) => [g[0], g[1]]), () => stand.stadt.groesse, (v) => { stand.stadt.groesse = v; }),
        el('div', { class: 'ktg-abschnitt' }, 'Wie sie angelegt ist'),
        reihe(PLAN_ANLAGEN, () => stand.stadt.anlage, (v) => { stand.stadt.anlage = v; }, true),
        el('div', { class: 'ktg-abschnitt' }, 'Wie alt'),
        reihe(PLAN_ALTER.map((a) => [a[0], a[1], a[2]]), () => stand.stadt.alter, (v) => { stand.stadt.alter = v; }, true),
        el('div', { class: 'ktg-abschnitt' }, 'Wie dicht'),
        dichte, dichteText,
        el('div', { class: 'ktg-abschnitt' }, 'Was noch dazugehört'),
        el('div', { class: 'ktg-schalter-reihe' },
          schalter('Eine Stadtmauer', () => stand.stadt.mauer, (v) => { stand.stadt.mauer = v; }, 'Mit Türmen und Toren — und einer Vorstadt davor'),
          schalter('Eine Burg', () => stand.stadt.burg, (v) => { stand.stadt.burg = v; }, 'Wer über der Stadt sitzt'),
          schalter('Das Umland', () => stand.stadt.umland, (v) => { stand.stadt.umland = v; }, 'Felder in Fluren, Wälder, einzelne Höfe'),
          /* Am Wasser: was eine Stadt zur Hafenstadt macht. Ohne Wasser
             bleiben die Schalter sichtbar, aber blass — sie sollen nicht
             wegspringen, sobald man den Fluss wegnimmt, und wieder da sein,
             wenn man ihn zurückholt. */
          schalter('Ein Hafen', () => stand.stadt.hafen, (v) => { stand.stadt.hafen = v; }, 'Kai, Molen, Schiffe, Kräne — am Meer dazu ein Wellenbrecher und ein Leuchtfeuer'),
          schalter('Eine Mühle', () => stand.stadt.muehle, (v) => { stand.stadt.muehle = v; }, 'Ein Rad im Fluss, das Haus am Ufer'),
          schalter('Werder im Wasser', () => stand.stadt.inseln, (v) => { stand.stadt.inseln = v; }, 'Kleine bewachsene Inseln')),
        el('div', { class: 'ktg-abschnitt' }, 'Wie sie aussieht'),
        reihe(PLAN_FARBWELTEN.map((f) => [f.id, f.name]), () => stand.welt, (v) => { stand.welt = v; }),
        reihe([['', 'Zur Farbwelt passend']].concat(PLAN_PAPIERE.map((p) => [p[0], p[1]])), () => stand.papier, (v) => { stand.papier = v; }),
        el('div', { class: 'ktg-abschnitt' }, 'Die Saat'),
        el('small', { class: 'ktg-hilfe' }, 'Aus ihr wird jede Gasse gerechnet. Dieselbe Saat ergibt immer dieselbe Stadt — schreib etwas hinein, das dir gefällt, oder würfle.'),
        el('div', { class: 'reihe eng' }, saatfeld, wuerfel)),
      el('div', { class: 'ktg-rechts' },
        vorschau,
        el('small', { class: 'ktg-vorschautext' }, 'So wird sie liegen. Namen und Marken kommen danach.'))),
    el('div', { class: 'reihe' },
      doc ? el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (await frage('„' + saubererPlan(doc).titel + '" vom Tisch nehmen?', { ja: 'Wegnehmen' })) {
          await loesche(doc.id);
          zu();
          const h = document.querySelector('.kt-huelle');
          const s = h && h.closest('.schleier');
          if (s) s.remove();
          if (danach) danach();
        }
      } }, 'Vom Tisch nehmen') : null,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => {
        stand.titel = (namensfeld.value || '').trim() || planStadtname(stand.saat);
        stand.unterzeile = (unterfeld.value || '').trim();
        zu(); fertig();
      } }, okText)));
  const zu = zeigeDeck(kasten);
  dichteZeigen(); zeigen();
  setTimeout(() => namensfeld.focus(), 60);
}

/* ===================== EINE MARKE ===================== */
function planMarkeAnlegen(doc, x, y, danach) {
  const marke = {
    id: uid(), art: _kt.markeArt, name: '', notiz: '', albumId: '',
    x: Math.round(x), y: Math.round(y), wichtig: false
  };
  planSchreiben(doc, (p) => { p.marken.push(marke); return p; })
    .then(() => { if (danach) danach(); planMarkeBearbeiten(D.docs.get(_kt.id), marke, danach, true); });
}

function planMarkeBearbeiten(doc, marke, danach, frisch) {
  const plan = saubererPlan(doc);
  const stand = Object.assign({}, plan.marken.find((m) => m.id === marke.id) || marke);

  const namensfeld = el('input', { type: 'text', class: 'ktm-name', value: stand.name, maxlength: '90', placeholder: 'Wie heißt die Stelle?' });
  namensfeld.addEventListener('input', () => { stand.name = namensfeld.value; });
  const notizfeld = el('textarea', { class: 'ktm-notiz', rows: '4', maxlength: '2000', placeholder: 'Was ist hier? Was geschah hier? Wer wohnt hier?' }, stand.notiz);
  notizfeld.addEventListener('input', () => { stand.notiz = notizfeld.value; });

  const artwahl = el('div', { class: 'ktm-arten' });
  const artenZeichnen = () => {
    artwahl.innerHTML = '';
    for (const [gid, gname] of PLAN_MARKENGRUPPEN) {
      artwahl.append(el('div', { class: 'ktm-gruppe' }, gname));
      const reihe = el('div', { class: 'ktm-reihe' });
      for (const a of PLAN_MARKEN.filter((m) => m.gruppe === gid)) {
        reihe.append(el('button', {
          class: 'ktm-art' + (stand.art === a.id ? ' an' : ''), title: a.name,
          onclick: () => { stand.art = a.id; artenZeichnen(); }
        }, el('span', { html: planMarkenSymbol(a.id, 20) }), el('small', {}, a.name)));
      }
      artwahl.append(reihe);
    }
  };
  artenZeichnen();

  /* --- Verknüpfung mit dem Album --- */
  const figuren = typeof albumFiguren === 'function' ? albumFiguren() : [];
  const figurzeile = el('div', { class: 'ktm-figur' });
  const figurZeichnen = () => {
    figurzeile.innerHTML = '';
    if (!figuren.length) {
      figurzeile.append(el('small', { class: 'ktg-hilfe' }, 'Sobald Figuren im Album wohnen, kannst du eine mit dieser Stelle verbinden.'));
      return;
    }
    const gewaehlt = figuren.find((f) => f.id === stand.albumId);
    figurzeile.append(el('button', {
      class: 'ktm-figurknopf' + (gewaehlt ? ' an' : ''),
      onclick: () => planFigurWaehlen(figuren, stand.albumId, (id) => { stand.albumId = id; figurZeichnen(); })
    }, gewaehlt ? 'Gehört zu ' + (gewaehlt.name || 'ohne Namen') : '+ Mit einer Figur verbinden'));
    if (gewaehlt) figurzeile.append(el('button', { class: 'ktm-figurweg', title: 'Verbindung lösen', onclick: () => { stand.albumId = ''; figurZeichnen(); } }, '×'));
  };
  figurZeichnen();

  const kasten = el('div', { class: 'modal ktm-fenster' },
    el('div', { class: 'kartenkopf' }, frisch ? 'EINE STELLE BENENNEN' : 'DIESE STELLE'),
    namensfeld,
    el('div', { class: 'ktm-abschnitt' }, 'Was ist das'),
    artwahl,
    el('div', { class: 'ktm-abschnitt' }, 'Dazu'),
    notizfeld,
    el('label', { class: 'ktm-wichtig' },
      (() => {
        const c = el('input', { type: 'checkbox' });
        c.checked = !!stand.wichtig;
        c.addEventListener('change', () => { stand.wichtig = c.checked; });
        return c;
      })(),
      el('span', {}, 'Wichtig — größer zeichnen und immer beschriften')),
    el('div', { class: 'ktm-abschnitt' }, 'Im Album'),
    figurzeile,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart gefahr', onclick: async () => {
        await planSchreiben(doc, (p) => { p.marken = p.marken.filter((m) => m.id !== stand.id); return p; });
        if (_kt.nurMarke === stand.id) _kt.nurMarke = '';
        zu(); if (danach) danach();
      } }, 'Wegnehmen'),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: async () => {
        await planSchreiben(doc, (p) => {
          const i = p.marken.findIndex((m) => m.id === stand.id);
          if (i >= 0) p.marken[i] = stand; else p.marken.push(stand);
          return p;
        });
        zu(); if (danach) danach();
      } }, 'Fertig')));
  const zu = zeigeDeck(kasten);
  setTimeout(() => namensfeld.focus(), 60);
}

function planFigurWaehlen(figuren, jetzt, fertig) {
  const suchfeld = el('input', { type: 'search', placeholder: 'Figur suchen …' });
  const liste = el('div', { class: 'ktm-figurliste' });
  const zeichne = () => {
    const q = suchfeld.value.trim().toLowerCase();
    liste.innerHTML = '';
    const treffer = figuren.filter((f) => !q || (f.name || '').toLowerCase().includes(q));
    if (!treffer.length) { liste.append(el('div', { class: 'leer klein' }, 'Niemand passt dazu.')); return; }
    for (const f of treffer.slice(0, 60)) {
      liste.append(el('button', {
        class: 'ktm-figurzeile' + (jetzt === f.id ? ' an' : ''),
        onclick: () => { zu(); fertig(f.id); }
      }, el('b', {}, f.name || 'ohne Namen')));
    }
  };
  suchfeld.addEventListener('input', zeichne);
  const kasten = el('div', { class: 'modal ktm-figurfenster' },
    el('div', { class: 'kartenkopf' }, 'WER WOHNT HIER'),
    suchfeld, liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen')));
  const zu = zeigeDeck(kasten);
  zeichne();
  setTimeout(() => suchfeld.focus(), 60);
}

/* ===================== DAS VERZEICHNIS ===================== */
function planVerzeichnis(doc, danach) {
  const plan = saubererPlan(doc);
  const flaeche = document.querySelector('.kt-flaeche');
  const g = (flaeche && flaeche._gebaut) || planBauen(plan);
  const auff = planAuffaelligkeiten(plan, g);

  const springe = (x, y, markeId) => {
    zu();
    planHinschauen(document.querySelector('.kt-flaeche'), x, y);
    if (markeId) { _kt.nurMarke = markeId; if (danach) danach(); }
  };

  const markenListe = el('div', { class: 'ktv-liste' });
  const nachGruppe = new Map();
  for (const m of plan.marken) {
    const gr = planMarke(m.art).gruppe;
    if (!nachGruppe.has(gr)) nachGruppe.set(gr, []);
    nachGruppe.get(gr).push(m);
  }
  if (!plan.marken.length) {
    markenListe.append(el('div', { class: 'leer klein' }, 'Noch ist keine Stelle benannt. Nimm oben das Marken-Werkzeug und tipp auf die Karte.'));
  }
  for (const [gid, gname] of PLAN_MARKENGRUPPEN) {
    const drin = (nachGruppe.get(gid) || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'));
    if (!drin.length) continue;
    markenListe.append(el('div', { class: 'ktv-gruppe' }, gname));
    for (const m of drin) {
      markenListe.append(el('button', { class: 'ktv-zeile', onclick: () => springe(m.x, m.y, m.id) },
        el('i', { html: planMarkenSymbol(m.art, 15) }),
        el('b', {}, m.name || el('span', { class: 'blass' }, 'ohne Namen')),
        el('small', {}, planMarke(m.art).name)));
    }
  }

  const gassenListe = el('div', { class: 'ktv-liste' });
  const gassen = g.stadt.strassen.filter((s) => s.art !== 'gasse');
  for (const s of gassen) {
    const name = planStrassenname(plan, s);
    const k = 'gasse:' + s.richtung + ':' + (s.richtung === 'speiche' ? s.i : s.j);
    const p = s.punkte[Math.floor(s.punkte.length / 2)];
    gassenListe.append(el('div', { class: 'ktv-gasse' },
      el('button', { class: 'ktv-gassename', onclick: () => springe(p[0], p[1]) }, name),
      el('small', {}, s.art === 'haupt' ? 'Hauptstraße' : s.art === 'mauerweg' ? 'am Wall' : 'Ring'),
      el('button', {
        class: 'ktv-umbenennen', title: 'Anders nennen',
        onclick: async () => {
          const neuName = await eingabe({ titel: 'Wie soll sie heißen?', wert: name, ok: 'Übernehmen' });
          if (neuName == null) return;
          await planSchreiben(doc, (pp) => {
            if (neuName.trim()) pp.namen[k] = neuName.trim(); else delete pp.namen[k];
            return pp;
          });
          zu(); if (danach) danach(); planVerzeichnis(D.docs.get(_kt.id), danach);
        }
      }, '✎')));
  }

  const viertelListe = el('div', { class: 'ktv-liste' });
  for (const v of g.stadt.viertel) {
    const name = planViertelnameVon(plan, v);
    viertelListe.append(el('div', { class: 'ktv-gasse' },
      el('span', { class: 'ktv-gassename fest' }, name),
      el('small', {}, planViertelart(v.art).name),
      el('button', {
        class: 'ktv-umbenennen', title: 'Anders nennen',
        onclick: async () => {
          const neuName = await eingabe({ titel: 'Wie soll das Viertel heißen?', wert: name, ok: 'Übernehmen' });
          if (neuName == null) return;
          await planSchreiben(doc, (pp) => {
            if (neuName.trim()) pp.namen['viertel:' + v.nr] = neuName.trim(); else delete pp.namen['viertel:' + v.nr];
            return pp;
          });
          zu(); if (danach) danach(); planVerzeichnis(D.docs.get(_kt.id), danach);
        }
      }, '✎')));
  }

  let reiter = 'marken';
  const inhalt = el('div', { class: 'ktv-inhalt' });
  const reiterleiste = el('div', { class: 'ktv-reiter' });
  const zeichne = () => {
    reiterleiste.innerHTML = '';
    for (const [id, name, n] of [['marken', 'Marken', plan.marken.length], ['gassen', 'Gassen', gassen.length], ['viertel', 'Viertel', g.stadt.viertel.length]]) {
      reiterleiste.append(el('button', { class: 'ktv-r' + (reiter === id ? ' an' : ''), onclick: () => { reiter = id; zeichne(); } }, name, el('i', {}, String(n))));
    }
    inhalt.innerHTML = '';
    inhalt.append(reiter === 'marken' ? markenListe : reiter === 'gassen' ? gassenListe : viertelListe);
  };
  zeichne();

  const kasten = el('div', { class: 'modal ktv-fenster' },
    el('div', { class: 'kartenkopf' }, 'DAS VERZEICHNIS'),
    reiterleiste, inhalt,
    auff.length ? el('details', { class: 'ktv-auff' },
      el('summary', {}, auff.length === 1 ? 'Eines fällt auf' : auff.length + ' Dinge fallen auf'),
      ...auff.map((a) => el('button', {
        class: 'ktv-auffzeile', onclick: () => { if (a.marke) springe(a.marke.x, a.marke.y, a.marke.id); }
      }, a.text))) : null,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { zu(); planAlsBlatt(plan, g); } }, 'Als Blatt ablegen'),
      el('button', { class: 'knopf voll', onclick: () => zu() }, 'Zurück zur Karte')));
  const zu = zeigeDeck(kasten);
}

/* ===================== ALS BLATT ABLEGEN =====================
   Eine Karte ist ein Bild. Zum Schreiben braucht man Sätze — also legt
   VANI die Stadt auch als Text ab. */
function planAlsBlatt(plan, g) {
  const zeilen = [];
  zeilen.push(plan.titel.toUpperCase());
  if (plan.unterzeile) zeilen.push(plan.unterzeile);
  zeilen.push('');
  const w = PLAN_WASSER.find((x) => x[0] === plan.stadt.wasser);
  zeilen.push(planGroesse(plan.stadt.groesse)[1] + '. ' + (w ? w[2] : ''));
  zeilen.push(PLAN_ALTER.find((a) => a[0] === plan.stadt.alter)[2]);
  zeilen.push('Ungefähr ' + g.stadt.haeuser.length + ' Häuser, ' + g.stadt.bloecke.length + ' Blöcke.');
  if (g.stadt.mauer) zeilen.push('Eine Mauer mit ' + g.stadt.mauer.tore.length + ' Toren: ' + g.stadt.mauer.tore.map((t) => planTornameVon(plan, t)).join(', ') + '.');
  if (g.stadt.bruecken.length) zeilen.push(g.stadt.bruecken.length === 1 ? 'Eine Brücke.' : g.stadt.bruecken.length + ' Brücken.');
  zeilen.push('');
  zeilen.push('DIE VIERTEL');
  for (const v of g.stadt.viertel) zeilen.push('· ' + planViertelnameVon(plan, v) + ' — ' + planViertelart(v.art).name);
  zeilen.push('');
  zeilen.push('DIE STRASSEN');
  for (const s of g.stadt.strassen.filter((x) => x.art !== 'gasse')) zeilen.push('· ' + planStrassenname(plan, s));
  if (plan.marken.length) {
    zeilen.push('');
    zeilen.push('WAS EINEN NAMEN HAT');
    for (const [gid, gname] of PLAN_MARKENGRUPPEN) {
      const drin = plan.marken.filter((m) => planMarke(m.art).gruppe === gid && m.name);
      if (!drin.length) continue;
      zeilen.push(gname + ':');
      for (const m of drin) zeilen.push('· ' + m.name + ' (' + planMarke(m.art).name + ')' + (m.notiz ? ' — ' + m.notiz.split('\n')[0] : ''));
    }
  }
  if (plan.notiz) { zeilen.push(''); zeilen.push('NOTIZEN'); zeilen.push(plan.notiz); }
  zeilen.push('');
  zeilen.push('Saat: ' + plan.saat);
  blattAusText(plan.titel + ' — Stadtplan', zeilen.join('\n'));
  toast('Liegt bei den Blättern. Jetzt kannst du daraus schreiben.', 4600);
}

/* ===================== DAS MENÜ AN DER KACHEL ===================== */
function planKachelMenue(doc, neu) {
  const plan = saubererPlan(doc);
  menue([
    { text: 'Aufschlagen', tun: () => planOeffnen(doc.id) },
    { text: 'Der Grundriss', tun: () => planEinrichten(doc, neu) },
    { text: 'Abschreiben', tun: async () => {
      const kopie = neuDoc('stadtplan', saubererPlan(Object.assign({}, plan, {
        titel: plan.titel + ' (Abschrift)', marken: plan.marken.map((m) => Object.assign({}, m, { id: uid() }))
      })));
      kopie.titel = plan.titel + ' (Abschrift)';
      await speichere(kopie);
      toast('Abgeschrieben.');
      if (neu) neu();
    } },
    { text: 'Als Blatt ablegen', tun: () => planAlsBlatt(plan, planBauen(plan)) },
    { text: 'Vom Tisch nehmen', rot: true, tun: async () => {
      if (await frage('„' + plan.titel + '" vom Tisch nehmen?', { ja: 'Wegnehmen' })) { await loesche(doc.id); if (neu) neu(); }
    } }
  ]);
}
