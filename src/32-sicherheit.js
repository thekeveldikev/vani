/* ===================== 32 — DAS SICHERHEITSNETZ =====================
   Damit nie etwas verlorengeht — und damit man das auch sieht.

   Vier Netze, eines unter dem anderen:

   1. Der Hauptspeicher (IndexedDB). Jedes Speichern läuft ab jetzt über
      `sicherSpeichern`: schlägt es fehl, wird es dreimal wiederholt, mit
      wachsender Pause. Erst dann wird es sichtbar gemeldet — vorher nicht,
      damit nichts unnötig beunruhigt.
   2. Die Rettungskopie (localStorage). Während des Schreibens liegt der
      aktuelle Text zusätzlich in einem winzigen zweiten Speicher, den der
      Browser anders behandelt. Selbst wenn die Datenbank kaputtgeht oder das
      Gerät mitten im Satz abstürzt, ist der Text beim nächsten Start da.
   3. Der Absturzfang. Jeder unerwartete Fehler schreibt zuerst die
      Rettungskopie, landet dann in einem Protokoll und wird ruhig gemeldet.
      Die App läuft weiter.
   4. Die Wochensicherung. Einmal pro Woche legt VANI still eine vollständige
      Kopie aller Texte neben die Daten — und erinnert daran, sie als Datei
      aus dem Haus zu tragen.

   Dazu die Anzeige: `speicherZustand()` sagt jederzeit, ob alles drin ist. */

const RETTUNG_SCHLUESSEL = 'vani-rettung';
const PROTOKOLL_SCHLUESSEL = 'vani-protokoll';
const SICHERUNG_SCHLUESSEL = 'sicherung-auto';
const SICHERUNG_ABSTAND = 7 * 86400000;   /* eine Woche */

/* ----- 1. Speichern, das nicht aufgibt ----- */
let _speicher = { offen: 0, zuletzt: 0, fehler: 0, letzterFehler: '', gemeldet: false };
const _speicherHorcher = new Set();
function speicherZustand() {
  return {
    offen: _speicher.offen, zuletzt: _speicher.zuletzt, fehler: _speicher.fehler,
    letzterFehler: _speicher.letzterFehler,
    art: _speicher.fehler ? 'fehler' : _speicher.offen ? 'schreibt' : _speicher.zuletzt ? 'gesichert' : 'still'
  };
}
function speicherHorchen(fn) { _speicherHorcher.add(fn); return () => _speicherHorcher.delete(fn); }
function speicherMelden() { for (const fn of [..._speicherHorcher]) { try { fn(speicherZustand()); } catch (e) {} } }
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/* Speichern mit drei Anläufen. Gibt true zurück, wenn es geklappt hat. */
async function sicherSpeichern(store, wert, key, { versuche = 3 } = {}) {
  _speicher.offen++; speicherMelden();
  let letzter = null;
  for (let i = 0; i < versuche; i++) {
    try {
      await dbPut(store, wert, key);
      _speicher.offen = Math.max(0, _speicher.offen - 1);
      _speicher.zuletzt = Date.now();
      if (_speicher.fehler) { _speicher.fehler = 0; _speicher.letzterFehler = ''; _speicher.gemeldet = false; }
      speicherMelden();
      return true;
    } catch (e) {
      letzter = e;
      if (i < versuche - 1) await warte(250 * Math.pow(3, i));   /* 250 ms, 750 ms */
    }
  }
  _speicher.offen = Math.max(0, _speicher.offen - 1);
  _speicher.fehler++;
  _speicher.letzterFehler = (letzter && (letzter.name + ': ' + letzter.message)) || 'unbekannt';
  protokollSchreiben('speichern', _speicher.letzterFehler, { store, key: key || (wert && wert.id) });
  speicherMelden();
  /* Nur einmal melden, nicht bei jedem Anschlag — und immer mit einem Ausweg. */
  if (!_speicher.gemeldet) {
    _speicher.gemeldet = true;
    try {
      toast('Der Hauptspeicher zickt gerade. Dein Text liegt in der Rettungskopie und geht nicht verloren — schau in den Feinheiten unter „Alles sicher“.', 9000);
    } catch (e) {}
  }
  return false;
}

/* ----- 2. Die Rettungskopie ----- */
function rettungSchreiben(docId, titel, text, html) {
  if (text == null) return false;
  const basis = {
    docId: String(docId || ''), titel: String(titel || '').slice(0, 200),
    text: String(text).slice(0, 400000), wann: Date.now()
  };
  /* Formatierte Texte leben in doc.rich. Ohne das HTML kaeme der Satz zwar
     zurueck, aber nackt - und im Heft gar nicht an. */
  const voll = html && String(html).length <= 600000
    ? Object.assign({ html: String(html) }, basis) : basis;
  try { localStorage.setItem(RETTUNG_SCHLUESSEL, JSON.stringify(voll)); return true; }
  catch (e) {
    /* Kein Platz fuer die Formatierung? Dann wenigstens der Text. */
    try { localStorage.setItem(RETTUNG_SCHLUESSEL, JSON.stringify(basis)); return true; } catch (x) { return false; }
  }
}

/* Was aus der Rettungskopie wohin gehoert. Formatierte Texte stehen in
   doc.rich, schlichte in doc.text - wird das verwechselt, kommt der Satz
   scheinbar zurueck und ist im Heft trotzdem nicht zu sehen. */
function rettungEinsetzen(doc, rettung) {
  if (!doc || !rettung) return false;
  if (doc.format !== 'rich') { doc.text = rettung.text; return true; }
  let html = null;
  if (rettung.html && typeof sauberesRichHTML === 'function') html = sauberesRichHTML(rettung.html);
  else if (typeof richAusText === 'function') html = richAusText(rettung.text);
  if (html == null) { doc.text = rettung.text; return true; }
  doc.rich = html;
  doc.text = typeof richReinerText === 'function'
    ? richReinerText(html).replace(/\n{3,}/g, '\n\n').trimEnd() : rettung.text;
  return true;
}
function rettungLesen() {
  try {
    const roh = localStorage.getItem(RETTUNG_SCHLUESSEL);
    if (!roh) return null;
    const r = JSON.parse(roh);
    return r && typeof r.text === 'string' ? r : null;
  } catch (e) { return null; }
}
function rettungLoeschen() { try { localStorage.removeItem(RETTUNG_SCHLUESSEL); } catch (e) {} }

/* Beim Start nachsehen: liegt in der Rettungskopie etwas, das im Hauptspeicher fehlt? */
function rettungPruefen() {
  const r = rettungLesen();
  if (!r || !r.text.trim()) return null;
  const doc = r.docId ? D.docs.get(r.docId) : null;
  /* Alles in Ordnung: der Text steht schon so im Hauptspeicher */
  if (doc && String(doc.text || '').trim() === r.text.trim()) { rettungLoeschen(); return null; }
  /* Auch in Ordnung: der Hauptspeicher ist neuer (woanders weitergeschrieben) */
  if (doc && (doc.geaendert || 0) > r.wann + 2000 && String(doc.text || '').length >= r.text.length) { rettungLoeschen(); return null; }
  return { rettung: r, doc };
}
/* Was gefunden wurde, ruhig anbieten. */
function rettungAnbieten() {
  const fund = rettungPruefen();
  if (!fund) return false;
  const { rettung, doc } = fund;
  const wieVielMehr = doc ? rettung.text.length - String(doc.text || '').length : rettung.text.length;
  const kasten = el('div', { class: 'modal rettung-fenster' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('schild') || ik('haken') }), 'GERETTET'),
    el('h2', {}, 'Da war noch etwas.'),
    el('p', { class: 'rettung-text' }, 'Beim letzten Mal wurde VANI mitten im Schreiben unterbrochen. Der Text lag in der Rettungskopie und ist noch da — ' +
      (doc ? 'er gehört zu „' + (doc.titel || rettung.titel || 'einem Text') + '“' : 'ein neuer Text') + ', von ' + fmtZeit(rettung.wann) + ' Uhr' +
      (wieVielMehr > 0 ? ', mit ' + wieVielMehr + ' Zeichen mehr als gespeichert' : '') + '.'),
    el('div', { class: 'rettung-probe' }, rettung.text.trim().slice(-500)),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { rettungLoeschen(); zu(); toast('Gut — dann war schon alles drin.'); } }, 'Alles schon da'),
      el('button', { class: 'knopf', onclick: async () => {
        const b = blattAusText('Gerettet · ' + fmtDatum(rettung.wann), rettung.text);
        rettungLoeschen(); zu(); toast('Liegt als eigenes Blatt bei den Blättern.', 4000);
        if (typeof oeffneSchreibraum === 'function') setTimeout(() => oeffneSchreibraum(b.id), 120);
      } }, 'Als neues Blatt sichern'),
      doc ? el('button', { class: 'knopf voll', onclick: async () => {
        /* Der alte Stand bleibt als Version erhalten — nichts wird überschrieben, ohne dass es einen Weg zurück gibt. */
        try { if (typeof standEinfrieren === 'function') standEinfrieren(doc, 'vor der Rettung'); } catch (e) {}
        rettungEinsetzen(doc, rettung); await sicherSpeichern('docs', doc); speichere(doc);
        rettungLoeschen(); zu(); toast('Zurückgeholt. Der Stand von vorher liegt als Version daneben.', 5000);
        if (typeof oeffneSchreibraum === 'function') setTimeout(() => oeffneSchreibraum(doc.id), 120);
      } }, 'In den Text zurückholen') : null));
  const zu = zeigeDeck(kasten);
  return true;
}

/* ----- 3. Der Absturzfang ----- */
function protokollSchreiben(art, text, mehr) {
  try {
    const liste = protokollLesen();
    liste.push({ wann: Date.now(), art: String(art || '').slice(0, 40), text: String(text || '').slice(0, 400), mehr: mehr ? JSON.stringify(mehr).slice(0, 300) : '' });
    localStorage.setItem(PROTOKOLL_SCHLUESSEL, JSON.stringify(liste.slice(-40)));
  } catch (e) {}
}
function protokollLesen() {
  try { const r = JSON.parse(localStorage.getItem(PROTOKOLL_SCHLUESSEL) || '[]'); return Array.isArray(r) ? r : []; } catch (e) { return []; }
}
function protokollLoeschen() { try { localStorage.removeItem(PROTOKOLL_SCHLUESSEL); } catch (e) {} }

let _absturzGemeldet = 0;
function absturzFangen(art, nachricht, quelle) {
  /* Zuerst retten, dann reden. */
  try { if (typeof spueleAlles === 'function') spueleAlles(); } catch (e) {}
  try {
    if (typeof _sr !== 'undefined' && _sr && _sr.doc) {
      const feld = document.querySelector('.sr-text');
      const text = feld ? (feld.value != null ? feld.value : feld.textContent) : _sr.doc.text;
      rettungSchreiben(_sr.doc.id, _sr.doc.titel, text, feld && feld.value == null ? feld.innerHTML : null);
    }
  } catch (e) {}
  protokollSchreiben(art, nachricht, quelle);
  /* Höchstens einmal pro Minute etwas sagen — und nie dramatisch. */
  if (Date.now() - _absturzGemeldet > 60000) {
    _absturzGemeldet = Date.now();
    try { toast('Da hat sich etwas verschluckt. Dein Text ist gesichert — du kannst weiterschreiben.', 6000); } catch (e) {}
  }
}
function absturzfangEinrichten() {
  window.addEventListener('error', (e) => {
    if (e && e.target && e.target !== window && e.target.tagName) return;   /* Bild/Script konnte nicht laden: nicht der Rede wert */
    absturzFangen('fehler', (e && e.message) || 'unbekannt', { datei: (e && e.filename || '').split('/').pop(), zeile: e && e.lineno });
  });
  window.addEventListener('unhandledrejection', (e) => {
    const g = e && e.reason;
    absturzFangen('versprechen', (g && (g.message || String(g))) || 'unbekannt', null);
  });
}

/* ----- 4. Die Wochensicherung ----- */
async function sicherungAutoStand() {
  try { const s = await dbGet('kv', SICHERUNG_SCHLUESSEL); return s && s.wann ? s : null; } catch (e) { return null; }
}
async function sicherungAutoFaellig() {
  const s = await sicherungAutoStand();
  return !s || Date.now() - s.wann > SICHERUNG_ABSTAND;
}
/* Still eine vollständige Kopie neben die Daten legen (ohne Medien: klein und schnell). */
async function sicherungAutoAnlegen() {
  if (typeof baueSicherungsPaket !== 'function') return null;
  try {
    const paket = await baueSicherungsPaket({ mitMedien: false });
    const eintrag = { wann: Date.now(), texte: (paket.docs || []).length, paket };
    await sicherSpeichern('kv', eintrag, SICHERUNG_SCHLUESSEL);
    return eintrag;
  } catch (e) { protokollSchreiben('sicherung', (e && e.message) || 'unbekannt'); return null; }
}
/* Beim Start, in Ruhe, wenn nichts anderes zu tun ist. */
function sicherungAutoPruefen() {
  setTimeout(async () => {
    try { if (await sicherungAutoFaellig()) await sicherungAutoAnlegen(); } catch (e) {}
  }, 6000);
}

/* ----- Der Platz auf dem Gerät ----- */
async function speicherPlatz() {
  try {
    if (!navigator.storage || !navigator.storage.estimate) return null;
    const s = await navigator.storage.estimate();
    const belegt = s.usage || 0, frei = s.quota || 0;
    return { belegt, gesamt: frei, anteil: frei ? belegt / frei : 0, dauerhaft: navigator.storage.persisted ? await navigator.storage.persisted() : null };
  } catch (e) { return null; }
}
function bytesLesbar(n) {
  if (!Number.isFinite(n)) return '—';
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
  if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
  return (n / 1073741824).toFixed(2) + ' GB';
}

/* ----- Alles einschalten ----- */
function sicherheitStarten() {
  absturzfangEinrichten();
  sicherungAutoPruefen();
  /* Die Rettungskopie erst zeigen, wenn die App steht */
  setTimeout(() => { try { rettungAnbieten(); } catch (e) {} }, 1500);
  /* Beim Verlassen: Rettungskopie auf den neuesten Stand bringen */
  const merken = () => {
    try {
      if (typeof _sr !== 'undefined' && _sr && _sr.doc) {
        const feld = document.querySelector('.sr-text');
        const text = feld ? (feld.value != null ? feld.value : feld.textContent) : null;
        if (text != null) rettungSchreiben(_sr.doc.id, _sr.doc.titel, text, feld.value != null ? null : feld.innerHTML);
      }
    } catch (e) {}
  };
  window.addEventListener('pagehide', merken);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') merken(); });
}

/* ----- Die Anzeige: ein ruhiger Punkt, der sagt, dass alles drin ist ----- */
function speicherAnzeige() {
  const punkt = el('i', { class: 'sp-punkt' });
  const wort = el('span', { class: 'sp-wort' }, 'gesichert');
  const kasten = el('button', {
    class: 'speicheranzeige', type: 'button',
    title: 'Wie es um das Speichern steht',
    onclick: () => { if (typeof zeigeSicherheit === 'function') zeigeSicherheit(); }
  }, punkt, wort);
  let ausblendTimer = 0;
  let warVerbunden = false;
  const zeigen = (z) => {
    /* Ist die Anzeige aus dem Bild verschwunden, meldet sie sich ab —
       sonst sammeln sich bei jedem Öffnen des Schreibraums tote Horcher an. */
    if (!kasten.isConnected) { if (warVerbunden) { clearTimeout(ausblendTimer); loesen(); } return; }
    warVerbunden = true;
    kasten.dataset.art = z.art;
    clearTimeout(ausblendTimer);
    if (z.art === 'schreibt') { wort.textContent = 'speichert …'; kasten.classList.add('sichtbar'); }
    else if (z.art === 'fehler') { wort.textContent = 'in der Rettungskopie'; kasten.classList.add('sichtbar'); }
    else if (z.art === 'gesichert') {
      wort.textContent = 'gesichert';
      kasten.classList.add('sichtbar');
      /* Nach ein paar Sekunden verblasst der Text, der Punkt bleibt — beruhigend, nicht nervig. */
      ausblendTimer = setTimeout(() => kasten.classList.remove('sichtbar'), 2600);
    } else { wort.textContent = ''; kasten.classList.remove('sichtbar'); }
  };
  const loesen = speicherHorchen(zeigen);
  zeigen(speicherZustand());
  kasten._loesen = loesen;
  return kasten;
}

/* ----- Das Fenster „Alles sicher“ ----- */
async function zeigeSicherheit() {
  const z = speicherZustand();
  const platz = await speicherPlatz();
  const sich = await sicherungAutoStand();
  const prot = protokollLesen();
  const texte = [...D.docs.values()].filter((d) => !d.geloescht).length;
  const woerter = [...D.docs.values()].reduce((n, d) => n + worte(d.text || ''), 0);
  const zeile = (name, wert, art) => el('div', { class: 'sicher-zeile' + (art ? ' ' + art : '') }, el('span', {}, name), el('b', {}, wert));
  const kasten = el('div', { class: 'modal sicher-fenster' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('schild') || ik('haken') }), 'ALLES SICHER'),
    el('h2', {}, z.art === 'fehler' ? 'Der Hauptspeicher hakt — dein Text ist trotzdem da.' : 'Alles ist gespeichert.'),
    el('p', { class: 'sicher-erklaerung' }, z.art === 'fehler'
      ? 'Das Speichern in der Datenbank ist gerade fehlgeschlagen. Deine Texte liegen in der Rettungskopie und beim nächsten Start hole ich sie zurück. Am besten legst du jetzt eine Sicherungsdatei an.'
      : 'VANI speichert beim Tippen von selbst — spätestens eine halbe Sekunde nach dem letzten Anschlag, und immer beim Verlassen der App. Vier Netze liegen untereinander.'),
    el('div', { class: 'sicher-liste' },
      zeile('Texte', texte.toLocaleString('de-DE')),
      zeile('Wörter insgesamt', woerter.toLocaleString('de-DE')),
      zeile('Zuletzt gespeichert', z.zuletzt ? vorZeit(z.zuletzt) : 'noch nichts in dieser Sitzung'),
      zeile('Speicher hakt', z.fehler ? z.fehler + '× — Rettungskopie greift' : 'nein', z.fehler ? 'warn' : 'gut'),
      zeile('Wochensicherung', sich ? fmtDatum(sich.wann) + ', ' + sich.texte + ' Texte' : 'wird gleich angelegt'),
      platz ? zeile('Platz belegt', bytesLesbar(platz.belegt) + (platz.gesamt ? ' von ' + bytesLesbar(platz.gesamt) : ''), platz.anteil > .9 ? 'warn' : 'gut') : null,
      platz ? zeile('Dauerspeicher', platz.dauerhaft === true ? 'ja — nichts wird weggeräumt' : platz.dauerhaft === false ? 'nicht bestätigt' : 'unbekannt', platz.dauerhaft === true ? 'gut' : '') : null),
    platz && platz.dauerhaft === false ? el('button', { class: 'knopf zart', style: 'justify-self:start', onclick: async () => {
      try {
        const ok = navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false;
        toast(ok ? 'Der Browser hat den Dauerspeicher zugesagt: hier wird nichts mehr weggeräumt.' : 'Der Browser sagt: noch nicht. Auf dem iPad hilft es, VANI zum Home-Bildschirm hinzuzufügen — dann wird es zugesagt.', 7000);
      } catch (e) { toast('Das ging gerade nicht.'); }
    } }, 'Dauerspeicher anfordern') : null,
    el('div', { class: 'sicher-netze' },
      el('div', { class: 'sicher-netz' }, el('b', {}, '1 · Hauptspeicher'), el('span', {}, 'Jedes Speichern wird bei einem Fehler dreimal wiederholt.')),
      el('div', { class: 'sicher-netz' }, el('b', {}, '2 · Rettungskopie'), el('span', {}, 'Beim Schreiben liegt der Text zusätzlich in einem zweiten Speicher.')),
      el('div', { class: 'sicher-netz' }, el('b', {}, '3 · Absturzfang'), el('span', {}, 'Jeder unerwartete Fehler sichert zuerst den Text, dann wird er notiert.')),
      el('div', { class: 'sicher-netz' }, el('b', {}, '4 · Wochensicherung'), el('span', {}, 'Einmal pro Woche legt VANI still eine vollständige Kopie an.'))),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: async () => { const e = await sicherungAutoAnlegen(); toast(e ? 'Kopie angelegt: ' + e.texte + ' Texte.' : 'Das hat gerade nicht geklappt.'); } }, 'Jetzt still sichern'),
      el('button', { class: 'knopf voll', onclick: () => { zu(); if (typeof sichereAlles === 'function') sichereAlles(); else location.hash = '#/feinheiten'; } }, 'Sicherungsdatei anlegen')),
    prot.length ? el('details', { class: 'sicher-protokoll' },
      el('summary', {}, 'Was zuletzt gehakt hat (' + prot.length + ')'),
      ...prot.slice(-8).reverse().map((p) => el('div', { class: 'sicher-protokollzeile' }, el('small', {}, fmtDatum(p.wann) + ' ' + fmtZeit(p.wann) + ' · ' + p.art), el('span', {}, p.text))),
      el('button', { class: 'knopf zart', style: 'margin-top:8px', onclick: (ev) => { protokollLoeschen(); ev.currentTarget.closest('details').remove(); toast('Protokoll geleert.'); } }, 'Protokoll leeren')) : null);
  const zu = zeigeDeck(kasten);
}
