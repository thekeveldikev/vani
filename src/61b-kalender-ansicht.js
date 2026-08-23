/* ===================== 61b — DER KALENDER, SICHTBAR =====================
   Ein Buch liegt auf dem Tisch. Ein Tippen, und es klappt auf: ein Monat,
   ein Tag, ein Leben.

   Zu den Zeichen: keine Torten, keine Herzchen. Für Geburt und Tod nimmt der
   Kalender, was in deutschen Familienbüchern seit jeher steht — den Stern und
   das Kreuzzeichen. Alles andere sind geritzte Linien: ein Weg, der sich
   gabelt; eine Naht; ein Siegel. Zeichen, keine Bildchen.

   Und wer ein eigenes will, zeichnet es selbst. */

/* ----- Die geritzten Zeichen. 24×24, nur Linien. ----- */
/* Jedes Zeichen hat einen eigenen Namen — es ist ein Zeichen, keine Art.
   Wer ein Siegel für eine Reise nehmen will, soll das dürfen. */
const KAL_ICONS = {
  keim: { name: 'Stern', d: '<path d="M12 4v16M5 7.5l14 9M19 7.5l-14 9"/>' },
  kreuzweg: { name: 'Kreuz', d: '<path d="M12 3v18M7.5 8h9"/>' },
  zweiwege: { name: 'Gabelung', d: '<path d="M4 4c3 5 5 7 8 8 3-1 5-3 8-8M12 12v8"/>' },
  wegfort: { name: 'Trennung', d: '<path d="M12 4v8M12 12c-3 1-5 3-8 8M12 12c3 1 5 3 8 8"/>' },
  ring: { name: 'Ringe', d: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>' },
  riss: { name: 'Riss', d: '<path d="M3 12h6l2-4 2 8 2-4h6"/>' },
  pfad: { name: 'Pfad', d: '<path d="M3 18c4 0 4-6 8-6s4 6 8 6" stroke-dasharray="3 3"/><path d="M17 15l3 3-3 3"/>' },
  schwelle: { name: 'Schwelle', d: '<path d="M4 20h16M8 20V8h8v12M3 12h5"/>' },
  naht: { name: 'Naht', d: '<path d="M3 12h18M7 9v6M11 9v6M15 9v6"/>' },
  stein: { name: 'Stein', d: '<path d="M6 15c0-4 3-7 6-7s6 3 6 7-3 5-6 5-6-1-6-5z"/><path d="M9 13c1-1 2-1.5 3-1.5"/>' },
  leer: { name: 'Leerstelle', d: '<circle cx="12" cy="12" r="7" stroke-dasharray="2.5 3.5"/>' },
  siegel: { name: 'Siegel', d: '<circle cx="12" cy="12" r="7"/><path d="M9 12l2 2 4-4"/>' },
  schloss: { name: 'Schlüsselloch', d: '<circle cx="12" cy="10" r="3"/><path d="M10.5 12.5L9.5 18h5l-1-5.5"/>' },
  scheide: { name: 'Knick', d: '<path d="M4 20V9a4 4 0 014-4h9"/><path d="M14 2l4 3-4 3"/>' },
  faltung: { name: 'Brief', d: '<path d="M4 6h16v12H4z"/><path d="M4 6l8 6 8-6"/>' },
  punktkreis: { name: 'Punkt', d: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>' },
  /* Ein paar Zeichen, die zu keiner Art gehören — nur zum Nehmen */
  anker: { name: 'Anker', d: '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.2V21M6 12h12M4 15a8 8 0 0016 0"/>' },
  feder: { name: 'Feder', d: '<path d="M4 20c6-1 11-5 14-12M18 3c-6 1-10 4-12 9l-1 5 5-1"/>' },
  welle: { name: 'Welle', d: '<path d="M3 10c3-3 5 3 8 0s5 3 8 0M3 16c3-3 5 3 8 0s5 3 8 0"/>' },
  fenster: { name: 'Fenster', d: '<path d="M5 4h14v16H5z"/><path d="M12 4v16M5 12h14"/>' },
  faden: { name: 'Faden', d: '<path d="M4 6c5 0 5 12 10 12s6-8 6-8"/><circle cx="4" cy="6" r="1.4"/>' },
  glocke: { name: 'Glocke', d: '<path d="M7 17V11a5 5 0 0110 0v6M4 17h16M10.5 20h3"/>' }
};
const KAL_ICON_IDS = Object.keys(KAL_ICONS);

/* Ein Zeichen als SVG. Eigene Zeichen ('eigen:<id>') werden aus ihren Strichen gebaut. */
function kalIcon(schluessel, groesse = 22) {
  const s = String(schluessel || '');
  if (s.startsWith('eigen:')) {
    const d = D.docs.get(s.slice(6));
    if (d && Array.isArray(d.striche)) return kalStricheSVG(d.striche, groesse);
    return kalIcon('punktkreis', groesse);
  }
  const eintrag = KAL_ICONS[s] || KAL_ICONS.punktkreis;
  return '<svg viewBox="0 0 24 24" width="' + groesse + '" height="' + groesse + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + eintrag.d + '</svg>';
}
function kalIconName(schluessel) {
  const s = String(schluessel || '');
  if (s.startsWith('eigen:')) return 'Eigenes';
  return (KAL_ICONS[s] || KAL_ICONS.punktkreis).name;
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
    ? st.slice(0, 600).map((p) => Array.isArray(p) ? [begrenze(p[0], 0, 1, .5), begrenze(p[1], 0, 1, .5)] : null).filter(Boolean)
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
    el('p', { class: 'kal-hinweis' }, 'Zeichne es in Ruhe. Überall, wo der Tag steht, wird es klein dargestellt — im Raster, im Tagesblatt, im Lebensband.'),
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
  const knopf = (schluessel) => el('button', {
    class: 'kal-iconwahl' + (schluessel === aktuell ? ' an' : ''), title: kalIconName(schluessel),
    onclick: () => { zu(); fertig(schluessel); }
  }, el('span', { class: 'kal-iconbild', html: kalIcon(schluessel, 26) }), el('small', {}, kalIconName(schluessel)));
  const kasten = el('div', { class: 'modal kal-iconfenster' },
    el('div', { class: 'kartenkopf' }, 'DAS ZEICHEN'),
    el('p', { class: 'kal-hinweis' }, 'Ein Zeichen für diesen Tag. Es muss nicht zur Art passen — wenn ein Anker besser trifft als ein Stern, nimm den Anker.'),
    el('div', { class: 'kal-icongitter' }, ...KAL_ICON_IDS.map((id) => knopf(id))),
    eigene.length ? el('span', { class: 'kal-abschnitt' }, 'Selbst gezeichnet') : null,
    eigene.length ? el('div', { class: 'kal-icongitter' }, ...eigene.map((d) => el('div', { class: 'kal-eigenwahl' },
      knopf('eigen:' + d.id),
      el('button', { class: 'kal-iconweg', title: 'Dieses Zeichen wegwerfen', onclick: async () => { if (await frage('Dieses Zeichen wegwerfen?', { ja: 'Wegwerfen' })) { await loesche(d.id, true); zu(); kalIconWaehlen(aktuell, fertig); } } }, '×'))) ) : null,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { zu(); kalIconMalen(fertig); } }, 'Selbst zeichnen'),
      el('button', { class: 'knopf zart', onclick: () => { zu(); fertig(''); } }, 'Das der Art nehmen')));
  const zu = zeigeDeck(kasten);
}

/* ----- Ein Tag: eintragen und ändern ----- */
/* Namen sind freier Text. Wer will, hängt eine vorhandene Figur daran — wer
   nicht will, tippt einfach einen Namen. Der Kalender gehört dem Kopf, nicht
   der Textsammlung. */
function kalTerminBearbeiten(doc, vorgabe, danach) {
  const neu = !doc;
  const stand = saubererTermin(doc || { wann: vorgabe || kalHeute(), art: 'ereignis' }) || saubererTermin({ wann: kalHeute() });
  let art = stand.art, icon = stand.icon, leute = stand.leute.slice();

  const titel = el('input', { type: 'text', class: 'kal-titelfeld', value: stand.titel, placeholder: 'Was geschieht? (darf leer bleiben)', maxlength: '200' });
  const wannTeile = kalTeile(stand.wann);
  const jahr = el('input', { type: 'number', class: 'kal-jahr', min: String(KAL_JAHR_VON), max: String(KAL_JAHR_BIS), step: '1', inputmode: 'numeric', value: String(wannTeile.jahr) });
  const monat = el('select', { class: 'kal-monat' }, el('option', { value: '' }, 'ganzes Jahr'), ...KAL_MONATE.map((m, i) => el('option', { value: String(i + 1) }, m)));
  const tag = el('select', { class: 'kal-tag' });
  const wochentag = el('div', { class: 'kal-wochentag' });
  monat.value = wannTeile.monat == null ? '' : String(wannTeile.monat);

  function fuelleTage() {
    const j = Number(jahr.value) || KAL_JAHR_VON, m = Number(monat.value) || 0;
    const alt = tag.value;
    tag.innerHTML = '';
    tag.append(el('option', { value: '' }, m ? 'ganzer Monat' : '—'));
    if (m) for (let t = 1; t <= kalMonatstage(j, m); t++) tag.append(el('option', { value: String(t) }, t + '.'));
    tag.value = alt && Number(alt) <= kalMonatstage(j, m || 1) ? alt : '';
    tag.disabled = !m;
    zeigeWochentag();
  }
  const gewaehltesDatum = () => kalDatum(Number(jahr.value), monat.value ? Number(monat.value) : null, tag.value ? Number(tag.value) : null);
  function zeigeWochentag() {
    const d = gewaehltesDatum();
    const t = kalTeile(d);
    wochentag.innerHTML = '';
    if (t && t.genau === 'tag') {
      const mond = typeof mondphase === 'function' ? mondphase(kalZeit(d)) : null;
      const mondwort = mond == null ? '' : mond < .04 || mond > .96 ? 'Neumond' : Math.abs(mond - .5) < .04 ? 'Vollmond' : '';
      anfuegen(wochentag,
        el('b', {}, KAL_TAGE[kalWochentag(d)]),
        el('span', {}, 'KW ' + kalWoche(d)), el('span', {}, kalJahreszeit(d)),
        mondwort ? el('span', {}, mondwort) : null);
    } else if (t) {
      anfuegen(wochentag, el('em', {}, t.genau === 'monat' ? 'ungefähr — irgendwann in dem Monat' : 'ungefähr — irgendwann in dem Jahr'));
    }
    zeigeAlter();
  }
  jahr.addEventListener('input', fuelleTage); monat.addEventListener('change', fuelleTage); tag.addEventListener('change', zeigeWochentag);

  /* Ein Zeitraum — nur wenn es einer ist */
  const bisAn = el('input', { type: 'checkbox' });
  const bisTag = kalTeile(stand.bis) && kalTeile(stand.bis).genau === 'tag' ? stand.bis : '';
  const bisFeld = el('input', { type: 'date', class: 'kal-bis', min: KAL_JAHR_VON + '-01-01', max: KAL_JAHR_BIS + '-12-31', value: bisTag });
  bisAn.checked = !!bisTag;
  const bisFeldZeile = el('div', { class: 'kal-bisfeld' }, el('span', {}, 'letzter Tag'), bisFeld);
  const bisZeile = el('div', { class: 'kal-spanne' },
    el('label', { class: 'kal-kaestchen' }, bisAn, el('span', {}, 'Zieht sich über mehrere Tage')),
    bisFeldZeile);
  const bisZeigen = () => { bisFeldZeile.style.display = bisAn.checked ? '' : 'none'; };
  bisAn.addEventListener('change', bisZeigen);

  /* Die Art */
  const artWahl = el('div', { class: 'kal-artwahl' });
  function zeichneArten() {
    artWahl.innerHTML = '';
    for (const a of KAL_ARTEN) {
      artWahl.append(el('button', { type: 'button', class: 'kal-artknopf' + (a.id === art ? ' an' : ''), title: a.name, style: '--artfarbe:' + a.farbe, 'aria-pressed': a.id === art ? 'true' : 'false', onclick: () => { art = a.id; zeichneArten(); zeigeZeichen(); zeigeAlter(); } },
        el('span', { class: 'kal-artbild', html: kalIcon(a.icon, 20) }), el('small', {}, a.name)));
    }
  }
  zeichneArten();

  /* Das Zeichen */
  const zeichenKnopf = el('button', { type: 'button', class: 'kal-zeichenknopf', onclick: () => kalIconWaehlen(icon || kalArt(art).icon, (neuIcon) => { icon = neuIcon; zeigeZeichen(); }) });
  function zeigeZeichen() {
    zeichenKnopf.innerHTML = '';
    anfuegen(zeichenKnopf,
      el('span', { class: 'kal-iconbild', html: kalIcon(icon || kalArt(art).icon, 24) }),
      el('span', { class: 'kal-zeichentext' },
        el('b', {}, kalIconName(icon || kalArt(art).icon)),
        el('small', {}, icon ? 'selbst gewählt · tippen zum Ändern' : 'das Zeichen der Art · tippen zum Ändern')));
  }
  zeigeZeichen();

  /* Die Leute: frei getippt. */
  const leuteReihe = el('div', { class: 'kal-leute' });
  const namensfeld = el('input', { type: 'text', class: 'kal-namensfeld', placeholder: 'Ein Name — einfach tippen', maxlength: '120', list: 'kal-namensliste' });
  const alterZeile = el('div', { class: 'kal-alterzeile' });
  function zeigeLeute() {
    leuteReihe.innerHTML = '';
    for (const p of leute) {
      leuteReihe.append(el('span', { class: 'kal-person' }, p.name,
        el('button', { type: 'button', title: 'Diesen Namen wieder wegnehmen', onclick: () => { leute = leute.filter((x) => x !== p); zeigeLeute(); } }, '×')));
    }
    if (!leute.length) leuteReihe.append(el('span', { class: 'kal-leerhinweis' }, 'Noch niemand. Muss auch nicht sein.'));
    zeigeAlter();
  }
  const nameDazu = () => {
    const n = namensfeld.value.trim();
    if (!n) { namensfeld.focus(); return; }
    if (leute.some((p) => p.name.toLowerCase() === n.toLowerCase())) { namensfeld.value = ''; return; }
    const figur = [...D.docs.values()].find((d) => d.typ === 'figur' && !d.geloescht && String(d.titel || '').toLowerCase() === n.toLowerCase());
    leute.push({ id: figur ? figur.id : '', name: n });
    namensfeld.value = ''; zeigeLeute(); namensfeld.focus();
  };
  namensfeld.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); nameDazu(); } });
  const vorschlaege = new Set([...kalLeute().map((p) => p.name), ...[...D.docs.values()].filter((d) => d.typ === 'figur' && !d.geloescht && d.titel).map((d) => d.titel)]);
  const liste = el('datalist', { id: 'kal-namensliste' }, ...[...vorschlaege].slice(0, 200).map((n) => el('option', { value: n })));

  /* Wie alt jemand an diesem Tag ist — sofort, während man tippt */
  function zeigeAlter() {
    alterZeile.innerHTML = '';
    const d = gewaehltesDatum();
    if (!d || art === 'geburt') return;
    for (const p of leute) {
      const g = kalGeburtVon([p]);
      const tod = kalTodVon([p]);
      if (!g && !tod) continue;
      if (g) {
        const a = kalAlter(g, d);
        alterZeile.append(el('div', { class: 'kal-alterhinweis' + (a ? '' : ' warn') },
          el('b', {}, p.name), a ? ' ist an diesem Tag ' + kalAlterText(a) + '.' : ' ist an diesem Tag noch nicht geboren (Geburt: ' + kalLesbar(g) + ').'));
      }
      if (tod && kalZeit(d) > kalZeit(tod)) {
        alterZeile.append(el('div', { class: 'kal-alterhinweis warn' }, el('b', {}, p.name), ' ist zu diesem Zeitpunkt bereits gestorben (' + kalLesbar(tod) + ').'));
      }
    }
  }

  const notiz = el('textarea', { class: 'kal-notiz', rows: '4', placeholder: 'Was noch dazugehört. Was niemand sonst weiß.', maxlength: '4000' }, stand.notiz);
  const ort = el('input', { type: 'text', value: stand.ort, placeholder: 'Wo? (darf leer bleiben)', maxlength: '200' });
  const jaehrlich = el('input', { type: 'checkbox' }); jaehrlich.checked = stand.jaehrlich;

  /* Ein Feld. Enthaelt es Knoepfe, darf es KEIN <label> sein: iOS Safari
     leitet einen Tipp innerhalb eines Labels zusaetzlich an dessen erstes
     Bedienelement weiter. Beim Tippen auf "Reise" wurde so zusaetzlich der
     erste Knopf des Gitters ausgeloest — "Geburt". Ein Label gehoert nur um
     ein einzelnes Eingabefeld. */
  const feld = (name, inhalt, unter) => {
    const hatKnopf = inhalt && ((inhalt.tagName === 'BUTTON') || (inhalt.querySelector && inhalt.querySelector('button')));
    return el(hatKnopf ? 'div' : 'label', { class: 'kal-feld' },
      el('span', { class: 'kal-feldname' }, name), inhalt,
      unter ? el('small', { class: 'kal-feldunter' }, unter) : null);
  };
  const kasten = el('div', { class: 'modal kal-fenster' },
    el('div', { class: 'kartenkopf' }, neu ? 'EIN NEUER TAG' : 'DIESEN TAG ÄNDERN'),
    feld('Was', titel),
    el('div', { class: 'kal-feld' }, el('span', { class: 'kal-feldname' }, 'Wann'),
      el('div', { class: 'kal-datumreihe' },
        el('span', { class: 'kal-wahlfeld jahr' }, jahr),
        el('span', { class: 'kal-wahlfeld monat' }, monat),
        el('span', { class: 'kal-wahlfeld tag' }, tag)),
      wochentag,
      el('small', { class: 'kal-feldunter' }, 'Nur das Jahr oder nur den Monat zu wissen, genügt auch — dann steht der Tag als „ungefähr“ im Kalender.'),
      bisZeile),
    feld('Art', artWahl),
    feld('Zeichen', zeichenKnopf),
    el('div', { class: 'kal-feld' }, el('span', { class: 'kal-feldname' }, 'Wer'),
      leuteReihe,
      el('div', { class: 'kal-namenreihe' }, namensfeld, el('button', { type: 'button', class: 'kal-namedazu', title: 'Diesen Namen zum Tag legen', onclick: nameDazu }, '+ Name'), liste),
      el('small', { class: 'kal-feldunter' }, 'Einfach tippen. Der Name muss zu keiner Figur und keinem Text gehören.'),
      alterZeile),
    feld('Wo', ort),
    feld('Notiz', notiz),
    el('label', { class: 'kal-kaestchen' }, jaehrlich, el('span', {}, 'Kehrt jedes Jahr wieder')),
    el('div', { class: 'reihe' },
      !neu ? el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (await frage('Diesen Tag aus dem Kalender nehmen?', { ja: 'Herausnehmen' })) { await loesche(doc.id); zu(); if (danach) danach(); }
      } }, 'Herausnehmen') : null,
      !neu ? el('button', { class: 'knopf zart', title: 'Denselben Tag noch einmal, zum Abwandeln', onclick: () => {
        const kopie = neuDoc('termin', Object.assign(saubererTermin(doc), { titel: (doc.titel || kalArt(doc.art).name) + ' (noch einmal)' }));
        zu(); toast('Abgeschrieben.'); kalTerminBearbeiten(kopie, null, danach);
      } }, 'Abschreiben') : null,
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
  /* Erst jetzt füllen: zeigeWochentag ruft zeigeAlter, und das braucht
     alterZeile und leute — beides steht erst hier vollständig. */
  fuelleTage();
  if (wannTeile.tag != null) { tag.value = String(wannTeile.tag); zeigeWochentag(); }
  bisZeigen();
  zeigeLeute();
  setTimeout(() => titel.focus(), 60);
}

/* ----- Der große Kalender ----- */
let _kal = { jahr: 0, monat: 0, tag: '', ansicht: 'monat', suche: '', filterArt: '', filterPerson: '', zeigeVon: 0 };
function kalenderOeffnen(startDatum) {
  const heute = kalHeute();
  const start = kalGueltig(startDatum) ? startDatum : (_kal.tag || heute);
  const t = kalTeile(start);
  _kal.jahr = t.jahr; _kal.monat = t.monat || 1; _kal.tag = t.genau === 'tag' ? start : kalDatum(t.jahr, t.monat || 1, 1);

  const buehne = el('div', { class: 'kal-buehne' });
  const kasten = el('div', { class: 'kal-buch' }, el('i', { class: 'kal-falz', 'aria-hidden': 'true' }), buehne);
  const zu = zeigeDeck(kasten, () => document.removeEventListener('keydown', taste));
  kasten.classList.add('klappt-auf');
  const neuZeichnen = (datum) => {
    if (datum && kalGueltig(datum)) { const p = kalTeile(datum); _kal.jahr = p.jahr; _kal.monat = p.monat || 1; if (p.genau === 'tag') _kal.tag = datum; }
    zeichneKalender(buehne, neuZeichnen, zu);
  };
  /* Mit den Pfeiltasten durch die Tage — schneller als jedes Tippen. */
  const taste = (ev) => {
    if (!kasten.isConnected) { document.removeEventListener('keydown', taste); return; }
    const ziel = ev.target;
    if (ziel && (ziel.tagName === 'INPUT' || ziel.tagName === 'TEXTAREA' || ziel.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 1) return;   /* ein Fenster liegt darüber */
    if (_kal.ansicht !== 'monat') return;
    const springe = (tage) => {
      const d = new Date(kalZeit(_kal.tag) + tage * 86400000);
      const ziel2 = kalDatum(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      if (!ziel2) return;
      ev.preventDefault(); neuZeichnen(ziel2);
    };
    if (ev.key === 'ArrowLeft') springe(-1);
    else if (ev.key === 'ArrowRight') springe(1);
    else if (ev.key === 'ArrowUp') springe(-7);
    else if (ev.key === 'ArrowDown') springe(7);
    else if (ev.key === 'PageUp') springe(-28);
    else if (ev.key === 'PageDown') springe(28);
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); kalTerminBearbeiten(null, _kal.tag, (d) => neuZeichnen(d)); }
  };
  document.addEventListener('keydown', taste);
  zeichneKalender(buehne, neuZeichnen, zu);
}

/* Was gerade gezeigt wird — Suche und Filter greifen überall gleich. */
function kalGefiltert(alle) {
  let liste = alle;
  if (_kal.filterArt) liste = liste.filter((e) => e.art === _kal.filterArt);
  if (_kal.filterPerson) liste = liste.filter((e) => (e.leute || []).some((p) => kalPersonSchluessel(p) === _kal.filterPerson));
  const q = _kal.suche.trim().toLowerCase();
  if (q) {
    liste = liste.filter((e) => [e.titel, e.notiz, e.ort, kalArt(e.art).name, (e.leute || []).map((p) => p.name).join(' '), kalLesbar(e.wann)]
      .join(' ').toLowerCase().includes(q));
  }
  return liste;
}

function zeichneKalender(buehne, neuZeichnen, schliessen) {
  const heute = kalHeute();
  const roh = kalTermine();
  const alle = kalGefiltert(roh);
  const gefiltert = alle.length !== roh.length;
  buehne.innerHTML = '';

  /* --- Kopf --- */
  const monatName = el('h2', { class: 'kal-monatname' }, KAL_MONATE[_kal.monat - 1], el('i', {}, String(_kal.jahr)));
  const blaettern = (schritt) => {
    let m = _kal.monat + schritt, j = _kal.jahr;
    if (m < 1) { m = 12; j--; } if (m > 12) { m = 1; j++; }
    if (j < KAL_JAHR_VON || j > KAL_JAHR_BIS) return;
    neuZeichnen(kalDatum(j, m, 1));
  };
  const suchfeld = el('input', { type: 'search', class: 'kal-suchfeld', placeholder: 'Suchen …', value: _kal.suche });
  suchfeld.addEventListener('input', entprellt(() => { _kal.suche = suchfeld.value; neuZeichnen(); }, 280, true));
  const ansicht = (id, name, titelText) => el('button', {
    class: 'kal-ansichtknopf' + (_kal.ansicht === id ? ' an' : ''), title: titelText,
    onclick: () => { _kal.ansicht = id; neuZeichnen(); }
  }, name);
  buehne.append(el('div', { class: 'kal-kopf' },
    el('div', { class: 'kal-kopfzeile' },
      el('button', { class: 'kal-blaetter', title: 'Ein Monat zurück', onclick: () => blaettern(-1) }, '‹'),
      monatName,
      el('button', { class: 'kal-blaetter', title: 'Ein Monat vor', onclick: () => blaettern(1) }, '›'),
      el('div', { class: 'kal-kopfrechts' },
        el('button', { class: 'kal-heuteknopf', title: 'Zum heutigen Tag', onclick: () => neuZeichnen(heute) }, 'Heute'),
        el('button', { class: 'kal-schliessen', title: 'Den Kalender zuklappen', onclick: () => schliessen() }, '×'))),
    el('div', { class: 'kal-kopfzeile zwei' },
      el('div', { class: 'kal-ansichten' },
        ansicht('monat', 'Monat', 'Ein Monat, Tag für Tag'),
        ansicht('jahr', 'Jahr', 'Das ganze Jahr auf einen Blick'),
        ansicht('leben', 'Leben', 'Die Lebensbänder aller Leute'),
        ansicht('chronik', 'Chronik', 'Alles der Reihe nach')),
      el('div', { class: 'kal-suche' }, el('span', { class: 'kal-lupe', html: ik('suche') }), suchfeld))));

  /* --- Filter: nur sichtbar, wenn einer gesetzt ist --- */
  if (_kal.filterArt || _kal.filterPerson || _kal.suche.trim()) {
    const chip = (text, weg) => el('button', { class: 'kal-filterchip', onclick: () => { weg(); neuZeichnen(); } }, text, el('i', {}, '×'));
    buehne.append(el('div', { class: 'kal-filterzeile' },
      el('span', {}, alle.length === 1 ? 'ein Tag passt' : alle.length + ' Tage passen'),
      _kal.suche.trim() ? chip('„' + _kal.suche.trim() + '“', () => { _kal.suche = ''; }) : null,
      _kal.filterArt ? chip(kalArt(_kal.filterArt).name, () => { _kal.filterArt = ''; }) : null,
      _kal.filterPerson ? chip((kalLeute(roh).find((p) => p.schluessel === _kal.filterPerson) || { name: 'jemand' }).name, () => { _kal.filterPerson = ''; }) : null));
  }

  /* --- Jahresleiste --- */
  const jahrLeiste = el('div', { class: 'kal-jahrleiste' });
  const mitInhalt = new Set(kalJahreMitInhalt(alle));
  /* Die Leiste faengt bei 2000 an — oder frueher, wenn dort etwas steht oder
     man sie aufgeklappt hat. Der Kalender selbst reicht bis 1600 zurueck. */
  const von = Math.min(kalZeigeVon(alle, _kal.zeigeVon || null), _kal.jahr || KAL_ZEIGE_VON);
  if (von > KAL_JAHR_VON) {
    jahrLeiste.append(el('button', {
      class: 'kal-jahrfrueher', title: 'Weiter zurück — der Kalender reicht bis ' + KAL_JAHR_VON,
      onclick: () => { _kal.zeigeVon = Math.max(KAL_JAHR_VON, von - 50); neuZeichnen(); }
    }, '‹ früher'));
  }
  for (let j = von; j <= KAL_JAHR_BIS; j++) {
    jahrLeiste.append(el('button', {
      class: 'kal-jahrknopf' + (j === _kal.jahr ? ' an' : '') + (mitInhalt.has(j) ? ' voll' : ''),
      onclick: () => neuZeichnen(kalDatum(j, _kal.monat, 1))
    }, String(j)));
  }
  buehne.append(jahrLeiste);
  requestAnimationFrame(() => { const an = jahrLeiste.querySelector('.an'); if (an) an.scrollIntoView({ block: 'nearest', inline: 'center' }); });

  if (_kal.ansicht === 'jahr') buehne.append(kalJahresBild(alle, neuZeichnen));
  else if (_kal.ansicht === 'leben') buehne.append(kalLebensbaender(alle, neuZeichnen));
  else if (_kal.ansicht === 'chronik') buehne.append(kalChronik(alle, neuZeichnen));
  else {
    /* --- Das Monatsraster --- */
    const raster = el('div', { class: 'kal-raster' });
    raster.append(el('div', { class: 'kal-kw-kopf' }, 'KW'));
    for (const d of KAL_TAGE_KURZ) raster.append(el('div', { class: 'kal-wochenkopf' }, d));
    const zaehlung = kalMonatsZaehlung(_kal.jahr, _kal.monat, alle);
    for (const woche of kalRaster(_kal.jahr, _kal.monat)) {
      raster.append(el('div', { class: 'kal-kw' }, woche.kw ? String(woche.kw) : ''));
      for (const zelle of woche.tage) {
        const termine = zelle.fremd ? kalAmTag(zelle.datum, alle) : (zaehlung[zelle.tag] || []);
        const wt = kalWochentag(zelle.datum);
        raster.append(el('button', {
          class: 'kal-zelle' + (zelle.fremd ? ' fremd' : '') + (zelle.datum === heute ? ' heute' : '') +
            (zelle.datum === _kal.tag ? ' gewaehlt' : '') + (termine.length ? ' voll' : '') + (wt >= 5 ? ' wochenende' : ''),
          onclick: () => { _kal.tag = zelle.datum; neuZeichnen(zelle.fremd ? zelle.datum : undefined); },
          ondblclick: () => kalTerminBearbeiten(null, zelle.datum, (d) => neuZeichnen(d))
        },
          el('span', { class: 'kal-zahl' }, String(zelle.tag)),
          termine.length ? el('span', { class: 'kal-marken' }, ...termine.slice(0, 4).map((e) => el('i', { class: 'kal-marke', style: '--artfarbe:' + kalArt(e.art).farbe, html: kalIcon(e.icon || kalArt(e.art).icon, 13) }))) : null,
          termine.length > 4 ? el('span', { class: 'kal-mehr' }, '+' + (termine.length - 4)) : null));
      }
    }
    buehne.append(raster);
    buehne.append(kalTagesBlatt(_kal.tag, alle, neuZeichnen));
  }

  /* --- Was nicht sein kann --- */
  const w = kalWidersprueche(roh);
  if (w.length) {
    buehne.append(el('details', { class: 'kal-widersprueche' },
      el('summary', {}, w.length === 1 ? 'Eine Stelle passt nicht zusammen' : w.length + ' Stellen passen nicht zusammen'),
      ...w.slice(0, 30).map((x) => el('div', { class: 'kal-widerspruch' },
        el('span', { class: 'kal-wsym' }, '!'),
        el('span', {}, x.text),
        x.termin ? el('button', { class: 'kal-wlink', onclick: () => neuZeichnen(x.termin.wann) }, 'hinsehen') : null))));
  }
  if (gefiltert && !alle.length) buehne.append(el('div', { class: 'kal-leertag mitte' }, 'Dazu steht nichts im Kalender.'));
}

/* ----- Ein Eintrag, wie er überall aussieht ----- */
function kalEintragElement(e, bezug, alle, neuZeichnen, mitDatum) {
  const art = kalArt(e.art);
  const t = kalTeile(bezug);
  const wiederkehr = (e.jaehrlich || e.art === 'geburt') && t && kalTeile(e.wann).jahr !== t.jahr;
  const alterHier = [];
  for (const p of e.leute || []) {
    if (e.art === 'geburt') {
      const a = bezug ? kalAlter(e.wann, bezug) : null;
      if (a && a.jahre > 0) alterHier.push(p.name + ' wird ' + a.jahre);
      continue;
    }
    const g = kalGeburtVon([p], alle);
    if (!g) continue;
    const a = kalAlter(g, e.wann);
    if (a) alterHier.push(p.name + ': ' + kalAlterText(a));
  }
  return el('div', { class: 'kal-eintrag', style: '--artfarbe:' + art.farbe },
    el('button', { class: 'kal-eintragzeichen', title: 'Nur „' + art.name + '“ zeigen', onclick: () => { _kal.filterArt = _kal.filterArt === e.art ? '' : e.art; neuZeichnen(); }, html: kalIcon(e.icon || art.icon, 24) }),
    el('button', { class: 'kal-eintragtext', onclick: () => kalTerminBearbeiten(e, null, (d) => neuZeichnen(d || bezug)) },
      el('b', {}, e.titel || art.name),
      el('span', { class: 'kal-eintragart' },
        (mitDatum ? kalKurz(e.wann) + ' · ' : '') + art.name +
        (wiederkehr ? ' · seit ' + kalTeile(e.wann).jahr : '') + (e.bis ? ' · bis ' + kalKurz(e.bis) : '') + (e.ort ? ' · ' + e.ort : '')),
      alterHier.length ? el('span', { class: 'kal-eintragalter' }, alterHier.join('  ·  ')) : null,
      e.notiz ? el('span', { class: 'kal-eintragnotiz' }, e.notiz.length > 220 ? e.notiz.slice(0, 217) + ' …' : e.notiz) : null),
    (e.leute || []).length ? el('span', { class: 'kal-eintragleute' }, ...e.leute.map((p) => el('button', {
      class: 'kal-personknopf', title: 'Alles über ' + p.name,
      onclick: () => kalPersonBlatt(p, neuZeichnen)
    }, p.name))) : null);
}

/* ----- Das Tagesblatt ----- */
function kalTagesBlatt(datum, alle, neuZeichnen) {
  const heute = kalHeute();
  const termine = kalAmTag(datum, alle);
  const jahrestage = kalJahrestage(datum, alle);
  const mond = typeof mondphase === 'function' ? mondphase(kalZeit(datum)) : null;
  const mondwort = mond == null ? '' : mond < .04 || mond > .96 ? 'Neumond' : Math.abs(mond - .5) < .04 ? 'Vollmond' : mond < .5 ? 'zunehmender Mond' : 'abnehmender Mond';
  const tageWeg = Math.round((kalZeit(datum) - kalZeit(heute)) / 86400000);
  const abstand = tageWeg === 0 ? 'heute' : tageWeg > 0
    ? (tageWeg === 1 ? 'morgen' : 'in ' + tageWeg.toLocaleString('de-DE') + ' Tagen')
    : (tageWeg === -1 ? 'gestern' : 'vor ' + Math.abs(tageWeg).toLocaleString('de-DE') + ' Tagen');

  const blatt = el('div', { class: 'kal-tagesblatt' },
    el('div', { class: 'kal-tageskopf' },
      el('div', { class: 'kal-tagestitel' },
        el('h3', {}, kalLesbar(datum, true)),
        el('small', {}, 'KW ' + kalWoche(datum) + ' · ' + kalJahreszeit(datum) + (mondwort ? ' · ' + mondwort : '') + ' · ' + abstand)),
      el('button', { class: 'knopf voll', onclick: () => kalTerminBearbeiten(null, datum, (d) => neuZeichnen(d)) }, 'Hier etwas eintragen')));

  if (!termine.length) {
    blatt.append(el('div', { class: 'kal-leertag' }, 'An diesem Tag steht noch nichts. Ein leerer Tag ist kein leerer Tag — er ist einer, an dem noch alles möglich ist.'));
  }
  for (const e of termine) blatt.append(kalEintragElement(e, datum, alle, neuZeichnen, false));

  /* Wer an diesem Tag lebte — und wie alt war */
  const alter = [];
  for (const p of kalLeute(alle)) {
    if (!p.geburt) continue;
    const a = kalAlter(p.geburt, datum);
    if (!a) continue;
    if (p.tod && kalZeit(datum) > kalZeit(p.tod)) continue;
    alter.push({ p, a });
  }
  if (alter.length) {
    blatt.append(el('details', { class: 'kal-alterliste' },
      el('summary', {}, 'Wer an diesem Tag lebte (' + alter.length + ')'),
      ...alter.sort((x, y) => y.a.jahre - x.a.jahre).map(({ p, a }) => el('button', { class: 'kal-alterzeile-eintrag', onclick: () => kalPersonBlatt(p, neuZeichnen) },
        el('b', {}, p.name), el('span', {}, kalAlterText(a))))));
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

/* ----- Die Chronik: alles der Reihe nach ----- */
function kalChronik(alle, neuZeichnen) {
  const raus = el('div', { class: 'kal-chronik' });
  const sortiert = kalSortiert(alle);
  if (!sortiert.length) {
    raus.append(el('div', { class: 'kal-leertag mitte' }, 'Noch nichts eingetragen. Der erste Tag wartet.'));
    return raus;
  }
  const proJahr = {};
  for (const e of sortiert) { const j = kalTeile(e.wann).jahr; proJahr[j] = (proJahr[j] || 0) + 1; }
  let letztesJahr = null;
  for (const e of sortiert) {
    const t = kalTeile(e.wann);
    if (t.jahr !== letztesJahr) {
      letztesJahr = t.jahr;
      raus.append(el('button', { class: 'kal-chronikjahr' + (t.jahr === _kal.jahr ? ' an' : ''), onclick: () => { _kal.ansicht = 'monat'; neuZeichnen(kalDatum(t.jahr, t.monat || 1, 1)); } },
        String(t.jahr), el('i', {}, proJahr[t.jahr] === 1 ? 'ein Tag' : proJahr[t.jahr] + ' Tage')));
    }
    raus.append(kalEintragElement(e, e.wann, alle, neuZeichnen, true));
  }
  return raus;
}

/* ----- Ein Blatt über einen Menschen ----- */
function kalPersonBlatt(person, neuZeichnen) {
  const alle = kalTermine();
  const schluessel = kalPersonSchluessel(person);
  const p = kalLeute(alle).find((x) => x.schluessel === schluessel) || { schluessel, name: person.name || 'Jemand', geburt: '', tod: '', termine: [] };
  const heute = kalHeute();
  const lebt = p.geburt && !p.tod;
  const alterHeute = p.geburt ? kalAlter(p.geburt, heute) : null;
  const lebensalter = kalLebensalter(p);

  const zeile = (name, wert) => wert ? el('div', { class: 'kal-personzeile' }, el('span', {}, name), el('b', {}, wert)) : null;
  const kasten = el('div', { class: 'modal kal-personfenster' },
    el('div', { class: 'kartenkopf' }, 'IM KALENDER'),
    el('h2', {}, p.name),
    el('div', { class: 'kal-personzeilen' },
      zeile('Geboren', p.geburt ? kalLesbar(p.geburt, true) : ''),
      zeile('Gestorben', p.tod ? kalLesbar(p.tod, true) : ''),
      zeile(lebt ? 'Heute' : 'Wurde', lebt && alterHeute ? kalAlterText(alterHeute) : lebensalter ? lebensalter.jahre + ' Jahre' : ''),
      zeile('Tage im Kalender', p.termine.length ? String(p.termine.length) : '')),
    !p.geburt ? el('p', { class: 'kal-hinweis' }, 'Ohne Geburtsdatum kann der Kalender kein Alter rechnen. Trag einen Tag mit der Art „Geburt“ ein — dann steht bei jedem Ereignis, wie alt ' + p.name + ' war.') : null,
    el('span', { class: 'kal-abschnitt' }, 'Alle Tage'),
    el('div', { class: 'kal-personliste' }, ...kalSortiert(p.termine).map((e) => {
      const a = p.geburt && e.art !== 'geburt' ? kalAlter(p.geburt, e.wann) : null;
      return el('button', { class: 'kal-personeintrag', style: '--artfarbe:' + kalArt(e.art).farbe, onclick: () => { zu(); _kal.ansicht = 'monat'; neuZeichnen(e.wann); } },
        el('i', { html: kalIcon(e.icon || kalArt(e.art).icon, 18) }),
        el('span', {}, el('b', {}, e.titel || kalArt(e.art).name), el('small', {}, kalKurz(e.wann) + (a ? ' · ' + kalAlterText(a) : ''))));
    })),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { _kal.filterPerson = _kal.filterPerson === schluessel ? '' : schluessel; zu(); neuZeichnen(); } }, _kal.filterPerson === schluessel ? 'Filter aufheben' : 'Nur diese Tage zeigen'),
      el('button', { class: 'knopf voll', onclick: () => { zu(); kalTerminBearbeiten(null, _kal.tag || heute, (d) => neuZeichnen(d)); } }, 'Einen Tag dazu')));
  const zu = zeigeDeck(kasten);
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
    raus.append(el('div', { class: 'kal-leertag mitte' }, 'Noch niemand im Kalender. Trag einen Tag ein und schreib einen Namen dazu — mehr braucht es nicht.'));
    return raus;
  }
  /* Die Leiste spannt sich ueber die Jahre, in denen wirklich jemand lebt —
     mindestens ab 2000. Vierhundert leere Jahre zu zeichnen, nur weil der
     Kalender so weit zurueckreicht, waere eine leere Wand. */
  const von = kalZeigeVon(alle);
  const spanne = KAL_JAHR_BIS - von + 1;
  const anteil = (datum) => { const t = kalTeile(datum); return t ? ((t.jahr - von) + ((t.monat || 1) - 1) / 12) / spanne : 0; };
  const schritt = spanne > 200 ? 50 : spanne > 90 ? 25 : spanne > 60 ? 10 : 5;

  const massband = el('div', { class: 'kal-massband' });
  for (let j = Math.ceil(von / schritt) * schritt; j <= KAL_JAHR_BIS; j += schritt) {
    massband.append(el('i', { class: 'kal-massmarke', style: 'left:' + (anteil(kalDatum(j, 1, 1)) * 100).toFixed(2) + '%' }, String(j)));
  }
  massband.append(el('i', { class: 'kal-massheute', style: 'left:' + (anteil(kalHeute()) * 100).toFixed(2) + '%', title: 'heute' }));
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
        class: 'kal-kerbe', style: 'left:' + (anteil(e.wann) * 100).toFixed(2) + '%;--artfarbe:' + art.farbe,
        title: (e.titel || art.name) + ' · ' + kalLesbar(e.wann),
        onclick: () => { _kal.ansicht = 'monat'; neuZeichnen(e.wann); }
      }, el('i', { html: kalIcon(e.icon || art.icon, 12) })));
    }
    const alterText = lebt ? 'wurde ' + kalLebensalter(p).jahre + ' Jahre' : p.geburt ? kalAlterText(kalAlter(p.geburt, kalHeute())) + ' alt' : p.termine.length + (p.termine.length === 1 ? ' Eintrag' : ' Einträge');
    band.append(el('button', { class: 'kal-bandname', title: 'Alles über ' + p.name, onclick: () => kalPersonBlatt(p, neuZeichnen) },
      el('b', {}, p.name),
      el('small', {}, (p.geburt ? '✻ ' + kalKurz(p.geburt) : '') + (p.tod ? '   † ' + kalKurz(p.tod) : '') + (p.geburt || p.tod ? ' · ' : '') + alterText)), spur);
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
