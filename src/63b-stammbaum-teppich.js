/* ===================== 63b — DER TEPPICH, AUFGEHÄNGT =====================
   Ein gewebtes Tuch in einem schweren Rahmen. Oben und unten läuft ein
   heller Streifen mit einem Spruch in Versalien. Auf dem Tuch: helle Äste,
   die von unten links aufsteigen, Eichenlaub daran, und auf jedem Ast ein
   Band mit einem Namen darauf.

   Keine Bilder. Ein Name auf einem Band, daneben ein geritztes Zeichen, wenn
   man eines geben will — mehr braucht es nicht, und mehr legt auch nichts
   fest.

   Alles wird als SVG gezeichnet: das bleibt scharf, wenn man hineinzoomt,
   lässt sich anfassen, und ein Ast ist wirklich eine Kurve und keine
   gedrehte Kiste. */

const TEP_SPALTE = 300;     /* Breite einer Generation in Bildpunkten */
const TEP_REIHE = 118;      /* Höhe einer Namensreihe — hoch genug, dass ein
                               Zeichen über dem Band nicht in die Reihe
                               darüber ragt, und ein Brandloch erst recht nicht */
const TEP_RAND_X = 330;
const TEP_RAND_Y = 112;      /* oben knapp — der Baum soll das Tuch füllen */
const TEP_FUSS = 300;        /* unten mehr: dort steht der Stamm mit Wurzeln */
const TEP_BAND_B = 168;     /* Mindestbreite eines Namensbands */
const TEP_BAND_H = 30;

/* Wie breit das Band einer Person wirklich wird. Die Äste müssen es wissen,
   sonst laufen sie bei langen Namen mitten durch die Schrift. */
function teppichBandBreite(person) {
  const n = (teppichName(person) || 'ohne Namen').toUpperCase();
  return Math.max(TEP_BAND_B, Math.min(340, n.length * 6.6 + 26));
}

let _tep = {
  id: '', zoom: 1, suche: '', stumm: [], nurPerson: '', werkzeug: 'zeigen',
  laub: true, wind: true, tiere: true
};

/* ================= DER RAUM DES WERKZEUGS ================= */
function stammbaumWerkzeug(zurueck) {
  const baeume = stammbaeume();
  const buehne = el('div', { class: 'stb-werkzeug' });

  const zeichne = () => {
    const liste = stammbaeume();
    buehne.innerHTML = '';
    anfuegen(buehne,
      el('div', { class: 'stb-wkopf' },
        el('button', { class: 'stb-zurueck', onclick: () => { if (zurueck) zurueck(); } }, '‹ Kabinett'),
        el('div', { class: 'stb-wtitel' }, el('b', {}, 'Der Wandteppich'),
          el('small', {}, 'Ein Stammbaum, der auch die Fäden kennt, die keine Familie sind.')),
        el('button', { class: 'knopf voll', onclick: () => stammbaumNeu((id) => { zeichne(); teppichOeffnen(id); }) }, 'Einen weben')),
      liste.length
        ? el('div', { class: 'stb-regal' }, ...liste.map((b, i) => stammbaumKachel(b, i, zeichne)))
        : el('div', { class: 'stb-leer' },
          el('div', { class: 'stb-leerbild', html: teppichLeerBild() }),
          el('b', {}, 'Noch hängt keiner an der Wand.'),
          el('p', {}, 'Ein Wandteppich ist kein Formular. Fang mit einem Namen an, häng einen zweiten daneben und spinn einen Faden dazwischen — der Baum ordnet sich von allein.'),
          el('button', { class: 'knopf voll', onclick: () => stammbaumNeu((id) => { zeichne(); teppichOeffnen(id); }) }, 'Den ersten weben')));
  };
  zeichne();
  return buehne;
}

function stammbaumKachel(doc, i, neu) {
  const baum = saubererStammbaum(doc);
  const z = teppichZahlen(baum);
  const stoff = teppichStoff(baum.stoff);
  return el('button', {
    class: 'stb-kachel', style: '--tuch:' + stoff[2] + ';--tuch2:' + stoff[3] + ';--n:' + Math.min(i, 20),
    onclick: () => teppichOeffnen(doc.id)
  },
    el('span', { class: 'stb-k-tuch' }, el('i', { class: 'stb-k-ast' }), el('i', { class: 'stb-k-ast zwei' })),
    el('span', { class: 'stb-k-band' }, baum.titel || 'Ohne Titel'),
    el('span', { class: 'stb-k-zahlen' },
      z.leute + (z.leute === 1 ? ' Name' : ' Namen'),
      z.faeden ? '  ·  ' + z.faeden + (z.faeden === 1 ? ' Faden' : ' Fäden') : '',
      z.generationen > 1 ? '  ·  ' + z.generationen + ' Generationen' : ''),
    el('i', { class: 'stb-k-rahmen' }));
}

function stammbaumNeu(danach) {
  const doc = neuDoc('stammbaum', Object.assign({ titel: '' }, saubererStammbaum({ titel: '' })));
  teppichEinstellungen(doc, () => { if (danach) danach(doc.id); }, true);
}

function teppichLeerBild() {
  return '<svg viewBox="0 0 120 80" width="150" height="100" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
    '<path d="M12 74 C 20 60 26 52 38 44 C 50 36 58 30 74 24"/>' +
    '<path d="M38 44 C 44 36 52 34 64 36"/><path d="M50 39 C 54 30 60 26 70 24"/>' +
    '<path d="M26 55 C 30 48 36 46 44 47"/>' +
    '<ellipse cx="76" cy="22" rx="5" ry="3.4"/><ellipse cx="66" cy="37" rx="4.4" ry="3"/><ellipse cx="46" cy="48" rx="4" ry="2.8"/>' +
    '</svg>';
}

/* ================= DEN TEPPICH AUFSCHLAGEN ================= */
function teppichOeffnen(id) {
  const doc = D.docs.get(id);
  if (!doc || doc.typ !== 'stammbaum' || doc.geloescht) { toast('Der Wandteppich ist nicht mehr da.'); return; }
  _tep.id = id;
  if (!_tep.zoom || !Number.isFinite(_tep.zoom)) _tep.zoom = 1;

  const flaeche = el('div', { class: 'tep-flaeche' });
  /* Das fallende Laub liegt in einer eigenen Scheibe UEBER dem Tuch, nicht
     darin. Lag es im scrollenden Bereich, machte jedes Blatt die Flaeche
     groesser und der Teppich bekam Rollraum, den es gar nicht gab. */
  const laubscheibe = el('div', { class: 'tep-laubfall', 'aria-hidden': 'true' });
  const buehnenkasten = el('div', { class: 'tep-buehne' }, flaeche, laubscheibe);
  const rahmen = el('div', { class: 'tep-rahmen' },
    el('div', { class: 'tep-randband oben' }),
    buehnenkasten,
    el('div', { class: 'tep-randband unten' }));
  const kasten = el('div', { class: 'tep-fenster' }, el('div', { class: 'tep-leiste' }), rahmen);
  const zu = zeigeDeck(kasten, () => { document.removeEventListener('keydown', taste); teppichAnimationenAus(); });

  const neu = () => teppichZeichne(kasten, flaeche, rahmen, neu, zu);
  const taste = (ev) => {
    if (!kasten.isConnected) { document.removeEventListener('keydown', taste); return; }
    const z = ev.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (document.querySelectorAll('.schleier').length > 1) return;
    if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); teppichZoom(0.2, flaeche, neu); }
    else if (ev.key === '-' || ev.key === '_') { ev.preventDefault(); teppichZoom(-0.2, flaeche, neu); }
    else if (ev.key === '0') { ev.preventDefault(); _tep.zoom = 1; neu(); }
    else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); teppichPersonNeu(D.docs.get(_tep.id), '', neu); }
    else if (ev.key === 'v' || ev.key === 'V') { ev.preventDefault(); teppichVerzeichnis(D.docs.get(_tep.id), neu); }
    else if (ev.key === '1') { ev.preventDefault(); _tep.werkzeug = 'zeigen'; neu(); }
    else if (ev.key === '2') { ev.preventDefault(); _tep.werkzeug = 'faden'; neu(); }
    else if (ev.key === 'Escape' && _tep.nurPerson) { ev.preventDefault(); _tep.nurPerson = ''; neu(); }
  };
  document.addEventListener('keydown', taste);
  neu();
}

function teppichZoom(delta, flaeche, neu) {
  const alt = _tep.zoom;
  _tep.zoom = Math.max(0.3, Math.min(2.4, Math.round((alt + delta) * 20) / 20));
  if (_tep.zoom === alt) return;
  /* Die Mitte des Blicks soll die Mitte bleiben, sonst rutscht der Teppich
     bei jedem Zoomen unter dem Finger weg. */
  const mx = flaeche ? (flaeche.scrollLeft + flaeche.clientWidth / 2) / alt : 0;
  const my = flaeche ? (flaeche.scrollTop + flaeche.clientHeight / 2) / alt : 0;
  neu();
  if (flaeche) {
    flaeche.scrollLeft = mx * _tep.zoom - flaeche.clientWidth / 2;
    flaeche.scrollTop = my * _tep.zoom - flaeche.clientHeight / 2;
  }
}

function teppichZeichne(kasten, flaeche, rahmen, neu, schliessen) {
  const doc = D.docs.get(_tep.id);
  if (!doc) { schliessen(); return; }
  const baum = saubererStammbaum(doc);
  const stoff = teppichStoff(baum.stoff);
  const ordnung = teppichOrdnung(baum);

  kasten.style.setProperty('--tuch', stoff[2]);
  kasten.style.setProperty('--tuch2', stoff[3]);
  /* Auch die Flaeche um das Tuch herum bekommt den Stoff — sonst sitzt ein
     kleiner Baum auf einem dunklen Loch statt auf einer Wand. */
  flaeche.style.setProperty('--tuch', stoff[2]);
  flaeche.style.setProperty('--tuch2', stoff[3]);

  /* --- Die Leiste oben --- */
  const leiste = kasten.querySelector('.tep-leiste');
  leiste.innerHTML = '';
  anfuegen(leiste, ...teppichLeisteInhalt(doc, baum, ordnung, flaeche, neu, schliessen));

  /* --- Das Randband --- */
  const spruch = (baum.spruch || baum.titel || 'STIRPS NOBILIS').toUpperCase();
  const bandText = new Array(14).fill(spruch).join('  ◆  ');
  for (const b of rahmen.querySelectorAll('.tep-randband')) {
    b.innerHTML = '';
    b.append(el('span', {}, bandText));
  }

  /* --- Das Tuch --- */
  const scrollL = flaeche.scrollLeft, scrollT = flaeche.scrollTop, warSchon = flaeche.dataset.gemalt === _tep.id;
  flaeche.innerHTML = '';
  flaeche.dataset.gemalt = _tep.id;
  const svg = teppichSVG(doc, baum, ordnung, neu);
  /* Das Tuch liegt in einem Innenkasten. Zentrierte man es direkt in der
     scrollenden Flaeche, waere der Ueberhang nach LINKS nicht mehr
     erreichbar — bei starkem Zoom kaeme man nie wieder an den Stamm. */
  flaeche.append(el('div', { class: 'tep-innen' }, svg));

  if (warSchon) { flaeche.scrollLeft = scrollL; flaeche.scrollTop = scrollT; }
  else {
    /* Beim ersten Aufschlagen auf den Stamm blicken — unten links. */
    setTimeout(() => { flaeche.scrollLeft = 0; flaeche.scrollTop = Math.max(0, flaeche.scrollHeight - flaeche.clientHeight); }, 0);
  }
  /* Ist eine Person im Blick, liegt unten eine Karte mit allem, was an ihr
     hängt — ohne dass dafür ein Fenster aufgehen muss. */
  const alteKarte = kasten.querySelector('.tep-personenkarte');
  if (alteKarte) alteKarte.remove();
  if (_tep.nurPerson) {
    const karte = teppichPersonenkarte(doc, baum, _tep.nurPerson, neu);
    if (karte) rahmen.append(karte);
  }
  teppichAnimationenAn(flaeche, svg, baum);
}

/* ----- Die Leiste ----- */
function teppichLeisteInhalt(doc, baum, ordnung, flaeche, neu, schliessen) {
  const z = teppichZahlen(baum);
  const suchfeld = el('input', { type: 'search', class: 'tep-suchfeld', placeholder: 'Namen suchen …', value: _tep.suche });
  suchfeld.addEventListener('input', entprellt(() => {
    _tep.suche = suchfeld.value; neu();
    setTimeout(() => { const f = document.querySelector('.tep-suchfeld'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0);
  }, 240, true));

  const arten = teppichSichtbareArten(baum);
  return [
    el('div', { class: 'tep-lzeile' },
      el('div', { class: 'tep-ltitel' },
        el('b', {}, baum.titel || 'Ohne Titel'),
        el('small', {}, z.leute + (z.leute === 1 ? ' Name' : ' Namen') + '  ·  ' + z.faeden + (z.faeden === 1 ? ' Faden' : ' Fäden') +
          (z.inseln > 1 ? '  ·  ' + z.inseln + ' getrennte Zweige' : ''))),
      el('div', { class: 'tep-lwerkzeug' }, el('span', { class: 'tep-lupe', html: ik('suche') }), suchfeld),
      el('div', { class: 'tep-lknoepfe' },
        /* Zwei Werkzeuge: schauen und verschieben — oder Fäden spinnen. Im
           Fadenmodus zieht man einfach von einem Namen zum anderen. */
        el('div', { class: 'tep-werkzeuge' },
          el('button', {
            class: 'tep-wz' + (_tep.werkzeug !== 'faden' ? ' an' : ''), title: 'Schauen und verschieben (Taste 1)',
            onclick: () => { _tep.werkzeug = 'zeigen'; neu(); }
          }, el('span', { class: 'tep-wzbild', html: TEP_WZ_HAND }), 'Hand'),
          el('button', {
            class: 'tep-wz' + (_tep.werkzeug === 'faden' ? ' an' : ''), title: 'Fäden spinnen — von einem Namen zum anderen ziehen (Taste 2)',
            onclick: () => { _tep.werkzeug = 'faden'; neu(); }
          }, el('span', { class: 'tep-wzbild', html: TEP_WZ_FADEN }), 'Faden')),
        el('button', { class: 'tep-wk', title: 'Kleiner (−)', onclick: () => teppichZoom(-0.2, flaeche, neu) }, '−'),
        el('button', { class: 'tep-wk zahl', title: 'Wieder auf Normalgröße (0)', onclick: () => { _tep.zoom = 1; neu(); } }, Math.round(_tep.zoom * 100) + '%'),
        el('button', { class: 'tep-wk', title: 'Größer (+)', onclick: () => teppichZoom(0.2, flaeche, neu) }, '+'),
        el('button', { class: 'tep-wk', title: 'Alles ins Bild', onclick: () => teppichEinpassen(flaeche, neu) }, '⤢'),
        baum.leute.some((p) => p.festX != null && p.festY != null)
          ? el('button', {
            class: 'tep-wk ordnen', title: 'Alles wieder ordnen lassen — die von Hand geschobenen Namen kehren an ihren gerechneten Platz zurück',
            onclick: async () => {
              const wieviele = baum.leute.filter((p) => p.festX != null && p.festY != null).length;
              if (!(await frage(wieviele === 1 ? 'Den von Hand geschobenen Namen wieder einordnen lassen?' : 'Alle ' + wieviele + ' von Hand geschobenen Namen wieder einordnen lassen?', { ja: 'Ordnen lassen' }))) return;
              await teppichSchreiben(doc, (b) => { for (const p of b.leute) { p.festX = null; p.festY = null; } return b; });
              neu();
            }
          }, '↺') : null,
        el('span', { class: 'tep-ltrenner' }),
        el('button', { class: 'knopf zart klein', title: 'Alle Namen und Fäden (v)', onclick: () => teppichVerzeichnis(doc, neu) }, 'Verzeichnis'),
        el('button', { class: 'knopf zart klein', title: 'Tuch, Spruch, Titel', onclick: () => teppichEinstellungen(doc, neu) }, 'Der Rahmen'),
        el('button', { class: 'knopf voll klein', title: 'Einen Namen aufhängen (n)', onclick: () => teppichPersonNeu(doc, '', neu) }, '+ Name'),
        el('button', { class: 'tep-zuknopf', title: 'Den Teppich abhängen', onclick: () => schliessen() }, '×'))),
    arten.length ? teppichLegende(arten, baum, neu) : null
  ];
}

/* ----- Die Legende -----
   Nach Gruppen gebündelt, damit man Blut von Klinge unterscheidet, ohne zu
   lesen. Ein Tipp schaltet eine Art stumm, ein Tipp auf den Gruppennamen die
   ganze Gruppe — und „nur diese“ blendet alles andere aus. Auf einer Wand
   mit dreissig Fäden ist das der schnellste Weg zu einer Antwort. */
function teppichLegende(arten, baum, neu) {
  const kasten = el('div', { class: 'tep-legende' });
  for (const [gid, gname, gtext] of FADEN_GRUPPEN) {
    const drin = arten.filter((a) => a.gruppe === gid);
    if (!drin.length) continue;
    const alleStumm = drin.every((a) => _tep.stumm.includes(a.id));
    kasten.append(el('div', { class: 'tep-lggruppe' },
      el('button', {
        class: 'tep-lgname' + (alleStumm ? ' stumm' : ''), title: gtext + (alleStumm ? '' : ' — ganze Gruppe ausblenden'),
        onclick: () => {
          const ids = drin.map((a) => a.id);
          _tep.stumm = alleStumm ? _tep.stumm.filter((x) => !ids.includes(x)) : [...new Set(_tep.stumm.concat(ids))];
          neu();
        }
      }, gname),
      el('button', {
        class: 'tep-lgsolo', title: 'Nur diese Gruppe zeigen',
        onclick: () => {
          const ids = drin.map((a) => a.id);
          const andere = arten.filter((a) => !ids.includes(a.id)).map((a) => a.id);
          const schonSolo = ids.every((x) => !_tep.stumm.includes(x)) && andere.every((x) => _tep.stumm.includes(x));
          _tep.stumm = schonSolo ? [] : andere;
          neu();
        }
      }, 'nur'),
      ...drin.map((a) => el('button', {
        class: 'tep-lg' + (_tep.stumm.includes(a.id) ? ' stumm' : ''),
        style: '--fadenfarbe:' + a.farbe,
        title: _tep.stumm.includes(a.id) ? 'Wieder zeigen' : 'Diese Fäden ausblenden',
        onclick: () => {
          _tep.stumm = _tep.stumm.includes(a.id) ? _tep.stumm.filter((x) => x !== a.id) : _tep.stumm.concat([a.id]);
          neu();
        }
      }, el('i', { class: 'strich-' + a.strich }), a.name, el('small', {}, String(a.anzahl))))));
  }
  if (_tep.stumm.length || _tep.nurPerson) {
    kasten.append(el('button', { class: 'tep-lgalle', onclick: () => { _tep.stumm = []; _tep.nurPerson = ''; neu(); } }, 'alles wieder zeigen'));
  }
  return kasten;
}

const TEP_WZ_HAND = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-6-2.5-6-6v-3a1.5 1.5 0 0 1 3 0"/></svg>';
const TEP_WZ_FADEN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="6" r="2.4"/><path d="M6.6 16.2C9 12 12 9 17.4 7.4"/></svg>';

function teppichSichtbareArten(baum) {
  const zaehler = new Map();
  for (const f of baum.faeden) zaehler.set(f.art, (zaehler.get(f.art) || 0) + 1);
  return [...zaehler.entries()].map(([id, anzahl]) => {
    const a = fadenArt(id, baum);
    return { id, name: a.name, farbe: a.farbe, strich: a.strich, gruppe: a.gruppe, anzahl };
  }).sort((a, b) => {
    const ga = FADEN_GRUPPEN.findIndex((g) => g[0] === a.gruppe), gb = FADEN_GRUPPEN.findIndex((g) => g[0] === b.gruppe);
    return (ga < 0 ? 99 : ga) - (gb < 0 ? 99 : gb) || b.anzahl - a.anzahl;
  });
}

/* Alles ins Bild. Zweimal gerechnet: nach dem ersten Neuzeichnen aendert
   sich die Flaeche noch (ein Rollbalken kommt oder geht), und dann waere das
   Mass schief. */
function teppichEinpassen(flaeche, neu) {
  const messen = () => {
    const svg = flaeche.querySelector('svg');
    if (!svg || !svg.viewBox || !svg.viewBox.baseVal || !svg.viewBox.baseVal.width) return null;
    const k = svg.viewBox.baseVal;
    const r = flaeche.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return Math.min((r.width - 8) / k.width, (r.height - 8) / k.height);
  };
  const eins = messen();
  if (eins == null) return;
  _tep.zoom = Math.max(0.3, Math.min(2.4, Math.round(eins * 40) / 40));
  neu();
  setTimeout(() => {
    const zwei = messen();
    if (zwei != null) {
      const besser = Math.max(0.3, Math.min(2.4, Math.round(zwei * 40) / 40));
      if (Math.abs(besser - _tep.zoom) > 0.02) { _tep.zoom = besser; neu(); }
    }
    flaeche.scrollLeft = 0; flaeche.scrollTop = 0;
  }, 30);
}

/* ----- Die Personenkarte -----
   Wer angetippt wird, tritt hervor — und hier steht, was an ihm hängt. Ein
   Fenster dafür aufzuschlagen wäre zu viel: man will schauen, nicht ändern. */
function teppichPersonenkarte(doc, baum, personId, neu) {
  const p = baum.leute.find((q) => q.id === personId);
  if (!p) return null;
  const meine = teppichFaedenVon(baum, personId);
  const name = (id) => { const q = baum.leute.find((x) => x.id === id); return teppichName(q) || 'ohne Namen'; };

  const karte = el('div', { class: 'tep-personenkarte' },
    el('div', { class: 'tep-pkkopf' },
      el('b', {}, teppichName(p) || 'ohne Namen'),
      teppichJahre(p) ? el('small', {}, teppichJahre(p)) : null,
      el('button', { class: 'tep-pkzu', title: 'Loslassen', onclick: () => { _tep.nurPerson = ''; neu(); } }, '\u00d7')),
    p.notiz ? el('p', { class: 'tep-pknotiz' }, p.notiz) : null);

  if (!meine.length) {
    karte.append(el('p', { class: 'tep-pkleer' }, 'An diesem Namen h\u00e4ngt noch kein Faden.'));
  } else {
    const liste = el('div', { class: 'tep-pkfaeden' });
    for (const f of meine) {
      const art = fadenArt(f.art, baum);
      const hin = f.von === personId;
      liste.append(el('button', {
        class: 'tep-pkfaden', style: '--fadenfarbe:' + art.farbe,
        title: 'Diesen Faden \u00e4ndern',
        onclick: () => teppichFadenBearbeiten(doc, f, neu)
      },
        el('i', { class: 'stb-fstrich strich-' + art.strich }),
        el('b', {}, art.gerichtet && !hin ? (art.gegen || ('\u2190 ' + art.name)) : art.name),
        el('span', {}, name(hin ? f.zu : f.von)),
        f.wort ? el('small', {}, f.wort) : null));
    }
    karte.append(liste);
  }
  karte.append(el('div', { class: 'tep-pkfuss' },
    el('button', { class: 'knopf zart klein', onclick: () => teppichFadenSpinnen(doc, personId, neu) }, '+ Faden'),
    el('button', { class: 'knopf zart klein', onclick: () => teppichKartusche(doc, personId, neu) }, '\u00c4ndern')));
  return karte;
}

/* ================= DAS TUCH ZEICHNEN ================= */
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(art, attrs, ...kinder) {
  const k = document.createElementNS(SVGNS, art);
  for (const a of Object.keys(attrs || {})) {
    if (attrs[a] == null) continue;
    k.setAttribute(a, String(attrs[a]));
  }
  for (const kind of kinder) if (kind) k.append(kind);
  return k;
}

function teppichSVG(doc, baum, ordnung, neu) {
  const knoten = ordnung.knoten;
  const wo = new Map(knoten.map((k) => [k.id, k]));
  const breite = TEP_RAND_X * 2 + Math.max(1, ordnung.spalten) * TEP_SPALTE;
  const hoehe = TEP_RAND_Y + Math.max(1, ordnung.reihen) * TEP_REIHE + TEP_FUSS;

  const px = (k) => TEP_RAND_X + k.x * TEP_SPALTE;
  const py = (k) => TEP_RAND_Y + k.y * TEP_REIHE;

  const svg = sv('svg', {
    viewBox: '0 0 ' + Math.round(breite) + ' ' + Math.round(hoehe),
    width: Math.round(breite * _tep.zoom), height: Math.round(hoehe * _tep.zoom),
    class: 'tep-tuch', 'shape-rendering': 'geometricPrecision'
  });

  svg.append(teppichDefs());

  /* --- Der Grund --- */
  svg.append(sv('rect', { x: 0, y: 0, width: breite, height: hoehe, class: 'tep-grund' }));
  svg.append(sv('rect', { x: 0, y: 0, width: breite, height: hoehe, class: 'tep-webung', fill: 'url(#tep-webe)' }));
  /* Alter: ein paar unregelmaessige Flecken im Gewebe, gerechnet aus dem
     Titel — derselbe Teppich hat immer dieselben Stellen. Ohne sie sieht
     das Tuch aus wie frisch aus der Fabrik. */
  for (let i = 0; i < 7; i++) {
    const fx = teppichZufall(baum.titel || 'tuch', 'fx' + i) * breite;
    const fy = teppichZufall(baum.titel || 'tuch', 'fy' + i) * hoehe;
    const fr = 60 + teppichZufall(baum.titel || 'tuch', 'fr' + i) * 190;
    svg.append(sv('ellipse', {
      cx: fx.toFixed(0), cy: fy.toFixed(0), rx: fr.toFixed(0), ry: (fr * (0.5 + teppichZufall(baum.titel || 'tuch', 'fq' + i) * 0.5)).toFixed(0),
      class: 'tep-alterfleck',
      fill: i % 2 ? 'rgba(255,238,200,.028)' : 'rgba(0,0,0,.05)'
    }));
  }
  svg.append(sv('rect', { x: 0, y: 0, width: breite, height: hoehe, class: 'tep-schatten', fill: 'url(#tep-vignette)' }));

  const gAeste = sv('g', { class: 'tep-aeste' });
  const gLaub = sv('g', { class: 'tep-laub' });
  const gRanken = sv('g', { class: 'tep-ranken' });
  const gBaender = sv('g', { class: 'tep-baender' });
  const gTiere = sv('g', { class: 'tep-tiere' });

  /* --- Der Stamm --- Er steigt unten links auf und gabelt sich in die
     Ältesten. Der Ansatz ist dick, die Gabel schon dünner: so sieht man dem
     Baum an, wo er anfängt. */
  const wurzeln = knoten.filter((k) => !k.eltern.length);
  const stammX = 176, stammY = hoehe - 56;
  const zielY = wurzeln.length ? wurzeln.reduce((s, k) => s + py(k), 0) / wurzeln.length : hoehe / 2;
  const gabelX = stammX + 58;
  const gabelY = stammY - Math.max(120, Math.min(300, (stammY - zielY) * 0.45));

  /* Wie reich geschmückt wird, hängt davon ab, wie viel auf dem Tuch hängt.
     Bei dreihundert Namen wäre volles Laub an jedem Ast eine Zeichenorgie,
     die niemand einzeln ansieht — und ein Browser, der minutenlang malt. */
  const astZahl = knoten.reduce((n, k) => n + Math.max(1, k.eltern.length ? 1 : 0), wurzeln.length);
  const dichte = astZahl > 90 ? 0.4 : astZahl > 45 ? 0.7 : 1;

  /* Beim Aufschlagen wächst der Baum: Generation für Generation kommt das
     Holz, dann legt sich das Laub darauf. Die Nummer steuert, wann. */
  const astwerk = (a, b, dick, salz, stufe) => {
    const w = teppichAstwerk(a, b, dick, salz, dichte);
    const n = String(Math.min(stufe || 0, 12));
    w.holz.style.setProperty('--gen', n);
    w.laub.style.setProperty('--gen', n);
    gAeste.append(w.holz);
    gLaub.append(w.laub);
  };

  if (knoten.length) {
    /* Der Stamm ist von Hand gezeichnet, nicht gerechnet — siehe oben. */
    gAeste.append(teppichGrund(stammX + 20, stammY + 14, 760));
    gAeste.append(teppichStammBauen(stammX, stammY, stammY - gabelY));
    for (const k of wurzeln) {
      astwerk({ x: gabelX, y: gabelY }, { x: px(k) - teppichBandBreite(k.person) / 2 - 8, y: py(k) }, 9, k.id + ':stamm', 0);
    }
  }

  /* --- Die Äste: Eltern zu Kindern --- */
  for (const k of knoten) {
    const dick = Math.max(2.6, 7.5 - k.gen * 0.55);
    const bis = { x: px(k) - teppichBandBreite(k.person) / 2 - 5, y: py(k) };
    /* Sind beide Eltern ein Paar, wächst EIN Ast aus ihrer Mitte — nicht
       zwei fast gleiche nebeneinander. */
    const paarEltern = k.eltern.length === 2 && wo.get(k.eltern[0]) && wo.get(k.eltern[1]) &&
      (wo.get(k.eltern[0]).paare || []).includes(k.eltern[1]);
    if (paarEltern) {
      const a = wo.get(k.eltern[0]), b = wo.get(k.eltern[1]);
      const rechts = Math.max(px(a) + teppichBandBreite(a.person) / 2, px(b) + teppichBandBreite(b.person) / 2) + 5;
      astwerk({ x: rechts, y: (py(a) + py(b)) / 2 }, bis, dick, k.eltern.join('+') + '>' + k.id, k.gen);
    } else {
      for (const eId of k.eltern) {
        const e = wo.get(eId);
        if (!e) continue;
        astwerk({ x: px(e) + teppichBandBreite(e.person) / 2 + 5, y: py(e) }, bis, dick, eId + '>' + k.id, k.gen);
      }
    }
    /* Paare: ein kurzer Bogen dazwischen, unter den Bändern durch. */
    for (const pId of k.paare) {
      if (k.id > pId) continue;
      const p = wo.get(pId);
      if (!p) continue;
      const oben = py(k) < py(p) ? k : p, unten = py(k) < py(p) ? p : k;
      gAeste.append(sv('path', {
        d: teppichBogen(px(oben), py(oben) + TEP_BAND_H / 2 + 3, px(unten), py(unten) - TEP_BAND_H / 2 - 3),
        class: 'tep-bund'
      }));
    }
  }

  /* --- Die Ranken: alles, was kein Gerüst ist --- */
  const nurWer = _tep.nurPerson;
  /* Laufen mehrere Fäden zwischen denselben zwei Leuten, bekommt jeder einen
     anderen Bauch — sonst lägen sie exakt übereinander und man sähe nur
     einen. */
  const paarZaehler = new Map();
  const sichtbareFaeden = baum.faeden.filter((f) => {
    const art = fadenArt(f.art, baum);
    if (art.geruest || art.paar) return false;
    if (_tep.stumm.includes(f.art) || f.still) return false;
    return wo.get(f.von) && wo.get(f.zu);
  });
  sichtbareFaeden.forEach((f, i) => {
    const art = fadenArt(f.art, baum);
    const schluessel = [f.von, f.zu].sort().join('~');
    const versatz = paarZaehler.get(schluessel) || 0;
    paarZaehler.set(schluessel, versatz + 1);
    const a = wo.get(f.von), b = wo.get(f.zu);
    const r = teppichRanke(px(a), py(a), px(b), py(b), art, f, baum, neu, versatz);
    r.style.setProperty('--n', String(Math.min(i, 40)));
    /* Ist eine Person im Blick, treten die anderen Fäden zurück. */
    if (nurWer) r.classList.add(f.von === nurWer || f.zu === nurWer ? 'imblick' : 'zurueck');
    gRanken.append(r);
  });

  /* --- Die Namensbänder --- */
  const treffer = _tep.suche.trim() ? new Set(teppichSuche(baum, _tep.suche).map((p) => p.id)) : null;
  knoten.forEach((k, i) => {
    gBaender.append(teppichBand(k, px(k), py(k), baum, treffer, i, neu));
  });

  /* --- Das Wappen des Hauses, unten am Stamm --- */
  /* Das Wappen hängt NEBEN dem Stamm an einem Nagel, nicht mitten darauf —
     dort verdeckte es die Rinde und sah aus wie aufgeklebt. */
  if (knoten.length) gBaender.append(teppichWappen(stammX + 176, Math.min(stammY - 250, (stammY + gabelY) / 2), baum));

  /* --- Kleines Getier --- Am Fuß des Baumes sitzt still etwas, so wie in
     alten Wandteppichen unten in den Ecken. Und ab und zu huscht eines
     über einen Ast. */
  if (knoten.length) {
    /* Größer, als man zuerst denkt: klein gezeichnet lesen sich Tiere als
       Knäuel und Gekritzel. Ein Rabe muss ein Rabe sein, kein Fleck. */
    gTiere.append(teppichSchlange(stammX + 330, stammY + 4, 1.7));
    if (knoten.length > 3) gTiere.append(teppichRabe(stammX + 196, stammY - 22, 2.1));
    gTiere.append(teppichFarn(stammX - 196, stammY + 4, 2.1, false));
    gTiere.append(teppichFarn(stammX - 152, stammY + 8, 1.5, true));
    gTiere.append(teppichFarn(stammX + 252, stammY + 4, 1.8, true));
    gTiere.append(teppichPilz(stammX - 232, stammY + 6, 2.0, 'p1'));
    gTiere.append(teppichPilz(stammX - 212, stammY + 9, 1.4, 'p2'));
    gTiere.append(teppichPilz(stammX + 292, stammY + 6, 1.7, 'p3'));
  }
  if (_tep.tiere && knoten.length > 2) gTiere.append(teppichEichhoernchen(breite, hoehe));

  svg.append(gAeste, gLaub, gRanken, gBaender, gTiere);
  /* Auf das leere Tuch tippen laesst die Person wieder los. */
  svg.addEventListener('click', (ev) => {
    if (ev.target.closest && ev.target.closest('.tep-person, .tep-ranke')) return;
    if (_tep.nurPerson) { _tep.nurPerson = ''; if (neu) neu(); }
  });
  return svg;
}

function teppichDefs() {
  const defs = sv('defs', {});
  /* Webung: feine Kett- und Schussfäden */
  const muster = sv('pattern', { id: 'tep-webe', width: 6, height: 6, patternUnits: 'userSpaceOnUse' });
  muster.append(sv('rect', { width: 6, height: 6, fill: 'none' }));
  muster.append(sv('path', { d: 'M0 0 H6', stroke: 'rgba(255,255,255,.035)', 'stroke-width': 1 }));
  muster.append(sv('path', { d: 'M0 3 H6', stroke: 'rgba(0,0,0,.06)', 'stroke-width': 1 }));
  muster.append(sv('path', { d: 'M0 0 V6', stroke: 'rgba(255,255,255,.022)', 'stroke-width': 1 }));
  defs.append(muster);

  const vig = sv('radialGradient', { id: 'tep-vignette', cx: '50%', cy: '46%', r: '72%' });
  vig.append(sv('stop', { offset: '55%', 'stop-color': 'rgba(0,0,0,0)' }));
  vig.append(sv('stop', { offset: '100%', 'stop-color': 'rgba(0,0,0,.42)' }));
  defs.append(vig);

  /* Brandloch: versengter Rand statt sauberem Kreis */
  const brand = sv('filter', { id: 'tep-brand', x: '-40%', y: '-40%', width: '180%', height: '180%' });
  brand.append(sv('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.06', numOctaves: '4', seed: '7', result: 'rauschen' }));
  brand.append(sv('feDisplacementMap', { in: 'SourceGraphic', in2: 'rauschen', scale: '11', xChannelSelector: 'R', yChannelSelector: 'G' }));
  defs.append(brand);

  /* Brokat: das Muster, mit dem Stamm und Aeste gefuellt sind. Genau das
     macht aus einer Vektorform ein Gewebe — ein flaches Cremefarben sieht
     aus wie ein Diagramm, ein Rautengitter mit Rosetten sieht aus wie ein
     Wandteppich. Gedreht, damit das Gitter nicht mit den Aesten fluchtet. */
  const brokat = sv('pattern', { id: 'tep-brokat', width: 17, height: 17, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(38)' });
  brokat.append(sv('rect', { width: 17, height: 17, fill: '#ded6bc' }));
  brokat.append(sv('path', { d: 'M0 8.5 H17 M8.5 0 V17', stroke: '#c9bfa0', 'stroke-width': 1.1 }));
  brokat.append(sv('circle', { cx: 8.5, cy: 8.5, r: 2.9, fill: 'none', stroke: '#c9bfa0', 'stroke-width': 1.1 }));
  brokat.append(sv('circle', { cx: 0, cy: 0, r: 1.5, fill: '#c9bfa0' }));
  brokat.append(sv('circle', { cx: 17, cy: 17, r: 1.5, fill: '#c9bfa0' }));
  defs.append(brokat);

  /* Dasselbe Muster feiner — fuer die duenneren Aeste. */
  const brokatFein = sv('pattern', { id: 'tep-brokat-fein', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(38)' });
  brokatFein.append(sv('rect', { width: 10, height: 10, fill: '#e2dac0' }));
  brokatFein.append(sv('path', { d: 'M0 5 H10 M5 0 V10', stroke: '#cec4a5', 'stroke-width': .8 }));
  defs.append(brokatFein);

  /* Der Stoff des Namensbands: oben heller, unten im Schatten. Ein flaches
     Grau sah aus wie Papier aus dem Drucker. */
  const bandfarbe = sv('linearGradient', { id: 'tep-bandfarbe', x1: '0', y1: '0', x2: '0', y2: '1' });
  bandfarbe.append(sv('stop', { offset: '0%', 'stop-color': '#c3c9b2' }));
  bandfarbe.append(sv('stop', { offset: '45%', 'stop-color': '#aeb59c' }));
  bandfarbe.append(sv('stop', { offset: '100%', 'stop-color': '#949c82' }));
  defs.append(bandfarbe);

  /* Der Grund verlaeuft nach unten ins Dunkle, statt als Balken dazuliegen. */
  const grund = sv('linearGradient', { id: 'tep-grundverlauf', x1: '0', y1: '0', x2: '0', y2: '1' });
  grund.append(sv('stop', { offset: '0%', 'stop-color': 'rgba(0,0,0,.30)' }));
  grund.append(sv('stop', { offset: '55%', 'stop-color': 'rgba(0,0,0,.16)' }));
  grund.append(sv('stop', { offset: '100%', 'stop-color': 'rgba(0,0,0,0)' }));
  defs.append(grund);

  const glut = sv('radialGradient', { id: 'tep-glut', cx: '50%', cy: '50%', r: '50%' });
  glut.append(sv('stop', { offset: '0%', 'stop-color': '#0a0806' }));
  glut.append(sv('stop', { offset: '62%', 'stop-color': '#120d09' }));
  glut.append(sv('stop', { offset: '84%', 'stop-color': '#3a2313' }));
  glut.append(sv('stop', { offset: '100%', 'stop-color': 'rgba(90,60,30,0)' }));
  defs.append(glut);

  return defs;
}

/* ===================== DAS ASTWERK =====================
   Ein echter Ast ist keine Kurve. Er ist ein Körper, der sich gabelt, an den
   Gabelungen anschwillt, in Zweige ausläuft, und an deren Enden hängt das
   Laub in Büscheln — mit Eicheln dazwischen und einer Ranke, die sich am
   Ende einrollt.

   Deshalb wird hier nicht gestrichen, sondern gebaut: die Mittellinie wird
   abgetastet, quer aufgetragen und zu einer geschlossenen Fläche geschlossen.
   Aus derselben Mittellinie kommen dann die Zweige, das Laub und die Eicheln
   — alles aus der Kennung gerechnet, damit derselbe Ast beim nächsten
   Aufschlagen dieselben Knoten hat. */

const TEP_AST_PUNKTE = 30;

function _bez(t, p0, c1, c2, p3) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p3;
}
function _bezAbleitung(t, p0, c1, c2, p3) {
  const u = 1 - t;
  return 3 * u * u * (c1 - p0) + 6 * u * t * (c2 - c1) + 3 * t * t * (p3 - c2);
}
function _zahl(n) { return (Math.round(n * 10) / 10).toString(); }

/* Aus einer Mittellinie (Punkte + Querrichtungen + Breiten) eine Fläche. */
/* ----- Glatte Umrisse -----
   Ein Umriss aus lauter geraden Stücken hat Facetten — beim Hineinzoomen
   sieht man jede einzelne, und aus dem Ast wird ein Vieleck. Deshalb werden
   die abgetasteten Punkte hier in Kurven übersetzt (Catmull-Rom nach
   Bézier): der Umriss läuft durch dieselben Punkte, aber weich. */
function _glatt(punkte, anfang) {
  const n = punkte.length;
  if (n < 2) return '';
  const hol = (i) => punkte[Math.max(0, Math.min(n - 1, i))];
  let d = (anfang === false ? ' L ' : 'M ') + _zahl(punkte[0][0]) + ' ' + _zahl(punkte[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = hol(i - 1), p1 = punkte[i], p2 = punkte[i + 1], p3 = hol(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C ' + _zahl(c1x) + ' ' + _zahl(c1y) + ', ' + _zahl(c2x) + ' ' + _zahl(c2y) + ', ' + _zahl(p2[0]) + ' ' + _zahl(p2[1]);
  }
  return d;
}
/* Links und rechts dürfen verschieden breit sein — ein alter Stamm ist
   nirgends symmetrisch, und die Wurzelanläufe sitzen auf beiden Seiten
   woanders. */
function _flaeche(punkte) {
  const links = [], rechts = [];
  for (const q of punkte) {
    const wl = q.wl == null ? q.w : q.wl, wr = q.wr == null ? q.w : q.wr;
    links.push([q.x + q.nx * wl, q.y + q.ny * wl]);
    rechts.push([q.x - q.nx * wr, q.y - q.ny * wr]);
  }
  const zurueck = rechts.slice().reverse();
  return { d: _glatt(links) + _glatt(zurueck, false) + ' Z', links, rechts };
}
function _kante(punkte, seite) {
  return _glatt(punkte.map((q) => {
    const w = seite > 0 ? (q.wl == null ? q.w : q.wl) : (q.wr == null ? q.w : q.wr);
    return [q.x + q.nx * w * seite, q.y + q.ny * w * seite];
  }));
}

/* Ein gerades Stück Holz: von einem Punkt in eine Richtung, mit Krümmung. */
function _zweigLinie(x, y, winkel, laenge, bogen, dickA, dickB, punkte) {
  const n = punkte || 12;
  const raus = [];
  const rad = winkel * Math.PI / 180, bog = bogen * Math.PI / 180;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    /* Der Zweig biegt sich zunehmend — deshalb wächst der Winkel mit t². */
    const w = rad + bog * t * t;
    const s = laenge * t;
    raus.push({
      x: x + Math.cos(rad) * s * (1 - t * 0.18) + Math.cos(w) * s * t * 0.18,
      y: y + Math.sin(rad) * s * (1 - t * 0.18) + Math.sin(w) * s * t * 0.18,
      winkel: (w * 180) / Math.PI,
      t
    });
  }
  /* Querrichtungen aus den Nachbarpunkten */
  for (let i = 0; i <= n; i++) {
    const a = raus[Math.max(0, i - 1)], b = raus[Math.min(n, i + 1)];
    const tx = b.x - a.x, ty = b.y - a.y;
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    raus[i].nx = -ty / len; raus[i].ny = tx / len;
    raus[i].w = Math.max(0.35, (dickA + (dickB - dickA) * raus[i].t) / 2);
  }
  return raus;
}

/* Eine kleine Einrollung am Ende eines Zweigs — die Spitze eines jungen
   Triebs. Sie macht mehr aus als alles andere: sie sagt „gewachsen“. */
function _ranke(x, y, winkel, groesse, richtung) {
  let d = 'M ' + _zahl(x) + ' ' + _zahl(y);
  let wx = x, wy = y, w = winkel, r = groesse;
  for (let i = 0; i < 5; i++) {
    w += richtung * 62;
    r *= 0.72;
    const nx = wx + Math.cos((w - richtung * 31) * Math.PI / 180) * r;
    const ny = wy + Math.sin((w - richtung * 31) * Math.PI / 180) * r;
    const ex = wx + Math.cos(w * Math.PI / 180) * r * 0.9;
    const ey = wy + Math.sin(w * Math.PI / 180) * r * 0.9;
    d += ' Q ' + _zahl(nx) + ' ' + _zahl(ny) + ' ' + _zahl(ex) + ' ' + _zahl(ey);
    wx = ex; wy = ey;
  }
  return d;
}

/* Ein Laubbüschel: mehrere Blätter fächerförmig um einen Punkt. */
function _bueschel(x, y, winkel, wieviele, salz, gross) {
  const raus = [];
  for (let i = 0; i < wieviele; i++) {
    const faecher = (i - (wieviele - 1) / 2) * (58 / Math.max(1, wieviele - 1) + 14);
    const dreh = winkel + faecher + teppichDreh(salz, 'bf' + i, 9);
    const g = 0.34 + teppichZufall(salz, 'bg' + i) * 0.3;
    const weg = 4 + teppichZufall(salz, 'bw' + i) * 7;
    const ton = 'ton-' + (teppichHash(salz, 'bt' + i) % 4);
    const gr = sv('g', {
      class: 'tep-blatt ' + ton,
      transform: 'translate(' + _zahl(x + Math.cos(dreh * Math.PI / 180) * weg) + ' ' + _zahl(y + Math.sin(dreh * Math.PI / 180) * weg) + ') ' +
        'rotate(' + Math.round(dreh + 90) + ') scale(' + ((gross || 1) * g).toFixed(2) + ')'
    });
    gr.append(sv('path', { d: TEP_EICHENBLATT, class: 'tep-blattform' }));
    gr.append(sv('path', { d: TEP_BLATTADERN, class: 'tep-blattader' }));
    raus.push(gr);
  }
  return raus;
}

/* Eine Eichel. Ohne sie ist es irgendein Baum; mit ihr ist es eine Eiche. */
function _eichel(x, y, winkel, salz) {
  const g = sv('g', {
    class: 'tep-eichel',
    transform: 'translate(' + _zahl(x) + ' ' + _zahl(y) + ') rotate(' + Math.round(winkel + 90) + ') scale(' + (0.7 + teppichZufall(salz, 'eg') * 0.4).toFixed(2) + ')'
  });
  g.append(sv('path', { class: 'tep-eichelfrucht', d: 'M -3.6 -1 C -3.6 4.6 -2 7.4 0 7.4 C 2 7.4 3.6 4.6 3.6 -1 Z' }));
  g.append(sv('path', { class: 'tep-eichelkappe', d: 'M -4.6 -1.6 C -4.6 -4.4 -2.6 -5.8 0 -5.8 C 2.6 -5.8 4.6 -4.4 4.6 -1.6 C 4.6 -0.2 2.6 0.4 0 0.4 C -2.6 0.4 -4.6 -0.2 -4.6 -1.6 Z' }));
  g.append(sv('path', { class: 'tep-eichelstiel', d: 'M 0 -5.8 L 0 -8.4' }));
  return g;
}

/* ----- Das ganze Astwerk zwischen zwei Punkten ----- */
function teppichAstwerk(a, b, dicke, salz, dichte) {
  const d = dichte == null ? 1 : dichte;
  const holz = sv('g', { class: 'tep-astgruppe', 'data-salz': salz });
  const laub = sv('g', { class: 'tep-laubgruppe' });

  /* --- Die Mittellinie --- */
  const dx = b.x - a.x;
  const hoch = teppichZufall(salz, 'hoch') * 30 - 15;
  const c1x = a.x + dx * 0.42, c1y = a.y + hoch * 0.4;
  const c2x = a.x + dx * 0.62, c2y = b.y - hoch * 0.6;
  const dickA = dicke, dickB = Math.max(1.6, dicke * 0.32);
  const wobbel = 0.5 + teppichZufall(salz, 'wob') * 5.5;
  const phase = teppichZufall(salz, 'ph') * 6.28;

  const mitte = [];
  for (let i = 0; i <= TEP_AST_PUNKTE; i++) {
    const t = i / TEP_AST_PUNKTE;
    const x = _bez(t, a.x, c1x, c2x, b.x), y = _bez(t, a.y, c1y, c2y, b.y);
    const tx = _bezAbleitung(t, a.x, c1x, c2x, b.x), ty = _bezAbleitung(t, a.y, c1y, c2y, b.y);
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    const grund = dickA + (dickB - dickA) * (t * t * 0.6 + t * 0.4);
    /* Am Ansatz schwillt der Ast an — dort, wo er aus dem Holz kommt. */
    const knoten = 1 + Math.exp(-t * 14) * 0.55 + Math.sin(t * wobbel + phase) * 0.1;
    mitte.push({
      x, y, t, nx: -ty / len, ny: tx / len,
      w: Math.max(0.9, grund * knoten) / 2,
      winkel: Math.atan2(ty, tx) * 180 / Math.PI
    });
  }

  const f = _flaeche(mitte);
  /* Die Mittellinie wird mitgegeben: das Eichhörnchen soll AUF dem Ast
     laufen. Liefe es am Umriss entlang, käme es außen wieder zurück. */
  holz.setAttribute('data-mittel', mitte.map((q, i) => (i ? 'L ' : 'M ') + _zahl(q.x) + ' ' + _zahl(q.y)).join(' '));
  holz.append(sv('path', { d: f.d, class: 'tep-ast', 'data-salz': salz }));
  holz.append(sv('path', { d: _kante(mitte, 1), class: 'tep-astkante' }));
  holz.append(sv('path', { d: _kante(mitte, -1), class: 'tep-astschatten' }));

  /* --- Zweige, die sich abspalten --- */
  const wieviele = d >= 1 ? 4 : d >= 0.7 ? 2 : 1;
  const zweigEnden = [];
  for (let i = 0; i < wieviele; i++) {
    const t = 0.24 + (i / wieviele) * 0.6 + teppichZufall(salz, 'zt' + i) * 0.1;
    const stelle = mitte[Math.max(1, Math.min(TEP_AST_PUNKTE - 1, Math.round(t * TEP_AST_PUNKTE)))];
    const seite = teppichZufall(salz, 'zs' + i) > 0.5 ? 1 : -1;
    const ab = stelle.winkel + seite * (34 + teppichZufall(salz, 'zw' + i) * 30);
    const laenge = (24 + teppichZufall(salz, 'zl' + i) * 30) * (0.6 + d * 0.4);
    const zweigDick = stelle.w * 1.5;
    const linie = _zweigLinie(stelle.x, stelle.y, ab, laenge, seite * 26, zweigDick, 0.9, 10);
    holz.append(sv('path', { d: _flaeche(linie).d, class: 'tep-ast zweig' }));
    holz.append(sv('path', { d: _kante(linie, 1), class: 'tep-astkante duenn' }));
    const spitze = linie[linie.length - 1];
    zweigEnden.push(spitze);

    /* Ein zweiter, kleinerer Trieb am Zweig — die dritte Ordnung. */
    if (d >= 1 && teppichZufall(salz, 'zz' + i) > 0.45) {
      const mittig = linie[Math.round(linie.length * 0.55)];
      const ab2 = mittig.winkel - seite * (30 + teppichZufall(salz, 'z2w' + i) * 24);
      const linie2 = _zweigLinie(mittig.x, mittig.y, ab2, laenge * 0.5, -seite * 20, mittig.w * 1.4, 0.7, 8);
      holz.append(sv('path', { d: _flaeche(linie2).d, class: 'tep-ast zweig' }));
      zweigEnden.push(linie2[linie2.length - 1]);
    }

    /* Und an der Spitze eine Einrollung — nicht an jedem, das wäre Zucker. */
    if (d >= 1 && teppichZufall(salz, 'zr' + i) > 0.55) {
      holz.append(sv('path', { d: _ranke(spitze.x, spitze.y, spitze.winkel, 7, seite), class: 'tep-triebranke' }));
    }
  }

  /* --- Das Laub an den Zweigenden und an der Astspitze --- */
  const alleEnden = zweigEnden.concat([mitte[TEP_AST_PUNKTE]]);
  alleEnden.forEach((e, i) => {
    const n = d >= 1 ? (teppichZufall(salz, 'bn' + i) > 0.4 ? 6 : 4) : d >= 0.7 ? 3 : 2;
    for (const blatt of _bueschel(e.x, e.y, e.winkel, n, salz + ':' + i, 1)) laub.append(blatt);
    /* Ungefähr an jedem dritten Büschel hängt eine Eichel. */
    if (d >= 1 && teppichHash(salz, 'ei' + i) % 3 === 0) {
      laub.append(_eichel(e.x + Math.cos(e.winkel * Math.PI / 180) * 5, e.y + Math.sin(e.winkel * Math.PI / 180) * 5 + 4, e.winkel, salz + ':' + i));
    }
  });
  /* Ein paar einzelne Blätter direkt am Ast — sonst ist der Ast nackt. */
  if (d >= 0.7) {
    for (let i = 0; i < (d >= 1 ? 3 : 2); i++) {
      const stelle = mitte[Math.round((0.3 + i * 0.22) * TEP_AST_PUNKTE)];
      const seite = teppichZufall(salz, 'es' + i) > 0.5 ? 1 : -1;
      for (const blatt of _bueschel(stelle.x, stelle.y, stelle.winkel + seite * 70, 2, salz + ':e' + i, 0.85)) laub.append(blatt);
    }
  }

  return { holz, laub };
}

function teppichBogen(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const weg = Math.abs(y2 - y1) > Math.abs(x2 - x1) ? 22 : 0;
  return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + (mx + weg).toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
}

/* Mittelrippe und Seitenadern — ohne sie ist ein Blatt nur ein Fleck. */
const TEP_BLATTADERN = 'M0 -1 L0 -20 M0 -6 l -3.5 -2.5 M0 -6 l 3.5 -2.5 M0 -11 l -3.2 -2.4 M0 -11 l 3.2 -2.4 M0 -15.5 l -2.6 -2 M0 -15.5 l 2.6 -2';
const TEP_EICHENBLATT = 'M0 0 C 3 -1 5 -4 4 -6 C 7 -6 9 -8 8 -10 C 11 -10 13 -12 12 -14 C 14 -15 15 -17 13 -18 C 15 -20 14 -22 12 -22 C 11 -24 8 -24 7 -22 C 5 -23 3 -22 3 -20 C 1 -21 -1 -19 0 -17 L 0 0 Z M0 0 C -3 -1 -5 -4 -4 -6 C -7 -6 -9 -8 -8 -10 C -11 -10 -13 -12 -12 -14 C -14 -15 -15 -17 -13 -18 C -15 -20 -14 -22 -12 -22 C -11 -24 -8 -24 -7 -22 C -5 -23 -3 -22 -3 -20 C -1 -21 1 -19 0 -17';

/* Der Faden, der beim Spinnen dem Finger folgt. Er liegt in einer eigenen
   Ebene über allem, damit er nie hinter einem Band verschwindet. */
let _zugfaden = null;
function teppichZugfadenZeichnen(vonEl, x1, y1, x2, y2) {
  const svg = vonEl.ownerSVGElement;
  if (!svg) return;
  if (!_zugfaden || !_zugfaden.isConnected) {
    _zugfaden = sv('g', { class: 'tep-zugfaden', 'aria-hidden': 'true' });
    _zugfaden.append(sv('path', { class: 'tep-zugsaum' }));
    _zugfaden.append(sv('path', { class: 'tep-zuglinie' }));
    _zugfaden.append(sv('circle', { r: 4.5, class: 'tep-zugende' }));
    svg.append(_zugfaden);
  }
  const d = 'M ' + _zahl(x1) + ' ' + _zahl(y1) + ' Q ' + _zahl((x1 + x2) / 2) + ' ' + _zahl((y1 + y2) / 2 - 26) + ' ' + _zahl(x2) + ' ' + _zahl(y2);
  _zugfaden.children[0].setAttribute('d', d);
  _zugfaden.children[1].setAttribute('d', d);
  _zugfaden.children[2].setAttribute('cx', _zahl(x2));
  _zugfaden.children[2].setAttribute('cy', _zahl(y2));
}
function teppichZugfadenWeg() { if (_zugfaden) { _zugfaden.remove(); _zugfaden = null; } }

/* ----- Eine Ranke -----
   Am Ende geht es um die Fäden: der Baum ist nur das Gerüst, an dem sie
   hängen. Deshalb sind sie hier kräftig gezeichnet, mit einem dunklen Saum
   darunter, damit sie sich vom hellen Holz abheben — einem Knoten dort, wo
   sie ausgehen, und einer Spitze dort, wo sie ankommen.

   Sie schwingen weit aus, damit man sie nicht für Äste hält, und weichen
   den Namensbändern aus, statt darunter zu verschwinden. */
function teppichRankePfad(x1, y1, x2, y2, versatz) {
  const dx = x2 - x1, dy = y2 - y1;
  const weite = Math.sqrt(dx * dx + dy * dy) || 1;
  const bauch = Math.max(34, Math.min(170, weite * 0.34)) * (1 + (versatz || 0) * 0.28);
  const richtung = dy >= 0 ? 1 : -1;
  const mx = (x1 + x2) / 2 - (dy / weite) * bauch;
  const my = (y1 + y2) / 2 + (dx / weite) * bauch * richtung * 0.62;
  return { d: 'M ' + _zahl(x1) + ' ' + _zahl(y1) + ' Q ' + _zahl(mx) + ' ' + _zahl(my) + ' ' + _zahl(x2) + ' ' + _zahl(y2), mx, my };
}
/* Ein welliger Faden: dieselbe Kurve, aber als Schlangenlinie abgetastet. */
function teppichWellenPfad(x1, y1, mx, my, x2, y2, amplitude) {
  const punkte = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const px = u * u * x1 + 2 * u * t * mx + t * t * x2;
    const py = u * u * y1 + 2 * u * t * my + t * t * y2;
    const tx = 2 * u * (mx - x1) + 2 * t * (x2 - mx);
    const ty = 2 * u * (my - y1) + 2 * t * (y2 - my);
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    const welle = Math.sin(t * Math.PI * 7) * amplitude * Math.sin(t * Math.PI);
    punkte.push([px + (-ty / len) * welle, py + (tx / len) * welle]);
  }
  return _glatt(punkte);
}

function teppichRanke(x1, y1, x2, y2, art, faden, baum, neu, versatz) {
  const g = sv('g', {
    class: 'tep-ranke gruppe-' + art.gruppe + (art.schwer ? ' schwer' : ''),
    style: '--fadenfarbe:' + art.farbe,
    'data-von': faden.von, 'data-zu': faden.zu, 'data-art': faden.art,
    tabindex: '0', role: 'button'
  });
  const k = teppichRankePfad(x1, y1, x2, y2, versatz);
  const d = art.strich === 'wellig' ? teppichWellenPfad(x1, y1, k.mx, k.my, x2, y2, 5.5) : k.d;

  /* Der dunkle Saum: ohne ihn verschwindet ein dünner Faden vor dem Holz. */
  g.append(sv('path', { d, class: 'tep-rankesaum' }));
  if (art.strich === 'doppelt') {
    /* Zwei Linien nebeneinander — gezeichnet als eine dicke mit einer
       schmalen in der Farbe des Tuchs darauf. */
    g.append(sv('path', { d, class: 'tep-rankelinie doppelt-unten' }));
    g.append(sv('path', { d, class: 'tep-rankelinie doppelt-oben' }));
  } else {
    g.append(sv('path', { d, class: 'tep-rankelinie strich-' + art.strich }));
  }

  /* Der Knoten am Ausgang — hier fängt der Faden an. */
  g.append(sv('circle', { cx: _zahl(x1), cy: _zahl(y1), r: 3.4, class: 'tep-rankeknoten' }));

  if (art.gerichtet) {
    const t = 0.86;
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * k.mx + t * t * x2;
    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * k.my + t * t * y2;
    const winkel = Math.atan2(y2 - by, x2 - bx) * 180 / Math.PI;
    g.append(sv('path', { d: 'M 0 0 L -11 -5 L -7.5 0 L -11 5 Z', class: 'tep-spitze', transform: 'translate(' + _zahl(x2) + ' ' + _zahl(y2) + ') rotate(' + winkel.toFixed(0) + ')' }));
  } else {
    g.append(sv('circle', { cx: _zahl(x2), cy: _zahl(y2), r: 3.4, class: 'tep-rankeknoten' }));
  }

  if (faden.wort) {
    const bx = 0.25 * x1 + 0.5 * k.mx + 0.25 * x2;
    const by = 0.25 * y1 + 0.5 * k.my + 0.25 * y2;
    const text = faden.wort.length > 34 ? faden.wort.slice(0, 33) + '…' : faden.wort;
    const bb = Math.max(40, text.length * 5.2 + 22);
    const hb = bb / 2;
    const kl = sv('g', { class: 'tep-rankenband', transform: 'translate(' + _zahl(bx) + ' ' + _zahl(by) + ') rotate(' + teppichDreh(faden.id, 'schild', 2.5) + ')' });
    kl.append(sv('path', {
      class: 'tep-rbgrund',
      d: 'M ' + (-hb) + ' -9 L ' + (hb - 5) + ' -9 L ' + hb + ' 0 L ' + (hb - 5) + ' 9 L ' + (-hb) + ' 9 L ' + (-hb + 5) + ' 0 Z'
    }));
    kl.append(sv('circle', { cx: _zahl(-hb + 8), cy: 0, r: 1.4, class: 'tep-rbloch' }));
    const t2 = sv('text', { x: 3, y: 3.2, class: 'tep-rbtext', 'text-anchor': 'middle' });
    t2.textContent = text;
    kl.append(t2);
    g.append(kl);
  }

  const titel = sv('title', {});
  titel.textContent = fadenSatz(faden, baum, baum.leute.map((q) => ({ id: q.id, name: teppichName(q) })));
  g.append(titel);
  const auf = (ev) => { if (ev) ev.stopPropagation(); teppichFadenBearbeiten(D.docs.get(_tep.id), faden, neu); };
  g.addEventListener('click', auf);
  g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); auf(ev); } });
  return g;
}

/* Ein Namensband: ein Streifen mit eingeschlagenen Enden, der Name darauf
   in Versalien, darunter die Jahre. Ist die Person ausgebrannt, liegt statt
   des Zeichens ein Loch im Tuch — der Name bleibt trotzdem stehen. */
function teppichBand(k, x, y, baum, treffer, i, neu) {
  const p = k.person;
  const name = (teppichName(p) || 'ohne Namen').toUpperCase();
  const jahre = teppichJahre(p);
  const dreh = teppichDreh(p.id, 'band', 2.4);
  const blass = treffer && !treffer.has(p.id);
  const hell = _tep.nurPerson && _tep.nurPerson === p.id;

  const g = sv('g', {
    class: 'tep-person' + (blass ? ' blass' : '') + (hell ? ' hervor' : '') + (p.gebrannt ? ' gebrannt' : ''),
    transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + dreh + ')',
    style: '--n:' + Math.min(i, 40) + ';--gen:' + Math.min(k.gen, 12),
    'data-person': p.id, tabindex: '0', role: 'button'
  });

  /* Das Brandloch liegt hinter dem Band, leicht versetzt nach oben. */
  if (p.gebrannt) {
    const r = 24 + teppichZufall(p.id, 'brand') * 8;
    g.append(sv('circle', { cx: 0, cy: -30, r: (r + 7).toFixed(1), fill: 'url(#tep-glut)', class: 'tep-glut' }));
    g.append(sv('circle', { cx: 0, cy: -30, r: r.toFixed(1), class: 'tep-loch', filter: 'url(#tep-brand)' }));
  } else if (p.zeichen && p.zeichen !== 'keins') {
    const z = sv('g', { class: 'tep-zeichen', transform: 'translate(0 -34)' });
    z.append(sv('circle', { cx: 0, cy: 0, r: 18, class: 'tep-zkreis' }));
    /* Ein Perlenrand ums Medaillon — der macht aus einem Kreis ein Kleinod. */
    z.append(sv('circle', { cx: 0, cy: 0, r: 18, class: 'tep-zperlen' }));
    z.append(sv('circle', { cx: 0, cy: 0, r: 14.4, class: 'tep-zinnen' }));
    z.append(sv('path', { d: TEP_ZEICHEN_PFADE[p.zeichen] || '', class: 'tep-zform' }));
    g.append(z);
  }

  const b = teppichBandBreite(p);
  const h = TEP_BAND_H + (jahre ? 8 : 0);
  /* Erst die eingerollten Enden (sie liegen hinter dem Band), dann das Band,
     dann die beiden Knickschatten darauf. */
  g.append(sv('path', { d: teppichBandRolle(b, h, -1), class: 'tep-bandrolle' }));
  g.append(sv('path', { d: teppichBandRolle(b, h, 1), class: 'tep-bandrolle' }));
  g.append(sv('path', { d: teppichBandPfad(b, h), class: 'tep-bandgrund' }));
  g.append(sv('path', { d: teppichBandKnick(b, h, -1), class: 'tep-bandknick' }));
  g.append(sv('path', { d: teppichBandKnick(b, h, 1), class: 'tep-bandknick' }));

  const t = sv('text', { x: 0, y: jahre ? -2 : 4, class: 'tep-name', 'text-anchor': 'middle' });
  t.textContent = name.length > 46 ? name.slice(0, 45) + '…' : name;
  g.append(t);
  if (jahre) {
    const j = sv('text', { x: 0, y: 11, class: 'tep-jahre', 'text-anchor': 'middle' });
    j.textContent = jahre;
    g.append(j);
  }

  const titel = sv('title', {});
  const anzahl = teppichFaedenVon(baum, p.id).length;
  titel.textContent = (teppichName(p) || 'ohne Namen') + (jahre ? ' · ' + jahre : '') +
    ' · ' + anzahl + (anzahl === 1 ? ' Faden' : ' Fäden') + (p.gebrannt ? ' · ausgebrannt' : '');
  g.append(titel);

  /* Ein Tippen nimmt die Person in den Blick: ihre Fäden treten hervor, alle
     anderen zurück, und unten erscheint eine Karte mit allem, was an ihr
     hängt. Ein zweites Tippen öffnet die Kartusche zum Ändern. Vorher sprang
     jeder Klick sofort in ein Fenster — und wer nur schauen wollte, musste
     es jedes Mal wieder wegklicken. */
  const oeffnen = (ev) => { if (ev) ev.stopPropagation(); teppichKartusche(D.docs.get(_tep.id), p.id, neu); };
  const inBlick = (ev) => {
    if (ev) ev.stopPropagation();
    if (_tep.nurPerson === p.id) { oeffnen(); return; }
    _tep.nurPerson = p.id;
    if (neu) neu();
  };
  g.addEventListener('dblclick', oeffnen);
  g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); oeffnen(ev); } else if (ev.key === ' ') { ev.preventDefault(); inBlick(ev); } });

  /* Ziehen statt Tippen — aber erst ab ein paar Bildpunkten. Sonst
     verschiebt jeder etwas zittrige Tipp den Namen um einen Millimeter, und
     die gerechnete Ordnung ist still hin. */
  let zug = null;
  g.addEventListener('pointerdown', (ev) => {
    if (ev.button != null && ev.button !== 0) return;
    zug = { x: ev.clientX, y: ev.clientY, gezogen: false, x0: x, y0: y, faden: _tep.werkzeug === 'faden' };
    try { g.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  g.addEventListener('pointermove', (ev) => {
    if (!zug) return;
    const dx = ev.clientX - zug.x, dy = ev.clientY - zug.y;
    if (!zug.gezogen && Math.abs(dx) + Math.abs(dy) < 7) return;
    if (!zug.gezogen) { zug.gezogen = true; g.classList.add(zug.faden ? 'spinnt' : 'zieht'); }
    ev.preventDefault();
    const z = _tep.zoom || 1;
    zug.neuX = zug.x0 + dx / z;
    zug.neuY = zug.y0 + dy / z;
    if (zug.faden) {
      /* Ein Faden folgt dem Finger, bis er auf einem anderen Namen landet. */
      teppichZugfadenZeichnen(g, x, y, zug.neuX, zug.neuY);
      return;
    }
    g.setAttribute('transform', 'translate(' + zug.neuX.toFixed(1) + ' ' + zug.neuY.toFixed(1) + ') rotate(' + dreh + ')');
  });
  const loslassen = (ev) => {
    if (!zug) return;
    const s = zug; zug = null;
    g.classList.remove('zieht', 'spinnt');
    teppichZugfadenWeg();
    try { g.releasePointerCapture(ev.pointerId); } catch (e) {}
    if (s.faden && s.gezogen) {
      /* Wo ist der Finger gelandet? */
      const unter = document.elementFromPoint(ev.clientX, ev.clientY);
      const ziel = unter && unter.closest ? unter.closest('.tep-person') : null;
      const zielId = ziel && ziel.getAttribute('data-person');
      if (zielId && zielId !== p.id) teppichFadenSpinnenZu(D.docs.get(_tep.id), p.id, zielId, neu);
      else toast('Zieh den Faden auf einen anderen Namen.', 3600);
      return;
    }
    if (!s.gezogen) {
      /* Im Fadenmodus zieht man von einem Namen zum anderen — dann ist ein
         Tippen ohne Ziehen einfach ein Tippen. */
      inBlick(ev);
      return;
    }
    /* In Rasterschritten ablegen: so bleibt die Wand geordnet, auch wenn
       man von Hand nachhilft. */
    const rasterX = (s.neuX - TEP_RAND_X) / TEP_SPALTE;
    const rasterY = (s.neuY - TEP_RAND_Y) / TEP_REIHE;
    teppichPersonSetzen(D.docs.get(_tep.id), p.id,
      Math.round(rasterX * 4) / 4, Math.round(rasterY * 4) / 4, neu);
  };
  g.addEventListener('pointerup', loslassen);
  g.addEventListener('pointercancel', () => { if (zug) { zug = null; g.classList.remove('zieht', 'spinnt'); teppichZugfadenWeg(); if (neu) neu(); } });
  return g;
}

/* ----- Das Namensband -----
   Eine Schriftrolle, kein Rechteck: der Streifen ist oben und unten leicht
   gewellt, an beiden Enden rollt er sich ein, und dort, wo er sich rollt,
   liegt ein Schatten. Vorher war es ein graues Kästchen mit zwei Zipfeln —
   das sah aus wie ein Etikett, nicht wie Stoff. */
function teppichBandPfad(b, h) {
  const hb = b / 2, hh = h / 2;
  return 'M ' + (-hb) + ' ' + (-hh) +
    ' C ' + (-hb * 0.55) + ' ' + (-hh - 2.6) + ', ' + (hb * 0.55) + ' ' + (-hh + 1.8) + ', ' + hb + ' ' + (-hh) +
    ' L ' + hb + ' ' + hh +
    ' C ' + (hb * 0.55) + ' ' + (hh + 2.6) + ', ' + (-hb * 0.55) + ' ' + (hh - 1.8) + ', ' + (-hb) + ' ' + hh + ' Z';
}
/* Das eingerollte Ende: aussen die Rolle, innen die sichtbare Rückseite. */
function teppichBandRolle(b, h, seite) {
  const hb = b / 2, hh = h / 2;
  const x = seite < 0 ? -hb : hb;
  const r = seite < 0 ? -1 : 1;
  const w = 15 * r, tief = 6 * r;
  return 'M ' + x + ' ' + (-hh) +
    ' C ' + (x + w * 0.75) + ' ' + (-hh - 5) + ', ' + (x + w) + ' ' + (-hh + 3) + ', ' + (x + w * 0.82) + ' ' + (hh * 0.15) +
    ' C ' + (x + w * 0.7) + ' ' + (hh + 5) + ', ' + (x + tief) + ' ' + (hh + 4) + ', ' + x + ' ' + hh + ' Z';
}
/* Der Knick, wo sich der Stoff rollt — ein schmaler Schatten auf dem Band. */
function teppichBandKnick(b, h, seite) {
  const hb = b / 2, hh = h / 2;
  const x = seite < 0 ? -hb + 3 : hb - 3;
  return 'M ' + x + ' ' + (-hh + 0.6) + ' C ' + (x + seite * 2.4) + ' ' + (-hh * 0.2) + ', ' + (x + seite * 2.4) + ' ' + (hh * 0.2) + ', ' + x + ' ' + (hh - 0.6);
}

/* Das Wappen des Hauses: geritzt, nicht gemalt. */
function teppichWappen(x, y, baum) {
  const g = sv('g', { class: 'tep-wappen', transform: 'translate(' + x + ' ' + y + ')' });
  g.append(sv('path', { d: 'M -34 -40 L 34 -40 L 34 6 C 34 26 16 40 0 46 C -16 40 -34 26 -34 6 Z', class: 'tep-wschild' }));
  g.append(sv('path', { d: 'M -34 -40 L 34 -40 L 34 6 C 34 26 16 40 0 46 C -16 40 -34 26 -34 6 Z', class: 'tep-wrand' }));
  g.append(sv('path', { d: 'M 0 -40 L 0 46 M -34 -8 L 34 -8', class: 'tep-wteilung' }));
  /* Kein Spruch darunter: der läuft schon oben und unten am Rand entlang,
     und hier unten lief er regelmäßig aus dem Bild. */
  const titel = sv('title', {});
  titel.textContent = baum.titel || 'Das Haus';
  g.append(titel);
  return g;
}

/* Die geritzten Zeichen. Klein, streng, ohne Farbe — ein Wappentier statt
   eines Gesichts. */
const TEP_ZEICHEN_PFADE = {
  stern: 'M0 -11 L2.6 -3.4 L10.5 -3.4 L4.1 1.3 L6.5 8.9 L0 4.2 L-6.5 8.9 L-4.1 1.3 L-10.5 -3.4 L-2.6 -3.4 Z',
  krone: 'M-10 5 L-10 -4 L-5 1 L0 -7 L5 1 L10 -4 L10 5 Z M-10 7 H10',
  schwert: 'M0 -11 L2 -6 L2 4 L-2 4 L-2 -6 Z M-6 5 H6 M0 5 V10',
  kelch: 'M-7 -8 H7 C7 -1 4 2 0 2 C-4 2 -7 -1 -7 -8 Z M0 2 V8 M-5 9 H5',
  rabe: 'M-9 2 C-5 -4 2 -7 8 -6 L10 -8 L9 -4 C10 0 7 5 1 6 C-3 6 -7 5 -9 2 Z M-9 2 L-11 6',
  schlange: 'M-9 6 C-4 6 -4 0 0 0 C4 0 4 -6 9 -6 M9 -6 L11 -8 M9 -6 L11 -4',
  wolf: 'M-9 6 L-6 -3 L-9 -7 L-4 -5 L0 -8 L4 -5 L9 -7 L6 -3 L9 6 Z M-3 -1 h1 M2 -1 h1',
  hirsch: 'M0 8 V-1 M0 -1 L-6 -8 M-6 -8 L-9 -6 M-6 -8 L-7 -11 M0 -1 L6 -8 M6 -8 L9 -6 M6 -8 L7 -11',
  rose: 'M0 -8 C5 -8 8 -4 8 0 C8 5 4 8 0 8 C-4 8 -8 5 -8 0 C-8 -4 -5 -8 0 -8 Z M0 -4 C3 -4 4 -1 4 1 M0 0 C1 0 2 1 2 2',
  eiche: 'M0 9 V-2 M0 -2 C-4 -3 -7 -6 -6 -9 C-3 -10 -1 -8 0 -6 C1 -8 3 -10 6 -9 C7 -6 4 -3 0 -2',
  schluessel: 'M0 -9 A3.4 3.4 0 1 1 0 -2 A3.4 3.4 0 1 1 0 -9 M0 -2 V9 M0 4 H5 M0 7 H4',
  auge: 'M-11 0 C-6 -6 6 -6 11 0 C6 6 -6 6 -11 0 Z M0 0 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
  mond: 'M4 -9 A9.5 9.5 0 1 0 4 9 A7.5 7.5 0 1 1 4 -9 Z',
  sonne: 'M0 0 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M0 -11 V-8 M0 8 V11 M-11 0 H-8 M8 0 H11 M-8 -8 L-6 -6 M6 6 L8 8 M8 -8 L6 -6 M-6 6 L-8 8',
  anker: 'M0 -9 m-2.2 0 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 M0 -7 V9 M-6 -3 H6 M-9 4 C-7 9 7 9 9 4',
  turm: 'M-7 9 V-4 L-7 -8 L-4 -8 L-4 -6 L-2 -6 L-2 -8 L2 -8 L2 -6 L4 -6 L4 -8 L7 -8 L7 -4 V9 Z M-2 9 V3 h4 v6',
  feder: 'M-7 9 C-2 2 4 -4 8 -10 C4 -3 0 3 -3 9 Z M-7 9 L-9 11',
  flamme: 'M0 9 C-6 6 -7 0 -3 -4 C-3 -1 -1 -1 -1 -3 C-1 -7 -3 -9 0 -11 C3 -8 7 -5 6 0 C5 5 3 8 0 9 Z',
  kette: 'M-8 -4 a4 4 0 1 0 0 8 a4 4 0 1 0 0 -8 M8 -4 a4 4 0 1 0 0 8 a4 4 0 1 0 0 -8 M-4 0 H4',
  dolch: 'M0 -11 L2.4 -5 L2.4 3 L0 6 L-2.4 3 L-2.4 -5 Z M-7 -5 H7 M0 6 V10'
};

/* ===================== DER FUSS DES BAUMES =====================
   Ein alter Baum steht nicht auf einem Strich. Er hat einen Stamm, der sich
   nach unten weit öffnet, Wurzelanläufe, die auseinanderlaufen und sich
   überkreuzen, eine Rinde voller Risse, ein Astloch, das jemand kennt —
   und unten sitzt Getier, wie in jedem alten Wandteppich.

   Alles wird aus derselben Maschinerie gebaut wie die Äste: eine
   Mittellinie, quer aufgetragen, zu einer Fläche geschlossen. Deshalb sieht
   eine Wurzel aus wie Holz und nicht wie eine dicke Linie. */

/* Eine Mittellinie aus frei gesetzten Punkten (Wurzeln, Schlangen, Ranken):
   die Querrichtungen und Breiten werden aus den Nachbarn gerechnet. */
function _bahn(punkte, breiten) {
  const n = punkte.length;
  const raus = [];
  for (let i = 0; i < n; i++) {
    const a = punkte[Math.max(0, i - 1)], b = punkte[Math.min(n - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    raus.push({
      x: punkte[i][0], y: punkte[i][1],
      nx: -ty / len, ny: tx / len,
      w: Math.max(0.4, breiten[i] / 2),
      winkel: Math.atan2(ty, tx) * 180 / Math.PI
    });
  }
  return raus;
}
/* Eine weiche Kurve durch Punkte — für Wurzeln, die sich krümmen. */
function _kurve(x0, y0, winkel, laenge, biegung, n) {
  const punkte = [];
  const rad = winkel * Math.PI / 180;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = rad + (biegung * Math.PI / 180) * t * t;
    punkte.push([
      x0 + Math.cos(rad) * laenge * t * (1 - t * 0.22) + Math.cos(w) * laenge * t * t * 0.3,
      y0 + Math.sin(rad) * laenge * t * (1 - t * 0.22) + Math.sin(w) * laenge * t * t * 0.3
    ]);
  }
  return punkte;
}

/* ===================== DER STAMM =====================
   Fünf Anläufe mit gerechneter Geometrie haben je einen Fehler gegen einen
   anderen getauscht: mal Kegel, mal Klingen, mal ein Sägeblatt. Ein alter
   Baum lässt sich nicht aus Winkeln und Längen ableiten — er ist gewachsen,
   und das sieht man ihm an.

   Deshalb ist der Stamm hier von Hand gezeichnet: eine feste Silhouette, die
   nur noch auf die richtige Höhe gebracht wird. Genau so würde ein
   Holzschnitt entstehen. Sie lehnt sich nach rechts in den Wuchs, ist
   nirgends symmetrisch, hat drei Wurzelanläufe links und zwei rechts, eine
   Beule auf halber Höhe und ein Astloch, wo vor Jahren ein Ast abbrach.

   Der Bezugsrahmen: (0,0) ist die Stammmitte am Boden, nach oben negativ,
   die Höhe bis zur Gabel ist 400. */
const TEP_STAMM_HOEHE = 400;

const TEP_STAMM_UMRISS =
  /* Links oben an der Gabel, dann die linke Seite hinunter */
  'M -22 -400 ' +
  'C -26 -352, -24 -320, -30 -288 ' +
  'C -36 -256, -30 -232, -34 -204 ' +      /* eine Beule */
  'C -38 -176, -32 -156, -38 -132 ' +
  'C -44 -110, -52 -96, -62 -84 ' +        /* hier öffnet sich der Fuß */
  /* Der erste Anlauf: weit nach links, flach auslaufend */
  'C -84 -70, -112 -56, -152 -46 ' +
  'C -172 -41, -186 -34, -196 -24 ' +
  'C -186 -20, -168 -20, -150 -22 ' +      /* die Kehle dahinter */
  'C -128 -25, -110 -26, -96 -22 ' +
  /* Der zweite, kürzere Anlauf */
  'C -110 -12, -128 -4, -146 2 ' +
  'C -128 8, -104 6, -84 0 ' +
  'C -70 -4, -60 -8, -52 -12 ' +
  /* Der dritte, nach vorn unten */
  'C -56 2, -60 12, -62 22 ' +
  'C -48 20, -34 12, -24 2 ' +
  'C -18 10, -10 18, 0 22 ' +              /* die Mitte, zum Betrachter hin */
  'C 10 18, 20 10, 28 0 ' +
  /* Rechts: zwei Anläufe */
  'C 40 10, 56 18, 76 20 ' +
  'C 96 22, 118 18, 136 10 ' +
  'C 120 2, 100 -4, 84 -10 ' +
  'C 102 -14, 126 -16, 148 -14 ' +
  'C 168 -12, 182 -16, 190 -24 ' +
  'C 176 -34, 152 -42, 126 -50 ' +
  'C 104 -57, 86 -66, 74 -78 ' +
  /* Und die rechte Seite hinauf zur Gabel */
  'C 62 -94, 54 -112, 50 -134 ' +
  'C 46 -160, 50 -184, 46 -210 ' +
  'C 42 -238, 46 -262, 40 -292 ' +
  'C 34 -322, 34 -356, 30 -400 Z';

/* Die Grate auf den Wurzelanläufen: helle Kanten, die vom Stamm auf die
   Anläufe hinauslaufen. Sie machen aus der Fläche eine Form. */
const TEP_STAMM_GRATE =
  'M -60 -84 C -86 -66, -122 -50, -170 -34 ' +
  'M -56 -70 C -78 -50, -104 -30, -132 -14 ' +
  'M -46 -54 C -50 -34, -54 -18, -56 -2 ' +
  'M 4 -46 C 6 -26, 8 -10, 8 4 ' +
  'M 60 -70 C 74 -50, 96 -30, 122 -12 ' +
  'M 70 -82 C 96 -64, 130 -48, 168 -34';

/* Die Kehlen dazwischen — dort, wo der Fuß nach innen geht, liegt Schatten. */
const TEP_STAMM_KEHLEN =
  'M -108 -30 C -92 -40, -78 -54, -70 -70 ' +
  'M -84 -8 C -70 -20, -60 -34, -54 -48 ' +
  'M -30 6 C -26 -8, -22 -22, -20 -36 ' +
  'M 42 4 C 40 -10, 38 -24, 38 -38 ' +
  'M 104 -4 C 92 -18, 82 -34, 76 -50 ' +
  'M 150 -28 C 130 -40, 108 -54, 92 -70';

/* Die Rinde: Längsrisse, die sich mit dem Stamm biegen, dazu Querschrunden.
   Sie enden alle oberhalb des Fußes — dort übernehmen die Grate. */
const TEP_STAMM_RINDE =
  'M -20 -376 C -24 -320, -20 -268, -26 -212 C -30 -170, -26 -140, -32 -112 ' +
  'M -6 -364 C -10 -300, -4 -244, -10 -188 C -14 -150, -8 -124, -14 -98 ' +
  'M 8 -352 C 6 -296, 12 -238, 8 -184 C 5 -146, 10 -118, 6 -92 ' +
  'M 22 -330 C 22 -278, 28 -226, 24 -176 C 21 -142, 26 -116, 22 -94 ' +
  'M -30 -262 C -34 -230, -30 -206, -34 -180 ' +
  'M 34 -300 C 34 -262, 38 -232, 36 -206 ' +
  'M -14 -204 C -18 -178, -14 -158, -18 -136 ' +
  'M 16 -244 C 14 -216, 18 -194, 16 -172';

const TEP_STAMM_SCHRUNDEN =
  'M -28 -340 q 14 4 26 -2 M 2 -290 q 12 5 22 -1 M -24 -238 q 16 5 28 -1 ' +
  'M 6 -186 q 13 4 22 -2 M -26 -150 q 15 5 26 -1 M 10 -122 q 12 4 20 -2 ' +
  'M -20 -96 q 16 5 28 0';

/* Was über den Fuß hinausläuft: die dünnen Wurzeln, die weiterziehen und im
   Grund verschwinden. Auch sie sind gezeichnet, nicht gerechnet. */
const TEP_STAMM_WURZELN =
  'M -196 -24 C -224 -18, -252 -12, -276 -2 C -288 3, -296 8, -300 14 ' +
  'C -292 16, -280 14, -268 10 C -244 2, -218 -6, -194 -12 Z ' +
  'M -146 2 C -176 10, -204 16, -226 24 C -236 28, -242 32, -244 36 ' +
  'C -236 38, -224 36, -212 32 C -190 24, -166 16, -144 10 Z ' +
  'M 190 -24 C 220 -18, 248 -10, 270 0 C 282 6, 290 11, 292 17 ' +
  'C 284 19, 272 17, 260 12 C 236 2, 212 -6, 188 -12 Z ' +
  'M 136 10 C 166 18, 194 26, 214 36 C 224 41, 230 45, 232 49 ' +
  'C 224 51, 212 49, 200 44 C 178 34, 156 24, 134 18 Z';

const TEP_STAMM_WURZELHAARE =
  'M -300 14 q -14 6 -24 4 M -300 14 q -12 12 -22 14 M -292 18 q -16 10 -28 10 ' +
  'M -244 36 q -12 8 -22 8 M -244 36 q -8 12 -14 16 ' +
  'M 292 17 q 14 8 24 7 M 292 17 q 10 12 18 16 M 284 21 q 16 10 26 12 ' +
  'M 232 49 q 12 8 20 9 M 232 49 q 6 12 10 16';

/* Das Astloch sitzt links auf halber Höhe. */
const TEP_STAMM_ASTLOCH = [-16, -222];

/* Der ganze Stamm, auf die gewünschte Höhe gebracht. */
function teppichStammBauen(x, y, hoehe) {
  const s = hoehe / TEP_STAMM_HOEHE;
  const g = sv('g', { class: 'tep-stamm', transform: 'translate(' + _zahl(x) + ' ' + _zahl(y) + ') scale(' + s.toFixed(3) + ')' });
  g.append(sv('path', { d: TEP_STAMM_WURZELN, class: 'tep-wurzel' }));
  g.append(sv('path', { d: TEP_STAMM_WURZELHAARE, class: 'tep-wurzelhaar' }));
  g.append(sv('path', { d: TEP_STAMM_UMRISS, class: 'tep-stammkoerper' }));
  g.append(sv('path', { d: TEP_STAMM_KEHLEN, class: 'tep-kehle' }));
  g.append(sv('path', { d: TEP_STAMM_GRATE, class: 'tep-gratkante' }));
  g.append(sv('path', { d: TEP_STAMM_RINDE, class: 'tep-rinde' }));
  g.append(sv('path', { d: TEP_STAMM_SCHRUNDEN, class: 'tep-rindefein' }));
  const loch = sv('g', { class: 'tep-astloch', transform: 'translate(' + TEP_STAMM_ASTLOCH[0] + ' ' + TEP_STAMM_ASTLOCH[1] + ')' });
  loch.append(sv('ellipse', { cx: 0, cy: 0, rx: 11, ry: 7.5, class: 'tep-astlochrand' }));
  loch.append(sv('ellipse', { cx: 0, cy: 1, rx: 8, ry: 5, class: 'tep-astlochtief' }));
  g.append(loch);
  return g;
}

/* ----- Die Rinde -----
   Längsrisse, die der Mittellinie folgen und sich mit dem Stamm biegen. Jeder
   hält seine Seite: liefen sie quer, ergaben sie ein Netz statt einer Rinde. */
function teppichBarkPfad(bahn, salz, wieviele) {
  let d = '';
  for (let r = 0; r < wieviele; r++) {
    const seite = -0.82 + (r / Math.max(1, wieviele - 1)) * 1.64 + (teppichZufall(salz, 'bs' + r) - 0.5) * 0.16;
    const von = Math.floor(teppichZufall(salz, 'bv' + r) * bahn.length * 0.7);
    const laenge = Math.round(4 + teppichZufall(salz, 'bb' + r) * bahn.length * 0.42);
    const bis = Math.min(bahn.length - 1, von + laenge);
    for (let i = von; i <= bis; i++) {
      const q = bahn[i];
      const wackel = Math.sin(i * 0.42 + r * 1.7) * 0.055;
      d += (i === von ? ' M ' : ' L ') + _zahl(q.x + q.nx * q.w * (seite + wackel)) + ' ' + _zahl(q.y + q.ny * q.w * (seite + wackel));
    }
  }
  return d.trim();
}
/* Querschrunden: kurze Risse zwischen den Längsrissen. */
function teppichSchrundenPfad(bahn, salz, wieviele) {
  let d = '';
  for (let i = 0; i < wieviele; i++) {
    const q = bahn[Math.round((0.08 + (i / wieviele) * 0.8) * (bahn.length - 1))];
    const breite = q.w * (0.5 + teppichZufall(salz, 'sw' + i) * 0.7);
    const von = (teppichZufall(salz, 'sv' + i) - 0.5) * 0.7;
    d += ' M ' + _zahl(q.x + q.nx * q.w * von) + ' ' + _zahl(q.y + q.ny * q.w * von) +
      ' q ' + _zahl(q.nx * breite * 0.5 + 2) + ' ' + _zahl(q.ny * breite * 0.5 - 3) +
      ' ' + _zahl(q.nx * breite) + ' ' + _zahl(q.ny * breite);
  }
  return d.trim();
}
/* Ein Astloch — die Stelle, an der vor Jahren ein Ast abbrach. */
function teppichAstloch(bahn, salz) {
  const q = bahn[Math.round(bahn.length * 0.55)];
  const g = sv('g', { class: 'tep-astloch', transform: 'translate(' + _zahl(q.x) + ' ' + _zahl(q.y) + ') rotate(' + (q.winkel + 90).toFixed(0) + ')' });
  g.append(sv('ellipse', { cx: 0, cy: 0, rx: 8.5, ry: 5.8, class: 'tep-astlochrand' }));
  g.append(sv('ellipse', { cx: 0, cy: .6, rx: 6.2, ry: 3.8, class: 'tep-astlochtief' }));
  return g;
}

/* Die Grate: von jeder Spitze zieht eine helle Kante zum Stamm hinauf, und
   in jeder Kehle liegt ein Schatten. Ohne sie wäre der Fuß eine Fläche. */
function teppichGratLinien(fuss, cx, basisY, spanne, salz) {
  const g = sv('g', { class: 'tep-grate' });
  const grate = TEP_GRATE.slice().sort((a, b) => b[0] - a[0]);
  grate.forEach((gr, i) => {
    const streu = (teppichZufall(salz, 'g' + i) - 0.5) * 0.14;
    const spitze = _gratSpitze(cx, basisY, gr[0], gr[1] * (1 + streu), spanne);
    /* Der Grat steigt zum Stamm hin an — je länger die Wurzel, desto höher. */
    /* Eine kurze Kante auf dem Ruecken des Grates — kein Strahl zum Stamm. */
    const rad = gr[0] * Math.PI / 180;
    const nah = [
      cx + Math.cos(rad) * gr[1] * spanne * 0.42,
      basisY + Math.sin(rad) * gr[1] * spanne * 0.42 * 0.2 - gr[2] * spanne * 0.34
    ];
    g.append(sv('path', {
      class: 'tep-gratkante',
      d: _glatt([spitze, [(spitze[0] + nah[0]) / 2, (spitze[1] + nah[1]) / 2 - spanne * 0.03], nah])
    }));
    const naechster = grate[i + 1];
    if (naechster) {
      const mitte = (gr[0] + naechster[0]) / 2;
      const tiefe = Math.min(gr[1], naechster[1]) * 0.74;
      const kehle = _gratSpitze(cx, basisY, mitte, tiefe, spanne);
      g.append(sv('path', {
        class: 'tep-kehle',
        d: _glatt([[kehle[0], kehle[1] - spanne * 0.04], [cx + Math.cos(mitte * Math.PI / 180) * spanne * 0.2, basisY - spanne * 0.22]])
      }));
    }
  });
  return g;
}

/* Was über den Saum hinausläuft: die dünnen Wurzeln, die weiterziehen und im
   Grund verschwinden. Nur die drei längsten Grate bekommen eine. */
function teppichWurzelAuslauf(cx, basisY, spanne, salz) {
  const g = sv('g', { class: 'tep-wurzelwerk' });
  const lang = TEP_GRATE.filter((gr) => gr[1] > 0.85);
  lang.forEach((gr, i) => {
    const spitze = _gratSpitze(cx, basisY, gr[0], gr[1], spanne);
    const links = gr[0] > 90;
    const winkel = gr[0] + (links ? -1 : 1) * (10 + teppichZufall(salz, 'aw' + i) * 14);
    const laenge = spanne * (0.42 + teppichZufall(salz, 'al' + i) * 0.3);
    const punkte = _kurve(spitze[0], spitze[1], winkel, laenge, (links ? -1 : 1) * 46, 14);
    const dickA = spanne * 0.075 * (0.7 + gr[1] * 0.5);
    const breiten = punkte.map((q, kk) => {
      const t = kk / (punkte.length - 1);
      return Math.max(0.4, dickA * Math.pow(1 - t, 1.15) * (1 + Math.sin(t * 8 + i) * 0.08));
    });
    const bahn = _bahn(punkte, breiten);
    g.append(sv('path', { d: _flaeche(bahn).d, class: 'tep-wurzel' }));
    g.append(sv('path', { d: _kante(bahn, links ? -1 : 1), class: 'tep-astkante duenn' }));
    /* Haarwurzeln, die nach unten in den Grund gehen */
    const ende = bahn[bahn.length - 1];
    for (let h = 0; h < 3; h++) {
      const ab = ende.winkel + (h - 1) * 16 + (teppichZufall(salz, 'ah' + i + h) - 0.5) * 12;
      const l = 9 + teppichZufall(salz, 'ahl' + i + h) * 15;
      g.append(sv('path', {
        class: 'tep-wurzelhaar',
        d: 'M ' + _zahl(ende.x) + ' ' + _zahl(ende.y) +
          ' q ' + _zahl(Math.cos(ab * Math.PI / 180) * l * 0.6) + ' ' + _zahl(Math.sin(ab * Math.PI / 180) * l * 0.4 + 4) +
          ' ' + _zahl(Math.cos(ab * Math.PI / 180) * l) + ' ' + _zahl(Math.sin(ab * Math.PI / 180) * l + 6)
      }));
    }
  });
  return g;
}

/* Der Grund, in dem die Wurzeln verschwinden: ein weicher, dunkler Saum,
   der die Enden verschluckt. Ohne ihn hören die Wurzeln einfach auf. */
function teppichGrund(x, y, breite) {
  const g = sv('g', { class: 'tep-grundsaum', 'aria-hidden': 'true' });
  const punkte = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    punkte.push([x - breite / 2 + breite * t, y + 6 + Math.sin(t * 7.5 + 1.2) * 5 + Math.sin(t * 19) * 2]);
  }
  g.append(sv('path', { d: _glatt(punkte) + ' L ' + _zahl(x + breite / 2) + ' ' + _zahl(y + 70) + ' L ' + _zahl(x - breite / 2) + ' ' + _zahl(y + 70) + ' Z', class: 'tep-grundflaeche' }));
  g.append(sv('path', { d: _glatt(punkte), class: 'tep-grundkante' }));
  /* Ein paar Grashalme auf dem Saum */
  let gras = '';
  for (let i = 0; i < 22; i++) {
    const t = (i + 0.5) / 22;
    const gx = x - breite / 2 + breite * t;
    const gy = y + 6 + Math.sin(t * 7.5 + 1.2) * 5;
    const h = 5 + teppichZufall('gras', 'g' + i) * 11;
    const neigung = (teppichZufall('gras', 'n' + i) - 0.5) * 9;
    gras += ' M ' + _zahl(gx) + ' ' + _zahl(gy) + ' q ' + _zahl(neigung * 0.5) + ' ' + _zahl(-h * 0.6) + ' ' + _zahl(neigung) + ' ' + _zahl(-h);
  }
  g.append(sv('path', { class: 'tep-gras', d: gras.trim() }));
  return g;
}

/* ----- Der Rabe -----
   Ein Vogel ist mit wenigen Linien zu treffen, ein Vierbeiner nicht: Rumpf,
   Kopf, Schnabel, Schwanz — vier Formen, und es steht ein Rabe da. Er sitzt
   auf einer Wurzel und sieht nach links, weg vom Stamm. */
function teppichRabe(x, y, gross) {
  const g = sv('g', { class: 'tep-fusstier rabe', transform: 'translate(' + x + ' ' + y + ') scale(' + (gross || 1.25) + ')', 'aria-hidden': 'true' });
  /* Die Beine zuerst — sie liegen hinter dem Rumpf */
  g.append(sv('path', { class: 'tep-tierlinie', d: 'M -1 -7 L -1.5 0 M -1.5 0 l -3 1 M -1.5 0 l 3 .6 M 3 -7 L 3 0 M 3 0 l -3 1 M 3 0 l 3 .6' }));
  /* Rumpf, Hals, Kopf, Schwanz — ein Umriss */
  g.append(sv('path', {
    class: 'tep-tierkoerper',
    d: 'M -6 -10 C -10 -13 -11 -17 -10 -21 C -9 -25 -6 -27 -3 -27 ' +
      'C -1 -27 0 -26 1 -25 L -8 -23.5 C -9.4 -23.2 -9.4 -22 -8 -21.8 ' +
      'L 1 -21 C 2 -18 2 -16 3 -14 ' +
      'C 7 -12 12 -10 17 -8 C 19 -7.4 19 -6 17 -6 ' +
      'C 11 -6 5 -7 1 -8 C -1 -8.6 -4 -9.4 -6 -10 Z'
  }));
  /* Der Flügel liegt angelegt auf dem Rumpf */
  g.append(sv('path', {
    class: 'tep-tierfluegel',
    d: 'M -3 -12 C 1 -13 6 -12 10 -10 C 12 -9 12 -7.6 10 -7.4 C 5 -7.4 0 -8.6 -3 -10 Z'
  }));
  g.append(sv('path', { class: 'tep-tierlinie duenn', d: 'M 0 -11 C 4 -10.6 8 -9.6 11 -8.4 M -1 -9.6 C 3 -9.2 7 -8.4 10 -7.6' }));
  g.append(sv('circle', { cx: -5.4, cy: -23.4, r: 1.05, class: 'tep-tierauge dunkel' }));
  return g;
}

/* ----- Die Schlange -----
   Ein Leib, der sich einmal ringelt und den Kopf hebt. Aus derselben
   Maschinerie wie die Äste: eine Mittellinie, quer aufgetragen. Der Ring am
   Schwanz macht aus dem Wurm eine Schlange. */
function teppichSchlange(x, y, gross) {
  const g = sv('g', { class: 'tep-fusstier schlange', transform: 'translate(' + x + ' ' + y + ') scale(' + (gross || 1) + ')', 'aria-hidden': 'true' });
  const punkte = [], breiten = [];
  const n = 46;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let px, py;
    if (t < 0.46) {
      /* Der Ring: anderthalb Windungen, flach gelegt. */
      const u = t / 0.46;
      const winkel = -Math.PI * 0.4 + u * Math.PI * 2.6;
      const r = 5 + u * 15;
      px = -30 + Math.cos(winkel) * r;
      py = -2 + Math.sin(winkel) * r * 0.46;
    } else {
      /* Und hinaus, in einem Bogen, der am Ende den Kopf hebt. */
      const u = (t - 0.46) / 0.54;
      px = -30 + 17 + u * 62;
      py = -2 + Math.sin(u * Math.PI * 0.95) * 11 - Math.pow(u, 3.2) * 22;
    }
    punkte.push([px, py]);
    /* Am Schwanzende spitz, in der Mitte des Leibes am dicksten, am Hals
       wieder schlank. */
    breiten.push(0.9 + Math.sin(Math.min(1, t * 1.18) * Math.PI) * 6.2);
  }
  const bahn = _bahn(punkte, breiten);
  g.append(sv('path', { d: _flaeche(bahn).d, class: 'tep-tierkoerper' }));
  g.append(sv('path', { d: _kante(bahn, -1), class: 'tep-tierkante' }));
  /* Der Kopf am Ende der Bahn */
  const k = bahn[bahn.length - 1];
  const kg = sv('g', { transform: 'translate(' + k.x.toFixed(1) + ' ' + k.y.toFixed(1) + ') rotate(' + k.winkel.toFixed(0) + ')' });
  kg.append(sv('path', { class: 'tep-tierkoerper', d: 'M -2 -3.6 C 3 -4.6 8.4 -3.2 10.2 -1 C 11.2 0.3 10.8 1.8 9 2.6 C 5.6 4.3 0.6 4 -2 3 Z' }));
  kg.append(sv('path', { class: 'tep-tierlinie duenn', d: 'M 10.2 0.6 l 5.6 1.5 M 14.2 1.3 l 2.8 -1.8 M 14.2 1.3 l 2.4 2.2' }));
  kg.append(sv('circle', { cx: 5.6, cy: -1.6, r: 1.2, class: 'tep-tierauge dunkel' }));
  g.append(kg);
  /* Schuppenbögen auf dem Rücken */
  let schuppen = '';
  for (let i = 5; i < n - 6; i += 3) {
    const q = bahn[i];
    schuppen += ' M ' + (q.x - q.nx * q.w * 0.55).toFixed(1) + ' ' + (q.y - q.ny * q.w * 0.55).toFixed(1) +
      ' q ' + (q.nx * q.w * 0.55 + 1.5).toFixed(1) + ' ' + (q.ny * q.w * 0.55).toFixed(1) +
      ' ' + (q.nx * q.w * 1.1).toFixed(1) + ' ' + (q.ny * q.w * 1.1).toFixed(1);
  }
  g.append(sv('path', { class: 'tep-schuppen', d: schuppen.trim() }));
  return g;
}

/* ----- Unterholz -----
   Farn und Pilze am Fuß des Stammes. Kleinigkeiten, aber sie machen aus
   einem Baum auf grünem Grund einen Baum, der irgendwo steht. */
function teppichFarn(x, y, groesse, spiegel) {
  const g = sv('g', { class: 'tep-unterholz farn', transform: 'translate(' + x + ' ' + y + ') scale(' + (spiegel ? -groesse : groesse) + ' ' + groesse + ')', 'aria-hidden': 'true' });
  let d = 'M 0 0 C 2 -10 6 -20 13 -28';
  for (let i = 1; i <= 7; i++) {
    const t = i / 8;
    const px = 2 * (t * 6.5) + t * t * 5;
    const py = -t * 28;
    const l = 11 * (1 - t * 0.72);
    d += ' M ' + px.toFixed(1) + ' ' + py.toFixed(1) + ' q ' + (-l * 0.5).toFixed(1) + ' ' + (-l * 0.35).toFixed(1) + ' ' + (-l).toFixed(1) + ' ' + (-l * 0.15).toFixed(1);
    d += ' M ' + px.toFixed(1) + ' ' + py.toFixed(1) + ' q ' + (l * 0.5).toFixed(1) + ' ' + (-l * 0.45).toFixed(1) + ' ' + (l * 0.9).toFixed(1) + ' ' + (-l * 0.3).toFixed(1);
  }
  g.append(sv('path', { class: 'tep-farnlinie', d }));
  return g;
}
function teppichPilz(x, y, groesse, salz) {
  const g = sv('g', { class: 'tep-unterholz pilz', transform: 'translate(' + x + ' ' + y + ') scale(' + groesse + ')', 'aria-hidden': 'true' });
  g.append(sv('path', { class: 'tep-pilzstiel', d: 'M -1.6 0 C -1.8 -3 -1.6 -5.4 -1.2 -7 L 1.2 -7 C 1.6 -5.4 1.8 -3 1.6 0 Z' }));
  g.append(sv('path', { class: 'tep-pilzhut', d: 'M -6.4 -7 C -6.4 -11.4 -3.4 -13.6 0 -13.6 C 3.4 -13.6 6.4 -11.4 6.4 -7 C 6.4 -5.8 3.4 -5.2 0 -5.2 C -3.4 -5.2 -6.4 -5.8 -6.4 -7 Z' }));
  g.append(sv('path', { class: 'tep-tierlinie duenn', d: 'M -3.6 -7.4 h 7.2' }));
  return g;
}

/* Ein Eichhörnchen, das ab und zu über den Teppich huscht. */
function teppichEichhoernchen(breite, hoehe) {
  const g = sv('g', { class: 'tep-tier eichhorn', 'aria-hidden': 'true' });
  g.append(sv('path', {
    class: 'tep-tierform',
    d: 'M0 0 C -2 -4 -1 -8 3 -9 C 6 -10 9 -8 9 -5 C 9 -3 8 -2 7 -1 L 12 -1 C 14 -1 15 1 14 2 L 4 3 C 1 3 -1 2 0 0 Z ' +
      'M 12 2 C 18 0 20 -6 17 -11 C 21 -8 22 -1 16 3 Z M 4 -6 a1 1 0 1 0 .1 0'
  }));
  return g;
}

/* ================= DIE BEWEGUNG =================
   Fallendes Laub, wiegende Blätter, das Eichhörnchen. Alles hört auf, wenn
   das Fenster verdeckt ist oder jemand keine Bewegung will — und alles
   räumt sich selbst weg. */
let _tepAnimation = null;
function teppichAnimationenAus() {
  if (!_tepAnimation) return;
  clearInterval(_tepAnimation.fall);
  clearTimeout(_tepAnimation.tier);
  _tepAnimation = null;
}
function teppichAnimationenAn(flaeche, svg, baum) {
  teppichAnimationenAus();
  const stillsteht = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (stillsteht) { svg.classList.add('ohne-wind'); return; }
  if (!_tep.wind) svg.classList.add('ohne-wind');

  const scheibe = flaeche.parentNode ? flaeche.parentNode.querySelector('.tep-laubfall') : null;
  const fall = setInterval(() => {
    if (document.hidden || !svg.isConnected || !_tep.laub || !scheibe) return;
    teppichBlattFallen(scheibe);
  }, 2600);

  let tier = null;
  const tierLaufen = () => {
    if (!svg.isConnected) return;
    if (!document.hidden && _tep.tiere) {
      const e = svg.querySelector('.tep-tier');
      if (e) {
        const aeste = [...svg.querySelectorAll('.tep-astgruppe[data-mittel]')];
        if (aeste.length) {
          const welcher = aeste[Math.floor(Math.random() * aeste.length)];
          e.style.offsetPath = 'path("' + welcher.getAttribute('data-mittel') + '")';
          e.classList.remove('laeuft');
          /* Ein Neustart der Animation braucht einen Takt Pause. */
          setTimeout(() => e.classList.add('laeuft'), 30);
          setTimeout(() => e.classList.remove('laeuft'), 5200);
        }
      }
    }
    tier = setTimeout(tierLaufen, 14000 + Math.random() * 16000);
    if (_tepAnimation) _tepAnimation.tier = tier;
  };
  tier = setTimeout(tierLaufen, 4000);
  _tepAnimation = { fall, tier };
}

/* Ein Blatt löst sich und segelt nach unten. Es liegt über dem Tuch, nicht
   darin — sonst müsste bei jedem Blatt der ganze Teppich neu gezeichnet
   werden. */
function teppichBlattFallen(scheibe) {
  /* Ein echtes Blatt, kein Achteck: dasselbe Eichenblatt wie am Ast, nur
     größer und in Bewegung. Es taumelt herunter und verblasst am Boden. */
  const ton = Math.floor(Math.random() * 4);
  const b = el('i', { class: 'tep-fallblatt ton-' + ton });
  b.innerHTML = '<svg viewBox="-16 -26 32 30" width="20" height="19" aria-hidden="true">' +
    '<path class="tep-fbform" d="' + TEP_EICHENBLATT + '"/>' +
    '<path class="tep-fbader" d="' + TEP_BLATTADERN + '"/></svg>';
  b.style.left = (8 + Math.random() * 82) + '%';
  b.style.setProperty('--drift', (Math.random() * 120 - 60).toFixed(0) + 'px');
  b.style.setProperty('--drift2', (Math.random() * 80 - 40).toFixed(0) + 'px');
  b.style.setProperty('--dauer', (8 + Math.random() * 6).toFixed(1) + 's');
  b.style.setProperty('--dreh', (Math.random() * 900 - 450).toFixed(0) + 'deg');
  b.style.setProperty('--kipp', (Math.random() * 700 - 350).toFixed(0) + 'deg');
  scheibe.append(b);
  setTimeout(() => b.remove(), 15000);
}
