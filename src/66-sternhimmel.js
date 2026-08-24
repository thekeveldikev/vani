/* ===================================================================
   66 — DIE STERNWARTE
   -------------------------------------------------------------------
   Ein Himmel wird gerechnet. Die Sternbilder ziehst du selbst.

   Das ist der ganze Gedanke, und er ist wörtlich der Vorgang, um den es
   geht: ein Sternbild entsteht nicht dadurch, dass Sterne beieinander
   stehen — sie stehen zufällig da und sind Lichtjahre voneinander
   entfernt. Es entsteht, weil ein Mensch beschließt, dass zwischen diesen
   sieben Punkten ein Reiher ist, und weil er die Geschichte dazu
   weitererzählt. VANI rechnet die Punkte; das Bild bestimmst du.

   Und dann dreht sich der Himmel. Er dreht sich einmal im Jahr, und
   deshalb lässt sich fragen, welches Zeichen zur Wintersonnenwende über
   der Stadt steht — und wer darunter geboren ist. Erst damit wird aus
   einem schönen Blatt ein Werkzeug.

   Alles hier ist reine Rechnung; gezeichnet wird in 66b.
   =================================================================== */

/* Das Blatt ist quadratisch wie beim Kartentisch — ein Himmelsblatt, kein
   Fenster. Der Kreis darin ist das, was über dem Horizont steht. */
const STERN_GROESSE = 1200;
const STERN_MITTE = STERN_GROESSE / 2;
/* Der Rand muss die Gradzahlen, die Himmelsrichtung UND die Kartusche
   tragen. Bei sechsundneunzig lagen „SÜDEN“ und der Titel übereinander. */
const STERN_RAND = 132;
const STERN_R = STERN_MITTE - STERN_RAND;

/* ----- Die Farbwelten -----
   Ein Nachthimmel ist nicht schwarz. Er ist blau, wenn Mond scheint,
   braun auf altem Papier, grün über dem Meer. */
const STERN_WELTEN = [
  {
    id: 'tinte', name: 'Tinte und Silber',
    grund: '#0e1626', grund2: '#182741', milch: '#7f93c4',
    stern: '#f4f1e4', hell: '#ffffff', linie: '#c8a85c',
    schrift: '#dfd7bd', rand: '#c8a85c', ekliptik: '#8fa2cc'
  },
  {
    id: 'kupfer', name: 'Kupferstich',
    grund: '#efe6cf', grund2: '#e2d5b6', milch: '#b6a27a',
    stern: '#2c2418', hell: '#0e0b06', linie: '#8a5a2a',
    schrift: '#3a3020', rand: '#8a5a2a', ekliptik: '#8a7a52'
  },
  {
    id: 'mitternacht', name: 'Mitternacht',
    grund: '#07080f', grund2: '#0e1020', milch: '#5f6a94',
    stern: '#e8e6df', hell: '#ffffff', linie: '#9c8f6a',
    schrift: '#b9b3a0', rand: '#7d7a68', ekliptik: '#6d78a0'
  },
  {
    id: 'moos', name: 'Über dem Moor',
    grund: '#0d1a16', grund2: '#152a22', milch: '#6f9184',
    stern: '#eef0e6', hell: '#ffffff', linie: '#c0a457',
    schrift: '#cfd6c2', rand: '#c0a457', ekliptik: '#7fa08e'
  },
  {
    id: 'wein', name: 'Weinroter Abend',
    grund: '#1a0f16', grund2: '#2a1622', milch: '#9b7488',
    stern: '#f2e9e6', hell: '#ffffff', linie: '#c98a58',
    schrift: '#dcc9c4', rand: '#c98a58', ekliptik: '#a3809a'
  }
];
function sternWelt(id) { return STERN_WELTEN.find((w) => w.id === id) || STERN_WELTEN[0]; }

/* ----- Wie voll der Himmel ist ----- */
const STERN_DICHTEN = [
  ['klar', 'Klare Nacht', 900],
  ['voll', 'Voller Himmel', 1600],
  ['ueberwaeltigend', 'Überwältigend', 2600],
  ['dunstig', 'Dunstig — wenige, dafür große', 480]
];
function sternDichte(id) { return STERN_DICHTEN.find((d) => d[0] === id) || STERN_DICHTEN[1]; }

/* ----- Die Zeichen, die ein Sternbild tragen kann ----- */
const STERN_ZEICHEN = [
  ['keins', 'Ohne Zeichen'], ['tier', 'Ein Tier'], ['vogel', 'Ein Vogel'],
  ['fisch', 'Ein Fisch'], ['mensch', 'Eine Gestalt'], ['ding', 'Ein Gerät'],
  ['waffe', 'Eine Waffe'], ['pflanze', 'Eine Pflanze'], ['gefaess', 'Ein Gefäß'],
  ['rad', 'Ein Rad'], ['krone', 'Eine Krone'], ['auge', 'Ein Auge']
];
const STERN_ZEICHEN_IDS = STERN_ZEICHEN.map((z) => z[0]);

/* ===================== DER ZUFALL, DER KEINER IST ===================== */
function sternHash(...teile) {
  let h = 2166136261;
  const s = teile.join('|');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  /* Derselbe Nachbrenner wie beim Kartentisch: ohne ihn erreicht das letzte
     Zeichen nur die unteren Bits, und eine durchnummerierte Reihe ('s0',
     's1', 's2' …) käme fast gleich heraus. Bei Sternen hieße das: sie
     stünden in einer Linie. */
  h ^= h >>> 16; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0);
}
function sternZufall(...teile) { return sternHash(...teile) / 4294967296; }
function sternStreu(...teile) { return sternZufall(...teile) * 2 - 1; }

/* ===================== DER BELEG ===================== */
function saubererHimmel(roh) {
  const r = roh && typeof roh === 'object' ? roh : {};
  const sichtbar = [];
  const gesehen = new Set();
  for (const b of Array.isArray(r.sternbilder) ? r.sternbilder.slice(0, 120) : []) {
    if (!b || typeof b !== 'object') continue;
    const id = String(b.id || '').trim().slice(0, 60);
    if (!id || gesehen.has(id)) continue;
    /* Ein Sternbild ist eine Kette von Sternen. Weniger als zwei ergeben
       keine Linie — aber ein einzelner Stern darf einen Namen tragen. */
    const sterne = (Array.isArray(b.sterne) ? b.sterne : [])
      .map((n) => Math.max(0, Math.min(9999, Math.round(Number(n)))))
      .filter((n) => Number.isFinite(n))
      .slice(0, 40);
    if (!sterne.length) continue;
    gesehen.add(id);
    sichtbar.push({
      id,
      name: String(b.name || '').trim().slice(0, 80),
      sage: String(b.sage || '').trim().slice(0, 1200),
      zeichen: STERN_ZEICHEN_IDS.includes(b.zeichen) ? b.zeichen : 'keins',
      sterne,
      /* Die Linien sind Paare von Stellen INNERHALB der Kette — so bleibt
         ein Sternbild gültig, auch wenn der Himmel neu gerechnet wird. */
      linien: (Array.isArray(b.linien) ? b.linien : [])
        .filter((l) => Array.isArray(l) && l.length === 2)
        .map((l) => [Math.round(Number(l[0])), Math.round(Number(l[1]))])
        .filter((l) => l.every((n) => Number.isFinite(n) && n >= 0 && n < sterne.length) && l[0] !== l[1])
        .slice(0, 80)
    });
  }

  return {
    titel: String(r.titel || '').trim().slice(0, 90) || 'Ohne Namen',
    unterzeile: String(r.unterzeile || '').trim().slice(0, 120),
    saat: String(r.saat || '').trim().slice(0, 60) || String(r.titel || 'himmel'),
    welt: STERN_WELTEN.some((w) => w.id === r.welt) ? r.welt : 'tinte',
    dichte: STERN_DICHTEN.some((d) => d[0] === r.dichte) ? r.dichte : 'voll',
    /* Der Tag, an dem der Himmel steht — 1 bis 365. Der Himmel dreht sich
       einmal im Jahr, und das ist die Stellung. */
    tag: Math.max(1, Math.min(365, Math.round(Number(r.tag)) || 1)),
    milchstrasse: r.milchstrasse !== false,
    ekliptik: r.ekliptik !== false,
    horizont: r.horizont !== false,
    sternbilder: sichtbar,
    notiz: String(r.notiz || '').trim().slice(0, 6000)
  };
}

function sternhimmel() {
  return [...D.docs.values()].filter((d) => d.typ === 'sternhimmel' && !d.geloescht)
    .sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0));
}

/* ===================== DER HIMMEL SELBST =====================
   Sterne stehen nicht gleichmäßig. Ein echter Himmel hat ein Band, in dem
   sie sich drängen — die Milchstraße —, und dazwischen große leere
   Flächen. Und es gibt wenige helle und sehr viele schwache: wer alle
   gleich groß malt, bekommt Konfetti, keinen Himmel. */
function sternFeld(himmel) {
  const saat = himmel.saat;
  const wieViele = sternDichte(himmel.dichte)[2];
  const sterne = [];

  /* Die Milchstraße liegt als Band über dem Blatt, unter einem Winkel,
     der zur Saat gehört. */
  const bandWinkel = sternZufall(saat, 'bw') * Math.PI;
  const bandKos = Math.cos(bandWinkel), bandSin = Math.sin(bandWinkel);
  const bandBreite = STERN_R * (0.17 + sternZufall(saat, 'bb') * 0.1);

  for (let i = 0; i < wieViele; i++) {
    /* Gleichmäßig auf der Scheibe: die Wurzel sorgt dafür, dass sich
       nichts in der Mitte ballt. */
    let w = sternZufall(saat, 'sw' + i) * Math.PI * 2;
    let r = Math.sqrt(sternZufall(saat, 'sr' + i)) * STERN_R;

    /* Jeder dritte Stern wird ins Band gezogen. */
    const imBand = himmel.milchstrasse && sternZufall(saat, 'sb' + i) < 0.34;
    if (imBand) {
      const laengs = (sternZufall(saat, 'sl' + i) * 2 - 1) * STERN_R;
      const quer = sternStreu(saat, 'sq' + i) * bandBreite;
      const x = laengs * bandKos - quer * bandSin;
      const y = laengs * bandSin + quer * bandKos;
      r = Math.hypot(x, y);
      if (r > STERN_R) continue;
      w = Math.atan2(y, x);
    }

    /* Die Helligkeit.
       Der erste Versuch nahm die vierte Potenz einer Gleichverteilung —
       und machte damit jeden fünften Stern zu einem hellen. Auf dem Blatt
       standen zweihundertachtundsiebzig Sterne mit Hof und Strahlen, und
       das sah aus wie Schneetreiben.

       Am echten Himmel wächst die Zahl der Sterne mit jeder
       Größenklasse um etwa das Zweieinhalbfache: eine Handvoll sehr
       heller, ein paar Dutzend helle, Hunderte mittlere, Tausende, die
       man kaum sieht. Darum werden hier Stufen gewürfelt und nicht eine
       Kurve — dann stimmt das Verhältnis, statt ungefähr zu stimmen. */
    const roh = sternZufall(saat, 'sh' + i);
    let groesse;
    if (roh > 0.9965) groesse = 3.6 + sternZufall(saat, 'sg' + i) * 1.9;   /* die paar Leitsterne */
    else if (roh > 0.978) groesse = 2.5 + sternZufall(saat, 'sg' + i) * 1.0;
    else if (roh > 0.90) groesse = 1.5 + sternZufall(saat, 'sg' + i) * 0.9;
    else if (roh > 0.62) groesse = 0.85 + sternZufall(saat, 'sg' + i) * 0.6;
    else groesse = 0.32 + sternZufall(saat, 'sg' + i) * 0.42;
    /* Im Band stehen sie dichter und wirken darum schwächer. */
    if (imBand) groesse *= 0.82;

    sterne.push({
      n: sterne.length,
      /* Gespeichert wird die Lage am FESTEN Himmel, in Bogenmaß und
         Abstand — die Drehung übers Jahr kommt erst beim Zeichnen dazu.
         Sonst hinge jedes Sternbild an einem Datum. */
      w, r,
      gr: Math.max(0.3, groesse),
      /* Ein Farbton: bläulich, weiß, gelblich, rötlich. */
      ton: sternZufall(saat, 'st' + i)
    });
  }
  return sterne;
}

/* Die Lage eines Sterns an einem bestimmten Tag.
   Der Himmel dreht sich einmal im Jahr um den Pol — 360 Grad auf 365
   Tage. Ohne diese Drehung wäre die Sternwarte ein Bild; mit ihr ist sie
   eine Uhr. */
function sternStelle(stern, tag) {
  const dreh = ((Number(tag) || 1) - 1) / 365 * Math.PI * 2;
  const w = stern.w + dreh;
  return [STERN_MITTE + Math.cos(w) * stern.r, STERN_MITTE + Math.sin(w) * stern.r];
}

/* Alle Sterne eines Tages, fertig gestellt. */
function sternHimmelBauen(himmel) {
  const feld = sternFeld(himmel);
  const stellen = feld.map((s) => {
    const [x, y] = sternStelle(s, himmel.tag);
    return Object.assign({}, s, { x, y });
  });
  return { sterne: stellen, feld };
}

/* ===================== DIE SICHT AUF EIN STERNBILD ===================== */
/* Wo steht ein Sternbild an diesem Tag? Gemittelt über seine Sterne. */
function sternbildMitte(bild, sterne) {
  const drin = bild.sterne.map((n) => sterne[n]).filter(Boolean);
  if (!drin.length) return null;
  const x = drin.reduce((s, p) => s + p.x, 0) / drin.length;
  const y = drin.reduce((s, p) => s + p.y, 0) / drin.length;
  return [x, y];
}

/* In welcher Himmelsrichtung steht es? Oben ist Norden. */
const STERN_RICHTUNGEN = ['im Osten', 'im Südosten', 'im Süden', 'im Südwesten',
  'im Westen', 'im Nordwesten', 'im Norden', 'im Nordosten'];
function sternRichtung(x, y) {
  let w = Math.atan2(y - STERN_MITTE, x - STERN_MITTE);
  if (w < 0) w += Math.PI * 2;
  return STERN_RICHTUNGEN[Math.round(w / (Math.PI / 4)) % 8];
}

/* Wie hoch steht es? Ganz außen ist der Horizont, in der Mitte der Zenit. */
function sternHoehe(x, y) {
  const d = Math.hypot(x - STERN_MITTE, y - STERN_MITTE) / STERN_R;
  if (d < 0.22) return 'im Zenit';
  if (d < 0.5) return 'hoch am Himmel';
  if (d < 0.78) return 'auf halber Höhe';
  return 'dicht über dem Horizont';
}

/* ===================== WER UNTER WELCHEM ZEICHEN GEBOREN IST =====================
   Das ist der Griff, der aus dem Bild ein Werkzeug macht. Ein Datum ist
   ein Tag im Jahr, ein Tag im Jahr ist eine Himmelsdrehung — und damit
   steht fest, welches Sternbild an diesem Tag am höchsten stand.

   Es ist keine Astrologie und will keine sein. Es ist eine Auskunft:
   „An dem Tag stand der Reiher im Zenit.“ Was du daraus machst, ist
   deine Geschichte. */
function sternTagAusDatum(datum) {
  const s = String(datum || '').trim();
  /* VANI-Datumsformen: JJJJ-MM-TT, TT.MM.JJJJ, oder nur ein Jahr. */
  let monat = 0, tag = 0;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) { monat = +m[2]; tag = +m[3]; }
  else {
    m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/.exec(s);
    if (m) { monat = +m[2]; tag = +m[1]; }
  }
  if (!monat || !tag) return null;
  const vorMonat = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const n = (vorMonat[Math.min(12, Math.max(1, monat))] || 0) + tag;
  return Math.max(1, Math.min(365, n));
}

/* Welches Sternbild steht an diesem Tag am höchsten? */
function sternZeichenAmTag(himmel, tag) {
  if (!himmel.sternbilder.length) return null;
  const feld = sternFeld(himmel);
  let bestes = null, hoch = Infinity;
  for (const bild of himmel.sternbilder) {
    const drin = bild.sterne.map((n) => feld[n]).filter(Boolean);
    if (!drin.length) continue;
    let sx = 0, sy = 0;
    for (const s of drin) {
      const [x, y] = sternStelle(s, tag);
      sx += x; sy += y;
    }
    sx /= drin.length; sy /= drin.length;
    const d = Math.hypot(sx - STERN_MITTE, sy - STERN_MITTE);
    if (d < hoch) { hoch = d; bestes = bild; }
  }
  return bestes ? { bild: bestes, abstand: hoch / STERN_R } : null;
}

/* Und der Satz dazu, den man vorlesen kann. */
function sternGeburtssatz(himmel, datum) {
  const tag = sternTagAusDatum(datum);
  if (tag == null) return '';
  const z = sternZeichenAmTag(himmel, tag);
  if (!z || !z.bild.name) return '';
  /* Der Name trägt seinen Artikel („Die Stille Sichel“) — mitten im Satz
     stünde er dann groß, wo Deutsch klein verlangt. Also wird der Name ans
     Ende gestellt, wo er als Name stehen darf. */
  return 'An diesem Tag stand am höchsten: ' + z.bild.name + '.';
}

/* ===================== NAMEN =====================
   Vorschläge, keine Vorschriften. Ein Sternbild heißt, wie du es nennst —
   aber vor einem leeren Feld fällt einem nichts ein. */
const STERN_ARTIKEL = [['Der', 'm'], ['Die', 'f'], ['Das', 'n']];
const STERN_WOERTER = [
  ['Reiher', 'm'], ['Rabe', 'm'], ['Wolf', 'm'], ['Hirsch', 'm'], ['Bär', 'm'],
  ['Fuchs', 'm'], ['Falke', 'm'], ['Schwan', 'm'], ['Hecht', 'm'], ['Aal', 'm'],
  ['Sichel', 'f'], ['Waage', 'f'], ['Krone', 'f'], ['Leier', 'f'], ['Schlange', 'f'],
  ['Spindel', 'f'], ['Fackel', 'f'], ['Brücke', 'f'], ['Mühle', 'f'], ['Ähre', 'f'],
  ['Rad', 'n'], ['Segel', 'n'], ['Horn', 'n'], ['Auge', 'n'], ['Beil', 'n'],
  ['Netz', 'n'], ['Kreuz', 'n'], ['Tor', 'n'], ['Schiff', 'n'], ['Messer', 'n']
];
const STERN_BEIWORT = [
  '', '', '', 'Große', 'Kleine', 'Alte', 'Ferne', 'Stille', 'Blasse', 'Gebrochene',
  'Wandernde', 'Schlafende', 'Blutende', 'Verlorene', 'Erste', 'Letzte'
];
function sternName(saat, i) {
  const [wort, geschlecht] = STERN_WOERTER[sternHash(saat, 'nw' + i) % STERN_WOERTER.length];
  const artikel = geschlecht === 'f' ? 'Die' : geschlecht === 'n' ? 'Das' : 'Der';
  const bei = STERN_BEIWORT[sternHash(saat, 'nb' + i) % STERN_BEIWORT.length];
  if (!bei) return artikel + ' ' + wort;
  /* Das Beiwort wird gebeugt: „Der Große Bär“, „Die Große Sichel“,
     „Das Große Rad“ — im Deutschen heißt das jedes Mal dasselbe, weil der
     Artikel schon dekliniert. Aber „Der Blutende Rabe“ braucht das -e,
     „Die Blutende Sichel“ auch. Passt so. */
  return artikel + ' ' + bei + ' ' + wort;
}

/* Ein Vorschlag, der noch nicht vergeben ist. */
function sternNeuerName(himmel) {
  const schon = new Set(himmel.sternbilder.map((b) => b.name));
  for (let i = 0; i < 400; i++) {
    const n = sternName(himmel.saat, i + himmel.sternbilder.length * 7);
    if (!schon.has(n)) return n;
  }
  return 'Ohne Namen';
}

function sternNeueSaat() {
  return Date.now().toString(36) + '-' + Math.floor(Math.random() * 46656).toString(36);
}

/* ===================== ZAHLEN UND SUCHE ===================== */
function sternZahlen(himmel) {
  const h = himmel && himmel.sternbilder ? himmel : saubererHimmel(himmel);
  const sterne = h.sternbilder.reduce((s, b) => s + b.sterne.length, 0);
  const linien = h.sternbilder.reduce((s, b) => s + b.linien.length, 0);
  return {
    bilder: h.sternbilder.length,
    sterne, linien,
    mitSage: h.sternbilder.filter((b) => b.sage).length,
    ohneNamen: h.sternbilder.filter((b) => !b.name).length
  };
}

function sternSuche(himmel, frage) {
  const q = String(frage || '').trim().toLowerCase();
  if (!q) return himmel.sternbilder;
  return himmel.sternbilder.filter((b) =>
    (b.name || '').toLowerCase().includes(q) || (b.sage || '').toLowerCase().includes(q));
}

/* Was auffällt: ein Sternbild ohne Namen, eines ohne Linien, zwei mit
   demselben Namen. */
function sternAuffaelligkeiten(himmel) {
  const raus = [];
  const h = himmel && himmel.sternbilder ? himmel : saubererHimmel(himmel);
  const namen = new Map();
  for (const b of h.sternbilder) {
    if (!b.name) raus.push({ art: 'name', text: 'Ein Sternbild hat noch keinen Namen.', wer: b.id });
    else {
      namen.set(b.name, (namen.get(b.name) || 0) + 1);
    }
    if (b.sterne.length > 1 && !b.linien.length) {
      raus.push({ art: 'linien', text: '„' + (b.name || 'Ein Sternbild') + '“ hat Sterne, aber keine Linien.', wer: b.id });
    }
  }
  for (const [n, wie] of namen) {
    if (wie > 1) raus.push({ art: 'doppelt', text: '„' + n + '“ gibt es ' + wie + '-mal.', wer: '' });
  }
  if (!h.sternbilder.length) {
    raus.push({ art: 'leer', text: 'Noch ist kein Sternbild gezogen. Tipp einen Stern an, dann den nächsten.', wer: '' });
  }
  return raus.slice(0, 12);
}
