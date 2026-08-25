/* ================================================================
   VANI — Tonnotiz: eine Stimme auf der Heftseite.

   Manches sagt man schneller, als man es tippt: wie der Satz klingen soll,
   eine Idee im Halbschlaf, der Tonfall einer Figur. Die Tonnotiz nimmt auf
   (Mikrofon des Geräts), liegt dann als kleine Kassette auf der Seite —
   antippen spielt ab, noch einmal hält an — und reist wie ein Foto über
   Sicherung und Sync, weil die Aufnahme im Medienvorrat liegt.
   ================================================================ */

function tonUnterstuetzt() {
  return typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof MediaRecorder !== 'undefined';
}
function tonFormat(sek) {
  const s = Math.max(0, Math.round(Number(sek) || 0));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
/* Welches Format das Gerät hergibt: Safari mp4, die anderen webm/opus. */
function tonMime() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  for (const m of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']) if (MediaRecorder.isTypeSupported(m)) return m;
  return '';
}

const TON_MAX_SEKUNDEN = 300;

/* Aufnehmen: ein Dialog mit einem Knopf, einem Pegel und einer Uhr. */
function tonAufnehmen() {
  return new Promise((res) => {
    if (!tonUnterstuetzt()) { toast('Dieses Gerät gibt das Mikrofon hier nicht frei.', 3600); return res(null); }
    let strom = null, rekorder = null, stuecke = [], laeuft = false, fertig = false, t0 = 0, uhrTimer = null;
    let audioCtx = null, analyser = null, pegelRaf = 0, blob = null, dauer = 0, probe = null, probeURL = '';
    const uhr = el('div', { class: 'ton-uhr' }, '0:00');
    const pegel = el('div', { class: 'ton-pegel' }, el('i'));
    const hinweis = el('div', { class: 'stickerblock-hinweis' }, 'Antippen startet die Aufnahme, noch einmal hält an. Bis zu fünf Minuten.');
    const knopf = el('button', { class: 'ton-knopf', title: 'Aufnehmen' }, el('span', { class: 'ton-punkt' }));
    const aufkleben = el('button', { class: 'knopf voll', disabled: 'disabled', onclick: async () => {
      if (!blob) return;
      fertig = true; aufraeumen(); zu();
      try { const id = await speichereDateiBlob(new File([blob], 'tonnotiz', { type: blob.type || 'audio/webm' })); res({ datei: id, dauer, mime: blob.type || '' }); }
      catch (e) { toast('Die Aufnahme ließ sich nicht ablegen.'); res(null); }
    } }, 'Aufkleben');
    const probeStoppen = () => {
      if (probe) { try { probe.pause(); probe.removeAttribute('src'); probe.load(); } catch (e) {} }
      if (probeURL) { try { URL.revokeObjectURL(probeURL); } catch (e) {} }
      probe = null; probeURL = ''; anhoeren.textContent = 'Anhören';
    };
    const anhoeren = el('button', { class: 'knopf', disabled: 'disabled', onclick: () => {
      if (!blob) return;
      if (probe) { probeStoppen(); return; }
      probeURL = URL.createObjectURL(blob); probe = new Audio(probeURL);
      probe.onended = probeStoppen; probe.onerror = probeStoppen;
      probe.play().catch(probeStoppen); anhoeren.textContent = 'Anhalten';
    } }, 'Anhören');

    const pegelZeichnen = () => {
      if (!analyser) return;
      const d = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(d);
      let sum = 0; for (const v of d) { const x = (v - 128) / 128; sum += x * x; }
      const eff = Math.sqrt(sum / d.length);
      pegel.firstChild.style.width = Math.min(100, Math.round(eff * 260)) + '%';
      pegelRaf = requestAnimationFrame(pegelZeichnen);
    };
    const aufraeumen = () => {
      cancelAnimationFrame(pegelRaf); clearInterval(uhrTimer);
      try { if (rekorder && rekorder.state !== 'inactive') rekorder.stop(); } catch (e) {}
      try { if (strom) strom.getTracks().forEach((t) => t.stop()); } catch (e) {}
      try { if (audioCtx) audioCtx.close(); } catch (e) {}
      probeStoppen();
    };
    const starte = async () => {
      try { strom = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { toast('Kein Zugriff aufs Mikrofon. In den Geräteeinstellungen erlauben.', 4200); return; }
      if (fertig) { try { strom.getTracks().forEach((t) => t.stop()); } catch (e) {} strom = null; return; }
      probeStoppen(); stuecke = []; blob = null; aufkleben.disabled = true; anhoeren.disabled = true;
      const mime = tonMime();
      try { rekorder = mime ? new MediaRecorder(strom, { mimeType: mime }) : new MediaRecorder(strom); }
      catch (e) { rekorder = new MediaRecorder(strom); }
      rekorder.ondataavailable = (e) => { if (e.data && e.data.size) stuecke.push(e.data); };
      rekorder.onstop = () => {
        blob = new Blob(stuecke, { type: rekorder.mimeType || mime || 'audio/webm' });
        dauer = Math.round((Date.now() - t0) / 1000);
        laeuft = false; knopf.classList.remove('an'); hinweis.textContent = tonFormat(dauer) + ' aufgenommen. Anhören — oder gleich aufkleben.';
        aufkleben.disabled = false; anhoeren.disabled = false;
        try { strom.getTracks().forEach((t) => t.stop()); } catch (e) {}
        cancelAnimationFrame(pegelRaf);
      };
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser(); analyser.fftSize = 512;
        audioCtx.createMediaStreamSource(strom).connect(analyser);
        pegelZeichnen();
      } catch (e) {}
      rekorder.start(250);
      t0 = Date.now(); laeuft = true; knopf.classList.add('an'); hinweis.textContent = 'Aufnahme läuft …';
      uhrTimer = setInterval(() => {
        const s = (Date.now() - t0) / 1000; uhr.textContent = tonFormat(s);
        if (s >= TON_MAX_SEKUNDEN) stoppe();
      }, 250);
    };
    const stoppe = () => { clearInterval(uhrTimer); try { rekorder.stop(); } catch (e) {} };
    knopf.addEventListener('click', () => { if (laeuft) stoppe(); else starte(); });

    const kasten = el('div', { class: 'modal tonnotiz' },
      el('h2', {}, 'Eine Tonnotiz'),
      hinweis,
      el('div', { class: 'ton-buehne' }, knopf, el('div', { class: 'ton-rechts' }, uhr, pegel)),
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'), anhoeren, aufkleben));
    const zu = zeigeDeck(kasten, () => { if (!fertig) { fertig = true; aufraeumen(); res(null); } });
  });
}

/* Die Kassette auf der Seite. */
function baueTon(a, blatt, neuBauen) {
  const halter = el('div', { class: 'anlage ton-anlage befestigung-' + (a.befestigung || 'tesa') });
  positioniere(halter, a);
  let audio = null;
  const spiel = el('button', { class: 'ton-spiel', html: ik('vorlesen'), title: 'Abspielen' });
  const name = el('div', { class: 'ton-name' }, a.label || 'Tonnotiz');
  const zeit = el('div', { class: 'ton-zeit' }, tonFormat(a.dauer));
  const spielBeenden = () => {
    if (audio) medienURLAktiv(audio.src, false);
    halter.classList.remove('spielt'); zeit.textContent = tonFormat(a.dauer);
  };
  spiel.addEventListener('pointerdown', (e) => e.stopPropagation());
  spiel.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (audio && !audio.paused) { audio.pause(); audio.currentTime = 0; spielBeenden(); return; }
    const url = await bildURL(a.datei);
    if (!url) { toast('Die Aufnahme ist nicht da.'); return; }
    audio = new Audio(url);
    audio.ontimeupdate = () => { zeit.textContent = tonFormat(audio.currentTime) + ' / ' + tonFormat(a.dauer); };
    audio.onended = spielBeenden; audio.onerror = spielBeenden;
    medienURLAktiv(url, true);
    try { await audio.play(); halter.classList.add('spielt'); } catch (x) { spielBeenden(); toast('Abspielen ging gerade nicht.'); }
  });
  halter.append(el('div', { class: 'ton-kassette' }, spiel, el('div', { class: 'ton-text' }, name, zeit)));
  anlageGesten(halter, a, blatt, neuBauen);
  return halter;
}
