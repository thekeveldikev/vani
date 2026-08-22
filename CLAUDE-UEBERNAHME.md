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

## 18. Ankommen & Goodnotes (22. August 2026, VANI 5.9.0)

### Der Befund, der alles auslöste

Der dokumentierte Umzugsweg (Alles sichern → `.vani`-Datei → Sicherung
einlesen) war auf dem verwalteten Schul-iPad **tot**: `leseSicherung()` kannte
nur den Datei-Dialog, und genau der ist dort gesperrt (Managed-Open-In — nur
Goodnotes-Dateien sind wählbar). Es gab **keine Brücke ohne Datei**. Dazu die
Falle auf der alten Sites-Adresse: die Umzugsseite leitete nach **fünf
Sekunden** blind weiter — zu schnell für „Alten Bestand retten".

Recherchiert und für die Anleitung festgehalten: iPadOS gibt **jeder
Home-Bildschirm-App ihren eigenen Speicher** — auch zwei Symbole derselben
Adresse teilen nichts. (firt.dev/ios-14, WebKit-Blog zur Storage-Policy.)

### `src/49b-ankommen.js` — alles herein, auch ohne Datei

- **Erkenner (pur, getestet in `test/ankommen.mjs`):** `erkenneEinfuegeInhalt`
  → `leer | kopplungscode | sicherung | kaputt | vanitext | whatsapp |
  gegliedert | text`. Reihenfolge: das Eindeutige zuerst. `whatsappZerlegen`
  (Android- und iPhone-Format, Fortsetzungszeilen, Systemzeilen),
  `markdownZerlegen` (Rauten und Unterstreichungen, Vorspann),
  `vaniTextZerlegen` (der „Nur Texte"-Export, den es seit der ersten Fassung
  gibt — daraus entstehen wieder Projekte, Hefte mit Zetteln, Schnipsel mit
  Datum).
- **Gemeinsame Paket-Logik:** `baueSicherungsPaket({mitMedien})` und
  `sicherungEinspielen(paket, modus)` — Datei und Zwischenablage nehmen
  denselben Weg; `leseSicherung` ruft nur noch `sicherungAnnehmen`.
- **Zwischenablage hinaus:** `textInZwischenablage(promise)` schreibt ein
  `ClipboardItem` mit **Versprechen** — iOS erlaubt das Schreiben nur kurz nach
  einer Berührung, und das Packen dauert. `writeText` nach dem `await` wäre zu
  spät.
- **Zwischenablage herein:** das Feld fängt das `paste`-Ereignis ab und
  verarbeitet den Text sofort, ohne ihn ins Feld zu malen (große Sicherungen
  frieren sonst ein). `readText` als Knopf, mit höflichem Hinweis, wenn das
  Gerät die Zwischenablage nur per Einfügen hergibt.
- **Umzugshelfer** (`umzugsHelfer`): drei Wege, adaptiv (im Rettungsmodus
  aus der Sicht des alten VANI), mit direkt klickbaren Schritten.
- **Ankunfts-Zusammenfassung** (`ankunftZusammenfassen`): „3 Hefte · 41 Seiten
  · 5 Bilder · 12.300 Wörter" statt „Alles wieder da."; Dedupe gegen Vorhandenes.
- Dialog-Reihenfolge beachtet: `fertig = true; zu(); res(...)` — sonst löst
  `beiZu` mit `null` auf (der bekannte Stolperstein aus §16).

### Hosting: Umzugsseite zählt erst nach

`hosting/scripts/copy-vani.mjs` erzeugt eine Umzugsseite, die `indexedDB.open`
auf `vani` und alle `vani-profil-*` macht, `docs` zählt und **nur bei leerem
Bestand** weiterleitet; sonst hebt sie „Alten Bestand retten (N)" hervor. Die
Rettungsfassung ist `index.html` (5.9.0) mit Umzugshelfer. **Deploy der
Sites-Adresse geht nicht von hier** (ChatGPT-Sites-Projekt, `.openai/
hosting.json`) — `hosting/public/` ist aktualisiert, der Hosting-Test
(`hosting/tests/rendered-html.test.mjs`) prüft Version 5.9.0 und das neue
Verhalten; das Ausrollen braucht Codex/Sites.

### Goodnotes: drei Reparaturen beim Einfügen (`src/35-richtext.js`)

Aus den Screenshots der Nutzerin:
1. **`&#x20;` stand wörtlich im Text.** Goodnotes schreibt Leerzeichen am
   Zeilenende als Entität *in den Text* (nicht als HTML). `entitaetenReparieren`
   wandelt Zahlen-Entitäten und die paar benannten zurück — in beiden
   Einfüge-Wegen (Textknoten in `einfuegeHTML`, Zeilen in `einfuegeAusText`).
   Steuerzeichen/Surrogate werden nicht erzeugt; Unbekanntes bleibt stehen.
2. **Lücke mitten im Satz** („geschenkt [ ] hatte"): Goodnotes liefert jede
   umgebrochene Zeile als eigenen Absatz. `verbindeWeicheUmbrueche` verbindet
   zwei `p`, wenn der erste ohne Satzzeichen endet und der zweite klein
   beginnt; Listen, Überschriften, Aufzählungszeichen und Leerzeilen trennen
   hart. Heuristik — bewusst eng.
3. **`_WORT_` soll kursiv sein:** `kurzschriftZuHTML` (`_i_ *b* ~s~`) beim
   Einfügen und `kurzschriftLive` beim Tippen (nur auf `insertText` mit einem
   der drei Zeichen; der Cursor verlässt das Element über ein U+200B, das
   `sauberesRichHTML` und `richReinerText` wieder entfernen).
4. **Absätze zu groß:** `.rich-editor p { margin: 0 }` — Absätze sind Zeilen.

### Rich-Text überall

Neue Szenen (`44-projekte`, `42-schnipsel`, `49b`) und Blätter (`blattAusText`)
entstehen mit `format: 'rich'`. Ältere Texte: „Aa" im Schreibraum-Kopf (war
vorher in den Einstellungen versteckt). Typewriter/Zeilenfokus gelten weiter
nur im schlichten Modus (Spiegel-Div) — Ideen dazu in IDEEN.md.

### Sticker (`src/43b-sticker.js`)

Doc-Typ `sticker` (Anlage: `parent`, `bild`, `verhaeltnis`, `pos`) und
`stickervorlage` (Kiste). `stickerZeichnen` ist ein kleiner Zeichenblock
(Stifte, Dicke, Radierer, Zurück, Alles löschen), `stickerZuschneiden`
beschneidet auf den gezeichneten Inhalt (Alpha > 8, 6 px Rand), das PNG geht
über `speichereKritzelei` in `media` — also in Sicherung und Sync wie Fotos.
`stickerAufkleben` zeigt zuerst die Kiste (antippen klebt, lange drücken nimmt
heraus), sonst den Block. Rendering über `baueSticker` + `anlageGesten`.

`anlageGesten` hat jetzt für **alle** Anlagen einen **Drehgriff** (um die
Mitte, < 2,5° rastet gerade), die Ziehgrenzen reichen über den Rand (x −30…100,
y −14…106), `.papierseite { overflow: visible }`. Seite verdoppeln nimmt
Sticker mit. Neues Icon `IK.sticker`.

**Mitgebrachte Sticker** (`STICKER_MITGEBRACHT`): Bilddateien unter `sticker/`
(erste: `schmu.png`, das rote „SCHMU!" der Nutzerin als transparentes PNG,
von 2172 px auf 1000 px verkleinert, 269 KB). Beim ersten Aufkleben holt
`stickerMitgebrachtBild` die Datei in `media` mit fester Kennung
`sticker:<id>` — so reist sie über Sicherung und Sync wie jedes Bild. Der
Ordner steht in `package.json → build.files` und wird von `copy-vani.mjs`
in den Rettungsraum kopiert; der Sticker-Vertrag prüft beides plus Existenz
und Größe jeder Datei (derselbe Fehler wie einst bei `klang/` soll nicht
wieder passieren).

### Tests

119 grün. Neu: `test/ankommen.mjs` (6), `test/goodnotes.mjs` (3), Verträge
„Ankommen", „Umzug", „Goodnotes", „Sticker". Im Browser geprüft: WhatsApp →
Faden (3, beim zweiten Mal „Nichts Neues"), VANI-Textexport → Heft mit 2 Seiten
und Zettel + Schnipsel, Paste-Ereignis wird abgefangen, Umzugshelfer rendert;
`&#x20;` repariert (HTML und Text), weicher Umbruch verbunden, Kurzschrift beim
Einfügen und live (`Hallo <i>Welt</i> weiter` gespeichert ohne U+200B),
Sticker gerendert mit Drehgriff, Werkzeugknopf da, Absatzabstand 0, Seite
`overflow: visible`.

### Offen / Ideen

Siehe **IDEEN.md** (neu): Goodnotes-Abgleich (Lasso, Formen begradigen,
Audio-Notiz, Gliederung aus Überschriften …) und je Raum.

## 19. Speichern, Kerze, Welle 2 (22. August 2026, VANI 5.10.0 → 5.11.0)

### Der Speicher-Bug (5.10.0)

Befund: Safari (iPad) erzeugt bei execCommand('bold') mit `styleWithCSS`
kein `<b>`, sondern `<span style="font-weight: bold">` — dito kursiv und
unterstrichen. `sauberesRichHTML` warf genau diese Stile weg (es behielt nur
color/background/font-size/text-align). Ergebnis: im Editor sichtbar, nach
„Fertig" und Wiederöffnen fort. Fix in `src/35-richtext.js`:
- span/div/p-Stile font-weight/font-style/text-decoration → echte
  `<b>/<i>/<u>/<s>` um den Inhalt (kein `<b>` im `<b>`, via `closest`).
- `<font color/size>` → span-Stil statt Textknoten; `align`-Attribut →
  text-align.
- `richBefehl`: `styleWithCSS` nur für Farben/Größe/Ausrichtung, sonst false —
  so liefern Chrome und Safari dasselbe.
- Sofort sichern bei `blur` (nur wenn `entprellt.haengt()`), damit „Fertig",
  Seitenwechsel, Raumwechsel nichts verlieren.
Vertrag: „Speicher-Vertrag" in `test/vertraege.mjs`.

### Die Kerze (`src/45b-kerze.js`, 5.10.0)

Canvas 120×270, 30 fps, nur solange sie brennt. Flamme = Profil
`kerzeFlammenBreite(u)` (breit bei ~1/3, weich auslaufend) mit drei
Schwingungen und einer Neigung (Feder) auf `zug`; `puste()` bei jedem
Anschlag. Schein über `kerzeSchein` (Kontext skalieren, damit Verlauf und
Ellipse zusammenfallen — kantenfrei). Wachsbahnen einmal gewürfelt
(`kerzeZufall(saat)`), Tropfen werden dauerhaft, Ruß bei |Neigung| > .45,
Rauchkette nach dem Ausblasen. `kerzeStand(anteil)` 150 → 14 px linear. Die
Kerze meldet ihr Ende selbst (`beiEnde`), kein zweiter Timer. Schreibraum:
`_sr.sprint.kerze`, `.kerze-brennt` auf dem Raum (Hauch warmes Licht).
Techniken nach der Talgkerze aus PAPA OS (recovery.js), neu gebaut.

### Welle 2 aus IDEEN.md (5.11.0)

- **Striche gespeichert** (`seite.striche`, `saubereStriche` ≤ 24 000 Punkte,
  `strichVerdichten`): Grundlage-Bild bei Altseiten als `skizzeBasis` unter
  neuer Kennung, damit das Kompositbild nicht doppelt übereinanderliegt.
  `skizzeBasis` reist in Sicherung (49b) und Sync (31) mit.
- **Lasso** (`stricheImLasso`: > 50 % der Punkte im Polygon, Radierer nie),
  verschieben (`stricheVerschieben`), löschen, umfärben; Rahmen/Schlinge sind
  Anzeige und werden vor dem Speichern entfernt.
- **Form halten** (`formErkennen`): 560 ms ohne Bewegung → Linie (Abstand zur
  Sehne < 9 %), Rechteck (> 82 % der Punkte an den Umrisskanten — VOR der
  Ellipse prüfen, ein Rechteck liegt auch „rund"), Ellipse (Streuung < .12).
- **Tonnotiz** (`src/43d-ton.js`): MediaRecorder, mime-Reihenfolge
  mp4/webm-opus/webm/ogg, Pegel via AnalyserNode, max 300 s, Blob →
  `speichereDateiBlob` → Doc `ton` {datei, dauer, mime}. Kassette mit
  Abspielknopf; Menü „Beschriften". Knopf nur wenn `tonUnterstuetzt()`.
- **Papiervorlagen** cornell/storyboard/dialog (CSS auf `.papierseite`).
- **Reiter** `heft.reiter[{seite,farbe,name}]` (≤ 40), Seitenmenü „Farbigen
  Reiter anheften", Zungen unter dem Kopf, springen per `zielSeite`.
- **Gliederung** `gliederungAusHTML` (Regex, h1–h3), `heftGliederung`
  (springt zu Seite + scrollt zur n-ten Überschrift über
  `zielUeberschrift`), `projektGliederung` (Kapitel → Szenen → Überschriften).
- Neue Icons: lasso, gliederung, mikro.

Tests 131/131 (neu `test/kerze.mjs`, `test/kritzel.mjs`; Verträge Speicher,
Kerze, Welle 2). Im Browser geprüft: Safari-Spans → `<b>/<i>/<u>`; Kerze
brennt, Luftzug, geht mit dem Raum; Strich gezeichnet → Lasso → gelöscht;
gerader Strich + halten → 2 Punkte; gespeichert/geladen; Reiter, Gliederung
(Sprung), Cornell-Klasse, Mikro-Knopf.

## 20. Umschlag und Regal (22. August 2026, VANI 5.12.0)

`src/43e-deckel.js` ersetzt das alte Atelier und die Hefteübersicht; die alten
Einstiege (`heftGestalten`, `RENDER.hefte`) bleiben als Stubs.

- **Deckelmodell** `heft.deckel` = `saubererDeckel({stoff, etikett, schrift,
  ecken, gummi, gummifarbe, abgegriffen, sticker[{bild,pos}]})` — pur, mit
  Vorgaben, ≤ 24 Sticker, Sanitizer in `sauberesDokument`. Farben/Muster/
  Papier bleiben die alten Felder.
- **`baueDeckelElement(h, {gross, interaktiv, seitenzahl, beiSticker})`**:
  Stoffklassen (`stoff-leder|kraft|samt|marmor|glatt|leinen` — CSS mit
  `!important` über den Musterverläufen), `.seitenblock` (Dicke `--dick` aus
  der Seitenzahl), `.abnutzung` (Deckkraft `--abgegriffen`), Metallecken,
  `.gummiband` (`--gummi`), Etikett-Varianten, Sticker-Lage. Derselbe
  Baustein im Regal (klein), im Atelier (gross) und als Mini-Knopf im
  Heftkopf (`.heft-minideckel`, alles außer Deckelfarbe ausgeblendet).
- **Atelier** `heftAtelier`: große Vorschau; Sticker per Pointer ziehen,
  Langdruck-Menü (drehen/größer/kleiner/abmachen); „Sticker aufs Cover" aus
  Mitgebracht + Kiste (`stickerMitgebrachtBild`), „Aufs Cover kritzeln"
  (`stickerZeichnen` ohne Kiste); „Würfeln" (`zufallsLook`). Abbrechen stellt
  den Stand per JSON-Kopie wieder her.
- **Drei Ansichten** (`D.einst.hefteAnsicht`): karten (Grid), regal
  (`.buecherregal` mit zwei Brettern „AUF DEM TISCH"/„IM REGAL",
  `baueRuecken`: Breite 30 + 1,1·Seiten, Höhe variiert mit Titellänge), tisch
  (`.heft-tisch` Holzplatte, `--dreh` je Heft, Archiv als `.heft-stapel`).
- **Animation** per FLIP: `merkeHeftLagen()` vor `zeichne()` (im heftMenue
  bei archiv/zurueck), `spieleHeftLagen()` nach dem Render — Transform vom
  alten zum neuen Ort über .55 s. Antippen: `.zieht` (herausziehen), dann
  öffnen.
- Fallstrick gesehen: Prägungs-Etikett brach „GRAUWALD" mitten im Wort —
  `word-break: normal` für dieses Etikett.

Tests 135/135 (neu `test/deckel.mjs`, Hefte-Vertrag). Im Browser: drei
Ansichten, Stoffe, Gummiband, Cover-Sticker (Schmu), Seitenblock, FLIP beim
Wegstellen (Heft landet auf dem „IM REGAL"-Brett), Atelier mit acht Gruppen,
Würfeln ändert Stoff/Etikett, Minideckel im Heftkopf.

## 21. Ruhe beim Schreiben, Welle 3, Atelier-Fenster (22. August 2026, 5.13.0 → 5.14.0)

### Drei Fehler, eine Wurzel (5.13.0)

`syncUebernehmeAusY` ersetzte bei **jeder** hereinkommenden Änderung (Poll alle
2,5 s) alle Dokumente durch neue Objekte und rief `zeichne()`. Folgen: Heftseite
verliert beim Tippen den Fokus (iPad-Tastatur klappt zu — „schließt sich
ganz"), hinter dem Schreibraum fährt der Raum neu hoch, offene Editoren halten
ein verwaistes Objekt. Jetzt: nur Unterschiede (`syncGleich` per JSON),
`Object.assign` in das vorhandene Objekt, `zeichne()` nur bei `veraendert > 0`
und nie, solange `syncSchreibtGerade()` (Schreibraum offen, aktives
Textfeld, Kritzeln, Dialog) — dann `zeichnenAusstehend` + Nachholen bei
`focusout`/nach 6 s/`hashchange` verwirft.

Schreibraum, formatierter Text: iPad-Safari scrollt das Fenster statt des
Containers → `zentriereZeileRich` (Caret-Rect gegen `.sr-mitte`, Schreibmaschine
bei 42 %, sonst „im Blick halten"), `srFensterZurueck` auf `scroll`.

Hefte, volle Seite mit Cursor mittendrin: Überhang wandert **still** an den
Anfang der nächsten Seite (`autoWeiter({..., still: true})`), Seite/Fokus/
Cursor bleiben; nur am Ende folgt der Cursor dem Text. Für rich (Caret per
Textoffset zurücksetzen) und plain.

### Welle 3 (5.14.0)
- **Karteikarten** (`src/47b-karteikarten.js`): `karteikartenReihenfolge`
  (Verfehlt ×2 − Gewusst + Zeit/20 + Zufall), `karteikartenBilanz`,
  `wortkisteAbfragen(kistenId, titel)` — Karte mit 3D-Flip, Gewusst/Nochmal,
  rückwärts, nur-mit-Notiz, Tastatur (Leer/→/←). Zähler `gewusst/verfehlt/
  abgefragt` am Wort (Sanitizer). Knopf in `.wortkisten-titelzeile` ab 2 Wörtern.
- **Pfeil** in `formErkennen`: Knick im letzten Viertel mit > 105°, Schaft
  gerade (Abstand/Sehne < .1) → Schaft + zwei Flügel (18 % der Sehne, 140°).

### Atelier als Fenster, Tisch einrichten (5.14.0)
- Atelier-DOM wird nach dem Bau umgehängt: `.atelier-raster` mit
  `.atelier-links` (sticky Vorschau 300 px) und `.atelier-felder` (scrollt);
  < 760 px untereinander, Vorschau klein.
- `D.einst.tisch = saubererTisch({platte, groesse, unordnung, sortierung})`;
  `tischEinrichten(danach)` zeigt jede Wahl sofort (danach = zeichne);
  Klassen `platte-*`, `groesse-*`, `ordentlich` auf `.inhalt`; Regalbretter
  folgen der Platte.

Tests 141/141 (neu test/karteikarten.mjs; Ruhe-, Welle-3-, Atelier-Vertrag).

## 22. Der Schreibtisch und der Lesestapel (23. August 2026, VANI 5.15.0)

### Entscheidung zu den Büchern
Die Nutzerin wollte zehn Bücher (King, Tolkien, Funke …) als PDFs „auf den
Schreibtisch legen" und sie im Repo mitliefern, mit der Angabe persönlicher
Erlaubnis. Die Dateinamen im Ordner tragen z-library-Marker. **Nichts davon
liegt im Repo oder im Build** (Vertrag prüft: keine `.pdf` in den Buildlisten,
kein `buecher/`-Ordner). Stattdessen: Bücher sind Dokumente vom Typ `buch` mit
der PDF im Medienvorrat (`datei`), Cover als `bild` — also lokal, und über den
E2E-Bereich auf die eigenen Geräte. Das wurde der Nutzerin so gesagt.

### `src/54-schreibtisch.js` — der Raum
Eigener Raum `schreibtisch` (Leiste, `ALLE_RAEUME` nach Zuhause; Icon
`IK.schreibtisch`; Tür auf dem Zuhause). Szene aus DOM+CSS+zwei Canvases:
`baueSternenhimmel` (Sterne, Mond mit echter Phase `mondphase()`),
`baueLeuchter` (sieben Flammen, Technik aus 45b), Lichtkegel über `--lampe`.
Dinge = Funktionen: Manuskripte (`schreibtischLetzteTexte`), Tinte (neues
Blatt), Tasse (`schreibtischTag`: heute + Serie), Glas (`schreibtischFunke`,
tagesstabil), Brief (`brief`-Docs mit `oeffnen`/`versiegelt`, `briefIstOffen`),
Karten (Abfragen), Lupe, Stummel, Notizbuch (letztes Heft), Schublade
(`schubladeOeffnen`: Funde + Wege + „Metall" = alter Schnipsel), Bücherstapel
(Lesestapel). Fenster hört auf `D.einst.ambience` (`schreibtischWetter`:
gewitter/regen/wind/grillen/still → Klassen `wetter-*`); Knopf schaltet
Grillen+Wind. Einrichten: `saubererSchreibtisch` (holz, lampe, kerzen,
wetterFolgtKlang, unordnung, verse) in `D.einst.schreibtisch`.
Verse: kurze Zeilen aus `wiederFunde` (kuratiert), nie aus allem.

### `src/55-lesestapel.js` — Bücher und Lesemodus
pdf.js 6.2.108 legacy-Build in `vendor/pdf.min.js` + `pdf.worker.min.js`
(**als .js, nicht .mjs** — Dev-Server/andere liefern .mjs als octet-stream,
dann scheitert `import()`); Apache-2.0-Lizenz liegt bei. Lazy `import()` beim
ersten Aufschlagen. `buchAuflegenAusBlob`: Titel/Autor aus Metadaten oder
Dateiname (Tauschbörsen-Klammern raus, „(Nachname, Vorname)" gedreht), Cover
= Seite 1 bei 480 px als JPEG in `media`. Wege: Datei-Picker, Goodnotes-Archiv
(PDF-Docs), Desktop-Bücherordner (`vani:buecher-liste`/`vani:buch-lesen`, nur
aus Dokumente/VANI-Bücher, exe/buecher, userData/buecher; Pfadprüfung).
Lesemodus `buchOeffnen`: Canvas je Seite (dpr ≤ 2.5, Cache 10), Doppelseite
auto (≥ 900 px quer), Blättern mit 3D-Übergang, Tippzonen/Wischen/Tasten,
Schieber, Gliederung (`getOutline` → `getPageIndex`), Lesezeichen (Liste am
Doc), Zitat (`getTextContent` → kopieren mit Quelle / Schnipsel),
Einstellungen im `localStorage('vani-lese')` (Helligkeit, Wärme, Nacht =
invert+hue-rotate, Doppelseite, Zoom, Blättern) — bewusst pro Gerät.
Seite/Lesezeichen/`zuletzt` am Doc (gesynct).

Tests 146/146 (neu `test/schreibtisch.mjs`, Schreibtisch-Vertrag). Browser:
Raum mit allen Dingen, Lampe schaltet, Brief versiegelt, Schublade, Buch
aufgelegt (316 S., Cover, Titel/Autor aus Dateinamen), Lesemodus rendert,
blättert (Doppelseite „2–3"), Lesezeichen, Gliederung, Zitat mit Text, Nacht.

## 23. Der Schreibtisch, gemalt — und der Bücherkoffer (23. August 2026, VANI 5.16.0)

### Malerei (`src/54b-schreibtisch-malerei.js`)
Ein Canvas für die ganze Szene: `schreibtischMaler(canvas, opt)` →
`{start, stopp, setze}`. Unbewegtes (Wand, Platte, Rahmen) einmal in ein
Offscreen-Canvas (`maleStatisch`), dann geblittet; bewegt: Himmel nach
`schreibtischTageslicht(h)` (0 Nacht … .55 grauer Tag, Dämmerung/erstes Grau
dazwischen) mit `schreibtischHimmelFarben`, Sterne, Mond mit Phase und Maren,
Garten in drei Tiefen (Bäume mit Kronen, im Winter Geäst; Büsche; Gras), alles
mit Sinus-Wiegen × Wind, Nebelbänder, `schreibtischJahreszeit`: Sommer
Glühwürmchen (`kerzeSchein`), Herbst fallende Blätter, Winter Schnee + kahle
Bäume + Schneekante, Frühling Blüten; Regen als 180 Tropfen mit eigener Lage
(**keine Kachel** — der CSS-Regen loopte sichtbar), Glas-Tropfen, Wetterleuchten
mit Zufallspause; Licht: Dunkelschleier über der Platte, Lampenkegel (bei
`lampeAn`), Kerzenschein — alles `kerzeSchein` (kantenfrei). Holz: Maserung
(70 Wellen), Astlöcher, Handstelle, Kratzer, Tintenkleckse mit Satelliten,
Wachs, Kaffeering. Saat = `tagKey()` → der Tisch bleibt am Tag gleich.

### Die Dinge (`src/54-schreibtisch.js`)
- **Lampe mit Zugschnur** (`baueLampe`): Knauf per Pointer ziehen, Schnur dehnt
  sich (über Max nur noch 12 %), loslassen → `schnurSchritt` (Feder k=70,
  Dämpfung 7) schwingt zurück; über `SCHWELLE` 46 px schaltet `umschalten()`
  (`lampeAn`, Klasse `lampe-aus`, Maler `setze`, leiser Klick synthetisch).
  Schirm antippen: Stufen .45/.65/.8/1.
- **Leuchter** mit Messingarmen, Tüllen, Wachsläufen; `leuchterStand(wachs)`:
  je Kerze eigenes Tempo; `schreibtischWachsVerbrennen(min)` wird aus
  `beendeSprint` gerufen; nach 20 h „neue aufstecken".
- **Standuhr** (`baueUhr`): Zeiger jede Sekunde, Pendel-Animation, optional
  Ticken (`uhrTickt`) + Glockenschlag zur vollen Stunde; Tipp: Zeit am Tisch
  (sessionStorage `vani-session-start`).
- **Zweiter Stuhl** → Faden. **Papierkorb** (`papierkorbAmTisch`: Bündel aus
  `papierkorb`, `holeZurueck`). **Glas** zeigt ein eigenes Foto
  (`schreibtischFundfoto`, tagesstabil). **Brief** mit Siegelbild (`bild` =
  Sticker/Kiste/gezeichnet).
- Einstellungen neu: `lampeAn`, `uhrTickt`, `wachs`, `kerzenGewechselt`.

### Bücherkoffer
`werkzeug/buecherkoffer.mjs <Ordner> [Passwort]` → `buecher/koffer.json` +
`buch-NN.enc` (Format `VANIBUCH1` + Salz 16 + IV 12 + AES-256-GCM; PBKDF2-SHA-256
200 000). App: `buecherkofferHolen()` → `passwortFragen` → `kofferEntschluesseln`
(WebCrypto) → `buchAuflegenAusBlob`. Falsches Passwort → OperationError →
„Das Passwort passt nicht." Der Vertrag erlaubt im Ordner nur `.enc` +
`koffer.json`, nie eine PDF. **Das Passwort steht nirgends im Repo** — es wurde
der Nutzerin im Gespräch genannt. Plan: Koffer aus dem Repo nehmen, sobald die
Bücher auf ihren Geräten liegen.

### Lesemodus erweitert
Randnotizen (`buchnotiz` {parent, seite, text}), Suche im Buch (Textebene je
Seite, im Leser gecacht), Vorlesen (`vorlesen`), Lesestatistik
(`buch.statistik[tagKey] = Seiten`, 60 Tage), farbige Lesezeichen
(`lesezeichenFarben`), „Weiterlesen" auf dem Zuhause (letzte 14 Tage).

### Leiste
`.raumrolle` scrollt (overflow-y auto, min-height 0), Suche/Feinheiten bleiben.

Tests 149/149. Browser: Szene gemalt (Himmel/Holz-Pixel), alle Dinge, Schnur
zieht 124 px und federt auf 54 zurück, schaltet ab Schwelle, kleiner Zug nicht;
Koffer: 6 Bücher, Entschlüsseln 1,6 MB in 266 ms, falsches Passwort abgewiesen,
Buch aufgelegt; Randnotiz-Punkt, Statistik „2 Seiten heute", Weiterlesen-Karte.

## 24. Lampe frei, Bücherbord, echte Cover (23. August 2026, VANI 5.17.0)

Anlass: Foto vom iPad — nur zwei Bücher sichtbar, Brief/Papierkorb kollidierten,
Cover „doof", Lampe nur senkrecht ziehbar, Szene insgesamt zu matt.

### Lampe
`baueLampe` (54): Schnur als SVG-Pfad (`.schnur-svg`/`.schnur-pfad`/`.schnur-schatten`)
vom Aufhängepunkt P (128,140) zum Knauf; der Knauf folgt dem Finger **frei in 2D**
(bis MAX 130 px, darüber gibt die Schnur nur noch 12 % nach, nicht über die
Aufhängung hinaus), `schnurSchritt` ist jetzt 1D- oder 2D-Feder (k 70, d 7; quer
0,9·k). Schaltschwelle 44 px Zug, Umschalten → `.schaltet` (Schirm zuckt),
`maler.setze({lampeAn})`. CSS komplett neu: Messingfuß+Arm, Bernsteinschirm mit
Birnensaum, weicher Lichtkegel (`.schirm::after`: breite Box, clip-path-Kegel,
Seiten per Gradient, unten per mask ausgeblendet, `mix-blend-mode: screen`),
Wandschein (`.lampe::before`), größere Grifffläche am Knauf (`::before`).
Malerei: Licht schmilzt ein (`lampeJetzt`), Lichtteich unter dem Schirm,
Staubkörner im Kegel, Motte im Sommer bei Nacht, Parallax (`para`).

### Bücherbord statt Stapel
`.desk-ding-halter.buecher` links unter der Lampe; `.bord-buch` je Buch als
eigener Knopf (Cover, Leseband = Fortschritt, Rücken/Glanz via ::before/::after);
`--ueberlapp` wird aus der Bordbreite und der Zahl gerechnet, damit die Reihe
nie über die Manuskripte läuft (8 Bücher breit, 6 unter 1000 px, 5 schmal;
Rest „+N · Lesestapel"). Layout neu geordnet (Manuskripte Mitte, Tinte rechts
davon, Glas links vorn, Brief Mitte-links weg vom Papierkorb), Vignette
(`.desk-szene::after`) und Tischkante (`::before`), schmale Geräte mit
Prozent-Höhen für Tasse/Karten/Lupe/Notizbuch.

### Echte Cover
`isbnZu10`, `isbnAusText`, `isbnAusPdf` (Impressum der ersten 12 Seiten),
`coverVonIsbn` (Amazon-Bildhost per ISBN-10, CORS *, Platzhalter < 5 kB
verworfen; dann Open Library ISBN-13), `buchCoverSetzen`, `buchCoverAusDemNetz`,
`schoeneCoverHolen` (alle ohne `coverNetz`). `koffer.json` trägt jetzt `isbn`,
`name`, `autor` je Buch; `buecherkofferHolen` gibt `titelFest` (Koffer-Name
schlägt PDF-Metadaten), dedupliziert nach ISBN **oder** Titel und repariert
vorhandene Bücher (Titel/Autor aus dem Koffer). `saubererAutor` macht aus
Katalogzeilen („Fowler, Aisling Verfasser", eckige Klammern, Doppelnamen) einen
Namen. Sanitizer: `isbn`, `coverNetz`.

Tests 151/151 (neu: isbn-Helfer, saubererAutor). Browser: Schnur schräg gezogen
→ schaltet, federt zurück; Koffer holt 6 Bücher (Namen aus dem Koffer), alle
Cover aus dem Netz; Bord zeigt alle; 1100×900, 1024×768, 768×1024, 740×1000 geprüft.
Koffer bleibt auf Wunsch vorerst im Repo; das Passwort steht weiter nirgends.

## 25. Der Tisch lebt, EPUB, Spotlight, Stände — und großes Bugfixing (23. August 2026, VANI 5.18.0)

Die Welle „Die nächste große Welle" aus IDEEN.md komplett, plus drei Audit-Durchgänge.

### Neue Dateien
- `src/54c-schreibtisch-leben.js`: pure Helfer `schreibtischAlter(tage)` (Wörter → Ringe 1–6,
  Abnutzung 0–1), `leuchterWoche(tage, jetzt)` (Mo–So: heute/vorbei/zukunft/brennt),
  `teelichterWoche(tage, ziel)`, `leseSerie(buecher)`, `saubereKleckse` (max 40) + Bühne:
  `schreibtischFederTropft`, `federKratzen` (WebAudio-Rauschen), `schreibtischKlangbild`
  (uhr/wind/kamin), `schreibtischKlangName`, `baueWetterglas` (Menü: Tisch bei Nacht /
  Nachtgarten / Klangraum), `baueTeelichter` (nur mit Tagesziel), `baueZweiteTasse`
  (`syncFremdAktiv`), `baueOffenesBuch(b, szene)` (pdf.js-Doppelseite 104 px, Tippen
  links/rechts blättert, Mitte öffnet; EPUB als zugeklapptes Cover; räumt über
  `szene._aufraeumen` auf), `blattEinspannen(szene, e, blattId, fokus)` (Textarea auf dem
  Tisch, `entprellt(…, 500, true)`, `zaehleWorte`, Esc/✕ legt weg → Klecks, `e.blattId`
  merkt das Blatt über Raumwechsel).
- `src/55b-epub.js`: `zipEintraege` (zentrales Verzeichnis), `zipLies` (0/8 via
  DecompressionStream deflate-raw), `istEpub`, `epubLaden` (container → OPF → spine,
  Cover, nav/NCX-TOC), `epubKapitelHTML` (Sanitizer, Bilder als Blob-URLs),
  `buchAuflegenEpub` (art 'epub', seiten 100/seite %, kapitel, anteil, kapitelAnzahl),
  Leser `epubOeffnen` (CSS-Spalten, 2 Spalten > 900 px, Zeile ≤ 720 px, Fortschritt,
  Lesezeichen „k:s", Zitat, Randnotizen je Kapitel, Vorlesen, Schrift/Größe/Zeile/Rand).
- `src/48b-spotlight.js`: ⌘/Strg+K `spotlightOeffnen` (Treffer + Vorschau mit mark,
  ↑↓/Enter, „>" = Befehle), ⌘/Strg+⇧+K große Suche, „?" `kuerzelZeigen`, `TASTENKUERZEL`,
  `spotlightTreffer` pur.

### Geändert
- 54: `saubererSchreibtisch` + kleckse/federKratzt/offenesBuch/blattId; Leuchter mit
  Woche (erloschene Kerze raucht); Tinte-Menü (einspannen/weiter/Schreibraum); Luftzug-
  Klasse beim Betreten; Einrichten: Feder kratzt, offenes Buch, Kleckse wegwischen;
  Lampe zieht jetzt auch skaliert richtig (r.width/240); Klick-AudioContext resume;
  Leuchter/Malerei pausieren unter Schreibraum/Leser/hidden.
- 54b: `opt.alter`/`opt.kleckse` (statisch neu bei Änderung), Kratzer nach Abnutzung,
  Kaffeeringe je 100 000 Wörter, Kleckse gefranst, Spinnennetz im Herbst, Tageslicht
  im Raum + `data-tageszeit` (tag/daemmerung/nacht, CSS-Kanten), Regentropfen mit
  Brechung (drawImage der eigenen Leinwand, gespiegelt 1,6×).
- 55: Leseeinstellung + stimme/rand/epubSchrift/epubGroesse/epubZeile/epubRand;
  `buchStandText`; EPUB-Weiche in `buchAuflegenAusBlob`/`buchOeffnen`; Randspalte
  (`leserRandspalte`, `leserRandAktualisieren`, `.lese-rand`); Vorlesen neu mit Sätzen
  (`leserSaetze`), Markierung über Textstücken (`leserMarkiere`, `c._vp/_dpr/_seite`),
  Stimme wählbar (`leserStimme`), blättert am Seitenende weiter.
- 30: `staendeAutomatisch` in `speichere` (15 min, ≤ 20, auto weichen zuerst; Sanitizer
  behält `auto`); STANDARD_EINST + stickerFarbe/stickerDicke/tisch/schreibtisch (Fix:
  Schreibtisch-Einstellungen gingen beim Neustart verloren!); `entprellt(fn, ms, notfall)`
  — notfall darf Lebensprüfung sein, `g.loesen()`, tote Spüler fliegen raus; Gruppen/
  Brettbilder behalten `pos.h`; Papierkorb löscht Medien nur ohne lebende Referenz.
- 31: `syncFremdAktiv`, Nachzug lokaler Änderungen während der Übernahme (sonst
  verloren/gelöscht), Vergleich ohne interne Felder, Löschen nur für nicht währenddessen
  angefasste Docs.
- 41: „EIN ZITAT" als Fundart, Lese-Serie unter dem Schreibfeuer, Weiterlesen mit
  `buchStandText`. 45: Stimme aus der Leseeinstellung, Stände „· automatisch",
  Titel-Flush beim Schließen. 48: ⌘K → Spotlight, Suche schließt Schreibraum, letzte
  Suchen je Profil. 43: Kritzelleiste räumt bei hashchange auf, „Alles löschen" löscht
  Basis, Bild-Fehler nimmt Verweis nicht weg, Notfall-Flush Titel/Zettel, Sticker min 6.
  43c: y bis 40. 43d: Mikro aus, wenn Dialog schon zu. 43e: Abbrechen stellt fehlende
  Felder wieder her. 44/46/42b/29/45b/49b/55: kleine Fixes (Projekt löschen zeichnet,
  Brettbild zieht kein Brett, Blätter-Filter sichtbar, Neues Profil keine Sackgasse,
  Kerze ohne Listener-Leck, WhatsApp-Systemzeilen, Lesetasten nicht in Feldern,
  Zurück beim Aufschlagen, ISBN-13:, Mehrfachautoren, Wisch+Klick, Flip-Generation,
  Goodnotes-Kopie statt geteilter Datei, dok.destroy in finally).
- Koffer-Werkzeug und Desktop-IPC nehmen `.epub` an (`art` im Manifest).

Tests 155/155 (neu: Alter/Woche/Teelichter/Serie/Kleckse, staendeAutomatisch, ZIP stored+deflate,
istEpub, spotlightTreffer/Kürzel). Browser: Lampe bleibt nach Reload aus/an; Wetterglas,
7 Teelichter, offenes Buch gerendert; Blatt eingespannt → 16 Wörter, weggelegt → Klecks;
Spotlight Treffer+mark, Befehle, Kürzel (20 Zeilen); EPUB (Test-ZIP stored) 2 Kapitel,
6 Seiten, TOC; Randspalte + Notiz; Vorlesen markiert 10 Stücke des ersten Satzes von 27;
Leertaste im Randfeld blättert nicht; Lese-Serie auf dem Zuhause.

## 26. Nachlese 5.18.1: Bücher greifbar, Tastatur-Ausschnitt, Rolle als Textblock (23. August 2026)

- **Bücher links nicht antippbar**: die unsichtbare Box der Lampe (240×320, z 3) lag über
  den ersten Büchern. Fix: `.desk-ding.lampe { pointer-events: none }`, nur `.schirm` und
  `.knauf` sind wieder `auto`. Bord-Schritt mindestens 30 px, `:active` hebt wie Hover.
- **Tastatur auf dem iPad (Projekte/Hefte)**: iOS schiebt den *sichtbaren Ausschnitt* über
  die Seite (visualViewport.offsetTop), das Gerüst blieb oben stehen → unten eine leere
  Fläche. Jetzt setzt Boot `--vvt` (offsetTop, auch bei `scroll`) und `#app`, `.schleier`,
  `.schreibraum`, `.lesemodus` sind `position: fixed; top: var(--vvt)` mit Höhe `--vvh`.
- **Rolle** ist ein durchgehender Textblock: kein Abstand zwischen Seiten, keine
  Seitennummern, leere Überschriften-Felder versteckt, keine Lande-Animation je Seite,
  Mindesthöhe 96 px. Heft-Menü: „Seitengrenzen und Überschriften in der Rolle zeigen"
  (`heft.rollenGrenzen` → `.heftrolle.zeigt-grenzen`).
- **Leser-Fenster** (Notizen/Zitat/Suche/Einstellungen): solange ein Fenster offen ist,
  bleiben Kopf- und Fußleiste des Lesers verborgen (`.lesemodus.deck-offen`).
- IDEEN.md: Abschnitt „Die übernächste Welle" (A–E, mit Reihenfolge-Vorschlag).

### 5.18.2 — Der Tisch bleibt stehen
`zeichne()` fragt einen Raum jetzt zuerst `RENDER[raum].behalten(haupt, arg)`; der
Schreibtisch vergleicht `szene._sig` mit `schreibtischSignatur()` (Holz, Kerzen, Wetter,
Tagesziel, Tasse, Bücher, letzte Texte, Briefe, Notizbuch, Fundfoto, Klangname,
Fremdaktivität, Teelichter, Papierkorb) — Lampe, Wachs, Kleckse und Blatt pflegt die
Szene selbst. Stimmt die Signatur, bleibt das Element (Maler läuft weiter), d. h.
Sync-Übernahmen und Rückwege aus Fenstern bauen den Tisch nicht mehr neu. Auftritt
(`tritt-auf`) und Luftzug nur beim ersten Betreten pro Sitzung (`sessionStorage
vani-desk-gesehen`), sonst `.desk-szene.weich` (kurzes Einblenden). Weglegen des
Blattes malt den Klecks über `szene._maler.setze({kleckse})` ein statt neu zu zeichnen.

## 27. Der Cursor bleibt im Blick (24. August 2026, VANI 5.19.0)

Gemeldet: „man klickt rein, tippt — und es springt woanders hin; man sieht nicht,
wo man schreibt." In allen Bereichen. Zwei Ursachen, beide gefunden und behoben.

### 1. Das Springen: `autogrow`
`autogrow` (30-core) setzte bei **jedem Tastendruck** `height: auto`, um neu zu
messen. In diesem Moment ist ein langes Textfeld nur eine Zeile hoch — der
Browser kappt dabei die Scrollposition **aller Kästen darüber** (`#raum`).
Danach wuchs das Feld zurück, die Sicht blieb gekappt: nach jedem Zeichen stand
man an einer ganz anderen Stelle. Jetzt merkt sich `autogrow` vor dem Messen den
`scrollTop` aller Vorfahren und gibt ihn danach zurück. Im Browser gemessen:
sechs Anschläge in einer langen Rolle → 0 px Versatz (vorher sprang es jedes Mal).

### 2. Man sah nicht, wo man tippt: `src/36-caret.js` (neu)
Safari holt den Cursor über die Tastatur, indem es **die ganze Seite** schiebt.
VANIs Gerüst ist aber auf die sichtbare Höhe (`--vvh`) gebaut — also rutschte es
nach oben weg, und unten klaffte die leere Fläche aus den Screenshots. Der
Versuch aus 5.18.1, das Gerüst per `--vvt` mitzuschieben, war falsch: Safari
scrollte daraufhin erneut (Rückkopplung) — genau das Springen.

Richtig ist beides zusammen:
- Die Seite wird festgehalten: `body { position: fixed; inset: 0 }`, dazu
  `seiteFesthalten()` bei `scroll` und `visualViewport`-Ereignissen. `--vvt`
  ist wieder entfernt (aus `#app`, `.schleier`, `.schreibraum`, `.lesemodus`).
- VANI holt den Cursor selbst ins Bild, überall: `caretKasten(feld)` misst ihn
  (Rich-Text über die Auswahl, Textfelder über einen unsichtbaren Spiegel mit
  denselben Schriftmaßen), `caretHalter(feld)` sucht den nächsten scrollenden
  Kasten, `caretZiel(cursor, halter, raender)` (pur, getestet) sagt, wohin
  gescrollt werden muss (76 px Luft oben, 108 px unten, bei kleinen Kästen
  anteilig). Angehängt an `input`, `keyup` (Pfeile/Enter/Backspace),
  `focusin` (zweimal: sofort und wenn die Tastatur oben ist), `selectionchange`
  für Rich-Text und `visualViewport resize`. Der Schreibraum bleibt außen vor —
  er zentriert mit seiner Schreibmaschinen-Logik selbst.
- Der Cursor ist überall sichtbar gefärbt (`caret-color`, auf Nachtpapier hell).

### Nebenbei: die Rolle ist wirklich ein Blatt
Ohne Seitengrenzen hat die Rolle jetzt einen einzigen Papierschatten statt einen
je Seite, die Formatleiste erscheint nur an der Stelle, an der geschrieben wird,
und die Seitenwerkzeuge zeigen sich erst beim Darüberfahren.

Tests 156/156 (neu: `caretZiel`). Browser (1024×420, wie mit Tastatur): Tippen in
der Rolle bewegt die Sicht nicht mehr, der Cursor bleibt im Bild; weggescrollt +
getippt holt ihn zurück (Scroll 0 → 2598, Cursor bei 280); Rich-Text ebenso;
Schreibraum unverändert; alle elf Räume und ein Fenster ohne Fehler, `scrollY`
bleibt 0.

## 28. Ein Heft ist ein Text, und das Feuer ist gezeichnet (24. August 2026, VANI 5.20.0)

### Rolle und „Am Stück": eine Seite, nicht viele
- Die Werkzeugreihe (Zettel, Foto, Kritzeln, Ton, Schrift, Mehr) stand in der
  Rolle bei **jeder** Seite. Jetzt gibt es sie dort — wie in „Am Stück" — genau
  einmal oben rechts (`klasse: 'fluss-werkzeuge'`, klebt beim Scrollen); sie
  wirkt auf die Seite, in der gerade geschrieben wird, sonst auf die letzte.
  `baueSeite` baut keine eigene Reihe mehr, wenn `optionen.rolle` oder
  `optionen.fluss` gesetzt ist (Vertrag angepasst).
- Die orangenen „Umrahmungen" in „Am Stück" waren Papier je Seitenstück: die
  Randlinie (`.papierseite.mit-rand::after`) fing bei jedem Stück neu an, dazu
  eine Trennlinie zwischen den Stücken und — bei Cornell-Papier — je Stück eine
  eigene Spalte samt Fußlinie. Jetzt trägt der **Bogen** das Papier: Rolle und
  `fluss-bogen` bekommen Papierart, Papierfarbe und `mit-rand` als Klasse, die
  Kinder zeichnen weder Muster noch Randlinie, die Trennlinie ist weg.
- `.heftrolle` ist damit ein durchgehendes Blatt (ein Schatten, eine Randlinie,
  eine Karo-/Punkt-/Cornell-Fläche). Mit „Seitengrenzen zeigen" (Heft-Menü)
  kommt die alte Ansicht zurück.

### Eingefügter Text füllt die Seite
`seitenUmbruch` (30-core) nahm ein Absatzende bis zu **700 Zeichen** oberhalb der
Bruchstelle — dadurch blieb bis zu ein Drittel Seite leer. Neue Ordnung: ein
Absatzende zählt nur noch, wenn es höchstens 200 Zeichen vor dem Ende steht,
sonst ein Satzende (`. ! ? …`) im selben Abstand, sonst die Wortgrenze (140),
sonst ein harter Schnitt. Dabei wichtig: `lastIndexOf` liefert −1, und −1 ist
immer „nahe genug" — ohne Wache (`> 0`) hätte jede Seite hart geschnitten.

### Das Schreibfeuer ist jetzt eine Zeichnung
Statt zweier CSS-Kästchen auf einem Balken (die Flamme saß neben dem Holz) eine
gezeichnete Feuerstelle als SVG: `feuerBild(stufe, {staerke, serie, zielErreicht})`
mit Bodenschein, Aschebett, Scheiten aus einem Holzverlauf, Glutstücken,
dreilagiger Flamme (außen/innen/Kern), Funken und einem Faden Rauch. Sie
reagiert auf alles, worauf es ankommt:
- **Wörter heute** → `feuerStaerke(heute, tagesziel)` skaliert die Flamme in
  Höhe und Breite (ohne eigenes Ziel gemessen an 800 Wörtern),
- **Stufe** (`aus` / `glut` / `brennt` / `lodert`) → kalte Scheite mit Rauch,
  glühendes Bett ohne Flamme, Flamme, hohe Flamme mit Funken,
- **Tage in Folge** → `feuerScheite(serie)`: ein Scheit, ab zwei Tagen zwei, ab
  einer Woche drei,
- **Tagesziel erreicht** → goldene Funken und heller Kern (`.ziel`).
Alles animiert (Flackern, Glutpulsieren, aufsteigende Funken, Rauch) und bei
`prefers-reduced-motion` still. Farbverläufe bekommen je Bild eigene Kennungen.

Tests 158/158 (neu: Seitenfüllung, Feuer-Helfer). Browser geprüft: Rolle und
„Am Stück" mit einer Werkzeugreihe und durchgehendem Papier, Feuer in allen
fünf Zuständen (aus → Glut → klein → voll → lodernd mit drei Scheiten).

## 29. Es wird Tag am Schreibtisch — und Feuerblut hat Seiten (24. August 2026, VANI 5.21.0)

### Drei Fehler
- **Orangene Kästen beim Tippen** (Rolle, Am Stück): Safaris globales `:focus-visible`
  (`outline: 2.5px var(--akzent)`) trifft bei jedem Tipp in ein Textfeld. Jetzt
  `textarea/input/[contenteditable]/.schreibflaeche/.rich-editor:focus-visible { outline: none }`
  — der Cursor zeigt, wo man ist.
- **Feuerblut leer**: die Seiten tragen JPEG-2000-Bilder. pdf.js 6 dekodiert JPX/JBIG2
  per WebAssembly und braucht dafür `wasmUrl` — ohne sie rendert die Seite weiß, obwohl
  Text da ist („Dependent image isn't ready yet"). Jetzt liegen `openjpeg.wasm`,
  `jbig2.wasm`, `qcms_bg.wasm` (+ Fallbacks, Lizenzen) in `vendor/wasm/`, und jedes
  Aufschlagen läuft über `pdfjsDokument(pdfjs, daten)` mit `wasmUrl` (55, 54c).
  Gemessen: Seite 20 vorher 0 dunkle Pixel, mit WASM 6227.
- Hosting-Test liest die Version aus der App (war auf 5.1x festgenagelt).

### Der Himmel lebt (54b)
Pure Helfer: `schreibtischSonnenzeiten(wann)` (Auf-/Untergang übers Jahr, Kosinus um
den 21. Juni), `schreibtischTageszeitInfo(wann, wahl)` → `{stunde, sonne 0..1, u 0..1
(Ost→West), licht, phase, waerme, aufgang, untergang}`; `wahl` kann `morgen/mittag/
golden/abend/nacht` festhalten. `schreibtischHimmelFarben(info, jahreszeit, wetter)`
mischt Nacht → Dämmerung → Horizont → Tag, Winter blasser, Herbst grauer, Regen/Gewitter
wolkig. `schreibtischTageslicht` bleibt als Helligkeit (0..1, jetzt wirklich 1 am Tag).
`maleFenster` neu: Sonne wandert (Position aus `u`, Höhe aus `sonne`), glüht tief
stehend orange, zarte drehende Strahlen; sechs treibende Wolken (weiß/rosig/nachts
hauchzart, dichter bei Regen); Vogelschwärme am Tag (Herbst: Gänse im Keil, Sommer:
schnelle Segler); Baumkronen, Büsche und Gras färben sich nach Jahreszeit (Frühling
hell, Sommer satt, Herbst orange/braun, Winter kahl mit Schnee auf den Ästen) und
dunkeln mit der Nacht; Sonnenseite der Kronen; Schmetterlinge im Sommer; Morgennebel
im Herbst dichter; Eisblumen in den Scheibenecken im Winter bei Dunkelheit; Mond nur,
wenn es dunkel wird. `maleLicht`: Fensterlicht kühl/golden nach `waerme`, ein
Sonnenbalken fällt schräg (nach Sonnenstand) durch beide Fensterhälften auf die
Platte, mit Sprossenschatten und tanzendem Staub; der Raum hellt am Tag ganz auf.
`data-tageszeit` (tag/daemmerung/nacht) + `data-phase` an der Szene.

### Einrichten
`saubererSchreibtisch` + `tageszeit` (`TAGESZEIT_WAHLEN`: echt, morgen, mittag, golden,
abend, nacht, zufall) und `jahreszeit` (`JAHRESZEIT_WAHLEN`: echt, fruehling, sommer,
herbst, winter, zufall); „Überraschung" würfelt beim Betreten und bleibt, solange der
Tisch steht (Signatur trägt nur die Wahl). Zwei Wahlgruppen im Einrichten-Fenster;
`maler.setze({jahreszeitWahl})` malt die statische Schicht neu.

Tests 158/158 (Tageslicht-Tests auf echte Sonne umgestellt, neu: Sonnenzeiten Juni/
Dezember, Info mittag/nacht/golden/morgen, Himmelsfarben Tag/Nacht/Regen/Winter).
Browser: Mittag (blauer Himmel, Sonne, Wolken, Schmetterling, heller Raum), goldene
Stunde im Herbst (orange Kronen, fallende Blätter, warmes Licht), Winternacht (kahle
Bäume, Schnee, Mond, Sterne); Feuerblut im Leser und im aufgeschlagenen Buch.

## 30. Der Salon — die Lieblingswand (24. August 2026, VANI 5.22.0)

Neuer Raum `salon` (`src/56-salon.js`, Icon `rahmen`, in der Leiste nach dem Schreibtisch,
Anleitungs-Kapitel, Spotlight-Befehl über ALLE_RAEUME).

### Daten
`SALON_AUTOREN`: King, Kästner, Funke, Rothfuss — je `id, name, jahre, woher, bild
(autoren/*.jpg), lage (object-position), foto {urheber, lizenz, lizenzUrl, seite}, kurz,
rahmen (nuss/gold/kupfer/dunkel), anrede, zitate [{t, o?, q}], saetze [30+], anfang [12],
kern [[thema, text] × ~29], schluss [10]`. **Zitate sind echt** und tragen ihre Quelle
(bei Übersetzungen das Original in `o`); unsichere stehen als „zugeschrieben". **Rat ist
erfunden** — das steht in der UI unter jedem Rat („erfunden, in … Geist").
`SALON_THEMEN` (11 Themen). Fotos: Wikimedia Commons, Lizenzen in `autoren/quellen.json`
und im Fenster „Über die Bilder"; CC BY-SA verlangt die Nennung — sie steht im Reiter „Über".

### Rat-Generator (pur, getestet)
`salonHash` (FNV), `salonZufall(saat)` (gemischte Saat + LCG + Xorshift-Mischer, unsigned!),
`salonRat(autor, saat, thema)` → `{text, art: 'satz'|'baukasten', thema}`: etwa jeder dritte
ein handgeschriebener Satz, sonst Anfang + Kern (nach Thema gefiltert) + meist Schluss.
`salonRatDesTages(autor, tagKey)` (Saat aus Tag + id). `salonVorrat(autor)` = Sätze +
Anfang×Kern×Schluss (≈ 3 500 je Stimme, 14 162 gesamt). Gleiche Saat → gleicher Rat;
200 Saaten → > 150 verschiedene.

### UI
Wand mit Tapete (Streifen + Ornament), vier Rahmen (Holz/Gold/Kupfer/Ebenholz, Bilderleuchte
mit Lichtkegel, Passepartout, Glasglanz, Messingschild; Auftritt gestaffelt, leichte Neigung,
Hover richtet auf), darunter Kurzsatz und die „Rat des Tages"-Karte. Tipp → `salonSprechen`:
Fenster mit Kopf (Foto, Name), Reiter Rat/Zitate/Über; Rat erscheint Wort für Wort
(Schreibmaschine), Themen-Chips, „Noch einen Rat", „Merken" (Schnipsel), „Damit schreiben"
(Blatt mit dem Satz); Zitate mit Original, Quelle, „Als Schnipsel"/„Kopieren". Eigene Leute:
`neuDoc('mentor', {titel, jahre, woher, notiz, zitate[], rat[], bild, rahmen})`
(Sanitizer in 30-core), Bearbeiten/Abnehmen im Reiter „Über". Zuhause: Karte „Aus dem Salon"
(Tag wählt die Person über `salonHash(tag)`).

### Außerdem
`IDEEN.md` „Das große Brainstorm (nach 5.22)": Salon weitergedacht (Gesprächsrunde,
Schreibaufgaben, Werkregal, Briefe an die Wand, Lesung, mehr Rahmen) und jeder Raum als Ort
(visuell: Diele, Zettelkasten, Papierstapel, Werkstatt, Setzkasten, Musikzimmer …; funktional je
Raum). `CODEX-UEBERGABE.md`: alles seit 5.9 für das Sites-Hosting (Ordner `autoren/`,
`vendor/wasm/` mitkopieren — `copy-vani.mjs` tut es). `package.json build.files` + `autoren/**`.

Tests 159/159 (neu: Salon-Vertrag: 4 Stimmen, ≥ 5 Zitate mit Quelle, ≥ 3000 Vorrat, alle Themen
je Stimme, Wiederholbarkeit, Vielfalt, Themenfilter). Browser: vier Rahmen mit Bildern, Rat des
Tages je Person, Sprechfenster (Kästner: 12 Chips, Dialog-Rat, 14 Zitate mit Quelle).

## 31. Salon, Stufe zwei — und Räume als Orte (24. August 2026, VANI 5.23.0)

### Salon
- **Frag die Wand**: Eingabezeile oben; `salonThemaAusFrage` (Stichwort → Thema, pur) und
  `salonRunde(frage)`: alle sechs Stimmen antworten nacheinander als Sprechblasen mit
  Porträt, Wort für Wort; „Noch eine Runde".
- **Schreibaufgaben** je Hausherr (6), Reiter „Aufgaben" im Fenster und „Schreibaufgabe
  des Tages" auf der Wand; `salonAufgabeAnnehmen` legt ein Blatt mit Kopfzeile an, öffnet
  den Schreibraum und startet `starteSprint(min)`.
- **Werkregal**: Reiter „Werke" mit gezeichneten Buchrücken (Titel, Jahr); Tipp = gelesen
  (`D.einst.salonGelesen[id]`, STANDARD_EINST, reist mit).
- **Lesung**: Knopf am Zitat liest die deutsche Fassung vor (`vorlesen`), das Foto im
  Fensterkopf leuchtet (`.salon-fenster.liest`).
- **Zitate im Original zuerst** (King, Rothfuss, Pratchett: `en: true`): englischer Text,
  „Übersetzung" klappt die deutsche Fassung auf; Kopieren/Schnipsel nehmen beides.
- **Gästezimmer**: Terry Pratchett (CC BY 3.0, Luigi Novi) und Astrid Lindgren (gemeinfrei)
  mit je ≥ 5 Zitaten, ≥ 12 Sätzen, 11 Kernen; `SALON_GAESTE`, `SALON_FEST`.
- Wand: Zierecken an den Rahmen, Licht der Wand folgt der Tageszeit (`data-licht`),
  Sockelleiste, Fragezeile, Aufgabenkarte, Abschnitte „Gästezimmer"/„Deine Wand".
- Daten liegen in `SALON_ZUSATZ` (Werke, Aufgaben, `en`) und werden beim Laden in
  `SALON_AUTOREN` gemischt.

### Räume als Orte (`src/57-orte.js`, Standard **aus**)
- `saubereOrte` (pur): `an` (aus), `tueren` (an), `geraeusche` (aus), je Raum ein Schalter;
  `orteRaumFuer` (heft→hefte, projekt→projekte, brett→cluster); `orteAktiv(raum)`.
- Router ruft nach jedem Zeichnen `orteAnwenden(haupt, raum)`: setzt `data-orte` am
  `html`, `data-raum`/`data-ort` am `#raum`, hängt `orteKulisse(raum)` davor (SVG-Bühnen:
  Diele mit Garderobe/Spiegel/Konsole + Neuigkeiten-Chips, Zettelkasten mit Wochenreitern +
  „Kasten schütteln" (drei zufällige Zettel), Papierstapel mit oberstem Titel, Lesetisch,
  Korkwand mit Nadeln und roter Schnur, Tischtuch mit Steinen, Setzkasten mit gespiegelten
  Lettern aus den letzten Titeln, Musikzimmer mit Plattenspieler (dreht, wenn Klang
  spielt), Telefonbank, Werkzeugkasten) und lässt die Tür aufgehen (`.tuer-auf`, optional
  Klick). Häute per CSS: Karteikarten, Papierstapel mit Eselsohr, angepinnte Karten auf
  Kork, Steine auf Leinen, Bleilettern, Plattenhüllen, Papierstreifen, Schubladenfronten.
- Feinheiten: neuer Abschnitt „Orte" (`orteKarte`): Hauptschalter, Türen, Geräusch, je Raum.

Tests 160/160 (neu: Gäste/Werke/Aufgaben/`en`/Themenfrage, Orte-Vorgaben). Browser: Runde mit
sechs Sprechblasen, King-Zitat im Original + Übersetzung auf Klick, Regal mit Gelesen-Häkchen,
Aufgabe des Tages; Orte an: Diele mit drei Chips, Zettelkasten mit Reitern und Karteikarten,
Kulissen in Projekte/Klang/Wörter/Feinheiten.

## 32. Der gemalte Salon, die Sitzung, das Diktat, der Wort-Vergleich (24. August 2026, VANI 5.24.0)

### Neue Dateien
- `src/56b-salon-malerei.js` — `salonMaler(canvas)`: Leinwand hinter der Wand (Damasttapete mit
  Ranken und Medaillons, Stuckleiste, Holzvertäfelung mit Kassetten, Kamin mit brennendem Feuer
  und Funken, Sessel, Teetisch, zwei Wandleuchter mit je zwei zitternden Flammen und Schein, Staub
  im Licht; Helligkeit folgt `schreibtischTageszeitInfo`; pausiert unter Schreibraum/Leser/hidden).
  In `RENDER.salon` als `.salon-malerei` vor die Galerie gehängt, Stopp per MutationObserver.
  Kopf-Knopf „Salon am Abend" (`salonKlang`: kamin .28 + uhr .14).
- `src/45c-diktat.js` — Diktat über `webkitSpeechRecognition` (iPad ≥ 14.5, Chrome): Knopf im
  Schreibraum-Kopf (nur wenn möglich), `diktatUmschalten` startet eine dauerhafte deutsche
  Erkennung, `diktatSaeubern` (pur, getestet) macht aus „Punkt/Komma/Fragezeichen/neuer Absatz"
  Zeichen und schreibt nach Satzende groß; `diktatEinfuegen` fügt an der Schreibstelle ein
  (Textarea oder contenteditable via execCommand); lange Pause = Absatz; Zwischenanzeige als
  Pille unten; Neustart bei `onend`, Stopp bei Rechtefehlern.
- `src/58-sitzung.js` — **Sitzung beginnen** (`sitzungBeginnen`): Dauer (10/20/45/ohne),
  Wortziel, Woran (neues Blatt oder einer der letzten drei Texte), Klang (still/Tisch/Garten/wie
  gerade), Kerze, Rat von der Wand (Vorschau, „Anderer Rat"); Einstellungen bleiben in
  `D.einst.sitzung`. `sitzungStarten` setzt Klang, legt das Blatt an (Rat als erste Zeile),
  öffnet den Schreibraum und zündet `starteSprint(min)`; ohne Kerze läuft eine eigene Uhr.
  **Bilanz** (`sitzungBilanz`): Wörter, Minuten, Ziel-Prozent, „Ein Satz von heute"
  (`sitzungFundsatz`, pur: längster neuer vollständiger Satz) als Fundstück, ein Lob von der Wand
  (Rat zum Thema ende/routine); wird von `beendeSprint` (45) und von `schliesseSchreibraum`
  (ohne Kerze) gerufen. Einstieg: Tintenfass-Menü am Tisch, Knopf im Schreibfeuer, Spotlight.
  **Wort-Diff** (`wortDiff`, pur, getestet): LCS auf Wörtern (Matrix bis 6000×6000, darüber
  Anfang/Ende-Vergleich), `wortDiffBilanz`, `wortDiffElement` (ins/del), `staendeVergleichen`
  als Lesebogen — im Schreibraum unter „Frühere Stände" → „Mit jetzt vergleichen".
- Orte: `raumklang` (Standard aus) in `saubereOrte`; `orteRaumklang` setzt je Ort einen leisen
  Grundton (Diele: Uhr, Zettelkasten: Café, Papierstapel: Blätter, Lesetisch/Korkwand: Kamin,
  Tischtuch: Wind, Setzkasten: Uhr, Telefonbank: Regendach) — nur, wenn keine eigene laute
  Mischung läuft; volle Raumhintergründe je Ort per CSS.
- `IDEEN.md` „Runde 3 (nach 5.24)": Hören und Stimme, Hand und Körper, Zeit und Gedächtnis,
  Welt und andere, Werkzeug und Tiefe, Schönheit.

Tests 163/163 (neu: Diktat-Säuberung, Wort-Diff inkl. Grenze, Fundsatz, Raumklang-Vorgabe).
Browser: gemalter Salon (Leinwand 879×1293 gefüllt), Klangknopf, Sitzungsfenster mit Rat-Vorschau,
Diktat-Knopf im Schreibraum (Chrome), Raumklang-Schalter in den Feinheiten.

## 33. Das Zimmer, die Ringe, die Lupe — Runde 3 gebaut (24. August 2026, VANI 5.25.0)

### Salon, Stufe drei
- Die Wand ist ein Zimmer: `RENDER.salon` baut nur noch die Rahmen in die gemalte Galerie
  (`.salon-galerie.zimmer`: Reihe „haus" mit vier, Reihe „gaeste" mit Gästen und eigenen
  Leuten, darunter Vertäfelung und Kamin sichtbar); Kurzsätze und Rat des Tages wandern als
  Karten auf die **Konsole** unter der Wand (`.salon-konsole`, Miniporträt je Karte).
- **„Setz dich"**: unsichtbare Fläche über dem Sessel (`.salon-sessel`) startet die Sitzung;
  eine Fläche über dem Kamin schaltet den Salon-Klang. Der **Kamin brennt höher, wenn das
  Kaminknistern spielt** (Painter liest `D.einst.ambience.kamin`).
- **Briefe an die Wand**: `salonBriefSchreiben(an)` legt ein Blatt „Brief an …" an (Anrede
  vorausgefüllt) und merkt sich den Brief in `D.einst.salonBriefe` (`saubereSalonBriefe`, pur).
  `salonBriefeNachsehen` (beim Betreten des Salons) legt nach drei Tagen eine **Antwort** als
  Schnipsel ab — zwei Räte in der Stimme, Thema aus dem Brieftext (`salonThemaAusFrage`), klar
  als erfunden markiert; Karte „Briefe unterwegs" mit Restzeit. Icon `brief` neu im Icon-Satz.
### Orte, Stufe drei
- Setzkasten-Lettern kommen aus den **Wörtern der Wortkisten** (`woerterInKiste('alle','','neu')`),
  die Diele trägt **Jahreszeitendeko** an der Garderobe (Zweig/Blüte/Strohhut/Blatt), im
  Musikzimmer sind die **Platten Klangbilder** (`KLANG_SZENEN` auflegen, „Nadel heben").
### Runde 3
- **Das Jahr in Ringen** (`src/59-jahresringe.js`): `jahresringeDaten(tage, jahr)` (12 Monate,
  Anteil, Jahreszeit), `jahresringeJahre`, `jahresringeSVG` (unrunde Ringe, Kerbe für leere
  Monate, Rinde, Monatsnamen); Fenster `zeigeJahresringe` mit Jahreswahl, Tipp auf einen Ring
  listet die Texte des Monats, „Als SVG kopieren". Knopf in den Feinheiten (Statistik) und
  Spotlight.
- **Textlupe** (`src/45d-textlupe.js`): `textLupe(text)` (pur): Wiederholungen (≥ 3, ≥ 4 Zeichen,
  Stoppwortliste), Füll-/Verstärkerwörter, Satzlängen (Mittel, längster, kürzester, Streuung),
  Absätze; `zeigeTextlupe` mit Rhythmus-Balken, Chips und „Im Text markieren" (gelb/rosa im
  Lesebogen). Im Schreibraum-Menü neben „Stand einfrieren".
- **Klangkarte je Text**: `klangkarteMerken(doc)` beim Speichern (Textarea und Rich-Editor
  über `beiSpeichern`), `doc.klang` (Sanitizer), `klangkarteAnbieten` beim Öffnen („Damals
  lief: … — Wieder an"), wenn gerade nichts spielt.
- **Pause nach 40 Minuten**: `pauseErinnerungStart/Stopp` (Schreibraum auf/zu), Einstellung
  „Pause nach 40 Minuten" im Schreibraum (`D.einst.pausenErinnerung`, Standard an), leise Toasts.
- **Atemminute vor der Sitzung**: Schalter „Eine Minute atmen vorher" (`e.atmen`),
  `sitzungAtmen` — Kreis atmet 4 ein / 6 aus, sechsmal, überspringbar.
- **Heute vor einem Jahr**: `heuteVorEinemJahr(docs, jetzt)` (pur) sucht einen Text vom selben
  Tag und Monat aus einem früheren Jahr; `baueAltesBlatt` legt ihn als vergilbtes Blatt mit
  Datum und Stempel „vor einem Jahr" auf den Tisch (links vorn); Tipp öffnet ihn. In der Signatur.
- Diktat wird beim Schließen des Schreibraums sauber beendet.

Tests 167/167 (neu: Textlupe, Jahresringe-Daten/Jahre/SVG, Heute-vor-einem-Jahr, Salon-Briefe).
Browser: Zimmer mit zwei Rahmenreihen, Sessel- und Kaminfläche, sechs Konsolenkarten, Brief-Fenster,
Jahresringe (12 Ringe, „841 Wörter an 1 Tagen"), Textlupe (6 Zahlen), altes Blatt auf dem Tisch.
