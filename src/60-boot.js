/* ================================================================
   VANI — Aufwachen
   ================================================================ */

(async function start() {
  try {
    await ladeAlles();
  } catch (e) {
    document.body.innerHTML = '<div style="padding:60px;text-align:center;font-family:Georgia,serif">Der Speicher wollte nicht aufwachen. Einmal neu öffnen hilft fast immer.</div>';
    return;
  }

  /* Erste Saat */
  if (!(await dbGet('kv', 'gesaet'))) {
    if (![...D.docs.values()].some((d) => d.typ === 'wort')) {
      for (const w of SAATWORTE) neuDoc('wort', { text: w });
    }
    await dbPut('kv', 1, 'gesaet');
  }

  setzeThema(D.einst.thema);
  baueLeiste();
  zeichne();

  /* Speicher festhalten */
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

  /* Tastatur-Höhe (iPad) */
  if (window.visualViewport) {
    const anpassen = () => {
      document.documentElement.style.setProperty('--vvh', window.visualViewport.height + 'px');
    };
    window.visualViewport.addEventListener('resize', anpassen);
    anpassen();
  }

  /* Klang wieder aufnehmen? Erst nach der ersten Berührung erlaubt. */
  if (D.einst.klang && D.einst.klang !== 'aus') {
    const einmal = () => {
      document.removeEventListener('pointerdown', einmal);
      try { klangSetzen(D.einst.klang); } catch (e) {}
    };
    document.addEventListener('pointerdown', einmal, { once: true });
  }

  /* Service Worker — nur wo es ihn gibt */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !location.search.includes('kein-sw')) {
    try { navigator.serviceWorker.register('sw.js'); } catch (e) {}
  }
})();
