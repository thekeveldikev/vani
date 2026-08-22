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
| Lasso: Pfeil als Form | Offener Strich mit Haken am Ende → Pfeil | Welle 3 |
| Zoom-Schreibfenster | nein — Tastatur ist der Normalfall | — |
| Handschrift durchsuchen | nein — keine Erkennung ohne Netz; Goodnotes-PDFs mit Texterkennung werden ohnehin durchsucht | — |
| Präsentationsmodus / Laserpointer | nein | — |
| Karteikarten | Wortkisten sind schon fast das: „Abfragen"-Modus für Wortkisten (Vorderseite Wort, Rückseite Notiz) | Welle 3 |

---

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
