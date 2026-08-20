/* ================================================================
   VANI — Aufwachen
   ================================================================ */

(async function start() {
  const startzeit = Date.now();
  try {
    await ladeAlles();
  } catch (e) {
    document.body.innerHTML = '<div style="padding:60px;text-align:center;font-family:Georgia,serif">Der Speicher wollte nicht aufwachen. Einmal neu öffnen hilft fast immer.</div>';
    return;
  }

  /* Umzüge von früheren Fassungen */
  if (typeof D.einst.klang === 'string' && D.einst.klang !== 'aus' && !Object.keys(D.einst.mischung || {}).length) {
    const alt = { regen: 'regenfenster', kamin: 'kamin', wind: 'wind', grillen: 'grillen' }[D.einst.klang];
    if (alt) D.einst.mischung = { [alt]: .5 };
  }
  delete D.einst.klang;

  /* Erste Saat */
  if (!(await dbGet('kv', 'gesaet'))) {
    if (![...D.docs.values()].some((d) => d.typ === 'wort')) {
      for (const w of SAATWORTE) neuDoc('wort', { text: w });
    }
    await dbPut('kv', 1, 'gesaet');
  }

  /* Faden von allein zeigen, sobald es einen gibt */
  raumConfig();
  if ([...D.docs.values()].some((d) => d.typ === 'faden')) {
    const f = D.einst.raeume.find((x) => x.id === 'faden');
    if (f && !f.an && !D.einst.fadenAbgewaehlt) f.an = true;
  }

  setzeThema(D.einst.thema);
  baueLeiste();
  zeichne();

  /* Speicher festhalten */
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

  /* Nichts verlieren, auch wenn iOS die App wegwirft */
  const notSicherung = () => { try { spueleAlles(); } catch (e) {} };
  window.addEventListener('pagehide', notSicherung);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') notSicherung(); });

  /* Tastatur-Höhe (iPad) */
  if (window.visualViewport) {
    const anpassen = () => {
      document.documentElement.style.setProperty('--vvh', window.visualViewport.height + 'px');
    };
    window.visualViewport.addEventListener('resize', anpassen);
    anpassen();
    window.addEventListener('focusout', () => setTimeout(anpassen, 250));
  }

  /* Klang wieder aufnehmen? Erst nach der ersten Berührung erlaubt. */
  if (Object.values(D.einst.mischung || {}).some((v) => v > 0)) {
    const einmal = () => {
      try { mischungAnwenden(D.einst.mischung); } catch (e) {}
    };
    document.addEventListener('pointerdown', einmal, { once: true });
  }

  /* Papierkorb: sehr Altes still wegräumen */
  setTimeout(() => { papierkorbLeeren(30).catch(() => {}); }, 4000);

  /* Service Worker — nur wo es ihn gibt */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !location.search.includes('kein-sw')) {
    try {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const neu = reg.installing;
          if (!neu) return;
          neu.addEventListener('statechange', () => {
            if (neu.state === 'installed' && navigator.serviceWorker.controller) {
              toastMitAktion('Eine neue Fassung liegt bereit.', 'Neu laden', () => location.reload(), 8000);
            }
          });
        });
      }).catch(() => {});
    } catch (e) {}
  }

  /* Vorhang auf */
  const vorhang = $('#vorhang');
  if (vorhang) {
    const warte = Math.max(0, 650 - (Date.now() - startzeit));
    setTimeout(() => {
      vorhang.classList.add('auf');
      setTimeout(() => vorhang.remove(), 700);
    }, warte);
  }
})();
