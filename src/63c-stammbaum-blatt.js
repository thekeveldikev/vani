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
    von: '', bis: '', notiz: '', zeichen: 'keins', geschlecht: '', gebrannt: false
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
          notiz: '', zeichen: 'keins', geschlecht: '', gebrannt: false
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

/* ----- Einen Namen von Hand ablegen -----
   Gerechnet ist gut, aber manchmal weiss man es besser. Wer einen Namen
   zieht, nagelt ihn fest; alle anderen ordnen sich weiter von selbst um ihn
   herum. Zurueck geht es jederzeit — einzeln in der Kartusche oder fuer
   alle mit dem Knopf in der Leiste. */
async function teppichPersonSetzen(doc, personId, x, y, neu) {
  if (!doc) return;
  await teppichSchreiben(doc, (b) => {
    const p = b.leute.find((q) => q.id === personId);
    if (p) { p.festX = x; p.festY = y; }
    return b;
  });
  if (neu) neu();
}
async function teppichPersonLoesen(doc, personId, neu) {
  if (!doc) return;
  await teppichSchreiben(doc, (b) => {
    const p = b.leute.find((q) => q.id === personId);
    if (p) { p.festX = null; p.festY = null; }
    return b;
  });
  if (neu) neu();
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

  /* --- Das Geschlecht ---
     Nicht, um jemanden einzusortieren, sondern damit die Wörter stimmen:
     „Noras Großmutter“ oder „Noras Großvater“, „Tante“ oder „Onkel“.
     Wer nichts sagt, bekommt beide Formen — geraten wird nichts. */
  const gschlechtreihe = el('div', { class: 'stb-geschlecht' });
  const geschlechtZeichnen = () => {
    gschlechtreihe.innerHTML = '';
    const jetzt = (lebend() || person).geschlecht || '';
    for (const [id, name] of TEPPICH_GESCHLECHTER) {
      gschlechtreihe.append(el('button', {
        class: 'stb-gs' + (jetzt === id ? ' an' : ''),
        onclick: () => { hinein((p2) => { p2.geschlecht = id; }); geschlechtZeichnen(); sichern(); }
      }, name));
    }
  };

  /* --- Wie hängt diese Person mit den anderen zusammen? --- */
  const sippenkasten = el('div', { class: 'stb-sippe' });
  const sippeZeichnen = () => {
    sippenkasten.innerHTML = '';
    const b = saubererStammbaum(doc);
    const andere = b.leute.filter((x) => x.id !== personId);
    if (!andere.length) {
      sippenkasten.append(el('div', { class: 'leer klein' }, 'Erst wenn ein zweiter Name hängt, gibt es etwas auszurechnen.'));
      return;
    }
    const wahl = el('select', { class: 'stb-sippewahl' },
      el('option', { value: '' }, 'Mit wem vergleichen?'),
      ...andere.map((x) => el('option', { value: x.id }, teppichName(x))));
    const antwort = el('div', { class: 'stb-sippeantwort' });
    wahl.addEventListener('change', () => {
      antwort.innerHTML = '';
      if (!wahl.value) return;
      const v = teppichVerwandtschaft(b, personId, wahl.value);
      if (!v) return;
      antwort.append(el('b', { class: 'stb-sippesatz' }, v.satz));
      if (v.ueber && v.art !== 'weg') {
        antwort.append(el('small', {}, v.art === 'bund'
          ? 'Über ' + v.ueber + '.'
          : 'Gemeinsam bis zu ' + v.ueber + ' — ' + v.auf + ' nach oben, ' + v.ab + ' zurück.'));
      }
      if (v.art === 'weg' && v.schritte) {
        const kette = el('div', { class: 'stb-sippeweg' });
        for (const sch of v.schritte) {
          const von = b.leute.find((x) => x.id === sch.von);
          kette.append(el('span', {}, teppichName(von)), el('i', {}, ' — ' + sch.wort.toLowerCase() + ' → '));
        }
        const letzte = b.leute.find((x) => x.id === v.schritte[v.schritte.length - 1].zu);
        kette.append(el('span', {}, teppichName(letzte)));
        antwort.append(kette);
      }
    });
    sippenkasten.append(wahl, antwort);
  };

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
    el('div', { class: 'stb-abschnitt' }, 'Wie man von ihr oder ihm spricht'),
    gschlechtreihe,
    el('div', { class: 'stb-abschnitt' }, 'Zeichen'),
    zeichenreihe,
    el('div', { class: 'stb-abschnitt' }, 'Notiz'),
    notizfeld,
    el('div', { class: 'stb-abschnitt' }, 'Verwandtschaft'),
    sippenkasten,
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
      (lebend() || person).festX != null ? el('button', {
        class: 'knopf zart', title: 'Diesen Namen wieder von VANI einordnen lassen',
        onclick: async () => { await teppichPersonLoesen(doc, personId, neu); zu(); }
      }, 'Wieder einordnen lassen') : null,
      !albumFigur ? el('button', { class: 'knopf zart', title: 'Eine Doppelseite im Album anlegen und mit diesem Namen verbinden', onclick: () => teppichInsAlbum(doc, personId, () => { kopfAuffrischen(); if (neu) neu(); }) }, 'Ins Album übernehmen') : null,
      el('button', { class: 'knopf voll', onclick: () => { sichern.sofort(); zu(); if (neu) neu(); } }, 'Fertig')));

  const zu = zeigeDeck(kasten, () => { sichern.sofort(); if (neu) neu(); });
  kopfAuffrischen(); zeichenZeichnen(); geschlechtZeichnen(); sippeZeichnen(); faedenZeichnen();
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
/* Vom Tuch aus: von einem Namen zum anderen gezogen. Beide Enden stehen
   schon fest, nur die Art fehlt noch. */
function teppichFadenSpinnenZu(doc, vonId, zuId, danach) {
  teppichFadenFenster(doc, null, vonId, danach, null, zuId);
}
function teppichFadenBearbeiten(doc, faden, danach) {
  teppichFadenFenster(doc, faden, faden.von, danach);
}

function teppichFadenFenster(doc, vorhandener, vonId, danach, vorgabeArt, zielId) {
  const baum = saubererStammbaum(doc);
  const stand = {
    art: vorhandener ? vorhandener.art : (vorgabeArt || 'kind'),
    von: vorhandener ? vorhandener.von : vonId,
    zu: vorhandener ? vorhandener.zu : (zielId || ''),
    wort: vorhandener ? vorhandener.wort : ''
  };
  let gruppe = fadenArt(stand.art, baum).gruppe;

  const nameVon = (id) => { const p = baum.leute.find((x) => x.id === id); return teppichName(p) || 'ohne Namen'; };

  /* --- Fadenart wählen --- */
  const reiter = el('div', { class: 'stb-freiter' });
  const artenkasten = el('div', { class: 'stb-farten' });
  const reiterZeichnen = () => {
    reiter.innerHTML = '';
    const alle = fadenAlleArten(baum);
    for (const [gid, gname] of FADEN_GRUPPEN) {
      const n = alle.filter((a) => a.gruppe === gid).length;
      reiter.append(el('button', { class: 'stb-fr' + (gruppe === gid ? ' an' : ''), onclick: () => { gruppe = gid; reiterZeichnen(); artenZeichnen(); } },
        gname, el('i', {}, String(n))));
    }
    const eigene = alle.filter((a) => a.eigen || a.bibliothek);
    reiter.append(el('button', { class: 'stb-fr' + (gruppe === 'eigen' ? ' an' : ''), onclick: () => { gruppe = 'eigen'; reiterZeichnen(); artenZeichnen(); } },
      'Eigene', eigene.length ? el('i', {}, String(eigene.length)) : null));
  };
  const artenZeichnen = () => {
    artenkasten.innerHTML = '';
    const alle = fadenAlleArten(baum);
    const liste = gruppe === 'eigen' ? alle.filter((a) => a.eigen || a.bibliothek) : alle.filter((a) => a.gruppe === gruppe);
    if (!liste.length) {
      artenkasten.append(el('div', { class: 'leer klein' }, 'Noch keine eigene Fadenart. Leg eine an — du entscheidest dabei, ob sie nur zu diesem Teppich gehört oder in die Bibliothek geht.'));
    }
    for (const a of liste) {
      artenkasten.append(el('button', {
        class: 'stb-fart' + (stand.art === a.id ? ' an' : ''), style: '--fadenfarbe:' + a.farbe,
        title: a.hilfe || a.satz.replace('{a}', 'Jemand').replace('{b}', 'jemand anderem'),
        onclick: () => { stand.art = a.id; artenZeichnen(); satzAuffrischen(); }
      }, el('i', { class: 'stb-fstrich strich-' + a.strich }), a.name,
        a.bibliothek ? el('b', { class: 'stb-fheimat' }, '◆') : a.eigen ? el('b', { class: 'stb-fheimat teppich' }, '◇') : null));
    }
    if (gruppe === 'eigen') {
      artenkasten.append(el('button', { class: 'stb-fneu', onclick: () => teppichArtAnlegen(doc, (id) => {
        const frisch = saubererStammbaum(doc);
        baum.eigeneArten = frisch.eigeneArten;
        stand.art = id; artenZeichnen(); reiterZeichnen(); satzAuffrischen();
      }) }, '+ Eine eigene Fadenart'));
      artenkasten.append(el('small', { class: 'stb-hilfe' }, '◆ steht in der Bibliothek und gilt in allen Stammbäumen.  ◇ gehört nur diesem Teppich.'));
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
          const person = { id: uid(), name: q.slice(0, 120), albumId: '', von: '', bis: '', notiz: '', zeichen: 'keins', geschlecht: '', gebrannt: false };
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

/* ----- Eine eigene Fadenart -----
   Zwei Fragen entscheiden alles: Wie liest sie sich? Und wo gehört sie hin?
   Nur zu DIESEM Teppich — oder in die Bibliothek, wo sie in jedem Stammbaum
   zur Verfügung steht. Beides ist richtig; man weiß nur vorher nicht immer,
   welches. Deshalb lässt es sich später umhängen. */
function teppichArtAnlegen(doc, danach, vorlage) {
  const stand = Object.assign({
    name: '', satz: '', hilfe: '', worthilfe: '',
    farbe: FADEN_FARBEN[0], strich: 'gestrichelt', gruppe: 'band',
    gerichtet: true, heimat: 'teppich'
  }, vorlage || {});

  const namensfeld = el('input', { type: 'text', value: stand.name, placeholder: 'z. B. „Hat den Fluch geerbt von“', maxlength: '60' });
  const satzfeld = el('input', { type: 'text', value: stand.satz, placeholder: '{a} hat den Fluch geerbt von {b}', maxlength: '120' });
  const hilfefeld = el('input', { type: 'text', value: stand.hilfe, placeholder: 'Wofür ist das da? (steht später als Hinweis dran)', maxlength: '200' });
  const worthilfefeld = el('input', { type: 'text', value: stand.worthilfe, placeholder: 'Was soll ins Feld „Dazu“? (z. B. „Welcher Fluch?“)', maxlength: '200' });
  namensfeld.addEventListener('input', () => { stand.name = namensfeld.value; vorschauZeichnen(); });
  satzfeld.addEventListener('input', () => { stand.satz = satzfeld.value; vorschauZeichnen(); });
  hilfefeld.addEventListener('input', () => { stand.hilfe = hilfefeld.value; });
  worthilfefeld.addEventListener('input', () => { stand.worthilfe = worthilfefeld.value; });

  /* --- Farbe: die Auswahl plus jede beliebige --- */
  const farbreihe = el('div', { class: 'stb-farben' });
  const freieFarbe = el('input', { type: 'color', class: 'stb-farbfrei', value: stand.farbe, title: 'Eine ganz eigene Farbe' });
  freieFarbe.addEventListener('input', () => { stand.farbe = fadenFarbeSauber(freieFarbe.value); farbenZeichnen(); vorschauZeichnen(); });
  const farbenZeichnen = () => {
    farbreihe.innerHTML = '';
    for (const f of FADEN_FARBEN) {
      farbreihe.append(el('button', { class: 'stb-farbe' + (stand.farbe === f ? ' an' : ''), style: 'background:' + f, title: f, onclick: () => { stand.farbe = f; freieFarbe.value = f; farbenZeichnen(); vorschauZeichnen(); } }));
    }
    farbreihe.append(freieFarbe);
  };

  /* --- Strichbild --- */
  const strichreihe = el('div', { class: 'stb-striche' });
  const stricheZeichnen = () => {
    strichreihe.innerHTML = '';
    for (const st of FADEN_STRICHE) {
      strichreihe.append(el('button', {
        class: 'stb-strichwahl' + (stand.strich === st ? ' an' : ''), style: '--fadenfarbe:' + stand.farbe,
        title: FADEN_STRICH_NAMEN[st] || st,
        onclick: () => { stand.strich = st; stricheZeichnen(); vorschauZeichnen(); }
      }, el('i', { class: 'stb-fstrich strich-' + st })));
    }
  };

  /* --- Gruppe --- */
  const gruppenreihe = el('div', { class: 'stb-fgruppenwahl' });
  const gruppenZeichnen = () => {
    gruppenreihe.innerHTML = '';
    for (const [gid, gname, gtext] of FADEN_GRUPPEN) {
      if (gid === 'blut') continue;   /* Blut baut den Baum; das bleibt VANIs Sache */
      gruppenreihe.append(el('button', { class: 'stb-fr' + (stand.gruppe === gid ? ' an' : ''), title: gtext, onclick: () => { stand.gruppe = gid; gruppenZeichnen(); } }, gname));
    }
  };

  /* --- Richtung --- */
  const richtungreihe = el('div', { class: 'stb-fgruppenwahl' });
  const richtungZeichnen = () => {
    richtungreihe.innerHTML = '';
    for (const [wert, name, hilfe] of [[true, 'Hat eine Richtung', 'A tut etwas mit B — umgekehrt wäre es etwas anderes'], [false, 'Gilt in beide', 'Was für A gilt, gilt auch für B']]) {
      richtungreihe.append(el('button', { class: 'stb-fr' + (stand.gerichtet === wert ? ' an' : ''), title: hilfe, onclick: () => { stand.gerichtet = wert; richtungZeichnen(); vorschauZeichnen(); } }, name));
    }
  };

  /* --- Wohin sie gehört --- */
  const heimatreihe = el('div', { class: 'stb-heimat' });
  const heimatZeichnen = () => {
    heimatreihe.innerHTML = '';
    for (const [wert, name, text] of [
      ['teppich', 'Nur dieser Teppich', 'Sie gehört zu diesem einen Stammbaum und taucht sonst nirgends auf.'],
      ['bibliothek', 'In die Bibliothek', 'Sie steht danach in JEDEM Stammbaum zur Auswahl — auch in denen, die du erst noch webst.']
    ]) {
      heimatreihe.append(el('button', { class: 'stb-heimatwahl' + (stand.heimat === wert ? ' an' : ''), onclick: () => { stand.heimat = wert; heimatZeichnen(); } },
        el('b', {}, name), el('small', {}, text)));
    }
  };

  /* --- Die Vorschau: so wird der Faden aussehen und sich lesen --- */
  const vorschau = el('div', { class: 'stb-artvorschau' });
  const vorschauZeichnen = () => {
    vorschau.innerHTML = '';
    const name = stand.name.trim() || 'Deine Fadenart';
    const satz = (stand.satz.trim() || '{a} — ' + name + ' — {b}').replace('{a}', 'Alma').replace('{b}', 'Halvar');
    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('viewBox', '0 0 240 44');
    svg.setAttribute('class', 'stb-avbild');
    svg.style.setProperty('--fadenfarbe', stand.farbe);
    const mach = (art, attrs) => { const k = document.createElementNS(svgns, art); for (const q of Object.keys(attrs)) k.setAttribute(q, String(attrs[q])); return k; };
    const d = 'M 18 30 Q 120 -4 222 30';
    svg.append(mach('path', { d, class: 'tep-rankesaum' }));
    if (stand.strich === 'doppelt') {
      svg.append(mach('path', { d, class: 'tep-rankelinie doppelt-unten' }));
      svg.append(mach('path', { d, class: 'tep-rankelinie doppelt-oben' }));
    } else {
      svg.append(mach('path', { d, class: 'tep-rankelinie strich-' + stand.strich }));
    }
    svg.append(mach('circle', { cx: 18, cy: 30, r: 4, class: 'tep-rankeknoten' }));
    if (stand.gerichtet) svg.append(mach('path', { d: 'M 0 0 L -11 -5 L -7.5 0 L -11 5 Z', class: 'tep-spitze', transform: 'translate(222 30) rotate(18)' }));
    else svg.append(mach('circle', { cx: 222, cy: 30, r: 4, class: 'tep-rankeknoten' }));
    vorschau.append(svg, el('b', {}, satz));
  };

  const kasten = el('div', { class: 'modal stb-artfenster' },
    el('div', { class: 'kartenkopf' }, 'EINE EIGENE FADENART'),
    el('p', { class: 'stb-vor' }, 'Blut lässt sich nicht selbst erfinden — daran hängt der Bau des Baumes. Alles andere schon.'),
    el('div', { class: 'stb-abschnitt' }, 'Wie heißt sie'), namensfeld,
    el('div', { class: 'stb-abschnitt' }, 'Wie liest sie sich'), satzfeld,
    el('small', { class: 'stb-hilfe' }, '{a} ist, von wem der Faden ausgeht, {b} ist der andere. Lässt du es leer, baut VANI den Satz selbst.'),
    el('div', { class: 'stb-abschnitt' }, 'Wofür ist sie da'), hilfefeld, worthilfefeld,
    el('div', { class: 'stb-abschnitt' }, 'Wohin gehört sie'), heimatreihe,
    el('div', { class: 'stb-abschnitt' }, 'Wohin im Verzeichnis'), gruppenreihe,
    el('div', { class: 'stb-abschnitt' }, 'Richtung'), richtungreihe,
    el('div', { class: 'stb-abschnitt' }, 'Farbe und Strich'), farbreihe, strichreihe,
    el('div', { class: 'stb-abschnitt' }, 'So sieht sie aus'), vorschau,
    el('div', { class: 'reihe' },
      el('button', { class: 'knopf zart', onclick: () => zu() }, 'Abbrechen'),
      el('button', { class: 'knopf voll', onclick: async () => {
        const name = stand.name.trim();
        if (!name) { toast('Ohne Namen lässt sich der Faden später nicht wiederfinden.'); namensfeld.focus(); return; }
        const art = {
          id: 'eigen-' + uid().slice(0, 8), name, gruppe: stand.gruppe,
          satz: stand.satz.trim() || ('{a} — ' + name + ' — {b}'),
          hilfe: stand.hilfe.trim(), worthilfe: stand.worthilfe.trim(),
          farbe: stand.farbe, strich: stand.strich, gerichtet: stand.gerichtet
        };
        if (stand.heimat === 'bibliothek') {
          if (!fadenBibliothekHinzu(art)) { toast('Das hat gerade nicht geklappt.'); return; }
          toast('Steht jetzt in der Bibliothek — in jedem Stammbaum.', 5200);
        } else {
          await teppichSchreiben(doc, (b) => { b.eigeneArten = (b.eigeneArten || []).concat([art]); return b; });
          toast('Gehört jetzt zu diesem Teppich.', 4200);
        }
        zu(); if (danach) danach(art.id);
      } }, 'Anlegen')));
  const zu = zeigeDeck(kasten);
  farbenZeichnen(); stricheZeichnen(); gruppenZeichnen(); richtungZeichnen(); heimatZeichnen(); vorschauZeichnen();
  setTimeout(() => namensfeld.focus(), 60);
}

/* ----- Die Bibliothek verwalten ----- */
function teppichBibliothekFenster(doc, danach) {
  const liste = el('div', { class: 'stb-eigenarten' });
  const zeichne = () => {
    liste.innerHTML = '';
    const bib = fadenBibliothek();
    if (!bib.length) liste.append(el('div', { class: 'leer klein' }, 'Die Bibliothek ist noch leer. Was du hier ablegst, steht in jedem Stammbaum zur Auswahl.'));
    for (const a of bib) {
      const wieoft = stammbaeume().reduce((n, b) => n + saubererStammbaum(b).faeden.filter((f) => f.art === a.id).length, 0);
      liste.append(el('div', { class: 'stb-eazeile', style: '--fadenfarbe:' + a.farbe },
        el('i', { class: 'stb-fstrich strich-' + a.strich }),
        el('b', {}, a.name),
        el('small', {}, wieoft ? wieoft + (wieoft === 1 ? ' Faden' : ' Fäden') : 'unbenutzt'),
        el('button', {
          class: 'stb-fweg', title: wieoft ? 'Geht nicht — es hängen noch Fäden daran' : 'Aus der Bibliothek nehmen',
          disabled: wieoft ? '' : null,
          onclick: () => { fadenBibliothekSetzen(fadenBibliothek().filter((x) => x.id !== a.id)); zeichne(); if (danach) danach(); }
        }, '×')));
    }
    liste.append(el('button', { class: 'stb-fneu', onclick: () => teppichArtAnlegen(doc, () => { zeichne(); if (danach) danach(); }, { heimat: 'bibliothek' }) }, '+ Eine Fadenart in die Bibliothek'));
  };
  const kasten = el('div', { class: 'modal stb-rahmenfenster' },
    el('div', { class: 'kartenkopf' }, 'DIE BIBLIOTHEK'),
    el('p', { class: 'stb-vor' }, 'Fadenarten, die in JEDEM Stammbaum zur Auswahl stehen — auch in denen, die du erst noch webst. Was nur zu einem Teppich gehört, steht dort und nicht hier.'),
    liste,
    el('div', { class: 'reihe' }, el('button', { class: 'knopf voll', onclick: () => zu() }, 'Fertig')));
  const zu = zeigeDeck(kasten);
  zeichne();
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
    const haeuser = teppichHaeuser(b);
    for (const [id, name, zahl] of [['namen', 'Namen', b.leute.length], ['faeden', 'Fäden', b.faeden.length],
      ['haeuser', 'Häuser', haeuser.length], ['auff', 'Was auffällt', auff.length]]) {
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
    } else if (reiter === 'haeuser') {
      /* Ein Stammbaum zerfällt von selbst in Sippen: Gruppen, die über Blut
         und Bund zusammenhängen. Jede bekommt den häufigsten Nachnamen als
         Namen und ein Wappen, gerechnet aus eben diesem Namen — dieselbe
         Heraldik wie auf dem Kartentisch. Ein Haus, zwei Werkzeuge. */
      if (!haeuser.length) {
        inhalt.append(el('div', { class: 'leer klein' }, 'Noch hängt niemand mit jemandem zusammen. Ein Haus entsteht, sobald zwei Namen ein Band haben.'));
      }
      for (const h of haeuser) {
        const kopf = el('div', { class: 'stb-haus' });
        if (h.wappen && typeof planWappenSVG === 'function') {
          const schild = el('span', { class: 'stb-hauswappen' });
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          /* Der Ausschnitt muss zum Schild passen: es ist 0,84-mal so
             breit wie hoch. Zu klein gezeichnet verschwindet die Schraffur,
             und dann ist das Wappen ein grauer Fleck. */
          const hoch = 48, breit = hoch * 0.84;
          svg.setAttribute('viewBox', (-breit / 2 - 3) + ' ' + (-hoch / 2 - 3) + ' ' + (breit + 6) + ' ' + (hoch + 6));
          svg.setAttribute('width', String(Math.round(breit + 6)));
          svg.setAttribute('height', String(Math.round(hoch + 6)));
          svg.append(planWappenSVG(h.wappen, hoch));
          schild.append(svg);
          kopf.append(schild);
        }
        kopf.append(el('div', { class: 'stb-haustext' },
          el('b', {}, h.name ? 'Haus ' + h.name : 'Ein Haus ohne Namen'),
          el('small', {}, h.wieViele + (h.wieViele === 1 ? ' Name' : ' Namen') +
            (h.wappen && typeof planBlason === 'function' ? '  ·  ' + planBlason(h.wappen) : ''))));
        inhalt.append(kopf);
        for (const id of h.leute) {
          const person = b.leute.find((x) => x.id === id);
          if (!person) continue;
          if (q && !teppichName(person).toLowerCase().includes(q.toLowerCase())) continue;
          inhalt.append(el('button', {
            class: 'stb-vzeile' + (person.gebrannt ? ' gebrannt' : ''),
            onclick: () => { zu(); teppichKartusche(doc, person.id, neu); }
          }, el('b', {}, teppichName(person) || 'ohne Namen'), el('span', {}, teppichJahre(person))));
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
    artenkasten.append(el('button', { class: 'stb-fneu bib', onclick: () => teppichBibliothekFenster(doc, () => { artenZeichnen(); if (danach) danach(); }) },
      'Die Bibliothek — ' + fadenBibliothek().length + (fadenBibliothek().length === 1 ? ' Art für alle Stammbäume' : ' Arten für alle Stammbäume')));
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
