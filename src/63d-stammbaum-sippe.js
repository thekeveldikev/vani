/* ===================================================================
   DIE SIPPE: VERWANDTSCHAFT, WEGE, HÄUSER
   -------------------------------------------------------------------
   Ein Stammbaum weiß bisher, WER mit wem verbunden ist. Er weiß nicht,
   WIE. Das ist der Unterschied zwischen einem Netz und einer Familie:
   „Alma und Nora sind über drei Fäden verbunden“ hilft niemandem —
   „Alma ist Noras Urgroßmutter“ schon.

   Deutsch ist darin genauer als die meisten Sprachen: Großtante, Neffe
   zweiten Grades, Schwippschwägerin. Das alles ist ausrechenbar, wenn
   man den Weg über den nächsten gemeinsamen Vorfahren kennt.
   =================================================================== */

/* ----- Das Geschlecht -----
   Nur für die Wörter. Wer es nicht angibt, bekommt beide Formen
   („Tante oder Onkel“) — geraten wird nichts, auch nicht am Namen. */
const TEPPICH_GESCHLECHTER = [
  ['', 'Nicht gesagt'],
  ['w', 'Weiblich'],
  ['m', 'Männlich'],
  ['d', 'Anders oder beides']
];
const TEPPICH_GESCHLECHT_IDS = TEPPICH_GESCHLECHTER.map((g) => g[0]);

/* Ein Wortpaar nach Geschlecht auflösen.
   Wer nichts angibt, bekommt die NEUTRALE Form, wo das Deutsche eine
   hergibt — „Elternteil“, „Enkelkind“, „Geschwisterteil“. Das ist keine
   Vermutung, sondern die richtige Auskunft: mehr weiß der Teppich nicht.
   Wo es keine neutrale Form gibt („Tante“, „Onkel“), stehen beide da;
   „Kim ist Tonis Mutter oder Vater“ wäre sonst der Satz gewesen, obwohl
   „Elternteil“ danebensteht und passt. */
function sippeWort(geschlecht, weiblich, maennlich, neutral) {
  if (geschlecht === 'w') return weiblich;
  if (geschlecht === 'm') return maennlich;
  if (geschlecht === 'd' && neutral) return neutral;
  if (neutral) return neutral;
  return weiblich + ' oder ' + maennlich;
}

const SIPPE_ORDNUNGSZAHL = ['nullten', 'ersten', 'zweiten', 'dritten', 'vierten', 'fünften',
  'sechsten', 'siebten', 'achten', 'neunten', 'zehnten'];
function sippeOrdnung(n) { return SIPPE_ORDNUNGSZAHL[n] || (n + '.'); }

const SIPPE_MALE = ['', 'einmal', 'zweimal', 'dreimal', 'viermal', 'fünfmal', 'sechsmal'];
function sippeMale(n) { return SIPPE_MALE[n] || (n + '-mal'); }

/* „Ur“, „Urur“, „Ururur“ … */
function sippeUr(wieOft) { return 'Ur'.repeat(Math.max(0, wieOft)); }

/* ----- Die Blutsverwandtschaft -----
   Der Weg nach oben: alle Vorfahren mit ihrem Abstand. Über die
   LÄNGSTE Kette zu rechnen wäre falsch — gesucht ist der kürzeste Weg
   zum gemeinsamen Vorfahren, denn der bestimmt den Grad. */
function sippeVorfahren(baum, id, eltern) {
  const karte = eltern || teppichEltern(baum);
  const weit = new Map([[id, 0]]);
  const ziehWeg = new Set();
  let rand = [id];
  let tiefe = 0;
  while (rand.length && tiefe < 40) {
    tiefe++;
    const naechste = [];
    for (const p of rand) {
      for (const e of karte.get(p) || []) {
        if (weit.has(e)) continue;
        weit.set(e, tiefe);
        naechste.push(e);
      }
    }
    rand = naechste;
  }
  return { weit, ziehWeg };
}

/* Läuft der Weg von `id` nach oben über eine Ziehelternschaft?
   Dann ist es eine Zieh- oder Stiefverwandtschaft, kein Blut. */
function sippeUeberZieh(baum, von, nach) {
  /* Wer selbst der gemeinsame Vorfahre ist, hat keinen Weg dorthin — und
     schon gar keinen über eine Ziehelternschaft. Ohne diese Zeile stand
     hinter JEDER Verwandtschaft „(über eine Ziehelternschaft)“. */
  if (von === nach) return false;
  const nurBlut = new Map();
  for (const p of baum.leute) nurBlut.set(p.id, []);
  for (const f of baum.faeden) {
    if (f.art !== 'kind') continue;
    const l = nurBlut.get(f.von);
    if (l && !l.includes(f.zu)) l.push(f.zu);
  }
  /* Erreicht man `nach` auch ohne Ziehfäden? */
  const gesehen = new Set([von]);
  let rand = [von], tiefe = 0;
  while (rand.length && tiefe++ < 40) {
    const naechste = [];
    for (const p of rand) {
      for (const e of nurBlut.get(p) || []) {
        if (e === nach) return false;
        if (gesehen.has(e)) continue;
        gesehen.add(e);
        naechste.push(e);
      }
    }
    rand = naechste;
  }
  return true;
}

/* Der nächste gemeinsame Vorfahre und die beiden Abstände dorthin. */
function sippeGemeinsam(baum, aId, bId, eltern) {
  const a = sippeVorfahren(baum, aId, eltern).weit;
  const b = sippeVorfahren(baum, bId, eltern).weit;
  let beste = null, summe = Infinity;
  for (const [p, auf] of a) {
    const ab = b.get(p);
    if (ab == null) continue;
    /* Der nächste gemeinsame Vorfahre: die kleinste Summe, bei Gleichstand
       der mit dem kleineren größeren Abstand. */
    const s = auf + ab;
    if (s < summe || (s === summe && beste && Math.max(auf, ab) < Math.max(beste.auf, beste.ab))) {
      summe = s;
      beste = { id: p, auf, ab };
    }
  }
  return beste;
}

/* ----- Das Wort für die Blutsverwandtschaft -----
   `auf` = Schritte von A hinauf zum gemeinsamen Vorfahren,
   `ab`  = Schritte von B hinauf zum selben Vorfahren.
   Gefragt ist immer: Was ist B für A? */
function sippeBlutwort(auf, ab, geschlechtB) {
  const g = geschlechtB;

  /* B ist ein Vorfahre von A. */
  if (ab === 0) {
    if (auf === 1) return sippeWort(g, 'Mutter', 'Vater', 'Elternteil');
    if (auf === 2) return sippeWort(g, 'Großmutter', 'Großvater', 'Großelternteil');
    if (auf <= 6) {
      const ur = sippeUr(auf - 2);
      return sippeWort(g, ur + 'großmutter', ur + 'großvater', ur + 'großelternteil');
    }
    return sippeWort(g, 'Vorfahrin', 'Vorfahr', 'Vorfahre') + ' in der ' + sippeOrdnung(auf) + ' Generation';
  }

  /* B ist ein Nachfahre von A. */
  if (auf === 0) {
    if (ab === 1) return sippeWort(g, 'Tochter', 'Sohn', 'Kind');
    if (ab === 2) return sippeWort(g, 'Enkelin', 'Enkel', 'Enkelkind');
    if (ab <= 6) {
      const ur = sippeUr(ab - 2);
      return sippeWort(g, ur + 'enkelin', ur + 'enkel', ur + 'enkelkind');
    }
    return sippeWort(g, 'Nachfahrin', 'Nachfahre', 'Nachfahre') + ' in der ' + sippeOrdnung(ab) + ' Generation';
  }

  /* Geschwister. */
  if (auf === 1 && ab === 1) return sippeWort(g, 'Schwester', 'Bruder', 'Geschwisterteil');

  /* B steht eine Ebene über A: Tante, Großtante, Urgroßtante … */
  if (ab === 1) {
    const ur = auf >= 3 ? sippeUr(auf - 3) + 'groß' : '';
    if (auf === 2) return sippeWort(g, 'Tante', 'Onkel');
    return sippeWort(g, ur + 'tante', ur + 'onkel').replace(/^([a-zäöü])/, (m) => m.toUpperCase());
  }

  /* B steht eine Ebene unter A: Nichte, Großnichte … */
  if (auf === 1) {
    if (ab === 2) return sippeWort(g, 'Nichte', 'Neffe');
    const ur = sippeUr(ab - 3) + 'groß';
    return (sippeWort(g, ur + 'nichte', ur + 'neffe')).replace(/^([a-zäöü])/, (m) => m.toUpperCase());
  }

  /* Sonst: Cousine und Cousin, mit Grad und Versatz. */
  const grad = Math.min(auf, ab) - 1;
  const versatz = Math.abs(auf - ab);
  const wort = sippeWort(g, 'Cousine', 'Cousin', null);
  const kern = wort + ' ' + sippeOrdnung(grad) + ' Grades';
  return versatz ? kern + ', ' + sippeMale(versatz) + ' entfernt' : kern;
}

/* ----- Angeheiratet -----
   Was nicht über Blut geht, geht oft über einen Bund. Dafür braucht es
   keine eigene Rechnung, sondern nur den Umweg über die Partner. */
function sippeAngeheiratet(baum, aId, bId, eltern, paare) {
  const P = paare || teppichPaare(baum);
  const partnerA = P.get(aId) || [];
  const partnerB = P.get(bId) || [];
  const holen = (id) => baum.leute.find((p) => p.id === id);
  const gB = (holen(bId) || {}).geschlecht || '';

  /* B ist mit A zusammen. */
  if (partnerA.includes(bId)) {
    const faden = baum.faeden.find((f) =>
      ((f.von === aId && f.zu === bId) || (f.von === bId && f.zu === aId)) &&
      fadenArt(f.art, baum).paar);
    const art = faden ? faden.art : 'paar';
    if (art === 'heirat') return { wort: sippeWort(gB, 'Ehefrau', 'Ehemann', null), ueber: null, blut: false };
    if (art === 'verlobt') return { wort: sippeWort(gB, 'Verlobte', 'Verlobter', 'verlobt mit'), ueber: null, blut: false };
    return { wort: sippeWort(gB, 'Gefährtin', 'Gefährte', 'zusammen mit'), ueber: null, blut: false };
  }

  /* B ist mit einem Blutsverwandten von A zusammen. */
  for (const partner of partnerB) {
    const g = sippeGemeinsam(baum, aId, partner, eltern);
    if (!g) continue;
    const wort = sippeBlutwort(g.auf, g.ab, (holen(partner) || {}).geschlecht || '');
    /* Die geläufigen Fälle bekommen ihr eigenes Wort. */
    if (g.auf === 1 && g.ab === 1) return { wort: sippeWort(gB, 'Schwägerin', 'Schwager'), ueber: partner, blut: false };
    if (g.auf === 0 && g.ab === 1) return { wort: sippeWort(gB, 'Schwiegertochter', 'Schwiegersohn', 'Schwiegerkind'), ueber: partner, blut: false };
    /* Der Partner ist ein Elternteil von A: dann ist B der Stiefvater
       beziehungsweise die Stiefmutter. Diese Richtung fehlte, und heraus
       kam „angeheiratet — mutter von von“. */
    if (g.auf === 1 && g.ab === 0) {
      return { wort: sippeWort(gB, 'Stiefmutter', 'Stiefvater', 'Stiefelternteil'), ueber: partner, blut: false };
    }
    return { wort, ueber: partner, blut: false, umweg: true };
  }

  /* B ist blutsverwandt mit einem Partner von A. */
  for (const partner of partnerA) {
    const g = sippeGemeinsam(baum, partner, bId, eltern);
    if (!g) continue;
    void g;
    if (g.auf === 1 && g.ab === 0) return { wort: sippeWort(gB, 'Schwiegermutter', 'Schwiegervater', 'Schwiegerelternteil'), ueber: partner, blut: false };
    if (g.auf === 1 && g.ab === 1) return { wort: sippeWort(gB, 'Schwägerin', 'Schwager'), ueber: partner, blut: false };
    if (g.auf === 0 && g.ab === 1) return { wort: sippeWort(gB, 'Stieftochter', 'Stiefsohn', 'Stiefkind'), ueber: partner, blut: false };
    const wort = sippeBlutwort(g.auf, g.ab, gB);
    return { wort: wort + ' — über ' + (teppichName(holen(partner)) || 'die Ehe'), ueber: partner, blut: false };
  }
  return null;
}

/* ----- Die Antwort -----
   Ein Satz, den man vorlesen kann. Das ist der ganze Zweck. */
function teppichVerwandtschaft(baum, aId, bId) {
  if (!baum || aId === bId) return null;
  const holen = (id) => baum.leute.find((p) => p.id === id);
  const A = holen(aId), B = holen(bId);
  if (!A || !B) return null;
  const nameA = teppichName(A), nameB = teppichName(B);

  const eltern = teppichEltern(baum);
  const gemeinsam = sippeGemeinsam(baum, aId, bId, eltern);

  if (gemeinsam) {
    const { auf, ab } = gemeinsam;
    const zieh = sippeUeberZieh(baum, aId, gemeinsam.id) || sippeUeberZieh(baum, bId, gemeinsam.id);
    let wort = sippeBlutwort(auf, ab, B.geschlecht || '');
    let nachsatz = '';
    if (zieh) {
      if (auf === 1 && ab === 1) wort = sippeWort(B.geschlecht || '', 'Ziehschwester', 'Ziehbruder', 'Ziehgeschwister');
      else if (ab === 0 && auf === 1) wort = sippeWort(B.geschlecht || '', 'Ziehmutter', 'Ziehvater', 'Ziehelternteil');
      else if (auf === 0 && ab === 1) wort = sippeWort(B.geschlecht || '', 'Ziehtochter', 'Ziehsohn', 'Ziehkind');
      else nachsatz = ' — über eine Ziehelternschaft';
    }
    return {
      art: zieh ? 'zieh' : 'blut',
      wort, nachsatz,
      ueberId: gemeinsam.id,
      ueber: teppichName(holen(gemeinsam.id)),
      auf, ab,
      /* Der Genitiv liest sich besser als „ist die Großmutter von“ — und
         er ist die Form, in der man so etwas ausspricht. */
      satz: nameB + ' ist ' + genitiv(nameA) + ' ' + wort + nachsatz + '.'
    };
  }

  const ange = sippeAngeheiratet(baum, aId, bId, eltern);
  if (ange) {
    const ueberName = ange.ueber ? teppichName(holen(ange.ueber)) : '';
    return {
      art: 'bund',
      wort: ange.wort,
      ueberId: ange.ueber,
      ueber: ueberName,
      satz: ange.umweg
        ? nameB + ' ist ' + genitiv(ueberName) + ' ' + ange.wort + ' — und damit ' + genitiv(nameA) + ' angeheiratete Verwandtschaft.'
        : nameB + ' ist ' + genitiv(nameA) + ' ' + ange.wort + '.'
    };
  }

  /* Kein Blut, kein Bund — aber vielleicht ein Weg über andere Fäden. */
  const weg = teppichWegZwischen(baum, aId, bId);
  if (weg && weg.schritte.length) {
    return {
      art: 'weg',
      wort: 'nicht verwandt',
      schritte: weg.schritte,
      satz: nameA + ' und ' + nameB + ' sind nicht verwandt, aber über ' +
        (weg.schritte.length === 1 ? 'einen Faden' : weg.schritte.length + ' Fäden') + ' verbunden.'
    };
  }

  return {
    art: 'nichts',
    wort: '',
    satz: nameA + ' und ' + nameB + ' haben nichts miteinander zu tun — noch nicht.'
  };
}

/* „die Großmutter“, „der Onkel“, „das Enkelkind“ — der Artikel gehört
   zum Wort, sonst liest sich der Satz falsch. Bei doppelten Formen
   („Tante oder Onkel“) bleibt er weg. */
function sippeArtikel(wort) {
  if (!wort) return '';
  if (/ oder |^angeheiratet|^nicht |^verheiratet|^verlobt|^zusammen/.test(wort)) return '';
  const w = wort.split(/[ ,]/)[0];
  if (/^(Vater|Bruder|Sohn|Enkel|Ururenkel|Urenkel|Onkel|Neffe|Cousin|Vorfahr|Nachfahre|Großvater|Schwager|Schwiegervater|Stiefsohn|Ziehvater|Ziehsohn|Ziehbruder|Ehemann|Gefährte|Verlobter)$/.test(w) ||
      /(vater|sohn|onkel|neffe|enkel)$/i.test(w)) return 'der ';
  if (/(kind|elternteil|geschwister)$/i.test(w)) return 'das ';
  return 'die ';
}

/* ----- Der Weg zwischen zweien -----
   Nicht nur Verwandtschaft: JEDER Faden zählt. „Nora → ist Kind von →
   Alma → hasst → Bodo“ ist für eine Geschichte oft wichtiger als die
   Frage, ob die drei blutsverwandt sind. */
function teppichWegZwischen(baum, aId, bId, hoechstens) {
  if (!baum || aId === bId) return null;
  const grenze = hoechstens || 8;
  const nachbarn = new Map();
  for (const p of baum.leute) nachbarn.set(p.id, []);
  for (const f of baum.faeden) {
    const a = nachbarn.get(f.von), b = nachbarn.get(f.zu);
    if (a) a.push({ zu: f.zu, faden: f, vorwaerts: true });
    if (b) b.push({ zu: f.von, faden: f, vorwaerts: false });
  }

  /* Breitensuche: der kürzeste Weg ist der, den man erzählen kann. */
  const woher = new Map([[aId, null]]);
  let rand = [aId], tiefe = 0;
  while (rand.length && tiefe++ < grenze) {
    const naechste = [];
    for (const p of rand) {
      for (const n of nachbarn.get(p) || []) {
        if (woher.has(n.zu)) continue;
        woher.set(n.zu, { von: p, faden: n.faden, vorwaerts: n.vorwaerts });
        if (n.zu === bId) { rand = []; naechste.length = 0; break; }
        naechste.push(n.zu);
      }
      if (!rand.length) break;
    }
    if (!rand.length) break;
    rand = naechste;
  }
  if (!woher.has(bId)) return null;

  const schritte = [];
  let hier = bId;
  while (hier !== aId) {
    const w = woher.get(hier);
    if (!w) return null;
    const art = fadenArt(w.faden.art, baum);
    schritte.unshift({
      von: w.von, zu: hier, faden: w.faden,
      wort: w.vorwaerts ? art.name : (art.gegen || art.name),
      vorwaerts: w.vorwaerts
    });
    hier = w.von;
  }
  return { schritte, laenge: schritte.length };
}

/* Den Weg als Satzkette — vorlesbar, nicht als Datenstruktur. */
function teppichWegSatz(baum, weg) {
  if (!weg || !weg.schritte.length) return '';
  const holen = (id) => baum.leute.find((p) => p.id === id);
  const teile = [];
  for (const s of weg.schritte) {
    teile.push(teppichName(holen(s.von)) + ' — ' + s.wort.toLowerCase() + ' — ');
  }
  return teile.join('') + teppichName(holen(weg.schritte[weg.schritte.length - 1].zu));
}

/* ===================== DIE HÄUSER =====================
   Ein Stammbaum zerfällt von selbst in Sippen: Gruppen, die über Blut
   zusammenhängen und mit keiner anderen Gruppe durch Blut verbunden
   sind. Jede bekommt einen Namen — den häufigsten Nachnamen darin —
   und ein Wappen, gerechnet aus diesem Namen.

   Das Wappen kommt vom Kartentisch: dieselbe Heraldik, dieselbe
   Schraffur. Zwei Werkzeuge, ein Haus. */
function teppichHaeuser(baum) {
  const eltern = teppichEltern(baum);
  const kinder = teppichKinder(baum);
  const paare = teppichPaare(baum);

  const gesehen = new Set();
  const haeuser = [];
  for (const p of baum.leute) {
    if (gesehen.has(p.id)) continue;
    /* Alles einsammeln, was über Blut UND Bund zusammenhängt. */
    const drin = [];
    let rand = [p.id];
    gesehen.add(p.id);
    while (rand.length) {
      const naechste = [];
      for (const id of rand) {
        drin.push(id);
        for (const n of (eltern.get(id) || []).concat(kinder.get(id) || [], paare.get(id) || [])) {
          if (gesehen.has(n)) continue;
          gesehen.add(n);
          naechste.push(n);
        }
      }
      rand = naechste;
    }
    if (drin.length < 2) continue;

    /* Der Name des Hauses: der häufigste letzte Namensteil. */
    const zaehler = new Map();
    for (const id of drin) {
      const person = baum.leute.find((x) => x.id === id);
      const teile = String((person && person.name) || '').trim().split(/\s+/);
      const nach = teile.length > 1 ? teile[teile.length - 1] : '';
      if (!nach) continue;
      zaehler.set(nach, (zaehler.get(nach) || 0) + 1);
    }
    let name = '', beste = 0;
    for (const [n, z] of zaehler) if (z > beste) { beste = z; name = n; }

    haeuser.push({
      id: 'h' + haeuser.length,
      name: name || '',
      leute: drin,
      wieViele: drin.length,
      /* Das Wappen hängt am Namen, nicht an der Reihenfolge: dasselbe
         Haus bekommt in jedem Teppich dasselbe Zeichen. */
      wappen: typeof planWappen === 'function'
        ? planWappen({ saat: 'haus-' + (name || drin.slice().sort()[0]) }, null)
        : null
    });
  }
  haeuser.sort((a, b) => b.wieViele - a.wieViele);
  return haeuser;
}

/* Zu welchem Haus gehört jemand? */
function teppichHausVon(haeuser, id) {
  return (haeuser || []).find((h) => h.leute.includes(id)) || null;
}

/* ===================== DER UMKREIS =====================
   „Zeig mir nur, was um Nora herum passiert.“ Bei vierhundert Leuten
   ist das der Unterschied zwischen einem Teppich und einem Knäuel. */
function teppichUmkreis(baum, id, schritte) {
  const grenze = Math.max(1, Math.min(6, schritte || 2));
  const nachbarn = new Map();
  for (const p of baum.leute) nachbarn.set(p.id, new Set());
  for (const f of baum.faeden) {
    const a = nachbarn.get(f.von), b = nachbarn.get(f.zu);
    if (a) a.add(f.zu);
    if (b) b.add(f.von);
  }
  const weit = new Map([[id, 0]]);
  let rand = [id];
  for (let t = 1; t <= grenze; t++) {
    const naechste = [];
    for (const p of rand) {
      for (const n of nachbarn.get(p) || []) {
        if (weit.has(n)) continue;
        weit.set(n, t);
        naechste.push(n);
      }
    }
    rand = naechste;
    if (!rand.length) break;
  }
  return weit;
}
