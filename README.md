# VANI

Ein Zuhause zum Schreiben. Von mir, für mich.

Kein Konto und kein Abo. Die App arbeitet immer zuerst lokal und auch ohne
Internet. Wer mehrere eigene Geräte koppelt, kann einen privaten, Ende-zu-Ende-
verschlüsselten Bereich anlegen; der Sync-Dienst sieht nur Geheimtext. Dieses
Repo enthält nur die leere Hülle der App, niemals persönliche Inhalte.

## Die Räume

- **Zuhause** — Begrüßung, Weiterschreiben, Schreibfeuer, ein wieder
  aufgetauchter alter Gedanke, der Funke des Tages
- **Schnipsel** — der Chat mit mir selbst. Jeder Schnipsel kann sich verwandeln:
  in ein Blatt, eine Heftseite, eine Szene, eine Blase, ein Wort; wahlweise als
  Faden oder frei auf einer großen, durchsuchbaren Fläche
- **Blätter** — nur Texte, sortierbar, sonst nichts. Fürs Schreiben an sich
- **Hefte** — Seiten wie Papier. Zettel ankleben, Fotos einkleben, kritzeln;
  am Seitenende auf Wunsch automatisch weiterblättern
- **Projekte** — Kapitel und Szenen auf der Pinnwand (halten hebt die Karte an),
  Szenenkarten mit Rückseite für Zweifel, Wortziel, Leseansicht
- **Schreibraum** — Vollbild. Schreibmaschinen-Scrolling, Zeilen-Fokus,
  Sonderzeichenleiste (– „ " …), kluge Zeichen, Suchen & Ersetzen,
  eingefrorene Stände, Kerzen-Sprints
- **Cluster** — Bretter voller Blasen und beschrifteter Fäden
- **Wörter** — die Wortschatzkiste, schütteln inklusive, dazu Funken
- **Klang** — 22 Atmosphären, alle live errechnet (keine einzige Audiodatei),
  frei mischbar, mit fertigen Szenen und eigenen Mischungen
- **Faden** — der lange Chat, privat eingelesen, hier weitergesponnen
- **Goodnotes** — ein optionaler, stiller Archivraum für PDF, Bilder und
  `.goodnotes`-Originale; nichts wird in Schnipsel oder Blätter zerlegt
- **Suche** — ein Feld, alles; mit Filtern und Nachsicht bei Tippfehlern
- **Feinheiten** — fünf Stimmungen (auch komplett Weiß), Räume an/aus und
  sortierbar, Zahlen, Papierkorb, Sicherung

Überall: sichtbare Beziehungen plus `[[Verknüpfungen]]`, `#Schlagworte`,
Autosave bei jedem Tastendruck, Papierkorb statt endgültigem Löschen (30 Tage,
mit Sofort-Rückgängig). Blätter können an eine gewünschte Stelle in ein Heft,
Schnipsel auf Seiten oder Cluster und Hefte in Projekte gelegt werden.

## Aufs iPad

Die **eine offizielle Web-App-Adresse** ist:

    https://thekeveldikev.github.io/vani/

1. Diese Adresse einmal in Safari öffnen
2. Teilen → **„Zum Home-Bildschirm"**
3. Ab dann: eigenes Icon, Vollbild ohne Safari-Leisten, komplett offline

Die technische Sites-Adresse ist keine zweite App mehr. Sie bewahrt nur
Ende-zu-Ende-verschlüsselte Sync-Pakete auf und leitet normale Besuche zur
offiziellen Adresse weiter. Dadurch kann Claude Web-Updates weiterhin einfach über
GitHub veröffentlichen, während iPad, Handy und Desktop trotzdem synchron bleiben.

**Wichtig:** Vor einem Umzug oder Entfernen und regelmäßig über **Feinheiten →
Alles sichern** eine `.vani`-Datei erzeugen. Eine Synchronisation ist bequem,
aber keine Ausrede, auf persönliche Sicherungen zu verzichten.
Ob iPadOS Web-App-Daten beim Entfernen des Icons behält oder später bereinigt,
ist kein verlässlicher Sicherungsweg. Private Daten (`*.vani`) sind per
`.gitignore` grundsätzlich vom Repo ausgeschlossen.

Ein installiertes Icon genügt auch nach Updates, solange dieselbe Web-Adresse
weiterverwendet wird. Die stabile Manifest-ID hält die Installation zusammen;
neue Fassungen lädt der Service Worker hinter demselben Icon. Wenn „App entfernen“ fehlt, in iPadOS unter **Bildschirmzeit →
Beschränkungen → iTunes & App Store-Käufe → Apps löschen** das Löschen erlauben
und bei verwalteten Geräten **VPN & Geräteverwaltung** prüfen.

## Technik & Entwicklung

- Web-App bauen: `npm run build:web`
- Windows-Installer und portable App: `npm run desktop:win`
- verschlüsselter lokaler Sync-Dienst: `npm run start:sync`
- Lokal ansehen: `node server.js` → http://localhost:4321 (`?kein-sw` schaltet
  den Service Worker beim Entwickeln ab)
- Prüfen: `npm test`
  — notwendige adversariale Prüfungen für Kernlogik, Audio-Wiederanlauf,
  Speicherrennen, Sicherungen, Beziehungen, Import, PWA-Verträge und Server
- Offline: Service Worker (Cache-first, stille Aktualisierung im Hintergrund,
  Hinweis-Toast bei neuer Fassung)
- Klang: WebAudio-Synthese nach Rezepten aus Andy Farnells „Designing Sound"

Desktop-App, Kopplung, Verschlüsselung, Offline-Warteschlange und Sync-Dienst
sind umgesetzt. Der [Desktop-/Sync-Bauplan](DESKTOP-SYNC-BAUPLAN.md) beschreibt
den jetzigen Stand; [Installation und Umzug](INSTALLATION-UND-UPDATES.md) erklärt
den Ablauf ohne Entwicklerwissen.
