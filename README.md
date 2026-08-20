# VANI

Ein Zuhause zum Schreiben. Von mir, für mich.

Kein Konto, keine Cloud, kein Abo, kein Internet nötig. Alles, was ich schreibe,
bleibt auf dem Gerät — dieses Repo enthält nur die leere Hülle der App, niemals
Inhalte. Eine einzige HTML-Datei, von Hand, null Abhängigkeiten.

## Die Räume

- **Zuhause** — Begrüßung, Weiterschreiben, Schreibfeuer, ein wieder
  aufgetauchter alter Gedanke, der Funke des Tages
- **Schnipsel** — der Chat mit mir selbst. Jeder Schnipsel kann sich verwandeln:
  in ein Blatt, eine Heftseite, eine Szene, eine Blase, ein Wort
- **Blätter** — nur Texte, sortierbar, sonst nichts. Fürs Schreiben an sich
- **Hefte** — Seiten wie Papier. Zettel ankleben, Fotos einkleben, kritzeln
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
- **Suche** — ein Feld, alles; mit Filtern und Nachsicht bei Tippfehlern
- **Feinheiten** — fünf Stimmungen (auch komplett Weiß), Räume an/aus und
  sortierbar, Zahlen, Papierkorb, Sicherung

Überall: `[[Verknüpfungen]]`, `#Schlagworte`, Autosave bei jedem Tastendruck,
Papierkorb statt endgültigem Löschen (30 Tage, mit Sofort-Rückgängig).

## Aufs iPad

1. Die gehostete Adresse einmal in Safari öffnen
2. Teilen → **„Zum Home-Bildschirm"**
3. Ab dann: eigenes Icon, Vollbild ohne Safari-Leisten, komplett offline

**Wichtig:** Alles lebt nur auf dem Gerät. Icon löschen heißt: alles weg.
Darum regelmäßig **Feinheiten → Alles sichern** — eine `.vani`-Datei mit allem
drin. Private Daten (`*.vani`) sind per `.gitignore` grundsätzlich vom Repo
ausgeschlossen.

## Technik & Entwicklung

- Bauen: `sh build.sh` (setzt `src/` zu `index.html` und `artifact.html` zusammen)
- Lokal ansehen: `node server.js` → http://localhost:4321 (`?kein-sw` schaltet
  den Service Worker beim Entwickeln ab)
- Prüfen: `node --test test/` — adversariale Tests der Kernlogik
  (Papierkorb, Zählwerk, Escaping, Parser, Sicherungen)
- Offline: Service Worker (Cache-first, stille Aktualisierung im Hintergrund,
  Hinweis-Toast bei neuer Fassung)
- Klang: WebAudio-Synthese nach Rezepten aus Andy Farnells „Designing Sound"
