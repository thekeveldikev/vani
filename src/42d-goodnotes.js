/* ================================================================
   VANI — Goodnotes-Archiv: ganze Notizbücher, ruhig und unverändert
   ================================================================ */

const GOODNOTES_MAX = 250 * 1024 * 1024;
function goodnotesArt(datei) {
  const name = String(datei && datei.name || '').toLowerCase();
  const mime = String(datei && datei.type || '').toLowerCase();
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(name)) return 'bild';
  if (name.endsWith('.goodnotes')) return 'goodnotes';
  if (mime === 'application/zip' || name.endsWith('.zip')) return 'paket';
  return null;
}
function goodnotesFingerabdruck(datei) {
  return [String(datei.name || '').toLowerCase(), Number(datei.size) || 0, Number(datei.lastModified) || 0].join(':');
}
async function blobsGleich(a, b, block = 1024 * 1024) {
  if (!a || !b || a.size !== b.size) return false;
  const schritt = Math.max(4096, Math.min(4 * 1024 * 1024, Number(block) || 1024 * 1024));
  for (let ab = 0; ab < a.size; ab += schritt) {
    const [aa, bb] = await Promise.all([a.slice(ab, ab + schritt).arrayBuffer(), b.slice(ab, ab + schritt).arrayBuffer()]);
    const x = new Uint8Array(aa), y = new Uint8Array(bb);
    if (x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  }
  return true;
}

async function importiereGoodnotes() {
  const inp = el('input', { type: 'file', multiple: 'multiple', accept: '.pdf,.goodnotes,.zip,application/zip,image/png,image/jpeg,image/webp', style: 'display:none' });
  document.body.append(inp);
  inp.addEventListener('change', async () => {
    const dateien = [...(inp.files || [])];
    inp.remove();
    if (!dateien.length) return;
    let frei = Infinity;
    try {
      const s = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
      if (s && Number.isFinite(s.quota) && Number.isFinite(s.usage)) frei = s.quota - s.usage;
    } catch (e) {}
    let dazu = 0, doppelt = 0, abgelehnt = 0, verbraucht = 0;
    const bekannt = new Map();
    for (const d of vomTyp('goodnote')) {
      if (!d.fingerabdruck) continue;
      if (!bekannt.has(d.fingerabdruck)) bekannt.set(d.fingerabdruck, []);
      bekannt.get(d.fingerabdruck).push(d);
    }
    for (const datei of dateien) {
      const art = goodnotesArt(datei);
      const fp = goodnotesFingerabdruck(datei);
      if (!art || !datei.size || datei.size > GOODNOTES_MAX || verbraucht + datei.size > frei * .85) { abgelehnt++; continue; }
      let istDoppelt = false;
      for (const alt of bekannt.get(fp) || []) {
        try { const blob = await dbGet('media', alt.datei); if (blob && await blobsGleich(datei, blob)) { istDoppelt = true; break; } }
        catch (e) {}
      }
      if (istDoppelt) { doppelt++; continue; }
      try {
        const id = await speichereDateiBlob(datei);
        const neu = neuDoc('goodnote', {
          titel: datei.name.replace(/\.(pdf|goodnotes|zip|png|jpe?g|webp)$/i, ''), datei: id,
          dateiname: datei.name, dateityp: datei.type || (art === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
          art, groesse: datei.size, fingerabdruck: fp, notiz: '', schlagworte: ''
        });
        if (!bekannt.has(fp)) bekannt.set(fp, []);
        bekannt.get(fp).push(neu);
        verbraucht += datei.size; dazu++;
      } catch (e) { abgelehnt++; }
    }
    if (dazu) {
      raumConfig();
      const r = D.einst.raeume.find((x) => x.id === 'goodnotes');
      if (r) r.an = true;
      speichereEinst(); baueLeiste();
      toast(dazu === 1 ? 'Ein Notizbuch liegt sicher im Goodnotes-Archiv.' : dazu + ' Notizbücher liegen sicher im Goodnotes-Archiv.', 4000);
      location.hash = '#/goodnotes';
    }
    if (doppelt) toast(doppelt + (doppelt === 1 ? ' vorhandene Datei wurde' : ' vorhandene Dateien wurden') + ' nicht doppelt abgelegt.');
    if (abgelehnt) toast(abgelehnt + (abgelehnt === 1 ? ' Datei war' : ' Dateien waren') + ' zu groß oder kein unterstütztes Format.', 4200);
  });
  inp.addEventListener('cancel', () => inp.remove());
  inp.click();
}

RENDER.goodnotes = function (haupt) {
  haupt.append(raumkopf('Goodnotes', 'ein stilles Archiv — nichts landet zwischen deinen Schnipseln',
    el('button', { class: 'rundknopf voll', html: ik('plus'), title: 'Notizbücher hereinholen', onclick: () => importiereGoodnotes() })
  ));
  const inhalt = el('div', { class: 'inhalt' });
  const alle = vomTyp('goodnote');
  const feld = el('input', { class: 'goodnotes-suche', type: 'search', placeholder: 'Im Archiv nach Titel, Stichwort oder Notiz suchen …' });
  const gitter = el('div', { class: 'goodnotes-gitter' });
  const baue = () => {
    gitter.innerHTML = '';
    const q = normalisiere(feld.value.trim()).slice(0, 120);
    const funde = alle.filter((d) => !q || normalisiere([d.titel, d.dateiname, d.schlagworte, d.notiz].join(' ')).includes(q));
    if (!funde.length) gitter.append(el('div', { class: 'leer' }, alle.length ? 'Nichts Passendes im Archiv.' : 'Noch kein Goodnotes-Notizbuch hier.',
      el('div', { class: 'klein' }, alle.length ? 'Die Suche bleibt nur in diesem Raum.' : 'Am sichersten: in Goodnotes als „reduzierte PDF" mit Handschrifterkennung exportieren.')));
    for (const d of funde) {
      const karte = el('button', { class: 'goodnotes-karte', onclick: () => oeffneGoodnote(d) },
        el('div', { class: 'goodnotes-deckel ' + d.art }, el('span', { html: ik(d.art === 'bild' ? 'kamera' : 'buchzu') })),
        el('div', { class: 'goodnotes-meta' },
          el('b', {}, d.titel || d.dateiname),
          el('span', {}, (d.art === 'goodnotes' ? 'Goodnotes-Original' : d.art === 'paket' ? 'Goodnotes-Archivpaket' : d.art === 'pdf' ? 'PDF' : 'Bild') + ' · ' + formatBytes(d.groesse)),
          d.schlagworte ? el('small', {}, d.schlagworte) : null));
      langdruck(karte, () => goodnoteMenue(d));
      gitter.append(karte);
    }
  };
  feld.addEventListener('input', entprellt(baue, 100));
  inhalt.append(el('div', { class: 'goodnotes-hinweis' },
    el('span', { html: ik('buchzu') }),
    el('span', {}, 'Jede importierte Datei bleibt ein einziges Notizbuch. VANI zerlegt sie nicht und vermischt sie nicht mit deinen eigenen Blättern.')),
    feld, gitter);
  haupt.append(inhalt);
  baue();
};

function formatBytes(n) {
  n = Number(n) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
  return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
}

async function goodnoteMenue(d) {
  const wahl = await menue([
    { text: 'Öffnen', icon: 'lesen', wert: 'auf' },
    { text: 'Titel, Stichwörter & Notiz', icon: 'stift', wert: 'meta' },
    { text: 'Hinzufügen & verbinden', icon: 'verbinden', wert: 'bezug' },
    { text: 'Original herausgeben', icon: 'teilen', wert: 'raus' },
    { text: 'Ins Archiv-Papierkorb legen', icon: 'muell', wert: 'weg', rot: true }
  ], d.titel || d.dateiname);
  if (wahl === 'auf') oeffneGoodnote(d);
  else if (wahl === 'meta') {
    const neu = await eingabe({ titel: 'Titel', wert: d.titel || '' });
    if (neu === null) return;
    const tags = await eingabe({ titel: 'Stichwörter', wert: d.schlagworte || '', platzhalter: 'z. B. Figuren, Schule, Ideen' });
    if (tags === null) return;
    const notiz = await eingabe({ titel: 'Eine Notiz dazu', wert: d.notiz || '', mehrzeilig: true });
    if (notiz === null) return;
    d.titel = neu; d.schlagworte = tags; d.notiz = notiz; speichere(d); zeichne();
  } else if (wahl === 'bezug') { await hinzufuegenMenue(d); }
  else if (wahl === 'raus') { await teileGespeicherteDatei(d); }
  else if (wahl === 'weg' && await frage('„' + docName(d) + '" in den Papierkorb legen? Die Originaldatei bleibt dort 30 Tage erhalten.', { ja: 'In den Papierkorb', gefahr: true })) {
    await loesche(d.id); zeichne();
  }
}

async function teileGespeicherteDatei(d) {
  const blob = await dbGet('media', d.datei);
  if (!blob) { toast('Die Originaldatei ist nicht mehr da.'); return false; }
  const datei = new File([blob], d.dateiname || (d.titel + '.pdf'), { type: d.dateityp || blob.type || 'application/octet-stream' });
  if (navigator.canShare && navigator.canShare({ files: [datei] })) {
    try { await navigator.share({ files: [datei] }); return true; } catch (e) { if (e && e.name === 'AbortError') return false; }
  }
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: datei.name, style: 'display:none' });
  document.body.append(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
  toast('Originaldatei gespeichert.');
  return true;
}

async function oeffneGoodnote(d) {
  const bogen = el('div', { class: 'goodnote-leser' });
  const leiste = el('div', { class: 'schwebeleiste' },
    el('button', { class: 'rundknopf zart', html: ik('kreuz'), title: 'Notizbuch schließen', onclick: () => { bogen.remove(); leiste.remove(); } }),
    el('span', { class: 'goodnote-lesertitel' }, d.titel || d.dateiname),
    el('button', { class: 'knopf', onclick: () => teileGespeicherteDatei(d) }, 'Original'));
  bogen.append(el('div', { class: 'leer' }, 'Notizbuch wird geöffnet …'));
  document.body.append(bogen, leiste);
  const url = await bildURL(d.datei);
  if (!bogen.isConnected) return;
  bogen.innerHTML = '';
  if (!url) { bogen.append(el('div', { class: 'leer' }, 'Die Datei ist nicht mehr da.')); return; }
  if (d.art === 'bild') bogen.append(el('img', { class: 'goodnote-bild', src: url, alt: d.titel || '' }));
  else if (d.art === 'pdf') bogen.append(el('iframe', { class: 'goodnote-pdf', src: url, title: d.titel || 'Goodnotes PDF', sandbox: '' }));
  else bogen.append(el('div', { class: 'goodnote-original' },
    el('div', { html: ik('buchzu') }), el('h2', {}, 'Sicher verwahrt.'),
    el('p', {}, d.art === 'paket' ? 'Das ganze exportierte Ordnerpaket bleibt als eine Datei zusammen. Du kannst es jederzeit über „Original" wieder herausgeben und in Goodnotes öffnen.' : 'Das Goodnotes-Original bleibt unverändert. Anzeigen kann es nur Goodnotes; du kannst es jederzeit über „Original" wieder herausgeben.')));
}
