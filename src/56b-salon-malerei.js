/* ===================== 56b — DER SALON, GEMALT =====================
   Hinter der Wand mit den Rahmen liegt eine Leinwand: Damasttapete, Stuckleiste,
   Holzvertäfelung, links und rechts Wandleuchter mit zitternden Flammen, unten
   ein Kamin, in dem das Feuer brennt, ein Sessel, ein Teetisch. Das Licht folgt
   der Tageszeit des Schreibtischs; nachts sind die Flammen das Licht. Staub
   tanzt im Schein. Alles pausiert, wenn der Tab nicht sichtbar ist. */

function salonMaler(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const zuf = kerzeZufall(20240824);
  let W = 0, H = 0, statisch = null, laeuft = false, t = 0, letzte = 0;
  const staub = Array.from({ length: 40 }, () => ({ x: zuf(), y: zuf(), r: .4 + zuf(), ph: zuf() * 6.3, v: .003 + zuf() * .006 }));
  const funken = Array.from({ length: 30 }, () => ({ x: zuf(), y: zuf(), v: .12 + zuf() * .26, ph: zuf() * 6.3, r: .7 + zuf() * 1.2 }));
  const rauch = Array.from({ length: 10 }, () => ({ x: zuf(), y: zuf(), v: .05 + zuf() * .05, ph: zuf() * 6.3, r: 3 + zuf() * 4 }));
  function messen() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === W && h === H) return false;
    W = w; H = h; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); statisch = null; return true;
  }
  function licht() { return typeof schreibtischTageszeitInfo === 'function' ? schreibtischTageszeitInfo().licht : 0; }
  /* Das Unbewegte: Tapete, Leisten, Vertäfelung, Kamin, Möbel */
  function maleStatisch() {
    const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const l = licht(), dunkel = 1 - Math.min(1, l * 1.2);
    /* Wand */
    const wand = g.createLinearGradient(0, 0, 0, H);
    wand.addColorStop(0, mix([126, 96, 68], [58, 42, 30], dunkel)); wand.addColorStop(1, mix([96, 70, 48], [38, 26, 18], dunkel));
    g.fillStyle = wand; g.fillRect(0, 0, W, H);
    /* Damast: Ranken und Medaillons, sehr zart */
    g.save(); g.strokeStyle = 'rgba(255,240,210,' + (.05 + .04 * (1 - dunkel)).toFixed(3) + ')'; g.lineWidth = 1.1;
    const k = 88;
    for (let y = -k; y < H * .72; y += k) for (let x = (Math.round(y / k) % 2) * k / 2 - k; x < W + k; x += k) {
      g.beginPath(); g.ellipse(x + k / 2, y + k / 2, 16, 24, 0, 0, 6.29); g.stroke();
      g.beginPath(); g.moveTo(x + k / 2, y + 6); g.bezierCurveTo(x + k / 2 + 22, y + 20, x + k / 2 + 22, y + k - 20, x + k / 2, y + k - 6); g.bezierCurveTo(x + k / 2 - 22, y + k - 20, x + k / 2 - 22, y + 20, x + k / 2, y + 6); g.stroke();
      g.beginPath(); g.arc(x + k / 2, y + k / 2, 4, 0, 6.29); g.stroke();
    }
    g.restore();
    /* Stuckleiste oben */
    g.fillStyle = 'rgba(255,245,225,' + (.18 - .1 * dunkel).toFixed(3) + ')'; g.fillRect(0, 0, W, 6);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 6, W, 2);
    /* Vertäfelung unten mit Kassetten */
    const vt = H * .72;
    const holz = g.createLinearGradient(0, vt, 0, H); holz.addColorStop(0, mix([94, 64, 40], [44, 30, 18], dunkel)); holz.addColorStop(1, mix([58, 38, 22], [26, 17, 10], dunkel));
    g.fillStyle = holz; g.fillRect(0, vt, W, H - vt);
    g.fillStyle = 'rgba(255,230,190,' + (.16 - .08 * dunkel).toFixed(3) + ')'; g.fillRect(0, vt, W, 4);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, vt + 4, W, 3);
    const nK = Math.max(3, Math.round(W / 180));
    for (let i = 0; i < nK; i++) { const x = (i + .12) * (W / nK), w = (W / nK) * .76; g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2; g.strokeRect(x, vt + 16, w, H - vt - 30); g.strokeStyle = 'rgba(255,230,190,' + (.1 - .05 * dunkel).toFixed(3) + ')'; g.lineWidth = 1; g.strokeRect(x + 4, vt + 20, w - 8, H - vt - 38); }
    /* Kamin in der Mitte unten */
    const kx = W / 2, kb = Math.min(260, W * .36), kh = Math.min(150, (H - vt) * 1.1), ky = H - kh;
    const stein = g.createLinearGradient(0, ky, 0, H); stein.addColorStop(0, mix([180, 170, 160], [90, 84, 78], dunkel)); stein.addColorStop(1, mix([140, 130, 120], [64, 58, 54], dunkel));
    g.fillStyle = stein; g.fillRect(kx - kb / 2, ky, kb, kh);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(kx - kb / 2, ky, kb, 8); g.fillRect(kx - kb / 2, ky, 8, kh); g.fillRect(kx + kb / 2 - 8, ky, 8, kh);
    g.fillStyle = mix([200, 190, 178], [110, 102, 94], dunkel); g.fillRect(kx - kb / 2 - 14, ky - 10, kb + 28, 14);   /* Sims */
    g.fillStyle = '#0e0a08'; g.fillRect(kx - kb * .34, ky + 26, kb * .68, kh - 30);   /* Feuerraum */
    /* Möbel: Sessel links, Teetisch rechts, nur angedeutet */
    const sx = kx - kb / 2 - 110, sy = H - 96;
    if (sx > 20) {
      g.fillStyle = mix([120, 60, 46], [58, 30, 22], dunkel);
      g.beginPath(); g.roundRect ? g.roundRect(sx, sy, 84, 70, 12) : g.rect(sx, sy, 84, 70); g.fill();
      g.beginPath(); g.roundRect ? g.roundRect(sx + 6, sy - 34, 72, 46, 14) : g.rect(sx + 6, sy - 34, 72, 46); g.fill();
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(sx + 8, sy + 28, 68, 8);
    }
    const tx = kx + kb / 2 + 60, ty = H - 70;
    if (tx + 60 < W) {
      g.fillStyle = mix([110, 78, 48], [52, 36, 22], dunkel); g.fillRect(tx, ty, 64, 6); g.fillRect(tx + 28, ty + 6, 8, 48); g.beginPath(); g.ellipse(tx + 32, H - 16, 22, 6, 0, 0, 6.29); g.fill();
      g.fillStyle = mix([240, 236, 226], [120, 116, 110], dunkel); g.beginPath(); g.ellipse(tx + 20, ty - 6, 10, 7, 0, 0, 6.29); g.fill(); g.fillRect(tx + 10, ty - 12, 20, 8);
      g.fillStyle = mix([230, 224, 210], [110, 106, 100], dunkel); g.beginPath(); g.arc(tx + 46, ty - 4, 7, 0, 6.29); g.fill();
    }
    return c;
  }
  const mix = (a, b, t) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t)))).join(',') + ')';
  function flamme(x, y, h, w, ph) {
    const fl = 1 + .12 * Math.sin(t * 8 + ph) + .06 * Math.sin(t * 17 + ph * 1.3);
    const neig = Math.sin(t * 1.1 + ph) * .08;
    const fh = h * fl, sx = x + neig * 10;
    ctx.beginPath(); ctx.moveTo(x - w * .2, y);
    for (let k = 1; k <= 10; k++) { const u = k / 10; ctx.lineTo(sx * u + x * (1 - u) - w * kerzeFlammenBreite(u) * .55, y - fh * u); }
    for (let k = 10; k >= 1; k--) { const u = k / 10; ctx.lineTo(sx * u + x * (1 - u) + w * kerzeFlammenBreite(u) * .55, y - fh * u); }
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, y, 0, y - fh); gr.addColorStop(0, 'rgba(255,150,40,.92)'); gr.addColorStop(.6, 'rgba(255,200,100,.95)'); gr.addColorStop(1, 'rgba(255,245,210,.3)');
    ctx.fillStyle = gr; ctx.fill();
    ctx.fillStyle = 'rgba(255,252,230,.85)'; ctx.beginPath(); ctx.ellipse(x, y - fh * .3, 1.4, fh * .22, 0, 0, 6.29); ctx.fill();
    return fl;
  }
  function bild(jetzt) {
    if (!laeuft) return;
    if (document.visibilityState === 'hidden' || (typeof _sr !== 'undefined' && _sr) || (typeof _leser !== 'undefined' && _leser)) { letzte = jetzt; setTimeout(() => requestAnimationFrame(bild), 500); return; }
    const dt = Math.min(.05, (jetzt - letzte) / 1000 || .016); letzte = jetzt; t += dt;
    if (messen() || !statisch) statisch = maleStatisch();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(statisch, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const l = licht(), dunkel = 1 - Math.min(1, l * 1.2);
    /* Wandleuchter links und rechts mit je zwei Flammen */
    for (const seite of [-1, 1]) {
      const x = seite < 0 ? Math.min(60, W * .06) : W - Math.min(60, W * .06), y = H * .3;
      ctx.fillStyle = '#8a6a2e'; ctx.fillRect(x - 4, y - 2, 8, 26); ctx.beginPath(); ctx.ellipse(x, y + 26, 12, 4, 0, 0, 6.29); ctx.fill();
      for (const dx of [-14, 14]) {
        ctx.strokeStyle = '#9c7a36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.quadraticCurveTo(x + dx * .7, y + 14, x + dx, y - 2); ctx.stroke();
        ctx.fillStyle = '#f3e7c6'; ctx.fillRect(x + dx - 3, y - 24, 6, 24);
        const fl = flamme(x + dx, y - 26, 14, 4.2, dx + seite * 3);
        kerzeSchein(ctx, x + dx, y - 34, 70 + 10 * fl, 90, [[0, 'rgba(255,180,90,' + (.22 + .14 * dunkel).toFixed(3) + ')'], [.5, 'rgba(255,160,70,' + (.08 + .06 * dunkel).toFixed(3) + ')'], [1, 'rgba(255,160,70,0)']]);
      }
      kerzeSchein(ctx, x, y - 10, W * .22, H * .5, [[0, 'rgba(255,190,110,' + (.1 + .14 * dunkel).toFixed(3) + ')'], [1, 'rgba(255,190,110,0)']]);
    }
    /* Das Kaminfeuer */
    const kx = W / 2, kb = Math.min(260, W * .36), kh = Math.min(150, (H * .28) * 1.1), ky = H - kh;
    const fy = H - 12;
    ctx.save(); ctx.beginPath(); ctx.rect(kx - kb * .34, ky + 26, kb * .68, kh - 30); ctx.clip();
    kerzeSchein(ctx, kx, fy - 10, kb * .7, kh * .9, [[0, 'rgba(255,150,60,.55)'], [.5, 'rgba(255,110,40,.25)'], [1, 'rgba(255,110,40,0)']]);
    ctx.fillStyle = '#3a2414'; for (const d of [-26, 0, 24]) { ctx.save(); ctx.translate(kx + d, fy - 6); ctx.rotate(d * .01); ctx.fillRect(-30, -5, 60, 10); ctx.restore(); }
    /* Spielt das Kaminknistern, brennt das Feuer höher */
    const kaminKlang = (D.einst && D.einst.ambience && D.einst.ambience.kamin) || 0;
    const hoch = 1 + Math.min(.7, kaminKlang * 1.2);
    /* Rauch: weiche graue Schwaden, die über den Flammen aufsteigen und sich auflösen */
    for (const s of rauch) {
      s.y -= s.v * dt * hoch; s.x += Math.sin(t * .8 + s.ph) * .002; if (s.y < 0) { s.y = .55 + zuf() * .2; s.x = .35 + zuf() * .3; }
      const px = kx - kb * .3 + s.x * kb * .6, py = ky + 26 + s.y * (kh - 40);
      ctx.fillStyle = 'rgba(120,110,104,' + (.09 * s.y * (1 - s.y) * 4).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(px, py, s.r * (1.6 - s.y), 0, 6.29); ctx.fill();
    }
    for (const [dx, h, w, ph] of [[-22, 44, 16, 1], [-8, 58, 20, 2], [8, 52, 18, 3], [24, 40, 14, 4], [0, 30, 10, 5], [-16, 26, 9, 6], [16, 24, 8, 7]]) flamme(kx + dx, fy - 10, h * hoch, w, ph);
    /* Glut auf den Scheiten: atmet */
    for (const [gx, gph] of [[-36, 0], [-18, 1.3], [-4, 2.1], [10, 2.9], [22, 3.7], [34, 4.6]]) {
      const a = .35 + .35 * Math.sin(t * 2.2 + gph) + .1 * Math.sin(t * 9 + gph * 2);
      kerzeSchein(ctx, kx + gx, fy - 8, 7, 4, [[0, 'rgba(255,140,50,' + a.toFixed(3) + ')'], [1, 'rgba(255,100,30,0)']]);
    }
    for (const f of funken) {
      f.y -= f.v * dt * hoch; f.x += Math.sin(t * 2 + f.ph) * .0015; if (f.y < 0) { f.y = 1; f.x = .3 + zuf() * .4; }
      const px = kx - kb * .3 + f.x * kb * .6, py = ky + 26 + f.y * (kh - 40);
      const fl = .45 + .55 * Math.abs(Math.sin(t * 9 + f.ph));
      ctx.fillStyle = 'rgba(255,' + Math.round(170 + 60 * fl) + ',110,' + (.75 * f.y * fl).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(px, py, f.r * (.6 + .4 * f.y), 0, 6.29); ctx.fill();
    }
    /* Hitzeflimmern über dem Feuer: ein heller, wandernder Schleier */
    ctx.fillStyle = 'rgba(255,200,120,' + (.05 + .03 * Math.sin(t * 5.3)).toFixed(3) + ')'; ctx.fillRect(kx - kb * .3, ky + 26, kb * .6, kh * .5);
    ctx.restore();
    /* Schein des Feuers auf Vertäfelung und Boden */
    const fl = 1 + .08 * Math.sin(t * 6.3) + .05 * Math.sin(t * 11.7);
    kerzeSchein(ctx, kx, H - 20, kb * 1.6 * fl, H * .5, [[0, 'rgba(255,160,70,' + (.16 + .16 * dunkel).toFixed(3) + ')'], [.6, 'rgba(255,140,60,' + (.05 + .06 * dunkel).toFixed(3) + ')'], [1, 'rgba(255,140,60,0)']]);
    /* Staub im Licht */
    for (const s of staub) {
      s.y += s.v * dt; s.x += Math.sin(t * .5 + s.ph) * .0004; if (s.y > 1) { s.y = 0; s.x = zuf(); }
      const a = (.12 + .12 * Math.sin(t * 1.4 + s.ph)) * (.4 + .6 * dunkel);
      ctx.fillStyle = 'rgba(255,236,200,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(s.x * W, s.y * H * .7, s.r, 0, 6.29); ctx.fill();
    }
    /* Tageslicht: am Tag ist alles heller, ein kühler Schleier von oben */
    if (l > .5) { ctx.fillStyle = 'rgba(235,240,250,' + (.08 * (l - .5) * 2).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H * .6); }
    requestAnimationFrame(bild);
  }
  return {
    start() { if (laeuft) return; laeuft = true; letzte = performance.now(); requestAnimationFrame(bild); },
    stopp() { laeuft = false; }
  };
}
