# Übergabe an Codex — Stand VANI 5.41.0 (24. August 2026)

Dieses Dokument fasst zusammen, was seit der letzten Hosting-Übergabe (Sites-Deploy,
Stand um 5.8/5.9) in VANI entstanden ist — knapp genug zum Lesen, genau genug zum
Deployen. Die ausführliche Entwicklergeschichte steht in `CLAUDE-UEBERNAHME.md`
(§17–§30), der Ideenspeicher in `IDEEN.md`.

## 1. Was Codex tun muss

1. `cd hosting && node scripts/copy-vani.mjs` — kopiert `index.html` (Rettungsraum),
   `sw.js`, `manifest.json`, **und die Ordner `klang/`, `sticker/`, `vendor/`, `autoren/`**
   nach `hosting/public/`. Neu seit 5.9: `sticker/` (mitgebrachte Sticker), `vendor/`
   (pdf.js 6.2.108 als `pdf.min.js` + `pdf.worker.min.js` — **müssen `.js` heißen**, nicht
   `.mjs`, sonst liefert Sites `application/octet-stream` und der dynamische Import bricht),
   `vendor/wasm/` (OpenJPEG/JBIG2/QCMS-Decoder, ohne sie bleiben gescannte PDFs weiß),
   `autoren/` (vier Porträts für den Salon, Lizenzen in `autoren/quellen.json`).
2. `node --test hosting/tests/*.test.mjs` — prüft u. a., dass die Rettungsfassung dieselbe
   `APP_VERSION` trägt wie `src/30-core.js` (nicht mehr fest auf `5.1x`).
3. Deployen wie gehabt (ChatGPT Sites). **Nur Codex deployt dorthin**; GitHub Pages
   (`thekeveldikev.github.io/vani`) ist die Haupt-App und wird von hier aus gepusht.
4. **Nicht** anfassen: `buecher/` (verschlüsselter Bücherkoffer, bleibt vorerst im Repo,
   das Passwort steht nirgends), `faden.enc`, alles unter `VANI-privat`.

## 2. Neue Dateien seit 5.9 (Reihenfolge = Build-Reihenfolge in `build.sh` / `werkzeug/build-web.mjs`)

| Datei | Inhalt |
|---|---|
| `src/33-scrollleiste.js` | die Scrollleiste: `scrollleiste(bereich, {ziel, marken, fahne})`, Marken aus Ueberschriften, raeumt sich selbst weg |
| `src/54e-tischblaetter.js` | die drei Blaetter auf dem Tisch: zwei Weisen (VANI waehlt / selbst gewaehlt), Waehler, Einstellung |
| `src/54d-tischzitate.js` | Zitate auf der Tischplatte: vier Weisen, Einritz-Animation, gemessene Verteilung |
| `src/62-album.js` | **das Album**, Rechenwerk: 56 Felder in 7 Gruppen, 400 Wesenswoerter, Sortierung, Suche, Verweise, gerechnete Schraege (kein DOM) |
| `src/62b-album-buch.js` | das Album, sichtbar: Buch im Raum, Aufschlagen, Blaettern um den Falz, Doppelseite, Register |
| `src/62c-album-blatt.js` | das Blatt zur Figur: Eingabe aller Felder, Wortschatz, Klebezettel, Kalender-Kopplung |
| `src/61-kalender.js` | der Kalender, Rechenwerk: Daten 2000-2050, Wochentage, KW, Alter, Widersprueche (ohne DOM) |
| `src/61b-kalender-ansicht.js` | der Kalender, sichtbar: Zeichen, Monat/Jahr/Leben, Eintragfenster, das Buch auf dem Tisch |
| `src/32-sicherheit.js` | **das Sicherheitsnetz**: `sicherSpeichern` (3 Anlaeufe), Rettungskopie, Absturzfang, Wochensicherung, Speicheranzeige, Fenster "Alles sicher" |
| `src/36-caret.js` | Cursor bleibt im Blick (Safari-Tastatur), Seite wird festgehalten |
| `src/43b-sticker.js` … `43e-deckel.js` | Sticker, Kritzel-Lasso/Formen, Tonnotiz, Heft-Umschläge/Regal/Tisch |
| `src/45b-kerze.js` | gemalte Kerze (Schreibraum-Sprint) |
| `src/47b-karteikarten.js` | Karteikarten-Abfrage aus Wortkisten |
| `src/48b-spotlight.js` | ⌘/Strg+K Spotlight, „?" Tastaturkürzel |
| `src/49b-ankommen.js` | Umzug ohne Datei (Zwischenablage, Umzugshelfer) |
| `src/54-schreibtisch.js`, `54b-schreibtisch-malerei.js`, `54c-schreibtisch-leben.js` | der Raum „Schreibtisch": Canvas-Malerei mit echtem Tag/Nacht- und Jahreszeiten-Zyklus, Lampe mit Zugschnur, Leuchter, Uhr, Bücherbord, offenes Buch, Blatt einspannen, Teelichter, Wetterglas |
| `src/55-lesestapel.js`, `55b-epub.js` | Lesestapel (PDF über pdf.js, EPUB über eigenen ZIP-Leser), Lesemodus mit Notizen/Suche/Vorlesen/Randspalte |
| `src/56-salon.js` | der Raum Salon: sechs Porträts (vier Hausherren, zwei Gäste), echte Zitate (Original zuerst), Rat-Generator, Frag die Wand, Schreibaufgaben, Werkregal, Lesung, eigene Leute |
| `src/57-orte.js` | Räume als Orte: Kulissen und Häute je Raum, zuschaltbar (Feinheiten → Orte), Standard aus |
| `src/45c-diktat.js`, `src/56b-salon-malerei.js`, `src/58-sitzung.js` | Diktat (Spracherkennung des Browsers), gemalter Salon (Canvas), Sitzung als Ritual + Wort-Diff für Stände |
| `src/45d-textlupe.js`, `src/59-jahresringe.js` | Textlupe, Klangkarte, Pausenerinnerung; das Jahr in Ringen |
| `src/56a-salon-stimmen.js`, `src/57b-schreibmaschine.js` | Tolkien/Blyton/Paolini/Twain + englischer Rat mit deutscher Parallelfassung; die Schreibmaschine |
| `src/56d-salon-einlesung.js`, `src/56e-salon-kenntnis.js`, `src/56f-salon-gespraech.js`, `src/56g-salon-mehr.js`, `src/56h-salon-lernen.js`, `src/57c-katze.js` | Einlesung (versiegelt, `einlesung/*.enc`), Kenntnis aus den Texten, Gespräch in Stimmen, mehr Themen/Aufgaben, Nachlesen und Chronik, die Katze |
| `src/32-sicherheit.js` | Das Sicherheitsnetz: `sicherSpeichern` mit Wiederholungen, Rettungskopie im localStorage, Absturzprotokoll, wöchentliche Sicherung |
| `src/54d-tischzitate.js`, `src/54e-tischblaetter.js` | Eigene Zitate ins Holz geritzt (gemessene Platzsuche, Schnitzanimation); die drei Blätter auf dem Tisch in zwei Modi (VANI wählt / selbst gewählt) |
| `src/61-kalender.js`, `src/61b-kalender-ansicht.js` | Der Kalender auf dem Schreibtisch: 1600–2050 (gezeigt ab 2000), vier Ansichten, sechzehn gravierte Zeichen, freie Namen ohne Kopplung an Figuren |
| `src/62-album.js`, `src/62b-album-buch.js`, `src/62c-album-blatt.js`, `src/62d-album-mehr.js` | Das Album: Figurendatenbank als Lederbuch. 62 = Kern (63 Felder, 400 Wesenswörter), 62b = das aufgeschlagene Buch, 62c = das Blatt zum Eintragen, 62d = Ordnungen, Geschichten-Filter, Netz, Gegenüberstellung, Fragen |
| `src/63-stammbaum.js`, `63b-stammbaum-teppich.js`, `63c-stammbaum-blatt.js` | Der Wandteppich: ein Stammbaum, in dem Blut nur EINE Fadenart neben vielen ist („hat getötet“, „ist verliebt in“, „weiß nichts von“). Die Blutfäden bauen das Gerüst, alles andere wird als Ranke darüber gespannt und lässt sich einzeln stumm schalten. 63 = Kern (ohne DOM), 63b = der Teppich, 63c = das Blatt zum Eintragen |
| `src/64-kabinett.js` | Das Kabinett: ein Schrank mit Fächern für Werkzeuge, die zu groß sind, um nebenher zu wohnen, und zu selten gebraucht für einen eigenen Platz in der Leiste. Ein neues Werkzeug einzuhängen ist ein Eintrag in `KABINETT_FAECHER` — Kachel, Öffnen, Rücken und Zählen macht der Schrank |
| `vendor/pdf.min.js`, `vendor/pdf.worker.min.js`, `vendor/wasm/*` | pdf.js 6.2.108 + Decoder (Lizenzen liegen daneben) |
| `autoren/*.jpg`, `autoren/quellen.json` | Porträts King/Kästner/Funke/Rothfuss (Wikimedia Commons, CC BY-SA 4.0 / CC0 / CC BY-SA 3.0 / CC BY-SA 3.0) |
| `werkzeug/buecherkoffer.mjs`, `buecher/` | Bücherkoffer (AES-256-GCM, PBKDF2); nimmt PDF und EPUB |
| `CLAUDE-UEBERNAHME.md` §17–§30, `IDEEN.md`, `INSTALLATION-UND-UPDATES.md` | Doku |

## 3. Was sich für Nutzerinnen geändert hat (Kurzfassung je Version)

- **5.9** Ankommen ohne Datei: Sicherung in die Zwischenablage, Einlesen daraus, Umzugshelfer,
  Auto-Erkennung (WhatsApp/Markdown/VANI-Text); Goodnotes-Einfüge-Reparaturen; Rich-Text überall;
  Sticker (+ mitgebrachtes „Schmu!").
- **5.10–5.12** Formatierung wird zuverlässig gespeichert; gemalte Kerze; Kritzeln mit Lasso/Formen/
  gespeicherten Strichen; Tonnotiz; Reiter; Gliederung; Papiervorlagen; Umschlag-Atelier; Hefte als
  Karten/Regal/Tisch.
- **5.13–5.14** Sync zeichnet nicht mehr beim Tippen (Wurzel vieler Springer); stilles Weiterreichen
  auf vollen Seiten; Karteikarten; Atelier als Fenster.
- **5.15–5.17** Schreibtisch als eigener Raum (Canvas), Lesestapel mit Lesemodus, Bücherkoffer,
  Lampe frei ziehbar, Bücherbord, echte Cover per ISBN.
- **5.18** Tisch lebt (Alter, Kleckse, Leuchter-Woche, Teelichter, Wetterglas, offenes Buch, Blatt
  einspannen), EPUB-Leser, Spotlight, automatische Stände, Randspalte, Vorlesen mit Markierung;
  großes Bugfixing (u. a. Schreibtisch-Einstellungen überlebten den Neustart nicht, Sync-Nachzug).
- **5.18.1/5.18.2** Bücher links greifbar, Rolle als Textblock, Tisch bleibt bei Sync stehen.
- **5.19** Der große Tipp-Fehler: `autogrow` kappte die Scrollposition (Springen), Safari schob
  die Seite (leere Fläche) → `36-caret.js` + `body{position:fixed}`.
- **5.20** Rolle/Am Stück als eine Seite (Werkzeuge einmal, Papier auf dem Bogen), Seitenfüllung,
  gezeichnetes Schreibfeuer.
- **5.21** Tag/Nacht-Zyklus am Schreibtisch (Sonne, Wolken, Vögel, Jahreszeiten, Sonnenbalken),
  Feuerblut lesbar (WASM-Decoder), `:focus-visible`-Rahmen auf Textfeldern aus.
- **5.22** Der Salon (Lieblingswand) + Karte „Aus dem Salon" auf dem Zuhause; Brainstorm in
  `IDEEN.md` („Das große Brainstorm").
- **5.23** Salon Stufe zwei (Runde, Aufgaben, Werkregal, Lesung, Gäste Pratchett/Lindgren) und
  Räume als Orte (Kulissen je Raum, zuschaltbar, Standard aus). `autoren/` hat jetzt sechs Fotos.
- **5.24** Gemalter Salon mit Kamin und Wandleuchtern + „Salon am Abend"-Klang, Sitzung beginnen (Ritual mit
  Bilanz), Diktat, Wort-Vergleich der Stände, Raumklang in den Orten; Brainstorm Runde 3.
- **5.25** Salon als Zimmer (Konsole, „Setz dich", Briefe an die Wand mit Antwort), Orte Stufe drei, Jahresringe,
  Textlupe, Klangkarte je Text, Pause nach 40 Minuten, Atemminute, „Heute vor einem Jahr" auf dem Tisch.
- **5.26** Orte Stufe vier (Details, Tipp-Reaktionen, Bewegung, Spiegelzeile, Kameraspiegel), Schreibmaschine,
  vier Stimmen mehr im Salon, englischer Rat mit Übersetzung, „Setz dich" auf dem Sessel, Wortkisten-Rand.
- **Werkzeug** `node werkzeug/einlesung-versiegeln.mjs [Passwort]` macht aus `einlesung/einlesung.json` (lokal, ignoriert)
  die versiegelte `einlesung/einlesung.enc` plus `umschlag.json`. Ohne Passwort ist im Repo nur Rauschen.
- **5.27** Der Salon liest mit: Einlesung („splitternd", Stand 22.08.2026), Kenntnis aus den eigenen Texten, Gespräch
  in Stimmen, Reiter „Deine Welten"; Katze mit echten Geräuschen, Schreibmaschine entklemmt, Salonklang aus.
- **5.28** Das Sicherheitsnetz (`src/32-sicherheit.js`): jedes Speichern wird wiederholt, eine Rettungskopie liegt im localStorage, Abstürze landen in einem Protokoll, einmal die Woche erinnert VANI an die Sicherung. Dazu ein schwerer Fund: `loesche()` leerte das Dokument, BEVOR der Papierkorb es angenommen hatte — nimmt der Papierkorb nichts an, wird jetzt auch nichts gelöscht.
- **5.29** Salon: John Green mit Zitaten, Rat, Werkregal und Porträt. Schreibtisch: eigene Zitate ins Holz ritzen (drei Modi), die drei Blätter wahlweise selbst gewählt. Die smarte Scrollleiste.
- **5.30** Der springende Cursor: `caretRechteck()` misst ohne DOM-Eingriff (kein `normalize()` mehr im ganzen `src/`), das Zentrieren ist entprellt, Kompositionen (Autokorrektur, Diktat) werden abgewartet. Diktat nach der iOS-Wahrheit gebaut: `continuous` wird dort ignoriert, deshalb zählt VANI die verbrauchten Teilergebnisse je Sitzung mit, statt Text doppelt einzusetzen.
- **5.31** Der Kalender auf dem Schreibtisch. Frei eintragbar, ausdrücklich NICHT an Figuren und Texte gekoppelt: `termin.leute[].name` ist freier Text, `id` bleibt leer. Vier Ansichten, gravierte Zeichen statt Emoji.
- **5.32** Das Album als eigener Raum: ein Lederbuch, eine Doppelseite je Figur, 63 Felder, 400 Wesenswörter, fünfzehn Klebezettel, alles darf leer bleiben und steht dann nicht auf der Seite.
- **5.33** Album, zweite Ausbaustufe: Zitate ohne Beiwerk, der Seitenfuß liegt im Fluss statt aufgelegt, Bildnisse standardmäßig AUS (`D.einst.albumBildnis`, Feinheiten → Album) — ein Gesicht festzulegen nimmt einem etwas weg.
- **5.34** Album, dritte Ausbaustufe: Titelblatt mit Verzeichnis, Blattstapel an den Außenkanten, Lesebändchen, Klebezettel fest auf der linken Seite, sechs Ordnungen, Geschichten-Filter, das Netz, zwei Figuren nebeneinander, Abschreiben, siebzig Fragen an die Figur. Der Kalender reicht jetzt bis **1600** zurück (gezeigt ab 2000), damit eine Figur von 1783 ein richtiges Alter bekommt.
- **5.35** Deutsch. Ohne Namen stand im Album „Wo kam ihr zur Welt?“ — kein deutscher Satz. `albumBeschriftung`
  setzt jetzt „die Figur“ ein, und wo das nicht passt (Dativ, Genitiv), steht der ganze Satz hinter einem
  senkrechten Strich noch einmal: `'Was {du} wirklich fehlt | Was der Figur wirklich fehlt'`. Dazu zwei neue
  Helfer im Kern: `zaehl(n, einzahl, mehrzahl, eins)` gegen „1 Wörter“ und `genitiv(name)` gegen „Hanss Stimme“.
  `klugeZeichen` schließt endlich mit „ statt mit einem geraden Strich; 526 Anführungszeichen in den Quelltexten
  nachgezogen (Zeilen mit regulären Ausdrücken bleiben ausdrücklich unberührt).
- **5.35** Datumsangaben auf Deutsch: `kalAusText('9. April 1783')` → `'1783-04-09'`. Verstanden werden
  9.4.1783, 9. April 1783, April 1783, 1783, zweistellige Jahre und „Maerz“ ohne Umlaut. Gespeichert wird
  weiterhin die eine Form, mit der sich rechnen lässt.
- **5.35** Zwei neue Räume aus einer parallelen Sitzung: **Der Wandteppich** (Stammbaum, in dem auch die Fäden zählen, die keine Familie sind) und **Das Kabinett** (ein Schrank, in dessen Fächern große, selten gebrauchte Werkzeuge wohnen — der Wandteppich liegt im ersten Fach). In der Leiste steht nur das Kabinett.
- **5.36** Der Wandteppich fächert auf statt treppab zu laufen: die Reihen werden jetzt von den Blättern her
  gerechnet (Durchlauf von den Wurzeln, dann jeder Elternteil in die Mitte seiner Kinder). Ein Elternpaar
  zieht EINEN Ast zum Kind statt zwei fast gleicher. Dazu Laubbüschel, Zweiglein, Schlange und Hund am Fuß
  des Stammes — und Namen lassen sich von Hand ziehen (person.festX/festY, Rasterschritte); der Rundpfeil
  in der Leiste holt alle wieder in die gerechnete Ordnung.
- **5.37** Der Wandteppich, dritte Runde. Zeichnen: alle Umrisse laufen als Kurven (Catmull-Rom nach
  Bézier) statt als Vielecke — damit verschwinden die Facetten beim Zoomen. Wurzeln mit Breitenprofil,
  Gabelung, Rindenrissen und Haarwurzeln, dazu ein Grundsaum mit Gras, in dem sie verschwinden.
  Fäden: 63 Arten in sechs Gruppen (neu: Schicksal), sechs Strichbilder (neu: doppelt, wellig, Perlen),
  dunkler Saum unter jeder Linie, Knoten am Ausgang, Versatz bei mehreren Fäden zwischen denselben zwei.
  Eigene Fadenarten: `D.einst.fadenBibliothek` gilt in ALLEN Stammbäumen, `baum.eigeneArten` nur im
  eigenen; der Teppich schlägt die Bibliothek. Bedienung: Werkzeuge Hand/Faden, Ziehen von Name zu Name
  legt einen Faden an, ein Tipp nimmt eine Person in den Blick (Personenkarte unten links), die Legende
  ist nach Gruppen gebündelt mit Solo-Knopf.
- **5.38** Der Baum. Das Holz wird ZWEIMAL gezeichnet: erst dunkel und breiter (`.tep-holzrand`, 7,5 px
  Kontur), dann hell darauf (`.tep-holz`). Weil sich die dunklen Formen überlappen, verschmelzen Stamm und
  Äste zu EINEM Umriss — vorher sah man an jeder Astwurzel eine Fuge. Der Stamm liegt diagonal (unten links
  bis fast zur ersten Generation), ist knorrig (fünf Knoten, drei Wellenlängen Unruhe, links und rechts
  verschieden) und läuft oben in die ersten Äste hinein. Äste bekommen Ellbogen (`_knorrigeMitte`) mit
  einem Knoten an jedem Knick. Das Rautengitter ist wieder raus.
- **5.39** Ruhe in der Bedienung. Der Wandteppich wird nur neu gewebt, wenn sich der Beleg wirklich
  geändert hat (`flaeche.dataset.sig = id|geaendert`); Stummschalten, Jemanden-in-den-Blick-nehmen und
  Zoomen laufen über Klassen bzw. die Breitenangabe am schon vorhandenen Tuch. `tastaturZaehmen()`
  (30-core, beim Start gerufen) hält Safari davon ab, beim Öffnen der Tastatur die ganze Seite zu
  verschieben — stattdessen wird nur der scrollende Bereich im Dialog nachgeführt; `--sichthoehe` und
  `html.tastatur-offen` kommen aus der visualViewport-API. Chip-Reihen sind `flex: none` mit eigenem
  Scrollfeld: als schrumpfbares Flex-Kind ragten sie in die Liste darunter.
- **5.40** Der Kartentisch (`src/65-stadtplan.js`, `65b-stadtplan-karte.js`, `65c-stadtplan-blatt.js`),
  das zweite Fach im Kabinett. Stadtpläne für erfundene Orte, prozedural aus einer SAAT gerechnet: Wasser
  (Fluss/Küste/See/Insel) zuerst, dann die Stadt radial (Speichen × Ringe → Blöcke → Parzellen → Häuser),
  dann Umland. Nicht jede Speiche reicht durch alle Ringe — wo eine fehlt, wachsen zwei Blöcke zusammen;
  das erzeugt die ungleichen Blockgrößen einer gewachsenen Stadt. Gespeichert wird nur die Saat plus
  Marken und eigene Namen. Karte hängt an `flaeche.dataset.sig` (planSignatur); Marken liegen in einer
  eigenen Ebene und werden für sich aufgetragen.
- **5.41** Der Kartentisch visuell überarbeitet: helles Wasser mit ZWÖLF ausklingenden Uferstrichen
  (statt drei) plus Punktierung — die Fläche entsteht aus Linien, nicht aus Blau. Häuser mit Handstrich
  (zitternde Ecken, abgeschnittene Ecken, Winkelbauten), Bäume als Zeichen statt Kreise, Strichstärken
  gestaffelt wie in einem Kupferstich. Behoben: das Fadenspinnen im Wandteppich brach immer ab, weil der
  Zugfaden selbst unter dem Finger lag und der Treffertest ihn statt des Namens darunter fand.

## 4. Technische Punkte, die beim Hosting wichtig sind

- Einzelne HTML-Datei aus `src/` (`npm run build:web` → `index.html`); Service Worker `sw.js`
  cached zur Laufzeit, die Version in `sw.js`, `package.json` und `src/30-core.js` muss gleich sein
  (Vertragstest).
- pdf.js wird **lazy** importiert (`import('./vendor/pdf.min.js')`) und bekommt `wasmUrl`
  `vendor/wasm/` (siehe `pdfjsDokument` in `55-lesestapel.js`). Der Worker braucht den MIME-Typ
  `text/javascript`.
- `DecompressionStream('deflate-raw')` für EPUB — auf Sites kein Problem, ist Browser-API.
- `body` ist `position: fixed`; das Gerüst `#app` hat die Höhe `--vvh` (visualViewport). Nichts
  im Hosting-Wrapper darf die Seite scrollbar machen.
- Cover kommen zur Laufzeit vom Amazon-Bildhost (CORS `*`) bzw. Open Library — kein Proxy nötig.
- `autoren/quellen.json` enthält die Foto-Lizenzen; die App zeigt sie unter „Über die Bilder".
  Beim Deploy mitnehmen, nicht umbenennen.

## 5. Tests

`npm test` → 178 grün (Stand 5.27.1). Hosting: `node --test hosting/tests/*.test.mjs` → 2 grün.
