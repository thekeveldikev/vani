/* ===================== 63 — DER WANDTEPPICH =====================
   Ein Stammbaum, der auch die Fäden kennt, die keine Familie sind.

   Der Unterschied zu einer Ahnentafel: Blut ist hier nur EINE Fadenart neben
   vielen. „Hat getötet“, „ist verliebt in“, „war schuld an“, „weiß nichts
   von" — das sind keine Randnotizen, das ist oft der eigentliche Stoff.

   Trotzdem bleibt es ein Baum und wird keine Wolke aus Strichen. Das geht so:
   die BLUTFÄDEN bauen das Gerüst — sie allein bestimmen, wer wo hängt. Alle
   anderen Fäden werden über dieses Gerüst gespannt, als Ranken zwischen den
   Ästen. Man kann sie einzeln stumm schalten. So bleibt die Wand lesbar,
   auch wenn dreißig Leute einander lieben, hassen und beerben.

   Hier drin ist kein DOM und keine Zufallszahl. Was hier gerechnet wird,
   sieht beim zweiten Aufschlagen genauso aus wie beim ersten. */

/* ----- Die Fadenarten -----
   gruppe   — wonach im Verzeichnis gebündelt wird
   gerichtet— ob der Faden eine Richtung hat (A tötete B ist nicht B tötete A)
   satz     — wie der Faden sich liest; {a} und {b} werden ersetzt
   strich   — wie die Ranke gezeichnet wird
   Blut und Bund bauen das Gerüst, alles andere wird darübergelegt. */
const FADEN_GRUPPEN = [
  ['blut', 'Blut', 'Wer von wem abstammt — daran hängt der ganze Baum.'],
  ['bund', 'Bund', 'Wer mit wem zusammensteht, mit oder ohne Trauschein.'],
  ['herz', 'Herz', 'Was zwischen zweien ist, ob sie es wissen oder nicht.'],
  ['klinge', 'Klinge', 'Was einer dem anderen angetan hat.'],
  ['band', 'Band', 'Alles andere, was zwei Menschen verbindet.']
];

const FADEN_ARTEN = [
  /* --- Blut: das Gerüst --- */
  { id: 'kind', gruppe: 'blut', name: 'Kind von', gegen: 'Elternteil von', satz: '{a} ist Kind von {b}', farbe: '#d8d2bc', strich: 'voll', gerichtet: true, geruest: true },
  { id: 'ziehkind', gruppe: 'blut', name: 'Aufgezogen von', gegen: 'Zog auf', satz: '{a} wurde aufgezogen von {b}', farbe: '#c9c3a8', strich: 'gestrichelt', gerichtet: true, geruest: true },
  { id: 'geschwister', gruppe: 'blut', name: 'Geschwister von', satz: '{a} und {b} sind Geschwister', farbe: '#c9c3a8', strich: 'voll', gerichtet: false },

  /* --- Bund: steht nebeneinander --- */
  { id: 'heirat', gruppe: 'bund', name: 'Verheiratet mit', satz: '{a} und {b} sind verheiratet', farbe: '#c8b273', strich: 'voll', gerichtet: false, paar: true },
  { id: 'paar', gruppe: 'bund', name: 'Zusammen mit', satz: '{a} und {b} sind zusammen', farbe: '#c8b273', strich: 'gestrichelt', gerichtet: false, paar: true },
  { id: 'getrennt', gruppe: 'bund', name: 'Getrennt von', satz: '{a} und {b} sind getrennt', farbe: '#9c8f74', strich: 'gepunktet', gerichtet: false },
  { id: 'verlobt', gruppe: 'bund', name: 'Verlobt mit', satz: '{a} und {b} sind verlobt', farbe: '#c8b273', strich: 'gestrichelt', gerichtet: false, paar: true },

  /* --- Herz --- */
  { id: 'liebt', gruppe: 'herz', name: 'Liebt', satz: '{a} liebt {b}', farbe: '#c2564a', strich: 'voll', gerichtet: true },
  { id: 'verliebt', gruppe: 'herz', name: 'Ist verliebt in', satz: '{a} ist verliebt in {b}', farbe: '#c2564a', strich: 'gestrichelt', gerichtet: true },
  { id: 'sehnt', gruppe: 'herz', name: 'Sehnt sich nach', satz: '{a} sehnt sich nach {b}', farbe: '#b06a7e', strich: 'gepunktet', gerichtet: true },
  { id: 'verloren', gruppe: 'herz', name: 'Hat verloren', satz: '{a} hat {b} verloren', farbe: '#8a7fa0', strich: 'gestrichelt', gerichtet: true },
  { id: 'traut', gruppe: 'herz', name: 'Vertraut', satz: '{a} vertraut {b}', farbe: '#7f9a86', strich: 'voll', gerichtet: true },

  /* --- Klinge --- */
  { id: 'toetete', gruppe: 'klinge', name: 'Hat getötet', satz: '{a} hat {b} getötet', farbe: '#8f2f22', strich: 'voll', gerichtet: true, schwer: true },
  { id: 'schuld', gruppe: 'klinge', name: 'War schuld an', satz: '{a} war schuld an {b}', farbe: '#8f2f22', strich: 'gestrichelt', gerichtet: true, schwer: true, worthilfe: 'Woran? — „Almas Tod“, „dem Brand“, „dem, was im Winter geschah“' },
  { id: 'verriet', gruppe: 'klinge', name: 'Hat verraten', satz: '{a} hat {b} verraten', farbe: '#a44a30', strich: 'gestrichelt', gerichtet: true },
  { id: 'hasst', gruppe: 'klinge', name: 'Hasst', satz: '{a} hasst {b}', farbe: '#7a3020', strich: 'gepunktet', gerichtet: true },
  { id: 'fuerchtet', gruppe: 'klinge', name: 'Fürchtet', satz: '{a} fürchtet {b}', farbe: '#5f4a6a', strich: 'gepunktet', gerichtet: true },
  { id: 'verstossen', gruppe: 'klinge', name: 'Hat verstoßen', satz: '{a} hat {b} verstoßen', farbe: '#4a3a2a', strich: 'gestrichelt', gerichtet: true, schwer: true },
  { id: 'jagt', gruppe: 'klinge', name: 'Sucht, um abzurechnen', satz: '{a} sucht {b}', farbe: '#8f5a22', strich: 'gestrichelt', gerichtet: true },

  /* --- Band --- */
  { id: 'lehrte', gruppe: 'band', name: 'War Lehrmeister von', gegen: 'Lernte bei', satz: '{a} war Lehrmeister von {b}', farbe: '#6f8aa0', strich: 'voll', gerichtet: true },
  { id: 'dient', gruppe: 'band', name: 'Dient', satz: '{a} dient {b}', farbe: '#6f8aa0', strich: 'gestrichelt', gerichtet: true },
  { id: 'schuldet', gruppe: 'band', name: 'Schuldet', satz: '{a} schuldet {b} etwas', farbe: '#9a8a4a', strich: 'gestrichelt', gerichtet: true, worthilfe: 'Was? — „ein Leben“, „dreihundert Gulden“, „ein Versprechen“' },
  { id: 'rettete', gruppe: 'band', name: 'Hat gerettet', satz: '{a} hat {b} gerettet', farbe: '#7f9a86', strich: 'voll', gerichtet: true },
  { id: 'sucht', gruppe: 'band', name: 'Sucht', satz: '{a} sucht {b}', farbe: '#8a9a6a', strich: 'gepunktet', gerichtet: true },
  { id: 'weissnichts', gruppe: 'band', name: 'Weiß nichts von', satz: '{a} weiß nichts von {b}', farbe: '#6a6a72', strich: 'gepunktet', gerichtet: true, worthilfe: 'Wovon? — „dass er ihr Vater ist“, „vom Brief“' },
  { id: 'haelt', gruppe: 'band', name: 'Hält ein Geheimnis über', satz: '{a} hält ein Geheimnis über {b}', farbe: '#5a6a72', strich: 'gepunktet', gerichtet: true, worthilfe: 'Welches?' },
  { id: 'erbt', gruppe: 'band', name: 'Erbt von', satz: '{a} erbt von {b}', farbe: '#9a8a4a', strich: 'voll', gerichtet: true },
  { id: 'nachfolge', gruppe: 'band', name: 'Folgt nach', satz: '{a} folgt {b} nach', farbe: '#9a8a4a', strich: 'gestrichelt', gerichtet: true },
  { id: 'kennt', gruppe: 'band', name: 'Kennt', satz: '{a} kennt {b}', farbe: '#7a7a70', strich: 'gepunktet', gerichtet: false }
];

const FADEN_ART_IDS = FADEN_ARTEN.map((a) => a.id);
const FADEN_STRICHE = ['voll', 'gestrichelt', 'gepunktet'];
/* Die Farben, aus denen eine eigene Fadenart wählen kann. */
const FADEN_FARBEN = ['#c2564a', '#8f2f22', '#c8b273', '#7f9a86', '#6f8aa0', '#8a7fa0', '#9a8a4a', '#7a7a70', '#a44a30', '#5f4a6a'];

/* Eine Fadenart nachschlagen — auch eine eigene, die im Teppich selbst steht.
   Was es nicht gibt, wird nicht erfunden: es kommt eine graue Ersatzart
   zurück, damit ein Tippfehler in alten Daten nichts zerreißt. */
function fadenArt(id, baum) {
  const eigene = baum && Array.isArray(baum.eigeneArten) ? baum.eigeneArten : [];
  const e = eigene.find((a) => a && a.id === id);
  if (e) return { id: e.id, gruppe: e.gruppe || 'band', name: e.name || 'Eigener Faden', satz: e.satz || '{a} — {b}', farbe: e.farbe || '#7a7a70', strich: FADEN_STRICHE.includes(e.strich) ? e.strich : 'gestrichelt', gerichtet: e.gerichtet !== false, eigen: true };
  return FADEN_ARTEN.find((a) => a.id === id) ||
    { id: String(id || 'kennt'), gruppe: 'band', name: 'Faden', satz: '{a} — {b}', farbe: '#7a7a70', strich: 'gepunktet', gerichtet: false, unbekannt: true };
}
function fadenSatz(faden, baum, leute) {
  const art = fadenArt(faden.art, baum);
  const namen = (id) => { const p = (leute || []).find((x) => x.id === id); return p ? (p.name || 'jemand') : 'jemand'; };
  let s = art.satz.replace('{a}', namen(faden.von)).replace('{b}', namen(faden.zu));
  if (faden.wort) s += ' — ' + faden.wort;
  return s;
}

/* ----- Die Tücher -----
   Der Grund, auf dem alles liegt. Kein Bild, nur Farbe und Webart. */
const TEPPICH_STOFFE = [
  ['moos', 'Moosgrün', '#1e3524', '#16281a'],
  ['nacht', 'Nachtblau', '#1b2740', '#131d31'],
  ['wein', 'Weinrot', '#3a1b21', '#2b1218'],
  ['rauch', 'Rauchgrau', '#2b2b2c', '#1f1f20'],
  ['torf', 'Torfbraun', '#2e2418', '#221a11'],
  ['tinte', 'Tintenschwarz', '#191a18', '#111210']
];
function teppichStoff(id) { return TEPPICH_STOFFE.find((s) => s[0] === id) || TEPPICH_STOFFE[0]; }

/* Die Zeichen, die statt eines Bildnisses neben einem Namen stehen können.
   Geritzt, nicht gemalt — ein Wappen legt kein Gesicht fest. */
const TEPPICH_ZEICHEN = [
  ['keins', 'Kein Zeichen'],
  ['stern', 'Stern'], ['krone', 'Krone'], ['schwert', 'Schwert'], ['kelch', 'Kelch'],
  ['rabe', 'Rabe'], ['schlange', 'Schlange'], ['wolf', 'Wolf'], ['hirsch', 'Hirsch'],
  ['rose', 'Rose'], ['eiche', 'Eichenblatt'], ['schluessel', 'Schlüssel'], ['auge', 'Auge'],
  ['mond', 'Mond'], ['sonne', 'Sonne'], ['anker', 'Anker'], ['turm', 'Turm'],
  ['feder', 'Feder'], ['flamme', 'Flamme'], ['kette', 'Kette'], ['dolch', 'Dolch']
];
const TEPPICH_ZEICHEN_IDS = TEPPICH_ZEICHEN.map((z) => z[0]);

/* Was oben und unten am Rand entlangläuft. Wer nichts einträgt, bekommt den
   Namen des Teppichs in Versalien — das sieht immer noch aus wie gewebt. */
const TEPPICH_SPRUCH_VORSCHLAEGE = [
  'STIRPS NOBILIS ET GENS ANTIQUISSIMA',
  'WAS BLEIBT, BLEIBT IM BLUT',
  'NIEMAND GEHT GANZ FORT',
  'TOUJOURS PUR',
  'WIR ZÄHLEN DIE JAHRE NICHT, WIR ZÄHLEN DIE NAMEN',
  'SEMPER EADEM',
  'DAS HAUS ERINNERT SICH'
];

/* ----- Der Bestand ----- */
function stammbaeume() {
  return [...D.docs.values()].filter((d) => d.typ === 'stammbaum' && !d.geloescht)
    .sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0));
}

/* ----- Alles, was hereinkommt, wird geputzt -----
   Ein Teppich kann aus einer Sicherung kommen, aus einem anderen Gerät, aus
   einer alten Fassung. Was hier nicht durchkommt, kann später nichts
   zerreißen. Verworfen wird still; niemand will beim Aufschlagen eines
   Stammbaums eine Fehlerliste lesen. */
const TEPPICH_MAX_LEUTE = 400;
const TEPPICH_MAX_FAEDEN = 3000;

function saubererStammbaum(roh) {
  const r = roh && typeof roh === 'object' ? roh : {};
  const titel = String(r.titel || '').trim().slice(0, 140);
  const stoff = TEPPICH_STOFFE.some((s) => s[0] === r.stoff) ? r.stoff : 'moos';
  const spruch = String(r.spruch == null ? '' : r.spruch).trim().slice(0, 120);

  /* Eigene Fadenarten zuerst, damit die Fäden sie kennen dürfen. */
  const eigeneArten = [];
  const artenGesehen = new Set(FADEN_ART_IDS);
  for (const a of Array.isArray(r.eigeneArten) ? r.eigeneArten.slice(0, 40) : []) {
    if (!a || typeof a !== 'object') continue;
    const id = String(a.id || '').trim().slice(0, 40);
    const name = String(a.name || '').trim().slice(0, 60);
    if (!id || !name || artenGesehen.has(id)) continue;
    artenGesehen.add(id);
    eigeneArten.push({
      id, name,
      gruppe: FADEN_GRUPPEN.some((g) => g[0] === a.gruppe) ? a.gruppe : 'band',
      satz: String(a.satz || '').trim().slice(0, 120) || '{a} — ' + name + ' — {b}',
      farbe: /^#[0-9a-f]{6}$/i.test(String(a.farbe || '')) ? a.farbe : FADEN_FARBEN[0],
      strich: FADEN_STRICHE.includes(a.strich) ? a.strich : 'gestrichelt',
      gerichtet: a.gerichtet !== false
    });
  }

  const leute = [];
  const gesehen = new Set();
  for (const p of Array.isArray(r.leute) ? r.leute.slice(0, TEPPICH_MAX_LEUTE) : []) {
    if (!p || typeof p !== 'object') continue;
    const id = String(p.id || '').trim().slice(0, 60);
    if (!id || gesehen.has(id)) continue;
    gesehen.add(id);
    leute.push({
      id,
      name: String(p.name || '').trim().slice(0, 120),
      albumId: String(p.albumId || '').trim().slice(0, 60),
      von: String(p.von || '').trim().slice(0, 24),
      bis: String(p.bis || '').trim().slice(0, 24),
      notiz: String(p.notiz || '').trim().slice(0, 600),
      zeichen: TEPPICH_ZEICHEN_IDS.includes(p.zeichen) ? p.zeichen : 'keins',
      /* Ausgebrannt: der Name bleibt, das Feld darüber ist versengt. Genau
         so, wie man jemanden aus einem Wandteppich entfernt, ohne dass die
         Lücke verschwindet. */
      gebrannt: p.gebrannt === true,
      /* Von Hand verschoben? Dann rechnet die Ordnung nicht mehr dagegen an. */
      festX: Number.isFinite(p.festX) ? Math.max(-40, Math.min(200, p.festX)) : null,
      festY: Number.isFinite(p.festY) ? Math.max(-40, Math.min(400, p.festY)) : null
    });
  }
  const leuteIds = new Set(leute.map((p) => p.id));

  const faeden = [];
  const fadenGesehen = new Set();
  for (const f of Array.isArray(r.faeden) ? r.faeden.slice(0, TEPPICH_MAX_FAEDEN) : []) {
    if (!f || typeof f !== 'object') continue;
    const von = String(f.von || '').trim(), zu = String(f.zu || '').trim();
    /* Ein Faden ins Leere oder auf sich selbst ist keiner. */
    if (!von || !zu || von === zu || !leuteIds.has(von) || !leuteIds.has(zu)) continue;
    const art = String(f.art || '').trim() || 'kennt';
    if (!artenGesehen.has(art)) continue;
    const gerichtet = fadenArt(art, { eigeneArten }).gerichtet;
    /* Bei ungerichteten Fäden ist A–B dasselbe wie B–A. */
    const schluessel = art + '|' + (gerichtet ? von + '>' + zu : [von, zu].sort().join('~'));
    if (fadenGesehen.has(schluessel)) continue;
    fadenGesehen.add(schluessel);
    faeden.push({
      id: String(f.id || '').trim().slice(0, 60) || (art + '-' + von + '-' + zu),
      von, zu, art,
      wort: String(f.wort || '').trim().slice(0, 200),
      still: f.still === true
    });
  }

  return { titel, stoff, spruch, leute, faeden, eigeneArten };
}

/* Der Name, der auf dem Band steht. Hängt die Person am Album, gilt der Name
   von dort — sonst müsste man jede Umbenennung zweimal tippen. */
function teppichName(person) {
  if (!person) return '';
  if (person.albumId) {
    const d = D.docs.get(person.albumId);
    if (d && d.typ === 'albumfigur' && !d.geloescht && String(d.name || '').trim()) return String(d.name).trim();
  }
  return person.name || '';
}
function teppichJahre(person) {
  if (!person) return '';
  const v = String(person.von || '').trim(), b = String(person.bis || '').trim();
  if (v && b) return v + '–' + b;
  if (v) return '* ' + v;
  if (b) return '† ' + b;
  return '';
}
/* Steht die Person schon im Album? Dann darf man von hier aus hinüberspringen. */
function teppichAlbumFigur(person) {
  if (!person || !person.albumId) return null;
  const d = D.docs.get(person.albumId);
  return d && d.typ === 'albumfigur' && !d.geloescht ? d : null;
}

/* ----- Die Fäden einer Person ----- */
function teppichFaedenVon(baum, personId) {
  return (baum.faeden || []).filter((f) => f.von === personId || f.zu === personId);
}
function teppichNachbarn(baum, personId, arten) {
  const raus = new Set();
  for (const f of baum.faeden || []) {
    if (arten && !arten.includes(f.art)) continue;
    if (f.von === personId) raus.add(f.zu);
    else if (f.zu === personId) raus.add(f.von);
  }
  return [...raus];
}

/* ================= DIE ORDNUNG =================
   Aus einem Haufen Namen und Fäden wird ein Baum. Der Ablauf:

   1. ELTERN sammeln (nur Blutfäden). Wer Eltern hat, hängt tiefer im Baum.
   2. GENERATION rechnen: die längste Kette von einem Wurzelmenschen aus.
      Mit Zykluswache — wer aus Versehen sein eigener Großvater wird, bringt
      die App nicht zum Stehen, er landet einfach in der Generation, in der
      er zuerst gesehen wurde.
   3. PAARE nebeneinanderlegen und ihre Kinder unter die Mitte hängen.
   4. REIHEN ausrichten: mehrere Durchgänge, in denen jeder Knoten in die
      Mitte seiner Eltern bzw. Kinder rückt und sich niemand überlappt.
   5. WER GAR NICHTS HAT, hängt an einem eigenen kleinen Ast am Rand.

   Alle Zahlen sind Einheiten, keine Pixel: eine Spalte ist eine Generation,
   eine Reihe ein Namensband. Was daraus für ein Bild wird, entscheidet der
   Teppich, nicht die Rechnung. */

const TEPPICH_GERUEST = ['kind', 'ziehkind'];

function teppichEltern(baum) {
  const karte = new Map();
  for (const p of baum.leute) karte.set(p.id, []);
  for (const f of baum.faeden) {
    if (!TEPPICH_GERUEST.includes(f.art)) continue;
    const liste = karte.get(f.von);
    if (liste && !liste.includes(f.zu)) liste.push(f.zu);
  }
  return karte;
}
function teppichKinder(baum) {
  const karte = new Map();
  for (const p of baum.leute) karte.set(p.id, []);
  for (const f of baum.faeden) {
    if (!TEPPICH_GERUEST.includes(f.art)) continue;
    const liste = karte.get(f.zu);
    if (liste && !liste.includes(f.von)) liste.push(f.von);
  }
  return karte;
}
function teppichPaare(baum) {
  const karte = new Map();
  for (const p of baum.leute) karte.set(p.id, []);
  for (const f of baum.faeden) {
    const art = fadenArt(f.art, baum);
    if (!art.paar) continue;
    const a = karte.get(f.von), b = karte.get(f.zu);
    if (a && !a.includes(f.zu)) a.push(f.zu);
    if (b && !b.includes(f.von)) b.push(f.von);
  }
  return karte;
}

/* Die Generation: wie weit unten jemand im Baum hängt.
   Gerechnet über die längste Elternkette — sonst stünde ein Enkel neben
   seinem Großvater, nur weil der zweite Elternteil nicht eingetragen ist. */
function teppichGenerationen(baum) {
  const eltern = teppichEltern(baum);
  const gen = new Map();
  const laeuft = new Set();

  const tiefe = (id) => {
    if (gen.has(id)) return gen.get(id);
    /* Zykluswache: wer schon im Ablauf steckt, wird nicht noch einmal
       aufgerufen. Ein Kreis in der Abstammung ist unmöglich — eintippen
       kann man ihn trotzdem, und dann soll nichts stehenbleiben. */
    if (laeuft.has(id)) return 0;
    laeuft.add(id);
    let tief = 0;
    for (const e of eltern.get(id) || []) tief = Math.max(tief, tiefe(e) + 1);
    laeuft.delete(id);
    gen.set(id, tief);
    return tief;
  };

  for (const p of baum.leute) tiefe(p.id);

  /* Paare gehören in dieselbe Reihe. Der Angeheiratete rückt zum Ehepartner,
     nicht umgekehrt — sonst verschöbe eine Heirat den halben Baum.

     Und danach müssen die Kinder mit: rückt eine Angeheiratete eine
     Generation nach unten, stünde ihr Sohn sonst neben ihr statt unter ihr.
     Deshalb abwechselnd angleichen und nachschieben, bis sich nichts mehr
     bewegt — höchstens zwölf Runden, damit auch ein widersprüchlicher
     Eintrag irgendwann zur Ruhe kommt. */
  const paare = teppichPaare(baum);
  for (let runde = 0; runde < 12; runde++) {
    let bewegt = false;
    for (const p of baum.leute) {
      const meine = gen.get(p.id) || 0;
      const eigeneEltern = (eltern.get(p.id) || []).length;
      for (const q of paare.get(p.id) || []) {
        const andere = gen.get(q) || 0;
        if (andere === meine) continue;
        const qEltern = (eltern.get(q) || []).length;
        if (!eigeneEltern && qEltern) { gen.set(p.id, andere); bewegt = true; }
        else if (!qEltern && eigeneEltern) { gen.set(q, meine); bewegt = true; }
      }
    }
    /* Ein Kind steht immer mindestens eine Reihe unter jedem Elternteil. */
    for (const p of baum.leute) {
      let noetig = gen.get(p.id) || 0;
      for (const e of eltern.get(p.id) || []) noetig = Math.max(noetig, (gen.get(e) || 0) + 1);
      if (noetig !== (gen.get(p.id) || 0)) { gen.set(p.id, noetig); bewegt = true; }
    }
    if (!bewegt) break;
  }
  return gen;
}

/* Zusammenhängende Inseln: wer über Blut und Bund miteinander verbunden ist,
   gehört auf denselben Ast. Wer mit niemandem verbunden ist, ist seine
   eigene Insel und bekommt ein eigenes Zweiglein. */
function teppichInseln(baum) {
  const nachbar = new Map();
  for (const p of baum.leute) nachbar.set(p.id, new Set());
  for (const f of baum.faeden) {
    const art = fadenArt(f.art, baum);
    if (!TEPPICH_GERUEST.includes(f.art) && !art.paar && f.art !== 'geschwister') continue;
    const a = nachbar.get(f.von), b = nachbar.get(f.zu);
    if (a) a.add(f.zu);
    if (b) b.add(f.von);
  }
  const insel = new Map();
  let n = 0;
  for (const p of baum.leute) {
    if (insel.has(p.id)) continue;
    const stapel = [p.id];
    insel.set(p.id, n);
    while (stapel.length) {
      const jetzt = stapel.pop();
      for (const q of nachbar.get(jetzt) || []) {
        if (insel.has(q)) continue;
        insel.set(q, n);
        stapel.push(q);
      }
    }
    n++;
  }
  return { insel, anzahl: n };
}

/* Die eigentliche Ordnung. Ergebnis: für jede Person eine Spalte (Generation)
   und eine Reihe. Der Teppich macht daraus Äste. */
function teppichOrdnung(baum) {
  const sauber = baum && Array.isArray(baum.leute) ? baum : saubererStammbaum(baum);
  const leute = sauber.leute;
  if (!leute.length) return { knoten: [], spalten: 0, reihen: 0, inseln: 0 };

  const gen = teppichGenerationen(sauber);
  const eltern = teppichEltern(sauber);
  const kinder = teppichKinder(sauber);
  const paare = teppichPaare(sauber);
  const { insel, anzahl: inselAnzahl } = teppichInseln(sauber);

  /* Nach Insel und Generation bündeln. Die Inseln kommen untereinander zu
     liegen, damit zwei fremde Familien sich nicht ineinanderschieben. */
  const reihenfolgeInsel = [...new Set(leute.map((p) => insel.get(p.id)))]
    .sort((a, b) => {
      const na = leute.filter((p) => insel.get(p.id) === a).length;
      const nb = leute.filter((p) => insel.get(p.id) === b).length;
      return nb - na || a - b;   /* die größte Familie zuerst */
    });

  const y = new Map();
  let naechsteReihe = 0;

  for (const inselNr of reihenfolgeInsel) {
    const drin = leute.filter((p) => insel.get(p.id) === inselNr);
    const maxGen = Math.max(...drin.map((p) => gen.get(p.id) || 0));
    /* Je Generation eine Spalte mit den Leuten darin. */
    const spalten = [];
    for (let g = 0; g <= maxGen; g++) spalten.push(drin.filter((p) => (gen.get(p.id) || 0) === g).map((p) => p.id));

    /* Erste Anordnung: von oben nach unten durchgehen und Kinder direkt
       unter ihre Eltern hängen. Das ergibt schon fast das Bild. */
    const platz = new Map();
    let zaehler = naechsteReihe;
    const setzen = (id) => { if (!platz.has(id)) platz.set(id, zaehler++); };

    for (let g = 0; g <= maxGen; g++) {
      /* Sortiert nach der Reihe der Eltern, damit sich Äste nicht kreuzen. */
      const sortiert = spalten[g].slice().sort((a, b) => {
        const ea = (eltern.get(a) || []).map((e) => platz.has(e) ? platz.get(e) : 1e9);
        const eb = (eltern.get(b) || []).map((e) => platz.has(e) ? platz.get(e) : 1e9);
        const ma = ea.length ? ea.reduce((s, x) => s + x, 0) / ea.length : 1e9;
        const mb = eb.length ? eb.reduce((s, x) => s + x, 0) / eb.length : 1e9;
        return ma - mb || String(a).localeCompare(String(b));
      });
      for (const id of sortiert) {
        setzen(id);
        /* Der Partner kommt sofort daneben, wenn er in dieselbe Spalte gehört. */
        for (const q of paare.get(id) || []) {
          if ((gen.get(q) || 0) === g && !platz.has(q) && insel.get(q) === inselNr) setzen(q);
        }
      }
    }
    for (const [id, r] of platz) y.set(id, r);
    naechsteReihe = zaehler + 1;   /* eine Leerreihe zwischen zwei Inseln */
  }

  /* Feinschliff: mehrere Durchgänge, in denen jeder in die Mitte seiner
     Verwandten rückt. Danach werden Überlappungen in jeder Spalte wieder
     auseinandergezogen. Vier Durchgänge reichen; mehr bewegt kaum noch
     etwas und kostet bei dreihundert Namen spürbar Zeit. */
  const spaltenListe = new Map();
  for (const p of leute) {
    const g = gen.get(p.id) || 0;
    if (!spaltenListe.has(g)) spaltenListe.set(g, []);
    spaltenListe.get(g).push(p.id);
  }

  for (let runde = 0; runde < 4; runde++) {
    for (const [, ids] of spaltenListe) {
      for (const id of ids) {
        const verwandt = [...(eltern.get(id) || []), ...(kinder.get(id) || []), ...(paare.get(id) || [])]
          .filter((q) => y.has(q));
        if (!verwandt.length) continue;
        const mitte = verwandt.reduce((s, q) => s + y.get(q), 0) / verwandt.length;
        y.set(id, (y.get(id) + mitte) / 2);
      }
    }
    /* Auseinanderziehen: in jeder Spalte mindestens ein Reihenabstand. */
    for (const [, ids] of spaltenListe) {
      const sortiert = ids.slice().sort((a, b) => y.get(a) - y.get(b));
      for (let i = 1; i < sortiert.length; i++) {
        const vorher = y.get(sortiert[i - 1]), jetzt = y.get(sortiert[i]);
        if (jetzt - vorher < 1) y.set(sortiert[i], vorher + 1);
      }
    }
  }

  /* Zum Schluss die Paare wieder zusammenholen. Der Feinschliff oben zieht
     jeden in die Mitte seiner Verwandten — dabei rutschen Eheleute leicht
     auseinander, und dann laufen ihre Kinderäste über Kreuz. Ein Paar
     gehört nebeneinander, auch wenn die Rechnung etwas anderes will. */
  for (let runde = 0; runde < 3; runde++) {
    for (const p of leute) {
      for (const q of paare.get(p.id) || []) {
        if (p.id > q) continue;
        if ((gen.get(p.id) || 0) !== (gen.get(q) || 0)) continue;
        const a = y.get(p.id), b = y.get(q);
        if (a == null || b == null || Math.abs(a - b) <= 1.05) continue;
        const mitte = (a + b) / 2;
        y.set(p.id, a < b ? mitte - 0.5 : mitte + 0.5);
        y.set(q, a < b ? mitte + 0.5 : mitte - 0.5);
      }
    }
    for (const [, ids] of spaltenListe) {
      const sortiert = ids.slice().sort((a, b) => y.get(a) - y.get(b));
      for (let i = 1; i < sortiert.length; i++) {
        const vorher = y.get(sortiert[i - 1]), jetzt = y.get(sortiert[i]);
        if (jetzt - vorher < 1) y.set(sortiert[i], vorher + 1);
      }
    }
  }

  /* Alles nach oben schieben, damit die erste Reihe bei 0 liegt. */
  let kleinstes = Infinity;
  for (const v of y.values()) kleinstes = Math.min(kleinstes, v);
  if (!Number.isFinite(kleinstes)) kleinstes = 0;

  const knoten = leute.map((p) => {
    const g = gen.get(p.id) || 0;
    const reihe = (y.get(p.id) || 0) - kleinstes;
    return {
      id: p.id, person: p, gen: g,
      /* Von Hand verschoben schlägt gerechnet — aber nur, wenn beides dasteht. */
      x: p.festX != null && p.festY != null ? p.festX : g,
      y: p.festX != null && p.festY != null ? p.festY : reihe,
      gerechnetX: g, gerechnetY: reihe,
      fest: p.festX != null && p.festY != null,
      eltern: (eltern.get(p.id) || []).slice(),
      kinder: (kinder.get(p.id) || []).slice(),
      paare: (paare.get(p.id) || []).slice(),
      insel: insel.get(p.id)
    };
  });

  const spalten = Math.max(1, Math.max(...knoten.map((k) => k.x)) + 1);
  const reihen = Math.max(1, Math.max(...knoten.map((k) => k.y)) + 1);
  return { knoten, spalten, reihen, inseln: inselAnzahl };
}

/* ----- Was auffällt -----
   Nicht meckern, sondern zeigen. Dieselbe Haltung wie im Kalender und im
   Album: was nicht sein kann, steht ruhig daneben. */
function teppichAuffaelligkeiten(baum) {
  const raus = [];
  const sauber = baum && Array.isArray(baum.leute) ? baum : saubererStammbaum(baum);
  const name = (id) => { const p = sauber.leute.find((x) => x.id === id); return p ? (teppichName(p) || 'ohne Namen') : 'jemand'; };
  const eltern = teppichEltern(sauber);

  /* Ein Kreis in der Abstammung */
  const farbe = new Map();
  const kreis = (id, weg) => {
    if (farbe.get(id) === 2) return null;
    if (farbe.get(id) === 1) return weg.slice(weg.indexOf(id));
    farbe.set(id, 1);
    for (const e of eltern.get(id) || []) {
      const k = kreis(e, weg.concat([id]));
      if (k) return k;
    }
    farbe.set(id, 2);
    return null;
  };
  for (const p of sauber.leute) {
    const k = kreis(p.id, []);
    if (k && k.length) {
      raus.push({ art: 'kreis', text: 'Eine Abstammung im Kreis: ' + k.map(name).join(' → ') + ' → ' + name(k[0]) + '.', wer: k[0] });
      break;
    }
  }

  /* Mehr als zwei Elternteile: möglich (Zieheltern), aber einen Blick wert */
  for (const p of sauber.leute) {
    const e = eltern.get(p.id) || [];
    if (e.length > 2) raus.push({ art: 'eltern', text: name(p.id) + ' hat ' + e.length + ' Elternteile eingetragen.', wer: p.id });
  }

  /* Kind älter als Elternteil */
  for (const f of sauber.faeden) {
    if (f.art !== 'kind') continue;
    const kind = sauber.leute.find((x) => x.id === f.von), elter = sauber.leute.find((x) => x.id === f.zu);
    const kj = parseInt(String(kind && kind.von || '').slice(0, 4), 10);
    const ej = parseInt(String(elter && elter.von || '').slice(0, 4), 10);
    if (Number.isFinite(kj) && Number.isFinite(ej) && kj <= ej) {
      raus.push({ art: 'jahre', text: name(f.von) + ' wäre älter als ' + name(f.zu) + ' oder gleich alt.', wer: f.von });
    }
  }

  /* Wer nach seinem Tod noch etwas tut */
  for (const f of sauber.faeden) {
    const art = fadenArt(f.art, sauber);
    if (!art.schwer) continue;
    const taeter = sauber.leute.find((x) => x.id === f.von);
    const opfer = sauber.leute.find((x) => x.id === f.zu);
    const tj = parseInt(String(taeter && taeter.bis || '').slice(0, 4), 10);
    const oj = parseInt(String(opfer && opfer.bis || '').slice(0, 4), 10);
    if (f.art === 'toetete' && Number.isFinite(tj) && Number.isFinite(oj) && tj < oj) {
      raus.push({ art: 'zeit', text: name(f.von) + ' war schon tot, als ' + name(f.zu) + ' starb.', wer: f.von });
    }
  }

  /* Wer gar nicht angebunden ist */
  const allein = sauber.leute.filter((p) => !teppichFaedenVon(sauber, p.id).length);
  if (allein.length) {
    raus.push({
      art: 'allein',
      text: allein.length === 1 ? name(allein[0].id) + ' hängt an keinem Faden.' : allein.length + ' Leute hängen an keinem Faden.',
      wer: allein[0].id
    });
  }
  return raus.slice(0, 12);
}

/* ----- Zahlen für die Vorschau ----- */
function teppichZahlen(baum) {
  const sauber = baum && Array.isArray(baum.leute) ? baum : saubererStammbaum(baum);
  const arten = new Set(sauber.faeden.map((f) => f.art));
  const gen = teppichGenerationen(sauber);
  let tiefste = 0;
  for (const v of gen.values()) tiefste = Math.max(tiefste, v);
  return {
    leute: sauber.leute.length,
    faeden: sauber.faeden.length,
    arten: arten.size,
    generationen: sauber.leute.length ? tiefste + 1 : 0,
    gebrannt: sauber.leute.filter((p) => p.gebrannt).length,
    inseln: teppichInseln(sauber).anzahl
  };
}

/* ----- Suchen ----- */
function teppichSuche(baum, frage) {
  const q = String(frage || '').trim().toLowerCase();
  const sauber = baum && Array.isArray(baum.leute) ? baum : saubererStammbaum(baum);
  if (!q) return sauber.leute.slice();
  const punkte = (p) => {
    const n = teppichName(p).toLowerCase();
    if (!n) return (p.notiz || '').toLowerCase().includes(q) ? 1 : 0;
    if (n === q) return 100;
    if (n.startsWith(q)) return 60;
    if (n.includes(q)) return 30;
    if ((p.notiz || '').toLowerCase().includes(q)) return 10;
    if ((p.von + ' ' + p.bis).toLowerCase().includes(q)) return 5;
    return 0;
  };
  return sauber.leute.map((p) => ({ p, w: punkte(p) })).filter((x) => x.w > 0)
    .sort((a, b) => b.w - a.w || teppichName(a.p).localeCompare(teppichName(b.p), 'de'))
    .map((x) => x.p);
}

/* ----- Immer dieselbe Schräge -----
   Ein Namensband sitzt nie ganz gerade. Gerechnet aus der Kennung, nicht
   gewürfelt: derselbe Teppich sieht bei jedem Aufschlagen gleich aus. */
function teppichHash(...teile) {
  let h = 2166136261;
  const s = teile.join('|');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
function teppichDreh(id, salz, weite) {
  const w = weite == null ? 3 : weite;
  const h = teppichHash(id, String(salz || ''));
  return Math.round(((h % 2000) / 1000 - 1) * w * 10) / 10;
}
function teppichZufall(id, salz) { return (teppichHash(id, String(salz || '')) % 1000) / 1000; }
