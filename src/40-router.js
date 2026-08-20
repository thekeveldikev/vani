/* ================================================================
   VANI — Räume & Wege
   ================================================================ */

const RENDER = {};
const RAEUME = [
  { id: 'zuhause', name: 'Zuhause', icon: 'zuhause' },
  { id: 'schnipsel', name: 'Schnipsel', icon: 'schnipsel' },
  { id: 'hefte', name: 'Hefte', icon: 'hefte' },
  { id: 'projekte', name: 'Projekte', icon: 'projekte' },
  { id: 'cluster', name: 'Cluster', icon: 'cluster' },
  { id: 'woerter', name: 'Wörter', icon: 'woerter' }
];

function baueLeiste() {
  const l = $('#leiste');
  l.innerHTML = '';
  l.append(el('div', { class: 'wortmarke' }, 'V'));
  for (const r of RAEUME) {
    l.append(el('button', {
      class: 'lknopf', 'data-raum': r.id,
      onclick: () => { location.hash = '#/' + (r.id === 'zuhause' ? '' : r.id); }
    }, el('span', { html: ik(r.icon), style: 'display:flex' }), el('span', {}, r.name)));
  }
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
  return el('button', { class: 'rundknopf zart', html: ik('zurueck'), onclick: () => { location.hash = ziel; } });
}

window.addEventListener('hashchange', zeichne);
