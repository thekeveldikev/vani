/* ================================================================
   VANI — Klang: echte Aufnahmen und gewebte Klänge, ein Mischpult
   ================================================================ */

function klangStatuszeile() {
  const status = el('div', { class: 'klangstatus', role: 'status' });
  const neu = () => {
    const z = audioZustand();
    status.className = 'klangstatus ' + (z.ok ? 'laeuft' : z.fehler ? 'fehler' : 'bereit');
    status.textContent = !audioUnterstuetzt() ? 'Klang wird von diesem Browser nicht unterstützt.'
      : z.ok ? (ausklangLaeuft() ? 'Klang läuft — wird in ' + ausklangRestMinuten() + ' Min. leise.' : 'Klang läuft.')
      : z.state === 'suspended' || z.state === 'interrupted' ? 'Klang wartet auf eine Berührung.'
      : z.fehler ? 'Klang braucht einen Neustart: ' + z.fehler
      : 'Klang ist bereit.';
  };
  neu();
  return { knoten: status, neu };
}

/* ----- Reiter 1: echte Aufnahmen ----- */
function baueAmbiencePult(kompakt, statusNeu) {
  const wurzel = el('div', { class: 'ambience-pult' });
  const liste = el('div', { class: 'ambience-liste' });

  const zeileBauen = (a) => {
    const pegel = (D.einst.ambience || {})[a.id] || 0;
    const zeile = el('div', { class: 'ambience-zeile' + (pegel > 0 ? ' an' : ''), 'data-klang': a.id });
    const balken = el('i', { class: 'ambience-balken' });
    const stand = el('span', { class: 'ambience-stand' });
    const schieber = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round(pegel * 100)), 'aria-label': 'Lautstärke ' + a.name });

    const standNeu = async () => {
      if (a.eigen) { stand.textContent = 'eigen'; stand.className = 'ambience-stand da'; return; }
      const da = await ambienceImVorrat(a.id);
      stand.textContent = da ? 'im Gerät' : (a.mb ? a.mb.toFixed(1) + ' MB' : 'holen');
      stand.className = 'ambience-stand ' + (da ? 'da' : 'fehlt');
    };
    standNeu();

    const anAus = async (wert) => {
      const m = { ...(D.einst.ambience || {}) };
      if (wert > 0) m[a.id] = wert; else delete m[a.id];
      zeile.classList.toggle('an', wert > 0);
      zeile.classList.toggle('laedt', wert > 0 && !a.eigen);
      await audioFreigeben();
      const fehler = await ambienceMischungAnwenden(m, (id, p) => {
        if (id !== a.id) return;
        balken.style.width = Math.round(p * 100) + '%';
      });
      zeile.classList.remove('laedt');
      balken.style.width = '';
      const schief = fehler.find((f) => f.id === a.id);
      if (schief) { zeile.classList.remove('an'); schieber.value = '0'; toast(a.name + ': ' + schief.meldung, 4200); }
      standNeu();
      setTimeout(statusNeu, 150);
    };

    schieber.addEventListener('input', () => { zeile.classList.toggle('an', Number(schieber.value) > 0); });
    schieber.addEventListener('change', () => anAus(Number(schieber.value) / 100));
    schieber.addEventListener('pointerdown', () => { audioFreigeben().catch(() => {}); }, { once: true });

    const name = el('button', {
      class: 'ambience-name', onclick: () => {
        const jetzt = Number(schieber.value) / 100;
        const neu = jetzt > 0 ? 0 : .55;
        schieber.value = String(Math.round(neu * 100));
        anAus(neu);
      }
    }, el('span', { class: 'ambience-titel' }, a.name), stand);

    const feinKnopf = el('button', { class: 'ambience-fein-knopf', title: 'Feineinstellung', html: ik('feinheiten'), onclick: () => {
      const offen = zeile.classList.toggle('fein-offen');
      if (offen && !zeile.querySelector('.ambience-fein')) zeile.append(baueFeineinstellung(a, statusNeu));
    } });

    zeile.append(balken, name, schieber, feinKnopf);
    if (a.eigen) {
      langdruck(zeile, async () => {
        const wahl = await menue([
          { text: 'Umbenennen', icon: 'stift', wert: 'name' },
          { text: 'Aus den Klängen nehmen', icon: 'muell', wert: 'weg', rot: true }
        ], a.name);
        if (wahl === 'name') {
          const n = await eingabe({ titel: 'Der Klang heißt jetzt …', wert: a.name });
          if (n) { a.doc.titel = n; speichere(a.doc); zeichne(); }
        } else if (wahl === 'weg' && await frage('„' + a.name + '" entfernen? Die Aufnahme wird gelöscht.', { ja: 'Entfernen', gefahr: true })) {
          ambienceAus(a.id);
          const m = { ...(D.einst.ambience || {}) }; delete m[a.id];
          await ambienceMischungAnwenden(m);
          await loesche(a.doc.id, true);
          zeichne();
        }
      });
    }
    return zeile;
  };

  /* Der Fundus ist auf über sechzig Aufnahmen gewachsen. Ohne Suche scrollt man
     durch acht Blöcke, bis man den Regen findet. Das Feld liegt außerhalb von
     `liste`, damit es beim Neuaufbau den Eingabefokus behält. */
  let filter = '';
  const suche = el('input', {
    type: 'search', class: 'klang-suche', placeholder: 'Klang suchen — Regen, Meer, Café …',
    'aria-label': 'Klang suchen'
  });
  const zaehler = el('span', { class: 'klang-zaehler' });

  const baueListe = () => {
    liste.innerHTML = '';
    const alle = alleAmbiences();
    zaehler.textContent = alle.length ? alle.length + ' Aufnahmen' : '';
    if (!alle.length) {
      liste.append(el('div', { class: 'leer klein' }, 'Noch keine Aufnahmen da. Über „Eigenen Klang" holst du dir welche herein.'));
      return;
    }
    const treffer = !filter ? alle : alle.filter((a) =>
      (a.name || '').toLowerCase().includes(filter) || (a.kat || '').toLowerCase().includes(filter));
    if (!treffer.length) {
      liste.append(el('div', { class: 'leer klein' }, 'Nichts gefunden zu „' + suche.value.trim() + '".'));
      return;
    }
    if (filter) zaehler.textContent = treffer.length + ' von ' + alle.length;
    for (const kat of ambienceKategorien()) {
      const drin = treffer.filter((x) => x.kat === kat);
      if (!drin.length) continue;   /* leere Überschriften wären nur Lärm */
      const block = el('div', { class: 'klangblock' }, el('div', { class: 'kartenkopf', style: 'margin-top:14px' }, kat.toUpperCase()));
      for (const a of drin) block.append(zeileBauen(a));
      liste.append(block);
    }
  };
  suche.addEventListener('input', () => { filter = suche.value.trim().toLowerCase(); baueListe(); });
  suche.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !suche.value) return;
    e.stopPropagation();            /* sonst schließt Escape den ganzen Raum */
    suche.value = ''; filter = ''; baueListe();
  });
  baueListe();

  wurzel.append(el('div', { class: 'klang-suchzeile' }, suche, zaehler), liste);
  wurzel.baueListe = baueListe;
  return wurzel;
}

/* Feineinstellung je Aufnahme — das, was aus einem Loop eine Stimmung macht. */
function baueFeineinstellung(a, statusNeu) {
  const f = ambienceFeinheitVon(a.id);
  const kasten = el('div', { class: 'ambience-fein' });
  const regler = (name, schluessel, min, max, schritt, formatiere) => {
    const wert = el('span', { class: 'fein-wert' }, formatiere(f[schluessel]));
    const s = el('input', { type: 'range', min: String(min), max: String(max), step: String(schritt), value: String(f[schluessel]), 'aria-label': name });
    s.addEventListener('input', () => { wert.textContent = formatiere(Number(s.value)); });
    s.addEventListener('change', () => { ambienceFeinheitSetzen(a.id, { [schluessel]: Number(s.value) }); if (statusNeu) setTimeout(statusNeu, 120); });
    return el('div', { class: 'fein-zeile' }, el('span', { class: 'fein-name' }, name), s, wert);
  };
  kasten.append(
    regler('Tempo', 'tempo', .5, 2, .01, (v) => v === 1 ? 'normal' : (v < 1 ? 'langsamer ' : 'schneller ') + Math.round(Math.abs(1 - v) * 100) + '%'),
    regler('Klarheit', 'klarheit', 300, 20000, 100, (v) => v >= 19900 ? 'offen' : v < 1200 ? 'dumpf' : v < 5000 ? 'weich' : 'klar'),
    regler('Tiefe', 'tiefe', 20, 2000, 10, (v) => v <= 30 ? 'voll' : v < 200 ? 'schlank' : 'fern'),
    regler('Atmen', 'atmen', 0, 1, .05, (v) => v === 0 ? 'gleichmäßig' : v < .4 ? 'ruhig' : v < .75 ? 'lebendig' : 'unruhig'),
    regler('Übergang', 'blende', .5, 12, .5, (v) => v.toFixed(1) + ' s'),
    el('div', { class: 'fein-fuss' },
      el('button', { class: 'knopf zart', onclick: () => {
        ambienceFeinheitSetzen(a.id, { tempo: 1, klarheit: 20000, tiefe: 20, atmen: .35, blende: 4 });
        kasten.replaceWith(baueFeineinstellung(a, statusNeu));
      } }, 'Zurücksetzen'),
      a.quelle ? el('small', { class: 'ambience-quelle', title: a.quelle }, 'Aufnahme: BBC Sound Effects (privat, RemArc)') : null)
  );
  return kasten;
}

/* ----- Klangbilder: Mischungen mit Namen, an Orte gebunden ----- */
function baueKlangbilder(statusNeu, neuZeichnen) {
  const chips = el('div', { class: 'szenenchips' });
  for (const s of KLANG_SZENEN) {
    chips.append(el('button', { class: 'szenenchip gewebt', title: 'Gewebte Klänge', onclick: async () => {
      await audioFreigeben(); mischungAnwenden({ ...s.pegel }); if (neuZeichnen) neuZeichnen(); setTimeout(statusNeu, 150);
    } }, s.name));
  }
  for (const b of klangbilder()) {
    const anzahl = Array.isArray(b.orte) ? b.orte.length : 0;
    const chip = el('button', { class: 'szenenchip eigen', onclick: async () => {
      await audioFreigeben(); await klangbildAnwenden(b); if (neuZeichnen) neuZeichnen(); setTimeout(statusNeu, 200);
    } }, b.titel, anzahl ? el('small', {}, String(anzahl)) : null);
    langdruck(chip, async () => {
      const wahl = await menue([
        { text: 'Umbenennen', icon: 'stift', wert: 'name' },
        { text: 'Mit dem Jetzigen überschreiben', icon: 'wieder', wert: 'ueber' },
        { text: anzahl ? 'Bindungen lösen (' + anzahl + ')' : 'An einen Ort binden …', icon: 'verbinden', wert: anzahl ? 'los' : 'binden' },
        { text: 'Klangbild löschen', icon: 'muell', wert: 'weg', rot: true }
      ], b.titel);
      if (wahl === 'name') {
        const n = await eingabe({ titel: 'Das Klangbild heißt jetzt …', wert: b.titel });
        if (n) { b.titel = n; speichere(b); if (neuZeichnen) neuZeichnen(); }
      } else if (wahl === 'ueber') {
        b.pegel = { ...(D.einst.ambience || {}) };
        b.gewebt = { ...(D.einst.mischung || {}) };
        b.fein = JSON.parse(JSON.stringify(D.einst.ambienceFein || {}));
        b.lautstaerke = begrenze(D.einst.lautstaerke, 0, 1, .5);
        speichere(b); toast('„' + b.titel + '" merkt sich jetzt diese Mischung.');
      } else if (wahl === 'los') {
        b.orte = []; speichereStill(b); toast('Bindungen gelöst.'); if (neuZeichnen) neuZeichnen();
      } else if (wahl === 'binden') {
        const ziel = await waehleDokument(null, 'Woran soll „' + b.titel + '" hängen?');
        if (ziel) { klangbildBinden(b, ziel.id); toast('Hängt jetzt an „' + docName(ziel) + '".'); if (neuZeichnen) neuZeichnen(); }
      } else if (wahl === 'weg' && await frage('„' + b.titel + '" löschen?', { ja: 'Löschen', gefahr: true })) {
        await loesche(b.id, true); if (neuZeichnen) neuZeichnen();
      }
    });
    chips.append(chip);
  }
  chips.append(el('button', { class: 'szenenchip leiser', onclick: async () => {
    await ambienceAllesAus(); alleKlaengeAus(); if (neuZeichnen) neuZeichnen(); setTimeout(statusNeu, 150);
  } }, 'Stille'));
  return chips;
}

/* ----- Das ganze Pult ----- */
function baueMischpult(kompakt) {
  const wurzel = el('div', { class: 'mischpult' + (kompakt ? ' kompakt' : '') });
  const status = klangStatuszeile();
  const inhalt = el('div', { class: 'klang-inhalt' });
  const szenenhalter = el('div');

  let reiter = D.einst.klangReiter === 'gewebt' ? 'gewebt' : 'echt';
  const reiterleiste = el('div', { class: 'wahlgruppe klang-reiter' });
  const neuZeichnen = () => {
    szenenhalter.innerHTML = '';
    szenenhalter.append(el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'KLANGBILDER'),
      baueKlangbilder(status.neu, neuZeichnen));
    inhalt.innerHTML = '';
    inhalt.append(reiter === 'echt' ? baueAmbiencePult(kompakt, status.neu) : baueGewebtPult(kompakt, status.neu));
  };
  for (const [id, name] of [['echt', 'Aufnahmen'], ['gewebt', 'Gewebt']]) {
    reiterleiste.append(el('button', {
      class: reiter === id ? 'an' : '', onclick: (e) => {
        reiter = id; D.einst.klangReiter = id; speichereEinst();
        $$('button', reiterleiste).forEach((b) => b.classList.toggle('an', b === e.currentTarget));
        neuZeichnen();
      }
    }, name));
  }

  wurzel.append(status.knoten, reiterleiste, szenenhalter, inhalt, baueKlangFuss(status.neu, () => neuZeichnen()));
  neuZeichnen();
  return wurzel;
}

/* Reiter 2: die gewebten Klänge (gerechnet, ohne Datei) */
function baueGewebtPult(kompakt, statusNeu) {
  const halter = el('div', { class: 'gewebt-pult' });
  const misch = D.einst.mischung || {};
  for (const kat of KLANG_KATEGORIEN) {
    const block = el('div', { class: 'klangblock' });
    block.append(el('div', { class: 'kartenkopf', style: 'margin-top:14px' }, kat.toUpperCase()));
    for (const ebene of KLANG_EBENEN.filter((e) => e.kat === kat)) {
      const wert = misch[ebene.id] || 0;
      const schieber = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round(wert * 100)), 'aria-label': ebene.name });
      const zeile = el('div', { class: 'klangzeile' + (wert > 0 ? ' an' : '') },
        el('button', {
          class: 'klangname', onclick: async () => {
            const m = D.einst.mischung || {};
            if ((m[ebene.id] || 0) > 0) { delete m[ebene.id]; schieber.value = '0'; }
            else { m[ebene.id] = .5; schieber.value = '50'; await audioFreigeben(); }
            mischungAnwenden(m);
            zeile.classList.toggle('an', !!m[ebene.id]);
            setTimeout(statusNeu, 120);
          }
        }, ebene.name),
        schieber
      );
      schieber.addEventListener('input', () => {
        const m = D.einst.mischung || {};
        const v = parseInt(schieber.value, 10) / 100;
        if (v > 0) m[ebene.id] = v; else delete m[ebene.id];
        mischungAnwenden(m);
        zeile.classList.toggle('an', v > 0);
        setTimeout(statusNeu, 120);
      });
      schieber.addEventListener('pointerdown', () => { audioFreigeben().catch(() => {}); }, { once: true });
      block.append(zeile);
    }
    halter.append(block);
  }
  return halter;
}

/* Fuß: Gesamtlautstärke, Merken, Einschlafen, Vorrat, Prüfton */
function baueKlangFuss(statusNeu, neuZeichnen) {
  const laut = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round((D.einst.lautstaerke ?? .5) * 100)), 'aria-label': 'Gesamtlautstärke' });
  laut.addEventListener('input', () => { setzeLautstaerke(parseInt(laut.value, 10) / 100); statusNeu(); });

  const ausklangKnopf = el('button', { class: 'knopf' + (ausklangLaeuft() ? ' voll' : ''), onclick: async () => {
    if (ausklangLaeuft()) { ausklangStoppen(); toast('Einschlafen abgebrochen.'); neuZeichnen(); return; }
    const min = await menue([
      { text: 'In 15 Minuten', wert: 15 }, { text: 'In 30 Minuten', wert: 30 },
      { text: 'In 45 Minuten', wert: 45 }, { text: 'In einer Stunde', wert: 60 },
      { text: 'In zwei Stunden', wert: 120 }
    ], 'Langsam leiser werden und ausgehen');
    if (!min) return;
    ausklangStarten(min);
    toast('Der Klang wird in ' + min + ' Minuten leise. Schlaf gut.', 4200);
    neuZeichnen();
  } }, ausklangLaeuft() ? 'Einschlafen: noch ' + ausklangRestMinuten() + ' Min.' : 'Einschlafen …');

  const folgt = el('button', {
    class: 'schalter' + (D.einst.klangFolgt ? ' an' : ''), title: 'Klangbilder folgen dem Text',
    onclick: (e) => { D.einst.klangFolgt = !D.einst.klangFolgt; e.currentTarget.classList.toggle('an', D.einst.klangFolgt); speichereEinst(); }
  }, el('i'));

  return el('div', { class: 'klangfuss' },
    el('div', { class: 'klangzeile an', style: 'box-shadow:none' }, el('span', { class: 'klangname', style: 'font-weight:600' }, 'Gesamt'), laut),
    el('div', { class: 'einstellzeile klang-folgt' },
      el('span', { class: 'ename' }, 'Klangbilder folgen dem Text',
        el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Wenn ich eine Szene öffne, an der ein Klangbild hängt, legt es sich von selbst auf.')),
      folgt),
    el('div', { class: 'fussreihe' },
      el('button', { class: 'knopf voll', onclick: async () => {
        const name = await eingabe({ titel: 'Dieses Klangbild heißt …', platzhalter: 'z. B. Regen überm Schreibtisch' });
        if (!name) return;
        klangbildJetzt(name);
        toast('Gemerkt. Lange drücken, um es an eine Szene zu hängen.', 4200);
        neuZeichnen();
      } }, 'Klangbild merken'),
      el('button', { class: 'knopf', onclick: () => ambienceEigeneHinzufuegen().then((d) => { if (d) neuZeichnen(); }) }, '+ Eigener Klang'),
      ausklangKnopf,
      el('button', { class: 'knopf zart', onclick: async () => {
        if ((D.einst.lautstaerke || 0) <= 0) { setzeLautstaerke(.5); laut.value = '50'; }
        const ok = await audioFreigeben({ probe: true });
        toast(ok ? 'Du solltest jetzt einen hellen Prüfton hören.' : 'Der Klang ist noch gesperrt. Tippe auf „Klang neu wecken".');
        setTimeout(statusNeu, 120);
      } }, 'Ton prüfen'),
      el('button', { class: 'knopf zart', onclick: async () => {
        if (await audioFreigeben({ neu: true, probe: true })) toast('Klang frisch aufgeweckt.');
        else toast('Der Browser gibt den Klang gerade nicht frei.');
        setTimeout(statusNeu, 120);
      } }, 'Klang neu wecken'),
      el('button', { class: 'knopf zart', onclick: () => zeigeKlangVorrat(neuZeichnen) }, 'Vorrat …')
    )
  );
}

/* Der Vorrat: was liegt schon im Gerät, was fehlt noch */
async function zeigeKlangVorrat(neuZeichnen) {
  const stand = await ambienceVorratStand();
  const mb = (stand.bytes / 1048576).toFixed(1);
  const kasten = el('div', { class: 'modal' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('klang') }), 'KLANGVORRAT'),
    el('h2', {}, 'Was schon im Gerät liegt'),
    el('p', { style: 'font-size:14px;color:var(--blass);line-height:1.6' },
      stand.da.length + (stand.da.length === 1 ? ' Aufnahme liegt' : ' Aufnahmen liegen') + ' hier und brauchen kein Internet mehr (' + mb + ' MB). '
      + (stand.fehlt.length ? stand.fehlt.length + ' warten noch im Netz.' : 'Es fehlt nichts.')),
    el('div', { class: 'reihe', style: 'flex-wrap:wrap;justify-content:flex-start' },
      stand.fehlt.length ? el('button', { class: 'knopf voll', onclick: async () => {
        zu();
        toast('Hole ' + stand.fehlt.length + ' Aufnahmen …', 4000);
        let ok = 0;
        for (const id of stand.fehlt) { try { await ambienceBlob(id); ok++; } catch (e) {} }
        toast(ok + ' Aufnahmen liegen jetzt im Gerät. Ab jetzt auch offline.', 5000);
        if (neuZeichnen) neuZeichnen();
      } }, 'Alle holen (' + stand.fehlt.length + ')') : null,
      stand.bytes ? el('button', { class: 'knopf zart', onclick: async () => {
        if (!await frage('Alle geholten Aufnahmen aus dem Gerät nehmen? Sie lassen sich jederzeit wieder holen.', { ja: 'Platz schaffen', gefahr: true })) return;
        await ambienceAllesAus();
        const weg = await ambienceVorratLeeren();
        zu(); toast(weg + ' Aufnahmen entfernt.');
        if (neuZeichnen) neuZeichnen();
      } }, 'Platz schaffen') : null,
      el('button', { class: 'knopf', onclick: () => zu() }, 'Fertig')));
  const zu = zeigeDeck(kasten);
}

RENDER.klang = function (haupt) {
  haupt.append(raumkopf('Klang', 'echte Aufnahmen und gewebte Klänge — mischen erlaubt'));
  const inhalt = el('div', { class: 'inhalt' });
  inhalt.append(baueMischpult(false));
  haupt.append(inhalt);
};

/* Kompakte Fassung als Überlagerung (aus dem Schreibraum) */
function oeffneMischpult() {
  const kasten = el('div', { class: 'modal', style: 'width:min(620px,calc(100vw - 40px))' },
    el('h2', {}, 'Klang'),
    baueMischpult(true),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Fertig'))
  );
  const zu = zeigeDeck(kasten);
}
