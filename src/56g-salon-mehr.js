/* ===================== 56g — DER SALON: MEHR ÜBER DIE LEUTE, MEHR THEMEN, MEHR AUFGABEN =====================
   Längere Texte „Über“ jede Stimme (warm, genau, zum Lesen gemacht), acht Themen mehr
   für den Rat (Titel, Perspektive, Tempo, Welt, Humor, Recherche, Zeigen, Loslassen) mit
   je einem Kern je Stimme (englische Stimmen zweisprachig, parallel), und Aufgaben in
   kleinen Unterkategorien. Wird in 56-salon.js eingemischt. */

const SALON_UEBER = {
  king: [
    'Stephen King wurde 1947 in Portland, Maine, geboren und ist dort, im Nordosten, geblieben — die Kleinstädte, Wälder und langen Winter seiner Bücher sind seine eigenen. Er schrieb als Kind Geschichten ab und erfand sie dann selbst, verkaufte sie in der Schule, sammelte später Ablehnungszettel an einem Nagel über dem Schreibtisch. Sein Durchbruch „Carrie“ (1974) entstand, als er als Lehrer arbeitete und in einem Wohnwagen lebte: Die ersten Seiten hatte er entnervt in den Papierkorb geworfen, seine Frau Tabitha holte sie wieder heraus und sagte, er solle weitermachen. Der Vorschuss betrug 2.500 Dollar — die Taschenbuchrechte brachten später vierhunderttausend.',
    'Seitdem hat er über sechzig Romane geschrieben — Horror, ja, aber eigentlich Bücher über Menschen in Bedrängnis: Kinder, Schriftsteller, Kleinstädte, Ehen. Sein Handwerksbuch „Das Leben und das Schreiben“ (On Writing, 2000) ist vielleicht das ehrlichste, das es gibt: keine Zauberei, sondern Tür zu, jeden Tag, Adverbien raus, zweiter Entwurf gleich erster minus zehn Prozent. Er redet über Schreiben wie ein Handwerker über Holz.',
    'Im Salon ist er der, der dich an den Tisch schickt. Er glaubt an Arbeit, an Lesen, an Angst als Rohstoff, und er hält dich für klug. Wenn er „listen“ sagt, meint er: Ich hab das alles selbst falsch gemacht, spar dir den Umweg.',
    'Wenn er deine Seiten liest, sucht er zuerst nach der Stelle, an der jemand etwas tut, das er nicht erklären kann. Dort tippt er mit dem Finger drauf und sagt: „Da. Genau da war ich drin.“ Alles davor darfst du streichen.'
  ],
  kaestner: [
    'Erich Kästner, 1899 in Dresden geboren, hat als Kind zugesehen, wie seine Mutter als Friseurin das Geld verdiente, und hat diese Kindheit in „Als ich ein kleiner Junge war“ so genau erzählt, dass man die Treppen im Haus riecht. Er wurde Journalist in Berlin, schrieb Gedichte, die man sich merkt, weil sie wehtun und dabei lächeln, und dann die Kinderbücher, die alles veränderten: „Emil und die Detektive“ (1929), „Pünktchen und Anton“, „Das fliegende Klassenzimmer“, „Das doppelte Lottchen“.',
    'Seine Bücher wurden 1933 verbrannt; er blieb in Deutschland und schrieb unter Pseudonym weiter, auch Drehbücher. Nach dem Krieg lebte er in München, gründete ein Kabarett, schrieb weiter für Kinder und gegen die Dummheit. Sein Satz „Es gibt nichts Gutes, außer: man tut es“ steht über allem, was er geschrieben hat.',
    'Im Salon siezt er dich — aus Respekt, nicht aus Distanz. Er mag klare Sätze, genaue Gefühle und Leute, die ihr Lachen nicht verlieren. Er glaubt, dass Kinder klug sind und Erwachsene es mal waren.',
    'Wenn er Ihre Seiten liest, zählt er heimlich die Adjektive und freut sich über jeden Satz, der ohne auskommt. Und er merkt sich die Stelle, an der jemand etwas Freundliches tut, ohne davon zu reden — die liest er zweimal.'
  ],
  funke: [
    'Cornelia Funke, geboren 1958 in Dorsten, wollte eigentlich Astronautin werden, dann Pilotin, wurde Sozialpädagogin und Illustratorin — und fing an zu schreiben, weil ihr die Bücher, die sie illustrieren sollte, zu langweilig waren. Dann kamen „Herr der Diebe“, „Tintenherz“ (2003), „Tintenblut“, „Tintentod“, „Reckless“, die „Wilden Hühner“, „Drachenreiter“ — Bücher, in denen das Lesen selbst zur Magie wird und Figuren aus den Seiten steigen.',
    'Sie lebte lange in Hamburg, dann in Los Angeles, heute in der Toskana bei Volterra, in einem Haus mit Garten, in dem sie schreibt, zeichnet und Gäste hat. Sie spricht über ihre Figuren, als wären sie Freunde, die vorbeikommen, und über Bücher, als wären sie lebendig: Man muss sie gießen.',
    'Im Salon ist sie die, die dir sagt: Trau der Tinte. Sie liebt Details — Gegenstände, Gerüche, Geräusche — und sie glaubt, dass eine Geschichte älter ist als die, die sie erzählt. Bei ihr ist die Tür immer offen.',
    'Wenn sie deine Seiten liest, sucht sie nach dem Gegenstand, der in jeder Szene wieder auftaucht. Wenn sie ihn findet, lächelt sie, weil sie weiß: Da hängt die Geschichte dran, und du hast es selbst noch nicht gemerkt.'
  ],
  rothfuss: [
    'Patrick Rothfuss, geboren 1973 in Wisconsin, begann seinen ersten Roman als Student und schrieb rund sieben Jahre daran, während er nebenbei Anthropologie, Philosophie, Geschichte und Alchemie studierte; danach kamen zwei Jahre Absagen von so ziemlich jeder Agentur, bis ein Stück des zweiten Bandes einen Wettbewerb gewann und die Tür aufging. Vom ersten Entwurf bis zum gedruckten „Namen des Windes“ (2007) vergingen über zehn Jahre. Die Geschichte von Kvothe, erzählt von Kvothe selbst in einem Gasthaus, ist eine Legende und ihre Korrektur zugleich — und ein Buch über Musik, Namen, Stille und das Lernen.',
    'Er ist bekannt dafür, langsam zu sein, und steht dazu: Ein Buch, das zwei Jahre länger braucht, ist zwei Jahre besser. Er sammelt mit seiner Stiftung Worldbuilders Geld für Heifer International, spielt, kocht, ist Vater — und spricht über Schreiben wie ein Musiker über Üben: Klang zuerst, dann alles andere.',
    'Im Salon ist er der Leise. Er sagt „Hm.“ und meint es ernst. Er rät dir, laut zu lesen, Wörter zu wiegen und Lücken zu lassen, weil die Leser klüger sind als alle Verlage. Und er glaubt an Geduld mehr als an Talent.',
    'Wenn er deine Seiten liest, liest er sie laut — halblaut, so wie man ein Instrument stimmt. Und wenn er an einer Stelle zweimal atmen muss, macht er einen kleinen Bleistiftstrich an den Rand. Nicht, weil es falsch ist. Weil es dir gehört und du es noch nicht weißt.'
  ],
  pratchett: [
    'Terry Pratchett (1948–2015) verkaufte seine erste Geschichte mit dreizehn, arbeitete als Journalist und Pressesprecher (für Atomkraftwerke, was er später für den besten Witz seines Lebens hielt) und schrieb nebenbei — bis die Scheibenwelt kam: einundvierzig Romane über eine flache Welt auf vier Elefanten auf einer Schildkröte, in der alles Satire ist und alles Ernst: Tod (der in Großbuchstaben spricht), die Stadtwache, die Hexen, Post und Bank und Presse.',
    'Er trug große schwarze Hüte, schrieb bis zuletzt trotz der Alzheimer-Diagnose (die er „den Botschafter“ nannte), wurde zum Ritter geschlagen und schmiedete sich dafür ein eigenes Schwert: achtzig Kilo Eisenerz vom eigenen Grundstück in Wiltshire, verhüttet in einem selbstgebauten Lehmofen, mit Stücken von Meteoriteisen darin — „Donnerkeil-Eisen“, hochmagisch, das müsse hinein, ob man daran glaube oder nicht. Seine Bücher sind komisch, weil sie genau hinsehen, und traurig, weil sie das auch tun.',
    'Im Salon ist er der, der lacht, damit du hinschaust. Er rät dir 400 Wörter am Tag, auch schlechte, und glaubt, dass Nebenfiguren nicht wissen, dass sie Nebenfiguren sind. Er hält dich für klug — und würde das nie zugeben.',
    'Wenn er deine Seiten liest, sucht er nach der Nebenfigur, die aus Versehen interessant geworden ist. Die kringelt er ein und schreibt daneben: „Diese hier. Sie hat eine Meinung. Frag sie mal.“'
  ],
  lindgren: [
    'Astrid Lindgren (1907–2002) wuchs auf einem Hof bei Vimmerby in Småland auf, in einer Kindheit, die sie später als „geborgen und frei“ beschrieb — und die zu Bullerbü wurde. Mit achtzehn ging sie als junge Mutter nach Stockholm, arbeitete als Sekretärin, und erfand Pippi Langstrumpf für ihre kranke Tochter Karin; das Manuskript wurde erst abgelehnt, dann gedruckt (1945), dann unsterblich.',
    'Dann kamen Kalle Blomquist, Karlsson, Michel aus Lönneberga, Mio, Die Brüder Löwenherz, Ronja Räubertochter: Bücher, die Kinder ernst nehmen, auch wenn sie traurig sind, und die Erwachsene daran erinnern, dass sie mal mutig waren. Sie war Lektorin, Tierschützerin, politische Stimme — und schrieb stenografisch im Bett, jeden Morgen.',
    'Im Salon nennt sie dich „mein Kind“, egal wie alt du bist. Sie glaubt an Ungehorsam aus Liebe, an Freiheit für Kinder, an Bäume zum Klettern. Und sie rät dir: Lauf los.',
    'Wenn sie deine Seiten liest, achtet sie darauf, ob die Kinder darin wirklich Kinder sein dürfen: laut, ungerecht, hungrig, mutig. Und wenn irgendwo ein Erwachsener recht behält, ohne es sich verdient zu haben, macht sie ein winziges Kreuz an den Rand.'
  ],
  tolkien: [
    'J. R. R. Tolkien (1892–1973) wurde in Bloemfontein geboren, wuchs bei Birmingham auf, verlor früh beide Eltern, lernte als Junge Latein, Griechisch, Altenglisch, Gotisch, Finnisch — und erfand Sprachen, bevor er die Völker erfand, die sie sprechen. Er kämpfte 1916 an der Somme und verlor dort zwei seiner engsten Freunde; er wurde Professor für Angelsächsisch in Oxford, Vater von vier Kindern, und schrieb für sie „Der Hobbit“ (1937). Der erste Satz kam ihm Anfang der Dreißigerjahre beim Korrigieren von Prüfungsarbeiten: Er stieß auf eine leere Seite und kritzelte hin, ohne zu wissen, was das sein sollte — „In einer Höhle in der Erde, da lebte ein Hobbit.“',
    'Aus dem Hobbit wuchs „Der Herr der Ringe“ (1954/55), zwölf Jahre Arbeit: eine Welt mit Kalendern, Karten, Genealogien, Liedern und einer Geschichte, die tausende Jahre zurückreicht, bevor Frodo aus der Tür geht. Er las Abende lang den Inklings vor, mit C. S. Lewis als Freund und Kritiker; „Das Silmarillion“ erschien erst nach seinem Tod.',
    'Im Salon ist er der Professor mit der Pfeife. Er mag es langsam, gründlich, verwurzelt; er misstraut Allegorien und Eile, liebt alte Wörter, Karten und Mahlzeiten im Text. Er rät dir: Fang mit der Karte an — und geh weiter.',
    'Wenn er deine Seiten liest, sucht er nach dem, was zwischen den Zeilen älter ist als die Geschichte: ein Name, der eine Vorgeschichte hat, ein Weg, den jemand vor hundert Jahren gebaut hat. Findet er einen, notiert er ihn ordentlich in seiner schönen Handschrift und fragt dich später danach.'
  ],
  blyton: [
    'Enid Blyton (1897–1968) wurde in East Dulwich bei London geboren, wollte Pianistin werden, wurde Lehrerin und begann als junge Frau, Gedichte, Rätsel und Geschichten für Zeitschriften zu schreiben — dann schrieb sie bis zu zehntausend Wörter am Tag, mit der Schreibmaschine auf den Knien, die Augen geschlossen, bis die Figuren „vor dem inneren Auge standen“. Über siebenhundert Bücher: Fünf Freunde, Geheimnis um …, Hanni und Nanni, Dolly, der Zauberwald, Noddy. Sie tippte mit zwei Zeigefingern, plante nie voraus und beschrieb ihr Verfahren als eine private Kinoleinwand im Kopf — und was sie dort sah, schrieb sie auf; ein ganzes Buch konnte in fünf Tagen fertig sein. Rot hielt sie für anregend und legte sich einen roten Schal bereit.',
    'Kritiker mochten sie nicht; Kinder schon — und sie sagte, dass sie sich für die Meinung von Kritikern über zwölf nicht interessiere. Sie lebte in Beaconsfield, mit Garten und Tieren, beantwortete Briefe von Kindern persönlich und wusste ganz genau, was eine Geschichte braucht: ein Picknick, einen Ort ohne Erwachsene, einen Hund, ein Geheimnis und kurze Kapitel.',
    'Im Salon ist sie die Schnelle. Sie rät dir, die Augen zu schließen und zu tippen, was kommt; sie glaubt an Tee, an Taschenlampen unter der Decke und daran, dass einfach schwer ist. Sie ist freundlich und verträgt keinen Schnickschnack.',
    'Wenn sie deine Seiten liest, dann schnell und im Sitzen, mit einer Tasse daneben — und sie merkt sofort, wo ein Kapitel zu spät aufhört. Da macht sie einen Strich und sagt freundlich: „Hier, meine Liebe. Hier hätte die Taschenlampe schon aus sein müssen.“'
  ],
  paolini: [
    'Christopher Paolini, geboren 1983 in Kalifornien, wuchs in Paradise Valley in Montana auf, wurde zu Hause unterrichtet, machte mit fünfzehn seinen Abschluss — und begann im selben Jahr „Eragon“, weil er ein Buch lesen wollte, das es nicht gab. Ein Jahr schrieb er, ein zweites überarbeitete er, ein drittes ging für Korrektur, Satz und Umschlag drauf: Die Familie verlegte das Buch 2002 selbst, er tourte in Ritterkostüm durch Schulen und Buchläden. Dann fiel es dem Schriftsteller Carl Hiaasen in die Hände, Knopf griff zu — und mit neunzehn stand er als jüngster Bestseller-Serienautor im Guinness-Buch. 2003 wurde Eragon ein Welterfolg, dann „Eldest“, „Brisingr“, „Inheritance“ — das Vermächtnis der Drachenreiter.',
    'Er hat seine Welt Alagaësia mit Sprachen, Magie-Regeln, Karten und einer Geschichte versehen, die er als Jugendlicher begann und als Erwachsener vollendete; später kam „To Sleep in a Sea of Stars“, Science-Fiction, und „Murtagh“ (2023). Er spricht offen darüber, wie viel Disziplin, Überarbeiten und Geduld hinter einem Buch stecken, und darüber, dass man mit fünfzehn anfangen darf.',
    'Im Salon ist er der Junge vom Küchentisch, der es geschafft hat und es dir zutraut. Er glaubt an Pläne, die gebrochen werden dürfen, an Regeln für Magie, an lange Spaziergänge. „Scale by scale.“',
    'Wenn er deine Seiten liest, achtet er auf die Stellen, an denen jemand etwas kann — kämpfen, kochen, schweigen, lügen. Und darauf, was es kostet. Wenn nichts kostet, schreibt er an den Rand: „price?“ Nur das eine Wort, mit einem Fragezeichen.'
  ],
  twain: [
    'Mark Twain — eigentlich Samuel Langhorne Clemens (1835–1910) — wuchs in Hannibal am Mississippi auf, wurde Drucker, Lotse auf dem Fluss (daher der Name: „mark twain“ ist die Lotsenmessung für zwei Faden Tiefe), Goldsucher, Journalist, Vortragsreisender, Weltreisender. „Tom Sawyer“ (1876) und „Huckleberry Finn“ (1884) machten ihn zur Stimme Amerikas; Hemingway sagte, die ganze amerikanische Literatur komme aus Huck Finn.',
    'Er schrieb über Lügen, Heuchelei, Sklaverei, Könige, Amerika und sich selbst — am liebsten komisch, weil man so die Wahrheit am besten unterbringt. Er verlor ein Vermögen mit einer Setzmaschine, zahlte alle Schulden ab, trug weiße Anzüge, rauchte zu viel und schrieb Briefe, in denen mehr Handwerk steckt als in manchen Ratgebern: das richtige Wort, nicht sein Cousin; Adjektive töten; Überflüssiges meiden.',
    'Im Salon ist er der Alte vom Fluss mit der Zigarre. Er rät dir schlicht zu schreiben, die Fakten zuerst zu holen und dann zu verdrehen, „sehr“ zu streichen und den Jungen erzählen zu lassen. Er nimmt dich ernst, indem er Witze macht.',
    'Wenn er deine Seiten liest, streicht er im Kopf mit, und zwar mit Genuss. Am Ende sagt er dir nicht, was er gestrichen hat, sondern liest dir einen deiner eigenen Sätze laut vor — den einen, der schon ganz ohne ihn auskommt. Das ist sein Lob.'
  ]
};

/* Acht Themen mehr. Je Stimme ein Kern; englische Stimmen: en + parallel de. */
const SALON_MEHR_THEMEN = [['titel', 'Titel'], ['perspektive', 'Perspektive'], ['tempo', 'Tempo'], ['welt', 'Weltenbau'], ['humor', 'Humor'], ['recherche', 'Recherche'], ['zeigen', 'Zeigen'], ['loslassen', 'Loslassen']];
const SALON_MEHR_STICHWORTE = [
  ['titel', /titel|überschrift|name (des|für das) buch|wie nenn|heißen soll/i],
  ['perspektive', /perspektive|ich-erzähl|erzähler|erzählerin|dritte person|erste person|sicht|blickwinkel|präsens|präteritum|tempus/i],
  ['tempo', /tempo|spannung|zieht sich|zu schnell|zu langsam|cliffhanger|kapitelend|rhythmus der geschichte|durchhäng|schleppt/i],
  ['welt', /weltenbau|magiesystem|magie|zauber|königreich|fantasy|worldbuild|karte zeichnen|meine welt|die welt (bauen|erfinden)/i],
  ['humor', /humor|witz|lustig|komisch|lachen|satire/i],
  ['recherche', /recherche|recherchier|nachschlag|wissen|realistisch|stimmt das|fakten|historisch/i],
  ['zeigen', /zeigen|erzählen|show|tell|beschreib|beschreibung|bild|adjektiv/i],
  ['loslassen', /loslassen|fertig|veröffentlich|zeigen|lesen lassen|feedback|kritik|jemandem geben|abgeben|wettbewerb|verlag/i]
];
const SALON_MEHR_KERN = {
  king: { en: [
    ['titel', 'A title is a door handle, not a summary. Short, concrete, a little wrong. “Carrie”. “It”. You’ll know it when it scares you a little.'],
    ['perspektive', 'First person gets you close; third person lets you see the monster coming. Pick the one that hurts more and stay there.'],
    ['tempo', 'Slow down for the scary part. Speed up when they run. And end the chapter one sentence before the reader wants you to.'],
    ['welt', 'Build the town before you build the monster. If I believe the diner, I’ll believe the thing in the sewer.'],
    ['humor', 'Let somebody crack a joke in the worst moment. People do. It makes the worst moment worse — and true.'],
    ['recherche', 'Know enough to lie well. Then stop researching and write; the reader doesn’t want the manual.'],
    ['zeigen', 'Don’t tell me she’s scared. Show me her hand on the doorknob, not turning it.'],
    ['loslassen', 'Six weeks in the drawer, then one honest reader. Then send it out and start the next one before the answer comes.']
  ], de: [
    ['titel', 'Ein Titel ist ein Türgriff, keine Zusammenfassung. Kurz, konkret, ein bisschen falsch. „Carrie“. „Es“. Du erkennst ihn daran, dass er dir ein wenig Angst macht.'],
    ['perspektive', 'Die Ich-Form bringt dich nah ran; die dritte Person lässt dich das Monster kommen sehen. Nimm die, die mehr wehtut, und bleib dabei.'],
    ['tempo', 'Werde langsam an der gruseligen Stelle. Werde schnell, wenn sie rennen. Und beende das Kapitel einen Satz bevor der Leser es will.'],
    ['welt', 'Bau die Stadt, bevor du das Monster baust. Wenn ich das Diner glaube, glaube ich das Ding in der Kanalisation.'],
    ['humor', 'Lass jemanden im schlimmsten Moment einen Witz machen. Menschen tun das. Es macht den schlimmsten Moment schlimmer — und wahr.'],
    ['recherche', 'Wisse genug, um gut zu lügen. Dann hör auf zu recherchieren und schreib; der Leser will nicht das Handbuch.'],
    ['zeigen', 'Sag mir nicht, dass sie Angst hat. Zeig mir ihre Hand am Türknauf, die ihn nicht dreht.'],
    ['loslassen', 'Sechs Wochen in die Schublade, dann ein ehrlicher Leser. Dann schick es raus und fang das nächste an, bevor die Antwort kommt.']
  ] },
  rothfuss: { en: [
    ['titel', 'A title should sound like the book: say it out loud and listen for the key. If it hums, keep it.'],
    ['perspektive', 'A story told by someone is a story with a second story underneath — what they leave out. That’s why I let Kvothe tell it.'],
    ['tempo', 'Fast is easy. Slow is the trick: a scene that moves slowly and still holds — that’s craft. Practise the slow ones.'],
    ['welt', 'Magic needs rules, and rules need a price. Then the world can be as strange as you like and still be true.'],
    ['humor', 'The funniest line in a sad scene is the one that makes the sadness real. Let someone laugh at the wrong moment.'],
    ['recherche', 'Learn the craft your character has — a little of it, honestly. Readers rest on pages where someone knows something.'],
    ['zeigen', 'Don’t describe the room; describe what she notices in it. Attention is character.'],
    ['loslassen', 'It’s finished when nothing is too much. Then let it go — and don’t read the reviews before lunch.']
  ], de: [
    ['titel', 'Ein Titel sollte klingen wie das Buch: Sprich ihn laut aus und hör auf die Tonart. Wenn er summt, behalt ihn.'],
    ['perspektive', 'Eine Geschichte, die jemand erzählt, hat eine zweite Geschichte darunter — das, was er weglässt. Deshalb lasse ich Kvothe erzählen.'],
    ['tempo', 'Schnell ist leicht. Langsam ist der Trick: eine Szene, die sich langsam bewegt und trotzdem hält — das ist Handwerk. Üb die langsamen.'],
    ['welt', 'Magie braucht Regeln, und Regeln brauchen einen Preis. Dann darf die Welt so fremd sein, wie du willst, und bleibt wahr.'],
    ['humor', 'Die komischste Zeile in einer traurigen Szene ist die, die die Trauer wahr macht. Lass jemanden im falschen Moment lachen.'],
    ['recherche', 'Lern das Handwerk deiner Figur — ein bisschen davon, ehrlich. Leser ruhen sich auf Seiten aus, auf denen jemand etwas kann.'],
    ['zeigen', 'Beschreib nicht das Zimmer; beschreib, was sie darin bemerkt. Aufmerksamkeit ist Charakter.'],
    ['loslassen', 'Es ist fertig, wenn nichts zu viel ist. Dann lass es los — und lies die Kritiken nicht vor dem Mittagessen.']
  ] },
  pratchett: { en: [
    ['titel', 'Titles are jokes the reader gets at the end of the book. “Going Postal”. Make it mean two things, and let the second one hurt a bit.'],
    ['perspektive', 'Stand next to the small person and look up at the big ones. That’s where the story is — and the joke.'],
    ['tempo', 'If nothing has gone wrong in two pages, something is wrong with the two pages. Let the ferret out.'],
    ['welt', 'Every city needs a Watch, a market and someone who lights the lamps. Build those three and the rest arrives on its own.'],
    ['humor', 'Humour isn’t the opposite of serious; it’s the way in. Look closely, then take your hat off. That’s the whole trick.'],
    ['recherche', 'Read history. Humanity has already tried every plot, usually worse. Then put a troll in it.'],
    ['zeigen', 'Don’t say he was pompous. Give him a hat with a feather and let him adjust it. Twice.'],
    ['loslassen', 'Finish it badly, then make it good, then let it go. A book that never leaves the desk is a diary with ambitions.']
  ], de: [
    ['titel', 'Titel sind Witze, die der Leser am Ende des Buches versteht. „Ab die Post“. Lass ihn zwei Dinge bedeuten, und lass das zweite ein bisschen wehtun.'],
    ['perspektive', 'Stell dich neben den kleinen Menschen und schau zu den großen hinauf. Da ist die Geschichte — und der Witz.'],
    ['tempo', 'Wenn zwei Seiten lang nichts schiefgegangen ist, stimmt mit den zwei Seiten etwas nicht. Lass das Frettchen raus.'],
    ['welt', 'Jede Stadt braucht eine Wache, einen Markt und jemanden, der die Laternen anzündet. Bau die drei, und der Rest kommt von selbst.'],
    ['humor', 'Humor ist nicht das Gegenteil von ernst; er ist der Weg hinein. Schau genau hin, dann nimm den Hut ab. Das ist der ganze Trick.'],
    ['recherche', 'Lies Geschichte. Die Menschheit hat jeden Plot schon ausprobiert, meistens schlimmer. Dann setz einen Troll hinein.'],
    ['zeigen', 'Sag nicht, er sei aufgeblasen. Gib ihm einen Hut mit Feder und lass ihn ihn zurechtrücken. Zweimal.'],
    ['loslassen', 'Mach es schlecht fertig, dann mach es gut, dann lass es los. Ein Buch, das nie den Tisch verlässt, ist ein Tagebuch mit Ambitionen.']
  ] },
  tolkien: { en: [
    ['titel', 'Name the book as you would name a hill: after what it is, in the oldest word you have. The rest is marketing, which I never understood.'],
    ['perspektive', 'Stay near the hobbits. Great deeds are best seen from a small height, by someone who would rather be home.'],
    ['tempo', 'Let there be long walks and meals between the battles. A reader who has rested will fear the dark with you.'],
    ['welt', 'Invent the language, then the people, then the map. A world that has a history the reader never learns feels a thousand years deep.'],
    ['humor', 'Hobbits are the humour: practical, food-minded, unimpressed by wizards. Keep one in every council.'],
    ['recherche', 'Read the old poems — Beowulf, the Kalevala, the sagas. Not to copy them; to stand in the same soil.'],
    ['zeigen', 'Do not explain the ruin by the road. Let the travellers pass it in silence; the silence is the explanation.'],
    ['loslassen', 'The tale grows in the telling, and one day you must stop telling and let it go over the sea. Then you are allowed to miss it.']
  ], de: [
    ['titel', 'Nenn das Buch, wie du einen Hügel nennen würdest: nach dem, was es ist, im ältesten Wort, das du hast. Der Rest ist Werbung, die ich nie verstanden habe.'],
    ['perspektive', 'Bleib bei den Hobbits. Große Taten sieht man am besten aus geringer Höhe, von jemandem, der lieber zu Hause wäre.'],
    ['tempo', 'Lass lange Wege und Mahlzeiten zwischen den Schlachten sein. Ein Leser, der sich ausgeruht hat, fürchtet das Dunkel mit dir.'],
    ['welt', 'Erfinde die Sprache, dann die Leute, dann die Karte. Eine Welt mit einer Geschichte, die der Leser nie erfährt, fühlt sich tausend Jahre tief an.'],
    ['humor', 'Die Hobbits sind der Humor: praktisch, ans Essen denkend, von Zauberern unbeeindruckt. Behalt einen in jedem Rat.'],
    ['recherche', 'Lies die alten Gedichte — Beowulf, das Kalevala, die Sagas. Nicht um sie zu kopieren; um in derselben Erde zu stehen.'],
    ['zeigen', 'Erklär die Ruine am Weg nicht. Lass die Reisenden schweigend daran vorbeigehen; das Schweigen ist die Erklärung.'],
    ['loslassen', 'Die Geschichte wächst beim Erzählen, und eines Tages musst du aufhören zu erzählen und sie übers Meer gehen lassen. Dann darfst du sie vermissen.']
  ] },
  blyton: { en: [
    ['titel', 'Say what happens and where: Five Go to Smuggler’s Top. Children want to know what they’re getting. So do I.'],
    ['perspektive', 'Stay with the children and never, ever go into the grown-ups’ heads. They’re weather, not people.'],
    ['tempo', 'A chapter ends when the torch battery would. Short, and with a door that just creaked.'],
    ['welt', 'Draw the island, the tunnel, the tower. A map is a promise — and children check promises.'],
    ['humor', 'The dog is funny. The cross one is funny. Let them be, and never wink at the reader.'],
    ['recherche', 'Know how a boat is tied and how a kettle boils. The rest you may make up; nobody has ever checked a smuggler.'],
    ['zeigen', 'Red tin, green wood, cold sea. Colours are your adjectives. Then stop.'],
    ['loslassen', 'Write it, read it to a child, cut where she looks out of the window, and send it off before tea. Then start the next one.']
  ], de: [
    ['titel', 'Sag, was passiert und wo: Fünf Freunde auf der Felseninsel. Kinder wollen wissen, was sie bekommen. Ich auch.'],
    ['perspektive', 'Bleib bei den Kindern und geh nie, niemals in die Köpfe der Erwachsenen. Die sind Wetter, keine Menschen.'],
    ['tempo', 'Ein Kapitel endet, wenn die Taschenlampenbatterie es täte. Kurz, und mit einer Tür, die gerade geknarrt hat.'],
    ['welt', 'Zeichne die Insel, den Tunnel, den Turm. Eine Karte ist ein Versprechen — und Kinder prüfen Versprechen.'],
    ['humor', 'Der Hund ist lustig. Der Bockige ist lustig. Lass sie, und zwinker dem Leser nie zu.'],
    ['recherche', 'Wisse, wie man ein Boot festmacht und wie ein Kessel kocht. Den Rest darfst du erfinden; niemand hat je einen Schmuggler nachgeprüft.'],
    ['zeigen', 'Rote Dose, grüner Wald, kaltes Meer. Farben sind deine Adjektive. Dann hör auf.'],
    ['loslassen', 'Schreib es, lies es einem Kind vor, streich, wo es aus dem Fenster schaut, und schick es vor dem Tee ab. Dann fang das nächste an.']
  ] },
  paolini: { en: [
    ['titel', 'One word if you can: Eragon, Eldest, Brisingr. A name the reader can carry in a pocket.'],
    ['perspektive', 'Close third: I see what Eragon sees and know what he doesn’t. The gap between those two is suspense.'],
    ['tempo', 'Outline the beats, then let the scenes breathe between them. Fast action comes from slow planning.'],
    ['welt', 'Give your magic a grammar and your kingdoms a bakery. Rules and smells — that’s a world.'],
    ['humor', 'Let the dragon be dry. The oldest mind in the room gets the best one-liners, and the fewest.'],
    ['recherche', 'Read outside your genre — biographies, science, history. Your fantasy gets stronger from everything that isn’t fantasy.'],
    ['zeigen', 'Describe the sword by how it is carried. Motion is description; adjectives are furniture.'],
    ['loslassen', 'Finish the draft, then revise, then hand it to someone who loves you and tells the truth. Then let it fly; it isn’t yours any more.']
  ], de: [
    ['titel', 'Ein Wort, wenn du kannst: Eragon, Eldest, Brisingr. Ein Name, den der Leser in der Tasche tragen kann.'],
    ['perspektive', 'Nahe dritte Person: Ich sehe, was Eragon sieht, und weiß, was er nicht weiß. Der Abstand dazwischen ist Spannung.'],
    ['tempo', 'Plane die Schläge, dann lass die Szenen dazwischen atmen. Schnelle Action kommt aus langsamem Planen.'],
    ['welt', 'Gib deiner Magie eine Grammatik und deinen Königreichen eine Bäckerei. Regeln und Gerüche — das ist eine Welt.'],
    ['humor', 'Lass den Drachen trocken sein. Der älteste Kopf im Raum bekommt die besten Einzeiler, und die wenigsten.'],
    ['recherche', 'Lies außerhalb deines Genres — Biografien, Wissenschaft, Geschichte. Deine Fantasy wird stärker von allem, was keine Fantasy ist.'],
    ['zeigen', 'Beschreib das Schwert daran, wie es getragen wird. Bewegung ist Beschreibung; Adjektive sind Möbel.'],
    ['loslassen', 'Beende den Entwurf, überarbeite, gib es jemandem, der dich liebt und die Wahrheit sagt. Dann lass es fliegen; es gehört dir nicht mehr.']
  ] },
  twain: { en: [
    ['titel', 'Name it after the boy. “Tom Sawyer”. “Huckleberry Finn”. A title should fit in a boy’s mouth.'],
    ['perspektive', 'Let the one who knows least tell it. Huck sees everything and understands half — the reader fills the rest and feels clever.'],
    ['tempo', 'Get on the raft. Every time the story stalls, there’s a river nearby; put them on it.'],
    ['welt', 'Write the town you grew up in and change the name. Nobody builds a better world than the one they were bored in.'],
    ['humor', 'Humour is the truth wearing a hat. Take the hat off at the end of the chapter, once, and you’ve got them.'],
    ['recherche', 'Get your facts first. Then you may distort them as you please — but first.'],
    ['zeigen', 'Don’t say the old lady screamed. Bring her on and let her scream.'],
    ['loslassen', 'Write without pay until somebody offers. Then take the pay, and keep writing the same way.']
  ], de: [
    ['titel', 'Nenn es nach dem Jungen. „Tom Sawyer“. „Huckleberry Finn“. Ein Titel sollte in einen Jungenmund passen.'],
    ['perspektive', 'Lass den erzählen, der am wenigsten weiß. Huck sieht alles und versteht die Hälfte — der Leser füllt den Rest und fühlt sich klug.'],
    ['tempo', 'Steig aufs Floß. Jedes Mal, wenn die Geschichte stockt, ist ein Fluss in der Nähe; setz sie drauf.'],
    ['welt', 'Schreib die Stadt, in der du aufgewachsen bist, und ändere den Namen. Niemand baut eine bessere Welt als die, in der er sich gelangweilt hat.'],
    ['humor', 'Humor ist die Wahrheit mit Hut. Nimm den Hut am Kapitelende einmal ab, und du hast sie.'],
    ['recherche', 'Beschaff dir zuerst die Fakten. Dann darfst du sie verdrehen, wie du willst — aber zuerst.'],
    ['zeigen', 'Sag nicht: Die alte Dame schrie. Bring sie auf die Bühne und lass sie schreien.'],
    ['loslassen', 'Schreib ohne Lohn, bis dir jemand einen bietet. Dann nimm den Lohn, und schreib genauso weiter.']
  ] },
  kaestner: { de: [
    ['titel', 'Ein Titel sagt, wer und was: „Emil und die Detektive“. Keine Poesie, ein Versprechen. Halten Sie es dann.'],
    ['perspektive', 'Erzählen Sie, als säßen Sie neben dem Kind, nicht über ihm. Dann dürfen Sie sogar klug sein.'],
    ['tempo', 'Kurze Kapitel, ein Zug, der abfährt, ein Dieb, der läuft. Und zwischendurch ein Butterbrot.'],
    ['welt', 'Berlin, 1929: Straßenbahn, Hinterhof, Zeitungskiosk. Die wirkliche Welt ist Kulisse genug, wenn man sie genau ansieht.'],
    ['humor', 'Lachen ist kein Ausweichen. Es ist die Art, wie man die Wahrheit ins Zimmer bringt, ohne die Tür einzutreten.'],
    ['recherche', 'Gehen Sie hin. Fahren Sie mit der Straßenbahn, die Ihre Figur nimmt. Schreiben Sie die Haltestellen auf.'],
    ['zeigen', 'Sagen Sie nicht, dass die Mutter müde ist. Lassen Sie sie die Schuhe ausziehen und sitzen bleiben.'],
    ['loslassen', 'Wenn es fertig ist, geben Sie es einem Kind. Und dann dem Verlag. In dieser Reihenfolge.']
  ] },
  funke: { de: [
    ['titel', 'Ein Titel ist ein Zauberwort: „Tintenherz“. Zwei Dinge, die nicht zusammengehören, und plötzlich tun sie es.'],
    ['perspektive', 'Wechsle die Augen, wenn die Geschichte es braucht — aber sag mir am Anfang des Kapitels, in wessen Kopf ich bin.'],
    ['tempo', 'Eine Geschichte darf langsam anfangen, wenn sie dabei schon lockt. Der Geruch von Papier ist ein Versprechen.'],
    ['welt', 'Meine Welten sind alt, bevor ich sie betrete. Gib jeder Tür einen Kratzer, den jemand vor hundert Jahren gemacht hat.'],
    ['humor', 'Staubfinger ist nicht lustig. Aber er hat einen Marder, und der ist es. Gib den Ernsten ein Tier.'],
    ['recherche', 'Zeichne es, bevor du es schreibst. Wer ein Haus gezeichnet hat, weiß, wo die Treppe knarrt.'],
    ['zeigen', 'Nicht „es war unheimlich“. Die Kerze, die ausgeht, und das Geräusch danach.'],
    ['loslassen', 'Bücher gehören denen, die sie lesen. Irgendwann musst du die Tür aufmachen und sie hinauslassen.']
  ] },
  lindgren: { de: [
    ['titel', 'Nenn es nach dem Kind: Pippi, Michel, Ronja. Ein Name, den man rufen kann.'],
    ['perspektive', 'Bleib auf Augenhöhe des Kindes. Von dort sehen Erwachsene komisch aus — und das ist die Wahrheit.'],
    ['tempo', 'Ein Sommer hat ein eigenes Tempo: lang, und dann plötzlich vorbei. Schreib so.'],
    ['welt', 'Bullerbü ist ein Hof, drei Häuser, ein Bach. Eine Welt muss nicht groß sein, um ganz zu sein.'],
    ['humor', 'Kinder lachen über das Ernste und weinen über das Kleine. Lass beides zu, im selben Kapitel.'],
    ['recherche', 'Erinnere dich genau. Wie der Stall roch, wie die Treppe klang. Das ist die beste Recherche, die es gibt.'],
    ['zeigen', 'Nicht „sie war mutig“. Sie stieg auf den Baum, und alle schauten zu.'],
    ['loslassen', 'Schick es einem Kind. Wenn es still wird, ist es fertig. Dann lass es gehen wie ein Kind ins Freie.']
  ] }
};

/* Mehr Aufgaben, in Unterkategorien. `kat`: Anfänge · Figuren · Dialog · Welt & Ort · Kürzen & Klang · Mut & Angst · Spiel */
const SALON_MEHR_AUFGABEN = {
  king: [
    { kat: 'Anfänge', t: 'Write the first paragraph of a story that starts in the middle of a phone call. We never learn who called.', min: 15, ziel: 250 },
    { kat: 'Figuren', t: 'Empty your character’s pockets on the table. Write what’s there — and one thing that shouldn’t be.', min: 10, ziel: 150 },
    { kat: 'Dialog', t: 'Two people say goodbye at a door. One of them is lying. Use “said” only.', min: 15, ziel: 300 },
    { kat: 'Welt & Ort', t: 'Describe a kitchen at 3 a.m. Something is slightly wrong with it. Don’t say what.', min: 15, ziel: 250 },
    { kat: 'Kürzen & Klang', t: 'Take yesterday’s page and cut ten percent. Then read it aloud and cut the sentence you stumble on.', min: 20, ziel: 0 },
    { kat: 'Mut & Angst', t: 'Write the thing you don’t want to look at. Three hundred words. Nobody reads it but you.', min: 20, ziel: 300 }
  ],
  kaestner: [
    { kat: 'Anfänge', t: 'Erster Satz: Ein Kind steigt in einen Zug. Zweiter Satz: Etwas fehlt. Weiter.', min: 15, ziel: 250 },
    { kat: 'Figuren', t: 'Beschreiben Sie eine Mutter nur über das, was sie mit den Händen tut. Kein Gefühlswort.', min: 15, ziel: 200 },
    { kat: 'Dialog', t: 'Zwei Kinder planen etwas Verbotenes. Der Leser versteht den Plan, die Erwachsenen nicht.', min: 15, ziel: 300 },
    { kat: 'Welt & Ort', t: 'Eine Straße Ihrer Stadt, um halb sieben morgens. Zehn Dinge, die man sieht. Drei, die man hört.', min: 10, ziel: 150 },
    { kat: 'Kürzen & Klang', t: 'Schreiben Sie einen Absatz, dann streichen Sie jedes zweite Adjektiv. Lesen Sie laut. Besser?', min: 15, ziel: 200 },
    { kat: 'Spiel', t: 'Ein Gedicht mit vier Zeilen, das lächelt und wehtut. Reim erlaubt, Kitsch nicht.', min: 15, ziel: 40 }
  ],
  funke: [
    { kat: 'Anfänge', t: 'Jemand liest laut vor, und etwas im Zimmer verändert sich. Schreib die erste Seite.', min: 20, ziel: 350 },
    { kat: 'Figuren', t: 'Gib einer Figur ein Tier, das nur sie versteht. Eine Szene mit beiden, ohne dass jemand spricht.', min: 15, ziel: 250 },
    { kat: 'Welt & Ort', t: 'Eine Tür, die älter ist als das Haus. Beschreib sie so, dass ich sie öffnen will — und Angst davor habe.', min: 15, ziel: 200 },
    { kat: 'Dialog', t: 'Ein Gespräch zwischen einer Figur und ihrem Autor. Die Figur hat eine Beschwerde.', min: 20, ziel: 300 },
    { kat: 'Kürzen & Klang', t: 'Nimm deine liebste Seite. Lies sie laut bei Kerzenlicht. Markiere, wo die Flamme flackert — da ist der Satz zu lang.', min: 15, ziel: 0 },
    { kat: 'Spiel', t: 'Zeichne deine Hauptfigur in drei Strichen. Dann schreib den Satz, den sie dazu sagt.', min: 10, ziel: 60 }
  ],
  rothfuss: [
    { kat: 'Anfänge', t: 'Start with a silence that has three parts. Name none of them. Make me hear all three.', min: 20, ziel: 250 },
    { kat: 'Figuren', t: 'Write the legend people tell about your character. Then one paragraph of what actually happened.', min: 20, ziel: 350 },
    { kat: 'Kürzen & Klang', t: 'Write one sentence twenty times until it sounds as if it had always been there. Keep the last one.', min: 20, ziel: 0 },
    { kat: 'Welt & Ort', t: 'A tavern that has been there for a thousand years. Three scratches on three walls, each with a story nobody tells.', min: 20, ziel: 300 },
    { kat: 'Dialog', t: 'A conversation where the clever person says less than the stupid one — and wins.', min: 15, ziel: 300 },
    { kat: 'Spiel', t: 'Pick a word you love. Write a paragraph where it appears exactly once, at the end.', min: 10, ziel: 120 }
  ],
  pratchett: [
    { kat: 'Anfänge', t: 'Begin with the lamplighter. He has seen something. Four hundred words, and the city wakes around him.', min: 20, ziel: 400 },
    { kat: 'Figuren', t: 'Write a minor character’s morning as if they were the hero. They don’t know they aren’t.', min: 15, ziel: 300 },
    { kat: 'Humor', t: 'A footnote longer than the sentence it belongs to. Make the footnote the point.', min: 10, ziel: 120 },
    { kat: 'Welt & Ort', t: 'Describe a city by its hats. Ten hats, ten people, one city.', min: 15, ziel: 250 },
    { kat: 'Dialog', t: 'DEATH talks to someone who refuses to be impressed. Capital letters for one of them.', min: 15, ziel: 250 },
    { kat: 'Mut & Angst', t: 'The scariest thing in the room is a clerk with a form. Write the form — and the clerk.', min: 15, ziel: 250 },
    { kat: 'Kürzen & Klang', t: 'Find a sentence you saved with a joke. Cut the sentence. Keep the joke. See what it lands on.', min: 10, ziel: 0 },
    { kat: 'Recherche', t: 'Steal a real historical disaster and give it to a city that deserves it. Two hundred words of aftermath.', min: 20, ziel: 250 },
    { kat: 'Spiel', t: 'Write a shop that could only exist in your world. Its sign, its smell, and the one thing it will not sell.', min: 15, ziel: 250 },
    { kat: 'Anfänge', t: 'Open with a rumour. Three people repeat it, each getting it slightly more wrong.', min: 15, ziel: 300 },
    { kat: 'Figuren', t: 'Someone who is very good at a very small job. Show me their pride. Do not make fun of it.', min: 15, ziel: 250 }
  ],
  lindgren: [
    { kat: 'Anfänge', t: 'Ein Kind wacht auf, und es ist der erste Ferientag. Schreib die erste halbe Stunde, Minute für Minute.', min: 15, ziel: 300 },
    { kat: 'Figuren', t: 'Schreib ein Kind, das stärker ist als alle Erwachsenen — und trotzdem nachts das Licht anlässt.', min: 15, ziel: 250 },
    { kat: 'Mut & Angst', t: 'Jemand klettert auf den höchsten Baum. Unten stehen alle. Schreib es aus der Sicht des Baums.', min: 15, ziel: 200 },
    { kat: 'Welt & Ort', t: 'Drei Häuser, ein Bach, ein Sommer. Beschreib den Ort, als wärst du acht.', min: 15, ziel: 250 },
    { kat: 'Dialog', t: 'Zwei Kinder streiten sich und versöhnen sich, ohne dass jemand „Entschuldigung“ sagt.', min: 15, ziel: 250 },
    { kat: 'Spiel', t: 'Erfinde ein Wort, das es nur in eurem Dorf gibt. Schreib die Szene, in der es zum ersten Mal gesagt wird.', min: 10, ziel: 150 },
    { kat: 'Kürzen & Klang', t: 'Nimm einen Absatz und streich jedes Wort, das ein Kind nicht sagen würde. Lies laut. Klingt er jetzt wahrer?', min: 10, ziel: 0 },
    { kat: 'Recherche', t: 'Ruf jemanden an, der älter ist als du, und frag nach einem Sommer von damals. Schreib drei Sätze davon auf.', min: 15, ziel: 120 },
    { kat: 'Anfänge', t: '„Es war einmal“ ist verboten. Fang stattdessen mit einem Geräusch im Haus an, das nicht dorthin gehört.', min: 15, ziel: 250 },
    { kat: 'Humor', t: 'Ein Erwachsener nimmt sich sehr ernst. Ein Kind stellt eine einzige Frage. Schluss.', min: 10, ziel: 150 },
    { kat: 'Welt & Ort', t: 'Beschreib ein Zimmer, in dem ein Kind allein sein darf. Was steht darin, was niemand wegräumt?', min: 15, ziel: 200 }
  ],
  tolkien: [
    { kat: 'Welt & Ort', t: 'Name three rivers on a map that does not exist. Then write who lives at the mouth of the second.', min: 20, ziel: 250 },
    { kat: 'Anfänge', t: 'In a hole in the ground there lived — not a hobbit. Someone else who does not want to leave. First page.', min: 20, ziel: 300 },
    { kat: 'Figuren', t: 'Write the song your character hums on the road. Four lines. Then what it reminds them of.', min: 15, ziel: 150 },
    { kat: 'Kürzen & Klang', t: 'Take an old word — doom, hallow, fell — and put it in a sentence where it stands up straight. Only one.', min: 10, ziel: 80 },
    { kat: 'Mut & Angst', t: 'The Shadow as a rumour from the East: three people repeat it, each a little wrong. Never show it.', min: 20, ziel: 300 },
    { kat: 'Spiel', t: 'Invent a word in a language nobody speaks. Give it a mouth, a meaning, and a sentence.', min: 10, ziel: 60 }
  ],
  blyton: [
    { kat: 'Anfänge', t: '“Mother, have you heard about our holidays yet?” Start there, in your own words, with your own children.', min: 15, ziel: 250 },
    { kat: 'Figuren', t: 'Four children: one brave, one careful, one cross, one kind. Write the breakfast where all four show it.', min: 15, ziel: 300 },
    { kat: 'Welt & Ort', t: 'Draw the map first: island, tower, tunnel. Then write the page where they find the entrance.', min: 20, ziel: 300 },
    { kat: 'Dialog', t: 'Children squabble about who carries the basket. Nobody wins; the dog does.', min: 10, ziel: 200 },
    { kat: 'Kürzen & Klang', t: 'Write a chapter that ends before the torch battery does: short, bright, and with a door that just creaked.', min: 20, ziel: 400 },
    { kat: 'Spiel', t: 'A map in a biscuit tin. What’s on it? Write the map as words.', min: 10, ziel: 120 }
  ],
  paolini: [
    { kat: 'Welt & Ort', t: 'Give a magic system three rules. Then a scene where someone pays the price of one.', min: 25, ziel: 400 },
    { kat: 'Anfänge', t: 'Wind, night, a scent that does not belong. First page of a story that starts with a smell.', min: 15, ziel: 300 },
    { kat: 'Figuren', t: 'A mentor tells the hero one thing that is wrong. Write the moment the hero finds out.', min: 20, ziel: 350 },
    { kat: 'Mut & Angst', t: 'Your hero is afraid on the page — really afraid — before being brave. Write the afraid part only.', min: 15, ziel: 250 },
    { kat: 'Kürzen & Klang', t: 'Write a fight slowly: every move, what it costs. Then cut it by a third. Then by a third again.', min: 25, ziel: 400 },
    { kat: 'Dialog', t: 'The dragon speaks in fewer words than the boy. Ten lines each; the dragon wins with fewer.', min: 15, ziel: 200 }
  ],
  twain: [
    { kat: 'Kürzen & Klang', t: 'Three hundred words with no adjectives. Then put exactly one back, where it earns its keep.', min: 15, ziel: 300 },
    { kat: 'Figuren', t: 'A boy tells a lie to an adult, and the lie is more honest than the truth would have been.', min: 20, ziel: 350 },
    { kat: 'Welt & Ort', t: 'Night on the water: two people on a raft, and something the reader notices before they do.', min: 20, ziel: 400 },
    { kat: 'Humor', t: 'Write the most serious thing you know as a joke. Then take the hat off in the last sentence.', min: 15, ziel: 250 },
    { kat: 'Recherche', t: 'Describe a real place you know in plain words. Then bend one fact — just one — and see what it does.', min: 20, ziel: 300 },
    { kat: 'Anfänge', t: '“You don’t know about me.” Begin with a voice and a small lie in it. No weather.', min: 15, ziel: 250 }
  ]
};
/* Kategorie für alte Aufgaben erraten. Pur. */
function salonAufgabeKategorie(t) {
  const s = String(t || '').toLowerCase();
  if (/anfang|erste[rn]? satz|first page|first sentence|begin|start|erste seite|opening/.test(s)) return 'Anfänge';
  if (/dialog|gespräch|conversation|sagt|says|talk|redet|streit|squabble/.test(s)) return 'Dialog';
  if (/streich|kürz|cut|prozent|percent|adverb|adjektiv|adjective|laut|aloud|wort|word/.test(s)) return 'Kürzen & Klang';
  if (/angst|fear|afraid|monster|dunkel|keller|grusel|schatten|scary/.test(s)) return 'Mut & Angst';
  if (/ort|raum|zimmer|stadt|welt|map|karte|insel|tunnel|place|room|magic|magie|regel|rule|welt/.test(s)) return 'Welt & Ort';
  if (/figur|held|charakter|character|mentor|villain|bösewicht|kind|child|hund|dog/.test(s)) return 'Figuren';
  return 'Spiel';
}
const SALON_AUFGABEN_KATEGORIEN = ['Anfänge', 'Figuren', 'Dialog', 'Welt & Ort', 'Kürzen & Klang', 'Mut & Angst', 'Humor', 'Recherche', 'Spiel'];
