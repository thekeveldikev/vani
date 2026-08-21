/* ================================================================
   VANI — Dinge zusammenlegen: Beziehungen, Hefte, Projekte, Cluster
   ================================================================ */

const SICHTBARE_TYPEN = new Set(['schnipsel', 'blatt', 'seite', 'heft', 'projekt', 'kapitel', 'szene', 'board', 'blase', 'wort', 'faden', 'funkeln', 'goodnote']);
function docName(d) {
  if (!d) return 'Nicht mehr da';
  return (d.titel || (d.text || '').trim().split('\n')[0] || ({ seite: 'Heftseite', blase: 'Blase', faden: 'Fadenstück', goodnote: 'Goodnotes-Notizbuch' }[d.typ]) || d.typ).slice(0, 80);
}
function docIcon(d) {
  return ({ schnipsel: 'schnipsel', blatt: 'blatt', seite: 'hefte', heft: 'hefte', projekt: 'projekte', kapitel: 'projekte', szene: 'projekte', board: 'cluster', blase: 'cluster', wort: 'woerter', faden: 'faden', funkeln: 'wieder', goodnote: 'buchzu' }[d && d.typ]) || 'verbinden';
}

function waehleDokument(auslassenId, titel = 'Womit verbinden?') {
  return new Promise((res) => {
    const feld = el('input', { type: 'search', placeholder: 'Titel oder ein Wort …' });
    const liste = el('div', { class: 'dokumentwaehler' });
    const alle = [...D.docs.values()].filter((d) => d.id !== auslassenId && SICHTBARE_TYPEN.has(d.typ));
    const baue = () => {
      liste.innerHTML = '';
      const q = normalisiere(feld.value.trim()).slice(0, 120);
      const treffer = alle.filter((d) => !q || normalisiere(docName(d) + ' ' + (d.text || '')).includes(q)).slice(0, 80);
      if (!treffer.length) liste.append(el('div', { class: 'leer klein' }, 'Nichts Passendes.'));
      for (const d of treffer) liste.append(el('button', {
        onclick: () => { res(d); zu(); }
      }, el('span', { html: ik(docIcon(d)), style: 'display:flex' }),
      el('span', { class: 'dwahltext' }, el('b', {}, docName(d)), el('small', {}, d.typ))));
    };
    feld.addEventListener('input', entprellt(baue, 100));
    const kasten = el('div', { class: 'modal dokumentmodal' },
      el('h2', {}, titel), feld, liste,
      el('div', { class: 'reihe' }, el('button', { class: 'knopf zart', onclick: () => { res(null); zu(); } }, 'Abbrechen')));
    const zu = zeigeDeck(kasten, () => res(null));
    baue();
    setTimeout(() => feld.focus(), 60);
  });
}

async function neueBeziehung(doc) {
  const ziel = await waehleDokument(doc.id);
  if (!ziel) return null;
  const art = await menue(BEZUG_ARTEN.map((a) => ({ text: a, wert: a })), 'Was verbindet die beiden?');
  if (!art) return null;
  const b = verbindeDocs(doc.id, ziel.id, art);
  if (b) toast('Verbunden mit „' + docName(ziel) + '".');
  return b;
}

function strukturelleBeziehungen(doc) {
  const raus = [];
  const parent = doc.parent && D.docs.get(doc.parent);
  if (parent) raus.push({ doc: parent, art: doc.typ === 'seite' ? 'liegt in diesem Heft' : 'gehört hier hinein' });
  const projekt = (doc.projektRef || doc.projekt) && D.docs.get(doc.projektRef || doc.projekt);
  if (projekt && (!parent || projekt.id !== parent.id)) raus.push({ doc: projekt, art: 'gehört zu diesem Projekt' });
  const quelle = doc.quelle && D.docs.get(doc.quelle);
  if (quelle) raus.push({ doc: quelle, art: 'stammt von hier' });
  return raus;
}

function zeigeBeziehungen(doc) {
  const kasten = el('div', { class: 'modal beziehungsmodal' }, el('h2', {}, 'Was zu „' + docName(doc) + '" gehört'));
  const liste = el('div', { class: 'beziehungsliste' });
  const baue = () => {
    liste.innerHTML = '';
    for (const x of strukturelleBeziehungen(doc)) liste.append(beziehungsZeile(x.doc, x.art, null));
    for (const b of beziehungenFuer(doc.id)) {
      const hinaus = b.von === doc.id;
      const anderes = D.docs.get(hinaus ? b.zu : b.von);
      if (!anderes) continue;
      liste.append(beziehungsZeile(anderes, (hinaus ? '→ ' : '← ') + (b.art || 'verbunden'), b));
    }
    if (!liste.children.length) liste.append(el('div', { class: 'beziehungsleer' }, 'Noch frei. Eine Verbindung kann eine Zugehörigkeit, ein Echo oder ein Widerspruch sein.'));
  };
  function beziehungsZeile(ziel, art, bezug) {
    return el('div', { class: 'beziehungszeile' },
      el('button', { class: 'beziehungsziel', onclick: () => { zu(); if (_sr) schliesseSchreibraum(); oeffneDoc(ziel); } },
        el('span', { html: ik(docIcon(ziel)), style: 'display:flex' }),
        el('span', {}, el('b', {}, docName(ziel)), el('small', {}, art))),
      bezug ? el('button', { class: 'rundknopf zart', title: 'Verbindung lösen', html: ik('kreuz'), onclick: async () => { await trenneDocs(bezug.id); baue(); } }) : null);
  }
  kasten.append(liste, el('div', { class: 'reihe' },
    el('button', { class: 'knopf', onclick: async () => { if (await neueBeziehung(doc)) baue(); } }, el('span', { html: ik('verbinden'), style: 'display:flex' }), 'Verbinden'),
    el('button', { class: 'knopf voll', onclick: () => zu() }, 'Fertig')));
  const zu = zeigeDeck(kasten);
  baue();
}

async function waehleSeite({ heft = null, neueErlaubt = true } = {}) {
  heft = heft || await waehleHeft();
  if (!heft) return null;
  const seiten = kinder(heft.id, 'seite');
  const wahl = await menue([
    ...seiten.map((s, i) => ({ text: 'Seite ' + (i + 1) + (s.titel ? ' · ' + s.titel : ''), wert: s.id })),
    neueErlaubt ? { text: 'Neue Seite am Ende', icon: 'plus', wert: '_neu' } : null
  ], 'Wohin in „' + heft.titel + '"?');
  if (!wahl) return null;
  if (wahl === '_neu') return neuDoc('seite', { parent: heft.id, ord: seiten.length, titel: '', text: '' });
  return D.docs.get(wahl);
}

async function waehlePositionImHeft(heft) {
  const seiten = kinder(heft.id, 'seite');
  const punkte = [{ text: 'Ganz vorne', wert: 0 }];
  seiten.forEach((s, i) => punkte.push({ text: 'Nach Seite ' + (i + 1) + (s.titel ? ' · ' + s.titel : ''), wert: i + 1 }));
  return await menue(punkte, 'An welche Stelle?');
}

async function legeBlattInHeft(blatt) {
  const heft = await waehleHeft();
  if (!heft) return false;
  const pos = await waehlePositionImHeft(heft);
  if (pos === null) return false;
  if (!blattInHeft(blatt, heft, pos)) return false;
  toast('Liegt jetzt als Seite ' + (Number(pos) + 1) + ' in „' + heft.titel + '".');
  return true;
}

async function klebeSchnipselEin(s) {
  return klebeDokumentEin(s, 'tesa');
}

async function klebeDokumentEin(doc, befestigung = 'tesa') {
  const seite = await waehleSeite();
  if (!seite) return null;
  const z = neuDoc('zettel', {
    parent: seite.id, quelle: doc.id, text: doc.text || doc.titel || '', farbe: zufall(['gelb', 'rosa', 'blau', 'gruen']), befestigung,
    pos: { x: 8 + Math.random() * 42, y: 8 + Math.random() * 28, rot: -5 + Math.random() * 10, w: 32 }
  });
  verbindeDocs(doc.id, seite.id, 'gehört dazu');
  if (doc.bild) neuDoc('foto', { parent: seite.id, quelle: doc.id, bild: doc.bild, befestigung, pos: { x: 48, y: 12, rot: 2, w: 38 } });
  toast('Mit Tesa an eine Seite in „' + docName(D.docs.get(seite.parent)) + '" geklebt. Das Original bleibt an seinem Platz.');
  return z;
}

async function kopiereHeftInProjekt(heft) {
  const projekte = vomTyp('projekt');
  const projektId = await menue(projekte.map((p) => ({ text: p.titel, icon: 'projekte', wert: p.id })), 'In welches Projekt kopieren?');
  const projekt = D.docs.get(projektId);
  if (!projekt) return null;
  const kapitel = neuDoc('kapitel', { parent: projekt.id, titel: heft.titel, ord: kinder(projekt.id, 'kapitel').length, quelle: heft.id });
  const seiten = kinder(heft.id, 'seite');
  for (let i = 0; i < seiten.length; i++) {
    const s = seiten[i];
    const szene = neuDoc('szene', { parent: kapitel.id, projekt: projekt.id, ord: i, titel: s.titel || 'Seite ' + (i + 1), text: s.text || '', rich: s.rich || '', format: s.format || 'plain', quelle: s.id, status: 'funke', farbe: '' });
    verbindeDocs(s.id, szene.id, 'spiegelt');
  }
  heft.projektRef = projekt.id; speichere(heft); verbindeDocs(heft.id, projekt.id, 'gehört dazu');
  toast('Als Kapitel mit ' + seiten.length + (seiten.length === 1 ? ' Szene' : ' Szenen') + ' in „' + projekt.titel + '" kopiert. Das Heft bleibt erhalten.');
  return projekt;
}

async function legeAufBrett(doc) {
  const brett = await waehleBrett();
  if (!brett) return null;
  const b = neuDoc('blase', {
    parent: brett.id, quelle: doc.id, text: docName(doc) + ((doc.text || '').trim() && docName(doc) !== (doc.text || '').trim() ? '\n' + (doc.text || '').trim().slice(0, 500) : ''),
    farbe: '', pos: { x: 80 + Math.random() * 320, y: 80 + Math.random() * 260 }
  });
  verbindeDocs(doc.id, b.id, 'spiegelt');
  toast('Liegt jetzt auch auf „' + brett.titel + '".');
  return b;
}

async function ordneHeftProjektZu(heft) {
  const projekte = vomTyp('projekt');
  const wahl = await menue([
    ...projekte.map((p) => ({ text: p.titel, icon: 'projekte', wert: p.id })),
    heft.projektRef ? { text: 'Aus dem Projekt lösen', icon: 'kreuz', wert: '_los' } : null
  ], 'Zu welchem Projekt gehört „' + heft.titel + '"?');
  if (!wahl) return false;
  if (wahl === '_los') delete heft.projektRef; else heft.projektRef = wahl;
  speichere(heft);
  toast(wahl === '_los' ? 'Heft steht wieder für sich.' : 'Heft und Projekt gehören jetzt zusammen.');
  return true;
}

async function hinzufuegenMenue(doc) {
  const wahl = await menue([
    doc.typ === 'schnipsel' ? { text: 'Auf eine Heftseite kleben', icon: 'pin', wert: 'kleben' } : null,
    doc.typ === 'blatt' ? { text: 'Als Seite in ein Heft legen', icon: 'hefte', wert: 'heft' } : null,
    doc.typ === 'blatt' ? { text: 'Mit Tesa auf eine Heftseite kleben (Original bleibt)', icon: 'pin', wert: 'tesa' } : null,
    doc.typ === 'heft' ? { text: doc.projektRef ? 'Projekt-Zuordnung ändern' : 'Einem Projekt zuordnen', icon: 'projekte', wert: 'projekt' } : null,
    doc.typ === 'heft' && vomTyp('projekt').length ? { text: 'Als Kapitel in ein Projekt kopieren', icon: 'wandel', wert: 'projektkopie' } : null,
    ['schnipsel', 'blatt', 'seite', 'szene', 'heft', 'goodnote'].includes(doc.typ) ? { text: 'Auf ein Cluster-Brett legen', icon: 'cluster', wert: 'brett' } : null,
    { text: 'Mit etwas verbinden', icon: 'verbinden', wert: 'bezug' }
  ], 'Hinzufügen & verbinden');
  if (wahl === 'kleben') return klebeSchnipselEin(doc);
  if (wahl === 'heft') return legeBlattInHeft(doc);
  if (wahl === 'tesa') return klebeDokumentEin(doc, 'tesa');
  if (wahl === 'projekt') return ordneHeftProjektZu(doc);
  if (wahl === 'projektkopie') return kopiereHeftInProjekt(doc);
  if (wahl === 'brett') return legeAufBrett(doc);
  if (wahl === 'bezug') return neueBeziehung(doc);
  return null;
}

function zeigeTextFund(doc) {
  const kasten = el('div', { class: 'modal textfund-modal' },
    el('div', { class: 'kartenkopf' }, el('span', { html: ik('wieder') }), 'GEMERKTER FUNKE'),
    el('div', { class: 'funke-text' }, doc.text || ''),
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: async () => { zu(); await loesche(doc.id); zeichne(); } }, 'Vergessen'),
      el('button', { class: 'knopf', onclick: () => { zu(); zeigeBeziehungen(doc); } }, 'Verbinden'),
      el('button', { class: 'knopf voll', onclick: () => { const b = blattAusText('', (doc.text || '') + '\n\n'); zu(); oeffneSchreibraum(b.id); } }, 'Dem nachgehen')));
  const zu = zeigeDeck(kasten);
}
