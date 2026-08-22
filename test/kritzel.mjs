/* Kritzeln, zweiter Teil: Lasso, Formen, gespeicherte Striche, Gliederung,
   Tonnotiz-Format. Alles pur — hier mit echten Punktfolgen gefüttert. */
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
const quadrat = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
const strich = (punkte, extra = {}) => ({ farbe: '#000', radierer: false, punkte: punkte.map(([x, y]) => ({ x, y, w: .004 })), ...extra });

test('punktInPolygon und stricheImLasso: ein Strich zählt erst, wenn mehr als die Hälfte drin liegt', async () => {
  const k = await frisch();
  assert.equal(k.punktInPolygon({ x: .5, y: .5 }, quadrat), true);
  assert.equal(k.punktInPolygon({ x: 1.5, y: .5 }, quadrat), false);
  assert.equal(k.punktInPolygon({ x: .5, y: .5 }, [{ x: 0, y: 0 }, { x: 1, y: 0 }]), false, 'zwei Punkte sind kein Polygon');
  const drin = strich([[.2, .2], [.4, .4], [.6, .6]]);
  const halb = strich([[.8, .5], [1.2, .5], [1.6, .5]]);      /* ein Drittel drin */
  const radierer = strich([[.3, .3], [.5, .5]], { radierer: true });
  const leeren = { leeren: true };
  assert.deepEqual(roh(k.stricheImLasso([drin, halb, radierer, leeren], quadrat)), [0]);
  assert.deepEqual(roh(k.stricheImLasso([], quadrat)), []);
});

test('stricheVerschieben: nur die gewählten wandern, und es entstehen neue Objekte', async () => {
  const k = await frisch();
  const a = strich([[0, 0], [.1, .1]]), b = strich([[.5, .5]]);
  const neu = k.stricheVerschieben([a, b], [1], .2, -.1);
  assert.deepEqual(roh(neu[0].punkte), roh(a.punkte));
  assert.deepEqual(roh(neu[1].punkte[0]), { x: .7, y: .4, w: .004 });
  assert.deepEqual(roh(b.punkte[0]), { x: .5, y: .5, w: .004 }, 'das Original bleibt unberührt');
});

test('formErkennen: Linie, Ellipse, Rechteck — und Handschrift bleibt Handschrift', async () => {
  const k = await frisch();
  /* Fast gerade Linie mit leichtem Wackeln */
  const linie = []; for (let i = 0; i <= 20; i++) linie.push([i / 40, .3 + Math.sin(i) * .002]);
  const l = roh(k.formErkennen(strich(linie).punkte));
  assert.equal(l && l.art, 'linie');
  assert.equal(l.punkte.length, 2);
  /* Kreis, etwas eierig, geschlossen */
  const kreis = []; for (let i = 0; i <= 40; i++) { const t = i / 40 * Math.PI * 2; kreis.push([.5 + Math.cos(t) * .2 * (1 + Math.sin(i) * .03), .5 + Math.sin(t) * .18]); }
  const e = roh(k.formErkennen(strich(kreis).punkte));
  assert.equal(e && e.art, 'ellipse');
  assert.ok(e.punkte.length > 20);
  /* Rechteck entlang der Kanten */
  const rechteck = [];
  for (let i = 0; i <= 10; i++) rechteck.push([.2 + i * .03, .2]);
  for (let i = 0; i <= 10; i++) rechteck.push([.5, .2 + i * .02]);
  for (let i = 0; i <= 10; i++) rechteck.push([.5 - i * .03, .4]);
  for (let i = 0; i <= 10; i++) rechteck.push([.2, .4 - i * .02]);
  const r = roh(k.formErkennen(strich(rechteck).punkte));
  assert.equal(r && r.art, 'rechteck');
  assert.equal(r.punkte.length, 5);
  /* Eine Schleife wie ein „e" — nichts davon */
  const schnoerkel = []; for (let i = 0; i <= 30; i++) { const t = i / 30 * 4; schnoerkel.push([.2 + t * .1 + Math.sin(t * 3) * .05, .4 + Math.cos(t * 2.3) * .08]); }
  assert.equal(k.formErkennen(strich(schnoerkel).punkte), null);
  assert.equal(k.formErkennen([]), null);
  assert.equal(k.formErkennen([{ x: 0, y: 0, w: .01 }, { x: 0, y: 0, w: .01 }]), null, 'zu kurz');
});

test('strichVerdichten und saubereStriche: klein, begrenzt, bereinigt; Löschmarke räumt das Frühere weg', async () => {
  const k = await frisch();
  const dicht = strich(Array.from({ length: 200 }, (_, i) => [i * .0002, 0]));
  const v = roh(k.strichVerdichten(dicht));
  assert.ok(v.punkte.length < 40 && v.punkte.length >= 2, 'dichte Punkte fallen weg: ' + v.punkte.length);
  assert.deepEqual(v.punkte[0], dicht.punkte[0]);
  assert.deepEqual(v.punkte[v.punkte.length - 1], dicht.punkte[dicht.punkte.length - 1]);

  const sauber = roh(k.saubereStriche([
    strich([[0, 0], [.5, .5]], { farbe: 'javascript:alert(1)' }),
    { leeren: true },
    strich([[.1, .1]], { farbe: '#abc' }),
    { farbe: '#000', punkte: [{ x: 'x', y: 1 }, { x: 5, y: -9, w: 99 }] },
    null, 'quatsch'
  ]));
  assert.equal(sauber.length, 2, 'Löschmarke nimmt alles davor mit; Unsinn fällt weg');
  assert.equal(sauber[0].farbe, '#abc');
  assert.deepEqual(sauber[1].punkte, [{ x: 2, y: -1, w: .2 }], 'Werte werden eingefangen');
  assert.deepEqual(roh(k.saubereStriche('nix')), []);
  /* Über dem Punktebudget gehen die ältesten. */
  const viele = Array.from({ length: 30 }, () => strich(Array.from({ length: 1000 }, (_, i) => [i / 1000, 0])));
  const begrenzt = roh(k.saubereStriche(viele));
  assert.ok(begrenzt.reduce((n, s) => n + s.punkte.length, 0) <= 24000);
  assert.ok(begrenzt.length < 30);
});

test('gliederungAusHTML: h1–h3 in Reihenfolge, ohne Tags und Entitäten', async () => {
  const k = await frisch();
  const g = roh(k.gliederungAusHTML('<p>x</p><h2>Erstes <b>Kapitel</b> &amp; mehr</h2><p>t</p><h3 style="color:red"> Unter&nbsp;punkt </h3><h1>Oben</h1><h4>nicht</h4>'));
  assert.deepEqual(g, [{ ebene: 2, text: 'Erstes Kapitel & mehr' }, { ebene: 3, text: 'Unter punkt' }, { ebene: 1, text: 'Oben' }]);
  assert.deepEqual(roh(k.gliederungAusHTML('')), []);
  assert.deepEqual(roh(k.gliederungAusHTML('<h2></h2>')), [], 'leere Überschriften zählen nicht');
});

test('tonFormat: Minuten und Sekunden, nie negativ', async () => {
  const k = await frisch();
  assert.equal(k.tonFormat(0), '0:00');
  assert.equal(k.tonFormat(65), '1:05');
  assert.equal(k.tonFormat(299.6), '5:00');
  assert.equal(k.tonFormat(-4), '0:00');
  assert.equal(k.tonFormat('x'), '0:00');
});
