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
function diktatStopp(still) {
  if (!_diktat) return;
  const d = _diktat; _diktat = null;
  /* Erst die Rueckrufe abhaengen, sonst wirft onend das Diktat wieder an. */
  try { d.erk.onend = null; d.erk.onerror = null; d.erk.onresult = null; d.erk.onstart = null; } catch (e) {}
  try { d.erk.stop(); } catch (e) {}
  try { d.erk.abort(); } catch (e) {}
  if (d.knopf) { d.knopf.classList.remove('an', 'hoert'); d.knopf.title = 'Diktat: sprechen statt tippen'; }
  document.body.classList.remove('diktiert');
  if (d.zwischen && d.zwischen.isConnected) d.zwischen.remove();
  if (!still) toast('Diktat beendet.' + (d.woerter ? ' ' + d.woerter + ' Wörter gehört.' : ''), 2400);
}
/* Auf iPhone und iPad hoert die Erkennung nach jedem Satz von selbst auf:
   `continuous` wird dort nicht beachtet, und mit `continuous = true` liefert
   Safari ausserdem bei jedem Ergebnis den ganzen bisherigen Text noch einmal —
   dann steht alles doppelt im Blatt. Deshalb dort: kurze Sitzungen, die VANI
   selbst wieder anwirft. */
function diktatIstApfel() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
}

/* Start/Stopp am Knopf. `zielHolen` liefert das Feld, in das geschrieben wird. */
function diktatUmschalten(knopf, zielHolen) {
  if (_diktat) { diktatStopp(); return; }
  if (!diktatMoeglich()) {
    toast('Dieser Browser kennt keine Spracherkennung. Auf dem iPad geht es trotzdem: das Mikrofon unten rechts auf der Bildschirmtastatur diktiert in jedes Feld.', 7000);
    return;
  }
  const Erk = window.SpeechRecognition || window.webkitSpeechRecognition;
  const apfel = diktatIstApfel();
  let erk;
  try { erk = new Erk(); } catch (e) { toast('Die Spracherkennung ließ sich nicht anlegen.'); return; }
  erk.lang = 'de-DE';
  erk.continuous = !apfel;
  erk.interimResults = true;
  erk.maxAlternatives = 1;
  const zwischen = el('div', { class: 'diktat-zwischen' }, el('i'), el('span', {}, 'Ich höre …'));
  const d = _diktat = { erk, knopf, zwischen, woerter: 0, letzteEnde: 0, gehoert: 0, neustarts: 0, zuletztGestartet: 0, laeuft: false };

  /* Jede Sitzung faengt bei Ergebnis 0 an. Was schon eingefuegt wurde, wird
     nicht noch einmal eingefuegt — sonst steht der Satz doppelt da. */
  let verbraucht = 0;
  erk.onstart = () => { d.laeuft = true; verbraucht = 0; d.zuletztGestartet = Date.now(); };
  erk.onresult = (ev) => {
    let fertig = '', vorlaeufig = '';
    for (let i = 0; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) { if (i >= verbraucht) { fertig += r[0].transcript + ' '; verbraucht = i + 1; } }
      else vorlaeufig += r[0].transcript;
    }
    if (vorlaeufig) zwischen.lastElementChild.textContent = vorlaeufig.slice(-80);
    if (fertig.trim()) {
      const ziel = zielHolen();
      if (!ziel) { toast('Kein Feld zum Hineinschreiben — stell den Cursor in den Text.', 3600); return; }
      let text = diktatSaeubern(fertig);
      /* Eine lange Pause macht einen Absatz */
      const jetzt = Date.now();
      if (d.letzteEnde && jetzt - d.letzteEnde > 4000 && !/^\n/.test(text)) text = '\n\n' + text;
      d.letzteEnde = jetzt;
      d.woerter += worte(text);
      d.gehoert++;
      d.neustarts = 0;   /* es kommt ja etwas an */
      diktatEinfuegen(ziel, text);
      zwischen.lastElementChild.textContent = 'Ich höre …';
    }
  };
  erk.onerror = (ev) => {
    const f = ev && ev.error;
    if (f === 'not-allowed' || f === 'service-not-allowed') {
      toast('Das Mikrofon ist nicht freigegeben. Auf dem iPad: Einstellungen › Safari › Mikrofon — und beim Nachfragen „Erlauben".', 7000);
      diktatStopp(true);
    } else if (f === 'no-speech' || f === 'aborted') {
      /* Ganz normal: es war nur still. Weiter geht es über onend. */
    } else if (f === 'network') {
      toast('Die Spracherkennung braucht gerade das Netz und kommt nicht durch.', 5000);
      diktatStopp(true);
    } else {
      toast('Diktat unterbrochen (' + f + ').', 4000);
      diktatStopp(true);
    }
  };
  erk.onend = () => {
    d.laeuft = false;
    if (_diktat !== d) return;
    /* Wieder anwerfen — aber nicht in einer Schleife, wenn nie etwas ankommt. */
    const kurz = Date.now() - d.zuletztGestartet < 900;
    d.neustarts = kurz ? d.neustarts + 1 : 0;
    if (d.neustarts > 6) {
      toast(d.gehoert
        ? 'Das Diktat hat sich verabschiedet. Tipp noch einmal aufs Mikrofon.'
        : 'Die Spracherkennung startet immer wieder neu, ohne etwas zu hören. Prüf die Mikrofon-Freigabe — auf dem iPad geht auch das Mikrofon auf der Bildschirmtastatur.', 7000);
      diktatStopp(true);
      return;
    }
    setTimeout(() => {
      if (_diktat !== d) return;
      try { erk.start(); } catch (e) { /* schon am Laufen: nicht schlimm */ }
    }, apfel ? 260 : 120);
  };
  try { erk.start(); } catch (e) {
    toast('Das Diktat ließ sich nicht starten. Vielleicht läuft schon eines.');
    _diktat = null; return;
  }
  knopf.classList.add('an', 'hoert'); knopf.title = 'Diktat läuft — tippen beendet es';
  document.body.classList.add('diktiert');
  document.body.append(zwischen);
  toast('Diktat läuft. Sag „Punkt", „Komma", „neuer Absatz". Tipp auf das Mikrofon beendet es.', 4600);
}
/* Der Knopf für Kopfleisten (Schreibraum). Er bleibt auch da, wenn der Browser
   keine Spracherkennung hat — sonst sucht man ihn und findet nichts. Beim
   Tippen erklaert er dann, wo das Diktat des Geraets sitzt. */
function diktatKnopf(zielHolen) {
  const kann = diktatMoeglich();
  const k = el('button', {
    class: 'rundknopf zart diktat-knopf' + (kann ? '' : ' kannnicht'), html: ik('mikro'),
    title: kann ? 'Diktat: sprechen statt tippen' : 'Diktat: dieser Browser kann es nicht — das Mikrofon der Bildschirmtastatur schon'
  });
  k.addEventListener('click', () => diktatUmschalten(k, zielHolen));
  return k;
}
