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
  'Das Gewitter kommt näher, und mit ihm ein Geruch aus der Kindheit.'
];
const FUNKE_WER = [
  'Eine Frau, die Karten für Orte zeichnet, die es nicht mehr gibt,',
  'Ein Junge mit einem geliehenen Namen,',
  'Die letzte Leuchtturmwärterin,',
  'Ein Übersetzer, der an einem einzigen Wort scheitert,',
  'Jemand, der nie zweimal denselben Weg geht,',
  'Eine alte Frau, die alle Geburtstage der Stadt auswendig kennt,',
  'Ein Kind, das Dinge findet, bevor sie verloren gehen,',
  'Der Mann, der die Bahnhofsuhr von Hand stellt,'
];
const FUNKE_WO = [
  'in einem Haus, das nachts die Zimmer tauscht,',
  'auf einer Fähre, die nur bei Nebel fährt,',
  'in der letzten Telefonzelle des Landes,',
  'in einer Bibliothek, in der geflüstert wird, obwohl sie leer ist,',
  'am Rand eines Dorfes, das auf keiner Karte steht,',
  'in einem Sommer, der nicht enden will,',
  'im Treppenhaus zwischen zwei Wohnungen,',
  'an einem Bahnsteig, an dem nie ein Zug hält,'
];
const FUNKE_ABER = [
  'aber jemand hat die Wahrheit zuerst erzählt.',
  'aber der Brief kommt zwölf Jahre zu spät an.',
  'aber das Meer gibt nichts zurück.',
  'aber diesmal brennt kein Licht im Fenster.',
  'aber der Name im Register ist der eigene.',
  'aber heute klopft es zweimal.',
  'aber der Schlüssel passt plötzlich nicht mehr.',
  'aber es liegt Schnee. Mitten im August.'
];
function neuerFunke(kombi) {
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

const HEFTFARBEN = ['#8c5a3b', '#5b4a6e', '#3f6258', '#7a4048', '#41597a', '#736a34', '#4a4a52', '#966030'];
const SZENENFARBEN = ['', '#b0552f', '#5f7752', '#b8923f', '#41597a', '#7a4048'];
const PROJEKT_ARTEN = ['Roman', 'Erzählung', 'Sammlung', 'Gedichte', 'Welt', 'Anderes'];
