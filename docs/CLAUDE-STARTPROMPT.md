# Kopierfertiger Startprompt für Claude

> Diesen Prompt vollständig kopieren und in den neuen Claude-Chat einsetzen.
> Danach die konkrete nächste Aufgabe an der markierten Stelle ergänzen.

## Vollständiger Übernahmeprompt

~~~text
Du übernimmst jetzt die weitere Entwicklung von VANI auf meinem Windows-Rechner.
Das Arbeitsverzeichnis ist:

C:\Users\kevin\VANI

VANI wurde ursprünglich von dir/Claude aufgebaut. Ab dem Nutzerauftrag vom
Donnerstag, 20. August 2026, ca. 23:19 Uhr („Hi! Schau dir bitte die App ganz genau
an …“) hat Codex die App massiv geprüft, repariert, erweitert, als Desktop-App
gebaut und öffentlich als VANI 5.1 veröffentlicht.

Bitte beginne nicht sofort mit Umbauten. Mache zuerst diese Übernahme vollständig:

1. Führe git status -sb und git log -5 --oneline aus.
2. Behandle den lokalen Stand als Wahrheit. Der letzte Produktstand ist mindestens:
   - 0301606 – VANI 5.1: persönliche Wortkisten
   - d4ecb8e – VANI 5: Profile, Rich-Text, Hefte, Klang und Updates
   - af63ec0 – letzter Stand vor Codex
3. origin/main ist noch veraltet und steht bei af63ec0. Setze nicht zurück, checke
   nicht die alte GitHub-Fassung über den lokalen Stand aus und verwirf keine lokalen
   Commits oder vorhandenen Nutzeränderungen.
4. Lies diese fünf Dateien vollständig und in dieser Reihenfolge:
   C:\Users\kevin\VANI\CLAUDE-UEBERNAHME.md
   C:\Users\kevin\VANI\docs\CODEX-CHANGELOG.md
   C:\Users\kevin\VANI\docs\TECHNISCHE-ARCHITEKTUR.md
   C:\Users\kevin\VANI\docs\TEST-BUILD-DEPLOYMENT.md
   C:\Users\kevin\VANI\docs\CLAUDE-STARTPROMPT.md
5. Lies danach die für meine konkrete Aufgabe relevanten Quell- und Testdateien.
6. Prüfe vor Änderungen die Ausgangslage mit npm test.

Wichtige Regeln:

- Die kanonischen Webquellen liegen unter C:\Users\kevin\VANI\src.
- index.html, artifact.html und hosting/public/index.html sind Buildprodukte. Ändere
  sie nicht als einzige dauerhafte Lösung. Nach Quelländerungen npm run build:web.
- VANI bleibt lokal-first und vollständig offline benutzbar. Sync bleibt optional.
- Lokale Profile sind keine zentralen Internetkonten. Mehrgerätezugriff entsteht
  separat durch einen verschlüsselten Sync-Vault und Kopplungscode.
- Niemals im Gespräch genannte echte Namen, Passwörter, Faden-Passwörter,
  Kopplungscodes oder persönliche Notizen in Source, Tests, Doku oder Git schreiben.
- Bestehende IndexedDB-Daten, alte Datenbank vani, Profile, Papierkorb,
  Sicherungsformat, Sync und Undo migrationssicher bewahren.
- Die PWA-Identität bleibt stabil: manifest id, start_url und scope bleiben "./".
  Normale Updates müssen hinter demselben Home-Bildschirm-Icon erscheinen.
- Für jeden echten gefundenen Bug einen notwendigen, nicht redundanten permanenten
  Regressionstest ergänzen.
- Adversarial testen: leere/falsche/kaputte Eingaben, Grenzen, große Daten, Rennen,
  Offline/Abbruch, Ressourcenlimits, Zustandskorruption, Löschen/Undo, Isolation und
  Sicherheitsannahmen.
- Keine ungeklärten Testfehler stehen lassen oder pauschal wegfiltern.
- Kein git reset --hard, kein Überschreiben fremder Änderungen.
- Nicht zu GitHub pushen und nicht öffentlich deployen, solange ich es nicht für die
  konkrete Änderung freigegeben habe.
- Für ein Sites-Update immer das bestehende Projekt verwenden:
  URL: https://vani-schreibzuhause.craftkey.chatgpt.site
  Projekt-ID: appgprj_6a8786eb79448191acff5186595d06ec
  Konfiguration: C:\Users\kevin\VANI\hosting\.openai\hosting.json
  Lege für ein normales Update keine zweite Site an.
- Die Desktop-App hat Electron und Windows-Setup/Portable. Der öffentliche native
  Auto-Updatefeed ist noch nicht konfiguriert; behaupte nicht, er sei fertig.
- Goodnotes ist ein stiller Archivimport, kein echter Live-Zweiwegesync.
- Spotify ist noch nicht implementiert.
- Bei Audio ist iOS/WebKit eine reale Plattformgrenze; Appcode mitigiert sie, kann
  sie aber nicht unter jeder Gerätesituation garantieren.

Aktueller verifizierter Qualitätsstand vor deiner nächsten Änderung:

- Appversion 5.1.0
- npm test: 69/69
- Hostingtests: 2/2
- Hostinglint: sauber
- paketierter Windows-CDP-Smoke: bestanden
- Rich-Autopaginierung: 850 Wörter auf 8 Seiten, kein Textverlust
- Wortkisten-UI, Suche und Responsive-Layout: bestanden

Die öffentliche App ist bereits VANI 5.1, obwohl GitHub noch zurückliegt. Lokale
Git-Historie, öffentliche Sites-Historie und Windows-Releases sind getrennte Dinge.

Arbeitsweise für meine nächste Aufgabe:

1. Untersuche das bestehende Verhalten und reproduziere Bugs zuerst.
2. Erkläre kurz, welche Dateien und Datenverträge betroffen sind.
3. Implementiere die Änderung vollständig, ohne unnötigen Komplettumbau.
4. Ergänze gezielte Regressionstests.
5. Führe alle relevanten Tests, Builds, Lints und bei UI-/Desktop-Risiko den echten
   Smoke-Test aus.
6. Prüfe git diff --check und kontrolliere den finalen Diff auf persönliche Daten.
7. Fasse mir am Ende auf Deutsch sehr verständlich, freundlich und ohne
   Entwicklerjargon zusammen:
   - was jetzt neu oder repariert ist;
   - wie ich es benutze;
   - was automatisch funktioniert;
   - welche ehrlichen Grenzen verbleiben;
   - ob ich für iPad, Handy oder Desktop etwas tun muss;
   - ob nur lokal gebaut oder auch veröffentlicht wurde.

Meine nächste konkrete Aufgabe lautet:

[HIER MEINE NÄCHSTE AUFGABE EINFÜGEN]
~~~

## So benutzt Kevin die Datei

1. Claude öffnen.
2. Den gesamten Text im Kasten oben kopieren.
3. Den letzten Platzhalter durch den nächsten Wunsch ersetzen.
4. Prompt absenden.
5. Wenn Claude nicht automatisch Zugriff auf C:\Users\kevin\VANI hat, den Ordner als
   Projekt/Arbeitsverzeichnis öffnen und denselben Prompt noch einmal senden.

## Kurzer Fortsetzungsprompt für spätere Claude-Chats

Wenn Claude die Übergabe bereits einmal vollständig gelesen hat und nur ein neuer Chat
begonnen wird, reicht:

~~~text
Arbeite im bestehenden Projekt C:\Users\kevin\VANI weiter. Lies zuerst vollständig
C:\Users\kevin\VANI\CLAUDE-UEBERNAHME.md und befolge die dort verlinkten Architektur-
und Testverträge. Bewahre den lokalen Stand vor origin/main, ändere kanonische Quellen
statt nur Buildprodukte, sichere Datenkompatibilität, ergänze für Bugs gezielte
Regressionstests und pushe/deploye nicht ohne meine Freigabe.

Meine nächste Aufgabe:
[AUFGABE]
~~~

## Falls Claude einen scheinbaren Widerspruch findet

Priorität:

1. aktueller lokaler Quellcode und Tests;
2. CLAUDE-UEBERNAHME.md;
3. TECHNISCHE-ARCHITEKTUR.md;
4. CODEX-CHANGELOG.md;
5. TEST-BUILD-DEPLOYMENT.md;
6. aktuelles README und die Spezialdokumente;
7. historisches BAUPLAN.md.

Claude soll einen echten Widerspruch nicht still erraten, sondern Quellcode und
Git-Historie prüfen, die Dokumentation korrigieren und die Entscheidung im Ergebnis
verständlich nennen.
