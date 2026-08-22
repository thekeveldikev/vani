/* ================================================================
   VANI — Die Anleitung: alles, was VANI kann, von mir selbst
   aufgeschrieben. Durchsuchbar, in Kapiteln, mit Beispielen.
   Aus den Feinheiten aufschlagbar, mit einem Tipp wieder zu.
   ================================================================ */

/* Aufbau: Kapitel → Abschnitte. Jeder Abschnitt hat einen Titel (t),
   Absätze (p), optional Schritte (s), ein Beispiel (b) und einen Tipp (tipp).
   raum = wohin der Knopf „Aufschlagen" führt. */
const ANLEITUNG = [
  {
    id: 'anfang', titel: 'Auf einen Blick', icon: 'zuhause', raum: '',
    kurz: 'Was VANI ist und wie ich mich darin bewege.',
    abschnitte: [
      { t: 'Was VANI ist', p: [
        'VANI ist mein Schreibzuhause. Alles, was ich schreibe, sammle, klebe, verbinde oder ausprobiere, liegt hier — auf meinem Gerät, ohne Konto, ohne Cloud, auch ohne Internet.',
        'Es gibt Räume für verschiedene Arten von Schreiben: schnelle Gedanken (Schnipsel), lose Texte (Blätter), Hefte mit Seiten, größere Projekte mit Kapiteln und Szenen, Bretter zum Denken (Cluster), Wortkisten, Klang zum Dabeihaben und den alten Faden.'
      ] },
      { t: 'Die Leiste', p: [
        'Links (am Handy unten) ist die Leiste mit den Räumen. Ein Tipp wechselt den Raum. Welche Räume dort stehen und in welcher Reihenfolge, stelle ich in den Feinheiten ein — nichts geht verloren, wenn ein Raum aus der Leiste verschwindet.'
      ] },
      { t: 'Tippen, halten, ziehen', p: [
        'Fast überall gilt dasselbe: Kurz tippen öffnet. Lange halten (oder am Laptop Rechtsklick) öffnet ein Menü mit allem, was man mit dem Ding machen kann — umbenennen, teilen, verbinden, löschen. Ziehen verschiebt, wo sich etwas verschieben lässt (Zettel, Blasen, Szenen, freie Schnipsel).'
      ], b: 'Ich halte ein Blatt im Stapel einen Moment gedrückt → Menü: Umbenennen, Teilen, Duplizieren, In ein Heft legen, Hinzufügen & verbinden, Löschen.' },
      { t: 'Die Suche', p: [
        'Das Suchfeld unten in der Leiste (oder Strg/⌘ + K) findet alles, was ich je geschrieben habe — über alle Räume hinweg, auch mit kleinen Tippfehlern.'
      ] },
      { t: 'Nichts verschwindet einfach', p: [
        'Gelöschtes landet im Papierkorb und bleibt dort mindestens 30 Tage. Direkt nach dem Löschen erscheint unten „Rückgängig". Eingefrorene Stände im Schreibraum bewahren frühere Fassungen eines Textes.'
      ] },
      { t: 'Wo diese Anleitung wohnt', p: [
        'In den Feinheiten, ganz oben: „Die Anleitung aufschlagen". Oben im Kopf ist ein Suchfeld — ich tippe ein Wort, und nur die passenden Stellen bleiben stehen. Der Knopf „Aufschlagen" bei jedem Kapitel springt direkt in den Raum.'
      ] }
    ]
  },
  {
    id: 'zuhause', titel: 'Zuhause', icon: 'zuhause', raum: '',
    kurz: 'Der Startraum: einfangen, weiterschreiben, wiederfinden.',
    abschnitte: [
      { t: 'Der Gruß', p: ['Oben steht ein Gruß zur Tageszeit. War ich länger als eine Woche weg, heißt es „Schön, dass du wieder da bist." Eigene Grußzeilen sind möglich, wenn im Bestand Dokumente vom Typ „gruss" liegen — die kommen aus dem Faden mit.'] },
      { t: 'In die Schnipsel', p: ['Das Feld „Kurz festhalten, bevor es weg ist …" schickt einen Gedanken direkt in die Schnipsel, ohne den Raum zu wechseln. Pfeil tippen oder Enter — weg ist er, sicher.'], b: 'Mitten im Lesen fällt mir ein Satz ein → Zuhause → eintippen → Pfeil. Später liegt er in den Schnipseln mit Uhrzeit.' },
      { t: 'Das Schreibfeuer', p: [
        'Die Karte zählt meine Wörter heute, die Tage in Folge („Strähne") und zeigt die letzten sieben Tage als kleine Balken. Gezählt wird nur, was ich selbst tippe — Importe und eingelesene Sicherungen machen kein Feuer.',
        'Ist kein Wort geschrieben, glimmt noch Glut von neulich oder es ist kalt. Ein Satz genügt.'
      ], tipp: 'Ein Tagesziel in Wörtern stelle ich in den Feinheiten ein. Dann zeigt die Karte einen Balken, und im Schreibraum klingt eine Glocke, wenn es erreicht ist.' },
      { t: 'Der Funke', p: [
        'Ein Schreibanstoß. Die Knöpfe wechseln die Art: Szene (ein Bild), Wer · Wo · Aber (eine zusammengewürfelte Ausgangslage aus über sechzigtausend Möglichkeiten), Figur (jemand, der auftreten könnte), Wendung (was jetzt passiert), Frage, Form (eine Schreibübung), Satz (ein erster Satz) und Meine (meine eigene Funkenkiste). Über vierhundert Funken liegen bereit.',
        '„Anderer" würfelt neu. „Merken" legt den Funken in die Funkeln, damit er irgendwann unter „Wieder aufgetaucht" zurückkommt. „Dem nachgehen" legt sofort ein Blatt mit dem Funken an und öffnet den Schreibraum.'
      ], b: 'Wer · Wo · Aber: „Die letzte Leuchtturmwärterin, in einem Hotel, dessen Zimmernummern sich jede Nacht ändern, aber heute klopft es zweimal."' },
      { t: 'Eigene Funken', p: ['„+ Eigener" fängt einen gehörten Satz, ein Bild, eine Frage oder nur einen Vibe ein — mit kurzer Stimmungsnotiz. Die Funkenkiste sammelt sie, ist durchsuchbar, jeder Funke lässt sich ändern, verbinden oder vergessen und direkt zu einem Blatt machen.'] },
      { t: 'Weiterschreiben', p: ['Die drei zuletzt angefassten Texte (Szenen, Heftseiten, Blätter) mit ihrem letzten Satz. Ein Tipp, und ich bin wieder drin.'] },
      { t: 'Wieder aufgetaucht', p: [
        'Jeden Tag holt VANI ein paar ältere Dinge nach vorn — nie bloß zufällig, sondern mit einem Grund: Liegen geblieben, Eine offene Frage, Noch nicht fertig, Ein Anfang, Ein Ende, Eine Verbindung, Aus einem Traum, Ein Zeitfaden, Ein Satz wie eine Tür, Eine alte Liste, Erster & letzter Satz, Heute vor X Jahren, Funkeln, Aus dem Faden.',
        'Ein Echo legt zwei Texte nebeneinander, die Wochen auseinander liegen und doch ein seltenes Wort teilen. „Andere Funde" blättert weiter.'
      ] },
      { t: 'Die leise Mahnung', p: ['Liegen mehr als zwölf Dinge hier und ist die letzte Sicherung älter als zwei Wochen (oder es gab nie eine), erscheint unten eine Zeile „Sicher ist sicher →". Sie führt in die Feinheiten.'] }
    ]
  },
  {
    id: 'schnipsel', titel: 'Schnipsel', icon: 'schnipsel', raum: 'schnipsel',
    kurz: 'Der Chat mit mir selbst.',
    abschnitte: [
      { t: 'Was ein Schnipsel ist', p: ['Ein Schnipsel ist ein Gedanke, den ich mir selbst schicke. Unten tippen, Pfeil — oben sammelt es sich mit Uhrzeit, nach Tagen getrennt (Heute, Gestern, Datum).'] },
      { t: 'Bilder', p: ['Der Kamera-Knopf hängt ein Foto an — aus der Mediathek oder direkt aufgenommen. Das Bild wird verkleinert gespeichert, bleibt aber nur auf meinem Gerät (und in Sicherungen).'] },
      { t: 'Zwei Ansichten', p: [
        '„Faden" ist der Lauf von oben nach unten wie ein Chat. „Ungeordnet" legt alle Schnipsel lose auf eine große Fläche: jeden kann ich verschieben, die Fläche wächst mit. Oben gibt es dort eine eigene Suche („Auf der Fläche suchen …") und den Knopf „Fundstück", der mich zu einem zufälligen sichtbaren Schnipsel trägt.'
      ] },
      { t: 'Anpinnen', p: ['Im Menü eines Schnipsels: Anpinnen. Gepinnte Schnipsel bekommen eine goldene Nadel und stehen oben in der Pinnzeile — ein Tipp dort scrollt hin. Losmachen hebt es wieder auf.'] },
      { t: 'Das Menü', p: ['Tipp auf einen Schnipsel: Anpinnen/Losmachen, Bearbeiten, Hinzufügen & verbinden, Verwandeln …, Löschen.'] },
      { t: 'Verwandeln', p: ['Aus einem Schnipsel kann werden: ein Blatt im Stapel, eine Heftseite (das Bild klebt als Foto mit drauf), eine Szene in einem Projekt, eine Blase auf einem Brett oder ein Wort in der Kiste. Der Schnipsel selbst wandert dabei in den Papierkorb.'], b: 'Drei Schnipsel über dieselbe Figur → je „Verwandeln … → Als Szene in ein Projekt" → sie liegen als drei Karten nebeneinander im Kapitel.' },
      { t: 'Verweise und Schlagworte im Text', p: ['[[Titel eines anderen Textes]] in doppelten Klammern wird anklickbar und springt dorthin. #wort wird als Schlagwort hervorgehoben. Beides funktioniert in Schnipseln, im Faden und überall, wo Text gezeigt wird.'] }
    ]
  },
  {
    id: 'blaetter', titel: 'Blätter', icon: 'blatt', raum: 'blaetter',
    kurz: 'Ein Stapel Texte, sonst nichts.',
    abschnitte: [
      { t: 'Der Stapel', p: ['Blätter sind einzelne Texte ohne Drumherum. Das Plus legt ein neues an und öffnet sofort den Schreibraum. Jede Karte zeigt Titel (oder die erste Zeile), eine Probe und die Wörterzahl.'] },
      { t: 'Sortieren', p: ['Ab zwei Blättern erscheinen Knöpfe: Zuletzt, Älteste zuerst, A–Z. Die Wahl bleibt gespeichert.'] },
      { t: 'Das Menü (lange halten)', p: ['Oben anpinnen · Umbenennen · Vorlesen lassen · Teilen · Duplizieren (eine „Abschrift") · In ein Heft legen … · Hinzufügen & verbinden · Löschen. Angepinnte Blätter liegen in jeder Sortierung oben und tragen eine goldene Nadel.'], b: 'Ein Blatt ist fertig gedacht → lange halten → „In ein Heft legen …" → Heft wählen, Stelle wählen (ganz vorne, nach Seite 3, am Ende). Das Blatt ist jetzt eine Seite.' },
      { t: 'Formatiert oder schlicht', p: ['Ein Blatt ist zuerst schlichter Text. Im Schreibraum unter den Einstellungen steht „Aa · Text formatieren" — danach gibt es eine Formatleiste mit fett, kursiv, Überschriften, Listen, Farben und Ausrichtung. Zurück zu schlicht gibt es nicht — aber der schlichte Text bleibt immer mitgespeichert, für Suche, Zählung und Sicherung.'] }
    ]
  },
  {
    id: 'schreibraum', titel: 'Der Schreibraum', icon: 'stift', raum: 'blaetter',
    kurz: 'Vollbild, Ruhe, und alles Handwerk in einer Ecke.',
    abschnitte: [
      { t: 'Hinein und hinaus', p: ['Blätter, Szenen und Heftseiten öffnen sich im Schreibraum: eine Seite, ein Titel, der Text, sonst nichts. „Fertig" oder Escape schließt ihn. Beim Schreiben versinkt der Kopf; ein Tipp irgendwohin holt ihn zurück. Gespeichert wird von selbst — nach jeder Pause und auf jeden Fall, wenn die App in den Hintergrund geht.'] },
      { t: 'Der Zähler', p: ['Rechts oben stehen die Wörter des Textes und, sobald ich tippe, „+ neu" für das, was in dieser Sitzung dazukam. Beim Schließen mit mehr als 30 neuen Wörtern sagt VANI kurz Danke.'] },
      { t: 'Die Zeichenleiste', p: ['Über der Tastatur liegen die Zeichen, die auf einer Tastatur sonst fehlen: – „ " … ‚ ’ » «. Ein Tipp setzt sie an der Schreibstelle ein.'] },
      { t: 'Kluge Zeichen', p: ['Ist „Kluge Zeichen" an, wird aus -- ein Gedankenstrich und aus geraden Anführungszeichen werden deutsche „so". Nur bei schlichtem Text.'] },
      { t: 'Einstellungen (Schieberegler-Symbol)', p: [
        'Schrift: Serife, Klar, Mono. Größe: 15 bis 26. Breite: Schmal, Mittel, Breit. Schreibmaschine: die aktuelle Zeile bleibt in der Mitte. Zeilen-Fokus: alles außer der aktuellen Zeile tritt zurück. Tastenklang: ein leiser Klick pro Taste. Autokorrektur: an oder aus (wirkt auf die Gerätetastatur).'
      ] },
      { t: 'Suchen & Ersetzen', p: ['Im offenen Text: ein Suchwort, ein Ersatz, Anzahl der Treffer. Vor dem Ersetzen wird der alte Stand eingefroren — nichts geht verloren.'] },
      { t: 'Stände einfrieren', p: ['„Stand einfrieren" legt eine Kopie des jetzigen Textes ab (bis zu 20 je Text). Unter „Frühere Stände" kann ich jeden ansehen, zurückholen (das Jetzige wird dabei selbst eingefroren) oder vergessen.'], b: 'Vor einem großen Umbau friere ich ein. Gefällt mir die neue Fassung nicht, hole ich den Stand von gestern zurück — der Umbau bleibt als eigener Stand erhalten.' },
      { t: 'Die Kerze', p: ['„Kerze anzünden": 10, 20 oder 45 Minuten. Dann steht rechts unten eine echte Stumpenkerze im Raum und brennt über genau diese Zeit sichtbar herunter — mit Flamme, die bei jedem Anschlag einen Luftzug spürt, Wachs, das an der Seite herabläuft und sich am Fuß sammelt, Ruß, wenn es zu wild wird, und am Ende einem Faden Rauch. Antippen zeigt die Restzeit und bietet „Ausblasen". Ist sie ausgebrannt, sagt VANI, wie viele Wörter in der Zeit entstanden sind.'], b: 'Eine mittlere Kerze, das Café im Ohr, und ich schreibe, bis der Rauch steht.' },
      { t: 'Teilen', p: ['Schickt Titel und Text als Text weiter — an Notizen, WhatsApp, Mail, die Zwischenablage. Was das Gerät anbietet, steht im Teilen-Menü.'] },
      { t: 'Verknüpfen & einordnen', p: ['Zeigt, wohin [[Verweise]] im Text führen, welche Texte hierher zeigen, und öffnet die Beziehungen. Von hier geht es auch direkt zu „Zu Heft, Projekt oder Cluster hinzufügen".'] },
      { t: 'Vorlesen lassen', p: ['Das Vorlese-Symbol oben liest den Text mit der Stimme des Geräts vor — ganz ohne Internet. Noch einmal tippen stoppt. Gut zum Gegenlesen: Was holpert, hört man, bevor man es sieht. Das Tempo (ruhig, normal, zügig) steht in den Schreibraum-Einstellungen. Auch Blätter (im Menü) und die Leseansicht eines Projekts lesen vor.'], tipp: 'Auf manchen Geräten ist die deutsche Stimme erst nach dem ersten Mal richtig geladen — einmal stoppen und neu starten hilft.' },
      { t: 'Klang im Schreibraum', p: ['Das Lautsprecher-Symbol oben öffnet das Mischpult als kleine Überlagerung — ohne den Text zu verlassen.'] }
    ]
  },
  {
    id: 'format', titel: 'Text formatieren', icon: 'stift', raum: 'blaetter',
    kurz: 'Die Formatleiste: fett, Überschrift, Liste, Farbe, Ausrichtung.',
    abschnitte: [
      { t: 'Die Leiste', p: ['B fett · I kursiv · U unterstrichen · S durchgestrichen · Ü Überschrift · ¶ normaler Absatz · • Liste · 1. Liste · ❝ Zitat · Ausrichtung links, mittig, rechts, Blocksatz · A Textfarbe · ▰ Markierfarbe · Größe (11 bis 64).'] },
      { t: 'So geht es', s: ['Text markieren.', 'Knopf tippen.', 'Fertig — gespeichert wird von selbst.'], b: 'Eine Zeile markieren → Ü → sie ist eine Überschrift. Nochmal ¶ → wieder normaler Text.' },
      { t: 'Gespeichert wird sofort', p: ['Jede Formatierung ist gespeichert, sobald sie da ist — spätestens, wenn der Blick den Text verlässt („Fertig", Seitenwechsel, anderer Raum). Fett, kursiv, unterstrichen, Farbe, Größe, Überschrift, Ausrichtung bleiben auf iPad, Handy und Rechner gleich erhalten, egal wie oft ich hinein- und hinausgehe.'] },
      { t: 'Woher die Formatleiste kommt', p: ['Überall, wo ich schreibe: Neue Blätter und Szenen sind von Anfang an formatierbar, die Leiste liegt im Schreibraum oben. Ältere, schlichte Texte: ein Tipp auf „Aa" oben im Schreibraum — danach ist der Text formatierbar und bleibt es. Heftseiten: der Knopf „Aa" in den Seitenwerkzeugen oben rechts auf der Seite.'] },
      { t: 'Kurzschrift beim Tippen', p: ['_so_ wird kursiv, *so* wird fett, ~so~ durchgestrichen — sobald das schließende Zeichen fällt, wie in WhatsApp. Gilt in jedem formatierbaren Text und beim Einfügen. Unterstriche mitten im Wort (ein_schnitt_wort) bleiben, wie sie sind. In den Feinheiten ausschaltbar („Kurzschrift").'], b: 'Ich tippe „_Incredibile!_“ — und es steht kursiv da: „Incredibile!“.' },
      { t: 'Absätze', p: ['Ein Absatz ist eine normale Zeile, kein Block mit Luft drumherum. Wer Abstand will, lässt eine Zeile frei. So sieht eingefügter Text aus Goodnotes genauso aus wie dort.'] },
      { t: 'Einfügen von anderswo', p: ['Eingefügter Text wird entschärft: Schrift, Farbe, Listen und Überschriften bleiben, fremde Skripte oder seltsame Reste nicht. Ist das Eingefügte länger als eine Heftseite, läuft es automatisch auf die nächsten Seiten weiter.', 'Drei Dinge repariert VANI dabei von selbst, weil Goodnotes sie so liefert: Reste wie „&#x20;" (das ist ein Leerzeichen, als Buchstaben geschrieben) werden wieder Leerzeichen; Zeilen, die mitten im Satz umbrechen, werden wieder zu einem Satz (endet eine Zeile ohne Satzzeichen und die nächste beginnt klein, gehören sie zusammen); und Kurzschrift wie _kursiv_ wird kursiv.'] }
    ]
  },
  {
    id: 'hefte', titel: 'Hefte', icon: 'hefte', raum: 'hefte',
    kurz: 'Echte Hefte mit Seiten, Zetteln, Fotos und Kritzeleien.',
    abschnitte: [
      { t: 'Das Regal', p: ['Jedes Heft ist ein Deckel im Regal. Plus legt ein neues an. Lange halten öffnet das Heft-Menü. „Ins Regal stellen" archiviert ein Heft (es rückt nach unten unter „Im Regal"), „Zurück auf den Tisch" holt es wieder.'] },
      { t: 'Umschlag & Papier gestalten', p: ['Grundfarbe aus der Palette oder frei, Zweitton, Buchband, Muster (Schlicht, Leinen, Diagonal, Punkte, Rahmen, Wellen), Papier (Liniert, Breite Linien, Kariert, Punktraster, Blanko), Papierfarbe (Hell, Weiß, Creme, Kraft, Nacht) und eine Randlinie wie im Schulheft. Die Vorschau zeigt alles sofort; „Abbrechen" nimmt alles zurück.'], b: 'Ein Tagebuch-Heft: Papier Kraft, Randlinie an, Band dunkelrot. Ein Nachtheft: Papierfarbe Nacht — helle Schrift auf dunklem Papier.' },
      { t: 'Inhalt, Lesezeichen, Seiten ordnen', p: [
        'Das Listen-Symbol oben im Heft öffnet den Inhalt: jede Seite mit Titel oder erster Zeile, Wörterzahl und Angeklebtem. Ein Tipp springt hin — in jeder Ansicht.',
        'Im Seiten-Menü (drei Punkte auf dem Papier): „Lesezeichen hierher" — das Heft öffnet sich beim nächsten Mal auf dieser Seite. „Seite nach vorn" und „Seite nach hinten" ordnen um. „Seite verdoppeln" legt eine Abschrift mit allen Zetteln direkt dahinter.'
      ] },
      { t: 'Drei Ansichten', p: [
        'Oben im Heft stehen drei Knöpfe. „Seiten" blättert Seite für Seite (Pfeile links/rechts). „Rolle" zeigt alle Seiten untereinander, jede mit eigenem Rand und Seitenzahl. „Am Stück" macht aus dem ganzen Heft eine einzige lange Seite — ohne Kanten, ohne Umbruch, ohne Seitenzahlen.',
        'Es bleibt immer dasselbe Heft, nur anders angeschaut. Umschalten ändert nichts am Text.'
      ], b: 'Zum Lesen und für lange Texte aus anderen Apps nehme ich „Am Stück". Zum Schreiben mit Zetteln und Fotos „Seiten".' },
      { t: 'Am Stück: die lange Seite', p: [
        'In dieser Ansicht wird nicht automatisch umgebrochen. Text läuft einfach weiter, so lang er will. Die Werkzeuge und die Titelzeile treten zurück, bis ich in ein Stück hineintippe — dann sind sie wieder da.',
        '„Noch ein Stück anfügen" unten hängt hinten etwas Neues an.'
      ] },
      { t: 'Schreiben auf der Seite', p: ['Direkt auf das Papier tippen und schreiben. Ist die Seite voll, geht es automatisch auf der nächsten weiter („Im Heft automatisch weiterblättern" in den Feinheiten — standardmäßig an). Der Knopf „Automatisch auf die nächste Seite" in den Seitenwerkzeugen schaltet es um.'] },
      { t: 'Die fünf Werkzeuge auf dem Papier', p: [
        'Wichtig: Sie sitzen oben rechts **auf dem Papier selbst**, nicht in der Kopfzeile darüber. Es gibt zwei Mal „drei Punkte" — die in der Kopfzeile öffnen das Heft-Menü, die auf dem Papier das Seiten-Menü.',
        'Von links nach rechts: 📌 Nadel = Zettel ankleben · Kamera = Foto einkleben · Stift = Kritzeln · Aa = Text formatieren · drei Punkte = Mehr (Im Schreibraum öffnen, Hinzufügen & verbinden, Als loses Blatt herausnehmen, Seite herausreißen).',
        'Der Zettel hat also einen eigenen Knopf und steckt in keinem Menü.'
      ], tipp: 'Wenn ich diese Knöpfe nicht sehe: In den Feinheiten auf „VANI jetzt aktualisieren" tippen. Dann ist die neueste Fassung da.' },
      { t: 'Zettel', p: ['Kleine farbige Notizzettel auf der Seite — auch über den Seitenrand hinaus, wie im echten Heft. Ziehen verschiebt, der Griff unten rechts ändert die Größe, der runde Griff oben dreht frei, Tippen macht ihn beschreibbar. Lange halten: Andere Farbe (acht Töne), Schrift (Handschrift, Klar, Serife), Form (schmal, normal, breit), Befestigung (Tesa, Reißzwecke, lose aufgelegt), Etwas drehen, Gerade rücken, Abmachen.'], b: 'Eine Figurenbeschreibung als gelber Zettel schräg an den Rand der Seite — mit Tesa. Die Seite selbst bleibt frei für die Szene.' },
      { t: 'Fotos', p: ['„Foto einkleben" legt ein Bild auf die Seite, leicht schräg wie eingeklebt. Es lässt sich genauso ziehen, drehen, vergrößern und befestigen wie ein Zettel.'] },
      { t: 'Sticker', p: ['Das Sticker-Symbol in den Seitenwerkzeugen öffnet den Stickerblock: eine kleine Zeichenfläche mit Stiften (rot zuerst), Dicke, Radierer, Zurück. Was ich zeichne, wird so groß wie das Gezeichnete — der Rest bleibt durchsichtig — und klebt dann lose auf der Seite: ziehen, am Griff unten rechts größer und kleiner, am runden Griff oben frei drehen (nahe null rastet es gerade ein), lange halten zum Abmachen.', 'Sticker dürfen wie Zettel über den Seitenrand hinausragen. „Seite verdoppeln" nimmt sie mit.'], b: 'Ein rotes „SCHMU!" einmal gezeichnet — und ab jetzt in jedem Heft an der richtigen Stelle.' },
      { t: 'Die Stickerkiste', p: ['Das Sticker-Symbol öffnet zuerst die Kiste: oben „Meine" (was ich gezeichnet habe), darunter „Mitgebracht" — mein rotes „Schmu!" ist schon dabei, als echtes Bild mit durchsichtigem Grund. Antippen klebt auf, lange drücken nimmt einen eigenen heraus, „Neuen zeichnen" öffnet den Block. Beim Zeichnen ist „Auch in die Stickerkiste legen" angehakt. Ein schon aufgeklebter Sticker kommt per langem Halten nachträglich in die Kiste („In die Stickerkiste legen") oder gleich noch einmal auf die Seite („Noch einmal aufkleben").'] },
      { t: 'Kritzeln', p: [
        '„Kritzeln" legt eine Zeichenfläche über die Seite. Die Werkzeugleiste schwebt oben: zwölf Farben plus eine eigene, stufenlose Stiftdicke, Radierer, ein Schritt zurück, ein Schritt wieder vor, alles löschen, Abbrechen und Fertig.',
        'Was gezeichnet wird, sitzt genau unter dem Stift — in der Dicke, die eingestellt ist. Ein echter Stift wird druckempfindlich geführt, ein Finger zeichnet gleichmäßig.',
        '„Zurück" und „Wieder vor" gehen über beliebig viele Striche. Auch „Alles löschen" lässt sich mit dem Pfeil zurückholen. Erst „Fertig" schreibt die Zeichnung auf die Seite, „Abbrechen" verwirft sie.'
      ], b: 'Eine Skizze anfangen, drei Striche zurücknehmen, weiterzeichnen — und wenn gar nichts gefällt: Alles löschen, oder gleich Abbrechen.' },
      { t: 'Text aus einer anderen App hereinholen', p: [
        'Heft-Menü (die drei Punkte in der Kopfzeile) → „Text aus einer anderen App hereinholen". Es öffnet sich ein ruhiges Feld: dort einsetzen, fertig.',
        'VANI nimmt dabei die fremden Schriftgrößen, Textfarben und Hintergründe heraus — die machen den Text sonst winzig oder auf dunklem Papier unlesbar. Absätze, Überschriften, Listen, fett und kursiv bleiben. Tabellenzellen werden getrennt, statt zu einem Wortsalat zu verkleben.'
      ], s: [
        'In Goodnotes alles markieren und kopieren.',
        'In VANI das Heft öffnen → drei Punkte in der Kopfzeile → „Text aus einer anderen App hereinholen".',
        'In das Feld einsetzen. Unten steht, wie viele Wörter bereitliegen.',
        '„Hereinholen" — der Text liegt als Seite im Heft.'
      ], tipp: 'Das ist der Weg, wenn ein verwaltetes iPad keine Dateien auswählen lässt. Einsetzen geht immer.' },
      { t: 'Seiten bewegen', p: ['„Als loses Blatt herausnehmen" macht aus einer Seite wieder ein Blatt im Stapel. Umgekehrt legt „In ein Heft legen …" ein Blatt als Seite an eine Stelle meiner Wahl.'] },
      { t: 'Hefte und Projekte', p: ['Ein Heft kann zu einem Projekt gehören („Einem Projekt zuordnen" im Heft-Menü). Es erscheint dann im Projekt unter „Hefte am Projekt". „Als Kapitel in ein Projekt kopieren" macht aus allen Seiten Szenen in einem neuen Kapitel — das Heft bleibt, wie es ist.'] },
      { t: 'Verbrennen', p: ['„Heft verbrennen" legt das Heft samt Seiten in den Papierkorb. Von dort kommt es mit allem zurück, auch mit Zetteln und Fotos.'] }
    ]
  },
  {
    id: 'projekte', titel: 'Projekte', icon: 'projekte', raum: 'projekte',
    kurz: 'Für Größeres: Kapitel, Szenen auf der Pinnwand, Leseansicht.',
    abschnitte: [
      { t: 'Ein Projekt anlegen', p: ['Name, Art (Roman, Erzählung, Sammlung, Gedichte, Welt, Anderes) und ein Wortziel, das ich auch leer lassen darf. Es beginnt mit „Kapitel 1".'] },
      { t: 'Kapitel', p: ['Jedes Kapitel ist eine Pinnwand mit Szenenkarten. Im Kapitel-Menü: Umbenennen, Nach oben, Nach unten, Kapitel löschen. „Neues Kapitel" steht unten.'] },
      { t: 'Szenen', p: ['Jede Szene ist eine Karte. Tippen öffnet den Schreibraum — mit Formatleiste, denn neue Szenen sind von Anfang an formatierbar; bei älteren genügt ein Tipp auf „Aa" oben. Der Punkt unten links ist der Status: Funke → Entwurf → Steht (einfach weitertippen). Der Dreh-Knopf zeigt die Rückseite: Platz für Zweifel, Ideen, Alternativen — nur für mich.'] },
      { t: 'Szenen verschieben', p: ['Am Touchscreen: Karte kurz halten, bis sie sich hebt, dann ziehen — in diesem oder in ein anderes Kapitel, vor oder hinter eine andere Karte. Mit der Maus: einfach ziehen. „In anderes Kapitel …" im Menü geht auch ohne Ziehen.'] },
      { t: 'Szenen-Menü (lange halten)', p: ['Umbenennen · Andere Farbe · Duplizieren („Fassung 2") · In anderes Kapitel … · Teilen · Szene löschen.'], b: 'Eine Szene in zwei Richtungen probieren: Duplizieren → in der Fassung 2 anders weiterschreiben → die schlechtere später löschen oder als Rückseiten-Notiz behalten.' },
      { t: 'Leseansicht', p: ['Das Buch-Symbol zeigt das ganze Projekt am Stück wie ein Manuskript: Kapitelüberschriften, Szenen durch Sternchen getrennt, Gesamtwörter. „Kopieren" legt alles in die Zwischenablage, „Als Datei" gibt eine .txt heraus. Das Vorlese-Symbol liest das ganze Projekt vor.'] },
      { t: 'Als Manuskript hinausgeben', p: [
        'Projekt-Menü → „Als Manuskript hinausgeben". Eine einzige Datei, die überall aufgeht: Kapitel als Überschriften, Szenen sauber getrennt.',
        'Sieben Schalter bestimmen, was mitkommt: Kopfzeile (Art, Wörter, Datum), Szenentitel, Stand je Szene (Funke, Entwurf, Steht), Notizen von den Rückseiten, Figuren & Orte, Hefte am Projekt, auch leere Szenen. Die Vorschau zeigt sofort, was herauskommt.',
        '„Als Datei" gibt eine .md-Datei — die zieht man einfach in Word, Pages oder Google Docs.'
      ], b: 'Zum Weitergeben an jemanden: Notizen aus, Stand aus, Figuren aus. Für mich selbst zum Überarbeiten: alles an.' },
      { t: 'Wortziel', p: ['Mit Wortziel zeigen Karte und Kopf einen Fortschrittsbalken. Das Ziel lässt sich im Projekt-Menü jederzeit ändern (0 = keins).'] },
      { t: 'Hefte am Projekt', p: ['Unten im Projekt liegen Hefte, die dazugehören. „Heft dazulegen" ordnet ein vorhandenes zu oder legt ein neues an. Ein Tipp auf das Heft öffnet es.'] },
      { t: 'Figuren & Orte', p: [
        'Die Welt des Projekts: Wer tritt auf, wo spielt es, welches Ding trägt die Geschichte. „+ Dazu" fragt Name, Art (Figur, Ort, Ding, Anderes) und eine Notiz — Alter, Geruch, Geheimnis, was auf dem Tisch liegt.',
        'Die kleine Zahl am Namen sagt, in wie vielen Szenen er vorkommt. Ein Tipp: Notiz lesen, Ändern, „Wo kommt … vor?", Verbindungen, Entfernen.',
        'Das Beste: [[Name]] in doppelten Klammern im Text springt direkt zur Figur — weil der Name ihr Titel ist.'
      ], b: 'Figur „Tante Ruth", Ort „Der Hafen", Ding „Das rote Auto". In der Szene steht: „Sie wartete am [[Der Hafen]], wie jeden Sonntag." Ein Tipp auf den Namen, und ich lese meine Notiz.' }
    ]
  },
  {
    id: 'cluster', titel: 'Cluster', icon: 'cluster', raum: 'cluster',
    kurz: 'Bretter zum Denken: Blasen und Fäden dazwischen.',
    abschnitte: [
      { t: 'Bretter', p: ['Ein Brett ist eine unendliche Fläche. Plus legt eines an, lange halten auf einer Brettkarte: Umbenennen, Brett löschen.'] },
      { t: 'Blasen', p: ['Doppelt auf die Fläche tippen setzt eine Blase genau dort. Das Plus setzt eine in die Mitte. Tippen macht die Blase beschreibbar, Ziehen verschiebt sie. Lange halten: Andere Farbe (vier Töne und neutral), Im Schreibraum öffnen, Verbindungen ansehen, Blase zerplatzen.'] },
      { t: 'Fäden spannen', p: ['Der Verbinden-Knopf schaltet den Faden-Modus an. Zwei Blasen antippen — ein Faden spannt sich. Ein Tipp auf den Faden: Beschriften oder Lösen. Dieselben zwei Blasen noch einmal: der Faden löst sich.'], b: 'Blase „Hafen" und Blase „Tante Ruth" → Faden → beschriftet mit „wohnt dort seit 1987".' },
      { t: 'Schieben und zoomen', p: ['Mit einem Finger (oder der Maus) die Fläche schieben, mit zwei Fingern kneifen zum Zoomen. Die Lupen-Knöpfe zoomen schrittweise, der Prozent-Knopf setzt auf 100 % zurück. Die Ansicht merkt sich das Brett.'] },
      { t: 'Bilder aufs Brett', p: [
        'Das Kamera-Symbol legt ein Foto aufs Brett — wie ein Polaroid, leicht schräg. Ziehen verschiebt, der Griff unten rechts ändert die Größe. Lange halten: beschriften, drehen, gerade rücken, wegnehmen.'
      ] },
      { t: 'Gruppen mit Rahmen', p: [
        'Das Rahmen-Symbol legt einen beschrifteten Rahmen um einen Teil des Bretts. Am Titel ziehen verschiebt den Rahmen — und alles, was darin liegt, wandert mit.',
        'Lange halten auf dem Titel: umbenennen, Farbe wechseln, „Eng um den Inhalt legen" (der Rahmen schmiegt sich an das, was drin liegt) oder auflösen. Beim Auflösen bleibt der Inhalt liegen.'
      ], b: 'Ein Rahmen „Erster Teil" um sechs Blasen. Beim Umsortieren des Buches schiebe ich den ganzen Teil an eine andere Stelle — mit einem Griff.' },
      { t: 'Brett als Bild', p: [
        'Das Teilen-Symbol oben malt das ganze Brett als Bild: Rahmen, Fäden mit Beschriftung, Bilder, Blasen mit Text und Farbe. Herauskommt ein PNG zum Verschicken oder Ausdrucken.'
      ] },
      { t: 'Dinge aufs Brett legen', p: ['Schnipsel, Blätter, Seiten, Szenen, Hefte und Goodnotes-Archive lassen sich über „Hinzufügen & verbinden → Auf ein Cluster-Brett legen" als Blase ablegen. Die Blase zeigt einen kleinen Quellen-Knopf zurück zum Original.'] }
    ]
  },
  {
    id: 'woerter', titel: 'Wörter', icon: 'woerter', raum: 'woerter',
    kurz: 'Wortkisten, Schütteln und Funken.',
    abschnitte: [
      { t: 'Wortkisten', p: ['Kleine Sammlungen: Synonyme, Lieblingsverben, Figurenwörter, Wörter für einen Vibe. „＋ Neue Kiste" legt eine an. „Alle Wörter" zeigt den ganzen Schrank, „Lose Wörter" alles ohne Kiste. Das Kisten-Menü: Name, Notiz & Farbe ändern · Nur Kiste löschen (die Wörter bleiben lose) · Kiste und ihre Wörter löschen.'] },
      { t: 'Wörter hinzufügen', p: ['Das Feld nimmt mehrere Wörter auf einmal — durch Zeilenumbruch, Komma oder Semikolon getrennt. Strg/⌘ + Enter oder das Plus fügt hinzu. Doppelte werden still übersprungen, Wörter werden auf 160 Zeichen begrenzt, höchstens 500 auf einmal.'], b: 'Kiste „Wörter für Licht": flirren, Lichtsaum, seidenmatt, Splittergold — in einer Zeile mit Kommas eingeben, einmal Strg+Enter.' },
      { t: 'Suchen, sortieren, Favoriten', p: ['Die Suche filtert innerhalb der gewählten Kiste. Sortierung: zuletzt, A–Z, älteste. Im Wortzettel („Wortzettel bearbeiten") gibt es „Oben anheften" — angeheftete Wörter stehen in jeder Sortierung oben, dazu Platz für eine Notiz. Das Wort-Menü: Damit schreiben · Wortzettel bearbeiten · In eine andere Kiste verschieben · In eine Kiste kopieren · Aus der Sammlung nehmen.'] },
      { t: 'Schütteln', p: ['„Schütteln" greift drei zufällige Wörter aus der aktuellen Auswahl auf die Bühne. Ein Knopf daneben macht daraus sofort ein Blatt zum Losschreiben.'] },
      { t: 'Funken', p: ['Unten im Raum dieselben Funkenarten wie Zuhause: Szene, Wer · Wo · Aber, Frage, Form, Satz. „Merken" legt einen Funken in die Funkeln.'] },
      { t: 'Saatworte', p: ['Beim ersten Start liegen ein paar Saatworte im Schrank — zum Wegwerfen oder Behalten.'] }
    ]
  },
  {
    id: 'klang', titel: 'Klang', icon: 'klang', raum: 'klang',
    kurz: 'Atmosphäre zum Schreiben — alles errechnet, nichts geladen.',
    abschnitte: [
      { t: 'Zwei Arten von Klang', p: [
        'Oben im Klangraum stehen zwei Reiter. „Aufnahmen" sind echte Feldaufnahmen — Lagerfeuer, Landdämmerung, Waldmorgen, alte Mühle. „Gewebt" sind Klänge, die VANI selbst errechnet: Regen, Meer, Wind, Grillen und mehr.',
        'Beides lässt sich mischen. Ein echtes Lagerfeuer unter gewebtem Regen klingt oft besser als jedes für sich.'
      ] },
      { t: 'Was im Fundus liegt', p: [
        'Wetter: Regen in mehreren Stärken, Gewitter, vier Windstärken. Wasser: Meer, Brandung, Sturm auf See, Bach, Wasserfall, unter Wasser. Natur: Wald, Vögel, Grillen, Dschungel, Sumpf bei Nacht. Feuer: Kamin und Lagerfeuer.',
        'Dazu Orte, die es sonst nirgends gibt: Markt in Marrakesch, Wirtshaus am Samstagabend, Straße in China, Schulhof, Café, volles Restaurant, Bahnhofshalle, U-Bahn, Dampfzug, Fabrik, Schreibmaschinenbüro, altes Uhrwerk, Landdämmerung.',
        'Woher jede Aufnahme stammt, steht unten in ihrer Feineinstellung.',
        'Über dem Fundus liegt ein Suchfeld. Ich tippe „Regen" oder „Orte" und sehe nur noch, was passt; Esc leert das Feld wieder.'
      ] },
      { t: 'Aufnahmen holen', p: [
        'Eine Aufnahme wird erst geholt, wenn ich sie das erste Mal anschalte — dafür braucht es einmal Internet. Danach liegt sie im Gerät und läuft auch offline, im Zug, im Flugzeug.',
        'Rechts an jeder Zeile steht, ob sie schon „im Gerät" ist oder wie groß sie ist. Unter „Vorrat …" hole ich alle auf einmal oder schaffe wieder Platz.'
      ], tipp: 'Vor einer Reise einmal „Alle holen" — dann ist der Klang unterwegs sicher da.' },
      { t: 'Feineinstellung je Aufnahme', p: [
        'Das kleine Regler-Symbol rechts an jeder Zeile klappt fünf Regler auf, die aus einem Loop eine Stimmung machen:',
        'Tempo — langsamer macht alles schwerer und tiefer. Klarheit — von offen bis dumpf, als hörte man es durch eine Wand. Tiefe — nimmt den Bass heraus, dann klingt es fern. Atmen — wie stark die Aufnahme in Lautstärke und Farbe wandert, damit sie nicht nach Wiederholung klingt. Übergang — wie weich sich das Ende in den Anfang blendet.'
      ], b: 'Lagerfeuer mit Tempo „langsamer 20%" und Klarheit „dumpf" klingt wie ein Kamin im Nebenzimmer.' },
      { t: 'Klangbilder', p: [
        'Eine Mischung mit Namen. „Klangbild merken" hält alles fest: welche Aufnahmen, welche gewebten Klänge, alle Feineinstellungen und die Gesamtlautstärke.',
        'Ein Klangbild lange drücken: umbenennen, mit dem Jetzigen überschreiben, an einen Ort binden oder löschen.'
      ] },
      { t: 'Klang, der dem Text folgt', p: [
        'Das Besondere: Ein Klangbild kann an einer Szene, einem Kapitel, einem Heft oder einem ganzen Projekt hängen. Öffne ich dort den Schreibraum, legt sich das Klangbild von selbst auf.',
        'Ein Kapitel vererbt an seine Szenen, ein Projekt an alles darin. So bekommt jeder Teil des Buches seinen eigenen Ton, ohne dass ich etwas tue.',
        'Abschalten lässt sich das mit „Klangbilder folgen dem Text" unten im Klangraum.'
      ], b: 'Klangbild „Sturmnacht" ans Kapitel „Die Überfahrt" gehängt. Jede Szene darin beginnt jetzt mit Wind und Brandung.' },
      { t: 'Eigene Klänge', p: [
        '„+ Eigener Klang" nimmt jede Audiodatei vom Gerät auf — eigene Aufnahmen, gekaufte Ambiences, was auch immer. Sie stehen gleichberechtigt neben den mitgelieferten, mit allen Feineinstellungen.',
        'Eigene Klänge reisen über den privaten Bereich auf die anderen Geräte mit.'
      ] },
      { t: 'Einschlafen', p: [
        '„Einschlafen …" lässt den Klang über 15 Minuten bis zwei Stunden langsam leiser werden und dann ausgehen. Die ersten zwei Drittel bleiben fast gleich laut, erst danach wird es hörbar stiller — so wacht man nicht vom Leiserwerden auf.'
      ] },
      { t: 'Die gewebten Klänge', p: ['22 Klangebenen, die VANI selbst erzeugt — kein Download, kein Internet: Wetter (Regen ans Fenster, Regen aufs Dach, Platzregen, Fernes Gewitter, Wind ums Haus, Schneesturm), Wasser (Meeresbrandung, Bach, Tropfen nach dem Regen), Feuer (Kaminfeuer, Kerzenflackern), Natur (Blätterrascheln, Grillen, Vogelmorgen, Möwen, Eule, Zikaden), Nah & warm (Katzenschnurren, Herzschlag, Uhrenticken, Altes Haus), Orte (Café-Gemurmel, Zugfahrt, Glocken in der Ferne).'] },
      { t: 'Mischen', p: ['Jede Ebene hat einen Regler. Ein Tipp auf den Namen schaltet sie an (halbe Stärke) oder aus. Mehrere Ebenen zusammen ergeben eine Mischung. Unten: Gesamtlautstärke.'] },
      { t: 'Szenen', p: ['Zwölf fertige Szenen (Sturmnacht am Leuchtturm, Am Lagerfeuer, Schreibzimmer, Nachtzug, Café am Regentag, Sommernacht, Nach dem Regen, Morgen am Meer, Wintermorgen, Tiefe Nacht, Altes Haus im August, Bibliothek). „Mischung merken" macht aus meiner eigenen Mischung eine Szene mit Namen. Lange halten auf einer eigenen Szene entfernt sie. „Stille" macht alles aus.'], b: 'Regen ans Fenster 45 %, Kaminfeuer 30 %, Uhrenticken 45 % → „Mischung merken" → „Novemberabend".' },
      { t: 'Wenn es stumm bleibt', p: ['Browser erlauben Klang erst nach einer Berührung. Die Statuszeile sagt, was los ist. „Ton prüfen" spielt einen hellen Prüfton. „Klang neu wecken" baut den Klang frisch auf — das hilft vor allem auf dem iPad, wenn die App lange im Hintergrund war oder ein Anruf dazwischenkam.'], tipp: 'Auf dem iPad schaltet das System den Klang nach langem Hintergrund manchmal stumm. Ein Tipp irgendwo in der App oder „Klang neu wecken" holt ihn zurück. Das ist eine Grenze des iPads, nicht von VANI.' },
      { t: 'Im Schreibraum', p: ['Das Lautsprecher-Symbol öffnet das Mischpult kompakt über dem Text. Läuft Klang, leuchtet das Symbol. Am Ende einer Kerze grüßt VANI passend zur Mischung („Der Regen fällt weiter.").'] }
    ]
  },
  {
    id: 'faden', titel: 'Faden', icon: 'faden', raum: 'faden',
    kurz: 'Alles, was je an Vani ging — und weitergeht.',
    abschnitte: [
      { t: 'Was der Faden ist', p: ['Der Faden ist der alte Chat, als ich noch an „Vani" geschrieben habe, bevor es VANI gab. Er liegt verschlüsselt bereit und kommt erst mit dem Passwort in die App. Bis dahin ist der Raum nicht in der Leiste.'] },
      { t: 'Hereinholen', s: ['Feinheiten → „Den Faden holen" → „Faden hereinholen".', 'Das Passwort eingeben (wort-wort-zahl-wort-wort).', 'Warten — dann öffnet sich der Faden, und der Raum steht ab jetzt in der Leiste.'], p: ['Das muss nur einmal je Gerät geschehen. Was schon da ist, wird nicht doppelt geholt.', 'Die verschlüsselte Fadendatei liegt absichtlich nicht mehr offen im Netz. Auf einem Gerät, das schon in meinem privaten Bereich hängt, kommt der Faden von selbst mit. Sonst bringt ihn die Desktop-App auf dem Rechner mit — oder ich wähle die Datei einmal von Hand.'] },
      { t: 'Weiterschreiben', p: ['Unten ist ein Feld „Weiter im Faden …". Der Faden ist fortsetzbar — neue Zeilen landen am Ende mit Uhrzeit. Das ist absichtlich nicht der Standard-Weg (dafür sind die Schnipsel da), aber er bleibt offen.'] },
      { t: 'Tipp auf eine Zeile', p: ['Kopieren · Als Blatt herauslösen · Löschen.'] },
      { t: 'Wiederfinden', p: ['Die große Suche findet auch im Faden (eigener Filter-Chip „Faden"). Ein Treffer springt genau an die Stelle und leuchtet kurz auf. Unter „Wieder aufgetaucht" erscheinen alte Fadenzeilen als „Aus dem Faden".'] }
    ]
  },
  {
    id: 'goodnotes', titel: 'Goodnotes', icon: 'buchzu', raum: 'goodnotes',
    kurz: 'Ein stilles Archiv für ganze Notizbücher.',
    abschnitte: [
      { t: 'Was das Archiv ist', p: ['Importierte Notizbücher bleiben als ganze Originaldateien in diesem einen Raum. Sie erzeugen keine Schnipsel, Blätter oder Suchtreffer anderswo. Der Raum erscheint erst in der Leiste, wenn das erste Notizbuch drin liegt.'] },
      { t: 'Hereinholen', p: ['Feinheiten → „Goodnotes hereinholen" → PDF, Goodnotes oder ZIP wählen (auch Bilder). Mehrere auf einmal gehen. Doppelte Dateien werden erkannt und nicht zweimal abgelegt. Sehr große Dateien (über 250 MB) oder zu wenig Speicherplatz werden abgelehnt.'], tipp: 'Am schönsten: in Goodnotes „Exportieren → PDF → Reduziert" mit Handschrifterkennung. Dann ist das PDF später durchsuchbar.' },
      { t: 'Öffnen und ordnen', p: ['Ein Tipp öffnet PDFs und Bilder direkt in VANI. Goodnotes-Originale und ZIP-Pakete bleiben verwahrt und lassen sich über „Original" wieder herausgeben. Lange halten: Titel, Stichwörter & Notiz · Hinzufügen & verbinden · Original herausgeben · In den Papierkorb.'] },
      { t: 'Mit anderen Geräten', p: ['Bei eingeschaltetem Sync reisen Titel und Notizen mit. Die großen Originaldateien nur, wenn in den Feinheiten „Goodnotes-Originaldateien mitsenden" an ist.'] },
      { t: 'Ehrliche Grenze', p: ['Das ist ein Archivimport, kein Live-Abgleich mit Goodnotes in beide Richtungen.'] }
    ]
  },
  {
    id: 'verbinden', titel: 'Verbinden & verwandeln', icon: 'verbinden', raum: '',
    kurz: 'Wie Dinge zusammenfinden und ihre Form wechseln.',
    abschnitte: [
      { t: 'Doppelte Klammern', p: ['[[Titel]] im Text verweist auf einen anderen Text (oder ein Wort in der Kiste). Der Verweis ist anklickbar. Unter „Verknüpfen & einordnen" im Schreibraum steht, wohin ein Text führt und wer auf ihn zeigt.'], b: 'In einer Szene: „… sie wohnte am [[Hafen]]." — ein Tipp auf „Hafen" öffnet das Blatt mit diesem Titel.' },
      { t: 'Beziehungen', p: ['Zwei Dinge lassen sich bewusst verbinden, mit einer Art: gehört dazu, inspiriert, erklärt, widerspricht, spiegelt, Fortsetzung von, Figur / Ort. „Verbindungen ansehen" zeigt alle Beziehungen eines Dings; jede lässt sich trennen. Beziehungen gelten für Blätter, Seiten, Szenen, Hefte, Projekte, Blasen, Schnipsel, Wörter, Funken und Goodnotes.'] },
      { t: 'Das Menü „Hinzufügen & verbinden"', p: ['Je nach Ding bietet es an: Auf eine Heftseite kleben (Schnipsel), Als Seite in ein Heft legen (Blatt), Mit Tesa auf eine Heftseite kleben — Original bleibt (Blatt), Einem Projekt zuordnen / Aus dem Projekt lösen (Heft), Als Kapitel in ein Projekt kopieren (Heft), Auf ein Cluster-Brett legen, Mit etwas verbinden.'] },
      { t: 'Verwandeln', p: ['Schnipsel können Blatt, Heftseite, Szene, Blase oder Wort werden. Seiten können loses Blatt werden, Blätter können Seite werden. Funken werden zu Blättern. Wörter aus der Bühne werden zu Blättern. Nichts davon kopiert heimlich — entweder wandert das Ding, oder es steht ausdrücklich „Original bleibt".'] },
      { t: 'Was beim Löschen mitgeht', p: ['Wird ein Projekt, Heft, Brett oder eine Seite gelöscht, gehen Kinder (Kapitel, Szenen, Seiten, Zettel, Blasen, Fäden) und Beziehungen gemeinsam in den Papierkorb — und kommen beim Zurückholen gemeinsam wieder, an ihren Platz.'] }
    ]
  },
  {
    id: 'suche', titel: 'Suchen & wiederfinden', icon: 'suche', raum: 'suche',
    kurz: 'Ein Feld, alles. Mit Nachsicht bei Tippfehlern.',
    abschnitte: [
      { t: 'Die große Suche', p: ['Unten in der Leiste oder Strg/⌘ + K. Ab zwei Zeichen wird gesucht — in Titeln, Texten und Notizen aller Räume. Treffer sind nach Art gruppiert (Schnipsel, Blätter, Heftseiten, Szenen, Hefte, Projekte, Blasen, Zettel, Wortkisten, Wörter, Faden, Funken, Klang-Szenen) und zeigen die Fundstelle mit Umfeld.'] },
      { t: 'Filter', p: ['Die Chips unter dem Feld beschränken auf eine Art. Dann werden statt 6 bis zu 40 Treffer je Gruppe gezeigt.'] },
      { t: 'Ähnlich', p: ['Ab fünf Zeichen findet die Suche auch Wörter mit einem Buchstaben Unterschied und zeigt sie mit „(ähnlich)". Umlaute und ß sind egal: „strasse" findet „Straße".'] },
      { t: 'Zuletzt und Schlagworte', p: ['Ohne Eingabe zeigt die Suche die letzten Suchen, die zuletzt angefassten Texte und alle Schlagworte: jedes #wort, das irgendwo im Text steht, mit der Zahl der Orte. Ein Tipp sucht danach.'], b: 'In drei Schnipseln steht #sommer. Die Suche zeigt „#sommer 3" — ein Tipp, alle drei sind da.' },
      { t: 'Wiederfinden ohne Suchen', p: ['Zuhause unter „Wieder aufgetaucht" und „Weiterschreiben". Im Heft über die Rolle. Im Projekt über die Leseansicht. In der Funkenkiste und den Wortkisten über deren eigene Suche. Auf der freien Schnipsel-Fläche über „Auf der Fläche suchen".'] }
    ]
  },
  {
    id: 'feinheiten', titel: 'Feinheiten', icon: 'feinheiten', raum: 'feinheiten',
    kurz: 'Stimmung, Räume, Zahlen, Papierkorb und alles Grundsätzliche.',
    abschnitte: [
      { t: 'Stimmung', p: ['Fünf Themen: Papier (warm, hell), Tinte (dunkel), Kerze (dunkel, warm), Nebel (kühl, hell), Weiß (reinweiß). Gilt für die ganze App und färbt auch die Leiste oben am Gerät.'] },
      { t: 'Schreiben', p: ['Tagesziel in Wörtern (leer = keins). Automatisches Weiterblättern in Heften an/aus. Schrift, Größe und Fokus stelle ich direkt im Schreibraum ein.'] },
      { t: 'Räume', p: ['Jeder Raum lässt sich ein- und ausblenden und mit den Pfeilen sortieren. Zuhause bleibt immer. Ausgeblendete Räume behalten ihre Inhalte.'] },
      { t: 'Zahlen', p: ['Ein Jahr aus Punkten: jeder Tag ein Kästchen, je dunkler, desto mehr Wörter — so sieht man Strähnen und Pausen auf einen Blick. Darunter die letzten Tage als Balken, Wörter insgesamt, heute, Tage in Folge, und wie viele Schnipsel, Blätter, Seiten und Szenen es gibt.'] },
      { t: 'Papierkorb', p: ['Gelöschtes liegt hier mindestens 30 Tage. „Zurückholen" bringt ein Bündel mit allem zurück, was dazugehörte. „Endgültig leeren" ist die eine Stelle, an der Löschen wirklich löscht — mit Nachfrage.'] },
      { t: 'Frisch anfangen', p: ['„Zählungen auf null" setzt Wörter pro Tag, Strähne und Schreibfeuer zurück. Texte, Hefte, Projekte und der Faden bleiben unangetastet.'] },
      { t: 'Frisch durchatmen', p: ['Ganz unten: die App neu laden. Hilft, wenn etwas hakt — es geht nichts verloren.'] }
    ]
  },
  {
    id: 'sichern', titel: 'Sichern & zurückholen', icon: 'teilen', raum: 'feinheiten',
    kurz: 'Eine Datei mit allem drin — und wie sie zurückkommt.',
    abschnitte: [
      { t: 'Alles sichern', p: ['Feinheiten → „Alles sichern". VANI packt Texte, Hefte, Projekte, Fotos, Einstellungen und Zählungen in eine einzige Datei (.vani) und bietet sie zum Teilen oder Speichern an — in „Dateien", an die Mail, in eine Cloud meiner Wahl. Zuhause erinnert mich leise, wenn die letzte Sicherung lange her ist.'], tipp: 'Vor großen Aufräumaktionen, vor einem Gerätewechsel und ab und zu einfach so.' },
      { t: 'Sicherung einlesen', p: ['„Sicherung einlesen" öffnet die Datei. Zwei Wege: „Dazulegen" (nichts geht verloren, Vorhandenes bleibt) oder „Alles ersetzen" (mit Nachfrage). Eingelesene Texte zählen nicht als heute geschrieben.'] },
      { t: 'Nur Texte kopieren', p: ['Legt alle Texte als einfachen Text in die Zwischenablage — Projekte mit Kapiteln, Hefte mit Seiten und Zetteln, Schnipsel mit Datum. Zum Einfügen irgendwo anders. Und: Ein anderes VANI baut daraus Projekte, Hefte und Schnipsel wieder auf — „Aus der Zwischenablage einlesen" versteht dieses Format.'] },
      { t: 'In die Zwischenablage sichern', p: ['Dieselbe Sicherung wie „Alles sichern", nur ohne Datei: Sie liegt danach in der Zwischenablage. Ich wähle „Nur Texte und Einstellungen" (klein, schnell) oder „Alles, auch Bilder" (kann groß werden). Im anderen VANI dann „Aus der Zwischenablage einlesen". So ziehe ich um, wenn das Gerät keine Dateien öffnen darf.'] },
      { t: 'Aus der Zwischenablage einlesen', p: ['Ein Feld, in das ich einfüge — und VANI erkennt selbst, was es ist: eine Sicherung (dann „Dazulegen" oder „Alles ersetzen"), ein Kopplungscode (dann wird verbunden), „Nur Texte" aus einem älteren VANI (werden wieder zu Projekten, Heften und Schnipseln), ein WhatsApp-Verlauf (kommt in den Faden, jede Nachricht mit ihrer Zeit), ein Text mit Überschriften (wird Projekt mit Kapiteln, Heft mit Seiten oder ein Blatt) oder einfach Text (Blatt, Heftseite, Schnipsel oder Faden). Am Ende steht, was angekommen ist: so viele Hefte, so viele Seiten, so viele Wörter. Schon Vorhandenes wird nicht doppelt angelegt.'], b: 'In Goodnotes Strg+A, Strg+C — in VANI „Aus der Zwischenablage einlesen" → „Als Heft mit 4 Seiten". Fertig, ohne Datei.' },
      { t: 'Die kleinen Rettungen', p: ['Direkt nach dem Löschen: „Rückgängig" unten im Hinweis. Später: Papierkorb in den Feinheiten. Für Textfassungen: eingefrorene Stände im Schreibraum.'] },
      { t: 'Wenn das Gerät keine Dateien öffnen darf', p: ['Manche Schul-iPads lassen keine Dateiauswahl zu. Dann gehen alle Wege trotzdem: „In die Zwischenablage sichern" und „Aus der Zwischenablage einlesen" brauchen keine Datei, der Kopplungscode überträgt alles verschlüsselt über den privaten Bereich, und der Faden kommt ohnehin mit Passwort. Nur „Sicherung einlesen" mit Datei fällt weg.'] },
      { t: 'Von einem alten VANI umziehen', p: ['Jedes VANI-Symbol auf einem Gerät hat seinen eigenen Bestand — auch zwei Symbole derselben Adresse teilen nichts miteinander. Darum muss ein alter Bestand einmal herüber. „Von einem alten VANI umziehen →" zeigt die drei Wege Schritt für Schritt und passt sich an: Hat das alte VANI schon „iPad ↔ Laptop", genügt der Kopplungscode (dort „Mit Bereich verbinden" → „Beides zusammenlegen"). Sonst die Zwischenablage: drüben „In die Zwischenablage sichern" — oder bei einer ganz alten Fassung „Nur Texte kopieren" —, hier „Aus der Zwischenablage einlesen". Die Datei ist der dritte Weg, wo sie erlaubt ist.', 'Lief das alte VANI unter der früheren zweiten Adresse, erscheint beim Öffnen „VANI ist umgezogen". Dort steht, wie viel noch drin liegt, und „Alten Bestand retten" öffnet das alte VANI samt Bestand — von dort gehen Kopplungscode und Zwischenablage. Das alte Symbol erst löschen, wenn hier alles da ist.'] }
    ]
  },
  {
    id: 'profile', titel: 'Profile & Türen', icon: 'feinheiten', raum: 'feinheiten',
    kurz: 'Ein Passwort vor meinem Bestand, mehrere Personen auf einem Gerät.',
    abschnitte: [
      { t: 'Die Tür', p: ['Beim ersten Start fragt VANI „Wem gehört dieses VANI?" — Name und Passwort. Danach steht diese Tür vor meinem Bestand. Das ist kein Internetkonto: das Passwort wird nie irgendwohin geschickt, es schützt nur hier auf dem Gerät.'] },
      { t: 'Mehrere Profile', p: ['„Neues Profil auf diesem Gerät" legt einen völlig getrennten Bestand an — für meine Cousine zum Beispiel. Jedes Profil hat eigene Texte, eigene Einstellungen und einen eigenen Sync-Bereich. „Profil wechseln oder anlegen" in den Feinheiten.'] },
      { t: 'Sperren', p: ['„Automatisch sperren": nie, nach 2, 10 oder 30 Minuten im Hintergrund. Danach braucht es das Passwort wieder.'] },
      { t: 'Passwort ändern', p: ['In den Feinheiten unter „Mein Profil". Altes Passwort, neues zweimal.'] },
      { t: 'Ehrlich gesagt', p: ['Ein vergessenes Profil-Passwort lässt sich nicht zurücksetzen — es gibt keinen Server, der es kennt. Darum: Passwort merken, und ab und zu „Alles sichern". Mit einer Sicherung lässt sich der Bestand in ein neues Profil einlesen.'] }
    ]
  },
  {
    id: 'geraete', titel: 'Mehrere Geräte', icon: 'verbinden', raum: 'feinheiten',
    kurz: 'iPad, Laptop und Handy halten sich gegenseitig aktuell — verschlüsselt.',
    abschnitte: [
      { t: 'Der private Bereich', p: ['Ein Bereich ist mein verschlüsselter Stapel in VANIs unsichtbarem Tresor. Der Tresor sieht nur Geheimtext; den Schlüssel haben nur meine Geräte. Ohne Bereich bleibt jedes Gerät für sich — das ist der Standard. Die Tresoradresse muss ich im Alltag nie öffnen.'] },
      { t: 'Anlegen', s: ['Feinheiten → „iPad ↔ Laptop ↔ weitere Geräte" → „Neuen privaten Bereich".', 'Einen Namen geben. Der richtige VANI-Tresor ist bereits vorausgefüllt.', 'Fertig — alles, was auf diesem Gerät liegt, nimmt der Bereich mit.'] },
      { t: 'Ein zweites Gerät koppeln', s: ['Auf dem ersten Gerät: „Weiteres Gerät koppeln" → der Kopplungscode (VANI1-…) wird kopiert.', 'Den Code zum zweiten Gerät bringen — Nachricht an mich selbst, Mail, egal.', 'Dort: „Mit Bereich verbinden" → Code einfügen → „Beides zusammenlegen" oder „Diesen Gerätebestand ersetzen".'], p: ['Der Code ist wie ein Hausschlüssel: wer ihn hat, sieht den Bereich. Nur an eigene Geräte geben.'], b: 'Auf dem iPad Bereich anlegen, Code per WhatsApp an mich schicken, am Laptop einfügen. Ab da schreibe ich am Laptop weiter, was ich am iPad angefangen habe.' },
      { t: 'Was mitreist', p: ['Texte, Hefte, Seiten, Zettel, Projekte, Szenen, Bretter, Blasen, Wörter, Funken, Beziehungen, Fotos, Kritzeleien, Einstellungen und Zählungen. Goodnotes-Originale nur, wenn „Goodnotes-Originaldateien mitsenden" an ist.'] },
      { t: 'Gleichzeitig und offline', p: ['Offline schreiben ist in Ordnung — Änderungen warten und gehen beim nächsten Netz weiter. Schreiben zwei Geräte gleichzeitig am selben Text, werden die Änderungen zusammengeführt, nicht überschrieben.'] },
      { t: 'Status', p: ['Synchron, arbeitet, offline, nur hier — die Karte in den Feinheiten sagt es in Worten. „Jetzt abgleichen" stößt einen Abgleich an. „Gerät trennen" nimmt nur dieses Gerät aus dem Bereich; Inhalte bleiben hier, der Bereich und die anderen Geräte bleiben unberührt.'] },
      { t: 'Zwei Personen, zwei Bereiche', p: ['Jede Person legt ihren eigenen Bereich an. Nur gleiche Kopplungscodes führen zum gleichen Bestand.'] }
    ]
  },
  {
    id: 'installation', titel: 'Geräte, Installation & Updates', icon: 'wieder', raum: 'feinheiten',
    kurz: 'Wie VANI aufs iPad, aufs Handy und auf den Laptop kommt — und wie es aktuell bleibt.',
    abschnitte: [
      { t: 'Eine einzige Web-Adresse', p: ['Für iPad, iPhone, Android und Laptop-Browser gibt es genau ein sichtbares VANI: https://thekeveldikev.github.io/vani/ — andere technische Adressen sind keine zweite App und müssen nicht geöffnet oder installiert werden.'] },
      { t: 'iPad und iPhone', s: ['https://thekeveldikev.github.io/vani/ in Safari öffnen.', 'Teilen-Symbol (Viereck mit Pfeil) → „Zum Home-Bildschirm".', 'Ab jetzt über dieses eine Icon starten — Vollbild, ohne Safari-Leiste, offline.'], p: ['Kein App Store nötig. Das geht auch auf einem Schul-iPad, solange Safari Webseiten öffnen darf.'] },
      { t: 'Android-Handy', s: ['https://thekeveldikev.github.io/vani/ in Chrome öffnen.', 'Menü (drei Punkte) → „Zum Startbildschirm hinzufügen" oder „App installieren".'] },
      { t: 'Windows-Laptop', p: ['Entweder https://thekeveldikev.github.io/vani/ im Browser öffnen (Chrome, Edge: dort gibt es „App installieren" in der Adressleiste) — oder die Desktop-App: VANI-x64-Setup.exe installiert sie, VANI-x64-Portable.exe läuft ohne Installation.'] },
      { t: 'Updates hinter demselben Icon', p: ['Ein Icon genügt für immer. Änderungen, die Claude oder Codex auf GitHub veröffentlichen, ersetzen die App hinter diesem Icon — ich muss nie wieder „Zum Home-Bildschirm" wählen. Beim Start holt VANI sich im Hintergrund die neue Fassung; unten erscheint dann „Eine neue Fassung liegt bereit → Neu laden". Oder: Feinheiten → „VANI jetzt aktualisieren".'], b: 'Claude hat etwas an VANI gebaut und auf GitHub veröffentlicht. Am iPad öffne ich mein einziges VANI-Icon, tippe in den Feinheiten auf „VANI jetzt aktualisieren" — fertig. Meine Texte bleiben, wo sie sind.' },
      { t: 'Teilen nach VANI und Schnellstarts (Android)', p: [
        'Auf einem Android-Handy taucht VANI im Teilen-Menü anderer Apps auf: Text markieren → Teilen → VANI. Der Text landet als Schnipsel — ohne Kopieren und Einfügen.',
        'Das Icon lange halten zeigt Schnellstarts: Neuer Schnipsel, Neues Blatt, Suchen.',
        'Auf dem iPhone und iPad gibt es diese beiden Wege nicht — Apple erlaubt sie Web-Apps nicht. Dort bleibt Kopieren und Einfügen.'
      ] },
      { t: 'Desktop-App aktualisieren', p: ['Die Windows-App aktualisiert sich noch nicht selbst. Eine neue Setup-Datei einfach über die alte installieren — Inhalte bleiben.'] },
      { t: 'Offline', p: ['Nach dem ersten Öffnen läuft VANI komplett ohne Internet. Internet braucht es nur für Updates, für den Sync und zum Hereinholen des Fadens.'] },
      { t: 'Wenn das alte Icon weg soll', p: ['Icon lange halten → „App entfernen". Zeigt es kein Minus, ist das iPad verwaltet: Einstellungen → Bildschirmzeit → Beschränkungen → Apps löschen → Erlauben, oder die Verwaltung fragen. Vorher sichern, falls Inhalte am alten Icon hängen.'] }
    ]
  },
  {
    id: 'tasten', titel: 'Tasten & Gesten', icon: 'feinheiten', raum: '',
    kurz: 'Die wenigen Griffe, die überall gelten.',
    abschnitte: [
      { t: 'Tastatur', p: [
        'Strg/⌘ + K — Suche. Escape — schließt Fenster, Menüs, den Schreibraum und die Suche (immer nur die oberste Lage).',
        'Im Schreibraum: Strg/⌘ + S friert den Stand ein. Strg/⌘ + F öffnet Suchen & Ersetzen. Strg/⌘ + Enter schließt und speichert. Tab rückt ein, statt aus dem Text zu springen.',
        'In Schnipseln und im Faden schickt Enter ab, Umschalt+Enter macht eine neue Zeile. In Menüs wandern die Pfeiltasten, die Ziffern 1–9 wählen direkt.',
        'Strg/⌘ + Enter legt Wörter in die Kiste.'
      ] },
      { t: 'Finger und Maus', p: ['Tippen öffnet. Lange halten (oder Rechtsklick) öffnet das Menü. Ziehen verschiebt Zettel, Fotos, Blasen, freie Schnipsel. Szenenkarten: kurz halten, bis sie sich heben, dann ziehen. Doppeltipp auf ein Brett setzt eine Blase. Zwei Finger kneifen zoomt das Brett. Wischen auf einem Zettel-Griff ändert die Größe.'] }
    ]
  },
  {
    id: 'woerterbuch', titel: 'Kleines Wörterbuch', icon: 'lesen', raum: '',
    kurz: 'Die Begriffe, wie VANI sie meint.',
    abschnitte: [
      { t: 'Schnipsel', p: ['Ein kurzer Gedanke an mich selbst, im Chat mit mir.'] },
      { t: 'Blatt', p: ['Ein einzelner Text im Stapel, ohne Heft und ohne Projekt.'] },
      { t: 'Heft, Seite, Zettel', p: ['Ein Heft hat Seiten; auf Seiten kleben Zettel, Fotos und Kritzeleien.'] },
      { t: 'Projekt, Kapitel, Szene', p: ['Ein Projekt ist das Große; es hat Kapitel; Kapitel haben Szenen als Karten.'] },
      { t: 'Brett, Blase, Faden (im Cluster)', p: ['Ein Brett ist eine Denkfläche, Blasen sind Gedanken darauf, Fäden verbinden Blasen.'] },
      { t: 'Faden (der Raum)', p: ['Der alte Chat an Vani — verschlüsselt, mit Passwort hereinzuholen.'] },
      { t: 'Funke, Funkeln, Funkenkiste', p: ['Ein Funke ist ein Schreibanstoß. Gemerkte Funken heißen Funkeln. Meine eigenen liegen in der Funkenkiste.'] },
      { t: 'Wortkiste', p: ['Eine kleine Wortsammlung mit Namen.'] },
      { t: 'Stand', p: ['Eine eingefrorene Fassung eines Textes.'] },
      { t: 'Kerze', p: ['Ein Schreib-Sprint mit Zeit: 10, 20 oder 45 Minuten.'] },
      { t: 'Schreibfeuer, Strähne', p: ['Die Wörter von heute und die Tage in Folge, an denen ich geschrieben habe.'] },
      { t: 'Stimmung', p: ['Das Farbthema der App.'] },
      { t: 'Profil, Tür', p: ['Ein Bestand auf dem Gerät mit eigenem Passwort.'] },
      { t: 'Bereich, Kopplungscode', p: ['Der verschlüsselte Sync-Stapel und der Schlüssel dazu.'] },
      { t: 'Papierkorb', p: ['Wo Gelöschtes mindestens 30 Tage wartet.'] }
    ]
  },
  {
    id: 'fragen', titel: 'Fragen, die ich mir gestellt habe', icon: 'fund', raum: '',
    kurz: 'Kurze Antworten auf das, was mir selbst nicht sofort klar war.',
    abschnitte: [
      { t: 'Ist das alles privat?', p: ['Ja. Alles liegt auf meinem Gerät. Kein Konto, keine Cloud, keine Auswertung. Nur wenn ich selbst einen Sync-Bereich anlege, geht verschlüsselter Text zu einem Dienst — und auch dann kann niemand außer meinen Geräten hineinsehen.'] },
      { t: 'Brauche ich Internet?', p: ['Nein. Nur für Updates, Sync und das einmalige Hereinholen des Fadens.'] },
      { t: 'Warum sehe ich am Laptop nichts vom iPad?', p: ['Weil jedes Gerät für sich arbeitet, bis ich es kopple. Siehe „Mehrere Geräte".'] },
      { t: 'Wo ist mein Text hin?', p: ['Suche (Strg/⌘ + K). Papierkorb in den Feinheiten. Frühere Stände im Schreibraum. Zuhause unter „Weiterschreiben".'] },
      { t: 'Warum ist der Klang stumm?', p: ['Einmal irgendwo tippen, dann „Ton prüfen" oder „Klang neu wecken". Auf dem iPad ist das eine Systemgrenze.'] },
      { t: 'Wie bekomme ich Texte heraus?', p: ['Teilen (im Schreibraum, im Blatt-Menü, in der Szene), Leseansicht „Kopieren" oder „Als Datei", Feinheiten „Nur Texte kopieren", „Alles sichern" für alles mit Bildern.'] },
      { t: 'Wie lösche ich wirklich?', p: ['Löschen legt in den Papierkorb. Erst „Endgültig leeren" in den Feinheiten löscht wirklich.'] },
      { t: 'Was ist mit der Desktop-App?', p: ['Dieselbe App in einem eigenen Fenster, mit sicher verwahrtem Sync-Geheimnis. Updates über eine neue Setup-Datei.'] },
      { t: 'Passwort vergessen?', p: ['Lässt sich nicht zurücksetzen — es gibt keinen Server dafür. Darum sichern. Mit einer Sicherung geht es in ein neues Profil.'] },
      { t: 'Was ist mit Spotify?', p: ['Gibt es nicht. Der Klang in VANI kommt ganz aus VANI.'] }
    ]
  }
];

/* Pure Suche über die Anleitung: liefert Kapitel mit nur den passenden Abschnitten. */
function anleitungSuche(q) {
  const n = normalisiere(String(q || '').trim());
  if (!n) return ANLEITUNG.map((k) => ({ kapitel: k, abschnitte: k.abschnitte }));
  const passt = (s) => normalisiere([s.t, ...(s.p || []), ...(s.s || []), s.b || '', s.tipp || ''].join(' ')).includes(n);
  const raus = [];
  for (const k of ANLEITUNG) {
    const kapitelPasst = normalisiere(k.titel + ' ' + (k.kurz || '')).includes(n);
    const treffer = k.abschnitte.filter(passt);
    if (kapitelPasst && !treffer.length) raus.push({ kapitel: k, abschnitte: k.abschnitte });
    else if (treffer.length) raus.push({ kapitel: k, abschnitte: treffer });
  }
  return raus;
}

/* Markiert das Gesuchte im bereits entschärften Text. */
function anleitungHervorheben(text, q) {
  const sicher = esc(text);
  const roh = String(q || '').trim();
  if (roh.length < 2) return sicher;
  const muster = new RegExp(esc(roh).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return sicher.replace(muster, (m) => '<mark>' + m + '</mark>');
}

let _anleitung = null;
function schliesseAnleitung() {
  if (!_anleitung) return;
  document.removeEventListener('keydown', _anleitung.taste, true);
  _anleitung.bogen.remove();
  _anleitung = null;
}

function oeffneAnleitung(kapitelId) {
  if (_anleitung) schliesseAnleitung();
  const suchfeld = el('input', { type: 'search', placeholder: 'In der Anleitung suchen …', 'aria-label': 'In der Anleitung suchen' });
  const kapitelnav = el('nav', { class: 'anleitung-nav', 'aria-label': 'Kapitel' });
  const inhalt = el('div', { class: 'anleitung-inhalt' });
  const zaehler = el('span', { class: 'anleitung-zaehler' });
  const kopf = el('div', { class: 'anleitung-kopf' },
    el('div', { class: 'anleitung-titelzeile' },
      el('span', { class: 'anleitung-marke' }, 'V'),
      el('h1', {}, 'Die Anleitung', el('small', {}, 'alles, was VANI kann — von mir aufgeschrieben')),
      el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Anleitung zumachen', onclick: () => schliesseAnleitung() })),
    el('div', { class: 'anleitung-suchzeile' }, el('span', { html: ik('suche'), style: 'display:flex;color:var(--blass)' }), suchfeld, zaehler));
  const bogen = el('div', { class: 'anleitung-bogen', role: 'dialog', 'aria-label': 'Die Anleitung' }, kopf, el('div', { class: 'anleitung-koerper' }, kapitelnav, inhalt));

  const springe = (id) => {
    const ziel = inhalt.querySelector('[data-kapitel="' + id + '"]');
    if (ziel) ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const raumAuf = (k) => {
    schliesseAnleitung();
    if (k.raum === 'suche') { oeffneSuche(); return; }
    location.hash = '#/' + (k.raum || '');
  };

  function baue() {
    const q = suchfeld.value.trim();
    const funde = anleitungSuche(q);
    kapitelnav.innerHTML = ''; inhalt.innerHTML = '';
    for (const { kapitel } of funde) {
      kapitelnav.append(el('button', { class: 'anleitung-navknopf', onclick: () => springe(kapitel.id) },
        el('span', { html: ik(kapitel.icon || 'lesen'), style: 'display:flex' }), kapitel.titel));
    }
    let abschnitte = 0;
    for (const { kapitel, abschnitte: liste } of funde) {
      const block = el('section', { class: 'anleitung-kapitel', 'data-kapitel': kapitel.id });
      block.append(el('div', { class: 'anleitung-kapitelkopf' },
        el('span', { class: 'anleitung-kapitelicon', html: ik(kapitel.icon || 'lesen') }),
        el('h2', { html: anleitungHervorheben(kapitel.titel, q) }),
        kapitel.raum !== '' || kapitel.id === 'zuhause'
          ? el('button', { class: 'knopf zart anleitung-springen', onclick: () => raumAuf(kapitel) }, el('span', { html: ik('rechts'), style: 'display:flex' }), 'Aufschlagen')
          : null));
      if (kapitel.kurz) block.append(el('p', { class: 'anleitung-kurz', html: anleitungHervorheben(kapitel.kurz, q) }));
      for (const a of liste) {
        abschnitte++;
        const art = el('article', { class: 'anleitung-abschnitt' }, el('h3', { html: anleitungHervorheben(a.t, q) }));
        for (const p of a.p || []) art.append(el('p', { html: anleitungHervorheben(p, q) }));
        if (a.s && a.s.length) art.append(el('ol', {}, a.s.map((s) => el('li', { html: anleitungHervorheben(s, q) }))));
        if (a.b) art.append(el('div', { class: 'anleitung-beispiel' }, el('b', {}, 'Beispiel'), el('span', { html: anleitungHervorheben(a.b, q) })));
        if (a.tipp) art.append(el('div', { class: 'anleitung-tipp' }, el('b', {}, 'Merke'), el('span', { html: anleitungHervorheben(a.tipp, q) })));
        block.append(art);
      }
      inhalt.append(block);
    }
    if (!funde.length) inhalt.append(el('div', { class: 'leer' }, 'Dazu steht nichts in der Anleitung.', el('div', { class: 'klein' }, 'Vielleicht heißt es hier anders — die Suche in der Leiste findet dafür alles, was ich geschrieben habe.')));
    zaehler.textContent = q ? (abschnitte === 1 ? '1 Stelle' : abschnitte + ' Stellen') : '';
  }
  suchfeld.addEventListener('input', entprellt(baue, 90));
  const taste = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); schliesseAnleitung(); } };
  document.addEventListener('keydown', taste, true);
  document.body.append(bogen);
  _anleitung = { bogen, taste };
  baue();
  if (kapitelId) requestAnimationFrame(() => springe(kapitelId));
}
