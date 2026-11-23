/* ================================================================
   VANI — privater, Ende-zu-Ende-verschlüsselter Mehrgeräte-Sync
   ================================================================ */

const SYNC_NETZ = Object.freeze({ art: 'netz' });
const SYNC_LOKAL = Object.freeze({ art: 'lokal' });
const SYNC_TEXTFELDER = new Set(['text', 'titel', 'notiz', 'schlagworte', 'label']);
const SYNC_INTERNE_FELDER = new Set(['_rev', '_geraet', '_syncZeit']);
let _sync = {
  config: null, ydoc: null, ydocs: null, ystate: null, ymedia: null, persistence: null,
  poll: null, retry: null, status: { art: 'aus' }, uebernimmt: false, anwendenTimer: null,
  sendet: false, holt: false, medien: false, generation: 0, fremdZuletzt: 0, nachzug: null,
  aufgeholt: false, geholt: 0, seite: 20, merken: null, merkenOffen: 0, einstUebernommen: null,
  wartend: 0, haengt: null, rettung: null, nichtRettbar: null, wach: null, wachGewuenscht: false
};
/* Hat die andere Seite in den letzten Minuten etwas gebracht? (zweite Tasse am Schreibtisch) */
function syncFremdAktiv(minuten = 20) { return !!_sync.config && _sync.fremdZuletzt > 0 && Date.now() - _sync.fremdZuletzt < minuten * 60000; }

function syncMelde(art, extra) {
  _sync.status = Object.assign({ art, wann: Date.now() }, extra || {});
  syncWachHalten(art === 'sendet' || (art === 'verbindet' && !!(extra && extra.geholt)));
  try { window.dispatchEvent(new CustomEvent('vani-sync-status', { detail: _sync.status })); } catch (e) {}
  return _sync.status;
}
/* Waehrend ein grosser Bestand hinausgeht oder ankommt, soll der Bildschirm
   nicht einschlafen: iPad und Handy halten eine App im Hintergrund an, und
   dann steht auch der Abgleich. Wo es keine Wachhaltung gibt, passiert nichts. */
function syncWachHalten(an) {
  _sync.wachGewuenscht = !!an;
  try {
    if (an && !_sync.wach && navigator.wakeLock && document.visibilityState === 'visible') {
      _sync.wach = 'kommt';
      navigator.wakeLock.request('screen').then((w) => {
        if (!_sync.wachGewuenscht) { _sync.wach = null; w.release().catch(() => {}); return; }
        _sync.wach = w;
        w.addEventListener('release', () => { if (_sync.wach === w) _sync.wach = null; });
      }).catch(() => { _sync.wach = null; });
    } else if (!an && _sync.wach && _sync.wach !== 'kommt') {
      const w = _sync.wach; _sync.wach = null; w.release().catch(() => {});
    }
  } catch (e) { _sync.wach = null; }
}
function syncInfo() {
  return {
    verbunden: !!_sync.config,
    name: _sync.config ? _sync.config.name : '',
    server: _sync.config ? _sync.config.server : '',
    vault: _sync.config ? _sync.config.vault : '',
    status: Object.assign({}, _sync.status),
    hier: D.docs.size,
    imBereich: _sync.ydocs ? _sync.ydocs.size : 0,
    wartend: _sync.wartend || 0
  };
}
function syncIstVerbunden() { return !!_sync.config; }
function syncZufall(bytes = 32) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return syncB64(a);
}
function syncB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function syncBytes(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]+$/.test(s) || s.length > 32 * 1024 * 1024) throw new Error('Ungültige Binärdaten');
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4);
  const bin = atob(b64);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
function syncServerAdresse(wert) {
  try {
    const u = new URL(String(wert || '').trim());
    const lokal = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && lokal)) return '';
    u.pathname = u.pathname.replace(/\/+$/, '');
    u.search = ''; u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch (e) { return ''; }
}
function syncSaubereConfig(c) {
  if (!c || c.v !== 1) return null;
  const server = syncServerAdresse(c.server);
  if (!server || !/^[A-Za-z0-9_-]{20,100}$/.test(c.vault || '') ||
      !/^[A-Za-z0-9_-]{40,180}$/.test(c.token || '') || !/^[A-Za-z0-9_-]{40,80}$/.test(c.key || '')) return null;
  return { v: 1, name: String(c.name || 'Mein Bereich').slice(0, 80), server, vault: c.vault, token: c.token, key: c.key };
}
/* Der unsichtbare öffentliche VANI-Sync-Dienst. Die sichtbare App hat genau
   eine andere, feste Adresse; nur die verschlüsselten Pakete gehen hierhin. */
const SYNC_STANDARD_DIENST = 'https://vani-schreibzuhause.craftkey.chatgpt.site';
async function syncStandardServer() {
  try {
    if (globalThis.vaniDesktop && vaniDesktop.konfiguration) {
      const c = await vaniDesktop.konfiguration();
      const s = syncServerAdresse(c && c.syncServerUrl);
      if (s) return s;
    }
  } catch (e) {}
  const origin = String(location.origin || '');
  const lokal = /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(origin);
  if (lokal) return origin;
  return SYNC_STANDARD_DIENST;
}
async function syncLadeConfig() {
  let roh = null;
  const profilId = AKTIVES_PROFIL && AKTIVES_PROFIL.datenbank === 'vani' ? 'legacy' : AKTIVES_PROFIL_ID;
  try { if (globalThis.vaniDesktop && vaniDesktop.geheimnisLesen) roh = await vaniDesktop.geheimnisLesen(profilId); } catch (e) {}
  if (!roh) try { roh = await dbGet('kv', 'sync-config'); } catch (e) {}
  const warGesichert = !!(roh && roh.gesichert === 1);
  if (warGesichert && typeof profilEntschluesseleObjekt === 'function') roh = await profilEntschluesseleObjekt(roh);
  const sauber = syncSaubereConfig(roh);
  /* Alte Web-Installationen lagen unverschlüsselt in IndexedDB. Nach dem
     ersten Profil-Login wird das Geheimnis still mit dem Profilpasswort
     umhüllt. */
  if (sauber && !(globalThis.vaniDesktop && vaniDesktop.geheimnisLesen) && !warGesichert) {
    try { await syncSpeichereConfig(sauber); } catch (e) {}
  }
  return sauber;
}
async function syncSpeichereConfig(c) {
  const profilId = AKTIVES_PROFIL && AKTIVES_PROFIL.datenbank === 'vani' ? 'legacy' : AKTIVES_PROFIL_ID;
  if (globalThis.vaniDesktop && vaniDesktop.geheimnisSpeichern) {
    await vaniDesktop.geheimnisSpeichern(c, profilId);
    try { await dbDel('kv', 'sync-config'); } catch (e) {}
  } else {
    const paket = typeof profilVerschluesseleObjekt === 'function' ? await profilVerschluesseleObjekt(c) : c;
    await dbPut('kv', paket, 'sync-config');
  }
}
async function syncLoescheConfig() {
  const profilId = AKTIVES_PROFIL && AKTIVES_PROFIL.datenbank === 'vani' ? 'legacy' : AKTIVES_PROFIL_ID;
  try { if (globalThis.vaniDesktop && vaniDesktop.geheimnisLoeschen) await vaniDesktop.geheimnisLoeschen(profilId); } catch (e) {}
  try { await dbDel('kv', 'sync-config'); } catch (e) {}
}
async function syncLadeSeq(vault) { return Math.round(begrenze(await dbGet('kv', 'sync-seq:' + vault), 0, Number.MAX_SAFE_INTEGER, 0)); }
async function syncSpeichereSeq(vault, seq) { await dbPut('kv', Math.round(seq), 'sync-seq:' + vault); }

function syncKopplungscode() {
  if (!_sync.config) return '';
  return 'VANI1-' + syncB64(new TextEncoder().encode(JSON.stringify(_sync.config)));
}
function syncLeseKopplungscode(code) {
  try {
    const rein = String(code || '').trim().replace(/\s+/g, '');
    if (!rein.startsWith('VANI1-') || rein.length > 1600) return null;
    return syncSaubereConfig(JSON.parse(new TextDecoder().decode(syncBytes(rein.slice(6)))));
  } catch (e) { return null; }
}
async function syncSchluessel() {
  if (!_sync.config) throw new Error('Kein Bereich');
  return crypto.subtle.importKey('raw', syncBytes(_sync.config.key), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function syncVerschluessle(update) {
  const id = syncZufall(24);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aad = new TextEncoder().encode(_sync.config.vault + ':' + id + ':1');
  const daten = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, await syncSchluessel(), update);
  return { id, iv: syncB64(iv), ciphertext: syncB64(new Uint8Array(daten)), vault: _sync.config.vault };
}
async function syncEntschluessle(paket) {
  const aad = new TextEncoder().encode(_sync.config.vault + ':' + paket.id + ':1');
  const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: syncBytes(paket.iv), additionalData: aad }, await syncSchluessel(), syncBytes(paket.ciphertext));
  return new Uint8Array(klar);
}
async function syncVerschluessleBlock(bytes, id, block) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aad = new TextEncoder().encode(_sync.config.vault + ':blob:' + id + ':' + block + ':1');
  const daten = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, await syncSchluessel(), bytes);
  return { iv: syncB64(iv), ciphertext: syncB64(new Uint8Array(daten)) };
}
async function syncEntschluessleBlock(paket, id, block) {
  const aad = new TextEncoder().encode(_sync.config.vault + ':blob:' + id + ':' + block + ':1');
  const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: syncBytes(paket.iv), additionalData: aad }, await syncSchluessel(), syncBytes(paket.ciphertext));
  return new Uint8Array(klar);
}
/* ----- Wie lange eine Anfrage dauern darf -----
   Frueher galten fuer alles 15 Sekunden. Das reicht fuer eine Aenderung, aber
   nicht fuer den ersten Abgleich eines grossen Bestands: bei langsamem Netz
   brach das Herunterladen jedes Mal ab und fing beim naechsten Versuch wieder
   bei null an. Nachgestellt mit 150 Texten: ein neuer Laptop bei 10 Mbit/s
   bekam 0 von 150.

   Jetzt gilt: Hochladen bekommt Zeit nach Groesse (vorsichtig gerechnet mit
   20 KB/s), und eine Antwort wird nur abgebrochen, wenn wirklich nichts mehr
   fliesst. Pur. */
const SYNC_STILLSTAND_MS = 30000;
function syncZeitFuer(bytes) {
  const b = Math.max(0, Number(bytes) || 0);
  return Math.min(15 * 60000, 15000 + Math.ceil(b / 20000) * 1000);
}
async function syncFetch(pfad, optionen, config) {
  const c = config || _sync.config;
  if (!c) throw new Error('Kein Bereich');
  const controller = new AbortController();
  const koerper = optionen && optionen.body;
  let timer = setTimeout(() => controller.abort(), syncZeitFuer(typeof koerper === 'string' ? koerper.length : 0));
  const nochDa = () => { clearTimeout(timer); timer = setTimeout(() => controller.abort(), SYNC_STILLSTAND_MS); };
  try {
    const headers = Object.assign({ Authorization: 'Bearer ' + c.token }, optionen && optionen.headers || {});
    const antwort = await fetch(c.server + pfad, Object.assign({}, optionen || {}, { headers, signal: controller.signal, cache: 'no-store' }));
    /* Ab hier zaehlt der Stillstand: solange Daten fliessen, darf es dauern. */
    nochDa();
    let text = '';
    if (antwort.body && typeof antwort.body.getReader === 'function' && typeof TextDecoder !== 'undefined') {
      const leser = antwort.body.getReader();
      const dekoder = new TextDecoder();
      for (;;) {
        const { done, value } = await leser.read();
        if (done) break;
        nochDa();
        text += dekoder.decode(value, { stream: true });
      }
      text += dekoder.decode();
    } else {
      text = await antwort.text();
    }
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) {}
    if (!antwort.ok) {
      const err = new Error(body && body.fehler || 'Verbindung fehlgeschlagen');
      err.status = antwort.status; throw err;
    }
    return body || {};
  } finally { clearTimeout(timer); }
}
async function syncPruefeConfig(c) {
  await syncFetch('/v1/vaults/' + encodeURIComponent(c.vault) + '/updates?after=0&limit=1', { method: 'GET' }, c);
  return true;
}

function syncTextSetzen(ytext, text) {
  text = String(text || '');
  const alt = ytext.toString();
  if (alt === text) return;
  let vorne = 0;
  while (vorne < alt.length && vorne < text.length && alt[vorne] === text[vorne]) vorne++;
  let hinten = 0;
  while (hinten < alt.length - vorne && hinten < text.length - vorne && alt[alt.length - 1 - hinten] === text[text.length - 1 - hinten]) hinten++;
  const loesch = alt.length - vorne - hinten;
  if (loesch > 0) ytext.delete(vorne, loesch);
  const neu = text.slice(vorne, text.length - hinten);
  if (neu) ytext.insert(vorne, neu);
}
function syncSchreibeDokument(d) {
  if (!_sync.ydoc || !_sync.ydocs || _sync.uebernimmt || !d || !d.id) return;
  const Y = VaniY.Y;
  let y = _sync.ydocs.get(d.id);
  if (!(y instanceof Y.Map)) { y = new Y.Map(); _sync.ydocs.set(d.id, y); }
  const felder = new Set(Object.keys(d).filter((k) => !SYNC_INTERNE_FELDER.has(k)));
  for (const k of [...y.keys()]) if (!felder.has(k)) y.delete(k);
  for (const k of felder) {
    const wert = d[k];
    if (SYNC_TEXTFELDER.has(k)) {
      let text = y.get(k);
      if (!(text instanceof Y.Text)) { text = new Y.Text(); y.set(k, text); }
      syncTextSetzen(text, wert);
    } else {
      let gepackt;
      try { gepackt = JSON.stringify(wert); } catch (e) { continue; }
      if (gepackt !== undefined && y.get(k) !== gepackt) y.set(k, gepackt);
    }
  }
}
function syncLeseDokument(id, y) {
  const Y = VaniY.Y;
  if (!(y instanceof Y.Map)) return null;
  const roh = { id };
  for (const [k, wert] of y.entries()) {
    if (SYNC_TEXTFELDER.has(k) && wert instanceof Y.Text) roh[k] = wert.toString();
    else if (typeof wert === 'string') { try { roh[k] = JSON.parse(wert); } catch (e) {} }
  }
  return sauberesDokument(roh);
}
function syncDokumentGeaendert(d, geloescht) {
  if (!_sync.ydoc || !d || !d.id) return;
  /* Mitten in einer Übernahme: merken und danach nachziehen — sonst ginge die Änderung verloren */
  if (_sync.uebernimmt) { (_sync.nachzug = _sync.nachzug || new Map()).set(d.id, { d, geloescht }); return; }
  _sync.ydoc.transact(() => {
    if (geloescht) _sync.ydocs.delete(d.id);
    else syncSchreibeDokument(d);
  }, SYNC_LOKAL);
}
function syncMetadatenGeaendert(art) {
  if (!_sync.ydoc || !_sync.ystate || _sync.uebernimmt) return;
  /* Nur schreiben, was sich wirklich aendert: Yjs macht aus jedem Setzen ein
     neues Paket, auch beim selben Wert. Und nichts zurueckschreiben, was eben
     erst von drueben uebernommen wurde: Die Uebernahme sichert die
     Einstellungen (setzeThema), und weil sie dabei aufgeraeumt werden, sahen
     sie jedes Mal ein wenig anders aus — zwei offene Geraete schickten sie
     sich so endlos hin und her, und der Dienst hob jedes Paket auf. */
  const neu = {};
  if (!art || art === 'einst') {
    const j = JSON.stringify(D.einst);
    const u = _sync.einstUebernommen;
    /* Gilt ueber einen Neustart hinweg, aber nur fuer denselben Bereich: Ein
       verzoegertes Sichern aus der letzten Uebernahme landete sonst genau
       zwischen Neustart und neuer Uebernahme und schickte ein leeres Paket. */
    if (!(u && _sync.config && u.vault === _sync.config.vault && u.json === j)) neu.einst = j;
  }
  if (!art || art === 'stats') neu.stats = JSON.stringify(D.stats);
  const anders = Object.keys(neu).filter((k) => _sync.ystate.get(k) !== neu[k]);
  if (!anders.length) return;
  /* Wer selbst schreibt, vergleicht beim naechsten Mal mit dem Bereich — sonst
     ginge das Zuruecksetzen auf den uebernommenen Wert nicht mehr hinaus. */
  if (anders.includes('einst')) _sync.einstUebernommen = null;
  _sync.ydoc.transact(() => { for (const k of anders) _sync.ystate.set(k, neu[k]); }, SYNC_LOKAL);
}
/* Ungefaehres Gewicht eines Dokuments im Sync — nur fuers Aufteilen. Pur. */
function syncDokumentGewicht(d) {
  try { return 64 + JSON.stringify(d).length; } catch (e) { return 64; }
}
/* Den Bestand in Portionen teilen, jede hoechstens etwa maxBytes schwer.
   Ein einzelnes schweres Dokument ist seine eigene Portion. Pur. */
function syncSeedPortionen(docs, maxBytes = 512 * 1024) {
  const portionen = [];
  let jetzt = [], summe = 0;
  for (const d of docs || []) {
    const g = syncDokumentGewicht(d);
    if (jetzt.length && summe + g > maxBytes) { portionen.push(jetzt); jetzt = []; summe = 0; }
    jetzt.push(d); summe += g;
  }
  if (jetzt.length) portionen.push(jetzt);
  return portionen;
}
function syncSeedLokal() {
  if (!_sync.ydoc) return;
  /* Jede Portion ist ihr eigenes Paket. Frueher war der ganze Bestand EIN
     Paket — viele Megabyte, die bei langsamem Netz nie in einem Stueck
     durchkamen. So kommt jede Portion einzeln an, und was angekommen ist,
     bleibt angekommen. */
  for (const portion of syncSeedPortionen([...D.docs.values()])) {
    _sync.ydoc.transact(() => { for (const d of portion) syncSchreibeDokument(d); }, SYNC_LOKAL);
  }
  _sync.ydoc.transact(() => {
    _sync.ystate.set('einst', JSON.stringify(D.einst));
    _sync.ystate.set('stats', JSON.stringify(D.stats));
  }, SYNC_LOKAL);
}
/* Wird gerade geschrieben? Dann darf der Raum nicht unter den Händen neu
   entstehen — das Feld verlöre den Fokus, die Tastatur klappte zu, hinter dem
   Schreibraum führe der Raum hoch. */
function syncSchreibtGerade() {
  try {
    if (typeof _sr !== 'undefined' && _sr) return true;
    const a = document.activeElement;
    if (!a) return false;
    if (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT' || a.isContentEditable) return true;
    if (document.querySelector('.kritzelflaeche, .schleier')) return true;
  } catch (e) {}
  return false;
}
function syncGleich(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
}
async function syncUebernehmeAusY() {
  if (!_sync.ydocs || _sync.uebernimmt) return;
  _sync.uebernimmt = true;
  let veraendert = 0;
  const start = Date.now();
  const ohneIntern = (o) => { const k = { ...o }; for (const f of SYNC_INTERNE_FELDER) delete k[f]; return k; };
  try {
    const da = new Set();
    for (const [id, y] of _sync.ydocs.entries()) {
      const d = syncLeseDokument(id, y);
      if (!d) continue;
      da.add(id);
      const alt = D.docs.get(id);
      /* Nur was sich wirklich unterscheidet, wird übernommen — und zwar in
         das vorhandene Objekt hinein, damit offene Editoren, die es halten,
         weiterschreiben können, statt ins Leere. */
      if (alt && syncGleich(ohneIntern(alt), ohneIntern(d))) continue;
      if (alt && _sync.nachzug && _sync.nachzug.has(id)) continue;   /* lokal gerade geändert: lokal gewinnt, kommt gleich nach */
      /* Der Text ist hier gerade offen: nicht unter den Haenden austauschen (der naechste
         Tastendruck schriebe den alten Stand zurueck). Die Fassung vom anderen Geraet
         wird als Stand eingefroren; was hier geschrieben wird, gewinnt und geht hinueber. */
      if (alt && typeof _sr !== 'undefined' && _sr && _sr.doc && _sr.doc.id === id && (d.text !== alt.text || d.rich !== alt.rich)) {
        if (typeof standEinfrieren === 'function') { standEinfrieren(alt, 'Fassung vom anderen Gerät', d.text, d.rich); await sicherSpeichern('docs', alt); }
        if (!_sync.offenGewarnt || _sync.offenGewarnt !== id) { _sync.offenGewarnt = id; toast('Dieser Text wurde auf dem anderen Gerät geändert. Die Fassung von dort liegt unter „Stände“.', 5200); }
        continue;
      }
      if (alt) {
        for (const k of Object.keys(alt)) if (!(k in d) && !SYNC_INTERNE_FELDER.has(k)) delete alt[k];
        for (const f of SYNC_INTERNE_FELDER) delete d[f];
        Object.assign(alt, d);
        await sicherSpeichern('docs', alt);
      } else {
        D.docs.set(id, d); await sicherSpeichern('docs', d);
      }
      veraendert++;
    }
    /* Was im Bereich fehlt, darf hier erst gehen, wenn der Bereich vollstaendig
       angekommen ist. Mitten im Herunterladen fehlt dort noch vieles, das es
       sehr wohl gibt — das waere Wegraeumen, bevor der Ersatz sicher steht.
       Dasselbe, solange von hier noch eigene Pakete unterwegs sind: der Dienst
       wirkt dann vollstaendig, kennt aber gerade das noch nicht, was dieses
       Geraet ihm eben erst schickt. Nachgestellt: ein Geraet, das waehrend des
       ersten Hochladens neu startete, raeumte 124 von 150 eigenen Texten weg. */
    let eigeneUnterwegs = _sync.merkenOffen > 0;
    if (!eigeneUnterwegs) {
      try { eigeneUnterwegs = !!_sync.config && (await syncWartendeSchluessel(_sync.config.vault)).length > 0; }
      catch (e) { eigeneUnterwegs = true; }
    }
    if (_sync.aufgeholt && !eigeneUnterwegs) {
      for (const id of [...D.docs.keys()]) {
        const d = D.docs.get(id);
        /* Nur löschen, was nicht währenddessen hier entstanden oder angefasst wurde */
        if (!da.has(id) && !(d && (d.angelegt > start || d.geaendert > start)) && !(_sync.nachzug && _sync.nachzug.has(id))) {
          /* Loeschen ist nie endgueltig — auch nicht, wenn es vom anderen Geraet kommt. */
          try { if (d) { await sicherSpeichern('papierkorb', { id: uid(), wann: Date.now(), name: d.titel || (d.text || '').slice(0, 40) || d.typ, typ: d.typ, docs: [d], referenzen: [], herkunft: 'sync' }); if (typeof papierkorbZahlSetzen === 'function' && typeof _korbZahl === 'number') papierkorbZahlSetzen(_korbZahl + 1); } } catch (e) {}
          D.docs.delete(id); await dbDel('docs', id); veraendert++;
        }
      }
    }
    if (veraendert) _sync.fremdZuletzt = Date.now();
    const einst = _sync.ystate.get('einst');
    if (typeof einst === 'string') try { uebernehmeEinstellungen(JSON.parse(einst)); await sicherSpeichern('kv', D.einst, 'einst'); setzeThema(D.einst.thema); _sync.einstUebernommen = { vault: _sync.config && _sync.config.vault, json: JSON.stringify(D.einst) }; } catch (e) {}
    const stats = _sync.ystate.get('stats');
    if (typeof stats === 'string') try {
      const s = JSON.parse(stats);
      D.stats = { tage: saubereZaehler(s.tage), letzte: saubereZaehler(s.letzte), letzteSicherung: begrenze(s.letzteSicherung, 0, Date.now() + 86400000, 0) };
      await sicherSpeichern('kv', D.stats, 'stats');
    } catch (e) {}
  } finally {
    _sync.uebernimmt = false;
    const n = _sync.nachzug; _sync.nachzug = null;
    if (n) for (const { d, geloescht } of n.values()) syncDokumentGeaendert(d, geloescht);
  }
  if (!veraendert && !_sync.zeichnenAusstehend) return;
  /* Neu zeichnen nur, wenn sich etwas geändert hat — und nie mitten ins
     Schreiben hinein. Dann wartet es, bis die Hände ruhen. */
  if (syncSchreibtGerade()) {
    _sync.zeichnenAusstehend = true;
    clearTimeout(_sync.zeichnenTimer);
    _sync.zeichnenTimer = setTimeout(() => { if (_sync.zeichnenAusstehend && !syncSchreibtGerade()) { _sync.zeichnenAusstehend = false; try { baueLeiste(); zeichne(); } catch (e) {} } }, 6000);
    return;
  }
  _sync.zeichnenAusstehend = false;
  try { baueLeiste(); zeichne(); } catch (e) {}
}
/* Wenn der Fokus den Text verlässt, holt VANI ein aufgeschobenes Neuzeichnen nach. */
try {
  document.addEventListener('focusout', () => {
    if (!_sync.zeichnenAusstehend) return;
    setTimeout(() => { if (_sync.zeichnenAusstehend && !syncSchreibtGerade()) { _sync.zeichnenAusstehend = false; try { baueLeiste(); zeichne(); } catch (e) {} } }, 400);
  });
  window.addEventListener('hashchange', () => { _sync.zeichnenAusstehend = false; });
} catch (e) {}
function syncPlaneUebernahme() {
  clearTimeout(_sync.anwendenTimer);
  _sync.anwendenTimer = setTimeout(() => syncUebernehmeAusY().catch(() => syncMelde('fehler')), 80);
}

function syncMedienIds() {
  const ids = new Set();
  for (const d of D.docs.values()) {
    if (d.typ === 'goodnote' && !D.einst.goodnotesSync) continue;
    if (d.bild) ids.add(d.bild);
    if (d.skizze) ids.add(d.skizze);
    if (d.skizzeBasis) ids.add(d.skizzeBasis);
    if (d.datei) ids.add(d.datei);
  }
  return ids;
}
function syncMediaGeaendert(_id) {
  if (_sync.config) setTimeout(() => syncMedienAbgleich().catch(() => {}), 30);
}
async function syncLadeMedium(id, manifest) {
  if (await dbGet('media', id)) return;
  const teile = [];
  for (let i = 0; i < manifest.chunks; i++) {
    const p = await syncFetch('/v1/vaults/' + encodeURIComponent(_sync.config.vault) + '/blobs/' + encodeURIComponent(id) + '/' + i, { method: 'GET' });
    teile.push(await syncEntschluessleBlock(p, id, i));
  }
  const blob = new Blob(teile, { type: manifest.type || 'application/octet-stream' });
  if (blob.size !== manifest.size) throw new Error('Unvollständige Datei');
  await dbPut('media', blob, id);
  try { loeseMedienURL(id); } catch (e) {}
}
async function syncSendeMedium(id, blob) {
  const BLOCK = 512 * 1024;
  const chunks = Math.ceil(blob.size / BLOCK);
  if (chunks > 100000) throw new Error('Datei zu groß');
  for (let i = 0; i < chunks; i++) {
    const roh = new Uint8Array(await blob.slice(i * BLOCK, Math.min(blob.size, (i + 1) * BLOCK)).arrayBuffer());
    const p = await syncVerschluessleBlock(roh, id, i);
    await syncFetch('/v1/vaults/' + encodeURIComponent(_sync.config.vault) + '/blobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blobId: id, chunk: i, iv: p.iv, ciphertext: p.ciphertext })
    });
  }
  _sync.ydoc.transact(() => _sync.ymedia.set(id, JSON.stringify({ chunks, size: blob.size, type: String(blob.type || 'application/octet-stream').slice(0, 120) })), SYNC_LOKAL);
}
async function syncMedienAbgleich() {
  if (_sync.medien || !_sync.config || !_sync.ymedia || !navigator.onLine) return;
  _sync.medien = true;
  try {
    const gebraucht = syncMedienIds();
    for (const id of gebraucht) {
      const manifestText = _sync.ymedia.get(id);
      if (typeof manifestText === 'string') {
        let manifest = null;
        try { manifest = JSON.parse(manifestText); } catch (e) {}
        if (manifest && Number.isInteger(manifest.chunks) && manifest.chunks >= 1 && manifest.chunks <= 100000 &&
            Number.isFinite(manifest.size) && manifest.size >= 0 && manifest.size <= 300 * 1024 * 1024) {
          await syncLadeMedium(id, manifest); continue;
        }
      }
      const blob = await dbGet('media', id);
      if (blob && blob.size <= 300 * 1024 * 1024) await syncSendeMedium(id, blob);
    }
  } catch (e) { syncMelde(e && e.name === 'OperationError' ? 'schluessel' : 'offline'); }
  finally { _sync.medien = false; }
}

/* ----- Grosse Pakete reisen in Teilen -----
   Der Dienst nimmt ein Paket nur bis 22 MB Geheimtext an. Ein grosser Bestand
   ist als Ganzes schnell groesser. Nachgestellt mit 12 langen Texten (18,7 MB):
   Der Dienst wies das Paket jedes Mal ab (413), alles dahinter blieb liegen,
   auf dem neuen Laptop kam kein einziger Text an — und beide Geraete zeigten
   „live verbunden“. Jetzt geht alles ueber 1 MB in Teilen hinaus. Das
   empfangende Geraet legt die Teile beiseite, bis alle da sind, und wendet
   dann das Ganze an. */
const SYNC_TEIL_BYTES = 1024 * 1024;
/* So gross wird ein Teil als Geheimtext nie. Was groesser in der
   Warteschlange liegt, stammt aus einer aelteren Fassung. */
const SYNC_PAKET_ZEICHEN_MAX = 2 * 1024 * 1024;
const SYNC_TEIL_KENNUNG = Object.freeze([0, 86, 65, 78, 73, 84, 76, 49]);   /* Null-Byte, dann VANITL1 */
const SYNC_TEIL_KOPF = 32;
function syncAlsBytes(wert) {
  return ArrayBuffer.isView(wert) ? new Uint8Array(wert.buffer, wert.byteOffset, wert.byteLength) : new Uint8Array(wert || []);
}
/* Kennung, Gruppe (16 Bytes), Nummer und Anzahl, dann das Stueck. Pur bis auf
   die zufaellige Gruppe. */
function syncTeileBauen(update, gruppe, groesse = SYNC_TEIL_BYTES) {
  const bytes = syncAlsBytes(update);
  const g = ArrayBuffer.isView(gruppe) && gruppe.byteLength === 16 ? syncAlsBytes(gruppe) : crypto.getRandomValues(new Uint8Array(16));
  const stueck = Math.max(1, Math.floor(Number(groesse) || SYNC_TEIL_BYTES));
  const gesamt = Math.max(1, Math.ceil(bytes.length / stueck));
  const teile = [];
  for (let i = 0; i < gesamt; i++) {
    const daten = bytes.subarray(i * stueck, Math.min(bytes.length, (i + 1) * stueck));
    const teil = new Uint8Array(SYNC_TEIL_KOPF + daten.length);
    teil.set(SYNC_TEIL_KENNUNG, 0);
    teil.set(g, 8);
    const dv = new DataView(teil.buffer);
    dv.setUint32(24, i);
    dv.setUint32(28, gesamt);
    teil.set(daten, SYNC_TEIL_KOPF);
    teile.push(teil);
  }
  return teile;
}
/* Ein Teil? Dann seine Angaben, sonst null. Ein gewoehnliches Yjs-Update
   beginnt nie mit dieser Kennung. Pur. */
function syncTeilLesen(wert) {
  if (!ArrayBuffer.isView(wert) || wert.byteLength < SYNC_TEIL_KOPF) return null;
  const bytes = syncAlsBytes(wert);
  for (let i = 0; i < SYNC_TEIL_KENNUNG.length; i++) if (bytes[i] !== SYNC_TEIL_KENNUNG[i]) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const index = dv.getUint32(24), gesamt = dv.getUint32(28);
  if (!gesamt || gesamt > 100000 || index >= gesamt) return null;
  return { gruppe: syncB64(bytes.subarray(8, 24)), index, gesamt, daten: bytes.subarray(SYNC_TEIL_KOPF) };
}
/* Legt ein Update sicher in die Warteschlange, ein grosses in Teilen. Wirft,
   wenn das nicht gelingt — dann darf nichts anderes weggeraeumt werden. */
async function syncLegeInWarteschlange(update, vault) {
  const bytes = syncAlsBytes(update);
  const stuecke = bytes.length > SYNC_TEIL_BYTES ? syncTeileBauen(bytes) : [bytes];
  for (const stueck of stuecke) {
    if (!_sync.config || _sync.config.vault !== vault) throw new Error('Bereich gewechselt');
    const paket = await syncVerschluessle(stueck);
    await dbPut('sync-pending', paket, paket.vault + ':' + paket.id);
    _sync.wartend = (_sync.wartend || 0) + 1;
  }
  return stuecke.length;
}
/* Ein Teil kommt an: beiseitelegen, und sind alle da, das Ganze anwenden. Die
   Teile liegen dauerhaft, weil der Lesestand nach jedem Paket weiterzieht:
   reisst die Leitung ab oder startet VANI neu, sind die ersten Teile noch da. */
async function syncTeilAnnehmen(vault, teil) {
  const basis = 'sync-teile:' + vault + ':' + teil.gruppe;
  let liste = await dbGet('kv', basis);
  if (!liste || liste.gesamt !== teil.gesamt || !Array.isArray(liste.da)) liste = { gesamt: teil.gesamt, da: [] };
  if (!liste.da.includes(teil.index)) {
    await dbPut('kv', syncB64(teil.daten), basis + ':' + teil.index);
    liste = { gesamt: liste.gesamt, da: [...liste.da, teil.index] };
    await dbPut('kv', liste, basis);
  }
  if (liste.da.length < liste.gesamt) return false;
  const stuecke = [];
  let laenge = 0;
  for (let i = 0; i < liste.gesamt; i++) {
    const roh = await dbGet('kv', basis + ':' + i);
    if (typeof roh !== 'string') return false;
    const b = syncBytes(roh);
    stuecke.push(b); laenge += b.length;
  }
  if (!_sync.ydoc || !_sync.config || _sync.config.vault !== vault) return false;
  const ganz = new Uint8Array(laenge);
  let pos = 0;
  for (const b of stuecke) { ganz.set(b, pos); pos += b.length; }
  VaniY.Y.applyUpdate(_sync.ydoc, ganz, SYNC_NETZ);
  /* Erst nach dem Anwenden aufraeumen: bis dahin sind die Teile der Ersatz. */
  for (let i = 0; i < liste.gesamt; i++) { try { await dbDel('kv', basis + ':' + i); } catch (e) {} }
  try { await dbDel('kv', basis); } catch (e) {}
  return true;
}
/* Nur die Schluessel — die Pakete selbst koennen gross sein und werden einzeln gelesen. */
async function syncWartendeSchluessel(vault) {
  const alle = await dbTu('sync-pending', 'readonly', (s) => s.getAllKeys());
  return (alle || []).filter((k) => typeof k === 'string' && k.startsWith(vault + ':'));
}
/* Pakete aus einer aelteren Fassung, die fuer den Dienst zu gross sind, werden
   gerettet: Ihr Inhalt wandert in die lokale Kopie (die ihn meist ohnehin
   schon hat), dann geht der ganze Stand EINMAL in Teilen in die Warteschlange,
   und erst wenn die Teile sicher liegen, gehen die alten Pakete. Lagen dort
   mehrere Kopien, reist so nur noch eine. */
function syncRetteGrossePakete(vault) {
  /* Nur eine Rettung zur Zeit. Kommt VANI waehrend des Startens wieder nach
     vorn, gleicht es sofort ab — ohne diese Sperre liefen dann zwei Rettungen
     nebeneinander, jede mit dem ganzen Bestand im Speicher, und der Stand
     ginge zweimal hinaus. */
  if (!_sync.rettung) _sync.rettung = syncRetteGrossePaketeJetzt(vault).finally(() => { _sync.rettung = null; });
  return _sync.rettung;
}
async function syncRetteGrossePaketeJetzt(vault) {
  if (!_sync.ydoc || !_sync.config || _sync.config.vault !== vault) return 0;
  const Y = VaniY.Y;
  const nie = _sync.nichtRettbar || (_sync.nichtRettbar = new Set());
  const gerettet = [];
  let unlesbar = 0, gemeldet = false;
  for (const key of await syncWartendeSchluessel(vault)) {
    if (nie.has(key)) continue;
    const p = await dbGet('sync-pending', key);
    if (!p || String(p.ciphertext || '').length <= SYNC_PAKET_ZEICHEN_MAX) continue;
    if (!gemeldet) { gemeldet = true; syncMelde('sendet', { vorbereiten: true }); }
    try {
      const bytes = await syncEntschluessle(p);
      /* Nur anwenden, was die lokale Kopie noch nicht hat — meist nichts. Das
         ganze alte Paket noch einmal einzuarbeiten, kostet auf einem iPad
         Minuten und viel Speicher. */
      const fehlt = typeof Y.diffUpdate === 'function' ? Y.diffUpdate(bytes, Y.encodeStateVector(_sync.ydoc)) : bytes;
      Y.applyUpdate(_sync.ydoc, fehlt, SYNC_NETZ);
      gerettet.push(key);
    } catch (e) { nie.add(key); unlesbar++; }
    if (!_sync.ydoc || !_sync.config || _sync.config.vault !== vault) return 0;
  }
  if (!gerettet.length && !unlesbar) return 0;
  /* Der ganze Stand geht einmal in Teilen hinaus — auch wenn sich ein altes
     Paket nicht lesen liess: Was dieses Geraet hat, soll drueben ankommen.
     Weggeraeumt wird nur, was sicher im neuen Stand steckt. */
  const sv = Y.encodeStateVector(_sync.ydoc);
  await syncLegeInWarteschlange(Y.encodeStateAsUpdate(_sync.ydoc), vault);
  await dbPut('kv', syncB64(sv), 'sync-sv:' + vault);
  for (const key of gerettet) await dbDel('sync-pending', key);
  return gerettet.length;
}

async function syncMerkeUpdate(update, generation, sv, vault) {
  /* Massgeblich ist der Bereich, nicht die Generation: startet der Sync neu,
     waehrend eine eigene Aenderung noch auf dem Weg in die Warteschlange ist,
     gehoert sie trotzdem hierher und darf nicht verloren gehen. Nur wer den
     Bereich verlassen hat, schreibt nichts mehr hinein. */
  const bereich = vault || (_sync.config && _sync.config.vault);
  if (!_sync.config || !bereich || _sync.config.vault !== bereich) return;
  try {
    await syncLegeInWarteschlange(update, bereich);
    /* Erst wenn das Paket sicher in der Warteschlange liegt, gilt sein Stand als bekannt. */
    if (sv) await dbPut('kv', syncB64(sv), 'sync-sv:' + bereich);
    syncSendeWartend().catch(() => {});
  } catch (e) { if (_sync.config && _sync.config.vault === bereich) syncMelde('fehler'); }
}
/* Fertig ist erst, was auch hinausgegangen ist. Frueher stand „live verbunden“
   da, sobald das Holen klappte — auch wenn die eigenen Pakete in der
   Warteschlange festhingen. */
function syncMeldeFertig() {
  const h = _sync.haengt;
  if (h && h.rest) return syncMelde(h.abgewiesen || h.alt ? 'fehler' : 'sendet', { rest: h.rest, abgewiesen: h.abgewiesen, alt: h.alt });
  return syncMelde('synchron', { zuletzt: Date.now() });
}
async function syncSendeWartend() {
  if (_sync.sendet || !_sync.config || !navigator.onLine) return;
  _sync.sendet = true;
  const generation = _sync.generation;
  const vault = _sync.config.vault;
  const abgewiesen = new Set(), uebrig = new Set();
  let versucht = false;
  try {
    for (let durchgang = 0; durchgang < 8; durchgang++) {
      const schluessel = (await syncWartendeSchluessel(vault)).filter((k) => !abgewiesen.has(k) && !uebrig.has(k));
      _sync.wartend = schluessel.length + abgewiesen.size + uebrig.size;
      if (!schluessel.length) break;
      const grosse = [];
      for (const key of schluessel) {
        if (generation !== _sync.generation) return;
        /* Ein altes Paket, das sich schon nicht retten liess, nicht bei jedem Abgleich neu laden. */
        if (_sync.nichtRettbar && _sync.nichtRettbar.has(key)) { uebrig.add(key); continue; }
        const p = await dbGet('sync-pending', key);
        if (!p) continue;
        if (String(p.ciphertext || '').length > SYNC_PAKET_ZEICHEN_MAX) { grosse.push(key); continue; }
        versucht = true;
        try {
          await syncFetch('/v1/vaults/' + encodeURIComponent(vault) + '/updates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, iv: p.iv, ciphertext: p.ciphertext }) });
        } catch (e) {
          /* Netz weg, Schluessel falsch, Dienst ueberlastet: spaeter weiter. Weist
             der Dienst aber nur dieses eine Paket ab, gehen die anderen trotzdem
             hinaus — frueher blieb alles dahinter liegen. */
          if (!e || !e.status || e.status === 401 || e.status === 408 || e.status === 429 || e.status >= 500) throw e;
          abgewiesen.add(key); continue;
        }
        await dbDel('sync-pending', key);
        _sync.wartend = Math.max(0, _sync.wartend - 1);
        if (schluessel.length > 3) syncMelde('sendet', { rest: _sync.wartend });
      }
      if (generation !== _sync.generation) return;
      if (grosse.length && !(await syncRetteGrossePakete(vault))) for (const k of grosse) uebrig.add(k);
    }
    const rest = (await syncWartendeSchluessel(vault)).length;
    _sync.wartend = rest;
    _sync.haengt = rest ? { rest, abgewiesen: abgewiesen.size, alt: uebrig.size } : null;
    if (_sync.aufgeholt && generation === _sync.generation && (versucht || rest || _sync.status.art === 'sendet')) syncMeldeFertig();
  } catch (e) {
    if (generation === _sync.generation) {
      _sync.haengt = { rest: Math.max(1, _sync.wartend || 0), abgewiesen: abgewiesen.size };
      syncMelde(e && e.status === 401 ? 'schluessel' : 'offline');
    }
  } finally { _sync.sendet = false; }
}
/* ----- Wie viele Pakete auf einmal geholt werden -----
   Eine feste Zahl passt nie: ein lange benutzter Bereich besteht aus Tausenden
   winziger Pakete, ein frisch angelegter aus wenigen grossen. Frueher waren es
   immer bis zu 200 in einer Antwort — im Nachbau 44,5 MB am Stueck. Kam die
   letzte Antwort gross oder gar nicht, wird verkleinert, war sie klein,
   vergroessert. Pur. */
function syncSeitenGroesse(bisher, antwortBytes, abgebrochen) {
  const alt = Math.max(1, Math.min(200, Math.round(Number(bisher) || 20)));
  if (abgebrochen) return Math.max(1, Math.floor(alt / 4));
  if (antwortBytes > 4 * 1048576) return Math.max(1, Math.floor(alt / 2));
  if (antwortBytes < 256 * 1024) return Math.min(200, alt * 2);
  return alt;
}
/* Den Merkzettel fortschreiben: bis hierhin ist alles vom Dienst gekommen oder
   liegt sicher in der Warteschlange. Nur, wenn gerade keine eigene Aenderung
   auf dem Weg dorthin ist — sonst stuende auf dem Zettel etwas, das noch nicht
   sicher liegt. */
async function syncBekanntSpeichern(vault) {
  if (!_sync.ydoc || _sync.merkenOffen) return;
  const sv = VaniY.Y.encodeStateVector(_sync.ydoc);
  try { await dbPut('kv', syncB64(sv), 'sync-sv:' + vault); } catch (e) {}
}
/* Beim Start nur schicken, was ueber den Merkzettel hinausgeht. Frueher ging
   hier bei JEDEM Start der komplette Stand hinaus, mit neuer Kennung; der
   Dienst hob jede Kopie auf. Nachgestellt: ein Bestand von 6 MB lag nach vier
   Starts mit 29,7 MB auf dem Server — und ein neues Geraet musste alles laden.
   Ohne Merkzettel (erster Start nach dem Update) geht der Stand noch genau
   einmal ganz hinaus. */
async function syncSendeUnbekanntes(generation) {
  if (!_sync.ydoc || !_sync.config) return false;
  try { await (_sync.merken || Promise.resolve()); } catch (e) {}
  if (generation !== _sync.generation) return false;
  const Y = VaniY.Y;
  let sv = null;
  try { const roh = await dbGet('kv', 'sync-sv:' + _sync.config.vault); if (typeof roh === 'string' && roh) sv = syncBytes(roh); } catch (e) {}
  if (generation !== _sync.generation) return false;
  let update;
  try { update = sv ? Y.encodeStateAsUpdate(_sync.ydoc, sv) : Y.encodeStateAsUpdate(_sync.ydoc); }
  catch (e) { update = Y.encodeStateAsUpdate(_sync.ydoc); }
  /* Nichts Neues darin? Dann auch kein Paket. */
  try { if (Y.decodeUpdate(update).structs.length === 0) return false; } catch (e) {}
  _sync.merkenOffen++;
  const svJetzt = Y.encodeStateVector(_sync.ydoc);
  try { await syncMerkeUpdate(update, generation, svJetzt); }
  finally { if (generation === _sync.generation) _sync.merkenOffen--; }
  return true;
}
async function syncHoleUpdates(frist = 0) {
  if (_sync.holt || !_sync.config || !navigator.onLine) return false;
  _sync.holt = true;
  const generation = _sync.generation;
  const vault = _sync.config.vault;
  const t0 = Date.now();
  let aufgeholt = false;
  try {
    let seq = await syncLadeSeq(vault);
    for (let runde = 0; runde < 400; runde++) {
      let body;
      try {
        body = await syncFetch('/v1/vaults/' + encodeURIComponent(vault) + '/updates?after=' + seq + '&limit=' + _sync.seite, { method: 'GET' });
      } catch (e) {
        if (e && e.name === 'AbortError') _sync.seite = syncSeitenGroesse(_sync.seite, 0, true);
        throw e;
      }
      if (generation !== _sync.generation) return false;
      const updates = Array.isArray(body.updates) ? body.updates : [];
      let bytes = 0;
      for (const paket of updates) {
        if (generation !== _sync.generation) return false;
        const klar = await syncEntschluessle(paket);
        const teil = syncTeilLesen(klar);
        if (teil) { await syncTeilAnnehmen(vault, teil); if (generation !== _sync.generation) return false; }
        else VaniY.Y.applyUpdate(_sync.ydoc, klar, SYNC_NETZ);
        seq = Math.max(seq, Math.round(begrenze(paket.seq, 0, Number.MAX_SAFE_INTEGER, seq)));
        /* Nach JEDEM Paket merken, nicht erst nach der ganzen Antwort: reisst
           die Leitung ab, geht es hier weiter statt wieder bei null. */
        await syncSpeichereSeq(vault, seq);
        bytes += String(paket.ciphertext || '').length;
      }
      if (updates.length) { _sync.geholt += updates.length; await syncBekanntSpeichern(vault); }
      _sync.seite = syncSeitenGroesse(_sync.seite, bytes, false);
      if (!body.more) { aufgeholt = true; break; }
      syncMelde('verbindet', { geholt: _sync.geholt });
      if (frist && Date.now() - t0 > frist) break;
    }
  } catch (e) {
    syncMelde(e && (e.status === 401 || e.name === 'OperationError') ? 'schluessel' : 'offline');
    return false;
  } finally { _sync.holt = false; }
  if (!aufgeholt) return false;
  const vorher = _sync.aufgeholt;
  _sync.aufgeholt = true;
  /* Zum ersten Mal vollstaendig: jetzt darf die Uebernahme auch aufraeumen. */
  if (!vorher) syncPlaneUebernahme();
  syncMeldeFertig();
  return true;
}
async function syncJetzt() {
  if (!_sync.config) return false;
  if (!_sync.ydoc) { syncPlaneWiederanlauf(_sync.config, 0); return false; }
  await syncSendeWartend(); await syncHoleUpdates();
  syncMedienAbgleich().catch(() => {});
  return _sync.status.art === 'synchron';
}
function syncPollAbstand() {
  if (!navigator.onLine) return 8000;
  /* Ein Geraet, das noch aufholt, soll zwischen den Portionen nicht warten —
     ausser der Dienst ist gerade nicht zu erreichen. */
  if (_sync.config && _sync.ydoc && !_sync.aufgeholt && _sync.status.art === 'verbindet') return 250;
  if (document.visibilityState !== 'visible') return 12000;
  /* Beim Schreiben darf ein zweites Gerät fast unmittelbar folgen. In Ruhe
     reichen anderthalb Sekunden und sparen auf iPad und Handy Akku. */
  return syncSchreibtGerade() ? 900 : 1400;
}
function syncPlanePoll(warte = syncPollAbstand()) {
  clearTimeout(_sync.poll);
  const generation = _sync.generation;
  _sync.poll = setTimeout(async () => {
    if (!_sync.config || generation !== _sync.generation) return;
    try { await syncJetzt(); } catch (e) {}
    if (_sync.config && generation === _sync.generation) syncPlanePoll();
  }, Math.max(250, warte));
}
function syncPlaneWiederanlauf(config, warte = 4000) {
  if (!config || _sync.retry) return;
  _sync.retry = setTimeout(async () => {
    _sync.retry = null;
    if (!_sync.config || _sync.ydoc) return;
    const c = syncSaubereConfig(_sync.config || config);
    if (!c) return;
    try { await syncStarte(c, 'start'); }
    catch (e) {
      syncStoppe(); _sync.config = c; syncMelde('offline');
      syncPlaneWiederanlauf(c, navigator.onLine ? 5000 : 12000);
    }
  }, Math.max(0, warte));
}
function syncStoppe() {
  _sync.generation++;
  clearTimeout(_sync.poll); clearTimeout(_sync.retry); clearTimeout(_sync.anwendenTimer);
  try { if (_sync.persistence) _sync.persistence.destroy(); } catch (e) {}
  try { if (_sync.ydoc) _sync.ydoc.destroy(); } catch (e) {}
  _sync.ydoc = _sync.ydocs = _sync.ystate = _sync.ymedia = _sync.persistence = null;
  _sync.poll = _sync.retry = null; _sync.sendet = _sync.holt = _sync.medien = false;
  _sync.aufgeholt = false; _sync.geholt = 0; _sync.merken = null; _sync.merkenOffen = 0; _sync.wartend = 0; _sync.haengt = null;
  syncWachHalten(false);
}
async function syncStarte(config, modus = 'start') {
  if (!globalThis.VaniY || !VaniY.Y || !VaniY.IndexeddbPersistence) throw new Error('Sync-Baustein fehlt');
  syncStoppe(); _sync.config = syncSaubereConfig(config);
  if (!_sync.config) throw new Error('Ungültiger Bereich');
  const generation = _sync.generation;
  const bereich = _sync.config.vault;
  syncMelde('verbindet');
  const Y = VaniY.Y;
  _sync.ydoc = new Y.Doc(); _sync.ydocs = _sync.ydoc.getMap('docs'); _sync.ystate = _sync.ydoc.getMap('state'); _sync.ymedia = _sync.ydoc.getMap('media');
  _sync.persistence = new VaniY.IndexeddbPersistence('vani-bereich-' + _sync.config.vault, _sync.ydoc);
  await new Promise((resolve) => _sync.persistence.once('synced', resolve));
  if (generation !== _sync.generation) return false;
  /* Ist die lokale Kopie des Bereichs leer, obwohl dieses Geraet schon
     abgeglichen hatte (Browser hat sie verworfen, sie liess sich nicht oeffnen),
     passt der gemerkte Lesestand nicht mehr dazu. Dann alles neu holen — sonst
     sah VANI den eigenen Bestand als neu an und schickte ihn komplett noch
     einmal. Der Merkzettel bleibt: er beschreibt, was der Dienst schon hat. */
  if (_sync.ydocs.size === 0 && _sync.ystate.size === 0) {
    try { if (await syncLadeSeq(bereich) > 0) await syncSpeichereSeq(bereich, 0); } catch (e) {}
    if (generation !== _sync.generation) return false;
  }
  /* Ab hier wird jede eigene Aenderung als eigenes Paket gemerkt — auch jede
     Portion des ersten Abgleichs. Was die lokale Ablage eben eingelesen hat,
     liegt davor und zaehlt nicht als neu. Der Stand dazu wandert in einer
     Kette, damit die Reihenfolge stimmt und der Merkzettel nie vorauslaeuft. */
  _sync.ydoc.on('update', (update, origin) => {
    if (origin === SYNC_NETZ || generation !== _sync.generation) return;
    _sync.merkenOffen++;
    let sv = null;
    try { sv = Y.encodeStateVector(_sync.ydoc); } catch (e) {}
    _sync.merken = (_sync.merken || Promise.resolve())
      .then(() => syncMerkeUpdate(update, generation, sv, bereich))
      .catch(() => {})
      .finally(() => { if (generation === _sync.generation) _sync.merkenOffen--; });
  });
  /* Erst holen, was der Bereich schon hat — aber nicht endlos am Stueck: nach
     zwanzig Sekunden geht es im normalen Abgleich weiter, Portion fuer Portion,
     und die Texte erscheinen nach und nach. */
  const aufgeholt = await syncHoleUpdates(20000);
  if (generation !== _sync.generation) return false;
  if (modus === 'erstellen' || modus === 'dazu' || (aufgeholt && _sync.ydocs.size === 0 && D.docs.size > 0)) syncSeedLokal();
  /* Ersetzen heisst: der Bestand aus dem Bereich loest den hiesigen ab. Aber
     nie etwas wegraeumen, bevor der Ersatz sicher da ist. Kam noch nicht alles
     an, bleibt der hiesige Bestand stehen; sobald der Bereich vollstaendig
     angekommen ist, raeumt die Uebernahme weg, was darin nicht vorkommt. */
  if (modus === 'ersetzen' && aufgeholt) { D.docs.clear(); await dbTu('docs', 'readwrite', (s) => s.clear()); }
  await syncUebernehmeAusY();
  _sync.ydocs.observeDeep((_events, tx) => { if (tx.origin !== SYNC_LOKAL) syncPlaneUebernahme(); });
  _sync.ystate.observeDeep((_events, tx) => { if (tx.origin !== SYNC_LOKAL) syncPlaneUebernahme(); });
  _sync.ymedia.observeDeep((_events, tx) => { if (tx.origin !== SYNC_LOKAL) syncMedienAbgleich().catch(() => {}); });
  /* Erst retten, was aus einer aelteren Fassung zu gross in der Warteschlange
     liegt — das legt den Merkzettel neu, und der ganze Stand geht nur einmal. */
  try { await syncRetteGrossePakete(bereich); } catch (e) {}
  await syncSendeUnbekanntes(generation);
  await syncSendeWartend();
  syncMedienAbgleich().catch(() => {});
  syncPlanePoll();
  /* „live verbunden“ nur, wenn es stimmt. Frueher stand das hier auch dann,
     wenn das Holen eben gescheitert war — der Laptop sah verbunden aus und
     blieb leer. */
  if (_sync.aufgeholt) syncMeldeFertig();
  else if (!['offline', 'schluessel', 'fehler'].includes(_sync.status.art)) syncMelde('verbindet', { geholt: _sync.geholt });
  return true;
}
async function syncBeimStart() {
  const config = await syncLadeConfig();
  if (!config) { syncMelde('aus'); return false; }
  try { await syncStarte(config, 'start'); return true; }
  catch (e) {
    syncStoppe(); _sync.config = config; syncMelde('offline');
    syncPlaneWiederanlauf(config, navigator.onLine ? 4000 : 12000);
    return false;
  }
}
async function syncErstelleBereich(name, server) {
  const adresse = syncServerAdresse(server);
  if (!adresse) throw new Error('Bitte eine sichere HTTPS-Adresse eintragen.');
  const config = { v: 1, name: String(name || 'Mein Bereich').trim().slice(0, 80) || 'Mein Bereich', server: adresse,
    vault: syncZufall(18), token: syncZufall(32), key: syncZufall(32) };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const antwort = await fetch(adresse + '/v1/vaults', { method: 'POST', cache: 'no-store', signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vaultId: config.vault, token: config.token }) });
    if (!antwort.ok) throw new Error('Der Sync-Dienst hat den Bereich nicht angelegt.');
  } finally { clearTimeout(timer); }
  await syncSpeichereConfig(config); await syncStarte(config, 'erstellen');
  return config;
}
async function syncVerbindeBereich(code, modus = 'ersetzen') {
  const config = syncLeseKopplungscode(code);
  if (!config) throw new Error('Der Kopplungscode ist nicht gültig.');
  await syncPruefeConfig(config); await syncSpeichereConfig(config);
  await syncStarte(config, modus === 'dazu' ? 'dazu' : 'ersetzen');
  return config;
}
async function syncTrennen() {
  syncStoppe(); _sync.config = null; await syncLoescheConfig(); syncMelde('aus');
}

try {
  const weckeSync = () => {
    if (!_sync.config) return;
    if (!_sync.ydoc) syncPlaneWiederanlauf(_sync.config, 0);
    else { syncJetzt().catch(() => {}); syncPlanePoll(700); }
  };
  window.addEventListener('online', weckeSync);
  window.addEventListener('focus', weckeSync);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') weckeSync(); });
} catch (e) {}
