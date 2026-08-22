/* ================================================================
   VANI — Der Schreibtisch.

   Kein Raum zum Einsortieren, sondern der Mittelpunkt: ein schwerer Tisch aus
   dunklem Holz vor einem hohen Fenster, dahinter fast völlige Nacht und ein
   verwilderter Garten; auf dem Tisch eine Lampe mit bernsteinfarbenem Kegel,
   ein siebenarmiger Leuchter, Tintenfass und Federn, offene Manuskripte,
   Bücherstapel, eine Tasse, die schon längst gespült gehörte, ein Glas mit
   einem Fundstück, ein Brief, Karteikarten, eine Lupe, ein Bleistiftstummel —
   und eine Schublade voller Dinge, die kein vernünftiger Mensch aufbewahren
   würde. Jedes Ding tut etwas. Nichts ist Dekoration: die Manuskripte sind die
   zuletzt bearbeiteten Texte, die Bücher der Lesestapel, die Tasse der
   Schreibtag, das Glas der Funke, der Brief eine Zeitkapsel an mich selbst.
   Kein Deckenlicht. Niemals.
   ================================================================ */

const SCHREIBTISCH_HOELZER = [['ebenholz', 'Ebenholz'], ['nuss', 'Nussbaum'], ['kirsche', 'Kirsche'], ['eiche', 'Alte Eiche']];

/* Einrichtung des Tisches — pur, mit Vorgaben. */
function saubererSchreibtisch(roh) {
  const q = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  return {
    holz: SCHREIBTISCH_HOELZER.some((h) => h[0] === q.holz) ? q.holz : 'nuss',
    lampe: begrenze(q.lampe, .25, 1, .8),
    kerzen: q.kerzen !== false,
    wetterFolgtKlang: q.wetterFolgtKlang !== false,
    unordnung: begrenze(q.unordnung, 0, 1, .7),
    verse: q.verse !== false
  };
}

/* Mondphase 0 … 1 (0 = Neumond, .5 = Vollmond), aus dem Datum. Pur. */
function mondphase(wann = Date.now()) {
  const bezug = Date.UTC(2000, 0, 6, 18, 14);      /* ein Neumond */
  const synodisch = 29.530588853 * 86400000;
  const t = ((wann - bezug) % synodisch + synodisch) % synodisch;
  return t / synodisch;
}

/* Brief an mich: offen, wenn das Öffnungsdatum erreicht ist. Pur. */
function briefIstOffen(brief, jetzt = Date.now()) {
  if (!brief) return false;
  const wann = Number(brief.oeffnen) || 0;
  return wann <= jetzt;
}

/* Kurze eigene Zeilen für die „spontanen Verse" auf der Platte — aus den
   kuratierten Funden, nie aus allem. */
function schreibtischVerse(max = 3) {
  if (typeof wiederFunde !== 'function') return [];
  const funde = wiederFunde();
  const aus = [];
  for (const f of funde) {
    const zeile = (f.auszug || '').split('\n').map((z) => z.trim()).find((z) => z.length >= 12 && z.length <= 64);
    if (zeile && !aus.includes(zeile)) aus.push(zeile);
    if (aus.length >= max) break;
  }
  return aus;
}

/* ----- Die Dinge auf dem Tisch ----- */

function schreibtischLetzteTexte(n = 3) {
  return [...D.docs.values()]
    .filter((d) => ['szene', 'blatt', 'seite'].includes(d.typ) && (d.text || '').trim().length > 0)
    .sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0)).slice(0, n);
}

async function schreibtischNeuesBlatt() {
  const b = blattAusText('', '');
  oeffneSchreibraum(b.id);
}

/* Brief an mich — eine Zeitkapsel. */
async function briefSchreiben() {
  const text = el('textarea', { rows: 7, placeholder: 'An die, die das in ein paar Wochen liest …', maxlength: '20000' });
  const wahl = el('select', {},
    el('option', { value: '7' }, 'in einer Woche'), el('option', { value: '30' }, 'in einem Monat'), el('option', { value: '90' }, 'in drei Monaten'),
    el('option', { value: '180' }, 'in einem halben Jahr'), el('option', { value: '365' }, 'in einem Jahr'));
  wahl.value = '30';
  let fertig = false;
  return new Promise((res) => {
    const kasten = el('div', { class: 'modal brief-kasten' },
      el('h2', {}, 'Ein Brief an mich'),
      el('div', { class: 'stickerblock-hinweis' }, 'Er wird versiegelt und liegt auf dem Tisch, bis das Datum kommt. Dann erst lässt er sich öffnen.'),
      text,
      el('label', { class: 'brief-wann' }, 'Öffnen ', wahl),
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: () => {
          const t = text.value.trim(); if (!t) { toast('Ein leerer Brief?'); return; }
          fertig = true;
          const brief = neuDoc('brief', { text: t, oeffnen: Date.now() + Number(wahl.value) * 86400000, versiegelt: true });
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
  if (wahl === '_neu') { await briefSchreiben(); return; }
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
      el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}

/* Die Schublade: Dinge, die kein vernünftiger Mensch aufbewahren würde. */
async function schubladeOeffnen() {
  const funde = typeof wiederFunde === 'function' ? wiederFunde().slice(0, 3) : [];
  const alte = vomTyp('schnipsel').filter((s) => Date.now() - s.angelegt > 14 * 86400000 && (s.text || '').trim());
  const metall = alte.length ? alte[Math.floor(Math.random() * alte.length)] : null;
  const wahl = await menue([
    ...funde.map((f, i) => ({ text: '„' + (f.auszug.split('\n')[0] || '').slice(0, 60) + (f.auszug.length > 60 ? '…' : '') + '" — ' + f.art.toLowerCase(), icon: 'fund', wert: 'fund:' + f.doc.id })),
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
  if (wahl === 'marken') { location.hash = '#/feinheiten'; return; }
  if (wahl === 'schluessel') { location.hash = '#/feinheiten'; return; }
  if (wahl === 'metall' && metall) {
    await zeigeAnkunft('Ein Stück Metall unbekannter Herkunft', ['„' + (metall.text || '').slice(0, 300) + '"'], 'Schnipsel vom ' + fmtDatum(metall.angelegt) + ' — vielleicht bedeutungslos, vielleicht der Schlüssel zu einem ganzen Roman.', () => { location.hash = '#/schnipsel'; });
  }
}

/* Das Glas mit dem Fundstück: der Funke des Tages. */
function schreibtischFunke() {
  const saat = tagKey();
  let h = 0; for (const c of saat) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const arten = ['frage', 'form', 'satz', 'figur', 'wendung', 'kombi'];
  const art = arten[h % arten.length];
  return art === 'kombi' ? neuerFunke(true) : neuerFunke(false, art);
}

/* Die Tasse: der Schreibtag. */
function schreibtischTag() {
  const heute = D.stats.tage[tagKey()] || 0;
  let serie = 0;
  for (let i = 0; i < 400; i++) {
    const k = tagKey(Date.now() - i * 86400000);
    if ((D.stats.tage[k] || 0) > 0) serie++; else if (i > 0) break;
  }
  return { heute, serie };
}

/* Öffnet ein Dokument an seinem Ort. */
function oeffneDokument(d) {
  if (!d) return;
  if (d.typ === 'szene' || d.typ === 'blatt') oeffneSchreibraum(d.id);
  else if (d.typ === 'seite') { sessionStorage.setItem('zielSeite', d.id); location.hash = '#/heft/' + d.parent; }
  else if (d.typ === 'schnipsel') location.hash = '#/schnipsel';
  else if (d.typ === 'faden') { if (typeof merkeFadenZiel === 'function') merkeFadenZiel(d.id); location.hash = '#/faden'; }
  else if (d.typ === 'blase') location.hash = '#/brett/' + d.parent;
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

/* ----- Der siebenarmige Leuchter: sieben kleine Flammen auf Canvas ----- */
function baueLeuchter(einst) {
  const W = 150, H = 120;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = el('canvas', { class: 'desk-leuchter-flammen', width: String(W * dpr), height: String(H * dpr) });
  c.style.width = W + 'px'; c.style.height = H + 'px';
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const arme = [[14, 40], [35, 28], [56, 18], [75, 10], [94, 18], [115, 28], [136, 40]];
  let phase = Math.random() * 10, laeuft = true, zug = 0;
  const zeichne_ = (t) => {
    if (!c.isConnected) { laeuft = false; return; }
    phase += .016;
    ctx.clearRect(0, 0, W, H);
    arme.forEach(([x, y], i) => {
      const fl = 1 + .12 * Math.sin(phase * 8 + i * 1.7) + .06 * Math.sin(phase * 17 + i);
      const neig = Math.sin(phase * .9 + i) * .08 + zug * (i % 2 ? -1 : 1) * .2;
      const fh = 15 * fl, fw = 4.6;
      const by = y + 52;
      /* Kerzenkörper */
      ctx.fillStyle = '#efe0bd'; ctx.fillRect(x - 3, by, 6, 22 + (i === 3 ? 4 : 0));
      /* Schein */
      kerzeSchein(ctx, x, by - fh * .5, 22, 26, [[0, 'rgba(255,170,70,' + (.25 * fl).toFixed(3) + ')'], [1, 'rgba(255,140,50,0)']]);
      /* Flamme */
      ctx.beginPath();
      const sx = x + neig * 14;
      ctx.moveTo(x - fw * .2, by);
      for (let k = 1; k <= 10; k++) { const u = k / 10; ctx.lineTo(sx * u + x * (1 - u) - fw * kerzeFlammenBreite(u) * .55, by - fh * u); }
      for (let k = 10; k >= 1; k--) { const u = k / 10; ctx.lineTo(sx * u + x * (1 - u) + fw * kerzeFlammenBreite(u) * .55, by - fh * u); }
      ctx.closePath();
      const g = ctx.createLinearGradient(0, by, 0, by - fh);
      g.addColorStop(0, 'rgba(255,150,40,.9)'); g.addColorStop(.6, 'rgba(255,200,100,.95)'); g.addColorStop(1, 'rgba(255,245,210,.3)');
      ctx.fillStyle = g; ctx.fill();
      ctx.fillStyle = 'rgba(255,252,230,.85)'; ctx.beginPath(); ctx.ellipse(x, by - fh * .3, 1.4, fh * .25, 0, 0, Math.PI * 2); ctx.fill();
    });
    zug *= .94;
    if (laeuft) requestAnimationFrame(zeichne_);
  };
  requestAnimationFrame(zeichne_);
  return { element: c, puste: (s = .5) => { zug += s; } };
}

/* Sterne hinterm Fenster: einmal gewürfelt, leicht flimmernd. */
function baueSternenhimmel() {
  const c = el('canvas', { class: 'desk-sterne' });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const zuf = kerzeZufall(tagKey().length * 131 + 7);
  const sterne = Array.from({ length: 70 }, () => ({ x: zuf(), y: zuf() * .7, r: .4 + zuf() * 1.2, ph: zuf() * 6, tw: .4 + zuf() }));
  let laeuft = true, t = 0;
  const mond = mondphase();
  const male = () => {
    if (!c.isConnected) { laeuft = false; return; }
    const cr = c.getBoundingClientRect();
    if (c.width !== Math.round(cr.width * dpr)) { c.width = Math.round(cr.width * dpr); c.height = Math.round(cr.height * dpr); }
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = cr.width, H = cr.height; t += .02;
    ctx.clearRect(0, 0, W, H);
    for (const s of sterne) {
      const a = .35 + .45 * Math.abs(Math.sin(t * s.tw + s.ph));
      ctx.fillStyle = 'rgba(255,248,220,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill();
    }
    /* Mond mit echter Phase: eine helle Scheibe, vom Schatten angeschnitten */
    const mx = W * .74, my = H * .18, mr = Math.min(22, W * .04);
    ctx.save();
    kerzeSchein(ctx, mx, my, mr * 4, mr * 4, [[0, 'rgba(255,245,215,.18)'], [1, 'rgba(255,245,215,0)']]);
    ctx.fillStyle = '#f4ecd6'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    /* Schatten: Terminator als Ellipse, Seite je nach Phase */
    const p = mond; const hell = 1 - Math.abs(p - .5) * 2;   /* 0 neu, 1 voll */
    ctx.fillStyle = '#1a1c26';
    ctx.beginPath();
    if (p < .5) { ctx.arc(mx, my, mr, Math.PI / 2, -Math.PI / 2, false); ctx.ellipse(mx, my, mr * Math.abs(1 - 2 * hell), mr, 0, -Math.PI / 2, Math.PI / 2, hell > .5); }
    else { ctx.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2, false); ctx.ellipse(mx, my, mr * Math.abs(1 - 2 * hell), mr, 0, Math.PI / 2, -Math.PI / 2, hell > .5); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if (laeuft) setTimeout(() => requestAnimationFrame(male), 120);
  };
  requestAnimationFrame(male);
  return c;
}

/* ----- Der Raum ----- */
RENDER.schreibtisch = function (haupt) {
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  const wetter = e.wetterFolgtKlang ? schreibtischWetter() : 'still';
  const szene = el('div', { class: 'desk-szene holz-' + e.holz + ' wetter-' + wetter + (e.kerzen ? ' kerzen-an' : ''), style: '--lampe:' + e.lampe + ';--unordnung:' + e.unordnung });

  /* Fenster */
  const fenster = el('div', { class: 'desk-fenster' },
    el('div', { class: 'desk-nacht' }, baueSternenhimmel()),
    el('div', { class: 'desk-garten' }, el('i', { class: 'baum b1' }), el('i', { class: 'baum b2' }), el('i', { class: 'busch s1' }), el('i', { class: 'busch s2' }), el('i', { class: 'busch s3' }), el('i', { class: 'gras' })),
    el('div', { class: 'desk-regen' }), el('div', { class: 'desk-nebel' }),
    el('div', { class: 'desk-rahmen' }, el('i', { class: 'sprosse v' }), el('i', { class: 'sprosse h' })),
    el('div', { class: 'desk-ranken' }),
    el('button', { class: 'desk-fensterknopf', title: 'Der Nachtgarten: Grillen und Wind (Klang)', onclick: () => nachtgartenKlang() }, el('span', { html: ik('klang') })));

  /* Tischplatte mit Dingen */
  const platte = el('div', { class: 'desk-platte' }, el('div', { class: 'desk-holz' }), el('div', { class: 'desk-flecken' }), el('div', { class: 'desk-lichtkegel' }));
  const ding = (klasse, titel, inhalt, onclick, stil) => {
    const b = el('button', { class: 'desk-ding ' + klasse, title: titel, 'aria-label': titel, onclick, style: stil || '' }, inhalt);
    return b;
  };

  /* Lampe */
  platte.append(ding('lampe', 'Die Lampe: heller oder dunkler', el('i', { class: 'schirm' }), () => {
    const stufen = [.35, .55, .8, 1];
    const i = stufen.findIndex((s) => Math.abs(s - e.lampe) < .01);
    e.lampe = stufen[(i + 1) % stufen.length];
    D.einst.schreibtisch = { ...e }; speichereEinst();
    szene.style.setProperty('--lampe', e.lampe);
    toast(e.lampe >= 1 ? 'Hell.' : e.lampe >= .8 ? 'Warm.' : e.lampe >= .55 ? 'Gedämpft.' : 'Fast nur noch die Kerzen.');
  }));

  /* Leuchter */
  let leuchter = null;
  if (e.kerzen) {
    leuchter = baueLeuchter(e);
    platte.append(ding('leuchter', 'Der Leuchter: eine Kerze anzünden (Schreibzeit)', el('div', { class: 'leuchter-bild' }, leuchter.element, el('i', { class: 'leuchter-fuss' })), async () => {
      const dauer = await menue([
        { text: 'Eine kleine Kerze — 10 Minuten', wert: 10 }, { text: 'Eine mittlere — 20 Minuten', wert: 20 }, { text: 'Eine lange — 45 Minuten', wert: 45 }
      ], 'Der Leuchter: Schreibzeit anzünden');
      if (!dauer) return;
      const b = blattAusText('', '');
      oeffneSchreibraum(b.id);
      setTimeout(() => starteSprint(dauer), 400);
    }));
  }

  /* Manuskripte: die letzten Texte */
  const letzte = schreibtischLetzteTexte(3);
  letzte.forEach((d, i) => {
    const text = (d.text || '').trim().slice(0, 420);
    platte.append(ding('manuskript m' + (i + 1), 'Weiterschreiben: ' + (d.titel || text.slice(0, 30)), el('div', { class: 'manuskript-papier' }, el('b', {}, d.titel || (d.typ === 'seite' ? 'Heftseite' : d.typ === 'szene' ? 'Szene' : 'Blatt')), el('span', {}, text)), () => oeffneDokument(d), '--dreh:' + ((i * 7) % 9 - 4) + 'deg'));
  });
  if (!letzte.length) platte.append(ding('manuskript m1 leer', 'Ein leeres Blatt — anfangen', el('div', { class: 'manuskript-papier' }, el('b', {}, 'Noch nichts'), el('span', {}, 'Ein leeres Blatt. Das beste Versprechen, das es gibt.')), () => schreibtischNeuesBlatt()));

  /* Tintenfass & Feder */
  platte.append(ding('tinte', 'Tintenfass und Feder: ein neues Blatt', el('div', { class: 'tinte-bild' }, el('i', { class: 'fass' }), el('i', { class: 'feder f1' }), el('i', { class: 'feder f2' })), () => schreibtischNeuesBlatt()));

  /* Bücherstapel (Lesestapel) */
  const buecher = typeof lesestapelBuecher === 'function' ? lesestapelBuecher() : [];
  const stapel = el('div', { class: 'buecher-stapel' });
  buecher.slice(0, 6).forEach((b, i) => {
    const img = el('img', { alt: b.titel || 'Buch', draggable: 'false' });
    if (b.bild) setzeBild(img, b.bild);
    const buch = el('button', { class: 'stapel-buch' + (b.bild ? '' : ' ohne-cover'), title: (b.titel || 'Buch') + (b.seiten ? ' · Seite ' + (b.seite || 1) + ' von ' + b.seiten : ''), style: '--i:' + i + ';--dreh:' + ((i * 11) % 7 - 3) + 'deg', onclick: () => buchOeffnen(b) }, img, b.bild ? null : el('span', {}, b.titel || 'Buch'));
    stapel.append(buch);
  });
  stapel.append(el('button', { class: 'stapel-fuss', title: 'Der Lesestapel: Bücher auflegen, ordnen', onclick: () => lesestapelZeigen() }, buecher.length ? (buecher.length > 6 ? '+' + (buecher.length - 6) + ' · ' : '') + 'Lesestapel' : 'Bücher auflegen'));
  platte.append(el('div', { class: 'desk-ding-halter buecher' }, stapel));

  /* Tasse: der Schreibtag */
  const tag = schreibtischTag();
  platte.append(ding('tasse' + (tag.heute > 0 ? ' dampft' : ''), 'Die Tasse: ' + (tag.heute ? tag.heute + ' Wörter heute' : 'heute noch nichts') + (tag.serie > 1 ? ' · ' + tag.serie + ' Tage in Folge' : ''), el('div', { class: 'tasse-bild' }, el('i', { class: 'dampf d1' }), el('i', { class: 'dampf d2' }), el('i', { class: 'henkel' }), el('span', { class: 'tasse-zahl' }, tag.heute ? String(tag.heute) : '')), () => {
    toast(tag.heute ? tag.heute + ' Wörter heute' + (tag.serie > 1 ? ' — der ' + tag.serie + '. Tag in Folge.' : '.') : 'Heute noch nichts. Die Tasse wartet.', 3600);
  }));

  /* Glas mit Fundstück: der Funke */
  platte.append(ding('glas', 'Das Glas mit dem Fundstück: der Funke des Tages', el('div', { class: 'glas-bild' }, el('i', { class: 'glaskoerper' }), el('i', { class: 'fundstueck' })), async () => {
    const f = schreibtischFunke();
    const wahl = await menue([{ text: 'Damit schreiben', icon: 'stift', wert: 'schreiben' }, { text: 'Anderen Funken', icon: 'wuerfel', wert: 'neu' }], f);
    if (wahl === 'schreiben') { const b = blattAusText('', f + '\n\n'); oeffneSchreibraum(b.id); }
    else if (wahl === 'neu') { const g = neuerFunke(Math.random() < .4); const w2 = await menue([{ text: 'Damit schreiben', icon: 'stift', wert: 'schreiben' }], g); if (w2) { const b = blattAusText('', g + '\n\n'); oeffneSchreibraum(b.id); } }
  }));

  /* Brief */
  const briefe = vomTyp('brief');
  const offenZumLesen = briefe.some((b) => briefIstOffen(b) && b.versiegelt);
  platte.append(ding('brief' + (offenZumLesen ? ' bereit' : '') + (briefe.length ? '' : ' leer'), offenZumLesen ? 'Ein Brief an dich darf geöffnet werden' : 'Ein Brief an mich (Zeitkapsel)', el('div', { class: 'brief-bild' }, el('i', { class: 'siegel' })), () => briefeZeigen()));

  /* Karteikarten */
  platte.append(ding('karten', 'Karteikarten: eine Wortkiste abfragen', el('div', { class: 'karten-bild' }, el('i'), el('i'), el('i')), async () => {
    const kisten = typeof wortkisten === 'function' ? wortkisten() : [];
    const wahl = await menue([{ text: 'Alle Wörter', icon: 'woerter', wert: 'alle' }, ...kisten.map((k) => ({ text: k.titel || 'Wortkiste', icon: 'woerter', wert: k.id }))], 'Welche Kiste abfragen?');
    if (wahl) wortkisteAbfragen(wahl, wahl === 'alle' ? 'Alle Wörter' : (D.docs.get(wahl) || {}).titel);
  }));

  /* Lupe & Bleistiftstummel */
  platte.append(ding('lupe', 'Die Lupe: suchen', el('div', { class: 'lupe-bild' }, el('i', { class: 'linse' }), el('i', { class: 'griff' })), () => { if (typeof oeffneSuche === 'function') oeffneSuche(); else location.hash = '#/suche'; }));
  platte.append(ding('stummel', 'Der Bleistiftstummel: schnell einen Schnipsel', el('div', { class: 'stummel-bild' }), async () => {
    const t = await eingabe({ titel: 'Schnell notiert', platzhalter: 'ein Satz, ein Wort, ein Gedanke …', mehrzeilig: true, ok: 'Ablegen' });
    if (t) { neuDoc('schnipsel', { text: t }); toast('Liegt in den Schnipseln.'); }
  }));

  /* Notizbuch mit Zetteln: das letzte Heft */
  const letztesHeft = vomTyp('heft').filter((h) => !h.archiv).sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0))[0];
  if (letztesHeft) platte.append(ding('notizbuch', 'Das Notizbuch mit zu vielen Zetteln: ' + letztesHeft.titel, el('div', { class: 'notizbuch-bild', style: heftDeckelDaten(letztesHeft).style }, el('i', { class: 'zettelchen z1' }), el('i', { class: 'zettelchen z2' }), el('i', { class: 'zettelchen z3' })), () => { location.hash = '#/heft/' + letztesHeft.id; }));

  /* Verse auf der Platte */
  if (e.verse) {
    schreibtischVerse(3).forEach((v, i) => platte.append(el('div', { class: 'desk-vers v' + (i + 1) }, v)));
  }
  /* Schublade */
  platte.append(el('button', { class: 'desk-schublade', title: 'Die Schublade', onclick: () => schubladeOeffnen() }, el('i', { class: 'griffknauf' })));

  /* Einrichten */
  const einrichten = el('button', { class: 'rundknopf zart desk-einrichten', html: ik('feinheiten'), title: 'Schreibtisch einrichten', onclick: () => schreibtischEinrichten(() => zeichne()) });

  szene.append(fenster, platte, einrichten);
  haupt.append(szene);

  /* Tippen irgendwo im Raum: die Flammen spüren es */
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
  const unordnung = el('input', { type: 'range', min: '0', max: '1', step: '.1', value: String(e.unordnung) });
  unordnung.addEventListener('change', () => { e.unordnung = Number(unordnung.value); D.einst.schreibtisch = { ...e }; if (danach) danach(); });
  let behalten = false;
  const zeile = (name, unter, inhalt) => el('div', { class: 'einstellgruppe einstellzeile' }, el('span', { class: 'ename' }, name, unter ? el('div', { style: 'font-size:12.5px;color:var(--blass)' }, unter) : null), inhalt);
  const kasten = el('div', { class: 'modal tisch-einrichten' },
    el('h2', {}, 'Den Schreibtisch einrichten'),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'Holz'), wahlgruppe(SCHREIBTISCH_HOELZER, () => e.holz, (v) => { e.holz = v; })),
    zeile('Lampe', 'Kein Deckenlicht. Niemals. Nur dieser Kegel.', lampe),
    zeile('Leuchter', 'Sieben Flammen — weniger wegen des Lichts als wegen der Gewissheit, dass wenigstens eine Sache sichtbar Zeit verbraucht.', schalter(() => e.kerzen, (v) => { e.kerzen = v; })),
    zeile('Fenster hört auf den Klang', 'Spielt Regen, regnet es vor dem Fenster; spielen Grillen, raschelt der Garten.', schalter(() => e.wetterFolgtKlang, (v) => { e.wetterFolgtKlang = v; })),
    zeile('Eigene Zeilen auf der Platte', 'Kurze Sätze aus meinen Funden, wie hingekritzelt.', schalter(() => e.verse, (v) => { e.verse = v; })),
    zeile('Unordnung', 'Wie viel auf dem Tisch liegt und wie schief.', unordnung),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => { D.einst.schreibtisch = alt; if (danach) danach(); zu(); } }, 'Zurück'),
      el('button', { class: 'knopf voll', onclick: () => { behalten = true; D.einst.schreibtisch = { ...e }; speichereEinst(); zu(); if (danach) danach(); } }, 'So bleibt es')));
  const zu = zeigeDeck(kasten, () => { if (!behalten) { D.einst.schreibtisch = alt; if (danach) danach(); } });
}
