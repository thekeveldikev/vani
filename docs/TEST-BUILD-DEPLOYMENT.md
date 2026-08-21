# VANI 5.1 – Test-, Build-, Release- und Deployment-Handbuch

> Stand: 21. August 2026
> Alle Befehle, sofern nicht anders angegeben, in C:\Users\kevin\VANI ausführen.

## 1. Grundregel

Eine Änderung ist erst fertig, wenn:

1. die kanonische Quelle geändert wurde;
2. ein notwendiger Regressionstest für den gefundenen Bug existiert;
3. die relevante Suite sauber läuft;
4. die Webartefakte neu gebaut wurden;
5. die echte Zieloberfläche bei UI-Risiko geprüft wurde;
6. kein Test ohne Erklärung übersprungen wurde;
7. Versions-, Release- und Deploymentstatus ehrlich dokumentiert sind.

Ein Git-Commit, ein Windows-Paket und ein Sites-Deployment sind drei getrennte
Vorgänge. Keiner impliziert automatisch die anderen.

## 2. Voraussetzungen

- Windows/PowerShell für die bisher verifizierten Desktoppakete.
- Node.js mindestens 22.13.
- npm passend zum Lockfile.
- Für Electron-Build ausreichend freier Speicher; release kann mehrere hundert MB
  inklusive alter Pakete und win-unpacked belegen.
- Für Sites-Deployment ein autorisierter Codex/Sites-Arbeitsbereich.

Prüfen:

    node --version
    npm --version
    git status -sb
    git log -5 --oneline

Erwarteter Übergabestand vor dem neuen Dokumentationscommit:

    0301606 VANI 5.1: persönliche Wortkisten
    d4ecb8e VANI 5: Profile, Rich-Text, Hefte, Klang und Updates
    af63ec0 Faden per Passwort hereinholen...

origin/main steht beim Schreiben noch auf af63ec0. Nicht auf diesen alten Stand
zurücksetzen.

## 3. Abhängigkeiten installieren

Wenn node_modules fehlt oder das Lockfile geändert wurde:

    npm ci

Für das Hostingprojekt getrennt:

    Set-Location C:\Users\kevin\VANI\hosting
    npm ci
    Set-Location C:\Users\kevin\VANI

npm ci ist für reproduzierbare Prüfungen vorzuziehen. npm install nur bewusst
verwenden, wenn Abhängigkeiten aktualisiert und Lockfiles geändert werden sollen.

## 4. Root-Testpaket

### Befehl

    npm test

Aktueller sauberer Stand: **69 von 69 Tests bestanden.**

package.json startet:

    node --test test/*.mjs

### Testgruppen

| Datei | Schwerpunkt |
|---|---|
| test/lauf.mjs | bestehende Kernlogik, Schreiben, Suche, Papierkorb, Parser |
| test/kern-edge.mjs | Sanitizing, Grenzen, Korruption, Beziehungen, Profile, Wortkisten, Audio |
| test/vertraege.mjs | Quellstruktur, Sicherheits- und Buildverträge |
| test/sync-client.mjs | Kopplung, Verschlüsselung, Konfiguration, Warteschlange |
| test/sync-server.mjs | Auth, Isolation, Idempotenz, Rennen, Limits, Blöcke |
| test/server.mjs | statische Auslieferung, Header, Traversal, Parallelzugriff |
| test/sandkasten.mjs | isolierte browserähnliche Kern-Testumgebung |

### Wann ein neuer Test nötig ist

Ein permanenter Regressionstest gehört dazu, wenn:

- ein Nutzerfehler reproduziert und behoben wurde;
- beschädigte Daten einen Absturz oder Datenverlust auslösen konnten;
- ein Grenzwert neu eingeführt oder korrigiert wird;
- asynchrones Verhalten/Rennen geändert wird;
- Löschen, Undo, Sync oder Migration betroffen sind;
- Sicherheitsvalidierung oder Sanitizing geändert werden;
- der Build versehentlich eine Funktion verlieren könnte.

Kein Test soll nur dieselbe Implementierungszeile mit anderen Beispieldaten
wiederholen. Prüfe beobachtbares Verhalten und den ursprünglichen Fehlermechanismus.

### Adversariale Mindestfragen

Für jede neue Funktion prüfen:

- Was passiert bei leer, null, undefined, falschem Typ?
- Was passiert direkt unter, auf und über jedem Grenzwert?
- Was passiert bei sehr langen Texten oder sehr vielen Einträgen?
- Was passiert bei doppeltem Klick oder parallelen Requests?
- Was passiert offline, beim Abbruch und beim Neustart?
- Was passiert bei kaputtem IndexedDB-/Backup-/Serverzustand?
- Bleibt Undo vollständig?
- Bleiben fremde Profile/Vaults isoliert?
- Kann HTML, CSS, URL oder Dateiname Code/Pfad einschleusen?
- Terminiert der Algorithmus auch bei pathologischen Abhängigkeiten wie konstantem
  Zufall oder nie antwortendem Netz?

## 5. Webbuild

### Befehl

    npm run build:web

Dieser Befehl:

1. baut vendor/vani-sync.js aus Yjs/Y-IndexedDB;
2. setzt src-HTML, CSS und JS in fester Reihenfolge zusammen;
3. schreibt index.html;
4. schreibt artifact.html.

Danach prüfen:

    git diff --check
    git status --short

Erwartete Änderungen an index.html und artifact.html sind nach src-Änderungen normal.
Eine Änderung nur an index.html ohne passende src-Änderung ist verdächtig.

## 6. Lokal im Browser prüfen

Start:

    npm start

oder:

    node server.js

Adresse:

    http://localhost:4321/?kein-sw=1

kein-sw=1 verhindert beim Entwickeln, dass ein alter Service Worker das neue
Verhalten überdeckt. Das Browserfenster nach der Prüfung schließen und den Server
mit Strg+C stoppen.

### Manuelle Kernprüfung

- neues Testprofil in einem getrennten Browserprofil anlegen;
- Zuhause und alle sichtbaren Räume öffnen;
- Text schreiben, schließen, neu laden und Persistenz prüfen;
- Heft mit langem Rich-Text-Paste prüfen;
- Autoseitenwechsel einmal an und aus;
- Schnipsel zwischen lauf und frei;
- Blatt einheften, wieder lösen und Undo;
- Wortkiste anlegen, Wörter mehrfach einfüllen, suchen, verschieben und löschen;
- Klang erst nach Klick starten, Testton und Neu-wecken;
- Suche zu einem Ziel springen lassen;
- Feinheiten, Sicherung und Updateanzeige öffnen;
- schmale mobile Breite prüfen;
- Konsole auf ungeklärte Exceptions prüfen.

Reale persönliche Daten nie als Testbestand verwenden.

## 7. Hostingprojekt prüfen

Aus dem Hostingordner:

    Set-Location C:\Users\kevin\VANI\hosting
    npm test
    npm run lint
    Set-Location C:\Users\kevin\VANI

Aktueller sauberer Stand:

- Hostingtests: **2 von 2 bestanden**
- ESLint: **ohne Fehler**

hosting/npm test führt vor den zwei Verträgen einen vollständigen Hostingbuild aus.
copy:vani kopiert dabei die aktuelle Root-Web-App nach hosting/public.

Bei Änderungen am Worker zusätzlich die v1-Verträge, Authentifizierung, Grenzen und
Vault-Isolation prüfen. Ein erfolgreicher statischer Renderingtest ersetzt keinen
API-Test.

## 8. Desktop im Entwicklungsmodus

    npm run desktop

Dieser Befehl baut zuerst die Web-App und startet Electron. Mit einem leeren,
separaten Testprofil prüfen:

- Profilgate;
- vani://app-Start;
- lokales Speichern;
- Syncserver-Vorgabe;
- fremde Links öffnen extern;
- keine Node-Objekte im Renderer;
- Desktopfenster auf schmale und breite Größe;
- App beenden und erneut öffnen.

## 9. Windows-Pakete bauen

### Befehl

    npm run desktop:win

Der Befehl baut Web und danach:

- NSIS-x64-Setup;
- x64-Portable;
- win-unpacked.

Aktuelle VANI-5.2.1-Artefakte:

| Datei | Größe | SHA-256 |
|---|---:|---|
| release\VANI-5.2.1-x64-Setup.exe | 105.157.126 Bytes | 5E85F3F20EB810767077B967B3602622980F03162B4D899FB90DBEDDC437124C |
| release\VANI-5.2.1-x64-Portable.exe | 104.921.304 Bytes | D6E70CD6D671E62143421F95BEFEB88D9D5B2B31851FF78D93A20AF57EBBA39D |

Hashes neu berechnen:

    Get-FileHash .\release\VANI-5.2.1-x64-Setup.exe -Algorithm SHA256
    Get-FileHash .\release\VANI-5.2.1-x64-Portable.exe -Algorithm SHA256

Bei einer neuen Version Dateinamen entsprechend anpassen. Niemals alte Hashwerte für
neu gebaute Dateien wiederverwenden.

## 10. Paketierter Desktop-Smoke-Test

Der Smoke-Test benutzt Chromes Diagnoseport und **muss** mit einem eigenen leeren
user-data-dir laufen. Niemals das echte VANI-Profil des Nutzers als Testziel nehmen.

Beispiel in PowerShell:

    $vaniSmokeData = "C:\Users\kevin\VANI\release\smoke-user-data-neu"
    New-Item -ItemType Directory -Path $vaniSmokeData -Force | Out-Null
    $vaniExe = "C:\Users\kevin\VANI\release\win-unpacked\VANI.exe"
    $vaniProcess = Start-Process -FilePath $vaniExe -ArgumentList "--remote-debugging-port=9333", "--user-data-dir=$vaniSmokeData" -WindowStyle Hidden -PassThru
    npm run desktop:smoke
    Stop-Process -Id $vaniProcess.Id

Optionales Bildschirmbild:

    node werkzeug/smoke-cdp.mjs 9333 --bild

Der Smoke-Test:

- legt nur im getrennten Testprofil eine Prüftür an;
- öffnet die App;
- erzeugt eigenen Funken und gestaltetes Heft;
- verteilt 850 formatierte Wörter automatisch;
- prüft vollständigen Text und Richformat;
- legt Wortkiste und Wörter an;
- prüft Wortnotizsuche;
- prüft Wortkistenoberfläche;
- prüft, dass die Desktop-App genau eine sichtbare GitHub-Adresse und den
  unsichtbaren Sites-Synctresor verwendet;
- prüft Desktopbreite gegen Overflow;
- prüft Rich-Sanitizing;
- kann release/desktop-smoke.png erzeugen.

Letzter erfolgreicher Lauf:

- Appversion 5.2.1;
- acht Rich-Seiten;
- vollständiger Text;
- Wortkisten-UI und Suche vorhanden;
- Ein-Adress-Karte und Syncserver-Vorgabe korrekt;
- kein ungeklärter Überlauf.

Der Beispielprozess darf nur beendet werden, wenn seine PID aus genau diesem
Start-Process-Aufruf stammt. Keine pauschalen Electron-/VANI-Prozesse abschießen.

## 11. Versionswechsel

Bei einem echten Release mindestens gemeinsam aktualisieren:

1. src/30-core.js – APP_VERSION;
2. sw.js – VERSION/Cachekennung;
3. package.json – version;
4. package-lock.json – Rootversion;
5. hosting/package.json – version;
6. hosting/package-lock.json – Rootversion;
7. hosting/tests/rendered-html.test.mjs – erwartete Version;
8. sichtbare Installations-/Release-Dokumentation;
9. danach npm run build:web und Hostingbuild.

Zusätzlich suchen:

    rg -n "5\.1\.0|VANI 5\.1|vani-5\.1" .

Nicht blind alle Treffer ersetzen: alte Changelogs, frühere Releases und historische
Artefakte sollen ihre echte Version behalten.

## 12. PWA-Releaseprüfung

Vor Veröffentlichung:

- manifest.json id bleibt ./;
- start_url bleibt ./;
- scope bleibt ./;
- sw.js trägt neue Cacheversion;
- index.html referenziert das Manifest korrekt;
- Installationsicon bleibt an derselben URL;
- Updateknopf und waiting-worker-Fluss bleiben;
- Navigation funktioniert online und offline;
- neue App hinter bestehendem Icon aktualisiert;
- no-cache für HTML, Manifest und Worker;
- keine neue öffentliche URL für ein gewöhnliches Update.

Die Web-App kann ein Home-Bildschirm-Icon nicht selbst löschen. iPadOS steuert diese
Berechtigung. Die App soll nur die richtige Anleitung geben.

## 13. Sites-Deployment

### Bestehendes Produktionsziel

- sichtbare Haupt-App: https://thekeveldikev.github.io/vani/
- Sync-/Backend-Host: https://vani-schreibzuhause.craftkey.chatgpt.site
- Projekt-ID: appgprj_6a8786eb79448191acff5186595d06ec
- Konfiguration: hosting\.openai\hosting.json
- Bindings: D1 DB, R2 FILES
- zuletzt erfolgreich veröffentlichte Sites-Version: 5
- VANI-5.2.1-Sites-Quellcommit: 41dcb233658707d4ae3fddc4b8a7f7e15e91d3a0

### Ablauf

1. Nutzerfreigabe für öffentliche Veröffentlichung prüfen.
2. Root-Tests ausführen.
3. npm run build:web.
4. Hostingtests und Lint ausführen.
5. hosting/public durch den vorgesehenen Build kopieren lassen.
6. Prüfen, dass hosting/.openai/hosting.json die bestehende Projekt-ID trägt.
7. Nur wenn Worker, v1, D1/R2 oder Rettungsmodus geändert wurden: mit der
   Sites-Hostingfunktion eine **neue Version des bestehenden Projekts** speichern.
8. Diese Version öffentlich deployen.
9. Sites-Startseite prüfen: sie muss nur eine Umzugsseite sein und automatisch zur
   GitHub-App führen; sie darf kein PWA-Manifest einbinden.
10. /v1/health muss weiterhin den Sync-Dienst melden.
11. `/rettung.html?rettung=1&kein-sw=1` muss die aktuelle App liefern; `/sw.js`
    muss den früheren Service Worker abmelden und darf keinen Fetch-Handler besitzen.
12. Deploymentversion und Quellcommit dokumentieren.

Keine zweite Site anlegen. Keine D1-/R2-Bindings umbenennen. Keine persönlichen
Inhalte nach hosting/public kopieren.

### Schnelle Produktionsprüfung

Mindestens:

    Invoke-WebRequest "https://thekeveldikev.github.io/vani/?pruefung=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" -UseBasicParsing
    Invoke-WebRequest "https://vani-schreibzuhause.craftkey.chatgpt.site/v1/health" -UseBasicParsing
    Invoke-WebRequest "https://vani-schreibzuhause.craftkey.chatgpt.site/rettung.html?rettung=1&kein-sw=1" -UseBasicParsing

Danach im Browser:

- GitHub-App öffnet ohne Serverfehler;
- Profilgate erscheint;
- Version stimmt;
- Update hinter altem Icon;
- Health meldet vani-sync v1;
- Sites-Startseite ist keine zweite App;
- keine echte Nutzersynchronisation als Test missbrauchen.

## 14. Git-Ablauf

Vor Änderungen:

    git status -sb
    git diff

Nach Änderungen:

    git diff --check
    git diff --stat
    git status --short

Nur zum Auftrag gehörende Dateien stagen. Bestehende Nutzeränderungen nicht
überschreiben oder zurücksetzen.

Ab VANI 5.2.1 ist origin/main die einzige Web-App-Quelle. Ein Push aktualisiert
GitHub Pages (https://thekeveldikev.github.io/vani/) und damit iPad, Handy und
Browser-PWA. Die Sites-Adresse ist nur der Sync-Hintergrund; sie wird nicht bei jedem
UI-Update deployt.

Ein Push zu origin/main ist und bleibt eine externe Veröffentlichung — nur nach
Nutzerfreigabe. Nach einem Push kurz prüfen, dass Pages gebaut hat (GitHub-API
`/repos/thekeveldikev/vani/pages/builds/latest` oder die Seite mit Cache-Busting
laden).

Ein Push zu origin/main ist eine externe Veröffentlichung und soll nur nach
entsprechender Nutzerfreigabe erfolgen. Kein git reset --hard und kein Checkout über
den lokalen Produktstand.

## 15. Daten- und Migrationsprüfung

Vor Schema-/Datenänderungen:

1. Backup aus einer Testfassung erzeugen.
2. einen Altbestand aus DB-Version vor der Änderung öffnen.
3. Upgrade mehrfach ausführen; es muss idempotent sein.
4. Dokumentanzahl und Textinhalt vor/nachher vergleichen.
5. Papierkorb und Undo prüfen.
6. lokale Profile getrennt prüfen.
7. Sync eines alten und neuen Clients bedenken.
8. defekte/zu große Importdaten prüfen.
9. keine echte Nutzerdatei in Tests oder Git hinterlassen.

Für riskante Migrationen einen expliziten Migrationstest und eine verständliche
Rettungsanleitung ergänzen.

## 16. Ressourcen- und Lastprüfung

Sinnvolle, begrenzte Prüfungen statt unkontrollierter Systembelastung:

- viele kleine Dokumente in der Sandbox;
- große Texte bis zu den dokumentierten Grenzen;
- parallele HTTP-Anfragen mit überschaubarer Anzahl;
- Updates knapp unter und über Bodygrenzen;
- pathologischer Zufall als Stub;
- Netzwerk-Timeout/Abort;
- fehlender R2-/Medienblock;
- beschädigte IndexedDB-Werte;
- wiederholtes Start/Stop von Audio.

Keine Tests dürfen reale Rechner absichtlich bis zum Absturz füllen. Resource
Exhaustion wird mit kontrollierten Grenztests und klaren Limits geprüft.

## 17. Release-Abnahme in einfacher Checkliste

- [ ] Arbeitsbaum verstanden; keine fremden Änderungen überschrieben.
- [ ] Keine persönlichen Daten, Passwörter oder Kopplungscodes im Diff.
- [ ] Notwendige Regressionstests ergänzt.
- [ ] npm test vollständig grün.
- [ ] npm run build:web erfolgreich.
- [ ] git diff --check sauber.
- [ ] Browserprüfung breit und schmal.
- [ ] Rich-Paste/Autoseite bei entsprechender Änderung.
- [ ] Löschen und Undo bei Datenmodelländerung.
- [ ] Sync/Offline bei Synchronisationsänderung.
- [ ] Klang auf realem Zielgerät bei Audioänderung.
- [ ] Hosting npm test und lint grün, wenn Web/Public betroffen.
- [ ] Paketierter Desktop-Smoke grün, wenn Desktop/Build/UI betroffen.
- [ ] Versionen gemeinsam aktualisiert, wenn Release.
- [ ] Artefakthashes neu ermittelt.
- [ ] bestehende Sites-Projekt-ID beibehalten.
- [ ] Nutzerfreigabe vor Push oder öffentlichem Deployment.
- [ ] Ergebnis auf Deutsch und ohne Überversprechen erklärt.

## 18. Was nicht automatisch gelöscht werden darf

- release-Artefakte;
- echte Appdaten in Electron-/Browserprofilen;
- IndexedDB des Nutzers;
- vani-sync-data oder VANI_DATA_DIR;
- D1-/R2-Daten;
- faden.enc;
- persönliche .vani-Sicherungen außerhalb des Repos;
- lokale Commits vor origin/main.

Temporäre Smoke-Profile nur dann entfernen, wenn ihr absoluter Pfad eindeutig unter
C:\Users\kevin\VANI\release liegt und sie nicht mehr benötigt werden. Vor rekursivem
Entfernen Pfad auflösen und kontrollieren.
