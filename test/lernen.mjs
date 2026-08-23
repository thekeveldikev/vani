/* Dazulernen (56h) und die versiegelte Einlesung (56d): die puren Teile. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';
const deep = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }

test('Lesung: Stand, Vergleich und Fälligkeit — pur', async () => {
  const k = await frisch();
  const kenntnis = {
    leer: false, woerter: 5000, texte: 4, signatur: '4:99',
    werke: [{ name: 'Roman', woerter: 4000 }, { name: 'Blätter', woerter: 1000 }],
    figuren: [{ name: 'Val', n: 12 }, { name: 'Nicky', n: 4 }],
    orte: [{ name: 'Westchester' }], begriffe: [{ name: 'Tinte' }]
  };
  const stand = k.lesungStand(kenntnis, 1000);
  assert.equal(stand.woerter, 5000); assert.equal(stand.texte, 4);
  deep(stand.werke, [{ name: 'Roman', woerter: 4000 }, { name: 'Blätter', woerter: 1000 }]);
  deep(stand.orte, ['Westchester']); deep(stand.begriffe, ['Tinte']);
  /* Nichts passiert */
  const gleich = k.lesungVergleich(stand, stand);
  assert.equal(gleich.woerterPlus, 0); assert.equal(gleich.neueFiguren.length, 0); assert.equal(gleich.etwasNeu, false);
  assert.equal(k.lesungFaellig(gleich), false);
  /* Es wächst */
  const spaeter = k.lesungStand({
    leer: false, woerter: 9000, texte: 6, signatur: '6:1',
    werke: [{ name: 'Roman', woerter: 7000 }, { name: 'Blätter', woerter: 1000 }, { name: 'Neues Heft', woerter: 1000 }],
    figuren: [{ name: 'Val', n: 30 }, { name: 'Nicky', n: 4 }, { name: 'Theo', n: 9 }],
    orte: [{ name: 'Westchester' }, { name: 'Sizilien' }], begriffe: [{ name: 'Tinte' }, { name: 'Notwendigkeit' }]
  }, 1000 + 3 * 86400000);
  const v = k.lesungVergleich(stand, spaeter);
  assert.equal(v.woerterPlus, 4000); assert.equal(v.textePlus, 2); assert.equal(v.tage, 3);
  deep(v.neueWerke, ['Neues Heft']); deep(v.neueFiguren, ['Theo']);
  deep(v.neueOrte, ['Sizilien']); deep(v.neueBegriffe, ['Notwendigkeit']);
  deep(v.gewachsen, [{ name: 'Roman', plus: 3000 }]);
  deep(v.oefter, [{ name: 'Val', plus: 18 }]);
  assert.ok(v.etwasNeu && k.lesungFaellig(v));
  /* Ohne Vorgeschichte ist alles neu */
  const ersteMal = k.lesungVergleich(null, spaeter);
  assert.equal(ersteMal.neueFiguren.length, 3); assert.equal(ersteMal.woerterPlus, 9000);
  /* Leerer Stand */
  const leer = k.lesungStand({ leer: true }, 5);
  assert.equal(leer.woerter, 0); assert.equal(leer.werke.length, 0);
});

test('Lesung: jede Stimme sagt etwas dazu, englische auf Englisch', async () => {
  const k = await frisch();
  const v = { woerterPlus: 4200, textePlus: 2, tage: 5, neueWerke: ['Neues Heft'], neueFiguren: ['Theo', 'Kay'], neueOrte: ['Sizilien'], neueBegriffe: [], gewachsen: [{ name: 'Roman', plus: 3000 }], oefter: [{ name: 'Val', plus: 18 }], etwasNeu: true };
  for (const a of k.SALON_FEST) {
    const t = k.lesungNotiz(a, v, !!a.en);
    assert.ok(t.length > 60, a.name + ': Notiz zu kurz');
    assert.ok(t.includes('Theo') && t.includes('Neues Heft'), a.name + ': nennt das Neue');
    assert.ok(t.includes('4.200'), a.name + ': nennt die Zahl');
    if (a.en) assert.ok(/words more|New:|New names/.test(t), a.name + ' schreibt englisch: ' + t.slice(0, 60));
    else assert.ok(/Wörter mehr|Neu dabei|Neue Namen/.test(t), a.name + ' schreibt deutsch: ' + t.slice(0, 60));
  }
  /* Nichts Neues: trotzdem ein Satz */
  const leer = { woerterPlus: 0, textePlus: 0, tage: 1, neueWerke: [], neueFiguren: [], neueOrte: [], neueBegriffe: [], gewachsen: [], oefter: [], etwasNeu: false };
  const t = k.lesungNotiz(k.SALON_FEST[0], leer, true);
  assert.ok(/Nothing new|Nichts Neues/.test(t), t);
  for (const id of Object.keys(k.LESUNG_SAETZE)) assert.ok(k.SALON_FEST.some((a) => a.id === id), id + ' gehört zur Wand');
});

test('Einlesung: versiegelt und leer, bis sie entsiegelt wird — nichts davon steht im Quelltext', async () => {
  const k = await frisch();
  /* Ohne Entsiegeln weiß die Wand nichts aus der Einlesung */
  assert.equal(k.einlesungDa(), false);
  assert.equal(k.salonEinlesung(), null);
  assert.equal(k.einlesungFigur('Theo'), null);
  assert.equal(k.einlesungNotiz('king', 'Theo'), null);
  assert.equal(k.einlesungFrage('Wer ist Theo?'), null);
  deep(k.einlesungStimmenZu('Theo'), []);
  /* Und das Gespräch bricht deswegen nicht ab: es antwortet aus dem, was da ist */
  const docs = new Map();
  docs.set('b1', { id: 'b1', typ: 'blatt', titel: 'Probe', text: 'Mira ging zum Fenster. Mira lachte. „Komm", sagte Mira. Jonas nickte. Jonas schwieg. Mira schrieb.', angelegt: 1, geaendert: 2 });
  const kk = k.kenntnisSammeln(docs, {});
  const a = k.SALON_FEST.find((x) => x.id === 'king');
  const ant = k.gespraechAntwort(a, k.kenntnisFrage(kk, 'Wer ist Mira?'), kk, { anrede: 'Probe', saat: 3 });
  assert.ok(ant && ant.text.includes('Mira'));
  assert.equal(ant.einlesung, null, 'ohne Umschlag keine Einlesungskarte');
});

test('Anfügen: null und false landen nie als Wort in der Seite', async () => {
  const k = await frisch();
  /* Ein winziges Element, das sich merkt, was angehängt wurde */
  const gesammelt = [];
  const kasten = { append: (x) => gesammelt.push(x) };
  k.anfuegen(kasten, { nodeType: 1, name: 'b' }, null, false, undefined, { nodeType: 3, name: 'text' }, [null, { nodeType: 1, name: 'i' }]);
  assert.equal(gesammelt.length, 3, 'null, false und undefined werden übersprungen');
  assert.equal(gesammelt.filter((x) => x === null || x === false).length, 0);
  assert.equal(gesammelt[0].name, 'b'); assert.equal(gesammelt[1].name, 'text'); assert.equal(gesammelt[2].name, 'i');
});

test('Personenblatt: alles über eine Figur auf einer Seite — pur', async () => {
  const k = await frisch();
  const docs = new Map();
  docs.set('h', { id: 'h', typ: 'heft', titel: 'Roman' });
  docs.set('s1', { id: 's1', typ: 'seite', parent: 'h', titel: 'Eins', angelegt: 1, geaendert: 2,
    text: 'Mira ging zum Fenster. „Komm", sagte Mira. Jonas nickte. Mira lachte, als Jonas den Kopf schüttelte. Später schwieg Mira. Jonas sagte nichts.' });
  docs.set('b1', { id: 'b1', typ: 'blatt', titel: 'Notiz', angelegt: 3, geaendert: 4,
    text: 'Eine Notiz über Mira. Mira schreibt jeden Abend, und Mira wartet.' });
  const kk = k.kenntnisSammeln(docs, {});
  const d = k.personenblattDaten('Mira', kk);
  assert.ok(d, 'Mira wird gefunden');
  assert.equal(d.art, 'figur');
  assert.ok(d.n >= 6, 'zählt alle Nennungen: ' + d.n);
  assert.equal(d.werke.length, 2, 'in beiden Werken');
  assert.equal(d.werke.reduce((s, w) => s + w.anteil, 0) >= 99, true, 'Anteile ergeben rund hundert');
  assert.ok(d.begleiter.some((b) => b.name === 'Jonas'), 'Jonas steht daneben');
  assert.ok(d.verben.length >= 1 && d.stellen.length >= 2, 'Verben und Stellen');
  assert.ok(d.stellen.every((s) => s.satz && s.werk && s.id), 'jede Stelle ist antippbar');
  assert.ok(d.stellen.length <= 40, 'höchstens vierzig Stellen');
  /* Der Satz darüber nennt Zahl, Werk und Verb */
  const satz = k.personenblattSatz(d);
  assert.ok(satz.includes('Mira') && /\d/.test(satz) && satz.includes('Roman'), satz);
  /* Unbekannte und leere Fälle */
  assert.equal(k.personenblattDaten('Niemand', kk), null);
  assert.equal(k.personenblattDaten('Mira', { leer: true }), null);
  assert.equal(k.personenblattDaten('', kk), null);
  assert.equal(k.personenblattSatz(null), '');
});
