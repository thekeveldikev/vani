/* ================================================================
   VANI — formatiertes Schreiben, sicher und überall gleich lesbar
   ================================================================ */

const RICH_TAGS = new Set(['DIV', 'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'SPAN']);

function richReinerText(html) {
  html = String(html || '').slice(0, 10000000);
  if (typeof document !== 'undefined' && document.createElement) {
    const d = document.createElement('div'); d.innerHTML = html;
    return (d.innerText || d.textContent || '').replace(/\u00a0/g, ' ');
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
  return vorlage.innerHTML.slice(0, 10000000);
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
  return el('div', { class: 'formatleiste' + (kompakt ? ' kompakt' : ''), role: 'toolbar', 'aria-label': 'Text formatieren' },
    knopf('B', 'Fett', 'bold'), knopf('I', 'Kursiv', 'italic'), knopf('U', 'Unterstrichen', 'underline'), knopf('S', 'Durchgestrichen', 'strikeThrough'),
    el('span', { class: 'format-trenner' }),
    knopf('• Liste', 'Ungeordnete Liste', 'insertUnorderedList'), knopf('1. Liste', 'Nummerierte Liste', 'insertOrderedList'),
    knopf('❝', 'Zitat', 'formatBlock', 'blockquote'),
    el('span', { class: 'format-trenner' }),
    knopf('≡', 'Links ausrichten', 'justifyLeft'), knopf('≣', 'Zentrieren', 'justifyCenter'), knopf('☰', 'Blocksatz', 'justifyFull'),
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
  editor.addEventListener('input', () => { sichern(); if (optionen.beiInput) optionen.beiInput(doc, editor, startWorte); });
  editor.addEventListener('paste', (e) => {
    const html = e.clipboardData && e.clipboardData.getData('text/html');
    if (!html) return;
    e.preventDefault();
    richBefehl(editor, 'insertHTML', sauberesRichHTML(html));
  });
  return { editor, leiste: baueFormatleiste(editor, () => editor.dispatchEvent(new Event('input', { bubbles: true })), !!optionen.kompakt), sichern };
}
