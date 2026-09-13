'use strict';

/* ===================== Welche Berechtigungen die Desktop-App erteilt =====================
   Grundsatz: nein. VANI braucht weder Kamera noch Standort noch
   Benachrichtigungen, und eine Seite, die nichts darf, kann auch nichts
   anstellen.

   Bis 5.59.0 hieß das wirklich ausnahmslos nein. Zwei Dinge gingen dadurch in
   der Desktop-App still kaputt, obwohl dieselben Knöpfe im Browser
   funktionierten — beide in der gepackten App nachgeprüft:

   · Das Mikrofon. Die Tonaufnahme im Heft (43d) meldete nur „Kein Zugriff
     aufs Mikrofon“.
   · Die Zwischenablage, lesend wie schreibend. „Weiteres Gerät koppeln“
     kopiert den Kopplungscode dorthin, die Sicherung ohne Datei ebenso, und
     „Aus der Zwischenablage einlesen“ liest von dort — alles verweigert.

   Jetzt gibt es genau diese Ausnahmen, und nur für VANI selbst (vani://app),
   nie für eine andere Adresse. Beim Mikrofon nur Ton: eine Anfrage, die
   zugleich die Kamera will, bleibt ganz abgelehnt.

   Das Diktat hilft die Freigabe übrigens nicht — siehe 45c-diktat.js.

   Pur, damit es sich ohne Electron prüfen lässt. */

const ZWISCHENABLAGE = new Set(['clipboard-read', 'clipboard-sanitized-write']);

function istVani(adresse) {
  try {
    const u = new URL(String(adresse || ''));
    return u.protocol === 'vani:' && u.hostname === 'app';
  } catch (_) { return false; }
}

/* Eine Anfrage, etwa getUserMedia. medienarten: ['audio'], ['video'] oder beides. */
function darfAnfrage(permission, adresse, medienarten) {
  if (!istVani(adresse)) return false;
  if (ZWISCHENABLAGE.has(permission)) return true;
  if (permission !== 'media') return false;
  const arten = Array.isArray(medienarten) ? medienarten : [];
  return arten.length > 0 && arten.every((a) => a === 'audio');
}

/* Eine stille Prüfung, etwa navigator.permissions.query. medienart: 'audio' | 'video' | 'unknown'. */
function darfPruefung(permission, adresse, medienart) {
  if (!istVani(adresse)) return false;
  if (ZWISCHENABLAGE.has(permission)) return true;
  return permission === 'media' && medienart === 'audio';
}

module.exports = { istVani, darfAnfrage, darfPruefung, ZWISCHENABLAGE };
