/* Das Sicherheitsnetz (32): Speichern mit Anläufen, Rettungskopie, Protokoll,
   Wochensicherung. Geprüft wird das, worauf es ankommt: dass ein hakender
   Speicher nicht sofort aufgibt, dass ein Fehler nicht verschluckt wird und
   dass der Text auch dann noch da ist, wenn die Datenbank streikt. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }

/* Lässt den Hauptspeicher für einen Laden n-mal zicken — danach geht er wieder.
   Gibt einen Zähler zurück, der sagt, wie oft geschrieben werden wollte. */
function speicherZicken(k, laden, malFehler) {
  const dbs = k.indexedDB._alles;
  const db = dbs[Object.keys(dbs)[0]];
  const echt = db.stores[laden];
  let versuche = 0;
  db.stores[laden] = {
    set: (a, b) => { versuche++; if (versuche <= malFehler) throw new Error('QuotaExceededError'); return echt.set(a, b); },
    get: (a) => echt.get(a), delete: (a) => echt.delete(a), clear: () => echt.clear(),
    values: () => echt.values()
  };
  return { zaehler: () => versuche, zurueck: () => { db.stores[laden] = echt; } };
}

test('Speichern gibt nicht beim ersten Fehler auf', async () => {
  const k = await frisch();
  const zick = speicherZicken(k, 'kv', 2);      /* zweimal Fehler, beim dritten Mal klappt es */
  const t0 = Date.now();
  const ok = await k.sicherSpeichern('kv', { probe: 1 }, 'probe');
  assert.equal(ok, true, 'beim dritten Anlauf klappt es');
  assert.equal(zick.zaehler(), 3, 'es wurde dreimal versucht');
  assert.ok(Date.now() - t0 >= 900, 'mit wachsender Pause dazwischen: ' + (Date.now() - t0) + ' ms');
  assert.equal(k.speicherZustand().art, 'gesichert');
  assert.equal(k.speicherZustand().fehler, 0);
  assert.deepEqual(await k.dbGet('kv', 'probe'), { probe: 1 }, 'und es steht wirklich drin');
  zick.zurueck();
});

test('Wenn alle Anläufe scheitern, wird es gemeldet und notiert — nicht verschluckt', async () => {
  const k = await frisch();
  k.protokollLoeschen();
  const zick = speicherZicken(k, 'kv', 99);
  const ok = await k.sicherSpeichern('kv', { probe: 2 }, 'probe2');
  assert.equal(ok, false);
  assert.equal(zick.zaehler(), 3, 'dreimal versucht, dann ehrlich aufgegeben');
  const z = k.speicherZustand();
  assert.equal(z.art, 'fehler');
  assert.equal(z.fehler, 1);
  assert.ok(z.letzterFehler.includes('QuotaExceededError'), z.letzterFehler);
  const prot = k.protokollLesen();
  assert.equal(prot.length, 1, 'genau ein Protokolleintrag');
  assert.equal(prot[0].art, 'speichern');
  assert.ok(prot[0].mehr.includes('probe2'), 'mit Laden und Schlüssel: ' + prot[0].mehr);
  /* Und wenn es wieder geht, heilt der Zustand von selbst */
  zick.zurueck();
  await k.sicherSpeichern('kv', { probe: 3 }, 'probe3');
  assert.equal(k.speicherZustand().art, 'gesichert');
  assert.equal(k.speicherZustand().fehler, 0);
  k.protokollLoeschen();
});

test('Die Rettungskopie hält den Text fest und meldet sich nur, wenn etwas fehlt', async () => {
  const k = await frisch();
  k.rettungLoeschen();
  assert.equal(k.rettungLesen(), null);
  assert.equal(k.rettungPruefen(), null, 'ohne Kopie gibt es nichts zu retten');
  /* Ein Text, der so noch nicht im Hauptspeicher steht */
  const doc = k.sauberesDokument({ id: 'd1', typ: 'blatt', titel: 'Probe', text: 'Erster Satz.', angelegt: 1, geaendert: 1000 });
  k.D.docs.set(doc.id, doc);
  k.rettungSchreiben('d1', 'Probe', 'Erster Satz. Und der zweite, der noch fehlt.');
  const fund = k.rettungPruefen();
  assert.ok(fund, 'der fehlende Satz wird gefunden');
  assert.equal(fund.doc.id, 'd1');
  assert.ok(fund.rettung.text.includes('der zweite'));
  /* Steht derselbe Text schon drin, meldet sich nichts — und die Kopie räumt sich weg */
  k.rettungSchreiben('d1', 'Probe', 'Erster Satz.');
  assert.equal(k.rettungPruefen(), null);
  assert.equal(k.rettungLesen(), null, 'die überflüssige Kopie ist weg');
  /* Ist der Hauptspeicher neuer und länger, gilt er */
  doc.text = 'Erster Satz. Zweiter Satz. Dritter Satz.'; doc.geaendert = 9000;
  k.rettungSchreiben('d1', 'Probe', 'Erster Satz. Zweiter.');
  const r2 = k.rettungLesen(); r2.wann = 1000;
  k.localStorage.setItem('vani-rettung', JSON.stringify(r2));
  assert.equal(k.rettungPruefen(), null, 'der neuere Hauptspeicher gewinnt');
  /* Ein Text ohne Dokument bleibt ein Fund — daraus wird ein neues Blatt */
  k.rettungSchreiben('', '', 'Ein Text ohne Zuhause.');
  const fund2 = k.rettungPruefen();
  assert.ok(fund2 && !fund2.doc);
  k.rettungLoeschen();
});

test('Die Rettungskopie überlebt kaputte Daten und sehr lange Texte', async () => {
  const k = await frisch();
  k.localStorage.setItem('vani-rettung', '{kein json');
  assert.equal(k.rettungLesen(), null, 'kaputte Daten stürzen nicht ab');
  assert.equal(k.rettungPruefen(), null);
  k.rettungSchreiben('x', 'T', 'a'.repeat(500000));
  assert.equal(k.rettungLesen().text.length, 400000, 'sehr lange Texte werden gekappt, nicht verworfen');
  assert.equal(k.rettungSchreiben('x', 'T', null), false, 'ohne Text keine Kopie');
  k.rettungLoeschen();
});

test('Der Text überlebt, auch wenn der Hauptspeicher ganz ausfällt', async () => {
  const k = await frisch();
  k.protokollLoeschen(); k.rettungLoeschen();
  const zick = speicherZicken(k, 'docs', 99);
  const doc = k.sauberesDokument({ id: 'd9', typ: 'blatt', titel: 'Im Sturm', text: '', angelegt: 1, geaendert: 1 });
  k.D.docs.set(doc.id, doc);
  doc.text = 'Der Satz, der nicht verlorengehen darf.';
  k.rettungSchreiben(doc.id, doc.titel, doc.text);          /* Netz 2 läuft beim Tippen mit */
  assert.equal(await k.sicherSpeichern('docs', doc), false, 'Netz 1 fällt aus');
  zick.zurueck();
  /* Nach dem Neustart ist der Satz noch da */
  const frischesDoc = k.sauberesDokument({ id: 'd9', typ: 'blatt', titel: 'Im Sturm', text: '', angelegt: 1, geaendert: 1 });
  k.D.docs.set('d9', frischesDoc);
  const fund = k.rettungPruefen();
  assert.ok(fund && fund.rettung.text.includes('nicht verlorengehen'), 'die Rettungskopie hat ihn');
  k.protokollLoeschen(); k.rettungLoeschen();
});

test('Das Protokoll bleibt klein und kippt nicht um', async () => {
  const k = await frisch();
  k.protokollLoeschen();
  for (let i = 0; i < 60; i++) k.protokollSchreiben('probe', 'Fehler ' + i);
  const p = k.protokollLesen();
  assert.equal(p.length, 40, 'höchstens vierzig Einträge');
  assert.ok(p[p.length - 1].text.includes('59'), 'die neuesten bleiben');
  assert.ok(p[0].text.includes('20'), 'die ältesten fallen hinten heraus');
  k.localStorage.setItem('vani-protokoll', 'kaputt');
  assert.equal(k.protokollLesen().length, 0, 'kaputtes Protokoll gibt eine leere Liste');
  k.protokollLoeschen();
});

test('Zahlen in Bytes bleiben lesbar', async () => {
  const k = await frisch();
  assert.equal(k.bytesLesbar(512), '512 B');
  assert.equal(k.bytesLesbar(2048), '2 KB');
  assert.equal(k.bytesLesbar(5 * 1048576), '5.0 MB');
  assert.equal(k.bytesLesbar(3 * 1073741824), '3.00 GB');
  assert.equal(k.bytesLesbar(undefined), '—');
});

test('Die Wochensicherung wird fällig, wenn eine Woche vorbei ist', async () => {
  const k = await frisch();
  assert.equal(k.SICHERUNG_ABSTAND, 7 * 86400000);
  assert.equal(await k.sicherungAutoFaellig(), true, 'ohne Sicherung ist sie sofort fällig');
  await k.dbPut('kv', { wann: Date.now(), texte: 3, paket: {} }, 'sicherung-auto');
  assert.equal(await k.sicherungAutoFaellig(), false, 'frisch gesichert: nicht fällig');
  await k.dbPut('kv', { wann: Date.now() - 8 * 86400000, texte: 3, paket: {} }, 'sicherung-auto');
  assert.equal(await k.sicherungAutoFaellig(), true, 'nach acht Tagen wieder fällig');
});

test('Gelöscht wird erst, wenn der Papierkorb den Inhalt wirklich hat', async () => {
  const k = await frisch();
  const doc = k.sauberesDokument({ id: 'w1', typ: 'blatt', titel: 'Prüfblatt', text: 'Dieser Satz darf nicht verschwinden.', angelegt: 1, geaendert: 1 });
  k.D.docs.set(doc.id, doc);
  await k.dbPut('docs', doc);

  /* Der Papierkorb streikt — dann darf nichts gelöscht werden */
  const zick = speicherZicken(k, 'papierkorb', 99);
  await k.loesche('w1', true);
  assert.equal(k.D.docs.has('w1'), true, 'der Text ist noch da');
  assert.equal(k.D.docs.get('w1').text, 'Dieser Satz darf nicht verschwinden.');
  assert.ok(await k.dbGet('docs', 'w1'), 'und steht auch noch in der Datenbank');
  zick.zurueck();

  /* Jetzt richtig: löschen, im Papierkorb wiederfinden, zurückholen */
  await k.loesche('w1', true);
  assert.equal(k.D.docs.has('w1'), false, 'jetzt ist er weg');
  const koerbe = await k.dbAlle('papierkorb');
  const meiner = koerbe.find((b) => (b.docs || []).some((d) => d.id === 'w1'));
  assert.ok(meiner, 'und liegt im Papierkorb');
  assert.equal(await k.holeZurueck(meiner.id), true);
  assert.equal(k.D.docs.get('w1').text, 'Dieser Satz darf nicht verschwinden.', 'vollständig zurück');
});

test('Der Papierkorb bleibt voll, solange nicht alles zurück ist', async () => {
  const k = await frisch();
  const doc = k.sauberesDokument({ id: 'w2', typ: 'blatt', titel: 'Zweites', text: 'Auch dieser bleibt.', angelegt: 1, geaendert: 1 });
  k.D.docs.set(doc.id, doc);
  await k.loesche('w2', true);
  const meiner = (await k.dbAlle('papierkorb')).find((b) => (b.docs || []).some((d) => d.id === 'w2'));
  const zick = speicherZicken(k, 'docs', 99);
  assert.equal(await k.holeZurueck(meiner.id), false, 'ehrlich: hat nicht ganz geklappt');
  zick.zurueck();
  assert.ok(await k.dbGet('papierkorb', meiner.id), 'der Papierkorb hält den Inhalt weiter bereit');
  assert.equal(await k.holeZurueck(meiner.id), true, 'der zweite Anlauf gelingt');
  assert.equal(await k.dbGet('papierkorb', meiner.id), undefined, 'erst jetzt ist er leer');
});

test('Ein Hinweis ohne Bühne wirft keinen zweiten Fehler', async () => {
  const k = await frisch();
  assert.doesNotThrow(() => k.toast('Es gibt noch kein #toasts — das darf nicht knallen.'));
});

test('Formatierte Texte kommen formatiert zurück, nicht nackt', async () => {
  const k = await frisch();
  k.rettungLoeschen();
  const heft = k.sauberesDokument({ id: 'r1', typ: 'blatt', titel: 'Mit Format', format: 'rich', rich: '<p>alt</p>', text: 'alt', angelegt: 1, geaendert: 1 });
  k.rettungSchreiben('r1', 'Mit Format', 'Ein Satz mit Betonung.', '<p>Ein Satz mit <b>Betonung</b>.</p>');
  const r = k.rettungLesen();
  assert.ok(r.html.includes('<b>'), 'die Formatierung liegt mit in der Kopie');
  assert.equal(k.rettungEinsetzen(heft, r), true);
  assert.ok(heft.rich.includes('Betonung'), 'sie landet in doc.rich, wo das Heft sie liest');
  /* Im Sandkasten gibt es kein document — sauberesRichHTML faellt dann auf reinen
     Text zurueck. Dass <b> im Browser stehen bleibt, prueft RICH_TAGS. */
  assert.ok(heft.text.includes('Betonung'), 'und der schlichte Spiegel stimmt auch');

  /* Ohne HTML wird aus dem Text wieder etwas Formatiertes gemacht */
  const heft2 = k.sauberesDokument({ id: 'r2', typ: 'blatt', format: 'rich', rich: '<p>alt</p>', text: 'alt', angelegt: 1, geaendert: 1 });
  k.rettungEinsetzen(heft2, { text: 'Nur schlichter Text.', wann: 1 });
  assert.ok(heft2.rich.includes('Nur schlichter Text.'), 'auch ohne HTML kommt der Satz an: ' + heft2.rich);

  /* Schlichte Texte bleiben schlicht */
  const blatt = k.sauberesDokument({ id: 'r3', typ: 'blatt', text: 'alt', angelegt: 1, geaendert: 1 });
  k.rettungEinsetzen(blatt, { text: 'Neuer Satz.', html: '<p>egal</p>', wann: 1 });
  assert.equal(blatt.text, 'Neuer Satz.');
  assert.equal(blatt.rich, undefined, 'ein schlichtes Blatt bekommt kein rich angehängt');
  k.rettungLoeschen();
});

test('Ist kein Platz für die Formatierung, überlebt wenigstens der Text', async () => {
  const k = await frisch();
  k.rettungLoeschen();
  k.rettungSchreiben('r4', 'Riesig', 'Der Satz zählt.', '<p>' + 'x'.repeat(700000) + '</p>');
  const r = k.rettungLesen();
  assert.equal(r.html, undefined, 'zu viel HTML wird weggelassen');
  assert.equal(r.text, 'Der Satz zählt.', 'der Text bleibt');
  k.rettungLoeschen();
});
