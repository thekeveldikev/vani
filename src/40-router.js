/* ================================================================
   VANI — Räume & Wege
   ================================================================ */

const RENDER = {};
const ALLE_RAEUME = [
  { id: 'zuhause', name: 'Zuhause', icon: 'zuhause', fest: true },
  { id: 'schreibtisch', name: 'Schreibtisch', icon: 'schreibtisch' },
  { id: 'salon', name: 'Salon', icon: 'rahmen' },
  { id: 'schnipsel', name: 'Schnipsel', icon: 'schnipsel' },
  { id: 'blaetter', name: 'Blätter', icon: 'blatt' },
  { id: 'hefte', name: 'Hefte', icon: 'hefte' },
  { id: 'projekte', name: 'Projekte', icon: 'projekte' },
  { id: 'cluster', name: 'Cluster', icon: 'cluster' },
  { id: 'album', name: 'Album', icon: 'album' },
  { id: 'kabinett', name: 'Kabinett', icon: 'kabinett' },
  { id: 'woerter', name: 'Wörter', icon: 'woerter' },
  { id: 'klang', name: 'Klang', icon: 'klang' },
  { id: 'goodnotes', name: 'Goodnotes', icon: 'buchzu', standard: false },
  { id: 'faden', name: 'Faden', icon: 'faden' }
];
/* Am Handy sind fünf verlässliche Ziele besser als eine abgeschnittene Rolle
   mit sechzehn Knöpfen. Alles Weitere wohnt hinter „Mehr" und bleibt dort in
   derselben Reihenfolge erreichbar. */
const MOBILE_HAUPTRAEUME = Object.freeze(['zuhause', 'schreibtisch', 'hefte']);

function standardRaeume() {
  return ALLE_RAEUME.map((r) => ({ id: r.id, an: r.standard !== false && r.id !== 'faden' }));
}
function raumConfig() {
  if (!Array.isArray(D.einst.raeume) || !D.einst.raeume.length) D.einst.raeume = standardRaeume();
  /* neue Räume nachtragen, entfernte bereinigen */
  for (const r of ALLE_RAEUME) {
    if (!D.einst.raeume.some((x) => x.id === r.id)) D.einst.raeume.push({ id: r.id, an: r.standard !== false && r.id !== 'faden' });
  }
  D.einst.raeume = D.einst.raeume.filter((x) => ALLE_RAEUME.some((r) => r.id === x.id));
  return D.einst.raeume;
}
function aktiveRaeume() {
  return raumConfig()
    .filter((x) => x.an || ALLE_RAEUME.find((r) => r.id === x.id).fest)
    .map((x) => ALLE_RAEUME.find((r) => r.id === x.id));
}

async function oeffneMobileRaumwahl() {
  const punkte = aktiveRaeume()
    .filter((r) => !MOBILE_HAUPTRAEUME.includes(r.id))
    .map((r) => ({ text: r.name, icon: r.icon, wert: r.id }));
  punkte.push({ text: 'Feinheiten', icon: 'feinheiten', wert: 'feinheiten' });
  const ziel = await menue(punkte, 'Alle Räume');
  if (ziel) location.hash = '#/' + ziel;
}

function aktualisiereLeiste(aktiv) {
  $$('#leiste .lknopf').forEach((k) => k.classList.toggle('an', k.dataset.raum === aktiv));
  const mehr = $('#leiste .mobile-mehr');
  if (!mehr) return;
  const istMehr = aktiv === 'feinheiten' || !MOBILE_HAUPTRAEUME.includes(aktiv);
  mehr.classList.toggle('an', istMehr);
  const beschriftung = $('.mobile-mehr-name', mehr);
  const info = aktiv === 'feinheiten'
    ? { name: 'Feinheiten' }
    : ALLE_RAEUME.find((r) => r.id === aktiv);
  if (beschriftung) beschriftung.textContent = istMehr && info ? info.name : 'Mehr';
  mehr.title = istMehr && info ? info.name + ' · alle Räume öffnen' : 'Alle Räume öffnen';
}

function baueLeiste() {
  const l = $('#leiste');
  l.innerHTML = '';
  l.append(el('div', { class: 'wortmarke' }, 'V'));
  /* Am Rechner bleibt die vollständige Raumrolle. Am Handy zeigt CSS daraus
     nur die drei Hauptziele; Suche und Mehr bilden die beiden festen Plätze. */
  const rolle = el('div', { class: 'raumrolle' });
  for (const r of aktiveRaeume()) {
    rolle.append(el('button', {
      class: 'lknopf' + (MOBILE_HAUPTRAEUME.includes(r.id) ? ' mobil-haupt' : ''), 'data-raum': r.id,
      onclick: () => { location.hash = '#/' + (r.id === 'zuhause' ? '' : r.id); }
    }, el('span', { html: ik(r.icon), style: 'display:flex' }), el('span', {}, r.name)));
  }
  l.append(rolle);
  l.append(el('div', { class: 'luecke' }));
  l.append(el('button', { class: 'lknopf nav-suche', onclick: () => oeffneSuche() },
    el('span', { html: ik('suche'), style: 'display:flex' }), el('span', {}, 'Suche')));
  l.append(el('button', { class: 'lknopf nav-feinheiten', 'data-raum': 'feinheiten', onclick: () => { location.hash = '#/feinheiten'; } },
    el('span', { html: ik('feinheiten'), style: 'display:flex' }), el('span', {}, 'Feinheiten')));
  l.append(el('button', { class: 'lknopf mobile-mehr', 'data-raum': 'mehr', onclick: () => oeffneMobileRaumwahl() },
    el('span', { html: ik('mehr'), style: 'display:flex' }), el('span', { class: 'mobile-mehr-name' }, 'Mehr')));
}

function zeichne() {
  const teile = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const raum = teile[0] || 'zuhause';
  const arg = teile[1];
  const haupt = $('#raum');
  const fn = RENDER[raum] || RENDER.zuhause;
  /* Ein Raum darf stehen bleiben, wenn sich nichts geändert hat (der Schreibtisch
     vergleicht seine Signatur) — sonst würde jedes Sync-Häppchen ihn neu aufbauen. */
  if (typeof fn.behalten === 'function' && haupt.firstElementChild && fn.behalten(haupt, arg)) {
    const aktiv0 = { heft: 'hefte', projekt: 'projekte', brett: 'cluster' }[raum] || raum;
    aktualisiereLeiste(aktiv0);
    return;
  }
  haupt.innerHTML = '';
  haupt.scrollTop = 0;
  fn(haupt, arg);
  /* Räume als Orte: Kulisse davor, Haut anlegen, Tür aufgehen lassen (wenn eingeschaltet) */
  if (typeof orteAnwenden === 'function') { try { orteAnwenden(haupt, raum); } catch (e) {} }
  const aktiv = { heft: 'hefte', projekt: 'projekte', brett: 'cluster' }[raum] || raum;
  aktualisiereLeiste(aktiv);
}

function raumkopf(titel, unter, ...aktionen) {
  return el('div', { class: 'kopf' + (aktionen.filter(Boolean).length > 2 ? ' viele-aktionen' : '') },
    el('h1', {}, titel, unter ? el('div', { class: 'unter' }, unter) : null),
    aktionen.some(Boolean) ? el('div', { class: 'kopf-aktionen' }, ...aktionen) : null
  );
}
function zurueckknopf(ziel) {
  return el('button', { class: 'rundknopf zart', html: ik('zurueck'), title: 'Zurück', onclick: () => { location.hash = ziel; } });
}

window.addEventListener('hashchange', zeichne);
