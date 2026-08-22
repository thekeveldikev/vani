/* ================================================================
   VANI — Die Kerze: brennt wirklich herunter.

   Früher war die Kerze ein elf Pixel schmaler Balken, der kleiner wurde.
   Jetzt steht eine echte Stumpenkerze im Schreibraum — gemalt, nicht gebaut:
   ein Körper aus Wachs mit Rinnsalen und Tropfnasen, ein Docht, eine Flamme,
   die kein Bild ist, sondern ein Stück Physik (drei überlagerte Schwingungen
   für das Züngeln, dazu eine Neigung, die auf Zug reagiert — jeder Anschlag
   ist ein kleiner Luftzug), ein warmer Schein ohne harte Kante, Ruß, wenn
   es zu wild wird, und am Ende ein Faden Rauch. Über die gewählte Zeit brennt
   sie sichtbar ab; das Wachs läuft und sammelt sich am Fuß.

   Die Techniken stammen aus der Talgkerze des PAPA-OS-Projekts (Canvas-
   Physik-Flamme, kantenfreier Schein, einmal gewürfelte Wachsbahnen) — hier
   neu und klein gebaut, ohne Abhängigkeiten.
   ================================================================ */

/* Ein radialer Verlauf ist kreisförmig; in eine Ellipse gefüllt, die nicht
   zum Verlauf passt, bricht er mitten im Wert ab — das ist die harte Kante.
   Hier wird der Kontext skaliert, sodass Verlauf und Form dieselbe Ellipse
   beschreiben. */
function kerzeSchein(ctx, cx, cy, rx, ry, stops) {
  if (!(rx > 0) || !(ry > 0)) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  for (const [p, f] of stops) g.addColorStop(p, f);
  ctx.fillStyle = g;
  ctx.fillRect(-rx * 1.02, -rx * 1.02, rx * 2.04, rx * 2.04);
  ctx.restore();
}

/* Flammenprofil: breit bei gut einem Drittel Höhe, dann weich auslaufend.
   (Linear auf null ergäbe ein Dreieck, keine Flamme.) */
function kerzeFlammenBreite(u) { return Math.pow(u, .35) * Math.pow(1 - u, .85) * 2.45 + .1; }

/* Zufall mit Saat — damit Wachsbahnen je Kerze gleich bleiben, statt zu zappeln. */
function kerzeZufall(saat) {
  let s = (saat >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* Reine Geometrie: wie hoch steht die Kerze nach einem Anteil der Zeit?
   Getestet — der Rest ist Malerei. */
function kerzeStand(anteil, maxHoehe = 150, minHoehe = 14) {
  const a = Math.max(0, Math.min(1, Number(anteil) || 0));
  return minHoehe + (maxHoehe - minHoehe) * (1 - a);
}

/* Baut die Kerze. Gibt Steuerung zurück; der Aufrufer hängt das Element ein. */
function kerzeAnzuenden({ minuten = 20, beiEnde = null, beiTipp = null, saat = 0 } = {}) {
  const W = 120, H = 270;
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  const canvas = el('canvas', { class: 'kerzenbuehne', width: String(W * dpr), height: String(H * dpr), title: 'Die Kerze — antippen für Zeit und Ausblasen' });
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const dauerMs = Math.max(1, minuten) * 60000;
  const start = Date.now();
  const zufall = kerzeZufall(saat || (start & 0xffff));
  const MAX_H = 150, MIN_H = 14, KB = 46, CX = 60, FUSS = 236;

  /* Wachsbahnen: einmal gewürfelt, dann stabil. */
  const bahnen = Array.from({ length: 7 }, (_, i) => ({
    seite: i % 2 ? 1 : -1, pos: .1 + zufall() * .8, anfang: zufall() * .2,
    laenge: .3 + zufall() * .55, breite: 1.2 + zufall() * 1.8, nase: zufall() < .6, ton: zufall()
  }));
  const tropfen = [];      /* dauerhafte Tropfnasen am Fuß */
  const russ = [];         /* aufsteigende Rußflocken */
  const rauch = [];        /* Rauchfaden nach dem Ausblasen */
  let laufender = null;    /* gerade herablaufender Tropfen */

  let phase = zufall() * 100, neigung = 0, neigungV = 0, zug = 0;
  let leben = 1;           /* 1 brennt, 0 aus */
  let aus = false, fertig = false, stopper = null;
  let letzte = performance.now(), bild = 0;

  const rest = () => Math.max(0, dauerMs - (Date.now() - start));
  const anteil = () => Math.min(1, (Date.now() - start) / dauerMs);

  function zeichne(jetzt) {
    const dt = Math.min(.05, (jetzt - letzte) / 1000); letzte = jetzt;
    phase += dt;
    /* Neigung: Feder zurück zur Senkrechten, Zug stößt sie an. */
    const zielNeigung = zug * .9 + Math.sin(phase * .7) * .08 * leben;
    neigungV += (zielNeigung - neigung) * 14 * dt - neigungV * 4.5 * dt;
    neigung += neigungV * dt * 6;
    zug *= Math.pow(.2, dt);
    const flacker = leben * (1 + .1 * Math.sin(phase * 9.3) + .07 * Math.sin(phase * 17.1 + 1.3) + .05 * Math.sin(phase * 31.7));
    const hoehe = kerzeStand(anteil(), MAX_H, MIN_H);
    const oben = FUSS - hoehe;
    const fh = 30 * flacker * (1 - Math.min(.45, Math.abs(neigung) * .5));
    const fw = 9.5 * (1 + Math.min(.3, Math.abs(neigung) * .3));
    const dochtX = CX, dochtY = oben - 2;
    const spitzeX = dochtX + neigung * 26;

    ctx.clearRect(0, 0, W, H);

    /* Schein — groß, weich, atmet mit der Flamme. */
    if (leben > 0) {
      const hell = flacker * leben;
      kerzeSchein(ctx, dochtX, dochtY - fh * .4, 70, 86, [
        [0, 'rgba(255,178,82,' + (.34 * hell).toFixed(3) + ')'],
        [.45, 'rgba(255,140,50,' + (.12 * hell).toFixed(3) + ')'],
        [1, 'rgba(255,120,40,0)']]);
    }

    /* Teller aus dunklem Eisen mit Wachsrand */
    ctx.save();
    ctx.fillStyle = '#3a3230';
    ctx.beginPath(); ctx.ellipse(CX, FUSS + 7, 44, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#524641';
    ctx.beginPath(); ctx.ellipse(CX, FUSS + 4, 40, 7, 0, 0, Math.PI * 2); ctx.fill();
    /* Wachssee auf dem Teller wächst mit dem Abbrand */
    const see = 8 + anteil() * 22;
    ctx.fillStyle = '#efe2c0';
    ctx.beginPath(); ctx.ellipse(CX, FUSS + 2, KB / 2 + see * .6, 3 + see * .18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* Körper: Wachs mit Licht von der Flamme her (oben hell, unten kühl) */
    const koerper = ctx.createLinearGradient(CX - KB / 2, 0, CX + KB / 2, 0);
    koerper.addColorStop(0, '#d9c79a'); koerper.addColorStop(.35, '#f3e6c6'); koerper.addColorStop(.7, '#efe0bd'); koerper.addColorStop(1, '#c9b68a');
    ctx.fillStyle = koerper;
    ctx.beginPath();
    ctx.moveTo(CX - KB / 2, FUSS);
    ctx.lineTo(CX - KB / 2, oben + 4);
    ctx.quadraticCurveTo(CX - KB / 2, oben - 1, CX - KB / 2 + 5, oben - 1);
    ctx.lineTo(CX + KB / 2 - 5, oben - 1);
    ctx.quadraticCurveTo(CX + KB / 2, oben - 1, CX + KB / 2, oben + 4);
    ctx.lineTo(CX + KB / 2, FUSS);
    ctx.closePath(); ctx.fill();
    /* Krater oben: dunkler, geschmolzen, leicht vertieft */
    ctx.fillStyle = 'rgba(120,90,40,.22)';
    ctx.beginPath(); ctx.ellipse(CX, oben + 1, KB / 2 - 3, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,225,150,.55)';
    ctx.beginPath(); ctx.ellipse(CX, oben + 1, KB / 2 - 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    /* Wachsbahnen: laufen vom Kraterrand herab, länger je weiter abgebrannt */
    for (const b of bahnen) {
      const x = CX + b.seite * (KB / 2 - 1.5) + b.seite * (b.pos - .5) * 3;
      const von = oben + 2 + b.anfang * 18;
      const bis = Math.min(FUSS - 1, von + (hoehe * b.laenge) * (.55 + anteil() * .7));
      ctx.strokeStyle = b.ton < .5 ? 'rgba(255,250,236,.9)' : 'rgba(236,221,185,.9)';
      ctx.lineWidth = b.breite; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, von); ctx.quadraticCurveTo(x + b.seite * .8, (von + bis) / 2, x, bis); ctx.stroke();
      if (b.nase) { ctx.fillStyle = 'rgba(255,250,236,.95)'; ctx.beginPath(); ctx.ellipse(x, bis, b.breite * 1.1, b.breite * 1.6, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    for (const t of tropfen) {
      ctx.fillStyle = 'rgba(250,240,214,.95)';
      ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r, t.r * 1.35, 0, 0, Math.PI * 2); ctx.fill();
    }
    /* Ein Tropfen, der gerade läuft */
    if (laufender) {
      laufender.y += dt * 22;
      ctx.fillStyle = 'rgba(255,248,226,.98)';
      ctx.beginPath(); ctx.ellipse(laufender.x, laufender.y, 2.2, 3.2, 0, 0, Math.PI * 2); ctx.fill();
      if (laufender.y >= FUSS - 2) { tropfen.push({ x: laufender.x, y: FUSS - 1, r: 2.4 + zufall() * 1.4 }); if (tropfen.length > 40) tropfen.shift(); laufender = null; }
    } else if (leben > 0 && zufall() < dt * .035) {
      laufender = { x: CX + (zufall() < .5 ? -1 : 1) * (KB / 2 + .5), y: oben + 6 };
    }
    /* Docht */
    ctx.strokeStyle = '#3b2e22'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(dochtX, oben + 1); ctx.quadraticCurveTo(dochtX + neigung * 3, oben - 4, dochtX + neigung * 5, oben - 7); ctx.stroke();
    ctx.fillStyle = leben > 0 ? '#ff9a3c' : '#6b5a48';
    ctx.beginPath(); ctx.arc(dochtX + neigung * 5, oben - 7, 1.4, 0, Math.PI * 2); ctx.fill();

    /* Flamme: Silhouette aus dem Profil, mit Zug gebogen; drinnen heller Kern */
    if (leben > 0) {
      const wob = (u) => (Math.sin(phase * 6.1 + u * 7) * .35 + Math.sin(phase * 11.3 + u * 13) * .2) * u;
      const form = (sw, sh) => {
        const bx = dochtX, by = dochtY - 4, N = 20;
        ctx.beginPath();
        ctx.moveTo(bx - fw * sw * kerzeFlammenBreite(.02), by);
        for (let k = 1; k <= N; k++) { const u = k / N; const cx3 = bx + (spitzeX - bx) * u * u + wob(u) * fw * 2; ctx.lineTo(cx3 - fw * sw * kerzeFlammenBreite(u), by - fh * sh * u); }
        for (let k = N; k >= 1; k--) { const u = k / N; const cx3 = bx + (spitzeX - bx) * u * u + wob(u) * fw * 2; ctx.lineTo(cx3 + fw * sw * kerzeFlammenBreite(u), by - fh * sh * u); }
        ctx.closePath();
      };
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      kerzeSchein(ctx, dochtX, dochtY - fh * .45, fh * 1.1, fh * 1.4, [[0, 'rgba(255,170,70,' + (.28 * leben).toFixed(3) + ')'], [.5, 'rgba(255,130,40,' + (.1 * leben).toFixed(3) + ')'], [1, 'rgba(255,120,40,0)']]);
      ctx.restore();
      ctx.save();
      form(1, 1);
      const gf = ctx.createLinearGradient(0, dochtY, 0, dochtY - fh);
      gf.addColorStop(0, 'rgba(255,150,40,' + (.85 * leben) + ')'); gf.addColorStop(.55, 'rgba(255,196,90,' + (.95 * leben) + ')'); gf.addColorStop(1, 'rgba(255,240,200,' + (.2 * leben) + ')');
      ctx.fillStyle = gf; ctx.fill();
      /* Der kleine blaue Saum unten — klein, sonst wird es Gasherd */
      form(.55, .22);
      ctx.fillStyle = 'rgba(120,160,255,' + (.35 * leben) + ')'; ctx.fill();
      /* Heller Kern */
      form(.45, .62);
      ctx.fillStyle = 'rgba(255,250,225,' + (.9 * leben) + ')'; ctx.fill();
      ctx.restore();
      /* Ruß bei starkem Zug */
      if (Math.abs(neigung) > .45 && zufall() < dt * 8) russ.push({ x: spitzeX + (zufall() - .5) * 6, y: dochtY - fh, vx: (zufall() - .5) * 10 + neigung * 14, vy: -28 - zufall() * 18, a: .5, r: .8 + zufall() * 1.4 });
    }
    for (let i = russ.length - 1; i >= 0; i--) {
      const p = russ[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.a -= dt * .35; p.r += dt * .8;
      if (p.a <= 0) { russ.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(40,32,28,' + p.a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    /* Rauch nach dem Ausblasen: eine Kette weicher Punkte, die wandert */
    if (aus) {
      if (leben <= 0 && rauch.length < 40 && zufall() < dt * 14) rauch.push({ x: dochtX, y: oben - 8, t: 0, drift: (zufall() - .5) * 12 });
      for (let i = rauch.length - 1; i >= 0; i--) {
        const r = rauch[i]; r.t += dt; r.y -= dt * 22; r.x += Math.sin(r.t * 2.2 + i) * dt * 9 + r.drift * dt;
        const a = Math.max(0, .32 - r.t * .07);
        if (a <= 0) { rauch.splice(i, 1); continue; }
        ctx.fillStyle = 'rgba(120,110,100,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(r.x, r.y, 2 + r.t * 3.2, 0, Math.PI * 2); ctx.fill();
      }
    }
    /* Restzeit, klein unter dem Teller */
    const m = Math.ceil(rest() / 60000);
    ctx.fillStyle = 'rgba(120,100,70,.85)';
    ctx.font = '11px ui-rounded, -apple-system, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(leben > 0 ? (m > 1 ? 'noch ' + m + ' Min' : 'gleich') : 'ausgebrannt', CX, FUSS + 28);
  }

  function schleife(jetzt) {
    if (fertig) return;
    /* 30 Bilder je Sekunde genügen für Feuer — und schonen den Akku. */
    if (jetzt - bild >= 32) { bild = jetzt; try { zeichne(jetzt); } catch (e) {} }
    if (!aus && rest() <= 0) { ausblasen(false); }
    if (leben > 0 || rauch.length || russ.length) requestAnimationFrame(schleife);
    else fertig = true;
  }

  function ausblasen(vonHand) {
    if (aus) return;
    aus = true;
    const t0 = performance.now();
    const verglimmen = () => {
      leben = Math.max(0, 1 - (performance.now() - t0) / (vonHand ? 260 : 900));
      if (leben > 0) requestAnimationFrame(verglimmen);
      else if (!vonHand && beiEnde) { try { beiEnde(); } catch (e) {} }
    };
    verglimmen();
    zug += vonHand ? 1.6 : .3;
    /* Rauch darf noch zwei, drei Sekunden stehen, dann geht das Element. */
    stopper = setTimeout(() => { fertig = true; canvas.remove(); }, vonHand ? 1800 : 4200);
  }

  canvas.addEventListener('click', () => { if (beiTipp) beiTipp(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { letzte = performance.now(); if (!fertig) requestAnimationFrame(schleife); } });
  requestAnimationFrame((t) => { letzte = t; schleife(t); });

  return {
    element: canvas,
    /* Jeder Anschlag ein kleiner Luftzug. Richtung wechselt, damit sie tanzt. */
    puste: (staerke = .25) => { zug += (zufall() < .5 ? -1 : 1) * staerke; },
    rest, anteil,
    brennt: () => !aus,
    ausblasen: () => ausblasen(true),
    entfernen: () => { fertig = true; clearTimeout(stopper); canvas.remove(); }
  };
}
