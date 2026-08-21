/* ================================================================
   VANI — Klangwelten: alles aus dem Nichts gerechnet, keine Dateien.
   Rezepte nach Andy Farnell („Designing Sound") und eigenen Ohren.
   ================================================================ */

let _audio = null;
let _audioMussNeu = false;
let _audioFehler = '';
let _audioBrueckeLaeuft = null;

function audioUnterstuetzt() { return !!(window.AudioContext || window.webkitAudioContext); }

/* Die Lautstärkeskala war technisch linear und dadurch auf iPad-Lautsprechern
   in der unteren Hälfte kaum hörbar. Diese Kurve bleibt bei 0 wirklich stumm,
   gibt den übrigen Bereich aber so wieder, wie Menschen Lautheit wahrnehmen. */
function audioLautheitsKurve(wert) {
  const w = begrenze(wert, 0, 1, .5);
  return w <= 0 ? 0 : .08 + .82 * Math.pow(w, .75);
}

function _weckImpuls(a) {
  try {
    const p = a.ctx.createBuffer(1, 1, Math.max(8000, a.ctx.sampleRate || 44100));
    const q = a.ctx.createBufferSource(); q.buffer = p; q.connect(a.master); q.start(0);
  } catch (e) {}
}

function _baueAudio() {
  if (!audioUnterstuetzt()) throw new Error('Web Audio wird hier nicht unterstützt');
  const Ctx = window.AudioContext || window.webkitAudioContext;
  let ctx;
  try { ctx = new Ctx({ latencyHint: 'interactive' }); } catch (e) { ctx = new Ctx(); }
  const master = ctx.createGain();
  master.gain.value = audioLautheitsKurve(D.einst.lautstaerke);
  const drossel = ctx.createDynamicsCompressor();
  drossel.threshold.value = -18; drossel.ratio.value = 4;
  master.connect(drossel); drossel.connect(ctx.destination);
  const a = { ctx, master, drossel, puffer: {}, hallen: {}, ebenen: new Map(), generation: Date.now() + Math.random() };
  ctx.onstatechange = () => {
    if (ctx.state === 'interrupted' || ctx.state === 'closed') _audioMussNeu = klangAktiv();
  };
  _weckImpuls(a);
  _audioFehler = '';
  return a;
}

function _verwerfeAudio() {
  const alt = _audio;
  _audio = null;
  if (!alt) return;
  for (const e of alt.ebenen.values()) { try { clearTimeout(e.stopTimer); e.werk.stop(); e.gain.disconnect(); } catch (x) {} }
  alt.ebenen.clear();
  try { alt.ctx.onstatechange = null; alt.ctx.close(); } catch (e) {}
}

function holeAudio() {
  if (!_audio || _audio.ctx.state === 'closed') _audio = _baueAudio();
  if (_audio.ctx.state === 'suspended' || _audio.ctx.state === 'interrupted') {
    try { Promise.resolve(_audio.ctx.resume()).catch((e) => { _audioFehler = e && e.message || 'Klang blieb stumm'; }); } catch (e) { _audioFehler = e.message; }
  }
  return _audio;
}

function _warte(ms) { return new Promise((resolve) => setTimeout(() => resolve(false), ms)); }

async function _warteAufAudio(ctx, ms = 1100) {
  if (ctx.state === 'running') return true;
  try {
    const fortsetzen = Promise.resolve(ctx.resume()).then(() => ctx.state === 'running', () => false);
    await Promise.race([fortsetzen, _warte(ms)]);
  } catch (e) { _audioFehler = e && e.message || 'Klang wurde nicht freigegeben'; }
  return ctx.state === 'running';
}

/* Safari/WebKit kann in einer installierten Home-Bildschirm-App nach dem
   Hintergrundwechsel einen scheinbar „running“ AudioContext ohne Ton behalten.
   Ein winziger echter Medienklang innerhalb derselben Berührung weckt die
   iOS-Mediensitzung, bevor wir die errechneten Atmosphären anschließen. */
async function _audioMedienBruecke() {
  if (_audioBrueckeLaeuft) return _audioBrueckeLaeuft;
  _audioBrueckeLaeuft = (async () => {
    if (typeof document === 'undefined' || !document.createElement || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return false;
    const rate = 16000, anzahl = 1440, kopf = 44;
    const puffer = new ArrayBuffer(kopf + anzahl * 2), v = new DataView(puffer);
    const wort = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    wort(0, 'RIFF'); v.setUint32(4, 36 + anzahl * 2, true); wort(8, 'WAVE'); wort(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    wort(36, 'data'); v.setUint32(40, anzahl * 2, true);
    for (let i = 0; i < anzahl; i++) {
      const h = Math.min(1, i / 100, (anzahl - i) / 180);
      v.setInt16(kopf + i * 2, Math.sin(i * Math.PI * 2 * 440 / rate) * 950 * h, true);
    }
    const url = URL.createObjectURL(new Blob([puffer], { type: 'audio/wav' }));
    const ton = document.createElement('audio');
    ton.setAttribute('playsinline', ''); ton.preload = 'auto'; ton.src = url; ton.volume = .45;
    (document.body || document.documentElement).append(ton);
    try {
      const gespielt = await Promise.race([Promise.resolve(ton.play()).then(() => true, () => false), _warte(1200)]);
      return gespielt;
    } finally {
      setTimeout(() => { try { ton.pause(); ton.remove(); URL.revokeObjectURL(url); } catch (e) {} }, 180);
    }
  })();
  try { return await _audioBrueckeLaeuft; } finally { _audioBrueckeLaeuft = null; }
}

async function audioFreigeben({ neu = false, probe = false } = {}) {
  if (!audioUnterstuetzt()) { _audioFehler = 'Dieser Browser unterstützt Web Audio nicht.'; return false; }
  try {
    if (neu || !_audio || _audio.ctx.state !== 'running' || _audioMussNeu) await _audioMedienBruecke();
    if (neu || _audioMussNeu || (_audio && (_audio.ctx.state === 'closed' || _audio.ctx.state === 'interrupted'))) _verwerfeAudio();
    let a = holeAudio();
    let frei = await _warteAufAudio(a.ctx);
    if (!frei) {
      _verwerfeAudio();
      _audio = _baueAudio(); a = _audio;
      frei = await _warteAufAudio(a.ctx);
    }
    if (!frei) { _audioFehler = 'iOS hält den Klang noch fest. Noch einmal auf „Klang wecken“ tippen.'; return false; }
    _audioMussNeu = false; _audioFehler = '';
    for (const [id, pegel] of Object.entries(D.einst.mischung || {})) if (pegel > 0) ebeneAn(id, pegel);
    if (probe) audioProbe();
    return true;
  } catch (e) { _audioFehler = e && e.message || 'Klang konnte nicht starten'; return false; }
}

function audioNeuStarten() {
  const pegel = Object.assign({}, D.einst.mischung || {});
  _verwerfeAudio();
  _audioMussNeu = false;
  try {
    const a = holeAudio(); /* synchron im Tippen erzeugt: wichtig auf iPad/iPhone */
    _weckImpuls(a);
    const gewollt = Object.keys(pegel).filter((id) => pegel[id] > 0);
    for (const id of gewollt) ebeneAn(id, pegel[id]);
    return true;
  } catch (e) { _audioFehler = e && e.message || 'Klang konnte nicht starten'; return false; }
}

function audioZustand() {
  if (!audioUnterstuetzt()) return { ok: false, state: 'nicht unterstützt', fehler: 'Dieser Browser hat keine Web-Audio-Unterstützung.' };
  return { ok: !!(_audio && _audio.ctx.state === 'running'), state: _audio ? _audio.ctx.state : 'bereit', fehler: _audioFehler };
}

function setzeLautstaerke(wert) {
  wert = begrenze(wert, 0, 1, .5);
  D.einst.lautstaerke = wert;
  speichereEinst();
  if (_audio) _audio.master.gain.setTargetAtTime(audioLautheitsKurve(wert), _audio.ctx.currentTime, .1);
}

/* ----- Rauschfarben (einmal gerechnet, dann geloopt) ----- */
function _rauschpuffer(a, farbe) {
  if (a.puffer[farbe]) return a.puffer[farbe];
  const sek = 3, n = a.ctx.sampleRate * sek;
  const p = a.ctx.createBuffer(2, n, a.ctx.sampleRate);
  for (let k = 0; k < 2; k++) {
    const d = p.getChannelData(k);
    if (farbe === 'weiss') {
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } else if (farbe === 'rosa') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759;
        b2 = .96900 * b2 + w * .1538520; b3 = .86650 * b3 + w * .3104856;
        b4 = .55000 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11;
        b6 = w * .115926;
      }
    } else {
      let letzt = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        letzt = (letzt + .02 * w) / 1.02;
        d[i] = letzt * 3.5;
      }
    }
  }
  a.puffer[farbe] = p;
  return p;
}

function _hallIR(a, sek, tiefpass) {
  const key = sek + ':' + tiefpass;
  if (a.hallen[key]) return a.hallen[key];
  const n = Math.floor(a.ctx.sampleRate * sek);
  const p = a.ctx.createBuffer(2, n, a.ctx.sampleRate);
  for (let k = 0; k < 2; k++) {
    const d = p.getChannelData(k);
    let glatt = 0;
    const alpha = Math.min(1, tiefpass / (a.ctx.sampleRate / 2));
    for (let i = 0; i < n; i++) {
      const w = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.2);
      glatt += alpha * (w - glatt);
      d[i] = glatt;
    }
  }
  a.hallen[key] = p;
  return p;
}

/* ----- Werkbank: baut & räumt hinter jeder Ebene auf ----- */
function neueWerkbank(a, out) {
  const quellen = [], timer = new Set(), intervalle = new Set();
  const w = {
    a, out,
    rauschen(farbe) {
      const q = a.ctx.createBufferSource();
      q.buffer = _rauschpuffer(a, farbe); q.loop = true; q.start();
      quellen.push(q); return q;
    },
    ton(typ, freq) {
      const o = a.ctx.createOscillator();
      o.type = typ; o.frequency.value = freq; o.start();
      quellen.push(o); return o;
    },
    filter(typ, freq, q) {
      const f = a.ctx.createBiquadFilter();
      f.type = typ; f.frequency.value = freq; if (q) f.Q.value = q;
      return f;
    },
    pegel(v) { const g = a.ctx.createGain(); g.gain.value = v; return g; },
    lfo(rate, hub, ziel) {
      const o = a.ctx.createOscillator(); o.frequency.value = rate;
      const g = a.ctx.createGain(); g.gain.value = hub;
      o.connect(g); g.connect(ziel); o.start();
      quellen.push(o); return o;
    },
    wandel(param, min, max, msMin, msMax, glaette) {
      const tu = () => {
        param.setTargetAtTime(min + Math.random() * (max - min), a.ctx.currentTime, glaette ?? .6);
        w.spaeter(tu, msMin + Math.random() * (msMax - msMin));
      };
      tu();
    },
    takt(msMittel, fn) {
      const tu = () => {
        fn(a.ctx.currentTime);
        w.spaeter(tu, Math.max(30, -Math.log(Math.max(Number.EPSILON, Math.random())) * msMittel));
      };
      w.spaeter(tu, Math.random() * msMittel);
    },
    spaeter(fn, ms) {
      const id = setTimeout(() => { timer.delete(id); fn(); }, Math.max(0, Number(ms) || 0));
      timer.add(id); return id;
    },
    immer(ms, fn) { const id = setInterval(fn, Math.max(16, Number(ms) || 16)); intervalle.add(id); return id; },
    hall(sek, tiefpass, anteil) {
      const c = a.ctx.createConvolver();
      c.buffer = _hallIR(a, sek, tiefpass);
      const g = a.ctx.createGain(); g.gain.value = anteil;
      c.connect(g); g.connect(out);
      return c;
    },
    huelle(ziel, t, spitze, decaySek) {
      ziel.setValueAtTime(Math.max(.0001, spitze), t);
      ziel.exponentialRampToValueAtTime(.0001, t + decaySek);
    },
    stop() {
      timer.forEach(clearTimeout); timer.clear();
      intervalle.forEach(clearInterval); intervalle.clear();
      quellen.forEach((q) => { try { q.stop(); } catch (e) {} });
    }
  };
  return w;
}

/* kurzer tonaler Ping (Tropfen, Blasen, Vogel-Silben) */
function _ping(w, ziel, { f0, f1, dauer, staerke, typ }) {
  const t = w.a.ctx.currentTime;
  const o = w.a.ctx.createOscillator();
  o.type = typ || 'sine';
  o.frequency.setValueAtTime(f0, t);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dauer);
  const g = w.pegel(0);
  w.huelle(g.gain, t, staerke, dauer);
  o.connect(g); g.connect(ziel);
  o.start(t); o.stop(t + dauer + .05);
}
function _knack(w, ziel, { freq, q, dauer, staerke }) {
  const t = w.a.ctx.currentTime;
  const b = w.a.ctx.createBufferSource();
  b.buffer = _rauschpuffer(w.a, 'weiss');
  b.loop = true;
  const f = w.filter('bandpass', freq, q || 2);
  const g = w.pegel(0);
  w.huelle(g.gain, t, staerke, dauer);
  b.connect(f); f.connect(g); g.connect(ziel);
  b.start(t); b.stop(t + dauer + .05);
}

/* ================================================================
   Die Ebenen
   ================================================================ */
const KLANG_EBENEN = [

  /* --- Wetter --- */
  { id: 'regenfenster', name: 'Regen ans Fenster', kat: 'Wetter', bau(a, out) {
    const w = neueWerkbank(a, out);
    const bett = w.rauschen('rosa'), hp = w.filter('highpass', 900), g = w.pegel(.16);
    bett.connect(hp); hp.connect(g); g.connect(out);
    w.wandel(hp.frequency, 750, 1150, 3000, 9000);
    w.takt(140, () => {
      if (Math.random() < .35) return;
      _ping(w, out, { f0: 1800 + Math.random() * 800, f1: 1500, dauer: .015 + Math.random() * .012, staerke: .05 + Math.random() * .09 });
    });
    w.takt(18000, () => _knack(w, out, { freq: 2200, q: 1.2, dauer: .3, staerke: .05 }));
    return w;
  }},

  { id: 'regendach', name: 'Regen aufs Dach', kat: 'Wetter', bau(a, out) {
    const w = neueWerkbank(a, out);
    const bett = w.rauschen('braun'), lp = w.filter('lowpass', 2500), g = w.pegel(.4);
    const beule = w.filter('peaking', 90, 1); beule.gain.value = 6;
    bett.connect(lp); lp.connect(beule); beule.connect(g); g.connect(out);
    w.takt(70, () => _knack(w, out, { freq: 300 + Math.random() * 500, q: 1, dauer: .03 + Math.random() * .03, staerke: .04 + Math.random() * .05 }));
    return w;
  }},

  { id: 'platzregen', name: 'Platzregen', kat: 'Wetter', bau(a, out) {
    const w = neueWerkbank(a, out);
    const bett = w.rauschen('weiss'), hp = w.filter('highpass', 500), lp = w.filter('lowpass', 9000), g = w.pegel(.3);
    bett.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
    w.wandel(g.gain, .22, .34, 8000, 16000, 1.5);
    const prasseln = w.rauschen('weiss'), bp = w.filter('bandpass', 4000, 1), flacker = w.pegel(.1);
    prasseln.connect(bp); bp.connect(flacker); flacker.connect(out);
    const fl = w.rauschen('weiss'), fllp = w.filter('lowpass', 45), flg = w.pegel(.08);
    fl.connect(fllp); fllp.connect(flg); flg.connect(flacker.gain);
    w.takt(400, () => _knack(w, out, { freq: 800 + Math.random() * 700, q: 2, dauer: .05, staerke: .12 }));
    return w;
  }},

  { id: 'gewitter', name: 'Fernes Gewitter', kat: 'Wetter', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(6, 900, .8);
    w.takt(45000, (t) => {
      const b = w.a.ctx.createBufferSource();
      b.buffer = _rauschpuffer(w.a, 'braun'); b.loop = true;
      const bp = w.filter('bandpass', 250, .8), g = w.pegel(0);
      b.connect(bp); bp.connect(g); g.connect(hall); g.connect(out);
      bp.frequency.setValueAtTime(250, t);
      bp.frequency.exponentialRampToValueAtTime(80, t + 3.5);
      const wellen = 2 + Math.floor(Math.random() * 3);
      let zeit = t + .3;
      g.gain.setValueAtTime(.0001, t);
      for (let i = 0; i < wellen; i++) {
        const spitze = .5 * (1 - i / (wellen + 1)) * (0.7 + Math.random() * .5);
        g.gain.exponentialRampToValueAtTime(Math.max(.001, spitze), zeit + .6 + Math.random() * .5);
        zeit += 1.2 + Math.random() * 1.6;
        g.gain.exponentialRampToValueAtTime(.02 + Math.random() * .05, zeit);
      }
      g.gain.exponentialRampToValueAtTime(.0001, zeit + 4 + Math.random() * 6);
      b.start(t); b.stop(zeit + 12);
    });
    return w;
  }},

  { id: 'wind', name: 'Wind ums Haus', kat: 'Wetter', bau(a, out) {
    const w = neueWerkbank(a, out);
    const q = w.rauschen('weiss'), bp = w.filter('bandpass', 800, 1), g = w.pegel(.25);
    q.connect(bp); bp.connect(g); g.connect(out);
    w.wandel(g.gain, .08, .4, 1200, 4000, 1.2);
    w.wandel(bp.frequency, 500, 1400, 1200, 4000, 1.2);
    const pfeifQ = w.rauschen('weiss'), pfeif = w.filter('bandpass', 400, 25), pg = w.pegel(.02);
    pfeifQ.connect(pfeif); pfeif.connect(pg); pg.connect(out);
    w.wandel(pfeif.frequency, 300, 620, 2500, 7000);
    w.wandel(pg.gain, .003, .05, 3000, 9000, 1.8);
    return w;
  }},

  { id: 'schneesturm', name: 'Schneesturm', kat: 'Wetter', bau(a, out) {
    const w = neueWerkbank(a, out);
    const zisch = w.rauschen('weiss'), bp = w.filter('bandpass', 2000, .8), g = w.pegel(.16);
    zisch.connect(bp); bp.connect(g); g.connect(out);
    w.wandel(g.gain, .1, .22, 900, 2500, .8);
    const druck = w.rauschen('braun'), lp = w.filter('lowpass', 150), dg = w.pegel(.3);
    druck.connect(lp); lp.connect(dg); dg.connect(out);
    const heulQ = w.rauschen('weiss'), heul = w.filter('bandpass', 700, 40), hg = w.pegel(0);
    heulQ.connect(heul); heul.connect(hg); hg.connect(out);
    w.takt(16000, (t) => {
      heul.frequency.setValueAtTime(550 + Math.random() * 150, t);
      heul.frequency.exponentialRampToValueAtTime(800 + Math.random() * 200, t + 2 + Math.random() * 2);
      heul.frequency.exponentialRampToValueAtTime(480 + Math.random() * 120, t + 4 + Math.random() * 3);
      hg.gain.setTargetAtTime(.06, t, 1.2);
      hg.gain.setTargetAtTime(.0001, t + 5, 1.5);
    });
    return w;
  }},

  /* --- Wasser --- */
  { id: 'brandung', name: 'Meeresbrandung', kat: 'Wasser', bau(a, out) {
    const w = neueWerkbank(a, out);
    const tiefe = w.rauschen('braun'), tlp = w.filter('lowpass', 500), tg = w.pegel(.2);
    tiefe.connect(tlp); tlp.connect(tg); tg.connect(out);
    const welleBau = (periode) => {
      const q2 = w.rauschen('rosa'), lp = w.filter('lowpass', 400), g = w.pegel(.02);
      q2.connect(lp); lp.connect(g); g.connect(out);
      const rollen = () => {
        const t = w.a.ctx.currentTime;
        const hoehe = .12 + Math.random() * .22;
        const anstieg = periode * .3;
        g.gain.setTargetAtTime(hoehe, t, anstieg / 3);
        lp.frequency.setTargetAtTime(800 + hoehe * 9000, t, anstieg / 3);
        g.gain.setTargetAtTime(.02, t + anstieg, periode * .28);
        lp.frequency.setTargetAtTime(400, t + anstieg, periode * .3);
        _knack(w, out, { freq: 2600, q: .7, dauer: 2.2 + Math.random() * 1.6, staerke: hoehe * .8 });
      };
      w.immer(periode * 1000, rollen);
      rollen();
    };
    welleBau(9); welleBau(13);
    return w;
  }},

  { id: 'bach', name: 'Bach', kat: 'Wasser', bau(a, out) {
    const w = neueWerkbank(a, out);
    for (const [rate, tiefe, staerke] of [[2, 800, .05], [6, 600, .1], [12, 400, .14]]) {
      const q = w.rauschen('rosa'), bp = w.filter('bandpass', 1400, 1.6), g = w.pegel(staerke);
      q.connect(bp); bp.connect(g); g.connect(out);
      w.lfo(rate, tiefe, bp.frequency);
    }
    w.takt(180, () => {
      if (Math.random() < .5) return;
      const f0 = 300 + Math.random() * 900;
      _ping(w, out, { f0, f1: f0 * (1.03 + Math.random() * .07), dauer: .06 + Math.random() * .09, staerke: .05 });
    });
    return w;
  }},

  { id: 'tropfen', name: 'Tropfen nach dem Regen', kat: 'Wasser', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(3, 1600, .9);
    w.takt(3200, () => {
      const f0 = 800 + Math.random() * 800;
      _ping(w, hall, { f0, f1: f0 * 1.06, dauer: .1 + Math.random() * .1, staerke: .12 });
      _ping(w, out, { f0, f1: f0 * 1.06, dauer: .08, staerke: .05 });
    });
    return w;
  }},

  /* --- Feuer --- */
  { id: 'kamin', name: 'Kaminfeuer', kat: 'Feuer', bau(a, out) {
    const w = neueWerkbank(a, out);
    const koerper = w.rauschen('weiss'), kbp = w.filter('bandpass', 30, 5);
    const verstaerker = w.pegel(60);
    const former = a.ctx.createWaveShaper();
    const kurve = new Float32Array(256);
    for (let i = 0; i < 256; i++) kurve[i] = Math.max(-.9, Math.min(.9, (i / 128 - 1) * 2));
    former.curve = kurve;
    const khp = w.filter('highpass', 25), kg = w.pegel(.5);
    koerper.connect(kbp); kbp.connect(verstaerker); verstaerker.connect(former); former.connect(khp); khp.connect(kg); kg.connect(out);
    const zisch = w.rauschen('weiss'), zhp = w.filter('highpass', 1000), zg = w.pegel(.02);
    zisch.connect(zhp); zhp.connect(zg); zg.connect(out);
    w.wandel(zg.gain, .004, .05, 700, 2200, .5);
    w.takt(320, () => {
      _knack(w, out, { freq: 3200 + Math.random() * 2200, q: 2, dauer: .001 + Math.random() * .03, staerke: .08 + Math.random() * .22 });
    });
    w.takt(9000, () => _knack(w, out, { freq: 800, q: 1.5, dauer: .06 + Math.random() * .03, staerke: .3 }));
    return w;
  }},

  { id: 'kerze', name: 'Kerzenflackern', kat: 'Feuer', bau(a, out) {
    const w = neueWerkbank(a, out);
    const q = w.rauschen('rosa'), bp = w.filter('bandpass', 1200, .7), g = w.pegel(.012);
    q.connect(bp); bp.connect(g); g.connect(out);
    w.wandel(g.gain, .003, .02, 120, 260, .06);
    w.takt(16000, () => {
      for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
        w.spaeter(() => _knack(w, out, { freq: 3000, q: 3, dauer: .006, staerke: .015 }), i * (60 + Math.random() * 120));
      }
    });
    return w;
  }},

  /* --- Natur --- */
  { id: 'blaetter', name: 'Blätterrascheln', kat: 'Natur', bau(a, out) {
    const w = neueWerkbank(a, out);
    const q = w.rauschen('weiss'), hp = w.filter('highpass', 200), lp = w.filter('lowpass', 4000), g = w.pegel(.05);
    q.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
    const flacker = w.rauschen('weiss'), flp = w.filter('lowpass', 18), fg = w.pegel(.06);
    flacker.connect(flp); flp.connect(fg); fg.connect(g.gain);
    w.wandel(g.gain, .015, .12, 2500, 7000, 1.8);
    return w;
  }},

  { id: 'grillen', name: 'Grillen', kat: 'Natur', bau(a, out) {
    const w = neueWerkbank(a, out);
    const boden = w.rauschen('braun'), blp = w.filter('lowpass', 300), bg = w.pegel(.03);
    boden.connect(blp); blp.connect(bg); bg.connect(out);
    for (let tier = 0; tier < 4; tier++) {
      const traeger = 4200 + Math.random() * 900;
      const pause = 700 + Math.random() * 900;
      const pan = a.ctx.createStereoPanner ? a.ctx.createStereoPanner() : null;
      const ausgang = pan ? (pan.pan.value = -0.7 + Math.random() * 1.4, pan.connect(out), pan) : out;
      w.takt(pause, (t) => {
        if (Math.random() < .3) return;
        const silben = 2 + Math.floor(Math.random() * 3);
        for (let s = 0; s < silben; s++) {
          const st = t + s * .045;
          const o = a.ctx.createOscillator();
          o.type = 'sine'; o.frequency.value = traeger + Math.random() * 120;
          const g = w.pegel(0);
          g.gain.setValueAtTime(0, st);
          g.gain.linearRampToValueAtTime(.028, st + .006);
          g.gain.setValueAtTime(.028, st + .02);
          g.gain.linearRampToValueAtTime(0, st + .032);
          o.connect(g); g.connect(ausgang);
          o.start(st); o.stop(st + .045);
        }
      });
    }
    return w;
  }},

  { id: 'vogelmorgen', name: 'Vogelmorgen', kat: 'Natur', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(1.6, 3500, .35);
    const stimme = (tief, hoch, fern) => {
      const ziel = fern ? hall : out;
      w.takt(5000 + Math.random() * 6000, (t) => {
        const silben = 3 + Math.floor(Math.random() * 5);
        let zeit = 0;
        for (let s = 0; s < silben; s++) {
          const dauer = .05 + Math.random() * .1;
          const f0 = tief + Math.random() * (hoch - tief);
          const f1 = f0 * (Math.random() < .5 ? 1.15 + Math.random() * .5 : .75);
          w.spaeter(() => _ping(w, ziel, { f0, f1, dauer, staerke: fern ? .05 : .12, typ: 'sine' }), zeit * 1000);
          zeit += dauer + .04 + Math.random() * .1;
        }
      });
    };
    stimme(1800, 2800, false);
    stimme(2600, 4200, false);
    stimme(3400, 5800, true);
    const luft = w.rauschen('rosa'), lp = w.filter('lowpass', 500), g = w.pegel(.02);
    luft.connect(lp); lp.connect(g); g.connect(out);
    return w;
  }},

  { id: 'moewen', name: 'Möwen', kat: 'Natur', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(2, 2600, .5);
    w.takt(11000, (t) => {
      const fern = Math.random() < .5;
      const rufe = 3 + Math.floor(Math.random() * 5);
      const basis = 450 + Math.random() * 120;
      for (let r = 0; r < rufe; r++) {
        const st = t + r * (.28 + Math.random() * .12);
        const o = a.ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(basis, st);
        o.frequency.linearRampToValueAtTime(basis + 180, st + .04);
        o.frequency.linearRampToValueAtTime(basis + 30, st + .22);
        const f1 = w.filter('bandpass', 1100, 5), f2 = w.filter('bandpass', 2600, 8);
        const g = w.pegel(0);
        const staerke = (fern ? .04 : .12) * (1 - r / (rufe + 2));
        g.gain.setValueAtTime(.0001, st);
        g.gain.exponentialRampToValueAtTime(Math.max(.001, staerke), st + .04);
        g.gain.exponentialRampToValueAtTime(.0001, st + .26);
        o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g);
        g.connect(fern ? hall : out);
        o.start(st); o.stop(st + .3);
      }
    });
    return w;
  }},

  { id: 'eule', name: 'Eule', kat: 'Natur', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(2.5, 1200, .7);
    const ruf = (t, basis, staerke, ziel) => {
      const o = a.ctx.createOscillator(); o.type = 'sine';
      const g = w.pegel(0);
      o.frequency.setValueAtTime(basis + 40, t);
      o.frequency.linearRampToValueAtTime(basis, t + .25);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(staerke, t + .08);
      g.gain.exponentialRampToValueAtTime(.0001, t + .25);
      o.frequency.setValueAtTime(basis, t + .7);
      o.frequency.linearRampToValueAtTime(basis * .92, t + 1.5);
      g.gain.setValueAtTime(.0001, t + .7);
      g.gain.exponentialRampToValueAtTime(staerke, t + .95);
      g.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
      const lfo = a.ctx.createOscillator(); lfo.frequency.value = 5;
      const lg = w.pegel(5); lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g); g.connect(ziel);
      o.start(t); o.stop(t + 1.8); lfo.start(t); lfo.stop(t + 1.8);
    };
    w.takt(32000, (t) => {
      const basis = 340 + Math.random() * 50;
      ruf(t, basis, .09, hall);
      if (Math.random() < .4) ruf(t + 2 + Math.random() * 1.5, basis * .89, .04, hall);
    });
    return w;
  }},

  { id: 'zikaden', name: 'Zikaden', kat: 'Natur', bau(a, out) {
    const w = neueWerkbank(a, out);
    const q = w.rauschen('weiss');
    const hp1 = w.filter('highpass', 5000), lp1 = w.filter('lowpass', 8000);
    const bp = w.filter('bandpass', 6000, 7), hp2 = w.filter('highpass', 4000), g = w.pegel(.05);
    q.connect(hp1); hp1.connect(lp1); lp1.connect(bp); bp.connect(hp2); hp2.connect(g); g.connect(out);
    w.lfo(28, .015, g.gain);
    w.wandel(g.gain, .03, .07, 4000, 9000, 1.4);
    return w;
  }},

  /* --- Nah & warm --- */
  { id: 'schnurren', name: 'Katzenschnurren', kat: 'Nah & warm', bau(a, out) {
    const w = neueWerkbank(a, out);
    const lp = w.filter('lowpass', 700), g = w.pegel(.4);
    lp.connect(g); g.connect(out);
    let atmung = 0;
    w.immer(38, () => {
      atmung += .038 / 2.6;
      const aus = (atmung % 1) < .55;
      if (Math.random() < (aus ? .95 : .8)) {
        _knack(w, lp, { freq: aus ? 320 : 220, q: 1, dauer: .014, staerke: (aus ? .22 : .14) * (0.8 + Math.random() * .4) });
      }
    });
    return w;
  }},

  { id: 'herzschlag', name: 'Herzschlag', kat: 'Nah & warm', bau(a, out) {
    const w = neueWerkbank(a, out);
    const lp = w.filter('lowpass', 200), g = w.pegel(.8);
    lp.connect(g); g.connect(out);
    let phase = 0;
    const schlag = () => {
      const t = a.ctx.currentTime;
      const lub = a.ctx.createOscillator();
      lub.frequency.setValueAtTime(60, t);
      lub.frequency.linearRampToValueAtTime(45, t + .13);
      const lg = w.pegel(0);
      lg.gain.setValueAtTime(.0001, t);
      lg.gain.exponentialRampToValueAtTime(.5, t + .02);
      lg.gain.exponentialRampToValueAtTime(.0001, t + .15);
      lub.connect(lg); lg.connect(lp); lub.start(t); lub.stop(t + .2);
      const dub = a.ctx.createOscillator();
      dub.frequency.value = 65;
      const dg = w.pegel(0);
      dg.gain.setValueAtTime(.0001, t + .18);
      dg.gain.exponentialRampToValueAtTime(.35, t + .2);
      dg.gain.exponentialRampToValueAtTime(.0001, t + .29);
      dub.connect(dg); dg.connect(lp); dub.start(t + .18); dub.stop(t + .32);
      phase += .25;
      const periode = 1000 * (0.95 + Math.sin(phase) * .03);
      w.spaeter(schlag, periode);
    };
    schlag();
    return w;
  }},

  { id: 'uhr', name: 'Uhrenticken', kat: 'Nah & warm', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(.12, 2000, .3);
    let tick = true;
    w.immer(1000, () => {
      const satz = tick ? [[6543, .03], [3245, .02], [1356, .01]] : [[7543, .03], [3988, .02], [2765, .01]];
      const staerke = (tick ? .1 : .08) * (0.94 + Math.random() * .12);
      for (const [freq, dauer] of satz) {
        _knack(w, out, { freq, q: 3, dauer, staerke: staerke * .5 });
        _knack(w, hall, { freq, q: 3, dauer, staerke: staerke * .3 });
      }
      tick = !tick;
    });
    return w;
  }},

  { id: 'alteshaus', name: 'Altes Haus', kat: 'Nah & warm', bau(a, out) {
    const w = neueWerkbank(a, out);
    const bett = w.rauschen('braun'), lp = w.filter('lowpass', 120), g = w.pegel(.06);
    bett.connect(lp); lp.connect(g); g.connect(out);
    const resonanz = [62.5, 125, 250, 395, 560, 790].map((f, i) => w.filter('bandpass', f, 1 + Math.floor(i / 2)));
    const holzG = w.pegel(.2); holzG.connect(out);
    resonanz.forEach((r) => r.connect(holzG));
    w.takt(50000, (t) => {
      const dauer = .5 + Math.random() * 1;
      const o = a.ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(20 + Math.random() * 20, t);
      o.frequency.linearRampToValueAtTime(50 + Math.random() * 40, t + dauer * .5);
      o.frequency.linearRampToValueAtTime(25 + Math.random() * 15, t + dauer);
      const og = w.pegel(0);
      og.gain.setValueAtTime(.0001, t);
      og.gain.exponentialRampToValueAtTime(.12, t + dauer * .3);
      og.gain.exponentialRampToValueAtTime(.0001, t + dauer);
      o.connect(og); resonanz.forEach((r) => og.connect(r));
      o.start(t); o.stop(t + dauer + .1);
    });
    w.takt(70000, () => _knack(w, holzG, { freq: 900, q: 5, dauer: .008, staerke: .3 }));
    return w;
  }},

  /* --- Orte --- */
  { id: 'cafe', name: 'Café-Gemurmel', kat: 'Orte', bau(a, out) {
    const w = neueWerkbank(a, out);
    const raum = w.hall(.9, 2200, .5);
    const lp = w.filter('lowpass', 1800), g = w.pegel(.5);
    lp.connect(g); g.connect(out); lp.connect(raum);
    for (let s = 0; s < 4; s++) {
      const o = w.ton('sawtooth', s % 2 ? 115 + Math.random() * 20 : 195 + Math.random() * 40);
      const f1 = w.filter('bandpass', 500, 5), f2 = w.filter('bandpass', 1400, 8);
      const sg = w.pegel(0);
      o.connect(f1); o.connect(f2); f1.connect(sg); f2.connect(sg); sg.connect(lp);
      w.wandel(o.frequency, o.frequency.value * .8, o.frequency.value * 1.25, 300, 900, .15);
      w.wandel(f1.frequency, 320, 800, 120, 300, .05);
      w.wandel(f2.frequency, 900, 2200, 120, 300, .05);
      const sprich = () => {
        const t = a.ctx.currentTime;
        const dauer = 1 + Math.random() * 3;
        const silbe = 4 + Math.random() * 3;
        for (let z = 0; z < dauer * silbe; z++) {
          const st = t + z / silbe;
          sg.gain.setTargetAtTime(.008 + Math.random() * .012, st, .03);
          sg.gain.setTargetAtTime(.001, st + .09, .04);
        }
        sg.gain.setTargetAtTime(.0001, t + dauer, .1);
        w.spaeter(sprich, (dauer + .5 + Math.random() * 3) * 1000);
      };
      w.spaeter(sprich, Math.random() * 2000);
    }
    w.takt(9000, () => {
      const f = 2500 + Math.random() * 2000;
      _ping(w, raum, { f0: f, f1: f, dauer: .08 + Math.random() * .2, staerke: .05 });
      _ping(w, raum, { f0: f * 2.76, f1: f * 2.76, dauer: .06, staerke: .02 });
    });
    return w;
  }},

  { id: 'zug', name: 'Zugfahrt', kat: 'Orte', bau(a, out) {
    const w = neueWerkbank(a, out);
    const rumpel = w.rauschen('braun'), rlp = w.filter('lowpass', 250), rg = w.pegel(.3);
    rumpel.connect(rlp); rlp.connect(rg); rg.connect(out);
    w.wandel(rg.gain, .24, .36, 400, 1200, .4);
    const windQ = w.rauschen('rosa'), wbp = w.filter('bandpass', 2000, .8), wg = w.pegel(.06);
    windQ.connect(wbp); wbp.connect(wg); wg.connect(out);
    const stoss = (t, staerke) => {
      _knack(w, out, { freq: 200 + Math.random() * 150, q: 1, dauer: .07, staerke: staerke });
      _knack(w, out, { freq: 1200, q: 4, dauer: .03, staerke: staerke * .33 });
    };
    const takt = 1900;
    w.immer(takt, () => {
      const t = a.ctx.currentTime;
      const j = () => (Math.random() - .5) * .02;
      stoss(t + j(), .2); w.spaeter(() => stoss(0, .18), 120 + j() * 1000);
      w.spaeter(() => { stoss(0, .16); w.spaeter(() => stoss(0, .14), 120); }, 600);
    });
    return w;
  }},

  { id: 'glocken', name: 'Glocken in der Ferne', kat: 'Orte', bau(a, out) {
    const w = neueWerkbank(a, out);
    const hall = w.hall(4.5, 1800, .85);
    const lp = w.filter('lowpass', 2200); lp.connect(hall); lp.connect(out);
    const traeger = w.pegel(.14); traeger.connect(lp);
    w.wandel(traeger.gain, .05, .16, 4000, 9000, 2);
    const schlag = (f, t, staerke) => {
      const teile = [[.5, 12, 1], [1, 7, .7], [1.2, 5, .5], [1.5, 3, .3], [2, 2.5, .4], [2.66, 1.2, .15], [3, .8, .1]];
      for (const [rel, decay, s] of teile) {
        const o = a.ctx.createOscillator();
        o.frequency.value = f * rel * (1 + (Math.random() - .5) * .012);
        const g = w.pegel(0);
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(.001, staerke * s), t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + decay);
        o.connect(g); g.connect(traeger);
        o.start(t); o.stop(t + decay + .2);
      }
    };
    w.takt(70000, (t) => {
      const grundton = 196 * (Math.random() < .5 ? 1 : 1.19);
      const anzahl = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < anzahl; i++) schlag(grundton, t + i * 2.8, .1);
    });
    return w;
  }}
];

const KLANG_KATEGORIEN = ['Wetter', 'Wasser', 'Feuer', 'Natur', 'Nah & warm', 'Orte'];

/* Vorgemischte Szenen */
const KLANG_SZENEN = [
  { name: 'Sturmnacht am Leuchtturm', pegel: { wind: .65, brandung: .8, regenfenster: .5, gewitter: .45, moewen: .12 } },
  { name: 'Am Lagerfeuer', pegel: { kamin: .8, grillen: .4, wind: .12, eule: .25 } },
  { name: 'Schreibzimmer', pegel: { uhr: .45, kamin: .3, regenfenster: .45, schnurren: .2 } },
  { name: 'Nachtzug', pegel: { zug: .8, regendach: .3 } },
  { name: 'Café am Regentag', pegel: { cafe: .65, regenfenster: .5, glocken: .12 } },
  { name: 'Sommernacht', pegel: { grillen: .7, blaetter: .3, eule: .3, alteshaus: .12 } },
  { name: 'Nach dem Regen', pegel: { tropfen: .6, vogelmorgen: .35, bach: .3 } },
  { name: 'Morgen am Meer', pegel: { brandung: .7, moewen: .4, vogelmorgen: .2, wind: .18 } },
  { name: 'Wintermorgen', pegel: { schneesturm: .4, kamin: .6, uhr: .3 } },
  { name: 'Tiefe Nacht', pegel: { herzschlag: .3, uhr: .4, schnurren: .3, wind: .1 } },
  { name: 'Altes Haus im August', pegel: { zikaden: .5, alteshaus: .3, blaetter: .2 } },
  { name: 'Bibliothek', pegel: { uhr: .5, alteshaus: .25, kerze: .8, regendach: .2 } }
];

/* ----- Steuerung ----- */
function ebeneAn(id, staerke) {
  const def = KLANG_EBENEN.find((x) => x.id === id);
  if (!def) return false;
  staerke = begrenze(staerke, 0, 1, 0);
  if (staerke <= 0) return false;
  const a = holeAudio();
  let e = a.ebenen.get(id);
  if (!e) {
    const g = a.ctx.createGain();
    g.gain.value = 0;
    g.connect(a.master);
    let werk;
    try { werk = def.bau(a, g); }
    catch (fehler) { try { g.disconnect(); } catch (x) {} _audioFehler = fehler && fehler.message || 'Klangquelle fehlgeschlagen'; return false; }
    e = { gain: g, werk };
    a.ebenen.set(id, e);
  }
  e.gain.gain.setTargetAtTime(staerke, a.ctx.currentTime, .4);
  return true;
}
function ebeneAus(id) {
  if (!_audio) return;
  const e = _audio.ebenen.get(id);
  if (!e) return;
  e.gain.gain.setTargetAtTime(.0001, _audio.ctx.currentTime, .3);
  e.stopTimer = setTimeout(() => { e.werk.stop(); try { e.gain.disconnect(); } catch (x) {} }, 1200);
  _audio.ebenen.delete(id);
}
function saubereMischung(pegel) {
  const raus = {};
  if (!pegel || typeof pegel !== 'object' || Array.isArray(pegel)) return raus;
  const erlaubt = new Set(KLANG_EBENEN.map((x) => x.id));
  for (const [id, wert] of Object.entries(pegel)) {
    if (!erlaubt.has(id)) continue;
    const v = begrenze(wert, 0, 1, 0);
    if (v > 0) raus[id] = v;
  }
  return raus;
}
function mischungAnwenden(pegel) {
  D.einst.mischung = saubereMischung(pegel);
  speichereEinst();
  const gewollt = new Set(Object.keys(D.einst.mischung).filter((k) => D.einst.mischung[k] > 0));
  if (_audio) for (const id of [..._audio.ebenen.keys()]) { if (!gewollt.has(id)) ebeneAus(id); }
  if (gewollt.size) {
    try {
      const a = holeAudio(); _weckImpuls(a);
      for (const id of gewollt) ebeneAn(id, D.einst.mischung[id]);
    } catch (e) { _audioFehler = e && e.message || 'Klang konnte nicht starten'; }
  }
}
function alleKlaengeAus() { mischungAnwenden({}); }
function klangAktiv() { return Object.values(D.einst.mischung || {}).some((v) => v > 0); }

/* ----- Einzelklänge ----- */
function glocke() {
  try {
    const a = holeAudio();
    const t = a.ctx.currentTime;
    for (const [freq, staerke] of [[660, .1], [1320, .04], [1980, .015]]) {
      const o = a.ctx.createOscillator();
      o.frequency.value = freq;
      const g = a.ctx.createGain();
      g.gain.setValueAtTime(staerke, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
      o.connect(g); g.connect(a.master);
      o.start(t); o.stop(t + 2);
    }
  } catch (e) {}
}
function tippKlick() {
  try {
    const a = holeAudio();
    const b = a.ctx.createBufferSource();
    b.buffer = _rauschpuffer(a, 'weiss'); b.loop = true;
    const f = a.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2600;
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(.04, a.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, a.ctx.currentTime + .02);
    b.connect(f); f.connect(g); g.connect(a.master);
    b.start(); b.stop(a.ctx.currentTime + .03);
  } catch (e) {}
}

function audioProbe() {
  try {
    const a = holeAudio(); _weckImpuls(a);
    const t = a.ctx.currentTime;
    const o = a.ctx.createOscillator(), g = a.ctx.createGain();
    o.type = 'sine'; o.frequency.value = 523.25;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .45);
    o.connect(g); g.connect(a.master); o.start(t); o.stop(t + .5);
    return true;
  } catch (e) { _audioFehler = e && e.message || 'Klangprobe fehlgeschlagen'; return false; }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && klangAktiv()) _audioMussNeu = true;
});
window.addEventListener('pageshow', (e) => { if (e.persisted && klangAktiv()) _audioMussNeu = true; });
document.addEventListener('pointerdown', async () => {
  if (!klangAktiv()) return;
  if (_audioMussNeu || !_audio || _audio.ctx.state !== 'running') await audioFreigeben({ neu: _audioMussNeu });
  else {
    try { const a = holeAudio(); _weckImpuls(a); } catch (e) { _audioFehler = e && e.message || 'Klang blieb stumm'; }
  }
}, true);
