/* ================================================================
   VANI — Der Lesestapel: Bücher auf dem Schreibtisch, und ein Lesemodus.

   Ein Buch ist eine PDF-Datei im eigenen Medienvorrat — sie liegt auf dem
   Gerät und reist verschlüsselt über den privaten Bereich mit, nie über das
   Netz und nie ins Repo. Das Cover wird aus der ersten Seite gezeichnet, wenn
   keines mitkommt. Gelesen wird wie in einem Lesegerät: Seite für Seite,
   mit Blättern, Lesezeichen, Gliederung (wenn das Buch eine hat), Zitaten,
   und Einstellungen, die am Gerät bleiben (Helligkeit, Wärme, Nacht,
   Doppelseite) — auf dem Handy einspaltig und mit Wischen, auf dem iPad
   quer als Doppelseite, am Laptop mit Pfeiltasten.

   Das Rendern übernimmt pdf.js (Apache-2.0, vendor/pdf.min.js), erst geladen,
   wenn das erste Buch aufgeschlagen wird.
   ================================================================ */

let _pdfjs = null;
async function pdfjsLaden() {
  if (_pdfjs) return _pdfjs;
  const modul = await import('./vendor/pdf.min.js');
  try { modul.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.min.js', location.href).toString(); } catch (e) {}
  _pdfjs = modul;
  return modul;
}

function lesestapelBuecher() {
  return vomTyp('buch').sort((a, b) => (b.zuletzt || b.angelegt || 0) - (a.zuletzt || a.angelegt || 0));
}

/* Fortschritt in Prozent — pur. */
function buchFortschritt(seite, seiten) {
  const s = Number(seiten) || 0, p = Number(seite) || 0;
  if (s <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(p / s * 100)));
}

/* Leseeinstellungen bleiben am Gerät (Helligkeit ist Gerätesache). Pur. */
const LESE_VORGABE = { helligkeit: 1, waerme: .15, nacht: false, doppel: 'auto', blaettern: true, zoom: 'seite' };
function saubereLeseEinstellung(roh) {
  const q = roh && typeof roh === 'object' ? roh : {};
  return {
    helligkeit: begrenze(q.helligkeit, .4, 1, 1),
    waerme: begrenze(q.waerme, 0, 1, .15),
    nacht: q.nacht === true,
    doppel: ['auto', 'an', 'aus'].includes(q.doppel) ? q.doppel : 'auto',
    blaettern: q.blaettern !== false,
    zoom: ['seite', 'breite'].includes(q.zoom) ? q.zoom : 'seite'
  };
}
function leseEinstellung() {
  try { return saubereLeseEinstellung(JSON.parse(localStorage.getItem('vani-lese') || '{}')); } catch (e) { return saubereLeseEinstellung({}); }
}
function leseEinstellungSpeichern(e) { try { localStorage.setItem('vani-lese', JSON.stringify(saubereLeseEinstellung(e))); } catch (x) {} }

/* Ein PDF (Datei/Blob) als Buch auflegen: Datei ablegen, zählen, Cover malen. */
async function buchAuflegenAusBlob(blob, name, { datei = null } = {}) {
  const pdfjs = await pdfjsLaden();
  const daten = await blob.arrayBuffer();
  const dok = await pdfjs.getDocument({ data: daten.slice(0) }).promise;
  const seiten = dok.numPages;
  let titel = String(name || 'Buch').replace(/\.pdf$/i, '');
  /* Dateinamen von Tauschbörsen tragen Klammerzusätze — die braucht kein Titel. */
  titel = titel.replace(/\s*\((?:[^()]*(?:z-lib|1lib|library|epdf)[^()]*)\)\s*/gi, ' ').replace(/^\[[^\]]*\]\s*•?\s*/, '').replace(/\s+/g, ' ').trim();
  let autor = '';
  try {
    const meta = await dok.getMetadata();
    if (meta && meta.info) {
      if (meta.info.Title && String(meta.info.Title).trim().length > 2 && !/untitled|microsoft|word/i.test(meta.info.Title)) titel = String(meta.info.Title).trim().slice(0, 160);
      if (meta.info.Author && String(meta.info.Author).trim()) autor = String(meta.info.Author).trim().slice(0, 160);
    }
  } catch (e) {}
  if (!autor) { const m = titel.match(/\(([^()]{3,80})\)\s*$/); if (m) { autor = m[1].replace(/^(\w[^,]*),\s*(.+)$/, '$2 $1').trim(); titel = titel.replace(/\s*\([^()]*\)\s*$/, '').trim(); } }
  const dateiId = datei || await speichereDateiBlob(new File([blob], titel + '.pdf', { type: 'application/pdf' }));
  /* Cover: erste Seite, etwa 480 px breit */
  let bild = null;
  try {
    const seite = await dok.getPage(1);
    const vp0 = seite.getViewport({ scale: 1 });
    const skala = 480 / vp0.width;
    const vp = seite.getViewport({ scale: skala });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    await seite.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    bild = await new Promise((res) => c.toBlob(async (b) => { if (!b) return res(null); try { res(await speichereDateiBlob(new File([b], 'cover.jpg', { type: 'image/jpeg' }))); } catch (e) { res(null); } }, 'image/jpeg', .82));
  } catch (e) {}
  try { dok.destroy(); } catch (e) {}
  const buch = neuDoc('buch', { titel, autor, datei: dateiId, bild, seiten, seite: 1, lesezeichen: [], zuletzt: Date.now() });
  return buch;
}

async function buecherAuflegenPerDatei() {
  const inp = el('input', { type: 'file', multiple: 'multiple', accept: '.pdf,application/pdf', style: 'display:none' });
  document.body.append(inp);
  inp.addEventListener('change', async () => {
    const dateien = [...(inp.files || [])]; inp.remove();
    if (!dateien.length) return;
    toast(dateien.length === 1 ? 'Lege das Buch auf …' : 'Lege ' + dateien.length + ' Bücher auf …', 3600);
    let n = 0;
    for (const f of dateien) {
      if (f.size > 300 * 1024 * 1024) { toast(f.name + ' ist zu schwer (über 300 MB).'); continue; }
      try { await buchAuflegenAusBlob(f, f.name); n++; } catch (e) { toast(f.name + ': ließ sich nicht öffnen.'); }
    }
    if (n) { toast(n === 1 ? 'Liegt auf dem Tisch.' : n + ' Bücher liegen auf dem Tisch.'); zeichne(); }
  });
  inp.click();
}

/* Aus dem Goodnotes-Archiv: dort liegen PDFs als ganze Dateien. */
async function buchAusGoodnotesArchiv() {
  const kandidaten = vomTyp('goodnote').filter((d) => d.art === 'pdf' && d.datei);
  if (!kandidaten.length) { toast('Im Goodnotes-Archiv liegt keine PDF.'); return; }
  const wahl = await menue(kandidaten.map((d) => ({ text: d.titel || d.dateiname || 'PDF', icon: 'buchzu', wert: d.id })), 'Welche PDF aufs Lesepult?');
  if (!wahl) return;
  const d = D.docs.get(wahl);
  const blob = await dbGet('media', d.datei);
  if (!blob) { toast('Die Datei ist nicht da.'); return; }
  toast('Lege das Buch auf …');
  try { await buchAuflegenAusBlob(blob, d.titel || d.dateiname || 'Buch', { datei: d.datei }); toast('Liegt auf dem Tisch.'); zeichne(); }
  catch (e) { toast('Ließ sich nicht öffnen.'); }
}

/* Desktop: Bücher aus dem Bücherordner neben der App. */
async function buecherAusOrdner() {
  const desk = typeof window !== 'undefined' && window.vaniDesktop;
  if (!desk || !desk.buecherListe) { toast('Den Bücherordner gibt es nur in der Desktop-App.'); return; }
  let liste = [];
  try { liste = await desk.buecherListe(); } catch (e) { liste = []; }
  if (!liste.length) { await zeigeAnkunft('Kein Buch im Ordner', ['Lege PDF-Dateien in den Ordner „VANI-Bücher" in deinen Dokumenten — oder in einen Ordner „buecher" neben der App.'], ''); return; }
  const da = new Set(lesestapelBuecher().map((b) => b.titel));
  const wahl = await menue([...liste.map((b) => ({ text: (da.has(b.name.replace(/\.pdf$/i, '')) ? '✓ ' : '') + b.name + ' · ' + formatBytes(b.size), icon: 'buchzu', wert: b.pfad })), { text: 'Alle auflegen', icon: 'plus', wert: '_alle' }], liste.length + ' Bücher im Ordner');
  if (!wahl) return;
  const auswahl = wahl === '_alle' ? liste : liste.filter((b) => b.pfad === wahl);
  let n = 0;
  for (const b of auswahl) {
    try {
      const bytes = await desk.buchLesen(b.pfad);
      if (!bytes) continue;
      await buchAuflegenAusBlob(new Blob([bytes], { type: 'application/pdf' }), b.name); n++;
      toast(n + ' von ' + auswahl.length + ' aufgelegt …', 1800);
    } catch (e) { toast(b.name + ': ließ sich nicht öffnen.'); }
  }
  if (n) { toast(n === 1 ? 'Liegt auf dem Tisch.' : n + ' Bücher liegen auf dem Tisch.'); zeichne(); }
}

/* Der Lesestapel als Fenster: Cover, Fortschritt, Auflegen. */
function lesestapelZeigen() {
  const buecher = lesestapelBuecher();
  const raster = el('div', { class: 'lesestapel-raster' });
  for (const b of buecher) {
    const img = el('img', { alt: '', draggable: 'false' });
    if (b.bild) setzeBild(img, b.bild);
    const k = el('button', { class: 'lesestapel-buch' + (b.bild ? '' : ' ohne-cover'), onclick: () => { zu(); buchOeffnen(b); } },
      el('div', { class: 'lesestapel-cover' }, img, b.bild ? null : el('span', {}, b.titel || 'Buch')),
      el('div', { class: 'lesestapel-titel' }, b.titel || 'Buch'),
      b.autor ? el('div', { class: 'lesestapel-autor' }, b.autor) : null,
      el('div', { class: 'lesestapel-balken' }, el('i', { style: 'width:' + buchFortschritt(b.seite, b.seiten) + '%' })),
      el('div', { class: 'lesestapel-stand' }, b.seiten ? 'Seite ' + (b.seite || 1) + ' von ' + b.seiten : ''));
    langdruck(k, async () => {
      const wahl = await menue([
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Cover aus einer anderen Seite', icon: 'kamera', wert: 'cover' },
        { text: 'Von vorn beginnen', icon: 'wieder', wert: 'anfang' },
        { text: 'Vom Tisch nehmen', icon: 'muell', wert: 'weg', rot: true }
      ], b.titel || 'Buch');
      if (wahl === 'name') { const n = await eingabe({ titel: 'Das Buch heißt …', wert: b.titel || '' }); if (n) { b.titel = n; speichere(b); zu(); lesestapelZeigen(); } }
      else if (wahl === 'cover') { const s = await eingabe({ titel: 'Welche Seite als Cover?', wert: '1', platzhalter: 'Seitenzahl' }); const n = parseInt(s, 10); if (n > 0) { await buchCoverAusSeite(b, n); zu(); lesestapelZeigen(); } }
      else if (wahl === 'anfang') { b.seite = 1; speichere(b); zu(); lesestapelZeigen(); }
      else if (wahl === 'weg' && await frage('„' + (b.titel || 'Buch') + '" vom Tisch nehmen? Die Datei geht in den Papierkorb.', { ja: 'Vom Tisch nehmen', gefahr: true })) { await loesche(b.id); zu(); zeichne(); }
    });
    raster.append(k);
  }
  if (!buecher.length) raster.append(el('div', { class: 'leer klein', style: 'grid-column:1/-1' }, 'Noch kein Buch auf dem Tisch.'));
  const desk = typeof window !== 'undefined' && window.vaniDesktop && window.vaniDesktop.buecherListe;
  const kasten = el('div', { class: 'modal lesestapel' },
    el('h2', {}, 'Der Lesestapel'),
    el('div', { class: 'stickerblock-hinweis' }, 'Bücher als PDF — sie liegen nur auf deinen Geräten und reisen verschlüsselt über den privaten Bereich. Antippen schlägt auf, lange halten: umbenennen, Cover, von vorn, vom Tisch nehmen.'),
    raster,
    el('div', { class: 'reihe', style: 'justify-content:flex-start;flex-wrap:wrap;gap:8px' },
      el('button', { class: 'knopf voll', onclick: () => { zu(); buecherAuflegenPerDatei(); } }, el('span', { html: ik('plus'), style: 'display:flex' }), 'PDF auflegen'),
      vomTyp('goodnote').some((d) => d.art === 'pdf') ? el('button', { class: 'knopf', onclick: () => { zu(); buchAusGoodnotesArchiv(); } }, 'Aus dem Goodnotes-Archiv') : null,
      desk ? el('button', { class: 'knopf', onclick: () => { zu(); buecherAusOrdner(); } }, 'Aus dem Bücherordner') : null,
      el('span', { class: 'rest' }),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Schließen')));
  const zu = zeigeDeck(kasten);
}

async function buchCoverAusSeite(b, n) {
  try {
    const pdfjs = await pdfjsLaden();
    const blob = await dbGet('media', b.datei); if (!blob) return;
    const dok = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
    const seite = await dok.getPage(Math.max(1, Math.min(dok.numPages, n)));
    const vp0 = seite.getViewport({ scale: 1 }); const vp = seite.getViewport({ scale: 480 / vp0.width });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    await seite.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    const id = await new Promise((res) => c.toBlob(async (bl) => res(bl ? await speichereDateiBlob(new File([bl], 'cover.jpg', { type: 'image/jpeg' })) : null), 'image/jpeg', .82));
    if (id) { b.bild = id; speichere(b); toast('Neues Cover.'); }
    try { dok.destroy(); } catch (e) {}
  } catch (e) { toast('Das Cover ließ sich nicht malen.'); }
}

/* ----- Der Lesemodus ----- */
let _leser = null;
async function buchOeffnen(b) {
  if (_leser) buchSchliessen();
  const e = leseEinstellung();
  const raum = el('div', { class: 'lesemodus' + (e.nacht ? ' nacht' : '') });
  const buehne = el('div', { class: 'lese-buehne' });
  const titel = el('div', { class: 'lese-titel' }, b.titel || 'Buch');
  const stand = el('div', { class: 'lese-stand' });
  const balken = el('input', { type: 'range', min: '1', max: String(Math.max(1, b.seiten || 1)), value: String(b.seite || 1), class: 'lese-balken', 'aria-label': 'Seite' });
  const kopf = el('div', { class: 'lese-kopf' },
    el('button', { class: 'knopf', onclick: () => buchSchliessen() }, el('span', { html: ik('zurueck'), style: 'display:flex' }), 'Zurück'),
    titel,
    el('button', { class: 'rundknopf zart', html: ik('gliederung'), title: 'Inhalt', onclick: () => leserGliederung() }),
    el('button', { class: 'rundknopf zart lese-zeichen', html: ik('lesezeichen'), title: 'Lesezeichen', onclick: () => leserLesezeichen() }),
    el('button', { class: 'rundknopf zart', html: ik('teilen'), title: 'Zitat kopieren / als Schnipsel', onclick: () => leserZitat() }),
    el('button', { class: 'rundknopf zart', html: ik('feinheiten'), title: 'Leseeinstellungen', onclick: () => leserEinstellungen() }));
  const fuss = el('div', { class: 'lese-fuss' }, el('button', { class: 'rundknopf zart', html: ik('zurueck'), title: 'Zurückblättern', onclick: () => blaettere(-1) }), balken, stand, el('button', { class: 'rundknopf zart', html: ik('rechts'), title: 'Weiterblättern', onclick: () => blaettere(1) }));
  raum.append(kopf, buehne, fuss);
  document.body.append(raum);
  _leser = { b, raum, buehne, e, dok: null, seite: Math.max(1, Math.min(b.seiten || 1, b.seite || 1)), busy: false, cache: new Map(), kopf, fuss, versteckTimer: null, zuletztGezeigt: 0 };
  const leser = _leser;

  const zeigeLeisten = () => { kopf.classList.remove('weg'); fuss.classList.remove('weg'); clearTimeout(leser.versteckTimer); leser.versteckTimer = setTimeout(() => { kopf.classList.add('weg'); fuss.classList.add('weg'); }, 2600); };
  zeigeLeisten();

  toast('Schlage auf …', 1800);
  try {
    const pdfjs = await pdfjsLaden();
    const blob = await dbGet('media', b.datei);
    if (!blob) throw new Error('Datei fehlt');
    leser.dok = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
    if (leser.dok.numPages !== b.seiten) { b.seiten = leser.dok.numPages; speichereStill(b); balken.max = String(b.seiten); }
  } catch (x) { toast('Das Buch ließ sich nicht aufschlagen.' + (x && x.message ? ' (' + x.message + ')' : ''), 4200); buchSchliessen(); return; }

  const doppel = () => leser.e.doppel === 'an' || (leser.e.doppel === 'auto' && raum.clientWidth >= 900 && raum.clientWidth > raum.clientHeight);
  const seitenJetzt = () => { const d = doppel(); if (!d) return [leser.seite]; const links = leser.seite % 2 === 0 ? leser.seite : leser.seite - 1; return [links, links + 1].filter((n) => n >= 1 && n <= b.seiten); };

  async function maleSeite(n, breite, hoehe) {
    const schl = n + ':' + Math.round(breite) + ':' + Math.round(hoehe) + ':' + leser.e.zoom;
    if (leser.cache.has(schl)) return leser.cache.get(schl);
    const seite = await leser.dok.getPage(n);
    const vp0 = seite.getViewport({ scale: 1 });
    const skala = leser.e.zoom === 'breite' ? breite / vp0.width : Math.min(breite / vp0.width, hoehe / vp0.height);
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const vp = seite.getViewport({ scale: skala * dpr });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    c.style.width = Math.round(vp.width / dpr) + 'px'; c.style.height = Math.round(vp.height / dpr) + 'px';
    await seite.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    if (leser.cache.size > 10) leser.cache.delete(leser.cache.keys().next().value);
    leser.cache.set(schl, c);
    return c;
  }
  async function zeige(richtung) {
    if (!leser.dok) return;
    const seiten = seitenJetzt();
    const d = seiten.length > 1;
    const breite = (buehne.clientWidth - (d ? 28 : 16)) / (d ? 2 : 1);
    const hoehe = buehne.clientHeight - 16;
    const neu = el('div', { class: 'lese-doppel' + (d ? ' zwei' : '') });
    for (const n of seiten) {
      const c = await maleSeite(n, breite, hoehe);
      const blatt = el('div', { class: 'lese-blatt' }, c, el('span', { class: 'lese-seitenzahl' }, String(n)));
      neu.append(blatt);
    }
    const alt = buehne.querySelector('.lese-doppel');
    if (alt && leser.e.blaettern && richtung) {
      alt.classList.add(richtung > 0 ? 'geht-links' : 'geht-rechts');
      neu.classList.add(richtung > 0 ? 'kommt-rechts' : 'kommt-links');
      buehne.append(neu);
      setTimeout(() => { alt.remove(); neu.classList.remove('kommt-rechts', 'kommt-links'); }, 420);
    } else { if (alt) alt.remove(); buehne.append(neu); }
    stand.textContent = seiten.join('–') + ' / ' + b.seiten + ' · ' + buchFortschritt(seiten[seiten.length - 1], b.seiten) + ' %';
    balken.value = String(leser.seite);
    kopf.querySelector('.lese-zeichen').classList.toggle('an', (b.lesezeichen || []).includes(leser.seite));
    b.seite = leser.seite; b.zuletzt = Date.now(); speichereStill(b);
    /* Nächste Seiten vorab malen */
    for (const n of [leser.seite + 1, leser.seite + 2, leser.seite - 1]) if (n >= 1 && n <= b.seiten) maleSeite(n, breite, hoehe).catch(() => {});
  }
  function blaettere(richtung) {
    const schritt = doppel() ? 2 : 1;
    const ziel = Math.max(1, Math.min(b.seiten, leser.seite + richtung * schritt));
    if (ziel === leser.seite) { toast(richtung > 0 ? 'Das war die letzte Seite.' : 'Das ist der Anfang.'); return; }
    leser.seite = ziel; zeige(richtung); zeigeLeisten();
  }
  leser.zeige = zeige; leser.blaettere = blaettere; leser.zeigeLeisten = zeigeLeisten;
  balken.addEventListener('input', () => { stand.textContent = balken.value + ' / ' + b.seiten; zeigeLeisten(); });
  balken.addEventListener('change', () => { leser.seite = Number(balken.value); zeige(0); });
  /* Tippen: rechts weiter, links zurück, Mitte Leisten */
  buehne.addEventListener('click', (ev) => {
    const r = buehne.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width;
    if (x > .66) blaettere(1); else if (x < .34) blaettere(-1); else zeigeLeisten();
  });
  /* Wischen */
  let wisch = null;
  buehne.addEventListener('pointerdown', (ev) => { wisch = { x: ev.clientX, y: ev.clientY, t: Date.now() }; });
  buehne.addEventListener('pointerup', (ev) => {
    if (!wisch) return; const dx = ev.clientX - wisch.x, dy = ev.clientY - wisch.y; wisch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { blaettere(dx < 0 ? 1 : -1); ev.preventDefault(); }
  });
  leser.tasten = (ev) => {
    if (!_leser) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown' || ev.key === ' ') { ev.preventDefault(); blaettere(1); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); blaettere(-1); }
    else if (ev.key === 'Escape') { ev.preventDefault(); buchSchliessen(); }
    else if (ev.key === 'Home') { leser.seite = 1; zeige(0); } else if (ev.key === 'End') { leser.seite = b.seiten; zeige(0); }
  };
  document.addEventListener('keydown', leser.tasten, true);
  leser.beiGroesse = () => { leser.cache.clear(); zeige(0); };
  window.addEventListener('resize', leser.beiGroesse);
  leserStil();
  await zeige(0);
}
function leserStil() {
  if (!_leser) return;
  const { raum, e } = _leser;
  raum.classList.toggle('nacht', e.nacht);
  raum.style.setProperty('--lese-hell', e.helligkeit);
  raum.style.setProperty('--lese-waerme', e.waerme);
}
function buchSchliessen() {
  if (!_leser) return;
  const l = _leser; _leser = null;
  document.removeEventListener('keydown', l.tasten, true);
  window.removeEventListener('resize', l.beiGroesse);
  clearTimeout(l.versteckTimer);
  try { if (l.dok) l.dok.destroy(); } catch (e) {}
  l.raum.remove();
  zeichne();
}
async function leserGliederung() {
  if (!_leser || !_leser.dok) return;
  const l = _leser;
  let gliederung = null;
  try { gliederung = await l.dok.getOutline(); } catch (e) {}
  if (!gliederung || !gliederung.length) { toast('Dieses Buch bringt keine Gliederung mit.'); return; }
  const punkte = [];
  const sammle = async (eintraege, tiefe) => {
    for (const g of eintraege.slice(0, 400)) {
      let seite = null;
      try {
        const dest = typeof g.dest === 'string' ? await l.dok.getDestination(g.dest) : g.dest;
        if (Array.isArray(dest) && dest[0]) seite = (await l.dok.getPageIndex(dest[0])) + 1;
      } catch (e) {}
      punkte.push({ titel: g.title, seite, tiefe });
      if (g.items && g.items.length && tiefe < 3) await sammle(g.items, tiefe + 1);
    }
  };
  await sammle(gliederung, 1);
  const liste = el('div', { class: 'gliederung' }, punkte.map((p) => el('button', { class: 'gliederung-punkt ebene-' + p.tiefe, onclick: () => { if (p.seite) { zu(); l.seite = p.seite; l.zeige(0); } } }, p.titel + (p.seite ? '  · ' + p.seite : ''))));
  const kasten = el('div', { class: 'modal gliederung-kasten' }, el('h2', {}, 'Inhalt'), liste, el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Schließen')));
  const zu = zeigeDeck(kasten);
}
async function leserLesezeichen() {
  if (!_leser) return;
  const l = _leser, b = l.b;
  const lz = Array.isArray(b.lesezeichen) ? b.lesezeichen : [];
  const hier = lz.includes(l.seite);
  const wahl = await menue([
    { text: hier ? 'Lesezeichen von Seite ' + l.seite + ' entfernen' : 'Lesezeichen auf Seite ' + l.seite, icon: 'lesezeichen', wert: 'hier' },
    ...lz.filter((n) => n !== l.seite).sort((a, c) => a - c).map((n) => ({ text: 'Zu Seite ' + n, icon: 'rechts', wert: 'zu:' + n }))
  ], 'Lesezeichen');
  if (!wahl) return;
  if (wahl === 'hier') { b.lesezeichen = hier ? lz.filter((n) => n !== l.seite) : [...lz, l.seite].slice(-200); speichere(b); l.zeige(0); }
  else if (wahl.startsWith('zu:')) { l.seite = Number(wahl.slice(3)); l.zeige(0); }
}
async function leserZitat() {
  if (!_leser || !_leser.dok) return;
  const l = _leser;
  let text = '';
  try { const tc = await (await l.dok.getPage(l.seite)).getTextContent(); text = tc.items.map((i) => i.str + (i.hasEOL ? '\n' : '')).join('').replace(/[ \t]+\n/g, '\n').trim(); } catch (e) {}
  if (!text) { toast('Diese Seite trägt keinen Text, den man herausnehmen könnte (vielleicht ein Bild).', 4000); return; }
  const feld = el('textarea', { rows: 10 }); feld.value = text;
  const quelle = '— ' + (l.b.titel || 'Buch') + (l.b.autor ? ', ' + l.b.autor : '') + ', S. ' + l.seite;
  const kasten = el('div', { class: 'modal zitat-kasten' },
    el('h2', {}, 'Seite ' + l.seite + ' als Text'),
    el('div', { class: 'stickerblock-hinweis' }, 'Markiere, was du brauchst — oder nimm die ganze Seite. Die Quelle kommt dazu.'),
    feld,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Schließen'),
      el('button', { class: 'knopf', onclick: async () => { const t = (feld.selectionStart !== feld.selectionEnd ? feld.value.slice(feld.selectionStart, feld.selectionEnd) : feld.value).trim(); try { await navigator.clipboard.writeText(t + '\n' + quelle); toast('Kopiert, mit Quelle.'); } catch (e) { teileText(t + '\n' + quelle); } } }, 'Kopieren'),
      el('button', { class: 'knopf voll', onclick: () => { const t = (feld.selectionStart !== feld.selectionEnd ? feld.value.slice(feld.selectionStart, feld.selectionEnd) : feld.value).trim(); neuDoc('schnipsel', { text: t + '\n' + quelle }); toast('Liegt in den Schnipseln — mit Quelle.'); zu(); } }, 'Als Schnipsel')));
  const zu = zeigeDeck(kasten);
}
function leserEinstellungen() {
  if (!_leser) return;
  const l = _leser, e = l.e;
  const regler = (name, schluessel, min, max, schritt) => { const r = el('input', { type: 'range', min: String(min), max: String(max), step: String(schritt), value: String(e[schluessel]) }); r.addEventListener('input', () => { e[schluessel] = Number(r.value); leseEinstellungSpeichern(e); leserStil(); }); return el('div', { class: 'einstellgruppe einstellzeile' }, el('span', { class: 'ename' }, name), r); };
  const wahl = (name, schluessel, liste, neuMalen) => { const g = el('div', { class: 'wahlgruppe' }); for (const [id, n] of liste) g.append(el('button', { class: e[schluessel] === id ? 'an' : '', onclick: (ev) => { e[schluessel] = id; leseEinstellungSpeichern(e); $$('button', g).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); leserStil(); if (neuMalen) { l.cache.clear(); l.zeige(0); } } }, n)); return el('div', { class: 'einstellgruppe' }, el('b', {}, name), g); };
  const kasten = el('div', { class: 'modal tisch-einrichten' },
    el('h2', {}, 'Lesen einstellen'),
    regler('Helligkeit', 'helligkeit', .4, 1, .05),
    regler('Wärme', 'waerme', 0, 1, .05),
    wahl('Nacht', 'nacht', [[false, 'Hell'], [true, 'Dunkel (Seiten invertiert)']]),
    wahl('Doppelseite', 'doppel', [['auto', 'Wie es passt'], ['an', 'Immer'], ['aus', 'Nie']], true),
    wahl('Größe', 'zoom', [['seite', 'Ganze Seite'], ['breite', 'Volle Breite']], true),
    wahl('Blättern', 'blaettern', [[true, 'Mit Bewegung'], [false, 'Ohne']]),
    el('div', { class: 'stickerblock-hinweis', style: 'margin-top:8px' }, 'Diese Einstellungen bleiben an diesem Gerät — Helligkeit ist Gerätesache. Seite, Lesezeichen und Stapel reisen mit.'),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}
