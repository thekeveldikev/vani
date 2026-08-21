/* ================================================================
   VANI — lokale Profile: eine Tür pro Mensch, ein eigener Datenraum
   ================================================================ */

const PROFIL_SPEICHER = 'vani-profile-registry-v1';
const PROFIL_ITERATIONEN = 350000;
let PROFIL_SCHLUESSEL = null;
let _profilLetzteAktivitaet = Date.now();
let _profilSperrtimer = null;

function profilSaubererName(name) {
  return String(name || '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

function profilSaubereRegistry(roh) {
  if (!Array.isArray(roh)) return [];
  const ids = new Set();
  return roh.slice(0, 12).filter((p) => p && typeof p === 'object')
    .map((p) => ({
      id: String(p.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 80),
      name: profilSaubererName(p.name),
      salz: String(p.salz || '').slice(0, 120),
      pruefung: String(p.pruefung || '').slice(0, 180),
      datenbank: p.datenbank === 'vani' ? 'vani' : '',
      angelegt: begrenze(p.angelegt, 0, Date.now() + 86400000, Date.now()),
      zuletzt: begrenze(p.zuletzt, 0, Date.now() + 86400000, 0)
    }))
    .filter((p) => p.id && p.name && /^[A-Za-z0-9_-]{16,120}$/.test(p.salz) && /^[A-Za-z0-9_-]{32,180}$/.test(p.pruefung))
    .filter((p) => !ids.has(p.id) && ids.add(p.id));
}

function profilLadeRegistry() {
  try { return profilSaubereRegistry(JSON.parse(localStorage.getItem(PROFIL_SPEICHER) || '[]')); }
  catch (e) { return []; }
}
function profilSpeichereRegistry(profile) {
  localStorage.setItem(PROFIL_SPEICHER, JSON.stringify(profilSaubereRegistry(profile)));
}

function profilB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function profilBytes(s) {
  const b64 = String(s || '').replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - String(s || '').length % 4) % 4);
  const bin = atob(b64), aus = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) aus[i] = bin.charCodeAt(i);
  return aus;
}

async function profilLeiteAb(passwort, salz) {
  const basis = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(passwort || '')), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  const opts = { name: 'PBKDF2', salt: profilBytes(salz), iterations: PROFIL_ITERATIONEN, hash: 'SHA-256' };
  const pruefung = new Uint8Array(await crypto.subtle.deriveBits(opts, basis, 256));
  const schluessel = await crypto.subtle.deriveKey(opts, basis, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  return { pruefung: profilB64(pruefung), schluessel };
}

function profilGleich(a, b) {
  const x = String(a || ''), y = String(b || '');
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return diff === 0;
}

async function profilPruefePasswort(profil, passwort) {
  if (!profil || typeof passwort !== 'string' || passwort.length > 200) return null;
  const ab = await profilLeiteAb(passwort, profil.salz);
  return profilGleich(ab.pruefung, profil.pruefung) ? ab.schluessel : null;
}

async function profilErstelle(name, passwort, erstes) {
  name = profilSaubererName(name);
  if (!name || typeof passwort !== 'string' || passwort.length < 4 || passwort.length > 200) throw new Error('Name oder Passwort passt nicht');
  const salzBytes = crypto.getRandomValues(new Uint8Array(18));
  const salz = profilB64(salzBytes);
  const ab = await profilLeiteAb(passwort, salz);
  const profil = { id: uid().replace(/[^a-z0-9_-]/gi, ''), name, salz, pruefung: ab.pruefung, datenbank: erstes ? 'vani' : '', angelegt: Date.now(), zuletzt: Date.now() };
  const alle = profilLadeRegistry();
  if (alle.some((p) => normalisiere(p.name) === normalisiere(name))) throw new Error('Diesen Namen gibt es hier schon');
  alle.push(profil); profilSpeichereRegistry(alle);
  PROFIL_SCHLUESSEL = ab.schluessel;
  aktiviereProfil(profil);
  return profil;
}

function profilTor(erstes, profile) {
  return new Promise((resolve) => {
    let ausgewaehlt = profile.length === 1 ? profile[0] : null;
    let versucht = 0, blockiertBis = 0;
    const name = el('input', { type: 'text', maxlength: '40', placeholder: 'Dein Name', autocomplete: 'username' });
    const pass = el('input', { type: 'password', maxlength: '200', placeholder: erstes ? 'Dein Passwort oder Code' : 'Passwort', autocomplete: erstes ? 'new-password' : 'current-password' });
    const pass2 = el('input', { type: 'password', maxlength: '200', placeholder: 'Noch einmal', autocomplete: 'new-password' });
    const meldung = el('div', { class: 'profil-meldung', role: 'status' });
    const profilListe = el('div', { class: 'profil-liste' });
    const titel = el('h1', {}, erstes ? 'Wem gehört dieses VANI?' : 'Willkommen zurück.');
    const unter = el('p', {}, erstes
      ? 'Dein vorhandener Bestand bleibt erhalten und bekommt jetzt eine eigene Tür.'
      : 'Jeder Mensch hat hier seinen eigenen, getrennten Schreibraum.');
    const bestaetigen = el('button', { class: 'knopf voll profil-weiter' }, erstes ? 'Mein VANI öffnen' : 'Öffnen');

    const waehle = (p) => {
      ausgewaehlt = p;
      $$('.profil-wahl', profilListe).forEach((b) => b.classList.toggle('an', b.dataset.id === p.id));
      name.value = p.name; name.hidden = true; pass2.hidden = true;
      pass.value = ''; meldung.textContent = ''; pass.focus();
    };
    for (const p of profile) profilListe.append(el('button', { class: 'profil-wahl', 'data-id': p.id, onclick: () => waehle(p) },
      el('span', { class: 'profil-monogramm' }, p.name.slice(0, 1).toUpperCase()), el('span', {}, p.name)));
    if (!erstes) profilListe.append(el('button', { class: 'profil-wahl neu', onclick: () => resolve({ neu: true, zu }) },
      el('span', { class: 'profil-monogramm' }, '+'), el('span', {}, 'Neues Profil auf diesem Gerät')));

    bestaetigen.addEventListener('click', async () => {
      if (Date.now() < blockiertBis) { meldung.textContent = 'Einen Augenblick warten, dann noch einmal.'; return; }
      bestaetigen.disabled = true; meldung.textContent = 'Die Tür öffnet sich …';
      try {
        if (erstes) {
          if (!profilSaubererName(name.value)) throw new Error('Bitte einen Namen eintragen.');
          if (pass.value.length < 4) throw new Error('Mindestens vier Zeichen. Länger ist sicherer.');
          if (pass.value !== pass2.value) throw new Error('Die beiden Eingaben sind noch nicht gleich.');
          const profil = await profilErstelle(name.value, pass.value, profile.length === 0);
          zu(); resolve({ profil });
        } else {
          if (!ausgewaehlt) throw new Error('Bitte zuerst dein Profil wählen.');
          const schluessel = await profilPruefePasswort(ausgewaehlt, pass.value);
          if (!schluessel) {
            versucht++;
            if (versucht >= 5) blockiertBis = Date.now() + Math.min(60000, 2000 * Math.pow(2, versucht - 5));
            throw new Error('Das Passwort passt nicht.');
          }
          PROFIL_SCHLUESSEL = schluessel; ausgewaehlt.zuletzt = Date.now();
          profilSpeichereRegistry(profile); aktiviereProfil(ausgewaehlt);
          zu(); resolve({ profil: ausgewaehlt });
        }
      } catch (e) { meldung.textContent = e && e.message || 'Das hat nicht geklappt.'; }
      bestaetigen.disabled = false;
    });
    pass.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (!erstes || pass2.value)) bestaetigen.click(); });
    pass2.addEventListener('keydown', (e) => { if (e.key === 'Enter') bestaetigen.click(); });

    const karte = el('div', { class: 'profil-karte' },
      el('div', { class: 'profil-siegel' }, 'V'), titel, unter,
      profilListe, name, pass, erstes ? pass2 : null, meldung, bestaetigen,
      erstes ? el('small', {}, 'Vier Zeichen sind erlaubt; ein längerer Satz schützt besser. Das Passwort verlässt dieses Gerät nie.') : null);
    const tor = el('div', { class: 'profil-tor' }, karte);
    const zu = () => tor.remove();
    document.body.append(tor);
    if (erstes) setTimeout(() => name.focus(), 60);
    else if (ausgewaehlt) { requestAnimationFrame(() => waehle(ausgewaehlt)); }
  });
}

async function profilAnmelden() {
  let profile = profilLadeRegistry();
  let ergebnis = await profilTor(profile.length === 0, profile);
  if (ergebnis && ergebnis.neu) {
    ergebnis.zu(); profile = profilLadeRegistry();
    ergebnis = await profilTor(true, profile);
  }
  return ergebnis && ergebnis.profil || null;
}

function profilWechseln() {
  try { spueleAlles(); } catch (e) {}
  location.reload();
}

async function profilPasswortAendern() {
  if (!AKTIVES_PROFIL) return false;
  return new Promise((resolve) => {
    const alt = el('input', { type: 'password', maxlength: '200', placeholder: 'Bisheriges Passwort', autocomplete: 'current-password' });
    const neu = el('input', { type: 'password', maxlength: '200', placeholder: 'Neues Passwort', autocomplete: 'new-password' });
    const neu2 = el('input', { type: 'password', maxlength: '200', placeholder: 'Neues Passwort wiederholen', autocomplete: 'new-password' });
    const meldung = el('div', { class: 'profil-meldung', role: 'status' });
    let erledigt = false;
    const speichern = el('button', { class: 'knopf voll', onclick: async () => {
      speichern.disabled = true; meldung.textContent = 'Sichere die neue Tür …';
      try {
        const bisherigerSchluessel = await profilPruefePasswort(AKTIVES_PROFIL, alt.value);
        if (!bisherigerSchluessel) throw new Error('Das bisherige Passwort passt nicht.');
        if (neu.value.length < 4 || neu.value.length > 200) throw new Error('Mindestens vier Zeichen. Ein längerer Satz schützt besser.');
        if (neu.value !== neu2.value) throw new Error('Die beiden neuen Eingaben sind noch nicht gleich.');
        if (profilGleich(alt.value, neu.value)) throw new Error('Das neue Passwort ist noch dasselbe.');
        const syncConfig = globalThis._sync && _sync.config ? _sync.config : (typeof syncLadeConfig === 'function' ? await syncLadeConfig() : null);
        const salz = profilB64(crypto.getRandomValues(new Uint8Array(18)));
        const ab = await profilLeiteAb(neu.value, salz);
        const registry = profilLadeRegistry(), eintrag = registry.find((p) => p.id === AKTIVES_PROFIL_ID);
        if (!eintrag) throw new Error('Das Profil wurde auf diesem Gerät nicht gefunden.');
        const vorher = { salz: eintrag.salz, pruefung: eintrag.pruefung };
        eintrag.salz = salz; eintrag.pruefung = ab.pruefung;
        PROFIL_SCHLUESSEL = ab.schluessel;
        try {
          profilSpeichereRegistry(registry);
          Object.assign(AKTIVES_PROFIL, { salz, pruefung: ab.pruefung });
          if (syncConfig && typeof syncSpeichereConfig === 'function') await syncSpeichereConfig(syncConfig);
        } catch (e) {
          eintrag.salz = vorher.salz; eintrag.pruefung = vorher.pruefung; profilSpeichereRegistry(registry);
          Object.assign(AKTIVES_PROFIL, vorher); PROFIL_SCHLUESSEL = bisherigerSchluessel; throw e;
        }
        erledigt = true; zu(); toast('Dein neues Passwort gilt ab jetzt.'); resolve(true);
      } catch (e) { meldung.textContent = e && e.message || 'Das Passwort konnte nicht geändert werden.'; speichern.disabled = false; }
    } }, 'Passwort ändern');
    const kasten = el('div', { class: 'modal profil-passwort-modal' }, el('h2', {}, 'Neue Tür für ' + AKTIVES_PROFIL.name),
      el('p', { style: 'color:var(--blass);line-height:1.55;margin:8px 0 14px' }, 'Deine Texte bleiben unverändert. Auch ein vorhandener Kopplungscode wird sicher mit dem neuen Passwort umhüllt.'),
      alt, neu, neu2, meldung,
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'), speichern));
    const zu = zeigeDeck(kasten, () => { if (!erledigt) resolve(false); });
    setTimeout(() => alt.focus(), 60);
  });
}

function profilAktivitaet() { _profilLetzteAktivitaet = Date.now(); }
function profilStarteAutosperre() {
  for (const art of ['pointerdown', 'keydown', 'input']) document.addEventListener(art, profilAktivitaet, { passive: true });
  clearInterval(_profilSperrtimer);
  _profilSperrtimer = setInterval(() => {
    const min = D.einst.sperreNachMinuten;
    if (!min || document.visibilityState !== 'hidden' || Date.now() - _profilLetzteAktivitaet < min * 60000) return;
    try { spueleAlles(); } catch (e) {}
    location.reload();
  }, 30000);
}

async function profilVerschluesseleObjekt(objekt) {
  if (!PROFIL_SCHLUESSEL) return objekt;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const klar = new TextEncoder().encode(JSON.stringify(objekt));
  const daten = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, PROFIL_SCHLUESSEL, klar);
  return { gesichert: 1, iv: profilB64(iv), daten: profilB64(new Uint8Array(daten)) };
}
async function profilEntschluesseleObjekt(paket) {
  if (!paket || paket.gesichert !== 1) return paket;
  if (!PROFIL_SCHLUESSEL) return null;
  try {
    const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: profilBytes(paket.iv) }, PROFIL_SCHLUESSEL, profilBytes(paket.daten));
    return JSON.parse(new TextDecoder().decode(klar));
  } catch (e) { return null; }
}
