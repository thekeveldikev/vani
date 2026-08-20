/* ================================================================
   VANI — Der Faden: der lange Chat, weitergesponnen.
   ================================================================ */

RENDER.faden = function (haupt) {
  const raum = el('div', { class: 'schnipsel-raum' });
  raum.append(el('div', { class: 'kopf', style: 'position:static;background:none' },
    el('h1', {}, 'Faden', el('div', { class: 'unter' }, 'alles, was je an Vani ging'))
  ));

  const lauf = el('div', { class: 'schnipsel-lauf' });
  const innen = el('div', { class: 'innen' });
  lauf.append(innen);

  const feld = el('textarea', { placeholder: 'Weiter im Faden …', rows: 1 });
  autogrow(feld);
  const zeile = el('div', { class: 'schreibzeile' },
    feld,
    el('button', {
      class: 'rundknopf voll', html: ik('senden'), onclick: () => {
        const t = feld.value.trim();
        if (!t) return;
        neuDoc('faden', { text: t });
        feld.value = ''; feld.style.height = 'auto';
        baueLauf(true);
        feld.focus();
      }
    })
  );
  raum.append(lauf, zeile);
  haupt.append(raum);

  const alle = () => vomTyp('faden').sort((a, b) => a.angelegt - b.angelegt);
  let zeigeAb = Math.max(0, alle().length - 150);

  function baueBlase(s) {
    const blase = el('div', { class: 'blase fadenblase', 'data-id': s.id },
      el('div', { class: 'btext', html: schmuecke(s.text) }),
      el('div', { class: 'bzeit' }, fmtZeit(s.angelegt))
    );
    blase.addEventListener('click', async (e) => {
      if (e.target.closest('.verweis')) return;
      const wahl = await menue([
        { text: 'Kopieren', icon: 'teilen', wert: 'kopie' },
        { text: 'Als Blatt herauslösen', icon: 'blatt', wert: 'blatt' },
        { text: 'Löschen', icon: 'muell', wert: 'weg', rot: true }
      ]);
      if (wahl === 'kopie') { try { await navigator.clipboard.writeText(s.text); toast('Kopiert.'); } catch (x) { teileText(s.text); } }
      else if (wahl === 'blatt') { blattAusText('', s.text); toast('Liegt jetzt bei den Blättern.'); }
      else if (wahl === 'weg') { await loesche(s.id); baueLauf(); }
    });
    return blase;
  }

  function baueLauf(ansEnde) {
    innen.innerHTML = '';
    const liste = alle();
    if (!liste.length) {
      innen.append(el('div', { class: 'leer' }, 'Der Faden liegt noch woanders.',
        el('div', { class: 'klein' }, 'Er kommt als private Datei zu dir — Feinheiten → „Sicher ist sicher" → einlesen. Danach läuft er hier weiter.')));
      return;
    }
    if (zeigeAb > 0) {
      innen.append(el('button', {
        class: 'knopf zart', style: 'align-self:center;margin:10px 0', onclick: () => {
          const alteHoehe = lauf.scrollHeight;
          zeigeAb = Math.max(0, zeigeAb - 300);
          baueLauf();
          lauf.scrollTop = lauf.scrollHeight - alteHoehe;
        }
      }, '… frühere zeigen (' + zeigeAb + ')'));
    }
    let letzterTag = '';
    for (const s of liste.slice(zeigeAb)) {
      const tag = tagKey(s.angelegt);
      if (tag !== letzterTag) {
        letzterTag = tag;
        const d = new Date(s.angelegt);
        innen.append(el('div', { class: 'datumstrenner' }, fmtDatum(s.angelegt) + ' ' + d.getFullYear()));
      }
      innen.append(baueBlase(s));
    }
    if (ansEnde !== false) requestAnimationFrame(() => { lauf.scrollTop = lauf.scrollHeight; });
  }

  baueLauf();
};
