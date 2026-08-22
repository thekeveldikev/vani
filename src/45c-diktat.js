/* ===================== 45c — DIKTAT: DIE FEDER, DIE HÖRT =====================
   Sprechen statt tippen. Safari auf dem iPad (seit 14.5) und Chrome bringen die
   Spracherkennung mit (`webkitSpeechRecognition`); der Text fließt an die
   Schreibstelle — in Textfelder wie in formatierte Seiten. Satzzeichen per
   Stimme („Punkt", „Komma", „neue Zeile"), Pausen werden Absätze. Nichts
   davon verlässt das Gerät anders als durch die Erkennung des Systems. */

function diktatMoeglich() { return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition); }

/* Gesprochene Satzzeichen in Zeichen verwandeln. Pur. */
const DIKTAT_ZEICHEN = [
  [/\s*\b(punkt)\b/gi, '.'], [/\s*\b(komma)\b/gi, ','], [/\s*\b(fragezeichen)\b/gi, '?'], [/\s*\b(ausrufezeichen)\b/gi, '!'],
  [/\s*\b(doppelpunkt)\b/gi, ':'], [/\s*\b(semikolon|strichpunkt)\b/gi, ';'], [/\s*\b(gedankenstrich)\b/gi, ' —'],
  [/\s*\b(anführungszeichen auf|anführungszeichen unten)\b/gi, ' „'], [/\s*\b(anführungszeichen zu|anführungszeichen oben)\b/gi, '“'],
  [/\s*\b(neuer absatz|absatz)\b\s*/gi, '\n\n'], [/\s*\b(neue zeile|zeilenumbruch)\b\s*/gi, '\n']
];
function diktatSaeubern(text) {
  let t = ' ' + String(text || '').trim();
  for (const [rx, e] of DIKTAT_ZEICHEN) t = t.replace(rx, e);
  t = t.replace(/\s+([.,!?:;])/g, '$1').replace(/([.!?])\s*\n/g, '$1\n').replace(/ {2,}/g, ' ').trim();
  /* Nach Satzende groß weiter */
  t = t.replace(/([.!?]\s+|\n\n)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
  t = t.replace(/^(\p{Ll})/u, (m) => m.toUpperCase());
  return t;
}

let _diktat = null;
/* Text an der Schreibstelle einfügen — Textarea oder contenteditable. */
function diktatEinfuegen(ziel, text) {
  if (!ziel || !text) return;
  if (ziel.tagName === 'TEXTAREA' || ziel.tagName === 'INPUT') {
    const a = ziel.selectionStart == null ? ziel.value.length : ziel.selectionStart, b = ziel.selectionEnd == null ? a : ziel.selectionEnd;
    const vorher = ziel.value.slice(0, a), nachher = ziel.value.slice(b);
    const luft = vorher && !/\s$/.test(vorher) && !/^\n/.test(text) ? ' ' : '';
    ziel.value = vorher + luft + text + nachher;
    const pos = (vorher + luft + text).length; ziel.setSelectionRange(pos, pos);
    ziel.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  if (ziel.isContentEditable) {
    ziel.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !ziel.contains(sel.anchorNode)) { const r = document.createRange(); r.selectNodeContents(ziel); r.collapse(false); sel.removeAllRanges(); sel.addRange(r); }
    const teile = text.split('\n');
    teile.forEach((t, i) => { if (i) document.execCommand('insertParagraph'); if (t) document.execCommand('insertText', false, (i === 0 ? ' ' : '') + t); });
    ziel.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
function diktatStopp() {
  if (!_diktat) return;
  const d = _diktat; _diktat = null;
  try { d.erk.stop(); } catch (e) {}
  if (d.knopf) { d.knopf.classList.remove('an', 'hoert'); d.knopf.title = 'Diktat: sprechen statt tippen'; }
  document.body.classList.remove('diktiert');
  if (d.zwischen && d.zwischen.isConnected) d.zwischen.remove();
  toast('Diktat beendet.' + (d.woerter ? ' ' + d.woerter + ' Wörter gehört.' : ''), 2400);
}
/* Start/Stopp am Knopf. `zielHolen` liefert das Feld, in das geschrieben wird. */
function diktatUmschalten(knopf, zielHolen) {
  if (_diktat) { diktatStopp(); return; }
  if (!diktatMoeglich()) { toast('Dieses Gerät kennt kein Diktat (keine Spracherkennung im Browser).', 3600); return; }
  const Erk = window.SpeechRecognition || window.webkitSpeechRecognition;
  const erk = new Erk();
  erk.lang = 'de-DE'; erk.continuous = true; erk.interimResults = true; erk.maxAlternatives = 1;
  const zwischen = el('div', { class: 'diktat-zwischen' }, el('i'), el('span', {}, 'Ich höre …'));
  const d = _diktat = { erk, knopf, zwischen, woerter: 0, letzteEnde: 0 };
  erk.onresult = (ev) => {
    let fertig = '', vorlaeufig = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) fertig += r[0].transcript + ' '; else vorlaeufig += r[0].transcript; }
    if (vorlaeufig) zwischen.lastElementChild.textContent = vorlaeufig.slice(-80);
    if (fertig.trim()) {
      const ziel = zielHolen();
      let text = diktatSaeubern(fertig);
      /* Eine lange Pause macht einen Absatz */
      const jetzt = Date.now(); if (d.letzteEnde && jetzt - d.letzteEnde > 4000 && !/^\n/.test(text)) text = '\n\n' + text; d.letzteEnde = jetzt;
      d.woerter += worte(text);
      diktatEinfuegen(ziel, text);
      zwischen.lastElementChild.textContent = 'Ich höre …';
    }
  };
  erk.onerror = (ev) => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { toast('Das Mikrofon ist nicht erlaubt — in den Geräteeinstellungen freigeben.', 4200); diktatStopp(); } else if (ev.error === 'no-speech') { /* still weiter */ } else { toast('Diktat unterbrochen (' + ev.error + ').'); diktatStopp(); } };
  erk.onend = () => { if (_diktat === d) { try { erk.start(); } catch (e) { diktatStopp(); } } };
  try { erk.start(); } catch (e) { toast('Das Diktat ließ sich nicht starten.'); _diktat = null; return; }
  knopf.classList.add('an', 'hoert'); knopf.title = 'Diktat läuft — tippen beendet es';
  document.body.classList.add('diktiert');
  document.body.append(zwischen);
  toast('Diktat läuft. Sag „Punkt", „Komma", „neuer Absatz". Tipp auf das Mikrofon beendet es.', 4200);
}
/* Der Knopf für Kopfleisten (Schreibraum). Ohne Spracherkennung bleibt er weg. */
function diktatKnopf(zielHolen) {
  if (!diktatMoeglich()) return null;
  const k = el('button', { class: 'rundknopf zart diktat-knopf', html: ik('mikro'), title: 'Diktat: sprechen statt tippen' });
  k.addEventListener('click', () => diktatUmschalten(k, zielHolen));
  return k;
}
