/* ================================================================
   VANI — Wörter: eigene Kisten, Wortschatz & Funken
   ================================================================ */

const WORTKISTEN_FARBEN = ['#8f6a55', '#a9785f', '#8c7853', '#70806f', '#637984', '#746b87', '#8c6675', '#766c60'];

function wortkisten() {
  return vomTyp('wortkiste').slice(0, 5000).sort((a, b) =>
    String(a.titel || '').localeCompare(String(b.titel || ''), 'de', { sensitivity: 'base', numeric: true }) ||
    (a.angelegt || 0) - (b.angelegt || 0));
}

function wortZufallsgriff(liste, anzahl = 3, zufallsquelle = Math.random) {
  if (!Array.isArray(liste) || typeof zufallsquelle !== 'function') return [];
  const kopie = liste.slice(0, 100000);
  const n = Math.min(kopie.length, Math.max(0, Math.round(Number(anzahl) || 0)));
  for (let i = 0; i < n; i++) {
    const roh = Number(zufallsquelle());
    const z = Number.isFinite(roh) ? Math.max(0, Math.min(.999999999999, roh)) : 0;
    const j = i + Math.floor(z * (kopie.length - i));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie.slice(0, n);
}

function wortkisteGueltig(id) {
  if (id == null || id === 'lose') return null;
  const kiste = D.docs.get(String(id));
  return kiste && kiste.typ === 'wortkiste' ? kiste : false;
}

function wortlisteAusText(roherText) {
  if (typeof roherText !== 'string') return [];
  const gesehen = new Set();
  const ergebnis = [];
  /* Zeilen, Semikola und Kommata dürfen als schnelle Mehrfachzugabe dienen.
     Gedankenstriche und Leerzeichen bleiben Teil eines Ausdrucks. */
  for (const teil of roherText.slice(0, 200000).split(/[\n\r;,]+/)) {
    const wort = teil.replace(/\s+/g, ' ').trim().slice(0, 160);
    const schluessel = normalisiere(wort);
    if (!wort || !schluessel || gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    ergebnis.push(wort);
    if (ergebnis.length >= 500) break;
  }
  return ergebnis;
}

function woerterInKiste(kistenId = 'alle', suche = '', sortierung = 'az') {
  const q = normalisiere(String(suche || '').slice(0, 500));
  const kiste = wortkisteGueltig(kistenId);
  const bekannteKisten = new Set(wortkisten().map((d) => d.id));
  const ergebnis = vomTyp('wort').filter((w) => {
    const passtKiste = kistenId === 'alle' ? true
      : (kistenId === 'lose' || kistenId == null) ? !bekannteKisten.has(w.parent)
        : !!kiste && w.parent === kiste.id;
    return passtKiste && (!q || normalisiere([w.text, w.notiz].filter(Boolean).join(' ')).includes(q));
  });
  const zeit = (d) => Number.isFinite(d.geaendert) ? d.geaendert : (d.angelegt || 0);
  ergebnis.sort((a, b) => Number(!!b.favorit) - Number(!!a.favorit) || (
    sortierung === 'zuletzt' ? zeit(b) - zeit(a) :
      sortierung === 'aeltest' ? zeit(a) - zeit(b) :
        String(a.text || '').localeCompare(String(b.text || ''), 'de', { sensitivity: 'base', numeric: true })
  ) || String(a.id).localeCompare(String(b.id)));
  return ergebnis;
}

function fuegeWoerterHinzu(kistenId, roherText) {
  const kiste = wortkisteGueltig(kistenId);
  if (kistenId !== 'lose' && kistenId != null && !kiste) return { hinzu: [], uebersprungen: 0 };
  const parent = kiste ? kiste.id : null;
  const vorhanden = new Set(woerterInKiste(parent || 'lose').map((w) => normalisiere(w.text || '')));
  const hinzu = [], liste = wortlisteAusText(roherText);
  let uebersprungen = 0;
  for (const text of liste) {
    const schluessel = normalisiere(text);
    if (vorhanden.has(schluessel)) { uebersprungen++; continue; }
    vorhanden.add(schluessel);
    const felder = { text };
    if (parent) felder.parent = parent;
    hinzu.push(neuDoc('wort', felder));
  }
  return { hinzu, uebersprungen };
}

function wortInKiste(wort, kistenId, kopieren = false) {
  if (!wort || wort.typ !== 'wort' || !D.docs.has(wort.id)) return null;
  const kiste = wortkisteGueltig(kistenId);
  if (kistenId !== 'lose' && kistenId != null && !kiste) return null;
  const parent = kiste ? kiste.id : null;
  const doppelt = woerterInKiste(parent || 'lose').find((d) => d.id !== wort.id && normalisiere(d.text || '') === normalisiere(wort.text || ''));
  if (doppelt) return doppelt;
  if (!kopieren && (wort.parent || null) === parent) return wort;
  if (kopieren) {
    const felder = { text: wort.text || '' };
    if (wort.notiz) felder.notiz = wort.notiz;
    if (wort.favorit) felder.favorit = true;
    if (parent) felder.parent = parent;
    return neuDoc('wort', felder);
  }
  if (parent) wort.parent = parent; else delete wort.parent;
  speichere(wort);
  return wort;
}

async function loescheWortkiste(kistenId, samtInhalt = false, still = false) {
  const kiste = wortkisteGueltig(kistenId);
  if (!kiste) return false;
  await loesche(kiste.id, still, !samtInhalt);
  return true;
}

function wortkistenFormular(kiste) {
  return new Promise((resolve) => {
    const titel = el('input', { type: 'text', maxlength: '120', value: kiste ? kiste.titel || '' : '', placeholder: 'z. B. Synonyme' });
    const notiz = el('textarea', { rows: 3, maxlength: '600', placeholder: 'Wofür ist diese Kiste? (freiwillig)' });
    notiz.value = kiste ? kiste.notiz || '' : '';
    const farbe = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(kiste && kiste.farbe || '') ? kiste.farbe : WORTKISTEN_FARBEN[wortkisten().length % WORTKISTEN_FARBEN.length] });
    const meldung = el('div', { class: 'wortkisten-meldung', role: 'status' });
    let erledigt = false;
    const fertig = () => {
      const t = titel.value.replace(/\s+/g, ' ').trim();
      if (!t) { meldung.textContent = 'Die Kiste braucht einen Namen.'; titel.focus(); return; }
      if (wortkisten().some((d) => d.id !== (kiste && kiste.id) && normalisiere(d.titel || '') === normalisiere(t))) {
        meldung.textContent = 'Eine Kiste mit diesem Namen gibt es schon.'; titel.focus(); return;
      }
      erledigt = true; zu(); resolve({ titel: t.slice(0, 120), notiz: notiz.value.trim().slice(0, 600), farbe: farbe.value });
    };
    const kasten = el('div', { class: 'modal wortkisten-modal' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), kiste ? 'KISTE GESTALTEN' : 'NEUE WORTKISTE'),
      el('label', {}, el('span', {}, 'Name'), titel),
      el('label', {}, el('span', {}, 'Kleine Notiz'), notiz),
      el('label', { class: 'wortkisten-farbzeile' }, el('span', {}, 'Farbe'), farbe),
      meldung,
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => { zu(); } }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: fertig }, kiste ? 'Übernehmen' : 'Kiste bauen'))
    );
    const zu = zeigeDeck(kasten, () => { if (!erledigt) resolve(null); });
    titel.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); fertig(); } });
    setTimeout(() => titel.focus(), 60);
  });
}

function wortFormular(wort) {
  return new Promise((resolve) => {
    const text = el('input', { type: 'text', maxlength: '160', value: wort.text || '', placeholder: 'Wort oder Ausdruck' });
    const notiz = el('textarea', { rows: 4, maxlength: '1000', placeholder: 'Bedeutung, Synonyme, ein Beispielsatz …' });
    notiz.value = wort.notiz || '';
    const favorit = el('input', { type: 'checkbox', checked: !!wort.favorit });
    const meldung = el('div', { class: 'wortkisten-meldung', role: 'status' });
    let erledigt = false;
    const fertig = () => {
      const t = text.value.replace(/\s+/g, ' ').trim();
      if (!t) { meldung.textContent = 'Ganz ohne Wort geht es nicht.'; text.focus(); return; }
      erledigt = true; zu(); resolve({ text: t.slice(0, 160), notiz: notiz.value.trim().slice(0, 1000), favorit: favorit.checked });
    };
    const kasten = el('div', { class: 'modal wortkisten-modal' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('stift') }), 'WORTZETTEL'),
      el('label', {}, el('span', {}, 'Wort oder Ausdruck'), text),
      el('label', {}, el('span', {}, 'Notiz'), notiz),
      el('label', { class: 'wort-favorit' }, favorit, el('span', {}, 'Oben anheften')),
      meldung,
      el('div', { class: 'reihe' },
        el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
        el('button', { class: 'knopf voll', onclick: fertig }, 'Übernehmen'))
    );
    const zu = zeigeDeck(kasten, () => { if (!erledigt) resolve(null); });
    setTimeout(() => text.focus(), 60);
  });
}

RENDER.woerter = function (haupt) {
  haupt.append(raumkopf('Wörter'));
  const inhalt = el('div', { class: 'inhalt woerter-raum' });
  let aktiveKiste = 'alle';
  let suche = '';
  let sortierung = 'az';
  let griff = [];

  const kopf = el('div', { class: 'karte wortkisten-kopf' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('woerter') }), 'DEINE WORTKISTEN'),
    el('p', {}, 'Baue dir kleine Sammlungen: Synonyme, Lieblingsverben, Figurenwörter, Wörter für einen Vibe — oder etwas, das nur du verstehst.'),
    el('div', { class: 'fussreihe' },
      el('button', { class: 'knopf voll', onclick: async () => {
        if (wortkisten().length >= 200) { toast('Zweihundert Kisten sind genug für einen sehr großen Schrank.'); return; }
        const daten = await wortkistenFormular(null);
        if (!daten) return;
        const kiste = neuDoc('wortkiste', daten);
        aktiveKiste = kiste.id; baueAlles(); toast('Die neue Kiste steht bereit.');
      } }, '＋ Neue Kiste'))
  );

  const schrank = el('div', { class: 'wortkisten-schrank', 'aria-label': 'Wortkisten' });
  const arbeitskarte = el('div', { class: 'karte wortkisten-arbeit' });

  function kistenName(id) {
    if (id === 'alle') return 'Alle Wörter';
    if (id === 'lose') return 'Lose Wörter';
    const k = wortkisteGueltig(id);
    return k ? k.titel || 'Wortkiste' : 'Alle Wörter';
  }

  async function kistenMenue(kiste) {
    const wahl = await menue([
      { text: 'Name, Notiz & Farbe ändern', icon: 'stift', wert: 'edit' },
      { text: 'Nur Kiste löschen · Wörter bleiben lose', icon: 'drehen', wert: 'loese', rot: true },
      { text: 'Kiste und ihre Wörter löschen', icon: 'muell', wert: 'alles', rot: true }
    ], kiste.titel || 'Wortkiste');
    if (wahl === 'edit') {
      const daten = await wortkistenFormular(kiste);
      if (daten) { Object.assign(kiste, daten); speichere(kiste); baueAlles(); }
    } else if (wahl === 'loese') {
      if (await frage('Die Kiste verschwindet. Ihre Wörter landen sicher bei „Lose Wörter“. Fortfahren?', { ja: 'Kiste lösen', gefahr: true })) {
        await loescheWortkiste(kiste.id, false); aktiveKiste = 'lose'; baueAlles();
      }
    } else if (wahl === 'alles') {
      const anzahl = woerterInKiste(kiste.id).length;
      if (await frage('Diese Kiste und ' + (anzahl === 1 ? 'ihr Wort' : anzahl + ' Wörter') + ' wandern gemeinsam in den Papierkorb.', { ja: 'In den Papierkorb', gefahr: true })) {
        await loescheWortkiste(kiste.id, true); aktiveKiste = 'alle'; baueAlles();
      }
    }
  }

  function baueSchrank() {
    schrank.innerHTML = '';
    const kistenListe = wortkisten();
    const zaehler = new Map(kistenListe.map((d) => [d.id, 0]));
    let loseZahl = 0;
    const alleWoerter = vomTyp('wort');
    for (const wort of alleWoerter) {
      if (zaehler.has(wort.parent)) zaehler.set(wort.parent, zaehler.get(wort.parent) + 1);
      else loseZahl++;
    }
    const baueKnopf = (id, titel, anzahl, farbe, notiz, kiste) => {
      const waehlen = el('button', {
        class: 'wortkiste-waehlen',
        'aria-pressed': aktiveKiste === id ? 'true' : 'false',
        onclick: () => { aktiveKiste = id; griff = []; baueAlles(); }
      },
      el('span', { class: 'wortkiste-ruecken' }),
      el('span', { class: 'wortkiste-mini-inhalt' },
        el('strong', {}, titel),
        el('small', {}, anzahl + (anzahl === 1 ? ' Wort' : ' Wörter')),
        notiz ? el('em', {}, notiz) : null));
      const umschlag = el('div', {
        class: 'wortkiste-mini' + (aktiveKiste === id ? ' an' : ''),
        style: '--kistenfarbe:' + (farbe || '#857361')
      }, waehlen);
      if (kiste) umschlag.append(el('button', {
        class: 'wortkiste-menue', title: 'Kiste bearbeiten', 'aria-label': titel + ' bearbeiten',
        onclick: () => kistenMenue(kiste)
      }, '•••'));
      schrank.append(umschlag);
    };
    baueKnopf('alle', 'Alle Wörter', alleWoerter.length, '#6f6357', 'Der ganze Schrank');
    baueKnopf('lose', 'Lose Wörter', loseZahl, '#9a8d7d', 'Noch ohne eigene Kiste');
    for (const kiste of kistenListe) baueKnopf(kiste.id, kiste.titel || 'Wortkiste', zaehler.get(kiste.id) || 0, kiste.farbe, kiste.notiz, kiste);
  }

  async function waehleZiel(wort, kopieren) {
    const ziele = [
      { text: 'Lose Wörter', icon: 'woerter', wert: 'lose' },
      ...wortkisten().slice(0, 200).map((k) => ({ text: k.titel || 'Wortkiste', icon: 'woerter', wert: k.id }))
    ];
    const ziel = await menue(ziele, kopieren ? 'Kopieren nach …' : 'Verschieben nach …');
    if (!ziel) return;
    const vorher = wort.parent || null;
    const vorherZahl = woerterInKiste(ziel).length;
    const ergebnis = wortInKiste(wort, ziel, kopieren);
    if (!ergebnis) { toast('Das Ziel gibt es nicht mehr.'); return; }
    const dazu = woerterInKiste(ziel).length > vorherZahl;
    const umgezogen = !kopieren && (ziel === 'lose' ? vorher !== null && !wort.parent : vorher !== ziel && wort.parent === ziel);
    if (dazu) toast(kopieren ? 'Eine Kopie liegt jetzt dort.' : 'Der Wortzettel ist umgezogen.');
    else if (umgezogen) toast('Der Wortzettel ist umgezogen.');
    else toast('Dieses Wort liegt dort schon.');
    baueAlles();
  }

  async function wortAktion(wort) {
    const wahl = await menue([
      { text: 'Damit schreiben', icon: 'stift', wert: 'schreiben' },
      { text: 'Wort kopieren', icon: 'teilen', wert: 'kopieren-wort' },
      { text: 'Wortzettel bearbeiten', icon: 'drehen', wert: 'edit' },
      { text: wort.favorit ? 'Oben lösen' : 'Oben anheften', icon: 'pin', wert: 'favorit' },
      wortkisten().length ? { text: 'In eine andere Kiste verschieben', icon: 'woerter', wert: 'verschieben' } : null,
      wortkisten().length ? { text: 'In eine Kiste kopieren', icon: 'plus', wert: 'kopieren' } : null,
      { text: 'Aus der Sammlung nehmen', icon: 'muell', wert: 'weg', rot: true }
    ], wort.text || 'Wort');
    if (wahl === 'kopieren-wort') {
      try { await navigator.clipboard.writeText(wort.text || ''); toast('Kopiert.'); }
      catch (e) { teileText(wort.text || ''); }
    } else if (wahl === 'schreiben') {
      const seite = blattAusText('', (wort.text || '') + ' —\n\n'); oeffneSchreibraum(seite.id);
    } else if (wahl === 'edit') {
      const daten = await wortFormular(wort);
      if (daten) { Object.assign(wort, daten); speichere(wort); baueAlles(); }
    } else if (wahl === 'favorit') {
      wort.favorit = !wort.favorit; speichere(wort); baueAlles();
    } else if (wahl === 'verschieben') await waehleZiel(wort, false);
    else if (wahl === 'kopieren') await waehleZiel(wort, true);
    else if (wahl === 'weg') { await loesche(wort.id); baueAlles(); }
  }

  function baueArbeitskarte() {
    arbeitskarte.innerHTML = '';
    if (aktiveKiste !== 'alle' && aktiveKiste !== 'lose' && !wortkisteGueltig(aktiveKiste)) aktiveKiste = 'alle';
    const kiste = wortkisteGueltig(aktiveKiste);
    const titel = kistenName(aktiveKiste);
    const beschreibung = kiste && kiste.notiz ? kiste.notiz : aktiveKiste === 'alle'
      ? 'Suche, schüttle oder greife quer durch alle Kisten.' : aktiveKiste === 'lose'
        ? 'Hier warten die Wörter, denen du noch keine eigene Kiste gegeben hast.' : '';
    const suchfeld = el('input', { type: 'search', value: suche, placeholder: 'In den Wörtern und Notizen suchen …', 'aria-label': 'Wörter suchen' });
    const sort = el('select', { class: 'wort-sortierung', 'aria-label': 'Wörter sortieren' },
      el('option', { value: 'az' }, 'A–Z'), el('option', { value: 'zuletzt' }, 'Zuletzt geändert'), el('option', { value: 'aeltest' }, 'Älteste zuerst'));
    sort.value = sortierung;
    const gitter = el('div', { class: 'wortgitter' });
    const zugabefeld = el('textarea', { rows: 2, placeholder: aktiveKiste === 'alle' ? 'Neue Wörter landen bei „Lose Wörter“ …' : 'Ein Wort oder mehrere — mit Komma oder neuer Zeile …' });
    const zielId = aktiveKiste === 'alle' ? 'lose' : aktiveKiste;

    const baueWoerter = () => {
      gitter.innerHTML = '';
      const alle = woerterInKiste(aktiveKiste, suche, sortierung);
      if (!alle.length) gitter.append(el('div', { class: 'wortkisten-leer' }, suche ? 'Hier passt gerade kein Wort zur Suche.' : 'Eine leere Kiste wartet auf schöne Wörter.'));
      for (const wort of alle) {
        let h = 0; for (const c of wort.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        const karte = el('button', { class: 'wortkarte' + (wort.favorit ? ' favorit' : ''), style: '--dreh:' + ((h % 7) - 3) + 'deg', onclick: () => wortAktion(wort) },
          wort.favorit ? el('span', { class: 'wortstern', 'aria-label': 'Oben angeheftet' }, '✦') : null,
          el('span', {}, wort.text || ''),
          wort.notiz ? el('small', {}, wort.notiz) : null);
        gitter.append(karte);
      }
    };
    const hinzu = () => {
      const paket = fuegeWoerterHinzu(zielId, zugabefeld.value);
      if (!paket.hinzu.length) { if (zugabefeld.value.trim()) toast(paket.uebersprungen ? 'Diese Wörter liegen schon in der Kiste.' : 'Da war noch kein Wort drin.'); return; }
      zugabefeld.value = ''; baueAlles();
      toast(paket.hinzu.length === 1 ? 'Ein Wort liegt jetzt in der Kiste.' : paket.hinzu.length + ' Wörter sind einsortiert.');
    };
    suchfeld.addEventListener('input', () => { suche = suchfeld.value; baueWoerter(); });
    sort.addEventListener('change', () => { sortierung = sort.value; baueWoerter(); });
    zugabefeld.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); hinzu(); } });
    arbeitskarte.append(
      el('div', { class: 'wortkisten-titelzeile' },
        el('div', {}, el('h2', {}, titel), beschreibung ? el('p', {}, beschreibung) : null),
        el('div', { style: 'display:flex;gap:6px;align-items:center' },
          woerterInKiste(aktiveKiste).length >= 2 ? el('button', { class: 'knopf zart', title: 'Karteikarten: Wort vorn, Notiz hinten', onclick: () => wortkisteAbfragen(aktiveKiste, titel).then(() => baueAlles()) }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'Abfragen') : null,
          kiste ? el('button', { class: 'rundknopf zart', html: ik('mehr'), title: 'Kiste bearbeiten', onclick: () => kistenMenue(kiste) }) : null)),
      el('div', { class: 'wortkisten-filter' }, el('span', { html: ik('suche') }), suchfeld, sort),
      gitter,
      el('div', { class: 'wortzugabe wortzugabe-mehrfach' }, zugabefeld,
        el('button', { class: 'rundknopf voll', html: ik('plus'), title: 'Wörter hinzufügen', onclick: hinzu })),
      el('small', { class: 'wortkisten-hinweis' }, 'Tipp: Mehrere Wörter lassen sich mit Komma, Semikolon oder je einer neuen Zeile auf einmal einfüllen. Strg/⌘ + Enter legt sie ab.')
    );
    baueWoerter();
  }

  const klangkarte = el('div', { class: 'karte wortkisten-schuetteln' });
  function baueSchuetteln() {
    klangkarte.innerHTML = '';
    const buehne = el('div', { class: 'dreiklang' },
      el('span', { style: 'color:var(--blass);font-size:16px' }, 'Drei Wörter fallen aus „' + kistenName(aktiveKiste) + '“ — und wollen zusammen etwas werden.'));
    const schreibknopf = el('button', { class: 'knopf voll', onclick: () => {
      if (!griff.length) { toast('Erst schütteln.'); return; }
      const seite = blattAusText('', griff.map((w) => w.text).join(' · ') + '\n\n'); oeffneSchreibraum(seite.id);
    } }, 'Damit schreiben');
    klangkarte.append(el('div', { class: 'kartenkopf' }, el('span', { html: ik('wuerfel') }), 'KISTE SCHÜTTELN'), buehne,
      el('div', { class: 'fussreihe' }, el('button', { class: 'knopf', onclick: () => {
        const alle = woerterInKiste(aktiveKiste);
        if (alle.length < 3) { toast('Dafür braucht diese Auswahl mindestens drei Wörter.'); return; }
        griff = wortZufallsgriff(alle, 3); buehne.innerHTML = '';
        griff.forEach((w, i) => buehne.append(el('span', { style: '--dreh:' + ((i * 5) - 5) + 'deg' }, w.text)));
      } }, 'Schütteln'), schreibknopf));
  }

  function baueAlles() { baueSchrank(); baueArbeitskarte(); baueSchuetteln(); }
  baueAlles();
  inhalt.append(kopf, schrank, arbeitskarte, klangkarte);

  /* Funken */
  let funke = neuerFunke(false);
  let funkeArt = 'szene';
  const funkeText = el('div', { class: 'funke-text', style: 'min-height:54px' }, funke);
  const arten = el('div', { class: 'funke-arten' });
  const ziehe = () => { funke = funkeArt === 'kombi' ? neuerFunke(true) : neuerFunke(false, funkeArt); funkeText.textContent = funke; };
  for (const [id, name] of FUNKE_ARTEN) arten.append(el('button', {
    class: id === funkeArt ? 'an' : '', onclick: (e) => { funkeArt = id; $$('button', arten).forEach((b) => b.classList.toggle('an', b === e.currentTarget)); ziehe(); }
  }, name));
  inhalt.append(el('div', { class: 'karte wortkisten-funken' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('feuer') }), 'FUNKEN'),
    arten, funkeText,
    el('div', { class: 'fussreihe' },
      el('button', { class: 'knopf', onclick: ziehe }, 'Neuer Funke'),
      el('button', { class: 'knopf zart', onclick: () => { neuDoc('funkeln', { text: funke, quelle: 'funke' }); toast('Dieser Funke taucht wieder auf.'); } }, 'Merken'),
      el('button', { class: 'knopf voll', onclick: () => { const seite = blattAusText('', funke + '\n\n'); oeffneSchreibraum(seite.id); } }, 'Dem nachgehen'))
  ));

  haupt.append(inhalt);
};
