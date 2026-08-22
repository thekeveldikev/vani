/* ===================== 45d — DIE TEXTLUPE, DIE KLANGKARTE, DIE PAUSE =====================
   Textlupe: ein Blick auf den eigenen Text wie ein freundlicher Lektor —
   Wiederholungen, Füll- und Verstärkerwörter, Satzlängen als Rhythmus.
   Nie Schule, immer Angebot. Klangkarte: ein Text merkt sich, welche
   Mischung beim Schreiben lief, und schlägt sie beim Öffnen wieder vor.
   Pause: nach vierzig Minuten eine leise Erinnerung — keine Sirene. */

const LUPE_FUELL = ['sehr', 'wirklich', 'eigentlich', 'irgendwie', 'ziemlich', 'plötzlich', 'total', 'absolut', 'einfach', 'halt', 'quasi', 'sozusagen', 'natürlich', 'offensichtlich', 'tatsächlich', 'durchaus', 'gewissermaßen', 'letztendlich', 'letztlich', 'irgendwo', 'irgendwas', 'etwas', 'ganz', 'echt', 'voll', 'mega', 'extrem', 'unglaublich', 'wahnsinnig', 'genau', 'eben'];
const LUPE_STOPP = new Set(['und', 'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines', 'in', 'im', 'an', 'am', 'auf', 'aus', 'zu', 'zum', 'zur', 'mit', 'von', 'vom', 'für', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mich', 'mir', 'dich', 'dir', 'sich', 'ihm', 'ihn', 'uns', 'euch', 'ihnen', 'ihrer', 'ihre', 'ihren', 'sein', 'seine', 'seinen', 'seiner', 'mein', 'meine', 'dein', 'deine', 'ist', 'war', 'waren', 'bin', 'bist', 'sind', 'hat', 'hatte', 'hatten', 'haben', 'wird', 'wurde', 'werden', 'nicht', 'kein', 'keine', 'auch', 'noch', 'nur', 'so', 'wie', 'als', 'dass', 'ob', 'wenn', 'denn', 'aber', 'oder', 'doch', 'dann', 'da', 'hier', 'dort', 'was', 'wer', 'wo', 'man', 'schon', 'mehr', 'sehr', 'über', 'unter', 'vor', 'nach', 'bei', 'bis', 'durch', 'um', 'ohne', 'gegen', 'den', 'dem', 'des', 'je', 'ja', 'nein', 'nun', 'also', 'mal', 'etwas', 'alles', 'nichts', 'viel', 'wieder', 'immer', 'nie', 'jetzt', 'heute', 'dieser', 'diese', 'dieses', 'jener', 'jene', 'sei', 'würde', 'könnte', 'kann', 'konnte', 'muss', 'musste', 'soll', 'sollte', 'will', 'wollte', 'darf', 'durfte', 'mag', 'mochte', 'habe', 'hab', 'ihr', 'hast', 'ganz', 'weil', 'seit', 'während', 'zwischen', 'hinter', 'neben', 'worden', 'gewesen', 'einmal', 'sagte', 'sagt', 'sage']);
/* Die Lupe: Wiederholungen (Wörter ≥ 4 Zeichen, keine Stoppwörter), Füllwörter,
   Satzlängen, Absätze. Pur. */
function textLupe(text) {
  const t = String(text || '');
  const woerterListe = t.toLowerCase().replace(/[„“”"»«'’\-–—…]/g, ' ').match(/[a-zäöüß]+/g) || [];
  const zaehl = new Map();
  for (const w of woerterListe) { if (w.length < 4 || LUPE_STOPP.has(w)) continue; zaehl.set(w, (zaehl.get(w) || 0) + 1); }
  const wiederholungen = [...zaehl.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([wort, n]) => ({ wort, n }));
  const fuell = LUPE_FUELL.map((f) => ({ wort: f, n: woerterListe.filter((w) => w === f).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 10);
  const saetze = (t.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || []).map((s) => s.trim()).filter((s) => s.length > 1);
  const laengen = saetze.map((s) => (s.match(/[a-zäöüß]+/gi) || []).length).filter((n) => n > 0);
  const mittel = laengen.length ? laengen.reduce((a, b) => a + b, 0) / laengen.length : 0;
  const laengster = laengen.length ? Math.max(...laengen) : 0;
  const kuerzester = laengen.length ? Math.min(...laengen) : 0;
  const absaetze = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
  /* Wie abwechslungsreich der Rhythmus ist: Streuung der Satzlängen, 0 = gleichförmig, 1 = sehr bewegt */
  const streuung = laengen.length > 1 ? Math.min(1, Math.sqrt(laengen.reduce((s, n) => s + (n - mittel) ** 2, 0) / laengen.length) / Math.max(1, mittel)) : 0;
  const gesamt = woerterListe.length;
  const fuellAnteil = gesamt ? fuell.reduce((s, f) => s + f.n, 0) / gesamt : 0;
  return { woerter: gesamt, saetze: laengen.length, absaetze, mittel: Math.round(mittel * 10) / 10, laengster, kuerzester, streuung: Math.round(streuung * 100) / 100, wiederholungen, fuell, fuellAnteil: Math.round(fuellAnteil * 1000) / 10, laengen };
}
/* Ein Lesebogen, in dem die Wiederholungen und Füllwörter markiert sind. */
function zeigeTextlupe(doc, text) {
  const t = text != null ? text : (doc.text || '');
  const lupe = textLupe(t);
  const markiert = (() => {
    const rep = new Set(lupe.wiederholungen.map((w) => w.wort)), fu = new Set(lupe.fuell.map((w) => w.wort));
    return esc(t).replace(/[A-Za-zÄÖÜäöüß]+/g, (w) => { const k = w.toLowerCase(); if (rep.has(k)) return '<mark class="lupe-wdh">' + w + '</mark>'; if (fu.has(k)) return '<mark class="lupe-fuell">' + w + '</mark>'; return w; }).replace(/\n/g, '<br>');
  })();
  const rhythmus = el('div', { class: 'lupe-rhythmus', title: 'Satzlängen der Reihe nach — jede Linie ein Satz' }, ...lupe.laengen.slice(0, 160).map((n) => el('i', { style: 'height:' + Math.min(56, 4 + n * 1.6) + 'px' })));
  const zahl = (z, l) => el('div', { class: 'lupe-zahl' }, el('b', {}, String(z)), el('span', {}, l));
  const sagen = lupe.saetze ? (lupe.streuung < .25 ? 'Die Sätze sind alle ähnlich lang — ein kurzer dazwischen wäre ein Hammer.' : lupe.streuung > .6 ? 'Der Rhythmus ist lebendig: lange und kurze Sätze wechseln.' : 'Ein ruhiger Rhythmus mit ein paar Ausschlägen.') : '';
  const kasten = el('div', { class: 'modal lupe-fenster' }, el('h2', {}, 'Die Textlupe'),
    el('div', { class: 'lupe-zahlen' }, zahl(lupe.woerter, 'Wörter'), zahl(lupe.saetze, 'Sätze'), zahl(lupe.mittel, 'Wörter je Satz'), zahl(lupe.laengster, 'längster'), zahl(lupe.absaetze, 'Absätze'), zahl(lupe.fuellAnteil + ' %', 'Füllwörter')),
    el('div', { class: 'lupe-titel' }, 'Rhythmus'), rhythmus, el('div', { class: 'lupe-hinweis' }, sagen),
    lupe.wiederholungen.length ? el('div', { class: 'lupe-titel' }, 'Wörter, die oft kommen') : null,
    lupe.wiederholungen.length ? el('div', { class: 'lupe-chips' }, ...lupe.wiederholungen.map((w) => el('span', { class: 'suchchip' }, w.wort + ' · ' + w.n))) : null,
    lupe.fuell.length ? el('div', { class: 'lupe-titel' }, 'Füll- und Verstärkerwörter') : null,
    lupe.fuell.length ? el('div', { class: 'lupe-chips' }, ...lupe.fuell.map((w) => el('span', { class: 'suchchip fuell' }, w.wort + ' · ' + w.n))) : null,
    el('div', { class: 'lupe-hinweis' }, 'Nur ein Blick, kein Urteil. King würde die Adverbien zählen, Kästner die Adjektive — du entscheidest, was bleibt.'),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: () => { zu(); const bogen = el('div', { class: 'lesebogen' }, el('div', { class: 'innen' }, el('h1', {}, doc && doc.titel ? doc.titel : 'Unter der Lupe'), el('div', { class: 'lmeta' }, 'Wiederholungen gelb, Füllwörter rosa'), el('div', { class: 'lesetext', html: markiert }))); const leiste = el('div', { class: 'schwebeleiste' }, el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Schließen', onclick: () => { bogen.remove(); leiste.remove(); } })); document.body.append(bogen, leiste); } }, 'Im Text markieren'), el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}

/* ----- Klangkarte: welche Mischung lief, als der Text entstand ----- */
function klangkarteMerken(doc) {
  if (!doc) return;
  const m = D.einst.ambience || {};
  const an = Object.keys(m).filter((k) => m[k] > 0);
  if (!an.length) return;
  const karte = {}; for (const k of an.slice(0, 8)) karte[k] = Math.round(m[k] * 100) / 100;
  const alt = JSON.stringify(doc.klang || {});
  if (alt !== JSON.stringify(karte)) { doc.klang = karte; }
}
function klangkarteName(karte) {
  const ids = Object.keys(karte || {}).sort((a, b) => karte[b] - karte[a]).slice(0, 2);
  return ids.map((id) => { const a = typeof ambienceFinde === 'function' ? ambienceFinde(id) : null; return a ? a.name : id; }).join(' und ');
}
/* Beim Öffnen: liegt eine Klangkarte am Text und spielt gerade nichts, bieten wir sie an. */
function klangkarteAnbieten(doc) {
  if (!doc || !doc.klang || !Object.keys(doc.klang).length) return;
  const m = D.einst.ambience || {};
  if (Object.values(m).some((v) => v > 0)) return;
  if (typeof toastMitAktion !== 'function' || typeof ambienceMischungAnwenden !== 'function') return;
  toastMitAktion('Damals lief: ' + klangkarteName(doc.klang) + '.', 'Wieder an', async () => { try { await audioFreigeben(); await ambienceMischungAnwenden({ ...doc.klang }); } catch (e) {} }, 6000);
}

/* ----- Die Pause: nach vierzig Minuten am Stück ein leises Wort ----- */
let _pauseTimer = null;
function pauseErinnerungStart() {
  clearTimeout(_pauseTimer);
  if (D.einst.pausenErinnerung === false) return;
  _pauseTimer = setTimeout(() => {
    if (typeof _sr === 'undefined' || !_sr) return;
    toast('Vierzig Minuten. Aufstehen, Fenster, ein Schluck Wasser — der Text wartet.', 6000);
    _pauseTimer = setTimeout(() => { if (typeof _sr !== 'undefined' && _sr) toast('Noch einmal vierzig. Die Schultern runter.', 5000); }, 40 * 60000);
  }, 40 * 60000);
}
function pauseErinnerungStopp() { clearTimeout(_pauseTimer); _pauseTimer = null; }
