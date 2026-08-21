/* ================================================================
   VANI — Schreibraum: Vollbild, Fokus, Kerze, Feinwerk
   ================================================================ */

let _sr = null;

function oeffneSchreibraum(docId) {
  if (_sr) schliesseSchreibraum();
  const doc = D.docs.get(docId);
  if (!doc) return;

  const startWorte = worte(doc.text);

  const titel = el('input', {
    class: 'sr-titel', type: 'text', value: doc.titel || '',
    placeholder: doc.typ === 'szene' ? 'Szene ohne Namen' : 'Ohne Titel'
  });
  titel.addEventListener('input', entprellt(() => { doc.titel = titel.value; speichere(doc); }, 400, true));

  const worteAnzeige = el('span', { class: 'sr-worte' }, String(startWorte));
  const kerzenhalter = el('div', { class: 'kerzenhalter' });

  const istRich = doc.format === 'rich';
  let richPaket = null;
  const ta = istRich
    ? (richPaket = baueRichEditor(doc, { class: 'sr-text', platzhalter: 'Schreib einfach. Der Rest der Welt wartet draußen.', warten: 500 })).editor
    : el('textarea', { class: 'sr-text text', placeholder: 'Schreib einfach. Der Rest der Welt wartet draußen.' });
  if (!istRich) ta.value = doc.text || '';
  const spiegel = el('div', { class: 'sr-spiegel text', 'aria-hidden': 'true' });
  const wrap = el('div', { style: 'position:relative' }, istRich ? null : spiegel, ta);
  const spalte = el('div', { class: 'sr-spalte ' + (D.einst.breite || 'mittel') }, istRich ? richPaket.leiste : null, wrap);
  const mitte = el('div', { class: 'sr-mitte' }, spalte);

  const klangKnopf = el('button', { class: 'rundknopf zart' + (klangAktiv() ? ' klang-an' : ''), html: ik('klang'), title: 'Klang öffnen', onclick: () => { oeffneMischpult(); } });

  const kopf = el('div', { class: 'sr-kopf' },
    el('button', { class: 'knopf', onclick: () => schliesseSchreibraum(true) }, el('span', { html: ik('haken'), style: 'display:flex' }), 'Fertig'),
    titel,
    kerzenhalter,
    worteAnzeige,
    klangKnopf,
    el('button', { class: 'rundknopf zart', html: ik('feinheiten'), title: 'Schreibraum einstellen', onclick: () => srEinstellungen() })
  );

  /* Sonderzeichen, immer griffbereit über der Tastatur */
  const zeichen = ['–', '„', '"', '…', '‚', '’', '»', '«'];
  const leiste = el('div', { class: 'zeichenleiste' },
    zeichen.map((z) => el('button', {
      onpointerdown: (e) => e.preventDefault(),
      onclick: () => { fuegeEin(z); }
    }, z === '’' ? '’' : z))
  );

  const raum = el('div', { class: 'schreibraum' }, kopf, mitte, leiste);
  document.body.append(raum);
  _sr = { raum, doc, ta, spiegel, mitte, kopf, spalte, startWorte, sprint: null, klangKnopf, istRich, richPaket };

  wendeSchriftAn();
  wendeTastaturArtAn();
  if (!istRich) autogrow(ta);

  function fuegeEin(z) {
    if (istRich) { richBefehl(ta, 'insertText', z); ta.dispatchEvent(new Event('input', { bubbles: true })); return; }
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + z + ta.value.slice(e);
    ta.setSelectionRange(s + z.length, s + z.length);
    ta.dispatchEvent(new Event('input'));
    ta.focus();
  }

  const sichern = istRich ? richPaket.sichern : entprellt(() => {
    doc.text = ta.value;
    speichere(doc);
    zaehleWorte(doc.id, doc.text);
  }, 500, true);
  _sr.sichern = sichern;

  /* Deutsche Feder: -- wird –, gerade Anführungszeichen werden „so" */
  function ersetzeKlug() {
    if (istRich || !D.einst.ersetzungen) return;
    const erg = klugeZeichen(ta.value, ta.selectionStart);
    if (erg) {
      ta.value = erg.text;
      ta.setSelectionRange(erg.caret, erg.caret);
    }
  }

  let zielKlangGespielt = false;
  ta.addEventListener('input', () => {
    ersetzeKlug();
    sichern();
    const n = worte(istRich ? richReinerText(ta.innerHTML) : ta.value);
    const dazu = n - startWorte;
    worteAnzeige.textContent = String(n) + (dazu > 0 ? ' · +' + dazu : '');
    kopf.classList.add('versunken');
    aktualisiereSpiegel();
    if (D.einst.typewriter) zentriereZeile();
    if (D.einst.tagesziel > 0 && !zielKlangGespielt) {
      const heute = (D.stats.tage[tagKey()] || 0);
      if (heute >= D.einst.tagesziel) { zielKlangGespielt = true; glocke(); toast('Tagesziel. Der Rest ist Geschenk.'); }
    }
  });
  ta.addEventListener('keydown', (e) => {
    if (D.einst.tastenklang && e.key.length === 1) tippKlick();
    if (e.key === 'Escape') schliesseSchreibraum(true);
  });
  document.addEventListener('selectionchange', spiegelBeiAuswahl);
  raum.addEventListener('pointerdown', (e) => { if (!e.target.closest('.zeichenleiste')) kopf.classList.remove('versunken'); });

  aktualisiereSpiegel();
  setTimeout(() => {
    ta.focus();
    if (!istRich) ta.setSelectionRange(ta.value.length, ta.value.length);
    if (!istRich && D.einst.typewriter) zentriereZeile();
  }, 80);

  function spiegelBeiAuswahl() {
    if (!_sr || document.activeElement !== ta) return;
    aktualisiereSpiegel();
    if (D.einst.typewriter) zentriereZeile();
  }
  _sr.spiegelBeiAuswahl = spiegelBeiAuswahl;
}

function srAktuellerText() {
  if (!_sr) return '';
  return _sr.istRich ? richReinerText(_sr.ta.innerHTML) : _sr.ta.value;
}
function srSetzeText(text) {
  if (!_sr) return;
  if (_sr.istRich) _sr.ta.innerHTML = richAusText(text);
  else _sr.ta.value = text;
  _sr.ta.dispatchEvent(new Event('input', { bubbles: true }));
}

function schliesseSchreibraum(zurueck) {
  if (!_sr) return;
  _sr.sichern && _sr.sichern.sofort();
  document.removeEventListener('selectionchange', _sr.spiegelBeiAuswahl);
  if (_sr.sprint) beendeSprint(true);
  const geschrieben = worte(srAktuellerText()) - _sr.startWorte;
  _sr.raum.remove();
  _sr = null;
  if (zurueck && geschrieben > 30) toast('+' + geschrieben + ' Wörter. Gut gemacht.');
  zeichne();
}

function wendeSchriftAn() {
  if (!_sr) return;
  const s = D.einst;
  for (const zielEl of [_sr.ta, _sr.spiegel]) {
    zielEl.classList.remove('klar', 'mono');
    if (s.schrift === 'klar') zielEl.classList.add('klar');
    if (s.schrift === 'mono') zielEl.classList.add('mono');
  }
  _sr.spalte.className = 'sr-spalte ' + (s.breite || 'mittel');
  _sr.ta.style.fontSize = s.groesse + 'px';
  _sr.spiegel.style.fontSize = s.groesse + 'px';
  _sr.raum.classList.toggle('sr-fokus', !!s.fokus);
  aktualisiereSpiegel();
}
function wendeTastaturArtAn() {
  if (!_sr) return;
  const an = D.einst.autokorrektur;
  _sr.ta.setAttribute('autocorrect', an ? 'on' : 'off');
  _sr.ta.setAttribute('autocapitalize', an ? 'sentences' : 'off');
  _sr.ta.setAttribute('spellcheck', an ? 'true' : 'false');
}

function aktualisiereSpiegel() {
  if (!_sr) return;
  if (_sr.istRich) return;
  const { ta, spiegel, raum } = _sr;
  if (!D.einst.fokus) { if (raum.classList.contains('sr-fokus')) raum.classList.remove('sr-fokus'); spiegel.innerHTML = ''; return; }
  raum.classList.add('sr-fokus');
  const t = ta.value;
  const caret = ta.selectionStart || 0;
  let anfang = t.lastIndexOf('\n', Math.max(0, caret - 1)) + 1;
  let ende = t.indexOf('\n', caret);
  if (ende === -1) ende = t.length;
  spiegel.innerHTML = esc(t.slice(0, anfang)) + '<mark>' + esc(t.slice(anfang, ende)) + '</mark>' + esc(t.slice(ende)) + '\n';
}

let _messer = null;
function zentriereZeile() {
  if (!_sr) return;
  if (_sr.istRich) return;
  const { ta, mitte } = _sr;
  const stil = getComputedStyle(ta);
  if (!_messer || _messer.parentElement !== ta.parentElement) {
    if (_messer) _messer.remove();
    _messer = el('div', { class: 'sr-spiegel text', style: 'position:absolute;inset:auto;top:0;left:0;visibility:hidden' });
    ta.parentElement.append(_messer);
  }
  _messer.className = ta.className.replace('sr-text', 'sr-spiegel');
  _messer.style.cssText = 'position:absolute;inset:auto;top:0;left:0;visibility:hidden;width:' + ta.clientWidth + 'px;font-size:' + stil.fontSize + ';line-height:' + stil.lineHeight + ';white-space:pre-wrap;word-wrap:break-word';
  _messer.textContent = ta.value.slice(0, ta.selectionStart || 0) || ' ';
  const caretY = _messer.offsetHeight;
  const zielY = ta.offsetTop + caretY - mitte.clientHeight * .42;
  mitte.scrollTo({ top: Math.max(0, zielY) });
}

/* ----- Einstellungen im Schreibraum ----- */
function srEinstellungen() {
  const s = D.einst;
  const doc = _sr.doc;
  const zeileFuer = (name, inhalt) => el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, name), inhalt);
  const wahl = (optionen, aktiv, tu) => {
    const g = el('div', { class: 'wahlgruppe' });
    for (const [wert, name] of optionen) {
      g.append(el('button', {
        class: wert === aktiv ? 'an' : '', onclick: (e) => {
          tu(wert);
          $$('button', g).forEach((b) => b.classList.toggle('an', b === e.currentTarget));
          speichereEinst();
          wendeSchriftAn();
          wendeTastaturArtAn();
        }
      }, name));
    }
    return g;
  };
  const schieber = el('input', { type: 'range', min: '15', max: '26', step: '1', value: String(s.groesse) });
  schieber.addEventListener('input', () => { s.groesse = parseInt(schieber.value, 10); speichereEinst(); wendeSchriftAn(); });

  const kasten = el('div', { class: 'modal' },
    el('h2', {}, 'So schreibt es sich gut'),
    zeileFuer('Schrift', wahl([['serife', 'Serife'], ['klar', 'Klar'], ['mono', 'Mono']], s.schrift, (v) => { s.schrift = v; })),
    zeileFuer('Größe', schieber),
    zeileFuer('Breite', wahl([['schmal', 'Schmal'], ['mittel', 'Mittel'], ['breit', 'Breit']], s.breite, (v) => { s.breite = v; })),
    zeileFuer('Schreibmaschine', wahl([[true, 'An'], [false, 'Aus']], s.typewriter, (v) => { s.typewriter = v; })),
    zeileFuer('Zeilen-Fokus', wahl([[true, 'An'], [false, 'Aus']], s.fokus, (v) => { s.fokus = v; })),
    zeileFuer('Tastenklang', wahl([[true, 'An'], [false, 'Aus']], s.tastenklang, (v) => { s.tastenklang = v; })),
    zeileFuer('„Kluge Zeichen"', wahl([[true, 'An'], [false, 'Aus']], s.ersetzungen, (v) => { s.ersetzungen = v; })),
    zeileFuer('Autokorrektur', wahl([[true, 'An'], [false, 'Aus']], s.autokorrektur, (v) => { s.autokorrektur = v; })),
    el('div', { class: 'reihe', style: 'justify-content:flex-start;flex-wrap:wrap;gap:8px' },
      el('button', { class: 'knopf', onclick: () => { zu(); sucheErsetze(); } }, el('span', { html: ik('suche'), style: 'display:flex' }), 'Suchen & Ersetzen'),
      el('button', { class: 'knopf', onclick: () => { zu(); friereEin(); } }, el('span', { html: ik('frieren'), style: 'display:flex' }), 'Stand einfrieren'),
      (doc.staende && doc.staende.length) ? el('button', { class: 'knopf', onclick: () => { zu(); zeigeStaende(); } }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'Frühere Stände (' + doc.staende.length + ')') : null,
      doc.format !== 'rich' ? el('button', { class: 'knopf', onclick: () => {
        doc.format = 'rich'; doc.rich = richAusText(srAktuellerText()); speichere(doc); zu();
        const id = doc.id; schliesseSchreibraum(); setTimeout(() => oeffneSchreibraum(id), 30);
      } }, 'Aa · Text formatieren') : null,
      el('button', { class: 'knopf', onclick: () => { zu(); teileText((doc.titel ? doc.titel + '\n\n' : '') + srAktuellerText()); } }, el('span', { html: ik('teilen'), style: 'display:flex' }), 'Teilen'),
      el('button', { class: 'knopf', onclick: () => { zu(); zeigeVerknuepfungen(doc); } }, el('span', { html: ik('verbinden'), style: 'display:flex' }), 'Verknüpfen & einordnen'),
      el('button', {
        class: 'knopf', onclick: async () => {
          zu();
          const dauer = await menue([
            { text: 'Eine kleine Kerze — 10 Minuten', wert: 10 },
            { text: 'Eine mittlere — 20 Minuten', wert: 20 },
            { text: 'Eine lange — 45 Minuten', wert: 45 }
          ], 'Eine Kerze anzünden');
          if (dauer) starteSprint(dauer);
        }
      }, '🕯 Kerze anzünden')
    )
  );
  const zu = zeigeDeck(kasten);
}

/* ----- Stände (Schnappschüsse) ----- */
function friereEin() {
  if (!_sr) return;
  const doc = _sr.doc;
  doc.staende = doc.staende || [];
  doc.staende.push({ wann: Date.now(), titel: doc.titel || '', text: srAktuellerText() });
  if (doc.staende.length > 20) doc.staende.shift();
  speichereStill(doc);
  toast('Eingefroren. Dieser Stand bleibt.');
}
function zeigeStaende() {
  if (!_sr) return;
  const doc = _sr.doc;
  const kasten = el('div', { class: 'menue' },
    el('div', { class: 'mtitel' }, 'EINGEFRORENE STÄNDE'),
    [...(doc.staende || [])].reverse().map((st) => el('button', {
      onclick: async () => {
        zu();
        const wahl = await menue([
          { text: 'Zurückholen (Jetziges wird eingefroren)', icon: 'wieder', wert: 'zurueck' },
          { text: 'Nur ansehen', icon: 'lesen', wert: 'sehen' },
          { text: 'Diesen Stand vergessen', icon: 'muell', wert: 'weg', rot: true }
        ], fmtDatum(st.wann) + ', ' + fmtZeit(st.wann));
        if (wahl === 'zurueck') {
          friereEin();
          srSetzeText(st.text);
          _sr.doc.titel = st.titel;
          _sr.sichern.sofort();
          zeichne();
          toast('Zurückgeholt.');
        } else if (wahl === 'sehen') {
          const bogen = el('div', { class: 'lesebogen' },
            el('div', { class: 'innen' },
              el('h1', {}, st.titel || 'Stand vom ' + fmtDatum(st.wann)),
              el('div', { class: 'lmeta' }, worte(st.text) + ' Wörter · eingefroren ' + fmtDatum(st.wann) + ', ' + fmtZeit(st.wann)),
              el('div', { class: 'lesetext' }, st.text)));
          const leiste2 = el('div', { class: 'schwebeleiste' },
            el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Stand schließen', onclick: () => { bogen.remove(); leiste2.remove(); } }));
          document.body.append(bogen, leiste2);
        } else if (wahl === 'weg') {
          doc.staende = doc.staende.filter((x) => x !== st);
          speichereStill(doc);
        }
      }
    },
      el('span', { html: ik('frieren'), style: 'display:flex' }),
      fmtDatum(st.wann) + ' · ' + fmtZeit(st.wann) + ' · ' + worte(st.text) + ' W.'))
  );
  const zu = zeigeDeck(kasten);
}

/* ----- Suchen & Ersetzen (im offenen Text) ----- */
function sucheErsetze() {
  if (!_sr) return;
  const ta = _sr.ta;
  const suchFeld = el('input', { type: 'text', placeholder: 'suchen …' });
  const ersatzFeld = el('input', { type: 'text', placeholder: 'ersetzen durch …' });
  const zaehler = el('div', { style: 'font-size:13px;color:var(--blass);margin-top:8px' }, '');
  const zaehle = () => {
    const q = suchFeld.value;
    if (!q) { zaehler.textContent = ''; return 0; }
    const n = srAktuellerText().split(q).length - 1;
    zaehler.textContent = n === 0 ? 'Kommt nicht vor.' : n === 1 ? 'Einmal gefunden.' : n + ' Treffer.';
    return n;
  };
  suchFeld.addEventListener('input', zaehle);
  const kasten = el('div', { class: 'modal' },
    el('h2', {}, 'Suchen & Ersetzen'),
    suchFeld,
    el('div', { style: 'margin-top:10px' }, ersatzFeld),
    zaehler,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', {
        class: 'knopf voll', onclick: () => {
          const n = zaehle();
          if (!n) { toast('Nichts zu ersetzen.'); return; }
          friereEin();
          srSetzeText(srAktuellerText().split(suchFeld.value).join(ersatzFeld.value));
          _sr.sichern.sofort();
          zu();
          toast(n === 1 ? 'Einmal ersetzt.' : n + '-mal ersetzt. Der alte Stand ist eingefroren.');
        }
      }, 'Ersetzen')
    )
  );
  const zu = zeigeDeck(kasten);
  setTimeout(() => suchFeld.focus(), 60);
}

/* ----- Sprint: die Kerze ----- */
function starteSprint(minuten) {
  if (!_sr || _sr.sprint) return;
  const halter = $('.kerzenhalter', _sr.raum);
  const kerze = el('div', { class: 'kerze', style: 'height:30px' }, el('div', { class: 'kerzenflamme' }));
  halter.append(kerze);
  requestAnimationFrame(() => {
    kerze.style.transition = 'height ' + (minuten * 60) + 's linear';
    requestAnimationFrame(() => { kerze.style.height = '4px'; });
  });
  const startWorte = worte(srAktuellerText());
  _sr.sprint = {
    startWorte, minuten,
    timer: setTimeout(() => beendeSprint(false), minuten * 60000)
  };
  toast('Die Kerze brennt. ' + minuten + ' Minuten gehören dir.');
}
function beendeSprint(abgebrochen) {
  if (!_sr || !_sr.sprint) return;
  const sp = _sr.sprint;
  clearTimeout(sp.timer);
  _sr.sprint = null;
  const kerze = $('.kerze', _sr.raum);
  if (kerze) kerze.remove();
  if (!abgebrochen) {
    const geschrieben = worte(srAktuellerText()) - sp.startWorte;
    glocke();
    const m = D.einst.mischung || {};
    const klangDazu = m.regenfenster || m.regendach || m.platzregen ? ' Der Regen fällt weiter.'
      : m.kamin ? ' Das Feuer knistert noch.'
      : m.wind || m.schneesturm ? ' Der Wind hat gedreht.'
      : m.grillen ? ' Die Grillen bleiben.'
      : m.brandung ? ' Das Meer bleibt da.' : '';
    toast('Ein Atemzug Rauch. ' + geschrieben + ' Wörter in ' + sp.minuten + ' Minuten.' + klangDazu, 4200);
  }
}

/* ----- Verknüpfungen ----- */
function zeigeVerknuepfungen(doc) {
  const hinaus = [];
  const t = doc.text || '';
  const re = /\[\[([^\[\]]{1,80})\]\]/g;
  let m;
  while ((m = re.exec(t))) {
    const ziel = findeNachTitel(m[1]);
    if (ziel && !hinaus.includes(ziel)) hinaus.push(ziel);
  }
  const herein = rueckverweise(doc);
  const eintrag = (d) => el('button', {
    onclick: () => { zu(); if (_sr) schliesseSchreibraum(); oeffneDoc(d); }
  }, el('span', { html: ik({ szene: 'projekte', seite: 'hefte', schnipsel: 'schnipsel', blase: 'cluster', wort: 'woerter', blatt: 'blatt', faden: 'faden' }[d.typ] || 'hefte'), style: 'display:flex' }),
    (d.titel || (d.text || '').slice(0, 44) || 'Ohne Titel'));
  const kasten = el('div', { class: 'menue' },
    el('div', { class: 'mtitel' }, 'FÜHRT HIN ZU'),
    hinaus.length ? hinaus.map(eintrag) : el('div', { style: 'padding:6px 14px 12px;color:var(--blass);font-size:14px' }, 'Mit [[doppelten Klammern]] im Text verbinden sich Orte miteinander.'),
    el('div', { class: 'mtitel' }, 'ZEIGT HIERHER'),
    herein.length ? herein.map(eintrag) : el('div', { style: 'padding:6px 14px 12px;color:var(--blass);font-size:14px' }, 'Noch nichts.'),
    el('div', { class: 'mtitel' }, 'FREI ZUSAMMENLEGEN'),
    el('button', { onclick: () => { zu(); zeigeBeziehungen(doc); } },
      el('span', { html: ik('verbinden'), style: 'display:flex' }), 'Beziehungen ansehen & hinzufügen'),
    ['blatt', 'seite', 'szene', 'blase'].includes(doc.typ) ? el('button', { onclick: () => { zu(); hinzufuegenMenue(doc); } },
      el('span', { html: ik('plus'), style: 'display:flex' }), 'Zu Heft, Projekt oder Cluster hinzufügen') : null
  );
  const zu = zeigeDeck(kasten);
}
