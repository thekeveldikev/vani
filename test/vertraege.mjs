import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(join(wurzel, p), 'utf8');

test('Quellverträge: jede JavaScript-Datei ist syntaktisch gültig', () => {
  const dateien = lies('build.sh').match(/src\/[\w-]+\.js/g) || [];
  assert.ok(dateien.length >= 18, 'Buildliste darf nicht versehentlich schrumpfen');
  for (const d of new Set(dateien)) assert.doesNotThrow(() => new vm.Script(lies(d), { filename: d }), d);
  assert.doesNotThrow(() => new vm.Script(lies('sw.js'), { filename: 'sw.js' }));
  assert.doesNotThrow(() => new vm.Script(lies('server.js'), { filename: 'server.js' }));
});

test('PWA-Vertrag: stabile Identität, Versionen und Offline-Kern passen zusammen', () => {
  const manifest = JSON.parse(lies('manifest.json'));
  assert.equal(manifest.id, './');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  const appVersion = lies('src/30-core.js').match(/APP_VERSION\s*=\s*'([^']+)'/)[1];
  const swVersion = lies('sw.js').match(/VERSION\s*=\s*'([^']+)'/)[1];
  assert.equal(swVersion, appVersion);
  assert.match(lies('src/00-head.html'), /rel="canonical" href="https:\/\/thekeveldikev\.github\.io\/vani\/"/);
  for (const pfad of lies('sw.js').match(/'\.\/[^']+'/g).map((s) => s.slice(3, -1)).filter(Boolean)) {
    if (pfad === '') continue;
    assert.ok(existsSync(join(wurzel, pfad)), 'Offline-Datei fehlt: ' + pfad);
  }
});

test('Buildvertrag: neue Räume stehen vor Router und Boot in der richtigen Reihenfolge', () => {
  const build = lies('build.sh');
  const pos = (s) => build.indexOf(s);
  assert.ok(pos('30-core.js') < pos('39-beziehungen.js'));
  assert.ok(pos('30-core.js') < pos('29-profile.js'));
  assert.ok(pos('29-profile.js') < pos('31-sync.js'));
  assert.ok(pos('31-sync.js') < pos('35-richtext.js'));
  assert.ok(pos('35-richtext.js') < pos('43-hefte.js'));
  assert.ok(pos('39-beziehungen.js') < pos('40-router.js'));
  assert.ok(pos('42d-goodnotes.js') < pos('49-feinheiten.js'));
  assert.ok(pos('50-audio.js') < pos('51-klangraum.js'));
  assert.ok(pos('51-klangraum.js') < pos('60-boot.js'));
});

test('Update- und Klangvertrag: ein Icon bleibt stabil und iOS bekommt eine Medienbrücke', () => {
  const boot = lies('src/60-boot.js'), audio = lies('src/50-audio.js');
  assert.match(boot, /sucheAppUpdate\(neuLaden = false\)/);
  assert.match(boot, /_swReg\.update\(\)/);
  assert.match(boot, /location\.reload\(\)/);
  assert.match(audio, /_audioMedienBruecke/);
  assert.match(audio, /createObjectURL/);
  assert.match(audio, /ctx\.state === 'interrupted'/);
  assert.match(lies('src/49-feinheiten.js'), /Ein Icon genügt für immer/);
  assert.match(lies('src/49-feinheiten.js'), /Hier bist du richtig — das ist VANI/);
  assert.match(lies('src/49-feinheiten.js'), /Rettungsmodus der früheren zweiten Adresse/);
});

test('Profilvertrag: veröffentlichter Code enthält keine angeforderten Nutzerpasswörter', () => {
  const profil = lies('src/29-profile.js');
  assert.doesNotMatch(profil, /Sarah|Kevin/);
  assert.doesNotMatch(profil, /(?:PASSWORT|BENUTZER|USERS)\s*=\s*\{/);
  assert.match(profil, /PBKDF2/);
  assert.match(profil, /AES-GCM/);
});

/* Das Repo ist öffentlich. Echte Vornamen aus dem Gespräch gehören weder in den
   ausgelieferten Code noch in Testdaten — auch nicht als WhatsApp-Beispielzeile. */
test('Privatsphärenvertrag: keine echten Vornamen im ausgelieferten Code und in Testdaten', () => {
  const dateien = [
    'src/29-profile.js', 'src/30-core.js', 'src/34-inhalt.js', 'src/42c-faden.js',
    'src/49-feinheiten.js', 'src/52-anleitung.js', 'test/lauf.mjs', 'test/kern-edge.mjs',
    'werkzeug/faden-parser.mjs', 'index.html'
  ];
  for (const d of dateien) {
    if (!existsSync(join(wurzel, d))) continue;
    assert.doesNotMatch(lies(d), /(?<![A-Za-zÄÖÜäöü])Sarah(?![A-Za-zÄÖÜäöü])/i, d + ' enthält einen echten Vornamen');
  }
});

test('Rich-Toolbar-Regressionsvertrag: sichtbarer Titel wird gebunden, kein freier Bezeichner bleibt', () => {
  const rich = lies('src/35-richtext.js');
  assert.match(rich, /class: 'format-knopf', title: titel, 'aria-label': titel/);
  assert.doesNotMatch(rich, /class: 'format-knopf', title, 'aria-label': titel/);
});

test('Goodnotes-Vertrag: Archiv bleibt aus der allgemeinen Suche heraus', () => {
  assert.ok(!lies('src/48-suche.js').includes("['goodnote'"));
  assert.match(lies('src/42d-goodnotes.js'), /Im Archiv nach Titel, Stichwort oder Notiz suchen/);
});

test('Wortkisten-Vertrag: Kisten sind synchronisierte Dokumente und alte lose Wörter bleiben sichtbar', () => {
  const woerter = lies('src/47-woerter.js');
  assert.match(woerter, /neuDoc\('wortkiste'/);
  assert.match(woerter, /kistenId === 'lose'/);
  assert.match(woerter, /Nur Kiste löschen · Wörter bleiben lose/);
  assert.match(lies('src/48-suche.js'), /\['wortkiste', 'Wortkisten'/);
  assert.match(lies('src/31-sync.js'), /'titel'.*'notiz'/);
});

test('Desktop-Vertrag: eigenes sicheres Protokoll wird erkannt und Fremdseiten bleiben ausgesperrt', () => {
  const main = lies('desktop/main.cjs');
  assert.match(main, /u\.protocol === 'vani:' && u\.hostname === 'app'/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /sandbox:\s*true/);
  assert.match(main, /safeStorage\.encryptString/);
  assert.match(main, /setPermissionRequestHandler/);
});

test('Themenvertrag: jede angebotene Stimmung hat ihre eigene Statusleistenfarbe', () => {
  const kern = lies('src/30-core.js');
  const fein = lies('src/49-feinheiten.js');
  const themenBlock = (kern.match(/const THEMEN = \{([^}]*)\}/) || [])[1] || '';
  const angeboten = [...fein.matchAll(/\[\s*'([a-z]+)',\s*'[^']+',\s*'#[0-9a-f]{6}'/gi)].map((m) => m[1]);
  assert.ok(angeboten.length >= 5, 'Themenliste in den Feinheiten nicht gefunden');
  for (const id of angeboten) {
    assert.ok(themenBlock.includes(id + ':'), 'Stimmung ohne Statusleistenfarbe: ' + id);
  }
});

test('Formatleistenvertrag: jede erlaubte Ausrichtung und Überschrift ist auch erreichbar', () => {
  const rt = lies('src/35-richtext.js');
  for (const befehl of ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']) {
    assert.ok(rt.includes(`'${befehl}'`), 'Knopf fehlt: ' + befehl);
  }
  assert.ok(/formatBlock',\s*'h2'/.test(rt), 'Überschrift-Knopf fehlt');
  assert.ok(/formatBlock',\s*'p'/.test(rt), 'Absatz-Knopf fehlt');
});

test('Anleitungsvertrag: im Build nach dem Klang und vor dem Boot, aus den Feinheiten erreichbar', () => {
  for (const datei of ['build.sh', 'werkzeug/build-web.mjs']) {
    const b = lies(datei);
    const pos = (s) => b.indexOf(s);
    assert.ok(pos('52-anleitung.js') > 0, datei + ': Anleitung fehlt im Build');
    assert.ok(pos('51-klangraum.js') < pos('52-anleitung.js') && pos('52-anleitung.js') < pos('60-boot.js'), datei + ': falsche Reihenfolge');
  }
  assert.match(lies('src/49-feinheiten.js'), /oeffneAnleitung\(\)/);
  assert.match(lies('src/52-anleitung.js'), /function schliesseAnleitung/);
});

test('Kritzelvertrag: die Leinwand bekommt eine feste Anzeigegröße und die Leiste schiebt nichts', () => {
  const css = lies('src/10-style.css');
  const flaeche = (css.match(/\.kritzelflaeche \{[^}]*\}/) || [''])[0];
  assert.match(flaeche, /width:\s*100%/, 'ohne feste Anzeigegröße zeigt sich eine Leinwand in Attributgröße');
  assert.match(flaeche, /height:\s*100%/);
  const leiste = (css.match(/\.kritzelleiste \{[^}]*\}/) || [''])[0];
  assert.match(leiste, /position:\s*fixed/, 'eine mitfließende Leiste macht die Seite schmaler als die Zeichnung');
  const hefte = lies('src/43-hefte.js');
  assert.match(hefte, /document\.body\.append\(leiste\)/);
  for (const werkzeug of ['Radierer', 'Einen Schritt zurück', 'Schritt wiederherstellen', 'Alles löschen', 'Abbrechen']) {
    assert.ok(hefte.includes(werkzeug), 'Zeichenwerkzeug fehlt: ' + werkzeug);
  }
});

test('Seitenvertrag: fehlende Teile werden gefiltert, nie als Text „null" eingesetzt', () => {
  const hefte = lies('src/43-hefte.js');
  assert.match(hefte, /blatt\.append\(\.\.\.\[skizzenbild, titel, formatleiste, text, werkzeuge\]\.filter\(Boolean\)\)/);
  assert.doesNotMatch(hefte, /blatt\.append\(skizzenbild, titel, formatleiste/);
});

test('Fadenvertrag: die verschlüsselte Fadendatei liegt nicht mehr öffentlich im Offline-Kern', () => {
  assert.doesNotMatch(lies('sw.js'), /faden\.enc/, 'sonst scheitert die Offline-Installation an einer fehlenden Datei');
  assert.doesNotMatch(lies('hosting/scripts/copy-vani.mjs'), /faden\.enc/);
  assert.match(lies('.gitignore'), /^faden\.enc$/m, 'die Fadendatei bleibt lokal');
  assert.match(lies('src/49-feinheiten.js'), /async function fadenPaketHolen/);
  assert.match(lies('src/49-feinheiten.js'), /Fadendatei von Hand wählen/);
});

test('Dialogvertrag: ein Fenster meldet sein Ergebnis, bevor es zugeht', () => {
  /* zeigeDeck(kasten, () => res(null)) löst beim Schließen null aus. Wer erst
     zu() ruft und danach res(wert), verliert sein Ergebnis still. */
  for (const datei of ['src/30-core.js', 'src/39-beziehungen.js', 'src/41-zuhause.js', 'src/43-hefte.js', 'src/47-woerter.js']) {
    lies(datei).split('\n').forEach((zeile, i) => {
      if (/\berledigt\b/.test(zeile)) return;
      const zuStelle = zeile.indexOf('zu();');
      if (zuStelle < 0) return;
      const treffer = /\b(?:res|resolve)\(/.exec(zeile);
      if (!treffer || /\b(?:res|resolve)\(null\)/.test(zeile.slice(treffer.index))) return;
      assert.ok(treffer.index < zuStelle,
        datei + ':' + (i + 1) + ' schließt das Fenster, bevor es sein Ergebnis meldet');
    });
  }
});

test('Einfügevertrag: fremde Schriftgrößen, Farben und Hintergründe bleiben draußen', () => {
  const rt = lies('src/35-richtext.js');
  assert.match(rt, /function einfuegeHTML/);
  assert.match(rt, /function einfuegeAusText/);
  assert.match(rt, /einfuegeHTML\(html\) : einfuegeAusText\(roh\)/, 'der Einfügefilter muss im paste-Ereignis hängen');
  /* Der Klartextspiegel braucht echte Zeilen, sonst kleben Absätze zusammen. */
  const reiner = (rt.match(/function richReinerText[\s\S]*?\n\}/) || [''])[0];
  assert.match(reiner, /<br/, 'richReinerText muss Zeilenumbrüche selbst setzen');
  assert.match(reiner, /blockquote/, 'richReinerText muss Blockenden zu Zeilen machen');
  assert.doesNotMatch(reiner, /innerText/, 'innerText liefert an einem losgelösten Element keine Zeilen');
});

test('Heftvertrag: drei Ansichten, und "Am Stück" ist überall erlaubt', () => {
  assert.match(lies('src/30-core.js'), /\['seiten', 'rolle', 'fluss'\]/);
  const hefte = lies('src/43-hefte.js');
  assert.match(hefte, /function zeigeFluss/);
  assert.match(hefte, /'Am Stück'/);
  assert.match(hefte, /heft\.ansicht === 'fluss'\) zeigeFluss\(\)/);
  assert.match(hefte, /async function textHereinholen/);
  assert.match(lies('src/10-style.css'), /\.papierseite\.fluss/);
});

test('Papiervertrag: das Raster hat denselben Takt wie die Zeilen und liegt bei der Schrift', () => {
  const css = lies('src/10-style.css');
  const zeilenhoehe = Number((css.match(/\.schreibflaeche \{[^}]*line-height:\s*([\d.]+)px/) || [])[1]);
  assert.equal(zeilenhoehe, 32, 'Zeilenhöhe der Schreibfläche');
  /* Liniert und breit: ein Zyklus ist genau eine Zeile hoch. */
  const liniert = (css.match(/\.papierseite\.liniert \.schreibflaeche \{[\s\S]*?\}/) || [''])[0];
  assert.match(liniert, /transparent 31px, var\(--linie\) 31px, var\(--linie\) 32px/);
  const breit = (css.match(/\.papierseite\.breit \.schreibflaeche \{[^}]*\}/) || [''])[0];
  assert.match(breit, /transparent 39px, var\(--linie\) 39px, var\(--linie\) 40px/);
  assert.match(breit, /line-height:\s*40px/, 'breite Linien brauchen ihre eigene Zeilenhöhe');
  /* Die gemessenen Grundlinien: 22px bei 32er Zeilen, 26px bei 40er Zeilen.
     Die Linie gehört einen Punkt darunter — sonst schwebt die Schrift. */
  assert.match(css, /\.papierseite\.liniert \.schreibflaeche \{ background-position-y: 24px; \}/);
  assert.match(css, /\.papierseite\.breit \.schreibflaeche \{ background-position-y: 28px; \}/);
  /* Kästchen und Punkte liegen auf der Schreibfläche, nicht auf der ganzen Seite:
     nur dort kennen sie den Zeilenrhythmus. */
  for (const art of ['kariert', 'punkte']) {
    assert.ok(css.includes('.papierseite.' + art + ' { background-image: none; }'),
      art + ': das Muster darf nicht auf der ganzen Seite liegen');
    const anfang = css.indexOf('.papierseite.' + art + ' .schreibflaeche:not(.rich-editor) {');
    assert.ok(anfang > 0, art + ': Muster fehlt auf der Schreibfläche');
    const block = css.slice(anfang, css.indexOf('}', anfang));
    assert.match(block, /background-size:\s*32px 32px/, art + ': Rasterweite muss der Zeilenhöhe entsprechen');
    assert.match(block, /background-position:/, art + ': das Muster braucht seine Ausrichtung an der Grundlinie');
  }
  /* Formatierter Text hat wechselnde Zeilenhöhen und darf kein Raster erben. */
  /* Die Regel muss so spezifisch sein wie die Linienregel, sonst gewinnt die Linie. */
  assert.match(css, /\.papierseite \.schreibflaeche\.rich-editor \{ background-image: none; \}/);
});

test('Handyvertrag: nur der Raum scrollt, die Leiste bleibt unten und die Tastatur verdeckt nichts', () => {
  const kopf = lies('src/00-head.html');
  assert.match(kopf, /interactive-widget=resizes-content/,
    'ohne diese Angabe legt sich die Tastatur über die Seite, statt sie zu verkleinern');
  const css = lies('src/10-style.css');
  /* Die Seite selbst darf nie scrollen — sonst rutscht die Leiste nach oben
     und unten klafft die Höhe der Adressleiste. */
  assert.match(css, /html \{ height: 100%; overflow: hidden; \}/);
  const body = (css.match(/^body \{[^}]*\}/m) || [''])[0];
  assert.match(body, /overflow: hidden/);
  /* Das Gerüst misst sich am sichtbaren Bereich, nicht am theoretischen. */
  const app = (css.match(/#app \{[\s\S]*?\}/) || [''])[0];
  assert.match(app, /height: var\(--vvh, 100dvh\)/);
  assert.match(lies('src/60-boot.js'), /visualViewport/, '--vvh muss gepflegt werden');
  /* Fenster mitten im Sichtbaren, nicht hinter der Tastatur. */
  const schleier = (css.match(/\.schleier \{[\s\S]*?\}/) || [''])[0];
  assert.match(schleier, /var\(--vvh, 100dvh\)/);
  /* Ein Grid-Element wächst ohne min-width mit seinem Inhalt über den Rand. */
  assert.match(css, /#leiste \{[^}]*min-width: 0/);
});

test('Leistenvertrag: Suche und Feinheiten stehen außerhalb der scrollenden Räume', () => {
  const router = lies('src/40-router.js');
  assert.match(router, /class: 'raumrolle'/, 'die Räume brauchen eine eigene Rolle');
  const rolleAnfang = router.indexOf("const rolle = el('div', { class: 'raumrolle' })");
  const rolleEnde = router.indexOf('l.append(rolle)');
  const sucheStelle = router.indexOf('oeffneSuche()');
  const feinStelle = router.indexOf("'data-raum': 'feinheiten'");
  assert.ok(rolleAnfang > 0 && rolleEnde > rolleAnfang, 'Rolle wird angelegt und eingehängt');
  assert.ok(sucheStelle > rolleEnde, 'die Suche gehört nicht in die scrollende Rolle');
  assert.ok(feinStelle > rolleEnde, 'die Feinheiten gehören nicht in die scrollende Rolle');
  assert.match(lies('src/10-style.css'), /\.raumrolle \{[^}]*flex-direction: column/, 'am Rechner bleibt es eine Spalte');
});

test('Zahlenvertrag: auf schmalen Geräten weniger Tage statt abgeschnittener Balken', () => {
  const fein = lies('src/49-feinheiten.js');
  assert.match(fein, /innerWidth < 620\) \? 7 : 14/);
  assert.match(fein, /for \(let i = tage - 1; i >= 0; i--\)/);
});

test('Am-Stück- und Rollen-Vertrag: die Werkzeuge stehen einmal oben, nicht bei jedem Stück', () => {
  const hefte = lies('src/43-hefte.js');
  assert.match(hefte, /function seitenWerkzeuge\(ziel/, 'eine gemeinsame Werkzeugreihe');
  assert.match(hefte, /\(optionen\.fluss \|\| optionen\.rolle\) \? null : seitenWerkzeuge/, 'weder im Fluss noch in der Rolle eine Reihe je Stück');
  assert.equal((hefte.match(/klasse: 'fluss-werkzeuge'/g) || []).length, 2, 'je eine einzige Reihe für Rolle und Am Stück');
  assert.match(hefte, /klasse: 'fluss-werkzeuge'/, 'dafür eine einzige oben am Bogen');
  assert.match(hefte, /aktuellesStueck/, 'sie muss wissen, welches Stück gemeint ist');
  assert.doesNotMatch(lies('src/10-style.css'), /\.papierseite\.fluss:hover \.seitenwerkzeuge/,
    'nichts Notwendiges darf nur bei Mauszeiger erscheinen');
});

test('Teilen-Vertrag: Android kann nach VANI teilen, die PWA-Identität bleibt trotzdem stabil', () => {
  const m = JSON.parse(lies('manifest.json'));
  assert.equal(m.id, './'); assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  assert.equal(m.share_target.action, './');
  assert.equal(m.share_target.method, 'GET');
  assert.deepEqual(m.share_target.params, { title: 'titel', text: 'text', url: 'url' });
  assert.ok(Array.isArray(m.shortcuts) && m.shortcuts.length >= 2);
  for (const s of m.shortcuts) assert.match(s.url, /^\.\/\?neu=(schnipsel|blatt|suche)$/);
  assert.match(lies('src/60-boot.js'), /startAuftrag\(location\.search\)/);
  assert.match(lies('src/60-boot.js'), /history\.replaceState/, 'die Adresse wird nach dem Auftrag wieder sauber');
});

test('Welle-1-Vertrag: Inhalt, Lesezeichen, Seitenordnung, Figuren, Vorlesen und Schlagworte sind verdrahtet', () => {
  const hefte = lies('src/43-hefte.js');
  for (const s of ['function heftInhalt', "'Lesezeichen hierher'", "'Seite nach vorn'", "'Seite nach hinten'", "'Seite verdoppeln'", 'heft.lesezeichen', 'function papierKlassen', "'Gerade rücken'", 'ZETTELFARBEN']) {
    assert.ok(hefte.includes(s), 'Hefte: fehlt ' + s);
  }
  const projekte = lies('src/44-projekte.js');
  for (const s of ['function baueFigurenUndOrte', "neuDoc('figur'", 'figurVorkommen', 'FIGUR_ARTEN']) assert.ok(projekte.includes(s), 'Projekte: fehlt ' + s);
  assert.match(lies('src/30-core.js'), /d\.typ === 'kapitel' \|\| d\.typ === 'figur'/, 'Figuren öffnen ihr Projekt');
  assert.match(lies('src/48-suche.js'), /\['figur', 'Figuren & Orte', 'projekte'\]/);
  assert.match(lies('src/48-suche.js'), /schlagwortIndex\(/);
  const sr = lies('src/45-schreibraum.js');
  for (const s of ['function vorlesen(', 'function vorlesenStopp', 'speechSynthesis', 'vorleseKnopf']) assert.ok(sr.includes(s), 'Schreibraum: fehlt ' + s);
  assert.match(lies('src/44-projekte.js'), /vorlesen\(gesamt/, 'Leseansicht liest vor');
  assert.match(lies('src/42b-blaetter.js'), /Oben anpinnen/);
  assert.match(lies('src/49-feinheiten.js'), /jahresRaster\(D\.stats\.tage/);
  assert.match(lies('src/41-zuhause.js'), /\.\.\.FUNKE_ARTEN/, 'Zuhause kennt alle Funkenarten');
  assert.match(lies('src/47-woerter.js'), /of FUNKE_ARTEN\)/, 'Wörter kennt alle Funkenarten');
});

test('Klangvertrag: echte Aufnahmen laden erst bei Bedarf und blähen den Offline-Kern nicht auf', () => {
  const sw = lies('sw.js');
  assert.doesNotMatch(sw, /\.opus/, 'Aufnahmen gehören nicht in den Offline-Kern — sonst scheitert die Installation daran');
  assert.doesNotMatch(sw, /klang\//);
  const amb = lies('src/53-ambience.js');
  assert.match(amb, /function ambienceStimmeBauen/);
  assert.match(amb, /exponentialRampToValueAtTime/, 'ein Loop braucht weiche Übergänge');
  assert.match(amb, /dbPut\('media', blob, schluessel\)/, 'einmal geholt, bleibt eine Aufnahme im Gerät');
  assert.match(amb, /AMBIENCE_MAX/, 'Größe muss begrenzt sein');
  for (const s of ['function ausklangStarten', 'function klangbildFolgen', 'function ambienceEigeneHinzufuegen', 'function ambienceVorratLeeren']) {
    assert.ok(amb.includes(s), 'fehlt: ' + s);
  }
  /* Der Katalog wird nachgeladen; ohne ihn läuft die App trotzdem. */
  assert.match(lies('src/60-boot.js'), /klang\/katalog\.json/);
  assert.match(lies('src/60-boot.js'), /\.catch\(\(\) => \{\}\)/);
  /* Build-Reihenfolge: Ambience kennt holeAudio aus 50-audio und wird vom Klangraum benutzt. */
  for (const datei of ['build.sh', 'werkzeug/build-web.mjs']) {
    const b = lies(datei);
    assert.ok(b.indexOf('50-audio.js') < b.indexOf('53-ambience.js'), datei + ': Ambience braucht die Audio-Grundlage');
    assert.ok(b.indexOf('53-ambience.js') < b.indexOf('51-klangraum.js'), datei + ': der Klangraum baut darauf auf');
  }
});

test('Welle-2-Vertrag: Manuskript, Bretter und die kleinen Griffe sind verdrahtet', () => {
  const pr = lies('src/44-projekte.js');
  for (const s of ['function manuskriptText', 'async function projektHinausgeben', "'Als Manuskript hinausgeben'"]) {
    assert.ok(pr.includes(s), 'Projekte: fehlt ' + s);
  }
  const cl = lies('src/46-cluster.js');
  for (const s of ['function baueGruppe', 'function baueBrettbild', 'async function brettAlsBild', "neuDoc('brettbild'", "neuDoc('gruppe'", 'Eng um den Inhalt legen']) {
    assert.ok(cl.includes(s), 'Bretter: fehlt ' + s);
  }
  /* Gruppen und Brettbilder brauchen eigene Grenzen — eine Anlage darf nur 2000 breit sein. */
  assert.match(lies('src/30-core.js'), /\['gruppe', 'brettbild'\]\.includes\(d\.typ\)/);
  /* Die kleinen Griffe */
  assert.match(lies('src/42-schnipsel.js'), /e\.key !== 'Enter' \|\| e\.shiftKey/, 'Enter schickt Schnipsel ab');
  assert.match(lies('src/45-schreibraum.js'), /e\.key\.toLowerCase\(\) === 's'/, 'Strg+S friert ein');
  assert.match(lies('src/45-schreibraum.js'), /e\.key === 'Tab'/, 'Tab rückt ein');
  assert.match(lies('src/30-core.js'), /ArrowDown' \|\| e\.key === 'ArrowUp'/, 'Menüs mit der Tastatur');
  assert.match(lies('src/42b-blaetter.js'), /blattsuche/, 'Blätter lassen sich durchsuchen');
});

test('Klangkatalog: jede Aufnahme hat Namen, Kategorie und ehrliche Herkunft', () => {
  if (!existsSync(join(wurzel, 'klang', 'katalog.json'))) return;   /* ohne Aufnahmen läuft die App auch */
  const katalog = JSON.parse(lies('klang/katalog.json'));
  const namen = JSON.parse(lies('werkzeug/klang-namen.json'));
  assert.ok(Array.isArray(katalog) && katalog.length >= 10, 'der Fundus soll etwas hergeben');
  const ids = new Set();
  for (const k of katalog) {
    assert.match(k.id, /^[a-z0-9_-]{1,40}$/, 'Kennung: ' + k.id);
    assert.ok(!ids.has(k.id), 'doppelte Kennung: ' + k.id);
    ids.add(k.id);
    assert.equal(k.datei, k.id + '.opus');
    assert.ok(existsSync(join(wurzel, 'klang', k.datei)), 'Datei fehlt: ' + k.datei);
    assert.ok(k.name && k.name.length <= 60, 'Name: ' + k.id);
    assert.ok(k.kat && k.kat.length <= 30, 'Kategorie: ' + k.id);
    assert.ok(k.quelle && k.quelle.length > 5, 'Herkunft fehlt bei ' + k.id);
    assert.ok(k.mb > 0.05 && k.mb < 5, 'Größe außer der Reihe bei ' + k.id + ': ' + k.mb + ' MB');
    assert.ok(namen[k.id], k.id + ' fehlt in werkzeug/klang-namen.json');
  }
  /* Der ganze Fundus muss klein bleiben — er wird bei Bedarf geladen, aber
     er liegt auch im Repo und in der Desktop-App. */
  const gesamt = katalog.reduce((n, k) => n + k.mb, 0);
  assert.ok(gesamt < 60, 'Der Fundus ist auf ' + gesamt.toFixed(1) + ' MB gewachsen — das wird zu schwer.');
});

test('Ankommen-Vertrag: Sichern und Einlesen gehen auch ohne Datei', () => {
  /* Auf verwalteten Schul-iPads ist die Dateiauswahl gesperrt. Darum muss jeder
     Weg auch über die Zwischenablage gehen — hinaus und herein — und die
     Rettungsfassung der alten Adresse muss denselben Helfer mitbringen. */
  const a = lies('src/49b-ankommen.js');
  const f = lies('src/49-feinheiten.js');
  assert.match(a, /function inZwischenablageSichern/);
  assert.match(a, /function ausZwischenablageEinlesen/);
  assert.match(a, /function umzugsHelfer/);
  /* Datei und Zwischenablage teilen sich das Einspielen — sonst driften sie auseinander. */
  assert.match(f, /await sicherungAnnehmen\(paket, datei\.name\)/, 'Datei-Import muss den gemeinsamen Weg nehmen');
  assert.match(f, /baueSicherungsPaket\(\{ mitMedien: true \}\)/, 'Datei-Export muss das gemeinsame Paket bauen');
  /* iOS: Schreiben in die Zwischenablage nur kurz nach einer Berührung. Das
     Packen dauert — deshalb ein ClipboardItem mit Versprechen, nicht writeText danach. */
  assert.match(a, /new ClipboardItem\(\{ 'text\/plain': text\.then/);
  /* Große Sicherungen dürfen nicht erst ins Textfeld gemalt werden. */
  assert.match(a, /e\.preventDefault\(\);\s*verarbeite\(text\)/);
  /* Der Kopplungscode darf ohne Dialog vorgegeben werden (aus der Zwischenablage erkannt). */
  assert.match(f, /async function vorhandenenSyncBereichKoppeln\(codeVorgabe\)/);
  /* Jede Ankunft endet mit einer Zusammenfassung, nicht mit „Alles wieder da.". */
  assert.doesNotMatch(f, /toast\('Alles wieder da\.'\)/);
  assert.match(a, /function ankunftZusammenfassen/);
  /* Das neue Modul ist in beiden Buildlisten und im Sandkasten. */
  assert.match(lies('werkzeug/build-web.mjs'), /49b-ankommen\.js/);
  assert.match(lies('build.sh'), /49b-ankommen\.js/);
  assert.match(lies('test/sandkasten.mjs'), /49b-ankommen\.js/);
  /* Die Anleitung kennt die neuen Wege. */
  const anl = lies('src/52-anleitung.js');
  for (const t of ['In die Zwischenablage sichern', 'Aus der Zwischenablage einlesen', 'Von einem alten VANI umziehen']) assert.match(anl, new RegExp("t: '" + t + "'"), 'Anleitung: ' + t);
});

test('Goodnotes-Vertrag: Einfügen repariert, Absätze sind Zeilen, Rich-Text überall', () => {
  const r = lies('src/35-richtext.js');
  /* Die drei Reparaturen greifen in BEIDEN Einfüge-Wegen — HTML und reiner Text. */
  assert.match(r, /esc\(entitaetenReparieren\(k\.nodeValue/, 'HTML-Textknoten müssen repariert werden');
  assert.match(r, /const sauber = entitaetenReparieren\(z\)/, 'reiner Text muss repariert werden');
  assert.match(r, /const verbunden = verbindeWeicheUmbrueche\(bloecke\)/, 'weiche Umbrüche beim HTML-Einfügen');
  assert.match(r, /verbindeWeicheUmbrueche\(bloecke\)\.map/, 'weiche Umbrüche beim Text-Einfügen');
  assert.match(r, /kurzschriftZuHTML\(b\.inhalt\)/);
  /* Live-Kurzschrift: nur auf insertText und nur bei den drei Zeichen — sonst
     kostet es bei jedem Buchstaben eine Auswahlprüfung. */
  assert.match(r, /e\.inputType === 'insertText' && \/\[_\*~\]\/\.test\(e\.data/);
  /* Das unsichtbare Zeichen, das den Cursor aus dem Kursiven holt, verschwindet beim Speichern. */
  assert.match(r, /replace\(\/\\u200b\/g, ''\)\.slice/, 'sauberesRichHTML muss U+200B entfernen');
  const css = lies('src/10-style.css');
  assert.match(css, /\.rich-editor p, \.rich-editor div \{ margin: 0; \}/, 'Absätze sind normale Zeilen');
  /* Rich-Text überall: neue Szenen und Blätter kommen formatierbar zur Welt. */
  assert.match(lies('src/44-projekte.js'), /titel: '', text: '', rich: '', format: 'rich', status: 'funke'/, 'neue Szene muss rich sein');
  assert.match(lies('src/42b-blaetter.js'), /rich: richAusText\(text \|\| ''\), format: 'rich'/, 'neues Blatt muss rich sein');
  assert.match(lies('src/45-schreibraum.js'), /istRich \? null : el\('button'/, 'Aa-Knopf im Schreibraum-Kopf für alte Texte');
  assert.match(lies('src/30-core.js'), /kurzschrift: true/);
});

test('Speicher-Vertrag: Formatierung überlebt das Aufräumen — auch die aus Safari', () => {
  /* Safari schreibt fett/kursiv/unterstrichen als span-Stil. Der Aufräumer
     warf genau diese Stile weg: im Editor sichtbar, nach dem Wiederöffnen
     fort. Jetzt werden sie zu echten <b>/<i>/<u>/<s>. */
  const r = lies('src/35-richtext.js');
  assert.match(r, /const fett = gewicht === 'bold' \|\| gewicht === 'bolder' \|\| parseInt\(gewicht, 10\) >= 600;/);
  assert.match(r, /\[\[fett, 'b'\], \[kursiv, 'i'\], \[unter, 'u'\], \[durch, 's'\]\]/);
  assert.match(r, /if \(!an \|\| node\.closest\(tag\)\) continue;/, 'kein <b> im <b>');
  /* <font color/size> aus execCommand wird zu span-Stil statt verworfen. */
  assert.match(r, /querySelectorAll\('font'\)/);
  /* Befehle: Farben als Stil, Elemente als Elemente — browserunabhängig. */
  assert.match(r, /const alsStil = \/\^\(foreColor\|hiliteColor\|backColor\|fontSize\|justify\)\/i\.test/);
  assert.match(r, /document\.execCommand\('styleWithCSS', false, alsStil\)/);
  /* Sofort sichern, wenn der Blick den Text verlässt. */
  assert.match(r, /editor\.addEventListener\('blur', \(\) => \{ if \(sichern\.haengt && sichern\.haengt\(\)\) sichern\.sofort\(\); \}\);/);
  assert.match(lies('src/30-core.js'), /g\.haengt = \(\) => letzteArgs !== null;/);
  /* Schreibraum flusht beim Schließen — für schlicht UND formatiert. */
  assert.match(lies('src/45-schreibraum.js'), /_sr\.sichern && _sr\.sichern\.sofort\(\);/);
});

test('Kerzen-Vertrag: die Kerze ist Canvas, meldet ihr Ende selbst und räumt sich weg', () => {
  const k = lies('src/45b-kerze.js');
  assert.match(k, /function kerzeAnzuenden/);
  assert.match(k, /function kerzeSchein/, 'kantenfreier Schein');
  assert.match(k, /requestAnimationFrame\(schleife\)/);
  assert.match(k, /if \(jetzt - bild >= 32\)/, '30 Bilder je Sekunde genügen');
  const s = lies('src/45-schreibraum.js');
  assert.match(s, /kerzeAnzuenden\(\{/);
  assert.match(s, /beiEnde: \(\) => beendeSprint\(false\)/, 'die Kerze meldet das Ende — kein zweiter Timer');
  assert.doesNotMatch(s, /timer: setTimeout\(\(\) => beendeSprint\(false\)/, 'der alte Timer darf nicht zurückkommen');
  assert.match(s, /_sr\.sprint\.kerze\.puste\(/, 'jeder Anschlag ein Luftzug');
  assert.match(s, /if \(k\) k\.entfernen\(\);/, 'beim Schließen des Raums geht die Kerze mit');
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) assert.match(lies(datei), /45b-kerze\.js/, datei);
  assert.match(lies('src/10-style.css'), /\.kerzenbuehne \{ position: fixed;/);
});

test('Sticker-Vertrag: Sticker sind Anlagen wie Zettel und Fotos — und reisen überall mit', () => {
  const h = lies('src/43-hefte.js');
  assert.match(h, /else if \(a\.typ === 'sticker'\) blatt\.append\(baueSticker/);
  assert.match(h, /stickerAufkleben\(z\.seite\)/);
  assert.match(h, /class: 'drehgriff'/, 'Drehgriff für alle Anlagen');
  /* Über den Rand hinaus ist erlaubt — aber nie ganz weg. */
  assert.match(h, /Math\.max\(-30, Math\.min\(100,/);
  assert.match(h, /Math\.max\(-14, Math\.min\(106,/);
  assert.match(lies('src/10-style.css'), /\.papierseite \{[^}]*overflow: visible;/);
  /* Sticker tragen ihr Bild im Feld `bild` — genau das, was Sicherung und Sync einsammeln. */
  const s = lies('src/43b-sticker.js');
  assert.match(s, /parent: seite\.id, bild, verhaeltnis/);
  assert.match(lies('src/49b-ankommen.js'), /if \(d\.bild\) ids\.add\(d\.bild\)/);
  assert.match(lies('src/30-core.js'), /\['zettel', 'foto', 'blase', 'sticker', 'ton'\]\.includes\(d\.typ\)/, 'Sticker und Tonnotizen brauchen immer eine Position');
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) assert.match(lies(datei), /43b-sticker\.js/, datei);
  /* Mitgebrachte Sticker liegen neben der App — und müssen in die Desktop-App
     und in den Rettungsraum mitreisen (derselbe Fehler wie einst bei klang/). */
  assert.ok(JSON.parse(lies('package.json')).build.files.includes('sticker/**'), 'sticker/** fehlt in build.files');
  assert.match(lies('hosting/scripts/copy-vani.mjs'), /'sticker'/);
  for (const m of JSON.parse(lies('src/43b-sticker.js').match(/const STICKER_MITGEBRACHT = (\[[\s\S]*?\]);/)[1]
    .replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/724 \/ 2172/g, '0.3333'))) {
    assert.ok(existsSync(join(wurzel, m.datei)), 'mitgebrachter Sticker fehlt: ' + m.datei);
    assert.ok(statSync(join(wurzel, m.datei)).size < 400 * 1024, m.datei + ' ist zu schwer');
  }
  assert.match(lies('src/52-anleitung.js'), /t: 'Sticker'/);
  assert.match(lies('src/52-anleitung.js'), /t: 'Die Stickerkiste'/);
});

test('Welle-2-Vertrag: Lasso, Formen, gespeicherte Striche, Tonnotiz, Reiter, Gliederung, Papiervorlagen', () => {
  const h = lies('src/43-hefte.js');
  /* Striche bleiben Punktfolgen: gespeichert, wieder geladen, nie nur Bild. */
  assert.match(h, /seite\.striche = leer \? \[\] : saubereStriche\(striche\.map\(\(s\) => strichVerdichten\(s\)\)\)/);
  assert.match(h, /const hatStriche = Array\.isArray\(seite\.striche\) && seite\.striche\.length > 0;/);
  /* Ein altes Bild bleibt als Grundlage unter eigener Kennung — sonst steht nach
     dem ersten Speichern alles doppelt da. */
  assert.match(h, /seite\.skizzeBasis = neuId/);
  for (const d of ['src/49b-ankommen.js', 'src/31-sync.js']) assert.match(lies(d), /skizzeBasis/, d + ' muss die Grundlage mitnehmen');
  /* Lasso und Form-halten hängen am Zeichnen. */
  assert.match(h, /auswahl = stricheImLasso\(striche, lasso\)/);
  assert.match(h, /const f = formErkennen\(strich\.punkte\)/);
  assert.match(h, /\}, 560\);/, 'Form halten: gut ein halber Atemzug');
  /* Auswahlrahmen ist Anzeige — vor dem Speichern weg. */
  assert.match(h, /auswahl = \[\]; lasso = null; alleszeichnen\(\);\s*seite\.striche/);
  /* Tonnotiz: nur angeboten, wo das Gerät ein Mikrofon hergibt; Datei im Medienvorrat. */
  assert.match(h, /tonUnterstuetzt\(\) \? el\('button'/);
  assert.match(lies('src/43d-ton.js'), /speichereDateiBlob\(new File\(\[blob\]/);
  assert.match(lies('src/43d-ton.js'), /TON_MAX_SEKUNDEN = 300/);
  /* Reiter und Gliederung */
  assert.match(h, /const REITERFARBEN = /);
  assert.match(h, /function heftGliederung/);
  assert.match(lies('src/44-projekte.js'), /function projektGliederung/);
  assert.match(lies('src/30-core.js'), /if \(d\.reiter != null\)/);
  assert.match(lies('src/30-core.js'), /'cornell', 'storyboard', 'dialog'\]\.includes\(d\.papier\)/);
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) { assert.match(lies(datei), /43c-kritzel\.js/, datei); assert.match(lies(datei), /43d-ton\.js/, datei); }
  const anl = lies('src/52-anleitung.js');
  for (const t of ['Lasso und Formen', 'Tonnotiz', 'Reiter', 'Gliederung', 'Papiervorlagen']) assert.match(anl, new RegExp("t: '" + t + "'"), 'Anleitung: ' + t);
});

test('Hefte-Vertrag: Umschlag, drei Ansichten, animiertes Wegstellen', () => {
  const d = lies('src/43e-deckel.js');
  assert.match(d, /function baueDeckelElement/);
  assert.match(d, /function heftAtelier/);
  assert.match(d, /function renderHefteRegal/);
  assert.match(d, /function baueRuecken/, 'das Regal zeigt Buchrücken');
  /* FLIP: Lage merken, dann hingleiten — kein Verschwinden und Wiederauftauchen. */
  assert.match(d, /function merkeHeftLagen/);
  assert.match(d, /function spieleHeftLagen/);
  assert.match(lies('src/43-hefte.js'), /merkeHeftLagen\(\);\s*h\.archiv = Date\.now\(\)/, 'Ins Regal stellen merkt sich die Lage');
  /* Alte Einstiege bleiben und zeigen auf das Neue. */
  assert.match(lies('src/43-hefte.js'), /async function heftGestalten\(h, danach\) \{ return heftAtelier\(h, danach\); \}/);
  assert.match(lies('src/43-hefte.js'), /RENDER\.hefte = function \(haupt\) \{ return renderHefteRegal\(haupt\); \};/);
  /* Der Deckel hängt als Knopf im Heftkopf. */
  assert.match(lies('src/43-hefte.js'), /class: 'heft-minideckel'/);
  /* Deckel werden bereinigt; Einstellung der Ansicht ist begrenzt. */
  assert.match(lies('src/30-core.js'), /d\.deckel = typeof saubererDeckel === 'function' \? saubererDeckel\(d\.deckel\) : undefined;/);
  assert.match(lies('src/30-core.js'), /\['karten', 'regal', 'tisch'\]\.includes\(D\.einst\.hefteAnsicht\)/);
  const css = lies('src/10-style.css');
  for (const k of ['.heftdeckel .seitenblock', '.heftdeckel.stoff-leder', '.heftdeckel .gummiband', '.heftdeckel .abnutzung', '.buecherregal', '.heftruecken', '.heft-tisch']) assert.ok(css.includes(k), 'CSS fehlt: ' + k);
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) assert.match(lies(datei), /43e-deckel\.js/, datei);
  const anl = lies('src/52-anleitung.js');
  for (const t of ['Der Umschlag', 'Karten, Regal, Tisch']) assert.match(anl, new RegExp("t: '" + t + "'"), 'Anleitung: ' + t);
});

test('Ruhe-Vertrag: Sync zeichnet nicht mitten ins Schreiben, volle Seiten reichen still weiter', () => {
  const s = lies('src/31-sync.js');
  /* Nur Unterschiede übernehmen, in das vorhandene Objekt hinein (offene Editoren
     halten es), und neu zeichnen nur, wenn sich etwas änderte — nie beim Tippen. */
  assert.match(s, /if \(alt && syncGleich\(ohneIntern\(alt\), ohneIntern\(d\)\)\) continue;/);
  assert.match(s, /Object\.assign\(alt, d\);/);
  assert.match(s, /if \(!veraendert && !_sync\.zeichnenAusstehend\) return;/);
  assert.match(s, /function syncSchreibtGerade/);
  assert.match(s, /if \(syncSchreibtGerade\(\)\) \{\s*_sync\.zeichnenAusstehend = true;/);
  assert.doesNotMatch(s, /\} finally \{ _sync\.uebernimmt = false; \}\s*try \{ baueLeiste\(\); zeichne\(\); \}/, 'der blinde zeichne()-Aufruf darf nicht zurück');
  /* Schreibraum: formatierter Text scrollt den Textbereich, nicht das Fenster. */
  const r = lies('src/45-schreibraum.js');
  assert.match(r, /function zentriereZeileRich/);
  assert.match(r, /if \(_sr\.istRich\) \{ zentriereZeileRich\(false\); return; \}/);
  /* Nachgefuehrt wird ENTPRELLT, nicht bei jedem Anschlag: auf dem iPad
     laeuft danach noch die Autokorrektur, und ein Scroll mittendrin
     verschiebt den Cursor. Und waehrend einer Eingabehilfe gar nicht. */
  assert.match(r, /if \(D\.einst\.typewriter \|\| istRich\) zentriereSpaeter\(\);/);
  assert.match(r, /const zentriereSpaeter = entprellt\(/);
  assert.match(r, /if \(_sr\.komponiert\) return;/);
  assert.match(r, /compositionstart/);
  assert.match(r, /window\.addEventListener\('scroll', srFensterZurueck/);
  /* Und niemals messen, indem etwas in den Text gesetzt wird. */
  assert.doesNotMatch(r, /normalize\(\);/, 'kein normalize() im Schreibraum - das zerstoert die Auswahl');
  assert.doesNotMatch(lies('src/36-caret.js'), /r\.insertNode\(mess\)/, 'nicht in den Text schreiben, um zu messen');
  /* Hefte: Cursor mittendrin auf voller Seite → Überhang wandert still, die Seite bleibt. */
  const h = lies('src/43-hefte.js');
  assert.match(h, /format: 'rich', still: true \}\);/);
  assert.match(h, /format: 'plain', still: true \}\);/);
  assert.match(h, /if \(weiter && weiter\.still\) \{/);
  assert.match(h, /naechste\.rich = paket\.rich \+ \(naechste\.rich \|\| ''\)/, 'stiller Überhang kommt VOR den Anfang der nächsten Seite');
});

test('Welle-3-Vertrag: Karteikarten und Pfeile', () => {
  const w = lies('src/47-woerter.js');
  assert.match(w, /wortkisteAbfragen\(aktiveKiste, titel\)/, 'der Abfragen-Knopf an der Kiste');
  assert.match(w, /woerterInKiste\(aktiveKiste\)\.length >= 2 \?/, 'erst ab zwei Wörtern');
  const kk = lies('src/47b-karteikarten.js');
  assert.match(kk, /function karteikartenReihenfolge/);
  assert.match(kk, /function karteikartenBilanz/);
  assert.match(kk, /w\.abgefragt = Date\.now\(\);/, 'Stand liegt am Wort');
  assert.match(lies('src/30-core.js'), /for \(const k of \['gewusst', 'verfehlt'\]\)/, 'Zähler werden bereinigt');
  assert.match(lies('src/43c-kritzel.js'), /art: 'pfeil'/);
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) assert.match(lies(datei), /47b-karteikarten\.js/, datei);
  const anl = lies('src/52-anleitung.js');
  for (const t of ['Abfragen (Karteikarten)', 'Pfeile']) assert.match(anl, new RegExp("t: '" + t.replace(/[()]/g, '\\$&') + "'"), 'Anleitung: ' + t);
});

test('Atelier-Vertrag: das Atelier ist ein Fenster, Tisch und Regal lassen sich einrichten', () => {
  const d = lies('src/43e-deckel.js');
  assert.match(d, /class: 'atelier-raster'/);
  assert.match(d, /class: 'atelier-felder'/);
  assert.match(d, /function tischEinrichten/);
  assert.match(d, /function saubererTisch/);
  assert.match(d, /tischEinrichten\(\(\) => zeichne\(\)\)/, 'jede Wahl zeigt sich sofort hinter dem Fenster');
  assert.match(d, /' platte-' \+ tisch\.platte \+ ' groesse-' \+ tisch\.groesse/);
  assert.match(lies('src/30-core.js'), /D\.einst\.tisch = saubererTisch\(D\.einst\.tisch\)/);
  const css = lies('src/10-style.css');
  for (const k of ['.atelier-raster { display: grid; grid-template-columns: 300px', '.atelier-links { position: sticky;', '.atelier-felder { overflow: auto;', '.platte-nuss .heft-tisch', '.groesse-gross .heft-tisch', '.ordentlich .heft-halter']) assert.ok(css.includes(k), 'CSS fehlt: ' + k);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.modal\.heft-atelier \{ overflow: auto;/, 'schmal: untereinander und scrollbar');
  const anl = lies('src/52-anleitung.js');
  assert.match(anl, /t: 'Tisch und Regal einrichten'/);
});

test('Schreibtisch-Vertrag: ein eigener Raum, der Lesestapel liegt lokal, pdf.js reist mit', () => {
  assert.match(lies('src/40-router.js'), /\{ id: 'schreibtisch', name: 'Schreibtisch', icon: 'schreibtisch' \}/);
  const d = lies('src/54-schreibtisch.js');
  for (const f of ['RENDER.schreibtisch', 'function saubererSchreibtisch', 'function mondphase', 'function briefIstOffen', 'function schubladeOeffnen', 'function baueLeuchter', 'function baueLampe', 'function baueUhr', 'function schreibtischEinrichten']) assert.ok(d.includes(f), f);
  const l = lies('src/55-lesestapel.js');
  for (const f of ['function pdfjsLaden', 'function buchAuflegenAusBlob', 'function buchOeffnen', 'function leserGliederung', 'function leserLesezeichen', 'function leserZitat', 'function leserEinstellungen', 'function buecherAusOrdner', 'function buchAusGoodnotesArchiv']) assert.ok(l.includes(f), f);
  /* pdf.js: als .js (nicht .mjs), sonst liefern Server es als octet-stream und das Modul lädt nicht */
  assert.match(l, /import\('\.\/vendor\/pdf\.min\.js'\)/);
  for (const f of ['vendor/pdf.min.js', 'vendor/pdf.worker.min.js', 'vendor/pdf.js-LICENSE.txt']) assert.ok(existsSync(join(wurzel, f)), f + ' fehlt');
  assert.ok(JSON.parse(lies('package.json')).build.files.includes('vendor/**'), 'vendor/** muss in die Desktop-App');
  assert.match(lies('hosting/scripts/copy-vani.mjs'), /'vendor'/);
  /* Bücher liegen nur im Medienvorrat — nie als Dateien im Repo. */
  const dateien = lies('build.sh') + lies('werkzeug/build-web.mjs');
  assert.doesNotMatch(dateien, /\.pdf/, 'keine PDF im Build');
  /* Ein Bücherkoffer darf da sein — aber nur verschlüsselt (.enc) plus Manifest, nie eine PDF. */
  if (existsSync(join(wurzel, 'buecher'))) {
    for (const f of readdirSync(join(wurzel, 'buecher'))) assert.ok(/\.enc$|^koffer\.json$/.test(f), 'nur Kofferdateien im Bücherordner: ' + f);
  }
  assert.match(lies('werkzeug/buecherkoffer.mjs'), /aes-256-gcm/);
  assert.match(l, /function kofferEntschluesseln/);
  assert.match(l, /magie !== 'VANIBUCH1'/);
  /* Leseeinstellungen bleiben am Gerät (localStorage), Seite/Lesezeichen am Dokument. */
  assert.match(l, /localStorage\.setItem\('vani-lese'/);
  assert.match(l, /b\.seite = leser\.seite; b\.zuletzt = Date\.now\(\); speichereStill\(b\);/);
  /* Desktop: Bücherordner nur lesen, nur dort. */
  const m = lies('desktop/main.cjs');
  assert.match(m, /ipcMain\.handle\('vani:buecher-liste'/);
  assert.match(m, /voll\.startsWith\(w \+ path\.sep\)/, 'nur aus den Bücherordnern lesen');
  assert.match(lies('desktop/preload.cjs'), /buecherListe: \(\) => ipcRenderer\.invoke\('vani:buecher-liste'\)/);
  /* Sanitizer kennt Bücher und Briefe */
  const c = lies('src/30-core.js');
  assert.match(c, /if \(d\.typ === 'buch'\) \{/);
  assert.match(c, /if \(d\.typ === 'brief'\) \{/);
  assert.match(c, /if \(k === 'lesezeichen' && d\.typ === 'buch'\) continue;/);
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) { assert.match(lies(datei), /54-schreibtisch\.js/, datei); assert.match(lies(datei), /55-lesestapel\.js/, datei); }
  const anl = lies('src/52-anleitung.js');
  assert.match(anl, /id: 'schreibtisch'/);
  for (const t of ['Die Schublade', 'Brief an mich', 'Der Lesestapel', 'Der Lesemodus']) assert.match(anl, new RegExp("t: '" + t + "'"), 'Anleitung: ' + t);
});

test('Malerei-Vertrag: Regen ohne Kachel, Schnur mit Feder, Leuchter brennt ab, Leiste rollt', () => {
  const m = lies('src/54b-schreibtisch-malerei.js');
  assert.match(m, /function schreibtischMaler/);
  assert.match(m, /function schreibtischJahreszeit/);
  assert.match(m, /function schreibtischTageslicht/);
  /* Regen sind Tropfen mit eigener Lage — keine wiederholte Kachel. */
  assert.match(m, /const tropfen = Array\.from/);
  assert.doesNotMatch(lies('src/10-style.css'), /regen-faellt/, 'der gekachelte CSS-Regen darf nicht zurück');
  const d = lies('src/54-schreibtisch.js');
  assert.match(d, /function schnurSchritt/);
  assert.match(d, /function baueLampe/);
  assert.match(d, /if \(maxZug >= SCHWELLE\) \{ umschalten\(\);/, 'Zug über die Schwelle schaltet');
  /* Die Schnur ist frei (2D): Pfad im SVG, Knauf folgt in x und y, Feder in beiden Richtungen. */
  assert.match(d, /document\.createElementNS\(NS, 'path'\)/);
  assert.match(d, /z\.x = dx; z\.y = dy - RUHE;/);
  assert.match(d, /if \(typeof z\.y === 'number'\) \{/, 'schnurSchritt kennt zwei Richtungen');
  /* Bücherbord statt Stapel — jedes Buch greifbar */
  assert.match(d, /class: 'bord-buch'/);
  assert.doesNotMatch(d, /class: 'stapel-buch'/);
  /* Cover per ISBN */
  const lz2 = lies('src/55-lesestapel.js');
  for (const f of ['function isbnZu10', 'function isbnAusText', 'function isbnAusPdf', 'function coverVonIsbn', 'function buchCoverAusDemNetz', 'function schoeneCoverHolen']) assert.ok(lz2.includes(f), f);
  assert.match(lz2, /blob\.size > 5000/, 'ein Platzhalter-Bildchen zählt nicht als Cover');
  assert.match(lies('buecher/koffer.json'), /"isbn": "3791504673"/);
  /* Malerei: Licht schmilzt ein, Staub, Motte, Parallaxe */
  const m2 = lies('src/54b-schreibtisch-malerei.js');
  assert.match(m2, /lampeJetzt \+= \(ziel - lampeJetzt\)/);
  assert.match(m2, /const staub = Array\.from/);
  assert.match(m2, /motte = \{ t: 0/);
  assert.match(m2, /opt\.parallax\.x/);
  assert.match(d, /function leuchterStand/);
  assert.match(d, /function schreibtischWachsVerbrennen/);
  assert.match(lies('src/45-schreibraum.js'), /schreibtischWachsVerbrennen\(sp\.minuten\)/, 'jede Kerze im Schreibraum nimmt dem Leuchter Wachs');
  assert.match(d, /function papierkorbAmTisch/);
  assert.match(d, /function baueUhr/);
  const css = lies('src/10-style.css');
  assert.match(css, /\.raumrolle \{[^}]*overflow-y: auto;/, 'die Räume rollen, Suche und Feinheiten bleiben');
  for (const datei of ['werkzeug/build-web.mjs', 'build.sh', 'test/sandkasten.mjs']) assert.match(lies(datei), /54b-schreibtisch-malerei\.js/, datei);
  const lz = lies('src/55-lesestapel.js');
  for (const f of ['function leserNotizen', 'function leserSuche', 'function leserVorlesen', 'function buecherkofferHolen', 'function buchSeiteGelesen']) assert.ok(lz.includes(f), f);
  assert.match(lies('src/41-zuhause.js'), /weiterlesen-karte/);
});

test('Umzugs-Vertrag: die alte Adresse leitet nicht blind weiter', () => {
  /* Die Umzugsseite zählt erst nach, ob dort noch ein Bestand liegt. Vorher
     leitete sie nach fünf Sekunden weiter — auf einem Schul-iPad ohne
     Dateiauswahl war das der Verlust des einzigen Rettungswegs. */
  const q = lies('hosting/scripts/copy-vani.mjs');
  assert.match(q, /indexedDB\.open\(name\)/);
  assert.match(q, /Alten Bestand retten/);
  assert.doesNotMatch(q, /\),5000\)\)/, 'der blinde 5-Sekunden-Redirect darf nicht zurückkommen');
  assert.match(q, /summe>0/);
  /* Rettungsmodus führt direkt zum Umzugshelfer. */
  assert.match(lies('src/60-boot.js'), /umzugsHelfer\(\)/);
});

test('Klangvertrag: der Fundus lässt sich durchsuchen', () => {
  /* Bei über sechzig Aufnahmen über acht Blöcke ist Scrollen keine Bedienung
     mehr. Die Suche filtert nach Name UND Kategorie, blendet leere
     Überschriften aus und sagt, wenn nichts passt. */
  const q = lies('src/51-klangraum.js');
  assert.match(q, /class: 'klang-suche'/, 'das Suchfeld fehlt');
  assert.match(q, /\.name \|\| ''\)\.toLowerCase\(\)\.includes\(filter\)/, 'Suche nach Namen fehlt');
  assert.match(q, /\.kat \|\| ''\)\.toLowerCase\(\)\.includes\(filter\)/, 'Suche nach Kategorie fehlt');
  assert.match(q, /if \(!drin\.length\) continue;/, 'leere Kategorieblöcke müssen wegfallen');
  assert.match(q, /Nichts gefunden zu/, 'ohne Treffer braucht es eine Rückmeldung');
  /* Das Feld darf beim Neuaufbau der Liste nicht mitgelöscht werden, sonst
     verliert man nach jedem Buchstaben den Eingabefokus. */
  assert.match(q, /wurzel\.append\(el\('div', \{ class: 'klang-suchzeile' \}/,
    'das Suchfeld gehört neben die Liste, nicht hinein');
  assert.match(lies('src/10-style.css'), /\.klang-suche \{/, 'der Stil dazu fehlt');
});

test('Klangvertrag: der Fundus liegt neben der App und reist in die Desktop-Fassung mit', () => {
  const paket = JSON.parse(lies('package.json'));
  assert.ok(paket.build.files.includes('klang/**'), 'ohne diesen Eintrag fehlen der Desktop-App alle Aufnahmen');
  assert.match(lies('hosting/scripts/copy-vani.mjs'), /'klang'/, 'auch die gehostete Fassung braucht sie');
  /* Das Werkzeug, das den Katalog schreibt, muss vorhanden und lesbar sein. */
  assert.ok(existsSync(join(wurzel, 'werkzeug', 'klang-katalog.mjs')));
});

test('Hover-Vertrag: keine :hover-Regel steht ohne den Schutz für Zeigegeräte', () => {
  /* Auf dem iPad bleibt ein :hover nach dem Tippen kleben und sieht aus wie
     eine Auswahl, die man nicht mehr loswird. Deshalb gehört jede
     Hover-Regel hinter `@media (hover: hover) and (pointer: fine)`. */
  const zeilen = lies('src/10-style.css').split('\n');
  let tiefe = 0, inWache = false, wacheTiefe = 0;
  const offen = [];
  zeilen.forEach((z, i) => {
    if (z.includes('@media') && z.includes('hover: hover')) { inWache = true; wacheTiefe = tiefe; }
    if (z.includes(':hover') && z.includes('{') && !inWache) offen.push((i + 1) + ': ' + z.trim().split('{')[0].trim());
    tiefe += (z.split('{').length - 1) - (z.split('}').length - 1);
    if (inWache && tiefe <= wacheTiefe) inWache = false;
  });
  assert.equal(offen.length, 0, 'ungeschützte Hover-Regeln:\n' + offen.join('\n'));
});

test('Hover-Vertrag: was nicht am Zeiger hängt, bleibt draußen', () => {
  /* Beim Schützen darf nichts mitgenommen werden, was auf dem iPad gebraucht
     wird: Zieh- und Fokuszustände müssen ungeschützt stehen bleiben. */
  const css = lies('src/10-style.css');
  for (const noetig of ['.heftruecken.zieht', '.scrollleiste.zieht .sl-griff', '.bord-buch:focus-visible', '.salon-sessel:focus-visible', '.alb-name:focus-visible .alb-nameunter']) {
    const stelle = css.indexOf(noetig);
    assert.ok(stelle > 0, 'fehlt ganz: ' + noetig);
    const zeile = css.slice(css.lastIndexOf('\n', stelle) + 1, css.indexOf('\n', stelle));
    assert.ok(!zeile.includes('hover: hover'), noetig + ' steckt in der Hover-Wache und wäre auf dem iPad weg');
  }
});

test('Stück-Vertrag: was auf der Doppelseite steht, liegt im Fluss', () => {
  /* `.alb-band` gab es zweimal: als Zeile „Kommt vor in" und als
     Lesebändchen. Die Bändchen-Regel machte die Zeile absolut positioniert,
     und die Geschichten schwebten quer über den anderen Einträgen.

     Deshalb hier schwarz auf weiß: keines der Stücke, die auf der Seite
     stehen, darf jemals absolut positioniert werden. Das Bändchen heißt
     jetzt `.alb-leseband` und hängt am Block, nicht am Text. */
  const css = lies('src/10-style.css');
  const zeilen = css.split('\n');
  const stuecke = ['alb-band', 'alb-zeile', 'alb-liste', 'alb-karte', 'alb-notiz', 'alb-wolke',
    'alb-sprueche', 'alb-faeden', 'alb-zeitleiste', 'alb-frage', 'alb-zettelbrett', 'alb-motto',
    'alb-etikettreihe', 'alb-stuecke', 'alb-seiteninhalt', 'alb-seitenfuss'];
  const fehler = [];
  zeilen.forEach((z, i) => {
    const sel = z.split('{')[0];
    if (!z.includes('{')) return;
    for (const k of stuecke) {
      /* Nur wenn die Klasse das ZIEL der Regel ist, nicht als Vorfahre */
      const endet = sel.trim().endsWith('.' + k) || sel.includes('.' + k + ',') || sel.includes('.' + k + ' {');
      if (!endet) continue;
      let t = 0, txt = '';
      for (let j = i; j < zeilen.length; j++) { txt += zeilen[j]; t += (zeilen[j].split('{').length - 1) - (zeilen[j].split('}').length - 1); if (t <= 0) break; }
      if (txt.replace(/\s/g, '').includes('position:absolute') || txt.replace(/\s/g, '').includes('position:fixed')) {
        fehler.push((i + 1) + ': ' + sel.trim());
      }
    }
  });
  assert.equal(fehler.length, 0, 'Stück schwebt über der Seite statt im Fluss zu liegen:\n' + fehler.join('\n'));
});

test('Stück-Vertrag: das Lesebändchen heißt nicht wie ein Feld', () => {
  const css = lies('src/10-style.css');
  const buch = lies('src/62b-album-buch.js');
  assert.ok(css.includes('.alb-leseband'), 'das Bändchen hat einen eigenen Namen');
  assert.ok(buch.includes("'alb-leseband'"), 'und das Buch vergibt ihn auch');
  assert.ok(!buch.includes("class: 'alb-band'"), 'das Bändchen trägt nicht mehr den Namen der Feldzeile');
});

test('Deckvertrag: kein Deck überlebt einen Ortswechsel', () => {
  /* Wer aus einem offenen Kabinettfach heraus die Adresse wechselte, ließ
     Schleier und Inhalt im Dokument stehen — samt einer vollständigen
     Stadtkarte. Beim nächsten Öffnen lag das nächste darüber. Nach sieben
     Besuchen waren sieben Regale im DOM. */
  const kern = lies('src/30-core.js');
  const anfang = kern.indexOf('function zeigeDeck(');
  assert.ok(anfang > 0, 'zeigeDeck gibt es');
  const stueck = kern.slice(anfang, kern.indexOf('\n}', anfang));

  assert.match(stueck, /addEventListener\('hashchange'/, 'ein Deck horcht auf den Ortswechsel');
  assert.match(stueck, /removeEventListener\('hashchange'/, 'und meldet sich beim Schließen wieder ab');
  /* Die Adresse beim Aufziehen wird gemerkt — sonst schlösse sich ein Deck,
     das gerade DURCH eine Navigation entsteht, sofort selbst wieder. */
  assert.match(stueck, /location\.hash/, 'die Adresse beim Aufziehen wird gemerkt');
  assert.ok(/if \(location\.hash !== \w+\)/.test(stueck), 'geschlossen wird nur bei einer ANDEREN Adresse');
});

test('Kartenvertrag: jede Anlage kann eine Mauer bekommen', () => {
  /* Das Schachbrett legt keine Ringe an und bekam deshalb gar keine Mauer,
     obwohl der Haken gesetzt war. */
  const plan = lies('src/65-stadtplan.js');
  const anfang = plan.indexOf('/* --- Die Mauer');
  assert.ok(anfang > 0, 'der Mauerabschnitt ist auffindbar');
  const stueck = plan.slice(anfang, anfang + 2600);
  assert.match(stueck, /if \(!ring\)/, 'fehlt der Mauerweg, wird ein Kranz gerechnet');
  assert.match(stueck, /sektoren/, 'und zwar über Winkelsektoren um die Stadt');
});

test('Zoomvertrag: ein Finger rollt, zwei Finger zoomen', () => {
  const css = lies('src/10-style.css');

  /* `pan-x pan-y` ist die Ansage an den Browser: rollen darfst du, den
     Seitenzoom lass mir. Ohne sie zoomt bei zwei Fingern die ganze Seite
     statt der Karte. */
  const flaechen = [
    (css.match(/\.tep-flaeche \{[\s\S]*?\}/) || [''])[0],
    (css.match(/\.kt-flaeche \{[\s\S]*?\}/) || [''])[0]
  ];
  for (const f of flaechen) {
    assert.match(f, /touch-action: pan-x pan-y/, 'die rollende Flaeche gibt den Zoom nicht ab');
  }

  /* Wer auf einem Namen oder einer Marke anfaengt, zieht das Ding — und
     rollt nicht die Flaeche darunter. Ohne `touch-action: none` kaempfen
     Zug und Rollen gegeneinander, und beides fuehlt sich kaputt an. */
  assert.match(css, /\.tep-person \{[^}]*touch-action: none/, 'ein Name laesst sich ziehen');
  assert.match(css, /\.kt-marke \{[^}]*touch-action: none/, 'eine Marke laesst sich ziehen');
});

test('Zoomvertrag: beim Kneifen wird nicht neu gezeichnet', () => {
  /* Ein SVG laesst sich ueber `width`/`height` verlustfrei skalieren. Wer
     stattdessen bei jedem Bild die ganze Karte neu baut, bekommt drei
     Bilder in der Sekunde statt sechzig. */
  const kern = lies('src/30-core.js');
  const anfang = kern.indexOf('function zweiFingerZoom(');
  assert.ok(anfang > 0, 'den Helfer gibt es');
  const stueck = kern.slice(anfang, kern.indexOf('\n}', anfang));

  assert.match(stueck, /opts\.zeige\(/, 'waehrend des Kneifens wird nur die Groesse gesetzt');
  assert.match(stueck, /opts\.fertig/, 'erst am Ende wird festgeschrieben');
  assert.match(stueck, /getBoundingClientRect/, 'die Stelle unter den Fingern wird gemessen, nicht gerechnet');
  assert.match(stueck, /scrollLeft \+=/, 'und die Flaeche wird nachgefuehrt');
  /* Strg + Rad ist dieselbe Bewegung auf dem Trackpad — und ohne
     preventDefault zoomt das Fenster statt der Karte. */
  assert.match(stueck, /passive: false/, 'das Rad wird nicht passiv behandelt');
  assert.match(stueck, /preventDefault/, 'und der Seitenzoom unterbunden');

  /* Beide Werkzeuge haengen daran. */
  for (const datei of ['src/63b-stammbaum-teppich.js', 'src/65b-stadtplan-karte.js']) {
    assert.match(lies(datei), /zweiFingerZoom\(/, datei + ' kennt das Kneifen');
  }
});

test('Kartenvertrag: eine neue Marke reisst kein Fenster auf', () => {
  /* Vorher sprang beim Setzen sofort ein Aenderungsfenster auf: man musste
     es wegklicken, bevor man sehen konnte, WO die Marke gelandet ist — und
     der naechste Tipp legte gleich die naechste an. */
  const blatt = lies('src/65c-stadtplan-blatt.js');
  const anfang = blatt.indexOf('function planMarkeAnlegen(');
  assert.ok(anfang > 0);
  const stueck = blatt.slice(anfang, blatt.indexOf('\n}', anfang));
  assert.ok(!/planMarkeBearbeiten/.test(stueck), 'kein Fenster beim Setzen');
  assert.match(stueck, /_kt\.nurMarke = marke\.id/, 'die neue Marke kommt in den Blick');
  assert.match(stueck, /_kt\.werkzeug = 'hand'/, 'und das Werkzeug geht zurueck auf die Hand');
});

test('Teppichvertrag: Namen lassen sich frei setzen und ausrichten', () => {
  const tep = lies('src/63b-stammbaum-teppich.js');

  /* Das grobe Viertelraster stand dem freien Verschieben im Weg. */
  assert.ok(!/Math\.round\(rasterX \* 4\) \/ 4/.test(tep), 'kein Viertelraster mehr');
  assert.match(tep, /Math\.round\(rasterX \* 100\) \/ 100/, 'frei abgelegt');

  /* Geordnet wird ueber das Einrasten an den Nachbarn — sonst bekommt man
     eine Generation nie in eine Flucht. */
  assert.match(tep, /function teppichAusrichten\(/, 'es gibt ein Einrasten');
  assert.match(tep, /function teppichHilfslinien\(/, 'und eine sichtbare Hilfslinie');
  assert.match(tep, /teppichHilfslinienWeg\(\)/, 'die auch wieder verschwindet');

  /* In diesem Teppich laeuft die Zeit von links nach rechts: eine
     Generation ist eine SPALTE. Wer alle auf dieselbe HOEHE setzt, stapelt
     sie aufeinander — genau das war der erste Versuch. */
  const anfang = tep.indexOf('function teppichReiheAusrichten(');
  assert.ok(anfang > 0, 'es gibt das Begradigen');
  const stueck = tep.slice(anfang, tep.indexOf('\n}\n', anfang));
  assert.match(stueck, /person\.festX = Math\.round\(ich\.x/, 'alle in dieselbe Spalte');
  assert.match(stueck, /person\.festY = Math\.round\(k\.y/, 'jeder behaelt seine Zeile');

  /* Mit dem Finger trifft man keinen halben Bildpunkt. */
  assert.match(tep, /function teppichPersonSchubsen\(/, 'die Pfeiltasten setzen genau');
  assert.match(tep, /Arrow\(Up\|Down\|Left\|Right\)/, 'und sind angeschlossen');
});
