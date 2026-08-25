# VANI installieren, umziehen und aktualisieren

## Die eine feste Adresse

Für iPad, Handy und Laptop-Browser gilt nur:

    https://thekeveldikev.github.io/vani/

Die Sites-Adresse ist ausschließlich der unsichtbare verschlüsselte Sync-Tresor.
Sie ist keine zweite installierbare VANI-App mehr.

## Von einem alten VANI umziehen — auch ohne Datei

Jedes VANI-Symbol auf einem iPad hat **seinen eigenen Bestand**. Das gilt für
verschiedene Adressen, und es gilt sogar für zwei Symbole derselben Adresse:
iPadOS gibt jeder Home-Bildschirm-App ihren eigenen Speicher. Darum muss ein
alter Bestand einmal herüber — danach bleibt dasselbe Symbol für immer.

Das neue VANI hat dafür einen **Umzugshelfer**: Feinheiten → „Sicher ist
sicher" → **„Von einem alten VANI umziehen →"**. Er zeigt drei Wege und passt
sich an. Kurz:

**Weg 1 — Kopplungscode** (wenn das alte VANI schon „iPad ↔ Laptop" kennt):
1. Im neuen VANI: Feinheiten → iPad ↔ Laptop → „Weiteres Gerät koppeln" → der
   Code liegt in der Zwischenablage.
2. Im alten VANI: Feinheiten → iPad ↔ Laptop → „Mit Bereich verbinden" → Code
   einfügen → **„Beides zusammenlegen"**.
3. Warten. Alles kommt verschlüsselt herüber — Texte, Hefte, Bilder.

**Weg 2 — Zwischenablage** (ohne Datei, ohne Netz; für jede VANI-Fassung):
1. Im alten VANI: Feinheiten → **„In die Zwischenablage sichern"**. Bei einer
   ganz alten Fassung, die das noch nicht hat: **„Nur Texte kopieren"** — das
   neue VANI versteht auch das und baut Projekte, Hefte und Schnipsel daraus
   wieder auf.
2. Im neuen VANI: Feinheiten → **„Aus der Zwischenablage einlesen"** → ins Feld
   einfügen. VANI erkennt selbst, was es ist, und sagt am Ende, was ankam.
3. Bei sehr vielen Bildern lieber zweimal: erst „Nur Texte", die Bilder später
   über den Kopplungscode.

**Weg 3 — Datei** (wo das Gerät Dateien öffnen darf): Im alten VANI „Alles
sichern" → Datei aufheben → im neuen VANI „Sicherung einlesen" → „Dazulegen".
Auf verwalteten Schul-iPads ist die Dateiauswahl oft gesperrt — dann Weg 1 oder 2.

**Lief das alte VANI unter der früheren zweiten Adresse?** Beim Öffnen erscheint
„VANI ist umgezogen". Die Seite zählt, was dort noch liegt, und leitet nicht
weiter, solange etwas da ist. **„Alten Bestand retten"** öffnet das alte VANI
mit seinem ganzen Bestand; von dort gehen Weg 1 und 2. Das alte Symbol erst
löschen, wenn im neuen alles da ist.

    https://vani-schreibzuhause.craftkey.chatgpt.site/rettung.html?rettung=1&kein-sw=1

Ab dem Umzug bleibt dasselbe Symbol. Neue Fassungen kommen automatisch
dahinter an; notfalls **Feinheiten → VANI jetzt aktualisieren**.

## Der alte Faden

Die verschlüsselte Fadendatei liegt seit VANI 5.3.0 **nicht mehr öffentlich im
Netz**. Sie war zwar verschlüsselt, aber für jeden herunterladbar. Der Faden kommt
jetzt so auf ein neues Gerät:

1. **Auf einem gekoppelten Gerät:** gar nichts tun — der Faden reist über den
   privaten Bereich automatisch mit.
2. **Auf dem Windows-Rechner:** die Desktop-App bringt die Datei mit. Dort einmal
   **Feinheiten → Den Faden holen** mit dem Passwort. Von dort verteilt der private
   Bereich ihn an alle anderen Geräte.
3. **Notfalls:** die Datei `faden.enc` aus dem VANI-Ordner von Hand wählen — VANI
   bietet das an, wenn es die Datei nicht selbst findet.

## Getrennte Personen, getrennte Bereiche

- Deine Cousine wählt auf ihrem iPad: **Feinheiten → iPad ↔ Laptop → Neuen
  privaten Bereich**. Ihr jetziger Bestand wird die Grundlage ihres Bereichs.
- Du wählst auf deinem iPad oder Laptop ebenfalls **Neuen privaten Bereich**.
- Ihr gebt euch eure Kopplungscodes **nicht**, wenn ihr getrennte Notizen wollt.
- Ein zweites eigenes Gerät wählt **Mit Bereich verbinden** und bekommt den
  Kopplungscode des ersten Geräts.

Der Kopplungscode ist ein Hausschlüssel. Wer ihn hat, kann den ganzen Bereich
lesen. Darum nur direkt auf das eigene oder wirklich vertraute Gerät kopieren.

Profile und Bereich sind getrennt: Auf jedem neuen Gerät wird zunächst eine lokale
Passwort-Tür angelegt. Danach verbindet der persönliche Kopplungscode genau diesen
Bestand. Beide Personen verwenden unterschiedliche Codes und bleiben vollständig
getrennt.

### Drei Geräte für eine Person — die sichere Reihenfolge

1. Auf dem Gerät mit dem bisherigen Bestand: **Feinheiten → iPad ↔ Laptop ↔
   weitere Geräte → Neuen privaten Bereich**. Nur einen Namen eingeben; VANI kennt
   den verschlüsselten Dienst bereits.
2. Auf Handy und Laptop jeweils VANI öffnen, ein **lokales Profil** anlegen und
   **Mit Bereich verbinden** wählen.
3. Auf dem ersten Gerät **Weiteres Gerät koppeln** wählen und den Code unmittelbar
   auf dem neuen Gerät einsetzen. Ist das neue Gerät leer, darf sein leerer Bestand
   ersetzt werden.
4. Danach kurz auf jedem Gerät „Jetzt abgleichen“ wählen. Ab dann gehen lokale
   Änderungen sofort hinaus; ein geöffnetes VANI holt Änderungen im Vordergrund
   normalerweise binnen Augenblicken.

iPadOS und iOS halten geschlossene Apps im Schlaf an. Darum kann kein Webprogramm
im ausgeschalteten oder tief schlafenden Gerät weiterlaufen. Beim nächsten Öffnen,
nach einem Funkloch oder nach dem Aufwachen gleicht VANI automatisch nach. Offline
geschriebene Sätze bleiben lokal sicher und werden anschließend zusammengeführt.

### Handy und zweites iPad

- **iPhone/iPad:** die feste Adresse in Safari öffnen → Teilen → „Zum
  Home-Bildschirm“. Dasselbe Icon bleibt für spätere Fassungen bestehen.
- **Android:** die feste Adresse in Chrome öffnen → Menü → „App installieren“ oder
  „Zum Startbildschirm hinzufügen“.
- Für eine zweite Person niemals den ersten Kopplungscode verwenden: auf ihrem
  ersten Gerät einen neuen privaten Bereich anlegen und nur ihre eigenen Geräte
  damit koppeln.

## Windows

- Normal installieren: auf GitHub unter **Releases** die neueste
  `VANI-…-x64-Setup.exe` laden und einmal doppelklicken.
- Ohne Installation testen: `VANI-…-x64-Portable.exe` öffnen. Die portable Fassung
  ist zum Probieren gedacht; für automatische Updates die Setup-Fassung verwenden.
- Ab VANI 5.55 prüft die installierte Desktop-App selbst auf GitHub nach neuen
  Fassungen, lädt sie im Hintergrund und bietet **Neu starten** an. Ein neuer
  Installer ist danach nicht mehr nötig.
- Beim Deinstallieren lässt VANI die persönlichen Daten absichtlich stehen.
  Vor einem Rechnerwechsel trotzdem immer eine `.vani`-Sicherung machen.

Windows kann beim allerersten Setup einen SmartScreen-Hinweis zeigen, solange die
private Ausgabe noch kein kommerzielles Codesignatur-Zertifikat hat. Die Dateien
kommen ausschließlich aus den Releases dieses GitHub-Projekts. Automatische
Desktop-Updates erscheinen, sobald eine neue, zur Paketversion passende `v…`-Fassung
als GitHub Release veröffentlicht wurde.

## Was synchronisiert wird

Automatisch: Texte, Titel, Schnipsel, Blätter, Hefte, Projekte, Cluster,
Beziehungen, Reihenfolgen, Einstellungen, Fotos und Skizzen. Parallele und
offline entstandene Textänderungen werden zusammengeführt.

Sehr große Goodnotes-Originaldateien sind separat zuschaltbar. Titel, Notizen
und die Archivordnung reisen auch ohne diese Option mit. So wird kein iPad
ungefragt mit hunderten Megabyte gefüllt.

## Bücher auf den Schreibtisch legen

Der Schreibtisch hat einen Lesestapel: Bücher als PDF, mit Cover und einem
Lesemodus wie in einem Lesegerät. Die Dateien liegen **nur auf deinen
Geräten** und reisen verschlüsselt über den privaten Bereich — nie über das
öffentliche Netz, nie im Repo. Drei Wege, ein Buch aufzulegen:

1. **Handy oder Laptop:** Schreibtisch → Bücherstapel → „PDF auflegen" → Datei
   wählen (mehrere auf einmal geht). Der private Bereich bringt sie aufs iPad.
2. **Schul-iPad ohne Dateiauswahl:** Bücher, die schon im Goodnotes-Archiv von
   VANI liegen, mit „Aus dem Goodnotes-Archiv" aufs Lesepult. Oder am Handy
   auflegen — sie kommen über den Bereich an.
3. **Desktop-App:** Lege die PDFs in den Ordner `Dokumente\VANI-Bücher` (oder
   in einen Ordner `buecher` neben der App). Dann: Bücherstapel → „Aus dem
   Bücherordner" → alle auf einmal.

Große Bücher (über 20 MB) brauchen über den Bereich etwas; 300 MB ist die Grenze
je Datei.

### Der Bücherkoffer (für das iPad ohne Dateiauswahl)

Wenn kein Weg zu den Dateien führt: Die Bücher können **verschlüsselt neben der
App** liegen — als Bücherkoffer (`buecher/koffer.json` und `buch-NN.enc`). Ohne
Passwort ist das Rauschen. Auf dem iPad: Schreibtisch → Bücherstapel → „Aus dem
Bücherkoffer (Passwort)" → Passwort eingeben → die Bücher liegen auf dem Tisch
und reisen von dort über den privaten Bereich auf Handy und Laptop. Danach darf
der Koffer aus dem Repo verschwinden. Packen: `node werkzeug/buecherkoffer.mjs
<Ordner-mit-PDFs>` — das Werkzeug zeigt das Passwort einmal an; es steht
nirgends sonst.

## EPUB-Bücher, Spotlight, Blatt einspannen (5.18)

- **EPUB**: Lesestapel → „Bücher auflegen" nimmt `.epub` genauso wie PDF; auch über den
  Bücherkoffer und (Desktop) den Ordner „VANI-Bücher". Der EPUB-Leser setzt den Text selbst
  (Schrift, Größe, Zeilenabstand, Rand in den Leseeinstellungen), blättert seitenweise,
  kennt Inhalt, Lesezeichen, Zitat, Randnotizen und Vorlesen.
- **Spotlight**: ⌘/Strg+K öffnet eine Suchzeile mit Vorschau; ↑↓ wählen, Enter öffnet,
  „>" zeigt Befehle (Räume, neues Blatt, Sicherung …). „?" außerhalb eines Feldes zeigt
  alle Tastaturkürzel. ⌘/Strg+⇧+K öffnet die große Suche.
- **Schreibtisch**: Tintenfass → „Blatt einspannen" legt ein Blatt auf den Tisch, das
  dort getippt wird (Esc legt es weg; es bleibt bei den Blättern). Das zuletzt gelesene
  Buch liegt aufgeschlagen da. Mit Tagesziel brennen Teelichter auf der Fensterbank je
  erreichtem Tag; der Leuchter zeigt die Woche.
- **Stände**: Alle 15 Minuten friert VANI beim Speichern still einen Stand ein (höchstens
  20; „Frühere Stände" im Schreibraum zeigt sie mit „· automatisch").
