/* ===================== 62 — DAS ALBUM =====================
   Ein dickes Buch, in dem die Figuren wohnen. Eine Doppelseite für jede.

   Das Prinzip, an dem sich alles ausrichtet: **Nichts muss.** Jedes Feld darf
   leer bleiben. Was leer ist, steht nicht auf der Seite — und man sieht ihm
   auch nicht an, dass es fehlt. Was eingetragen ist, bekommt seine feste
   Form: dieselbe Kategorie sieht auf jeder Seite gleich aus, sonst wäre das
   Buch nach zwanzig Figuren unlesbar.

   Die Seite soll gelebt aussehen, nicht gewürfelt. Deshalb ist jede Schräge
   und jeder Platz aus Figur und Feld *gerechnet* (`albumDreh`), nicht
   gewürfelt: dieselbe Figur sieht bei jedem Aufschlagen genau gleich aus.

   Dieses Modul kennt kein DOM. Es weiß, welche Felder es gibt, was in sie
   hineindarf, wie sie sortiert werden und was einer Figur noch fehlt. */

/* ----- Die Formen, in denen etwas auf der Seite erscheint ----- */
/* zeile   — mit der Hand auf die Seite geschrieben
   zettel  — ein kleiner Papierschnipsel, angeklebt
   etikett — ein Schildchen mit Aufdruck
   karte   — eine Karteikarte mit Kopfzeile
   band    — ein schmales Band quer über die Seite
   wolke   — viele kurze Wörter nebeneinander
   spruch  — in Serifen gesetzt, wie ein Zitat
   liste   — Einträge untereinander, jeder mit Anstrich */

const ALBUM_GRUPPEN = [
  ['kopf', 'Der Kopf der Seite'],
  ['aussehen', 'Wie sie aussieht'],
  ['wesen', 'Was für ein Mensch das ist'],
  ['leben', 'Was ihr geschehen ist'],
  ['stimme', 'Wie sie klingt'],
  ['welt', 'Wo sie hingehört'],
  ['rand', 'An den Rand geschrieben']
];

/* {du} wird durch den Namen der Figur ersetzt, sobald einer dasteht. */
const ALBUM_FELDER = [
  /* ---------- Kopf ---------- */
  { id: 'nennung', gruppe: 'kopf', name: 'Spitzname, Alias', form: 'etikett', mehrfach: true, platz: 'Wie wird {du} noch genannt?', hilfe: 'Alles, was statt des Namens fällt — zärtlich, spöttisch, amtlich.' },
  { id: 'alter', gruppe: 'kopf', name: 'Alter', form: 'etikett', platz: 'Wie alt?' },
  { id: 'geboren', gruppe: 'kopf', name: 'Geboren am', form: 'etikett', art: 'datum', hilfe: 'Wird gleich in den Kalender eingetragen — dort rechnet er dann das Alter mit.' },
  { id: 'gestorben', gruppe: 'kopf', name: 'Gestorben am', form: 'etikett', art: 'datum', hilfe: 'Kommt ebenfalls in den Kalender.' },
  { id: 'geburtsort', gruppe: 'kopf', name: 'Geburtsort', form: 'etikett', platz: 'Wo kam {du} zur Welt?' },
  { id: 'wohnort', gruppe: 'kopf', name: 'Wohnt', form: 'etikett', platz: 'Wo lebt {du} jetzt?' },

  /* ---------- Aussehen ---------- */
  { id: 'statur', gruppe: 'aussehen', name: 'Statur', form: 'zeile', platz: 'Groß, klein, schmal, breit …' },
  { id: 'haare', gruppe: 'aussehen', name: 'Haare', form: 'zeile', platz: 'Farbe, Länge, wie sie liegen' },
  { id: 'augen', gruppe: 'aussehen', name: 'Augen', form: 'zeile', platz: 'Farbe — und wie sie schauen' },
  { id: 'gesicht', gruppe: 'aussehen', name: 'Gesicht', form: 'zeile', platz: 'Was einem zuerst auffällt' },
  { id: 'haut', gruppe: 'aussehen', name: 'Haut', form: 'zeile' },
  { id: 'haende', gruppe: 'aussehen', name: 'Hände', form: 'zeile', platz: 'Hände verraten mehr als Gesichter.' },
  { id: 'narben', gruppe: 'aussehen', name: 'Narben', form: 'liste', mehrfach: true, platz: 'Wo — und woher?' },
  { id: 'muttermale', gruppe: 'aussehen', name: 'Muttermale, Sommersprossen', form: 'zeile' },
  { id: 'zeichnung', gruppe: 'aussehen', name: 'Tätowierungen, Zeichen', form: 'liste', mehrfach: true },
  { id: 'zaehne', gruppe: 'aussehen', name: 'Zähne, Lächeln', form: 'zeile' },
  { id: 'gang', gruppe: 'aussehen', name: 'Gang, Haltung', form: 'zeile', platz: 'Wie {du} sich bewegt' },
  { id: 'kleidung', gruppe: 'aussehen', name: 'Kleidung', form: 'zeile', platz: 'Was {du} trägt — und was nie' },
  { id: 'getragen', gruppe: 'aussehen', name: 'Trägt immer bei sich', form: 'liste', mehrfach: true, platz: 'Was in den Taschen ist', hilfe: 'Drei Gegenstände sagen mehr über einen Menschen als drei Absätze.' },
  { id: 'schmuck', gruppe: 'aussehen', name: 'Schmuck', form: 'zeile' },
  { id: 'geruch', gruppe: 'aussehen', name: 'Riecht nach', form: 'zeile', hilfe: 'Der Geruch ist der schnellste Weg in eine Erinnerung.' },

  /* ---------- Wesen ---------- */
  { id: 'wesen', gruppe: 'wesen', name: 'Wesenszüge', form: 'wolke', mehrfach: true, wortschatz: true, platz: 'Wählen oder eigene schreiben' },
  { id: 'widerspruch', gruppe: 'wesen', name: 'Der Widerspruch', form: 'karte', platz: 'Mutig — und hat Angst vor Fahrstühlen.', hilfe: 'Zwei Dinge, die nicht zusammenpassen und trotzdem beide wahr sind. Daran wird ein Mensch daraus.' },
  { id: 'eigenheit', gruppe: 'wesen', name: 'Eigenheiten', form: 'liste', mehrfach: true, platz: 'Was {du} tut, ohne es zu merken', hilfe: 'Kleine Angewohnheiten, Ticks, wiederkehrende Gesten — davon lebt eine Figur.' },
  { id: 'leidenschaft', gruppe: 'wesen', name: 'Leidenschaften', form: 'wolke', mehrfach: true, platz: 'Wofür {du} brennt' },
  { id: 'angst', gruppe: 'wesen', name: 'Hat Angst vor', form: 'karte', mehrfach: true, platz: 'Wovor?' },
  { id: 'fehler', gruppe: 'wesen', name: 'Größter Fehler', form: 'karte', platz: 'Was {du} immer wieder falsch macht' },
  { id: 'luege', gruppe: 'wesen', name: 'Die Lüge, die sie glaubt', form: 'karte', platz: 'Was {du} über sich für wahr hält — und was nicht stimmt', hilfe: 'Der stärkste Motor einer Figur: eine Überzeugung über sich selbst, die falsch ist.' },
  { id: 'will', gruppe: 'wesen', name: 'Will', form: 'karte', platz: 'Was {du} zu bekommen versucht' },
  { id: 'braucht', gruppe: 'wesen', name: 'Braucht in Wahrheit', form: 'karte', platz: 'Was {du} wirklich fehlt', hilfe: 'Zwischen „will" und „braucht" liegt die ganze Geschichte.' },
  { id: 'bewundert', gruppe: 'wesen', name: 'Bewundert', form: 'liste', mehrfach: true, verweis: true, platz: 'Wen?' },
  { id: 'verachtet', gruppe: 'wesen', name: 'Verachtet', form: 'liste', mehrfach: true, verweis: true },
  { id: 'unbeobachtet', gruppe: 'wesen', name: 'Wenn niemand zusieht', form: 'karte', platz: 'Was {du} allein tut', hilfe: 'Der ehrlichste Ort einer Figur.' },
  { id: 'streit', gruppe: 'wesen', name: 'Im Streit', form: 'zeile', platz: 'Laut, kalt, weinend, witzig?' },
  { id: 'kannnicht', gruppe: 'wesen', name: 'Kann nicht', form: 'zeile', platz: 'Etwas ganz Konkretes: schwimmen, lügen, danke sagen' },
  { id: 'aberglaube', gruppe: 'wesen', name: 'Aberglaube', form: 'zeile' },

  /* ---------- Leben ---------- */
  { id: 'ereignis', gruppe: 'leben', name: 'Wichtig in {du}s Vergangenheit', form: 'liste', mehrfach: true, platz: 'Was ist geschehen?', hilfe: 'Was vor der Geschichte lag und bis heute nachwirkt.' },
  { id: 'wendepunkt', gruppe: 'leben', name: 'Der Wendepunkt', form: 'karte', platz: 'Der Tag, an dem {du} ein anderer wurde' },
  { id: 'spaet', gruppe: 'leben', name: 'Zu spät verstanden', form: 'karte', platz: 'Was {du} erst begriff, als es nichts mehr half' },
  { id: 'geweint', gruppe: 'leben', name: 'Zuletzt geweint, als', form: 'zeile' },
  { id: 'narbe', gruppe: 'leben', name: 'Die Wunde, über die nicht geredet wird', form: 'karte' },
  { id: 'familie', gruppe: 'leben', name: 'Familie', form: 'liste', mehrfach: true, verweis: true, platz: 'Wer gehört dazu?', hilfe: 'Schreib die Verwandtschaft dazu: „Mutter", „Bruder", „Ziehvater". Wer schon im Album steht, wird erkannt.' },
  { id: 'naehe', gruppe: 'leben', name: 'Steht nahe', form: 'liste', mehrfach: true, verweis: true, platz: 'Freunde, Feinde, alles dazwischen' },

  /* ---------- Stimme ---------- */
  { id: 'zitat', gruppe: 'stimme', name: 'Sagt', form: 'spruch', mehrfach: true, platz: 'Ein Satz, wie nur {du} ihn sagt', hilfe: 'So viele du willst. Sie stehen groß und schön auf der Seite.' },
  { id: 'ersteZeile', gruppe: 'stimme', name: 'Die erste Zeile', form: 'spruch', platz: 'Das Erste, was man {du} sagen hört', hilfe: 'Der erste Satz einer Figur ist ihr Versprechen an den Leser.' },
  { id: 'sagtNie', gruppe: 'stimme', name: 'Sagt nie', form: 'karte', platz: 'Ein Wort, ein Satz — der nie über {du}s Lippen kommt' },
  { id: 'stimme', gruppe: 'stimme', name: 'Stimme', form: 'zeile', platz: 'Hoch, rau, leise, zu schnell?' },
  { id: 'redensart', gruppe: 'stimme', name: 'Redensarten', form: 'wolke', mehrfach: true, platz: 'Was {du} ständig sagt' },

  /* ---------- Welt ---------- */
  { id: 'geschichte', gruppe: 'welt', name: 'Kommt vor in', form: 'band', mehrfach: true, platz: 'In welcher Geschichte?', hilfe: 'Frei hineinschreiben — Titel, Arbeitstitel, „das mit dem Deich".' },
  { id: 'rolle', gruppe: 'welt', name: 'Rolle in der Geschichte', form: 'etikett', platz: 'Hauptfigur, Widersacher, die Stimme der Vernunft …' },
  { id: 'ort', gruppe: 'welt', name: 'Ihr Ort', form: 'zeile', platz: 'Wo man {du} suchen würde' },
  { id: 'beruf', gruppe: 'welt', name: 'Tut den ganzen Tag', form: 'zeile', platz: 'Beruf, Handwerk, Beschäftigung' },
  { id: 'jahreszeit', gruppe: 'welt', name: 'Jahreszeit', form: 'etikett', platz: 'Welche Jahreszeit ist {du}?' },
  { id: 'klang', gruppe: 'welt', name: 'Klingt nach', form: 'zeile', platz: 'Ein Geräusch, ein Instrument, ein Lied' },
  { id: 'bleibt', gruppe: 'welt', name: 'Was bleibt, wenn sie geht', form: 'karte', platz: 'Was im Raum zurückbleibt' },

  /* ---------- Rand ---------- */
  { id: 'notiz', gruppe: 'rand', name: 'Notizen', form: 'notizfeld', platz: 'Alles, was sonst nirgends hinpasst.' }
];
const ALBUM_FELD_IDS = ALBUM_FELDER.map((f) => f.id);
function albumFeld(id) { return ALBUM_FELDER.find((f) => f.id === id) || null; }
/* Der Name der Figur steht im Feldnamen, sobald es einen gibt. */
function albumBeschriftung(text, name) {
  const n = String(name || '').trim();
  return String(text || '').replace(/\{du\}/g, n || 'ihr');
}

/* ----- Der Wortschatz für Wesenszüge -----
   Von den geläufigen bis zu den seltenen. Alles wählbar, eigene jederzeit
   dazu. Gruppen nur zum Blättern — beim Suchen zählt die ganze Liste. */
const ALBUM_WESEN = [
  ['warm', 'Warm', ['warmherzig', 'zugewandt', 'herzlich', 'gutmütig', 'sanftmütig', 'zärtlich', 'behutsam', 'fürsorglich', 'nachsichtig', 'langmütig', 'barmherzig', 'großmütig', 'treuherzig', 'arglos', 'gutgläubig', 'anhänglich', 'mitfühlend', 'feinfühlig', 'aufmerksam', 'geduldig', 'versöhnlich', 'gastfreundlich', 'freigebig', 'tröstlich', 'wohlwollend']],
  ['kalt', 'Kühl', ['spröde', 'unterkühlt', 'schroff', 'ruppig', 'abweisend', 'unnahbar', 'menschenscheu', 'wortkarg', 'verschlossen', 'hartherzig', 'unbarmherzig', 'nachtragend', 'kleinlich', 'pedantisch', 'streng', 'unerbittlich', 'schneidend', 'herablassend', 'gleichgültig', 'abgebrüht', 'distanziert', 'reserviert', 'verschwiegen', 'undurchdringlich', 'frostig']],
  ['feuer', 'Feuer', ['aufbrausend', 'jähzornig', 'hitzköpfig', 'ungestüm', 'draufgängerisch', 'waghalsig', 'tollkühn', 'trotzig', 'aufsässig', 'rebellisch', 'streitlustig', 'leidenschaftlich', 'lebenshungrig', 'übermütig', 'unbändig', 'stürmisch', 'ruhelos', 'unstet', 'sprunghaft', 'fahrig', 'hastig', 'getrieben', 'ehrgeizig', 'unnachgiebig', 'kampflustig']],
  ['still', 'Still', ['gelassen', 'bedächtig', 'besonnen', 'ruhig', 'ausgeglichen', 'unaufgeregt', 'still', 'in sich gekehrt', 'nachdenklich', 'grüblerisch', 'schwermütig', 'schwerblütig', 'melancholisch', 'traumverloren', 'selbstvergessen', 'versonnen', 'zurückhaltend', 'bescheiden', 'demütig', 'anspruchslos', 'genügsam', 'andächtig', 'sanft', 'leise', 'friedfertig']],
  ['klug', 'Klug', ['scharfsinnig', 'geistesgegenwärtig', 'schlagfertig', 'wach', 'hellhörig', 'aufgeweckt', 'findig', 'einfallsreich', 'erfinderisch', 'weitsichtig', 'umsichtig', 'lebensklug', 'buchgelehrt', 'belesen', 'wissbegierig', 'neugierig', 'forschend', 'kritisch', 'nüchtern', 'analytisch', 'hintersinnig', 'doppelbödig', 'listig', 'gewitzt', 'altklug']],
  ['dunkel', 'Dunkel', ['verschlagen', 'durchtrieben', 'hinterhältig', 'falsch', 'berechnend', 'skrupellos', 'grausam', 'rachsüchtig', 'neidisch', 'missgünstig', 'eifersüchtig', 'misstrauisch', 'argwöhnisch', 'zynisch', 'bitter', 'verbittert', 'hasserfüllt', 'kaltblütig', 'gefühllos', 'manipulativ', 'heuchlerisch', 'käuflich', 'verlogen', 'niederträchtig', 'abgründig']],
  ['stark', 'Standfest', ['standhaft', 'unbeirrbar', 'beharrlich', 'zäh', 'unverwüstlich', 'aufrecht', 'unbestechlich', 'gerecht', 'verlässlich', 'treu', 'pflichtbewusst', 'gewissenhaft', 'mutig', 'furchtlos', 'tapfer', 'entschlossen', 'zielstrebig', 'diszipliniert', 'ausdauernd', 'belastbar', 'bodenständig', 'sachlich', 'geradlinig', 'wahrhaftig', 'lauter']],
  ['schwach', 'Zerbrechlich', ['zaghaft', 'ängstlich', 'hasenherzig', 'feige', 'schreckhaft', 'unsicher', 'selbstzweifelnd', 'wankelmütig', 'nachgiebig', 'leicht zu kränken', 'empfindlich', 'dünnhäutig', 'zerbrechlich', 'weinerlich', 'anlehnungsbedürftig', 'unentschlossen', 'zögerlich', 'schwankend', 'leicht zu führen', 'überfordert', 'erschöpft', 'ausgebrannt', 'kraftlos', 'verzagt', 'mutlos']],
  ['laut', 'Nach außen', ['redselig', 'geschwätzig', 'gesellig', 'aufgeschlossen', 'kontaktfreudig', 'charmant', 'gewinnend', 'mitreißend', 'unterhaltsam', 'witzig', 'verschmitzt', 'spitzbübisch', 'schelmisch', 'ironisch', 'spöttisch', 'prahlerisch', 'eitel', 'selbstverliebt', 'geltungssüchtig', 'großspurig', 'auftrumpfend', 'raumgreifend', 'anmaßend', 'hochmütig', 'selbstgerecht']],
  ['schräg', 'Verschroben', ['eigenbrötlerisch', 'wunderlich', 'schrullig', 'kauzig', 'verschroben', 'weltfremd', 'zerstreut', 'geistesabwesend', 'versponnen', 'exzentrisch', 'unangepasst', 'eigensinnig', 'störrisch', 'dickköpfig', 'querköpfig', 'unberechenbar', 'launisch', 'wetterfühlig', 'mondsüchtig', 'abergläubisch', 'pedantisch ordentlich', 'sammelwütig', 'umständlich', 'skurril', 'sonderbar']],
  ['koerper', 'Im Körper', ['leichtfüßig', 'tänzerisch', 'geschmeidig', 'fingerfertig', 'geschickt', 'kräftig', 'zäh gebaut', 'schwerfällig', 'ungelenk', 'unbeholfen', 'tollpatschig', 'linkisch', 'breitbeinig', 'katzenhaft', 'kerzengerade', 'gebeugt', 'unruhig in den Händen', 'nie stillsitzend', 'trägen Schrittes', 'sportlich', 'abgehärtet', 'verweichlicht', 'kurzatmig', 'unermüdlich', 'schlafarm']],
  ['sehnsucht', 'Sehnsüchtig', ['heimwehkrank', 'fernwehkrank', 'ruhesuchend', 'liebesbedürftig', 'anerkennungshungrig', 'nachtwach', 'zukunftsblind', 'vergangenheitsverliebt', 'nostalgisch', 'unzufrieden', 'rastlos', 'unbehaust', 'wurzellos', 'sesshaft', 'reiselustig', 'abenteuerlustig', 'gottesfürchtig', 'zweifelnd', 'hoffnungsvoll', 'hoffnungslos', 'schicksalsergeben', 'aufbegehrend', 'lebensmüde', 'lebensgierig', 'wartend']],
  ['moral', 'Im Gewissen', ['grundehrlich', 'aufrichtig', 'prinzipientreu', 'unbeugsam', 'rechtschaffen', 'ehrenhaft', 'wortbrüchig', 'opportunistisch', 'wendehalsig', 'anpassungsfähig', 'bestechlich', 'pflichtvergessen', 'gewissenlos', 'schuldbewusst', 'reumütig', 'unbelehrbar', 'selbstkritisch', 'ausredenreich', 'verantwortungsvoll', 'drückebergerisch', 'solidarisch', 'eigennützig', 'selbstlos', 'aufopfernd', 'berechnend gütig']],
  ['gemuet', 'Im Gemüt', ['heiter', 'sonnig', 'gutgelaunt', 'unbeschwert', 'trübsinnig', 'griesgrämig', 'muffig', 'sauertöpfisch', 'grantig', 'brummig', 'launenhaft', 'wechselhaft', 'gleichmütig', 'stoisch', 'gefasst', 'hochgestimmt', 'niedergeschlagen', 'trübe gestimmt', 'leichtlebig', 'sorglos', 'sorgenvoll', 'zerknirscht', 'gelöst', 'angespannt', 'aufgekratzt']],
  ['umgang', 'Im Umgang', ['höflich', 'zuvorkommend', 'taktvoll', 'feinsinnig', 'grobschlächtig', 'ungehobelt', 'derb', 'flegelhaft', 'förmlich', 'steif', 'ungezwungen', 'salopp', 'vertraulich', 'aufdringlich', 'zudringlich', 'diskret', 'taktlos', 'schlagfertig höflich', 'schweigsam höflich', 'unterwürfig', 'gebieterisch', 'befehlend', 'bittend', 'schmeichlerisch', 'unbestechlich freundlich']],
  ['selten', 'Seltene Wörter', ['hintergründig', 'abgeklärt', 'seelenruhig', 'todernst', 'schalkhaft', 'trotzköpfig', 'wehleidig', 'sanguinisch', 'phlegmatisch', 'cholerisch', 'maulfaul', 'grundgütig', 'urkomisch', 'bitterernst', 'butterweich', 'eisenhart', 'himmelstürmend', 'erdverbunden', 'lichtscheu', 'sonnenhungrig', 'nachtblind vor Angst', 'unbeirrt freundlich', 'liebenswürdig grausam', 'traurig komisch', 'komisch traurig']]
];
const ALBUM_WESEN_ALLE = ALBUM_WESEN.flatMap(([, , w]) => w);

/* ----- Eine Figur ----- */
function saubereAlbumFigur(f) {
  if (!f || typeof f !== 'object') return null;
  const raus = { name: String(f.name || f.titel || '').slice(0, 120).trim(), felder: {}, eigene: [], zettel: [], farbe: '' };
  if (/^#[0-9a-f]{6}$/i.test(String(f.farbe || ''))) raus.farbe = String(f.farbe);
  const quelle = f.felder && typeof f.felder === 'object' ? f.felder : {};
  for (const feld of ALBUM_FELDER) {
    const w = quelle[feld.id];
    if (w == null) continue;
    if (feld.mehrfach) {
      if (!Array.isArray(w)) continue;
      const liste = w.map((x) => String(x == null ? '' : x).slice(0, 600).trim()).filter(Boolean);
      /* keine Doppelten, aber die Reihenfolge bleibt */
      const gesehen = new Set(), sauber = [];
      for (const x of liste) { const k = x.toLowerCase(); if (!gesehen.has(k)) { gesehen.add(k); sauber.push(x); } }
      if (sauber.length) raus.felder[feld.id] = sauber.slice(0, 200);
    } else {
      const s = String(w).slice(0, feld.form === 'notizfeld' ? 20000 : 1200).trim();
      if (s) raus.felder[feld.id] = s;
    }
  }
  /* Eigene Kategorien: Name + Inhalt, alles frei */
  if (Array.isArray(f.eigene)) {
    for (const e of f.eigene.slice(0, 60)) {
      if (!e || typeof e !== 'object') continue;
      const name = String(e.name || '').slice(0, 80).trim();
      const wert = String(e.wert || '').slice(0, 1200).trim();
      if (name && wert) raus.eigene.push({ name, wert, gruppe: ALBUM_GRUPPEN.some(([g]) => g === e.gruppe) ? e.gruppe : 'rand' });
    }
  }
  /* Klebezettel: höchstens fünfzehn */
  if (Array.isArray(f.zettel)) {
    for (const z of f.zettel.slice(0, ALBUM_ZETTEL_MAX)) {
      if (!z || typeof z !== 'object') continue;
      const text = String(z.text || '').slice(0, 400).trim();
      if (!text) continue;
      raus.zettel.push({ text, ton: ALBUM_ZETTELTOENE.includes(z.ton) ? z.ton : ALBUM_ZETTELTOENE[raus.zettel.length % ALBUM_ZETTELTOENE.length] });
    }
  }
  return raus;
}
const ALBUM_ZETTEL_MAX = 15;
const ALBUM_ZETTELTOENE = ['butter', 'rose', 'himmel', 'moos', 'sand'];
/* Die Farben, mit denen eine Figur ihr Band bekommt. */
const ALBUM_FARBEN = ['#a8452f', '#7d5ea7', '#4f7d86', '#7d9a6a', '#b0762f', '#8f4f4a', '#4a5a7d', '#8a6a86', '#7a7d4a', '#6b6f78'];

/* ----- Der Bestand ----- */
function albumFiguren() {
  return [...D.docs.values()].filter((d) => d.typ === 'albumfigur' && !d.geloescht).sort(albumVergleich);
}
/* Alphabetisch, wie im Register — und wer noch keinen Namen hat, kommt zuletzt. */
function albumVergleich(a, b) {
  const na = String((a && a.name) || '').trim(), nb = String((b && b.name) || '').trim();
  if (!na && !nb) return (a.angelegt || 0) - (b.angelegt || 0);
  if (!na) return 1;
  if (!nb) return -1;
  return na.localeCompare(nb, 'de', { sensitivity: 'base' }) || (a.angelegt || 0) - (b.angelegt || 0);
}
/* Nach was gesucht wird: Name zuerst, aber alles zählt. */
function albumSuche(frage, liste) {
  const q = String(frage || '').trim().toLowerCase();
  const alle = liste || albumFiguren();
  if (!q) return alle;
  const punkte = (f) => {
    const name = String(f.name || '').toLowerCase();
    if (name === q) return 4;
    if (name.startsWith(q)) return 3;
    if (name.includes(q)) return 2;
    return albumVolltext(f).includes(q) ? 1 : 0;
  };
  return alle.map((f) => ({ f, p: punkte(f) })).filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || albumVergleich(a.f, b.f)).map((x) => x.f);
}
function albumVolltext(f) {
  const teile = [f.name];
  for (const [, w] of Object.entries(f.felder || {})) teile.push(Array.isArray(w) ? w.join(' ') : w);
  for (const e of f.eigene || []) teile.push(e.name, e.wert);
  for (const z of f.zettel || []) teile.push(z.text);
  return teile.join(' ').toLowerCase();
}
/* Was auf der Seite steht — nur, was wirklich gefüllt ist, in fester Reihenfolge. */
function albumStuecke(f) {
  const raus = [];
  for (const feld of ALBUM_FELDER) {
    const w = (f.felder || {})[feld.id];
    if (w == null) continue;
    if (Array.isArray(w) ? !w.length : !String(w).trim()) continue;
    raus.push({ feld, wert: w });
  }
  /* Aus einer beschaedigten Sicherung kann hier alles Moegliche stehen.
     Was keine Liste von Paaren ist, wird uebergangen statt die Seite zu
     zerlegen. */
  if (Array.isArray(f.eigene)) {
    for (const e of f.eigene) {
      if (!e || typeof e !== 'object' || !e.name || !e.wert) continue;
      raus.push({ feld: { id: 'eigen:' + e.name, gruppe: e.gruppe || 'rand', name: String(e.name), form: 'zeile', eigen: true }, wert: String(e.wert) });
    }
  }
  return raus;
}
function albumZettel(f) { return Array.isArray(f && f.zettel) ? f.zettel.filter((z) => z && typeof z === 'object' && String(z.text || '').trim()) : []; }
function albumIstLeer(f) { return !String(f.name || '').trim() && !albumStuecke(f).length && !albumZettel(f).length; }

/* Wie viel schon dasteht — für den Rücken des Buches und die Übersicht. */
function albumFuelle(f) {
  const moeglich = ALBUM_FELDER.length;
  const da = albumStuecke(f).filter((s) => !s.feld.eigen).length;
  return Math.max(0, Math.min(1, da / Math.max(1, moeglich)));
}
/* Was der Figur noch fehlt — der Impuls, nicht der Vorwurf. */
function albumFehlt(f, zufall) {
  const leer = ALBUM_FELDER.filter((feld) => {
    if (feld.form === 'notizfeld') return false;
    const w = (f.felder || {})[feld.id];
    return w == null || (Array.isArray(w) ? !w.length : !String(w).trim());
  });
  if (!leer.length) return null;
  const i = typeof zufall === 'number' ? zufall % leer.length : Math.floor(Math.random() * leer.length);
  return leer[i];
}

/* ----- Verweise: wer im Album schon steht ----- */
/* Ein Eintrag darf „Mutter — Ilva" heißen. Erkannt wird, was hinter dem
   Gedankenstrich steht oder der ganze Eintrag. */
function albumVerweisName(eintrag) {
  const s = String(eintrag || '').trim();
  const m = /^(.{1,40}?)\s*[—–-]\s*(.+)$/.exec(s);
  return (m ? m[2] : s).trim();
}
function albumVerweisRolle(eintrag) {
  const m = /^(.{1,40}?)\s*[—–-]\s*(.+)$/.exec(String(eintrag || '').trim());
  return m ? m[1].trim() : '';
}
function albumFindeFigur(name, liste) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  return (liste || albumFiguren()).find((f) => String(f.name || '').trim().toLowerCase() === n) || null;
}
/* Alle Verbindungen zwischen Figuren — Grundlage für den Stammbaum später. */
function albumBeziehungen(liste) {
  const alle = liste || albumFiguren();
  const raus = [];
  for (const f of alle) {
    for (const feldId of ['familie', 'naehe', 'bewundert', 'verachtet']) {
      for (const eintrag of (f.felder || {})[feldId] || []) {
        const name = albumVerweisName(eintrag);
        const ziel = albumFindeFigur(name, alle);
        raus.push({ von: f.id, vonName: f.name, art: feldId, rolle: albumVerweisRolle(eintrag), name, zu: ziel ? ziel.id : '' });
      }
    }
  }
  return raus;
}

/* ----- Immer dieselbe Schräge, immer derselbe Platz -----
   Aus Figur und Feld gerechnet: dieselbe Seite sieht bei jedem Aufschlagen
   genau gleich aus. Gewürfelt wäre sie bei jedem Blättern anders — und das
   wäre kein gelebtes Buch, sondern ein zappelndes. */
function albumHash(...teile) {
  let h = 2166136261;
  const s = teile.join('|');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
function albumDreh(figurId, feldId, weite = 1.6) {
  const h = albumHash(figurId, feldId);
  return Math.round(((h % 2000) / 1000 - 1) * weite * 10) / 10;
}
function albumFarbe(f) {
  if (f && /^#[0-9a-f]{6}$/i.test(String(f.farbe || ''))) return f.farbe;
  return ALBUM_FARBEN[albumHash((f && f.id) || '', (f && f.name) || '') % ALBUM_FARBEN.length];
}
/* Der Buchstabe für das Register. */
function albumBuchstabe(f) {
  const n = String((f && f.name) || '').trim();
  if (!n) return '#';
  const c = n[0].toUpperCase();
  return /[A-ZÄÖÜ]/.test(c) ? (({ 'Ä': 'A', 'Ö': 'O', 'Ü': 'U' })[c] || c) : '#';
}
function albumRegister(liste) {
  const raus = [];
  (liste || albumFiguren()).forEach((f, i) => {
    const b = albumBuchstabe(f);
    if (!raus.length || raus[raus.length - 1].buchstabe !== b) raus.push({ buchstabe: b, von: i, anzahl: 0 });
    raus[raus.length - 1].anzahl++;
  });
  return raus;
}

/* ----- Das Alter, wenn ein Geburtsdatum dasteht ----- */
function albumAlterText(f, stichtag) {
  const g = (f.felder || {}).geboren;
  if (!g || typeof kalAlter !== 'function' || !kalGueltig(g)) return '';
  const t = (f.felder || {}).gestorben;
  if (t && kalGueltig(t)) {
    const a = kalAlter(g, t);
    return a ? 'wurde ' + a.jahre + ' Jahre alt' : '';
  }
  const a = kalAlter(g, stichtag || kalHeute());
  return a ? 'heute ' + kalAlterText(a) : '';
}
