/* ================================================================
   VANI — formatiertes Schreiben, sicher und überall gleich lesbar
   ================================================================ */

const RICH_TAGS = new Set(['DIV', 'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'SPAN']);

/* Ein losgel\u00f6stes Element wird nie gesetzt \u2014 dort liefert innerText keine
   Zeilenumbr\u00fcche, und aus zwei Abs\u00e4tzen w\u00fcrde ein zusammengeklebtes Wort.
   Darum werden Zeilen- und Blockenden vorher zu echten Umbr\u00fcchen. */
function richReinerText(html) {
  html = String(html || '').slice(0, 10000000);
  if (typeof document !== 'undefined' && document.createElement) {
    const d = document.createElement('div');
    d.innerHTML = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|h[1-6]|blockquote|tr|section|article|figcaption|dd|dt|pre)\s*>/gi, '\n');
    return (d.textContent || '').replace(/\u00a0/g, ' ').replace(/\u200b/g, '');
  }
  return html.replace(/<script[\s\S]*?<\/script\s*>/gi, '').replace(/<style[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(?:p|div|li|h[1-3]|blockquote)>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&');
}

function richAusText(text) {
  return esc(String(text || '')).replace(/\n/g, '<br>');
}

function _richFarbe(wert, ersatz = '') {
  wert = String(wert || '').trim().toLowerCase();
  if (/^#[0-9a-f]{3,8}$/.test(wert) || /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/.test(wert)) return wert;
  return ersatz;
}

function sauberesRichHTML(html) {
  html = String(html || '').slice(0, 10000000);
  if (typeof document === 'undefined' || !document.createElement || !document.createTreeWalker) return richAusText(richReinerText(html));
  const vorlage = document.createElement('template');
  vorlage.innerHTML = html.replace(/<script[\s\S]*?<\/script\s*>/gi, '').replace(/<style[\s\S]*?<\/style\s*>/gi, '');
  const walker = document.createTreeWalker(vorlage.content, (globalThis.NodeFilter && NodeFilter.SHOW_ELEMENT) || 1);
  const elemente = [];
  while (walker.nextNode()) elemente.push(walker.currentNode);
  for (const node of elemente) {
    if (!RICH_TAGS.has(node.tagName)) {
      const text = document.createTextNode(node.textContent || '');
      node.replaceWith(text); continue;
    }
    const style = node.style || {};
    const farbe = _richFarbe(style.color);
    const hintergrund = _richFarbe(style.backgroundColor);
    const px = parseFloat(style.fontSize || '');
    const ausrichtung = ['left', 'center', 'right', 'justify'].includes(style.textAlign) ? style.textAlign : '';
    for (const attr of [...node.attributes]) node.removeAttribute(attr.name);
    const teile = [];
    if (farbe) teile.push('color:' + farbe);
    if (hintergrund) teile.push('background-color:' + hintergrund);
    if (Number.isFinite(px)) teile.push('font-size:' + begrenze(px, 11, 72, 18) + 'px');
    if (ausrichtung) teile.push('text-align:' + ausrichtung);
    if (teile.length) node.setAttribute('style', teile.join(';'));
  }
  return vorlage.innerHTML.replace(/\u200b/g, '').slice(0, 10000000);
}

/* ----- Drei kleine Reparaturen für fremden Text -----
   Goodnotes (und andere) schreiben Leerzeichen am Zeilenende als „&#x20;" in
   den Text — nicht als HTML, sondern als Buchstaben. Beim Einfügen standen
   sie dann wörtlich auf der Seite. Hier werden solche Reste zurückverwandelt.
   Nur das Eindeutige: Zahlen-Entitäten und die paar benannten, die in Text
   wirklich vorkommen. */
const ENTITAETEN = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", shy: '', hellip: '…', ndash: '–', mdash: '—', laquo: '«', raquo: '»', bdquo: '„', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', sbquo: '‚' };
function entitaetenReparieren(text) {
  const t = String(text || '');
  if (t.indexOf('&') < 0) return t;
  return t.replace(/&(#x([0-9a-f]{1,6})|#(\d{1,7})|([a-z]{2,8}));/gi, (ganz, _, hex, dez, name) => {
    let code = null;
    if (hex) code = parseInt(hex, 16);
    else if (dez) code = parseInt(dez, 10);
    else if (name && Object.prototype.hasOwnProperty.call(ENTITAETEN, name.toLowerCase())) return ENTITAETEN[name.toLowerCase()];
    else return ganz;
    if (!Number.isFinite(code) || code < 9 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return ganz;
    try { return String.fromCodePoint(code); } catch (e) { return ganz; }
  });
}

/* Kurzschrift: _kursiv_, *fett*, ~durchgestrichen~ — so, wie man es in
   WhatsApp oder Goodnotes tippt. Arbeitet auf schon escaptem HTML, deshalb
   dürfen die Zeichen drinnen keine Tags anreißen. */
function kurzschriftZuHTML(html) {
  let h = String(html || '');
  if (!/[_*~]/.test(h)) return h;
  const tausche = (zeichen, tag) => {
    const z = zeichen === '*' ? '\\*' : zeichen;
    const re = new RegExp('(^|[\\s(„"“>])' + z + '([^' + z + '<>\\n][^' + z + '<>\\n]{0,400}?[^' + z + '<>\\n\\s]|[^' + z + '<>\\n\\s])' + z + '(?=[\\s.,;:!?)“"”»<]|$)', 'g');
    h = h.replace(re, (ganz, vor, inhalt) => /^\s/.test(inhalt) ? ganz : vor + '<' + tag + '>' + inhalt + '</' + tag + '>');
  };
  tausche('_', 'i'); tausche('*', 'b'); tausche('~', 's');
  return h;
}

/* Weiche Umbrüche: Goodnotes bricht lange Absätze an der Zeilenkante um und
   liefert jede Zeile als eigenen Absatz. Auf der Seite stand dann mitten im
   Satz eine Lücke. Endet ein Absatz ohne Satzzeichen und der nächste beginnt
   klein, gehören beide zusammen. Arbeitet auf Blöcken {tag, inhalt}. */
function verbindeWeicheUmbrueche(bloecke) {
  const text = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").trim();
  const raus = [];
  for (const b of bloecke) {
    const vorher = raus[raus.length - 1];
    if (vorher && vorher.tag === 'p' && b.tag === 'p') {
      const a = text(vorher.inhalt), z = text(b.inhalt);
      const offen = a && !/[.!?:;…"“”»›)\]}—–]$/.test(a) && !/^[-–—•·*]/.test(z);
      if (offen && /^[a-zäöüß]/.test(z)) { vorher.inhalt = vorher.inhalt.replace(/\s+$/, '') + ' ' + b.inhalt.replace(/^\s+/, ''); continue; }
    }
    raus.push(b);
  }
  return raus;
}

/* Aus fremdem HTML wird ruhiger VANI-Text.
   Was bleibt: Absätze, Zeilen, Überschriften, Listen, Zitate, fett/kursiv/
   unterstrichen/durchgestrichen. Was draußen bleibt: fremde Schriftgrößen
   (12pt wird sonst zu winzigen 12px), fremde Textfarben (schwarz auf dunklem
   Papier ist unlesbar), fremde Hintergründe und Ausrichtungen.
   Was gerettet wird: Tabellenzellen und Abschnitte werden getrennt, statt zu
   „Zelle AZelle B" zu verschmelzen. */
function einfuegeHTML(html, maxBloecke = 20000) {
  if (typeof document === 'undefined' || !document.createElement) return richAusText(richReinerText(html));
  const vorlage = document.createElement('template');
  vorlage.innerHTML = String(html || '').slice(0, 10000000)
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '').replace(/<style[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const INLINE = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', S: 's', STRIKE: 's', DEL: 's' };
  const BLOCK = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'NAV',
    'FIGURE', 'FIGCAPTION', 'ADDRESS', 'PRE', 'DL', 'DT', 'DD', 'TABLE', 'THEAD', 'TBODY', 'TFOOT',
    'TR', 'UL', 'OL', 'FORM', 'FIELDSET', 'HR', 'CAPTION']);
  const bloecke = [];
  let jetzt = { tag: 'p', html: '' };
  const ablegen = () => {
    const inhalt = jetzt.html.replace(/&nbsp;/g, ' ').replace(/[ \t ]+/g, ' ').trim();
    if (inhalt && bloecke.length < maxBloecke) bloecke.push({ tag: jetzt.tag, inhalt });
    jetzt = { tag: 'p', html: '' };
  };
  const lauf = (knoten, tiefe) => {
    if (tiefe > 80 || bloecke.length >= maxBloecke) return;
    for (const k of knoten.childNodes) {
      if (k.nodeType === 3) { jetzt.html += esc(entitaetenReparieren(k.nodeValue || '')); continue; }
      if (k.nodeType !== 1) continue;
      const name = k.tagName;
      if (name === 'BR') { ablegen(); continue; }
      if (name === 'TD' || name === 'TH') { lauf(k, tiefe + 1); jetzt.html += ' '; continue; }
      if (name === 'LI') { ablegen(); jetzt.tag = 'li'; lauf(k, tiefe + 1); ablegen(); continue; }
      if (/^H[1-6]$/.test(name)) { ablegen(); jetzt.tag = 'h' + Math.min(3, Number(name[1]) || 3); lauf(k, tiefe + 1); ablegen(); continue; }
      if (name === 'BLOCKQUOTE') { ablegen(); jetzt.tag = 'blockquote'; lauf(k, tiefe + 1); ablegen(); continue; }
      if (INLINE[name]) { jetzt.html += '<' + INLINE[name] + '>'; lauf(k, tiefe + 1); jetzt.html += '</' + INLINE[name] + '>'; continue; }
      if (BLOCK.has(name)) { ablegen(); lauf(k, tiefe + 1); ablegen(); continue; }
      lauf(k, tiefe + 1); /* span, a, font und alles Unbekannte: nur auspacken */
    }
  };
  lauf(vorlage.content, 0);
  ablegen();

  const verbunden = verbindeWeicheUmbrueche(bloecke);
  for (const b of verbunden) b.inhalt = kurzschriftZuHTML(b.inhalt);
  const raus = [];
  for (let i = 0; i < verbunden.length; i++) {
    if (verbunden[i].tag !== 'li') { raus.push('<' + verbunden[i].tag + '>' + verbunden[i].inhalt + '</' + verbunden[i].tag + '>'); continue; }
    const punkte = [];
    while (i < verbunden.length && verbunden[i].tag === 'li') { punkte.push('<li>' + verbunden[i].inhalt + '</li>'); i++; }
    i--;
    raus.push('<ul>' + punkte.join('') + '</ul>');
  }
  return sauberesRichHTML(raus.join(''));
}

/* Reiner Text von außen wird zu ruhigen Absätzen, ohne Leerzeilenwüsten. */
function einfuegeAusText(text) {
  const zeilen = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const bloecke = [];
  for (const z of zeilen) {
    const sauber = entitaetenReparieren(z).replace(/[ \t ]+/g, ' ').trim();
    if (sauber) bloecke.push({ tag: 'p', inhalt: kurzschriftZuHTML(esc(sauber)) });
    else if (bloecke.length && bloecke[bloecke.length - 1].inhalt !== '<br>') bloecke.push({ tag: 'p', inhalt: '<br>' });
  }
  const raus = verbindeWeicheUmbrueche(bloecke).map((b) => '<p>' + b.inhalt + '</p>');
  return sauberesRichHTML(raus.join(''));
}

/* Kurzschrift beim Tippen: Sobald das schließende _, * oder ~ fällt, wird
   das Wort dazwischen kursiv, fett oder durchgestrichen. Der Cursor landet
   dahinter und schreibt wieder normal — dafür sorgt ein unsichtbares Zeichen,
   das beim Speichern wieder verschwindet. */
function kurzschriftLive(editor) {
  const sel = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
  if (!sel || !sel.rangeCount || !sel.isCollapsed) return false;
  const r = sel.getRangeAt(0);
  const knoten = r.startContainer;
  if (!knoten || knoten.nodeType !== 3 || !editor.contains(knoten)) return false;
  const davor = knoten.nodeValue.slice(0, r.startOffset);
  const m = davor.match(/(^|[\s(„"“])([_*~])([^_*~\n]{1,200}?)\2$/);
  if (!m) return false;
  const inhalt = m[3];
  if (!inhalt.trim() || /^\s|\s$/.test(inhalt)) return false;
  const tag = { _: 'i', '*': 'b', '~': 's' }[m[2]];
  const start = r.startOffset - (inhalt.length + 2);
  if (start < 0) return false;
  const bereich = document.createRange();
  bereich.setStart(knoten, start); bereich.setEnd(knoten, r.startOffset);
  bereich.deleteContents();
  const neu = document.createElement(tag);
  neu.textContent = inhalt;
  bereich.insertNode(neu);
  const nach = document.createTextNode('\u200b');
  neu.after(nach);
  const ziel = document.createRange();
  ziel.setStart(nach, 1); ziel.collapse(true);
  sel.removeAllRanges(); sel.addRange(ziel);
  return true;
}

function richBefehl(editor, befehl, wert) {
  if (!editor || !editor.isConnected) return false;
  editor.focus();
  try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
  try { return document.execCommand(befehl, false, wert == null ? null : wert); }
  catch (e) { return false; }
}

function richGroesse(editor, px) {
  px = Math.round(begrenze(px, 11, 72, 18));
  if (!richBefehl(editor, 'fontSize', '7')) return false;
  $$('font[size="7"]', editor).forEach((font) => {
    const span = el('span', { style: 'font-size:' + px + 'px' });
    while (font.firstChild) span.append(font.firstChild);
    font.replaceWith(span);
  });
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

/* Teilt formatierten Inhalt an der letzten noch passenden Textstelle. Range
   klont dabei die umgebenden Fett-/Farb-/Listen-Elemente auf beide Seiten. */
function richTeileFuerHoehe(editor, passtHtml) {
  if (!editor || typeof document === 'undefined' || !document.createRange || typeof passtHtml !== 'function') return null;
  const walker = document.createTreeWalker(editor, (globalThis.NodeFilter && NodeFilter.SHOW_TEXT) || 4);
  const knoten = []; let gesamt = 0, node;
  while ((node = walker.nextNode())) { if (node.data.length) { knoten.push({ node, von: gesamt, bis: gesamt + node.data.length }); gesamt += node.data.length; } }
  if (gesamt < 2 || !knoten.length) return null;
  const htmlBis = (stelle) => {
    const k = knoten.find((x) => stelle <= x.bis) || knoten[knoten.length - 1];
    const lokal = Math.max(0, Math.min(k.node.data.length, stelle - k.von));
    const links = document.createRange(); links.selectNodeContents(editor); links.setEnd(k.node, lokal);
    const rechts = document.createRange(); rechts.selectNodeContents(editor); rechts.setStart(k.node, lokal);
    const a = document.createElement('div'), b = document.createElement('div');
    a.append(links.cloneContents()); b.append(rechts.cloneContents());
    return { hier: a.innerHTML, weiter: b.innerHTML };
  };
  let lo = 1, hi = gesamt - 1, best = 0;
  while (lo <= hi) {
    const mitte = Math.floor((lo + hi) / 2), teil = htmlBis(mitte);
    if (passtHtml(teil.hier)) { best = mitte; lo = mitte + 1; } else hi = mitte - 1;
  }
  if (best < 1 || best >= gesamt) return null;
  const klar = knoten.map((x) => x.node.data).join('');
  const wortgrenze = Math.max(klar.lastIndexOf(' ', best), klar.lastIndexOf('\n', best));
  if (wortgrenze > Math.max(1, best - 180)) best = wortgrenze + 1;
  const teil = htmlBis(best);
  if (!richReinerText(teil.weiter).trim()) return null;
  return { hier: sauberesRichHTML(teil.hier), weiter: sauberesRichHTML(teil.weiter) };
}

function baueFormatleiste(editor, beiAenderung, kompakt) {
  const knopf = (text, titel, befehl, wert) => el('button', {
    class: 'format-knopf', title: titel, 'aria-label': titel,
    onpointerdown: (e) => e.preventDefault(), onclick: () => { richBefehl(editor, befehl, wert); if (beiAenderung) beiAenderung(); }
  }, text);
  const farbe = el('input', { type: 'color', value: '#2c251c', title: 'Textfarbe', 'aria-label': 'Textfarbe' });
  farbe.addEventListener('input', () => { richBefehl(editor, 'foreColor', farbe.value); if (beiAenderung) beiAenderung(); });
  const marker = el('input', { type: 'color', value: '#f1d982', title: 'Markierfarbe', 'aria-label': 'Markierfarbe' });
  marker.addEventListener('input', () => { richBefehl(editor, 'hiliteColor', marker.value); if (beiAenderung) beiAenderung(); });
  const groesse = el('input', { type: 'range', min: '11', max: '64', value: '19', title: 'Schriftgröße', 'aria-label': 'Schriftgröße' });
  const groesseWert = el('span', { class: 'format-groesse' }, '19');
  groesse.addEventListener('input', () => { groesseWert.textContent = groesse.value; });
  groesse.addEventListener('change', () => { richGroesse(editor, Number(groesse.value)); if (beiAenderung) beiAenderung(); });
  const ikKnopf = (icon, titel, befehl, wert) => knopf(el('span', { html: ik(icon), style: 'display:flex' }), titel, befehl, wert);
  return el('div', { class: 'formatleiste' + (kompakt ? ' kompakt' : ''), role: 'toolbar', 'aria-label': 'Text formatieren' },
    knopf('B', 'Fett', 'bold'), knopf('I', 'Kursiv', 'italic'), knopf('U', 'Unterstrichen', 'underline'), knopf('S', 'Durchgestrichen', 'strikeThrough'),
    el('span', { class: 'format-trenner' }),
    knopf('Ü', 'Überschrift', 'formatBlock', 'h2'), knopf('¶', 'Normaler Absatz', 'formatBlock', 'p'),
    knopf('• Liste', 'Ungeordnete Liste', 'insertUnorderedList'), knopf('1. Liste', 'Nummerierte Liste', 'insertOrderedList'),
    knopf('❝', 'Zitat', 'formatBlock', 'blockquote'),
    el('span', { class: 'format-trenner' }),
    ikKnopf('ausLinks', 'Links ausrichten', 'justifyLeft'), ikKnopf('ausMitte', 'Zentrieren', 'justifyCenter'),
    ikKnopf('ausRechts', 'Rechts ausrichten', 'justifyRight'), ikKnopf('ausBlock', 'Blocksatz', 'justifyFull'),
    el('label', { class: 'format-farbe', title: 'Textfarbe' }, 'A', farbe),
    el('label', { class: 'format-farbe marker', title: 'Markierfarbe' }, '▰', marker),
    el('label', { class: 'format-slider' }, 'Größe', groesse, groesseWert));
}

function baueRichEditor(doc, optionen = {}) {
  const editor = el('div', {
    class: (optionen.class || '') + ' rich-editor text', contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true',
    'data-placeholder': optionen.platzhalter || 'Schreib einfach.'
  });
  editor.innerHTML = sauberesRichHTML(doc.rich || richAusText(doc.text || ''));
  let startWorte = worte(doc.text || '');
  const sichern = entprellt(() => {
    doc.rich = sauberesRichHTML(editor.innerHTML);
    doc.text = richReinerText(doc.rich).replace(/\n{3,}/g, '\n\n').trimEnd();
    doc.format = 'rich';
    speichere(doc); zaehleWorte(doc.id, doc.text);
    if (optionen.beiSpeichern) optionen.beiSpeichern(doc, editor);
  }, optionen.warten || 400, true);
  editor.addEventListener('input', (e) => {
    if (D.einst.kurzschrift !== false && e && e.inputType === 'insertText' && /[_*~]/.test(e.data || '')) { try { kurzschriftLive(editor); } catch (x) {} }
    sichern(); if (optionen.beiInput) optionen.beiInput(doc, editor, startWorte);
  });
  editor.addEventListener('paste', (e) => {
    if (!e.clipboardData) return;
    const html = e.clipboardData.getData('text/html');
    const roh = e.clipboardData.getData('text/plain');
    if (!html && !roh) return;
    e.preventDefault();
    const fertig = html ? einfuegeHTML(html) : einfuegeAusText(roh);
    if (!fertig.trim()) return;
    richBefehl(editor, 'insertHTML', fertig);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return { editor, leiste: baueFormatleiste(editor, () => editor.dispatchEvent(new Event('input', { bubbles: true })), !!optionen.kompakt), sichern };
}
