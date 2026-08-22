import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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

test('Am-Stück-Vertrag: die Werkzeuge stehen einmal oben, nicht bei jedem Stück', () => {
  const hefte = lies('src/43-hefte.js');
  assert.match(hefte, /function seitenWerkzeuge\(ziel/, 'eine gemeinsame Werkzeugreihe');
  assert.match(hefte, /optionen\.fluss \? null : seitenWerkzeuge/, 'im Fluss keine Reihe je Stück');
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
