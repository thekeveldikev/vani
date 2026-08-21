/* ================================================================
   VANI — Stimmen: Grüße, Funken, Saatworte
   ================================================================ */

const GRUESSE = {
  frueh: ['Guten Morgen.', 'Früh wach.', 'Der Tag ist noch leer.'],
  mittag: ['Mittendrin.', 'Guten Tag.', 'Zeit für ein paar Zeilen.'],
  nachmittag: ['Nachmittagslicht.', 'Schön, dass du da bist.', 'Weiter im Text.'],
  abend: ['Der Abend gehört den Seiten.', 'Guten Abend.', 'Zeit, die Tür zuzumachen.'],
  nacht: ['Noch wach.', 'Die beste Stunde.', 'Ganz leise jetzt.']
};
const GRUSS_UNTEN = [
  'Die Seiten warten schon.',
  'Alles ist da, wo du es gelassen hast.',
  'Kein Internet nötig. Nur du.',
  'Ein Satz reicht für den Anfang.',
  'Was liegen bleibt, bleibt liegen. Nichts verschwindet.',
  'Irgendwo hier liegt ein angefangener Gedanke.'
];
const GRUSS_LANGE_WEG = 'Schön, dass du wieder da bist.';

function grussZeile() {
  const h = new Date().getHours();
  const topf = h < 5 ? GRUESSE.nacht : h < 11 ? GRUESSE.frueh : h < 14 ? GRUESSE.mittag : h < 18 ? GRUESSE.nachmittag : h < 23 ? GRUESSE.abend : GRUESSE.nacht;
  const eigene = vomTyp('gruss').map((g) => g.text).filter(Boolean);
  if (eigene.length && Math.random() < .35) return zufall(eigene);
  return zufall(topf);
}

const FUNKEN = [
  'Ein Ort, an den niemand zurückkehrt — außer einmal im Jahr.',
  'Jemand findet einen Brief, der eindeutig an ihn gerichtet ist. Nur ist er hundert Jahre alt.',
  'Das Haus tauscht nachts die Zimmer. Alle tun so, als wäre das normal.',
  'Zwei Menschen, die sich jeden Tag sehen, sprechen zum ersten Mal.',
  'Etwas, das man aus Versehen behalten hat. Und jetzt ist es zu spät, es zurückzugeben.',
  'Die letzte Nacht in einer Wohnung. Die Wände sind schon leer.',
  'Ein Gespräch, das nur aus dem besteht, was nicht gesagt wird.',
  'Der Moment, in dem eine Lüge zur Wahrheit wird, weil alle sie glauben.',
  'Jemand kann nur an einem einzigen Ort auf der Welt schlafen.',
  'Eine Landkarte mit einem Ort, der auf keiner anderen Karte ist.',
  'Das Meer gibt etwas zurück. Nicht das, was man vermisst hat.',
  'Ein Beruf, den es nicht gibt: Was macht die Person den ganzen Tag?',
  'Der erste Schnee, aus der Sicht von jemandem, der ihn zum letzten Mal sieht.',
  'Ein Zug hält an einem Bahnhof, der nicht im Fahrplan steht.',
  'Jemand erbt ein Notizbuch. Die Hälfte ist schon vollgeschrieben — von wem?',
  'Was in der Woche zwischen den Jahren passiert, zählt nicht. Sagt man.',
  'Der Geruch, der einen sofort zehn Jahre zurückwirft.',
  'Zwei Fremde warten zusammen. Worauf, weiß nur einer von beiden.',
  'Eine Stadt, in der Vergessen als Höflichkeit gilt.',
  'Das Licht im Nachbarhaus geht seit drei Nächten nicht mehr aus.',
  'Jemand schreibt seit Jahren Briefe an eine Adresse, die es nicht gibt. Heute kommt eine Antwort.',
  'Das Haus wird verkauft. Beim Ausräumen findet sich eine Tür, die in keinem Grundriss steht.',
  'Eine Stimme im Radio, mitten in der Nacht, sagt deinen Namen. Nur einmal.',
  'Der Jahrmarkt kommt dieses Jahr einen Tag zu früh. Niemand hat ihn bestellt.',
  'Zwei Geschwister teilen sich eine Erinnerung — aber jede Hälfte erzählt sie anders.',
  'In der Bibliothek steht ein Buch, das jedes Mal anders endet.',
  'Jemand kehrt in die alte Wohnung zurück. Der eigene Name steht noch am Klingelschild — frisch gedruckt.',
  'Der Fluss friert zum ersten Mal seit hundert Jahren zu. Etwas liegt im Eis.',
  'Ein Kind fragt: „Wo warst du, bevor du hier warst?" Und niemand am Tisch kann antworten.',
  'Die letzte Nachricht wurde nie abgeschickt. Der Entwurf ist noch da.',
  'Jemand sammelt die letzten Sätze fremder Gespräche. Heute fällt einer, der alles ändert.',
  'Ein Sommer, in dem alle Uhren der Stadt eine Minute nachgehen. Nur eine nicht.',
  'Das Gewitter kommt näher, und mit ihm ein Geruch aus der Kindheit.',
  'Im Nachlass liegt eine Kassette, auf der jemand die Zukunft voraussagt — mit deiner Stimme.',
  'Eine Person erkennt auf einem Flohmarkt etwas wieder, das sie nie besessen haben dürfte.',
  'Alle Fenster des Hauses zeigen dieselbe Aussicht. Nur eines zeigt gestern.',
  'Ein Kind erfindet einen unsichtbaren Freund. Am Elternabend sitzt dessen Mutter im Flur.',
  'Der Schlüssel wurde vererbt, aber niemand weiß, zu welcher Tür er gehört.',
  'Ein ganzes Dorf hat denselben Traum und verschweigt ihn am Morgen.',
  'Im Hotelzimmer klingelt ein Telefon, obwohl keines angeschlossen ist.',
  'Jemand bekommt jedes Jahr am selben Tag eine Postkarte ohne Absender. Dieses Jahr bleibt sie leer.',
  'Die berühmteste Fotografie der Stadt zeigt im Hintergrund jemanden, der heute noch genauso aussieht.',
  'Eine Schauspielerin vergisst nach der Vorstellung, welche ihrer Erinnerungen wirklich ihre sind.',
  'Der Busfahrer hält jeden Abend an einer Haltestelle, an der nie jemand wartet — bis heute.',
  'Zwei Feinde müssen gemeinsam eine Nachricht überbringen, die keiner von beiden gelesen haben darf.',
  'Die Wohnung über dir steht leer. Trotzdem wird dort jede Nacht ein Stuhl verrückt.',
  'Jemand findet den ersten Satz eines Romans in der eigenen Handschrift. Der Rest ist verbrannt.',
  'Ein Lied taucht in drei Lebensgeschichten auf, die nichts miteinander zu tun haben dürften.',
  'Der Hund bringt etwas aus dem Wald zurück, das vor zwanzig Jahren vergraben wurde.',
  'Eine Stadt feiert einen Feiertag, dessen Anlass niemand mehr kennt.',
  'Jemand ist berühmt für eine Heldentat, an die er sich nicht erinnern kann.',
  'Das letzte Kino zeigt einen Film, in dem das Publikum selbst vorkommt.',
  'In der Nacht vor dem Umzug erscheint eine Nachricht unter der Tapete.',
  'Eine Person hört zum ersten Mal die eigene Stimme als Kind und erkennt ein Versprechen wieder.',
  'Der Briefträger liefert einen Brief an eine Person, die erst morgen einzieht.',
  'Am Ende jeder Straße steht dasselbe rote Auto.',
  'Ein Fremder kennt den Spitznamen, den seit der Kindheit niemand mehr benutzt hat.',
  'Eine Familie erbt ein Haus samt einer Regel: Nach Mitternacht darf niemand den eigenen Namen sagen.',
  'Der Strom fällt aus. Im schwarzen Fenster spiegelt sich ein Zimmer, das hinter dir nicht existiert.',
  'Jemand schreibt die Wahrheit in ein Tagebuch und entdeckt am Morgen Korrekturen am Rand.',
  'Zwei Menschen erinnern sich an dieselbe erste Begegnung — an verschiedenen Orten.',
  'Eine Bibliothekarin findet Rückgabekarten aus einem Jahr, das noch nicht begonnen hat.',
  'Der Schnee bewahrt Fußspuren, die mitten auf dem See beginnen.',
  'Ein Musiker spielt eine Melodie, die nur Menschen erkennen, die etwas verloren haben.',
  'Die Hauptfigur weiß, dass sie in einer Geschichte lebt — aber nicht, in welcher.',
  'Jemand kommt nach Hause und alle Fotos zeigen plötzlich eine Person weniger.',
  'Ein altes Navigationsgerät führt nur noch zu Orten, an denen Abschiede stattgefunden haben.',
  'Die Nachtwache im Museum bemerkt, dass auf einem Gemälde jeden Morgen eine Tür weiter offen steht.',
  'Ein Kind schickt eine Flaschenpost den Fluss hinab. Sie kommt am selben Abend von oben zurück.',
  'Jemand erhält eine Rechnung für eine Reise, die nie stattgefunden hat.',
  'Der letzte Satz steht fest. Nur die Geschichte weigert sich, dorthin zu gehen.',
  'Eine Freundschaft beginnt mit einem gestohlenen Gegenstand und endet mit seiner Rückgabe.',
  'Am Bahnsteig verabschieden sich zwei Menschen. Nur einer weiß, dass der Zug nicht existiert.'
];
const FUNKE_WER = [
  'Eine Frau, die Karten für Orte zeichnet, die es nicht mehr gibt,',
  'Ein Junge mit einem geliehenen Namen,',
  'Die letzte Leuchtturmwärterin,',
  'Ein Übersetzer, der an einem einzigen Wort scheitert,',
  'Jemand, der nie zweimal denselben Weg geht,',
  'Eine alte Frau, die alle Geburtstage der Stadt auswendig kennt,',
  'Ein Kind, das Dinge findet, bevor sie verloren gehen,',
  'Der Mann, der die Bahnhofsuhr von Hand stellt,',
  'Eine Bühnenbildnerin, die in fremden Zimmern Erinnerungen versteckt,',
  'Der Sohn eines Mannes, über den alle lügen,',
  'Eine Diebin, die nur Dinge stiehlt, die niemand vermisst,',
  'Ein Pilot, der sich weigert, denselben Himmel zweimal zu überfliegen,',
  'Die jüngste Person in einer sehr alten Familie,',
  'Ein Polizist, der den eigenen Vermisstenfall bearbeitet,',
  'Eine Musikerin, die jedes Lied nur einmal spielen kann,',
  'Jemand, der fremde letzte Sätze sammelt,'
];
const FUNKE_WO = [
  'in einem Haus, das nachts die Zimmer tauscht,',
  'auf einer Fähre, die nur bei Nebel fährt,',
  'in der letzten Telefonzelle des Landes,',
  'in einer Bibliothek, in der geflüstert wird, obwohl sie leer ist,',
  'am Rand eines Dorfes, das auf keiner Karte steht,',
  'in einem Sommer, der nicht enden will,',
  'im Treppenhaus zwischen zwei Wohnungen,',
  'an einem Bahnsteig, an dem nie ein Zug hält,',
  'hinter der Bühne eines längst geschlossenen Theaters,',
  'in einem Hotel, dessen Zimmernummern sich jede Nacht ändern,',
  'auf einer Brücke, die nur in eine Richtung führt,',
  'im Archiv einer Stadt, die ihren Namen gewechselt hat,',
  'in einem Tunnel unter schwarzem Wasser,',
  'in einem roten Buch voller fremder Handschriften,',
  'auf einem Friedhof, auf dem ein Grab zu viel steht,',
  'in einem Auto, das seit Jahren am selben Straßenrand wartet,'
];
const FUNKE_ABER = [
  'aber jemand hat die Wahrheit zuerst erzählt.',
  'aber der Brief kommt zwölf Jahre zu spät an.',
  'aber das Meer gibt nichts zurück.',
  'aber diesmal brennt kein Licht im Fenster.',
  'aber der Name im Register ist der eigene.',
  'aber heute klopft es zweimal.',
  'aber der Schlüssel passt plötzlich nicht mehr.',
  'aber es liegt Schnee. Mitten im August.',
  'aber die Aufnahme kennt das Ende schon.',
  'aber heute erinnert sich niemand an diese Person.',
  'aber das Licht geht an, bevor jemand den Schalter berührt.',
  'aber auf der Rückseite steht das morgige Datum.',
  'aber beide haben denselben Traum verschwiegen.',
  'aber der letzte Satz wurde von jemand anderem geschrieben.',
  'aber die Tür war die ganze Zeit offen.',
  'aber diesmal kommt eine Antwort.'
];
const FUNKE_FRAGEN = [
  'Welche Wahrheit würde diese Figur nur einem Fremden sagen?',
  'Was ist im Hintergrund passiert, während alle auf die Hauptsache sahen?',
  'Welcher Gegenstand weiß mehr über die Geschichte als ihre Figuren?',
  'Was wäre der erste Satz, wenn du das Ende schon kennen würdest?',
  'Wovor hat die mutigste Person im Raum heimlich Angst?',
  'Welche Erinnerung teilen zwei Figuren, obwohl nur eine dabei war?',
  'Was will jemand unbedingt zurückgeben — und warum geht es nicht?',
  'Welche Tür würde deine Figur niemals freiwillig öffnen?',
  'Wer fehlt in dieser Szene, ist aber in jedem Satz spürbar?',
  'Was geschieht fünf Minuten nach dem vermeintlichen Ende?'
];
const FUNKE_FORMEN = [
  'Schreib nur den ersten und den letzten Satz einer Szene. Lass den Weg dazwischen noch dunkel.',
  'Schreib eine Seite ausschließlich aus Dingen, die niemand ausspricht.',
  'Beginne mit einem Geräusch. Verrate erst im letzten Absatz, woher es kam.',
  'Schreib dieselbe Minute zweimal — aus zwei Erinnerungen, die einander widersprechen.',
  'Lass einen Gegenstand die Szene erzählen, ohne ihn lebendig zu machen.',
  'Schreib eine Liste, die langsam zu einer Geschichte wird.',
  'Schreib einen Abschied, in dem niemand geht.',
  'Beginne mit: „Ich wusste damals noch nicht, dass …" — und streich den Satz später wieder.',
  'Schreib eine Szene rückwärts: vom letzten Bild bis zum ersten Blick.',
  'Lass den Hintergrund die Wahrheit erzählen, während vorne gelogen wird.'
];
const FUNKE_SAETZE = [
  '„Sag mir nur, warum du das Licht angelassen hast."',
  'Der Schlüssel war warm, als hätte ihn gerade jemand gehalten.',
  'Im Rückspiegel saß niemand, aber der Gurt war geschlossen.',
  'Sie hatte sich vorgenommen, seinen Namen heute nicht zu sagen.',
  'Der erste Schuss war vielleicht nur das Klingeln in seinen Ohren.',
  'Auf dem Umschlag stand eine Adresse, die es nur in ihrer Erinnerung gab.',
  '„Du warst schon einmal hier", sagte das Kind.',
  'Als die Musik aufhörte, hörten sie das Klopfen.',
  'Er lächelte so, als wäre dies eine gute Nachricht.',
  'Die Geschichte kannte den Weg, auch wenn ich ihn nicht kannte.'
];
function neuerFunke(kombi, art) {
  if (art === 'frage') return zufall(FUNKE_FRAGEN);
  if (art === 'form') return zufall(FUNKE_FORMEN);
  if (art === 'satz') return zufall(FUNKE_SAETZE);
  if (kombi) return zufall(FUNKE_WER) + ' ' + zufall(FUNKE_WO) + ' ' + zufall(FUNKE_ABER);
  return zufall(FUNKEN);
}
function funkeDesTages() {
  const k = tagKey();
  let h = 0;
  for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FUNKEN[h % FUNKEN.length];
}

const SAATWORTE = ['flirren', 'windschief', 'Nachklang', 'Lichtsaum', 'aufgeraut', 'zwischenblau', 'verwunschen', 'Splittergold', 'seidenmatt', 'herzwärts'];

const HEFTFARBEN = [
  '#8c5a3b', '#6f4334', '#9a7657', '#b58d67', '#5b4a6e', '#75617f',
  '#3f6258', '#55776d', '#6d7d69', '#7a4048', '#955a5f', '#41597a',
  '#5c718a', '#736a34', '#8b8050', '#4a4a52', '#6b6a70', '#28333c',
  '#a56c49', '#c0a278', '#6c5848', '#344a43', '#583f52', '#38465d'
];
const HEFT_MUSTER = [
  ['schlicht', 'Schlicht'], ['leinen', 'Leinen'], ['diagonal', 'Diagonal'],
  ['punkte', 'Punkte'], ['rahmen', 'Rahmen'], ['welle', 'Wellen']
];
const SZENENFARBEN = ['', '#b0552f', '#5f7752', '#b8923f', '#41597a', '#7a4048'];
const PROJEKT_ARTEN = ['Roman', 'Erzählung', 'Sammlung', 'Gedichte', 'Welt', 'Anderes'];
