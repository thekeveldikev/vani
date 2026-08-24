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

const PLAN_GROESSEN = [
  ['weiler', 'Ein Weiler', 5, 3],
  ['dorf', 'Ein Dorf', 7, 3],
  ['flecken', 'Ein Marktflecken', 9, 4],
  ['stadt', 'Eine Stadt', 11, 5],
  ['grossstadt', 'Eine große Stadt', 14, 6],
  ['metropole', 'Eine Metropole', 17, 7]
];
function planGroesse(id) { return PLAN_GROESSEN.find((g) => g[0] === id) || PLAN_GROESSEN[3]; }

/* ----- Die Viertel -----
   Ein Viertel ist kein Gebiet auf einer Verwaltungskarte, sondern ein
   Charakter: wie eng steht es, wie groß sind die Häuser, was riecht man. */
const PLAN_VIERTELARTEN = [
  { id: 'altstadt', name: 'Altstadt', dichte: 1.0, haus: 0.8, gruen: 0.02, hoefe: 0.15 },
  { id: 'handwerk', name: 'Handwerk', dichte: 0.92, haus: 0.9, gruen: 0.05, hoefe: 0.3 },
  { id: 'reich', name: 'Wohlhabend', dichte: 0.5, haus: 1.7, gruen: 0.3, hoefe: 0.6 },
  { id: 'arm', name: 'Arm', dichte: 1.0, haus: 0.6, gruen: 0.02, hoefe: 0.1 },
  { id: 'geistlich', name: 'Geistlich', dichte: 0.42, haus: 1.5, gruen: 0.35, hoefe: 0.5 },
  { id: 'hafen', name: 'Hafen', dichte: 0.8, haus: 1.2, gruen: 0.03, hoefe: 0.2 },
  { id: 'markt', name: 'Markt', dichte: 0.78, haus: 1.0, gruen: 0.06, hoefe: 0.25 },
  { id: 'vorstadt', name: 'Vorstadt', dichte: 0.42, haus: 0.9, gruen: 0.4, hoefe: 0.45 },
  { id: 'garten', name: 'Gärten', dichte: 0.18, haus: 0.8, gruen: 0.8, hoefe: 0.7 }
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
      wasser: PLAN_WASSER.some((w) => w[0] === st.wasser) ? st.wasser : 'fluss',
      mauer: st.mauer !== false,
      burg: st.burg !== false,
      umland: st.umland !== false,
      dichte: Math.max(0.5, Math.min(1.6, Number(st.dichte) || 1))
    },
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
  const [, , speichen, ringe] = planGroesse(plan.stadt.groesse);
  const krumm = planAlterWert(plan.stadt.alter);
  const G = PLAN_GROESSE;

  /* Die Mitte liegt selten genau in der Mitte. Bei Wasser rückt sie ans Ufer. */
  let mx = G / 2 + planStreu(saat, 'mx') * G * 0.06;
  let my = G / 2 + planStreu(saat, 'my') * G * 0.05;
  if (wasser.art === 'kueste' || wasser.art === 'see') {
    /* Ein paar Schritte vom Wasser weg, aber in Sichtweite. */
    for (let versuch = 0; versuch < 60 && wasser.drin(mx, my); versuch++) {
      mx += (G / 2 - mx) * 0.12;
      my += (G / 2 - my) * 0.12;
    }
  }
  const Rmax = G * (0.28 + speichen * 0.011);
  const hoch = 0.9 + planZufall(saat, 'hh') * 0.16;   /* leicht oval */

  /* Jede Straße hat einen eigenen Drall und schwingt ein wenig.
     Und — das ist der Unterschied zwischen einer Stadt und einem Spinnennetz —
     nicht jede reicht durch die ganze Stadt: manche fangen erst weiter außen
     an (sie wurden später angelegt), andere hören vor dem Rand auf. Wo eine
     Straße fehlt, wachsen die beiden Blöcke daneben zu EINEM zusammen. Genau
     daraus entstehen die unregelmäßigen Blockgrößen, die eine gewachsene
     Stadt ausmachen. */
  const speicheVon = [], speicheBis = [];
  const drall = [], phase = [], ringPhase = [], ringPhase2 = [];
  for (let i = 0; i < speichen; i++) {
    drall.push(planStreu(saat, 'sd' + i) * 9 * krumm);
    phase.push(planZufall(saat, 'sp' + i) * 6.3);
    /* Jede zweite bleibt durchgehend — sonst zerfiele die Stadt. */
    const wuerfel = planZufall(saat, 'sr' + i);
    const durchgehend = i % 2 === 0 || wuerfel > 0.62 || krumm < 0.2;
    speicheVon.push(durchgehend ? 0 : (wuerfel < 0.3 ? 2 : 1));
    speicheBis.push(durchgehend || wuerfel > 0.5 ? ringe : ringe - 1);
  }
  const speicheDa = (i, j) => {
    const ii = ((i % speichen) + speichen) % speichen;
    return j >= speicheVon[ii] && j <= speicheBis[ii];
  };
  /* Welche Straßen kreuzen Ring j — der Reihe nach? */
  const speichenAmRing = (j) => {
    const raus = [];
    for (let i = 0; i < speichen; i++) if (speicheDa(i, j)) raus.push(i);
    return raus.length >= 3 ? raus : [0, Math.floor(speichen / 3), Math.floor(speichen * 2 / 3)];
  };
  for (let j = 0; j <= ringe; j++) {
    ringPhase.push(planZufall(saat, 'rp' + j) * 6.3);
    ringPhase2.push(planZufall(saat, 'rq' + j) * 6.3);
  }

  const ringR = [];
  for (let j = 0; j <= ringe; j++) ringR.push(Rmax * (0.085 + 0.915 * Math.pow(j / ringe, 1.32)));

  const winkelVon = (i, j) => {
    const basis = (i / speichen) * 360 + drall[i];
    return basis + Math.sin(j * 0.85 + phase[i]) * 8.5 * krumm + planStreu(saat, 'w' + i + '_' + j) * 3.4 * krumm;
  };
  const P = (i, j) => {
    const ii = ((i % speichen) + speichen) % speichen;
    const w = winkelVon(ii, j) * Math.PI / 180;
    /* Drei Wellen ueberlagert: der Ring ist nirgends rund, ohne dass es
       zackig wird. Bei zu wenig Unruhe sah die Stadt aus wie ein Spinnennetz. */
    const wobble = 1 + (Math.sin(w * 2 + ringPhase[j]) * 0.075 + Math.sin(w * 3.7 + ringPhase2[j]) * 0.05
      + Math.sin(w * 6.1 + ringPhase[j] * 2) * 0.025) * krumm
      + planStreu(saat, 'r' + ii + '_' + j) * 0.05 * krumm;
    const r = ringR[j] * wobble;
    return [mx + Math.cos(w) * r, my + Math.sin(w) * r * hoch];
  };

  /* --- Die Viertel: Sektoren mit Charakter --- */
  const viertelZahl = Math.max(3, Math.min(6, Math.round(speichen / 2.6)));
  const artenTopf = ['handwerk', 'reich', 'arm', 'geistlich', 'markt', 'handwerk', 'arm', 'garten'];
  const viertel = [];
  for (let v = 0; v < viertelZahl; v++) {
    const art = wasser.art !== 'keins' && v === 0 ? 'hafen' : artenTopf[planHash(saat, 'va' + v) % artenTopf.length];
    viertel.push({
      nr: v, art,
      vonSpeiche: Math.round((v / viertelZahl) * speichen),
      bisSpeiche: Math.round(((v + 1) / viertelZahl) * speichen),
      name: planViertelname(saat, v, art)
    });
  }
  const viertelBei = (i, j) => {
    if (j <= 1) return { nr: -1, art: 'altstadt', name: 'Die Altstadt' };
    const ii = ((i % speichen) + speichen) % speichen;
    for (const v of viertel) if (ii >= v.vonSpeiche && ii < v.bisSpeiche) return v;
    return viertel[viertel.length - 1];
  };

  /* --- Die Mauer --- */
  const mauerRing = plan.stadt.mauer ? Math.max(1, ringe - (ringe >= 5 ? 2 : 1)) : -1;

  /* --- Die Blöcke --- */
  const bloecke = [];
  for (let j = 0; j < ringe; j++) {
    /* In diesem Band zählen nur die Straßen, die es hier auch gibt. Zwischen
       zweien davon liegt ein Block — manchmal schmal, manchmal doppelt so
       breit wie der Nachbar. */
    const aktiv = speichenAmRing(j).filter((i) => speicheDa(i, j + 1));
    const reihe = aktiv.length >= 3 ? aktiv : speichenAmRing(j);
    for (let k = 0; k < reihe.length; k++) {
      const i = reihe[k];
      const iNaechste = reihe[(k + 1) % reihe.length] + (k === reihe.length - 1 ? speichen : 0);
      const ecken = [P(i, j), P(iNaechste, j), P(iNaechste, j + 1), P(i, j + 1)];
      const mitte = [
        (ecken[0][0] + ecken[1][0] + ecken[2][0] + ecken[3][0]) / 4,
        (ecken[0][1] + ecken[1][1] + ecken[2][1] + ecken[3][1]) / 4
      ];
      if (wasser.drin(mitte[0], mitte[1])) continue;
      const v = viertelBei(i, j);
      const drausen = mauerRing >= 0 && j >= mauerRing;
      const breit = strecke(ecken[0], ecken[1]);
      /* Vor der Mauer wird lueckenhaft gebaut: jeder dritte Block bleibt
         leer, sonst saehe die Vorstadt aus wie die Stadt. */
      if (drausen && planZufall(saat, 'vs' + i + '_' + j) < 0.34) continue;
      bloecke.push({
        i, j, ecken, mitte, breit,
        viertel: drausen ? { nr: -2, art: 'vorstadt', name: 'Die Vorstadt' } : v,
        vorstadt: drausen
      });
    }
  }

  /* --- Besondere Blöcke: Kirche, Friedhof, Garten, Burg --- */
  const besonders = new Map();
  const setze = (schluessel, was) => { if (!besonders.has(schluessel)) besonders.set(schluessel, was); };
  const drinnen = bloecke.filter((b) => !b.vorstadt && b.j >= 1);
  if (drinnen.length) {
    const wahl = (k) => drinnen[planHash(saat, k) % drinnen.length];
    setze(schl(wahl('kirche')), 'kirche');
    if (drinnen.length > 6) setze(schl(wahl('friedhof')), 'friedhof');
    if (drinnen.length > 8) setze(schl(wahl('garten')), 'garten');
    if (drinnen.length > 12) setze(schl(wahl('garten2')), 'garten');
    if (drinnen.length > 10) setze(schl(wahl('speicher')), 'speicher');
  }
  function schl(b) { return b ? b.i + ':' + b.j : ''; }

  /* --- Die Häuser --- */
  const haeuser = [];
  const dichteFaktor = plan.stadt.dichte;
  for (const b of bloecke) {
    const sonder = besonders.get(schl(b));
    b.sonder = sonder || '';
    if (sonder === 'garten' || sonder === 'friedhof') continue;
    const va = planViertelart(b.viertel.art);
    const breiteOben = strecke(b.ecken[0], b.ecken[1]);
    const tiefe = strecke(b.ecken[0], b.ecken[3]);
    /* Schmale Parzellen: ein Haus an einer Gasse ist selten breiter als
       sechs, sieben Schritt. Vorher waren die Parzellen so breit, dass alle
       Haeuser wie gleiche Ziegel aussahen. */
    const plotBreite = 17 / (va.dichte * dichteFaktor) * va.haus;
    const spalten = Math.max(1, Math.min(10, Math.round(breiteOben / plotBreite)));
    const zeilen = tiefe > 54 ? 2 : 1;
    for (let s = 0; s < spalten; s++) {
      for (let z = 0; z < zeilen; z++) {
        /* Ein Hof statt eines Hauses — Luft im Block. */
        if (planZufall(saat, 'hof' + b.i + b.j + s + z) < va.hoefe * 0.34) continue;
        /* Jedes Haus sitzt ein wenig anders in seiner Parzelle. Genau diese
           Ungleichheit macht aus einer Reihe eine Gasse. */
        const k = 'p' + b.i + '_' + b.j + '_' + s + '_' + z;
        const randL = 0.06 + planZufall(saat, 'ra' + k) * 0.17;
        const randR = 0.06 + planZufall(saat, 'rb' + k) * 0.17;
        const tiefVorn = 0.10 + planZufall(saat, 'rv' + k) * 0.1;
        const tiefHinten = 0.10 + planZufall(saat, 'rh' + k) * 0.22;
        const u0 = (s + randL) / spalten, u1 = (s + 1 - randR) / spalten;
        const v0 = (z + (z === 0 ? tiefVorn : 0.05)) / zeilen, v1 = (z + 1 - (z === zeilen - 1 ? tiefHinten : 0.05)) / zeilen;
        const ecken = [
          bilinear(b.ecken, u0, v0), bilinear(b.ecken, u1, v0),
          bilinear(b.ecken, u1, v1), bilinear(b.ecken, u0, v1)
        ];
        const flaeche = vierecksFlaeche(ecken);
        if (flaeche < 26) continue;
        if (wasser.drin(ecken[0][0], ecken[0][1]) || wasser.drin(ecken[2][0], ecken[2][1])) continue;
        haeuser.push({
          ecken,
          /* Der Umriss ist NICHT das Viereck: er ist von Hand nachgezogen,
             mit zitternden Ecken, und manchmal fehlt eine Ecke oder es ist
             ein Winkelbau. Ein Kartenblatt aus lauter exakten Rechtecken
             sieht aus wie ein Diagramm; erst die Ungenauigkeit macht daraus
             eine Zeichnung. */
          umriss: planHausUmriss(ecken, saat, k),
          /* Jedes Dach einen eigenen Ton. Alle gleich rot sah aus wie ein
             Diagramm; fünf Abstufungen machen daraus ein Dachmeer. */
          ton: planHash(saat, 'dt' + k) % 5,
          gross: flaeche > 520,
          viertel: b.viertel.art,
          sonder: sonder === 'kirche' && s === Math.floor(spalten / 2) && z === 0 ? 'kirche' : '',
          n: haeuser.length
        });
      }
    }
  }

  /* --- Die Straßen --- */
  const strassen = [];
  for (let i = 0; i < speichen; i++) {
    const haupt = (i % 2 === 0 || speichen < 9) && speicheVon[i] === 0;
    const punkte = [];
    for (let j = speicheVon[i]; j <= speicheBis[i]; j++) punkte.push(P(i, j));
    if (punkte.length < 2) continue;
    /* Die Hauptstraßen laufen aus der Stadt hinaus — aber nicht ins Wasser. */
    if (haupt && plan.stadt.umland && speicheBis[i] === ringe) {
      const letzte = punkte[punkte.length - 1];
      const w = winkelVon(i, ringe) * Math.PI / 180;
      for (const weit of [0.1, 0.34]) {
        const q = [letzte[0] + Math.cos(w) * G * weit, letzte[1] + Math.sin(w) * G * weit * hoch];
        if (wasser.drin(q[0], q[1])) break;
        punkte.push(q);
      }
    }
    strassen.push({ art: haupt ? 'haupt' : 'gasse', richtung: 'speiche', i, punkte, name: planGassenname(saat, 'sp' + i, haupt ? 'haupt' : 'gasse') });
  }
  for (let j = 1; j <= ringe; j++) {
    const reihe = speichenAmRing(j);
    const punkte = reihe.map((i) => P(i, j));
    punkte.push(P(reihe[0] + speichen, j));
    strassen.push({ art: j === mauerRing ? 'mauerweg' : (j % 2 === 1 ? 'ring' : 'gasse'), richtung: 'ring', j, punkte, geschlossen: true, name: planGassenname(saat, 'ri' + j, 'ring') });
  }

  /* --- Der Marktplatz in der Mitte --- */
  const markt = speichenAmRing(0).map((i) => P(i, 0));

  /* --- Die Mauer mit Türmen und Toren --- */
  let mauer = null;
  if (mauerRing >= 0) {
    const reihe = speichenAmRing(mauerRing);
    const punkte = reihe.map((i) => P(i, mauerRing));
    punkte.push(P(reihe[0] + speichen, mauerRing));
    const tuerme = [], tore = [];
    for (const i of reihe) {
      const p = P(i, mauerRing);
      if (wasser.drin(p[0], p[1])) continue;
      const haupt = (i % 2 === 0 || speichen < 9) && speicheVon[i] === 0;
      if (haupt) tore.push({ punkt: p, i, name: planTorname(saat, i) });
      else tuerme.push({ punkt: p, i });
    }
    mauer = { punkte, tuerme, tore, ring: mauerRing };
  }

  /* --- Die Burg --- */
  let burg = null;
  if (plan.stadt.burg) {
    const i = planHash(saat, 'burg') % speichen;
    const j = Math.max(1, ringe - 1);
    const p = P(i, j);
    if (!wasser.drin(p[0], p[1])) {
      const w = winkelVon(i, j) * Math.PI / 180;
      burg = { mitte: [p[0] + Math.cos(w) * 26, p[1] + Math.sin(w) * 26], winkel: w * 180 / Math.PI, groesse: 34 + planZufall(saat, 'bg') * 16 };
    }
  }

  /* --- Die Brücken --- */
  const bruecken = [];
  if (wasser.art === 'fluss') {
    for (const s of strassen) {
      if (s.richtung !== 'speiche') continue;
      for (let k = 1; k < s.punkte.length; k++) {
        const a = s.punkte[k - 1], b = s.punkte[k];
        if (wasser.drin(a[0], a[1]) !== wasser.drin(b[0], b[1])) {
          bruecken.push({ punkt: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], winkel: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI });
          break;
        }
      }
    }
  }

  return {
    mitte: [mx, my], speichen, ringe, ringR, Rmax, hoch, P, winkelVon,
    bloecke, haeuser, strassen, markt, mauer, mauerRing, burg, bruecken, viertel, besonders
  };
}

/* Ein Weg, der ins Wasser läuft, hört dort auf. Zerfällt er dabei in
   mehrere Stücke (eine Straße quert den Fluss), werden es mehrere Wege —
   und an der Bruchstelle liegt später eine Brücke. */
function planTrockeneWege(punkte, wasser, geschlossen) {
  if (!wasser || wasser.art === 'keins') return [{ punkte, geschlossen }];
  const nass = punkte.map((q) => wasser.drin(q[0], q[1]));
  if (!nass.some(Boolean)) return [{ punkte, geschlossen }];
  const stuecke = [];
  let jetzt = [];
  for (let i = 0; i < punkte.length; i++) {
    if (nass[i]) {
      if (jetzt.length > 1) stuecke.push({ punkte: jetzt, geschlossen: false });
      jetzt = [];
    } else jetzt.push(punkte[i]);
  }
  if (jetzt.length > 1) stuecke.push({ punkte: jetzt, geschlossen: false });
  return stuecke;
}

/* ----- Der Umriss eines Hauses -----
   Vier Ecken sind ein Rechteck. Ein Haus auf einer gestochenen Karte hat
   aber einen Rücksprung, eine abgeschnittene Ecke, einen Hof — und keine
   Kante ist ganz gerade. Genau das wird hier gebaut, gerechnet aus der Saat,
   damit dasselbe Haus immer dieselbe Schiefe hat. */
function planHausUmriss(ecken, saat, k) {
  const zittern = (p, i) => [
    p[0] + planStreu(saat, 'hz' + k + '_' + i) * 0.9,
    p[1] + planStreu(saat, 'hy' + k + '_' + i) * 0.9
  ];
  const wuerfel = planZufall(saat, 'hf' + k);
  const [a, b, c, d] = ecken;

  /* Ein Winkelbau: hinten fehlt ein Viertel — dort liegt der Hof. */
  if (wuerfel > 0.82) {
    const ecke = planHash(saat, 'hw' + k) % 4;
    const t = 0.42 + planZufall(saat, 'ht' + k) * 0.16;
    const ring = [a, b, c, d];
    const raus = [];
    for (let i = 0; i < 4; i++) {
      if (i !== ecke) { raus.push(ring[i]); continue; }
      const vor = ring[(i + 3) % 4], nach = ring[(i + 1) % 4];
      raus.push([vor[0] + (ring[i][0] - vor[0]) * (1 - t), vor[1] + (ring[i][1] - vor[1]) * (1 - t)]);
      raus.push([
        ring[i][0] - (ring[i][0] - vor[0]) * t - (ring[i][0] - nach[0]) * t,
        ring[i][1] - (ring[i][1] - vor[1]) * t - (ring[i][1] - nach[1]) * t
      ]);
      raus.push([ring[i][0] + (nach[0] - ring[i][0]) * t, ring[i][1] + (nach[1] - ring[i][1]) * t]);
    }
    return raus.map(zittern);
  }

  /* Eine abgeschnittene Ecke — das Haus steht schräg an der Gasse. */
  if (wuerfel > 0.66) {
    const ecke = planHash(saat, 'he' + k) % 4;
    const t = 0.24 + planZufall(saat, 'hs' + k) * 0.16;
    const ring = [a, b, c, d];
    const raus = [];
    for (let i = 0; i < 4; i++) {
      if (i !== ecke) { raus.push(ring[i]); continue; }
      const vor = ring[(i + 3) % 4], nach = ring[(i + 1) % 4];
      raus.push([vor[0] + (ring[i][0] - vor[0]) * (1 - t), vor[1] + (ring[i][1] - vor[1]) * (1 - t)]);
      raus.push([ring[i][0] + (nach[0] - ring[i][0]) * t, ring[i][1] + (nach[1] - ring[i][1]) * t]);
    }
    return raus.map(zittern);
  }

  return ecken.map(zittern);
}

/* ===================== DAS UMLAND =====================
   Felder in Streifen, Wälder in Nestern, ein paar einzelne Höfe. Ohne
   Umland schwebt die Stadt im Nichts. */
function planUmland(plan, stadt, wasser) {
  if (!plan.stadt.umland) return { felder: [], waelder: [], hoefe: [] };
  const saat = plan.saat;
  const G = PLAN_GROESSE;
  const [mx, my] = stadt.mitte;
  const felder = [], waelder = [], hoefe = [];
  const aussen = stadt.Rmax * 1.06;

  const gruppen = 12 + Math.round(planZufall(saat, 'fg') * 8);
  for (let g = 0; g < gruppen; g++) {
    const w = (g / gruppen) * Math.PI * 2 + planStreu(saat, 'fw' + g) * 0.18;
    const r0 = aussen + planZufall(saat, 'fr' + g) * G * 0.08;
    const tiefe = G * (0.05 + planZufall(saat, 'ft' + g) * 0.13);
    const breite = (Math.PI * 2 / gruppen) * 0.86;
    const streifen = 2 + Math.round(planZufall(saat, 'fs' + g) * 4);
    const kind = planZufall(saat, 'fk' + g);
    for (let s = 0; s < streifen; s++) {
      const w0 = w - breite / 2 + (s / streifen) * breite;
      const w1 = w - breite / 2 + ((s + 0.86) / streifen) * breite;
      const ecken = [
        [mx + Math.cos(w0) * r0, my + Math.sin(w0) * r0],
        [mx + Math.cos(w1) * r0, my + Math.sin(w1) * r0],
        [mx + Math.cos(w1) * (r0 + tiefe), my + Math.sin(w1) * (r0 + tiefe)],
        [mx + Math.cos(w0) * (r0 + tiefe), my + Math.sin(w0) * (r0 + tiefe)]
      ];
      if (ecken.some((p) => p[0] < -40 || p[0] > G + 40 || p[1] < -40 || p[1] > G + 40)) continue;
      if (wasser.drin(ecken[0][0], ecken[0][1]) || wasser.drin(ecken[2][0], ecken[2][1])) continue;
      if (kind > 0.72) waelder.push({ ecken, n: waelder.length });
      else felder.push({ ecken, gepfluegt: kind > 0.34, n: felder.length });
    }
    if (kind > 0.5 && kind < 0.72) {
      const hr = r0 + tiefe * 0.4;
      const hw = w + planStreu(saat, 'hw' + g) * 0.1;
      const p = [mx + Math.cos(hw) * hr, my + Math.sin(hw) * hr];
      if (!wasser.drin(p[0], p[1]) && p[0] > 20 && p[0] < G - 20 && p[1] > 20 && p[1] < G - 20) hoefe.push({ punkt: p, n: hoefe.length });
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
  return { plan, wasser, stadt, umland };
}
/* Woran man erkennt, ob neu gerechnet werden muss. */
function planSignatur(plan) {
  const s = plan.stadt;
  return [plan.saat, s.groesse, s.alter, s.wasser, s.mauer, s.burg, s.umland, s.dichte].join('|');
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
