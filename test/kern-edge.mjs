/* Gezielte Randfall- und Regressionsprüfungen für die ausgebauten VANI-Kerne. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() {
  const k = baueSandkasten();
  await k.ladeAlles();
  await mikrotasksLeeren();
  return k;
}
const roh = (x) => JSON.parse(JSON.stringify(x));

test('seitenUmbruch: respektiert Grenze, verliert keinen Inhalt und terminiert bei Nullraum', async () => {
  const k = await frisch();
  assert.equal(k.seitenUmbruch('1234567890', (s) => s.length <= 10), null);
  const geteilt = roh(k.seitenUmbruch('eins zwei drei vier fünf', (s) => s.length <= 12));
  assert.ok(geteilt.hier.length <= 12);
  assert.equal((geteilt.hier + ' ' + geteilt.weiter).replace(/\s+/g, ' '), 'eins zwei drei vier fünf');
  assert.deepEqual(roh(k.seitenUmbruch('untrennbar', () => false)), { hier: '', weiter: 'untrennbar' });
  assert.equal(k.seitenUmbruch('', () => false), null);
  assert.equal(k.seitenUmbruch('Text', null), null);
});

test('freie Schnipsel: Positionen bleiben deterministisch und die Fläche bleibt endlich', async () => {
  const k = await frisch();
  assert.deepEqual(roh(k.freieSchnipselPosition(99999, 'gleich')), roh(k.freieSchnipselPosition(99999, 'gleich')));
  const positionen = Array.from({ length: 1200 }, (_, i) => k.freieSchnipselPosition(i, 's' + i));
  assert.ok(positionen.every((p) => Object.values(p).every(Number.isFinite)));
  const g = roh(k.freieFlaechenGrenzen([...positionen, null, { x: Infinity, y: NaN, w: -8, h: 1e20 }]));
  assert.ok(g.breite >= 900 && g.hoehe >= 680 && Object.values(g).every(Number.isFinite));
});

test('sauberesDokument: kaputte Sicherungswerte werden begrenzt und CSS-Injektion verschwindet', async () => {
  const k = await frisch();
  const lang = 'x'.repeat(2200);
  const d = roh(k.sauberesDokument({
    id: 'ok', typ: 'zettel', titel: lang, text: 42,
    farbe: 'red);background:url(https://example.invalid/x)',
    pos: { x: Infinity, y: '-999999999', rot: 'oops', w: 99999 },
    freiPos: { x: '30', y: null, rot: 999, w: -10 },
    sicht: { x: Infinity, y: -Infinity, z: 0 },
    staende: Array.from({ length: 30 }, (_, i) => ({ wann: -1, titel: lang, text: 'Stand ' + i })),
    pegel: { regenfenster: 2, boese: 'NaN', 'x);url(': 1 }, ord: Infinity
  }));
  assert.equal(d.titel.length, 1000);
  assert.equal(d.text, '42');
  assert.equal(d.farbe, '');
  assert.deepEqual(d.pos, { x: 0, y: -100000, rot: 0, w: 2000 });
  assert.deepEqual(d.freiPos, { x: 30, y: 0, rot: 20, w: 180 });
  assert.deepEqual(d.sicht, { x: 60, y: 60, z: 0.1 });
  assert.equal(d.staende.length, 20);
  assert.deepEqual(d.pegel, { regenfenster: 1 });
  assert.equal(d.ord, 0);
  assert.equal(k.sauberesDokument({ id: '', typ: 'blatt' }), null);
});

test('Einstellungen aus Sicherungen: nur bekannte, begrenzte Werte überleben', async () => {
  const k = await frisch();
  k.uebernehmeEinstellungen({
    thema: '<script>', schrift: 'comic', breite: 'unendlich', groesse: Infinity,
    lautstaerke: -5, tagesziel: 1e99, schnipselAnsicht: 'chaos',
    mischung: { regenfenster: 8, wind: -1, 'ungültig!': .5 },
    raeume: [{ id: 'hefte', an: false }, { id: 'hefte', an: true }, null, { id: 'x'.repeat(80), an: true }]
  });
  assert.equal(k.D.einst.thema, 'papier');
  assert.equal(k.D.einst.schrift, 'serife');
  assert.equal(k.D.einst.breite, 'mittel');
  assert.equal(k.D.einst.groesse, 19);
  assert.equal(k.D.einst.lautstaerke, 0);
  assert.equal(k.D.einst.tagesziel, 10000000);
  assert.equal(k.D.einst.schnipselAnsicht, 'lauf');
  assert.deepEqual(roh(k.D.einst.mischung), { regenfenster: 1 });
  assert.deepEqual(roh(k.D.einst.raeume), [{ id: 'hefte', an: false }]);
  k.uebernehmeEinstellungen({ thema: 'kerze' });
  assert.equal(k.D.einst.thema, 'kerze', 'jede in der Oberfläche angebotene Stimmung bleibt erhalten');
  k.uebernehmeEinstellungen({ blattSortierung: 'az', klang: 'regen' });
  assert.equal(k.D.einst.blattSortierung, 'az');
  assert.equal(k.D.einst.klang, 'regen', 'alte Klangwahl bleibt bis zur Boot-Migration erhalten');
  k.uebernehmeEinstellungen({ stiftFarbe: 'url(javascript:boom)', stiftDicke: 999, sperreNachMinuten: -8, autoSeitenwechsel: false });
  assert.equal(k.D.einst.stiftFarbe, '#2c251c');
  assert.equal(k.D.einst.stiftDicke, 24);
  assert.equal(k.D.einst.sperreNachMinuten, 0);
  assert.equal(k.D.einst.autoSeitenwechsel, false);
});

test('Profile: Registry ist begrenzt, Passwörter werden nur abgeleitet gespeichert und falsche bleiben draußen', async () => {
  const k = baueSandkasten();
  assert.equal(k.profilSaubererName('\u0000  Kevin\n   Beispiel  '), 'Kevin Beispiel');
  const gueltig = { id: 'profil_123', name: 'Kevin', salz: 'A'.repeat(24), pruefung: 'B'.repeat(43), datenbank: 'vani', angelegt: Date.now() };
  const liste = roh(k.profilSaubereRegistry([gueltig, { ...gueltig }, { ...gueltig, id: '__proto__', salz: '!' }, null]));
  assert.equal(liste.length, 1, 'Dubletten und kaputte Verifier werden verworfen');
  assert.equal(k.profilGleich('gleich', 'gleich'), true);
  assert.equal(k.profilGleich('gleich', 'anders'), false);

  const p = await k.profilErstelle('Testprofil', 'eine-lange-test-tuer', true);
  const gespeichert = JSON.stringify(k.profilLadeRegistry());
  assert.ok(!gespeichert.includes('eine-lange-test-tuer'));
  assert.ok(await k.profilPruefePasswort(p, 'eine-lange-test-tuer'));
  assert.equal(await k.profilPruefePasswort(p, 'falsch'), null);
});

test('Rich Text: fremdes HTML wird entschärft, Klartext und Umbrüche bleiben erhalten', async () => {
  const k = await frisch();
  const boese = '<b onclick="stehlen()">Hallo</b><img src=x onerror=boom><script>alarm(1)</script><br>Welt';
  const sauber = k.sauberesRichHTML(boese);
  assert.ok(!/script|onclick|onerror|<img/i.test(sauber));
  assert.match(k.richReinerText(sauber), /Hallo/);
  assert.match(k.richReinerText(sauber), /Welt/);
  assert.equal(k.richAusText('<Anfang>\nEnde'), '&lt;Anfang&gt;<br>Ende');
  const d = k.sauberesDokument({ id: 'rich-1', typ: 'blatt', format: 'rich', rich: boese, text: 'Hallo\nWelt', muster: 'url()', papier: 'gift', befestigung: 'nagel' });
  assert.ok(!/script|onclick|onerror/i.test(d.rich));
  assert.equal(d.muster, 'schlicht'); assert.equal(d.papier, 'liniert'); assert.equal(d.befestigung, 'tesa');
});

test('Hefte: Umschlagdaten erlauben nur echte Farben und bekannte ruhige Muster', async () => {
  const k = await frisch();
  const gut = roh(k.heftDeckelDaten({ farbe: '#123456', farbe2: '#abcdef', band: '#fedcba', muster: 'welle' }));
  assert.equal(gut.muster, 'welle'); assert.match(gut.style, /--heft1:#123456/); assert.match(gut.style, /--heftband:#fedcba/);
  const schlecht = roh(k.heftDeckelDaten({ farbe: 'red);url(x)', farbe2: '#12', band: 'boom', muster: '__proto__' }));
  assert.equal(schlecht.muster, 'schlicht');
  assert.ok(!schlecht.style.includes('url') && !schlecht.style.includes('boom'));
});

test('Eigene Funken bleiben eine getrennte, durchsuchbare Sammlung', async () => {
  const k = await frisch();
  k.neuDoc('funkeln', { text: 'Allgemeiner Funke', quelle: 'funke', geaendert: 30 });
  const a = k.neuDoc('funkeln', { text: 'Mein Satz', vibe: 'Sommernacht', quelle: 'eigen', geaendert: 20 });
  const b = k.neuDoc('funkeln', { text: 'Mein Bild', quelle: 'eigen', geaendert: 40 });
  assert.deepEqual(roh(k.eigeneFunken().map((d) => d.id)), [b.id, a.id]);
});

test('Wortkisten: Mehrfachzugabe normalisiert, begrenzt und lässt Dubletten draußen', async () => {
  const k = await frisch();
  const kiste = k.neuDoc('wortkiste', { titel: 'Synonyme', farbe: '#70806f' });
  const paket = k.fuegeWoerterHinzu(kiste.id, ' leuchten, Leuchten ;\n glimmen\n' + 'x'.repeat(400));
  assert.deepEqual(roh(paket.hinzu.map((d) => d.text)), ['leuchten', 'glimmen', 'x'.repeat(160)]);
  assert.equal(paket.uebersprungen, 0, 'Dubletten innerhalb derselben Eingabe werden still zusammengelegt');
  assert.ok(paket.hinzu.every((d) => d.parent === kiste.id));
  assert.deepEqual(roh(k.wortlisteAusText(null)), []);
  assert.equal(k.wortlisteAusText(Array.from({ length: 700 }, (_, i) => 'w' + i).join(',')).length, 500, 'ein einzelner Import kann die Oberfläche nicht fluten');
  const nochEinmal = k.fuegeWoerterHinzu(kiste.id, 'GLIMMEN; funkeln');
  assert.equal(nochEinmal.hinzu.length, 1);
  assert.equal(nochEinmal.uebersprungen, 1);
});

test('Wortkisten: Suche, Favoriten und Sortierung bleiben innerhalb der gewählten Kiste', async () => {
  const k = await frisch();
  const a = k.neuDoc('wortkiste', { titel: 'A' });
  const b = k.neuDoc('wortkiste', { titel: 'B' });
  k.neuDoc('wort', { parent: a.id, text: 'Flimmern', notiz: 'Licht am Wasser', favorit: false, geaendert: 20 });
  k.neuDoc('wort', { parent: a.id, text: 'Glanz', notiz: 'hell', favorit: true, geaendert: 10 });
  k.neuDoc('wort', { parent: b.id, text: 'Wasser', notiz: 'Meer', favorit: true, geaendert: 30 });
  assert.deepEqual(roh(k.woerterInKiste(a.id).map((d) => d.text)), ['Glanz', 'Flimmern'], 'angeheftete Wörter bleiben oben');
  assert.deepEqual(roh(k.woerterInKiste(a.id, 'wasser').map((d) => d.text)), ['Flimmern'], 'Notizen sind durchsuchbar');
  assert.deepEqual(roh(k.woerterInKiste(a.id, '', 'zuletzt').map((d) => d.text)), ['Glanz', 'Flimmern'], 'Favoriten gelten vor der gewählten Zeitsortierung');
  assert.equal(k.woerterInKiste(b.id).length, 1);
});

test('Wortkisten: Verschieben, Kopieren und Löschen beschädigen keine fremden Wörter', async () => {
  const k = await frisch();
  const a = k.neuDoc('wortkiste', { titel: 'A' });
  const b = k.neuDoc('wortkiste', { titel: 'B' });
  const wort = k.neuDoc('wort', { parent: a.id, text: 'Schimmer', notiz: 'fein', favorit: true });
  const fremd = k.neuDoc('wort', { parent: b.id, text: 'Anders' });
  const kopie = k.wortInKiste(wort, b.id, true);
  assert.notEqual(kopie.id, wort.id);
  assert.equal(kopie.parent, b.id); assert.equal(kopie.notiz, 'fein'); assert.equal(kopie.favorit, true);
  assert.equal(k.wortInKiste(wort, 'fehlt', false), null);
  assert.equal(k.wortInKiste(wort, b.id, false).id, kopie.id, 'ein vorhandenes gleiches Wort wird nicht verdoppelt');
  assert.equal(wort.parent, a.id, 'bei einem Zieldublett bleibt das Original an seinem Ort');
  await k.loescheWortkiste(a.id, false, true);
  assert.equal(wort.parent, undefined); assert.ok(k.D.docs.has(wort.id));
  const aBuendel = (await k.dbAlle('papierkorb')).find((d) => d.name === 'A');
  await k.holeZurueck(aBuendel.id);
  assert.equal(wort.parent, a.id, 'Rückgängig stellt auch die Einsortierung wieder her');
  await k.loescheWortkiste(a.id, false, true);
  await k.loescheWortkiste(b.id, true, true);
  assert.ok(!k.D.docs.has(b.id)); assert.ok(!k.D.docs.has(kopie.id)); assert.ok(!k.D.docs.has(fremd.id));
  assert.ok(k.D.docs.has(wort.id));
});

test('Wortkisten: Zufallsgriff terminiert bei kaputter Quelle und liefert nie Dubletten', async () => {
  const k = await frisch();
  const liste = ['a', 'b', 'c', 'd'];
  assert.deepEqual(roh(k.wortZufallsgriff(liste, 3, () => Infinity)), ['a', 'b', 'c']);
  const griff = roh(k.wortZufallsgriff(liste, 99, () => .999999));
  assert.equal(griff.length, 4);
  assert.equal(new Set(griff).size, 4);
  assert.deepEqual(liste, ['a', 'b', 'c', 'd'], 'die Ursprungsliste bleibt unverändert');
  assert.deepEqual(roh(k.wortZufallsgriff(null, 3)), []);
});

test('Faden-Ziel: auch auf bereits offener Route wird ein exakter Neuzeichnen-Sprung verlangt', async () => {
  const k = await frisch();
  assert.equal(k.merkeFadenZiel('nachricht-mit-]:sonderzeichen', '#/faden'), 'neuzeichnen');
  assert.equal(k.sessionStorage.getItem('zielFaden'), 'nachricht-mit-]:sonderzeichen');
  assert.equal(k.merkeFadenZiel('zweite', '#/zuhause'), 'wechseln');
});

test('Beziehungen: Selbstkanten und Dubletten werden verhindert, Trennen ist dauerhaft', async () => {
  const k = await frisch();
  const a = k.neuDoc('blatt', { titel: 'A' });
  const b = k.neuDoc('heft', { titel: 'B' });
  assert.equal(k.verbindeDocs(a.id, a.id), null);
  assert.equal(k.verbindeDocs(a.id, 'fehlt'), null);
  const eins = k.verbindeDocs(a.id, b.id, 'inspiriert');
  const zwei = k.verbindeDocs(a.id, b.id, 'inspiriert');
  assert.equal(eins.id, zwei.id);
  assert.equal(k.beziehungenFuer(a.id).length, 1);
  assert.equal(await k.trenneDocs(eins.id), true);
  assert.equal(k.beziehungenFuer(a.id).length, 0);
  assert.equal(await k.trenneDocs(eins.id), false);
});

test('Projekt-Löschen putzt Geisterverweise; Rückgängig stellt sie wieder her', async () => {
  const k = await frisch();
  const projekt = k.neuDoc('projekt', { titel: 'P' });
  const heft = k.neuDoc('heft', { titel: 'H', projektRef: projekt.id });
  const spiegel = k.neuDoc('blase', { text: 'Abschrift', quelle: projekt.id, pos: { x: 0, y: 0 } });
  await k.loesche(projekt.id, true);
  assert.ok(k.D.docs.has(heft.id));
  assert.equal(heft.projektRef, undefined);
  assert.equal(spiegel.quelle, undefined);
  const [buendel] = await k.dbAlle('papierkorb');
  await k.holeZurueck(buendel.id);
  assert.equal(heft.projektRef, projekt.id);
  assert.equal(spiegel.quelle, projekt.id);
});

test('Blatt ↔ Heft: Einfügepositionen werden geklemmt und Reihenfolge bleibt lückenlos', async () => {
  const k = await frisch();
  const heft = k.neuDoc('heft', { titel: 'H' });
  const s1 = k.neuDoc('seite', { parent: heft.id, ord: 0, text: '1' });
  const s2 = k.neuDoc('seite', { parent: heft.id, ord: 1, text: '2' });
  const blatt = k.neuDoc('blatt', { text: 'Mitte' });
  assert.equal(k.blattInHeft(blatt, heft, 1), true);
  assert.deepEqual(roh(k.kinder(heft.id, 'seite').map((d) => d.id)), [s1.id, blatt.id, s2.id]);
  assert.deepEqual(roh(k.kinder(heft.id, 'seite').map((d) => d.ord)), [0, 1, 2]);
  assert.equal(k.seiteZuBlatt(blatt), true);
  assert.equal(blatt.typ, 'blatt');
  assert.equal(blatt.parent, undefined);
  assert.deepEqual(roh(k.kinder(heft.id, 'seite').map((d) => d.ord)), [0, 1]);
  assert.equal(k.seiteZuBlatt(blatt), false);
});

test('schnelle Speicherrennen: Revisionen steigen monoton und jüngster Sync-Marker gewinnt', async () => {
  const k = await frisch();
  const d = k.neuDoc('blatt', { text: '' });
  for (let i = 0; i < 250; i++) { d.text = 'Stand ' + i; k.speichereStill(d); }
  await mikrotasksLeeren();
  const marker = await k.dbGet('sync', d.id);
  assert.equal(d._rev, 251);
  assert.equal(marker.rev, d._rev);
  assert.equal(marker.geloescht, false);
});

test('Wieder aufgetaucht: unvollendete Gedanken, Zeitfäden und entfernte Echos werden erkannt', async () => {
  const k = await frisch();
  const jetzt = Date.now();
  k.neuDoc('faden', { text: 'Diese alte Geschichte endet damit, dass', angelegt: jetzt - 90 * 86400000 });
  k.neuDoc('faden', { text: 'Nordlicht steht 1989 am Tor und begegnet dort 2033 erneut.', angelegt: jetzt - 60 * 86400000 });
  k.neuDoc('faden', { text: 'Das seltene Hafenfeuer leuchtet über der verlassenen Mole.', angelegt: jetzt - 120 * 86400000 });
  k.neuDoc('blatt', { text: 'Jahrzehnte später wird das Hafenfeuer wieder gesehen.', angelegt: jetzt - 20 * 86400000 });
  const funde = k.wiederFunde(jetzt);
  assert.ok(funde.some((f) => f.art === 'NOCH NICHT FERTIG'));
  assert.ok(funde.some((f) => f.art === 'EIN ZEITFADEN'));
  const echoes = k.findeWiederEchos(funde);
  assert.ok(echoes.some((e) => e.wort === 'hafenfeuer'));
});

test('Goodnotes-Archiv: Formate, Dublettenfingerabdruck und Größenanzeige sind stabil', async () => {
  const k = await frisch();
  assert.equal(k.goodnotesArt({ name: 'Heft.PDF', type: '' }), 'pdf');
  assert.equal(k.goodnotesArt({ name: 'Original.goodnotes', type: 'application/octet-stream' }), 'goodnotes');
  assert.equal(k.goodnotesArt({ name: 'Alle Hefte.zip', type: 'application/zip' }), 'paket');
  assert.equal(k.goodnotesArt({ name: 'seite.jpeg', type: '' }), 'bild');
  assert.equal(k.goodnotesArt({ name: 'virus.exe', type: 'application/octet-stream' }), null);
  const f = { name: 'Heft.pdf', size: 123, lastModified: 456 };
  assert.equal(k.goodnotesFingerabdruck(f), k.goodnotesFingerabdruck({ ...f }));
  const a = new Blob([new Uint8Array([1, 2, 3, 4, 5])]);
  const gleich = new Blob([new Uint8Array([1, 2, 3, 4, 5])]);
  const andererInhalt = new Blob([new Uint8Array([1, 2, 9, 4, 5])]);
  assert.equal(await k.blobsGleich(a, gleich, 2), true);
  assert.equal(await k.blobsGleich(a, andererInhalt, 2), false, 'gleiche Metadaten dürfen verschiedene Dateien nicht verschlucken');
  assert.equal(k.formatBytes(0), '0 B');
  assert.equal(k.formatBytes(1536), '1,5 KB');
});

test('Audio: ungültige Pegel werden verworfen und ein unterbrochener Kontext wird frisch aufgebaut', async () => {
  const k = await frisch();
  assert.deepEqual(roh(k.saubereMischung({ regenfenster: 4, wind: -1, unbekannt: .8, kamin: '0.25' })), { regenfenster: 1, kamin: .25 });

  class Param {
    constructor(v = 0) { this.value = v; }
    setTargetAtTime(v) { this.value = v; }
    setValueAtTime(v) { this.value = v; }
    exponentialRampToValueAtTime(v) { this.value = v; }
  }
  class Node {
    constructor() { this.gain = new Param(); this.frequency = new Param(); this.Q = new Param(); this.threshold = new Param(); this.ratio = new Param(); }
    connect() { return this; }
    disconnect() {}
    start() {}
    stop() {}
  }
  const instanzen = [];
  class AudioContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.sampleRate = 8000; this.destination = new Node(); instanzen.push(this); }
    createGain() { return new Node(); }
    createDynamicsCompressor() { return new Node(); }
    createOscillator() { return new Node(); }
    createBufferSource() { return new Node(); }
    createBuffer(kanal, n) { return { getChannelData: () => new Float32Array(n) }; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
  }
  k.window.AudioContext = AudioContext;
  assert.equal(k.audioProbe(), true);
  assert.equal(k.audioZustand().ok, true);
  instanzen[0].state = 'interrupted';
  assert.equal(k.audioNeuStarten(), true);
  assert.equal(instanzen.length, 2);
  assert.equal(k.audioZustand().state, 'running');
  assert.equal(await k.audioFreigeben({ neu: true }), true);
  assert.equal(instanzen.length, 3, 'bewusstes Wecken ersetzt einen womöglich stummen iOS-Kontext');
  assert.equal(k.audioLautheitsKurve(0), 0);
  assert.ok(k.audioLautheitsKurve(.5) > .5, 'mittlere Stellung bleibt auf Tablet-Lautsprechern hörbar');
  assert.ok(k.audioLautheitsKurve(1) <= 1);
});

test('Audio-Werkbank: Stop räumt ausstehende Timer weg', async () => {
  const k = await frisch();
  let aufrufe = 0;
  const w = k.neueWerkbank({ ctx: { currentTime: 0 } }, {});
  w.spaeter(() => aufrufe++, 15);
  w.spaeter(() => aufrufe++, 25);
  w.immer(16, () => aufrufe++);
  w.stop();
  await new Promise((r) => setTimeout(r, 45));
  assert.equal(aufrufe, 0);
});

test('Themen: auch Weiß färbt die Statusleiste richtig, kein Thema fällt auf Beige zurück', async () => {
  const k = baueSandkasten();
  assert.equal(k.THEMEN.weiss, '#ffffff');
  for (const [name, wert] of Object.entries(roh(k.THEMEN))) {
    assert.match(wert, /^#[0-9a-f]{6}$/i, 'Thema ohne echte Farbe: ' + name);
  }
});

test('Anlagen ohne Position: Sanitisierung und Laufzeit reparieren, statt abzustürzen', async () => {
  const k = baueSandkasten();
  /* Beschädigt importierte Zettel, Fotos und Blasen bekommen immer eine Position … */
  for (const typ of ['zettel', 'foto', 'blase']) {
    const d = k.sauberesDokument({ id: 'kaputt-' + typ, typ, angelegt: 1, geaendert: 1 });
    assert.ok(d && d.pos, typ + ' braucht eine Position');
    for (const feld of ['x', 'y', 'rot', 'w']) assert.equal(typeof d.pos[feld], 'number');
  }
  /* … andere Typen werden nicht mit einer künstlichen Position beschwert … */
  const s = k.sauberesDokument({ id: 'ohne', typ: 'schnipsel', text: 'hi', angelegt: 1, geaendert: 1 });
  assert.equal(s.pos, undefined);
  /* … und positioniere setzt zur Not selbst eine, damit Gesten danach greifen. */
  const elem = { style: {} };
  const anlage = { typ: 'zettel' };
  k.positioniere(elem, anlage);
  assert.ok(anlage.pos && typeof anlage.pos.x === 'number');
  assert.equal(elem.style.left, anlage.pos.x + '%');
});

test('Suche: ein beschädigter Suchverlauf im Browser-Speicher legt nichts lahm', async () => {
  const k = baueSandkasten();
  k.localStorage.setItem('vani-suchen', '{kaputt');
  assert.deepEqual([...k.leseLetzteSuchen()], []);
  k.localStorage.setItem('vani-suchen', JSON.stringify({ kein: 'array' }));
  assert.deepEqual([...k.leseLetzteSuchen()], []);
  k.localStorage.setItem('vani-suchen', JSON.stringify(['abend', 42, null, 'meer']));
  assert.deepEqual([...k.leseLetzteSuchen()], ['abend', 'meer']);
});

test('Anleitung: vollständig, eindeutig, durchsuchbar — jeder Raum der Leiste hat sein Kapitel', async () => {
  const k = baueSandkasten();
  const kapitel = roh(k.ANLEITUNG);
  const raeume = roh(k.ALLE_RAEUME);
  const ids = kapitel.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length, 'Kapitel-IDs müssen eindeutig sein');
  for (const kap of kapitel) {
    assert.ok(kap.titel && Array.isArray(kap.abschnitte) && kap.abschnitte.length >= 1, 'leeres Kapitel: ' + kap.id);
    for (const a of kap.abschnitte) assert.ok(a.t && ((a.p && a.p.length) || (a.s && a.s.length)), kap.id + ' → Abschnitt ohne Inhalt: ' + a.t);
    if (kap.raum && kap.raum !== 'suche') {
      assert.ok(raeume.some((r) => r.id === kap.raum) || kap.raum === 'feinheiten', 'Kapitel führt in unbekannten Raum: ' + kap.raum);
    }
  }
  /* Vollständigkeit: jeder Raum aus der Leiste hat ein Kapitel, das zu ihm führt. */
  for (const r of raeume) {
    const ziel = r.id === 'zuhause' ? '' : r.id;
    assert.ok(kapitel.some((x) => x.raum === ziel), 'Kein Kapitel für den Raum ' + r.id);
  }
  /* Suche: nur passende Abschnitte bleiben, Umlaute sind egal, Unbekanntes ergibt nichts, leer ergibt alles. */
  const treffer = roh(k.anleitungSuche('kopplungscode'));
  assert.ok(treffer.length >= 1 && treffer.every((t) => t.abschnitte.length >= 1));
  assert.ok(treffer.some((t) => t.kapitel.id === 'geraete'));
  assert.equal(roh(k.anleitungSuche('strasse')).length, roh(k.anleitungSuche('Straße')).length);
  assert.equal(roh(k.anleitungSuche('xyzzy-gibt-es-nicht')).length, 0);
  assert.equal(roh(k.anleitungSuche('')).length, kapitel.length);
  /* Hervorheben entschärft HTML, markiert unabhängig von Groß/Klein und stolpert nicht über Sonderzeichen. */
  const h = k.anleitungHervorheben('Der <b>Faden</b> & faden', 'faden');
  assert.ok(!h.includes('<b>') && h.includes('&lt;b&gt;'));
  assert.equal((h.match(/<mark>/g) || []).length, 2);
  assert.equal(k.anleitungHervorheben('a.b', '.'), 'a.b');
  assert.equal(k.anleitungHervorheben('a.b(c)', '.b'), 'a<mark>.b</mark>(c)');
});

test('Sync-Dienst: auf einer reinen Seite wird der öffentliche Dienst vorgeschlagen, sonst die eigene Adresse', async () => {
  const k = baueSandkasten();
  const setze = (protocol, origin, hostname) => { k.location.protocol = protocol; k.location.origin = origin; k.location.hostname = hostname; };
  setze('https:', 'https://jemand.github.io', 'jemand.github.io');
  assert.equal(await k.syncStandardServer(), k.SYNC_STANDARD_DIENST);
  setze('https:', 'https://vani.example.org', 'vani.example.org');
  assert.equal(await k.syncStandardServer(), 'https://vani.example.org');
  setze('http:', 'http://localhost:4321', 'localhost');
  assert.equal(await k.syncStandardServer(), 'http://localhost:4321');
  setze('file:', 'null', '');
  assert.equal(await k.syncStandardServer(), k.SYNC_STANDARD_DIENST);
  assert.match(k.SYNC_STANDARD_DIENST, /^https:\/\//);
});
