/* ===================== 65 — DER KARTENTISCH =====================
   Stadtpläne für Orte, die es nur bei dir gibt.

   Der Gedanke dahinter: Eine Stadt zeichnet man nicht Haus für Haus. Man
   legt fest, WO sie liegt (am Fluss, an der Küste, auf einer Insel), WIE
   ALT sie ist, WIE GROSS — und der Rest wächst daraus. Danach geht man
   hinein und gibt den Stellen Namen, die einem wichtig sind.

   Alles wird aus einer SAAT gerechnet. Dieselbe Saat ergibt bis auf den
   letzten Dachfirst dieselbe Stadt — heute, morgen, auf jedem Gerät. Nichts
   wird gewürfelt und gespeichert; gespeichert wird nur die Saat und was du
   selbst hineingeschrieben hast. Ein Plan mit vierhundert Häusern wiegt
   deshalb so viel wie ein kurzer Brief.

   Der Aufbau einer gewachsenen Stadt ist radial: vom Markt gehen Straßen
   nach außen, dazwischen liegen Ringe. Was zwischen zwei Straßen und zwei
   Ringen liegt, ist ein Block; ein Block wird in Parzellen geteilt, und auf
   jede Parzelle kommt ein Haus. So entstehen Häuserzeilen, die zur Straße
   stehen — und genau das unterscheidet eine Stadt von einem Haufen
   Rechtecke.

   Hier drin ist kein DOM. Nur Zahlen. */

const PLAN_GROESSE = 1200;

/* ----- Papiere ----- */
const PLAN_PAPIERE = [
  ['buetten', 'Bütten', '#f2e9d2', '#e6d9ba'],
  ['pergament', 'Pergament', '#ecdcb4', '#dcc79a'],
  ['leinen', 'Leinen', '#e8e4d6', '#d6d0be'],
  ['seekarte', 'Seekarte', '#e2dcc4', '#cfc7a8'],
  ['nacht', 'Nachtblau', '#1c2432', '#141a25'],
  ['tinte', 'Tintenpapier', '#dfd8c6', '#cbc2ac']
];
function planPapier(id) { return PLAN_PAPIERE.find((p) => p[0] === id) || PLAN_PAPIERE[0]; }

/* ----- Die Farbwelten -----
   Jede setzt Wasser, Grün, Dach, Mauerwerk und Tinte. Sie sind nicht bunt,
   sondern gedruckt: zwei, drei Töne, die zusammengehören. */
const PLAN_FARBWELTEN = [
  {
    id: 'tinte', name: 'Tinte und Bütten', papier: 'buetten',
    wasser: '#dfe8e7', wasserrand: '#5b7a84', gruen: '#b9c4a0', gruendunkel: '#93a37b',
    dach: '#c98a63', dachdunkel: '#a86a48', mauer: '#e4d9c0', strasse: '#efe7d4',
    daecher: ['#cf9068', '#c1815c', '#b87553', '#a86a48', '#d69a72'],
    tinte: '#3a3428', tintezart: 'rgba(58,52,40,.42)', gold: '#a8843c'
  },
  {
    id: 'moos', name: 'Moos und Kupfer', papier: 'leinen',
    wasser: '#dce5e2', wasserrand: '#4e6d6a', gruen: '#a6b48c', gruendunkel: '#7f8f66',
    dach: '#7d9184', dachdunkel: '#5e7166', mauer: '#ded9c6', strasse: '#eeeadb',
    daecher: ['#849889', '#77897c', '#6b7d71', '#5e7166', '#8fa294'],
    tinte: '#2f382f', tintezart: 'rgba(47,56,47,.4)', gold: '#8f7a3e'
  },
  {
    id: 'rost', name: 'Rost und Sand', papier: 'pergament',
    wasser: '#e3e6d9', wasserrand: '#64766b', gruen: '#bfbb8a', gruendunkel: '#9a9668',
    dach: '#b5563c', dachdunkel: '#8f3f2c', mauer: '#e6d5ac', strasse: '#f0e4c4',
    daecher: ['#bd6044', '#b5563c', '#a94e35', '#9a452e', '#c76d4c'],
    tinte: '#40301f', tintezart: 'rgba(64,48,31,.42)', gold: '#b08334'
  },
  {
    id: 'see', name: 'Seekarte', papier: 'seekarte',
    wasser: '#dee7ea', wasserrand: '#5f7f8b', gruen: '#c2c3a2', gruendunkel: '#9ba07d',
    dach: '#9a8468', dachdunkel: '#77644c', mauer: '#e0dcc2', strasse: '#eeead2',
    daecher: ['#a38d70', '#9a8468', '#8e7a5f', '#816d54', '#ab967a'],
    tinte: '#334049', tintezart: 'rgba(51,64,73,.4)', gold: '#96702f'
  },
  {
    id: 'nacht', name: 'Nacht und Laternen', papier: 'nacht',
    wasser: '#22323e', wasserrand: '#7ea3b4', gruen: '#26372c', gruendunkel: '#1a2820',
    dach: '#5d4a3c', dachdunkel: '#42342a', mauer: '#3a4150', strasse: '#39414e',
    daecher: ['#66523f', '#5d4a3c', '#544235', '#4a392e', '#6f5a45'],
    tinte: '#d9cfae', tintezart: 'rgba(217,207,174,.34)', gold: '#e0b46a'
  },
  {
    id: 'winter', name: 'Winter', papier: 'leinen',
    wasser: '#e8eef1', wasserrand: '#7f939e', gruen: '#c8cec2', gruendunkel: '#a4ada0',
    dach: '#8d8f97', dachdunkel: '#6e7078', mauer: '#eceadf', strasse: '#f6f3e8',
    daecher: ['#95979f', '#8d8f97', '#84868e', '#7a7c84', '#9da0a8'],
    tinte: '#3b414a', tintezart: 'rgba(59,65,74,.36)', gold: '#8a7c56'
  }
];
function planFarbwelt(id) { return PLAN_FARBWELTEN.find((f) => f.id === id) || PLAN_FARBWELTEN[0]; }

/* ----- Der Zuschnitt -----
   Das Erkennungszeichen einer gestochenen Karte: Sie hört nicht am Blattrand
   auf, sondern ist in eine Form geschnitten — einen Kreis, ein Oval, einen
   Bogen. Was daneben liegt, bleibt Papier. */
const PLAN_ZUSCHNITTE = [
  ['blatt', 'Das ganze Blatt', 'Bis an den Rand, mit Gradstrichen ringsum.'],
  ['kreis', 'Ein Kreis', 'Wie durch ein Fernrohr gesehen.'],
  ['oval', 'Ein Oval', 'Etwas breiter als hoch.'],
  ['bogen', 'Ein Bogen', 'Oben rund, unten gerade — wie ein Fenster.'],
  ['achteck', 'Ein Achteck', 'Gestochen, mit abgeschnittenen Ecken.']
];

/* ----- Die Anlage -----
   Drei Arten, wie eine Stadt überhaupt angelegt sein kann. Das ist keine
   Verzierung: es entscheidet, was für ein Ort das ist.

   GEWACHSEN ist der Normalfall — niemand hat sie geplant, sie ist entstanden.
   STRAHLEND ist eine Entscheidung: ein Fürst hat einen Punkt gesetzt und alles
   darauf ausgerichtet (Karlsruhe, Palmanova). SCHACHBRETT ist Verwaltung:
   ein Ingenieur, ein Lineal, ein Auftrag (jede Römerstadt, jede Kolonie). */
const PLAN_ANLAGEN = [
  ['gewachsen', 'Gewachsen', 'Niemand hat sie geplant. Krumme Gassen, ungleiche Blöcke, Sackgassen.'],
  ['strahlend', 'Strahlend', 'Vom Markt gehen Straßen sternförmig fort, Ringe legen sich darum. Jemand hat das entschieden.'],
  ['schachbrett', 'Schachbrett', 'Ein Ingenieur mit einem Lineal. Gerade Achsen, gleiche Blöcke, klare Ordnung.']
];

/* ----- Was für ein Wasser die Stadt hat ----- */
const PLAN_WASSER = [
  ['keins', 'Trockenes Land', 'Kein Wasser weit und breit — die Stadt lebt vom Brunnen.'],
  ['fluss', 'Ein Fluss', 'Er teilt die Stadt, und die Brücken entscheiden alles.'],
  ['kueste', 'Am Meer', 'Eine Küste, ein Hafen, und der Wind kommt immer von dort.'],
  ['see', 'An einem See', 'Still, mit Schilf am Rand.'],
  ['insel', 'Auf einer Insel', 'Ringsum Wasser. Wer heraus will, braucht ein Boot.']
];

/* ----- Was für eine Stadt es ist -----
   Das Alter entscheidet über die Form: eine gewachsene Stadt ist krumm,
   eine geplante ist gerade. */
const PLAN_ALTER = [
  ['uralt', 'Uralt', 'Krumme Gassen, die niemand geplant hat. Alles ist über allem gebaut.', 1.0],
  ['alt', 'Alt', 'Gewachsen, aber schon einmal geordnet.', 0.66],
  ['jung', 'Jung', 'Nach Plan angelegt: gerade Straßen, klare Blöcke.', 0.3],
  ['neu', 'Am Reißbrett', 'Streng geordnet. Jemand hat das entworfen und durchgesetzt.', 0.08]
];
function planAlterWert(id) { const a = PLAN_ALTER.find((x) => x[0] === id); return a ? a[3] : 0.66; }

/* [Kennung, Name, Ausfallstraßen, Ringe, Radius als Anteil des Blattes]
   Der Radius ist das Entscheidende: vorher wuchs er kaum mit, und deshalb
   hatte ein Weiler fast so viele Häuser wie eine Metropole. Eine Stadt ist
   nicht dichter gebaut als ein Dorf — sie ist GRÖSSER. */
const PLAN_GROESSEN = [
  ['weiler', 'Ein Weiler', 4, 2, 0.085],
  ['dorf', 'Ein Dorf', 5, 2, 0.125],
  ['flecken', 'Ein Marktflecken', 7, 3, 0.185],
  ['stadt', 'Eine Stadt', 10, 4, 0.27],
  ['grossstadt', 'Eine große Stadt', 13, 5, 0.36],
  ['metropole', 'Eine Metropole', 16, 6, 0.46]
];
function planGroesse(id) { return PLAN_GROESSEN.find((g) => g[0] === id) || PLAN_GROESSEN[3]; }

/* ----- Die Viertel -----
   Ein Viertel ist kein Gebiet auf einer Verwaltungskarte, sondern ein
   Charakter: wie eng steht es, wie groß sind die Häuser, was riecht man. */
/* Die Viertel und ihr Charakter.
   `dichte` teilt die Parzellenbreite: 0,18 hieß vierundsechzig Einheiten
   Straßenfront für EIN Haus — das Gartenviertel war danach kein Viertel mehr,
   sondern ein weißes Loch mit fünfundfünfzig Häusern neben vierhundert im
   Handwerksviertel. Der Unterschied soll man SEHEN, aber lesen können muss
   man ihn auch. Darum liegt der Boden jetzt bei gut der Hälfte — und was
   locker bebaut ist, wird über `gruen` wirklich grün, statt leer zu bleiben. */
const PLAN_VIERTELARTEN = [
  { id: 'altstadt', name: 'Altstadt', dichte: 1.0, haus: 0.8, gruen: 0.03, hoefe: 0.15 },
  { id: 'handwerk', name: 'Handwerk', dichte: 0.94, haus: 0.9, gruen: 0.05, hoefe: 0.3 },
  { id: 'reich', name: 'Wohlhabend', dichte: 0.7, haus: 1.7, gruen: 0.26, hoefe: 0.5 },
  { id: 'arm', name: 'Arm', dichte: 1.0, haus: 0.6, gruen: 0.02, hoefe: 0.1 },
  { id: 'geistlich', name: 'Geistlich', dichte: 0.68, haus: 1.5, gruen: 0.3, hoefe: 0.42 },
  { id: 'hafen', name: 'Hafen', dichte: 0.86, haus: 1.2, gruen: 0.04, hoefe: 0.2 },
  { id: 'markt', name: 'Markt', dichte: 0.82, haus: 1.0, gruen: 0.07, hoefe: 0.25 },
  { id: 'vorstadt', name: 'Vorstadt', dichte: 0.6, haus: 0.9, gruen: 0.34, hoefe: 0.4 },
  { id: 'garten', name: 'Gärten', dichte: 0.55, haus: 0.85, gruen: 0.58, hoefe: 0.5 }
];
function planViertelart(id) { return PLAN_VIERTELARTEN.find((v) => v.id === id) || PLAN_VIERTELARTEN[1]; }

/* ----- Die Marken -----
   Das, was du selbst auf den Plan setzt. Kein Symbol ist bunt: alle sind
   geritzt, wie auf einer alten Karte. */
const PLAN_MARKEN = [
  { id: 'kirche', name: 'Kirche', gruppe: 'bauten' },
  { id: 'burg', name: 'Burg', gruppe: 'bauten' },
  { id: 'turm', name: 'Turm', gruppe: 'bauten' },
  { id: 'tor', name: 'Tor', gruppe: 'bauten' },
  { id: 'bruecke', name: 'Brücke', gruppe: 'bauten' },
  { id: 'muehle', name: 'Mühle', gruppe: 'bauten' },
  { id: 'ruine', name: 'Ruine', gruppe: 'bauten' },
  { id: 'markt', name: 'Markt', gruppe: 'plaetze' },
  { id: 'brunnen', name: 'Brunnen', gruppe: 'plaetze' },
  { id: 'platz', name: 'Platz', gruppe: 'plaetze' },
  { id: 'friedhof', name: 'Friedhof', gruppe: 'plaetze' },
  { id: 'garten', name: 'Garten', gruppe: 'plaetze' },
  { id: 'hafen', name: 'Hafen', gruppe: 'plaetze' },
  { id: 'wirtshaus', name: 'Wirtshaus', gruppe: 'haeuser' },
  { id: 'schmiede', name: 'Schmiede', gruppe: 'haeuser' },
  { id: 'baecker', name: 'Bäckerei', gruppe: 'haeuser' },
  { id: 'buecher', name: 'Bücherei', gruppe: 'haeuser' },
  { id: 'apotheke', name: 'Apotheke', gruppe: 'haeuser' },
  { id: 'wohnhaus', name: 'Wohnhaus', gruppe: 'haeuser' },
  { id: 'werkstatt', name: 'Werkstatt', gruppe: 'haeuser' },
  { id: 'galgen', name: 'Galgen', gruppe: 'dunkles' },
  { id: 'kerker', name: 'Kerker', gruppe: 'dunkles' },
  { id: 'grab', name: 'Grab', gruppe: 'dunkles' },
  { id: 'unheil', name: 'Hier geschah es', gruppe: 'dunkles' },
  { id: 'stern', name: 'Ohne Namen', gruppe: 'sonst' },
  { id: 'baum', name: 'Ein Baum', gruppe: 'sonst' },
  { id: 'stein', name: 'Ein Stein', gruppe: 'sonst' },
  { id: 'weg', name: 'Ein Weg hinaus', gruppe: 'sonst' }
];
const PLAN_MARKENGRUPPEN = [
  ['bauten', 'Bauten'], ['plaetze', 'Plätze'], ['haeuser', 'Häuser'],
  ['dunkles', 'Dunkles'], ['sonst', 'Sonstiges']
];
const PLAN_MARKEN_IDS = PLAN_MARKEN.map((m) => m.id);
function planMarke(id) {
  return PLAN_MARKEN.find((m) => m.id === id) || { id: 'stern', name: 'Marke', gruppe: 'sonst' };
}

/* ===================== GERECHNET, NICHT GEWÜRFELT ===================== */
function planHash(...teile) {
  let h = 2166136261;
  const s = teile.join('|');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  /* Der Nachbrenner ist nicht Zierde, sondern Notwendigkeit.
     FNV allein lässt das letzte Zeichen fast nur die unteren Bits erreichen —
     `planZufall` teilt aber durch 2^32 und liest damit die OBEREN. Die Folge
     war verheerend und lange unsichtbar: 'ww0', 'ww1', 'ww2' … ergaben
     0.382, 0.379, 0.390 — praktisch derselbe Wert. Jede durchnummerierte
     Reihe auf dieser Karte, jeder Wald, jedes Feld, jedes Zittern eines
     Hauses, war damit gar nicht gestreut, sondern gleichgeschaltet.
     Diese drei Zeilen verrühren die Bits, bis jedes Zeichen überall wirkt. */
  h ^= h >>> 16; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0);
}
function planZufall(...teile) { return planHash(...teile) / 4294967296; }
/* Ein Wert zwischen -1 und 1 */
function planStreu(...teile) { return planZufall(...teile) * 2 - 1; }

/* ===================== DER BELEG ===================== */
function saubererPlan(roh) {
  const r = roh && typeof roh === 'object' ? roh : {};
  const st = r.stadt && typeof r.stadt === 'object' ? r.stadt : {};
  const marken = [];
  const gesehen = new Set();
  for (const m of Array.isArray(r.marken) ? r.marken.slice(0, 400) : []) {
    if (!m || typeof m !== 'object') continue;
    const id = String(m.id || '').trim() || ('m' + marken.length);
    if (gesehen.has(id)) continue;
    const x = Number(m.x), y = Number(m.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    gesehen.add(id);
    marken.push({
      id,
      art: PLAN_MARKEN_IDS.includes(m.art) ? m.art : 'stern',
      name: String(m.name || '').trim().slice(0, 90),
      notiz: String(m.notiz || '').trim().slice(0, 2000),
      albumId: String(m.albumId || '').trim().slice(0, 60),
      x: Math.max(0, Math.min(PLAN_GROESSE, x)),
      y: Math.max(0, Math.min(PLAN_GROESSE, y)),
      wichtig: m.wichtig === true
    });
  }
  /* Eigene Namen für Gassen und Viertel: eine Zuordnung Kennung → Name. */
  const namen = {};
  if (r.namen && typeof r.namen === 'object') {
    for (const k of Object.keys(r.namen).slice(0, 300)) {
      const w = String(r.namen[k] || '').trim().slice(0, 80);
      if (w) namen[String(k).slice(0, 40)] = w;
    }
  }
  return {
    titel: String(r.titel || '').trim().slice(0, 90) || 'Ohne Namen',
    unterzeile: String(r.unterzeile || '').trim().slice(0, 120),
    saat: String(r.saat || '').trim().slice(0, 60) || String(r.titel || 'stadt'),
    papier: PLAN_PAPIERE.some((p) => p[0] === r.papier) ? r.papier : '',
    zuschnitt: PLAN_ZUSCHNITTE.some((z) => z[0] === r.zuschnitt) ? r.zuschnitt : 'blatt',
    welt: PLAN_FARBWELTEN.some((f) => f.id === r.welt) ? r.welt : 'tinte',
    stadt: {
      groesse: PLAN_GROESSEN.some((g) => g[0] === st.groesse) ? st.groesse : 'stadt',
      alter: PLAN_ALTER.some((a) => a[0] === st.alter) ? st.alter : 'alt',
      anlage: PLAN_ANLAGEN.some((a) => a[0] === st.anlage) ? st.anlage : 'gewachsen',
      wasser: PLAN_WASSER.some((w) => w[0] === st.wasser) ? st.wasser : 'fluss',
      mauer: st.mauer !== false,
      burg: st.burg !== false,
      umland: st.umland !== false,
      /* Hafen, Mühle und Werder gibt es nur am Wasser — der Schalter darf
         trotzdem stehen bleiben, damit er noch da ist, wenn jemand später
         einen Fluss dazunimmt. */
      hafen: st.hafen !== false,
      muehle: st.muehle !== false,
      inseln: st.inseln !== false,
      dichte: Math.max(0.5, Math.min(1.6, Number(st.dichte) || 1))
    },
    wappen: r.wappen && typeof r.wappen === 'object' && r.wappen.eigen ? {
      eigen: true,
      grund: PLAN_TINKTUREN.some((t) => t.id === r.wappen.grund) ? r.wappen.grund : 'silber',
      zweit: PLAN_TINKTUREN.some((t) => t.id === r.wappen.zweit) ? r.wappen.zweit : 'rot',
      figur: PLAN_TINKTUREN.some((t) => t.id === r.wappen.figur) ? r.wappen.figur : 'rot',
      teilung: PLAN_TEILUNGEN.some((t) => t.id === r.wappen.teilung) ? r.wappen.teilung : 'ganz',
      bild: PLAN_WAPPENBILDER.some((b) => b.id === r.wappen.bild) ? r.wappen.bild : 'turm',
      wieViele: Math.max(1, Math.min(3, Math.round(Number(r.wappen.wieViele) || 1)))
    } : null,
    marken, namen,
    notiz: String(r.notiz || '').trim().slice(0, 6000)
  };
}

function stadtplaene() {
  return [...D.docs.values()].filter((d) => d.typ === 'stadtplan' && !d.geloescht)
    .sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0));
}

/* ===================== DAS WASSER =====================
   Zuerst das Wasser, dann die Stadt: eine Stadt legt sich um ihr Wasser,
   nicht umgekehrt. */
function planWasser(plan) {
  const art = plan.stadt.wasser;
  const saat = plan.saat;
  const G = PLAN_GROESSE, m = G / 2;
  if (art === 'keins') return { art, polygone: [], drin: () => false, linie: null };

  if (art === 'fluss') {
    /* Ein Fluss quert die Karte. Er mäandert; wo er eng wird, liegen später
       die Brücken. */
    const winkel = 20 + planZufall(saat, 'fw') * 130;
    const rad = winkel * Math.PI / 180;
    const qx = Math.cos(rad), qy = Math.sin(rad);      /* Laufrichtung */
    const nx = -qy, ny = qx;                            /* quer dazu */
    const versatz = planStreu(saat, 'fv') * G * 0.22;
    const breite = G * (0.035 + planZufall(saat, 'fb') * 0.045);
    const mitte = [];
    for (let i = 0; i <= 26; i++) {
      const t = (i / 26) * 2 - 1;
      const schwung = Math.sin(t * 2.6 + planZufall(saat, 'fp') * 6) * G * 0.09 +
        Math.sin(t * 5.4 + planZufall(saat, 'fp2') * 6) * G * 0.035;
      mitte.push([
        m + qx * t * G * 0.85 + nx * (versatz + schwung),
        m + qy * t * G * 0.85 + ny * (versatz + schwung)
      ]);
    }
    const breiteBei = (i) => breite * (0.7 + 0.6 * (i / 26));   /* mündet breiter */
    const links = mitte.map((p, i) => [p[0] + nx * breiteBei(i) / 2, p[1] + ny * breiteBei(i) / 2]);
    const rechts = mitte.map((p, i) => [p[0] - nx * breiteBei(i) / 2, p[1] - ny * breiteBei(i) / 2]);
    const drin = (x, y) => {
      let best = 1e9, wo = 0;
      for (let i = 0; i < mitte.length; i++) {
        const dx = x - mitte[i][0], dy = y - mitte[i][1];
        const d = dx * dx + dy * dy;
        if (d < best) { best = d; wo = i; }
      }
      return Math.sqrt(best) < breiteBei(wo) / 2;
    };
    return { art, mitte, links, rechts, breite, polygone: [links.concat(rechts.slice().reverse())], drin, richtung: [qx, qy] };
  }

  if (art === 'see') {
    const cx = m + planStreu(saat, 'sx') * G * 0.3;
    const cy = m + planStreu(saat, 'sy') * G * 0.3;
    const r0 = G * (0.13 + planZufall(saat, 'sr') * 0.1);
    const rand = [];
    for (let i = 0; i < 40; i++) {
      const w = (i / 40) * Math.PI * 2;
      const r = r0 * (1 + Math.sin(w * 3 + planZufall(saat, 'sp') * 6) * 0.18 + Math.sin(w * 5 + planZufall(saat, 'sp2') * 6) * 0.1);
      rand.push([cx + Math.cos(w) * r, cy + Math.sin(w) * r * 0.82]);
    }
    const drin = (x, y) => {
      const w = Math.atan2((y - cy) / 0.82, x - cx);
      const r = r0 * (1 + Math.sin(w * 3 + planZufall(saat, 'sp') * 6) * 0.18 + Math.sin(w * 5 + planZufall(saat, 'sp2') * 6) * 0.1);
      const dx = x - cx, dy = (y - cy) / 0.82;
      return Math.sqrt(dx * dx + dy * dy) < r;
    };
    return { art, polygone: [rand], drin, mittelpunkt: [cx, cy] };
  }

  if (art === 'insel') {
    const r0 = G * 0.40;
    const rand = [];
    for (let i = 0; i < 56; i++) {
      const w = (i / 56) * Math.PI * 2;
      const r = r0 * (1 + Math.sin(w * 2 + planZufall(saat, 'ip') * 6) * 0.12 + Math.sin(w * 4.3 + planZufall(saat, 'ip2') * 6) * 0.07 + Math.sin(w * 7 + planZufall(saat, 'ip3') * 6) * 0.035);
      rand.push([m + Math.cos(w) * r, m + Math.sin(w) * r * 0.92]);
    }
    const drin = (x, y) => {
      const w = Math.atan2((y - m) / 0.92, x - m);
      const r = r0 * (1 + Math.sin(w * 2 + planZufall(saat, 'ip') * 6) * 0.12 + Math.sin(w * 4.3 + planZufall(saat, 'ip2') * 6) * 0.07 + Math.sin(w * 7 + planZufall(saat, 'ip3') * 6) * 0.035);
      const dx = x - m, dy = (y - m) / 0.92;
      return Math.sqrt(dx * dx + dy * dy) > r;     /* draußen ist Wasser */
    };
    /* Das Wasser ist alles außerhalb: als Polygon der ganze Bogen minus Insel */
    return { art, polygone: [], insel: rand, drin, mittelpunkt: [m, m] };
  }

  /* Küste: eine Linie quer über die Karte, das Wasser auf einer Seite. */
  const winkel = planZufall(saat, 'kw') * 360;
  const rad = winkel * Math.PI / 180;
  const qx = Math.cos(rad), qy = Math.sin(rad);
  const nx = -qy, ny = qx;
  /* Die Kuestenlinie lag bisher so weit draussen, dass das Wasser neben der
     Karte lag — man sah die Kueste, aber kein Meer. */
  const abstand = G * (0.06 + planZufall(saat, 'ka') * 0.2);
  const linie = [];
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * 2 - 1;
    const buchten = Math.sin(t * 3.1 + planZufall(saat, 'kp') * 6) * G * 0.07 +
      Math.sin(t * 6.7 + planZufall(saat, 'kp2') * 6) * G * 0.028;
    linie.push([
      m + qx * t * G * 1.1 + nx * (abstand + buchten),
      m + qy * t * G * 1.1 + ny * (abstand + buchten)
    ]);
  }
  const drin = (x, y) => {
    /* Auf welcher Seite der Küstenlinie? */
    let best = 1e9, wo = 0;
    for (let i = 0; i < linie.length; i++) {
      const dx = x - linie[i][0], dy = y - linie[i][1];
      const d = dx * dx + dy * dy;
      if (d < best) { best = d; wo = i; }
    }
    const p = linie[wo];
    return (x - p[0]) * nx + (y - p[1]) * ny > 0;
  };
  const weit = G * 1.6;
  const polygon = linie.concat([
    [linie[linie.length - 1][0] + nx * weit, linie[linie.length - 1][1] + ny * weit],
    [linie[0][0] + nx * weit, linie[0][1] + ny * weit]
  ]);
  return { art, linie, polygone: [polygon], drin, quer: [nx, ny] };
}

/* ===================== DIE STADT =====================
   Vom Markt gehen Straßen nach außen, dazwischen liegen Ringe. Der Punkt
   P(i,j) ist die Kreuzung von Straße i und Ring j — und alle vier Ecken
   eines Blocks sind solche Punkte. Deshalb schließen die Blöcke lückenlos
   aneinander, ohne dass irgendwo etwas verschnitten werden müsste. */
function planStadt(plan, wasser) {
  const saat = plan.saat;
  const krumm = planAlterWert(plan.stadt.alter);
  const G = PLAN_GROESSE;

  /* Die Mitte liegt selten genau in der Mitte. Bei Wasser rückt sie ans Ufer.

     Der erste Versuch schob sie dafür in eine feste Richtung — zur
     Blattmitte hin, plus ein wenig Drift. Deckt der See aber genau die
     Blattmitte ab, führt jeder Schritt wieder ins Wasser: die Mitte blieb
     nass, es entstand kein einziger Block, und die Karte war LEER. (Saat
     „mauer“, Gewässer „see“ — ein weißes Blatt mit einer Legende darauf.)

     Jetzt wird ringsum gesucht: in wachsenden Kreisen, und genommen wird
     die erste Stelle, an der nicht nur der Punkt selbst trocken ist,
     sondern auch ein Stück Land drumherum. Eine Stadt braucht Ufer, nicht
     eine Sandbank. */
  let mx = G / 2 + planStreu(saat, 'mx') * G * 0.07;
  let my = G / 2 + planStreu(saat, 'my') * G * 0.06;
  if (wasser.art !== 'keins' && wasser.drin(mx, my)) {
    const platzDa = (x, y, weit) => {
      if (x < 90 || x > G - 90 || y < 90 || y > G - 90) return false;
      if (wasser.drin(x, y)) return false;
      let trocken = 0;
      for (let i = 0; i < 12; i++) {
        const w = (i / 12) * Math.PI * 2;
        if (!wasser.drin(x + Math.cos(w) * weit, y + Math.sin(w) * weit)) trocken++;
      }
      return trocken >= 8;
    };
    const start = [mx, my];
    let gefunden = null;
    /* Erst nach richtig Platz suchen, dann mit weniger zufrieden sein. */
    for (const weit of [110, 70, 40]) {
      for (let r = 30; r <= G * 0.55 && !gefunden; r += 22) {
        for (let i = 0; i < 24 && !gefunden; i++) {
          /* Die Richtung wandert mit dem Radius, damit die Suche nicht
             immer dieselbe Achse zuerst abtastet. */
          const w = ((i / 24) + (r / 220)) * Math.PI * 2;
          const x = start[0] + Math.cos(w) * r, y = start[1] + Math.sin(w) * r;
          if (platzDa(x, y, weit)) gefunden = [x, y];
        }
      }
      if (gefunden) break;
    }
    if (gefunden) { mx = gefunden[0]; my = gefunden[1]; }
  }
  const [, , speichen, ringeZahl, radiusAnteil] = planGroesse(plan.stadt.groesse);
  const Rmax = G * radiusAnteil;

  /* --- Das Netz wächst --- */
  const anlage = plan.stadt.anlage;
  const gewachsen = anlage === 'strahlend' ? planNetzStrahlend(plan, wasser, [mx, my], Rmax, krumm)
    : anlage === 'schachbrett' ? planNetzSchachbrett(plan, wasser, [mx, my], Rmax, krumm)
      : planNetzWachsen(plan, wasser, [mx, my], Rmax, krumm);
  const flaechen = netzFlaechen(gewachsen.netz);

  /* --- Die Viertel: Sektoren mit Charakter --- */
  const viertelZahl = Math.max(3, Math.min(6, Math.round(speichen / 2.6)));
  const artenTopf = ['handwerk', 'reich', 'arm', 'geistlich', 'markt', 'handwerk', 'arm', 'garten'];
  const viertel = [];
  for (let v = 0; v < viertelZahl; v++) {
    const art = wasser.art !== 'keins' && v === 0 ? 'hafen' : artenTopf[planHash(saat, 'va' + v) % artenTopf.length];
    viertel.push({ nr: v, art, name: planViertelname(saat, v, art) });
  }
  const mauerR = plan.stadt.mauer ? Rmax * 0.74 : Infinity;
  const viertelBei = (p) => {
    const d = strecke([mx, my], p);
    if (d < Rmax * 0.2) return { nr: -1, art: 'altstadt', name: 'Die Altstadt' };
    if (d > mauerR) return { nr: -2, art: 'vorstadt', name: 'Die Vorstadt' };
    let w = Math.atan2(p[1] - my, p[0] - mx) / (Math.PI * 2);
    if (w < 0) w += 1;
    return viertel[Math.min(viertelZahl - 1, Math.floor(w * viertelZahl))];
  };

  /* --- Die Blöcke sind die Facetten des Netzes ---
     Was zu groß geraten ist, wird mit neuen Gassen geteilt: eine Stadt
     verdichtet sich, sie lässt keine Felder mitten im Häusermeer. */
  const marktFlaeche = Math.abs(netzFlaeche(gewachsen.marktEcken));
  const blockGrenze = 5600 / plan.stadt.dichte;
  const geteilt = [], schnitte = [];
  flaechen.forEach((f, i) => planBloeckeTeilen(f, blockGrenze, saat, 't' + i, 0, geteilt, schnitte));
  schnitte.forEach((sch, i) => {
    gewachsen.wege.push({ art: 'gasse', richtung: 'quer', i: 5000 + i, punkte: sch, name: planGassenname(saat, 'ts' + i, 'gasse') });
  });
  const bloecke = [];
  for (const f of geteilt) {
    const m = netzMitte(f);
    if (wasser.drin(m[0], m[1])) continue;
    const fl = Math.abs(netzFlaeche(f));
    /* Der Marktplatz selbst ist kein Block. */
    if (fl <= marktFlaeche * 1.25 && strecke(m, [mx, my]) < Rmax * 0.16) continue;
    if (fl > Rmax * Rmax * 0.55) continue;      /* eine Fläche, die alles umschließt */
    const v = viertelBei(m);
    const drausen = v.nr === -2;
    if (drausen && planZufall(saat, 'vs' + Math.round(m[0]) + '_' + Math.round(m[1])) < 0.38) continue;
    let breit = 0;
    for (let i = 0; i < f.length; i++) breit = Math.max(breit, strecke(f[i], f[(i + 1) % f.length]));
    bloecke.push({
      /* Der Schlüssel war einmal die gerundete Mitte — 'b412_337'. Solange es
         hundert Blöcke gab, ging das gut; bei zweihundertfünfzig fallen zwei
         Blöcke auf dieselbe gerundete Mitte, und dann gehört ein Haus plötzlich
         zum falschen Block. Eine laufende Nummer kann das nicht passieren. */
      schluessel: 'b' + bloecke.length,
      i: Math.round(m[0]), j: Math.round(m[1]),
      ecken: f, mitte: m, breit, flaeche: fl,
      viertel: v, vorstadt: drausen, sonder: ''
    });
  }

  /* --- Wo ein Viertel grün ist, wird es grün ---
     `gruen` stand bis hierher als totes Datenfeld in der Tabelle: notiert,
     nie gelesen. Ein lockeres Viertel sah dadurch nicht nach Gärten aus,
     sondern nach unbedrucktem Papier. */
  for (const b of bloecke) {
    if (b.sonder) continue;
    const va = planViertelart(b.viertel.art);
    /* Nur draußen darf es üppig sein. Hinter der Mauer war jeder Fußbreit
       teuer — ein Drittel Gärten sah aus wie eine Gartenstadt, nicht wie eine
       ummauerte Stadt. */
    const anteil = va.gruen * (b.vorstadt ? 1 : 0.5);
    if (planZufall(saat, 'gv' + b.schluessel) < anteil) b.sonder = 'garten';
  }

  /* --- Besondere Blöcke --- */
  const drinnen = bloecke.filter((b) => !b.vorstadt && b.flaeche > 900);
  const setze = (k, was) => { const b = drinnen[planHash(saat, k) % drinnen.length]; if (b && !b.sonder) b.sonder = was; };
  if (drinnen.length) {
    setze('kirche', 'kirche');
    if (drinnen.length > 5) setze('friedhof', 'friedhof');
    if (drinnen.length > 7) setze('garten', 'garten');
    if (drinnen.length > 11) setze('garten2', 'garten');
  }

  /* --- Die Häuser stellen sich an die Straßen --- */
  const haeuser = [];
  for (const b of bloecke) {
    if (b.sonder === 'garten' || b.sonder === 'friedhof') continue;
    const va = planViertelart(b.viertel.art);
    planBlockBebauen(b.ecken, saat, b.schluessel, va, plan.stadt.dichte, wasser, haeuser);
    if (b.sonder === 'kirche' && haeuser.length) {
      /* Die Kirche steht als eigener Bau in der Mitte des Blocks. */
      const m = b.mitte;
      const gr = Math.min(38, Math.sqrt(b.flaeche) * 0.3);
      haeuser.push({
        ecken: [[m[0] - gr, m[1] - gr * 0.5], [m[0] + gr, m[1] - gr * 0.5], [m[0] + gr, m[1] + gr * 0.5], [m[0] - gr, m[1] + gr * 0.5]],
        umriss: null, ton: 0, gross: true, viertel: b.viertel.art, sonder: 'kirche', n: haeuser.length
      });
    }
  }

  /* --- Die Straßen ---
     Die gewachsenen Züge sind benannt und beschriftet; alles, was beim
     Verdichten dazukam, wird als schlichte Gasse mitgezeichnet — sonst
     stünden Häuser an Straßen, die es gar nicht gibt. */
  const gezeichnet = new Set();
  for (const w of gewachsen.wege) {
    for (let i = 1; i < w.punkte.length; i++) {
      const a = w.punkte[i - 1], b = w.punkte[i];
      gezeichnet.add(Math.round(a[0]) + ',' + Math.round(a[1]) + '|' + Math.round(b[0]) + ',' + Math.round(b[1]));
      gezeichnet.add(Math.round(b[0]) + ',' + Math.round(b[1]) + '|' + Math.round(a[0]) + ',' + Math.round(a[1]));
    }
  }
  const strassen = gewachsen.wege.slice();
  gewachsen.netz.kanten.forEach((k, i) => {
    const a = gewachsen.netz.knoten[k.a], b = gewachsen.netz.knoten[k.b];
    const marke = Math.round(a.x) + ',' + Math.round(a.y) + '|' + Math.round(b.x) + ',' + Math.round(b.y);
    if (gezeichnet.has(marke)) return;
    strassen.push({ art: k.art === 'platz' ? 'ring' : k.art, richtung: 'quer', i: 7000 + i, punkte: [[a.x, a.y], [b.x, b.y]], name: '' });
  });

  /* --- Wenn sich kein Block geschlossen hat ---
     Dann ist es kein Blockgefüge, sondern ein Straßendorf. Ohne diesen
     Zweig blieb bei einem Weiler mit breitem Fluss ein LEERES Blatt übrig:
     dreizehn Wege, null Blöcke, null Häuser. */
  if (haeuser.length < 6) {
    planStrassendorf(strassen, saat, planViertelart('handwerk'), plan.stadt.dichte, wasser, haeuser, [mx, my], Rmax);
  }

  /* --- Der Marktplatz --- */
  const markt = gewachsen.marktEcken;

  /* --- Die Mauer: der äußerste Ring --- */
  let mauer = null;
  if (plan.stadt.mauer) {
    /* Die gewachsene und die strahlende Anlage legen ihren äußersten Ring
       selbst als 'mauerweg' an. Das Schachbrett hat gar keine Ringe — und
       bekam deshalb überhaupt keine Mauer, obwohl der Haken gesetzt war.
       Dann wird sie aus der Stadt selbst genommen: in jedem Winkelsektor der
       äußerste Punkt des Netzes, und das ergibt einen Kranz, der wirklich um
       das herumläuft, was gebaut wurde. */
    let ring = gewachsen.wege.find((w) => w.art === 'mauerweg');
    if (!ring) {
      const sektoren = 40;
      const weiteste = new Array(sektoren).fill(null);
      for (const kn of gewachsen.netz.knoten) {
        const d = strecke([kn.x, kn.y], [mx, my]);
        if (d < Rmax * 0.3 || wasser.drin(kn.x, kn.y)) continue;
        let w = Math.atan2(kn.y - my, kn.x - mx);
        if (w < 0) w += Math.PI * 2;
        const s2 = Math.floor((w / (Math.PI * 2)) * sektoren) % sektoren;
        if (!weiteste[s2] || d > weiteste[s2].d) weiteste[s2] = { p: [kn.x, kn.y], d };
      }
      const punkte = [];
      for (let i = 0; i < sektoren; i++) {
        const t = weiteste[i];
        if (!t) continue;
        /* Ein Stück weiter hinaus als das letzte Haus — die Mauer schneidet
           nicht durch die Vorstadt. */
        const w = Math.atan2(t.p[1] - my, t.p[0] - mx);
        const r = t.d + 16;
        punkte.push([mx + Math.cos(w) * r, my + Math.sin(w) * r]);
      }
      if (punkte.length > 6) {
        punkte.push(punkte[0]);
        ring = { art: 'mauerweg', richtung: 'ring', j: 99, punkte, name: '' };
        strassen.push(ring);
      }
    }
    if (ring && ring.punkte.length > 3) {
      /* Der Kranz wird geglättet, bevor er zur Mauer wird.
         Gemessen hatte er bei der gewachsenen Anlage Knicke von über
         hundert Grad und einen Radius, der zwischen 167 und 311 sprang —
         sechsundachtzig Prozent Schwankung. Unten stand dann eine Spitze
         im Blatt. Eine Stadtmauer folgt aber dem Gelände, nicht den
         Zufälligkeiten eines Ringwegs.

         Erst nach dem Winkel ordnen (das behebt zugleich Schleifen, in
         denen der Ring sich selbst kreuzt), dann den Abstand zur Mitte
         zweimal über die Nachbarn mitteln. Die Ecken bleiben, die Spitzen
         gehen. */
      const kern = [];
      for (const b of bloecke) {
        if (b.vorstadt) continue;
        for (const e of b.ecken) kern.push(e);
      }
      ring = { ...ring, punkte: planKranzGlaetten(ring.punkte, [mx, my], 3, kern, wasser) };

      const tuerme = [], tore = [];
      /* Wie nah muss eine Hauptstraße sein, damit dort ein Tor steht?
         Vierunddreißig Einheiten waren für eine Metropole richtig und für
         einen Weiler viel zu viel: dort lag fast jeder Ringpunkt neben
         einer Ausfallstraße, und das Dorf bekam elf Tore. */
      const torNah = Math.max(16, Math.min(34, Rmax * 0.11));
      ring.punkte.slice(0, -1).forEach((p, i) => {
        if (wasser.drin(p[0], p[1])) return;
        const ausfall = gewachsen.adern.some((a) => a.haupt && a.knoten.some((q) => strecke(q, p) < torNah));
        /* Zwei Tore nebeneinander in derselben Mauer gibt es nicht. */
        if (ausfall && !tore.some((t) => strecke(t.punkt, p) < Rmax * 0.34)) {
          tore.push({ punkt: p, i, name: planTorname(saat, i) });
        } else tuerme.push({ punkt: p, i });
      });
      if (!tore.length && ring.punkte.length > 2) tore.push({ punkt: ring.punkte[0], i: 0, name: planTorname(saat, 0) });
      mauer = { punkte: ring.punkte, tuerme, tore, ring: 1 };
    }
  }

  /* --- Die Burg --- */
  let burg = null;
  if (plan.stadt.burg) {
    const kandidaten = bloecke.filter((b) => !b.vorstadt && strecke(b.mitte, [mx, my]) > Rmax * 0.34);
    const b = kandidaten.length ? kandidaten[planHash(saat, 'burg') % kandidaten.length] : null;
    if (b) burg = { mitte: b.mitte, winkel: Math.atan2(b.mitte[1] - my, b.mitte[0] - mx) * 180 / Math.PI, groesse: Math.min(46, Math.sqrt(b.flaeche) * 0.42) };
  }

  /* --- Die Brücken: sie entstehen beim Wachsen, wo eine Straße das Wasser
     quert. Nachträglich gesucht würde man sie nie finden. --- */
  const bruecken = gewachsen.bruecken || [];

  return {
    mitte: [mx, my], speichen, ringe: ringeZahl, Rmax, hoch: 1,
    netz: gewachsen.netz, bloecke, haeuser, strassen, markt, mauer, mauerRing: 1,
    burg, bruecken, viertel, besonders: new Map()
  };
}

/* ===================== DAS UMLAND =====================
   Der erste Versuch legte die Äcker als vollständigen Kranz um die Stadt —
   und das war wieder ein Spinnennetz, nur aus Feldern. So sieht Land nicht
   aus: es liegt in FLUREN. Eine Flur ist eine Handvoll paralleler Streifen
   in einer Richtung; die nächste Flur daneben hat eine andere Richtung, weil
   dort das Gelände anders fällt. Dazwischen bleibt Platz.

   Genauso Wälder: keine Kreissegmente, sondern unregelmäßige Flächen. */
function planUmland(plan, stadt, wasser) {
  if (!plan.stadt.umland) return { felder: [], waelder: [], hoefe: [] };
  const saat = plan.saat;
  const G = PLAN_GROESSE;
  const [mx, my] = stadt.mitte;
  const R = stadt.Rmax;
  const felder = [], waelder = [], hoefe = [];

  const passt = (p) => p[0] > 42 && p[0] < G - 42 && p[1] > 42 && p[1] < G - 42 && !wasser.drin(p[0], p[1]);
  const frei = (p, weit) => {
    if (strecke(p, [mx, my]) < R * 1.1 + 34) return false;
    return !felder.concat(waelder).some((f) => strecke(f.mitte, p) < weit);
  };

  /* --- Die Wälder ---
     Sie kommen ZUERST. Ein Wald stand schon da, bevor jemand pflügte; und
     technisch gesehen würde er sonst keinen Platz mehr finden, weil die
     Äcker das ganze Blatt belegen. */
  const waldZahl = 9 + (planHash(saat, 'wz') % 5);
  for (let i = 0; i < waldZahl; i++) {
    const w = planZufall(saat, 'ww' + i) * Math.PI * 2;
    const r = Math.max(R * 1.24, 190) + planZufall(saat, 'wr' + i) * 320;
    const mitte = [mx + Math.cos(w) * r, my + Math.sin(w) * r * 0.94];
    if (!passt(mitte) || !frei(mitte, 116)) continue;
    const gross = 62 + planZufall(saat, 'wg' + i) * 82;
    const seiten = 7 + (planHash(saat, 'ws' + i) % 4);
    /* Passt der Wald nicht, wird er nicht verworfen, sondern kleiner
       versucht. Vorher genügte ein einziger Eckpunkt im Fluss, um den ganzen
       Wald zu streichen — und übrig blieb ein baumloses Land. */
    for (const massstab of [1, 0.72, 0.5, 0.34]) {
      const ecken = [];
      let gut = true;
      for (let k = 0; k < seiten; k++) {
        const a2 = (k / seiten) * Math.PI * 2;
        const rr = gross * massstab * (0.62 + planZufall(saat, 'wp' + i + '_' + k) * 0.6);
        const p = [mitte[0] + Math.cos(a2) * rr, mitte[1] + Math.sin(a2) * rr * 0.8];
        if (!passt(p) || strecke(p, [mx, my]) < R * 1.04 + 16) { gut = false; break; }
        ecken.push(p);
      }
      if (gut && ecken.length > 4) {
        waelder.push({ ecken, mitte, n: waelder.length, gross: massstab > 0.6 });
        break;
      }
    }
  }

  /* --- Die Fluren ---
     Die Plätze werden nicht auf einem Kranz um die Stadt gesucht, sondern
     auf dem ganzen Blatt: ein grobes Raster mit Versatz, damit nichts in
     Reih und Glied steht. Sonst hängt die Menge des Umlands an der Größe der
     Stadt — und bei einer großen Stadt landete jeder Kranzpunkt außerhalb
     des Papiers, weshalb überhaupt kein Feld übrig blieb. */
  const plaetze = [];
  const raster = 9;
  for (let gy = 0; gy < raster; gy++) {
    for (let gx = 0; gx < raster; gx++) {
      const jx = planStreu(saat, 'pj' + gx + '_' + gy) * 0.42;
      const jy = planStreu(saat, 'pk' + gx + '_' + gy) * 0.42;
      plaetze.push([((gx + 0.5 + jx) / raster) * G, ((gy + 0.5 + jy) / raster) * G]);
    }
  }
  plaetze.sort((a2, b2) => planZufall(saat, 'po' + a2[0].toFixed(1)) - planZufall(saat, 'po' + b2[0].toFixed(1)));

  for (let i = 0; i < plaetze.length; i++) {
    const mitte = plaetze[i];
    /* Ein fester Mindestabstand, nicht an der Stadtgröße gemessen: sonst
       wirft eine große Stadt fast alle Plätze weg und das Land bleibt kahl. */
    const rand = 104;
    if (!passt(mitte) || !frei(mitte, rand)) continue;

    /* Die Richtung der Flur — nicht die Richtung zur Stadt. */
    const richtung = planZufall(saat, 'fd' + i) * Math.PI;
    const dx = Math.cos(richtung), dy = Math.sin(richtung);
    const nx = -dy, ny = dx;
    const streifen = 3 + (planHash(saat, 'fs' + i) % 5);
    /* Ein Acker ist ein Acker — seine Größe hängt nicht daran, wie groß die
       Stadt daneben ist. Darum feste Maße mit etwas Spiel. */
    const breite = 16 + planZufall(saat, 'fb' + i) * 13;
    const laenge = 74 + planZufall(saat, 'fl' + i) * 96;
    /* Eine Flur ist Acker oder Wiese — niemals Wald: Wald wächst nicht in
       parallelen Streifen. Die Wälder entstehen weiter unten als eigene,
       unregelmäßige Flächen. */
    const wiese = planZufall(saat, 'fk' + i) > 0.7;

    for (let s2 = 0; s2 < streifen; s2++) {
      const versatz = (s2 - (streifen - 1) / 2) * breite * 1.14;
      const l = laenge * (0.72 + planZufall(saat, 'fx' + i + '_' + s2) * 0.5);
      const mitteS = [mitte[0] + nx * versatz, mitte[1] + ny * versatz];
      const ecken = [
        [mitteS[0] - dx * l / 2 - nx * breite / 2, mitteS[1] - dy * l / 2 - ny * breite / 2],
        [mitteS[0] + dx * l / 2 - nx * breite / 2, mitteS[1] + dy * l / 2 - ny * breite / 2],
        [mitteS[0] + dx * l / 2 + nx * breite / 2, mitteS[1] + dy * l / 2 + ny * breite / 2],
        [mitteS[0] - dx * l / 2 + nx * breite / 2, mitteS[1] - dy * l / 2 + ny * breite / 2]
      ];
      if (!ecken.every(passt)) continue;
      if (ecken.some((p) => strecke(p, [mx, my]) < R * 1.04 + 20)) continue;
      felder.push({
        ecken, mitte: mitteS, n: felder.length,
        gepfluegt: !wiese && planZufall(saat, 'fg' + i + s2) > 0.34
      });
    }

    /* Zu jeder dritten Flur ein Hof am Rand. */
    if (planZufall(saat, 'fh' + i) > 0.6) {
      const hp = [mitte[0] + nx * breite * streifen * 0.7, mitte[1] + ny * breite * streifen * 0.7];
      if (passt(hp) && strecke(hp, [mx, my]) > R * 1.06 + 20) hoefe.push({ punkt: hp, n: hoefe.length });
    }
  }

  return { felder, waelder, hoefe };
}

/* ===================== ALLES ZUSAMMEN =====================
   Ein Aufruf, ein fertiger Plan. Teuer genug, dass er nicht bei jedem
   Hinsehen wiederholt werden darf — deshalb merkt sich die Karte das
   Ergebnis an seiner Signatur. */
function planBauen(plan) {
  const wasser = planWasser(plan);
  const stadt = planStadt(plan, wasser);
  const umland = planUmland(plan, stadt, wasser);
  const hafen = planHafen(plan, stadt, wasser);
  const muehle = planMuehle(plan, stadt, wasser);
  const inseln = planInseln(plan, wasser);
  const gebaut = { plan, wasser, stadt, umland, hafen, muehle, inseln, marktplatz: planMarktplatz(plan, stadt) };
  /* Die Landstraßen laufen vom Blatt — und an ihren Enden stehen die
     Wegweiser. Erst dadurch bekommt die Stadt ein Dahinter. */
  if (plan.stadt.umland) {
    const land = planLandstrassen(stadt, wasser, plan);
    for (const l of land) stadt.strassen.push(l);
  }
  gebaut.nachbarn = planNachbarorte(plan, stadt, wasser);
  /* Das Wappen darf wissen, was in der Stadt steht — eine Hafenstadt
     führt einen Anker, eine Mühlenstadt ein Rad. Darum zuletzt. */
  gebaut.wappen = planWappen(plan, gebaut);
  gebaut.legende = planLegende(plan, gebaut);
  return gebaut;
}
/* Woran man erkennt, ob neu gerechnet werden muss. */
/* Einen geschlossenen Kranz um einen Mittelpunkt glätten: nach dem Winkel
   ordnen, dann den Abstand zur Mitte über die Nachbarn mitteln. Rein — und
   damit prüfbar. */
function planKranzGlaetten(punkte, mitte, runden, einschliessen, wasser) {
  const roh = punkte.slice();
  /* Ein geschlossener Zug wiederholt den ersten Punkt am Ende. */
  if (roh.length > 1 && strecke(roh[0], roh[roh.length - 1]) < 0.5) roh.pop();
  if (roh.length < 3) return punkte;

  const [mx, my] = mitte;
  const ZWEIPI = Math.PI * 2;
  const SEKTOREN = 44;

  /* Der Kranz wird auf feste Sektoren abgetastet.
     Die erste Fassung hatte für jeden Sonderfall einen eigenen Zweig — und
     stieg bei wenigen Punkten vorzeitig aus, und zwar genau VOR dem
     Einschließen. Bei der strahlenden Anlage lagen deshalb im Dorf zweiund-
     achtzig Prozent der Häuser außerhalb der Mauer. Ein festes Raster
     kennt diese Sonderfälle nicht. */
  const polar = roh.map((p) => {
    let w = Math.atan2(p[1] - my, p[0] - mx);
    if (w < 0) w += ZWEIPI;
    return { w, r: strecke(p, mitte) };
  }).sort((a2, b2) => a2.w - b2.w);

  /* Für einen Winkel den Abstand aus den beiden Nachbarn überblenden.
     In einer großen Lücke — am Wasser hört der Ringweg auf — wölbt sich
     der Kranz nach außen, statt eine Sehne quer durch die Stadt zu ziehen. */
  const abstandBei = (w) => {
    let vor = polar[polar.length - 1], nach = polar[0];
    for (let i = 0; i < polar.length; i++) {
      if (polar[i].w <= w) vor = polar[i];
      if (polar[i].w > w) { nach = polar[i]; break; }
    }
    let spanne = nach.w - vor.w;
    if (spanne <= 0) spanne += ZWEIPI;
    let hier = w - vor.w;
    if (hier < 0) hier += ZWEIPI;
    const t = spanne < 1e-6 ? 0 : Math.max(0, Math.min(1, hier / spanne));
    const bauch = 1 + Math.sin(t * Math.PI) * Math.min(0.12, spanne * 0.08);
    return (vor.r * (1 - t) + nach.r * t) * bauch;
  };

  const winkel = [], radien = [];
  for (let i = 0; i < SEKTOREN; i++) {
    const w = (i / SEKTOREN) * ZWEIPI;
    winkel.push(w);
    radien.push(abstandBei(w));
  }

  /* Die Mauer muss den Kern der Stadt einschließen — eine Mauer, die
     mitten hindurchläuft, ist keine. */
  if (einschliessen && einschliessen.length) {
    for (const p of einschliessen) {
      let w = Math.atan2(p[1] - my, p[0] - mx);
      if (w < 0) w += ZWEIPI;
      const i = Math.floor((w / ZWEIPI) * SEKTOREN) % SEKTOREN;
      const r = strecke(p, mitte) + 9;
      if (r > radien[i]) radien[i] = r;
    }
  }

  const mitteln = (liste, wie) => {
    let a2 = liste.slice();
    for (let d = 0; d < wie; d++) {
      const neu2 = a2.slice();
      for (let i = 0; i < SEKTOREN; i++) {
        neu2[i] = a2[(i - 1 + SEKTOREN) % SEKTOREN] * 0.27 + a2[i] * 0.46 + a2[(i + 1) % SEKTOREN] * 0.27;
      }
      a2 = neu2;
    }
    return a2;
  };

  let fertig = mitteln(radien, runden || 3);
  /* Die Schranke misst sich am eigenen VERLAUF, nicht am Mittelwert des
     ganzen Kranzes: gegen den Median gezwungen wurde jede Stadt rund, auch
     die, die von Natur aus länglich am Fluss liegt. */
  const verlauf = mitteln(fertig, 8);
  fertig = fertig.map((r, i) => Math.max(verlauf[i] * 0.82, Math.min(verlauf[i] * 1.2, r)));
  /* Geglättet werden darf die Mauer — aber nicht in die Stadt hinein.
     Die Untergrenze wird dabei selbst geglättet: eine Mauer BAUSCHT sich um
     ein einzelnes Haus herum, sie macht keine Zacke. Ohne das standen bei
     kleinen Orten Knicke von hundertdreißig Grad im Kranz — je Sektor eine
     Spitze bis zum entferntesten Blockeck. */
  const untergrenze = mitteln(radien, 2);
  fertig = fertig.map((r, i) => Math.max(r, untergrenze[i]));

  /* Und zuletzt: KEIN Stück der Mauer liegt im Wasser.
     Das Einschließen allein trieb den Kranz weit hinaus, um das
     Hafenviertel mitzunehmen — und danach lief die Mauer in großem Bogen
     durchs offene Meer. Eine Stadtmauer endet am Ufer. Also wird jeder
     Sektor so weit hereingeholt, bis er trocken steht. */
  if (wasser && typeof wasser.drin === 'function' && wasser.art !== 'keins') {
    const trockenlegen = () => {
      for (let i = 0; i < SEKTOREN; i++) {
        const w = winkel[i];
        let r = fertig[i];
        let versuche = 0;
        while (r > 20 && versuche++ < 80 && wasser.drin(mx + Math.cos(w) * r, my + Math.sin(w) * r)) {
          r -= Math.max(2.5, fertig[i] * 0.025);
        }
        fertig[i] = Math.max(20, r);
      }
    };
    trockenlegen();
    /* Einmal glätten, damit aus dem Hereinholen keine Treppe wird — und
       DANACH noch einmal trockenlegen. Beim ersten Versuch stand das
       Glätten am Ende, und es schob die Mauer prompt wieder ins Wasser:
       auf jedem Blatt lagen wieder drei bis dreizehn Punkte nass. */
    fertig = mitteln(fertig, 1);
    trockenlegen();
  }

  const raus = winkel.map((w, i) => [mx + Math.cos(w) * fertig[i], my + Math.sin(w) * fertig[i]]);
  raus.push(raus[0]);
  return raus;
}

function planSignatur(plan) {
  const s = plan.stadt;
  /* Alles, was die Karte verändert, gehört hier hinein — sonst zeichnet
     sie sich nicht neu, wenn man es umstellt. */
  return [plan.saat, s.groesse, s.alter, s.anlage, s.wasser, s.mauer, s.burg, s.umland,
    s.hafen, s.muehle, s.inseln, s.dichte,
    plan.wappen ? JSON.stringify(plan.wappen) : ''].join('|');
}

/* ===================== KLEINE RECHNUNGEN ===================== */
function strecke(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1]; return Math.sqrt(dx * dx + dy * dy); }
function bilinear(q, u, v) {
  const ox = q[0][0] + (q[1][0] - q[0][0]) * u, oy = q[0][1] + (q[1][1] - q[0][1]) * u;
  const ux = q[3][0] + (q[2][0] - q[3][0]) * u, uy = q[3][1] + (q[2][1] - q[3][1]) * u;
  return [ox + (ux - ox) * v, oy + (uy - oy) * v];
}
function vierecksFlaeche(q) {
  let f = 0;
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    f += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(f / 2);
}

/* ===================== NAMEN =====================
   Deutsche Gassennamen bestehen fast immer aus zwei Teilen: woher oder
   wonach, und was es ist. Genau so werden sie hier gebaut. */
const PLAN_GASSE_VORN = [
  'Ober', 'Unter', 'Hinter', 'Vorder', 'Alt', 'Neu', 'Klein', 'Groß', 'Krumm', 'Eng', 'Lang', 'Breit',
  'Salz', 'Korn', 'Fisch', 'Leder', 'Kupfer', 'Eisen', 'Woll', 'Tuch', 'Garn', 'Öl', 'Wein', 'Brot',
  'Brunnen', 'Kirch', 'Kloster', 'Mühlen', 'Schmiede', 'Färber', 'Gerber', 'Seiler', 'Töpfer', 'Küfer',
  'Raben', 'Reiher', 'Hirsch', 'Bären', 'Schwanen', 'Falken', 'Katzen', 'Eulen', 'Ziegen', 'Storchen',
  'Linden', 'Eichen', 'Weiden', 'Erlen', 'Rosen', 'Dorn', 'Nessel', 'Holunder',
  'Nebel', 'Regen', 'Winter', 'Sommer', 'Abend', 'Morgen', 'Sonnen', 'Mond'
];
const PLAN_GASSE_HAUPT = ['straße', 'weg', 'zeile', 'allee', 'damm'];
const PLAN_GASSE_KLEIN = ['gasse', 'gässchen', 'steig', 'winkel', 'stieg', 'twiete', 'pfad', 'gang'];
const PLAN_GASSE_RING = ['ring', 'wall', 'graben', 'gürtel', 'bogen', 'runde'];
function planGassenname(saat, kennung, art) {
  const vorn = PLAN_GASSE_VORN[planHash(saat, 'gv' + kennung) % PLAN_GASSE_VORN.length];
  const topf = art === 'haupt' ? PLAN_GASSE_HAUPT : art === 'ring' ? PLAN_GASSE_RING : PLAN_GASSE_KLEIN;
  const hinten = topf[planHash(saat, 'gh' + kennung) % topf.length];
  return vorn + hinten;
}
const PLAN_VIERTEL_VORN = [
  'Ober', 'Unter', 'Alt', 'Neu', 'Hinter', 'Sankt', 'Rauch', 'Nebel', 'Krähen', 'Weber', 'Gerber',
  'Fischer', 'Anger', 'Kessel', 'Sand', 'Lehm', 'Stein', 'Espen', 'Winkel', 'Schatten'
];
const PLAN_VIERTEL_HINTEN = ['viertel', 'grund', 'berg', 'feld', 'au', 'winkel', 'gasse', 'hof', 'anger', 'kamp'];
function planViertelname(saat, nr, art) {
  if (art === 'hafen') return 'Am Hafen';
  const vorn = PLAN_VIERTEL_VORN[planHash(saat, 'vv' + nr) % PLAN_VIERTEL_VORN.length];
  const hinten = PLAN_VIERTEL_HINTEN[planHash(saat, 'vh' + nr) % PLAN_VIERTEL_HINTEN.length];
  return 'Das ' + vorn + hinten;
}
const PLAN_TOR_VORN = ['Nord', 'Süd', 'Ost', 'West', 'Ober', 'Unter', 'Mühlen', 'Fischer', 'Sand', 'Stein', 'Kloster', 'Raben', 'Hirsch', 'Salz', 'Holz'];
function planTorname(saat, i) {
  return PLAN_TOR_VORN[planHash(saat, 'tn' + i) % PLAN_TOR_VORN.length] + 'tor';
}
/* Namen für ganze Städte — für den Fall, dass einem keiner einfällt. */
const PLAN_STADT_VORN = [
  'Deich', 'Salz', 'Nebel', 'Raben', 'Erlen', 'Hoch', 'Alt', 'Stein', 'Grau', 'Kupfer', 'Wind',
  'Dorn', 'Moor', 'Furt', 'Linden', 'Aschen', 'Winter', 'Ohl', 'Reiher', 'Sand', 'Eisen', 'Kalt'
];
const PLAN_STADT_HINTEN = [
  'hafen', 'furt', 'burg', 'brück', 'stedt', 'heim', 'rode', 'walde', 'au', 'bach', 'feld',
  'moor', 'stein', 'thal', 'münde', 'werth', 'horst', 'brunn'
];
function planStadtname(saat) {
  return PLAN_STADT_VORN[planHash(saat, 'nv') % PLAN_STADT_VORN.length] +
    PLAN_STADT_HINTEN[planHash(saat, 'nh') % PLAN_STADT_HINTEN.length];
}
/* Eine frische Saat, die sich lesen lässt. */
function planNeueSaat() {
  return Date.now().toString(36) + '-' + Math.floor(Math.random() * 46656).toString(36);
}

/* ===================== ZAHLEN UND SUCHE ===================== */
function planZahlen(plan, gebaut) {
  const g = gebaut || planBauen(plan);
  return {
    haeuser: g.stadt.haeuser.length,
    gassen: g.stadt.strassen.length,
    bloecke: g.stadt.bloecke.length,
    viertel: g.stadt.viertel.length,
    marken: plan.marken.length,
    benannt: plan.marken.filter((m) => m.name).length,
    tore: g.stadt.mauer ? g.stadt.mauer.tore.length : 0,
    bruecken: g.stadt.bruecken.length
  };
}
function planSuche(plan, frage, gebaut) {
  const q = String(frage || '').trim().toLowerCase();
  if (!q) return [];
  const raus = [];
  for (const m of plan.marken) {
    const treffer = (m.name || '').toLowerCase().includes(q) || (m.notiz || '').toLowerCase().includes(q) ||
      planMarke(m.art).name.toLowerCase().includes(q);
    if (treffer) raus.push({ art: 'marke', marke: m, name: m.name || planMarke(m.art).name, x: m.x, y: m.y });
  }
  const g = gebaut || planBauen(plan);
  for (const s of g.stadt.strassen) {
    const name = planStrassenname(plan, s);
    if (name.toLowerCase().includes(q)) {
      const p = s.punkte[Math.floor(s.punkte.length / 2)];
      raus.push({ art: 'gasse', name, x: p[0], y: p[1] });
    }
  }
  for (const v of g.stadt.viertel) {
    const name = planViertelnameVon(plan, v);
    if (name.toLowerCase().includes(q)) raus.push({ art: 'viertel', name, x: g.stadt.mitte[0], y: g.stadt.mitte[1] });
  }
  return raus.slice(0, 40);
}
/* Eigene Namen schlagen die gerechneten. */
/* Die Fundstelle einer Straße oder Marke — „C4“ oder „C4–D5“. */
function planFundstelle(punkte) {
  if (!punkte || !punkte.length) return '';
  return planFelderText(planFelderVon(punkte));
}

function planStrassenname(plan, s) {
  const k = 'gasse:' + s.richtung + ':' + (s.richtung === 'speiche' ? s.i : s.j);
  return plan.namen[k] || s.name;
}
function planViertelnameVon(plan, v) {
  return plan.namen['viertel:' + v.nr] || v.name;
}
function planTornameVon(plan, t) {
  return plan.namen['tor:' + t.i] || t.name;
}

/* ===================== WEGZEIT =====================
   Für Schreibende die nützlichste Zahl auf der ganzen Karte: Wie lange
   braucht jemand von hier nach dort? Gerechnet über die Luftlinie mal
   einem Umwegfaktor — durch Gassen läuft niemand geradeaus. */
const PLAN_SCHRITT_PRO_EINHEIT = 1.35;   /* Meter je Karteneinheit */
function planWegzeit(a, b, art) {
  const luft = strecke([a.x, a.y], [b.x, b.y]) * PLAN_SCHRITT_PRO_EINHEIT;
  const umweg = 1.28;
  const meter = luft * umweg;
  const tempo = art === 'pferd' ? 210 : art === 'eilig' ? 105 : 78;   /* Meter je Minute */
  const minuten = meter / tempo;
  return { meter: Math.round(meter), minuten, text: planZeitText(minuten) };
}
function planZeitText(minuten) {
  if (minuten < 1) return 'keine Minute';
  if (minuten < 2) return 'eine Minute';
  if (minuten < 60) return Math.round(minuten) + ' Minuten';
  const st = Math.floor(minuten / 60), rest = Math.round(minuten % 60);
  const stText = st === 1 ? 'eine Stunde' : st + ' Stunden';
  return rest >= 5 ? stText + ' und ' + rest + ' Minuten' : stText;
}

/* Was liegt in der Nähe? Für die Karte zu einer Marke. */
function planMarkenNah(plan, marke, wieviele) {
  return plan.marken
    .filter((m) => m.id !== marke.id)
    .map((m) => ({ marke: m, weit: strecke([marke.x, marke.y], [m.x, m.y]) }))
    .sort((a, b) => a.weit - b.weit)
    .slice(0, wieviele == null ? 5 : wieviele);
}

/* In welchem Viertel liegt ein Punkt? */
function planViertelAn(gebaut, x, y) {
  let best = null, weit = 1e9;
  for (const b of gebaut.stadt.bloecke) {
    const d = strecke(b.mitte, [x, y]);
    if (d < weit) { weit = d; best = b; }
  }
  if (!best || weit > 150) return null;
  return best.viertel;
}

/* ===================== WAS AUFFÄLLT =====================
   Nicht meckern, sondern zeigen: eine Marke im Wasser, zwei mit demselben
   Namen, eine Stadt ohne einen einzigen Namen. */
function planAuffaelligkeiten(plan, gebaut) {
  const g = gebaut || planBauen(plan);
  const raus = [];
  const imWasser = plan.marken.filter((m) => g.wasser.drin(m.x, m.y) && !['bruecke', 'hafen', 'muehle'].includes(m.art));
  for (const m of imWasser.slice(0, 6)) {
    raus.push({ art: 'wasser', text: (m.name || planMarke(m.art).name) + ' steht im Wasser.', marke: m });
  }
  const namen = new Map();
  for (const m of plan.marken) {
    const n = (m.name || '').trim().toLowerCase();
    if (!n) continue;
    if (!namen.has(n)) namen.set(n, []);
    namen.get(n).push(m);
  }
  for (const [, liste] of namen) {
    if (liste.length > 1) raus.push({ art: 'doppelt', text: '„' + liste[0].name + '" gibt es ' + liste.length + '-mal.', marke: liste[0] });
  }
  const ohne = plan.marken.filter((m) => !m.name).length;
  if (ohne > 3) raus.push({ art: 'namenlos', text: ohne + ' Marken haben noch keinen Namen.' });
  return raus.slice(0, 12);
}
