/* ================================================================
   VANI — Suche: ein Feld, alles. Mit Filtern und Nachsicht
   bei Tippfehlern.
   ================================================================ */

const SUCH_GRUPPEN = [
  ['schnipsel', 'Schnipsel', 'schnipsel'],
  ['blatt', 'Blätter', 'blatt'],
  ['seite', 'Heftseiten', 'hefte'],
  ['szene', 'Szenen', 'projekte'],
  ['figur', 'Figuren & Orte', 'projekte'],
  ['heft', 'Hefte', 'hefte'],
  ['projekt', 'Projekte', 'projekte'],
  ['blase', 'Blasen', 'cluster'],
  ['zettel', 'Zettel', 'pin'],
  ['wortkiste', 'Wortkisten', 'woerter'],
  ['wort', 'Wörter', 'woerter'],
  ['faden', 'Faden', 'faden'],
  ['funkeln', 'Funken', 'woerter'],
  ['mischung', 'Klang-Szenen', 'klang'],
  ['klangbild', 'Klangbilder', 'klang'],
  ['klang', 'Eigene Klänge', 'klang'],
  /* Die Welten-Werkzeuge. Vorher fehlten sie ganz: wer den Namen seiner
     Hauptfigur suchte, fand sie im Album, im Wandteppich und im Kalender
     nie — nur dort, wo sie zufaellig im Fliesstext stand. */
  ['albumfigur', 'Album', 'album'],
  ['stammbaum', 'Wandteppiche', 'kabinett'],
  ['stadtplan', 'Stadtpläne', 'kabinett'],
  ['sternhimmel', 'Sternhimmel', 'kabinett'],
  ['termin', 'Kalender', 'kalender']
];

/* Was an einem Dokument durchsucht wird. Fuer die meisten ist das Text und
   Notiz; Album, Teppich, Plan und Kalender tragen ihren Stoff in Feldern. */
function suchTextFuer(d) {
  if (!d) return '';
  const teile = [d.text, d.notiz];
  try {
    if (d.typ === 'albumfigur') {
      /* Selbst zusammengesetzt statt albumVolltext(): der liefert alles klein
         geschrieben — im Umfeld stand dann „zander moretti“ neben dem Namen. */
      if (d.name) teile.unshift(d.name);
      for (const w of Object.values(d.felder || {})) teile.push(Array.isArray(w) ? w.join(', ') : (typeof w === 'string' ? w : ''));
      for (const e of Array.isArray(d.eigene) ? d.eigene : []) if (e && e.wert) teile.push([e.name, e.wert].filter(Boolean).join(': '));
      for (const z of Array.isArray(d.zettel) ? d.zettel : []) if (z && z.text) teile.push(z.text);
    } else if (d.typ === 'stammbaum') {
      for (const p of Array.isArray(d.leute) ? d.leute : []) if (p) teile.push([p.name, p.notiz].filter(Boolean).join(' – '));
      if (d.spruch) teile.push(d.spruch);
    } else if (d.typ === 'stadtplan') {
      for (const m of Array.isArray(d.marken) ? d.marken : []) if (m && m.name) teile.push([m.name, m.notiz].filter(Boolean).join(' – '));
    } else if (d.typ === 'sternhimmel') {
      if (d.unterzeile) teile.push(d.unterzeile);
      for (const s of Array.isArray(d.sternbilder) ? d.sternbilder : []) if (s && (s.name || s.sage)) teile.push([s.name, s.sage].filter(Boolean).join(' – '));
    } else if (d.typ === 'termin') {
      if (d.ort) teile.push(d.ort);
      for (const p of Array.isArray(d.leute) ? d.leute : []) if (p && p.name) teile.push(p.name);
    }
  } catch (e) {}
  /* Doppeltes (der Name steht im Volltext noch einmal) faellt weg. */
  return [...new Set(teile.filter((x) => typeof x === 'string' && x.trim()))].join('\n');
}
/* Die Suche selbst, ohne Bildschirm: Gruppen mit sortierten Treffern.
   Erst werden alle genauen Funde ueber alle Gruppen gesammelt. Nur wenn es
   davon wenige gibt, kommt die Nachsicht bei Tippfehlern dazu — sonst schob
   „Zander“ jedes „anderen“ als ähnlichen Treffer vor die echten, und bei
   sechs Plaetzen je Gruppe blieb fuer die echten oft nur einer. */
function suchErgebnisse(docs, roh, filter) {
  /* 5.68: „#Mira“ filtert nach Etikett (Anfang genuegt, mehrere = alle muessen passen). */
  const alle = [...docs];
  /* Etiketten mit Leerzeichen („Kapitel 3“) heissen in der Suche „#Kapitel3“ — darum ohne Leerraum vergleichen. */
  const etikettN = (x) => normalisiere(x).replace(/\s+/g, '');
  const bekannt = new Set();
  for (const d of alle) for (const x of (d && d.etiketten) || []) bekannt.add(etikettN(x));
  /* Ein „#“, zu dem es kein Etikett gibt (etwa „#1“), bleibt ganz normaler Suchtext. */
  const etiketten = [];
  const q = normalisiere(String(roh || '').replace(/#([^\s#]{1,40})/g, (ganz, name) => {
    const e = etikettN(name);
    if (e && [...bekannt].some((x) => x.startsWith(e))) { etiketten.push(e); return ' '; }
    return ganz;
  }).replace(/\s+/g, ' ').trim());
  if (q.length < 2 && !etiketten.length) return [];
  const passt = (d) => !etiketten.length || etiketten.every((e) => (d.etiketten || []).some((x) => etikettN(x).startsWith(e)));
  const proGruppe = [];
  let genaueGesamt = 0;
  for (const [typ, name] of SUCH_GRUPPEN) {
    if (filter && typ !== filter) continue;
    const genau = [], vielleicht = [];
    for (const d of alle) {
      if (!d || d.typ !== typ || d.geloescht || !passt(d)) continue;
      if (q.length < 2) { genau.push({ d, stellen: [], unscharf: false, suchText: '', imTitel: false }); continue; }
      const titelN = normalisiere(suchTitelFuer(d));
      const suchText = suchTextFuer(d);
      const imTitel = titelN.indexOf(q) >= 0 || (d.etiketten || []).some((x) => normalisiere(x).indexOf(q) >= 0);
      /* Schneller Vortest auf der (gemerkten) normalisierten Fassung — die
         Karte fuer die genaue Stelle wird nur fuer echte Funde gebaut. */
      const stellen = suchNorm(d, suchText).indexOf(q) >= 0 ? suchFundstellen(suchText, q) : [];
      if (imTitel || stellen.length) genau.push({ d, stellen, unscharf: false, suchText, imTitel });
      else if (q.length >= 5) vielleicht.push({ d, stellen, unscharf: true, suchText, titelN, imTitel: false });
    }
    genaueGesamt += genau.length;
    proGruppe.push({ typ, name, genau, vielleicht });
  }
  const mitNachsicht = genaueGesamt < 3 && q.length >= 5;
  const raus = [];
  for (const g of proGruppe) {
    /* Genaue zuerst: Titeltreffer vor Texttreffern, dann die mit den meisten
       Fundstellen, dann die juengsten. */
    let liste = g.genau.sort((a, b) => (b.imTitel - a.imTitel) || (b.stellen.length - a.stellen.length) || ((b.d.geaendert || 0) - (a.d.geaendert || 0)));
    if (mitNachsicht) {
      const aehnlich = g.vielleicht.filter((f) => fastGleich(f.titelN, q) || fastGleich(suchNorm(f.d, f.suchText), q));
      liste = liste.concat(aehnlich.sort((a, b) => (b.d.geaendert || 0) - (a.d.geaendert || 0)));
    }
    if (liste.length) raus.push({ typ: g.typ, name: g.name, liste });
  }
  return raus;
}

/* Die normalisierte Fassung je Dokument, gemerkt bis zur naechsten Aenderung.
   Ohne das wurde bei JEDEM Anschlag im Suchfeld der ganze Bestand neu
   normalisiert — mit einem langen Faden spuerbar auf dem iPad. */
const _suchNormCache = new Map();
function suchNorm(d, suchText) {
  const alt = _suchNormCache.get(d.id);
  if (alt && alt.g === (d.geaendert || 0) && alt.t === suchText.length) return alt.n;
  const n = normalisiere(suchText);
  if (_suchNormCache.size > 5000) _suchNormCache.clear();
  _suchNormCache.set(d.id, { g: d.geaendert || 0, t: suchText.length, n });
  return n;
}
function suchTitelFuer(d) {
  if (!d) return '';
  if (d.typ === 'albumfigur') return d.name || d.titel || '';
  return d.titel || '';
}

/* Alle Fundstellen eines Wortes im echten Text — mit der Karte aus 48c, damit
   ß → ss und Umlaute die Stelle nicht verschieben. Vorher wurde die Stelle in
   der normalisierten Fassung gezaehlt und im Originaltext markiert: jedes ß
   davor schob die Marke um ein Zeichen nach rechts. Aus „Zander“ wurde so im
   Umfeld ein markiertes „und“. */
function suchFundstellen(text, q, hoechstens = 50) {
  const raus = [];
  if (!q) return raus;
  const { norm, karte } = suchKarte(text);
  let i = norm.indexOf(q);
  while (i >= 0 && raus.length < hoechstens) {
    const von = karte[i];
    const bis = i + q.length < karte.length ? karte[i + q.length] : text.length;
    raus.push({ von, bis: Math.max(von + 1, bis) });
    i = norm.indexOf(q, i + q.length);
  }
  return raus;
}

/* Ein kaputter Eintrag im Browser-Speicher darf die Suche nicht lahmlegen. */
/* Letzte Suchen je Profil getrennt */
function suchSchluessel() { const p = typeof D !== 'undefined' && D.profil && D.profil.id ? D.profil.id : (typeof AKTIVES_PROFIL !== 'undefined' && AKTIVES_PROFIL ? AKTIVES_PROFIL.id : ''); return 'vani-suchen' + (p ? ':' + p : ''); }
function leseLetzteSuchen() {
  try {
    const roh = JSON.parse(localStorage.getItem(suchSchluessel()) || '[]');
    return Array.isArray(roh) ? roh.filter((x) => typeof x === 'string').slice(0, 8) : [];
  } catch (e) { return []; }
}

function oeffneSuche() {
  /* Nicht zweimal uebereinander (doppelter Tipp, Kuerzel waehrend sie offen ist). */
  const offen = document.querySelector('.suchbogen');
  if (offen) { const f = offen.querySelector('input'); if (f) f.focus(); return; }
  const feld = el('input', { type: 'text', placeholder: 'Wonach suchst du?' });
  const treffer = el('div', { class: 'suchtreffer' });
  let filter = null;

  const chips = el('div', { class: 'suchchips' });
  const baueChips = () => {
    chips.innerHTML = '';
    for (const [typ, name] of SUCH_GRUPPEN) {
      if (typ === 'faden' && !vomTyp('faden').length) continue;
      /* Welten-Werkzeuge nur als Chip, wenn es dort auch etwas gibt. */
      if (['albumfigur', 'stammbaum', 'stadtplan', 'sternhimmel', 'termin'].includes(typ) && !vomTyp(typ).length) continue;
      chips.append(el('button', {
        class: 'suchchip' + (filter === typ ? ' an' : ''),
        onclick: () => { filter = filter === typ ? null : typ; baueChips(); suche(); }
      }, name));
    }
    /* Etiketten: antippen setzt „#Etikett“ ins Feld */
    const bekannt = etikettenAlle().slice(0, 14);
    if (bekannt.length) {
      const reihe = el('div', { class: 'such-etiketten' });
      for (const { name: et } of bekannt) reihe.append(el('button', { class: 'stichwort', onclick: () => {
        const marke = '#' + et.replace(/\s+/g, '');
        feld.value = feld.value.includes(marke) ? feld.value.replace(marke, '').replace(/\s+/g, ' ').trim() : (feld.value.trim() + ' ' + marke).trim();
        baueChips(); suche(); feld.focus();
      } }, '#' + et));
      chips.append(reihe);
    }
  };
  baueChips();

  const kasten = el('div', { class: 'suchkasten' },
    el('div', { class: 'suchzeile' },
      el('span', { html: ik('suche'), style: 'display:flex;color:var(--blass)' }),
      feld,
      el('button', { class: 'rundknopf zart', style: 'width:32px;height:32px', html: ik('kreuz'), title: 'Suche schließen', onclick: () => zu() })
    ),
    chips,
    treffer
  );
  const bogen = el('div', { class: 'suchbogen' }, kasten);
  bogen.addEventListener('pointerdown', (e) => { if (e.target === bogen) zu(); });
  document.body.append(bogen);
  const zu = () => bogen.remove();
  setTimeout(() => feld.focus(), 60);

  function eintrag(d, umfeldHtml) {
    return el('button', { onclick: () => {
      zu(); merkeSuche(feld.value);
      /* Der Zettel fuer 48c: nicht nur oeffnen, sondern zur Stelle springen. */
      if (typeof suchZielMerken === 'function') suchZielMerken(d.id, feld.value);
      if (typeof _sr !== 'undefined' && _sr && typeof schliesseSchreibraum === 'function') schliesseSchreibraum();
      oeffneDoc(d);
    } },
      el('span', { class: 'ttitel' }, suchTitelFuer(d) || ((d.text || '').split('\n')[0] || 'Ohne Titel').slice(0, 50)),
      umfeldHtml ? el('span', { class: 'tprobe', html: umfeldHtml }) : null
    );
  }

  function leererZustand() {
    treffer.innerHTML = '';
    const letzte = leseLetzteSuchen();
    if (letzte.length) {
      treffer.append(el('div', { class: 'gruppe' }, 'ZULETZT GESUCHT'));
      for (const q of letzte.slice(0, 5)) {
        treffer.append(el('button', { onclick: () => { feld.value = q; suche(); } },
          el('span', { class: 'ttitel', style: 'font-weight:400' }, q)));
      }
    }
    const frisch = [...D.docs.values()]
      .filter((d) => ['blatt', 'szene', 'seite', 'schnipsel'].includes(d.typ) && (d.text || '').trim())
      .sort((a, b) => b.geaendert - a.geaendert).slice(0, 5);
    if (frisch.length) {
      treffer.append(el('div', { class: 'gruppe' }, 'ZULETZT ANGEFASST'));
      for (const d of frisch) treffer.append(eintrag(d, esc((d.text || '').replace(/\s+/g, ' ').slice(0, 70))));
    }
    /* Schlagworte: alles, was irgendwo mit # markiert wurde — ein Tipp sucht danach. */
    const worte = schlagwortIndex([...D.docs.values()], 30);
    if (worte.length) {
      treffer.append(el('div', { class: 'gruppe' }, 'SCHLAGWORTE'));
      const wolke = el('div', { class: 'schlagwortwolke' });
      for (const { wort, anzahl } of worte) wolke.append(el('button', { class: 'schlagwortchip', onclick: () => { feld.value = '#' + wort; suche(); } }, '#' + wort, el('small', {}, String(anzahl))));
      treffer.append(wolke);
    }
    if (!letzte.length && !frisch.length && !worte.length) {
      treffer.append(el('div', { style: 'padding:22px;text-align:center;color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' },
        'Alles, was du je geschrieben hast, liegt hier drin.'));
    }
  }

  function merkeSuche(q) {
    if (!q || q.length < 2) return;
    const letzte = leseLetzteSuchen().filter((x) => x !== q);
    letzte.unshift(q);
    try { localStorage.setItem(suchSchluessel(), JSON.stringify(letzte.slice(0, 8))); } catch (e) {}
  }

  function suche() {
    const roh = feld.value.trim();
    if (roh.length < 2) { leererZustand(); return; }
    treffer.innerHTML = '';
    let gesamt = 0;
    for (const g of suchErgebnisse(D.docs.values(), roh, filter)) {
      const liste = g.liste;
      treffer.append(el('div', { class: 'gruppe' }, g.name.toUpperCase() + (liste.length > 1 ? ' · ' + liste.length : '')));
      const grenze = filter ? 60 : 6;
      for (const { d, stellen, unscharf, suchText } of liste.slice(0, grenze)) {
        gesamt++;
        let umfeld = '';
        const text = suchText || '';
        if (stellen.length) {
          const s = stellen[0];
          const von = Math.max(0, s.von - 28);
          const stueck = text.slice(von, s.bis + 50).replace(/\n/g, ' ');
          const rel = s.von - von, lang = s.bis - s.von;
          umfeld = (von > 0 ? '… ' : '') + esc(stueck.slice(0, rel)) + '<mark>' + esc(stueck.slice(rel, rel + lang)) + '</mark>' + esc(stueck.slice(rel + lang)) + ' …';
          if (stellen.length > 1) umfeld += ' <i style="opacity:.6">(' + (stellen.length >= 50 ? '50+' : stellen.length) + '-mal)</i>';
        } else {
          umfeld = esc(text.replace(/\s+/g, ' ').slice(0, 78)) + (unscharf ? ' <i style="opacity:.6">(ähnlich)</i>' : '');
        }
        treffer.append(eintrag(d, umfeld.trim() || null));
      }
      /* Mehr als sechs: nicht still abschneiden, sondern sagen und anbieten. */
      if (liste.length > grenze) {
        const typ = g.typ;
        treffer.append(el('button', { class: 'suchmehr', onclick: () => { filter = typ; baueChips(); suche(); } },
          el('span', { class: 'ttitel', style: 'font-weight:400;color:var(--blass)' }, 'Alle ' + liste.length + ' zeigen …')));
      }
    }
    if (!gesamt) {
      treffer.append(el('div', { style: 'padding:22px;text-align:center;color:var(--blass);font-style:italic;font-family:ui-serif,Georgia,serif' },
        'Nichts. Vielleicht muss es erst noch geschrieben werden.'));
    }
  }
  feld.addEventListener('input', entprellt(suche, 140));
  feld.addEventListener('keydown', (e) => { if (e.key === 'Escape') zu(); });
  leererZustand();
}

/* ⌘/Strg+K öffnet das Spotlight (48b); ⌘/Strg+⇧+K diese Suche. */

/* ===================== Etiketten ueber alle Raeume (5.68) =====================
   Ein Stichwort („Kapitel 3“, „Mira“, „Idee“) an Schnipsel, Blaetter, Szenen,
   Hefte; die Suche filtert mit „#Mira“. Gespeichert als `etiketten` am
   Dokument (siehe etikettenSauber in 30-core.js). */
function etikettenAlle() {
  const zaehl = new Map();
  for (const d of D.docs.values()) for (const e of d.etiketten || []) { const k = e.toLowerCase(); const alt = zaehl.get(k); zaehl.set(k, { name: alt ? alt.name : e, n: (alt ? alt.n : 0) + 1 }); }
  return [...zaehl.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'de'));
}
function etikettenZeile(d) {
  if (!d || !Array.isArray(d.etiketten) || !d.etiketten.length) return null;
  return el('div', { class: 'etiketten-zeile' }, d.etiketten.slice(0, 6).map((e) => el('span', { class: 'stichwort klein' }, e)), d.etiketten.length > 6 ? el('span', { class: 'stichwort klein' }, '+' + (d.etiketten.length - 6)) : null);
}
function etikettenBearbeiten(d) {
  return new Promise((res) => {
    let liste = [...(d.etiketten || [])];
    const feld = el('input', { type: 'text', maxlength: '40', placeholder: 'Neues Etikett, dann Enter', 'aria-label': 'Neues Etikett', enterkeyhint: 'done' });
    const jetzt = el('div', { class: 'etiketten-jetzt' });
    const vorschlaege = el('div', { class: 'etiketten-vorschlaege' });
    const neu = () => {
      jetzt.innerHTML = '';
      if (!liste.length) jetzt.append(el('span', { class: 'leise' }, 'Noch keine Etiketten.'));
      for (const e of liste) jetzt.append(el('button', { class: 'stichwort mit-weg', title: 'Etikett abnehmen', onclick: () => { liste = liste.filter((x) => x !== e); neu(); } }, e, el('span', { html: ik('kreuz'), style: 'display:flex;width:12px' })));
      vorschlaege.innerHTML = '';
      const f = normalisiere(feld.value.trim());
      const passend = etikettenAlle().filter((x) => !liste.some((y) => y.toLowerCase() === x.name.toLowerCase()) && (!f || normalisiere(x.name).includes(f))).slice(0, 12);
      for (const x of passend) vorschlaege.append(el('button', { class: 'stichwort', onclick: () => { liste = etikettenSauber([...liste, x.name]); feld.value = ''; neu(); } }, '+ ' + x.name));
    };
    const dazu = () => { const t = feld.value.trim(); if (!t) return; liste = etikettenSauber([...liste, t]); feld.value = ''; neu(); };
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); dazu(); } });
    feld.addEventListener('input', neu);
    const fertig = () => {
      dazu();
      const sauber = etikettenSauber(liste);
      const vorher = JSON.stringify(d.etiketten || []);
      if (sauber.length) d.etiketten = sauber; else delete d.etiketten;
      if (JSON.stringify(d.etiketten || []) !== vorher) speichereStill(d);
      zu(); res(true);
    };
    const kasten = el('div', { class: 'modal etiketten-modal' },
      el('div', { class: 'kartenkopf' }, el('span', { html: ik('lesezeichen') }), 'ETIKETTEN'),
      el('h2', {}, suchTitelFuer(d) || 'Ohne Titel'), jetzt,
      el('div', { class: 'etiketten-feld' }, feld, el('button', { class: 'knopf', onclick: dazu }, 'Dazu')),
      vorschlaege,
      el('p', { class: 'leise' }, 'In der Suche findet „#' + (liste[0] || 'Etikett').replace(/\s+/g, '') + '“ alles mit diesem Etikett.'),
      el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: fertig }, 'Fertig')));
    const zu = zeigeDeck(kasten, () => fertig());
    neu();
    setTimeout(() => feld.focus(), 80);
  });
}
