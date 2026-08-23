/* ===================== 33 — DIE SCROLLLEISTE =====================
   Lange Seiten sind mit dem Finger eine Wanderung. Rechts am Rand liegt
   deshalb ein schmaler Griff: anfassen, ziehen, loslassen — und man ist da.

   Sie hält sich zurück. Solange man nichts tut, ist sie fast unsichtbar; wer
   scrollt, sieht sie kurz; wer sie anfasst, bekommt eine kleine Fahne, die
   sagt, wo man landet. Marken zeigen, wo etwas ist — Kapitel, Seiten,
   Abschnitte —, damit das Ziehen nicht blind geschieht.

   Angehängt wird sie an einen Bereich, der scrollt:
     scrollleiste(bereich, { marken: () => [{ anteil, name }], fahne: (a) => '…' })
   Sie räumt sich selbst weg, sobald der Bereich aus dem Bild ist. */

function scrollleiste(bereich, optionen = {}) {
  if (!bereich || typeof ResizeObserver === 'undefined') return null;
  /* Zweimal an denselben Bereich wäre eine Leiste zu viel. */
  if (bereich._leiste) return bereich._leiste;

  const griff = el('i', { class: 'sl-griff' });
  const fahne = el('span', { class: 'sl-fahne' });
  const spur = el('div', { class: 'sl-spur' }, griff);
  const markenLage = el('div', { class: 'sl-marken' });
  const leiste = el('div', { class: 'scrollleiste', 'aria-hidden': 'true' }, markenLage, spur, fahne);
  const hoch = el('button', { class: 'sl-sprung hoch', title: 'Ganz nach oben', tabindex: '-1' }, '⌃');
  const runter = el('button', { class: 'sl-sprung runter', title: 'Ganz nach unten', tabindex: '-1' }, '⌄');
  leiste.append(hoch, runter);

  let zeigen = 0, zieht = false, aus = false;
  const sichtbar = (dauer = 1300) => {
    leiste.classList.add('sichtbar');
    clearTimeout(zeigen);
    if (!zieht) zeigen = setTimeout(() => leiste.classList.remove('sichtbar'), dauer);
  };

  const masse = () => {
    const hoehe = bereich.clientHeight, ganz = bereich.scrollHeight;
    return { hoehe, ganz, weg: Math.max(0, ganz - hoehe) };
  };
  const stellen = () => {
    const m = masse();
    /* Passt alles auf einen Blick, braucht es keine Leiste. */
    const noetig = m.weg > 80;
    leiste.classList.toggle('unnoetig', !noetig);
    if (!noetig) return;
    const spurHoehe = spur.clientHeight;
    const griffHoehe = Math.max(38, Math.round(spurHoehe * (m.hoehe / m.ganz)));
    const anteil = m.weg ? bereich.scrollTop / m.weg : 0;
    griff.style.height = griffHoehe + 'px';
    griff.style.transform = 'translateY(' + ((spurHoehe - griffHoehe) * anteil).toFixed(1) + 'px)';
    if (zieht) {
      fahne.style.top = Math.round((spurHoehe - griffHoehe) * anteil + griffHoehe / 2) + 'px';
      fahne.textContent = typeof optionen.fahne === 'function' ? (optionen.fahne(anteil, bereich) || Math.round(anteil * 100) + ' %') : Math.round(anteil * 100) + ' %';
    }
  };

  /* Marken: kleine Striche an der Spur, dort, wo etwas anfängt. */
  const markenSetzen = () => {
    markenLage.innerHTML = '';
    if (typeof optionen.marken !== 'function') return;
    let liste = [];
    try { liste = optionen.marken(bereich) || []; } catch (e) { liste = []; }
    for (const m of liste.slice(0, 120)) {
      const a = begrenze(m.anteil, 0, 1, 0);
      markenLage.append(el('i', { class: 'sl-marke' + (m.stark ? ' stark' : ''), style: 'top:' + (a * 100).toFixed(2) + '%', title: m.name || '' }));
    }
  };

  /* Weiches Springen: kein harter Sprung, aber auch kein Gezappel. */
  const springenZu = (ziel) => {
    const m = masse();
    const wohin = begrenze(ziel, 0, m.weg, 0);
    try { bereich.scrollTo({ top: wohin, behavior: 'smooth' }); }
    catch (e) { bereich.scrollTop = wohin; }
  };
  const ausPunkt = (klientY) => {
    const r = spur.getBoundingClientRect();
    const griffHoehe = griff.offsetHeight;
    const anteil = begrenze((klientY - r.top - griffHoehe / 2) / Math.max(1, r.height - griffHoehe), 0, 1, 0);
    return anteil * masse().weg;
  };

  let zeiger = 0;
  const fassen = (ev) => {
    if (leiste.classList.contains('unnoetig')) return;
    ev.preventDefault();
    zieht = true; zeiger = ev.pointerId;
    leiste.classList.add('sichtbar', 'zieht');
    try { spur.setPointerCapture(ev.pointerId); } catch (e) {}
    bereich.scrollTop = ausPunkt(ev.clientY);
    stellen();
  };
  spur.addEventListener('pointerdown', fassen);
  spur.addEventListener('pointermove', (ev) => {
    if (!zieht || ev.pointerId !== zeiger) return;
    ev.preventDefault();
    bereich.scrollTop = ausPunkt(ev.clientY);
    stellen();
  });
  const loslassen = (ev) => {
    if (!zieht || (ev && ev.pointerId !== zeiger)) return;
    zieht = false;
    leiste.classList.remove('zieht');
    sichtbar(900);
  };
  spur.addEventListener('pointerup', loslassen);
  spur.addEventListener('pointercancel', loslassen);

  hoch.addEventListener('click', () => { springenZu(0); sichtbar(); });
  runter.addEventListener('click', () => { springenZu(masse().weg); sichtbar(); });

  const beiScroll = () => { stellen(); sichtbar(); };
  bereich.addEventListener('scroll', beiScroll, { passive: true });
  const ro = new ResizeObserver(() => { stellen(); markenSetzen(); });
  ro.observe(bereich);
  /* Wächst der Inhalt (Bilder laden, Listen kommen nach), stimmt die Größe wieder. */
  const mo = new MutationObserver(() => { stellen(); markenSetzen(); });
  mo.observe(bereich, { childList: true, subtree: true });

  const abraeumen = () => {
    if (aus) return;
    aus = true;
    bereich.removeEventListener('scroll', beiScroll);
    ro.disconnect(); mo.disconnect();
    clearTimeout(zeigen);
    leiste.remove();
    delete bereich._leiste;
  };
  /* Verschwindet der Bereich, verschwindet die Leiste mit. */
  const wache = new MutationObserver(() => { if (!bereich.isConnected) { abraeumen(); wache.disconnect(); } });
  if (bereich.parentNode) wache.observe(bereich.parentNode, { childList: true });

  (optionen.ziel || bereich.parentNode || document.body).append(leiste);
  bereich._leiste = { element: leiste, stellen, markenSetzen, ab: abraeumen };
  /* Kein requestAnimationFrame: der steht still, solange das Fenster verdeckt
     ist. Baut sich der Bereich in einem Hintergrund-Tab auf, bekäme die Leiste
     nie eine Höhe und der Einblendzähler liefe nie an. */
  setTimeout(() => { stellen(); markenSetzen(); sichtbar(2200); }, 0);
  return bereich._leiste;
}

/* ----- Marken aus Überschriften: für Hefte und den Schreibraum ----- */
function scrollMarkenAusUeberschriften(bereich, wahl = 'h1, h2, h3, .sr-seite, .heft-seite') {
  const ganz = bereich.scrollHeight;
  if (!ganz) return [];
  const oben = bereich.getBoundingClientRect().top - bereich.scrollTop;
  return [...bereich.querySelectorAll(wahl)].slice(0, 120).map((k) => ({
    anteil: begrenze((k.getBoundingClientRect().top - oben) / ganz, 0, 1, 0),
    name: (k.textContent || '').trim().slice(0, 60),
    stark: k.tagName === 'H1' || k.tagName === 'H2'
  }));
}
/* Die Fahne beim Ziehen: im Text lieber die Stelle als eine Zahl. */
function scrollFahneText(bereich) {
  return (anteil) => {
    const marken = scrollMarkenAusUeberschriften(bereich);
    let letzte = null;
    for (const m of marken) if (m.anteil <= anteil + .001) letzte = m;
    return letzte && letzte.name ? letzte.name : Math.round(anteil * 100) + ' %';
  };
}
