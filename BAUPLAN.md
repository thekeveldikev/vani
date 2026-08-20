# VANI — Bauplan

*Ein Zuhause zum Schreiben. Komplett offline, komplett meins.*

---

## 1. Die Idee

VANI ist kein Notiz-Organizer. VANI ist ein Haus mit Räumen. Jeder Raum ist eine Art zu
schreiben: schnell hingeworfene Gedanken, vollgeschriebene Heftseiten mit angeklebten
Zetteln, Romanprojekte mit Szenen, Denkflächen mit Blasen und Fäden dazwischen, eine
Kiste voller schöner Wörter. Alles hängt zusammen, alles ist erreichbar, nichts braucht
Internet, nichts braucht einen App Store.

Grundsätze:

- **Offline ist kein Feature, sondern die Grundlage.** Alles liegt lokal (IndexedDB),
  die App selbst wird per Service Worker vollständig gecacht. Einmal geladen, läuft sie
  überall auf der Welt ohne Verbindung.
- **Heimelig, nicht steril.** Warmes Papier, echte Serifenschrift (auf dem iPad:
  „New York"), Papierkorn-Textur, Zettel mit Klebeband, Handschrift-Akzente
  (Bradley Hand/Noteworthy — liegen auf jedem iPad), Kerzenlicht-Modus, prozedurale
  Klangwelten (Regen, Kamin, Wind, Grillen — per WebAudio erzeugt, null Dateien).
- **Keine Erklär-Vibes.** Leere Zustände sind stimmungsvoll, nicht belehrend.
  Die App spricht, wie ich schreibe.
- **Eine Datei.** Kein Framework, kein npm, kein CDN. Vanilla JS, von Hand.

## 2. Die Räume

| Raum | Was dort passiert |
|---|---|
| **Zuhause** | Begrüßung nach Tageszeit, Weiterschreiben-Karten, „Wieder aufgetaucht" (ein alter Fund), Schreibfeuer (Strähne + Wörter heute), Funke des Tages, Schnell-Einfangen |
| **Schnipsel** | Chat mit mir selbst (WhatsApp-Ersatz): Blasen, Datumstrenner, Fotos, Anpinnen — und jeder Schnipsel kann sich **verwandeln**: in eine Heftseite, eine Szene, eine Blase, ein Wort |
| **Hefte** | Regal voller Hefte. Innen: Seiten wie Papier (liniert/kariert/blanko), darauf Text, **angeklebte Zettel** (verdrehbar, bunt, Handschrift), **eingeklebte Fotos** mit Klebestreifen, **Kritzeln** mit Stift/Pencil (Druckstärke) |
| **Projekte** | Roman-/Sammlungs-Struktur: Projekt → Kapitel → Szenen. Szenenkarten auf der Pinnwand (Status: Funke/Entwurf/steht, Farbe, ziehbar), Wortziel mit Fortschritt, **Leseansicht** (alles als ein Fließtext) |
| **Schreibraum** | Vollbild-Fokus für jeden Text: Serife/Klar/Mono, Zeilenbreite, Schreibmaschinen-Scrolling, Absatz-Fokus (Rest wird blass), **Schreibfeuer-Sprints** (10/20/45 min), Klang an/aus, Live-Wortzahl |
| **Cluster** | Bretter mit Blasen: frei ziehen, verbinden (mit beschrifteten Fäden), Farben, Zoomen/Schieben — Denken auf einer Fläche |
| **Wörter** | Wortschatzkiste (schöne Wörter sammeln, Kiste schütteln → Dreiklang zum Losschreiben) + **Funken** (Schreibimpulse, einzeln oder als Wer/Wo/Aber-Kombination) |
| **Suche** | Ein Feld, alles: Schnipsel, Seiten, Szenen, Blasen, Wörter |
| **Feinheiten** | Themen, Schrift, Klang, Statistik (14-Tage-Balken, Strähne, Gesamtwörter), Sicherung (.vani-Datei raus/rein, Text-Export, Zwischenablage) |

Quer durch alles: **[[Verknüpfungen]]** — doppelte eckige Klammern verbinden Texte
miteinander, Rückverweise werden gefunden. **#Schlagworte** in Schnipseln.
**Autosave** bei jedem Tastendruck (entprellt), nie ein Speichern-Knopf.

## 3. Themen (4 Stimmungen)

- **Papier** — warmes Creme, Terrakotta-Akzent, Moosgrün (Standard, hell)
- **Tinte** — tiefes warmes Schwarz, Elfenbein-Text, Bernstein (dunkel)
- **Kerze** — Kerzenlicht-Sepia, tiefes Braun, goldener Schein (dunkel, spät nachts)
- **Nebel** — kühles Morgengrau, Graublau (hell, ruhig)

Typografie: `ui-serif` („New York" auf dem iPad) für alles Geschriebene,
`ui-rounded`/System für Bedienelemente, Bradley Hand/Noteworthy für Zettel.
Papierkorn als SVG-Rauschen, Zettelschatten, Klebeband-Details.

## 4. Technik

- **Eine HTML-Datei** (`index.html`), aus Quellteilen (`src/`) zusammengebaut (`build.sh`).
- **Speicher:** IndexedDB (`docs` = alle Inhalte, `media` = Foto-/Skizzen-Blobs,
  `kv` = Einstellungen & Statistik). Beim Start `navigator.storage.persist()`.
- **Fotos:** Aufnahme/Auswahl über `<input type=file>`, per Canvas auf max. 1600 px
  verkleinert, als JPEG-Blob gespeichert.
- **PWA:** `manifest.json` + `sw.js` (Cache-first mit Hintergrund-Aktualisierung) +
  Icons → nach „Zum Home-Bildschirm" vollständig offline, eigenes Vollbild ohne
  Safari-Leisten. Home-Bildschirm-Apps sind von Safaris 7-Tage-Löschung ausgenommen.
- **Sicherung:** alles (inkl. Bilder, base64) als eine `.vani`-Datei exportieren und
  wieder importieren — die Versicherung gegen alles.
- **iPad-Feinheiten:** `viewport-fit=cover` + safe-areas, `visualViewport` gegen
  Tastatur-Verdeckung, `100dvh`, kein Gummiband-Scrollen, Eingaben ≥16 px gegen
  Auto-Zoom, WebAudio erst nach Geste.

## 5. Der Weg aufs iPad (drei Pfade, absteigend)

1. **GitHub Pages** (Königsweg): Repo pushen, Pages aktivieren → `https://…github.io/vani/`
   einmal in Safari öffnen (winzig, lädt auch bei miesem Internet), Teilen →
   „Zum Home-Bildschirm". Ab dann: eigenes Icon, Vollbild, **komplett offline, überall**.
2. **Artefakt-Link** (sofort, aber online): dieselbe App als gehostete Seite — zum
   Anschauen und Benutzen, solange irgendein Netz da ist.
3. **Lokale Datei** (`index.html`): läuft in jedem Browser am Rechner; Notfall-Reserve.

## 6. Bau-Reihenfolge

1. Gerüst: Head, Shell, Manifest, Service Worker, Server, Build-Skript
2. Design-System: Themen, Papier, Karten, Knöpfe, Zettel, Icons
3. Kern: IndexedDB, Store, Router, Modale/Menüs, Statistik, Medien
4. Räume: Zuhause → Schnipsel → Hefte → Projekte → Schreibraum → Cluster → Wörter → Suche → Feinheiten
5. Klangwelten (WebAudio)
6. Test im Browser (iPad-Maße, beide Themen, Neuladen-Persistenz)
7. Icons (PNG), Deploy: GitHub Pages + Artefakt, Anleitung
