/* ================================================================
   VANI — Ambiences: echte Aufnahmen statt gerechneter Klänge

   Drei Dinge machen das hier besser als üblich:

   1. Nahtlos. Zwei Abspieler laufen versetzt und blenden ineinander über.
      Dadurch hört man nie die Naht, an der ein Loop von vorn beginnt — auch
      bei Aufnahmen, die gar nicht als Loop geschnitten wurden.
   2. Lebendig. Jede Ebene atmet: Lautstärke und Klangfarbe wandern langsam,
      damit eine Minute Aufnahme nicht nach einer Minute Aufnahme klingt.
   3. Sparsam. Nichts wird geladen, bevor es gebraucht wird. Einmal geholt,
      liegt eine Aufnahme dauerhaft im Gerät — auch offline, auch im Flugzeug.
   ================================================================ */

const AMBIENCE_VERSION = 1;
const AMBIENCE_MAX = 40 * 1024 * 1024;   /* je Datei: großzügig, aber begrenzt */

/* Der mitgelieferte Fundus. `datei` liegt neben der App, `quelle` nennt die
   Herkunft ehrlich. Eigene Aufnahmen kommen als Dokumente vom Typ „klang“
   dazu und stehen gleichberechtigt daneben. */
let AMBIENCE_KATALOG = [];
function ambienceKatalogSetzen(liste) {
  AMBIENCE_KATALOG = (Array.isArray(liste) ? liste : []).filter((k) => k && typeof k.id === 'string' && /^[a-z0-9_-]{1,40}$/.test(k.id))
    .map((k) => ({
      id: k.id,
      name: String(k.name || k.id).slice(0, 60),
      kat: String(k.kat || 'Sonst').slice(0, 30),
      datei: String(k.datei || (k.id + '.m4a')).replace(/[^a-zA-Z0-9._-]/g, ''),
      mb: begrenze(k.mb, 0, 100, 0),
      quelle: String(k.quelle || '').slice(0, 200)
    }));
  return AMBIENCE_KATALOG;
}

/* Eigene Klänge: Dokumente vom Typ „klang“ mit der Aufnahme in `datei` (Medien). */
function eigeneAmbiences() { return vomTyp('klang'); }
function alleAmbiences() {
  return [...AMBIENCE_KATALOG.map((k) => ({ ...k, eigen: false })),
    ...eigeneAmbiences().map((d) => ({ id: 'eigen:' + d.id, name: d.titel || 'Eigener Klang', kat: d.art || 'Meine', eigen: true, doc: d }))];
}
function ambienceFinde(id) { return alleAmbiences().find((a) => a.id === id) || null; }
function ambienceKategorien() {
  const raus = [];
  for (const a of alleAmbiences()) if (!raus.includes(a.kat)) raus.push(a.kat);
  return raus;
}

/* ----- Vorrat: einmal geholt, für immer da ----- */
function ambienceSchluessel(id) { return 'ambience:' + AMBIENCE_VERSION + ':' + id; }
async function ambienceImVorrat(id) {
  try { return !!(await dbGet('media', ambienceSchluessel(id))); } catch (e) { return false; }
}
async function ambienceVorratStand() {
  const raus = { da: [], fehlt: [], bytes: 0 };
  for (const a of alleAmbiences()) {
    if (a.eigen) { raus.da.push(a.id); continue; }
    const blob = await dbGet('media', ambienceSchluessel(a.id)).catch(() => null);
    if (blob) { raus.da.push(a.id); raus.bytes += blob.size || 0; } else raus.fehlt.push(a.id);
  }
  return raus;
}
async function ambienceVorratLeeren() {
  let weg = 0;
  for (const a of AMBIENCE_KATALOG) {
    if (await ambienceImVorrat(a.id)) { await dbDel('media', ambienceSchluessel(a.id)).catch(() => {}); weg++; }
  }
  _ambiencePuffer.clear();
  return weg;
}

/* Holt eine Aufnahme — aus dem Vorrat, sonst aus dem Netz und dann in den Vorrat. */
async function ambienceBlob(id, beiFortschritt, ohneAblage) {
  const a = ambienceFinde(id);
  if (!a) throw new Error('Diesen Klang gibt es nicht.');
  if (a.eigen) {
    const blob = await dbGet('media', a.doc.datei);
    if (!blob) throw new Error('Die Aufnahme ist nicht mehr da.');
    return blob;
  }
  const schluessel = ambienceSchluessel(id);
  if (!ohneAblage) {
    const gespeichert = await dbGet('media', schluessel).catch(() => null);
    if (gespeichert) { gespeichert._ausDerAblage = true; return gespeichert; }
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new Error('Dafür braucht es einmal Internet.');
  const antwort = await fetch('klang/' + a.datei, { cache: 'force-cache' });
  if (!antwort.ok) throw new Error('Der Klang ließ sich nicht laden.');
  const gesamt = Number(antwort.headers.get('content-length')) || 0;
  let blob;
  if (antwort.body && beiFortschritt && gesamt) {
    const leser = antwort.body.getReader();
    const stuecke = [];
    let geladen = 0;
    for (;;) {
      const { done, value } = await leser.read();
      if (done) break;
      stuecke.push(value); geladen += value.length;
      if (geladen > AMBIENCE_MAX) throw new Error('Diese Aufnahme ist zu groß.');
      beiFortschritt(Math.min(1, geladen / gesamt));
    }
    blob = new Blob(stuecke, { type: 'audio/mp4' });
  } else {
    blob = await antwort.blob();
    if (blob.size > AMBIENCE_MAX) throw new Error('Diese Aufnahme ist zu groß.');
  }
  await dbPut('media', blob, schluessel).catch(() => {});
  return blob;
}

/* Dekodierte Aufnahmen bleiben im Speicher, solange die App offen ist. */
const _ambiencePuffer = new Map();
function ambiencePufferBegrenzen(max = 6) {
  if (_ambiencePuffer.size <= max) return;
  for (const id of [..._ambiencePuffer.keys()]) {
    if (_ambiencePuffer.size <= max) break;
    if (typeof _ambienceLaeuft !== 'undefined' && _ambienceLaeuft.has(id)) continue;
    _ambiencePuffer.delete(id);
  }
}
function ambiencePufferFreigeben() {
  const vorher = _ambiencePuffer.size;
  ambiencePufferBegrenzen(0);
  return vorher - _ambiencePuffer.size;
}
/* ----- Kann dieser Browser die Aufnahmen ueberhaupt? -----
   Die Klaenge liegen als Ogg-Opus vor. Das ist ueberall zu Hause — ausser in
   Safari: dort haengt es an der Systemfassung. Auf einem neueren iPad laeuft
   es, auf einem aelteren nicht, und dann kam bisher nur „Diese Aufnahme
   versteht der Browser nicht“ — eine Sackgasse, die aussieht wie ein Fehler
   in der Datei, obwohl es am Geraet liegt.

   Gefragt wird nicht der Browsername, sondern der Browser selbst: was er
   abspielen kann, weiss er am besten. 'probably' und 'maybe' sind beide ein
   Ja — 'maybe' heisst nur, dass er es erst am Inhalt sicher sagen kann. */
let _ambienceKann = null;
function ambienceKannOgg() {
  if (_ambienceKann !== null) return _ambienceKann;
  try {
    const probe = document.createElement('audio');
    const opus = probe.canPlayType('audio/ogg; codecs="opus"');
    const vorbis = probe.canPlayType('audio/ogg; codecs="vorbis"');
    _ambienceKann = !!(opus || vorbis);
  } catch (e) { _ambienceKann = true; }   /* im Zweifel probieren, nicht verhindern */
  return _ambienceKann;
}
/* Welche Formen der Browser sonst versteht — fuer die ehrliche Auskunft. */
function ambienceFormate() {
  const raus = [];
  try {
    const probe = document.createElement('audio');
    for (const [name, typ] of [['Ogg-Opus', 'audio/ogg; codecs="opus"'], ['AAC', 'audio/mp4; codecs="mp4a.40.2"'], ['MP3', 'audio/mpeg'], ['WAV', 'audio/wav']]) {
      if (probe.canPlayType(typ)) raus.push(name);
    }
  } catch (e) {}
  return raus;
}

async function ambiencePuffer(id, beiFortschritt) {
  if (_ambiencePuffer.has(id)) return _ambiencePuffer.get(id);
  const a = holeAudio();
  const eintrag = typeof ambienceFinde === 'function' ? ambienceFinde(id) : null;
  /* Beim ersten Anlauf darf die Ablage helfen. Scheitert das Dekodieren an
     einem Stueck, das dort liegt, wird es weggeworfen und einmal frisch
     geholt — siehe unten. */
  return ambienceDekodieren(id, a, eintrag, beiFortschritt, false);
}

/* Der eigentliche Weg: holen, dekodieren, behalten.
   Der zweite Anlauf ist der Grund, warum das eine eigene Funktion ist. Die
   Ablage merkt sich das heruntergeladene Stueck, BEVOR es dekodiert wird —
   sonst muesste jeder Klang zweimal durchs Netz. Das hat aber eine Folge, die
   lange niemand gesehen hat: Auf einem Geraet, das Ogg-Opus nicht abspielen
   kann, lag danach ein unlesbares Stueck in der Ablage. Es wurde bei jedem
   Versuch wieder hervorgeholt und scheiterte wieder — auch nachdem die
   Aufnahmen laengst in einer Form vorlagen, die das Geraet versteht. Das
   Update allein haette also gar nichts geaendert.

   Deshalb: Was sich nicht dekodieren laesst, hat in der Ablage nichts
   verloren. Wegwerfen und genau einmal neu holen. */
async function ambienceDekodieren(id, a, eintrag, beiFortschritt, ohneAblage) {
  const blob = await ambienceBlob(id, beiFortschritt, ohneAblage);
  const ausDerAblage = !!blob._ausDerAblage;
  const roh = await blob.arrayBuffer();
  const puffer = await new Promise((res, rej) => {
    const fertig = (p) => res(p);
    /* Beim Scheitern nicht nur sagen, DASS es nicht geht, sondern warum —
       und was hilft. Sonst sucht man den Fehler bei der Datei. */
    const schief = () => {
      const eigen = eintrag && eintrag.eigen;
      if (!eigen && typeof ambienceKannOgg === 'function' && !ambienceKannOgg()) {
        const kann = ambienceFormate();
        rej(new Error('Dieses Gerät kann Ogg-Opus nicht abspielen — daran liegt es, nicht am Klang. '
          + 'Auf einem neueren iPadOS läuft es; ein Systemupdate behebt es.'
          + (kann.length ? ' (Dieses Gerät versteht: ' + kann.join(', ') + '.)' : '')));
        return;
      }
      rej(new Error('Diese Aufnahme versteht der Browser nicht.'));
    };
    try {
      const p = a.ctx.decodeAudioData(roh, fertig, schief);
      if (p && typeof p.then === 'function') p.then(fertig, schief);
    } catch (e) { schief(e); }
  }).catch(async (fehler) => {
    if (!ausDerAblage || ohneAblage) throw fehler;
    /* Das lag in der Ablage und laesst sich nicht abspielen — weg damit. */
    try { await dbDel('media', ambienceSchluessel(id)); } catch (e) {}
    return ambienceDekodieren(id, a, eintrag, beiFortschritt, true);
  });
  _ambiencePuffer.set(id, puffer);
  ambiencePufferBegrenzen();
  return puffer;
}

/* ----- Der Kern: ein Loop ohne hörbare Naht -----
   Zwei Quellen laufen abwechselnd. Die zweite startet, während die erste noch
   ausklingt; beide Rampen kreuzen sich. Wo eine harte Wiederholung knacken
   würde, entsteht so ein weicher, endloser Übergang. */
function ambienceStimmeBauen(a, puffer, ziel, einstellung) {
  const e = einstellung || {};
  const blende = begrenze(e.blende, .5, 12, Math.min(4, puffer.duration / 5));
  const tempo = begrenze(e.tempo, .5, 2, 1);
  const laenge = puffer.duration / tempo;
  const abstand = Math.max(.6, laenge - blende);

  const aus = a.ctx.createGain();
  aus.gain.value = 1;
  const filter = a.ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = begrenze(e.klarheit, 300, 20000, 20000);
  const tiefe = a.ctx.createBiquadFilter();
  tiefe.type = 'highpass';
  tiefe.frequency.value = begrenze(e.tiefe, 20, 2000, 20);
  aus.connect(tiefe); tiefe.connect(filter); filter.connect(ziel);

  const quellen = new Set();
  let timer = null, gestoppt = false, erster = true;

  const starte = (wann) => {
    if (gestoppt) return;
    const q = a.ctx.createBufferSource();
    q.buffer = puffer;
    q.playbackRate.value = tempo;
    /* Der erste Einsatz kommt schnell — sonst wartet man beim Antippen
       sekundenlang auf Stille. Erst die Wiederholungen blenden weich. */
    const auf = erster ? Math.min(.9, blende) : blende;
    erster = false;
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(.0001, wann);
    g.gain.exponentialRampToValueAtTime(1, wann + auf);
    g.gain.setValueAtTime(1, wann + Math.max(auf, laenge - blende));
    g.gain.exponentialRampToValueAtTime(.0001, wann + laenge);
    q.connect(g); g.connect(aus);
    q.start(wann);
    q.stop(wann + laenge + .1);
    quellen.add(q);
    q.onended = () => { quellen.delete(q); try { g.disconnect(); } catch (x) {} };
    timer = setTimeout(() => starte(a.ctx.currentTime + .05), Math.max(120, abstand * 1000 - 220));
  };
  starte(a.ctx.currentTime + .04);

  /* Atmen: die Aufnahme wandert langsam in Lautstärke und Klangfarbe. */
  let atem = null;
  const atmen = begrenze(e.atmen, 0, 1, .35);
  if (atmen > 0) {
    const tu = () => {
      const t = a.ctx.currentTime;
      aus.gain.setTargetAtTime(1 - atmen * .45 * Math.random(), t, 4.5);
      if (filter.frequency.value < 19000) filter.frequency.setTargetAtTime(begrenze(e.klarheit, 300, 20000, 20000) * (.8 + Math.random() * .35), t, 6);
      atem = setTimeout(tu, 7000 + Math.random() * 9000);
    };
    atem = setTimeout(tu, 3000 + Math.random() * 5000);
  }

  return {
    ausgang: aus,
    setzeTempo(v) { for (const q of quellen) { try { q.playbackRate.setTargetAtTime(begrenze(v, .5, 2, 1), a.ctx.currentTime, .4); } catch (x) {} } },
    setzeKlarheit(v) { try { filter.frequency.setTargetAtTime(begrenze(v, 300, 20000, 20000), a.ctx.currentTime, .3); } catch (x) {} },
    setzeTiefe(v) { try { tiefe.frequency.setTargetAtTime(begrenze(v, 20, 2000, 20), a.ctx.currentTime, .3); } catch (x) {} },
    stop() {
      gestoppt = true;
      clearTimeout(timer); clearTimeout(atem);
      for (const q of quellen) { try { q.stop(); } catch (x) {} }
      quellen.clear();
      try { aus.disconnect(); } catch (x) {}
    }
  };
}

/* ----- Steuerung: welche Ambience läuft wie laut ----- */
function saubereAmbienceMischung(pegel) {
  const raus = {};
  if (!pegel || typeof pegel !== 'object' || Array.isArray(pegel)) return raus;
  const erlaubt = new Set(alleAmbiences().map((a) => a.id));
  for (const [id, wert] of Object.entries(pegel)) {
    if (!erlaubt.has(id)) continue;
    const v = begrenze(wert, 0, 1, 0);
    if (v > 0) raus[id] = v;
  }
  return raus;
}
function saubereAmbienceFeinheit(f) {
  const q = f && typeof f === 'object' && !Array.isArray(f) ? f : {};
  return {
    tempo: begrenze(q.tempo, .5, 2, 1),
    klarheit: begrenze(q.klarheit, 300, 20000, 20000),
    tiefe: begrenze(q.tiefe, 20, 2000, 20),
    atmen: begrenze(q.atmen, 0, 1, .35),
    blende: begrenze(q.blende, .5, 12, 4)
  };
}

const _ambienceLaeuft = new Map();   /* id -> { gain, stimme } */

function ambienceFeinheitVon(id) {
  const alle = D.einst.ambienceFein && typeof D.einst.ambienceFein === 'object' ? D.einst.ambienceFein : {};
  return saubereAmbienceFeinheit(alle[id]);
}
function ambienceFeinheitSetzen(id, teil) {
  if (!D.einst.ambienceFein || typeof D.einst.ambienceFein !== 'object') D.einst.ambienceFein = {};
  const jetzt = ambienceFeinheitVon(id);
  D.einst.ambienceFein[id] = saubereAmbienceFeinheit({ ...jetzt, ...teil });
  speichereEinst();
  const laeuft = _ambienceLaeuft.get(id);
  if (laeuft && laeuft.stimme) {
    const f = D.einst.ambienceFein[id];
    laeuft.stimme.setzeTempo(f.tempo);
    laeuft.stimme.setzeKlarheit(f.klarheit);
    laeuft.stimme.setzeTiefe(f.tiefe);
  }
  return D.einst.ambienceFein[id];
}

function ambienceAus(id) {
  const l = _ambienceLaeuft.get(id);
  if (!l) return;
  _ambienceLaeuft.delete(id);
  try {
    l.gain.gain.setTargetAtTime(.0001, _audio.ctx.currentTime, .5);
    setTimeout(() => { try { l.stimme.stop(); l.gain.disconnect(); } catch (e) {} }, 1600);
  } catch (e) { try { l.stimme.stop(); } catch (x) {} }
}

async function ambienceAn(id, staerke, beiFortschritt) {
  staerke = begrenze(staerke, 0, 1, .5);
  if (staerke <= 0) { ambienceAus(id); return false; }
  const a = holeAudio();
  const laeuft = _ambienceLaeuft.get(id);
  if (laeuft) { laeuft.gain.gain.setTargetAtTime(staerke, a.ctx.currentTime, .4); return true; }
  const puffer = await ambiencePuffer(id, beiFortschritt);
  if (!D.einst.ambience || !D.einst.ambience[id]) return false;  /* zwischenzeitlich abgewählt */
  const gain = a.ctx.createGain();
  gain.gain.value = .0001;
  gain.connect(a.master);
  const stimme = ambienceStimmeBauen(a, puffer, gain, ambienceFeinheitVon(id));
  gain.gain.setTargetAtTime(staerke, a.ctx.currentTime, .25);
  _ambienceLaeuft.set(id, { gain, stimme });
  return true;
}

/* Wendet eine ganze Mischung an: neue an, alte aus, Lautstärken nach. */
async function ambienceMischungAnwenden(pegel, beiFortschritt) {
  D.einst.ambience = saubereAmbienceMischung(pegel);
  speichereEinst();
  for (const id of [..._ambienceLaeuft.keys()]) if (!D.einst.ambience[id]) ambienceAus(id);
  const fehler = [];
  for (const [id, v] of Object.entries(D.einst.ambience)) {
    try { await ambienceAn(id, v, beiFortschritt ? (p) => beiFortschritt(id, p) : null); }
    catch (e) { fehler.push({ id, meldung: (e && e.message) || 'Ging nicht.' }); delete D.einst.ambience[id]; }
  }
  if (fehler.length) speichereEinst();
  return fehler;
}
function ambienceAktiv() { return Object.values(D.einst.ambience || {}).some((v) => v > 0); }
function ambienceAllesAus() { return ambienceMischungAnwenden({}); }

/* ----- Klangbilder: eine Mischung mit Namen -----
   Ein Klangbild kann an einer Szene, einem Kapitel, einem Heft oder einem
   Projekt hängen. Wer dort zu schreiben beginnt, hört es von selbst. */
function klangbilder() { return vomTyp('klangbild').sort((a, b) => (a.titel || '').localeCompare(b.titel || '', 'de')); }
function klangbildJetzt(titel) {
  const pegel = { ...(D.einst.ambience || {}) };
  const gewebt = { ...(D.einst.mischung || {}) };
  return neuDoc('klangbild', {
    titel: String(titel || 'Ohne Namen').slice(0, 60),
    pegel, gewebt,
    fein: JSON.parse(JSON.stringify(D.einst.ambienceFein || {})),
    lautstaerke: begrenze(D.einst.lautstaerke, 0, 1, .5)
  });
}
async function klangbildAnwenden(doc) {
  if (!doc) return false;
  if (doc.fein && typeof doc.fein === 'object') {
    D.einst.ambienceFein = {};
    for (const [id, f] of Object.entries(doc.fein)) D.einst.ambienceFein[id] = saubereAmbienceFeinheit(f);
  }
  if (typeof doc.lautstaerke === 'number') setzeLautstaerke(begrenze(doc.lautstaerke, 0, 1, .5));
  if (typeof mischungAnwenden === 'function') mischungAnwenden(doc.gewebt || {});
  await ambienceMischungAnwenden(doc.pegel || {});
  return true;
}

/* Bindung: welches Klangbild gehört zu diesem Ort im Text? */
function klangbildFuer(doc) {
  if (!doc) return null;
  const kette = [doc.id, doc.parent, doc.projekt];
  for (const id of kette) {
    if (!id) continue;
    const b = klangbilder().find((k) => Array.isArray(k.orte) && k.orte.includes(id));
    if (b) return b;
  }
  /* eine Ebene höher: Kapitel eines Elternteils */
  const eltern = doc.parent && D.docs.get(doc.parent);
  if (eltern && eltern.parent) {
    const b = klangbilder().find((k) => Array.isArray(k.orte) && k.orte.includes(eltern.parent));
    if (b) return b;
  }
  return null;
}
function klangbildBinden(bild, ortId) {
  if (!bild || !ortId) return false;
  for (const k of klangbilder()) {
    if (!Array.isArray(k.orte)) continue;
    if (k.orte.includes(ortId) && k.id !== bild.id) { k.orte = k.orte.filter((x) => x !== ortId); speichereStill(k); }
  }
  bild.orte = [...new Set([...(Array.isArray(bild.orte) ? bild.orte : []), ortId])].slice(0, 200);
  speichereStill(bild);
  return true;
}
function klangbildLoesen(ortId) {
  let ab = 0;
  for (const k of klangbilder()) {
    if (Array.isArray(k.orte) && k.orte.includes(ortId)) { k.orte = k.orte.filter((x) => x !== ortId); speichereStill(k); ab++; }
  }
  return ab;
}

/* Beim Öffnen eines Textes das passende Klangbild anlegen — nur wenn erlaubt
   und nur, wenn nicht schon genau dieses läuft. */
let _klangbildZuletzt = null;
async function klangbildFolgen(doc) {
  if (!D.einst.klangFolgt) return false;
  const bild = klangbildFuer(doc);
  if (!bild || _klangbildZuletzt === bild.id) return false;
  _klangbildZuletzt = bild.id;
  await klangbildAnwenden(bild);
  toast('Klangbild „' + (bild.titel || 'Ohne Namen') + '“ — passend zu diesem Ort.', 3200);
  return true;
}

/* ----- Einschlafen: langsam leiser werden ----- */
let _ausklang = null;
function ausklangLaeuft() { return !!_ausklang; }
function ausklangRestMinuten() {
  if (!_ausklang) return 0;
  return Math.max(0, Math.ceil((_ausklang.ende - Date.now()) / 60000));
}
function ausklangStoppen() {
  if (!_ausklang) return false;
  clearInterval(_ausklang.takt);
  if (typeof setzeLautstaerke === 'function') setzeLautstaerke(_ausklang.start);
  _ausklang = null;
  return true;
}
function ausklangStarten(minuten) {
  ausklangStoppen();
  const dauer = begrenze(minuten, 1, 180, 30) * 60000;
  const start = begrenze(D.einst.lautstaerke, 0, 1, .5);
  const von = Date.now();
  const takt = setInterval(() => {
    const anteil = (Date.now() - von) / dauer;
    if (anteil >= 1) {
      clearInterval(takt);
      _ausklang = null;
      ambienceAllesAus();
      if (typeof alleKlaengeAus === 'function') alleKlaengeAus();
      setzeLautstaerke(start);
      toast('Gute Nacht. Der Klang ist ausgegangen.', 5000);
      return;
    }
    /* die letzten 40 % werden hörbar leiser, davor bleibt es fast gleich */
    const kurve = anteil < .6 ? 1 - anteil * .18 : (1 - .108) * Math.pow(1 - (anteil - .6) / .4, 1.6);
    setzeLautstaerke(start * Math.max(0, kurve));
  }, 2000);
  _ausklang = { ende: von + dauer, start, takt };
  return ausklangRestMinuten();
}

/* Eine eigene Aufnahme hereinholen. */
async function ambienceEigeneHinzufuegen() {
  return new Promise((res) => {
    const inp = el('input', { type: 'file', accept: 'audio/*,.mp3,.ogg,.opus,.m4a,.wav,.flac,.webm', style: 'display:none' });
    document.body.append(inp);
    let fertig = false;
    inp.addEventListener('change', async () => {
      fertig = true;
      const datei = inp.files && inp.files[0];
      inp.remove();
      if (!datei) return res(null);
      if (datei.size > AMBIENCE_MAX) { toast('Die Aufnahme ist zu groß (höchstens ' + Math.round(AMBIENCE_MAX / 1048576) + ' MB).'); return res(null); }
      const name = await eingabe({ titel: 'Wie heißt dieser Klang?', wert: datei.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 60), ok: 'Aufnehmen' });
      if (!name) return res(null);
      try {
        const id = await speichereDateiBlob(datei);
        const doc = neuDoc('klang', { titel: name, datei: id, art: 'Meine', groesse: datei.size, dateiname: datei.name.slice(0, 200) });
        toast('„' + name + '“ liegt jetzt bei deinen Klängen.');
        res(doc);
      } catch (e) { toast('Die Aufnahme wollte nicht.'); res(null); }
    });
    inp.addEventListener('cancel', () => { if (!fertig) { inp.remove(); res(null); } });
    inp.click();
  });
}
