/* ================================================================
   VANI — Klangwelten: alles aus dem Nichts gerechnet, keine Dateien
   ================================================================ */

let _audio = null;

function holeAudio() {
  if (!_audio) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = D.einst.lautstaerke * .6;
    master.connect(ctx.destination);
    _audio = { ctx, master, knoten: [], intervalle: [], laeuft: 'aus' };
  }
  if (_audio.ctx.state === 'suspended') _audio.ctx.resume();
  return _audio;
}

function rauschPuffer(ctx, sek = 2) {
  const puffer = ctx.createBuffer(1, ctx.sampleRate * sek, ctx.sampleRate);
  const d = puffer.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return puffer;
}
function rauschQuelle(a) {
  const q = a.ctx.createBufferSource();
  q.buffer = rauschPuffer(a.ctx);
  q.loop = true;
  return q;
}

function setzeLautstaerke(wert) {
  D.einst.lautstaerke = wert;
  speichereEinst();
  if (_audio) _audio.master.gain.value = wert * .6;
}

function klangStopp() {
  if (!_audio) return;
  for (const i of _audio.intervalle) clearInterval(i);
  for (const k of _audio.knoten) { try { k.stop ? k.stop() : k.disconnect(); } catch (e) {} }
  _audio.knoten = [];
  _audio.intervalle = [];
  _audio.laeuft = 'aus';
}

function klangSetzen(name) {
  D.einst.klang = name;
  speichereEinst();
  klangStopp();
  if (name === 'aus') return;
  const a = holeAudio();
  a.laeuft = name;
  if (name === 'regen') baueRegen(a);
  else if (name === 'kamin') baueKamin(a);
  else if (name === 'wind') baueWind(a);
  else if (name === 'grillen') baueGrillen(a);
}

function baueRegen(a) {
  const q = rauschQuelle(a);
  const hoch = a.ctx.createBiquadFilter(); hoch.type = 'highpass'; hoch.frequency.value = 400;
  const tief = a.ctx.createBiquadFilter(); tief.type = 'lowpass'; tief.frequency.value = 2400;
  const g = a.ctx.createGain(); g.gain.value = .32;
  q.connect(hoch); hoch.connect(tief); tief.connect(g); g.connect(a.master);
  q.start();
  a.knoten.push(q, g);
  /* einzelne Tropfen */
  a.intervalle.push(setInterval(() => {
    if (Math.random() < .6) return;
    const o = a.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = 900 + Math.random() * 2200;
    const og = a.ctx.createGain();
    og.gain.setValueAtTime(.05 + Math.random() * .05, a.ctx.currentTime);
    og.gain.exponentialRampToValueAtTime(.0001, a.ctx.currentTime + .06);
    o.connect(og); og.connect(a.master);
    o.start(); o.stop(a.ctx.currentTime + .08);
  }, 180));
}

function baueKamin(a) {
  const q = rauschQuelle(a);
  const tief = a.ctx.createBiquadFilter(); tief.type = 'lowpass'; tief.frequency.value = 320;
  const g = a.ctx.createGain(); g.gain.value = .5;
  q.connect(tief); tief.connect(g); g.connect(a.master);
  q.start();
  /* Atmen des Feuers */
  const lfo = a.ctx.createOscillator(); lfo.frequency.value = .18;
  const lfoG = a.ctx.createGain(); lfoG.gain.value = .12;
  lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start();
  a.knoten.push(q, g, lfo);
  /* Knistern */
  a.intervalle.push(setInterval(() => {
    if (Math.random() < .45) return;
    const k = a.ctx.createBufferSource();
    k.buffer = rauschPuffer(a.ctx, .06);
    const band = a.ctx.createBiquadFilter(); band.type = 'bandpass';
    band.frequency.value = 1800 + Math.random() * 2600; band.Q.value = 2;
    const kg = a.ctx.createGain();
    kg.gain.setValueAtTime(.09 + Math.random() * .12, a.ctx.currentTime);
    kg.gain.exponentialRampToValueAtTime(.0001, a.ctx.currentTime + .05 + Math.random() * .05);
    k.connect(band); band.connect(kg); kg.connect(a.master);
    k.start();
  }, 140));
}

function baueWind(a) {
  const q = rauschQuelle(a);
  const band = a.ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = 400; band.Q.value = .9;
  const g = a.ctx.createGain(); g.gain.value = .34;
  q.connect(band); band.connect(g); g.connect(a.master);
  q.start();
  const lfo = a.ctx.createOscillator(); lfo.frequency.value = .06;
  const lfoG = a.ctx.createGain(); lfoG.gain.value = 260;
  lfo.connect(lfoG); lfoG.connect(band.frequency); lfo.start();
  const lfo2 = a.ctx.createOscillator(); lfo2.frequency.value = .11;
  const lfo2G = a.ctx.createGain(); lfo2G.gain.value = .1;
  lfo2.connect(lfo2G); lfo2G.connect(g.gain); lfo2.start();
  a.knoten.push(q, g, lfo, lfo2);
}

function baueGrillen(a) {
  /* leiser Nachtboden */
  const q = rauschQuelle(a);
  const tief = a.ctx.createBiquadFilter(); tief.type = 'lowpass'; tief.frequency.value = 260;
  const g = a.ctx.createGain(); g.gain.value = .07;
  q.connect(tief); tief.connect(g); g.connect(a.master);
  q.start();
  a.knoten.push(q, g);
  /* zwei Grillen, leicht versetzt */
  const grille = (grundton, takt) => {
    a.intervalle.push(setInterval(() => {
      if (Math.random() < .35) return;
      const zirpen = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < zirpen; i++) {
        const t = a.ctx.currentTime + i * .045;
        const o = a.ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = grundton + Math.random() * 150;
        const og = a.ctx.createGain();
        og.gain.setValueAtTime(0, t);
        og.gain.linearRampToValueAtTime(.035, t + .008);
        og.gain.exponentialRampToValueAtTime(.0001, t + .038);
        o.connect(og); og.connect(a.master);
        o.start(t); o.stop(t + .045);
      }
    }, takt));
  };
  grille(4100, 900);
  grille(3600, 1300);
}

/* Einzelklänge */
function glocke() {
  try {
    const a = holeAudio();
    const t = a.ctx.currentTime;
    for (const [freq, staerke] of [[660, .12], [1320, .05], [1980, .02]]) {
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
    const k = a.ctx.createBufferSource();
    k.buffer = rauschPuffer(a.ctx, .015);
    const hoch = a.ctx.createBiquadFilter(); hoch.type = 'highpass'; hoch.frequency.value = 2600;
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(.05, a.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, a.ctx.currentTime + .02);
    k.connect(hoch); hoch.connect(g); g.connect(a.master);
    k.start();
  } catch (e) {}
}
