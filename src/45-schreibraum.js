/* ================================================================
   VANI — Schreibraum: Vollbild, Fokus, Kerze
   ================================================================ */

let _sr = null;

function oeffneSchreibraum(docId) {
  if (_sr) schliesseSchreibraum();
  const doc = D.docs.get(docId);
  if (!doc) return;

  const startWorte = worte(doc.text);
  const startZeit = Date.now();

  const titel = el('input', {
    class: 'sr-titel', type: 'text', value: doc.titel || '',
    placeholder: doc.typ === 'szene' ? 'Szene ohne Namen' : 'Ohne Titel'
  });
  titel.addEventListener('input', entprellt(() => { doc.titel = titel.value; speichere(doc); }, 400));

  const worteAnzeige = el('span', { class: 'sr-worte' }, String(startWorte));
  const kerzenhalter = el('div', { class: 'kerzenhalter' });

  const ta = el('textarea', { class: 'sr-text text', placeholder: 'Schreib einfach. Der Rest der Welt wartet draußen.' });
  ta.value = doc.text || '';
  const spiegel = el('div', { class: 'sr-spiegel text', 'aria-hidden': 'true' });
  const wrap = el('div', { style: 'position:relative' }, spiegel, ta);
  const spalte = el('div', { class: 'sr-spalte ' + (D.einst.breite || 'mittel') }, wrap);
  const mitte = el('div', { class: 'sr-mitte' }, spalte);

  const kopf = el('div', { class: 'sr-kopf' },
    el('button', { class: 'knopf', onclick: () => schliesseSchreibraum(true) }, el('span', { html: ik('haken'), style: 'display:flex' }), 'Fertig'),
    titel,
    kerzenhalter,
    worteAnzeige,
    el('button', { class: 'rundknopf zart', html: ik('klang'), onclick: () => klangMenue() }),
    el('button', { class: 'rundknopf zart', html: ik('feinheiten'), onclick: () => srEinstellungen() })
  );

  const raum = el('div', { class: 'schreibraum' }, kopf, mitte);
  document.body.append(raum);
  _sr = { raum, doc, ta, spiegel, mitte, kopf, spalte, startWorte, startZeit, sprint: null };

  wendeSchriftAn();
  autogrow(ta);

  const sichern = entprellt(() => {
    doc.text = ta.value;
    speichere(doc);
    zaehleWorte(doc.id, doc.text);
  }, 500);

  let zielKlangGespielt = false;
  ta.addEventListener('input', () => {
    sichern();
    worteAnzeige.textContent = String(worte(ta.value));
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
  raum.addEventListener('pointerdown', () => kopf.classList.remove('versunken'));

  aktualisiereSpiegel();
  setTimeout(() => {
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    if (D.einst.typewriter) zentriereZeile();
  }, 80);

  _sr.sichern = sichern;

  function spiegelBeiAuswahl() {
    if (!_sr || document.activeElement !== ta) return;
    aktualisiereSpiegel();
    if (D.einst.typewriter) zentriereZeile();
  }
  _sr.spiegelBeiAuswahl = spiegelBeiAuswahl;
}

function schliesseSchreibraum(zurueck) {
  if (!_sr) return;
  _sr.sichern && _sr.sichern.sofort();
  document.removeEventListener('selectionchange', _sr.spiegelBeiAuswahl);
  if (_sr.sprint) beendeSprint(true);
  const geschrieben = worte(_sr.ta.value) - _sr.startWorte;
  _sr.raum.remove();
  const doc = _sr.doc;
  _sr = null;
  if (zurueck && geschrieben > 30) {
    toast('+' + geschrieben + ' Wörter. Gut gemacht.');
  }
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
  _sr.spalte.style.setProperty('--sr-groesse', s.groesse + 'px');
  _sr.ta.style.fontSize = s.groesse + 'px';
  _sr.spiegel.style.fontSize = s.groesse + 'px';
  _sr.raum.classList.toggle('sr-fokus', !!s.fokus);
  aktualisiereSpiegel();
}

function aktualisiereSpiegel() {
  if (!_sr) return;
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

function zentriereZeile() {
  if (!_sr) return;
  const { ta, mitte } = _sr;
  const stil = getComputedStyle(ta);
  const zh = parseFloat(stil.lineHeight) || 32;
  const bisCaret = ta.value.slice(0, ta.selectionStart || 0);
  const messer = el('div', {
    class: ta.className.replace('sr-text', 'sr-spiegel'),
    style: 'position:absolute;inset:auto;top:0;left:0;visibility:hidden;width:' + ta.clientWidth + 'px;font-size:' + stil.fontSize + ';line-height:' + stil.lineHeight + ';white-space:pre-wrap;word-wrap:break-word'
  });
  messer.textContent = bisCaret || ' ';
  ta.parentElement.append(messer);
  const caretY = messer.offsetHeight;
  messer.remove();
  const zielY = ta.offsetTop + caretY - mitte.clientHeight * .42;
  mitte.scrollTo({ top: Math.max(0, zielY) });
}

/* ----- Einstellungen im Schreibraum ----- */
function srEinstellungen() {
  const s = D.einst;
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
    el('div', { class: 'reihe', style: 'justify-content:space-between' },
      el('button', {
        class: 'knopf', onclick: () => { zu(); zeigeVerknuepfungen(_sr.doc); }
      }, el('span', { html: ik('verbinden'), style: 'display:flex' }), 'Verknüpfungen'),
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
  const startWorte = worte(_sr.ta.value);
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
    const geschrieben = worte(_sr.ta.value) - sp.startWorte;
    glocke();
    const klangDazu = D.einst.klang !== 'aus' ? { regen: ' Der Regen fällt weiter.', kamin: ' Das Feuer knistert noch.', wind: ' Der Wind hat gedreht.', grillen: ' Die Grillen bleiben.' }[D.einst.klang] || '' : '';
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
  }, el('span', { html: ik({ szene: 'projekte', seite: 'hefte', schnipsel: 'schnipsel', blase: 'cluster', wort: 'woerter' }[d.typ] || 'hefte'), style: 'display:flex' }),
    (d.titel || (d.text || '').slice(0, 44) || 'Ohne Titel'));
  const kasten = el('div', { class: 'menue' },
    el('div', { class: 'mtitel' }, 'FÜHRT HIN ZU'),
    hinaus.length ? hinaus.map(eintrag) : el('div', { style: 'padding:6px 14px 12px;color:var(--blass);font-size:14px' }, 'Mit [[doppelten Klammern]] im Text verbindest du Orte miteinander.'),
    el('div', { class: 'mtitel' }, 'ZEIGT HIERHER'),
    herein.length ? herein.map(eintrag) : el('div', { style: 'padding:6px 14px 12px;color:var(--blass);font-size:14px' }, 'Noch nichts.')
  );
  const zu = zeigeDeck(kasten);
}

/* ----- Klang-Menü (nutzt 50-audio) ----- */
async function klangMenue() {
  const wahl = await menue([
    { text: 'Stille', icon: 'kreuz', wert: 'aus' },
    { text: 'Regen ans Fenster', icon: 'klang', wert: 'regen' },
    { text: 'Kaminfeuer', icon: 'feuer', wert: 'kamin' },
    { text: 'Wind ums Haus', icon: 'klang', wert: 'wind' },
    { text: 'Grillen in der Nacht', icon: 'klang', wert: 'grillen' }
  ], 'Was soll zu hören sein?');
  if (wahl) klangSetzen(wahl);
}
