/* Das Ticken der Standuhr am Schreibtisch (54).

   Vorher war das Ticken gerechnet — Rauschen durch ein schmales Band, darunter
   ein Holzkörper. Das klang nach Klopfen. Jetzt läuft eine echte Aufnahme in
   Schleife, und die ganze Kunst steckt darin, wo geschnitten wird.

   Zwei Fehler kann man dabei machen, und beide hört man sofort:
     · Man schneidet mitten in einen Schlag — dann knackt es jedes Mal.
     · Man schneidet still, aber nicht auf ganze Schläge — dann stolpert der
       Takt an der Naht, alle paar Minuten einmal.

   Hier wird eine Aufnahme nachgebaut, deren Takt wir kennen, und geprüft, dass
   tickenSchleife beides vermeidet. Ein gebauter Puffer ist dafür ehrlicher als
   die echte Datei: bei der wüssten wir die richtige Antwort nicht. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baueSandkasten, mikrotasksLeeren } from './sandkasten.mjs';

async function frisch() { const k = baueSandkasten(); await k.ladeAlles(); await mikrotasksLeeren(); return k; }

/* Eine Standuhr: alle `periode` Sekunden ein kurzer Schlag, dazwischen Stille.
   `vorlauf` ist die Anlaufzeit vor dem ersten Schlag — echte Aufnahmen fangen
   nie genau auf einem Schlag an. */
function baueAufnahme({ periode = 1, dauer = 20, rate = 8000, vorlauf = 0.3, schlagLaenge = 0.04 } = {}) {
  const daten = new Float32Array(Math.round(dauer * rate));
  for (let t = vorlauf; t < dauer; t += periode) {
    const ab = Math.round(t * rate), n = Math.round(schlagLaenge * rate);
    for (let i = 0; i < n && ab + i < daten.length; i++) {
      /* Ein Schlag: laut am Anfang, klingt schnell aus. */
      daten[ab + i] = Math.sin(i * 0.9) * (1 - i / n);
    }
  }
  return { sampleRate: rate, duration: dauer, numberOfChannels: 1, getChannelData: () => daten };
}
/* Wie laut ist es an einer Stelle? Für „liegt der Schnitt in der Stille?“ */
function lautstaerkeBei(puffer, sekunde, fenster = 0.02) {
  const d = puffer.getChannelData(0), rate = puffer.sampleRate;
  const ab = Math.max(0, Math.round(sekunde * rate)), n = Math.round(fenster * rate);
  let summe = 0, zahl = 0;
  for (let i = ab; i < ab + n && i < d.length; i++) { summe += d[i] * d[i]; zahl++; }
  return zahl ? Math.sqrt(summe / zahl) : 0;
}

test('Der Takt der Aufnahme wird erkannt', async () => {
  const k = await frisch();
  for (const periode of [0.5, 1, 2]) {
    const s = k.tickenSchleife(baueAufnahme({ periode, dauer: 24 }));
    assert.ok(s, 'bei ' + periode + ' s wurde gar nichts gefunden');
    assert.ok(Math.abs(s.periode - periode) < 0.03, 'bei ' + periode + ' s: gemessen ' + s.periode);
  }
});

test('Geschnitten wird in der Stille — sonst knackt es bei jeder Runde', async () => {
  const k = await frisch();
  const puffer = baueAufnahme({ periode: 1, dauer: 24 });
  const s = k.tickenSchleife(puffer);
  /* Zum Vergleich: wie laut ist ein Schlag? */
  const imSchlag = lautstaerkeBei(puffer, 0.3 + 0.005);
  assert.ok(imSchlag > 0.1, 'die Testaufnahme hat überhaupt Schläge');
  assert.ok(lautstaerkeBei(puffer, s.start) < imSchlag / 50, 'der Anfang liegt in der Stille');
  assert.ok(lautstaerkeBei(puffer, s.ende) < imSchlag / 50, 'das Ende liegt in der Stille');
});

test('Die Schleife umfasst ganze Schläge — sonst stolpert der Takt an der Naht', async () => {
  const k = await frisch();
  for (const periode of [0.5, 1, 2]) {
    const s = k.tickenSchleife(baueAufnahme({ periode, dauer: 24 }));
    const schlaege = (s.ende - s.start) / s.periode;
    const abweichung = Math.abs(schlaege - Math.round(schlaege));
    /* Ein Zwanzigstel Schlag daneben wäre bei einer Sekunde Takt schon
       hörbar. Erlaubt ist ein Hundertstel — der Rasterabstand der Messung. */
    assert.ok(abweichung < 0.02, 'bei ' + periode + ' s: ' + schlaege.toFixed(3) + ' Schläge');
  }
});

test('Die Schleife ist lang genug und liegt in der Aufnahme', async () => {
  const k = await frisch();
  const puffer = baueAufnahme({ periode: 1, dauer: 24 });
  const s = k.tickenSchleife(puffer);
  assert.ok(s.start >= 0 && s.ende <= puffer.duration, 'nicht über den Rand hinaus');
  assert.ok(s.ende - s.start > puffer.duration * 0.6, 'es wird nicht der halbe Klang weggeworfen');
  /* Der erste Schlag wird übersprungen: eine echte Aufnahme fängt oft mit
     einem Einschwinger an, den man nicht in einer Endlosschleife hören will. */
  assert.ok(s.start >= s.periode * 0.9, 'der Anfang liegt frühestens nach dem ersten Schlag');
});

test('Stille oder Unsinn machen keine Schleife kaputt', async () => {
  const k = await frisch();
  /* Eine völlig stille Aufnahme: es gibt keinen Takt. Wichtig ist nur, dass
     nichts wirft und nichts Unmögliches herauskommt — der Aufrufer läuft dann
     ohne Schleifenpunkte weiter. */
  const still = { sampleRate: 8000, duration: 10, numberOfChannels: 1, getChannelData: () => new Float32Array(80000) };
  const s = k.tickenSchleife(still);
  if (s) {
    assert.ok(s.ende > s.start, 'wenn schon etwas herauskommt, dann etwas Gültiges');
    assert.ok(s.ende <= still.duration);
  }
  /* Zu kurz für auch nur einen Takt */
  const winzig = { sampleRate: 8000, duration: 0.1, numberOfChannels: 1, getChannelData: () => new Float32Array(800) };
  assert.doesNotThrow(() => k.tickenSchleife(winzig));
});
