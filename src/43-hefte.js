/* ================================================================
   VANI — Hefte: Papier, Zettel, Fotos, Kritzeleien
   ================================================================ */

RENDER.hefte = function (haupt) {
  haupt.append(raumkopf('Hefte', null,
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), onclick: async () => {
        const name = await eingabe({ titel: 'Ein neues Heft', platzhalter: 'Wie soll es heißen?' });
        if (!name) return;
        const h = neuDoc('heft', { titel: name, farbe: zufall(HEFTFARBEN), papier: 'liniert' });
        location.hash = '#/heft/' + h.id;
      }
    })
  ));
  const inhalt = el('div', { class: 'inhalt' });

  const alle = vomTyp('heft').sort((a, b) => b.geaendert - a.geaendert);
  const aktive = alle.filter((h) => !h.archiv);
  const imRegal = alle.filter((h) => h.archiv);

  if (!alle.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Ein leeres Regal.',
      el('div', { class: 'klein' }, 'Das erste Heft ist das beste Versprechen, das es gibt.')));
  }

  const baueDeckel = (h) => {
    const seiten = kinder(h.id, 'seite').length;
    const deckel = el('button', {
      class: 'heftdeckel' + (h.archiv ? ' archiv' : ''),
      style: 'background:linear-gradient(155deg,' + h.farbe + ',' + h.farbe + 'cc)',
      onclick: () => { location.hash = '#/heft/' + h.id; }
    },
      h.archiv ? el('div', { class: 'hdatum' }, 'INS REGAL · ' + fmtDatum(h.archiv)) : null,
      el('div', { class: 'htitel' }, h.titel),
      el('div', { class: 'hseiten' }, seiten === 1 ? '1 Seite' : seiten + ' Seiten')
    );
    langdruck(deckel, () => heftMenue(h, () => zeichne()));
    return deckel;
  };

  if (aktive.length) {
    const regal = el('div', { class: 'regal' });
    aktive.forEach((h) => regal.append(baueDeckel(h)));
    inhalt.append(regal);
  }
  if (imRegal.length) {
    inhalt.append(el('div', { class: 'regal-trenner' }, 'IM REGAL'));
    const regal = el('div', { class: 'regal' });
    imRegal.forEach((h) => regal.append(baueDeckel(h)));
    inhalt.append(regal);
  }
  haupt.append(inhalt);
};

async function heftMenue(h, danach) {
  const wahl = await menue([
    { text: 'Umbenennen', icon: 'stift', wert: 'name' },
    { text: 'Papier: ' + ({ liniert: 'liniert', kariert: 'kariert', blank: 'blanko' }[h.papier] || 'liniert'), icon: 'hefte', wert: 'papier' },
    { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' },
    h.archiv ? { text: 'Zurück auf den Tisch', icon: 'archiv', wert: 'zurueck' } : { text: 'Ins Regal stellen', icon: 'archiv', wert: 'archiv' },
    { text: 'Heft verbrennen', icon: 'muell', wert: 'weg', rot: true }
  ], h.titel);
  if (wahl === 'name') {
    const neu = await eingabe({ titel: 'Das Heft heißt jetzt …', wert: h.titel });
    if (neu) { h.titel = neu; speichere(h); }
  } else if (wahl === 'papier') {
    h.papier = { liniert: 'kariert', kariert: 'blank', blank: 'liniert' }[h.papier] || 'kariert';
    speichereStill(h);
  } else if (wahl === 'farbe') {
    const i = (HEFTFARBEN.indexOf(h.farbe) + 1) % HEFTFARBEN.length;
    h.farbe = HEFTFARBEN[i]; speichereStill(h);
  } else if (wahl === 'archiv') {
    h.archiv = Date.now(); speichereStill(h);
    toast('Feierlich ins Regal gestellt.');
  } else if (wahl === 'zurueck') {
    delete h.archiv; speichereStill(h);
  } else if (wahl === 'weg') {
    const seiten = kinder(h.id, 'seite').length;
    if (await frage('„' + h.titel + '" mit ' + (seiten === 1 ? 'einer Seite' : seiten + ' Seiten') + ' in den Papierkorb legen?', { ja: 'In den Papierkorb', gefahr: true })) {
      await loesche(h.id);
      if (location.hash.includes(h.id)) location.hash = '#/hefte';
    }
  }
  if (danach) danach();
}

/* ----- Ein Heft, eine Seite ----- */
RENDER.heft = function (haupt, heftId) {
  const heft = D.docs.get(heftId);
  if (!heft) { location.hash = '#/hefte'; return; }

  let seiten = kinder(heft.id, 'seite');
  if (!seiten.length) {
    neuDoc('seite', { parent: heft.id, ord: 0, titel: '', text: '' });
    seiten = kinder(heft.id, 'seite');
  }

  let idx = Math.min(seiten.length - 1, parseInt(sessionStorage.getItem('heftSeite:' + heftId) || '0', 10) || 0);
  const ziel = sessionStorage.getItem('zielSeite');
  if (ziel) {
    sessionStorage.removeItem('zielSeite');
    const zi = seiten.findIndex((s) => s.id === ziel);
    if (zi >= 0) idx = zi;
  }

  haupt.append(el('div', { class: 'kopf' },
    zurueckknopf('#/hefte'),
    el('h1', {}, heft.titel),
    el('button', { class: 'rundknopf zart', html: ik('mehr'), onclick: () => heftMenue(heft, () => zeichne()) })
  ));

  const inhalt = el('div', { class: 'inhalt' });
  const halter = el('div', { class: 'seitenhalter' });
  const fuss = el('div', { class: 'seitenfuss' });
  inhalt.append(halter, fuss);
  haupt.append(inhalt);

  function zeigeSeite() {
    seiten = kinder(heft.id, 'seite');
    idx = Math.max(0, Math.min(idx, seiten.length - 1));
    sessionStorage.setItem('heftSeite:' + heftId, String(idx));
    const seite = seiten[idx];
    halter.innerHTML = '';
    fuss.innerHTML = '';
    halter.append(baueSeite(seite, heft, zeigeSeite));

    fuss.append(
      el('button', { class: 'rundknopf zart', html: ik('zurueck'), style: idx === 0 ? 'opacity:.25;pointer-events:none' : '', onclick: () => { idx--; zeigeSeite(); } }),
      el('div', { class: 'snummer' }, 'Seite ' + (idx + 1) + ' von ' + seiten.length),
      el('button', { class: 'rundknopf zart', html: ik('rechts'), style: idx === seiten.length - 1 ? 'opacity:.25;pointer-events:none' : '', onclick: () => { idx++; zeigeSeite(); } }),
      el('button', {
        class: 'rundknopf', html: ik('plus'), title: 'Neue Seite', onclick: () => {
          neuDoc('seite', { parent: heft.id, ord: seiten.length, titel: '', text: '' });
          heft.geaendert = Date.now(); speichereStill(heft);
          idx = seiten.length; zeigeSeite();
        }
      })
    );
  }
  zeigeSeite();
};

function baueSeite(seite, heft, neuZeichnen) {
  const blatt = el('div', { class: 'papierseite ' + (heft.papier || 'liniert') });

  /* Werkzeuge oben rechts */
  const werkzeuge = el('div', { class: 'seitenwerkzeuge' },
    el('button', {
      class: 'rundknopf', title: 'Zettel ankleben', html: ik('pin'), onclick: () => {
        neuDoc('zettel', { parent: seite.id, text: '', farbe: zufall(['gelb', 'rosa', 'blau', 'gruen']), pos: { x: 8 + Math.random() * 40, y: 6 + Math.random() * 20, rot: -4 + Math.random() * 8, w: 30 } });
        baueAnlagen();
      }
    }),
    el('button', {
      class: 'rundknopf', title: 'Foto einkleben', html: ik('kamera'), onclick: async () => {
        const bild = await waehleBild();
        if (!bild) return;
        neuDoc('foto', { parent: seite.id, bild: bild.id, pos: { x: 12 + Math.random() * 35, y: 8 + Math.random() * 20, rot: -3 + Math.random() * 6, w: 42 } });
        baueAnlagen();
      }
    }),
    el('button', { class: 'rundknopf', title: 'Kritzeln', html: ik('stift'), onclick: () => starteKritzeln(blatt, seite) }),
    el('button', {
      class: 'rundknopf', title: 'Mehr', html: ik('mehr'), onclick: async () => {
        const wahl = await menue([
          { text: 'Im Schreibraum öffnen', icon: 'stift', wert: 'sr' },
          { text: 'Seite herausreißen', icon: 'muell', wert: 'weg', rot: true }
        ]);
        if (wahl === 'sr') oeffneSchreibraum(seite.id);
        else if (wahl === 'weg' && await frage('Diese Seite herausreißen? Alles darauf geht mit.', { ja: 'Herausreißen', gefahr: true })) {
          await loesche(seite.id);
          kinder(heft.id, 'seite').forEach((s, i) => { s.ord = i; speichereStill(s); });
          neuZeichnen();
        }
      }
    })
  );

  /* Titel + Text */
  const titel = el('input', { class: 'stitel serif', type: 'text', value: seite.titel || '', placeholder: 'Überschrift, wenn du magst' });
  titel.addEventListener('input', entprellt(() => { seite.titel = titel.value; speichere(seite); }, 400));

  const text = el('textarea', { class: 'schreibflaeche text', placeholder: 'Hier darf alles stehen.' });
  text.value = seite.text || '';
  autogrow(text);
  text.addEventListener('input', entprellt(() => {
    seite.text = text.value;
    speichere(seite);
    zaehleWorte(seite.id, seite.text);
  }, 400));

  const skizzenbild = el('div', { class: 'skizzenbild' });
  if (seite.skizze) {
    const img = el('img', { alt: '' });
    setzeBild(img, seite.skizze);
    skizzenbild.append(img);
  }

  blatt.append(skizzenbild, titel, text, werkzeuge);

  /* Angeklebtes */
  function baueAnlagen() {
    $$('.anlage', blatt).forEach((a) => a.remove());
    for (const a of kinder(seite.id)) {
      if (a.typ === 'zettel') blatt.append(baueZettel(a, blatt, baueAnlagen));
      else if (a.typ === 'foto') blatt.append(baueFoto(a, blatt, baueAnlagen));
    }
  }
  baueAnlagen();

  blatt.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.anlage')) $$('.anlage.aktiv', blatt).forEach((a) => a.classList.remove('aktiv'));
  });

  return blatt;
}

function positioniere(elem, a) {
  const p = a.pos || { x: 10, y: 10, rot: 0, w: 30 };
  elem.style.left = p.x + '%';
  elem.style.top = p.y + '%';
  elem.style.width = p.w + '%';
  elem.style.transform = 'rotate(' + (p.rot || 0) + 'deg)';
}

function anlageGesten(elem, a, blatt, neuBauen) {
  let zieht = null;
  elem.addEventListener('pointerdown', (e) => {
    if (e.target.tagName === 'TEXTAREA' && elem.classList.contains('aktiv')) return;
    $$('.anlage.aktiv', blatt).forEach((x) => { if (x !== elem) x.classList.remove('aktiv'); });
    const r = blatt.getBoundingClientRect();
    zieht = { sx: e.clientX, sy: e.clientY, px: a.pos.x, py: a.pos.y, r, bewegt: false };
    elem.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  elem.addEventListener('pointermove', (e) => {
    if (!zieht) return;
    const dx = e.clientX - zieht.sx, dy = e.clientY - zieht.sy;
    if (!zieht.bewegt && Math.hypot(dx, dy) < 6) return;
    zieht.bewegt = true;
    elem._zieht = true;
    a.pos.x = Math.max(-10, Math.min(96, zieht.px + dx / zieht.r.width * 100));
    a.pos.y = Math.max(-2, Math.min(102, zieht.py + dy / zieht.r.height * 100));
    elem.style.left = a.pos.x + '%';
    elem.style.top = a.pos.y + '%';
  });
  const ende = (e) => {
    if (!zieht) return;
    if (zieht.bewegt) speichereStill(a);
    else elem.classList.add('aktiv');
    zieht = null;
    setTimeout(() => { elem._zieht = false; }, 0);
  };
  elem.addEventListener('pointerup', ende);
  elem.addEventListener('pointercancel', ende);

  /* Griff: Größe ziehen */
  const griff = el('div', { class: 'griff', html: ik('rechts') });
  griff.style.transform = 'rotate(45deg)';
  let groesse = null;
  griff.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const r = blatt.getBoundingClientRect();
    groesse = { sx: e.clientX, w: a.pos.w, r };
    griff.setPointerCapture(e.pointerId);
  });
  griff.addEventListener('pointermove', (e) => {
    if (!groesse) return;
    a.pos.w = Math.max(12, Math.min(92, groesse.w + (e.clientX - groesse.sx) / groesse.r.width * 100));
    elem.style.width = a.pos.w + '%';
  });
  griff.addEventListener('pointerup', () => { if (groesse) speichereStill(a); groesse = null; });
  elem.append(griff);

  langdruck(elem, async () => {
    const wahl = await menue([
      a.typ === 'zettel' ? { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' } : null,
      { text: 'Etwas drehen', icon: 'drehen', wert: 'drehen' },
      { text: 'Abmachen', icon: 'muell', wert: 'weg', rot: true }
    ]);
    if (wahl === 'farbe') {
      const folge = ['gelb', 'rosa', 'blau', 'gruen'];
      a.farbe = folge[(folge.indexOf(a.farbe) + 1) % folge.length];
      speichereStill(a); neuBauen();
    } else if (wahl === 'drehen') {
      a.pos.rot = ((a.pos.rot || 0) + 4.5);
      if (a.pos.rot > 10) a.pos.rot = -9;
      speichereStill(a);
      elem.style.transform = 'rotate(' + a.pos.rot + 'deg)';
    } else if (wahl === 'weg') {
      if (await frage(a.typ === 'zettel' ? 'Zettel abmachen und wegwerfen?' : 'Foto abmachen?', { ja: 'Abmachen', gefahr: true })) {
        await loesche(a.id); neuBauen();
      }
    }
  });
}

function baueZettel(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage' });
  positioniere(halter, a);
  const z = el('div', { class: 'zettel ' + (a.farbe || 'gelb') });
  const ta = el('textarea', { placeholder: '…', rows: 1 });
  ta.value = a.text || '';
  autogrow(ta);
  ta.addEventListener('input', entprellt(() => { a.text = ta.value; speichereStill(a); }, 400));
  z.append(ta);
  halter.append(z);
  anlageGesten(halter, a, blatt, neuBauen);
  return halter;
}

function baueFoto(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage' });
  positioniere(halter, a);
  const rahmen = el('div', { class: 'foto-anlage' });
  const img = el('img', { alt: '' });
  setzeBild(img, a.bild);
  rahmen.append(img);
  halter.append(rahmen);
  anlageGesten(halter, a, blatt, neuBauen);
  return halter;
}

/* ----- Kritzeln ----- */
const STIFTFARBEN = ['#2c251c', '#b0552f', '#41597a', '#5f7752'];
async function starteKritzeln(blatt, seite) {
  if ($('.kritzelflaeche', blatt)) return;
  const r = blatt.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = el('canvas', { class: 'kritzelflaeche' });
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (seite.skizze) {
    const url = await bildURL(seite.skizze);
    if (url) {
      const alt = new Image();
      await new Promise((res) => { alt.onload = res; alt.onerror = res; alt.src = url; });
      try { ctx.drawImage(alt, 0, 0, r.width, alt.height / alt.width * r.width); } catch (e) {}
    }
  }
  const altesBild = $('.skizzenbild', blatt);
  if (altesBild) altesBild.style.display = 'none';

  let farbe = D.einst.thema === 'tinte' || D.einst.thema === 'kerze' ? '#eae0cd' : STIFTFARBEN[0];
  let radierer = false;
  let strich = null;

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    strich = { x: e.offsetX, y: e.offsetY };
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!strich) return;
    const punkte = (e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e]);
    for (const p of punkte) {
      const cr = canvas.getBoundingClientRect();
      const x = p.clientX - cr.left, y = p.clientY - cr.top;
      const druck = p.pressure && p.pressure > 0 ? p.pressure : .5;
      ctx.globalCompositeOperation = radierer ? 'destination-out' : 'source-over';
      ctx.strokeStyle = farbe;
      ctx.lineWidth = radierer ? 26 : (1 + druck * 3.4);
      ctx.beginPath();
      ctx.moveTo(strich.x, strich.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      strich = { x, y };
    }
  });
  const strichEnde = () => { strich = null; };
  canvas.addEventListener('pointerup', strichEnde);
  canvas.addEventListener('pointercancel', strichEnde);

  const leiste = el('div', { class: 'kritzelleiste' },
    STIFTFARBEN.map((f) =>
      el('button', {
        class: 'stiftfarbe' + (f === farbe ? ' an' : ''), style: 'background:' + f, onclick: (e) => {
          farbe = f; radierer = false;
          $$('.stiftfarbe', leiste).forEach((k) => k.classList.toggle('an', k === e.currentTarget));
          radierKnopf.classList.remove('an');
        }
      })
    ),
    (() => {
      const k = el('button', {
        class: 'rundknopf', style: 'width:34px;height:34px', html: ik('kreuz'), title: 'Radierer', onclick: () => {
          radierer = !radierer;
          k.classList.toggle('an', radierer);
          if (radierer) $$('.stiftfarbe', leiste).forEach((x) => x.classList.remove('an'));
          k.style.background = radierer ? 'var(--akzent)' : '';
          k.style.color = radierer ? 'var(--papier)' : '';
        }
      });
      return k;
    })(),
    el('button', {
      class: 'knopf voll', style: 'padding:7px 14px', onclick: async () => {
        seite.skizze = await speichereKritzelei(canvas, seite.skizze);
        speichere(seite);
        leiste.remove();
        canvas.remove();
        if (altesBild) {
          altesBild.style.display = '';
          altesBild.innerHTML = '';
          const img = el('img', { alt: '' });
          setzeBild(img, seite.skizze);
          altesBild.append(img);
        }
      }
    }, 'Fertig')
  );
  const radierKnopf = leiste.children[STIFTFARBEN.length];

  blatt.closest('.inhalt').prepend(leiste);
  blatt.append(canvas);
}
