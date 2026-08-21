/* ================================================================
   VANI — Wörter: die Wortschatzkiste & Funken
   ================================================================ */

RENDER.woerter = function (haupt) {
  haupt.append(raumkopf('Wörter'));
  const inhalt = el('div', { class: 'inhalt' });

  /* Kiste */
  const kiste = el('div', { class: 'karte' });
  kiste.append(el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'WORTSCHATZKISTE'));
  const gitter = el('div', { class: 'wortgitter' });

  function baueKiste() {
    gitter.innerHTML = '';
    const alle = vomTyp('wort').sort((a, b) => a.angelegt - b.angelegt);
    if (!alle.length) {
      gitter.append(el('div', { style: 'color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' }, 'Eine leere Kiste wartet auf schöne Wörter.'));
    }
    for (const w of alle) {
      let h = 0;
      for (const c of w.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const dreh = (h % 7) - 3;
      const karte = el('button', { class: 'wortkarte', style: '--dreh:' + dreh + 'deg' }, w.text);
      karte.addEventListener('click', async () => {
        const wahl = await menue([
          { text: 'Damit schreiben', icon: 'stift', wert: 'schreiben' },
          { text: 'Ändern', icon: 'drehen', wert: 'edit' },
          { text: 'Aus der Kiste nehmen', icon: 'muell', wert: 'weg', rot: true }
        ], w.text);
        if (wahl === 'schreiben') {
          const seite = blattAusText('', w.text + ' —\n\n');
          oeffneSchreibraum(seite.id);
        } else if (wahl === 'edit') {
          const neu = await eingabe({ titel: 'Das Wort', wert: w.text });
          if (neu) { w.text = neu; speichereStill(w); baueKiste(); }
        } else if (wahl === 'weg') { await loesche(w.id); baueKiste(); }
      });
      gitter.append(karte);
    }
  }
  baueKiste();

  const feld = el('input', { type: 'text', placeholder: 'Ein Wort, das bleiben soll …' });
  const zugabe = el('div', { class: 'wortzugabe' },
    feld,
    el('button', {
      class: 'rundknopf voll', html: ik('plus'), title: 'Neues Wort', onclick: () => {
        const t = feld.value.trim();
        if (!t) return;
        neuDoc('wort', { text: t });
        feld.value = '';
        baueKiste();
      }
    })
  );
  feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') zugabe.querySelector('button').click(); });

  kiste.append(gitter, zugabe);
  inhalt.append(kiste);

  /* Schütteln */
  const klangkarte = el('div', { class: 'karte', style: 'margin-top:14px' });
  klangkarte.append(el('div', { class: 'kartenkopf' }, el('span', { html: ik('wuerfel') }), 'KISTE SCHÜTTELN'));
  const bühne = el('div', { class: 'dreiklang' }, el('span', { style: 'color:var(--blass);font-size:16px' }, 'Drei Wörter fallen heraus — und wollen zusammen etwas werden.'));
  let griff = [];
  klangkarte.append(bühne, el('div', { class: 'fussreihe' },
    el('button', {
      class: 'knopf', onclick: () => {
        const alle = vomTyp('wort');
        if (alle.length < 3) { toast('Dafür braucht die Kiste mindestens drei Wörter.'); return; }
        griff = [...alle].sort(() => Math.random() - .5).slice(0, 3);
        bühne.innerHTML = '';
        griff.forEach((w, i) => bühne.append(el('span', { style: '--dreh:' + ((i * 5) - 5) + 'deg' }, w.text)));
      }
    }, 'Schütteln'),
    el('button', {
      class: 'knopf voll', onclick: () => {
        if (!griff.length) { toast('Erst schütteln.'); return; }
        const seite = blattAusText('', griff.map((w) => w.text).join(' · ') + '\n\n');
        oeffneSchreibraum(seite.id);
      }
    }, 'Damit schreiben')
  ));
  inhalt.append(klangkarte);

  /* Funken */
  let funke = neuerFunke(false);
  let funkeArt = 'szene';
  const funkeText = el('div', { class: 'funke-text', style: 'min-height:54px' }, funke);
  const arten = el('div', { class: 'funke-arten' });
  const ziehe = () => { funke = funkeArt === 'kombi' ? neuerFunke(true) : neuerFunke(false, funkeArt); funkeText.textContent = funke; };
  for (const [id, name] of [['szene', 'Szene'], ['kombi', 'Wer · Wo · Aber'], ['frage', 'Frage'], ['form', 'Form'], ['satz', 'Satz']]) arten.append(el('button', {
    class: id === funkeArt ? 'an' : '', onclick: (e) => { funkeArt = id; $$('button', arten).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); ziehe(); }
  }, name));
  inhalt.append(el('div', { class: 'karte', style: 'margin-top:14px' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('feuer') }), 'FUNKEN'),
    arten, funkeText,
    el('div', { class: 'fussreihe' },
      el('button', { class: 'knopf', onclick: ziehe }, 'Neuer Funke'),
      el('button', { class: 'knopf zart', onclick: () => { neuDoc('funkeln', { text: funke, quelle: 'funke' }); toast('Dieser Funke taucht wieder auf.'); } }, 'Merken'),
      el('button', {
        class: 'knopf voll', onclick: () => {
          const seite = blattAusText('', funke + '\n\n');
          oeffneSchreibraum(seite.id);
        }
      }, 'Dem nachgehen')
    )
  ));

  haupt.append(inhalt);
};
