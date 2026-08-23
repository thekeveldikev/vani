/* Der Kalender (61): Er muss wirklich rechnen. Falsche Wochentage, falsche
   Schaltjahre oder ein falsch berechnetes Alter machen ihn wertlos — deshalb
   wird hier gegen echte, nachprüfbare Daten geprüft. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }
/* Termine bauen, ohne durch die Datenbank zu gehen */
function termin(k, felder) {
  const t = k.saubererTermin(felder);
  assert.ok(t, 'Termin sollte gültig sein: ' + JSON.stringify(felder));
  const d = { id: felder.id || ('t' + Math.round(k.kalZeit ? 0 : 0) + Object.keys(felder).length + (felder.wann || '')), typ: 'termin', angelegt: 1, geaendert: 1, ...t };
  d.id = felder.id || (felder.wann + ':' + t.art + ':' + (t.titel || '') + ':' + (t.leute[0] || {}).name);
  k.D.docs.set(d.id, d);
  return d;
}

test('Schaltjahre und Monatslängen stimmen', async () => {
  const k = await frisch();
  assert.equal(k.kalSchaltjahr(2000), true, '2000 ist ein Schaltjahr (durch 400 teilbar)');
  assert.equal(k.kalSchaltjahr(2024), true);
  assert.equal(k.kalSchaltjahr(2025), false);
  assert.equal(k.kalSchaltjahr(2100), false, '2100 ist keines (durch 100, nicht durch 400)');
  assert.equal(k.kalMonatstage(2024, 2), 29);
  assert.equal(k.kalMonatstage(2025, 2), 28);
  assert.equal(k.kalMonatstage(2025, 4), 30);
  assert.equal(k.kalMonatstage(2025, 12), 31);
  assert.equal(k.kalGueltig('2024-02-29'), true, 'den 29. Februar gibt es 2024');
  assert.equal(k.kalGueltig('2025-02-29'), false, 'und 2025 nicht');
  assert.equal(k.kalGueltig('2025-13-01'), false);
  assert.equal(k.kalGueltig('1999-01-01'), true, 'auch 1999 — der Kalender reicht bis 1600 zurück');
  assert.equal(k.kalGueltig('1599-12-31'), false, 'vor 1600 reicht er nicht');
  assert.equal(k.kalGueltig('2051-01-01'), false, 'nach 2050 auch nicht');
  assert.equal(k.kalGueltig('2000-01-01'), true);
  assert.equal(k.kalGueltig('2050-12-31'), true);
});

test('Die Wochentage stimmen mit dem echten Kalender überein', async () => {
  const k = await frisch();
  /* Nachprüfbar: der 1. Januar 2000 war ein Samstag. */
  assert.equal(k.KAL_TAGE_KURZ[k.kalWochentag('2000-01-01')], 'Sa');
  assert.equal(k.KAL_TAGE_KURZ[k.kalWochentag('2024-02-29')], 'Do', 'der Schalttag 2024 war ein Donnerstag');
  assert.equal(k.KAL_TAGE_KURZ[k.kalWochentag('2026-08-23')], 'So', 'heute ist ein Sonntag');
  assert.equal(k.KAL_TAGE_KURZ[k.kalWochentag('2050-12-31')], 'Sa');
  /* Gegen die eingebaute Datumsrechnung, quer über fünfzig Jahre */
  for (let jahr = 2000; jahr <= 2050; jahr += 7) {
    for (const [m, t] of [[1, 1], [2, 28], [6, 15], [11, 30], [12, 31]]) {
      const s = k.kalDatum(jahr, m, t);
      const echt = (new Date(Date.UTC(jahr, m - 1, t)).getUTCDay() + 6) % 7;
      assert.equal(k.kalWochentag(s), echt, s);
    }
  }
});

test('Die Kalenderwoche folgt der Norm', async () => {
  const k = await frisch();
  /* Nachprüfbar: der 1. Januar 2021 (Freitag) liegt noch in KW 53 von 2020. */
  assert.equal(k.kalWoche('2021-01-01'), 53);
  assert.equal(k.kalWoche('2021-01-04'), 1, 'der Montag danach ist KW 1');
  assert.equal(k.kalWoche('2026-01-01'), 1, '2026 beginnt an einem Donnerstag: KW 1');
  assert.equal(k.kalWoche('2024-12-30'), 1, 'der 30.12.2024 gehört schon zur KW 1 von 2025');
  assert.equal(k.kalWoche('2026-08-23'), 34);
});

test('Ein Monat wird als volles Raster ausgelegt', async () => {
  const k = await frisch();
  const wochen = k.kalRaster(2026, 8);
  assert.equal(wochen.length, 6, 'immer sechs Zeilen, damit nichts springt');
  assert.equal(wochen[0].tage.length, 7);
  assert.equal(wochen[0].tage[0].datum, '2026-07-27', 'die Zeile beginnt am Montag davor');
  assert.equal(wochen[0].tage[0].fremd, true);
  const erster = wochen.flatMap((w) => w.tage).find((t) => t.datum === '2026-08-01');
  assert.equal(erster.fremd, false);
  assert.equal(k.KAL_TAGE_KURZ[k.kalWochentag(erster.datum)], 'Sa');
  const eigene = wochen.flatMap((w) => w.tage).filter((t) => !t.fremd);
  assert.equal(eigene.length, 31, 'der August hat 31 Tage');
  assert.equal(wochen[0].kw, 31);
  /* Februar 2026 beginnt an einem Sonntag — der schwierigste Fall */
  const feb = k.kalRaster(2026, 2);
  assert.equal(feb[0].tage[0].datum, '2026-01-26');
  assert.equal(feb.flatMap((w) => w.tage).filter((t) => !t.fremd).length, 28);
});

test('Das Alter wird auf Jahr, Monat und Tag genau gerechnet', async () => {
  const k = await frisch();
  const a = k.kalAlter('2000-05-17', '2026-08-23');
  assert.equal(JSON.stringify(pick(a)), JSON.stringify({ j: 26, m: 3, t: 6 }));
  assert.equal(a.genau, true);
  /* Einen Tag vor dem Geburtstag ist man noch nicht älter */
  assert.equal(k.kalAlter('2000-05-17', '2026-05-16').jahre, 25);
  assert.equal(k.kalAlter('2000-05-17', '2026-05-17').jahre, 26, 'am Geburtstag selbst schon');
  /* Der Monatsübertrag muss über die richtige Monatslänge laufen */
  assert.equal(JSON.stringify(pick(k.kalAlter('2024-01-31', '2024-03-01'))), JSON.stringify({ j: 0, m: 1, t: 1 }), 'vom 31. Januar ist der 1. Maerz ein Monat und ein Tag');
  assert.equal(JSON.stringify(pick(k.kalAlter('2000-02-29', '2026-02-28'))), JSON.stringify({ j: 25, m: 11, t: 30 }));
  /* Vor der Geburt gibt es kein Alter */
  assert.equal(k.kalAlter('2020-01-01', '2019-01-01'), null);
  /* Ist nur das Jahr bekannt, ist das Alter ungefähr */
  const b = k.kalAlter('2000', '2026-08-23');
  assert.equal(b.genau, false);
  assert.ok(k.kalAlterText(b).startsWith('etwa '), k.kalAlterText(b));
  assert.equal(k.kalAlterText(k.kalAlter('2000-05-17', '2026-08-23')), '26 Jahre');
  assert.equal(k.kalAlterText(k.kalAlter('2026-01-01', '2026-01-02')), 'einen Tag alt');
  assert.equal(k.kalAlterText(k.kalAlter('2025-08-01', '2026-08-23')), 'ein Jahr');
  assert.equal(k.kalAlterText(k.kalAlter('2025-06-01', '2026-08-23')), 'ein Jahr und 2 Monate');
  function pick(x) { return { j: x.jahre, m: x.monate, t: x.tage }; }
});

test('Ungenaue Daten sind erlaubt und bleiben ungenau', async () => {
  const k = await frisch();
  assert.equal(k.kalTeile('2026').genau, 'jahr');
  assert.equal(k.kalTeile('2026-08').genau, 'monat');
  assert.equal(k.kalTeile('2026-08-23').genau, 'tag');
  assert.equal(k.kalDatum(2026, 8), '2026-08', 'einstellige Monate werden aufgefüllt');
  assert.equal(k.kalDatum(2026, 8, 3), '2026-08-03');
  assert.equal(k.kalLesbar('2026'), '2026');
  assert.equal(k.kalLesbar('2026-08'), 'August 2026');
  assert.equal(k.kalLesbar('2026-08-23'), '23. August 2026');
  assert.equal(k.kalLesbar('2026-08-23', true), 'Sonntag, 23. August 2026');
  assert.equal(k.kalKurz('2026-08-23'), '23. Aug 2026');
  assert.equal(k.kalJahreszeit('2026-08-23'), 'Sommer');
  assert.equal(k.kalJahreszeit('2026-12-22'), 'Winter');
  assert.equal(k.kalJahreszeit('2026-03-20'), 'Frühling');
});

test('Ein Termin wird sauber angenommen — oder abgewiesen', async () => {
  const k = await frisch();
  const t = k.saubererTermin({ wann: '2026-8-3', art: 'unfug', titel: 'x'.repeat(500), leute: ['Mira', { name: 'Jonas', id: 'f1' }, { name: '' }, 42] });
  assert.equal(t.wann, '2026-08-03', 'das Datum wird in eine Form gebracht');
  assert.equal(t.art, 'ereignis', 'eine unbekannte Art wird zur allgemeinen');
  assert.equal(t.titel.length, 200, 'zu lange Titel werden gekappt');
  assert.equal(JSON.stringify(t.leute), JSON.stringify([{ id: '', name: 'Mira' }, { id: 'f1', name: 'Jonas' }]), 'Namenlose fallen heraus');
  assert.equal(k.saubererTermin({ wann: '1598-01-01' }), null, 'außerhalb des Bereichs: kein Termin');
  assert.ok(k.saubererTermin({ wann: '1783-04-09' }), 'innerhalb aber schon — der Kalender reicht bis 1600');
  assert.equal(k.saubererTermin({}), null);
  assert.equal(k.saubererTermin({ wann: '2026-02-30' }), null, 'den 30. Februar gibt es nicht');
  /* Ein Ende vor dem Anfang wird verworfen, nicht übernommen */
  assert.equal(k.saubererTermin({ wann: '2026-05-01', bis: '2026-04-01' }).bis, '');
  assert.equal(k.saubererTermin({ wann: '2026-05-01', bis: '2026-06-01' }).bis, '2026-06-01');
});

test('Geburtstage kehren wieder — bis zum Tod', async () => {
  const k = await frisch();
  termin(k, { wann: '2000-05-17', art: 'geburt', titel: 'Mira kommt zur Welt', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2019-11-02', art: 'tod', titel: 'Mira stirbt', leute: [{ name: 'Mira' }] });
  const alle = k.kalTermine();
  assert.equal(alle.length, 2);
  assert.equal(k.kalAmTag('2000-05-17', alle).length, 1, 'am Tag der Geburt');
  assert.equal(k.kalAmTag('2012-05-17', alle).length, 1, 'und an jedem Geburtstag danach');
  assert.equal(k.kalAmTag('2012-05-18', alle).length, 0);
  assert.equal(k.kalAmTag('1999-05-17', alle).length, 0, 'vorher nicht');
  assert.equal(k.kalAmTag('2020-05-17', alle).length, 0, 'nach dem Tod wird nicht mehr gefeiert');
  assert.equal(k.kalAmTag('2019-11-02', alle).length, 1, 'der Todestag steht');
});

test('Der 29. Februar rückt in normalen Jahren auf den 28.', async () => {
  const k = await frisch();
  termin(k, { wann: '2004-02-29', art: 'geburt', titel: 'Schalttagskind', leute: [{ name: 'Elin' }] });
  const alle = k.kalTermine();
  assert.equal(k.kalAmTag('2008-02-29', alle).length, 1, 'im Schaltjahr am 29.');
  assert.equal(k.kalAmTag('2025-02-28', alle).length, 1, 'sonst am 28.');
  assert.equal(k.kalAmTag('2025-03-01', alle).length, 0);
});

test('Zeiträume decken jeden Tag dazwischen ab', async () => {
  const k = await frisch();
  termin(k, { wann: '2026-03-10', bis: '2026-03-14', art: 'reise', titel: 'Die Fahrt nach Norden', leute: [{ name: 'Jonas' }] });
  const alle = k.kalTermine();
  assert.equal(k.kalAmTag('2026-03-09', alle).length, 0);
  assert.equal(k.kalAmTag('2026-03-10', alle).length, 1);
  assert.equal(k.kalAmTag('2026-03-12', alle).length, 1, 'mitten in der Reise');
  assert.equal(k.kalAmTag('2026-03-14', alle).length, 1);
  assert.equal(k.kalAmTag('2026-03-15', alle).length, 0);
});

test('Der Kalender weiß, wer wie alt wurde', async () => {
  const k = await frisch();
  termin(k, { wann: '2000-05-17', art: 'geburt', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2019-11-02', art: 'tod', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2014-06-01', art: 'begegnung', titel: 'Mira trifft Jonas', leute: [{ name: 'Mira' }, { name: 'Jonas' }] });
  const leute = k.kalLeute();
  const mira = leute.find((p) => p.name === 'Mira');
  assert.equal(mira.geburt, '2000-05-17');
  assert.equal(mira.tod, '2019-11-02');
  assert.equal(k.kalLebensalter(mira).jahre, 19, 'Mira wurde 19');
  assert.equal(k.kalLeute().find((p) => p.name === 'Jonas').geburt, '', 'Jonas hat kein Geburtsdatum');
  /* Und der Chronistensatz nennt das Alter am Tag der Begegnung */
  const treffen = k.kalTermine().find((t) => t.art === 'begegnung');
  const satz = k.kalSatz(treffen);
  assert.ok(satz.includes('Mira trifft Jonas'), satz);
  assert.ok(satz.includes('1. Juni 2014'), satz);
  assert.ok(satz.includes('Mira: 14 Jahre'), satz);
  assert.ok(!satz.includes('Jonas: '), 'ohne Geburtsdatum kein Alter: ' + satz);
});

test('Der Kalender meldet, was nicht sein kann', async () => {
  const k = await frisch();
  termin(k, { wann: '2010-01-01', art: 'geburt', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2020-01-01', art: 'tod', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2005-06-01', art: 'begegnung', titel: 'Zu früh', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2025-06-01', art: 'reise', titel: 'Zu spät', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2015-06-01', art: 'fund', titel: 'Passt', leute: [{ name: 'Mira' }] });
  const w = k.kalWidersprueche();
  assert.equal(w.length, 2, 'genau zwei Widersprüche: ' + JSON.stringify(w.map((x) => x.text)));
  assert.ok(w.some((x) => x.art === 'vorGeburt' && x.text.includes('geboren aber erst')), JSON.stringify(w));
  assert.ok(w.some((x) => x.art === 'nachTod' && x.text.includes('gestorben aber schon')), JSON.stringify(w));
});

test('Zwei Geburtsdaten für dieselbe Person fallen auf', async () => {
  const k = await frisch();
  termin(k, { id: 'a', wann: '2010-01-01', art: 'geburt', leute: [{ name: 'Mira' }] });
  termin(k, { id: 'b', wann: '2011-03-04', art: 'geburt', leute: [{ name: 'Mira' }] });
  const w = k.kalWidersprueche();
  assert.ok(w.some((x) => x.art === 'doppelt' && x.text.includes('2 Geburtsdaten')), JSON.stringify(w));
  /* Und ein Tod vor der Geburt ebenfalls */
  const k2 = await frisch();
  termin(k2, { wann: '2020-01-01', art: 'geburt', leute: [{ name: 'Ruth' }] });
  termin(k2, { wann: '2010-01-01', art: 'tod', leute: [{ name: 'Ruth' }] });
  assert.ok(k2.kalWidersprueche().some((x) => x.art === 'reihenfolge'), 'stirbt vor der eigenen Geburt');
});

test('Jahrestage schauen zurück, nie nach vorn', async () => {
  const k = await frisch();
  termin(k, { wann: '2014-08-23', art: 'bund', titel: 'Der Schwur am Fluss', leute: [{ name: 'Mira' }] });
  termin(k, { wann: '2030-08-23', art: 'reise', titel: 'Später einmal' });
  const j = k.kalJahrestage('2026-08-23');
  assert.equal(j.length, 1);
  assert.equal(j[0].jahre, 12, 'zwölf Jahre her');
  assert.equal(j[0].termin.titel, 'Der Schwur am Fluss');
});

test('Die Jahresübersicht zählt richtig', async () => {
  const k = await frisch();
  termin(k, { wann: '2026-03-10', art: 'reise', titel: 'A' });
  termin(k, { wann: '2026-03-22', art: 'fund', titel: 'B' });
  termin(k, { wann: '2026-11-05', art: 'wunde', titel: 'C' });
  termin(k, { wann: '2001-07-07', art: 'geburt', leute: [{ name: 'Nils' }] });
  const z = k.kalJahresZaehlung(2026);
  assert.equal(z[2], 2, 'zwei im März');
  assert.equal(z[10], 1, 'einer im November');
  assert.equal(z[6], 1, 'und der Geburtstag im Juli kehrt jedes Jahr wieder');
  assert.equal(JSON.stringify(k.kalJahreMitInhalt().slice(0, 2)), '[2001,2026]');
});

test('Der Kalender sortiert wie ein Kalender', async () => {
  const k = await frisch();
  termin(k, { wann: '2026-05-05', art: 'tod', titel: 'Ende', leute: [{ name: 'X' }] });
  termin(k, { wann: '2026-05-05', art: 'geburt', titel: 'Anfang', leute: [{ name: 'Y' }] });
  termin(k, { wann: '2026-05-05', art: 'fund', titel: 'Mitte' });
  termin(k, { wann: '2026-01-01', art: 'reise', titel: 'Früher' });
  const s = k.kalSortiert(k.kalTermine()).map((t) => t.titel);
  assert.equal(JSON.stringify(s), JSON.stringify(['Früher', 'Anfang', 'Mitte', 'Ende']), 'am selben Tag: erst geboren, dann gelebt, dann gestorben');
});

test('Der Kalender reicht bis 1600 zurück — gezeigt wird er trotzdem ab 2000', async () => {
  const k = await frisch();
  assert.equal(k.KAL_JAHR_VON, 1600, 'so weit reicht er');
  assert.equal(k.KAL_ZEIGE_VON, 2000, 'so weit fängt er an zu zeigen');
  assert.equal(k.kalGueltig('1783-04-09'), true);
  assert.equal(k.kalGueltig('1600-01-01'), true);
  assert.equal(k.kalGueltig('1599-12-31'), false);
  assert.equal(k.kalGueltig('2051-01-01'), false);
  /* Das Alter rechnet über Jahrhunderte hinweg richtig — auch über 1700 und
     1800 hinweg, die keine Schaltjahre waren */
  assert.equal(k.kalAlter('1783-04-09', '1845-04-08').jahre, 61, 'einen Tag vor dem Geburtstag');
  assert.equal(k.kalAlter('1783-04-09', '1845-04-09').jahre, 62);
  assert.equal(k.kalGueltig('1700-02-29'), false, '1700 war kein Schaltjahr');
  assert.equal(k.kalGueltig('1600-02-29'), true, '1600 aber schon');
});

test('Die Ansicht fängt bei 2000 an — und weiter unten nur, wenn dort etwas steht', async () => {
  const k = await frisch();
  assert.equal(k.kalZeigeVon([]), 2000, 'ohne Inhalt kein leeres Jahrhundert zeichnen');
  assert.equal(k.kalZeigeVon([{ wann: '2011-04-09' }]), 2000, 'was nach 2000 liegt, verschiebt nichts');
  assert.equal(k.kalZeigeVon([{ wann: '1783-04-09' }]), 1783, 'wo wirklich etwas steht, reicht sie hin');
  assert.equal(k.kalZeigeVon([{ wann: '1783-04-09' }, { wann: '1899-01-01' }]), 1783, 'bis zum frühesten');
  assert.equal(k.kalZeigeVon([{ wann: 'unfug' }]), 2000, 'Unsinn verschiebt nichts');
  /* Aufklappen von Hand geht bis 1600, aber nie darüber hinaus */
  assert.equal(k.kalZeigeVon([], 1650), 1650);
  assert.equal(k.kalZeigeVon([], 1200), 1600, 'weiter als der Kalender geht es nicht');
  assert.equal(k.kalZeigeVon([], 2030), 2000, 'nach oben verschiebt es die Ansicht nicht');
});

test('Ein Datum darf so hineingeschrieben werden, wie man es sagt', async () => {
  const k = await frisch();
  /* Gespeichert wird immer 1783-04-09. Tippen soll man das nicht müssen. */
  assert.equal(k.kalAusText('9.4.1783'), '1783-04-09');
  assert.equal(k.kalAusText('09.04.1783'), '1783-04-09');
  assert.equal(k.kalAusText('9. 4. 1783'), '1783-04-09');
  assert.equal(k.kalAusText('9. April 1783'), '1783-04-09');
  assert.equal(k.kalAusText('9. Apr 1783'), '1783-04-09');
  assert.equal(k.kalAusText('9 April 1783'), '1783-04-09');
  assert.equal(k.kalAusText('31. März 2020'), '2020-03-31');
  assert.equal(k.kalAusText('1. Dezember 2011'), '2011-12-01');
  /* Nur Monat und Jahr, nur Jahr */
  assert.equal(k.kalAusText('April 1783'), '1783-04');
  assert.equal(k.kalAusText('Apr. 1783'), '1783-04');
  assert.equal(k.kalAusText('Sept 2011'), '2011-09');
  assert.equal(k.kalAusText('4.1783'), '1783-04');
  assert.equal(k.kalAusText('1783'), '1783');
  /* Die gespeicherte Form selbst bleibt gültig und wird auf Form gebracht */
  assert.equal(k.kalAusText('1783-04-09'), '1783-04-09');
  assert.equal(k.kalAusText('1783-4-9'), '1783-04-09');
  /* Zweistellige Jahre: 51–99 ins vorige Jahrhundert, alles darunter in dieses */
  assert.equal(k.kalAusText('9.4.83'), '1983-04-09');
  assert.equal(k.kalAusText('1. Mai 26'), '2026-05-01');
  /* Was nicht aufgeht, wird nicht erfunden */
  assert.equal(k.kalAusText('30.2.1783'), '', 'den 30. Februar gibt es nicht');
  assert.equal(k.kalAusText('13.13.1783'), '', 'den dreizehnten Monat auch nicht');
  assert.equal(k.kalAusText('9.4.1500'), '', 'vor 1600 reicht der Kalender nicht');
  assert.equal(k.kalAusText('9.4'), '', 'ohne Jahr kein Datum');
  assert.equal(k.kalAusText('irgendwann'), '');
  assert.equal(k.kalAusText(''), '');
  assert.equal(k.kalAusText(null), '');
  /* Umlaute im Monatsnamen sind egal */
  assert.equal(k.kalMonatAus('März'), 3);
  assert.equal(k.kalMonatAus('Maerz'), 3);
  assert.equal(k.kalMonatAus('marz'), 3);
  assert.equal(k.kalMonatAus('Dez'), 12);
  assert.equal(k.kalMonatAus('gibtsnicht'), null);
  assert.equal(k.kalMonatAus('13'), null);
});

test('Was hineingeschrieben wurde, lässt sich auch wieder lesen', async () => {
  const k = await frisch();
  /* Hin und zurück: was VANI anzeigt, versteht VANI auch wieder. */
  for (const roh of ['9.4.1783', '31. März 2020', 'April 1783', '1783', '1. Dezember 2011']) {
    const gespeichert = k.kalAusText(roh);
    assert.ok(gespeichert, 'gelesen: ' + roh);
    const angezeigt = k.kalLesbar(gespeichert);
    assert.equal(k.kalAusText(angezeigt), gespeichert, 'hin und zurück: ' + roh + ' → ' + angezeigt);
  }
});
