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

/* Eigene Menschen an der Wand: Dokumente vom Typ 'mentor'. */
function salonEigene() { return vomTyp('mentor').sort((a, b) => (a.angelegt || 0) - (b.angelegt || 0)); }
function salonAlle() {
  return [...SALON_AUTOREN, ...salonEigene().map((d) => ({ id: d.id, eigen: true, doc: d, name: d.titel || 'Ohne Namen', jahre: d.jahre || '', woher: d.woher || '', bild: null, bildId: d.bild || null, kurz: d.notiz || '', rahmen: d.rahmen || 'nuss', zitate: (d.zitate || []).map((t) => ({ t, q: d.titel || '' })), saetze: d.rat || [], anfang: [], kern: [], schluss: [] }))];
}

/* ----- Der Raum ----- */
RENDER.salon = function (haupt) {
  const alle = salonAlle();
  const wand = el('div', { class: 'salon' });
  const kopf = el('div', { class: 'kopf' },
    el('h1', {}, 'Der Salon', el('div', { class: 'unter' }, 'Die Lieblingswand. Vier, die wissen, wie es geht — und die, die du dazuhängst.')),
    el('button', { class: 'rundknopf zart', html: ik('plus'), title: 'Jemanden an die Wand hängen', onclick: () => salonEigenenAnlegen() }),
    el('button', { class: 'rundknopf zart', html: ik('mehr'), title: 'Über die Bilder', onclick: () => salonUeberBilder() }));
  const galerie = el('div', { class: 'salon-galerie' });
  const heute = tagKey();
  alle.forEach((a, i) => {
    const rat = salonRatDesTages(a, heute);
    const bild = a.bild ? el('img', { src: a.bild, alt: a.name, draggable: 'false', style: 'object-position:' + (a.lage || '50% 30%') }) : (a.bildId ? (() => { const img = el('img', { alt: a.name, draggable: 'false' }); setzeBild(img, a.bildId); return img; })() : el('div', { class: 'salon-monogramm' }, (a.name || '?').slice(0, 1)));
    const rahmen = el('button', { class: 'salon-rahmen ' + (a.rahmen || 'nuss') + (a.eigen ? ' eigen' : ''), style: '--n:' + i, onclick: () => salonSprechen(a), title: a.name + ': anklopfen' },
      el('i', { class: 'salon-lampe' }),
      el('div', { class: 'salon-passepartout' }, el('div', { class: 'salon-foto' }, bild, el('i', { class: 'salon-glas' }))),
      el('div', { class: 'salon-schild' }, el('b', {}, a.name), el('span', {}, [a.jahre, a.woher].filter(Boolean).join(' · '))));
    const karte = el('div', { class: 'salon-platz' }, rahmen,
      el('div', { class: 'salon-kurz' }, a.kurz || ''),
      rat ? el('button', { class: 'salon-tageskarte', onclick: () => salonSprechen(a, { thema: null, saat: salonHash(heute + ':' + a.id) }) }, el('span', { class: 'st-ueber' }, 'Rat des Tages' + (rat.art === 'satz' ? '' : '')), el('span', { class: 'st-text' }, rat.text), el('span', { class: 'st-fuss' }, a.eigen ? 'aus deinen Notizen' : 'erfunden — in ' + (a.anrede || a.name) + 's Geist')) : null);
    galerie.append(karte);
  });
  wand.append(galerie);
  wand.append(el('div', { class: 'salon-fuss' }, 'Die Zitate sind echt und tragen ihre Quelle. Die Ratschläge sind erfunden, in ihrem Geist — zusammen ' + alle.reduce((n, a) => n + salonVorrat(a), 0).toLocaleString('de-DE') + ' mögliche, jeden Tag andere.'));
  haupt.append(kopf, wand);
};

/* Die Person spricht: ein Fenster mit Rat, Zitaten und „Frag nach". */
function salonSprechen(a, { thema = null, saat = null } = {}) {
  let themaJetzt = thema, zaehler = 0;
  let saatJetzt = saat != null ? saat : Math.floor(Math.random() * 1e9);
  const sprech = el('div', { class: 'salon-sprech' });
  const chips = el('div', { class: 'salon-themen' });
  const zeigeRat = () => {
    const r = salonRat(a, saatJetzt + zaehler * 7919, themaJetzt);
    sprech.innerHTML = '';
    if (!r) { sprech.append(el('div', { class: 'salon-leer' }, a.eigen ? 'Noch kein Rat hinterlegt — beim Bearbeiten kannst du Sätze in ' + a.name + 's Stimme eintragen.' : 'Dazu fällt mir gerade nichts ein.')); return; }
    const text = el('div', { class: 'salon-rat' });
    sprech.append(text, el('div', { class: 'salon-ratfuss' }, a.eigen ? 'aus deinen Notizen' : 'erfunden, in ' + (a.anrede || a.name) + 's Geist' + (r.thema ? ' · ' + (SALON_THEMEN.find((t) => t[0] === r.thema) || [])[1] : '')));
    /* Schreibmaschine: der Rat erscheint Wort für Wort */
    const woerter = r.text.split(' '); let i = 0;
    const tick = () => { if (!text.isConnected) return; text.textContent = woerter.slice(0, ++i).join(' '); if (i < woerter.length) setTimeout(tick, 28 + Math.random() * 40); };
    tick();
  };
  const baueChips = () => {
    chips.innerHTML = '';
    chips.append(el('button', { class: 'suchchip' + (themaJetzt ? '' : ' an'), onclick: () => { themaJetzt = null; zaehler++; baueChips(); zeigeRat(); } }, 'Egal was'));
    for (const [id, name] of SALON_THEMEN) {
      if (!a.eigen && !(a.kern || []).some((k) => k[0] === id)) continue;
      if (a.eigen) continue;
      chips.append(el('button', { class: 'suchchip' + (themaJetzt === id ? ' an' : ''), onclick: () => { themaJetzt = id; zaehler++; baueChips(); zeigeRat(); } }, name));
    }
  };
  baueChips();
  const zitate = el('div', { class: 'salon-zitate' });
  const baueZitate = () => {
    zitate.innerHTML = '';
    if (!(a.zitate || []).length) { zitate.append(el('div', { class: 'salon-leer' }, 'Noch keine Zitate.')); return; }
    for (const z of a.zitate) zitate.append(el('div', { class: 'salon-zitat' }, el('div', { class: 'sz-text' }, '„' + z.t + '“'), z.o ? el('div', { class: 'sz-original' }, z.o) : null, el('div', { class: 'sz-quelle' }, '— ' + a.name + (z.q ? ', ' + z.q : '')),
      el('div', { class: 'sz-knoepfe' }, el('button', { class: 'knopf zart', onclick: () => { neuDoc('schnipsel', { text: '„' + z.t + '“\n— ' + a.name + (z.q ? ', ' + z.q : '') }); toast('Liegt als Zitat in den Schnipseln.'); } }, 'Als Schnipsel'),
        el('button', { class: 'knopf zart', onclick: async () => { try { await navigator.clipboard.writeText('„' + z.t + '“ — ' + a.name + (z.q ? ', ' + z.q : '')); toast('Kopiert.'); } catch (e) { toast('Kopieren ging hier nicht.'); } } }, 'Kopieren'))));
  };
  baueZitate();
  const reiter = el('div', { class: 'salon-reiter' });
  const seiten = { rat: el('div', { class: 'salon-seite an' }, chips, sprech, el('div', { class: 'reihe', style: 'justify-content:flex-start' },
      el('button', { class: 'knopf voll', onclick: () => { zaehler++; zeigeRat(); } }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'Noch einen Rat'),
      el('button', { class: 'knopf', onclick: () => { const t = sprech.querySelector('.salon-rat'); if (!t) return; neuDoc('schnipsel', { text: t.textContent + '\n— ' + a.name + ' (erfundener Rat aus dem Salon)' }); toast('Liegt in den Schnipseln.'); } }, 'Merken'),
      el('button', { class: 'knopf', onclick: () => { const t = sprech.querySelector('.salon-rat'); if (!t) return; const b = blattAusText('', '„' + t.textContent + '“ — ' + a.name + '\n\n'); zu(); oeffneSchreibraum(b.id); } }, 'Damit schreiben'))),
    zitate: el('div', { class: 'salon-seite' }, zitate),
    ueber: el('div', { class: 'salon-seite' }, el('div', { class: 'salon-ueber' }, el('p', {}, a.kurz || ''), a.foto ? el('p', { class: 'salon-lizenz' }, 'Foto: ' + a.foto.urheber + ', ' + a.foto.lizenz + ' (Wikimedia Commons).') : null,
      a.eigen ? el('div', { class: 'reihe', style: 'justify-content:flex-start' }, el('button', { class: 'knopf', onclick: () => { zu(); salonEigenenBearbeiten(a.doc); } }, 'Bearbeiten'), el('button', { class: 'knopf zart', onclick: async () => { if (await frage(a.name + ' von der Wand nehmen?', { ja: 'Abnehmen', gefahr: true })) { await loesche(a.doc.id); zu(); zeichne(); } } }, 'Abnehmen')) : null)) };
  const reiterKnopf = (id, name) => el('button', { class: 'salon-reiterknopf' + (id === 'rat' ? ' an' : ''), onclick: (ev) => { for (const k of Object.keys(seiten)) seiten[k].classList.toggle('an', k === id); $$('.salon-reiterknopf', reiter).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); } }, name);
  reiter.append(reiterKnopf('rat', 'Rat'), reiterKnopf('zitate', 'Zitate (' + (a.zitate || []).length + ')'), reiterKnopf('ueber', 'Über'));
  const kopfbild = a.bild ? el('img', { src: a.bild, alt: '', draggable: 'false', style: 'object-position:' + (a.lage || '50% 30%') }) : (a.bildId ? (() => { const img = el('img', { alt: '' }); setzeBild(img, a.bildId); return img; })() : el('div', { class: 'salon-monogramm' }, (a.name || '?').slice(0, 1)));
  const kasten = el('div', { class: 'modal salon-fenster ' + (a.rahmen || 'nuss') },
    el('div', { class: 'salon-fenster-kopf' }, el('div', { class: 'salon-fenster-foto' }, kopfbild), el('div', {}, el('h2', {}, a.name), el('div', { class: 'salon-fenster-unter' }, [a.jahre, a.woher].filter(Boolean).join(' · '))), el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Schließen', onclick: () => zu() })),
    reiter, seiten.rat, seiten.zitate, seiten.ueber);
  const zu = zeigeDeck(kasten);
  zeigeRat();
}

function salonUeberBilder() {
  const kasten = el('div', { class: 'modal' }, el('h2', {}, 'Über die Bilder'),
    el('p', { style: 'font-size:14px;line-height:1.5' }, 'Die Porträts stammen von Wikimedia Commons und stehen unter freien Lizenzen. Die Zitate sind echt und tragen ihre Quelle; Übersetzungen sind eigene, das Original steht dabei. Die Ratschläge sind erfunden — geschrieben in der Stimme der jeweiligen Person, als Inspiration, nie als Zitat.'),
    ...SALON_AUTOREN.map((a) => el('div', { class: 'salon-lizenz' }, el('b', {}, a.name), ': ' + a.foto.urheber + ', ' + a.foto.lizenz + ' — ', el('a', { href: a.foto.seite, target: '_blank', rel: 'noopener' }, 'Commons'))),
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
