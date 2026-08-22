/* ================================================================
   VANI — Ankommen: alles hereinholen, auch ohne Datei.

   Manche Geräte (Schul-iPads mit Verwaltungsprofil) lassen keine Dateiauswahl
   zu. Dann bleibt trotzdem jeder Weg offen: über die Zwischenablage oder den
   Kopplungscode. Dieses Modul erkennt, was jemand einfügt — eine Sicherung,
   einen Kopplungscode, einen WhatsApp-Verlauf, den Text-Export eines älteren
   VANI, einen Text mit Überschriften oder einfach Text — und legt es dort ab,
   wo es hingehört. Die Erkenner sind pur und werden einzeln getestet.
   ================================================================ */

/* ----- Erkennen ----- */

/* WhatsApp-Verlauf: „12.03.23, 14:05 - Name: Text" (Android) oder
   „[12.03.23, 14:05:33] Name: Text" (iPhone). Zeilen ohne Datum gehören zur
   Nachricht davor. Systemzeilen ohne „Name:" zählen als Sonstiges. */
function whatsappZerlegen(roh) {
  const kopf = /^‎?\[?(\d{1,2})\.(\d{1,2})\.(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\]?\s*(?:-\s*)?([^:\n]{1,80}?):\s?(.*)$/;
  const nachrichten = [];
  let sonst = 0;
  for (const zeile of String(roh || '').split(/\r?\n/)) {
    const m = zeile.match(kopf);
    if (m) {
      let jahr = Number(m[3]);
      if (jahr < 100) jahr += 2000;
      const wann = new Date(jahr, Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]), Number(m[6] || 0)).getTime();
      nachrichten.push({ wann: Number.isFinite(wann) ? wann : 0, wer: m[7].trim(), text: m[8] });
    } else if (nachrichten.length && zeile.trim()) {
      nachrichten[nachrichten.length - 1].text += '\n' + zeile;
    } else if (zeile.trim()) sonst++;
  }
  for (const n of nachrichten) n.text = n.text.trim();
  return { nachrichten: nachrichten.filter((n) => n.text), sonst };
}

/* Text mit Überschriften: „# Titel", „## Titel" oder unterstrichen mit ===/---.
   Was vor der ersten Überschrift steht, ist der Vorspann. */
function markdownZerlegen(roh) {
  const zeilen = String(roh || '').split(/\r?\n/);
  const teile = [];
  const vorspann = [];
  let akt = null;
  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i];
    const raute = z.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    const naechste = zeilen[i + 1] || '';
    const unterstrichen = !raute && z.trim() && z.trim().length <= 120 && /^(={3,}|-{3,})\s*$/.test(naechste)
      ? (naechste.trim()[0] === '=' ? 1 : 2) : 0;
    if (raute || unterstrichen) {
      akt = { ebene: raute ? raute[1].length : unterstrichen, titel: (raute ? raute[2] : z).trim(), zeilen: [] };
      teile.push(akt);
      if (unterstrichen) i++;
    } else if (akt) akt.zeilen.push(z);
    else vorspann.push(z);
  }
  return {
    vorspann: vorspann.join('\n').trim(),
    teile: teile.map((t) => ({ ebene: t.ebene, titel: t.titel, text: t.zeilen.join('\n').trim() }))
  };
}

/* Der Text-Export eines VANI — „Nur Texte kopieren" gibt es seit der allerersten
   Fassung. Daraus lassen sich Projekte, Hefte und Schnipsel zurückbauen. Seiten
   und Szenen ohne Titel standen im Export ohne Trennung hintereinander; sie
   kommen deshalb als ein Stück zurück — mehr gab der Export nie her. */
function vaniTextZerlegen(roh) {
  const zeilen = String(roh || '').split(/\r?\n/);
  const aus = { projekte: [], hefte: [], schnipsel: [] };
  let block = null, kapitel = null, stueck = null, heft = null;
  const jetzt = new Date();
  const schnipselDatum = (t) => {
    /* „Mo, 20. Aug" — ohne Jahr. Liegt der Tag in der Zukunft, war es voriges Jahr. */
    const m = t.match(/^(?:So|Mo|Di|Mi|Do|Fr|Sa),\s*(\d{1,2})\.\s*([A-Za-zäöü]+)$/);
    if (!m) return 0;
    const monat = ['jan', 'feb', 'mär', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dez'].indexOf(m[2].toLowerCase().slice(0, 3));
    if (monat < 0) return 0;
    let d = new Date(jetzt.getFullYear(), monat, Number(m[1]), 12);
    if (d.getTime() > jetzt.getTime() + 86400000) d = new Date(jetzt.getFullYear() - 1, monat, Number(m[1]), 12);
    return d.getTime();
  };
  const textZu = (ziel, z) => { if (!ziel) return; ziel.zeilen.push(z); };
  for (const z of zeilen) {
    let m;
    if ((m = z.match(/^══ PROJEKT: (.*?) ══$/))) { block = { art: 'projekt', titel: m[1].trim() || 'Projekt', kapitel: [] }; aus.projekte.push(block); kapitel = null; stueck = null; continue; }
    if ((m = z.match(/^══ HEFT: (.*?) ══$/))) { block = heft = { art: 'heft', titel: m[1].trim() || 'Heft', seiten: [] }; aus.hefte.push(heft); stueck = null; continue; }
    if (/^══ SCHNIPSEL ══$/.test(z)) { block = { art: 'schnipsel' }; stueck = null; continue; }
    if (!block) continue;
    if (block.art === 'projekt') {
      if ((m = z.match(/^— (.*) —$/))) { kapitel = { titel: m[1].trim() || 'Kapitel', szenen: [] }; block.kapitel.push(kapitel); stueck = null; continue; }
      if (!kapitel) { if (z.trim()) { kapitel = { titel: 'Kapitel 1', szenen: [] }; block.kapitel.push(kapitel); } else continue; }
      if ((m = z.match(/^· (.*)$/))) { stueck = { titel: m[1].trim(), zeilen: [] }; kapitel.szenen.push(stueck); continue; }
      if (!stueck) { if (!z.trim()) continue; stueck = { titel: '', zeilen: [] }; kapitel.szenen.push(stueck); }
      textZu(stueck, z);
    } else if (block.art === 'heft') {
      if ((m = z.match(/^· (.*)$/))) { stueck = { titel: m[1].trim(), zeilen: [], zettel: [] }; heft.seiten.push(stueck); continue; }
      if ((m = z.match(/^\[Zettel\] (.*)$/))) { if (!stueck) { stueck = { titel: '', zeilen: [], zettel: [] }; heft.seiten.push(stueck); } stueck.zettel.push(m[1]); continue; }
      if (!stueck) { if (!z.trim()) continue; stueck = { titel: '', zeilen: [], zettel: [] }; heft.seiten.push(stueck); }
      textZu(stueck, z);
    } else if (block.art === 'schnipsel') {
      if ((m = z.match(/^((?:So|Mo|Di|Mi|Do|Fr|Sa),\s*\d{1,2}\.\s*[A-Za-zäöü]+): (.*)$/))) {
        stueck = { wann: schnipselDatum(m[1]), zeilen: [m[2]] }; aus.schnipsel.push(stueck); continue;
      }
      if (stueck && z.trim()) stueck.zeilen.push(z);
    }
  }
  const fertig = (s) => ({ ...s, text: s.zeilen.join('\n').trim(), zeilen: undefined });
  for (const p of aus.projekte) for (const k of p.kapitel) k.szenen = k.szenen.map(fertig).filter((s) => s.text || s.titel);
  for (const h of aus.hefte) h.seiten = h.seiten.map(fertig).filter((s) => s.text || s.titel || (s.zettel && s.zettel.length));
  aus.schnipsel = aus.schnipsel.map(fertig).filter((s) => s.text);
  return aus;
}

/* Was ist das, was da eingefügt wurde? Reihenfolge: das Eindeutige zuerst. */
function erkenneEinfuegeInhalt(roh) {
  const text = String(roh || '').replace(/^﻿/, '');
  const t = text.trim();
  if (!t) return { art: 'leer' };
  if (/^VANI1-[A-Za-z0-9+/=._~-]{8,}$/.test(t)) return { art: 'kopplungscode', code: t };
  if (t[0] === '{') {
    let paket = null;
    try { paket = JSON.parse(t); } catch (e) { return { art: 'kaputt', grund: 'unvollstaendig' }; }
    if (typeof pruefeSicherung === 'function' && pruefeSicherung(paket)) return { art: 'sicherung', paket };
    return { art: 'kaputt', grund: 'fremd' };
  }
  if (/^══ (PROJEKT: .*|HEFT: .*|SCHNIPSEL) ══$/m.test(t)) {
    const v = vaniTextZerlegen(t);
    if (v.projekte.length || v.hefte.length || v.schnipsel.length) return { art: 'vanitext', ...v };
  }
  const wa = whatsappZerlegen(t);
  if (wa.nachrichten.length >= 3 && wa.nachrichten.length >= wa.sonst) return { art: 'whatsapp', nachrichten: wa.nachrichten, sonst: wa.sonst };
  const md = markdownZerlegen(t);
  if (md.teile.length >= 2) return { art: 'gegliedert', vorspann: md.vorspann, teile: md.teile };
  return { art: 'text', text: t };
}

/* Zusammenfassung einer Menge Dokumente — fürs „Das ist angekommen". */
const ANKUNFT_NAMEN = {
  projekt: ['Projekt', 'Projekte'], kapitel: ['Kapitel', 'Kapitel'], szene: ['Szene', 'Szenen'],
  heft: ['Heft', 'Hefte'], seite: ['Seite', 'Seiten'], zettel: ['Zettel', 'Zettel'], foto: ['Foto', 'Fotos'],
  blatt: ['Blatt', 'Blätter'], schnipsel: ['Schnipsel', 'Schnipsel'], faden: ['Fadennachricht', 'Fadennachrichten'],
  board: ['Brett', 'Bretter'], blase: ['Blase', 'Blasen'], gruppe: ['Gruppe', 'Gruppen'], brettbild: ['Brettbild', 'Brettbilder'],
  wort: ['Wort', 'Wörter'], wortkiste: ['Wortkiste', 'Wortkisten'], funke: ['Funke', 'Funken'],
  mischung: ['Klangmischung', 'Klangmischungen'], klangbild: ['Klangbild', 'Klangbilder'], klang: ['eigener Klang', 'eigene Klänge'],
  goodnote: ['Goodnotes-Datei', 'Goodnotes-Dateien'], figur: ['Figur', 'Figuren'], ort: ['Ort', 'Orte']
};
function ankunftZusammenfassen(docs, medien = 0) {
  const zaehler = {};
  let woerter = 0;
  for (const d of docs) {
    if (!d || !d.typ) continue;
    zaehler[d.typ] = (zaehler[d.typ] || 0) + 1;
    woerter += worte(d.text || '');
  }
  const reihenfolge = Object.keys(ANKUNFT_NAMEN);
  const zeilen = Object.entries(zaehler)
    .sort((a, b) => (reihenfolge.indexOf(a[0]) + 1 || 99) - (reihenfolge.indexOf(b[0]) + 1 || 99))
    .map(([typ, n]) => n + ' ' + ((ANKUNFT_NAMEN[typ] || [typ, typ])[n === 1 ? 0 : 1]));
  if (medien) zeilen.push(medien + (medien === 1 ? ' Bild oder Datei' : ' Bilder und Dateien'));
  return { zaehler, woerter, zeilen, gesamt: docs.length };
}

/* ----- Sicherung: packen und einspielen (von Datei und Zwischenablage geteilt) ----- */

async function baueSicherungsPaket({ mitMedien = true } = {}) {
  const media = {};
  if (mitMedien) {
    const ids = new Set();
    for (const d of D.docs.values()) { if (d.bild) ids.add(d.bild); if (d.skizze) ids.add(d.skizze); if (d.datei) ids.add(d.datei); }
    for (const id of ids) {
      const blob = await dbGet('media', id);
      if (blob) media[id] = await blobZuDataURL(blob);
    }
  }
  return {
    vani: 2, wann: Date.now(),
    docs: [...D.docs.values()],
    einst: D.einst,
    stats: D.stats,
    media,
    sync: await dbAlle('sync')
  };
}

/* Spielt ein geprüftes Paket ein. „dazu" lässt Vorhandenes in Ruhe, „ersetzen"
   räumt vorher alles weg. Gibt zurück, was wirklich neu angekommen ist. */
async function sicherungEinspielen(paket, modus) {
  if (modus === 'ersetzen') {
    await dbTu('docs', 'readwrite', (s) => s.clear());
    await dbTu('media', 'readwrite', (s) => s.clear());
    await dbTu('sync', 'readwrite', (s) => s.clear());
    D.docs.clear();
  }
  const neu = [];
  let uebersprungen = 0;
  const benoetigteMedien = new Set();
  for (const roh of paket.docs) {
    const d = sauberesDokument(roh);
    if (!d) continue;
    if (modus === 'dazu' && D.docs.has(d.id)) { uebersprungen++; continue; }
    D.docs.set(d.id, d);
    await dbPut('docs', d);
    neu.push(d);
    if (d.bild) benoetigteMedien.add(d.bild);
    if (d.skizze) benoetigteMedien.add(d.skizze);
    if (d.datei) benoetigteMedien.add(d.datei);
  }
  let medien = 0;
  for (const [id, durl] of Object.entries(paket.media || {})) {
    if (!benoetigteMedien.has(id)) continue;
    try {
      if (modus === 'ersetzen' || !(await dbGet('media', id))) { await dbPut('media', dataURLZuBlob(durl), id); medien++; }
    } catch (e) {}
  }
  for (const marker of paket.sync || []) {
    const sauber = saubererSyncMarker(marker);
    if (sauber) try { await dbPut('sync', sauber, sauber.id); } catch (e) {}
  }
  if (modus === 'ersetzen') {
    if (paket.einst) { uebernehmeEinstellungen(paket.einst); speichereEinst(); setzeThema(D.einst.thema); }
    if (paket.stats) {
      D.stats = { tage: saubereZaehler(paket.stats.tage), letzte: saubereZaehler(paket.stats.letzte),
        letzteSicherung: begrenze(paket.stats.letzteSicherung, 0, Date.now() + 86400000, 0) };
      speichereStats();
    }
  }
  return { neu, uebersprungen, medien };
}

/* Ein Paket annehmen: fragen wie, einspielen, zeigen was kam. */
async function sicherungAnnehmen(paket, woher) {
  const vorschau = ankunftZusammenfassen(paket.docs, Object.keys(paket.media || {}).length);
  const modus = await menue([
    { text: 'Dazulegen (nichts geht verloren)', icon: 'plus', wert: 'dazu' },
    { text: 'Alles ersetzen', icon: 'wandel', wert: 'ersetzen', rot: true }
  ], vorschau.gesamt + ' Dinge vom ' + fmtDatum(begrenze(paket.wann, 0, Date.now() + 86400000, Date.now())) + (woher ? ' · ' + woher : ''));
  if (!modus) return null;
  if (modus === 'ersetzen' && !await frage('Wirklich alles Jetzige durch die Sicherung ersetzen?', { ja: 'Ersetzen', gefahr: true })) return null;
  toast('Lese ein …');
  const ergebnis = await sicherungEinspielen(paket, modus);
  zeichne();
  const z = ankunftZusammenfassen(ergebnis.neu, ergebnis.medien);
  await zeigeAnkunft(
    ergebnis.neu.length ? 'Angekommen' : 'Nichts Neues',
    ergebnis.neu.length ? z.zeilen : ['Alles aus dieser Sicherung war schon da.'],
    ergebnis.uebersprungen ? ergebnis.uebersprungen + ' schon vorhanden, unverändert gelassen.' : (z.woerter ? z.woerter.toLocaleString('de-DE') + ' Wörter.' : '')
  );
  return ergebnis;
}

function zeigeAnkunft(titel, zeilen, fussnote, hin) {
  return new Promise((res) => {
    const kasten = el('div', { class: 'modal ankunft' },
      el('h2', {}, titel),
      el('ul', { class: 'ankunft-liste' }, zeilen.map((z) => el('li', {}, z))),
      fussnote ? el('div', { class: 'ankunft-fuss' }, fussnote) : null,
      el('div', { class: 'reihe' },
        hin ? el('button', { class: 'knopf zart', onclick: () => { zu(); hin(); } }, 'Ansehen') : null,
        el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut'))
    );
    const zu = zeigeDeck(kasten, () => res(true));
  });
}

/* ----- Zwischenablage: hinaus ----- */

/* iOS erlaubt das Schreiben nur kurz nach einer Berührung. Dauert das Packen
   länger, ist die Erlaubnis verfallen — außer man übergibt gleich ein
   Versprechen, das später zu Text wird. Genau dafür ist ClipboardItem da. */
async function textInZwischenablage(quelle) {
  const text = typeof quelle === 'string' ? Promise.resolve(quelle) : quelle;
  if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem === 'function') {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then((t) => new Blob([t], { type: 'text/plain' })) })]);
      return true;
    } catch (e) {}
  }
  try { await navigator.clipboard.writeText(await text); return true; } catch (e) { return false; }
}

async function inZwischenablageSichern() {
  const wahl = await menue([
    { text: 'Nur Texte und Einstellungen — klein und schnell', icon: 'blatt', wert: 'texte' },
    { text: 'Alles, auch Bilder — kann groß werden', icon: 'kamera', wert: 'alles' }
  ], 'Was soll in die Zwischenablage?');
  if (!wahl) return false;
  toast('Packe ein …');
  const versprechen = baueSicherungsPaket({ mitMedien: wahl === 'alles' }).then((p) => JSON.stringify(p));
  const ok = await textInZwischenablage(versprechen);
  if (!ok) { toast('Die Zwischenablage wollte nicht. Dann den Weg über „Alles sichern" als Datei.', 4600); return false; }
  const groesse = (await versprechen).length;
  toast('Liegt in der Zwischenablage (' + formatBytes(groesse) + '). Drüben: „Aus der Zwischenablage einlesen".', 5600);
  return true;
}

/* ----- Zwischenablage: herein ----- */

function ausZwischenablageEinlesen() {
  return new Promise((res) => {
    let fertig = false;
    const feld = el('textarea', {
      rows: 6, class: 'ankommen-feld', spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off',
      placeholder: 'Hier einfügen — lange drücken und „Einfügen", oder Strg+V …'
    });
    const hinweis = el('div', { class: 'ankommen-hinweis' },
      'Es darf alles sein: eine VANI-Sicherung, ein Kopplungscode, „Nur Texte" aus einem älteren VANI, ein WhatsApp-Verlauf, ein Text mit Überschriften — oder einfach Text. VANI erkennt, was es ist.');
    const verarbeite = async (text) => {
      if (fertig) return;
      fertig = true; zu();
      res(await einfuegeInhaltVerarbeiten(text));
    };
    /* Große Sicherungen nicht erst ins Feld malen — das dauert und friert ein. */
    feld.addEventListener('paste', (e) => {
      const cd = e.clipboardData;
      if (!cd) return;
      const text = cd.getData('text/plain') || '';
      if (!text) return;
      e.preventDefault();
      verarbeite(text);
    });
    const lesen = el('button', {
      class: 'knopf voll', onclick: async () => {
        try {
          const t = navigator.clipboard && navigator.clipboard.readText ? await navigator.clipboard.readText() : '';
          if (t && t.trim()) return verarbeite(t);
          toast('Die Zwischenablage ist leer — oder das Gerät gibt sie nur per Einfügen her.', 3800);
        } catch (e) { toast('Bitte direkt ins Feld einfügen — so gibt das Gerät die Zwischenablage her.', 3800); }
        feld.focus();
      }
    }, 'Zwischenablage lesen');
    const weiter = el('button', { class: 'knopf', onclick: () => { if (feld.value.trim()) verarbeite(feld.value); else toast('Da ist noch nichts.'); } }, 'Einlesen');
    const kasten = el('div', { class: 'modal ankommen' },
      el('h2', {}, 'Aus der Zwischenablage einlesen'),
      hinweis, feld,
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'), lesen, weiter));
    const zu = zeigeDeck(kasten, () => { if (!fertig) { fertig = true; res(null); } });
    setTimeout(() => feld.focus(), 60);
  });
}

async function einfuegeInhaltVerarbeiten(text) {
  const e = erkenneEinfuegeInhalt(text);
  if (e.art === 'leer') { toast('Da war nichts drin.'); return null; }
  if (e.art === 'kaputt') {
    await zeigeAnkunft('Das kam nicht ganz an',
      [e.grund === 'unvollstaendig'
        ? 'Das sieht aus wie eine Sicherung, ist aber abgeschnitten — vermutlich wurde nicht alles kopiert.'
        : 'Das ist eine Datei, aber keine VANI-Sicherung.'],
      e.grund === 'unvollstaendig' ? 'Drüben noch einmal „In die Zwischenablage sichern", dann hier gleich einlesen. Bei sehr großen Sicherungen hilft „Nur Texte".' : '');
    return null;
  }
  if (e.art === 'kopplungscode') return vorhandenenSyncBereichKoppeln(e.code);
  if (e.art === 'sicherung') return sicherungAnnehmen(e.paket, 'Zwischenablage');
  if (e.art === 'vanitext') return vaniTextAnnehmen(e);
  if (e.art === 'whatsapp') return whatsappAnnehmen(e);
  if (e.art === 'gegliedert') return gegliedertAnnehmen(e);
  return textAnnehmen(e.text);
}

/* ----- Die Wege, etwas abzulegen ----- */

function neuesHeftFuer(titel) {
  return neuDoc('heft', { titel: titel || 'Eingelesen', farbe: zufall(HEFTFARBEN), farbe2: zufall(HEFTFARBEN), band: '#d6bd92', muster: 'leinen', papier: 'liniert', ansicht: 'seiten' });
}
function textSignatur(texte) { return texte.map((t) => (t || '').trim()).join(''); }

async function vaniTextAnnehmen(e) {
  const vorschau = [];
  if (e.projekte.length) vorschau.push(e.projekte.length + (e.projekte.length === 1 ? ' Projekt' : ' Projekte'));
  if (e.hefte.length) vorschau.push(e.hefte.length + (e.hefte.length === 1 ? ' Heft' : ' Hefte'));
  if (e.schnipsel.length) vorschau.push(e.schnipsel.length + ' Schnipsel');
  if (!await frage('Das ist der Text-Export eines VANI: ' + vorschau.join(', ') + '. Alles davon hier anlegen? Was wortgleich schon da ist, wird übersprungen.', { ja: 'Anlegen' })) return null;
  const neu = [];
  let uebersprungen = 0;
  for (const p of e.projekte) {
    const sig = textSignatur(p.kapitel.flatMap((k) => k.szenen.map((s) => s.titel + '\n' + s.text)));
    const schonDa = vomTyp('projekt').some((alt) => alt.titel === p.titel &&
      textSignatur(kinder(alt.id, 'kapitel').flatMap((k) => kinder(k.id, 'szene').map((s) => s.titel + '\n' + s.text))) === sig);
    if (schonDa) { uebersprungen++; continue; }
    const projekt = neuDoc('projekt', { titel: p.titel, art: 'Anderes', ziel: 0 });
    neu.push(projekt);
    p.kapitel.forEach((k, ki) => {
      const kapitel = neuDoc('kapitel', { parent: projekt.id, titel: k.titel, ord: ki });
      neu.push(kapitel);
      k.szenen.forEach((s, si) => neu.push(neuDoc('szene', { parent: kapitel.id, projekt: projekt.id, ord: si, titel: s.titel, text: s.text, rich: richAusText(s.text), format: 'rich', status: 'funke', farbe: '' })));
    });
  }
  for (const h of e.hefte) {
    const sig = textSignatur(h.seiten.map((s) => s.titel + '\n' + s.text));
    const schonDa = vomTyp('heft').some((alt) => alt.titel === h.titel &&
      textSignatur(kinder(alt.id, 'seite').map((s) => s.titel + '\n' + s.text)) === sig);
    if (schonDa) { uebersprungen++; continue; }
    const heft = neuesHeftFuer(h.titel);
    neu.push(heft);
    h.seiten.forEach((s, si) => {
      const seite = neuDoc('seite', { parent: heft.id, ord: si, titel: s.titel, text: s.text });
      neu.push(seite);
      (s.zettel || []).forEach((zt, zi) => neu.push(neuDoc('zettel', {
        parent: seite.id, text: zt, farbe: zufall(['gelb', 'rosa', 'blau', 'gruen']),
        pos: { x: 8 + (zi * 13) % 50, y: 6 + (zi * 11) % 40, rot: -4 + (zi * 3) % 8, w: 30 }
      })));
    });
  }
  const bekannte = new Set(vomTyp('schnipsel').map((s) => (s.text || '').trim()));
  for (const s of e.schnipsel) {
    if (bekannte.has(s.text)) { uebersprungen++; continue; }
    const felder = { text: s.text };
    if (s.wann) { felder.angelegt = s.wann; felder.geaendert = s.wann; }
    neu.push(neuDoc('schnipsel', felder));
    bekannte.add(s.text);
  }
  zeichne();
  const z = ankunftZusammenfassen(neu);
  await zeigeAnkunft(neu.length ? 'Angekommen' : 'Nichts Neues',
    neu.length ? z.zeilen : ['Alles davon war schon wortgleich da.'],
    uebersprungen ? uebersprungen + ' schon vorhanden, übersprungen.' : (z.woerter ? z.woerter.toLocaleString('de-DE') + ' Wörter.' : ''));
  return { neu, uebersprungen };
}

async function whatsappAnnehmen(e) {
  const wer = [...new Set(e.nachrichten.map((n) => n.wer))];
  const wahl = await menue([
    { text: 'In den Faden legen', icon: 'faden', wert: 'faden' },
    { text: 'Als ein Blatt', icon: 'blatt', wert: 'blatt' }
  ], e.nachrichten.length + ' Nachrichten' + (wer.length > 1 ? ' von ' + wer.slice(0, 3).join(', ') + (wer.length > 3 ? ' …' : '') : '') + (e.sonst ? ' (' + e.sonst + ' Systemzeilen bleiben draußen)' : ''));
  if (!wahl) return null;
  if (wahl === 'blatt') {
    const b = blattAusText(wer.length === 1 ? 'Verlauf mit ' + wer[0] : 'Verlauf', e.nachrichten.map((n) => fmtDatum(n.wann) + ' ' + fmtZeit(n.wann) + (wer.length > 1 ? ' · ' + n.wer : '') + '\n' + n.text).join('\n\n'));
    zeichne();
    toast('Liegt bei den Blättern.');
    oeffneSchreibraum(b.id);
    return { neu: [b] };
  }
  /* Schon vorhandene Nachrichten (gleiche Minute, gleicher Text) nicht doppeln. */
  const da = new Set(vomTyp('faden').map((d) => Math.floor((d.angelegt || 0) / 60000) + '' + (d.text || '').trim()));
  const neu = [];
  let uebersprungen = 0;
  for (const n of e.nachrichten) {
    const text = wer.length > 1 ? n.wer + ': ' + n.text : n.text;
    const schluessel = Math.floor((n.wann || 0) / 60000) + '' + text.trim();
    if (da.has(schluessel)) { uebersprungen++; continue; }
    da.add(schluessel);
    const felder = { text };
    if (n.wann) { felder.angelegt = n.wann; felder.geaendert = n.wann; }
    neu.push(neuDoc('faden', felder));
  }
  if (D.einst.fadenAbgewaehlt) { D.einst.fadenAbgewaehlt = false; speichereEinst(); }
  zeichne();
  await zeigeAnkunft(neu.length ? 'Im Faden' : 'Nichts Neues',
    [neu.length ? neu.length + ' Nachrichten eingefädelt.' : 'Diese Nachrichten lagen alle schon im Faden.'],
    uebersprungen ? uebersprungen + ' waren schon da.' : '',
    neu.length ? () => { location.hash = '#/faden'; } : null);
  return { neu, uebersprungen };
}

async function gegliedertAnnehmen(e) {
  const n = e.teile.length;
  const titel = (e.vorspann.split('\n')[0] || e.teile[0].titel || 'Eingelesen').trim().slice(0, 80);
  const wahl = await menue([
    { text: 'Als Projekt mit Kapiteln', icon: 'projekte', wert: 'projekt' },
    { text: 'Als Heft mit ' + n + ' Seiten', icon: 'hefte', wert: 'heft' },
    { text: 'Als ein Blatt', icon: 'blatt', wert: 'blatt' }
  ], n + ' Überschriften gefunden');
  if (!wahl) return null;
  if (wahl === 'blatt') {
    const b = blattAusText(titel, [e.vorspann, ...e.teile.map((t) => t.titel + '\n' + t.text)].filter(Boolean).join('\n\n'));
    zeichne(); oeffneSchreibraum(b.id);
    return { neu: [b] };
  }
  const name = await eingabe({ titel: wahl === 'projekt' ? 'Wie soll das Projekt heißen?' : 'Wie soll das Heft heißen?', wert: titel, ok: 'Anlegen' });
  if (!name) return null;
  const neu = [];
  if (wahl === 'heft') {
    const heft = neuesHeftFuer(name);
    neu.push(heft);
    let ord = 0;
    if (e.vorspann) neu.push(neuDoc('seite', { parent: heft.id, ord: ord++, titel: '', text: e.vorspann }));
    for (const t of e.teile) neu.push(neuDoc('seite', { parent: heft.id, ord: ord++, titel: t.titel, text: t.text }));
    zeichne();
    await zeigeAnkunft('Ein neues Heft', ankunftZusammenfassen(neu).zeilen, '', () => { location.hash = '#/heft/' + heft.id; });
    return { neu };
  }
  const projekt = neuDoc('projekt', { titel: name, art: 'Anderes', ziel: 0 });
  neu.push(projekt);
  const tief = e.teile.some((t) => t.ebene === 1) && e.teile.some((t) => t.ebene > 1);
  let kapitel = null, kOrd = 0, sOrd = 0;
  const neuesKapitel = (t) => { kapitel = neuDoc('kapitel', { parent: projekt.id, titel: t, ord: kOrd++ }); sOrd = 0; neu.push(kapitel); };
  const neueSzene = (t, text) => neu.push(neuDoc('szene', { parent: kapitel.id, projekt: projekt.id, ord: sOrd++, titel: t, text, rich: richAusText(text), format: 'rich', status: 'funke', farbe: '' }));
  if (e.vorspann) { neuesKapitel('Vorab'); neueSzene('', e.vorspann); }
  for (const t of e.teile) {
    if (tief && t.ebene === 1) { neuesKapitel(t.titel); if (t.text) neueSzene(t.titel, t.text); }
    else if (tief) { if (!kapitel) neuesKapitel(name); neueSzene(t.titel, t.text); }
    else { neuesKapitel(t.titel); neueSzene(t.titel, t.text); }
  }
  zeichne();
  await zeigeAnkunft('Ein neues Projekt', ankunftZusammenfassen(neu).zeilen, '', () => { location.hash = '#/projekt/' + projekt.id; });
  return { neu };
}

async function textAnnehmen(text) {
  const erste = text.split('\n')[0].trim();
  const titel = erste.length <= 60 && text.includes('\n') ? erste : '';
  const wahl = await menue([
    { text: 'Als Blatt', icon: 'blatt', wert: 'blatt' },
    { text: 'Auf eine Heftseite', icon: 'hefte', wert: 'seite' },
    { text: 'Als Schnipsel', icon: 'schnipsel', wert: 'schnipsel' },
    { text: 'In den Faden', icon: 'faden', wert: 'faden' }
  ], worte(text).toLocaleString('de-DE') + ' Wörter — wohin damit?');
  if (!wahl) return null;
  if (wahl === 'blatt') {
    const b = blattAusText(titel, titel ? text.slice(text.indexOf('\n') + 1).trim() : text);
    zeichne(); oeffneSchreibraum(b.id);
    return { neu: [b] };
  }
  if (wahl === 'seite') {
    const heft = await waehleHeft();
    if (!heft) return null;
    const seite = neuDoc('seite', { parent: heft.id, ord: kinder(heft.id, 'seite').length, titel, text: titel ? text.slice(text.indexOf('\n') + 1).trim() : text });
    zeichne();
    toast('Eingeklebt: ' + heft.titel);
    location.hash = '#/heft/' + heft.id;
    return { neu: [seite] };
  }
  if (wahl === 'schnipsel') {
    const s = neuDoc('schnipsel', { text });
    zeichne(); toast('Liegt in den Schnipseln.'); location.hash = '#/schnipsel';
    return { neu: [s] };
  }
  const f = neuDoc('faden', { text });
  if (D.einst.fadenAbgewaehlt) { D.einst.fadenAbgewaehlt = false; speichereEinst(); }
  zeichne(); toast('Eingefädelt.'); location.hash = '#/faden';
  return { neu: [f] };
}

/* ----- Der Umzugshelfer ----- */

function umzugsHelfer() {
  const imAlten = typeof vaniAdresseArt === 'function' && vaniAdresseArt() === 'rettung';
  const verbunden = typeof syncIstVerbunden === 'function' && syncIstVerbunden();
  const schritt = (nr, ...inhalt) => el('div', { class: 'umzug-schritt' }, el('b', {}, String(nr)), el('div', {}, ...inhalt));
  const weg = (titel, unter, ...inhalt) => el('div', { class: 'karte umzug-weg' }, el('h3', {}, titel), unter ? el('div', { class: 'umzug-unter' }, unter) : null, ...inhalt);

  const kasten = el('div', { class: 'modal umzug' });
  const zu = zeigeDeck(kasten);
  const tu = (f) => () => { zu(); f(); };

  kasten.append(el('h2', {}, imAlten ? 'Von hier ins neue VANI' : 'Von einem alten VANI umziehen'),
    el('div', { class: 'umzug-einleitung' },
      imAlten
        ? 'Du bist im alten VANI unter der früheren Adresse. Alles, was hier liegt, kommt auf zwei Wegen hinüber — beide ohne Datei.'
        : 'Jedes VANI-Symbol auf einem Gerät hat seinen eigenen Bestand — auch zwei Symbole derselben Adresse teilen nichts miteinander. Darum muss der alte Bestand einmal herüber. Drei Wege; die ersten beiden brauchen keine Datei und funktionieren auch auf verwalteten Schul-iPads.'));

  /* Weg 1: Kopplungscode */
  kasten.append(weg('1 · Über den Kopplungscode', 'Wenn das alte VANI „iPad ↔ Laptop" schon kennt. Nichts tippen, nichts kopieren außer dem Code.',
    imAlten
      ? schritt(1, 'Im neuen VANI: Feinheiten → iPad ↔ Laptop → „Weiteres Gerät koppeln" — der Code ist dann in der Zwischenablage. Hierher bringen (Nachricht an dich selbst).')
      : schritt(1, verbunden
        ? el('span', {}, 'Hier den Kopplungscode holen: ', el('button', { class: 'knopf klein', onclick: () => kopiereSyncKopplungscode() }, 'Code kopieren'))
        : el('span', {}, 'Zuerst hier einen privaten Bereich anlegen: ', el('button', { class: 'knopf klein', onclick: tu(() => neuerSyncBereich()) }, 'Bereich anlegen'), ' — danach „Weiteres Gerät koppeln".')),
    imAlten
      ? schritt(2, el('span', {}, 'Hier: ', el('button', { class: 'knopf klein voll', onclick: tu(() => vorhandenenSyncBereichKoppeln()) }, 'Mit Bereich verbinden'), ' → Code einfügen → „Beides zusammenlegen".'))
      : schritt(2, 'Im alten VANI: Feinheiten → iPad ↔ Laptop → „Mit Bereich verbinden" → Code einfügen → „Beides zusammenlegen".'),
    schritt(3, 'Kurz warten. Alles wandert verschlüsselt herüber — Texte, Hefte, Bilder, Einstellungen.')));

  /* Weg 2: Zwischenablage */
  kasten.append(weg('2 · Über die Zwischenablage', 'Ohne Datei, ohne Netz. Funktioniert mit jeder VANI-Fassung seit der ersten.',
    imAlten
      ? schritt(1, el('span', {}, 'Hier: ', el('button', { class: 'knopf klein voll', onclick: tu(() => inZwischenablageSichern()) }, 'In die Zwischenablage sichern')))
      : schritt(1, 'Im alten VANI: Feinheiten → „In die Zwischenablage sichern". Bei einer ganz alten Fassung, die das noch nicht hat: „Nur Texte kopieren" — VANI versteht auch das und baut Projekte, Hefte und Schnipsel daraus wieder auf.'),
    imAlten
      ? schritt(2, 'Im neuen VANI: Feinheiten → „Aus der Zwischenablage einlesen" → ins Feld einfügen.')
      : schritt(2, el('span', {}, 'Hier: ', el('button', { class: 'knopf klein voll', onclick: tu(() => ausZwischenablageEinlesen()) }, 'Aus der Zwischenablage einlesen'), ' → ins Feld einfügen. Fertig.')),
    schritt(3, 'Wird es sehr viel (viele Bilder), lieber zweimal gehen: erst „Nur Texte", die Bilder später über den Kopplungscode.')));

  /* Weg 3: Datei */
  if (!imAlten) {
    kasten.append(weg('3 · Über eine Datei', 'Der klassische Weg — wenn das Gerät Dateien öffnen darf.',
      schritt(1, 'Im alten VANI: Feinheiten → „Alles sichern" → Datei aufheben.'),
      schritt(2, el('span', {}, 'Hier: ', el('button', { class: 'knopf klein', onclick: tu(() => leseSicherung()) }, 'Sicherung einlesen'), ' → Datei wählen → „Dazulegen".')),
      el('div', { class: 'umzug-unter', style: 'margin-top:10px' }, 'Manche Schul-iPads erlauben keine Dateiauswahl. Dann Weg 1 oder 2.')));
    kasten.append(el('div', { class: 'umzug-fuss' },
      el('b', {}, 'Lief dein altes VANI unter der früheren zweiten Adresse? '),
      'Beim Öffnen erscheint „VANI ist umgezogen". Dort „Alten Bestand retten" antippen — das öffnet das alte VANI mit seinem ganzen Bestand, und von dort gehen Weg 1 und 2. Das alte Symbol erst löschen, wenn hier alles da ist.'));
  }
  kasten.append(el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Alles klar')));
}

/* Die Karte „Sicher ist sicher" in den Feinheiten — mit und ohne Datei. */
function ankommenKarte() {
  const wann = D.stats.letzteSicherung;
  const imAlten = typeof vaniAdresseArt === 'function' && vaniAdresseArt() === 'rettung';
  const zeile = (beschriftung, ...knoepfe) => el('div', { class: 'ankommen-zeile' }, el('span', { class: 'ankommen-etikett' }, beschriftung), el('div', { class: 'ankommen-knoepfe' }, ...knoepfe));
  return el('div', { class: 'karte ankommen-karte' },
    el('div', { style: 'font-size:14px;color:var(--blass);line-height:1.6;margin-bottom:14px' },
      'Alles hier lebt nur auf diesem Gerät. Eine Sicherung ist alles auf einmal — Texte, Hefte, Fotos. ',
      wann ? 'Zuletzt gesichert: ' + vorZeit(wann) + '.' : 'Noch nie gesichert.'),
    zeile('Als Datei',
      el('button', { class: 'knopf ' + (imAlten ? '' : 'voll'), onclick: () => sichereAlles() }, el('span', { html: ik('teilen'), style: 'display:flex' }), 'Alles sichern'),
      el('button', { class: 'knopf', onclick: () => leseSicherung() }, el('span', { html: ik('runter'), style: 'display:flex;transform:rotate(180deg)' }), 'Sicherung einlesen')),
    zeile('Ohne Datei',
      el('button', { class: 'knopf ' + (imAlten ? 'voll' : ''), onclick: () => inZwischenablageSichern() }, el('span', { html: ik('teilen'), style: 'display:flex' }), 'In die Zwischenablage sichern'),
      el('button', { class: 'knopf', onclick: () => ausZwischenablageEinlesen() }, el('span', { html: ik('runter'), style: 'display:flex;transform:rotate(180deg)' }), 'Aus der Zwischenablage einlesen')),
    zeile('Außerdem',
      el('button', {
        class: 'knopf', onclick: async () => {
          const texte = alleTexteAlsText();
          if (await textInZwischenablage(texte)) toast('Alle Texte in der Zwischenablage.'); else teileDatei('vani-texte.txt', texte);
        }
      }, 'Nur Texte kopieren'),
      el('button', { class: 'knopf zart', onclick: () => umzugsHelfer() }, imAlten ? 'Von hier ins neue VANI →' : 'Von einem alten VANI umziehen →')));
}
