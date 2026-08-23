/* ===================== 56f — DAS GESPRÄCH: DIE STIMMEN SPRECHEN ÜBER DEINE TEXTE =====================
   Die Wand kennt die Texte (56e) und redet darüber in ihrer je eigenen Stimme:
   Figuren, Schauplätze, Begriffe, Sätze, Zahlen, Werke. Jede Stimme hat eigene
   Satzmuster — die englischen auf Englisch mit deutscher Fassung daneben. Die
   Antworten sind gebaut aus: Muster der Stimme + Fakten aus den Texten + ein
   kleiner Handwerkshinweis aus den Zahlen + Belegstellen, die man antippen kann.
   Die Anrede ist einstellbar (Salon → Stift), sonst der Profilname. */

/* Satzmuster je Stimme. Platzhalter: {anrede} {name} {n} {werk} {werke} {erster} {begleiter} {verb} {satz} {woerter} {texte} {figuren} {orte} {begriffe} {tage} {laengster} {zuletzt} */
const GESPRAECH_STIMMEN = {
  king: {
    ausEinlesung: ['{name} — I remember. {kurz} That was in {werk}. What I want to know is what {name} does when nobody in the scene is watching.'],
    gruss: ['Listen, {anrede}. I’ve read what’s on your desk — {woerter} words, {texte} pieces. I know {figuren}. Ask me anything about them.', 'Okay, {anrede}. {woerter} words. That’s not nothing, that’s a job. I’ve been through your pages — go ahead, ask.'],
    figur: ['{name}. Shows up {n} times, mostly in {werk}. First time I meet them: “{erster}” — and I’m already in the room. Good.', '{name} — {n} appearances, keeps company with {begleiter}. The verb you give them most is “{verb}”. Watch that: a character is what they do, so make sure the doing is different from scene to scene.', 'I like {name}. {n} times on the page, and I never needed you to explain them. Keep it that way — pockets, not biographies.'],
    figurFrage: ['What does {name} want in the next scene, and what’s in the way? If you can’t say it in one sentence, that’s your next sentence.', 'What’s in {name}’s pocket right now? Tell me that and I’ll tell you who they are.', 'When was {name} last afraid? Write that scene. Don’t name the fear.'],
    ort: ['{name} — {n} times, mostly in {werk}. A place is a character with no lines. Give it a smell and one thing that’s broken.', 'You keep coming back to {name}. Good. Readers like a room they recognise. Now change one thing in it the next time we’re there.'],
    begriff: ['“{name}”, {n} times. It’s one of your words — the reader learns it from you. Use it like a knife: rarely, and where it cuts.', '{name}. Shows up {n} times in {werk}. That’s a word doing work. Make sure it never explains itself.'],
    satz: ['Here’s one of yours: “{satz}” — that sentence walks into the room on its own legs. That’s what you want, every time.', '“{satz}” — I’d keep that. Read it aloud; if you don’t stumble, the reader won’t.'],
    zahl: ['{woerter} words, {texte} pieces, {tage} writing days. The longest is {laengster}. That’s the math. The rest is sitting down tomorrow.', '{woerter} words. You wrote {texte} things and came back on {tage} days. Amateurs wait; you showed up. Keep showing up.'],
    werke: ['What’s on the desk: {werke}. The big one is where the book is. The little ones are where you practise — both count.', '{werke}. That’s a shelf, {anrede}. Pick the one that scares you most and open it.'],
    wann: ['Last thing you touched: {zuletzt}. Go back there first. The door is still warm.'],
    liste: ['The people in your pages: {figuren}. That’s a cast. Which one hasn’t had their scene yet?'],
    unbekannt: ['I don’t see that one in your pages, {anrede}. Either it’s not written yet — then write it — or you call it something else. Try the name.', 'Not in the pages I have. Say it differently, or better: go put it there.'],
    leer: ['No pages yet, {anrede}. That’s fine — everybody starts with the same blank. Write one paragraph and come back; then we talk.']
  },
  rothfuss: {
    ausEinlesung: ['{name}, yes. {kurz} From {werk}. Say the name out loud once — then tell me what {name} is not saying.'],
    gruss: ['Hm. Hello, {anrede}. I read slowly, so I read all of it: {woerter} words. I’ve been listening to {figuren}. What do you want to know?', 'So. {anrede}. There’s a sound to your pages — I heard it in {werk}. Ask me about anyone in there.'],
    figur: ['{name}. {n} times. The first time I hear the name: “{erster}” — listen to how that sits. It has weight.', '{name} keeps close to {begleiter}. The verb you hand them most is “{verb}”. A person is also their silences — where does {name} not speak?', '{name} — I’d want to know what they can do with their hands. A craft makes a person believable. Give {name} something to be good at.'],
    figurFrage: ['What is {name} ashamed of? That’s where the story lives.', 'Say {name}’s name out loud three times. Does it sit right on the tongue? Then it sits right on the page.', 'What would people say about {name} behind their back — and how much of it is true?'],
    ort: ['{name}, {n} times. Write it as if it had been there a thousand years before anyone walked in. The walls need scratches.', '{name} — a place wants three kinds of silence: the one in the room, the one in the person, the one between the words. Which have you written?'],
    begriff: ['“{name}”. {n} times. Words have power because they are names. If this one is yours, give it rules, and never break them without paying.', '{name} — I like that you don’t explain it. Let the reader learn it the way they learn a language: by hearing it used.'],
    satz: ['“{satz}” — read that aloud. Then again. There — it rings. Keep it.', 'This one: “{satz}”. The heavy word is at the end, where it belongs. Trust that ear.'],
    zahl: ['{woerter} words on {tage} days. Nobody remembers how long a book took. Only whether it was true. So far it’s true.', '{texte} pieces, the longest is {laengster}. Take the time it takes, {anrede}.'],
    werke: ['Your shelf: {werke}. The long one has the deep roots. The short ones are where you tune the instrument.', '{werke}. Each one a different key. I’d listen to which one rings the cleanest and start there tomorrow.'],
    wann: ['You were last in {zuletzt}. Go back and read one page aloud before you write the next.'],
    liste: ['Your people: {figuren}. Every one of them thinks they’re the main character. Write the small ones as if they knew.'],
    unbekannt: ['I haven’t heard that name in your pages, {anrede}. Maybe it waits to be written. Maybe you call it something else.', 'Not in what I’ve read. Say it again, or write it in — the silence where it should be is a kind of invitation.'],
    leer: ['No pages yet. That’s not a problem, {anrede}; that’s the silence before the first note. Write one sentence that sounds right. Then another.']
  },
  pratchett: {
    ausEinlesung: ['{name}! {kurz} That was {werk}. Give {name} one small job and one bad habit and the reader will follow them anywhere.'],
    gruss: ['Right, {anrede}. I’ve read your pages — {woerter} words, {texte} bits — and I’ve made notes in the margins, some of them rude. Ask away.', 'Hello, {anrede}. {figuren} — that’s a proper crowd. Somebody in there is going to be trouble. Which one?'],
    figur: ['{name}. {n} appearances. First sighting: “{erster}”. I like a character who turns up before they’re introduced.', '{name} spends a lot of time with {begleiter} and mostly {verb}s. Does {name} know they’re not the main character? Make sure they don’t.', '{name} — {n} times, mostly in {werk}. Give them a hat. You learn more about a person from their hat than from their biography.'],
    figurFrage: ['What would {name} never, ever do? Good. Now arrange for it to be necessary.', 'What does {name} think is funny? That tells me more than what they fear.', 'Who is {name} when nobody important is watching?'],
    ort: ['{name}, {n} times. Every place needs a Watch, a market, and someone lighting the lamps. Who lights the lamps in {name}?', '{name} — I’d want to know what it smells like at six in the morning. Places are honest at six in the morning.'],
    begriff: ['“{name}” — {n} times. One of yours. The trick with an invented word is to use it as if everyone already knew it. You do. Good.', '{name}. A word that carries its own footnote. Don’t write the footnote. Well — maybe once.'],
    satz: ['“{satz}” — that one made me look up from the page, which is the whole job.', 'I’d keep this: “{satz}”. It’s got a hat on.'],
    zahl: ['{woerter} words. Four hundred a day would have got you here in {vierhundert} days; you did it your way, on {tage} of them. Fine by me.', '{texte} pieces, longest is {laengster}. That’s a book in disguise, {anrede}.'],
    werke: ['On the shelf: {werke}. One of those is the novel. The others are footnotes to it — which, as you know, is where the good stuff hides.', '{werke}. I’d start with whichever one makes you laugh. Then take it seriously — later.'],
    wann: ['Last touched: {zuletzt}. Go back there. The Disc keeps turning, but it likes a push.'],
    liste: ['The cast: {figuren}. Somebody here is a minor character who doesn’t know it. Find them and give them a chapter.'],
    unbekannt: ['Not in your pages, {anrede} — I checked twice, once with my glasses on. Try another word, or write it in and surprise me.', 'Haven’t met that one. If it’s a hat, describe the hat; if it’s a person, give them a job.'],
    leer: ['No pages yet. Four hundred words a day, {anrede}. Bad ones will do. I’ll wait here with the hat.']
  },
  tolkien: {
    ausEinlesung: ['{name}. {kurz} That belongs to {werk}. Tell me where {name} would rather be — longing is the engine.'],
    gruss: ['Well now, {anrede}. I have read what you have set down — {woerter} words, the greater part in {werk}. I know the names: {figuren}. Ask me of any of them.', 'Good evening, {anrede}. A world is made of names, and yours has {figuren} already. What would you know?'],
    figur: ['{name}. The name occurs {n} times, chiefly in {werk}. It is first spoken thus: “{erster}” — and a name first spoken is a door opened.', '{name} walks mostly with {begleiter}, and the deed you give them most is “{verb}”. Small hands move the wheels of a story; see that {name}’s hands are doing something.', '{name} — I should like to know where {name} would rather be. Longing is the engine of every journey.'],
    figurFrage: ['Where is home for {name}, and how far from it are they now?', 'What was {name} called as a child, and who still uses that name?', 'What does {name} carry that they would not leave behind in a burning house?'],
    ort: ['{name}, {n} times. A place should have a history the reader never learns. Let {name} have a ruin in it that nobody explains.', '{name} — say the name aloud a hundred times until it sounds worn smooth by tongues. Then it is a real place.'],
    begriff: ['“{name}” — {n} times. A word comes with a mouth, and a mouth with a life. Whose mouth first said this one?', '{name}. You use it as a word of your world. Keep its meaning consistent, as a legend must be; a world that contradicts its own old tales is painted cloth.'],
    satz: ['“{satz}” — this has the cadence of something sung before it was written. Good.', 'Here: “{satz}”. Leave it. Some sentences want to be left alone like an old road.'],
    zahl: ['{woerter} words, {texte} pieces, over {tage} days. The tale grows in the telling; twelve years is not too long. You are in year one — walk on.', '{texte} writings; the longest is {laengster}. Roots first, then the tree.'],
    werke: ['Your works: {werke}. The long one is the tree; the short ones are seedlings in the same soil.', '{werke}. Draw the map that joins them — there may be one road through all of it.'],
    wann: ['You last walked in {zuletzt}. Return there and take three steps before choosing a new road.'],
    liste: ['The names of your world: {figuren}. Each one a small history. Which of them has not yet told theirs?'],
    unbekannt: ['That name I do not find in your pages, {anrede}. Perhaps it lies over the next hill, unwritten. Perhaps it has another name in your tongue.', 'Not in the chronicles I have. Set it down, and I shall know it next time.'],
    leer: ['No pages yet, {anrede}. Begin with a map, or with a hole in the ground and someone who does not wish to leave it.']
  },
  blyton: {
    ausEinlesung: ['{name}, of course! {kurz} From {werk}. Now — what has {name} got in their pockets?'],
    gruss: ['Now then, {anrede}! I’ve read the lot — {woerter} words, {texte} pieces — and I know {figuren}. Quick, before the kettle boils: what do you want to know?', 'Hello, {anrede}. {woerter} words! That’s more than most grown-ups manage. Ask me about anyone in there.'],
    figur: ['{name}! {n} times, mostly in {werk}. First we meet them like this: “{erster}” — straight in, no dawdling. Good.', '{name} goes about with {begleiter} and mostly {verb}s. Now: which one of them is cross, which one is brave, and which one is hungry? Children want to know.', '{name} — {n} times. I like a character who turns up often; readers get fond. Give {name} one thing they always say.'],
    figurFrage: ['What has {name} got in their pockets for the picnic?', 'Who does {name} squabble with most — and who do they run to when it’s dark?', 'What’s the one thing {name} notices that the grown-ups miss?'],
    ort: ['{name}, {n} times. Is there somewhere in {name} the grown-ups can’t get to? There ought to be.', '{name} — draw the map first. A child wants to know where the tunnel comes out.'],
    begriff: ['“{name}” — {n} times. A word the children in your story all know. Use it and don’t explain it; readers love being in on a secret.', '{name}. Yours. Put it in a biscuit tin and bury it in chapter two; dig it up in chapter nine.'],
    satz: ['“{satz}” — short, bright, off we go. That’s how you write for eyes that read under the blanket.', 'Here: “{satz}”. Somebody is about to go somewhere. That’s always right.'],
    zahl: ['{woerter} words on {tage} days. I did ten thousand a day on my knee — but I was showing off. You’re doing fine, {anrede}.', '{texte} pieces, the longest is {laengster}. Short chapters, mind — the torch battery never lasts.'],
    werke: ['Your stories: {werke}. Which one has a picnic in it? That’s the one to finish first.', '{werke}. A proper shelf. Somewhere in there is a secret passage that leads somewhere that matters.'],
    wann: ['Last time you were in {zuletzt}. Back you go — the holidays aren’t over.'],
    liste: ['Your children and grown-ups: {figuren}. Which one is the dog? Every story needs the dog.'],
    unbekannt: ['I don’t know that one from your pages, {anrede}! Perhaps it’s hiding in a tunnel you haven’t written yet. Do write it.', 'Not in the stories I read. Try another name — or put the kettle on and write it in.'],
    leer: ['No pages yet, {anrede}! Shut your eyes for one minute, then write whatever child walks in. Don’t plan. Off you go.']
  },
  paolini: {
    ausEinlesung: ['{name}. {kurz} That’s {werk}. What does {name} want, and what does wanting it cost?'],
    gruss: ['Hey, {anrede}. I read your pages — {woerter} words across {texte} pieces. {figuren}: I know them now. Ask me anything.', 'Look, {anrede} — {woerter} words. At fifteen I’d have killed for that. What do you want to talk about?'],
    figur: ['{name}. {n} times, mostly in {werk}. First appearance: “{erster}” — the smallest mystery carries the biggest door, and this opens one.', '{name} moves with {begleiter}; the verb you give them most is “{verb}”. Does {name} have a mentor — and is the mentor wrong about one important thing?', '{name} — {n} times. Give them a skill and let them pay a price for using it. That’s how a hero stops being a name.'],
    figurFrage: ['What does {name} believe that’s wrong — and when do they find out?', 'What would {name} never trade, and what would they trade for it after all?', 'Who taught {name} the thing they’re best at, and where is that person now?'],
    ort: ['{name}, {n} times. World-building isn’t a list of kingdoms; it’s the smell of the bakery in {name}. What does it smell like?', '{name} — give it three rules of its own. Then break one, on purpose, and make someone pay.'],
    begriff: ['“{name}” — {n} times. If it’s a word of power, it needs a grammar. What can it do, and what does it cost?', '{name}. One of yours. I keep a file of words like that; when a sentence goes flat, one of them knows the way out.'],
    satz: ['“{satz}” — that’s a true sentence. Write the next one about home and you’ve got the whole journey.', 'This: “{satz}”. It moves. Description is motion; you know that already.'],
    zahl: ['{woerter} words, {tage} writing days. Discipline is the only magic I actually have — and it looks like you have it too.', '{texte} pieces; the longest is {laengster}. Finish the draft before you polish. You’re closer than you think.'],
    werke: ['Your works: {werke}. The big one’s the dragon. The little ones are the scales — build it scale by scale.', '{werke}. Same desk, same hours, and one of these becomes a book.'],
    wann: ['You were last in {zuletzt}. Open it and write one ugly paragraph to get the door moving.'],
    liste: ['Your cast: {figuren}. Every villain in there thinks he’s right. Find the one with the best argument.'],
    unbekannt: ['I don’t see that in your pages yet, {anrede}. Outline it — then let it break the outline.', 'Not there yet. Write the scene where it first appears and send me back.'],
    leer: ['No pages yet, {anrede}. Start before you know how. I did.']
  },
  green: {
    ausEinlesung: ['{name}. {kurz} From {werk}. Okay — but what does {name} want today, and who is in the way?'],
    gruss: ['Hi, {anrede}. I read your pages — {woerter} words across {texte} pieces. That is real work, and most of it will get thrown away, and that is fine. Ask me about {figuren}.', 'Okay, {anrede}: {woerter} words. I am going to take them seriously, because somebody should. What do you want to look at?'],
    figur: ['{name} — {n} appearances, mostly in {werk}. First line on the page: “{erster}”. What does {name} want that {name} cannot ask for?', '{name} keeps company with {begleiter} and mostly {verb}s. Give {name} one thing they are completely wrong about. That is where they become a person.', '{name}, {n} times. Nobody is only their situation. What is {name} like on an ordinary Tuesday, when nothing is happening?'],
    figurFrage: ['What is the kindest thing {name} does when nobody is watching?', 'What does {name} joke about instead of saying?', 'What would {name} never admit, even to {begleiter}?'],
    ort: ['{name} — {n} mentions. Give me the one object in that place that gives it away. Not the room; the thing on the shelf.', '{name} appears {n} times, mostly around {umgebung}. Real places hand you details you would never invent. What is actually there?'],
    begriff: ['“{name}” — {n} times. A word that recurs is a word that is doing work. What work?', '“{name}”, {n} times. Careful: a metaphor you love can stop meaning anything. Does this one still?'],
    satz: ['“{satz}” — that line is alive. Find out exactly why, and then do it again on purpose.', '“{satz}” Keep it. Cut the sentence next to it that explains it.'],
    zahl: ['{woerter} words across {texte} pieces, {tage} days at the desk. Most of it gets thrown away. That is the job, not a failure.', '{texte} pieces, the longest {laengster}. Numbers are not the work — but showing up is, and you showed up.'],
    werke: ['{liste}. Do not tidy them. Find the one that scares you and go back into it.'],
    wann: ['Since {wann}. Books take the time they take. Mine take four or five drafts and most of a year of throwing pages away.'],
    liste: ['{liste}'],
    unbekannt: ['I do not find that in your pages, {anrede}. Which might mean it belongs there and is not written yet.'],
    leer: ['There is nothing read in yet. Bring your texts in, and I will read them properly — no skimming.']
  },
  twain: {
    ausEinlesung: ['{name}. {kurz} Out of {werk}. Don’t tell me what {name} is — bring {name} on and let us watch.'],
    gruss: ['Well, {anrede}. I’ve read your pages — {woerter} words, {texte} pieces — and struck out a few adjectives in my head while I was at it. Ask me anything about {figuren}.', 'Good day, {anrede}. {woerter} words. Get the facts first; then you can distort them as you please. Go on, ask.'],
    figur: ['{name}. {n} appearances, chiefly in {werk}. First time on stage: “{erster}”. Don’t tell me {name} is brave — bring ’em on and let ’em be brave.', '{name} keeps company with {begleiter} and mostly {verb}s. Let {name} say the wrong thing and nobody correct it. The reader will, and then he’s in.', '{name} — {n} times. A scoundrel who is charming beats a saint who is tiresome. Which one is {name}?'],
    figurFrage: ['What’s the lie {name} tells best — and to whom?', 'What does {name} do when the grown-ups leave the room?', 'If {name} wrote you a letter, what would the first line be?'],
    ort: ['{name}, {n} times. Put in the weather only if somebody gets wet. What gets wet in {name}?', '{name} — write it the way people talk about it on the river, not in church.'],
    begriff: ['“{name}” — {n} times. The right word, or its second cousin? Say it aloud and see which.', '{name}. Yours, and plain. Plain is where the truth is.'],
    satz: ['“{satz}” — that one says the thing. It doesn’t come near it or send it a letter. Keep it.', 'Here: “{satz}”. Short words, long memory. That’s the one a reader repeats at breakfast.'],
    zahl: ['{woerter} words, {tage} days at the desk. A page a day is a book a year; you’re ahead of the page.', '{texte} pieces, the longest is {laengster}. Now go strike out every “very”.'],
    werke: ['On the desk: {werke}. One of these accomplishes something and arrives somewhere. Find it and finish it.', '{werke}. That’s a shelf a man could be proud of before lunch.'],
    wann: ['Last touched: {zuletzt}. Go back, read it aloud to the dog, and cut what he leaves the room for.'],
    liste: ['The folks in your pages: {figuren}. Let the boy tell it. There’s always a boy.'],
    unbekannt: ['I don’t find that in your pages, {anrede}. Either it ain’t written yet, or you call it something plainer. Try plain.', 'Not in what I read. Write it — and get the facts first.'],
    leer: ['No pages yet, {anrede}. Write without pay until somebody offers. The first page is the hardest; it’s also the only one you need today.']
  },
  kaestner: {
    ausEinlesung: ['{name}, ja. {kurz} Das steht in {werk}. Was ich gern wüsste: Was tut {name}, wenn niemand zuschaut?'],
    gruss: ['Sehen Sie, {anrede}: Ich habe gelesen, was da liegt — {woerter} Wörter, {texte} Texte. Ich kenne {figuren}. Fragen Sie mich nach jedem von ihnen.', 'Guten Tag, {anrede}. {woerter} Wörter, sauber gezählt. Ich meine das freundlich: Das ist Arbeit. Was möchten Sie wissen?'],
    figur: ['{name}. Kommt {n} Mal vor, meist in {werk}. Zum ersten Mal so: „{erster}“ — und schon weiß man, wie {name} den Hut trägt.', '{name} ist meist mit {begleiter} unterwegs und {verb} am häufigsten. Es gibt nichts Gutes, außer man tut es — was tut {name} als Nächstes?', '{name} — {n} Mal. Ich mag Figuren, die oft da sind; man kann sie beim Wort nehmen. Lassen Sie {name} einmal etwas versprechen.'],
    figurFrage: ['Was würde {name} nie tun — und wann wird es nötig?', 'Wer in der Geschichte schaut zu {name} auf, und weiß {name} das?', 'Was war {name} mit acht Jahren, und was ist davon übrig?'],
    ort: ['{name}, {n} Mal. Ein Ort ist eine Figur ohne Text. Geben Sie ihm eine Uhr, die falsch geht.', '{name} — man müsste wissen, wie es dort um halb sieben morgens riecht. Orte sind morgens ehrlich.'],
    begriff: ['„{name}“ — {n} Mal. Ein Wort, das zu Ihrer Welt gehört. Erklären Sie es nicht; gebrauchen Sie es, bis man es kennt.', '{name}. Sie verwenden es, als wüsste es jeder. Das ist richtig. So lernt man Wörter.'],
    satz: ['„{satz}“ — den Satz würde ich stehen lassen. Er ist kurz, er ist klar, und er lügt nicht.', 'Hier: „{satz}“. Man kann ihn laut vorlesen, ohne zu stolpern. Mehr verlange ich nicht.'],
    zahl: ['{woerter} Wörter an {tage} Tagen, {texte} Texte. Der längste ist {laengster}. Und nun: an den Tisch.', '{woerter} Wörter. Das ist kein Talent, das ist Fleiß — und ein bisschen Glück. Weiter so, {anrede}.'],
    werke: ['Was da liegt: {werke}. Eines davon ist das Buch. Die anderen sind die Übungen dafür. Beides zählt.', '{werke}. Ein Regal, {anrede}. Nehmen Sie das, vor dem Sie am meisten Respekt haben.'],
    wann: ['Zuletzt waren Sie in {zuletzt}. Gehen Sie zuerst dorthin zurück; die Tür ist noch warm.'],
    liste: ['Die Leute in Ihren Texten: {figuren}. Wer davon hatte noch keinen eigenen Auftritt?'],
    unbekannt: ['Das finde ich in Ihren Texten nicht, {anrede}. Entweder es ist noch nicht geschrieben — dann schreiben Sie es — oder es heißt bei Ihnen anders.', 'Kenne ich aus den Seiten nicht. Sagen Sie es anders, oder besser: setzen Sie es hinein.'],
    leer: ['Noch keine Seiten, {anrede}. Das macht nichts. Schreiben Sie einen Absatz und kommen Sie wieder; dann reden wir.']
  },
  funke: {
    ausEinlesung: ['{name} — ich erinnere mich gut. {kurz} Aus {werk}. Gib {name} einen Gegenstand, der immer dabei ist, dann glaube ich alles.'],
    gruss: ['Weißt du, {anrede} — ich habe alles gelesen, was da liegt: {woerter} Wörter, {texte} Texte. Ich kenne {figuren}. Frag mich nach ihnen, ich war dabei.', 'Hallo, {anrede}. {woerter} Wörter. Die Tinte hat gearbeitet. Worüber wollen wir reden?'],
    figur: ['{name}. {n} Mal, meistens in {werk}. So tritt {name} zum ersten Mal auf: „{erster}“ — und ich wollte sofort wissen, wie es weitergeht.', '{name} ist oft mit {begleiter} zusammen und {verb} am häufigsten. Ich würde gern wissen, wovor {name} sich fürchtet — da wohnt die Figur.', '{name} — {n} Mal. Gib {name} einen Gegenstand, den {name} immer bei sich hat. Dann glaube ich alles.'],
    figurFrage: ['Was hat {name} als Kind verloren und sucht immer noch?', 'Welches Tier wäre {name}? Und weiß {name} das?', 'Was flüstert {name} nachts, wenn keiner zuhört?'],
    ort: ['{name}, {n} Mal. Ein Ort muss älter sein als die Geschichte. Was hat {name} gesehen, bevor deine Figuren kamen?', '{name} — gib ihm ein Geräusch. Orte ohne Geräusch sind Kulissen.'],
    begriff: ['„{name}“ — {n} Mal. Ein Wort aus deiner Welt. Die Tinte kennt es schon; lass den Leser es hören, nicht lesen.', '{name}. Du benutzt es wie ein Geheimnis, das alle kennen. Genau so.'],
    satz: ['„{satz}“ — das ist ein Satz, der eine Tür aufmacht. Lass sie offen.', 'Hier: „{satz}“. Den würde ich laut lesen, abends, bei Kerze.'],
    zahl: ['{woerter} Wörter, {tage} Tage, {texte} Texte. Der längste: {laengster}. Gieß dein Buch, {anrede}, es wächst.', '{woerter} Wörter. Das ist Zauber — und Arbeit. Mehr braucht es nicht.'],
    werke: ['Deine Werke: {werke}. Eines davon ist der Wald, die anderen sind Lichtungen darin.', '{werke}. Ich würde mit dem anfangen, das am meisten nach Tinte riecht.'],
    wann: ['Zuletzt warst du in {zuletzt}. Geh dorthin zurück — die Geschichte wartet schon.'],
    liste: ['Deine Leute: {figuren}. Wer von ihnen hat noch kein Geheimnis? Gib ihm eins.'],
    unbekannt: ['Das kenne ich aus deinen Seiten nicht, {anrede}. Vielleicht steht es noch in der Tintenwerkstatt. Schreib es, dann kenne ich es.', 'Nicht in dem, was ich gelesen habe. Sag es anders — oder erzähl es mir neu.'],
    leer: ['Noch keine Seiten, {anrede}. Die Tür ist offen. Ein Satz, und wir sind drin.']
  },
  lindgren: {
    ausEinlesung: ['{name}, ja. {kurz} Aus {werk}. Und sag mir: Hat {name} irgendwo einen Ort, an dem es sicher ist?'],
    gruss: ['Weißt du, {anrede}, ich habe alles gelesen — {woerter} Wörter, {texte} Geschichten. Ich kenne {figuren}. Frag mich, ich bin eine alte Frau mit gutem Gedächtnis.', 'Hallo, mein Kind. {woerter} Wörter! Das hat mir Pippi beigebracht: Wer so viel schreibt, hat keine Angst. Frag nur.'],
    figur: ['{name}. {n} Mal, meistens in {werk}. So kommt {name} herein: „{erster}“ — und ich hatte {name} gleich gern.', '{name} ist oft mit {begleiter} zusammen und {verb} am liebsten. Kinder sagen, was sie meinen, und meinen mehr, als sie sagen. Was meint {name}?', '{name} — {n} Mal. Lass {name} einmal ungehorsam sein. Aus Liebe.'],
    figurFrage: ['Wovor hat {name} nachts Angst, und wer ist dann da?', 'Was kann {name} besser als alle Erwachsenen?', 'Was würde {name} tun, wenn heute Sommer wäre und niemand zuschaut?'],
    ort: ['{name}, {n} Mal. Ein guter Ort hat einen Baum, auf den man klettern kann. Wo klettert man in {name}?', '{name} — dort muss es einmal Sommer sein, richtig, mit Gras an den Knien.'],
    begriff: ['„{name}“ — {n} Mal. Ein Wort, das nur eure Welt kennt. Kinder lieben solche Wörter. Ich auch.', '{name}. So ein Wort hätte Pippi sich ausgedacht. Behalt es.'],
    satz: ['„{satz}“ — das ist ein Satz, der nach draußen will. Lass ihn.', 'Hier: „{satz}“. Ehrlich und kurz. So muss das.'],
    zahl: ['{woerter} Wörter an {tage} Tagen. Das genügt für einen Sommer, {anrede}. Für zwei.', '{texte} Geschichten, die längste ist {laengster}. Und dann lauf los.'],
    werke: ['Deine Geschichten: {werke}. In einer davon ist Bullerbü versteckt. Finde es.', '{werke}. Lies sie einem Kind vor. Wo es still wird, hast du recht.'],
    wann: ['Zuletzt warst du in {zuletzt}. Geh zurück und lies die letzte Seite laut.'],
    liste: ['Deine Leute: {figuren}. Wer davon ist das mutigste Kind? Gib ihm den nächsten Tag.'],
    unbekannt: ['Das kenne ich aus deinen Seiten nicht, mein Kind. Vielleicht ist es noch nicht geschrieben. Dann schreib es — ich warte.', 'Nicht in dem, was ich gelesen habe. Sag es anders, oder erzähl es mir.'],
    leer: ['Noch keine Seiten, {anrede}. Setz dich auf die Treppe und schau vor dich hin. Das ist auch Schreiben. Dann ein Satz.']
  }
};
/* Deutsche Fassungen der englischen Stimmen — Muster für Muster parallel. */
const GESPRAECH_DE = {
  king: {
    ausEinlesung: ['{name} — ich erinnere mich. {kurz} Das war in {werk}. Was ich wissen will: Was macht {name}, wenn in der Szene niemand hinsieht?'],
    gruss: ['Hör zu, {anrede}. Ich hab gelesen, was auf deinem Tisch liegt — {woerter} Wörter, {texte} Stücke. Ich kenne {figuren}. Frag mich alles über sie.', 'Okay, {anrede}. {woerter} Wörter. Das ist nicht nichts, das ist ein Job. Ich war in deinen Seiten — los, frag.'],
    figur: ['{name}. Taucht {n} Mal auf, meist in {werk}. Das erste Mal begegne ich {name} so: „{erster}“ — und ich bin schon im Raum. Gut.', '{name} — {n} Auftritte, meist mit {begleiter}. Das Verb, das du {name} am häufigsten gibst, ist „{verb}“. Pass auf: Eine Figur ist, was sie tut, also mach, dass das Tun von Szene zu Szene anders ist.', 'Ich mag {name}. {n} Mal auf der Seite, und ich hab nie gebraucht, dass du mir {name} erklärst. Bleib dabei — Taschen, keine Biografien.'],
    figurFrage: ['Was will {name} in der nächsten Szene, und was steht im Weg? Wenn du das nicht in einem Satz sagen kannst, ist das dein nächster Satz.', 'Was hat {name} gerade in der Tasche? Sag mir das, und ich sag dir, wer {name} ist.', 'Wann hatte {name} zuletzt Angst? Schreib die Szene. Nenn die Angst nicht.'],
    ort: ['{name} — {n} Mal, meist in {werk}. Ein Ort ist eine Figur ohne Text. Gib ihm einen Geruch und eine Sache, die kaputt ist.', 'Du kommst immer wieder nach {name}. Gut. Leser mögen einen Raum, den sie wiedererkennen. Jetzt ändere beim nächsten Mal eine Sache darin.'],
    begriff: ['„{name}“, {n} Mal. Es ist eins deiner Wörter — der Leser lernt es von dir. Benutz es wie ein Messer: selten, und wo es schneidet.', '{name}. Taucht {n} Mal in {werk} auf. Das ist ein Wort, das arbeitet. Sorg dafür, dass es sich nie selbst erklärt.'],
    satz: ['Hier ist einer von dir: „{satz}“ — der Satz geht auf eigenen Beinen in den Raum. Das willst du, jedes Mal.', '„{satz}“ — den würde ich behalten. Lies ihn laut; wenn du nicht stolperst, stolpert der Leser auch nicht.'],
    zahl: ['{woerter} Wörter, {texte} Stücke, {tage} Schreibtage. Das längste ist {laengster}. Das ist die Mathematik. Der Rest ist, sich morgen hinzusetzen.', '{woerter} Wörter. Du hast {texte} Dinge geschrieben und bist an {tage} Tagen wiedergekommen. Amateure warten; du bist aufgetaucht. Tauch weiter auf.'],
    werke: ['Was auf dem Tisch liegt: {werke}. Im großen steckt das Buch. In den kleinen übst du — beides zählt.', '{werke}. Das ist ein Regal, {anrede}. Nimm das, vor dem du am meisten Angst hast, und mach es auf.'],
    wann: ['Das Letzte, was du angefasst hast: {zuletzt}. Geh zuerst dorthin zurück. Die Tür ist noch warm.'],
    liste: ['Die Leute in deinen Seiten: {figuren}. Das ist eine Besetzung. Wer davon hatte seine Szene noch nicht?'],
    unbekannt: ['Das seh ich in deinen Seiten nicht, {anrede}. Entweder ist es noch nicht geschrieben — dann schreib es — oder du nennst es anders. Probier den Namen.', 'Nicht in den Seiten, die ich habe. Sag es anders, oder besser: geh und schreib es hinein.'],
    leer: ['Noch keine Seiten, {anrede}. Ist okay — jeder fängt mit demselben Weiß an. Schreib einen Absatz und komm wieder; dann reden wir.']
  },
  rothfuss: {
    ausEinlesung: ['{name}, ja. {kurz} Aus {werk}. Sprich den Namen einmal laut aus — und sag mir dann, was {name} verschweigt.'],
    gruss: ['Hm. Hallo, {anrede}. Ich lese langsam, also habe ich alles gelesen: {woerter} Wörter. Ich habe {figuren} zugehört. Was willst du wissen?', 'Also. {anrede}. Deine Seiten haben einen Klang — ich hab ihn in {werk} gehört. Frag mich nach jedem, der drin ist.'],
    figur: ['{name}. {n} Mal. Das erste Mal höre ich den Namen so: „{erster}“ — hör, wie das sitzt. Das hat Gewicht.', '{name} bleibt nah bei {begleiter}. Das Verb, das du {name} am meisten gibst, ist „{verb}“. Ein Mensch ist auch sein Schweigen — wo spricht {name} nicht?', '{name} — ich wüsste gern, was {name} mit den Händen kann. Ein Handwerk macht einen Menschen glaubwürdig. Gib {name} etwas, worin {name} gut ist.'],
    figurFrage: ['Wofür schämt sich {name}? Da wohnt die Geschichte.', 'Sprich {name}s Namen dreimal laut aus. Liegt er richtig auf der Zunge? Dann liegt er richtig auf der Seite.', 'Was würden die Leute hinter {name}s Rücken erzählen — und wie viel davon stimmt?'],
    ort: ['{name}, {n} Mal. Schreib es, als hätte es tausend Jahre existiert, bevor jemand hereinkam. Die Wände brauchen Kratzer.', '{name} — ein Ort will drei Arten von Stille: die im Raum, die im Menschen, die zwischen den Worten. Welche hast du geschrieben?'],
    begriff: ['„{name}“. {n} Mal. Worte haben Macht, weil sie Namen sind. Wenn dieses deins ist, gib ihm Regeln, und brich sie nie, ohne zu zahlen.', '{name} — mir gefällt, dass du es nicht erklärst. Lass den Leser es lernen wie eine Sprache: indem er hört, wie es gebraucht wird.'],
    satz: ['„{satz}“ — lies das laut. Dann noch einmal. Da — es klingt. Behalt es.', 'Dieser: „{satz}“. Das schwere Wort steht am Ende, wo es hingehört. Vertrau diesem Ohr.'],
    zahl: ['{woerter} Wörter an {tage} Tagen. Niemand erinnert sich, wie lange ein Buch gedauert hat. Nur, ob es wahr war. Bisher ist es wahr.', '{texte} Stücke, das längste ist {laengster}. Nimm dir die Zeit, die es braucht, {anrede}.'],
    werke: ['Dein Regal: {werke}. Das lange hat die tiefen Wurzeln. Die kurzen sind, wo du das Instrument stimmst.', '{werke}. Jedes in einer anderen Tonart. Ich würde hören, welches am reinsten klingt, und morgen dort anfangen.'],
    wann: ['Zuletzt warst du in {zuletzt}. Geh zurück und lies eine Seite laut, bevor du die nächste schreibst.'],
    liste: ['Deine Leute: {figuren}. Jeder von ihnen hält sich für die Hauptfigur. Schreib die kleinen, als wüssten sie es.'],
    unbekannt: ['Den Namen habe ich in deinen Seiten nicht gehört, {anrede}. Vielleicht wartet er darauf, geschrieben zu werden. Vielleicht nennst du ihn anders.', 'Nicht in dem, was ich gelesen habe. Sag es noch einmal, oder schreib es hinein — die Stille, wo es stehen sollte, ist eine Art Einladung.'],
    leer: ['Noch keine Seiten. Das ist kein Problem, {anrede}; das ist die Stille vor dem ersten Ton. Schreib einen Satz, der richtig klingt. Dann noch einen.']
  },
  pratchett: {
    ausEinlesung: ['{name}! {kurz} Das war {werk}. Gib {name} eine kleine Aufgabe und eine schlechte Angewohnheit, und der Leser folgt überallhin.'],
    gruss: ['Also, {anrede}. Ich hab deine Seiten gelesen — {woerter} Wörter, {texte} Stücke — und mir Randnotizen gemacht, manche unhöflich. Frag los.', 'Hallo, {anrede}. {figuren} — das ist eine ordentliche Menge. Irgendwer da drin wird Ärger machen. Wer?'],
    figur: ['{name}. {n} Auftritte. Erste Sichtung: „{erster}“. Ich mag Figuren, die auftauchen, bevor man sie vorstellt.', '{name} verbringt viel Zeit mit {begleiter} und {verb} meistens. Weiß {name}, dass {name} nicht die Hauptfigur ist? Sorg dafür, dass nicht.', '{name} — {n} Mal, meist in {werk}. Gib {name} einen Hut. Man erfährt mehr über einen Menschen aus seinem Hut als aus seiner Biografie.'],
    figurFrage: ['Was würde {name} nie, niemals tun? Gut. Jetzt sorg dafür, dass es nötig wird.', 'Was findet {name} lustig? Das sagt mir mehr als das, wovor {name} Angst hat.', 'Wer ist {name}, wenn niemand Wichtiges zuschaut?'],
    ort: ['{name}, {n} Mal. Jeder Ort braucht eine Wache, einen Markt und jemanden, der die Laternen anzündet. Wer zündet in {name} die Laternen an?', '{name} — ich wüsste gern, wie es um sechs Uhr morgens riecht. Orte sind um sechs Uhr morgens ehrlich.'],
    begriff: ['„{name}“ — {n} Mal. Eins von deinen. Der Trick bei einem erfundenen Wort: benutz es, als wüsste es jeder längst. Tust du. Gut.', '{name}. Ein Wort, das seine eigene Fußnote trägt. Schreib die Fußnote nicht. Na ja — einmal vielleicht.'],
    satz: ['„{satz}“ — bei dem hab ich von der Seite aufgeschaut, und das ist der ganze Job.', 'Den würde ich behalten: „{satz}“. Der hat einen Hut auf.'],
    zahl: ['{woerter} Wörter. Mit vierhundert am Tag wärst du in {vierhundert} Tagen hier gewesen; du hast es auf deine Art gemacht, an {tage} davon. Mir recht.', '{texte} Stücke, das längste ist {laengster}. Das ist ein Buch in Verkleidung, {anrede}.'],
    werke: ['Im Regal: {werke}. Eins davon ist der Roman. Die anderen sind Fußnoten dazu — und da versteckt sich bekanntlich das Gute.', '{werke}. Ich würde mit dem anfangen, bei dem du lachen musst. Dann nimm es ernst — später.'],
    wann: ['Zuletzt angefasst: {zuletzt}. Geh dorthin zurück. Die Scheibe dreht sich weiter, aber sie mag einen Schubs.'],
    liste: ['Die Besetzung: {figuren}. Irgendwer hier ist eine Nebenfigur, die es nicht weiß. Find sie und gib ihr ein Kapitel.'],
    unbekannt: ['Nicht in deinen Seiten, {anrede} — ich hab zweimal nachgesehen, einmal mit Brille. Probier ein anderes Wort, oder schreib es hinein und überrasch mich.', 'Kenne ich nicht. Wenn es ein Hut ist, beschreib den Hut; wenn es ein Mensch ist, gib ihm einen Beruf.'],
    leer: ['Noch keine Seiten. Vierhundert Wörter am Tag, {anrede}. Schlechte reichen. Ich warte hier mit dem Hut.']
  },
  tolkien: {
    ausEinlesung: ['{name}. {kurz} Das gehört zu {werk}. Sag mir, wo {name} lieber wäre — Sehnsucht ist der Motor.'],
    gruss: ['Nun denn, {anrede}. Ich habe gelesen, was du niedergeschrieben hast — {woerter} Wörter, der größere Teil in {werk}. Ich kenne die Namen: {figuren}. Frag mich nach jedem.', 'Guten Abend, {anrede}. Eine Welt besteht aus Namen, und deine hat schon {figuren}. Was möchtest du wissen?'],
    figur: ['{name}. Der Name kommt {n} Mal vor, vor allem in {werk}. Zuerst wird er so gesprochen: „{erster}“ — und ein zuerst gesprochener Name ist eine geöffnete Tür.', '{name} geht meist mit {begleiter}, und die Tat, die du {name} am häufigsten gibst, ist „{verb}“. Kleine Hände bewegen die Räder einer Geschichte; sieh zu, dass {name}s Hände etwas tun.', '{name} — ich wüsste gern, wo {name} lieber wäre. Sehnsucht ist der Motor jeder Reise.'],
    figurFrage: ['Wo ist Zuhause für {name}, und wie weit ist {name} jetzt davon entfernt?', 'Wie wurde {name} als Kind genannt, und wer benutzt diesen Namen noch?', 'Was trägt {name} bei sich, das {name} in einem brennenden Haus nicht zurücklassen würde?'],
    ort: ['{name}, {n} Mal. Ein Ort sollte eine Geschichte haben, die der Leser nie erfährt. Lass in {name} eine Ruine stehen, die niemand erklärt.', '{name} — sprich den Namen hundertmal laut, bis er klingt, als hätten ihn Zungen glatt geschliffen. Dann ist es ein wirklicher Ort.'],
    begriff: ['„{name}“ — {n} Mal. Ein Wort kommt mit einem Mund, und ein Mund mit einem Leben. Wessen Mund hat dieses zuerst gesagt?', '{name}. Du gebrauchst es als Wort deiner Welt. Halte seine Bedeutung stimmig, wie eine Legende es muss; eine Welt, die ihren eigenen alten Geschichten widerspricht, ist bemalter Stoff.'],
    satz: ['„{satz}“ — das hat den Tonfall von etwas, das gesungen wurde, bevor es geschrieben war. Gut.', 'Hier: „{satz}“. Lass es stehen. Manche Sätze wollen in Ruhe gelassen werden wie eine alte Straße.'],
    zahl: ['{woerter} Wörter, {texte} Stücke, über {tage} Tage. Die Geschichte wächst beim Erzählen; zwölf Jahre sind nicht zu lang. Du bist im ersten — geh weiter.', '{texte} Schriften; die längste ist {laengster}. Zuerst Wurzeln, dann der Baum.'],
    werke: ['Deine Werke: {werke}. Das lange ist der Baum; die kurzen sind Sämlinge in derselben Erde.', '{werke}. Zeichne die Karte, die sie verbindet — vielleicht führt eine Straße durch alles.'],
    wann: ['Zuletzt gingst du in {zuletzt}. Kehr dorthin zurück und mach drei Schritte, bevor du eine neue Straße wählst.'],
    liste: ['Die Namen deiner Welt: {figuren}. Jeder eine kleine Geschichte. Wer von ihnen hat seine noch nicht erzählt?'],
    unbekannt: ['Diesen Namen finde ich in deinen Seiten nicht, {anrede}. Vielleicht liegt er hinter dem nächsten Hügel, ungeschrieben. Vielleicht trägt er in deiner Sprache einen anderen.', 'Nicht in den Chroniken, die ich habe. Schreib es nieder, und ich kenne es beim nächsten Mal.'],
    leer: ['Noch keine Seiten, {anrede}. Beginne mit einer Karte, oder mit einer Höhle in der Erde und jemandem, der sie nicht verlassen will.']
  },
  blyton: {
    ausEinlesung: ['{name}, natürlich! {kurz} Aus {werk}. Also — was hat {name} in den Taschen?'],
    gruss: ['Also, {anrede}! Ich habe alles gelesen — {woerter} Wörter, {texte} Stücke — und ich kenne {figuren}. Schnell, bevor der Kessel pfeift: Was willst du wissen?', 'Hallo, {anrede}. {woerter} Wörter! Das schaffen die meisten Erwachsenen nicht. Frag mich nach jedem da drin.'],
    figur: ['{name}! {n} Mal, meist in {werk}. So begegnen wir {name} zuerst: „{erster}“ — direkt hinein, kein Trödeln. Gut.', '{name} zieht mit {begleiter} los und {verb} meistens. Also: Wer davon ist bockig, wer mutig, wer hungrig? Kinder wollen das wissen.', '{name} — {n} Mal. Ich mag Figuren, die oft auftauchen; Leser werden ihnen gut. Gib {name} eine Sache, die {name} immer sagt.'],
    figurFrage: ['Was hat {name} fürs Picknick in den Taschen?', 'Mit wem zankt sich {name} am meisten — und zu wem rennt {name}, wenn es dunkel ist?', 'Was bemerkt {name}, das die Erwachsenen übersehen?'],
    ort: ['{name}, {n} Mal. Gibt es in {name} einen Platz, an den die Erwachsenen nicht kommen? Sollte es.', '{name} — zeichne zuerst die Karte. Ein Kind will wissen, wo der Tunnel herauskommt.'],
    begriff: ['„{name}“ — {n} Mal. Ein Wort, das alle Kinder in deiner Geschichte kennen. Benutz es und erklär es nicht; Leser lieben es, eingeweiht zu sein.', '{name}. Deins. Leg es in eine Keksdose und vergrab es in Kapitel zwei; grab es in Kapitel neun aus.'],
    satz: ['„{satz}“ — kurz, hell, los geht’s. So schreibt man für Augen, die unter der Decke lesen.', 'Hier: „{satz}“. Jemand ist im Begriff, irgendwohin zu gehen. Das ist immer richtig.'],
    zahl: ['{woerter} Wörter an {tage} Tagen. Ich habe zehntausend am Tag auf dem Knie geschafft — aber ich habe angegeben. Du machst das fein, {anrede}.', '{texte} Stücke, das längste ist {laengster}. Kurze Kapitel, wohlgemerkt — die Taschenlampenbatterie hält nie.'],
    werke: ['Deine Geschichten: {werke}. In welcher ist ein Picknick? Die bringst du zuerst zu Ende.', '{werke}. Ein ordentliches Regal. Irgendwo da drin ist ein Geheimgang, der irgendwohin führt, wo es darauf ankommt.'],
    wann: ['Zuletzt warst du in {zuletzt}. Zurück mit dir — die Ferien sind nicht vorbei.'],
    liste: ['Deine Kinder und Erwachsenen: {figuren}. Wer davon ist der Hund? Jede Geschichte braucht den Hund.'],
    unbekannt: ['Das kenne ich aus deinen Seiten nicht, {anrede}! Vielleicht versteckt es sich in einem Tunnel, den du noch nicht geschrieben hast. Schreib ihn.', 'Nicht in den Geschichten, die ich gelesen habe. Probier einen anderen Namen — oder setz den Kessel auf und schreib es hinein.'],
    leer: ['Noch keine Seiten, {anrede}! Schließ eine Minute die Augen, dann schreib, welches Kind hereinkommt. Plane nichts. Los.']
  },
  paolini: {
    ausEinlesung: ['{name}. {kurz} Das ist {werk}. Was will {name}, und was kostet es, das zu wollen?'],
    gruss: ['Hey, {anrede}. Ich hab deine Seiten gelesen — {woerter} Wörter in {texte} Stücken. {figuren}: Die kenne ich jetzt. Frag mich alles.', 'Schau, {anrede} — {woerter} Wörter. Mit fünfzehn hätte ich dafür alles gegeben. Worüber willst du reden?'],
    figur: ['{name}. {n} Mal, meist in {werk}. Erster Auftritt: „{erster}“ — das kleinste Rätsel trägt die größte Tür, und das hier öffnet eine.', '{name} bewegt sich mit {begleiter}; das Verb, das du {name} am häufigsten gibst, ist „{verb}“. Hat {name} einen Mentor — und liegt der in einer wichtigen Sache falsch?', '{name} — {n} Mal. Gib {name} eine Fähigkeit und lass {name} einen Preis zahlen, wenn {name} sie benutzt. So hört ein Held auf, ein Name zu sein.'],
    figurFrage: ['Was glaubt {name}, das falsch ist — und wann findet {name} es heraus?', 'Was würde {name} nie tauschen, und wofür tauscht {name} es am Ende doch?', 'Wer hat {name} beigebracht, worin {name} am besten ist, und wo ist diese Person jetzt?'],
    ort: ['{name}, {n} Mal. Weltenbau ist keine Liste von Königreichen; es ist der Geruch der Bäckerei in {name}. Wonach riecht es?', '{name} — gib ihm drei eigene Regeln. Dann brich eine, absichtlich, und lass jemanden zahlen.'],
    begriff: ['„{name}“ — {n} Mal. Wenn es ein Wort der Macht ist, braucht es eine Grammatik. Was kann es, und was kostet es?', '{name}. Eins von deinen. Ich führe eine Liste solcher Wörter; wenn ein Satz flach wird, kennt eins davon den Ausweg.'],
    satz: ['„{satz}“ — das ist ein wahrer Satz. Schreib den nächsten über Zuhause und du hast die ganze Reise.', 'Dieser: „{satz}“. Er bewegt sich. Beschreibung ist Bewegung; das weißt du schon.'],
    zahl: ['{woerter} Wörter, {tage} Schreibtage. Disziplin ist die einzige Magie, die ich wirklich habe — und es sieht aus, als hättest du sie auch.', '{texte} Stücke; das längste ist {laengster}. Beende den Entwurf, bevor du polierst. Du bist näher dran, als du denkst.'],
    werke: ['Deine Werke: {werke}. Das große ist der Drache. Die kleinen sind die Schuppen — bau ihn Schuppe für Schuppe.', '{werke}. Gleicher Tisch, gleiche Stunden, und eins davon wird ein Buch.'],
    wann: ['Zuletzt warst du in {zuletzt}. Mach es auf und schreib einen hässlichen Absatz, damit die Tür in Bewegung kommt.'],
    liste: ['Deine Besetzung: {figuren}. Jeder Bösewicht da drin glaubt, er hat recht. Find den mit dem besten Argument.'],
    unbekannt: ['Das sehe ich noch nicht in deinen Seiten, {anrede}. Plane es — und lass es dann den Plan brechen.', 'Noch nicht da. Schreib die Szene, in der es zum ersten Mal auftaucht, und schick mich zurück.'],
    leer: ['Noch keine Seiten, {anrede}. Fang an, bevor du weißt, wie. Ich hab’s auch so gemacht.']
  },
  green: {
    ausEinlesung: ['{name}. {kurz} Aus {werk}. Okay — aber was will {name} heute, und wer steht im Weg?'],
    gruss: ['Hallo, {anrede}. Ich habe deine Seiten gelesen — {woerter} Wörter in {texte} Stücken. Das ist echte Arbeit, und das meiste davon wird weggeworfen, und das ist in Ordnung. Frag mich nach {figuren}.', 'Okay, {anrede}: {woerter} Wörter. Ich nehme sie ernst, denn irgendjemand sollte das tun. Was willst du dir ansehen?'],
    figur: ['{name} — {n} Auftritte, vor allem in {werk}. Erste Zeile auf dem Papier: „{erster}“. Was will {name}, das {name} nicht erbitten kann?', '{name} hält sich an {begleiter} und {verb} meistens. Gib {name} eine Sache, in der {name} sich völlig irrt. Da wird ein Mensch daraus.', '{name}, {n} Mal. Niemand ist nur seine Lage. Wie ist {name} an einem gewöhnlichen Dienstag, an dem nichts passiert?'],
    figurFrage: ['Was ist das Freundlichste, das {name} tut, wenn niemand zusieht?', 'Worüber macht {name} Witze, statt es zu sagen?', 'Was würde {name} nicht einmal {begleiter} zugeben?'],
    ort: ['{name} — {n} Erwähnungen. Nenn mir den einen Gegenstand, der diesen Ort verrät. Nicht den Raum; das Ding im Regal.', '{name} kommt {n} Mal vor, meist rund um {umgebung}. Echte Orte schenken dir Einzelheiten, die man nicht erfindet. Was steht wirklich dort?'],
    begriff: ['„{name}“ — {n} Mal. Ein Wort, das wiederkehrt, arbeitet. Woran?', '„{name}“, {n} Mal. Vorsicht: ein Bild, das man liebt, hört irgendwann auf zu bedeuten. Bedeutet dieses noch etwas?'],
    satz: ['„{satz}“ — diese Zeile lebt. Finde heraus, warum genau, und mach es dann mit Absicht noch einmal.', '„{satz}“ Behalt sie. Streich den Satz daneben, der sie erklärt.'],
    zahl: ['{woerter} Wörter in {texte} Stücken, {tage} Tage am Tisch. Das meiste davon wird weggeworfen. Das ist die Arbeit, kein Scheitern.', '{texte} Stücke, das längste {laengster}. Zahlen sind nicht die Arbeit — aber Hinsetzen schon, und du hast dich hingesetzt.'],
    werke: ['{liste}. Räum sie nicht auf. Such das, vor dem dir bange ist, und geh wieder hinein.'],
    wann: ['Seit {wann}. Bücher brauchen, was sie brauchen. Meine brauchen vier, fünf Fassungen und ein knappes Jahr Wegwerfen.'],
    liste: ['{liste}'],
    unbekannt: ['Das finde ich in deinen Seiten nicht, {anrede}. Was heißen kann, dass es dorthin gehört und noch nicht geschrieben ist.'],
    leer: ['Es ist noch nichts eingelesen. Bring deine Texte herein, dann lese ich sie richtig — nicht überflogen.']
  },
  twain: {
    ausEinlesung: ['{name}. {kurz} Aus {werk}. Sag mir nicht, was {name} ist — bring {name} auf die Bühne und lass uns zusehen.'],
    gruss: ['Nun, {anrede}. Ich habe deine Seiten gelesen — {woerter} Wörter, {texte} Stücke — und dabei im Kopf ein paar Adjektive gestrichen. Frag mich alles über {figuren}.', 'Guten Tag, {anrede}. {woerter} Wörter. Beschaff dir zuerst die Fakten; dann darfst du sie verdrehen. Los, frag.'],
    figur: ['{name}. {n} Auftritte, vor allem in {werk}. Zum ersten Mal auf der Bühne: „{erster}“. Sag mir nicht, dass {name} mutig ist — bring {name} auf die Bühne und lass {name} mutig sein.', '{name} hält sich an {begleiter} und {verb} meistens. Lass {name} das Falsche sagen und niemanden es verbessern. Der Leser tut es, und dann ist er drin.', '{name} — {n} Mal. Ein charmanter Schurke schlägt einen ermüdenden Heiligen. Welches von beiden ist {name}?'],
    figurFrage: ['Welche Lüge erzählt {name} am besten — und wem?', 'Was tut {name}, wenn die Erwachsenen den Raum verlassen?', 'Wenn {name} dir einen Brief schriebe — wie lautete die erste Zeile?'],
    ort: ['{name}, {n} Mal. Nimm das Wetter nur hinein, wenn jemand nass wird. Wer wird in {name} nass?', '{name} — schreib es, wie die Leute am Fluss darüber reden, nicht in der Kirche.'],
    begriff: ['„{name}“ — {n} Mal. Das richtige Wort oder sein Cousin zweiten Grades? Sag es laut und sieh nach.', '{name}. Deins, und schlicht. Im Schlichten sitzt die Wahrheit.'],
    satz: ['„{satz}“ — der sagt die Sache. Er kommt ihr nicht nahe und schickt ihr keinen Brief. Behalt ihn.', 'Hier: „{satz}“. Kurze Wörter, langes Gedächtnis. Das ist der, den ein Leser beim Frühstück wiederholt.'],
    zahl: ['{woerter} Wörter, {tage} Tage am Tisch. Eine Seite am Tag ist ein Buch im Jahr; du bist der Seite voraus.', '{texte} Stücke, das längste ist {laengster}. Und jetzt streich jedes „sehr“.'],
    werke: ['Auf dem Tisch: {werke}. Eins davon leistet etwas und kommt irgendwo an. Find es und bring es zu Ende.', '{werke}. Auf so ein Regal kann ein Mann vor dem Mittagessen stolz sein.'],
    wann: ['Zuletzt angefasst: {zuletzt}. Geh zurück, lies es dem Hund vor, und streich, wofür er den Raum verlässt.'],
    liste: ['Die Leute in deinen Seiten: {figuren}. Lass den Jungen erzählen. Es gibt immer einen Jungen.'],
    unbekannt: ['Das finde ich in deinen Seiten nicht, {anrede}. Entweder ist es noch nicht geschrieben, oder du nennst es schlichter. Probier schlicht.', 'Nicht in dem, was ich gelesen habe. Schreib es — und beschaff dir zuerst die Fakten.'],
    leer: ['Noch keine Seiten, {anrede}. Schreib ohne Lohn, bis dir jemand einen bietet. Die erste Seite ist die schwerste; sie ist auch die einzige, die du heute brauchst.']
  }
};
/* Kleine Hinweise aus den Zahlen — je Sprache. */
const GESPRAECH_HINWEISE = {
  de: {
    dialogViel: 'Auffällig: {name} steht fast immer in der Nähe von Anführungszeichen — {name} redet viel. Gib {name} eine Szene, in der {name} schweigt.',
    dialogWenig: '{name} spricht kaum — {name} wird beschrieben, nicht gehört. Ein einziger Satz aus {name}s Mund würde viel ändern.',
    alleinViel: '{name} ist oft allein auf der Seite, ohne andere Namen im Satz. Wer müsste neben {name} stehen?',
    einWerk: '{name} kommt nur in {werk} vor. Wenn {name} dir wichtig ist: Was macht {name} in deinen anderen Texten?',
    verbImmer: 'Das häufigste Verb bei {name} ist „{verb}“. Such dir für die nächste Szene ein anderes.',
    vieleWerke: '{name} taucht in {werkeZahl} Werken auf — {name} wandert mit dir. Das ist ein gutes Zeichen für eine Hauptfigur.'
  },
  en: {
    dialogViel: 'Noticeable: {name} is almost always near quotation marks — {name} talks a lot. Give {name} one scene of silence.',
    dialogWenig: '{name} hardly speaks — {name} gets described, not heard. One sentence out of {name}’s mouth would change a lot.',
    alleinViel: '{name} is often alone on the page, with no other names in the sentence. Who ought to be standing next to {name}?',
    einWerk: '{name} only appears in {werk}. If {name} matters to you: what is {name} doing in your other texts?',
    verbImmer: 'The most frequent verb with {name} is “{verb}”. Find a different one for the next scene.',
    vieleWerke: '{name} turns up in {werkeZahl} works — {name} travels with you. That is a good sign for a main character.'
  }
};

/* Zahlen hübsch; Listen mit „und". Pur. */
function gespraechZahl(n) { try { return Number(n || 0).toLocaleString('de-DE'); } catch (e) { return String(n); } }
function gespraechListe(arr, en, max = 5) {
  const a = (arr || []).slice(0, max); if (!a.length) return en ? 'nobody yet' : 'noch niemand';
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + (en ? ' and ' : ' und ') + a[a.length - 1];
}
/* Einen Satz kürzen, ohne ihn zu zerreißen. Pur. */
function gespraechKurz(s, max = 140) { s = String(s || '').trim(); if (s.length <= max) return s; const t = s.slice(0, max); const i = t.lastIndexOf(' '); return (i > 40 ? t.slice(0, i) : t) + ' …'; }
/* Den Satz mit dem Werk herausnehmen — Orte und Begriffe gehören zu mehreren Texten. Pur. */
function ohneWerk(muster) {
  /* Für Orte und Begriffe aus der Einlesung: Name, was die Wand darüber weiß, und der
     Teil des Musters, der ohne Zahlen auskommt (alles nach dem ersten Satz mit {n}). */
  const m = String(muster || '');
  const i = m.indexOf('{n}');
  let rest = m;
  if (i >= 0) { const p = m.slice(i).search(/[.!?]/); rest = p >= 0 ? m.slice(i + p + 1) : ''; }
  rest = rest.replace(/^[^A-Za-zÄÖÜäöü„“"']*/, '').trim();
  return '{name}. {kurz}' + (rest ? ' ' + rest : '');
}
/* Platzhalter füllen. Pur. */
function gespraechFuellen(muster, w) { return String(muster || '').replace(/\{(\w+)\}/g, (m, k) => (w[k] != null && w[k] !== '' ? String(w[k]) : m)).replace(/\{\w+\}/g, '…'); }

/* Die Antwort einer Stimme auf eine gelesene Frage: { text, de, belege, art }. Pur bis auf Datum. */
function gespraechAntwort(autor, antwort, k, { anrede = '', saat = 1 } = {}) {
  if (!autor) return null;
  const en = !!autor.en;
  const st = GESPRAECH_STIMMEN[autor.id] || GESPRAECH_STIMMEN.kaestner;
  const stDe = en ? (GESPRAECH_DE[autor.id] || null) : null;
  const z = typeof salonZufall === 'function' ? salonZufall(saat) : () => .5;
  let pickI = 0;
  const pick = (liste) => { const l = liste || []; if (!l.length) return ''; pickI = Math.floor(z() * l.length) % l.length; return l[pickI]; };
  const pickDe = (liste) => { const l = liste || []; return l.length ? l[pickI % l.length] : ''; };
  const du = anrede || (en ? 'friend' : 'du');
  if (!k || k.leer) { const i = 0; return { art: 'leer', text: gespraechFuellen(st.leer[i], { anrede: du }), de: stDe ? gespraechFuellen(stDe.leer[i], { anrede: du }) : '', belege: [] }; }
  const fig = (k.figuren || []).map((f) => f.name);
  const basisFuer = (e) => ({ anrede: du, woerter: gespraechZahl(k.woerter), texte: gespraechZahl(k.texte), figuren: gespraechListe(fig, e, 5), orte: gespraechListe((k.orte || []).map((o) => o.name), e, 4), begriffe: gespraechListe((k.begriffe || []).map((b) => b.name), e, 4), tage: gespraechZahl(k.zeit && k.zeit.schreibtage || 0), laengster: k.zeit && k.zeit.laengster ? '„' + (k.zeit.laengster.titel || k.zeit.laengster.werk) + '“ (' + gespraechZahl(k.zeit.laengster.woerter) + (e ? ' words)' : ' Wörter)') : '—', zuletzt: k.zeit && k.zeit.letzter ? '„' + (k.zeit.letzter.titel || k.zeit.letzter.werk) + '“' : '—', werk: (k.werke[0] || {}).name || '—', werke: gespraechListe((k.werke || []).map((w) => w.name + ' (' + gespraechZahl(w.woerter) + ')'), e, 6), vierhundert: gespraechZahl(Math.ceil((k.woerter || 0) / 400)) });
  const basis = basisFuer(en), basisDe = basisFuer(false);
  if (!antwort) antwort = { absicht: 'gruss' };
  let art = antwort.absicht, text = '', de = '', belege = (antwort.belege || []).map((b) => ({ satz: gespraechKurz(b.satz, 220), werk: b.werk, id: b.id }));
  const w = Object.assign({}, basis);
  const wesen = antwort.wesen;
  let begleiterListe = [];
  const wDe = () => Object.assign({}, w, basisDe, { begleiter: gespraechListe(begleiterListe, false, 3) });
  const fertig = (mus, musDe, extra) => { text = gespraechFuellen(mus, w) + (extra ? ' ' + extra.text : ''); de = stDe ? gespraechFuellen(musDe, wDe()) + (extra ? ' ' + extra.de : '') : ''; };
  /* Kennt die Wand den Namen aus der Einlesung, spricht die Stimme aus dem, was sie damals gelesen hat */
  let einlesung = null;
  if (wesen && typeof einlesungFigur === 'function') {
    const f = einlesungFigur(wesen.name);
    if (f) { einlesung = { art: 'figur', name: f.name, werk: f.werk, kurz: f.kurz, mehr: f.mehr, notiz: typeof einlesungNotiz === 'function' ? einlesungNotiz(autor.id, f.name) : null }; }
    else if (typeof einlesungOrt === 'function' && einlesungOrt(wesen.name)) einlesung = { art: 'ort', name: wesen.name, kurz: einlesungOrt(wesen.name), notiz: null };
    else if (typeof einlesungBegriff === 'function' && einlesungBegriff(wesen.name)) einlesung = { art: 'begriff', name: wesen.name, kurz: einlesungBegriff(wesen.name), notiz: null };
  }
  if (wesen && (art === 'wer' || art === 'stelle' || art === 'saetze' || art === 'zahl' || art === 'wo' || art === 'wann' || art === 'begriffe' || art === 'figuren')) {
    w.name = wesen.name; w.n = gespraechZahl(wesen.n); w.werk = (wesen.werke && wesen.werke[0] ? wesen.werke[0].name : basis.werk);
    w.erster = gespraechKurz(wesen.erster ? wesen.erster.satz : '', 110);
    begleiterListe = (wesen.begleiter || []).map((b) => b.name);
    w.begleiter = gespraechListe(begleiterListe, en, 3);
    w.verb = wesen.verben && wesen.verben[0] ? wesen.verben[0].verb : (en ? 'look' : 'schauen');
    const i = Math.floor(z() * 3) % 3;
    if (wesen.art === 'figur') {
      const mus = st.figur[i % st.figur.length], musDe = stDe ? stDe.figur[i % stDe.figur.length] : '';
      /* Hinweis aus den Zahlen */
      let hin = null, hinDe = null;
      const dialogAnteil = wesen.n ? wesen.dialog / wesen.n : 0;
      const hx = GESPRAECH_HINWEISE[en ? 'en' : 'de'], hd = GESPRAECH_HINWEISE.de;
      if (wesen.n >= 8 && dialogAnteil > .75) { hin = hx.dialogViel; hinDe = hd.dialogViel; }
      else if (wesen.n >= 8 && dialogAnteil < .12) { hin = hx.dialogWenig; hinDe = hd.dialogWenig; }
      else if (wesen.n >= 8 && !(wesen.begleiter || []).length) { hin = hx.alleinViel; hinDe = hd.alleinViel; }
      else if ((wesen.werke || []).length >= 3) { hin = hx.vieleWerke; hinDe = hd.vieleWerke; }
      else if (wesen.n >= 10 && wesen.verben && wesen.verben[0] && wesen.verben[0].n >= wesen.n * .25) { hin = hx.verbImmer; hinDe = hd.verbImmer; }
      else if ((wesen.werke || []).length === 1 && (k.werke || []).length > 1 && wesen.n >= 5) { hin = hx.einWerk; hinDe = hd.einWerk; }
      w.werkeZahl = (wesen.werke || []).length;
      const frage = st.figurFrage[(i + 1) % st.figurFrage.length], frageDe = stDe ? stDe.figurFrage[(i + 1) % stDe.figurFrage.length] : '';
      const extra = { text: (hin ? gespraechFuellen(hin, w) + ' ' : '') + gespraechFuellen(frage, w), de: stDe ? (hinDe ? gespraechFuellen(hinDe, wDe()) + ' ' : '') + gespraechFuellen(frageDe, wDe()) : '' };
      if (art === 'stelle' || art === 'saetze') { const s = belege[0]; w.satz = s ? gespraechKurz(s.satz, 160) : w.erster; fertig(st.satz[i % st.satz.length], stDe ? stDe.satz[i % stDe.satz.length] : '', null); }
      else if (einlesung && einlesung.notiz) {
        /* Aus der Einlesung: die Stimme hat zu dieser Figur damals selbst etwas notiert */
        text = einlesung.notiz.text + ' ' + gespraechFuellen(frage, w);
        de = stDe ? (einlesung.notiz.de || '') + ' ' + gespraechFuellen(frageDe, wDe()) : '';
      }
      else if (einlesung && !wesen.n) {
        /* Nur aus der Einlesung bekannt: keine Zahlen erfinden */
        w.kurz = einlesung.kurz; w.werk = einlesung.werk || basis.werk;
        fertig((st.ausEinlesung || st.figur)[0], stDe ? (stDe.ausEinlesung || stDe.figur)[0] : '', null);
      }
      else fertig(mus, musDe, extra);
      art = 'figur';
    } else if (wesen.art === 'ort') {
      if (einlesung && !wesen.n) { w.kurz = einlesung.kurz; fertig(ohneWerk(st.ort[0]), stDe ? ohneWerk(stDe.ort[0]) : ''); }
      else fertig(st.ort[i % st.ort.length], stDe ? stDe.ort[i % stDe.ort.length] : '');
      art = 'ort';
    }
    else {
      if (einlesung && !wesen.n) { w.kurz = einlesung.kurz; fertig(ohneWerk(st.begriff[0]), stDe ? ohneWerk(stDe.begriff[0]) : ''); }
      else fertig(st.begriff[i % st.begriff.length], stDe ? stDe.begriff[i % stDe.begriff.length] : '');
      art = 'begriff';
    }
  } else if (art === 'zahl') fertig(pick(st.zahl), stDe ? pickDe(stDe.zahl) : '');
  else if (art === 'werke') fertig(pick(st.werke), stDe ? pickDe(stDe.werke) : '');
  else if (art === 'wann') fertig(st.wann[0], stDe ? stDe.wann[0] : '');
  else if (art === 'figuren') fertig(st.liste[0], stDe ? stDe.liste[0] : '');
  else if (art === 'wo') { const o = (k.orte || []); if (o.length) { w.name = o[0].name; w.n = gespraechZahl(o[0].n); w.werk = o[0].werke && o[0].werke[0] ? o[0].werke[0].name : basis.werk; fertig(st.ort[0], stDe ? stDe.ort[0] : ''); belege = (o[0].beispiele || []).slice(0, 3).map((b) => ({ satz: gespraechKurz(b.satz, 220), werk: b.werk, id: b.id })); art = 'ort'; } else fertig(pick(st.unbekannt), stDe ? pickDe(stDe.unbekannt) : ''); }
  else if (art === 'erster') { const wk = antwort.werk || k.werke[0]; w.satz = gespraechKurz(wk && wk.erster || '', 160); fertig(st.satz[0], stDe ? stDe.satz[0] : ''); art = 'satz'; }
  else if (art === 'stelle' || art === 'saetze') { const s = (k.saetze || [])[Math.floor(z() * Math.min(12, (k.saetze || []).length))]; if (s) { w.satz = gespraechKurz(s.text, 160); belege = [{ satz: gespraechKurz(s.text, 220), werk: s.werk, id: s.id }]; fertig(pick(st.satz), stDe ? pickDe(stDe.satz) : ''); art = 'satz'; } else fertig(pick(st.unbekannt), stDe ? pickDe(stDe.unbekannt) : ''); }
  else if (art === 'begriffe') { const b = (k.begriffe || [])[0]; if (b) { w.name = b.name; w.n = gespraechZahl(b.n); w.werk = b.werke && b.werke[0] ? b.werke[0].name : basis.werk; fertig(st.begriff[0], stDe ? stDe.begriff[0] : ''); belege = (b.beispiele || []).slice(0, 3).map((x) => ({ satz: gespraechKurz(x.satz, 220), werk: x.werk, id: x.id })); art = 'begriff'; } else fertig(pick(st.unbekannt), stDe ? pickDe(stDe.unbekannt) : ''); }
  else if (art === 'gruss') fertig(pick(st.gruss), stDe ? pickDe(stDe.gruss) : '');
  else fertig(pick(st.unbekannt), stDe ? pickDe(stDe.unbekannt) : '');
  return { art, text, de, belege: belege.slice(0, 4), einlesung };
}
