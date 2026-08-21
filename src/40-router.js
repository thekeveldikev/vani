/* ================================================================
   VANI — Räume & Wege
   ================================================================ */

const RENDER = {};
const ALLE_RAEUME = [
  { id: 'zuhause', name: 'Zuhause', icon: 'zuhause', fest: true },
  { id: 'schnipsel', name: 'Schnipsel', icon: 'schnipsel' },
  { id: 'blaetter', name: 'Blätter', icon: 'blatt' },
  { id: 'hefte', name: 'Hefte', icon: 'hefte' },
  { id: 'projekte', name: 'Projekte', icon: 'projekte' },
  { id: 'cluster', name: 'Cluster', icon: 'cluster' },
  { id: 'woerter', name: 'Wörter', icon: 'woerter' },
  { id: 'klang', name: 'Klang', icon: 'klang' },
  { id: 'goodnotes', name: 'Goodnotes', icon: 'buchzu', standard: false },
  { id: 'faden', name: 'Faden', icon: 'faden' }
];

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

function baueLeiste() {
  const l = $('#leiste');
  l.innerHTML = '';
  l.append(el('div', { class: 'wortmarke' }, 'V'));
  /* Die Räume liegen in einer eigenen Rolle. Am Handy schiebt sich nur sie zur
     Seite — Suche und Feinheiten bleiben immer sichtbar und erreichbar. */
  const rolle = el('div', { class: 'raumrolle' });
  for (const r of aktiveRaeume()) {
    rolle.append(el('button', {
      class: 'lknopf', 'data-raum': r.id,
      onclick: () => { location.hash = '#/' + (r.id === 'zuhause' ? '' : r.id); }
    }, el('span', { html: ik(r.icon), style: 'display:flex' }), el('span', {}, r.name)));
  }
  l.append(rolle);
  l.append(el('div', { class: 'luecke' }));
  l.append(el('button', { class: 'lknopf', onclick: () => oeffneSuche() },
    el('span', { html: ik('suche'), style: 'display:flex' }), el('span', {}, 'Suche')));
  l.append(el('button', { class: 'lknopf', 'data-raum': 'feinheiten', onclick: () => { location.hash = '#/feinheiten'; } },
    el('span', { html: ik('feinheiten'), style: 'display:flex' }), el('span', {}, 'Feinheiten')));
}

function zeichne() {
  const teile = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const raum = teile[0] || 'zuhause';
  const arg = teile[1];
  const haupt = $('#raum');
  haupt.innerHTML = '';
  haupt.scrollTop = 0;
  const fn = RENDER[raum] || RENDER.zuhause;
  fn(haupt, arg);
  const aktiv = { heft: 'hefte', projekt: 'projekte', brett: 'cluster' }[raum] || raum;
  $$('#leiste .lknopf').forEach((k) => k.classList.toggle('an', k.dataset.raum === aktiv));
}

function raumkopf(titel, unter, ...aktionen) {
  return el('div', { class: 'kopf' },
    el('h1', {}, titel, unter ? el('div', { class: 'unter' }, unter) : null),
    ...aktionen
  );
}
function zurueckknopf(ziel) {
  return el('button', { class: 'rundknopf zart', html: ik('zurueck'), title: 'Zurück', onclick: () => { location.hash = ziel; } });
}

window.addEventListener('hashchange', zeichne);
