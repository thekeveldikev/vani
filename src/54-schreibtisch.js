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
    zitatModus: TISCHZITAT_MODI.some(([id]) => id === q.zitatModus) ? q.zitatModus : (q.verse === false ? 'nichts' : 'gefunden'),
    blaetterModus: TISCHBLATT_MODI.some(([id]) => id === q.blaetterModus) ? q.blaetterModus : 'vani',
    blaetter: saubereTischblattWahl(q.blaetter),
    uhrTickt: q.uhrTickt === true,
    wachs: begrenze(q.wachs, 0, LEUCHTER_STUNDEN * 60, 0),         /* verbrannte Minuten */
    kerzenGewechselt: begrenze(q.kerzenGewechselt, 0, 4102444800000, 0),
    kleckse: typeof saubereKleckse === 'function' ? saubereKleckse(q.kleckse) : [],
    federKratzt: q.federKratzt === true,
    offenesBuch: q.offenesBuch !== false,
    tageszeit: (typeof TAGESZEIT_WAHLEN !== 'undefined' ? TAGESZEIT_WAHLEN : ['echt']).includes(q.tageszeit) ? q.tageszeit : 'echt',
    jahreszeit: (typeof JAHRESZEIT_WAHLEN !== 'undefined' ? JAHRESZEIT_WAHLEN : ['echt']).includes(q.jahreszeit) ? q.jahreszeit : 'echt',
    blattId: typeof q.blattId === 'string' && q.blattId ? q.blattId.slice(0, 80) : null
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

/* Die Zugschnur: Feder mit Dämpfung — in einer Richtung (x) oder in zweien
   (x, y als Auslenkung von der Ruhelage). Pur, je Schritt. */
function schnurSchritt(zustand, dt) {
  const z = zustand;
  const k = 70, d = 7;       /* Federhärte, Dämpfung */
  if (typeof z.y === 'number') {
    /* 2D: die Ruhelage hängt senkrecht; quer wirkt die Feder etwas weicher */
    const ax = -k * .9 * z.x - d * (z.vx || 0), ay = -k * z.y - d * (z.vy || 0);
    z.vx = (z.vx || 0) + ax * dt; z.vy = (z.vy || 0) + ay * dt;
    z.x += z.vx * dt; z.y += z.vy * dt;
    if (Math.hypot(z.x, z.y) < .3 && Math.hypot(z.vx, z.vy) < 3) { z.x = 0; z.y = 0; z.vx = 0; z.vy = 0; }
    return z;
  }
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

/* Kurze eigene Zeilen für die „spontanen Verse“ auf der Platte — aus den
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
    ...funde.map((f) => ({ text: '„' + (f.auszug.split('\n')[0] || '').slice(0, 60) + (f.auszug.length > 60 ? '…' : '') + '“ — ' + f.art.toLowerCase(), icon: 'fund', wert: 'fund:' + f.doc.id })),
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
    await zeigeAnkunft('Ein Stück Metall unbekannter Herkunft', ['„' + (metall.text || '').slice(0, 300) + '“'], 'Schnipsel vom ' + fmtDatum(metall.angelegt) + ' — vielleicht bedeutungslos, vielleicht der Schlüssel zu einem ganzen Roman.', () => { location.hash = '#/schnipsel'; });
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
    if (ctx.state === 'suspended') { try { ctx.resume().catch(() => {}); } catch (e) {} }
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
function baueLeuchter(einst, woche) {
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
    /* Unter Schreibraum oder Leser sieht niemand die Flammen: sparsam weiterlaufen */
    if ((typeof _sr !== 'undefined' && _sr) || (typeof _leser !== 'undefined' && _leser) || (typeof _smOffen !== 'undefined' && _smOffen) || (typeof _epub !== 'undefined' && _epub) || document.visibilityState === 'hidden') { setTimeout(() => requestAnimationFrame(zeichne_), 500); return; }
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
      /* Flamme — die Woche: heute höher, Zukunft klein, ein vergangener Tag ohne Wörter erloschen */
      const wt = woche && woche[i];
      const faktor = !wt ? 1 : wt.heute ? 1.38 : wt.zukunft ? .72 : wt.worte > 0 ? 1 : 0;
      if (faktor === 0) {
        ctx.strokeStyle = '#2b211a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x + .6, by - 3.5); ctx.stroke();
        /* ein Faden Rauch */
        ctx.strokeStyle = 'rgba(200,200,210,' + (.12 + .06 * Math.sin(phase * 2 + i)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + .6, by - 4);
        for (let k = 1; k <= 6; k++) ctx.lineTo(x + .6 + Math.sin(phase * 1.3 + k * .9 + i) * k * .9, by - 4 - k * 4); ctx.stroke();
        return;
      }
      const fl = faktor * (1 + .12 * Math.sin(phase * 8 + i * 1.7) + .06 * Math.sin(phase * 17 + i));
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
  /* Die Schnur ist ein Pfad: vom Schirm zum Knauf, mit leichtem Bauch, und sie
     folgt dem Finger frei — nach unten, zur Seite, schräg. */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'schnur-svg'); svg.setAttribute('viewBox', '0 0 240 320');
  const pfad = document.createElementNS(NS, 'path'); pfad.setAttribute('class', 'schnur-pfad'); svg.append(pfad);
  const schatten = document.createElementNS(NS, 'path'); schatten.setAttribute('class', 'schnur-schatten'); svg.insertBefore(schatten, pfad);
  const knauf = el('b', { class: 'knauf', title: 'Ziehen: Licht an oder aus' });
  halter.append(arm, schirm, svg, knauf);
  /* Aufhängung und Ruhelage in Lampen-Koordinaten (px) */
  const P = { x: 128, y: 140 }, RUHE = 58, MAX = 130, SCHWELLE = 44;
  const z = { x: 0, y: 0, vx: 0, vy: 0 };   /* Auslenkung des Knaufs von der Ruhelage */
  let zieht = null, raf = 0, letzte = 0, maxZug = 0;
  const knaufPos = () => ({ x: P.x + z.x, y: P.y + RUHE + z.y });
  const male = () => {
    const k = knaufPos();
    const dx = k.x - P.x, dy = k.y - P.y, l = Math.hypot(dx, dy) || 1;
    /* Bauch der Schnur: quer zur Zugrichtung, von der Geschwindigkeit gebogen */
    const bauch = Math.max(-26, Math.min(26, -(z.vx || 0) * .04 + (zieht ? 0 : Math.sin(performance.now() / 700) * .6)));
    const mx = (P.x + k.x) / 2 - dy / l * bauch, my = (P.y + k.y) / 2 + dx / l * bauch;
    const d = 'M' + P.x + ' ' + P.y + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + k.x.toFixed(1) + ' ' + k.y.toFixed(1);
    pfad.setAttribute('d', d); schatten.setAttribute('d', d);
    const winkel = Math.atan2(dx, dy) * -180 / Math.PI;
    knauf.style.transform = 'translate(' + (k.x - 8).toFixed(1) + 'px,' + (k.y - 2).toFixed(1) + 'px) rotate(' + winkel.toFixed(1) + 'deg)';
    /* gedehnt: je länger, desto dünner */
    pfad.style.strokeWidth = (2.4 - Math.min(1, (l - RUHE) / 160)).toFixed(2);
  };
  const feder = (jetzt) => {
    const dt = Math.min(.04, (jetzt - letzte) / 1000 || .016); letzte = jetzt;
    schnurSchritt(z, dt); male();
    if (z.x !== 0 || z.y !== 0 || z.vx !== 0 || z.vy !== 0) raf = requestAnimationFrame(feder); else raf = 0;
  };
  const umschalten = () => {
    e.lampeAn = !e.lampeAn;
    D.einst.schreibtisch = { ...e }; speichereEinst();
    halter.classList.toggle('aus', !e.lampeAn);
    szene.classList.toggle('lampe-aus', !e.lampeAn);
    halter.classList.add('schaltet'); setTimeout(() => halter.classList.remove('schaltet'), 500);
    if (maler) maler.setze({ lampeAn: e.lampeAn });
    schreibtischKlick('klick');
  };
  knauf.addEventListener('pointerdown', (ev) => {
    ev.stopPropagation(); ev.preventDefault();
    cancelAnimationFrame(raf); raf = 0;
    const r = halter.getBoundingClientRect();
    const s = r.width / 240 || 1;   /* die Lampe ist auf schmalen Geräten skaliert */
    zieht = { ox: (ev.clientX - r.left) / s - knaufPos().x, oy: (ev.clientY - r.top) / s - knaufPos().y, r, s }; maxZug = 0;
    z.vx = 0; z.vy = 0;
    try { knauf.setPointerCapture(ev.pointerId); } catch (x) {}
    halter.classList.add('zieht');
  });
  knauf.addEventListener('pointermove', (ev) => {
    if (!zieht) return;
    /* Wunschposition des Knaufs, dann an der Schnur gehalten: maximal MAX lang,
       darüber gibt sie nur noch ein wenig nach */
    let wx = (ev.clientX - zieht.r.left) / zieht.s - zieht.ox, wy = (ev.clientY - zieht.r.top) / zieht.s - zieht.oy;
    let dx = wx - P.x, dy = wy - P.y;
    if (dy < 6) { dy = 6 + (dy - 6) * .08; }       /* nicht über die Aufhängung hinaus */
    const l = Math.hypot(dx, dy);
    if (l > MAX) { const ueber = l - MAX; const f = (MAX + ueber * .12) / l; dx *= f; dy *= f; }
    z.x = dx; z.y = dy - RUHE;
    maxZug = Math.max(maxZug, Math.hypot(dx, dy) - RUHE);
    male();
  });
  const loslassen = () => {
    if (!zieht) return;
    zieht = null; halter.classList.remove('zieht');
    if (maxZug >= SCHWELLE) { umschalten(); z.vy = -240; } else { z.vy = -50; }
    letzte = performance.now(); raf = requestAnimationFrame(feder);
  };
  knauf.addEventListener('pointerup', loslassen); knauf.addEventListener('pointercancel', loslassen);
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
  /* Ein Hauch Bewegung, auch in Ruhe */
  const atmen = () => { if (!halter.isConnected) return; if (!zieht && !raf) male(); setTimeout(() => requestAnimationFrame(atmen), 140); };
  requestAnimationFrame(atmen);
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

/* Woraus die Szene gebaut ist — ändert sich davon nichts, bleibt sie stehen. Lampe,
   Wachs, Kleckse und das eingespannte Blatt pflegt die Szene selbst, sie zählen nicht. */
function schreibtischSignatur() {
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  const buecher = typeof lesestapelBuecher === 'function' ? lesestapelBuecher() : [];
  const briefe = vomTyp('brief');
  const heft = vomTyp('heft').filter((h) => !h.archiv).sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))[0];
  const tag = schreibtischTag();
  const fund = schreibtischFundfoto();
  return JSON.stringify([
    e.holz, e.kerzen, e.wetterFolgtKlang, e.unordnung, e.verse, e.zitatModus, e.blaetterModus, (e.blaetter || []).join(','), e.uhrTickt, e.kerzenGewechselt, e.federKratzt, e.offenesBuch, e.tageszeit, e.jahreszeit,
    e.wetterFolgtKlang ? schreibtischWetter() : 'still', D.einst.tagesziel, tag.heute, tag.serie,
    /* Ohne die geritzten Saetze bliebe der Tisch stehen, wenn einer dazukommt
       oder verschwindet — und die Klinge liefe nie. */
    typeof tischzitate === 'function' ? tischzitate().map((z) => z.id + ':' + z.text).join('|') : '',
    buecher.slice(0, 9).map((b) => b.id + ':' + (b.seite || 0) + ':' + (b.bild || '') + ':' + (b.titel || '')),
    schreibtischLetzteTexte(3).map((d) => d.id + ':' + (d.geaendert || 0)),
    briefe.length, briefe.some((b) => briefIstOffen(b) && b.versiegelt), heft ? heft.id + ':' + (heft.geaendert || 0) : '',
    fund ? fund.id : '', typeof schreibtischKlangName === 'function' ? schreibtischKlangName() : '',
    typeof syncFremdAktiv === 'function' ? syncFremdAktiv() : false, (typeof teelichterWoche === 'function' ? teelichterWoche(D.stats.tage, D.einst.tagesziel) : []).map((t) => t.erreicht),
    typeof papierkorbZahl === 'function' ? papierkorbZahl() : 0,
    (() => { const f = typeof heuteVorEinemJahr === 'function' ? heuteVorEinemJahr([...D.docs.values()]) : null; return f ? f.doc.id : ''; })()
  ]);
}
/* Der Würfel für „Überraschung“: einmal je Einstellung, dann gemerkt.
   Stellt man wieder auf etwas Festes und später zurück auf Zufall, fällt er
   neu — das ist gewollt. */
const _deskWurf = new Map();
function schreibtischWurf(was, wahl, moeglich) {
  if (wahl !== 'zufall') { _deskWurf.delete(was); return wahl; }
  if (!_deskWurf.has(was)) _deskWurf.set(was, moeglich[Math.floor(Math.random() * moeglich.length)]);
  return _deskWurf.get(was);
}

RENDER.schreibtisch = function (haupt) {
  if (!sessionStorage.getItem('vani-session-start')) sessionStorage.setItem('vani-session-start', String(Date.now()));
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  const wetter = e.wetterFolgtKlang ? schreibtischWetter() : 'still';
  const erstesMal = !sessionStorage.getItem('vani-desk-gesehen');
  const szene = el('div', { class: 'desk-szene holz-' + e.holz + ' wetter-' + wetter + (e.kerzen ? ' kerzen-an' : '') + (e.lampeAn ? '' : ' lampe-aus'), style: '--lampe:' + e.lampe + ';--unordnung:' + e.unordnung });
  const leinwand = el('canvas', { class: 'desk-malerei' });
  /* „Überraschung“ wird einmal gewürfelt — und bleibt dann liegen, solange
     die App offen ist. Vorher fiel der Würfel bei JEDEM Neuzeichnen: kam man
     aus einem anderen Raum zurück, sprang der Tisch von Abend auf Mittag.
     Das war keine Überraschung mehr, sondern Unruhe. */
  const tageszeitWahl = schreibtischWurf('tageszeit', e.tageszeit, ['morgen', 'mittag', 'golden', 'abend', 'nacht']);
  const jahreszeitWahl = schreibtischWurf('jahreszeit', e.jahreszeit, ['fruehling', 'sommer', 'herbst', 'winter']);
  const maler = schreibtischMaler(leinwand, { holz: e.holz, lampe: e.lampe, lampeAn: e.lampeAn, wetter, kerzen: e.kerzen, unordnung: e.unordnung, alter: schreibtischAlter(D.stats.tage), kleckse: e.kleckse, tageszeitWahl, jahreszeitWahl });
  const dinge = el('div', { class: 'desk-dinge' });
  szene.append(leinwand, dinge);

  const ding = (klasse, titel, inhalt, onclick, stil) => el('button', { class: 'desk-ding ' + klasse, title: titel, 'aria-label': titel, onclick, style: stil || '' }, inhalt);

  /* Fensterknopf: Klang des Gartens */
  dinge.append(el('button', { class: 'desk-fensterknopf', title: 'Der Nachtgarten: Grillen und Wind (Klang)', onclick: () => nachtgartenKlang() }, el('span', { html: ik('klang') })));

  /* Lampe mit Zugschnur */
  dinge.append(baueLampe(szene, e, maler));
  /* Fensterbank: Wetterglas (Klang) und die Teelichter der Woche (Tagesziel) */
  dinge.append(baueWetterglas());
  const teelichter = baueTeelichter(); if (teelichter) dinge.append(teelichter);

  /* Leuchter */
  let leuchter = null;
  if (e.kerzen) {
    leuchter = baueLeuchter(e, leuchterWoche(D.stats.tage));
    const stand = leuchterStand(e.wachs);
    dinge.append(ding('leuchter', stand >= 1 ? 'Die Kerzen sind herunter — neue aufstecken' : 'Der Leuchter: sieben Kerzen, Montag bis Sonntag — heute brennt höher. Tippen: Schreibzeit anzünden (' + Math.round((1 - stand) * 100) + ' % Kerze)', el('div', { class: 'leuchter-bild' }, leuchter.element), async () => {
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

  /* Manuskripte: entweder die zuletzt beschriebenen oder die selbst gewaehlten */
  const letzte = typeof tischblaetter === 'function' ? tischblaetter(e) : schreibtischLetzteTexte(3);
  letzte.forEach((d, i) => {
    const text = (d.text || '').trim().slice(0, 420);
    dinge.append(ding('manuskript m' + (i + 1), 'Weiterschreiben: ' + (d.titel || text.slice(0, 30)), el('div', { class: 'manuskript-papier' }, el('b', {}, d.titel || (d.typ === 'seite' ? 'Heftseite' : d.typ === 'szene' ? 'Szene' : 'Blatt')), el('span', {}, text), el('i', { class: 'korrektur k1' }), el('i', { class: 'korrektur k2' })), () => oeffneDokument(d), '--dreh:' + ((i * 7) % 9 - 4) + 'deg'));
  });
  if (!letzte.length) dinge.append(ding('manuskript m1 leer', 'Ein leeres Blatt — anfangen', el('div', { class: 'manuskript-papier' }, el('b', {}, 'Noch nichts'), el('span', {}, 'Ein leeres Blatt. Das beste Versprechen, das es gibt.')), () => schreibtischNeuesBlatt()));

  /* Tintenfass & Feder */
  dinge.append(ding('tinte', 'Tintenfass und Feder: ein Blatt einspannen', el('div', { class: 'tinte-bild' }, el('i', { class: 'fass' }), el('i', { class: 'fass-glanz' }), el('i', { class: 'feder f1' }), el('i', { class: 'feder f2' })), async () => {
    const liegt = e.blattId && D.docs.get(e.blattId);
    const w = await menue([
      liegt ? { text: 'Das eingespannte Blatt weiterschreiben', icon: 'blatt', wert: 'weiter' } : null,
      { text: 'Sitzung beginnen — Uhr, Klang, Kerze, ein Rat', icon: 'feuer', wert: 'sitzung' },
      { text: 'Ein neues Blatt einspannen — hier auf dem Tisch', icon: 'blatt', wert: 'einspannen' },
      { text: 'Ein neues Blatt im Schreibraum', icon: 'stift', wert: 'raum' }
    ].filter(Boolean), 'Tinte und Feder');
    if (w === 'sitzung') { if (typeof sitzungBeginnen === 'function') sitzungBeginnen(); }
    else if (w === 'weiter') blattEinspannen(szene, e, e.blattId); else if (w === 'einspannen') blattEinspannen(szene, e, null); else if (w === 'raum') schreibtischNeuesBlatt();
  }));

  /* Das Bücherbord: die Bücher stehen in einer Reihe, leicht gelehnt, jedes
     für sich greifbar — kein Stapel, in dem nur das oberste zu sehen ist. */
  const buecher = typeof lesestapelBuecher === 'function' ? lesestapelBuecher() : [];
  const bord = el('div', { class: 'buecher-bord' });
  const schmal = window.innerWidth < 760;
  const zeigbar = Math.min(buecher.length, schmal ? 5 : window.innerWidth < 1000 ? 6 : 8);
  /* Die Reihe bleibt in ihrer Breite: je mehr Bücher, desto enger stehen sie */
  const bordBreite = schmal ? window.innerWidth * .40 : Math.min(320, (window.innerWidth - 86) * .33);
  const buchBreite = schmal ? 52 : 64;
  const schritt = zeigbar > 1 ? Math.max(30, Math.min(buchBreite - 12, (bordBreite - buchBreite - 12) / (zeigbar - 1))) : buchBreite - 14;
  bord.style.setProperty('--ueberlapp', (schritt - buchBreite).toFixed(1) + 'px');
  buecher.slice(0, zeigbar).forEach((b, i) => {
    const img = el('img', { alt: b.titel || 'Buch', draggable: 'false' });
    if (b.bild) setzeBild(img, b.bild);
    const fortschritt = buchFortschritt(b.seite, b.seiten);
    bord.append(el('button', { class: 'bord-buch' + (b.bild ? '' : ' ohne-cover'), title: (b.titel || 'Buch') + (b.seiten ? ' · Seite ' + (b.seite || 1) + ' von ' + b.seiten : ''), style: '--i:' + i + ';--lehn:' + ((i * 7) % 5 - 2) + 'deg', onclick: () => buchOeffnen(b) },
      img, b.bild ? null : el('span', {}, b.titel || 'Buch'), fortschritt > 0 ? el('i', { class: 'leseband', style: 'height:' + Math.max(8, 100 - fortschritt) + '%' }) : null));
  });
  bord.append(el('button', { class: 'bord-fuss', title: 'Der Lesestapel: Bücher auflegen, ordnen', onclick: () => lesestapelZeigen() }, buecher.length ? (buecher.length > zeigbar ? '+' + (buecher.length - zeigbar) + ' · ' : '') + 'Lesestapel' : 'Bücher auflegen'));
  dinge.append(el('div', { class: 'desk-ding-halter buecher' }, bord, el('i', { class: 'bordbrett' })));
  /* Heute vor einem Jahr: ein altes Blatt liegt auf dem Tisch */
  const altesBlatt = typeof heuteVorEinemJahr === 'function' ? heuteVorEinemJahr([...D.docs.values()]) : null;
  if (altesBlatt) dinge.append(baueAltesBlatt(altesBlatt));
  /* Das aufgeschlagene Buch: das zuletzt gelesene liegt offen da */
  if (buecher.length && e.offenesBuch) dinge.append(baueOffenesBuch(buecher[0], szene));

  /* Tasse: der Schreibtag */
  const tag = schreibtischTag();
  dinge.append(ding('tasse' + (tag.heute > 0 ? ' dampft' : ''), 'Die Tasse: ' + (tag.heute ? tag.heute + ' Wörter heute' : 'heute noch nichts') + (tag.serie > 1 ? ' · ' + tag.serie + ' Tage in Folge' : ''), el('div', { class: 'tasse-bild' }, el('i', { class: 'dampf d1' }), el('i', { class: 'dampf d2' }), el('i', { class: 'dampf d3' }), el('i', { class: 'henkel' }), el('span', { class: 'tasse-zahl' }, tag.heute ? (tag.heute >= 10000 ? Math.round(tag.heute / 1000) + 'k' : String(tag.heute)) : '')), () => {
    toast(tag.heute ? tag.heute + ' Wörter heute' + (tag.serie > 1 ? ' — der ' + tag.serie + '. Tag in Folge.' : '.') : 'Heute noch nichts. Die Tasse wartet.', 3600);
  }));
  const zweite = baueZweiteTasse(); if (zweite) dinge.append(zweite);

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

  /* Der Kalender: was in den Geschichten geschieht, mit Datum */
  if (typeof baueTischkalender === 'function') { try { dinge.append(baueTischkalender()); } catch (x) {} }

  /* Zitate auf der Platte: gefundene, geritzte oder beides */
  if (typeof tischzitateBauen === 'function') { try { tischzitateBauen(dinge, e, () => zeichne()); } catch (x) {} }

  /* Papierkorb, Schublade, Einrichten */
  dinge.append(el('button', { class: 'desk-korb', title: 'Der Papierkorb unterm Tisch', onclick: () => papierkorbAmTisch() }, el('i', { class: 'knuell k1' }), el('i', { class: 'knuell k2' }), el('i', { class: 'knuell k3' }), el('i', { class: 'korbrand' })));
  dinge.append(el('button', { class: 'desk-schublade', title: 'Die Schublade', onclick: () => schubladeOeffnen() }, el('i', { class: 'griffknauf' })));
  dinge.append(el('button', { class: 'rundknopf zart desk-einrichten', html: ik('feinheiten'), title: 'Schreibtisch einrichten', onclick: () => schreibtischEinrichten(() => zeichne()) }));

  szene._sig = schreibtischSignatur(); szene._maler = maler;
  haupt.append(szene);
  /* Auftritt: die Dinge kommen gestaffelt auf den Tisch — nur beim ersten Betreten in
     dieser Sitzung; danach steht der Tisch einfach da (weich eingeblendet). */
  if (erstesMal) $$('.desk-ding, .desk-ding-halter', dinge).forEach((d, i) => { d.style.setProperty('--n', String(i)); d.classList.add('tritt-auf'); });
  else szene.classList.add('weich');
  /* Parallaxe: der Blick wandert ein wenig mit dem Zeiger — das Fenster weiter
     hinten bewegt sich anders als der Tisch. */
  szene.addEventListener('pointermove', (ev) => {
    if (ev.pointerType === 'touch') return;
    const r = szene.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width * 2 - 1, py = (ev.clientY - r.top) / r.height * 2 - 1;
    maler.setze({ parallax: { x: Math.max(-1, Math.min(1, px)), y: Math.max(-1, Math.min(1, py)) } });
    dinge.style.setProperty('--px', (px * -4).toFixed(1) + 'px'); dinge.style.setProperty('--py', (py * -2).toFixed(1) + 'px');
  });
  maler.start();
  /* Ein Luftzug, wenn die Tür aufgeht: Papiere heben die Ecken, Flammen ducken sich */
  if (erstesMal) { szene.classList.add('luftzug'); setTimeout(() => szene.classList.remove('luftzug'), 1900); if (leuchter) setTimeout(() => leuchter.puste(.9), 250); sessionStorage.setItem('vani-desk-gesehen', '1'); }
  /* Ein eingespanntes Blatt liegt noch da */
  if (e.blattId && D.docs.get(e.blattId)) blattEinspannen(szene, e, e.blattId, false);
  /* Aufhören, sobald der Raum weg ist */
  const beobachter = new MutationObserver(() => { if (!szene.isConnected) { maler.stopp(); (szene._aufraeumen || []).forEach((f) => { try { f(); } catch (x) {} }); beobachter.disconnect(); } });
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
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Tageszeit vor dem Fenster'), el('div', { style: 'font-size:12.5px;color:var(--blass);margin:-4px 0 8px' }, 'Wie draußen: Sonne und Mond gehen mit der echten Uhr, Auf- und Untergang wandern mit dem Jahr.'),
      wahlgruppe([['echt', 'Wie draußen'], ['morgen', 'Morgen'], ['mittag', 'Mittag'], ['golden', 'Goldene Stunde'], ['abend', 'Abend'], ['nacht', 'Nacht'], ['zufall', 'Überraschung']], () => e.tageszeit, (v) => { e.tageszeit = v; })),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Jahreszeit im Garten'), wahlgruppe([['echt', 'Wie draußen'], ['fruehling', 'Frühling'], ['sommer', 'Sommer'], ['herbst', 'Herbst'], ['winter', 'Winter'], ['zufall', 'Überraschung']], () => e.jahreszeit, (v) => { e.jahreszeit = v; })),
    zeile('Lampe', 'Kein Deckenlicht. Niemals. Nur dieser Kegel — an der Schnur ziehen schaltet sie.', lampe),
    zeile('Leuchter', 'Sieben Flammen. Die Kerzen brennen über ' + LEUCHTER_STUNDEN + ' Schreibstunden wirklich herunter (' + Math.round((1 - leuchterStand(e.wachs)) * 100) + ' % übrig).', schalter(() => e.kerzen, (v) => { e.kerzen = v; })),
    zeile('Die Uhr tickt', 'Ein leises Ticken, zur vollen Stunde ein Glockenschlag.', schalter(() => e.uhrTickt, (v) => { e.uhrTickt = v; })),
    zeile('Fenster hört auf den Klang', 'Spielt Regen, regnet es vor dem Fenster; bei Gewitter wetterleuchtet es.', schalter(() => e.wetterFolgtKlang, (v) => { e.wetterFolgtKlang = v; })),
    /* Diese beiden Abschnitte legen sofort fest, statt nur vorzuschauen —
       deshalb wandert das Ergebnis auch in `alt`. Sonst nimmt das Schliessen
       des Kastens die Wahl wieder zurueck. */
    typeof tischblattEinstellung === 'function' ? tischblattEinstellung(e, () => { Object.assign(alt, e); if (danach) danach(); }) : null,
    typeof tischzitatEinstellung === 'function' ? tischzitatEinstellung(e, () => { Object.assign(alt, e); if (danach) danach(); }, () => zu()) : null,
    zeile('Die Feder kratzt', 'Ein leises Kratzen beim Tippen auf dem eingespannten Blatt.', schalter(() => e.federKratzt, (v) => { e.federKratzt = v; })),
    zeile('Aufgeschlagenes Buch', 'Das zuletzt gelesene Buch liegt offen auf dem Tisch; links und rechts tippen blättert.', schalter(() => e.offenesBuch, (v) => { e.offenesBuch = v; })),
    (e.kleckse && e.kleckse.length) ? zeile('Kleckse', e.kleckse.length + ' Tintenkleckse von der Feder — einer je Sitzung.', el('button', { class: 'knopf zart', onclick: () => { e.kleckse = []; D.einst.schreibtisch = { ...e }; speichereEinst(); toast('Die Platte ist gewischt.'); if (danach) danach(); } }, 'Wegwischen')) : null,
    zeile('Unordnung', 'Wie viel auf dem Tisch liegt und wie schief.', unordnung),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => { D.einst.schreibtisch = alt; if (danach) danach(); zu(); } }, 'Zurück'),
      el('button', { class: 'knopf voll', onclick: () => { behalten = true; D.einst.schreibtisch = { ...e }; speichereEinst(); zu(); if (danach) danach(); } }, 'So bleibt es')));
  const zu = zeigeDeck(kasten, () => { if (!behalten) { D.einst.schreibtisch = alt; if (danach) danach(); } });
}
/* Der Tisch bleibt stehen, solange seine Signatur stimmt. */
RENDER.schreibtisch.behalten = (haupt) => { const sz = haupt.querySelector('.desk-szene'); return !!(sz && sz._sig && sz._sig === schreibtischSignatur()); };
