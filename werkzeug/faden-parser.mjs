/* Liest einen WhatsApp-Export (.txt, deutsches Format) und macht
   daraus Nachrichten fürs VANI-Faden-Archiv. */

const KOPF = /^(\d{2})\.(\d{2})\.(\d{2}), (\d{2}):(\d{2}) - (.*)$/;

export function parseWhatsApp(text) {
  const nachrichten = [];
  let aktuelle = null;

  const abschliessen = () => {
    if (!aktuelle) return;
    let t = aktuelle.text
      .replace(/<Diese Nachricht wurde bearbeitet\.>/g, '')
      .replace(/[​‌‍‎‏﻿]/g, '')
      .trim();
    const istMedien =
      /^<Medien ausgeschlossen>$/.test(t) ||
      /^\S+\.(jpg|jpeg|png|webp|mp4|pdf|opus)\.?\s*\(Datei angehängt\)$/i.test(t) ||
      /^\S*\s*\(Datei angehängt\)$/.test(t);
    if (t && !istMedien && t !== 'null') {
      nachrichten.push({ wann: aktuelle.wann, text: t });
    }
    aktuelle = null;
  };

  for (const rohzeile of text.split(/\r?\n/)) {
    const zeile = rohzeile.replace(/[‎‏]/g, '');
    const m = zeile.match(KOPF);
    if (m) {
      abschliessen();
      const [, tag, monat, jahr, stunde, minute, rest] = m;
      const wann = new Date(2000 + parseInt(jahr, 10), parseInt(monat, 10) - 1,
        parseInt(tag, 10), parseInt(stunde, 10), parseInt(minute, 10)).getTime();
      const trenner = rest.indexOf(': ');
      if (trenner === -1) continue; /* Systemzeile ohne Absender */
      aktuelle = { wann, text: rest.slice(trenner + 2) };
    } else if (aktuelle) {
      aktuelle.text += '\n' + zeile;
    }
  }
  abschliessen();
  return nachrichten;
}
