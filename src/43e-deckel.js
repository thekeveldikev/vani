/* ================================================================
   VANI — Umschlag und Regal: Hefte, die aussehen wie benutzt.

   Ein Heft ist mehr als eine Farbe mit Muster. Es hat einen Stoff (Leinen,
   Leder, Kraftpapier, Samt, Marmor), ein Etikett (Schild, Tesastreifen,
   Handschrift, Prägung), Ecken, ein Gummiband, abgegriffene Kanten, Sticker
   und Gekritzel auf dem Deckel — und einen Seitenblock, der an der Kante
   hervorlugt. All das wird hier gebaut: der Deckel selbst (`baueDeckelElement`),
   das Atelier zum Gestalten (`heftAtelier`) und die drei Ansichten der
   Hefteübersicht: Karten, das Regal mit stehenden Rücken, der Tisch mit
   verstreuten Heften. Ins Regal stellen und herausnehmen ist animiert.
   ================================================================ */

const DECKEL_STOFFE = [['leinen', 'Leinen'], ['leder', 'Leder'], ['kraft', 'Kraftpapier'], ['samt', 'Samt'], ['marmor', 'Marmor'], ['glatt', 'Glatt']];
const DECKEL_ETIKETTEN = [['schild', 'Schild'], ['tesa', 'Tesastreifen'], ['hand', 'Handschrift'], ['praegung', 'Prägung'], ['keins', 'Ohne']];
const DECKEL_SCHRIFTEN = [['serif', 'Serife'], ['hand', 'Handschrift'], ['klar', 'Klar']];
const DECKEL_ECKEN = [['rund', 'Rund'], ['eckig', 'Eckig'], ['metall', 'Metallecken']];
const HEFTE_ANSICHTEN = [['karten', 'Karten'], ['regal', 'Regal'], ['tisch', 'Tisch']];

/* Was auf einem Deckel stehen darf — begrenzt, mit Vorgaben. Pur. */
function saubererDeckel(roh) {
  const q = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  const wahl = (wert, liste, vorgabe) => liste.some((e) => e[0] === wert) ? wert : vorgabe;
  const sticker = Array.isArray(q.sticker) ? q.sticker.slice(0, 200).map((s) => {
    if (!s || typeof s !== 'object' || typeof s.bild !== 'string') return null;
    const p = s.pos && typeof s.pos === 'object' ? s.pos : {};
    return { bild: s.bild.slice(0, 500), pos: { x: begrenze(p.x, -20, 110, 50), y: begrenze(p.y, -20, 110, 50), rot: begrenze(p.rot, -180, 180, 0), w: begrenze(p.w, 8, 90, 34) } };
  }).filter(Boolean).slice(0, 24) : [];
  return {
    stoff: wahl(q.stoff, DECKEL_STOFFE, 'leinen'),
    etikett: wahl(q.etikett, DECKEL_ETIKETTEN, 'schild'),
    schrift: wahl(q.schrift, DECKEL_SCHRIFTEN, 'serif'),
    ecken: wahl(q.ecken, DECKEL_ECKEN, 'rund'),
    gummi: q.gummi === true,
    gummifarbe: /^#[0-9a-f]{6}$/i.test(q.gummifarbe || '') ? q.gummifarbe : '#2c251c',
    abgegriffen: begrenze(q.abgegriffen, 0, 1, 0),
    sticker
  };
}

/* Das Heft als Element — klein im Regal, groß im Atelier. */
function baueDeckelElement(h, { gross = false, interaktiv = false, seitenzahl = null, beiSticker = null } = {}) {
  const stil = heftDeckelDaten(h);
  const d = saubererDeckel(h.deckel);
  const seiten = seitenzahl == null ? kinder(h.id, 'seite').length : seitenzahl;
  const dick = Math.min(5, 1 + Math.floor(seiten / 12));   /* der Seitenblock wächst mit */
  const deckel = el('div', {
    class: 'heftdeckel muster-' + stil.muster + ' stoff-' + d.stoff + ' etikett-' + d.etikett + ' schrift-' + d.schrift + ' ecken-' + d.ecken
      + (d.gummi ? ' mit-gummi' : '') + (gross ? ' gross' : '') + (h.archiv ? ' archiv' : ''),
    style: stil.style + ';--dick:' + dick + ';--abgegriffen:' + d.abgegriffen.toFixed(2) + ';--gummi:' + d.gummifarbe,
    'data-heft': h.id
  });
  deckel.append(el('div', { class: 'seitenblock' }));
  if (d.abgegriffen > 0) deckel.append(el('div', { class: 'abnutzung' }));
  if (d.ecken === 'metall') deckel.append(el('i', { class: 'ecke ol' }), el('i', { class: 'ecke or' }), el('i', { class: 'ecke ul' }), el('i', { class: 'ecke ur' }));
  /* Sticker und Gekritzel auf dem Deckel */
  const stickerLage = el('div', { class: 'deckel-sticker' });
  d.sticker.forEach((s, i) => {
    const img = el('img', { alt: '', draggable: 'false' });
    setzeBild(img, s.bild);
    const halter = el('div', { class: 'deckel-aufkleber', style: 'left:' + s.pos.x + '%;top:' + s.pos.y + '%;width:' + s.pos.w + '%;transform:translate(-50%,-50%) rotate(' + s.pos.rot + 'deg)' }, img);
    if (interaktiv && beiSticker) beiSticker(halter, s, i);
    stickerLage.append(halter);
  });
  deckel.append(stickerLage);
  if (d.etikett !== 'keins') {
    deckel.append(el('div', { class: 'etikett' }, el('div', { class: 'htitel' }, h.titel || 'Ohne Titel')));
  } else {
    deckel.append(el('div', { class: 'htitel frei' }, h.titel || 'Ohne Titel'));
  }
  if (d.gummi) deckel.append(el('div', { class: 'gummiband' }));
  if (!gross) {
    if (h.archiv) deckel.append(el('div', { class: 'hdatum' }, 'INS REGAL · ' + fmtDatum(h.archiv)));
    deckel.append(el('div', { class: 'hseiten' }, seiten === 1 ? '1 Seite' : seiten + ' Seiten'));
  }
  return deckel;
}

/* Der Buchrücken fürs stehende Regal. */
function baueRuecken(h) {
  const stil = heftDeckelDaten(h);
  const d = saubererDeckel(h.deckel);
  const seiten = kinder(h.id, 'seite').length;
  const breite = Math.round(30 + Math.min(34, seiten * 1.1));
  const hoehe = 150 + ((h.titel || '').length % 3) * 8;   /* nicht alle gleich hoch — wie im echten Regal */
  return el('button', {
    class: 'heftruecken stoff-' + d.stoff + ' schrift-' + d.schrift, 'data-heft': h.id,
    style: stil.style + ';width:' + breite + 'px;height:' + hoehe + 'px', title: h.titel
  }, el('span', { class: 'rtitel' }, h.titel || 'Ohne Titel'), el('i', { class: 'rband' }));
}

/* Ein zufälliger, schöner Look — fürs schnelle Ausprobieren. */
function zufallsLook(h) {
  h.farbe = zufall(HEFTFARBEN); h.farbe2 = Math.random() < .5 ? h.farbe : zufall(HEFTFARBEN);
  h.band = zufall(['#d6bd92', '#b8923f', '#2c251c', '#f3e6c6', '#7a4048']);
  h.muster = zufall(HEFT_MUSTER)[0];
  const d = saubererDeckel(h.deckel);
  d.stoff = zufall(DECKEL_STOFFE)[0]; d.etikett = zufall(DECKEL_ETIKETTEN.filter((e) => e[0] !== 'keins'))[0];
  d.schrift = zufall(DECKEL_SCHRIFTEN)[0]; d.ecken = zufall(DECKEL_ECKEN)[0];
  d.gummi = Math.random() < .45; d.abgegriffen = Math.random() < .5 ? 0 : Math.round(Math.random() * 8) / 10;
  h.deckel = d;
}

/* ----- Das Atelier ----- */
async function heftAtelier(h, danach) {
  h.deckel = saubererDeckel(h.deckel);
  const alt = JSON.parse(JSON.stringify({ farbe: h.farbe, farbe2: h.farbe2, band: h.band, muster: h.muster, papier: h.papier, papierfarbe: h.papierfarbe, rand: h.rand, deckel: h.deckel }));
  const buehne = el('div', { class: 'atelier-buehne' });
  let behalten = false;

  /* Sticker auf der Vorschau: ziehen, lange halten für Menü */
  const stickerGesten = (halter, s) => {
    let zieht = null;
    halter.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); e.preventDefault();
      const r = halter.parentElement.getBoundingClientRect();
      zieht = { sx: e.clientX, sy: e.clientY, x0: s.pos.x, y0: s.pos.y, r, bewegt: false };
      try { halter.setPointerCapture(e.pointerId); } catch (x) {}
    });
    halter.addEventListener('pointermove', (e) => {
      if (!zieht) return;
      const dx = e.clientX - zieht.sx, dy = e.clientY - zieht.sy;
      if (!zieht.bewegt && Math.hypot(dx, dy) < 5) return;
      zieht.bewegt = true;
      s.pos.x = begrenze(zieht.x0 + dx / zieht.r.width * 100, -20, 110, 50);
      s.pos.y = begrenze(zieht.y0 + dy / zieht.r.height * 100, -20, 110, 50);
      halter.style.left = s.pos.x + '%'; halter.style.top = s.pos.y + '%';
    });
    halter.addEventListener('pointerup', () => { zieht = null; });
    langdruck(halter, async () => {
      const wahl = await menue([
        { text: 'Etwas drehen', icon: 'drehen', wert: 'dreh' },
        { text: 'Größer', icon: 'auf', wert: 'gross' }, { text: 'Kleiner', icon: 'ab', wert: 'klein' },
        { text: 'Abmachen', icon: 'muell', wert: 'weg', rot: true }
      ]);
      if (wahl === 'dreh') s.pos.rot = ((s.pos.rot || 0) + 15 + 180) % 360 - 180;
      else if (wahl === 'gross') s.pos.w = Math.min(90, s.pos.w * 1.2);
      else if (wahl === 'klein') s.pos.w = Math.max(8, s.pos.w / 1.2);
      else if (wahl === 'weg') h.deckel.sticker = h.deckel.sticker.filter((x) => x !== s);
      if (wahl) aktualisiere();
    });
  };
  const aktualisiere = () => {
    buehne.innerHTML = '';
    buehne.append(baueDeckelElement(h, { gross: true, interaktiv: true, beiSticker: stickerGesten }));
  };

  const wahlgruppe = (liste, lies, setze) => {
    const g = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
    for (const [id, name] of liste) g.append(el('button', { class: lies() === id ? 'an' : '', onclick: (e) => { setze(id); $$('button', g).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); aktualisiere(); } }, name));
    return g;
  };
  const farben = el('div', { class: 'heft-farben' });
  const frei = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(h.farbe || '') ? h.farbe : HEFTFARBEN[0], title: 'Eigene Grundfarbe' });
  const zweit = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(h.farbe2 || '') ? h.farbe2 : (h.farbe || HEFTFARBEN[0]), title: 'Zweite Farbe' });
  const band = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(h.band || '') ? h.band : '#d6bd92', title: 'Buchband' });
  const gummifarbe = el('input', { type: 'color', value: h.deckel.gummifarbe, title: 'Gummiband' });
  for (const f of HEFTFARBEN) farben.append(el('button', { class: 'heft-farbpunkt', style: 'background:' + f, title: f, onclick: () => { h.farbe = f; frei.value = f; aktualisiere(); } }));
  frei.addEventListener('input', () => { h.farbe = frei.value; aktualisiere(); });
  zweit.addEventListener('input', () => { h.farbe2 = zweit.value; aktualisiere(); });
  band.addEventListener('input', () => { h.band = band.value; aktualisiere(); });
  gummifarbe.addEventListener('input', () => { h.deckel.gummifarbe = gummifarbe.value; aktualisiere(); });
  const gummi = el('button', { class: 'schalter' + (h.deckel.gummi ? ' an' : ''), onclick: (e) => { h.deckel.gummi = !h.deckel.gummi; e.currentTarget.classList.toggle('an', h.deckel.gummi); aktualisiere(); } }, el('i'));
  const abgegriffen = el('input', { type: 'range', min: '0', max: '1', step: '.1', value: String(h.deckel.abgegriffen), 'aria-label': 'Abgegriffen' });
  abgegriffen.addEventListener('input', () => { h.deckel.abgegriffen = Number(abgegriffen.value); aktualisiere(); });
  const rand = el('button', { class: 'schalter' + (h.rand ? ' an' : ''), onclick: (e) => { h.rand = !h.rand; e.currentTarget.classList.toggle('an', h.rand); } }, el('i'));
  const papierfarbe = el('div', { class: 'wahlgruppe papierfarben', style: 'flex-wrap:wrap' });
  for (const [id, name] of PAPIERFARBEN) papierfarbe.append(el('button', {
    class: 'papierfarbe-' + id + ((h.papierfarbe || 'hell') === id ? ' an' : ''), title: name,
    onclick: (e) => { h.papierfarbe = id; $$('button', papierfarbe).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); }
  }, name));

  const stickerDazu = async (art) => {
    let bild = null, verhaeltnis = .5;
    if (art === 'zeichnen') {
      const neu = await stickerZeichnen({ titel: 'Aufs Cover kritzeln', inKiste: false });
      if (!neu) return;
      bild = neu.bild; verhaeltnis = neu.seitenverhaeltnis;
    } else {
      const kiste = stickerKiste();
      const wahl = await menue([
        ...STICKER_MITGEBRACHT.map((m) => ({ text: m.name, icon: 'sticker', wert: 'm:' + m.id })),
        ...kiste.slice(0, 12).map((v, i) => ({ text: 'Aus meiner Kiste ' + (i + 1), icon: 'archiv', wert: 'k:' + v.id }))
      ], 'Welcher Sticker aufs Cover?');
      if (!wahl) return;
      if (wahl.startsWith('m:')) { const m = STICKER_MITGEBRACHT.find((x) => x.id === wahl.slice(2)); try { bild = await stickerMitgebrachtBild(m); verhaeltnis = m.verhaeltnis; } catch (e) { toast('Der Sticker ließ sich nicht laden.'); return; } }
      else { const v = D.docs.get(wahl.slice(2)); if (!v) return; bild = v.bild; verhaeltnis = v.verhaeltnis || .5; }
    }
    h.deckel.sticker.push({ bild, pos: { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, rot: -12 + Math.random() * 24, w: verhaeltnis < .35 ? 46 : 32 } });
    h.deckel.sticker = h.deckel.sticker.slice(-24);
    aktualisiere();
  };

  const kasten = el('div', { class: 'modal heft-atelier' },
    el('div', { class: 'atelier-kopf' }, el('h2', {}, 'Heft gestalten'),
      el('button', { class: 'knopf zart', title: 'Zufälliger Look', onclick: () => { zufallsLook(h); frei.value = h.farbe; zweit.value = h.farbe2 || h.farbe; band.value = h.band; aktualisiere(); toast('Gewürfelt. Nochmal würfeln oder verfeinern.'); } }, el('span', { html: ik('wuerfel'), style: 'display:flex' }), 'Würfeln')),
    buehne,
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Stoff'), wahlgruppe(DECKEL_STOFFE, () => h.deckel.stoff, (v) => { h.deckel.stoff = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Farben'), farben,
      el('div', { class: 'heft-freifarben' }, el('label', {}, 'Grundton ', frei), el('label', {}, 'Zweitton ', zweit), el('label', {}, 'Band ', band))),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Muster'), wahlgruppe(HEFT_MUSTER, () => h.muster || 'schlicht', (v) => { h.muster = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Etikett'), wahlgruppe(DECKEL_ETIKETTEN, () => h.deckel.etikett, (v) => { h.deckel.etikett = v; }),
      el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Schrift'), wahlgruppe(DECKEL_SCHRIFTEN, () => h.deckel.schrift, (v) => { h.deckel.schrift = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Aufkleben & kritzeln'),
      el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        el('button', { class: 'knopf', onclick: () => stickerDazu('kiste') }, el('span', { html: ik('sticker'), style: 'display:flex' }), 'Sticker aufs Cover'),
        el('button', { class: 'knopf', onclick: () => stickerDazu('zeichnen') }, el('span', { html: ik('stift'), style: 'display:flex' }), 'Aufs Cover kritzeln')),
      el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Auf der Vorschau ziehen verschiebt, lange halten dreht, vergrößert oder macht ab.')),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Ecken & Band'), wahlgruppe(DECKEL_ECKEN, () => h.deckel.ecken, (v) => { h.deckel.ecken = v; }),
      el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, 'Gummiband', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'hält das Heft zu — wie bei einem Notizbuch aus dem Laden')), el('span', { style: 'display:flex;gap:10px;align-items:center' }, gummifarbe, gummi)),
      el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, 'Abgegriffen', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Kanten und Ecken, die schon viel erlebt haben')), abgegriffen)),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Papier'), wahlgruppe(
      [['liniert', 'Liniert'], ['breit', 'Breite Linien'], ['kariert', 'Kariert'], ['punkte', 'Punktraster'], ['blank', 'Blanko'], ['cornell', 'Cornell'], ['storyboard', 'Storyboard'], ['dialog', 'Dialogblatt']],
      () => h.papier || 'liniert', (v) => { h.papier = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Papierfarbe'), papierfarbe),
    el('div', { class: 'einstellgruppe einstellzeile' }, el('span', { class: 'ename' }, 'Randlinie', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Eine Linie am linken Rand wie im Schulheft — Platz für Notizen.')), rand),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => { behalten = true; speichere(h); zu(); if (danach) danach(); } }, 'So bleibt es')));
  /* Als Fenster: links die Vorschau (bleibt stehen), rechts die Felder (scrollen).
     Auf schmalen Schirmen untereinander, mit kleinerer Vorschau. */
  const kopfEl = kasten.querySelector('.atelier-kopf');
  const felder = el('div', { class: 'atelier-felder' });
  for (const kind of [...kasten.children]) if (kind !== kopfEl && kind !== buehne) felder.append(kind);
  kasten.append(el('div', { class: 'atelier-raster' }, el('div', { class: 'atelier-links' }, buehne), felder));
  const zu = zeigeDeck(kasten, () => { if (!behalten) { Object.assign(h, alt); if (danach) danach(); } });
  aktualisiere();
}

/* ----- Tisch und Regal einrichten ----- */
const TISCH_PLATTEN = [['eiche', 'Eiche'], ['nuss', 'Nussbaum'], ['leder', 'Leder'], ['leinen', 'Leinen'], ['dunkel', 'Dunkel']];
const TISCH_GROESSEN = [['klein', 'Klein'], ['mittel', 'Mittel'], ['gross', 'Groß']];
const TISCH_SORTIERUNGEN = [['zuletzt', 'Zuletzt benutzt'], ['az', 'A–Z'], ['farbe', 'Nach Farbe']];
function saubererTisch(roh) {
  const q = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  const wahl = (wert, liste, vorgabe) => liste.some((e) => e[0] === wert) ? wert : vorgabe;
  return {
    platte: wahl(q.platte, TISCH_PLATTEN, 'eiche'),
    groesse: wahl(q.groesse, TISCH_GROESSEN, 'mittel'),
    unordnung: q.unordnung !== false,
    sortierung: wahl(q.sortierung, TISCH_SORTIERUNGEN, 'zuletzt')
  };
}
function tischEinrichten(danach) {
  const t = saubererTisch(D.einst.tisch);
  const alt = { ...t };
  let behalten = false;
  const wahlgruppe = (liste, lies, setze) => {
    const g = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
    for (const [id, name] of liste) g.append(el('button', { class: lies() === id ? 'an' : '', onclick: (e) => { setze(id); $$('button', g).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); D.einst.tisch = { ...t }; if (danach) danach(); } }, name));
    return g;
  };
  const unordnung = el('button', { class: 'schalter' + (t.unordnung ? ' an' : ''), onclick: (e) => { t.unordnung = !t.unordnung; e.currentTarget.classList.toggle('an', t.unordnung); D.einst.tisch = { ...t }; if (danach) danach(); } }, el('i'));
  const kasten = el('div', { class: 'modal tisch-einrichten' },
    el('h2', {}, 'Tisch und Regal einrichten'),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Platte und Bretter'), wahlgruppe(TISCH_PLATTEN, () => t.platte, (v) => { t.platte = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Größe der Hefte'), wahlgruppe(TISCH_GROESSEN, () => t.groesse, (v) => { t.groesse = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Reihenfolge'), wahlgruppe(TISCH_SORTIERUNGEN, () => t.sortierung, (v) => { t.sortierung = v; })),
    el('div', { class: 'einstellgruppe einstellzeile' }, el('span', { class: 'ename' }, 'Unordnung', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Hefte liegen leicht verdreht — wie auf einem echten Tisch.')), unordnung),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => { D.einst.tisch = alt; if (danach) danach(); zu(); } }, 'Zurück'),
      el('button', { class: 'knopf voll', onclick: () => { behalten = true; D.einst.tisch = { ...t }; speichereEinst(); zu(); if (danach) danach(); } }, 'So bleibt es')));
  const zu = zeigeDeck(kasten, () => { if (!behalten) { D.einst.tisch = alt; if (danach) danach(); } });
}

/* ----- Die Übersicht: Karten, Regal, Tisch ----- */

/* FLIP: vor dem Neuzeichnen die Lage merken, danach von dort aus hingleiten.
   So sieht man, wie ein Heft ins Regal wandert — statt dass es verschwindet
   und woanders wieder auftaucht. */
const _heftLagen = new Map();
function merkeHeftLagen() {
  _heftLagen.clear();
  $$('[data-heft]').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width) _heftLagen.set(e.dataset.heft, r); });
}
function spieleHeftLagen() {
  if (!_heftLagen.size) return;
  requestAnimationFrame(() => {
    $$('[data-heft]').forEach((e) => {
      const alt = _heftLagen.get(e.dataset.heft);
      if (!alt) return;
      const neu = e.getBoundingClientRect();
      const dx = alt.left - neu.left, dy = alt.top - neu.top, sx = alt.width / (neu.width || 1), sy = alt.height / (neu.height || 1);
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2 && Math.abs(sx - 1) < .05) return;
      e.style.transition = 'none';
      e.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
      e.style.transformOrigin = 'top left';
      requestAnimationFrame(() => {
        e.style.transition = 'transform .55s cubic-bezier(.2,.8,.2,1)';
        e.style.transform = '';
        setTimeout(() => { e.style.transition = ''; e.style.transformOrigin = ''; }, 600);
      });
    });
    _heftLagen.clear();
  });
}

function renderHefteRegal(haupt) {
  const ansicht = HEFTE_ANSICHTEN.some((a) => a[0] === D.einst.hefteAnsicht) ? D.einst.hefteAnsicht : 'karten';
  const wahl = el('div', { class: 'heft-ansichtswahl', role: 'group', 'aria-label': 'Ansicht der Hefte' },
    HEFTE_ANSICHTEN.map(([id, name]) => el('button', { class: ansicht === id ? 'an' : '', onclick: () => { D.einst.hefteAnsicht = id; speichereEinst(); zeichne(); } }, name)));
  const tisch = saubererTisch(D.einst.tisch);
  haupt.append(raumkopf('Hefte', null, wahl,
    ansicht !== 'karten' ? el('button', { class: 'rundknopf zart', html: ik('feinheiten'), title: 'Tisch und Regal einrichten', onclick: () => tischEinrichten(() => zeichne()) }) : null,
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), title: 'Neues Heft', onclick: async () => {
        const name = await eingabe({ titel: 'Ein neues Heft', platzhalter: 'Wie soll es heißen?' });
        if (!name) return;
        const h = neuDoc('heft', { titel: name, farbe: zufall(HEFTFARBEN), farbe2: zufall(HEFTFARBEN), band: '#d6bd92', muster: 'leinen', papier: 'liniert', ansicht: 'seiten', deckel: saubererDeckel({ stoff: zufall(DECKEL_STOFFE)[0] }) });
        location.hash = '#/heft/' + h.id;
      }
    })
  ));
  const inhalt = el('div', { class: 'inhalt hefte-' + ansicht + ' platte-' + tisch.platte + ' groesse-' + tisch.groesse + (tisch.unordnung ? '' : ' ordentlich') });
  const sortiere = (a, b) => tisch.sortierung === 'az' ? String(a.titel || '').localeCompare(String(b.titel || ''), 'de')
    : tisch.sortierung === 'farbe' ? String(a.farbe || '').localeCompare(String(b.farbe || '')) || b.geaendert - a.geaendert
    : b.geaendert - a.geaendert;
  const alle = vomTyp('heft').sort(sortiere);
  const aktive = alle.filter((h) => !h.archiv);
  const imRegal = alle.filter((h) => h.archiv);
  if (!alle.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Ein leeres Regal.', el('div', { class: 'klein' }, 'Das erste Heft ist das beste Versprechen, das es gibt.')));
    haupt.append(inhalt); return;
  }
  const oeffne = (h, e) => {
    /* kurz herausziehen, dann aufschlagen */
    const el_ = e && e.currentTarget; if (el_) el_.classList.add('zieht');
    setTimeout(() => { location.hash = '#/heft/' + h.id; }, el_ ? 180 : 0);
  };
  const menueMit = (h) => heftMenue(h, () => { merkeHeftLagen(); zeichne(); spieleHeftLagen(); });

  if (ansicht === 'karten' || ansicht === 'tisch') {
    const gitter = el('div', { class: ansicht === 'tisch' ? 'heft-tisch' : 'regal' });
    aktive.forEach((h, i) => {
      const d = baueDeckelElement(h);
      const knopf = el('button', { class: 'heft-halter', style: ansicht === 'tisch' ? '--dreh:' + ((i * 37) % 11 - 5) + 'deg' : '', onclick: (e) => oeffne(h, e) }, d);
      langdruck(knopf, () => menueMit(h));
      gitter.append(knopf);
    });
    inhalt.append(gitter);
    if (imRegal.length) {
      inhalt.append(el('div', { class: 'regal-trenner' }, 'IM REGAL'));
      const g2 = el('div', { class: ansicht === 'tisch' ? 'heft-stapel' : 'regal' });
      imRegal.forEach((h, i) => {
        const knopf = el('button', { class: 'heft-halter', style: ansicht === 'tisch' ? '--dreh:' + ((i * 53) % 9 - 4) + 'deg;--lage:' + i : '', onclick: (e) => oeffne(h, e) }, baueDeckelElement(h));
        langdruck(knopf, () => menueMit(h));
        g2.append(knopf);
      });
      inhalt.append(g2);
    }
  } else {
    /* Das Regal: Bretter mit stehenden Rücken; was im Regal steht, ein Brett tiefer. */
    const regal = el('div', { class: 'buecherregal' });
    const brett = (hefte, titel) => {
      const reihe = el('div', { class: 'regalbrett' }, el('div', { class: 'brettrand' }));
      const buecher = el('div', { class: 'regalbuecher' });
      hefte.forEach((h) => {
        const r = baueRuecken(h);
        r.addEventListener('click', (e) => oeffne(h, e));
        langdruck(r, () => menueMit(h));
        buecher.append(r);
      });
      if (!hefte.length) buecher.append(el('div', { class: 'regal-leer' }, titel === 'IM REGAL' ? 'Noch nichts weggestellt.' : 'Alles weggestellt.'));
      reihe.append(buecher, el('div', { class: 'brettschild' }, titel));
      return reihe;
    };
    regal.append(brett(aktive, 'AUF DEM TISCH'));
    regal.append(brett(imRegal, 'IM REGAL'));
    inhalt.append(regal);
  }
  haupt.append(inhalt);
  spieleHeftLagen();
}
