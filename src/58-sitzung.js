/* ===================== 58 — DIE SITZUNG ALS RITUAL, UND DER WORT-VERGLEICH =====================
   „Sitzung beginnen": ein Griff, der alles zusammen tut — Dauer und Wortziel
   wählen, Klangbild an, ein Rat von der Wand, dann die Kerze im Schreibraum.
   Am Ende die Bilanz: Wörter, Minuten, ein Satz als Fundstück, ein Lob in der
   Stimme der Wand. Dazu: zwei Stände vergleichen, Wort für Wort (eigener Diff,
   pur und getestet). */

const SITZUNG_DAUERN = [[10, 'Zehn Minuten — ein Atemzug'], [20, 'Zwanzig Minuten — eine Kerze'], [45, 'Fünfundvierzig — eine richtige Sitzung'], [0, 'Ohne Uhr']];
const SITZUNG_KLANG = [['still', 'Still'], ['tisch', 'Schreibtisch bei Nacht'], ['garten', 'Der Nachtgarten'], ['behalten', 'Wie gerade']];
let _sitzung = null;

/* Ein Satz als Fundstück: der längste vollständige Satz aus dem, was neu dazukam. Pur. */
function sitzungFundsatz(vorher, nachher) {
  const a = String(vorher || ''), b = String(nachher || '');
  const neu = b.startsWith(a) ? b.slice(a.length) : b;
  const saetze = neu.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+["“”»«)]?/g) || [];
  const sauber = saetze.map((s) => s.trim()).filter((s) => s.length >= 24 && s.length <= 320);
  if (!sauber.length) return '';
  return sauber.sort((x, y) => y.length - x.length)[0];
}

/* Wort-Diff zweier Texte (LCS auf Wörtern, für Schreibtexte bis ein paar tausend Wörter
   schnell genug). Ergebnis: Liste aus {art: 'gleich'|'neu'|'weg', text}. Pur. */
function wortDiff(alt, neu, grenze = 6000) {
  const A = String(alt || '').split(/(\s+)/).filter((s) => s.length), B = String(neu || '').split(/(\s+)/).filter((s) => s.length);
  if (A.length * B.length > grenze * grenze) {
    /* Zu groß für die Matrix: nur Anfang und Ende vergleichen */
    let v = 0; while (v < A.length && v < B.length && A[v] === B[v]) v++;
    let h = 0; while (h < A.length - v && h < B.length - v && A[A.length - 1 - h] === B[B.length - 1 - h]) h++;
    const aus = [];
    if (v) aus.push({ art: 'gleich', text: A.slice(0, v).join('') });
    if (A.length - v - h > 0) aus.push({ art: 'weg', text: A.slice(v, A.length - h).join('') });
    if (B.length - v - h > 0) aus.push({ art: 'neu', text: B.slice(v, B.length - h).join('') });
    if (h) aus.push({ art: 'gleich', text: A.slice(A.length - h).join('') });
    return aus;
  }
  const n = A.length, m = B.length;
  const L = new Uint32Array((n + 1) * (m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i * (m + 1) + j] = A[i] === B[j] ? L[(i + 1) * (m + 1) + j + 1] + 1 : Math.max(L[(i + 1) * (m + 1) + j], L[i * (m + 1) + j + 1]);
  const aus = []; let i = 0, j = 0;
  const schiebe = (art, text) => { const l = aus[aus.length - 1]; if (l && l.art === art) l.text += text; else aus.push({ art, text }); };
  while (i < n && j < m) {
    if (A[i] === B[j]) { schiebe('gleich', A[i]); i++; j++; }
    else if (L[(i + 1) * (m + 1) + j] >= L[i * (m + 1) + j + 1]) { schiebe('weg', A[i]); i++; }
    else { schiebe('neu', B[j]); j++; }
  }
  while (i < n) { schiebe('weg', A[i]); i++; }
  while (j < m) { schiebe('neu', B[j]); j++; }
  /* Reiner Leerraum, der gewandert ist, zählt nicht */
  return aus.filter((t) => !(t.art !== 'gleich' && !t.text.trim()));
}
function wortDiffBilanz(diff) {
  const z = (art) => diff.filter((t) => t.art === art).reduce((s, t) => s + worte(t.text), 0);
  return { neu: z('neu'), weg: z('weg') };
}
function wortDiffElement(diff) {
  const wrap = el('div', { class: 'wortdiff' });
  for (const t of diff) wrap.append(el(t.art === 'gleich' ? 'span' : t.art === 'neu' ? 'ins' : 'del', {}, t.text));
  return wrap;
}
/* Zwei Stände (oder Stand und Jetzt) nebeneinander ansehen. */
function staendeVergleichen(doc, stand, jetztText) {
  const diff = wortDiff(stand.text, jetztText);
  const b = wortDiffBilanz(diff);
  const bogen = el('div', { class: 'lesebogen' }, el('div', { class: 'innen' },
    el('h1', {}, 'Was sich verändert hat'),
    el('div', { class: 'lmeta' }, 'Stand vom ' + fmtDatum(stand.wann) + ', ' + fmtZeit(stand.wann) + (stand.auto ? ' (automatisch)' : '') + ' → jetzt · ' + b.neu + ' Wörter dazu, ' + b.weg + ' weg'),
    el('div', { class: 'lesetext' }, wortDiffElement(diff))));
  const leiste = el('div', { class: 'schwebeleiste' }, el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Vergleich schließen', onclick: () => { bogen.remove(); leiste.remove(); } }));
  document.body.append(bogen, leiste);
}

/* ----- Die Sitzung ----- */
function sitzungBeginnen(vorgabe = {}) {
  const e = Object.assign({ minuten: 20, ziel: D.einst.tagesziel ? Math.min(D.einst.tagesziel, 500) : 300, klang: 'behalten', rat: true, kerze: true, woran: 'neu' }, D.einst.sitzung || {}, vorgabe);
  const letzte = typeof schreibtischLetzteTexte === 'function' ? schreibtischLetzteTexte(3) : [];
  const wahl = (liste, lies, setze) => { const g = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' }); for (const [id, n] of liste) g.append(el('button', { class: lies() === id ? 'an' : '', onclick: (ev) => { setze(id); $$('button', g).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); } }, n)); return g; };
  const ziel = el('input', { type: 'text', inputmode: 'numeric', value: String(e.ziel || ''), placeholder: 'Wörter' });
  const ratVorschau = el('div', { class: 'sitzung-rat' });
  const ratNeu = () => { if (typeof SALON_FEST === 'undefined') { ratVorschau.textContent = ''; return; } const a = SALON_FEST[Math.floor(Math.random() * SALON_FEST.length)]; const r = salonRat(a, Math.floor(Math.random() * 1e9)); ratVorschau.innerHTML = ''; ratVorschau.append(el('i', {}, r ? r.text : ''), el('small', {}, a.name + ' · erfunden, in seinem Geist')); ratVorschau.dataset.wer = a.id; };
  ratNeu();
  const schalter = (lies, setze) => el('button', { class: 'schalter' + (lies() ? ' an' : ''), onclick: (ev) => { setze(!lies()); ev.currentTarget.classList.toggle('an', lies()); } }, el('i'));
  const zeile = (name, inhalt) => el('div', { class: 'einstellgruppe' }, el('b', {}, name), inhalt);
  const kasten = el('div', { class: 'modal sitzung-fenster' }, el('h2', {}, 'Sitzung beginnen'),
    zeile('Wie lange', wahl(SITZUNG_DAUERN, () => e.minuten, (v) => { e.minuten = v; })),
    zeile('Wortziel für diese Sitzung', ziel),
    zeile('Woran', wahl([['neu', 'Ein neues Blatt'], ...letzte.map((d) => [d.id, (d.titel || (d.text || '').slice(0, 24) || 'Ohne Titel').slice(0, 30)])], () => e.woran, (v) => { e.woran = v; })),
    zeile('Klang', wahl(SITZUNG_KLANG, () => e.klang, (v) => { e.klang = v; })),
    el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, 'Kerze anzünden'), schalter(() => e.kerze, (v) => { e.kerze = v; })),
    el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, 'Ein Rat von der Wand'), schalter(() => e.rat, (v) => { e.rat = v; ratVorschau.style.display = v ? '' : 'none'; })),
    ratVorschau, el('button', { class: 'knopf zart', style: 'margin-top:4px', onclick: ratNeu }, 'Anderer Rat'),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Nicht jetzt'),
      el('button', { class: 'knopf voll', onclick: async () => {
        e.ziel = parseInt(ziel.value, 10) || 0;
        D.einst.sitzung = { minuten: e.minuten, ziel: e.ziel, klang: e.klang, rat: e.rat, kerze: e.kerze, woran: 'neu' }; speichereEinst();
        zu();
        await sitzungStarten(e, ratVorschau.querySelector('i') ? ratVorschau.querySelector('i').textContent : '');
      } }, 'Los')));
  const zu = zeigeDeck(kasten);
}
async function sitzungStarten(e, ratText) {
  try {
    if (e.klang === 'tisch' && typeof schreibtischKlangbild === 'function') { const m = D.einst.ambience || {}; if (!(m.uhr > 0 && m.wind > 0)) await schreibtischKlangbild(); }
    else if (e.klang === 'garten' && typeof nachtgartenKlang === 'function') { const m = D.einst.ambience || {}; if (!((m.grillen_fern || 0) > 0)) await nachtgartenKlang(); }
    else if (e.klang === 'still' && typeof ambienceMischungAnwenden === 'function') { await ambienceMischungAnwenden({}); }
  } catch (x) {}
  let doc = e.woran && e.woran !== 'neu' ? D.docs.get(e.woran) : null;
  if (!doc) doc = blattAusText('', e.rat && ratText ? '„' + ratText + '“\n\n' : '');
  _sitzung = { start: Date.now(), docId: doc.id, textVorher: doc.text || '', ziel: e.ziel || 0, minuten: e.minuten, worteVorher: worte(doc.text || ''), mitKerze: !!(e.kerze && e.minuten) };
  oeffneSchreibraum(doc.id);
  if (_sitzung.mitKerze && typeof starteSprint === 'function') setTimeout(() => starteSprint(e.minuten), 450);
  else if (e.minuten) setTimeout(() => { if (_sitzung) { _sitzung.uhr = setTimeout(() => sitzungBilanz(false), e.minuten * 60000); } }, 0);
  toast('Die Sitzung läuft.' + (e.ziel ? ' Ziel: ' + e.ziel + ' Wörter.' : ''), 3000);
}
/* Die Bilanz am Ende — von der Kerze (beendeSprint) oder von der Uhr gerufen. */
function sitzungBilanz(abgebrochen) {
  if (!_sitzung) return false;
  const s = _sitzung; _sitzung = null; clearTimeout(s.uhr);
  const doc = D.docs.get(s.docId);
  const jetzt = doc ? (typeof _sr !== 'undefined' && _sr && _sr.doc === doc && typeof srAktuellerText === 'function' ? srAktuellerText() : (doc.text || '')) : '';
  const geschrieben = Math.max(0, worte(jetzt) - s.worteVorher);
  const min = Math.max(1, Math.round((Date.now() - s.start) / 60000));
  const fund = sitzungFundsatz(s.textVorher, jetzt);
  const zielErreicht = s.ziel > 0 && geschrieben >= s.ziel;
  let lob = '';
  try { if (typeof SALON_FEST !== 'undefined') { const a = SALON_FEST[salonHash(String(s.start)) % SALON_FEST.length]; const r = salonRat(a, s.start, geschrieben < 50 ? 'routine' : 'ende'); lob = r ? r.text + ' — ' + a.name : ''; } } catch (x) {}
  const kasten = el('div', { class: 'modal sitzung-bilanz' }, el('h2', {}, abgebrochen ? 'Sitzung beendet' : 'Die Sitzung ist um'),
    el('div', { class: 'sitzung-zahlen' }, el('div', {}, el('b', {}, String(geschrieben)), el('span', {}, geschrieben === 1 ? 'Wort' : 'Wörter')), el('div', {}, el('b', {}, String(min)), el('span', {}, min === 1 ? 'Minute' : 'Minuten')), s.ziel ? el('div', {}, el('b', {}, zielErreicht ? '✓' : Math.round(geschrieben / s.ziel * 100) + ' %'), el('span', {}, 'vom Ziel')) : null),
    fund ? el('div', { class: 'sitzung-fund' }, el('span', { class: 'st-ueber' }, 'Ein Satz von heute'), el('i', {}, '„' + fund + '“'), el('button', { class: 'knopf zart', onclick: () => { neuDoc('schnipsel', { text: fund }); toast('Liegt in den Schnipseln.'); } }, 'Als Fundstück behalten')) : null,
    lob ? el('div', { class: 'sitzung-lob' }, lob) : null,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: () => { zu(); sitzungBeginnen({ woran: s.docId }); } }, 'Noch eine Sitzung'), el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut so')));
  const zu = zeigeDeck(kasten);
  return true;
}
