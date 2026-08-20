/* ================================================================
   VANI — Klang: der Atmosphären-Fundus
   ================================================================ */

function baueMischpult(kompakt) {
  const wurzel = el('div', { class: 'mischpult' + (kompakt ? ' kompakt' : '') });

  /* Szenen */
  const szenen = el('div', { class: 'szenenchips' });
  const eigene = vomTyp('mischung');
  const alleSzenen = [...KLANG_SZENEN.map((s) => ({ name: s.name, pegel: s.pegel })),
                      ...eigene.map((m) => ({ name: m.titel, pegel: m.pegel, doc: m }))];
  for (const s of alleSzenen) {
    const chip = el('button', { class: 'szenenchip', onclick: () => { mischungAnwenden(Object.assign({}, s.pegel)); baueRegler(); } }, s.name);
    if (s.doc) langdruck(chip, async () => {
      if (await frage('„' + s.name + '" aus den eigenen Szenen nehmen?', { ja: 'Entfernen', gefahr: true })) {
        await loesche(s.doc.id, true); zeichne();
      }
    });
    szenen.append(chip);
  }
  szenen.append(el('button', { class: 'szenenchip leiser', onclick: () => { alleKlaengeAus(); baueRegler(); } }, 'Stille'));

  wurzel.append(el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'SZENEN'), szenen);

  /* Regler nach Kategorien */
  const reglerhalter = el('div');
  wurzel.append(reglerhalter);

  function baueRegler() {
    reglerhalter.innerHTML = '';
    const misch = D.einst.mischung || {};
    for (const kat of KLANG_KATEGORIEN) {
      const block = el('div', { class: 'klangblock' });
      block.append(el('div', { class: 'kartenkopf', style: 'margin-top:14px' }, kat.toUpperCase()));
      for (const ebene of KLANG_EBENEN.filter((e) => e.kat === kat)) {
        const wert = misch[ebene.id] || 0;
        const schieber = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round(wert * 100)) });
        const zeile = el('div', { class: 'klangzeile' + (wert > 0 ? ' an' : '') },
          el('button', {
            class: 'klangname', onclick: () => {
              const m = D.einst.mischung || {};
              if ((m[ebene.id] || 0) > 0) { delete m[ebene.id]; }
              else { m[ebene.id] = .5; schieber.value = '50'; }
              mischungAnwenden(m);
              zeile.classList.toggle('an', !!m[ebene.id]);
            }
          }, ebene.name),
          schieber
        );
        schieber.addEventListener('input', () => {
          const m = D.einst.mischung || {};
          const v = parseInt(schieber.value, 10) / 100;
          if (v > 0) { m[ebene.id] = v; } else { delete m[ebene.id]; }
          mischungAnwenden(m);
          zeile.classList.toggle('an', v > 0);
        });
        block.append(zeile);
      }
      reglerhalter.append(block);
    }

    /* Lautstärke + Speichern */
    const laut = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round((D.einst.lautstaerke ?? .5) * 100)) });
    laut.addEventListener('input', () => setzeLautstaerke(parseInt(laut.value, 10) / 100));
    reglerhalter.append(el('div', { class: 'klangfuss' },
      el('div', { class: 'klangzeile an', style: 'box-shadow:none' }, el('span', { class: 'klangname', style: 'font-weight:600' }, 'Gesamt'), laut),
      el('button', {
        class: 'knopf', onclick: async () => {
          const m = D.einst.mischung || {};
          if (!Object.keys(m).length) { toast('Erst etwas mischen.'); return; }
          const name = await eingabe({ titel: 'Diese Mischung heißt …', platzhalter: 'z. B. Regen überm Schreibtisch' });
          if (!name) return;
          neuDoc('mischung', { titel: name, pegel: Object.assign({}, m) });
          toast('Gemerkt als Szene.');
          zeichne();
        }
      }, 'Mischung merken')
    ));
  }
  baueRegler();
  return wurzel;
}

RENDER.klang = function (haupt) {
  haupt.append(raumkopf('Klang', 'alles errechnet, nichts geladen — mischen erlaubt'));
  const inhalt = el('div', { class: 'inhalt' });
  inhalt.append(baueMischpult(false));
  haupt.append(inhalt);
};

/* Kompakte Fassung als Überlagerung (aus dem Schreibraum) */
function oeffneMischpult() {
  const kasten = el('div', { class: 'modal', style: 'width:min(560px,calc(100vw - 40px))' },
    el('h2', {}, 'Klang'),
    baueMischpult(true),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Fertig'))
  );
  const zu = zeigeDeck(kasten);
}
