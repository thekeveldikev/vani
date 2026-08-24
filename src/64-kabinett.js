/* ===================== 64 — DAS KABINETT =====================
   Ein schwerer Schrank mit Fächern. In jedem Fach liegt ein Werkzeug, das zu
   groß ist, um irgendwo nebenher zu wohnen — und zu selten gebraucht, um
   einen eigenen Platz in der Leiste zu verdienen.

   Ein Tippen auf ein Fach, und das Werkzeug geht vollflächig auf: eigene
   Leiste, eigener Rücken-Knopf, nichts vom Kabinett mehr zu sehen. Es
   verhält sich wie ein eigener Raum, ohne einer zu sein. Man verliert die
   Übersicht nicht, weil man weiß, wo man herkam.

   Ein neues Werkzeug einzuhängen ist ein Eintrag in KABINETT_FAECHER — mehr
   nicht. Alles andere (Kachel, Öffnen, Rücken, Zählen) macht der Schrank. */

const KABINETT_FAECHER = [
  {
    id: 'stammbaum',
    name: 'Der Wandteppich',
    unter: 'Stammbäume, die auch die Fäden kennen, die keine Familie sind',
    text: 'Namen auf Bändern, Äste dazwischen — und darüber alles, was sonst noch zwischen Menschen liegt: geliebt, gehasst, getötet, verschwiegen.',
    emblem: 'baum',
    zaehlen: () => (typeof stammbaeume === 'function' ? stammbaeume().length : 0),
    wort: (n) => n === 1 ? 'ein Teppich' : n + ' Teppiche',
    oeffnen: (zurueck) => (typeof stammbaumWerkzeug === 'function' ? stammbaumWerkzeug(zurueck) : null)
  },
  {
    id: 'stadtplan',
    name: 'Der Kartentisch',
    unter: 'Stadtpläne für Orte, die es nur bei dir gibt',
    text: 'Sag, wo die Stadt liegt und wie alt sie ist — Gassen, Blöcke und Häuser wachsen daraus. Danach gehst du hinein und gibst den Stellen Namen.',
    emblem: 'plan',
    zaehlen: () => (typeof stadtplaene === 'function' ? stadtplaene().length : 0),
    wort: (n) => n === 1 ? 'eine Stadt' : n + ' Städte',
    oeffnen: (zurueck) => (typeof stadtplanWerkzeug === 'function' ? stadtplanWerkzeug(zurueck) : null)
  },
  {
    id: 'sternhimmel',
    name: 'Die Sternwarte',
    unter: 'Ein Himmel wird gerechnet — die Sternbilder ziehst du selbst',
    text: 'Sterne stehen zufällig da und sind Lichtjahre voneinander entfernt. Ein Sternbild entsteht erst, weil jemand beschließt, dass zwischen diesen sieben Punkten ein Reiher ist — und die Geschichte dazu weitererzählt.',
    emblem: 'stern',
    zaehlen: () => (typeof sternhimmel === 'function' ? sternhimmel().length : 0),
    wort: (n) => n === 1 ? 'ein Himmel' : n + ' Himmel',
    oeffnen: (zurueck) => (typeof sternwarteWerkzeug === 'function' ? sternwarteWerkzeug(zurueck) : null)
  }
];

RENDER.kabinett = function (haupt) {
  const kopf = raumkopf('Das Kabinett',
    'Ein Schrank mit Fächern. Was darin liegt, geht vollflächig auf und schließt sich wieder.');

  const schrank = el('div', { class: 'kab-schrank' },
    el('i', { class: 'kab-krone', 'aria-hidden': 'true' }),
    el('div', { class: 'kab-faecher' }, ...KABINETT_FAECHER.map((f, i) => kabinettFach(f, i))),
    el('i', { class: 'kab-sockel', 'aria-hidden': 'true' }));

  haupt.append(kopf, el('div', { class: 'inhalt kab-raum' }, schrank,
    el('p', { class: 'kab-fusstext' }, 'Werkzeuge wohnen hier, weil sie groß gedacht sind, aber selten gebraucht werden. In der Leiste nähmen sie Platz weg, den sie nicht verdienen — hier stehen sie bereit, ohne im Weg zu sein.')));
};

function kabinettFach(fach, i) {
  const anzahl = !fach.baustelle && typeof fach.zaehlen === 'function' ? fach.zaehlen() : null;
  const knopf = el('button', {
    class: 'kab-fach' + (fach.baustelle ? ' verschlossen' : ''),
    style: '--n:' + i,
    title: fach.baustelle ? fach.name + ' — noch nicht fertig' : fach.name + ' öffnen',
    onclick: () => {
      if (fach.baustelle) { toast('Dieses Fach ist noch leer.', 4200); return; }
      kabinettOeffnen(fach);
    }
  },
    el('i', { class: 'kab-holzmaser', 'aria-hidden': 'true' }),
    el('span', { class: 'kab-emblem', html: KABINETT_EMBLEME[fach.emblem] || '' }),
    el('span', { class: 'kab-schild' },
      el('b', {}, fach.name),
      el('small', {}, fach.unter)),
    el('span', { class: 'kab-text' }, fach.text),
    anzahl != null
      ? el('span', { class: 'kab-zahl' }, anzahl ? (fach.wort ? fach.wort(anzahl) : String(anzahl)) : 'noch leer')
      : el('span', { class: 'kab-zahl blass' }, 'in Arbeit'),
    el('i', { class: 'kab-griff', 'aria-hidden': 'true' }));
  return knopf;
}

/* ----- Ein Fach aufziehen -----
   Das Werkzeug bekommt die ganze Fläche und einen eigenen Rücken-Knopf.
   Es weiß nichts vom Kabinett; es bekommt nur eine Funktion, mit der es
   sich selbst wieder schließt. */
function kabinettOeffnen(fach) {
  const huelle = el('div', { class: 'kab-vollbild' });
  const zu = zeigeDeck(huelle, () => { document.removeEventListener('keydown', taste); });
  const taste = (ev) => {
    if (!huelle.isConnected) { document.removeEventListener('keydown', taste); return; }
    if (ev.key === 'Escape' && document.querySelectorAll('.schleier').length === 1) { ev.preventDefault(); zu(); }
  };
  document.addEventListener('keydown', taste);

  const inhalt = fach.oeffnen ? fach.oeffnen(zu) : null;
  if (!inhalt) {
    huelle.append(el('div', { class: 'leer' }, 'Dieses Fach lässt sich gerade nicht öffnen.',
      el('div', { class: 'klein' }, 'Lade VANI neu — wenn es dann noch klemmt, sag es mir.')));
    return;
  }
  huelle.append(inhalt);
  huelle.classList.add('zieht-auf');
  setTimeout(() => huelle.classList.remove('zieht-auf'), 700);
}

/* Die Embleme auf den Fächern: geritzt, nicht gemalt. */
const KABINETT_EMBLEME = {
  /* Ein Sternbild als Emblem: sieben Punkte und die Linien dazwischen —
     genau das, worum es in dem Fach geht. */
  stern: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M9 33 L17 21 L26 26 L33 12 L40 19" stroke-opacity=".7"/>' +
    '<g fill="currentColor" stroke="none">' +
    '<circle cx="9" cy="33" r="2.1"/><circle cx="17" cy="21" r="2.8"/><circle cx="26" cy="26" r="1.8"/>' +
    '<circle cx="33" cy="12" r="2.4"/><circle cx="40" cy="19" r="1.7"/>' +
    '<circle cx="14" cy="40" r="1"/><circle cx="36" cy="35" r="1.2"/><circle cx="43" cy="30" r=".9"/>' +
    '<circle cx="21" cy="9" r="1"/><circle cx="6" cy="16" r="1.1"/>' +
    '</g>' +
    '<path d="M33 6 v-3 M33 18 v3 M27 12 h-3 M39 12 h3" stroke-opacity=".45"/></svg>',
  baum: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
    '<path d="M10 42 C 13 34 16 28 22 23 C 27 19 32 15 40 11"/>' +
    '<path d="M22 23 C 26 18 31 16 38 17"/>' +
    '<path d="M16 30 C 19 25 24 23 30 24"/>' +
    '<path d="M28 20 C 30 14 34 11 40 10"/>' +
    '<ellipse cx="40.5" cy="10" rx="3.6" ry="2.4" transform="rotate(-20 40.5 10)"/>' +
    '<ellipse cx="38" cy="17" rx="3.2" ry="2.2" transform="rotate(-12 38 17)"/>' +
    '<ellipse cx="30.5" cy="24" rx="3" ry="2" transform="rotate(-8 30.5 24)"/>' +
    '<path d="M6 44 C 8 42 9 42 10 42 C 12 42 13 43 15 44"/></svg>',
  plan: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 12 L18 8 L30 12 L42 8 V36 L30 40 L18 36 L6 40 Z"/>' +
    '<path d="M18 8 V36 M30 12 V40"/>' +
    '<path d="M10 22 H16 M22 18 H27 M34 26 H39"/>' +
    '<circle cx="24" cy="24" r="2.2"/></svg>'
};
