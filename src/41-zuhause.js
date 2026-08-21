/* ================================================================
   VANI — Zuhause
   ================================================================ */

function _wiederHash(s) {
  let h = 2166136261;
  for (const c of String(s || '')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function wiederFunde(jetzt = Date.now()) {
  const heute = new Date(jetzt), tagSaat = tagKey(jetzt);
  const typen = new Set(['schnipsel', 'szene', 'seite', 'blatt', 'blase', 'faden', 'funkeln']);
  const funde = [];
  for (const d of D.docs.values()) {
    const text = (d.text || '').trim();
    if (!typen.has(d.typ) || text.length < 24 || jetzt - d.angelegt < 2 * 86400000) continue;
    const damals = new Date(d.angelegt);
    let art = d.typ === 'funkeln' ? 'FUNKELN' : d.typ === 'faden' ? 'AUS DEM FADEN' : 'LIEGEN GEBLIEBEN';
    if (damals.getDate() === heute.getDate() && damals.getMonth() === heute.getMonth() && damals.getFullYear() < heute.getFullYear()) {
      const jahre = heute.getFullYear() - damals.getFullYear(); art = 'HEUTE VOR ' + jahre + (jahre === 1 ? ' JAHR' : ' JAHREN');
    } else if (/\?\s*(?:\n|$)/.test(text)) art = 'EINE OFFENE FRAGE';
    else if (/(?:,|:|…|\.{3}|\b(?:dass|weil|aber|und|oder))\s*$/i.test(text)) art = 'NOCH NICHT FERTIG';
    else if (/\b(?:erster|erste)\s+satz\b/i.test(text)) art = 'EIN ANFANG';
    else if (/\b(?:letzter|letzte)\s+satz\b/i.test(text)) art = 'EIN ENDE';
    else if (/\b(?:verbind(?:ung|et|en)|connection|drähte|fäden)\b/i.test(text)) art = 'EINE VERBINDUNG';
    else if (/\b(?:traum|träum|dream|albtraum)\w*\b/i.test(text)) art = 'AUS EINEM TRAUM';
    else if (/\b(?:19|20)\d{2}\b.*\b(?:19|20)\d{2}\b/s.test(text)) art = 'EIN ZEITFADEN';
    else if (/^[\s„“"']*[A-ZÄÖÜ][^\n]{0,100}[.!?][\s„“"']*$/m.test(text) && text.length < 280) art = 'EIN SATZ WIE EINE TÜR';
    else if (/(?:^|\n)\s*(?:\d+[.)]|[-•])\s+/.test(text) || text.split('\n').length >= 5) art = 'EINE ALTE LISTE';
    else if (text.length > 700) art = 'ERSTER & LETZTER SATZ';
    let auszug = text;
    if (art === 'ERSTER & LETZTER SATZ') {
      const saetze = text.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [text];
      auszug = (saetze[0] || '').trim() + (saetze.length > 1 ? '\n…\n' + (saetze[saetze.length - 1] || '').trim() : '');
    }
    funde.push({ doc: d, art, auszug: auszug.slice(0, 760), hash: _wiederHash(tagSaat + ':' + d.id) });
  }
  funde.sort((a, b) => a.hash - b.hash);
  const gemischt = [], jeArt = new Map();
  for (const f of funde) {
    const n = jeArt.get(f.art) || 0;
    if (n >= 3) continue;
    jeArt.set(f.art, n + 1); gemischt.push(f);
  }
  return gemischt;
}

function findeWiederEchos(funde, max = 6) {
  const stopp = new Set(['dieser', 'diese', 'dieses', 'einen', 'einem', 'einer', 'nicht', 'aber', 'dass', 'hatte', 'haben', 'wurde', 'würde', 'waren', 'sagte', 'immer', 'etwas', 'eines', 'their', 'there', 'about', 'with', 'from', 'eine', 'the', 'und', 'oder', 'schon', 'jetzt', 'dann', 'wenn', 'mich', 'auch', 'noch', 'mein', 'meine', 'seine', 'ihnen', 'because', 'would', 'could', 'should']);
  const woerter = new Map();
  const kandidaten = [], paare = new Set();
  for (const f of funde.slice(0, 180)) {
    const menge = new Set(normalisiere(f.auszug).split(/[^a-z0-9]+/).filter((w) => w.length >= 6 && !stopp.has(w)));
    for (const w of menge) {
      const alt = woerter.get(w);
      if (alt && alt.doc.id !== f.doc.id && Math.abs(alt.doc.angelegt - f.doc.angelegt) > 21 * 86400000) {
        const paar = [alt.doc.id, f.doc.id].sort().join(':');
        if (!paare.has(paar)) { paare.add(paar); kandidaten.push({ wort: w, a: alt, b: f, hash: _wiederHash(tagKey() + paar + w) }); }
      }
      if (!alt) woerter.set(w, f);
    }
  }
  return kandidaten.sort((a, b) => a.hash - b.hash).slice(0, Math.max(0, max));
}
function findeWiederEcho(funde) { return findeWiederEchos(funde, 1)[0] || null; }

function eigeneFunken() {
  return vomTyp('funkeln').filter((f) => f.quelle === 'eigen').sort((a, b) => b.geaendert - a.geaendert);
}

function eigenerFunkeAnlegen(alt) {
  return new Promise((res) => {
    const text = el('textarea', { rows: '5', placeholder: 'Der Satz, das Bild, das Geräusch oder nur der Vibe …' });
    text.value = alt && alt.text || '';
    const vibe = el('input', { type: 'text', maxlength: '80', placeholder: 'Vibe – z. B. kalter Sommerabend, leises Unbehagen', value: alt && alt.vibe || '' });
    const art = el('select');
    for (const [wert, name] of [['satz', 'Gehörter Satz'], ['bild', 'Bild oder Szene'], ['vibe', 'Vibe'], ['frage', 'Frage'], ['sonst', 'Etwas anderes']]) art.append(el('option', { value: wert }, name));
    art.value = alt && alt.art || 'satz';
    const meldung = el('div', { class: 'profil-meldung', role: 'status' });
    const kasten = el('div', { class: 'modal funke-eigen-modal' }, el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), alt ? 'EIGENEN FUNKEN ÄNDERN' : 'EIGENER FUNKE'),
      el('h2', {}, alt ? 'Was ist jetzt genauer?' : 'Was hat gerade gezündet?'),
      text, el('div', { class: 'funke-meta' }, art, vibe), meldung,
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => { zu(); res(null); } }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: () => {
          const t = text.value.trim(); if (!t) { meldung.textContent = 'Der Funke braucht wenigstens ein Wort.'; return; }
          const doc = alt || neuDoc('funkeln', { quelle: 'eigen' });
          doc.text = t; doc.vibe = vibe.value.trim().slice(0, 80); doc.art = art.value; doc.quelle = 'eigen'; speichere(doc);
          res(doc); zu(); toast(alt ? 'Der Funke ist klarer.' : 'In deiner Funkenkiste.');
        } }, 'In die Funkenkiste')));
    const zu = zeigeDeck(kasten, () => res(null));
    setTimeout(() => text.focus(), 60);
  });
}

function zeigeFunkenSammlung() {
  const suche = el('input', { type: 'search', placeholder: 'In meinen Funken suchen …' });
  const liste = el('div', { class: 'funken-sammlung' });
  const baue = () => {
    liste.innerHTML = '';
    const q = normalisiere(suche.value.trim());
    const alle = eigeneFunken().filter((f) => !q || normalisiere((f.text || '') + ' ' + (f.vibe || '') + ' ' + (f.art || '')).includes(q));
    if (!alle.length) liste.append(el('div', { class: 'leer klein' }, q ? 'Kein Funke passt dazu.' : 'Noch still hier. Ein eigener Satz genügt.'));
    for (const f of alle) liste.append(el('article', { class: 'eigener-funke' },
      el('button', { class: 'eigener-funke-text', onclick: () => { const b = blattAusText('', (f.text || '') + '\n\n'); zu(); oeffneSchreibraum(b.id); } },
        f.vibe ? el('span', { class: 'funke-vibe' }, f.vibe) : null, el('span', {}, f.text || '')),
      el('div', { class: 'eigener-funke-aktionen' },
        el('button', { title: 'Ändern', onclick: async () => { await eigenerFunkeAnlegen(f); baue(); } }, 'Ändern'),
        el('button', { title: 'Verbinden', onclick: () => zeigeBeziehungen(f) }, 'Verbinden'),
        el('button', { title: 'Vergessen', onclick: async () => { if (await frage('Diesen Funken in den Papierkorb legen?', { ja: 'Vergessen', gefahr: true })) { await loesche(f.id, true); baue(); } } }, '×'))));
  };
  suche.addEventListener('input', entprellt(baue, 100));
  const kasten = el('div', { class: 'modal funkenkiste-modal' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'MEINE FUNKENKISTE'),
    suche, liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: async () => { const f = await eigenerFunkeAnlegen(); if (f) baue(); } }, '+ Eigener Funke'),
      el('button', { class: 'knopf voll', onclick: () => zu() }, 'Fertig')));
  const zu = zeigeDeck(kasten); baue(); setTimeout(() => suche.focus(), 60);
}

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
        class: 'rundknopf voll', html: ik('senden'), title: 'Als Schnipsel festhalten', onclick: () => {
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
  let funkeArt = 'szene';
  let funkeAktuell = funkeDesTages();
  const funkeText = el('div', { class: 'funke-text' }, funkeAktuell);
  const funkeArten = el('div', { class: 'funke-arten' });
  let merkeFunkeKnopf = null;
  const artDaten = [...FUNKE_ARTEN, ['eigene', 'Meine']];
  const zieheFunke = () => {
    if (funkeArt === 'eigene') {
      const meine = eigeneFunken(); funkeAktuell = meine.length ? zufall(meine).text : 'Deine Funkenkiste ist noch leer. Fang den ersten Satz ein.';
    } else funkeAktuell = funkeArt === 'kombi' ? neuerFunke(true) : neuerFunke(false, funkeArt);
    funkeText.textContent = funkeAktuell;
    if (merkeFunkeKnopf) merkeFunkeKnopf.textContent = funkeArt === 'eigene' ? 'Sammlung' : 'Merken';
  };
  for (const [id, name] of artDaten) funkeArten.append(el('button', {
    class: id === funkeArt ? 'an' : '', onclick: (e) => {
      funkeArt = id; $$('button', funkeArten).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); zieheFunke();
    }
  }, name));
  gitter.append(el('div', { class: 'karte' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'FUNKE'),
    funkeArten, funkeText,
    el('div', { class: 'fussreihe' },
      el('button', { class: 'knopf zart', onclick: zieheFunke }, 'Anderer'),
      el('button', { class: 'knopf zart', onclick: async () => { const f = await eigenerFunkeAnlegen(); if (f) {
        funkeArt = 'eigene'; funkeAktuell = f.text; funkeText.textContent = f.text;
        $$('.funke-arten button', funkeArten).forEach((b, i) => b.classList.toggle('an', artDaten[i][0] === 'eigene'));
        if (merkeFunkeKnopf) merkeFunkeKnopf.textContent = 'Sammlung';
      } } }, '+ Eigener'),
      el('button', { class: 'knopf zart', onclick: () => zeigeFunkenSammlung() }, 'Funkenkiste'),
      (merkeFunkeKnopf = el('button', { class: 'knopf zart', onclick: () => { if (funkeArt === 'eigene') { zeigeFunkenSammlung(); return; } neuDoc('funkeln', { text: funkeAktuell, quelle: 'funke' }); toast('Dieser Funke taucht wieder auf.'); } }, 'Merken')),
      el('button', {
        class: 'knopf', onclick: () => {
          if (funkeArt === 'eigene' && !eigeneFunken().length) { eigenerFunkeAnlegen(); return; }
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

  /* Wieder aufgetaucht — mehrere Arten von Erinnerung, nicht bloß Zufall. */
  const funde = wiederFunde();
  if (funde.length) {
    const echoes = findeWiederEchos(funde);
    const regal = el('div', { class: 'wieder-regal' });
    let ab = 0;
    const zeichneFunde = () => {
      regal.innerHTML = '';
      const auswahl = [];
      for (let i = 0; i < Math.min(3, funde.length); i++) auswahl.push(funde[(ab + i) % funde.length]);
      for (const f of auswahl) regal.append(el('button', { class: 'wieder-fund', onclick: () => oeffneDoc(f.doc) },
        el('span', { class: 'wieder-art' }, f.art),
        el('span', { class: 'wieder-text' }, f.auszug),
        el('span', { class: 'wieder-wann' }, vorZeit(f.doc.angelegt) + ' · ' + docName(f.doc))));
      const echo = echoes.length ? echoes[Math.floor(ab / 3) % echoes.length] : null;
      if (echo) regal.append(el('div', { class: 'wieder-fund echo' },
        el('span', { class: 'wieder-art' }, 'ECHO · ' + echo.wort.toUpperCase()),
        el('button', { onclick: () => oeffneDoc(echo.a.doc) }, '„' + echo.a.auszug.slice(0, 150) + '…"'),
        el('span', { class: 'echo-faden' }, '↕'),
        el('button', { onclick: () => oeffneDoc(echo.b.doc) }, '„' + echo.b.auszug.slice(0, 150) + '…"')));
    };
    const karte = el('div', { class: 'karte breit wieder-karte' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('fund') }), 'WIEDER AUFGETAUCHT',
        el('span', { class: 'rest' }),
        el('button', { class: 'knopf zart', onclick: () => { ab = (ab + 3) % funde.length; zeichneFunde(); } }, 'Andere Funde')),
      regal);
    zeichneFunde(); gitter.append(karte);
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
