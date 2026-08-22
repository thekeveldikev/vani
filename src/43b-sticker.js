/* ================================================================
   VANI — Sticker: Handgezeichnetes, das man auf Seiten klebt.

   Ein Sticker ist eine kleine Zeichnung mit durchsichtigem Grund — ein rotes
   „SCHMU!", ein Pfeil, ein Herz, ein Kringel. Man zeichnet ihn einmal im
   Stickerblock, dann liegt er als Anlage auf der Seite: verschiebbar, drehbar
   am Griff, größer und kleiner, abmachbar. Und weil man dieselben Dinge immer
   wieder in Hefte schreibt, wandert jeder Sticker auf Wunsch in die
   Stickerkiste und lässt sich von dort beliebig oft wieder aufkleben.
   ================================================================ */

const STICKER_DOC = 'sticker';          /* auf einer Seite klebend */
const STICKER_VORLAGE = 'stickervorlage'; /* in der Kiste, wiederverwendbar */

/* Schneidet die gezeichnete Fläche auf ihren Inhalt zu — ein Sticker soll so
   groß sein wie das, was man gezeichnet hat, nicht wie der Block. */
function stickerZuschneiden(canvas, rand = 6) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  if (!width || !height) return null;
  const daten = ctx.getImageData(0, 0, width, height).data;
  let links = width, oben = height, rechts = -1, unten = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (daten[(y * width + x) * 4 + 3] > 8) {
        if (x < links) links = x; if (x > rechts) rechts = x;
        if (y < oben) oben = y; if (y > unten) unten = y;
      }
    }
  }
  if (rechts < 0) return null;
  links = Math.max(0, links - rand); oben = Math.max(0, oben - rand);
  rechts = Math.min(width - 1, rechts + rand); unten = Math.min(height - 1, unten + rand);
  const aus = document.createElement('canvas');
  aus.width = rechts - links + 1; aus.height = unten - oben + 1;
  aus.getContext('2d').drawImage(canvas, links, oben, aus.width, aus.height, 0, 0, aus.width, aus.height);
  return aus;
}

/* Der Stickerblock: eine kleine Zeichenfläche mit Stiften, Radierer, Zurück. */
function stickerZeichnen({ titel = 'Ein Sticker', inKiste = true } = {}) {
  return new Promise((res) => {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const BREITE = Math.min(440, Math.max(260, window.innerWidth - 96)), HOEHE = Math.round(BREITE * .56);
    const canvas = el('canvas', { class: 'stickerblock-flaeche', width: String(Math.round(BREITE * dpr)), height: String(Math.round(HOEHE * dpr)) });
    canvas.style.width = BREITE + 'px'; canvas.style.height = HOEHE + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let farbe = /^#[0-9a-f]{6}$/i.test(D.einst.stickerFarbe || '') ? D.einst.stickerFarbe : '#c8322b';
    let dicke = begrenze(D.einst.stickerDicke, 1, 24, 5);
    let radierer = false;
    const striche = [];
    let zurueckgelegt = [];
    let strich = null;

    const punktAus = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * BREITE / r.width, y: (e.clientY - r.top) * HOEHE / r.height }; };
    const breiteFuer = (e) => radierer ? Math.max(10, dicke * 3) : dicke * (.7 + ((e && e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : .5) * .6);
    const zeichneStrich = (s) => {
      ctx.globalCompositeOperation = s.radierer ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.farbe; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < s.punkte.length; i++) {
        const a = s.punkte[i - 1], b = s.punkte[i];
        ctx.lineWidth = b.w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (s.punkte.length === 1) { const p = s.punkte[0]; ctx.fillStyle = s.farbe; ctx.beginPath(); ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    };
    const allesZeichnen = () => { ctx.clearRect(0, 0, BREITE, HOEHE); for (const s of striche) zeichneStrich(s); knoepfe(); };
    const knoepfe = () => { zurueck.style.opacity = striche.length ? '' : '.35'; vor.style.opacity = zurueckgelegt.length ? '' : '.35'; };

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      const p = punktAus(e);
      strich = { farbe, radierer, punkte: [{ x: p.x, y: p.y, w: breiteFuer(e) }] };
      striche.push(strich); zurueckgelegt = [];
      zeichneStrich(strich); knoepfe(); e.preventDefault();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!strich) return;
      const roh = e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e];
      ctx.globalCompositeOperation = strich.radierer ? 'destination-out' : 'source-over';
      ctx.strokeStyle = strich.farbe; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const ev of roh) {
        const p = punktAus(ev), w = breiteFuer(ev.pressure != null ? ev : e);
        const v = strich.punkte[strich.punkte.length - 1];
        if (Math.hypot(p.x - v.x, p.y - v.y) < .4) continue;
        ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        strich.punkte.push({ x: p.x, y: p.y, w });
      }
      ctx.globalCompositeOperation = 'source-over';
    });
    const ende = () => { strich = null; };
    canvas.addEventListener('pointerup', ende); canvas.addEventListener('pointercancel', ende);

    const farben = ['#c8322b', '#2c251c', '#1f5fa8', '#2f7c72', '#d08b31', '#765187', '#cb6b62', '#5f7752'];
    const eigene = el('input', { type: 'color', value: farbe, title: 'Eigene Farbe' });
    const probe = el('span', { class: 'stift-dicke-probe', style: 'width:' + dicke + 'px;height:' + dicke + 'px;background:' + farbe });
    const waehle = (f) => { farbe = f; eigene.value = f; radierer = false; radierKnopf.classList.remove('an'); probe.style.background = f; D.einst.stickerFarbe = f; speichereEinst(); $$('.stiftfarbe', leiste).forEach((k) => k.classList.toggle('an', k.dataset.f === f)); };
    eigene.addEventListener('input', () => waehle(eigene.value));
    const regler = el('input', { type: 'range', min: '1', max: '22', step: '.5', value: String(dicke), title: 'Stiftdicke' });
    regler.addEventListener('input', () => { dicke = Number(regler.value); probe.style.width = dicke + 'px'; probe.style.height = dicke + 'px'; D.einst.stickerDicke = dicke; speichereEinst(); });
    const radierKnopf = el('button', { class: 'rundknopf kritzel-werkzeug', html: ik('radierer'), title: 'Radierer', onclick: () => { radierer = !radierer; radierKnopf.classList.toggle('an', radierer); if (radierer) $$('.stiftfarbe', leiste).forEach((k) => k.classList.remove('an')); } });
    const zurueck = el('button', { class: 'rundknopf kritzel-werkzeug', html: ik('zurueck'), title: 'Schritt zurück', onclick: () => { if (!striche.length) return; zurueckgelegt.push(striche.pop()); allesZeichnen(); } });
    const vor = el('button', { class: 'rundknopf kritzel-werkzeug', html: ik('rechts'), title: 'Wiederherstellen', onclick: () => { if (!zurueckgelegt.length) return; striche.push(zurueckgelegt.pop()); allesZeichnen(); } });
    const leer = el('button', { class: 'rundknopf kritzel-werkzeug', html: ik('muell'), title: 'Alles löschen', onclick: () => { if (!striche.length) return; zurueckgelegt = [...striche.reverse()]; striche.length = 0; allesZeichnen(); } });
    const leiste = el('div', { class: 'stickerblock-leiste' },
      farben.map((f) => el('button', { class: 'stiftfarbe' + (f === farbe ? ' an' : ''), 'data-f': f, style: 'background:' + f, onclick: () => waehle(f) })),
      el('label', { class: 'stift-eigen', title: 'Eigene Farbe' }, '＋', eigene),
      el('label', { class: 'stift-dicke' }, probe, regler),
      radierKnopf, el('span', { class: 'kritzel-trenner' }), zurueck, vor, leer);

    const kisteHaken = el('input', { type: 'checkbox' });
    kisteHaken.checked = !!inKiste;
    let fertig = false;
    const kasten = el('div', { class: 'modal stickerblock' },
      el('h2', {}, titel),
      el('div', { class: 'stickerblock-hinweis' }, 'Zeichne mit Stift oder Finger. Der Sticker wird so groß wie das Gezeichnete — der Rest bleibt durchsichtig.'),
      el('div', { class: 'stickerblock-rahmen' }, canvas),
      leiste,
      el('label', { class: 'stickerblock-kiste' }, kisteHaken, ' Auch in die Stickerkiste legen, zum Wiederverwenden'),
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: async () => {
          const zuschnitt = stickerZuschneiden(canvas);
          if (!zuschnitt) { toast('Da ist noch nichts gezeichnet.'); return; }
          fertig = true; zu();
          const bild = await speichereKritzelei(zuschnitt, null);
          res(bild ? { bild, seitenverhaeltnis: zuschnitt.height / zuschnitt.width, inKiste: kisteHaken.checked } : null);
        } }, 'Aufkleben')));
    const zu = zeigeDeck(kasten, () => { if (!fertig) { fertig = true; res(null); } });
  });
}

/* Die Stickerkiste: alles, was man sich aufgehoben hat. */
function stickerKiste() {
  return vomTyp(STICKER_VORLAGE).sort((a, b) => (b.zuletzt || b.angelegt || 0) - (a.zuletzt || a.angelegt || 0));
}

/* Mitgebrachte Sticker: liegen als Bilddateien neben der App und werden beim
   ersten Aufkleben in den Medienvorrat geholt — mit fester Kennung, damit
   Sicherung und Sync sie wie jedes andere Bild mitnehmen. */
const STICKER_MITGEBRACHT = [
  { id: 'schmu', name: 'Schmu!', datei: 'sticker/schmu.png', verhaeltnis: 724 / 2172 }
];
async function stickerMitgebrachtBild(m) {
  const id = 'sticker:' + m.id;
  if (await dbGet('media', id)) return id;
  const antwort = await fetch(m.datei, { cache: 'force-cache' });
  if (!antwort.ok) throw new Error('Sticker nicht erreichbar');
  const blob = await antwort.blob();
  await dbPut('media', blob, id);
  if (typeof syncMediaGeaendert === 'function') syncMediaGeaendert(id);
  loeseMedienURL(id);
  return id;
}

/* Einen Sticker aufkleben: aus der Kiste, aus dem Mitgebrachten, oder neu zeichnen. */
async function stickerAufkleben(seite) {
  const kiste = stickerKiste();
  const wahl = await new Promise((res) => {
    let fertig = false;
    const feld = (img, titel, beiWahl) => el('button', { class: 'stickerkiste-feld', title: titel, onclick: () => { fertig = true; zu(); res(beiWahl()); } }, img);
    const eigene = el('div', { class: 'stickerkiste' });
    for (const v of kiste) {
      const img = el('img', { alt: '' });
      setzeBild(img, v.bild);
      const k = feld(img, 'Aufkleben', () => ({ art: 'kiste', v }));
      langdruck(k, async () => {
        if (await frage('Diesen Sticker aus der Kiste nehmen? Schon aufgeklebte bleiben, wo sie sind.', { ja: 'Aus der Kiste nehmen', gefahr: true })) {
          await loesche(v.id, true); k.remove();
        }
      });
      eigene.append(k);
    }
    const mitgebracht = el('div', { class: 'stickerkiste' },
      STICKER_MITGEBRACHT.map((m) => feld(el('img', { alt: m.name, src: m.datei }), m.name, () => ({ art: 'mitgebracht', m }))));
    const kasten = el('div', { class: 'modal stickerwahl' },
      el('h2', {}, 'Stickerkiste'),
      el('div', { class: 'stickerblock-hinweis' }, 'Antippen klebt ihn auf. Lange drücken nimmt einen eigenen aus der Kiste.'),
      kiste.length ? el('div', { class: 'kartenkopf' }, 'MEINE') : null,
      kiste.length ? eigene : null,
      el('div', { class: 'kartenkopf', style: kiste.length ? 'margin-top:12px' : '' }, 'MITGEBRACHT'),
      mitgebracht,
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: () => { fertig = true; zu(); res({ art: 'neu' }); } }, el('span', { html: ik('stift'), style: 'display:flex' }), 'Neuen zeichnen')));
    const zu = zeigeDeck(kasten, () => { if (!fertig) { fertig = true; res(null); } });
  });
  if (!wahl) return null;
  let bild, verhaeltnis;
  if (wahl.art === 'neu') {
    const neu = await stickerZeichnen({});
    if (!neu) return null;
    bild = neu.bild; verhaeltnis = neu.seitenverhaeltnis;
    if (neu.inKiste) neuDoc(STICKER_VORLAGE, { bild, verhaeltnis, zuletzt: Date.now() });
  } else if (wahl.art === 'mitgebracht') {
    try { bild = await stickerMitgebrachtBild(wahl.m); } catch (e) { toast('Der Sticker ließ sich gerade nicht laden.'); return null; }
    verhaeltnis = wahl.m.verhaeltnis;
  } else {
    bild = wahl.v.bild; verhaeltnis = wahl.v.verhaeltnis || .5;
    wahl.v.zuletzt = Date.now(); speichereStill(wahl.v);
  }
  /* Breite so, dass ein Wort lesbar bleibt; lange schmale Sticker etwas breiter. */
  const w = begrenze(22 + (verhaeltnis < .35 ? 10 : 0), 10, 60, 24);
  return neuDoc(STICKER_DOC, {
    parent: seite.id, bild, verhaeltnis,
    befestigung: 'lose',
    pos: { x: 30 + Math.random() * 30, y: 10 + Math.random() * 30, rot: -6 + Math.random() * 12, w }
  });
}

function baueSticker(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage sticker-anlage befestigung-lose' });
  positioniere(halter, a);
  const img = el('img', { alt: '', draggable: 'false' });
  setzeBild(img, a.bild);
  halter.append(img);
  anlageGesten(halter, a, blatt, neuBauen);
  return halter;
}
