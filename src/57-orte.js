/* ===================== 57 — RÄUME ALS ORTE =====================
   Jeder Raum bekommt eine Kulisse und eine Haut: das Zuhause wird Diele, die
   Schnipsel ein Zettelkasten, die Blätter ein Schreibtisch mit Papierstapel,
   die Hefte ein Lesetisch mit Schreibmaschine, die Projekte eine Korkwand,
   das Cluster ein Küchentisch, die Wörter ein Setzkasten, der Klang ein
   Musikzimmer, der Faden eine Telefonbank, die Feinheiten ein Werkzeugkasten.
   Alles ist zuschaltbar (Feinheiten → „Räume als Orte“), standardmäßig aus,
   je Raum einzeln. In den Kulissen lebt es: kleine Bewegungen (abschaltbar)
   und Dinge, die reagieren, wenn man sie antippt. */

const ORTE_RAEUME = [
  ['zuhause', 'Zuhause als Diele'], ['schnipsel', 'Schnipsel als Zettelkasten'], ['blaetter', 'Blätter als Papierstapel'],
  ['hefte', 'Hefte mit Lesetisch und Schreibmaschine'], ['projekte', 'Projekte als Korkwand'], ['cluster', 'Cluster am Küchentisch'],
  ['woerter', 'Wörter als Setzkasten'], ['klang', 'Klang als Musikzimmer'], ['faden', 'Faden als Telefonbank'], ['feinheiten', 'Feinheiten als Werkzeugkasten']
];
const ORTE_SPIEGELZEILE = 'Heute: ein Satz reicht.';
/* Einstellungen säubern: an (Hauptschalter, Standard aus), tueren, geraeusche, raumklang,
   bewegung (kleine Animationen, Standard an), spiegelZeile (Edding auf dem Spiegel),
   spiegelKamera (die Innenkamera zeigt ein nebliges Spiegelbild, Standard aus), je Raum. Pur. */
function saubereOrte(roh) {
  const q = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  const o = { an: q.an === true, tueren: q.tueren !== false, geraeusche: q.geraeusche === true, raumklang: q.raumklang === true, bewegung: q.bewegung !== false, spiegelKamera: q.spiegelKamera === true, katzeTon: q.katzeTon !== false };
  o.spiegelZeile = typeof q.spiegelZeile === 'string' ? q.spiegelZeile.replace(/[\r\n]+/g, ' ').slice(0, 60) : ORTE_SPIEGELZEILE;
  o.katzeName = typeof q.katzeName === 'string' && q.katzeName.trim() ? q.katzeName.replace(/[\r\n]+/g, ' ').trim().slice(0, 24) : (typeof KATZE_STANDARD_NAME !== 'undefined' ? KATZE_STANDARD_NAME : 'Die Katze');
  for (const [id] of ORTE_RAEUME) o[id] = q[id] !== false;
  return o;
}
/* Welcher Ort zu einem Routen-Raum gehört (heft → hefte usw.). Pur. */
function orteRaumFuer(raum) { return { heft: 'hefte', projekt: 'projekte', brett: 'cluster' }[raum] || raum; }
function orteAktiv(raum) {
  const o = saubereOrte(D.einst.orte), r = orteRaumFuer(raum);
  return o.an && o[r] === true && ORTE_RAEUME.some((x) => x[0] === r);
}
/* Text fürs SVG entschärfen. Pur. */
function orteText(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
/* Zeilen für eine schmale Papierfläche umbrechen. Pur. */
function orteUmbruch(text, breite, maxZeilen) {
  const w = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); const zeilen = []; let z = '';
  for (const x of w) { if ((z + ' ' + x).trim().length > breite && z) { zeilen.push(z); z = x; if (zeilen.length >= maxZeilen) break; } else z = (z + ' ' + x).trim(); }
  if (z && zeilen.length < maxZeilen) zeilen.push(z);
  if (w.join(' ').length > zeilen.join(' ').length && zeilen.length) zeilen[zeilen.length - 1] = zeilen[zeilen.length - 1].replace(/.{0,2}$/, '…');
  return zeilen;
}

/* ----- Gestaltung v2: eine zweite Malschicht fuer die Diele -----
   Unter den Dingen: Damasttapete, Vertaefelung mit Stuhlleiste, ein
   Lichtfleck auf den Dielen, Kontaktschatten. Ueber den Dingen: ein Glanz,
   der ueber den Spiegel wandert. Alles ohne Zeiger (pointer-events none),
   damit jedes antippbare Ding antippbar bleibt. Nur mit Gestaltung v2. */
function orteV2An() { return typeof document !== 'undefined' && document.documentElement && document.documentElement.dataset.v2 === 'an'; }
function orteV2DieleUnten() {
  if (!orteV2An()) return '';
  const zier = '<path d="M20 5c4.5 5 9.5 7.5 9.5 13.5S24.5 28 20 32c-4.5-4-9.5-7.5-9.5-13.5S15.5 10 20 5z" fill="none" stroke="#ffe8c8" stroke-width=".9"/>' +
    '<path d="M20 13c2 2.6 4.2 3.8 4.2 6s-2.2 3.6-4.2 5.6c-2-2-4.2-3.4-4.2-5.6s2.2-3.4 4.2-6z" fill="#ffe8c8" opacity=".5"/>' +
    '<circle cx="0" cy="40" r="1.5" fill="#ffe8c8"/><circle cx="40" cy="40" r="1.5" fill="#ffe8c8"/>';
  return '<defs><pattern id="ortDamast" width="40" height="44" patternUnits="userSpaceOnUse">' + zier + '</pattern>' +
    '<linearGradient id="ortDielenlicht" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff0cc" stop-opacity="0"/><stop offset=".3" stop-color="#fff0cc" stop-opacity=".22"/><stop offset=".5" stop-color="#fff0cc" stop-opacity="0"/></linearGradient></defs>' +
    '<g pointer-events="none">' +
    '<rect width="800" height="112" fill="url(#ortDamast)" opacity=".11"/>' +
    /* Vertaefelung: Stuhlleiste und Felder */
    '<rect x="0" y="82" width="800" height="3" fill="#e2d2ad" opacity=".55"/><rect x="0" y="85" width="800" height="1" fill="rgba(0,0,0,.25)"/>' +
    Array.from({ length: 10 }, (_, i) => '<rect x="' + (i * 80 + 8) + '" y="89" width="64" height="19" rx="1.5" fill="rgba(0,0,0,.06)" stroke="rgba(255,232,200,.14)" stroke-width="1"/>').join('') +
    '<rect x="0" y="120" width="800" height="30" fill="url(#ortDielenlicht)"/>' +
    '<g fill="rgba(0,0,0,.32)"><ellipse cx="130" cy="121" rx="22" ry="2.6"/><ellipse cx="540" cy="129" rx="40" ry="3.2"/><ellipse cx="631" cy="121" rx="8" ry="1.8"/><ellipse cx="769" cy="121" rx="8" ry="1.8"/><ellipse cx="722" cy="122" rx="28" ry="3"/></g>' +
    '</g>';
}
function orteV2DieleOben() {
  if (!orteV2An()) return '';
  return '<defs><clipPath id="ortSpiegelGlas"><ellipse cx="540" cy="72" rx="44" ry="54"/></clipPath></defs>' +
    '<g pointer-events="none" clip-path="url(#ortSpiegelGlas)"><rect class="ort-glanz" x="470" y="-10" width="18" height="170" fill="rgba(255,255,255,.42)" transform="rotate(22 540 72)"/></g>';
}

/* ----- Gestaltung v2: neu ausgemalt (5.65) -----
   Zwei Malschichten je Kulisse, deckungsgleich mit dem Buehnenbild:
   „unten“ liegt zwischen Hintergrund und Dingen (Schlagschatten, Maserung,
   Struktur, Licht an der Wand), „oben“ ueber den Dingen (Rundung, Glanz,
   Kanten, Eigenschatten). Keine Bewegung, keine Zeiger. */
function orteV2Malerei(r, ebene) {
  if (!orteV2An()) return '';
  const S = (x, y, w, h, a, rx) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 3) + '" fill="rgba(20,10,0,' + a + ')"/>';
  const E = (cx, cy, rx, ry, a, f) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (f || 'rgba(20,10,0,' + a + ')') + '"/>';
  const L = (d, farbe, b) => '<path d="' + d + '" fill="none" stroke="' + farbe + '" stroke-width="' + (b || 1) + '" stroke-linecap="round"/>';
  const verlauf = (id, x1, y1, x2, y2, stops) => '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(([o, c]) => '<stop offset="' + o + '" stop-color="' + c + '"/>').join('') + '</linearGradient>';
  const kugel = (id, licht, mitte, rand) => '<radialGradient id="' + id + '" cx=".36" cy=".32" r=".72"><stop offset="0" stop-color="' + licht + '"/><stop offset=".55" stop-color="' + mitte + '"/><stop offset="1" stop-color="' + rand + '"/></radialGradient>';
  const rund = verlauf('v2mRund', 0, 0, 1, 0, [[0, 'rgba(255,255,255,.22)'], [.4, 'rgba(255,255,255,0)'], [.75, 'rgba(0,0,0,.12)'], [1, 'rgba(0,0,0,.3)']]);
  const oben2 = verlauf('v2mOben', 0, 0, 0, 1, [[0, 'rgba(255,255,255,.28)'], [.45, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.22)']]);
  const holz = (x, y, w, h, n, a) => '<g stroke="rgba(40,20,5,' + a + ')" fill="none" stroke-width=".8">' + Array.from({ length: n }, (_, i) => { const yy = y + (i + .5) * h / n; return '<path d="M' + x + ' ' + yy.toFixed(1) + ' C ' + (x + w * .3) + ' ' + (yy + (i % 2 ? 2.4 : -2.4)).toFixed(1) + ', ' + (x + w * .62) + ' ' + (yy + (i % 3 ? -1.6 : 1.8)).toFixed(1) + ', ' + (x + w) + ' ' + (yy + .8).toFixed(1) + '"/>'; }).join('') + '</g>';
  const defs = (inhalt) => '<defs>' + rund + oben2 + inhalt + '</defs>';

  if (r === 'zuhause') {
    if (ebene === 'unten') return '';   /* unten malt orteV2DieleUnten */
    return defs(kugel('v2mUhrglas', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.05)', 'rgba(0,0,0,.18)') +
      verlauf('v2mGoldring', 0, 0, 1, 1, [[0, '#fff1c4'], [.35, 'rgba(201,162,90,0)'], [.7, 'rgba(90,60,20,.0)'], [1, 'rgba(90,60,20,.45)']])) +
      '<ellipse cx="540" cy="72" rx="48" ry="58" fill="none" stroke="url(#v2mGoldring)" stroke-width="5"/>' +
      '<rect x="40" y="26" width="300" height="10" rx="3" fill="url(#v2mOben)"/>';
  }
  if (r === 'schnipsel') {
    if (ebene === 'unten') return defs('') +
      '<rect x="0" y="0" width="800" height="124" fill="url(#v2mOben)" opacity=".5"/>' +
      S(46, 66, 720, 70, .2, 8) + S(30, 124, 742, 8, .28, 4) +
      E(120, 36, 22, 3, .25) + E(318, 139, 14, 2, .2) + E(560, 136, 46, 3, .22);
    if (ebene === 'oben') return defs('') + '<rect x="0" y="0" width="800" height="60" fill="url(#v2mOben)" opacity=".3"/>' + L('M0 124.6 H800', 'rgba(255,236,200,.35)', 1) + E(400, 6, 300, 6, 0, 'rgba(255,240,210,.12)');
    /* 'mitte': der Glanz am Kasten liegt UNTER den Reitern (5.66) — darueber sahen sie durchscheinend aus */
    return defs(verlauf('v2mKasten', 0, 0, 1, 0, [[0, 'rgba(255,230,190,.14)'], [.5, 'rgba(255,230,190,0)'], [1, 'rgba(0,0,0,.24)']]) +
      verlauf('v2mMessing', 0, 0, 0, 1, [[0, '#fff1c6'], [.5, 'rgba(201,162,90,0)'], [1, 'rgba(90,60,20,.5)']])) +
      '<rect x="40" y="60" width="720" height="68" rx="6" fill="url(#v2mKasten)"/>' +
      holz(46, 100, 708, 26, 4, .16) +
      L('M44 60.6 H756', 'rgba(255,236,200,.4)', 1) + L('M42 127.4 H758', 'rgba(0,0,0,.4)', 1.2) +
      Array.from({ length: 22 }, (_, i) => L('M' + (60 + i * 31) + ' ' + (70.6 + (i % 3)) + ' h26', 'rgba(255,255,255,.7)', .8) + L('M' + (86 + i * 31) + ' ' + (71 + (i % 3)) + ' v51', 'rgba(0,0,0,.14)', 1.2)).join('') +
      '<rect x="372" y="84" width="56" height="12" rx="2" fill="url(#v2mMessing)" opacity=".7"/><rect x="380" y="98" width="40" height="6" rx="3" fill="url(#v2mMessing)" opacity=".8"/>';
  }
  if (r === 'blaetter') {
    if (ebene === 'unten') return defs('') +
      '<rect x="0" y="0" width="800" height="112" fill="url(#v2mOben)" opacity=".35"/>' +
      E(404, 120, 150, 7, .22) + E(204, 123, 52, 3.4, .22) + E(690, 116, 22, 3, .3) + E(634, 119, 16, 2.4, .2) +
      holz(0, 116, 800, 32, 5, .14);
    return defs(verlauf('v2mStift', 0, 0, 0, 1, [[0, 'rgba(255,255,255,.45)'], [.45, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.3)']]) +
      verlauf('v2mGlasT', 0, 0, 1, 0, [[0, 'rgba(255,255,255,.3)'], [.25, 'rgba(255,255,255,0)'], [.8, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.35)']])) +
      /* Papierkanten am Stapel, Eselsohr mit Schatten */
      [0, 1, 2, 3].map((i) => L('M' + (272 + i * 2) + ' ' + (119 - i * 4) + ' H' + (528 + i * 2), 'rgba(160,140,100,.35)', .7)).join('') +
      '<rect x="620" y="106" width="26" height="12" rx="2" fill="url(#v2mOben)" transform="rotate(8 633 112)"/>';
  }
  if (r === 'hefte') {
    if (ebene === 'unten') return defs(kugel('v2mLampenwand', 'rgba(255,214,140,.5)', 'rgba(255,214,140,.12)', 'rgba(255,214,140,0)')) +
      '<ellipse cx="121" cy="60" rx="150" ry="80" fill="url(#v2mLampenwand)"/>' +
      holz(0, 116, 800, 32, 5, .16) +
      E(232, 114, 48, 3, .3) + E(402, 115, 76, 4, .32) + E(562, 115, 22, 2.6, .3) + E(642, 115, 30, 2.4, .2) + E(732, 114, 26, 3, .3) + E(121, 115, 26, 4, .3);
    return defs(verlauf('v2mSchirm', 0, 0, 1, 0, [[0, 'rgba(255,255,255,.25)'], [.3, 'rgba(255,255,255,.05)'], [.7, 'rgba(0,0,0,.08)'], [1, 'rgba(0,0,0,.3)']]) +
      verlauf('v2mMasch', 0, 0, 0, 1, [[0, 'rgba(255,255,255,.18)'], [.4, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.25)']])) +
      /* Glanz der Dinge haengt seit 5.66 an den Dingen selbst; hier nur noch Licht im Raum */
      '<rect x="0" y="0" width="800" height="112" fill="url(#v2mMasch)" opacity=".35"/>' + L('M0 112.6 H800', 'rgba(255,236,200,.35)', 1);
  }
  if (r === 'projekte') {
    if (ebene === 'unten') return defs('') +
      '<rect x="0" y="0" width="800" height="150" fill="url(#v2mOben)" opacity=".35"/>' +
      [[120, 40], [300, 58], [500, 36], [660, 62]].map(([x, y]) => S(x + 4, y + 5, 90, 56, .2, 2)).join('') +
      S(392, 97, 64, 54, .2, 2) + S(210, 100, 60, 50, .18, 2) + Array.from({ length: Math.min(3, vomTyp('projekt').length) }, (_, i) => S(584 + i * 60, 104, 52, 46, .16, 2)).join('') +
      '<path d="M167 47 Q 262 23 347 65 T 547 43 T 707 69" fill="none" stroke="rgba(30,10,0,.22)" stroke-width="1.6"/>';
    return defs(kugel('v2mNadel', '#ff9a8a', '#c0392b', '#6e1a12')) +
      [[165, 44], [345, 62], [545, 40], [705, 66], [236, 98], [60, 90]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="url(#v2mNadel)"/><circle cx="' + (x - 1.6) + '" cy="' + (y - 1.8) + '" r="1.3" fill="rgba(255,255,255,.8)"/>').join('') +
      '<rect x="0" y="0" width="800" height="6" fill="url(#v2mOben)"/><rect x="0" y="144" width="800" height="6" fill="url(#v2mOben)"/>';
  }
  if (r === 'cluster') {
    if (ebene === 'unten') return defs(kugel('v2mTischlicht', 'rgba(255,236,200,.35)', 'rgba(255,236,200,.08)', 'rgba(255,236,200,0)')) +
      '<ellipse cx="420" cy="40" rx="420" ry="120" fill="url(#v2mTischlicht)"/>' +
      holz(0, 0, 800, 150, 14, .12) +
      [[120, 30, 4, 9], [650, 42, 5, 11]].map(([x, y, rx, ry]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="rgba(60,35,15,.16)" stroke-width="1"/><ellipse cx="' + x + '" cy="' + y + '" rx="' + (rx * .45) + '" ry="' + (ry * .5) + '" fill="rgba(60,35,15,.22)"/>').join('') +
      '<g transform="rotate(-2 400 80)">' + S(268, 30, 276, 112, .22, 2) + '</g>' +
      '<g transform="rotate(-6 120 70)">' + S(94, 55, 60, 40, .2, 1) + '</g><g transform="rotate(5 180 110)">' + S(154, 97, 60, 40, .2, 1) + '</g>' +
      E(718, 128, 13, 3, .25) + E(42, 54, 18, 3, .25);
    return defs(verlauf('v2mFalz', 0, 0, 1, 0, [[0, 'rgba(0,0,0,0)'], [.42, 'rgba(0,0,0,0)'], [.5, 'rgba(60,40,10,.22)'], [.58, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']]) +
      kugel('v2mKeks', 'rgba(255,230,170,.5)', 'rgba(255,230,170,0)', 'rgba(80,40,10,.35)')) +
      /* Glanz der Dinge haengt seit 5.66 an den Dingen selbst */
      '<rect x="0" y="0" width="800" height="150" fill="url(#v2mOben)" opacity=".18"/>' + L('M0 .6 H800', 'rgba(255,240,210,.3)', 1);
  }
  if (r === 'woerter') {
    if (ebene === 'unten') return defs('') +
      S(46, 26, 540, 120, .35, 5) + S(626, 70, 160, 70, .25, 2) + E(690, 52, 42, 4, .35);
    return defs(verlauf('v2mLetter', 0, 0, 0, 1, [[0, 'rgba(255,255,255,.3)'], [.35, 'rgba(255,255,255,.04)'], [1, 'rgba(0,0,0,.35)']]) +
      verlauf('v2mRahmen', 0, 0, 0, 1, [[0, 'rgba(255,230,190,.35)'], [.08, 'rgba(255,230,190,0)'], [.92, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.4)']])) +
      '<rect x="40" y="20" width="540" height="116" rx="4" fill="url(#v2mRahmen)"/>' +
      holz(40, 20, 540, 6, 1, .25) + holz(40, 130, 540, 6, 1, .25) +
      L('M622 65 H778', 'rgba(255,255,255,.5)', .8);
  }
  if (r === 'klang') {
    if (ebene === 'unten') return defs(kugel('v2mKerzenwand', 'rgba(255,190,110,.4)', 'rgba(255,190,110,.1)', 'rgba(255,190,110,0)')) +
      '<ellipse cx="590" cy="80" rx="150" ry="90" fill="url(#v2mKerzenwand)"/>' +
      '<g stroke="rgba(255,220,170,.05)" stroke-width="18">' + Array.from({ length: 9 }, (_, i) => '<line x1="' + (i * 96 + 20) + '" y1="0" x2="' + (i * 96 + 20) + '" y2="118"/>').join('') + '</g>' +
      holz(0, 122, 800, 26, 4, .18) +
      S(254, 116, 176, 8, .35, 4) + E(132, 122, 66, 3.5, .3) + E(700, 122, 30, 3, .3) + E(590, 121, 16, 2.5, .3);
    return defs(verlauf('v2mKasten2', 0, 0, 0, 1, [[0, 'rgba(255,220,170,.28)'], [.15, 'rgba(255,220,170,0)'], [1, 'rgba(0,0,0,.3)']]) +
      verlauf('v2mWachs', 0, 0, 1, 0, [[0, 'rgba(255,255,255,.5)'], [.4, 'rgba(255,255,255,0)'], [1, 'rgba(120,80,30,.25)']])) +
      /* Glanz der Dinge haengt seit 5.66 an den Dingen selbst; hier das Licht im Raum */
      '<rect x="0" y="0" width="800" height="118" fill="url(#v2mKasten2)" opacity=".5"/>' + L('M0 118.6 H800', 'rgba(255,220,170,.4)', 1);
  }
  if (r === 'faden') {
    if (ebene === 'unten') return defs(kugel('v2mLampenwand2', 'rgba(255,214,140,.45)', 'rgba(255,214,140,.1)', 'rgba(255,214,140,0)')) +
      '<ellipse cx="160" cy="50" rx="160" ry="90" fill="url(#v2mLampenwand2)"/>' +
      '<rect x="0" y="96" width="800" height="30" fill="rgba(0,0,0,.08)"/>' + L('M0 96 H800', 'rgba(255,232,200,.18)', 2) +
      holz(0, 130, 800, 18, 3, .18) +
      E(400, 129, 160, 4, .3) + E(625, 96, 40, 3, .3) + E(160, 129, 26, 4, .3) + E(740, 129, 24, 3, .3);
    return defs(verlauf('v2mPolster', 0, 0, 0, 1, [[0, 'rgba(255,220,180,.3)'], [.3, 'rgba(255,220,180,0)'], [1, 'rgba(0,0,0,.28)']]) +
      kugel('v2mBakelit', 'rgba(255,255,255,.35)', 'rgba(255,255,255,0)', 'rgba(0,0,0,.2)')) +
      /* Glanz der Dinge haengt seit 5.66 an den Dingen selbst */
      '<rect x="0" y="0" width="800" height="126" fill="url(#v2mPolster)" opacity=".3"/>' + L('M0 126.6 H800', 'rgba(255,232,200,.3)', 1);
  }
  if (r === 'feinheiten') {
    if (ebene === 'unten') return defs('') +
      '<g fill="rgba(255,255,255,.12)">' + Array.from({ length: 60 }, (_, i) => '<circle cx="' + (20 + (i % 20) * 40) + '" cy="' + (17.6 + Math.floor(i / 20) * 30) + '" r="1.8"/>').join('') + '</g>' +
      '<rect x="0" y="0" width="800" height="118" fill="url(#v2mOben)" opacity=".5"/>' +
      holz(0, 122, 800, 26, 4, .2) +
      S(386, 66, 260, 60, .32, 6) + S(664, 99, 120, 14, .3, 3) + E(64, 117, 18, 3, .3) +
      S(112, 44, 8, 48, .22, 2) + S(182, 34, 70, 24, .18, 2) + S(312, 30, 24, 58, .12, 8);
    return defs(verlauf('v2mKiste', 0, 0, 0, 1, [[0, 'rgba(255,200,180,.3)'], [.2, 'rgba(255,200,180,0)'], [.85, 'rgba(0,0,0,.12)'], [1, 'rgba(0,0,0,.35)']]) +
      verlauf('v2mStahl', 0, 0, 0, 1, [[0, 'rgba(255,255,255,.45)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.3)']])) +
      /* Glanz der Werkzeuge haengt seit 5.66 an den Werkzeugen selbst */
      '<rect x="0" y="0" width="800" height="118" fill="url(#v2mStahl)" opacity=".18"/>' + L('M0 118.6 H800', 'rgba(255,230,180,.45)', 1.2);
  }
  return '';
}

/* ----- Gestaltung v2: die Zierschicht jeder Kulisse -----
   Ein zweites SVG mit demselben Koordinatensystem (800 × 150, „slice“) wie
   das Buehnenbild — so sitzt jedes Funkeln, jeder Lichthof genau auf dem
   gemalten Ding. Komplett ohne Zeiger. Was sich bewegt, haengt im CSS an
   „Bewegung in den Verzierungen“; ohne Bewegung bleibt das stille Licht. */
function orteV2Funkeln(x, y, g, verz, farbe) {
  const s = g || 5, f = farbe || '#fff6dc';
  return '<path class="v2-funkeln" style="animation-delay:' + (verz || 0) + 's;transform-origin:' + x + 'px ' + y + 'px" d="M' + x + ' ' + (y - s) + 'Q' + x + ' ' + y + ' ' + (x + s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + s) + 'Q' + x + ' ' + y + ' ' + (x - s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - s) + 'z" fill="' + f + '"/>';
}
function orteV2Hof(id, cx, cy, rx, ry, farbe, klasse) {
  return '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="' + farbe + '" stop-opacity=".55"/><stop offset=".45" stop-color="' + farbe + '" stop-opacity=".18"/><stop offset="1" stop-color="' + farbe + '" stop-opacity="0"/></radialGradient></defs>' +
    '<ellipse class="' + (klasse || 'v2-hof') + '" style="transform-origin:' + cx + 'px ' + cy + 'px" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + id + ')"/>';
}
function orteV2Staub(id, pfad, n, saat) {
  let z = saat || 7; const zu = () => { z = (z * 9301 + 49297) % 233280; return z / 233280; };
  const punkte = Array.from({ length: n }, (_, i) => '<circle class="v2-staubkorn" style="animation-delay:-' + (zu() * 9).toFixed(2) + 's;animation-duration:' + (7 + zu() * 7).toFixed(1) + 's" cx="' + (zu() * 800).toFixed(0) + '" cy="' + (zu() * 150).toFixed(0) + '" r="' + (.6 + zu() * 1.1).toFixed(2) + '" fill="#fff4d6"/>').join('');
  return '<defs><clipPath id="' + id + '"><path d="' + pfad + '"/></clipPath></defs><g clip-path="url(#' + id + ')">' + punkte + '</g>';
}
function orteV2Glanzband(id, x, y, w, h) {
  return '<defs><clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/></clipPath></defs>' +
    '<g clip-path="url(#' + id + ')"><rect class="v2-glanzband" style="--v2-weg:' + (w + 120) + 'px" x="' + (x - 80) + '" y="' + (y - 40) + '" width="34" height="' + (h + 80) + '" fill="rgba(255,255,255,.22)" transform="rotate(20 ' + (x + w / 2) + ' ' + (y + h / 2) + ')"/></g>';
}
/* Die obere Malschicht (Rundung, Glanz) liegt zuunterst in der Zierschicht,
   darueber das, was sich bewegt. */
function orteV2Zier(r) {
  if (!orteV2An()) return '';
  return orteV2Malerei(r, 'oben') + orteV2ZierBewegt(r);
}
function orteV2ZierBewegt(r) {
  const spielt = Object.values((D.einst && D.einst.ambience) || {}).some((v) => v > 0) || Object.values((D.einst && D.einst.mischung) || {}).some((v) => v > 0);
  if (r === 'schnipsel') {
    return orteV2Hof('v2hS', 400, 40, 380, 90, '#ffe3a8') +
      orteV2Glanzband('v2gS', 372, 84, 56, 20) +
      '<g class="v2-zettelflug"><g transform="rotate(-12)"><rect x="-13" y="-9" width="26" height="18" fill="#fbf6e8" stroke="#c9bda0" stroke-width=".6"/><line x1="-9" y1="-3" x2="9" y2="-3" stroke="rgba(90,110,170,.3)" stroke-width=".6"/><line x1="-9" y1="2" x2="6" y2="2" stroke="rgba(90,110,170,.3)" stroke-width=".6"/></g></g>' +
      orteV2Funkeln(124, 20, 4, 1.4) + orteV2Funkeln(604, 128, 4, 3.1);
  }
  if (r === 'blaetter') {
    return orteV2Hof('v2hB', 400, 0, 420, 120, '#fff0c8') +
      '<g class="v2-flieger2"><path d="M0 0l40 7-31 7z" fill="#fffdf6" stroke="#c9bda0" stroke-width=".7"/><path d="M0 0l9 14 0-4z" fill="#eadfc4" stroke="#c9bda0" stroke-width=".6"/></g>' +
      orteV2Funkeln(494, 18, 5, .4) + orteV2Funkeln(506, 30, 3, 2.2) + orteV2Funkeln(721, 44, 3.5, 1.3, '#ffe9a8') +
      orteV2Glanzband('v2gB', 676, 90, 28, 24);
  }
  if (r === 'hefte') {
    return orteV2Hof('v2hH', 121, 58, 120, 70, '#ffd894', 'v2-hof atmet') +
      orteV2Staub('v2kH', 'M86 56h70l54 58H30z', 26, 11) +
      orteV2Funkeln(628, 100, 3.5, 1.8) + orteV2Funkeln(652, 100, 3, 3.6) +
      orteV2Glanzband('v2gH', 330, 72, 140, 14);
  }
  if (r === 'projekte') {
    return '<path class="v2-schnurglanz" d="M165 44 Q 260 20 345 62 T 545 40 T 705 66" fill="none" stroke="#ffd9c8" stroke-width="1.8" stroke-linecap="round" pathLength="100" stroke-dasharray="8 92"/>' +
      [[165, 44], [345, 62], [545, 40], [705, 66], [236, 98]].map(([x, y], i) => orteV2Funkeln(x - 2, y - 2, 3.5, i * .9)).join('') +
      orteV2Hof('v2hP', 420, 0, 460, 110, '#fff2d0');
  }
  if (r === 'cluster') {
    return '<g class="v2-blattschatten" fill="rgba(40,24,8,.075)">' +
      '<path d="M90 0c40 10 60 40 30 70-30-6-50-36-30-70z"/><path d="M200 -10c30 20 40 50 10 70-26-14-34-44-10-70z"/><path d="M60 60c34 4 50 30 30 56-30-6-44-30-30-56z"/></g>' +
      orteV2Funkeln(633, 86, 2.6, .6) + orteV2Funkeln(626, 92, 2.4, 2.4) +
      '<g class="v2-dampf2" fill="none" stroke="rgba(255,255,255,.55)" stroke-linecap="round" stroke-width="2.2"><path d="M634 79c-6-8 6-14 0-24c-5-8 4-14 0-22"/><path d="M648 78c5-8-6-14 0-22c5-8-4-12 0-20"/></g>' +
      orteV2Hof('v2hC', 640, 60, 120, 80, '#fff4dc');
  }
  if (r === 'woerter') {
    return orteV2Glanzband('v2gW', 46, 26, 528, 104) +
      [[72, 52], [248, 60], [424, 54], [160, 104], [336, 110], [512, 106]].map(([x, y], i) => orteV2Funkeln(x, y, 3.5, i * .7, '#e8e4da')).join('') +
      orteV2Hof('v2hW', 700, 60, 140, 90, '#ffe6b0');
  }
  if (r === 'klang') {
    return orteV2Hof('v2hK', 590, 88, 90, 70, '#ffc870', 'v2-hof flackert') +
      (spielt ? '<g class="v2-schall" fill="none" stroke="#f3e2b8" stroke-linecap="round">' + [0, 1, 2].map((i) => '<path class="w' + i + '" style="transform-origin:484px 40px" d="M496 22c11 11 11 30 0 41" stroke-width="1.4"/>').join('') + '</g>' : '') +
      orteV2Funkeln(450, 12, 4, .5) + orteV2Funkeln(478, 30, 3, 2) +
      orteV2Staub('v2kK', 'M380 0h300v150H380z', 18, 5);
  }
  if (r === 'faden') {
    return orteV2Hof('v2hF', 160, 40, 120, 80, '#ffd894', 'v2-hof atmet') +
      orteV2Staub('v2kF', 'M124 36h72l64 92H60z', 24, 3) +
      orteV2Funkeln(625, 82, 3, 1.1) + orteV2Funkeln(60, 33, 3, 2.7);
  }
  if (r === 'feinheiten') {
    return orteV2Glanzband('v2gF1', 90, 26, 40, 18) + orteV2Glanzband('v2gF2', 180, 30, 70, 22) +
      [[160, 108], [172, 112], [166, 100], [510, 55], [720, 101]].map(([x, y], i) => orteV2Funkeln(x, y, 3, i * .8, '#f2f4f8')).join('');
  }
  return '';
}

/* ----- Die Kulissen: kleine Bühnenbilder oben im Raum ----- */
const ORTE_SVG = 'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"';
const ORTE_H = 150;
/* Ein antippbares Ding: Klasse, Kennung, was es sagt, was es tut. Pur. */
function orteTipp(id, sag, tun) { return 'class="ort-tipp ort-' + id + '" data-tipp="' + id + '"' + (sag ? ' data-sag="' + orteText(sag) + '"' : '') + (tun ? ' data-tun="' + tun + '"' : '') + ' tabindex="0" role="button"'; }
function orteDampf(x, y, k) { return '<g class="ort-dampf" style="transform-origin:' + x + 'px ' + y + 'px">' + [0, 1, 2].map((i) => '<path class="ort-dampfzug d' + i + '" d="M' + (x - 6 + i * 6) + ' ' + y + ' c -4 -6 4 -10 0 -16 c -3 -5 3 -8 0 -13" fill="none" stroke="' + (k || 'rgba(255,255,255,.6)') + '" stroke-width="1.6" stroke-linecap="round"/>').join('') + '</g>'; }
function orteKulisse(raum, haupt) {
  const r = orteRaumFuer(raum);
  const o = saubereOrte(D.einst.orte);
  /* zeit-…: das Licht der v2-Schicht folgt der Stunde (Morgen, Tag, Abendrot, Mondlicht). */
  const zeit = typeof grussTageszeit === 'function' ? ' zeit-' + grussTageszeit() : '';
  const wrap = el('div', { class: 'ort-kulisse ort-' + r + (o.bewegung ? ' lebt' : '') + zeit });
  const svg = (inner, vb = '0 0 800 ' + ORTE_H) => { const d = document.createElement('div'); d.innerHTML = '<svg ' + ORTE_SVG + ' viewBox="' + vb + '" class="ort-bild">' + inner + '</svg>'; return d.firstElementChild; };
  const jz = typeof schreibtischJahreszeit === 'function' ? schreibtischJahreszeit() : 'sommer';
  const T = orteTipp;
  if (r === 'zuhause') {
    const heute = new Date();
    wrap.append(svg(
      '<defs><linearGradient id="ortw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f4d34"/><stop offset="1" stop-color="#3d2a19"/></linearGradient>' +
      '<linearGradient id="ortspiegel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f6f5"/><stop offset=".5" stop-color="#cbd5d9"/><stop offset="1" stop-color="#e6ecec"/></linearGradient>' +
      '<linearGradient id="ortboden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6238"/><stop offset="1" stop-color="#5b3f24"/></linearGradient>' +
      '<linearGradient id="ortmantel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b5a86"/><stop offset="1" stop-color="#22365a"/></linearGradient></defs>' +
      '<rect width="800" height="150" fill="url(#ortw)"/>' +
      /* Tapete: zarte Streifen */
      '<g opacity=".08" stroke="#ffe8c8" stroke-width="6">' + Array.from({ length: 27 }, (_, i) => '<line x1="' + (i * 30 + 4) + '" y1="0" x2="' + (i * 30 + 4) + '" y2="118"/>').join('') + '</g>' +
      /* Fußleiste und Dielenboden */
      '<rect x="0" y="112" width="800" height="8" fill="#d9c9a6"/><rect x="0" y="120" width="800" height="30" fill="url(#ortboden)"/>' +
      '<g stroke="rgba(0,0,0,.28)" stroke-width="1">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => '<line x1="' + (i * 88 - 20) + '" y1="120" x2="' + (i * 88 + 20) + '" y2="150"/>').join('') + '<line x1="0" y1="134" x2="800" y2="134"/></g>' +
      orteV2DieleUnten() +
      /* Garderobenleiste mit fünf Haken */
      '<rect x="40" y="26" width="300" height="10" rx="3" fill="#c9a25a"/><rect x="40" y="36" width="300" height="3" fill="rgba(0,0,0,.25)"/><g fill="#8a6a2e">' + [70, 130, 190, 250, 310].map((x) => '<circle cx="' + x + '" cy="42" r="4"/><rect x="' + (x - 2) + '" y="42" width="4" height="10"/>').join('') + '</g>' +
      /* Hut */
      /* Ein Filzhut (Fedora): Kniff oben, Ripsband mit Schleife, geschwungene Krempe, Licht von links */
      '<g ' + T('hut', 'Der Hut nickt. Guten Tag.') + ' style="transform-origin:70px 44px">' +
      '<defs><linearGradient id="orthutfilz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a4634"/><stop offset=".45" stop-color="#3a2b1f"/><stop offset="1" stop-color="#1a120c"/></linearGradient>' +
      '<linearGradient id="orthutkrempe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3828"/><stop offset="1" stop-color="#1c140e"/></linearGradient></defs>' +
      '<ellipse cx="76" cy="84" rx="34" ry="4" fill="rgba(0,0,0,.22)"/>' +
      '<ellipse cx="70" cy="75.5" rx="34" ry="6" fill="#1e1610"/>' +
      '<path d="M48.5 75 C 47.5 62 51.5 52 59.5 48.6 C 63.6 47 66.6 49.8 70 48.2 C 73.4 49.8 76.4 47 80.5 48.6 C 88.5 52 92.5 62 91.5 75 Z" fill="url(#orthutfilz)"/>' +
      '<path d="M61 50.5 Q 70 58.5 79 50.5" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>' +
      '<path d="M55 72 C 53.6 62 56 55 61 51.5" fill="none" stroke="rgba(255,240,220,.16)" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M48.6 67.6 C 60 71 80 71 91.4 67.6 L 91.6 74.2 C 80 77.6 60 77.6 48.4 74.2 Z" fill="#7a1a10"/>' +
      '<path d="M48.6 67.6 C 60 71 80 71 91.4 67.6" fill="none" stroke="rgba(255,200,180,.25)" stroke-width=".7"/>' +
      '<path d="M53 69.6 l -4 -3 l .6 5 z M53 69.6 l -3.4 5 l 5 -1.2 z" fill="#5e140c"/>' +
      '<path d="M35.5 76 C 42 83.5 98 83.5 104.5 76 C 99 79.6 41 79.6 35.5 76 Z" fill="url(#orthutkrempe)"/>' +
      '<path d="M37 76.6 C 48 80.2 92 80.2 103 76.6" fill="none" stroke="rgba(255,235,210,.22)" stroke-width=".8"/>' +
      '</g>' +
      /* Der blaue Mantel: ein langer Trenchcoat am Bügel — schmal wie ein hängendes
         Kleidungsstück (doppelt so hoch wie breit), Schulter 24 breit, Saum 34, Fall bis
         knapp über den Boden. Ärmel liegen INNERHALB der Silhouette, sonst wird er breit.
         Wickelschnitt mit Übertritt statt Knopfreihen, hochgestellter Kragen, loser Gürtel. */
      '<g ' + T('mantel', 'Der Mantel schwingt. Draußen riecht es nach Regen — und nach einem Fall.') + ' style="transform-origin:130px 40px">' +
      /* Bügel */
      '<path d="M130 40 q -1 -5 4 -6" fill="none" stroke="#9a7a3e" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M121 49 q 9 -6 18 0" fill="none" stroke="#9a7a3e" stroke-width="1.6" stroke-linecap="round"/>' +
      /* Silhouette: schmale Schulter, langer Fall, leicht schwingender Saum */
      '<path d="M117 51 C 114.5 59 114 70 113 84 L111 116 q 5 3 10 1 l 4 -2 q 5 2 10 0 l 4 2 q 5 2 10 -1 L147 84 C 146 70 145.5 59 143 51 C 139 48.6 121 48.6 117 51 Z" fill="url(#ortmantel)"/>' +
      '<path d="M117 51 C 121 48.6 139 48.6 143 51" fill="none" stroke="rgba(10,18,34,.35)" stroke-width="1"/>' +
      /* Ärmel: innerhalb der Silhouette, nur durch Ton und Kante getrennt */
      '<path d="M117 51 C 114.5 59 114 70 113 84 C 112.6 92 112.7 98 113.4 103 q 3.4 1.6 5.6 -.6 C 118.2 97 118 90 118.4 82 C 119 68 119.8 57.5 121.4 51.8 C 120 50.6 118.2 50.5 117 51 Z" fill="#2b4570"/>' +
      '<path d="M121.4 51.8 C 119.8 57.5 119 68 118.4 82 C 118 90 118.2 97 119 102.4" fill="none" stroke="rgba(10,18,34,.3)" stroke-width="1"/>' +
      '<path d="M143 51 C 145.5 59 146 70 147 84 C 147.4 92 147.3 98 146.6 103 q -3.4 1.6 -5.6 -.6 C 141.8 97 142 90 141.6 82 C 141 68 140.2 57.5 138.6 51.8 C 140 50.6 141.8 50.5 143 51 Z" fill="#35558a"/>' +
      '<path d="M138.6 51.8 C 140.2 57.5 141 68 141.6 82 C 142 90 141.8 97 141 102.4" fill="none" stroke="rgba(10,18,34,.25)" stroke-width="1"/>' +
      '<path d="M113.4 100 q 3.6 1.8 6 -.4 M146.6 100 q -3.6 1.8 -6 -.4" fill="none" stroke="rgba(10,18,34,.4)" stroke-width="1.8" stroke-linecap="round"/>' +
      /* Falten im Rockteil */
      '<g fill="none" stroke="rgba(10,18,34,.32)" stroke-width="1.1" stroke-linecap="round">' +
      '<path d="M122 72 C 121 88 121 102 121 115"/><path d="M130 90 C 130 100 130 108 130 116"/>' +
      '<path d="M138 70 C 139 86 139 100 139 114"/></g>' +
      '<g fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1" stroke-linecap="round">' +
      '<path d="M125 78 C 124 92 124 104 124 115"/><path d="M135 76 C 136 92 136 104 136 115"/></g>' +
      /* Übertritt: rechte Vorderkante liegt schräg über der linken */
      '<path d="M131 54 C 128 70 129 94 131 116 q 7 1 13 -1 L147 84 C 146 70 145 58 142 50 q -5 -1 -8 3 Z" fill="#33517e"/>' +
      '<path d="M131 54 C 128 70 129 94 131 116" fill="none" stroke="rgba(10,18,34,.45)" stroke-width="1.2"/>' +
      /* Kragen: klein, hochgestellt, links höher */
      '<path d="M123.6 47.4 C 121.8 53 123.4 57.6 127.6 60 L131 53.4 C 128.8 48.8 125.8 47 123.6 47.4 Z" fill="#25406b"/>' +
      '<path d="M137.6 46.6 C 140.4 52 139.2 57.4 134.8 60.6 L131 53.4 C 132.8 48.6 136 46 137.6 46.6 Z" fill="#40639a"/>' +
      '<path d="M123.6 47.4 C 128 44.6 134 44.6 137.6 46.6" fill="none" stroke="#1c2f4e" stroke-width="1.3" stroke-linecap="round"/>' +
      /* Revers */
      '<path d="M128 60 C 127.4 66 127.4 71 128 75 L131 64 Z" fill="#2a4266"/>' +
      '<path d="M134.5 61 C 136 66 136 71 135.4 74 L131 64 Z" fill="#3f5f8e"/>' +
      /* Gürtel: lose, Schnalle versetzt, Enden verschieden lang */
      '<path d="M114 82 C 122 84.6 138 84.6 146 81.4" fill="none" stroke="#22365a" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M114 82 C 122 84.6 138 84.6 146 81.4" fill="none" stroke="rgba(255,255,255,.10)" stroke-width=".9"/>' +
      '<rect x="122" y="80.4" width="6" height="5" rx="1.2" fill="none" stroke="#c9a25a" stroke-width="1.1"/>' +
      '<path d="M128 84 C 130.4 89 129.6 95 128 99" fill="none" stroke="#22365a" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M124.6 84.6 C 123 89.6 123 94.6 123.8 99.6" fill="none" stroke="#22365a" stroke-width="2" stroke-linecap="round"/>' +
      /* Sturmpatte und zwei schräge Taschenpatten */
      '<path d="M137 50 C 142 52.6 145 57 146.4 62 L141 63.4 C 139.6 59.4 137.4 56 134.4 53.4 Z" fill="rgba(255,255,255,.07)"/>' +
      '<path d="M117 90 l 7 -1.6 .8 3.4 -7 1.6 Z" fill="#2a4266"/><path d="M143 89.4 l -7 -1.6 -.8 3.4 7 1.6 Z" fill="#2a4266"/>' +
      /* Zwei Knöpfe am Übertritt, versetzt */
      '<circle cx="134.6" cy="63" r="1.3" fill="#c9a25a"/><circle cx="133.4" cy="71" r="1.3" fill="#c9a25a"/>' +
      /* Saumkante und Schlitz */
      '<path d="M111 116 q 5 3 10 1 l 4 -2 q 5 2 10 0 l 4 2 q 5 2 10 -1" fill="none" stroke="#1a2a44" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M128.6 104 C 128 109 128 113 128.6 117" fill="none" stroke="rgba(10,18,34,.3)" stroke-width="1"/>' + odGlanz('mantel') + '</g>' +
      /* Schal (bewegt sich) und Jahreszeit am Haken */
      /* Ein Strickschal ueber dem Haken: zwei Enden mit Rippen, Querstreifen und Fransen */
      '<g class="ort-schal" style="transform-origin:250px 48px">' +
      '<defs><linearGradient id="ortschalL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c96a3f"/><stop offset=".6" stop-color="#b0552f"/><stop offset="1" stop-color="#7e3a1e"/></linearGradient>' +
      '<linearGradient id="ortschalR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e4424"/><stop offset="1" stop-color="#6a2f16"/></linearGradient></defs>' +
      '<path d="M252.5 49 C 256.5 64 260.5 84 258.6 103 L 266.4 104 C 268.4 85 263 62 257.6 47.4 Z" fill="url(#ortschalR)"/>' +
      '<path d="M246.2 48.4 C 241.4 64 241 86 243 107 L 251.6 107 C 250.6 86 251.4 64 252.8 49.6 Z" fill="url(#ortschalL)"/>' +
      '<path d="M243.6 50.6 C 245.6 43.6 256.6 43.4 258.8 48.8 C 254.6 46.6 248.4 46.8 243.6 50.6 Z" fill="#9a4726"/>' +
      '<g stroke="rgba(60,20,5,.28)" stroke-width=".7" fill="none">' + [245, 247.4, 249.6].map((x) => '<path d="M' + x + ' 52 C ' + (x - 2.6) + ' 70 ' + (x - 2.4) + ' 90 ' + (x - .6) + ' 106"/>').join('') + [256.8, 259.6, 262.4].map((x) => '<path d="M' + x + ' 52 C ' + (x + 2.4) + ' 70 ' + (x + 3.4) + ' 88 ' + (x + 2) + ' 103"/>').join('') + '</g>' +
      '<g fill="#e2c799" opacity=".9">' + [64, 80, 96].map((y) => '<path d="M' + (242.4 + (y - 64) * -.02) + ' ' + y + ' L 251.8 ' + (y - .6) + ' L 251.7 ' + (y + 2.8) + ' L ' + (242.2) + ' ' + (y + 3.4) + ' Z"/>').join('') + [68, 84].map((y) => '<path d="M' + (255 + (y - 60) * .12) + ' ' + y + ' L ' + (262.6 + (y - 60) * .1) + ' ' + (y - .4) + ' L ' + (263 + (y - 60) * .1) + ' ' + (y + 2.8) + ' L ' + (255.4 + (y - 60) * .12) + ' ' + (y + 3.2) + ' Z" opacity=".85"/>').join('') + '</g>' +
      '<g stroke="#b0552f" stroke-width="1.2" stroke-linecap="round">' + [244, 246, 248, 250].map((x) => '<path d="M' + x + ' 107 l ' + ((x - 247) * .3) + ' 5"/>').join('') + [260, 262, 264, 266].map((x) => '<path d="M' + x + ' 103.6 l ' + ((x - 263) * .3) + ' 5"/>').join('') + '</g>' +
      '</g>' +
      (() => { const j = { winter: ['zweig', 'Tannenzweig. Es duftet nach Dezember.'], fruehling: ['bluete', 'Die Blüte nickt. Frühling in der Diele.'], sommer: ['strohhut', 'Der Strohhut. Riecht nach Heu und Meer.'] }[jz] || ['blatt', 'Ein Herbstblatt. Es knistert.']; return '<g ' + T(j[0], j[1]) + ' style="transform-origin:310px 48px">' + odJahreszeitHaken(jz) + '</g>'; })() +
      /* Schuhe und Schirmständer */
      /* Ein Paar Lederschuhe: Sohle, Absatz, Kappe, Schnuerung, Glanz auf dem Leder */
      '<g ' + T('schuhe', 'Die Schuhe stehen ordentlich. Fast.') + ' style="transform-origin:200px 118px">' +
      '<defs><linearGradient id="ortleder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6440"/><stop offset=".5" stop-color="#5e3820"/><stop offset="1" stop-color="#2e1a0c"/></linearGradient></defs>' +
      [[174, 0], [200, -5]].map(([x, w]) => '<g transform="rotate(' + w + ' ' + (x + 16) + ' 120)">' +
        '<ellipse cx="' + (x + 17) + '" cy="121.4" rx="19" ry="1.8" fill="rgba(0,0,0,.35)"/>' +
        '<path d="M' + x + ' 120 L ' + x + ' 114.6 C ' + x + ' 111.6 ' + (x + 4) + ' 110 ' + (x + 9) + ' 110.6 L ' + (x + 19) + ' 111.6 C ' + (x + 26) + ' 112 ' + (x + 31) + ' 115 ' + (x + 33) + ' 118.4 L ' + (x + 33) + ' 120 Z" fill="url(#ortleder)"/>' +
        '<path d="M' + (x + 22) + ' 112.4 C ' + (x + 27) + ' 113.2 ' + (x + 30.6) + ' 115.6 ' + (x + 32) + ' 118.4" fill="none" stroke="rgba(0,0,0,.4)" stroke-width=".7"/>' +
        '<path d="M' + (x + 2.4) + ' 112.4 C ' + (x + 4) + ' 110.8 ' + (x + 9) + ' 110.6 ' + (x + 11) + ' 111.6 C ' + (x + 8) + ' 113 ' + (x + 4) + ' 113.4 ' + (x + 2.4) + ' 112.4 Z" fill="#1a0f08"/>' +
        '<path d="M' + (x + 10) + ' 111 l 8 1 M' + (x + 10.6) + ' 112.6 l 7 .8" stroke="#d9c49a" stroke-width=".7"/>' +
        '<path d="M' + (x + 24) + ' 113.6 C ' + (x + 27) + ' 114.2 ' + (x + 29) + ' 115.4 ' + (x + 30) + ' 116.6" fill="none" stroke="rgba(255,235,210,.35)" stroke-width="1" stroke-linecap="round"/>' +
        '<rect x="' + (x - .6) + '" y="119.4" width="34.4" height="2.2" rx="1" fill="#120c08"/><rect x="' + (x - .6) + '" y="115.6" width="6" height="5.6" rx="1" fill="#1a110a"/>' +
        '</g>').join('') +
      '</g>' +
      /* Schirmstaender aus Messing, darin ein geschlossener Schirm mit Krueckengriff aus Holz */
      '<g ' + T('schirm', 'Der Schirm tropft nicht mehr. Fast.') + ' style="transform-origin:22px 118px">' +
      '<defs><linearGradient id="ortstaender" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5a2a"/><stop offset=".3" stop-color="#e2c180"/><stop offset=".55" stop-color="#b08a44"/><stop offset="1" stop-color="#5e4220"/></linearGradient>' +
      '<linearGradient id="ortschirmstoff" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f73a6"/><stop offset=".5" stop-color="#2f4f7e"/><stop offset="1" stop-color="#1c3358"/></linearGradient></defs>' +
      '<ellipse cx="24" cy="120" rx="16" ry="2.4" fill="rgba(0,0,0,.3)"/>' +
      '<path d="M22 50 V 34 C 22 26.5 31.5 26.5 31.5 33.6" fill="none" stroke="#6b4a2a" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M22.6 34 C 22.8 29.4 28.6 28.6 30 32" fill="none" stroke="rgba(255,230,190,.35)" stroke-width="1"/>' +
      '<rect x="21" y="48" width="2.4" height="6" fill="#c9a25a"/>' +
      '<path d="M17.4 88 L 17.8 66 C 18 60 20 56 22.2 53.6 C 24.4 56 26.4 60 26.6 66 L 27 88 Z" fill="url(#ortschirmstoff)"/>' +
      '<g stroke="rgba(10,20,40,.4)" stroke-width=".7" fill="none"><path d="M20.4 56 L 19.6 88"/><path d="M24 56 L 24.6 88"/></g>' +
      '<path d="M18.4 70 Q 22.2 72.6 26 70" fill="none" stroke="#1c3358" stroke-width="2.4"/><circle cx="25.4" cy="70.6" r="1" fill="#c9a25a"/>' +
      '<path d="M10 86 L 34 86 L 32.4 118 L 11.6 118 Z" fill="url(#ortstaender)"/>' +
      '<ellipse cx="22" cy="86" rx="12" ry="2.6" fill="#3a2a14"/><ellipse cx="22" cy="86" rx="12" ry="2.6" fill="none" stroke="#f0d79a" stroke-width=".8"/>' +
      '<path d="M10.6 96 L 33.4 96 M11.2 108 L 32.8 108" stroke="rgba(60,40,10,.45)" stroke-width="1.2"/>' +
      '</g>' +
      /* Schlüsselbrett: drei Haken — Haustür, Fahrrad, der Busschlüssel mit Bus-Anhänger */
      '<g ' + T('schluessel', 'Der Busschlüssel klimpert. Wohin fahren wir?') + ' style="transform-origin:410px 30px"><rect x="364" y="28" width="96" height="46" rx="4" fill="#a3783f"/><rect x="368" y="32" width="88" height="38" rx="3" fill="#7a5a2e"/><text x="412" y="41" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-size="6.5" letter-spacing=".2" fill="#f3e7c9">SCHLÜSSEL</text>' + odGlanz('schluessel') +
      '<g fill="#d9c29a"><circle cx="384" cy="50" r="2.2"/><circle cx="412" cy="50" r="2.2"/><circle cx="440" cy="50" r="2.2"/></g>' +
      '<g class="ort-schluesselbund" style="transform-origin:384px 50px"><circle cx="384" cy="56" r="3.5" fill="none" stroke="#c9a25a" stroke-width="1.4"/><rect x="382.5" y="59" width="3" height="16" fill="#c9a25a"/><rect x="385" y="70" width="3" height="2" fill="#c9a25a"/><rect x="385" y="74" width="2" height="2" fill="#c9a25a"/></g>' +
      '<g class="ort-schluesselbund b" style="transform-origin:412px 50px"><circle cx="412" cy="56" r="3.5" fill="none" stroke="#8a8f96" stroke-width="1.4"/><rect x="410.5" y="59" width="3" height="14" fill="#8a8f96"/><rect x="413" y="68" width="3" height="2" fill="#8a8f96"/></g>' +
      '<g class="ort-schluesselbund c" style="transform-origin:440px 50px"><circle cx="440" cy="56" r="3.5" fill="none" stroke="#8a8f96" stroke-width="1.4"/><rect x="438.5" y="59" width="3" height="10" fill="#2c2218"/>' +
      /* der Anhänger: ein kleiner Bus */
      '<g transform="translate(433 70)"><rect x="0" y="0" width="15" height="9" rx="2.5" fill="#e8e4da"/><rect x="0" y="0" width="15" height="4.5" rx="2.5" fill="#3b5a86"/><rect x="2" y="1" width="3.5" height="3" rx=".6" fill="#dfe8ee"/><rect x="6.5" y="1" width="3" height="3" rx=".6" fill="#dfe8ee"/><rect x="10.5" y="1" width="3" height="3" rx=".6" fill="#dfe8ee"/><circle cx="7.5" cy="4.8" r="1.6" fill="#e8e4da" stroke="#3b5a86" stroke-width=".6"/><circle cx="3.5" cy="9" r="1.5" fill="#2c2218"/><circle cx="11.5" cy="9" r="1.5" fill="#2c2218"/></g></g></g>' +
      /* Spiegel mit Goldrahmen und einer Zeile, als hätte jemand mit Edding drübergeschrieben */
      '<g ' + T('spiegel', null, 'spiegel') + ' style="transform-origin:540px 72px">' +
      '<ellipse cx="540" cy="72" rx="48" ry="58" fill="#d9e0e4"/><ellipse cx="540" cy="72" rx="44" ry="54" fill="url(#ortspiegel)"/>' +
      '<path d="M512 40c8-14 24-20 38-16" stroke="rgba(255,255,255,.7)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="540" cy="72" rx="48" ry="58" fill="none" stroke="#c9a25a" stroke-width="5"/><ellipse cx="540" cy="72" rx="48" ry="58" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>' +
      '<g fill="#c9a25a"><circle cx="540" cy="12" r="4"/><path d="M532 14c4-6 12-6 16 0" fill="none" stroke="#c9a25a" stroke-width="2"/></g>' +
      (() => { const zl = orteUmbruch(o.spiegelZeile, o.spiegelZeile.length > 30 ? 13 : 11, 4); const fs = zl.length >= 4 ? 9 : zl.length === 3 ? 10.5 : 12; const y0 = 72 - (zl.length - 1) * (fs + 2) / 2 + fs * .35; return '<text class="ort-edding" x="540" y="' + y0.toFixed(1) + '" text-anchor="middle" transform="rotate(-7 540 72)" font-family="\'Marker Felt\', \'Chalkboard SE\', \'Bradley Hand\', \'Segoe Print\', \'Comic Sans MS\', cursive" font-weight="700" font-size="' + fs + '" fill="#16181a" opacity=".88">' + zl.map((z, i) => '<tspan x="540" dy="' + (i ? fs + 2 : 0) + '">' + orteText(z) + '</tspan>').join('') + '</text>'; })() +
      '<g class="ort-hauch" opacity="0"><ellipse cx="540" cy="100" rx="30" ry="11" fill="rgba(255,255,255,.55)"/><text class="ort-hauch-text" x="540" y="103" text-anchor="middle" font-family="\'Bradley Hand\', \'Segoe Print\', \'Chalkboard SE\', cursive" font-size="8.5" fill="#3a3a44"></text></g>' +
      '</g>' +
      /* Konsole mit Briefen und der Katze darunter */
      '<rect x="620" y="78" width="160" height="8" rx="2" fill="#c9a25a"/><rect x="628" y="86" width="6" height="34" fill="#8a6a2e"/><rect x="766" y="86" width="6" height="34" fill="#8a6a2e"/>' + odGlanz('konsole') +
      '<g ' + T('briefe', 'Zwei Briefe. Einer davon riecht nach Lavendel.') + ' style="transform-origin:700px 70px">' + odBriefe() + '</g>' +
      (typeof katzeSVG === 'function' ? katzeSVG(722, 119, katzeZustand(heute.getHours(), (D.stats && D.stats.tage && D.stats.tage[tagKey()]) || 0), o.katzeName) : '') +
      /* Eine kleine Uhr über der Konsole: die Zeiger stimmen */
      '<g ' + T('uhr', 'Tick. Die Uhr geht richtig — ' + heute.getHours() + ':' + String(heute.getMinutes()).padStart(2, '0') + '.') + ' style="transform-origin:700px 12px">' + odUhr(heute) + '</g>' +
      orteV2DieleOben()
    ));
    /* Neuigkeiten: was in den Räumen wartet */
    const chips = el('div', { class: 'ort-chips' });
    try {
      if (typeof SALON_AUTOREN !== 'undefined') { const tag = tagKey(); const wer = SALON_AUTOREN[salonHash(tag) % SALON_AUTOREN.length]; chips.append(el('button', { class: 'ort-chip', onclick: () => { location.hash = '#/salon'; } }, 'Im Salon rät heute ' + wer.name.split(' ').pop())); }
      const briefe = vomTyp('brief').filter((b) => typeof briefIstOffen === 'function' && briefIstOffen(b) && b.versiegelt).length;
      if (briefe) chips.append(el('button', { class: 'ort-chip', onclick: () => { location.hash = '#/schreibtisch'; } }, briefe === 1 ? 'Ein Brief darf geöffnet werden' : briefe + ' Briefe dürfen geöffnet werden'));
      const buch = typeof lesestapelBuecher === 'function' ? lesestapelBuecher()[0] : null;
      if (buch && buch.seiten) chips.append(el('button', { class: 'ort-chip', onclick: () => buchOeffnen(buch) }, 'Weiterlesen: ' + (buch.titel || 'Buch').slice(0, 28) + ' · ' + buchFortschritt(buch.seite, buch.seiten) + ' %'));
      const heuteW = D.stats.tage[tagKey()] || 0;
      chips.append(el('span', { class: 'ort-chip still' }, heuteW ? heuteW + ' Wörter heute' : 'Heute noch kein Wort — die Tasse wartet'));
    } catch (e) {}
    wrap.append(chips);
    if (typeof katzeBeleben === 'function') katzeBeleben(wrap, o, typeof salonAnrede === 'function' ? salonAnrede() : '');
    if (typeof orteUhrLaufen === 'function') orteUhrLaufen(wrap);
    if (o.spiegelKamera) orteSpiegelKamera(wrap);
  } else if (r === 'schnipsel') {
    /* Zettelkasten: ein Holzkasten mit sieben Karteireitern — ein Reiter je Tag der letzten Woche */
    const tage = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); tage.push(d); }
    const alle = vomTyp('schnipsel');
    const zahlen = tage.map((d) => { const k = tagKey(d); return alle.filter((s) => tagKey(s.angelegt || 0) === k).length; });
    const namen = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const letzter = alle.filter((s) => (s.text || '').trim()).sort((a, b) => (b.angelegt || 0) - (a.angelegt || 0))[0];
    wrap.append(svg(
      '<defs><linearGradient id="ortkasten" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5638"/><stop offset="1" stop-color="#4e3620"/></linearGradient></defs>' +
      '<rect x="0" y="126" width="800" height="24" fill="#3a2818"/><rect x="0" y="124" width="800" height="4" fill="#8a6a3e"/>' +
      orteV2Malerei('schnipsel', 'unten') +
      '<rect x="40" y="60" width="720" height="68" rx="6" fill="url(#ortkasten)"/><rect x="40" y="60" width="720" height="8" fill="#8a6a3e"/><rect x="46" y="68" width="708" height="54" fill="#3a2a18" opacity=".55"/>' +
      /* Messinggriff und Schildchen */
      '<rect x="380" y="98" width="40" height="6" rx="3" fill="#c9a25a"/><rect x="372" y="84" width="56" height="12" rx="2" fill="#c9a25a"/><text x="400" y="93" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-size="7" fill="#3a2a18" letter-spacing=".2">ZETTEL</text>' +
      /* Karteikarten stehen im Kasten */
      Array.from({ length: 22 }, (_, i) => '<rect x="' + (60 + i * 31) + '" y="' + (70 + (i % 3)) + '" width="26" height="52" fill="' + (i % 4 === 0 ? '#f3e7c9' : '#ece0c4') + '" stroke="#b39b6a" stroke-width=".6"/>').join('') +
      orteV2Malerei('schnipsel', 'mitte') +
      /* Reiter je Tag */
      tage.map((d, i) => { const x = 70 + i * 98; const n = zahlen[i]; return '<g ' + T('reiter', namen[d.getDay()] + ': ' + (n ? n + (n === 1 ? ' Zettel' : ' Zettel') : 'kein Zettel')) + ' style="transform-origin:' + (x + 42) + 'px 70px"><rect x="' + x + '" y="' + (n ? 30 : 40) + '" width="84" height="40" rx="3" fill="' + (n ? '#f3e7c9' : '#d8cfb8') + '" stroke="#b39b6a"/><text x="' + (x + 42) + '" y="' + (n ? 52 : 62) + '" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-size="13" fill="#5a4326">' + namen[d.getDay()] + (n ? ' · ' + n : '') + '</text></g>'; }).join('') +
      /* Eine Karte ragt heraus: der letzte Zettel */
      (letzter ? '<g ' + T('karte', 'Der letzte Zettel: „' + (letzter.text || '').trim().slice(0, 60).replace(/\s+/g, ' ') + '“', 'letzter') + ' style="transform-origin:700px 70px"><g transform="rotate(-4 700 70)"><rect x="660" y="22" width="80" height="50" fill="#fbf6e8" stroke="#c9bda0"/><g stroke="rgba(90,110,170,.25)">' + [34, 42, 50, 58, 66].map((y) => '<line x1="666" y1="' + y + '" x2="734" y2="' + y + '"/>').join('') + '</g><line x1="660" y1="28" x2="740" y2="28" stroke="rgba(200,80,80,.5)"/>' + orteUmbruch(letzter.text, 16, 4).map((z, i) => '<text x="667" y="' + (40 + i * 8) + '" font-family="ui-serif, Georgia, serif" font-size="6.6" fill="#3a2a18">' + orteText(z) + '</text>').join('') + '</g></g>' : '') +
      /* Stempel, Büroklammern, Füller */
      '<g ' + T('stempel', 'Tock. „Notiert.“') + ' style="transform-origin:120px 34px">' + odStempel() + '</g>' +
      '<g ' + T('fueller', 'Die Feder ist voll. Sie will einen Zettel.') + ' style="transform-origin:560px 130px"><g transform="rotate(-18 560 130)"><rect x="520" y="126" width="80" height="7" rx="3.5" fill="#1a1a1a"/><rect x="596" y="126" width="14" height="7" rx="3" fill="#c9a25a"/><path d="M520 129.5l-10 2 10 2z" fill="#c9a25a"/><rect x="560" y="124" width="14" height="2" fill="#c9a25a"/></g></g>' +
      '<g fill="none" stroke="#8a8f96" stroke-width="1.4"><path d="M300 130c0-3 3-5 6-5h10c3 0 5 2 5 5v8"/><path d="M303 132c0-2 2-3 4-3h8c2 0 3 1 3 3v5"/></g>'
    ));
    wrap.append(el('div', { class: 'ort-chips' }, el('button', { class: 'ort-chip', onclick: () => orteKastenSchuetteln() }, 'Kasten schütteln — drei Zettel')));
  } else if (r === 'blaetter') {
    const blaetter = vomTyp('blatt'); const n = blaetter.length;
    const oben = blaetter.slice().sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))[0];
    const titel = oben ? (oben.titel || (oben.text || '').split('\n')[0] || 'Ohne Titel').slice(0, 40) : 'Ein leerer Stapel';
    const zeilen = oben ? orteUmbruch((oben.text || '').replace(oben.titel || '', ''), 44, 4) : ['Für alles, was einfach nur', 'geschrieben werden will.'];
    wrap.append(svg(
      '<defs><linearGradient id="orttisch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a47a4c"/><stop offset="1" stop-color="#6b4a2a"/></linearGradient>' +
      '<radialGradient id="ortlicht" cx=".5" cy="0" r=".8"><stop offset="0" stop-color="rgba(255,236,190,.45)"/><stop offset="1" stop-color="rgba(255,236,190,0)"/></radialGradient></defs>' +
      '<rect width="800" height="150" fill="#e6dcc6"/><rect width="800" height="150" fill="url(#ortlicht)"/>' +
      '<rect x="0" y="112" width="800" height="38" fill="url(#orttisch)"/><rect x="0" y="112" width="800" height="3" fill="rgba(255,230,190,.35)"/>' +
      '<g stroke="rgba(0,0,0,.12)" stroke-width="1">' + [120, 126, 133, 141].map((y) => '<line x1="0" y1="' + y + '" x2="800" y2="' + y + '" stroke-dasharray="' + (40 + y) + ' 12"/>').join('') + '</g>' +
      orteV2Malerei('blaetter', 'unten') +
      /* Der Stapel: fünf Blätter, das oberste beschrieben — der Text sitzt auf den Linien */
      [0, 1, 2, 3].map((i) => '<g transform="translate(' + (400 + (i - 2) * 2) + ' ' + (118 - i * 4) + ') rotate(' + ((i % 2 ? 1 : -1) * (1.2 + i * .4)) + ')"><rect x="-130" y="-92" width="260" height="94" fill="#f2e8d4" stroke="#d9caa6"/></g>').join('') +
      '<g ' + T('stapel', oben ? n + (n === 1 ? ' Blatt' : ' Blätter') + '. Obenauf: „' + titel + '“ — tippen öffnet es.' : 'Der Stapel ist leer. Das erste Blatt wartet.', oben ? 'oben' : 'neu') + ' style="transform-origin:400px 70px"><g transform="translate(400 102) rotate(-.6)">' +
      '<rect x="-130" y="-92" width="260" height="94" fill="#fbf6e8" stroke="#d9caa6"/><path d="M110 -92l20 20h-20z" fill="#e8dcc0"/><path d="M110 -92l0 20 20 0" fill="none" stroke="#d9caa6"/>' +
      '<g stroke="rgba(90,110,170,.22)">' + [-52, -40, -28, -16, -4].map((y) => '<line x1="-118" y1="' + y + '" x2="118" y2="' + y + '"/>').join('') + '</g><line x1="-104" y1="-92" x2="-104" y2="2" stroke="rgba(200,80,80,.35)"/>' +
      '<text x="-98" y="-70" font-family="ui-serif, Georgia, serif" font-weight="700" font-size="11.5" fill="#3a2a18">' + orteText(titel) + '</text>' +
      zeilen.map((z, i) => '<text x="-98" y="' + (-55 + i * 12) + '" font-family="ui-serif, Georgia, serif" font-style="italic" font-size="8.6" fill="#4a3a28">' + orteText(z) + '</text>').join('') +
      '<text x="112" y="-4" text-anchor="end" font-family="ui-rounded, system-ui, sans-serif" font-size="7" fill="#8a7a62">' + n + (n === 1 ? ' Blatt' : ' Blätter') + ' auf dem Stapel</text></g></g>' +
      /* Briefbeschwerer aus Glas, Bleistift, Radiergummi */
      '<g ' + T('glas', 'Der Briefbeschwerer. Kühl und schwer, wie ein guter letzter Satz.') + ' style="transform-origin:500px 28px"><ellipse cx="500" cy="34" rx="16" ry="5" fill="rgba(0,0,0,.18)"/><circle cx="500" cy="24" r="14" fill="rgba(140,190,200,.55)" stroke="rgba(255,255,255,.7)"/><path d="M492 18c2-5 8-7 12-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="500" cy="26" r="5" fill="rgba(255,255,255,.35)"/></g>' +
      '<g ' + T('bleistift', 'Der Bleistift ist gespitzt. Das ist die halbe Arbeit.') + ' style="transform-origin:200px 116px"><g transform="rotate(-12 200 116)"><rect x="150" y="112" width="96" height="8" fill="#e8b43c"/><path d="M246 112l14 4-14 4z" fill="#f3e1b0"/><path d="M256 114.5l4 1.5-4 1.5z" fill="#2c2218"/><rect x="150" y="112" width="8" height="8" fill="#d98b8b"/><rect x="158" y="112" width="5" height="8" fill="#c9c9c9"/><line x1="165" y1="114.5" x2="244" y2="114.5" stroke="rgba(0,0,0,.12)"/>' + odGlanz('bleistift') + '</g></g>' +
      '<rect x="620" y="106" width="26" height="12" rx="2" fill="#e8d7d0" stroke="#c9a9a0" transform="rotate(8 633 112)"/>' +
      /* Ein Papierflieger, der ab und zu über den Tisch segelt */
      '<g ' + T('flieger', 'Der Papierflieger segelt davon. Irgendwo landet ein Satz.') + ' style="transform-origin:150px 52px"><g class="ort-flieger"><path d="M121 39.6 L 184 50 L 134 46.4 Z" fill="#e3d7b9" stroke="#a89a78" stroke-width=".6" stroke-linejoin="round"/><path d="M128 49 L 184 50 L 142 57.4 Z" fill="#cbbb94" stroke="#a89a78" stroke-width=".6" stroke-linejoin="round"/><path d="M114 48.6 L 184 50 L 136 63 Z" fill="#fffdf6" stroke="#a89a78" stroke-width=".7" stroke-linejoin="round"/><path d="M114 48.6 L 184 50" stroke="#b8ab8a" stroke-width=".6"/><path d="M124 53.4 L 172 51.4" stroke="rgba(170,150,110,.45)" stroke-width=".5"/><path d="M136 63 L 184 50 L 150 58.6 Z" fill="rgba(160,140,100,.18)"/></g></g>' +
      /* Tintenfass */
      '<g ' + T('tinte', 'Die Tinte ist schwarz wie drei Uhr nachts.') + ' style="transform-origin:690px 114px">' + odTintenfass() + '</g>'
    ));
  } else if (r === 'hefte') {
    wrap.append(svg(
      '<defs><linearGradient id="orthtisch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6238"/><stop offset="1" stop-color="#5b3f24"/></linearGradient>' +
      '<linearGradient id="ortsm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f44"/><stop offset="1" stop-color="#1d2024"/></linearGradient></defs>' +
      '<rect width="800" height="150" fill="#5a4430"/><rect width="800" height="150" fill="url(#ortw2)"/>' +
      '<defs><linearGradient id="ortw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,230,190,.10)"/><stop offset="1" stop-color="rgba(0,0,0,.25)"/></linearGradient></defs>' +
      '<rect x="0" y="112" width="800" height="38" fill="url(#orthtisch)"/><rect x="0" y="112" width="800" height="3" fill="rgba(255,230,190,.4)"/>' +
      orteV2Malerei('hefte', 'unten') +
      /* Leselampe: tippen schaltet das Licht */
      '<g ' + T('lampe', null, 'lampe') + ' style="transform-origin:121px 112px"><rect x="118" y="52" width="6" height="60" fill="#8a6a2e"/><ellipse cx="121" cy="112" rx="22" ry="5" fill="#8a6a2e"/><path d="M86 56h70l-12-26H98z" fill="#2f6b4f"/><path d="M86 56h70" stroke="#c9a25a" stroke-width="2"/>' + odGlanz('lampe') + '<path class="ort-lichtkegel" d="M86 56h70l54 58H30z" fill="rgba(255,220,150,.26)"/><ellipse class="ort-gluehbirne" cx="121" cy="54" rx="8" ry="4" fill="rgba(255,236,190,.9)"/></g>' +
      /* Bücherstapel mit Lesezeichen */
      '<g ' + T('buecher', 'Drei Bücher, alle angefangen. So muss das.') + ' style="transform-origin:230px 112px"><rect x="190" y="96" width="84" height="16" rx="2" fill="#7a3b2e"/><rect x="196" y="82" width="76" height="14" rx="2" fill="#2f5a7a"/><rect x="192" y="70" width="70" height="12" rx="2" fill="#b8923f"/><path d="M250 70v-18" stroke="#b0352b" stroke-width="3"/><g stroke="rgba(255,255,255,.35)"><line x1="196" y1="104" x2="268" y2="104"/><line x1="202" y1="89" x2="266" y2="89"/></g>' + odGlanz('buecher') + '</g>' +
      /* Die Schreibmaschine: Wagen, Papier, Tasten — sie funktioniert */
      '<g ' + T('schreibmaschine', null, 'schreibmaschine') + ' style="transform-origin:400px 112px">' + odSchreibmaschine() + '</g>' +
      /* Tasse mit Dampf, Brille, Pflanze */
      /* Ein Steingutbecher: gerundeter Koerper, Glasur mit Glanz, Henkel mit Volumen, Tee mit Spiegelung */
      '<g ' + T('tasse', 'Der Tee dampft noch. Gut so.') + ' style="transform-origin:560px 112px">' +
      '<defs><linearGradient id="orthbecher" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffaf0"/><stop offset=".3" stop-color="#f3e7c9"/><stop offset=".8" stop-color="#cdb98f"/><stop offset="1" stop-color="#a89268"/></linearGradient>' +
      '<radialGradient id="orthtee" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#b8743a"/><stop offset="1" stop-color="#5a3412"/></radialGradient></defs>' +
      '<ellipse cx="562" cy="114.6" rx="22" ry="3" fill="rgba(0,0,0,.32)"/>' +
      '<path d="M575 97 C 586 96 587 111 574.4 110" fill="none" stroke="#d9c79f" stroke-width="4.6" stroke-linecap="round"/>' +
      '<path d="M576 99.6 C 582 99.6 582.4 107.4 575.4 107.4" fill="none" stroke="rgba(120,90,50,.4)" stroke-width="1"/>' +
      '<path d="M544 94 L 545 111 C 545.2 113.6 552 114.4 560 114.4 C 568 114.4 574.8 113.6 575 111 L 576 94 Z" fill="url(#orthbecher)"/>' +
      '<path d="M547.6 97 L 548.2 110" stroke="rgba(255,255,255,.75)" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M544.6 101 Q 560 104 575.4 101" fill="none" stroke="#2f5a7a" stroke-width="1.4" opacity=".8"/>' +
      '<ellipse cx="560" cy="94" rx="16" ry="3.6" fill="#f6eedb" stroke="#bfa97e" stroke-width=".7"/>' +
      '<ellipse cx="560" cy="94.6" rx="13.6" ry="2.6" fill="url(#orthtee)"/><ellipse cx="555" cy="94" rx="5" ry=".9" fill="rgba(255,235,200,.35)"/>' +
      orteDampf(560, 88) + '</g>' +
      '<g ' + T('brille', 'Die Lesebrille. Jemand hat sie wieder liegen lassen.') + ' style="transform-origin:640px 104px" stroke="#2c2218" stroke-width="2" fill="none"><circle cx="628" cy="104" r="9"/><circle cx="652" cy="104" r="9"/><path d="M637 104h6M619 102l-14-4M661 102l14-4"/><circle cx="628" cy="104" r="7" fill="rgba(255,255,255,.12)" stroke="none"/></g>' +
      '<g ' + T('pflanze', 'Das Blatt zittert. Die Pflanze will auch gegossen werden.') + ' style="transform-origin:730px 112px"><rect x="710" y="84" width="40" height="28" rx="3" fill="#a3562f"/><rect x="708" y="82" width="44" height="6" rx="2" fill="#b8693c"/>' + odGlanz('topf') + '<g class="ort-blaetter"><path d="M730 84c-6-18-22-26-34-26 4 16 16 26 34 26z" fill="#4a7a46"/><path d="M730 84c6-18 22-26 34-26-4 16-16 26-34 26z" fill="#5a8a52"/><path d="M730 84c-2-22 4-34 10-44 6 14 4 30-10 44z" fill="#3f6e3c"/>' + odGlanz('adern') + '</g></g>' +
      /* Ein Lesezeichenband hängt von oben */
      '<path class="ort-band" d="M70 0v60l-6 8 6-2 6 2-6-8" fill="#b0352b" style="transform-origin:70px 0px"/>'
    ));
    const chips = el('div', { class: 'ort-chips' });
    chips.append(el('button', { class: 'ort-chip', onclick: () => { if (typeof schreibmaschineOeffnen === 'function') schreibmaschineOeffnen(); } }, '⌨ An die Schreibmaschine'));
    wrap.append(chips);
  } else if (r === 'projekte') {
    const projekte = vomTyp('projekt').sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0)).slice(0, 3);
    const heute = new Date(); const monat = heute.toLocaleDateString('de-DE', { month: 'long' });
    wrap.append(svg(
      '<rect width="800" height="150" fill="#b8915e"/><rect width="800" height="150" fill="url(#ortkork)"/><defs><pattern id="ortkork" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r="1.6" fill="rgba(90,60,30,.25)"/><circle cx="19" cy="20" r="1.2" fill="rgba(90,60,30,.2)"/><circle cx="23" cy="5" r="1" fill="rgba(255,240,210,.25)"/><circle cx="12" cy="24" r=".8" fill="rgba(90,60,30,.18)"/></pattern></defs>' +
      '<rect x="0" y="0" width="800" height="6" fill="#6b4a32"/><rect x="0" y="144" width="800" height="6" fill="#6b4a32"/>' +
      orteV2Malerei('projekte', 'unten') +
      /* Karten mit Nadeln und roter Schnur */
      [[120, 40, -4], [300, 58, 3], [500, 36, -2], [660, 62, 4]].map(([x, y, d]) => '<g ' + T('karte', 'Die Karte hängt schief. So gehört sich das.') + ' style="transform-origin:' + (x + 45) + 'px ' + (y + 4) + 'px"><g transform="rotate(' + d + ' ' + (x + 45) + ' ' + (y + 28) + ')"><rect x="' + x + '" y="' + y + '" width="90" height="56" fill="#f7efe0" stroke="#d9caa6"/><line x1="' + (x + 10) + '" y1="' + (y + 18) + '" x2="' + (x + 70) + '" y2="' + (y + 18) + '" stroke="#c9bda0"/><line x1="' + (x + 10) + '" y1="' + (y + 30) + '" x2="' + (x + 60) + '" y2="' + (y + 30) + '" stroke="#c9bda0"/><line x1="' + (x + 10) + '" y1="' + (y + 42) + '" x2="' + (x + 50) + '" y2="' + (y + 42) + '" stroke="#c9bda0"/><circle cx="' + (x + 45) + '" cy="' + (y + 4) + '" r="5" fill="#c0392b"/><circle cx="' + (x + 43) + '" cy="' + (y + 2) + '" r="1.5" fill="#fff" opacity=".6"/></g></g>').join('') +
      '<path class="ort-schnur-rot" d="M165 44 Q 260 20 345 62 T 545 40 T 705 66" fill="none" stroke="#b0352b" stroke-width="1.6"/>' +
      /* Polaroid mit Klebeband */
      '<g ' + T('foto', 'Ein Foto von damals. Die Berge, die Wolke, der Tag.') + ' style="transform-origin:420px 96px"><g transform="rotate(5 420 110)"><rect x="388" y="92" width="64" height="54" fill="#fbfaf5" stroke="#d9d4c8"/><rect x="393" y="96" width="54" height="38" fill="#6f8fa8"/><path d="M393 134l14-18 10 10 10-14 20 22z" fill="#4a6a5a"/><circle cx="436" cy="104" r="4" fill="#f3e7b0"/><rect x="404" y="86" width="30" height="9" fill="rgba(255,240,180,.75)" transform="rotate(-8 419 90)"/></g></g>' +
      /* Kalenderblatt mit dem heutigen Tag */
      '<g ' + T('kalender', 'Heute ist der ' + heute.getDate() + '. ' + monat + '. Ein guter Tag für ein Kapitel.') + ' style="transform-origin:236px 110px"><rect x="206" y="96" width="60" height="50" fill="#fbfaf5" stroke="#d9d4c8"/><rect x="206" y="96" width="60" height="12" fill="#b0352b"/><text x="236" y="105" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-size="7" fill="#fff" letter-spacing=".15">' + orteText(monat.toUpperCase()) + '</text><text x="236" y="134" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-weight="700" font-size="24" fill="#2c2218">' + heute.getDate() + '</text><circle cx="236" cy="126" r="14" fill="none" stroke="#b0352b" stroke-width="1.6" stroke-dasharray="2 2"/><circle cx="236" cy="98" r="3" fill="#c0392b"/></g>' +
      /* Post-its mit den neuesten Projekten */
      projekte.map((p, i) => '<g ' + T('zettel', 'Projekt: ' + (p.titel || 'Ohne Titel'), 'projekt:' + p.id) + ' style="transform-origin:' + (580 + i * 60) + 'px 100px"><g transform="rotate(' + (i * 5 - 4) + ' ' + (580 + i * 60 + 26) + ' 120)"><rect x="' + (580 + i * 60) + '" y="100" width="52" height="46" fill="' + ['#f5e27a', '#f2b8c6', '#bfe3c0'][i % 3] + '" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))"/><text x="' + (580 + i * 60 + 26) + '" y="126" text-anchor="middle" font-family="\'Marker Felt\', \'Chalkboard SE\', \'Bradley Hand\', \'Segoe Print\', cursive" font-size="8" fill="#2c2218">' + orteUmbruch(p.titel || 'Ohne Titel', 12, 2).map((z, k) => '<tspan x="' + (580 + i * 60 + 26) + '" dy="' + (k ? 10 : 0) + '">' + orteText(z) + '</tspan>').join('') + '</text></g></g>').join('') +
      /* Bleistift an der Schnur */
      '<g ' + T('stift', 'Der Bleistift an der Schnur. Immer da, nie weg.') + ' style="transform-origin:60px 90px"><circle cx="60" cy="90" r="4" fill="#c0392b"/><path class="ort-pendel" d="M60 92v36" stroke="#8a6a3e" stroke-width="1" style="transform-origin:60px 92px"/><g class="ort-pendel" style="transform-origin:60px 92px"><rect x="57" y="126" width="6" height="20" fill="#e8b43c"/><path d="M57 146l3 4 3-4z" fill="#2c2218"/></g></g>'
    ));
  } else if (r === 'cluster') {
    /* Der Küchentisch: Holz, ein aufgeschlagenes Heft mit einer Gedankenkarte in Bleistift, Tee, Kekse, roter Faden */
    const bretter = vomTyp('board').length;
    wrap.append(svg(
      '<defs><linearGradient id="ortholz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8895a"/><stop offset="1" stop-color="#8a6238"/></linearGradient></defs>' +
      '<rect width="800" height="150" fill="url(#ortholz)"/>' +
      '<g stroke="rgba(60,35,15,.18)" stroke-width="1.2" fill="none">' + [10, 38, 64, 92, 120, 146].map((y, i) => '<path d="M0 ' + y + ' C 200 ' + (y + (i % 2 ? 6 : -6)) + ', 420 ' + (y - 4) + ', 800 ' + (y + 3) + '"/>').join('') + '<ellipse cx="300" cy="54" rx="5" ry="12" opacity=".6"/><ellipse cx="300" cy="54" rx="2" ry="6" fill="rgba(60,35,15,.25)" stroke="none"/></g>' +
      orteV2Malerei('cluster', 'unten') +
      /* Das aufgeschlagene Heft mit einer Gedankenkarte */
      '<g ' + T('heft', 'Ein Gedanke, noch ein Gedanke, ein Strich dazwischen. So fängt es immer an.') + ' style="transform-origin:400px 80px"><g transform="rotate(-2 400 80)">' +
      '<rect x="262" y="24" width="138" height="112" fill="#f7efe0" stroke="#d9caa6"/><rect x="400" y="24" width="138" height="112" fill="#fbf6e8" stroke="#d9caa6"/><path d="M400 24v112" stroke="#c9bda0" stroke-width="2"/>' +
      '<g stroke="rgba(90,110,170,.16)">' + [44, 60, 76, 92, 108, 124].map((y) => '<line x1="270" y1="' + y + '" x2="530" y2="' + y + '"/>').join('') + '</g>' +
      /* Bleistift-Gedankenkarte */
      '<g fill="none" stroke="#5a5048" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="1 0" opacity=".85"><ellipse cx="470" cy="74" rx="28" ry="13"/><ellipse cx="420" cy="46" rx="16" ry="9"/><ellipse cx="512" cy="44" rx="15" ry="8"/><ellipse cx="432" cy="112" rx="18" ry="9"/><ellipse cx="510" cy="110" rx="16" ry="9"/><path d="M452 64l-20-10M488 64l14-12M458 84l-16 18M484 84l16 16"/></g>' +
      '<g font-family="\'Bradley Hand\', \'Segoe Print\', \'Chalkboard SE\', cursive" font-size="8" fill="#3a3028"><text x="470" y="77" text-anchor="middle">Idee</text><text x="420" y="49" text-anchor="middle">wer?</text><text x="512" y="47" text-anchor="middle">wo?</text><text x="432" y="115" text-anchor="middle">warum</text><text x="510" y="113" text-anchor="middle">dann</text></g>' +
      '<g fill="none" stroke="#5a5048" stroke-width="1.2" opacity=".75"><path d="M276 50c10-4 22-2 30 2M276 66c14-6 30-4 44 0M276 82c8-2 16-2 24 0M284 98c12-6 28-2 40 2"/><path d="M300 118c8-10 20-10 26 0" stroke="#b0352b"/></g>' +
      '<text x="290" y="40" font-family="\'Bradley Hand\', \'Segoe Print\', \'Chalkboard SE\', cursive" font-size="7.5" fill="#3a3028">' + bretter + (bretter === 1 ? ' Cluster' : ' Cluster') + ' · Gedanken</text>' +
      '</g>' + odGlanz('heft') + '</g>' +
      /* Zwei Zettel mit Messingnadeln und rotem Faden */
      '<g ' + T('faden', 'Der Faden spannt sich. Zwei Gedanken, die zusammengehören.') + '><g transform="rotate(-6 120 70)"><rect x="90" y="50" width="60" height="40" fill="#fbf6e8" stroke="#d9caa6"/><line x1="98" y1="62" x2="140" y2="62" stroke="#c9bda0"/><line x1="98" y1="72" x2="132" y2="72" stroke="#c9bda0"/></g><g transform="rotate(5 180 110)"><rect x="150" y="92" width="60" height="40" fill="#f7efe0" stroke="#d9caa6"/><line x1="158" y1="104" x2="200" y2="104" stroke="#c9bda0"/><line x1="158" y1="114" x2="192" y2="114" stroke="#c9bda0"/></g>' +
      '<path class="ort-faden-rot" d="M120 52 C 150 70, 160 80, 180 94" fill="none" stroke="#b0352b" stroke-width="1.6"/><circle cx="120" cy="52" r="3.5" fill="#c9a25a"/><circle cx="180" cy="94" r="3.5" fill="#c9a25a"/></g>' +
      /* Teetasse mit Dampf auf Untertasse, Kekse */
      /* Die Teetasse in Dreiviertelansicht: gerundeter Porzellankoerper mit
         Licht- und Schattenseite, Goldrand, Tee mit Spiegelung, Henkel mit
         Volumen, Untertasse mit Mulde, Schlagschatten auf dem Holz. */
      '<g ' + T('tasse', 'Der Tee dampft noch. Kein Grund zur Eile.') + ' style="transform-origin:640px 100px">' +
      '<defs><linearGradient id="ortporz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffdf7"/><stop offset=".35" stop-color="#f6efe0"/><stop offset=".8" stop-color="#d9ccb2"/><stop offset="1" stop-color="#b8a888"/></linearGradient>' +
      '<radialGradient id="ortuntert" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#fffdf6"/><stop offset=".7" stop-color="#efe6d2"/><stop offset="1" stop-color="#cdbf9f"/></radialGradient>' +
      '<radialGradient id="orttee" cx=".38" cy=".4" r=".7"><stop offset="0" stop-color="#b8743a"/><stop offset=".6" stop-color="#7a4518"/><stop offset="1" stop-color="#4a2a0e"/></radialGradient>' +
      '<linearGradient id="orthenkel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dfca"/><stop offset=".5" stop-color="#fbf7ee"/><stop offset="1" stop-color="#bcae90"/></linearGradient></defs>' +
      '<ellipse cx="645" cy="117" rx="46" ry="11" fill="rgba(60,30,10,.24)"/>' +
      '<ellipse cx="640" cy="112" rx="40" ry="10.5" fill="url(#ortuntert)" stroke="#bfae8a" stroke-width=".8"/>' +
      '<ellipse cx="640" cy="111" rx="27" ry="6.4" fill="rgba(150,130,95,.18)"/>' +
      '<path d="M604 108 Q 640 98 676 108" fill="none" stroke="#c9a25a" stroke-width=".9" opacity=".7"/>' +
      '<ellipse cx="643" cy="109.5" rx="23" ry="4.6" fill="rgba(70,45,20,.22)"/>' +
      '<path d="M661 90 C 676 88 677 106 659 104" fill="none" stroke="url(#orthenkel)" stroke-width="4.6" stroke-linecap="round"/>' +
      '<path d="M662 92.5 C 671 92 671 102 660 101.4" fill="none" stroke="rgba(120,100,70,.35)" stroke-width="1"/>' +
      '<path d="M618 86 C 618 99 626 109.5 640 109.5 C 654 109.5 662 99 662 86 Z" fill="url(#ortporz)"/>' +
      '<path d="M619.2 93 Q 640 100.5 660.8 93" fill="none" stroke="#c9a25a" stroke-width="1.1"/>' +
      '<path d="M623 89 C 623 98 628 105 636 107.5" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6" stroke-linecap="round"/>' +
      '<ellipse cx="640" cy="86" rx="22" ry="5.6" fill="#f7f1e4" stroke="#c9b892" stroke-width=".8"/>' +
      '<ellipse cx="640" cy="86.8" rx="19.4" ry="4.4" fill="url(#orttee)"/>' +
      '<ellipse cx="634" cy="85.8" rx="7" ry="1.4" fill="rgba(255,235,200,.35)"/>' +
      '<path d="M618.4 85.4 Q 640 79.6 661.6 85.4" fill="none" stroke="#c9a25a" stroke-width=".8"/>' +
      orteDampf(640, 80, 'rgba(255,255,255,.75)') + '</g>' +
      '<g ' + T('keks', 'Ein Keks. Für den Gedanken, der noch fehlt.') + ' style="transform-origin:716px 124px"><circle cx="716" cy="124" r="12" fill="#d9a85a"/><circle cx="711" cy="120" r="1.5" fill="#5a3a1a"/><circle cx="720" cy="126" r="1.5" fill="#5a3a1a"/><circle cx="714" cy="129" r="1.2" fill="#5a3a1a"/><path d="M724 116c4 4 6 8 4 12" stroke="#b8863f" stroke-width="1" fill="none"/>' + odGlanz('keks') + '</g>' +
      /* Kleiner Topf Kräuter links oben, Bleistift mit Spitzerspänen */
      /* Rosmarin im Terrakottatopf: Rand, Erde, Zweige mit nadelfeinen Blaettchen */
      '<g ' + T('kraut', 'Rosmarin. Riecht nach Sonntagmittag.') + ' style="transform-origin:40px 44px">' +
      '<defs><linearGradient id="ortterra" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d07a4c"/><stop offset=".4" stop-color="#b8603a"/><stop offset="1" stop-color="#7a3a1e"/></linearGradient></defs>' +
      '<ellipse cx="42" cy="54" rx="18" ry="3" fill="rgba(40,20,5,.3)"/>' +
      '<g class="ort-blaetter" stroke-linecap="round">' +
      [[40, 33, 36, 6, -.18], [36, 33, 30, 10, -.5], [44, 33, 48, 9, .45], [40, 33, 42, 4, .08], [33, 33, 24, 16, -.8], [47, 33, 56, 15, .75]].map(([x0, y0, x1, y1, w], i) =>
        '<path d="M' + x0 + ' ' + y0 + ' Q ' + ((x0 + x1) / 2 + w * 4).toFixed(1) + ' ' + ((y0 + y1) / 2).toFixed(1) + ' ' + x1 + ' ' + y1 + '" fill="none" stroke="#5a6b3c" stroke-width="1.3"/>' +
        Array.from({ length: 6 }, (_, k) => { const t = (k + 1) / 7, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; return '<path d="M' + px.toFixed(1) + ' ' + py.toFixed(1) + ' l ' + (-3.2 + w).toFixed(1) + ' -1.6 M' + px.toFixed(1) + ' ' + py.toFixed(1) + ' l ' + (3.2 + w).toFixed(1) + ' -1.6" stroke="' + (k % 2 ? '#6f8a4e' : '#4f6a3a') + '" stroke-width="1.5"/>'; }).join('')).join('') +
      '</g>' +
      '<path d="M26 35 L 54 35 L 51.4 52.6 C 51.2 53.6 28.8 53.6 28.6 52.6 Z" fill="url(#ortterra)"/>' +
      '<rect x="24" y="30.6" width="32" height="6" rx="1.6" fill="#c9714a"/><rect x="24" y="30.6" width="32" height="1.6" rx=".8" fill="rgba(255,220,190,.35)"/>' +
      '<ellipse cx="40" cy="31.4" rx="14" ry="1.4" fill="#3a2414"/>' +
      '<path d="M29 37 L 31 52" stroke="rgba(255,220,190,.3)" stroke-width="1.4" stroke-linecap="round"/>' +
      '</g>' +
      '<g ' + T('spitzer', 'Frisch gespitzt. Die Späne riechen nach Schule — im guten Sinn.') + ' style="transform-origin:560px 30px"><rect x="520" y="26" width="70" height="6" fill="#e8b43c" transform="rotate(-22 555 29)"/><path d="M586 14l10 0-6 6z" fill="#f3e1b0" transform="rotate(-22 590 17)"/><g fill="#e8c892" stroke="#b89040" stroke-width=".5"><path d="M596 36c6-3 10 0 8 5-5 2-9 0-8-5z"/><path d="M608 30c5-3 9 0 7 5-4 2-8 0-7-5z"/></g></g>'
    ));
  } else if (r === 'woerter') {
    /* Setzkasten: Lettern aus den Wörtern der Wortkisten — die neuesten zuerst; fehlen welche, aus den Titeln */
    const woerterDa = typeof woerterInKiste === 'function' ? woerterInKiste('alle', '', 'neu').map((w) => String(w.text || '').trim()).filter(Boolean) : [];
    const buchstaben = [...new Set(woerterDa.map((w) => w.slice(0, 1).toUpperCase()).filter((c) => /[A-ZÄÖÜ]/.test(c)))].slice(0, 12);
    for (const d of [...D.docs.values()].filter((d) => d.titel).sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))) { if (buchstaben.length >= 12) break; const c = d.titel.trim().slice(0, 1).toUpperCase(); if (/[A-ZÄÖÜ]/.test(c) && !buchstaben.includes(c)) buchstaben.push(c); }
    while (buchstaben.length < 12) buchstaben.push('VANISCHREIBT'[buchstaben.length]);
    const druck = woerterDa.slice(0, 3);
    wrap.dataset.woerter = druck.join(' · ');
    wrap.append(svg(
      '<rect width="800" height="150" fill="#2b2b2e"/><rect width="800" height="150" fill="url(#ortsetz)"/><defs><pattern id="ortsetz" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 6h12M6 0v12" stroke="rgba(255,255,255,.03)"/></pattern></defs>' +
      orteV2Malerei('woerter', 'unten') +
      /* Der Kasten mit Fächern */
      '<rect x="40" y="20" width="540" height="116" rx="4" fill="#5a4326"/><rect x="46" y="26" width="528" height="104" fill="#3a2a18"/>' +
      '<g stroke="#6b4a32" stroke-width="2">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => '<line x1="' + (46 + i * 44) + '" y1="26" x2="' + (46 + i * 44) + '" y2="130"/>').join('') + '<line x1="46" y1="78" x2="574" y2="78"/></g>' +
      buchstaben.map((c, i) => { const x = 52 + (i % 6) * 88 + (i % 2) * 6, y = 34 + Math.floor(i / 6) * 52; return '<g ' + T('letter', 'Die Letter „' + c + '“. Spiegelverkehrt, wie es sich gehört — gedruckt wird sie richtig.') + ' style="transform-origin:' + (x + 20) + 'px ' + (y + 18) + 'px"><rect x="' + x + '" y="' + y + '" width="40" height="36" rx="3" fill="#1f1f22"/><rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="34" height="30" rx="2" fill="#3d3d42"/><text x="' + (x + 20) + '" y="' + (y + 26) + '" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-weight="700" font-size="22" fill="#d9d4c8" transform="scale(-1 1) translate(-' + (2 * x + 40) + ' 0)">' + c + '</text>' + odGlanz('letter', x, y) + '</g>'; }).join('') + odGlanz('letterDefs') +
      /* Farbwalze rechts oben */
      '<g ' + T('walze', 'Die Farbwalze rollt. Schwarz wie Druckerschwärze.') + ' style="transform-origin:690px 50px">' + odFarbwalze() + '</g>' +
      /* Der Andruck: ein Papierbogen mit den neuesten Wörtern, richtig herum */
      '<g ' + T('andruck', druck.length ? 'Der Andruck: ' + druck.join(', ') + '.' : 'Der Andruck ist noch leer. Ein Wort in eine Kiste, und er füllt sich.') + ' style="transform-origin:700px 100px"><g transform="rotate(3 700 100)"><rect x="620" y="64" width="160" height="70" fill="#f3ecd9" stroke="#c9bda0"/><g stroke="rgba(0,0,0,.1)">' + [80, 96, 112, 128].map((y) => '<line x1="630" y1="' + y + '" x2="770" y2="' + y + '"/>').join('') + '</g>' +
      (druck.length ? druck.map((w, i) => '<text x="632" y="' + (92 + i * 16) + '" font-family="ui-serif, Georgia, serif" font-weight="700" font-size="12" fill="#1d1d1f" opacity="' + (0.92 - i * .12) + '">' + orteText(w.slice(0, 22)) + '</text>').join('') : '<text x="632" y="96" font-family="ui-serif, Georgia, serif" font-style="italic" font-size="10" fill="#8a7a62">noch kein Andruck</text>') + '</g></g>'
    ));
  } else if (r === 'klang') {
    const spielt = Object.values((D.einst && D.einst.ambience) || {}).some((v) => v > 0);
    wrap.append(svg(
      '<defs><linearGradient id="ortmusik" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3020"/><stop offset="1" stop-color="#2a1c12"/></linearGradient><linearGradient id="orthorn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c27a"/><stop offset=".5" stop-color="#b8863f"/><stop offset="1" stop-color="#e8c27a"/></linearGradient></defs>' +
      '<rect width="800" height="150" fill="url(#ortmusik)"/>' +
      '<rect x="0" y="120" width="800" height="30" fill="#3a2818"/><rect x="0" y="118" width="800" height="4" fill="#8a6a3e"/>' +
      orteV2Malerei('klang', 'unten') +
      /* Grammophon: Kasten, Teller, Horn */
      '<g ' + T('horn', 'Das Horn summt nach. Messing vergisst nichts.') + ' style="transform-origin:330px 80px">' + odGrammophonKasten() +
      /* Die Platte, schraeg von oben gesehen: eine Ellipse. Sie selbst darf sich
         NICHT drehen — eine gedrehte Ellipse kippt wie ein Propeller. Umriss,
         Rillen und Lichtreflex stehen still (wie bei einer echten Platte);
         es laeuft nur die Marke auf dem Etikett im Kreis. */
      '<g class="ort-platte' + (spielt ? ' dreht' : '') + '">' +
      '<defs><radialGradient id="ortvinyl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2a2420"/><stop offset=".35" stop-color="#121010"/><stop offset=".9" stop-color="#1c1816"/><stop offset="1" stop-color="#050404"/></radialGradient>' +
      '<radialGradient id="ortetikett" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d0704a"/><stop offset="1" stop-color="#8e3d22"/></radialGradient></defs>' +
      '<ellipse cx="300" cy="80.5" rx="41" ry="9.4" fill="rgba(0,0,0,.45)"/>' +
      '<ellipse cx="300" cy="78" rx="40" ry="9" fill="url(#ortvinyl)"/>' +
      [36, 32, 28, 24, 19, 15].map((r) => '<ellipse cx="300" cy="78" rx="' + r + '" ry="' + (r * .225).toFixed(2) + '" fill="none" stroke="rgba(255,255,255,' + (r % 8 === 0 ? '.07' : '.035') + ')" stroke-width=".6"/>').join('') +
      /* der stehende Glanz: zwei Lichtboegen auf den Rillen */
      '<path d="M268 74.6 Q 284 70.4 300 70.2" fill="none" stroke="rgba(255,250,235,.32)" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M310 85.6 Q 324 84.8 334 81.6" fill="none" stroke="rgba(255,250,235,.16)" stroke-width="1.2" stroke-linecap="round"/>' +
      '<ellipse cx="300" cy="78" rx="12" ry="2.8" fill="url(#ortetikett)"/>' +
      '<ellipse cx="300" cy="78" rx="12" ry="2.8" fill="none" stroke="rgba(255,230,190,.35)" stroke-width=".5"/>' +
      '<g class="ort-plattenmarke"><ellipse cx="307" cy="78" rx="2.6" ry=".75" fill="#f3e2c0"/></g>' +
      '<ellipse cx="300" cy="78" rx="1.3" ry=".5" fill="#d9d4c8"/></g>' +
      '<path d="M356 78c8-28 28-50 56-56" stroke="#8a6a2e" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      /* Ein Trichterhorn aus Messing: vom Hals zum Kelch, Segmentnaehte, dunkle Kehle, Lichtkante */
      '<defs><linearGradient id="orthorn2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5520"/><stop offset=".35" stop-color="#f2d38c"/><stop offset=".55" stop-color="#c9963e"/><stop offset="1" stop-color="#6e4a18"/></linearGradient>' +
      '<radialGradient id="ortkehle" cx=".38" cy=".5" r=".6"><stop offset="0" stop-color="#2a1a08"/><stop offset=".7" stop-color="#6e4a18"/><stop offset="1" stop-color="#b8863f"/></radialGradient></defs>' +
      '<path d="M413 18.6 Q 452 9 490.6 8.6 L 465.2 63.4 Q 440 38 418.4 26.6 Z" fill="url(#orthorn2)"/>' +
      '<g stroke="rgba(90,60,15,.45)" stroke-width=".8" fill="none"><path d="M415 21 Q 450 18 484 22"/><path d="M416.4 24 Q 446 32 474 44"/></g>' +
      '<ellipse cx="478" cy="36" rx="11.6" ry="30.2" transform="rotate(25 478 36)" fill="url(#ortkehle)"/>' +
      '<ellipse cx="478" cy="36" rx="11.6" ry="30.2" transform="rotate(25 478 36)" fill="none" stroke="#f6dc9a" stroke-width="1.8"/>' +
      '<path d="M418 18.4 Q 452 10.4 488 10" fill="none" stroke="rgba(255,250,225,.65)" stroke-width="1.4" stroke-linecap="round"/>' +
      '<rect x="410" y="18" width="10" height="9" rx="2" fill="#8a6a2e" transform="rotate(-12 415 22)"/>' +
      '<path d="M360 60l-20 18" stroke="#c9a25a" stroke-width="3" stroke-linecap="round"/><circle cx="360" cy="60" r="6" fill="#8a6a2e"/></g>' +
      /* Schwebende Noten, wenn etwas spielt */
      '<g class="ort-noten' + (spielt ? ' an' : '') + '" fill="#f3e7c9">' + [0, 1, 2].map((i) => '<g class="ort-note n' + i + '" style="transform-origin:' + (470 + i * 18) + 'px 40px"><ellipse cx="' + (470 + i * 18) + '" cy="40" rx="4" ry="3" transform="rotate(-20 ' + (470 + i * 18) + ' 40)"/><rect x="' + (473 + i * 18) + '" y="24" width="1.6" height="16"/><path d="M' + (474.6 + i * 18) + ' 24c4 2 6 6 4 10" fill="none" stroke="#f3e7c9" stroke-width="1.6"/></g>').join('') + '</g>' +
      /* Plattenhüllen links */
      '<g ' + T('huellen', 'Vier Platten, alle gut. Die Nadel entscheidet.') + ' style="transform-origin:130px 118px">' + [0, 1, 2, 3].map((i) => '<rect x="' + (80 + i * 28) + '" y="' + (48 + (i % 2) * 4) + '" width="26" height="70" rx="2" fill="' + ['#b0552f', '#5f7752', '#b8923f', '#4f7587'][i] + '" transform="rotate(' + (-6 + i * 3) + ' ' + (93 + i * 28) + ' 118)"/><rect x="' + (84 + i * 28) + '" y="' + (60 + (i % 2) * 4) + '" width="18" height="6" fill="rgba(255,255,255,.2)" transform="rotate(' + (-6 + i * 3) + ' ' + (93 + i * 28) + ' 118)"/>').join('') + odGlanz('huellen') + '</g>' +
      /* Metronom rechts, das Pendel schwingt */
      '<g ' + T('metronom', 'Tack. Tack. Tack. Dein Takt.') + ' style="transform-origin:700px 118px">' + odMetronom() + '</g>' +
      /* Kerze auf dem Kasten */
      '<g ' + T('kerze', 'Die Kerze flackert. Irgendwer hat die Tür offen gelassen.') + ' style="transform-origin:590px 118px">' + odKerze() + '</g>'
    ));
    /* Die Platten sind Klangbilder: eine auflegen startet sie */
    if (typeof KLANG_SZENEN !== 'undefined' && typeof mischungAnwenden === 'function') {
      const platten = el('div', { class: 'ort-chips' });
      for (const sz of KLANG_SZENEN.slice(0, 5)) platten.append(el('button', { class: 'ort-chip', onclick: async () => { try { await audioFreigeben(); mischungAnwenden({ ...sz.pegel }); toast('Die Nadel setzt auf: ' + sz.name, 2600); zeichne(); } catch (e) {} } }, '♪ ' + sz.name));
      platten.append(el('button', { class: 'ort-chip still', onclick: async () => { try { mischungAnwenden({}); if (typeof ambienceMischungAnwenden === 'function') await ambienceMischungAnwenden({}); toast('Die Nadel hebt ab.'); zeichne(); } catch (e) {} } }, 'Nadel heben'));
      wrap.append(platten);
    }
  } else if (r === 'faden') {
    wrap.append(svg(
      '<defs><linearGradient id="ortflur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a6450"/><stop offset="1" stop-color="#4a3a2c"/></linearGradient></defs>' +
      '<rect width="800" height="150" fill="url(#ortflur)"/><g opacity=".07" stroke="#ffe8c8" stroke-width="10">' + Array.from({ length: 17 }, (_, i) => '<line x1="' + (i * 50 + 10) + '" y1="0" x2="' + (i * 50 + 10) + '" y2="128"/>').join('') + '</g>' +
      '<rect x="0" y="128" width="800" height="22" fill="#3a2818"/><rect x="0" y="126" width="800" height="4" fill="#8a6a3e"/>' +
      orteV2Malerei('faden', 'unten') +
      /* Bank */
      '<g ' + T('bank', 'Die Bank knarzt. Setz dich, das Gespräch dauert.') + ' style="transform-origin:400px 128px">' + odBank() + '</g>' +
      /* Das Telefon: Wählscheibe, Hörer, Schnur */
      '<g ' + T('telefon', 'Brrr. Brrr. Jemand ruft die Wand an.') + ' style="transform-origin:625px 86px"><rect x="590" y="64" width="70" height="30" rx="8" fill="#2c2218"/><circle cx="625" cy="82" r="11" fill="#f3e7c9"/><circle cx="625" cy="82" r="7" fill="#2c2218"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => '<circle cx="' + (625 + 9 * Math.cos(i * .55)) + '" cy="' + (82 + 9 * Math.sin(i * .55)) + '" r="1.2" fill="#2c2218"/>').join('') + '<path d="M594 60c0-8 12-14 31-14s31 6 31 14" fill="none" stroke="#2c2218" stroke-width="9" stroke-linecap="round"/>' + odGlanz('telefon') + '<path class="ort-schnur" d="M660 86c10 10 4 22 16 30 10 6 8 14 14 12" fill="none" stroke="#2c2218" stroke-width="2" style="transform-origin:660px 86px"/></g>' +
      /* Notizblock mit Gekritzel und Stift */
      '<g ' + T('block', 'Drei Striche, ein Name, eine Nummer. Und ein Herz.') + ' style="transform-origin:440px 124px"><g transform="rotate(-8 440 116)"><rect x="410" y="100" width="60" height="36" fill="#fbf6e8" stroke="#c9bda0"/><g stroke="#5a5048" stroke-width="1.2" fill="none" opacity=".8"><path d="M418 110c8-3 16 0 24-2M418 118c10-2 20 2 30 0M418 126c6 0 12-2 18 0"/><path d="M450 126c-2-3 2-5 4-2 2-3 6-1 4 2l-4 4z" stroke="#b0352b"/></g></g><rect x="470" y="118" width="50" height="5" rx="2.5" fill="#2f5a7a" transform="rotate(20 495 120)"/></g>' +
      /* Lampe mit Lichtkegel, tippen schaltet */
      '<g ' + T('lampe', null, 'lampe') + ' style="transform-origin:160px 128px"><rect x="157" y="30" width="6" height="98" fill="#8a6a2e"/><ellipse cx="160" cy="128" rx="22" ry="5" fill="#8a6a2e"/><path d="M124 36h72l-12-20H136z" fill="#e8c27a"/>' + odGlanz('stehlampe') + '<ellipse class="ort-gluehbirne" cx="160" cy="34" rx="8" ry="4" fill="rgba(255,236,190,.9)"/><path class="ort-lichtkegel" d="M124 36h72l64 92H60z" fill="rgba(255,220,150,.22)"/></g>' +
      /* Garderobenhaken mit Hut und Regenschirm */
      odHakenleiste() + '<g ' + T('hut', 'Der Hut wartet auf den nächsten Anruf nach draußen.') + ' style="transform-origin:60px 38px">' + odHutAmHaken() + '</g>' +
      /* Pflanze rechts */
      '<g ' + T('pflanze', 'Der Farn wedelt. Er hört mit, sagt aber nichts.') + ' style="transform-origin:740px 128px">' + odFarn() + '</g>'
    ));
  } else if (r === 'feinheiten') {
    wrap.append(svg(
      '<defs><linearGradient id="ortwerk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6a6e"/><stop offset="1" stop-color="#3a3a3e"/></linearGradient></defs>' +
      '<rect width="800" height="150" fill="url(#ortwerk)"/><rect x="0" y="120" width="800" height="30" fill="#8a6a3e"/><rect x="0" y="118" width="800" height="4" fill="#c9a25a" opacity=".6"/>' +
      /* Lochwand mit Werkzeug */
      '<g fill="rgba(0,0,0,.25)">' + Array.from({ length: 60 }, (_, i) => '<circle cx="' + (20 + (i % 20) * 40) + '" cy="' + (16 + Math.floor(i / 20) * 30) + '" r="1.8"/>').join('') + '</g>' +
      orteV2Malerei('feinheiten', 'unten') +
      '<g ' + T('hammer', 'Klopf. Sitzt.') + ' style="transform-origin:110px 34px">' + odHammer() + '</g>' +
      '<g ' + T('saege', 'Die Säge singt, wenn man sie biegt.') + ' style="transform-origin:258px 34px">' + odSaege() + '</g>' +
      '<g ' + T('zange', 'Die Zange. Für Sätze, die nicht loslassen.') + ' style="transform-origin:320px 26px">' + odZange() + '</g>' +
      /* Die Werkzeugkiste */
      odWerkzeugkiste() +
      '<g ' + T('schrauber', 'Der Schraubendreher. Eine Vierteldrehung, und es sitzt.') + ' style="transform-origin:420px 80px">' + odSchrauber() + '</g>' +
      /* Wasserwaage mit Libelle, die beim Tippen wandert */
      '<g ' + T('waage', 'Die Libelle wandert. Und findet die Mitte wieder.') + ' style="transform-origin:720px 108px">' + odWasserwaage() + '</g>' +
      /* Maßband, Schrauben, Bleistiftstummel */
      '<g ' + T('massband', 'Fünf Meter. Reicht für einen langen Satz.') + ' style="transform-origin:60px 100px">' + odMassband() + '</g>' +
      odSchrauben() +
      '<g ' + T('stummel', 'Der Bleistiftstummel. Hat schon drei Bücher hinter sich.') + ' style="transform-origin:252px 110px">' + odStummel() + '</g>'
    ));
  } else return null;
  /* v2: die Zierschicht liegt deckungsgleich ueber dem Buehnenbild. */
  const zier = orteV2Zier(r);
  if (zier) { const z = svg(zier); z.classList.add('ort-v2-zier'); z.setAttribute('pointer-events', 'none'); wrap.append(z); }
  orteBeleben(wrap, o);
  return wrap;
}

/* Was die Dinge tun, wenn man sie antippt — über das Wackeln hinaus. */
const ORTE_TUN = {
  schreibmaschine() { if (typeof schreibmaschineOeffnen === 'function') schreibmaschineOeffnen(); },
  lampe(elm, wrap) { wrap.classList.toggle('licht-aus'); toast(wrap.classList.contains('licht-aus') ? 'Klick. Die Lampe ist aus.' : 'Klick. Die Lampe ist an.', 1400); },
  spiegel(elm, wrap) {
    const v = wrap.querySelector('.ort-spiegelbild'); if (v) { v.classList.add('gewischt'); setTimeout(() => v.classList.remove('gewischt'), 2600); }
    /* Ein Hauch auf dem Glas: mit dem Finger geschrieben, verschwindet wieder */
    const hauch = elm.querySelector('.ort-hauch'), text = elm.querySelector('.ort-hauch-text'); if (!hauch || !text) return;
    const n = (D.stats && D.stats.tage && D.stats.tage[tagKey()]) || 0;
    const anrede = typeof salonAnrede === 'function' ? salonAnrede() : '';
    const zeilen = [anrede ? 'Hallo, ' + anrede + '.' : 'Hallo, du.', n ? n + (n === 1 ? ' Wort' : ' Wörter') + ' heute' : 'noch kein Wort heute', 'Du schaffst das.', 'Schreib’s auf.', 'Nur ein Satz.', new Date().toLocaleDateString('de-DE', { weekday: 'long' }) + '.', 'Ich seh dich.', 'Ganz leise jetzt.'];
    wrap._hauchI = ((wrap._hauchI || 0) + 1) % zeilen.length;
    text.textContent = zeilen[wrap._hauchI];
    hauch.classList.remove('zeigt'); void hauch.getBoundingClientRect(); hauch.classList.add('zeigt');
    setTimeout(() => hauch.classList.remove('zeigt'), 3600);
  },
  oben() { const b = vomTyp('blatt').sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))[0]; if (b) oeffneSchreibraum(b.id); },
  neu() { if (typeof blattAusText === 'function') { const b = blattAusText('', ''); oeffneSchreibraum(b.id); } },
  letzter() { const s = vomTyp('schnipsel').filter((x) => (x.text || '').trim()).sort((a, b) => (b.angelegt || 0) - (a.angelegt || 0))[0]; if (s) oeffneDoc(s); },
  projekt(elm, wrap, arg) { const p = D.docs.get(arg); if (p) oeffneDoc(p); }
};
/* Tippen auf die Dinge: wackeln, ein Satz, ein Geräusch, manchmal eine Tat. */
function orteBeleben(wrap, o) {
  wrap.addEventListener('click', (ev) => {
    const ding = ev.target.closest('.ort-tipp'); if (!ding || !wrap.contains(ding)) return;
    ding.classList.remove('tippt'); void ding.getBoundingClientRect(); ding.classList.add('tippt');
    /* Ein zweites Antippen startet die Bewegung neu; der alte Zeitgeber darf sie nicht mittendrin abbrechen. */
    clearTimeout(ding._tippZeit); ding._tippZeit = setTimeout(() => ding.classList.remove('tippt'), 1500);
    /* 5.66: zu jeder Tipp-Bewegung ein kleiner Effekt am Ding (nur v2 mit Bewegung) */
    if (typeof orteFunken === 'function') { try { orteFunken(ding); } catch (e) {} }
    const tun = ding.dataset.tun || '';
    const [name, arg] = tun.split(':');
    if (o.geraeusche && !(typeof orteTon === 'function' && orteTon(ding.dataset.tipp)) && typeof schreibtischKlick === 'function') schreibtischKlick('tick');
    if (ding.dataset.sag && !(name && ['schreibmaschine', 'oben', 'neu', 'letzter', 'projekt'].includes(name))) toast(ding.dataset.sag, 2200);
    if (name && ORTE_TUN[name]) { try { ORTE_TUN[name](ding, wrap, arg); } catch (e) {} }
  });
  wrap.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('ort-tipp')) { ev.preventDefault(); ev.target.click(); } });
}

/* ----- Der Spiegel zeigt, wer davor sitzt: die Innenkamera, neblig und weich ----- */
let _orteStrom = null, _orteKameraVerweigert = false;
function orteKameraStopp() {
  if (_orteStrom) { try { _orteStrom.getTracks().forEach((t) => t.stop()); } catch (e) {} _orteStrom = null; }
  $$('.ort-spiegelbild').forEach((v) => v.remove()); $$('.ort-kulisse.kamera').forEach((k) => k.classList.remove('kamera'));
}
function orteSpiegelKamera(wrap) {
  if (_orteKameraVerweigert || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  const video = el('video', { autoplay: 'autoplay', playsinline: 'playsinline', muted: 'muted', 'aria-hidden': 'true' }); video.muted = true;
  const o = saubereOrte(D.einst.orte);
  const bild = el('div', { class: 'ort-spiegelbild' }, video, el('i', { class: 'ort-nebel' }), el('span', { class: 'ort-edding-html' }, o.spiegelZeile));
  wrap.append(bild);
  const legen = () => {
    const W = wrap.clientWidth, H = ORTE_H; if (!W) return;
    const s = Math.max(W / 800, 1), ox = (W - 800 * s) / 2, oy = (H - ORTE_H * s) / 2;
    bild.style.left = (ox + (540 - 44) * s) + 'px'; bild.style.top = (oy + (72 - 54) * s) + 'px'; bild.style.width = (88 * s) + 'px'; bild.style.height = (108 * s) + 'px';
  };
  legen();
  if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!wrap.isConnected) { ro.disconnect(); return; } legen(); }); ro.observe(wrap); }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } }, audio: false }).then((strom) => {
    if (!wrap.isConnected) { strom.getTracks().forEach((t) => t.stop()); return; }
    orteKameraStopp(); _orteStrom = strom; if (!bild.isConnected) wrap.append(bild); video.srcObject = strom; video.play().catch(() => {}); bild.classList.add('an'); wrap.classList.add('kamera');
  }).catch((e) => { if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) _orteKameraVerweigert = true; bild.remove(); toast('Die Kamera bleibt aus — der Spiegel zeigt dann eben den Nebel.', 3200); });
}

/* Drei Zettel aus dem Kasten — zufällig, nebeneinander. */
function orteKastenSchuetteln() {
  const alle = vomTyp('schnipsel').filter((s) => (s.text || '').trim());
  if (alle.length < 1) { toast('Der Kasten ist leer.'); return; }
  const drei = []; const rest = [...alle];
  while (drei.length < 3 && rest.length) drei.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  const kasten = el('div', { class: 'modal ort-zettelfenster' }, el('h2', {}, 'Geschüttelt'),
    el('div', { class: 'ort-zettel' }, ...drei.map((s, i) => el('button', { class: 'ort-zettelkarte', style: '--dreh:' + ((i - 1) * 2.5) + 'deg', onclick: () => { zu(); oeffneDoc(s); } }, el('span', {}, (s.text || '').slice(0, 220)), el('small', {}, fmtDatum(s.angelegt || 0))))),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: () => { zu(); orteKastenSchuetteln(); } }, 'Noch einmal schütteln'), el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}

/* ----- Der weisse Nebel oben am iPad -----
   Seit iPadOS 26 legt das System unter der Statusleiste einen weichen
   Schleier ueber den Inhalt, getoent in der `theme-color` der Seite. Die steht
   auf dem hellen Papierton — ueber der dunklen Wand einer Kulisse wurde daraus
   ein weisser Nebel. Solange eine Kulisse oben im Bild steht, bekommt die
   Leiste deshalb die Farbe ihrer Wand; rollt sie weg, wieder den Papierton. */
let _orteFarbBeob = null;
function orteObenFarbe(kulisse) {
  try {
    const svg = kulisse && kulisse.querySelector('svg');
    const rect = svg && svg.querySelector('rect');
    if (!rect) return '';
    const fill = rect.getAttribute('fill') || '';
    const verweis = fill.match(/^url\(#([\w-]+)\)$/);
    const farbe = verweis ? ((svg.querySelector('#' + verweis[1] + ' stop') || { getAttribute: () => '' }).getAttribute('stop-color') || '') : fill;
    return /^#[0-9a-f]{3,8}$/i.test(farbe) ? farbe : '';
  } catch (e) { return ''; }
}
function orteStatusFarbe(kulisse) {
  if (_orteFarbBeob) { try { _orteFarbBeob.disconnect(); } catch (e) {} _orteFarbBeob = null; }
  const m = typeof document !== 'undefined' && document.querySelector('meta[name="theme-color"]');
  if (!m) return;
  const grund = (typeof THEMEN !== 'undefined' && THEMEN[D.einst.thema]) || '#ece3d1';
  const farbe = kulisse ? orteObenFarbe(kulisse) : '';
  /* Safari 26 liest `theme-color` nicht ueberall mehr, sondern nimmt die
     Farbe dessen, was oben FEST steht. Dafuer gibt es ein Band, genau so hoch
     wie die Statusleiste — am Rechner ist das 0 Pixel, also unsichtbar. */
  let band = document.getElementById('statusband');
  if (!band && document.body) { band = document.createElement('div'); band.id = 'statusband'; band.setAttribute('aria-hidden', 'true'); document.body.append(band); }
  const zeigen = (an) => {
    m.content = an ? farbe : grund;
    if (band) { band.style.background = an ? farbe : ''; band.classList.toggle('an', !!an); }
  };
  if (!farbe || typeof IntersectionObserver !== 'function') { zeigen(false); return; }
  zeigen(true);
  /* Beobachtet wird nur der oberste Streifen des Fensters (5 %). */
  _orteFarbBeob = new IntersectionObserver((eintraege) => {
    const e = eintraege[eintraege.length - 1];
    zeigen(!!(e && e.isIntersecting && kulisse.isConnected));
  }, { rootMargin: '0px 0px -95% 0px' });
  _orteFarbBeob.observe(kulisse);
}

/* Beim Zeichnen eines Raums: Kulisse davor, Haut anlegen, Tür aufgehen lassen. */
let _orteLetzterRaum = null;
function orteAnwenden(haupt, raum) {
  const o = saubereOrte(D.einst.orte);
  document.documentElement.dataset.orte = o.an ? 'an' : 'aus';
  document.documentElement.dataset.orteBewegung = o.bewegung ? 'an' : 'aus';
  haupt.dataset.raum = raum;
  const an = orteAktiv(raum);
  haupt.dataset.ort = an ? orteRaumFuer(raum) : '';
  if (!(an && orteRaumFuer(raum) === 'zuhause')) orteKameraStopp();
  let kulisse = null;
  if (an) {
    try { kulisse = orteKulisse(raum, haupt); if (kulisse) haupt.prepend(kulisse); } catch (e) {}
  }
  orteStatusFarbe(kulisse);
  if (o.an && o.tueren && _orteLetzterRaum !== null && _orteLetzterRaum !== raum) {
    haupt.classList.add('tuer-auf'); setTimeout(() => haupt.classList.remove('tuer-auf'), 520);
    if (o.geraeusche && typeof schreibtischKlick === 'function') schreibtischKlick('klick');
  }
  if (o.an && o.raumklang) orteRaumklang(raum, an);
  _orteLetzterRaum = raum;
}

/* Ein leiser Grundton je Ort — nur wenn gewollt, nur wenn sich der Raum ändert. */
const ORTE_KLANG = { zuhause: { uhr: .16 }, schnipsel: { cafe: .14 }, blaetter: { blaetter: .12 }, hefte: { kamin: .1 }, projekte: { kamin: .14 }, cluster: { cafe: .1 }, woerter: { uhr: .1 }, faden: { regendach: .12 }, feinheiten: {} };
let _orteKlangRaum = null;
function orteRaumklang(raum, an) {
  if (typeof ambienceMischungAnwenden !== 'function') return;
  const r = orteRaumFuer(raum);
  if (r === _orteKlangRaum) return; _orteKlangRaum = r;
  if (r === 'klang' || r === 'schreibtisch' || r === 'salon') return;   /* dort regiert der eigene Klang */
  const ziel = an ? (ORTE_KLANG[r] || {}) : {};
  const jetzt = D.einst.ambience || {};
  /* Nicht in etwas hineinreden, das die Nutzerin selbst angestellt hat: nur leise Raumtöne ersetzen */
  const fremd = Object.keys(jetzt).some((k) => jetzt[k] > .3);
  if (fremd) return;
  ambienceMischungAnwenden(ziel).catch(() => {});
}

/* Die Karte in den Feinheiten: Hauptschalter, Türen, Geräusche, Bewegung, Spiegel, je Raum. */
function orteKarte() {
  const o = saubereOrte(D.einst.orte);
  const speichern = () => { D.einst.orte = o; speichereEinst(); document.documentElement.dataset.orte = o.an ? 'an' : 'aus'; document.documentElement.dataset.orteBewegung = o.bewegung ? 'an' : 'aus'; };
  const schalter = (lies, setze) => el('button', { class: 'schalter' + (lies() ? ' an' : ''), onclick: (e) => { setze(!lies()); e.currentTarget.classList.toggle('an', lies()); speichern(); } }, el('i'));
  const zeile = (name, unter, s) => el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, name, unter ? el('div', { style: 'font-size:12.5px;color:var(--blass)' }, unter) : null), s);
  const liste = el('div', { class: 'orte-liste' + (o.an ? '' : ' aus') });
  for (const [id, name] of ORTE_RAEUME) liste.append(zeile(name, null, schalter(() => o[id], (v) => { o[id] = v; })));
  const spiegel = el('input', { type: 'text', maxlength: '60', value: o.spiegelZeile, placeholder: ORTE_SPIEGELZEILE, 'aria-label': 'Zeile auf dem Spiegel' });
  spiegel.addEventListener('change', () => { o.spiegelZeile = spiegel.value.trim() || ORTE_SPIEGELZEILE; speichern(); toast('Steht jetzt auf dem Spiegel.', 1600); });
  const katzeName = el('input', { type: 'text', maxlength: '24', value: o.katzeName, placeholder: 'Die Katze', 'aria-label': 'Name der Katze' });
  katzeName.addEventListener('change', () => { o.katzeName = katzeName.value.trim().slice(0, 24) || (typeof KATZE_STANDARD_NAME !== 'undefined' ? KATZE_STANDARD_NAME : 'Die Katze'); speichern(); toast(o.katzeName + ' hört jetzt darauf. Vielleicht.', 1800); });
  return el('div', { class: 'karte' },
    zeile('Räume als Orte', 'Jeder Raum bekommt eine Kulisse und eine Haut: Diele, Zettelkasten, Papierstapel, Lesetisch mit Schreibmaschine, Korkwand, Küchentisch, Setzkasten, Musikzimmer, Telefonbank, Werkzeugkasten. Alles bleibt bedienbar wie vorher — nur schöner. Vieles darin reagiert, wenn man es antippt.', schalter(() => o.an, (v) => { o.an = v; liste.classList.toggle('aus', !v); })),
    zeile('Kleine Bewegungen', 'Dampf steigt, der Schal wiegt, die Katze zuckt mit dem Schwanz. Aus, wenn es ruhig sein soll.', schalter(() => o.bewegung, (v) => { o.bewegung = v; })),
    zeile('Türen gehen auf', 'Beim Raumwechsel schwenkt der Raum kurz herein.', schalter(() => o.tueren, (v) => { o.tueren = v; })),
    zeile('Ein leises Geräusch dazu', 'Ein Klick wie ein Türgriff — und ein Tick, wenn man etwas antippt.', schalter(() => o.geraeusche, (v) => { o.geraeusche = v; })),
    zeile('Raumklang', 'Je Ort ein leiser Grundton (Diele: die Uhr, Zettelkasten: Café, Korkwand: Kamin …). Laute eigene Mischungen bleiben unangetastet.', schalter(() => o.raumklang, (v) => { o.raumklang = v; })),
    el('div', { class: 'einstellzeile orte-spiegelzeile' }, el('span', { class: 'ename' }, 'Mit Edding auf dem Spiegel', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Die Zeile, die in der Diele über den Spiegel gekritzelt ist. Schreib deine eigene.')), spiegel),
    el('div', { class: 'einstellzeile orte-spiegelzeile' }, el('span', { class: 'ename' }, 'Wie die Katze heißt', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Sie liegt unter der Konsole in der Diele. Antippen, halten, streicheln.')), katzeName),
    zeile('Die Katze macht Geräusche', 'Echtes Miauen und Schnurren, leise.', schalter(() => o.katzeTon, (v) => { o.katzeTon = v; })),
    zeile('Der Spiegel zeigt dich', 'Die Innenkamera malt ein nebliges, weich umrandetes Spiegelbild in den Dielenspiegel. Nur auf diesem Gerät, nur während du in der Diele bist — nichts wird gespeichert oder gesendet. Einmal erlauben, dann bleibt es.', schalter(() => o.spiegelKamera, (v) => { o.spiegelKamera = v; _orteKameraVerweigert = false; if (!v) orteKameraStopp(); })),
    liste,
    el('div', { style: 'font-size:12px;color:var(--blass);margin-top:8px' }, 'Schreibtisch und Salon sind immer Orte — sie sind dafür gebaut.'));
}
