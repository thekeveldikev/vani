/* ================================================================
   VANI — Bilder: aufnehmen, verkleinern, zeigen
   ================================================================ */

function waehleBild() {
  return new Promise((res) => {
    const inp = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    document.body.append(inp);
    let fertig = false;
    inp.addEventListener('change', async () => {
      fertig = true;
      const datei = inp.files && inp.files[0];
      inp.remove();
      if (!datei) return res(null);
      try { res(await verkleinereUndSpeichere(datei)); }
      catch (e) { toast('Das Bild wollte nicht.'); res(null); }
    });
    inp.addEventListener('cancel', () => { if (!fertig) { inp.remove(); res(null); } });
    inp.click();
  });
}

function verkleinereUndSpeichere(datei, maxKante = 1600) {
  return new Promise((res, rej) => {
    const leser = new FileReader();
    leser.onerror = rej;
    leser.onload = () => {
      const bild = new Image();
      bild.onerror = rej;
      bild.onload = () => {
        let { width: b, height: h } = bild;
        const f = Math.min(1, maxKante / Math.max(b, h));
        b = Math.round(b * f); h = Math.round(h * f);
        const c = document.createElement('canvas');
        c.width = b; c.height = h;
        c.getContext('2d').drawImage(bild, 0, 0, b, h);
        c.toBlob(async (blob) => {
          if (!blob) return rej(new Error('kein Blob'));
          const id = uid();
          await dbPut('media', blob, id);
          if (typeof syncMediaGeaendert === 'function') syncMediaGeaendert(id);
          res({ id, breite: b, hoehe: h });
        }, 'image/jpeg', .82);
      };
      bild.src = leser.result;
    };
    leser.readAsDataURL(datei);
  });
}

const _bildURLs = new Map();
async function bildURL(id) {
  if (_bildURLs.has(id)) return _bildURLs.get(id);
  const blob = await dbGet('media', id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  _bildURLs.set(id, url);
  return url;
}
function setzeBild(img, id) {
  bildURL(id).then((u) => { if (u) img.src = u; });
}
function loeseMedienURL(id) {
  const url = _bildURLs.get(id);
  if (url) URL.revokeObjectURL(url);
  _bildURLs.delete(id);
}
async function speichereDateiBlob(datei) {
  if (!datei || typeof datei.size !== 'number') throw new Error('Keine Datei');
  const id = uid();
  await dbPut('media', datei, id);
  if (typeof syncMediaGeaendert === 'function') syncMediaGeaendert(id);
  return id;
}
async function speichereKritzelei(canvas, alteId) {
  return new Promise((res) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return res(null);
      const id = alteId || uid();
      await dbPut('media', blob, id);
      if (typeof syncMediaGeaendert === 'function') syncMediaGeaendert(id);
      loeseMedienURL(id);
      res(id);
    }, 'image/png');
  });
}

window.addEventListener('pagehide', () => {
  for (const id of [..._bildURLs.keys()]) loeseMedienURL(id);
});
