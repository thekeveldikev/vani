/* ===================== 54f — DIE JAHRESZEITEN AUF DEM TISCH =====================
   Auf der Fensterbank steht etwas, das es nur in diesem Monat gibt. Im April
   ein Kirschzweig im Glas, im Oktober ein Kürbis, im Dezember ein Tannenzweig
   mit einer Kerze. Dazu ein paar Kleinigkeiten auf dem Holz — ein Blütenblatt,
   eine Kastanie, ein Zimtstück.

   Zwölf Monate, nicht vier Jahreszeiten: der Unterschied zwischen April und
   Juni ist größer als der zwischen „Frühling" und „Frühling".

   Gezeichnet wird als SVG. Das bleibt scharf, wiegt fast nichts und lässt
   sich einfärben, ohne dass ein Bild nachgeladen werden muss — VANI liegt
   in einer einzigen Datei, und die soll das auch bleiben.

   Alles hier ist Zierrat: nichts davon tut etwas, nichts davon speichert
   etwas. Wer es nicht mag, schaltet es in „Schreibtisch einrichten" aus. */

/* Ein kleiner Helfer, damit die Zeichnungen lesbar bleiben. */
function _jzSvg(breite, hoehe, inhalt) {
  return '<svg viewBox="0 0 ' + breite + ' ' + hoehe + '" width="100%" height="100%" fill="none" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inhalt + '</svg>';
}
/* Ein Glas, in dem etwas steht — kommt in vielen Monaten vor. */
function _jzGlas(x, y, b, h, ton) {
  return '<path d="M' + x + ' ' + y + 'h' + b + 'l-2 ' + (h - 3) + 'a3 3 0 0 1-3 3h-' + (b - 10) + 'a3 3 0 0 1-3-3z" ' +
    'fill="' + (ton || 'rgba(190,215,225,.30)') + '" stroke="rgba(225,240,245,.55)" stroke-width="1.1"/>' +
    '<path d="M' + (x + 3) + ' ' + (y + h * .45) + 'h' + (b - 6) + '" stroke="rgba(150,185,205,.45)" stroke-width="' + (h * .5) + '" opacity=".5"/>' +
    '<path d="M' + (x + 2.5) + ' ' + (y + 3) + 'l-1 ' + (h - 8) + '" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>';
}

/* ----- Die zwölf Monate ----- */
/* stueck  — was auf der Fensterbank steht (64 × 86)
   lose    — Kleinigkeiten, die auf dem Holz liegen (je 26 × 26)
   satz    — was VANI dazu sagt, wenn man es antippt */
const JAHRESZEIT_DEKO = {
  1: {
    name: 'Januar', was: 'Ein Zweig mit Raureif',
    satz: 'Januar. Der Zweig ist kahl und hat trotzdem etwas vor.',
    stueck: _jzSvg(64, 86,
      _jzGlas(20, 44, 24, 40, 'rgba(200,220,235,.26)') +
      '<path d="M32 46V16M32 30l-9-9M32 24l8-8M32 38l-7-6M32 34l7-7" stroke="#6b5a4a" stroke-width="1.8"/>' +
      '<g fill="#dfeaf2" opacity=".85"><circle cx="23" cy="21" r="1.6"/><circle cx="40" cy="16" r="1.4"/><circle cx="25" cy="32" r="1.3"/><circle cx="39" cy="27" r="1.5"/><circle cx="32" cy="17" r="1.7"/></g>' +
      '<path d="M23 21l-3-3M40 16l3-2M25 32l-3-1" stroke="#eef6fa" stroke-width="1" opacity=".7"/>'),
    lose: [
      _jzSvg(26, 26, '<path d="M13 4c3 4 4 8 4 11 0 4-2 7-4 7s-4-3-4-7c0-3 1-7 4-11z" fill="#6a5240" stroke="#4a3a2c" stroke-width="1"/><path d="M13 8v12" stroke="#4a3a2c" stroke-width=".8"/>'),
      _jzSvg(26, 26, '<g stroke="#dfeaf2" stroke-width="1.3" opacity=".8"><path d="M13 5v16M6 13h14M8 8l10 10M18 8L8 18"/></g>')
    ]
  },
  2: {
    name: 'Februar', was: 'Schneeglöckchen',
    satz: 'Februar. Drei Schneeglöckchen — der erste, der es wagt.',
    stueck: _jzSvg(64, 86,
      _jzGlas(22, 50, 20, 34, 'rgba(205,225,215,.26)') +
      '<path d="M28 52V30M32 52V24M37 52V32" stroke="#5f7f52" stroke-width="1.6"/>' +
      '<path d="M28 30c-4 0-5 3-5 5M32 24c-4 0-5 3-5 5M37 32c-4 0-5 3-5 5" stroke="#5f7f52" stroke-width="1.3"/>' +
      '<g fill="#f4f8f2" stroke="#d8e4d4" stroke-width=".8">' +
      '<path d="M23 35c0-3 2-4 3.5-4s3.5 1 3.5 4-2 6-3.5 6-3.5-3-3.5-6z"/>' +
      '<path d="M27 29c0-3 2-4 3.5-4s3.5 1 3.5 4-2 6-3.5 6-3.5-3-3.5-6z"/>' +
      '<path d="M32 37c0-3 2-4 3.5-4s3.5 1 3.5 4-2 6-3.5 6-3.5-3-3.5-6z"/></g>' +
      '<path d="M22 78h20" stroke="rgba(255,255,255,.2)" stroke-width="1"/>'),
    lose: [
      _jzSvg(26, 26, '<path d="M13 20V10" stroke="#5f7f52" stroke-width="1.4"/><path d="M9 12c0-3 2-4 4-4s4 1 4 4-2 6-4 6-4-3-4-6z" fill="#f4f8f2" stroke="#d8e4d4" stroke-width=".8"/>')
    ]
  },
  3: {
    name: 'März', was: 'Weidenkätzchen',
    satz: 'März. Weidenkätzchen — pelzig, ungeduldig, viel zu früh.',
    stueck: _jzSvg(64, 86,
      _jzGlas(23, 52, 18, 32, 'rgba(200,215,225,.24)') +
      '<path d="M30 54C28 40 24 30 20 22M34 54c2-14 6-24 11-32M32 54V26" stroke="#7a5a3a" stroke-width="1.5"/>' +
      '<g fill="#e6dcc4" stroke="#cbbfa2" stroke-width=".7">' +
      '<ellipse cx="20" cy="21" rx="3" ry="4.2" transform="rotate(-24 20 21)"/>' +
      '<ellipse cx="24" cy="31" rx="2.6" ry="3.6" transform="rotate(-18 24 31)"/>' +
      '<ellipse cx="45" cy="21" rx="3" ry="4.2" transform="rotate(24 45 21)"/>' +
      '<ellipse cx="41" cy="32" rx="2.6" ry="3.6" transform="rotate(18 41 32)"/>' +
      '<ellipse cx="32" cy="25" rx="3.2" ry="4.4"/></g>'),
    lose: [
      _jzSvg(26, 26, '<ellipse cx="13" cy="12" rx="4" ry="5.5" fill="#e6dcc4" stroke="#cbbfa2" stroke-width=".8"/><path d="M13 17v6" stroke="#7a5a3a" stroke-width="1.3"/>')
    ]
  },
  4: {
    name: 'April', was: 'Ein Kirschzweig',
    satz: 'April. Kirschblüten — sie halten sich nicht lange, deshalb zählen sie.',
    stueck: _jzSvg(64, 86,
      _jzGlas(24, 54, 16, 30, 'rgba(205,220,230,.26)') +
      '<path d="M32 56V30M32 40l-9-7M32 34l9-8M32 46l-7-4" stroke="#6a4a3a" stroke-width="1.7"/>' +
      '<g fill="#f7dbe4" stroke="#e8bccb" stroke-width=".7">' +
      '<g transform="translate(21,31)"><circle cx="0" cy="-3.4" r="2.7"/><circle cx="3.2" cy="-1" r="2.7"/><circle cx="2" cy="2.8" r="2.7"/><circle cx="-2" cy="2.8" r="2.7"/><circle cx="-3.2" cy="-1" r="2.7"/><circle cx="0" cy="0" r="1.5" fill="#f6c9a0" stroke="none"/></g>' +
      '<g transform="translate(42,25)"><circle cx="0" cy="-3" r="2.4"/><circle cx="2.9" cy="-.9" r="2.4"/><circle cx="1.8" cy="2.5" r="2.4"/><circle cx="-1.8" cy="2.5" r="2.4"/><circle cx="-2.9" cy="-.9" r="2.4"/><circle cx="0" cy="0" r="1.3" fill="#f6c9a0" stroke="none"/></g>' +
      '<g transform="translate(32,29)"><circle cx="0" cy="-2.6" r="2.1"/><circle cx="2.5" cy="-.8" r="2.1"/><circle cx="1.5" cy="2.1" r="2.1"/><circle cx="-1.5" cy="2.1" r="2.1"/><circle cx="-2.5" cy="-.8" r="2.1"/><circle cx="0" cy="0" r="1.1" fill="#f6c9a0" stroke="none"/></g>' +
      '<g transform="translate(25,42)"><circle cx="0" cy="-2.3" r="1.9"/><circle cx="2.2" cy="-.7" r="1.9"/><circle cx="1.4" cy="1.9" r="1.9"/><circle cx="-1.4" cy="1.9" r="1.9"/><circle cx="-2.2" cy="-.7" r="1.9"/></g></g>'),
    lose: [
      _jzSvg(26, 26, '<g fill="#f7dbe4" stroke="#e8bccb" stroke-width=".7" transform="translate(13,13)"><circle cx="0" cy="-3.4" r="2.7"/><circle cx="3.2" cy="-1" r="2.7"/><circle cx="2" cy="2.8" r="2.7"/><circle cx="-2" cy="2.8" r="2.7"/><circle cx="-3.2" cy="-1" r="2.7"/><circle cx="0" cy="0" r="1.4" fill="#f6c9a0" stroke="none"/></g>'),
      _jzSvg(26, 26, '<path d="M6 16c3-6 9-8 14-7-2 5-8 8-14 7z" fill="#f7dbe4" stroke="#e8bccb" stroke-width=".8"/>')
    ]
  },
  5: {
    name: 'Mai', was: 'Flieder',
    satz: 'Mai. Flieder. Man riecht ihn, bevor man ihn sieht.',
    stueck: _jzSvg(64, 86,
      _jzGlas(23, 54, 18, 30, 'rgba(200,215,230,.26)') +
      '<path d="M30 56V34M35 56V32" stroke="#5a7a4a" stroke-width="1.6"/>' +
      '<path d="M27 44c-4 1-6 3-7 5M38 42c4 1 6 3 7 5" stroke="#5a7a4a" stroke-width="1.3"/>' +
      '<path d="M20 49c3-2 5-4 6-7M45 47c-3-2-5-4-6-7" stroke="#5a7a4a" stroke-width="1"/>' +
      '<g fill="#c9b3dd" opacity=".92">' +
      '<circle cx="30" cy="18" r="3"/><circle cx="26" cy="23" r="3.2"/><circle cx="34" cy="22" r="3"/><circle cx="30" cy="27" r="3.4"/>' +
      '<circle cx="24" cy="30" r="2.8"/><circle cx="36" cy="29" r="2.8"/><circle cx="30" cy="34" r="3"/><circle cx="27" cy="38" r="2.4"/><circle cx="34" cy="37" r="2.4"/></g>' +
      '<g fill="#e0d2ee" opacity=".8"><circle cx="28" cy="21" r="1.1"/><circle cx="32" cy="26" r="1.1"/><circle cx="29" cy="32" r="1"/></g>'),
    lose: [
      _jzSvg(26, 26, '<g fill="#c9b3dd"><circle cx="11" cy="10" r="2.6"/><circle cx="15" cy="13" r="2.4"/><circle cx="11" cy="15" r="2.2"/></g><path d="M13 17v6" stroke="#5a7a4a" stroke-width="1.2"/>')
    ]
  },
  6: {
    name: 'Juni', was: 'Wilde Rosen',
    satz: 'Juni. Heckenrosen — fünf Blätter, kein Aufhebens.',
    stueck: _jzSvg(64, 86,
      _jzGlas(24, 56, 16, 28, 'rgba(205,220,225,.24)') +
      '<path d="M32 58V32M32 44l-8-5M32 38l8-6" stroke="#5a7442" stroke-width="1.6"/>' +
      '<g fill="#f4d3d8" stroke="#e2b3bd" stroke-width=".7">' +
      '<g transform="translate(24,36)"><ellipse cx="0" cy="-4" rx="3.2" ry="3.8"/><ellipse cx="3.8" cy="-1.2" rx="3.2" ry="3.8" transform="rotate(72 3.8 -1.2)"/><ellipse cx="2.4" cy="3.3" rx="3.2" ry="3.8" transform="rotate(144 2.4 3.3)"/><ellipse cx="-2.4" cy="3.3" rx="3.2" ry="3.8" transform="rotate(216 -2.4 3.3)"/><ellipse cx="-3.8" cy="-1.2" rx="3.2" ry="3.8" transform="rotate(288 -3.8 -1.2)"/><circle cx="0" cy="0" r="1.8" fill="#e8c46a" stroke="none"/></g>' +
      '<g transform="translate(41,29)"><ellipse cx="0" cy="-3.4" rx="2.7" ry="3.2"/><ellipse cx="3.2" cy="-1" rx="2.7" ry="3.2" transform="rotate(72 3.2 -1)"/><ellipse cx="2" cy="2.8" rx="2.7" ry="3.2" transform="rotate(144 2 2.8)"/><ellipse cx="-2" cy="2.8" rx="2.7" ry="3.2" transform="rotate(216 -2 2.8)"/><ellipse cx="-3.2" cy="-1" rx="2.7" ry="3.2" transform="rotate(288 -3.2 -1)"/><circle cx="0" cy="0" r="1.5" fill="#e8c46a" stroke="none"/></g></g>' +
      '<path d="M32 32c-3-2-4-5-3-8" stroke="#5a7442" stroke-width="1.2"/>' +
      '<path d="M27 46c-3 0-5-2-5-4 3-1 5 1 5 4z" fill="#5a7442" opacity=".85"/>'),
    lose: [
      _jzSvg(26, 26, '<g fill="#f4d3d8" stroke="#e2b3bd" stroke-width=".6" transform="translate(13,13)"><ellipse cx="0" cy="-4" rx="3.2" ry="3.8"/><ellipse cx="3.8" cy="-1.2" rx="3.2" ry="3.8" transform="rotate(72 3.8 -1.2)"/><ellipse cx="2.4" cy="3.3" rx="3.2" ry="3.8" transform="rotate(144 2.4 3.3)"/><ellipse cx="-2.4" cy="3.3" rx="3.2" ry="3.8" transform="rotate(216 -2.4 3.3)"/><ellipse cx="-3.8" cy="-1.2" rx="3.2" ry="3.8" transform="rotate(288 -3.8 -1.2)"/><circle cx="0" cy="0" r="1.8" fill="#e8c46a" stroke="none"/></g>'),
      _jzSvg(26, 26, '<path d="M6 18c4-8 10-11 15-11-1 7-7 12-15 11z" fill="#5a7442" opacity=".8" stroke="#465c34" stroke-width=".7"/><path d="M6 18c4-4 8-7 15-11" stroke="#465c34" stroke-width=".7"/>')
    ]
  },
  7: {
    name: 'Juli', was: 'Ein Bund Lavendel',
    satz: 'Juli. Lavendel, mit einer Schnur gebunden. Er trocknet und bleibt.',
    stueck: _jzSvg(64, 86,
      '<path d="M26 84c1-14 3-26 4-34M32 84V46M38 84c-1-14-3-26-4-34" stroke="#6a7a54" stroke-width="1.5"/>' +
      '<path d="M22 82c2-12 4-22 5-28M42 82c-2-12-4-22-5-28" stroke="#6a7a54" stroke-width="1.3"/>' +
      '<g fill="#9d8ac2">' +
      '<g><ellipse cx="30" cy="46" rx="2.4" ry="3"/><ellipse cx="30" cy="40" rx="2.2" ry="2.8"/><ellipse cx="30" cy="35" rx="1.9" ry="2.5"/><ellipse cx="30" cy="30" rx="1.5" ry="2.1"/></g>' +
      '<g><ellipse cx="32" cy="44" rx="2.4" ry="3"/><ellipse cx="32" cy="38" rx="2.2" ry="2.8"/><ellipse cx="32" cy="32" rx="1.9" ry="2.5"/><ellipse cx="32" cy="27" rx="1.5" ry="2.1"/></g>' +
      '<g><ellipse cx="34" cy="47" rx="2.4" ry="3"/><ellipse cx="34" cy="41" rx="2.2" ry="2.8"/><ellipse cx="34" cy="36" rx="1.9" ry="2.5"/><ellipse cx="34" cy="31" rx="1.5" ry="2.1"/></g>' +
      '<g opacity=".85"><ellipse cx="27" cy="52" rx="2.1" ry="2.7"/><ellipse cx="27" cy="47" rx="1.8" ry="2.3"/><ellipse cx="37" cy="52" rx="2.1" ry="2.7"/><ellipse cx="37" cy="47" rx="1.8" ry="2.3"/></g></g>' +
      '<path d="M24 66h16" stroke="#c9b48c" stroke-width="2.4"/>' +
      '<path d="M24 66h16" stroke="#8a7654" stroke-width=".8"/>' +
      '<path d="M40 66l4 4M40 66l3 5" stroke="#c9b48c" stroke-width="1.2"/>'),
    lose: [
      _jzSvg(26, 26, '<g fill="#9d8ac2"><ellipse cx="13" cy="10" rx="2" ry="2.6"/><ellipse cx="13" cy="6" rx="1.6" ry="2.2"/></g><path d="M13 13v9" stroke="#6a7a54" stroke-width="1.2"/>')
    ]
  },
  8: {
    name: 'August', was: 'Ähren und eine Muschel',
    satz: 'August. Ähren aus dem Feld nebenan, staubig und warm.',
    stueck: _jzSvg(64, 86,
      _jzGlas(24, 58, 16, 26, 'rgba(215,210,190,.22)') +
      '<path d="M28 60C27 46 27 36 28 26M34 60c1-14 1-24 0-34M32 60V32" stroke="#b9a06a" stroke-width="1.4"/>' +
      '<g fill="#d9c088" stroke="#b9a06a" stroke-width=".6">' +
      '<g transform="translate(28,26)"><ellipse cx="-2.4" cy="0" rx="1.5" ry="3" transform="rotate(-25 -2.4 0)"/><ellipse cx="2.4" cy="0" rx="1.5" ry="3" transform="rotate(25 2.4 0)"/><ellipse cx="-2.4" cy="6" rx="1.5" ry="3" transform="rotate(-25 -2.4 6)"/><ellipse cx="2.4" cy="6" rx="1.5" ry="3" transform="rotate(25 2.4 6)"/><ellipse cx="-2.4" cy="12" rx="1.5" ry="3" transform="rotate(-25 -2.4 12)"/><ellipse cx="2.4" cy="12" rx="1.5" ry="3" transform="rotate(25 2.4 12)"/><ellipse cx="0" cy="-4" rx="1.3" ry="3.4"/></g>' +
      '<g transform="translate(34,26)"><ellipse cx="-2.2" cy="2" rx="1.4" ry="2.8" transform="rotate(-25 -2.2 2)"/><ellipse cx="2.2" cy="2" rx="1.4" ry="2.8" transform="rotate(25 2.2 2)"/><ellipse cx="-2.2" cy="8" rx="1.4" ry="2.8" transform="rotate(-25 -2.2 8)"/><ellipse cx="2.2" cy="8" rx="1.4" ry="2.8" transform="rotate(25 2.2 8)"/><ellipse cx="0" cy="-2" rx="1.2" ry="3.2"/></g></g>' +
      '<path d="M28 24l-2-6M34 24l2-6M32 30l0-8" stroke="#c9b083" stroke-width=".9"/>'),
    lose: [
      _jzSvg(26, 26, '<path d="M13 5c6 0 9 5 9 9 0 5-4 8-9 8s-9-3-9-8c0-4 3-9 9-9z" fill="#f0e2cc" stroke="#d3c1a4" stroke-width=".8"/><path d="M13 5v17M13 5l-6 12M13 5l6 12M13 5l-8 8M13 5l8 8" stroke="#d3c1a4" stroke-width=".7"/>'),
      _jzSvg(26, 26, '<g fill="#d9c088" stroke="#b9a06a" stroke-width=".6" transform="translate(13,11)"><ellipse cx="-2.2" cy="0" rx="1.4" ry="2.8" transform="rotate(-25 -2.2 0)"/><ellipse cx="2.2" cy="0" rx="1.4" ry="2.8" transform="rotate(25 2.2 0)"/><ellipse cx="0" cy="-4" rx="1.2" ry="3.2"/></g><path d="M13 14v8" stroke="#b9a06a" stroke-width="1.2"/>')
    ]
  },
  9: {
    name: 'September', was: 'Ein Apfel und Brombeeren',
    satz: 'September. Ein Apfel vom Baum, mit einer Delle. Schmeckt trotzdem.',
    stueck: _jzSvg(64, 86,
      '<path d="M32 46c-9 0-15 7-15 17s6 21 15 21 15-11 15-21-6-17-15-17z" fill="#a8442f" stroke="#7e3122" stroke-width="1"/>' +
      '<path d="M32 50c-5 3-7 9-7 15" stroke="#c96a52" stroke-width="2" opacity=".55"/>' +
      '<path d="M32 46V36" stroke="#5a4028" stroke-width="1.8"/>' +
      '<path d="M32 40c5-4 10-4 12-2-1 4-7 6-12 2z" fill="#5f7a44" stroke="#465c34" stroke-width=".8"/>' +
      '<g fill="#3d2a4a" stroke="#2a1c34" stroke-width=".5">' +
      '<g transform="translate(15,66)"><circle cx="0" cy="0" r="2"/><circle cx="3.4" cy="1" r="2"/><circle cx="1.8" cy="3.8" r="2"/><circle cx="-1.8" cy="3.4" r="2"/><circle cx="-3" cy=".6" r="2"/><circle cx="0" cy="1.8" r="1.8"/></g>' +
      '<g transform="translate(50,72)"><circle cx="0" cy="0" r="1.8"/><circle cx="3" cy="1" r="1.8"/><circle cx="1.6" cy="3.4" r="1.8"/><circle cx="-1.6" cy="3" r="1.8"/><circle cx="-2.6" cy=".6" r="1.8"/></g></g>'),
    lose: [
      _jzSvg(26, 26, '<g fill="#3d2a4a" stroke="#2a1c34" stroke-width=".5" transform="translate(13,13)"><circle cx="0" cy="0" r="2.4"/><circle cx="4" cy="1.2" r="2.4"/><circle cx="2.2" cy="4.4" r="2.4"/><circle cx="-2.2" cy="4" r="2.4"/><circle cx="-3.6" cy=".8" r="2.4"/><circle cx="0" cy="2.2" r="2.2"/></g>'),
      _jzSvg(26, 26, '<path d="M6 16c4-7 10-10 15-9-1 7-8 11-15 9z" fill="#c07a2a" stroke="#96601f" stroke-width=".8"/><path d="M6 16c4-4 9-6 15-9" stroke="#96601f" stroke-width=".7"/>')
    ]
  },
  10: {
    name: 'Oktober', was: 'Ein Kürbis',
    satz: 'Oktober. Ein Kürbis, viel zu schwer für die Fensterbank.',
    stueck: _jzSvg(64, 86,
      '<g stroke="#8a4a14" stroke-width="1">' +
      '<ellipse cx="32" cy="62" rx="21" ry="18" fill="#c9701e"/>' +
      '<ellipse cx="32" cy="62" rx="13" ry="18" fill="#d8802a"/>' +
      '<ellipse cx="32" cy="62" rx="5" ry="18" fill="#e08c33"/></g>' +
      '<path d="M32 44v-6c0-3-2-4-4-4" stroke="#5f7a44" stroke-width="2.6"/>' +
      '<path d="M28 34c-4-1-6 1-8 4 3 3 7 2 8-4z" fill="#5f7a44" stroke="#465c34" stroke-width=".8"/>' +
      '<path d="M36 40c4-3 8-2 10 1-3 3-8 3-10-1z" fill="#6a8a4c" stroke="#465c34" stroke-width=".8"/>' +
      '<path d="M42 46c3-3 3-6 1-8" stroke="#5f7a44" stroke-width="1.2"/>'),
    lose: [
      _jzSvg(26, 26, '<path d="M13 4c4 4 8 5 9 9-1 5-5 9-9 9s-8-4-9-9c1-4 5-5 9-9z" fill="#b8532a" stroke="#8a3c1c" stroke-width=".8"/><path d="M13 22V8M13 14l-5-4M13 16l5-5" stroke="#8a3c1c" stroke-width=".8"/>'),
      _jzSvg(26, 26, '<path d="M13 4c5 5 9 7 9 11 0 4-4 7-9 7s-9-3-9-7c0-4 4-6 9-11z" fill="#c98a2a" stroke="#9a661c" stroke-width=".8"/><path d="M13 22V7" stroke="#9a661c" stroke-width=".8"/>'),
      _jzSvg(26, 26, '<path d="M8 6c3 5 3 10 0 15M14 5c4 6 4 11 0 16M19 8c3 4 3 8 0 12" stroke="#8a5a2a" stroke-width="1.4"/>')
    ]
  },
  11: {
    name: 'November', was: 'Moos, Pilze, eine Nuss',
    satz: 'November. Nebel draußen. Drinnen ist es dafür sehr genau richtig.',
    stueck: _jzSvg(64, 86,
      '<path d="M12 78c4-6 14-8 20-8s16 2 20 8z" fill="#4a5c38" opacity=".8"/>' +
      '<g fill="#6a7a48" opacity=".7"><circle cx="18" cy="74" r="2.4"/><circle cx="24" cy="76" r="2"/><circle cx="44" cy="75" r="2.2"/><circle cx="50" cy="77" r="1.8"/></g>' +
      '<path d="M28 72V58" stroke="#e6dcc6" stroke-width="4"/>' +
      '<path d="M20 58c0-6 4-10 8-10s8 4 8 10z" fill="#a3452e" stroke="#7c3220" stroke-width="1"/>' +
      '<g fill="#f0e6d2"><circle cx="25" cy="53" r="1.4"/><circle cx="31" cy="51" r="1.2"/><circle cx="28" cy="56" r="1"/></g>' +
      '<path d="M40 74v-8" stroke="#e6dcc6" stroke-width="3"/>' +
      '<path d="M34 66c0-4 3-7 6-7s6 3 6 7z" fill="#b8543a" stroke="#8c3a26" stroke-width=".9"/>' +
      '<g fill="#f0e6d2"><circle cx="38" cy="63" r="1.1"/><circle cx="43" cy="62" r="1"/></g>' +
      '<ellipse cx="52" cy="72" rx="5" ry="6" fill="#8a6a44" stroke="#63492c" stroke-width=".9"/>' +
      '<path d="M52 66v12M48 72h8" stroke="#63492c" stroke-width=".8"/>'),
    lose: [
      _jzSvg(26, 26, '<ellipse cx="13" cy="14" rx="6" ry="7" fill="#8a6a44" stroke="#63492c" stroke-width=".9"/><path d="M13 7v14M8 14h10" stroke="#63492c" stroke-width=".8"/>'),
      _jzSvg(26, 26, '<path d="M13 22v-9" stroke="#e6dcc6" stroke-width="3"/><path d="M6 13c0-5 3-8 7-8s7 3 7 8z" fill="#a3452e" stroke="#7c3220" stroke-width=".9"/><g fill="#f0e6d2"><circle cx="10" cy="9" r="1.2"/><circle cx="15" cy="8" r="1"/></g>')
    ]
  },
  12: {
    name: 'Dezember', was: 'Tannenzweig und Kerze',
    satz: 'Dezember. Ein Tannenzweig und eine Kerze. Mehr braucht ein Dezember nicht.',
    stueck: _jzSvg(64, 86,
      /* Der Zweig, quer über die Bank */
      '<path d="M6 66C18 62 34 60 52 60" stroke="#3f5a34" stroke-width="2"/>' +
      '<g stroke="#4d6b3e" stroke-width="1.5">' +
      '<path d="M11 65l-3-6M11 65l-4 5M17 64l-3-7M17 64l-4 6M23 62l-2-7M23 62l-4 6M29 61l-2-7M29 61l-3 7M35 61l-1-7M35 61l-3 7M41 60l-1-7M41 60l-2 7M47 60v-7M47 60l-1 7"/></g>' +
      '<g fill="#5c4832" stroke="#43331f" stroke-width=".7">' +
      '<ellipse cx="14" cy="72" rx="3.4" ry="5" transform="rotate(-16 14 72)"/>' +
      '<ellipse cx="22" cy="75" rx="2.8" ry="4.2" transform="rotate(10 22 75)"/></g>' +
      '<path d="M14 68v8M22 72v6" stroke="#43331f" stroke-width=".6"/>' +
      /* Die Kerze */
      '<rect x="38" y="40" width="13" height="30" rx="2" fill="#f0e4cc" stroke="#d5c4a4" stroke-width=".9"/>' +
      '<path d="M41 42v26M47 43v25" stroke="#e2d4b8" stroke-width="1"/>' +
      '<path d="M44.5 40v-4" stroke="#4a3a28" stroke-width="1.3"/>' +
      '<path d="M44.5 36c2.6-2.6 2.6-6.4 0-9-2.6 2.6-2.6 6.4 0 9z" fill="#f7c451"/>' +
      '<path d="M44.5 34.5c1.3-1.5 1.3-3.6 0-5.2-1.3 1.6-1.3 3.7 0 5.2z" fill="#fff0c0"/>' +
      '<circle cx="44.5" cy="31" r="9" fill="#f7c451" opacity=".16"/>' +
      /* Ein Strohstern */
      '<g stroke="#d3b271" stroke-width="1.5" opacity=".9" transform="translate(56,74)">' +
      '<path d="M0-6V6M-5.2-3l10.4 6M5.2-3L-5.2 3"/></g>'),
    lose: [
      _jzSvg(26, 26, '<ellipse cx="13" cy="13" rx="4.4" ry="6.4" transform="rotate(-14 13 13)" fill="#5c4832" stroke="#43331f" stroke-width=".8"/><path d="M13 7v12" stroke="#43331f" stroke-width=".7"/>'),
      _jzSvg(26, 26, '<g stroke="#d3b271" stroke-width="1.6" transform="translate(13,13)"><path d="M0-8V8M-7-4l14 8M7-4L-7 4"/></g>'),
      _jzSvg(26, 26, '<path d="M6 8c5-2 10-2 15 0-1 5-3 9-7 12-4-3-7-7-8-12z" fill="#8a5a2a" stroke="#6a4420" stroke-width=".8"/><path d="M9 9c4 3 6 7 6 11" stroke="#6a4420" stroke-width=".7"/>')
    ]
  }
};

/* ----- Was gerade dran ist ----- */
/* Der Monat, nicht die Jahreszeit: der Unterschied zwischen April und Juni
   ist groesser als der zwischen „Fruehling" und „Fruehling". Wer im
   Schreibtisch eine feste Jahreszeit gewaehlt hat, bekommt deren Mitte —
   sonst waere die Wahl ohne Wirkung. */
function jahreszeitMonat(e, wann = Date.now()) {
  const wahl = e && e.jahreszeit;
  if (wahl && wahl !== 'echt' && wahl !== 'zufall') {
    return { fruehling: 4, sommer: 7, herbst: 10, winter: 1 }[wahl] || (new Date(wann).getMonth() + 1);
  }
  return new Date(wann).getMonth() + 1;
}
function jahreszeitDeko(e, wann) {
  const m = jahreszeitMonat(e, wann);
  return JAHRESZEIT_DEKO[m] || JAHRESZEIT_DEKO[1];
}
/* Standardmaessig an — es ist Zierrat, das nichts kostet und nichts verstellt. */
function jahreszeitAn(e) { return !e || e.jahreszeitDeko !== false; }

/* ----- Auf den Tisch stellen ----- */
function jahreszeitenBauen(dinge, e) {
  if (!jahreszeitAn(e)) return;
  const deko = jahreszeitDeko(e);
  if (!deko) return;

  /* Das Stueck auf der Fensterbank */
  dinge.append(el('button', {
    class: 'desk-ding jahreszeit', title: deko.was + ' — ' + deko.name,
    'aria-label': deko.was + ', ' + deko.name,
    onclick: () => toast(deko.satz, 4600)
  }, el('span', { class: 'jz-bild', html: deko.stueck })));

  /* Und ein paar Kleinigkeiten, die auf dem Holz liegen. Sie liegen im Holz
     wie die geritzten Saetze: unter allem, und nie auf etwas drauf. Die
     Plaetze werden mit derselben Messerei gesucht wie dort. */
  const lose = deko.lose || [];
  if (!lose.length) return;
  const szene = dinge.closest ? dinge.closest('.desk-szene') : null;
  const gelegt = [];
  for (let i = 0; i < lose.length; i++) {
    const stueck = el('div', {
      class: 'desk-jzlose', 'aria-hidden': 'true',
      style: '--jx:.5;--jy:.5;--jd:' + ((i * 37) % 26 - 13) + 'deg'
    }, el('span', { class: 'jz-bild', html: lose[i] }));
    dinge.append(stueck);
    gelegt.push(stueck);
  }
  /* Ein Zeitgeber, keine Bildfolge: der steht still, wenn das Fenster
     verdeckt ist — dann laegen die Kleinigkeiten fuer immer aufeinander. */
  setTimeout(() => {
    const flaeche = szene || dinge.parentElement;
    if (!flaeche || !flaeche.isConnected || typeof tischzitatKandidaten !== 'function') return;
    for (const stueck of gelegt) {
      if (!stueck.isConnected) continue;
      const h = tischzitatHindernisse(flaeche, stueck);
      const g = tischzitatGroesse(stueck, flaeche);
      const frei = tischzitatKandidaten(h, g, []);
      for (const k of frei.slice(0, 14)) {
        stueck.style.setProperty('--jx', k.x.toFixed(3));
        stueck.style.setProperty('--jy', k.y.toFixed(3));
        if (!tischzitatStoert(stueck, flaeche)) break;
      }
    }
  }, 24);
}

/* ----- Der Abschnitt in „Schreibtisch einrichten" ----- */
function jahreszeitEinstellung(e, danach) {
  const kasten = el('div', { class: 'einstellgruppe' });
  const zeichne = () => {
    kasten.innerHTML = '';
    const an = jahreszeitAn(e);
    const deko = jahreszeitDeko(e);
    const schalter = el('button', { class: 'schalter' + (an ? ' an' : ''), onclick: () => {
      e.jahreszeitDeko = !jahreszeitAn(e);
      D.einst.schreibtisch = { ...e }; speichereEinst(); zeichne(); if (danach) danach();
    } }, el('i'));
    anfuegen(kasten,
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Was zur Jahreszeit',
          el('div', { class: 'einstell-unter' }, 'Auf der Fensterbank steht etwas, das es nur in diesem Monat gibt — und ein paar Kleinigkeiten liegen auf dem Holz. Zwölf Monate, nicht vier Jahreszeiten.')),
        schalter),
      an ? el('div', { class: 'jz-vorschau' },
        el('span', { class: 'jz-vorschaubild', html: deko.stueck }),
        el('span', {}, el('b', {}, deko.name), el('small', {}, deko.was))) : null);
  };
  zeichne();
  return kasten;
}
