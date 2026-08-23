/* ===================== 56d — DIE EINLESUNG (VERSIEGELT) =====================
   Die Leute von der Wand haben die eigene Sammlung gelesen: Werke, Figuren,
   Schauplätze, Begriffe, Lieblingsstellen — und je Stimme Beobachtungen,
   Fragen und Notizen zu den Leuten darin.

   Dieser Inhalt steht NICHT im Quelltext. Er liegt daneben, verschlüsselt
   (`einlesung/einlesung.enc`, AES-256-GCM, Schlüssel aus einem Passwort per
   PBKDF2, 200 000 Runden — dasselbe Verfahren wie beim Bücherkoffer). Die App
   fragt einmal nach dem Passwort, entschlüsselt und legt den Inhalt im
   `kv`-Speicher dieses Geräts ab; danach ist er sofort da und geht nie wieder
   hinaus. Im öffentlichen Repo steht nur Rauschen und `einlesung/umschlag.json`
   mit Datum und Anzahl der Werke.

   Versiegeln: `node werkzeug/einlesung-versiegeln.mjs [Passwort]`
   Dazulernen: siehe 56h — neue Lesungen kommen als eigene Stände dazu. */

const EINLESUNG_KV = 'einlesung';
const EINLESUNG_UMSCHLAG = 'einlesung/umschlag.json';
let _einlesung = null;          /* der entschlüsselte Inhalt, sobald er da ist */
let _einlesungUmschlag = null;  /* was außen auf dem Umschlag steht */
let _einlesungLaeuft = null;    /* damit nicht zweimal gleichzeitig geladen wird */

/* Der Inhalt, sobald er entsiegelt ist — sonst null. */
function salonEinlesung() { return _einlesung; }
function einlesungDa() { return !!(_einlesung && _einlesung.stimmen); }
function einlesungUmschlag() { return _einlesungUmschlag; }

/* Was auf dem Umschlag steht (Datum, Zahl der Werke) — ohne Passwort lesbar. */
async function einlesungUmschlagHolen() {
  if (_einlesungUmschlag) return _einlesungUmschlag;
  try {
    const a = await fetch(EINLESUNG_UMSCHLAG, { cache: 'no-store' });
    if (!a.ok) return null;
    const u = await a.json();
    if (u && u.datei) _einlesungUmschlag = u;
    return _einlesungUmschlag;
  } catch (e) { return null; }
}
/* Aus dem Gerätespeicher holen, was schon einmal entsiegelt wurde. */
async function einlesungAusSpeicher() {
  try {
    const gespeichert = await dbGet('kv', EINLESUNG_KV);
    if (gespeichert && gespeichert.stimmen) { _einlesung = gespeichert; return gespeichert; }
  } catch (e) {}
  return null;
}
/* Entsiegeln: Umschlag holen, Passwort erfragen, entschlüsseln, merken. */
async function einlesungEntsiegeln(passwort) {
  const u = await einlesungUmschlagHolen();
  if (!u) throw new Error('Der Umschlag ist nicht da.');
  const antwort = await fetch(u.datei, { cache: 'no-store' });
  if (!antwort.ok) throw new Error('Die versiegelte Einlesung ist nicht da.');
  const bytes = new Uint8Array(await antwort.arrayBuffer());
  const magie = new TextDecoder().decode(bytes.slice(0, 9));
  if (magie !== 'VANIEINL1') throw new Error('Das ist keine Einlesung.');
  const salz = bytes.slice(9, 25), iv = bytes.slice(25, 37), chiffrat = bytes.slice(37);
  const grund = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(passwort || '')), 'PBKDF2', false, ['deriveKey']);
  const schluessel = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salz, iterations: u.runden || 200000, hash: 'SHA-256' }, grund, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, schluessel, chiffrat);
  const daten = JSON.parse(new TextDecoder().decode(klar));
  if (!daten || !daten.stimmen) throw new Error('Der Inhalt sieht nicht richtig aus.');
  _einlesung = daten;
  try { await dbPut('kv', daten, EINLESUNG_KV); } catch (e) {}
  return daten;
}
/* Beim Start: still versuchen, was schon da ist. Nie fragen. */
async function einlesungBereit() {
  if (_einlesung) return _einlesung;
  if (_einlesungLaeuft) return _einlesungLaeuft;
  _einlesungLaeuft = (async () => {
    await einlesungUmschlagHolen();
    const da = await einlesungAusSpeicher();
    _einlesungLaeuft = null;
    return da;
  })();
  return _einlesungLaeuft;
}
/* Den Umschlag vergessen (Feinheiten): der Inhalt verschwindet vom Gerät. */
async function einlesungVergessen() {
  _einlesung = null;
  try { await dbDel('kv', EINLESUNG_KV); } catch (e) {}
}

/* ----- Nachschlagen (arbeitet nur, wenn entsiegelt) ----- */
function einlesungFiguren() { return (_einlesung && _einlesung.figuren) || {}; }
function einlesungAlias() { return (_einlesung && _einlesung.alias) || {}; }
function einlesungWerke() { return (_einlesung && _einlesung.werke) || []; }
function einlesungStimme(id) { return (_einlesung && _einlesung.stimmen && _einlesung.stimmen[id]) || null; }

/* Einen Namen im Gedächtnis der Wand nachschlagen (auch über Alias und Genitiv). Pur. */
function einlesungFigur(name) {
  const F = einlesungFiguren(), A = einlesungAlias();
  const n = String(name || '').trim(); if (!n) return null;
  if (F[n]) return Object.assign({ name: n }, F[n]);
  if (A[n] && F[A[n]]) return Object.assign({ name: A[n] }, F[A[n]]);
  const ohneS = /s$/.test(n) ? n.slice(0, -1) : null;
  if (ohneS && F[ohneS]) return Object.assign({ name: ohneS }, F[ohneS]);
  const klein = n.toLowerCase();
  for (const k of Object.keys(F)) if (k.toLowerCase() === klein) return Object.assign({ name: k }, F[k]);
  return null;
}
/* Was eine bestimmte Stimme über diese Figur gesagt hat. Pur. */
function einlesungNotiz(autorId, name) {
  const st = einlesungStimme(autorId); if (!st || !st.figuren) return null;
  const f = einlesungFigur(name); if (!f) return null;
  const n = st.figuren[f.name];
  return n ? { name: f.name, text: n.t, de: n.de || '', figur: f } : null;
}
function einlesungOrt(name) { const o = (_einlesung && _einlesung.orte) || {}; return o[String(name || '').trim()] || null; }
function einlesungBegriff(name) { const b = (_einlesung && _einlesung.begriffe) || {}; return b[String(name || '').trim()] || null; }
/* Wie viele Stimmen zu dieser Figur etwas gesagt haben. Pur. */
function einlesungStimmenZu(name) {
  const f = einlesungFigur(name); if (!f || !_einlesung) return [];
  const S = _einlesung.stimmen || {};
  return Object.keys(S).filter((id) => S[id].figuren && S[id].figuren[f.name]);
}
/* Eine Frage im Gedächtnis der Einlesung nachschlagen — auch wenn der Text nicht
   (mehr) auf dem Gerät liegt. Gibt eine Antwortabsicht wie kenntnisFrage. Pur. */
function einlesungFrage(frage) {
  if (!_einlesung) return null;
  const f = String(frage || '').trim(); if (!f) return null;
  const fl = ' ' + f.toLowerCase() + ' ';
  const roh = (name) => String(name).toLowerCase().split('').map((c) => '.*+?^${}()|[]\\'.includes(c) ? '\\' + c : c).join('');
  const passt = (name) => new RegExp('[^a-zäöüß]' + roh(name) + 's?[^a-zäöüß]', 'i').test(fl);
  const F = einlesungFiguren(), A = einlesungAlias();
  let best = null;
  for (const name of Object.keys(F)) if (passt(name) && (!best || name.length > best.length)) best = name;
  for (const alias of Object.keys(A)) if (passt(alias)) { const ziel = A[alias]; if (!best || alias.length > best.length) best = ziel; }
  if (best) { const fig = einlesungFigur(best); return { absicht: 'wer', wesen: { art: 'figur', name: fig.name, n: 0, werke: [{ name: fig.werk, n: 1 }], beispiele: [], begleiter: [], verben: [], dialog: 0, erster: null }, belege: [], quelle: 'einlesung' }; }
  for (const name of Object.keys((_einlesung && _einlesung.orte) || {})) if (passt(name)) return { absicht: 'wo', wesen: { art: 'ort', name, n: 0, werke: [], beispiele: [], wer: [] }, belege: [], quelle: 'einlesung' };
  for (const name of Object.keys((_einlesung && _einlesung.begriffe) || {})) if (passt(name)) return { absicht: 'wer', wesen: { art: 'begriff', name, n: 0, werke: [], beispiele: [] }, belege: [], quelle: 'einlesung' };
  for (const w of einlesungWerke()) if (passt(w.titel) || (w.titel.split(' ').length > 1 && fl.includes(w.titel.toLowerCase()))) return { absicht: 'werk', werk: w, wesen: null, belege: [], quelle: 'einlesung' };
  return null;
}
