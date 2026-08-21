# VANI 5.1 — vollständige Übergabe an Claude

> **Stand:** 21. August 2026, nach Abschluss von VANI 5.1
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

- App-Version: **5.1.0**
- Lokaler Git-HEAD: **`0301606` — `VANI 5.1: persönliche Wortkisten`**
- Vorheriger großer Codex-Commit: **`d4ecb8e` — `VANI 5: Profile, Rich-Text, Hefte, Klang und Updates`**
- Letzter Stand vor Codex / letzter Claude-basierter Commit: **`af63ec0`**
- Öffentliche App: **https://vani-schreibzuhause.craftkey.chatgpt.site**
- Sites-Projekt-ID: **`appgprj_6a8786eb79448191acff5186595d06ec`**
- Zuletzt öffentlich gespeicherte Sites-Version: **Version 3**
- Sites-Quellcommit für VANI 5.1: **`15719d9e213c4c6ad05c3d62957437250d6779d9`**
- Windows-Setup: `C:\Users\kevin\VANI\release\VANI-5.1.0-x64-Setup.exe`
- Windows Portable: `C:\Users\kevin\VANI\release\VANI-5.1.0-x64-Portable.exe`

### Git-Warnung

Die lokale Branch `main` enthält **zwei Produktcommits plus den
Übergabedokumentationscommit vor `origin/main`**. GitHub steht noch auf `af63ec0`.
Diese lokalen Commits wurden nicht zu GitHub gepusht. Die öffentliche Sites-App
wurde dagegen separat aus dem Hosting-Teilbaum veröffentlicht und ist bereits auf
VANI 5.1.

Claude muss deshalb bei der Übernahme **den lokalen HEAD als Wahrheit** behandeln.
Kein Reset auf `origin/main`, kein Checkout der alten GitHub-Fassung und kein
Überschreiben der lokalen Commits.

### Qualitätsstand

- `npm test`: **69/69 bestanden**
- `hosting/npm test`: **2/2 bestanden**
- `hosting/npm run lint`: **sauber**
- Windows-Paket wurde real gestartet und per CDP-Smoke-Test geprüft
- Rich-Text-Autopaginierung: 850 Testwörter → 8 Seiten, kein Textverlust
- Wortkisten: echte UI-, Such-, Daten- und Layoutprüfung bestanden
- Desktopbreite und 390-Pixel-Handybreite: kein ungewollter Seitenüberlauf
- Öffentliche App: HTTP 200, VANI 5.1 und Wortkisten-Code bestätigt
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
10. **GitHub enthält den Codex-Stand noch nicht.** Erst nach bewusster Nutzerfreigabe
    die lokalen Produkt- und Übergabedokumentationscommits zu `origin/main` pushen.

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
