/* ================================================================
   VANI — Schreibraum: Vollbild, Fokus, Kerze, Feinwerk
   ================================================================ */

let _sr = null;

/* ----- Vorlesen: die Stimme des Geräts, ganz ohne Netz -----
   Gut zum Gegenlesen: Was holpert, hört man, bevor man es sieht. */
let _vorleser = null;
function vorlesenMoeglich() { return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'; }
function vorlesenLaeuft() { return !!(_vorleser && vorlesenMoeglich() && speechSynthesis.speaking); }
function vorlesenStopp() {
  if (vorlesenMoeglich()) { try { speechSynthesis.cancel(); } catch (e) {} }
  _vorleser = null;
  document.body.classList.remove('liest-vor');
  $$('.vorlese-knopf.an').forEach((k) => k.classList.remove('an'));
}
function vorlesen(text, knopf) {
  if (!vorlesenMoeglich()) { toast('Dieses Gerät kann noch nicht vorlesen.'); return false; }
  if (vorlesenLaeuft()) { vorlesenStopp(); return false; }
  const rein = String(text || '').replace(/\s+/g, ' ').trim();
  if (!rein) { toast('Da steht noch nichts zum Vorlesen.'); return false; }
  try { speechSynthesis.cancel(); } catch (e) {}
  /* Lange Texte in Stücke: manche Geräte brechen bei langen Äußerungen ab. */
  const stuecke = rein.match(/[^.!?…]+[.!?…]+["“”»«)]?|[^.!?…]+$/g) || [rein];
  const bloecke = [];
  let puffer = '';
  for (const st of stuecke) {
    if ((puffer + st).length > 700 && puffer) { bloecke.push(puffer.trim()); puffer = ''; }
    puffer += st + ' ';
  }
  if (puffer.trim()) bloecke.push(puffer.trim());
  const stimmen = (speechSynthesis.getVoices() || []);
  const gewuenscht = typeof leseEinstellung === 'function' ? leseEinstellung().stimme : null;
  const deutsch = (gewuenscht && stimmen.find((v) => v.voiceURI === gewuenscht || v.name === gewuenscht)) || stimmen.find((v) => /^de[-_]/i.test(v.lang) && /siri|anna|petra|markus|google|natural|premium/i.test(v.name)) || stimmen.find((v) => /^de[-_]/i.test(v.lang)) || null;
  _vorleser = { bloecke, i: 0 };
  document.body.classList.add('liest-vor');
  if (knopf) knopf.classList.add('an');
  const weiter = () => {
    if (!_vorleser || _vorleser.i >= _vorleser.bloecke.length) { vorlesenStopp(); return; }
    const u = new SpeechSynthesisUtterance(_vorleser.bloecke[_vorleser.i++]);
    u.lang = deutsch ? deutsch.lang : 'de-DE';
    if (deutsch) u.voice = deutsch;
    u.rate = begrenze(D.einst.vorleseTempo, .6, 1.4, .95);
    u.onend = weiter;
    u.onerror = () => vorlesenStopp();
    try { speechSynthesis.speak(u); } catch (e) { vorlesenStopp(); }
  };
  weiter();
  return true;
}

function oeffneSchreibraum(docId) {
  if (_sr) schliesseSchreibraum();
  const doc = D.docs.get(docId);
  if (!doc) return;
  /* Hefte, Projekte und Cluster haben ihren Text in Seiten, Szenen, Blasen — sie gehören in ihren Raum, nicht auf ein leeres Blatt */
  if (doc.typ === 'heft' || doc.typ === 'projekt' || doc.typ === 'board' || doc.typ === 'wortkiste' || doc.typ === 'buch') { oeffneDoc(doc); return; }

  const startWorte = worte(doc.text);

  const titel = el('input', {
    class: 'sr-titel', type: 'text', value: doc.titel || '',
    placeholder: doc.typ === 'szene' ? 'Szene ohne Namen' : 'Ohne Titel'
  });
  const titelSichern = entprellt(() => { doc.titel = titel.value; speichere(doc); }, 400, () => titel.isConnected);
  titel.addEventListener('input', titelSichern);

  const worteAnzeige = el('span', { class: 'sr-worte' }, String(startWorte));
  const kerzenhalter = el('div', { class: 'kerzenhalter' });

  const istRich = doc.format === 'rich';
  let richPaket = null;
  const ta = istRich
    ? (richPaket = baueRichEditor(doc, { beiSpeichern: (d) => { if (typeof klangkarteMerken === 'function') klangkarteMerken(d); }, class: 'sr-text', platzhalter: 'Schreib einfach. Der Rest der Welt wartet draußen.', warten: 500 })).editor
    : el('textarea', { class: 'sr-text text', placeholder: 'Schreib einfach. Der Rest der Welt wartet draußen.' });
  if (!istRich) ta.value = doc.text || '';
  const spiegel = el('div', { class: 'sr-spiegel text', 'aria-hidden': 'true' });
  const wrap = el('div', { style: 'position:relative' }, istRich ? null : spiegel, ta);
  const spalte = el('div', { class: 'sr-spalte ' + (D.einst.breite || 'mittel') }, istRich ? richPaket.leiste : null, wrap);
  const mitte = el('div', { class: 'sr-mitte' }, spalte);

  const klangKnopf = el('button', { class: 'rundknopf zart' + ((klangAktiv() || (typeof ambienceAktiv === 'function' && ambienceAktiv())) ? ' klang-an' : ''), html: ik('klang'), title: 'Klang öffnen', onclick: () => { oeffneMischpult(); } });
  const vorleseKnopf = el('button', { class: 'rundknopf zart vorlese-knopf', html: ik('vorlesen'), title: 'Vorlesen lassen (nochmal tippen: Stopp)', onclick: (e) => {
    vorlesen((doc.titel ? doc.titel + '. ' : '') + srAktuellerText(), e.currentTarget);
  } });

  const kopf = el('div', { class: 'sr-kopf' },
    el('button', { class: 'knopf', onclick: () => schliesseSchreibraum(true) }, el('span', { html: ik('haken'), style: 'display:flex' }), 'Fertig'),
    titel,
    kerzenhalter,
    worteAnzeige,
    typeof speicherAnzeige === 'function' ? speicherAnzeige() : null,
    vorleseKnopf,
    typeof diktatKnopf === 'function' ? diktatKnopf(() => (_sr ? _sr.ta : null)) : null,
    klangKnopf,
    /* Ältere Texte sind noch schlicht. Ein Tipp, und sie lassen sich formatieren. */
    istRich ? null : el('button', { class: 'rundknopf zart', title: 'Text formatieren (fett, kursiv, Überschriften …)', onclick: () => {
      doc.format = 'rich'; doc.rich = richAusText(srAktuellerText()); speichere(doc);
      const id = doc.id; schliesseSchreibraum(); setTimeout(() => oeffneSchreibraum(id), 30);
    } }, 'Aa'),
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
  /* Die Scrollleiste: in langen Texten die schnellste Art, an eine Stelle zu
     kommen. Die Fahne zeigt beim Ziehen die Überschrift, nicht nur Prozent. */
  if (typeof scrollleiste === 'function') {
    try { scrollleiste(mitte, { ziel: raum, marken: (b) => scrollMarkenAusUeberschriften(b, 'h1, h2, h3'), fahne: scrollFahneText(mitte) }); } catch (x) {}
  }
  _sr = { raum, doc, ta, spiegel, mitte, kopf, spalte, startWorte, sprint: null, klangKnopf, istRich, richPaket, titelSichern };

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
    if (typeof klangkarteMerken === 'function') klangkarteMerken(doc);
    speichere(doc);
    zaehleWorte(doc.id, doc.text);
  }, 500, true);
  /* Das zweite Netz: während des Schreibens liegt der Text auch in der Rettungskopie —
     ein anderer Speicher, den der Browser anders behandelt. Kostet nichts und rettet alles. */
  const rettung = typeof rettungSchreiben === 'function' ? entprellt(() => {
    rettungSchreiben(doc.id, doc.titel,
      istRich ? (ta.textContent || doc.text || '') : ta.value,
      istRich ? ta.innerHTML : null);
  }, 3000, true) : null;
  if (rettung) { _sr.rettung = rettung; }
  /* Eine einzige, entprellte Nachfuehrung — nie mehrere gleichzeitig. */
  const zentriereSpaeter = entprellt(() => zentriereZeile(), 130);
  _sr.zentriereSpaeter = zentriereSpaeter;
  _sr.sichern = sichern;
  if (typeof klangkarteAnbieten === 'function') setTimeout(() => klangkarteAnbieten(doc), 900);
  if (typeof pauseErinnerungStart === 'function') pauseErinnerungStart();
  /* Jeder Anschlag ist ein kleiner Luftzug für die Kerze. */
  ta.addEventListener('input', () => { if (_sr && _sr.sprint && _sr.sprint.kerze) _sr.sprint.kerze.puste(.22); if (_sr && _sr.rettung) _sr.rettung(); });

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
    const roh = istRich ? richReinerText(ta.innerHTML) : ta.value;
    const n = worte(roh);
    const dazu = n - startWorte;
    worteAnzeige.textContent = String(n) + (dazu > 0 ? ' · +' + dazu : '');
    worteAnzeige.title = n.toLocaleString('de-DE') + ' Wörter · ' + roh.length.toLocaleString('de-DE')
      + ' Zeichen · etwa ' + Math.max(1, Math.round(n / 200)) + ' Min. Lesezeit';
    kopf.classList.add('versunken');
    aktualisiereSpiegel();
    /* Nachfuehren erst, wenn ein Moment Ruhe ist. Auf dem iPad laeuft nach
       jedem Anschlag noch die Autokorrektur und haelt eigene Bereiche im
       Text; wer da den Textbereich scrollt, verschiebt den Cursor — er
       sprang mitten in ein Wort weiter oben. Ein Zehntel Sekunde genuegt. */
    if (D.einst.typewriter || istRich) zentriereSpaeter();
    if (D.einst.tagesziel > 0 && !zielKlangGespielt) {
      const heute = (D.stats.tage[tagKey()] || 0);
      if (heute >= D.einst.tagesziel) { zielKlangGespielt = true; glocke(); toast('Tagesziel. Der Rest ist Geschenk.'); }
    }
  });
  ta.addEventListener('keydown', (e) => {
    if (D.einst.tastenklang && e.key.length === 1) tippKlick();
    if (e.key === 'Escape') { schliesseSchreibraum(true); return; }
    const cmd = e.metaKey || e.ctrlKey;
    /* Die Griffe, die man aus jedem Schreibprogramm im Finger hat. */
    if (cmd && e.key.toLowerCase() === 's') { e.preventDefault(); friereEin(); return; }
    if (cmd && e.key.toLowerCase() === 'f') { e.preventDefault(); sucheErsetze(); return; }
    if (cmd && e.key === 'Enter') { e.preventDefault(); schliesseSchreibraum(true); return; }
    /* Tab rückt ein, statt den Fokus aus dem Text zu werfen. */
    if (e.key === 'Tab' && !istRich) {
      e.preventDefault();
      const s0 = ta.selectionStart, e0 = ta.selectionEnd;
      ta.value = ta.value.slice(0, s0) + '\t' + ta.value.slice(e0);
      ta.setSelectionRange(s0 + 1, s0 + 1);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  /* Waehrend die Autokorrektur oder eine andere Eingabehilfe am Wort
     arbeitet, wird gar nichts nachgefuehrt. */
  ta.addEventListener('compositionstart', () => { if (_sr) _sr.komponiert = true; });
  ta.addEventListener('compositionend', () => { if (_sr) { _sr.komponiert = false; zentriereSpaeter(); } });
  document.addEventListener('selectionchange', spiegelBeiAuswahl);
  raum.addEventListener('pointerdown', (e) => { if (!e.target.closest('.zeichenleiste')) kopf.classList.remove('versunken'); });

  aktualisiereSpiegel();
  /* Hängt an diesem Text ein Klangbild? Dann legt es sich von selbst auf. */
  if (typeof klangbildFolgen === 'function') klangbildFolgen(doc).catch(() => {});
  setTimeout(() => {
    ta.focus();
    if (!istRich) ta.setSelectionRange(ta.value.length, ta.value.length);
    if (!istRich && D.einst.typewriter) zentriereZeile();
  }, 80);

  function spiegelBeiAuswahl() {
    if (!_sr || document.activeElement !== ta) return;
    aktualisiereSpiegel();
    /* Beim Setzen des Cursors wird NICHT gescrollt: wer hintippt, hat sich die
       Stelle gerade ausgesucht. Nur die Schreibmaschine zieht die Zeile nach —
       das ist ihr ganzer Zweck. Frueher scrollte auch formatierter Text bei
       jeder Auswahlaenderung; auf dem iPad geschieht das mitten in der noch
       nicht abgeschlossenen Tippgeste und verschiebt den Cursor. */
    if (D.einst.typewriter) zentriereZeile();
  }
  /* Safari schiebt bei formatiertem Text gern das Fenster — zurück damit. */
  if (istRich) window.addEventListener('scroll', srFensterZurueck, { passive: true });
  _sr.spiegelBeiAuswahl = spiegelBeiAuswahl;
}

/* Safari schiebt bei formatiertem Text das Fenster, um den Cursor zu zeigen.
   Das Geruest steht aber fest — also zurueck. Nur nicht, waehrend eine
   Eingabehilfe am Wort arbeitet: dann wuerde das Zurueckschieben den Cursor
   mitnehmen. */
function srFensterZurueck() { if (_sr && !_sr.komponiert && window.scrollY) window.scrollTo(0, 0); }
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
  if (typeof pauseErinnerungStopp === 'function') pauseErinnerungStopp();
  if (typeof _diktat !== 'undefined' && _diktat && typeof diktatStopp === 'function') diktatStopp();
  const sitzungOffen = typeof _sitzung !== 'undefined' && _sitzung && !_sr.sprint;
  if (typeof vorlesenStopp === 'function') vorlesenStopp();
  _sr.sichern && _sr.sichern.sofort();
  if (_sr.titelSichern) { _sr.titelSichern.sofort(); if (_sr.titelSichern.loesen) _sr.titelSichern.loesen(); }
  if (_sr.sichern && _sr.sichern.loesen) _sr.sichern.loesen();
  document.removeEventListener('selectionchange', _sr.spiegelBeiAuswahl);
  window.removeEventListener('scroll', srFensterZurueck);
  if (_sr.sprint) { const k = _sr.sprint.kerze; beendeSprint(true); if (k) k.entfernen(); }
  const geschrieben = worte(srAktuellerText()) - _sr.startWorte;
  _sr.raum.remove();
  _sr = null;
  if (zurueck && geschrieben > 30) toast('+' + geschrieben + ' Wörter. Gut gemacht.');
  zeichne();
  if (sitzungOffen && typeof sitzungBilanz === 'function') setTimeout(() => sitzungBilanz(true), 250);
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
/* Formatierter Text: iPad-Safari scrollt sonst das ganze Fenster, um den
   Cursor zu zeigen — die feste Bühne springt, man sieht nicht mehr, wo man
   schreibt. Hier wird stattdessen der Textbereich selbst gescrollt: mit
   Schreibmaschine auf 42 % Höhe, sonst nur so weit, dass der Cursor nicht
   unter die Tastaturkante gerät. */
function zentriereZeileRich(sanft) {
  if (!_sr || !_sr.istRich) return;
  /* Solange eine Eingabehilfe am Wort arbeitet: Finger weg. */
  if (_sr.komponiert) return;
  const { ta, mitte } = _sr;
  const sel = window.getSelection && window.getSelection();
  if (!sel || !sel.rangeCount || !ta.contains(sel.anchorNode)) return;
  /* Gemessen, nicht geschrieben: frueher wurde hier ein Messpunkt in den Text
     gesetzt und danach normalize() gerufen — das hat den Cursor beim Tippen
     mitten in ein Wort weiter oben springen lassen. Siehe caretRechteck. */
  const box = typeof caretRechteck === 'function' ? caretRechteck(sel, ta) : sel.getRangeAt(0).getBoundingClientRect();
  if (!box || !box.height) return;
  const m = mitte.getBoundingClientRect();
  const oben = box.top - m.top, unten = box.bottom - m.top;
  /* Hart setzen, nicht sanft rollen: eine laufende Rollbewegung waehrend des
     Schreibens ist genau das, was den Cursor verrutschen laesst. Und eine
     Totzone, damit nicht wegen zwei Pixeln gezappelt wird. */
  const setzeScroll = (ziel) => {
    const z = Math.max(0, Math.round(ziel));
    if (Math.abs(mitte.scrollTop - z) < 10) return;
    if (sanft) mitte.scrollTo({ top: z, behavior: 'smooth' }); else mitte.scrollTop = z;
  };
  if (D.einst.typewriter) {
    setzeScroll(mitte.scrollTop + oben - m.height * .42);
  } else if (unten > m.height - 120 || oben < 64) {
    setzeScroll(mitte.scrollTop + unten - m.height * .55);
  }
  /* Und das Fenster bleibt, wo es hingehört. */
  if (window.scrollY) window.scrollTo(0, 0);
}
function zentriereZeile() {
  if (!_sr) return;
  if (_sr.istRich) { zentriereZeileRich(false); return; }
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
    zeileFuer('Vorlesetempo', wahl([[.8, 'Ruhig'], [.95, 'Normal'], [1.15, 'Zügig']], begrenze(s.vorleseTempo, .6, 1.4, .95), (v) => { s.vorleseTempo = v; })),
    zeileFuer('Pause nach 40 Minuten', wahl([[true, 'Erinnern'], [false, 'Aus']], s.pausenErinnerung !== false, (v) => { s.pausenErinnerung = v; })),
    el('div', { class: 'reihe', style: 'justify-content:flex-start;flex-wrap:wrap;gap:8px' },
      el('button', { class: 'knopf', onclick: () => { zu(); sucheErsetze(); } }, el('span', { html: ik('suche'), style: 'display:flex' }), 'Suchen & Ersetzen'),
      el('button', { class: 'knopf', onclick: () => { zu(); friereEin(); } }, el('span', { html: ik('frieren'), style: 'display:flex' }), 'Stand einfrieren'),
      typeof zeigeTextlupe === 'function' ? el('button', { class: 'knopf', onclick: () => { zu(); zeigeTextlupe(doc, srAktuellerText()); } }, el('span', { html: ik('suche'), style: 'display:flex' }), 'Textlupe') : null,
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
          { text: 'Mit jetzt vergleichen — Wort für Wort', icon: 'suche', wert: 'diff' },
          { text: 'Diesen Stand vergessen', icon: 'muell', wert: 'weg', rot: true }
        ], fmtDatum(st.wann) + ', ' + fmtZeit(st.wann));
        if (wahl === 'zurueck') {
          friereEin();
          srSetzeText(st.text);
          _sr.doc.titel = st.titel; const tf = _sr.raum.querySelector('.sr-titel'); if (tf) tf.value = st.titel;
          _sr.sichern.sofort();
          zeichne();
          toast('Zurückgeholt.');
        } else if (wahl === 'sehen') {
          const bogen = el('div', { class: 'lesebogen' },
            el('div', { class: 'innen' },
              el('h1', {}, st.titel || 'Stand vom ' + fmtDatum(st.wann)),
              el('div', { class: 'lmeta' }, worte(st.text) + ' Wörter · eingefroren ' + fmtDatum(st.wann) + ', ' + fmtZeit(st.wann) + (st.auto ? ' · automatisch' : '')),
              el('div', { class: 'lesetext' }, st.text)));
          const leiste2 = el('div', { class: 'schwebeleiste' },
            el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Stand schließen', onclick: () => { bogen.remove(); leiste2.remove(); } }));
          document.body.append(bogen, leiste2);
        } else if (wahl === 'diff') {
          if (typeof staendeVergleichen === 'function') staendeVergleichen(doc, st, srAktuellerText());
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
  const startWorte = worte(srAktuellerText());
  /* Die Kerze steht rechts unten im Raum und brennt über die Zeit herunter.
     Sie selbst meldet das Ende — kein zweiter Timer, der auseinanderläuft. */
  const kerze = kerzeAnzuenden({
    minuten,
    beiEnde: () => beendeSprint(false),
    beiTipp: async () => {
      if (!_sr || !_sr.sprint) return;
      const m = Math.ceil(kerze.rest() / 60000);
      const wahl = await menue([
        { text: 'Weiterbrennen lassen', icon: 'feuer', wert: 'weiter' },
        { text: 'Ausblasen (Kerze beenden)', icon: 'kreuz', wert: 'aus', rot: true }
      ], m > 1 ? 'Noch etwa ' + m + ' Minuten.' : 'Gleich ausgebrannt.');
      if (wahl === 'aus') beendeSprint(true);
    }
  });
  _sr.raum.append(kerze.element);
  _sr.raum.classList.add('kerze-brennt');
  _sr.sprint = { startWorte, minuten, kerze };
  toast('Die Kerze brennt. ' + minuten + ' Minuten gehören dir.');
}
function beendeSprint(abgebrochen) {
  if (!_sr || !_sr.sprint) return;
  const sp = _sr.sprint;
  _sr.sprint = null;
  _sr.raum.classList.remove('kerze-brennt');
  if (sp.kerze) { if (abgebrochen) sp.kerze.ausblasen(); else setTimeout(() => sp.kerze.entfernen(), 4500); }
  if (!abgebrochen) {
    if (typeof schreibtischWachsVerbrennen === 'function') schreibtischWachsVerbrennen(sp.minuten);
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
  /* Lief eine Sitzung, kommt jetzt ihre Bilanz */
  if (typeof sitzungBilanz === 'function') setTimeout(() => sitzungBilanz(!!abgebrochen), abgebrochen ? 0 : 900);
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
