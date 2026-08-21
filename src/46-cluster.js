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
    el('span', { style: 'align-self:center;font-family:ui-serif,Georgia,serif;font-weight:600;padding:0 6px' }, brett.titel)
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
    $$('.denkblase', flaeche).forEach((x) => x.remove());
    for (const b of kinder(brett.id, 'blase')) flaeche.append(baueBlase(b));
    baueKanten();
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
