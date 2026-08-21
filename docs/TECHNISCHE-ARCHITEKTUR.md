# VANI 5.1 – technische Architektur und Datenvertrag

> Stand: 21. August 2026
> Für die Produktgeschichte zuerst C:\Users\kevin\VANI\CLAUDE-UEBERNAHME.md lesen.

## 1. Architektur in einem Satz

VANI ist eine lokal-first Einseiten-Web-App, deren modulare Quellen zu einem
selbstenthaltenen Webartefakt gebaut werden; dieselbe App läuft als PWA, in einer
gehärteten Electron-Hülle und auf Sites, während ein optionaler Ende-zu-Ende-
verschlüsselter Yjs-Sync Geräte verbindet.

## 2. Schichten

    src/*                          kanonische Oberfläche und Anwendungslogik
       |
       +-- werkzeug/build-web.mjs  deterministischer Ein-Datei-Webbuild
       |       |
       |       +-- index.html      PWA/Browser/Desktop-Artefakt
       |       +-- artifact.html   einbettbares Artefakt
       |
       +-- Electron                Desktop-Hülle, lokales Protokoll, safeStorage
       |
       +-- hosting/public          Sites-Kopie der gebauten Web-App
               |
               +-- Worker + D1/R2  statische Auslieferung und verschlüsselter Sync

Lokal speichert jede Profilinstanz in IndexedDB. Sync ist optional und sitzt über
diesem lokalen Bestand; er ersetzt IndexedDB nicht.

## 3. Kanonische Quellen und Buildreihenfolge

### 3.1 HTML und CSS

- src/00-head.html: Dokumentkopf, Metadaten und PWA-Verknüpfungen.
- src/05-shell.html: statische App-Shell.
- src/10-style.css: gesamtes Styling.

### 3.2 JavaScript-Reihenfolge

werkzeug/build-web.mjs lädt zuerst vendor/vani-sync.js und danach genau:

1. src/30-core.js
2. src/29-profile.js
3. src/31-sync.js
4. src/35-richtext.js
5. src/34-inhalt.js
6. src/38-media.js
7. src/39-beziehungen.js
8. src/40-router.js
9. src/41-zuhause.js
10. src/42-schnipsel.js
11. src/42b-blaetter.js
12. src/42c-faden.js
13. src/42d-goodnotes.js
14. src/43-hefte.js
15. src/44-projekte.js
16. src/45-schreibraum.js
17. src/46-cluster.js
18. src/47-woerter.js
19. src/48-suche.js
20. src/49-feinheiten.js
21. src/50-audio.js
22. src/51-klangraum.js
23. src/60-boot.js

Diese Reihenfolge ist Teil des Laufzeitvertrags. Der Code benutzt absichtlich ein
gemeinsames globales Skript-Lexikalumfeld, keine ES-Module. Funktionsreferenzen auf
später deklarierte Bestandteile funktionieren, solange sie erst nach vollständigem
Laden aufgerufen werden.

### 3.3 Buildprodukte

- index.html
- artifact.html
- hosting/public/index.html
- hosting/public/manifest.json
- hosting/public/sw.js
- hosting/public/faden.enc
- hosting/public/icons/*

Diese Dateien dürfen geprüft und ausgeliefert werden, sind aber nicht die primäre
Bearbeitungsstelle. Nach einer src-Änderung immer neu bauen.

## 4. Laufzeit und Zustand

### 4.1 Globaler In-Memory-Zustand

Der zentrale Zustand D enthält:

- docs: Map aller geladenen Dokumente;
- einst: normalisierte Einstellungen;
- stats: Tages-, Letztstand- und Sicherungszähler.

AKTIVES_PROFIL und GERAET_ID ergänzen den laufenden Kontext.

### 4.2 IndexedDB

Der Datenbankname ist:

- vani für den historischen Bestand beziehungsweise das erste übernehmende Profil;
- vani-profil-{profilId} für weitere Profile.

Schema-Version: **4**

| Store | Schlüssel | Zweck |
|---|---|---|
| docs | keyPath id | aktuelle Dokumente |
| media | expliziter Key | Bilder, Skizzen, Goodnotes-Originale |
| kv | expliziter Key | Einstellungen, Stats, Syncconfig, Sequenzen |
| papierkorb | keyPath id | wiederherstellbare Löschbündel |
| sync | expliziter Dokumentkey | jüngster lokaler Änderungsmarker |
| sync-pending | expliziter Key | verschlüsselte noch unbestätigte Netzpakete |

Die IndexedDB-Transaktionshelfer heißen dbPut, dbGet, dbDel und dbAlle.

### 4.3 Standard-Einstellungen

Wichtige Defaults:

| Feld | Standard | Bedeutung |
|---|---:|---|
| thema | papier | visuelles Thema |
| schrift | serife | Grundschrift |
| groesse | 19 | Schreibgröße |
| breite | mittel | Textbreite |
| typewriter | true | Schreibmaschinen-Scrollen |
| fokus | false | Fokusmodus |
| lautstaerke | 0.5 | Gesamtklang |
| autoSeitenwechsel | true | Heft automatisch fortsetzen |
| schnipselAnsicht | lauf | lauf oder frei |
| blattSortierung | zuletzt | Blattsortierung |
| goodnotesSync | false | große Archivdateien übertragen |
| stiftFarbe | #2c251c | Zeichenfarbe |
| stiftDicke | 3.5 | Zeichendicke |
| sperreNachMinuten | 10 | lokale Profilsperre; 0 deaktiviert |

uebernehmeEinstellungen übernimmt nur bekannte Schlüssel und begrenzt alle Werte.

## 5. Dokumentmodell

### 5.1 Gemeinsame Felder

Jedes reguläre Dokument besitzt mindestens:

- id: eindeutige String-ID;
- typ: Dokumentart;
- angelegt: Zeitstempel;
- geaendert: Zeitstempel.

Je nach Typ kommen hinzu:

- titel, text, rich, format und notiz;
- parent für Hierarchie oder Wortkistenzuordnung;
- projekt oder projektRef;
- von und zu für Kanten/Bezüge;
- quelle für Spiegel/Kopien;
- ord für Reihenfolge;
- pos, freiPos oder sicht für visuelle Lage;
- _rev, _geraet und _syncZeit für Synchronisation.

neuDoc erzeugt und speichert ein Dokument. speichere aktualisiert Zeit und
Syncmarker. speichereStill aktualisiert ebenfalls den Syncmarker, ohne das normale
UI-Verhalten zu erzwingen.

### 5.2 Aktuelle Dokumenttypen

| Typ | Zweck | Wichtige Beziehungen |
|---|---|---|
| schnipsel | kurzer Fund/Gedanke | kann eingeklebt oder gespiegelt werden |
| blatt | freier längerer Text | kann Seite eines Hefts werden |
| heft | Notiz-/Schreibheft | Seiten über parent, Projekt über projektRef |
| seite | einzelne Heftseite | parent = Heft |
| zettel | angehefteter Textzettel | parent = Seite |
| foto | angeheftetes Bild | parent = Seite, Medium über bild/datei |
| projekt | Schreibprojekt | Kapitel über parent |
| kapitel | Projektabschnitt | parent = Projekt |
| szene | Projekttext | projekt und/oder parent |
| board | Clusterbrett | Blasen über parent |
| blase | Clusterobjekt | parent = Board, quelle optional |
| kante | Clusterverbindung | von und zu |
| bezug | sichtbare semantische Beziehung | von und zu, art |
| wort | persönliches Wort | parent optional = Wortkiste |
| wortkiste | frei benannte Wortsammlung | Wörter zeigen per parent darauf |
| faden | importierte historische Nachricht | Fadenlogik/ID |
| funkeln | eigener Funke | Text, Art, Vibe |
| goodnote | Archivmetadaten | Medium über datei |
| mischung | gespeicherte Klangmischung | pegel |

Der Code akzeptiert bei Sicherungsimporten nicht nur eine starre Typenumliste, aber
Länge und Form werden validiert. UI und Sync sollten neue Typen explizit einordnen.

### 5.3 Rich Text

format ist plain oder rich. Bei Rich Text:

- rich enthält das sanitizte HTML;
- text enthält den Klartextspiegel;
- der Editor aktualisiert beide;
- globale Suche, Statistik und viele Vorschauen lesen text;
- der Sync behandelt textuelle Felder über Y.Text.

Erlaubte HTML-Struktur und Inline-Stile werden in src/35-richtext.js zentral
begrenzt. Keine neuen Tags oder Styles an dieser Stelle erlauben, ohne Sanitizer- und
Regressionstest zu erweitern.

### 5.4 Medien

Binärdaten liegen nicht im Dokument selbst, sondern im Store media. Dokumentfelder
wie bild, skizze oder datei referenzieren den Schlüssel. Objekt-URLs müssen nach
Gebrauch freigegeben werden. Im Sync werden Medien blockweise verschlüsselt.

### 5.5 Löschen und Undo

Löschen ist zunächst wiederherstellbar:

1. _nachfahren sammelt Wurzel, parent-/projekt-Kinder sowie Kanten und Bezüge.
2. Lose Referenzen anderer Dokumente werden entfernt und im Bündel protokolliert.
3. Dokumente wandern als Bündel in papierkorb.
4. markiereAenderung erzeugt Löschmarker für Sync.
5. holeZurueck stellt Dokumente und protokollierte Referenzen wieder her.

Sonderfall Wortkiste:

- „nur Kiste löschen“ verwendet kinderDerWurzelBehalten;
- Wörter bleiben bestehen und verlieren parent;
- die alten parent-Werte stehen im Papierkorbbündel;
- Undo sortiert sie wieder ein.

Diese Semantik darf nicht durch einfaches dbDel ersetzt werden.

## 6. Profile und Sicherheitsmodell

### 6.1 Registry

Die Profilregistry lebt gerätebezogen außerhalb der eigentlichen Inhaltsdatenbanken.
Ein Profil enthält Metadaten wie ID, Anzeigename, Datenbank und Passwortprüfdaten.
Maximal zwölf Profile werden angenommen.

### 6.2 Passwortableitung

- Verfahren: PBKDF2
- Hash: SHA-256
- Iterationen: 350.000
- zufälliges Salz pro Profil
- Passwort selbst wird nicht gespeichert
- Prüfbits werden verglichen
- aus der Ableitung kann ein AES-GCM-Schlüssel für lokale Geheimnisse entstehen

Der Schlüssel lebt nur in der geöffneten Sitzung. Bei automatischer Sperre muss neu
entsperrt werden.

### 6.3 Erstprofil und Altbestand

Der erste angelegte lokale Nutzer übernimmt bewusst die historische Datenbank vani.
Das verhindert, dass ein Upgrade scheinbar alle alten Notizen verliert. Zusätzliche
Profile werden isoliert angelegt.

### 6.4 Was Profile nicht sind

- keine E-Mail-Konten;
- keine serverseitige Nutzerverwaltung;
- keine geräteübergreifende Identität ohne Sync-Kopplung;
- keine Passwortwiederherstellung durch einen Betreiber.

## 7. Syncarchitektur

### 7.1 Konfiguration

Eine bereinigte v1-Konfiguration enthält:

- name;
- server;
- vault;
- token;
- key.

Der sichtbare Kopplungscode beginnt mit VANI1- und enthält die Konfiguration
base64url-kodiert. Kodierung ist keine Verschlüsselung: Der Code selbst ist geheim.

Validierung begrenzt Länge und Alphabet. Externe Server müssen HTTPS nutzen; HTTP ist
nur für localhost/127.0.0.1 erlaubt.

### 7.2 Lokale Geheimnisablage

Im Web wird die Synckonfiguration mit dem Profilschlüssel AES-GCM-geschützt in kv
gespeichert. In Electron wird bevorzugt das eng begrenzte Preload-API verwendet; der
Main-Prozess schützt die Daten mit Electron safeStorage und atomarem Dateitausch.

### 7.3 CRDT-Modell

- Ein Y.Doc hält Dokument- und Statusstrukturen.
- Textfelder text, titel, notiz, schlagworte und label verwenden Y.Text.
- lokale Änderungen erzeugen Yjs-Updates.
- Y-IndexedDB persistiert den CRDT-Zustand.
- interne Revisionsfelder werden nicht als normale Nutzdaten übertragen.
- eingehende Änderungen werden in den lokalen D.docs-Bestand angewandt.

Yjs vermindert Konflikte beim parallelen Schreiben. Es ersetzt keine fachlichen
Validierungen: Eingehende Dokumente werden weiterhin bereinigt.

### 7.4 Ende-zu-Ende-Verschlüsselung

- Verfahren: AES-256-GCM.
- zufällige 12-Byte-IV pro Update/Block.
- Additional Authenticated Data bindet Vault, ID, Protokollversion und Block.
- der Inhaltskey verlässt den Client nicht als Serverfeld;
- der Server speichert nur Geheimtext und Metadaten.

### 7.5 Push/Pull

- lokale Änderungen werden gebündelt, verschlüsselt und in sync-pending gelegt;
- POST bestätigt eine idempotente Update-ID;
- bestätigte Pakete können aus der Warteschlange verschwinden;
- GET fragt Updates nach letzter Sequenz ab;
- more zeigt weitere Seiten an;
- der Client speichert sync-seq:{vault};
- Polling und Onlineevents stoßen weitere Läufe an;
- Timeouts verhindern dauerhaft hängende Requests.

### 7.6 Medien

Medien werden blockweise hochgeladen. Jeder Block besitzt eigene IV und AAD.
Goodnotes-Originale werden nur einbezogen, wenn goodnotesSync wahr ist. Metadaten
bleiben unabhängig davon synchronisierbar.

## 8. Sync-API v1

Basis: konfigurierte Serveradresse.

| Methode und Pfad | Zweck |
|---|---|
| GET /v1/health | Dienstzustand |
| POST /v1/vaults | neuen Bereich anlegen |
| GET /v1/vaults/{vault}/updates?after=&limit= | Updates ab Sequenz |
| POST /v1/vaults/{vault}/updates | verschlüsseltes Update ablegen |
| POST /v1/vaults/{vault}/blobs | verschlüsselten Medienblock ablegen |
| GET /v1/vaults/{vault}/blobs/{blobId}/{chunk} | Medienblock lesen |

Autorisierung abgesehen von Health/Vaultanlage:

    Authorization: Bearer {token}

Servergrenzen der Sites-Variante:

- Rate-Limit im Worker: 360 Requests pro Minute und IP;
- Vault-/Update-IDs und Token folgen strengem Alphabet/Längenvertrag;
- Vaultanlage maximal 16 KiB Body;
- Updatebody maximal 24 MiB, Geheimtext maximal 22 MiB;
- einzelne Blöcke maximal ungefähr 1,5 Millionen base64url-Zeichen;
- Blockbody maximal 2 MiB;
- Updateabruf maximal 500 Einträge und ungefähr 10 MiB Antwortnutzlast;
- ungültiges JSON, Marker und Authentifizierung liefern definierte Fehler.

### 8.1 Cloudflare/Sites-Speicherung

D1-Tabellen:

- vaults: ID, Tokenhash, Erstellzeit;
- updates: Sequenz, Vault, Update-ID, IV, R2-Objekt, Länge, Zeit;
- blob_chunks: Vault, Blob-ID, Blocknummer, IV, R2-Objekt, Zeit.

R2 enthält den eigentlichen Geheimtext. Das Token wird nur als SHA-256-Hash
verglichen. D1/R2 sehen keinen Inhaltskey und keinen Klartext.

### 8.2 Eigenständiger Server

sync-server/server.mjs implementiert dasselbe Protokoll mit Node und SQLite. Der
Datenpfad kann über VANI_DATA_DIR gesetzt werden. Details stehen in
sync-server/README.md.

## 9. PWA-Architektur

### 9.1 Manifest

Die folgenden Werte definieren eine stabile Installation:

    id: "./"
    start_url: "./"
    scope: "./"

display ist standalone; display_override erlaubt window-controls-overlay.
Orientierung ist nicht fixiert, damit iPad, Handy und Desktop funktionieren.

### 9.2 Service Worker

sw.js trägt eine Versionskonstante. Strategie:

- Navigation: network-first, bei Ausfall Offlinecache.
- statische Assets: Cache-first, Netzaktualisierung im Hintergrund.
- Installation: App-Shell vorladen.
- Aktivierung: alte VANI-Caches entfernen, Clients übernehmen.
- Nachricht SKIP_WAITING: wartenden Worker sofort aktivieren.

index.html, manifest.json und sw.js werden im Hosting mit no-cache ausgeliefert.

### 9.3 Updatefluss

src/60-boot.js registriert und beobachtet den Worker. Feinheiten bietet einen
expliziten Updateknopf. Eine vorhandene Installation behält ihr Icon; nur Cache und
Appcode wechseln.

## 10. Desktop-Architektur

### 10.1 Electron-Hülle

package.json:

- main: desktop/main.cjs;
- appId: de.vani.schreibzuhause;
- productName: VANI;
- Electron 43.4.1;
- electron-builder 26.15.3.

Die App lädt die gebaute Web-App über vani://app statt über file://. Das erhält eine
stabile, sichere Origin für IndexedDB und Service-Worker-nahe Browserannahmen.

### 10.2 Sicherheitsgrenzen

- nodeIntegration: false;
- contextIsolation: true;
- sandbox: true;
- kein allgemeiner Nodezugriff aus der Webseite;
- Preload exportiert nur eng benannte Funktionen;
- fremde Navigation wird blockiert oder im Systembrowser geöffnet;
- Berechtigungsanfragen sind restriktiv;
- Content-/Pfadauflösung bleibt innerhalb der gepackten App.

### 10.3 Desktopkonfiguration

desktop/config.json:

- syncServerUrl zeigt auf die öffentliche VANI-Site;
- updateUrl ist leer.

electron-updater ist eingebaut, aber ohne Update-Feed noch kein fertiger öffentlicher
Autoupdater. Nicht so dokumentieren, als wäre dieser Kanal schon verfügbar.

### 10.4 Paketierung

Windows:

- NSIS-x64-Setup;
- x64-Portable;
- Desktop- und Startmenüshortcut;
- frei wählbarer Installationsordner;
- Appdaten bei Deinstallation nicht automatisch löschen.

macOS- und Linux-Targets sind in package.json vorbereitet, aber nicht als fertige
Releaseartefakte verifiziert.

## 11. Sites-/Hosting-Architektur

hosting ist ein eigenständiges Node-Projekt. Seine
hosting/.openai/hosting.json bindet:

- project_id appgprj_6a8786eb79448191acff5186595d06ec;
- D1-Binding DB;
- R2-Binding FILES.

hosting/scripts/copy-vani.mjs kopiert das gebaute Root-Artefakt. Der Vinext/Next-Teil
stellt eine Hülle/Fallbackroute bereit; hosting/worker/index.ts fängt Sync-API und
statische VANI-Dateien direkt ab.

Die bestehende Projekt-ID muss bei Updates erhalten bleiben. Ein neues Sites-Projekt
würde eine zweite URL und gegebenenfalls ein zweites Home-Bildschirm-Produkt erzeugen.

## 12. Router und Räume

src/40-router.js definiert konfigurierbare Räume:

- Zuhause;
- Schnipsel;
- Blätter;
- Hefte;
- Projekte;
- Cluster;
- Wörter;
- Klang;
- Goodnotes, standardmäßig aus;
- Faden, standardmäßig aus.

Goodnotes und Faden können beim Boot sichtbar werden, wenn passende Daten existieren.
Suche und Feinheiten sind feste zusätzliche Ziele.

Bei einem neuen Dokumenttyp müssen mindestens geprüft werden:

1. globale Suche;
2. oeffneDoc-/Treffernavigation;
3. Beziehungsauswahl;
4. Löschnachfahren und Referenzen;
5. Sync;
6. Sicherung/Import;
7. Start-/Raumsichtbarkeit;
8. Testsandbox-Exporte.

## 13. Audioarchitektur

src/50-audio.js erzeugt Atmosphären vollständig prozedural über WebAudio. Es gibt
keine externen Ambience-Dateien. Mischungen bestehen aus normalisierten Pegeln.

Lebenszyklus:

- Audio erst nach Nutzergeste freigeben;
- Context und Mastergain anlegen;
- Atmosphärennodes registrieren;
- Pegel über wahrnehmungsnähere Kurve setzen;
- auf Sichtbarkeit, pageshow und Contextzustand reagieren;
- bei verdächtigem Zustand Context vollständig neu aufbauen;
- beim Stop alle Timer, Quellen und Nodes lösen.

Die iOS-Medienbrücke verwendet ein kleines erzeugtes WAV in einem HTML-Audioelement,
um WebKit-Ausgabe zu aktivieren. Sie ist eine Mitigierung, kein DRM-/Medienasset.

## 14. Sicherungen

Feinheiten bietet Export/Import und einen verschlüsselten Sicherungsweg. Beim Import:

- Struktur prüfen;
- Dokumente bereinigen;
- Einstellungen nur über Whitelist übernehmen;
- Medien getrennt behandeln;
- Prototyp-Schlüssel verwerfen;
- Mengen und Textlängen begrenzen.

Verschlüsselte Sicherungen verwenden einen eigenen stärkeren PBKDF2-Kontext
(derzeit 600.000 Iterationen in src/49-feinheiten.js). Das ist nicht mit den
350.000 Iterationen des Profil-Logins zu verwechseln.

## 15. Vertrauensgrenzen

| Grenze | Vertrauen |
|---|---|
| Nutzereingabe | untrusted; normalisieren und begrenzen |
| importierte Sicherung | untrusted; Struktur und HTML sanitizen |
| IndexedDB-Altbestand | kann beschädigt/alt sein; beim Laden bereinigen |
| Syncserverantwort | authentifiziert, aber weiterhin validieren |
| Kopplungscode | geheim; nur lokal einlesen |
| Rich HTML | nur sanitizte Teilmenge |
| Electron-Renderer | kein Node-/Dateisystemzugriff |
| externe URL | nicht in App navigieren |
| generierte Builddatei | reproduzierbar, nicht primäre Quelle |

## 16. Abwärtskompatibilität

- Die Datenbank vani bleibt erhalten.
- Neue Stores werden per onupgradeneeded ergänzt.
- Alte Wörter ohne parent erscheinen als lose Wörter.
- Alte Klang-Einstellung kann einmalig in Mischung überführt werden.
- Alte Plain-Text-Dokumente bleiben plain.
- Räume mit vorhandenen Daten können automatisch sichtbar werden.
- Manifestidentität bleibt versionsunabhängig.

Neue Migrationen müssen idempotent sein und reale Altbestände ohne stille Löschung
öffnen können.

## 17. Bekannte technische Schulden und Ausbaupunkte

- globales Skript-Lexikalumfeld statt echter Module;
- sehr große generierte index.html im Git;
- keine automatische Quellmap;
- kein öffentlich konfigurierter Desktop-Updatefeed;
- kein Signieren/Notarisieren der nativen Pakete;
- Syncserver besitzt noch keine Verwaltungsoberfläche, Quotenanzeige oder
  nutzerfreundlichen Schlüssel-Wiederherstellungsprozess;
- keine echte Browser-End-to-End-Testfarm für Safari/iPadOS;
- Goodnotes nur als Archiv;
- Audio bleibt von WebKit und Geräteausgabe abhängig;
- Sites- und Git-Historie sind getrennt und müssen bewusst koordiniert werden.

Diese Punkte sind keine Einladung zu einem spontanen Komplettumbau. Änderungen
sollten schrittweise, migrationssicher und durch Regressionstests erfolgen.
