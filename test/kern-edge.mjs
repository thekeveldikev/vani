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

test('Eine App-Adresse: GitHub ist sichtbar, Sites nur Tresor, Desktop bleibt eigenständig', async () => {
  const k = baueSandkasten();
  const setze = (protocol, origin, hostname, pathname = '/', search = '') => {
    Object.assign(k.location, { protocol, origin, hostname, pathname, search });
  };
  setze('https:', 'https://thekeveldikev.github.io', 'thekeveldikev.github.io', '/vani/');
  assert.equal(k.vaniAdresseArt(), 'haupt');
  assert.equal(await k.syncStandardServer(), k.SYNC_STANDARD_DIENST);
  assert.equal(k.VANI_HAUPTADRESSE, 'https://thekeveldikev.github.io/vani/');

  setze('https:', 'https://vani-schreibzuhause.craftkey.chatgpt.site', 'vani-schreibzuhause.craftkey.chatgpt.site');
  assert.equal(k.vaniAdresseArt(), 'dienst');
  assert.equal(await k.syncStandardServer(), k.SYNC_STANDARD_DIENST);
  setze('https:', 'https://vani-schreibzuhause.craftkey.chatgpt.site', 'vani-schreibzuhause.craftkey.chatgpt.site', '/', '?rettung=1&kein-sw=1');
  assert.equal(k.vaniAdresseArt(), 'rettung');

  setze('http:', 'http://localhost:4321', 'localhost');
  assert.equal(k.vaniAdresseArt(), 'lokal');
  assert.equal(await k.syncStandardServer(), 'http://localhost:4321');

  setze('vani:', 'null', 'app');
  assert.equal(k.vaniAdresseArt(), 'desktop');
  setze('file:', 'null', '', '/');
  assert.equal(k.vaniAdresseArt(), 'andere');
  assert.equal(await k.syncStandardServer(), k.SYNC_STANDARD_DIENST);
  assert.match(k.SYNC_STANDARD_DIENST, /^https:\/\//);
});

test('Kritzeln: Striche landen genau dort, wo gezeichnet wurde — in jeder Breite', async () => {
  const k = baueSandkasten();
  const gemalt = [];
  const ctx = {
    globalCompositeOperation: '', strokeStyle: '', fillStyle: '', lineWidth: 0, lineCap: '', lineJoin: '',
    beginPath() {}, moveTo(x, y) { gemalt.push(['von', x, y]); }, lineTo(x, y) { gemalt.push(['nach', x, y]); },
    stroke() { gemalt.push(['breite', this.lineWidth]); }, arc(x, y, r) { gemalt.push(['punkt', x, y, r]); }, fill() {}
  };
  /* Punkte liegen auf die Breite normiert vor: dieselbe Zeichnung, zwei Breiten. */
  const strich = { farbe: '#123456', radierer: false, punkte: [{ x: .25, y: .5, w: .01 }, { x: .75, y: .5, w: .01 }] };
  k.kritzelZeichneStrich(ctx, strich, 400);
  assert.deepEqual(gemalt.filter((g) => g[0] !== 'breite'), [['von', 100, 200], ['nach', 300, 200]]);
  assert.deepEqual(gemalt.find((g) => g[0] === 'breite'), ['breite', 4]);
  gemalt.length = 0;
  k.kritzelZeichneStrich(ctx, strich, 800);
  assert.deepEqual(gemalt.filter((g) => g[0] !== 'breite'), [['von', 200, 400], ['nach', 600, 400]],
    'doppelte Breite verschiebt den Strich proportional, nicht willkürlich');
  assert.deepEqual(gemalt.find((g) => g[0] === 'breite'), ['breite', 8]);
  /* Ein einzelner Tipp ist ein Punkt, kein verlorener Strich. */
  gemalt.length = 0;
  k.kritzelZeichneStrich(ctx, { farbe: '#000', punkte: [{ x: .5, y: .25, w: .02 }] }, 200);
  assert.deepEqual(gemalt, [['punkt', 100, 50, 2]]);
  /* Der Radierer nimmt weg, statt zu übermalen. */
  k.kritzelZeichneStrich(ctx, { radierer: true, punkte: [{ x: .1, y: .1, w: .01 }, { x: .2, y: .2, w: .01 }] }, 100);
  assert.equal(ctx.globalCompositeOperation, 'destination-out');
  /* Kaputte Striche werfen nicht. */
  assert.doesNotThrow(() => k.kritzelZeichneStrich(ctx, { punkte: [] }, 100));
  assert.doesNotThrow(() => k.kritzelZeichneStrich(ctx, {}, 100));
});

test('Funken: groß, eindeutig, und jede Art liefert etwas Brauchbares', async () => {
  const k = baueSandkasten();
  const listen = { FUNKEN: k.FUNKEN, FUNKE_WER: k.FUNKE_WER, FUNKE_WO: k.FUNKE_WO, FUNKE_ABER: k.FUNKE_ABER, FUNKE_FRAGEN: k.FUNKE_FRAGEN, FUNKE_FORMEN: k.FUNKE_FORMEN, FUNKE_SAETZE: k.FUNKE_SAETZE, FUNKE_FIGUREN: k.FUNKE_FIGUREN, FUNKE_WENDUNGEN: k.FUNKE_WENDUNGEN };
  const mindest = { FUNKEN: 150, FUNKE_WER: 36, FUNKE_WO: 36, FUNKE_ABER: 36, FUNKE_FRAGEN: 36, FUNKE_FORMEN: 36, FUNKE_SAETZE: 36, FUNKE_FIGUREN: 24, FUNKE_WENDUNGEN: 20 };
  for (const [name, liste] of Object.entries(listen)) {
    const arr = roh(liste);
    assert.ok(arr.length >= mindest[name], name + ' hat nur ' + arr.length);
    assert.equal(new Set(arr.map((x) => x.trim().toLowerCase())).size, arr.length, name + ' enthält Dubletten');
    for (const x of arr) assert.ok(typeof x === 'string' && x.trim().length >= 12 && x.length <= 400, name + ': ' + x);
  }
  /* Wer · Wo · Aber muss grammatisch zusammenpassen: Komma-Enden, „aber"-Anfang. */
  for (const w of roh(k.FUNKE_WER)) assert.ok(w.endsWith(','), 'Wer endet mit Komma: ' + w);
  for (const w of roh(k.FUNKE_WO)) assert.ok(w.endsWith(','), 'Wo endet mit Komma: ' + w);
  for (const w of roh(k.FUNKE_ABER)) assert.ok(/^aber /.test(w), 'Aber beginnt mit aber: ' + w);
  const arten = roh(k.FUNKE_ARTEN).map((a) => a[0]);
  assert.deepEqual(arten, ['szene', 'kombi', 'figur', 'wendung', 'frage', 'form', 'satz']);
  for (const art of arten) {
    const f = art === 'kombi' ? k.neuerFunke(true) : k.neuerFunke(false, art);
    assert.ok(typeof f === 'string' && f.length > 10, 'Art ohne Funke: ' + art);
  }
});

test('Schlagworte: über alles gezählt, je Dokument einmal, Archiv bleibt draußen', async () => {
  const k = baueSandkasten();
  const docs = [
    { typ: 'schnipsel', text: 'Heute #Regen und #regen und #Nacht' },
    { typ: 'blatt', text: '#nacht\nZeile mit #Feuer' },
    { typ: 'goodnote', text: '#geheim' },
    { typ: 'szene', text: 'kein#schlagwort hier, aber #a zu kurz, #Feuer ja' },
    { typ: 'seite', text: null }, null
  ];
  const idx = roh(k.schlagwortIndex(docs));
  assert.deepEqual(idx.map((x) => x.wort + ':' + x.anzahl), ['feuer:2', 'nacht:2', 'regen:1']);
  assert.equal(roh(k.schlagwortIndex(docs, 1)).length, 1);
  assert.deepEqual(roh(k.schlagwortIndex([])), []);
});

test('Startauftrag: geteilter Text wird ein Schnipsel, Schnellstarts sind bekannt, Unsinn bleibt null', async () => {
  const k = baueSandkasten();
  assert.deepEqual(roh(k.startAuftrag('?titel=Ein%20Titel&text=Der%20Text&url=https%3A%2F%2Fbeispiel.de')), { art: 'geteilt', text: 'Ein Titel\nDer Text\nhttps://beispiel.de' });
  assert.deepEqual(roh(k.startAuftrag('?text=nur%20Text')), { art: 'geteilt', text: 'nur Text' });
  assert.deepEqual(roh(k.startAuftrag('?titel=Gleich&text=Gleich')), { art: 'geteilt', text: 'Gleich' });
  assert.deepEqual(roh(k.startAuftrag('?neu=blatt')), { art: 'neu', was: 'blatt' });
  assert.equal(k.startAuftrag('?neu=raketen'), null);
  assert.equal(k.startAuftrag('?kein-sw'), null);
  assert.equal(k.startAuftrag(''), null);
  assert.equal(k.startAuftrag(null), null);
  const lang = k.startAuftrag('?text=' + encodeURIComponent('x'.repeat(300000)));
  assert.equal(lang.text.length, 200000, 'geteilter Text wird begrenzt');
});

test('Jahresraster: Wochen × 7, Zukunft leer, Stufen nach Maximum, heute markiert', async () => {
  const k = baueSandkasten();
  const jetzt = new Date(2026, 7, 21, 12).getTime(); /* ein Freitag */
  const tage = { '2026-08-21': 300, '2026-08-20': 100, '2026-08-19': 10, '2025-01-01': 5000 };
  const r = roh(k.jahresRaster(tage, 53, jetzt));
  assert.equal(r.spalten.length, 53);
  assert.ok(r.spalten.every((sp) => sp.length === 7));
  assert.equal(r.max, 300, 'Werte außerhalb des Fensters zählen nicht');
  const letzte = r.spalten[52];
  assert.equal(letzte.filter((z) => z.worte === null).length, 2, 'Samstag und Sonntag liegen in der Zukunft');
  const heute = letzte.find((z) => z.heute);
  assert.ok(heute && heute.stufe === 3 && heute.tag === '2026-08-21');
  assert.equal(letzte.find((z) => z.tag === '2026-08-20').stufe, 2);
  assert.equal(letzte.find((z) => z.tag === '2026-08-19').stufe, 1);
  assert.equal(roh(k.jahresRaster(null, 0, jetzt)).spalten.length, 1, 'mindestens eine Woche');
  assert.equal(roh(k.jahresRaster({ '2026-08-21': 'kaputt' }, 2, jetzt)).max, 0);
});

test('Hefte: Papierfarbe, Rand, Zettelschrift und Anpinnen überleben die Sanitisierung nur in erlaubter Form', async () => {
  const k = baueSandkasten();
  const h = k.sauberesDokument({ id: 'h', typ: 'heft', titel: 'H', papierfarbe: 'neon', rand: 'ja', gepinnt: 1, angelegt: 1, geaendert: 1 });
  assert.equal(h.papierfarbe, 'hell'); assert.equal(h.rand, false); assert.equal(h.gepinnt, false);
  const h2 = k.sauberesDokument({ id: 'h2', typ: 'heft', titel: 'H', papierfarbe: 'nacht', rand: true, lesezeichen: 's1', angelegt: 1, geaendert: 1 });
  assert.equal(h2.papierfarbe, 'nacht'); assert.equal(h2.rand, true); assert.equal(h2.lesezeichen, 's1');
  const z = k.sauberesDokument({ id: 'z', typ: 'zettel', schrift: 'comic', farbe: 'lila', angelegt: 1, geaendert: 1 });
  assert.equal(z.schrift, 'hand'); assert.equal(z.farbe, 'lila');
  assert.equal(k.papierKlassen({ papier: 'kariert', papierfarbe: 'kraft', rand: true }, ' fluss'), 'papierseite kariert papierfarbe-kraft mit-rand fluss');
  assert.equal(k.papierKlassen({}), 'papierseite liniert papierfarbe-hell');
  assert.deepEqual(roh(k.PAPIERFARBEN).map((x) => x[0]), ['hell', 'weiss', 'creme', 'kraft', 'nacht']);
  assert.equal(roh(k.ZETTELFARBEN).length, 8);
});

test('Ambience-Katalog: nur saubere Einträge, Dateinamen ohne Ausbruch', async () => {
  const k = baueSandkasten();
  const liste = k.ambienceKatalogSetzen([
    { id: 'regen', name: 'Regen', kat: 'Wetter', datei: 'regen.opus', mb: 0.5 },
    { id: '../../etc/passwd', name: 'böse' },
    { id: 'pfad', name: 'Pfad', datei: '../geheim/datei.opus' },
    { id: 'gross', name: 'x'.repeat(200), kat: 'y'.repeat(90), mb: 9999 },
    null, { name: 'ohne id' }
  ]);
  assert.deepEqual(roh(liste).map((x) => x.id), ['regen', 'pfad', 'gross']);
  assert.equal(roh(liste)[1].datei, '..geheimdatei.opus', 'Pfadtrenner fallen weg');
  assert.equal(roh(liste)[2].name.length, 60);
  assert.equal(roh(liste)[2].kat.length, 30);
  assert.equal(roh(liste)[2].mb, 100);
  assert.equal(k.ambienceSchluessel('regen'), 'ambience:1:regen');
  assert.equal(roh(k.ambienceKatalogSetzen('unsinn')).length, 0);
});

test('Ambience-Mischung und Feinheit: nur bekannte Klänge, alle Werte begrenzt', async () => {
  const k = baueSandkasten();
  k.ambienceKatalogSetzen([{ id: 'feuer', name: 'Feuer' }, { id: 'regen', name: 'Regen' }]);
  const m = roh(k.saubereAmbienceMischung({ feuer: 0.8, regen: 5, unbekannt: 0.5, leise: 0, kaputt: 'x' }));
  assert.deepEqual(m, { feuer: 0.8, regen: 1 }, 'Unbekanntes und Stummes fällt weg');
  assert.deepEqual(roh(k.saubereAmbienceMischung(null)), {});
  assert.deepEqual(roh(k.saubereAmbienceMischung([1, 2])), {});
  const f = roh(k.saubereAmbienceFeinheit({ tempo: 99, klarheit: -5, tiefe: 'x', atmen: 2, blende: 0 }));
  assert.deepEqual(f, { tempo: 2, klarheit: 300, tiefe: 20, atmen: 1, blende: 0.5 });
  assert.deepEqual(roh(k.saubereAmbienceFeinheit(undefined)), { tempo: 1, klarheit: 20000, tiefe: 20, atmen: 0.35, blende: 4 });
});

test('Klangbilder: hängen an einem Ort, ein Ort trägt nur eines, Lösen räumt auf', async () => {
  const k = await frisch();
  const p = k.neuDoc('projekt', { titel: 'P' });
  const kap = k.neuDoc('kapitel', { parent: p.id, titel: 'K1', ord: 0 });
  const szene = k.neuDoc('szene', { parent: kap.id, projekt: p.id, ord: 0, titel: 'S', text: '' });
  const a = k.neuDoc('klangbild', { titel: 'Nacht', pegel: {}, gewebt: {}, orte: [] });
  const b = k.neuDoc('klangbild', { titel: 'Morgen', pegel: {}, gewebt: {}, orte: [] });

  /* an der Szene selbst */
  k.klangbildBinden(a, szene.id);
  assert.equal(k.klangbildFuer(szene).id, a.id);
  /* ein zweites Bild übernimmt den Ort — das erste lässt los */
  k.klangbildBinden(b, szene.id);
  assert.equal(k.klangbildFuer(szene).id, b.id);
  assert.deepEqual([...a.orte], [], 'das alte Bild hängt nicht mehr daran');
  /* am Kapitel: gilt für die Szene darin */
  k.klangbildLoesen(szene.id);
  assert.equal(k.klangbildFuer(szene), null);
  k.klangbildBinden(a, kap.id);
  assert.equal(k.klangbildFuer(szene).id, a.id, 'das Kapitel vererbt an seine Szenen');
  /* am Projekt: gilt auch */
  k.klangbildLoesen(kap.id);
  k.klangbildBinden(b, p.id);
  assert.equal(k.klangbildFuer(szene).id, b.id, 'das Projekt vererbt an seine Szenen');
  assert.equal(k.klangbildFuer(null), null);
});

test('Manuskript: Kapitel, Szenen und Schalter — nichts geht verloren, nichts kommt dazu', async () => {
  const k = await frisch();
  const p = k.neuDoc('projekt', { titel: 'Der Hafen', art: 'Roman', ziel: 1000 });
  const k1 = k.neuDoc('kapitel', { parent: p.id, titel: 'Ankunft', ord: 0 });
  k.neuDoc('szene', { parent: k1.id, projekt: p.id, ord: 0, titel: 'Erste Szene', text: 'Der Regen kam von See.', notiz: 'Noch unsicher', status: 'entwurf', farbe: '' });
  k.neuDoc('szene', { parent: k1.id, projekt: p.id, ord: 1, titel: '', text: 'Danach wurde es still.', status: 'steht', farbe: '' });
  k.neuDoc('szene', { parent: k1.id, projekt: p.id, ord: 2, titel: '', text: '', status: 'funke', farbe: '' });
  k.neuDoc('figur', { parent: p.id, projekt: p.id, titel: 'Ruth', art: 'figur', notiz: 'Riecht nach Zimt.', ord: 0 });

  const voll = k.manuskriptText(p, { kopf: true, szentitel: true, szenentitel: true, status: true, notizen: true, figuren: true, leere: false });
  assert.match(voll, /^# Der Hafen/);
  assert.match(voll, /Roman · \d+ Wörter · Ziel: 1\.000/);
  assert.match(voll, /## Ankunft/);
  assert.match(voll, /### Erste Szene {2}`Entwurf`/);
  assert.ok(voll.includes('Der Regen kam von See.'));
  assert.ok(voll.includes('Danach wurde es still.'));
  assert.ok(voll.includes('* * *'), 'Szenen sind getrennt');
  assert.ok(voll.includes('> **Notiz:** Noch unsicher'));
  assert.ok(voll.includes('**Ruth** — Figur'));
  assert.ok(!voll.includes('(noch leer)'), 'leere Szenen bleiben draußen');

  const knapp = k.manuskriptText(p, { kopf: false, szenentitel: false, status: false, notizen: false, figuren: false, leere: false });
  assert.ok(!knapp.includes('Ziel:') && !knapp.includes('### ') && !knapp.includes('Notiz') && !knapp.includes('Ruth'));
  assert.ok(knapp.includes('Der Regen kam von See.'), 'der Text bleibt immer');

  const mitLeeren = k.manuskriptText(p, { leere: true });
  assert.ok(mitLeeren.includes('(noch leer)'));
  assert.doesNotMatch(k.manuskriptText(p, {}), /\n{4,}/, 'keine Leerzeilenwüsten');
});

test('seitenUmbruch füllt die Seite bis unten: Absatzenden weit oben zählen nicht mehr', async () => {
  const k = await frisch();
  const grenze = 400;
  const passt = (s) => s.length <= grenze;
  /* Ein Absatzende ganz weit oben darf die Seite nicht zu einem Drittel leer lassen */
  const frueh = 'A'.repeat(60) + '\n' + 'wort '.repeat(120);
  const g1 = roh(k.seitenUmbruch(frueh, passt));
  assert.ok(g1.hier.length > grenze - 140, 'die Seite ist fast voll: ' + g1.hier.length);
  assert.ok(g1.hier.length <= grenze);
  assert.equal((g1.hier + ' ' + g1.weiter).replace(/\s+/g, ' ').trim(), frueh.replace(/\s+/g, ' ').trim());
  /* Ein Absatzende dicht an der Bruchstelle wird dagegen genommen */
  const nah = 'x'.repeat(grenze - 30) + '\n' + 'y'.repeat(600);
  const g2 = roh(k.seitenUmbruch(nah, passt));
  assert.equal(g2.hier.length, grenze - 30, 'am nahen Absatzende getrennt');
  /* Sonst ein Satzende */
  const satz = 'Ein Satz. '.repeat(50);
  const g3 = roh(k.seitenUmbruch(satz, passt));
  assert.ok(g3.hier.endsWith('.'), 'am Satzende getrennt: ' + JSON.stringify(g3.hier.slice(-12)));
  assert.ok(g3.hier.length > grenze - 140);
  /* Und ohne jede Grenze wird hart geschnitten, ohne Verlust */
  const ohne = 'z'.repeat(1000);
  const g4 = roh(k.seitenUmbruch(ohne, passt));
  assert.equal(g4.hier.length, grenze);
  assert.equal(g4.hier + g4.weiter, ohne);
});
