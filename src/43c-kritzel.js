/* ================================================================
   VANI — Kritzeln, zweiter Teil: reine Geometrie.

   Striche sind Punktfolgen, keine Pixel. Darum lassen sie sich nachträglich
   greifen (Lasso), verschieben, löschen, umfärben — und ein Strich, bei dem
   der Stift am Ende kurz stehen bleibt, wird zur Form: Linie, Ellipse oder
   Rechteck. Alles hier ist pur und wird einzeln geprüft; das Zeichnen selbst
   steht in starteKritzeln.
   ================================================================ */

/* Punkt im Polygon (Strahlmethode). Polygon als Liste {x,y}. */
function punktInPolygon(p, poly) {
  if (!p || !Array.isArray(poly) || poly.length < 3) return false;
  let drin = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a.y > p.y) !== (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / ((b.y - a.y) || 1e-12) + a.x)) drin = !drin;
  }
  return drin;
}

/* Umriss eines Strichs (oder mehrerer). */
function strichBox(striche) {
  const liste = Array.isArray(striche) ? striche : [striche];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of liste) for (const p of (s && s.punkte) || []) {
    if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
  }
  return x0 === Infinity ? null : { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

/* Welche Striche liegen im Lasso? Ein Strich zählt, wenn mehr als die Hälfte
   seiner Punkte drin liegt — so greift man nicht versehentlich ganze
   Nachbarlinien, nur weil ein Ende hineinragt. Löschmarken und Radierer-
   striche werden nie gegriffen. */
function stricheImLasso(striche, poly) {
  const aus = [];
  (striche || []).forEach((s, i) => {
    if (!s || s.leeren || s.radierer || !Array.isArray(s.punkte) || !s.punkte.length) return;
    let drin = 0;
    for (const p of s.punkte) if (punktInPolygon(p, poly)) drin++;
    if (drin * 2 > s.punkte.length) aus.push(i);
  });
  return aus;
}

/* Verschiebt Striche (Indizes) um dx, dy — gibt neue Objekte zurück. */
function stricheVerschieben(striche, indizes, dx, dy) {
  const menge = new Set(indizes);
  return striche.map((s, i) => menge.has(i) && s.punkte
    ? { ...s, punkte: s.punkte.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) }
    : s);
}

/* Form erkennen: Linie, wenn der Strich nahe an seiner Sehne bleibt; Ellipse,
   wenn er sich schließt und rund um seine Mitte liegt; Rechteck, wenn er sich
   schließt und seine Punkte an den Kanten des Umrisses kleben. Sonst null. */
function formErkennen(punkte) {
  const p = (punkte || []).filter((q) => q && Number.isFinite(q.x) && Number.isFinite(q.y));
  if (p.length < 6) return null;
  const box = strichBox({ punkte: p });
  const diag = Math.hypot(box.w, box.h);
  if (diag < .02) return null;
  const w = p.reduce((n, q) => n + (q.w || 0), 0) / p.length || .004;
  const a = p[0], z = p[p.length - 1];
  const geschlossen = Math.hypot(z.x - a.x, z.y - a.y) < .18 * diag;
  if (!geschlossen) {
    const sehne = Math.hypot(z.x - a.x, z.y - a.y);
    if (sehne < .02) return null;
    let maxAbstand = 0;
    for (const q of p) {
      const t = ((q.x - a.x) * (z.x - a.x) + (q.y - a.y) * (z.y - a.y)) / (sehne * sehne);
      const fx = a.x + (z.x - a.x) * t, fy = a.y + (z.y - a.y) * t;
      maxAbstand = Math.max(maxAbstand, Math.hypot(q.x - fx, q.y - fy));
    }
    if (maxAbstand / sehne < .09) return { art: 'linie', punkte: [{ x: a.x, y: a.y, w }, { x: z.x, y: z.y, w }] };
    return null;
  }
  const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
  const rx = Math.max(.004, box.w / 2), ry = Math.max(.004, box.h / 2);
  /* Rund? Normierter Abstand zur Mitte soll nahe 1 liegen. */
  let summe = 0, summe2 = 0;
  for (const q of p) { const r = Math.hypot((q.x - cx) / rx, (q.y - cy) / ry); summe += r; summe2 += r * r; }
  const mittel = summe / p.length, streuung = Math.sqrt(Math.max(0, summe2 / p.length - mittel * mittel));
  /* Eckig? Punkte kleben an den Kanten des Umrisses. */
  let anKante = 0;
  const rand = .12;
  for (const q of p) {
    const nx = Math.abs(q.x - cx) / rx, ny = Math.abs(q.y - cy) / ry;
    if (nx > 1 - rand || ny > 1 - rand) anKante++;
  }
  const kantenAnteil = anKante / p.length;
  /* Erst das Eckige prüfen: ein Rechteck liegt auch „rund" um seine Mitte
     (Abstand 1 bis √2), aber ein Kreis klebt nur zu gut 60 % an den Kanten. */
  if (kantenAnteil > .82) {
    return { art: 'rechteck', punkte: [
      { x: box.x0, y: box.y0, w }, { x: box.x1, y: box.y0, w }, { x: box.x1, y: box.y1, w }, { x: box.x0, y: box.y1, w }, { x: box.x0, y: box.y0, w }
    ] };
  }
  if (streuung < .12 && mittel > .8) {
    const aus = [];
    for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI * 2; aus.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry, w }); }
    return { art: 'ellipse', punkte: aus };
  }
  return null;
}

/* Punkte ausdünnen, damit gespeicherte Striche klein bleiben: Punkte, die
   dem vorigen näher als ein Hauch sind, fallen weg; Anfang und Ende bleiben. */
function strichVerdichten(s, mindest = .0018) {
  if (!s || !Array.isArray(s.punkte) || s.punkte.length < 3) return s;
  const aus = [s.punkte[0]];
  for (let i = 1; i < s.punkte.length - 1; i++) {
    const v = aus[aus.length - 1], q = s.punkte[i];
    if (Math.hypot(q.x - v.x, q.y - v.y) >= mindest) aus.push(q);
  }
  aus.push(s.punkte[s.punkte.length - 1]);
  return { ...s, punkte: aus };
}

/* Gliederung aus Überschriften eines formatierten Textes: h1–h3, in
   Reihenfolge, ohne Tags. Pur (Regex), weil unser Rich-HTML aufgeräumt ist. */
function gliederungAusHTML(html) {
  const aus = [];
  const re = /<h([1-3])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(String(html || ''))) && aus.length < 400) {
    const text = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    if (text) aus.push({ ebene: Number(m[1]), text: text.slice(0, 120) });
  }
  return aus;
}

/* Was in ein Dokument darf: begrenzt, bereinigt, nie mehr als das Budget. */
function saubereStriche(roh, maxStriche = 4000, maxPunkte = 24000) {
  if (!Array.isArray(roh)) return [];
  const aus = [];
  let punkte = 0;
  for (const s of roh.slice(-maxStriche)) {
    if (!s || typeof s !== 'object') continue;
    if (s.leeren) { aus.length = 0; punkte = 0; continue; }   /* ein Löschen davor macht alles Frühere unnötig */
    if (!Array.isArray(s.punkte) || !s.punkte.length) continue;
    const farbe = typeof s.farbe === 'string' && /^(#[0-9a-f]{3,8}|[a-z]{1,20}|rgba?\([\d.,\s%]{1,40}\))$/i.test(s.farbe) ? s.farbe : '#000';
    const p = [];
    for (const q of s.punkte) {
      if (!q || typeof q !== 'object') continue;
      const x = Number(q.x), y = Number(q.y), w = Number(q.w);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      p.push({ x: Math.max(-1, Math.min(2, x)), y: Math.max(-1, Math.min(3, y)), w: Number.isFinite(w) ? Math.max(.0005, Math.min(.2, w)) : .004 });
      if (p.length >= 4000) break;
    }
    if (!p.length) continue;
    punkte += p.length;
    aus.push({ farbe, radierer: s.radierer === true, punkte: p });
  }
  /* Über dem Budget fallen die ältesten Striche weg — die neuesten zählen. */
  while (punkte > maxPunkte && aus.length) punkte -= aus.shift().punkte.length;
  return aus;
}
