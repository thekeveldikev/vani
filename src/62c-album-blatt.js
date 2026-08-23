/* ===================== 62c — DAS BLATT ZUR FIGUR =====================
   Hier wird eingetragen. Alles darf leer bleiben — das ist keine Nachlässigkeit,
   das ist die Bauart: was leer bleibt, steht später nicht auf der Doppelseite.

   Gespeichert wird sofort, bei jedem Anschlag (entprellt). Es gibt kein
   „Übernehmen", das man vergessen könnte.

   Geburts- und Todesdatum wandern von hier in den Kalender und bleiben mit der
   Figur verbunden (`ausAlbum`): wird das Datum geändert, ändert sich der
   Kalendereintrag mit; wird es gelöscht, verschwindet er. */

function albumNeueFigur(danach) {
  const doc = neuDoc('albumfigur', { name: '', felder: {}, eigene: [], zettel: [], farbe: '' });
  albumBearbeiten(doc, () => { if (danach) danach(doc.id); }, true);
}

/* ----- Der Kalender bekommt Bescheid ----- */
function albumKalenderAbgleich(figur) {
  if (typeof saubererTermin !== 'function') return;
  for (const [feldId, art] of [['geboren', 'geburt'], ['gestorben', 'tod']]) {
    const datum = (figur.felder || {})[feldId];
    const marke = 'album:' + figur.id + ':' + art;
    const vorhanden = [...D.docs.values()].find((d) => d.typ === 'termin' && !d.geloescht && d.ausAlbum === marke);
    const gueltig = datum && typeof kalGueltig === 'function' && kalGueltig(datum);
    if (!gueltig) {
      /* Kein Datum mehr: der Eintrag geht in den Papierkorb, nicht ins Nichts. */
      if (vorhanden && typeof loesche === 'function') loesche(vorhanden.id, true);
      continue;
    }
    const felder = saubererTermin({
      wann: datum, art,
      titel: art === 'geburt' ? (figur.name ? figur.name + ' kommt zur Welt' : 'Geburt') : (figur.name ? figur.name + ' stirbt' : 'Tod'),
      leute: [{ id: figur.id, name: figur.name || 'ohne Namen' }]
    });
    if (!felder) continue;
    if (vorhanden) { Object.assign(vorhanden, felder); speichere(vorhanden); }
    else neuDoc('termin', Object.assign({ ausAlbum: marke }, felder));
  }
}

/* ----- Das Blatt ----- */
function albumBearbeiten(doc, danach, frisch) {
  const stand = saubereAlbumFigur(doc) || { name: '', felder: {}, eigene: [], zettel: [], farbe: '' };
  let gruppe = 'kopf';

  const sichern = entprellt(() => {
    const sauber = saubereAlbumFigur(stand);
    doc.name = sauber.name;
    doc.titel = sauber.name;          /* damit Suche und Papierkorb es lesbar finden */
    doc.felder = sauber.felder;
    doc.eigene = sauber.eigene;
    doc.zettel = sauber.zettel;
    doc.farbe = sauber.farbe;
    speichere(doc);
    albumKalenderAbgleich(doc);
    if (danach) danach();
  }, 420, true);
  const merke = () => sichern();

  /* --- Kopfzeile: Name und Farbe --- */
  const namensfeld = el('input', { type: 'text', class: 'albb-name', value: stand.name, placeholder: 'Wie heißt sie? (darf auch später kommen)', maxlength: '120' });
  namensfeld.addEventListener('input', () => { stand.name = namensfeld.value; kopfzeileAuffrischen(); merke(); });
  const namenshall = el('div', { class: 'albb-namenshall' });
  const kopfzeileAuffrischen = () => {
    namenshall.innerHTML = '';
    const n = stand.name.trim();
    anfuegen(namenshall, n ? el('span', {}, 'Überall auf dieser Seite steht ab jetzt „' + n + '“.') : el('span', { class: 'blass' }, 'Ohne Namen steht die Figur ganz hinten im Buch — nachtragen geht jederzeit.'));
  };

  const farbreihe = el('div', { class: 'albb-farben' });
  const farbenZeichnen = () => {
    farbreihe.innerHTML = '';
    for (const f of ALBUM_FARBEN) {
      farbreihe.append(el('button', {
        class: 'albb-farbe' + (albumFarbe(Object.assign({ id: doc.id }, stand)) === f ? ' an' : ''),
        style: 'background:' + f, title: 'Bandfarbe dieser Figur',
        onclick: () => { stand.farbe = f; farbenZeichnen(); merke(); }
      }));
    }
    farbreihe.append(el('button', { class: 'albb-farbe zufall', title: 'Wieder die Farbe, die VANI vergibt', onclick: () => { stand.farbe = ''; farbenZeichnen(); merke(); } }, '↺'));
  };

  /* --- Gruppenreiter --- */
  const reiter = el('div', { class: 'albb-reiter' });
  const inhalt = el('div', { class: 'albb-inhalt' });
  const reiterZeichnen = () => {
    reiter.innerHTML = '';
    for (const [id, name] of ALBUM_GRUPPEN) {
      const n = ALBUM_FELDER.filter((f) => f.gruppe === id).filter((f) => {
        const w = stand.felder[f.id];
        return w != null && (Array.isArray(w) ? w.length : String(w).trim());
      }).length + stand.eigene.filter((e) => e.gruppe === id).length;
      reiter.append(el('button', { class: 'albb-reiterknopf' + (gruppe === id ? ' an' : ''), onclick: () => { gruppe = id; reiterZeichnen(); inhaltZeichnen(); inhalt.scrollTop = 0; } },
        name, n ? el('i', {}, String(n)) : null));
    }
    reiter.append(el('button', { class: 'albb-reiterknopf' + (gruppe === 'zettel' ? ' an' : ''), onclick: () => { gruppe = 'zettel'; reiterZeichnen(); inhaltZeichnen(); inhalt.scrollTop = 0; } },
      'Klebezettel', stand.zettel.length ? el('i', {}, String(stand.zettel.length)) : null));
  };

  /* --- Der Inhalt je Gruppe --- */
  const inhaltZeichnen = () => {
    inhalt.innerHTML = '';
    if (gruppe === 'zettel') { inhalt.append(albumZettelBearbeiten(stand, merke)); return; }
    for (const feld of ALBUM_FELDER.filter((f) => f.gruppe === gruppe)) {
      inhalt.append(albumFeldEingabe(feld, stand, doc, merke));
    }
    /* Eigene Kategorien dieser Gruppe */
    const eigene = stand.eigene.filter((e) => (e.gruppe || 'rand') === gruppe);
    for (const e of eigene) {
      inhalt.append(el('div', { class: 'albb-feld eigen' },
        el('div', { class: 'albb-feldkopf' },
          el('span', { class: 'albb-feldname' }, e.name),
          el('button', { class: 'albb-weg', title: 'Diese eigene Kategorie wegnehmen', onclick: () => { stand.eigene = stand.eigene.filter((x) => x !== e); inhaltZeichnen(); reiterZeichnen(); merke(); } }, '×')),
        (() => { const t = el('input', { type: 'text', value: e.wert, maxlength: '1200' }); t.addEventListener('input', () => { e.wert = t.value; merke(); }); return t; })()));
    }
    inhalt.append(el('button', { class: 'albb-eigenneu', onclick: async () => {
      const name = await eingabe({ titel: 'Eine eigene Kategorie', platzhalter: 'z. B. „Lieblingswort", „Wie sie flucht", „Was im Rucksack ist"', ok: 'Anlegen' });
      if (!name || !name.trim()) return;
      stand.eigene.push({ name: name.trim().slice(0, 80), wert: '', gruppe });
      inhaltZeichnen(); reiterZeichnen(); merke();
      setTimeout(() => { const felder = inhalt.querySelectorAll('.albb-feld.eigen input'); const l = felder[felder.length - 1]; if (l) l.focus(); }, 40);
    } }, '+ Eigene Kategorie hier'));
  };

  /* --- Der Impuls: was fehlt noch? --- */
  const impuls = el('div', { class: 'albb-impuls' });
  const impulsZeichnen = () => {
    impuls.innerHTML = '';
    const fehlt = albumFehlt(stand, albumHash(doc.id, String(Math.floor(Date.now() / 60000))));
    if (!fehlt) { anfuegen(impuls, el('span', {}, 'Alles ausgefüllt. Das muss nicht sein — aber es ist schön.')); return; }
    anfuegen(impuls,
      el('span', {}, 'Noch offen: '),
      el('button', { class: 'albb-impulsknopf', onclick: () => { gruppe = fehlt.gruppe; reiterZeichnen(); inhaltZeichnen(); setTimeout(() => { const z = inhalt.querySelector('[data-feld="' + fehlt.id + '"] input, [data-feld="' + fehlt.id + '"] textarea'); if (z) { z.focus(); z.scrollIntoView({ block: 'center' }); } }, 40); } },
        albumBeschriftung(fehlt.name, stand.name)),
      el('button', { class: 'albb-impulswuerfel', title: 'Etwas anderes vorschlagen', onclick: impulsZeichnen }, '↻'));
  };

  const kasten = el('div', { class: 'modal albb-blatt' },
    el('div', { class: 'kartenkopf' }, frisch ? 'EINE NEUE FIGUR' : 'DIESE FIGUR'),
    el('div', { class: 'albb-kopf' }, namensfeld, farbreihe),
    namenshall,
    reiter,
    impuls,
    inhalt,
    el('div', { class: 'reihe albb-fuss' },
      el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (await frage((stand.name ? '„' + stand.name + '“' : 'Diese Figur') + ' aus dem Album nehmen?', { ja: 'Herausnehmen' })) {
          sichern.sofort();
          await loesche(doc.id);
          zu(); if (danach) danach();
        }
      } }, 'Aus dem Album nehmen'),
      el('button', { class: 'knopf zart', title: 'Alles zu dieser Figur als Blatt ablegen — zum Weiterschreiben', onclick: () => { albumAlsBlatt(stand, doc); } }, 'Als Blatt ablegen'),
      el('button', { class: 'knopf voll', onclick: () => { sichern.sofort(); zu(); if (danach) danach(); } }, 'Fertig')));
  const zu = zeigeDeck(kasten, () => { sichern.sofort(); if (danach) danach(); });

  kopfzeileAuffrischen(); farbenZeichnen(); reiterZeichnen(); inhaltZeichnen(); impulsZeichnen();
  setTimeout(() => { if (frisch) namensfeld.focus(); }, 60);
}

/* ----- Ein einzelnes Feld ----- */
function albumFeldEingabe(feld, stand, doc, merke) {
  const name = albumBeschriftung(feld.name, stand.name);
  const platz = albumBeschriftung(feld.platz || '', stand.name);
  const kasten = el('div', { class: 'albb-feld', 'data-feld': feld.id });
  kasten.append(el('div', { class: 'albb-feldkopf' }, el('span', { class: 'albb-feldname' }, name)));
  if (feld.hilfe) kasten.append(el('small', { class: 'albb-hilfe' }, feld.hilfe));

  /* Wortschatz-Feld: große Auswahl plus eigene */
  if (feld.wortschatz) {
    const gewaehlt = () => stand.felder[feld.id] || [];
    const reihe = el('div', { class: 'albb-gewaehlt' });
    const zeichneReihe = () => {
      reihe.innerHTML = '';
      const w = gewaehlt();
      if (!w.length) { reihe.append(el('span', { class: 'albb-leer' }, 'Noch nichts gewählt.')); return; }
      for (const wort of w) {
        reihe.append(el('span', { class: 'albb-chip' }, wort,
          el('button', { title: 'Wieder wegnehmen', onclick: () => { stand.felder[feld.id] = gewaehlt().filter((x) => x !== wort); if (!stand.felder[feld.id].length) delete stand.felder[feld.id]; zeichneReihe(); merke(); } }, '×')));
      }
    };
    zeichneReihe();
    kasten.append(reihe, el('button', { class: 'albb-waehlen', onclick: () => albumWortschatz(gewaehlt(), (neu) => {
      if (neu.length) stand.felder[feld.id] = neu; else delete stand.felder[feld.id];
      zeichneReihe(); merke();
    }) }, 'Aus dem Wortschatz wählen  ·  ' + ALBUM_WESEN_ALLE.length + ' Wörter'));
    return kasten;
  }

  /* Offene Fäden: Liste mit Haken davor */
  if (feld.form === 'faeden') {
    const liste = el('div', { class: 'albb-mehrliste' });
    const eintraege = () => stand.felder[feld.id] || [];
    const zeichne = () => {
      liste.innerHTML = '';
      const w = eintraege();
      w.forEach((eintrag, i) => {
        const erledigt = albumFadenErledigt(eintrag);
        const t = el('input', { type: 'text', value: albumFadenText(eintrag), maxlength: '600', placeholder: 'Was ist hier angelegt?' });
        t.addEventListener('input', () => { const a2 = eintraege().slice(); a2[i] = albumFadenSetzen(t.value, erledigt); stand.felder[feld.id] = a2; merke(); });
        liste.append(el('div', { class: 'albb-fadenzeile' + (erledigt ? ' erledigt' : '') },
          el('button', { class: 'albb-fadenhaken' + (erledigt ? ' an' : ''), title: erledigt ? 'Wieder als offen führen' : 'Als eingelöst abhaken',
            onclick: () => { const a2 = eintraege().slice(); a2[i] = albumFadenSetzen(a2[i], !erledigt); stand.felder[feld.id] = a2; zeichne(); merke(); } }, erledigt ? '✓' : ''),
          t,
          el('button', { class: 'albb-weg', title: 'Weg damit', onclick: () => { const a2 = eintraege().filter((_, j) => j !== i); if (a2.length) stand.felder[feld.id] = a2; else delete stand.felder[feld.id]; zeichne(); merke(); } }, '×')));
      });
      if (!w.length) liste.append(el('div', { class: 'albb-leer' }, 'Noch nichts angelegt.'));
      const offen = w.filter((x) => !albumFadenErledigt(x)).length;
      if (w.length) liste.append(el('div', { class: 'albb-fadenstand' }, offen ? offen + (offen === 1 ? ' Faden ist noch offen.' : ' Fäden sind noch offen.') : 'Alle eingelöst.'));
    };
    zeichne();
    kasten.append(liste, el('button', { class: 'albb-dazu', onclick: () => {
      stand.felder[feld.id] = [...eintraege(), ''];
      zeichne(); merke();
      const felder = liste.querySelectorAll('input'); const l = felder[felder.length - 1]; if (l) l.focus();
    } }, '+ Faden'));
    return kasten;
  }

  /* Mehrfach: Liste mit Hinzufügen */
  if (feld.mehrfach) {
    const liste = el('div', { class: 'albb-mehrliste' });
    const feldEintraege = () => stand.felder[feld.id] || [];
    const zeichne = () => {
      liste.innerHTML = '';
      const w = feldEintraege();
      w.forEach((eintrag, i) => {
        const t = el('input', { type: 'text', value: eintrag, maxlength: '600' });
        t.addEventListener('input', () => { const a = feldEintraege().slice(); a[i] = t.value; stand.felder[feld.id] = a; merke(); });
        liste.append(el('div', { class: 'albb-mehrzeile' }, t,
          el('button', { class: 'albb-weg', title: 'Weg damit', onclick: () => { const a = feldEintraege().filter((_, j) => j !== i); if (a.length) stand.felder[feld.id] = a; else delete stand.felder[feld.id]; zeichne(); merke(); } }, '×')));
      });
      if (!w.length) liste.append(el('div', { class: 'albb-leer' }, 'Noch nichts eingetragen.'));
    };
    zeichne();
    const dazu = () => {
      stand.felder[feld.id] = [...feldEintraege(), ''];
      zeichne(); merke();
      const felder = liste.querySelectorAll('input'); const l = felder[felder.length - 1]; if (l) l.focus();
    };
    kasten.append(liste);
    /* Verweise: aus dem Album und aus dem Salon vorschlagen */
    if (feld.verweis) {
      const vorschlaege = albumVorschlaege();
      const dl = el('datalist', { id: 'albb-verweise' }, ...vorschlaege.slice(0, 300).map((n) => el('option', { value: n })));
      kasten.append(dl);
      liste.querySelectorAll('input').forEach((i) => i.setAttribute('list', 'albb-verweise'));
      kasten.append(el('small', { class: 'albb-hilfe' }, 'Wer schon im Album steht, wird erkannt und verlinkt. Schreib die Rolle davor: „Mutter — Ilva".'));
    }
    kasten.append(el('button', { class: 'albb-dazu', onclick: dazu }, '+ ' + (platz || 'Dazu')));
    return kasten;
  }

  /* Datum */
  if (feld.art === 'datum') {
    const t = el('input', { type: 'text', class: 'albb-datum', value: stand.felder[feld.id] || '', placeholder: 'JJJJ-MM-TT — oder nur JJJJ', maxlength: '10' });
    const hinweis = el('small', { class: 'albb-datumhinweis' });
    const pruefe = () => {
      const v = t.value.trim();
      hinweis.innerHTML = '';
      if (!v) { delete stand.felder[feld.id]; t.classList.remove('falsch'); merke(); return; }
      if (typeof kalGueltig === 'function' && kalGueltig(v)) {
        t.classList.remove('falsch');
        stand.felder[feld.id] = v;
        anfuegen(hinweis, el('span', {}, kalLesbar(v, true) + ' — steht damit auch im Kalender.'));
        merke();
      } else {
        t.classList.add('falsch');
        anfuegen(hinweis, el('span', { class: 'warn' }, 'So kann VANI das Datum nicht lesen. Zwischen ' + KAL_JAHR_VON + ' und ' + KAL_JAHR_BIS + ', z. B. 2011-04-09.'));
      }
    };
    t.addEventListener('input', pruefe);
    kasten.append(t, hinweis);
    if (stand.felder[feld.id]) pruefe();
    return kasten;
  }

  /* Notizfeld */
  if (feld.form === 'notizfeld') {
    const t = el('textarea', { class: 'albb-notizfeld', rows: '7', placeholder: platz, maxlength: '20000' }, stand.felder[feld.id] || '');
    t.addEventListener('input', () => { const v = t.value; if (v.trim()) stand.felder[feld.id] = v; else delete stand.felder[feld.id]; merke(); });
    kasten.append(t);
    return kasten;
  }

  /* Einfaches Feld */
  const t = el('input', { type: 'text', value: stand.felder[feld.id] || '', placeholder: platz, maxlength: '1200' });
  t.addEventListener('input', () => { const v = t.value; if (v.trim()) stand.felder[feld.id] = v; else delete stand.felder[feld.id]; merke(); });
  kasten.append(t);
  return kasten;
}

/* Wen man verlinken kann: alle Figuren im Album und alle Stimmen im Salon. */
function albumVorschlaege() {
  const raus = albumFiguren().map((f) => f.name).filter(Boolean);
  if (typeof SALON_FEST !== 'undefined') for (const a of SALON_FEST) raus.push(a.name);
  for (const d of D.docs.values()) if (d.typ === 'figur' && !d.geloescht && d.titel) raus.push(d.titel);
  return [...new Set(raus)];
}

/* ----- Der Wortschatz ----- */
function albumWortschatz(gewaehlt, fertig) {
  let wahl = [...gewaehlt];
  const eigene = albumEigeneWorte();
  const suchfeld = el('input', { type: 'search', class: 'albw-suche', placeholder: 'Suchen — oder ein eigenes Wort schreiben und Enter' });
  const gitter = el('div', { class: 'albw-gitter' });
  const gewaehltReihe = el('div', { class: 'albw-gewaehlt' });

  const zeigeGewaehlt = () => {
    gewaehltReihe.innerHTML = '';
    if (!wahl.length) { gewaehltReihe.append(el('span', { class: 'albb-leer' }, 'Noch nichts gewählt.')); return; }
    for (const w of wahl) gewaehltReihe.append(el('span', { class: 'albb-chip' }, w,
      el('button', { onclick: () => { wahl = wahl.filter((x) => x !== w); zeigeGewaehlt(); zeichne(); } }, '×')));
  };
  const umschalten = (w) => { wahl = wahl.includes(w) ? wahl.filter((x) => x !== w) : [...wahl, w]; zeigeGewaehlt(); zeichne(); };
  const zeichne = () => {
    const q = suchfeld.value.trim().toLowerCase();
    gitter.innerHTML = '';
    const gruppen = q
      ? [['treffer', 'Treffer', [...ALBUM_WESEN_ALLE, ...eigene].filter((w) => w.toLowerCase().includes(q))]]
      : [...ALBUM_WESEN, ...(eigene.length ? [['eigene', 'Deine eigenen', eigene]] : [])];
    for (const [id, name, worte] of gruppen) {
      if (!worte.length) continue;
      gitter.append(el('div', { class: 'albw-gruppe' }, name));
      const reihe = el('div', { class: 'albw-worte' });
      for (const w of worte) reihe.append(el('button', { class: 'albw-wort' + (wahl.includes(w) ? ' an' : ''), onclick: () => umschalten(w) }, w));
      gitter.append(reihe);
    }
    if (!gitter.children.length) gitter.append(el('div', { class: 'albb-leer' }, 'Kein Wort passt. Schreib es und drück Enter — dann gehört es dir.'));
  };
  suchfeld.addEventListener('input', zeichne);
  suchfeld.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return;
    ev.preventDefault();
    const w = suchfeld.value.trim();
    if (!w) return;
    if (!ALBUM_WESEN_ALLE.includes(w) && !eigene.includes(w)) { albumWortMerken(w); eigene.push(w); }
    if (!wahl.includes(w)) wahl.push(w);
    suchfeld.value = ''; zeigeGewaehlt(); zeichne();
  });

  const kasten = el('div', { class: 'modal albw-fenster' },
    el('div', { class: 'kartenkopf' }, 'WESENSZÜGE'),
    el('p', { class: 'albb-hilfe' }, 'Nimm so viele du willst. Was du selbst schreibst, merkt sich VANI und schlägt es bei der nächsten Figur mit vor.'),
    suchfeld, gewaehltReihe, gitter,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => { zu(); fertig(wahl); } }, 'Übernehmen')));
  const zu = zeigeDeck(kasten);
  zeigeGewaehlt(); zeichne();
  setTimeout(() => suchfeld.focus(), 60);
}
/* Eigene Wörter liegen bei den Einstellungen — sie gehören allen Figuren. */
function albumEigeneWorte() {
  const w = D.einst.albumWorte;
  return Array.isArray(w) ? w.filter((x) => typeof x === 'string' && x.trim()).slice(0, 400) : [];
}
function albumWortMerken(wort) {
  const w = albumEigeneWorte();
  if (w.includes(wort)) return;
  D.einst.albumWorte = [...w, String(wort).slice(0, 60)].slice(-400);
  speichereEinst();
}

/* ----- Die Klebezettel ----- */
function albumZettelBearbeiten(stand, merke) {
  const kasten = el('div', { class: 'albb-zettelraum' });
  const zeichne = () => {
    kasten.innerHTML = '';
    kasten.append(el('small', { class: 'albb-hilfe' }, 'Bis zu ' + ALBUM_ZETTEL_MAX + ' Zettel. Sie kleben unten rechts auf der Doppelseite, ordentlich nebeneinander — nicht kreuz und quer.'));
    const brett = el('div', { class: 'albb-zettelgitter' });
    stand.zettel.forEach((z, i) => {
      const t = el('textarea', { rows: '3', maxlength: '400', placeholder: 'Was noch dazugehört …' }, z.text);
      t.addEventListener('input', () => { z.text = t.value; merke(); });
      const toene = el('div', { class: 'albb-toene' });
      for (const ton of ALBUM_ZETTELTOENE) {
        toene.append(el('button', { class: 'albb-ton ton-' + ton + (z.ton === ton ? ' an' : ''), title: 'Farbe des Zettels', onclick: () => { z.ton = ton; zeichne(); merke(); } }));
      }
      brett.append(el('div', { class: 'albb-zettel ton-' + (z.ton || 'butter') }, t, toene,
        el('button', { class: 'albb-weg', title: 'Zettel abnehmen', onclick: () => { stand.zettel.splice(i, 1); zeichne(); merke(); } }, '×')));
    });
    kasten.append(brett);
    if (stand.zettel.length < ALBUM_ZETTEL_MAX) {
      kasten.append(el('button', { class: 'albb-dazu', onclick: () => {
        stand.zettel.push({ text: '', ton: ALBUM_ZETTELTOENE[stand.zettel.length % ALBUM_ZETTELTOENE.length] });
        zeichne(); merke();
        const alle = kasten.querySelectorAll('textarea'); const l = alle[alle.length - 1]; if (l) l.focus();
      } }, '+ Zettel  ·  noch ' + (ALBUM_ZETTEL_MAX - stand.zettel.length) + ' frei'));
    } else {
      kasten.append(el('div', { class: 'albb-leer' }, 'Alle ' + ALBUM_ZETTEL_MAX + ' Zettel kleben. Nimm einen ab, wenn ein neuer soll.'));
    }
  };
  zeichne();
  return kasten;
}

/* ----- Die Figur als Blatt ablegen ----- */
function albumAlsBlatt(stand, doc) {
  const zeilen = [];
  const name = stand.name || 'Ohne Namen';
  zeilen.push(name);
  const alter = albumAlterText(Object.assign({ id: doc.id }, stand));
  if (alter) zeilen.push(alter);
  zeilen.push('');
  for (const [gid, gname] of ALBUM_GRUPPEN) {
    const stuecke = albumStuecke(Object.assign({ id: doc.id }, stand)).filter((s) => s.feld.gruppe === gid);
    if (!stuecke.length) continue;
    zeilen.push(gname.toUpperCase());
    for (const s of stuecke) {
      const w = Array.isArray(s.wert) ? s.wert.join(', ') : s.wert;
      zeilen.push(albumBeschriftung(s.feld.name, name) + ': ' + w);
    }
    zeilen.push('');
  }
  if (stand.zettel.length) {
    zeilen.push('ZETTEL');
    for (const z of stand.zettel) zeilen.push('· ' + z.text);
  }
  const b = blattAusText(name + ' — aus dem Album', zeilen.join('\n').trim());
  toast('Liegt bei den Blättern. Jetzt kannst du daraus schreiben.', 4200);
  return b;
}

/* ----- Eine Figur mit vorgegebenem Namen anlegen -----
   Aus der Übersicht heraus: „Halvar wird genannt, wohnt aber noch nicht hier." */
function albumNeueFigurMitNamen(name, danach) {
  const doc = neuDoc('albumfigur', { name: String(name || '').slice(0, 120), titel: String(name || '').slice(0, 120), felder: {}, eigene: [], zettel: [], farbe: '' });
  albumBearbeiten(doc, () => { if (danach) danach(doc.id); }, true);
}

/* ----- Das Bildnis ----- */
function albumBildWaehlen(figur, danach) {
  const hat = albumHatBild(figur);
  const kasten = el('div', { class: 'modal albbild-fenster' },
    el('div', { class: 'kartenkopf' }, 'DAS BILDNIS'),
    el('p', { class: 'albb-hilfe' }, 'Ein Foto vom Gerät, oder selbst gezeichnet. Beides darf auch wegbleiben — dann stehen dort die Anfangsbuchstaben, und das sieht aus, als wäre es so gemeint.'),
    el('div', { class: 'albbild-wahl' },
      el('button', { class: 'albbild-knopf', onclick: async () => {
        zu();
        const id = typeof waehleBild === 'function' ? await waehleBild() : null;
        if (!id) return;
        figur.bild = id;
        delete figur.striche;
        speichere(figur);
        toast('Das Bildnis hängt.');
        if (danach) danach();
      } }, el('b', {}, 'Ein Foto'), el('small', {}, 'vom Gerät — bleibt hier, geht nirgendwohin')),
      el('button', { class: 'albbild-knopf', onclick: () => { zu(); albumBildnisMalen(figur, danach); } },
        el('b', {}, 'Selbst zeichnen'), el('small', {}, 'ein paar Striche genügen'))),
    hat ? el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart gefahr', onclick: () => { delete figur.bild; delete figur.striche; speichere(figur); zu(); toast('Wieder die Anfangsbuchstaben.'); if (danach) danach(); } }, 'Bildnis abnehmen'),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'))
      : el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen')));
  const zu = zeigeDeck(kasten);
}

/* Ein Bildnis zeichnen — größer und ruhiger als das kleine Kalenderzeichen. */
function albumBildnisMalen(figur, danach) {
  const groesse = 320;
  const leinwand = el('canvas', { class: 'albbild-pad', width: String(groesse), height: String(groesse) });
  const ctx = leinwand.getContext('2d');
  let striche = Array.isArray(figur.striche) ? figur.striche.map((s) => s.slice()) : [];
  let aktuell = null;
  const male = () => {
    ctx.clearRect(0, 0, groesse, groesse);
    /* Ein zarter Hilfsrahmen: Kopf sitzt meist im oberen Drittel */
    ctx.strokeStyle = 'rgba(160,140,110,.2)'; ctx.lineWidth = 1;
    ctx.strokeRect(groesse * .14, groesse * .1, groesse * .72, groesse * .8);
    ctx.beginPath(); ctx.ellipse(groesse / 2, groesse * .38, groesse * .2, groesse * .25, 0, 0, 6.29); ctx.stroke();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--tinte') || '#3a2f26';
    ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const st of [...striche, aktuell].filter(Boolean)) {
      if (st.length < 2) continue;
      ctx.beginPath(); ctx.moveTo(st[0][0] * groesse, st[0][1] * groesse);
      for (const [x, y] of st.slice(1)) ctx.lineTo(x * groesse, y * groesse);
      ctx.stroke();
    }
  };
  const punkt = (ev) => { const r = leinwand.getBoundingClientRect(); return [begrenze((ev.clientX - r.left) / r.width, 0, 1, .5), begrenze((ev.clientY - r.top) / r.height, 0, 1, .5)]; };
  leinwand.addEventListener('pointerdown', (ev) => { ev.preventDefault(); leinwand.setPointerCapture(ev.pointerId); aktuell = [punkt(ev)]; male(); });
  leinwand.addEventListener('pointermove', (ev) => { if (!aktuell) return; const p = punkt(ev); const l = aktuell[aktuell.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > .008) { aktuell.push(p); male(); } });
  const auf = () => { if (aktuell && aktuell.length > 1) striche.push(aktuell); aktuell = null; male(); };
  leinwand.addEventListener('pointerup', auf); leinwand.addEventListener('pointercancel', auf);

  const kasten = el('div', { class: 'modal albbild-malen' },
    el('div', { class: 'kartenkopf' }, 'EIN BILDNIS ZEICHNEN'),
    el('p', { class: 'albb-hilfe' }, 'Ein paar Striche genügen. Es muss niemanden treffen — es muss dich nur erinnern.'),
    leinwand,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { striche = []; aktuell = null; male(); } }, 'Noch einmal'),
      el('button', { class: 'knopf zart', onclick: () => { if (striche.length) { striche.pop(); male(); } } }, 'Letzter Strich weg'),
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => {
        const sauber = saubereStricheEinfach(striche);
        if (!sauber.length) { toast('Da ist noch nichts gezeichnet.'); return; }
        figur.striche = sauber;
        delete figur.bild;
        speichere(figur);
        zu(); toast('Das Bildnis hängt.');
        if (danach) danach();
      } }, 'So bleibt es')));
  const zu = zeigeDeck(kasten);
  male();
}

/* ----- Die Karte in den Feinheiten ----- */
function albumKarte() {
  const zeile = (name, unter, s) => el('div', { class: 'einstellzeile' },
    el('span', { class: 'ename' }, name, unter ? el('div', { style: 'font-size:12.5px;color:var(--blass)' }, unter) : null), s);
  const schalter = (lies, setze) => el('button', { class: 'schalter' + (lies() ? ' an' : ''), onclick: (e) => { setze(!lies()); e.currentTarget.classList.toggle('an', lies()); speichereEinst(); } }, el('i'));
  const worte = albumEigeneWorte();
  return el('div', { class: 'karte' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('album') }), 'DAS ALBUM'),
    zeile('Bildnisse zeigen',
      'Auf der linken Seite jeder Figur ein gerahmtes Bildnis — Foto oder selbst gezeichnet. Standardmäßig aus: solange keins dasteht, darf die Figur aussehen, wie sie in deinem Kopf gerade aussieht.',
      schalter(() => albumBildnisAn(), (v) => { D.einst.albumBildnis = v; })),
    worte.length ? zeile('Deine eigenen Wesenswörter', worte.length + (worte.length === 1 ? ' Wort' : ' Wörter') + ', die du selbst geschrieben hast: ' + worte.slice(-8).join(', ') + (worte.length > 8 ? ' …' : ''),
      el('button', { class: 'knopf zart', onclick: async () => {
        if (await frage('Alle selbst geschriebenen Wesenswörter vergessen? Die Wörter bleiben bei den Figuren stehen, sie werden nur nicht mehr vorgeschlagen.', { ja: 'Vergessen' })) {
          D.einst.albumWorte = []; speichereEinst(); toast('Vergessen.'); zeichne();
        }
      } }, 'Vergessen')) : null,
    el('div', { class: 'einstellzeile' },
      el('span', { class: 'ename' }, 'Alle Figuren', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Die Übersicht mit offenen Fäden und Namen, die noch nicht im Album wohnen.')),
      el('button', { class: 'knopf zart', onclick: () => albumRegal() }, 'Übersicht')));
}
