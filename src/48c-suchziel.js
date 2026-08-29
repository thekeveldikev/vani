/* ===================== 48c — DIE SUCHE LANDET AUF DER STELLE =====================
   Die Suche hat bisher gefunden und geöffnet — und dann stand man oben im
   Text. In einem Blatt von zehn Zeilen fällt das nicht auf. In einer Szene
   von vier Seiten schon: man sucht ein Wort, VANI zeigt es sogar im Umfeld,
   man tippt darauf — und muss es danach von Hand noch einmal suchen.

   Genau das ist der Grund, warum sich die Suche „in Szenen“ nicht wie eine
   Suche anfühlt. Szenen sind die langen Texte. Bei den kurzen war das Loch
   nur nie zu sehen.

   Hier wird gemerkt, mit welchem Wort gesucht wurde. Beim Öffnen springt der
   Text an die Stelle, rückt sie in die Mitte und markiert sie für ein paar
   Sekunden. Danach ist der Zettel verbraucht: wer denselben Text später
   normal öffnet, landet wieder da, wo er aufgehört hat.

   Zwei Dinge, die hier wichtig sind und nicht offensichtlich:

   · Gesucht wird auf der *normalisierten* Fassung (Groß/klein, Umlaute,
     ß → ss), gefunden werden muss aber die Stelle im *echten* Text. Weil
     „ß“ zu zwei Zeichen wird, stimmen die Zählungen nicht überein. Deshalb
     wird Zeichen für Zeichen eine Karte mitgeführt.
   · Im Fließtext wird nichts eingefügt, um zu markieren. Ein <mark> im
     contenteditable würde beim nächsten Speichern im Dokument landen und
     bliebe für immer drin. Markiert wird über die Highlight-API des
     Browsers oder, wo es die nicht gibt, über die Auswahl. */

/* ----- Die Stelle finden: pur, und mit einer Karte zurück in den Originaltext ----- */
function suchKarte(text) {
  const roh = String(text || '');
  let norm = '';
  const karte = [];
  for (let i = 0; i < roh.length; i++) {
    const n = normalisiere(roh[i]);
    for (let j = 0; j < n.length; j++) { norm += n[j]; karte.push(i); }
  }
  return { norm, karte };
}
/* Wo steht das Wort im echten Text? { von, bis } oder null. */
function suchStelle(text, wort, abPosition = 0) {
  const q = normalisiere(String(wort || '').trim());
  if (!q) return null;
  const { norm, karte } = suchKarte(text);
  /* abPosition zählt im Originaltext — für die Karte umrechnen. */
  let ab = 0;
  while (ab < karte.length && karte[ab] < abPosition) ab++;
  const i = norm.indexOf(q, ab);
  if (i < 0) return null;
  const von = karte[i];
  const bis = i + q.length < karte.length ? karte[i + q.length] : String(text || '').length;
  return { von, bis: Math.max(von + 1, bis) };
}

/* ----- Der Zettel: „öffne diesen Text und geh zu diesem Wort“ -----
   Absichtlich flüchtig. Er gilt für ein Dokument, für ein paar Sekunden,
   und ist nach dem ersten Anspringen weg. */
let _suchZiel = null;
function suchZielMerken(id, wort, jetzt = Date.now()) {
  const w = String(wort || '').trim();
  if (!id || w.length < 2) { _suchZiel = null; return null; }
  _suchZiel = { id: String(id), wort: w.slice(0, 200), zeit: jetzt };
  return _suchZiel;
}
/* Holen heißt verbrauchen. */
function suchZielHolen(id, jetzt = Date.now()) {
  const z = _suchZiel;
  if (!z || z.id !== String(id)) return null;
  _suchZiel = null;
  /* Ein alter Zettel gehört zu einem anderen Weg — der zählt nicht mehr. */
  return jetzt - z.zeit > 20000 ? null : z.wort;
}
function suchZielVergessen() { _suchZiel = null; }

/* ----- Markieren, ohne den Text anzufassen ----- */
function suchFundMarkieren(bereich) {
  try {
    if (typeof Highlight === 'function' && typeof CSS !== 'undefined' && CSS.highlights) {
      CSS.highlights.set('vani-fund', new Highlight(bereich.cloneRange()));
      setTimeout(() => { try { CSS.highlights.delete('vani-fund'); } catch (e) {} }, 4500);
      return true;
    }
  } catch (e) {}
  /* Ohne die API bleibt die Auswahl — die sieht man auch. */
  try {
    const aus = window.getSelection();
    aus.removeAllRanges(); aus.addRange(bereich);
    return true;
  } catch (e) {}
  return false;
}

/* Die Stelle in die Mitte rücken — nicht an den oberen Rand.
   Kein scrollIntoView: das scrollt auch alle Eltern mit und reißt auf dem
   iPad die ganze Seite herum. Hier wird genau ein Bereich gescrollt. */
function suchInDieMitte(rolle, obenImBild) {
  if (!rolle) return;
  const r = rolle.getBoundingClientRect();
  const ziel = rolle.scrollTop + (obenImBild - r.top) - Math.max(60, r.height * 0.38);
  const wohin = Math.max(0, Math.min(ziel, rolle.scrollHeight - rolle.clientHeight));
  try { rolle.scrollTo({ top: wohin, behavior: 'smooth' }); }
  catch (e) { rolle.scrollTop = wohin; }
}

/* ----- Im Fließtext (Szenen und alles andere mit Formatierung) -----
   Gesucht wird über die echten Textknoten, nicht über doc.text: die reine
   Textfassung setzt an Absatzgrenzen Zeilenumbrüche ein, die es im DOM gar
   nicht gibt — die Zählung würde um jeden Absatz verrutschen. */
function richBereichFuer(wurzel, wort) {
  if (!wurzel || typeof document === 'undefined' || !document.createTreeWalker) return null;
  const lauf = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, null);
  const knoten = [];
  let text = '', k;
  while ((k = lauf.nextNode())) { knoten.push({ k, ab: text.length }); text += k.data; }
  const stelle = suchStelle(text, wort);
  if (!stelle) return null;
  const finde = (pos) => {
    for (let i = knoten.length - 1; i >= 0; i--) {
      if (knoten[i].ab <= pos) return { k: knoten[i].k, o: Math.max(0, Math.min(pos - knoten[i].ab, knoten[i].k.data.length)) };
    }
    return knoten.length ? { k: knoten[0].k, o: 0 } : null;
  };
  const a = finde(stelle.von), b = finde(stelle.bis);
  if (!a || !b) return null;
  try {
    const r = document.createRange();
    r.setStart(a.k, a.o); r.setEnd(b.k, b.o);
    return r;
  } catch (e) { return null; }
}

/* ----- Im einfachen Text: über einen Spiegel messen -----
   Ein <textarea> verrät nicht, auf welcher Höhe ein Zeichen steht. Also wird
   eine unsichtbare Kopie mit denselben Maßen gebaut, der Text bis zur Stelle
   hineingelegt und die Höhe der Marke abgelesen. Die Kopie wird sofort wieder
   weggeräumt — sie ist nur ein Lineal. */
function textStelleHoehe(feld, von) {
  try {
    const stil = getComputedStyle(feld);
    const lineal = document.createElement('div');
    lineal.setAttribute('aria-hidden', 'true');
    lineal.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;white-space:pre-wrap;word-wrap:break-word;top:0;left:0;';
    for (const eigenschaft of ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'padding', 'border', 'boxSizing', 'textIndent']) {
      lineal.style[eigenschaft] = stil[eigenschaft];
    }
    lineal.style.width = feld.clientWidth + 'px';
    const marke = document.createElement('span');
    marke.textContent = '​';
    lineal.textContent = String(feld.value || '').slice(0, von);
    lineal.appendChild(marke);
    (feld.parentNode || document.body).appendChild(lineal);
    const hoehe = marke.offsetTop;
    lineal.remove();
    return hoehe;
  } catch (e) { return null; }
}

/* ----- Der eine Aufruf, den der Schreibraum macht ----- */
function suchZielAnspringen(doc, feld, istRich, rolle) {
  if (!doc || !feld) return false;
  const wort = suchZielHolen(doc.id);
  if (!wort) return false;
  /* Nicht sofort: der Raum baut sich gerade erst auf, Höhen stimmen noch
     nicht. Kein requestAnimationFrame — der steht still, wenn das Fenster
     verdeckt ist, und dann spränge nie jemand irgendwohin. */
  setTimeout(() => {
    if (!feld.isConnected) return;
    try {
      if (istRich) {
        const bereich = richBereichFuer(feld, wort);
        if (!bereich) { toast('„' + wort + '“ steht nicht mehr in diesem Text.'); return; }
        const r = bereich.getBoundingClientRect();
        suchInDieMitte(rolle, r.top);
        suchFundMarkieren(bereich);
      } else {
        const stelle = suchStelle(feld.value || '', wort);
        if (!stelle) { toast('„' + wort + '“ steht nicht mehr in diesem Text.'); return; }
        const hoehe = textStelleHoehe(feld, stelle.von);
        if (hoehe != null) suchInDieMitte(rolle, feld.getBoundingClientRect().top + hoehe);
        /* Der Cursor sitzt danach an der Fundstelle — wer weiterschreiben
           will, ist schon da. Ohne focus(): sonst springt auf dem iPad die
           Tastatur hoch und schiebt genau das weg, was man sehen wollte. */
        try { feld.setSelectionRange(stelle.von, stelle.bis); } catch (e) {}
      }
    } catch (e) {}
  }, 260);
  return true;
}
