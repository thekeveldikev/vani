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
