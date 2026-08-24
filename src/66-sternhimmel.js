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
    id: 'tinte', kalt: '#b6c8ff', kuehl: '#dde6ff', warm: '#ffe6bf', rot: '#ffbd9a', name: 'Tinte und Silber',
    grund: '#0e1626', grund2: '#182741', milch: '#7f93c4',
    stern: '#f4f1e4', hell: '#ffffff', linie: '#c8a85c',
    schrift: '#dfd7bd', rand: '#c8a85c', ekliptik: '#8fa2cc'
  },
  {
    id: 'kupfer', kalt: '#4a5570', kuehl: '#3a3f52', warm: '#5c4526', rot: '#6b3a20', name: 'Kupferstich',
    grund: '#efe6cf', grund2: '#e2d5b6', milch: '#b6a27a',
    stern: '#2c2418', hell: '#0e0b06', linie: '#8a5a2a',
    schrift: '#3a3020', rand: '#8a5a2a', ekliptik: '#8a7a52'
  },
  {
    id: 'mitternacht', kalt: '#a8b6dd', kuehl: '#d4d8e6', warm: '#ecd9b4', rot: '#e5ac8b', name: 'Mitternacht',
    grund: '#07080f', grund2: '#0e1020', milch: '#5f6a94',
    stern: '#e8e6df', hell: '#ffffff', linie: '#9c8f6a',
    schrift: '#b9b3a0', rand: '#7d7a68', ekliptik: '#6d78a0'
  },
  {
    id: 'moos', kalt: '#b3d0d8', kuehl: '#dcecdf', warm: '#f0e2b6', rot: '#eeb894', name: 'Über dem Moor',
    grund: '#0d1a16', grund2: '#152a22', milch: '#6f9184',
    stern: '#eef0e6', hell: '#ffffff', linie: '#c0a457',
    schrift: '#cfd6c2', rand: '#c0a457', ekliptik: '#7fa08e'
  },
  {
    id: 'wein', kalt: '#c3b2d8', kuehl: '#eadde4', warm: '#f6dcb6', rot: '#f5b193', name: 'Weinroter Abend',
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
    /* Was sonst noch am Himmel steht. Alles einzeln abschaltbar: nicht
       jede Welt hat einen Mond, und nicht jeder Himmel einen Kometen. */
    wandler: r.wandler !== false,
    mond: r.mond !== false,
    nebel: r.nebel !== false,
    haufen: r.haufen !== false,
    komet: r.komet !== false,
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

  /* Die Sternhaufen kommen ZULETZT — und das ist kein Schönheitsgrund.
     Ein Sternbild speichert die NUMMERN seiner Sterne. Wer neue Sterne
     vorne in die Liste legt, verschiebt jede Nummer dahinter, und alle
     bestehenden Sternbilder zeigen danach auf fremde Sterne: die Linien
     liefen quer über den Himmel. Was hinten angehängt wird, kann das
     nicht anrichten.

     Ein Knoten aus vielen kleinen Sternen dicht beieinander — am Himmel
     das, woran das Auge hängenbleibt; eine gleichmäßige Streuung hat so
     etwas nie. */
  for (const h of sternHaufen(himmel)) {
    const mx = Math.cos(h.w) * h.r, my = Math.sin(h.w) * h.r;
    for (let k = 0; k < h.wieViele; k++) {
      /* Zur Mitte dichter: zwei Würfe gemittelt reichen dafür. */
      const a = sternZufall(saat, 'hk' + h.n + '_' + k) * Math.PI * 2;
      const d = (sternZufall(saat, 'hd' + h.n + '_' + k) + sternZufall(saat, 'he' + h.n + '_' + k)) / 2 * h.weite;
      const x = mx + Math.cos(a) * d, y = my + Math.sin(a) * d;
      const rr = Math.hypot(x, y);
      if (rr > STERN_R) continue;
      const roh = sternZufall(saat, 'hh' + h.n + '_' + k);
      sterne.push({
        n: sterne.length,
        w: Math.atan2(y, x), r: rr,
        gr: 0.45 + roh * (roh > 0.9 ? 1.6 : 0.55),
        ton: sternZufall(saat, 'ht' + h.n + '_' + k),
        haufen: h.n
      });
    }
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
  /* Alles, was sich anders bewegt als die Fixsterne, wird hier für den
     gewählten Tag ausgerechnet — damit das Zeichnen nichts mehr rechnen
     muss und der Tageslauf flüssig bleibt. */
  const wandler = sternWandler(himmel).map((w) => {
    const [x, y] = sternWandlerStelle(w, himmel.tag);
    return Object.assign({}, w, { x, y });
  });
  const nebel = sternNebel(himmel).map((n) => {
    const [x, y] = sternNebelStelle(n, himmel.tag);
    return Object.assign({}, n, { x, y });
  });
  return {
    sterne: stellen, feld, wandler, nebel,
    mond: sternMond(himmel),
    komet: sternKomet(himmel)
  };
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

/* ===================== DIE WANDELSTERNE =====================
   Der Unterschied zwischen einem Bild und einem Himmel ist, dass sich
   etwas darin BEWEGT — und zwar anders als der Rest.

   Die Fixsterne drehen sich alle gemeinsam einmal im Jahr; sie stehen
   zueinander immer gleich. Ein Wandelstern nicht: er zieht auf der
   Ekliptik seine eigene Bahn, mit eigener Umlaufzeit, und steht darum an
   jedem Tag woanders zwischen den Sternbildern. Genau das haben Menschen
   vor viertausend Jahren bemerkt, und genau deshalb haben sie ihnen
   Namen gegeben. */
const STERN_WANDLER_NAMEN = [
  ['Der Rote', 'ein zorniger Stern; man sagt, er bringt Streit'],
  ['Die Weiße', 'der Abendstern; sie steht für das, was man nicht sagt'],
  ['Der Träge', 'er braucht Jahre für eine Runde; Bauern richten sich nach ihm'],
  ['Der Bote', 'er ist selten zu sehen und immer in Eile'],
  ['Die Blaue', 'kalt und weit; Seeleute schwören auf sie'],
  ['Der Späte', 'er kommt zuletzt und geht zuerst'],
  ['Der Wächter', 'er steht dem Nordstern am nächsten']
];

/* Wie viele Wandelsterne dieser Himmel hat und wie sie laufen. */
function sternWandler(himmel) {
  if (himmel.wandler === false) return [];
  const saat = himmel.saat;
  const wieViele = 3 + (sternHash(saat, 'wz') % 4);
  const raus = [];
  for (let i = 0; i < wieViele; i++) {
    const [name, sage] = STERN_WANDLER_NAMEN[(sternHash(saat, 'wn' + i) + i) % STERN_WANDLER_NAMEN.length];
    if (raus.some((w) => w.name === name)) continue;
    raus.push({
      n: raus.length,
      name, sage,
      /* Die Umlaufzeit in Tagen: von einem knappen Jahr bis zu zwölf.
         Kurze Umläufe wandern sichtbar, lange stehen fast still — und
         genau dieser Unterschied macht sie zu Persönlichkeiten. */
      umlauf: Math.round(140 + sternZufall(saat, 'wu' + i) * 4200),
      /* Wo er am ersten Tag steht. */
      anfang: sternZufall(saat, 'wa' + i) * Math.PI * 2,
      gr: 2.2 + sternZufall(saat, 'wg' + i) * 1.9,
      /* Der Farbton macht sie unterscheidbar, ohne bunt zu werden. */
      ton: sternZufall(saat, 'wt' + i)
    });
  }
  return raus;
}

/* Wo steht ein Wandelstern an diesem Tag?
   Er läuft auf der Ekliptik — dem Band, auf dem auch Sonne und Mond
   ziehen —, und die Ekliptik dreht sich mit dem Himmel mit. */
function sternWandlerStelle(wandler, tag) {
  const eigen = wandler.anfang + ((tag - 1) / wandler.umlauf) * Math.PI * 2;
  const himmelsdrehung = ((tag - 1) / 365) * Math.PI * 2;
  const w = eigen + himmelsdrehung;
  /* Dieselbe Bahn wie die gezeichnete Ekliptik. */
  const r = STERN_R * (0.62 + Math.sin(eigen * 2) * 0.06);
  return [
    STERN_MITTE + Math.cos(w) * r,
    STERN_MITTE + Math.sin(w) * r * 0.86
  ];
}

/* ===================== DER MOND =====================
   Er läuft schneller als alles andere und wechselt dabei sein Gesicht.
   Beides zusammen — Stellung und Phase — macht ihn zur Uhr, an der man
   ohne Kalender ablesen kann, welcher Tag ist. */
const STERN_MONDLAUF = 27.3;      /* Tage für eine Runde am Himmel */
const STERN_MONDPHASE = 29.53;    /* Tage von Neumond zu Neumond */

function sternMond(himmel) {
  if (himmel.mond === false) return null;
  const tag = himmel.tag;
  const versatz = sternZufall(himmel.saat, 'mo') * STERN_MONDPHASE;
  /* Die Phase: 0 ist Neumond, 0.5 Vollmond. */
  const phase = (((tag - 1 + versatz) % STERN_MONDPHASE) / STERN_MONDPHASE + 1) % 1;
  const eigen = sternZufall(himmel.saat, 'ml') * Math.PI * 2 + ((tag - 1) / STERN_MONDLAUF) * Math.PI * 2;
  const himmelsdrehung = ((tag - 1) / 365) * Math.PI * 2;
  const w = eigen + himmelsdrehung;
  const r = STERN_R * 0.68;
  return {
    x: STERN_MITTE + Math.cos(w) * r,
    y: STERN_MITTE + Math.sin(w) * r * 0.86,
    phase,
    /* Wie weit die Sichel gefüllt ist — für das Zeichnen. */
    voll: 1 - Math.abs(phase - 0.5) * 2,
    name: sternMondphaseName(phase)
  };
}

function sternMondphaseName(phase) {
  if (phase < 0.03 || phase > 0.97) return 'Neumond';
  if (phase < 0.22) return 'zunehmende Sichel';
  if (phase < 0.28) return 'Halbmond, zunehmend';
  if (phase < 0.47) return 'zunehmender Mond';
  if (phase < 0.53) return 'Vollmond';
  if (phase < 0.72) return 'abnehmender Mond';
  if (phase < 0.78) return 'Halbmond, abnehmend';
  return 'abnehmende Sichel';
}

/* ===================== NEBEL UND HAUFEN =====================
   Was am Himmel weder Stern noch Leere ist. Beides gibt es wirklich, und
   beides macht den Unterschied zwischen einer Punktwolke und einem
   Himmel, den man ansehen mag. */
function sternNebel(himmel) {
  if (himmel.nebel === false) return [];
  const saat = himmel.saat;
  const wieViele = 2 + (sternHash(saat, 'nz') % 3);
  const raus = [];
  for (let i = 0; i < wieViele; i++) {
    const w = sternZufall(saat, 'nw' + i) * Math.PI * 2;
    const r = Math.sqrt(sternZufall(saat, 'nr' + i)) * STERN_R * 0.82;
    const gross = STERN_R * (0.06 + sternZufall(saat, 'ng' + i) * 0.09);
    /* Ein Nebel ist keine Scheibe: sein Umriss ist ausgefranst. */
    const ecken = [];
    const seiten = 9 + (sternHash(saat, 'ns' + i) % 4);
    for (let k = 0; k < seiten; k++) {
      const a = (k / seiten) * Math.PI * 2;
      const rr = gross * (0.55 + sternZufall(saat, 'np' + i + '_' + k) * 0.75);
      ecken.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.78]);
    }
    raus.push({ n: i, w, r, ecken, ton: sternZufall(saat, 'nt' + i) });
  }
  return raus;
}

/* Wo steht ein Nebel an diesem Tag? Er dreht mit dem Himmel. */
function sternNebelStelle(nebel, tag) {
  const dreh = ((tag - 1) / 365) * Math.PI * 2;
  const w = nebel.w + dreh;
  return [STERN_MITTE + Math.cos(w) * nebel.r, STERN_MITTE + Math.sin(w) * nebel.r];
}

/* Sternhaufen: ein Knoten aus vielen kleinen Sternen dicht beieinander.
   Sie werden nicht extra gezeichnet — sie sind Teil des Sternfelds und
   entstehen dort, wo sich die Streuung ballt. Diese Liste sagt nur, WO
   die Ballungen liegen, damit das Feld sie berücksichtigen kann. */
function sternHaufen(himmel) {
  if (himmel.haufen === false) return [];
  const saat = himmel.saat;
  const wieViele = 2 + (sternHash(saat, 'hz') % 4);
  const raus = [];
  for (let i = 0; i < wieViele; i++) {
    const w = sternZufall(saat, 'hw' + i) * Math.PI * 2;
    const r = Math.sqrt(sternZufall(saat, 'hr' + i)) * STERN_R * 0.85;
    raus.push({
      n: i, w, r,
      weite: STERN_R * (0.028 + sternZufall(saat, 'hg' + i) * 0.045),
      wieViele: 18 + (sternHash(saat, 'hn' + i) % 40)
    });
  }
  return raus;
}

/* ===================== EIN KOMET =====================
   Nicht jeder Himmel hat einen. Wenn doch, ist er das, worüber man
   spricht — und in einer Geschichte fast immer ein Vorzeichen. */
function sternKomet(himmel) {
  if (himmel.komet === false) return null;
  /* Nur etwa jeder dritte Himmel trägt einen. Ein Komet, den es immer
     gibt, ist kein Komet mehr. */
  if (sternZufall(himmel.saat, 'kd') > 0.34) return null;
  const saat = himmel.saat;
  const w = sternZufall(saat, 'kw') * Math.PI * 2 + ((himmel.tag - 1) / 365) * Math.PI * 2;
  const r = STERN_R * (0.3 + sternZufall(saat, 'kr') * 0.5);
  /* Der Schweif zeigt IMMER von der Sonne weg — und die steht, von hier
     aus gesehen, in der Mitte des Blattes. Das ist die eine Regel, an der
     man einen falsch gezeichneten Kometen sofort erkennt. */
  const x = STERN_MITTE + Math.cos(w) * r;
  const y = STERN_MITTE + Math.sin(w) * r;
  return {
    x, y,
    schweif: Math.atan2(y - STERN_MITTE, x - STERN_MITTE),
    laenge: STERN_R * (0.16 + sternZufall(saat, 'kl') * 0.2),
    name: sternKometname(saat)
  };
}
const STERN_KOMET_WORTE = ['Der Besenstern', 'Der Haarstern', 'Das Zeichen', 'Der Schleppende',
  'Die Rute', 'Der Gast', 'Das lange Licht'];
function sternKometname(saat) {
  return STERN_KOMET_WORTE[sternHash(saat, 'kn') % STERN_KOMET_WORTE.length];
}

/* ===================== DIE FARBE EINES STERNS =====================
   Sterne sind wirklich farbig, nur sehr zurückhaltend: von bläulichweiß
   über weiß und gelb bis rötlich. Wer das übertreibt, bekommt eine
   Kirmes; wer es weglässt, bekommt Salz auf Papier. */
function sternFarbe(ton, welt) {
  const w = welt || sternWelt('tinte');
  if (ton < 0.10) return w.kalt || '#b8ccff';
  if (ton < 0.28) return w.kuehl || '#dbe6ff';
  if (ton > 0.94) return w.rot || '#ffb591';
  if (ton > 0.80) return w.warm || '#ffe0b8';
  return w.stern;
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
  const gebaut = sternHimmelBauen(h);
  return {
    bilder: h.sternbilder.length,
    sterne, linien,
    himmelssterne: gebaut.sterne.length,
    wandler: gebaut.wandler.length,
    nebel: gebaut.nebel.length,
    mond: gebaut.mond ? gebaut.mond.name : '',
    komet: gebaut.komet ? gebaut.komet.name : '',
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
