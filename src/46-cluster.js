/* ================================================================
   VANI — Cluster: Denken auf Brettern
   ================================================================ */

RENDER.cluster = function (haupt) {
  haupt.append(raumkopf('Cluster', null,
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), title: 'Neues Cluster', onclick: async () => {
        const name = await eingabe({ titel: 'Ein neues Brett', platzhalter: 'Wofür ist es?' });
        if (!name) return;
        const b = neuDoc('board', { titel: name });
        location.hash = '#/brett/' + b.id;
      }
    })
  ));
  const inhalt = el('div', { class: 'inhalt' });
  const bretter = vomTyp('board');
  if (!bretter.length) {
    inhalt.append(el('div', { class: 'leer' }, 'Freier Raum zum Denken.',
      el('div', { class: 'klein' }, 'Blasen, Fäden dazwischen, keine Ordnung nötig.')));
  }
  const liste = el('div', { class: 'brettliste' });
  for (const b of bretter) {
    const blasen = kinder(b.id, 'blase').length;
    const karte = el('button', { class: 'karte brettkarte', onclick: () => { location.hash = '#/brett/' + b.id; } },
      el('div', { class: 'minis' }, el('i'), el('i'), el('i')),
      el('h3', {}, b.titel),
      el('div', { class: 'bzahl' }, blasen === 1 ? 'eine Blase' : blasen + ' Blasen')
    );
    langdruck(karte, async () => {
      const wahl = await menue([
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Brett löschen', icon: 'muell', wert: 'weg', rot: true }
      ], b.titel);
      if (wahl === 'name') {
        const neu = await eingabe({ titel: 'Das Brett heißt jetzt …', wert: b.titel });
        if (neu) { b.titel = neu; speichere(b); zeichne(); }
      } else if (wahl === 'weg') {
        if (await frage('„' + b.titel + '" mit allen Blasen löschen?', { ja: 'Löschen', gefahr: true })) { await loesche(b.id); zeichne(); }
      }
    });
    liste.append(karte);
  }
  inhalt.append(liste);
  haupt.append(inhalt);
};

const BLASENFARBEN = ['', 'b-gelb', 'b-rot', 'b-gruen', 'b-blau'];

RENDER.brett = function (haupt, bid) {
  const brett = D.docs.get(bid);
  if (!brett) { location.hash = '#/cluster'; return; }
  const sicht = brett.sicht || { x: 60, y: 60, z: 1 };
  brett.sicht = sicht;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'brett-kanten');
  const flaeche = el('div', { class: 'brett-flaeche' });
  flaeche.append(svg);
  const raum = el('div', { class: 'brett-raum' }, flaeche);

  let verbinden = false;
  let verbindeVon = null;

  const kopfleiste = el('div', { class: 'schwebeleiste', style: 'left:16px;transform:none' },
    el('button', { class: 'rundknopf zart', html: ik('zurueck'), title: 'Zurück zu den Clustern', onclick: () => { speichereStill(brett); location.hash = '#/cluster'; } }),
    el('span', { style: 'align-self:center;font-family:ui-serif,Georgia,serif;font-weight:600;padding:0 6px' }, brett.titel),
    el('button', { class: 'rundknopf zart', html: ik('teilen'), title: 'Brett als Bild hinausgeben', onclick: () => brettAlsBild(brett) })
  );

  const verbindenKnopf = el('button', {
    class: 'rundknopf', html: ik('verbinden'), title: 'Verbinden', onclick: () => {
      verbinden = !verbinden;
      verbindeVon = null;
      verbindenKnopf.classList.toggle('an', verbinden);
      $$('.denkblase.gewaehlt', flaeche).forEach((x) => x.classList.remove('gewaehlt'));
      toast(verbinden ? 'Zwei Blasen antippen — dann spannt sich ein Faden.' : 'Faden-Modus aus.');
    }
  });
  const zoomAnzeige = el('button', {
    class: 'knopf zart', style: 'min-width:52px;justify-content:center', onclick: () => { sicht.z = 1; sicht.x = 60; sicht.y = 60; wende(); }
  }, '100%');
  const werkzeuge = el('div', { class: 'brett-werkzeuge' },
    el('button', {
      class: 'rundknopf', html: ik('plus'), title: 'Neue Blase', onclick: () => {
        const mitte = weltPunkt(raum.clientWidth / 2, raum.clientHeight / 2);
        neuDoc('blase', { parent: brett.id, text: '', farbe: '', pos: { x: mitte.x - 110 + Math.random() * 40, y: mitte.y - 40 + Math.random() * 40 } });
        baueBlasen();
      }
    }),
    el('button', {
      class: 'rundknopf', html: ik('kamera'), title: 'Bild aufs Brett', onclick: async () => {
        const bild = await waehleBild();
        if (!bild) return;
        const mitte = weltPunkt(raum.clientWidth / 2, raum.clientHeight / 2);
        const breite = 260;
        neuDoc('brettbild', { parent: brett.id, bild: bild.id,
          pos: { x: mitte.x - breite / 2, y: mitte.y - 90, rot: -2 + Math.random() * 4, w: breite } });
        baueBlasen();
      }
    }),
    el('button', {
      class: 'rundknopf', html: ik('rahmen'), title: 'Gruppe um etwas legen', onclick: async () => {
        const name = await eingabe({ titel: 'Wie heißt diese Gruppe?', platzhalter: 'z. B. Erster Teil' });
        if (name === null) return;
        const mitte = weltPunkt(raum.clientWidth / 2, raum.clientHeight / 2);
        neuDoc('gruppe', { parent: brett.id, titel: name || 'Gruppe', farbe: '',
          pos: { x: mitte.x - 220, y: mitte.y - 150, w: 440, h: 300 } });
        baueBlasen();
      }
    }),
    verbindenKnopf,
    el('button', { class: 'rundknopf', html: ik('suche'), style: 'transform:scaleX(-1)', title: 'Kleiner', onclick: () => { zoomeUm(1 / 1.25, raum.clientWidth / 2, raum.clientHeight / 2); } }),
    zoomAnzeige,
    el('button', { class: 'rundknopf', html: ik('suche'), title: 'Größer', onclick: () => { zoomeUm(1.25, raum.clientWidth / 2, raum.clientHeight / 2); } })
  );

  haupt.append(raum, kopfleiste, werkzeuge);

  function wende() {
    flaeche.style.transform = 'translate(' + sicht.x + 'px,' + sicht.y + 'px) scale(' + sicht.z + ')';
    zoomAnzeige.textContent = Math.round(sicht.z * 100) + '%';
  }
  function weltPunkt(cx, cy) { return { x: (cx - sicht.x) / sicht.z, y: (cy - sicht.y) / sicht.z }; }
  function zoomeUm(f, cx, cy) {
    const alt = sicht.z;
    sicht.z = Math.max(.3, Math.min(2.2, sicht.z * f));
    const echt = sicht.z / alt;
    sicht.x = cx - (cx - sicht.x) * echt;
    sicht.y = cy - (cy - sicht.y) * echt;
    wende();
    speichereStill(brett);
  }

  /* Kanten zeichnen */
  function mittelpunkt(b) {
    const elem = flaeche.querySelector('[data-id="' + b.id + '"]');
    const w = elem ? elem.offsetWidth : 220;
    const h = elem ? elem.offsetHeight : 60;
    return { x: b.pos.x + w / 2, y: b.pos.y + h / 2 };
  }
  function baueKanten() {
    svg.innerHTML = '';
    for (const k of kinder(brett.id, 'kante')) {
      const von = D.docs.get(k.von), zu = D.docs.get(k.zu);
      if (!von || !zu) continue;
      const a = mittelpunkt(von), b = mittelpunkt(zu);
      const linie = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      linie.setAttribute('x1', a.x + 20000); linie.setAttribute('y1', a.y + 20000);
      linie.setAttribute('x2', b.x + 20000); linie.setAttribute('y2', b.y + 20000);
      svg.append(linie);
      const griff = linie.cloneNode();
      griff.setAttribute('class', 'klickbar');
      griff.addEventListener('click', async () => {
        const wahl = await menue([
          { text: k.label ? 'Beschriftung ändern' : 'Faden beschriften', icon: 'stift', wert: 'label' },
          { text: 'Faden lösen', icon: 'muell', wert: 'weg', rot: true }
        ]);
        if (wahl === 'label') {
          const neu = await eingabe({ titel: 'Was verbindet die beiden?', wert: k.label || '' });
          if (neu !== null) { k.label = neu; speichereStill(k); baueKanten(); }
        } else if (wahl === 'weg') { await loesche(k.id); baueKanten(); }
      });
      svg.append(griff);
      if (k.label) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (a.x + b.x) / 2 + 20000);
        text.setAttribute('y', (a.y + b.y) / 2 + 20000 - 6);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = k.label;
        svg.append(text);
      }
    }
  }

  /* Blasen bauen */
  function baueBlasen() {
    $$('.denkblase, .brettgruppe, .brettbild', flaeche).forEach((x) => x.remove());
    /* Gruppen zuerst: sie liegen als Rahmen unter allem anderen. */
    for (const g of kinder(brett.id, 'gruppe')) flaeche.append(baueGruppe(g));
    for (const bi of kinder(brett.id, 'brettbild')) flaeche.append(baueBrettbild(bi));
    for (const b of kinder(brett.id, 'blase')) flaeche.append(baueBlase(b));
    baueKanten();
  }

  /* Ein Rahmen, der mitnimmt, was in ihm liegt. */
  function baueGruppe(g) {
    const kasten = el('div', { class: 'brettgruppe ' + (g.farbe || ''), 'data-id': g.id });
    kasten.style.left = g.pos.x + 'px'; kasten.style.top = g.pos.y + 'px';
    kasten.style.width = Math.max(120, g.pos.w || 440) + 'px';
    kasten.style.height = Math.max(90, g.pos.h || 300) + 'px';
    const titel = el('div', { class: 'gruppentitel' }, g.titel || 'Gruppe');
    const griff = el('div', { class: 'gruppengriff', title: 'Größe ändern' });
    kasten.append(titel, griff);

    const innen = () => {
      const x1 = g.pos.x, y1 = g.pos.y, x2 = x1 + (g.pos.w || 440), y2 = y1 + (g.pos.h || 300);
      return kinder(brett.id, 'blase').concat(kinder(brett.id, 'brettbild'))
        .filter((b) => b.pos && b.pos.x >= x1 - 8 && b.pos.y >= y1 - 8 && b.pos.x <= x2 && b.pos.y <= y2);
    };

    let zug = null;
    titel.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      zug = { sx: e.clientX, sy: e.clientY, px: g.pos.x, py: g.pos.y, mit: innen().map((b) => ({ b, x: b.pos.x, y: b.pos.y })), bewegt: false };
      try { titel.setPointerCapture(e.pointerId); } catch (x) {}
    });
    titel.addEventListener('pointermove', (e) => {
      if (!zug) return;
      const dx = (e.clientX - zug.sx) / sicht.z, dy = (e.clientY - zug.sy) / sicht.z;
      if (!zug.bewegt && Math.hypot(dx, dy) < 5) return;
      zug.bewegt = true; kasten._zieht = true;
      g.pos.x = zug.px + dx; g.pos.y = zug.py + dy;
      kasten.style.left = g.pos.x + 'px'; kasten.style.top = g.pos.y + 'px';
      for (const m of zug.mit) {
        m.b.pos.x = m.x + dx; m.b.pos.y = m.y + dy;
        const el2 = flaeche.querySelector('[data-id="' + m.b.id + '"]');
        if (el2) { el2.style.left = m.b.pos.x + 'px'; el2.style.top = m.b.pos.y + 'px'; }
      }
      baueKanten();
    });
    const endeZug = () => {
      if (!zug) return;
      if (zug.bewegt) { speichereStill(g); for (const m of zug.mit) speichereStill(m.b); }
      zug = null; setTimeout(() => { kasten._zieht = false; }, 0);
    };
    titel.addEventListener('pointerup', endeZug);
    titel.addEventListener('pointercancel', endeZug);

    let groesse = null;
    griff.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      groesse = { sx: e.clientX, sy: e.clientY, w: g.pos.w || 440, h: g.pos.h || 300 };
      try { griff.setPointerCapture(e.pointerId); } catch (x) {}
    });
    griff.addEventListener('pointermove', (e) => {
      if (!groesse) return;
      g.pos.w = Math.max(120, groesse.w + (e.clientX - groesse.sx) / sicht.z);
      g.pos.h = Math.max(90, groesse.h + (e.clientY - groesse.sy) / sicht.z);
      kasten.style.width = g.pos.w + 'px'; kasten.style.height = g.pos.h + 'px';
    });
    const endeGroesse = () => { if (groesse) { speichereStill(g); groesse = null; } };
    griff.addEventListener('pointerup', endeGroesse);
    griff.addEventListener('pointercancel', endeGroesse);

    langdruck(titel, async () => {
      const wahl = await menue([
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' },
        { text: 'Eng um den Inhalt legen', icon: 'wandel', wert: 'eng' },
        { text: 'Gruppe auflösen (Inhalt bleibt)', icon: 'kreuz', wert: 'los', rot: true }
      ], g.titel || 'Gruppe');
      if (wahl === 'name') {
        const n = await eingabe({ titel: 'Die Gruppe heißt jetzt …', wert: g.titel });
        if (n !== null) { g.titel = n || 'Gruppe'; speichereStill(g); baueBlasen(); }
      } else if (wahl === 'farbe') {
        g.farbe = BLASENFARBEN[(BLASENFARBEN.indexOf(g.farbe || '') + 1) % BLASENFARBEN.length];
        speichereStill(g); baueBlasen();
      } else if (wahl === 'eng') {
        const drin = innen();
        if (!drin.length) { toast('In dieser Gruppe liegt noch nichts.'); return; }
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        for (const b of drin) {
          const e2 = flaeche.querySelector('[data-id="' + b.id + '"]');
          const bw = e2 ? e2.offsetWidth : 220, bh = e2 ? e2.offsetHeight : 70;
          x1 = Math.min(x1, b.pos.x); y1 = Math.min(y1, b.pos.y);
          x2 = Math.max(x2, b.pos.x + bw); y2 = Math.max(y2, b.pos.y + bh);
        }
        g.pos = { x: x1 - 26, y: y1 - 40, w: (x2 - x1) + 52, h: (y2 - y1) + 66 };
        speichereStill(g); baueBlasen();
      } else if (wahl === 'los') {
        await loesche(g.id, true); baueBlasen();
      }
    });
    return kasten;
  }

  /* Ein Bild auf dem Brett: verschieben, Größe ändern, drehen. */
  function baueBrettbild(bi) {
    const kasten = el('div', { class: 'brettbild', 'data-id': bi.id });
    kasten.style.left = bi.pos.x + 'px'; kasten.style.top = bi.pos.y + 'px';
    kasten.style.width = Math.max(60, bi.pos.w || 260) + 'px';
    kasten.style.transform = 'rotate(' + (bi.pos.rot || 0) + 'deg)';
    const img = el('img', { alt: bi.titel || '' });
    setzeBild(img, bi.bild);
    const griff = el('div', { class: 'brettbildgriff', title: 'Größe ändern' });
    kasten.append(img, griff);
    if (bi.titel) kasten.append(el('div', { class: 'brettbildtitel' }, bi.titel));

    let zug = null;
    kasten.addEventListener('pointerdown', (e) => {
      if (e.target === griff) return;
      zug = { sx: e.clientX, sy: e.clientY, px: bi.pos.x, py: bi.pos.y, bewegt: false };
      try { kasten.setPointerCapture(e.pointerId); } catch (x) {}
      e.preventDefault();
    });
    kasten.addEventListener('pointermove', (e) => {
      if (!zug) return;
      const dx = (e.clientX - zug.sx) / sicht.z, dy = (e.clientY - zug.sy) / sicht.z;
      if (!zug.bewegt && Math.hypot(dx, dy) < 5) return;
      zug.bewegt = true; kasten._zieht = true;
      bi.pos.x = zug.px + dx; bi.pos.y = zug.py + dy;
      kasten.style.left = bi.pos.x + 'px'; kasten.style.top = bi.pos.y + 'px';
    });
    const ende = () => { if (zug) { if (zug.bewegt) speichereStill(bi); zug = null; setTimeout(() => { kasten._zieht = false; }, 0); } };
    kasten.addEventListener('pointerup', ende);
    kasten.addEventListener('pointercancel', ende);

    let groesse = null;
    griff.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      groesse = { sx: e.clientX, w: bi.pos.w || 260 };
      try { griff.setPointerCapture(e.pointerId); } catch (x) {}
    });
    griff.addEventListener('pointermove', (e) => {
      if (!groesse) return;
      bi.pos.w = Math.max(60, Math.min(1400, groesse.w + (e.clientX - groesse.sx) / sicht.z));
      kasten.style.width = bi.pos.w + 'px';
    });
    const endeG = () => { if (groesse) { speichereStill(bi); groesse = null; } };
    griff.addEventListener('pointerup', endeG);
    griff.addEventListener('pointercancel', endeG);

    langdruck(kasten, async () => {
      const wahl = await menue([
        { text: bi.titel ? 'Beschriftung ändern' : 'Beschriften', icon: 'stift', wert: 'titel' },
        { text: 'Etwas drehen', icon: 'drehen', wert: 'drehen' },
        { text: 'Gerade rücken', icon: 'ausBlock', wert: 'gerade' },
        { text: 'Vom Brett nehmen', icon: 'muell', wert: 'weg', rot: true }
      ]);
      if (wahl === 'titel') {
        const n = await eingabe({ titel: 'Was steht auf dem Bild?', wert: bi.titel || '' });
        if (n !== null) { bi.titel = n; speichereStill(bi); baueBlasen(); }
      } else if (wahl === 'drehen') {
        bi.pos.rot = ((bi.pos.rot || 0) + 5); if (bi.pos.rot > 12) bi.pos.rot = -10;
        speichereStill(bi); kasten.style.transform = 'rotate(' + bi.pos.rot + 'deg)';
      } else if (wahl === 'gerade') {
        bi.pos.rot = 0; speichereStill(bi); kasten.style.transform = 'rotate(0deg)';
      } else if (wahl === 'weg' && await frage('Das Bild vom Brett nehmen?', { ja: 'Wegnehmen', gefahr: true })) {
        await loesche(bi.id); baueBlasen();
      }
    });
    return kasten;
  }
  function baueBlase(b) {
    const blase = el('div', { class: 'denkblase ' + (b.farbe || ''), 'data-id': b.id });
    blase.style.left = b.pos.x + 'px';
    blase.style.top = b.pos.y + 'px';
    const ta = el('textarea', { rows: 1, placeholder: '…', readonly: 'readonly' });
    ta.value = b.text || '';
    autogrow(ta);
    ta.addEventListener('input', entprellt(() => { b.text = ta.value; speichereStill(b); }, 400));
    ta.addEventListener('blur', () => ta.setAttribute('readonly', 'readonly'));
    blase.append(ta);
    const quelle = b.quelle && D.docs.get(b.quelle);
    if (quelle) blase.append(el('button', {
      class: 'blasenquelle', onpointerdown: (e) => e.stopPropagation(), onclick: (e) => { e.stopPropagation(); speichereStill(brett); oeffneDoc(quelle); }
    }, el('span', { html: ik(docIcon(quelle)) }), docName(quelle)));

    let zieht = null;
    blase.addEventListener('pointerdown', (e) => {
      if (!ta.hasAttribute('readonly') && e.target === ta) return;
      zieht = { sx: e.clientX, sy: e.clientY, px: b.pos.x, py: b.pos.y, bewegt: false };
      try { blase.setPointerCapture(e.pointerId); } catch (x) {}
      e.preventDefault();
    });
    blase.addEventListener('pointermove', (e) => {
      if (!zieht) return;
      const dx = (e.clientX - zieht.sx) / sicht.z, dy = (e.clientY - zieht.sy) / sicht.z;
      if (!zieht.bewegt && Math.hypot(dx, dy) < 5) return;
      zieht.bewegt = true;
      blase._zieht = true;
      b.pos.x = zieht.px + dx; b.pos.y = zieht.py + dy;
      blase.style.left = b.pos.x + 'px';
      blase.style.top = b.pos.y + 'px';
      baueKanten();
    });
    blase.addEventListener('pointerup', () => {
      if (!zieht) return;
      const bewegt = zieht.bewegt;
      zieht = null;
      setTimeout(() => { blase._zieht = false; }, 0);
      if (bewegt) { speichereStill(b); return; }
      /* Tippen */
      if (verbinden) {
        if (!verbindeVon) { verbindeVon = b; blase.classList.add('gewaehlt'); return; }
        if (verbindeVon.id === b.id) { verbindeVon = null; blase.classList.remove('gewaehlt'); return; }
        const bestehend = kinder(brett.id, 'kante').find((k) =>
          (k.von === verbindeVon.id && k.zu === b.id) || (k.von === b.id && k.zu === verbindeVon.id));
        if (bestehend) { loesche(bestehend.id).then(baueKanten); }
        else { neuDoc('kante', { parent: brett.id, von: verbindeVon.id, zu: b.id, label: '' }); baueKanten(); }
        $$('.denkblase.gewaehlt', flaeche).forEach((x) => x.classList.remove('gewaehlt'));
        verbindeVon = null;
        return;
      }
      ta.removeAttribute('readonly');
      ta.focus();
    });
    blase.addEventListener('pointercancel', () => { zieht = null; });

    langdruck(blase, async () => {
      const wahl = await menue([
        { text: 'Andere Farbe', icon: 'farbe', wert: 'farbe' },
        { text: 'Im Schreibraum öffnen', icon: 'stift', wert: 'sr' },
        { text: 'Verbindungen ansehen', icon: 'verbinden', wert: 'bezug' },
        { text: 'Blase zerplatzen', icon: 'muell', wert: 'weg', rot: true }
      ]);
      if (wahl === 'farbe') {
        b.farbe = BLASENFARBEN[(BLASENFARBEN.indexOf(b.farbe || '') + 1) % BLASENFARBEN.length];
        speichereStill(b);
        blase.className = 'denkblase ' + (b.farbe || '');
      } else if (wahl === 'sr') {
        speichereStill(brett);
        oeffneSchreibraum(b.id);
      } else if (wahl === 'bezug') {
        zeigeBeziehungen(b);
      } else if (wahl === 'weg') {
        await loesche(b.id); baueBlasen();
      }
    });
    return blase;
  }

  /* Schieben & Kneifen & Doppeltipp */
  const zeiger = new Map();
  let pan = null, kneifen = null, letzterTipp = { t: 0, x: 0, y: 0 };
  raum.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.denkblase') || e.target.closest('.schwebeleiste') || e.target.closest('.brett-werkzeuge')) return;
    zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (zeiger.size === 1) {
      pan = { sx: e.clientX, sy: e.clientY, px: sicht.x, py: sicht.y };
    } else if (zeiger.size === 2) {
      pan = null;
      const [a, b] = [...zeiger.values()];
      kneifen = { abstand: Math.hypot(a.x - b.x, a.y - b.y), z: sicht.z };
    }
  });
  raum.addEventListener('pointermove', (e) => {
    if (!zeiger.has(e.pointerId)) return;
    zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (kneifen && zeiger.size === 2) {
      const [a, b] = [...zeiger.values()];
      const abstand = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const f = (kneifen.z * abstand / kneifen.abstand) / sicht.z;
      zoomeUm(f, mx, my);
    } else if (pan) {
      sicht.x = pan.px + (e.clientX - pan.sx);
      sicht.y = pan.py + (e.clientY - pan.sy);
      wende();
    }
  });
  const zeigerWeg = (e) => {
    if (pan && zeiger.has(e.pointerId)) {
      const dx = e.clientX - pan.sx, dy = e.clientY - pan.sy;
      if (Math.hypot(dx, dy) < 8 && !e.target.closest('.denkblase')) {
        const jetzt = Date.now();
        if (jetzt - letzterTipp.t < 340 && Math.hypot(e.clientX - letzterTipp.x, e.clientY - letzterTipp.y) < 40) {
          const p = weltPunkt(e.clientX, e.clientY);
          neuDoc('blase', { parent: brett.id, text: '', farbe: '', pos: { x: p.x - 110, y: p.y - 30 } });
          baueBlasen();
          letzterTipp = { t: 0, x: 0, y: 0 };
        } else {
          letzterTipp = { t: jetzt, x: e.clientX, y: e.clientY };
        }
      }
      speichereStill(brett);
    }
    zeiger.delete(e.pointerId);
    if (zeiger.size < 2) kneifen = null;
    if (zeiger.size === 0) pan = null;
  };
  raum.addEventListener('pointerup', zeigerWeg);
  raum.addEventListener('pointercancel', zeigerWeg);

  wende();
  baueBlasen();
  if (!kinder(brett.id, 'blase').length) {
    toast('Doppelt tippen — da, wo ein Gedanke hin soll.');
  }
};


/* ----- Ein Brett als Bild -----
   Alles, was auf dem Brett liegt, wird auf eine Leinwand gemalt: Gruppen als
   Rahmen, Fäden als Linien, Bilder als Bilder, Blasen als beschriftete Karten.
   Herauskommt ein PNG, das man verschicken oder ausdrucken kann. */
async function brettAlsBild(brett) {
  const blasen = kinder(brett.id, 'blase');
  const bilder = kinder(brett.id, 'brettbild');
  const gruppen = kinder(brett.id, 'gruppe');
  const kanten = kinder(brett.id, 'kante');
  if (!blasen.length && !bilder.length && !gruppen.length) { toast('Auf diesem Brett liegt noch nichts.'); return; }
  toast('Male das Brett …');

  /* Vorhandene Maße aus der Anzeige holen, sonst schätzen. */
  const masse = new Map();
  for (const b of blasen) {
    const e = document.querySelector('.denkblase[data-id="' + b.id + '"]');
    masse.set(b.id, { w: e ? e.offsetWidth : 220, h: e ? e.offsetHeight : 64 });
  }

  /* Bilder vorher laden, damit sie beim Malen fertig sind. */
  const geladen = new Map();
  for (const bi of bilder) {
    const url = await bildURL(bi.bild);
    if (!url) continue;
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.onerror = r; img.src = url; });
    if (img.naturalWidth) geladen.set(bi.id, img);
  }

  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  const merke = (x, y, w, h) => { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x + w); y2 = Math.max(y2, y + h); };
  for (const g of gruppen) merke(g.pos.x, g.pos.y - 24, g.pos.w || 440, (g.pos.h || 300) + 24);
  for (const b of blasen) { const m = masse.get(b.id); merke(b.pos.x, b.pos.y, m.w, m.h); }
  for (const bi of bilder) {
    const img = geladen.get(bi.id);
    const w = bi.pos.w || 260;
    merke(bi.pos.x, bi.pos.y, w, img ? w * (img.naturalHeight / img.naturalWidth) + 26 : 180);
  }
  if (!Number.isFinite(x1)) { toast('Auf diesem Brett liegt noch nichts.'); return; }

  const rand = 60;
  const breite = Math.min(6000, Math.round(x2 - x1 + rand * 2));
  const hoehe = Math.min(6000, Math.round(y2 - y1 + rand * 2 + 54));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement('canvas');
  c.width = Math.round(breite * dpr); c.height = Math.round(hoehe * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const stil = getComputedStyle(document.documentElement);
  const farbe = (n, ersatz) => (stil.getPropertyValue(n) || '').trim() || ersatz;
  const hg = farbe('--hg', '#ece3d1'), papier = farbe('--papier', '#f8f3e7');
  const tinte = farbe('--tinte', '#2c251c'), linie = farbe('--linie', 'rgba(90,74,52,.3)');
  const blass = farbe('--blass', '#82755f'), akzent = farbe('--akzent', '#b0552f');

  g.fillStyle = hg; g.fillRect(0, 0, breite, hoehe);
  const vx = (x) => x - x1 + rand, vy = (y) => y - y1 + rand + 40;

  /* Kopfzeile */
  g.fillStyle = tinte; g.font = '600 22px ui-serif, Georgia, serif';
  g.fillText(brett.titel || 'Brett', rand, 34);
  g.fillStyle = blass; g.font = '13px ui-rounded, system-ui, sans-serif';
  g.fillText(blasen.length + (blasen.length === 1 ? ' Blase' : ' Blasen') + ' · ' + fmtDatum(Date.now()), rand, 54);

  const rundesRechteck = (x, y, w, h, r) => {
    const rr = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + rr, y); g.lineTo(x + w - rr, y); g.quadraticCurveTo(x + w, y, x + w, y + rr);
    g.lineTo(x + w, y + h - rr); g.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    g.lineTo(x + rr, y + h); g.quadraticCurveTo(x, y + h, x, y + h - rr);
    g.lineTo(x, y + rr); g.quadraticCurveTo(x, y, x + rr, y); g.closePath();
  };

  /* Gruppen */
  for (const gr of gruppen) {
    g.save();
    g.strokeStyle = linie; g.setLineDash([7, 6]); g.lineWidth = 1.5;
    rundesRechteck(vx(gr.pos.x), vy(gr.pos.y), gr.pos.w || 440, gr.pos.h || 300, 16);
    g.stroke(); g.setLineDash([]);
    g.fillStyle = blass; g.font = '600 13px ui-rounded, system-ui, sans-serif';
    g.fillText((gr.titel || 'Gruppe').slice(0, 60), vx(gr.pos.x) + 6, vy(gr.pos.y) - 8);
    g.restore();
  }

  /* Fäden */
  const mitte = (b) => {
    if (masse.has(b.id)) { const m = masse.get(b.id); return { x: vx(b.pos.x) + m.w / 2, y: vy(b.pos.y) + m.h / 2 }; }
    const w = b.pos.w || 260;
    const img = geladen.get(b.id);
    return { x: vx(b.pos.x) + w / 2, y: vy(b.pos.y) + (img ? w * (img.naturalHeight / img.naturalWidth) : 160) / 2 };
  };
  g.strokeStyle = linie; g.lineWidth = 1.6;
  g.font = '11px ui-rounded, system-ui, sans-serif';
  for (const k of kanten) {
    const von = D.docs.get(k.von), zu = D.docs.get(k.zu);
    if (!von || !zu || !von.pos || !zu.pos) continue;
    const a = mitte(von), b = mitte(zu);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    if (k.label) {
      g.fillStyle = blass;
      g.textAlign = 'center';
      g.fillText(String(k.label).slice(0, 40), (a.x + b.x) / 2, (a.y + b.y) / 2 - 6);
      g.textAlign = 'left';
    }
  }

  /* Bilder */
  for (const bi of bilder) {
    const img = geladen.get(bi.id);
    const w = bi.pos.w || 260;
    const h = img ? w * (img.naturalHeight / img.naturalWidth) : 160;
    g.save();
    g.translate(vx(bi.pos.x) + w / 2, vy(bi.pos.y) + h / 2);
    g.rotate((bi.pos.rot || 0) * Math.PI / 180);
    g.fillStyle = '#fdfcf7';
    g.shadowColor = 'rgba(0,0,0,.22)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
    g.fillRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + (bi.titel ? 40 : 16));
    g.shadowColor = 'transparent';
    if (img) g.drawImage(img, -w / 2, -h / 2, w, h);
    if (bi.titel) {
      g.fillStyle = '#3a3325'; g.font = '12px ui-rounded, system-ui, sans-serif'; g.textAlign = 'center';
      g.fillText(String(bi.titel).slice(0, 44), 0, h / 2 + 22); g.textAlign = 'left';
    }
    g.restore();
  }

  /* Blasen */
  const FARBEN = { 'b-gelb': '#f6e9a8', 'b-rot': '#f3cfd3', 'b-gruen': '#d3e3bd', 'b-blau': '#cadfea' };
  for (const b of blasen) {
    const m = masse.get(b.id);
    const x = vx(b.pos.x), y = vy(b.pos.y);
    g.save();
    g.shadowColor = 'rgba(0,0,0,.14)'; g.shadowBlur = 9; g.shadowOffsetY = 3;
    g.fillStyle = FARBEN[b.farbe] || papier;
    rundesRechteck(x, y, m.w, m.h, 14); g.fill();
    g.shadowColor = 'transparent';
    g.strokeStyle = linie; g.lineWidth = 1; g.stroke();
    g.fillStyle = tinte; g.font = '14px ui-rounded, system-ui, sans-serif';
    const worte = String(b.text || '').split(/\s+/).filter(Boolean);
    let zeile = '', zy = y + 22;
    for (const w of worte) {
      const probe = zeile ? zeile + ' ' + w : w;
      if (g.measureText(probe).width > m.w - 26 && zeile) {
        g.fillText(zeile, x + 13, zy); zeile = w; zy += 19;
        if (zy > y + m.h - 6) { zeile = ''; break; }
      } else zeile = probe;
    }
    if (zeile) g.fillText(zeile, x + 13, zy);
    if (b.quelle && D.docs.get(b.quelle)) {
      g.fillStyle = akzent; g.font = '10px ui-rounded, system-ui, sans-serif';
      g.fillText(docName(D.docs.get(b.quelle)).slice(0, 28), x + 13, y + m.h - 7);
    }
    g.restore();
  }

  const name = (brett.titel || 'Brett').replace(/[^\wäöüÄÖÜß -]/g, '').trim().slice(0, 50) || 'Brett';
  c.toBlob(async (blob) => {
    if (!blob) { toast('Das Bild wollte nicht.'); return; }
    const datei = new File([blob], name + '.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [datei] })) {
      try { await navigator.share({ files: [datei] }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: name + '.png', style: 'display:none' });
    document.body.append(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
    toast('Das Brett liegt als Bild bereit — schau in „Dateien".', 4200);
  }, 'image/png');
}
