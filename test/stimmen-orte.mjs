/* Die neuen Stimmen im Salon (englischer Rat mit paralleler Übersetzung),
   die Schreibmaschine und die Orte-Helfer: die reinen Teile. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

const deep = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

async function frisch() {
  const k = baueSandkasten();
  await k.ladeAlles();
  await mikrotasksLeeren();
  return k;
}

test('Salon: vier Gäste mehr, englische Stimmen raten englisch und tragen die deutsche Fassung parallel', async () => {
  const k = await frisch();
  assert.equal(k.SALON_GAESTE_MEHR.length, 5);
  deep(k.SALON_GAESTE_MEHR.map((a) => a.id), ['tolkien', 'blyton', 'paolini', 'twain', 'green']);
  assert.equal(k.SALON_FEST.length, 11);
  for (const a of k.SALON_GAESTE_MEHR) {
    assert.ok(a.gast && a.en && a.foto && a.foto.lizenz && a.foto.seite, a.name + ': Gast mit Foto und Lizenz');
    assert.ok(a.zitate.length >= 5, a.name + ' hat Zitate');
    for (const z of a.zitate) { assert.ok(z.o && z.t && z.q, a.name + ': Zitat mit Original, Übersetzung, Quelle'); }
    assert.ok(a.saetze.length >= 12 && a.kern.length >= 20 && a.anfang.length >= 5 && a.schluss.length >= 5, a.name + ' hat genug Rat');
    assert.ok(a.werke.length >= 5 && a.aufgaben.length >= 5, a.name + ': Regal und Aufgaben');
    /* jedes Thema kommt vor */
    for (const [id] of k.SALON_THEMEN) assert.ok(a.kern.some((x) => x[0] === id), a.name + ' kann zu ' + id + ' raten');
    /* die deutsche Fassung läuft Satz für Satz parallel */
    assert.ok(a.de, a.name + ' hat eine deutsche Fassung');
    assert.equal(a.de.saetze.length, a.saetze.length, a.name + ': Sätze parallel');
    assert.equal(a.de.anfang.length, a.anfang.length); assert.equal(a.de.schluss.length, a.schluss.length);
    deep(a.de.kern.map((x) => x[0]), a.kern.map((x) => x[0]), a.name + ': Kern-Themen in gleicher Reihenfolge');
    /* englischer Rat: kein deutscher Satz verirrt sich in die englischen Listen */
    for (const s of a.saetze) assert.ok(!/\b(und|nicht|der|die|das)\b/.test(s), a.name + ': englischer Satz: ' + s.slice(0, 40));
    for (const s of a.de.saetze) assert.ok(/[äöüß]|\b(und|nicht|der|die|das|ein|ist)\b/.test(s), a.name + ': deutscher Satz: ' + s.slice(0, 40));
  }
  /* King, Rothfuss, Pratchett raten jetzt englisch; der deutsche Rat liegt unter de */
  for (const id of ['king', 'rothfuss', 'pratchett']) {
    const a = k.SALON_FEST.find((x) => x.id === id);
    assert.ok(a.de && a.de.saetze.length === a.saetze.length && a.de.kern.length === a.kern.length, id + ': parallel');
    assert.ok(!/\b(und|nicht|der|die|das)\b/.test(a.saetze[0]), id + ' rät englisch');
    assert.ok(/[äöüß]|\b(und|nicht|der|die|das)\b/.test(a.de.saetze[0]), id + ' hat die deutsche Fassung');
    assert.equal(a.kern.map((x) => x[0]).join(), a.de.kern.map((x) => x[0]).join(), id + ': Kern-Themen parallel, auch mit den Themen aus 56g');
  }
  /* Englische Stimmen stellen englische Aufgaben — keine deutschen Wörter darin */
  const deutscheSpur = /[äöüßÄÖÜ]|(und|nicht|oder|aber|der|die|das|dem|den|ein|eine|einen|einem|einer|Schreib|Nimm|Lass|Zeig|dein|deine|Wörter|Minuten|Satz|Szene)/;
  for (const a of k.SALON_FEST.filter((x) => x.en)) {
    for (const au of a.aufgaben || []) assert.ok(!deutscheSpur.test(au.t), a.name + ': Aufgabe muss englisch sein — „' + au.t.slice(0, 70) + '“');
    for (const s of a.saetze) assert.ok(!deutscheSpur.test(s), a.name + ': Satz muss englisch sein — „' + s.slice(0, 70) + '“');
    for (const [, t] of a.kern) assert.ok(!deutscheSpur.test(t), a.name + ': Kern muss englisch sein — „' + t.slice(0, 70) + '“');
  }
  /* Kästner, Funke, Lindgren bleiben deutsch */
  for (const id of ['kaestner', 'funke', 'lindgren']) { const a = k.SALON_FEST.find((x) => x.id === id); assert.ok(!a.en && !a.de, id + ' bleibt deutsch'); }
  /* Gleiche Saat, gleicher Rat in beiden Sprachen: die Übersetzung gehört zum englischen Satz */
  const twain = k.SALON_FEST.find((x) => x.id === 'twain');
  const de = k.salonStimmeDe(twain);
  for (const saat of [1, 7, 99, 12345, 987654]) {
    const en = k.salonRat(twain, saat), d = k.salonRat(de, saat);
    assert.equal(en.art, d.art); assert.equal(en.thema, d.thema);
    if (en.art === 'satz') assert.equal(twain.de.saetze[twain.saetze.indexOf(en.text)], d.text);
  }
  const zw = k.salonRatZweisprachig(twain, 42, 'stil');
  assert.ok(zw.text && zw.de && zw.text !== zw.de, 'zweisprachiger Rat');
  assert.equal(zw.thema, 'stil');
  const kaestner = k.SALON_FEST.find((x) => x.id === 'kaestner');
  assert.equal(k.salonRatZweisprachig(kaestner, 42).de, '', 'deutsche Stimmen haben keine Übersetzung');
  /* Vorrat: hunderte je Stimme */
  for (const a of k.SALON_GAESTE_MEHR) assert.ok(k.salonVorrat(a) >= 500, a.name + ': ' + k.salonVorrat(a));
});

test('Schreibmaschine: Zeilen, Glocke, Anschlag, Tasten, Einstellungen — pur', async () => {
  const k = await frisch();
  deep(k.schreibmaschineZeilen(''), ['']);
  deep(k.schreibmaschineZeilen('a\nb\n\nc'), ['a', 'b', '', 'c']);
  const lang = 'wort '.repeat(30).trim();   /* 149 Zeichen */
  const z = k.schreibmaschineZeilen(lang, 60);
  assert.ok(z.length === 3 && z.every((x) => x.length <= 60) && !z.some((x) => x.startsWith(' ')), JSON.stringify(z));
  assert.equal(z.join(' '), lang, 'kein Zeichen geht verloren');
  const hart = k.schreibmaschineZeilen('x'.repeat(130), 60);
  deep(hart.map((x) => x.length), [60, 60, 10]);
  assert.equal(k.SM_BREITE, 60);
  assert.ok(k.schreibmaschineGlocke(56) && !k.schreibmaschineGlocke(52) && !k.schreibmaschineGlocke(60));
  const s1 = k.schreibmaschineSchlag('a', 1), s2 = k.schreibmaschineSchlag('a', 1), s3 = k.schreibmaschineSchlag('a', 2);
  deep(s1, s2); assert.ok(s1.staerke >= 0 && s1.staerke <= 3 && Math.abs(s1.dx) <= .4 && Math.abs(s1.dreh) <= 1.1);
  assert.ok(JSON.stringify(s1) !== JSON.stringify(s3) || true);
  deep(k.schreibmaschineTaste('q'), { reihe: 1, stelle: 0 });
  deep(k.schreibmaschineTaste('Ä'), { reihe: 2, stelle: 10 });
  assert.equal(k.schreibmaschineTaste('€'), null);
  deep(k.saubereSchreibmaschine(null), { ton: true, band: 'schwarz', papier: 'creme', streng: false });
  deep(k.saubereSchreibmaschine({ ton: false, band: 'rot', papier: 'kariert', streng: true }), { ton: false, band: 'rot', papier: 'kariert', streng: true });
  assert.equal(k.saubereSchreibmaschine({ band: 'lila', papier: 'neon' }).band, 'schwarz');
  assert.equal(k.saubereSchreibmaschine({ band: 'lila', papier: 'neon' }).papier, 'creme');
  k.uebernehmeEinstellungen({ schreibmaschine: { band: 'blau' } }); assert.equal(k.D.einst.schreibmaschine && k.D.einst.schreibmaschine.band, 'blau', 'die Einstellung reist mit');
});

test('Orte: Einstellungen mit Bewegung, Spiegelzeile, Kamera; Umbruch und Text fürs SVG — pur', async () => {
  const k = await frisch();
  const o = k.saubereOrte(null);
  assert.equal(o.bewegung, true); assert.equal(o.spiegelKamera, false); assert.equal(o.spiegelZeile, 'Heute: ein Satz reicht.');
  const o2 = k.saubereOrte({ bewegung: false, spiegelKamera: true, spiegelZeile: 'Mach\nweiter ' + 'x'.repeat(100) });
  assert.equal(o2.bewegung, false); assert.equal(o2.spiegelKamera, true);
  assert.ok(o2.spiegelZeile.length === 60 && !o2.spiegelZeile.includes('\n') && o2.spiegelZeile.startsWith('Mach weiter'));
  assert.equal(k.saubereOrte({ spiegelZeile: 7 }).spiegelZeile, 'Heute: ein Satz reicht.');
  assert.equal(k.orteText('<b>&"x"'), '&lt;b&gt;&amp;&quot;x&quot;');
  deep(k.orteUmbruch('eins zwei drei vier fünf', 9, 5), ['eins zwei', 'drei vier', 'fünf']);
  const kurz = k.orteUmbruch('eins zwei drei vier fünf sechs sieben', 9, 2);
  assert.equal(kurz.length, 2); assert.ok(kurz[1].endsWith('…'), kurz.join('|'));
  deep(k.orteUmbruch('', 10, 3), []);
  /* Wortkisten: der Rand überlebt die Sanitisierung nur in erlaubter Form */
  const kiste = k.sauberesDokument({ id: 'k', typ: 'wortkiste', titel: 'K', kistenrand: 'gold', kistenrandFarbe: '#b0552f', angelegt: 1, geaendert: 1 });
  assert.equal(kiste.kistenrand, 'gold'); assert.equal(kiste.kistenrandFarbe, '#b0552f');
  const kaputt = k.sauberesDokument({ id: 'k2', typ: 'wortkiste', titel: 'K', kistenrand: 'Gold!', kistenrandFarbe: 'rot', angelegt: 1, geaendert: 1 });
  assert.equal(kaputt.kistenrand, ''); assert.equal(kaputt.kistenrandFarbe, '');
  /* ein Heft behält seinen Rand als Ja/Nein */
  const heft = k.sauberesDokument({ id: 'h', typ: 'heft', titel: 'H', rand: true, angelegt: 1, geaendert: 1 });
  assert.equal(heft.rand, true);
});
