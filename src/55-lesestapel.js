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

/* ----- Cover aus dem Netz: über die ISBN ----- */
/* ISBN-13 → ISBN-10 (nur 978er); eine 10er bleibt. Pur. */
function isbnZu10(roh) {
  const k = String(roh || '').replace(/[^0-9Xx]/g, '').toUpperCase();
  if (k.length === 10) return k;
  if (k.length !== 13 || !k.startsWith('978')) return null;
  const kern = k.slice(3, 12);
  let s = 0; for (let i = 0; i < 9; i++) s += (10 - i) * Number(kern[i]);
  const r = (11 - s % 11) % 11;
  return kern + (r === 10 ? 'X' : String(r));
}
/* ISBNs aus einem Text (Impressum). Pur. */
function isbnAusText(text) {
  const aus = [];
  for (const m of String(text || '').matchAll(/ISBN[\s:–-]*((?:97[89][\s-]?)?\d[\d\s-]{8,16}[\dXx])/gi)) {
    let k = m[1].replace(/[\s-]/g, '').toUpperCase();
    if (k.length > 13 && /^97[89]/.test(k)) k = k.slice(0, 13);
    if ((k.length === 13 || k.length === 10) && !aus.includes(k)) aus.push(k);
  }
  return aus;
}
/* ISBNs aus den ersten Seiten eines aufgeschlagenen PDFs. */
async function isbnAusPdf(dok, maxSeiten = 12) {
  const aus = [];
  for (let n = 1; n <= Math.min(maxSeiten, dok.numPages); n++) {
    try { const tc = await (await dok.getPage(n)).getTextContent(); for (const i of isbnAusText(tc.items.map((x) => x.str).join(' '))) if (!aus.includes(i)) aus.push(i); } catch (e) {}
    if (aus.length >= 3) break;
  }
  return aus;
}
/* Ein Cover zur ISBN: zuerst der große Bildhost (erlaubt fremde Abrufe), dann Open Library.
   Ein Platzhalter-Bildchen (wenige Bytes) zählt nicht. */
async function coverVonIsbn(isbn) {
  const i10 = isbnZu10(isbn);
  const i13 = String(isbn || '').replace(/[^0-9Xx]/g, '');
  const quellen = [];
  if (i10) quellen.push('https://images-na.ssl-images-amazon.com/images/P/' + i10 + '.01.LZZZZZZZ.jpg');
  if (i13.length === 13) quellen.push('https://covers.openlibrary.org/b/isbn/' + i13 + '-L.jpg?default=false');
  for (const url of quellen) {
    try {
      const ab = new AbortController(); const t = setTimeout(() => ab.abort(), 9000);
      const r = await fetch(url, { signal: ab.signal, mode: 'cors' }); clearTimeout(t);
      if (!r.ok) continue;
      const blob = await r.blob();
      if (blob.size > 5000 && /^image\//.test(blob.type || 'image/jpeg')) return blob;
    } catch (e) {}
  }
  return null;
}
async function buchCoverSetzen(b, blob, ausDemNetz) {
  const id = await speichereDateiBlob(new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' }));
  if (!id) return false;
  b.bild = id; if (ausDemNetz) b.coverNetz = true;
  speichere(b); return true;
}
/* Koffer-Manifest: ISBN zu einem Buch über den Namen finden. */
async function kofferIsbnFuer(b) {
  const k = await buecherkofferListe().catch(() => null);
  if (!k) return null;
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-zäöüß0-9]+/g, ' ').trim();
  const t = norm(b.titel);
  const e = k.buecher.find((x) => x.isbn && (norm(x.name) === t || (t.length > 4 && (norm(x.name).includes(t) || t.includes(norm(x.name))))));
  return e ? e.isbn : null;
}
/* Versucht, für ein Buch das offizielle Cover zu holen: eigene ISBN, Koffer,
   dann die ersten Seiten der PDF. Still = ohne Nachfragen und Hinweise. */
async function buchCoverAusDemNetz(b, { still = false } = {}) {
  const versucht = new Set();
  const probiere = async (isbn) => {
    if (!isbn || versucht.has(isbn)) return false; versucht.add(isbn);
    const blob = await coverVonIsbn(isbn);
    if (!blob) return false;
    b.isbn = isbn;
    return buchCoverSetzen(b, blob, true);
  };
  if (b.isbn && await probiere(b.isbn)) return true;
  const aus = await kofferIsbnFuer(b);
  if (aus && await probiere(aus)) return true;
  try {
    const pdfjs = await pdfjsLaden();
    const blob = await dbGet('media', b.datei);
    if (blob) {
      const dok = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
      const isbns = await isbnAusPdf(dok);
      try { dok.destroy(); } catch (e) {}
      for (const i of isbns) if (await probiere(i)) return true;
    }
  } catch (e) {}
  if (still) return false;
  const eingabeIsbn = await eingabe({ titel: 'Kein Cover gefunden — ISBN des Buchs?', platzhalter: '978… (steht im Impressum oder hinten auf dem Buch)', ok: 'Cover holen' });
  if (!eingabeIsbn) return false;
  if (await probiere(eingabeIsbn)) return true;
  toast('Zu dieser ISBN gibt es kein Cover im Netz.', 3600);
  return false;
}
/* Für alle Bücher auf dem Tisch, die noch kein Netz-Cover haben. */
async function schoeneCoverHolen() {
  const offen = lesestapelBuecher().filter((b) => !b.coverNetz);
  if (!offen.length) { toast('Alle Bücher haben schon ihr Cover.'); return; }
  toast('Suche Cover für ' + offen.length + (offen.length === 1 ? ' Buch …' : ' Bücher …'), 3000);
  let n = 0;
  for (const b of offen) { try { if (await buchCoverAusDemNetz(b, { still: true })) n++; } catch (e) {} }
  toast(n ? n + (n === 1 ? ' Cover gefunden.' : ' Cover gefunden.') : 'Im Netz war kein passendes Cover — über „Cover" am Buch geht es mit ISBN.', 4200);
  zeichne();
}

/* Ein PDF (Datei/Blob) als Buch auflegen: Datei ablegen, zählen, Cover malen. */
/* Autorenangaben aus PDF-Metadaten sind oft Katalogzeilen: „Nachname, Vorname Verfasser", eckige
   Klammern, doppelte Namen. Hier wird daraus ein Name. Pur. */
function saubererAutor(roh) {
  let a = String(roh || '').replace(/\[[^\]]*\]/g, ' ').replace(/\b(Verfasser(?:in)?|Autor(?:in)?|author|Hrsg\.?|Übersetzer(?:in)?)\b\.?/gi, ' ').replace(/[;|/]+/g, ',').replace(/\s+/g, ' ').trim().replace(/^[,\s]+|[,\s]+$/g, '');
  const m = a.match(/^([^,]+),\s*([^,]+)$/);
  if (m && !/\s(?:und|and|&)\s/i.test(a)) a = (m[2] + ' ' + m[1]).replace(/\s+/g, ' ').trim();
  /* „Silvana de Mari Silvana de Mari" -> einmal reicht */
  const h = a.length >> 1;
  if (a.length > 8 && a.slice(0, h).trim().toLowerCase() === a.slice(h).trim().toLowerCase()) a = a.slice(0, h).trim();
  return a.slice(0, 120);
}

async function buchAuflegenAusBlob(blob, name, { datei = null, isbn = null, autorVorgabe = '', titelFest = false } = {}) {
  const pdfjs = await pdfjsLaden();
  const daten = await blob.arrayBuffer();
  const dok = await pdfjs.getDocument({ data: daten.slice(0) }).promise;
  const seiten = dok.numPages;
  let titel = String(name || 'Buch').replace(/\.pdf$/i, '');
  /* Dateinamen von Tauschbörsen tragen Klammerzusätze — die braucht kein Titel. */
  titel = titel.replace(/\s*\((?:[^()]*(?:z-lib|1lib|library|epdf)[^()]*)\)\s*/gi, ' ').replace(/\s*\[[^\]]*\]\s*•?\s*/g, ' ').replace(/\s+/g, ' ').trim();
  let autor = '';
  try {
    const meta = await dok.getMetadata();
    if (meta && meta.info) {
      if (!titelFest && meta.info.Title && String(meta.info.Title).trim().length > 2 && !/untitled|microsoft|word/i.test(meta.info.Title)) titel = String(meta.info.Title).trim().slice(0, 160);
      if (meta.info.Author && String(meta.info.Author).trim()) autor = saubererAutor(meta.info.Author);
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
  /* ISBN aus dem Impressum — damit später das echte Cover kommt */
  let isbns = [];
  try { isbns = await isbnAusPdf(dok); } catch (e) {}
  try { dok.destroy(); } catch (e) {}
  if (autorVorgabe) autor = autorVorgabe;   /* eine kuratierte Angabe schlägt Metadaten */
  const buch = neuDoc('buch', { titel, autor, datei: dateiId, bild, seiten, seite: 1, lesezeichen: [], zuletzt: Date.now(), isbn: isbn || isbns[0] || undefined });
  /* Das offizielle Cover aus dem Netz, wenn eines zu finden ist — still, im Hintergrund. */
  (async () => {
    for (const i of [isbn, ...isbns].filter(Boolean)) {
      try { const c = await coverVonIsbn(i); if (c) { buch.isbn = i; await buchCoverSetzen(buch, c, true); zeichne(); return; } } catch (e) {}
    }
  })();
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

/* ----- Der Bücherkoffer: verschlüsselte PDFs neben der App, mit Passwort ----- */
async function buecherkofferListe() {
  try { const a = await fetch('buecher/koffer.json', { cache: 'no-store' }); if (!a.ok) return null; const k = await a.json(); return Array.isArray(k.buecher) ? k : null; } catch (e) { return null; }
}
async function kofferEntschluesseln(bytes, passwort, runden = 200000) {
  const u = new Uint8Array(bytes);
  const magie = new TextDecoder().decode(u.slice(0, 9));
  if (magie !== 'VANIBUCH1') throw new Error('Das ist keine Kofferdatei.');
  const salz = u.slice(9, 25), iv = u.slice(25, 37), chiffrat = u.slice(37);
  const grund = await crypto.subtle.importKey('raw', new TextEncoder().encode(passwort), 'PBKDF2', false, ['deriveKey']);
  const schluessel = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salz, iterations: runden, hash: 'SHA-256' }, grund, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  return new Blob([await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, schluessel, chiffrat)], { type: 'application/pdf' });
}
function passwortFragen(titel, hinweis) {
  return new Promise((res) => {
    let fertig = false;
    const feld = el('input', { type: 'password', class: 'koffer-passwort', placeholder: 'Passwort', autocomplete: 'off' });
    const kasten = el('div', { class: 'modal' }, el('h2', {}, titel), hinweis ? el('div', { class: 'stickerblock-hinweis' }, hinweis) : null, feld,
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'), el('button', { class: 'knopf voll', onclick: () => { fertig = true; const v = feld.value; zu(); res(v || null); } }, 'Öffnen')));
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { fertig = true; const v = feld.value; zu(); res(v || null); } });
    const zu = zeigeDeck(kasten, () => { if (!fertig) res(null); });
    setTimeout(() => feld.focus(), 60);
  });
}
async function buecherkofferHolen() {
  const koffer = await buecherkofferListe();
  if (!koffer || !koffer.buecher.length) { toast('Gerade liegt kein Bücherkoffer neben der App.', 3600); return; }
  /* Schon da? Nach ISBN oder Titel — und wer schon da ist, bekommt Namen und Autor aus dem Koffer,
     falls beim ersten Holen die PDF-Metadaten gewonnen hatten. */
  const vorhanden = lesestapelBuecher();
  const da = new Set(vorhanden.flatMap((b) => [(b.titel || '').toLowerCase(), b.isbn || '']).filter(Boolean));
  for (const b of koffer.buecher) {
    const alt = b.isbn && vorhanden.find((x) => x.isbn === b.isbn);
    if (alt && b.name && (alt.titel !== b.name || (b.autor && alt.autor !== b.autor))) { alt.titel = b.name; if (b.autor) alt.autor = b.autor; speichere(alt); }
  }
  const passwort = await passwortFragen('Der Bücherkoffer', koffer.buecher.length + ' Bücher, verschlüsselt. Das Passwort bleibt hier auf dem Gerät; die Bücher landen in deinem eigenen Vorrat.');
  if (!passwort) return;
  let n = 0, fehl = 0;
  for (const b of koffer.buecher) {
    if (da.has(String(b.name || '').toLowerCase()) || (b.isbn && da.has(b.isbn))) continue;
    toast('Hole „' + (b.name || b.datei) + '" …', 2400);
    try {
      const a = await fetch('buecher/' + b.datei, { cache: 'no-store' });
      if (!a.ok) throw new Error('HTTP ' + a.status);
      const blob = await kofferEntschluesseln(await a.arrayBuffer(), passwort, koffer.runden || 200000);
      await buchAuflegenAusBlob(blob, (b.name || 'Buch') + '.pdf', { isbn: b.isbn || null, autorVorgabe: b.autor || '', titelFest: !!b.name }); n++;
    } catch (e) {
      fehl++;
      if (/OperationError|decrypt/i.test(String(e && (e.name + ' ' + e.message)))) { toast('Das Passwort passt nicht.', 4200); return; }
      toast((b.name || b.datei) + ': ' + (e && e.message ? e.message : 'ging nicht'), 3600);
    }
  }
  if (n) { toast(n === 1 ? 'Ein Buch liegt auf dem Tisch.' : n + ' Bücher liegen auf dem Tisch.', 4200); zeichne(); }
  else if (!fehl) toast('Alles aus dem Koffer liegt schon auf dem Tisch.');
}

/* Randnotizen je Seite: kleine Dokumente am Buch. */
function buchNotizen(b, seite) {
  return vomTyp('buchnotiz').filter((n) => n.parent === b.id && (seite == null || n.seite === seite)).sort((x, y) => (x.seite || 0) - (y.seite || 0) || (x.angelegt || 0) - (y.angelegt || 0));
}
/* Lesestatistik: Seiten je Tag. */
function buchSeiteGelesen(b) {
  const k = tagKey();
  const st = b.statistik && typeof b.statistik === 'object' ? b.statistik : {};
  st[k] = (Number(st[k]) || 0) + 1;
  /* nur die letzten 60 Tage behalten */
  const keys = Object.keys(st).sort();
  while (keys.length > 60) delete st[keys.shift()];
  b.statistik = st;
}
function buchStatistikWorte(b) {
  const st = b.statistik || {};
  const heute = Number(st[tagKey()]) || 0, gestern = Number(st[tagKey(Date.now() - 86400000)]) || 0;
  const woche = Object.entries(st).filter(([k]) => Date.now() - new Date(k).getTime() < 7 * 86400000).reduce((n, [, v]) => n + (Number(v) || 0), 0);
  if (!heute && !gestern && !woche) return '';
  return (heute ? heute + ' Seiten heute' : gestern ? gestern + ' Seiten gestern' : '') + (woche ? (heute || gestern ? ' · ' : '') + woche + ' diese Woche' : '');
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
      el('div', { class: 'lesestapel-stand' }, (b.seiten ? 'Seite ' + (b.seite || 1) + ' von ' + b.seiten : '') + (buchStatistikWorte(b) ? ' · ' + buchStatistikWorte(b) : '')));
    langdruck(k, async () => {
      const wahl = await menue([
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Cover aus dem Netz (ISBN)', icon: 'suche', wert: 'netz' },
        { text: 'Cover aus einer anderen Seite', icon: 'kamera', wert: 'cover' },
        { text: 'Von vorn beginnen', icon: 'wieder', wert: 'anfang' },
        { text: 'Vom Tisch nehmen', icon: 'muell', wert: 'weg', rot: true }
      ], b.titel || 'Buch');
      if (wahl === 'name') { const n = await eingabe({ titel: 'Das Buch heißt …', wert: b.titel || '' }); if (n) { b.titel = n; speichere(b); zu(); lesestapelZeigen(); } }
      else if (wahl === 'netz') { zu(); toast('Suche das Cover …', 2500); const ok = await buchCoverAusDemNetz(b); if (ok) toast('Das Cover ist da.'); zeichne(); }
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
      el('button', { class: 'knopf', title: 'Verschlüsselte Bücher neben der App, mit Passwort', onclick: () => { zu(); buecherkofferHolen(); } }, 'Aus dem Bücherkoffer (Passwort)'),
      buecher.some((b) => !b.coverNetz) ? el('button', { class: 'knopf', title: 'Offizielle Cover über die ISBN holen', onclick: () => { zu(); schoeneCoverHolen(); } }, el('span', { html: ik('kamera'), style: 'display:flex' }), 'Schöne Cover holen') : null,
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
    el('button', { class: 'rundknopf zart lese-notiz-knopf', html: ik('pin'), title: 'Randnotiz zu dieser Seite', onclick: () => leserNotizen() }),
    el('button', { class: 'rundknopf zart', html: ik('suche'), title: 'Im Buch suchen', onclick: () => leserSuche() }),
    el('button', { class: 'rundknopf zart', html: ik('vorlesen'), title: 'Diese Seite vorlesen lassen', onclick: (ev) => leserVorlesen(ev.currentTarget) }),
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
    const lzf = (b.lesezeichenFarben || {})[leser.seite];
    kopf.querySelector('.lese-zeichen').style.background = (b.lesezeichen || []).includes(leser.seite) && lzf ? lzf : '';
    kopf.querySelector('.lese-notiz-knopf').classList.toggle('hat-notiz', buchNotizen(b, leser.seite).length > 0);
    if (richtung && leser.seite !== leser.letzteGezaehlt) { leser.letzteGezaehlt = leser.seite; buchSeiteGelesen(b); }
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
    ...lz.filter((n) => n !== l.seite).sort((a, c) => a - c).map((n) => ({ text: 'Zu Seite ' + n + ((b.lesezeichenFarben || {})[n] ? ' ●' : ''), icon: 'rechts', wert: 'zu:' + n }))
  ], 'Lesezeichen');
  if (!wahl) return;
  if (wahl === 'hier') {
    if (hier) { b.lesezeichen = lz.filter((n) => n !== l.seite); if (b.lesezeichenFarben) delete b.lesezeichenFarben[l.seite]; }
    else {
      const farbe = await menue([['#c0533f', 'Rot'], ['#d9a441', 'Gelb'], ['#5f7752', 'Grün'], ['#41597a', 'Blau'], ['#765187', 'Lila']].map(([f, n]) => ({ text: n, icon: 'lesezeichen', wert: f })), 'Welche Farbe?');
      if (!farbe) return;
      b.lesezeichen = [...lz, l.seite].slice(-200);
      b.lesezeichenFarben = Object.assign({}, b.lesezeichenFarben || {}, { [l.seite]: farbe });
    }
    speichere(b); l.zeige(0);
  }
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

/* Randnotizen: zu jeder Seite beliebig viele kleine Zettel. */
async function leserNotizen() {
  if (!_leser) return;
  const l = _leser, b = l.b;
  const liste = el('div', { class: 'lese-notizen' });
  const bauen = () => {
    liste.innerHTML = '';
    const hier = buchNotizen(b, l.seite);
    for (const n of hier) {
      const k = el('div', { class: 'lese-notiz' }, n.text, el('small', {}, ' · ' + fmtDatum(n.angelegt)));
      langdruck(k, async () => { if (await frage('Diese Randnotiz wegnehmen?', { ja: 'Wegnehmen', gefahr: true })) { await loesche(n.id, true); bauen(); l.zeige(0); } });
      liste.append(k);
    }
    if (!hier.length) liste.append(el('div', { class: 'leer klein' }, 'Noch keine Notiz zu Seite ' + l.seite + '.'));
  };
  bauen();
  const alle = buchNotizen(b);
  const feld = el('textarea', { rows: 3, placeholder: 'Was mir zu dieser Seite einfällt …' });
  const kasten = el('div', { class: 'modal' },
    el('h2', {}, 'Randnotizen · Seite ' + l.seite),
    liste, feld,
    el('div', { class: 'reihe', style: 'justify-content:space-between;flex-wrap:wrap;gap:8px' },
      alle.length > 1 ? el('button', { class: 'knopf zart klein', onclick: async () => {
        const w = await menue(alle.map((n) => ({ text: 'S. ' + n.seite + ': ' + (n.text || '').slice(0, 60), icon: 'pin', wert: String(n.seite) })), 'Alle Randnotizen in diesem Buch');
        if (w) { zu(); l.seite = Number(w); l.zeige(0); }
      } }, 'Alle ' + alle.length + ' Notizen') : el('span'),
      el('span', { style: 'display:flex;gap:8px' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Schließen'),
        el('button', { class: 'knopf voll', onclick: () => { const t = feld.value.trim(); if (!t) return; neuDoc('buchnotiz', { parent: b.id, seite: l.seite, text: t }); feld.value = ''; bauen(); l.zeige(0); } }, 'Notiz dazu'))));
  const zu = zeigeDeck(kasten);
  setTimeout(() => feld.focus(), 60);
}

/* Im Buch suchen: Textebene aller Seiten, einmal gelesen, dann im Gedächtnis. */
async function leserSuche() {
  if (!_leser || !_leser.dok) return;
  const l = _leser, b = l.b;
  const frage_ = await eingabe({ titel: 'Im Buch suchen', platzhalter: 'ein Wort, ein Name, eine Wendung', ok: 'Suchen' });
  if (!frage_) return;
  const q = frage_.trim().toLowerCase();
  if (!l.texte) l.texte = new Map();
  const treffer = [];
  toast('Lese das Buch durch …', 2500);
  for (let n = 1; n <= b.seiten && treffer.length < 200; n++) {
    let t = l.texte.get(n);
    if (t == null) {
      try { const tc = await (await l.dok.getPage(n)).getTextContent(); t = tc.items.map((i) => i.str).join(' ').replace(/\s+/g, ' '); } catch (e) { t = ''; }
      l.texte.set(n, t);
    }
    const i = t.toLowerCase().indexOf(q);
    if (i >= 0) treffer.push({ seite: n, vor: t.slice(Math.max(0, i - 60), i), mitte: t.slice(i, i + q.length), nach: t.slice(i + q.length, i + q.length + 70) });
  }
  if (!treffer.length) { toast('„' + frage_ + '" steht nicht in diesem Buch (oder es hat keine Textebene).', 4200); return; }
  const liste = el('div', { class: 'buchsuche-treffer' }, treffer.map((t) => el('button', { onclick: () => { zu(); l.seite = t.seite; l.zeige(0); } },
    el('small', {}, 'Seite ' + t.seite), '…' + t.vor, el('b', {}, t.mitte), t.nach + '…')));
  const kasten = el('div', { class: 'modal gliederung-kasten' }, el('h2', {}, treffer.length + (treffer.length === 1 ? ' Treffer' : ' Treffer') + ' für „' + frage_ + '"'), liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Schließen')));
  const zu = zeigeDeck(kasten);
}

/* Vorlesen: die Textebene der Seite mit der Stimme des Geräts. */
async function leserVorlesen(knopf) {
  if (!_leser || !_leser.dok) return;
  if (typeof vorlesen !== 'function') { toast('Vorlesen gibt es auf diesem Gerät nicht.'); return; }
  const l = _leser;
  let text = '';
  try { const tc = await (await l.dok.getPage(l.seite)).getTextContent(); text = tc.items.map((i) => i.str + (i.hasEOL ? ' ' : '')).join('').replace(/\s+/g, ' ').trim(); } catch (e) {}
  if (!text) { toast('Diese Seite trägt keinen Text, den man vorlesen könnte.'); return; }
  vorlesen(text, knopf);
}
