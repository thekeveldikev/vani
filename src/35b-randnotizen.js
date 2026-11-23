/* ===================== 35b — Randnotizen im Text (5.68) =====================
   Eine Stelle markieren, eine Notiz an den Rand heften — wie Kommentare,
   ohne den Text zu veraendern. Im Text bleibt nur eine Markierung
   (<span data-notiz="n…">, die einzige Ausnahme in der Rich-Text-Saeuberung,
   streng gepruefte Kennung); die Notiz selbst steht im Dokument unter
   `randnotizen`. Breite Bildschirme zeigen die Notizen am Rand neben ihrer
   Stelle, schmale beim Antippen. Exporte lassen sie weg (Markdown auf Wunsch). */

const RN_ID = /^n[a-z0-9]{4,24}$/;
function randnotizenSauber(liste) {
  if (!Array.isArray(liste)) return [];
  return liste.filter((n) => n && typeof n === 'object' && RN_ID.test(String(n.id || '')))
    .slice(-300).map((n) => ({ id: String(n.id), text: String(n.text || '').slice(0, 4000), wann: begrenze(n.wann, 0, Date.now() + 86400000, Date.now()) }));
}
function randnotizNeueId() { return 'n' + (uid() + Math.random().toString(36)).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14); }
function randnotizStelle(doc, id) {
  const m = String(doc && doc.rich || '').match(new RegExp('<span data-notiz="' + id + '"[^>]*>([\\s\\S]*?)</span>'));
  return m ? m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
}

/* Neue Notiz an der Markierung. Nur innerhalb eines Absatzes (ein span darf keine Absaetze umschliessen). */
async function randnotizSetzen(editor, doc, beiAenderung) {
  const sel = window.getSelection && window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed || !editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode)) { toast('Erst eine Stelle im Text markieren — dann die Randnotiz.', 3200); return false; }
  const bereich = sel.getRangeAt(0).cloneRange();
  const probe = bereich.cloneContents();
  if (probe.querySelector && probe.querySelector('p, div, li, h1, h2, h3, blockquote, ul, ol, br')) { toast('Eine Randnotiz gehört zu einer Stelle in einem Absatz — bitte etwas weniger markieren.', 4200); return false; }
  /* Keine Notiz in einer Notiz — auch nicht, wenn die Markierung in einem Textknoten liegt oder eine umschliesst. */
  const gemeinsam = bereich.commonAncestorContainer;
  const umgebung = gemeinsam && (gemeinsam.nodeType === 1 ? gemeinsam : gemeinsam.parentElement);
  if ((umgebung && umgebung.closest && umgebung.closest('[data-notiz]')) || (probe.querySelector && probe.querySelector('[data-notiz]'))) { toast('Hier hängt schon eine Randnotiz.'); return false; }
  const text = await eingabe({ titel: 'Randnotiz zu „' + String(bereich.toString()).slice(0, 60) + (bereich.toString().length > 60 ? '…' : '') + '“', mehrzeilig: true, platzhalter: 'Was dir dazu einfällt — der Text bleibt, wie er ist.', ok: 'Anheften' });
  if (!text || !text.trim()) return false;
  const id = randnotizNeueId();
  const span = document.createElement('span');
  span.setAttribute('data-notiz', id);
  try { span.append(bereich.extractContents()); bereich.insertNode(span); } catch (e) { toast('Diese Stelle lässt sich nicht markieren.'); return false; }
  /* Notizen, deren Stelle es nicht mehr gibt, machen Platz (sonst fiele bei 300 die neueste weg). */
  const lebend = (doc.randnotizen || []).filter((n) => editor.querySelector('span[data-notiz="' + n.id + '"]'));
  doc.randnotizen = randnotizenSauber([...lebend, { id, text: text.trim(), wann: Date.now() }]);
  if (beiAenderung) beiAenderung();
  randnotizenRandNeu(editor, doc);
  return true;
}
function randnotizLoesen(editor, doc, id) {
  const span = editor.querySelector('span[data-notiz="' + id + '"]');
  if (span) { while (span.firstChild) span.before(span.firstChild); span.remove(); }
  doc.randnotizen = (doc.randnotizen || []).filter((n) => n.id !== id);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  speichere(doc);
  randnotizenRandNeu(editor, doc);
}
async function randnotizZeigen(editor, doc, id) {
  const n = (doc.randnotizen || []).find((x) => x.id === id);
  if (!n) return;
  const wahl = await menue([
    { text: 'Notiz ändern', icon: 'stift', wert: 'aendern' },
    { text: 'Notiz lösen (der Text bleibt)', icon: 'kreuz', wert: 'weg', rot: true }
  ], '„' + n.text.slice(0, 220) + (n.text.length > 220 ? '…' : '') + '“');
  if (wahl === 'aendern') {
    const neu = await eingabe({ titel: 'Randnotiz', wert: n.text, mehrzeilig: true, ok: 'Fertig' });
    if (neu != null && neu.trim()) { n.text = neu.trim().slice(0, 4000); n.wann = Date.now(); speichere(doc); randnotizenRandNeu(editor, doc); }
  } else if (wahl === 'weg') randnotizLoesen(editor, doc, id);
}

/* Der Rand: Notizen neben ihrer Stelle, wenn rechts neben dem Text Platz ist. */
function randnotizenRandNeu(editor, doc) {
  const eltern = editor.parentElement;
  if (!eltern || !editor.isConnected) return;
  let rand = editor._rnRand;
  const liste = (doc.randnotizen || []).filter((n) => editor.querySelector('span[data-notiz="' + n.id + '"]'));
  const er = editor.getBoundingClientRect(), pr = eltern.getBoundingClientRect();
  /* Rechte Grenze ist der naechste scrollende Behaelter (ohne seine Laufleiste), nicht das
     Fenster — sonst ragt der Rand hinaus und es entsteht eine waagrechte Laufleiste. */
  let grenze = window.innerWidth;
  for (let e = eltern; e && e !== document.body; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) { grenze = Math.min(grenze, e.getBoundingClientRect().left + e.clientWidth); break; }
  }
  const platz = Math.min(grenze - er.right - 34, 240);
  if (!liste.length || platz < 150) { if (rand) rand.hidden = true; editor.classList.toggle('rn-schmal', liste.length > 0); return; }
  editor.classList.remove('rn-schmal');
  if (!rand) {
    rand = el('div', { class: 'rn-rand', 'aria-label': 'Randnotizen' });
    editor._rnRand = rand;
    if (getComputedStyle(eltern).position === 'static') eltern.style.position = 'relative';
    eltern.append(rand);
  }
  rand.hidden = false;
  rand.style.left = (er.right - pr.left + 18) + 'px';
  rand.style.width = platz + 'px';
  rand.innerHTML = '';
  let unten = 0;
  for (const n of liste) {
    const span = editor.querySelector('span[data-notiz="' + n.id + '"]');
    const oben = Math.max(unten, span.getBoundingClientRect().top - pr.top - 2);
    const karte = el('button', { class: 'rn-notiz', style: 'top:' + oben + 'px', onclick: () => randnotizZeigen(editor, doc, n.id) }, n.text);
    karte.addEventListener('pointerenter', () => span.classList.add('rn-an'));
    karte.addEventListener('pointerleave', () => span.classList.remove('rn-an'));
    rand.append(karte);
    unten = oben + Math.min(karte.offsetHeight || 64, 110) + 8;
  }
}
/* Markierungen ohne Notiz und doppelte Kennungen (nach Kopieren und Einfuegen) aufloesen.
   Gibt true zurueck, wenn sich etwas geaendert hat. */
function randnotizenAufraeumen(editor, doc) {
  const ids = new Set((doc.randnotizen || []).map((n) => n.id));
  const gesehen = new Set();
  let geaendert = false;
  for (const span of [...editor.querySelectorAll('span[data-notiz]')]) {
    const id = span.getAttribute('data-notiz');
    if (ids.has(id) && !gesehen.has(id)) { gesehen.add(id); continue; }
    while (span.firstChild) span.before(span.firstChild);
    span.remove(); geaendert = true;
  }
  return geaendert;
}
/* Haengt Antippen und Rand an einen Rich-Editor. */
function randnotizenBeleben(editor, doc) {
  editor.addEventListener('click', (e) => {
    /* Antippen oeffnet die Notiz nur, wenn kein Rand da ist — sonst haengt sie ja daneben
       und der Cursor laesst sich im markierten Wort ganz normal setzen. */
    if (!editor.classList.contains('rn-schmal')) return;
    const span = e.target && e.target.closest && e.target.closest('span[data-notiz]');
    if (!span || !editor.contains(span)) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && !sel.isCollapsed) return;   /* wer markiert, will markieren */
    randnotizZeigen(editor, doc, span.getAttribute('data-notiz'));
  });
  const neu = entprellt(() => {
    if (editor.querySelector('span[data-notiz]') && randnotizenAufraeumen(editor, doc)) editor.dispatchEvent(new Event('input', { bubbles: true }));
    randnotizenRandNeu(editor, doc);
  }, 280);
  editor.addEventListener('input', neu);
  window.addEventListener('resize', neu);
  /* Erst messen, wenn der Editor im Bild steht. */
  let versuche = 0;
  let warVerbunden = false;
  const warte = () => { if (editor.isConnected) { warVerbunden = true; if (randnotizenAufraeumen(editor, doc)) editor.dispatchEvent(new Event('input', { bubbles: true })); randnotizenRandNeu(editor, doc); return; } if (++versuche < 40) setTimeout(warte, 150); else window.removeEventListener('resize', neu); };
  setTimeout(warte, 60);
  /* Abmelden erst, wenn der Editor schon einmal im Bild war und jetzt weg ist — nicht beim spaeten Einhaengen. */
  const raus = new MutationObserver(() => { if (editor.isConnected) warVerbunden = true; else if (warVerbunden) { window.removeEventListener('resize', neu); raus.disconnect(); } });
  if (document.body) raus.observe(document.body, { childList: true, subtree: false });
}
