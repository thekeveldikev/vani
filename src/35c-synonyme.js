/* ===================== 35c — Synonyme offline (5.68) =====================
   Quelle: OpenThesaurus (https://www.openthesaurus.de), GNU LGPL 2.1 —
   siehe synonyme/LIZENZ.txt. Die Daten (4 MB) liegen NEBEN der App und werden
   erst beim ersten Nachschlagen geholt, dann im Geraet behalten (IndexedDB),
   damit nicht jedes Update sie neu laedt. Kein Netz noetig, wenn sie einmal da sind.

   Bedienung, die nicht stoert: Ein Wort markieren (auf dem iPad: lange
   druecken) — dann erscheint UNTER der Markierung ein kleiner Knopf
   „Synonyme“ (oben liegt das iOS-Menue). Antippen zeigt die Gruppen;
   ein Wort antippen ersetzt die Markierung. Abschaltbar im Schreibraum. */

const SYN = { saetze: null, index: null, laedt: null };
const SYN_VERSION = 1;
function synSchluessel(w) { return normalisiere(String(w || '').replace(/\s*\([^)]*\)/g, '').trim()); }
/* Baut aus den Zeilen (Begriffe mit ; getrennt) Saetze und einen Index. Pur. */
function synBaueIndex(text) {
  const saetze = [], index = new Map();
  for (const zeile of String(text || '').split('\n')) {
    if (!zeile || zeile[0] === '#') continue;
    const begriffe = zeile.split(';').map((b) => b.trim()).filter(Boolean);
    if (begriffe.length < 2) continue;
    const nr = saetze.push(begriffe) - 1;
    for (const b of begriffe) {
      const k = synSchluessel(b);
      if (!k || k.length > 60) continue;
      const l = index.get(k);
      if (l) { if (l[l.length - 1] !== nr) l.push(nr); } else index.set(k, [nr]);
    }
  }
  return { saetze, index };
}
async function synLaden() {
  if (SYN.index) return true;
  if (SYN.laedt) return SYN.laedt;
  SYN.laedt = (async () => {
    let text = null;
    try { const gemerkt = await dbGet('kv', 'synonyme'); if (gemerkt && gemerkt.v === SYN_VERSION && typeof gemerkt.text === 'string' && gemerkt.text.length > 100000) text = gemerkt.text; } catch (e) {}
    if (!text) {
      const r = await fetch('synonyme/openthesaurus.txt', { cache: 'no-cache' })   /* nie einen alten Fehler aus dem Browser-Cache nehmen */;
      if (!r.ok) throw new Error('Die Synonyme liegen nicht bei der App.');
      text = await r.text();
      /* Mancher Host liefert fuer Fehlendes die Startseite mit 200 — die darf nicht als Thesaurus gemerkt werden. */
      if (text.length < 100000 || /^\s*</.test(text)) throw new Error('Die Synonyme liegen nicht bei der App.');
      try { await dbPut('kv', { v: SYN_VERSION, text, wann: Date.now() }, 'synonyme'); } catch (e) {}
    }
    const { saetze, index } = synBaueIndex(text);
    SYN.saetze = saetze; SYN.index = index;
    return true;
  })().finally(() => { SYN.laedt = null; });
  return SYN.laedt;
}
/* Gruppen fuer ein Wort, ohne das Wort selbst. Findet auch einfache Beugungen
   („Häusern“ → „Haus“ nicht, aber „Hunde“ → „Hund“, „ging“ nicht). Pur, wenn geladen. */
function synonymeFuer(wort, max = 8) {
  if (!SYN.index) return [];
  const k = synSchluessel(wort);
  let treffer = SYN.index.get(k), stamm = k;
  if (!treffer) for (const ende of SYN_ENDUNGEN) { if (k.length > ende.length + 2 && k.endsWith(ende) && (treffer = SYN.index.get(k.slice(0, -ende.length)))) { stamm = k.slice(0, -ende.length); break; } }
  if (!treffer) return [];
  /* Die Hauptbedeutung zuerst: wo das Wort „(Hauptform)“ ist, dann wo es ohne Zusatz
     steht (nicht „ugs.“, „ermahnend“ …), dann die groesseren Gruppen. */
  const gewicht = (nr) => {
    const eigen = SYN.saetze[nr].filter((b) => synSchluessel(b) === stamm);
    const best = Math.max(0, ...eigen.map((b) => /\(Hauptform\)/.test(b) ? 3 : /\(/.test(b) ? 1 : 2));
    return best * 1000 + SYN.saetze[nr].length;
  };
  return [...treffer].sort((a, b) => gewicht(b) - gewicht(a)).slice(0, max)
    .map((nr) => SYN.saetze[nr].filter((b) => { const s = synSchluessel(b); return s !== k && s !== stamm; })).filter((g) => g.length);
}
/* Einfache Beugungsendungen, laengste zuerst (5.68.2: auch „r“ und „m“ — „müder“, „müdem“). */
const SYN_ENDUNGEN = ['en', 'er', 'es', 'em', 'e', 'n', 'r', 's', 'm'];
/* 5.68.2: Welche Endung hat das Wort ueber seiner Grundform im Thesaurus?
   „gewöhnlicher“ → { stamm: „gewöhnlich“, endung: „er“ }. Pur, wenn geladen. */
function synEndung(wort) {
  if (!SYN.index) return { stamm: synSchluessel(wort), endung: '' };
  const k = synSchluessel(wort);
  if (SYN.index.get(k)) return { stamm: k, endung: '' };
  for (const ende of SYN_ENDUNGEN) if (k.length > ende.length + 2 && k.endsWith(ende) && SYN.index.get(k.slice(0, -ende.length))) return { stamm: k.slice(0, -ende.length), endung: ende };
  return { stamm: k, endung: '' };
}
/* Die Endung auf das Synonym uebertragen — nur bei einem einzelnen klein
   geschriebenen Wort (Adjektiv: „alltäglich“ → „alltäglicher“). Nomen bilden
   ihre Mehrzahl zu unregelmaessig, Wendungen („im Grunde“) bleiben, wie sie sind. */
function synBeugen(rein, beugung) {
  if (!beugung || !beugung.endung) return rein;
  if (!/^[a-zäöüß][\p{L}\-]*$/u.test(rein)) return rein;
  let endung = beugung.endung;
  /* „müden“ steht als „müde“ + „n“: an „schläfrig“ gehoert dann „en“. */
  if (/e$/.test(beugung.stamm) && endung[0] !== 'e' && !/e$/.test(rein)) endung = 'e' + endung;
  /* „müde“ + „er“ → „müder“, nicht „müdeer“. */
  if (/e$/.test(rein) && endung[0] === 'e') endung = endung.slice(1);
  return rein + endung;
}
/* „Großschreibung des Originals übernehmen“: am Satzanfang bleibt es gross. */
function synAnpassen(original, ersatz) {
  const rein = synBeugen(String(ersatz).replace(/\s*\([^)]*\)/g, '').trim(), synEndung(original));
  if (/^[A-ZÄÖÜ]/.test(original) && /^[a-zäöüß]/.test(rein)) {
    /* Nur am Satzanfang hochstellen — ein grosses Original kann auch ein Nomen sein, dann ist das Synonym meist auch gross. */
    return rein.charAt(0).toUpperCase() + rein.slice(1);
  }
  return rein;
}

/* ---------- Der kleine Knopf unter der Markierung ---------- */
let _synPille = null, _synZiel = null;
function synPilleWeg() { if (_synPille) { _synPille.remove(); _synPille = null; } }
function synAnbieten(editor) {
  if (D.einst.synonyme === false) return;
  const sel = window.getSelection && window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed || !editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode)) { synPilleWeg(); return; }
  const wort = sel.toString().trim();
  if (!/^[\p{L}][\p{L}\-’']{1,39}$/u.test(wort)) { synPilleWeg(); return; }
  const bereich = sel.getRangeAt(0).cloneRange();
  const r = bereich.getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return;
  synPilleWeg();
  _synZiel = { editor, bereich, wort };
  _synPille = el('button', { class: 'syn-pille', onpointerdown: (e) => e.preventDefault(), onclick: () => synZeigen() }, el('span', { html: ik('woerter'), style: 'display:flex;width:15px' }), 'Synonyme');
  /* Mit eingeblendeter Tastatur (iPad) zaehlt nur der sichtbare Ausschnitt; passt der Knopf
     nicht darunter, kommt er ueber die Markierung. */
  const vv = window.visualViewport;
  const unten = vv ? vv.offsetTop + vv.height : window.innerHeight;
  const x = Math.min(window.innerWidth - 120, Math.max(8, r.left + r.width / 2 - 52));
  const y = r.bottom + 52 <= unten ? r.bottom + 10 : Math.max(8, r.top - 46);
  _synPille.style.left = x + 'px'; _synPille.style.top = y + 'px';
  document.body.append(_synPille);
}
/* 5.68.2: Der Knopf in der Formatleiste. Auf dem iPad legt sich das eigene
   Menue (Kopieren, Nachschlagen …) ueber die kleine Pille unter der Markierung —
   dann kam man nicht mehr an die Synonyme. Der Knopf nimmt das markierte Wort
   oder, ohne Markierung, das Wort unter dem Cursor. */
function synAusLeiste(editor) {
  const sel = window.getSelection && window.getSelection();
  if (!sel || !sel.rangeCount || !editor.contains(sel.anchorNode)) { toast('Erst ein Wort markieren — oder den Cursor hineinsetzen.', 2600); return; }
  let bereich = sel.getRangeAt(0).cloneRange();
  if (sel.isCollapsed) {
    const knoten = bereich.startContainer;
    if (knoten.nodeType !== 3) { toast('Erst ein Wort markieren — oder den Cursor hineinsetzen.', 2600); return; }
    const t = knoten.data, buchstabe = /[\p{L}\-’']/u;
    let a = bereich.startOffset, b = a;
    while (a > 0 && buchstabe.test(t[a - 1])) a--;
    while (b < t.length && buchstabe.test(t[b])) b++;
    while (a < b && /[\-’']/.test(t[a])) a++;
    while (b > a && /[\-’']/.test(t[b - 1])) b--;
    bereich = document.createRange();
    bereich.setStart(knoten, a); bereich.setEnd(knoten, b);
  }
  const wort = bereich.toString().trim();
  if (!/^[\p{L}][\p{L}\-’']{1,39}$/u.test(wort)) { toast('Erst ein einzelnes Wort markieren — oder den Cursor hineinsetzen.', 2600); return; }
  synPilleWeg();
  _synZiel = { editor, bereich, wort };
  synZeigen();
}
async function synZeigen() {
  const ziel = _synZiel; synPilleWeg();
  if (!ziel) return;
  if (!SYN.index) toast('Die Synonyme werden geholt …', 1600);
  try { await synLaden(); } catch (e) { toast('Die Synonyme sind gerade nicht erreichbar. Einmal mit Netz öffnen — danach gehen sie offline.', 5200); return; }
  const gruppen = synonymeFuer(ziel.wort);
  const beugung = synEndung(ziel.wort);
  const liste = el('div', { class: 'syn-gruppen' });
  if (!gruppen.length) liste.append(el('p', { class: 'leise' }, 'Für „' + ziel.wort + '“ kennt der Thesaurus nichts. Vielleicht in der Grundform?'));
  for (const g of gruppen) {
    liste.append(el('div', { class: 'syn-gruppe' }, g.slice(0, 18).map((b) => {
      const anm = (b.match(/\(([^)]*)\)/) || [])[1];
      return el('button', { class: 'syn-wort', onclick: () => { zu(); synErsetzen(ziel, b); } }, synBeugen(b.replace(/\s*\([^)]*\)/g, '').trim(), beugung), anm ? el('small', {}, anm) : null);
    })));
  }
  const kasten = el('div', { class: 'modal syn-modal' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'SYNONYME'),
    el('h2', {}, ziel.wort), liste,
    el('p', { class: 'syn-quelle' }, 'Aus OpenThesaurus (openthesaurus.de, LGPL) — offline im Gerät.'),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: () => zu() }, 'Schließen')));
  const zu = zeigeDeck(kasten);
}
function synErsetzen(ziel, begriff) {
  const neu = synAnpassen(ziel.wort, begriff);
  const sel = window.getSelection();
  try { ziel.editor.focus({ preventScroll: true }); sel.removeAllRanges(); sel.addRange(ziel.bereich); } catch (e) {}
  /* insertText behaelt die Formatierung drumherum und laesst sich mit Strg+Z zuruecknehmen */
  let ok = false;
  try { ok = document.execCommand('insertText', false, neu); } catch (e) {}
  /* execCommand loest selbst ein input aus; nur der Notweg braucht ein eigenes */
  if (!ok) { try { ziel.bereich.deleteContents(); ziel.bereich.insertNode(document.createTextNode(neu)); } catch (e) { return; } ziel.editor.dispatchEvent(new Event('input', { bubbles: true })); }
  toast('„' + ziel.wort + '“ → „' + neu + '“', 2400);
}
function synonymeBeleben(editor) {
  const pruefen = entprellt(() => { if (editor.isConnected) synAnbieten(editor); else synPilleWeg(); }, 420);
  const beiAuswahl = () => pruefen();
  document.addEventListener('selectionchange', beiAuswahl);
  editor.addEventListener('input', synPilleWeg);
  editor.addEventListener('blur', () => setTimeout(() => { if (_synPille && document.activeElement !== _synPille) synPilleWeg(); }, 200));
  window.addEventListener('scroll', synPilleWeg, { passive: true, capture: true });
  let warVerbunden = editor.isConnected;
  const raus = new MutationObserver(() => { if (editor.isConnected) { warVerbunden = true; return; } if (warVerbunden) { document.removeEventListener('selectionchange', beiAuswahl); window.removeEventListener('scroll', synPilleWeg, { capture: true }); synPilleWeg(); raus.disconnect(); } });
  if (document.body) raus.observe(document.body, { childList: true });
}
