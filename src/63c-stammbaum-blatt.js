/* ===================== 63c — DIE KARTUSCHE =====================
   Hier wird eingetragen. Ein Tippen auf ein Namensband öffnet die Kartusche:
   Name, Jahre, Zeichen, eine Notiz — und darunter alle Fäden, die von dieser
   Person weggehen oder zu ihr hinführen.

   Gespeichert wird sofort, entprellt, ohne „Übernehmen". Und gespeichert wird
   über `sicherSpeichern`: nimmt der Speicher gerade nichts an, wird auch
   nichts weggeworfen, sondern gemeldet.

   Der Grundsatz aus dem Album gilt auch hier: alles darf leer bleiben. Ein
   Wandteppich mit einem einzigen Namen darauf ist ein Anfang, kein Fehler. */

/* ----- Schreiben -----
   Immer über eine geputzte Fassung: was hier hineingeht, ist gültig, oder es
   geht gar nicht erst hinein. */
async function teppichSchreiben(doc, aenderung) {
  if (!doc) return false;
  const baum = saubererStammbaum(doc);
  const neu = aenderung(baum);
  const sauber = saubererStammbaum(neu || baum);
  Object.assign(doc, sauber);
  doc.geaendert = Date.now();
  markiereAenderung(doc, false);
  D.docs.set(doc.id, doc);
  const gut = await sicherSpeichern('docs', doc);
  if (!gut) toast('Der Speicher nimmt gerade nichts an — die Änderung steht noch auf dem Bildschirm, aber noch nicht auf der Platte.', 9000);
  return gut;
}
/* Für alles, was beim Tippen läuft: entprellt und still. */
function teppichSchreiberFuer(doc, danach) {
  return entprellt(() => {
    doc.geaendert = Date.now();
    markiereAenderung(doc, false);
    D.docs.set(doc.id, doc);
    sicherSpeichern('docs', doc);
    if (danach) danach();
  }, 420, true);
}

/* ----- Eine Person aufhängen ----- */
function teppichPersonNeu(doc, name, neu) {
  if (!doc) return;
  const person = {
    id: uid(), name: String(name || '').trim().slice(0, 120), albumId: '',
    von: '', bis: '', notiz: '', zeichen: 'keins', gebrannt: false
  };
  if (saubererStammbaum(doc).leute.length >= TEPPICH_MAX_LEUTE) {
    toast('Vierhundert Namen sind das Äußerste, was auf ein Tuch passt. Web einen zweiten Teppich.', 8000);
    return;
  }
  teppichSchreiben(doc, (b) => { b.leute = b.leute.concat([person]); return b; })
    .then(() => { if (neu) neu(); teppichKartusche(doc, person.id, neu, true); });
}

/* Figuren aus dem Album holen — einzeln oder alle auf einmal. */
function teppichAusAlbum(doc, neu) {
  const baum = saubererStammbaum(doc);
  const schon = new Set(baum.leute.map((p) => p.albumId).filter(Boolean));
  const alle = typeof albumFiguren === 'function' ? albumFiguren() : [];
  const offen = alle.filter((f) => !schon.has(f.id));
  const gewaehlt = new Set();

  const gitter = el('div', { class: 'stb-albumgitter' });
  const zeichne = () => {
    gitter.innerHTML = '';
    if (!offen.length) {
      gitter.append(el('div', { class: 'leer klein' }, alle.length ? 'Alle Figuren aus dem Album hängen schon an dieser Wand.' : 'Im Album wohnt noch niemand.'));
      return;
    }
    for (const f of offen) {
      gitter.append(el('button', {
        class: 'stb-albumkarte' + (gewaehlt.has(f.id) ? ' an' : ''),
        style: '--figurfarbe:' + (typeof albumFarbe === 'function' ? albumFarbe(f) : '#8a6a3f'),
        onclick: () => { if (gewaehlt.has(f.id)) gewaehlt.delete(f.id); else gewaehlt.add(f.id); zeichne(); }
      },
        el('span', { class: 'stb-am' }, typeof albumMonogramm === 'function' ? albumMonogramm(f) : '?'),
        el('span', {}, f.name || 'ohne Namen')));
    }
    stand.textContent = gewaehlt.size ? gewaehlt.size + (gewaehlt.size === 1 ? ' Figur gewählt' : ' Figuren gewählt') : 'Keine gewählt.';
    los.disabled = !gewaehlt.size;
  };
  const stand = el('div', { class: 'stb-albumstand' });
  const los = el('button', {
    class: 'knopf voll', onclick: async () => {
      const nehmen = offen.filter((f) => gewaehlt.has(f.id));
      const platz = TEPPICH_MAX_LEUTE - saubererStammbaum(doc).leute.length;
      const wirklich = nehmen.slice(0, Math.max(0, platz));
      await teppichSchreiben(doc, (b) => {
        b.leute = b.leute.concat(wirklich.map((f) => ({
          id: uid(), name: f.name || '', albumId: f.id,
          von: (f.felder || {}).geboren || '', bis: (f.felder || {}).gestorben || '',
          notiz: '', zeichen: 'keins', gebrannt: false
        })));
        return b;
      });
      if (wirklich.length < nehmen.length) toast('Nicht alle haben Platz gefunden — das Tuch fasst vierhundert Namen.', 8000);
      else toast(wirklich.length === 1 ? 'Hängt an der Wand.' : wirklich.length + ' Namen hängen an der Wand.');
      zu(); if (neu) neu();
    }
  }, 'Aufhängen');

  const kasten = el('div', { class: 'modal stb-albumfenster' },
    el('div', { class: 'kartenkopf' }, 'AUS DEM ALBUM HOLEN'),
    el('p', { class: 'stb-vor' }, 'Wer schon im Album wohnt, muss hier nicht noch einmal getippt werden. Der Name folgt dann dem Album: Umbenennen dort, und das Band hier heißt mit.'),
    gitter, stand,
    el('div', { class: 'reihe' },
      offen.length ? el('button', { class: 'knopf zart', onclick: () => { offen.forEach((f) => gewaehlt.add(f.id)); zeichne(); } }, 'Alle') : null,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Zurück'), los));
  const zu = zeigeDeck(kasten);
  zeichne();
}

/* ================= DIE KARTUSCHE ================= */
function teppichKartusche(doc, personId, neu, frisch) {
  if (!doc) return;
  const baum = saubererStammbaum(doc);
  const person = baum.leute.find((p) => p.id === personId);
  if (!person) { toast('Der Name hängt nicht mehr an der Wand.'); if (neu) neu(); return; }

  /* Wir arbeiten auf dem Dokument selbst, damit nichts verlorengeht, wenn
     zwischendurch woanders gespeichert wird. */
  const lebend = () => {
    const b = saubererStammbaum(doc);
    return b.leute.find((p) => p.id === personId) || null;
  };
  const hinein = (aendern) => {
    const roh = Array.isArray(doc.leute) ? doc.leute : [];
    const p = roh.find((x) => x && x.id === personId);
    if (p) aendern(p);
  };
  const sichern = teppichSchreiberFuer(doc, () => { if (neu) neu(); });

  const namensfeld = el('input', { type: 'text', class: 'stb-name', value: person.name, placeholder: 'Wie heißt sie oder er?', maxlength: '120' });
  const albumFigur = teppichAlbumFigur(person);
  if (albumFigur) { namensfeld.value = albumFigur.name || ''; namensfeld.disabled = true; }
  namensfeld.addEventListener('input', () => { hinein((p) => { p.name = namensfeld.value; }); kopfAuffrischen(); sichern(); });

  const vonFeld = el('input', { type: 'text', class: 'stb-jahr', value: person.von, placeholder: 'geboren', maxlength: '24' });
  const bisFeld = el('input', { type: 'text', class: 'stb-jahr', value: person.bis, placeholder: 'gestorben', maxlength: '24' });
  vonFeld.addEventListener('input', () => { hinein((p) => { p.von = vonFeld.value; }); sichern(); });
  bisFeld.addEventListener('input', () => { hinein((p) => { p.bis = bisFeld.value; }); sichern(); });

  const notizfeld = el('textarea', { class: 'stb-notiz', rows: '3', placeholder: 'Was man über sie oder ihn wissen muss — in einem Satz.', maxlength: '600' }, person.notiz);
  notizfeld.addEventListener('input', () => { hinein((p) => { p.notiz = notizfeld.value; }); sichern(); });

  /* --- Das Zeichen --- */
  const zeichenreihe = el('div', { class: 'stb-zeichen' });
  const zeichenZeichnen = () => {
    zeichenreihe.innerHTML = '';
    const jetzt = (lebend() || person).zeichen || 'keins';
    for (const [id, name] of TEPPICH_ZEICHEN) {
      const k = el('button', { class: 'stb-z' + (jetzt === id ? ' an' : ''), title: name, onclick: () => { hinein((p) => { p.zeichen = id; }); zeichenZeichnen(); sichern(); } });
      if (id === 'keins') k.append(el('span', { class: 'stb-zleer' }, '—'));
      else k.innerHTML = '<svg viewBox="-14 -14 28 28" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + (TEP_ZEICHEN_PFADE[id] || '') + '"/></svg>';
      zeichenreihe.append(k);
    }
  };

  /* --- Die Fäden --- */
  const fadenkasten = el('div', { class: 'stb-faeden' });
  const faedenZeichnen = () => {
    fadenkasten.innerHTML = '';
    const b = saubererStammbaum(doc);
    const meine = teppichFaedenVon(b, personId);
    if (!meine.length) {
      fadenkasten.append(el('div', { class: 'leer klein' }, 'Noch hängt kein Faden daran. Ein Stammbaum entsteht erst, wenn zwei Namen etwas miteinander zu tun haben.'));
    } else {
      const nachGruppe = new Map();
      for (const f of meine) {
        const art = fadenArt(f.art, b);
        if (!nachGruppe.has(art.gruppe)) nachGruppe.set(art.gruppe, []);
        nachGruppe.get(art.gruppe).push({ f, art });
      }
      for (const [gid, gname] of FADEN_GRUPPEN) {
        const drin = nachGruppe.get(gid);
        if (!drin || !drin.length) continue;
        fadenkasten.append(el('div', { class: 'stb-fgruppe' }, gname));
        for (const { f, art } of drin) {
          const andererId = f.von === personId ? f.zu : f.von;
          const anderer = b.leute.find((p) => p.id === andererId);
          const hin = f.von === personId;
          fadenkasten.append(el('div', { class: 'stb-fzeile', style: '--fadenfarbe:' + art.farbe },
            el('i', { class: 'stb-fstrich strich-' + art.strich }),
            el('button', {
              class: 'stb-ftext', title: 'Diesen Faden ändern',
              onclick: () => teppichFadenBearbeiten(doc, f, () => { faedenZeichnen(); if (neu) neu(); })
            },
              el('b', {}, (art.gerichtet && !hin ? (art.gegen || ('← ' + art.name)) : art.name)),
              el('span', {}, teppichName(anderer) || 'ohne Namen'),
              f.wort ? el('small', {}, f.wort) : null),
            el('button', {
              class: 'stb-fweg', title: 'Diesen Faden zerschneiden',
              onclick: async () => {
                await teppichSchreiben(doc, (bb) => { bb.faeden = bb.faeden.filter((x) => x.id !== f.id); return bb; });
                faedenZeichnen(); if (neu) neu();
              }
            }, '×')));
        }
      }
    }
    fadenkasten.append(el('button', { class: 'stb-fneu', onclick: () => teppichFadenSpinnen(doc, personId, () => { faedenZeichnen(); if (neu) neu(); }) }, '+ Einen Faden spinnen'));
  };

  /* --- Der Kopf --- */
  const kopfzeile = el('div', { class: 'stb-khall' });
  const kopfAuffrischen = () => {
    kopfzeile.innerHTML = '';
    const p = lebend() || person;
    const n = teppichName(p).trim();
    const b = saubererStammbaum(doc);
    const anzahl = teppichFaedenVon(b, personId).length;
    anfuegen(kopfzeile,
      n ? el('span', {}, 'Auf dem Band steht ab jetzt „' + n.toUpperCase() + '“.') : el('span', { class: 'blass' }, 'Ohne Namen steht dort „ohne Namen“ — nachtragen geht jederzeit.'),
      anzahl ? el('span', { class: 'blass' }, '  ·  ' + anzahl + (anzahl === 1 ? ' Faden' : ' Fäden')) : null,
      albumFigur ? el('button', { class: 'stb-albumlink', onclick: () => { zu(); if (typeof albumSpringeZu === 'function') albumSpringeZu(albumFigur.id); } }, 'Im Album nachschlagen') : null);
  };

  const gebrannt = () => (lebend() || person).gebrannt;
  const brandKnopf = el('button', { class: 'knopf zart', onclick: async () => {
    const jetzt = gebrannt();
    if (!jetzt && !(await frage('Diesen Namen aus dem Tuch brennen? Er bleibt lesbar — aber es ist ein Loch da, wo das Zeichen war.', { ja: 'Ausbrennen' }))) return;
    hinein((p) => { p.gebrannt = !jetzt; });
    await teppichSchreiben(doc, (b) => b);
    brandKnopf.textContent = gebrannt() ? 'Das Loch wieder schließen' : 'Aus dem Tuch brennen';
    if (neu) neu();
    if (!jetzt) toast('Ausgebrannt. Der Name bleibt.', 4200);
  } }, person.gebrannt ? 'Das Loch wieder schließen' : 'Aus dem Tuch brennen');

  const kasten = el('div', { class: 'modal stb-kartusche' },
    el('div', { class: 'kartenkopf' }, frisch ? 'EIN NEUER NAME' : 'DIE KARTUSCHE'),
    el('div', { class: 'stb-kkopf' }, namensfeld,
      el('div', { class: 'stb-jahre' }, vonFeld, el('i', {}, '–'), bisFeld)),
    albumFigur ? el('small', { class: 'stb-albumhinweis' }, 'Der Name kommt aus dem Album und wird dort geändert.') : null,
    kopfzeile,
    el('div', { class: 'stb-abschnitt' }, 'Zeichen'),
    zeichenreihe,
    el('div', { class: 'stb-abschnitt' }, 'Notiz'),
    notizfeld,
    el('div', { class: 'stb-abschnitt' }, 'Fäden'),
    fadenkasten,
    el('div', { class: 'reihe stb-kfuss' },
      el('button', { class: 'knopf zart gefahr', onclick: async () => {
        const p = lebend() || person;
        const n = teppichName(p) || 'diesen Namen';
        if (!(await frage('„' + n + '“ von der Wand nehmen? Alle Fäden daran werden mit zerschnitten.', { ja: 'Abnehmen' }))) return;
        await teppichSchreiben(doc, (b) => {
          b.leute = b.leute.filter((x) => x.id !== personId);
          b.faeden = b.faeden.filter((f) => f.von !== personId && f.zu !== personId);
          return b;
        });
        zu(); if (neu) neu();
      } }, 'Von der Wand nehmen'),
      brandKnopf,
      !albumFigur ? el('button', { class: 'knopf zart', title: 'Eine Doppelseite im Album anlegen und mit diesem Namen verbinden', onclick: () => teppichInsAlbum(doc, personId, () => { kopfAuffrischen(); if (neu) neu(); }) }, 'Ins Album übernehmen') : null,
      el('button', { class: 'knopf voll', onclick: () => { sichern.sofort(); zu(); if (neu) neu(); } }, 'Fertig')));

  const zu = zeigeDeck(kasten, () => { sichern.sofort(); if (neu) neu(); });
  kopfAuffrischen(); zeichenZeichnen(); faedenZeichnen();
  setTimeout(() => { if (frisch && !namensfeld.disabled) namensfeld.focus(); }, 60);
}

/* Aus einem Namen am Teppich eine Figur im Album machen. */
async function teppichInsAlbum(doc, personId, danach) {
  if (typeof neuDoc !== 'function') return;
  const baum = saubererStammbaum(doc);
  const p = baum.leute.find((x) => x.id === personId);
  if (!p) return;
  const name = (p.name || '').trim();
  const schon = typeof albumFindeFigur === 'function' && name ? albumFindeFigur(name) : null;
  if (schon && !(await frage('„' + name + '“ wohnt schon im Album. Mit dieser Doppelseite verbinden?', { ja: 'Verbinden' }))) return;
  let figur = schon;
  if (!figur) {
    const felder = {};
    if (p.von) felder.geboren = p.von;
    if (p.bis) felder.gestorben = p.bis;
    if (p.notiz) felder.notiz = p.notiz;
    figur = neuDoc('albumfigur', { name, titel: name, felder, eigene: [], zettel: [], farbe: '' });
  }
  await teppichSchreiben(doc, (b) => {
    const q = b.leute.find((x) => x.id === personId);
    if (q) q.albumId = figur.id;
    return b;
  });
  toast(schon ? 'Verbunden. Der Name folgt jetzt dem Album.' : 'Im Album angelegt und verbunden.', 5200);
  if (danach) danach();
}

/* ================= EINEN FADEN SPINNEN ================= */
function teppichFadenSpinnen(doc, vonId, danach, vorgabeArt) {
  teppichFadenFenster(doc, null, vonId, danach, vorgabeArt);
}
function teppichFadenBearbeiten(doc, faden, danach) {
  teppichFadenFenster(doc, faden, faden.von, danach);
}

function teppichFadenFenster(doc, vorhandener, vonId, danach, vorgabeArt) {
  const baum = saubererStammbaum(doc);
  const stand = {
    art: vorhandener ? vorhandener.art : (vorgabeArt || 'kind'),
    von: vorhandener ? vorhandener.von : vonId,
    zu: vorhandener ? vorhandener.zu : '',
    wort: vorhandener ? vorhandener.wort : ''
  };
  let gruppe = fadenArt(stand.art, baum).gruppe;

  const nameVon = (id) => { const p = baum.leute.find((x) => x.id === id); return teppichName(p) || 'ohne Namen'; };

  /* --- Fadenart wählen --- */
  const reiter = el('div', { class: 'stb-freiter' });
  const artenkasten = el('div', { class: 'stb-farten' });
  const reiterZeichnen = () => {
    reiter.innerHTML = '';
    for (const [gid, gname] of FADEN_GRUPPEN) {
      reiter.append(el('button', { class: 'stb-fr' + (gruppe === gid ? ' an' : ''), onclick: () => { gruppe = gid; reiterZeichnen(); artenZeichnen(); } }, gname));
    }
    const eigene = baum.eigeneArten || [];
    reiter.append(el('button', { class: 'stb-fr' + (gruppe === 'eigen' ? ' an' : ''), onclick: () => { gruppe = 'eigen'; reiterZeichnen(); artenZeichnen(); } },
      'Eigene', eigene.length ? el('i', {}, String(eigene.length)) : null));
  };
  const artenZeichnen = () => {
    artenkasten.innerHTML = '';
    const liste = gruppe === 'eigen'
      ? (baum.eigeneArten || []).map((a) => fadenArt(a.id, baum))
      : FADEN_ARTEN.filter((a) => a.gruppe === gruppe);
    if (!liste.length) {
      artenkasten.append(el('div', { class: 'leer klein' }, 'Noch keine eigene Fadenart. Leg eine an — sie gehört dann diesem Teppich.'));
    }
    for (const a of liste) {
      artenkasten.append(el('button', {
        class: 'stb-fart' + (stand.art === a.id ? ' an' : ''), style: '--fadenfarbe:' + a.farbe,
        onclick: () => { stand.art = a.id; artenZeichnen(); satzAuffrischen(); }
      }, el('i', { class: 'stb-fstrich strich-' + a.strich }), a.name));
    }
    if (gruppe === 'eigen') {
      artenkasten.append(el('button', { class: 'stb-fneu', onclick: () => teppichArtAnlegen(doc, (id) => {
        const frisch = saubererStammbaum(doc);
        baum.eigeneArten = frisch.eigeneArten;
        stand.art = id; artenZeichnen(); reiterZeichnen(); satzAuffrischen();
      }) }, '+ Eine eigene Fadenart'));
    }
  };

  /* --- Wen betrifft es? --- */
  const suchfeld = el('input', { type: 'search', class: 'stb-fsuche', placeholder: 'Namen suchen — oder einen neuen eintippen …' });
  const zielliste = el('div', { class: 'stb-fziele' });
  const zieleZeichnen = () => {
    zielliste.innerHTML = '';
    const q = suchfeld.value.trim();
    const treffer = teppichSuche(baum, q).filter((p) => p.id !== stand.von);
    for (const p of treffer.slice(0, 60)) {
      zielliste.append(el('button', {
        class: 'stb-fziel' + (stand.zu === p.id ? ' an' : ''),
        onclick: () => { stand.zu = p.id; zieleZeichnen(); satzAuffrischen(); }
      }, teppichName(p) || 'ohne Namen', teppichJahre(p) ? el('small', {}, teppichJahre(p)) : null));
    }
    if (q && !treffer.some((p) => teppichName(p).toLowerCase() === q.toLowerCase())) {
      zielliste.append(el('button', {
        class: 'stb-fziel neu',
        onclick: async () => {
          const person = { id: uid(), name: q.slice(0, 120), albumId: '', von: '', bis: '', notiz: '', zeichen: 'keins', gebrannt: false };
          await teppichSchreiben(doc, (b) => { b.leute = b.leute.concat([person]); return b; });
          const frisch = saubererStammbaum(doc);
          baum.leute = frisch.leute;
          stand.zu = person.id;
          suchfeld.value = '';
          zieleZeichnen(); satzAuffrischen();
          toast('„' + q + '“ hängt jetzt auch an der Wand.');
        }
      }, '+ „' + q + '“ neu aufhängen'));
    }
    if (!treffer.length && !q) zielliste.append(el('div', { class: 'leer klein' }, 'Es hängt noch niemand sonst an der Wand.'));
  };
  suchfeld.addEventListener('input', entprellt(zieleZeichnen, 180, true));

  /* --- Wort und Vorschau --- */
  const wortfeld = el('input', { type: 'text', class: 'stb-fwort', value: stand.wort, maxlength: '200' });
  wortfeld.addEventListener('input', () => { stand.wort = wortfeld.value; satzAuffrischen(); });
  const vorschau = el('div', { class: 'stb-fvorschau' });
  const tauschKnopf = el('button', { class: 'knopf zart klein', onclick: () => { const t = stand.von; stand.von = stand.zu || t; stand.zu = t === stand.von ? stand.zu : t; satzAuffrischen(); zieleZeichnen(); } }, 'Richtung drehen');

  const satzAuffrischen = () => {
    const a = fadenArt(stand.art, baum);
    wortfeld.placeholder = a.worthilfe || 'Ein Wort dazu — steht später auf einem kleinen Band am Faden (darf leer bleiben)';
    vorschau.innerHTML = '';
    if (!stand.zu) { anfuegen(vorschau, el('span', { class: 'blass' }, 'Wähl noch aus, wen es betrifft.')); tauschKnopf.disabled = true; return; }
    tauschKnopf.disabled = !a.gerichtet;
    const satz = a.satz.replace('{a}', nameVon(stand.von)).replace('{b}', nameVon(stand.zu));
    anfuegen(vorschau,
      el('i', { class: 'stb-fstrich strich-' + a.strich, style: '--fadenfarbe:' + a.farbe }),
      el('b', {}, satz + (stand.wort ? ' — ' + stand.wort : '')),
      a.geruest ? el('small', {}, 'Das ist ein Blutfaden: er baut den Baum. Er entscheidet mit, wer wo hängt.') : null,
      !a.gerichtet ? el('small', {}, 'Dieser Faden hat keine Richtung — er gilt in beide.') : null);
    speichern.disabled = false;
  };

  const speichern = el('button', {
    class: 'knopf voll', onclick: async () => {
      if (!stand.zu) return;
      const art = fadenArt(stand.art, baum);
      const gerichtet = art.gerichtet;
      const schluessel = (f) => stand.art + '|' + (gerichtet ? f.von + '>' + f.zu : [f.von, f.zu].sort().join('~'));
      const b0 = saubererStammbaum(doc);
      const doppelt = b0.faeden.some((f) => (!vorhandener || f.id !== vorhandener.id) && f.art === stand.art && schluessel(f) === schluessel(stand));
      if (doppelt) { toast('Diesen Faden gibt es schon.'); return; }
      if (b0.faeden.length >= TEPPICH_MAX_FAEDEN && !vorhandener) { toast('So viele Fäden trägt ein Tuch nicht mehr.'); return; }
      await teppichSchreiben(doc, (b) => {
        if (vorhandener) {
          const f = b.faeden.find((x) => x.id === vorhandener.id);
          if (f) { f.art = stand.art; f.von = stand.von; f.zu = stand.zu; f.wort = stand.wort; }
        } else {
          b.faeden = b.faeden.concat([{ id: uid(), art: stand.art, von: stand.von, zu: stand.zu, wort: stand.wort, still: false }]);
        }
        return b;
      });
      zu(); if (danach) danach();
    }
  }, vorhandener ? 'Übernehmen' : 'Faden spinnen');

  const kasten = el('div', { class: 'modal stb-fadenfenster' },
    el('div', { class: 'kartenkopf' }, vorhandener ? 'DIESEN FADEN' : 'EINEN FADEN SPINNEN'),
    el('div', { class: 'stb-fvon' }, el('small', {}, 'Geht aus von'), el('b', {}, nameVon(stand.von))),
    el('div', { class: 'stb-abschnitt' }, 'Was für ein Faden'),
    reiter, artenkasten,
    el('div', { class: 'stb-abschnitt' }, 'Wen betrifft es'),
    suchfeld, zielliste,
    el('div', { class: 'stb-abschnitt' }, 'Dazu'),
    wortfeld,
    vorschau,
    el('div', { class: 'reihe' },
      vorhandener ? el('button', { class: 'knopf zart gefahr', onclick: async () => {
        await teppichSchreiben(doc, (b) => { b.faeden = b.faeden.filter((x) => x.id !== vorhandener.id); return b; });
        zu(); if (danach) danach();
      } }, 'Zerschneiden') : null,
      tauschKnopf,
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      speichern));
  const zu = zeigeDeck(kasten);
  reiterZeichnen(); artenZeichnen(); zieleZeichnen(); satzAuffrischen();
  setTimeout(() => suchfeld.focus(), 60);
}

/* ----- Eine eigene Fadenart ----- */
function teppichArtAnlegen(doc, danach) {
  const stand = { name: '', satz: '', farbe: FADEN_FARBEN[0], strich: 'gestrichelt', gruppe: 'band', gerichtet: true };
  const namensfeld = el('input', { type: 'text', placeholder: 'z. B. „Hat den Fluch geerbt von“', maxlength: '60' });
  const satzfeld = el('input', { type: 'text', placeholder: '{a} hat den Fluch geerbt von {b}', maxlength: '120' });
  namensfeld.addEventListener('input', () => {
    stand.name = namensfeld.value;
    if (!satzfeld.value.trim()) satzfeld.placeholder = '{a} — ' + (stand.name || '…') + ' — {b}';
  });
  satzfeld.addEventListener('input', () => { stand.satz = satzfeld.value; });

  const farbreihe = el('div', { class: 'stb-farben' });
  const farbenZeichnen = () => {
    farbreihe.innerHTML = '';
    for (const f of FADEN_FARBEN) {
      farbreihe.append(el('button', { class: 'stb-farbe' + (stand.farbe === f ? ' an' : ''), style: 'background:' + f, onclick: () => { stand.farbe = f; farbenZeichnen(); } }));
    }
  };
  const strichreihe = el('div', { class: 'stb-striche' });
  const stricheZeichnen = () => {
    strichreihe.innerHTML = '';
    for (const s of FADEN_STRICHE) {
      strichreihe.append(el('button', { class: 'stb-strichwahl' + (stand.strich === s ? ' an' : ''), style: '--fadenfarbe:' + stand.farbe, onclick: () => { stand.strich = s; stricheZeichnen(); } },
        el('i', { class: 'stb-fstrich strich-' + s })));
    }
  };
  const gruppenreihe = el('div', { class: 'stb-fgruppenwahl' });
  const gruppenZeichnen = () => {
    gruppenreihe.innerHTML = '';
    for (const [gid, gname] of FADEN_GRUPPEN) {
      if (gid === 'blut') continue;   /* Blut baut den Baum; das bleibt VANIs Sache */
      gruppenreihe.append(el('button', { class: 'stb-fr' + (stand.gruppe === gid ? ' an' : ''), onclick: () => { stand.gruppe = gid; gruppenZeichnen(); } }, gname));
    }
  };

  const kasten = el('div', { class: 'modal stb-artfenster' },
    el('div', { class: 'kartenkopf' }, 'EINE EIGENE FADENART'),
    el('p', { class: 'stb-vor' }, 'Sie gehört diesem Teppich und steht danach in der Auswahl wie jede andere. Blut lässt sich nicht selbst erfinden — daran hängt der Bau des Baumes.'),
    el('div', { class: 'stb-abschnitt' }, 'Wie heißt sie'), namensfeld,
    el('div', { class: 'stb-abschnitt' }, 'Wie liest sie sich'), satzfeld,
    el('small', { class: 'stb-hilfe' }, '{a} ist, von wem der Faden ausgeht, {b} ist der andere. Lässt du es leer, baut VANI den Satz selbst.'),
    el('div', { class: 'stb-abschnitt' }, 'Wohin gehört sie'), gruppenreihe,
    el('div', { class: 'stb-abschnitt' }, 'Farbe und Strich'), farbreihe, strichreihe,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: async () => {
        const name = stand.name.trim();
        if (!name) { toast('Ohne Namen lässt sich der Faden später nicht wiederfinden.'); namensfeld.focus(); return; }
        const id = 'eigen-' + uid().slice(0, 8);
        await teppichSchreiben(doc, (b) => {
          b.eigeneArten = (b.eigeneArten || []).concat([{
            id, name, gruppe: stand.gruppe,
            satz: stand.satz.trim() || ('{a} — ' + name + ' — {b}'),
            farbe: stand.farbe, strich: stand.strich, gerichtet: true
          }]);
          return b;
        });
        zu(); if (danach) danach(id);
      } }, 'Anlegen')));
  const zu = zeigeDeck(kasten);
  farbenZeichnen(); stricheZeichnen(); gruppenZeichnen();
  setTimeout(() => namensfeld.focus(), 60);
}

/* ================= DAS VERZEICHNIS ================= */
function teppichVerzeichnis(doc, neu) {
  const baum = saubererStammbaum(doc);
  let reiter = 'namen';
  const suchfeld = el('input', { type: 'search', class: 'stb-vsuche', placeholder: 'Suchen …' });
  const inhalt = el('div', { class: 'stb-vinhalt' });
  const koepfe = el('div', { class: 'stb-vreiter' });

  const zeichne = () => {
    const b = saubererStammbaum(doc);
    koepfe.innerHTML = '';
    const auff = teppichAuffaelligkeiten(b);
    for (const [id, name, zahl] of [['namen', 'Namen', b.leute.length], ['faeden', 'Fäden', b.faeden.length], ['auff', 'Was auffällt', auff.length]]) {
      koepfe.append(el('button', { class: 'stb-vr' + (reiter === id ? ' an' : ''), onclick: () => { reiter = id; zeichne(); } }, name, zahl ? el('i', {}, String(zahl)) : null));
    }
    inhalt.innerHTML = '';
    const q = suchfeld.value.trim();

    if (reiter === 'namen') {
      const liste = teppichSuche(b, q).slice().sort((x, y) => teppichName(x).localeCompare(teppichName(y), 'de', { sensitivity: 'base' }));
      if (!liste.length) { inhalt.append(el('div', { class: 'leer klein' }, q ? 'Niemand passt dazu.' : 'Noch hängt niemand an der Wand.')); }
      for (const p of liste) {
        const anzahl = teppichFaedenVon(b, p.id).length;
        inhalt.append(el('button', {
          class: 'stb-vzeile' + (p.gebrannt ? ' gebrannt' : ''),
          onclick: () => { zu(); teppichKartusche(doc, p.id, neu); }
        },
          el('b', {}, teppichName(p) || 'ohne Namen'),
          el('span', {}, [teppichJahre(p), anzahl ? anzahl + (anzahl === 1 ? ' Faden' : ' Fäden') : 'kein Faden', p.gebrannt ? 'ausgebrannt' : ''].filter(Boolean).join('  ·  ')),
          teppichAlbumFigur(p) ? el('i', { class: 'stb-vim' }, 'im Album') : null));
      }
    } else if (reiter === 'faeden') {
      const nach = new Map();
      for (const f of b.faeden) {
        const art = fadenArt(f.art, b);
        const satz = fadenSatz(f, b, b.leute.map((p) => ({ id: p.id, name: teppichName(p) })));
        if (q && !satz.toLowerCase().includes(q.toLowerCase())) continue;
        if (!nach.has(art.id)) nach.set(art.id, { art, liste: [] });
        nach.get(art.id).liste.push({ f, satz });
      }
      if (!nach.size) inhalt.append(el('div', { class: 'leer klein' }, q ? 'Kein Faden passt dazu.' : 'Noch ist kein Faden gesponnen.'));
      for (const { art, liste } of [...nach.values()].sort((a, c) => c.liste.length - a.liste.length)) {
        inhalt.append(el('div', { class: 'stb-fgruppe', style: '--fadenfarbe:' + art.farbe },
          el('i', { class: 'stb-fstrich strich-' + art.strich }), art.name, el('small', {}, String(liste.length))));
        for (const { f, satz } of liste) {
          inhalt.append(el('button', { class: 'stb-vzeile faden', style: '--fadenfarbe:' + art.farbe, onclick: () => { zu(); teppichFadenBearbeiten(doc, f, neu); } },
            el('b', {}, satz)));
        }
      }
    } else {
      if (!auff.length) inhalt.append(el('div', { class: 'leer klein' }, 'Nichts fällt auf. Das heißt nicht, dass alles stimmt — nur, dass sich nichts widerspricht.'));
      for (const a of auff) {
        inhalt.append(el('button', { class: 'stb-vzeile auff', onclick: () => { zu(); if (a.wer) teppichKartusche(doc, a.wer, neu); } },
          el('i', { class: 'stb-vsym' }, '!'), el('b', {}, a.text)));
      }
    }
  };
  suchfeld.addEventListener('input', entprellt(zeichne, 180, true));

  const kasten = el('div', { class: 'modal stb-verzeichnis' },
    el('div', { class: 'kartenkopf' }, 'DAS VERZEICHNIS'),
    koepfe, suchfeld, inhalt,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => { zu(); teppichAusAlbum(doc, neu); } }, 'Aus dem Album holen'),
      el('button', { class: 'knopf zart', onclick: () => { zu(); teppichPersonNeu(doc, '', neu); } }, '+ Name'),
      el('button', { class: 'knopf voll', onclick: () => zu() }, 'Zurück zum Teppich')));
  const zu = zeigeDeck(kasten);
  zeichne();
  setTimeout(() => suchfeld.focus(), 60);
}

/* ================= DER RAHMEN: TITEL, SPRUCH, TUCH ================= */
function teppichEinstellungen(doc, danach, frisch) {
  const baum = saubererStammbaum(doc);
  const titelfeld = el('input', { type: 'text', value: baum.titel, placeholder: 'Wie heißt dieses Haus?', maxlength: '140' });
  const spruchfeld = el('input', { type: 'text', value: baum.spruch, placeholder: 'Was am Rand entlangläuft — leer lassen geht auch', maxlength: '120' });
  const sichern = teppichSchreiberFuer(doc, () => { if (danach) danach(); });
  titelfeld.addEventListener('input', () => { doc.titel = titelfeld.value.slice(0, 140); sichern(); });
  spruchfeld.addEventListener('input', () => { doc.spruch = spruchfeld.value.slice(0, 120); sichern(); });

  const stoffreihe = el('div', { class: 'stb-stoffe' });
  const stoffeZeichnen = () => {
    stoffreihe.innerHTML = '';
    for (const [id, name, a, b] of TEPPICH_STOFFE) {
      stoffreihe.append(el('button', {
        class: 'stb-stoff' + ((doc.stoff || 'moos') === id ? ' an' : ''), title: name,
        style: '--tuch:' + a + ';--tuch2:' + b,
        onclick: () => { doc.stoff = id; stoffeZeichnen(); sichern(); }
      }, el('span', {}, name)));
    }
  };

  const vorschlaege = el('div', { class: 'stb-vorschlaege' },
    ...TEPPICH_SPRUCH_VORSCHLAEGE.map((s) => el('button', { class: 'stb-vs', onclick: () => { spruchfeld.value = s; doc.spruch = s; sichern(); } }, s)));

  const artenkasten = el('div', { class: 'stb-eigenarten' });
  const artenZeichnen = () => {
    artenkasten.innerHTML = '';
    const b = saubererStammbaum(doc);
    if (!b.eigeneArten.length) { artenkasten.append(el('div', { class: 'leer klein' }, 'Noch keine eigene Fadenart.')); }
    for (const a of b.eigeneArten) {
      const benutzt = b.faeden.filter((f) => f.art === a.id).length;
      artenkasten.append(el('div', { class: 'stb-eazeile', style: '--fadenfarbe:' + a.farbe },
        el('i', { class: 'stb-fstrich strich-' + a.strich }),
        el('b', {}, a.name),
        el('small', {}, benutzt ? benutzt + (benutzt === 1 ? ' Faden' : ' Fäden') : 'unbenutzt'),
        el('button', { class: 'stb-fweg', title: benutzt ? 'Geht nicht — es hängen noch Fäden daran' : 'Diese Art wegnehmen', disabled: benutzt ? '' : null,
          onclick: async () => { await teppichSchreiben(doc, (bb) => { bb.eigeneArten = bb.eigeneArten.filter((x) => x.id !== a.id); return bb; }); artenZeichnen(); if (danach) danach(); } }, '×')));
    }
    artenkasten.append(el('button', { class: 'stb-fneu', onclick: () => teppichArtAnlegen(doc, () => { artenZeichnen(); if (danach) danach(); }) }, '+ Eine eigene Fadenart'));
  };

  const kasten = el('div', { class: 'modal stb-rahmenfenster' },
    el('div', { class: 'kartenkopf' }, frisch ? 'EIN NEUER WANDTEPPICH' : 'DER RAHMEN'),
    el('div', { class: 'stb-abschnitt' }, 'Titel'), titelfeld,
    el('div', { class: 'stb-abschnitt' }, 'Der Spruch am Rand'), spruchfeld, vorschlaege,
    el('div', { class: 'stb-abschnitt' }, 'Das Tuch'), stoffreihe,
    !frisch ? el('div', { class: 'stb-abschnitt' }, 'Eigene Fadenarten') : null,
    !frisch ? artenkasten : null,
    el('div', { class: 'reihe' },
      !frisch ? el('button', { class: 'knopf zart', title: 'Alles als Text ablegen — zum Weiterschreiben', onclick: () => teppichAlsBlatt(doc) }, 'Als Blatt ablegen') : null,
      !frisch ? el('button', { class: 'knopf zart gefahr', onclick: async () => {
        if (!(await frage('Diesen Wandteppich abhängen? Er geht in den Papierkorb, nicht ins Nichts.', { ja: 'Abhängen' }))) return;
        sichern.sofort();
        await loesche(doc.id);
        zu();
        document.querySelectorAll('.tep-fenster').forEach((f) => { const s = f.closest('.schleier'); if (s) s.remove(); });
        if (danach) danach();
      } }, 'Abhängen') : null,
      el('button', { class: 'knopf voll', onclick: () => { sichern.sofort(); zu(); if (danach) danach(); } }, frisch ? 'Weben' : 'Fertig')));
  const zu = zeigeDeck(kasten, () => { sichern.sofort(); if (danach) danach(); });
  stoffeZeichnen(); if (!frisch) artenZeichnen();
  setTimeout(() => titelfeld.focus(), 60);
}

/* Alles als Text ablegen — damit ein Stammbaum nicht in einem Format
   gefangen ist, das nur VANI lesen kann. */
function teppichAlsBlatt(doc) {
  const b = saubererStammbaum(doc);
  const name = (id) => { const p = b.leute.find((x) => x.id === id); return teppichName(p) || 'ohne Namen'; };
  const zeilen = [];
  zeilen.push((b.titel || 'Ohne Titel').toUpperCase());
  if (b.spruch) zeilen.push(b.spruch);
  zeilen.push('');
  zeilen.push('DIE NAMEN');
  for (const p of b.leute.slice().sort((x, y) => teppichName(x).localeCompare(teppichName(y), 'de'))) {
    zeilen.push('· ' + (teppichName(p) || 'ohne Namen') + (teppichJahre(p) ? '  ' + teppichJahre(p) : '') + (p.gebrannt ? '  [ausgebrannt]' : ''));
    if (p.notiz) zeilen.push('    ' + p.notiz);
  }
  zeilen.push('');
  zeilen.push('DIE FÄDEN');
  const nach = new Map();
  for (const f of b.faeden) {
    const art = fadenArt(f.art, b);
    if (!nach.has(art.name)) nach.set(art.name, []);
    nach.get(art.name).push(art.satz.replace('{a}', name(f.von)).replace('{b}', name(f.zu)) + (f.wort ? ' — ' + f.wort : ''));
  }
  for (const [artName, liste] of nach) {
    zeilen.push(artName.toUpperCase());
    for (const s of liste) zeilen.push('· ' + s);
    zeilen.push('');
  }
  if (typeof blattAusText === 'function') {
    blattAusText((b.titel || 'Wandteppich') + ' — alle Namen und Fäden', zeilen.join('\n').trim());
    toast('Liegt bei den Blättern.', 4200);
  }
}
