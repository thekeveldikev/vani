/* Ankommen ohne Datei: die Erkenner für Zwischenablage-Inhalte sind pur und
   werden hier mit echten Formaten gefüttert — WhatsApp (Android und iPhone),
   Markdown, der Text-Export eines alten VANI, Kopplungscodes, Sicherungen. */
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

test('whatsappZerlegen: Android- und iPhone-Export, Fortsetzungszeilen, Systemzeilen', async () => {
  const k = await frisch();
  const android = [
    '12.03.23, 14:05 - Nachrichten und Anrufe sind Ende-zu-Ende-verschlüsselt. Niemand außerhalb dieses Chats kann sie lesen.',
    '12.03.23, 14:05 - Ich: Erste Zeile',
    'zweite Zeile derselben Nachricht',
    '',
    '13.03.23, 09:12 - Ich: Nächster Tag',
    '13.03.2023, 09:13 - Ich: Vierstelliges Jahr geht auch'
  ].join('\n');
  const a = roh(k.whatsappZerlegen(android));
  assert.equal(a.nachrichten.length, 3);
  assert.equal(a.sonst, 1, 'die Systemzeile ohne „Name:" bleibt draußen');
  assert.equal(a.nachrichten[0].text, 'Erste Zeile\nzweite Zeile derselben Nachricht');
  assert.equal(new Date(a.nachrichten[1].wann).getFullYear(), 2023);
  assert.equal(new Date(a.nachrichten[2].wann).getMinutes(), 13);

  const iphone = '[12.03.23, 14:05:33] Ich: Hallo\n[12.03.23, 14:06:01] Du: Hi';
  const b = roh(k.whatsappZerlegen(iphone));
  assert.deepEqual(b.nachrichten.map((n) => n.wer), ['Ich', 'Du']);
  assert.equal(b.nachrichten[0].text, 'Hallo');
  assert.deepEqual(roh(k.whatsappZerlegen('')), { nachrichten: [], sonst: 0 });
});

test('markdownZerlegen: Rauten und Unterstreichungen, Vorspann, leere Teile', async () => {
  const k = await frisch();
  const m = roh(k.markdownZerlegen('Vorab ein Satz.\n\n# Eins\nText eins\n\nZwei\n===\nText zwei\n## Zwei-a\n\nDrei\n---\n'));
  assert.equal(m.vorspann, 'Vorab ein Satz.');
  assert.deepEqual(m.teile.map((t) => [t.ebene, t.titel, t.text]), [
    [1, 'Eins', 'Text eins'], [1, 'Zwei', 'Text zwei'], [2, 'Zwei-a', ''], [2, 'Drei', '']
  ]);
  assert.equal(roh(k.markdownZerlegen('nur text\nohne überschrift')).teile.length, 0);
  /* Eine Trennlinie mitten im Text ist keine Unterstreichung einer leeren Zeile. */
  assert.equal(roh(k.markdownZerlegen('a\n\n---\nb')).teile.length, 0);
});

test('vaniTextZerlegen: baut Projekte, Hefte mit Zetteln und Schnipsel aus dem alten Export zurück', async () => {
  const k = await frisch();
  const alt = [
    '══ PROJEKT: Grauwald ══', '', '— Kapitel 1 —', '· Der Anfang', 'Es war kalt.', 'Sehr kalt.', '· Zweite Szene', 'Dann wärmer.', '',
    '══ HEFT: Ideen ══', '· Seite mit Titel', 'Inhalt.', '[Zettel] Nicht vergessen', 'Noch mehr Inhalt.', '',
    '══ SCHNIPSEL ══', 'Mo, 20. Aug: Erster Schnipsel', 'Di, 21. Aug: Zweiter', 'mit zweiter Zeile'
  ].join('\n');
  const v = roh(k.vaniTextZerlegen(alt));
  assert.equal(v.projekte.length, 1);
  assert.equal(v.projekte[0].titel, 'Grauwald');
  assert.deepEqual(v.projekte[0].kapitel[0].szenen.map((s) => [s.titel, s.text]), [['Der Anfang', 'Es war kalt.\nSehr kalt.'], ['Zweite Szene', 'Dann wärmer.']]);
  assert.equal(v.hefte[0].seiten.length, 1);
  assert.equal(v.hefte[0].seiten[0].text, 'Inhalt.\nNoch mehr Inhalt.');
  assert.deepEqual(v.hefte[0].seiten[0].zettel, ['Nicht vergessen']);
  assert.equal(v.schnipsel.length, 2);
  assert.equal(v.schnipsel[1].text, 'Zweiter\nmit zweiter Zeile');
  assert.ok(v.schnipsel[0].wann > 0 && v.schnipsel[0].wann <= Date.now() + 86400000, 'Datum ohne Jahr liegt nie in der Zukunft');
});

test('erkenneEinfuegeInhalt: das Eindeutige zuerst, Text zuletzt', async () => {
  const k = await frisch();
  const e = (t) => roh(k.erkenneEinfuegeInhalt(t)).art;
  assert.equal(e(''), 'leer');
  assert.equal(e('   \n '), 'leer');
  assert.equal(e('VANI1-abcdefghijklmnop'), 'kopplungscode');
  assert.equal(e('  VANI1-abcdefghijklmnop\n'), 'kopplungscode', 'Leerraum drumherum ist egal');
  assert.equal(e('VANI1-kurz'), 'text', 'zu kurz für einen Code');
  assert.equal(e(JSON.stringify({ vani: 2, wann: 1, docs: [{ id: 'a', typ: 'schnipsel', text: 'x' }] })), 'sicherung');
  assert.equal(e('{"vani":2,"docs":[{"id":"a","typ":"schn'), 'kaputt');
  assert.equal(roh(k.erkenneEinfuegeInhalt('{"vani":2,"docs":[{"id":"a","typ":"schn')).grund, 'unvollstaendig');
  assert.equal(roh(k.erkenneEinfuegeInhalt('{"irgendwas": 1}')).grund, 'fremd');
  assert.equal(e('══ HEFT: X ══\n· S\nText'), 'vanitext');
  assert.equal(e('12.03.23, 14:05 - Ich: a\n12.03.23, 14:06 - Ich: b\n12.03.23, 14:07 - Ich: c'), 'whatsapp');
  assert.equal(e('12.03.23, 14:05 - Ich: a\n12.03.23, 14:06 - Ich: b'), 'text', 'zwei Zeilen sind noch kein Verlauf');
  assert.equal(e('# A\nx\n# B\ny'), 'gegliedert');
  assert.equal(e('# Nur eine Überschrift\ntext'), 'text');
  assert.equal(e('﻿# A\nx\n# B\ny'), 'gegliedert', 'eine BOM stört nicht');
});

test('ankunftZusammenfassen: zählt nach Typ in fester Reihenfolge und summiert Wörter', async () => {
  const k = await frisch();
  const z = roh(k.ankunftZusammenfassen([
    { typ: 'seite', text: 'ein zwei drei' }, { typ: 'heft' }, { typ: 'seite', text: 'vier' }, { typ: 'projekt' }, { typ: 'fremd' }, null
  ], 2));
  assert.deepEqual(z.zeilen, ['1 Projekt', '1 Heft', '2 Seiten', '1 fremd', '2 Bilder und Dateien']);
  assert.equal(z.woerter, 4);
  assert.equal(z.gesamt, 6);
});

test('sicherungEinspielen + baueSicherungsPaket: Dazulegen lässt Vorhandenes stehen, Ersetzen räumt auf', async () => {
  const k = await frisch();
  k.D.docs.set('alt', { id: 'alt', typ: 'schnipsel', text: 'alt' });
  await k.dbPut('docs', k.D.docs.get('alt'));
  const paket = { vani: 2, wann: Date.now(), docs: [{ id: 'alt', typ: 'schnipsel', text: 'anders' }, { id: 'neu', typ: 'schnipsel', text: 'neu' }], media: {}, sync: [] };
  const dazu = roh(await k.sicherungEinspielen(paket, 'dazu'));
  assert.equal(dazu.neu.length, 1);
  assert.equal(dazu.uebersprungen, 1);
  assert.equal(k.D.docs.get('alt').text, 'alt', 'Dazulegen überschreibt nichts');
  const ersetzt = roh(await k.sicherungEinspielen(paket, 'ersetzen'));
  assert.equal(ersetzt.neu.length, 2);
  assert.equal(k.D.docs.get('alt').text, 'anders');
  const p = roh(await k.baueSicherungsPaket({ mitMedien: false }));
  assert.equal(p.vani, 2);
  assert.equal(p.docs.length, 2);
  assert.deepEqual(p.media, {});
  assert.ok(k.pruefeSicherung(p), 'was wir packen, nehmen wir auch wieder an');
});
