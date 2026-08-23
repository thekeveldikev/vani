/* ===================== 62d — DAS ALBUM, AUSBAUSTUFE 3 =====================
   Ordnung, Filter, Gegenüberstellung, Netz — und die Fragen, die ein Album
   stellen kann, wenn man es lange genug aufschlägt.

   Alles hier ist reines Rechnen: kein DOM, keine Zufallszahl, nichts, was
   sich beim zweiten Hinsehen anders verhält. */

/* ----- In welcher Ordnung das Buch liegt -----
   Alphabetisch ist die Voreinstellung und bleibt es: ein Album, dessen Seiten
   je nach Laune woanders liegen, ist kein Buch. Die anderen Ordnungen sind
   Werkzeuge, keine Zustände — sie stehen sichtbar oben, damit man weiß,
   warum die Reihenfolge gerade nicht die gewohnte ist. */
const ALBUM_ORDNUNGEN = [
  ['alphabet', 'Alphabetisch', 'Wie im Register — A bis Z, Namenlose zuletzt.'],
  ['gefuellt', 'Nach Fülle', 'Wer am meisten von sich preisgegeben hat, zuerst.'],
  ['leer', 'Die Stillen zuerst', 'Wer kaum etwas hergibt, steht vorn — damit du sie findest.'],
  ['geaendert', 'Zuletzt angefasst', 'An wem du zuletzt geschrieben hast.'],
  ['angelegt', 'Nach Anlage', 'In der Reihenfolge, in der sie ins Buch kamen.'],
  ['geburt', 'Nach Geburtstag', 'Die Ältesten voran; wer kein Datum hat, kommt danach.']
];
function albumOrdnungName(id) {
  const o = ALBUM_ORDNUNGEN.find((x) => x[0] === id);
  return o ? o[1] : ALBUM_ORDNUNGEN[0][1];
}
function albumGeordnet(liste, ordnung) {
  const a = (liste || albumFiguren()).slice();
  if (ordnung === 'gefuellt') return a.sort((x, y) => albumFuelle(y) - albumFuelle(x) || albumVergleich(x, y));
  if (ordnung === 'leer') return a.sort((x, y) => albumFuelle(x) - albumFuelle(y) || albumVergleich(x, y));
  if (ordnung === 'geaendert') return a.sort((x, y) => (y.geaendert || 0) - (x.geaendert || 0) || albumVergleich(x, y));
  if (ordnung === 'angelegt') return a.sort((x, y) => (x.angelegt || 0) - (y.angelegt || 0) || albumVergleich(x, y));
  if (ordnung === 'geburt') {
    /* Der Kalender reicht bis 1600 zurueck, also reicht seine Rechnung auch
       fuer eine Figur von 1783. Eine zweite Datumsrechnung im Album waere ein
       zweiter Ort, an dem dasselbe schiefgehen kann. */
    const stempel = (f) => {
      const g = (f.felder || {}).geboren;
      return g && kalGueltig(g) ? kalZeit(g) : null;
    };
    return a.sort((x, y) => {
      const gx = stempel(x), gy = stempel(y);
      if (gx != null && gy != null) return gx - gy || albumVergleich(x, y);
      if (gx) return -1;
      if (gy) return 1;
      return albumVergleich(x, y);
    });
  }
  return a.sort(albumVergleich);
}

/* ----- Nach Geschichten getrennt -----
   Frei hineingeschrieben, also frei wieder herausgelesen: was in „Kommt vor
   in" steht, wird gezählt, nicht verwaltet. Wer nichts einträgt, wird auch
   nicht gefragt. */
function albumGeschichten(liste) {
  const karte = new Map();
  for (const f of liste || albumFiguren()) {
    for (const g of (f.felder || {}).geschichte || []) {
      const name = String(g || '').trim();
      if (!name) continue;
      const k = name.toLowerCase();
      if (!karte.has(k)) karte.set(k, { name, anzahl: 0 });
      karte.get(k).anzahl++;
    }
  }
  return [...karte.values()].sort((a, b) => b.anzahl - a.anzahl || a.name.localeCompare(b.name, 'de'));
}
function albumInGeschichte(f, geschichte) {
  const g = String(geschichte || '').trim().toLowerCase();
  if (!g) return true;
  return ((f.felder || {}).geschichte || []).some((x) => String(x || '').trim().toLowerCase() === g);
}
/* Suche, Filter und Ordnung in einem Griff. Wird gesucht, ordnet die Suche —
   nach Güte des Treffers, nicht nach Alphabet; alles andere wäre ärgerlich. */
function albumAuswahl(alle, einstellung) {
  const e = einstellung || {};
  let liste = alle || albumFiguren();
  if (e.geschichte) liste = liste.filter((f) => albumInGeschichte(f, e.geschichte));
  if (String(e.suche || '').trim()) return albumSuche(e.suche, liste);
  return albumGeordnet(liste, e.ordnung);
}

/* ----- Eine Figur abschreiben -----
   Zwillinge, Geschwister, dieselbe Figur zehn Jahre später: es ist mühsam,
   dreißig Felder noch einmal zu tippen. Die Abschrift nimmt alles mit — außer
   dem, was nur einmal auf der Welt sein darf: Geburts- und Todestag. Die
   stehen im Kalender, und zwei Einträge am selben Tag für zwei Figuren, von
   denen eine gar nicht gemeint war, wären ein Ärgernis. */
const ALBUM_NICHT_ABSCHREIBEN = ['geboren', 'gestorben'];
function albumAbschrift(f, neuerName) {
  const q = saubereAlbumFigur(f) || { name: '', felder: {}, eigene: [], zettel: [], farbe: '' };
  const felder = {};
  for (const id of Object.keys(q.felder)) {
    if (ALBUM_NICHT_ABSCHREIBEN.includes(id)) continue;
    const w = q.felder[id];
    felder[id] = Array.isArray(w) ? w.slice() : w;
  }
  const roh = neuerName != null ? neuerName : (q.name ? q.name + ' (Abschrift)' : '');
  return {
    name: String(roh).trim().slice(0, 120),
    felder,
    eigene: q.eigene.map((e) => ({ name: e.name, wert: e.wert, gruppe: e.gruppe })),
    zettel: q.zettel.map((z) => ({ text: z.text, ton: z.ton })),
    farbe: q.farbe
  };
}

/* ----- Zwei nebeneinander -----
   Nicht um zu bewerten, sondern um zu sehen, wo zwei Figuren einander zu
   ähnlich geraten sind. Gezeigt wird nur, wo mindestens eine etwas sagt. */
function albumGegenueber(a, b) {
  const hol = (f, id) => {
    const w = ((f && f.felder) || {})[id];
    if (w == null) return '';
    return Array.isArray(w) ? w.filter(Boolean).join(' · ') : String(w).trim();
  };
  const raus = [];
  for (const feld of ALBUM_FELDER) {
    const wa = hol(a, feld.id), wb = hol(b, feld.id);
    if (!wa && !wb) continue;
    raus.push({
      feld, a: wa, b: wb,
      gleich: !!wa && !!wb && wa.toLowerCase() === wb.toLowerCase(),
      nurEiner: !wa || !wb
    });
  }
  return raus;
}
/* Wie ähnlich sind sich zwei? Gezählt über die Felder, in denen mehrere
   Stichworte stehen — dort verrät sich, ob zwei Figuren dieselbe sind. */
const ALBUM_AEHNLICH_FELDER = ['wesen', 'schwaeche', 'leidenschaft', 'eigenheit', 'geschichte', 'nennung'];
function albumAehnlichkeit(a, b) {
  let treffer = 0, moeglich = 0;
  for (const id of ALBUM_AEHNLICH_FELDER) {
    const la = new Set((((a && a.felder) || {})[id] || []).map((x) => String(x).trim().toLowerCase()).filter(Boolean));
    const lb = new Set((((b && b.felder) || {})[id] || []).map((x) => String(x).trim().toLowerCase()).filter(Boolean));
    if (!la.size || !lb.size) continue;
    moeglich += Math.max(la.size, lb.size);
    for (const x of la) if (lb.has(x)) treffer++;
  }
  return moeglich ? treffer / moeglich : 0;
}
/* Wer sich zu sehr gleicht, sollte es erfahren — leise, nicht als Vorwurf. */
function albumZwillinge(liste, schwelle) {
  const grenze = schwelle == null ? 0.34 : schwelle;
  const alle = (liste || albumFiguren()).filter((f) => !albumIstLeer(f));
  const raus = [];
  for (let i = 0; i < alle.length; i++) {
    for (let j = i + 1; j < alle.length; j++) {
      const wert = albumAehnlichkeit(alle[i], alle[j]);
      if (wert >= grenze) raus.push({ a: alle[i], b: alle[j], wert });
    }
  }
  return raus.sort((x, y) => y.wert - x.wert).slice(0, 12);
}

/* ----- Das Netz -----
   Alle Figuren auf einem Kreis, die Verbindungen als Sehnen dazwischen.
   Kein Stammbaum (der wird einmal ein eigener Raum), sondern ein Blick
   darauf, wer überhaupt mit wem zu tun hat — und wer allein steht. */
const ALBUM_NETZ_ARTEN = { familie: 'Familie', naehe: 'Nähe', bewundert: 'bewundert', verachtet: 'verachtet' };
function albumNetz(liste) {
  const alle = (liste || albumFiguren()).slice(0, 60);
  const n = alle.length;
  const knoten = alle.map((f, i) => {
    const winkel = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    return {
      id: f.id, name: f.name || 'ohne Namen', figur: f, farbe: albumFarbe(f), winkel, grad: 0,
      x: Math.round((50 + Math.cos(winkel) * 37) * 100) / 100,
      y: Math.round((50 + Math.sin(winkel) * 37) * 100) / 100
    };
  });
  const wo = new Map(knoten.map((k) => [k.id, k]));
  const kanten = [], gesehen = new Set();
  for (const b of albumBeziehungen(alle)) {
    if (!b.zu || b.zu === b.von) continue;
    const von = wo.get(b.von), zu = wo.get(b.zu);
    if (!von || !zu) continue;
    const schluessel = [b.von, b.zu].sort().join('>') + '|' + b.art;
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    von.grad++; zu.grad++;
    kanten.push({ von, zu, art: b.art, rolle: b.rolle, artName: ALBUM_NETZ_ARTEN[b.art] || b.art });
  }
  return { knoten, kanten, allein: knoten.filter((k) => !k.grad) };
}

/* ----- Die Fragen -----
   Ein Album, das nur aufnimmt, ist ein Formular. Ein Album, das fragt, ist ein
   Gegenüber. Die Frage zu einer Figur ist gerechnet, nicht gewürfelt: dieselbe
   Figur bekommt beim Aufschlagen dieselbe Frage — bis man weiterdreht. */
const ALBUM_FRAGEN = [
  'Was würde {du} nie zugeben, obwohl es stimmt?',
  'Wovon träumt {du}, wenn der Traum gut ausgeht?',
  'Welches Geräusch macht {du} unruhig?',
  'Was hat {du} als Kind besessen und verloren?',
  'Wen ruft {du} an, wenn es zwei Uhr nachts ist?',
  'Was tut {du}, wenn niemand zusieht?',
  'Welche Lüge erzählt {du} sich jeden Morgen? | Welche Lüge erzählt sich die Figur jeden Morgen?',
  'Woran erkennt man, dass {du} Angst hat?',
  'Was hat {du} zuletzt weggeworfen — und warum erst jetzt?',
  'Welches Wort benutzt {du} zu oft?',
  'Was bewahrt {du} auf, obwohl es keinen Wert hat?',
  'Wofür hat {du} sich zuletzt geschämt? | Wofür hat sich die Figur zuletzt geschämt?',
  'Was würde {du} tun, wenn Geld keine Rolle spielte?',
  'Wen hat {du} enttäuscht, ohne es zu merken?',
  'Wie geht {du} durch einen Raum voller Fremder?',
  'Was isst {du}, wenn es schlecht steht?',
  'Welche Narbe hat {du} — und welche Geschichte wird dazu erzählt?',
  'Was hat {du} nie gelernt, obwohl alle es können?',
  'Welchen Rat gibt {du} anderen und befolgt ihn nie?',
  'Was liegt in der Schublade, die {du} niemandem zeigt? | Was liegt in der Schublade, die niemand sehen darf?',
  'Wann hat {du} zuletzt geweint, und war jemand dabei?',
  'Welche Tür ist zugefallen und bleibt zu?',
  'Was riecht für {du} nach Zuhause?',
  'Wen beneidet {du} still?',
  'Was tut {du}, um nicht nachdenken zu müssen?',
  'Welche Frage will {du} nicht gestellt bekommen?',
  'Was haben Mutter oder Vater immer gesagt?',
  'Was stünde auf dem Grabstein — und was sollte dort stehen?',
  'Wovor läuft {du} davon, ohne es zu nennen?',
  'Welche Kleinigkeit macht {du} glücklich?',
  'Wem hat {du} nie verziehen?',
  'Was kann {du} besser als alle, ohne stolz darauf zu sein?',
  'Wie sieht es bei {du} aus, wenn Besuch kommt — und wie sonst? | Wie sieht es bei der Figur aus, wenn Besuch kommt — und wie sonst?',
  'Was war der erste echte Verlust?',
  'Welche Berührung erträgt {du} nicht?',
  'Was hat {du} sich vorgenommen und nie getan? | Was hat sich die Figur vorgenommen und nie getan?',
  'Bei wem würde {du} sich entschuldigen, wenn es leicht wäre? | Bei wem würde sich die Figur entschuldigen, wenn es leicht wäre?',
  'Wie klingt {du}s Lachen — und wann ist es echt? | Wie klingt das Lachen der Figur — und wann ist es echt?',
  'Welcher Gegenstand ist älter als {du} selbst?',
  'Was nimmt {du} mit, wenn das Haus brennt?',
  'Woran glaubt {du}, auch wenn es unvernünftig ist?',
  'Wie sagt {du}, dass jemand wichtig ist, ohne es zu sagen?',
  'Was tut {du}, wenn jemand weint?',
  'Welche Regel bricht {du} regelmäßig?',
  'Was hat {du} gestohlen — und wie klein war es?',
  'Wovon hat {du} zu viel, wovon zu wenig?',
  'Wo hört {du} auf zu verhandeln?',
  'Welche Erinnerung ruft {du} auf, wenn es hell werden soll?',
  'Was denkt {du} über den eigenen Namen?',
  'Wer war {du}, bevor die Geschichte anfing?',
  'Was hat {du} sich abgewöhnt und vermisst es doch? | Was hat sich die Figur abgewöhnt und vermisst es doch?',
  'Wen würde {du} verteidigen, auch wenn es falsch wäre?',
  'Wie geht {du} mit Warten um?',
  'Was ist {du}s liebste Uhrzeit? | Welche Uhrzeit ist der Figur die liebste?',
  'Welchen Umweg nimmt {du} freiwillig?',
  'Was würde {du} nie besitzen wollen?',
  'Wem sieht {du} ähnlich, und stört das?',
  'Was blieb vom zuletzt Gelesenen oder Gehörten hängen?',
  'Wie verabschiedet sich {du}? | Wie verabschiedet sich die Figur?',
  'Was tut {du} morgens als Erstes?',
  'Welche Arbeit macht {du} gern mit den Händen?',
  'Was hält {du} für gefährlich, das andere harmlos finden?',
  'Wann hat {du} zuletzt etwas zum ersten Mal getan?',
  'Was ist die größte unbezahlte Schuld?',
  'Welche Tageszeit gehört {du} allein? | Welche Tageszeit gehört der Figur allein?',
  'Was würde {du} retten, wenn man nur eines retten darf?',
  'Was tut {du} mit einem Brief, der ungeöffnet bleiben soll?',
  'Welches Versprechen hat {du} gebrochen?',
  'Was macht {du} mit den Händen, wenn {du} lügt? | Was macht die Figur mit den Händen, wenn sie lügt?',
  'Woran merkt {du} selbst, dass es zu viel wird? | Woran merkt die Figur selbst, dass es zu viel wird?'
];
function albumFrage(f, salz) {
  const id = (f && f.id) || '', name = (f && f.name) || '';
  const i = albumHash(id, name, String(salz || '')) % ALBUM_FRAGEN.length;
  return albumBeschriftung(ALBUM_FRAGEN[i], name);
}

/* ----- Das Titelblatt -----
   Ein Buch fängt nicht mit der ersten Figur an, sondern mit einem Blatt, auf
   dem steht, was das hier überhaupt ist. */
function albumTitelDaten(liste) {
  const alle = liste || albumFiguren();
  let zettel = 0, eintraege = 0, gefuellt = 0, angelegt = 0, beruehrt = 0;
  for (const f of alle) {
    zettel += albumZettel(f).length;
    eintraege += albumStuecke(f).length;
    if (!albumIstLeer(f)) gefuellt++;
    if (f.angelegt && (!angelegt || f.angelegt < angelegt)) angelegt = f.angelegt;
    if ((f.geaendert || 0) > beruehrt) beruehrt = f.geaendert || 0;
  }
  return {
    anzahl: alle.length, gefuellt, zettel, eintraege,
    offen: albumOffeneFaeden(alle).length, buchstaben: albumRegister(alle).length,
    angelegt, beruehrt, geschichten: albumGeschichten(alle).length
  };
}

/* ----- Wie dick der Stapel links und rechts ist -----
   Damit man dem aufgeschlagenen Buch ansieht, wie weit man ist. Gedeckelt,
   weil zweihundert gezeichnete Blattkanten niemandem helfen. */
function albumStapel(i, gesamt, deckel) {
  const d = deckel == null ? 16 : deckel;
  const g = Math.max(1, gesamt || 1);
  const stelle = Math.max(0, Math.min(g - 1, i || 0));
  return {
    links: Math.min(d, stelle),
    rechts: Math.min(d, Math.max(0, g - 1 - stelle)),
    anteil: g <= 1 ? 0 : stelle / (g - 1)
  };
}

/* ----- Was auf welcher Doppelseite liegt -----
   Das Buch hat vorn ein Titelblatt und hinten eine leere Doppelseite, auf der
   die nächste Figur angelegt wird. Dazwischen die Figuren. Weil sich sonst
   überall dieselbe Rechnerei wiederholen würde (und genau dort Fehler
   entstehen), steht sie hier einmal. */
function albumBlattAnzahl(liste) { return (liste ? liste.length : 0) + 2; }
function albumBlattArt(i, liste) {
  if (i <= 0) return 'titel';
  return i <= (liste ? liste.length : 0) ? 'figur' : 'neu';
}
function albumFigurBei(i, liste) {
  return albumBlattArt(i, liste) === 'figur' ? liste[i - 1] : null;
}
/* Wo liegt die Figur mit dieser Kennung? 0, wenn sie nicht dabei ist —
   dann steht man auf dem Titelblatt und hat nichts kaputt gemacht. */
function albumBlattVon(id, liste) {
  const i = (liste || []).findIndex((f) => f.id === id);
  return i < 0 ? 0 : i + 1;
}
