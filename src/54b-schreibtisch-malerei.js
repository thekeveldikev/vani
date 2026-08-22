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
/* Himmel nach Stunde: 0 = tiefe Nacht, 1 = Tag; dazwischen Dämmerung. Pur. */
function schreibtischTageslicht(wann = Date.now()) {
  const d = new Date(wann); const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 21.5 || h < 4.5) return 0;
  if (h < 6.5) return (h - 4.5) / 2 * .55;              /* erstes Grau */
  if (h < 17) return .55;                               /* ein grauer Tag — der Tisch bleibt Nachttisch */
  if (h < 19.5) return .55 - (h - 17) / 2.5 * .35;      /* Dämmerung */
  return .2 - (h - 19.5) / 2 * .2;                      /* letzte Helle */
}
function schreibtischHimmelFarben(licht) {
  /* Nacht → Tag: drei Stopps */
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const nacht = [[4, 5, 12], [11, 14, 30], [22, 26, 38]];
  const daemmer = [[28, 22, 48], [92, 54, 70], [150, 92, 70]];
  const tag = [[120, 128, 140], [150, 156, 164], [172, 176, 180]];
  const t = Math.max(0, Math.min(1, licht));
  const a = t < .35 ? nacht : daemmer, b = t < .35 ? daemmer : tag, u = t < .35 ? t / .35 : (t - .35) / .65;
  return [0, 1, 2].map((i) => 'rgb(' + mix(a[i], b[i], u).join(',') + ')');
}

function schreibtischMaler(canvas, optionen = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const saatText = tagKey();
  let saat = 17; for (const c of saatText) saat = (saat * 31 + c.charCodeAt(0)) >>> 0;
  const zuf = kerzeZufall(saat);
  const opt = Object.assign({ holz: 'nuss', lampe: .8, lampeAn: true, wetter: 'still', kerzen: true, unordnung: .7, fensterAnteil: .44 }, optionen);
  let W = 0, H = 0, fensterH = 0, statisch = null, laeuft = false, t = 0, letzte = 0, blitz = 0, blitzWarte = 6 + zuf() * 10;
  const jahreszeit = schreibtischJahreszeit();
  const mond = mondphase();

  /* Einmal gewürfelte Dinge */
  const sterne = Array.from({ length: 90 }, () => ({ x: zuf(), y: zuf() * .72, r: .35 + zuf() * 1.3, ph: zuf() * 6.3, tw: .3 + zuf() * 1.2, warm: zuf() < .3 }));
  const baeume = [
    { x: -.1, w: .34, h: .82, tief: 0, ph: zuf() * 6 }, { x: .8, w: .32, h: .74, tief: 0, ph: zuf() * 6 },
    { x: .24, w: .2, h: .52, tief: 1, ph: zuf() * 6 }, { x: .55, w: .18, h: .42, tief: 1, ph: zuf() * 6 }
  ];
  const buesche = Array.from({ length: 7 }, (_, i) => ({ x: i / 7 + zuf() * .08 - .02, w: .14 + zuf() * .12, h: .22 + zuf() * .2, ph: zuf() * 6 }));
  const graeser = Array.from({ length: 140 }, () => ({ x: zuf(), h: .05 + zuf() * .09, ph: zuf() * 6, n: .6 + zuf() * .8 }));
  const tropfen = Array.from({ length: 180 }, () => ({ x: zuf(), y: zuf(), l: .02 + zuf() * .03, v: .35 + zuf() * .5, a: .18 + zuf() * .3 }));
  const glasTropfen = Array.from({ length: 14 }, () => ({ x: zuf(), y: zuf(), v: .01 + zuf() * .03, r: 1.5 + zuf() * 2 }));
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
    /* Kratzer */
    for (const k of kratzer) {
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
    /* Kaffeering unter der Tasse */
    g.beginPath(); g.ellipse(W * .83, oben + (H - oben) * .52, 30, 14, 0, 0, 6.29); g.strokeStyle = 'rgba(70,40,15,.45)'; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(W * .83, oben + (H - oben) * .52, 30, 14, 0, .4, 2.2); g.strokeStyle = 'rgba(70,40,15,.3)'; g.lineWidth = 6; g.stroke();
    g.restore();
    /* Fensterrahmen: schweres Holz mit Sprossen */
    g.fillStyle = '#1a1210'; g.fillRect(0, 0, W, 16); g.fillRect(0, 0, 16, fensterH); g.fillRect(W - 16, 0, 16, fensterH); g.fillRect(0, fensterH - 12, W, 22);
    g.fillStyle = '#3d2b20'; g.fillRect(16, 16, W - 32, 2); g.fillRect(16, 16, 2, fensterH - 28); g.fillRect(W - 18, 16, 2, fensterH - 28);
    g.fillStyle = '#241912'; g.fillRect(W / 2 - 6, 16, 12, fensterH - 28); g.fillRect(16, fensterH * .42 - 5, W - 32, 10);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(W / 2 + 4, 16, 1, fensterH - 28); g.fillRect(16, fensterH * .42 + 5, W - 32, 1);
    /* Fensterbank */
    const bank = g.createLinearGradient(0, fensterH + 8, 0, fensterH + 22);
    bank.addColorStop(0, '#3a2a20'); bank.addColorStop(1, '#1a120d');
    g.fillStyle = bank; g.fillRect(0, fensterH + 8, W, 14);
    return c;
  }

  /* ----- Das Bewegte ----- */
  function maleFenster(dt) {
    const licht = schreibtischTageslicht();
    const [h1, h2, h3] = schreibtischHimmelFarben(licht);
    const sky = ctx.createLinearGradient(0, 0, 0, fensterH);
    sky.addColorStop(0, h1); sky.addColorStop(.6, h2); sky.addColorStop(1, h3);
    ctx.fillStyle = sky; ctx.fillRect(16, 16, W - 32, fensterH - 28);
    ctx.save(); ctx.beginPath(); ctx.rect(16, 16, W - 32, fensterH - 28); ctx.clip();
    const nacht = 1 - Math.min(1, licht / .45);
    /* Sterne */
    if (nacht > 0) for (const s of sterne) {
      const a = nacht * (.3 + .5 * Math.abs(Math.sin(t * s.tw + s.ph)));
      ctx.fillStyle = s.warm ? 'rgba(255,235,200,' + a.toFixed(2) + ')' : 'rgba(230,240,255,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(16 + s.x * (W - 32), 16 + s.y * (fensterH - 28), s.r, 0, 6.29); ctx.fill();
    }
    /* Mond */
    if (nacht > 0 || licht < .4) {
      const mx = W * .72, my = fensterH * .2, mr = Math.min(24, W * .035);
      ctx.save(); ctx.globalAlpha = Math.max(.35, nacht);
      kerzeSchein(ctx, mx, my, mr * 5, mr * 5, [[0, 'rgba(255,246,220,.2)'], [1, 'rgba(255,246,220,0)']]);
      ctx.fillStyle = '#f3ecd8'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.29); ctx.fill();
      const hell = 1 - Math.abs(mond - .5) * 2;
      ctx.fillStyle = h1; ctx.beginPath();
      if (mond < .5) { ctx.arc(mx, my, mr, Math.PI / 2, -Math.PI / 2, false); ctx.ellipse(mx, my, mr * Math.abs(1 - 2 * hell), mr, 0, -Math.PI / 2, Math.PI / 2, hell > .5); }
      else { ctx.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2, false); ctx.ellipse(mx, my, mr * Math.abs(1 - 2 * hell), mr, 0, Math.PI / 2, -Math.PI / 2, hell > .5); }
      ctx.closePath(); ctx.fill();
      /* Mare: zwei dunklere Flecken */
      ctx.fillStyle = 'rgba(120,110,90,.18)'; ctx.beginPath(); ctx.ellipse(mx - mr * .25, my - mr * .1, mr * .35, mr * .25, .4, 0, 6.29); ctx.fill(); ctx.beginPath(); ctx.ellipse(mx + mr * .3, my + mr * .3, mr * .2, mr * .18, 0, 0, 6.29); ctx.fill();
      ctx.restore();
    }
    /* Wetterleuchten */
    if (opt.wetter === 'gewitter') {
      blitzWarte -= dt;
      if (blitzWarte <= 0) { blitz = 1; blitzWarte = 5 + zuf() * 11; }
      if (blitz > 0) { ctx.fillStyle = 'rgba(225,232,255,' + (blitz * .55).toFixed(2) + ')'; ctx.fillRect(16, 16, W - 32, fensterH - 28); blitz = Math.max(0, blitz - dt * 6 * (blitz > .6 ? 1 : 2.5)); }
    }
    /* Garten: hinten Bäume (dunkle Silhouetten mit Kronen), dann Büsche, dann Gras — alle wiegen sich */
    const wind = opt.wetter === 'wind' || opt.wetter === 'gewitter' ? 2.4 : opt.wetter === 'regen' ? 1.4 : 1;
    const boden = fensterH - 12;
    const farbe = (tief) => nacht > .5 ? (tief ? '#0a0f0a' : '#0e150e') : (tief ? '#1d251c' : '#263125');
    for (const b of baeume) {
      const sway = Math.sin(t * .6 * wind + b.ph) * 3 * wind;
      const bx = 16 + b.x * (W - 32), bw = b.w * (W - 32), bh = b.h * (fensterH - 40);
      ctx.fillStyle = farbe(b.tief);
      /* Stamm */
      ctx.beginPath(); ctx.moveTo(bx + bw * .46, boden); ctx.lineTo(bx + bw * .44 + sway * .2, boden - bh * .45); ctx.lineTo(bx + bw * .56 + sway * .2, boden - bh * .45); ctx.lineTo(bx + bw * .54, boden); ctx.closePath(); ctx.fill();
      /* Krone aus drei Wolken, im Winter kahl (nur Geäst) */
      if (jahreszeit === 'winter') {
        ctx.strokeStyle = farbe(b.tief); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let k = 0; k < 7; k++) { const w = -1.3 + k * .43; ctx.beginPath(); ctx.moveTo(bx + bw * .5 + sway * .2, boden - bh * .45); ctx.quadraticCurveTo(bx + bw * .5 + Math.cos(w) * bw * .35 + sway * .5, boden - bh * (.45 + .3 * Math.abs(Math.sin(w))), bx + bw * .5 + Math.cos(w) * bw * .5 + sway, boden - bh * (.45 + .5 * Math.abs(Math.sin(w)) + .05)); ctx.stroke(); }
      } else {
        for (const [ox, oy, r] of [[.5, .75, .42], [.3, .6, .3], [.7, .62, .32], [.5, .92, .26]]) { ctx.beginPath(); ctx.ellipse(bx + bw * ox + sway, boden - bh * oy, bw * r, bh * r * .5, 0, 0, 6.29); ctx.fill(); }
        if (jahreszeit === 'fruehling') { ctx.fillStyle = 'rgba(255,220,230,' + (nacht > .5 ? .12 : .3) + ')'; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(bx + bw * (.2 + ((k * 37) % 60) / 100) + sway, boden - bh * (.55 + ((k * 53) % 40) / 100), 1.4, 0, 6.29); ctx.fill(); } }
      }
    }
    for (const s of buesche) {
      const sway = Math.sin(t * .9 * wind + s.ph) * 2.2 * wind;
      const sx = 16 + s.x * (W - 32), sw = s.w * (W - 32), sh = s.h * (fensterH - 40);
      ctx.fillStyle = nacht > .5 ? '#0b120b' : '#1f2a1e';
      ctx.beginPath(); ctx.ellipse(sx + sway, boden - sh * .35, sw * .5, sh * .5, 0, 0, 6.29); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx + sw * .3 + sway, boden - sh * .55, sw * .32, sh * .4, 0, 0, 6.29); ctx.fill();
    }
    /* Gras */
    ctx.strokeStyle = nacht > .5 ? '#0c130c' : '#253024'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (const gr of graeser) {
      const sway = Math.sin(t * 1.4 * wind + gr.ph) * 4 * wind * gr.n;
      const gx = 16 + gr.x * (W - 32);
      ctx.beginPath(); ctx.moveTo(gx, boden); ctx.quadraticCurveTo(gx + sway * .4, boden - gr.h * fensterH * .6, gx + sway, boden - gr.h * fensterH); ctx.stroke();
    }
    ctx.fillStyle = nacht > .5 ? '#080c08' : '#1a231a'; ctx.fillRect(16, boden, W - 32, 4);
    /* Nebelbänder */
    for (const n of nebel) {
      const ny = n.y * fensterH; const nx = ((t * n.v * 60 + n.ph * 40) % (W + 300)) - 150;
      kerzeSchein(ctx, nx, ny, 180, 18, [[0, 'rgba(150,160,170,' + (nacht > .5 ? .06 : .1) + ')'], [1, 'rgba(150,160,170,0)']]);
    }
    /* Jahreszeiten: Glühwürmchen (Sommer, Nacht), fallende Blätter (Herbst), Schnee (Winter) */
    if (jahreszeit === 'sommer' && nacht > .6 && opt.wetter !== 'regen' && opt.wetter !== 'gewitter') {
      for (const w of wuermchen) {
        const a = Math.max(0, Math.sin(t * w.v * 2 + w.ph));
        const wx = 16 + (w.x + Math.sin(t * .3 + w.ph) * .03) * (W - 32), wy = 16 + (w.y + Math.cos(t * .2 + w.ph) * .02) * (fensterH - 28);
        kerzeSchein(ctx, wx, wy, 6, 6, [[0, 'rgba(210,255,140,' + (a * .9).toFixed(2) + ')'], [1, 'rgba(210,255,140,0)']]);
      }
    }
    if (jahreszeit === 'herbst') {
      for (const b of blaetter) {
        b.y += b.v * dt * .5; b.x += Math.sin(t * 1.3 + b.ph) * .0015 * wind + .0006 * wind; b.rot += dt * 1.5;
        if (b.y > 1.05) { b.y = -.05; b.x = zuf(); }
        if (b.x > 1.05) b.x = -.05;
        ctx.save(); ctx.translate(16 + b.x * (W - 32), 16 + b.y * (fensterH - 28)); ctx.rotate(b.rot);
        ctx.fillStyle = b.f; ctx.globalAlpha = nacht > .5 ? .55 : .85; ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.2, 0, 0, 6.29); ctx.fill(); ctx.restore();
      }
    }
    if (jahreszeit === 'winter' && opt.wetter !== 'regen') {
      for (const f of flocken) {
        f.y += f.v * dt * .6; f.x += Math.sin(t * .8 + f.ph) * .0012 * wind;
        if (f.y > 1.05) { f.y = -.03; f.x = zuf(); }
        ctx.fillStyle = 'rgba(240,244,255,' + (nacht > .5 ? .7 : .85) + ')';
        ctx.beginPath(); ctx.arc(16 + f.x * (W - 32), 16 + f.y * (fensterH - 28), f.r, 0, 6.29); ctx.fill();
      }
      ctx.fillStyle = 'rgba(235,240,250,.85)'; ctx.fillRect(16, boden - 3, W - 32, 7);
    }
    /* Regen: Tropfen, jeder für sich — keine Kachel, kein Wiederholen */
    if (opt.wetter === 'regen' || opt.wetter === 'gewitter') {
      const schraeg = opt.wetter === 'gewitter' ? .18 : .08;
      ctx.strokeStyle = 'rgba(200,215,240,.5)'; ctx.lineWidth = 1;
      for (const r of tropfen) {
        r.y += r.v * dt * 1.6; r.x += schraeg * r.v * dt;
        if (r.y > 1.05) { r.y = -.05; r.x = zuf(); } if (r.x > 1.05) r.x = -.05;
        ctx.globalAlpha = r.a; ctx.beginPath();
        ctx.moveTo(16 + r.x * (W - 32), 16 + r.y * (fensterH - 28)); ctx.lineTo(16 + (r.x + schraeg * r.l) * (W - 32), 16 + (r.y + r.l) * (fensterH - 28)); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      /* Tropfen, die an der Scheibe herunterlaufen */
      for (const g of glasTropfen) {
        g.y += g.v * dt * (.5 + g.r * .2); if (g.y > 1.02) { g.y = -.02; g.x = zuf(); }
        const gx = 16 + g.x * (W - 32), gy = 16 + g.y * (fensterH - 28);
        ctx.fillStyle = 'rgba(220,230,250,.35)'; ctx.beginPath(); ctx.ellipse(gx, gy, g.r, g.r * 1.5, 0, 0, 6.29); ctx.fill();
        ctx.strokeStyle = 'rgba(220,230,250,.12)'; ctx.lineWidth = g.r * .9; ctx.beginPath(); ctx.moveTo(gx, gy - 40); ctx.lineTo(gx, gy); ctx.stroke();
      }
    }
    /* Spiegelung der Flammen in der Scheibe, ganz zart */
    if (opt.kerzen && nacht > .3) kerzeSchein(ctx, W * .86, fensterH * .55, 60, 40, [[0, 'rgba(255,170,80,' + (.06 * nacht).toFixed(3) + ')'], [1, 'rgba(255,170,80,0)']]);
    /* Glasglanz */
    const glanz = ctx.createLinearGradient(16, 16, W * .5, fensterH);
    glanz.addColorStop(0, 'rgba(255,255,255,.05)'); glanz.addColorStop(.45, 'rgba(255,255,255,0)'); glanz.addColorStop(1, 'rgba(255,255,255,.03)');
    ctx.fillStyle = glanz; ctx.fillRect(16, 16, W - 32, fensterH - 28);
    ctx.restore();
  }

  function maleLicht() {
    const oben = fensterH + 10;
    /* Dunkelheit über der Platte, die Lampe frisst sie auf */
    const an = opt.lampeAn ? opt.lampe : 0;
    ctx.fillStyle = 'rgba(0,0,0,' + (.58 - .42 * an).toFixed(3) + ')'; ctx.fillRect(0, oben, W, H - oben);
    if (an > 0) {
      const flacker = 1 + .012 * Math.sin(t * 7.3) + .008 * Math.sin(t * 13.1);
      kerzeSchein(ctx, W * .2, oben + (H - oben) * .3, W * .42 * flacker, (H - oben) * .62, [[0, 'rgba(255,196,110,' + (.5 * an).toFixed(3) + ')'], [.35, 'rgba(255,170,80,' + (.22 * an).toFixed(3) + ')'], [1, 'rgba(255,150,60,0)']]);
      /* Lichtstreif an der Wand unter der Lampe */
      kerzeSchein(ctx, W * .14, oben - 10, W * .1, 30, [[0, 'rgba(255,200,120,' + (.18 * an).toFixed(3) + ')'], [1, 'rgba(255,200,120,0)']]);
    }
    if (opt.kerzen) {
      const fl = 1 + .1 * Math.sin(t * 9) + .06 * Math.sin(t * 17.3);
      kerzeSchein(ctx, W * .88, oben + 20, W * .26 * fl, (H - oben) * .45, [[0, 'rgba(255,175,80,.26)'], [.5, 'rgba(255,150,60,.1)'], [1, 'rgba(255,140,50,0)']]);
    }
  }

  function bild(jetzt) {
    if (!laeuft) return;
    const dt = Math.min(.05, (jetzt - letzte) / 1000 || .016); letzte = jetzt; t += dt;
    if (messen() || !statisch) statisch = maleStatisch();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(statisch, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maleFenster(dt);
    maleLicht();
    requestAnimationFrame(bild);
  }
  return {
    start() { if (laeuft) return; laeuft = true; letzte = performance.now(); requestAnimationFrame(bild); },
    stopp() { laeuft = false; },
    setze(neu) { Object.assign(opt, neu || {}); if ('holz' in (neu || {})) statisch = null; },
    opt
  };
}
