/* ================================================================
   VANI — Zuhause
   ================================================================ */

RENDER.zuhause = function (haupt) {
  const inhalt = el('div', { class: 'inhalt' });

  /* Gruß */
  const tageWeg = (() => {
    const letzteTage = Object.keys(D.stats.tage).sort();
    if (!letzteTage.length) return 0;
    const letzter = new Date(letzteTage[letzteTage.length - 1]);
    return Math.floor((Date.now() - letzter.getTime()) / 86400000);
  })();
  inhalt.append(el('div', { class: 'zuhause-gruss' },
    el('h1', {}, tageWeg > 6 ? GRUSS_LANGE_WEG : grussZeile()),
    el('p', {}, zufall(GRUSS_UNTEN))
  ));

  const gitter = el('div', { class: 'zuhause-gitter' });
  inhalt.append(gitter);

  /* Schnell einfangen */
  const fangFeld = el('textarea', { placeholder: 'Kurz festhalten, bevor es weg ist …', rows: 1 });
  autogrow(fangFeld);
  gitter.append(el('div', { class: 'karte breit' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('schnipsel') }), 'IN DIE SCHNIPSEL'),
    el('div', { class: 'fang' },
      fangFeld,
      el('button', {
        class: 'rundknopf voll', html: ik('senden'), onclick: () => {
          const t = fangFeld.value.trim();
          if (!t) return;
          neuDoc('schnipsel', { text: t });
          fangFeld.value = ''; fangFeld.style.height = 'auto';
          toast('Eingefangen.');
        }
      })
    )
  ));

  /* Schreibfeuer */
  const heutigeWorte = D.stats.tage[tagKey()] || 0;
  const str = straehne();
  const feuerKarte = el('div', { class: 'karte feuerkarte' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('feuer') }), 'SCHREIBFEUER'),
    el('div', { class: 'feuer-zeile' },
      el('div', { class: 'feuer-flamme', html: flammeHTML() }),
      el('div', { class: 'feuer-zahlen' },
        el('div', { class: 'gross' }, heutigeWorte.toLocaleString('de-DE')),
        el('div', { class: 'einheit' }, heutigeWorte === 1 ? 'Wort heute' : 'Wörter heute'),
        el('div', { class: 'klein' },
          str >= 2 ? str + ' Tage in Folge am Feuer' :
          heutigeWorte > 0 ? 'Das Feuer brennt.' :
          feuerstufe() === 'glut' ? 'Noch Glut von neulich. Ein Satz genügt.' :
          'Kalt hier. Ein Satz macht Feuer.')
      ),
      (() => {
        const b = el('div', { class: 'wochenbalken' });
        const max = Math.max(1, ...[...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return D.stats.tage[tagKey(d)] || 0; }));
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const w = D.stats.tage[tagKey(d)] || 0;
          b.append(el('i', { class: (i === 0 ? 'heute ' : '') + (w ? '' : 'null'), style: 'height:' + Math.max(8, Math.round(w / max * 100)) + '%' }));
        }
        return b;
      })()
    ),
    D.einst.tagesziel > 0 ? el('div', { style: 'margin-top:12px' },
      el('div', { class: 'zielbalken' }, el('i', { class: heutigeWorte >= D.einst.tagesziel ? 'geschafft' : '', style: 'width:' + Math.min(100, Math.round(heutigeWorte / D.einst.tagesziel * 100)) + '%' })),
      el('div', { style: 'font-size:12px;color:var(--blass);margin-top:5px' },
        heutigeWorte >= D.einst.tagesziel ? 'Tagesziel erreicht. Der Rest ist Geschenk.' : 'noch ' + (D.einst.tagesziel - heutigeWorte).toLocaleString('de-DE') + ' bis zum Tagesziel')
    ) : null
  );
  gitter.append(feuerKarte);

  /* Funke des Tages */
  let funkeAktuell = funkeDesTages();
  const funkeText = el('div', { class: 'funke-text' }, funkeAktuell);
  gitter.append(el('div', { class: 'karte' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'FUNKE'),
    funkeText,
    el('div', { class: 'fussreihe' },
      el('button', { class: 'knopf zart', onclick: () => { funkeAktuell = neuerFunke(Math.random() < .4); funkeText.textContent = funkeAktuell; } }, 'Anderer'),
      el('button', {
        class: 'knopf', onclick: () => {
          const blatt = blattAusText('', funkeAktuell + '\n\n');
          oeffneSchreibraum(blatt.id);
        }
      }, 'Dem nachgehen')
    )
  ));

  /* Weiterschreiben */
  const zuletzt = [...D.docs.values()]
    .filter((d) => (d.typ === 'szene' || d.typ === 'seite' || d.typ === 'blatt') && (d.text || '').trim())
    .sort((a, b) => b.geaendert - a.geaendert).slice(0, 3);
  if (zuletzt.length) {
    gitter.append(el('div', { class: 'karte' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('stift') }), 'WEITERSCHREIBEN'),
      zuletzt.map((d) => {
        let wo = '';
        if (d.typ === 'szene') {
          const p = D.docs.get(d.projekt), k = D.docs.get(d.parent);
          wo = [p && p.titel, k && k.titel].filter(Boolean).join(' › ');
        } else if (d.typ === 'blatt') {
          wo = 'Blätter';
        } else {
          const h = D.docs.get(d.parent);
          wo = h ? h.titel : '';
        }
        const letzterSatz = (d.text || '').trim().split('\n').filter(Boolean).pop() || '';
        return el('button', { class: 'weiter-eintrag', onclick: () => ((d.typ === 'szene' || d.typ === 'blatt') ? oeffneSchreibraum(d.id) : oeffneDoc(d)) },
          el('span', { class: 'wtitel' }, d.titel || 'Ohne Titel'),
          wo ? el('span', { class: 'wo' }, wo + ' · ' + vorZeit(d.geaendert)) : el('span', { class: 'wo' }, vorZeit(d.geaendert)),
          el('span', { class: 'probe' }, '… ' + letzterSatz.slice(-90))
        );
      })
    ));
  }

  /* Wieder aufgetaucht — kuratierte Funkeln zählen dreifach */
  const funkeln = [...D.docs.values()].filter((d) => d.typ === 'funkeln' && (d.text || '').trim());
  const alteFunde = [...D.docs.values()].filter((d) =>
    ['schnipsel', 'szene', 'seite', 'blatt', 'blase'].includes(d.typ) &&
    (d.text || '').trim().length > 40 &&
    Date.now() - d.angelegt > 3 * 86400000)
    .concat(funkeln, funkeln, funkeln);
  if (alteFunde.length) {
    let fund = zufall(alteFunde);
    const fundText = el('div', { class: 'fund-text' }, fund.text.trim());
    const fundWann = el('div', { class: 'fund-wann' }, '');
    const aktualisiere = () => { fundWann.textContent = vorZeit(fund.angelegt) + ' geschrieben · Tippen zum Hingehen'; };
    aktualisiere();
    const karte = el('div', { class: 'karte' + (zuletzt.length ? '' : ' breit') },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('fund') }), 'WIEDER AUFGETAUCHT',
        el('span', { class: 'rest' }),
        el('button', {
          class: 'rundknopf zart', style: 'width:30px;height:30px', html: ik('wandel'), onclick: (e) => {
            e.stopPropagation();
            fund = zufall(alteFunde);
            fundText.textContent = fund.text.trim();
            aktualisiere();
          }
        })),
      fundText, fundWann
    );
    karte.addEventListener('click', (e) => { if (!e.target.closest('button')) oeffneDoc(fund); });
    gitter.append(karte);
  }

  /* Sicherungs-Erinnerung, ganz leise */
  const tageOhneSicherung = D.stats.letzteSicherung ? Math.floor((Date.now() - D.stats.letzteSicherung) / 86400000) : null;
  if (D.docs.size > 12 && (tageOhneSicherung === null || tageOhneSicherung > 14)) {
    inhalt.append(el('div', { class: 'sicherungs-mahnung' },
      tageOhneSicherung === null ? 'Noch nie gesichert. ' : 'Letzte Sicherung: vor ' + tageOhneSicherung + ' Tagen. ',
      el('button', { onclick: () => { location.hash = '#/feinheiten'; } }, 'Sicher ist sicher →')
    ));
  }

  haupt.append(inhalt);
};

