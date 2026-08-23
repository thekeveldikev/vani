/* ===================== 59 — DAS JAHR IN RINGEN =====================
   Ein Baumquerschnitt aus den Schreibtagen: zwölf Ringe, einer je Monat,
   dicke Ringe für viele Wörter, dünne für wenige, Narben, wo nichts war,
   Jahreszeitenfarben. Ein Tipp auf einen Ring zeigt, was in dem Monat
   entstand. Als Bild ansehbar, von Jahr zu Jahr blätterbar. */

const RINGE_MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
/* Zwölf Monate eines Jahres aus den Tageszählern. Pur. */
function jahresringeDaten(tage, jahr) {
  const aus = RINGE_MONATE.map((name, m) => ({ monat: m, name, worte: 0, tage: 0, jahreszeit: m <= 1 || m === 11 ? 'winter' : m <= 4 ? 'fruehling' : m <= 7 ? 'sommer' : 'herbst' }));
  for (const [k, n] of Object.entries(tage || {})) {
    const mm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k); if (!mm || Number(mm[1]) !== Number(jahr)) continue;
    const m = Number(mm[2]) - 1, w = Number(n) || 0; if (m < 0 || m > 11) continue;
    aus[m].worte += w; if (w > 0) aus[m].tage++;
  }
  const max = Math.max(1, ...aus.map((a) => a.worte));
  for (const a of aus) a.anteil = a.worte / max;
  return { jahr: Number(jahr), monate: aus, gesamt: aus.reduce((s, a) => s + a.worte, 0), tage: aus.reduce((s, a) => s + a.tage, 0), max };
}
/* Welche Jahre Zähler haben — für das Blättern. Pur. */
function jahresringeJahre(tage) {
  const j = new Set(); for (const k of Object.keys(tage || {})) { const m = /^(\d{4})-/.exec(k); if (m && (tage[k] || 0) > 0) j.add(Number(m[1])); }
  const jetzt = new Date().getFullYear(); j.add(jetzt);
  return [...j].sort((a, b) => a - b);
}
/* Das Bild: Ringe von innen (Januar) nach außen (Dezember). Pur (liefert SVG-Text). */
function jahresringeSVG(daten, { groesse = 360, hell = true } = {}) {
  const mitte = groesse / 2, innen = groesse * .07, aussen = groesse * .47;
  const farben = { winter: ['#b9c3cc', '#7f8f9c'], fruehling: ['#b7d3a0', '#6f9a5a'], sommer: ['#d8c48a', '#a8893d'], herbst: ['#d7a26c', '#a0612e'] };
  let r = innen, teile = '';
  const dicken = daten.monate.map((m) => 3 + m.anteil * 26);
  const summe = dicken.reduce((a, b) => a + b, 0), skala = (aussen - innen) / summe;
  daten.monate.forEach((m, i) => {
    const d = dicken[i] * skala, r2 = r + d;
    const [f1, f2] = farben[m.jahreszeit];
    const kraft = .35 + .65 * m.anteil;
    /* ein Ring aus mehreren leicht unrunden Linien, wie gewachsen */
    const pfad = (rad, wobbel) => { let s = ''; for (let k = 0; k <= 72; k++) { const w = k / 72 * 6.2832; const rr = rad + Math.sin(w * 3 + i) * wobbel + Math.sin(w * 7 + i * 2) * wobbel * .5; const x = mitte + Math.cos(w) * rr, y = mitte + Math.sin(w) * rr; s += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); } return s + 'Z'; };
    teile += '<path class="ring" data-monat="' + i + '" d="' + pfad(r2, 1.2) + ' ' + pfad(r, 1.2) + '" fill-rule="evenodd" fill="' + f1 + '" opacity="' + kraft.toFixed(2) + '"><title>' + m.name + ': ' + m.worte.toLocaleString('de-DE') + ' Wörter an ' + m.tage + ' Tagen</title></path>';
    teile += '<path d="' + pfad(r2, .8) + '" fill="none" stroke="' + f2 + '" stroke-width="' + (m.worte ? 1 : .4) + '" opacity=".75"/>';
    /* Narbe: ein Monat ohne ein einziges Wort bekommt eine dunkle Kerbe */
    if (!m.worte) { const w = (i / 12) * 6.2832 - 1.57; teile += '<path d="M' + (mitte + Math.cos(w) * r).toFixed(1) + ' ' + (mitte + Math.sin(w) * r).toFixed(1) + 'L' + (mitte + Math.cos(w + .06) * r2).toFixed(1) + ' ' + (mitte + Math.sin(w + .06) * r2).toFixed(1) + '" stroke="rgba(60,40,20,.45)" stroke-width="1.5"/>'; }
    r = r2;
  });
  const kern = '<circle cx="' + mitte + '" cy="' + mitte + '" r="' + innen + '" fill="#5a4326"/><circle cx="' + mitte + '" cy="' + mitte + '" r="' + (innen * .45) + '" fill="#3a2a18"/>';
  const rinde = '<circle cx="' + mitte + '" cy="' + mitte + '" r="' + (aussen + 3) + '" fill="none" stroke="#4a3420" stroke-width="6"/><circle cx="' + mitte + '" cy="' + mitte + '" r="' + (aussen + 7) + '" fill="none" stroke="#2c1e10" stroke-width="3" stroke-dasharray="3 2"/>';
  const beschriftung = daten.monate.map((m, i) => { const w = (i / 12) * 6.2832 - 1.57 + .26; const rr = aussen + 20; return '<text x="' + (mitte + Math.cos(w) * rr).toFixed(1) + '" y="' + (mitte + Math.sin(w) * rr + 4).toFixed(1) + '" text-anchor="middle" font-size="10" font-family="ui-rounded, system-ui, sans-serif" fill="' + (hell ? '#6b5a42' : '#cdbb93') + '">' + m.name.slice(0, 3) + '</text>'; }).join('');
  return '<svg class="jahresringe" viewBox="0 0 ' + groesse + ' ' + groesse + '" width="' + groesse + '" height="' + groesse + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Das Jahr ' + daten.jahr + ' in Ringen">' + rinde + teile + kern + beschriftung + '</svg>';
}
/* Das Fenster: Jahr wählen, Ringe ansehen, Monat antippen. */
function zeigeJahresringe(jahr) {
  const jahre = jahresringeJahre(D.stats.tage);
  let aktuell = jahr || jahre[jahre.length - 1];
  const bild = el('div', { class: 'ringe-bild' });
  const unter = el('div', { class: 'ringe-unter' });
  const liste = el('div', { class: 'ringe-liste' });
  const titel = el('h2', {}, '');
  const male = () => {
    const daten = jahresringeDaten(D.stats.tage, aktuell);
    titel.textContent = 'Das Jahr ' + aktuell + ' in Ringen';
    bild.innerHTML = jahresringeSVG(daten, { groesse: Math.min(360, Math.max(240, (window.innerWidth || 400) - 80)), hell: !['tinte', 'kerze'].includes(D.einst.thema) });
    unter.textContent = daten.gesamt ? daten.gesamt.toLocaleString('de-DE') + ' Wörter an ' + zaehl(daten.tage, 'Tag', 'Tagen', 'einem') + ' — der dickste Ring: ' + daten.monate.reduce((a, b) => (b.worte > a.worte ? b : a)).name : 'In diesem Jahr noch kein Wort — der Baum wartet.';
    liste.innerHTML = '';
    bild.querySelectorAll('.ring').forEach((p) => p.addEventListener('click', () => zeigeMonat(Number(p.dataset.monat))));
  };
  const zeigeMonat = (m) => {
    const von = new Date(aktuell, m, 1).getTime(), bis = new Date(aktuell, m + 1, 1).getTime();
    const docs = [...D.docs.values()].filter((d) => ['blatt', 'szene', 'seite', 'schnipsel'].includes(d.typ) && (d.text || '').trim() && ((d.angelegt >= von && d.angelegt < bis) || (d.geaendert >= von && d.geaendert < bis))).sort((a, b) => (b.geaendert || 0) - (a.geaendert || 0)).slice(0, 30);
    liste.innerHTML = '';
    liste.append(el('div', { class: 'gruppe' }, RINGE_MONATE[m].toUpperCase() + ' ' + aktuell + ' · ' + docs.length + (docs.length === 1 ? ' Text' : ' Texte')));
    if (!docs.length) liste.append(el('div', { class: 'ringe-leer' }, 'Nichts aus diesem Monat.'));
    for (const d of docs) liste.append(el('button', { class: 'ringe-eintrag', onclick: () => { zu(); oeffneDoc(d); } }, el('b', {}, (d.titel || (d.text || '').split('\n')[0] || 'Ohne Titel').slice(0, 60)), el('small', {}, fmtDatum(d.geaendert || d.angelegt) + ' · ' + worte(d.text) + ' Wörter')));
  };
  const blaettern = el('div', { class: 'ringe-jahre' }, ...jahre.map((j) => el('button', { class: 'suchchip' + (j === aktuell ? ' an' : ''), onclick: (ev) => { aktuell = j; $$('button', blaettern).forEach((b) => b.classList.toggle('an', b === ev.currentTarget)); male(); } }, String(j))));
  const kasten = el('div', { class: 'modal ringe-fenster' }, titel, blaettern, bild, unter, el('div', { class: 'ringe-hinweis' }, 'Jeder Ring ein Monat, von innen nach außen. Dick = viele Wörter, dünn = wenige, eine Kerbe = kein einziges. Tippen zeigt die Texte des Monats.'), liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf', onclick: async () => { try { const svg = bild.innerHTML; await navigator.clipboard.writeText(svg); toast('Das Bild liegt als SVG in der Zwischenablage.'); } catch (e) { toast('Kopieren ging hier nicht.'); } } }, 'Als SVG kopieren'), el('button', { class: 'knopf voll', onclick: () => zu() }, 'Gut')));
  const zu = zeigeDeck(kasten);
  male();
}
