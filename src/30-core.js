'use strict';
/* ================================================================
   VANI — Kern: Helfer, Icons, Datenbank, Modale
   ================================================================ */

const APP_VERSION = '5.31.0';
/* Eine einzige sichtbare Web-App. GitHub ist die Werkstatt und die Adresse,
   die iPad, Handy und Browser installieren. Der Sites-Host bleibt nur der
   verschlüsselte Hintergrunddienst und wird nie als zweite App beworben. */
const VANI_HAUPTADRESSE = 'https://thekeveldikev.github.io/vani/';

function vaniAdresseArt(standort = location) {
  const protokoll = String(standort && standort.protocol || '');
  const origin = String(standort && standort.origin || '');
  const host = String(standort && standort.hostname || '');
  const suche = String(standort && standort.search || '');
  if (protokoll === 'vani:') return 'desktop';
  if (/^https?:$/.test(protokoll) && /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(host)) return 'lokal';
  try {
    if (new URL(VANI_HAUPTADRESSE).origin === origin && /^\/vani(?:\/|$)/.test(String(standort.pathname || '/'))) return 'haupt';
  } catch (e) {}
  if (host === 'vani-schreibzuhause.craftkey.chatgpt.site' && new URLSearchParams(suche).get('rettung') === '1') return 'rettung';
  if (host === 'vani-schreibzuhause.craftkey.chatgpt.site') return 'dienst';
  return 'andere';
}
const $ = (s, w) => (w || document).querySelector(s);
const $$ = (s, w) => [...(w || document).querySelectorAll(s)];
const uid = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
  ? globalThis.crypto.randomUUID()
  : Date.now().toString(36) + Math.random().toString(36).slice(2, 11);

/* Kinder anhängen wie el(): null und false werden übersprungen. `.append(null)` würde sonst
   das Wort „null" in die Seite schreiben — genau das ist im Salon passiert. */
function anfuegen(ziel, ...kinder) {
  for (const kind of kinder.flat(9)) { if (kind == null || kind === false) continue; ziel.append(kind.nodeType ? kind : document.createTextNode(kind)); }
  return ziel;
}
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
  if (tag === 'button' && !e.hasAttribute('aria-label') && e.hasAttribute('title')) {
    e.setAttribute('aria-label', e.getAttribute('title'));
  }
  return e;
}

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const _spueler = [];
function entprellt(fn, ms, notfall) {
  let t, letzteArgs = null;
  const g = (...a) => { letzteArgs = a; clearTimeout(t); t = setTimeout(() => { letzteArgs = null; fn(...a); }, ms); };
  g.sofort = (...a) => { clearTimeout(t); letzteArgs = null; fn(...a); };
  g.haengt = () => letzteArgs !== null;
  if (notfall) {
    /* notfall darf eine Funktion sein, die sagt, ob der Besitzer noch lebt — tote Spüler werden ausgetragen */
    const sp = () => { if (letzteArgs) { clearTimeout(t); const a = letzteArgs; letzteArgs = null; fn(...a); } };
    sp.lebt = typeof notfall === 'function' ? notfall : null;
    _spueler.push(sp);
    g.loesen = () => { const i = _spueler.indexOf(sp); if (i >= 0) _spueler.splice(i, 1); };
  }
  return g;
}
function spueleAlles() {
  for (const s of [..._spueler]) { try { s(); } catch (e) {} if (s.lebt && !s.lebt()) { const i = _spueler.indexOf(s); if (i >= 0) _spueler.splice(i, 1); } }
}

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
  if (!paket || (paket.vani !== 1 && paket.vani !== 2) || !Array.isArray(paket.docs) || paket.docs.length > 100000) return false;
  const ids = new Set();
  for (const d of paket.docs) {
    if (!d || typeof d.id !== 'string' || d.id.length < 1 || d.id.length > 200 ||
        typeof d.typ !== 'string' || d.typ.length < 1 || d.typ.length > 40 || ids.has(d.id) ||
        Object.keys(d).length > 250) return false;
    ids.add(d.id);
  }
  if (paket.media != null && (typeof paket.media !== 'object' || Array.isArray(paket.media) || Object.keys(paket.media).length > 100000)) return false;
  if (paket.sync != null && (!Array.isArray(paket.sync) || paket.sync.length > 100000)) return false;
  return true;
}

const begrenze = (wert, min, max, ersatz = min) => {
  const n = Number(wert);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : ersatz;
};

/* Pur und absichtlich klein: diese Helfer werden auch adversarial getestet. */
function freieSchnipselPosition(index, id) {
  let h = 2166136261;
  for (const c of String(id || index)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const winkel = index * 2.399963229728653 + ((h >>> 8) % 100) / 180;
  const radius = 95 * Math.sqrt(Math.max(0, index)) + 30;
  return {
    x: Math.round(Math.cos(winkel) * radius),
    y: Math.round(Math.sin(winkel) * radius * .78),
    rot: ((h >>> 16) % 11) - 5,
    w: 230 + ((h >>> 24) % 4) * 28
  };
}
function freieFlaechenGrenzen(positionen, minBreite = 900, minHoehe = 680) {
  if (!Array.isArray(positionen) || !positionen.length) return { minX: 0, minY: 0, breite: minBreite, hoehe: minHoehe };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of positionen) {
    if (!p) continue;
    const x = begrenze(p.x, -100000, 100000, 0), y = begrenze(p.y, -100000, 100000, 0);
    const b = begrenze(p.w, 180, 520, 260), h = begrenze(p.h, 100, 900, 190);
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x + b); maxY = Math.max(maxY, y + h);
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, breite: minBreite, hoehe: minHoehe };
  return { minX, minY, breite: Math.max(minBreite, maxX - minX + 160), hoehe: Math.max(minHoehe, maxY - minY + 160) };
}

function seitenUmbruch(text, passt) {
  text = String(text || '');
  if (!text || typeof passt !== 'function' || passt(text)) return null;
  let links = 0, rechts = text.length;
  while (links < rechts) {
    const mitte = Math.ceil((links + rechts) / 2);
    if (passt(text.slice(0, mitte))) links = mitte; else rechts = mitte - 1;
  }
  if (links < 1) return { hier: '', weiter: text };
  /* Die Seite soll bis unten voll werden. Ein Absatzende weit oberhalb der
     Bruchstelle liesse ein Drittel Seite leer — darum zaehlt es nur, wenn es
     nahe genug am Ende steht; sonst ein Satzende, sonst die Wortgrenze. */
  const NAH = 200, WORT = 140;
  let trenn = -1;
  const absatz = text.lastIndexOf('\n', links);
  if (absatz > 0 && absatz >= links - NAH) trenn = absatz;
  if (trenn < 0) {
    const satz = Math.max(text.lastIndexOf('. ', links), text.lastIndexOf('! ', links), text.lastIndexOf('? ', links), text.lastIndexOf('… ', links));
    if (satz > 0 && satz >= links - NAH) trenn = satz + 1;
  }
  if (trenn < 0) {
    const wort = text.lastIndexOf(' ', links);
    if (wort > 0 && wort >= links - WORT) trenn = wort;
  }
  if (trenn < 1) trenn = links;
  const hier = text.slice(0, trenn).replace(/[ \t]+$/, '');
  const weiter = text.slice(trenn).replace(/^[ \t\n]+/, '');
  return weiter ? { hier, weiter } : null;
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
  sticker: '<path d="M5 7a2 2 0 0 1 2-2h7.5L19 9.5V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"/><path d="M14.5 5v4.5H19"/><path d="M8.5 13.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/>',
  brief: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6.5L20.5 7"/><path d="M3.5 18l6-5.5M20.5 18l-6-5.5"/>',
  rahmen: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><rect x="7.5" y="6.5" width="9" height="10"/><path d="M9 21v1.5M15 21v1.5"/><path d="M10.5 12.5c1-1.5 2-1.5 3 0"/>',
  schreibtisch: '<path d="M3 14h18"/><path d="M5 14v6M19 14v6"/><path d="M8 14v-3.5a2 2 0 0 1 2-2h1"/><path d="M14 5.5 12.5 10h4L15 5.5h-1Z"/><path d="M13.2 10.5v3.5"/><circle cx="7" cy="10.5" r="1.2"/>',
  lasso: '<path d="M12 4c4.4 0 8 2 8 4.8S16.4 13.6 12 13.6 4 11.6 4 8.8 7.6 4 12 4Z" stroke-dasharray="3 2.2"/><path d="M8.5 13.2c-.6 2.2-.2 4.3 1.4 6.3"/><circle cx="10.4" cy="20" r="1.2"/>',
  gliederung: '<path d="M5 6h3M10 6h9"/><path d="M7 11h3M12 11h7"/><path d="M7 16h3M12 16h7"/><path d="M5 20h3M10 20h9"/>',
  mikro: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 11.5a6 6 0 0 0 12 0"/><path d="M12 17.5V21M9 21h6"/>',
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
  schild: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
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
  auf: '<path d="m7 14 5-5 5 5"/>',
  ausLinks: '<path d="M4 6h16M4 10.5h9M4 15h16M4 19.5h9"/>',
  ausMitte: '<path d="M4 6h16M7.5 10.5h9M4 15h16M7.5 19.5h9"/>',
  ausRechts: '<path d="M4 6h16M11 10.5h9M4 15h16M11 19.5h9"/>',
  ausBlock: '<path d="M4 6h16M4 10.5h16M4 15h16M4 19.5h16"/>',
  radierer: '<path d="m9 20-4.5-4.5a2 2 0 0 1 0-2.8l8-8a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L12.5 17"/><path d="M9 20h10"/><path d="m8.5 9.5 6 6"/>',
  inhalt: '<path d="M5 6h3M11 6h8M5 12h3M11 12h8M5 18h3M11 18h8"/>',
  lesezeichen: '<path d="M7 4h10v16l-5-3.5L7 20V4Z"/>',
  vorlesen: '<path d="M5 10v4h3l4 3.5v-11L8 10H5Z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18 7a7 7 0 0 1 0 10"/>',
  figur: '<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/>',
  rahmen: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke-dasharray="3 2.5"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="14" r="1.6"/>'
};
function ik(name, kl) { return `<svg class="ik${kl ? ' ' + kl : ''}" viewBox="0 0 24 24" aria-hidden="true">${IK[name] || ''}</svg>`; }

/* ----- Datenbank ----- */
let _db;
let AKTIVES_PROFIL_ID = 'legacy';
let AKTIVES_PROFIL = null;
let GERAET_ID = '';

function aktiviereProfil(meta) {
  AKTIVES_PROFIL = meta || null;
  AKTIVES_PROFIL_ID = meta && typeof meta.id === 'string' ? meta.id : 'legacy';
  const schluessel = 'vani-geraet:' + AKTIVES_PROFIL_ID;
  try {
    GERAET_ID = localStorage.getItem(schluessel) || uid();
    localStorage.setItem(schluessel, GERAET_ID);
  } catch (e) { GERAET_ID = uid(); }
}

function profilDatenbankName() {
  if (!AKTIVES_PROFIL || AKTIVES_PROFIL.datenbank === 'vani') return 'vani';
  const id = String(AKTIVES_PROFIL_ID || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 80);
  return id ? 'vani-profil-' + id : 'vani';
}

function dbAuf() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(profilDatenbankName(), 4);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('docs')) d.createObjectStore('docs', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('media')) d.createObjectStore('media');
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
      if (!d.objectStoreNames.contains('papierkorb')) d.createObjectStore('papierkorb', { keyPath: 'id' });
      /* Pro Dokument nur der jüngste lokale Änderungsstand. Eine spätere
         Desktop-Synchronisation kann diese kleinen Marker abholen. */
      if (!d.objectStoreNames.contains('sync')) d.createObjectStore('sync');
      /* Verschlüsselte, noch nicht bestätigte Netzpakete überleben Offlinezeit,
         App-Abbruch und einen Neustart. */
      if (!d.objectStoreNames.contains('sync-pending')) d.createObjectStore('sync-pending');
    };
    r.onsuccess = () => { _db = r.result; res(); };
    r.onerror = () => rej(r.error);
  });
}
function dbTu(store, modus, arbeit) {
  return new Promise((res, rej) => {
    let tx, antwort;
    try {
      tx = _db.transaction(store, modus);
      antwort = arbeit(tx.objectStore(store));
    } catch (e) { rej(e); return; }
    tx.oncomplete = () => res(antwort && 'result' in antwort ? antwort.result : undefined);
    tx.onerror = () => rej(tx.error || new Error('Speichern fehlgeschlagen'));
    tx.onabort = () => rej(tx.error || new Error('Speichern abgebrochen'));
  });
}
const dbPut = (store, wert, key) => dbTu(store, 'readwrite', (s) => (key !== undefined ? s.put(wert, key) : s.put(wert)));
const dbDel = (store, key) => dbTu(store, 'readwrite', (s) => s.delete(key));
const dbGet = (store, key) => dbTu(store, 'readonly', (s) => s.get(key));
const dbAlle = (store) => dbTu(store, 'readonly', (s) => s.getAll());

/* ----- Bestand ----- */
aktiviereProfil(null);

const STANDARD_EINST = {
  thema: 'papier', schrift: 'serife', groesse: 19, breite: 'mittel',
  typewriter: true, fokus: false, mischung: {}, lautstaerke: .5,
  tastenklang: false, tagesziel: 0, ersetzungen: true, autokorrektur: true, kurzschrift: true,
  autoSeitenwechsel: true, schnipselAnsicht: 'lauf', blattSortierung: 'zuletzt', hefteAnsicht: 'karten',
  goodnotesSync: false, fadenAbgewaehlt: false, raeume: null,
  stiftFarbe: '#2c251c', stiftDicke: 3.5, sperreNachMinuten: 10,
  ambience: {}, ambienceFein: {}, klangReiter: 'echt', klangFolgt: true, vorleseTempo: .95,
  stickerFarbe: '#c8322b', stickerDicke: 5, tisch: null, schreibtisch: null, salonGelesen: {}, orte: null, sitzung: null, salonBriefe: [], pausenErinnerung: true, schreibmaschine: null, salonTon: false, salonAnrede: '', salonWelten: false
};
const D = {
  docs: new Map(),
  einst: Object.assign({}, STANDARD_EINST),
  stats: { tage: {}, letzte: {}, letzteSicherung: 0 }
};

function uebernehmeEinstellungen(quelle) {
  if (!quelle || typeof quelle !== 'object') return;
  for (const k of Object.keys(STANDARD_EINST)) {
    if (Object.prototype.hasOwnProperty.call(quelle, k)) D.einst[k] = quelle[k];
  }
  /* Einmalige Brücke für sehr alte Klang-Einstellungen; Boot wandelt sie in
     die heutige Mischung um und entfernt das Feld danach. */
  if (typeof quelle.klang === 'string') D.einst.klang = quelle.klang.slice(0, 40);
  D.einst.groesse = begrenze(D.einst.groesse, 15, 26, 19);
  D.einst.lautstaerke = begrenze(D.einst.lautstaerke, 0, 1, .5);
  D.einst.tagesziel = Math.round(begrenze(D.einst.tagesziel, 0, 10000000, 0));
  D.einst.stiftDicke = begrenze(D.einst.stiftDicke, 1, 24, 3.5);
  D.einst.stiftFarbe = /^#[0-9a-f]{6}$/i.test(D.einst.stiftFarbe || '') ? D.einst.stiftFarbe : '#2c251c';
  D.einst.stickerDicke = begrenze(D.einst.stickerDicke, 1, 24, 5);
  D.einst.stickerFarbe = /^#[0-9a-f]{6}$/i.test(D.einst.stickerFarbe || '') ? D.einst.stickerFarbe : '#c8322b';
  D.einst.sperreNachMinuten = Math.round(begrenze(D.einst.sperreNachMinuten, 0, 240, 10));
  D.einst.thema = ['papier', 'tinte', 'kerze', 'nebel', 'weiss'].includes(D.einst.thema) ? D.einst.thema : 'papier';
  D.einst.schrift = ['serife', 'klar', 'mono'].includes(D.einst.schrift) ? D.einst.schrift : 'serife';
  D.einst.breite = ['schmal', 'mittel', 'breit'].includes(D.einst.breite) ? D.einst.breite : 'mittel';
  for (const k of ['typewriter', 'fokus', 'tastenklang', 'ersetzungen', 'autokorrektur', 'autoSeitenwechsel']) D.einst[k] = D.einst[k] !== false;
  D.einst.goodnotesSync = D.einst.goodnotesSync === true;
  D.einst.kurzschrift = D.einst.kurzschrift !== false;
  D.einst.hefteAnsicht = ['karten', 'regal', 'tisch'].includes(D.einst.hefteAnsicht) ? D.einst.hefteAnsicht : 'karten';
  if (typeof saubererTisch === 'function') D.einst.tisch = saubererTisch(D.einst.tisch);
  if (typeof saubererSchreibtisch === 'function') D.einst.schreibtisch = saubererSchreibtisch(D.einst.schreibtisch);
  if (typeof saubereOrte === 'function') D.einst.orte = saubereOrte(D.einst.orte);
  D.einst.fadenAbgewaehlt = D.einst.fadenAbgewaehlt === true;
  D.einst.blattSortierung = ['zuletzt', 'aeltest', 'az'].includes(D.einst.blattSortierung) ? D.einst.blattSortierung : 'zuletzt';
  D.einst.schnipselAnsicht = D.einst.schnipselAnsicht === 'frei' ? 'frei' : 'lauf';
  if (!D.einst.mischung || typeof D.einst.mischung !== 'object' || Array.isArray(D.einst.mischung)) D.einst.mischung = {};
  else {
    const m = {};
    for (const [id, wert] of Object.entries(D.einst.mischung).slice(0, 100)) {
      if (/^[a-z0-9_-]{1,60}$/i.test(id)) { const v = begrenze(wert, 0, 1, 0); if (v > 0) m[id] = v; }
    }
    D.einst.mischung = m;
  }
  /* Echte Aufnahmen: Pegel je Klang und die Feineinstellungen dazu. */
  if (!D.einst.ambience || typeof D.einst.ambience !== 'object' || Array.isArray(D.einst.ambience)) D.einst.ambience = {};
  else {
    const m = {};
    for (const [id, wert] of Object.entries(D.einst.ambience).slice(0, 100)) {
      if (/^(eigen:)?[a-z0-9_:-]{1,80}$/i.test(id)) { const v = begrenze(wert, 0, 1, 0); if (v > 0) m[id] = v; }
    }
    D.einst.ambience = m;
  }
  if (!D.einst.ambienceFein || typeof D.einst.ambienceFein !== 'object' || Array.isArray(D.einst.ambienceFein)) D.einst.ambienceFein = {};
  else {
    const f = {};
    for (const [id, w] of Object.entries(D.einst.ambienceFein).slice(0, 200)) {
      if (!/^(eigen:)?[a-z0-9_:-]{1,80}$/i.test(id)) continue;
      f[id] = typeof saubereAmbienceFeinheit === 'function' ? saubereAmbienceFeinheit(w) : {};
    }
    D.einst.ambienceFein = f;
  }
  D.einst.klangReiter = D.einst.klangReiter === 'gewebt' ? 'gewebt' : 'echt';
  D.einst.klangFolgt = D.einst.klangFolgt !== false;
  D.einst.vorleseTempo = begrenze(D.einst.vorleseTempo, .6, 1.4, .95);
  if (D.einst.raeume != null) {
    const gesehen = new Set();
    D.einst.raeume = Array.isArray(D.einst.raeume) ? D.einst.raeume.slice(0, 50)
      .filter((r) => r && typeof r.id === 'string' && r.id.length <= 60)
      .filter((r) => !gesehen.has(r.id) && gesehen.add(r.id))
      .map((r) => ({ id: r.id, an: r.an !== false })) : null;
  }
}
function saubereZaehler(quelle, max = 100000) {
  const ziel = Object.create(null);
  if (!quelle || typeof quelle !== 'object') return ziel;
  let n = 0;
  for (const [k, v] of Object.entries(quelle)) {
    if (++n > max || typeof k !== 'string' || k.length > 200) break;
    const zahl = Number(v);
    if (Number.isFinite(zahl) && zahl >= 0) ziel[k] = zahl;
  }
  return ziel;
}
function saubererSyncMarker(quelle) {
  if (!quelle || typeof quelle !== 'object' || typeof quelle.id !== 'string' || quelle.id.length < 1 || quelle.id.length > 200) return null;
  return {
    id: quelle.id,
    rev: Math.round(begrenze(quelle.rev, 0, Number.MAX_SAFE_INTEGER, 0)),
    geraet: String(quelle.geraet || '').slice(0, 200),
    wann: begrenze(quelle.wann, 0, Date.now() + 86400000, 0),
    geloescht: !!quelle.geloescht
  };
}
function sauberesDokument(quelle) {
  if (!quelle || typeof quelle !== 'object' || typeof quelle.id !== 'string' || quelle.id.length < 1 || quelle.id.length > 200 ||
      typeof quelle.typ !== 'string' || quelle.typ.length < 1 || quelle.typ.length > 40 || Object.keys(quelle).length > 250) return null;
  const d = {};
  for (const [k, v] of Object.entries(quelle)) {
    if (k === '__proto__' || k === 'prototype' || k === 'constructor') continue;
    d[k] = v;
  }
  for (const k of ['text', 'rich', 'titel', 'notiz', 'schlagworte', 'dateiname', 'dateityp', 'art', 'vibe', 'farbe', 'farbe2', 'kistenrand', 'kistenrandFarbe', 'band', 'muster', 'papier', 'papierfarbe', 'ansicht', 'format', 'befestigung', 'label', 'schrift', 'lesezeichen']) {
    if (k === 'lesezeichen' && d.typ === 'buch') continue;   /* Bücher: Seitenliste, siehe unten */
    if (d[k] != null) d[k] = String(d[k]).slice(0, k === 'text' || k === 'rich' || k === 'notiz' ? 10000000 : 1000);
  }
  for (const k of ['parent', 'projekt', 'projektRef', 'von', 'zu', 'bild', 'skizze', 'datei', 'quelle', 'fingerabdruck', '_geraet']) {
    if (d[k] != null) d[k] = String(d[k]).slice(0, 500);
  }
  if (d.farbe && !/^(#[0-9a-f]{3,8}|[a-z0-9_-]{1,30})$/i.test(d.farbe)) d.farbe = '';
  if (d.farbe2 && !/^#[0-9a-f]{6}$/i.test(d.farbe2)) d.farbe2 = '';
  if (d.kistenrand && !/^[a-z]{1,16}$/.test(d.kistenrand)) d.kistenrand = '';
  if (d.kistenrandFarbe && !/^#[0-9a-f]{6}$/i.test(d.kistenrandFarbe)) d.kistenrandFarbe = '';
  if (d.band && !/^#[0-9a-f]{6}$/i.test(d.band)) d.band = '';
  if (d.muster && !['leinen', 'diagonal', 'punkte', 'rahmen', 'welle', 'schlicht'].includes(d.muster)) d.muster = 'schlicht';
  if (d.papier && !['liniert', 'kariert', 'blank', 'punkte', 'breit', 'cornell', 'storyboard', 'dialog'].includes(d.papier)) d.papier = 'liniert';
  if (d.ansicht && !['seiten', 'rolle', 'fluss'].includes(d.ansicht)) d.ansicht = 'seiten';
  if (d.papierfarbe && !['hell', 'weiss', 'creme', 'kraft', 'nacht'].includes(d.papierfarbe)) d.papierfarbe = 'hell';
  /* Klangbilder merken sich Mischungen und woran sie hängen. */
  if (d.pegel != null && typeof saubereAmbienceMischung === 'function' && d.typ === 'klangbild') d.pegel = saubereAmbienceMischung(d.pegel);
  if (d.gewebt != null && typeof saubereMischung === 'function') d.gewebt = saubereMischung(d.gewebt);
  if (d.fein != null) {
    const raus = {};
    if (d.fein && typeof d.fein === 'object' && !Array.isArray(d.fein) && typeof saubereAmbienceFeinheit === 'function') {
      for (const [id, f] of Object.entries(d.fein).slice(0, 200)) raus[String(id).slice(0, 80)] = saubereAmbienceFeinheit(f);
    }
    d.fein = raus;
  }
  if (d.orte != null) d.orte = Array.isArray(d.orte) ? d.orte.filter((x) => typeof x === 'string' && x.length <= 200).slice(0, 200) : [];
  if (d.lautstaerke != null) d.lautstaerke = begrenze(d.lautstaerke, 0, 1, .5);
  if (d.groesse != null) d.groesse = begrenze(d.groesse, 0, 5e9, 0);
  if (d.rand != null) d.rand = d.rand === true;
  if (d.gepinnt != null) d.gepinnt = d.gepinnt === true;
  if (d.schrift && !['hand', 'klar', 'serif'].includes(d.schrift)) d.schrift = 'hand';
  if (d.format && !['plain', 'rich'].includes(d.format)) d.format = 'plain';
  if (d.befestigung && !['tesa', 'pin', 'lose'].includes(d.befestigung)) d.befestigung = 'tesa';
  if (d.favorit != null) d.favorit = d.favorit === true;
  if (d.rich != null && typeof sauberesRichHTML === 'function') d.rich = sauberesRichHTML(d.rich);
  /* Zettel, Fotos und Blasen brauchen immer eine Position — sonst stürzt
     das Anfassen einer beschädigt importierten Anlage ab. */
  if (d.pos == null && ['zettel', 'foto', 'blase', 'sticker', 'ton'].includes(d.typ)) d.pos = { x: 10, y: 10, rot: 0, w: 30 };
  /* Kritzel-Striche, Reiter und Tonnotizen: begrenzt und bereinigt. */
  if (d.striche != null) d.striche = typeof saubereStriche === 'function' ? saubereStriche(d.striche) : [];
  if (d.skizzeBasis != null) d.skizzeBasis = String(d.skizzeBasis).slice(0, 500);
  if (d.reiter != null) {
    d.reiter = Array.isArray(d.reiter) ? d.reiter.slice(0, 40).map((r) => r && typeof r === 'object'
      ? { seite: String(r.seite || '').slice(0, 200), farbe: /^[a-z]{1,12}$/.test(String(r.farbe || '')) ? r.farbe : 'rot', name: String(r.name || '').slice(0, 40) }
      : null).filter((r) => r && r.seite) : [];
  }
  if (d.dauer != null) d.dauer = begrenze(d.dauer, 0, 36000, 0);
  /* Bücher und Briefe auf dem Schreibtisch */
  if (d.typ === 'buch') {
    if (d.seiten != null) d.seiten = Math.round(begrenze(d.seiten, 0, 100000, 0));
    if (d.seite != null) d.seite = Math.round(begrenze(d.seite, 1, 100000, 1));
    if (d.autor != null) d.autor = String(d.autor).slice(0, 200);
    if (d.isbn != null) d.isbn = String(d.isbn).replace(/[^0-9Xx]/g, '').slice(0, 13);
    if (d.coverNetz != null) d.coverNetz = d.coverNetz === true;
    if (d.zuletzt != null) d.zuletzt = begrenze(d.zuletzt, 0, Date.now() + 86400000, 0);
    if (d.lesezeichen != null) d.lesezeichen = Array.isArray(d.lesezeichen) ? [...new Set(d.lesezeichen.map((n) => Math.round(Number(n))).filter((n) => Number.isFinite(n) && n >= 1 && n <= 100000))].slice(0, 200) : [];
  }
  if (d.typ === 'buch') {
    if (d.lesezeichenFarben != null) { const aus = {}; if (d.lesezeichenFarben && typeof d.lesezeichenFarben === 'object') for (const [k, v] of Object.entries(d.lesezeichenFarben).slice(0, 200)) if (/^\d{1,6}$/.test(k) && /^#[0-9a-f]{6}$/i.test(String(v))) aus[k] = v; d.lesezeichenFarben = aus; }
    if (d.statistik != null) { const aus = {}; if (d.statistik && typeof d.statistik === 'object') for (const [k, v] of Object.entries(d.statistik).slice(-60)) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) aus[k] = Math.round(begrenze(v, 0, 100000, 0)); d.statistik = aus; }
  }
  if (d.typ === 'buchnotiz' && d.seite != null) d.seite = Math.round(begrenze(d.seite, 1, 100000, 1));
  if (d.typ === 'brief') {
    if (d.oeffnen != null) d.oeffnen = begrenze(d.oeffnen, 0, 4102444800000, 0);
    if (d.versiegelt != null) d.versiegelt = d.versiegelt === true;
  }
  for (const k of ['gewusst', 'verfehlt']) if (d[k] != null) d[k] = Math.round(begrenze(d[k], 0, 100000, 0));
  if (d.abgefragt != null) d.abgefragt = begrenze(d.abgefragt, 0, Date.now() + 86400000, 0);
  if (d.deckel != null) d.deckel = typeof saubererDeckel === 'function' ? saubererDeckel(d.deckel) : undefined;
  if (d.mime != null) d.mime = String(d.mime).slice(0, 60);
  /* Gruppen und Bilder auf Brettern liegen in Weltkoordinaten und brauchen
     eine Größe — pos.w/h dürfen dort viel größer sein als bei einer Anlage. */
  if (['gruppe', 'brettbild'].includes(d.typ)) {
    const q2 = d.pos && typeof d.pos === 'object' && !Array.isArray(d.pos) ? d.pos : {};
    d.pos = {
      x: begrenze(q2.x, -100000, 100000, 0), y: begrenze(q2.y, -100000, 100000, 0),
      rot: begrenze(q2.rot, -360, 360, 0),
      w: begrenze(q2.w, 40, 6000, d.typ === 'gruppe' ? 440 : 260),
      h: begrenze(q2.h, 40, 6000, 300)
    };
  }
  if (d.pos != null && !['gruppe', 'brettbild'].includes(d.typ)) {
    const p = d.pos && typeof d.pos === 'object' && !Array.isArray(d.pos) ? d.pos : {};
    d.pos = {
      x: begrenze(p.x, -100000, 100000, 0), y: begrenze(p.y, -100000, 100000, 0),
      rot: begrenze(p.rot, -360, 360, 0), w: begrenze(p.w, 5, 2000, 30)
    };
  }
  if (d.freiPos != null) {
    const p = d.freiPos && typeof d.freiPos === 'object' && !Array.isArray(d.freiPos) ? d.freiPos : {};
    d.freiPos = {
      x: begrenze(p.x, -100000, 100000, 0), y: begrenze(p.y, -100000, 100000, 0),
      rot: begrenze(p.rot, -20, 20, 0), w: begrenze(p.w, 180, 520, 260)
    };
  }
  if (d.sicht != null) {
    const s = d.sicht && typeof d.sicht === 'object' && !Array.isArray(d.sicht) ? d.sicht : {};
    d.sicht = { x: begrenze(s.x, -100000, 100000, 60), y: begrenze(s.y, -100000, 100000, 60), z: begrenze(s.z, .1, 5, 1) };
  }
  if (d.klang != null) {
    const k = d.klang && typeof d.klang === 'object' && !Array.isArray(d.klang) ? d.klang : {};
    const sauber = {}; for (const [id, v] of Object.entries(k).slice(0, 12)) if (typeof id === 'string' && Number.isFinite(Number(v))) sauber[id.slice(0, 40)] = begrenze(Number(v), 0, 1, 0);
    d.klang = sauber;
  }
  if (d.typ === 'lesung') {
    /* Eine Lesung der Wand: zwei JSON-Zeichenketten, sonst nichts. */
    d.stand = typeof d.stand === 'string' ? d.stand.slice(0, 200000) : '';
    d.notizen = typeof d.notizen === 'string' ? d.notizen.slice(0, 100000) : '';
  }
  if (d.typ === 'mentor') {
    const zeilen = (a) => (Array.isArray(a) ? a : []).filter((s) => typeof s === 'string').map((s) => s.slice(0, 600)).slice(0, 80);
    d.zitate = zeilen(d.zitate); d.rat = zeilen(d.rat);
    d.jahre = String(d.jahre || '').slice(0, 60); d.woher = String(d.woher || '').slice(0, 80);
    d.rahmen = ['nuss', 'gold', 'kupfer', 'dunkel'].includes(d.rahmen) ? d.rahmen : 'nuss';
  }
  if (d.staende != null) {
    d.staende = Array.isArray(d.staende) ? d.staende.slice(-20).filter((s) => s && typeof s === 'object').map((s) => ({
      wann: begrenze(s.wann, 0, Date.now() + 86400000, Date.now()),
      titel: String(s.titel || '').slice(0, 1000), text: String(s.text || '').slice(0, 10000000), ...(s.auto ? { auto: true } : {})
    })) : [];
  }
  if (d.pegel != null) {
    const p = d.pegel && typeof d.pegel === 'object' && !Array.isArray(d.pegel) ? d.pegel : {};
    d.pegel = {};
    for (const [id, wert] of Object.entries(p).slice(0, 100)) {
      if (/^[a-z0-9_-]{1,60}$/i.test(id)) { const v = begrenze(wert, 0, 1, 0); if (v > 0) d.pegel[id] = v; }
    }
  }
  d.ord = begrenze(d.ord, -1000000, 1000000, 0);
  d._rev = Math.round(begrenze(d._rev, 0, Number.MAX_SAFE_INTEGER, 0));
  d._syncZeit = begrenze(d._syncZeit, 0, Date.now() + 86400000, 0);
  d.angelegt = begrenze(d.angelegt, 0, Date.now() + 86400000, Date.now());
  d.geaendert = begrenze(d.geaendert, 0, Date.now() + 86400000, d.angelegt);
  return d;
}

async function ladeAlles() {
  await dbAuf();
  (await dbAlle('docs')).forEach((roh) => {
    const d = sauberesDokument(roh);
    if (d) D.docs.set(d.id, d);
  });
  uebernehmeEinstellungen(await dbGet('kv', 'einst'));
  const s = await dbGet('kv', 'stats');
  if (s && typeof s === 'object') D.stats = {
    tage: saubereZaehler(s.tage), letzte: saubereZaehler(s.letzte),
    letzteSicherung: begrenze(s.letzteSicherung, 0, Date.now() + 86400000, 0)
  };
}
const speichereEinst = entprellt(() => {
  sicherSpeichern('kv', D.einst, 'einst');
  if (typeof syncMetadatenGeaendert === 'function') syncMetadatenGeaendert('einst');
}, 300);
const speichereStats = entprellt(() => {
  sicherSpeichern('kv', D.stats, 'stats');
  if (typeof syncMetadatenGeaendert === 'function') syncMetadatenGeaendert('stats');
}, 800);

function markiereAenderung(d, geloescht) {
  if (!d || !d.id) return;
  const alt = Number.isFinite(d._rev) ? d._rev : 0;
  d._rev = alt + 1;
  d._geraet = GERAET_ID;
  d._syncZeit = Date.now();
  const marker = { id: d.id, rev: d._rev, geraet: GERAET_ID, wann: d._syncZeit, geloescht: !!geloescht };
  dbPut('sync', marker, d.id).catch(() => {});
  if (typeof syncDokumentGeaendert === 'function') syncDokumentGeaendert(d, !!geloescht);
}

function neuDoc(typ, felder) {
  const d = Object.assign({ id: uid(), typ, angelegt: Date.now(), geaendert: Date.now() }, felder);
  markiereAenderung(d, false);
  D.docs.set(d.id, d);
  sicherSpeichern('docs', d);
  D.stats.letzte[d.id] = worte(d.text || '');
  return d;
}
function speichere(d) { d.geaendert = Date.now(); staendeAutomatisch(d); markiereAenderung(d, false); sicherSpeichern('docs', d); }
/* Rückgängig-Verlauf: alle 15 Minuten friert das Speichern den Text still ein (höchstens 20 Stände,
   automatische weichen zuerst). Pur bis auf die Uhr. */
const STAENDE_ABSTAND = 15 * 60000;
function staendeAutomatisch(d, jetzt = Date.now()) {
  if (!d || typeof d.text !== 'string' || d.text.length < 120) return false;
  if (!['blatt', 'szene', 'seite', 'schnipsel'].includes(d.typ)) return false;
  const st = d.staende = Array.isArray(d.staende) ? d.staende : [];
  const letzter = st[st.length - 1];
  if (letzter && (jetzt - letzter.wann < STAENDE_ABSTAND || letzter.text === d.text)) return false;
  st.push({ wann: jetzt, titel: d.titel || '', text: d.text, auto: true });
  while (st.length > 20) { const i = st.findIndex((s) => s.auto); st.splice(i >= 0 ? i : 0, 1); }
  return true;
}
function speichereStill(d) { markiereAenderung(d, false); sicherSpeichern('docs', d); }

/* Löschen ist bei VANI nie endgültig: alles wandert erst in den Papierkorb. */
function _nachfahren(id, kinderDerWurzelBehalten = false) {
  const opfer = [id];
  for (let i = 0; i < opfer.length; i++) {
    for (const d of D.docs.values()) {
      const wurzelKindBleibt = kinderDerWurzelBehalten && opfer[i] === id && d.parent === id;
      if (!wurzelKindBleibt && (d.parent === opfer[i] || d.projekt === opfer[i]) && !opfer.includes(d.id)) opfer.push(d.id);
      if (d.typ === 'kante' && (d.von === opfer[i] || d.zu === opfer[i]) && !opfer.includes(d.id)) opfer.push(d.id);
      if (d.typ === 'bezug' && (d.von === opfer[i] || d.zu === opfer[i]) && !opfer.includes(d.id)) opfer.push(d.id);
    }
  }
  return opfer;
}

async function loesche(id, still, kinderDerWurzelBehalten = false) {
  const wurzel = D.docs.get(id);
  if (!wurzel) return;
  const opfer = _nachfahren(id, kinderDerWurzelBehalten);
  const opferSet = new Set(opfer);
  const buendel = { id: uid(), wann: Date.now(), name: wurzel.titel || (wurzel.text || '').slice(0, 40) || wurzel.typ, typ: wurzel.typ, docs: [], referenzen: [] };
  /* Lose Zuordnungen überleben das Löschen ihres Ziels, dürfen danach aber
     nicht als unsichtbare, kaputte Verweise im Bestand hängen bleiben. */
  const putzen = [];
  for (const d of D.docs.values()) {
    if (opferSet.has(d.id)) continue;
    if (d.projektRef && opferSet.has(d.projektRef)) { buendel.referenzen.push({ id: d.id, feld: 'projektRef', wert: d.projektRef }); putzen.push([d, 'projektRef']); }
    if (d.quelle && opferSet.has(d.quelle)) { buendel.referenzen.push({ id: d.id, feld: 'quelle', wert: d.quelle }); putzen.push([d, 'quelle']); }
    if (kinderDerWurzelBehalten && d.parent === id) { buendel.referenzen.push({ id: d.id, feld: 'parent', wert: d.parent }); putzen.push([d, 'parent']); }
  }
  for (const oid of opfer) {
    const d = D.docs.get(oid);
    if (!d) continue;
    buendel.docs.push(d);
    markiereAenderung(d, true);
  }
  /* Die Reihenfolge ist die halbe Sicherheit: Erst muss der Papierkorb den
     Inhalt wirklich haben, dann erst wird gelöscht. Andersherum wäre der Text
     zwischen zwei Speichern verschwunden, wenn dazwischen etwas schiefgeht. */
  if (!(await sicherSpeichern('papierkorb', buendel))) {
    for (const d of buendel.docs) markiereAenderung(d, false);   /* nichts ist passiert */
    toast('Der Papierkorb nimmt gerade nichts an — deshalb wurde auch nichts gelöscht. Alles ist noch da.', 8000);
    return;
  }
  for (const [d, feld] of putzen) delete d[feld];
  for (const d of new Set(putzen.map((x) => x[0]))) speichereStill(d);
  for (const d of buendel.docs) {
    D.docs.delete(d.id);
    await dbDel('docs', d.id);
  }
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
  let allesDa = true;
  for (const d of b.docs) {
    markiereAenderung(d, false);
    D.docs.set(d.id, d);
    if (!(await sicherSpeichern('docs', d))) allesDa = false;
  }
  for (const r of b.referenzen || []) {
    const d = D.docs.get(r.id);
    if (!d || !['projektRef', 'quelle', 'parent'].includes(r.feld) || typeof r.wert !== 'string') continue;
    d[r.feld] = r.wert; speichereStill(d);
  }
  /* Der Papierkorb bleibt voll, solange nicht wirklich alles zurück ist. */
  if (!allesDa) { toast('Ein Teil ließ sich noch nicht speichern — im Papierkorb liegt alles weiter bereit.', 8000); return false; }
  await dbDel('papierkorb', buendelId);
  return true;
}

async function papierkorbLeeren(nurAelterAlsTage) {
  const alle = await dbAlle('papierkorb');
  const grenze = nurAelterAlsTage ? Date.now() - nurAelterAlsTage * 86400000 : Infinity;
  for (const b of alle) {
    if (nurAelterAlsTage && b.wann > grenze) continue;
    /* Medien nur löschen, wenn kein lebendes Dokument sie noch braucht (ein Buch aus dem Goodnotes-Archiv teilt die Datei) */
    const nochGenutzt = (id) => { for (const x of D.docs.values()) if (x.bild === id || x.skizze === id || x.datei === id || x.skizzeBasis === id) return true; return false; };
    for (const d of b.docs) {
      for (const feld of ['bild', 'skizze', 'datei', 'skizzeBasis']) { const id = d[feld]; if (id && !nochGenutzt(id)) { await dbDel('media', id); if (typeof loeseMedienURL === 'function') loeseMedienURL(id); } }
      delete D.stats.letzte[d.id];
    }
    await dbDel('papierkorb', b.id);
  }
  speichereStats();
}

function kinder(pid, typ) {
  return [...D.docs.values()]
    .filter((d) => d.parent === pid && (!typ || d.typ === typ))
    .sort((a, b) => (Number.isFinite(a.ord) ? a.ord : 0) - (Number.isFinite(b.ord) ? b.ord : 0) ||
      (Number.isFinite(a.angelegt) ? a.angelegt : 0) - (Number.isFinite(b.angelegt) ? b.angelegt : 0));
}
function vomTyp(typ) {
  return [...D.docs.values()].filter((d) => d.typ === typ)
    .sort((a, b) => (Number.isFinite(b.geaendert) ? b.geaendert : 0) - (Number.isFinite(a.geaendert) ? a.geaendert : 0));
}

/* ----- Sichtbare, ausdrückliche Beziehungen ----- */
const BEZUG_ARTEN = ['gehört dazu', 'inspiriert', 'erklärt', 'widerspricht', 'spiegelt', 'Fortsetzung von', 'Figur / Ort'];
function beziehungenFuer(id) {
  return vomTyp('bezug').filter((b) => b.von === id || b.zu === id);
}
function verbindeDocs(von, zu, art = 'gehört dazu') {
  if (!von || !zu || von === zu || !D.docs.has(von) || !D.docs.has(zu)) return null;
  const vorhanden = vomTyp('bezug').find((b) => b.von === von && b.zu === zu && b.art === art);
  return vorhanden || neuDoc('bezug', { von, zu, art: BEZUG_ARTEN.includes(art) ? art : 'gehört dazu' });
}
async function trenneDocs(bezugId) {
  const b = D.docs.get(bezugId);
  if (!b || b.typ !== 'bezug') return false;
  markiereAenderung(b, true);
  D.docs.delete(b.id);
  await dbDel('docs', b.id);
  return true;
}
function ordneKinder(parent, typ) {
  kinder(parent, typ).forEach((d, i) => { d.ord = i; speichereStill(d); });
}
function blattInHeft(d, heft, position) {
  if (!d || !heft || d.typ !== 'blatt' || heft.typ !== 'heft') return false;
  const seiten = kinder(heft.id, 'seite');
  const pos = Math.round(begrenze(position, 0, seiten.length, seiten.length));
  seiten.splice(pos, 0, d);
  d.typ = 'seite'; d.parent = heft.id; d.ausBlatt = true;
  seiten.forEach((s, i) => { s.ord = i; speichereStill(s); });
  heft.geaendert = Date.now(); speichereStill(heft);
  return true;
}
function seiteZuBlatt(d) {
  if (!d || d.typ !== 'seite') return false;
  const alt = d.parent;
  d.typ = 'blatt'; delete d.parent; delete d.ausBlatt; d.ord = Date.now();
  speichere(d);
  if (alt) ordneKinder(alt, 'seite');
  return true;
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
/* Wie hoch die Flamme steht: 0 bis 1, gemessen am Tagesziel (ohne Ziel an 800
   Woertern, das ist die Schwelle zum Lodern). Pur. */
function feuerStaerke(heuteWorte, tagesziel) {
  const w = Math.max(0, Number(heuteWorte) || 0);
  const ziel = Number(tagesziel) > 0 ? Number(tagesziel) : 800;
  return Math.max(0, Math.min(1, w / ziel));
}
/* Wie viele Scheite im Feuer liegen: die Tage in Folge. Pur. */
function feuerScheite(serie) {
  const s = Math.max(0, Number(serie) || 0);
  return s >= 7 ? 3 : s >= 2 ? 2 : 1;
}

/* Die Feuerstelle als gezeichnetes Bild: Scheite, Glutbett, eine Flamme, die
   mit dem Tag waechst, Funken, wenn es lodert, und ein Faden Rauch, wenn es
   ausgegangen ist. Pur (bis auf die laufende Nummer fuer die Farbverlaeufe). */
let _feuerNr = 0;
function feuerBild(stufe, opt = {}) {
  const staerke = Math.max(0, Math.min(1, opt.staerke == null ? 1 : opt.staerke));
  const scheite = feuerScheite(opt.serie);
  const ziel = !!opt.zielErreicht;
  const id = 'feuer' + (opt.id != null ? opt.id : ++_feuerNr);
  const brennt = stufe === 'brennt' || stufe === 'lodert';
  /* Die Flamme waechst mit dem Tag: klein am Anfang, voll beim Ziel, hoch beim Lodern */
  const hoehe = stufe === 'lodert' ? 1.12 : .52 + .48 * staerke;
  const klassen = ['feuerbild', stufe, ziel ? 'ziel' : ''].filter(Boolean).join(' ');
  const scheit = (dreh, y, breite, hell) =>
    '<g transform="rotate(' + dreh + ' 24 ' + y + ')">' +
    '<rect class="scheit" x="' + (24 - breite / 2) + '" y="' + (y - 3.4) + '" width="' + breite + '" height="6.8" rx="3.4" fill="url(#' + id + '-holz)"/>' +
    '<rect class="maser" x="' + (24 - breite / 2 + 3) + '" y="' + (y - 1.1) + '" width="' + (breite - 6) + '" height="1.1" rx=".55" fill="rgba(255,232,196,' + (hell ? .16 : .09) + ')"/>' +
    '<ellipse cx="' + (24 - breite / 2 + 1.4) + '" cy="' + y + '" rx="1.5" ry="3.2" fill="rgba(30,18,8,.55)"/></g>';
  return '<svg class="' + klassen + '" viewBox="0 0 48 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">' +
    '<defs>' +
      '<linearGradient id="' + id + '-holz" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#8a5f38"/><stop offset=".55" stop-color="#6b452a"/><stop offset="1" stop-color="#3d2716"/></linearGradient>' +
      '<linearGradient id="' + id + '-aussen" x1="0" y1="1" x2="0" y2="0">' +
        '<stop offset="0" stop-color="#e2571f"/><stop offset=".45" stop-color="#f8912f"/><stop offset="1" stop-color="#ffd067" stop-opacity=".85"/></linearGradient>' +
      '<linearGradient id="' + id + '-innen" x1="0" y1="1" x2="0" y2="0">' +
        '<stop offset="0" stop-color="#ffc247"/><stop offset=".6" stop-color="#ffe6a0"/><stop offset="1" stop-color="#fff8dd"/></linearGradient>' +
      '<radialGradient id="' + id + '-schein" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ff9b3d" stop-opacity=".75"/><stop offset=".55" stop-color="#ff7a26" stop-opacity=".28"/><stop offset="1" stop-color="#ff7a26" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    /* Der Schein auf dem Boden */
    '<ellipse class="schein" cx="24" cy="47" rx="20" ry="10" fill="url(#' + id + '-schein)"/>' +
    '<ellipse class="asche" cx="24" cy="53.8" rx="16.5" ry="3.4" fill="rgba(90,74,58,.28)"/>' +
    /* Die Scheite: einer je angefangener Woche am Feuer */
    '<g class="scheite">' +
      scheit(-9, 50.5, 32, false) +
      (scheite >= 2 ? scheit(11, 47.6, 28, true) : '') +
      (scheite >= 3 ? scheit(41, 52.4, 22, false) : '') +
    '</g>' +
    /* Das Glutbett zwischen den Scheiten */
    '<g class="glut">' +
      '<ellipse cx="20" cy="48.6" rx="2.6" ry="1.5"/><ellipse cx="26.5" cy="49.4" rx="3.1" ry="1.7"/><ellipse cx="30.5" cy="47.8" rx="2" ry="1.2"/><ellipse cx="16.6" cy="49.8" rx="1.8" ry="1.1"/>' +
    '</g>' +
    /* Die Flamme: aussen, innen, Kern — die Hoehe kommt vom Tag */
    '<g class="flammenhalter" transform="translate(24 49) scale(' + (.8 + .2 * hoehe).toFixed(3) + ' ' + hoehe.toFixed(3) + ') translate(-24 -49)">' +
      '<g class="flamme">' +
        '<path class="f-aussen" d="M24 49.5c-9.6-2.4-13.4-9.6-10.6-16.6 1.4-3.6 3.8-6 4.4-9.4.4-2.4-.2-4.8-1.4-7 6 1.8 10.6 6.2 12.8 11.4 1-1.8 1.4-3.8 1.2-6 4 4 6.2 9 6.2 14 0 7.4-4.8 12.2-12.6 13.6z" fill="url(#' + id + '-aussen)"/>' +
        '<path class="f-innen" d="M24 49.5c-5.4-1.6-7.6-5.6-6.2-9.8.8-2.4 2.4-4 2.8-6.2.3-1.6 0-3.2-.8-4.6 3.8 1.4 6.6 4.4 7.8 7.8.8-1 1.2-2.2 1.2-3.6 2.4 2.8 3.6 6 3.6 9 0 4.6-2.8 7-8.4 7.4z" fill="url(#' + id + '-innen)"/>' +
        '<ellipse class="f-kern" cx="24" cy="44" rx="2.6" ry="4.2" fill="#fffbe9" opacity=".85"/>' +
      '</g>' +
    '</g>' +
    /* Funken steigen auf, wenn es richtig brennt */
    '<g class="funken">' +
      '<circle cx="17" cy="34" r="1.1"/><circle cx="30" cy="30" r=".9"/><circle cx="24" cy="26" r="1.3"/><circle cx="33" cy="38" r=".8"/>' +
    '</g>' +
    /* Und ein Faden Rauch, wenn es aus ist */
    '<g class="rauch"><path d="M24 46c-3 -4 2-6 0-10s2-6 1-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".3"/></g>' +
    '</svg>';
}
function flammeHTML() {
  return feuerBild(feuerstufe(), {
    staerke: feuerStaerke(D.stats.tage[tagKey()] || 0, D.einst.tagesziel),
    serie: straehne(),
    zielErreicht: D.einst.tagesziel > 0 && (D.stats.tage[tagKey()] || 0) >= D.einst.tagesziel
  });
}

/* ----- Thema ----- */
const THEMEN = { papier: '#ece3d1', tinte: '#141110', kerze: '#1b1206', nebel: '#e2e5e1', weiss: '#ffffff' };
function setzeThema(name) {
  document.documentElement.dataset.thema = name;
  D.einst.thema = name;
  const m = $('meta[name="theme-color"]');
  if (m) m.content = THEMEN[name] || '#ece3d1';
  speichereEinst();
}

/* ----- Toast, Modale, Menüs ----- */
function toast(text, ms = 2400) {
  /* Ganz frueh beim Start und mitten in einem Absturz kann es die Buehne noch
     nicht geben. Dann schweigt der Hinweis, statt einen zweiten Fehler auf den
     ersten zu werfen. */
  const buehne = $('#toasts');
  if (!buehne) { try { console.warn('[vani]', text); } catch (e) {} return; }
  const t = el('div', { class: 'toast' }, text);
  buehne.append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 450); }, ms);
}
function toastMitAktion(text, aktion, tu, ms = 5200) {
  const buehne = $('#toasts');
  if (!buehne) { toast(text, ms); return; }
  const knopf = el('button', { class: 'toastaktion', onclick: () => { t.remove(); tu(); } }, aktion);
  const t = el('div', { class: 'toast anfassbar' }, text, knopf);
  buehne.append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 450); }, ms);
}

function zeigeDeck(inhalt, beiZu) {
  const fokusVorher = document.activeElement;
  const schleier = el('div', { class: 'schleier' }, inhalt);
  schleier.addEventListener('pointerdown', (e) => { if (e.target === schleier) zu(); });
  /* Escape schließt nur die oberste Lage — wie ein Tipp neben den Kasten. */
  const beiTaste = (e) => {
    if (e.key !== 'Escape') return;
    if (!schleier.parentElement || schleier !== schleier.parentElement.lastElementChild) return;
    e.stopPropagation(); e.preventDefault();
    zu();
  };
  const zu = () => { document.removeEventListener('keydown', beiTaste, true); schleier.remove(); if (beiZu) beiZu(); if (fokusVorher && fokusVorher !== document.body && fokusVorher.isConnected && typeof fokusVorher.focus === 'function' && !$('#deck').querySelector('.schleier')) { try { fokusVorher.focus({ preventScroll: true }); } catch (e) {} } };
  document.addEventListener('keydown', beiTaste, true);
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
    /* Mit der Tastatur: Pfeile wandern, Ziffern springen, Enter wählt. */
    const beiTaste = (e) => {
      const knoepfe = $$('button', kasten);
      if (!knoepfe.length) return;
      const jetzt = knoepfe.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const naechst = e.key === 'ArrowDown'
          ? (jetzt + 1) % knoepfe.length
          : (jetzt <= 0 ? knoepfe.length - 1 : jetzt - 1);
        knoepfe[naechst].focus();
      } else if (/^[1-9]$/.test(e.key)) {
        const k = knoepfe[Number(e.key) - 1];
        if (k) { e.preventDefault(); k.click(); }
      }
    };
    const kasten = el('div', { class: 'menue' },
      titel ? el('div', { class: 'mtitel' }, titel) : null,
      punkte.filter(Boolean).map((p) =>
        el('button', { class: p.rot ? 'rot' : '', onclick: () => { res(p.wert !== undefined ? p.wert : p.text); zu(); } },
          p.icon ? el('span', { html: ik(p.icon), style: 'display:flex' }) : null,
          p.text)
      )
    );
    const zu = zeigeDeck(kasten, () => { document.removeEventListener('keydown', beiTaste, true); res(null); });
    document.addEventListener('keydown', beiTaste, true);
    setTimeout(() => { const erste = $('button', kasten); if (erste && matchMedia('(pointer:fine)').matches) erste.focus(); }, 40);
  });
}

/* ----- Gesten ----- */
function langdruck(elem, fn) {
  let timer = null, sx = 0, sy = 0;
  elem.addEventListener('click', (e) => {
    if (elem._langGedrueckt && Date.now() - elem._langGedrueckt < 900) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  elem.addEventListener('pointerdown', (e) => {
    sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => { timer = null; if (!elem._zieht) { elem._langGedrueckt = Date.now(); fn(e); } }, 480);
  });
  const abbruch = (e) => {
    if (timer && e.type === 'pointermove' && Math.hypot(e.clientX - sx, e.clientY - sy) < 12) return;
    clearTimeout(timer); timer = null;
  };
  elem.addEventListener('pointermove', abbruch);
  elem.addEventListener('pointerup', abbruch);
  elem.addEventListener('pointercancel', abbruch);
  elem.addEventListener('contextmenu', (e) => { e.preventDefault(); elem._langGedrueckt = Date.now(); fn(e); });
}

/* Ein Textfeld waechst mit. Wichtig dabei: waehrend des Messens ist es kurz
   nur eine Zeile hoch — der Browser kappt in diesem Moment die Scrollposition
   aller Kaesten darueber. Wer weit unten in einer langen Rolle schrieb, landete
   dadurch nach jedem Zeichen woanders. Also: Sicht merken und zurueckgeben. */
function autogrow(ta) {
  const anpassen = () => {
    const merker = [];
    for (let p = ta.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      if (p.scrollTop) merker.push([p, p.scrollTop]);
    }
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
    for (const [p, oben] of merker) if (p.scrollTop !== oben) p.scrollTop = oben;
  };
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
function merkeFadenZiel(id, hash = location.hash) {
  if (!id) return 'nichts';
  sessionStorage.setItem('zielFaden', String(id));
  return hash === '#/faden' || String(hash || '').startsWith('#/faden/') ? 'neuzeichnen' : 'wechseln';
}
function oeffneDoc(d) {
  if (!d) return;
  if (d.typ === 'blatt') { location.hash = '#/blaetter'; setTimeout(() => oeffneSchreibraum(d.id), 80); }
  else if (d.typ === 'faden') {
    if (merkeFadenZiel(d.id) === 'neuzeichnen') zeichne();
    else location.hash = '#/faden';
  }
  else if (d.typ === 'funkeln') { if (typeof zeigeTextFund === 'function') zeigeTextFund(d); }
  else if (d.typ === 'mischung') location.hash = '#/klang';
  else if (d.typ === 'goodnote') { location.hash = '#/goodnotes'; setTimeout(() => oeffneGoodnote(d), 80); }
  else if (d.typ === 'schnipsel') location.hash = '#/schnipsel';
  else if (d.typ === 'heft') location.hash = '#/heft/' + d.id;
  else if (d.typ === 'seite') { sessionStorage.setItem('zielSeite', d.id); location.hash = '#/heft/' + d.parent; }
  else if (d.typ === 'projekt') location.hash = '#/projekt/' + d.id;
  else if (d.typ === 'kapitel' || d.typ === 'figur') location.hash = '#/projekt/' + d.parent;
  else if (d.typ === 'szene') { location.hash = '#/projekt/' + d.projekt; setTimeout(() => oeffneSchreibraum(d.id), 80); }
  else if (d.typ === 'board') location.hash = '#/brett/' + d.id;
  else if (d.typ === 'blase' || d.typ === 'gruppe' || d.typ === 'brettbild') location.hash = '#/brett/' + d.parent;
  else if (d.typ === 'wort' || d.typ === 'wortkiste') location.hash = '#/woerter';
  else if (d.typ === 'klang' || d.typ === 'klangbild') location.hash = '#/klang';
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

/* ----- Schlagworte: #wort im Text, über alles gezählt ----- */
function schlagwortIndex(docs, max = 40) {
  const zaehl = new Map();
  const re = /(^|\s)#([\wäöüÄÖÜß-]{2,30})/g;
  for (const d of docs) {
    if (!d || typeof d.text !== 'string' || d.typ === 'goodnote') continue;
    const gesehen = new Set();
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(d.text))) {
      const w = m[2].toLowerCase();
      if (gesehen.has(w)) continue;
      gesehen.add(w);
      zaehl.set(w, (zaehl.get(w) || 0) + 1);
    }
  }
  return [...zaehl.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de')).slice(0, Math.max(0, max)).map(([wort, anzahl]) => ({ wort, anzahl }));
}

/* ----- Startauftrag aus der Adresse: geteilter Text oder Schnellstart -----
   Android kann Text nach VANI teilen; das Home-Icon kann mit „Neuer Schnipsel"
   aufgehen. Beides kommt als Suchteil der Adresse an und wird sofort wieder
   entfernt — die Adresse bleibt die eine Hauptadresse. */
function startAuftrag(search) {
  let q;
  try { q = new URLSearchParams(String(search || '')); } catch (e) { return null; }
  const titel = String(q.get('titel') || '').trim().slice(0, 500);
  const text = String(q.get('text') || '').trim().slice(0, 200000);
  const url = String(q.get('url') || '').trim().slice(0, 2000);
  if (titel || text || url) {
    const teile = [];
    if (titel && titel !== text) teile.push(titel);
    if (text) teile.push(text);
    if (url && !text.includes(url)) teile.push(url);
    return { art: 'geteilt', text: teile.join('\n') };
  }
  const neu = String(q.get('neu') || '').trim();
  if (['schnipsel', 'blatt', 'suche'].includes(neu)) return { art: 'neu', was: neu };
  return null;
}

/* ----- Jahresraster: 7 Reihen × Wochen, wie ein Kalender aus Punkten ----- */
function jahresRaster(tage, wochen = 53, jetzt = Date.now()) {
  const n = Number(wochen);
  wochen = Math.max(1, Math.min(60, Number.isFinite(n) ? Math.round(n) : 53));
  const quelle = tage && typeof tage === 'object' ? tage : {};
  const heute = new Date(jetzt); heute.setHours(0, 0, 0, 0);
  /* Montag als Wochenanfang */
  const wochentag = (heute.getDay() + 6) % 7;
  const ende = new Date(heute); ende.setDate(heute.getDate() + (6 - wochentag));
  const start = new Date(ende); start.setDate(ende.getDate() - wochen * 7 + 1);
  const spalten = [];
  let max = 0;
  const d = new Date(start);
  for (let w = 0; w < wochen; w++) {
    const spalte = [];
    for (let t = 0; t < 7; t++) {
      const k = tagKey(d);
      const n = d > heute ? null : Math.max(0, Math.round(Number(quelle[k]) || 0));
      if (n) max = Math.max(max, n);
      spalte.push({ tag: k, worte: n, heute: k === tagKey(heute) });
      d.setDate(d.getDate() + 1);
    }
    spalten.push(spalte);
  }
  for (const sp of spalten) for (const z of sp) {
    z.stufe = z.worte === null ? -1 : z.worte === 0 ? 0 : z.worte >= max * .66 ? 3 : z.worte >= max * .33 ? 2 : 1;
  }
  return { spalten, max, von: tagKey(start), bis: tagKey(ende) };
}
