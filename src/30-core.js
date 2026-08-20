'use strict';
/* ================================================================
   VANI — Kern: Helfer, Icons, Datenbank, Modale
   ================================================================ */

const $ = (s, w) => (w || document).querySelector(s);
const $$ = (s, w) => [...(w || document).querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function el(tag, attrs = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const kind of kinder.flat(9)) {
    if (kind == null || kind === false) continue;
    e.append(kind.nodeType ? kind : document.createTextNode(kind));
  }
  return e;
}

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const _spueler = [];
function entprellt(fn, ms, notfall) {
  let t, letzteArgs = null;
  const g = (...a) => { letzteArgs = a; clearTimeout(t); t = setTimeout(() => { letzteArgs = null; fn(...a); }, ms); };
  g.sofort = (...a) => { clearTimeout(t); letzteArgs = null; fn(...a); };
  if (notfall) _spueler.push(() => { if (letzteArgs) { clearTimeout(t); const a = letzteArgs; letzteArgs = null; fn(...a); } });
  return g;
}
function spueleAlles() { for (const s of _spueler) { try { s(); } catch (e) {} } }

const worte = (t) => { t = (t || '').trim(); return t ? t.split(/\s+/).length : 0; };

const MONATE = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
function tagKey(ts) { const d = new Date(ts || Date.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function fmtDatum(ts) { const d = new Date(ts); return TAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()]; }
function fmtZeit(ts) { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function vorZeit(ts) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 2) return 'gerade eben';
  if (m < 60) return 'vor ' + m + ' Minuten';
  const h = Math.round(m / 60);
  if (h < 24) return 'vor ' + h + (h === 1 ? ' Stunde' : ' Stunden');
  const t = Math.round(h / 24);
  if (t < 30) return 'vor ' + t + (t === 1 ? ' Tag' : ' Tagen');
  const mo = Math.round(t / 30);
  if (mo < 12) return 'vor ' + mo + (mo === 1 ? ' Monat' : ' Monaten');
  const j = Math.round(mo / 12);
  return 'vor ' + j + (j === 1 ? ' Jahr' : ' Jahren');
}
const zufall = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* Suche: normalisieren + kleine Tippfehler-Toleranz */
function normalisiere(s) {
  return String(s || '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function fastGleich(wort, suchwort) {
  if (wort.includes(suchwort)) return true;
  if (suchwort.length < 5) return false;
  const n = suchwort.length;
  for (let start = 0; start + n - 1 <= wort.length; start++) {
    const stueck = wort.slice(start, start + n);
    let fehler = 0;
    for (let i = 0; i < n && fehler < 2; i++) if (stueck[i] !== suchwort[i]) fehler++;
    if (fehler <= 1) return true;
  }
  return false;
}

/* Kluge Zeichen: -- wird –, gerade Anführungszeichen werden deutsche. Pur & testbar. */
function klugeZeichen(t, s) {
  const davor2 = t.slice(Math.max(0, s - 2), s);
  if (davor2 === '--') return { text: t.slice(0, s - 2) + '–' + t.slice(s), caret: s - 1 };
  const letztes = t[s - 1];
  if (letztes === '"' || letztes === "'") {
    const vorher = s >= 2 ? t[s - 2] : '';
    const oeffnend = !vorher || /[\s(\[{\n>»–-]/.test(vorher);
    const ersatz = letztes === '"' ? (oeffnend ? '„' : '"') : (oeffnend ? '‚' : '’');
    return { text: t.slice(0, s - 1) + ersatz + t.slice(s), caret: s };
  }
  return null;
}

/* Prüft, ob ein eingelesenes Paket eine echte VANI-Sicherung ist. */
function pruefeSicherung(paket) {
  return !!(paket && paket.vani === 1 && Array.isArray(paket.docs) &&
    paket.docs.every((d) => d && typeof d.id === 'string' && typeof d.typ === 'string'));
}

/* Text nach draußen: Teilen-Blatt (WhatsApp, Dateien, …) → Zwischenablage */
async function teileText(text) {
  if (navigator.share) {
    try { await navigator.share({ text }); return true; }
    catch (e) { if (e && e.name === 'AbortError') return false; }
  }
  try { await navigator.clipboard.writeText(text); toast('In der Zwischenablage.'); return true; }
  catch (e) { toast('Das hat leider nicht geklappt.'); return false; }
}

/* ----- Icons ----- */
const IK = {
  zuhause: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  schnipsel: '<path d="M21 12a8 8 0 0 1-8 8c-1.6 0-3-.4-4.3-1L4 20l1.2-4A8 8 0 1 1 21 12Z"/>',
  hefte: '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z"/><path d="M5 4v14"/><path d="M9 8h6M9 11.5h6"/>',
  projekte: '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/>',
  cluster: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><circle cx="10" cy="17" r="2.8"/><path d="M9.5 9.2 9.8 14M9.8 8.5l4.8.2M12.5 15.5l3-4.2"/>',
  woerter: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z"/>',
  suche: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  feinheiten: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.2"/><circle cx="9" cy="16" r="2.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  zurueck: '<path d="M14.5 5 8 12l6.5 7"/>',
  mehr: '<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>',
  stift: '<path d="m14 5 5 5L8.5 20.5 3 21l.5-5.5Z"/><path d="m12.5 6.5 5 5"/>',
  kamera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
  senden: '<path d="M12 19V6"/><path d="m6 11.5 6-6 6 6"/>',
  kreuz: '<path d="M6 6l12 12M18 6 6 18"/>',
  haken: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  rechts: '<path d="m9.5 5 6.5 7-6.5 7"/>',
  feuer: '<path d="M12 3s-5 4.5-5 9.5a5 5 0 0 0 10 0c0-2-1-4-2.5-5.5 0 2-.7 3-1.8 3.7C12.5 9.5 12 6.5 12 3Z"/>',
  klang: '<path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="M15.5 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10"/>',
  pin: '<path d="M9 4h6l-1 6 3 3v1.5H7V13l3-3Z"/><path d="M12 14.5V21"/>',
  wandel: '<path d="M4 9a8 8 0 0 1 14-2.5"/><path d="M18 3v4h-4"/><path d="M20 15a8 8 0 0 1-14 2.5"/><path d="M6 21v-4h4"/>',
  muell: '<path d="M5 7h14M10 7V5h4v2"/><path d="M7 7l1 13h8l1-13"/><path d="M10.5 11v5M13.5 11v5"/>',
  lesen: '<path d="M12 6c-2-1.6-4.5-2-8-2v14c3.5 0 6 .4 8 2 2-1.6 4.5-2 8-2V4c-3.5 0-6 .4-8 2Z"/><path d="M12 6v14"/>',
  ziel: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  teilen: '<path d="M12 14V4"/><path d="m8 7.5 4-4 4 4"/><path d="M5 12v8h14v-8"/>',
  runter: '<path d="M12 4v11"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M5 20h14"/>',
  verbinden: '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.5 8.5l7 7"/>',
  drehen: '<path d="M19 12a7 7 0 1 1-2-4.9"/><path d="M17.5 3v4.5H13"/>',
  farbe: '<path d="M12 3.5s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"/>',
  wuerfel: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/>',
  fund: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/>',
  buchzu: '<path d="M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M6 3v18"/>',
  aufklappen: '<path d="m7 9.5 5 5 5-5"/>',
  archiv: '<rect x="3.5" y="4" width="17" height="4.5" rx="1"/><path d="M5.5 8.5V20h13V8.5"/><path d="M10 12.5h4"/>',
  blatt: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 15.5h6"/>',
  faden: '<circle cx="12" cy="7" r="3.5"/><path d="M12 10.5c-4 2-5.5 4.5-4 7 1.2 2 4.5 2.4 6.5 1 2.2-1.5 2-4-.5-5-2-1-4.5 0-4.5 2"/>',
  wieder: '<path d="M4 10a8 8 0 1 1 2.3 6.3"/><path d="M4 21v-5h5"/>',
  frieren: '<path d="M12 3v18M5.5 6.5 18.5 17.5M18.5 6.5 5.5 17.5"/><path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"/>',
  ab: '<path d="m7 10 5 5 5-5"/>',
  auf: '<path d="m7 14 5-5 5 5"/>'
};
function ik(name, kl) { return `<svg class="ik${kl ? ' ' + kl : ''}" viewBox="0 0 24 24" aria-hidden="true">${IK[name] || ''}</svg>`; }

/* ----- Datenbank ----- */
let _db;
function dbAuf() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('vani', 2);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('docs')) d.createObjectStore('docs', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('media')) d.createObjectStore('media');
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
      if (!d.objectStoreNames.contains('papierkorb')) d.createObjectStore('papierkorb', { keyPath: 'id' });
    };
    r.onsuccess = () => { _db = r.result; res(); };
    r.onerror = () => rej(r.error);
  });
}
function dbTu(store, modus, arbeit) {
  return new Promise((res, rej) => {
    const tx = _db.transaction(store, modus);
    const antwort = arbeit(tx.objectStore(store));
    tx.oncomplete = () => res(antwort && 'result' in antwort ? antwort.result : undefined);
    tx.onerror = () => rej(tx.error);
  });
}
const dbPut = (store, wert, key) => dbTu(store, 'readwrite', (s) => (key !== undefined ? s.put(wert, key) : s.put(wert)));
const dbDel = (store, key) => dbTu(store, 'readwrite', (s) => s.delete(key));
const dbGet = (store, key) => dbTu(store, 'readonly', (s) => s.get(key));
const dbAlle = (store) => dbTu(store, 'readonly', (s) => s.getAll());

/* ----- Bestand ----- */
const D = {
  docs: new Map(),
  einst: {
    thema: 'papier', schrift: 'serife', groesse: 19, breite: 'mittel',
    typewriter: true, fokus: false, mischung: {}, lautstaerke: .5,
    tastenklang: false, tagesziel: 0, ersetzungen: true, autokorrektur: true,
    raeume: null
  },
  stats: { tage: {}, letzte: {}, letzteSicherung: 0 }
};

async function ladeAlles() {
  await dbAuf();
  (await dbAlle('docs')).forEach((d) => D.docs.set(d.id, d));
  const e = await dbGet('kv', 'einst'); if (e) Object.assign(D.einst, e);
  const s = await dbGet('kv', 'stats'); if (s) D.stats = Object.assign({ tage: {}, letzte: {}, letzteSicherung: 0 }, s);
}
const speichereEinst = entprellt(() => dbPut('kv', D.einst, 'einst'), 300);
const speichereStats = entprellt(() => dbPut('kv', D.stats, 'stats'), 800);

function neuDoc(typ, felder) {
  const d = Object.assign({ id: uid(), typ, angelegt: Date.now(), geaendert: Date.now() }, felder);
  D.docs.set(d.id, d);
  dbPut('docs', d);
  D.stats.letzte[d.id] = worte(d.text || '');
  return d;
}
function speichere(d) { d.geaendert = Date.now(); dbPut('docs', d); }
function speichereStill(d) { dbPut('docs', d); }

/* Löschen ist bei VANI nie endgültig: alles wandert erst in den Papierkorb. */
function _nachfahren(id) {
  const opfer = [id];
  for (let i = 0; i < opfer.length; i++) {
    for (const d of D.docs.values()) {
      if ((d.parent === opfer[i] || d.projekt === opfer[i]) && !opfer.includes(d.id)) opfer.push(d.id);
      if (d.typ === 'kante' && (d.von === opfer[i] || d.zu === opfer[i]) && !opfer.includes(d.id)) opfer.push(d.id);
    }
  }
  return opfer;
}

async function loesche(id, still) {
  const wurzel = D.docs.get(id);
  if (!wurzel) return;
  const opfer = _nachfahren(id);
  const buendel = { id: uid(), wann: Date.now(), name: wurzel.titel || (wurzel.text || '').slice(0, 40) || wurzel.typ, typ: wurzel.typ, docs: [] };
  for (const oid of opfer) {
    const d = D.docs.get(oid);
    if (!d) continue;
    buendel.docs.push(d);
    D.docs.delete(oid);
    await dbDel('docs', oid);
  }
  await dbPut('papierkorb', buendel);
  if (!still) {
    toastMitAktion('Im Papierkorb.', 'Rückgängig', async () => {
      await holeZurueck(buendel.id);
      zeichne();
    });
  }
}

async function holeZurueck(buendelId) {
  const b = await dbGet('papierkorb', buendelId);
  if (!b) return false;
  for (const d of b.docs) {
    D.docs.set(d.id, d);
    await dbPut('docs', d);
  }
  await dbDel('papierkorb', buendelId);
  return true;
}

async function papierkorbLeeren(nurAelterAlsTage) {
  const alle = await dbAlle('papierkorb');
  const grenze = nurAelterAlsTage ? Date.now() - nurAelterAlsTage * 86400000 : Infinity;
  for (const b of alle) {
    if (nurAelterAlsTage && b.wann > grenze) continue;
    for (const d of b.docs) {
      if (d.bild) dbDel('media', d.bild);
      if (d.skizze) dbDel('media', d.skizze);
      delete D.stats.letzte[d.id];
    }
    await dbDel('papierkorb', b.id);
  }
  speichereStats();
}

function kinder(pid, typ) {
  return [...D.docs.values()]
    .filter((d) => d.parent === pid && (!typ || d.typ === typ))
    .sort((a, b) => (a.ord || 0) - (b.ord || 0) || a.angelegt - b.angelegt);
}
function vomTyp(typ) {
  return [...D.docs.values()].filter((d) => d.typ === typ).sort((a, b) => b.geaendert - a.geaendert);
}

/* ----- Statistik ----- */
function zaehleWorte(docId, text) {
  const n = worte(text);
  const alt = D.stats.letzte[docId];
  if (alt !== undefined && n > alt) {
    const k = tagKey();
    D.stats.tage[k] = (D.stats.tage[k] || 0) + (n - alt);
  }
  D.stats.letzte[docId] = n;
  speichereStats();
}
function straehne() {
  let n = 0;
  const t = new Date();
  if (!D.stats.tage[tagKey(t)]) t.setDate(t.getDate() - 1);
  while (D.stats.tage[tagKey(t)]) { n++; t.setDate(t.getDate() - 1); }
  return n;
}
function feuerstufe() {
  let letzte3 = 0;
  const t = new Date();
  for (let i = 0; i < 3; i++) { letzte3 += D.stats.tage[tagKey(t)] || 0; t.setDate(t.getDate() - 1); }
  const heute = D.stats.tage[tagKey()] || 0;
  if (heute >= 800) return 'lodert';
  if (heute > 0) return 'brennt';
  if (letzte3 > 0) return 'glut';
  return 'aus';
}
function flammeHTML() {
  const stufe = feuerstufe();
  return `<div class="flammenbild ${stufe === 'brennt' ? '' : stufe}"><i class="f1"></i><i class="f2"></i><i class="holz"></i>${stufe === 'aus' ? '<i class="rauch"></i>' : ''}</div>`;
}

/* ----- Thema ----- */
const THEMEN = { papier: '#ece3d1', tinte: '#141110', kerze: '#1b1206', nebel: '#e2e5e1' };
function setzeThema(name) {
  document.documentElement.dataset.thema = name;
  D.einst.thema = name;
  const m = $('meta[name="theme-color"]');
  if (m) m.content = THEMEN[name] || '#ece3d1';
  speichereEinst();
}

/* ----- Toast, Modale, Menüs ----- */
function toast(text, ms = 2400) {
  const t = el('div', { class: 'toast' }, text);
  $('#toasts').append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 450); }, ms);
}
function toastMitAktion(text, aktion, tu, ms = 5200) {
  const knopf = el('button', { class: 'toastaktion', onclick: () => { t.remove(); tu(); } }, aktion);
  const t = el('div', { class: 'toast anfassbar' }, text, knopf);
  $('#toasts').append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 450); }, ms);
}

function zeigeDeck(inhalt, beiZu) {
  const schleier = el('div', { class: 'schleier' }, inhalt);
  schleier.addEventListener('pointerdown', (e) => { if (e.target === schleier) zu(); });
  const zu = () => { schleier.remove(); if (beiZu) beiZu(); };
  $('#deck').append(schleier);
  return zu;
}

function frage(text, { ja = 'Ja', nein = 'Lieber nicht', gefahr = false } = {}) {
  return new Promise((res) => {
    const kasten = el('div', { class: 'modal' },
      el('div', { class: 'serif', style: 'font-size:18px;line-height:1.5' }, text),
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => { res(false); zu(); } }, nein),
        el('button', { class: 'knopf ' + (gefahr ? '' : 'voll'), style: gefahr ? 'color:#c0392b' : '', onclick: () => { res(true); zu(); } }, ja)
      )
    );
    const zu = zeigeDeck(kasten, () => res(false));
  });
}

function eingabe({ titel, wert = '', platzhalter = '', mehrzeilig = false, ok = 'Fertig' }) {
  return new Promise((res) => {
    const feld = mehrzeilig
      ? el('textarea', { rows: 4, placeholder: platzhalter })
      : el('input', { type: 'text', value: wert, placeholder: platzhalter });
    if (mehrzeilig) feld.value = wert;
    const kasten = el('div', { class: 'modal' },
      el('h2', {}, titel),
      feld,
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => { res(null); zu(); } }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: () => { const v = feld.value.trim(); res(v || null); zu(); } }, ok)
      )
    );
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !mehrzeilig) { e.preventDefault(); const v = feld.value.trim(); res(v || null); zu(); } });
    const zu = zeigeDeck(kasten, () => res(null));
    setTimeout(() => feld.focus(), 60);
  });
}

function menue(punkte, titel) {
  return new Promise((res) => {
    const kasten = el('div', { class: 'menue' },
      titel ? el('div', { class: 'mtitel' }, titel) : null,
      punkte.filter(Boolean).map((p) =>
        el('button', { class: p.rot ? 'rot' : '', onclick: () => { res(p.wert !== undefined ? p.wert : p.text); zu(); } },
          p.icon ? el('span', { html: ik(p.icon), style: 'display:flex' }) : null,
          p.text)
      )
    );
    const zu = zeigeDeck(kasten, () => res(null));
  });
}

/* ----- Gesten ----- */
function langdruck(elem, fn) {
  let timer = null, sx = 0, sy = 0;
  elem.addEventListener('pointerdown', (e) => {
    sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => { timer = null; if (!elem._zieht) fn(e); }, 480);
  });
  const abbruch = (e) => {
    if (timer && e.type === 'pointermove' && Math.hypot(e.clientX - sx, e.clientY - sy) < 12) return;
    clearTimeout(timer); timer = null;
  };
  elem.addEventListener('pointermove', abbruch);
  elem.addEventListener('pointerup', abbruch);
  elem.addEventListener('pointercancel', abbruch);
  elem.addEventListener('contextmenu', (e) => { e.preventDefault(); fn(e); });
}

function autogrow(ta) {
  const anpassen = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
  ta.addEventListener('input', anpassen);
  requestAnimationFrame(anpassen);
  return anpassen;
}

/* ----- Verweise ([[...]]) und Schlagworte ----- */
function schmuecke(text) {
  let h = esc(text);
  /* t ist hier bereits entschärft — ein zweites esc() würde doppelt kodieren */
  h = h.replace(/\[\[([^\[\]]{1,80})\]\]/g, (_, t) => `<span class="verweis" data-ziel="${t}">${t}</span>`);
  h = h.replace(/(^|\s)#([\wäöüÄÖÜß-]{2,30})/g, (_, vor, t) => `${vor}<span class="schlagwort">#${t}</span>`);
  return h;
}
function findeNachTitel(titel) {
  const t = titel.trim().toLowerCase();
  for (const d of D.docs.values()) {
    if ((d.titel || '').trim().toLowerCase() === t) return d;
    if (d.typ === 'wort' && (d.text || '').trim().toLowerCase() === t) return d;
  }
  return null;
}
function rueckverweise(doc) {
  const t = (doc.titel || doc.text || '').trim().toLowerCase();
  if (!t) return [];
  return [...D.docs.values()].filter((d) => d.id !== doc.id && (d.text || '').toLowerCase().includes('[[' + t + ']]'));
}
function oeffneDoc(d) {
  if (!d) return;
  if (d.typ === 'blatt') { location.hash = '#/blaetter'; setTimeout(() => oeffneSchreibraum(d.id), 80); }
  else if (d.typ === 'faden' || d.typ === 'funkeln') location.hash = '#/faden';
  else if (d.typ === 'mischung') location.hash = '#/klang';
  else if (d.typ === 'schnipsel') location.hash = '#/schnipsel';
  else if (d.typ === 'heft') location.hash = '#/heft/' + d.id;
  else if (d.typ === 'seite') { sessionStorage.setItem('zielSeite', d.id); location.hash = '#/heft/' + d.parent; }
  else if (d.typ === 'projekt') location.hash = '#/projekt/' + d.id;
  else if (d.typ === 'kapitel') location.hash = '#/projekt/' + d.parent;
  else if (d.typ === 'szene') { location.hash = '#/projekt/' + d.projekt; setTimeout(() => oeffneSchreibraum(d.id), 80); }
  else if (d.typ === 'board') location.hash = '#/brett/' + d.id;
  else if (d.typ === 'blase') location.hash = '#/brett/' + d.parent;
  else if (d.typ === 'wort') location.hash = '#/woerter';
  else if (d.typ === 'zettel' || d.typ === 'foto') { const s = D.docs.get(d.parent); if (s) oeffneDoc(s); }
}
document.addEventListener('click', (e) => {
  const v = e.target.closest('.verweis');
  if (!v) return;
  e.preventDefault(); e.stopPropagation();
  const ziel = findeNachTitel(v.dataset.ziel);
  if (ziel) oeffneDoc(ziel);
  else toast('„' + v.dataset.ziel + '" gibt es noch nicht. Vielleicht bald.');
});
