/* ===================== Orte: die Dinge, neu gemalt (5.66) =====================
   Jedes Ding traegt sein Licht und seinen Schatten selbst (frueher lag der
   Glanz in einer zweiten SVG-Schicht darueber — beim Antippen blieb er dann
   stehen, waehrend das Ding wackelte). Die Funktionen liefern das Innere einer
   Tipp-Gruppe; Lage, Kennung und Satz bestimmt 57-orte.js. Licht kommt
   ueberall von links oben. Verlaufs-Kennungen beginnen mit „od“. */

function odVerlauf(id, x2, y2, stops) {
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(([o, c]) => '<stop offset="' + o + '" stop-color="' + c + '"/>').join('') + '</linearGradient>';
}
function odKugel(id, stops, cx, cy) {
  return '<radialGradient id="' + id + '" cx="' + (cx || .38) + '" cy="' + (cy || .34) + '" r=".7">' + stops.map(([o, c]) => '<stop offset="' + o + '" stop-color="' + c + '"/>').join('') + '</radialGradient>';
}
const OD_STAHL = [[0, '#f4f6f8'], [.35, '#b9bec4'], [.6, '#8a9097'], [1, '#55595f']];
const OD_MESSING = [[0, '#fff0bf'], [.3, '#e0bb6c'], [.65, '#b08636'], [1, '#6e4f1c']];
const OD_HOLZ = [[0, '#b98a58'], [.5, '#8f6236'], [1, '#5e3c1e']];

/* ---------- Hefte: die Schreibmaschine ---------- */
function odSchreibmaschine() {
  const tasten = [0, 1, 2, 3].map((r) => {
    const n = 11 - r, x0 = 349 - r * 4.4, x1 = 451 + r * 4.4, y = 96.2 + r * 4.3;
    return Array.from({ length: n }, (_, i) => { const x = x0 + (x1 - x0) * i / (n - 1); return '<g class="ort-taste"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.15" fill="#c7ccd2"/><circle cx="' + x.toFixed(1) + '" cy="' + (y - .15).toFixed(1) + '" r="1.6" fill="#f1ead8"/><circle cx="' + (x - .5).toFixed(1) + '" cy="' + (y - .7).toFixed(1) + '" r=".45" fill="#fff"/></g>'; }).join('');
  }).join('');
  return '<defs>' + odVerlauf('odsmLack', 0, 1, [[0, '#3f4f48'], [.35, '#22302b'], [1, '#0c1210']]) +
    odVerlauf('odsmDeck', 0, 1, [[0, '#5a6c64'], [1, '#1a2420']]) +
    odVerlauf('odsmWalze', 0, 1, [[0, '#5a5a5e'], [.3, '#2a2a2e'], [.7, '#0e0e10'], [1, '#2a2a2e']]) +
    odVerlauf('odsmChrom', 0, 1, OD_STAHL) + odVerlauf('odsmGold', 1, 0, OD_MESSING) + '</defs>' +
    '<ellipse cx="402" cy="114.4" rx="80" ry="4" fill="rgba(0,0,0,.35)"/>' +
    /* der Wagen: Papier, Walze, Knoepfe, Zeilenhebel — er faehrt beim Antippen */
    '<g class="ort-wagen">' +
    '<path d="M369 72 L 371.4 23 L 430.6 23 L 433 72 Z" fill="#fbf7ea" stroke="#d9caa6" stroke-width=".6"/>' +
    '<path d="M371.4 23 L 430.6 23 L 430.8 27 L 371.2 27 Z" fill="rgba(0,0,0,.04)"/>' +
    '<g fill="#5a5048" opacity=".55">' + [33, 39, 45, 51, 57].map((y, i) => '<rect x="377" y="' + y + '" width="' + [44, 38, 46, 30, 22][i] + '" height="1.3" rx=".6"/>').join('') + '</g>' +
    '<rect x="398" y="57" width="1.2" height="5" fill="#2a2a2e" opacity=".7"/>' +
    '<rect x="336" y="66" width="128" height="12.4" rx="6.2" fill="url(#odsmWalze)"/>' +
    '<path d="M342 68.4 H458" stroke="rgba(255,255,255,.28)" stroke-width="1" stroke-linecap="round"/>' +
    '<rect x="338" y="77.6" width="124" height="3" rx="1.5" fill="url(#odsmChrom)"/>' +
    '<g><ellipse cx="331.4" cy="72.2" rx="4.4" ry="7.4" fill="#1a1a1c"/><ellipse cx="330.6" cy="72.2" rx="3.4" ry="6.4" fill="#3a3a3e"/><path d="M329 67.4 v9.6" stroke="rgba(255,255,255,.25)" stroke-width=".8"/></g>' +
    '<g><ellipse cx="468.6" cy="72.2" rx="4.4" ry="7.4" fill="#1a1a1c"/><ellipse cx="469.4" cy="72.2" rx="3.4" ry="6.4" fill="#2a2a2e"/></g>' +
    '<path class="ort-hebel" d="M333 69 L 318 58.4 L 312 59.6" fill="none" stroke="url(#odsmChrom)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="311.4" cy="59.8" r="2.6" fill="#1a1a1c"/><circle cx="310.6" cy="59" r=".8" fill="rgba(255,255,255,.5)"/>' +
    '</g>' +
    /* Gehaeuse: Deck mit Farbbandspulen, Typenkorb, Tastaturschraege */
    '<path d="M344 81 L 456 81 L 464 92 L 336 92 Z" fill="url(#odsmDeck)"/>' +
    '<path d="M345 81.6 H455" stroke="rgba(255,255,255,.35)" stroke-width=".8"/>' +
    [356, 444].map((x) => '<circle cx="' + x + '" cy="86.6" r="5" fill="url(#odsmChrom)"/><circle cx="' + x + '" cy="86.6" r="3.4" fill="#1a1a1c"/><circle cx="' + x + '" cy="86.6" r="1" fill="#c7ccd2"/>').join('') +
    '<path d="M376 91.6 Q 400 80.6 424 91.6 Z" fill="#070909"/>' +
    '<g stroke="rgba(200,205,210,.55)" stroke-width=".45">' + Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (i + 1) / 14; return '<path d="M400 91.4 L ' + (400 - 22 * Math.cos(a)).toFixed(1) + ' ' + (91.4 - 8.4 * Math.sin(a)).toFixed(1) + '"/>'; }).join('') + '</g>' +
    '<rect x="395" y="82.6" width="10" height="3" rx="1" fill="url(#odsmChrom)"/><rect x="394" y="84.6" width="12" height="1.4" fill="#8a1c12"/>' +
    '<path d="M336 92 L 464 92 L 476 112.6 L 324 112.6 Z" fill="url(#odsmLack)"/>' +
    '<path d="M337 92.4 L 463 92.4" stroke="rgba(255,255,255,.22)" stroke-width=".8"/>' +
    '<path d="M330 104 L 334 94" stroke="rgba(255,255,255,.12)" stroke-width="3" stroke-linecap="round"/>' +
    tasten +
    '<rect x="368" y="109.4" width="64" height="2.6" rx="1.3" fill="#e9e2d2"/><rect x="368" y="109.4" width="64" height=".9" rx=".45" fill="#fff"/>' +
    '<path d="M324 112.6 L 476 112.6" stroke="url(#odsmGold)" stroke-width="1.6"/>' +
    '<rect x="388" y="113.4" width="24" height="2.4" rx=".6" fill="url(#odsmGold)"/>' +
    '<text x="400" y="124" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-size="6" letter-spacing=".25" fill="#e9e2d2" opacity=".8">TIPPEN ZUM SCHREIBEN</text>';
}

/* ---------- Ein Filzhut, beliebig gross (Diele: gross am Brett, Faden: am Haken) ---------- */
function odFilzhut(id, band) {
  return '<defs>' + odVerlauf(id + 'F', 1, 0, [[0, '#5a4634'], [.45, '#3a2b1f'], [1, '#1a120c']]) + odVerlauf(id + 'K', 0, 1, [[0, '#4a3828'], [1, '#1c140e']]) + '</defs>' +
    '<ellipse cx="70" cy="75.5" rx="34" ry="6" fill="#1e1610"/>' +
    '<path d="M48.5 75 C 47.5 62 51.5 52 59.5 48.6 C 63.6 47 66.6 49.8 70 48.2 C 73.4 49.8 76.4 47 80.5 48.6 C 88.5 52 92.5 62 91.5 75 Z" fill="url(#' + id + 'F)"/>' +
    '<path d="M61 50.5 Q 70 58.5 79 50.5" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>' +
    '<path d="M55 72 C 53.6 62 56 55 61 51.5" fill="none" stroke="rgba(255,240,220,.16)" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M48.6 67.6 C 60 71 80 71 91.4 67.6 L 91.6 74.2 C 80 77.6 60 77.6 48.4 74.2 Z" fill="' + (band || '#7a1a10') + '"/>' +
    '<path d="M48.6 67.6 C 60 71 80 71 91.4 67.6" fill="none" stroke="rgba(255,220,200,.25)" stroke-width=".7"/>' +
    '<path d="M53 69.6 l -4 -3 l .6 5 z M53 69.6 l -3.4 5 l 5 -1.2 z" fill="rgba(0,0,0,.3)"/>' +
    '<path d="M35.5 76 C 42 83.5 98 83.5 104.5 76 C 99 79.6 41 79.6 35.5 76 Z" fill="url(#' + id + 'K)"/>' +
    '<path d="M37 76.6 C 48 80.2 92 80.2 103 76.6" fill="none" stroke="rgba(255,235,210,.22)" stroke-width=".8"/>';
}
/* Faden: Hakenleiste mit Hut, der am Haken haengt (leicht schraeg) */
function odHakenleiste() {
  return '<defs>' + odVerlauf('odhkLeiste', 0, 1, OD_MESSING) + '</defs>' +
    '<rect x="38" y="25" width="44" height="7" rx="2" fill="url(#odhkLeiste)"/><rect x="38" y="31.4" width="44" height="1.4" fill="rgba(0,0,0,.3)"/>' +
    '<circle cx="42" cy="28.5" r=".9" fill="#6e4f1c"/><circle cx="78" cy="28.5" r=".9" fill="#6e4f1c"/>' +
    '<path d="M60 31 V 37 Q 60 40.6 63.4 40" fill="none" stroke="#8a6a2e" stroke-width="2" stroke-linecap="round"/>';
}
function odHutAmHaken() {
  return '<g transform="translate(60 37.4) rotate(-7) scale(.74) translate(-70 -48.4)">' + odFilzhut('odhkHut', '#2f4a6e') + '</g>';
}

/* ---------- Blaetter: Tintenfass aus geschliffenem Glas mit Schreibfeder ---------- */
function odTintenfass() {
  return '<defs>' + odVerlauf('odtfGlas', 1, 0, [[0, 'rgba(210,230,240,.55)'], [.25, 'rgba(255,255,255,.18)'], [.6, 'rgba(120,150,170,.25)'], [1, 'rgba(40,60,80,.55)']]) +
    odVerlauf('odtfTinte', 0, 1, [[0, '#26304a'], [1, '#0a0e1a']]) + odVerlauf('odtfFeder', 1, 0, [[0, '#fbf8f0'], [.6, '#e6dfcf'], [1, '#bdb29a']]) + odVerlauf('odtfDeckel', 1, 0, OD_MESSING) + '</defs>' +
    '<ellipse cx="692" cy="114.6" rx="22" ry="3" fill="rgba(0,0,0,.3)"/>' +
    /* Glaskoerper mit Facetten, darin die Tinte */
    '<path d="M675 96 L 679 90 L 701 90 L 705 96 L 705 111 Q 690 115.6 675 111 Z" fill="url(#odtfTinte)"/>' +
    '<path d="M675 96 L 679 90 L 701 90 L 705 96 L 705 111 Q 690 115.6 675 111 Z" fill="url(#odtfGlas)" stroke="rgba(255,255,255,.45)" stroke-width=".6"/>' +
    '<path d="M682 90 L 681 112.6 M698 90 L 699 112.6" stroke="rgba(255,255,255,.22)" stroke-width=".6"/>' +
    '<path d="M677.6 95 L 677.6 109.6" stroke="rgba(255,255,255,.7)" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M675 96 L 705 96" stroke="rgba(255,255,255,.3)" stroke-width=".6"/>' +
    '<rect x="683" y="85" width="14" height="5.4" rx="1.4" fill="url(#odtfDeckel)"/><ellipse cx="690" cy="85" rx="7" ry="1.4" fill="#0a0e1a"/>' +
    /* die Feder: breite Fahne unter dem Kiel, schmale darueber, feine Strahlen, Flaum am Ansatz */
    '<path d="M696 80 C 702 66 712 48 728 27 C 731 38 728 52 720 64 C 713 74 705 80 696 80 Z" fill="url(#odtfFeder)" stroke="rgba(150,135,105,.55)" stroke-width=".5"/>' +
    '<path d="M694 78 C 699 64 709 46 728 27 C 716 38 706 52 699 64 C 697 69 695 74 694 78 Z" fill="#efe9da" stroke="rgba(150,135,105,.45)" stroke-width=".45"/>' +
    '<g fill="none" stroke="rgba(150,135,105,.38)" stroke-width=".45">' + Array.from({ length: 12 }, (_, i) => { const t = (i + 1) / 13, x = 695 + 33 * t, y = 81 - 54 * t + 6 * t * (1 - t); return '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' q ' + (3.4 * (1 - t * .5)).toFixed(1) + ' 1.6 ' + (5.6 * (1 - t * .5)).toFixed(1) + ' 4.4"/>'; }).join('') + '</g>' +
    '<path d="M699 70 C 706 56 715 43 726 30" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M690.4 88 Q 704 62 728 27" fill="none" stroke="#a8987a" stroke-width="1.3" stroke-linecap="round"/>' +
    '<g fill="none" stroke="rgba(240,234,220,.9)" stroke-width=".6" stroke-linecap="round"><path d="M694 80 q -3 -2 -3.6 -5"/><path d="M695 81.6 q -3.4 -.6 -5 -3.4"/><path d="M696.6 79 q 1 -3 3.4 -4"/></g>' +
    '<path d="M691 86 L 689.6 88.4" stroke="#0a0e1a" stroke-width="1.4" stroke-linecap="round"/>';
}

/* ---------- Woerter: Farbwalze (Handwalze) mit Holzgriff ---------- */
function odFarbwalze() {
  return '<defs>' + odVerlauf('odfwGummi', 0, 1, [[0, '#4a4a50'], [.22, '#1c1c20'], [.6, '#0a0a0c'], [1, '#26262a']]) + odVerlauf('odfwBuegel', 1, 1, OD_STAHL) + odVerlauf('odfwGriff', 1, 0, OD_HOLZ) + '</defs>' +
    '<ellipse cx="684" cy="52.4" rx="38" ry="2.6" fill="rgba(0,0,0,.4)"/>' +
    '<g class="ort-walzenrolle">' +
    '<rect x="648" y="30" width="68" height="20" rx="3" fill="url(#odfwGummi)"/>' +
    '<ellipse cx="716" cy="40" rx="4.2" ry="10" fill="#2e2e33"/><ellipse cx="716" cy="40" rx="1.8" ry="3" fill="url(#odfwBuegel)"/>' +
    '<ellipse cx="648" cy="40" rx="4.2" ry="10" fill="#141416"/>' +
    '<path d="M651 33.4 H713" stroke="rgba(255,255,255,.35)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path d="M651 35.6 H713" stroke="rgba(255,255,255,.1)" stroke-width="1.6"/>' +
    '</g>' +
    /* Buegel aus Stahldraht, Zwinge, gedrechselter Griff */
    '<path d="M716 40 C 724 38 728 32 732 26 M648 40 C 646 26 700 20 732 26" fill="none" stroke="url(#odfwBuegel)" stroke-width="2" stroke-linecap="round"/>' +
    '<rect x="730" y="20" width="7" height="8" rx="1.4" fill="url(#odfwBuegel)" transform="rotate(-38 733.5 24)"/>' +
    '<path d="M736 21.4 C 740 15 746 10.4 752 7.2 C 756 5 759.6 7.6 757.6 11 C 754 16 746 20 739.6 24.6 Z" fill="url(#odfwGriff)"/>' +
    '<path d="M739 20.6 C 744 15 749 11.4 754 8.6" fill="none" stroke="rgba(255,230,190,.45)" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M745 18 l 2 2.6 M750 14 l 2 2.6" stroke="rgba(60,30,10,.35)" stroke-width=".6"/>';
}

/* ---------- Klang: Grammophonschrank (Furnier, Kurbel, Fuesse) ---------- */
function odGrammophonKasten() {
  return '<defs>' + odVerlauf('odgkFurnier', 1, 0, [[0, '#8a5a32'], [.45, '#6b4426'], [1, '#3e2614']]) + odVerlauf('odgkDeckel', 0, 1, [[0, '#b8875a'], [1, '#6b4426']]) + odVerlauf('odgkMess', 1, 0, OD_MESSING) + '</defs>' +
    '<rect x="248" y="74" width="174" height="7" rx="2.4" fill="url(#odgkDeckel)"/>' +
    '<path d="M250 74.6 H420" stroke="rgba(255,230,190,.5)" stroke-width=".8"/>' +
    '<rect x="252" y="81" width="166" height="37" fill="url(#odgkFurnier)"/>' +
    '<g fill="none" stroke="rgba(40,20,5,.25)" stroke-width=".7">' + [86, 92, 99, 106, 112].map((y, i) => '<path d="M254 ' + y + ' C 300 ' + (y + (i % 2 ? 2 : -2)) + ', 360 ' + (y - 1.4) + ', 416 ' + (y + 1) + '"/>').join('') + '</g>' +
    '<rect x="262" y="88" width="146" height="24" rx="2" fill="none" stroke="rgba(255,220,170,.28)" stroke-width="1"/>' +
    '<rect x="263" y="89" width="144" height="22" rx="1.6" fill="rgba(20,10,0,.22)"/>' +
    '<path d="M300 100 q 35 -8 70 0" fill="none" stroke="rgba(255,220,170,.2)" stroke-width="1"/>' +
    '<circle cx="335" cy="99.4" r="2.2" fill="url(#odgkMess)"/>' +
    '<rect x="252" y="116" width="166" height="3" fill="rgba(0,0,0,.35)"/>' +
    [256, 410].map((x) => '<path d="M' + x + ' 118.4 h6 l -1 3.4 h-4 z" fill="#3e2614"/>').join('') +
    /* Kurbel an der rechten Seite */
    '<g class="ort-kurbel" style="transform-origin:424px 98px"><circle cx="424" cy="98" r="2.6" fill="url(#odgkMess)"/><path d="M424 98 L 436 92" stroke="url(#odgkMess)" stroke-width="2" stroke-linecap="round"/><rect x="434.6" y="86" width="3.4" height="7.6" rx="1.7" fill="#2a1a0c"/></g>';
}

/* ---------- Klang: Metronom (Holzpyramide, Skala, Pendel mit Gewicht) ---------- */
function odMetronom() {
  return '<defs>' + odVerlauf('odmtHolz', 1, 0, [[0, '#a8743e'], [.5, '#7a4e26'], [1, '#4a2c12']]) + odVerlauf('odmtMess', 1, 0, OD_MESSING) + '</defs>' +
    '<ellipse cx="702" cy="121.6" rx="30" ry="2.6" fill="rgba(0,0,0,.35)"/>' +
    '<rect x="676" y="114" width="50" height="7" rx="1.6" fill="#4a2c12"/><rect x="676" y="114" width="50" height="1.6" fill="rgba(255,220,170,.35)"/>' +
    '<path d="M681 114.4 L 694 50 Q 700 46.4 706 50 L 719 114.4 Z" fill="url(#odmtHolz)"/>' +
    '<path d="M682.6 113 L 694.6 51.4" stroke="rgba(255,225,180,.45)" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M689 110 L 696.4 58 L 703.6 58 L 711 110 Z" fill="#efe4c8"/>' +
    '<g stroke="#5a3a1a" stroke-width=".5">' + Array.from({ length: 9 }, (_, i) => { const y = 64 + i * 5; const h = (y - 58) / 52 * 7.4; return '<path d="M' + (700 - 2.2).toFixed(1) + ' ' + y + ' h4.4"/>'; }).join('') + '</g>' +
    '<line class="ort-pendel" x1="700" y1="106" x2="700" y2="56" stroke="#6e4f1c" stroke-width="1.4" style="transform-origin:700px 106px"/>' +
    '<path class="ort-pendel" d="M696 68 h8 l -1 6 h-6 z" fill="url(#odmtMess)" style="transform-origin:700px 106px"/>' +
    '<path d="M688 110 L 712 110 L 714 114 L 686 114 Z" fill="#5e3a1a"/>' +
    '<circle cx="700" cy="49.6" r="2" fill="url(#odmtMess)"/>' +
    '<path d="M719.6 96 h4 v-3 h2 v6 h-2 v-3" fill="none" stroke="url(#odmtMess)" stroke-width="1.2"/>';
}

/* ---------- Klang: Stumpenkerze in der Messingschale ---------- */
function odKerze() {
  return '<defs>' + odVerlauf('odkzWachs', 1, 0, [[0, '#fffaf0'], [.4, '#f3e7c6'], [1, '#c9b48a']]) + odVerlauf('odkzSchale', 0, 1, OD_MESSING) +
    odKugel('odkzFlamme', [[0, '#fffbe8'], [.35, '#ffe08a'], [.8, '#ff9a3a'], [1, 'rgba(255,120,40,0)']], .5, .7) + '</defs>' +
    '<ellipse cx="590" cy="120.6" rx="17" ry="2.2" fill="rgba(0,0,0,.35)"/>' +
    '<ellipse cx="590" cy="117.6" rx="15" ry="3.4" fill="url(#odkzSchale)"/><ellipse cx="590" cy="116.8" rx="11" ry="2" fill="#6e4f1c"/>' +
    '<path d="M604 116 q 6 -1 6 3 q 0 3 -5 2" fill="none" stroke="url(#odkzSchale)" stroke-width="1.6"/>' +
    '<path d="M583 98 L 583 116.6 Q 590 118.4 597 116.6 L 597 98 Z" fill="url(#odkzWachs)"/>' +
    '<ellipse cx="590" cy="98" rx="7" ry="1.8" fill="#fbf3de"/><ellipse cx="590" cy="98.2" rx="5" ry="1.1" fill="#eadcb8"/>' +
    '<path d="M585 98.6 q -.6 4 .4 6.4 q 1 -2.6 .6 -6.4 Z M594.4 98.8 q .8 3 0 4.6 q -.8 -2 -.4 -4.6 Z" fill="#fff8e8"/>' +
    '<path d="M585.4 101 V 115" stroke="rgba(255,255,255,.6)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path d="M590 97.4 V 94.6" stroke="#2a1a0c" stroke-width=".9" stroke-linecap="round"/>' +
    '<ellipse cx="590" cy="88" rx="6" ry="9" fill="url(#odkzFlamme)" opacity=".55"/>' +
    '<path class="ort-flamme" d="M590 95 C 586 90.6 587 85.4 590 81.4 C 593 85.4 594 90.6 590 95 Z" fill="#ffc45a" style="transform-origin:590px 95px"/>' +
    '<path d="M590 94 C 588.4 92 588.6 89.4 590 87.6 C 591.4 89.4 591.6 92 590 94 Z" fill="#fff6d0"/>' +
    '<ellipse cx="590" cy="94.2" rx="1.2" ry="1.6" fill="rgba(70,110,200,.55)"/>';
}

/* ---------- Feinheiten: die Werkzeugwand ---------- */
function odHammer() {
  return '<defs>' + odVerlauf('odhmKopf', 0, 1, OD_STAHL) + odVerlauf('odhmStiel', 1, 0, [[0, '#e3c18a'], [.5, '#c09058'], [1, '#8a5e30']]) + '</defs>' +
    '<path d="M104 38 Q 110 32 116 38" fill="none" stroke="#c7ccd2" stroke-width="1.6"/>' +
    '<path d="M106.4 40 L 113.6 40 L 114.4 89 Q 110 92 105.6 89 Z" fill="url(#odhmStiel)"/>' +
    '<g stroke="rgba(90,50,15,.35)" stroke-width=".5" fill="none"><path d="M108 46 C 107.6 60 108.6 72 108 86"/><path d="M111.6 44 C 112 60 111 74 112 88"/></g>' +
    '<path d="M107.2 42 L 107.8 87" stroke="rgba(255,240,210,.5)" stroke-width=".8" stroke-linecap="round"/>' +
    '<rect x="105.2" y="77" width="9.6" height="13" rx="3" fill="#2f3a44"/><path d="M106 79 h8 M106 82 h8 M106 85 h8 M106 88 h8" stroke="rgba(255,255,255,.12)" stroke-width=".6"/>' +
    '<path d="M98 30 L 124 30 L 124 42 L 98 42 Z" fill="url(#odhmKopf)"/>' +
    '<path d="M88 33 L 98 31 L 98 41 L 88 39.6 Z" fill="url(#odhmKopf)"/><rect x="86" y="32.4" width="3.4" height="7.8" rx="1" fill="#9aa0a6"/>' +
    '<path d="M124 31.6 C 132 32 136 36 138 42 C 133 38.6 129 37.4 124 38.6 Z" fill="url(#odhmKopf)"/>' +
    '<path d="M124 35.6 C 129 35.4 133.4 37.6 136 41" fill="none" stroke="#3a3e44" stroke-width=".6"/>' +
    '<path d="M98.6 31.4 H123.4" stroke="#fff" stroke-width=".9" opacity=".8"/>' +
    '<rect x="105.6" y="30.6" width="8.8" height="11" rx="1" fill="rgba(0,0,0,.18)"/>';
}
function odSaege() {
  return '<defs>' + odVerlauf('odsgBlatt', 0, 1, [[0, '#f2f4f6'], [.35, '#c3c8cd'], [.7, '#9298a0'], [1, '#6a7078']]) + odVerlauf('odsgGriff', 1, 1, [[0, '#d38a4a'], [.5, '#a3562f'], [1, '#6e3418']]) + '</defs>' +
    '<path d="M176 30 L 248 27 L 248 54 L 176 47 Z" fill="url(#odsgBlatt)"/>' +
    '<path d="M176 47 ' + Array.from({ length: 18 }, (_, i) => 'L ' + (180 + i * 4) + ' ' + (47.4 + i * .39 + 2.6).toFixed(1) + ' L ' + (182 + i * 4) + ' ' + (47.6 + i * .39).toFixed(1)).join(' ') + ' L 248 54 Z" fill="#8a9097"/>' +
    '<path d="M177 31 L 247 28.2" stroke="#fff" stroke-width=".9" opacity=".85"/>' +
    '<path d="M196 38 L 236 36.4" stroke="rgba(255,255,255,.45)" stroke-width="2.4" stroke-linecap="round"/>' +
    '<text x="214" y="44" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-style="italic" font-size="4.4" fill="rgba(60,64,70,.55)">Feinschnitt</text>' +
    '<path d="M246 24 C 258 22 272 26 274 36 C 276 46 270 58 258 60 L 246 58 Z" fill="url(#odsgGriff)"/>' +
    '<path d="M254 33 C 262 31 268 35 267 41 C 266 47 260 50 254 48 Z" fill="#3e3e42"/>' +
    '<path d="M248 26.4 C 258 24.6 268 28 271 34" fill="none" stroke="rgba(255,220,190,.5)" stroke-width="1" stroke-linecap="round"/>' +
    [[249.6, 30], [249.6, 52], [262, 55.6]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.5" fill="#e0bb6c"/>').join('');
}
function odZange() {
  return '<defs>' + odVerlauf('odzgStahl', 1, 0, OD_STAHL) + odVerlauf('odzgGriff', 1, 0, [[0, '#e05a48'], [.5, '#c0392b'], [1, '#7a1e14']]) + '</defs>' +
    '<g class="ort-zangeL" style="transform-origin:320px 52px"><path d="M316 24 C 314 32 316 44 319 52 L 322 51 C 320.4 42 319.6 32 320 24 Z" fill="url(#odzgStahl)"/>' +
    '<path d="M319 52 C 316 64 312 76 309 86" stroke="url(#odzgGriff)" stroke-width="5.4" stroke-linecap="round" fill="none"/></g>' +
    '<g class="ort-zangeR" style="transform-origin:320px 52px"><path d="M324 24 C 326 32 324 44 321 52 L 318 51 C 319.6 42 320.4 32 320 24 Z" fill="url(#odzgStahl)"/>' +
    '<path d="M321 52 C 324 64 328 76 331 86" stroke="url(#odzgGriff)" stroke-width="5.4" stroke-linecap="round" fill="none"/></g>' +
    '<g stroke="#5a5f66" stroke-width=".5"><path d="M317.6 28 h2.2 M317.4 31 h2.4 M320.4 28 h2.2 M320.4 31 h2.4"/></g>' +
    '<circle cx="320" cy="51.6" r="3" fill="url(#odzgStahl)"/><circle cx="320" cy="51.6" r="1" fill="#55595f"/>' +
    '<path d="M310.6 80 C 312.6 72 315 64 317.4 57" fill="none" stroke="rgba(255,200,190,.45)" stroke-width="1" stroke-linecap="round"/>';
}
function odSchrauber() {
  return '<defs>' + odVerlauf('odsrStahl', 0, 1, OD_STAHL) + odVerlauf('odsrGriff', 0, 1, [[0, '#ffd08a'], [.35, '#e89a32'], [1, '#9a4e10']]) + '</defs>' +
    '<g transform="rotate(-30 420 80)">' +
    '<ellipse cx="418" cy="88.6" rx="22" ry="1.6" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="390" y="78.6" width="34" height="3" rx="1.2" fill="url(#odsrStahl)"/><path d="M386 79 L 390 78.6 L 390 81.6 L 386 81.2 Z" fill="#8a9097"/>' +
    '<rect x="422" y="77.4" width="5" height="5.4" rx="1" fill="url(#odsrStahl)"/>' +
    '<path d="M427 76 C 432 74.6 446 74.6 451 76.4 L 451 83.6 C 446 85.4 432 85.4 427 84 Z" fill="url(#odsrGriff)" opacity=".95"/>' +
    '<g stroke="rgba(120,60,10,.4)" stroke-width=".6"><path d="M432 75.6 V84.4 M437 75.2 V84.8 M442 75.2 V84.8 M447 75.6 V84.4"/></g>' +
    '<path d="M429 77.2 H449" stroke="rgba(255,255,255,.65)" stroke-width="1" stroke-linecap="round"/>' +
    '</g>';
}
function odWasserwaage() {
  return '<defs>' + odVerlauf('odwwKoerper', 0, 1, [[0, '#ffe680'], [.4, '#e8c23a'], [1, '#a8841a']]) + odVerlauf('odwwAlu', 0, 1, OD_STAHL) +
    odVerlauf('odwwLib', 0, 1, [[0, '#f2fff0'], [.5, '#c6ecbe'], [1, '#8fcf86']]) + '</defs>' +
    '<rect x="662" y="108" width="120" height="3" rx="1.5" fill="rgba(0,0,0,.35)"/>' +
    '<rect x="660" y="93" width="120" height="15" rx="2.4" fill="url(#odwwKoerper)"/>' +
    '<rect x="660" y="93" width="120" height="2" rx="1" fill="url(#odwwAlu)"/><rect x="660" y="106" width="120" height="2" rx="1" fill="url(#odwwAlu)"/>' +
    '<path d="M662 96.6 H778" stroke="rgba(255,255,255,.55)" stroke-width=".8"/>' +
    [[672, 1], [758, 1]].map(([x]) => '<rect x="' + x + '" y="96.4" width="10" height="8" rx="4" fill="#2a2a2e"/><rect x="' + (x + 1.6) + '" y="98.2" width="6.8" height="4.4" rx="2.2" fill="url(#odwwLib)"/><circle cx="' + (x + 4) + '" cy="100.4" r="1.2" fill="rgba(255,255,255,.95)"/>').join('') +
    '<rect x="702" y="92" width="36" height="18" rx="5" fill="#2a2a2e"/>' +
    '<rect x="705" y="95" width="30" height="12" rx="6" fill="url(#odwwLib)"/>' +
    '<circle class="ort-libelle" cx="720" cy="101" r="3.6" fill="rgba(255,255,255,.92)" stroke="rgba(80,130,70,.6)" stroke-width=".6" style="transform-origin:720px 101px"/>' +
    '<line x1="715.4" y1="95" x2="715.4" y2="107" stroke="#3a5f32" stroke-width=".8"/><line x1="724.6" y1="95" x2="724.6" y2="107" stroke="#3a5f32" stroke-width=".8"/>' +
    '<path d="M707 96.6 H733" stroke="rgba(255,255,255,.7)" stroke-width=".8" stroke-linecap="round"/>' +
    '<g stroke="rgba(60,40,0,.45)" stroke-width=".6">' + Array.from({ length: 14 }, (_, i) => '<path d="M' + (686 + i * (i < 7 ? 2 : 2) + (i >= 7 ? 54 : 0)) + ' 106 v' + (i % 5 === 0 ? -3 : -1.6) + '"/>').join('') + '</g>';
}
function odMassband() {
  return '<defs>' + odKugel('odmbGehaeuse', [[0, '#fff2a0'], [.45, '#f0c828'], [1, '#9a7a0a']]) + odVerlauf('odmbBand', 0, 1, [[0, '#fff6c0'], [1, '#e8d070']]) + odVerlauf('odmbChrom', 1, 1, OD_STAHL) + '</defs>' +
    '<ellipse cx="66" cy="117.6" rx="20" ry="2.6" fill="rgba(0,0,0,.35)"/>' +
    '<g class="ort-bandzunge" style="transform-origin:74px 100px"><path d="M74 96 H134 V104 H74 Z" fill="url(#odmbBand)"/>' +
    '<g stroke="#2c2218" stroke-width=".5">' + Array.from({ length: 30 }, (_, i) => '<path d="M' + (76 + i * 2) + ' 96 v' + (i % 5 === 0 ? 3.4 : i % 5 === 2.5 ? 2.4 : 1.6) + '"/>').join('') + '</g>' +
    '<g font-family="ui-rounded, system-ui, sans-serif" font-size="3.2" fill="#2c2218">' + [1, 2, 3, 4, 5].map((n, i) => '<text x="' + (85 + i * 10) + '" y="103">' + n + '</text>').join('') + '</g>' +
    '<rect x="96" y="96" width="1.2" height="8" fill="#c0392b"/>' +
    '<path d="M133 95 H136.4 V106 H133 Z" fill="url(#odmbChrom)"/></g>' +
    '<circle cx="60" cy="100" r="16.4" fill="url(#odmbGehaeuse)"/>' +
    '<path d="M44.6 104 A 16 16 0 0 0 75 104" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>' +
    '<circle cx="60" cy="100" r="8" fill="#2c2c30"/><circle cx="60" cy="100" r="6" fill="url(#odmbChrom)"/>' +
    '<text x="60" y="101.6" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-weight="700" font-size="3.6" fill="#3a3a3e">5 m</text>' +
    '<path d="M48 92 A 14 14 0 0 1 58 85.4" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6" stroke-linecap="round"/>' +
    '<rect x="70" y="94.6" width="6" height="11" rx="1.2" fill="#2c2c30"/>' +
    '<rect x="55" y="83" width="10" height="3" rx="1" fill="#2c2c30"/>';
}
function odStummel() {
  return '<defs>' + odVerlauf('odstLack', 0, 1, [[0, '#ffd770'], [.5, '#e8b43c'], [1, '#a87a14']]) + '</defs>' +
    '<g transform="rotate(-8 250 110)">' +
    '<ellipse cx="252" cy="114.4" rx="22" ry="1.4" fill="rgba(0,0,0,.35)"/>' +
    '<rect x="238" y="106" width="30" height="7" fill="url(#odstLack)"/><path d="M238 108.4 H268 M238 110.6 H268" stroke="rgba(120,80,10,.3)" stroke-width=".5"/>' +
    '<rect x="233" y="105.6" width="6" height="7.8" rx="1" fill="#c9ccd2"/><path d="M234.4 105.6 v7.8 M236.4 105.6 v7.8" stroke="#8a9097" stroke-width=".5"/>' +
    '<rect x="229" y="106" width="5" height="7" rx="2" fill="#e09090"/>' +
    '<path d="M268 106 L 276 109.5 L 268 113 Z" fill="#f0d9a8"/><path d="M273.4 108.3 L 276 109.5 L 273.4 110.7 Z" fill="#2c2218"/>' +
    '<path d="M239 107 H267" stroke="rgba(255,255,255,.55)" stroke-width=".7"/></g>';
}
function odSchrauben() {
  return '<defs>' + odKugel('odsbKopf', [[0, '#ffffff'], [.4, '#c3c8cd'], [1, '#6a7078']]) + '</defs>' +
    [[160, 108, 20], [172, 112, -35], [166, 100, 70]].map(([x, y, w]) => '<circle cx="' + (x + .6) + '" cy="' + (y + .8) + '" r="3.2" fill="rgba(0,0,0,.3)"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="url(#odsbKopf)"/><path d="M' + (x - 2) + ' ' + y + ' h4" stroke="#3a3e44" stroke-width=".8" transform="rotate(' + w + ' ' + x + ' ' + y + ')"/>').join('');
}
/* Werkzeugkiste: lackiertes Blech, Sicken, Klappgriff, Verschluesse, Schild */
function odWerkzeugkiste() {
  return '<defs>' + odVerlauf('odwkLack', 0, 1, [[0, '#d24a3a'], [.3, '#b0352b'], [1, '#6e1c14']]) + odVerlauf('odwkDeckel', 0, 1, [[0, '#e86a58'], [1, '#9a2a20']]) + odVerlauf('odwkChrom', 0, 1, OD_STAHL) + '</defs>' +
    '<rect x="384" y="118" width="258" height="4" rx="2" fill="rgba(0,0,0,.4)"/>' +
    '<path d="M488 50 C 488 42 532 42 532 50" fill="none" stroke="#1e1e22" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M489 48 C 490 43.6 530 43.6 531 48" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1"/>' +
    '<rect x="484" y="50" width="8" height="10" rx="1.6" fill="url(#odwkChrom)"/><rect x="528" y="50" width="8" height="10" rx="1.6" fill="url(#odwkChrom)"/>' +
    '<path d="M382 60 L 638 60 L 640 72 L 380 72 Z" fill="url(#odwkDeckel)"/>' +
    '<path d="M383 60.8 H637" stroke="rgba(255,230,220,.6)" stroke-width=".9"/>' +
    '<rect x="380" y="72" width="260" height="48" rx="3" fill="url(#odwkLack)"/>' +
    '<path d="M380 72.6 H640" stroke="rgba(0,0,0,.35)" stroke-width="1"/>' +
    '<g fill="none" stroke-width="1.2">' + [84, 112].map((y) => '<path d="M392 ' + y + ' H628" stroke="rgba(0,0,0,.22)"/><path d="M392 ' + (y + 1.4) + ' H628" stroke="rgba(255,200,190,.18)"/>').join('') + '</g>' +
    [386, 618].map((x) => '<rect x="' + x + '" y="68" width="16" height="12" rx="2" fill="url(#odwkChrom)"/><rect x="' + (x + 5) + '" y="72" width="6" height="7" rx="1" fill="#55595f"/>').join('') +
    '<rect x="470" y="90" width="80" height="18" rx="2" fill="#efe4c8"/><rect x="470" y="90" width="80" height="18" rx="2" fill="none" stroke="rgba(0,0,0,.25)"/>' +
    '<text x="510" y="102.4" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-weight="700" font-size="7.4" letter-spacing=".4" fill="#6e1c14">FEINHEITEN</text>' +
    '<path d="M383 76 L 383 116" stroke="rgba(255,220,210,.25)" stroke-width="2" stroke-linecap="round"/>';
}

/* ---------- Schnipsel: der Stempel mit gedrechseltem Griff ---------- */
function odStempel() {
  return '<defs>' + odVerlauf('odstpGriff', 1, 0, OD_HOLZ) + odVerlauf('odstpBlock', 0, 1, [[0, '#9a6a3e'], [1, '#5a3a1e']]) + '</defs>' +
    '<ellipse cx="121" cy="36.4" rx="22" ry="2.2" fill="rgba(0,0,0,.25)"/>' +
    '<path d="M116 20 C 112 16 112 10 116 7 C 118 4 124 4 126 7 C 130 10 130 16 126 20 Z" fill="url(#odstpGriff)"/>' +
    '<path d="M117.6 7.6 C 116 10 116 14 117.6 17" fill="none" stroke="rgba(255,230,190,.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<rect x="118" y="19" width="6" height="3.4" fill="#5a3a1e"/>' +
    '<rect x="101" y="22" width="40" height="7" rx="1.4" fill="url(#odstpBlock)"/><path d="M102 22.8 H140" stroke="rgba(255,230,190,.45)" stroke-width=".8"/>' +
    '<rect x="103" y="29" width="36" height="3.6" fill="#8a1c12"/><rect x="103" y="29" width="36" height="1" fill="rgba(255,180,160,.4)"/>';
}

/* ---------- Diele: Briefe mit Marke und Stempel, die Uhr in Messing ---------- */
function odBriefe() {
  return '<defs>' + odVerlauf('odbrPapier', 1, 1, [[0, '#fbf3df'], [1, '#e2d3b0']]) + '</defs>' +
    '<ellipse cx="692" cy="78.6" rx="44" ry="2" fill="rgba(0,0,0,.25)"/>' +
    '<g transform="rotate(-6 680 64)"><rect x="650" y="58" width="60" height="22" rx=".8" fill="url(#odbrPapier)"/><path d="M650 58 L 680 72 L 710 58" fill="none" stroke="rgba(150,120,70,.55)" stroke-width=".8"/>' +
    '<rect x="696" y="60.4" width="10" height="8" fill="#5f7752"/><rect x="697" y="61.4" width="8" height="6" fill="none" stroke="#efe4c8" stroke-width=".5" stroke-dasharray=".8 .6"/>' +
    '<circle cx="692" cy="66" r="4.4" fill="none" stroke="rgba(60,60,80,.45)" stroke-width=".6"/><path d="M687 64.6 q 5 -1.6 10 0 M687 67.4 q 5 -1.6 10 0" fill="none" stroke="rgba(60,60,80,.35)" stroke-width=".5"/></g>' +
    '<g transform="rotate(5 700 66)"><rect x="672" y="62" width="60" height="22" rx=".8" fill="#f6ecd6"/><path d="M672 62 L 702 74 L 732 62" fill="none" stroke="rgba(150,120,70,.45)" stroke-width=".7"/>' +
    '<path d="M697.6 70.6 C 696 69 696 66.4 698 66 C 699.6 65.6 701 66.6 702 68 C 703 66.6 704.4 65.6 706 66 C 708 66.4 708 69 706.4 70.6 L 702 75 Z" fill="#a8401f" transform="translate(0 -1)"/>' +
    '<circle cx="702" cy="70" r="4.6" fill="#9a3418"/><circle cx="702" cy="70" r="3.2" fill="none" stroke="rgba(255,190,160,.45)" stroke-width=".6"/><path d="M700.4 68.6 q 1.6 -1.2 3.2 0" fill="none" stroke="rgba(255,210,190,.6)" stroke-width=".6"/>' +
    '<path d="M674 63.4 H730" stroke="rgba(255,255,255,.6)" stroke-width=".6"/></g>';
}
function odUhr(heute) {
  const h = heute.getHours(), m = heute.getMinutes();
  const zeiger = (len, winkel, breite, farbe, kl) => '<line class="' + kl + '" x1="700" y1="30" x2="' + (700 + len * Math.sin(winkel)).toFixed(2) + '" y2="' + (30 - len * Math.cos(winkel)).toFixed(2) + '" stroke="' + farbe + '" stroke-width="' + breite + '" stroke-linecap="round"/>';
  return '<defs>' + odVerlauf('oduhMess', 1, 1, OD_MESSING) + odKugel('oduhBlatt', [[0, '#fffdf4'], [.8, '#f1e6c8'], [1, '#d9c79a']]) + odKugel('oduhGlas', [[0, 'rgba(255,255,255,.6)'], [.45, 'rgba(255,255,255,.06)'], [1, 'rgba(0,0,0,.16)']], .32, .26) + '</defs>' +
    '<circle cx="701.4" cy="31.8" r="18.6" fill="rgba(0,0,0,.25)"/>' +
    '<circle cx="700" cy="30" r="18.4" fill="url(#oduhMess)"/><circle cx="700" cy="30" r="15.6" fill="#6e4f1c"/>' +
    '<circle cx="700" cy="30" r="15" fill="url(#oduhBlatt)"/>' +
    Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, l = i % 3 === 0 ? 3 : 1.6; return '<line x1="' + (700 + 13 * Math.sin(a)).toFixed(2) + '" y1="' + (30 - 13 * Math.cos(a)).toFixed(2) + '" x2="' + (700 + (13 - l) * Math.sin(a)).toFixed(2) + '" y2="' + (30 - (13 - l) * Math.cos(a)).toFixed(2) + '" stroke="#2c2218" stroke-width="' + (i % 3 === 0 ? 1.4 : .7) + '"/>'; }).join('') +
    zeiger(7.4, (h % 12 + m / 60) * Math.PI / 6, 2.2, '#2c2218', 'ort-stunde') + zeiger(11, m * Math.PI / 30, 1.5, '#2c2218', 'ort-minute') +
    '<line class="ort-sekunde" x1="700" y1="33.6" x2="700" y2="18" stroke="#b0352b" stroke-width=".8" style="transform-origin:700px 30px"/>' +
    '<circle cx="700" cy="30" r="1.6" fill="url(#oduhMess)"/>' +
    '<circle cx="700" cy="30" r="15" fill="url(#oduhGlas)"/>' +
    '<path d="M689.6 22.4 Q 693.6 17.6 700 16.6" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="700" cy="10.4" r="2.4" fill="url(#oduhMess)"/>';
}

/* ---------- Diele: was je nach Jahreszeit am fuenften Haken haengt ---------- */
function odJahreszeitHaken(jz) {
  if (jz === 'winter') return '<defs>' + odVerlauf('odjzTanne', 1, 1, [[0, '#5f8f58'], [1, '#2e5a32']]) + '</defs>' +
    '<path d="M310 48 C 309 62 311 78 309 94" fill="none" stroke="#5a3a1e" stroke-width="1.8" stroke-linecap="round"/>' +
    Array.from({ length: 9 }, (_, i) => { const y = 54 + i * 4.6, l = 12 - Math.abs(i - 4) * 1.2; return '<path d="M310 ' + y + ' q ' + (-l * .5) + ' 1 ' + (-l) + ' 5 M310 ' + y + ' q ' + (l * .5) + ' 1 ' + l + ' 5" fill="none" stroke="url(#odjzTanne)" stroke-width="1.6" stroke-linecap="round"/>'; }).join('') +
    '<path d="M302 52 q 8 -5 16 0" fill="none" stroke="#b0352b" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="304" cy="76" r="3" fill="#c0392b"/><circle cx="303" cy="75" r=".9" fill="rgba(255,255,255,.7)"/><circle cx="317" cy="86" r="2.6" fill="#e0bb6c"/><circle cx="316.2" cy="85.2" r=".8" fill="rgba(255,255,255,.7)"/>';
  if (jz === 'fruehling') return '<path d="M310 52 C 309 66 311 80 310 94" fill="none" stroke="#4a7a46" stroke-width="1.6"/>' +
    '<path d="M310 74 c -8 -2 -12 2 -14 6 c 6 1 10 -1 14 -6 z M310 84 c 7 -3 12 0 14 4 c -6 2 -10 0 -14 -4 z" fill="#6f9a5a"/>' +
    [[310, 56, 1], [303, 64, .8], [317, 66, .85]].map(([x, y, s]) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + Array.from({ length: 5 }, (_, i) => '<ellipse cx="0" cy="-4.4" rx="3.4" ry="4.6" fill="' + (i % 2 ? '#f2bccb' : '#e9a9b8') + '" transform="rotate(' + (i * 72) + ')"/>').join('') + '<circle r="2.2" fill="#f2d98a"/><g fill="#c98a2a">' + [0, 1, 2, 3, 4].map((i) => '<circle cx="' + (1.2 * Math.cos(i * 1.26)).toFixed(2) + '" cy="' + (1.2 * Math.sin(i * 1.26)).toFixed(2) + '" r=".35"/>').join('') + '</g></g>').join('');
  if (jz === 'sommer') return '<defs>' + odVerlauf('odjzStroh', 0, 1, [[0, '#f3d98e'], [1, '#c9a24e']]) + '</defs>' +
    '<ellipse cx="310" cy="64" rx="27" ry="7.6" fill="url(#odjzStroh)"/>' +
    '<g fill="none" stroke="rgba(150,110,40,.45)" stroke-width=".5">' + [24, 20, 16].map((rx) => '<ellipse cx="310" cy="64" rx="' + rx + '" ry="' + (rx * .28).toFixed(1) + '"/>').join('') + '</g>' +
    '<path d="M296 63 C 296 52 302 46 310 46 C 318 46 324 52 324 63 Q 310 67 296 63 Z" fill="url(#odjzStroh)"/>' +
    '<g fill="none" stroke="rgba(150,110,40,.4)" stroke-width=".5"><path d="M297 58 Q 310 61 323 58"/><path d="M299 53 Q 310 56 321 53"/><path d="M303 48.6 Q 310 50.6 317 48.6"/></g>' +
    '<path d="M296.4 61 Q 310 64.6 323.6 61" fill="none" stroke="#2f5a7a" stroke-width="3"/><path d="M322 61 l 6 6 l -3 1 z" fill="#2f5a7a"/>' +
    '<path d="M300 56 C 301 51 304 48.6 307 47.6" fill="none" stroke="rgba(255,250,220,.6)" stroke-width="1.2" stroke-linecap="round"/>';
  /* Herbst: ein Ahornblatt am Stiel */
  return '<defs>' + odVerlauf('odjzAhorn', 1, 1, [[0, '#e8a43a'], [.5, '#c8642a'], [1, '#8a2e14']]) + '</defs>' +
    '<path d="M310 50 C 310.6 56 310 60 310.4 64" fill="none" stroke="#6a3a18" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path d="M310 92 L 307 84 L 298 86 L 300 80 L 291 74 L 296 72 L 293 63 L 300 66 L 303 58 L 306 64 L 310 54 L 314 64 L 317 58 L 320 66 L 327 63 L 324 72 L 329 74 L 320 80 L 322 86 L 313 84 Z" fill="url(#odjzAhorn)" transform="translate(0 -1)"/>' +
    '<g fill="none" stroke="rgba(100,40,10,.55)" stroke-width=".6"><path d="M310 90 V 56"/><path d="M310 78 L 296 70"/><path d="M310 78 L 324 70"/><path d="M310 84 L 300 84"/><path d="M310 84 L 320 84"/></g>';
}

/* ---------- Faden: ein echter Farn im Topf ---------- */
function odFarn() {
  const wedel = (x0, y0, x1, y1, n, dir) => {
    let s = '<path d="M' + x0 + ' ' + y0 + ' Q ' + ((x0 + x1) / 2) + ' ' + (Math.min(y0, y1) - 6) + ' ' + x1 + ' ' + y1 + '" fill="none" stroke="#3f6e3c" stroke-width="1"/>';
    for (let i = 1; i < n; i++) {
      const t = i / n, x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (Math.min(y0, y1) - 6) + t * t * y1;
      const l = 7 * (1 - t * .7);
      s += '<ellipse cx="' + (x + dir * .5).toFixed(1) + '" cy="' + (y - l * .5).toFixed(1) + '" rx="1.3" ry="' + (l * .55).toFixed(1) + '" fill="' + (i % 2 ? '#5a8a52' : '#4a7a46') + '" transform="rotate(' + (-30 * dir) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>' +
        '<ellipse cx="' + (x - dir * .5).toFixed(1) + '" cy="' + (y + l * .45).toFixed(1) + '" rx="1.3" ry="' + (l * .5).toFixed(1) + '" fill="' + (i % 2 ? '#4a7a46' : '#3f6e3c') + '" transform="rotate(' + (30 * dir) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return s;
  };
  return '<defs>' + odVerlauf('odfnTopf', 1, 0, [[0, '#d07a4c'], [.4, '#b8603a'], [1, '#7a3a1e']]) + '</defs>' +
    '<ellipse cx="742" cy="128.6" rx="22" ry="2.4" fill="rgba(0,0,0,.35)"/>' +
    '<g class="ort-blaetter">' + wedel(740, 100, 708, 78, 9, -1) + wedel(740, 100, 774, 80, 9, 1) + wedel(740, 100, 726, 62, 9, -1) + wedel(740, 100, 756, 60, 9, 1) + wedel(740, 100, 742, 54, 8, 1) + '</g>' +
    '<path d="M724 104 L 756 104 L 753.4 127 Q 740 129.4 726.6 127 Z" fill="url(#odfnTopf)"/>' +
    '<rect x="721" y="99" width="38" height="6.4" rx="1.8" fill="#c9714a"/><rect x="721" y="99" width="38" height="1.6" rx=".8" fill="rgba(255,220,190,.4)"/>' +
    '<ellipse cx="740" cy="99.6" rx="16" ry="1.4" fill="#3a2414"/>' +
    '<path d="M727 107 L 729 125" stroke="rgba(255,220,190,.3)" stroke-width="1.4" stroke-linecap="round"/>';
}

/* ---------- Glanz, der am Ding haengt (nur mit Gestaltung v2) ----------
   Frueher in der oberen Malschicht; jetzt in der Tipp-Gruppe, damit Licht
   und Kanten mitwackeln. Jede Art bringt ihre Verlaeufe selbst mit. */
const OD_GLANZ_RUND = [[0, 'rgba(255,255,255,.22)'], [.4, 'rgba(255,255,255,0)'], [.75, 'rgba(0,0,0,.12)'], [1, 'rgba(0,0,0,.3)']];
const OD_GLANZ_OBEN = [[0, 'rgba(255,255,255,.28)'], [.45, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.22)']];
function odGlanz(art, a, b) {
  if (typeof orteV2An === 'function' && !orteV2An()) return '';
  const L = (d, farbe, w) => '<path d="' + d + '" fill="none" stroke="' + farbe + '" stroke-width="' + (w || 1) + '" stroke-linecap="round"/>';
  const rund = (id) => '<defs>' + odVerlauf(id, 1, 0, OD_GLANZ_RUND) + '</defs>';
  const oben = (id) => '<defs>' + odVerlauf(id, 0, 1, OD_GLANZ_OBEN) + '</defs>';
  switch (art) {
    case 'mantel': return rund('odgMantel') + '<path d="M117 51 C 114.5 59 114 70 113 84 L111 116 q 5 3 10 1 l 4 -2 q 5 2 10 0 l 4 2 q 5 2 10 -1 L147 84 C 146 70 145.5 59 143 51 C 139 48.6 121 48.6 117 51 Z" fill="url(#odgMantel)" opacity=".8"/>';
    case 'schluessel': return oben('odgSchl') + '<rect x="364" y="28" width="96" height="46" rx="4" fill="url(#odgSchl)" opacity=".7"/>';
    case 'bleistift': return '<defs>' + odVerlauf('odgStift', 0, 1, [[0, 'rgba(255,255,255,.45)'], [.45, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.3)']]) + '</defs><rect x="150" y="112" width="110" height="8" fill="url(#odgStift)"/>';
    case 'lampe': return '<defs>' + odVerlauf('odgSchirm', 1, 0, [[0, 'rgba(255,255,255,.25)'], [.3, 'rgba(255,255,255,.05)'], [.7, 'rgba(0,0,0,.08)'], [1, 'rgba(0,0,0,.3)']]) + odVerlauf('odgLfuss', 1, 0, OD_GLANZ_RUND) + '</defs>' +
      '<path d="M86 56h70l-12-26H98z" fill="url(#odgSchirm)"/>' + L('M100 32 L90 54', 'rgba(255,255,255,.35)', 1.4) + '<rect x="118" y="52" width="6" height="60" fill="url(#odgLfuss)"/>';
    case 'buecher': return oben('odgBuch') + L('M190 99 H274', 'rgba(232,196,110,.7)', .8) + L('M190 109 H274', 'rgba(232,196,110,.7)', .8) + L('M196 85 H272', 'rgba(232,196,110,.6)', .8) + L('M192 73 H262', 'rgba(255,240,200,.5)', .8) + '<rect x="190" y="70" width="84" height="42" fill="url(#odgBuch)" opacity=".6"/>';
    case 'topf': return rund('odgTopf') + '<rect x="710" y="84" width="40" height="28" rx="3" fill="url(#odgTopf)"/>';
    case 'adern': return '<g stroke="rgba(230,250,220,.35)" stroke-width=".7" fill="none"><path d="M729 82c-8-10-18-16-28-20"/><path d="M731 82c8-10 18-16 28-20"/><path d="M730 80c0-12 3-24 9-36"/></g>';
    case 'heft': return '<defs>' + odVerlauf('odgFalz', 1, 0, [[0, 'rgba(0,0,0,0)'], [.42, 'rgba(0,0,0,0)'], [.5, 'rgba(60,40,10,.22)'], [.58, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']]) + '</defs><g transform="rotate(-2 400 80)"><rect x="262" y="24" width="276" height="112" fill="url(#odgFalz)"/>' + L('M264 25 H536', 'rgba(255,255,255,.6)', .8) + '</g>';
    case 'keks': return '<defs>' + odKugel('odgKeks', [[0, 'rgba(255,230,170,.5)'], [.55, 'rgba(255,230,170,0)'], [1, 'rgba(80,40,10,.35)']]) + '</defs><circle cx="716" cy="124" r="12" fill="url(#odgKeks)"/><g fill="rgba(120,70,20,.35)"><circle cx="709" cy="127" r=".9"/><circle cx="722" cy="119" r=".8"/><circle cx="716" cy="117" r=".7"/></g>';
    case 'letter': return '<rect x="' + (a + 3) + '" y="' + (b + 3) + '" width="34" height="30" rx="2" fill="url(#odgLetter)"/>' + L('M' + (a + 4) + ' ' + (b + 3.6) + ' h32', 'rgba(255,255,255,.45)', .7);
    case 'letterDefs': return '<defs>' + odVerlauf('odgLetter', 0, 1, [[0, 'rgba(255,255,255,.3)'], [.35, 'rgba(255,255,255,.04)'], [1, 'rgba(0,0,0,.35)']]) + '</defs>';
    case 'huellen': return rund('odgHuelle') + [0, 1, 2, 3].map((i) => '<rect x="' + (80 + i * 28) + '" y="' + (48 + (i % 2) * 4) + '" width="26" height="70" rx="2" fill="url(#odgHuelle)" transform="rotate(' + (-6 + i * 3) + ' ' + (93 + i * 28) + ' 118)"/>').join('');
    case 'bank': return '<defs>' + odVerlauf('odgPolster', 0, 1, [[0, 'rgba(255,220,180,.3)'], [.3, 'rgba(255,220,180,0)'], [1, 'rgba(0,0,0,.28)']]) + '</defs><rect x="250" y="60" width="300" height="34" rx="8" fill="url(#odgPolster)"/>' +
      [300, 350, 400, 450, 500].map((x) => '<circle cx="' + x + '" cy="76" r="1.6" fill="rgba(60,20,5,.4)"/><path d="M' + (x - 8) + ' 72 Q ' + x + ' 76 ' + (x - 8) + ' 80 M' + (x + 8) + ' 72 Q ' + x + ' 76 ' + (x + 8) + ' 80" fill="none" stroke="rgba(60,20,5,.18)"/>').join('');
    case 'telefon': return '<defs>' + odKugel('odgBakelit', [[0, 'rgba(255,255,255,.35)'], [.55, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.2)']]) + '</defs><rect x="590" y="64" width="70" height="30" rx="8" fill="url(#odgBakelit)"/>' + L('M598 66 Q 625 62 652 66', 'rgba(255,255,255,.4)', 1.2);
    case 'konsole': return oben('odgKonsole') + '<rect x="620" y="78" width="160" height="8" rx="2" fill="url(#odgKonsole)"/>';
    case 'stehlampe': return rund('odgStehl') + '<path d="M124 36h72l-12-20H136z" fill="url(#odgStehl)"/>';
  }
  return '';
}

/* ---------- Faden: Polsterbank mit Knopfheftung, Rollarmlehnen, gedrechselten Beinen ---------- */
function odBank() {
  const knoepfe = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 8 - r; i++) knoepfe.push([290 + i * 32 + r * 16, 70 + r * 11]);
  return '<defs>' + odVerlauf('odbkSamt', 0, 1, [[0, '#c46a3e'], [.45, '#a3562f'], [1, '#6e3418']]) + odVerlauf('odbkSitz', 0, 1, [[0, '#d07a4c'], [.5, '#a3562f'], [1, '#5e2c14']]) +
    odVerlauf('odbkHolz', 1, 0, OD_HOLZ) + odKugel('odbkRolle', [[0, '#d88a5a'], [.6, '#a3562f'], [1, '#5e2c14']]) + '</defs>' +
    /* Beine (hinten dunkler) und Zarge */
    [[274, '#3e2614'], [520, '#3e2614']].map(([x, f]) => '<rect x="' + x + '" y="106" width="6" height="20" rx="2" fill="' + f + '"/>').join('') +
    [262, 532].map((x) => '<path d="M' + x + ' 106 h8 l -1 6 q 2 3 0 6 l -1 6 q -2 2 -4 0 l -1 -6 q -2 -3 0 -6 z" fill="url(#odbkHolz)"/><ellipse cx="' + (x + 4) + '" cy="126.6" rx="3.4" ry="1.2" fill="#2a1a0c"/>').join('') +
    '<rect x="258" y="100" width="284" height="9" rx="2" fill="url(#odbkHolz)"/><path d="M260 100.8 H540" stroke="rgba(255,230,190,.45)" stroke-width=".8"/>' +
    '<path d="M384 109 q 16 6 32 0" fill="none" stroke="#5e3c1e" stroke-width="1.6"/>' +
    /* Rueckenpolster mit Rautenheftung */
    '<path d="M264 92 L 264 70 C 264 60 280 57 300 57 L 500 57 C 520 57 536 60 536 70 L 536 92 Z" fill="url(#odbkSamt)"/>' +
    '<path d="M268 62 C 280 58.4 300 58 320 58 L 480 58 C 500 58 520 58.4 532 62" fill="none" stroke="rgba(255,210,180,.45)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<g fill="none" stroke="rgba(70,25,8,.35)" stroke-width=".8">' + knoepfe.map(([x, y]) => (y < 75 ? '<path d="M' + x + ' ' + y + ' L ' + (x + 16) + ' ' + (y + 11) + ' M' + x + ' ' + y + ' L ' + (x - 16) + ' ' + (y + 11) + ' M' + x + ' ' + y + ' V 58"/>' : '<path d="M' + x + ' ' + y + ' V 92"/>')).join('') + '</g>' +
    knoepfe.map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.8" fill="#5e2c14"/><circle cx="' + (x - .5) + '" cy="' + (y - .6) + '" r=".6" fill="rgba(255,200,170,.6)"/>').join('') +
    /* Sitzkissen mit Keder */
    '<path d="M258 92 C 258 88 262 87 268 87 L 532 87 C 538 87 542 88 542 92 L 542 98 C 542 101 538 102 532 102 L 268 102 C 262 102 258 101 258 98 Z" fill="url(#odbkSitz)"/>' +
    '<path d="M260 91 C 262 88.6 266 88.4 270 88.4 L 530 88.4 C 534 88.4 538 88.6 540 91" fill="none" stroke="rgba(255,220,190,.5)" stroke-width="1"/>' +
    '<path d="M259 98.6 C 262 101 266 101.2 270 101.2 L 530 101.2 C 534 101.2 538 101 541 98.6" fill="none" stroke="#5e2c14" stroke-width="1.2"/>' +
    '<path d="M400 88 V 101" stroke="rgba(70,25,8,.25)" stroke-width=".8"/>' +
    /* Rollarmlehnen mit Schneckenstirn */
    [[256, 1], [544, -1]].map(([x, d]) => '<path d="M' + (x - 10 * d) + ' 100 L ' + (x - 10 * d) + ' 74 C ' + (x - 10 * d) + ' 66 ' + (x + 10 * d) + ' 66 ' + (x + 10 * d) + ' 74 L ' + (x + 10 * d) + ' 100 Z" fill="url(#odbkSamt)"/>' +
      '<ellipse cx="' + x + '" cy="74" rx="9.6" ry="7.6" fill="url(#odbkRolle)"/><path d="M' + x + ' 74 m -5 0 a 5 4 0 1 1 5 4 a 3 2.4 0 1 1 -3 -2.4" fill="none" stroke="rgba(70,25,8,.45)" stroke-width=".8"/>' +
      '<path d="M' + (x - 7 * d) + ' 70 q ' + (4 * d) + ' -3 ' + (9 * d) + ' -1" fill="none" stroke="rgba(255,210,180,.5)" stroke-width="1" stroke-linecap="round"/>').join('');
}

/* ===================== Antippen: Teilchen und Klang (5.66) =====================
   Zu jeder Tipp-Animation (CSS, „ot-…“) ein kleiner Effekt am Ding: Dampf aus
   der Tasse, ein Tintentropfen, Kruemel, Spaene, Noten aus dem Horn, Klingel-
   wellen am Telefon, ein Blatt, das faellt. Nur mit Gestaltung v2 und deren
   Bewegungsschalter, nie bei „Bewegung reduzieren“. Die Teilchen liegen in
   einer eigenen Gruppe obenauf, ohne Zeiger, und raeumen sich selbst weg. */
const ORTE_FUNKEN = {
  tasse: 'dampf', tinte: 'tinte', keks: 'krumen', spitzer: 'spaene', saege: 'spaene', stummel: 'spaene',
  horn: 'noten', huellen: 'noten', metronom: 'noten', telefon: 'ringe', uhr: 'ringe', kerze: 'funken', hammer: 'funken',
  stempel: 'stempel', pflanze: 'blatt', kraut: 'blatt', blatt: 'blatt', zweig: 'schnee', bluete: 'blueten', strohhut: 'sonne',
  schirm: 'regen', briefe: 'herz', block: 'herz', faden: 'herz', bank: 'staub', schuhe: 'staub', buecher: 'staub', mantel: 'regen',
  schreibmaschine: 'buchstaben', letter: 'buchstaben', andruck: 'buchstaben', fueller: 'tinte', flieger: 'wind'
};
const ORTE_TIPPKLANG = {
  uhr: 'glocke', schreibmaschine: 'glocke', telefon: 'klingel', schluessel: 'klimpern', stempel: 'tock', hammer: 'tock', andruck: 'tock',
  horn: 'ton', metronom: 'tock', faden: 'zupf', saege: 'zupf', letter: 'klimpern', zange: 'klimpern', glas: 'glocke', kerze: 'hauch'
};
function orteFunkenAn() {
  const h = document.documentElement;
  if (h.dataset.v2 !== 'an' || h.dataset.v2bewegung !== 'an') return false;
  try { return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return true; }
}
function orteFunken(ding) {
  const name = ding.dataset.tipp, art = ORTE_FUNKEN[name] || 'funkeln';
  if (!orteFunkenAn()) return 0;
  const svg = ding.ownerSVGElement; if (!svg) return 0;
  let bb; try { bb = ding.getBBox(); } catch (e) { return 0; }
  if (!bb || !bb.width) return 0;
  /* Wer wild tippt, bekommt nicht unendlich viele Teilchen. */
  const alt = svg.querySelector('g.ot-funken'); if (alt && alt.childElementCount > 48) return 0;
  let lage = svg.querySelector('g.ot-funken');
  if (!lage) { lage = document.createElementNS('http://www.w3.org/2000/svg', 'g'); lage.setAttribute('class', 'ot-funken'); lage.setAttribute('pointer-events', 'none'); svg.appendChild(lage); }
  const z = (a, b) => a + Math.random() * (b - a);
  const mx = bb.x + bb.width / 2, oben = bb.y, unten = bb.y + bb.height;
  const teile = [];
  const teil = (x, y, inhalt, dx, dy, dr, opt) => teile.push(Object.assign({ x, y, inhalt, dx, dy, dr }, opt || {}));
  const stern = (x, y, s, f) => '<path d="M' + x + ' ' + (y - s) + 'Q' + x + ' ' + y + ' ' + (x + s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + s) + 'Q' + x + ' ' + y + ' ' + (x - s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - s) + 'z" fill="' + f + '"/>';
  const note = (x, y) => '<ellipse cx="' + x + '" cy="' + y + '" rx="3" ry="2.2" transform="rotate(-20 ' + x + ' ' + y + ')" fill="#f6e6b8"/><path d="M' + (x + 2.6) + ' ' + y + ' v-11 q 4 1.6 4.4 5.4" fill="none" stroke="#f6e6b8" stroke-width="1.2"/>';
  const herz = (x, y, f) => '<path d="M' + x + ' ' + (y + 3) + ' C ' + (x - 5) + ' ' + (y - 1) + ' ' + (x - 3) + ' ' + (y - 5) + ' ' + x + ' ' + (y - 2.4) + ' C ' + (x + 3) + ' ' + (y - 5) + ' ' + (x + 5) + ' ' + (y - 1) + ' ' + x + ' ' + (y + 3) + ' Z" fill="' + f + '"/>';
  const blatt = (x, y, f) => '<path d="M' + x + ' ' + (y - 4) + ' C ' + (x + 4) + ' ' + (y - 2) + ' ' + (x + 3) + ' ' + (y + 3) + ' ' + x + ' ' + (y + 4) + ' C ' + (x - 3) + ' ' + (y + 3) + ' ' + (x - 4) + ' ' + (y - 2) + ' ' + x + ' ' + (y - 4) + ' Z" fill="' + f + '"/><path d="M' + x + ' ' + (y - 3) + ' V' + (y + 3.6) + '" stroke="rgba(0,0,0,.25)" stroke-width=".5"/>';
  const f1 = (v) => v.toFixed(1);
  switch (art) {
    case 'dampf': for (let i = 0; i < 6; i++) { const x = mx + z(-8, 8); teil(x, oben + 4, '<circle cx="' + f1(x) + '" cy="' + f1(oben + 4) + '" r="' + f1(z(2.4, 4.6)) + '" fill="rgba(255,255,255,.55)"/>', z(-6, 6), z(-26, -16), 0, { verz: i * .12, dauer: 1.6 }); } break;
    case 'tinte': for (let i = 0; i < 3; i++) teil(mx, oben + 6, '<path d="M' + f1(mx) + ' ' + f1(oben + 3) + ' q 2.6 3.4 0 5.4 q -2.6 -2 0 -5.4 z" fill="#1e2840"/>', z(-10, 10), z(8, 16), 0, { fall: 1, hoch: z(-14, -8), verz: i * .1 }); break;
    case 'krumen': for (let i = 0; i < 8; i++) teil(mx, oben + bb.height * .4, '<circle cx="' + f1(mx) + '" cy="' + f1(oben + bb.height * .4) + '" r="' + f1(z(.7, 1.6)) + '" fill="' + (i % 3 ? '#c98a3a' : '#5a3a1a') + '"/>', z(-16, 16), z(4, 10), z(-90, 90), { fall: 1, hoch: z(-12, -5) }); break;
    case 'spaene': for (let i = 0; i < 5; i++) teil(mx, oben + bb.height * .5, '<path d="M' + f1(mx) + ' ' + f1(oben + bb.height * .5) + ' c 3 -2 6 0 4 3 c -2 2 -5 1 -4 -1" fill="#e8c892" stroke="#b89040" stroke-width=".4"/>', z(-18, 18), z(4, 12), z(-180, 180), { fall: 1, hoch: z(-14, -6) }); break;
    case 'noten': for (let i = 0; i < 4; i++) { const horn = name === 'horn', x = horn ? 486 : mx, y = horn ? 36 : oben + 6; teil(x, y, note(f1(x), f1(y)), z(10, 34) * (i % 2 ? 1 : .6), z(-34, -18), z(-20, 20), { verz: i * .18, dauer: 1.7 }); } break;
    case 'ringe': for (let i = 0; i < 3; i++) { const y = oben + bb.height * .4; teil(mx, y, '<path d="M' + f1(mx + 6) + ' ' + f1(y - 8) + ' q 6 8 0 16 M' + f1(mx - 6) + ' ' + f1(y - 8) + ' q -6 8 0 16" fill="none" stroke="#fff3d0" stroke-width="1.2" stroke-linecap="round"/>', 0, 0, 0, { wachs: 1, verz: i * .2 }); } break;
    case 'funken': for (let i = 0; i < 9; i++) { const hm = name === 'hammer', x = hm ? 88 : mx, y = hm ? 36 : oben + 4; teil(x, y, '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(z(.6, 1.3)) + '" fill="' + (i % 2 ? '#ffd27a' : '#fff4d0') + '"/>', z(-16, 16), z(-20, 4), 0, { dauer: z(.7, 1.1), verz: hm ? .3 : 0 }); } break;
    case 'stempel': teil(120, 46, '<g transform="rotate(-6 120 46)"><rect x="100" y="39" width="40" height="13" rx="2" fill="none" stroke="#8a1c12" stroke-width="1.2" opacity=".8"/><text x="120" y="48.6" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-weight="700" font-size="6.4" letter-spacing=".5" fill="#8a1c12" opacity=".8">NOTIERT</text></g>', 0, 0, 0, { bleib: 1, dauer: 1.8, verz: .25 }); break;
    case 'blatt': for (let i = 0; i < 3; i++) { const x = mx + z(-10, 10), y = oben + 6; teil(x, y, blatt(f1(x), f1(y), i % 2 ? '#5a8a52' : (name === 'blatt' ? '#c8642a' : '#4a7a46')), z(-16, 16), z(22, 40), z(-200, 200), { verz: i * .15, dauer: 1.8, sanft: 1 }); } break;
    case 'blueten': for (let i = 0; i < 4; i++) { const x = mx + z(-8, 8), y = oben + 8; teil(x, y, '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="2" ry="2.8" fill="' + (i % 2 ? '#f2bccb' : '#e9a9b8') + '"/>', z(-20, 20), z(20, 36), z(-200, 200), { verz: i * .12, dauer: 1.8, sanft: 1 }); } break;
    case 'schnee': for (let i = 0; i < 6; i++) { const x = mx + z(-12, 12), y = oben + z(0, 10); teil(x, y, stern(f1(x), f1(y), 1.6, '#ffffff'), z(-8, 8), z(18, 34), z(-90, 90), { verz: i * .1, dauer: 1.8, sanft: 1 }); } break;
    case 'sonne': for (let i = 0; i < 5; i++) { const x = mx + z(-14, 14), y = oben + z(0, 8); teil(x, y, stern(f1(x), f1(y), 2.6, '#fff1b0'), 0, z(-10, -4), 0, { verz: i * .12 }); } break;
    case 'regen': for (let i = 0; i < 5; i++) { const x = mx + z(-6, 6), y = unten - bb.height * .6; teil(x, y, '<path d="M' + f1(x) + ' ' + f1(y) + ' q 2 2.6 0 4.2 q -2 -1.6 0 -4.2 z" fill="#8fb6e0"/>', z(-4, 4), z(14, 26), 0, { fall: 1, hoch: z(-4, 0), verz: i * .12 }); } break;
    case 'herz': for (let i = 0; i < 3; i++) { const x = mx + z(-10, 10), y = oben + 4; teil(x, y, herz(f1(x), f1(y), i % 2 ? '#d9534f' : '#c0392b'), z(-8, 8), z(-26, -14), z(-20, 20), { verz: i * .16, dauer: 1.6 }); } break;
    case 'staub': for (let i = 0; i < 7; i++) { const x = mx + z(-bb.width / 2, bb.width / 2), y = unten - 2; teil(x, y, '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(z(1.2, 2.6)) + '" fill="rgba(240,225,200,.45)"/>', z(-8, 8), z(-12, -4), 0, { dauer: 1.2 }); } break;
    case 'buchstaben': for (let i = 0; i < 4; i++) { const x = mx + z(-20, 20), y = oben + 8; teil(x, y, '<text x="' + f1(x) + '" y="' + f1(y) + '" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-weight="700" font-size="8" fill="#f3e7c9">' + 'VANI'[i] + '</text>', z(-10, 10), z(-26, -14), z(-30, 30), { verz: i * .1, dauer: 1.4 }); } break;
    case 'wind': for (let i = 0; i < 3; i++) { const y = oben + 6 + i * 6; teil(mx - 20, y, '<path d="M' + f1(mx - 20) + ' ' + f1(y) + ' q 12 -4 24 0 t 24 0" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1" stroke-linecap="round"/>', 40, 0, 0, { verz: i * .1, dauer: 1 }); } break;
    default: for (let i = 0; i < 5; i++) { const x = mx + z(-bb.width / 2, bb.width / 2), y = oben + z(0, bb.height * .6); teil(x, y, stern(f1(x), f1(y), f1(z(2, 3.6)), '#fff6dc'), 0, z(-6, -2), 0, { verz: i * .09, dauer: 1 }); }
  }
  const ns = 'http://www.w3.org/2000/svg';
  for (const t of teile) {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'ot-teil' + (t.fall ? ' ot-fall' : '') + (t.wachs ? ' ot-wachs' : '') + (t.bleib ? ' ot-bleib' : '') + (t.sanft ? ' ot-sanft' : ''));
    g.style.cssText = 'transform-origin:' + f1(t.x) + 'px ' + f1(t.y) + 'px;--dx:' + f1(t.dx || 0) + 'px;--dy:' + f1(t.dy || 0) + 'px;--dr:' + Math.round(t.dr || 0) + 'deg;--hoch:' + f1(t.hoch || -8) + 'px;animation-delay:' + (t.verz || 0).toFixed(2) + 's;animation-duration:' + (t.dauer || 1.2).toFixed(2) + 's';
    try { g.insertAdjacentHTML('beforeend', t.inhalt); } catch (e) { continue; }
    lage.appendChild(g);
    setTimeout(() => g.remove(), ((t.dauer || 1.2) + (t.verz || 0)) * 1000 + 150);
  }
  return teile.length;
}
/* Kleine Klaenge zum Antippen — nur wenn die Kulissen Geraeusche machen duerfen. */
function orteTon(name) {
  const art = ORTE_TIPPKLANG[name]; if (!art) return false;
  try {
    if (typeof holeAudio !== 'function' || begrenze(D.einst.lautstaerke, 0, 1, .5) <= 0) return false;
    const a = holeAudio(); if (!a || !a.ctx || !a.master) return false;
    const t0 = a.ctx.currentTime;
    const ton = (f, start, dauer, laut, typ, f2) => {
      const o = a.ctx.createOscillator(), g = a.ctx.createGain();
      o.type = typ || 'sine'; o.frequency.setValueAtTime(f, t0 + start); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + start + dauer);
      g.gain.setValueAtTime(.0001, t0 + start); g.gain.exponentialRampToValueAtTime(laut, t0 + start + .006); g.gain.exponentialRampToValueAtTime(.0001, t0 + start + dauer);
      o.connect(g); g.connect(a.master); o.start(t0 + start); o.stop(t0 + start + dauer + .02);
    };
    if (art === 'glocke') { ton(2093, 0, 1.1, .05); ton(4186, 0, .5, .015); ton(2637, .002, .9, .02); }
    else if (art === 'klingel') { for (let i = 0; i < 6; i++) { ton(1320, i * .07, .06, .035, 'triangle'); ton(1568, i * .07 + .035, .06, .03, 'triangle'); } }
    else if (art === 'klimpern') { [3520, 4186, 3136, 3951].forEach((f, i) => ton(f, i * .045 + Math.random() * .02, .18, .018, 'triangle')); }
    else if (art === 'tock') { ton(420, 0, .07, .08, 'sine', 160); }
    else if (art === 'zupf') { ton(330, 0, .5, .05, 'triangle', 326); ton(660, 0, .3, .015, 'sine'); }
    else if (art === 'ton') { [262, 330, 392].forEach((f, i) => ton(f, i * .14, .5, .035, 'triangle')); }
    else if (art === 'hauch') { ton(180, 0, .25, .02, 'sine', 120); }
    return true;
  } catch (e) { return false; }
}

/* Die Dielenuhr geht weiter, solange die Diele offen ist (frueher standen Stunden- und Minutenzeiger still). */
function orteUhrStellen(wrap, jetzt) {
  const d = jetzt || new Date(), h = d.getHours(), m = d.getMinutes();
  const setze = (kl, len, w) => { const l = wrap.querySelector('.' + kl); if (l) { l.setAttribute('x2', (700 + len * Math.sin(w)).toFixed(2)); l.setAttribute('y2', (30 - len * Math.cos(w)).toFixed(2)); } };
  setze('ort-stunde', 7.4, (h % 12 + m / 60) * Math.PI / 6); setze('ort-minute', 11, m * Math.PI / 30);
  const uhr = wrap.querySelector('.ort-tipp[data-tipp="uhr"]'); if (uhr) uhr.dataset.sag = 'Tick. Die Uhr geht richtig — ' + h + ':' + String(m).padStart(2, '0') + '.';
}
function orteUhrLaufen(wrap) {
  const t = setInterval(() => { if (!wrap.isConnected) { clearInterval(t); return; } orteUhrStellen(wrap); }, 20000);
  return t;
}
