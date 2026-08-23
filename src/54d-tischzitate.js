/* ===================== 54d — ZITATE AUF DER PLATTE =====================
   In alte Tische ritzen Leute Sätze. Hier auch.

   Drei Weisen, wählbar in „Schreibtisch einrichten“:
     · gefunden — kurze Zeilen aus den eigenen Texten, jeden Tag andere
     · geritzt  — was man selbst eingeritzt hat, bleibt stehen
     · beides   — gefundene und geritzte nebeneinander
     · nichts   — die Platte bleibt leer

   Ein geritztes Zitat ist ein Dokument (typ 'tischzitat') und wandert damit
   von selbst in Sicherung, Papierkorb und Synchronisation.

   Die Verteilung ist zufällig, aber nicht dumm: aus mehreren Kandidaten wird
   der genommen, der am weitesten von allen anderen entfernt liegt. So steht
   nie etwas übereinander, und trotzdem sieht es nie nach Raster aus. */

const TISCHZITAT_MODI = [
  ['gefunden', 'Gefundene', 'Kurze Zeilen aus deinen eigenen Texten — jeden Tag andere.'],
  ['geritzt', 'Geritzte', 'Nur, was du selbst eingeritzt hast. Das bleibt stehen.'],
  ['beides', 'Beides', 'Gefundene und geritzte nebeneinander.'],
  ['nichts', 'Nichts', 'Die Platte bleibt leer.']
];
function tischzitatModus(e) {
  const m = e && e.zitatModus;
  if (TISCHZITAT_MODI.some(([id]) => id === m)) return m;
  /* Wer den alten Schalter „Eigene Zeilen“ aus hatte, bleibt ohne. */
  return e && e.verse === false ? 'nichts' : 'gefunden';
}

/* ----- Der Platz auf der Platte ----- */
/* x und y laufen von 0 bis 1 innerhalb des Bereichs, in dem etwas stehen darf.
   Wo schon etwas liegt, wird nicht geritzt — und was auf dem Tisch liegt,
   wird gemessen, nicht geraten. */
/* Ein Satz ist kein Punkt: er ist breit. Ohne Groesse wird der Anker geprueft,
   mit Groesse die ganze Flaeche - der Anker sitzt mittig oben. */
function tischzitatFrei(x, y, hindernisse, groesse) {
  const w = (groesse && groesse.w) || 0, hoch = (groesse && groesse.h) || 0;
  const x1 = x - w / 2, x2 = x + w / 2, y1 = y, y2 = y + hoch;
  for (const h of hindernisse || []) {
    if (x2 > h.x1 && x1 < h.x2 && y2 > h.y1 && y1 < h.y2) return false;
  }
  return true;
}
function saubererTischplatz(p) {
  return { x: begrenze(p && p.x, 0, 1, .5), y: begrenze(p && p.y, 0, 1, .5), dreh: begrenze(p && p.dreh, -9, 9, 0) };
}
/* Sucht einen Platz, der möglichst weit von allen anderen weg ist und auf
   nichts drauffällt. Findet sich gar nichts Freies, gilt der beste Kompromiss. */
function tischzitatPlatz(vorhandene, zufall, hindernisse, groesse) {
  const rnd = typeof zufall === 'function' ? zufall : Math.random;
  const andere = (vorhandene || []).map(saubererTischplatz);
  let bester = null, besteWeite = -1, notfall = null, notWeite = -1;
  for (let i = 0; i < 200; i++) {
    const x = rnd(), y = rnd();
    let naechste = Infinity;
    for (const a of andere) naechste = Math.min(naechste, Math.hypot(a.x - x, (a.y - y) * .7));
    /* Auch der Rand zählt: nichts soll ganz außen kleben. */
    naechste = Math.min(naechste, x + .06, 1 - x + .06, y + .08, 1 - y + .08);
    if (naechste > notWeite) { notWeite = naechste; notfall = { x, y }; }
    if (!tischzitatFrei(x, y, hindernisse, groesse)) continue;
    if (naechste > besteWeite) { besteWeite = naechste; bester = { x, y }; }
  }
  if (!bester) bester = notfall || { x: .5, y: .8 };
  return { x: bester.x, y: bester.y, dreh: Math.round((rnd() * 10 - 5) * 10) / 10 };
}
/* Liegt der Satz auf etwas drauf? Gemessen, nicht gerechnet - die einzige
   Prüfung, die wirklich stimmt, weil sie das nimmt, was zu sehen ist. */
function tischzitatStoert(element, szene) {
  const zr = element.getBoundingClientRect();
  if (!zr.width || !zr.height) return false;
  const flaeche = zr.width * zr.height;
  /* Auch die anderen Saetze zaehlen: zwei Kerben uebereinander sind
     unleserlich - und im Holz gibt es kein Uebereinander. */
  for (const d of szene.querySelectorAll('.desk-ding, .desk-ding-halter, .desk-korb, .desk-schublade, .desk-zitat, .desk-ritzen')) {
    if (d === element) continue;
    const dr = d.getBoundingClientRect();
    if (!dr.width || !dr.height) continue;
    const x = Math.max(0, Math.min(zr.right, dr.right) - Math.max(zr.left, dr.left));
    const y = Math.max(0, Math.min(zr.bottom, dr.bottom) - Math.max(zr.top, dr.top));
    if (x * y > flaeche * .06) return true;
  }
  /* Auch nicht über den Rand der Szene hinaus */
  const sr = szene.getBoundingClientRect();
  if (zr.left < sr.left + 4 || zr.right > sr.right - 4 || zr.bottom > sr.bottom - 4) return true;
  return false;
}
/* Probiert Plätze durch, bis einer wirklich frei ist. Höchstens ein Dutzend —
   danach bleibt der beste Versuch stehen, statt ewig zu suchen. */
function tischzitatRuecken(element, doc, szene) {
  if (!szene || !element.isConnected) return false;
  if (!tischzitatStoert(element, szene)) return false;
  const andere = tischzitate().filter((d) => d.id !== doc.id);
  const h = tischzitatHindernisse(szene, element);
  const g = tischzitatGroesse(element, szene);
  const setz = (p) => {
    element.style.setProperty('--zx', p.x.toFixed(3));
    element.style.setProperty('--zy', p.y.toFixed(3));
    element.style.setProperty('--zd', p.dreh + 'deg');
  };
  const start = saubererTischplatz(doc);
  const kandidaten = tischzitatKandidaten(h, g, andere.map(saubererTischplatz));
  /* Nur die besten werden wirklich nachgemessen — messen kostet Layout. */
  for (const k of kandidaten.slice(0, 24)) {
    const p = { x: k.x, y: k.y, dreh: start.dreh };
    setz(p);
    if (!tischzitatStoert(element, szene)) {
      Object.assign(doc, p);
      if (typeof speichereStill === 'function') speichereStill(doc);
      return true;
    }
  }
  /* Wirklich kein Platz mehr: der Satz bleibt, wo er war, statt zu wandern. */
  setz(start);
  return false;
}

/* Alle Plätze, die frei sind — der Reihe nach, der beste zuerst.
   Ein Raster statt Würfeln: auf einem vollen Tisch findet Zufall die letzte
   Lücke oft nicht, ein Raster schon. Rein rechnerisch, ohne DOM. */
function tischzitatKandidaten(hindernisse, groesse, andere, schritte) {
  const nx = (schritte && schritte.x) || 30, ny = (schritte && schritte.y) || 22;
  /* Ist der Tisch wirklich voll, wird der Sicherheitsabstand nachgelassen —
     lieber eng als übereinander. Erst wenn auch das nichts findet, gibt es
     nichts zu finden. */
  for (const nachlass of [0, .015, .03]) {
    const eng = nachlass ? (hindernisse || []).map((h) => ({ x1: h.x1 + nachlass, x2: h.x2 - nachlass, y1: h.y1 + nachlass, y2: h.y2 - nachlass })) : hindernisse;
    const gefunden = _tzRaster(eng, groesse, andere, nx, ny);
    if (gefunden.length) return gefunden;
  }
  return [];
}
function _tzRaster(hindernisse, groesse, andere, nx, ny) {
  const raus = [];
  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      const x = (ix + .5) / nx, y = (iy + .5) / ny;
      if (!tischzitatFrei(x, y, hindernisse, groesse)) continue;
      let weite = Infinity;
      for (const a of andere || []) weite = Math.min(weite, Math.hypot(a.x - x, (a.y - y) * .7));
      weite = Math.min(weite, x + .06, 1 - x + .06, y + .08, 1 - y + .08);
      raus.push({ x, y, weite });
    }
  }
  /* Der freieste Fleck zuerst — und bei Gleichstand immer dieselbe Reihenfolge,
     damit ein Tisch nicht bei jedem Betreten anders aussieht. */
  raus.sort((a, b) => b.weite - a.weite || a.x - b.x || a.y - b.y);
  return raus;
}

/* Wie breit und hoch ein Satz auf der Platte ist - in derselben Rechnung. */
function tischzitatGroesse(element, szene) {
  if (!element || !szene) return { w: .18, h: .12 };
  const r = element.getBoundingClientRect(), sr = szene.getBoundingClientRect();
  if (!r.width || !sr.width) return { w: .18, h: .12 };
  return { w: (r.width / sr.width) / TZ_BREIT, h: (r.height / sr.height) / TZ_HOCH };
}
/* Was auf dem Tisch liegt, in dieselbe 0..1-Rechnung gebracht wie die Zitate.
   Die Zahlen stammen aus dem CSS: left = 5% + x·82%, top = 47% + y·44%.
   Beide Achsen sind Anteile der Szene — so gilt die Rechnung auf jedem Gerät. */
const TZ_LINKS = .05, TZ_BREIT = .82, TZ_OBEN = .47, TZ_HOCH = .44;
function tischzitatHindernisse(szene, ausser) {
  if (!szene || !szene.getBoundingClientRect) return [];
  const sr = szene.getBoundingClientRect();
  if (!sr.width || !sr.height) return [];
  const raus = [];
  for (const d of szene.querySelectorAll('.desk-ding, .desk-ding-halter, .desk-korb, .desk-schublade, .desk-fensterknopf, .desk-zitat')) {
    if (d === ausser) continue;
    const r = d.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const x1 = (((r.left - sr.left) / sr.width) - TZ_LINKS) / TZ_BREIT;
    const x2 = (((r.right - sr.left) / sr.width) - TZ_LINKS) / TZ_BREIT;
    const y1 = (((r.top - sr.top) / sr.height) - TZ_OBEN) / TZ_HOCH;
    const y2 = (((r.bottom - sr.top) / sr.height) - TZ_OBEN) / TZ_HOCH;
    /* Ein schmaler Rand, damit nichts anstößt — aber nicht so viel, dass am
       Ende gar kein Holz mehr frei ist. */
    raus.push({ x1: x1 - .022, x2: x2 + .022, y1: y1 - .03, y2: y2 + .03 });
  }
  return raus;
}

function tischzitate() {
  return [...D.docs.values()].filter((d) => d.typ === 'tischzitat' && !d.geloescht && String(d.text || '').trim())
    .sort((a, b) => (a.angelegt || 0) - (b.angelegt || 0));
}
function tischzitatAnlegen(text, hindernisse) {
  const sauber = String(text || '').trim().slice(0, 160);
  if (!sauber) return null;
  const andere = tischzitate().map(saubererTischplatz);
  const h = hindernisse || (typeof document !== 'undefined' ? tischzitatHindernisse(document.querySelector('.desk-szene')) : []);
  const frei = tischzitatKandidaten(h, { w: .2, h: .12 }, andere);
  const platz = frei.length
    ? { x: frei[0].x, y: frei[0].y, dreh: Math.round((Math.random() * 10 - 5) * 10) / 10 }
    : tischzitatPlatz(tischzitate(), null, h, { w: .2, h: .12 });
  return neuDoc('tischzitat', { text: sauber, x: platz.x, y: platz.y, dreh: platz.dreh });
}

/* ----- Das Einritzen ----- */
/* Jedes Zeichen steht von Anfang an da, nur noch nicht geschnitten — so
   springt nichts im Umbruch. Die Klinge wandert darüber und setzt sie frei,
   Buchstabe für Buchstabe; wo sie ansetzt, staubt es. Am Schluss setzt sich
   die Kerbe kurz, dann ist es einfach ein Satz im Holz. */
const TZ_TAKT = 38;          /* Millisekunden je Zeichen */
function tischzitatEinritzen(element, text, fertig) {
  if (!element) return;
  const zeichen = [...String(text)];
  const schrift = el('span', { class: 'tz-schrift' });
  for (let i = 0; i < zeichen.length; i++) {
    /* Leerzeichen brauchen kein eigenes Zeichen, aber ihren Platz */
    schrift.append(zeichen[i] === ' '
      ? document.createTextNode(' ')
      : el('i', { class: 'tz-z', style: '--i:' + i }, zeichen[i]));
  }
  const klinge = el('i', { class: 'tz-klinge-spitze' });
  element.innerHTML = '';
  element.append(schrift, klinge);
  element.classList.add('ritzt');

  const stuecke = [...schrift.querySelectorAll('.tz-z')];
  if (!stuecke.length) { element.classList.remove('ritzt'); if (fertig) fertig(); return; }
  /* Alles sofort sichtbar machen — ohne Umschweife. Gebraucht, wenn nicht
     animiert werden kann oder darf. */
  const gleichFertig = () => {
    for (const z of stuecke) z.classList.add('geschnitten');
    klinge.remove();
    element.classList.remove('ritzt');
    if (fertig) fertig();
  };
  /* Liegt das Fenster im Hintergrund, laeuft keine Bildfolge. Dann wird nicht
     geritzt, sondern der Satz steht einfach da — sonst blieben die Buchstaben
     unsichtbar, bis jemand zurueckkommt. Dasselbe, wenn jemand weniger
     Bewegung eingestellt hat. */
  const stillsteht = (typeof document !== 'undefined' && document.hidden) ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (stillsteht) { gleichFertig(); return; }
  /* Und ein Netz darunter: bleibt der Lauf aus welchem Grund auch immer
     stehen, steht der Satz spaetestens danach vollstaendig da. */
  const notbremse = setTimeout(gleichFertig, zeichen.length * TZ_TAKT * 3 + 2500);
  /* Sanft losfahren und sanft ankommen: die Klinge zieht nicht stur gleich schnell. */
  let n = 0;
  const gehe = () => {
    if (!element.isConnected) { clearTimeout(notbremse); element.classList.remove('ritzt'); return; }
    const z = stuecke[n];
    if (z) {
      z.classList.add('geschnitten');
      klinge.style.transform = 'translate(' + (z.offsetLeft + z.offsetWidth) + 'px,' + z.offsetTop + 'px)';
      if (n % 2 === 0) tischzitatStaub(element, z.offsetLeft + z.offsetWidth, z.offsetTop + z.offsetHeight * .8);
    }
    n++;
    if (n < stuecke.length) {
      const rest = stuecke.length - n;
      /* Am Anfang und am Ende ein wenig langsamer — das wirkt wie eine Hand. */
      const bremse = rest < 4 ? 1.9 : n < 3 ? 1.6 : 1;
      setTimeout(gehe, TZ_TAKT * bremse + Math.random() * 14);
    } else {
      clearTimeout(notbremse);
      klinge.classList.add('geht');
      setTimeout(() => klinge.remove(), 420);
      element.classList.remove('ritzt');
      element.classList.add('setzt');
      setTimeout(() => { element.classList.remove('setzt'); if (fertig) fertig(); }, 900);
    }
  };
  /* setTimeout statt requestAnimationFrame: der Zeitgeber laeuft auch dann,
     wenn das Fenster gerade nicht gezeichnet wird. */
  setTimeout(gehe, 16);
}
/* Ein paar Späne, dort wo die Klinge gerade ansetzt. */
function tischzitatStaub(element, x, y) {
  for (let i = 0; i < 2; i++) {
    const korn = el('i', {
      class: 'tz-staub',
      style: 'left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;' +
        '--sw:' + (7 + Math.random() * 13).toFixed(0) + 'px;--ss:' + (Math.random() * 8 - 4).toFixed(1) + 'px;' +
        '--sd:' + (Math.random() * .12).toFixed(2) + 's'
    });
    element.append(korn);
    setTimeout(() => korn.remove(), 1300);
  }
}

/* Welcher Satz gerade erst entstanden ist. Eine Kennung statt einer Marke am
   Dokument: die ueberlebt auch, wenn der Tisch zwischendurch neu gebaut wird. */
let _tzFrisch = '';
function tischzitatFrischMerken(id) { _tzFrisch = String(id || ''); }

/* ----- Auf den Tisch legen ----- */
function tischzitateBauen(dinge, e, neuZeichnen) {
  const modus = tischzitatModus(e);
  if (modus === 'nichts') return;
  const eigene = modus === 'geritzt' || modus === 'beides' ? tischzitate() : [];
  const gefunden = modus === 'gefunden' || modus === 'beides' ? schreibtischVerse(modus === 'beides' ? 2 : 3) : [];

  /* Was schon auf dem Tisch liegt, wird beim Verteilen ausgespart. Gemessen
     wird erst, wenn die Szene steht — deshalb hier so früh wie möglich. */
  const szene = dinge.closest ? dinge.closest('.desk-szene') : null;
  const hindernisse = tischzitatHindernisse(szene || dinge.parentElement);
  const belegt = eigene.map(saubererTischplatz);
  const gelegt = [], frisch = [];
  for (const doc of eigene) {
    const p = saubererTischplatz(doc);
    const knopf = el('button', {
      class: 'desk-zitat geritzt', style: '--zx:' + p.x.toFixed(3) + ';--zy:' + p.y.toFixed(3) + ';--zd:' + p.dreh + 'deg',
      title: 'Eingeritzt: „' + doc.text + '“ — tippen für mehr',
      onclick: () => tischzitatMenue(doc, neuZeichnen)
    }, el('span', { class: 'tz-schrift' }, doc.text));
    dinge.append(knopf);
    /* Was gerade erst entstanden ist, wird vor den Augen eingeritzt */
    if (doc._frischGeritzt || doc.id === _tzFrisch) {
      delete doc._frischGeritzt;
      if (doc.id === _tzFrisch) _tzFrisch = '';
      frisch.push([knopf, doc]);
    }
    gelegt.push([knopf, doc]);
  }
  for (const zeile of gefunden) {
    const p = tischzitatPlatz(belegt, null, hindernisse, { w: .2, h: .12 });
    belegt.push(p);
    dinge.append(el('div', {
      class: 'desk-zitat gefunden', style: '--zx:' + p.x.toFixed(3) + ';--zy:' + p.y.toFixed(3) + ';--zd:' + p.dreh + 'deg',
      title: 'Aus deinen Texten'
    }, el('span', { class: 'tz-schrift' }, zeile)));
  }
  /* Erst wenn alle liegen, wird gerückt — nacheinander, damit jeder Satz die
     schon verschobenen sieht. Sonst weichen zwei einander gleichzeitig aus
     und landen wieder aufeinander. */
  /* Ein Zeitgeber, keine Bildfolge: requestAnimationFrame steht still, solange
     das Fenster im Hintergrund liegt. Dann wuerde nie gerueckt und nie geritzt
     — und die Saetze laegen fuer immer uebereinander. Messen braucht kein Bild. */
  setTimeout(() => {
    const flaeche = szene || dinge.parentElement;
    if (!flaeche || !flaeche.isConnected) return;
    for (const [knopf, doc] of gelegt) tischzitatRuecken(knopf, doc, flaeche);
    for (const [knopf, doc] of frisch) tischzitatEinritzen(knopf, doc.text);
  }, 16);

  /* Ein kleines Messer am Rand: hier ritzt man ein */
  if (modus === 'geritzt' || modus === 'beides') {
    dinge.append(el('button', { class: 'desk-ritzen', title: 'Einen Satz in die Platte ritzen', onclick: () => tischzitatNeu(neuZeichnen) },
      el('i', { class: 'tz-klinge' }), el('i', { class: 'tz-griff' })));
  }
}

async function tischzitatNeu(neuZeichnen) {
  const t = await eingabe({ titel: 'In die Platte ritzen', platzhalter: 'Ein Satz, der bleiben soll …', ok: 'Einritzen', mehrzeilig: false });
  if (!t || !t.trim()) return;
  const doc = tischzitatAnlegen(t);
  if (!doc) return;
  doc._frischGeritzt = true;
  if (neuZeichnen) neuZeichnen();
}

async function tischzitatMenue(doc, neuZeichnen) {
  const w = await menue([
    { text: 'Anders schreiben', icon: 'stift', wert: 'aendern' },
    { text: 'Woandershin legen', icon: 'wuerfel', wert: 'ruecken' },
    { text: 'Herausschleifen', icon: 'papierkorb', wert: 'weg' }
  ], '„' + (doc.text.length > 60 ? doc.text.slice(0, 57) + ' …' : doc.text) + '“');
  if (w === 'aendern') {
    const t = await eingabe({ titel: 'Anders schreiben', wert: doc.text, ok: 'Übernehmen' });
    if (t && t.trim()) { doc.text = t.trim().slice(0, 160); speichere(doc); doc._frischGeritzt = true; if (neuZeichnen) neuZeichnen(); }
  } else if (w === 'ruecken') {
    const szene = document.querySelector('.desk-szene');
    const p = tischzitatPlatz(tischzitate().filter((d) => d.id !== doc.id), null, tischzitatHindernisse(szene), { w: .2, h: .12 });
    Object.assign(doc, p); speichere(doc);
    if (neuZeichnen) neuZeichnen();
    toast('Woandershin.');
  } else if (w === 'weg') {
    if (await frage('Diesen Satz aus der Platte schleifen?', { ja: 'Herausschleifen' })) {
      await loesche(doc.id);
      if (neuZeichnen) neuZeichnen();
    }
  }
}

/* ----- Der Abschnitt in „Schreibtisch einrichten“ -----
   Bisher gab es nur das winzige Messer am rechten Rand der Platte — das
   findet niemand. Hier steht alles beisammen: die Weise, die eigenen Sätze,
   und das Feld, in das man einen neuen schreibt. Beim Einritzen schließt
   sich der Kasten, damit man zusieht, wie die Klinge läuft. */
function tischzitatEinstellung(e, danach, schliessen) {
  const kasten = el('div', { class: 'einstellgruppe' });
  const zeichne = () => {
    kasten.innerHTML = '';
    const modus = tischzitatModus(e);
    const wahl = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
    for (const [id, name] of TISCHZITAT_MODI) {
      wahl.append(el('button', { class: modus === id ? 'an' : '', onclick: () => {
        e.zitatModus = id; if (id !== 'nichts') e.verse = true;
        D.einst.schreibtisch = { ...e }; speichereEinst(); zeichne(); if (danach) danach();
      } }, name));
    }
    anfuegen(kasten,
      el('b', {}, 'Zitate auf der Platte'),
      el('div', { class: 'einstell-unter' }, 'In alte Tische ritzen Leute Sätze. Gefundene kommen aus deinen eigenen Texten und wechseln von selbst; geritzte schreibst du hier hinein, und sie bleiben stehen.'),
      wahl);
    if (modus !== 'geritzt' && modus !== 'beides') {
      anfuegen(kasten, el('div', { class: 'einstell-unter' }, 'Zum Einritzen nimm „Geritzte“ oder „Beides“.'));
      return;
    }
    /* Was schon in der Platte steht */
    const meine = tischzitate();
    const liste = el('div', { class: 'tz-liste' });
    for (const doc of meine) {
      liste.append(el('div', { class: 'tz-zeile' },
        el('span', { class: 'tz-text' }, doc.text),
        el('button', { class: 'tz-weg', title: 'Aus der Platte schleifen', onclick: async () => {
          if (await frage('Diesen Satz aus der Platte schleifen?', { ja: 'Herausschleifen' })) {
            await loesche(doc.id); zeichne(); if (danach) danach();
          }
        } }, '×')));
    }
    if (!meine.length) liste.append(el('div', { class: 'tz-leer' }, 'Noch nichts eingeritzt. Ein Satz, der bleiben soll — mehr braucht es nicht.'));

    const feld = el('input', { type: 'text', class: 'tz-feld', maxlength: '160', placeholder: 'Ein Satz, der bleiben soll …' });
    const ritzen = () => {
      const t = feld.value.trim();
      if (!t) { feld.focus(); return; }
      const doc = tischzitatAnlegen(t);
      if (!doc) return;
      feld.value = '';
      /* Zusehen, wie es geritzt wird. Reihenfolge zaehlt: das Schliessen des
         Kastens zeichnet den Tisch selbst noch einmal — erst DANACH wird der
         Satz als frisch markiert, sonst haette der zweite Aufbau die Klinge
         wieder weggeraeumt, bevor sie loslaufen konnte. */
      /* VOR dem Schliessen vormerken: der Kasten baut den Tisch beim Zugehen
         selbst neu auf, und wer auch immer als Naechstes baut, soll die Klinge
         laufen lassen. So haengt es nicht an der Reihenfolge. */
      tischzitatFrischMerken(doc.id);
      if (schliessen) schliessen();
      if (danach) danach();
      toast('Wird eingeritzt.', 2200);
    };
    feld.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); ritzen(); } });
    anfuegen(kasten, liste,
      el('div', { class: 'tz-neu' }, feld, el('button', { class: 'knopf voll', onclick: ritzen }, 'Einritzen')),
      el('div', { class: 'einstell-unter' }, 'Auf der Platte liegt außerdem ein kleines Messer am rechten Rand — damit geht es auch direkt.'));
  };
  zeichne();
  return kasten;
}
