# VANI

Ein Zuhause zum Schreiben. Von mir, für mich.

Kein Konto, keine Cloud, kein Abo, kein Internet nötig. Alles, was ich schreibe,
bleibt auf dem Gerät — in einer einzigen App, die aus einer einzigen HTML-Datei
besteht und die ich überall dabeihaben kann.

## Die Räume

- **Zuhause** — Begrüßung, Weiterschreiben, Schreibfeuer, ein wieder aufgetauchter
  alter Gedanke, der Funke des Tages
- **Schnipsel** — der Chat mit mir selbst. Jeder Schnipsel kann sich später
  verwandeln: in eine Heftseite, eine Szene, eine Blase, ein Wort
- **Hefte** — Seiten wie Papier. Zettel ankleben, Fotos einkleben, kritzeln
  (mit Stift und Druckstärke)
- **Projekte** — Kapitel und Szenen auf der Pinnwand. Szenenkarten haben eine
  Rückseite für Zweifel. Wortziel, Leseansicht, alles am Stück
- **Schreibraum** — Vollbild, Schreibmaschinen-Scrolling, Zeilen-Fokus,
  Klangwelten (Regen, Kamin, Wind, Grillen — komplett errechnet, keine Dateien),
  und statt eines Timers: eine Kerze, die herunterbrennt
- **Cluster** — Bretter voller Blasen und Fäden. Denken auf einer Fläche
- **Wörter** — die Wortschatzkiste. Schütteln, drei Wörter fallen raus, losschreiben
- **Suche** — ein Feld, alles
- **Feinheiten** — vier Stimmungen (Papier, Tinte, Kerze, Nebel), Statistik,
  Sicherung

Überall: `[[doppelte Klammern]]` verbinden Texte miteinander, `#Schlagworte`
markieren, alles speichert sich selbst bei jedem Tastendruck.

## Aufs iPad (auch aufs gesperrte)

1. In Safari öffnen: **https://thekeveldikev.github.io/vani/**
2. Teilen-Knopf → **„Zum Home-Bildschirm"**
3. Fertig. Ab jetzt startet VANI wie eine echte App — eigenes Icon, Vollbild,
   und **komplett offline**, egal wo auf der Welt.

Falls das Icon nach dem Hinzufügen nicht auftaucht (manche Schul-Verwaltungen
sperren den Home-Bildschirm): VANI einfach als Safari-Tab benutzen — offline
geht auch dort, nur sollte man den Tab mindestens einmal die Woche öffnen und
regelmäßig sichern (Feinheiten → „Sicher ist sicher").

**Wichtig:** Alles lebt nur auf dem Gerät. Icon löschen heißt: alles weg.
Deshalb ab und zu **Feinheiten → Alles sichern** — eine `.vani`-Datei mit allem
drin, die sich jederzeit wieder einlesen lässt.

## Technik

Eine HTML-Datei, von Hand geschrieben, null Abhängigkeiten. IndexedDB als
Speicher, Service Worker für echtes Offline, WebAudio für die Klangwelten,
Pointer Events für Stift und Fäden. Gebaut wird mit `sh build.sh` aus den
Teilen in `src/`, lokal getestet mit `node server.js`.
