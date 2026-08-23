/* ===================== 57c — DIE KATZE IN DER DIELE =====================
   Eine Katze liegt unter der Konsole. Sie atmet, der Schwanz zuckt, die Ohren
   auch; nachts schläft sie tief (mit z), tagsüber wird sie wach, wenn man sie
   anstupst: blinzeln, schnurren, strecken, Pfote putzen, miauen, wieder
   einrollen. Hält man den Finger auf ihr, wird sie gestreichelt und schnurrt,
   solange man bleibt — Herzen steigen auf. Ist sie wach, folgen ihre Augen
   dem Zeiger. Die Geräusche sind echte Katzen (klang/katze-*.wav, siehe
   klang/quellen.json), leise, abschaltbar. Name und Ton in den Feinheiten. */

const KATZE_STANDARD_NAME = 'Die Katze';
/* Der Zustand der Katze aus Stunde und Stimmung: schlaeft / doest / wach. Pur. */
function katzeZustand(stunde, woerterHeute) {
  if (stunde >= 22 || stunde < 7) return 'schlaeft';
  if (stunde < 9) return 'doest';
  return woerterHeute > 0 ? 'doest' : 'schlaeft';
}
/* Die nächste Tat im Kreis. Pur. */
const KATZE_TATEN = ['blinzelt', 'schnurrt', 'streckt', 'putzt', 'miaut', 'rollt'];
function katzeNaechsteTat(letzte) { const i = KATZE_TATEN.indexOf(letzte); return KATZE_TATEN[(i + 1) % KATZE_TATEN.length]; }
/* Was sie dazu sagt — in der Diele als Toast. Pur. */
function katzeSatz(tat, name, anrede, woerter) {
  const n = name || KATZE_STANDARD_NAME;
  const du = anrede ? ', ' + anrede : '';
  switch (tat) {
    case 'blinzelt': return n + ' blinzelt. Ach, du bist es' + du + '.';
    case 'schnurrt': return n + ' schnurrt. ' + (woerter ? woerter + (woerter === 1 ? ' Wort' : ' Wörter') + ' heute — sie hat mitgezählt.' : 'Noch kein Wort heute, sagt sie. Aber sie hat Zeit.');
    case 'streckt': return n + ' streckt sich lang. Ein Schreibtag ist ein guter Tag.';
    case 'putzt': return n + ' putzt sich die Pfote. Gleich ist es wieder ernst.';
    case 'miaut': return 'Miau. Das heißt: weiterschreiben' + du + '.';
    case 'rollt': return n + ' rollt sich wieder ein. Schreib leise.';
    case 'gestreichelt': return n + ' hat geschnurrt. Du auch, ein bisschen.';
    default: return n + ' schaut.';
  }
}
/* Die Katze als SVG-Gruppe: liegt mit dem Kopf nach rechts, Fußpunkt (cx, y). Pur. */
function katzeSVG(cx, y, zustand, name) {
  /* ein rotgetigertes Fell: warm und gut zu sehen auf dem dunklen Dielenboden */
  const k = '#c98b52', h = '#e0b07c', d = '#8a5428', rosa = '#e3a2a2';
  return '<g class="katze ' + (zustand || 'schlaeft') + '" data-katze="1" tabindex="0" role="button" aria-label="' + orteText(name || KATZE_STANDARD_NAME) + '" style="transform-origin:' + cx + 'px ' + y + 'px">' +
    '<ellipse cx="' + cx + '" cy="' + (y + 1) + '" rx="32" ry="4" fill="rgba(0,0,0,.25)"/>' +
    /* Schwanz (hinten links) */
    '<path class="katze-schwanz" d="M' + (cx - 24) + ' ' + (y - 6) + ' c -14 0 -20 -10 -12 -18 c 3 -3 8 -2 9 1" fill="none" stroke="' + k + '" stroke-width="5" stroke-linecap="round" style="transform-origin:' + (cx - 24) + 'px ' + (y - 6) + 'px"/>' +
    '<circle cx="' + (cx - 27) + '" cy="' + (y - 23) + '" r="2.6" fill="' + d + '"/>' +
    /* Körper */
    '<g class="katze-leib" style="transform-origin:' + cx + 'px ' + y + 'px">' +
    '<ellipse cx="' + cx + '" cy="' + (y - 9) + '" rx="28" ry="11" fill="' + k + '"/>' +
    '<ellipse cx="' + (cx - 2) + '" cy="' + (y - 6) + '" rx="20" ry="6" fill="' + h + '" opacity=".55"/>' +
    '<path d="M' + (cx - 14) + ' ' + (y - 18) + ' q 3 5 0 9 M' + (cx - 6) + ' ' + (y - 19) + ' q 3 5 0 9 M' + (cx + 2) + ' ' + (y - 19) + ' q 3 5 0 9" stroke="' + d + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>' +
    /* Pfoten vorn */
    '<ellipse class="katze-pfote a" cx="' + (cx + 12) + '" cy="' + (y - 1) + '" rx="6" ry="3" fill="' + h + '"/><ellipse class="katze-pfote b" cx="' + (cx + 22) + '" cy="' + (y - 1) + '" rx="6" ry="3" fill="' + h + '"/>' +
    '</g>' +
    /* Kopf */
    '<g class="katze-kopf" style="transform-origin:' + (cx + 22) + 'px ' + (y - 12) + 'px">' +
    '<path class="katze-ohr l" d="M' + (cx + 13) + ' ' + (y - 18) + ' l -1 -11 8 6 z" fill="' + k + '" style="transform-origin:' + (cx + 16) + 'px ' + (y - 19) + 'px"/><path d="M' + (cx + 14) + ' ' + (y - 19) + ' l -.5 -6 4.5 3.5 z" fill="' + rosa + '"/>' +
    '<path class="katze-ohr r" d="M' + (cx + 31) + ' ' + (y - 18) + ' l 1 -11 -8 6 z" fill="' + k + '" style="transform-origin:' + (cx + 28) + 'px ' + (y - 19) + 'px"/><path d="M' + (cx + 30) + ' ' + (y - 19) + ' l .5 -6 -4.5 3.5 z" fill="' + rosa + '"/>' +
    '<circle cx="' + (cx + 22) + '" cy="' + (y - 12) + '" r="10.5" fill="' + k + '"/>' +
    '<path d="M' + (cx + 16) + ' ' + (y - 20) + ' q 2 4 0 7 M' + (cx + 22) + ' ' + (y - 22) + ' q 1 4 0 7" stroke="' + d + '" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7"/>' +
    /* Augen zu (schläft) und Augen auf (wach) */
    '<g class="katze-auge-zu" stroke="' + d + '" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M' + (cx + 16) + ' ' + (y - 12) + ' q 2.5 2 5 0"/><path d="M' + (cx + 23) + ' ' + (y - 12) + ' q 2.5 2 5 0"/></g>' +
    '<g class="katze-auge-auf"><ellipse cx="' + (cx + 18.5) + '" cy="' + (y - 12.5) + '" rx="2.6" ry="3" fill="#c7d36a"/><ellipse cx="' + (cx + 25.5) + '" cy="' + (y - 12.5) + '" rx="2.6" ry="3" fill="#c7d36a"/>' +
    '<g class="katze-pupillen"><ellipse cx="' + (cx + 18.5) + '" cy="' + (y - 12.5) + '" rx="1.1" ry="2.4" fill="#111"/><ellipse cx="' + (cx + 25.5) + '" cy="' + (y - 12.5) + '" rx="1.1" ry="2.4" fill="#111"/></g>' +
    '<g class="katze-lid" style="transform-origin:' + (cx + 22) + 'px ' + (y - 15.5) + 'px"><rect x="' + (cx + 15) + '" y="' + (y - 16) + '" width="14" height="7" fill="' + k + '"/></g></g>' +
    /* Nase, Mund, Schnurrhaare */
    '<path d="M' + (cx + 21) + ' ' + (y - 8) + ' l 2 0 -1 1.4 z" fill="' + rosa + '"/><path d="M' + (cx + 22) + ' ' + (y - 6.6) + ' q -1.5 2 -3 .6 M' + (cx + 22) + ' ' + (y - 6.6) + ' q 1.5 2 3 .6" stroke="' + d + '" stroke-width=".9" fill="none"/>' +
    '<g stroke="rgba(255,255,255,.55)" stroke-width=".8"><path d="M' + (cx + 17) + ' ' + (y - 8) + ' l -9 -1 M' + (cx + 17) + ' ' + (y - 6.5) + ' l -9 1 M' + (cx + 27) + ' ' + (y - 8) + ' l 9 -1 M' + (cx + 27) + ' ' + (y - 6.5) + ' l 9 1"/></g>' +
    '</g>' +
    /* Schlaf-z und Herzen */
    '<g class="katze-zs" font-family="ui-serif, Georgia, serif" font-style="italic" fill="rgba(255,245,225,.8)"><text class="katze-z a" x="' + (cx + 34) + '" y="' + (y - 26) + '" font-size="7">z</text><text class="katze-z b" x="' + (cx + 39) + '" y="' + (y - 32) + '" font-size="9">z</text><text class="katze-z c" x="' + (cx + 45) + '" y="' + (y - 39) + '" font-size="11">z</text></g>' +
    '<g class="katze-herzen" fill="#d9646a">' + [0, 1, 2].map((i) => '<path class="katze-herz h' + i + '" d="M' + (cx + 6 + i * 10) + ' ' + (y - 30) + ' c -3 -4 -7 0 -3 3 l 3 3 3 -3 c 4 -3 0 -7 -3 -3 z"/>').join('') + '</g>' +
    '</g>';
}
/* Leben einhauchen: Tippen, Halten, Augen folgen, Schlaf nach einer Weile. */
let _katzeMiau = null, _katzeSchnurr = null;
function katzeTon(art, an) {
  if (art === 'still') { try { if (_katzeSchnurr) _katzeSchnurr.pause(); } catch (e) {} return null; }
  if (!an) return null;
  try {
    if (art === 'miau') { if (!_katzeMiau) { _katzeMiau = new Audio('klang/katze-miau.wav'); _katzeMiau.preload = 'auto'; } _katzeMiau.volume = .45; _katzeMiau.currentTime = 0; _katzeMiau.play().catch(() => {}); return _katzeMiau; }
    if (art === 'schnurr') { if (!_katzeSchnurr) { _katzeSchnurr = new Audio('klang/katze-schnurr.wav'); _katzeSchnurr.preload = 'auto'; _katzeSchnurr.loop = true; } _katzeSchnurr.volume = .4; _katzeSchnurr.currentTime = 0; _katzeSchnurr.play().catch(() => {}); return _katzeSchnurr; }
    if (art === 'still') { if (_katzeSchnurr) { _katzeSchnurr.pause(); } return null; }
  } catch (e) {}
  return null;
}
function katzeBeleben(wrap, o, anrede) {
  const katze = wrap.querySelector('.katze'); if (!katze) return;
  const name = (o && o.katzeName) || KATZE_STANDARD_NAME, ton = !o || o.katzeTon !== false;
  let tat = 'rollt', wachSeit = 0, halten = null, haltenStart = 0, wachTimer = null;
  const setze = (z) => { katze.classList.remove('schlaeft', 'doest', 'wach', 'streckt', 'putzt', 'schnurrt', 'gestreichelt'); katze.classList.add(z); };
  const kurz = (klasse, ms) => { katze.classList.add(klasse); setTimeout(() => katze.classList.remove(klasse), ms); };
  const einschlafen = () => { setze('schlaeft'); tat = 'rollt'; katzeTon('still'); };
  const wachHalten = () => { clearTimeout(wachTimer); wachTimer = setTimeout(() => { if (katze.isConnected) einschlafen(); }, 75000); };
  const woerterHeute = () => { try { return D.stats.tage[tagKey()] || 0; } catch (e) { return 0; } };
  const tun = () => {
    tat = katzeNaechsteTat(tat);
    if (tat === 'blinzelt') { setze('wach'); kurz('blinzelt', 900); katzeTon('miau', ton); }
    else if (tat === 'schnurrt') { setze('wach'); kurz('schnurrt', 3200); kurz('herzen', 3200); const a = katzeTon('schnurr', ton); if (a) setTimeout(() => { if (!halten) katzeTon('still'); }, 3200); }
    else if (tat === 'streckt') { setze('wach'); kurz('streckt', 1400); }
    else if (tat === 'putzt') { setze('wach'); kurz('putzt', 1800); }
    else if (tat === 'miaut') { setze('wach'); kurz('miaut', 700); katzeTon('miau', ton); }
    else if (tat === 'rollt') { einschlafen(); }
    if (tat !== 'rollt') wachHalten();
    toast(katzeSatz(tat, name, anrede, woerterHeute()), 2400);
  };
  katze.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    haltenStart = Date.now();
    halten = setTimeout(() => { halten = 'laeuft'; setze('gestreichelt'); katze.classList.add('herzen', 'schnurrt'); katzeTon('schnurr', ton); wachHalten(); }, 380);
  });
  const loslassen = () => {
    if (halten === 'laeuft') { const s = Math.round((Date.now() - haltenStart) / 1000); katze.classList.remove('herzen', 'schnurrt'); setze('wach'); katzeTon('still'); tat = 'schnurrt'; toast(name + ' hat ' + (s < 2 ? 'kurz' : s + ' Sekunden lang') + ' geschnurrt. Du auch, ein bisschen.', 2400); }
    else if (halten) { clearTimeout(halten); tun(); }
    halten = null;
  };
  katze.addEventListener('pointerup', loslassen); katze.addEventListener('pointercancel', () => { if (halten && halten !== 'laeuft') clearTimeout(halten); if (halten === 'laeuft') loslassen(); halten = null; });
  katze.addEventListener('pointerleave', () => { if (halten === 'laeuft') loslassen(); else if (halten) { clearTimeout(halten); halten = null; } });
  katze.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tun(); } });
  /* Die Augen folgen dem Zeiger, wenn sie wach ist */
  const pupillen = katze.querySelector('.katze-pupillen'), kopf = katze.querySelector('.katze-kopf');
  wrap.addEventListener('pointermove', (ev) => {
    if (!katze.classList.contains('wach') && !katze.classList.contains('gestreichelt')) return;
    const r = kopf.getBoundingClientRect(); const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy) || 1; const m = Math.min(1, l / 120);
    pupillen.style.transform = 'translate(' + (dx / l * 1.3 * m).toFixed(2) + 'px,' + (dy / l * 1.1 * m).toFixed(2) + 'px)';
  });
  /* Ab und zu zuckt ein Ohr, auch im Schlaf */
  const ohr = () => { if (!katze.isConnected) return; kurz('ohrzuckt', 700); setTimeout(ohr, 7000 + Math.random() * 12000); };
  setTimeout(ohr, 3000 + Math.random() * 5000);
}
