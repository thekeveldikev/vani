# Übergabe an Codex — Stand VANI 5.27.2 (23. August 2026)

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
| `src/56d-salon-einlesung.js`, `src/56e-salon-kenntnis.js`, `src/56f-salon-gespraech.js`, `src/56g-salon-mehr.js`, `src/56h-salon-lernen.js`, `src/56i-salon-personenblatt.js`, `src/57c-katze.js` | Einlesung (versiegelt, `einlesung/*.enc`), Kenntnis aus den Texten, Gespräch in Stimmen, mehr Themen/Aufgaben, Nachlesen und Chronik, die Katze |
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
