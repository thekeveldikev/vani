/* ===================== 56 — DER SALON: DIE LIEBLINGSWAND =====================
   Vier Porträts in Rahmen an einer Wand. Jede Person hat echte Zitate (mit
   Quelle, bei Übersetzungen steht das Original dabei) — und eine Stimme, in
   der sie Rat gibt. Die Ratschläge sind erfunden, aber in ihrem Geist; das
   steht auch dran. Sie sind nicht endlich: handgeschriebene Sätze und ein
   Baukasten aus Anfang, Kern und Schluss je Stimme, nach Thema wählbar,
   aus einer Saat gewürfelt (der Rat des Tages bleibt den Tag über gleich).
   Dazu: eigene Menschen an die Wand hängen (Name, Foto, eigene Zitate). */

const SALON_THEMEN = [
  ['anfang', 'Anfangen'], ['zweifel', 'Zweifel'], ['routine', 'Dranbleiben'], ['figuren', 'Figuren'], ['dialog', 'Dialog'],
  ['stil', 'Sprache'], ['ueberarbeiten', 'Überarbeiten'], ['angst', 'Angst'], ['lesen', 'Lesen'], ['ende', 'Enden'], ['pause', 'Pausen']
];

/* Die Porträts und ihre Herkunft (autoren/quellen.json führt die Lizenzen noch einmal). */
const SALON_AUTOREN = [
  {
    id: 'king', name: 'Stephen King', jahre: '* 1947', woher: 'Maine', bild: 'autoren/king.jpg', lage: '50% 28%',
    foto: { urheber: 'Kevin Payravi', lizenz: 'CC BY-SA 4.0', lizenzUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', seite: 'https://commons.wikimedia.org/wiki/File:Stephen_King_(cropped).jpg' },
    kurz: 'Der Handwerker des Unheimlichen. Schreibt jeden Tag, liest alles, misstraut Adverbien.',
    rahmen: 'nuss', anrede: 'Steve',
    zitate: [
      { t: 'Der unheimlichste Augenblick ist immer der kurz vor dem Anfang.', o: 'The scariest moment is always just before you start.', q: 'Das Leben und das Schreiben (On Writing), 2000' },
      { t: 'Wenn du Schriftsteller werden willst, musst du vor allem zwei Dinge tun: viel lesen und viel schreiben.', o: 'If you want to be a writer, you must do two things above all others: read a lot and write a lot.', q: 'On Writing, 2000' },
      { t: 'Der Weg zur Hölle ist mit Adverbien gepflastert.', o: 'The road to hell is paved with adverbs.', q: 'On Writing, 2000' },
      { t: 'Töte deine Lieblinge, töte deine Lieblinge — auch wenn es dein egozentrisches kleines Schreiberlingsherz bricht: töte deine Lieblinge.', o: 'Kill your darlings, kill your darlings, even when it breaks your egocentric little scribbler’s heart, kill your darlings.', q: 'On Writing, 2000' },
      { t: 'Amateure sitzen herum und warten auf Inspiration. Der Rest von uns steht einfach auf und geht an die Arbeit.', o: 'Amateurs sit and wait for inspiration, the rest of us just get up and go to work.', q: 'On Writing, 2000' },
      { t: 'Bücher sind eine einzigartig tragbare Magie.', o: 'Books are a uniquely portable magic.', q: 'On Writing, 2000' },
      { t: 'Beschreibung beginnt in der Vorstellung des Schreibenden, aber sie sollte in der des Lesenden enden.', o: 'Description begins in the writer’s imagination, but should finish in the reader’s.', q: 'On Writing, 2000' },
      { t: 'Schreiben ist Magie, so sehr Lebenswasser wie jede andere schöpferische Kunst. Das Wasser ist umsonst. Trink.', o: 'Writing is magic, as much the water of life as any other creative art. The water is free. Drink.', q: 'On Writing, 2000' },
      { t: 'Beim Schreiben geht es nicht darum, Geld zu verdienen, berühmt zu werden oder Freunde zu finden. Am Ende geht es darum, das Leben derer zu bereichern, die dein Werk lesen — und dein eigenes dazu.', o: 'Writing isn’t about making money, getting famous, getting dates, getting laid, or making friends. In the end, it’s about enriching the lives of those who will read your work, and enriching your own life, as well.', q: 'On Writing, 2000' },
      { t: 'Fang an zu leben oder fang an zu sterben.', o: 'Get busy living, or get busy dying.', q: 'Die Verurteilten (Rita Hayworth and Shawshank Redemption), 1982' },
      { t: 'Die wichtigsten Dinge sind am schwersten zu sagen. Es sind die, für die man sich schämt, weil Worte sie kleiner machen.', o: 'The most important things are the hardest things to say. They are the things you get ashamed of, because words diminish them.', q: 'Die Leiche (The Body), 1982' },
      { t: 'Die Zeit nimmt alles, ob du willst oder nicht.', o: 'Time takes it all, whether you want it to or not.', q: 'The Green Mile, 1996' },
      { t: 'Das Vertrauen der Unschuldigen ist das nützlichste Werkzeug des Lügners.', o: 'The trust of the innocent is the liar’s most useful tool.', q: 'Needful Things (In einer kleinen Stadt), 1991' },
      { t: 'Talent ist billiger als Kochsalz. Was den Begabten vom Erfolgreichen trennt, ist eine Menge harter Arbeit.', o: 'Talent is cheaper than table salt. What separates the talented individual from the successful one is a lot of hard work.', q: 'zugeschrieben (Interviews)' },
      { t: 'Fiktion ist die Wahrheit in der Lüge.', o: 'Fiction is the truth inside the lie.', q: 'zugeschrieben' }
    ],
    /* Rat: handgeschrieben, in seiner Stimme — erfunden, aber so, wie er es sagen könnte */
    saetze: [
      'Die Tür zu. Handy weg. Zweitausend Wörter, dann darfst du raus. Das ist kein Zauber, das ist Schichtarbeit — und sie funktioniert.',
      'Schreib den ersten Entwurf mit geschlossener Tür. Für dich. Den zweiten mit offener Tür — für alle anderen. Verwechsle die Reihenfolge nicht.',
      'Das Adverb ist nicht dein Freund. „Sie sagte leise" — wenn der Satz nicht schon leise ist, rettet ihn kein Wort dahinter.',
      'Die Geschichte ist ein Fossil im Boden. Du erfindest sie nicht, du gräbst sie aus. Also grab — und hör auf, am Pinsel herumzudenken.',
      'Wenn du nicht weiterweißt: Was will die Figur gerade? Was steht ihr im Weg? Schreib das. Der Rest kommt von selbst.',
      'Kein Mensch wartet auf deinen Text. Das ist die schlechte Nachricht. Die gute: Niemand sieht, wie schlecht der erste Entwurf ist.',
      'Lies. Lies im Wartezimmer, im Bus, auf dem Klo. Wer keine Zeit zum Lesen hat, hat keine Zeit zum Schreiben. Ganz einfach.',
      'Sechs Wochen in die Schublade. Dann liest du dein eigenes Buch wie ein Fremder — und der Fremde hat recht.',
      'Angst ist der Rohstoff. Nicht die Monster — das, was du nachts nicht anschauen willst. Schreib genau dorthin.',
      'Zweiter Entwurf = erster Entwurf minus zehn Prozent. Das habe ich auf einen Ablehnungszettel geschrieben bekommen, und es stimmt bis heute.',
      'Figuren werden nicht erklärt. Sie handeln. Lass ihn den Hund treten oder ihm den Napf füllen — wir wissen dann alles.',
      'Dialog ist das, was Leute sagen, wenn sie nicht sagen, was sie meinen. Schreib das Drumherum, nicht die Botschaft.',
      'Hör auf, dich für dein Genre zu entschuldigen. Ein gutes Gruselstück ist mehr wert als ein schlechter Roman über das Leben.',
      'Die Muse ist ein Kerl im Keller, der nur runterkommt, wenn er weiß, wo du jeden Morgen sitzt. Also sitz da. Jeden Morgen.',
      'Du darfst eine Szene lieben und sie trotzdem streichen. Lieben ist kein Argument. Nur die Geschichte ist eins.',
      'Schreib über das, was du kennst — und das heißt nicht: deinen Job. Es heißt: was du fühlst, fürchtest, hoffst. Das kennst du besser als jeder andere.',
      'Das Ende darf wehtun. Aber es muss verdient sein. Kein Trick, kein Blitz aus heiterem Himmel. Alles, was am Ende kommt, war schon da.',
      'Wenn ein Absatz sich gut anfühlt, lies ihn laut. Wenn du stolperst, stolpert auch der Leser — nur dass der nicht wiederkommt.',
      'Plot ist das Gerüst, das ich am wenigsten traue. Situation zuerst: ein Mensch, ein Ort, ein Problem. Dann lass laufen.',
      'Ein Absatz ist die Maßeinheit des Schreibens, nicht der Satz. Wenn dein Absatz atmet, atmet die Seite.',
      'Es gibt nur zwei Regeln: Lies viel, schreib viel. Alles andere sind Fußnoten — auch das hier.',
      'Der Zweifel meldet sich ungefähr bei Seite dreißig. Das ist kein Zeichen. Das ist Seite dreißig. Weiter.',
      'Schreib, als wäre der Strom gleich weg. Kurze Sätze. Klare Verben. Wen interessieren Schnörkel, wenn das Haus brennt?',
      'Du brauchst keinen Schreibtisch am Fenster. Du brauchst einen Schreibtisch — und einen Grund, ihn zu verlassen. Den liefert das Leben.',
      'Pausen sind erlaubt. Verschwinden ist keine Pause. Wenn du zwei Tage nicht schreibst, merke ich das. Du auch.',
      'Der Leser ist klug. Erklär ihm nichts zweimal. Erklär ihm am besten gar nichts — zeig es ihm, und geh zur Seite.',
      'Das Geheimnis für lange Bücher: ein kurzes Stück am Tag. Das Geheimnis für kurze Bücher: dasselbe.',
      'Nimm die Stimme ernst, die sagt: „So würde sie das nie sagen." Das ist nicht Zweifel. Das ist Handwerk, das spricht.',
      'Die schlimmste Zeile ist die, die du nicht schreibst, weil sie dumm klingen könnte. Schreib sie. Streichen kannst du später.',
      'Wenn du jemanden nicht erschrecken kannst, ekle ihn. Wenn du ihn nicht ekeln kannst, brich ihm das Herz. Eins davon geht immer.',
      'Ein Satz, den du geklaut hast, klingt wie geklaut. Ein Satz, den du dir abgerungen hast, klingt nach dir. Man hört den Unterschied.',
      'Schreibblockade heißt meistens: Ich weiß, was als Nächstes kommt, und ich traue mich nicht. Dann trau dich. Oder schreib es schlecht — das ist auch eine Art von Mut.'
    ],
    anfang: ['Hör zu.', 'Ganz ehrlich:', 'Kleiner Tipp aus Maine:', 'Ich sag dir was.', 'Weißt du, was ich gelernt hab?', 'Ohne Umschweife:', 'Das ist keine Zauberei.', 'Mach dir nichts vor.', 'Hier ist die Sache.', 'Schreib dir das irgendwohin:', 'Kurz und schmutzig:', 'Egal, was dir jemand erzählt hat:'],
    kern: [
      ['anfang', 'Der erste Satz ist eine Tür, kein Denkmal. Geh durch, zieh sie hinter dir zu, guck nicht zurück.'],
      ['anfang', 'Fang nicht am Anfang an. Fang da an, wo es wehtut, und erzähl den Rest, wenn du schon drin bist.'],
      ['anfang', 'Eine Situation reicht: Mensch, Ort, Ärger. Du brauchst keinen Plan, du brauchst einen Stuhl.'],
      ['zweifel', 'Der Zweifel kommt jeden Tag zur Arbeit, genau wie du. Gib ihm einen Stuhl in der Ecke und schreib weiter.'],
      ['zweifel', 'Du hältst dich für schlecht? Gut. Die Schlechten halten sich für fertig.'],
      ['zweifel', 'Niemand schreibt Seite zweihundert mit dem Mut von Seite eins. Seite eins hatte auch keine Ahnung.'],
      ['routine', 'Gleiche Zeit, gleicher Platz, gleiche Tasse. Die Muse ist ein Gewohnheitstier, sie kommt, wo du sitzt.'],
      ['routine', 'Zähl Wörter, nicht Stunden. Zwei Stunden starren ist nichts. Dreihundert schlechte Wörter sind etwas.'],
      ['routine', 'Hör mitten im Satz auf, wenn es gut läuft. Morgen weißt du dann, wie es weitergeht.'],
      ['figuren', 'Gib ihr eine Sache, die sie unbedingt will, und eine, die sie niemals zugeben würde. Fertig ist der Mensch.'],
      ['figuren', 'Die Bösen halten sich für die Guten. Sonst sind sie keine Bösen, sonst sind sie Pappe.'],
      ['figuren', 'Was jemand in der Tasche hat, sagt mehr als seine Biografie. Schreib die Tasche.'],
      ['dialog', 'Leute reden aneinander vorbei. Lass sie. Der Leser versteht mehr als die Figuren — das ist der ganze Spaß.'],
      ['dialog', '„Sagte" reicht. Immer. Jedes Verb daneben ist ein Regieanweisung, die keiner bestellt hat.'],
      ['dialog', 'Streich die Begrüßungen. Fang mitten im Streit an, das kann jede Szene vertragen.'],
      ['stil', 'Schreib das erste Wort, das dir einfällt, nicht das dritte. Das dritte ist geborgt.'],
      ['stil', 'Ein kurzer Satz nach drei langen ist ein Hammer. Heb ihn dir auf.'],
      ['stil', 'Wenn du es im Thesaurus gefunden hast, gehört es nicht dir. Nimm das einfache Wort.'],
      ['ueberarbeiten', 'Zehn Prozent raus. Immer. Du findest sie — Adverbien, doppelte Bilder, der Absatz, den du so liebst.'],
      ['ueberarbeiten', 'Lies es laut. Wo du Luft holen musst, ist der Satz zu lang. Wo du gähnst, ist es zu viel.'],
      ['ueberarbeiten', 'Die Stelle, die du verteidigst, ist die, die raus muss. Ich sag das nur einmal.'],
      ['angst', 'Schreib in die Ecke, in die du nicht schauen willst. Da liegt das Buch.'],
      ['angst', 'Angst beim Schreiben ist ein gutes Zeichen: Du bist an etwas dran, das dir gehört.'],
      ['angst', 'Das Monster ist nie das Monster. Es ist das, was du tun würdest, wenn es vor der Tür steht.'],
      ['lesen', 'Lies schlechte Bücher. Die lehren dich mehr als die guten — du siehst, wo es klemmt.'],
      ['lesen', 'Immer ein Buch dabei. Immer. Die Welt ist voller Wartezeit, die dir gehört.'],
      ['ende', 'Das Ende steht schon im Anfang. Wenn nicht, geh zurück und leg es hinein.'],
      ['ende', 'Kein Ende erklärt sich. Wenn du es erklären musst, ist es keins.'],
      ['pause', 'Geh raus. Lauf eine Stunde. Die Geschichte denkt weiter, während du nicht hinschaust.'],
      ['pause', 'Sechs Wochen Schublade. Dann liest du es mit fremden Augen, und die sind gnadenlos. Gut so.']
    ],
    schluss: ['Und jetzt: an die Arbeit.', 'Mehr ist es nicht.', 'Den Rest macht die Geschichte.', 'Das ist alles, was ich weiß.', 'Geh schreiben.', 'Tu es heute, nicht morgen.', 'Kein Zauber, nur Handwerk.', 'Der Rest ist Sitzfleisch.', 'Das reicht für heute.', 'Vertrau dem Stuhl.']
  },
  {
    id: 'kaestner', name: 'Erich Kästner', jahre: '1899–1974', woher: 'Dresden · Berlin · München', bild: 'autoren/kaestner.jpg', lage: '50% 30%',
    foto: { urheber: 'Basch / Anefo, Nationaal Archief', lizenz: 'CC0 1.0', lizenzUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', seite: 'https://commons.wikimedia.org/wiki/File:Erich_K%C3%A4stner_1961_(cropped).jpg' },
    kurz: 'Der Moralist mit dem Schalk. Schreibt für Kinder, ohne sich herabzubeugen, und für Erwachsene, ohne sie zu schonen.',
    rahmen: 'gold', anrede: 'Herr Kästner',
    zitate: [
      { t: 'Es gibt nichts Gutes, außer: Man tut es.', q: '„Moral", in: Kurz und bündig, 1950' },
      { t: 'Wird’s besser? Wird’s schlimmer? fragt man alljährlich. Seien wir ehrlich: Leben ist immer lebensgefährlich.', q: '„Zum neuen Jahr"' },
      { t: 'Man soll das Jahr nicht mit Programmen beladen wie ein krankes Pferd. Wenn man es allzu sehr beschwert, bricht es zu guter Letzt zusammen.', q: '„Zum neuen Jahr"' },
      { t: 'Nur wer erwachsen wird und ein Kind bleibt, ist ein Mensch!', q: 'Ansprache zum Schulbeginn, 1950' },
      { t: 'Lasst euch die Kindheit nicht austreiben! Schaut, die meisten Menschen legen ihre Kindheit ab wie einen alten Hut. Sie vergessen sie wie eine Telefonnummer, die nicht mehr gilt.', q: 'Ansprache zum Schulbeginn, 1950' },
      { t: 'Die Zeit fährt Auto. Doch kein Mensch kann lenken. Das Leben fliegt wie ein Gehöft vorbei.', q: '„Die Zeit fährt Auto", 1931' },
      { t: 'Als sie einander acht Jahre kannten (und man darf sagen: sie kannten sich gut), kam ihre Liebe plötzlich abhanden. Wie andern Leuten ein Stock oder Hut.', q: '„Sachliche Romanze", 1929' },
      { t: 'Kennst du das Land, wo die Kanonen blühn?', q: '„Kennst du das Land, wo die Kanonen blühn?", 1928' },
      { t: 'Einst haben die Kerls auf den Bäumen gehockt, behaart und mit böser Visage. Dann hat man sie aus dem Urwald gelockt und die Welt asphaltiert und aufgestockt, bis zur dreißigsten Etage.', q: '„Die Entwicklung der Menschheit", 1932' },
      { t: 'Doch davon mal abgesehen und bei Lichte betrachtet sind sie im Grund noch immer die alten Affen.', q: '„Die Entwicklung der Menschheit", 1932' },
      { t: 'Was auch immer geschieht: Nie dürft ihr so tief sinken, von dem Kakao, durch den man euch zieht, auch noch zu trinken!', q: 'Gedicht, 1930er' },
      { t: 'An allem Unfug, der passiert, sind nicht etwa nur die schuld, die ihn tun, sondern auch die, die ihn nicht verhindern.', q: 'zugeschrieben' },
      { t: 'Humor ist der Regenschirm der Weisen.', q: 'zugeschrieben' },
      { t: 'Der Mensch soll lernen, nur die Ochsen büffeln.', q: 'zugeschrieben' }
    ],
    saetze: [
      'Schreiben Sie so, dass ein kluges Kind es versteht. Dann verstehen es auch die Erwachsenen — die tun nur so, als wäre das schwerer.',
      'Ein Satz, der sich wichtig macht, ist wie ein Herr mit Zylinder im Hinterhof. Man nimmt ihm den Hut ab und sieht nach, was darunter ist. Meist: wenig.',
      'Moral predigt man nicht. Man zeigt einen Jungen, der sein letztes Geld teilt, und sagt kein Wort dazu. Der Leser hat Augen.',
      'Wer schreibt, hat zwei Hände: eine, die das Herz hält, und eine, die den Bleistift spitzt. Lassen Sie keine von beiden los.',
      'Der Reim ist kein Schmuck. Er ist eine Falle, die zuschnappt, wenn der Gedanke fertig ist. Stellen Sie sie erst dann auf.',
      'Pathos ist Sahne auf Sahne. Ein bisschen Salz, und die Leute schmecken wieder etwas.',
      'Wenn Sie traurig sind, schreiben Sie kurz. Die langen Klagen gehören ins Tagebuch, die kurzen in die Welt.',
      'Ein Kinderbuch, das Kinder nicht ernst nimmt, ist ein Erwachsenenbuch, das sich verlaufen hat.',
      'Seien Sie genau. „Er war arm" sagt nichts. „Er zählte am Monatsende die Streichhölzer" sagt alles.',
      'Lachen ist kein Ausweichen. Wer lacht, hat genau hingeschaut — und sich entschieden, trotzdem nicht zu verzweifeln.',
      'Jeder gute Satz hat ein bisschen Berlin in sich: nicht viel Zeit, aber Augen im Kopf.',
      'Das Wichtigste am Schreiben ist das Streichen. Das Zweitwichtigste ist, sich dafür nicht zu bemitleiden.',
      'Sie haben Angst, dass es zu einfach klingt? Gut. Einfach ist das Schwierigste. Kompliziert kann jeder.',
      'Ein Held, der nie stolpert, ist ein Denkmal. Denkmäler sind etwas für Tauben, nicht für Leser.',
      'Schreiben Sie über das Mietshaus, nicht über die Menschheit. Die Menschheit wohnt im Mietshaus, das hat sie immer getan.',
      'Wenn Sie nicht wissen, wie es weitergeht, lassen Sie jemanden die Tür aufmachen. Es kommt immer jemand herein.',
      'Der Zweifel ist ein ordentlicher Mensch. Er kommt pünktlich. Bieten Sie ihm einen Stuhl an, aber nicht Ihren.',
      'Ich habe nie verstanden, warum man Kinder anlügen soll, damit sie das Leben aushalten. Das Leben ist auszuhalten — man muss es nur richtig erzählen.',
      'Ein Gedicht ist ein Gebrauchsgegenstand: ein Schirm, eine Laterne, ein Löffel. Es soll zu etwas taugen. Schön darf es nebenbei sein.',
      'Schreiben Sie das Ende zuerst, wenn Sie mögen. Dann wissen Sie wenigstens, wohin Sie die Leute führen, ehe Sie sie losschicken.',
      'Nicht alles, was man denkt, muss man drucken. Aber alles, was man druckt, sollte man gedacht haben.',
      'Halten Sie sich an die Verben. Adjektive sind Gäste; nach drei Stunden wird man sie leid.',
      'Wer nur schreibt, was er weiß, schreibt bald gar nichts mehr. Wer nur schreibt, was er erfindet, schreibt Papier. Die Mitte heißt: hinsehen.',
      'Ich mag Menschen, die sich anstrengen. Auch in Büchern. Figuren, denen alles zufliegt, fliegen mir davon.',
      'Wenn es nicht geht, gehen Sie spazieren. Der Bleistift ist geduldig, die Beine sind klüger.',
      'Die Pointe gehört ans Ende. Wer sie vorher verrät, hat den Witz zwar gemacht — aber der andere nicht gelacht.',
      'Traurige Bücher dürfen lustig sein. Lustige müssen ein bisschen traurig sein. Sonst sind sie nur Lärm.',
      'Üben Sie den zweiten Blick. Der erste sieht den Bettler. Der zweite sieht, dass er die Schuhe geputzt hat.',
      'Schreiben Sie Briefe. Nicht zum Schicken — zum Üben. Wer einem Menschen schreibt, schreibt klarer als einer, der „an die Leser" schreibt.',
      'Das Glück ist kein Dauerzustand, und ein Satz ist kein Denkmal. Beides soll man pflegen und wieder loslassen.'
    ],
    anfang: ['Sehen Sie,', 'Ich sage Ihnen etwas:', 'Mit Verlaub:', 'Eine Kleinigkeit, die keine ist:', 'Nehmen Sie es mir nicht übel:', 'Kurz und bündig:', 'Das Leben hat es mir beigebracht:', 'Lassen Sie mich deutlich werden:', 'Bei Lichte betrachtet:', 'Ich meine das freundlich:', 'Ein Rat, der nichts kostet:', 'Merken Sie sich das:'],
    kern: [
      ['anfang', 'Fangen Sie mit einer Tatsache an, nicht mit einer Stimmung. „Es regnete" ist eine Tatsache. „Es war traurig" ist eine Bitte um Mitleid.'],
      ['anfang', 'Der erste Satz darf klein sein. Ein Junge, ein Koffer, ein Bahnhof — und schon sind wir unterwegs.'],
      ['anfang', 'Beginnen Sie nicht mit dem Wetter, sondern mit einem Menschen, der das Wetter ignoriert.'],
      ['zweifel', 'Der Zweifel ist kein Urteil, er ist eine Uhr: Er zeigt an, dass Sie arbeiten.'],
      ['zweifel', 'Wer nie zweifelt, schreibt Plakate. Sie wollen doch keine Plakate schreiben.'],
      ['zweifel', 'Man darf an sich zweifeln. Man darf nur nicht aufhören, dabei zu schreiben.'],
      ['routine', 'Schreiben Sie jeden Tag eine Seite. Nicht, weil sie gut wird — weil Sie dann morgen jemand sind, der gestern geschrieben hat.'],
      ['routine', 'Ordnung auf dem Tisch, Unordnung im Kopf — so herum ist es richtig.'],
      ['routine', 'Wer wartet, bis er Lust hat, wartet. Wer anfängt, bekommt Lust. Das ist die ganze Psychologie.'],
      ['figuren', 'Geben Sie der Figur einen Beruf und eine Schwäche. Ein Lehrer, der nicht rechnen kann, ist schon ein halber Roman.'],
      ['figuren', 'Kinder sind keine kleinen Erwachsenen, und Erwachsene sind keine fertigen Kinder. Schreiben Sie beide ernst.'],
      ['figuren', 'Niemand ist nur gut. Lassen Sie den Guten einmal schummeln — dann glauben wir ihm den Rest.'],
      ['dialog', 'Menschen reden kurz, wenn es ernst wird. Lange Reden hält man nur, wenn man nichts zu sagen hat.'],
      ['dialog', 'Lassen Sie die Leute lügen. Im Gespräch lügt jeder ein wenig; daran erkennt man, dass sie leben.'],
      ['dialog', 'Ein Kind sagt: „Ich hab keinen Hunger", und meint: „Ich hab Angst." Schreiben Sie den ersten Satz, der Leser hört den zweiten.'],
      ['stil', 'Schreiben Sie, wie Sie einem klugen Kind etwas erklären: genau, freundlich, ohne Zierrat.'],
      ['stil', 'Ein Adjektiv ist wie ein Gast: Eins ist nett, drei sind eine Gesellschaft, fünf sind eine Belästigung.'],
      ['stil', 'Humor ist keine Zutat, sondern ein Blick. Wer genau hinsieht, findet ihn überall — auch im Traurigen.'],
      ['ueberarbeiten', 'Streichen ist keine Strafe. Es ist Höflichkeit gegenüber dem Leser, der auch noch etwas anderes vorhat.'],
      ['ueberarbeiten', 'Lesen Sie den Absatz, als hätte ihn ein Fremder geschrieben, den Sie nicht besonders mögen.'],
      ['ueberarbeiten', 'Was Sie dreimal sagen, glaubt man einmal. Was Sie einmal sagen, glaubt man dreimal.'],
      ['angst', 'Schreiben Sie über das, wovor Sie Angst haben, aber bleiben Sie höflich dabei. Die Angst hört besser zu, wenn man nicht schreit.'],
      ['angst', 'Man kann über alles schreiben, auch über das Schlimme. Man muss nur wissen, für wen.'],
      ['lesen', 'Lesen Sie Gedichte, auch wenn Sie Romane schreiben. Dort lernt man, dass jedes Wort kostet.'],
      ['lesen', 'Lesen Sie die Bücher Ihrer Kindheit noch einmal. Sie werden merken: Nicht die Bücher sind kleiner geworden.'],
      ['ende', 'Ein gutes Ende ist eine Tür, die man leise schließt. Knallen Sie nicht.'],
      ['ende', 'Hören Sie auf, bevor der Leser satt ist. Ein Nachtisch macht keinen Hunger wett, den es nicht gab.'],
      ['pause', 'Gehen Sie spazieren. Der Bleistift ist geduldig, und die Beine haben oft die besseren Einfälle.'],
      ['pause', 'Eine Pause ist keine Niederlage. Sie ist die Stelle, an der das Gedicht Luft holt.']
    ],
    schluss: ['So einfach ist das. Und so schwer.', 'Mehr braucht es nicht.', 'Den Rest erledigt die Zeit.', 'Probieren Sie es aus.', 'Es gibt nichts Gutes, außer man tut es.', 'Der Rest ist Fleiß — und ein bisschen Glück.', 'Und nun: an den Tisch.', 'Ich meine es gut mit Ihnen.', 'Das Übrige lernt man beim Tun.', 'Vergessen Sie das Lachen nicht dabei.']
  },
  {
    id: 'funke', name: 'Cornelia Funke', jahre: '* 1958', woher: 'Dorsten · Hamburg · Kalifornien · Volterra', bild: 'autoren/funke.jpg', lage: '50% 26%',
    foto: { urheber: 'Elena Ternovaja', lizenz: 'CC BY-SA 3.0', lizenzUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', seite: 'https://commons.wikimedia.org/wiki/File:Cornelia_Funke,_Frankfurter_Buchmesse_2023_1.jpg' },
    kurz: 'Die Tintenweberin. Zeichnet, bevor sie schreibt, und glaubt daran, dass Geschichten Türen sind.',
    rahmen: 'kupfer', anrede: 'Cornelia',
    zitate: [
      { t: 'Wenn du ein Buch auf eine Reise mitnimmst, dann geschieht etwas Seltsames: Das Buch beginnt, deine Erinnerungen zu sammeln. Du wirst es nur aufschlagen müssen, und schon bist du wieder dort, wo du zuerst darin gelesen hast.', q: 'Tintenherz, 2003 (Mo zu Meggie)' },
      { t: 'Bücher müssen schwer sein, weil die ganze Welt in ihnen steckt.', q: 'Tintenherz, 2003' },
      { t: 'Geschichten enden nie, auch wenn die Bücher uns das gern weismachen wollen. Die Geschichten gehen immer weiter.', q: 'Tintenblut, 2005 (Fenoglio)' },
      { t: 'Lesen ist Abenteuer im Kopf.', q: 'in Interviews oft zitiert' },
      { t: 'Manche Bücher muss man kosten, manche verschlingt man, und nur wenige kaut man und verdaut sie ganz.', o: 'Francis Bacon — steht als Motto in „Tintenherz"', q: 'Motto in Tintenherz (Zitat nach Francis Bacon)' }
    ],
    saetze: [
      'Zeichne deine Figur, bevor du sie schreibst. Ein Strich sagt dir, ob sie die Schultern hängen lässt — und dann weißt du, wie sie spricht.',
      'Jede Geschichte ist eine Tür. Du musst sie nicht eintreten. Klopf an, warte, und wenn jemand öffnet, geh hinein, als wärst du eingeladen.',
      'Schreib den Ort so, dass man ihn riechen kann. Staub, Regen, altes Papier. Die Leser wohnen dann dort, auch wenn sie das Buch zuklappen.',
      'Der Bösewicht muss etwas lieben. Sonst fürchte ich ihn nicht — ich glaube ihm nicht einmal.',
      'Schreib mit Tinte, wenn es hakt. Die Hand ist langsamer als der Kopf, und manchmal braucht der Kopf genau das.',
      'Du darfst Märchen ernst nehmen. Sie sind die ältesten Landkarten, die wir haben, und sie stimmen noch immer.',
      'Die Angst gehört in die Geschichte, nicht in die Schublade. Lass sie durch die Tür — aber gib der Heldin eine Laterne.',
      'Wenn du nicht weiterkommst, geh in einen Wald. Oder in eine Stadt mit Gassen. Oder ans Meer. Orte erzählen, man muss ihnen nur zuhören.',
      'Mach die Welt größer als die Handlung. Lass Dinge am Rand liegen, die nie erklärt werden — so fühlt sich ein Ort echt an.',
      'Kinder merken, wenn man sich herabbeugt. Schreib aufrecht, mit ihnen auf Augenhöhe, und trau ihnen alles zu.',
      'Eine Figur, die lügt, ist interessanter als eine, die die Wahrheit sagt. Aber lass sie einmal ehrlich sein — und zwar dann, wenn es sie etwas kostet.',
      'Die besten Einfälle kommen, wenn du etwas anderes tust. Also tu etwas anderes — und hab immer ein Heft dabei.',
      'Ein Name ist ein Zauber. Probier ihn laut, schreib ihn zehnmal, und wenn er nicht klingt wie die Figur: weg damit.',
      'Wenn die Geschichte dich überrascht, bist du auf dem richtigen Weg. Wenn du alles vorher weißt, weiß es auch der Leser.',
      'Der erste Entwurf darf hässlich sein. Es ist der Ton, aus dem man später formt — und Ton ist nie schön, nur nützlich.',
      'Lies deine Dialoge laut, am besten mit verstellter Stimme. Wenn du lachen musst, ist es gut. Wenn dir peinlich wird, streich.',
      'Schreib nicht für „die Kinder". Schreib für ein Kind — eines, das du kennst, oder das du warst.',
      'Vertrau dem Stillen. Nicht jede Szene braucht ein Feuer. Manchmal reicht ein Junge, der eine Feder aufhebt.',
      'Wenn du müde bist, zeichne. Wenn du nicht zeichnen kannst, kritzle. Die Hand findet Wege, die der Kopf nicht kennt.',
      'Schreib die Szene, auf die du Angst hast, zuerst. Dann ist sie geschrieben, und der Rest des Tages gehört dir.',
      'Figuren wachsen, wenn man sie in Gefahr bringt. Nicht in große Gefahr — in echte.',
      'Die Welt ist voller Geschichten, die noch niemand aufgeschrieben hat. Du musst nur eine davon wählen und ihr die Treue halten.',
      'Lass das Ende offen genug, dass man weiterträumen kann, und geschlossen genug, dass man schlafen kann.',
      'Kein Tag ohne eine Seite, und sei sie noch so krumm. Krumme Seiten kann man geradebiegen. Leere nicht.',
      'Manchmal ist die Figur klüger als du. Dann hör auf zu schreiben und hör zu.',
      'Bücher sind Freunde, die warten können. Aber dein Buch wartet nicht auf dich — es wächst nur, wenn du es gießt.',
      'Der Zweifel ist ein Schatten, und Schatten brauchen Licht. Mach die Lampe an und schreib trotzdem.',
      'Eine Geschichte braucht einen Gegenstand, den alle wollen: ein Buch, einen Schlüssel, eine Feder. Gib ihn der falschen Person.',
      'Schreib über die Dinge, die du liebst. Die Liebe hört man, und sie trägt durch dreihundert Seiten.',
      'Wenn du das Buch zuklappst und die Welt dahinter noch weiteratmet — dann hast du es richtig gemacht.'
    ],
    anfang: ['Weißt du,', 'Ich glaube ja:', 'Ein Gedanke:', 'Aus der Tintenwerkstatt:', 'Versprich mir eins:', 'Ganz einfach:', 'Hör zu, Schreiberling:', 'Das habe ich gelernt, als ich noch gezeichnet habe:', 'Glaub mir:', 'Ein kleiner Zauber:', 'Das darfst du:', 'Mach dir keine Sorgen:'],
    kern: [
      ['anfang', 'Fang mit einer Tür an. Jemand steht davor, und dahinter ist etwas, das nicht sein sollte.'],
      ['anfang', 'Der erste Satz ist ein Versprechen: Hier wird etwas passieren. Halte es.'],
      ['anfang', 'Beginne mit einem Gegenstand, nicht mit einem Gefühl. Ein Buch mit zerrissenem Einband, eine Feder, die zu warm ist.'],
      ['zweifel', 'Zweifel heißt, dass dir die Geschichte wichtig ist. Bei gleichgültigen Dingen zweifelt niemand.'],
      ['zweifel', 'Du schreibst nicht für die, die es besser wissen. Du schreibst für die, die es noch nicht gelesen haben.'],
      ['zweifel', 'Jede Seite, die dir misslingt, weiß mehr als die, die du nicht geschrieben hast.'],
      ['routine', 'Hab immer ein Heft in der Tasche. Die Welt schenkt dir Sätze, wenn du nicht aufpasst.'],
      ['routine', 'Schreib morgens, wenn der Kopf noch halb im Traum ist. Da sind die Türen offen.'],
      ['routine', 'Wenn die Worte nicht kommen, zeichne die Figur. Dann weißt du, wie sie steht, und sie redet.'],
      ['figuren', 'Gib deinem Helden eine Narbe und deinem Bösewicht etwas, das er liebt. Dann sind beide Menschen.'],
      ['figuren', 'Figuren verraten sich durch das, was sie in der Hand halten. Schreib die Hand.'],
      ['figuren', 'Eine Figur, die Angst hat und trotzdem geht, ist spannender als eine, die keine Angst kennt.'],
      ['dialog', 'Lass sie Dinge sagen, die nur sie sagen würden. Wenn du die Namen austauschen könntest, ist es kein Dialog.'],
      ['dialog', 'Schweigen ist auch Dialog. Schreib, was jemand nicht sagt, und warum.'],
      ['dialog', 'Kinder reden anders als Erwachsene — nicht dümmer. Schärfer.'],
      ['stil', 'Schreib so, dass man den Ort riecht. Dann glaubt man auch den Drachen.'],
      ['stil', 'Ein Bild sagt mehr als drei Adjektive. Und es bleibt länger.'],
      ['stil', 'Hab keine Angst vor schönen Sätzen. Hab Angst vor Sätzen, die nur schön sein wollen.'],
      ['ueberarbeiten', 'Beim Überarbeiten bist du die Leserin, die das Buch liebt und trotzdem die Wahrheit sagt.'],
      ['ueberarbeiten', 'Streich alles, was die Geschichte nicht weiterträgt — auch wenn es das Schönste ist, was du je geschrieben hast. Heb es auf. Es findet ein anderes Buch.'],
      ['ueberarbeiten', 'Lies den Anfang, wenn du das Ende kennst. Meist beginnt das Buch drei Seiten später.'],
      ['angst', 'Schreib die Szene, die dir Angst macht, zuerst. Danach gehört dir der Tag.'],
      ['angst', 'Angst ist eine Laterne. Sie zeigt dir, wo die Geschichte dunkel genug ist, um wichtig zu sein.'],
      ['lesen', 'Lies Märchen. Sie sind die ältesten Karten, die wir haben, und sie stimmen noch immer.'],
      ['lesen', 'Lies etwas, das dir fremd ist. Fremdes macht die eigene Stimme hörbar.'],
      ['ende', 'Lass am Ende eine Tür angelehnt. Nicht offen — angelehnt.'],
      ['ende', 'Ein Ende muss nicht erklären. Es muss sich anfühlen wie Heimkommen nach einer langen Reise.'],
      ['pause', 'Geh hinaus, schau dir einen Baum so lange an, bis er dir etwas erzählt. Dann komm zurück.'],
      ['pause', 'Pausen gehören zur Geschichte. Auch ein Buch atmet zwischen den Kapiteln.']
    ],
    schluss: ['Und dann erzähl weiter.', 'Die Geschichte wartet schon.', 'Mehr brauchst du nicht.', 'Vertrau der Tinte.', 'Der Rest ist Zauber — und Arbeit.', 'Probier es heute aus.', 'Die Tür ist offen.', 'Das genügt für einen Anfang.', 'Und hab ein Heft dabei.', 'Gieß dein Buch.']
  },
  {
    id: 'rothfuss', name: 'Patrick Rothfuss', jahre: '* 1973', woher: 'Wisconsin', bild: 'autoren/rothfuss.jpg', lage: '50% 18%',
    foto: { urheber: 'Kyle Cassidy', lizenz: 'CC BY-SA 3.0', lizenzUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', seite: 'https://commons.wikimedia.org/wiki/File:Patrick-rothfuss-2014-kyle-cassidy.jpg' },
    kurz: 'Der Namensnenner. Feilt an jedem Satz, bis er klingt wie Musik, und weiß, dass Stille drei Teile hat.',
    rahmen: 'dunkel', anrede: 'Pat',
    zitate: [
      { t: 'Es ist, als würde jeder in seinem Kopf eine Geschichte über sich selbst erzählen. Immer. Die ganze Zeit. Diese Geschichte macht dich zu dem, was du bist. Wir bauen uns aus dieser Geschichte.', o: 'It’s like everyone tells a story about themselves inside their own head. Always. All the time. That story makes you what you are. We build ourselves out of that story.', q: 'Der Name des Windes, 2007' },
      { t: 'Worte sind blasse Schatten vergessener Namen. Wie Namen Macht haben, haben Worte Macht. Worte können Feuer in den Köpfen der Menschen entzünden. Worte können den härtesten Herzen Tränen entringen.', o: 'Words are pale shadows of forgotten names. As names have power, words have power. Words can light fires in the minds of men. Words can wring tears from the hardest hearts.', q: 'Der Name des Windes, 2007' },
      { t: 'Es gibt drei Dinge, die alle weisen Männer fürchten: die See im Sturm, eine Nacht ohne Mond und den Zorn eines sanften Mannes.', o: 'There are three things all wise men fear: the sea in storm, a night with no moon, and the anger of a gentle man.', q: 'Die Furcht des Weisen, 2011' },
      { t: 'Es sind die Fragen, die wir nicht beantworten können, die uns am meisten lehren. Sie lehren uns zu denken.', o: 'It’s the questions we can’t answer that teach us the most. They teach us how to think.', q: 'Die Furcht des Weisen, 2011' },
      { t: 'Die Musik ist eine stolze, launische Geliebte. Gib ihr die Zeit und die Aufmerksamkeit, die sie verdient, und sie gehört dir. Vernachlässige sie, und es kommt der Tag, an dem du rufst und sie nicht antwortet.', o: 'Music is a proud, temperamental mistress. Give her the time and attention she deserves, and she is yours. Slight her and there will come a day when you call and she will not answer.', q: 'Der Name des Windes, 2007' },
      { t: 'Als Kinder denken wir selten an die Zukunft. Diese Unschuld lässt uns das Leben genießen, wie es wenige Erwachsene können. Der Tag, an dem wir uns um die Zukunft sorgen, ist der Tag, an dem wir die Kindheit hinter uns lassen.', o: 'When we are children we seldom think of the future. This innocence leaves us free to enjoy ourselves as few adults can. The day we fret about the future is the day we leave our childhood behind.', q: 'Der Name des Windes, 2007' },
      { t: 'Die Hälfte davon, klug zu wirken, besteht darin, zur rechten Zeit den Mund zu halten.', o: 'Half of seeming clever is keeping your mouth shut at the right times.', q: 'Der Name des Windes, 2007' },
      { t: 'Jeder kann etwas lieben, weil. Das ist so leicht, wie einen Penny in die Tasche zu stecken. Aber etwas trotzdem zu lieben. Die Fehler zu kennen und auch sie zu lieben. Das ist selten und rein und vollkommen.', o: 'Anyone can love a thing because. That’s as easy as putting a penny in your pocket. But to love something despite. To know the flaws and love them too. That is rare and pure and perfect.', q: 'Die Furcht des Weisen, 2011' },
      { t: 'Es war wieder Nacht. Der Gasthof zum Wegstein lag in Stille, und es war eine Stille aus drei Teilen.', o: 'It was night again. The Waystone Inn lay in silence, and it was a silence of three parts.', q: 'Der Name des Windes, 2007 — der erste Satz' },
      { t: 'Mein Name ist Kvothe. Ihr habt vielleicht von mir gehört.', o: 'My name is Kvothe. You may have heard of me.', q: 'Der Name des Windes, 2007' },
      { t: 'Vielleicht ist die größte Fähigkeit unseres Geistes die, mit Schmerz umzugehen.', o: 'Perhaps the greatest faculty our minds possess is the ability to cope with pain.', q: 'Der Name des Windes, 2007' },
      { t: 'Ein Dichter ist ein Musiker, der nicht singen kann. Worte müssen erst den Verstand eines Menschen finden, ehe sie sein Herz berühren können.', o: 'A poet is a musician who can’t sing. Words have to find a man’s mind before they can touch his heart.', q: 'Der Name des Windes, 2007' },
      { t: 'Wir wissen, wie gefährlich eine Maske sein kann. Wir werden alle zu dem, was wir vorgeben zu sein.', o: 'We understand how dangerous a mask can be. We all become what we pretend to be.', q: 'Der Name des Windes, 2007' },
      { t: 'Nur ein Narr sorgt sich um das, was er nicht beeinflussen kann.', o: 'Only a fool worries over what he can’t control.', q: 'Der Name des Windes, 2007' }
    ],
    saetze: [
      'Lies den Satz laut. Dann noch einmal. Wenn er beim dritten Mal nicht klingt wie ein gespannter Draht, ist er nicht fertig.',
      'Jeder Name hat ein Gewicht. Sprich ihn aus, bevor du ihn der Figur gibst — wenn er auf der Zunge falsch liegt, liegt er auch auf der Seite falsch.',
      'Die Stille hat drei Teile. Schreib alle drei: die Stille im Raum, die im Menschen und die, die zwischen den Worten liegt.',
      'Nimm dir Zeit. Ein Buch, das zwei Jahre länger braucht, ist zwei Jahre besser. Ein Buch, das zu früh kommt, bleibt ewig zu früh.',
      'Die Leser sind klüger, als Verlage glauben. Lass Lücken. Sie füllen sie mit etwas, das ihnen gehört — und deshalb lieben sie es.',
      'Magie muss Regeln haben, sonst ist sie ein Zaubertrick. Regeln machen sie teuer, und teuer macht sie wahr.',
      'Schreib die Geschichte, die jemand über sich selbst erzählt — und dann die, die wirklich passiert ist. Dazwischen liegt dein Roman.',
      'Eine Szene, in der niemand etwas will, ist keine Szene. Sie ist Wetterbericht.',
      'Schreib deine Welt so, als hätte sie seit tausend Jahren existiert, bevor der Held sie betritt. Die Wände müssen Kratzer haben.',
      'Humor ist kein Gegensatz zu Tiefe. Die traurigsten Stellen brauchen einen, der im falschen Moment lacht — sonst glaubt niemand die Trauer.',
      'Das Schwerste ist nicht der erste Satz. Es ist der zweihundertste, der noch so klingen muss wie der erste.',
      'Musik hilft. Nicht als Hintergrund — als Lehrerin. Wie ein Lied Luft holt, sollte dein Absatz Luft holen.',
      'Wenn du eine Szene kürzt, kürze bis es wehtut, und dann noch einen Satz. Der Schmerz ist der Beweis, dass du am Kern warst.',
      'Es gibt Wörter, die alles tragen, und Wörter, die nur mitlaufen. Lerne, sie zu unterscheiden — du wirst die Hälfte deines Textes verlieren und alles gewinnen.',
      'Lass deinen Helden ein Handwerk lernen. Seiten, auf denen jemand etwas kann, sind Seiten, auf denen der Leser sich ausruht und glaubt.',
      'Frag dich bei jeder Figur: Wovor hat sie Angst, und wofür würde sie sich schämen? Darin liegt ihre ganze Geschichte.',
      'Perfektion ist eine Falle und Eile eine andere. Zwischen beiden liegt ein schmaler Weg: Sorgfalt. Geh ihn.',
      'Die besten Sätze klingen, als wären sie schon immer da gewesen. Das erreicht man nur, indem man sie zwanzigmal umschreibt.',
      'Schreib die Legende von deiner Figur — was die Leute über sie erzählen. Und dann zeig, wie viel davon stimmt. Der Abstand ist die Spannung.',
      'Hab keine Angst vor der Langsamkeit. Ein Lagerfeuer brennt lange, weil man das Holz sorgfältig legt.',
      'Worte haben Macht, weil sie Namen sind. Nenne das Ding beim richtigen Namen, und es gehorcht dir auf der Seite.',
      'Wenn du nicht weißt, wie es weitergeht, erzähl es jemandem laut. Der Mund weiß oft, was die Hand noch nicht weiß.',
      'Ein Buch ist nicht fertig, wenn nichts mehr fehlt. Es ist fertig, wenn nichts mehr zu viel ist.',
      'Der Leser muss nicht alles verstehen. Er muss spüren, dass du es verstehst. Das genügt, das trägt.',
      'Lass Fragen offen. Es sind die Fragen, die bleiben, nicht die Antworten.',
      'Schreib den Satz, den du nicht schreiben kannst, als Platzhalter in Klammern. Dann geh weiter. Klammern sind geduldig.',
      'Deine Stimme findest du nicht, indem du suchst. Du findest sie, indem du so lange schreibst, bis dich jemand daran erkennt.',
      'Eine Geschichte, die zu glatt ist, gleitet ab. Gib ihr Kratzer, Widerhaken, eine Stelle, an der man hängen bleibt.',
      'Sei geduldig mit dir. Die Furcht der Weisen ist, dass es nicht gut genug wird. Die Furcht der Narren ist, dass es zu lange dauert.',
      'Hör auf eine Sache in deinem Text: den Klang. Wenn der stimmt, verzeiht man dir fast alles andere.'
    ],
    anfang: ['Also,', 'Hm. Hör zu:', 'Das ist das Geheimnis:', 'Ich hab lange gebraucht, das zu lernen:', 'Ein Wort dazu:', 'Wenn ich ehrlich bin:', 'Du kennst das vielleicht:', 'Nur so ein Gedanke:', 'Ich würde sagen:', 'Denk an die Stille:', 'Das hab ich von der Musik:', 'Ganz ruhig:'],
    kern: [
      ['anfang', 'Der erste Satz muss nicht laut sein. Er muss stimmen wie eine Saite — dann hört man ihn auch leise.'],
      ['anfang', 'Fang mit einem Geräusch an. Oder mit dem Fehlen eines Geräuschs. Stille ist der beste erste Auftritt.'],
      ['anfang', 'Beginne mit einer Legende und erzähl dann, wie es wirklich war. Der Abstand dazwischen ist die ganze Geschichte.'],
      ['zweifel', 'Zweifel ist nur Sorgfalt, die noch keine Richtung hat. Gib ihr eine: den nächsten Satz.'],
      ['zweifel', 'Du zweifelst, weil du den Klang hörst, den es haben könnte. Das ist keine Schwäche. Das ist Gehör.'],
      ['zweifel', 'Ein Buch wird nicht schlechter, weil du langsamer bist. Es wird schlechter, weil du aufhörst.'],
      ['routine', 'Schreib ein bisschen, aber schreib so, dass es klingt. Lieber drei Sätze, die stehen, als drei Seiten, die wackeln.'],
      ['routine', 'Komm jeden Tag zurück, auch wenn du nur liest, was gestern war. Die Stimme bleibt nur warm, wenn du sie benutzt.'],
      ['routine', 'Nimm dir die Zeit, die es braucht. Niemand erinnert sich, wie lange ein Buch gedauert hat — nur, ob es wahr war.'],
      ['figuren', 'Frag, wovor sie Angst hat und wofür sie sich schämt. Da wohnt die Figur.'],
      ['figuren', 'Lass ihn etwas können. Ein Handwerk, ein Instrument, eine Sprache. Können macht einen Menschen glaubwürdig.'],
      ['figuren', 'Niemand ist in seiner eigenen Geschichte der Nebenmann. Schreib die Nebenfigur, als wüsste sie das.'],
      ['dialog', 'Die Hälfte von Klugheit ist Schweigen. Lass deine klugen Figuren weniger sagen als die dummen.'],
      ['dialog', 'Ein Gespräch ist ein Tauschhandel. Wer gibt was, und was verschweigt er dabei?'],
      ['dialog', 'Lass jemanden etwas Falsches sagen und niemanden es korrigieren. Der Leser wird es tun — und ist plötzlich dabei.'],
      ['stil', 'Jedes Wort hat ein Gewicht. Wiege sie. Die schweren gehören ans Ende des Satzes.'],
      ['stil', 'Lies es laut. Wenn du stolperst, stolpert die Seite.'],
      ['stil', 'Schönheit ist nicht Zierde. Schönheit ist, wenn nichts mehr fehlt und nichts zu viel ist.'],
      ['ueberarbeiten', 'Kürze, bis es wehtut — dann noch einen Satz. Der Schmerz zeigt dir, dass du am Kern warst.'],
      ['ueberarbeiten', 'Überarbeiten heißt zuhören. Der Text sagt dir, wo er lügt; du musst nur still genug sein.'],
      ['ueberarbeiten', 'Schreib den Satz zwanzigmal, bis er klingt, als wäre er immer da gewesen. Dann hört ihn niemand mehr als Satz.'],
      ['angst', 'Schreib über deine Angst, als wäre sie ein Ort. Gib ihr Wände, Geruch, eine Tür. Dann kannst du hineingehen.'],
      ['angst', 'Das Grausame braucht Stille drumherum. Ohne Stille ist es nur Lärm.'],
      ['lesen', 'Lies Gedichte, bis du hörst, wo ein Satz atmet. Dann schreib Prosa, die atmet.'],
      ['lesen', 'Lies die Bücher, die du liebst, noch einmal — und diesmal schau, wie sie es machen.'],
      ['ende', 'Das Ende muss zurück zum Anfang schauen, ohne ihn zu wiederholen. Eine Melodie, die man wiedererkennt, in einer anderen Tonart.'],
      ['ende', 'Lass eine Frage offen. Die Fragen bleiben bei den Leuten, nicht die Antworten.'],
      ['pause', 'Spiel etwas, koch etwas, mach etwas mit den Händen. Die Hände wissen Dinge, die der Kopf verschweigt.'],
      ['pause', 'Pausen sind Teil der Musik. Ohne sie ist alles Rauschen.']
    ],
    schluss: ['Und dann schreib es noch einmal.', 'Der Rest ist Zuhören.', 'So einfach. So schwer.', 'Mehr weiß ich auch nicht.', 'Nimm dir die Zeit.', 'Vertrau deinem Ohr.', 'Die Stille wartet.', 'Das reicht für heute.', 'Lass es klingen.', 'Der Rest kommt mit der Geduld.']
  }
];

/* Zusatzdaten für den Salon: Werke, Aufgaben, Gäste. Wird von patch42 in 56-salon.js eingefügt. */
const SALON_ZUSATZ = {
  king: {
    en: true,
    werke: [['Carrie', 1974], ['Brennen muss Salem', 1975], ['Shining', 1977], ['The Stand', 1978], ['Es', 1986], ['Misery', 1987], ['Der dunkle Turm (Reihe)', 1982], ['The Green Mile', 1996], ['Das Leben und das Schreiben', 2000], ['Der Anschlag (11/22/63)', 2011], ['Billy Summers', 2021]],
    aufgaben: [
      { t: 'Schreib 300 Wörter über ein Geräusch im Keller. Kein einziges Adverb. Die Tür bleibt zu.', min: 15, ziel: 300 },
      { t: 'Eine Figur betritt ein Zimmer, in dem jemand fehlt. Zeig mir, wer fehlt, ohne es zu sagen.', min: 20, ziel: 400 },
      { t: 'Ein Dialog, in dem zwei Leute über das Wetter reden und einer davon Angst hat. Das Wort Angst kommt nicht vor.', min: 15, ziel: 250 },
      { t: 'Nimm die Szene, die du gestern geschrieben hast, und streich zehn Prozent. Zähl nach.', min: 20, ziel: 0 },
      { t: 'Der erste Satz eines Romans, den du nie schreiben wirst. Dann der zweite. Dann die erste Seite.', min: 25, ziel: 350 },
      { t: 'Beschreib einen Menschen nur über das, was er in den Taschen trägt.', min: 10, ziel: 180 }
    ]
  },
  kaestner: {
    werke: [['Herz auf Taille', 1928], ['Emil und die Detektive', 1929], ['Pünktchen und Anton', 1931], ['Fabian', 1931], ['Das fliegende Klassenzimmer', 1933], ['Drei Männer im Schnee', 1934], ['Die verschwundene Miniatur', 1935], ['Das doppelte Lottchen', 1949], ['Die Konferenz der Tiere', 1949], ['Als ich ein kleiner Junge war', 1957], ['Der kleine Mann', 1963]],
    aufgaben: [
      { t: 'Ein Gedicht mit vier Strophen über eine Straßenbahn. Reim erlaubt, Kitsch verboten.', min: 20, ziel: 120 },
      { t: 'Erzähl eine traurige Sache so, dass man an einer Stelle lachen muss — ohne die Traurigkeit zu verraten.', min: 20, ziel: 300 },
      { t: 'Ein Kind erklärt einem Erwachsenen, warum er unrecht hat. Der Erwachsene begreift es am Ende. Kein Wort zu viel.', min: 15, ziel: 250 },
      { t: 'Beschreib dein Mietshaus (oder deine Straße) in zwölf Sätzen. Jeder Satz eine Tatsache, keine Stimmung.', min: 15, ziel: 200 },
      { t: 'Schreib einen Brief an dich selbst mit zehn Jahren. Höflich, genau, ohne Ratschlag.', min: 20, ziel: 300 },
      { t: 'Eine Moral in einer Zeile — und dann die Geschichte, die sie überflüssig macht.', min: 25, ziel: 350 }
    ]
  },
  funke: {
    werke: [['Drachenreiter', 1997], ['Herr der Diebe', 2000], ['Tintenherz', 2003], ['Tintenblut', 2005], ['Tintentod', 2007], ['Reckless — Steinernes Fleisch', 2010], ['Geisterritter', 2011], ['Die Wilden Hühner (Reihe)', 1993], ['Das Labyrinth des Fauns', 2019], ['Die Farbe der Rache', 2023]],
    aufgaben: [
      { t: 'Beschreib einen Ort nur über Gerüche. Kein einziges Farbwort.', min: 12, ziel: 200 },
      { t: 'Ein Gegenstand, den alle wollen, liegt bei der falschen Person. Schreib die erste Szene.', min: 20, ziel: 350 },
      { t: 'Zeichne (oder kritzle) deine Figur — dann schreib, wie sie spricht. Drei Sätze reichen.', min: 15, ziel: 120 },
      { t: 'Schreib eine Tür, vor der jemand steht. Was dahinter ist, verrätst du nicht — aber man ahnt es.', min: 15, ziel: 250 },
      { t: 'Ein Bösewicht, der etwas liebt. Zeig das Geliebte, bevor du das Böse zeigst.', min: 20, ziel: 300 },
      { t: 'Ein Märchen in deinem Alltag: Was wäre, wenn die Straßenbahn heute nicht hält?', min: 20, ziel: 300 }
    ]
  },
  rothfuss: {
    en: true,
    werke: [['Der Name des Windes', 2007], ['Die Furcht des Weisen', 2011], ['Die Musik der Stille', 2014], ['The Narrow Road Between Desires', 2023]],
    aufgaben: [
      { t: 'Ein Absatz, in dem niemand spricht und alles gesagt wird. Drei Teile Stille.', min: 15, ziel: 200 },
      { t: 'Erzähl die Legende von deiner Figur — was die Leute sagen. Dann einen Absatz, wie es wirklich war.', min: 25, ziel: 400 },
      { t: 'Schreib einen Satz zwanzigmal um, bis er klingt wie eine gespannte Saite. Behalte alle zwanzig.', min: 20, ziel: 0 },
      { t: 'Jemand lernt ein Handwerk. Zeig drei Handgriffe so genau, dass man sie nachmachen könnte.', min: 20, ziel: 300 },
      { t: 'Gib einem Ding einen Namen — und erzähl, was passiert, wenn man ihn ausspricht.', min: 15, ziel: 250 },
      { t: 'Eine Frage, die die Geschichte nie beantwortet. Schreib die Szene, in der sie gestellt wird.', min: 15, ziel: 250 }
    ]
  }
};

const SALON_GAESTE = [
  {
    id: 'pratchett', gast: true, en: true, name: 'Terry Pratchett', jahre: '1948–2015', woher: 'Beaconsfield · Wiltshire', bild: 'autoren/pratchett.jpg', lage: '50% 22%',
    foto: { urheber: 'Luigi Novi', lizenz: 'CC BY 3.0', lizenzUrl: 'https://creativecommons.org/licenses/by/3.0/', seite: 'https://commons.wikimedia.org/wiki/File:10.12.12TerryPratchettByLuigiNovi1b.jpg' },
    kurz: 'Der Scheibenwelt-Erfinder. Lacht, damit man hinschaut, und schreibt über Menschen, auch wenn es Trolle sind.',
    rahmen: 'dunkel', anrede: 'Terry',
    zitate: [
      { t: 'Die Feder ist mächtiger als das Schwert, wenn das Schwert sehr kurz und die Feder sehr spitz ist.', o: 'The pen is mightier than the sword if the sword is very short, and the pen is very sharp.', q: 'The Light Fantastic, 1986' },
      { t: 'Geschichten aus der Fantasie neigen dazu, die zu beunruhigen, die keine haben.', o: 'Stories of imagination tend to upset those without one.', q: 'zugeschrieben' },
      { t: 'Etwas ist es nicht wert, getan zu werden, wenn nicht irgendjemand irgendwo viel lieber hätte, dass man es nicht tut.', o: 'It’s not worth doing something unless someone, somewhere, would much rather you weren’t doing it.', q: 'zugeschrieben' },
      { t: 'Weisheit kommt aus Erfahrung. Erfahrung ist oft das Ergebnis fehlender Weisheit.', o: 'Wisdom comes from experience. Experience is often a result of lack of wisdom.', q: 'zugeschrieben' },
      { t: 'Gib einem Mann Feuer, und er hat es einen Tag lang warm. Zünde ihn an, und er hat es für den Rest seines Lebens warm.', o: 'Give a man a fire and he’s warm for a day, but set fire to him and he’s warm for the rest of his life.', q: 'Jingo (Fliegende Fetzen), 1997' },
      { t: 'Das Problem mit einem offenen Geist ist natürlich, dass die Leute darauf bestehen, vorbeizukommen und Dinge hineinzulegen.', o: 'The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.', q: 'Diggers (Trucker-Trilogie), 1990' },
      { t: 'Das Licht glaubt, es sei schneller als alles andere, aber es irrt sich. Egal wie schnell das Licht reist, es findet die Dunkelheit immer schon dort vor — und sie wartet.', o: 'Light thinks it travels faster than anything but it is wrong. No matter how fast light travels, it finds the darkness has always got there first, and is waiting for it.', q: 'Reaper Man (Alles Sense!), 1991' },
      { t: 'Ein Mensch ist nicht tot, solange sein Name noch gesprochen wird.', o: 'A man is not dead while his name is still spoken.', q: 'Going Postal (Ab die Post), 2004' },
      { t: 'Manchmal ist es besser, einen Flammenwerfer anzuzünden, als die Dunkelheit zu verfluchen.', o: 'Sometimes it’s better to light a flamethrower than curse the darkness.', q: 'Men at Arms (Helle Barden), 1993' },
      { t: 'Echte Dummheit schlägt künstliche Intelligenz jedes Mal.', o: 'Real stupidity beats artificial intelligence every time.', q: 'Hogfather (Schweinsgalopp), 1996' }
    ],
    saetze: [
      'Schreib die Fußnote. Wenn sie lustiger ist als der Satz, war der Satz die Fußnote.',
      'Ein Witz ist eine Wahrheit, die sich nicht ernst nehmen lässt. Also nimm sie ernst — nur später.',
      'Die Trolle sind Menschen. Die Zwerge sind Menschen. Die Menschen sind auch Menschen, aber das merkt man erst, wenn man sie neben Trolle stellt.',
      'Dein Held muss nicht gut sein. Er muss sich weigern, schlecht zu sein, wenn es leicht wäre. Das ist Heldentum auf der Scheibe und sonstwo.',
      'Wenn du eine Regel für deine Welt machst, brich sie genau einmal — und erklär, warum das alles kostete.',
      'Der Tod redet in Großbuchstaben, weil er es nicht nötig hat, laut zu sein. Schreib deine mächtigen Figuren leise.',
      'Satire ist nicht: über Leute lachen. Satire ist: genau hinsehen und dann den Hut abnehmen.',
      'Jede Stadt braucht eine Wache, einen Markt und jemanden, der nachts die Laternen anzündet. Fang bei dem an.',
      'Schreib 400 Wörter am Tag, auch wenn sie schlecht sind. Am Ende des Jahres hast du ein schlechtes Buch — und das ist mehr, als die meisten haben. Dann machst du es gut.',
      'Lass die Nebenfigur ihre eigene Geschichte haben. Sie weiß nicht, dass sie Nebenfigur ist, und das macht sie interessant.',
      'Kopfschmuck und Mäntel verraten mehr über eine Gesellschaft als ihre Gesetze. Beschreib die Hüte.',
      'Der beste Zauber ist der, der Geld kostet. Magie ohne Preis ist Tapete.',
      'Wenn du nicht weißt, was deine Figur tun soll, frag dich, was sie gerade sicher nicht will. Dann lass genau das passieren.',
      'Ein Buch darf klug sein, solange es dabei lacht. Kluge Bücher ohne Lachen sind Vorträge.',
      'Die Leser merken, wenn du sie für dumm hältst. Sie merken auch, wenn du sie für klug hältst. Halt sie für klug.'
    ],
    anfang: ['Also, pass auf:', 'Kleine Beobachtung:', 'Die Scheibenwelt hat mich gelehrt:', 'Fußnote dazu:', 'Im Ernst — na ja, fast:', 'Hör zu, junger Schreiberling:', 'Das ist kein Witz, obwohl es so klingt:', 'Ein Gedanke mit Hut:'],
    kern: [
      ['anfang', 'Fang bei der Wache an, beim Markt oder bei dem, der die Laternen anzündet. Große Geschichten beginnen bei kleinen Leuten mit Schichtdienst.'],
      ['zweifel', 'Zweifel ist nur Intelligenz, die sich langweilt. Gib ihr Arbeit: den nächsten Absatz.'],
      ['routine', 'Vierhundert Wörter am Tag. Schlechte reichen. Am Ende des Jahres hast du ein Buch, und dann machst du es gut.'],
      ['figuren', 'Deine Figur weiß nicht, dass sie Nebenfigur ist. Schreib sie so, dann ist sie keine.'],
      ['dialog', 'Lass die Mächtigen leise reden. Wer laut ist, hat etwas zu verbergen, meist seine Unsicherheit.'],
      ['stil', 'Die Fußnote ist das Fenster, durch das die Wahrheit hereinlacht. Öffne es ab und zu.'],
      ['ueberarbeiten', 'Wenn der Witz den Satz rettet, war der Satz nicht gut genug. Streich den Satz, behalt den Witz.'],
      ['angst', 'Der Tod ist nicht gruselig. Gruselig ist ein Beamter mit einem Formular. Schreib den Beamten.'],
      ['lesen', 'Lies Geschichtsbücher. Die Menschheit hat sich alle Plots schon selbst ausgedacht, meist schlimmer.'],
      ['ende', 'Das Ende darf ein Lachen sein. Aber eins, in dem etwas mitschwingt, das nicht lacht.'],
      ['pause', 'Geh in die Küche. Die meisten Probleme der Literatur lösen sich beim Zwiebelschneiden.']
    ],
    schluss: ['Oder so ähnlich.', 'Das mit den Hüten stimmt wirklich.', 'Kein Zauber, nur Arbeit mit Humor.', 'Und jetzt vierhundert Wörter.', 'Die Scheibe dreht sich weiter.', 'Mehr weiß ich nicht, ich habe nur geschrieben.']
  },
  {
    id: 'lindgren', gast: true, name: 'Astrid Lindgren', jahre: '1907–2002', woher: 'Vimmerby · Stockholm', bild: 'autoren/lindgren.jpg', lage: '50% 20%',
    foto: { urheber: 'unbekannt (gemeinfrei)', lizenz: 'Public Domain', lizenzUrl: 'https://commons.wikimedia.org/wiki/Template:PD-old', seite: 'https://commons.wikimedia.org/wiki/File:Astrid_Lindgren_(cropped).jpg' },
    kurz: 'Die Mutter von Pippi, Michel und den Brüdern Löwenherz. Nimmt Kinder ernst und das Leben dazu.',
    rahmen: 'gold', anrede: 'Astrid',
    zitate: [
      { t: 'Das hab ich noch nie vorher versucht, also bin ich völlig sicher, dass ich es schaffe!', q: 'Pippi in Taka-Tuka-Land (Pippi Langstrumpf), 1948' },
      { t: 'Es gibt Dinge, die muss man einfach tun, sonst ist man kein Mensch, sondern nur ein Häufchen Dreck.', q: 'Die Brüder Löwenherz, 1973' },
      { t: 'Und dann muss man ja auch noch Zeit haben, einfach dazusitzen und vor sich hin zu schauen.', q: 'zugeschrieben (Interview)' },
      { t: 'Alles, was an Großem in der Welt geschah, vollzog sich zuerst in der Phantasie eines Menschen.', q: 'zugeschrieben (Rede zum Friedenspreis des Deutschen Buchhandels, 1978)' },
      { t: 'Niemals Gewalt!', q: 'Rede zum Friedenspreis des Deutschen Buchhandels, 1978' },
      { t: 'Ich will für ein Publikum schreiben, das Wunder vollbringen kann. Kinder vollbringen Wunder, wenn sie lesen.', q: 'zugeschrieben' }
    ],
    saetze: [
      'Schreib für das Kind, das du warst. Es sitzt noch da drinnen und wartet, ob du es ernst nimmst.',
      'Lass das Kind im Buch stärker sein als die Erwachsenen. Nicht, weil es wahr wäre — weil es gebraucht wird.',
      'Ein Abenteuer braucht einen Hof, einen Zaun und eine Kirschbaumleiter. Das Übrige kommt von allein.',
      'Hab keine Angst vor traurigen Geschichten. Kinder weinen und stehen wieder auf. Erwachsene weinen nicht und bleiben liegen.',
      'Schreib am Morgen im Bett, mit Bleistift, in Kurzschrift. Die Welt ist dann noch nicht da, nur die Geschichte.',
      'Die Fantasie ist kein Spielzeug. Sie ist der Ort, an dem alles Große zuerst passiert. Behandle sie wie einen Arbeitsplatz.',
      'Jeder Michel braucht einen Tischlerschuppen. Gib deiner Figur einen Ort, an dem sie allein sein und etwas schnitzen kann.',
      'Der schönste Satz der Welt ist nichts gegen einen Satz, den ein Kind laut vorlesen will.',
      'Lass deine Helden ungehorsam sein, wenn es darauf ankommt. Gehorsam hat noch nie ein Abenteuer erlebt.',
      'Schreib nicht über das Glück. Schreib über den Samstagabend, an dem man einfach dasitzt und es nicht merkt.',
      'Wenn jemand sagt, das geht nicht: Das hab ich noch nie versucht, also bin ich sicher, dass ich es schaffe. Auch beim Schreiben.',
      'Erst wenn dein Bösewicht auch einmal friert, darf er böse sein.',
      'Mut heißt nicht, keine Angst zu haben. Mut heißt, trotzdem über die Brücke zu gehen. Schreib die Brücke.',
      'Ein Buch für Kinder darf nicht lügen. Es darf trösten — aber nur mit der Wahrheit.',
      'Das Ende darf wehtun, wenn es eine Tür offen lässt. Nangijala ist eine offene Tür.'
    ],
    anfang: ['Weißt du,', 'Ich sag dir was, mein Kind:', 'So ist das:', 'Das hat mir Pippi beigebracht:', 'Aus Bullerbü weiß ich:', 'Ganz einfach:', 'Hör mal:', 'Glaub einer alten Frau:'],
    kern: [
      ['anfang', 'Fang mit einem Kind an, das etwas nicht darf. Dann tut es das. Fertig ist der Anfang.'],
      ['zweifel', 'Das hab ich noch nie versucht — also bin ich sicher, dass ich es schaffe. Sag dir das und schreib.'],
      ['routine', 'Morgens im Bett, mit Bleistift, bevor der Tag laut wird. Da gehört die Geschichte noch dir.'],
      ['figuren', 'Gib deiner Figur einen Ort, an dem sie allein ist und etwas tut. Da lernst du sie kennen.'],
      ['dialog', 'Kinder sagen, was sie meinen, und meinen mehr, als sie sagen. Schreib beides.'],
      ['stil', 'Schreib so, dass man es laut vorlesen will. Das ist der ganze Stil.'],
      ['ueberarbeiten', 'Lies es einem Kind vor. Wo es zappelt, streichst du. Wo es still wird, lässt du alles.'],
      ['angst', 'Traurig darf es sein. Kinder halten mehr aus, als Erwachsene glauben — wenn die Geschichte ehrlich ist.'],
      ['lesen', 'Lies Märchen und Zeitung, beides. Die Wunder stehen in den Märchen, die Gründe in der Zeitung.'],
      ['ende', 'Lass eine Tür offen am Ende. Eine, durch die man hinaus ins Licht geht.'],
      ['pause', 'Setz dich hin und schau vor dich hin. Das ist keine Pause vom Schreiben, das ist Schreiben ohne Bleistift.']
    ],
    schluss: ['Und dann lauf los.', 'Mehr braucht es nicht.', 'So hab ich es gemacht.', 'Versprich es mir.', 'Das genügt für einen Sommer.', 'Und sei ungehorsam dabei.']
  }
];

/* Stichworte einer Frage → Thema. Pur. */
const SALON_STICHWORTE = [
  ['anfang', /anfang|beginn|erste[rn]? satz|starten|losleg|einstieg|erste seite/i],
  ['zweifel', /zweifel|schlecht|nicht gut|unsicher|kann nicht|tauge|talent|aufgeben|zu dumm|versag/i],
  ['routine', /täglich|jeden tag|routine|diszipl|dranbleib|gewohnheit|zeit finden|keine zeit|regelmäß|durchhalt/i],
  ['figuren', /figur|held|charakter|person|protagonist|bösewicht|antagonist|name/i],
  ['dialog', /dialog|gespräch|sprechen|reden|sagen|stimme/i],
  ['stil', /stil|sprache|satz|wort|adjektiv|adverb|klang|rhythmus|schön/i],
  ['ueberarbeiten', /überarbeit|kürzen|streich|zweite fassung|lektor|edit|korrig|umschreib|zu lang/i],
  ['angst', /angst|furcht|trau|mut|horror|grusel|dunkel/i],
  ['lesen', /lesen|buch|bücher|lektüre/i],
  ['ende', /ende|schluss|abschluss|fertig|zu ende/i],
  ['pause', /pause|müde|erschöpft|blockade|leer|nichts mehr|ausgebrannt|kraft/i]
];
function salonThemaAusFrage(frage) {
  const f = String(frage || '');
  for (const [thema, rx] of SALON_STICHWORTE) if (rx.test(f)) return thema;
  return null;
}

/* Kleine Saat → Zahlenfolge, wiederholbar. Pur. */
function salonZufall(saat) {
  /* Erst mischen: nebeneinanderliegende Saaten (1, 2, 3 …) wuerden sonst fast dieselben Folgen geben */
  let s = (salonHash('saat:' + saat) ^ 0x9e3779b9) >>> 0;
  const weiter = () => { s = (s * 1664525 + 1013904223) >>> 0; s = (s ^ (s >>> 13)) >>> 0; s = Math.imul(s, 0x5bd1e995) >>> 0; s = (s ^ (s >>> 15)) >>> 0; return s / 4294967296; };
  weiter(); weiter();
  return weiter;
}
function salonHash(text) { let h = 2166136261; for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

/* Wie viele verschiedene Ratschläge eine Stimme hergibt (Handgeschriebenes + Baukasten). Pur. */
function salonVorrat(autor) {
  if (!autor) return 0;
  return (autor.saetze || []).length + (autor.anfang || []).length * (autor.kern || []).length * (autor.schluss || []).length;
}

/* Ein Rat in der Stimme einer Person. Pur: gleiche Saat, gleicher Rat.
   Etwa jeder dritte ist ein handgeschriebener Satz, die anderen kommen aus dem
   Baukasten; ein Thema grenzt den Kern ein. */
function salonRat(autor, saat = 1, thema = null) {
  if (!autor) return null;
  const z = salonZufall(saat);
  const kerne = (autor.kern || []).filter((k) => !thema || k[0] === thema);
  const saetze = autor.saetze || [];
  const themaGesetzt = !!thema;
  const nimmSatz = saetze.length && (!themaGesetzt || !kerne.length) && z() < (themaGesetzt ? .15 : .34);
  if (nimmSatz) return { text: saetze[Math.floor(z() * saetze.length)], art: 'satz', thema: null };
  if (!kerne.length) return saetze.length ? { text: saetze[Math.floor(z() * saetze.length)], art: 'satz', thema: null } : null;
  const a = autor.anfang[Math.floor(z() * autor.anfang.length)];
  const k = kerne[Math.floor(z() * kerne.length)];
  const s = autor.schluss[Math.floor(z() * autor.schluss.length)];
  const mitSchluss = z() < .7;
  return { text: (z() < .8 ? a + ' ' : '') + k[1] + (mitSchluss ? ' ' + s : ''), art: 'baukasten', thema: k[0] };
}
/* Der Rat des Tages: je Person und Tag einer. Pur. */
function salonRatDesTages(autor, tagSchluessel) { return salonRat(autor, salonHash((tagSchluessel || '') + ':' + (autor && autor.id)), null); }

/* Zusatzdaten einmischen: Werke, Aufgaben, Sprachkennung */
for (const a of SALON_AUTOREN) { const z = SALON_ZUSATZ[a.id]; if (z) Object.assign(a, z); }
/* Englische Stimmen raten auf Englisch (56a): der deutsche Rat wandert nach `de` und bleibt als Übersetzung da */
if (typeof SALON_RAT_EN !== 'undefined') for (const a of [...SALON_AUTOREN, ...SALON_GAESTE]) { const e = SALON_RAT_EN[a.id]; if (e && a.en) { a.de = { saetze: a.saetze, anfang: a.anfang, kern: a.kern, schluss: a.schluss }; Object.assign(a, e); } }
const SALON_FEST = [...SALON_AUTOREN, ...SALON_GAESTE, ...(typeof SALON_GAESTE_MEHR !== 'undefined' ? SALON_GAESTE_MEHR : [])];
/* Mehr (56g): Themen, Kern je Stimme (parallel in beiden Sprachen), Aufgaben mit Kategorie, lange Texte „Über" */
if (typeof SALON_MEHR_THEMEN !== 'undefined') {
  for (const t of SALON_MEHR_THEMEN) if (!SALON_THEMEN.some((x) => x[0] === t[0])) SALON_THEMEN.push(t);
  /* Die enger gefassten neuen Stichworte fragen zuerst (sonst schluckt „Figuren" jede „Person"),
     die weiteren („Weltenbau", „Zeigen") kommen ans Ende. */
  if (typeof SALON_MEHR_STICHWORTE !== 'undefined') {
    const frueh = ['titel', 'perspektive', 'tempo', 'humor', 'recherche', 'loslassen'];
    for (const st of SALON_MEHR_STICHWORTE) { if (frueh.includes(st[0])) SALON_STICHWORTE.unshift(st); else SALON_STICHWORTE.push(st); }
  }
  for (const a of SALON_FEST) {
    const mk = SALON_MEHR_KERN[a.id];
    if (mk) {
      if (a.en && mk.en && mk.de && a.de) { a.kern = [...a.kern, ...mk.en]; a.de.kern = [...a.de.kern, ...mk.de]; }
      else if (mk.de) a.kern = [...(a.kern || []), ...mk.de];
      else if (mk.en) a.kern = [...(a.kern || []), ...mk.en];
    }
    const ma = SALON_MEHR_AUFGABEN[a.id];
    a.aufgaben = [...(a.aufgaben || []).map((x) => x.kat ? x : Object.assign({ kat: salonAufgabeKategorie(x.t) }, x)), ...(ma || [])];
    if (SALON_UEBER[a.id]) a.ueber = SALON_UEBER[a.id];
  }
}
/* Rat samt deutscher Fassung, wo es eine gibt */
function salonRatDesTagesZweisprachig(autor, tagSchluessel) { return typeof salonRatZweisprachig === 'function' ? salonRatZweisprachig(autor, salonHash((tagSchluessel || '') + ':' + (autor && autor.id)), null) : salonRatDesTages(autor, tagSchluessel); }

/* Eigene Menschen an der Wand: Dokumente vom Typ 'mentor'. */
function salonEigene() { return vomTyp('mentor').sort((a, b) => (a.angelegt || 0) - (b.angelegt || 0)); }
function salonAlle() {
  return [...SALON_FEST, ...salonEigene().map((d) => ({ id: d.id, eigen: true, doc: d, name: d.titel || 'Ohne Namen', jahre: d.jahre || '', woher: d.woher || '', bild: null, bildId: d.bild || null, kurz: d.notiz || '', rahmen: d.rahmen || 'nuss', zitate: (d.zitate || []).map((t) => ({ t, q: d.titel || '' })), saetze: d.rat || [], anfang: [], kern: [], schluss: [], werke: [], aufgaben: [] }))];
}
function salonFinde(id) { return salonAlle().find((a) => a.id === id) || null; }
/* Gelesene Werke: je Person eine Liste — lebt in den Einstellungen (reist mit). */
function salonGelesen(a) { const g = (D.einst.salonGelesen || {})[a.id]; return Array.isArray(g) ? g : []; }
function salonGelesenSetzen(a, titel, an) {
  const alle = Object.assign({}, D.einst.salonGelesen || {});
  const liste = new Set(salonGelesen(a)); if (an) liste.add(titel); else liste.delete(titel);
  alle[a.id] = [...liste].slice(0, 200); D.einst.salonGelesen = alle; speichereEinst();
}
function salonPortraet(a, klasse) {
  if (a.bild) return el('img', { class: klasse || '', src: a.bild, alt: a.name, draggable: 'false', style: 'object-position:' + (a.lage || '50% 30%') });
  if (a.bildId) { const img = el('img', { class: klasse || '', alt: a.name, draggable: 'false' }); setzeBild(img, a.bildId); return img; }
  return el('div', { class: 'salon-monogramm ' + (klasse || '') }, (a.name || '?').slice(0, 1));
}
function salonRahmen(a, i, onclick) {
  return el('button', { class: 'salon-rahmen ' + (a.rahmen || 'nuss') + (a.eigen ? ' eigen' : '') + (a.gast ? ' gast' : ''), style: '--n:' + i, onclick, title: a.name + ': anklopfen', 'aria-label': a.name + ' anklopfen' },
    el('i', { class: 'salon-lampe' }), el('i', { class: 'salon-ecke e1' }), el('i', { class: 'salon-ecke e2' }), el('i', { class: 'salon-ecke e3' }), el('i', { class: 'salon-ecke e4' }),
    el('div', { class: 'salon-passepartout' }, el('div', { class: 'salon-foto' }, salonPortraet(a), el('i', { class: 'salon-glas' }))),
    el('div', { class: 'salon-schild' }, el('b', {}, a.name), el('span', {}, [a.jahre, a.woher].filter(Boolean).join(' · '))));
}

/* ----- Die Kenntnis: was die Wand über die eigenen Texte weiß (56e), einmal je Stand gerechnet ----- */
let _salonKenntnis = null;
function salonKenntnis() {
  if (typeof kenntnisSammeln !== 'function') return null;
  const sig = kenntnisSignatur(D.docs);
  if (_salonKenntnis && _salonKenntnis.sig === sig) return _salonKenntnis.k;
  const k = kenntnisSammeln(D.docs, { statsTage: (D.stats && D.stats.tage) || null });
  _salonKenntnis = { sig, k };
  return k;
}
/* Eine Stimme antwortet auf eine Frage zum Material — oder null, wenn die Frage nichts davon berührt. */
function salonFrageAntwort(a, frageText, saat) {
  if (typeof gespraechAntwort !== 'function') return null;
  const k = salonKenntnis();
  /* Zuerst in den Texten auf dem Gerät, dann im Gedächtnis der Einlesung */
  let ant = k && typeof kenntnisFrage === 'function' ? kenntnisFrage(k, frageText) : null;
  if ((!ant || !ant.wesen) && typeof einlesungFrage === 'function') { const e = einlesungFrage(frageText); if (e) ant = e; }
  if (!ant) return null;
  if (ant.absicht === 'werk' && ant.werk) {
    const w = ant.werk, en = !!a.en;
    return { art: 'werk', text: (en ? '„' + w.titel + '". ' : '„' + w.titel + '". ') + w.kurz, de: '', belege: [], einlesung: { art: 'werk', name: w.titel, werk: w.form + ' · ' + w.woerter.toLocaleString('de-DE') + ' Wörter', kurz: w.ton, mehr: w.kurz } };
  }
  return gespraechAntwort(a, ant, k, { anrede: salonAnrede(), saat: saat != null ? saat : salonHash(frageText + ':' + a.id) });
}
/* Eine Antwort als Element: Text, Übersetzung (bei englischen Stimmen), Belegstellen zum Antippen. */
function salonAntwortElement(a, antwort, { tippen = false } = {}) {
  const box = el('div', { class: 'sw-antwort' });
  const text = el('div', { class: 'salon-rat' + (a.en ? ' en' : '') });
  box.append(text);
  if (antwort.de) { const ueb = el('div', { class: 'salon-rat-de', hidden: 'hidden' }, antwort.de); box.append(ueb, el('button', { class: 'knopf zart salon-rat-knopf', onclick: (ev) => { ueb.hidden = !ueb.hidden; ev.currentTarget.textContent = ueb.hidden ? 'Übersetzung' : 'Übersetzung verbergen'; } }, 'Übersetzung')); }
  if (antwort.einlesung) {
    const e = antwort.einlesung;
    box.append(el('div', { class: 'sw-einlesungkarte' },
      el('span', { class: 'sw-belege-titel' }, 'Aus der Einlesung' + (e.werk ? ' · ' + e.werk : '')),
      el('b', {}, e.name), el('i', {}, e.kurz), e.mehr ? el('small', {}, e.mehr) : null));
  }
  if (antwort.belege && antwort.belege.length) {
    const bel = el('div', { class: 'sw-belege' }, el('span', { class: 'sw-belege-titel' }, 'Aus deinen Seiten'));
    for (const b of antwort.belege) bel.append(el('button', { class: 'sw-beleg', title: 'Stelle öffnen', onclick: () => { const d = D.docs.get(b.id); if (d) { oeffneDoc(d); } } }, el('i', {}, '„' + b.satz + '“'), el('small', {}, b.werk)));
    box.append(bel);
  }
  if (tippen) { const w = antwort.text.split(' '); let i = 0; const tick = () => { if (!text.isConnected) { if (i === 0) { setTimeout(tick, 120); } return; } text.textContent = w.slice(0, ++i).join(' '); if (i < w.length) setTimeout(tick, 22 + Math.random() * 30); }; setTimeout(tick, 40); }
  else text.textContent = antwort.text;
  return box;
}

/* ----- Der Raum, Stufe drei: die Wand als gemaltes Zimmer, darunter die Konsole ----- */
RENDER.salon = function (haupt) {
  const alle = salonAlle();
  const heute = tagKey();
  const info = typeof schreibtischTageszeitInfo === 'function' ? schreibtischTageszeitInfo() : { licht: 1 };
  const wand = el('div', { class: 'salon', 'data-licht': info.licht > .5 ? 'tag' : info.licht > .15 ? 'abend' : 'nacht' });
  const frageFeld = el('input', { type: 'text', placeholder: 'Frag die Wand — „Wer ist …?", „Mein Anfang ist langweilig", „Wie bleibe ich dran?" …', 'aria-label': 'Frage an die Wand' });
  const fragen = () => { const f = frageFeld.value.trim(); if (!f) { frageFeld.focus(); return; } salonRunde(f); };
  frageFeld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); fragen(); } });
  const kopf = el('div', { class: 'kopf' },
    el('h1', {}, 'Der Salon', el('div', { class: 'unter' }, 'Die Lieblingswand. Sie wissen, wie es geht — und sie reden, wenn man anklopft.')),
    el('button', { class: 'rundknopf zart', html: ik('brief'), title: 'Einen Brief an die Wand schreiben', onclick: () => salonBriefSchreiben() }),
    el('button', { class: 'rundknopf zart', html: ik('plus'), title: 'Jemanden an die Wand hängen', onclick: () => salonEigenenAnlegen() }),
    el('button', { class: 'rundknopf zart salon-tonknopf' + (salonTonAn() ? ' an' : ''), html: ik('klang'), title: salonTonAn() ? 'Salonklang ist an: Kamin und Uhr. Tippen schaltet aus.' : 'Salonklang ist aus. Tippen: Kaminknistern und die Uhr.', 'aria-pressed': salonTonAn() ? 'true' : 'false', onclick: (ev) => { salonKlang().then(() => { const an = salonTonAn(); ev.target.closest('button').classList.toggle('an', an); ev.target.closest('button').setAttribute('aria-pressed', an ? 'true' : 'false'); }); } }),
    el('button', { class: 'rundknopf zart', html: ik('stift'), title: 'Wie die Wand dich nennt', onclick: async () => { const n = await eingabe({ titel: 'Wie soll die Wand dich nennen?', wert: D.einst.salonAnrede || '', platzhalter: 'dein Name oder Spitzname' }); if (n === null) return; D.einst.salonAnrede = String(n).trim().slice(0, 40); speichereEinst(); toast(D.einst.salonAnrede ? 'Die Wand nennt dich jetzt ' + D.einst.salonAnrede + '.' : 'Die Wand nennt dich beim Profilnamen.'); zeichne(); } }),
    el('button', { class: 'rundknopf zart', html: ik('mehr'), title: 'Über die Bilder', onclick: () => salonUeberBilder() }));
  const haus = alle.filter((a) => !a.gast && !a.eigen), gaeste = alle.filter((a) => a.gast), eigene = alle.filter((a) => a.eigen);
  /* Die Wand: nur die Rahmen — oben die Hausherren, darunter kleiner die Gäste und die eigenen */
  const reihe1 = el('div', { class: 'salon-reihe haus' }, ...haus.map((a, i) => salonRahmen(a, i, () => salonSprechen(a))));
  /* Gäste und eigene Leute: in Reihen zu höchstens fünf, damit die Wand nicht überläuft */
  const rest = [...gaeste, ...eigene]; const reihen = [];
  for (let i = 0; i < rest.length; i += 5) reihen.push(el('div', { class: 'salon-reihe gaeste' }, ...rest.slice(i, i + 5).map((a, j) => salonRahmen(a, i + j + 4, () => salonSprechen(a)))));
  const reihe2 = el('div', { class: 'salon-reihen-gaeste' }, ...reihen);
  const sessel = el('button', { class: 'salon-sessel', title: 'Setz dich: eine Sitzung beginnen', 'aria-label': 'Setz dich — Sitzung beginnen', onclick: () => { if (typeof sitzungBeginnen === 'function') sitzungBeginnen(); } });
  const kamin = el('button', { class: 'salon-kaminknopf', title: 'Das Feuer: Klang an oder aus', 'aria-label': 'Kaminfeuer und Klang', onclick: () => salonKlang() });
  const galerie = el('div', { class: 'salon-galerie gemalt zimmer' }, reihe1, reihe2, sessel, kamin);
  let maler = null;
  if (typeof salonMaler === 'function') {
    const leinwand = el('canvas', { class: 'salon-malerei', 'aria-hidden': 'true' });
    galerie.prepend(leinwand);
    maler = salonMaler(leinwand);
    const beobachter = new MutationObserver(() => { if (!leinwand.isConnected) { maler.stopp(); beobachter.disconnect(); } });
    beobachter.observe(haupt, { childList: true });
  }
  /* Die Konsole unter der Wand: Rat des Tages je Person, Aufgabe, Briefe */
  const karten = el('div', { class: 'salon-konsole' });
  for (const a of alle) {
    const rat = salonRatDesTagesZweisprachig(a, heute); if (!rat) continue;
    karten.append(el('button', { class: 'salon-tageskarte', onclick: () => salonSprechen(a, { saat: salonHash(heute + ':' + a.id) }) },
      el('span', { class: 'st-kopf' }, el('span', { class: 'st-mini' }, salonPortraet(a)), el('span', { class: 'st-ueber' }, 'Rat des Tages · ' + a.name.split(' ').pop())),
      el('span', { class: 'st-text' }, rat.text), rat.de ? el('span', { class: 'st-de' }, rat.de) : null, el('span', { class: 'st-fuss' }, a.eigen ? 'aus deinen Notizen' : 'erfunden — in ' + (a.anrede || a.name) + 's Geist')));
  }
  const aufgabeHeute = (() => { const a = SALON_FEST[salonHash(heute + ':aufgabe') % SALON_FEST.length]; const l = a.aufgaben || []; return l.length ? { a, aufgabe: l[salonHash(heute + ':a') % l.length] } : null; })();
  const aufgabenkarte = aufgabeHeute ? el('button', { class: 'salon-aufgabe-heute', onclick: () => salonAufgabeAnnehmen(aufgabeHeute.a, aufgabeHeute.aufgabe) },
    el('span', { class: 'sa-foto' }, salonPortraet(aufgabeHeute.a)), el('span', { class: 'sa-text' }, el('b', {}, 'Schreibaufgabe des Tages · ' + aufgabeHeute.a.name), el('i', {}, aufgabeHeute.aufgabe.t), el('small', {}, (aufgabeHeute.aufgabe.min ? aufgabeHeute.aufgabe.min + ' Minuten' : 'ohne Uhr') + (aufgabeHeute.aufgabe.ziel ? ' · etwa ' + aufgabeHeute.aufgabe.ziel + ' Wörter' : '') + ' · tippen nimmt sie an'))) : null;
  const briefe = salonBriefeKarte();
  const frageZeile = el('div', { class: 'salon-fragezeile' }, el('span', { html: ik('suche'), style: 'display:flex;color:var(--blass)' }), frageFeld, el('button', { class: 'knopf voll', onclick: fragen }, 'Die Runde fragen'));
  anfuegen(wand, galerie, frageZeile, karten, aufgabenkarte, briefe,
    el('div', { class: 'salon-fuss' }, 'Die Zitate sind echt und tragen ihre Quelle. Die Ratschläge sind erfunden, in ihrem Geist — zusammen ' + alle.reduce((n, a) => n + salonVorrat(a), 0).toLocaleString('de-DE') + ' mögliche, jeden Tag andere.'));
  haupt.append(kopf, wand);
  if (typeof einlesungBereit === 'function') einlesungBereit().catch(() => {});
  if (maler) maler.start();
  /* Die Tippflächen genau auf das gemalte Möbel legen — der Maler weiß, wo es steht */
  if (maler && maler.flaechen) {
    const legeFlaechen = () => {
      const f = maler.flaechen(); if (!f) return;
      const setz = (elm, r) => {
        if (!elm) return;
        if (!r) { elm.style.display = 'none'; return; }
        elm.style.display = ''; elm.style.left = r.x + 'px'; elm.style.top = r.y + 'px';
        elm.style.right = 'auto'; elm.style.bottom = 'auto'; elm.style.width = r.w + 'px'; elm.style.height = r.h + 'px';
      };
      setz(sessel, f.sessel); setz(kamin, f.kamin);
    };
    requestAnimationFrame(legeFlaechen);
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!galerie.isConnected) { ro.disconnect(); return; } legeFlaechen(); }); ro.observe(galerie); }
  }
  salonBriefeNachsehen();
};

/* ----- Der Umschlag: die Einlesung einmal entsiegeln ----- */
async function salonUmschlagOeffnen() {
  const u = typeof einlesungUmschlag === 'function' ? (einlesungUmschlag() || await einlesungUmschlagHolen()) : null;
  if (!u) { toast('Neben dieser App liegt keine versiegelte Einlesung.'); return false; }
  const pass = await passwortFragen('Der versiegelte Umschlag', 'Die Wand hat deine Sammlung gelesen und alles darüber verschlossen weggelegt. Mit dem Passwort liest sie es einmal ein und merkt es sich auf diesem Gerät — es geht nie wieder hinaus.');
  if (!pass) return false;
  const warte = toast('Wird geöffnet …', 60000);
  try {
    await einlesungEntsiegeln(pass);
    toast('Der Umschlag ist offen. Die Wand weiß wieder, was sie gelesen hat.', 4000);
    zeichne();
    return true;
  } catch (e) {
    toast('Das Passwort passt nicht — oder die Datei ist beschädigt.', 4000);
    return false;
  }
}

/* ----- Deine Welten: eine Seite im Sprechfenster, auf der die Stimme über die eigenen Texte redet ----- */
function salonWeltenSeite(a) {
  const seite = el('div', { class: 'salon-seite salon-welten' });
  const anrede = salonAnrede();
  const du = anrede || 'du';
  const ein = typeof salonEinlesung === 'function' ? salonEinlesung() : null;
  const stimme = ein && ein.stimmen ? ein.stimmen[a.id] : null;
  const fuell = (t) => String(t || '').replace(/\{anrede\}/g, du);
  let gestartet = false;
  seite._starten = async () => {
    if (gestartet) return; gestartet = true;
    if (typeof einlesungBereit === 'function') { try { await einlesungBereit(); } catch (e) {} }
    if (!ein && typeof einlesungDa === 'function' && !einlesungDa()) {
      /* Versiegelt: nur der Umschlag ist zu sehen */
      const u = typeof einlesungUmschlag === 'function' ? einlesungUmschlag() : null;
      const datum = u && u.stand ? new Date(u.stand + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
      seite.append(el('div', { class: 'sw-umschlag' },
        el('span', { class: 'sw-belege-titel' }, 'Versiegelt'),
        el('i', {}, u ? (a.anrede || a.name) + ' hat deine Sammlung gelesen' + (datum ? ' — am ' + datum : '') + (u.werke ? ', ' + u.werke + ' Werke' : '') + '. Alles darüber liegt verschlossen neben der App.' : 'Neben dieser App liegt keine versiegelte Einlesung.'),
        u ? el('button', { class: 'knopf voll', onclick: () => salonUmschlagOeffnen() }, 'Umschlag öffnen') : null,
        el('small', {}, 'Einmal das Passwort, dann bleibt es auf diesem Gerät. Im Repo steht nur Rauschen.')));
    }
    const k = salonKenntnis();
    /* --- Kopf: der Stand der Einlesung --- */
    if (ein && stimme) {
      const datum = new Date(ein.stand + 'T12:00:00');
      const dazu = k && !k.leer && k.woerter > ein.woerter ? k.woerter - ein.woerter : 0;
      seite.append(el('div', { class: 'sw-stand' },
        (a.anrede || a.name) + ' hat „' + ein.titel + '" am ' + datum.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) + ' gelesen — damals ' + ein.woerter.toLocaleString('de-DE') + ' Wörter in ' + ein.werke.length + ' Werken.' + (dazu ? ' Seitdem sind ' + dazu.toLocaleString('de-DE') + ' Wörter dazugekommen; die kennt ' + (a.anrede || a.name) + ' aus dem, was gerade auf dem Gerät liegt.' : '')));
      const gruss = el('div', { class: 'salon-rat' + (a.en ? ' en' : '') }, fuell(stimme.gruss));
      seite.append(gruss);
      if (a.en && stimme.grussDe) { const ueb = el('div', { class: 'salon-rat-de', hidden: 'hidden' }, fuell(stimme.grussDe)); seite.append(ueb, el('button', { class: 'knopf zart salon-rat-knopf', onclick: (ev) => { ueb.hidden = !ueb.hidden; ev.currentTarget.textContent = ueb.hidden ? 'Übersetzung' : 'Übersetzung verbergen'; } }, 'Übersetzung')); }
    }
    /* --- Reiter innerhalb der Seite --- */
    const felder = {};
    const reiter = el('div', { class: 'sw-reiter' });
    const zeigeFeld = (id) => { for (const key of Object.keys(felder)) felder[key].classList.toggle('an', key === id); $$('button', reiter).forEach((b) => b.classList.toggle('an', b.dataset.feld === id)); };
    const reiterKnopf = (id, name) => el('button', { class: 'sw-reiterknopf', 'data-feld': id, onclick: () => zeigeFeld(id) }, name);

    /* 1. Was aufgefallen ist */
    const auf = el('div', { class: 'sw-feld' });
    if (stimme) {
      const saetze = a.en && stimme.saetzeDe ? stimme.saetze.map((t, n) => [t, stimme.saetzeDe[n]]) : (stimme.saetze || []).map((t) => [t, '']);
      for (const [t, de] of saetze) {
        const p = el('div', { class: 'sw-notiz' }, el('i', { class: a.en ? 'en' : '' }, fuell(t)));
        if (de) { const u = el('small', { hidden: 'hidden' }, fuell(de)); p.append(u, el('button', { class: 'sw-mini', onclick: (ev) => { u.hidden = !u.hidden; ev.currentTarget.textContent = u.hidden ? 'Übersetzung' : 'verbergen'; } }, 'Übersetzung')); }
        auf.append(p);
      }
      if (stimme.stelle) auf.append(el('div', { class: 'sw-lieblingsstelle' },
        el('span', { class: 'sw-belege-titel' }, 'Der Satz, den ' + (a.anrede || a.name) + ' behalten hat'),
        el('i', {}, '„' + stimme.stelle.s + '"'), el('small', {}, stimme.stelle.w),
        el('em', {}, a.en && stimme.stelle.warumDe ? stimme.stelle.warum + ' — ' + stimme.stelle.warumDe : stimme.stelle.warum)));
    }
    if (stimme) felder.auf = auf;

    /* 2. Deine Werke */
    const werke = el('div', { class: 'sw-feld' });
    if (ein) for (const w of ein.werke) werke.append(el('div', { class: 'sw-werk' },
      el('b', {}, w.titel), el('small', {}, w.form + ' · ' + w.woerter.toLocaleString('de-DE') + ' Wörter · ' + w.ton),
      el('i', {}, w.kurz)));
    if (ein) felder.werke = werke;

    /* 3. Deine Leute — Figuren aus der Einlesung, die diese Stimme kommentiert hat */
    const leute = el('div', { class: 'sw-feld' });
    if (ein && stimme && stimme.figuren) {
      const namen = Object.keys(stimme.figuren);
      const box = el('div', { class: 'sw-antwortbox' });
      const chips = el('div', { class: 'sw-chips' });
      const zeigeFigur = (name) => {
        const f = einlesungFigur(name), n = stimme.figuren[name];
        box.innerHTML = '';
        box.append(el('div', { class: 'sw-einlesungkarte' }, el('span', { class: 'sw-belege-titel' }, 'Aus der Einlesung' + (f && f.werk ? ' · ' + f.werk : '')), el('b', {}, name), f ? el('i', {}, f.kurz) : null, f && f.mehr ? el('small', {}, f.mehr) : null));
        const t = el('div', { class: 'salon-rat' + (a.en ? ' en' : '') }, n.t);
        box.append(t);
        if (n.de) { const u = el('div', { class: 'salon-rat-de', hidden: 'hidden' }, n.de); box.append(u, el('button', { class: 'knopf zart salon-rat-knopf', onclick: (ev) => { u.hidden = !u.hidden; ev.currentTarget.textContent = u.hidden ? 'Übersetzung' : 'Übersetzung verbergen'; } }, 'Übersetzung')); }
        /* Was die Wand sonst noch aus deinen Texten dazu weiß */
        if (k && !k.leer) { const lebt = (k.figuren || []).find((x) => x.name === name || x.name === (name.split(' ')[0])); if (lebt) box.append(el('div', { class: 'sw-hinweis' }, 'In deinen Texten auf diesem Gerät kommt ' + name + ' ' + lebt.n + '-mal vor' + (lebt.werke && lebt.werke[0] ? ', vor allem in ' + lebt.werke[0].name : '') + '.')); }
        const andere = typeof einlesungStimmenZu === 'function' ? einlesungStimmenZu(name).filter((id) => id !== a.id) : [];
        if (andere.length) box.append(el('div', { class: 'sw-hinweis' }, 'Dazu haben auch ' + andere.map((id) => (salonFinde(id) || { name: id }).name).join(', ') + ' etwas gesagt.'));
      };
      for (const name of namen) chips.append(el('button', { class: 'suchchip figur', onclick: (ev) => { $$('button', chips).forEach((c) => c.classList.remove('an')); ev.currentTarget.classList.add('an'); zeigeFigur(name); } }, name));
      leute.append(chips, box);
      if (namen.length) zeigeFigur(namen[0]);
    }
    if (ein && stimme && stimme.figuren) felder.leute = leute;

    /* 4. Fragen an dich */
    const fragen = el('div', { class: 'sw-feld' });
    if (stimme && (stimme.fragen || []).length) {
      fragen.append(el('div', { class: 'sw-hinweis' }, (a.anrede || a.name) + ' hat sich das beim Lesen aufgeschrieben. Tippen legt ein Blatt damit an.'));
      (stimme.fragen || []).forEach((f, n) => {
        const de = a.en && stimme.fragenDe ? stimme.fragenDe[n] : '';
        fragen.append(el('button', { class: 'sw-frage', onclick: () => { const b = blattAusText('Frage von ' + a.name, (a.en && de ? de + '\n(' + f + ')' : f) + '\n\n'); zu(); oeffneSchreibraum(b.id); } },
          el('i', { class: a.en ? 'en' : '' }, fuell(f)), de ? el('small', {}, fuell(de)) : null, el('small', { class: 'sw-frage-fuss' }, 'tippen: damit ein Blatt beginnen')));
      });
    }
    if (stimme && (stimme.fragen || []).length) felder.fragen = fragen;

    /* 5. Jetzt gerade — die lebendige Kenntnis */
    const live = el('div', { class: 'sw-feld' });
    const antwortBox = el('div', { class: 'sw-antwortbox' });
    const zeige = (antwort) => { antwortBox.innerHTML = ''; if (antwort) antwortBox.append(salonAntwortElement(a, antwort, { tippen: true })); };
    if (!k || k.leer) live.append(el('div', { class: 'sw-hinweis' }, 'Auf diesem Gerät liegen noch keine Texte. Sobald du schreibst, liest die Wand mit.'), antwortBox), zeige(gespraechAntwort(a, null, k, { anrede }));
    else {
      const chips = el('div', { class: 'sw-chips' });
      const chip = (text, klasse, tun) => chips.append(el('button', { class: 'suchchip ' + (klasse || ''), onclick: (ev) => { $$('button', chips).forEach((c) => c.classList.remove('an')); ev.currentTarget.classList.add('an'); tun(); } }, text));
      const frageMit = (absicht, wesen) => ({ absicht, wesen, belege: wesen ? (wesen.beispiele || []).slice(0, 4) : [], frage: '' });
      for (const f of k.figuren.slice(0, 14)) chip(f.name, 'figur', () => zeige(gespraechAntwort(a, frageMit('wer', Object.assign({ art: 'figur' }, f)), k, { anrede, saat: salonHash(f.name + ':' + a.id) })));
      for (const o of k.orte.slice(0, 6)) chip(o.name, 'ort', () => zeige(gespraechAntwort(a, frageMit('wo', Object.assign({ art: 'ort' }, o)), k, { anrede, saat: salonHash(o.name + ':' + a.id) })));
      for (const b of k.begriffe.slice(0, 8)) chip(b.name, 'begriff', () => zeige(gespraechAntwort(a, frageMit('wer', Object.assign({ art: 'begriff' }, b)), k, { anrede, saat: salonHash(b.name + ':' + a.id) })));
      chip('Meine Werke', 'sw-meta', () => zeige(gespraechAntwort(a, { absicht: 'werke' }, k, { anrede })));
      chip('Zahlen', 'sw-meta', () => zeige(gespraechAntwort(a, { absicht: 'zahl' }, k, { anrede })));
      chip('Ein Satz von mir', 'sw-meta', () => zeige(gespraechAntwort(a, { absicht: 'stelle' }, k, { anrede, saat: Math.floor(Math.random() * 1e9) })));
      chip('Wo war ich zuletzt?', 'sw-meta', () => zeige(gespraechAntwort(a, { absicht: 'wann' }, k, { anrede })));
      const feld = el('input', { type: 'text', class: 'sw-feldfrage', placeholder: 'Frag ' + (a.anrede || a.name) + ' — „Wer ist …?", „Zeig mir eine Stelle mit …", „Wo spielt das?"', 'aria-label': 'Frage zu deinen Texten' });
      const fragenJetzt = () => {
        const f = feld.value.trim(); if (!f) return;
        let ant = salonFrageAntwort(a, f);
        if (!ant) {
          const thema = salonThemaAusFrage(f);
          const r = (typeof salonRatZweisprachig === 'function' ? salonRatZweisprachig : salonRat)(a, salonHash(f + ':' + a.id), thema);
          ant = r ? { art: 'rat', text: r.text, de: r.de || '', belege: [] } : gespraechAntwort(a, { absicht: 'unbekannt' }, k, { anrede });
        }
        zeige(ant);
      };
      feld.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); fragenJetzt(); } });
      live.append(chips, el('div', { class: 'sw-fragezeile' }, feld, el('button', { class: 'knopf voll', onclick: fragenJetzt }, 'Fragen')), antwortBox,
        el('div', { class: 'sw-hinweis' }, 'Das kommt aus deinen Blättern, Heften, Szenen und Schnipseln auf diesem Gerät: ' + (k.woerter || 0).toLocaleString('de-DE') + ' Wörter, ' + k.figuren.length + ' Figuren, ' + k.orte.length + ' Schauplätze, ' + k.begriffe.length + ' Begriffe. Nichts davon verlässt das Gerät.'));
      zeige(gespraechAntwort(a, { absicht: 'gruss' }, k, { anrede, saat: salonHash(tagKey() + ':' + a.id) }));
    }
    felder.live = live;

    /* 6. Chronik — was seit der Einlesung dazugekommen ist */
    const chronik = el('div', { class: 'sw-feld' });
    const baueChronik = () => {
      chronik.innerHTML = '';
      const v = typeof salonUnterschied === 'function' ? salonUnterschied() : null;
      const lesungen = typeof salonLesungen === 'function' ? salonLesungen() : [];
      if (ein) chronik.append(el('div', { class: 'sw-chronikzeile' }, el('b', {}, 'Die große Lesung'),
        el('small', {}, new Date(ein.stand + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + ein.woerter.toLocaleString('de-DE') + ' Wörter · ' + ein.werke.length + ' Werke'),
        el('i', {}, (a.anrede || a.name) + ' hat alles gelesen, was damals dalag.')));
      for (const l of lesungen) {
        let notiz = '';
        try { const n = typeof l.notizen === 'string' ? JSON.parse(l.notizen) : l.notizen; notiz = (n && n[a.id]) || ''; } catch (e) {}
        chronik.append(el('div', { class: 'sw-chronikzeile' }, el('b', {}, 'Nachgelesen'), el('small', {}, fmtDatum(l.angelegt || 0)), notiz ? el('i', {}, notiz) : null));
      }
      if (v && v.etwasNeu) {
        const zahl = (n) => Number(n || 0).toLocaleString('de-DE');
        chronik.append(el('div', { class: 'sw-chronikzeile offen' }, el('b', {}, 'Seitdem'),
          el('small', {}, (v.woerterPlus > 0 ? '+' + zahl(v.woerterPlus) + ' Wörter' + (v.tage ? ' in ' + v.tage + (v.tage === 1 ? ' Tag' : ' Tagen') : '') : 'auf diesem Gerät: ' + zahl((salonKenntnis() || {}).woerter || 0) + ' Wörter')),
          el('i', {}, [v.neueWerke.length ? v.neueWerke.length + (v.neueWerke.length === 1 ? ' neuer Text' : ' neue Texte') : '', v.neueFiguren.length ? v.neueFiguren.length + (v.neueFiguren.length === 1 ? ' neuer Name' : ' neue Namen') + ' (' + v.neueFiguren.slice(0, 5).join(', ') + ')' : '', v.gewachsen.length ? 'gewachsen: ' + v.gewachsen.slice(0, 3).map((g) => g.name).join(', ') : ''].filter(Boolean).join(' · ') || 'nur ein paar Wörter mehr.'),
          el('button', { class: 'knopf voll', onclick: () => {
            const erg = salonNachlesen();
            if (!erg) return;
            toast((a.anrede || a.name) + ' hat nachgelesen.', 3000);
            baueChronik();
          } }, 'Jetzt nachlesen lassen')));
      } else if (!lesungen.length) chronik.append(el('div', { class: 'sw-hinweis' }, 'Seit der großen Lesung ist noch nichts Neues dazugekommen. Sobald du schreibst, kann die Wand nachlesen.'));
    };
    baueChronik();
    felder.chronik = chronik;

    anfuegen(reiter,
      felder.auf ? reiterKnopf('auf', 'Was mir auffiel') : null,
      felder.leute ? reiterKnopf('leute', 'Deine Leute') : null,
      felder.werke ? reiterKnopf('werke', 'Deine Werke') : null,
      felder.fragen ? reiterKnopf('fragen', 'Fragen an dich') : null,
      reiterKnopf('live', 'Jetzt gerade'), reiterKnopf('chronik', 'Chronik'));
    anfuegen(seite, reiter, felder.auf, felder.leute, felder.werke, felder.fragen, felder.live, felder.chronik);
    zeigeFeld(felder.auf ? 'auf' : 'live');
  };
  return seite;
}

/* ----- Briefe an die Wand: man schreibt, und nach drei Tagen antwortet die Person ----- */
function saubereSalonBriefe(roh) {
  return (Array.isArray(roh) ? roh : []).filter((b) => b && typeof b === 'object' && typeof b.an === 'string').slice(-40).map((b) => ({ an: b.an.slice(0, 40), docId: typeof b.docId === 'string' ? b.docId.slice(0, 80) : '', wann: begrenze(b.wann, 0, 4102444800000, 0), beantwortet: b.beantwortet === true, frage: String(b.frage || '').slice(0, 200) }));
}
function salonBriefe() { return saubereSalonBriefe(D.einst.salonBriefe); }
function salonBriefeSpeichern(liste) { D.einst.salonBriefe = saubereSalonBriefe(liste); speichereEinst(); }
const SALON_ANTWORT_TAGE = 3;
function salonBriefSchreiben(vorgewaehlt) {
  const stimmen = SALON_FEST;
  let an = vorgewaehlt || stimmen[0].id;
  const wahl = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
  for (const a of stimmen) wahl.append(el('button', { class: an === a.id ? 'an' : '', onclick: (ev) => { an = a.id; $$('button', wahl).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); } }, a.name.split(' ').pop()));
  const kasten = el('div', { class: 'modal' }, el('h2', {}, 'Ein Brief an die Wand'),
    el('p', { style: 'font-size:14px;line-height:1.5;color:var(--blass)' }, 'Du schreibst einen Brief — an wen du willst. Er landet bei deinen Blättern. Nach ' + SALON_ANTWORT_TAGE + ' Tagen liegt eine Antwort auf der Konsole: erfunden, in der Stimme der Person, aber zu dem, was du gefragt hast.'),
    el('div', { class: 'einstellgruppe' }, el('b', {}, 'An'), wahl),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Nicht jetzt'), el('button', { class: 'knopf voll', onclick: () => {
      const a = salonFinde(an) || stimmen[0];
      const b = blattAusText('Brief an ' + a.name, (a.en ? 'Dear ' : 'Liebe' + (a.id === 'funke' || a.id === 'lindgren' || a.id === 'blyton' ? ' ' : 'r ')) + (a.anrede || a.name) + ',\n\n');
      salonBriefeSpeichern([...salonBriefe(), { an: a.id, docId: b.id, wann: Date.now(), beantwortet: false, frage: '' }]);
      zu(); oeffneSchreibraum(b.id);
      toast('Der Brief liegt bei den Blättern. In ' + SALON_ANTWORT_TAGE + ' Tagen kommt Antwort.', 3600);
    } }, 'Schreiben')));
  const zu = zeigeDeck(kasten);
}
/* Antworten, die fällig sind, werden als Schnipsel abgelegt — einmal. */
function salonBriefeNachsehen() {
  const liste = salonBriefe(); let geaendert = false;
  for (const b of liste) {
    if (b.beantwortet || Date.now() - b.wann < SALON_ANTWORT_TAGE * 86400000) continue;
    const a = salonFinde(b.an); if (!a) { b.beantwortet = true; geaendert = true; continue; }
    const brief = D.docs.get(b.docId);
    const thema = brief ? salonThemaAusFrage(brief.text || '') : null;
    const zw = typeof salonRatZweisprachig === 'function' ? salonRatZweisprachig : salonRat;
    const r1 = zw(a, salonHash(b.docId + ':1'), thema), r2 = zw(a, salonHash(b.docId + ':2'), null);
    const satz = (r) => r ? r.text + (r.de ? '\n(' + r.de + ')' : '') : '';
    const text = 'Antwort von ' + a.name + (brief ? ' auf „' + (brief.titel || 'deinen Brief') + '“' : '') + '\n\n' + satz(r1) + (r2 && r2.text !== (r1 || {}).text ? '\n\n' + satz(r2) : '') + '\n\n— ' + (a.anrede || a.name) + ' (erfunden, in seinem Geist — aus dem Salon)';
    neuDoc('schnipsel', { text });
    b.beantwortet = true; geaendert = true;
    toast('Post von der Wand: ' + a.name + ' hat geantwortet — sie liegt in den Schnipseln.', 5000);
  }
  if (geaendert) salonBriefeSpeichern(liste);
}
function salonBriefeKarte() {
  const offen = salonBriefe().filter((b) => !b.beantwortet);
  if (!offen.length) return null;
  return el('div', { class: 'salon-briefe' }, el('div', { class: 'salon-abschnitt' }, 'Briefe unterwegs'),
    ...offen.map((b) => { const a = salonFinde(b.an); const rest = Math.max(0, Math.ceil((b.wann + SALON_ANTWORT_TAGE * 86400000 - Date.now()) / 86400000)); return el('button', { class: 'salon-brief', onclick: () => { const d = D.docs.get(b.docId); if (d) oeffneDoc(d); } }, el('span', { class: 'st-mini' }, a ? salonPortraet(a) : null), el('span', {}, el('b', {}, 'An ' + (a ? a.name : b.an)), el('small', {}, rest ? 'Antwort in ' + rest + (rest === 1 ? ' Tag' : ' Tagen') : 'Antwort kommt beim nächsten Besuch'))); }));
}

/* Ein Zitat zeigen: bei englischen Stimmen zuerst das Original, die Übersetzung auf Tipp. */
function salonZitatElement(a, z, mitLesung) {
  const en = !!(a.en && z.o);
  const haupt = el('div', { class: 'sz-text' + (en ? ' en' : '') }, en ? '“' + z.o + '”' : '„' + z.t + '“');
  const ueb = en ? el('div', { class: 'sz-uebersetzung', hidden: 'hidden' }, '„' + z.t + '“') : (z.o ? el('div', { class: 'sz-original' }, z.o) : null);
  const knoepfe = el('div', { class: 'sz-knoepfe' },
    en ? el('button', { class: 'knopf zart', onclick: (ev) => { ueb.hidden = !ueb.hidden; ev.currentTarget.textContent = ueb.hidden ? 'Übersetzung' : 'Übersetzung verbergen'; } }, 'Übersetzung') : null,
    el('button', { class: 'knopf zart', onclick: () => { neuDoc('schnipsel', { text: (en ? '“' + z.o + '”\n„' + z.t + '“' : '„' + z.t + '“') + '\n— ' + a.name + (z.q ? ', ' + z.q : '') }); toast('Liegt als Zitat in den Schnipseln.'); } }, 'Als Schnipsel'),
    el('button', { class: 'knopf zart', onclick: async () => { try { await navigator.clipboard.writeText((en ? '“' + z.o + '” — ' : '„' + z.t + '“ — ') + a.name + (z.q ? ', ' + z.q : '')); toast('Kopiert.'); } catch (e) { toast('Kopieren ging hier nicht.'); } } }, 'Kopieren'),
    mitLesung && typeof vorlesen === 'function' ? el('button', { class: 'knopf zart', onclick: (ev) => { const f = ev.currentTarget.closest('.modal'); if (f) { f.classList.add('liest'); setTimeout(() => f.classList.remove('liest'), 6000); } vorlesen(z.t + '. ' + a.name, ev.currentTarget); } }, 'Lesung') : null);
  return el('div', { class: 'salon-zitat' }, haupt, ueb, el('div', { class: 'sz-quelle' }, '— ' + a.name + (z.q ? ', ' + z.q : '')), knoepfe);
}

/* Die Person spricht: Fenster mit Rat, Zitaten, Aufgaben, Werken und Über. */
function salonSprechen(a, { thema = null, saat = null, reiterStart = 'rat' } = {}) {
  let themaJetzt = thema, zaehler = 0;
  let saatJetzt = saat != null ? saat : Math.floor(Math.random() * 1e9);
  const sprech = el('div', { class: 'salon-sprech' });
  const chips = el('div', { class: 'salon-themen' });
  const tippe = (ziel, text, fertig) => { const w = text.split(' '); let i = 0; const tick = () => { if (!ziel.isConnected) return; ziel.textContent = w.slice(0, ++i).join(' '); if (i < w.length) setTimeout(tick, 26 + Math.random() * 38); else if (fertig) fertig(); }; tick(); };
  const zeigeRat = () => {
    const r = (typeof salonRatZweisprachig === 'function' ? salonRatZweisprachig : salonRat)(a, saatJetzt + zaehler * 7919, themaJetzt);
    sprech.innerHTML = '';
    if (!r) { sprech.append(el('div', { class: 'salon-leer' }, a.eigen ? 'Noch kein Rat hinterlegt — beim Bearbeiten kannst du Sätze in ' + a.name + 's Stimme eintragen.' : 'Dazu fällt mir gerade nichts ein.')); return; }
    const text = el('div', { class: 'salon-rat' + (a.en ? ' en' : '') });
    const ueb = r.de ? el('div', { class: 'salon-rat-de', hidden: 'hidden' }, r.de) : null;
    anfuegen(sprech, text, ueb, el('div', { class: 'salon-ratfuss' }, a.eigen ? 'aus deinen Notizen' : 'erfunden, in ' + (a.anrede || a.name) + 's Geist' + (r.thema ? ' · ' + (SALON_THEMEN.find((t) => t[0] === r.thema) || [])[1] : ''),
      ueb ? el('button', { class: 'knopf zart salon-rat-knopf', onclick: (ev) => { ueb.hidden = !ueb.hidden; ev.currentTarget.textContent = ueb.hidden ? 'Übersetzung' : 'Übersetzung verbergen'; } }, 'Übersetzung') : null));
    tippe(text, r.text);
  };
  /* Neunzehn Themen sind viel für eine Zeile: die ersten acht stehen da, der Rest klappt auf. */
  let themenOffen = false;
  const baueChips = () => {
    chips.innerHTML = '';
    chips.append(el('button', { class: 'suchchip' + (themaJetzt ? '' : ' an'), onclick: () => { themaJetzt = null; zaehler++; baueChips(); zeigeRat(); } }, 'Egal was'));
    if (a.eigen) return;
    const meine = SALON_THEMEN.filter(([id]) => (a.kern || []).some((k) => k[0] === id));
    const sichtbar = themenOffen ? meine : meine.slice(0, 7);
    for (const [id, name] of sichtbar) chips.append(el('button', { class: 'suchchip' + (themaJetzt === id ? ' an' : ''), onclick: () => { themaJetzt = id; zaehler++; baueChips(); zeigeRat(); } }, name));
    /* Ein gewähltes Thema bleibt sichtbar, auch wenn es weiter hinten steht */
    if (themaJetzt && !sichtbar.some(([id]) => id === themaJetzt)) {
      const t = meine.find(([id]) => id === themaJetzt);
      if (t) chips.append(el('button', { class: 'suchchip an', onclick: () => { themenOffen = true; baueChips(); } }, t[1]));
    }
    if (meine.length > sichtbar.length || themenOffen) chips.append(el('button', { class: 'suchchip still', onclick: () => { themenOffen = !themenOffen; baueChips(); } }, themenOffen ? 'weniger' : '+ ' + (meine.length - sichtbar.length) + ' Themen'));
  };
  baueChips();
  const zitate = el('div', { class: 'salon-zitate' });
  if (!(a.zitate || []).length) zitate.append(el('div', { class: 'salon-leer' }, 'Noch keine Zitate.'));
  else { if (a.en) zitate.append(el('div', { class: 'salon-hinweis' }, 'Im Original. „Übersetzung" zeigt die deutsche Fassung.')); for (const z of a.zitate) zitate.append(salonZitatElement(a, z, true)); }
  const aufgaben = el('div', { class: 'salon-aufgaben' });
  if (!(a.aufgaben || []).length) aufgaben.append(el('div', { class: 'salon-leer' }, a.eigen ? 'Eigene Leute stellen (noch) keine Aufgaben.' : 'Keine Aufgaben.'));
  else {
    const kats = typeof SALON_AUFGABEN_KATEGORIEN !== 'undefined' ? SALON_AUFGABEN_KATEGORIEN : [];
    const gruppen = new Map();
    for (const au of a.aufgaben) { const kat = au.kat || 'Spiel'; if (!gruppen.has(kat)) gruppen.set(kat, []); gruppen.get(kat).push(au); }
    const reihenfolge = [...kats.filter((k) => gruppen.has(k)), ...[...gruppen.keys()].filter((k) => !kats.includes(k))];
    for (const kat of reihenfolge) {
      aufgaben.append(el('div', { class: 'salon-abschnitt' }, kat + ' · ' + gruppen.get(kat).length));
      for (const au of gruppen.get(kat)) aufgaben.append(el('button', { class: 'salon-aufgabe', onclick: () => { zu(); salonAufgabeAnnehmen(a, au); } }, el('i', {}, au.t), el('small', {}, (au.min ? au.min + ' Minuten' : 'ohne Uhr') + (au.ziel ? ' · etwa ' + au.ziel + ' Wörter' : '') + ' · annehmen')));
    }
  }
  const werke = el('div', { class: 'salon-regal' });
  const baueWerke = () => {
    werke.innerHTML = '';
    if (!(a.werke || []).length) { werke.append(el('div', { class: 'salon-leer' }, 'Kein Regal.')); return; }
    const gelesen = salonGelesen(a);
    const brett = el('div', { class: 'salon-bretter' });
    a.werke.forEach(([t, j], i) => brett.append(el('button', { class: 'salon-buchruecken' + (gelesen.includes(t) ? ' gelesen' : ''), style: '--i:' + i + ';--h:' + (150 + ((i * 37) % 40)) + 'px', title: t + (j ? ' (' + j + ')' : '') + ' — tippen: gelesen/ungelesen', onclick: (ev) => { const an = !ev.currentTarget.classList.contains('gelesen'); salonGelesenSetzen(a, t, an); ev.currentTarget.classList.toggle('gelesen', an); zahl.textContent = salonGelesen(a).length + ' von ' + a.werke.length + ' gelesen'; } }, el('span', {}, t), el('small', {}, j ? String(j) : ''))));
    const zahl = el('div', { class: 'salon-regalzahl' }, gelesen.length + ' von ' + a.werke.length + ' gelesen');
    werke.append(brett, el('i', { class: 'salon-regalbrett' }), zahl, el('div', { class: 'salon-hinweis' }, 'Tippen markiert ein Buch als gelesen. Die Liste reist mit den Einstellungen.'));
  };
  baueWerke();
  const reiter = el('div', { class: 'salon-reiter' });
  const seiten = {
    rat: el('div', { class: 'salon-seite' }, chips, sprech, el('div', { class: 'reihe', style: 'justify-content:flex-start' },
      el('button', { class: 'knopf voll', onclick: () => { zaehler++; zeigeRat(); } }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'Noch einen Rat'),
      el('button', { class: 'knopf', onclick: () => { const t = sprech.querySelector('.salon-rat'); if (!t) return; neuDoc('schnipsel', { text: t.textContent + '\n— ' + a.name + ' (erfundener Rat aus dem Salon)' }); toast('Liegt in den Schnipseln.'); } }, 'Merken'),
      el('button', { class: 'knopf', onclick: () => { const t = sprech.querySelector('.salon-rat'); if (!t) return; const b = blattAusText('', '„' + t.textContent + '“ — ' + a.name + '\n\n'); zu(); oeffneSchreibraum(b.id); } }, 'Damit schreiben'))),
    zitate: el('div', { class: 'salon-seite' }, zitate),
    aufgaben: el('div', { class: 'salon-seite' }, el('div', { class: 'salon-hinweis' }, 'Erfundene Übungen in dieser Stimme. Annehmen legt ein Blatt an und startet die Uhr.'), aufgaben),
    werke: el('div', { class: 'salon-seite' }, werke),
    ueber: el('div', { class: 'salon-seite' }, el('div', { class: 'salon-ueber' }, el('p', { class: 'salon-ueber-kurz' }, a.kurz || ''), ...((a.ueber || []).map((abs) => el('p', { class: 'salon-ueber-abs' }, abs))), a.foto ? el('p', { class: 'salon-lizenz' }, 'Foto: ' + a.foto.urheber + ', ' + a.foto.lizenz + ' (Wikimedia Commons).') : null,
      a.eigen ? el('div', { class: 'reihe', style: 'justify-content:flex-start' }, el('button', { class: 'knopf', onclick: () => { zu(); salonEigenenBearbeiten(a.doc); } }, 'Bearbeiten'), el('button', { class: 'knopf zart', onclick: async () => { if (await frage(a.name + ' von der Wand nehmen?', { ja: 'Abnehmen', gefahr: true })) { await loesche(a.doc.id); zu(); zeichne(); } } }, 'Abnehmen')) : null))
  };
  /* Deine Welten: die Stimme spricht über die eigenen Texte — Einlesung (56d) und lebendige Kenntnis (56e/56f) */
  if (!a.eigen && typeof gespraechAntwort === 'function') seiten.welten = salonWeltenSeite(a);
  const reiterKnopf = (id, name) => el('button', { class: 'salon-reiterknopf' + (id === reiterStart ? ' an' : ''), onclick: (ev) => { for (const k of Object.keys(seiten)) seiten[k].classList.toggle('an', k === id); $$('.salon-reiterknopf', reiter).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); if (id === 'welten' && seiten.welten && seiten.welten._starten) { seiten.welten._starten(); } } }, name);
  seiten[reiterStart].classList.add('an');
  anfuegen(reiter, reiterKnopf('rat', 'Rat'), seiten.welten ? reiterKnopf('welten', 'Deine Welten') : null, reiterKnopf('zitate', 'Zitate (' + (a.zitate || []).length + ')'), reiterKnopf('aufgaben', 'Aufgaben'), reiterKnopf('werke', 'Werke'), reiterKnopf('ueber', 'Über'));
  const kasten = el('div', { class: 'modal salon-fenster ' + (a.rahmen || 'nuss') },
    el('div', { class: 'salon-fenster-kopf' }, el('div', { class: 'salon-fenster-foto' }, salonPortraet(a)), el('div', {}, el('h2', {}, a.name), el('div', { class: 'salon-fenster-unter' }, [a.jahre, a.woher].filter(Boolean).join(' · '))), el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Schließen', onclick: () => zu() })),
    reiter, seiten.rat, seiten.welten || null, seiten.zitate, seiten.aufgaben, seiten.werke, seiten.ueber);
  if (reiterStart === 'welten' && seiten.welten) setTimeout(() => seiten.welten._starten && seiten.welten._starten(), 50);
  const zu = zeigeDeck(kasten);
  if (reiterStart === 'rat') zeigeRat();
}

/* Eine Aufgabe annehmen: Blatt mit Kopfzeile, Schreibraum, Uhr. */
function salonAufgabeAnnehmen(a, au) {
  const kopf = 'Schreibaufgabe von ' + a.name + ':\n' + au.t + (au.ziel ? ' (etwa ' + au.ziel + ' Wörter)' : '') + '\n\n';
  const b = blattAusText('Aufgabe · ' + a.name, kopf);
  oeffneSchreibraum(b.id);
  if (au.min && typeof starteSprint === 'function') setTimeout(() => starteSprint(au.min), 500);
  toast(a.anrede ? a.anrede + ' schaut zu.' : 'Die Wand schaut zu.', 2600);
}

/* Die Runde: alle antworten nacheinander, jede in ihrer Stimme. */
function salonRunde(frageText) {
  const thema = salonThemaAusFrage(frageText);
  /* Berührt die Frage die eigenen Texte, antwortet die Runde aus der Kenntnis — sonst mit Rat zum Handwerk */
  let materialAntwort = typeof kenntnisFrage === 'function' && salonKenntnis() ? kenntnisFrage(salonKenntnis(), frageText) : null;
  if ((!materialAntwort || !materialAntwort.wesen) && typeof einlesungFrage === 'function') { const e = einlesungFrage(frageText); if (e && e.wesen) materialAntwort = e; }
  const material = !!materialAntwort && (materialAntwort.wesen || ['zahl', 'werke', 'wann', 'figuren', 'erster', 'wo', 'begriffe', 'stelle', 'saetze'].includes(materialAntwort.absicht));
  const stimmen = SALON_FEST.filter((a) => (a.kern || []).length);
  const liste = el('div', { class: 'salon-runde' + (material ? ' material' : '') });
  const kasten = el('div', { class: 'modal salon-rundenfenster' },
    el('div', { class: 'salon-runde-kopf' }, el('div', {}, el('h2', {}, material ? 'Die Runde — über deine Texte' : 'Die Runde'), el('div', { class: 'salon-fenster-unter' }, '„' + frageText.slice(0, 120) + '“' + (material && materialAntwort.wesen ? ' · ' + (materialAntwort.wesen.art === 'figur' ? 'Figur' : materialAntwort.wesen.art === 'ort' ? 'Schauplatz' : 'Begriff') + ': ' + materialAntwort.wesen.name : thema ? ' · Thema: ' + (SALON_THEMEN.find((t) => t[0] === thema) || [])[1] : ''))), el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Schließen', onclick: () => zu() })),
    liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: () => { liste.innerHTML = ''; runde(Math.floor(Math.random() * 1e9)); } }, 'Noch eine Runde'), el('button', { class: 'knopf voll', onclick: () => zu() }, 'Danke')));
  const zu = zeigeDeck(kasten);
  const runde = (saat) => {
    let i = 0;
    const naechste = () => {
      if (!liste.isConnected || i >= stimmen.length) return;
      const a = stimmen[i++];
      if (material) {
        const ant = gespraechAntwort(a, materialAntwort, salonKenntnis(), { anrede: salonAnrede(), saat: salonHash(frageText + ':' + a.id + ':' + saat) });
        const blase = el('div', { class: 'salon-blase ' + (a.rahmen || 'nuss') }, el('div', { class: 'salon-blase-foto' }, salonPortraet(a)), el('div', { class: 'salon-blase-inhalt' }, el('b', {}, a.name), salonAntwortElement(a, ant, { tippen: true }), el('small', {}, 'aus deinen Texten, in ' + (a.anrede || a.name) + 's Stimme')));
        liste.append(blase); blase.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setTimeout(naechste, 520 + Math.min(2400, ant.text.length * 14));
        return;
      }
      const zw = typeof salonRatZweisprachig === 'function' ? salonRatZweisprachig : salonRat;
      const r = zw(a, salonHash(frageText + ':' + a.id + ':' + saat), thema) || zw(a, saat + i);
      const text = el('div', { class: 'sr-text' });
      const blase = el('div', { class: 'salon-blase ' + (a.rahmen || 'nuss') }, el('div', { class: 'salon-blase-foto' }, salonPortraet(a)), el('div', { class: 'salon-blase-inhalt' }, el('b', {}, a.name), text, r && r.de ? el('div', { class: 'salon-blase-de' }, r.de) : null, el('small', {}, 'erfunden, in ' + (a.anrede || a.name) + 's Geist')));
      liste.append(blase); blase.scrollIntoView({ behavior: 'smooth', block: 'end' });
      const w = (r ? r.text : '…').split(' '); let k = 0;
      const tick = () => { if (!text.isConnected) return; text.textContent = w.slice(0, ++k).join(' '); if (k < w.length) setTimeout(tick, 22 + Math.random() * 30); else setTimeout(naechste, 420); };
      tick();
    };
    naechste();
  };
  runde(salonHash(frageText));
}

function salonUeberBilder() {
  const kasten = el('div', { class: 'modal' }, el('h2', {}, 'Über die Bilder'),
    el('p', { style: 'font-size:14px;line-height:1.5' }, 'Die Porträts stammen von Wikimedia Commons und stehen unter freien Lizenzen. Die Zitate sind echt und tragen ihre Quelle; Übersetzungen sind eigene, das Original steht dabei. Die Ratschläge und Aufgaben sind erfunden — geschrieben in der Stimme der jeweiligen Person, als Inspiration, nie als Zitat.'),
    ...SALON_FEST.map((a) => el('div', { class: 'salon-lizenz' }, el('b', {}, a.name), ': ' + a.foto.urheber + ', ' + a.foto.lizenz + ' — ', el('a', { href: a.foto.seite, target: '_blank', rel: 'noopener' }, 'Commons'))),
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
}

/* Eigene Menschen an die Wand: Name, Foto, Zitate (eine je Zeile), Rat in ihrer Stimme. */
function salonEigenenAnlegen() { salonEigenenBearbeiten(null); }
function salonEigenenBearbeiten(doc) {
  const name = el('input', { type: 'text', value: doc ? doc.titel : '', placeholder: 'Name' });
  const jahre = el('input', { type: 'text', value: doc ? (doc.jahre || '') : '', placeholder: 'Jahre, z. B. 1899–1974' });
  const woher = el('input', { type: 'text', value: doc ? (doc.woher || '') : '', placeholder: 'Woher' });
  const kurz = el('textarea', { rows: 2, placeholder: 'Ein Satz über diesen Menschen' }); kurz.value = doc ? (doc.notiz || '') : '';
  const zitate = el('textarea', { rows: 5, placeholder: 'Zitate — eines je Zeile' }); zitate.value = doc ? (doc.zitate || []).join('\n') : '';
  const rat = el('textarea', { rows: 4, placeholder: 'Ratschläge in dieser Stimme — einer je Zeile (die Person „spricht" dann damit)' }); rat.value = doc ? (doc.rat || []).join('\n') : '';
  let bildId = doc ? doc.bild || null : null;
  const vorschau = el('div', { class: 'salon-foto-vorschau' });
  const zeigeVorschau = () => { vorschau.innerHTML = ''; if (bildId) { const img = el('img', { alt: '' }); setzeBild(img, bildId); vorschau.append(img); } else vorschau.append(el('span', {}, 'Kein Foto')); };
  zeigeVorschau();
  const rahmenWahl = el('div', { class: 'wahlgruppe' }); let rahmen = doc ? (doc.rahmen || 'nuss') : 'nuss';
  for (const [id, n] of [['nuss', 'Nussbaum'], ['gold', 'Gold'], ['kupfer', 'Kupfer'], ['dunkel', 'Ebenholz']]) rahmenWahl.append(el('button', { class: rahmen === id ? 'an' : '', onclick: (ev) => { rahmen = id; $$('button', rahmenWahl).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); } }, n));
  const kasten = el('div', { class: 'modal salon-bearbeiten' }, el('h2', {}, doc ? 'An der Wand ändern' : 'Jemanden an die Wand hängen'),
    name, el('div', { class: 'reihe', style: 'justify-content:flex-start;margin-top:8px' }, jahre, woher), kurz,
    el('div', { class: 'reihe', style: 'justify-content:flex-start;align-items:center;margin-top:8px' }, vorschau, el('button', { class: 'knopf', onclick: async () => { const b = await waehleBild(); if (b) { bildId = b.id; zeigeVorschau(); } } }, 'Foto wählen'), bildId ? el('button', { class: 'knopf zart', onclick: () => { bildId = null; zeigeVorschau(); } }, 'Weg') : null),
    el('div', { class: 'einstellgruppe', style: 'margin-top:8px' }, el('b', {}, 'Rahmen'), rahmenWahl),
    el('b', { style: 'display:block;margin-top:10px;font-size:13px' }, 'Zitate'), zitate,
    el('b', { style: 'display:block;margin-top:10px;font-size:13px' }, 'Rat in dieser Stimme'), rat,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: () => {
        const n = name.value.trim(); if (!n) { toast('Ein Name fehlt noch.'); return; }
        const zeilen = (t) => t.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 80);
        const felder = { titel: n, jahre: jahre.value.trim().slice(0, 60), woher: woher.value.trim().slice(0, 80), notiz: kurz.value.trim().slice(0, 300), zitate: zeilen(zitate.value), rat: zeilen(rat.value), bild: bildId, rahmen };
        if (doc) { Object.assign(doc, felder); speichere(doc); } else neuDoc('mentor', felder);
        zu(); zeichne(); toast(doc ? 'Geändert.' : n + ' hängt jetzt an der Wand.');
      } }, doc ? 'Speichern' : 'Aufhängen')));
  const zu = zeigeDeck(kasten);
  setTimeout(() => name.focus(), 60);
}

/* Der Klang des Salons: Kamin und Uhr — an oder aus. */
/* Salonklang: Standard aus. Ist er an, spielen Kamin und Uhr; der Schalter oben merkt sich den Zustand. */
function salonTonAn() { const m = (D.einst && D.einst.ambience) || {}; return D.einst.salonTon === true && (m.kamin || 0) > 0; }
async function salonKlang() {
  if (typeof ambienceMischungAnwenden !== 'function') { location.hash = '#/klang'; return; }
  const m = { ...(D.einst.ambience || {}) };
  const an = salonTonAn();
  if (an) { delete m.kamin; delete m.uhr; D.einst.salonTon = false; toast('Der Salon wird still.'); }
  else { m.kamin = .28; m.uhr = .14; D.einst.salonTon = true; toast('Salon am Abend: das Feuer knistert, die Uhr geht.', 3200); }
  speichereEinst();
  try { await audioFreigeben(); await ambienceMischungAnwenden(m); } catch (e) {}
}
/* Wie die Wand die Schreiberin anspricht: eingestellter Name, sonst der Profilname, sonst nichts. */
function salonAnrede() {
  const e = (D.einst && typeof D.einst.salonAnrede === 'string') ? D.einst.salonAnrede.trim() : '';
  if (e) return e;
  try { if (typeof AKTIVES_PROFIL !== 'undefined' && AKTIVES_PROFIL && AKTIVES_PROFIL.name) return String(AKTIVES_PROFIL.name).trim().slice(0, 40); } catch (x) {}
  return '';
}
