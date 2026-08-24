/* ===================================================================
   DER HAFEN, DIE MÜHLE, DIE INSELN, DAS WAPPEN, DIE LEGENDE
   -------------------------------------------------------------------
   Bis hierher hat die Karte eine Stadt und ein Umland. Was ihr fehlte,
   ist das, woran man eine Stadt WIEDERERKENNT: dass sie am Wasser liegt
   und davon lebt; dass ein Rad im Bach steht; dass sie ein Zeichen führt.

   Alles hier ist gerechnet, nicht gewürfelt: dieselbe Saat, derselbe
   Hafen. Und alles hier ist reine Geometrie — gezeichnet wird in
   65b-stadtplan-karte.js.
   =================================================================== */

/* ----- Wo trifft die Stadt auf das Wasser? -----
   Gesucht ist der Uferpunkt, der der Stadtmitte am nächsten liegt, und
   dazu die Richtung, in der das Wasser tiefer wird. Ohne diese Richtung
   liefe jede Mole an Land statt hinaus. */
function planUferAnStadt(wasser, mitte) {
  if (!wasser || wasser.art === 'keins') return null;
  const linie = wasser.art === 'fluss' || wasser.art === 'muendung'
    ? (wasser.links || []).concat(wasser.rechts || [])
    : wasser.art === 'kueste' ? (wasser.linie || [])
      : (wasser.polygone && wasser.polygone[0]) || [];
  if (linie.length < 4) return null;

  let beste = null, nah = Infinity;
  for (let i = 1; i < linie.length - 1; i++) {
    const d = strecke(linie[i], mitte);
    if (d < nah) { nah = d; beste = i; }
  }
  if (beste == null) return null;

  const p = linie[beste];
  const vor = linie[beste - 1], nach = linie[beste + 1];
  const laengs = [nach[0] - vor[0], nach[1] - vor[1]];
  const l = Math.hypot(laengs[0], laengs[1]) || 1;
  const u = [laengs[0] / l, laengs[1] / l];
  /* Die Senkrechte — welche der beiden Seiten ist nass? */
  let n = [-u[1], u[0]];
  if (!wasser.drin(p[0] + n[0] * 14, p[1] + n[1] * 14)) n = [-n[0], -n[1]];
  if (!wasser.drin(p[0] + n[0] * 14, p[1] + n[1] * 14)) return null;

  return { punkt: p, laengs: u, hinaus: n, stelle: beste, linie, abstand: nah };
}

/* ----- Der Hafen -----
   Eine Kaimauer am Ufer, davor Molen, die ins Wasser greifen, und an den
   Molen liegen Schiffe. Dazu Poller, Kräne, ein Wellenbrecher und — wo es
   offenes Wasser gibt — ein Leuchtfeuer auf dem äußersten Kopf.

   Die Länge der Molen richtet sich nach dem Wasser, nicht nach dem Wunsch:
   eine Mole, die auf halber Strecke an Land endet, ist keine Mole. Jede
   wird deshalb so weit hinausgeschoben, wie sie nass bleibt. */
function planHafen(plan, stadt, wasser) {
  const leer = { hat: false, kai: [], molen: [], schiffe: [], poller: [], kraene: [], wellenbrecher: null, leuchtturm: null, name: '' };
  if (!plan.stadt.hafen || !wasser || wasser.art === 'keins') return leer;
  const saat = plan.saat;
  const ufer = planUferAnStadt(wasser, stadt.mitte);
  if (!ufer) return leer;
  /* Zu weit draußen ist kein Stadthafen mehr. */
  if (ufer.abstand > stadt.Rmax * 2.2) return leer;

  const [ux, uy] = ufer.laengs;
  const [nx, ny] = ufer.hinaus;
  const p = ufer.punkt;

  /* Wie weit reicht das Wasser an dieser Stelle? */
  const nassBis = (vonX, vonY, hoechstens) => {
    let weit = 0;
    for (let d = 6; d <= hoechstens; d += 6) {
      if (!wasser.drin(vonX + nx * d, vonY + ny * d)) break;
      weit = d;
    }
    return weit;
  };
  const tiefe = nassBis(p[0], p[1], 260);
  if (tiefe < 26) return leer;

  /* --- Die Kaimauer ---
     Sie folgt dem Ufer, ein Stück nach beiden Seiten, und wird ein wenig
     ins Wasser vorgezogen: ein Kai ist aufgeschüttet, nicht gewachsen. */
  const kaiLaenge = Math.min(stadt.Rmax * 0.62, 190);
  const schritte = 13;
  const kai = [];
  for (let i = 0; i <= schritte; i++) {
    const t = (i / schritte - 0.5) * kaiLaenge;
    const vor = 3 + Math.sin((i / schritte) * Math.PI) * 5;
    kai.push([p[0] + ux * t + nx * vor, p[1] + uy * t + ny * vor]);
  }

  /* --- Die Molen ---
     Drei bis fünf, ungleich lang und ungleich weit auseinander: ein Hafen
     ist über Jahrhunderte gewachsen, nicht an einem Tag gebaut. */
  const wieViele = 3 + (planHash(saat, 'hm') % 3);
  const molen = [], schiffe = [], poller = [];
  for (let m = 0; m < wieViele; m++) {
    const t = ((m + 0.5) / wieViele - 0.5) * kaiLaenge * 0.86;
    const wurzel = [p[0] + ux * t + nx * 6, p[1] + uy * t + ny * 6];
    const wunsch = 34 + planZufall(saat, 'hl' + m) * 58;
    const moeglich = nassBis(wurzel[0], wurzel[1], wunsch + 30);
    const laenge = Math.min(wunsch, moeglich - 8);
    if (laenge < 20) continue;
    /* Eine leichte Schrägstellung — nichts am Hafen steht rechtwinklig. */
    const neigung = planStreu(saat, 'hn' + m) * 0.16;
    const rx = nx * Math.cos(neigung) - ny * Math.sin(neigung);
    const ry = nx * Math.sin(neigung) + ny * Math.cos(neigung);
    const kopf = [wurzel[0] + rx * laenge, wurzel[1] + ry * laenge];
    const breit = 5.5 + planZufall(saat, 'hb' + m) * 3;
    molen.push({ wurzel, kopf, breit, laengs: [rx, ry], quer: [-ry, rx], n: molen.length });

    /* An jede Mole ein bis zwei Schiffe, längsseits vertäut. */
    const wieVieleSchiffe = 1 + (planHash(saat, 'hs' + m) % 2);
    for (let s = 0; s < wieVieleSchiffe; s++) {
      const seite = s % 2 ? 1 : -1;
      const anteil = 0.42 + planZufall(saat, 'ha' + m + '_' + s) * 0.34;
      const an = [wurzel[0] + rx * laenge * anteil, wurzel[1] + ry * laenge * anteil];
      const ab = breit / 2 + 5.5;
      const punkt = [an[0] - ry * ab * seite, an[1] + rx * ab * seite];
      if (!wasser.drin(punkt[0], punkt[1])) continue;
      schiffe.push({
        punkt,
        laengs: [rx, ry],
        laenge: 17 + planZufall(saat, 'hg' + m + s) * 13,
        breite: 5 + planZufall(saat, 'hw' + m + s) * 2.4,
        masten: 1 + (planHash(saat, 'hz' + m + s) % 3),
        n: schiffe.length
      });
    }
    /* Poller auf dem Kopf und in der Mitte. */
    for (const anteil of [0.5, 0.95]) {
      poller.push([wurzel[0] + rx * laenge * anteil, wurzel[1] + ry * laenge * anteil]);
    }
  }
  if (!molen.length) return leer;

  /* --- Die Kräne ---
     Auf dem Kai, zwischen den Molenwurzeln: ein Tretkran, wie er in jeder
     Hansestadt stand. */
  const kraene = [];
  const wieVieleKraene = 1 + (planHash(saat, 'hk') % 2);
  for (let k = 0; k < wieVieleKraene; k++) {
    const t = ((k + 1) / (wieVieleKraene + 1) - 0.5) * kaiLaenge * 0.7;
    kraene.push({
      punkt: [p[0] + ux * t + nx * 2, p[1] + uy * t + ny * 2],
      auslage: [nx, ny],
      hoehe: 13 + planZufall(saat, 'hh' + k) * 4
    });
  }

  /* --- Der Wellenbrecher ---
     Nur, wo es offenes Wasser gibt: an einem Fluss braucht ihn niemand.
     Er liegt vor den Molen und lässt eine Einfahrt frei. */
  let wellenbrecher = null;
  if (wasser.art === 'kueste' || wasser.art === 'muendung') {
    const weit = Math.min(tiefe - 14, 150);
    if (weit > 60) {
      const wb = [];
      for (let i = 0; i <= 10; i++) {
        const t = (i / 10 - 0.5) * kaiLaenge * 1.15;
        const bogen = Math.cos((i / 10 - 0.5) * Math.PI) * 16;
        const raus = weit - bogen;
        const q = [p[0] + ux * t + nx * raus, p[1] + uy * t + ny * raus];
        if (!wasser.drin(q[0], q[1])) { wb.length = 0; break; }
        wb.push(q);
      }
      /* Die Einfahrt: das mittlere Stück fehlt. */
      if (wb.length === 11) wellenbrecher = { links: wb.slice(0, 5), rechts: wb.slice(6) };
    }
  }

  /* --- Das Leuchtfeuer --- */
  let leuchtturm = null;
  if (wellenbrecher) leuchtturm = { punkt: wellenbrecher.rechts[wellenbrecher.rechts.length - 1] };
  else if (molen.length) {
    /* Ein Leuchtfeuer weist den Weg von SEE herein. An einem Binnenfluss
       oder einem See hat es nichts zu suchen — dort steht keins. */
    if (wasser.art === 'kueste' || wasser.art === 'muendung') {
      const weiteste = molen.reduce((a, b) => strecke(b.kopf, stadt.mitte) > strecke(a.kopf, stadt.mitte) ? b : a);
      leuchtturm = { punkt: weiteste.kopf };
    }
  }

  return {
    hat: true, kai, molen, schiffe, poller, kraene, wellenbrecher, leuchtturm,
    name: planHafenname(saat), mitte: p
  };
}

const PLAN_HAFEN_ERST = ['Alter', 'Neuer', 'Tiefer', 'Kleiner', 'Großer', 'Salziger', 'Stiller'];
const PLAN_HAFEN_ZWEIT = ['Hafen', 'Anleger', 'Kai', 'Wall', 'Bollwerk', 'Hafen', 'Kai'];
function planHafenname(saat) {
  return PLAN_HAFEN_ERST[planHash(saat, 'hne') % PLAN_HAFEN_ERST.length] + ' ' +
    PLAN_HAFEN_ZWEIT[planHash(saat, 'hnz') % PLAN_HAFEN_ZWEIT.length];
}

/* ----- Die Mühle -----
   Wo ein Fluss durch die Stadt geht, steht ein Rad darin. Das ist keine
   Verzierung: Getreide mahlt sich nicht von selbst, und deshalb stand an
   jedem Stadtbach eine Mühle. Sie sitzt am Ufer, das Rad im Wasser. */
function planMuehle(plan, stadt, wasser) {
  if (!plan.stadt.muehle) return null;
  if (!wasser || (wasser.art !== 'fluss' && wasser.art !== 'muendung')) return null;
  const saat = plan.saat;
  const seite = planZufall(saat, 'mus') > 0.5 ? wasser.links : wasser.rechts;
  if (!seite || seite.length < 6) return null;

  /* Ein Stück flussauf oder flussab von der Stadt — nicht mitten hinein. */
  let beste = null, bestesMass = Infinity;
  const wunsch = stadt.Rmax * 0.72;
  for (let i = 2; i < seite.length - 2; i++) {
    const d = Math.abs(strecke(seite[i], stadt.mitte) - wunsch);
    if (d < bestesMass) { bestesMass = d; beste = i; }
  }
  if (beste == null) return null;

  const p = seite[beste];
  const vor = seite[beste - 1], nach = seite[beste + 1];
  const l = Math.hypot(nach[0] - vor[0], nach[1] - vor[1]) || 1;
  const u = [(nach[0] - vor[0]) / l, (nach[1] - vor[1]) / l];
  let n = [-u[1], u[0]];
  if (!wasser.drin(p[0] + n[0] * 10, p[1] + n[1] * 10)) n = [-n[0], -n[1]];
  if (!wasser.drin(p[0] + n[0] * 10, p[1] + n[1] * 10)) return null;

  return {
    punkt: [p[0] - n[0] * 7, p[1] - n[1] * 7],     /* das Haus steht trocken */
    rad: [p[0] + n[0] * 6, p[1] + n[1] * 6],       /* das Rad steht nass */
    laengs: u, hinaus: n,
    name: planZufall(saat, 'mun') > 0.5 ? 'Die Mühle' : 'Die alte Mühle'
  };
}

/* ----- Inseln im Fluss -----
   Ein Fluss ohne Insel sieht gezeichnet aus. Eine Insel — eine Werder —
   macht ihn zu einem Fluss, der irgendwo herkommt. */
function planInseln(plan, wasser) {
  if (!plan.stadt.inseln) return [];
  if (!wasser || wasser.art === 'keins' || wasser.art === 'insel') return [];
  const saat = plan.saat;
  const G = PLAN_GROESSE;
  const inseln = [];
  const wieViele = wasser.art === 'see' ? 2 : 3;

  for (let i = 0; i < wieViele; i++) {
    /* Erst die Größe, dann der Platz — nicht andersherum.
       Der erste Versuch verlangte sechsundzwanzig Einheiten Wasser rundum;
       ein Fluss ist aber oft nur vierzig breit, und so bekam ausgerechnet
       der Fluss nie eine Werder. Jetzt wird die Insel so klein gewählt,
       wie das Wasser es hergibt, und erst dann geprüft. */
    let mitte = null, quer = 0;
    const maasse = [[20, 11], [14, 7], [9, 5]];
    for (const [wl, wq] of maasse) {
      for (let versuch = 0; versuch < 40 && !mitte; versuch++) {
        const x = 90 + planZufall(saat, 'ix' + i + '_' + wl + '_' + versuch) * (G - 180);
        const y = 90 + planZufall(saat, 'iy' + i + '_' + wl + '_' + versuch) * (G - 180);
        if (!wasser.drin(x, y)) continue;
        /* Rundherum muss es nass sein — im Abstand der eigenen Größe. */
        const probe = Math.max(wl, wq) * 1.5;
        let frei = true;
        for (let w = 0; w < 10; w++) {
          const a = (w / 10) * Math.PI * 2;
          if (!wasser.drin(x + Math.cos(a) * probe, y + Math.sin(a) * probe)) { frei = false; break; }
        }
        if (!frei) continue;
        if (inseln.some((s) => strecke(s.mitte, [x, y]) < 120)) continue;
        mitte = [x, y]; quer = wq;
      }
      if (mitte) { var langMass = wl; break; }
    }
    if (!mitte) continue;

    /* Ein länglicher Umriss, in Fließrichtung gestreckt. */
    const dreh = planZufall(saat, 'id' + i) * Math.PI;
    const lang = langMass;
    const ecken = [];
    const seiten = 11;
    for (let k = 0; k < seiten; k++) {
      const a = (k / seiten) * Math.PI * 2;
      const r = 0.72 + planZufall(saat, 'ir' + i + '_' + k) * 0.55;
      const ex = Math.cos(a) * lang * r, ey = Math.sin(a) * quer * r;
      ecken.push([
        mitte[0] + ex * Math.cos(dreh) - ey * Math.sin(dreh),
        mitte[1] + ex * Math.sin(dreh) + ey * Math.cos(dreh)
      ]);
    }
    inseln.push({ mitte, ecken, baeume: 2 + (planHash(saat, 'ib' + i) % 3), n: inseln.length });
  }
  return inseln;
}

/* ===================== DAS WAPPEN =====================
   Jede Stadt führt ein Zeichen. Auf einem Kupferstich ist es nicht bunt —
   Farbe konnte der Stecher nicht drucken. Stattdessen gibt es die
   heraldische Schraffur: eine Übereinkunft aus dem 17. Jahrhundert, mit
   der man jede Tinktur an ihrer Strichlage erkennt.

   Das ist der schönste Kniff der ganzen Karte: Das Wappen ist einfarbig
   und trotzdem vollständig lesbar. */
const PLAN_TINKTUREN = [
  { id: 'gold', name: 'Gold', strich: 'punkte' },
  { id: 'silber', name: 'Silber', strich: 'leer' },
  { id: 'rot', name: 'Rot', strich: 'senkrecht' },
  { id: 'blau', name: 'Blau', strich: 'waagerecht' },
  { id: 'gruen', name: 'Grün', strich: 'schraeg' },
  { id: 'schwarz', name: 'Schwarz', strich: 'gitter' },
  { id: 'purpur', name: 'Purpur', strich: 'gegenschraeg' }
];

const PLAN_TEILUNGEN = [
  { id: 'ganz', name: 'ungeteilt' },
  { id: 'pfahl', name: 'gespalten' },
  { id: 'balken', name: 'geteilt' },
  { id: 'schraeg', name: 'schräggeteilt' },
  { id: 'geviert', name: 'geviert' },
  { id: 'spitze', name: 'mit eingebogener Spitze' }
];

/* Die Wappenbilder mit ihrem Geschlecht und ihrer Mehrzahl.
   Ohne diese beiden Angaben geht die Blasonierung im Deutschen nicht auf:
   „belegt mit“ verlangt den Dativ, und der sieht bei „ein Turm“, „eine
   Brücke“ und „drei Anker“ jedes Mal anders aus. Zusammengeklebt kam
   „belegt mit eine Brücke“ heraus. */
const PLAN_WAPPENBILDER = [
  { id: 'turm', wort: 'Turm', geschlecht: 'm', mehrzahl: 'Türme' },
  { id: 'schluessel', wort: 'Schlüssel', geschlecht: 'm', mehrzahl: 'Schlüssel' },
  { id: 'stern', wort: 'Stern', geschlecht: 'm', mehrzahl: 'Sterne' },
  { id: 'fisch', wort: 'Fisch', geschlecht: 'm', mehrzahl: 'Fische' },
  { id: 'eichenblatt', wort: 'Eichenblatt', geschlecht: 'n', mehrzahl: 'Eichenblätter' },
  { id: 'rad', wort: 'Mühlrad', geschlecht: 'n', mehrzahl: 'Mühlräder' },
  { id: 'anker', wort: 'Anker', geschlecht: 'm', mehrzahl: 'Anker' },
  { id: 'mond', wort: 'Halbmond', geschlecht: 'm', mehrzahl: 'Halbmonde' },
  { id: 'krone', wort: 'Krone', geschlecht: 'f', mehrzahl: 'Kronen' },
  { id: 'bruecke', wort: 'Brücke', geschlecht: 'f', mehrzahl: 'Brücken' },
  { id: 'ross', wort: 'Rosskopf', geschlecht: 'm', mehrzahl: 'Rossköpfe' },
  { id: 'lilie', wort: 'Lilie', geschlecht: 'f', mehrzahl: 'Lilien' },
  { id: 'hammer', wort: 'Hammer', geschlecht: 'm', mehrzahl: 'Hämmer' },
  { id: 'aehre', wort: 'Ähre', geschlecht: 'f', mehrzahl: 'Ähren' }
];

/* „ein Turm“, „eine Brücke“, „drei Anker“ — der Werfall. */
function planBildWerfall(id, wieViele) {
  const b = planWappenbild(id);
  if (wieViele > 1) return (wieViele === 2 ? 'zwei ' : 'drei ') + b.mehrzahl;
  return (b.geschlecht === 'f' ? 'eine ' : 'ein ') + b.wort;
}
/* „einem Turm“, „einer Brücke“, „drei Ankern“ — der Wemfall.
   Die Mehrzahl bekommt im Wemfall ein -n, wenn sie nicht schon auf -n
   oder -s endet: Anker → Ankern, aber Brücken → Brücken. */
function planBildWemfall(id, wieViele) {
  const b = planWappenbild(id);
  if (wieViele > 1) {
    const m = b.mehrzahl;
    const gebeugt = /[ns]$/.test(m) ? m : m + 'n';
    return (wieViele === 2 ? 'zwei ' : 'drei ') + gebeugt;
  }
  return (b.geschlecht === 'f' ? 'einer ' : 'einem ') + b.wort;
}

function planTinktur(id) { return PLAN_TINKTUREN.find((t) => t.id === id) || PLAN_TINKTUREN[1]; }
function planWappenbild(id) { return PLAN_WAPPENBILDER.find((b) => b.id === id) || PLAN_WAPPENBILDER[0]; }
/* Der schlichte Name fuer Listen und Auswahlfelder. */
function planWappenbildName(id) { const b = planWappenbild(id); return (b.geschlecht === 'f' ? 'Die ' : b.geschlecht === 'n' ? 'Das ' : 'Der ') + b.wort; }

/* Das Wappen wird aus der Saat gerechnet — mit einer Regel, die seit dem
   Mittelalter gilt: Farbe auf Metall oder Metall auf Farbe, nie Farbe auf
   Farbe. Ohne sie sieht ein Wappen falsch aus, auch wenn man nicht sagen
   kann, warum. */
function planWappen(plan, gebaut) {
  const saat = plan.saat;
  if (plan.wappen && plan.wappen.eigen) return plan.wappen;

  const metalle = PLAN_TINKTUREN.filter((t) => t.id === 'gold' || t.id === 'silber');
  const farben = PLAN_TINKTUREN.filter((t) => t.id !== 'gold' && t.id !== 'silber');
  const metallGrund = planZufall(saat, 'wpm') > 0.5;

  const grund = metallGrund
    ? metalle[planHash(saat, 'wpg') % metalle.length]
    : farben[planHash(saat, 'wpg') % farben.length];

  const teilung = PLAN_TEILUNGEN[planHash(saat, 'wpt') % PLAN_TEILUNGEN.length];
  /* Bei einer Teilung braucht die zweite Hälfte eine eigene Tinktur —
     wieder nach derselben Regel. */
  const zweit = metallGrund
    ? farben[planHash(saat, 'wpz') % farben.length]
    : metalle[planHash(saat, 'wpz') % metalle.length];

  /* Die Figur muss sich von BEIDEN Feldern abheben.
     Der erste Versuch nahm nur den Grund als Gegenstück — heraus kam
     „Schräggeteilt von Schwarz und Gold, darin drei Anker in Gold“:
     auf der goldenen Hälfte unsichtbar. Über einer Teilung liegt die
     Figur aber auf beiden Hälften zugleich. */
  const gegenteil = metallGrund ? farben : metalle;
  const uebrig = gegenteil.filter((t) => t.id !== grund.id && t.id !== zweit.id);
  const topf = uebrig.length ? uebrig : PLAN_TINKTUREN.filter((t) => t.id !== grund.id && t.id !== zweit.id);
  const figur = topf[planHash(saat, 'wpf') % topf.length];

  /* Das Bild passt zur Stadt, wo es geht: Hafenstadt → Anker,
     Mühle → Mühlrad, Brücken → Brücke. Sonst frei gewählt. */
  let bildId = null;
  if (gebaut && gebaut.hafen && gebaut.hafen.hat && planZufall(saat, 'wpa') > 0.35) bildId = 'anker';
  else if (gebaut && gebaut.muehle && planZufall(saat, 'wpr') > 0.5) bildId = 'rad';
  else if (gebaut && gebaut.stadt && gebaut.stadt.bruecken && gebaut.stadt.bruecken.length > 1 && planZufall(saat, 'wpb') > 0.6) bildId = 'bruecke';
  else if (gebaut && gebaut.stadt && gebaut.stadt.mauer && planZufall(saat, 'wpu') > 0.62) bildId = 'turm';
  if (!bildId) bildId = PLAN_WAPPENBILDER[planHash(saat, 'wpi') % PLAN_WAPPENBILDER.length].id;

  return {
    eigen: false,
    grund: grund.id,
    zweit: zweit.id,
    figur: figur.id,
    teilung: teilung.id,
    bild: bildId,
    wieViele: 1 + (planHash(saat, 'wpn') % 3)
  };
}

/* Die Blasonierung — die Beschreibung des Wappens in der Sprache, in der
   Wappen seit siebenhundert Jahren beschrieben werden. Sie steht unter
   dem Schild und ist der Beweis, dass hier nichts zufällig ist. */
function planBlason(wappen) {
  const w = wappen || {};
  const grund = planTinktur(w.grund).name;
  const zweit = planTinktur(w.zweit).name;
  const figur = planTinktur(w.figur).name;
  const zahl = Math.max(1, Math.min(3, w.wieViele || 1));
  const werfall = planBildWerfall(w.bild, zahl);
  const wemfall = planBildWemfall(w.bild, zahl);

  const teilung = w.teilung || 'ganz';
  if (teilung === 'ganz') return 'In ' + grund + ' ' + werfall + ' in ' + figur + '.';
  if (teilung === 'pfahl') return 'Gespalten von ' + grund + ' und ' + zweit + ', darin ' + werfall + ' in ' + figur + '.';
  if (teilung === 'balken') return 'Geteilt von ' + grund + ' und ' + zweit + ', darin ' + werfall + ' in ' + figur + '.';
  if (teilung === 'schraeg') return 'Schräggeteilt von ' + grund + ' und ' + zweit + ', darin ' + werfall + ' in ' + figur + '.';
  if (teilung === 'geviert') return 'Geviert von ' + grund + ' und ' + zweit + ', belegt mit ' + wemfall + ' in ' + figur + '.';
  return 'In ' + grund + ' eine eingebogene Spitze in ' + zweit + ', darin ' + werfall + ' in ' + figur + '.';
}


/* ===================== DIE LEGENDE =====================
   Eine Karte ohne Zeichenerklärung ist ein Bild. Mit ihr ist es eine
   Karte: sie behauptet, dass ihre Zeichen etwas bedeuten, und sagt was.

   Aufgenommen wird nur, was auf DIESEM Blatt wirklich vorkommt — eine
   Legende, die Dinge erklärt, die es nicht gibt, ist eine Lüge auf
   Papier. */
function planLegende(plan, gebaut) {
  const eintraege = [];
  const dazu = (zeichen, text) => eintraege.push({ zeichen, text });
  const st = gebaut.stadt;

  if (st.haeuser.some((h) => !h.sonder)) dazu('haus', 'Wohnhaus');
  if (st.haeuser.some((h) => h.gross)) dazu('grosshaus', 'Speicher, Halle');
  if (st.haeuser.some((h) => h.sonder === 'kirche')) dazu('kirche', 'Kirche');
  if (st.burg) dazu('burg', 'Burg');
  if (st.mauer) dazu('mauer', 'Stadtmauer mit Türmen');
  if (st.mauer && st.mauer.tore.length) dazu('tor', 'Stadttor');
  if (st.markt && st.markt.length) dazu('markt', 'Marktplatz');
  if (st.bloecke.some((b) => b.sonder === 'garten')) dazu('garten', 'Garten, Baumhof');
  if (st.bloecke.some((b) => b.sonder === 'friedhof')) dazu('friedhof', 'Friedhof');
  if (st.bruecken.length) dazu('bruecke', 'Brücke');
  if (gebaut.hafen && gebaut.hafen.hat) dazu('hafen', 'Hafen mit Molen');
  if (gebaut.hafen && gebaut.hafen.leuchtturm) dazu('leuchtturm', 'Leuchtfeuer');
  if (gebaut.muehle) dazu('muehle', 'Mühle');
  if (gebaut.wasser.art !== 'keins') dazu('wasser', planWasserwort(gebaut.wasser.art));
  if (gebaut.umland.felder.some((f) => f.gepfluegt)) dazu('acker', 'Acker');
  if (gebaut.umland.felder.some((f) => !f.gepfluegt)) dazu('wiese', 'Wiese, Weide');
  if (gebaut.umland.waelder.length) dazu('wald', 'Wald');
  if (gebaut.umland.hoefe.length) dazu('hof', 'Einzelhof');
  if (gebaut.inseln && gebaut.inseln.length) dazu('insel', 'Werder');

  return eintraege;
}

function planWasserwort(art) {
  return art === 'fluss' ? 'Fluss'
    : art === 'kueste' ? 'Küste, offene See'
      : art === 'see' ? 'See'
        : art === 'muendung' ? 'Mündung'
          : art === 'insel' ? 'Umgebende See'
            : 'Wasser';
}

/* ===================== DER RUNDGANG =====================
   Marken sind einzelne Punkte. Ein Rundgang macht daraus einen Weg: er
   verbindet sie in der Reihenfolge, in der man sie zu Fuß am kürzesten
   abläuft, und sagt, wie lange das dauert.

   Gerechnet wird mit dem Nächsten-Nachbarn-Verfahren und danach einmal
   mit 2-opt geglättet — das genügt für ein Dutzend Punkte vollauf und
   liefert einen Weg, der sich nicht selbst kreuzt. */
function planRundgang(plan, marken) {
  const liste = (marken || []).filter((m) => m && Number.isFinite(m.x) && Number.isFinite(m.y));
  if (liste.length < 2) return { punkte: [], marken: [], laenge: 0, minuten: 0 };

  const rest = liste.slice(1);
  const weg = [liste[0]];
  while (rest.length) {
    const letzter = weg[weg.length - 1];
    let beste = 0, nah = Infinity;
    rest.forEach((m, i) => {
      const d = strecke([letzter.x, letzter.y], [m.x, m.y]);
      if (d < nah) { nah = d; beste = i; }
    });
    weg.push(rest.splice(beste, 1)[0]);
  }

  /* 2-opt: solange sich zwei Stücke durch Umdrehen verkürzen lassen,
     dreh sie um. Ohne das kreuzt der Weg sich selbst, und ein Rundgang,
     der sich kreuzt, sieht nach Irrweg aus.

     Bewertet wird der UNTERSCHIED, nicht die ganze Länge. Der erste Wurf
     rechnete für jedes Paar den kompletten Weg zweimal neu — bei
     vierhundert Marken (so viele erlaubt der Beleg) wären das Milliarden
     Rechenschritte gewesen, jedes Mal, wenn sich die Karte zeichnet. */
  const d = (a, b) => strecke([a.x, a.y], [b.x, b.y]);
  const n = weg.length;
  /* Bei sehr vielen Marken wird das Feinschleifen begrenzt: die ersten
     Durchgänge bringen fast alles, die letzten kosten am meisten. */
  const hoechstens = n > 250 ? 14 : 24;
  let besser = true, runden = 0;
  while (besser && runden++ < hoechstens) {
    besser = false;
    for (let i = 0; i < n - 1; i++) {
      const a = weg[i], b = weg[i + 1];
      for (let j = i + 2; j < n; j++) {
        const c = weg[j], e = weg[(j + 1) % n];
        if (e === a) continue;
        const jetzt = d(a, b) + d(c, e);
        const danach = d(a, c) + d(b, e);
        if (danach < jetzt - 0.01) {
          /* Das Stück zwischen i+1 und j umdrehen. */
          let l = i + 1, r = j;
          while (l < r) { const h = weg[l]; weg[l] = weg[r]; weg[r] = h; l++; r--; }
          besser = true;
        }
      }
    }
  }
  const gesamt = (w) => { let s = 0; for (let i = 1; i < w.length; i++) s += d(w[i - 1], w[i]); return s + d(w[w.length - 1], w[0]); };

  const punkte = weg.map((m) => [m.x, m.y]);
  punkte.push(punkte[0]);
  const laenge = gesamt(weg);
  return {
    punkte, marken: weg, laenge,
    minuten: Math.round(planWegzeit([0, 0], [laenge, 0], 'gasse'))
  };
}

/* ===================== DER MARKT =====================
   Bis hierher war der Marktplatz eine gepflasterte Leerstelle — genau in
   der Mitte der Karte, dort, wo das Auge zuerst hinsieht. Ein Markt ist
   aber das Vollste, was eine Stadt hat: der Brunnen, aus dem alle
   schöpfen, das Rathaus an der Schmalseite, der Pranger daneben und
   dazwischen die Stände. */
function planMarktplatz(plan, stadt) {
  const ecken = stadt.markt;
  if (!ecken || ecken.length < 3) return null;
  const saat = plan.saat;
  const mitte = netzMitte(ecken);
  const flaeche = Math.abs(netzFlaeche(ecken));
  if (flaeche < 900) return null;
  const weite = Math.sqrt(flaeche);

  /* Die längste Kante ist die Schmalseite des Platzes — dort steht das
     Rathaus, mit dem Rücken zur Bebauung. */
  let lang = 0, langI = 0;
  for (let i = 0; i < ecken.length; i++) {
    const l = strecke(ecken[i], ecken[(i + 1) % ecken.length]);
    if (l > lang) { lang = l; langI = i; }
  }
  const a = ecken[langI], b = ecken[(langI + 1) % ecken.length];
  const l = strecke(a, b) || 1;
  const u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  let n = [-u[1], u[0]];
  const kante = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (!netzImPolygon(ecken, kante[0] + n[0] * 5, kante[1] + n[1] * 5)) n = [-n[0], -n[1]];

  const rathaus = {
    punkt: [kante[0] + n[0] * (weite * 0.16), kante[1] + n[1] * (weite * 0.16)],
    laengs: u,
    breite: Math.min(lang * 0.52, weite * 0.46),
    tiefe: Math.min(weite * 0.26, 22)
  };

  /* Der Brunnen steht nicht in der Mitte, sondern etwas abseits — er
     stand immer dort, wo der Boden es hergab. */
  const brunnen = {
    punkt: [
      mitte[0] - n[0] * weite * 0.14 + u[0] * planStreu(saat, 'brx') * weite * 0.12,
      mitte[1] - n[1] * weite * 0.14 + u[1] * planStreu(saat, 'bry') * weite * 0.12
    ],
    gross: weite > 46
  };

  /* Der Pranger: ein Pfahl, nah beim Rathaus. */
  const pranger = planZufall(saat, 'prg') > 0.45 ? {
    punkt: [rathaus.punkt[0] + u[0] * rathaus.breite * 0.72, rathaus.punkt[1] + u[1] * rathaus.breite * 0.72]
  } : null;

  /* Die Stände: kleine Kästen in Reihen, aber nicht in Reih und Glied. */
  const staende = [];
  const reihen = weite > 52 ? 2 : 1;
  for (let r = 0; r < reihen; r++) {
    const wieViele = 3 + (planHash(saat, 'sr' + r) % 4);
    for (let i = 0; i < wieViele; i++) {
      const t = ((i + 0.5) / wieViele - 0.5) * lang * 0.68;
      const ab = weite * (0.16 + r * 0.2) * -1;
      const punkt = [
        mitte[0] + u[0] * t + n[0] * ab + u[0] * planStreu(saat, 'sx' + r + i) * 4,
        mitte[1] + u[1] * t + n[1] * ab + u[1] * planStreu(saat, 'sy' + r + i) * 4
      ];
      if (!netzImPolygon(ecken, punkt[0], punkt[1])) continue;
      staende.push({
        punkt, laengs: u,
        breite: 7 + planZufall(saat, 'sb' + r + i) * 3.5,
        tiefe: 4.5 + planZufall(saat, 'st' + r + i) * 2,
        dreh: planStreu(saat, 'sd' + r + i) * 7
      });
    }
  }

  return { mitte, rathaus, brunnen, pranger, staende, weite };
}
