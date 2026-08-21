/* Liest eine laufende Desktop-App über Chromes Diagnosekanal aus. */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.argv[2] || 9333);
const ziele = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ziel = ziele.find((x) => x.type === 'page' && x.url.startsWith('vani://app/'));
if (!ziel) throw new Error('Kein VANI-Fenster gefunden');
const ws = new WebSocket(ziel.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let id = 0;
const offen = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && offen.has(msg.id)) { const { resolve, reject, timer } = offen.get(msg.id); clearTimeout(timer); offen.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
});
function sende(method, params = {}) {
  const nr = ++id;
  ws.send(JSON.stringify({ id: nr, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { offen.delete(nr); reject(new Error(method + ' antwortete 20 Sekunden lang nicht')); }, 20000);
    offen.set(nr, { resolve, reject, timer });
  });
}
await sende('Runtime.enable');
await sende('Page.enable');
await sende('Log.enable');
await sende('Page.reload', { ignoreCache: true });
await new Promise((r) => setTimeout(r, 900));

/* In einem eigenen, leeren --user-data-dir legt der Smoke-Test seine lokale
   Prüftür an. Niemals wird dafür ein echtes Nutzerprofil berührt. */
const tor = await sende('Runtime.evaluate', {
  expression: `(() => {
    if (!document.querySelector('.profil-tor')) return 'schon-offen';
    const profile = profilLadeRegistry();
    const passfelder = [...document.querySelectorAll('.profil-karte input[type="password"]')];
    if (!profile.length) {
      document.querySelector('.profil-karte input[type="text"]').value = 'Prüfprofil';
      passfelder[0].value = 'nur-fuer-den-automatischen-test'; passfelder[1].value = 'nur-fuer-den-automatischen-test';
    } else {
      document.querySelector('.profil-wahl').click();
      passfelder[0].value = 'nur-fuer-den-automatischen-test';
    }
    document.querySelector('.profil-weiter').click();
    return profile.length ? 'angemeldet' : 'angelegt';
  })()`, returnByValue: true
});
if (tor.exceptionDetails) throw new Error(tor.exceptionDetails.exception?.description || tor.exceptionDetails.text || 'Profil-Smoke fehlgeschlagen');
if (tor.result.value !== 'schon-offen') await new Promise((r) => setTimeout(r, 3200));

let appBereit = false;
for (let i = 0; i < 30; i++) {
  const bereit = await sende('Runtime.evaluate', { expression: `!document.querySelector('.profil-tor') && !!document.querySelector('#raum .inhalt')`, returnByValue: true });
  if (bereit.result.value) { appBereit = true; break; }
  await new Promise((r) => setTimeout(r, 200));
}
if (!appBereit) {
  const diagnose = await sende('Runtime.evaluate', { expression: `JSON.stringify({meldung:document.querySelector('.profil-meldung')?.textContent, text:document.body.innerText.slice(0,500), registry:profilLadeRegistry().map(p=>p.name)})`, returnByValue: true });
  throw new Error('VANI kam nach dem Profil-Login nicht bis nach Hause: ' + diagnose.result.value);
}

/* Reale Layout-Regressions: eigener Funke, kombinierter Umschlag und ein
   sehr großer formatierter Paste, der über mehrere Heftseiten fließen muss. */
const uiPruefung = await sende('Runtime.evaluate', {
  expression: `(async () => {
    let heft = [...D.docs.values()].find((d) => d.typ === 'heft' && d.titel === 'Prüfheft · Nachtmeer');
    if (!heft) {
      neuDoc('funkeln', { quelle:'eigen', art:'satz', vibe:'kalter Sommerabend', text:'Der Satz, der sofort eine Geschichte wollte.' });
      heft = neuDoc('heft', { titel:'Prüfheft · Nachtmeer', farbe:'#344a43', farbe2:'#583f52', band:'#c0a278', muster:'welle', papier:'punkte', ansicht:'seiten' });
      const lang = Array.from({length:850}, (_,i) => (i % 17 === 0 ? 'NACHTMEER ' : '') + 'Wort' + i).join(' ');
      neuDoc('seite', { parent:heft.id, ord:0, titel:'Ein großer Paste', text:lang, rich:'<p><b style="color:#41597a">' + lang + '</b></p>', format:'rich' });
    }
    location.hash = '#/heft/' + heft.id; zeichne();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const editor = document.querySelector('.schreibflaeche.rich-editor');
    if (editor) editor.dispatchEvent(new Event('input', {bubbles:true}));
    let letzteZahl = -1, ruhig = 0;
    for (let i = 0; i < 48 && ruhig < 3; i++) {
      await new Promise((r) => setTimeout(r, 350));
      const zahl = kinder(heft.id, 'seite').length;
      const feld = document.querySelector('.schreibflaeche.rich-editor');
      const passt = !feld || feld.scrollHeight <= feld.clientHeight + 2;
      ruhig = zahl === letzteZahl && passt ? ruhig + 1 : 0; letzteZahl = zahl;
    }
    const seiten = kinder(heft.id, 'seite');
    const gesamt = seiten.map((s) => s.text || '').join(' ').replace(/\\s+/g,' ').trim();
    const erwartet = Array.from({length:850}, (_,i) => (i % 17 === 0 ? 'NACHTMEER ' : '') + 'Wort' + i).join(' ').replace(/\\s+/g,' ').trim();
    return { heft:heft.id, seiten:seiten.length, rich:seiten.every((s) => s.format === 'rich'), textVollstaendig:gesamt === erwartet,
      eigeneFunken:eigeneFunken().length, ueberlauf:document.documentElement.scrollWidth <= innerWidth + 1,
      editorPasst:(() => { const f=document.querySelector('.schreibflaeche.rich-editor'); return !f || f.scrollHeight <= f.clientHeight + 2; })(),
      sauber:!sauberesRichHTML('<b onclick="x()">gut</b><script>boese()</script>').includes('onclick') };
  })()`, returnByValue: true, awaitPromise: true
});
if (uiPruefung.exceptionDetails) throw new Error(uiPruefung.exceptionDetails.exception?.description || uiPruefung.exceptionDetails.text || 'UI-Prüfung fehlgeschlagen');
if (!uiPruefung.result || !uiPruefung.result.value) throw new Error('UI-Prüfung gab kein Ergebnis zurück');
if (uiPruefung.result.value.seiten < 2 || !uiPruefung.result.value.rich || !uiPruefung.result.value.textVollstaendig ||
    !uiPruefung.result.value.ueberlauf || !uiPruefung.result.value.editorPasst || !uiPruefung.result.value.sauber) {
  throw new Error('UI-Regressionsprüfung fehlgeschlagen: ' + JSON.stringify(uiPruefung.result.value));
}
const auswertung = await sende('Runtime.evaluate', {
  expression: `(async () => JSON.stringify({
    bereit: document.readyState,
    titel: document.title,
    version: typeof APP_VERSION === 'string' ? APP_VERSION : null,
    raeume: document.querySelectorAll('#leiste button').length,
    inhalt: (document.querySelector('#raum')?.innerText || '').slice(0, 300),
    sync: typeof syncInfo === 'function' ? syncInfo() : null,
    standardServer: typeof syncStandardServer === 'function' ? await syncStandardServer() : null,
    fehlerseite: document.body.innerText.includes('Speicher wollte nicht aufwachen'),
    ui: ${JSON.stringify(uiPruefung.result.value)}
  }))()`, returnByValue: true, awaitPromise: true
});
let bildPfad = '';
if (process.argv.includes('--bild')) {
  const bild = await sende('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  bildPfad = join(process.cwd(), 'release', 'desktop-smoke.png');
  writeFileSync(bildPfad, Buffer.from(bild.data, 'base64'));
}
ws.close();
console.log(auswertung.result.value);
if (bildPfad) console.log(bildPfad);
