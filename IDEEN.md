# IDEEN — was VANI noch werden kann

Ein lebendiger Speicher. Was umgesetzt ist, steht mit Version dabei; der Rest
ist sortiert nach Raum und nach dem, was es bringt. Nichts hier ist ein
Versprechen — es ist das, was beim Bauen und beim Benutzen aufgefallen ist.

---

## Welle „Ankommen" (5.9.0) — umgesetzt

- **In die Zwischenablage sichern** (nur Texte oder alles) und **Aus der
  Zwischenablage einlesen** — der Umzug ohne Datei, für verwaltete Schul-iPads.
- Das Einlese-Feld erkennt selbst, was kommt: Sicherung, Kopplungscode,
  „Nur Texte" eines älteren VANI (wird wieder zu Projekten, Heften,
  Schnipseln), WhatsApp-Verlauf (in den Faden, mit Zeiten), Text mit
  Überschriften (Projekt / Heft / Blatt), einfacher Text.
- **Umzugshelfer** in den Feinheiten: drei Wege, Schritt für Schritt, passt sich
  an (altes VANI mit Sync → Kopplungscode; ohne → Zwischenablage; Datei wo erlaubt).
- Die alte Sites-Adresse leitet nicht mehr blind nach fünf Sekunden weiter,
  sondern zählt erst, ob dort noch etwas liegt.
- Jede Ankunft endet mit „Das ist angekommen: 3 Hefte, 41 Seiten, 12.300 Wörter".

## Welle „Goodnotes" (5.9.0) — umgesetzt

- Einfügen repariert: `&#x20;`-Reste, weiche Zeilenumbrüche mitten im Satz,
  Kurzschrift `_kursiv_ *fett* ~durch~` (auch live beim Tippen).
- Absätze sind normale Zeilen; Luft macht man mit einer Leerzeile.
- **Rich-Text überall:** neue Szenen und Blätter sind formatierbar, ältere mit
  einem Tipp auf „Aa" im Schreibraum.
- **Sticker**: handgezeichnet im Stickerblock, durchsichtig, frei drehbar am
  Griff, über den Seitenrand hinaus, in der **Stickerkiste** wiederverwendbar.
- Zettel und Fotos: Drehgriff, dürfen über den Rand.

---

## Was Goodnotes gut macht — und was davon zu VANI passt

Goodnotes ist ein Notizbuch für Stift und Papier. VANI ist ein Zuhause zum
Schreiben. Nicht alles gehört herüber; das hier schon:

| Goodnotes | Für VANI | Stand |
|---|---|---|
| Elemente / Sticker-Sammlung | Stickerkiste | **da** |
| Objekte drehen am Griff | Drehgriff an Zettel, Foto, Sticker | **da** |
| Lasso: Striche auswählen, verschieben, löschen | Lasso im Kritzeln — Striche werden jetzt als Punktfolgen gespeichert (`seite.striche`), greifbar auch nach Tagen | **da (5.11)** |
| Formen begradigen (Linie, Kreis, Pfeil) | „Form halten": am Ende eines Strichs kurz stehen bleiben → Linie / Ellipse / Rechteck | **da (5.11)** |
| Audio-Notiz an der Seite | Tonnotiz (MediaRecorder) als Kassette auf der Seite mit Abspielknopf, bis 5 Min, reist über Sicherung/Sync | **da (5.11)** |
| Seitenvorlagen (Linien, Kästchen, Punkte, Cornell) | Cornell, Storyboard (2×3), Dialogblatt (zwei Spalten) im Heft-Atelier | **da (5.11)** |
| Favoriten / Tabs | Farbige Reiter je Heft (mehrere), als Zungen unter dem Titel, springen zur Seite | **da (5.11)** |
| Gliederung aus Überschriften | Heft: Gliederung aller H1–H3, springt zur Seite und scrollt zur Überschrift; Projekt: Kapitel → Szenen → Überschriften | **da (5.11)** |
| Lasso: Pfeil als Form | Offener Strich mit Haken am Ende → Pfeil mit Spitze | **da (5.14)** |
| Zoom-Schreibfenster | nein — Tastatur ist der Normalfall | — |
| Handschrift durchsuchen | nein — keine Erkennung ohne Netz; Goodnotes-PDFs mit Texterkennung werden ohnehin durchsucht | — |
| Präsentationsmodus / Laserpointer | nein | — |
| Karteikarten | „Abfragen" in jeder Wortkiste: Wort vorn, Notiz hinten, Gewusst/Nochmal, Verfehltes zuerst, rückwärts, Tastatur | **da (5.14)** |

---

## Der Schreibtisch — was er ist, was er werden kann

Umgesetzt (5.15): ein eigener Raum. Fenster zur Nacht mit Sternen und echter
Mondphase, Garten, der sich im Wind wiegt (und im Regen regnet, wenn der
Klangraum Regen spielt), Lampe mit Lichtkegel, siebenarmiger Leuchter mit
Flammen, Manuskripte = letzte Texte, Tintenfass = neues Blatt, Tasse =
Schreibtag, Glas = Funke, Brief an mich = Zeitkapsel, Karteikarten, Lupe,
Bleistiftstummel, Notizbuch = letztes Heft, Schublade, Lesestapel mit
PDF-Lesemodus (pdf.js), Einrichten (Holz, Lampe, Leuchter, Wetter, Verse,
Unordnung).

Weiter gedacht — **umgesetzt in 5.16** (alles Folgende ist da: Tageszeit und
Jahreszeiten hinterm Fenster, Standuhr mit Pendel/Ticken/Glockenschlag, Wachs,
Fotos im Glas, Papierkorb unterm Tisch, zweiter Stuhl = Faden, Randnotizen,
Textsuche, Vorlesen, Lesestatistik, farbige Lesezeichen, Weiterlesen auf dem
Zuhause, Siegelwachs; Lampe mit Zugschnur; die Szene ist jetzt Malerei auf
Canvas mit Regen als Tropfen statt Kachel). Noch offen aus der Liste: EPUB
(eigener Renderer), „Lampe dimmt mit der Kerze" (der Schreibraum liegt ohnehin
darüber). Neue Gedanken:
- **Eine Motte um die Lampe** — selten, nur wenn die Lampe an ist und es Sommer
  ist; sie kreist in Achten und verschwindet wieder.
- **Der Tisch altert mit**: Kratzer und Kleckse wachsen mit den geschriebenen
  Wörtern (aus den Statistiken, tagesstabil gewürfelt).
- **Ein Wetterglas** (Goethe-Barometer) am Fenster: Stand aus dem Klang.
- **Siegel per Stempel**: eigenes Siegelbild dauerhaft als Standard.
- **Tageszeit hinterm Fenster**: Dämmerung ab 17 Uhr, tiefe Nacht ab 22,
  erstes Grau ab 5 — der Schreibtisch bleibt Nachttisch, aber das Fenster weiß,
  wie spät es ist.
- **Die Uhr**: eine alte Standuhr, die tickt (Klang) und die Schreibzeit der
  Session zählt; Glockenschlag zur vollen Stunde, leise.
- **Wachs**: der Leuchter brennt über Wochen wirklich ab (Zustand gespeichert),
  neue Kerzen „aufstecken" als kleines Ritual nach 20 Schreibstunden.
- **Fundstücke im Glas**: eigene Bilder (Fotos) als Fundstück — das Glas zeigt
  jeden Tag ein anderes.
- **Der Papierkorb unterm Tisch**: zerknüllte Blätter = der Papierkorb; ein
  Blatt glätten = wiederherstellen.
- **Ein zweiter Stuhl**: der Faden (Selbstchat) als „Gespräch am Tisch".
- **Schreibtischlampe dimmt mit der Kerze**: brennt ein Sprint, geht die Lampe
  etwas zurück; nur der Text bleibt hell.
- **Lesestapel**: Notizen ins Buch (Randnotizen je Seite, gesynct), Textsuche
  im Buch (pdf.js getTextContent über alle Seiten, mit Treffern), Vorlesen
  aus dem Buch (Textebene → Stimme), Lesestatistik (Seiten pro Abend),
  Lesezeichen mit Farbe, „Weiterlesen, wo ich war" auf dem Zuhause, EPUB
  später (eigener Renderer, kein pdf.js).
- **Siegelwachs**: Brief an mich mit eigenem Siegelbild (Sticker).

## Die nächste große Welle — Brainstorm (nach 5.17) — UMGESETZT in 5.18 (Details: CLAUDE-UEBERNAHME §25)

**Der Schreibtisch als Ort, der lebt**
- Tag/Nacht auch im Raum: bei Tag fällt graues Licht durchs Fenster auf die Platte (weicher Streifen), die Lampe ist dann fast aus; Dämmerung färbt die Kante der Dinge.
- Regen auf der Scheibe mit Brechung (Tropfen, die das Garten-Bild verzerren); Wind, der die Manuskriptecken anhebt; ein Luftzug, wenn die Tür (Leiste) wechselt.
- Der Tisch altert: Kratzer und Kleckse wachsen mit den geschriebenen Wörtern — tagesstabil gewürfelt aus den Statistiken; nach 100 000 Wörtern ein neuer Ring unter der Tasse.
- Geräusche als Raum: Klangbild „Schreibtisch bei Nacht" (Uhrticken, Federkratzen beim Tippen, ferner Wind) mit einem Griff aus dem Klangraum.
- Ein Wetterglas am Fenster, das den Klang anzeigt; eine Katze? nein — aber ein Spinnennetz in der Fensterecke im Herbst.
- Der Stuhl: ein zweites Profil (Cousine) sitzt „gegenüber" — gemeinsamer Faden, sichtbar als zweite Tasse.

**Schreiben vom Tisch aus**
- „Blatt einspannen": ein Blatt liegt wirklich auf dem Tisch und wird dort getippt (kleiner Schreibraum in der Szene), die Lampe schaut zu.
- Die Feder tropft: nach jeder Sitzung ein neuer Tintenfleck an der Stelle, wo der Cursor stand.
- Der Leuchter als Uhr: jede Kerze eine Woche — sieben Kerzen, sieben Tage, die Flamme der heutigen brennt höher.

**Lesen vom Tisch aus**
- Ein Buch liegt aufgeschlagen auf dem Tisch (Doppelseite als Vorschau), Blättern direkt dort.
- Lesen mit Notizen am Rand als Randspalte neben der Seite (nicht nur im Dialog).
- Vorlesen mit Satz-Hervorhebung in der Textebene; Stimme wählbar.
- EPUB: eigener Renderer (Paginierung per CSS columns), Schrift/Größe frei.
- Zitate als Fundstücke auf dem Zuhause; „Lese-Serie" neben der Schreib-Serie.

**Überall**
- Rückgängig-Verlauf je Text (Stände einfrieren automatisch alle 15 Minuten).
- Schreibziel-Kalender als Fensterbrett-Kerzen: ein Teelicht je Tag der Woche, brennt, wenn das Ziel erreicht wurde.
- Tastaturkürzel-Übersicht; Spotlight-Suche mit Vorschau.
- Handy: der Schreibtisch als Hochformat-Fassung (Fenster schmal, Dinge in zwei Reihen).

## Runde 3 (nach 5.24): Was noch niemand bedacht hat

Gedacht in Richtungen, die bisher fehlten — Ohr, Hand, Zeit, Körper, Welt. Sterne = zuerst.

**Hören und Stimme**
- ★ **Diktat, Stufe zwei** (5.24 bringt das Diktat): Stimmbefehle („Streich den letzten Satz",
  „Neue Szene", „Lies mir den Absatz vor"), Diktat in Heften und Zetteln, Diktat im Salon
  als Frage an die Wand, Sprechpausen als Absatzlänge lernen.
- ★ **Das Hörbuch aus dem eigenen Text**: Kapitel nacheinander vorlesen lassen, mit
  Stimme je Figur (Figuren-Kartei → Stimme), Hintergrundklang aus dem Klangraum, als
  „Abendlesung" auf dem Schreibtisch — die Lampe dimmt, das Buch liegt offen, es liest.
- **Eigene Klänge am Tisch**: Tonnotizen als Fundstücke; ein „Geräusch des Tages"; die
  Schreibmaschine mit echten Tastenklängen je Stimmung (leise Feder, alte Olympia, Bleistift).
- **Klangkarte je Text**: ein Blatt merkt sich, welche Mischung beim Schreiben lief, und
  schlägt sie beim Öffnen wieder vor („Damals: Regen am Fenster").
- **Raumklang in den Orten** (5.24: erster Schritt): je Ort ein leiser Grundton (Diele: Uhr,
  Zettelkasten: Café, Korkwand: Kamin) — dazu Geräusche der Handlung (Zettel ziehen,
  Schublade, Nadel in Kork), synthetisch, sehr leise.

**Hand und Körper**
- **Schreibhaltung**: eine sanfte Erinnerung nach 40 Minuten („Aufstehen, Fenster, Wasser"),
  als Figur am Tisch (die Tasse dampft nicht mehr), nie als Alarm.
- **Atmen mit der Kerze**: die Flamme atmet 4–6 im Takt; eine Minute mitatmen vor der Sitzung.
- **Schreiben im Gehen**: Diktat-Modus fürs Handy in der Tasche — Bildschirm aus, nur Mikro,
  Pausen werden Absätze, Ankommen = Text liegt als Blatt da.
- **Handschrift in Hefte** (Kritzeln gibt es): Handschrift erkennen (Apple Scribble hilft schon)
  → aus Kritzelei Text machen, als Option.

**Zeit und Gedächtnis**
- ★ **Das Jahr in Ringen**: ein Jahresring-Bild (wie ein Baumquerschnitt) aus den Schreibtagen —
  dichte Ringe, dünne Ringe, Narben (Lücken), Jahreszeitenfarben; tippen auf einen Ring zeigt
  die Texte des Monats. Als Bild teilbar.
- **Heute vor einem Jahr** am Tisch: ein Blatt liegt auf dem Tisch, das genau heute vor einem
  Jahr geschrieben wurde (Fundstück-Mechanik), mit altem Datum auf dem Papier.
- **Zeitkapsel für Texte**: ein Blatt versiegeln wie den Brief — erst in einem Jahr lesbar.
- **Schreibwetter-Tagebuch**: zu jedem Tag ein Satz (wie war es?), automatisch aus Wörtern,
  Kerzen, Klang, Uhrzeit; als Kalenderblatt; Muster („du schreibst abends bei Regen").

**Welt und andere**
- **Die zweite Tasse, Stufe zwei**: gemeinsamer Schreibtisch — zwei Profile, zwei Tassen,
  gemeinsamer Sprint (beide Kerzen brennen, Wörter zählen getrennt), Briefe über Sync.
- **Lesekreis**: ein Buch im Stapel als „gemeinsam" markieren; Randnotizen beider sichtbar,
  farbig getrennt; „bis Seite 80 bis Sonntag".
- **Briefe an echte Menschen**: Brief schreiben, als Bild mit Siegel teilen (WhatsApp),
  Handschrift-Font, Papier wählbar.
- **Öffentliche Wand**: eigene Zitate/Merksätze als Bild (Rahmen aus dem Salon) exportieren.

**Werkzeug und Tiefe**
- ★ **Stände-Vergleich, Stufe zwei** (5.24 bringt den Wort-Diff): Zeitleiste aller Stände mit
  Wortkurve, „wann habe ich gekürzt?", zwei beliebige Stände wählen, Diff als Bild.
- **Figuren-Stimmen prüfen**: alle Dialogzeilen einer Figur hintereinander (aus Szenen
  gefiltert) — klingt sie gleich? Wortwolke je Figur.
- **Wortwiederholungen** im Text markieren (dreimal „plötzlich" auf einer Seite), Satzlängen-
  Rhythmus als Balken am Rand, Adverb-Zähler (King lässt grüßen) — alles optional, nie Schule.
- **Normseiten und Exposé**: Projekt als Manuskript (Normseiten, Zeichen, Seitenzahl) exportieren;
  Exposé-Ansicht aus den Szenen-Rückseiten.
- **Recherche-Zettel**: Zettel mit Link/Quelle, die in Heften kleben; offline gecacht als Text.

**Schönheit**
- ★ **Salon, Stufe drei** (5.24 malt den Raum): Kamin reagiert auf Klang (Kamin-Ambience = das
  Feuer brennt höher), Gäste kommen abends (die Rahmen leuchten nach 20 Uhr stärker), ein
  Grammophon spielt die Lesung, Sessel tippen = „Setz dich" (Sitzung beginnen im Salon).
- **Orte, Stufe drei**: Zettel wirklich aus dem Kasten ziehen (Animation), Korkwand mit
  Fäden zwischen Szenen, Setzkasten: Wörter als Lettern setzen (Wortkisten), Musikzimmer mit
  Platten = Klangbilder (Nadel aufsetzen startet), Diele mit Jahreszeitendeko.
- **Ein eigenes Thema malen**: Farben aus einem Foto ziehen (Canvas-Mittelwerte) → Thema.
- **Ladebildschirm**: die Lampe geht an, wenn die App startet (kurz, 600 ms).

## Das große Brainstorm (nach 5.22): Der Salon, und wie jeder Raum ein Ort wird

Gedacht wie der Schreibtisch: jeder Bereich soll sich anfühlen wie ein Zimmer,
in dem man sitzen möchte — nicht wie eine Liste. Sterne = zuerst bauen.

### Der Salon (5.22 gebaut) — und was er werden kann
- ★ **Gespräch statt Rat:** „Frag die Wand" — man tippt eine Frage („Mein Anfang
  ist langweilig"), und alle vier antworten nacheinander, jeder in seiner Stimme
  (Treffer über Themen-Schlüsselworte im Baukasten), als Gesprächsrunde mit
  Sprechblasen; Kästner widerspricht King, Rothfuss ergänzt, Funke lacht.
- ★ **Schreibaufgaben von der Wand:** jede Person stellt Übungen in ihrem Stil
  („King: Schreib 300 Wörter über das Geräusch im Keller, kein Adjektiv",
  „Kästner: Ein Gedicht mit vier Strophen über eine Straßenbahn", „Funke:
  Beschreib einen Ort nur über Gerüche", „Rothfuss: Ein Absatz, in dem niemand
  spricht und alles gesagt wird") — mit Timer, Wortziel, am Ende ein Lob in
  ihrer Stimme; die Aufgabe landet als Blatt mit Kopfzeile.
- **Werkbiografie als Zeitleiste:** je Person ein Regalbrett mit ihren Büchern
  (Titel, Jahr, ein Satz) — Cover als gezeichnete Rücken, nicht als Fotos;
  „Welches davon hast du gelesen?" als Häkchen; daraus ein eigenes Regal
  „Meine Lieblinge".
- **Briefe an die Wand:** ich schreibe einem der vier einen Brief (Brief-Mechanik
  vom Tisch); die „Antwort" kommt nach drei Tagen — ein Rat, eingebettet in eine
  kurze fiktive Antwort in der Stimme („Lieber Schreiber, …"), deutlich als
  erfunden markiert.
- **Lesung:** ein Zitat wird vorgelesen (Vorlesen-Funktion) mit gewählter Stimme,
  der Rahmen bekommt währenddessen ein Lampenlicht, die anderen dunkeln.
- **Die Wand wächst:** mehr Rahmen (Astrid Lindgren, Michael Ende, Tove Jansson,
  Terry Pratchett, Ursula K. Le Guin, Walter Moers …) als „Gästezimmer" —
  eigene Leute sowieso (gebaut: Name, Foto, Zitate, eigener Rat).
- **Stimmungen:** Kaminfeuer-Variante der Wand (Klangbild „Salon am Abend":
  Kaminknistern, Uhr, leise Seiten), Tapete wechselbar (Damast, Leinen, Holz).
- **Zitat des Tages auf dem Sperrbild / Ladebildschirm; Zitat-Fundstücke**
  wandern ins Zuhause („EIN ZITAT" gibt es schon).
- **Meine Merksätze:** alles, was ich von der Wand „gemerkt" habe, als eigene
  Sammlung mit Datum; „Was hat mir wann geholfen?".
- **Ein Rat wird Ritual:** „Sitzung beginnen" (siehe unten) zieht zuerst einen
  Rat von der Wand, dann Kerze, Klang, Blatt.

### Jeder Raum ein Ort — visuell
- ★ **Zuhause = Diele:** Garderobe mit der Tasse (Schreibfeuer), ein Spiegel mit
  dem Funken, Briefe auf der Konsole (Fundstücke), Türen zu den Räumen (die
  Leiste bleibt, aber die Diele zeigt, was in jedem Raum neu ist: „im Salon rät
  heute Kästner", „zwei Briefe ungeöffnet", „Lesestand Feuerblut 41 %").
- ★ **Schnipsel = Zettelkasten:** ein hölzerner Kasten mit Karteireitern
  (Tage), die Schnipsel als Zettel, die oben herausragen; Ziehen = sortieren,
  „Kasten schütteln" = drei zufällige Zettel nebeneinander (Funke-Material).
- ★ **Blätter = Stapel auf dem Schreibtisch:** die Blätter liegen als Papierstapel
  mit Eselsohren, das aktuelle oben; „Blatt anheben" zeigt den ersten Absatz als
  Vorschau; Sortieren wie Papiere schieben.
- ★ **Hefte = Regal** (gibt es) → dazu: **Tisch mit Heften aufgeschlagen**, Lesezeichen-
  Bändchen sichtbar, Staub auf lange nicht geöffneten Heften (zart).
- **Projekte = Werkstatt:** Szenen als Karteikarten an einer Korkwand, Fäden
  (Beziehungen) als rote Schnur, Akte als Bretter; der Spannungsbogen als gespannte
  Schnur über der Wand.
- **Cluster = Tisch mit Tuch:** Blasen als Porzellanstücke/Steine auf einem
  Tischtuch, Kanten als Fäden — Pinch bleibt; Nachtmodus mit Kerzenlicht.
- **Wörter = Setzkasten:** die Wortkisten als Druckerei-Setzkasten mit Lettern,
  „Wort ziehen" klappert; die Karteikarten zum Abfragen als Holzkiste.
- **Klang = Musikzimmer:** Plattenspieler (Klangbilder als Platten, Nadel aufsetzen),
  ein Regal mit Hüllen, Mischpult als Messingregler; Fenster zeigt das Wetter der
  Mischung.
- **Faden = Telefonbank im Flur:** das Gespräch auf einer Bank, die Lampe darüber;
  alte Nachrichten als Brief­stapel; „an Vani" als Hörer.
- **Suche = Lupe auf dem Tisch** (ist schon Spotlight) → Treffer als Karten, die
  aus einer Schublade gezogen werden.
- **Feinheiten = Werkzeugkasten:** Schubladen je Bereich (Schrift, Klang, Sync,
  Sicherung); die wichtigsten zwei oben.
- **Überall:** Raumwechsel als Türöffnen (kurzer Schwenk, Luftzug), Tageszeit des
  Schreibtischs färbt leicht alle Räume (Zuhause morgens heller), Jahreszeiten-
  Akzente in der Leiste (Blatt, Schneeflocke), ein Geräusch je Raum (Tür, Papier,
  Glas) — abschaltbar.

### Jeder Raum ein Ort — funktional
- **Zuhause:** „Heute"-Zeile (Wörter, Seiten gelesen, Rat, Brief), Morgenseiten-
  Knopf, „Wo war ich?" (letzte drei Stellen, auch im Buch), Wochenrückblick als
  Postkarte (Sonntag).
- **Schnipsel:** Schnipsel verketten (Faden durch mehrere), Schnipsel → Szene mit
  einem Zug, Sprachaufnahme als Schnipsel (Ton gibt es in Heften), Zeitstempel-Sicht
  („was dachte ich um 23 Uhr").
- **Blätter:** Stände-Diff (zwei Stände nebeneinander), Blatt → Heftseite/Szene
  (gibt es), Wortwolke je Blatt, Lesezeit, Schreibzeit je Blatt (aus Sitzungen).
- **Hefte:** Seitenübersicht-Raster, Doppelseite quer, Lineal, Textsticker,
  Foto freistellen, PDF-Export, Kapitelmarken in der Rolle, Heft-Lesezeichen.
- **Projekte:** Szenenbrett/Zeitleiste, Figuren-Kartei mit Auftritten, Kapitelziele
  mit Kurve, Exposé-Ansicht (alle Szenen-Rückseiten untereinander), Export als
  Manuskript (Normseiten).
- **Cluster:** Gruppen einklappen, Karten in Blasen, Blasen → Szene, Zeitachse als
  Linie, Bild-Vorlagen (Brett als Bild gibt es).
- **Wörter:** Wortherkunft (eigene Notiz), Wort des Tages aus den Kisten, Kisten
  teilen (Bild), Funken-Generator mit eigenen Listen speisen (gibt es teils).
- **Klang:** eigene Aufnahmen schneiden (Anfang/Ende), Timer „in 30 Minuten
  ausblenden", Klang je Raum merken, Mischung als Bild teilen.
- **Faden:** Suchen im Faden mit Datum springen, Faden-Exposé (Monatsrückblick),
  Nachricht als Schnipsel/Blatt (gibt es teils), Fotos im Faden.
- **Schreibtisch:** Stufe drei (siehe unten), „Sitzung beginnen", eigene Dinge.
- **Lesen:** Markieren im PDF, EPUB-Suche/Fußnoten/Wörterbuch, Lesetagebuch,
  Lesezeit-Schätzung, zwei Bücher nebeneinander.
- **Salon:** siehe oben.

## Die übernächste Welle — Brainstorm (nach 5.18)

Gedacht als große Welle in fünf Strängen. Jeder Punkt ist so notiert, dass man ihn
direkt bauen kann; Sterne markieren, was besonders viel bringt.

**A · Schreiben als Ritual und Handwerk**
- ★ „Sitzung beginnen": ein Griff, der alles zusammen tut — Kerze an, Klangbild an,
  Blatt einspannen, Wortziel für heute, Uhr still; am Ende die Bilanz (Wörter, Minuten,
  ein Satz als Fundstück) und die Feder tropft. Am Schreibtisch und im Schreibraum.
- ★ Morgenseiten-Modus: drei Seiten (oder 750 Wörter), kein Zurückscrollen, kein
  Löschen, Timer optional — danach wird der Text weggeschlossen (Brief an mich, öffnet
  sich nach 7 Tagen).
- ★ Stände vergleichen: zwei Stände nebeneinander mit Wort-Diff (eigener Diff, Myers
  auf Wortbasis, pur & testbar); „Was habe ich heute verändert?" als Fundstück.
- Diktat: `webkitSpeechRecognition` (iPad Safari kann es) als „Feder, die hört" —
  Text fließt in das eingespannte Blatt, Satzzeichen per Stimme, Pausen = Absatz.
- Fokus-Tunnel im Schreibraum: nur der aktuelle Absatz scharf, Rest weich; Atem-
  Rhythmus-Linie als leise Pace-Hilfe (Tastenanschläge pro Minute, ohne Zahl).
- Szenenbrett im Projekt: Szenen als Karten auf einer Zeitleiste (Akt/Tag/Ort),
  ziehbar; Spannungsbogen als Kurve aus Wortzahl × Tempo; Farbspuren je Figur.
- Figuren-Kartei: Figur = eigenes Dokument (Name, Stimme, Wunsch, Wunde, Geheimnis),
  Auftritte automatisch aus Szenen (Namens-Treffer), Beziehungen als Faden-Linien.
- Kapitel- und Projektziel mit Kurve (Soll/Ist je Tag), sanft, ohne Schuld.
- „Zweiter Satz": VANI schlägt aus den eigenen Funken den nächsten Satz vor, wenn man
  90 Sekunden nicht tippt (nur auf Wunsch, nur aus eigenem Material, nie KI-Text).
- Lesung: der Text wird im Typewriter-Tempo abgespielt (Prompter) — mit Vorlesen oder
  stumm zum Mitsprechen.

**B · Hefte, Zettel, Hand**
- Seitenübersicht als Raster (Miniaturen), Seiten per Ziehen sortieren, Doppelseite
  im Querformat, Lineal zum Einschnappen.
- Foto freistellen → Sticker (heller Hintergrund durchsichtig), Textsticker in
  Handschrift, Sticker-Sammlung teilen (als Bild).
- Heft als PDF/als Bilder hinausgeben (Druckansicht, Seitenumbrüche, Zettel eingebacken).
- Rolle: „Seite für Seite" als reine Lesespur; Kapitelmarken statt Seiten; Lesezeichen
  im Heft wie im Buch.
- Kritzeln: Farben nachträglich ändern, Linienglättung wählbar, Füller mit Tinte,
  Textmarker hinter Text (multiply), Formen füllen.

**C · Der Schreibtisch, Stufe drei**
- ★ Eigene Dinge auf dem Tisch: ein Bilderrahmen mit eigenem Foto, ein Stein aus dem
  Urlaub (Foto freigestellt als Sticker), der Platz ist frei wählbar (ziehen, Position
  im Einst. gespeichert, „Unordnung" bleibt Zufall).
- ★ Fenster öffnen: ein Tipp auf die Scheibe kippt das Fenster — Klang wird lauter,
  Wind bewegt Papiere stärker, Regen tropft auf die Bank; im Winter Kälte (Atem?).
- Jahreszeiten-Deko: Tannenzweig und Kerze im Dezember, Blüten im April, Kürbis im
  Oktober — automatisch, abschaltbar.
- Der Briefkasten am Fenster: Briefe an die Cousine (über Sync) — sie landen drüben im
  Kasten, mit Siegel, öffnen erst nach dem gewählten Datum.
- Tisch-Stimmungen speichern („Nacht, Regen, Lampe gedämpft") und per Griff wechseln;
  Stimmung folgt der Uhrzeit (Morgenlicht, Abendlicht) — wahlweise.
- Mini-Schreibtisch als Karte auf dem Zuhause (Lampe an/aus, Kerzenstand, Teelichter).
- Die Schublade mit Fächern: Stände, Briefe, Fundstücke, Zitate sortiert; ein Fach für
  „Dinge, die ich nicht vergessen will" (Notizen mit Wiedervorlage-Datum).
- Ein Radio auf dem Tisch: die eigenen Aufnahmen (Tonnotizen) und Klangbilder abspielen.

**D · Lesen, Stufe drei**
- ★ Markieren im PDF: Textmarker und Unterstreichen auf der Textebene (Rechtecke je
  Textstück wie beim Vorlesen), gespeichert je Seite, als Liste „Meine Markierungen"
  mit Sprung; Markierung → Zitat-Schnipsel mit einem Tipp.
- ★ EPUB: Suche im Buch (Kapitel durchlaufen), Fußnoten als Popover, Bilder zoomen,
  Schrift importieren (eigene .ttf per Datei), Wörterbuch-Nachschlag in den eigenen
  Wortkisten („dieses Wort in meine Kiste"), Lesezeit-Schätzung je Kapitel.
- Lesetagebuch: je Buch eine Seite mit Daten, Notizen, Zitaten, Lese-Kurve; „Beendet"
  mit Datum → Regalbrett „Gelesen".
- DOCX/Pages/Markdown hereinholen: der ZIP-Leser kann jetzt auch .docx (document.xml →
  Absätze/Überschriften/Kursiv) — ohne Dateiauswahl über den Koffer oder Zwischenablage.
- Vorlesen: Satz-Markierung auch im EPUB; Tempo per Geste; Einschlaf-Timer.
- Zwei Bücher nebeneinander (Original/Übersetzung oder Buch/Notizheft).

**E · Überall, Technik, Fürsorge**
- ★ Sync-Kopplung per QR-Code (Kamera) statt Code tippen; Gerätenamen; „Was kam neu"
  als Feed auf dem Zuhause; Konfliktanzeige (zwei Stände, einer gewinnt, der andere
  wird eingefroren).
- Export als ZIP-Ordner (eigener ZIP-Writer, stored + optional deflate über
  CompressionStream): Texte als .md, Hefte als .json + Bilder, Bücher ausgenommen.
- Persistenter Suchindex (kv) mit Aktualisierung je Speichern; Spotlight findet auch
  in Büchern (Textebene der zuletzt gelesenen Seiten) und Randnotizen.
- Barrierefreiheit: Dyslexie-freundliche Schrift, globaler Größenregler, Kontrast-
  Thema, Bewegung reduzieren (prefers-reduced-motion respektieren: Schnur, Luftzug,
  Kerzen ruhiger).
- Speicher-Übersicht: was belegt wie viel (Bücher, Bilder, Töne), Aufräumer für
  verwaiste Medien, Miniaturen für Bilder (schnellere Hefte).
- Tastaturkürzel konfigurierbar; Befehle im Spotlight erweiterbar (Klangbilder,
  Stimmungen, „Kerze 20 Minuten").
- Heimlich hübsch: Ladebildschirm mit Jahreszeit; App-Icon-Varianten (iOS erlaubt
  nur eines — aber das Zuhause-Bild darf wechseln).

**Reihenfolge-Vorschlag:** A1 Sitzung + A3 Stände-Diff + D1 Markieren + C1 eigene
Dinge + E1 QR-Kopplung zuerst — sie sind sichtbar, täglich nützlich und bauen auf
Vorhandenem auf; danach B (Hefte) und der Rest.

## Nach Raum

### Hefte
- Lasso im Kritzeln (s. o.); Striche nachträglich umfärben.
- Sticker aus Fotos: Foto freistellen (Hintergrund hell → durchsichtig) → Sticker.
- Textsticker: ein Wort in Handschrift-Font, Farbe frei — für alle ohne Stift.
- Seite als Bild teilen (Zettel, Sticker, Kritzelei eingebacken) — wie „Brett als Bild".
- Heft als PDF hinausgeben (Druckansicht über `window.print` mit Seitenumbrüchen).
- Zwei Seiten nebeneinander auf dem iPad quer (Doppelseite).
- Seiten-Miniaturen als Übersicht (Raster) zum Umsortieren per Ziehen.
- Lineal-Raster zum Ausrichten von Zetteln („einschnappen").

### Projekte
- Gliederung aus Überschriften (s. o.).
- Szenen-Status als Spalte (Kanban: Funke / Entwurf / Steht) — Ziehen zwischen Spalten.
- Zeitleiste: Szenen tragen ein „wann in der Geschichte" → Leiste sortiert danach.
- Figuren-Vorkommen anklickbar: alle Szenen mit der Figur hintereinander lesen.
- Manuskript-Export mit Kapitelzählung in Worten („Erstes Kapitel") als Option.
- Schreibziel je Projekt mit Tagesplan („bis 30. September: 80.000 Wörter → heute 1.100").

### Schreibraum
- Kurzschrift erweitern: `# ` am Zeilenanfang → Überschrift, `- ` → Liste, `> ` → Zitat.
- Vorlesen mit Satz-Hervorhebung (was gerade gelesen wird, leuchtet).
- Schreibmaschinen-Modus auch im Rich-Text (Caret-Zeile mittig halten über `getBoundingClientRect`).
- Zeilenfokus im Rich-Text (Spiegel-Div geht nicht; stattdessen Überlagerung halbtransparent ober- und unterhalb der Caret-Zeile).
- „Nur das Wort zählt": markierte Stelle → Wörter nur dieser Auswahl.
- Diff zweier eingefrorener Stände (was hat sich verändert — Wort für Wort).

### Cluster
- Automatischer Layout-Vorschlag (Kräfte-Simulation) auf Knopfdruck, rückgängig machbar.
- Bilder als Blasen-Hintergrund; Blase → Szene ziehen („Wird Szene in Kapitel 3").
- Brett als Mindmap-Text exportieren (eingerückt).

### Klang
- Klangbild an Tageszeit binden („morgens Vögel, nachts Grillen").
- Sanfter Wechsel zwischen Klangbildern beim Szenenwechsel (Crossfade über 8 s).
- Eigene Aufnahme direkt im Klangraum (Mikrofon → Eigener Klang).
- „Zufallsorte": ein Knopf mischt drei passende Aufnahmen aus einer Kategorie.

### Wörter & Funken
- Wortkisten-Abfrage (Karteikarten).
- Funke mit Timer („5 Minuten zu diesem Satz — los").
- Eigene Funken teilen als Text; Funken-Pakete einlesen (Zwischenablage).

### Suche
- Suche auch in Sticker-/Zettel-Texten und in Rückseiten von Szenen (prüfen, was fehlt).
- „Zuletzt geändert"-Ansicht als Zeitstrahl.

### Sync & Sicherung
- Sicherung per QR in Häppchen? Nein — zu klein. Stattdessen: **Kopplungscode als QR** anzeigen, Kamera-Scan auf dem Handy kopiert ihn.
- Wöchentliche Erinnerung mit Ein-Tipp-Sicherung, wenn kein Bereich gekoppelt ist.
- „Was ist seit der letzten Sicherung neu" — Liste vor dem Sichern.

### iPad / Handy / Desktop
- Tastaturkürzel-Übersicht (⌘/Strg + ?).
- Desktop: Fenstergröße und -lage merken; zwei Fenster (Schreibraum + Brett).
- Handy: Seitenwerkzeuge als unteres Blatt statt oben rechts (Daumen).
- iPad-Stift: Doppeltipp am Pencil → Radierer (über `pointerType` + Apple Pencil Events, wo verfügbar).

### Qualität
- Vertragstests für jede Anlage-Art (Zettel, Foto, Sticker) auf derselben Gesten-Basis.
- Kontrast der Themen prüfen (WCAG AA) — besonders „Kerze".
- Smoke-Test der Desktop-App um Klang- und Sticker-Schritte erweitern.

## Umgesetzt in 5.26 (24. August 2026)
- Orte Stufe vier: jede Kulisse neu gemalt, Dinge reagieren auf Tippen, kleine Bewegungen (abschaltbar),
  Diele mit Detektivmantel, Schlüsselbrett (VW-Bus-Anhänger), Edding-Zeile auf dem Spiegel (eigener Text),
  Kameraspiegel (optional). Blätter als liniertes Papier, Cluster am Küchentisch.
- Die Schreibmaschine auf dem Lesetisch der Hefte — sie schreibt wirklich (Glocke, Wagenrücklauf, Band, Papier, „wie früher").
- Salon: Tolkien, Blyton, Paolini, Twain; alle englischen Stimmen raten englisch, Übersetzung daneben; Setz dich sitzt; mehr Feuer.
- Wortkisten mit gestaltbarem Rand.

## Runde 4 (nach 5.26) — was noch käme
- Schreibmaschine: Durchschlagpapier (Kopie als zweites Blatt), Korrekturband (drei Zeichen zurück, einmal pro Zeile), Tippgeschwindigkeits-Kurve im Feinheiten-Jahr.
- Diele: der Mantel merkt sich das Wetter (Regen → nass, Schnee → Flocken auf den Schultern), die Katze folgt dem Mauszeiger mit den Augen.
- Korkwand: Fotos aus der Mediathek als Polaroids, Kalender zeigt Schreibtage als kleine Kreuze.
- Setzkasten: Andruck als echtes Druckbild (Blatt „Andruck vom …" ablegen).
- Salon: Rat vorlesen in der Originalsprache (Stimme je Sprache), „Briefwechsel" als fortlaufendes Heft.

## Umgesetzt in 5.27 (23. August 2026)
- Die Autoren haben „splitternd" gelesen (Stand 22.08.2026) und sprechen darüber: Werke, Figuren, Orte,
  Begriffe, Lieblingssätze, Fragen an die Autorin — je Stimme eigene Notizen, englische auf Englisch.
- Dazu die lebendige Kenntnis: Was gerade auf dem Gerät liegt, wird selbst ausgewertet (Figuren, Orte,
  Begriffe, Sätze) und beantwortet Fragen mit Belegstellen zum Antippen.
- Katze in der Diele mit echten Geräuschen, Trenchcoat, Spiegel-Hauch; Schreibmaschine repariert.

## Runde 5 (nach 5.27) — was noch käme
- Die Einlesung auffrischen: „Neu einlesen" liest den aktuellen Stand und schreibt eine neue Notiz je Stimme.
- Figurenkarten aus der Kenntnis: eine Person antippen → alle Stellen, alle Begleiter, ein Zeitstrahl.
- Briefwechsel mit einer Stimme über ein bestimmtes Werk („Schreib mir über DREAMER") als fortlaufendes Heft.
- Der Salon merkt sich, worüber schon gesprochen wurde, und knüpft daran an („Letztes Mal ging es um Kay …").
- Zwei Stimmen streiten über eine Figur — Runde mit Widerspruch statt Reihum.

---

## Das Kabinett — was noch in den Schrank könnte (Brainstorm nach 5.45)

Im Kabinett liegen bisher **Der Wandteppich** (Stammbäume) und **Der
Kartentisch** (Stadtpläne). Beide folgen derselben Idee: eine Handvoll
Angaben hineingeben, und VANI rechnet daraus etwas, das aussieht, als
hätte es jemand gestochen. Beide sind Werkzeuge zum *Weltenbau* — nicht
zum Schreiben, sondern zu dem, was neben dem Schreiben liegt.

Das Kabinett ist also der Schrank für alles, was eine erfundene Welt
zusammenhält. Danach sortiert:

### Was aus dem Bestehenden von selbst herausfällt

- **Die Chronik.** Eine Zeitleiste, in die Kalender, Album, Stammbaum und
  Karte alles einliefern, was ein Datum hat: Geburten, Tode, Schlachten,
  „der Brand“, die Gründung der Stadt. Ein Band von links nach rechts, in
  Bahnen — eine je Figur, je Ort, je Haus. Der Wandteppich weiß schon,
  wer wann lebte; die Karte weiß, wie alt die Stadt ist. Was fehlt, ist
  die Achse, auf der beides zusammenkommt. **Das ist der naheliegendste
  nächste Bewohner des Schranks.**

- **Das Wappenbuch.** Die Heraldik steht seit 5.44 im Code — Schraffur,
  Teilungen, vierzehn Bilder, Blasonierung. Bisher rechnet sie Wappen
  aus; ein Wappenbuch ließe sie **entwerfen**: Feld wählen, Teilung,
  Figur, und der Blason schreibt sich mit. Wappen für Häuser, Städte,
  Zünfte, Orden. Ein Bogen mit allen nebeneinander wäre für sich schon
  ein Bild.

- **Der Sprachenschmied.** Erfundene Namen sind in VANI überall gerechnet
  (Gassen, Nachbarorte, Stadtnamen, Häuser) — aber jedes Werkzeug hat
  seine eigenen Silbenlisten. Ein eigenes Fach daraus: Laute festlegen,
  Silbenbau, Endungen für Orte/Personen/Gewässer — und dann liefern die
  anderen Werkzeuge daraus. **Eine Welt klingt erst wie eine Welt, wenn
  alle Namen darin nach derselben Sprache klingen.** Dazu ein kleines
  Wörterbuch, das man selbst füllt.

### Karten, die keine Stadtpläne sind

- **Der Landkartentisch.** Eine Stufe über dem Stadtplan: Küsten,
  Gebirge, Flusssysteme, Wälder, Reiche mit Grenzen, Städte als Punkte.
  Der Kartentisch kann Wasser, Höhenlinien und Randwerk schon — was
  fehlt, ist der Maßstab und die Frage, wie ein Flusslauf entsteht
  (bergab, und er sammelt Nebenflüsse ein). **Die Stadtpläne würden
  darin liegen: auf die Stadt tippen, und der Plan geht auf.**

- **Der Grundriss.** Noch eine Stufe darunter: ein Haus, eine Burg, ein
  Kloster, ein Schiff. Räume, Türen, Treppen, Namen — für die Szene, in
  der jemand durch ein Gebäude läuft und man wissen muss, was wo liegt.
  Räume statt Blöcke, Türen statt Straßen: dieselbe Rechnung, anderer
  Maßstab.

- **Der Sternhimmel.** Sternbilder erfinden, benennen, mit Sagen
  hinterlegen — und ein Kalender, der daran hängt. Für jede Welt, in der
  jemand nach oben schaut.

### Ordnung und Übersicht

- **Der Zeitenlauf einer Figur.** Nicht die ganze Chronik, sondern eine
  Spalte: was diese eine Figur wann tat, wo sie war, wen sie traf.
  Album, Stammbaum und Kalender haben die Bruchstücke bereits.

- **Die Werkstatt der Dinge.** Gegenstände mit Geschichte: das Schwert,
  der Ring, der Brief. Wer hatte es wann, wer gab es weiter, wo liegt es
  jetzt. Im Grunde ein Stammbaum — aber für Sachen statt für Leute, und
  die Fäden heißen anders („ging über an“, „wurde gestohlen von“).
  **Der Wandteppich kann das fast schon; es fehlt nur die eigene Tür.**

- **Der Sprechzettel.** Wer redet wie: Lieblingswörter, Satzlängen,
  Füllwörter, was jemand nie sagt. Beim Schreiben nachschlagbar, damit
  eine Figur über dreihundert Seiten dieselbe Stimme behält.

- **Das Ständebuch.** Wer steht in dieser Welt über wem: Ämter, Zünfte,
  Orden, Titel — und was ein Titel wert ist. Für Geschichten, in denen
  Rang eine Rolle spielt, ist das oft wichtiger als der Stammbaum.

### Was VANI kann, was andere Werkzeuge nicht können

- **Der Widerspruchsprüfer.** VANI hat Album, Kalender, Stammbaum, Karte
  und Text im selben Haus. Ein Fach, das quer über alles nachsieht:
  Jemand ist 1912 gestorben und redet in Kapitel 9 — im Jahr 1915. Die
  Figur ist in zwei Städten gleichzeitig. Ein Kind ist älter als seine
  Mutter. Eine Straße heißt im Text anders als auf der Karte.
  **Das kann kein Schreibprogramm und keine Karten-App: es geht nur,
  wenn alles im selben Haus liegt.** Der Stammbaum hat mit
  „Was auffällt“ den Anfang schon gemacht.

- **Das Fundbuch.** Alles, was man erfunden und wieder vergessen hat:
  Namen, Begriffe, Redensarten, Maße, Feiertage. Nicht als Liste,
  sondern durchsuchbar aus dem Schreibraum heraus — „wie hieß noch mal
  die Münze?“

- **Der Weltenbogen.** Ein einzelnes Blatt, auf dem alles zusammen steht:
  Karte klein, Wappen, die drei wichtigsten Häuser, die Zeitleiste als
  Streifen, ein Spruch. Zum Ausdrucken und an die Wand hängen.
  **Als Geschenk gedacht: das, was man jemandem in die Hand gibt.**

### Kleine Fächer, große Wirkung

- **Der Namenstopf** — Namen auf Vorrat würfeln und beiseitelegen, bis
  eine Figur dazu auftaucht.
- **Die Maße und Münzen** einer Welt: Elle, Meile, Taler, Stunde. Der
  Kartentisch rechnet schon in Schritten; er könnte in *deinen* Maßen
  rechnen.
- **Das Wetterbuch**: Jahreszeiten, Winde, wann der Fluss zufriert.
  Der Schreibtisch kennt Jahreszeit und Tageslicht bereits.
- **Die Fahnen** — wie das Wappenbuch, aber für Banner und Flaggen.
- **Der Reiseplaner**: von hier nach dort, wie lange, worüber. Die Karte
  kann Wegzeiten; über mehrere Karten hinweg wäre es eine Reise.

### Die Reihenfolge, die ich vorschlagen würde

1. **Die Chronik** — sie bindet zusammen, was schon da ist, und wird
   sofort gebraucht.
2. **Der Widerspruchsprüfer** — das, was VANI kann und sonst niemand.
3. **Der Landkartentisch** — die Stadtpläne bekommen ein Land.
4. **Das Wappenbuch** — die Heraldik liegt fertig da und wartet.
5. **Der Sprachenschmied** — er macht alle anderen Werkzeuge besser.

---

## Werkzeuge, nicht Verwaltung — Brainstorm (nach 5.45)

Der Kartentisch und der Wandteppich sind zwei verschiedene **Instrumente**,
keine zwei Karteikästen. Was sie gemeinsam haben, lohnt sich auszusprechen,
weil daran alles Weitere hängt:

- Man gibt wenig hinein und bekommt viel heraus.
- Was herauskommt, ist ein **Gegenstand**, kein Formular — etwas, das man
  anschauen mag, ausdrucken könnte, verschenken würde.
- Es ist ein Stück **aus** der Geschichte, keine Notiz **über** sie.
- Man findet darin etwas, das man nicht hineingelegt hat.
- Es ist gerechnet, nicht gewürfelt: dieselbe Saat, dasselbe Ding.

Danach sortiert gibt es **fünf Arten von Instrument**. Der Kartentisch und
der Wandteppich sind beide von der ersten Art — die anderen vier sind noch
gar nicht besetzt.

---

### I. Instrumente, die eine WELT sichtbar machen

*(Kartentisch und Wandteppich stehen hier.)*

**Die Sternwarte.** — GEBAUT in 5.51. Ein gerechneter Himmel — Sterne nach Helligkeit, die
Ekliptik als Band, alles gestochen wie eine alte Himmelskarte. Und dann
zieht man selbst die Linien: ein Sternbild entsteht dadurch, dass ein
Mensch beschließt, dass zwischen diesen sieben Punkten ein Reiher ist.
Jedes bekommt einen Namen und eine Sage, die man dazuschreibt.

Der eigentliche Trick kommt danach: der Himmel **dreht sich übers Jahr**.
Damit lässt sich fragen, welches Zeichen zur Wintersonnenwende über der
Stadt steht — und wer darunter geboren ist. Das hängt am Kalender, den es
schon gibt, und es macht aus einem Bild ein Werkzeug.

**Das Herbarium.** Erfundene Pflanzen und Tiere, gestochen wie in einem
Naturalienwerk: Umriss, Blatt, Same, Maßstabsleiste. Zu jedem ein Name,
ein Nutzen und ein Aberglaube. Welten leben an solchen Kleinigkeiten —
„das Kraut, das man kaut, wenn man lügt“ ist mehr Weltenbau als drei
Seiten Geschichte eines Königreichs.

**Die Wunderkammer.** Ein Schrank im Schrank: Gegenstände auf Borden,
jeder mit seiner Karte — was es ist, woher es kam, wer es haben will.
Nicht als Liste, sondern als Regal, das man ansieht.

**Das Stundenbuch.** Wie in dieser Welt ein Tag geteilt wird und ein Jahr:
Stunden mit eigenen Namen, Feiertage, Namenstage, wann der Fluss zufriert.
Ein Blatt, aus dem jede Szene ihre Tageszeit und ihren Himmel bekommt.

---

### II. Instrumente, die die FORM einer Geschichte sichtbar machen

Hier ist nichts. Und hier läge das Nützlichste.

**Der Webstuhl.** Die Handlungsstränge als das, was sie heißen: Fäden.
Jeder Nebenstrang eine Farbe, waagerecht über die Kapitel gespannt. Wo
zwei Fäden sich **kreuzen**, ist eine Szene, in der beide Stränge
aufeinandertreffen. Wo ein Faden acht Kapitel lang schlaff hängt, sieht
man es sofort — und genau das sieht man in einem Manuskript sonst nie.

Und weil VANI den Text selbst hat, kann es die Kreuzungen **finden**: wo
zwei Figuren in derselben Szene vorkommen, kreuzen sich ihre Fäden von
allein. Man webt nicht von Hand, man sieht zu, wie das Gewebe entsteht,
und greift ein, wo es dünn wird. Dasselbe Bild wie beim Wandteppich,
angewandt auf die Handlung statt auf die Familie.

**Der Spannungsbogen.** Man zeichnet mit dem Finger die Kurve, die man
sich vorstellt — hier zieht es an, hier atmet es. Darunter legt VANI, was
es am Text wirklich misst: Szenenlänge, Satzlänge, wie viel Rede, wie viel
Beschreibung. **Der Abstand zwischen der gewollten und der gemessenen
Kurve ist die ganze Auskunft.** So etwas gibt es sonst nirgends.

**Die Märchenmaschine.** Propps einunddreißig Funktionen als Karten, die
man in eine Reihe legt: Verbot, Übertretung, Schädigung, Aufbruch, die
Prüfung, der falsche Held, die Entlarvung. Man wählt die Züge, VANI legt
das Gerüst — strukturell tragfähig und vollkommen leer. Gefüllt wird von
Hand. Für ein Märchen im Märchen, für eine Sage, die eine Figur erzählt,
für den Fall, dass die Handlung klemmt.

---

### III. Instrumente, die DINGE aus der Geschichte herstellen

**Die Druckerei.** Ein Steckbrief. Ein Anschlag am Rathaus. Ein
Theaterzettel. Eine Zeitungsspalte. Ein Schiffsverzeichnis. Ein
Ladenschild. Man schreibt den Text — VANI **setzt** ihn: Schriftgrad,
Zierleisten, Holzschnitt-Initiale, das Papier vergilbt, die Falz. Was
herauskommt, hängt man an die Wand, und plötzlich ist die Geschichte ein
Ort, aus dem etwas herausgefallen ist.

**Die Briefmappe.** Briefe in der Hand einer Figur — jede Figur ein
eigenes Papier, eine eigene Tinte, eine eigene Schräge, ein eigenes
Siegel. Und ein Briefwechsel als das, was er ist: zwei Stapel, die
einander antworten, mit Zeit dazwischen.

**Das Totenbuch.** Grabsteine. Zwei Zeilen für ein ganzes Leben — als
Schreibübung so hart wie kaum etwas, als Gegenstand ein Friedhof, durch
den man gehen kann. Der Wandteppich weiß schon, wer wann starb; es fehlt
nur der Stein.

**Das Notenblatt.** Eine Weise aus der Welt: eine Melodielinie in
gestochener Notation, darunter der Text. Man muss dafür nichts von Musik
verstehen — Tongeschlecht und Takt wählen genügt, den plausiblen Rest
rechnet VANI. Balladen tragen Geschichten weiter, und eine Strophe, die
eine Figur singt, ist mehr wert als ein Absatz Erklärung.

---

### IV. Instrumente, die zu Entscheidungen ZWINGEN

**Das Orakel.** Ein Kartendeck, das man selbst baut: jede Karte ein Bild,
ein Name, eine Bedeutung — und eine zweite Bedeutung, wenn sie verkehrt
herum liegt. Dann legt man für eine Szene: *Was steht im Weg. Was hilft.
Was niemand sieht.*

Der Sinn ist nicht Wahrsagerei, sondern Zwang. Ein zufälliger Anstoß aus
**deinen eigenen** Zeichen bricht eine Blockade besser als jeder fremde
Vorschlag, weil er schon zur Geschichte gehört. Dass es dabei ein schöner
Gegenstand ist, macht es erst zum Werkzeug.

**Die Würfeltrommel.** Kein Zufallsgenerator mit fremden Wörtern, sondern
eine Maschine, die man selbst füllt: Schlitze für *Wer? Wo? Was steht im
Weg? Was macht es schlimmer?* — mit den eigenen Figuren, den eigenen
Orten. Dann zieht man am Hebel.

**Der Traumdeuter.** Bilder, die nicht logisch zusammenpassen, sondern
gefühlsmäßig. Für Traumszenen, für das Unbewusste einer Figur, für die
Stelle, an der eine Geschichte kippen muss und man nicht weiß, wohin.

---

### V. Instrumente, die dem eigenen TEXT zuhören

**Die Stimmenprobe.** Denselben Satz drei Figuren in den Mund legen und
nebeneinander sehen. Nicht generiert — **selbst geschrieben**, dreimal,
untereinander. VANI misst danach den Unterschied: Satzlänge, Wortlänge,
Fremdwörter, Füllwörter. Wenn sich die drei Zeilen kaum unterscheiden,
weiß man etwas über sein Buch, das man vorher nicht wusste.

**Das Wortwetter.** Was man in diesem Kapitel oft sagt, ohne es zu
merken. Nicht als Häufigkeitsliste, sondern als Karte über den Text —
wo ein Wort sich ballt, wo es verschwindet. „Nebel“ kommt in Kapitel
drei elfmal vor und danach nie wieder: das ist entweder ein Motiv oder
ein Versehen, und beides muss man wissen.

**Die innere Landkarte.** Das Innenleben einer Figur als Gelände: der
Sumpf der Scham, der Turm des Stolzes, die Furt, die sie nie überquert
hat. Halb Spielerei, halb ernst — und der Kartentisch kann das Zeichnen
längst.

---

### Wenn ich drei bauen dürfte

1. **Der Webstuhl.** Weil er etwas zeigt, was man am Manuskript nicht
   sehen kann, und weil er dasselbe Bild weiterspinnt, das der
   Wandteppich schon trägt.
2. **Die Sternwarte.** Weil sie das Schönste ist und weil das Selberziehen
   der Linien genau die Bewegung ist, um die es bei VANI geht: die Punkte
   rechnet die App, das Sternbild bestimmst du.
3. **Die Druckerei.** Weil sie Dinge zum Anfassen herstellt — und weil ein
   Steckbrief an der Wand mehr über eine Welt sagt als zehn Seiten
   Beschreibung.

---

## Runde 6 (nach 5.50) — die blinden Flecken

Das bisherige Brainstormen war nach **Räumen** und nach **Werkzeugen** sortiert.
Beides ist gut abgegrast. Was hier steht, ist anders sortiert: nach dem, was in
VANI noch gar nicht vorkommt. Nicht „welcher Raum fehlt", sondern „welcher Teil
vom Schreiben fehlt".

Sieben blinde Flecken, und was in jedem davon liegen könnte.

---

### 1. Das Aufhören

VANI kann anfangen und weitermachen. Es kann nicht **fertig werden**. Jedes
Dokument ist ewig offen; nichts wird je abgeschlossen. Das ist eine Lücke, denn
das Schwerste am Schreiben ist nicht der Anfang.

- **Fertig sagen dürfen.** Ein Text bekommt ein Datum „abgeschlossen" und wandert
  in ein eigenes Regal. Nicht gelöscht, nicht archiviert — *fertig*. Mit einem
  Satz dazu: was er geworden ist. Der Unterschied zwischen „liegt herum" und
  „ist zu Ende gebracht" ist der ganze Unterschied.
- **Der Friedhof.** Alles, was aus einem Text herausgestrichen wurde, an einem
  Ort — nach Herkunftstext sortiert. „Kill your darlings" tut weniger weh, wenn
  die Darlings irgendwo liegen. Und man holt erstaunlich oft etwas zurück.
- **Aufgeben ist auch ein Ende.** Ein Text darf „liegengelassen" werden, mit
  Datum und einem Satz warum. Ohne Schuldgefühl, aber sichtbar. Nach einem Jahr
  fragt VANI einmal leise nach — und akzeptiert jede Antwort.
- **Die letzte Fassung.** Ein Text, der fertig ist, wird eingefroren: was danach
  kommt, ist eine neue Fassung, nicht dieselbe. Damit „fertig" etwas bedeutet.

### 2. Der Zustand der Schreibenden

VANI zählt Wörter, Tage, Strähnen. Es weiß nichts darüber, **wie es war**. Und
das ist die Zahl, die zählt: nicht wie viel, sondern wie es sich angefühlt hat.

- **Ein Wort am Ende der Sitzung.** Kein Formular, kein Smiley — ein einziges
  Wort, freiwillig. „zäh". „geflogen". „daneben". Nach drei Monaten hat man eine
  Karte seines Schreibens, die keine Statistik hergibt.
- **Der Widerstand.** Wenn VANI merkt, dass ein Text dreimal geöffnet und ohne
  ein Wort verlassen wurde, fragt es einmal: *„Woran hakt es hier?"* — und legt
  die Antwort als Notiz an den Text. Das ist oft schon die Lösung.
- **Die gute Stunde.** Aus den Zeiten, zu denen wirklich geschrieben wurde,
  errechnet VANI die eigene beste Stunde — und sagt sie einmal. Nicht als
  Ermahnung, als Beobachtung.
- **Was vorher half.** Bei einem festgefahrenen Text: „Beim letzten Mal, als es
  hier stockte, hat dich ein Spaziergang / die Schreibmaschine / ein Sprint
  weitergebracht." VANI weiß das, weil es dabei war.

### 3. Die Leserin

VANI ist vollständig privat — richtig so. Aber geschrieben wird **für jemanden**,
und dieser Jemand kommt im Haus nicht vor.

- **Der leere Stuhl.** Man legt fest, für wen dieser Text ist. Nicht öffentlich,
  nur für sich. Beim Öffnen steht es klein da. Es verändert Sätze.
- **Laut vorlesen.** Ein Modus, der den Text in Vorlesegröße setzt, Zeile für
  Zeile hebt und ein Tempo hält. Nichts liest einen Text so gnadenlos Korrektur
  wie die eigene Stimme.
- **Eine Seite verschenken.** Eine einzelne Seite als schönes Blatt ausgeben —
  gesetzt, mit Rand, mit Datum. Nicht „exportieren": *verschenken*.
- **Die Erstleserin.** Ein Text kann als Abschrift weitergegeben werden, die
  Rückmeldungen als Randnotizen zurücknimmt — ohne Netz, über eine Datei. Für
  genau einen Menschen, dem man vertraut.

### 4. Der Körper

Schreiben ist Handwerk mit einem Körper daran. VANI hat Kerze und Klang — also
Atmosphäre. Aber nichts, was den Menschen davor meint.

- **Die Pause, die wirklich eine ist.** Nicht ein Hinweis, sondern ein Zustand:
  der Bildschirm wird ruhig, ein Satz steht da, sechzig Sekunden laufen. Danach
  kommt man zurück und weiß wieder, wo man war.
- **Die Hand.** Nach langem Tippen ein kurzes Bild: die Hand lockern. Einmal.
  Nicht jeden Tag.
- **Atem als Takt.** Im Sprint kann statt einer Uhr ein sehr langsamer Puls
  laufen — nichts Sichtbares, nur das Licht der Kerze, das mitgeht. Wer im Takt
  bleibt, schreibt ruhiger.
- **Das Aufstehen.** VANI merkt sich, wann zuletzt aufgestanden wurde, und sagt
  es genau einmal pro Sitzung — mit einer Zahl, nicht mit einem Rat.

### 5. Die Sprache selbst

Wörter und Wortkisten gibt es. Aber VANI hört dem Text nicht **zu**.

- **Die Satzlängen als Kurve.** Ein Absatz als Balken: kurz, kurz, kurz, lang.
  Man sieht Monotonie sofort, ohne dass jemand „Stil" sagen muss.
- **Das Lieblingswort.** Welches Wort steht in diesem Text auffällig öfter als in
  allen anderen? Nicht „vermeiden!" — nur: *hier ist es*.
- **Der Klang eines Absatzes.** Vokale als Farbe, Konsonantenhäufungen als
  Rauheit. Ein Absatz bekommt ein kleines Klangbild. Unwissenschaftlich und
  erstaunlich brauchbar.
- **Wiederholte Anfänge.** Fünf Sätze hintereinander, die mit „Sie" anfangen,
  werden still markiert. Nur markiert.
- **Der eigene Wortschatz, wachsend.** Wie viele verschiedene Wörter hat man
  dieses Jahr benutzt, die man letztes Jahr nicht benutzt hat? Das ist eine
  schöne Zahl.

### 6. Das Unfertige, an einem Ort

Alles Angefangene liegt verstreut in Heften, Blättern, Schnipseln, Projekten.
Es gibt keinen Ort, an dem man sieht, **was offen ist**.

- **Die Werkbank.** Eine einzige Ansicht: alles, was angefangen und nicht fertig
  ist, nach „wie nah dran" sortiert. Drei Sätze fehlen? Ganz oben.
- **Der letzte Satz.** Jeder unfertige Text zeigt seinen letzten geschriebenen
  Satz. Das ist der einzige Wiedereinstieg, der wirklich funktioniert.
- **Die offene Frage.** Man darf an jeden Text eine Frage heften: „Warum geht sie
  zurück?" Alle Fragen zusammen sind eine Landkarte des Ungelösten.
- **Was fast fertig ist.** Ein sanfter Hinweis, wenn ein Text seit Monaten bei
  95 % liegt. Einmal. Mit einem Knopf: „heute zu Ende bringen".

### 7. Die Zeit, größer gedacht

Der Kalender kennt die Figuren. Die Jahresringe kennen die Wörter. Aber das
**Schreibleben** kommt nicht vor.

- **Die Chronik des Hauses.** Wann wurde jedes Heft angelegt, jedes Projekt
  begonnen, jede Figur geboren? Eine einzige lange Linie durch alles.
- **Dieses Jahr, ein Blatt.** Am 31. Dezember baut VANI ein einziges schönes
  Blatt: was entstanden ist, was fertig wurde, das häufigste Wort, der beste
  Monat, drei Sätze, die es sich gemerkt hat.
- **Das Wiederlesen.** Ein Text, den man ein Jahr nicht angefasst hat, wird
  einmal vorgeschlagen — nicht zum Weiterschreiben, nur zum Lesen. Man ist ein
  anderer Mensch als beim Schreiben.
- **Die Saat.** Am Anfang eines Jahres ein Satz, was man vorhat. Am Ende steht er
  daneben. Kein Ziel, keine Zahl — ein Satz.

---

### Wenn ich drei bauen dürfte

1. **Der Friedhof** (§1). Er kostet wenig, wirkt sofort, und er nimmt dem
   Streichen die Angst — das ist die häufigste Schreibblockade überhaupt.
2. **Die Werkbank** (§6) mit dem letzten Satz. Das löst das Problem „wo war
   ich?", das jeden Tag neu auftritt.
3. **Ein Wort am Ende der Sitzung** (§2). Eine Zeile Code, ein Feld — und nach
   einem halben Jahr das Interessanteste, was in VANI steht.

Alle drei sind klein. Keins davon braucht einen neuen Raum.
