/* ===================== 54c — DER SCHREIBTISCH LEBT =====================
   Der Tisch altert mit den Wörtern, die Feder tropft, der Leuchter zählt die
   Woche, Teelichter auf der Fensterbank zeigen das Tagesziel, ein Wetterglas
   zeigt den Klang, ein Buch liegt aufgeschlagen, ein Blatt lässt sich
   einspannen — und gegenüber dampft manchmal eine zweite Tasse.
   Die reinen Helfer stehen oben, die Bühnenstücke darunter. */

/* Wie alt der Tisch ist: aus allen je geschriebenen Wörtern. Pur. */
function schreibtischAlter(tage) {
  const worte = Object.values(tage || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  return { worte, ringe: Math.min(6, 1 + Math.floor(worte / 100000)), abnutzung: Math.min(1, worte / 250000) };
}

/* Die Woche am Leuchter: Montag bis Sonntag. Vergangene Tage mit Wörtern
   brennen, heute brennt höher, die Zukunft wartet mit kleiner Flamme,
   vergangene Tage ohne ein Wort sind erloschen. Pur. */
function leuchterWoche(tage, jetzt = Date.now()) {
  const d = new Date(jetzt), wt = (d.getDay() + 6) % 7;
  const montag = new Date(d); montag.setDate(d.getDate() - wt); montag.setHours(0, 0, 0, 0);
  return [...Array(7)].map((_, i) => {
    const t = new Date(montag); t.setDate(montag.getDate() + i);
    const k = tagKey(t), worte = Number((tage || {})[k]) || 0;
    return { tag: k, worte, heute: i === wt, vorbei: i < wt, zukunft: i > wt, brennt: i >= wt || worte > 0 };
  });
}
/* Teelichter auf der Fensterbank: eines je Tag, es brennt, wenn das Tagesziel stand. Pur. */
function teelichterWoche(tage, ziel, jetzt = Date.now()) {
  if (!(Number(ziel) > 0)) return [];
  return leuchterWoche(tage, jetzt).map((t) => ({ ...t, erreicht: t.worte >= Number(ziel) }));
}
/* Lese-Serie: Tage in Folge mit gelesenen Seiten, über alle Bücher. Pur. */
function leseSerie(buecher, jetzt = Date.now()) {
  const tage = {};
  for (const b of buecher || []) for (const [k, n] of Object.entries((b && b.statistik) || {})) tage[k] = (tage[k] || 0) + (Number(n) || 0);
  const heute = tage[tagKey(jetzt)] || 0;
  let serie = 0;
  for (let i = 0; i < 400; i++) { const k = tagKey(jetzt - i * 86400000); if ((tage[k] || 0) > 0) serie++; else if (i > 0) break; }
  return { heute, serie, tage };
}
/* Kleckse auf der Platte: x/y als Anteile, r in Pixeln, s als Saat. Pur. */
const KLECKSE_MAX = 40;
function saubereKleckse(liste) {
  return (Array.isArray(liste) ? liste : []).filter((k) => k && typeof k === 'object').slice(-KLECKSE_MAX)
    .map((k) => ({ x: begrenze(k.x, 0, 1, .5), y: begrenze(k.y, 0, 1, .5), r: begrenze(k.r, 1, 9, 3), s: Math.round(begrenze(k.s, 0, 1e9, 0)) }));
}
/* Die Feder tropft: nach einer Sitzung ein neuer Klecks nahe der Schreibstelle. */
function schreibtischFederTropft(x, y) {
  const e = saubererSchreibtisch(D.einst.schreibtisch);
  e.kleckse = saubereKleckse([...(e.kleckse || []), { x: begrenze(x, .02, .98, .5), y: begrenze(y, .05, .95, .5), r: 1.5 + Math.random() * 4, s: Math.floor(Math.random() * 1e6) }]);
  D.einst.schreibtisch = e; speichereEinst();
  return e.kleckse[e.kleckse.length - 1];
}

/* ----- Klang: Federkratzen beim Tippen, das Klangbild des Tisches ----- */
function federKratzen() {
  try {
    const ctx = typeof audioCtxHolen === 'function' ? audioCtxHolen() : (window.__vaniKlick || (window.__vaniKlick = new (window.AudioContext || window.webkitAudioContext)()));
    if (!ctx) return;
    const dauer = .045 + Math.random() * .05, n = Math.floor(ctx.sampleRate * dauer);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) { const u = i / n; d[i] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * (1 - u * .4); }
    const q = ctx.createBufferSource(); q.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200 + Math.random() * 1800; f.Q.value = 1.1;
    const g = ctx.createGain(); g.gain.value = .04 + Math.random() * .03;
    q.connect(f); f.connect(g); g.connect(ctx.destination); q.start();
  } catch (e) {}
}
async function schreibtischKlangbild() {
  if (typeof ambienceMischungAnwenden !== 'function') { location.hash = '#/klang'; return; }
  const m = { ...(D.einst.ambience || {}) };
  const an = (m.uhr || 0) > 0 && (m.wind || 0) > 0;
  if (an) { for (const id of ['uhr', 'wind', 'kamin']) delete m[id]; toast('Der Tisch ist still.'); }
  else { m.uhr = .22; m.wind = .16; m.kamin = .1; toast('Schreibtisch bei Nacht: die Uhr, ein ferner Wind, Glut im Ofen.', 3600); }
  try { await audioFreigeben(); await ambienceMischungAnwenden(m); } catch (e) {}
  zeichne();
}
/* Was gerade klingt, als kurzer Name. */
function schreibtischKlangName() {
  const m = (D.einst && D.einst.ambience) || {};
  const ids = Object.keys(m).filter((id) => m[id] > 0).sort((a, b) => m[b] - m[a]);
  if (!ids.length) return '';
  const namen = ids.slice(0, 2).map((id) => { const a = typeof ambienceFinde === 'function' ? ambienceFinde(id) : null; return a ? a.name : id; });
  return namen.join(' · ') + (ids.length > 2 ? ' …' : '');
}

/* ----- Bühnenstücke ----- */
/* Das Wetterglas auf der Fensterbank: die Flüssigkeit steht hoch und leuchtet, wenn Klang spielt. */
function baueWetterglas() {
  const name = schreibtischKlangName();
  return el('button', { class: 'desk-wetterglas' + (name ? ' spielt' : ''), title: name ? 'Das Wetterglas: gerade spielt ' + name : 'Das Wetterglas: still. Ein Tipp öffnet den Klangraum', onclick: async () => {
      const w = await menue([{ text: 'Schreibtisch bei Nacht', icon: 'klang', wert: 'tisch' }, { text: 'Der Nachtgarten: Grillen und Wind', icon: 'klang', wert: 'garten' }, { text: 'Den Klangraum öffnen', icon: 'klang', wert: 'raum' }], name ? 'Gerade spielt ' + name : 'Das Wetterglas ist still');
      if (w === 'tisch') schreibtischKlangbild(); else if (w === 'garten') nachtgartenKlang(); else if (w === 'raum') location.hash = '#/klang';
    } },
    el('i', { class: 'wg-kugel' }), el('i', { class: 'wg-fluessig' }), el('i', { class: 'wg-hals' }), el('i', { class: 'wg-fuss' }),
    el('span', { class: 'wg-text' }, name ? name.split(' · ')[0] : ''));
}
/* Teelichter auf der Fensterbank: die Woche des Tagesziels. */
function baueTeelichter() {
  const liste = teelichterWoche(D.stats.tage, D.einst.tagesziel);
  if (!liste.length) return null;
  const namen = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const reihe = el('button', { class: 'desk-teelichter', title: 'Die Woche auf der Fensterbank: ein Teelicht je Tag — es brennt, wenn das Tagesziel (' + D.einst.tagesziel + ' Wörter) stand', onclick: () => { location.hash = '#/feinheiten'; } });
  liste.forEach((t, i) => reihe.append(el('i', { class: 'teelicht' + (t.erreicht ? ' brennt' : '') + (t.heute ? ' heute' : '') + (t.zukunft ? ' kommt' : ''), title: namen[i] + (t.erreicht ? ' · Ziel erreicht' : t.zukunft ? '' : ' · ' + t.worte + ' Wörter'), style: '--i:' + i }, el('b', {}, namen[i]))));
  return reihe;
}
/* Die zweite Tasse: gegenüber schreibt gerade jemand (Sync hat eben etwas gebracht). */
function baueZweiteTasse() {
  if (typeof syncFremdAktiv !== 'function' || !syncFremdAktiv()) return null;
  return el('button', { class: 'desk-ding tasse zweite dampft', title: 'Die zweite Tasse: gegenüber schreibt gerade jemand', onclick: () => { toast('Drüben dampft es — vor wenigen Minuten kam etwas an. Der Faden wartet.', 3600); } },
    el('div', { class: 'tasse-bild' }, el('i', { class: 'dampf d1' }), el('i', { class: 'dampf d2' }), el('i', { class: 'dampf d3' }), el('i', { class: 'henkel' })));
}

/* Das aufgeschlagene Buch: die Doppelseite des zuletzt gelesenen Buches liegt
   auf dem Tisch; links/rechts tippen blättert, die Mitte schlägt den Leser auf. */
function baueOffenesBuch(b, szene) {
  const halter = el('div', { class: 'desk-ding-halter offenbuch' + (b.art === 'epub' ? ' epub' : ''), title: (b.titel || 'Buch') + (b.art === 'epub' ? '' : ' · Seite ' + (b.seite || 1)) });
  const links = el('canvas', { class: 'ob-seite links' }), rechts = el('canvas', { class: 'ob-seite rechts' });
  const buch = el('div', { class: 'ob-buch' }, el('i', { class: 'ob-ruecken' }),
    el('div', { class: 'ob-blatt links' }, links), el('div', { class: 'ob-blatt rechts' }, rechts), el('i', { class: 'ob-band' }));
  const titel = el('button', { class: 'ob-titel', onclick: () => buchOeffnen(b) }, (b.titel || 'Buch').slice(0, 40));
  halter.append(buch, titel);
  let seite = Math.max(1, b.seite || 1), dok = null;
  const cache = new Map();
  async function maleSeite(c, n) {
    if (!dok || n < 1 || n > dok.numPages) { c.getContext('2d').clearRect(0, 0, c.width, c.height); c.classList.add('leer'); return; }
    c.classList.remove('leer');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let bild = cache.get(n);
    if (!bild) {
      const s = await dok.getPage(n);
      const vp0 = s.getViewport({ scale: 1 });
      const vp = s.getViewport({ scale: 104 * dpr / vp0.width });
      bild = document.createElement('canvas'); bild.width = Math.round(vp.width); bild.height = Math.round(vp.height);
      await s.render({ canvasContext: bild.getContext('2d'), viewport: vp }).promise;
      if (cache.size > 8) cache.delete(cache.keys().next().value);
      cache.set(n, bild);
    }
    c.width = bild.width; c.height = bild.height; c.style.width = Math.round(bild.width / dpr) + 'px'; c.style.height = Math.round(bild.height / dpr) + 'px';
    c.getContext('2d').drawImage(bild, 0, 0);
  }
  async function male() {
    if (!dok) return;
    const l = seite % 2 === 0 ? seite : seite - 1;
    await Promise.all([maleSeite(links, l), maleSeite(rechts, l + 1)]);
    halter.title = (b.titel || 'Buch') + ' · Seite ' + seite + ' von ' + dok.numPages;
  }
  function blaettere(r) {
    if (!dok) { buchOeffnen(b); return; }
    const ziel = Math.max(1, Math.min(dok.numPages, seite + r * 2));
    if (ziel === seite) { toast(r > 0 ? 'Das war die letzte Seite.' : 'Das ist der Anfang.'); return; }
    seite = ziel; b.seite = seite; b.zuletzt = Date.now();
    if (typeof buchSeiteGelesen === 'function') buchSeiteGelesen(b); else speichereStill(b);
    buch.classList.remove('blatt-vor', 'blatt-zurueck'); void buch.offsetWidth; buch.classList.add(r > 0 ? 'blatt-vor' : 'blatt-zurueck');
    male();
  }
  buch.addEventListener('click', (ev) => {
    const r = buch.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width;
    if (x < .32) blaettere(-1); else if (x > .68) blaettere(1); else buchOeffnen(b);
  });
  if (b.art === 'epub') { halter.classList.add('zu'); if (b.bild) { const img = el('img', { alt: '', draggable: 'false' }); setzeBild(img, b.bild); buch.append(img); } }
  else {
    /* Erst aufschlagen, wenn der Raum steht — der Tisch soll sofort da sein */
    setTimeout(async () => {
      if (!halter.isConnected) return;
      try {
        const pdfjs = await pdfjsLaden();
        const blob = await dbGet('media', b.datei);
        if (!blob || !halter.isConnected) return;
        dok = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
        if (!halter.isConnected) { dok.destroy(); dok = null; return; }
        await male();
        halter.classList.add('offen');
      } catch (e) { halter.classList.add('stumm'); }
    }, 900);
    if (szene) (szene._aufraeumen = szene._aufraeumen || []).push(() => { try { if (dok) dok.destroy(); } catch (e) {} dok = null; });
  }
  return halter;
}

/* „Blatt einspannen": ein Blatt liegt wirklich auf dem Tisch und wird dort
   getippt. Gespeichert wird wie überall (entprellt, beim Weglegen sofort);
   die Wörter zählen fürs Feuer; am Ende tropft die Feder. */
function blattEinspannen(szene, e, blattId, fokus = true) {
  if (!szene || szene.querySelector('.desk-blatt')) return;
  let doc = blattId ? D.docs.get(blattId) : null;
  if (!doc || doc.typ !== 'blatt') doc = blattAusText('', '');
  e.blattId = doc.id; D.einst.schreibtisch = { ...e }; speichereEinst();
  const worteAnfang = worte(doc.text || '');
  const feld = el('textarea', { class: 'desk-blatt-text', placeholder: 'Das Blatt liegt im Licht. Schreib.', spellcheck: 'false', autocapitalize: 'sentences' });
  feld.value = doc.text || '';
  const titel = el('input', { class: 'desk-blatt-titel', placeholder: 'Ohne Titel', value: doc.titel || '', 'aria-label': 'Titel' });
  const zahl = el('span', { class: 'desk-blatt-worte' }, worteAnfang ? worteAnfang + ' Wörter' : '');
  const sichern = entprellt(() => {
    doc.text = feld.value; doc.titel = titel.value.trim();
    zaehleWorte(doc.id, doc.text); speichere(doc);
    const n = worte(doc.text); zahl.textContent = n ? n + (n === 1 ? ' Wort' : ' Wörter') : '';
  }, 500, true);
  const weglegen = () => {
    if (sichern.haengt()) sichern.sofort();
    const n = worte(doc.text || '');
    if (n > worteAnfang) {
      /* Der Klecks landet dort, wo das Blatt lag */
      const rb = blatt.getBoundingClientRect(), rs = szene.getBoundingClientRect();
      const x = (rb.left + rb.width * (.2 + Math.random() * .6) - rs.left) / rs.width;
      const y = (rb.top + rb.height * (.6 + Math.random() * .4) - rs.top) / rs.height;
      schreibtischFederTropft(x, Math.max(.5, y));
    }
    /* frisch lesen: der Klecks von eben steht schon drin */
    const jetzt = saubererSchreibtisch(D.einst.schreibtisch); jetzt.blattId = null; D.einst.schreibtisch = jetzt; Object.assign(e, jetzt); speichereEinst();
    blatt.classList.add('weg');
    setTimeout(() => { blatt.remove(); szene.classList.remove('blatt-liegt'); if (szene._maler) szene._maler.setze({ kleckse: jetzt.kleckse }); else if (szene.isConnected) zeichne(); }, 320);
  };
  const blatt = el('div', { class: 'desk-blatt' },
    el('div', { class: 'desk-blatt-kopf' }, titel, zahl,
      el('button', { class: 'rundknopf zart', html: ik('stift'), title: 'Im Schreibraum weiterschreiben', onclick: () => { if (sichern.haengt()) sichern.sofort(); oeffneSchreibraum(doc.id); } }),
      el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Blatt weglegen (es bleibt bei den Blättern)', onclick: weglegen })),
    feld,
    el('div', { class: 'desk-blatt-fuss' }, 'Liegt bei den Blättern. Weglegen mit Esc.'));
  feld.addEventListener('input', () => { sichern(); if (e.federKratzt) federKratzen(); });
  titel.addEventListener('input', sichern);
  feld.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); weglegen(); } });
  titel.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); feld.focus(); } });
  szene.append(blatt);
  szene.classList.add('blatt-liegt');
  if (fokus) setTimeout(() => { feld.focus(); feld.setSelectionRange(feld.value.length, feld.value.length); }, 80);
  return blatt;
}
