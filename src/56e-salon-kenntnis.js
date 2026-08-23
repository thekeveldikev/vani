/* ===================== 56e — DIE KENNTNIS: DIE WAND KENNT DEINE TEXTE =====================
   Alles, was hier steht, wird aus den eigenen Texten auf dem Gerät gewonnen —
   Blätter, Heftseiten, Szenen, Schnipsel — und verlässt es nicht. Pur und ohne
   Wörterbuch: Figuren erkennt die Wand daran, dass sie handeln und sprechen und
   nie einen Artikel vor sich haben; Schauplätze daran, dass man in sie hinein-
   und zu ihnen hingeht; Begriffe daran, dass sie oft und groß dastehen, ohne
   gewöhnlich zu sein. Dazu Sätze, die hängen bleiben, Zahlen, Zeiten. Die
   Stimmen im Salon sprechen aus diesem Wissen (56f), und eine handgeschriebene
   Einlesung (56d) legt Tiefe darunter. */

const KENNTNIS_TYPEN = ['blatt', 'seite', 'szene', 'schnipsel'];
/* Großgeschriebene Wörter, die nie Figuren sind (Satzanfänge, Pronomen, Partikel) */
const KENNTNIS_STOPP = new Set(('Hause Schließlich Scheiße Verdammt Mist Italienisch Deutsch Englisch Französisch Spanisch Russisch Latein Griechisch Sizilianisch Amerikanisch Britisch Zuerst Hast Ist Lass Komm Kann Willst Tut Wirst Bist Sind Hab Habe Haben Mach Machst Geh Gib Sag Sieh Schau Warte Hör Bleib Nimm Halt Weiß Weißt Glaub Glaubst Denk Denkst Meinst Sollst Musst Darfst Wollen Sollen Müssen Dürfen Können Bitte Los Her Hin Weg Raus Rein Rauf Runter Der Die Das Dem Den Des Ein Eine Einem Einen Einer Eines Und Aber Oder Denn Doch Es Sie Er Ich Wir Ihr Du Dann Als Wenn Was Wer Wie Wo Nicht Nur Noch Auch Schon Jetzt Da Dort Hier So Also Mein Meine Dein Deine Sein Seine Ihre Unser Unsere Euer Eure Kein Keine Alles Nichts Man Vielleicht Natürlich Plötzlich Danach Davor Heute Morgen Gestern Ja Nein Nun Mal Weil Dass Ob Bis Seit Nach Vor Bei Mit Ohne Für Gegen Über Unter Zwischen Am Im Um Zu Zum Zur Aus Von An Auf In Ab Sogar Eher Gerade Endlich Immer Nie Niemand Jemand Alle Jeder Jede Jedes Manche Viele Wenige Beide Erst Oh Ach Hm Na Hallo Okay Gut Schön Genau Klar Bitte Danke Warum Wieso Weshalb Woher Wohin Wann Welche Welcher Welches Dieser Diese Dieses Jener Jene Solche Während Obwohl Trotzdem Außerdem Deshalb Darum Daher Sonst Übrigens Allerdings Eigentlich Irgendwann Irgendwo Irgendwie Irgendwas Irgendjemand Ihnen Ihm Ihn Uns Euch Mich Dich Sich Mir Dir Wessen Wem Wen Selbst Zuerst Zuletzt Später Früher Damals Bald Gleich Sofort Manchmal Oft Selten Meistens Wieder Weiter Zurück Los Halt Still Leise Laut Ganz Sehr Fast Kaum Einfach Wirklich Ziemlich Wohl Eben Halt Gar Etwa Sowieso Nämlich Zwar Jedoch Dennoch Hingegen Somit Folglich Ebenso Ebenfalls Außer Statt Trotz Wegen Dank Laut Gemäß Entlang Innerhalb Außerhalb Oberhalb Unterhalb Diesseits Jenseits Zwei Drei Vier Fünf Sechs Sieben Acht Neun Zehn Hundert Tausend Erste Erster Erstes Zweite Zweiter Dritte Letzte Letzter Letztes Nächste Nächster Viel Mehr Weniger Meist Wenigstens Höchstens Mindestens Immerhin Ohnehin Keiner Keines Keinem Keinen Jemanden Niemanden Etwas Irgendetwas Irgendwer Wann Seitdem Sobald Solange Sofern Falls Indem Damit Ehe Bevor Nachdem Seitdem Sodass Obgleich Wenngleich Entweder Weder Noch Sowohl Zumal Zudem Ferner Überdies Allein Bloß Lediglich Freilich Durchaus Keineswegs Vermutlich Wahrscheinlich Vielleicht Offenbar Anscheinend Scheinbar Angeblich Hoffentlich Leider Zum Glück Gott Herr Frau Mama Papa Mutter Vater Oma Opa Tante Onkel Herrn Fräulein Hey Hi Tschüss Wow Okay Ok Ähm Äh Hmm Pst Nein Jein Jawohl Amen').split(' '));
/* Häufige Hauptwörter, die keine Begriffe der Welt sind */
const KENNTNIS_GEWOEHNLICH = new Set(('Leiche Punkt Punkte Mrs Mr Miss Sir Madam Bewegungen Gesichter Kontakt Person Personen Stufen Flecken Ausdruck Erschöpfung Schreie Blitze Quelle Gebäude Unfall Geschwister Cousin Cousine Klamotten Motor Mathe Deutsch Ahnung Jungs Jungen Mädchen Männer Frauen Sohn Tochter Jahren Mühe Situation Fall Fälle Schlag Chance Problem Probleme Zuhause Abstand Möglichkeit Möglichkeiten Hilfe Wange Wangen Freunden Geste Gesten Kiefer Haarsträhne Strähne Jeans Pulli Pullover Shirt Hose Jacke Schuhe Socken Ärmel Kragen Tasche Taschen Brille Uhr Schulter Schultern Stirn Nacken Hals Kinn Lippe Lippen Wimpern Braue Brauen Augenbraue Augenbrauen Faust Fäuste Handgelenk Ellbogen Knie Knöchel Rippen Hüfte Hüften Oberschenkel Zehen Bett Tür Boden Fenster Tisch Stuhl Sofa Wand Decke Lampe Auto Wagen Rucksack Familie Menschen Geld Blick Blicke Stimme Stimmen Worte Wort Satz Sätze Frage Fragen Antwort Antworten Gespräch Gedanke Gedanken Gefühl Gefühle Kopf Herz Atem Körper Haut Haar Haare Hand Hände Arm Arme Bein Beine Fuß Füße Finger Gesicht Auge Augen Mund Nase Ohr Ohren Zähne Zunge Tränen Lächeln Lachen Schrei Schweigen Stille Ruhe Schlaf Traum Träume Nacht Tag Morgen Abend Mittag Woche Monat Jahr Stunde Stunden Minute Minuten Sekunde Sekunden Moment Momente Augenblick Weile Ewigkeit Leben Tod Liebe Angst Wut Trauer Freude Glück Pech Hoffnung Verzweiflung Mut Kraft Schwäche Schmerz Schmerzen Ernst Spaß Witz Unsinn Quatsch Wahrheit Lüge Lügen Geheimnis Geheimnisse Grund Gründe Sinn Zweck Ziel Plan Pläne Idee Ideen Entscheidung Wahl Recht Unrecht Schuld Fehler Weg Wege Richtung Seite Seiten Ecke Rand Mitte Ende Anfang Rest Teil Stück Art Weise Form Menge Zahl Reihe Mal Male Beispiel Sache Sachen Ding Dinge Zeug Kram Lage Zustand Verfassung Laune Stimmung Ton Klang Geräusch Lärm Ruhe Dunkel Dunkelheit Licht Helligkeit Schatten Kälte Wärme Hitze Luft Wind Regen Schnee Sonne Mond Sterne Himmel Erde Boden Wasser Feuer Staub Rauch Nebel Glas Holz Stein Metall Papier Tinte Blut Schweiß Dreck Schmutz Ordnung Chaos Eile Hast Ruhe Pause Ferien Urlaub Wochenende Sonntag Montag Dienstag Mittwoch Donnerstag Freitag Samstag Januar Februar März April Mai Juni Juli August September Oktober November Dezember Frühling Sommer Herbst Winter Weihnachten Ostern Geburtstag Zeit Mal Tag Tage Nacht Nächte Jahr Jahre Stunde Stunden Minute Minuten Sekunde Sekunden Woche Wochen Monat Monate Moment Augenblick Mann Frau Mädchen Junge Kind Kinder Mensch Menschen Leute Mutter Vater Eltern Bruder Schwester Freund Freundin Freunde Hand Hände Kopf Gesicht Augen Auge Mund Lippen Haar Haare Arm Arme Bein Beine Finger Füße Fuß Herz Stimme Blick Lächeln Atem Körper Schulter Schultern Rücken Brust Haut Tür Türen Fenster Wand Wände Zimmer Raum Haus Straße Stadt Weg Boden Decke Tisch Stuhl Bett Küche Flur Treppe Garten Himmel Luft Licht Dunkelheit Schatten Sonne Mond Sterne Wasser Regen Wind Erde Welt Leben Tod Liebe Angst Glück Ruhe Stille Wort Worte Wörter Satz Sätze Frage Fragen Antwort Antworten Gedanke Gedanken Erinnerung Erinnerungen Gefühl Gefühle Idee Ideen Art Weise Seite Seiten Ende Anfang Mitte Nähe Ferne Dinge Ding Sache Sachen Grund Gründe Recht Ordnung Wahrheit Traum Träume Schlaf Morgen Abend Mittag Nachmittag Vormittag Sommer Winter Herbst Frühling Schule Klasse Lehrer Lehrerin Arbeit Geld Buch Bücher Papier Stift Tasche Jacke Mantel Schuhe Kleid Hemd Hose Auto Bus Zug Bahnhof Brief Musik Lied Lieder Name Namen Geschichte Geschichten Teil Stück Ort Orte Platz Raum Stelle Reihe Schritt Schritte Bewegung Richtung Ecke Rand Spur Zeichen Form Farbe Farben Geräusch Geräusche Lärm Wärme Kälte Schnee Feuer Rauch Nebel Staub Glas Holz Stein Eisen Tee Kaffee Brot Essen Wein Bier Wasser Milch Zucker Salz Abend Uhr Zeitung Telefon Handy Bild Bilder Foto Fotos Film Computer Radio Fernseher Lampe Kerze Spiegel Schlüssel Tasche Koffer Kiste Schachtel Dose Flasche Glas Teller Tasse Löffel Messer Gabel Tuch Decke Kissen Laken Schrank Regal Schublade Schreibtisch Bank Sofa Sessel Teppich Vorhang Wand Dach Keller Boden Garten Hof Feld Wald Baum Bäume Blume Blumen Gras Blatt Blätter Ast Äste Wurzel Fluss See Meer Ufer Strand Insel Berg Berge Hügel Tal Wiese Park Dorf Land Länder Straße Gasse Platz Markt Laden Geschäft Kirche Turm Brücke Mauer Zaun Tor Tür Fenster Hoffnung Mut Kraft Macht Wille Sinn Seele Geist Verstand Kopf Gedanke Blick Augen Ohren Nase Zähne Zunge Hals Nacken Bauch Magen Knie Zehen Nägel Wunde Blut Schmerz Schmerzen Tränen Lachen Weinen Schrei Flüstern Gespräch Gespräche Nachricht Brief Zettel Notiz Liste Karte Plan Weg Reise Fahrt Ausflug Besuch Fest Feier Geburtstag Weihnachten Ostern Ferien Urlaub Schule Unterricht Pause Stunde Prüfung Note Noten Hausaufgaben Lehrer Schüler Schülerin Klasse Klassenzimmer Hof Turnhalle Mensa Bibliothek Büro Firma Chef Kollege Kollegin Kunde Kundin Arzt Ärztin Krankenhaus Polizei Polizist Soldat Krieg Frieden Staat Stadt Regierung König Königin Prinz Prinzessin Held Heldin Geschichte Kapitel Szene Seite Zeile Absatz Text Roman Erzählung Gedicht Tagebuch Notizbuch Heft Füller Bleistift Tinte Papier Blatt').split(' '));
const KENNTNIS_ARTIKEL = new Set('der die das dem den des ein eine einem einen einer eines mein meine meinem meinen meiner meines dein deine deinem deinen deiner deines sein seine seinem seinen seiner seines ihr ihre ihrem ihren ihrer ihres unser unsere unserem unseren unserer euer eure eurem euren eurer kein keine keinem keinen keiner keines jede jeder jedes jedem jeden dieser diese dieses diesem diesen jener jene jenes welche welcher welches welchem welchen am im zum zur vom beim ans ins aufs alle aller allen viele vieler vielen manche mancher manchen solche solcher solchen einige einiger einigen wenige weniger wenigen beide beider beiden mehrere mehrerer mehreren andere anderer anderen ganze ganzen halbe halben letzte letzten erste ersten nächste nächsten kleine kleinen große großen alte alten junge jungen neue neuen eigene eigenen ganz derselbe dieselbe dasselbe demselben denselben'.split(' '));
const KENNTNIS_VERBEN = new Set('heißt hieß nennt nannte genannt lächelte grinste wollte will mochte mag liebte liebt hasste hasst kannte kennt traf trifft sagte sagt fragte fragt antwortete antwortet nickte nickt lachte lacht lächelte lächelt seufzte seufzt flüsterte flüstert schrie schreit rief ruft murmelte murmelt grinste grinst schüttelte schüttelt zuckte zuckt sah sieht blickte blickt schaute schaut starrte starrt ging geht kam kommt stand steht saß sitzt lag liegt blieb bleibt drehte dreht wandte wendet hob hebt nahm nimmt griff greift hielt hält ließ lässt dachte denkt wusste weiß fühlte fühlt spürte spürt hörte hört wartete wartet zögerte zögert schwieg schweigt schluckte schluckt atmete atmet hatte hat war ist wollte will konnte kann musste muss sollte soll würde wird wurde meinte meint erwiderte erwidert entgegnete begann beginnt fing fängt zog zieht schob schiebt lief läuft rannte rennt öffnete öffnet schloss schließt setzte setzt legte legt stellte stellt drückte drückt küsste küsst umarmte umarmt weinte weint stöhnte stöhnt knurrte knurrt brummte brummt kicherte kichert schnaubte schnaubt stammelte stammelt zischte zischt bemerkte bemerkt erklärte erklärt versprach verspricht bat bittet befahl befiehlt flehte fleht klagte klagt überlegte überlegt erinnerte erinnert träumte träumt lächelnd lachend sagend hob senkte senkt neigte neigt warf wirft schlug schlägt trat tritt folgte folgt verließ verlässt erreichte erreicht kehrte kehrt betrat betritt blinzelte blinzelt runzelte runzelt räusperte räuspert hustete hustet gähnte gähnt schnappte schnappt tippte tippt klopfte klopft winkte winkt zeigte zeigt deutete deutet wusch wäscht trank trinkt aß isst schlief schläft erwachte erwacht wachte wacht sank sinkt fiel fällt stolperte stolpert sprang springt kletterte klettert tanzte tanzt sang singt summte summt pfiff pfeift schnurrte'.split(' '));
const KENNTNIS_ORTSWORTE = new Set('in nach aus bei vor hinter über unter neben zwischen um durch von zum zur im am ins ans aufs beim vom auf an'.split(' '));
const KENNTNIS_KEIN_ORT = new Set('Schulschluss Unterrichtsschluss Feierabend Mitternacht Sonnenuntergang Sonnenaufgang Brand Erwägung Worten Teufel Händen Bäumen Lebensgefahr Flammen Kante Bettkante Halbdunkel Zigarette Zigaretten Freundschaft Respekt Dunkeln Wellen Anstand Aufruhr Gefahr Sicht Betracht Bezug Not Eile Kraft Gang Schwung Vergessenheit Verlegenheit Versuchung Stimmung Schutz Deckung Begleitung Gesellschaft Anwesenheit Abwesenheit Erfüllung Gedächtnis Einsamkeit Augen Armen Taschen Füßen Knien Ohren Fingern Haaren Zähnen Lippen Falten Tränen Gedanken Träumen Schatten Stücke Stücken Teilen Reihen Kreisen Kreis Schritten Zügen Zug Wut Zorn Trance Ekstase Panik Hektik Trott Takt Rhythmus Tempo Ordnung Ruhe Versehen Wahrheit Gedanken Erinnerung Richtung Nähe Ferne Wirklichkeit Stille Dunkelheit Luft Augen Hand Hände Kopf Herz Zeit Moment Augenblick Mitte Bewegung Stimme Hause Ohnmacht Sicherheit Gefahr Frage Antwort Angst Panik Eile Wut Trauer Freude Liebe Hoffnung Verzweiflung Tränen Lachen Schweigen Schlaf Traum Gedanke Sinn Ende Anfang Wirklichkeit Zukunft Vergangenheit Gegenwart Tat Wort Worte Ohr Ohren Blick Arm Arme Schoß Brust Gesicht Rücken Nacken Haar Haare Finger Tasche Taschen Hals Bauch Knie Mund Lippen Nase Zähne Haut Blut Atem Kehle Magen Art Weise Form Maß Ordnung Farbe Licht Schatten Dunkel Helle Kälte Wärme Hitze Regen Schnee Wind Sonne Wasser Leben Tod Welt Himmel Hölle Gott Glück Unglück Pech Not Sorge Sorgen Zweifel Gewissheit Klarheit Nebel Rauch Staub Schmutz Ruhe Frieden Krieg Streit Wut Zorn Nacht Nächte Tag Tage Morgen Abend Mittag Stunde Stunden Minute Minuten Sekunde Sekunden Jahr Jahre Woche Wochen Monat Monate Mal Male Reihe Zeile Zeilen Seite Seiten Kapitel Schritt Schritten Eile Hast Stille Lage Zustand Gestalt Begriff Begriffe Ernst Spaß Witz Ärger Scherz Trotz Erstaunen Schrecken Schreck Erschrecken Entsetzen Ekel Scham Schuld Sehnsucht Heimweh Fernweh Zweifel Vertrauen Ordnung Bezug Verbindung Beziehung Hinsicht Folge Reichweite Sicht Sichtweite Hörweite Griffweite Erinnerungen Gedächtnis Träumen Wachen Schlafen Gehen Kommen Tun Lassen Fallen Steigen'.split(' '));

/* Sätze trennen: am Satzzeichen, wenn danach Großes oder ein Anführungszeichen kommt. Pur. */
function kenntnisSaetze(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const teile = t.split(/([.!?…]+["“”»«]?)\s+(?=[„"«»A-ZÄÖÜ0-9(])/);
  const aus = [];
  for (let i = 0; i < teile.length; i += 2) { const s = (teile[i] || '') + (teile[i + 1] || ''); if (s.trim()) aus.push(s.trim()); }
  return aus;
}
function kenntnisWoerter(satz) { return String(satz || '').match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß’'\-]*/g) || []; }
function kenntnisWorteZahl(text) { const t = String(text || '').trim(); return t ? t.split(/\s+/).length : 0; }
/* Zu welchem Werk ein Text gehört: Heft, Projekt, sonst die Blätter/Schnipsel. Pur. */
function kenntnisWerkVon(d, docs) {
  if (d.typ === 'seite' || d.typ === 'szene') { const e = d.parent && docs.get ? docs.get(d.parent) : null; if (e && e.titel) return e.titel; }
  if (d.typ === 'blatt') return d.titel ? d.titel : 'Blätter';
  if (d.typ === 'schnipsel') return 'Schnipsel';
  return d.titel || 'Text';
}
/* Die Texte, die zählen: mit Text, nicht gelöscht, in der Reihenfolge ihres Entstehens. Pur. */
function kenntnisTexte(docs) {
  const liste = [];
  for (const d of docs.values()) {
    if (!d || !KENNTNIS_TYPEN.includes(d.typ) || d.geloescht || d.papierkorb) continue;
    const text = String(d.text || '').trim(); if (!text) continue;
    liste.push({ id: d.id, typ: d.typ, titel: d.titel || '', werk: kenntnisWerkVon(d, docs), text, woerter: kenntnisWorteZahl(text), angelegt: d.angelegt || 0, geaendert: d.geaendert || d.angelegt || 0, ord: d.ord || 0 });
  }
  liste.sort((a, b) => (a.angelegt - b.angelegt) || (a.ord - b.ord));
  return liste;
}
/* Signatur: ändert sich, wenn sich die Texte ändern. Pur. */
function kenntnisSignatur(docs) { let n = 0, s = 0; for (const d of docs.values()) { if (d && KENNTNIS_TYPEN.includes(d.typ) && d.text) { n++; s = (s + (d.geaendert || 0) + d.text.length) % 9007199254740000; } } return n + ':' + s; }

/* Das Sammeln: Figuren, Orte, Begriffe, Sätze, Werke, Zahlen. Pur, ohne Wörterbuch. */
function kenntnisSammeln(docs, { statsTage = null, jetzt = Date.now() } = {}) {
  const texte = kenntnisTexte(docs);
  const k = { texte: texte.length, woerter: texte.reduce((n, t) => n + t.woerter, 0), werke: [], figuren: [], orte: [], begriffe: [], saetze: [], zeit: {}, signatur: kenntnisSignatur(docs), leer: !texte.length };
  if (!texte.length) return k;
  /* Werke */
  const werke = new Map();
  for (const t of texte) { const w = werke.get(t.werk) || { name: t.werk, woerter: 0, texte: 0, zuletzt: 0, erster: null }; w.woerter += t.woerter; w.texte++; w.zuletzt = Math.max(w.zuletzt, t.geaendert); if (!w.erster) w.erster = kenntnisSaetze(t.text)[0] || ''; werke.set(t.werk, w); }
  k.werke = [...werke.values()].sort((a, b) => b.woerter - a.woerter);
  /* Durch alle Sätze: Kandidaten zählen */
  const kand = new Map();   /* Wort → { n, score, verbDanach, artikelDavor, genitiv, vokativ, werke:Map, erster, beispiele, begleiter:Map, verben:Map, dialog } */
  const alleSaetze = [];
  const hole = (w) => { let c = kand.get(w); if (!c) { c = { name: w, n: 0, score: 0, werke: new Map(), erster: null, beispiele: [], begleiter: new Map(), verben: new Map(), dialog: 0, ortScore: 0, ortBeispiel: null, gross: 0 }; kand.set(w, c); } return c; };
  const alleTokens = new Set();
  for (const t of texte) {
    const saetze = kenntnisSaetze(t.text);
    for (const satz of saetze) {
      const woerter = kenntnisWoerter(satz);
      if (!woerter.length) continue;
      alleSaetze.push({ text: satz, werk: t.werk, id: t.id, n: woerter.length });
      const grossImSatz = [];
      for (let i = 0; i < woerter.length; i++) {
        const w = woerter[i].replace(/^['’]+|['’]+$/g, ''); if (!w) continue;
        alleTokens.add(w);
        const ist = /^[A-ZÄÖÜ][a-zäöüß’'\-]{1,}$/.test(w);
        if (!ist || KENNTNIS_STOPP.has(w) || w.length < 3) continue;
        const c = hole(w); c.n++; c.gross++;
        if (!c.werke.has(t.werk)) c.werke.set(t.werk, 0); c.werke.set(t.werk, c.werke.get(t.werk) + 1);
        if (!c.erster) c.erster = { werk: t.werk, satz, id: t.id };
        const vor = (woerter[i - 1] || '').toLowerCase(), nach = (woerter[i + 1] || '').toLowerCase(), nachRoh = woerter[i + 1] || '';
        if (KENNTNIS_ARTIKEL.has(vor)) c.score -= 3;
        if (KENNTNIS_VERBEN.has(nach)) { c.score += 2; c.verben.set(nach, (c.verben.get(nach) || 0) + 1); }
        else if (/^[a-zäöüß]{3,}te(n|st)?$/.test(nach) && !KENNTNIS_ARTIKEL.has(nach)) { c.score += 1; c.verben.set(nach, (c.verben.get(nach) || 0) + 1); }
        if (KENNTNIS_VERBEN.has(vor)) c.score += 2;
        if (i === 0 && KENNTNIS_VERBEN.has(nach)) c.score += .5;
        /* Nennung: „Val, …" / „…, Val." */
        const idx = satz.indexOf(w);
        if (idx >= 0) { const danach = satz.slice(idx + w.length, idx + w.length + 2); const davor = satz.slice(Math.max(0, idx - 2), idx); if (/^[,!?]/.test(danach)) c.score += .5; if (/[,„"“]\s?$/.test(davor)) c.score += .5; }
        if (/["„“”]/.test(satz)) c.dialog++;
        /* Orte: nach Ortswörtern */
        if (KENNTNIS_ORTSWORTE.has(vor) || (KENNTNIS_ARTIKEL.has(vor) && KENNTNIS_ORTSWORTE.has((woerter[i - 2] || '').toLowerCase()))) { if (!KENNTNIS_KEIN_ORT.has(w) && !KENNTNIS_GEWOEHNLICH.has(w)) { const ohneArtikel = ['nach', 'in', 'aus', 'durch', 'bei'].includes(vor);   /* „von/über Val" heißt nicht, dass Val ein Ort ist */ c.ortScore += ohneArtikel ? 4 : 1; if (ohneArtikel) c.ortEigen = (c.ortEigen || 0) + 1; if (!c.ortBeispiel) c.ortBeispiel = { werk: t.werk, satz, id: t.id }; } }
        /* Zweiwortnamen: Nicky Wilholm */
        if (/^[A-ZÄÖÜ][a-zäöüß]+$/.test(nachRoh) && !KENNTNIS_STOPP.has(nachRoh) && !KENNTNIS_GEWOEHNLICH.has(nachRoh) && i + 1 < woerter.length && !KENNTNIS_ARTIKEL.has(vor)) { c.score += 1.5; const c2 = hole(nachRoh); c2.score += 1.5; }
        grossImSatz.push(w);
        if (c.beispiele.length < 8 && woerter.length >= 5 && woerter.length <= 34 && !c.beispiele.some((b) => b.werk === t.werk && c.beispiele.length > 2)) c.beispiele.push({ werk: t.werk, satz, id: t.id });
      }
      for (const a of grossImSatz) for (const b of grossImSatz) if (a !== b) { const c = kand.get(a); if (c) c.begleiter.set(b, (c.begleiter.get(b) || 0) + 1); }
    }
  }
  /* Genitiv-Formen: „Vals" zählt für „Val" */
  for (const [w, c] of kand) {
    if (alleTokens.has(w + 's') && !/s$/.test(w)) c.score += 2;
    if (alleTokens.has(w.toLowerCase())) c.score -= 8;   /* „hast/Hast", „ist/Ist": Namen stehen nie klein */
    if (/(isch|lich|ig|sam|bar|los|haft|end|ung|heit|keit|schaft)$/.test(w)) c.score -= 6;
  }
  /* Genitive („Miras" gehört zu „Mira") zählen zur Figur */
  for (const [w, c] of kand) { if (/[^s]s$/.test(w) && kand.has(w.slice(0, -1)) && kand.get(w.slice(0, -1)).n >= c.n) { const b = kand.get(w.slice(0, -1)); b.n += c.n; b.score += c.score > 0 ? 1 : 0; for (const [wk, n] of c.werke) b.werke.set(wk, (b.werke.get(wk) || 0) + n); c.score = -99; c.ortScore = 0; c.n = 0; } }
  /* Figuren: gute Punktzahl, mehrfach da */
  const istOrt = (c) => (c.ortEigen || 0) >= 2 && (c.ortEigen || 0) * 6 >= c.score;
  const figuren = [...kand.values()].filter((c) => c.n >= 2 && c.score >= 3 && !KENNTNIS_GEWOEHNLICH.has(c.name) && !istOrt(c)).sort((a, b) => b.n - a.n);
  const figurNamen = new Set(figuren.map((f) => f.name));
  const mitWerken = (c) => [...c.werke.entries()].sort((a, b) => b[1] - a[1]).map(([w, n]) => ({ name: w, n }));
  k.figuren = figuren.slice(0, 120).map((c) => ({
    name: c.name, n: c.n, score: Math.round(c.score * 10) / 10,
    werke: mitWerken(c), erster: c.erster,
    begleiter: [...c.begleiter.entries()].filter(([b]) => figurNamen.has(b)).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([b, n]) => ({ name: b, n })),
    verben: [...c.verben.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => ({ verb: v, n })),
    dialog: c.dialog, beispiele: c.beispiele.slice(0, 6)
  }));
  /* Orte: Ortspunkte, keine Figuren, nicht zu gewöhnlich */
  k.orte = [...kand.values()].filter((c) => ((c.ortEigen || 0) >= 2 || c.ortScore >= 8) && c.n >= 2 && !figurNamen.has(c.name) && !KENNTNIS_KEIN_ORT.has(c.name) && !KENNTNIS_GEWOEHNLICH.has(c.name) && !alleTokens.has(c.name.toLowerCase())).sort((a, b) => b.ortScore - a.ortScore || b.n - a.n).slice(0, 30).map((c) => ({ name: c.name, n: c.n, ortScore: c.ortScore, werke: mitWerken(c), erster: c.ortBeispiel || c.erster, beispiele: c.beispiele.slice(0, 4), wer: [...c.begleiter.entries()].filter(([b]) => figurNamen.has(b)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([b, n]) => ({ name: b, n })) }));
  const ortNamen = new Set(k.orte.map((o) => o.name));
  /* Begriffe: oft, groß, ungewöhnlich */
  k.begriffe = [...kand.values()].filter((c) => c.n >= 3 && c.name.length >= 4 && !figurNamen.has(c.name) && !ortNamen.has(c.name) && !KENNTNIS_GEWOEHNLICH.has(c.name) && !KENNTNIS_KEIN_ORT.has(c.name) && !KENNTNIS_STOPP.has(c.name) && !alleTokens.has(c.name.toLowerCase()) && !(/s$/.test(c.name) && figurNamen.has(c.name.slice(0, -1))) && c.score > -c.n * 2.5).sort((a, b) => b.n - a.n).slice(0, 40).map((c) => ({ name: c.name, n: c.n, werke: mitWerken(c), erster: c.erster, beispiele: c.beispiele.slice(0, 4) }));
  /* Sätze, die hängen bleiben */
  const bewertet = alleSaetze.filter((s) => s.n >= 5 && s.n <= 26).map((s) => {
    let p = 0; if (figuren.some((f) => s.text.includes(f.name))) p += 2; if (/[—–:;]/.test(s.text)) p += 1; if (s.n >= 7 && s.n <= 16) p += 1; if (/[?!]["“”»]?$/.test(s.text)) p += 1; if (/^[„"“].*[“"”]$/.test(s.text)) p -= 1; if (/\b(nicht|nie|nichts|niemand)\b/.test(s.text)) p += .5; if (/\b(wie|als ob|als wäre)\b/.test(s.text)) p += .5;
    return Object.assign({}, s, { p });
  }).sort((a, b) => b.p - a.p || a.n - b.n);
  const proWerk = new Map(); k.saetze = [];
  for (const s of bewertet) { const c = proWerk.get(s.werk) || 0; if (c >= 12) continue; proWerk.set(s.werk, c + 1); k.saetze.push({ text: s.text, werk: s.werk, id: s.id, p: s.p }); if (k.saetze.length >= 60) break; }
  /* Zeit und Zahlen */
  const erster = texte[0], letzter = texte.slice().sort((a, b) => b.geaendert - a.geaendert)[0], laengster = texte.slice().sort((a, b) => b.woerter - a.woerter)[0];
  const tage = statsTage ? Object.keys(statsTage).filter((d) => statsTage[d] > 0) : [];
  k.zeit = { erster: { werk: erster.werk, titel: erster.titel, wann: erster.angelegt }, letzter: { werk: letzter.werk, titel: letzter.titel, wann: letzter.geaendert }, laengster: { werk: laengster.werk, titel: laengster.titel, woerter: laengster.woerter }, schreibtage: tage.length, seitTagen: erster.angelegt ? Math.max(0, Math.round((jetzt - erster.angelegt) / 86400000)) : 0 };
  return k;
}

/* Eine Frage lesen: Wovon ist die Rede, und was will sie wissen? Pur. */
const KENNTNIS_ABSICHTEN = [
  ['zahl', /wie viele|wieviel|wie oft|anzahl|zähl|wie lang|wie groß|wörter|woerter|statistik/i],
  ['erster', /erste[rn]? satz|ersten satz|anfang von|wie (fängt|beginnt)|beginnt|fängt .* an|eröffnung/i],
  ['stelle', /zeig|stelle|beispiel|zitat|satz mit|wo (steht|kommt)|such|find/i],
  ['wer', /wer ist|wer war|was ist mit|erzähl|was weißt du|was denkst du|was hältst du|wie findest du|kennst du|wie ist|beschreib|charakter|figur/i],
  ['wo', /\bwo\b|schauplatz|schauplätze|spielt|orte|ort\b|wohin|woher/i],
  ['wann', /\bwann\b|zuletzt|gestern|heute|wie lange schon|seit wann|zeit/i],
  ['werke', /welche texte|werke|was hab ich|was habe ich|meine texte|übersicht|alles|gesamt/i],
  ['figuren', /figuren|personen|wer kommt vor|wer spielt|namen|wen gibt/i],
  ['begriffe', /begriff|begriffe|wörter meiner|welche wörter|eigene wörter|vokabel/i],
  ['saetze', /schönste|beste|lieblings|satz|sätze|formulierung/i]
];
function kenntnisFrage(k, frage) {
  const f = String(frage || '').trim(); if (!k || !f) return null;
  const fl = f.toLowerCase();
  const treffer = (liste, art) => { let best = null; for (const e of liste) { if (KENNTNIS_STOPP.has(e.name)) continue; const n = e.name.toLowerCase(); const rx = new RegExp('(^|[^a-zäöüß])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?([^a-zäöüß]|$)', 'i'); if (rx.test(fl)) { if (!best || e.name.length > best.name.length) best = Object.assign({ art }, e); } } return best; };
  const figur = treffer(k.figuren || [], 'figur'), ort = !figur ? treffer(k.orte || [], 'ort') : null, begriff = !figur && !ort ? treffer(k.begriffe || [], 'begriff') : null;
  const werk = (k.werke || []).find((w) => w.name.length > 3 && fl.includes(w.name.toLowerCase())) || null;
  let absicht = null; for (const [id, rx] of KENNTNIS_ABSICHTEN) { if (rx.test(f)) { absicht = id; break; } }
  const wesen = figur || ort || begriff;
  if (!wesen && !werk && !absicht) return null;
  const belege = wesen ? (wesen.beispiele || []).slice(0, 4) : [];
  if (wesen && (absicht === 'stelle' || absicht === 'saetze')) { const mehr = (k.saetze || []).filter((s) => s.text.includes(wesen.name)).slice(0, 4); for (const m of mehr) if (!belege.some((b) => b.satz === m.text)) belege.push({ werk: m.werk, satz: m.text, id: m.id }); }
  return { absicht: absicht || (wesen ? 'wer' : 'werke'), wesen, werk, belege: belege.slice(0, 5), frage: f };
}
