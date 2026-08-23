/* ===================== 56h — DAZULERNEN: NEUE LESUNGEN =====================
   Die Einlesung (56d) ist ein Stand, kein Endzustand. Wenn Texte wachsen und
   neue dazukommen, kann die Wand nachlesen: `salonNachlesen()` vergleicht den
   damaligen Stand mit dem, was jetzt auf dem Gerät liegt, hält den Unterschied
   als eigene Lesung fest (Dokument vom Typ `lesung`, reist also mit der
   Sicherung und der Kopplung) und lässt jede Stimme zwei Sätze dazu sagen.
   Aus Grundeinlesung + allen Lesungen entsteht die Chronik: „gelesen am …".
   Alles bleibt auf dem Gerät. */

/* Ein kompakter Stand: was zählbar ist, ohne den Text selbst. Pur. */
function lesungStand(k, jetzt = Date.now()) {
  if (!k || k.leer) return { wann: jetzt, woerter: 0, texte: 0, werke: [], figuren: [], orte: [], begriffe: [], signatur: (k && k.signatur) || '' };
  return {
    wann: jetzt, woerter: k.woerter, texte: k.texte, signatur: k.signatur,
    werke: (k.werke || []).map((w) => ({ name: w.name, woerter: w.woerter })),
    figuren: (k.figuren || []).map((f) => ({ name: f.name, n: f.n })),
    orte: (k.orte || []).map((o) => o.name),
    begriffe: (k.begriffe || []).map((b) => b.name)
  };
}
/* Was sich seit einem Stand geändert hat. Pur. */
function lesungVergleich(alt, neu) {
  const a = alt || { woerter: 0, texte: 0, werke: [], figuren: [], orte: [], begriffe: [] };
  const namen = (liste) => new Set((liste || []).map((x) => (typeof x === 'string' ? x : x.name)));
  const altF = namen(a.figuren), altO = namen(a.orte), altB = namen(a.begriffe), altW = namen(a.werke);
  const altZahl = new Map((a.figuren || []).map((f) => [f.name, f.n || 0]));
  const altWZahl = new Map((a.werke || []).map((w) => [w.name, w.woerter || 0]));
  const neueFiguren = (neu.figuren || []).filter((f) => !altF.has(f.name)).map((f) => f.name);
  const neueOrte = (neu.orte || []).filter((o) => !altO.has(typeof o === 'string' ? o : o.name)).map((o) => (typeof o === 'string' ? o : o.name));
  const neueBegriffe = (neu.begriffe || []).filter((b) => !altB.has(typeof b === 'string' ? b : b.name)).map((b) => (typeof b === 'string' ? b : b.name));
  const neueWerke = (neu.werke || []).filter((w) => !altW.has(w.name)).map((w) => w.name);
  const gewachsen = (neu.werke || []).filter((w) => altW.has(w.name) && w.woerter > (altWZahl.get(w.name) || 0) + 200)
    .map((w) => ({ name: w.name, plus: w.woerter - (altWZahl.get(w.name) || 0) })).sort((x, y) => y.plus - x.plus);
  const oefter = (neu.figuren || []).filter((f) => altF.has(f.name) && f.n >= (altZahl.get(f.name) || 0) + 5)
    .map((f) => ({ name: f.name, plus: f.n - (altZahl.get(f.name) || 0) })).sort((x, y) => y.plus - x.plus);
  const woerterPlus = (neu.woerter || 0) - (a.woerter || 0);
  const tage = a.wann ? Math.max(0, Math.round(((neu.wann || Date.now()) - a.wann) / 86400000)) : 0;
  return {
    woerterPlus, textePlus: (neu.texte || 0) - (a.texte || 0), tage,
    neueWerke, neueFiguren, neueOrte, neueBegriffe, gewachsen, oefter,
    etwasNeu: !!(woerterPlus > 0 || neueWerke.length || neueFiguren.length || neueOrte.length || neueBegriffe.length)
  };
}
/* Lohnt sich das Nachlesen schon? Pur. */
function lesungFaellig(v) { return !!v && (v.woerterPlus >= 1500 || v.neueWerke.length > 0 || v.neueFiguren.length >= 2); }

/* Was eine Stimme zum Unterschied sagt — zwei Sätze, in ihrer Art. Pur. */
const LESUNG_SAETZE = {
  king: { auf: 'Okay. I went back through the new pages.', de: 'Okay. Ich bin die neuen Seiten noch mal durchgegangen.' },
  kaestner: { auf: 'Ich habe nachgelesen, was seither dazugekommen ist.' },
  funke: { auf: 'Ich habe weitergelesen — die Tinte war fleißig.' },
  rothfuss: { auf: 'I read the new pages slowly, twice.', de: 'Ich habe die neuen Seiten langsam gelesen, zweimal.' },
  pratchett: { auf: 'Right, I’ve had another look. Notes in the margin again.', de: 'Also, ich hab noch mal reingeschaut. Wieder Randnotizen.' },
  lindgren: { auf: 'Ich habe weitergelesen, mein Kind.' },
  tolkien: { auf: 'I have read what has since been set down.', de: 'Ich habe gelesen, was seither niedergeschrieben wurde.' },
  blyton: { auf: 'I’ve read the new bits — quickly, as usual.', de: 'Ich habe das Neue gelesen — schnell, wie immer.' },
  paolini: { auf: 'I caught up on the new pages.', de: 'Ich habe die neuen Seiten nachgeholt.' },
  twain: { auf: 'I have read the new pages, pencil in hand.', de: 'Ich habe die neuen Seiten gelesen, den Bleistift in der Hand.' },
  green: { auf: 'I read the new pages. Twice — the second time slowly.', de: 'Ich habe die neuen Seiten gelesen. Zweimal — beim zweiten Mal langsam.' }
};
function lesungNotiz(autor, v, en) {
  const s = LESUNG_SAETZE[autor.id] || LESUNG_SAETZE.kaestner;
  const auf = en && s.de ? s.auf : (s.de && !en ? s.de : s.auf);
  const zahl = (n) => Number(n || 0).toLocaleString('de-DE');
  const liste = (arr, max = 4) => (arr || []).slice(0, max).join(', ');
  const teile = [auf];
  if (v.woerterPlus > 0) teile.push(en ? zahl(v.woerterPlus) + ' words more' + (v.tage ? ' in ' + v.tage + ' days' : '') + '.' : zahl(v.woerterPlus) + ' Wörter mehr' + (v.tage ? ' in ' + v.tage + ' Tagen' : '') + '.');
  if (v.neueWerke.length) teile.push((en ? 'New: ' : 'Neu dabei: ') + liste(v.neueWerke) + '.');
  if (v.gewachsen.length) teile.push((en ? 'Grown: ' : 'Gewachsen: ') + v.gewachsen.slice(0, 3).map((g) => g.name + ' (+' + zahl(g.plus) + ')').join(', ') + '.');
  if (v.neueFiguren.length) teile.push((en ? 'New names I did not know: ' : 'Neue Namen, die ich noch nicht kannte: ') + liste(v.neueFiguren, 6) + '.');
  if (v.oefter.length) teile.push((en ? 'Louder than before: ' : 'Lauter als vorher: ') + v.oefter.slice(0, 3).map((g) => g.name + ' (+' + g.plus + ')').join(', ') + '.');
  if (v.neueOrte.length) teile.push((en ? 'New places: ' : 'Neue Orte: ') + liste(v.neueOrte) + '.');
  if (v.neueBegriffe.length) teile.push((en ? 'New words of your own: ' : 'Neue eigene Wörter: ') + liste(v.neueBegriffe) + '.');
  if (teile.length === 1) teile.push(en ? 'Nothing new since last time — which is also an answer.' : 'Nichts Neues seit dem letzten Mal — auch das ist eine Antwort.');
  return teile.join(' ');
}

/* ----- Die Lesungen als Dokumente ----- */
function salonLesungen() {
  return (typeof vomTyp === 'function' ? vomTyp('lesung') : []).slice().sort((a, b) => (b.angelegt || 0) - (a.angelegt || 0));
}
function salonLetzterStand() {
  const letzte = salonLesungen()[0];
  if (letzte && letzte.stand) { try { return typeof letzte.stand === 'string' ? JSON.parse(letzte.stand) : letzte.stand; } catch (e) {} }
  const ein = typeof salonEinlesung === 'function' ? salonEinlesung() : null;
  if (ein) return { wann: new Date(ein.stand + 'T12:00:00').getTime(), woerter: ein.woerter, texte: 0, werke: (ein.werke || []).map((w) => ({ name: w.titel, woerter: w.woerter })), figuren: Object.keys(ein.figuren || {}).map((n) => ({ name: n, n: 0 })), orte: Object.keys(ein.orte || {}), begriffe: Object.keys(ein.begriffe || {}) };
  return null;
}
/* Der Unterschied zwischen dem letzten Stand und jetzt. */
function salonUnterschied() {
  const k = typeof salonKenntnis === 'function' ? salonKenntnis() : null;
  if (!k || k.leer) return null;
  return lesungVergleich(salonLetzterStand(), lesungStand(k));
}
/* Nachlesen: den Unterschied festhalten und jede Stimme etwas dazu sagen lassen. */
function salonNachlesen() {
  const k = typeof salonKenntnis === 'function' ? salonKenntnis() : null;
  if (!k || k.leer) { toast('Es liegt noch nichts da, das man lesen könnte.'); return null; }
  const stand = lesungStand(k);
  const v = lesungVergleich(salonLetzterStand(), stand);
  const notizen = {};
  for (const a of (typeof SALON_FEST !== 'undefined' ? SALON_FEST : [])) notizen[a.id] = lesungNotiz(a, v, !!a.en);
  const doc = neuDoc('lesung', {
    titel: 'Gelesen am ' + fmtDatum(Date.now()),
    stand: JSON.stringify(stand), notizen: JSON.stringify(notizen),
    text: 'Die Wand hat nachgelesen.\n\n' + (notizen.kaestner || notizen.king || '')
  });
  return { doc, vergleich: v, notizen };
}
/* Was eine Stimme bei der letzten Lesung gesagt hat. */
function salonLesungNotiz(autorId) {
  for (const l of salonLesungen()) {
    try { const n = typeof l.notizen === 'string' ? JSON.parse(l.notizen) : l.notizen; if (n && n[autorId]) return { text: n[autorId], wann: l.angelegt || 0 }; } catch (e) {}
  }
  return null;
}
