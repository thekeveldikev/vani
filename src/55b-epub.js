/* ===================== 55b — EPUB: EIGENER LESER =====================
   Kein Paket, keine Bibliothek: ein ZIP-Leser (zentrales Verzeichnis +
   DecompressionStream), das OPF-Rückgrat, Kapitel als gesäubertes HTML und
   Seiten per CSS-Spalten. Schrift, Größe und Zeilenabstand sind frei. */

/* ----- ZIP ----- */
/* Das zentrale Verzeichnis: Name → { methode, compSize, size, lokal }. Pur. */
function zipEintraege(bytes) {
  const dv = new DataView(bytes), n = bytes.byteLength;
  let eocd = -1;
  for (let i = n - 22; i >= Math.max(0, n - 65557); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('Kein ZIP');
  const anzahl = dv.getUint16(eocd + 10, true), cdOff = dv.getUint32(eocd + 16, true);
  const eintraege = new Map(), dec = new TextDecoder();
  let p = cdOff;
  for (let i = 0; i < anzahl && p + 46 <= n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const methode = dv.getUint16(p + 10, true), compSize = dv.getUint32(p + 20, true), size = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), commLen = dv.getUint16(p + 32, true);
    const lokal = dv.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(bytes, p + 46, nameLen));
    eintraege.set(name, { methode, compSize, size, lokal });
    p += 46 + nameLen + extraLen + commLen;
  }
  return eintraege;
}
/* Einen Eintrag lesen: gespeichert (0) oder deflate (8). */
async function zipLies(bytes, eintrag) {
  const dv = new DataView(bytes), p = eintrag.lokal;
  if (dv.getUint32(p, true) !== 0x04034b50) throw new Error('ZIP-Eintrag kaputt');
  const nameLen = dv.getUint16(p + 26, true), extraLen = dv.getUint16(p + 28, true);
  const start = p + 30 + nameLen + extraLen;
  const roh = new Uint8Array(bytes, start, eintrag.compSize);
  if (eintrag.methode === 0) return roh.slice();
  if (eintrag.methode !== 8) throw new Error('ZIP-Methode ' + eintrag.methode + ' kann ich nicht');
  if (typeof DecompressionStream === 'undefined') throw new Error('Dieses Gerät kann EPUB noch nicht entpacken (kein DecompressionStream).');
  const ds = new DecompressionStream('deflate-raw');
  const w = ds.writable.getWriter(); w.write(roh.slice()); w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
function istEpub(bytes, name) {
  if (/\.epub$/i.test(String(name || ''))) return true;
  if (!bytes || bytes.byteLength < 60) return false;
  const u = new Uint8Array(bytes, 0, 60);
  if (u[0] !== 0x50 || u[1] !== 0x4b) return false;
  return new TextDecoder().decode(u.slice(30, 58)).startsWith('mimetype');
}

/* ----- EPUB-Struktur ----- */
async function epubLaden(bytes) {
  const z = zipEintraege(bytes);
  const lies = (pfad) => { const e = z.get(pfad) || z.get(decodeURIComponent(pfad)); return e ? zipLies(bytes, e) : Promise.resolve(null); };
  const text = async (pfad) => { const b = await lies(pfad); if (!b) throw new Error('Im Buch fehlt ' + pfad); return new TextDecoder().decode(b); };
  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const cont = xml(await text('META-INF/container.xml'));
  const rf = cont.getElementsByTagNameNS('*', 'rootfile')[0];
  const opfPfad = rf && rf.getAttribute('full-path');
  if (!opfPfad) throw new Error('Kein Inhaltsverzeichnis (OPF)');
  const basis = opfPfad.includes('/') ? opfPfad.slice(0, opfPfad.lastIndexOf('/') + 1) : '';
  const aufloesen = (href, von = basis) => { try { const u = new URL(href, 'epub://x/' + von); return decodeURIComponent(u.pathname.slice(1)).split('#')[0]; } catch (e) { return href; } };
  const opf = xml(await text(opfPfad));
  const meta = (n) => { const e = opf.getElementsByTagNameNS('*', n)[0]; return e ? e.textContent.trim() : ''; };
  const manifest = new Map();
  for (const it of opf.getElementsByTagNameNS('*', 'item')) manifest.set(it.getAttribute('id'), { id: it.getAttribute('id'), href: it.getAttribute('href') || '', typ: it.getAttribute('media-type') || '', props: it.getAttribute('properties') || '' });
  const spine = [...opf.getElementsByTagNameNS('*', 'itemref')].filter((r) => r.getAttribute('linear') !== 'no').map((r) => manifest.get(r.getAttribute('idref'))).filter((m) => m && /html|xml/i.test(m.typ)).map((m) => ({ ...m, pfad: aufloesen(m.href) }));
  if (!spine.length) throw new Error('Das Buch hat keine Kapitel');
  let coverHref = null;
  const cm = [...manifest.values()].find((m) => /cover-image/.test(m.props));
  if (cm) coverHref = cm.href;
  else { const mc = [...opf.getElementsByTagNameNS('*', 'meta')].find((m) => m.getAttribute('name') === 'cover'); const ziel = mc && manifest.get(mc.getAttribute('content')); if (ziel) coverHref = ziel.href; else { const bild = [...manifest.values()].find((m) => /^image\//.test(m.typ) && /cover/i.test(m.id + m.href)); if (bild) coverHref = bild.href; } }
  /* Inhaltsverzeichnis: nav (EPUB 3) oder NCX (EPUB 2) */
  let toc = [];
  try {
    const nav = [...manifest.values()].find((m) => /\bnav\b/.test(m.props));
    if (nav) {
      const dokNav = new DOMParser().parseFromString(await text(aufloesen(nav.href)), 'text/html');
      const navEl = [...dokNav.querySelectorAll('nav')].find((n) => /toc/i.test(n.getAttribute('epub:type') || n.getAttribute('type') || '')) || dokNav.querySelector('nav');
      if (navEl) toc = [...navEl.querySelectorAll('a[href]')].map((a) => ({ titel: a.textContent.replace(/\s+/g, ' ').trim(), pfad: aufloesen(a.getAttribute('href'), aufloesen(nav.href).replace(/[^/]*$/, '')), tiefe: [...(function* (x) { let p = x.parentElement; while (p && p !== navEl) { if (p.tagName === 'OL' || p.tagName === 'UL') yield p; p = p.parentElement; } })(a)].length })).filter((t) => t.titel);
    } else {
      const ncx = [...manifest.values()].find((m) => /ncx/i.test(m.typ) || /\.ncx$/i.test(m.href));
      if (ncx) {
        const dokNcx = xml(await text(aufloesen(ncx.href)));
        toc = [...dokNcx.getElementsByTagNameNS('*', 'navPoint')].map((np) => { const l = np.getElementsByTagNameNS('*', 'text')[0], c = np.getElementsByTagNameNS('*', 'content')[0]; return { titel: l ? l.textContent.trim() : '', pfad: c ? aufloesen(c.getAttribute('src') || '', aufloesen(ncx.href).replace(/[^/]*$/, '')) : '', tiefe: 0 }; }).filter((t) => t.titel);
      }
    }
  } catch (e) { toc = []; }
  return { titel: meta('title'), autor: meta('creator'), sprache: meta('language'), spine, toc, coverPfad: coverHref ? aufloesen(coverHref) : null, lies, text, aufloesen, manifest };
}

/* Ein Kapitel als gesäubertes HTML-Fragment: Skripte, Formulare, Stile raus;
   Bilder werden aus dem ZIP geholt (Blob-URLs, die der Leser wieder freigibt). */
async function epubKapitelHTML(buch, pfad, urls) {
  const roh = await buch.text(pfad);
  const dok = new DOMParser().parseFromString(roh, 'text/html');
  const body = dok.body || dok.documentElement;
  for (const e of body.querySelectorAll('script, style, link, iframe, object, embed, form, input, button, video, audio, svg foreignObject, noscript')) e.remove();
  for (const e of body.querySelectorAll('*')) for (const a of [...e.attributes]) { if (/^on/i.test(a.name) || a.name === 'style' && /url\(/i.test(a.value)) e.removeAttribute(a.name); }
  const ordner = pfad.replace(/[^/]*$/, '');
  for (const img of body.querySelectorAll('img, image')) {
    const src = img.getAttribute('src') || img.getAttribute('xlink:href') || img.getAttribute('href');
    if (!src || /^(https?:|data:)/i.test(src)) { if (!/^data:/i.test(src || '')) img.remove(); continue; }
    const ziel = buch.aufloesen(src, ordner);
    try {
      let url = urls.get(ziel);
      if (!url) { const bytes = await buch.lies(ziel); if (!bytes) { img.remove(); continue; } const m = [...buch.manifest.values()].find((x) => buch.aufloesen(x.href) === ziel); url = URL.createObjectURL(new Blob([bytes], { type: m && m.typ || 'image/jpeg' })); urls.set(ziel, url); }
      if (img.tagName.toLowerCase() === 'image') img.setAttribute('href', url); else img.setAttribute('src', url);
      img.removeAttribute('width'); img.removeAttribute('height');
    } catch (e) { img.remove(); }
  }
  for (const a of body.querySelectorAll('a[href]')) { const h = a.getAttribute('href'); if (/^(https?:|mailto:)/i.test(h)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); } else { a.dataset.intern = buch.aufloesen(h, ordner); a.removeAttribute('href'); } }
  return body.innerHTML;
}

/* Bilder des Leinwand-Covers: erste Bilddatei, sonst nichts. */
async function epubCoverBlob(buch) {
  if (!buch.coverPfad) return null;
  const bytes = await buch.lies(buch.coverPfad);
  if (!bytes) return null;
  const m = [...buch.manifest.values()].find((x) => buch.aufloesen(x.href) === buch.coverPfad);
  return new Blob([bytes], { type: m && m.typ || 'image/jpeg' });
}

/* Ein EPUB auflegen: Blob → Buch-Dokument mit art 'epub'. */
async function buchAuflegenEpub(blob, name, { datei = null, autorVorgabe = '', titelFest = false, isbn = null } = {}) {
  const bytes = await blob.arrayBuffer();
  const buch = await epubLaden(bytes);
  let titel = titelFest || !buch.titel ? String(name || 'Buch').replace(/\.epub$/i, '').trim() : buch.titel;
  titel = titel.replace(/\s*\((?:[^()]*(?:z-lib|1lib|library|epdf)[^()]*)\)\s*/gi, ' ').replace(/\s*\[[^\]]*\]\s*•?\s*/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  const autor = autorVorgabe || (typeof saubererAutor === 'function' ? saubererAutor(buch.autor) : buch.autor) || '';
  const dateiId = datei || await speichereDateiBlob(new File([blob], titel + '.epub', { type: 'application/epub+zip' }));
  let bild = null;
  try { const c = await epubCoverBlob(buch); if (c && c.size > 2000) bild = await speichereDateiBlob(new File([c], 'cover.jpg', { type: c.type })); } catch (e) {}
  const doc = neuDoc('buch', { titel, autor, art: 'epub', datei: dateiId, bild, seiten: 100, seite: 0, kapitel: 0, anteil: 0, kapitelAnzahl: buch.spine.length, lesezeichen: [], zuletzt: Date.now(), isbn: isbn || undefined });
  if (isbn && typeof coverVonIsbn === 'function' && !bild) (async () => { try { const c = await coverVonIsbn(isbn); if (c) { await buchCoverSetzen(doc, c, true); zeichne(); } } catch (e) {} })();
  return doc;
}

/* ----- Der Leser ----- */
let _epub = null;
const EPUB_SCHRIFTEN = [['serif', 'Serif (New York)', 'ui-serif, "New York", Georgia, "Times New Roman", serif'], ['sans', 'Sans (System)', '-apple-system, system-ui, "Helvetica Neue", sans-serif'], ['rund', 'Rund', 'ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif'], ['schreib', 'Schreibmaschine', 'ui-monospace, "SF Mono", Menlo, monospace']];

async function epubOeffnen(b) {
  if (_epub) epubSchliessen();
  if (typeof buchSchliessen === 'function' && typeof _leser !== 'undefined' && _leser) buchSchliessen();
  const e = leseEinstellung();
  const raum = el('div', { class: 'lesemodus epub' + (e.nacht ? ' nacht' : '') });
  const buehne = el('div', { class: 'lese-buehne' });
  const inhalt = el('div', { class: 'epub-inhalt' });
  const titel = el('div', { class: 'lese-titel' }, b.titel || 'Buch');
  const stand = el('div', { class: 'lese-stand' });
  const balken = el('input', { type: 'range', min: '0', max: '1000', value: '0', class: 'lese-balken', 'aria-label': 'Stelle im Buch' });
  const kopf = el('div', { class: 'lese-kopf' },
    el('button', { class: 'knopf', onclick: () => epubSchliessen() }, el('span', { html: ik('zurueck'), style: 'display:flex' }), 'Zurück'),
    titel,
    el('button', { class: 'rundknopf zart', html: ik('gliederung'), title: 'Inhalt', onclick: () => epubInhalt() }),
    el('button', { class: 'rundknopf zart lese-zeichen', html: ik('lesezeichen'), title: 'Lesezeichen', onclick: () => epubLesezeichen() }),
    el('button', { class: 'rundknopf zart', html: ik('teilen'), title: 'Zitat: Markiertes oder diese Seite als Schnipsel', onclick: () => epubZitat() }),
    el('button', { class: 'rundknopf zart lese-notiz-knopf', html: ik('pin'), title: 'Randnotiz zu dieser Stelle', onclick: () => epubNotizen() }),
    el('button', { class: 'rundknopf zart', html: ik('vorlesen'), title: 'Diese Seite vorlesen', onclick: (ev) => epubVorlesen(ev.currentTarget) }),
    el('button', { class: 'rundknopf zart', html: ik('feinheiten'), title: 'Schrift und Lesen einstellen', onclick: () => epubEinstellungen() }));
  const kapitelName = el('span', { class: 'epub-kapitel' });
  const fuss = el('div', { class: 'lese-fuss' }, el('button', { class: 'rundknopf zart', html: ik('zurueck'), title: 'Zurück', onclick: () => blaettere(-1) }), balken, stand, el('button', { class: 'rundknopf zart', html: ik('rechts'), title: 'Weiter', onclick: () => blaettere(1) }));
  buehne.append(inhalt, kapitelName);
  raum.append(kopf, buehne, fuss);
  document.body.append(raum);
  const urls = new Map();
  _epub = { b, raum, buehne, inhalt, e, kapitel: Math.max(0, b.kapitel || 0), seite: 0, seiten: 1, buch: null, urls, kopf, fuss, versteckTimer: null, htmlCache: new Map(), busy: false, balken, stand, kapitelName };
  const L = _epub;
  const zeigeLeisten = () => { kopf.classList.remove('weg'); fuss.classList.remove('weg'); clearTimeout(L.versteckTimer); L.versteckTimer = setTimeout(() => { kopf.classList.add('weg'); fuss.classList.add('weg'); }, 2600); };
  zeigeLeisten();
  toast('Schlage auf …', 1600);
  try {
    const blob = await dbGet('media', b.datei);
    if (!blob) throw new Error('Datei fehlt');
    L.buch = await epubLaden(await blob.arrayBuffer());
    if (L.buch.spine.length !== b.kapitelAnzahl) { b.kapitelAnzahl = L.buch.spine.length; speichereStill(b); }
  } catch (x) { toast('Das Buch ließ sich nicht aufschlagen.' + (x && x.message ? ' (' + x.message + ')' : ''), 4200); epubSchliessen(); return; }
  epubStil();

  const spaltenBreite = () => Math.max(200, inhalt.clientWidth);
  const schritt = () => spaltenBreite() + 48;
  /* Auf das nächste Bild warten — aber nie ewig.
   requestAnimationFrame steht still, sobald das Fenster verdeckt ist. Wer
   beim Kapitelwechsel die App wechselt, sass sonst in einem Kapitel fest,
   das nie fertig lud: L.busy blieb stehen und Blättern war tot. Der Wecker
   daneben löst das Warten spätestens nach 120 ms auf. */
function naechstesBild() {
  return new Promise((fertig) => {
    let getan = false;
    const einmal = () => { if (!getan) { getan = true; fertig(); } };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(einmal);
    setTimeout(einmal, 120);
  });
}

async function ladeKapitel(i, anteil = 0, richtung = 0) {
    if (!L.buch) return;
    if (L.busy) { L.ladeAusstehend = [i, anteil, richtung]; return; }
    L.busy = true;
    try {
    const k = Math.max(0, Math.min(L.buch.spine.length - 1, i));
    let html = L.htmlCache.get(k);
    if (html == null) { try { html = await epubKapitelHTML(L.buch, L.buch.spine[k].pfad, urls); } catch (x) { html = '<p><i>Dieses Kapitel ließ sich nicht lesen.</i></p>'; } L.htmlCache.set(k, html); }
    L.kapitel = k;
    inhalt.style.transition = 'none';
    inhalt.innerHTML = html;
    /* Breite Bühne: zwei Spalten je Seite; schmale: eine, nie breiter als eine gute Zeile */
    const breit = buehne.clientWidth, zwei = breit > 900;
    const rand = zwei ? L.e.epubRand : Math.max(L.e.epubRand, Math.round((breit - 720) / 2));
    inhalt.style.left = rand + 'px'; inhalt.style.right = rand + 'px';
    await naechstesBild();
    inhalt.style.columnWidth = (zwei ? (spaltenBreite() - 48) / 2 : spaltenBreite()) + 'px'; inhalt.style.columnGap = '48px';
    await naechstesBild();
    L.seiten = Math.max(1, Math.round((inhalt.scrollWidth + 48) / schritt()));
    L.seite = anteil >= 1 ? L.seiten - 1 : Math.min(L.seiten - 1, Math.round(anteil * L.seiten));
    stelleSeite(richtung, true);
    /* Interne Sprünge: Links auf andere Kapitel */
    inhalt.querySelectorAll('a[data-intern]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); const ziel = L.buch.spine.findIndex((s) => s.pfad === a.dataset.intern); if (ziel >= 0) ladeKapitel(ziel, 0, 1); }));
    } catch (e) {
      toast('Dieses Kapitel ließ sich gerade nicht setzen. Du kannst weiterblättern.', 3600);
    } finally {
      L.busy = false;
      const naechste = L.ladeAusstehend; L.ladeAusstehend = null;
      if (naechste && _epub === L) queueMicrotask(() => ladeKapitel(...naechste));
    }
  }
  function stelleSeite(richtung, frisch) {
    inhalt.style.transition = frisch || !L.e.blaettern ? 'none' : 'transform .34s cubic-bezier(.2,.8,.2,1)';
    inhalt.style.transform = 'translateX(' + (-L.seite * schritt()) + 'px)';
    const ges = L.buch.spine.length;
    const fortschritt = (L.kapitel + (L.seiten > 1 ? L.seite / (L.seiten - 1) : 1) * .999) / ges;
    b.kapitel = L.kapitel; b.anteil = L.seiten > 1 ? L.seite / (L.seiten - 1) : 0; b.seiten = 100; b.seite = Math.max(1, Math.round(fortschritt * 100)); b.zuletzt = Date.now();
    if (richtung && typeof buchSeiteGelesen === 'function') buchSeiteGelesen(b); else speichereStill(b);
    stand.textContent = 'Kapitel ' + (L.kapitel + 1) + ' / ' + ges + ' · ' + Math.round(fortschritt * 100) + ' %';
    balken.value = String(Math.round(fortschritt * 1000));
    const t = epubKapitelTitel(L.kapitel); kapitelName.textContent = t || '';
    const marke = L.kapitel + ':' + L.seite;
    kopf.querySelector('.lese-zeichen').classList.toggle('an', (b.lesezeichen || []).map(String).includes(marke));
    kopf.querySelector('.lese-notiz-knopf').classList.toggle('hat-notiz', buchNotizen(b, L.kapitel).length > 0);
  }
  async function blaettere(r) {
    if (!L.buch || L.busy) return;
    if (r > 0 && L.seite < L.seiten - 1) { L.seite++; stelleSeite(1); }
    else if (r < 0 && L.seite > 0) { L.seite--; stelleSeite(-1); }
    else if (r > 0 && L.kapitel < L.buch.spine.length - 1) await ladeKapitel(L.kapitel + 1, 0, 1);
    else if (r < 0 && L.kapitel > 0) await ladeKapitel(L.kapitel - 1, 1, -1);
    else toast(r > 0 ? 'Das war die letzte Seite.' : 'Das ist der Anfang.');
    zeigeLeisten();
  }
  L.ladeKapitel = ladeKapitel; L.blaettere = blaettere; L.stelleSeite = stelleSeite; L.zeigeLeisten = zeigeLeisten;
  L.neuSetzen = () => { const a = L.seiten > 1 ? L.seite / (L.seiten - 1) : 0; ladeKapitel(L.kapitel, a, 0); };
  balken.addEventListener('change', () => { const v = Number(balken.value) / 1000; const ges = L.buch.spine.length; const k = Math.min(ges - 1, Math.floor(v * ges)); ladeKapitel(k, (v * ges) - k, 0); });
  buehne.addEventListener('click', (ev) => {
    if (wischte) { wischte = false; return; }
    if (ev.target.closest('a')) return;
    const sel = window.getSelection && window.getSelection(); if (sel && String(sel).trim()) return;
    const r = buehne.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width;
    if (x > .66) blaettere(1); else if (x < .34) blaettere(-1); else zeigeLeisten();
  });
  let wisch = null, wischte = false;
  buehne.addEventListener('pointerdown', (ev) => { wisch = { x: ev.clientX, y: ev.clientY }; });
  buehne.addEventListener('pointerup', (ev) => { if (!wisch) return; const dx = ev.clientX - wisch.x, dy = ev.clientY - wisch.y; wisch = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { wischte = true; ev.preventDefault(); blaettere(dx < 0 ? 1 : -1); } });
  buehne.addEventListener('pointercancel', () => { wisch = null; });
  L.tasten = (ev) => {
    if (!_epub) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown' || ev.key === ' ') { ev.preventDefault(); blaettere(1); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); blaettere(-1); }
    else if (ev.key === 'Escape') { ev.preventDefault(); epubSchliessen(); }
  };
  document.addEventListener('keydown', L.tasten, true);
  L.beiGroesse = entprellt(() => { if (_epub === L) L.neuSetzen(); }, 200);
  window.addEventListener('resize', L.beiGroesse);
  await ladeKapitel(L.kapitel, begrenze(b.anteil, 0, 1, 0), 0);
}
function epubKapitelTitel(k) {
  if (!_epub || !_epub.buch) return '';
  const pfad = _epub.buch.spine[k] && _epub.buch.spine[k].pfad;
  const t = _epub.buch.toc.find((x) => x.pfad === pfad);
  return t ? t.titel : '';
}
function epubStil() {
  if (!_epub) return;
  const { raum, e } = _epub;
  raum.classList.toggle('nacht', e.nacht);
  raum.style.setProperty('--lese-hell', e.helligkeit);
  raum.style.setProperty('--lese-waerme', e.waerme);
  const schrift = EPUB_SCHRIFTEN.find((s) => s[0] === e.epubSchrift) || EPUB_SCHRIFTEN[0];
  raum.style.setProperty('--epub-schrift', schrift[2]);
  raum.style.setProperty('--epub-groesse', e.epubGroesse + 'px');
  raum.style.setProperty('--epub-zeile', String(e.epubZeile));
  raum.style.setProperty('--epub-rand', e.epubRand + 'px');
}
function epubSchliessen() {
  if (!_epub) return;
  const L = _epub; _epub = null;
  document.removeEventListener('keydown', L.tasten, true);
  window.removeEventListener('resize', L.beiGroesse);
  clearTimeout(L.versteckTimer);
  for (const u of L.urls.values()) { try { URL.revokeObjectURL(u); } catch (e) {} }
  if (typeof vorlesenStopp === 'function') vorlesenStopp();
  L.raum.remove();
}
function epubCacheFreigeben() {
  if (!_epub || !_epub.htmlCache) return 0;
  const n = _epub.htmlCache.size; _epub.htmlCache.clear(); return n;
}
function epubInhalt() {
  if (!_epub || !_epub.buch) return;
  const L = _epub;
  const punkte = L.buch.toc.length ? L.buch.toc : L.buch.spine.map((s, i) => ({ titel: 'Kapitel ' + (i + 1), pfad: s.pfad, tiefe: 0 }));
  const kasten = el('div', { class: 'menue lese-gliederung' }, el('div', { class: 'mtitel' }, 'INHALT'),
    punkte.slice(0, 400).map((t) => { const i = L.buch.spine.findIndex((s) => s.pfad === t.pfad); return el('button', { class: i === L.kapitel ? 'an' : '', style: 'padding-left:' + (14 + (t.tiefe || 0) * 14) + 'px', onclick: () => { zu(); if (i >= 0) L.ladeKapitel(i, 0, 1); } }, t.titel); }));
  const zu = zeigeDeck(kasten);
}
function epubLesezeichen() {
  if (!_epub) return;
  const L = _epub, b = L.b, marke = L.kapitel + ':' + L.seite;
  b.lesezeichen = (b.lesezeichen || []).map(String);
  const da = b.lesezeichen.includes(marke);
  const punkte = [{ text: da ? 'Lesezeichen hier entfernen' : 'Lesezeichen hier hinein', icon: 'lesezeichen', wert: 'toggle' }, ...b.lesezeichen.map((m) => { const [k, s] = m.split(':').map(Number); return { text: (epubKapitelTitel(k) || 'Kapitel ' + (k + 1)) + ' · Seite ' + (s + 1), icon: 'lesezeichen', wert: 'geh:' + m }; })];
  menue(punkte, 'Lesezeichen').then((w) => {
    if (!w) return;
    if (w === 'toggle') { b.lesezeichen = da ? b.lesezeichen.filter((m) => m !== marke) : [...b.lesezeichen, marke]; speichereStill(b); L.stelleSeite(0); toast(da ? 'Lesezeichen entfernt.' : 'Lesezeichen liegt drin.'); }
    else if (w.startsWith('geh:')) { const [k, s] = w.slice(4).split(':').map(Number); L.ladeKapitel(k, 0, 0).then(() => { L.seite = Math.min(L.seiten - 1, s); L.stelleSeite(0); }); }
  });
}
function epubSeitenText() {
  if (!_epub) return '';
  const sel = window.getSelection && window.getSelection();
  if (sel && String(sel).trim()) return String(sel).trim();
  /* Text der sichtbaren Spalte: alles, dessen Box in der Bühne liegt */
  const L = _epub, r = L.buehne.getBoundingClientRect(); const teile = [];
  for (const p of L.inhalt.querySelectorAll('p, h1, h2, h3, h4, li, blockquote, div')) { if (p.children.length && !p.textContent.trim()) continue; const q = p.getBoundingClientRect(); if (q.width && q.left >= r.left - 4 && q.right <= r.right + 4 && !(p.closest('p, li, blockquote') && p.tagName === 'DIV')) teile.push(p.textContent.replace(/\s+/g, ' ').trim()); }
  return teile.filter(Boolean).join('\n');
}
function epubZitat() {
  if (!_epub) return;
  const L = _epub, text = epubSeitenText();
  if (!text) { toast('Hier steht nichts, was man herausnehmen könnte.'); return; }
  const feld = el('textarea', { rows: 10 }); feld.value = text;
  const quelle = '— ' + (L.b.titel || 'Buch') + (L.b.autor ? ', ' + L.b.autor : '') + (epubKapitelTitel(L.kapitel) ? ', ' + epubKapitelTitel(L.kapitel) : ', Kapitel ' + (L.kapitel + 1));
  const kasten = el('div', { class: 'modal zitat-kasten' }, el('h2', {}, 'Als Text'),
    el('div', { class: 'stickerblock-hinweis' }, 'Markiere, was du brauchst — die Quelle kommt dazu.'), feld,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Schließen'),
      el('button', { class: 'knopf', onclick: async () => { const t = (feld.selectionStart !== feld.selectionEnd ? feld.value.slice(feld.selectionStart, feld.selectionEnd) : feld.value).trim(); try { await navigator.clipboard.writeText(t + '\n' + quelle); toast('Kopiert, mit Quelle.'); } catch (x) { toast('Kopieren ging hier nicht.'); } } }, 'Kopieren'),
      el('button', { class: 'knopf voll', onclick: () => { const t = (feld.selectionStart !== feld.selectionEnd ? feld.value.slice(feld.selectionStart, feld.selectionEnd) : feld.value).trim(); neuDoc('schnipsel', { text: t + '\n' + quelle }); zu(); toast('Liegt als Zitat in den Schnipseln.'); } }, 'Als Schnipsel')));
  const zu = zeigeDeck(kasten);
}
function epubNotizen() {
  if (!_epub) return;
  const L = _epub, b = L.b;
  const feld = el('textarea', { rows: 3, placeholder: 'Ein Gedanke zu dieser Stelle …' });
  const liste = el('div', { class: 'lese-notizen' });
  const bauen = () => { liste.innerHTML = ''; for (const n of buchNotizen(b, L.kapitel)) liste.append(el('div', { class: 'lese-notiz' }, el('span', {}, n.text), el('button', { class: 'rundknopf zart', html: ik('muell'), title: 'Notiz löschen', onclick: () => { loescheDoc(n.id); bauen(); L.stelleSeite(0); } }))); };
  bauen();
  const kasten = el('div', { class: 'modal' }, el('h2', {}, 'Randnotizen · ' + (epubKapitelTitel(L.kapitel) || 'Kapitel ' + (L.kapitel + 1))), liste, feld,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Schließen'),
      el('button', { class: 'knopf voll', onclick: () => { const t = feld.value.trim(); if (!t) return; neuDoc('buchnotiz', { parent: b.id, seite: L.kapitel, text: t }); feld.value = ''; bauen(); L.stelleSeite(0); } }, 'Notiz dazu')));
  const zu = zeigeDeck(kasten);
}
function epubVorlesen(knopf) {
  if (!_epub) return;
  const text = epubSeitenText();
  if (!text) { toast('Hier steht nichts zum Vorlesen.'); return; }
  if (typeof vorlesen === 'function') vorlesen(text, knopf);
}
function epubEinstellungen() {
  if (!_epub) return;
  const L = _epub, e = L.e;
  const regler = (name, schluessel, min, max, schritt, danach) => { const r = el('input', { type: 'range', min: String(min), max: String(max), step: String(schritt), value: String(e[schluessel]) }); r.addEventListener('input', () => { e[schluessel] = Number(r.value); leseEinstellungSpeichern(e); epubStil(); }); r.addEventListener('change', () => { if (danach) danach(); }); return el('div', { class: 'einstellgruppe einstellzeile' }, el('span', { class: 'ename' }, name), r); };
  const wahl = (name, schluessel, liste, danach) => { const g = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' }); for (const [id, n] of liste) g.append(el('button', { class: e[schluessel] === id ? 'an' : '', onclick: (ev) => { e[schluessel] = id; leseEinstellungSpeichern(e); epubStil(); $$('button', g).forEach((x) => x.classList.toggle('an', x === ev.currentTarget)); if (danach) danach(); } }, n)); return el('div', { class: 'einstellgruppe' }, el('b', {}, name), g); };
  const kasten = el('div', { class: 'modal tisch-einrichten' }, el('h2', {}, 'Schrift und Lesen'),
    wahl('Schrift', 'epubSchrift', EPUB_SCHRIFTEN.map((s) => [s[0], s[1]]), () => L.neuSetzen()),
    regler('Größe', 'epubGroesse', 14, 28, 1, () => L.neuSetzen()),
    regler('Zeilenabstand', 'epubZeile', 1.3, 2, .05, () => L.neuSetzen()),
    regler('Rand', 'epubRand', 12, 80, 2, () => L.neuSetzen()),
    regler('Helligkeit', 'helligkeit', .4, 1, .05),
    regler('Wärme', 'waerme', 0, 1, .05),
    wahl('Nacht', 'nacht', [[false, 'Hell'], [true, 'Dunkel']]),
    wahl('Blättern', 'blaettern', [[true, 'Mit Bewegung'], [false, 'Ohne']]),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}
