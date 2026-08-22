/* ===================== 57 — RÄUME ALS ORTE =====================
   Jeder Raum bekommt eine Kulisse und eine Haut: das Zuhause wird Diele, die
   Schnipsel ein Zettelkasten, die Blätter ein Papierstapel, die Projekte eine
   Korkwand, das Cluster ein Tischtuch, die Wörter ein Setzkasten, der Klang
   ein Musikzimmer, der Faden eine Telefonbank, die Feinheiten ein Werkzeug-
   kasten. Alles ist zuschaltbar (Feinheiten → „Räume als Orte"), standard-
   mäßig aus, je Raum einzeln — und die Türen dürfen beim Wechsel aufgehen. */

const ORTE_RAEUME = [
  ['zuhause', 'Zuhause als Diele'], ['schnipsel', 'Schnipsel als Zettelkasten'], ['blaetter', 'Blätter als Papierstapel'],
  ['hefte', 'Hefte mit Lesetisch'], ['projekte', 'Projekte als Korkwand'], ['cluster', 'Cluster auf dem Tischtuch'],
  ['woerter', 'Wörter als Setzkasten'], ['klang', 'Klang als Musikzimmer'], ['faden', 'Faden als Telefonbank'], ['feinheiten', 'Feinheiten als Werkzeugkasten']
];
/* Einstellungen säubern: an (Hauptschalter, Standard aus), tueren, geraeusche, je Raum. Pur. */
function saubereOrte(roh) {
  const q = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  const o = { an: q.an === true, tueren: q.tueren !== false, geraeusche: q.geraeusche === true, raumklang: q.raumklang === true };
  for (const [id] of ORTE_RAEUME) o[id] = q[id] !== false;
  return o;
}
/* Welcher Ort zu einem Routen-Raum gehört (heft → hefte usw.). Pur. */
function orteRaumFuer(raum) { return { heft: 'hefte', projekt: 'projekte', brett: 'cluster' }[raum] || raum; }
function orteAktiv(raum) {
  const o = saubereOrte(D.einst.orte), r = orteRaumFuer(raum);
  return o.an && o[r] === true && ORTE_RAEUME.some((x) => x[0] === r);
}

/* ----- Die Kulissen: kleine Bühnenbilder oben im Raum ----- */
const ORTE_SVG = 'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"';
function orteKulisse(raum, haupt) {
  const r = orteRaumFuer(raum);
  const wrap = el('div', { class: 'ort-kulisse ort-' + r });
  const svg = (inner, vb = '0 0 800 120') => { const d = document.createElement('div'); d.innerHTML = '<svg ' + ORTE_SVG + ' viewBox="' + vb + '" class="ort-bild">' + inner + '</svg>'; return d.firstElementChild; };
  if (r === 'zuhause') {
    wrap.append(svg(
      '<rect width="800" height="120" fill="url(#ortw)"/>' +
      '<defs><linearGradient id="ortw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a32"/><stop offset="1" stop-color="#3a2818"/></linearGradient></defs>' +
      /* Garderobenleiste mit Haken, Hut und Schal */
      '<rect x="60" y="22" width="300" height="10" rx="3" fill="#c9a25a"/><g fill="#8a6a2e">' + [90, 150, 210, 270, 330].map((x) => '<circle cx="' + x + '" cy="38" r="4"/><rect x="' + (x - 2) + '" y="38" width="4" height="10"/>').join('') + '</g>' +
      '<path d="M130 48c-18 0-26 14-26 26h52c0-12-8-26-26-26z" fill="#2c2218"/><rect x="96" y="72" width="68" height="6" rx="3" fill="#2c2218"/>' +
      '<path class="ort-schal" d="M272 48c-6 20-2 40 4 60M284 48c6 20 2 40-4 60" stroke="#b0552f" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      /* Spiegel */
      '<ellipse cx="520" cy="60" rx="44" ry="52" fill="#d9e0e4"/><ellipse cx="520" cy="60" rx="40" ry="48" fill="url(#ortspiegel)"/><defs><linearGradient id="ortspiegel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f6f5"/><stop offset=".5" stop-color="#cfd8db"/><stop offset="1" stop-color="#e8eeee"/></linearGradient></defs><ellipse cx="520" cy="60" rx="44" ry="52" fill="none" stroke="#c9a25a" stroke-width="5"/>' +
      /* Konsole mit Briefen */
      '<rect x="620" y="74" width="150" height="8" rx="2" fill="#c9a25a"/><rect x="628" y="82" width="6" height="38" fill="#8a6a2e"/><rect x="756" y="82" width="6" height="38" fill="#8a6a2e"/>' +
      '<g transform="rotate(-6 680 64)"><rect x="650" y="54" width="60" height="22" fill="#f1e4c8"/><path d="M650 54l30 14 30-14" fill="none" stroke="#c9a25a" stroke-width="1.5"/></g><g transform="rotate(5 700 66)"><rect x="672" y="58" width="60" height="22" fill="#f6ecd6"/><circle cx="702" cy="69" r="4" fill="#b0552f"/></g>'
    ));
    /* Neuigkeiten: was in den Räumen wartet */
    const chips = el('div', { class: 'ort-chips' });
    try {
      if (typeof SALON_AUTOREN !== 'undefined') { const tag = tagKey(); const wer = SALON_AUTOREN[salonHash(tag) % SALON_AUTOREN.length]; chips.append(el('button', { class: 'ort-chip', onclick: () => { location.hash = '#/salon'; } }, 'Im Salon rät heute ' + wer.name.split(' ').pop())); }
      const briefe = vomTyp('brief').filter((b) => typeof briefIstOffen === 'function' && briefIstOffen(b) && b.versiegelt).length;
      if (briefe) chips.append(el('button', { class: 'ort-chip', onclick: () => { location.hash = '#/schreibtisch'; } }, briefe === 1 ? 'Ein Brief darf geöffnet werden' : briefe + ' Briefe dürfen geöffnet werden'));
      const buch = typeof lesestapelBuecher === 'function' ? lesestapelBuecher()[0] : null;
      if (buch && buch.seiten) chips.append(el('button', { class: 'ort-chip', onclick: () => buchOeffnen(buch) }, 'Weiterlesen: ' + (buch.titel || 'Buch').slice(0, 28) + ' · ' + buchFortschritt(buch.seite, buch.seiten) + ' %'));
      const heute = D.stats.tage[tagKey()] || 0;
      chips.append(el('span', { class: 'ort-chip still' }, heute ? heute + ' Wörter heute' : 'Heute noch kein Wort — die Tasse wartet'));
    } catch (e) {}
    wrap.append(chips);
  } else if (r === 'schnipsel') {
    /* Zettelkasten: ein Holzkasten mit sieben Karteireitern — ein Reiter je Tag der letzten Woche */
    const tage = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); tage.push(d); }
    const alle = vomTyp('schnipsel');
    const zahlen = tage.map((d) => { const k = tagKey(d); return alle.filter((s) => tagKey(s.angelegt || 0) === k).length; });
    const namen = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    wrap.append(svg(
      '<rect x="40" y="46" width="720" height="74" rx="6" fill="#6b4a32"/><rect x="40" y="46" width="720" height="8" fill="#8a6a3e"/>' +
      tage.map((d, i) => { const x = 70 + i * 98; const n = zahlen[i]; return '<g><rect x="' + x + '" y="' + (n ? 18 : 28) + '" width="84" height="40" rx="3" fill="' + (n ? '#f3e7c9' : '#d8cfb8') + '" stroke="#b39b6a"/><text x="' + (x + 42) + '" y="' + (n ? 40 : 50) + '" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-size="13" fill="#5a4326">' + namen[d.getDay()] + (n ? ' · ' + n : '') + '</text></g>'; }).join('')
    ));
    wrap.append(el('div', { class: 'ort-chips' }, el('button', { class: 'ort-chip', onclick: () => orteKastenSchuetteln() }, 'Kasten schütteln — drei Zettel')));
  } else if (r === 'blaetter') {
    const n = vomTyp('blatt').length; const oben = vomTyp('blatt').sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))[0];
    wrap.append(svg(
      [0, 1, 2, 3, 4].map((i) => '<g transform="translate(' + (330 + i * 3) + ' ' + (90 - i * 7) + ') rotate(' + ((i % 2 ? 1 : -1) * (i * .8)) + ')"><rect x="-120" y="-70" width="240" height="76" fill="#f7efe0" stroke="#d9caa6"/><path d="M100 -70l20 20h-20z" fill="#e3d5b4"/></g>').join('') +
      '<text x="330" y="58" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-size="14" fill="#5a4326">' + (oben ? (oben.titel || (oben.text || '').split('\n')[0] || 'Ohne Titel').slice(0, 40).replace(/[<&]/g, '') : 'Ein leerer Stapel') + '</text>' +
      '<text x="330" y="82" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-size="11" fill="#8a7a62">' + n + (n === 1 ? ' Blatt' : ' Blätter') + ' auf dem Stapel</text>'
    ));
  } else if (r === 'hefte') {
    wrap.append(svg(
      '<rect x="0" y="100" width="800" height="20" fill="#6b4a32"/><rect x="0" y="96" width="800" height="6" fill="#8a6a3e"/>' +
      /* Leselampe */
      '<rect x="118" y="40" width="6" height="58" fill="#8a6a2e"/><path d="M90 44h62l-10-22H100z" fill="#2f6b4f"/><ellipse cx="121" cy="98" rx="22" ry="5" fill="#8a6a2e"/><path class="ort-lichtkegel" d="M90 44h62l50 56H40z" fill="rgba(255,220,150,.25)"/>' +
      /* Pflanze */
      '<rect x="640" y="70" width="40" height="28" rx="3" fill="#a3562f"/><path d="M660 70c-6-18-22-26-34-26 4 16 16 26 34 26zm0 0c6-18 22-26 34-26-4 16-16 26-34 26zm0 0c-2-22 4-34 10-44 6 14 4 30-10 44z" fill="#4a7a46"/>' +
      /* eine Brille */
      '<g stroke="#2c2218" stroke-width="2" fill="none"><circle cx="380" cy="90" r="9"/><circle cx="404" cy="90" r="9"/><path d="M389 90h6M371 88l-14-4M413 88l14-4"/></g>'
    ));
  } else if (r === 'projekte') {
    wrap.append(svg(
      '<rect width="800" height="120" fill="#b8915e"/><rect width="800" height="120" fill="url(#ortkork)"/><defs><pattern id="ortkork" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r="1.6" fill="rgba(90,60,30,.25)"/><circle cx="19" cy="20" r="1.2" fill="rgba(90,60,30,.2)"/><circle cx="23" cy="5" r="1" fill="rgba(255,240,210,.25)"/></pattern></defs>' +
      /* Karten mit Nadeln und roter Schnur */
      [[120, 30, -4], [300, 48, 3], [500, 26, -2], [660, 52, 4]].map(([x, y, d]) => '<g transform="rotate(' + d + ' ' + (x + 45) + ' ' + (y + 28) + ')"><rect x="' + x + '" y="' + y + '" width="90" height="56" fill="#f7efe0" stroke="#d9caa6"/><line x1="' + (x + 10) + '" y1="' + (y + 18) + '" x2="' + (x + 70) + '" y2="' + (y + 18) + '" stroke="#c9bda0"/><line x1="' + (x + 10) + '" y1="' + (y + 30) + '" x2="' + (x + 60) + '" y2="' + (y + 30) + '" stroke="#c9bda0"/><circle cx="' + (x + 45) + '" cy="' + (y + 4) + '" r="5" fill="#c0392b"/><circle cx="' + (x + 43) + '" cy="' + (y + 2) + '" r="1.5" fill="#fff" opacity=".6"/></g>').join('') +
      '<path d="M165 34 Q 260 10 345 52 T 545 30 T 705 56" fill="none" stroke="#b0352b" stroke-width="1.6"/>'
    ));
  } else if (r === 'cluster') {
    wrap.append(svg(
      '<rect width="800" height="120" fill="#e9e2d2"/><rect width="800" height="120" fill="url(#ortleinen)"/><defs><pattern id="ortleinen" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="rgba(90,74,52,.08)"/></pattern></defs>' +
      [[160, 70, 26, '#8a8f96'], [260, 56, 18, '#b0552f'], [400, 72, 30, '#5f7752'], [560, 52, 20, '#b8923f'], [660, 74, 24, '#6f6c66']].map(([x, y, rr, f]) => '<ellipse cx="' + x + '" cy="' + (y + 6) + '" rx="' + (rr + 4) + '" ry="' + (rr * .4) + '" fill="rgba(0,0,0,.12)"/><ellipse cx="' + x + '" cy="' + y + '" rx="' + rr + '" ry="' + (rr * .75) + '" fill="' + f + '"/>').join('') +
      '<path d="M186 70 Q 220 40 244 58 M290 56 Q 340 90 372 72 M430 70 Q 500 40 542 54 M580 54 Q 620 90 638 74" fill="none" stroke="#8a6a2e" stroke-width="1.4"/>'
    ));
  } else if (r === 'woerter') {
    /* Setzkasten: Lettern aus den ersten Buchstaben der letzten Titel */
    const buchstaben = [...new Set([...D.docs.values()].filter((d) => d.titel).sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0)).map((d) => d.titel.trim().slice(0, 1).toUpperCase()).filter((c) => /[A-ZÄÖÜ]/.test(c)))].slice(0, 12);
    while (buchstaben.length < 12) buchstaben.push('VANISCHREIBT'[buchstaben.length]);
    wrap.append(svg(
      '<rect x="40" y="14" width="720" height="96" rx="4" fill="#5a4326"/><rect x="46" y="20" width="708" height="84" fill="#3a2a18"/>' +
      buchstaben.map((c, i) => { const x = 62 + i * 57, y = 30 + (i % 2) * 30; return '<g><rect x="' + x + '" y="' + y + '" width="44" height="38" rx="3" fill="#2b2b2e"/><rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="38" height="32" rx="2" fill="#3d3d42"/><text x="' + (x + 22) + '" y="' + (y + 27) + '" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-weight="700" font-size="22" fill="#d9d4c8" transform="scale(-1 1) translate(-' + (2 * x + 44) + ' 0)">' + c + '</text></g>'; }).join('')
    ));
  } else if (r === 'klang') {
    const spielt = Object.values((D.einst && D.einst.ambience) || {}).some((v) => v > 0);
    wrap.append(svg(
      '<rect x="240" y="20" width="320" height="90" rx="6" fill="#6b4a32"/><rect x="240" y="20" width="320" height="8" fill="#8a6a3e"/>' +
      '<g class="ort-platte' + (spielt ? ' dreht' : '') + '" style="transform-origin:340px 66px"><circle cx="340" cy="66" r="38" fill="#141110"/><circle cx="340" cy="66" r="30" fill="none" stroke="rgba(255,255,255,.06)"/><circle cx="340" cy="66" r="22" fill="none" stroke="rgba(255,255,255,.05)"/><circle cx="340" cy="66" r="12" fill="#b0552f"/><circle cx="340" cy="66" r="2" fill="#141110"/></g>' +
      '<path d="M470 34l-40 36" stroke="#c9a25a" stroke-width="4" stroke-linecap="round"/><circle cx="470" cy="34" r="7" fill="#8a6a2e"/>' +
      '<rect x="490" y="50" width="40" height="40" rx="3" fill="#3a2818"/><circle cx="510" cy="70" r="9" fill="#c9a25a"/>' +
      /* Plattenhüllen links */
      [0, 1, 2, 3].map((i) => '<rect x="' + (80 + i * 28) + '" y="' + (40 + (i % 2) * 4) + '" width="26" height="70" rx="2" fill="' + ['#b0552f', '#5f7752', '#b8923f', '#4f7587'][i] + '" transform="rotate(' + (-6 + i * 3) + ' ' + (93 + i * 28) + ' 110)"/>').join('')
    ));
  } else if (r === 'faden') {
    wrap.append(svg(
      '<rect x="0" y="104" width="800" height="16" fill="#6b4a32"/>' +
      /* Bank */
      '<rect x="250" y="70" width="300" height="14" rx="4" fill="#8a6a3e"/><rect x="262" y="84" width="10" height="22" fill="#6b4a32"/><rect x="528" y="84" width="10" height="22" fill="#6b4a32"/><rect x="250" y="40" width="300" height="30" rx="8" fill="#a3562f"/>' +
      /* Telefon */
      '<rect x="590" y="60" width="70" height="26" rx="6" fill="#2c2218"/><path d="M596 58c0-8 10-12 29-12s29 4 29 12" fill="none" stroke="#2c2218" stroke-width="8" stroke-linecap="round"/><path class="ort-schnur" d="M660 78c10 8 6 22 16 26" fill="none" stroke="#2c2218" stroke-width="2"/>' +
      /* Lampe */
      '<rect x="160" y="14" width="6" height="90" fill="#8a6a2e"/><path d="M128 24h70l-12-18H140z" fill="#e8c27a"/><path class="ort-lichtkegel" d="M128 24h70l60 80H70z" fill="rgba(255,220,150,.22)"/>'
    ));
  } else if (r === 'feinheiten') {
    wrap.append(svg(
      '<rect x="240" y="40" width="320" height="70" rx="6" fill="#b0352b"/><rect x="240" y="40" width="320" height="10" fill="#8a2a22"/><rect x="370" y="28" width="60" height="14" rx="4" fill="#2c2218"/>' +
      '<g stroke="#d9d4c8" stroke-width="5" stroke-linecap="round" fill="none"><path d="M270 62l30 30M300 62l-30 30"/><path d="M340 64v30"/><rect x="332" y="56" width="16" height="10" rx="2" fill="#d9d4c8"/><path d="M390 64l26 26"/><circle cx="392" cy="66" r="7"/><path d="M470 62h40M490 62v30" /><path d="M520 64l20 20"/></g>'
    ));
  } else return null;
  return wrap;
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

/* Beim Zeichnen eines Raums: Kulisse davor, Haut anlegen, Tür aufgehen lassen. */
let _orteLetzterRaum = null;
function orteAnwenden(haupt, raum) {
  const o = saubereOrte(D.einst.orte);
  document.documentElement.dataset.orte = o.an ? 'an' : 'aus';
  haupt.dataset.raum = raum;
  const an = orteAktiv(raum);
  haupt.dataset.ort = an ? orteRaumFuer(raum) : '';
  if (an) {
    try { const k = orteKulisse(raum, haupt); if (k) haupt.prepend(k); } catch (e) {}
  }
  if (o.an && o.tueren && _orteLetzterRaum !== null && _orteLetzterRaum !== raum) {
    haupt.classList.add('tuer-auf'); setTimeout(() => haupt.classList.remove('tuer-auf'), 520);
    if (o.geraeusche && typeof schreibtischKlick === 'function') schreibtischKlick('klick');
  }
  if (o.an && o.raumklang) orteRaumklang(raum, an);
  _orteLetzterRaum = raum;
}

/* Ein leiser Grundton je Ort — nur wenn gewollt, nur wenn sich der Raum ändert. */
const ORTE_KLANG = { zuhause: { uhr: .16 }, schnipsel: { cafe: .14 }, blaetter: { blaetter: .12 }, hefte: { kamin: .1 }, projekte: { kamin: .14 }, cluster: { wind: .1 }, woerter: { uhr: .1 }, faden: { regendach: .12 }, feinheiten: {} };
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

/* Die Karte in den Feinheiten: Hauptschalter, Türen, Geräusche, je Raum. */
function orteKarte() {
  const o = saubereOrte(D.einst.orte);
  const speichern = () => { D.einst.orte = o; speichereEinst(); document.documentElement.dataset.orte = o.an ? 'an' : 'aus'; };
  const schalter = (lies, setze) => el('button', { class: 'schalter' + (lies() ? ' an' : ''), onclick: (e) => { setze(!lies()); e.currentTarget.classList.toggle('an', lies()); speichern(); } }, el('i'));
  const zeile = (name, unter, s) => el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, name, unter ? el('div', { style: 'font-size:12.5px;color:var(--blass)' }, unter) : null), s);
  const liste = el('div', { class: 'orte-liste' + (o.an ? '' : ' aus') });
  for (const [id, name] of ORTE_RAEUME) liste.append(zeile(name, null, schalter(() => o[id], (v) => { o[id] = v; })));
  return el('div', { class: 'karte' },
    zeile('Räume als Orte', 'Jeder Raum bekommt eine Kulisse und eine Haut: Diele, Zettelkasten, Papierstapel, Korkwand, Tischtuch, Setzkasten, Musikzimmer, Telefonbank, Werkzeugkasten. Alles bleibt bedienbar wie vorher — nur schöner.', schalter(() => o.an, (v) => { o.an = v; liste.classList.toggle('aus', !v); })),
    zeile('Türen gehen auf', 'Beim Raumwechsel schwenkt der Raum kurz herein.', schalter(() => o.tueren, (v) => { o.tueren = v; })),
    zeile('Ein leises Geräusch dazu', 'Ein Klick wie ein Türgriff — nur mit Orten.', schalter(() => o.geraeusche, (v) => { o.geraeusche = v; })),
    zeile('Raumklang', 'Je Ort ein leiser Grundton (Diele: die Uhr, Zettelkasten: Café, Korkwand: Kamin …). Laute eigene Mischungen bleiben unangetastet.', schalter(() => o.raumklang, (v) => { o.raumklang = v; })),
    liste,
    el('div', { style: 'font-size:12px;color:var(--blass);margin-top:8px' }, 'Schreibtisch und Salon sind immer Orte — sie sind dafür gebaut.'));
}
