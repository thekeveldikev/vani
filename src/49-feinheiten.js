/* ================================================================
   VANI — Feinheiten: Thema, Klang, Statistik, Sicherung
   ================================================================ */

RENDER.feinheiten = function (haupt) {
  haupt.append(raumkopf('Feinheiten'));
  const inhalt = el('div', { class: 'inhalt' });

  /* Thema */
  const THEMA_INFO = [
    ['papier', 'Papier', '#f8f3e7', '#2c251c'],
    ['tinte', 'Tinte', '#211c17', '#eae0cd'],
    ['kerze', 'Kerze', '#2b1e0c', '#f2dfb6'],
    ['nebel', 'Nebel', '#f4f6f2', '#2e3438']
  ];
  const themen = el('div', { class: 'themenwahl' });
  for (const [id, name, hg, tinte] of THEMA_INFO) {
    themen.append(el('button', {
      class: 'themenkachel' + (D.einst.thema === id ? ' an' : ''), onclick: (e) => {
        setzeThema(id);
        $$('.themenkachel', themen).forEach((k) => k.classList.toggle('an', k === e.currentTarget));
      }
    },
      el('div', { class: 'vorschau', style: 'background:' + hg + ';color:' + tinte }, 'Aa'),
      el('div', { class: 'tname' }, name)
    ));
  }
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Stimmung'), themen));

  /* Schreiben */
  const zielFeld = el('input', { type: 'text', inputmode: 'numeric', value: D.einst.tagesziel || '', placeholder: 'keins', style: 'width:90px;text-align:right;background:var(--karte);border-radius:10px;padding:7px 11px;box-shadow:inset 0 0 0 1px var(--linie)' });
  zielFeld.addEventListener('input', entprellt(() => {
    D.einst.tagesziel = parseInt(zielFeld.value, 10) || 0;
    speichereEinst();
  }, 400));
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Schreiben'),
    el('div', { class: 'karte' },
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Tagesziel in Wörtern', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Leer lassen heißt: kein Soll. Auch gut.')),
        zielFeld),
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Schrift, Größe, Fokus …', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Stellst du direkt im Schreibraum ein — oben rechts.')))
    )));

  /* Klang */
  const klangwahl = el('div', { class: 'wahlgruppe', style: 'flex-wrap:wrap' });
  const KLAENGE = [['aus', 'Stille'], ['regen', 'Regen'], ['kamin', 'Kamin'], ['wind', 'Wind'], ['grillen', 'Grillen']];
  for (const [id, name] of KLAENGE) {
    klangwahl.append(el('button', {
      class: D.einst.klang === id ? 'an' : '', onclick: (e) => {
        klangSetzen(id);
        $$('button', klangwahl).forEach((b) => b.classList.toggle('an', b === e.currentTarget));
      }
    }, name));
  }
  const laut = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round(D.einst.lautstaerke * 100)) });
  laut.addEventListener('input', () => { setzeLautstaerke(parseInt(laut.value, 10) / 100); });
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Klang'),
    el('div', { class: 'karte' },
      el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, 'Zu hören'), klangwahl),
      el('div', { class: 'einstellzeile' }, el('span', { class: 'ename' }, 'Lautstärke'), laut)
    )));

  /* Statistik */
  const gesamt = Object.values(D.stats.tage).reduce((a, b) => a + b, 0);
  const balken = el('div', { class: 'statistikbalken' });
  const werte = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    werte.push({ k: tagKey(d), w: D.stats.tage[tagKey(d)] || 0, d });
  }
  const max = Math.max(1, ...werte.map((x) => x.w));
  for (const { w, d } of werte) {
    balken.append(el('div', { class: 'tag' + (w ? '' : ' leer') },
      el('i', { style: 'height:' + Math.max(4, Math.round(w / max * 100)) + '%' }),
      el('b', {}, String(d.getDate()))));
  }
  const anzahl = (typ) => [...D.docs.values()].filter((d) => d.typ === typ).length;
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Gezählt, nicht gewogen'),
    el('div', { class: 'karte' },
      balken,
      el('div', { class: 'zahlenreihe' },
        el('div', { class: 'z' }, el('b', {}, gesamt.toLocaleString('de-DE')), el('span', {}, 'Wörter insgesamt')),
        el('div', { class: 'z' }, el('b', {}, String(D.stats.tage[tagKey()] || 0)), el('span', {}, 'heute')),
        el('div', { class: 'z' }, el('b', {}, String(straehne())), el('span', {}, 'Tage in Folge')),
        el('div', { class: 'z' }, el('b', {}, String(anzahl('schnipsel'))), el('span', {}, 'Schnipsel')),
        el('div', { class: 'z' }, el('b', {}, String(anzahl('seite'))), el('span', {}, 'Seiten')),
        el('div', { class: 'z' }, el('b', {}, String(anzahl('szene'))), el('span', {}, 'Szenen'))
      )
    )));

  /* Sicherung */
  const wann = D.stats.letzteSicherung;
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Sicher ist sicher'),
    el('div', { class: 'karte' },
      el('div', { style: 'font-size:14px;color:var(--blass);line-height:1.6;margin-bottom:14px' },
        'Alles hier lebt nur auf diesem Gerät. Eine Sicherung ist eine einzige Datei mit allem drin — Texte, Hefte, Fotos. ',
        wann ? 'Zuletzt gesichert: ' + vorZeit(wann) + '.' : 'Noch nie gesichert.'),
      el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap' },
        el('button', { class: 'knopf voll', onclick: () => sichereAlles() }, el('span', { html: ik('teilen'), style: 'display:flex' }), 'Alles sichern'),
        el('button', { class: 'knopf', onclick: () => leseSicherung() }, el('span', { html: ik('runter'), style: 'display:flex;transform:rotate(180deg)' }), 'Sicherung einlesen'),
        el('button', {
          class: 'knopf', onclick: async () => {
            const texte = alleTexteAlsText();
            try { await navigator.clipboard.writeText(texte); toast('Alle Texte in der Zwischenablage.'); }
            catch (e) { teileDatei('vani-texte.txt', texte); }
          }
        }, 'Nur Texte kopieren')
      )
    )));

  /* Kleingedrucktes */
  inhalt.append(el('div', { class: 'kleingedruckt' },
    el('div', { class: 'wortmarke' }, 'VANI'),
    el('div', { style: 'margin-top:6px' }, 'Handgemacht. Offline. Meins.'),
    el('div', {}, 'Kein Konto, keine Cloud, kein Abo — alles bleibt hier.'),
    el('button', { class: 'knopf zart', style: 'margin-top:14px', onclick: () => location.reload() }, 'Frisch durchatmen (neu laden)')
  ));

  haupt.append(inhalt);
};

/* ----- Sicherung ----- */
function blobZuDataURL(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}
function dataURLZuBlob(durl) {
  const [kopf, daten] = durl.split(',');
  const mime = (kopf.match(/data:(.*?);/) || [])[1] || 'application/octet-stream';
  const bin = atob(daten);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function sichereAlles() {
  toast('Packe alles ein …');
  const media = {};
  const ids = new Set();
  for (const d of D.docs.values()) { if (d.bild) ids.add(d.bild); if (d.skizze) ids.add(d.skizze); }
  for (const id of ids) {
    const blob = await dbGet('media', id);
    if (blob) media[id] = await blobZuDataURL(blob);
  }
  const paket = {
    vani: 1, wann: Date.now(),
    docs: [...D.docs.values()],
    einst: D.einst,
    stats: D.stats,
    media
  };
  const name = 'vani-sicherung-' + tagKey() + '.vani';
  const ok = await teileDatei(name, JSON.stringify(paket), 'application/json');
  if (ok) {
    D.stats.letzteSicherung = Date.now();
    speichereStats();
  }
}

function leseSicherung() {
  const inp = el('input', { type: 'file', accept: '.vani,.json,application/json,text/plain', style: 'display:none' });
  document.body.append(inp);
  inp.addEventListener('change', async () => {
    const datei = inp.files && inp.files[0];
    inp.remove();
    if (!datei) return;
    let paket;
    try { paket = JSON.parse(await datei.text()); } catch (e) { toast('Das ist keine VANI-Sicherung.'); return; }
    if (!paket || paket.vani !== 1 || !Array.isArray(paket.docs)) { toast('Das ist keine VANI-Sicherung.'); return; }
    const modus = await menue([
      { text: 'Dazulegen (nichts geht verloren)', icon: 'plus', wert: 'dazu' },
      { text: 'Alles ersetzen', icon: 'wandel', wert: 'ersetzen', rot: true }
    ], paket.docs.length + ' Dinge vom ' + fmtDatum(paket.wann));
    if (!modus) return;
    if (modus === 'ersetzen') {
      if (!await frage('Wirklich alles Jetzige durch die Sicherung ersetzen?', { ja: 'Ersetzen', gefahr: true })) return;
      await dbTu('docs', 'readwrite', (s) => s.clear());
      await dbTu('media', 'readwrite', (s) => s.clear());
      D.docs.clear();
    }
    for (const d of paket.docs) {
      if (modus === 'dazu' && D.docs.has(d.id)) continue;
      D.docs.set(d.id, d);
      await dbPut('docs', d);
    }
    for (const [id, durl] of Object.entries(paket.media || {})) {
      try { await dbPut('media', dataURLZuBlob(durl), id); } catch (e) {}
    }
    if (modus === 'ersetzen') {
      if (paket.einst) { Object.assign(D.einst, paket.einst); speichereEinst(); setzeThema(D.einst.thema); }
      if (paket.stats) { D.stats = Object.assign({ tage: {}, letzte: {}, letzteSicherung: 0 }, paket.stats); speichereStats(); }
    }
    toast('Alles wieder da.');
    zeichne();
  });
  inp.click();
}

function alleTexteAlsText() {
  const teile = [];
  for (const p of vomTyp('projekt')) {
    teile.push('══ PROJEKT: ' + p.titel + ' ══');
    for (const k of kinder(p.id, 'kapitel')) {
      teile.push('\n— ' + k.titel + ' —');
      for (const s of kinder(k.id, 'szene')) {
        if (s.titel) teile.push('· ' + s.titel);
        if ((s.text || '').trim()) teile.push(s.text.trim());
      }
    }
    teile.push('');
  }
  for (const h of vomTyp('heft')) {
    teile.push('══ HEFT: ' + h.titel + ' ══');
    for (const s of kinder(h.id, 'seite')) {
      if (s.titel) teile.push('· ' + s.titel);
      if ((s.text || '').trim()) teile.push(s.text.trim());
      for (const z of kinder(s.id, 'zettel')) if ((z.text || '').trim()) teile.push('[Zettel] ' + z.text.trim());
    }
    teile.push('');
  }
  const schnipsel = vomTyp('schnipsel').sort((a, b) => a.angelegt - b.angelegt);
  if (schnipsel.length) {
    teile.push('══ SCHNIPSEL ══');
    for (const s of schnipsel) if ((s.text || '').trim()) teile.push(fmtDatum(s.angelegt) + ': ' + s.text.trim());
  }
  return teile.join('\n');
}

/* Datei hinausgeben: Teilen-Menü → Download → Zwischenablage */
async function teileDatei(name, inhalt, typ = 'text/plain') {
  const blob = new Blob([inhalt], { type: typ + ';charset=utf-8' });
  const datei = new File([blob], name, { type: typ });
  if (navigator.canShare && navigator.canShare({ files: [datei] })) {
    try { await navigator.share({ files: [datei] }); return true; }
    catch (e) { if (e && e.name === 'AbortError') return false; }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: name, style: 'display:none' });
    document.body.append(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
    toast('Gespeichert — schau in „Dateien" nach.');
    return true;
  } catch (e) {}
  try {
    await navigator.clipboard.writeText(inhalt);
    toast('Ging nicht als Datei — liegt jetzt in der Zwischenablage.');
    return true;
  } catch (e) {
    toast('Das hat leider nicht geklappt.');
    return false;
  }
}
