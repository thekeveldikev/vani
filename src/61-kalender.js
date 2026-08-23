/* ===================== 61 — DER KALENDER =====================
   Auf dem Schreibtisch liegt ein Kalender. Darin steht, was in den
   Geschichten geschieht — Geburten, Tode, Begegnungen, Verluste, Reisen,
   Schwüre. Vieles davon steht in keinem Text; es steht im Kopf. Hier
   bekommt es ein Datum.

   Dieses Modul ist das Rechenwerk und kennt kein DOM. Es rechnet mit
   echten Daten: richtige Monatslängen, richtige Schaltjahre, richtige
   Wochentage, echte Kalenderwochen. Der Bereich reicht von 2000 bis 2050.

   Ein Termin ist ein ganz normales Dokument (typ 'termin'). Damit wandert
   er von selbst in die Sicherung, in den Papierkorb, in die
   Synchronisation — ohne dass hier irgendetwas dafür getan werden muss.

   Das Besondere: Wer ein Geburtsdatum hat, hat ein Alter. Der Kalender
   rechnet es für jeden Tag aus, und er merkt, wenn etwas nicht sein kann —
   wenn jemand vor seiner Geburt auftritt oder nach seinem Tod. */

const KAL_JAHR_VON = 2000;
const KAL_JAHR_BIS = 2050;
const KAL_MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const KAL_MONATE_KURZ = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const KAL_TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const KAL_TAGE_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/* ----- Die Arten. Keine Torten, keine Herzchen: geritzte Zeichen. ----- */
const KAL_ARTEN = [
  { id: 'geburt', name: 'Geburt', kurz: 'geboren', icon: 'keim', farbe: '#7d9a6a', beugt: 'wurde geboren' },
  { id: 'tod', name: 'Tod', kurz: 'gestorben', icon: 'kreuzweg', farbe: '#6b6f78', beugt: 'starb' },
  { id: 'begegnung', name: 'Begegnung', kurz: 'trafen sich', icon: 'zweiwege', farbe: '#b0762f', beugt: 'begegneten sich' },
  { id: 'abschied', name: 'Abschied', kurz: 'Abschied', icon: 'wegfort', farbe: '#8a6a86', beugt: 'nahm Abschied' },
  { id: 'bund', name: 'Bund', kurz: 'Bund', icon: 'ring', farbe: '#a8843c', beugt: 'schloss einen Bund' },
  { id: 'bruch', name: 'Bruch', kurz: 'Bruch', icon: 'riss', farbe: '#9c4a3c', beugt: 'zerbrach' },
  { id: 'reise', name: 'Reise', kurz: 'Reise', icon: 'pfad', farbe: '#4f7d86', beugt: 'brach auf' },
  { id: 'ankunft', name: 'Ankunft', kurz: 'Ankunft', icon: 'schwelle', farbe: '#5d8a6e', beugt: 'kam an' },
  { id: 'wunde', name: 'Wunde', kurz: 'Wunde', icon: 'naht', farbe: '#8f4f4a', beugt: 'wurde verletzt' },
  { id: 'fund', name: 'Fund', kurz: 'Fund', icon: 'stein', farbe: '#7a7d4a', beugt: 'fand' },
  { id: 'verlust', name: 'Verlust', kurz: 'Verlust', icon: 'leer', farbe: '#6a6560', beugt: 'verlor' },
  { id: 'schwur', name: 'Schwur', kurz: 'Schwur', icon: 'siegel', farbe: '#7b5ea7', beugt: 'schwor' },
  { id: 'geheimnis', name: 'Geheimnis', kurz: 'Geheimnis', icon: 'schloss', farbe: '#4a5a7d', beugt: 'verschwieg' },
  { id: 'wende', name: 'Wende', kurz: 'Wende', icon: 'scheide', farbe: '#b06a2f', beugt: 'wendete sich' },
  { id: 'brief', name: 'Brief', kurz: 'Brief', icon: 'faltung', farbe: '#8a7a5e', beugt: 'schrieb' },
  { id: 'ereignis', name: 'Ereignis', kurz: 'Ereignis', icon: 'punktkreis', farbe: '#8a7f70', beugt: 'geschah' }
];
const KAL_ART_IDS = KAL_ARTEN.map((a) => a.id);
function kalArt(id) { return KAL_ARTEN.find((a) => a.id === id) || KAL_ARTEN[KAL_ARTEN.length - 1]; }

/* ----- Datum: Zeichenkette 'JJJJ-MM-TT'. Kürzer heißt ungenauer. ----- */
/* 'JJJJ' = irgendwann in dem Jahr, 'JJJJ-MM' = irgendwann in dem Monat.
   Schreibende wissen oft das Jahr, aber nicht den Tag. Das darf kein Mangel sein. */
/* Ein Datum wird oft hundertfach gelesen - im Jahresbild fuer 504 Tage gegen
   jeden Termin. Deshalb wird jede Zeichenkette nur einmal zerlegt. Das
   Ergebnis ist eingefroren: es wird ueberall nur gelesen, nie geaendert. */
const _kalTeileKarte = new Map();
function kalTeile(s) {
  const t = String(s == null ? '' : s).trim();
  if (_kalTeileKarte.has(t)) return _kalTeileKarte.get(t);
  const fertig = _kalTeileRechnen(t);
  if (_kalTeileKarte.size > 6000) _kalTeileKarte.clear();
  _kalTeileKarte.set(t, fertig);
  return fertig;
}
function _kalTeileRechnen(t) {
  const m = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/.exec(t);
  if (!m) return null;
  const jahr = Number(m[1]);
  const monat = m[2] === undefined ? null : Number(m[2]);
  const tag = m[3] === undefined ? null : Number(m[3]);
  if (jahr < KAL_JAHR_VON || jahr > KAL_JAHR_BIS) return null;
  if (monat !== null && (monat < 1 || monat > 12)) return null;
  if (tag !== null && (tag < 1 || tag > kalMonatstage(jahr, monat))) return null;
  return Object.freeze({ jahr, monat, tag, genau: tag !== null ? 'tag' : monat !== null ? 'monat' : 'jahr' });
}
function kalGueltig(s) { return kalTeile(s) !== null; }
/* Immer dieselbe Form, damit Vergleiche und Sortierung stimmen. */
function kalDatum(jahr, monat, tag) {
  const j = Math.round(Number(jahr));
  if (!Number.isFinite(j) || j < KAL_JAHR_VON || j > KAL_JAHR_BIS) return '';
  if (monat == null) return String(j);
  const m = Math.round(Number(monat));
  if (!Number.isFinite(m) || m < 1 || m > 12) return '';
  if (tag == null) return j + '-' + String(m).padStart(2, '0');
  const t = Math.round(Number(tag));
  if (!Number.isFinite(t) || t < 1 || t > kalMonatstage(j, m)) return '';
  return j + '-' + String(m).padStart(2, '0') + '-' + String(t).padStart(2, '0');
}
function kalSchaltjahr(jahr) { return (jahr % 4 === 0 && jahr % 100 !== 0) || jahr % 400 === 0; }
function kalMonatstage(jahr, monat) {
  if (monat == null) return 31;
  return [31, kalSchaltjahr(jahr) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monat - 1] || 31;
}
/* Immer über UTC rechnen — sonst verschiebt die Sommerzeit ganze Tage. */
const _kalZeitKarte = new Map();
function kalZeit(s) {
  const k = String(s == null ? '' : s);
  if (_kalZeitKarte.has(k)) return _kalZeitKarte.get(k);
  const t = kalTeile(k);
  const z = t ? Date.UTC(t.jahr, (t.monat || 1) - 1, t.tag || 1) : NaN;
  if (_kalZeitKarte.size > 6000) _kalZeitKarte.clear();
  _kalZeitKarte.set(k, z);
  return z;
}
/* Montag = 0. So liest sich die Woche wie ein deutscher Kalender. */
function kalWochentag(s) {
  const z = kalZeit(s);
  if (!Number.isFinite(z)) return -1;
  return (new Date(z).getUTCDay() + 6) % 7;
}
/* Kalenderwoche nach ISO 8601: die Woche mit dem ersten Donnerstag zählt als erste. */
function kalWoche(s) {
  const t = kalTeile(s);
  if (!t || t.genau !== 'tag') return 0;
  const d = new Date(Date.UTC(t.jahr, t.monat - 1, t.tag));
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const ersterDo = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  ersterDo.setUTCDate(ersterDo.getUTCDate() + 3 - ((ersterDo.getUTCDay() + 6) % 7));
  return 1 + Math.round((d - ersterDo) / 604800000);
}
function kalHeute(jetzt = Date.now()) {
  const d = new Date(jetzt);
  return kalDatum(Math.min(KAL_JAHR_BIS, Math.max(KAL_JAHR_VON, d.getFullYear())), d.getMonth() + 1, d.getDate());
}
function kalJahreszeit(s) {
  const t = kalTeile(s); if (!t || t.monat == null) return '';
  const m = t.monat, tag = t.tag || 15;
  if ((m === 3 && tag >= 20) || m === 4 || m === 5 || (m === 6 && tag < 21)) return 'Frühling';
  if ((m === 6 && tag >= 21) || m === 7 || m === 8 || (m === 9 && tag < 23)) return 'Sommer';
  if ((m === 9 && tag >= 23) || m === 10 || m === 11 || (m === 12 && tag < 21)) return 'Herbst';
  return 'Winter';
}

/* ----- Alter. Das Herzstück: wer geboren ist, wird älter. ----- */
/* Gibt Jahre, Monate und Tage zurück — oder null, wenn eines der beiden
   Daten fehlt oder der Stichtag vor der Geburt liegt. */
function kalAlter(geburt, stichtag) {
  const g = kalTeile(geburt), s = kalTeile(stichtag);
  if (!g || !s) return null;
  const gm = g.monat || 1, gt = g.tag || 1, sm = s.monat || 1, st = s.tag || 1;
  if (kalZeit(kalDatum(s.jahr, sm, st)) < kalZeit(kalDatum(g.jahr, gm, gt))) return null;
  let jahre = s.jahr - g.jahr, monate = sm - gm, tage = st - gt;
  if (tage < 0) {
    /* Ein Monat zurueck. Der Stichtag im Vormonat ist der Geburtstag, aber
       hoechstens der letzte Tag dieses Monats: vom 31. Januar aus ist ein
       Monat spaeter der 28. oder 29. Februar, nicht der 3. Maerz. */
    monate -= 1;
    const vm = sm === 1 ? 12 : sm - 1, vj = sm === 1 ? s.jahr - 1 : s.jahr;
    const laenge = kalMonatstage(vj, vm);
    tage = st + (laenge - Math.min(gt, laenge));
  }
  if (monate < 0) { jahre -= 1; monate += 12; }
  /* Ist eines der Daten nur aufs Jahr genau, ist auch das Alter nur ungefähr. */
  const genau = g.genau === 'tag' && s.genau === 'tag';
  return { jahre, monate, tage, genau };
}
function kalAlterText(a) {
  if (!a) return '';
  const un = a.genau ? '' : 'etwa ';
  if (a.jahre >= 2) return un + a.jahre + ' Jahre';
  if (a.jahre === 1) return un + (a.monate ? 'ein Jahr und ' + a.monate + (a.monate === 1 ? ' Monat' : ' Monate') : 'ein Jahr');
  if (a.monate >= 1) return un + a.monate + (a.monate === 1 ? ' Monat' : ' Monate');
  return un + (a.tage === 1 ? 'einen Tag' : a.tage + ' Tage') + ' alt';
}

/* ----- Termine als Dokumente ----- */
function saubererTermin(t) {
  if (!t || typeof t !== 'object') return null;
  const wann = kalDatum(...(() => { const p = kalTeile(t.wann); return p ? [p.jahr, p.monat, p.tag] : [null]; })());
  if (!wann) return null;
  const bisTeile = kalTeile(t.bis);
  const bis = bisTeile && kalZeit(t.bis) >= kalZeit(wann) ? kalDatum(bisTeile.jahr, bisTeile.monat, bisTeile.tag) : '';
  const art = KAL_ART_IDS.includes(t.art) ? t.art : 'ereignis';
  const leute = Array.isArray(t.leute) ? t.leute.slice(0, 40).map((p) => {
    if (typeof p === 'string') return { id: '', name: String(p).slice(0, 120) };
    if (!p || typeof p !== 'object') return null;
    const name = String(p.name || '').slice(0, 120);
    if (!name) return null;
    return { id: String(p.id || '').slice(0, 200), name };
  }).filter(Boolean) : [];
  return {
    wann, bis, art,
    titel: String(t.titel || '').slice(0, 200),
    notiz: String(t.notiz || '').slice(0, 4000),
    ort: String(t.ort || '').slice(0, 200),
    leute,
    icon: /^[a-z0-9_:-]{1,60}$/i.test(String(t.icon || '')) ? String(t.icon) : '',
    farbe: /^#[0-9a-f]{6}$/i.test(String(t.farbe || '')) ? String(t.farbe) : '',
    jaehrlich: t.jaehrlich === true,
    projekt: String(t.projekt || '').slice(0, 200),
    quelle: String(t.quelle || '').slice(0, 200)
  };
}
function kalTermine() {
  return [...D.docs.values()].filter((d) => d.typ === 'termin' && !d.geloescht && kalGueltig(d.wann));
}
/* Sortiert wie ein Kalender: nach Zeit, bei gleichem Tag die Geburt zuerst. */
function kalSortiert(liste) {
  const rang = (t) => (t.art === 'geburt' ? 0 : t.art === 'tod' ? 2 : 1);
  return [...liste].sort((a, b) => kalZeit(a.wann) - kalZeit(b.wann) || rang(a) - rang(b) || String(a.titel || '').localeCompare(String(b.titel || ''), 'de'));
}

/* Welche Termine fallen auf einen Tag? Zählt Zeiträume und jährliche mit. */
function kalAmTag(datum, liste) {
  const t = kalTeile(datum);
  if (!t || t.genau !== 'tag') return [];
  const z = kalZeit(datum);
  return kalSortiert((liste || kalTermine()).filter((e) => {
    const a = kalTeile(e.wann); if (!a) return false;
    /* Ungenaue Termine hängen an ihrem ersten Tag — sonst wären sie nirgends zu sehen. */
    if (a.genau !== 'tag') return a.jahr === t.jahr && (a.monat == null ? t.monat === 1 && t.tag === 1 : a.monat === t.monat && t.tag === 1);
    if (e.jaehrlich || e.art === 'geburt') {
      /* Wiederkehr: gleicher Tag, gleicher Monat, ab dem Jahr des Termins.
         Der 29. Februar fällt in Nicht-Schaltjahren auf den 28. */
      if (t.jahr < a.jahr) return false;
      if (a.monat === 2 && a.tag === 29 && !kalSchaltjahr(t.jahr)) return t.monat === 2 && t.tag === 28;
      if (!(a.monat === t.monat && a.tag === t.tag)) return false;
      /* Nach dem Tod wird kein Geburtstag mehr gefeiert — der Todestag zählt dann. */
      if (e.art === 'geburt' && t.jahr > a.jahr) { const tod = kalTodVon(e.leute, liste); if (tod && kalZeit(datum) > kalZeit(tod)) return false; }
      return true;
    }
    if (e.bis) return z >= kalZeit(e.wann) && z <= kalZeit(e.bis);
    return kalZeit(e.wann) === z;
  }));
}
/* Wie viele Termine je Tag eines Monats — für die Punkte im Raster. */
function kalMonatsZaehlung(jahr, monat, liste) {
  const alle = liste || kalTermine();
  const raus = {};
  for (let tag = 1; tag <= kalMonatstage(jahr, monat); tag++) {
    const d = kalDatum(jahr, monat, tag);
    const t = kalAmTag(d, alle);
    if (t.length) raus[tag] = t;
  }
  return raus;
}

/* ----- Das Raster eines Monats: sechs Wochen, Montag bis Sonntag ----- */
function kalRaster(jahr, monat) {
  const ersterWt = kalWochentag(kalDatum(jahr, monat, 1));
  const tage = kalMonatstage(jahr, monat);
  const vorMonat = monat === 1 ? 12 : monat - 1, vorJahr = monat === 1 ? jahr - 1 : jahr;
  const vorTage = kalMonatstage(vorJahr, vorMonat);
  const zellen = [];
  for (let i = 0; i < ersterWt; i++) {
    const tag = vorTage - ersterWt + 1 + i;
    zellen.push({ jahr: vorJahr, monat: vorMonat, tag, datum: kalDatum(vorJahr, vorMonat, tag), fremd: true });
  }
  for (let tag = 1; tag <= tage; tag++) zellen.push({ jahr, monat, tag, datum: kalDatum(jahr, monat, tag), fremd: false });
  let n = 1;
  while (zellen.length % 7 !== 0 || zellen.length < 42) {
    const nMonat = monat === 12 ? 1 : monat + 1, nJahr = monat === 12 ? jahr + 1 : jahr;
    zellen.push({ jahr: nJahr, monat: nMonat, tag: n, datum: kalDatum(nJahr, nMonat, n), fremd: true });
    n++;
    if (zellen.length >= 42) break;
  }
  const wochen = [];
  for (let i = 0; i < zellen.length; i += 7) {
    const reihe = zellen.slice(i, i + 7);
    wochen.push({ kw: kalWoche(reihe[0].datum), tage: reihe });
  }
  return wochen;
}

/* ----- Leben: wer wann geboren wurde und wann gestorben ist ----- */
/* Ein Mensch ist hier ein Name. Gibt es dazu ein Figurendokument, umso besser —
   nötig ist es nicht. Wer nur einen Namen im Kopf hat, soll ihn eintragen dürfen. */
function kalPersonSchluessel(p) {
  if (!p) return '';
  if (typeof p === 'string') return p.trim().toLowerCase();
  return (p.id || String(p.name || '').trim().toLowerCase());
}
function kalGeburtVon(leute, liste) { return kalLebensdatum(leute, 'geburt', liste); }
function kalTodVon(leute, liste) { return kalLebensdatum(leute, 'tod', liste); }
/* Nachschlagen statt durchsuchen. Ohne diese Karte kostet die Jahresansicht
   bei vielen Terminen quadratisch viel Zeit: für jeden der 504 Tage würde
   für jede Geburt die ganze Liste nach dem Todestag durchgegangen. Die Karte
   hängt an der übergebenen Liste — neue Liste, neue Karte. */
const _kalLebenKarten = new WeakMap();
function kalLebenKarte(liste, art) {
  let paar = _kalLebenKarten.get(liste);
  if (!paar) { paar = {}; _kalLebenKarten.set(liste, paar); }
  if (paar[art]) return paar[art];
  const karte = new Map();
  for (const e of kalSortiert(liste.filter((x) => x.art === art))) {
    for (const p of e.leute || []) {
      const k = kalPersonSchluessel(p);
      if (k && !karte.has(k)) karte.set(k, e.wann);
    }
  }
  paar[art] = karte;
  return karte;
}
function kalLebensdatum(leute, art, liste) {
  const alle = liste || kalTermine();
  const karte = kalLebenKarte(alle, art);
  if (!karte.size) return '';
  for (const p of (Array.isArray(leute) ? leute : [leute])) {
    const k = kalPersonSchluessel(p);
    if (k && karte.has(k)) return karte.get(k);
  }
  return '';
}
/* Alle Menschen, die im Kalender vorkommen — mit Leben, Alter und Terminen. */
function kalLeute(liste) {
  const alle = liste || kalTermine();
  const karte = new Map();
  for (const e of kalSortiert(alle)) {
    for (const p of e.leute || []) {
      const k = kalPersonSchluessel(p); if (!k) continue;
      if (!karte.has(k)) karte.set(k, { schluessel: k, id: p.id || '', name: p.name, geburt: '', tod: '', termine: [] });
      const m = karte.get(k);
      if (p.id && !m.id) m.id = p.id;
      m.termine.push(e);
      if (e.art === 'geburt' && !m.geburt) m.geburt = e.wann;
      if (e.art === 'tod' && !m.tod) m.tod = e.wann;
    }
  }
  return [...karte.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
/* Wie alt wurde jemand? Nur wenn beides bekannt ist. */
function kalLebensalter(person) {
  if (!person || !person.geburt || !person.tod) return null;
  return kalAlter(person.geburt, person.tod);
}

/* ----- Widersprüche: der eigentliche Nutzen eines Kalenders ----- */
/* Sagt, was nicht sein kann — jemand tritt vor seiner Geburt auf oder nach
   seinem Tod. Findet außerdem doppelte Geburts- und Todesdaten. */
function kalWidersprueche(liste) {
  const alle = liste || kalTermine();
  const leute = kalLeute(alle);
  const raus = [];
  for (const p of leute) {
    if (p.geburt && p.tod && kalZeit(p.tod) < kalZeit(p.geburt)) {
      raus.push({ art: 'reihenfolge', person: p.name, text: p.name + ' stirbt vor der eigenen Geburt.' });
    }
    const geburten = p.termine.filter((e) => e.art === 'geburt');
    if (geburten.length > 1) raus.push({ art: 'doppelt', person: p.name, text: p.name + ' hat ' + geburten.length + ' Geburtsdaten.' });
    const tode = p.termine.filter((e) => e.art === 'tod');
    if (tode.length > 1) raus.push({ art: 'doppelt', person: p.name, text: p.name + ' hat ' + tode.length + ' Todesdaten.' });
    for (const e of p.termine) {
      if (e.art === 'geburt' || e.art === 'tod') continue;
      if (p.geburt && kalZeit(e.wann) < kalZeit(p.geburt)) {
        raus.push({ art: 'vorGeburt', person: p.name, termin: e, text: p.name + ' kommt am ' + kalLesbar(e.wann) + ' vor — geboren aber erst ' + kalLesbar(p.geburt) + '.' });
      }
      if (p.tod && kalZeit(e.wann) > kalZeit(p.tod)) {
        raus.push({ art: 'nachTod', person: p.name, termin: e, text: p.name + ' kommt am ' + kalLesbar(e.wann) + ' vor — gestorben aber schon ' + kalLesbar(p.tod) + '.' });
      }
    }
  }
  return raus;
}

/* ----- Lesbares ----- */
function kalLesbar(s, lang) {
  const t = kalTeile(s);
  if (!t) return '';
  if (t.genau === 'jahr') return String(t.jahr);
  if (t.genau === 'monat') return KAL_MONATE[t.monat - 1] + ' ' + t.jahr;
  const wt = lang ? KAL_TAGE[kalWochentag(s)] + ', ' : '';
  return wt + t.tag + '. ' + KAL_MONATE[t.monat - 1] + ' ' + t.jahr;
}
function kalKurz(s) {
  const t = kalTeile(s);
  if (!t) return '';
  if (t.genau === 'jahr') return String(t.jahr);
  if (t.genau === 'monat') return KAL_MONATE_KURZ[t.monat - 1] + ' ' + t.jahr;
  return t.tag + '. ' + KAL_MONATE_KURZ[t.monat - 1] + ' ' + t.jahr;
}
/* Ein Satz über einen Termin, wie ihn ein Chronist schreiben würde. */
function kalSatz(termin, liste) {
  if (!termin) return '';
  const art = kalArt(termin.art);
  const namen = (termin.leute || []).map((p) => p.name);
  const wer = namen.length === 0 ? '' : namen.length === 1 ? namen[0] : namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1];
  const wann = kalLesbar(termin.wann, kalTeile(termin.wann) && kalTeile(termin.wann).genau === 'tag');
  const kopf = termin.titel || (wer ? wer + ' — ' + art.name : art.name);
  const teile = [kopf, wann];
  if (termin.ort) teile.push('in ' + termin.ort);
  /* Wer an diesem Tag wie alt war — das ist die Frage, die man später stellt. */
  const alter = [];
  for (const p of termin.leute || []) {
    if (termin.art === 'geburt') continue;
    const g = kalGeburtVon([p], liste);
    if (!g) continue;
    const a = kalAlter(g, termin.wann);
    if (a) alter.push(p.name + ': ' + kalAlterText(a));
  }
  if (alter.length) teile.push(alter.join(', '));
  return teile.join(' · ');
}

/* ----- Jahrestage: was heute vor Jahren geschah ----- */
function kalJahrestage(datum, liste) {
  const t = kalTeile(datum);
  if (!t || t.genau !== 'tag') return [];
  const raus = [];
  for (const e of kalSortiert(liste || kalTermine())) {
    const a = kalTeile(e.wann);
    if (!a || a.genau !== 'tag') continue;
    if (a.monat !== t.monat || a.tag !== t.tag) continue;
    const her = t.jahr - a.jahr;
    if (her <= 0) continue;
    raus.push({ termin: e, jahre: her });
  }
  return raus;
}

/* ----- Was in einem Jahr geschieht: für die Jahresübersicht ----- */
function kalJahresZaehlung(jahr, liste) {
  const alle = liste || kalTermine();
  const raus = Array.from({ length: 12 }, () => 0);
  for (const e of alle) {
    const a = kalTeile(e.wann);
    if (!a) continue;
    if (e.jaehrlich || e.art === 'geburt') { if (jahr >= a.jahr && a.monat) raus[a.monat - 1]++; continue; }
    if (a.jahr === jahr && a.monat) raus[a.monat - 1]++;
    else if (a.jahr === jahr && !a.monat) raus[0]++;
    if (e.bis) { const b = kalTeile(e.bis); if (b && a.jahr !== b.jahr && jahr > a.jahr && jahr <= b.jahr) raus[0]++; }
  }
  return raus;
}
/* Die Jahre, in denen überhaupt etwas steht — damit die Leiste weiß, wo es lohnt. */
function kalJahreMitInhalt(liste) {
  const raus = new Set();
  for (const e of liste || kalTermine()) {
    const a = kalTeile(e.wann); if (!a) continue;
    const b = e.bis ? kalTeile(e.bis) : null;
    for (let j = a.jahr; j <= (b ? b.jahr : a.jahr); j++) raus.add(j);
  }
  return [...raus].sort((a, b) => a - b);
}
