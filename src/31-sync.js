/* ================================================================
   VANI — privater, Ende-zu-Ende-verschlüsselter Mehrgeräte-Sync
   ================================================================ */

const SYNC_NETZ = Object.freeze({ art: 'netz' });
const SYNC_LOKAL = Object.freeze({ art: 'lokal' });
const SYNC_TEXTFELDER = new Set(['text', 'titel', 'notiz', 'schlagworte', 'label']);
const SYNC_INTERNE_FELDER = new Set(['_rev', '_geraet', '_syncZeit']);
let _sync = {
  config: null, ydoc: null, ydocs: null, ystate: null, ymedia: null, persistence: null,
  poll: null, status: { art: 'aus' }, uebernimmt: false, anwendenTimer: null,
  sendet: false, holt: false, medien: false, generation: 0, fremdZuletzt: 0, nachzug: null
};
/* Hat die andere Seite in den letzten Minuten etwas gebracht? (zweite Tasse am Schreibtisch) */
function syncFremdAktiv(minuten = 20) { return !!_sync.config && _sync.fremdZuletzt > 0 && Date.now() - _sync.fremdZuletzt < minuten * 60000; }

function syncMelde(art, extra) {
  _sync.status = Object.assign({ art, wann: Date.now() }, extra || {});
  try { window.dispatchEvent(new CustomEvent('vani-sync-status', { detail: _sync.status })); } catch (e) {}
  return _sync.status;
}
function syncInfo() {
  return {
    verbunden: !!_sync.config,
    name: _sync.config ? _sync.config.name : '',
    server: _sync.config ? _sync.config.server : '',
    vault: _sync.config ? _sync.config.vault : '',
    status: Object.assign({}, _sync.status)
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
async function syncFetch(pfad, optionen, config) {
  const c = config || _sync.config;
  if (!c) throw new Error('Kein Bereich');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const headers = Object.assign({ Authorization: 'Bearer ' + c.token }, optionen && optionen.headers || {});
    const antwort = await fetch(c.server + pfad, Object.assign({}, optionen || {}, { headers, signal: controller.signal, cache: 'no-store' }));
    let body = null;
    try { body = await antwort.json(); } catch (e) {}
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
  _sync.ydoc.transact(() => {
    if (!art || art === 'einst') _sync.ystate.set('einst', JSON.stringify(D.einst));
    if (!art || art === 'stats') _sync.ystate.set('stats', JSON.stringify(D.stats));
  }, SYNC_LOKAL);
}
function syncSeedLokal() {
  if (!_sync.ydoc) return;
  _sync.ydoc.transact(() => {
    for (const d of D.docs.values()) syncSchreibeDokument(d);
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
      if (alt) {
        for (const k of Object.keys(alt)) if (!(k in d) && !SYNC_INTERNE_FELDER.has(k)) delete alt[k];
        for (const f of SYNC_INTERNE_FELDER) delete d[f];
        Object.assign(alt, d);
        await dbPut('docs', alt);
      } else {
        D.docs.set(id, d); await dbPut('docs', d);
      }
      veraendert++;
    }
    for (const id of [...D.docs.keys()]) {
      const d = D.docs.get(id);
      /* Nur löschen, was nicht währenddessen hier entstanden oder angefasst wurde */
      if (!da.has(id) && !(d && (d.angelegt > start || d.geaendert > start)) && !(_sync.nachzug && _sync.nachzug.has(id))) { D.docs.delete(id); await dbDel('docs', id); veraendert++; }
    }
    if (veraendert) _sync.fremdZuletzt = Date.now();
    const einst = _sync.ystate.get('einst');
    if (typeof einst === 'string') try { uebernehmeEinstellungen(JSON.parse(einst)); await dbPut('kv', D.einst, 'einst'); setzeThema(D.einst.thema); } catch (e) {}
    const stats = _sync.ystate.get('stats');
    if (typeof stats === 'string') try {
      const s = JSON.parse(stats);
      D.stats = { tage: saubereZaehler(s.tage), letzte: saubereZaehler(s.letzte), letzteSicherung: begrenze(s.letzteSicherung, 0, Date.now() + 86400000, 0) };
      await dbPut('kv', D.stats, 'stats');
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

async function syncMerkeUpdate(update, generation) {
  if (!_sync.config || generation !== _sync.generation) return;
  try {
    const paket = await syncVerschluessle(update);
    if (generation !== _sync.generation) return;
    await dbPut('sync-pending', paket, paket.vault + ':' + paket.id);
    syncSendeWartend().catch(() => {});
  } catch (e) { syncMelde('fehler'); }
}
async function syncSendeWartend() {
  if (_sync.sendet || !_sync.config || !navigator.onLine) return;
  _sync.sendet = true;
  const generation = _sync.generation;
  try {
    const alle = await dbAlle('sync-pending');
    const wartend = alle.filter((p) => p && p.vault === _sync.config.vault).slice(0, 2000);
    for (const p of wartend) {
      if (generation !== _sync.generation) return;
      const body = JSON.stringify({ id: p.id, iv: p.iv, ciphertext: p.ciphertext });
      await syncFetch('/v1/vaults/' + encodeURIComponent(_sync.config.vault) + '/updates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      await dbDel('sync-pending', p.vault + ':' + p.id);
    }
    if (wartend.length) syncMelde('synchron', { zuletzt: Date.now() });
  } catch (e) { syncMelde(e && e.status === 401 ? 'schluessel' : 'offline'); }
  finally { _sync.sendet = false; }
}
async function syncHoleUpdates() {
  if (_sync.holt || !_sync.config || !navigator.onLine) return;
  _sync.holt = true;
  const generation = _sync.generation;
  try {
    let seq = await syncLadeSeq(_sync.config.vault);
    for (let runde = 0; runde < 100; runde++) {
      const body = await syncFetch('/v1/vaults/' + encodeURIComponent(_sync.config.vault) + '/updates?after=' + seq + '&limit=200', { method: 'GET' });
      const updates = Array.isArray(body.updates) ? body.updates : [];
      for (const paket of updates) {
        if (generation !== _sync.generation) return;
        VaniY.Y.applyUpdate(_sync.ydoc, await syncEntschluessle(paket), SYNC_NETZ);
        seq = Math.max(seq, Math.round(begrenze(paket.seq, 0, Number.MAX_SAFE_INTEGER, seq)));
      }
      await syncSpeichereSeq(_sync.config.vault, seq);
      if (!body.more && updates.length < 200) break;
    }
    syncMelde('synchron', { zuletzt: Date.now() });
  } catch (e) { syncMelde(e && (e.status === 401 || e.name === 'OperationError') ? 'schluessel' : 'offline'); }
  finally { _sync.holt = false; }
}
async function syncJetzt() {
  if (!_sync.config) return false;
  await syncSendeWartend(); await syncHoleUpdates();
  syncMedienAbgleich().catch(() => {});
  return _sync.status.art === 'synchron';
}
function syncStoppe() {
  _sync.generation++;
  clearInterval(_sync.poll); clearTimeout(_sync.anwendenTimer);
  try { if (_sync.persistence) _sync.persistence.destroy(); } catch (e) {}
  try { if (_sync.ydoc) _sync.ydoc.destroy(); } catch (e) {}
  _sync.ydoc = _sync.ydocs = _sync.ystate = _sync.ymedia = _sync.persistence = null;
  _sync.poll = null; _sync.sendet = _sync.holt = _sync.medien = false;
}
async function syncStarte(config, modus = 'start') {
  if (!globalThis.VaniY || !VaniY.Y || !VaniY.IndexeddbPersistence) throw new Error('Sync-Baustein fehlt');
  syncStoppe(); _sync.config = syncSaubereConfig(config);
  if (!_sync.config) throw new Error('Ungültiger Bereich');
  const generation = _sync.generation;
  syncMelde('verbindet');
  const Y = VaniY.Y;
  _sync.ydoc = new Y.Doc(); _sync.ydocs = _sync.ydoc.getMap('docs'); _sync.ystate = _sync.ydoc.getMap('state'); _sync.ymedia = _sync.ydoc.getMap('media');
  _sync.persistence = new VaniY.IndexeddbPersistence('vani-bereich-' + _sync.config.vault, _sync.ydoc);
  await new Promise((resolve) => _sync.persistence.once('synced', resolve));
  if (generation !== _sync.generation) return false;
  await syncHoleUpdates();
  if (modus === 'erstellen' || modus === 'dazu' || (_sync.ydocs.size === 0 && D.docs.size > 0)) syncSeedLokal();
  if (modus === 'ersetzen') { D.docs.clear(); await dbTu('docs', 'readwrite', (s) => s.clear()); }
  await syncUebernehmeAusY();
  _sync.ydocs.observeDeep((_events, tx) => { if (tx.origin !== SYNC_LOKAL) syncPlaneUebernahme(); });
  _sync.ystate.observeDeep((_events, tx) => { if (tx.origin !== SYNC_LOKAL) syncPlaneUebernahme(); });
  _sync.ymedia.observeDeep((_events, tx) => { if (tx.origin !== SYNC_LOKAL) syncMedienAbgleich().catch(() => {}); });
  _sync.ydoc.on('update', (update, origin) => { if (origin !== SYNC_NETZ) syncMerkeUpdate(update, generation); });
  await syncMerkeUpdate(Y.encodeStateAsUpdate(_sync.ydoc), generation);
  await syncSendeWartend(); await syncHoleUpdates();
  syncMedienAbgleich().catch(() => {});
  _sync.poll = setInterval(() => syncJetzt().catch(() => {}), 2500);
  syncMelde('synchron', { zuletzt: Date.now() });
  return true;
}
async function syncBeimStart() {
  const config = await syncLadeConfig();
  if (!config) { syncMelde('aus'); return false; }
  try { await syncStarte(config, 'start'); return true; }
  catch (e) { _sync.config = config; syncMelde('offline'); return false; }
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
  window.addEventListener('online', () => syncJetzt().catch(() => {}));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncJetzt().catch(() => {}); });
} catch (e) {}
