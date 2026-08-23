/* ================================================================
   VANI — Karteikarten: Wortkisten abfragen.

   Eine Wortkiste ist fast schon ein Karteikasten: vorn das Wort, hinten die
   Notiz. „Abfragen“ zeigt die Vorderseite, ein Tipp dreht die Karte, dann
   „Gewusst“ oder „Nochmal“. Was man verfehlt, kommt öfter; was man sicher
   weiß, seltener — eine leichte Form des Karteikasten-Prinzips, ohne Zwang und
   ohne Kalender. Wer mag, fragt rückwärts (Notiz → Wort). Stand und Zähler
   liegen am Wort selbst und reisen über Sicherung und Sync mit.
   ================================================================ */

/* Reihenfolge fürs Abfragen, pur: Verfehltes und lange nicht Gefragtes nach
   vorn, sicher Gewusstes nach hinten, mit etwas Zufall, damit es nicht jedes
   Mal dieselbe Reihe ist. */
function karteikartenReihenfolge(woerter, zufall = Math.random, jetzt = Date.now()) {
  const liste = (woerter || []).filter((w) => w && (w.text || '').trim());
  const gewicht = (w) => {
    const g = Number(w.gewusst) || 0, v = Number(w.verfehlt) || 0;
    const tage = w.abgefragt ? Math.min(60, (jetzt - w.abgefragt) / 86400000) : 60;
    /* Verfehlt zählt doppelt, Zeit seit der letzten Abfrage ein wenig, nie gefragt ganz vorn. */
    return (v * 2 - g) + tage / 20 + zufall() * 1.5;
  };
  return liste.map((w) => ({ w, g: gewicht(w) })).sort((a, b) => b.g - a.g).map((x) => x.w);
}

/* Zusammenfassung nach einer Runde: wie viele, wie sicher. Pur. */
function karteikartenBilanz(ergebnisse) {
  const e = ergebnisse || [];
  const gewusst = e.filter((x) => x === true).length;
  const nochmal = e.filter((x) => x === false).length;
  const quote = e.length ? Math.round(gewusst / e.length * 100) : 0;
  const wort = !e.length ? 'Nichts abgefragt.'
    : quote === 100 ? 'Alles gewusst. Die Kiste sitzt.'
    : quote >= 75 ? 'Fast alles sitzt — ' + nochmal + ' noch einmal.'
    : quote >= 40 ? 'Die Hälfte sitzt, der Rest kommt wieder.'
    : 'Das meiste kommt wieder. Gut, dass es Karten gibt.';
  return { gewusst, nochmal, quote, wort };
}

/* Die Abfrage als Fenster. kistenId: 'alle', 'lose' oder eine Kiste. */
function wortkisteAbfragen(kistenId, titel) {
  const alle = woerterInKiste(kistenId);
  const mitNotiz = alle.filter((w) => (w.notiz || '').trim());
  if (alle.length < 2) { toast('Zum Abfragen braucht es mindestens zwei Wörter.'); return Promise.resolve(null); }
  return new Promise((res) => {
    let rueckwaerts = false, nurMitNotiz = mitNotiz.length >= 2;
    let karten = [], nr = 0, umgedreht = false, ergebnisse = [], fertig = false;
    const bau = () => { karten = karteikartenReihenfolge(nurMitNotiz ? mitNotiz : alle); nr = 0; umgedreht = false; ergebnisse = []; zeige(); };
    const zaehler = el('div', { class: 'kk-zaehler' });
    const karte = el('button', { class: 'kk-karte', 'aria-live': 'polite' });
    const vorn = el('div', { class: 'kk-seite kk-vorn' });
    const hinten = el('div', { class: 'kk-seite kk-hinten' });
    karte.append(el('div', { class: 'kk-innen' }, vorn, hinten));
    const gewusst = el('button', { class: 'knopf voll', onclick: () => bewerte(true) }, '✓ Gewusst');
    const nochmal = el('button', { class: 'knopf', onclick: () => bewerte(false) }, '↻ Nochmal');
    const drehen = el('button', { class: 'knopf zart', onclick: () => { umgedreht = !umgedreht; karte.classList.toggle('umgedreht', umgedreht); } }, 'Umdrehen');
    const bilanzFeld = el('div', { class: 'kk-bilanz' });
    const richtungKnopf = el('button', { class: 'knopf zart klein', onclick: () => { rueckwaerts = !rueckwaerts; richtungKnopf.textContent = rueckwaerts ? 'Rückwärts: Notiz → Wort' : 'Vorwärts: Wort → Notiz'; bau(); } }, 'Vorwärts: Wort → Notiz');
    const notizKnopf = el('button', { class: 'knopf zart klein', onclick: () => { nurMitNotiz = !nurMitNotiz; notizKnopf.textContent = nurMitNotiz ? 'Nur Karten mit Notiz' : 'Alle Karten'; bau(); } }, nurMitNotiz ? 'Nur Karten mit Notiz' : 'Alle Karten');
    if (mitNotiz.length < 2) notizKnopf.style.display = 'none';

    const zeige = () => {
      const w = karten[nr];
      karte.classList.remove('umgedreht'); umgedreht = false;
      if (!w) { schluss(); return; }
      const a = rueckwaerts ? (w.notiz || '—') : w.text;
      const b = rueckwaerts ? w.text : (w.notiz || 'Noch keine Notiz — hinten wäre Platz für Bedeutung, Synonym, Beispielsatz.');
      vorn.textContent = a; hinten.textContent = b;
      zaehler.textContent = (nr + 1) + ' von ' + karten.length + (w.verfehlt ? ' · ' + w.verfehlt + '× verfehlt' : '') + (w.gewusst ? ' · ' + w.gewusst + '× gewusst' : '');
      bilanzFeld.textContent = '';
      gewusst.disabled = false; nochmal.disabled = false;
    };
    const bewerte = (ok) => {
      const w = karten[nr]; if (!w) return;
      w.abgefragt = Date.now();
      if (ok) w.gewusst = (Number(w.gewusst) || 0) + 1; else w.verfehlt = (Number(w.verfehlt) || 0) + 1;
      speichereStill(w);
      ergebnisse.push(ok);
      nr++;
      zeige();
    };
    const schluss = () => {
      const b = karteikartenBilanz(ergebnisse);
      vorn.textContent = b.wort; hinten.textContent = b.wort;
      zaehler.textContent = b.gewusst + ' gewusst · ' + b.nochmal + ' nochmal · ' + b.quote + ' %';
      bilanzFeld.textContent = b.nochmal ? 'Die verfehlten kommen beim nächsten Mal zuerst.' : '';
      gewusst.disabled = true; nochmal.disabled = true;
    };
    karte.addEventListener('click', () => { if (karten[nr]) { umgedreht = !umgedreht; karte.classList.toggle('umgedreht', umgedreht); } });
    const tasten = (e) => {
      if (e.key === ' ') { e.preventDefault(); karte.click(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); bewerte(true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); bewerte(false); }
    };
    document.addEventListener('keydown', tasten, true);
    const kasten = el('div', { class: 'modal karteikasten' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'ABFRAGEN · ' + (titel || 'Wortkiste').toUpperCase()),
      zaehler, karte,
      el('div', { class: 'kk-knoepfe' }, nochmal, drehen, gewusst),
      bilanzFeld,
      el('div', { class: 'kk-optionen' }, richtungKnopf, notizKnopf, el('button', { class: 'knopf zart klein', onclick: () => bau() }, 'Neue Runde')),
      el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: () => { fertig = true; zu(); } }, 'Fertig')));
    const zu = zeigeDeck(kasten, () => { document.removeEventListener('keydown', tasten, true); res(ergebnisse); });
    bau();
  });
}
