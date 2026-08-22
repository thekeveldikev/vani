/* ===================== 57b — DIE SCHREIBMASCHINE =====================
   Eine alte Reiseschreibmaschine, die wirklich schreibt: Der Bogen steckt in
   der Walze, die Typen schlagen, das Band färbt (schwarz, rot, blau), bei
   Zeile sechzig klingelt die Glocke, der Wagen fährt zurück. Was man tippt,
   landet als Blatt bei den Blättern. Wer will, schreibt „wie früher": dann
   gibt es keine Rücktaste — nur Übertippen mit x. Geräusche aus dem
   Lautsprecher, leise, abschaltbar. Steht oben auf dem Lesetisch der Hefte
   (Räume als Orte) und im Spotlight. */

const SM_BREITE = 60;      /* Zeichen je Zeile, dann springt der Wagen */
const SM_GLOCKE = 8;       /* so viele Zeichen vor dem Rand klingelt es */
const SM_BAENDER = [['schwarz', '#1d1d1f'], ['rot', '#9c2a22'], ['blau', '#27406e'], ['gruen', '#2f5a3c']];
const SM_PAPIERE = [['weiss', 'Weiß'], ['creme', 'Creme'], ['gelb', 'Gelb'], ['kariert', 'Kariert']];

/* Einstellungen säubern: ton, band, papier, streng (wie früher: kein Löschen). Pur. */
function saubereSchreibmaschine(roh) {
  const q = roh && typeof roh === 'object' ? roh : {};
  return {
    ton: q.ton !== false,
    band: SM_BAENDER.some((b) => b[0] === q.band) ? q.band : 'schwarz',
    papier: SM_PAPIERE.some((p) => p[0] === q.papier) ? q.papier : 'creme',
    streng: q.streng === true
  };
}
/* Text in Zeilen legen, wie die Maschine es tut: harte Umbrüche bleiben, lange Zeilen
   brechen am letzten Leerzeichen vor dem Rand, sonst hart. Pur. */
function schreibmaschineZeilen(text, breite = SM_BREITE) {
  const aus = [];
  for (const roh of String(text || '').replace(/\r/g, '').split('\n')) {
    let z = roh;
    if (!z.length) { aus.push(''); continue; }
    while (z.length > breite) {
      let schnitt = z.lastIndexOf(' ', breite);
      if (schnitt <= 0) schnitt = breite;
      aus.push(z.slice(0, schnitt)); z = z.slice(schnitt).replace(/^ /, '');
    }
    aus.push(z);
  }
  return aus;
}
/* Wo die Glocke klingelt: ab dieser Spalte. Pur. */
function schreibmaschineGlocke(spalte, breite = SM_BREITE) { return spalte === breite - SM_GLOCKE; }
/* Jede Type schlägt ein wenig anders: Stärke 0–3 und Versatz aus der Stelle im Text. Pur. */
function schreibmaschineSchlag(zeichen, stelle) {
  let h = 2166136261; for (const c of String(zeichen) + ':' + stelle) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  h >>>= 0;
  return { staerke: h % 4, dx: ((h >>> 4) % 5 - 2) * .18, dy: ((h >>> 8) % 5 - 2) * .22, dreh: ((h >>> 12) % 7 - 3) * .35 };
}
/* Zu welcher Taste ein Zeichen gehört (Reihe, Stelle) — für die Tastenanimation. Pur. */
const SM_REIHEN = ['1234567890', 'QWERTZUIOPÜ', 'ASDFGHJKLÖÄ', 'YXCVBNM,.-'];
function schreibmaschineTaste(zeichen) {
  const c = String(zeichen || '').toUpperCase();
  for (let r = 0; r < SM_REIHEN.length; r++) { const i = SM_REIHEN[r].indexOf(c); if (i >= 0) return { reihe: r, stelle: i }; }
  return null;
}

/* Geräusche: Anschlag, Glocke, Wagenrücklauf — synthetisch, leise. */
function schreibmaschineKlang(art, einst) {
  if (einst && einst.ton === false) return;
  try {
    const ctx = typeof audioCtxHolen === 'function' ? audioCtxHolen() : (window.__vaniKlick || (window.__vaniKlick = new (window.AudioContext || window.webkitAudioContext)()));
    if (!ctx) return;
    if (ctx.state === 'suspended') { try { ctx.resume().catch(() => {}); } catch (e) {} }
    const t0 = ctx.currentTime;
    const rausch = (dauer, freq, q, lautstaerke, start = 0) => {
      const n = Math.round(ctx.sampleRate * dauer), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.2);
      const s = ctx.createBufferSource(); s.buffer = b;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.setValueAtTime(lautstaerke, t0 + start); g.gain.exponentialRampToValueAtTime(.0001, t0 + start + dauer);
      s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t0 + start); s.stop(t0 + start + dauer + .02);
    };
    const ton = (freq, dauer, lautstaerke, typ = 'sine', start = 0) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = typ; o.frequency.setValueAtTime(freq, t0 + start);
      g.gain.setValueAtTime(.0001, t0 + start); g.gain.exponentialRampToValueAtTime(lautstaerke, t0 + start + .006); g.gain.exponentialRampToValueAtTime(.0001, t0 + start + dauer);
      o.connect(g); g.connect(ctx.destination); o.start(t0 + start); o.stop(t0 + start + dauer + .02);
    };
    if (art === 'taste') { rausch(.045, 2400 + Math.random() * 900, 1.2, .22); ton(180 + Math.random() * 60, .035, .05, 'triangle'); }
    else if (art === 'leer') { rausch(.06, 900, 1, .14); }
    else if (art === 'glocke') { ton(2350, .7, .09); ton(3520, .45, .04, 'sine', .004); }
    else if (art === 'wagen') { rausch(.16, 1400, .8, .16); rausch(.05, 600, 1, .2, .16); }
    else if (art === 'falsch') { rausch(.08, 500, 2, .12); }
  } catch (e) {}
}

/* ----- Die Bühne ----- */
let _smOffen = null;
function schreibmaschineOeffnen(startText) {
  if (_smOffen) return;
  const einst = saubereSchreibmaschine(D.einst.schreibmaschine);
  const speichernEinst = () => { D.einst.schreibmaschine = einst; speichereEinst(); };
  let text = typeof startText === 'string' ? startText : '';
  let abgelegt = false, docId = null, geschriebenSeitAblage = 0;
  const buehne = el('div', { class: 'sm-buehne', role: 'dialog', 'aria-label': 'Schreibmaschine', 'data-papier': einst.papier, style: '--sm-tinte:' + (SM_BAENDER.find((b) => b[0] === einst.band) || SM_BAENDER[0])[1] });
  const eingabe = el('textarea', { class: 'sm-eingabe', autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Hier tippen' });
  eingabe.value = text;
  /* Papier */
  const zeilen = el('div', { class: 'sm-zeilen' });
  const papier = el('div', { class: 'sm-papier' }, zeilen);
  const halter = el('div', { class: 'sm-papierhalter' }, papier, el('i', { class: 'sm-walze' }), el('i', { class: 'sm-typenfuehrung' }));
  /* Die Maschine (SVG) */
  const maschine = el('div', { class: 'sm-maschine' });
  maschine.innerHTML = '<svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="sm-bild">' +
    '<defs><linearGradient id="smk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4046"/><stop offset="1" stop-color="#1a1d21"/></linearGradient><linearGradient id="smw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d31"/><stop offset="1" stop-color="#0f1113"/></linearGradient></defs>' +
    '<g class="sm-wagen"><rect x="60" y="10" width="480" height="26" rx="8" fill="url(#smw)"/><rect x="44" y="8" width="20" height="30" rx="4" fill="#c9a25a"/><rect x="536" y="8" width="20" height="30" rx="4" fill="#c9a25a"/><path class="sm-hebel" d="M44 22l-30-22" stroke="#c9a25a" stroke-width="6" stroke-linecap="round"/><circle cx="14" cy="0" r="6" fill="#e8c27a"/><rect x="80" y="14" width="440" height="4" fill="rgba(255,255,255,.08)"/></g>' +
    '<rect x="150" y="36" width="300" height="12" fill="#8a1c12" class="sm-band"/><rect x="280" y="30" width="40" height="24" rx="3" fill="#0b0c0e"/>' +
    '<g class="sm-typen">' + Array.from({ length: 30 }, (_, i) => { const a = -75 + i * 5.2; return '<line class="sm-type" x1="300" y1="58" x2="' + (300 + 54 * Math.sin(a * Math.PI / 180)) + '" y2="' + (58 + 54 * Math.cos(a * Math.PI / 180)) + '" stroke="#8a8f96" stroke-width="2" style="transform-origin:300px 58px"/>'; }).join('') + '</g>' +
    '<path d="M70 60h460l30 120H40z" fill="url(#smk)"/><path d="M70 60h460" stroke="rgba(255,255,255,.12)" stroke-width="2"/>' +
    '<rect x="120" y="70" width="360" height="28" rx="4" fill="#0f1113"/><text x="300" y="88" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-style="italic" font-size="12" fill="#c9a25a" letter-spacing=".2">VANI · Reiseschreibmaschine</text>' +
    SM_REIHEN.map((reihe, r) => [...reihe].map((c, i) => { const x = 120 + r * 16 + i * 36, y = 112 + r * 18; return '<g class="sm-taste" data-reihe="' + r + '" data-stelle="' + i + '" style="transform-origin:' + x + 'px ' + y + 'px"><circle cx="' + x + '" cy="' + (y + 2) + '" r="8.5" fill="#0b0c0e"/><circle cx="' + x + '" cy="' + y + '" r="8" fill="#e9e2d2" stroke="#1a1d21" stroke-width="1"/><text x="' + x + '" y="' + (y + 3.2) + '" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="8" fill="#1a1d21">' + c + '</text></g>'; }).join('')).join('') +
    '<g class="sm-taste leer" style="transform-origin:300px 182px"><rect x="190" y="174" width="220" height="10" rx="5" fill="#0b0c0e"/><rect x="190" y="172" width="220" height="10" rx="5" fill="#e9e2d2" stroke="#1a1d21"/></g>' +
    '<g class="sm-glocke" style="transform-origin:560px 60px"><path d="M548 60c0-10 6-16 12-16s12 6 12 16z" fill="#e8c27a"/><circle cx="560" cy="62" r="2.5" fill="#e8c27a"/></g>' +
    '</svg>';
  /* Kopfzeile */
  const zaehler = el('span', { class: 'sm-zaehler' });
  const bandKnopf = el('button', { class: 'knopf zart sm-knopf', title: 'Farbband wechseln', onclick: () => { const i = SM_BAENDER.findIndex((b) => b[0] === einst.band); einst.band = SM_BAENDER[(i + 1) % SM_BAENDER.length][0]; buehne.style.setProperty('--sm-tinte', SM_BAENDER.find((b) => b[0] === einst.band)[1]); bandKnopf.textContent = 'Band: ' + einst.band; speichernEinst(); } }, 'Band: ' + einst.band);
  const papierKnopf = el('button', { class: 'knopf zart sm-knopf', title: 'Papier wechseln', onclick: () => { const i = SM_PAPIERE.findIndex((p) => p[0] === einst.papier); einst.papier = SM_PAPIERE[(i + 1) % SM_PAPIERE.length][0]; buehne.dataset.papier = einst.papier; papierKnopf.textContent = 'Papier: ' + SM_PAPIERE.find((p) => p[0] === einst.papier)[1]; speichernEinst(); } }, 'Papier: ' + SM_PAPIERE.find((p) => p[0] === einst.papier)[1]);
  const strengKnopf = el('button', { class: 'knopf zart sm-knopf' + (einst.streng ? ' an' : ''), title: 'Wie früher: keine Rücktaste — Fehler bleiben stehen', onclick: (ev) => { einst.streng = !einst.streng; ev.currentTarget.classList.toggle('an', einst.streng); speichernEinst(); toast(einst.streng ? 'Wie früher: Was getippt ist, bleibt. Übertippen mit x.' : 'Die Rücktaste darf wieder.', 2200); } }, 'Wie früher');
  const tonKnopf = el('button', { class: 'knopf zart sm-knopf' + (einst.ton ? ' an' : ''), title: 'Geräusche', onclick: (ev) => { einst.ton = !einst.ton; ev.currentTarget.classList.toggle('an', einst.ton); speichernEinst(); } }, 'Ton');
  const ablegen = () => {
    const t = text.replace(/\s+$/, '');
    if (!t.trim()) { toast('Noch nichts getippt.'); return false; }
    if (docId && D.docs.get(docId)) { const d = D.docs.get(docId); d.text = t; speichere(d); }
    else { const b = blattAusText('Getippt · ' + fmtDatum(Date.now()), t); docId = b.id; }
    abgelegt = true; geschriebenSeitAblage = 0; toast('Liegt bei den Blättern.', 1800); return true;
  };
  const schliessen = async () => {
    if (text.trim() && geschriebenSeitAblage > 0) { const ja = await frage('Das Getippte als Blatt ablegen?', { ja: 'Ablegen', nein: 'Verwerfen' }); if (ja) ablegen(); }
    buehne.remove(); _smOffen = null; document.removeEventListener('keydown', escHoerer, true);
  };
  const escHoerer = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); schliessen(); } };
  const kopf = el('div', { class: 'sm-kopf' },
    el('b', {}, 'Schreibmaschine'), zaehler,
    el('span', { class: 'sm-knoepfe' }, bandKnopf, papierKnopf, strengKnopf, tonKnopf,
      el('button', { class: 'knopf voll sm-knopf', onclick: () => { if (ablegen() && typeof oeffneSchreibraum === 'function') { /* bleibt offen */ } } }, 'Als Blatt ablegen'),
      el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Schließen', onclick: schliessen })));
  buehne.append(kopf, halter, maschine, eingabe);
  document.body.append(buehne);
  _smOffen = buehne;
  document.addEventListener('keydown', escHoerer, true);

  /* Zeichnen: Zeilen aus dem Text, die letzte Zeile mit Schreibstelle; Papier fährt so, dass die Stelle unter dem Typenhebel liegt */
  let letzteZeilen = [];
  const zeichneZeile = (z, zi, start) => {
    const div = el('div', { class: 'sm-zeile' });
    [...z].forEach((c, i) => { const s = schreibmaschineSchlag(c, start + i); div.append(el('span', { class: 'sm-z s' + s.staerke, style: 'transform:translate(' + s.dx + 'px,' + s.dy + 'px) rotate(' + s.dreh + 'deg)' }, c === ' ' ? ' ' : c)); });
    return div;
  };
  const male = (neu) => {
    const zs = schreibmaschineZeilen(text);
    /* nur die Zeilen neu bauen, die sich geändert haben */
    let start = 0;
    zs.forEach((z, i) => {
      const alt = zeilen.children[i];
      if (!alt || letzteZeilen[i] !== z) { const d = zeichneZeile(z, i, start); if (alt) alt.replaceWith(d); else zeilen.append(d); }
      start += z.length + 1;
    });
    while (zeilen.children.length > zs.length) zeilen.lastElementChild.remove();
    letzteZeilen = zs;
    const spalte = zs.length ? zs[zs.length - 1].length : 0;
    papier.style.setProperty('--sp', spalte); papier.style.setProperty('--ze', zs.length - 1);
    const w = worte(text);
    zaehler.textContent = (w ? w + (w === 1 ? ' Wort' : ' Wörter') + ' · ' : '') + 'Zeile ' + zs.length + ' · Spalte ' + (spalte + 1) + (einst.streng ? ' · wie früher' : '');
    if (neu) { const letzte = zeilen.lastElementChild; if (letzte && letzte.lastElementChild) { letzte.lastElementChild.classList.add('frisch'); } }
  };
  const tasteDruecken = (c) => {
    const t = schreibmaschineTaste(c);
    const ziel = c === ' ' ? maschine.querySelector('.sm-taste.leer') : t ? maschine.querySelector('.sm-taste[data-reihe="' + t.reihe + '"][data-stelle="' + t.stelle + '"]') : null;
    if (ziel) { ziel.classList.remove('gedrueckt'); void ziel.getBoundingClientRect(); ziel.classList.add('gedrueckt'); setTimeout(() => ziel.classList.remove('gedrueckt'), 160); }
    const typen = maschine.querySelectorAll('.sm-type'); if (typen.length && c !== ' ') { const ty = typen[(c.charCodeAt(0) * 7) % typen.length]; ty.classList.remove('schlaegt'); void ty.getBoundingClientRect(); ty.classList.add('schlaegt'); setTimeout(() => ty.classList.remove('schlaegt'), 140); }
  };
  const wagenRuecklauf = () => { const w = maschine.querySelector('.sm-wagen'); if (w) { w.classList.remove('faehrt'); void w.getBoundingClientRect(); w.classList.add('faehrt'); setTimeout(() => w.classList.remove('faehrt'), 400); } papier.classList.add('ruecklauf'); setTimeout(() => papier.classList.remove('ruecklauf'), 380); schreibmaschineKlang('wagen', einst); };
  const glocke = () => { const g = maschine.querySelector('.sm-glocke'); if (g) { g.classList.remove('klingelt'); void g.getBoundingClientRect(); g.classList.add('klingelt'); setTimeout(() => g.classList.remove('klingelt'), 600); } schreibmaschineKlang('glocke', einst); };
  /* Eingabe: wir lesen, was dazukam — die Maschine kennt nur Anhängen (und, wenn erlaubt, eine Rücktaste) */
  let vorher = text;
  eingabe.addEventListener('input', () => {
    const jetzt = eingabe.value;
    if (jetzt.length < vorher.length) {
      if (einst.streng) { eingabe.value = vorher; schreibmaschineKlang('falsch', einst); maschine.classList.add('nein'); setTimeout(() => maschine.classList.remove('nein'), 300); }
      else { text = jetzt; vorher = jetzt; male(false); }
      eingabe.setSelectionRange(eingabe.value.length, eingabe.value.length); return;
    }
    const neu = jetzt.slice(vorher.length);
    if (jetzt.slice(0, vorher.length) !== vorher) { /* mitten drin geändert (Autokorrektur o. ä.): wir nehmen den neuen Stand, ohne Theater */ text = jetzt; vorher = jetzt; male(false); eingabe.setSelectionRange(jetzt.length, jetzt.length); return; }
    let i = 0;
    const tick = () => {
      if (i >= neu.length) { vorher = jetzt; return; }
      const c = neu[i++]; text += c; geschriebenSeitAblage++;
      const zs = schreibmaschineZeilen(text); const spalte = zs[zs.length - 1].length;
      if (c === '\n') wagenRuecklauf();
      else { tasteDruecken(c); schreibmaschineKlang(c === ' ' ? 'leer' : 'taste', einst); if (schreibmaschineGlocke(spalte)) glocke(); if (spalte === 0 && zs.length > 1 && c !== ' ') wagenRuecklauf(); }
      male(true);
      if (i < neu.length) setTimeout(tick, 34);
      else vorher = jetzt;
    };
    tick();
    eingabe.setSelectionRange(jetzt.length, jetzt.length);
  });
  eingabe.addEventListener('keydown', (ev) => {
    /* Pfeile und Cursorbewegung: die Maschine kennt nur eine Stelle */
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(ev.key)) { ev.preventDefault(); }
    if (ev.key === 'Backspace' && einst.streng) { ev.preventDefault(); schreibmaschineKlang('falsch', einst); maschine.classList.add('nein'); setTimeout(() => maschine.classList.remove('nein'), 300); }
  });
  eingabe.addEventListener('blur', () => { if (_smOffen === buehne) setTimeout(() => { if (_smOffen === buehne && !document.querySelector('.schleier')) eingabe.focus({ preventScroll: true }); }, 120); });
  halter.addEventListener('click', () => eingabe.focus({ preventScroll: true }));
  maschine.addEventListener('click', () => eingabe.focus({ preventScroll: true }));
  male(false);
  setTimeout(() => { eingabe.focus({ preventScroll: true }); eingabe.setSelectionRange(eingabe.value.length, eingabe.value.length); }, 80);
  return buehne;
}
