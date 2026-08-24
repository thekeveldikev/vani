/* ================================================================
   VANI — Aufwachen
   ================================================================ */

let _swReg = null;
function _warteAufWorker(worker, ms = 7000) {
  if (!worker || worker.state === 'installed' || worker.state === 'activated') return Promise.resolve(true);
  return new Promise((resolve) => {
    let fertig = false;
    const ende = (wert) => { if (fertig) return; fertig = true; resolve(wert); };
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' || worker.state === 'activated') ende(true);
      if (worker.state === 'redundant') ende(false);
    });
    setTimeout(() => ende(false), ms);
  });
}

async function sucheAppUpdate(neuLaden = false) {
  if (globalThis.vaniDesktop && vaniDesktop.updateSuchen) {
    try {
      const r = await vaniDesktop.updateSuchen();
      toast(r && r.art === 'nicht-eingerichtet'
        ? 'Diese Desktop-Fassung wird durch den nächsten VANI-Installer ersetzt. Deine Inhalte bleiben dabei erhalten.'
        : 'VANI sieht nach einer neuen Desktop-Fassung …', 5000);
      return true;
    } catch (e) { toast('Gerade konnte VANI nicht nach einer Desktop-Aktualisierung sehen.'); return false; }
  }
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http') || location.search.includes('kein-sw')) {
    toast('Hier läuft die Vorschau. Updates kommen am Home-Bildschirm-Icon automatisch an.');
    return false;
  }
  try {
    const alterController = navigator.serviceWorker.controller;
    const controllerWechsel = new Promise((resolve) => {
      let fertig = false;
      const ende = (wert) => { if (fertig) return; fertig = true; resolve(wert); };
      navigator.serviceWorker.addEventListener('controllerchange', () => ende(true), { once: true });
      setTimeout(() => ende(false), 8000);
    });
    _swReg = _swReg || await navigator.serviceWorker.getRegistration();
    if (!_swReg) _swReg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
    await _swReg.update();
    if (_swReg.installing) await _warteAufWorker(_swReg.installing);
    if (_swReg.waiting) _swReg.waiting.postMessage({ typ: 'AKTIVIEREN' });
    if (neuLaden && (alterController !== navigator.serviceWorker.controller || _swReg.waiting || _swReg.installing)) {
      toast('Neue Fassung wird geöffnet …');
      await controllerWechsel;
      location.reload();
      return true;
    }
    toast('Du hast die aktuelle Fassung ' + APP_VERSION + '. Dein Home-Bildschirm-Icon bleibt dasselbe.');
    return true;
  } catch (e) { toast('Gerade konnte ich nicht nachsehen. Die jetzige Fassung läuft trotzdem offline.'); return false; }
}

(async function start() {
  const startzeit = Date.now();
  try {
    if (typeof profilAnmelden === 'function') await profilAnmelden();
    await ladeAlles();
  } catch (e) {
    document.body.innerHTML = '<div style="padding:60px;text-align:center;font-family:Georgia,serif">Der Speicher wollte nicht aufwachen. Einmal neu öffnen hilft fast immer.</div>';
    return;
  }

  /* Die Tastatur soll den Dialog nicht aus dem Bild schieben. */
  if (typeof tastaturZaehmen === 'function') tastaturZaehmen();
  /* Strg+Z überall — einmal angemeldet, gilt für jeden Raum. */
  if (typeof zugTastenAnmelden === 'function') zugTastenAnmelden();

  /* Umzüge von früheren Fassungen */
  if (typeof D.einst.klang === 'string' && D.einst.klang !== 'aus' && !Object.keys(D.einst.mischung || {}).length) {
    const alt = { regen: 'regenfenster', kamin: 'kamin', wind: 'wind', grillen: 'grillen' }[D.einst.klang];
    if (alt) D.einst.mischung = { [alt]: .5 };
  }
  delete D.einst.klang;
  D.einst.mischung = saubereMischung(D.einst.mischung);

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
  if ([...D.docs.values()].some((d) => d.typ === 'goodnote')) {
    const g = D.einst.raeume.find((x) => x.id === 'goodnotes');
    if (g) g.an = true;
  }

  /* Der Klangfundus: eine kleine Liste neben der App. Fehlt sie, bleibt nur
     der gewebte Klang — die App läuft trotzdem. */
  if (typeof ambienceKatalogSetzen === 'function') {
    fetch('klang/katalog.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : []))
      .then((liste) => { if (ambienceKatalogSetzen(liste).length && location.hash.startsWith('#/klang')) zeichne(); })
      .catch(() => {});
  }

  setzeThema(D.einst.thema);
  baueLeiste();
  zeichne();

  /* Geteilter Text (Android „Teilen → VANI“) oder ein Schnellstart vom Icon */
  const auftrag = startAuftrag(location.search);
  if (auftrag) {
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    if (auftrag.art === 'geteilt' && auftrag.text) {
      neuDoc('schnipsel', { text: auftrag.text });
      location.hash = '#/schnipsel';
      setTimeout(() => toast('Angekommen — liegt in den Schnipseln.', 3600), 400);
    } else if (auftrag.art === 'neu') {
      if (auftrag.was === 'schnipsel') { location.hash = '#/schnipsel'; setTimeout(() => { const f = $('.schreibzeile textarea'); if (f) f.focus(); }, 300); }
      else if (auftrag.was === 'blatt') { location.hash = '#/blaetter'; setTimeout(() => { const b = blattAusText('', ''); oeffneSchreibraum(b.id); }, 200); }
      else if (auftrag.was === 'suche') setTimeout(() => oeffneSuche(), 200);
    }
  }
  if (vaniAdresseArt() === 'rettung') {
    setTimeout(() => toastMitAktion('Du bist im alten VANI unter der früheren Adresse.', 'Ins neue VANI umziehen', () => {
      location.hash = '#/feinheiten'; zeichne();
      setTimeout(() => umzugsHelfer(), 150);
    }, 20000), 900);
  }
  if (typeof profilStarteAutosperre === 'function') profilStarteAutosperre();

  /* Der Start wird nicht vom Netz blockiert: Erst ist alles lokal da, dann
     verbindet sich der private Bereich im Hintergrund. */
  setTimeout(() => syncBeimStart().catch(() => {}), 80);

  /* Speicher festhalten */
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

  /* Das Sicherheitsnetz: Absturzfang, Rettungskopie, Wochensicherung */
  try { if (typeof sicherheitStarten === 'function') sicherheitStarten(); } catch (e) {}

  /* Die Scrollleiste am Hauptbereich: lange Seiten in einem Zug */
  try {
    if (typeof scrollleiste === 'function') {
      const raum = $('#raum');
      if (raum) scrollleiste(raum, {
        ziel: $('#app'),
        marken: (b) => scrollMarkenAusUeberschriften(b, 'h1, h2, .kartenkopf, .abschnittstitel'),
        fahne: scrollFahneText(raum)
      });
    }
  } catch (e) {}

  /* Nichts verlieren, auch wenn iOS die App wegwirft */
  const notSicherung = () => { try { spueleAlles(); } catch (e) {} };
  window.addEventListener('pagehide', notSicherung);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') notSicherung(); });

  /* Tastatur-Höhe (iPad) */
  if (window.visualViewport) {
    const anpassen = () => {
      document.documentElement.style.setProperty('--vvh', window.visualViewport.height + 'px');
      /* Der Cursor bleibt im Blick, die Seite bleibt liegen — siehe 36-caret.js */
      if (typeof seiteFesthalten === 'function') seiteFesthalten();
    };
    window.visualViewport.addEventListener('resize', anpassen);
    anpassen();
    window.addEventListener('focusout', () => setTimeout(anpassen, 250));
  }

  /* Klang wieder aufnehmen? Erst nach der ersten Berührung erlaubt. */
  if (Object.values(D.einst.mischung || {}).some((v) => v > 0)) {
    const einmal = () => {
      audioFreigeben().then((ok) => { if (ok) mischungAnwenden(D.einst.mischung); }).catch(() => {});
    };
    document.addEventListener('pointerdown', einmal, { once: true });
  }

  /* Papierkorb: sehr Altes still wegräumen */
  setTimeout(() => { papierkorbLeeren(30).catch(() => {}); }, 4000);

  /* Service Worker — nur wo es ihn gibt */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !location.search.includes('kein-sw')) {
    try {
      let updateGemeldet = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (updateGemeldet) return;
        updateGemeldet = true;
        toastMitAktion('Die neue Fassung ist da.', 'Jetzt öffnen', () => location.reload(), 12000);
      });
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
        _swReg = reg;
        reg.addEventListener('updatefound', () => {
          const neu = reg.installing;
          if (!neu) return;
          neu.addEventListener('statechange', () => {
            if (neu.state === 'installed' && navigator.serviceWorker.controller) {
              toastMitAktion('Eine neue Fassung liegt bereit.', 'Neu laden', () => location.reload(), 8000);
            }
          });
        });
        if (reg.waiting) toastMitAktion('Eine neue Fassung liegt bereit.', 'Neu laden', () => location.reload(), 8000);
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
