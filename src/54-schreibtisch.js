/* ================================================================
   VANI — Der Schreibtisch.

   Kein Raum zum Einsortieren, sondern der Mittelpunkt: ein schwerer Tisch aus
   dunklem Holz vor einem hohen Fenster, dahinter fast völlige Nacht und ein
   verwilderter Garten; auf dem Tisch eine Lampe mit bernsteinfarbenem Kegel
   und einer Zugschnur, ein siebenarmiger Leuchter, dessen Kerzen über Wochen
   wirklich abbrennen, Tintenfass und Federn, offene Manuskripte, Bücherstapel,
   eine Tasse, die schon längst gespült gehörte, ein Glas mit einem Fundstück,
   ein Brief mit Siegel, Karteikarten, eine Lupe, ein Bleistiftstummel, eine
   alte Standuhr, ein zweiter Stuhl — und unten der Papierkorb mit zerknüllten
   Blättern und eine Schublade voller Dinge, die kein vernünftiger Mensch
   aufbewahren würde. Jedes Ding tut etwas. Nichts ist Dekoration.
   Kein Deckenlicht. Niemals.

   Das Gemalte (Fenster, Garten, Wetter, Platte, Licht) liegt in
   54b-schreibtisch-malerei.js; hier stehen die Dinge und ihre Griffe.
   ================================================================ */

const SCHREIBTISCH_HOELZER = [['ebenholz', 'Ebenholz'], ['nuss', 'Nussbaum'], ['kirsche', 'Kirsche'], ['eiche', 'Alte Eiche']];
const LEUCHTER_STUNDEN = 20;   /* nach so vielen Schreibstunden sind die Kerzen herunter */

/* Einrichtung des Tisches — pur, mit Vorgaben. */
function saubererSchreibtisch(roh) {
  const q = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  return {
    holz: SCHREIBTISCH_HOELZER.some((h) => h[0] === q.holz) ? q.holz : 'nuss',
    lampe: begrenze(q.lampe, .25, 1, .8),
    lampeAn: q.lampeAn !== false,
    kerzen: q.kerzen !== false,
    wetterFolgtKlang: q.wetterFolgtKlang !== false,
    unordnung: begrenze(q.unordnung, 0, 1, .7),
    verse: q.verse !== false,
    uhrTickt: q.uhrTickt === true,
    wachs: begrenze(q.wachs, 0, LEUCHTER_STUNDEN * 60, 0),         /* verbrannte Minuten */
    kerzenGewechselt: begrenze(q.kerzenGewechselt, 0, 4102444800000, 0)
  };
}

/* Mondphase 0 … 1 (0 = Neumond, .5 = Vollmond), aus dem Datum. Pur. */
function mondphase(wann = Date.now()) {
  const bezug = Date.UTC(2000, 0, 6, 18, 14);
  const synodisch = 29.530588853 * 86400000;
  const t = ((wann - bezug) % synodisch + synodisch) % synodisch;
  return t / synodisch;
}

/* Brief an mich: offen, wenn das Öffnungsdatum erreicht ist. Pur. */
function briefIstOffen(brief, jetzt = Date.now()) {
  if (!brief) return false;
  return (Number(brief.oeffnen) || 0) <= jetzt;
}

/* Die Zugschnur: Feder mit Dämpfung. Pur, je Schritt. */
function schnurSchritt(zustand, dt) {
  const z = zustand;
  const k = 70, d = 7;       /* Federhärte, Dämpfung */
  const a = -k * z.x - d * z.v;
  z.v += a * dt; z.x += z.v * dt;
  if (Math.abs(z.x) < .3 && Math.abs(z.v) < 3) { z.x = 0; z.v = 0; }
  return z;
}

/* Wie weit der Leuchter herunter ist: 0 frisch, 1 aufgebraucht. Pur. */
function leuchterStand(wachsMinuten) {
  return Math.max(0, Math.min(1, (Number(wachsMinuten) || 0) / (LEUCHTER_STUNDEN * 60)));
}
function schreibtischWachsVerbrennen(minuten) {
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  e.wachs = Math.min(LEUCHTER_STUNDEN * 60, e.wachs + Math.max(0, Number(minuten) || 0));
  D.einst.schreibtisch = e; speichereEinst();
}

/* Kurze eigene Zeilen für die „spontanen Verse" auf der Platte — aus den
   kuratierten Funden, nie aus allem. */
function schreibtischVerse(max = 3) {
  if (typeof wiederFunde !== 'function') return [];
  const aus = [];
  for (const f of wiederFunde()) {
    const zeile = (f.auszug || '').split('\n').map((z) => z.trim()).find((z) => z.length >= 12 && z.length <= 64);
    if (zeile && !aus.includes(zeile)) aus.push(zeile);
    if (aus.length >= max) break;
  }
  return aus;
}

function schreibtischLetzteTexte(n = 3) {
  return [...D.docs.values()]
    .filter((d) => ['szene', 'blatt', 'seite'].includes(d.typ) && (d.text || '').trim().length > 0)
    .sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0)).slice(0, n);
}
async function schreibtischNeuesBlatt() { const b = blattAusText('', ''); oeffneSchreibraum(b.id); }

/* Das Fundstück im Glas: ein eigenes Foto, jeden Tag ein anderes. */
function schreibtischFundfoto() {
  const bilder = [...D.docs.values()].filter((d) => d.bild && ['foto', 'schnipsel', 'brettbild'].includes(d.typ) && d.typ !== 'buch');
  if (!bilder.length) return null;
  let h = 0; for (const c of tagKey()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return bilder[h % bilder.length];
}

/* Brief an mich — eine Zeitkapsel, mit Siegel. */
async function briefSchreiben() {
  const text = el('textarea', { rows: 7, placeholder: 'An die, die das in ein paar Wochen liest …', maxlength: '20000' });
  const wahl = el('select', {},
    el('option', { value: '7' }, 'in einer Woche'), el('option', { value: '30' }, 'in einem Monat'), el('option', { value: '90' }, 'in drei Monaten'),
    el('option', { value: '180' }, 'in einem halben Jahr'), el('option', { value: '365' }, 'in einem Jahr'));
  wahl.value = '30';
  let siegel = null;
  const siegelKnopf = el('button', { class: 'knopf zart klein', onclick: async () => {
    const kiste = typeof stickerKiste === 'function' ? stickerKiste() : [];
    const w = await menue([{ text: 'Rotes Wachs (klassisch)', icon: 'kreuz', wert: '_rot' }, ...(typeof STICKER_MITGEBRACHT !== 'undefined' ? STICKER_MITGEBRACHT.map((m) => ({ text: m.name, icon: 'sticker', wert: 'm:' + m.id })) : []), ...kiste.slice(0, 10).map((v, i) => ({ text: 'Sticker ' + (i + 1) + ' aus meiner Kiste', icon: 'archiv', wert: 'k:' + v.id })), { text: 'Neu zeichnen', icon: 'stift', wert: '_neu' }], 'Womit siegeln?');
    if (!w) return;
    if (w === '_rot') siegel = null;
    else if (w === '_neu') { const n = await stickerZeichnen({ titel: 'Ein Siegel zeichnen', inKiste: true }); if (n) siegel = n.bild; }
    else if (w.startsWith('m:')) { try { siegel = await stickerMitgebrachtBild(STICKER_MITGEBRACHT.find((m) => m.id === w.slice(2))); } catch (e) {} }
    else { const v = D.docs.get(w.slice(2)); if (v) siegel = v.bild; }
    siegelKnopf.textContent = siegel ? 'Siegel: eigenes Bild' : 'Siegel: rotes Wachs';
  } }, 'Siegel: rotes Wachs');
  let fertig = false;
  return new Promise((res) => {
    const kasten = el('div', { class: 'modal brief-kasten' },
      el('h2', {}, 'Ein Brief an mich'),
      el('div', { class: 'stickerblock-hinweis' }, 'Er wird versiegelt und liegt auf dem Tisch, bis das Datum kommt. Dann erst lässt er sich öffnen.'),
      text,
      el('div', { class: 'brief-wann' }, el('span', {}, 'Öffnen '), wahl, el('span', { class: 'rest' }), siegelKnopf),
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: () => {
          const t = text.value.trim(); if (!t) { toast('Ein leerer Brief?'); return; }
          fertig = true;
          const brief = neuDoc('brief', { text: t, oeffnen: Date.now() + Number(wahl.value) * 86400000, versiegelt: true, bild: siegel || undefined });
          zu(); toast('Versiegelt. Er wartet auf dem Tisch.'); res(brief);
        } }, 'Versiegeln')));
    const zu = zeigeDeck(kasten, () => { if (!fertig) res(null); });
    setTimeout(() => text.focus(), 60);
  });
}
async function briefeZeigen() {
  const briefe = vomTyp('brief').sort((a, b) => (a.oeffnen || 0) - (b.oeffnen || 0));
  const punkte = briefe.map((b) => ({
    text: (briefIstOffen(b) ? (b.versiegelt ? '✉ Darf geöffnet werden' : '✉ Geöffnet') : '✉ Versiegelt bis ' + fmtDatum(b.oeffnen)) + ' · geschrieben ' + fmtDatum(b.angelegt),
    icon: briefIstOffen(b) ? 'blatt' : 'frieren', wert: b.id
  }));
  const wahl = await menue([...punkte, { text: 'Neuen Brief schreiben', icon: 'stift', wert: '_neu' }], briefe.length ? 'Briefe an mich' : 'Noch kein Brief auf dem Tisch');
  if (!wahl) return;
  if (wahl === '_neu') { await briefSchreiben(); zeichne(); return; }
  const b = D.docs.get(wahl);
  if (!b) return;
  if (!briefIstOffen(b)) { toast('Noch versiegelt — bis ' + fmtDatum(b.oeffnen) + '. Geduld ist auch eine Schreibtugend.', 4200); return; }
  if (b.versiegelt) { b.versiegelt = false; speichere(b); }
  const kasten = el('div', { class: 'modal brief-kasten offen' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('blatt') }), 'GESCHRIEBEN ' + fmtDatum(b.angelegt).toUpperCase()),
    el('div', { class: 'brief-text serif' }, b.text),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: async () => { if (await frage('Diesen Brief wegwerfen?', { ja: 'Wegwerfen', gefahr: true })) { await loesche(b.id); zu(); zeichne(); } } }, 'Wegwerfen'),
      el('button', { class: 'knopf', onclick: () => { zu(); const bl = blattAusText('Antwort auf einen Brief an mich', ''); oeffneSchreibraum(bl.id); } }, 'Antworten'),
      el('button', { class: 'knopf voll', onclick: () => { zu(); zeichne(); } }, 'Gut')));
  const zu = zeigeDeck(kasten);
}

/* Die Schublade: Dinge, die kein vernünftiger Mensch aufbewahren würde. */
async function schubladeOeffnen() {
  const funde = typeof wiederFunde === 'function' ? wiederFunde().slice(0, 3) : [];
  const alte = vomTyp('schnipsel').filter((s) => Date.now() - s.angelegt > 14 * 86400000 && (s.text || '').trim());
  const metall = alte.length ? alte[Math.floor(Math.random() * alte.length)] : null;
  const wahl = await menue([
    ...funde.map((f) => ({ text: '„' + (f.auszug.split('\n')[0] || '').slice(0, 60) + (f.auszug.length > 60 ? '…' : '') + '" — ' + f.art.toLowerCase(), icon: 'fund', wert: 'fund:' + f.doc.id })),
    { text: 'Eine winzige Lupe — suchen', icon: 'suche', wert: 'lupe' },
    { text: 'Bindfaden — wo alles zusammenhängt (Cluster)', icon: 'cluster', wert: 'faden' },
    { text: 'Getrocknete Blätter — die losen Blätter', icon: 'blatt', wert: 'blaetter' },
    { text: 'Briefmarken — etwas hinausschicken', icon: 'teilen', wert: 'marken' },
    { text: 'Ein Schlüssel ohne Schloss — die Feinheiten', icon: 'feinheiten', wert: 'schluessel' },
    metall ? { text: 'Ein Stück Metall unbekannter Herkunft', icon: 'wuerfel', wert: 'metall' } : null
  ], 'Die Schublade');
  if (!wahl) return;
  if (wahl.startsWith('fund:')) { const d = D.docs.get(wahl.slice(5)); if (d) oeffneDokument(d); return; }
  if (wahl === 'lupe') { if (typeof oeffneSuche === 'function') oeffneSuche(); return; }
  if (wahl === 'faden') { location.hash = '#/cluster'; return; }
  if (wahl === 'blaetter') { location.hash = '#/blaetter'; return; }
  if (wahl === 'marken' || wahl === 'schluessel') { location.hash = '#/feinheiten'; return; }
  if (wahl === 'metall' && metall) {
    await zeigeAnkunft('Ein Stück Metall unbekannter Herkunft', ['„' + (metall.text || '').slice(0, 300) + '"'], 'Schnipsel vom ' + fmtDatum(metall.angelegt) + ' — vielleicht bedeutungslos, vielleicht der Schlüssel zu einem ganzen Roman.', () => { location.hash = '#/schnipsel'; });
  }
}

/* Der Papierkorb unterm Tisch: zerknüllte Blätter glätten = zurückholen. */
async function papierkorbAmTisch() {
  const alle = (await dbAlle('papierkorb')).sort((a, b) => (b.wann || 0) - (a.wann || 0));
  if (!alle.length) { toast('Der Papierkorb ist leer. Schön.'); return; }
  const wahl = await menue([
    ...alle.slice(0, 12).map((b) => ({ text: (b.name || b.typ || 'Etwas') + ' · ' + fmtDatum(b.wann) + (b.docs && b.docs.length > 1 ? ' · ' + b.docs.length + ' Teile' : ''), icon: 'blatt', wert: b.id })),
    alle.length > 12 ? { text: '… und ' + (alle.length - 12) + ' mehr (in den Feinheiten)', icon: 'mehr', wert: '_mehr' } : null
  ], 'Zerknüllt unterm Tisch — eines glätten?');
  if (!wahl) return;
  if (wahl === '_mehr') { location.hash = '#/feinheiten'; return; }
  if (await holeZurueck(wahl)) { toast('Geglättet und zurückgelegt.'); zeichne(); }
}

/* Das Glas mit dem Fundstück: der Funke des Tages. */
function schreibtischFunke() {
  let h = 0; for (const c of tagKey()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const arten = ['frage', 'form', 'satz', 'figur', 'wendung', 'kombi'];
  const art = arten[h % arten.length];
  return art === 'kombi' ? neuerFunke(true) : neuerFunke(false, art);
}
/* Die Tasse: der Schreibtag. */
function schreibtischTag() {
  const heute = D.stats.tage[tagKey()] || 0;
  let serie = 0;
  for (let i = 0; i < 400; i++) { const k = tagKey(Date.now() - i * 86400000); if ((D.stats.tage[k] || 0) > 0) serie++; else if (i > 0) break; }
  return { heute, serie };
}
function oeffneDokument(d) {
  if (!d) return;
  if (d.typ === 'szene' || d.typ === 'blatt') oeffneSchreibraum(d.id);
  else if (d.typ === 'seite') { sessionStorage.setItem('zielSeite', d.id); location.hash = '#/heft/' + d.parent; }
  else if (d.typ === 'foto') { const s = D.docs.get(d.parent); if (s) { sessionStorage.setItem('zielSeite', s.id); location.hash = '#/heft/' + s.parent; } }
  else if (d.typ === 'schnipsel') location.hash = '#/schnipsel';
  else if (d.typ === 'faden') { if (typeof merkeFadenZiel === 'function') merkeFadenZiel(d.id); location.hash = '#/faden'; }
  else if (d.typ === 'blase' || d.typ === 'brettbild') location.hash = '#/brett/' + d.parent;
  else if (d.typ === 'funkeln') location.hash = '#/woerter';
}

/* Fenster und Klang: der Nachtgarten hört auf den Klangraum. */
function schreibtischWetter() {
  const m = (D.einst && D.einst.ambience) || {};
  const an = (re) => Object.keys(m).some((id) => m[id] > 0 && re.test(id));
  if (an(/gewitter|donner/)) return 'gewitter';
  if (an(/regen|wald_regen/)) return 'regen';
  if (an(/wind|sturm/)) return 'wind';
  if (an(/grillen|sumpf|nacht/)) return 'grillen';
  return 'still';
}
async function nachtgartenKlang() {
  if (typeof ambienceMischungAnwenden !== 'function') { location.hash = '#/klang'; return; }
  const m = { ...(D.einst.ambience || {}) };
  const an = (m.grillen_fern || 0) > 0 || (m.grillen || 0) > 0;
  if (an) { for (const id of ['grillen_fern', 'grillen', 'wind_sanft', 'sumpf_nacht']) delete m[id]; toast('Der Garten schweigt.'); }
  else { m.grillen_fern = .35; m.wind_sanft = .2; toast('Grillen und ein leiser Wind vor dem Fenster.'); }
  try { await audioFreigeben(); await ambienceMischungAnwenden(m); } catch (e) {}
  zeichne();
}

/* Ein leiser Klick (Lampenzug) und ein Ticken (Uhr), beides synthetisch. */
function schreibtischKlick(art) {
  try {
    const ctx = typeof audioCtxHolen === 'function' ? audioCtxHolen() : (window.__vaniKlick || (window.__vaniKlick = new (window.AudioContext || window.webkitAudioContext)()));
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = art === 'tick' ? 'square' : 'triangle';
    o.frequency.setValueAtTime(art === 'tick' ? 1900 : 420, t0);
    o.frequency.exponentialRampToValueAtTime(art === 'tick' ? 900 : 180, t0 + .04);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(art === 'tick' ? .035 : .12, t0 + .004); g.gain.exponentialRampToValueAtTime(.0001, t0 + (art === 'tick' ? .05 : .12));
    o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + .14);
  } catch (e) {}
}

/* ----- Der siebenarmige Leuchter: Messingarme und sieben Flammen ----- */
function baueLeuchter(einst) {
  const W = 170, H = 150;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = el('canvas', { class: 'desk-leuchter-flammen', width: String(W * dpr), height: String(H * dpr) });
  c.style.width = W + 'px'; c.style.height = H + 'px';
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const stand = leuchterStand(einst.wachs);
  const arme = [[16, 46], [40, 32], [64, 20], [85, 12], [106, 20], [130, 32], [154, 46]];
  /* Jede Kerze brennt ihr eigenes Tempo herunter — die mittlere am schnellsten */
  const tempo = [.8, .95, 1.05, 1.25, 1.05, .95, .8];
  const zuf = kerzeZufall(einst.kerzenGewechselt || 11);
  const tropfen = arme.map(() => Array.from({ length: 3 }, () => ({ s: zuf() < .5 ? -1 : 1, h: zuf(), l: .3 + zuf() * .6 })));
  let phase = Math.random() * 10, laeuft = true, zug = 0;
  const zeichne_ = () => {
    if (!c.isConnected) { laeuft = false; return; }
    phase += .016;
    ctx.clearRect(0, 0, W, H);
    const fuss = 118;
    /* Messing: Fuß, Schaft, geschwungene Arme */
    const messing = (a, b) => { const g = ctx.createLinearGradient(0, a, 0, b); g.addColorStop(0, '#8a6a33'); g.addColorStop(.5, '#d9b463'); g.addColorStop(1, '#6b5024'); return g; };
    ctx.lineCap = 'round';
    ctx.strokeStyle = messing(60, 120); ctx.lineWidth = 5;
    arme.forEach(([x, y], i) => { if (i === 3) return; ctx.beginPath(); ctx.moveTo(85, fuss - 26); ctx.quadraticCurveTo(x + (85 - x) * .55, y + 52 - 18, x, y + 52); ctx.stroke(); });
    ctx.strokeStyle = messing(40, 125); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(85, fuss); ctx.lineTo(85, 60); ctx.stroke();
    ctx.fillStyle = messing(fuss - 6, fuss + 16); ctx.beginPath(); ctx.ellipse(85, fuss + 8, 38, 11, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(85, fuss + 12, 34, 7, 0, 0, 6.29); ctx.fill();
    arme.forEach(([x, y], i) => {
      /* Tülle */
      ctx.fillStyle = messing(y + 48, y + 60); ctx.beginPath(); ctx.ellipse(x, y + 53, 7, 3.2, 0, 0, 6.29); ctx.fill();
      const voll = 26, hoehe = Math.max(5, voll * (1 - stand * tempo[i]));
      const by = y + 52 - hoehe + 2;
      /* Kerzenkörper mit Wachsläufen */
      const kg = ctx.createLinearGradient(x - 4, 0, x + 4, 0); kg.addColorStop(0, '#d8c89c'); kg.addColorStop(.5, '#f3e7c6'); kg.addColorStop(1, '#cdbb8c');
      ctx.fillStyle = kg; ctx.fillRect(x - 3.5, by, 7, y + 52 - by);
      ctx.fillStyle = 'rgba(255,250,236,.9)';
      for (const tr of tropfen[i]) { const ty = by + tr.h * (y + 52 - by); ctx.fillRect(x + tr.s * 3.2 - .7, ty, 1.4, (y + 52 - ty) * tr.l); }
      ctx.fillStyle = 'rgba(120,90,40,.3)'; ctx.beginPath(); ctx.ellipse(x, by, 3.5, 1.4, 0, 0, 6.29); ctx.fill();
      /* Flamme */
      const fl = 1 + .12 * Math.sin(phase * 8 + i * 1.7) + .06 * Math.sin(phase * 17 + i);
      const neig = Math.sin(phase * .9 + i) * .08 + zug * (i % 2 ? -1 : 1) * .2;
      const fh = 15 * fl, fw = 4.6;
      kerzeSchein(ctx, x, by - fh * .5, 24, 28, [[0, 'rgba(255,170,70,' + (.24 * fl).toFixed(3) + ')'], [1, 'rgba(255,140,50,0)']]);
      ctx.strokeStyle = '#3b2e22'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x + neig * 2, by - 3); ctx.stroke();
      ctx.beginPath();
      const sx = x + neig * 14;
      ctx.moveTo(x - fw * .2, by - 2);
      for (let k = 1; k <= 10; k++) { const u = k / 10; ctx.lineTo(sx * u + x * (1 - u) - fw * kerzeFlammenBreite(u) * .55, by - 2 - fh * u); }
      for (let k = 10; k >= 1; k--) { const u = k / 10; ctx.lineTo(sx * u + x * (1 - u) + fw * kerzeFlammenBreite(u) * .55, by - 2 - fh * u); }
      ctx.closePath();
      const g = ctx.createLinearGradient(0, by, 0, by - fh);
      g.addColorStop(0, 'rgba(255,150,40,.92)'); g.addColorStop(.6, 'rgba(255,200,100,.95)'); g.addColorStop(1, 'rgba(255,245,210,.3)');
      ctx.fillStyle = g; ctx.fill();
      ctx.fillStyle = 'rgba(120,160,255,.35)'; ctx.beginPath(); ctx.ellipse(x, by - 3, 1.6, 1.2, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,252,230,.85)'; ctx.beginPath(); ctx.ellipse(x, by - 2 - fh * .3, 1.4, fh * .25, 0, 0, 6.29); ctx.fill();
    });
    zug *= .94;
    if (laeuft) requestAnimationFrame(zeichne_);
  };
  requestAnimationFrame(zeichne_);
  return { element: c, puste: (s = .5) => { zug += s; } };
}

/* ----- Die Lampe mit Zugschnur ----- */
function baueLampe(szene, e, maler) {
  const halter = el('div', { class: 'desk-ding lampe' + (e.lampeAn ? '' : ' aus'), title: 'Die Lampe: an der Schnur ziehen' });
  const schirm = el('div', { class: 'schirm' });
  const arm = el('i', { class: 'arm' });
  const schnur = el('div', { class: 'schnur' }, el('i', { class: 'faden' }), el('b', { class: 'knauf' }));
  halter.append(arm, schirm, schnur);
  const RUHE = 54, MAX = 150, SCHWELLE = 46;
  const zustand = { x: 0, v: 0 };   /* Auslenkung über Ruhe */
  let zieht = null, raf = 0, letzte = 0, maxZug = 0;
  const male = () => { schnur.style.height = (RUHE + zustand.x) + 'px'; schnur.style.setProperty('--dehnung', (1 + zustand.x / 260).toFixed(3)); };
  const feder = (jetzt) => {
    const dt = Math.min(.04, (jetzt - letzte) / 1000 || .016); letzte = jetzt;
    schnurSchritt(zustand, dt); male();
    if (zustand.x !== 0 || zustand.v !== 0) raf = requestAnimationFrame(feder); else raf = 0;
  };
  const umschalten = () => {
    e.lampeAn = !e.lampeAn;
    D.einst.schreibtisch = { ...e }; speichereEinst();
    halter.classList.toggle('aus', !e.lampeAn);
    szene.classList.toggle('lampe-aus', !e.lampeAn);
    if (maler) maler.setze({ lampeAn: e.lampeAn });
    schreibtischKlick('klick');
  };
  const knauf = schnur.querySelector('.knauf');
  knauf.addEventListener('pointerdown', (ev) => {
    ev.stopPropagation(); ev.preventDefault();
    cancelAnimationFrame(raf); raf = 0;
    zieht = { y0: ev.clientY, x0: zustand.x }; maxZug = 0; zustand.v = 0;
    try { knauf.setPointerCapture(ev.pointerId); } catch (x) {}
    halter.classList.add('zieht');
  });
  knauf.addEventListener('pointermove', (ev) => {
    if (!zieht) return;
    const roh = zieht.x0 + (ev.clientY - zieht.y0);
    /* Die Schnur gibt nach, aber nicht unendlich — oben bleibt sie straff. */
    zustand.x = roh < 0 ? roh * .15 : roh > MAX - RUHE ? (MAX - RUHE) + (roh - (MAX - RUHE)) * .12 : roh;
    maxZug = Math.max(maxZug, zustand.x);
    male();
  });
  const loslassen = () => {
    if (!zieht) return;
    zieht = null; halter.classList.remove('zieht');
    if (maxZug >= SCHWELLE) { umschalten(); zustand.v = -260; } else zustand.v = -60;
    letzte = performance.now(); raf = requestAnimationFrame(feder);
  };
  knauf.addEventListener('pointerup', loslassen); knauf.addEventListener('pointercancel', loslassen);
  /* Der Schirm selbst: Helligkeit in Stufen */
  schirm.addEventListener('click', () => {
    if (!e.lampeAn) { umschalten(); return; }
    const stufen = [.45, .65, .8, 1];
    const i = stufen.findIndex((s) => Math.abs(s - e.lampe) < .01);
    e.lampe = stufen[(i + 1) % stufen.length];
    D.einst.schreibtisch = { ...e }; speichereEinst();
    if (maler) maler.setze({ lampe: e.lampe });
    szene.style.setProperty('--lampe', e.lampe);
    toast(e.lampe >= 1 ? 'Hell.' : e.lampe >= .8 ? 'Warm.' : e.lampe >= .65 ? 'Gedämpft.' : 'Nur ein Schimmer.');
  });
  male();
  return halter;
}

/* ----- Die Standuhr ----- */
function baueUhr(e) {
  const uhr = el('button', { class: 'desk-ding uhr', title: 'Die Standuhr' },
    el('div', { class: 'uhr-gehaeuse' }, el('div', { class: 'zifferblatt' }, el('i', { class: 'zeiger stunde' }), el('i', { class: 'zeiger minute' }), el('i', { class: 'achse' })),
      el('div', { class: 'pendelfenster' }, el('i', { class: 'pendel' }))));
  const stelle = () => {
    const d = new Date();
    uhr.querySelector('.zeiger.stunde').style.transform = 'rotate(' + ((d.getHours() % 12) * 30 + d.getMinutes() * .5) + 'deg)';
    uhr.querySelector('.zeiger.minute').style.transform = 'rotate(' + (d.getMinutes() * 6 + d.getSeconds() * .1) + 'deg)';
  };
  stelle();
  let timer = setInterval(() => {
    if (!uhr.isConnected) { clearInterval(timer); return; }
    stelle();
    const d = new Date();
    if (e.uhrTickt) { schreibtischKlick('tick'); if (d.getMinutes() === 0 && d.getSeconds() === 0 && typeof glocke === 'function') glocke(); }
  }, 1000);
  uhr.addEventListener('click', () => {
    const start = Number(sessionStorage.getItem('vani-session-start') || Date.now());
    const min = Math.max(0, Math.round((Date.now() - start) / 60000));
    const d = new Date();
    toast(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' Uhr · ' + (min < 1 ? 'gerade erst gekommen' : min < 60 ? 'seit ' + min + ' Minuten am Tisch' : 'seit ' + Math.floor(min / 60) + ' Std. ' + (min % 60) + ' Min. am Tisch') + (e.uhrTickt ? '' : ' · tickt leise, wenn du es willst (Einrichten)'), 4200);
  });
  return uhr;
}

/* ----- Der Raum ----- */
RENDER.schreibtisch = function (haupt) {
  if (!sessionStorage.getItem('vani-session-start')) sessionStorage.setItem('vani-session-start', String(Date.now()));
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  const wetter = e.wetterFolgtKlang ? schreibtischWetter() : 'still';
  const szene = el('div', { class: 'desk-szene holz-' + e.holz + ' wetter-' + wetter + (e.kerzen ? ' kerzen-an' : '') + (e.lampeAn ? '' : ' lampe-aus'), style: '--lampe:' + e.lampe + ';--unordnung:' + e.unordnung });
  const leinwand = el('canvas', { class: 'desk-malerei' });
  const maler = schreibtischMaler(leinwand, { holz: e.holz, lampe: e.lampe, lampeAn: e.lampeAn, wetter, kerzen: e.kerzen, unordnung: e.unordnung });
  const dinge = el('div', { class: 'desk-dinge' });
  szene.append(leinwand, dinge);

  const ding = (klasse, titel, inhalt, onclick, stil) => el('button', { class: 'desk-ding ' + klasse, title: titel, 'aria-label': titel, onclick, style: stil || '' }, inhalt);

  /* Fensterknopf: Klang des Gartens */
  dinge.append(el('button', { class: 'desk-fensterknopf', title: 'Der Nachtgarten: Grillen und Wind (Klang)', onclick: () => nachtgartenKlang() }, el('span', { html: ik('klang') })));

  /* Lampe mit Zugschnur */
  dinge.append(baueLampe(szene, e, maler));

  /* Leuchter */
  let leuchter = null;
  if (e.kerzen) {
    leuchter = baueLeuchter(e);
    const stand = leuchterStand(e.wachs);
    dinge.append(ding('leuchter', stand >= 1 ? 'Die Kerzen sind herunter — neue aufstecken' : 'Der Leuchter: Schreibzeit anzünden (' + Math.round((1 - stand) * 100) + ' % Kerze)', el('div', { class: 'leuchter-bild' }, leuchter.element), async () => {
      if (leuchterStand(e.wachs) >= 1) {
        if (await frage('Die Kerzen sind nach ' + LEUCHTER_STUNDEN + ' Schreibstunden herunter. Neue aufstecken?', { ja: 'Neue Kerzen' })) { e.wachs = 0; e.kerzenGewechselt = Date.now(); D.einst.schreibtisch = { ...e }; speichereEinst(); toast('Sieben neue Kerzen. Frisch und weiß.'); zeichne(); }
        return;
      }
      const dauer = await menue([
        { text: 'Eine kleine Kerze — 10 Minuten', wert: 10 }, { text: 'Eine mittlere — 20 Minuten', wert: 20 }, { text: 'Eine lange — 45 Minuten', wert: 45 },
        { text: 'Nur die Flammen ansehen', wert: 0 }
      ], 'Der Leuchter — ' + Math.round((1 - leuchterStand(e.wachs)) * 100) + ' % Kerze übrig');
      if (dauer === null || dauer === undefined) return;
      if (!dauer) { leuchter.puste(1.2); return; }
      const b = blattAusText('', '');
      oeffneSchreibraum(b.id);
      setTimeout(() => starteSprint(dauer), 400);
    }));
  }

  /* Standuhr und der zweite Stuhl */
  dinge.append(baueUhr(e));
  dinge.append(ding('stuhl', 'Der zweite Stuhl: der Faden — ein Gespräch am Tisch', el('div', { class: 'stuhl-bild' }, el('i', { class: 'lehne' }), el('i', { class: 'sitz' }), el('i', { class: 'bein b1' }), el('i', { class: 'bein b2' })), () => { location.hash = '#/faden'; }));

  /* Manuskripte: die letzten Texte */
  const letzte = schreibtischLetzteTexte(3);
  letzte.forEach((d, i) => {
    const text = (d.text || '').trim().slice(0, 420);
    dinge.append(ding('manuskript m' + (i + 1), 'Weiterschreiben: ' + (d.titel || text.slice(0, 30)), el('div', { class: 'manuskript-papier' }, el('b', {}, d.titel || (d.typ === 'seite' ? 'Heftseite' : d.typ === 'szene' ? 'Szene' : 'Blatt')), el('span', {}, text), el('i', { class: 'korrektur k1' }), el('i', { class: 'korrektur k2' })), () => oeffneDokument(d), '--dreh:' + ((i * 7) % 9 - 4) + 'deg'));
  });
  if (!letzte.length) dinge.append(ding('manuskript m1 leer', 'Ein leeres Blatt — anfangen', el('div', { class: 'manuskript-papier' }, el('b', {}, 'Noch nichts'), el('span', {}, 'Ein leeres Blatt. Das beste Versprechen, das es gibt.')), () => schreibtischNeuesBlatt()));

  /* Tintenfass & Feder */
  dinge.append(ding('tinte', 'Tintenfass und Feder: ein neues Blatt', el('div', { class: 'tinte-bild' }, el('i', { class: 'fass' }), el('i', { class: 'fass-glanz' }), el('i', { class: 'feder f1' }), el('i', { class: 'feder f2' })), () => schreibtischNeuesBlatt()));

  /* Bücherstapel (Lesestapel) */
  const buecher = typeof lesestapelBuecher === 'function' ? lesestapelBuecher() : [];
  const stapel = el('div', { class: 'buecher-stapel' });
  buecher.slice(0, 6).forEach((b, i) => {
    const img = el('img', { alt: b.titel || 'Buch', draggable: 'false' });
    if (b.bild) setzeBild(img, b.bild);
    stapel.append(el('button', { class: 'stapel-buch' + (b.bild ? '' : ' ohne-cover'), title: (b.titel || 'Buch') + (b.seiten ? ' · Seite ' + (b.seite || 1) + ' von ' + b.seiten : ''), style: '--i:' + i + ';--dreh:' + ((i * 11) % 7 - 3) + 'deg', onclick: () => buchOeffnen(b) }, img, b.bild ? null : el('span', {}, b.titel || 'Buch')));
  });
  stapel.append(el('button', { class: 'stapel-fuss', title: 'Der Lesestapel: Bücher auflegen, ordnen', onclick: () => lesestapelZeigen() }, buecher.length ? (buecher.length > 6 ? '+' + (buecher.length - 6) + ' · ' : '') + 'Lesestapel' : 'Bücher auflegen'));
  dinge.append(el('div', { class: 'desk-ding-halter buecher' }, stapel));

  /* Tasse: der Schreibtag */
  const tag = schreibtischTag();
  dinge.append(ding('tasse' + (tag.heute > 0 ? ' dampft' : ''), 'Die Tasse: ' + (tag.heute ? tag.heute + ' Wörter heute' : 'heute noch nichts') + (tag.serie > 1 ? ' · ' + tag.serie + ' Tage in Folge' : ''), el('div', { class: 'tasse-bild' }, el('i', { class: 'dampf d1' }), el('i', { class: 'dampf d2' }), el('i', { class: 'dampf d3' }), el('i', { class: 'henkel' }), el('span', { class: 'tasse-zahl' }, tag.heute ? String(tag.heute) : '')), () => {
    toast(tag.heute ? tag.heute + ' Wörter heute' + (tag.serie > 1 ? ' — der ' + tag.serie + '. Tag in Folge.' : '.') : 'Heute noch nichts. Die Tasse wartet.', 3600);
  }));

  /* Glas mit Fundstück: ein eigenes Foto oder der Funke */
  const fundfoto = schreibtischFundfoto();
  const glasInhalt = el('div', { class: 'glas-bild' }, el('i', { class: 'glaskoerper' }), el('i', { class: 'glas-deckel' }));
  if (fundfoto) { const img = el('img', { class: 'fund-foto', alt: '', draggable: 'false' }); setzeBild(img, fundfoto.bild); glasInhalt.append(img); }
  else glasInhalt.append(el('i', { class: 'fundstueck' }));
  dinge.append(ding('glas', fundfoto ? 'Das Glas: heute liegt ein Bild von dir darin — und der Funke des Tages' : 'Das Glas mit dem Fundstück: der Funke des Tages', glasInhalt, async () => {
    const f = schreibtischFunke();
    const wahl = await menue([{ text: 'Damit schreiben', icon: 'stift', wert: 'schreiben' }, { text: 'Anderen Funken', icon: 'wuerfel', wert: 'neu' }, fundfoto ? { text: 'Das Bild ansehen, wo es herkommt', icon: 'kamera', wert: 'bild' } : null], f);
    if (wahl === 'schreiben') { const b = blattAusText('', f + '\n\n'); oeffneSchreibraum(b.id); }
    else if (wahl === 'neu') { const g = neuerFunke(Math.random() < .4); const w2 = await menue([{ text: 'Damit schreiben', icon: 'stift', wert: 'schreiben' }], g); if (w2) { const b = blattAusText('', g + '\n\n'); oeffneSchreibraum(b.id); } }
    else if (wahl === 'bild' && fundfoto) oeffneDokument(fundfoto);
  }));

  /* Brief mit Siegel */
  const briefe = vomTyp('brief');
  const offenZumLesen = briefe.some((b) => briefIstOffen(b) && b.versiegelt);
  const neuester = briefe.sort((a, b) => (b.angelegt || 0) - (a.angelegt || 0))[0];
  const siegel = el('i', { class: 'siegel' });
  if (neuester && neuester.bild) { const img = el('img', { alt: '', draggable: 'false' }); setzeBild(img, neuester.bild); siegel.append(img); siegel.classList.add('eigen'); }
  dinge.append(ding('brief' + (offenZumLesen ? ' bereit' : '') + (briefe.length ? '' : ' leer'), offenZumLesen ? 'Ein Brief an dich darf geöffnet werden' : 'Ein Brief an mich (Zeitkapsel)', el('div', { class: 'brief-bild' }, el('i', { class: 'zeile z1' }), el('i', { class: 'zeile z2' }), siegel), () => briefeZeigen()));

  /* Karteikarten, Lupe, Bleistiftstummel, Notizbuch */
  dinge.append(ding('karten', 'Karteikarten: eine Wortkiste abfragen', el('div', { class: 'karten-bild' }, el('i'), el('i'), el('i')), async () => {
    const kisten = typeof wortkisten === 'function' ? wortkisten() : [];
    const wahl = await menue([{ text: 'Alle Wörter', icon: 'woerter', wert: 'alle' }, ...kisten.map((k) => ({ text: k.titel || 'Wortkiste', icon: 'woerter', wert: k.id }))], 'Welche Kiste abfragen?');
    if (wahl) wortkisteAbfragen(wahl, wahl === 'alle' ? 'Alle Wörter' : (D.docs.get(wahl) || {}).titel);
  }));
  dinge.append(ding('lupe', 'Die Lupe: suchen', el('div', { class: 'lupe-bild' }, el('i', { class: 'linse' }), el('i', { class: 'glanz' }), el('i', { class: 'griff' })), () => { if (typeof oeffneSuche === 'function') oeffneSuche(); else location.hash = '#/suche'; }));
  dinge.append(ding('stummel', 'Der Bleistiftstummel: schnell einen Schnipsel', el('div', { class: 'stummel-bild' }, el('i', { class: 'holz' }), el('i', { class: 'mine' })), async () => {
    const t = await eingabe({ titel: 'Schnell notiert', platzhalter: 'ein Satz, ein Wort, ein Gedanke …', mehrzeilig: true, ok: 'Ablegen' });
    if (t) { neuDoc('schnipsel', { text: t }); toast('Liegt in den Schnipseln.'); }
  }));
  const letztesHeft = vomTyp('heft').filter((h) => !h.archiv).sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))[0];
  if (letztesHeft) dinge.append(ding('notizbuch', 'Das Notizbuch mit zu vielen Zetteln: ' + letztesHeft.titel, el('div', { class: 'notizbuch-bild', style: heftDeckelDaten(letztesHeft).style }, el('i', { class: 'zettelchen z1' }), el('i', { class: 'zettelchen z2' }), el('i', { class: 'zettelchen z3' }), el('i', { class: 'gummi' })), () => { location.hash = '#/heft/' + letztesHeft.id; }));

  /* Verse auf der Platte */
  if (e.verse && e.unordnung > .2) schreibtischVerse(3).forEach((v, i) => dinge.append(el('div', { class: 'desk-vers v' + (i + 1) }, v)));

  /* Papierkorb, Schublade, Einrichten */
  dinge.append(el('button', { class: 'desk-korb', title: 'Der Papierkorb unterm Tisch', onclick: () => papierkorbAmTisch() }, el('i', { class: 'knuell k1' }), el('i', { class: 'knuell k2' }), el('i', { class: 'knuell k3' }), el('i', { class: 'korbrand' })));
  dinge.append(el('button', { class: 'desk-schublade', title: 'Die Schublade', onclick: () => schubladeOeffnen() }, el('i', { class: 'griffknauf' })));
  dinge.append(el('button', { class: 'rundknopf zart desk-einrichten', html: ik('feinheiten'), title: 'Schreibtisch einrichten', onclick: () => schreibtischEinrichten(() => zeichne()) }));

  haupt.append(szene);
  maler.start();
  /* Aufhören, sobald der Raum weg ist */
  const beobachter = new MutationObserver(() => { if (!szene.isConnected) { maler.stopp(); beobachter.disconnect(); } });
  beobachter.observe(haupt, { childList: true });
  szene.addEventListener('pointerdown', () => { if (leuchter) leuchter.puste(.35); });
};

function schreibtischEinrichten(danach) {
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  const alt = { ...e };
  const wahlgruppe = (liste, lies, setze) => {
    const g = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
    for (const [id, name] of liste) g.append(el('button', { class: lies() === id ? 'an' : '', onclick: (ev) => { setze(id); $$('button', g).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); D.einst.schreibtisch = { ...e }; if (danach) danach(); } }, name));
    return g;
  };
  const schalter = (lies, setze) => el('button', { class: 'schalter' + (lies() ? ' an' : ''), onclick: (ev) => { setze(!lies()); ev.currentTarget.classList.toggle('an', lies()); D.einst.schreibtisch = { ...e }; if (danach) danach(); } }, el('i'));
  const lampe = el('input', { type: 'range', min: '.25', max: '1', step: '.05', value: String(e.lampe) });
  lampe.addEventListener('input', () => { e.lampe = Number(lampe.value); D.einst.schreibtisch = { ...e }; const s = document.querySelector('.desk-szene'); if (s) s.style.setProperty('--lampe', e.lampe); });
  lampe.addEventListener('change', () => { if (danach) danach(); });
  const unordnung = el('input', { type: 'range', min: '0', max: '1', step: '.1', value: String(e.unordnung) });
  unordnung.addEventListener('change', () => { e.unordnung = Number(unordnung.value); D.einst.schreibtisch = { ...e }; if (danach) danach(); });
  let behalten = false;
  const zeile = (name, unter, inhalt) => el('div', { class: 'einstellgruppe einstellzeile' }, el('span', { class: 'ename' }, name, unter ? el('div', { style: 'font-size:12.5px;color:var(--blass)' }, unter) : null), inhalt);
  const kasten = el('div', { class: 'modal tisch-einrichten' },
    el('h2', {}, 'Den Schreibtisch einrichten'),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Holz'), wahlgruppe(SCHREIBTISCH_HOELZER, () => e.holz, (v) => { e.holz = v; })),
    zeile('Lampe', 'Kein Deckenlicht. Niemals. Nur dieser Kegel — an der Schnur ziehen schaltet sie.', lampe),
    zeile('Leuchter', 'Sieben Flammen. Die Kerzen brennen über ' + LEUCHTER_STUNDEN + ' Schreibstunden wirklich herunter (' + Math.round((1 - leuchterStand(e.wachs)) * 100) + ' % übrig).', schalter(() => e.kerzen, (v) => { e.kerzen = v; })),
    zeile('Die Uhr tickt', 'Ein leises Ticken, zur vollen Stunde ein Glockenschlag.', schalter(() => e.uhrTickt, (v) => { e.uhrTickt = v; })),
    zeile('Fenster hört auf den Klang', 'Spielt Regen, regnet es vor dem Fenster; bei Gewitter wetterleuchtet es.', schalter(() => e.wetterFolgtKlang, (v) => { e.wetterFolgtKlang = v; })),
    zeile('Eigene Zeilen auf der Platte', 'Kurze Sätze aus meinen Funden, wie hingekritzelt.', schalter(() => e.verse, (v) => { e.verse = v; })),
    zeile('Unordnung', 'Wie viel auf dem Tisch liegt und wie schief.', unordnung),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => { D.einst.schreibtisch = alt; if (danach) danach(); zu(); } }, 'Zurück'),
      el('button', { class: 'knopf voll', onclick: () => { behalten = true; D.einst.schreibtisch = { ...e }; speichereEinst(); zu(); if (danach) danach(); } }, 'So bleibt es')));
  const zu = zeigeDeck(kasten, () => { if (!behalten) { D.einst.schreibtisch = alt; if (danach) danach(); } });
}
