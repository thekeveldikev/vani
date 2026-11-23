/* ===================== 44c — Manuskript: DOCX, PDF (Normseiten), EPUB (5.68) =====================
   Ein fertiges Projekt geht ohne Umweg an Verlag, Lektorat oder Wettbewerb:
   - DOCX in Normseiten (Courier New 12 pt, 60 Anschlaege × 30 Zeilen, Seitenzahlen,
     Titelblatt, jedes Kapitel beginnt auf einer rechten Seite).
   - PDF in Normseiten, mit eigenem kleinen PDF-Schreiber (eingebaute Courier,
     WinAnsi fuer Umlaute) — ohne Netz, ohne Bibliothek.
   - EPUB fuers eigene Lesen in der Buecher-App, mit Formatierung aus dem Rich-Text.
   Alles laeuft auf dem Geraet. Randnotizen gehoeren nie in den Export. */

/* ---------- ZIP (nur „gespeichert“, ohne Kompression — reicht fuer DOCX und EPUB) ---------- */
const _crcTafel = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(bytes) { let c = 0xffffffff; for (let i = 0; i < bytes.length; i++) c = _crcTafel[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function zipBauen(dateien) {
  const enc = new TextEncoder();
  const teile = [], zentral = [];
  let ort = 0;
  const jetzt = new Date();
  const zeit = ((jetzt.getHours() & 31) << 11) | ((jetzt.getMinutes() & 63) << 5) | ((jetzt.getSeconds() / 2) & 31);
  const datum = (((jetzt.getFullYear() - 1980) & 127) << 9) | (((jetzt.getMonth() + 1) & 15) << 5) | (jetzt.getDate() & 31);
  for (const f of dateien) {
    const name = enc.encode(f.name);
    const daten = typeof f.daten === 'string' ? enc.encode(f.daten) : f.daten;
    const crc = crc32(daten);
    const utf8 = /[^\x20-\x7e]/.test(f.name) ? 0x0800 : 0;
    const kopf = new DataView(new ArrayBuffer(30));
    kopf.setUint32(0, 0x04034b50, true); kopf.setUint16(4, 20, true); kopf.setUint16(6, utf8, true); kopf.setUint16(8, 0, true);
    kopf.setUint16(10, zeit, true); kopf.setUint16(12, datum, true); kopf.setUint32(14, crc, true);
    kopf.setUint32(18, daten.length, true); kopf.setUint32(22, daten.length, true); kopf.setUint16(26, name.length, true); kopf.setUint16(28, 0, true);
    teile.push(new Uint8Array(kopf.buffer), name, daten);
    const z = new DataView(new ArrayBuffer(46));
    z.setUint32(0, 0x02014b50, true); z.setUint16(4, 20, true); z.setUint16(6, 20, true); z.setUint16(8, utf8, true); z.setUint16(10, 0, true);
    z.setUint16(12, zeit, true); z.setUint16(14, datum, true); z.setUint32(16, crc, true); z.setUint32(20, daten.length, true); z.setUint32(24, daten.length, true);
    z.setUint16(28, name.length, true); z.setUint16(30, 0, true); z.setUint16(32, 0, true); z.setUint16(34, 0, true); z.setUint16(36, 0, true); z.setUint32(38, 0, true); z.setUint32(42, ort, true);
    zentral.push(new Uint8Array(z.buffer), name);
    ort += 30 + name.length + daten.length;
  }
  const zGroesse = zentral.reduce((s, t) => s + t.length, 0);
  const ende = new DataView(new ArrayBuffer(22));
  ende.setUint32(0, 0x06054b50, true); ende.setUint16(8, dateien.length, true); ende.setUint16(10, dateien.length, true);
  ende.setUint32(12, zGroesse, true); ende.setUint32(16, ort, true);
  const alle = [...teile, ...zentral, new Uint8Array(ende.buffer)];
  const aus = new Uint8Array(alle.reduce((s, t) => s + t.length, 0));
  let p = 0; for (const t of alle) { aus.set(t, p); p += t.length; }
  return aus;
}

/* ---------- Inhalt: Rich-Text in Absaetze aus Laeufen (fett, kursiv, unterstrichen) ---------- */
function msXml(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '').replace(/([\ud800-\udbff][\udc00-\udfff])|[\ud800-\udfff]/g, (m, paar) => paar || ''); }
/* Liefert [{ laeufe: [{ t, b, i, u }], art: 'absatz'|'zitat' }]. Ohne DOMParser (Tests): reiner Text. */
function msAbsaetze(doc) {
  const reinText = () => String(doc && doc.text || '').replace(/\r/g, '').split(/\n+/).map((z) => z.trim()).filter(Boolean).map((z) => ({ laeufe: [{ t: z }], art: 'absatz' }));
  const rich = doc && doc.format === 'rich' && doc.rich;
  if (!rich || typeof DOMParser === 'undefined') return reinText();
  let wurzel;
  try { wurzel = new DOMParser().parseFromString('<div>' + (typeof sauberesRichHTML === 'function' ? sauberesRichHTML(rich) : rich) + '</div>', 'text/html').body.firstChild; } catch (e) { return reinText(); }
  /* Randnotizen sind keine Textbestandteile: ihre Markierung faellt weg, der Text bleibt. */
  const absaetze = [];
  let jetzt = null;
  const neu = (art) => { jetzt = { laeufe: [], art: art || 'absatz' }; absaetze.push(jetzt); };
  const BLOCK = /^(P|DIV|H1|H2|H3|H4|LI|BLOCKQUOTE|PRE)$/;
  const lauf = (knoten, stil, art) => {
    for (const k of knoten.childNodes) {
      if (k.nodeType === 3) { const t = k.nodeValue.replace(/\s+/g, ' '); if (!t) continue; if (!jetzt) neu(art); jetzt.laeufe.push({ t, b: stil.b, i: stil.i, u: stil.u }); }
      else if (k.nodeType === 1) {
        const tag = k.tagName;
        if (tag === 'BR') { neu(art); continue; }
        const s = { b: stil.b || tag === 'B' || tag === 'STRONG' || /^H[1-4]$/.test(tag), i: stil.i || tag === 'I' || tag === 'EM', u: stil.u || tag === 'U' };
        if (BLOCK.test(tag)) { const a = tag === 'BLOCKQUOTE' ? 'zitat' : art; neu(a); lauf(k, s, a); jetzt = null; }
        else lauf(k, s, art);
      }
    }
  };
  lauf(wurzel, {}, 'absatz');
  return absaetze.map((a) => ({ art: a.art, laeufe: a.laeufe.map((l, i, arr) => ({ ...l, t: i === 0 ? l.t.replace(/^\s+/, '') : i === arr.length - 1 ? l.t.replace(/\s+$/, '') : l.t })).filter((l) => l.t) })).filter((a) => a.laeufe.length);
}
/* Das Projekt als Folge von Kapiteln mit Szenen. Pur bis auf den Bestand. */
function msStruktur(p, was = {}) {
  const kapitel = [];
  for (const k of kinder(p.id, 'kapitel')) {
    const szenen = kinder(k.id, 'szene').filter((sz) => (sz.text || '').trim() || (was.leere && (sz.titel || '').trim()));
    if (!szenen.length) continue;
    kapitel.push({ titel: k.titel || 'Kapitel', szenen: szenen.map((sz) => ({ titel: was.szenentitel ? (sz.titel || '').trim() : '', absaetze: msAbsaetze(sz) })) });
  }
  return kapitel;
}
function msName() {
  return String((D.einst && D.einst.manuskriptName) || (typeof AKTIVES_PROFIL !== 'undefined' && AKTIVES_PROFIL && AKTIVES_PROFIL.name) || '').slice(0, 80);
}
function msDateiname(p, endung) { return ((p.titel || 'Manuskript').replace(/[^\wäöüÄÖÜß -]/g, '').trim().slice(0, 60) || 'Manuskript') + '.' + endung; }

/* ---------- Normseiten als Zeilen (fuer PDF und die Seitenzahl) ---------- */
const NS_SPALTEN = 60, NS_ZEILEN = 30;
function nsUmbrechen(text, einzug) {
  const woerter = String(text).split(/\s+/).filter(Boolean);
  const zeilen = [];
  let z = einzug ? '   ' : '';
  for (const w of woerter) {
    if (!z.trim()) z += w;
    else if ((z + ' ' + w).length <= NS_SPALTEN) z += ' ' + w;
    else { zeilen.push(z); z = w; }
    while (z.length > NS_SPALTEN) { zeilen.push(z.slice(0, NS_SPALTEN)); z = z.slice(NS_SPALTEN); }
  }
  if (z.trim()) zeilen.push(z);
  return zeilen;
}
/* Liefert Seiten aus Zeilen ({ t, mitte, fett }). Kapitel beginnen auf ungeraden Seiten. */
function nsSeiten(kapitel) {
  const seiten = [];
  let seite = null;
  const neueSeite = () => { seite = []; seiten.push(seite); };
  const zeile = (z) => { if (!seite || seite.length >= NS_ZEILEN) neueSeite(); seite.push(z); };
  kapitel.forEach((k) => {
    /* Kapitelanfang rechts: Seite 1 ist rechts — also ungerade Seitenzahl */
    neueSeite();
    if (seiten.length % 2 === 0) { seite.push({ t: '' }); neueSeite(); }
    for (let i = 0; i < 6; i++) seite.push({ t: '' });
    zeile({ t: k.titel.slice(0, NS_SPALTEN), mitte: true, fett: true });
    zeile({ t: '' }); zeile({ t: '' });
    k.szenen.forEach((sz, si) => {
      if (si) { zeile({ t: '' }); zeile({ t: '* * *', mitte: true }); zeile({ t: '' }); }
      if (sz.titel) { zeile({ t: sz.titel.slice(0, NS_SPALTEN), fett: true }); zeile({ t: '' }); }
      sz.absaetze.forEach((a, ai) => {
        const text = a.laeufe.map((l) => l.t).join('');
        for (const z of nsUmbrechen(text, ai > 0)) zeile({ t: z });
      });
    });
  });
  return seiten;
}

/* ---------- PDF ---------- */
const _winAnsi = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
function pdfText(t) {
  let s = '';
  for (const ch of String(t)) {
    let c = ch.codePointAt(0);
    if (c > 0xff || (c >= 0x80 && c < 0xa0)) c = _winAnsi[c] || 0x3f;
    if (c === 0x28 || c === 0x29 || c === 0x5c) s += '\\';
    s += String.fromCharCode(c);
  }
  return s;
}
/* Fuer die Dokument-Eigenschaften (Titel): UTF-16BE als Hex — dort gilt nicht WinAnsi. */
function pdfUnicode(t) {
  let h = '<FEFF';
  for (let i = 0; i < String(t).length; i++) h += String(t).charCodeAt(i).toString(16).toUpperCase().padStart(4, '0');
  return h + '>';
}
function pdfNormseiten(p, kapitel, meta = {}) {
  const W = 595.28, H = 841.89, links = 81, breite = NS_SPALTEN * 7.2, zh = 18, oben = H - 150;
  const textseiten = nsSeiten(kapitel);
  const name = meta.name || '';
  const kopfzeile = (nr) => pdfText(Array.from((p.titel || '') + (name ? ' · ' + name : '')).slice(0, 80).join(''));
  const stroeme = [];
  /* Titelblatt */
  const wortzahl = meta.worte || 0;
  const titel = [];
  const mitte = (t, y, gr) => 'BT /F' + (gr ? 2 : 1) + ' ' + (gr || 12) + ' Tf ' + (W / 2 - String(t).length * (gr || 12) * .3).toFixed(2) + ' ' + y.toFixed(2) + ' Td (' + pdfText(t) + ') Tj ET';
  titel.push(mitte(Array.from(p.titel || 'Ohne Titel').slice(0, 44).join(''), H * .62, 18));
  if (p.art) titel.push(mitte(p.art, H * .62 - 30));
  if (name) titel.push(mitte(name, H * .62 - 70));
  titel.push(mitte(wortzahl.toLocaleString('de-DE') + ' Wörter · ' + textseiten.length + ' Normseiten', 140));
  stroeme.push(titel.join('\n'));
  textseiten.forEach((zeilen, i) => {
    const nr = i + 1;
    const teil = ['BT /F1 9 Tf ' + links + ' ' + (H - 90) + ' Td (' + kopfzeile(nr) + ') Tj ET'];
    zeilen.forEach((z, zi) => {
      if (!z.t) return;
      const x = z.mitte ? links + (breite - z.t.length * 7.2) / 2 : links;
      teil.push('BT /F' + (z.fett ? 2 : 1) + ' 12 Tf ' + x.toFixed(2) + ' ' + (oben - zi * zh).toFixed(2) + ' Td (' + pdfText(z.t) + ') Tj ET');
    });
    teil.push('BT /F1 10 Tf ' + (W / 2 - String(nr).length * 3).toFixed(2) + ' 100 Td (' + nr + ') Tj ET');
    stroeme.push(teil.join('\n'));
  });
  /* Objekte schreiben, Versatztabelle mitzaehlen */
  const objekte = [];
  objekte.push('<< /Type /Catalog /Pages 2 0 R >>');
  const seitenIds = stroeme.map((_, i) => 5 + i * 2);
  objekte.push('<< /Type /Pages /Kids [' + seitenIds.map((id) => id + ' 0 R').join(' ') + '] /Count ' + stroeme.length + ' >>');
  objekte.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
  objekte.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');
  const infoNr = 5 + stroeme.length * 2;
  stroeme.forEach((s, i) => {
    objekte.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + (6 + i * 2) + ' 0 R >>');
    objekte.push('<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream');
  });
  objekte.push('<< /Title ' + pdfUnicode(Array.from(p.titel || 'Manuskript').slice(0, 120).join('')) + ' /Producer (VANI) >>');
  let pdf = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const versatz = [];
  objekte.forEach((o, i) => { versatz.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  const xref = pdf.length;
  pdf += 'xref\n0 ' + (objekte.length + 1) + '\n0000000000 65535 f \n' + versatz.map((v) => String(v).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += 'trailer\n<< /Size ' + (objekte.length + 1) + ' /Root 1 0 R /Info ' + infoNr + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return { bytes, normseiten: textseiten.length };
}

/* ---------- DOCX ---------- */
function docxLauf(l) {
  const rpr = (l.b ? '<w:b/>' : '') + (l.i ? '<w:i/>' : '') + (l.u ? '<w:u w:val="single"/>' : '');
  return '<w:r>' + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + msXml(l.t) + '</w:t></w:r>';
}
function docxBauen(p, kapitel, meta = {}) {
  const name = meta.name || '';
  const sect = (art, titelseite, abEins) => '<w:sectPr><w:headerReference w:type="default" r:id="rId3"/><w:footerReference w:type="default" r:id="rId2"/>' + (art ? '<w:type w:val="' + art + '"/>' : '') +
    '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="3000" w:right="1849" w:bottom="3038" w:left="1417" w:header="1418" w:footer="1418" w:gutter="0"/>' + (abEins ? '<w:pgNumType w:start="1"/>' : '') + (titelseite ? '<w:titlePg/>' : '') + '</w:sectPr>';
  const absatz = (inhalt, stil, ppr) => '<w:p><w:pPr>' + (stil ? '<w:pStyle w:val="' + stil + '"/>' : '') + (ppr || '') + '</w:pPr>' + inhalt + '</w:p>';
  const teile = [];
  /* Titelblatt */
  teile.push(absatz(docxLauf({ t: p.titel || 'Ohne Titel', b: true }), 'Titel'));
  if (p.art) teile.push(absatz(docxLauf({ t: p.art }), 'Untertitel'));
  if (name) teile.push(absatz(docxLauf({ t: name }), 'Untertitel'));
  /* Die Titelseite schliesst ihre Sektion selbst: ihr sectPr steht als Letztes im pPr ihres letzten Absatzes. */
  teile.push(absatz(docxLauf({ t: (meta.worte || 0).toLocaleString('de-DE') + ' Wörter · ca. ' + (meta.normseiten || 0) + ' Normseiten' }), 'Untertitel', sect('nextPage', true)));
  kapitel.forEach((k, ki) => {
    teile.push(absatz(docxLauf({ t: k.titel, b: true }), 'Kapitel'));
    k.szenen.forEach((sz, si) => {
      if (si) teile.push(absatz(docxLauf({ t: '* * *' }), 'Szenenwechsel'));
      if (sz.titel) teile.push(absatz(docxLauf({ t: sz.titel, b: true }), 'Szenentitel'));
      sz.absaetze.forEach((a, ai) => teile.push(absatz(a.laeufe.map(docxLauf).join(''), ai === 0 ? 'ErsterAbsatz' : (a.art === 'zitat' ? 'Zitat' : 'Normseite'))));
    });
    /* Jedes Kapitel ist eine eigene Sektion, die auf einer rechten Seite beginnt */
    if (ki < kapitel.length - 1) teile.push('<w:p><w:pPr>' + sect(ki === 0 ? 'nextPage' : 'oddPage', false, ki === 0) + '</w:pPr></w:p>');
  });
  const ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const dokument = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + ns + '><w:body>' + teile.join('') + sect(kapitel.length > 1 ? 'oddPage' : 'nextPage', false, kapitel.length <= 1) + '</w:body></w:document>';
  const stile = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New" w:eastAsia="Courier New"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="de-DE"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="360" w:lineRule="exact"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Normseite"><w:name w:val="Normseite"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:firstLine="432"/></w:pPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="ErsterAbsatz"><w:name w:val="Erster Absatz"/><w:basedOn w:val="Normal"/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Zitat"><w:name w:val="Zitat"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:right="720"/></w:pPr><w:rPr><w:i/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Kapitel"><w:name w:val="Kapitel"/><w:basedOn w:val="Normal"/><w:next w:val="ErsterAbsatz"/><w:pPr><w:keepNext/><w:spacing w:before="2160" w:after="720"/><w:jc w:val="center"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Szenentitel"><w:name w:val="Szenentitel"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:after="360"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Szenenwechsel"><w:name w:val="Szenenwechsel"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="360" w:after="360"/><w:jc w:val="center"/></w:pPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Titel"><w:name w:val="Titel"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="4320" w:after="720"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Untertitel"><w:name w:val="Untertitel"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr></w:style>' +
    '</w:styles>';
  const fuss = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + ns + '><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>';
  const kopf = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ' + ns + '><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">' + msXml((p.titel || '') + (name ? ' · ' + name : '')) + '</w:t></w:r></w:p></w:hdr>';
  const jetzt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  return zipBauen([
    { name: '[Content_Types].xml', daten: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
    { name: '_rels/.rels', daten: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
    { name: 'word/_rels/document.xml.rels', daten: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>' },
    { name: 'word/document.xml', daten: dokument },
    { name: 'word/styles.xml', daten: stile },
    { name: 'word/footer1.xml', daten: fuss },
    { name: 'word/header1.xml', daten: kopf },
    { name: 'docProps/core.xml', daten: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + msXml(p.titel || 'Manuskript') + '</dc:title><dc:creator>' + msXml(name) + '</dc:creator><dc:language>de-DE</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">' + jetzt + '</dcterms:created></cp:coreProperties>' }
  ]);
}

/* ---------- EPUB 3 (mit NCX fuer aeltere Leser) ---------- */
function epubLaeufe(laeufe) { return laeufe.map((l) => { let t = msXml(l.t); if (l.u) t = '<u>' + t + '</u>'; if (l.i) t = '<em>' + t + '</em>'; if (l.b) t = '<strong>' + t + '</strong>'; return t; }).join(''); }
function epubBauen(p, kapitel, meta = {}) {
  const name = meta.name || '';
  const roh = String(p.id || uid());
  const hex = [0, 1, 2, 3].map((n) => (crc32(new TextEncoder().encode(n + ':' + roh)) >>> 0).toString(16).padStart(8, '0')).join('');
  const kennung = 'urn:uuid:' + hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-4' + hex.slice(13, 16) + '-' + '89ab'[parseInt(hex[16], 16) & 3] + hex.slice(17, 20) + '-' + hex.slice(20, 32);
  const jetzt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const xhtml = (titel, koerper) => '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="de" lang="de"><head><meta charset="utf-8"/><title>' + msXml(titel) + '</title><link rel="stylesheet" type="text/css" href="stil.css"/></head><body>' + koerper + '</body></html>';
  const dateien = [{ name: 'mimetype', daten: 'application/epub+zip' },
    { name: 'META-INF/container.xml', daten: '<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>' },
    { name: 'OEBPS/stil.css', daten: 'body{font-family:serif;line-height:1.5;margin:0 5%}h1{text-align:center;margin:30% 0 .4em;font-size:1.8em}h2{text-align:center;margin:3em 0 1.6em;font-size:1.3em;page-break-before:always}h3{font-size:1em;margin:1.4em 0 .6em}p{margin:0;text-indent:1.4em;text-align:justify}p.erster,h2+p,h3+p,hr+p{text-indent:0}blockquote{margin:1em 2em;font-style:italic}hr{border:0;text-align:center;margin:1.4em 0}hr:after{content:"* * *"}.untertitel{text-align:center;text-indent:0;margin-top:.6em}' },
    { name: 'OEBPS/titel.xhtml', daten: xhtml(p.titel || 'Ohne Titel', '<h1>' + msXml(p.titel || 'Ohne Titel') + '</h1>' + (p.art ? '<p class="untertitel">' + msXml(p.art) + '</p>' : '') + (name ? '<p class="untertitel">' + msXml(name) + '</p>' : '')) }];
  kapitel.forEach((k, i) => {
    const koerper = '<section epub:type="chapter"><h2>' + msXml(k.titel) + '</h2>' + k.szenen.map((sz, si) => (si ? '<hr/>' : '') + (sz.titel ? '<h3>' + msXml(sz.titel) + '</h3>' : '') +
      sz.absaetze.map((a, ai) => a.art === 'zitat' ? '<blockquote><p>' + epubLaeufe(a.laeufe) + '</p></blockquote>' : '<p' + (ai === 0 ? ' class="erster"' : '') + '>' + epubLaeufe(a.laeufe) + '</p>').join('')).join('') + '</section>';
    dateien.push({ name: 'OEBPS/kapitel-' + (i + 1) + '.xhtml', daten: xhtml(k.titel, koerper) });
  });
  const nav = '<nav epub:type="toc" id="toc"><h1>Inhalt</h1><ol>' + kapitel.map((k, i) => '<li><a href="kapitel-' + (i + 1) + '.xhtml">' + msXml(k.titel) + '</a></li>').join('') + '</ol></nav>';
  dateien.push({ name: 'OEBPS/nav.xhtml', daten: xhtml('Inhalt', nav) });
  dateien.push({ name: 'OEBPS/toc.ncx', daten: '<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="' + kennung + '"/></head><docTitle><text>' + msXml(p.titel || 'Ohne Titel') + '</text></docTitle><navMap>' + kapitel.map((k, i) => '<navPoint id="n' + (i + 1) + '" playOrder="' + (i + 1) + '"><navLabel><text>' + msXml(k.titel) + '</text></navLabel><content src="kapitel-' + (i + 1) + '.xhtml"/></navPoint>').join('') + '</navMap></ncx>' });
  const manifest = '<item id="stil" href="stil.css" media-type="text/css"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="titel" href="titel.xhtml" media-type="application/xhtml+xml"/>' +
    kapitel.map((k, i) => '<item id="k' + (i + 1) + '" href="kapitel-' + (i + 1) + '.xhtml" media-type="application/xhtml+xml"/>').join('');
  const spine = '<itemref idref="titel"/>' + kapitel.map((k, i) => '<itemref idref="k' + (i + 1) + '"/>').join('');
  dateien.push({ name: 'OEBPS/content.opf', daten: '<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="buchid" xml:lang="de"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="buchid">' + kennung + '</dc:identifier><dc:title>' + msXml(p.titel || 'Ohne Titel') + '</dc:title><dc:language>de</dc:language>' + (name ? '<dc:creator>' + msXml(name) + '</dc:creator>' : '') + '<meta property="dcterms:modified">' + jetzt + '</meta></metadata><manifest>' + manifest + '</manifest><spine toc="ncx">' + spine + '</spine></package>' });
  return zipBauen(dateien);
}

/* ---------- Hinausgeben ---------- */
async function manuskriptAusgeben(p, format, was = {}) {
  const kapitel = msStruktur(p, was);
  if (!kapitel.length) { toast('In diesem Projekt steht noch keine Szene mit Text.'); return false; }
  const name = msName();
  const worte_ = kapitel.reduce((s, k) => s + k.szenen.reduce((t, sz) => t + sz.absaetze.reduce((u, a) => u + worte(a.laeufe.map((l) => l.t).join('')), 0), 0), 0);
  const normseiten = nsSeiten(kapitel).length;
  const meta = { name, worte: worte_, normseiten };
  try {
    if (format === 'pdf') {
      const { bytes } = pdfNormseiten(p, kapitel, meta);
      return teileDatei(msDateiname(p, 'pdf'), bytes, 'application/pdf');
    }
    if (format === 'docx') return teileDatei(msDateiname(p, 'docx'), docxBauen(p, kapitel, meta), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    if (format === 'epub') return teileDatei(msDateiname(p, 'epub'), epubBauen(p, kapitel, meta), 'application/epub+zip');
  } catch (e) {
    toast('Das Manuskript ließ sich gerade nicht bauen.');
    try { protokollSchreiben('manuskript', String(e && e.message || e)); } catch (x) {}
    return false;
  }
  return false;
}
function manuskriptNormseiten(p, was = {}) { return nsSeiten(msStruktur(p, was)).length; }
