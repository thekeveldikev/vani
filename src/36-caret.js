/* ===================== 36 — DER CURSOR BLEIBT IM BLICK =====================
   Auf dem iPad schiebt Safari die ganze Seite hoch, um den Cursor über die
   Tastatur zu holen. VANIs Gerüst ist aber auf die sichtbare Höhe gebaut —
   also rutschte es weg, unten klaffte eine leere Fläche, und wer mitten im
   Text tippte, sah nicht mehr, wo er schrieb.

   Darum zwei Dinge: Die Seite selbst wird festgehalten (sie darf nie
   scrollen), und VANI holt den Cursor selbst in den sichtbaren Bereich —
   überall, wo geschrieben wird: Heftseiten, Rolle, Zettel, Randnotizen,
   Titelzeilen. Der Schreibraum hat seine eigene Schreibmaschinen-Logik und
   bleibt hier unangetastet. */

const CARET_RAND_OBEN = 76;     /* so viel Luft bleibt über dem Cursor */
const CARET_RAND_UNTEN = 108;   /* und so viel darunter — dort steht oft eine Leiste */

/* Wohin der Halter scrollen muss, damit der Cursor gut im Bild steht:
   eine Zahl, oder null, wenn er schon gut steht. Pur. */
function caretZiel(cursor, halter, raender = {}) {
  if (!cursor || !halter || !(halter.height > 0)) return null;
  const oben = Math.min(raender.oben == null ? CARET_RAND_OBEN : raender.oben, halter.height * .3);
  const unten = Math.min(raender.unten == null ? CARET_RAND_UNTEN : raender.unten, halter.height * .4);
  const scroll = halter.scrollTop || 0;
  if (cursor.bottom > halter.bottom - unten) {
    return Math.max(0, scroll + (cursor.bottom - (halter.bottom - unten)));
  }
  if (cursor.top < halter.top + oben) {
    return Math.max(0, scroll - ((halter.top + oben) - cursor.top));
  }
  return null;
}

/* Der Spiegel misst, wo der Cursor in einem Textfeld steht: dieselbe Schrift,
   dieselbe Breite, derselbe Umbruch — nur unsichtbar. */
let _caretSpiegel = null;
const CARET_STILE = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'letterSpacing',
  'lineHeight', 'textTransform', 'textIndent', 'textAlign', 'wordSpacing', 'boxSizing',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'];

function caretKastenTextfeld(feld) {
  const r = feld.getBoundingClientRect();
  if (!r.width) return null;
  const cs = getComputedStyle(feld);
  if (!_caretSpiegel) {
    _caretSpiegel = document.createElement('div');
    _caretSpiegel.setAttribute('aria-hidden', 'true');
    document.body.append(_caretSpiegel);
  }
  const m = _caretSpiegel;
  m.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;z-index:-1;margin:0;overflow:hidden;' +
    (feld.tagName === 'INPUT' ? 'white-space:pre;' : 'white-space:pre-wrap;overflow-wrap:break-word;');
  for (const s of CARET_STILE) m.style[s] = cs[s];
  m.style.width = r.width + 'px';
  m.style.height = 'auto';
  m.style.left = r.left + 'px';
  m.style.top = (r.top - (feld.scrollTop || 0)) + 'px';
  const wert = feld.value == null ? '' : String(feld.value);
  const pos = feld.selectionStart == null ? wert.length : feld.selectionStart;
  m.textContent = wert.slice(0, pos);
  const marke = document.createElement('span');
  marke.textContent = wert.slice(pos, pos + 1) || '​';
  m.append(marke);
  const box = marke.getBoundingClientRect();
  const kasten = box && (box.height || box.width)
    ? { top: box.top, bottom: box.top + Math.max(box.height, parseFloat(cs.lineHeight) || 18), height: box.height }
    : null;
  m.textContent = '';
  return kasten;
}

/* Rechteck des Cursors im Fenster — für Rich-Text über die Auswahl. */
function caretKasten(feld) {
  if (!feld) return null;
  if (feld.isContentEditable) {
    const sel = window.getSelection && window.getSelection();
    if (!sel || !sel.rangeCount || !feld.contains(sel.anchorNode)) return null;
    const r = sel.getRangeAt(0).cloneRange();
    let box = r.getBoundingClientRect();
    if (!box || (!box.height && !box.width)) {
      /* Leere Zeile: ein unsichtbarer Messpunkt verrät die Lage. */
      const mess = document.createElement('span'); mess.textContent = '​';
      try {
        r.insertNode(mess); box = mess.getBoundingClientRect();
        const eltern = mess.parentNode; mess.remove(); if (eltern) eltern.normalize();
      } catch (e) { return null; }
    }
    return box && box.height ? { top: box.top, bottom: box.bottom, height: box.height } : null;
  }
  if (feld.tagName === 'TEXTAREA') return caretKastenTextfeld(feld);
  if (feld.tagName === 'INPUT' && /^(text|search|url|email|tel|number|password)$/i.test(feld.type || 'text')) {
    const r = feld.getBoundingClientRect();
    return r.height ? { top: r.top, bottom: r.bottom, height: r.height } : null;
  }
  return null;
}

/* Der nächste Kasten, der wirklich scrollen kann. */
function caretHalter(feld) {
  let p = feld.parentElement;
  while (p && p !== document.body) {
    const cs = getComputedStyle(p);
    if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 4) return p;
    p = p.parentElement;
  }
  const raum = document.getElementById('raum');
  return raum && raum.contains(feld) && raum.scrollHeight > raum.clientHeight + 4 ? raum : null;
}

/* Den Cursor in den sichtbaren Bereich holen. Gibt true, wenn gemessen wurde. */
function caretImBlick(feld, sanft) {
  feld = feld || document.activeElement;
  if (!feld || !feld.closest) return false;
  /* Der Schreibraum zentriert selbst (Schreibmaschine), der Lesemodus liest nur. */
  if (feld.closest('.schreibraum, .sm-buehne')) return false;
  const kasten = caretKasten(feld);
  if (!kasten) return false;
  const halter = caretHalter(feld);
  if (halter) {
    const h = halter.getBoundingClientRect();
    const ziel = caretZiel(kasten, { top: h.top, bottom: h.bottom, height: h.height, scrollTop: halter.scrollTop });
    if (ziel != null && Math.abs(ziel - halter.scrollTop) > 1) {
      halter.scrollTo({ top: ziel, behavior: sanft ? 'smooth' : 'auto' });
    }
  }
  seiteFesthalten();
  return true;
}

/* Die Seite selbst darf nie verrutschen: Safari schiebt sie sonst unter der
   Tastatur weg, und unter dem Gerüst klafft eine leere Fläche. */
function seiteFesthalten() {
  if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
  if (document.body.scrollTop) document.body.scrollTop = 0;
}

let _caretRaf = 0;
function caretNachziehen(sanft) {
  cancelAnimationFrame(_caretRaf);
  _caretRaf = requestAnimationFrame(() => caretImBlick(document.activeElement, sanft));
}
function caretSchreibfeld(el) {
  return !!(el && (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT'));
}

document.addEventListener('input', (e) => { if (caretSchreibfeld(e.target)) caretNachziehen(false); }, true);
document.addEventListener('keyup', (e) => {
  if (!caretSchreibfeld(e.target)) return;
  if (/^(Arrow|Page|Home|End|Enter|Backspace|Delete)/.test(e.key || '')) caretNachziehen(false);
}, true);
document.addEventListener('focusin', (e) => {
  if (!caretSchreibfeld(e.target)) return;
  const feld = e.target;
  /* Zweimal nachsehen: sofort und wenn die Tastatur oben ist. */
  setTimeout(() => caretImBlick(feld, true), 70);
  setTimeout(() => caretImBlick(feld, true), 420);
});
document.addEventListener('selectionchange', () => {
  const a = document.activeElement;
  if (a && a.isContentEditable && !a.closest('.schreibraum')) caretNachziehen(false);
});
window.addEventListener('scroll', seiteFesthalten, { passive: true });
if (window.visualViewport) {
  /* Tastatur auf oder zu: der Cursor muss wieder ins Bild. */
  window.visualViewport.addEventListener('resize', () => {
    seiteFesthalten();
    setTimeout(() => caretImBlick(document.activeElement, true), 80);
  });
  window.visualViewport.addEventListener('scroll', seiteFesthalten);
}
