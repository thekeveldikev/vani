/* ================================================================
   VANI — Die Malerei hinter dem Schreibtisch.

   Ein einziges Canvas trägt die Szene: oben das Fenster mit Himmel, Gestirnen
   und dem verwilderten Garten, unten die Platte aus altem Holz — Maserung,
   Astlöcher, Kratzer, Tintenspritzer, Wachs, ein Kaffeering, die Stelle, an
   der jahrelang die Hand gelegen hat. Alles Unbewegte wird einmal gemalt und
   dann nur noch geblittet; bewegt sind Sterne, Mond, Garten (Parallaxe im
   Wind), Regen als Tropfen statt Kachel (kein sichtbares Wiederholen), Nebel,
   Wetterleuchten, und je nach Jahreszeit Glühwürmchen, fallende Blätter oder
   Schnee. Das Fenster weiß, wie spät es ist: Dämmerung, Nacht, erstes Grau,
   ein grauer Tag. Kein Deckenlicht — nur der Kegel der Lampe und der Schein
   der Flammen, beide als weiche Verläufe ohne Kante (kerzeSchein).

   Zufall mit Saat, damit der Tisch an einem Tag derselbe bleibt und nicht
   bei jedem Zeichnen neu gewürfelt wird.
   ================================================================ */

/* Jahreszeit aus dem Monat. Pur. */
function schreibtischJahreszeit(wann = Date.now()) {
  const m = new Date(wann).getMonth();
  return m <= 1 || m === 11 ? 'winter' : m <= 4 ? 'fruehling' : m <= 7 ? 'sommer' : 'herbst';
}
/* Sonnenauf- und -untergang übers Jahr (Mitteleuropa, grob): im Juni 5:10 bis
   21:30, im Dezember 8:05 bis 16:25 — dazwischen ein Kosinus. Pur. */
function schreibtischSonnenzeiten(wann = Date.now()) {
  const d = new Date(wann);
  const start = new Date(d.getFullYear(), 0, 1);
  const tagImJahr = Math.floor((d - start) / 86400000);
  const phase = Math.cos((tagImJahr - 172) / 365.25 * 2 * Math.PI);   /* 1 = 21. Juni, -1 = 21. Dez */
  return { aufgang: 6.62 - 1.45 * phase, untergang: 18.95 + 2.55 * phase };
}
const TAGESZEIT_WAHLEN = ['echt', 'morgen', 'mittag', 'golden', 'abend', 'nacht', 'zufall'];
const JAHRESZEIT_WAHLEN = ['echt', 'fruehling', 'sommer', 'herbst', 'winter', 'zufall'];
/* Die Tageszeit als Ganzes: Stunde, Sonnenhöhe 0..1, Lauf der Sonne 0..1 (Ost → West),
   Helligkeit 0..1, Wärme des Lichts 0..1 (tief stehende Sonne) und ein Name für die
   Phase. `wahl` kann eine feste Tageszeit sein. Pur. */
function schreibtischTageszeitInfo(wann = Date.now(), wahl = 'echt') {
  const d = new Date(wann);
  let h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const { aufgang, untergang } = schreibtischSonnenzeiten(wann);
  const fest = { morgen: aufgang + .7, mittag: (aufgang + untergang) / 2, golden: untergang - .8, abend: untergang + .45, nacht: 1.5 }[wahl];
  if (fest != null) h = fest;
  const u = (h - aufgang) / (untergang - aufgang);
  const sonne = u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
  const vorher = aufgang - h, nachher = h - untergang;
  let licht;
  if (sonne > 0) licht = .55 + .45 * Math.min(1, sonne * 1.6);
  else if (vorher > 0 && vorher < 1.2) licht = .5 * (1 - vorher / 1.2);
  else if (nachher > 0 && nachher < 1.3) licht = .5 * (1 - nachher / 1.3);
  else licht = 0;
  const phase = sonne <= 0 ? (licht > 0 ? (h < 12 ? 'morgenrot' : 'abendrot') : 'nacht')
    : u < .1 ? 'sonnenaufgang' : u > .9 ? 'sonnenuntergang' : u < .3 ? 'morgen' : u > .74 ? 'golden' : 'tag';
  const waerme = sonne > 0 ? Math.pow(1 - sonne, 2) : (licht > 0 ? 1 : 0);
  return { stunde: h, sonne, u, licht, phase, waerme, aufgang, untergang };
}
/* Helligkeit 0..1 — der alte Name, damit alles weiterläuft. Pur. */
function schreibtischTageslicht(wann = Date.now(), wahl = 'echt') { return schreibtischTageszeitInfo(wann, wahl).licht; }
/* Drei Himmelsfarben (oben, Mitte, Horizont) aus Licht, Wärme und Jahreszeit.
   Nimmt eine Zahl (Helligkeit) oder die ganze Tageszeit-Info. Pur. */
function schreibtischHimmelFarben(info, jahreszeit = 'sommer', wetter = 'still') {
  const i = typeof info === 'number' ? { licht: info, sonne: info >= .55 ? (info - .55) / .45 : 0, waerme: info >= .55 ? .2 : 1 } : (info || { licht: 0, sonne: 0, waerme: 0 });
  const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * Math.max(0, Math.min(1, t)));
  const nacht = [[6, 8, 24], [14, 18, 40], [30, 34, 58]];
  const daemmer = [[42, 36, 84], [128, 74, 96], [238, 142, 92]];
  const rand = [[96, 128, 178], [224, 156, 122], [255, 196, 120]];
  const tag = [[86, 138, 206], [150, 190, 230], [208, 224, 236]];
  let farben;
  if (i.sonne <= 0) farben = [0, 1, 2].map((k) => mix(nacht[k], daemmer[k], i.licht / .5));
  else farben = [0, 1, 2].map((k) => mix(rand[k], tag[k], Math.min(1, i.sonne * 1.8)));
  /* Im Winter ist der Himmel blasser, im Herbst etwas grauer; bei Regen und Gewitter hängen Wolken davor */
  const grau = jahreszeit === 'winter' ? .42 : jahreszeit === 'herbst' ? .18 : 0;
  const regen = wetter === 'gewitter' ? .75 : wetter === 'regen' ? .55 : 0;
  farben = farben.map((f) => { const m = (f[0] * .3 + f[1] * .5 + f[2] * .2); let g = mix(f, [m, m, m], grau * .7); if (regen) g = mix(g, [m * .62 + 12, m * .64 + 14, m * .68 + 18], regen); return g; });
  return farben.map((f) => 'rgb(' + f.map((v) => Math.round(v)).join(',') + ')');
}

function schreibtischMaler(canvas, optionen = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const saatText = tagKey();
  let saat = 17; for (const c of saatText) saat = (saat * 31 + c.charCodeAt(0)) >>> 0;
  const zuf = kerzeZufall(saat);
  const opt = Object.assign({ holz: 'nuss', lampe: .8, lampeAn: true, wetter: 'still', kerzen: true, unordnung: .7, fensterAnteil: .44, parallax: { x: 0, y: 0 }, alter: { worte: 0, ringe: 1, abnutzung: 0 }, kleckse: [], tageszeitWahl: 'echt', jahreszeitWahl: 'echt' }, optionen);
  let W = 0, H = 0, fensterH = 0, statisch = null, laeuft = false, t = 0, letzte = 0, blitz = 0, blitzWarte = 6 + zuf() * 10;
  let lampeJetzt = opt.lampeAn ? opt.lampe : 0;       /* das Licht schmilzt ein, es springt nicht */
  let letzteTageszeit = '';
  let sonneJetzt = { info: null, sx: 0, sy: 0 };
  let para = { x: 0, y: 0 };                          /* geglättete Parallaxe */
  const staub = Array.from({ length: 46 }, () => ({ x: zuf(), y: zuf(), r: .5 + zuf() * 1.1, ph: zuf() * 6.3, v: .004 + zuf() * .008 }));
  let motte = null, motteWarte = 50 + zuf() * 120;
  /* Jahreszeit: wie draußen — oder gewählt. 'zufall' löst 54 beim Betreten auf. */
  let jahreszeit = JAHRESZEIT_WAHLEN.includes(opt.jahreszeitWahl) && opt.jahreszeitWahl !== 'echt' && opt.jahreszeitWahl !== 'zufall' ? opt.jahreszeitWahl : schreibtischJahreszeit();
  const mond = mondphase();
  /* Wolken, Vögel, Schmetterlinge */
  const wolken = Array.from({ length: 6 }, (_, i) => ({ x: zuf() * 1.4 - .2, y: .06 + zuf() * .34, w: .16 + zuf() * .22, h: .05 + zuf() * .05, v: .004 + zuf() * .006, dicht: .5 + zuf() * .5, ph: zuf() * 6, teile: Array.from({ length: 4 }, () => ({ dx: zuf() - .5, dy: (zuf() - .5) * .6, r: .5 + zuf() * .6 })) }));
  let schwarm = null, schwarmWarte = 6 + zuf() * 20;
  const falter = Array.from({ length: 3 }, () => ({ x: .15 + zuf() * .7, y: .55 + zuf() * .3, ph: zuf() * 6, v: .5 + zuf() * .6, f: ['#f2c14e', '#e8e6e0', '#d9823b'][Math.floor(zuf() * 3)] }));
  const gaense = { aktiv: false, x: 0, y: 0, t: 0 };
  let gaenseWarte = 30 + zuf() * 60;

  /* Einmal gewürfelte Dinge */
  const sterne = Array.from({ length: 90 }, () => ({ x: zuf(), y: zuf() * .72, r: .35 + zuf() * 1.3, ph: zuf() * 6.3, tw: .3 + zuf() * 1.2, warm: zuf() < .3 }));
  const baeume = [
    { x: -.1, w: .34, h: .82, tief: 0, ph: zuf() * 6 }, { x: .8, w: .32, h: .74, tief: 0, ph: zuf() * 6 },
    { x: .24, w: .2, h: .52, tief: 1, ph: zuf() * 6 }, { x: .55, w: .18, h: .42, tief: 1, ph: zuf() * 6 }
  ];
  const buesche = Array.from({ length: 7 }, (_, i) => ({ x: i / 7 + zuf() * .08 - .02, w: .14 + zuf() * .12, h: .22 + zuf() * .2, ph: zuf() * 6 }));
  const graeser = Array.from({ length: 140 }, () => ({ x: zuf(), h: .05 + zuf() * .09, ph: zuf() * 6, n: .6 + zuf() * .8 }));
  const tropfen = Array.from({ length: 180 }, () => ({ x: zuf(), y: zuf(), l: .02 + zuf() * .03, v: .35 + zuf() * .5, a: .18 + zuf() * .3 }));
  const glasTropfen = Array.from({ length: 18 }, () => ({ x: zuf(), y: zuf(), v: .01 + zuf() * .03, r: 2.5 + zuf() * 3.5 }));
  const flocken = Array.from({ length: 120 }, () => ({ x: zuf(), y: zuf(), r: .8 + zuf() * 2.2, v: .02 + zuf() * .05, ph: zuf() * 6 }));
  const blaetter = Array.from({ length: 22 }, () => ({ x: zuf(), y: zuf(), v: .05 + zuf() * .08, ph: zuf() * 6, rot: zuf() * 6, f: ['#a8562a', '#c8873a', '#8a4a22', '#d9a54a'][Math.floor(zuf() * 4)] }));
  const wuermchen = Array.from({ length: 16 }, () => ({ x: .1 + zuf() * .8, y: .35 + zuf() * .5, ph: zuf() * 6, v: .3 + zuf() * .7 }));
  const nebel = Array.from({ length: 5 }, (_, i) => ({ y: .55 + i * .09, v: .004 + zuf() * .006, ph: zuf() * 6 }));

  /* Holz, Kratzer, Tinte — einmal gewürfelt, einmal gemalt */
  const maser = Array.from({ length: 70 }, () => ({ y: zuf(), amp: 2 + zuf() * 6, f: 1 + zuf() * 3, ph: zuf() * 6, a: .05 + zuf() * .1, dick: .6 + zuf() * 1.6 }));
  const aeste = Array.from({ length: 3 }, () => ({ x: .15 + zuf() * .7, y: .3 + zuf() * .6, rx: 10 + zuf() * 16, ry: 6 + zuf() * 8 }));
  const kratzer = Array.from({ length: 26 }, () => ({ x: zuf(), y: zuf(), l: .03 + zuf() * .12, w: zuf() * 6.3, a: .05 + zuf() * .12 }));
  const tinten = Array.from({ length: 7 }, () => ({ x: .1 + zuf() * .8, y: .15 + zuf() * .75, r: 3 + zuf() * 11, satelliten: Math.floor(zuf() * 7), ph: zuf() * 6 }));
  const wachs = Array.from({ length: 9 }, () => ({ x: .72 + zuf() * .2, y: .12 + zuf() * .3, r: 2 + zuf() * 5 }));

  function messen() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === W && h === H) return false;
    W = w; H = h; fensterH = Math.round(H * opt.fensterAnteil);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    statisch = null;
    return true;
  }

  /* ----- Das Unbewegte: Wand, Rahmen, Platte ----- */
  function maleStatisch() {
    const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* Wand: dunkel, etwas Putz */
    const wand = g.createLinearGradient(0, 0, 0, H);
    wand.addColorStop(0, '#1a1411'); wand.addColorStop(1, '#0d0a08');
    g.fillStyle = wand; g.fillRect(0, 0, W, H);
    /* Platte */
    const oben = fensterH + 10;
    const toene = { nuss: ['#4e3524', '#32221a', '#1f1510'], ebenholz: ['#2a2421', '#171312', '#0c0a09'], kirsche: ['#73402d', '#4d281c', '#2e1810'], eiche: ['#7f5e3d', '#5b4129', '#3b2a1a'] }[opt.holz] || ['#4e3524', '#32221a', '#1f1510'];
    const holz = g.createLinearGradient(0, oben, 0, H);
    holz.addColorStop(0, toene[0]); holz.addColorStop(.45, toene[1]); holz.addColorStop(1, toene[2]);
    g.fillStyle = holz; g.fillRect(0, oben, W, H - oben);
    /* Vorderkante der Platte */
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, oben, W, 6);
    g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, oben + 6, W, 1);
    /* Maserung: lange Wellen, leicht gedreht */
    g.save(); g.beginPath(); g.rect(0, oben, W, H - oben); g.clip();
    g.lineCap = 'round';
    for (const m of maser) {
      const y0 = oben + m.y * (H - oben);
      g.beginPath(); g.strokeStyle = 'rgba(0,0,0,' + m.a.toFixed(3) + ')'; g.lineWidth = m.dick;
      for (let x = -10; x <= W + 10; x += 8) { const y = y0 + Math.sin(x / W * m.f * 6.28 + m.ph) * m.amp + Math.sin(x / 37 + m.ph) * 1.2; if (x < 0) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
      g.beginPath(); g.strokeStyle = 'rgba(255,235,200,' + (m.a * .35).toFixed(3) + ')'; g.lineWidth = Math.max(.5, m.dick * .5);
      for (let x = -10; x <= W + 10; x += 8) { const y = y0 + 2 + Math.sin(x / W * m.f * 6.28 + m.ph) * m.amp + Math.sin(x / 37 + m.ph) * 1.2; if (x < 0) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
    }
    /* Astlöcher */
    for (const a of aeste) {
      const ax = a.x * W, ay = oben + a.y * (H - oben);
      for (let k = 5; k >= 1; k--) { g.beginPath(); g.ellipse(ax, ay, a.rx * k / 5, a.ry * k / 5, .2, 0, 6.29); g.strokeStyle = 'rgba(0,0,0,' + (.12 + k * .03).toFixed(2) + ')'; g.lineWidth = 1.2; g.stroke(); }
      g.beginPath(); g.ellipse(ax, ay, a.rx * .25, a.ry * .25, .2, 0, 6.29); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
    }
    /* Die Stelle, an der jahrelang die Hand lag: heller, glatter */
    kerzeSchein(g, W * .52, oben + (H - oben) * .78, W * .16, (H - oben) * .2, [[0, 'rgba(255,225,170,.14)'], [1, 'rgba(255,225,170,0)']]);
    /* Kratzer: je mehr je geschrieben wurde, desto mehr Spuren trägt die Platte */
    const abnutzung = (opt.alter && opt.alter.abnutzung) || 0;
    for (const k of kratzer.slice(0, 8 + Math.round(18 * abnutzung))) {
      g.beginPath(); g.strokeStyle = 'rgba(255,240,210,' + k.a.toFixed(3) + ')'; g.lineWidth = .8;
      const x0 = k.x * W, y0 = oben + k.y * (H - oben);
      g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(k.w) * k.l * W, y0 + Math.sin(k.w) * k.l * W * .4); g.stroke();
    }
    /* Tintenspritzer: Klecks mit Satelliten und ausgefransten Rändern */
    for (const tn of tinten) {
      const tx = tn.x * W, ty = oben + tn.y * (H - oben);
      g.fillStyle = 'rgba(10,8,26,.62)';
      g.beginPath();
      for (let i = 0; i <= 24; i++) { const w = i / 24 * 6.283; const r = tn.r * (1 + .28 * Math.sin(w * 3 + tn.ph) + .18 * Math.sin(w * 7 + tn.ph * 2)); g.lineTo(tx + Math.cos(w) * r, ty + Math.sin(w) * r * .7); }
      g.closePath(); g.fill();
      for (let s = 0; s < tn.satelliten; s++) { const w = tn.ph + s * 1.9; const d = tn.r * (1.6 + s * .6); g.beginPath(); g.ellipse(tx + Math.cos(w) * d, ty + Math.sin(w) * d * .7, 1 + (s % 3), .8 + (s % 2), w, 0, 6.29); g.fill(); }
    }
    /* Wachs am Leuchter */
    g.fillStyle = 'rgba(245,232,200,.85)';
    for (const w of wachs) { g.beginPath(); g.ellipse(w.x * W, oben + w.y * (H - oben), w.r, w.r * .7, 0, 0, 6.29); g.fill(); }
    /* Kaffeeringe unter der Tasse: einer, und alle 100 000 Wörter ein weiterer */
    const ringe = Math.max(1, Math.min(6, (opt.alter && opt.alter.ringe) || 1));
    for (let r = 0; r < ringe; r++) {
      const rx = W * .83 + Math.cos(r * 2.1) * 9 * r, ry = oben + (H - oben) * .52 + Math.sin(r * 2.1) * 5 * r, a = r === 0 ? 1 : .55;
      g.beginPath(); g.ellipse(rx, ry, 30, 14, 0, 0, 6.29); g.strokeStyle = 'rgba(70,40,15,' + (.45 * a).toFixed(2) + ')'; g.lineWidth = 3; g.stroke();
      g.beginPath(); g.ellipse(rx, ry, 30, 14, 0, .4 + r, 2.2 + r); g.strokeStyle = 'rgba(70,40,15,' + (.3 * a).toFixed(2) + ')'; g.lineWidth = 6; g.stroke();
    }
    /* Kleckse von der Feder: jeder aus seiner eigenen Saat gefranst */
    for (const kl of (opt.kleckse || [])) {
      const z = kerzeZufall(kl.s || 1), kx = kl.x * W, ky = oben + kl.y * (H - oben), ph = z() * 6.28;
      g.fillStyle = 'rgba(14,10,30,.66)'; g.beginPath();
      for (let i = 0; i <= 26; i++) { const w = i / 26 * 6.283; const rr = kl.r * (1 + .3 * Math.sin(w * 3 + ph) + .16 * Math.sin(w * 7 + ph * 2)); g.lineTo(kx + Math.cos(w) * rr, ky + Math.sin(w) * rr * .7); }
      g.closePath(); g.fill();
      const sat = 1 + Math.floor(z() * 3);
      for (let s = 0; s < sat; s++) { const w = ph + s * 1.7 + z(); const d = kl.r * (1.5 + s * .7 + z()); g.beginPath(); g.ellipse(kx + Math.cos(w) * d, ky + Math.sin(w) * d * .7, .8 + z() * 1.6, .6 + z(), w, 0, 6.29); g.fill(); }
    }
    g.restore();
    /* Fensterrahmen: schweres Holz mit Sprossen */
    g.fillStyle = '#1a1210'; g.fillRect(0, 0, W, 16); g.fillRect(0, 0, 16, fensterH); g.fillRect(W - 16, 0, 16, fensterH); g.fillRect(0, fensterH - 12, W, 22);
    g.fillStyle = '#3d2b20'; g.fillRect(16, 16, W - 32, 2); g.fillRect(16, 16, 2, fensterH - 28); g.fillRect(W - 18, 16, 2, fensterH - 28);
    g.fillStyle = '#241912'; g.fillRect(W / 2 - 6, 16, 12, fensterH - 28); g.fillRect(16, fensterH * .42 - 5, W - 32, 10);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(W / 2 + 4, 16, 1, fensterH - 28); g.fillRect(16, fensterH * .42 + 5, W - 32, 1);
    /* Im Herbst ein Spinnennetz in der Fensterecke */
    if (jahreszeit === 'herbst') {
      g.save(); g.translate(18, 18); g.strokeStyle = 'rgba(235,235,245,.22)'; g.lineWidth = .8; g.lineCap = 'round';
      for (let k = 0; k <= 6; k++) { const w = k / 6 * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(w) * 54, Math.sin(w) * 54); g.stroke(); }
      for (let r = 9; r <= 50; r += 8) { g.beginPath(); for (let k = 0; k <= 6; k++) { const w = k / 6 * Math.PI / 2, rr = r * (1 - .06 * (k % 2)); const px = Math.cos(w) * rr, py = Math.sin(w) * rr; if (k === 0) g.moveTo(px, py); else { const wm = (k - .5) / 6 * Math.PI / 2; g.quadraticCurveTo(Math.cos(wm) * rr * .93, Math.sin(wm) * rr * .93, px, py); } } g.stroke(); }
      g.fillStyle = 'rgba(40,32,30,.8)'; g.beginPath(); g.ellipse(Math.cos(.5) * 31, Math.sin(.5) * 31, 2.2, 1.6, .5, 0, 6.29); g.fill();
      g.restore();
    }
    /* Fensterbank */
    const bank = g.createLinearGradient(0, fensterH + 8, 0, fensterH + 22);
    bank.addColorStop(0, '#3a2a20'); bank.addColorStop(1, '#1a120d');
    g.fillStyle = bank; g.fillRect(0, fensterH + 8, W, 14);
    return c;
  }

  /* ----- Das Bewegte: Himmel, Sonne, Wolken, Garten, Vögel, Wetter ----- */
  function maleFenster(dt) {
    para.x += (opt.parallax.x - para.x) * Math.min(1, dt * 4); para.y += (opt.parallax.y - para.y) * Math.min(1, dt * 4);
    const info = schreibtischTageszeitInfo(Date.now(), opt.tageszeitWahl);
    const licht = info.licht, sonne = info.sonne;
    const nacht = 1 - Math.min(1, licht / .45);
    const wind = opt.wetter === 'wind' || opt.wetter === 'gewitter' ? 2.4 : opt.wetter === 'regen' ? 1.4 : 1;
    const fx = 16, fy = 16, fw = W - 32, fh = fensterH - 28, boden = fensterH - 12;
    const [h1, h2, h3] = schreibtischHimmelFarben(info, jahreszeit, opt.wetter);
    const sky = ctx.createLinearGradient(0, 0, 0, fensterH);
    sky.addColorStop(0, h1); sky.addColorStop(.6, h2); sky.addColorStop(1, h3);
    ctx.fillStyle = sky; ctx.fillRect(fx, fy, fw, fh);
    ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
    /* Sterne */
    if (nacht > 0) for (const st of sterne) {
      const a = nacht * (.3 + .5 * Math.abs(Math.sin(t * st.tw + st.ph)));
      ctx.fillStyle = st.warm ? 'rgba(255,235,200,' + a.toFixed(2) + ')' : 'rgba(230,240,255,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(fx + st.x * fw, fy + st.y * fh, st.r, 0, 6.29); ctx.fill();
    }
    /* Mond */
    if (licht < .45) {
      const mx = W * .72, my = fensterH * .2, mr = Math.min(24, W * .035);
      ctx.save(); ctx.globalAlpha = Math.max(.25, nacht);
      kerzeSchein(ctx, mx, my, mr * 5, mr * 5, [[0, 'rgba(255,246,220,.2)'], [1, 'rgba(255,246,220,0)']]);
      ctx.fillStyle = '#f3ecd8'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.29); ctx.fill();
      const hell = 1 - Math.abs(mond - .5) * 2;
      ctx.fillStyle = h1; ctx.beginPath();
      if (mond < .5) { ctx.arc(mx, my, mr, Math.PI / 2, -Math.PI / 2, false); ctx.ellipse(mx, my, mr * Math.abs(1 - 2 * hell), mr, 0, -Math.PI / 2, Math.PI / 2, hell > .5); }
      else { ctx.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2, false); ctx.ellipse(mx, my, mr * Math.abs(1 - 2 * hell), mr, 0, Math.PI / 2, -Math.PI / 2, hell > .5); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,110,90,.18)'; ctx.beginPath(); ctx.ellipse(mx - mr * .25, my - mr * .1, mr * .35, mr * .25, .4, 0, 6.29); ctx.fill(); ctx.beginPath(); ctx.ellipse(mx + mr * .3, my + mr * .3, mr * .2, mr * .18, 0, 0, 6.29); ctx.fill();
      ctx.restore();
    }
    /* Die Sonne: wandert von links nach rechts, steht mittags hoch, glüht am Horizont */
    let sx = 0, sy = 0;
    if (sonne > 0 && opt.wetter !== 'gewitter') {
      sx = fx + (.1 + .8 * info.u) * fw + para.x * -10;
      sy = boden - (.06 + .86 * sonne) * fh;
      const r = Math.min(26, W * .032) * (1 + .6 * info.waerme);
      const verdeckt = opt.wetter === 'regen' ? .35 : 1;
      const kern = info.waerme > .5 ? 'rgba(255,214,140,' : 'rgba(255,250,232,';
      kerzeSchein(ctx, sx, sy, r * 9, r * 9, [[0, 'rgba(255,236,190,' + (.42 * verdeckt).toFixed(3) + ')'], [.35, 'rgba(255,210,140,' + (.18 * verdeckt).toFixed(3) + ')'], [1, 'rgba(255,200,120,0)']]);
      if (info.waerme > .3) kerzeSchein(ctx, sx, sy + r, r * 16, r * 5, [[0, 'rgba(255,170,90,' + (.28 * info.waerme * verdeckt).toFixed(3) + ')'], [1, 'rgba(255,170,90,0)']]);
      ctx.fillStyle = kern + (.92 * verdeckt).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.29); ctx.fill();
      /* zarte Strahlen, die langsam drehen */
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * .02); ctx.strokeStyle = 'rgba(255,240,200,' + (.07 * verdeckt).toFixed(3) + ')'; ctx.lineWidth = r * .5;
      for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, r * 1.4); ctx.lineTo(0, r * 4.2); ctx.stroke(); }
      ctx.restore();
    }
    /* Wolken: weich, treibend; am Tag weiß mit Schatten, am Abend rosig, nachts nur ein Hauch */
    for (const w of wolken) {
      w.x += w.v * dt * wind * .6; if (w.x > 1.25) { w.x = -.3; w.y = .06 + zuf() * .34; }
      const cx = fx + w.x * fw + para.x * -4, cy = fy + w.y * fh, cw = w.w * fw, ch = w.h * fh;
      const hell = Math.max(.12, licht), rosa = info.waerme * Math.min(1, licht * 2);
      const oben = 'rgba(' + Math.round(255 - 20 * rosa) + ',' + Math.round(250 - 60 * rosa) + ',' + Math.round(250 - 90 * rosa) + ',';
      const unten = 'rgba(' + Math.round(170 + 60 * rosa) + ',' + Math.round(180 + 10 * rosa) + ',' + Math.round(205 - 60 * rosa) + ',';
      const a = (opt.wetter === 'regen' || opt.wetter === 'gewitter' ? .9 : .5 + .35 * w.dicht) * (nacht > .6 ? .25 : 1);
      for (const tl of w.teile) {
        const px = cx + tl.dx * cw, py = cy + tl.dy * ch, pr = tl.r * ch;
        kerzeSchein(ctx, px, py + pr * .3, pr * 2.6, pr * 1.4, [[0, unten + (a * hell * .9).toFixed(3) + ')'], [1, unten + '0)']]);
        kerzeSchein(ctx, px, py - pr * .2, pr * 2.4, pr * 1.5, [[0, oben + (a * hell).toFixed(3) + ')'], [.6, oben + (a * hell * .5).toFixed(3) + ')'], [1, oben + '0)']]);
      }
    }
    /* Wetterleuchten */
    if (opt.wetter === 'gewitter') {
      blitzWarte -= dt;
      if (blitzWarte <= 0) { blitz = 1; blitzWarte = 5 + zuf() * 11; }
      if (blitz > 0) { ctx.fillStyle = 'rgba(225,232,255,' + (blitz * .55).toFixed(2) + ')'; ctx.fillRect(fx, fy, fw, fh); blitz = Math.max(0, blitz - dt * 6 * (blitz > .6 ? 1 : 2.5)); }
    }
    /* Vögel: am Tag zieht ab und zu ein Schwarm durchs Fenster; im Herbst Gänse im Keil */
    if (sonne > .05 && opt.wetter !== 'regen' && opt.wetter !== 'gewitter') {
      if (!schwarm) { schwarmWarte -= dt; if (schwarmWarte <= 0) { const richtung = zuf() < .5 ? 1 : -1; schwarm = { x: richtung > 0 ? -.15 : 1.15, y: .12 + zuf() * .4, richtung, v: jahreszeit === 'sommer' ? .16 + zuf() * .1 : .08 + zuf() * .05, n: 4 + Math.floor(zuf() * 7), t: 0, gross: jahreszeit === 'herbst' && zuf() < .5 }; } }
      if (schwarm) {
        schwarm.t += dt; schwarm.x += schwarm.richtung * schwarm.v * dt;
        const dunkel = 'rgba(' + (nacht > .3 ? '20,20,30' : '40,38,46') + ',' + (.5 + .4 * sonne).toFixed(2) + ')';
        ctx.strokeStyle = dunkel; ctx.lineWidth = schwarm.gross ? 1.6 : 1.1; ctx.lineCap = 'round';
        for (let k = 0; k < schwarm.n; k++) {
          const reihe = schwarm.gross ? (k % 2 ? 1 : -1) * Math.ceil(k / 2) : 0;
          const vx = fx + (schwarm.x - schwarm.richtung * k * (schwarm.gross ? .035 : .022)) * fw, vy = fy + (schwarm.y + (schwarm.gross ? Math.abs(reihe) * .028 : Math.sin(k * 1.7) * .02) + Math.sin(schwarm.t * 2 + k) * .006) * fh;
          const gr = schwarm.gross ? 5.5 : 3.4, flap = Math.sin(schwarm.t * (schwarm.gross ? 6 : 11) + k) * gr * .55;
          ctx.beginPath(); ctx.moveTo(vx - gr, vy + flap * .3); ctx.quadraticCurveTo(vx - gr * .4, vy - flap, vx, vy); ctx.quadraticCurveTo(vx + gr * .4, vy - flap, vx + gr, vy + flap * .3); ctx.stroke();
        }
        if (schwarm.x < -.3 || schwarm.x > 1.3) { schwarm = null; schwarmWarte = 18 + zuf() * 50; }
      }
    }
    /* Garten: hinten Bäume, dann Büsche, dann Gras — Farben nach Jahreszeit und Licht */
    const tief = (f, n) => { const m = Math.max(0, Math.min(1, n)); return 'rgb(' + f.map((v, k) => Math.round(v + ([8, 12, 10][k] - v) * m)).join(',') + ')'; };
    const kronen = { fruehling: [[96, 150, 80], [128, 178, 96]], sommer: [[42, 92, 50], [62, 118, 62]], herbst: [[150, 84, 34], [196, 122, 48]], winter: [[70, 62, 56], [90, 80, 72]] }[jahreszeit];
    const gruen = { fruehling: [[60, 110, 60], [88, 140, 70]], sommer: [[34, 76, 40], [48, 98, 52]], herbst: [[120, 100, 44], [150, 124, 56]], winter: [[96, 92, 84], [120, 116, 108]] }[jahreszeit];
    const nachtAnteil = Math.max(0, 1 - licht * 1.3);
    const farbe = (tiefer) => tief(kronen[tiefer ? 0 : 1], nachtAnteil);
    for (const bm of baeume) {
      const sway = Math.sin(t * .6 * wind + bm.ph) * 3 * wind + para.x * (bm.tief ? -3 : -7);
      const bx = fx + bm.x * fw, bw = bm.w * fw, bh = bm.h * (fensterH - 40);
      const stamm = tief([64, 44, 30], nachtAnteil);
      ctx.fillStyle = stamm;
      ctx.beginPath(); ctx.moveTo(bx + bw * .46, boden); ctx.lineTo(bx + bw * .44 + sway * .2, boden - bh * .45); ctx.lineTo(bx + bw * .56 + sway * .2, boden - bh * .45); ctx.lineTo(bx + bw * .54, boden); ctx.closePath(); ctx.fill();
      if (jahreszeit === 'winter') {
        ctx.strokeStyle = stamm; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let k = 0; k < 7; k++) { const w = -1.3 + k * .43; ctx.beginPath(); ctx.moveTo(bx + bw * .5 + sway * .2, boden - bh * .45); ctx.quadraticCurveTo(bx + bw * .5 + Math.cos(w) * bw * .35 + sway * .5, boden - bh * (.45 + .25), bx + bw * .5 + Math.cos(w) * bw * .6 + sway, boden - bh * (.55 + .4 * Math.abs(Math.sin(w + 1)))); ctx.stroke(); }
        /* Schnee auf den Ästen */
        ctx.strokeStyle = 'rgba(240,244,250,' + (.5 * Math.max(.3, licht)).toFixed(2) + ')'; ctx.lineWidth = 1.2;
        for (let k = 0; k < 5; k++) { const w = -1.1 + k * .55; ctx.beginPath(); ctx.moveTo(bx + bw * .5 + Math.cos(w) * bw * .25 + sway * .4, boden - bh * (.62 + .1 * k / 5)); ctx.lineTo(bx + bw * .5 + Math.cos(w) * bw * .5 + sway * .8, boden - bh * (.62 + .3 * Math.abs(Math.sin(w + 1)))); ctx.stroke(); }
      } else {
        ctx.fillStyle = farbe(bm.tief);
        for (const [ox, oy, r] of [[.5, .75, .42], [.3, .6, .3], [.7, .62, .32], [.5, .92, .26]]) { ctx.beginPath(); ctx.ellipse(bx + bw * ox + sway, boden - bh * oy, bw * r, bh * r * .5, 0, 0, 6.29); ctx.fill(); }
        /* Licht von der Sonnenseite */
        if (sonne > 0) { ctx.fillStyle = 'rgba(255,240,180,' + (.12 * sonne * (1 - nachtAnteil)).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(bx + bw * (.5 + (info.u < .5 ? -.12 : .12)) + sway, boden - bh * .78, bw * .24, bh * .16, 0, 0, 6.29); ctx.fill(); }
        if (jahreszeit === 'fruehling') { ctx.fillStyle = 'rgba(255,220,230,' + (nacht > .5 ? .12 : .34) + ')'; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(bx + bw * (.2 + ((k * 37) % 60) / 100) + sway, boden - bh * (.5 + ((k * 53) % 45) / 100), 1.6, 0, 6.29); ctx.fill(); } }
        if (jahreszeit === 'herbst') { ctx.fillStyle = 'rgba(210,120,40,' + (nacht > .5 ? .1 : .3) + ')'; for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.arc(bx + bw * (.25 + ((k * 41) % 50) / 100) + sway, boden - bh * (.55 + ((k * 29) % 40) / 100), 2, 0, 6.29); ctx.fill(); } }
      }
    }
    for (const sb of buesche) {
      const sway = Math.sin(t * .9 * wind + sb.ph) * 2.2 * wind + para.x * -9;
      const sx2 = fx + sb.x * fw, sw = sb.w * fw, sh = sb.h * (fensterH - 40);
      ctx.fillStyle = tief(gruen[0], nachtAnteil);
      ctx.beginPath(); ctx.ellipse(sx2 + sway, boden - sh * .35, sw * .5, sh * .5, 0, 0, 6.29); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx2 + sw * .3 + sway, boden - sh * .55, sw * .32, sh * .4, 0, 0, 6.29); ctx.fill();
    }
    /* Gras */
    ctx.strokeStyle = tief(gruen[1], nachtAnteil); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (const gr of graeser) {
      const sway = Math.sin(t * 1.4 * wind + gr.ph) * 4 * wind * gr.n;
      const gx = fx + gr.x * fw;
      ctx.beginPath(); ctx.moveTo(gx, boden); ctx.quadraticCurveTo(gx + sway * .4, boden - gr.h * fensterH * .6, gx + sway, boden - gr.h * fensterH); ctx.stroke();
    }
    ctx.fillStyle = tief(gruen[0], nachtAnteil); ctx.fillRect(fx, boden, fw, 4);
    /* Schmetterlinge im Sommer, tagsüber, bei gutem Wetter */
    if (jahreszeit === 'sommer' && sonne > .2 && opt.wetter === 'still') {
      for (const f of falter) {
        const px = fx + (f.x + Math.sin(t * f.v * .7 + f.ph) * .08) * fw, py = fy + (f.y + Math.sin(t * f.v * 1.3 + f.ph * 2) * .05) * fh;
        const auf = Math.abs(Math.sin(t * 9 + f.ph));
        ctx.fillStyle = f.f; ctx.globalAlpha = .85;
        ctx.beginPath(); ctx.ellipse(px - 2.2, py, 2.6 * auf + .4, 1.8, -.4, 0, 6.29); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + 2.2, py, 2.6 * auf + .4, 1.8, .4, 0, 6.29); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    /* Nebelbänder — morgens im Herbst dichter */
    const nebelDicht = (jahreszeit === 'herbst' && (info.phase === 'morgen' || info.phase === 'morgenrot' || info.phase === 'sonnenaufgang')) ? 2.2 : 1;
    for (const n of nebel) {
      const ny = n.y * fensterH; const nx = ((t * n.v * 60 + n.ph * 40) % (W + 300)) - 150;
      kerzeSchein(ctx, nx, ny, 180, 18, [[0, 'rgba(190,196,205,' + ((nacht > .5 ? .06 : .1) * nebelDicht).toFixed(3) + ')'], [1, 'rgba(190,196,205,0)']]);
    }
    /* Jahreszeiten: Glühwürmchen (Sommer, Nacht), fallende Blätter (Herbst), Schnee (Winter) */
    if (jahreszeit === 'sommer' && nacht > .6 && opt.wetter !== 'regen' && opt.wetter !== 'gewitter') {
      for (const w of wuermchen) {
        const a = Math.max(0, Math.sin(t * w.v * 2 + w.ph));
        const wx = fx + (w.x + Math.sin(t * .3 + w.ph) * .03) * fw, wy = fy + (w.y + Math.cos(t * .2 + w.ph) * .02) * fh;
        kerzeSchein(ctx, wx, wy, 6, 6, [[0, 'rgba(210,255,140,' + (a * .9).toFixed(2) + ')'], [1, 'rgba(210,255,140,0)']]);
      }
    }
    if (jahreszeit === 'herbst') {
      for (const bl of blaetter) {
        bl.y += bl.v * dt * .5; bl.x += Math.sin(t * 1.3 + bl.ph) * .0015 * wind + .0006 * wind; bl.rot += dt * 1.5;
        if (bl.y > 1.05) { bl.y = -.05; bl.x = zuf(); }
        if (bl.x > 1.05) bl.x = -.05;
        ctx.save(); ctx.translate(fx + bl.x * fw, fy + bl.y * fh); ctx.rotate(bl.rot);
        ctx.fillStyle = bl.f; ctx.globalAlpha = nacht > .5 ? .55 : .85; ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.2, 0, 0, 6.29); ctx.fill(); ctx.restore();
      }
    }
    if (jahreszeit === 'winter' && opt.wetter !== 'regen') {
      for (const f of flocken) {
        f.y += f.v * dt * .6; f.x += Math.sin(t * .8 + f.ph) * .0012 * wind;
        if (f.y > 1.05) { f.y = -.03; f.x = zuf(); }
        ctx.fillStyle = 'rgba(240,244,255,' + (nacht > .5 ? .7 : .85) + ')';
        ctx.beginPath(); ctx.arc(fx + f.x * fw, fy + f.y * fh, f.r, 0, 6.29); ctx.fill();
      }
      ctx.fillStyle = 'rgba(235,240,250,.88)'; ctx.fillRect(fx, boden - 3, fw, 7);
      /* Eisblumen in den Scheibenecken, wenn es kalt und dunkel ist */
      if (licht < .6) {
        const a = (.22 * (1 - licht / .6)).toFixed(3);
        for (const [ex, ey] of [[fx, fy], [fx + fw, fy], [fx, fy + fh], [fx + fw, fy + fh]]) kerzeSchein(ctx, ex, ey, fw * .18, fh * .3, [[0, 'rgba(230,240,255,' + a + ')'], [.5, 'rgba(230,240,255,' + (a * .4).toFixed(3) + ')'], [1, 'rgba(230,240,255,0)']]);
      }
    }
    /* Regen: Tropfen, jeder für sich — keine Kachel, kein Wiederholen */
    if (opt.wetter === 'regen' || opt.wetter === 'gewitter') {
      const schraeg = opt.wetter === 'gewitter' ? .18 : .08;
      ctx.strokeStyle = 'rgba(200,215,240,.5)'; ctx.lineWidth = 1;
      for (const r of tropfen) {
        r.y += r.v * dt * 1.6; r.x += schraeg * r.v * dt;
        if (r.y > 1.05) { r.y = -.05; r.x = zuf(); } if (r.x > 1.05) r.x = -.05;
        ctx.globalAlpha = r.a; ctx.beginPath();
        ctx.moveTo(fx + r.x * fw, fy + r.y * fh); ctx.lineTo(fx + (r.x + schraeg * r.l) * fw, fy + (r.y + r.l) * fh); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const g of glasTropfen) {
        g.y += g.v * dt * (.5 + g.r * .2); if (g.y > 1.02) { g.y = -.02; g.x = zuf(); }
        const gx = fx + g.x * fw, gy = fy + g.y * fh;
        try {
          ctx.save(); ctx.beginPath(); ctx.ellipse(gx, gy, g.r, g.r * 1.5, 0, 0, 6.29); ctx.clip();
          ctx.translate(gx, gy); ctx.scale(1.6, -1.6);
          ctx.drawImage(canvas, Math.max(0, (gx - g.r * 2) * dpr), Math.max(0, (gy - g.r * 3) * dpr), g.r * 4 * dpr, g.r * 6 * dpr, -g.r * 2, -g.r * 3, g.r * 4, g.r * 6);
          ctx.restore();
        } catch (e) {}
        ctx.fillStyle = 'rgba(220,230,250,.22)'; ctx.beginPath(); ctx.ellipse(gx, gy, g.r, g.r * 1.5, 0, 0, 6.29); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(gx - g.r * .3, gy - g.r * .5, g.r * .35, g.r * .5, -.4, 0, 6.29); ctx.stroke();
      }
    }
    /* Spiegelung der Flammen in der Scheibe, ganz zart — nur wenn es dunkel ist */
    if (opt.kerzen && nacht > .3) kerzeSchein(ctx, W * .86, fensterH * .55, 60, 40, [[0, 'rgba(255,170,80,' + (.06 * nacht).toFixed(3) + ')'], [1, 'rgba(255,170,80,0)']]);
    /* Glasglanz */
    const glanz = ctx.createLinearGradient(fx, fy, W * .5, fensterH);
    glanz.addColorStop(0, 'rgba(255,255,255,' + (.05 + .05 * licht).toFixed(3) + ')'); glanz.addColorStop(.45, 'rgba(255,255,255,0)'); glanz.addColorStop(1, 'rgba(255,255,255,.03)');
    ctx.fillStyle = glanz; ctx.fillRect(fx, fy, fw, fh);
    ctx.restore();
    /* Für das Licht im Raum merken */
    sonneJetzt = { info, sx, sy };
  }

  function maleLicht(dt) {
    const oben = fensterH + 10;
    /* Dunkelheit über der Platte, die Lampe frisst sie auf — und sie geht nicht
       an wie ein Schalter, sondern wie ein Glühfaden: erst warm, dann hell. */
    const ziel = opt.lampeAn ? opt.lampe : 0;
    lampeJetzt += (ziel - lampeJetzt) * Math.min(1, dt * (ziel > lampeJetzt ? 5 : 9));
    if (Math.abs(ziel - lampeJetzt) < .004) lampeJetzt = ziel;
    const an = lampeJetzt;
    /* Tag im Raum: Licht fällt durchs Fenster auf die Platte, die Dunkelheit weicht */
    const info = sonneJetzt.info || schreibtischTageszeitInfo(Date.now(), opt.tageszeitWahl);
    const tag = info.licht, sonne = info.sonne;
    const tageszeit = tag >= .5 ? 'tag' : tag > .12 ? 'daemmerung' : 'nacht';
    if (tageszeit !== letzteTageszeit) { letzteTageszeit = tageszeit; const sz = canvas.parentElement; if (sz) { sz.dataset.tageszeit = tageszeit; sz.dataset.phase = info.phase; } }
    ctx.fillStyle = 'rgba(0,0,0,' + Math.max(.04, .62 - .48 * an - .5 * tag).toFixed(3) + ')'; ctx.fillRect(0, oben, W, H - oben);
    if (tag > .02) {
      /* Das Fensterlicht: kühl am Tag, golden, wenn die Sonne tief steht */
      const wf = info.waerme, a0 = (.2 + .14 * sonne) * tag;
      const kalt = [200, 214, 235], warm = [255, 206, 140];
      const f = kalt.map((v, i) => Math.round(v + (warm[i] - v) * wf));
      kerzeSchein(ctx, W * .5 + para.x * 6, oben + (H - oben) * .1, W * .56, (H - oben) * .34, [[0, 'rgba(' + f.join(',') + ',' + a0.toFixed(3) + ')'], [.6, 'rgba(' + f.join(',') + ',' + (a0 * .3).toFixed(3) + ')'], [1, 'rgba(' + f.join(',') + ',0)']]);
      /* Die Sonne wirft einen Lichtbalken durch das Fenster auf die Platte — schräg, je nachdem, wo sie steht */
      if (sonne > 0 && opt.wetter !== 'regen' && opt.wetter !== 'gewitter') {
        const neig = (info.u - .5) * -1.2;
        const laenge = (H - oben) * (.35 + .35 * (1 - sonne));
        const g = ctx.createLinearGradient(0, oben, 0, oben + laenge);
        const sa = (.16 + .1 * (1 - sonne)) * Math.min(1, sonne * 3);
        g.addColorStop(0, 'rgba(' + f.join(',') + ',' + sa.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + f.join(',') + ',0)');
        ctx.fillStyle = g;
        for (const [l, r] of [[16, W / 2 - 6], [W / 2 + 6, W - 16]]) {
          ctx.beginPath(); ctx.moveTo(l, oben); ctx.lineTo(r, oben); ctx.lineTo(r + neig * laenge, oben + laenge); ctx.lineTo(l + neig * laenge, oben + laenge); ctx.closePath(); ctx.fill();
        }
        /* Schatten der Sprossen im Balken */
        ctx.fillStyle = 'rgba(0,0,0,' + (.1 * sonne).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(W / 2 - 6, oben); ctx.lineTo(W / 2 + 6, oben); ctx.lineTo(W / 2 + 6 + neig * laenge * .8, oben + laenge * .8); ctx.lineTo(W / 2 - 6 + neig * laenge * .8, oben + laenge * .8); ctx.closePath(); ctx.fill();
        /* Staub tanzt im Sonnenbalken */
        for (const st of staub) {
          const px = 16 + st.x * (W - 32) + neig * st.y * laenge, py = oben + st.y * laenge;
          const a = sa * 1.6 * (.3 + .7 * Math.abs(Math.sin(t * 1.1 + st.ph))) * (1 - st.y);
          ctx.fillStyle = 'rgba(255,250,235,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(px, py, st.r * .9, 0, 6.29); ctx.fill();
        }
      } else {
        ctx.fillStyle = 'rgba(0,0,0,' + (.08 * tag).toFixed(3) + ')'; ctx.fillRect(W / 2 - 5, oben, 10, (H - oben) * .3);
      }
    }
    /* Der Schirm hängt links über der Platte; der Teich aus Licht liegt ein Stück rechts darunter */
    const lx = W * .16 + para.x * 4, ly = oben + (H - oben) * .27;
    if (an > .01) {
      const flacker = 1 + .012 * Math.sin(t * 7.3) + .008 * Math.sin(t * 13.1);
      kerzeSchein(ctx, lx, ly, W * .46 * flacker, (H - oben) * .7, [[0, 'rgba(255,200,115,' + (.62 * an).toFixed(3) + ')'], [.3, 'rgba(255,176,85,' + (.3 * an).toFixed(3) + ')'], [.7, 'rgba(255,150,60,' + (.09 * an).toFixed(3) + ')'], [1, 'rgba(255,150,60,0)']]);
      /* Der helle Teich direkt unter dem Schirm, mit einem schärferen Kern */
      kerzeSchein(ctx, lx + W * .01, oben + (H - oben) * .2, W * .2 * flacker, (H - oben) * .2, [[0, 'rgba(255,228,165,' + (.34 * an).toFixed(3) + ')'], [.5, 'rgba(255,210,130,' + (.14 * an).toFixed(3) + ')'], [1, 'rgba(255,210,130,0)']]);
      /* Lichtstreif an der Wand unter der Lampe und ein helles Herz */
      kerzeSchein(ctx, lx - W * .02, oben - 8, W * .11, 34, [[0, 'rgba(255,205,125,' + (.26 * an).toFixed(3) + ')'], [1, 'rgba(255,205,125,0)']]);
      kerzeSchein(ctx, lx, ly - 10, W * .12, (H - oben) * .16, [[0, 'rgba(255,232,170,' + (.28 * an).toFixed(3) + ')'], [1, 'rgba(255,232,170,0)']]);
      /* Staub im Lichtkegel: treibt langsam, nur dort sichtbar, wo Licht ist */
      for (const s of staub) {
        s.y += s.v * dt * .6; s.x += Math.sin(t * .4 + s.ph) * .0006;
        if (s.y > 1) { s.y = 0; s.x = zuf(); }
        const sx = lx - W * .3 + s.x * W * .6, sy = oben + s.y * (H - oben) * .8;
        const naehe = 1 - Math.min(1, Math.hypot((sx - lx) / (W * .36), (sy - ly) / ((H - oben) * .6)));
        if (naehe <= 0) continue;
        const a = naehe * an * (.25 + .25 * Math.sin(t * 1.3 + s.ph));
        ctx.fillStyle = 'rgba(255,236,190,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, 6.29); ctx.fill();
      }
      /* Eine Motte, selten, im Sommer, wenn es dunkel ist: kreist in Achten um den Schirm */
      const nachtDraussen = tag < .3;
      if (!motte && jahreszeit === 'sommer' && nachtDraussen) { motteWarte -= dt; if (motteWarte <= 0) { motte = { t: 0, dauer: 14 + zuf() * 10, cx: W * .2, cy: oben - 40 }; } }
      if (motte) {
        motte.t += dt;
        const u = motte.t * 2.2, rx = 42 + 8 * Math.sin(motte.t * .7), ry = 24;
        const mx = motte.cx + Math.sin(u) * rx, my = motte.cy + Math.sin(2 * u) * ry * .5 + Math.cos(u * .5) * 6;
        const fluegel = Math.sin(motte.t * 40) * 3;
        ctx.fillStyle = 'rgba(40,32,26,.85)';
        ctx.beginPath(); ctx.ellipse(mx - 3, my, 3.5, 1.6 + Math.abs(fluegel) * .3, -.5, 0, 6.29); ctx.fill();
        ctx.beginPath(); ctx.ellipse(mx + 3, my, 3.5, 1.6 + Math.abs(fluegel) * .3, .5, 0, 6.29); ctx.fill();
        ctx.beginPath(); ctx.ellipse(mx, my, 1.6, 2.4, 0, 0, 6.29); ctx.fill();
        if (motte.t > motte.dauer) { motte = null; motteWarte = 90 + zuf() * 200; }
      }
    }
    if (opt.kerzen) {
      const fl = 1 + .1 * Math.sin(t * 9) + .06 * Math.sin(t * 17.3);
      kerzeSchein(ctx, W * .88, oben + 20, W * .26 * fl, (H - oben) * .45, [[0, 'rgba(255,175,80,.26)'], [.5, 'rgba(255,150,60,.1)'], [1, 'rgba(255,140,50,0)']]);
    }
  }

  function bild(jetzt) {
    if (!laeuft) return;
    /* Verdeckt (Schreibraum, Leser) oder Tab im Hintergrund: nicht malen, nur gelegentlich nachsehen */
    if ((typeof _sr !== 'undefined' && _sr) || (typeof _leser !== 'undefined' && _leser) || (typeof _smOffen !== 'undefined' && _smOffen) || (typeof _epub !== 'undefined' && _epub) || document.visibilityState === 'hidden') { letzte = jetzt; setTimeout(() => requestAnimationFrame(bild), 500); return; }
    const dt = Math.min(.05, (jetzt - letzte) / 1000 || .016); letzte = jetzt; t += dt;
    if (messen() || !statisch) statisch = maleStatisch();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(statisch, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maleFenster(dt);
    maleLicht(dt);
    requestAnimationFrame(bild);
  }
  return {
    start() { if (laeuft) return; laeuft = true; letzte = performance.now(); requestAnimationFrame(bild); },
    stopp() { laeuft = false; },
    setze(neu) {
      Object.assign(opt, neu || {});
      if (neu && 'jahreszeitWahl' in neu) jahreszeit = JAHRESZEIT_WAHLEN.includes(opt.jahreszeitWahl) && opt.jahreszeitWahl !== 'echt' && opt.jahreszeitWahl !== 'zufall' ? opt.jahreszeitWahl : schreibtischJahreszeit();
      if (neu && ('holz' in neu || 'kleckse' in neu || 'alter' in neu || 'jahreszeitWahl' in neu)) statisch = null;
    },
    opt
  };
}
