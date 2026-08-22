# VANI 5.2.1 — vollständige Übergabe an Claude

> **Stand:** 21. August 2026, nach Vereinheitlichung von App, Updates und Sync
> **Arbeitsverzeichnis:** `C:\Users\kevin\VANI`
> **Diese Datei zuerst lesen.** Sie ist der Einstiegspunkt in die gesamte Übergabemappe.

## 0. Zweck dieser Übergabe

VANI wurde ursprünglich von Claude aufgebaut. Ab der Nutzeranfrage vom Donnerstag,
20. August 2026, ca. 23:19 Uhr — beginnend mit „Hi! Schau dir bitte die App ganz
genau an …“ — wurde die App von Codex umfassend untersucht, repariert, erweitert,
getestet, als Desktop-App gebaut und öffentlich veröffentlicht.

Der Nutzer möchte die weitere Arbeit nun wieder an Claude übergeben. Diese Datei und
die ergänzenden Dokumente sollen verhindern, dass Claude:

- von einem veralteten GitHub-Stand ausgeht;
- generierte Dateien statt der eigentlichen Quellen bearbeitet;
- Profile mit echten Cloud-Konten verwechselt;
- Passwörter oder Kopplungscodes in den Quelltext schreibt;
- PWA-, Sync-, Daten- oder Update-Kompatibilität versehentlich zerstört;
- bereits gelöste Probleme erneut implementiert;
- den öffentlichen Stand oder die Desktop-App zu stark verspricht;
- Änderungen ohne die vorhandene adversariale Testsuite ausliefert.

## 1. Die wichtigsten Fakten in 90 Sekunden

### Aktueller Produktstand

- App-Version: **5.2.1**
- Letzter Claude-Produktcommit vor der Vereinheitlichung: **`9506fb3` — `VANI 5.2.0: die Anleitung in der App`**
- Persönliche Wortkisten: **`0301606`**
- Großer Codex-Ausbau: **`d4ecb8e`**
- Letzter Stand vor Codex / letzter Claude-basierter Commit: **`af63ec0`**
- Einzige sichtbare Web-App: **https://thekeveldikev.github.io/vani/**
- Unsichtbarer verschlüsselter Sync-Dienst: **https://vani-schreibzuhause.craftkey.chatgpt.site/v1**
- Sites-Projekt-ID: **`appgprj_6a8786eb79448191acff5186595d06ec`**
- Die Sites-Startseite ist keine zweite App mehr; sie führt zur GitHub-App.
- Windows-Setup: `C:\Users\kevin\VANI\release\VANI-5.2.1-x64-Setup.exe`
- Windows Portable: `C:\Users\kevin\VANI\release\VANI-5.2.1-x64-Portable.exe`

### Git-Warnung

GitHub Pages ist die kanonische Web-App und soll bei normalen Claude-/Codex-Änderungen
über `origin/main` aktualisiert werden. Sites wird nur noch bei Änderungen am
Sync-Worker, D1/R2 oder am Rettungsweg deployt. Claude kann damit fast alle normalen
App-Updates ohne Sites-Werkzeug veröffentlichen.

Vor jeder Arbeit trotzdem lokalen HEAD, `origin/main` und vorhandene Änderungen
prüfen. Kein Reset und kein Überschreiben fremder Arbeit.

### Qualitätsstand

- `npm test`: **mindestens 77/77 vor VANI 5.2.1; aktuelle Zahl nach Tests beachten**
- `hosting/npm test`: **2/2 bestanden**
- `hosting/npm run lint`: **sauber**
- Windows-Paket wurde real gestartet und per CDP-Smoke-Test geprüft
- Rich-Text-Autopaginierung: 850 Testwörter → 8 Seiten, kein Textverlust
- Wortkisten: echte UI-, Such-, Daten- und Layoutprüfung bestanden
- Desktopbreite und 390-Pixel-Handybreite: kein ungewollter Seitenüberlauf
- Einzige App-Adresse und Sync-Health werden nach jedem Deployment getrennt geprüft
- Keine ungeklärten Testfehler

## 2. Weitere Übergabedokumente

Diese Dokumente gehören zusammen:

1. `C:\Users\kevin\VANI\CLAUDE-UEBERNAHME.md`
   Produktstand, Regeln, Funktionsüberblick, Grenzen und Einstieg.

2. `C:\Users\kevin\VANI\docs\CODEX-CHANGELOG.md`
   Vollständiges Änderungsprotokoll seit `af63ec0`, nach Bereichen und Dateien.

3. `C:\Users\kevin\VANI\docs\TECHNISCHE-ARCHITEKTUR.md`
   Buildsystem, Datenmodell, Profile, Verschlüsselung, Sync, PWA, Desktop und
   Hostingarchitektur.

4. `C:\Users\kevin\VANI\docs\TEST-BUILD-DEPLOYMENT.md`
   Befehle, Versionierung, Testmatrix, Desktop-Smoke, Release und Sites-Deployment.

5. `C:\Users\kevin\VANI\docs\CLAUDE-STARTPROMPT.md`
   Fertig kopierbarer Prompt, mit dem Claude unmittelbar weiterarbeiten kann.

Bestehende zusätzliche Dokumente:

- `C:\Users\kevin\VANI\README.md`
- `C:\Users\kevin\VANI\BAUPLAN.md` — historischer Grundbauplan; teilweise veraltet
- `C:\Users\kevin\VANI\DESKTOP-SYNC-BAUPLAN.md`
- `C:\Users\kevin\VANI\INSTALLATION-UND-UPDATES.md`
- `C:\Users\kevin\VANI\sync-server\README.md`
- `C:\Users\kevin\VANI\hosting\README.md`

Das historische `BAUPLAN.md` beschreibt noch die frühere Idee „eine Datei, kein npm“.
Das ist als Gestaltungsphilosophie nützlich, technisch aber nicht mehr vollständig:
VANI besitzt inzwischen einen reproduzierbaren Node-Build, Yjs-Abhängigkeiten,
Electron, Tests, einen Sync-Dienst und ein separates Sites-Hostingprojekt.

## 3. Unverhandelbare Produkt- und Sicherheitsregeln

### 3.1 Offline und lokal zuerst

Die App muss ohne Konto und ohne Netz verwendbar bleiben. Inhalte werden zuerst in
IndexedDB gespeichert. Sync ist eine optionale Erweiterung und darf den lokalen Start
nicht blockieren.

### 3.2 Keine persönlichen Inhalte im Repository

Das Repo enthält die leere App, Saatwörter und allgemeine Funken. Persönliche
Nutzerdaten gehören ausschließlich in IndexedDB, Sicherungsdateien oder den
verschlüsselten Sync. Keine echten Notizen, Kopplungscodes oder Nutzerpasswörter
einchecken.

### 3.3 Niemals Nutzerpasswörter hartcodieren

Der Nutzer hat im Chat Namen und gewünschte Passwörter/Codes genannt. Diese Werte
sind absichtlich **nicht** im Quelltext. Der Vertragstest prüft ausdrücklich, dass
Namen wie Sarah/Kevin und angeforderte Passworttabellen nicht in `src/29-profile.js`
auftauchen.

Profile werden vom Menschen auf dem jeweiligen Gerät angelegt. Das Passwort wird
nicht gespeichert; gespeichert werden Salz und ein PBKDF2-Prüfwert. Der abgeleitete
AES-Schlüssel lebt nur im Speicher der laufenden Sitzung.

### 3.4 Profile sind keine zentralen Internetkonten

Die Anmeldung ist eine lokale Tür pro Gerät und trennt lokale IndexedDB-Bestände.
Geräteübergreifende Identität entsteht durch einen getrennten verschlüsselten
Sync-Bereich und dessen Kopplungscode. Nicht als E-Mail-/Cloud-Account darstellen.

### 3.5 Ein Kopplungscode ist ein Hausschlüssel

Wer ihn besitzt, kann den verschlüsselten Bereich auf einem weiteren Gerät öffnen.
Der Server besitzt den Inhaltschlüssel nicht. Ein verlorener Code kann serverseitig
nicht wiederhergestellt werden. Backups bleiben notwendig.

### 3.6 Bestehende Daten niemals still migrieren oder löschen

- Erster lokaler Profilnutzer übernimmt die historische Datenbank `vani`.
- Weitere Profile erhalten getrennte Datenbanken.
- Löschen geht zunächst in den Papierkorb.
- Hierarchische Nachfahren und Beziehungen werden berücksichtigt.
- Bei Wortkisten kann nur die Kiste entfernt werden; Wörter werden dann lose und
  die Zuordnung wird bei „Rückgängig“ korrekt restauriert.
- Vor Schemaänderungen immer Sicherung, Migration und Regressionstest bedenken.

### 3.7 Stabile PWA-Identität bewahren

In `manifest.json` müssen diese Werte stabil bleiben:

```json
{
  "id": "./",
  "start_url": "./",
  "scope": "./"
}
```

Diese Stabilität ermöglicht Updates hinter demselben Home-Bildschirm-Icon. Keine
versionsabhängige Manifest-ID und keine neue URL pro Release einführen.

### 3.8 Quellen statt generierte Dateien bearbeiten

Die eigentlichen Webquellen liegen in `src/`. `index.html`, `artifact.html` und
`hosting/public/index.html` sind Buildprodukte.

Richtiger Ablauf:

1. Dateien in `src/` ändern.
2. Tests ergänzen.
3. `npm run build:web` ausführen.
4. Hosting-Build ausführen, der die Webartefakte nach `hosting/public/` kopiert.

Keine dauerhafte Korrektur ausschließlich in der großen generierten `index.html`
vornehmen.

### 3.9 Jede Fehlerbehebung braucht einen Regressionstest

Die Nutzeranforderung war ausdrücklich adversarial: Grenzwerte, beschädigte Eingaben,
Rennen, Ressourcenerschöpfung, Zustandskorruption und ungültige Annahmen prüfen. Neue
Tests sollen notwendig, nicht redundant und verhaltensorientiert sein.

### 3.10 Öffentliche Änderungen nur bewusst deployen

Die Sites-URL ist Produktion. Lokale Arbeit oder ein Git-Commit ist noch kein
Deployment. Vor öffentlicher Veröffentlichung die Test-/Build-Checkliste in
`docs/TEST-BUILD-DEPLOYMENT.md` abarbeiten und die Nutzerfreigabe beachten.

## 4. Wie VANI heute aufgebaut ist

### 4.1 Produktidee

VANI ist kein steriler Notizmanager. Die App ist ein visuelles Schreibhaus mit
Räumen, Papier, Heften, Schnipseln, Funken, Wörtern, Clustern und Klang. Die
Gestaltung soll warm, ruhig, unkitschtig, taktil und iPad-tauglich bleiben.

### 4.2 Hauptnavigation

Die konfigurierbaren Räume in `src/40-router.js` sind:

- Zuhause
- Schnipsel
- Blätter
- Hefte
- Projekte
- Cluster
- Wörter
- Klang
- Goodnotes — standardmäßig verborgen, erscheint bei Inhalt
- Faden — standardmäßig verborgen, erscheint bei Inhalt

Suche und Feinheiten sind zusätzliche feste Navigationselemente.

### 4.3 Aktuelle Versionierung

Die Appversion steht mindestens in:

- `src/30-core.js` → `APP_VERSION`
- `sw.js` → `VERSION`
- `package.json`
- `package-lock.json` an der Projektwurzel
- `hosting/package.json`
- `hosting/package-lock.json`
- Hosting-Vertragstest mit erwarteter Appversion

Bei einem Versionswechsel müssen diese Werte gemeinsam geändert und anschließend
Web- und Hostingbuild neu erzeugt werden.

## 5. Vollständiger Funktionsstand aus Nutzersicht

### 5.1 Lokale Profile

- Profilgate beim Start.
- Name plus Passwort oder Code.
- Erstes Profil übernimmt vorhandene historische Daten.
- Weitere Profile besitzen getrennte IndexedDB-Datenbanken.
- PBKDF2-SHA-256 mit 350.000 Iterationen.
- Konstanter Vergleich des Prüfwerts.
- Rate-Limit/Verzögerung nach wiederholten Fehlversuchen.
- Passwortänderung ohne Verlust des umhüllten Sync-Geheimnisses.
- Wechsel zwischen Profilen durch Neustart/Reload.
- konfigurierbare automatische Sperre.
- Desktop-Sync-Geheimnisse zusätzlich per Electron `safeStorage` geschützt.

### 5.2 Zuhause, Funke und „Wieder aufgetaucht“

- Eigene Funken können frei eingegeben werden.
- Art und Vibe sind speicherbar.
- Eigene Funken liegen getrennt von generierten Funken in der Funkenkiste.
- Bearbeiten, löschen, suchen und direkt daraus schreiben.
- Generierte Funkenarten: Szene, Wer/Wo/Aber, Frage, Form, Satz.
- „Wieder aufgetaucht“ erkennt mehr als nur einen zufälligen alten Text:
  unfertige Gedanken, Zeitfäden, entfernte Wort-Echos und ältere Funde.
- Funken können Beziehungen zu anderen Dokumenten erhalten.

### 5.3 Schnipsel

- Klassischer chronologischer Faden.
- Neuer freier Modus auf großer Fläche.
- Deterministische freie Positionen, damit Layout nicht bei jedem Start springt.
- Fläche wächst mit der Menge; frei scroll- und durchsuchbar.
- Schnipsel können in Blatt, Heftseite, Szene, Clusterblase oder Wort verwandelt
  beziehungsweise dort eingeklebt werden.
- Original kann beim Einkleben erhalten bleiben.
- Bilder und Text werden berücksichtigt.

### 5.4 Blätter

- Eigenständige Texte mit Sortierung.
- Rich Text und Plain Text.
- Duplizieren.
- An frei gewählter Position als Seite in ein Heft einheften.
- Seite später wieder zu einem freien Blatt machen.
- Alternativ als sichtbare Kopie mit Tesa auf eine Heftseite kleben.
- Beziehungen und Clusterabbilder möglich.

### 5.5 Hefte

- Heftregal mit taktilen Umschlägen.
- 24 kuratierte Farben plus eigene Farben.
- Kombinierbare Vorder-/Zweitfarbe und Bandfarbe.
- Muster: Leinen, diagonal, Punkte, Rahmen, Welle, schlicht.
- Papier: liniert, kariert, blank, Punkte, breit.
- Zwei Ansichten:
  - `seiten`: einzelne Seiten mit Blättern;
  - `rolle`: fortlaufend scrollbar.
- Automatischer Seitenwechsel ist standardmäßig aktiviert.
- Lange Eingaben und große Pastes werden in weitere Seiten aufgeteilt.
- Rich-Text-Teilung benutzt DOM-Range/Struktur und erhält Formatierung soweit
  praktisch möglich.
- Plain-Text-Teilung bevorzugt Wort-/Zeilengrenzen.
- Texte bleiben vollständig erhalten; Smoke-Test prüft 850 Wörter über 8 Seiten.
- Zettel und Fotos können befestigt werden als:
  - Tesa;
  - Reißzwecke;
  - lose aufgelegt.
- Befestigung kann visuell geändert werden.
- Zeichnen/Kritzeln auf Seiten mit Farbe, eigener Farbe, Dicke, Radierer, Undo.
- Hefte können Projekten zugeordnet werden.
- Hefte können als Kapitel/Szenen in ein Projekt kopiert werden; das Originalheft
  bleibt bestehen, Quellenbeziehungen werden angelegt.

### 5.6 Rich Text und Schreiben

- Bold, italic, underline, strike.
- Listen, geordnete Listen, Blockzitat.
- H1, H2, H3.
- Textausrichtung.
- freie Schriftgröße über Slider.
- freie Textfarbe.
- freie Markierfarbe.
- sowohl Schreibraum als auch Heftseiten nutzen den Rich-Editor.
- Sanitizer erlaubt nur definierte Tags und sichere Inline-Stile.
- Ereignisattribute, Script, Bilder und fremde gefährliche Elemente werden entfernt.
- Klartextspiegel bleibt für Suche, Statistik und Sync erhalten.
- Schreibmaschinen-Scrolling, Fokusmodus, Suche/Ersetzen, Stände und Sprints bleiben.

### 5.7 Beziehungen und „Dinge ineinander“

Neue zentrale Datei: `src/39-beziehungen.js`.

Beziehungsarten:

- gehört dazu
- inspiriert
- erklärt
- widerspricht
- spiegelt
- Fortsetzung von
- Figur / Ort

Strukturelle Beziehungen (`parent`, `projekt`, `projektRef`, `quelle`) und sichtbare
`bezug`-Dokumente werden gemeinsam dargestellt. Selbstbeziehungen und Dubletten
werden verhindert.

Unterstützte Aktionen:

- Blatt an eine konkrete Heftposition;
- Schnipsel/Blatt auf Heftseite kleben;
- Dokument auf Clusterbrett spiegeln;
- Heft Projekt zuordnen oder lösen;
- Heft als Kapitel/Szenen in Projekt kopieren;
- beliebige sichtbare Dokumente semantisch verbinden;
- Beziehungen wieder lösen.

### 5.8 Projekte und Cluster

- Projekte besitzen Kapitel und Szenen.
- Hefte können Projektreferenz haben.
- Kopieren eines Hefts erzeugt Kapitel plus Szenen und Quellenbezüge.
- Cluster können Abbilder anderer Dokumente enthalten.
- Kanten und Bezüge werden beim Löschen ihrer Ziele mitbereinigt.
- Geisterverweise (`projektRef`, `quelle`) werden entfernt und bei Undo restauriert.

### 5.9 Persönliche Wortkisten

Seit VANI 5.1:

- `wortkiste` ist ein eigener Dokumenttyp.
- Eigene Kisten mit Titel, Notiz und Farbe.
- Alte Wörter ohne gültige Kiste erscheinen als „Lose Wörter“.
- „Alle Wörter“ zeigt den gesamten Schrank.
- Mehrfachzugabe per Komma, Semikolon oder neuer Zeile.
- Pro Import maximal 500 Einträge; Ausdruck maximal 160 Zeichen.
- Normalisierte Dubletten innerhalb einer Kiste werden vermieden.
- Suche umfasst Wort und Wortnotiz.
- Sortierung A–Z, zuletzt geändert oder älteste zuerst.
- Favoriten werden oben angeheftet.
- Wortzettel besitzen optionale Notiz, z. B. Bedeutung, Beispielsatz oder Synonyme.
- Verschieben oder Kopieren in andere Kisten.
- Schütteln zieht drei unterschiedliche Wörter aus aktueller Kiste oder Gesamtbestand.
- Zufallsgriff ist Fisher-Yates-artig, begrenzt, terminiert bei kaputter Zufallsquelle
  und verändert die Ursprungsliste nicht.
- Löschen nur der Kiste lässt Wörter lose.
- Löschen samt Inhalt verschiebt alles als Bündel in den Papierkorb.
- Undo restauriert auch frühere `parent`-Zuordnungen.
- Wortkisten erscheinen in allgemeiner Suche und Beziehungswähler.
- Wortkisten und Wörter synchronisieren wie alle anderen Dokumente.

### 5.10 Goodnotes

- Eigener stiller Raum, keine Zerlegung in Schnipsel oder Blätter.
- Importiert PDF, Bilder und `.goodnotes`-Originale als Kopie.
- Titel, Stichwörter und Notiz.
- Fingerabdruck gegen Dubletten.
- Eigene Suche nur im Archiv.
- Bewusst nicht in der globalen Suche, damit importierte Archive nicht spammen.
- Metadaten synchronisieren immer; große Originalmedien nur bei aktivierter
  `goodnotesSync`-Option.
- Kein echter Zwei-Wege-Live-Sync mit der Goodnotes-App. VANI ist ein Archivimport.

### 5.11 Faden und Suche

- Verschlüsseltes historisches Fadenpaket `faden.enc` kann per Passwort importiert
  werden.
- Das Passwort gehört nicht in Dokumentation oder Sourcecode.
- Globale Suche besitzt Typfilter, normalisierte Suche und begrenzte Tippfehlernachsicht.
- Treffer im Faden speichern die exakte Nachricht-ID.
- Auch wenn `#/faden` schon geöffnet ist, erzwingt der Treffer ein Neuzeichnen und
  springt exakt zur Nachricht.
- IDs mit Sonderzeichen werden ohne unsichere CSS-Selektorkonstruktion behandelt.
- Wortkisten sind suchbar; Goodnotes bleibt bewusst getrennt.

### 5.12 Klang

- 22 prozedural erzeugte WebAudio-Atmosphären, keine Audiodateien.
- Kategorien: Wetter, Wasser, Feuer, Natur, Nah & warm, Orte.
- 12 fertige Mischszenen.
- Beliebige eigene Mischungen mit Einzelreglern.
- Wahrnehmungsnähere Lautheitskurve statt linearer, zu leiser Regelung.
- Testton und „Klang neu wecken“.
- iOS-Medienbrücke über ein dynamisch erzeugtes kleines WAV/HTML-Audioelement.
- Neuaufbau bei `interrupted`, `suspended`, Hintergrundrückkehr, `pageshow` und
  sichtbarem Stillstand.
- Ausstehende Timer und Audio-Nodes werden bei Stop bereinigt.
- Trotzdem bleibt ein externer WebKit-Plattformfehler möglich: Installierte iOS-PWAs
  können einen „running“-AudioContext melden, der nach Hintergrundbetrieb stumm ist.
  Die App mitigiert das, kann WebKit aber nicht vollständig reparieren.

### 5.13 PWA, Home-Bildschirm und Updates

- stabile Manifest-ID und Start-URL;
- Service Worker Version 5.1.0;
- Navigation network-first mit Offline-Fallback;
- statische Assets Cache-first plus Hintergrundaktualisierung;
- alte Caches werden bei Aktivierung entfernt;
- Updatehinweis mit „Neu laden“;
- expliziter Updateknopf in Feinheiten;
- `registration.update()`, Aktivierung eines wartenden Workers und Reload;
- gleiches Home-Bildschirm-Icon nach Updates;
- Anleitung für blockiertes iPadOS-Löschen in der App/Dokumentation.

### 5.14 Desktop-App

- Electron 43, Windows x64 Setup und Portable.
- App-ID: `de.vani.schreibzuhause`.
- eigenes privilegiertes Protokoll `vani://app/`.
- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`.
- Navigation auf fremde Seiten gesperrt/extern geöffnet.
- restriktive Berechtigungsbehandlung.
- Sync-Geheimnisse per Electron `safeStorage`.
- atomic temp-file write für geschützte Konfiguration.
- Deinstallation löscht Appdaten absichtlich nicht.
- Desktopshortcut und Startmenüeintrag.
- `electron-updater` ist vorbereitet.
- Automatischer nativer Updatekanal ist **noch nicht konfiguriert**, da
  `desktop/config.json` keine öffentliche `updateUrl` besitzt und kein fertiger
  signierter Releasekanal vorhanden ist.
- Ein neues Setup kann über die alte Installation ausgeführt werden.

### 5.15 Synchronisation

- Optionaler privater Bereich pro Person.
- Kopplungscode enthält Serveradresse, Vault-ID, Authentifizierung und Inhaltskey in
  begrenztem, prüfbarem Format.
- AES-256-GCM vor Upload.
- Yjs/Y.Text für konfliktarmes paralleles Textschreiben.
- Y-IndexedDB für lokale CRDT-Persistenz.
- lokale Warteschlange `sync-pending` überlebt Offlinezeit und Appende.
- Dokumentmetadaten und Einstellungen werden synchronisiert.
- Medien werden authentifiziert verschlüsselt und blockweise übertragen.
- Server sieht Vault-ID, Hash des Zugriffstokens, Sequenzen, Größen und Geheimtext,
  aber keinen Klartext/Inhaltskey.
- Cloudflare/Sites-Ausgabe: D1 für Metadaten, R2 für verschlüsselte Pakete.
- Unabhängige Node-/SQLite-Ausgabe unter `sync-server/`.
- Deduplizierung, Reihenfolge, Bereichsisolation, Bodylimits und Authfehler getestet.

## 6. Wichtige tatsächlich gefundene und behobene Fehler

Die Arbeit war nicht nur Featurebau. Unter anderem wurden diese Bugs gefunden:

1. **Rich-Toolbar `ReferenceError: title is not defined`**
   Ursache: freier Bezeichner statt `title: titel`. In `src/35-richtext.js` behoben
   und mit Quellvertrag abgesichert.

2. **Klangregler bewegten sich, aber iPad-PWA blieb stumm**
   Lautheitskurve, Benutzer-Geste, Medienbrücke, Neuaufbau und Testton ergänzt.

3. **Faden-Suche sprang auf offener Route nicht neu**
   Exaktes Ziel in `sessionStorage`, erzwungenes Neuzeichnen und sichere ID-Suche.

4. **„Zaehlungen“ statt „Zählungen“**
   sichtbare Texte und weitere ae/ue-Stellen bereinigt.

5. **Große Rich-Text-Pastes konnten Seitenlogik verlieren**
   strukturtreue Rich-Aufteilung und reale 850-Wort-Smoke-Prüfung ergänzt.

6. **Potenzielle CSS-/HTML-Injektion aus Sicherungen**
   zentrale Begrenzung und Sanitizer für Farben, Rich HTML, Positionen, Mischungen,
   Zähler, IDs und bekannte Enumerationen.

7. **Projektlöschung hinterließ Geisterverweise**
   `projektRef` und `quelle` werden im Papierkorbbündel protokolliert, entfernt und
   bei Undo restauriert.

8. **Wortkisten-Löschung hätte bei Undo die Einsortierung verloren**
   `loesche(..., kinderDerWurzelBehalten)` und `parent`-Referenzrestauration ergänzt.

9. **Erster Wortkisten-Zufallsgriff benutzte einen Einzelelement-Zufall wie ein Array**
   Beim neuen UI-Smoke entdeckt; durch robusten `wortZufallsgriff` ersetzt und
   dauerhaft getestet.

10. **Linter lief in generierte Hosting-Pakete und erzeugte Tausende Scheinfunde**
    Build-/Work-Verzeichnisse in `hosting/eslint.config.mjs` ausgeschlossen; echte
    Next-Link-Warnung auf der Fallbackseite behoben.

11. **Service-Worker-/Icon-Updateannahmen waren unklar**
    stabile Identität, Netzwerkstrategie, Updateknopf und klare Nutzeranleitung.

12. **Ressourcen- und Grenzrisiken**
    Importgrößen, Dokumentfelder, Profile, Kisten, Textlängen, Sync-Bodies,
    Audiopegel, Positionen und Serverantworten begrenzt.

## 7. Wo welche Änderung hauptsächlich lebt

| Bereich | Primäre Dateien |
|---|---|
| Design, Responsive, Animation | `src/10-style.css` |
| Kern, IndexedDB, Dokumente, Papierkorb, Sanitizing | `src/30-core.js` |
| lokale Profile | `src/29-profile.js` |
| verschlüsselter Client-Sync | `src/31-sync.js` |
| Rich Text und automatische Rich-Aufteilung | `src/35-richtext.js` |
| Medienhelpers | `src/38-media.js` |
| Beziehungen, Einheften, Einkleben, Projektkopien | `src/39-beziehungen.js` |
| Navigation | `src/40-router.js` |
| Zuhause, Funken, Wieder-Funde | `src/41-zuhause.js` |
| Schnipsel/Freifläche/Verwandlungen | `src/42-schnipsel.js` |
| Blätter | `src/42b-blaetter.js` |
| Faden | `src/42c-faden.js` |
| Goodnotes | `src/42d-goodnotes.js` |
| Hefte, Seiten, Zeichnen, Autopaginierung | `src/43-hefte.js` |
| Projekte | `src/44-projekte.js` |
| Vollbild-Schreibraum | `src/45-schreibraum.js` |
| Cluster | `src/46-cluster.js` |
| Wortkisten und Wörter | `src/47-woerter.js` |
| globale Suche | `src/48-suche.js` |
| Einstellungen, Profile, Sync, Updates, Sicherung | `src/49-feinheiten.js` |
| WebAudio-Engine und Atmosphären | `src/50-audio.js` |
| Klangraum-UI | `src/51-klangraum.js` |
| Start, Migration, SW und Lifecycle | `src/60-boot.js` |
| Webbuild | `werkzeug/build-web.mjs`, `build.sh` |
| Testsandbox | `test/sandkasten.mjs` |
| Edge-/Regressionstests | `test/kern-edge.mjs` |
| bestehende Kernverhalten | `test/lauf.mjs` |
| Verträge/Struktur | `test/vertraege.mjs` |
| Client-/Server-Sync-Tests | `test/sync-client.mjs`, `test/sync-server.mjs` |
| Desktop | `desktop/main.cjs`, `desktop/preload.cjs`, `desktop/config.json` |
| eigenständiger Sync-Server | `sync-server/server.mjs` |
| Sites-Sync-Worker | `hosting/worker/index.ts` |
| Sites-Projekt | `hosting/` |
| Service Worker / Manifest | `sw.js`, `manifest.json` |

## 8. Bewusste Grenzen und ehrliche Nicht-Features

Claude darf diese Punkte nicht als bereits fertig darstellen:

1. **Kein zentrales E-Mail-/Cloudkonto.** Profile sind lokal; Sync koppelt Vaults.
2. **Kein serverseitiges Passwort-Reset.** E2E-Geheimnisse sind nicht recoverbar.
3. **Kein echter Live-Goodnotes-Zweiwegesync.** Es ist ein separater Archivimport.
4. **Kein öffentlicher nativer Desktop-Autoupdater.** Setup-Update ist derzeit nötig.
5. **Windows-Installer ist nicht über die öffentliche VANI-Seite herunterladbar.**
   Die Datei liegt lokal im Releaseordner und muss z. B. per Cloud/USB verteilt werden.
6. **Spotify-Integration ist noch nicht implementiert.** Desktoparchitektur erlaubt
   später zusätzliche Features, aber Spotify ist nur Zukunftsidee.
7. **Keine gebauten macOS-/Linux-Releases.** Targets sind vorbereitet, gebaut wurde
   Windows x64.
8. **WebKit-Audiofehler kann nicht vollständig von Appcode garantiert behoben werden.**
9. **Die öffentliche URL ist öffentlich erreichbar**, aber persönliche Inhalte sind
   lokal beziehungsweise Ende-zu-Ende verschlüsselt. Öffentlich bedeutet nicht, dass
   Nutzerdaten öffentlich sind.
10. **GitHub ist seit VANI 5.2.0 wieder auf dem lokalen Stand** (Push am 21. August
    2026 nach ausdrücklicher Nutzerfreigabe „veröffentliche"). Damit ist auch die
    GitHub-Pages-Adresse `https://thekeveldikev.github.io/vani/` aktuell — dort hängt
    die ursprüngliche iPad-Installation des Nutzers. Siehe Abschnitt 11.

## 9. Externes Material

Der Nutzer verwies auf:

- `C:\Users\kevin\Desktop\Chat\nachrichten2.txt`
- daneben existiert auch `C:\Users\kevin\Desktop\Chat\nachrichten.pdf`

Die Korrektur des Nutzers war ausdrücklich: Die relevante zweite Datei ist die
TXT-Datei, nicht eine vermeintliche `nachrichten2.pdf`. Sie enthält persönliche
Nachrichten und soll nicht in das Repository kopiert oder breit ausgegeben werden.
Nur lesen, wenn eine konkrete Aufgabe den Inhalt benötigt.

## 10. Empfohlener Übernahmestart für Claude

1. `git status -sb` ausführen.
2. Prüfen, dass HEAD mindestens `0301606` enthält.
3. Diese Datei vollständig lesen.
4. Danach `docs/CODEX-CHANGELOG.md` und `docs/TECHNISCHE-ARCHITEKTUR.md` lesen.
5. Vor Änderungen `npm test` ausführen.
6. Nur `src/` und echte Quell-/Testdateien bearbeiten.
7. Nach Webänderungen `npm run build:web` ausführen.
8. Relevante Regressionstests ergänzen.
9. Vor Desktop- oder Public-Release die vollständige Checkliste abarbeiten.
10. Dem Nutzer auf Deutsch, verständlich und ohne Entwicklerjargon zusammenfassen.

Der kopierfertige Prompt steht in `docs/CLAUDE-STARTPROMPT.md`.

## 11. Stand nach der ersten Claude-Runde (21. August 2026, VANI 5.2.0)

Claude hat die Übernahme vollständig durchgeführt (alle Quellen gelesen, `npm test`
69/69 als Ausgangslage) und danach in zwei Schritten weitergebaut. Commits liegen
auf `main` hinter `a02ce4a`.

### 5.1.1 — vier stille Fehler, klarere Formatleiste

- `THEMEN` in `src/30-core.js` hatte keinen Eintrag `weiss`: das weiße Thema färbte
  die Geräte-Statusleiste beige. Vertrag in `test/vertraege.mjs` prüft jetzt, dass
  jede in den Feinheiten angebotene Stimmung eine Statusleistenfarbe hat.
- Zettel, Fotos und Blasen ohne `pos` (beschädigter Import) stürzten beim Anfassen
  bzw. beim Bauen eines Bretts ab. `sauberesDokument` ergänzt für diese Typen eine
  Position, `positioniere` in `src/43-hefte.js` repariert zur Laufzeit.
- Formatleiste: `justifyRight` fehlte (die Doku versprach es), dazu Überschrift
  (`h2`) und Absatz (`p`); Ausrichtung jetzt mit eigenen Icons (`ausLinks` …).
- `src/48-suche.js`: ein beschädigter Suchverlauf in `localStorage` ließ die Suche
  nicht mehr aufgehen → `leseLetzteSuchen()` mit Schutz.
- `zeigeDeck` schließt die oberste Lage mit Escape; alle `setPointerCapture`-Aufrufe
  sind gegen Zeiger-Rennen abgesichert; Räume kommen mit `raum-kommt`-Animation an.

### 5.2.0 — die Anleitung in der App

- Neue Quelle `src/52-anleitung.js` (Buildreihenfolge: nach `51-klangraum.js`, vor
  `60-boot.js`): Datenmodell `ANLEITUNG` (23 Kapitel, Abschnitte mit Absätzen,
  Schritten, Beispiel, Merke), reine Funktionen `anleitungSuche` und
  `anleitungHervorheben`, Overlay `oeffneAnleitung(kapitelId?)` /
  `schliesseAnleitung()` mit Kapitelnavigation, Live-Suche, „Aufschlagen"-Sprung in
  den jeweiligen Raum und Escape. Einstieg: Karte ganz oben in den Feinheiten plus
  Buch-Symbol im Feinheiten-Kopf. Ton absichtlich in der ersten Person („von mir
  aufgeschrieben"), kein Tutorial-Duktus.
- `test/kern-edge.mjs` prüft Vollständigkeit (jeder Raum aus `ALLE_RAEUME` hat ein
  Kapitel, das zu ihm führt), eindeutige IDs, Suche und Hervorhebung.
  Wer einen Raum hinzufügt, muss ein Kapitel ergänzen — der Test erzwingt es.
- `syncStandardServer()` in `src/31-sync.js` schlägt auf reinen Seiten (GitHub
  Pages, `*.pages.dev`, `file:`) den öffentlichen Dienst `SYNC_STANDARD_DIENST`
  (`https://vani-schreibzuhause.craftkey.chatgpt.site`) vor; auf eigenen
  HTTPS-Hosts weiterhin `location.origin`, lokal `localhost`.

Qualitätsstand: `npm test` 77/77, Hosting 2/2, Lint sauber, paketierter Desktop-Smoke
auf 5.2.0 bestanden, Browser-Verifikation von Anleitung, Formatleiste, Escape und
Weiß-Thema.

### Historischer Veröffentlichungs-Zwischenstand vor VANI 5.2.1

- **GitHub / GitHub Pages:** `origin/main` wurde nach Nutzerfreigabe auf den lokalen
  Stand gepusht. `https://thekeveldikev.github.io/vani/` (Pages, Branch `main`,
  Pfad `/`) liefert damit VANI 5.2.0. **Dort hängt die ursprüngliche iPad-Installation
  des Nutzers** — sie aktualisiert sich hinter demselben Icon.
- **Sites (`https://vani-schreibzuhause.craftkey.chatgpt.site`):** Claude besitzt das
  Sites-Hostingwerkzeug nicht. Diese Adresse zeigt weiterhin VANI 5.1.0, bis Codex
  eine neue Version des bestehenden Projekts `appgprj_6a8786eb79448191acff5186595d06ec`
  speichert und deployt (Ablauf in `docs/TEST-BUILD-DEPLOYMENT.md` §13). Der
  Sync-Dienst (`/v1`) dort läuft unverändert und wird von beiden Adressen benutzt.
- Beide Adressen sind dieselbe App, aber **getrennte Datenbestände** (Browser trennt
  nach Herkunft). Zusammenführen geht über den Sync-Bereich (Kopplungscode).
- Windows: `release/VANI-5.2.0-x64-Setup.exe` und `…-Portable.exe` lokal gebaut,
  nicht öffentlich verteilt.

### Historischer Codex-Auftrag — nach Abschnitt 12 nicht mehr verwenden

    Arbeite in C:\Users\kevin\VANI. Der lokale Stand main = origin/main ist VANI
    5.2.0 und vollständig getestet (npm test 77/77, hosting npm test 2/2, lint sauber,
    Desktop-Smoke bestanden). Bitte nur veröffentlichen, nichts umbauen: npm run
    build:web, in hosting npm test und npm run lint ausführen, dann mit der
    Sites-Hostingfunktion eine neue Version des bestehenden Projekts
    appgprj_6a8786eb79448191acff5186595d06ec
    (https://vani-schreibzuhause.craftkey.chatgpt.site, Konfiguration
    hosting/.openai/hosting.json) speichern und öffentlich deployen. Keine zweite Site,
    keine Bindings ändern. Danach mit Cache-Busting prüfen, dass APP_VERSION 5.2.0
    ausgeliefert wird, und mir die Deploymentversion nennen.

## 12. Verbindlicher Ein-Adress-Stand ab VANI 5.2.1

Dieser Abschnitt ersetzt die Veröffentlichungsannahmen aus Abschnitt 11, soweit sie
sich widersprechen.

### Eine App, ein Icon

Die einzige sichtbare und installierbare Web-App ist:

    https://thekeveldikev.github.io/vani/

Hier hängen iPad, iPhone, Android und Browser-PWA. Web-Updates werden nach Tests auf
origin/main gepusht und kommen über den Service Worker hinter demselben Icon an.
Claude kann diesen normalen Weg vollständig bedienen.

### Sites ist kein zweites VANI mehr

Die Adresse:

    https://vani-schreibzuhause.craftkey.chatgpt.site

ist ausschließlich Infrastruktur:

- /v1 bleibt der Ende-zu-Ende-verschlüsselte Sync-Dienst;
- normale Besuche der Startseite werden zur einzigen GitHub-App geleitet;
- der frühere Sites-Service-Worker wird stillgelegt und seine Caches werden entfernt;
- ein absichtlicher Rettungsmodus kann alte, nur unter dieser Origin vorhandene
  lokale Daten noch öffnen, sichern oder synchronisieren;
- sein genauer Pfad ist
  `https://vani-schreibzuhause.craftkey.chatgpt.site/rettung.html?rettung=1&kein-sw=1`;
- die Rettungsfassung darf nicht neu zum Home-Bildschirm hinzugefügt werden.

Dadurch gibt es für Nutzer keine zweite App, keine zweite Updatequelle und keinen
zweiten normalen lokalen Bestand.

### Profile, Accounts und Mehrgeräte-Sync

- Profile sind weiterhin lokale Passwort-Türen pro Gerät.
- Passwörter werden nicht übertragen und nicht serverseitig gespeichert.
- Beide Personen erhalten getrennte Profile und getrennte private Bereiche.
- Nur Geräte mit demselben Kopplungscode teilen denselben Inhalt.
- GitHub-PWA, Handy und Desktop verwenden alle den Sites-/v1-Tresor im Hintergrund.
- Offlineänderungen warten lokal und werden später konfliktarm zusammengeführt.
- Der Desktop bleibt eine eigene Hülle; sein Programmupdate braucht weiterhin eine
  neue Setup-Datei, seine Inhalte synchronisieren dennoch live.

### Wann Claude Sites braucht

Bei normalen Änderungen an Oberfläche, Schreiben, Heften, Suche, Klang, Anleitung,
Profilclient oder PWA braucht Claude Sites nicht. Bauen, testen und origin/main
pushen genügt.

Nur wenn hosting/worker, das v1-Protokoll, D1/R2, Serverlimits oder der Rettungsweg
verändert werden, muss Codex das bestehende Sites-Projekt neu deployen. Das ist
selten und kein Teil jedes App-Updates.

## 13. Stand nach der zweiten Claude-Runde (21. August 2026, VANI 5.3.0)

### Kritzeln: gezeichnet ist jetzt gleich gezeichnet

Der Nutzer meldete, Striche erscheinen „versetzt, zu dick, komisch“. Zwei echte
Ursachen, beide reproduziert:

1. **Eine `<canvas>` ist ein ersetztes Element.** Mit `position:absolute; inset:0`
   und `width:auto` zeigt sie sich in ihrer **Attributgröße**, nicht gedehnt. Weil
   `canvas.width = breite * dpr` gesetzt wurde, war die Fläche auf einem Retina-iPad
   **doppelt so groß** wie das Papier — jeder Strich saß versetzt und zu dick.
   Fix: `.kritzelflaeche` bekommt `width:100%; height:100%`.
2. **Die Werkzeugleiste floß im Layout mit** (`position:sticky`, in `.inhalt`
   eingehängt). Gemessen wurde 523px, danach war die Seite 508px breit und 134px
   tiefer. Fix: die Leiste hängt an `document.body` und ist `position:fixed`.

Zusätzlich neu aufgebaut: Striche werden als **auf die Breite normierte Punktfolgen**
gespeichert statt nur als Pixel. Daraus folgt ohne Bildspeicher:

- **Rutschfestigkeit:** eine Layoutänderung verschiebt nichts mehr (ResizeObserver).
- **Mehrfaches Zurück und Wiederherstellen** statt eines einzigen Undo-Schritts.
- **Alles löschen** als eigener Eintrag in der Strichliste — auch das ist rückgängig.
- **Abbrechen** neben Fertig; vorher konnte man eine Zeichnung nicht verwerfen.
- Stiftdruck nur noch bei echtem Stift (`pointerType === 'pen'`), Radiererbreite
   hängt an der eingestellten Dicke statt an einem festen Mindestwert.

Verifiziert im Browser: Linie bei y=99,5 statt 100 (reine Kantenglättung),
gespeichertes Bild exakt 523×667 = Papiergröße, Strich überlebt einen Breitenwechsel
von 508 auf 361 Pixel an derselben relativen Stelle.

### Weiterer echter Fund

`blatt.append(skizzenbild, titel, formatleiste, text, werkzeuge)` — bei einer nicht
formatierten Seite ist `formatleiste` `null`, und die native `append`-Methode setzt
dafür den sichtbaren **Text „null“** auf jede schlichte Heftseite. Jetzt mit
`.filter(Boolean)`. Der `el()`-Helfer filtert selbst; native `append`-Aufrufe nicht.

### Faden nicht mehr öffentlich (Nutzerentscheidung „Weg B“)

`faden.enc` (549 KB persönlicher Chat, verschlüsselt) lag öffentlich abrufbar auf
GitHub Pages. Jetzt: aus der Git-Verwaltung genommen, in `.gitignore`, aus dem
Service-Worker-Kern und aus `hosting/scripts/copy-vani.mjs` entfernt.

**Wichtig:** Die Datei aus dem Offline-Kern zu nehmen ist Pflicht — `cache.addAll`
scheitert an einer fehlenden Datei und hätte die gesamte Offline-Installation
zerstört.

Wege zum Faden bleiben: gekoppelter Sync-Bereich, die Desktop-App (bündelt
`faden.enc` weiter über `package.json` → `files`) und `fadenPaketHolen()` mit
Dateiauswahl von Hand. Die Datei bleibt lokal im Arbeitsverzeichnis liegen.

### Privatsphäre im öffentlichen Repo

Echte Vornamen standen in `test/lauf.mjs` (WhatsApp-Beispielzeilen) und in drei
Dokumenten — entgegen Regel 3.3. Entfernt; ein Vertragstest hält ausgelieferten
Code und Testdaten dauerhaft frei davon.

### Warum das Repo öffentlich bleibt

Nicht wegen des Syncs — der Tresor akzeptiert jede Herkunft
(`Access-Control-Allow-Origin: *`) und funktioniert auch aus der Desktop-App ohne
Webadresse. Öffentlich ist allein die Bedingung für kostenlose GitHub Pages. Ein
privates Repo bräuchte GitHub Pro; das wurde dem Nutzer als Weg A angeboten und
vorerst nicht gewählt.

Qualitätsstand: `npm test` 82/82, Hosting 2/2, Lint sauber.

## 14. Stand nach der dritten Claude-Runde (21. August 2026, VANI 5.4.0)

### Einfügen aus fremden Apps (Goodnotes, PDF, Notizen)

Der Nutzer meldete „seltsame Formatierungsdinge“ beim Kopieren aus Goodnotes.
Reproduziert mit echtem Zwischenablage-HTML; vier Ursachen:

1. `sauberesRichHTML` behält `color`, `background-color` und `font-size`. Aus
   `12.0pt` wurde `12px` (winzig), aus `rgb(0,0,0)` schwarzer Text, der auf dem
   dunklen Papier der Themen Tinte und Kerze unlesbar ist, dazu weiße Kästen.
2. Nicht erlaubte Elemente wurden durch ihren `textContent` ersetzt — aus einer
   Tabelle wurde „Zelle AZelle B“, aus `<section><h4>` ein zusammengeklebtes Wort.
3. Ohne `text/html` griff gar kein Filter.
4. `richReinerText` arbeitet auf einem **losgelösten** `div`; dort liefert
   `innerText` keine Zeilenumbrüche. Der Klartextspiegel jeder formatierten Seite
   klebte damit zusammen — sichtbar in Suche, Export und Wortzählung.

Neu in `src/35-richtext.js`: `einfuegeHTML()` und `einfuegeAusText()` bauen fremdes
HTML in ruhige Blöcke um (Absätze, Überschriften h1–h3, Listen, Zitate, b/i/u/s),
trennen Tabellenzellen und Abschnitte und lassen fremde Größen, Farben,
Hintergründe und Ausrichtungen draußen. `richReinerText` setzt Zeilen selbst.

### Dritte Heftansicht „Am Stück“

`heft.ansicht` kennt jetzt `fluss` (Sanitizer erweitert). `zeigeFluss()` rendert
alle Seiten in einem `.fluss-bogen` ohne Seitenkanten, ohne Seitenzahlen und ohne
automatischen Umbruch; Werkzeuge und leere Titelzeilen treten zurück, bis das
Stück den Fokus hat. Gedacht für Lesen und für große Textmengen von außen.

### `textHereinholen()`

Heft-Menü → „Text aus einer anderen App hereinholen“: ein Einfügefeld, das den
Filter benutzt und den Inhalt als Seite ablegt. Notwendig, weil ein verwaltetes
iPad die Dateiauswahl für alles außer Goodnotes-Dateien sperrt — Einsetzen geht
immer.

### Systematischer Dialogfehler

`zeigeDeck(kasten, () => res(null))` löst beim Schließen `null` aus. Wer erst
`zu()` ruft und danach `res(wert)`, verliert sein Ergebnis still. Betroffen war
`eigenerFunkeAnlegen` in `src/41-zuhause.js`: die Funkenkiste frischte nach dem
Anlegen nicht auf, und Zuhause wechselte nicht auf „Meine“. Ein Vertragstest
prüft die Reihenfolge jetzt in allen Dialogdateien.

### Berührung statt Maus

Ein `:hover`-only-Zustand hätte die Seitenwerkzeuge auf dem iPad unerreichbar
gemacht. Regel: nichts, was man braucht, darf nur per Hover erscheinen.
Nachgemessen: alle fünf Werkzeuge sind in allen drei Ansichten bei 375 px und
820 px sichtbar, groß genug und antippbar, ohne seitlichen Überlauf.

### Anleitung

Der Nutzer suchte „Zettel ankleben“ in den drei Punkten der Kopfzeile. Es gibt
zwei Mal drei Punkte: Kopfzeile = Heft-Menü, auf dem Papier = Seiten-Menü. Die
Anleitung nennt die fünf Werkzeuge jetzt einzeln und sagt ausdrücklich, dass sie
auf dem Papier sitzen.

Qualitätsstand: `npm test` 85/85, Hosting 2/2, Lint sauber.

## 15. Handy-Runde (21. August 2026, VANI 5.5.0)

Der Nutzer meldete vom Android-Zweithandy: „Tabs rutschen nach oben, komischer
Platz von unten“, „beim Faden holen kam kein Eingabefeld“, dazu „viele
Layoutfehler“. Alles reproduziert und an der Wurzel behoben.

### Die Seite selbst durfte scrollen

`html`/`body` waren `height: 100%` (großer Viewport), `#app` aber `100dvh`
(sichtbarer Viewport). Differenz = Höhe der Adressleiste → die ganze Seite ließ
sich schieben, die untere Leiste wanderte nach oben, darunter klaffte eine Lücke.
Jetzt: `html`/`body` mit `overflow: hidden`, `#app` an `--vvh` (visualViewport).
Einziger Scrollbereich ist `#raum`.

### Die Tastatur verdeckte die Eingabe

Ohne `interactive-widget=resizes-content` legt Chrome die Tastatur über die Seite,
ohne das Layout zu verkleinern. Ein mittig zentrierter Dialog stand damit hinter
der Tastatur — sichtbar blieb nur die Überschrift, das Feld nicht. Daher „kein
Eingabefeld“ beim Faden. Meta ergänzt; `.schleier`, `.modal` und `.menue` messen
sich zusätzlich an `--vvh`. Nachgemessen mit simulierter Tastatur (492 px):
Passwortfeld bei 227–271, Leiste über der Tastatur.

### Suche und Feinheiten waren unerreichbar

`#leiste` ist ein Grid-Element ohne `min-width: 0` und wuchs auf 582 px bei
375 px Bildschirm. Suche (511) und Feinheiten (574) lagen damit außerhalb; die
Leiste war zwar seitlich scrollbar, das aber sieht niemand. **Das ist die
wahrscheinlichste Ursache für die Nutzermeldung „viele Funktionen fehlen“.**
Jetzt liegen die Räume in `.raumrolle` (scrollt, mit Verlaufmaske), Suche und
Feinheiten stehen fest daneben und sind immer antippbar.

### Weitere Handy-Funde

- Statistik: 14 Tagesbalken passen nicht auf 375 px und wurden abgeschnitten
  (`min-width: auto` verhinderte das Schrumpfen). Auf schmalen Geräten jetzt
  sieben Tage — lieber weniger, die man liest.
- Funkenarten lagen hinter einem unsichtbaren Seitwärtsschub; jetzt umbrechend.
- Klangnamen waren 21 px hohe Schaltflächen; jetzt mindestens 40 px.
- Toasts erschienen hinter der unteren Leiste.

### „Am Stück“: eine Werkzeugreihe statt vieler

Jedes Stück brachte seine eigene Werkzeugreihe mit — in einer durchgehenden
Seite bloß Lärm. `seitenWerkzeuge(ziel, ...)` ist jetzt eine gemeinsame Funktion;
im Fluss hängt sie einmal oben am Bogen und wirkt auf das Stück mit dem Fokus,
sonst auf das letzte.

### Regel für künftige Arbeit

Nach jeder Layoutänderung bei 375 px **und** 820 px nachmessen: kein seitlicher
Überlauf, jedes Bedienelement per `elementFromPoint` wirklich treffbar, nichts nur
per `:hover` erreichbar. Vier Vertragstests halten das fest.

Qualitätsstand: `npm test` 90/90, Hosting 2/2, Lint sauber.

## 16. Welle 1 (21. August 2026, VANI 5.6.0)

Nutzerauftrag: Brainstorm plus sofortige Umsetzung der ersten Welle, Bugfixing,
mehr Looks für Hefte und Zettel, viel mehr Funken. Umgesetzt:

### Funken

`src/34-inhalt.js`: FUNKEN 70→163, WER/WO/ABER je 16→40 (64.000 Kombinationen),
FRAGEN/FORMEN/SÄTZE je 10→40, neu `FUNKE_FIGUREN` (30) und `FUNKE_WENDUNGEN` (25).
`FUNKE_ARTEN` ist die eine Quelle für Zuhause und Wörter. Test prüft Mindestmengen,
Eindeutigkeit und die Grammatik der Wer·Wo·Aber-Teile (Komma-Enden, aber-Anfang).

### Hefte und Zettel

- `heft.papierfarbe` (hell|weiss|creme|kraft|nacht) und `heft.rand` (Randlinie),
  im Atelier wählbar; `papierKlassen(heft, extra)` baut die Klassen für Seite und
  Flussbogen. Sanitizer-Whitelist erweitert.
- `heftInhalt(heft, wohin)`: Seitenliste mit Titel/erster Zeile, Wörtern, Angeklebtem,
  Lesezeichen; Knopf im Heftkopf (Icon `inhalt`). Springt in jeder Ansicht über
  `sessionStorage.zielSeite`, das jetzt zentral über `zielAufnehmen()` genau einmal
  eingelöst wird (vorher folgte die Anzeige einer verschobenen Seite nicht).
- Seiten-Menü: Lesezeichen hierher (öffnet das Heft beim nächsten Mal dort, nur
  wenn in dieser Sitzung noch keine Seite gemerkt ist), Seite nach vorn/hinten,
  Seite verdoppeln (mit Zetteln, ohne Fotos/Kritzelei).
- Zettel: `ZETTELFARBEN` (8), `zettel.schrift` (hand|klar|serif), Form
  (schmal/normal/breit = pos.w 22/30/46), „Gerade rücken“.

### Projekte: Figuren & Orte

Neuer Typ `figur` (parent = Projekt, Felder titel/art/notiz/ord). `baueFigurenUndOrte`
zeigt Chips mit Vorkommenszählung in Szenen; `[[Name]]` springt über
`findeNachTitel` automatisch hin; `oeffneDoc` öffnet das Projekt; Suche hat die
Gruppe „Figuren & Orte“; `docIcon` kennt `figur`. Papierkorb: Figuren hängen am
Projekt und gehen mit ihm in den Korb und zurück (über `_nachfahren`).

### Vorlesen

`vorlesen(text, knopf)` / `vorlesenStopp()` in `src/45-schreibraum.js` über
`speechSynthesis`: deutsche Stimme bevorzugt, lange Texte in ~700-Zeichen-Stücke
(WebKit bricht lange Äußerungen ab), Tempo `D.einst.vorleseTempo`. Knöpfe im
Schreibraum, im Blatt-Menü und in der Leseansicht. Schließen stoppt.

### Suche, Zahlen, Blätter, Boot

- `schlagwortIndex(docs, max)` (30-core): #wort über alles, je Dokument einmal,
  Goodnotes ausgenommen; Wolke im Leerzustand der Suche.
- `jahresRaster(tage, wochen, jetzt)` (30-core): 7×Wochen, Montag-Start, Zukunft
  null, Stufen relativ zum Maximum im Fenster; Rendering in den Feinheiten (53 bzw.
  26 Wochen unter 620px). Der Test fand sofort einen Randfall: `wochen = 0` fiel auf
  53 zurück — behoben.
- Blätter: `gepinnt` (Sanitizer: boolean), oben in jeder Sortierung.
- `startAuftrag(search)` (30-core) + Boot: `manifest.json` bekommt `share_target`
  (GET, ./) und `shortcuts`; id/start_url/scope bleiben `./` (Vertragstest). Geteilter
  Text wird Schnipsel, die Adresse wird per `history.replaceState` wieder sauber.
  iOS unterstützt beides für Web-Apps nicht — die Anleitung sagt das.

Qualitätsstand: `npm test` 97/97, Hosting 2/2, Lint sauber.

### Ideen für spätere Wellen (nicht umgesetzt)

Zeitstrahl-Raum (alles nach Tagen), Zettel-Checklisten, Bilder auf Brettern,
Brett-Export als Bild, Szenen-Wortziele, Projekt-Export als Markdown/ZIP,
Schreibsitzungs-Protokoll, app-weite Schrift- und Akzentwahl, Reime/Wörter-Werkzeug,
Klang-Einschlaftimer, Zufallsfund-Knopf, Zitate-Sammlung, Spotify (Desktop).

## 17. Welle 2 (22. August 2026, VANI 5.7.0)

### Echte Ambiences — und die Lizenzfrage

Der Nutzer wünschte echte Aufnahmen statt gerechneter Klänge und gab die
BBC-Sammlung ausdrücklich frei („bleibt nur lokal“). **Diese Prämisse stimmt
faktisch nicht:** Das Repo ist öffentlich, GitHub Pages liefert jede Datei
weltweit abrufbar aus. Die BBC-Sammlung auf archive.org trägt keine freie Lizenz
(RemArc: privat/Bildung/Forschung, keine Weiterverbreitung).

Entscheidung nach Rücksprache: Die Aufnahmen liegen in `klang/` und werden
mitgeliefert — der Nutzer hat das ausdrücklich freigegeben und trägt die
Entscheidung. **Für künftige Arbeit gilt: keine weiteren geschützten Aufnahmen
hinzufügen, ohne die Lizenzlage erneut zu prüfen.** Der bessere Weg für mehr
Material ist „Eigener Klang“ (siehe unten): Dateien landen in IndexedDB und im
verschlüsselten Sync, nie im Repo.

Beschaffung (`werkzeug`-fremd, nur lokal gelaufen): archive.org-Metadaten
ausgewertet, 26 Atmosphären kuratiert, per `ffmpeg-static` je ein ruhiger
70-Sekunden-Abschnitt geschnitten, leicht normalisiert und als Opus 56 kbit/s
kodiert: **≈450 KB statt 4–15 MB je Aufnahme**.

**Nachtrag (VANI 5.8.0): 39 freie Aufnahmen dazu, Fundus jetzt 65 (26,9 MB).**
Diese stammen aus vier Sammlungen unter **CC0 bzw. Public Domain Mark** —
SSE Library: AMBIENCE, Valentino Sound Effects Library, Nature Sounds /
Sound Therapy, GOLD TAPE: Ambience. Damit ist die Lizenzfrage für den größeren
Teil des Fundus entschärft: Regen, Gewitter, Donner, Meer, Brandung, Sturm auf
See, vier Windstärken, Bach, Wasserfall, Grillen, Dschungel, Sumpf, Kaminfeuer
und rund zwanzig Orte sind frei. Jeder gewebte Klang hat nun eine echte
Entsprechung. Die Herkunft steht je Aufnahme im Katalog und in der App.

Drei Dinge, die beim Beschaffen Zeit kosteten und beim nächsten Mal nicht
wieder kosten müssen:

1. **archive.org liefert ~35 KB/s**, unabhängig von der Zahl paralleler
   Verbindungen — die Bandbreite wird geteilt, mehr Spuren bringen fast nichts.
2. **`fetch` ohne Zeitgrenze hängt unbegrenzt**, wenn die Gegenseite die
   Verbindung offen lässt und nichts mehr schickt. Der Wiederhol-Mechanismus
   greift dann nie, weil der Aufruf gar nicht zurückkommt. Nötig ist ein
   Wächter, der den Datenstrom beobachtet und abbricht, wenn N Sekunden kein
   Byte kam. Ein pauschaler Gesamt-Timeout taugt nicht: bei 35 KB/s braucht
   eine 50-MB-Datei über zwanzig Minuten, und das ist kein Fehler.
3. **Der entscheidende Hebel war `Range:`.** Gebraucht werden je nur 75–80
   Sekunden. WAV ist unkomprimiert und linear, also lassen sich aus dem Kopf
   Byterate und Datenanfang lesen und genau der gewünschte Ausschnitt abrufen;
   aus Kopf + Ausschnitt entsteht wieder eine gültige WAV-Datei. Das halbierte
   die Ladezeit (**12,6 MB statt 31 MB** je Aufnahme). Offsets müssen auf
   `blockAlign` gerundet werden, sonst verrutschen die Kanäle.

Ein Muster darf außerdem nicht nur auf den Dateinamen passen, sondern muss auf
eine **Audio-Endung** prüfen — sonst lädt es Beidateien wie `.afpk`, und ffmpeg
scheitert (genau daran starb „Werkstatt" im ersten Lauf).

### `src/53-ambience.js` — die Maschine

- **Nahtloser Loop ohne geschnittene Loops:** zwei `BufferSource` laufen versetzt,
  ihre Rampen kreuzen sich (`ambienceStimmeBauen`). Der erste Einsatz blendet in
  0,9 s auf, Wiederholungen weich über die eingestellte Zeit — sonst wartet man
  beim Antippen sekundenlang auf Stille (im Browser nachgemessen).
- **Atmen:** Lautstärke und Tiefpass wandern langsam, damit 70 s nicht nach 70 s
  klingen.
- **Lazy + Vorrat:** `ambienceBlob` holt über `fetch` mit Fortschritt, legt in
  `media` unter `ambience:1:<id>` ab. Danach offline. `sw.js` enthält bewusst
  **keine** Opus-Dateien — sonst scheitert `cache.addAll` an einer fehlenden Datei
  und die ganze Offline-Installation wäre hin (Vertragstest).
- **Klangbilder** (`typ: 'klangbild'`): Mischung + Feinheiten + Lautstärke unter
  einem Namen, `orte[]` bindet sie an Szene, Kapitel, Heft oder Projekt.
  `klangbildFuer` erbt nach oben; `klangbildFolgen` legt beim Öffnen auf.
- **Eigene Klänge** (`typ: 'klang'`): jede Audiodatei, gleichberechtigt, reist
  über den Sync mit.
- **Ausklang:** die ersten 60 % fast unverändert, dann Kurve gegen null.

### Weitere Welle-2-Stücke

- **Manuskript-Export** (`manuskriptText`, `projektHinausgeben`): Markdown mit
  sieben Schaltern und Live-Vorschau.
- **Bretter:** `gruppe` (Rahmen, nimmt beim Ziehen am Titel alles mit, was in ihm
  liegt; „eng um den Inhalt“), `brettbild` (Foto, drehbar, skalierbar),
  `brettAlsBild` malt Rahmen, Fäden mit Beschriftung, Bilder und Blasen auf eine
  Leinwand. Beide Typen bekommen im Sanitizer **eigene Grenzen** (bis 6000 px) —
  die Anlagen-Grenze von 2000 hätte große Bretter beschnitten.
- **Kleine Griffe:** Enter schickt Schnipsel/Faden ab (Umschalt+Enter = Zeile),
  Strg+S friert ein, Strg+F sucht, Strg+Enter schließt, Tab rückt ein,
  Menüs per Pfeil/Ziffern, Suchfeld im Blattstapel ab sechs Blättern,
  Lesezeit an Blättern und im Wortzähler, Funken kopieren, Wort kopieren,
  Wörterzahl im Papierkorb.

Qualitätsstand (5.8.0): `npm test` 106/106, im Browser gemessen — 65 Aufnahmen
gelistet, Regen/Donner/Brandung/Bach/Wasserfall/Sturm dekodiert (75–80 s, stereo,
Spitze −4 bis −6 dB, kein Clipping), Suche filtert nach Name und Kategorie,
eine fehlende Datei meldet sauber statt hängenzubleiben.

Früherer Stand: `npm test` 103/103, Hosting 2/2, Lint sauber, im Browser gemessen
(Ton nach 1 s hörbar, zwei Aufnahmen gemischt, Klangbild stellt wieder her,
Gruppe nimmt Blasen mit, Brett als 700×498-PNG).
