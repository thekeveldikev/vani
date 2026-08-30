/* Die Suche soll nicht nur finden, sondern hinbringen (48c) — und im
   Projekt überhaupt erst stattfinden (44b).

   Der Kern von 48c ist eine Falle, die man leicht übersieht: gesucht wird auf
   der normalisierten Fassung, gefunden werden muss die Stelle im echten Text.
   Weil „ß“ dabei zu zwei Zeichen wird und Umlaute zu einem, verrutschen die
   Zählungen gegeneinander. Genau das wird hier festgenagelt. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
function doc(k, id, felder) {
  const d = k.sauberesDokument({ id, typ: 'szene', angelegt: 1, geaendert: 1, ...felder });
  k.D.docs.set(d.id, d);
  return d;
}

test('Die Fundstelle stimmt auch hinter Umlauten und ß', async () => {
  const k = await frisch();
  const treffer = (text, wort) => { const s = k.suchStelle(text, wort); return s ? text.slice(s.von, s.bis) : null; };

  assert.equal(treffer('Sie ging durch den Wald.', 'wald'), 'Wald', 'Groß und klein ist egal');
  assert.equal(treffer('Über den Fluss und in die Wälder', 'walder'), 'Wälder', 'der Umlaut wird gefunden');
  assert.equal(treffer('Über den Fluss und in die Wälder', 'uber'), 'Über', 'auch ganz am Anfang');

  /* Die eigentliche Falle: vor dem gesuchten Wort steht ein ß. Normalisiert
     wird daraus „ss“ — der Fund läge um ein Zeichen daneben, wenn nicht
     zurückgerechnet würde. */
  assert.equal(treffer('Die Straße war leer, der Mond stand hoch.', 'mond'), 'Mond');
  assert.equal(treffer('Straße Straße Straße Kerze', 'kerze'), 'Kerze', 'drei ß davor, drei Zeichen Versatz');
  assert.equal(treffer('Grüße aus dem Süden, Bäcker', 'backer'), 'Bäcker', 'Umlaute und ß gemischt');
  /* Und das ß selbst ist auch findbar */
  assert.equal(treffer('Die Straße war leer.', 'strasse'), 'Straße');

  assert.equal(k.suchStelle('Nichts davon hier', 'einhorn'), null);
  assert.equal(k.suchStelle('', 'wort'), null);
  assert.equal(k.suchStelle('Text', ''), null);
  assert.equal(k.suchStelle('Text', '  '), null, 'nur Leerzeichen ist keine Suche');
});

test('Die Karte bildet jedes Zeichen ab — keins fällt weg, keins kommt dazu', async () => {
  const k = await frisch();
  for (const text of ['Straße', 'Wälder über Flüsse', 'ganz normal', 'ÄÖÜäöüß', '']) {
    const { norm, karte } = k.suchKarte(text);
    assert.equal(norm.length, karte.length, 'für „' + text + '“: zu jedem Zeichen ein Ort');
    for (const i of karte) assert.ok(i >= 0 && i < Math.max(1, text.length), 'der Ort liegt im Text');
    /* Die Karte läuft nur vorwärts — sonst spränge die Fundstelle. */
    for (let i = 1; i < karte.length; i++) assert.ok(karte[i] >= karte[i - 1], 'monoton');
  }
  assert.equal(k.suchKarte('Straße').norm, 'strasse');
});

test('Ab einer Stelle weitersuchen findet das zweite Vorkommen', async () => {
  const k = await frisch();
  const t = 'Der Wald schweigt. Der Wald atmet.';
  const erste = k.suchStelle(t, 'wald');
  assert.equal(erste.von, 4);
  const zweite = k.suchStelle(t, 'wald', erste.bis);
  assert.equal(t.slice(zweite.von, zweite.bis), 'Wald');
  assert.ok(zweite.von > erste.von, 'wirklich das nächste');
  assert.equal(k.suchStelle(t, 'wald', zweite.bis), null, 'danach kommt nichts mehr');
});

test('Der Zettel gilt für ein Dokument, einmal, und nicht ewig', async () => {
  const k = await frisch();
  k.suchZielMerken('szene-1', 'Krähe', 1000);
  assert.equal(k.suchZielHolen('szene-2', 1000), null, 'ein anderer Text bekommt ihn nicht');
  assert.equal(k.suchZielHolen('szene-1', 1000), 'Krähe');
  assert.equal(k.suchZielHolen('szene-1', 1000), null, 'holen heißt verbrauchen — beim zweiten Öffnen springt nichts');

  /* Ein alter Zettel gehört zu einem anderen Weg. Sonst spränge ein Text,
     den man eine Viertelstunde später ganz normal öffnet, plötzlich irgendwohin. */
  k.suchZielMerken('szene-1', 'Krähe', 1000);
  assert.equal(k.suchZielHolen('szene-1', 1000 + 21000), null, 'nach zwanzig Sekunden verfallen');

  /* Zu kurz ist keine Suche */
  assert.equal(k.suchZielMerken('szene-1', 'a'), null);
  assert.equal(k.suchZielHolen('szene-1', 1000), null);

  k.suchZielMerken('szene-1', 'Krähe', 1000);
  k.suchZielVergessen();
  assert.equal(k.suchZielHolen('szene-1', 1000), null);
});

test('Die Projektsuche sieht Titel, Text und die eigene Notiz', async () => {
  const k = await frisch();
  const s = doc(k, 's1', { titel: 'Der Regen', text: 'Sie stand am Fenster.', notiz: 'Hier fehlt noch der Bruch.', projekt: 'p1' });
  assert.equal(k.projektSuchPasst(s, 'regen'), true, 'im Titel');
  assert.equal(k.projektSuchPasst(s, 'fenster'), true, 'im Text');
  assert.equal(k.projektSuchPasst(s, 'bruch'), true, 'in der Notiz — oft der einzige Ort, wo steht, worum es geht');
  assert.equal(k.projektSuchPasst(s, 'einhorn'), false);
  assert.equal(k.projektSuchPasst(s, ''), true, 'ohne Eingabe passt alles — es wird nichts weggeräumt');
  assert.equal(k.projektSuchPasst(null, 'regen'), false);

  assert.equal(k.projektSuchWo(s, 'regen'), 'titel');
  assert.equal(k.projektSuchWo(s, 'fenster'), 'text');
  assert.equal(k.projektSuchWo(s, 'bruch'), 'notiz');
  assert.equal(k.projektSuchWo(s, 'einhorn'), '');
});

test('Die Projektsuche zählt nur, was wirklich noch in diesem Projekt liegt', async () => {
  const k = await frisch();
  const p = { id: 'p1' };
  doc(k, 'a', { titel: 'Nebel eins', projekt: 'p1' });
  doc(k, 'b', { titel: 'Nebel zwei', projekt: 'p1' });
  doc(k, 'c', { titel: 'Nebel fremd', projekt: 'p2' });
  doc(k, 'd', { typ: 'blatt', titel: 'Nebel als Blatt', projekt: 'p1' });
  const alle = () => [...k.D.docs.values()];
  assert.equal(k.projektSuchZahl(p, 'nebel', alle()), 2, 'nur Szenen, nur dieses Projekt');
  k.D.docs.get('a').geloescht = true;
  assert.equal(k.projektSuchZahl(p, 'nebel', alle()), 1, 'Gelöschtes zählt nicht mit');
  assert.equal(k.projektSuchZahl(p, '', alle()), 0, 'ohne Eingabe wird nicht gezählt');
});

test('Das Umfeld zeigt die Stelle, nicht immer den Anfang', async () => {
  const k = await frisch();
  const lang = 'Am Anfang steht ein Satz, der lang genug ist, damit man ihn nicht ganz sieht, und ganz weit hinten steht das Losungswort.';
  const d = k.sauberesDokument({ id: 'x', typ: 'szene', text: lang, angelegt: 1, geaendert: 1 });
  const umfeld = k.projektSuchUmfeld(d, 'losungswort');
  assert.ok(umfeld.includes('Losungswort'), 'das gesuchte Wort ist zu sehen');
  assert.ok(umfeld.startsWith('… '), 'und man sieht, dass davor noch etwas stand');
  /* Steht es vorn, wird nichts abgeschnitten */
  const vorn = k.projektSuchUmfeld(k.sauberesDokument({ id: 'y', typ: 'szene', text: 'Losungswort gleich am Anfang.', angelegt: 1, geaendert: 1 }), 'losungswort');
  assert.ok(vorn.startsWith('Losungswort'));
});

test('Zählen und Weitersuchen stimmen überein', async () => {
  const k = await frisch();
  const t = 'Der Wald. Im Wald. Am Waldrand. Und Straße vor dem Wald.';
  assert.equal(k.suchAnzahl(t, 'wald'), 4, 'auch „Waldrand“ zählt — es steht ja drin');
  assert.equal(k.suchAnzahl(t, 'strasse'), 1, 'ß wird gefunden, ohne die Zählung zu verschieben');
  assert.equal(k.suchAnzahl(t, 'einhorn'), 0);
  assert.equal(k.suchAnzahl(t, ''), 0);
  assert.equal(k.suchAnzahl('', 'wald'), 0);

  /* Und genau so viele Stellen findet das Weitersuchen auch — das ist der
     Punkt: der Zähler darf nicht mehr versprechen als die Sprünge halten. */
  let n = 0, ab = 0, s;
  while ((s = k.suchStelle(t, 'wald', ab))) { n++; ab = s.bis; }
  assert.equal(n, k.suchAnzahl(t, 'wald'));
});
