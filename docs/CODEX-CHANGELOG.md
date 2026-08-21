# VANI – vollständiges Codex-Änderungsprotokoll

> Zeitraum: vom letzten Claude-basierten Stand af63ec0 bis VANI 5.1
> Produktstand beim Schreiben: 21. August 2026
> Einstiegspunkt der Übergabe: C:\Users\kevin\VANI\CLAUDE-UEBERNAHME.md

## 1. Geltungsbereich und Git-Grenze

Dieses Dokument beschreibt, was nach dem letzten vorherigen Claude-Stand verändert
wurde. Als technische Vergleichsbasis gilt:

- **Vor Codex:** af63ec0 – „Faden per Passwort hereinholen…“
- **Codex-Hauptausbau:** d4ecb8e – „VANI 5: Profile, Rich-Text, Hefte, Klang und Updates“
- **Codex-Erweiterung:** 0301606 – „VANI 5.1: persönliche Wortkisten“

Der vollständige Vergleich lässt sich so anzeigen:

    git diff --stat af63ec0..0301606
    git diff --name-status af63ec0..0301606
    git log --oneline af63ec0..0301606

Wichtig: Zum Zeitpunkt dieser Übergabe liegen d4ecb8e und 0301606 nur lokal auf
main. origin/main zeigt noch auf af63ec0. Die öffentliche Sites-App wurde separat
veröffentlicht und enthält VANI 5.1.

## 2. Kurzfassung der Entwicklung

Aus einer lokal arbeitenden Einzeldatei-PWA wurde eine weiterhin lokal-first
arbeitende, aber reproduzierbar gebaute Produktfamilie:

- Web-/iPad-/Handy-PWA mit stabiler Installationsidentität;
- lokale passwortgeschützte und voneinander getrennte Profile;
- optionaler Ende-zu-Ende-verschlüsselter Mehrgeräte-Sync;
- installierbare Windows-Desktop-App;
- öffentlicher Cloudflare/Sites-Endpunkt samt Sync-Backend;
- reichhaltiger Texteditor und automatische Heftseiten;
- viel tiefere Beziehungen zwischen Blättern, Heften, Projekten und Clustern;
- Goodnotes-Archivmodus;
- grundlegend reparierter Klangraum;
- freie Schnipsel-Fläche;
- eigene Funken und umfangreicheres Wiederauftauchen;
- persönliche Wortkisten;
- adversariale Node-Test- und Desktop-Smoke-Suite.

Die warme, taktile, deutsche Schreibhaus-Metapher blieb dabei absichtlich erhalten.

## 3. Chronologie

### 3.1 Commit d4ecb8e – VANI 5

Dieser Commit brachte den großen strukturellen Ausbau:

1. lokales Profilgate und automatische Sperre;
2. optionalen verschlüsselten Yjs-Sync;
3. Electron-Desktop-App und Windows-Pakete;
4. Sites-/Cloudflare-Hostingprojekt;
5. Rich Text in Schreibraum und Heften;
6. automatische Seitenfortsetzung;
7. Heftgestaltung, Papier, Zeichnen und Befestigungen;
8. Beziehungen, Einheften, Einkleben, Projektkopien und Clusterabbilder;
9. eigene Funken und bessere Wieder-Funde;
10. freien Schnipsel-Modus;
11. Goodnotes-Archiv;
12. Klang-Neuaufbau und iOS-Mitigierung;
13. PWA-Updateführung und stabile App-Identität;
14. genaue Faden-Suchsprünge;
15. Sicherungs-, Sanitizing- und Datenintegritätsverbesserungen;
16. eine neue Test-, Build- und Release-Infrastruktur.

### 3.2 Commit 0301606 – VANI 5.1

Dieser Commit ergänzte persönliche Wortkisten und härtete die dazugehörigen
Verhaltensgrenzen:

1. neuer Dokumenttyp wortkiste;
2. frei benennbare Kisten mit Notiz und Farbe;
3. „Alle Wörter“ und „Lose Wörter“;
4. Wörter anlegen, mehrfach einfüllen, bearbeiten, favorisieren;
5. Wörter verschieben oder in eine andere Kiste kopieren;
6. Suche und Sortierung innerhalb einer Kiste;
7. drei unterschiedliche Wörter „schütteln“;
8. Kisten ohne oder samt Inhalt löschen;
9. vollständiges Undo der früheren Zuordnungen;
10. Wortkisten in globaler Suche, Beziehungen und Sync;
11. UI-Smoke-Test und Edge-Regressionen;
12. Versionswechsel auf 5.1.0 in Web, PWA, Desktop und Hosting.

## 4. Änderungen nach Produktbereich

## 4.1 Buildsystem und Quellenstruktur

### Was geändert wurde

Die App wird nicht mehr zuverlässig durch manuelles Editieren einer riesigen
index.html gepflegt. Die kanonischen Quellen liegen in src. Ein Node-Build setzt
daraus die verteilbaren Ein-Datei-Artefakte zusammen.

### Wo

- werkzeug/build-web.mjs
- build.sh
- package.json
- package-lock.json
- vendor/vani-sync.js
- werkzeug/vani-sync-vendor.mjs

### Warum

Die neuen Bereiche waren in einer einzigen handgepflegten HTML-Datei nicht mehr
sicher wartbar. Ein definierter Build verhindert vergessene Module, falsche
Reihenfolge und Unterschiede zwischen Web, Desktop und Hosting.

### Wie es funktioniert

npm run vendor bündelt Yjs und Y-IndexedDB zu vendor/vani-sync.js. Danach setzt
werkzeug/build-web.mjs Kopf, CSS, Shell, Vendorcode und alle JS-Module in fester
Reihenfolge zu index.html und artifact.html zusammen.

index.html und artifact.html sind daher **Buildprodukte**. Änderungen gehören in
src, nicht dauerhaft nur in diese Dateien.

## 4.2 Kern, Datenvalidierung und Papierkorb

### Wo

- src/30-core.js
- test/kern-edge.mjs
- test/lauf.mjs

### Neu oder verändert

- Appversion zentral auf 5.1.0 gesetzt.
- IndexedDB-Schema auf Version 4 erweitert.
- Stores sync und sync-pending ergänzt.
- Einstellungen um Profile, Sync, Heftansicht, Autoseitenwechsel, Zeichenwerkzeug,
  Goodnotes-Medien-Sync und Schnipselansicht erweitert.
- Eingelesene Dokumente werden durch sauberesDokument begrenzt und normalisiert.
- Einstellungen aus Backups werden nur über bekannte Schlüssel und Werte übernommen.
- Rich HTML wird nicht blind vertraut.
- Farben, Größen, Koordinaten, Zähler, IDs und Enums erhalten Grenzen.
- Löschen sammelt abhängige Kinder, Kanten und Bezüge.
- Referenzfelder wie projektRef und quelle werden beim Löschen aufgeräumt.
- Papierkorbeinträge merken veränderte Referenzen für korrektes Undo.
- Optionaler Modus hält Kinder einer gelöschten Wurzel am Leben; dies wird beim
  Löschen nur einer Wortkiste benötigt.
- Öffnen eines Suchtreffers kennt neue Typen wie goodnote, funkeln und wortkiste.

### Behobene Risiken

- beschädigte Sicherungen konnten unplausible Werte einschleusen;
- gelöschte Projekte konnten Geisterverweise hinterlassen;
- Undo konnte Beziehungen oder Elternzuordnungen unvollständig restaurieren;
- sehr große oder bösartige Nutzereingaben konnten Arbeit und Layout unnötig belasten.

## 4.3 Lokale Profile

### Wo

- src/29-profile.js
- src/49-feinheiten.js
- src/60-boot.js
- desktop/preload.cjs
- desktop/main.cjs

### Neu

- Startgate mit Name und Passwort/Code.
- Lokale Profilregistry mit maximal zwölf Profilen.
- Das erste Profil übernimmt die alte Datenbank vani.
- Weitere Profile erhalten eigene Datenbanknamen.
- Passwortprüfung mittels PBKDF2-SHA-256 mit 350.000 Iterationen.
- Gespeichert werden nur Salz und Prüfdaten, nicht das Passwort.
- Konstantzeitnaher Bytevergleich.
- Verzögerung nach wiederholten Fehlversuchen.
- Passwortänderung.
- Profilwechsel.
- automatische Sperre nach konfigurierbarer Inaktivität.
- Sync-Geheimnis kann mit einem aus dem Passwort abgeleiteten AES-GCM-Schlüssel
  umhüllt werden.
- Auf Electron kann die Plattformablage safeStorage zusätzliche Geheimnisse schützen.

### Warum

Sarah und Kevin sollen dieselbe App nutzen können, ohne lokale Notizen zu vermischen.
Die Lösung ist absichtlich kein serverseitiges Benutzerkonto. Ein Profil ist eine
lokale, passwortgeschützte Tür; Mehrgeräte-Sync wird separat gekoppelt.

### Sicherheitsentscheidung

Die im Gespräch genannten Namen, Passwörter und Faden-Codes wurden nicht eingebaut.
Ein Vertragstest schützt diese Entscheidung.

## 4.4 Verschlüsselter Sync

### Wo

- src/31-sync.js
- vendor/vani-sync.js
- sync-server/server.mjs
- sync-server/Dockerfile
- hosting/worker/index.ts
- test/sync-client.mjs
- test/sync-server.mjs

### Neu

- Ein Sync-Vault pro gewünschtem Datenraum.
- Kopplungscode mit Serveradresse, Vault-ID, Zugriffstoken und Inhaltskey.
- AES-256-GCM im Client vor jedem Upload.
- Yjs/Y.Text zur Zusammenführung paralleler Textänderungen.
- Y-IndexedDB für lokale CRDT-Persistenz.
- Offline-Warteschlange im Store sync-pending.
- inkrementelles Push/Pull nach Sequenznummer.
- idempotente Update-IDs.
- authentifizierter Medienupload in verschlüsselten Blöcken.
- optional ausgeschlossene Goodnotes-Originalmedien.
- Netzwerkstatus, Start/Stop, Kopplung und Entkopplung in Feinheiten.
- HTTPS-Pflicht außerhalb localhost.

### Servervarianten

1. **Sites/Cloudflare:** D1 hält Metadaten und Tokenhash; R2 hält Geheimtext.
2. **Eigenständig:** Node plus SQLite in sync-server.

Beide Varianten sprechen dasselbe v1-Protokoll.

### Warum

Textinhalte sollen auf iPad, Handy und Laptop möglichst zeitnah gleich sein, ohne
dass der Server Klartext erhält. Offlinearbeit bleibt möglich; nach Rückkehr ins Netz
wird die Warteschlange abgearbeitet.

### Grenzen

- kein serverseitiges Zurücksetzen eines verlorenen Inhaltskeys;
- keine Garantie mathematisch simultaner UI-Anzeige bei schlechtem Netz;
- Medien können wegen Größe später eintreffen als Text;
- lokale Profile und Vault-Identität sind getrennte Konzepte.

## 4.5 Rich Text

### Wo

- src/35-richtext.js
- src/34-inhalt.js
- src/43-hefte.js
- src/45-schreibraum.js

### Neu

- fett, kursiv, unterstrichen, durchgestrichen;
- Überschriften H1 bis H3;
- geordnete und ungeordnete Listen;
- Blockzitat;
- links, mittig und rechts ausrichten;
- freie Schriftgröße;
- freie Text- und Markierfarbe;
- Klartextspiegel für Suche und Wortzählung;
- Sanitizer mit begrenzter Tag- und Stilfreigabe;
- strukturtreue Aufteilung von Rich HTML an Seitenrändern.

### Behobener Fehler

Die Toolbar konnte wegen eines freien Bezeichners title beim Erzeugen eines Buttons
mit ReferenceError abbrechen. Der Wert wird nun korrekt als title: titel gesetzt;
der Quellvertrag testet dies.

## 4.6 Hefte, Seiten und automatisches Weiterblättern

### Wo

- src/43-hefte.js
- src/45-schreibraum.js
- src/35-richtext.js
- src/10-style.css
- src/30-core.js

### Neu

- Seitenansicht und fortlaufende Rollenansicht.
- Automatischer Seitenwechsel standardmäßig an, aber abschaltbar.
- Überlauf beim Tippen und Einfügen erzeugt Folgeseiten.
- Plain Text wird vorzugsweise an Wort-/Zeilengrenzen geteilt.
- Rich Text wird per DOM-/Range-Logik geteilt.
- Seiten können wieder zu freien Blättern werden.
- Blätter können an gewählter Position eingeheftet werden.
- 24 kuratierte Umschlagfarben plus eigene Farben.
- Vorder-, Zweit- und Bandfarbe.
- Muster: Leinen, diagonal, Punkte, Rahmen, Welle, schlicht.
- Papier: liniert, kariert, blank, Punkte, breit.
- Zettel, Fotos und Textkopien mit Tesa, Reißzwecke oder lose.
- sichtbare Befestigungsart nachträglich ändern.
- Zeichenmodus mit Farbe, benutzerdefinierter Farbe, Dicke, Radierer und Undo.
- Zeichenoptionen werden in Einstellungen gespeichert.

### Qualitätssicherung

Der Desktop-Smoke-Test fügt 850 Wörter mit Rich-Formatierung ein. Erwartet werden
mehrere Seiten, vollständiger Klartext und erhaltene Rich-Struktur. Der letzte Lauf
ergab acht Seiten ohne Textverlust.

## 4.7 Beziehungen, Einheften, Einkleben und Kopieren

### Wo

- src/39-beziehungen.js
- src/43-hefte.js
- src/44-projekte.js
- src/45-schreibraum.js
- src/46-cluster.js
- src/30-core.js

### Neu

Eine gemeinsame Beziehungsschicht verbindet die bisher getrennten Räume.

Semantische Arten:

- gehört dazu;
- inspiriert;
- erklärt;
- widerspricht;
- spiegelt;
- Fortsetzung von;
- Figur / Ort.

Strukturelle Aktionen:

- Blatt als Seite an eine gewünschte Stelle eines Hefts;
- Blatt oder Schnipsel als sichtbare Kopie auf eine Seite kleben;
- Heft einem Projekt zuordnen oder lösen;
- Heft als Kapitel und Szenen in ein Projekt kopieren;
- Dokument als Clusterblase spiegeln;
- Beziehungen anzeigen und trennen.

Selbstverknüpfungen und Dubletten werden verhindert. Quellenbeziehungen bleiben
sichtbar, ohne die Originale zu verschieben.

## 4.8 Projekte und Cluster

### Wo

- src/44-projekte.js
- src/46-cluster.js
- src/39-beziehungen.js

### Neu oder erweitert

- Projektkarten zeigen zugeordnete Hefte.
- Heftkopie erzeugt ein Kapitel und pro Heftseite eine Szene.
- Quelle und Projektzuordnung werden festgehalten.
- Clusterblase kann auf ein Ursprungsdokument zeigen.
- relevante Dokumenttypen können aus ihrem Menü auf ein Brett gelegt werden.
- beim Löschen werden abhängige Kanten und sichtbare Bezüge aufgeräumt.

## 4.9 Zuhause, eigene Funken und Wieder aufgetaucht

### Wo

- src/41-zuhause.js
- src/30-core.js
- src/10-style.css

### Neu

- Nutzer kann eigene Funken mit Text, Art und Vibe speichern.
- eigene Funken lassen sich suchen, bearbeiten, löschen und als Schreibstart öffnen.
- generierte Funken wurden um Fragen, Formen und Sätze ergänzt.
- „Wieder aufgetaucht“ sammelt mehrere Arten sinnvoller Echos:
  alte Texte, unfertige Gedanken, Zeitbezüge und Wortwiederholungen.
- Funde stammen auch aus Faden und eigenen Funken, sofern genug sinnvoller Text da ist.
- Grenzen verhindern, dass ein sehr großer Bestand die Startseite endlos füllt.

## 4.10 Freier Schnipsel-Modus

### Wo

- src/42-schnipsel.js
- src/10-style.css
- src/30-core.js

### Neu

- Umschaltung zwischen klassischer Liste und freier Fläche.
- deterministische Position pro Schnipsel.
- wachsende Fläche für viele Schnipsel.
- horizontales und vertikales Erkunden.
- Suche/Filter bleibt nutzbar.
- Positionen und Flächengrenzen werden gegen beschädigte Werte begrenzt.
- Verwandlungen und Einfügeaktionen verbinden Schnipsel mit anderen Räumen.

Die Positionen sind absichtlich nicht bei jedem Laden neu zufällig, damit der Raum
räumliches Gedächtnis entwickeln kann.

## 4.11 Goodnotes-Archivmodus

### Wo

- src/42d-goodnotes.js
- src/40-router.js
- src/48-suche.js
- src/49-feinheiten.js
- src/31-sync.js

### Neu

- Import von PDF, Bildern und .goodnotes-Dateien als unveränderte Kopie.
- Metadaten: Titel, Stichwörter und Notiz.
- Erkennung von Doppelimporten über Fingerabdruck und blockweisen Inhaltsvergleich.
- eigener Raum und eigene Suche.
- standardmäßig keine Einträge in der globalen Suche.
- Raum bleibt verborgen, bis Inhalt vorhanden oder die Einstellung aktiviert ist.
- Originalmedien werden nur synchronisiert, wenn goodnotesSync aktiv ist.

### Bewusste Grenze

VANI bearbeitet keine Goodnotes-Datei semantisch und synchronisiert nicht live zurück
in die Goodnotes-App. Der Modus ist ein ruhiges Archiv.

## 4.12 Faden und exakte Suche

### Wo

- src/42c-faden.js
- src/48-suche.js
- src/30-core.js

### Behoben

Ein Faden-Suchtreffer sprang nicht zuverlässig, wenn die Fadenroute bereits geöffnet
war. Nun wird die genaue Nachrichten-ID in sessionStorage vorgemerkt, die Route bei
Bedarf neu gezeichnet und das Zielelement ohne unsichere CSS-Selektorbildung gesucht.

Das Passwort zum historischen Paket bleibt extern und darf nicht in Source oder
Übergabedokumente geschrieben werden.

## 4.13 Klangraum

### Wo

- src/50-audio.js
- src/51-klangraum.js
- src/49-feinheiten.js
- src/60-boot.js

### Problem

Regler konnten funktionieren, während auf iPad/iOS kein Klang hörbar war. WebAudio
kann dort insbesondere in installierten PWAs nach Hintergrundwechsel als „running“
erscheinen, obwohl kein Signal ausgegeben wird.

### Änderungen

- wahrnehmungsnähere Lautheitskurve;
- alle Starts an echte Nutzerinteraktion gekoppelt;
- Testton;
- sichtbarer Audiozustand;
- „Klang neu wecken“;
- vollständiger Neuaufbau des AudioContext;
- kleine dynamische WAV-/HTML-Audio-Medienbrücke für iOS;
- Reaktion auf interrupted, suspended, visibilitychange und pageshow;
- Watchdog gegen scheinbar laufenden, aber stillen Zustand;
- saubere Registrierung und Freigabe aller Timer und Nodes;
- robuste Begrenzung von Mischungswerten.

### Ehrliche Restgrenze

Appcode kann einen WebKit-Systemfehler mitigieren, aber nicht garantieren, dass iOS
unter jeder Hardware-/Stummmodus-/Ausgabe-Situation Audio freigibt.

## 4.14 PWA, Home-Bildschirm und Updates

### Wo

- manifest.json
- sw.js
- src/49-feinheiten.js
- src/60-boot.js
- INSTALLATION-UND-UPDATES.md

### Neu oder geändert

- stabile Manifest-ID, start_url und scope: jeweils ./.
- ein Cache pro Appversion.
- Navigation network-first mit Offline-Fallback.
- statische Dateien Cache-first mit Hintergrundaktualisierung.
- alte Caches bei Aktivierung löschen.
- Updateerkennung und Meldung.
- Updateknopf in Feinheiten.
- wartenden Worker über SKIP_WAITING aktivieren und Seite neu laden.
- Hilfetext zum Entfernen alter iPadOS-Home-Bildschirm-Webclips.

### Warum

Updates sollen hinter demselben Icon ankommen. Eine neue Version benötigt nicht jedes
Mal ein neues Home-Bildschirm-Icon. Ein altes, falsch angelegtes Icon muss jedoch mit
iPadOS-Mitteln entfernt werden; eine Website darf sich aus Sicherheitsgründen nicht
selbst vom Home-Bildschirm löschen.

## 4.15 Desktop-App

### Wo

- desktop/main.cjs
- desktop/preload.cjs
- desktop/config.json
- package.json
- icons/
- werkzeug/smoke-cdp.mjs

### Neu

- Electron 43.
- Windows-x64-NSIS-Setup und Portable-Ausgabe.
- feste App-ID de.vani.schreibzuhause.
- vani://app als privilegiertes internes Protokoll.
- nodeIntegration ausgeschaltet.
- contextIsolation und Sandbox eingeschaltet.
- externe Navigation wird nicht in der App geladen.
- Berechtigungen restriktiv.
- safeStorage-Brücke über enges Preload-API.
- geschützte Konfiguration wird atomar über temporäre Datei ersetzt.
- lokale Daten bleiben bei Deinstallation standardmäßig erhalten.
- Updatebibliothek vorbereitet.

### Noch nicht fertig

desktop/config.json besitzt syncServerUrl, aber eine leere updateUrl. Es gibt daher
noch keinen öffentlichen signierten nativen Auto-Updatekanal. Für Windows wird eine
neue Setup-Datei über die alte Installation ausgeführt.

## 4.16 Öffentliches Hosting

### Wo

- hosting/.openai/hosting.json
- hosting/app/
- hosting/public/
- hosting/worker/index.ts
- hosting/db/
- hosting/drizzle/
- hosting/scripts/copy-vani.mjs
- hosting/tests/rendered-html.test.mjs
- hosting/README.md

### Neu

- eigenes Sites-Projekt mit bestehender Projekt-ID.
- Next-/Vinext-Hülle liefert die statische VANI-App aus.
- Build kopiert aktuelle Webartefakte nach hosting/public.
- Worker bedient die v1-Sync-API.
- D1-Schema für Vaults, Updates und Blob-Metadaten.
- R2 für verschlüsselte Payloads.
- Health-Endpunkt.
- Rendering-Vertrag prüft Version, Appmarker und zentrale Features.
- ESLint ignoriert echte generierte Verzeichnisse.

### Veröffentlichung

Die öffentliche URL ist:

    https://vani-schreibzuhause.craftkey.chatgpt.site

Die vorhandene Projekt-ID muss wiederverwendet werden. Keine neue Site nur für ein
Update erstellen.

## 4.17 Persönliche Wortkisten

### Wo

- src/47-woerter.js
- src/10-style.css
- src/30-core.js
- src/39-beziehungen.js
- src/48-suche.js
- test/kern-edge.mjs
- test/vertraege.mjs
- werkzeug/smoke-cdp.mjs

### Datenmodell

Eine Kiste ist ein Dokument vom Typ wortkiste mit Titel, Notiz und Farbe. Ein Wort
ist weiterhin Typ wort; seine parent-ID zeigt optional auf eine Kiste.

### Verhalten

- bis zu 200 Kisten;
- UI lädt höchstens sinnvoll begrenzte Mengen;
- Mehrfachimport maximal 500 Ausdrücke;
- Ausdruck maximal 160 Zeichen;
- leere Werte werden verworfen;
- Dubletten werden normalisiert pro Kiste vermieden;
- lose Wörter bleiben abwärtskompatibel;
- Favoriten;
- Notiz pro Wort;
- Suche in Wort und Notiz;
- Verschieben und Kopieren;
- Kistenschrank horizontal auf kleinen Bildschirmen;
- Schütteln ohne Duplikate und ohne Veränderung der Quelle;
- Löschen nur der Kiste oder des ganzen Bündels;
- korrektes Undo beider Varianten.

### Beim Smoke-Test gefundener Bug

Die erste Implementierung behandelte die Rückgabe eines Einzelelement-Zufallshelfers
wie ein Array. Der UI-Smoke-Test deckte dies auf. wortZufallsgriff besitzt nun eine
eigene terminierende Auswahl, die auch mit pathologisch konstantem Math.random nicht
hängen bleibt.

## 5. Überarbeitete Gestaltung und Bedienung

Die meisten visuellen Ergänzungen liegen in src/10-style.css. Wichtig waren:

- weichere Übergänge und Animationen;
- ruhige Papier-, Stoff-, Tesa- und Pin-Anmutung;
- klarere Aktionsmenüs;
- responsive Heft- und Wortkistenregale;
- große, frei scrollbare Schnipsel-Fläche;
- sichtbare Rich-Text-Werkzeuge ohne Entwicklerbegriffe;
- saubere 390-Pixel-Handydarstellung;
- Touchziele und Fokuszustände;
- Reduced-Motion-Rücksicht;
- keine kitschigen grellen Standardmuster.

Bei künftigen CSS-Änderungen immer sowohl Desktop als auch schmale Touchbreite prüfen.

## 6. Testausbau

### Neue oder stark erweiterte Dateien

- test/kern-edge.mjs
- test/vertraege.mjs
- test/sync-client.mjs
- test/sync-server.mjs
- test/server.mjs
- test/sandkasten.mjs
- werkzeug/smoke-cdp.mjs
- hosting/tests/rendered-html.test.mjs

### Geprüfte Fehlerklassen

- leere, extrem lange und falsch typisierte Eingaben;
- beschädigte Dokumente und Sicherungen;
- HTML-/CSS-Injektion;
- Grenzwerte und Clamping;
- zyklische oder doppelte Beziehungen;
- Selbstbeziehungen;
- Löschkaskaden und Undo;
- Referenzkorruption;
- Rich-Text-Sanitizing;
- Plain- und Rich-Seitenteilung;
- Profilnormalisierung und Passwortprüfung;
- Sync-Konfiguration und Kopplungscode;
- Authentifizierungsfehler;
- Vault-Isolation;
- idempotente Updates;
- parallele Serveranfragen;
- ungültige Sequenzen;
- Body- und Mediengrößen;
- Offlinewarteschlange;
- Audiozustände und Pegelkurve;
- Goodnotes-Dublettenerkennung;
- Wortkisten-Dubletten, Löschen, Undo und pathologischer Zufall;
- Desktop-UI, echte Paginierung und Responsive-Overflow.

### Stand

- Root-Suite: 69 von 69 Tests bestanden.
- Hosting-Suite: 2 von 2 Tests bestanden.
- Hosting-Lint: ohne Fehler.
- Paketierter Windows-Smoke: bestanden.

## 7. Dokumentation und Bedienungsanleitungen

Neu oder wesentlich überarbeitet:

- README.md
- INSTALLATION-UND-UPDATES.md
- DESKTOP-SYNC-BAUPLAN.md
- sync-server/README.md
- hosting/README.md

BAUPLAN.md blieb als historischer Produktbauplan erhalten. Einzelne technische
Aussagen darin sind überholt; für aktuelle Architektur gilt
docs/TECHNISCHE-ARCHITEKTUR.md.

## 8. Vollständige Dateigruppen seit af63ec0

### Neu angelegt

- Profile: src/29-profile.js
- Syncclient: src/31-sync.js
- Rich Text: src/35-richtext.js
- Beziehungen: src/39-beziehungen.js
- Goodnotes: src/42d-goodnotes.js
- Desktop: desktop/*
- unabhängiger Syncserver: sync-server/*
- Hostingprojekt und Worker: hosting/*
- Vendorbuild: vendor/* und werkzeug/vani-sync-vendor.mjs
- Webbuild: werkzeug/build-web.mjs
- Desktop-Smoke: werkzeug/smoke-cdp.mjs
- adversariale Tests: mehrere Dateien unter test/*
- Release-/Update-Dokumentation.

### Stark verändert

- src/10-style.css
- src/30-core.js
- src/34-inhalt.js
- src/41-zuhause.js
- src/42-schnipsel.js
- src/43-hefte.js
- src/45-schreibraum.js
- src/47-woerter.js
- src/49-feinheiten.js
- src/50-audio.js
- src/60-boot.js
- index.html und Hostingkopie als daraus erzeugte Buildprodukte.

### Gezielt angepasst

- Navigation, Blätter, Faden, Projekte, Cluster, Suche und Klangraum;
- Manifest und Service Worker;
- lokaler Entwicklungsserver;
- Gitignore und Paketmetadaten.

## 9. Nicht als erledigt behandeln

Folgende Wünsche sind vorbereitet oder teilweise möglich, aber nicht abgeschlossen:

- echter öffentlicher Desktop-Autoupdater;
- signierte Windows-/macOS-Releases;
- gebaute macOS-/Linux-Installationsdateien;
- Downloadseite für Desktoppakete;
- Spotify-Integration;
- zentral administrierte Webkonten;
- Goodnotes-Live-Zweiwegesync;
- serverseitige Wiederherstellung verlorener E2E-Schlüssel;
- vollständige Garantie gegen iOS-WebKit-Audioprobleme.

## 10. Leitlinie für kommende Änderungen

1. Lokalen HEAD bewahren.
2. Erst vorhandenes Verhalten und Datenmodell lesen.
3. Quelle in src statt generiertes index.html ändern.
4. Datenmigration und bestehende IndexedDB-Inhalte berücksichtigen.
5. Für jeden echten Bug einen nicht redundanten Regressionstest ergänzen.
6. Roottests, Webbuild, relevante Hostingtests und bei UI-Risiko Smoke ausführen.
7. Version nur dann anheben, wenn ein echtes Release gebaut wird.
8. Keine Passwörter, Kopplungscodes oder persönlichen Notizen einchecken.
9. Nicht ohne Freigabe pushen oder öffentlich deployen.
10. Dem Nutzer Grenzen ebenso klar erklären wie neue Möglichkeiten.
