/* ===================== 61b — DER KALENDER, SICHTBAR =====================
   Das Buch liegt aufgeschlagen auf dem Tisch. Ein Tippen, und es klappt auf:
   ein Monat, ein Tag, ein Leben.

   Zu den Zeichen: keine Torten, keine Herzchen. Für Geburt und Tod nimmt der
   Kalender, was in deutschen Familienbüchern seit jeher steht — den Stern und
   das Kreuzzeichen, * und †. Alles andere sind geritzte Linien: ein Weg, der
   sich gabelt; eine Naht; ein Siegel. Zeichen, keine Bildchen.

   Und wer ein eigenes will, zeichnet es selbst. */

/* ----- Die geritzten Zeichen. 24×24, nur Linien. ----- */
const KAL_ICONS = {
  /* Geburt: der Stern der Familienbücher */
  keim: '<path d="M12 4v16M5 7.5l14 9M19 7.5l-14 9"/>',
  /* Tod: das Kreuzzeichen der Familienbücher — schmal, aufrecht */
  kreuzweg: '<path d="M12 3v18M7.5 8h9"/>',
  /* Begegnung: zwei Wege laufen zusammen */
  zweiwege: '<path d="M4 4c3 5 5 7 8 8 3-1 5-3 8-8M12 12v8"/>',
  /* Abschied: einer wird zu zweien */
  wegfort: '<path d="M12 4v8M12 12c-3 1-5 3-8 8M12 12c3 1 5 3 8 8"/>',
  /* Bund: zwei Ringe, ineinander */
  ring: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
  /* Bruch: eine Linie, die reißt */
  riss: '<path d="M3 12h6l2-4 2 8 2-4h6"/>',
  /* Reise: ein Pfad, gestrichelt */
  pfad: '<path d="M3 18c4 0 4-6 8-6s4 6 8 6" stroke-dasharray="3 3"/><path d="M17 15l3 3-3 3"/>',
  /* Ankunft: eine Schwelle, über die jemand tritt */
  schwelle: '<path d="M4 20h16M8 20V8h8v12M3 12h5"/>',
  /* Wunde: eine genähte Naht */
  naht: '<path d="M3 12h18M7 9v6M11 9v6M15 9v6"/>',
  /* Fund: ein Stein in der Hand */
  stein: '<path d="M6 15c0-4 3-7 6-7s6 3 6 7-3 5-6 5-6-1-6-5z"/><path d="M9 13c1-1 2-1.5 3-1.5"/>',
  /* Verlust: die Stelle, wo etwas war */
  leer: '<circle cx="12" cy="12" r="7" stroke-dasharray="2.5 3.5"/>',
  /* Schwur: ein Siegel */
  siegel: '<circle cx="12" cy="12" r="7"/><path d="M9 12l2 2 4-4"/>',
  /* Geheimnis: ein Schlüsselloch */
  schloss: '<circle cx="12" cy="10" r="3"/><path d="M10.5 12.5L9.5 18h5l-1-5.5"/>',
  /* Wende: der Weg knickt ab */
  scheide: '<path d="M4 20V9a4 4 0 014-4h9"/><path d="M14 2l4 3-4 3"/>',
  /* Brief: ein gefaltetes Blatt */
  faltung: '<path d="M4 6h16v12H4z"/><path d="M4 6l8 6 8-6"/>',
  /* Ereignis: ein Punkt, der zählt */
  punktkreis: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>'
};
/* Ein Zeichen als SVG. Eigene Zeichen ('eigen:<id>') werden aus ihren Strichen gebaut. */
function kalIcon(schluessel, groesse = 22) {
  const s = String(schluessel || '');
  if (s.startsWith('eigen:')) {
    const d = D.docs.get(s.slice(6));
    if (d && Array.isArray(d.striche)) return kalStricheSVG(d.striche, groesse);
    return kalIcon('punktkreis', groesse);
  }
  const pfad = KAL_ICONS[s] || KAL_ICONS.punktkreis;
  return '<svg viewBox="0 0 24 24" width="' + groesse + '" height="' + groesse + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + pfad + '</svg>';
}
/* Selbstgezeichnete Zeichen: Striche in 0..1, hier auf 24 gerechnet. */
function kalStricheSVG(striche, groesse = 22) {
  const linien = striche.slice(0, 40).map((st) => {
    const p = (st || []).slice(0, 400).map(([x, y]) => (x * 24).toFixed(1) + ',' + (y * 24).toFixed(1)).join(' ');
    return p ? '<polyline points="' + p + '"/>' : '';
  }).join('');
  return '<svg viewBox="0 0 24 24" width="' + groesse + '" height="' + groesse + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + linien + '</svg>';
}
function kalEigeneIcons() { return [...D.docs.values()].filter((d) => d.typ === 'kalicon' && !d.geloescht && Array.isArray(d.striche) && d.striche.length); }
function saubereStricheEinfach(striche) {
  if (!Array.isArray(striche)) return [];
  return striche.slice(0, 40).map((st) => Array.isArray(st)
    ? st.slice(0, 400).map((p) => Array.isArray(p) ? [begrenze(p[0], 0, 1, .5), begrenze(p[1], 0, 1, .5)] : null).filter(Boolean)
    : []).filter((st) => st.length > 1);
}

/* ----- Ein eigenes Zeichen malen ----- */
function kalIconMalen(fertig) {
  const groesse = 260;
  const leinwand = el('canvas', { class: 'kal-malpad', width: String(groesse), height: String(groesse) });
  const ctx = leinwand.getContext('2d');
  let striche = [], aktuell = null;
  const male = () => {
    ctx.clearRect(0, 0, groesse, groesse);
    /* Hilfsraster: ein Kreuz, damit das Zeichen mittig wird */
    ctx.strokeStyle = 'rgba(160,140,110,.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(groesse / 2, 12); ctx.lineTo(groesse / 2, groesse - 12); ctx.moveTo(12, groesse / 2); ctx.lineTo(groesse - 12, groesse / 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(160,140,110,.16)';
    ctx.strokeRect(groesse * .16, groesse * .16, groesse * .68, groesse * .68);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--tinte') || '#3a2f26';
    ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const st of [...striche, aktuell].filter(Boolean)) {
      if (st.length < 2) continue;
      ctx.beginPath(); ctx.moveTo(st[0][0] * groesse, st[0][1] * groesse);
      for (const [x, y] of st.slice(1)) ctx.lineTo(x * groesse, y * groesse);
      ctx.stroke();
    }
  };
  const punkt = (ev) => { const r = leinwand.getBoundingClientRect(); return [begrenze((ev.clientX - r.left) / r.width, 0, 1, .5), begrenze((ev.clientY - r.top) / r.height, 0, 1, .5)]; };
  leinwand.addEventListener('pointerdown', (ev) => { ev.preventDefault(); leinwand.setPointerCapture(ev.pointerId); aktuell = [punkt(ev)]; male(); });
  leinwand.addEventListener('pointermove', (ev) => { if (!aktuell) return; const p = punkt(ev); const l = aktuell[aktuell.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > .012) { aktuell.push(p); male(); } });
  const auf = () => { if (aktuell && aktuell.length > 1) striche.push(aktuell); aktuell = null; male(); vorschauen(); };
  leinwand.addEventListener('pointerup', auf); leinwand.addEventListener('pointercancel', auf);
  const vorschau = el('span', { class: 'kal-malvorschau' });
  const vorschauen = () => { vorschau.innerHTML = striche.length ? kalStricheSVG(striche, 30) : ''; };
  const kasten = el('div', { class: 'modal kal-malfenster' },
    el('div', { class: 'kartenkopf' }, 'EIN EIGENES ZEICHEN'),
    el('p', { class: 'kal-hinweis' }, 'Zeichne es in Ruhe. Es wird auf Strichstärke gebracht und überall dort klein dargestellt, wo der Termin steht — im Raster, im Tag, im Lebensband.'),
    leinwand,
    el('div', { class: 'kal-malfuss' }, el('span', {}, 'So klein wird es:'), vorschau),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { striche = []; aktuell = null; male(); vorschauen(); } }, 'Noch einmal'),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => {
        const sauber = saubereStricheEinfach(striche);
        if (!sauber.length) { toast('Da ist noch nichts gezeichnet.'); return; }
        const d = neuDoc('kalicon', { striche: sauber, titel: 'Eigenes Zeichen' });
        zu(); toast('Das Zeichen ist da.');
        if (fertig) fertig('eigen:' + d.id);
      } }, 'Nehmen')));
  const zu = zeigeDeck(kasten);
  male();
}

/* ----- Das Zeichen wählen ----- */
function kalIconWaehlen(aktuell, fertig) {
  const eigene = kalEigeneIcons();
  const knopf = (schluessel, name) => el('button', {
    class: 'kal-iconwahl' + (schluessel === aktuell ? ' an' : ''), title: name,
    onclick: () => { zu(); fertig(schluessel); }
  }, el('span', { class: 'kal-iconbild', html: kalIcon(schluessel, 26) }), el('small', {}, name));
  const kasten = el('div', { class: 'modal kal-iconfenster' },
    el('div', { class: 'kartenkopf' }, 'DAS ZEICHEN'),
    el('div', { class: 'kal-icongitter' }, ...KAL_ARTEN.map((a) => knopf(a.icon, a.name))),
    eigene.length ? el('div', { class: 'kal-abschnitt' }, 'Deine eigenen') : null,
    eigene.length ? el('div', { class: 'kal-icongitter' }, ...eigene.map((d) => el('div', { class: 'kal-eigenwahl' },
      knopf('eigen:' + d.id, 'Eigenes'),
      el('button', { class: 'kal-iconweg', title: 'Dieses Zeichen wegwerfen', onclick: async () => { if (await frage('Dieses Zeichen wegwerfen?', { ja: 'Wegwerfen' })) { await loesche(d.id, true); zu(); kalIconWaehlen(aktuell, fertig); } } }, '×'))) ) : null,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { zu(); kalIconMalen(fertig); } }, 'Selbst zeichnen'),
      el('button', { class: 'knopf zart', onclick: () => { zu(); fertig(''); } }, 'Das der Art nehmen')));
  const zu = zeigeDeck(kasten);
}

/* ----- Ein Termin: anlegen und ändern ----- */
/* Namen sind freier Text. Wer will, hängt eine vorhandene Figur daran — wer
   nicht will, tippt einfach einen Namen. Der Kalender gehört dem Kopf, nicht
   der Textsammlung. */
function kalTerminBearbeiten(doc, vorgabe, danach) {
  const neu = !doc;
  const stand = saubererTermin(doc || { wann: vorgabe || kalHeute(), art: 'ereignis' }) || saubererTermin({ wann: kalHeute() });
  let art = stand.art, icon = stand.icon, leute = stand.leute.slice();

  const titel = el('input', { type: 'text', value: stand.titel, placeholder: 'Was geschieht? (darf leer bleiben)', maxlength: '200' });
  const wannTeile = kalTeile(stand.wann);
  const jahr = el('input', { type: 'number', class: 'kal-jahr', min: String(KAL_JAHR_VON), max: String(KAL_JAHR_BIS), value: String(wannTeile.jahr) });
  const monat = el('select', { class: 'kal-monat' }, el('option', { value: '' }, 'ganzes Jahr'), ...KAL_MONATE.map((m, i) => el('option', { value: String(i + 1) }, m)));
  const tag = el('select', { class: 'kal-tag' });
  const wochentag = el('span', { class: 'kal-wochentag' });
  monat.value = wannTeile.monat == null ? '' : String(wannTeile.monat);
  const fuelleTage = () => {
    const j = Number(jahr.value) || KAL_JAHR_VON, m = Number(monat.value) || 0;
    const alt = tag.value;
    tag.innerHTML = '';
    tag.append(el('option', { value: '' }, m ? 'ganzer Monat' : '—'));
    if (m) for (let t = 1; t <= kalMonatstage(j, m); t++) tag.append(el('option', { value: String(t) }, t + '.'));
    tag.value = alt && Number(alt) <= kalMonatstage(j, m || 1) ? alt : '';
    tag.disabled = !m;
    zeigeWochentag();
  };
  const gewaehltesDatum = () => kalDatum(Number(jahr.value), monat.value ? Number(monat.value) : null, tag.value ? Number(tag.value) : null);
  const zeigeWochentag = () => {
    const d = gewaehltesDatum();
    const t = kalTeile(d);
    if (t && t.genau === 'tag') {
      const mond = typeof mondphase === 'function' ? mondphase(kalZeit(d)) : null;
      const mondwort = mond == null ? '' : mond < .03 || mond > .97 ? ' · Neumond' : Math.abs(mond - .5) < .03 ? ' · Vollmond' : '';
      wochentag.textContent = KAL_TAGE[kalWochentag(d)] + ' · KW ' + kalWoche(d) + ' · ' + kalJahreszeit(d) + mondwort;
    } else if (t) wochentag.textContent = t.genau === 'monat' ? 'ungefähr — irgendwann in dem Monat' : 'ungefähr — irgendwann in dem Jahr';
    else wochentag.textContent = '';
    zeigeAlter();
  };
  jahr.addEventListener('input', fuelleTage); monat.addEventListener('change', fuelleTage); tag.addEventListener('change', zeigeWochentag);

  /* Zeitraum: nur wenn gewünscht */
  const bisAn = el('input', { type: 'checkbox' });
  /* Ein Datumsfeld kann nur ganze Tage. Ein ungenaues Ende ('2026-08') waere
     darin unsichtbar - dann lieber gar keins zeigen als ein leeres Feld. */
  const bisTag = kalTeile(stand.bis) && kalTeile(stand.bis).genau === 'tag' ? stand.bis : '';
  const bisFeld = el('input', { type: 'date', class: 'kal-bis', min: KAL_JAHR_VON + '-01-01', max: KAL_JAHR_BIS + '-12-31', value: bisTag });
  bisAn.checked = !!bisTag;
  const bisZeile = el('label', { class: 'kal-bisreihe' }, bisAn, el('span', {}, 'Es dauert länger — bis'), bisFeld);

  /* Die Art */
  const artWahl = el('div', { class: 'kal-artwahl' });
  const zeichneArten = () => {
    artWahl.innerHTML = '';
    for (const a of KAL_ARTEN) {
      artWahl.append(el('button', { type: 'button', class: 'kal-artknopf' + (a.id === art ? ' an' : ''), title: a.name, style: '--artfarbe:' + a.farbe, onclick: () => { art = a.id; zeichneArten(); zeigeZeichen(); zeigeAlter(); } },
        el('span', { class: 'kal-artbild', html: kalIcon(a.icon, 20) }), el('small', {}, a.name)));
    }
  };
  zeichneArten();

  /* Das Zeichen */
  const zeichenKnopf = el('button', { type: 'button', class: 'kal-zeichenknopf', onclick: () => kalIconWaehlen(icon || kalArt(art).icon, (neuIcon) => { icon = neuIcon; zeigeZeichen(); }) });
  const zeigeZeichen = () => { zeichenKnopf.innerHTML = ''; anfuegen(zeichenKnopf, el('span', { class: 'kal-iconbild', html: kalIcon(icon || kalArt(art).icon, 24) }), el('small', {}, icon ? 'eigenes Zeichen' : 'Zeichen der Art')); };
  zeigeZeichen();

  /* Die Leute: frei getippt. Vorhandene Figuren werden vorgeschlagen, mehr nicht. */
  const leuteReihe = el('div', { class: 'kal-leute' });
  const namensfeld = el('input', { type: 'text', placeholder: 'Ein Name — einfach tippen', maxlength: '120', list: 'kal-namensliste' });
  const alterZeile = el('div', { class: 'kal-alterzeile' });
  const zeigeLeute = () => {
    leuteReihe.innerHTML = '';
    for (const p of leute) {
      leuteReihe.append(el('span', { class: 'kal-person' }, p.name,
        el('button', { type: 'button', title: 'Weg damit', onclick: () => { leute = leute.filter((x) => x !== p); zeigeLeute(); } }, '×')));
    }
    if (!leute.length) leuteReihe.append(el('span', { class: 'kal-leerhinweis' }, 'Noch niemand. Muss auch nicht sein.'));
    zeigeAlter();
  };
  const nameDazu = () => {
    const n = namensfeld.value.trim();
    if (!n) return;
    if (leute.some((p) => p.name.toLowerCase() === n.toLowerCase())) { namensfeld.value = ''; return; }
    /* Gibt es zufällig eine Figur mit dem Namen, wird sie mitverknüpft — sonst nicht. */
    const figur = [...D.docs.values()].find((d) => d.typ === 'figur' && !d.geloescht && String(d.titel || '').toLowerCase() === n.toLowerCase());
    leute.push({ id: figur ? figur.id : '', name: n });
    namensfeld.value = ''; zeigeLeute();
  };
  namensfeld.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); nameDazu(); } });
  /* Vorschläge: bereits im Kalender genannte Namen und vorhandene Figuren */
  const vorschlaege = new Set([...kalLeute().map((p) => p.name), ...[...D.docs.values()].filter((d) => d.typ === 'figur' && !d.geloescht && d.titel).map((d) => d.titel)]);
  const liste = el('datalist', { id: 'kal-namensliste' }, ...[...vorschlaege].slice(0, 200).map((n) => el('option', { value: n })));

  /* Wie alt jemand an diesem Tag ist — sofort, während man tippt */
  const zeigeAlter = () => {
    alterZeile.innerHTML = '';
    const d = gewaehltesDatum();
    if (!d || art === 'geburt') return;
    const zeilen = [];
    for (const p of leute) {
      const g = kalGeburtVon([p]);
      if (!g) continue;
      const a = kalAlter(g, d);
      if (a) zeilen.push(p.name + ' ist an diesem Tag ' + kalAlterText(a) + '.');
      else zeilen.push(p.name + ' ist an diesem Tag noch nicht geboren.');
      const tod = kalTodVon([p]);
      if (tod && kalZeit(d) > kalZeit(tod)) zeilen.push(p.name + ' ist zu diesem Zeitpunkt bereits gestorben (' + kalLesbar(tod) + ').');
    }
    for (const z of zeilen) alterZeile.append(el('div', { class: 'kal-alterhinweis' + (z.includes('noch nicht geboren') || z.includes('bereits gestorben') ? ' warn' : '') }, z));
  };

  const notiz = el('textarea', { class: 'kal-notiz', rows: '4', placeholder: 'Was noch dazugehört. Was niemand sonst weiß.', maxlength: '4000' }, stand.notiz);
  const ort = el('input', { type: 'text', value: stand.ort, placeholder: 'Wo? (darf leer bleiben)', maxlength: '200' });
  const jaehrlich = el('input', { type: 'checkbox' }); jaehrlich.checked = stand.jaehrlich;

  const feld = (name, inhalt, unter) => el('label', { class: 'kal-feld' }, el('span', { class: 'kal-feldname' }, name), inhalt, unter ? el('small', { class: 'kal-feldunter' }, unter) : null);
  const kasten = el('div', { class: 'modal kal-fenster' },
    el('div', { class: 'kartenkopf' }, neu ? 'EIN NEUER TAG' : 'DIESEN TAG ÄNDERN'),
    feld('Was', titel),
    feld('Wann', el('div', { class: 'kal-datumreihe' }, jahr, monat, tag), null),
    wochentag,
    bisZeile,
    feld('Art', artWahl),
    feld('Zeichen', zeichenKnopf),
    feld('Wer', el('div', {}, leuteReihe, el('div', { class: 'kal-namenreihe' }, namensfeld, el('button', { type: 'button', class: 'knopf zart', onclick: nameDazu }, 'Dazu'), liste)),
      'Tipp einfach einen Namen. Er muss zu keiner Figur und keinem Text gehören.'),
    alterZeile,
    feld('Wo', ort),
    feld('Dazu', notiz),
    el('label', { class: 'kal-bisreihe' }, jaehrlich, el('span', {}, 'Kehrt jedes Jahr wieder')),
    el('div', { class: 'reihe' },
      !neu ? el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (await frage('Diesen Tag aus dem Kalender nehmen?', { ja: 'Herausnehmen' })) { await loesche(doc.id); zu(); if (danach) danach(); }
      } }, 'Herausnehmen') : null,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => {
        const wann = gewaehltesDatum();
        if (!wann) { toast('Das Datum stimmt so nicht.'); return; }
        const felder = saubererTermin({
          wann, bis: bisAn.checked ? bisFeld.value : '', art, titel: titel.value, notiz: notiz.value, ort: ort.value,
          leute, icon, jaehrlich: jaehrlich.checked, farbe: stand.farbe, projekt: stand.projekt, quelle: stand.quelle
        });
        if (!felder) { toast('Das Datum stimmt so nicht.'); return; }
        if (doc) { Object.assign(doc, felder); speichere(doc); }
        else neuDoc('termin', felder);
        zu();
        toast(neu ? 'Steht im Kalender.' : 'Geändert.');
        if (danach) danach(wann);
      } }, neu ? 'Eintragen' : 'Übernehmen')));
  const zu = zeigeDeck(kasten);
  /* Erst jetzt fuellen: zeigeWochentag ruft zeigeAlter, und das braucht
     alterZeile und leute - beides steht erst hier vollstaendig. */
  fuelleTage();
  if (wannTeile.tag != null) { tag.value = String(wannTeile.tag); zeigeWochentag(); }
  zeigeLeute();
  setTimeout(() => titel.focus(), 60);
}

/* ----- Der große Kalender ----- */
let _kal = { jahr: 0, monat: 0, tag: '', ansicht: 'monat' };
function kalenderOeffnen(startDatum) {
  const heute = kalHeute();
  const start = kalGueltig(startDatum) ? startDatum : (_kal.tag || heute);
  const t = kalTeile(start);
  _kal.jahr = t.jahr; _kal.monat = t.monat || 1; _kal.tag = t.genau === 'tag' ? start : kalDatum(t.jahr, t.monat || 1, 1);

  const buehne = el('div', { class: 'kal-buehne' });
  const kasten = el('div', { class: 'kal-buch' }, buehne);
  const zu = zeigeDeck(kasten);
  kasten.classList.add('klappt-auf');
  const neuZeichnen = (datum) => { if (datum && kalGueltig(datum)) { const p = kalTeile(datum); _kal.jahr = p.jahr; _kal.monat = p.monat || 1; if (p.genau === 'tag') _kal.tag = datum; } zeichneKalender(buehne, neuZeichnen, zu); };
  zeichneKalender(buehne, neuZeichnen, zu);
}

function zeichneKalender(buehne, neuZeichnen, schliessen) {
  const heute = kalHeute();
  const alle = kalTermine();
  buehne.innerHTML = '';

  /* --- Kopf: Jahr und Monat --- */
  const jahrLeiste = el('div', { class: 'kal-jahrleiste' });
  const mitInhalt = new Set(kalJahreMitInhalt(alle));
  for (let j = KAL_JAHR_VON; j <= KAL_JAHR_BIS; j++) {
    jahrLeiste.append(el('button', {
      class: 'kal-jahrknopf' + (j === _kal.jahr ? ' an' : '') + (mitInhalt.has(j) ? ' voll' : ''),
      'data-jahr': String(j),
      onclick: () => neuZeichnen(kalDatum(j, _kal.monat, 1))
    }, String(j)));
  }
  const monatName = el('h2', { class: 'kal-monatname' }, KAL_MONATE[_kal.monat - 1], el('i', {}, String(_kal.jahr)));
  const blaettern = (schritt) => {
    let m = _kal.monat + schritt, j = _kal.jahr;
    if (m < 1) { m = 12; j--; } if (m > 12) { m = 1; j++; }
    if (j < KAL_JAHR_VON || j > KAL_JAHR_BIS) return;
    neuZeichnen(kalDatum(j, m, 1));
  };
  const kopf = el('div', { class: 'kal-kopf' },
    el('button', { class: 'kal-blaetter', title: 'Ein Monat zurück', onclick: () => blaettern(-1) }, '‹'),
    monatName,
    el('button', { class: 'kal-blaetter', title: 'Ein Monat vor', onclick: () => blaettern(1) }, '›'),
    el('div', { class: 'kal-kopfrechts' },
      el('button', { class: 'knopf zart', onclick: () => neuZeichnen(heute) }, 'Heute'),
      el('button', { class: 'kal-ansichtknopf' + (_kal.ansicht === 'jahr' ? ' an' : ''), title: 'Das ganze Jahr auf einen Blick', onclick: () => { _kal.ansicht = _kal.ansicht === 'jahr' ? 'monat' : 'jahr'; neuZeichnen(); } }, 'Jahr'),
      el('button', { class: 'kal-ansichtknopf' + (_kal.ansicht === 'leben' ? ' an' : ''), title: 'Die Lebensbänder aller Leute', onclick: () => { _kal.ansicht = _kal.ansicht === 'leben' ? 'monat' : 'leben'; neuZeichnen(); } }, 'Leben'),
      el('button', { class: 'kal-schliessen', title: 'Den Kalender zuklappen', onclick: () => schliessen() }, '×')));

  buehne.append(kopf, jahrLeiste);
  /* Das gewählte Jahr in den Blick rücken */
  requestAnimationFrame(() => { const an = jahrLeiste.querySelector('.an'); if (an) an.scrollIntoView({ block: 'nearest', inline: 'center' }); });

  if (_kal.ansicht === 'jahr') { buehne.append(kalJahresBild(alle, neuZeichnen)); return; }
  if (_kal.ansicht === 'leben') { buehne.append(kalLebensbaender(alle, neuZeichnen)); return; }

  /* --- Das Monatsraster --- */
  const raster = el('div', { class: 'kal-raster' });
  raster.append(el('div', { class: 'kal-kw-kopf' }, 'KW'));
  for (const d of KAL_TAGE_KURZ) raster.append(el('div', { class: 'kal-wochenkopf' }, d));
  const zaehlung = kalMonatsZaehlung(_kal.jahr, _kal.monat, alle);
  for (const woche of kalRaster(_kal.jahr, _kal.monat)) {
    raster.append(el('div', { class: 'kal-kw' }, woche.kw ? String(woche.kw) : ''));
    for (const zelle of woche.tage) {
      const termine = zelle.fremd ? kalAmTag(zelle.datum, alle) : (zaehlung[zelle.tag] || []);
      const istHeute = zelle.datum === heute;
      const gewaehlt = zelle.datum === _kal.tag;
      const zellElement = el('button', {
        class: 'kal-zelle' + (zelle.fremd ? ' fremd' : '') + (istHeute ? ' heute' : '') + (gewaehlt ? ' gewaehlt' : '') + (termine.length ? ' voll' : ''),
        onclick: () => { _kal.tag = zelle.datum; if (zelle.fremd) neuZeichnen(zelle.datum); else { _kal.tag = zelle.datum; neuZeichnen(); } },
        ondblclick: () => kalTerminBearbeiten(null, zelle.datum, (d) => neuZeichnen(d))
      },
        el('span', { class: 'kal-zahl' }, String(zelle.tag)),
        termine.length ? el('span', { class: 'kal-marken' }, ...termine.slice(0, 4).map((e) => el('i', { class: 'kal-marke', style: '--artfarbe:' + kalArt(e.art).farbe, html: kalIcon(e.icon || kalArt(e.art).icon, 13) }))) : null,
        termine.length > 4 ? el('span', { class: 'kal-mehr' }, '+' + (termine.length - 4)) : null);
      raster.append(zellElement);
    }
  }
  buehne.append(raster);

  /* --- Der gewählte Tag --- */
  buehne.append(kalTagesBlatt(_kal.tag, alle, neuZeichnen));

  /* --- Was nicht sein kann --- */
  const w = kalWidersprueche(alle);
  if (w.length) {
    buehne.append(el('details', { class: 'kal-widersprueche' },
      el('summary', {}, w.length === 1 ? 'Eine Stelle passt nicht zusammen' : w.length + ' Stellen passen nicht zusammen'),
      ...w.slice(0, 30).map((x) => el('div', { class: 'kal-widerspruch' },
        el('span', { class: 'kal-wsym' }, '!'),
        el('span', {}, x.text),
        x.termin ? el('button', { class: 'kal-wlink', onclick: () => neuZeichnen(x.termin.wann) }, 'hinsehen') : null))));
  }
}

/* ----- Das Tagesblatt ----- */
function kalTagesBlatt(datum, alle, neuZeichnen) {
  const t = kalTeile(datum);
  const termine = kalAmTag(datum, alle);
  const jahrestage = kalJahrestage(datum, alle);
  const mond = typeof mondphase === 'function' ? mondphase(kalZeit(datum)) : null;
  const mondwort = mond == null ? '' : mond < .04 || mond > .96 ? 'Neumond' : Math.abs(mond - .5) < .04 ? 'Vollmond' : mond < .5 ? 'zunehmend' : 'abnehmend';

  const blatt = el('div', { class: 'kal-tagesblatt' },
    el('div', { class: 'kal-tageskopf' },
      el('div', {},
        el('h3', {}, kalLesbar(datum, true)),
        el('small', {}, 'KW ' + kalWoche(datum) + ' · ' + kalJahreszeit(datum) + (mondwort ? ' · Mond: ' + mondwort : ''))),
      el('button', { class: 'knopf voll', onclick: () => kalTerminBearbeiten(null, datum, (d) => neuZeichnen(d)) }, 'Hier etwas eintragen')));

  if (!termine.length) {
    blatt.append(el('div', { class: 'kal-leertag' }, 'An diesem Tag steht noch nichts. Ein leerer Tag ist kein leerer Tag — er ist einer, an dem noch alles möglich ist.'));
  }
  for (const e of termine) {
    const art = kalArt(e.art);
    const wiederkehr = (e.jaehrlich || e.art === 'geburt') && kalTeile(e.wann).jahr !== t.jahr;
    const alterHier = [];
    for (const p of e.leute || []) {
      if (e.art === 'geburt') {
        const a = kalAlter(e.wann, datum);
        if (a && a.jahre > 0) alterHier.push(p.name + ' wird ' + a.jahre + '.');
        continue;
      }
      const g = kalGeburtVon([p], alle);
      if (!g) continue;
      const a = kalAlter(g, e.wann);
      if (a) alterHier.push(p.name + ': ' + kalAlterText(a));
    }
    blatt.append(el('button', { class: 'kal-eintrag', style: '--artfarbe:' + art.farbe, onclick: () => kalTerminBearbeiten(e, null, (d) => neuZeichnen(d || datum)) },
      el('span', { class: 'kal-eintragzeichen', html: kalIcon(e.icon || art.icon, 24) }),
      el('span', { class: 'kal-eintragtext' },
        el('b', {}, e.titel || art.name),
        el('span', { class: 'kal-eintragart' }, art.name + (wiederkehr ? ' · seit ' + kalTeile(e.wann).jahr : '') + (e.bis ? ' · bis ' + kalKurz(e.bis) : '') + (e.ort ? ' · ' + e.ort : '')),
        (e.leute || []).length ? el('span', { class: 'kal-eintragleute' }, e.leute.map((p) => p.name).join(', ')) : null,
        alterHier.length ? el('span', { class: 'kal-eintragalter' }, alterHier.join(' · ')) : null,
        e.notiz ? el('span', { class: 'kal-eintragnotiz' }, e.notiz.length > 220 ? e.notiz.slice(0, 217) + ' …' : e.notiz) : null)));
  }
  if (jahrestage.length) {
    blatt.append(el('div', { class: 'kal-jahrestage' },
      el('span', { class: 'kal-abschnitt' }, 'Heute vor Jahren'),
      ...jahrestage.map((j) => el('button', { class: 'kal-jahrestag', onclick: () => neuZeichnen(j.termin.wann) },
        el('b', {}, j.jahre === 1 ? 'vor einem Jahr' : 'vor ' + j.jahre + ' Jahren'),
        el('span', {}, j.termin.titel || kalArt(j.termin.art).name)))));
  }
  return blatt;
}

/* ----- Das ganze Jahr ----- */
function kalJahresBild(alle, neuZeichnen) {
  const raus = el('div', { class: 'kal-jahresbild' });
  const zaehlung = kalJahresZaehlung(_kal.jahr, alle);
  const heute = kalHeute();
  for (let m = 1; m <= 12; m++) {
    const mini = el('div', { class: 'kal-mini' + (zaehlung[m - 1] ? ' voll' : '') });
    mini.append(el('button', { class: 'kal-mininame', onclick: () => { _kal.monat = m; _kal.ansicht = 'monat'; neuZeichnen(kalDatum(_kal.jahr, m, 1)); } },
      KAL_MONATE[m - 1], zaehlung[m - 1] ? el('i', {}, String(zaehlung[m - 1])) : null));
    const gitter = el('div', { class: 'kal-minigitter' });
    for (const d of KAL_TAGE_KURZ) gitter.append(el('span', { class: 'kal-minikopf' }, d[0]));
    for (const woche of kalRaster(_kal.jahr, m)) {
      for (const zelle of woche.tage) {
        const hat = !zelle.fremd && kalAmTag(zelle.datum, alle).length;
        gitter.append(el('button', {
          class: 'kal-minitag' + (zelle.fremd ? ' fremd' : '') + (hat ? ' voll' : '') + (zelle.datum === heute ? ' heute' : ''),
          title: hat ? kalLesbar(zelle.datum) + ' — ' + hat + (hat === 1 ? ' Eintrag' : ' Einträge') : kalLesbar(zelle.datum),
          onclick: () => { _kal.ansicht = 'monat'; neuZeichnen(zelle.datum); }
        }, String(zelle.tag)));
      }
    }
    mini.append(gitter);
    raus.append(mini);
  }
  return raus;
}

/* ----- Die Lebensbänder: fünfzig Jahre, ein Strich pro Mensch ----- */
function kalLebensbaender(alle, neuZeichnen) {
  const leute = kalLeute(alle);
  const raus = el('div', { class: 'kal-leben' });
  if (!leute.length) {
    raus.append(el('div', { class: 'kal-leertag' }, 'Noch niemand im Kalender. Trag einen Tag ein und schreib einen Namen dazu — mehr braucht es nicht.'));
    return raus;
  }
  const spanne = KAL_JAHR_BIS - KAL_JAHR_VON + 1;
  const anteil = (datum) => { const t = kalTeile(datum); return t ? ((t.jahr - KAL_JAHR_VON) + ((t.monat || 1) - 1) / 12) / spanne : 0; };

  const massband = el('div', { class: 'kal-massband' });
  for (let j = KAL_JAHR_VON; j <= KAL_JAHR_BIS; j += 5) {
    massband.append(el('i', { class: 'kal-massmarke', style: 'left:' + (anteil(kalDatum(j, 1, 1)) * 100).toFixed(2) + '%' }, String(j)));
  }
  raus.append(massband);

  for (const p of leute) {
    const band = el('div', { class: 'kal-band' });
    const lebt = p.geburt && p.tod;
    const von = p.geburt ? anteil(p.geburt) : null, bis = p.tod ? anteil(p.tod) : null;
    const spur = el('div', { class: 'kal-spur' });
    if (von != null) {
      const breite = (bis != null ? bis : anteil(kalHeute())) - von;
      spur.append(el('i', { class: 'kal-lebenslinie' + (lebt ? ' zuende' : ''), style: 'left:' + (von * 100).toFixed(2) + '%;width:' + Math.max(.4, breite * 100).toFixed(2) + '%' }));
    }
    for (const e of p.termine) {
      const art = kalArt(e.art);
      spur.append(el('button', {
        class: 'kal-kerbe art-' + e.art, style: 'left:' + (anteil(e.wann) * 100).toFixed(2) + '%;--artfarbe:' + art.farbe,
        title: (e.titel || art.name) + ' · ' + kalLesbar(e.wann),
        onclick: () => { _kal.ansicht = 'monat'; neuZeichnen(e.wann); }
      }, el('i', { html: kalIcon(e.icon || art.icon, 12) })));
    }
    const alterText = lebt ? 'wurde ' + kalLebensalter(p).jahre + ' Jahre' : p.geburt ? kalAlterText(kalAlter(p.geburt, kalHeute())) + ' alt' : p.termine.length + (p.termine.length === 1 ? ' Eintrag' : ' Einträge');
    band.append(el('div', { class: 'kal-bandname' }, el('b', {}, p.name),
      el('small', {}, (p.geburt ? '* ' + kalKurz(p.geburt) : '') + (p.tod ? '  † ' + kalKurz(p.tod) : '') + (p.geburt || p.tod ? ' · ' : '') + alterText)), spur);
    raus.append(band);
  }
  return raus;
}

/* ----- Der Kalender auf dem Schreibtisch ----- */
function baueTischkalender() {
  const heute = kalHeute();
  const t = kalTeile(heute);
  const alle = kalTermine();
  const heutige = kalAmTag(heute, alle);
  const naechster = kalSortiert(alle.filter((e) => kalZeit(e.wann) > kalZeit(heute)))[0];
  const titel = 'Der Kalender · ' + kalLesbar(heute, true) +
    (heutige.length ? ' — heute: ' + heutige.map((e) => e.titel || kalArt(e.art).name).join(', ') : naechster ? ' — als Nächstes: ' + (naechster.titel || kalArt(naechster.art).name) + ' am ' + kalKurz(naechster.wann) : ' — noch nichts eingetragen');
  return el('button', { class: 'desk-ding kalender' + (heutige.length ? ' hat-heute' : ''), title: titel, 'aria-label': titel, onclick: () => kalenderOeffnen(heute) },
    el('div', { class: 'kalender-bild' },
      el('i', { class: 'kal-ruecken' }),
      el('div', { class: 'kal-blatt links' },
        el('span', { class: 'kal-blattmonat' }, KAL_MONATE_KURZ[t.monat - 1].toUpperCase()),
        el('span', { class: 'kal-blatttag' }, String(t.tag)),
        el('span', { class: 'kal-blattwt' }, KAL_TAGE[kalWochentag(heute)])),
      el('div', { class: 'kal-blatt rechts' },
        ...(heutige.length ? heutige.slice(0, 3).map((e) => el('span', { class: 'kal-blattzeile' },
          el('i', { style: '--artfarbe:' + kalArt(e.art).farbe, html: kalIcon(e.icon || kalArt(e.art).icon, 10) }),
          el('em', {}, (e.titel || kalArt(e.art).name).slice(0, 22))))
          : [el('span', { class: 'kal-blattleer' }, 'nichts notiert')])),
      el('i', { class: 'kal-spirale' }), el('i', { class: 'kal-band' })));
}
