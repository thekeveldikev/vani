/* ================================================================
   VANI — Feinheiten: Thema, Klang, Statistik, Sicherung
   ================================================================ */

function syncStatusWorte(status) {
  const art = status && status.art;
  if (art === 'synchron') return ['synchron', 'Alles ist auf dem gleichen Stand.'];
  if (art === 'verbindet') return ['arbeitet', 'VANI verbindet die Geräte …'];
  if (art === 'offline') return ['offline', 'Änderungen bleiben sicher hier und gehen später weiter.'];
  if (art === 'schluessel') return ['Achtung', 'Der Bereichsschlüssel passt nicht oder wurde zurückgezogen.'];
  if (art === 'fehler') return ['Achtung', 'Etwas ist noch nicht fertig synchronisiert.'];
  return ['nur hier', 'Dieser Bestand ist noch mit keinem privaten Bereich verbunden.'];
}

async function neuerSyncBereich() {
  const name = await eingabe({ titel: 'Wie soll dein privater Bereich heißen?', wert: 'Mein VANI', platzhalter: 'z. B. Kevins VANI', ok: 'Weiter' });
  if (!name) return;
  const standard = await syncStandardServer();
  const server = await eingabe({ titel: 'Adresse des VANI-Sync-Dienstes', wert: standard, platzhalter: 'https://…', ok: 'Bereich anlegen' });
  if (!server) return;
  toast('Lege deinen verschlüsselten Bereich an …', 5000);
  try { await syncErstelleBereich(name, server); toast('Dein privater Bereich ist bereit.', 4000); zeichne(); }
  catch (e) { toast((e && e.message) || 'Der Bereich ließ sich noch nicht anlegen.', 5000); }
}

async function vorhandenenSyncBereichKoppeln(codeVorgabe) {
  const code = codeVorgabe || await eingabe({ titel: 'Kopplungscode vom anderen Gerät', platzhalter: 'VANI1-…', mehrzeilig: true, ok: 'Prüfen und verbinden' });
  if (!code) return;
  let modus = 'ersetzen';
  if (D.docs.size) {
    modus = await menue([
      { text: 'Beides zusammenlegen (nichts löschen)', icon: 'plus', wert: 'dazu' },
      { text: 'Diesen Gerätebestand ersetzen', icon: 'wandel', wert: 'ersetzen', rot: true }
    ], 'Was soll mit dem jetzigen Bestand auf diesem Gerät geschehen?');
    if (!modus) return;
    if (modus === 'ersetzen' && !await frage('Wirklich den jetzigen Bestand auf diesem Gerät durch den gekoppelten Bereich ersetzen? Eine Sicherung vorher ist die sicherste Wahl.', { ja: 'Ersetzen', gefahr: true })) return;
  }
  toast('Prüfe den geheimen Bereich …', 5000);
  try { await syncVerbindeBereich(code, modus); toast('Verbunden. Ab jetzt halten sich die Geräte gegenseitig aktuell.', 5000); zeichne(); }
  catch (e) { toast((e && e.message) || 'Der Kopplungscode ließ sich nicht verbinden.', 5000); }
}

async function kopiereVaniAdresse() {
  try { await navigator.clipboard.writeText(VANI_HAUPTADRESSE); toast('Die einzige VANI-Adresse ist kopiert.'); }
  catch (e) { await teileText(VANI_HAUPTADRESSE); }
}

async function kopiereSyncKopplungscode() {
  if (!syncIstVerbunden()) return false;
  if (!await frage('Der Kopplungscode öffnet deinen ganzen privaten Bereich. Nur auf einem eigenen oder wirklich vertrauten Gerät verwenden.', { ja: 'Code kopieren' })) return false;
  const code = syncKopplungscode();
  try { await navigator.clipboard.writeText(code); toast('Kopplungscode kopiert.'); }
  catch (e) { await teileText(code); }
  return true;
}

function vaniHauptadresseKnopf(text = 'VANI öffnen') {
  return el('a', {
    class: 'knopf voll', href: VANI_HAUPTADRESSE, target: '_blank',
    rel: 'noopener noreferrer'
  }, el('span', { html: ik('rechts'), style: 'display:flex' }), text);
}

function vaniAdresskarte() {
  const art = vaniAdresseArt();
  if (art === 'lokal') return null;
  if (art === 'haupt') {
    return el('div', { class: 'karte hauptadresse-karte richtig' },
      el('span', { class: 'hauptadresse-siegel', html: ik('zuhause') }),
      el('div', { class: 'hauptadresse-text' },
        el('b', {}, 'Hier bist du richtig — das ist VANI.'),
        el('p', {}, 'Diese eine Adresse ist für iPad, Handy und Browser. Updates kommen hier hinter demselben Icon an. Der verschlüsselte Tresor arbeitet unsichtbar im Hintergrund.'),
        el('code', {}, VANI_HAUPTADRESSE)),
      el('div', { class: 'fussreihe hauptadresse-aktionen' },
        el('button', { class: 'knopf', onclick: () => kopiereVaniAdresse() }, 'Adresse kopieren')));
  }
  if (art === 'desktop') {
    return el('div', { class: 'karte hauptadresse-karte desktop' },
      el('span', { class: 'hauptadresse-siegel', html: ik('verbinden') }),
      el('div', { class: 'hauptadresse-text' },
        el('b', {}, 'Desktop und Web gehören zusammen.'),
        el('p', {}, 'Die Desktop-App koppelt sich mit demselben privaten Bereich. Im Browser gibt es nur diese eine VANI-Adresse:'),
        el('code', {}, VANI_HAUPTADRESSE)),
      el('div', { class: 'fussreihe hauptadresse-aktionen' },
        vaniHauptadresseKnopf('Web-App öffnen'),
        el('button', { class: 'knopf', onclick: () => kopiereVaniAdresse() }, 'Adresse kopieren')));
  }
  if (art === 'rettung' || art === 'dienst') {
    const verbunden = syncIstVerbunden();
    return el('div', { class: 'karte hauptadresse-karte umzug' },
      el('span', { class: 'hauptadresse-siegel', html: ik('wieder') }),
      el('div', { class: 'hauptadresse-text' },
        el('b', {}, 'Rettungsmodus der früheren zweiten Adresse'),
        el('p', {}, 'Hier kannst du einen alten lokalen Bestand noch sichern oder vollständig abgleichen. Danach öffnest du das eine offizielle VANI auf GitHub. Nichts wird automatisch gelöscht.'),
        el('code', {}, VANI_HAUPTADRESSE)),
      el('ol', { class: 'hauptadresse-schritte' },
        el('li', {}, 'Zuerst eine Sicherung erzeugen.'),
        el('li', {}, verbunden ? 'Jetzt abgleichen und den Kopplungscode kopieren.' : 'Einen privaten Bereich anlegen oder später die Sicherung einlesen.'),
        el('li', {}, 'Die Hauptadresse öffnen und dort einmal zum Home-Bildschirm hinzufügen.')),
      el('div', { class: 'fussreihe hauptadresse-aktionen' },
        el('button', { class: 'knopf', onclick: () => sichereAlles() }, '1 · Alles sichern'),
        verbunden
          ? el('button', { class: 'knopf', onclick: async () => { toast('Gleiche vollständig ab …'); await syncJetzt(); await kopiereSyncKopplungscode(); } }, '2 · Abgleichen & Code')
          : el('button', { class: 'knopf', onclick: () => neuerSyncBereich() }, '2 · Bereich anlegen'),
        vaniHauptadresseKnopf('3 · Hauptadresse öffnen')));
  }
  return el('div', { class: 'karte hauptadresse-karte umzug' },
    el('span', { class: 'hauptadresse-siegel', html: ik('zuhause') }),
    el('div', { class: 'hauptadresse-text' },
      el('b', {}, 'Das ist eine Vorschau, nicht deine feste VANI-Adresse.'),
      el('p', {}, 'Für den normalen Alltag, Updates und dein Home-Bildschirm-Icon bitte immer die eine Hauptadresse benutzen.'),
      el('code', {}, VANI_HAUPTADRESSE)),
    el('div', { class: 'fussreihe hauptadresse-aktionen' }, vaniHauptadresseKnopf('Hauptadresse öffnen')));
}

RENDER.feinheiten = function (haupt) {
  haupt.append(raumkopf('Feinheiten', null,
    el('button', { class: 'rundknopf zart', html: ik('lesen'), title: 'Die Anleitung aufschlagen', onclick: () => oeffneAnleitung() })));
  const inhalt = el('div', { class: 'inhalt' });

  /* Die Anleitung zuerst — sie erklärt alles andere. */
  inhalt.append(el('button', { class: 'karte anleitung-karte', onclick: () => oeffneAnleitung() },
    el('span', { class: 'anleitung-karte-icon', html: ik('lesen') }),
    el('span', { class: 'anleitung-karte-text' },
      el('b', {}, 'Die Anleitung'),
      el('small', {}, 'Alles, was VANI kann — Raum für Raum, durchsuchbar, mit Beispielen. Von mir aufgeschrieben.')),
    el('span', { class: 'anleitung-karte-pfeil', html: ik('rechts') })));

  /* Eine sichtbare App-Adresse; der Sites-Host ist nur noch Sync-Hintergrund. */
  const adresskarte = vaniAdresskarte();
  if (adresskarte) inhalt.append(el('div', { class: 'abschnitt hauptadresse-abschnitt' }, el('h2', {}, 'Dein einziges VANI'), adresskarte));

  /* Thema */
  const THEMA_INFO = [
    ['papier', 'Papier', '#f8f3e7', '#2c251c'],
    ['tinte', 'Tinte', '#211c17', '#eae0cd'],
    ['kerze', 'Kerze', '#2b1e0c', '#f2dfb6'],
    ['nebel', 'Nebel', '#f4f6f2', '#2e3438'],
    ['weiss', 'Weiß', '#ffffff', '#1a1a1a']
  ];
  const themen = el('div', { class: 'themenwahl' });
  for (const [id, name, hg, tinte] of THEMA_INFO) {
    themen.append(el('button', {
      class: 'themenkachel' + (D.einst.thema === id ? ' an' : ''), onclick: (e) => {
        setzeThema(id);
        $$('.themenkachel', themen).forEach((k) => k.classList.toggle('an', k === e.currentTarget));
      }
    },
      el('div', { class: 'vorschau', style: 'background:' + hg + ';color:' + tinte }, 'Aa'),
      el('div', { class: 'tname' }, name)
    ));
  }
  /* Neben der Stimmung, unauffällig: aktualisieren, ohne bis ganz nach unten zu scrollen. */
  const aktKnopf = el('button', {
    class: 'knopf zart still-aktualisieren', title: 'Nach einer neuen Fassung von VANI sehen',
    onclick: async (ev) => {
      const b = ev.currentTarget; if (b.dataset.laeuft) return; b.dataset.laeuft = '1';
      const alt = b.textContent; b.textContent = 'sieht nach …';
      try { await sucheAppUpdate(true); } catch (e) { toast('Gerade ging das nicht.'); }
      setTimeout(() => { if (b.isConnected) { b.textContent = alt; delete b.dataset.laeuft; } }, 2500);
    }
  }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'Aktualisieren');
  /* Ganz oben: der Zustand, damit man ihn sieht, ohne zu suchen. */
  if (typeof speicherZustand === 'function') {
    const karte = el('button', { class: 'karte sicher-karte', onclick: () => zeigeSicherheit() },
      el('span', { class: 'sicher-karte-icon', html: ik('schild') }),
      el('span', { class: 'sicher-karte-text' }, el('b', {}, 'Alles sicher'), el('small', {}, 'Wird geprüft …')),
      el('span', { class: 'sicher-karte-pfeil', html: ik('rechts') }));
    const kleines = karte.querySelector('small');
    const setz = async () => {
      if (!kleines.isConnected) return;
      const z = speicherZustand();
      const texte = [...D.docs.values()].filter((d) => !d.geloescht).length;
      const s = typeof sicherungAutoStand === 'function' ? await sicherungAutoStand() : null;
      karte.classList.toggle('hakt', z.art === 'fehler');
      kleines.textContent = z.art === 'fehler'
        ? 'Der Hauptspeicher hakt — deine Texte liegen in der Rettungskopie. Hier ansehen.'
        : zaehl(texte, 'Text', 'Texte') + ' gespeichert' + (z.zuletzt ? ' · zuletzt ' + vorZeit(z.zuletzt) : '') + (s ? ' · Wochensicherung ' + fmtDatum(s.wann) : '');
    };
    inhalt.append(karte);
    setz();
    if (typeof speicherHorchen === 'function') { const loesen = speicherHorchen(() => setz()); setTimeout(() => { if (!karte.isConnected) loesen(); }, 60000); }
  }

  inhalt.append(el('div', { class: 'abschnitt' },
    el('div', { class: 'abschnitt-kopfzeile' }, el('h2', {}, 'Stimmung'), el('span', { class: 'abschnitt-fassung' }, 'v' + APP_VERSION), aktKnopf),
    themen));

  /* Schreiben */
  const zielFeld = el('input', { type: 'text', inputmode: 'numeric', value: D.einst.tagesziel || '', placeholder: 'keins', style: 'width:90px;text-align:right;background:var(--karte);border-radius:10px;padding:7px 11px;box-shadow:inset 0 0 0 1px var(--linie)' });
  zielFeld.addEventListener('input', entprellt(() => {
    D.einst.tagesziel = parseInt(zielFeld.value, 10) || 0;
    speichereEinst();
  }, 400));
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Schreiben'),
    el('div', { class: 'karte' },
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Tagesziel in Wörtern', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Leer lassen heißt: kein Soll. Auch gut.')),
        zielFeld),
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Schrift, Größe, Fokus …', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Stellst du direkt im Schreibraum ein — oben rechts.'))),
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Im Heft automatisch weiterblättern', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Wenn eine Seite voll ist, geht es ohne Unterbrechung auf der nächsten weiter.')),
        el('button', {
          class: 'schalter' + (D.einst.autoSeitenwechsel !== false ? ' an' : ''), onclick: (e) => {
            D.einst.autoSeitenwechsel = D.einst.autoSeitenwechsel === false;
            e.currentTarget.classList.toggle('an', D.einst.autoSeitenwechsel); speichereEinst();
          }
        }, el('i')))
    )));

  /* Räume als Orte: Kulissen und Häute, zuschaltbar */
  if (typeof orteKarte === 'function') inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Orte'), orteKarte()));
  if (typeof salonKarte === 'function') inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Salon'), salonKarte()));
  if (typeof albumKarte === 'function') inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Album'), albumKarte()));

  /* Räume: an/aus und Reihenfolge */
  const raumkarte = el('div', { class: 'karte' });
  function baueRaumliste() {
    raumkarte.innerHTML = '';
    const cfg = raumConfig();
    cfg.forEach((eintrag, i) => {
      const info = ALLE_RAEUME.find((r) => r.id === eintrag.id);
      raumkarte.append(el('div', { class: 'einstellzeile' },
        el('span', { html: ik(info.icon), style: 'display:flex;color:var(--blass)' }),
        el('span', { class: 'ename' }, info.name),
        el('button', {
          class: 'rundknopf zart', style: 'width:32px;height:32px' + (i === 0 ? ';opacity:.2;pointer-events:none' : ''), html: ik('auf'), title: 'Raum nach oben',
          onclick: () => { [cfg[i - 1], cfg[i]] = [cfg[i], cfg[i - 1]]; speichereEinst(); baueLeiste(); baueRaumliste(); }
        }),
        el('button', {
          class: 'rundknopf zart', style: 'width:32px;height:32px' + (i === cfg.length - 1 ? ';opacity:.2;pointer-events:none' : ''), html: ik('ab'), title: 'Raum nach unten',
          onclick: () => { [cfg[i], cfg[i + 1]] = [cfg[i + 1], cfg[i]]; speichereEinst(); baueLeiste(); baueRaumliste(); }
        }),
        info.fest ? el('span', { style: 'width:52px;text-align:center;font-size:12px;color:var(--blass)' }, 'immer') :
        el('button', {
          class: 'schalter' + (eintrag.an ? ' an' : ''), onclick: (e) => {
            eintrag.an = !eintrag.an;
            e.currentTarget.classList.toggle('an', eintrag.an);
            speichereEinst(); baueLeiste();
          }
        }, el('i'))
      ));
    });
  }
  baueRaumliste();
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Räume'),
    el('div', { style: 'font-size:13.5px;color:var(--blass);margin:-6px 0 10px' }, 'Was du nicht brauchst, verschwindet aus der Leiste. Nichts geht dabei verloren.'),
    raumkarte));

  /* Statistik */
  const gesamt = Object.values(D.stats.tage).reduce((a, b) => a + b, 0);
  const balken = el('div', { class: 'statistikbalken' });
  const werte = [];
  /* Vierzehn Tage passen auf ein Handy nicht lesbar nebeneinander. Dort sieben —
     lieber weniger Tage, die man erkennt, als vierzehn abgeschnittene. */
  const tage = (typeof innerWidth === 'number' && innerWidth < 620) ? 7 : 14;
  for (let i = tage - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    werte.push({ k: tagKey(d), w: D.stats.tage[tagKey(d)] || 0, d });
  }
  const max = Math.max(1, ...werte.map((x) => x.w));
  for (const { w, d } of werte) {
    balken.append(el('div', { class: 'tag' + (w ? '' : ' leer') },
      el('i', { style: 'height:' + Math.max(4, Math.round(w / max * 100)) + '%' }),
      el('b', {}, String(d.getDate()))));
  }
  const anzahl = (typ) => [...D.docs.values()].filter((d) => d.typ === typ).length;
  const zaehlwerk = [
    ['schnipsel', 'Schnipsel', 'Schnipsel'], ['blatt', 'Blatt', 'Blätter'],
    ['seite', 'Seite', 'Seiten'], ['szene', 'Szene', 'Szenen']
  ].map(([typ, einzahl, mehrzahl]) => {
    const n = anzahl(typ);
    return el('div', { class: 'z' }, el('b', {}, String(n)), el('span', {}, n === 1 ? einzahl : mehrzahl));
  });
  /* Ein Jahr aus Punkten: jeder Tag ein Kästchen, je dunkler, desto mehr Wörter. */
  const rasterWochen = (typeof innerWidth === 'number' && innerWidth < 620) ? 26 : 53;
  const raster = jahresRaster(D.stats.tage, rasterWochen);
  const ringeKnopf = typeof zeigeJahresringe === 'function' ? el('button', { class: 'knopf', style: 'margin:6px 0 10px', onclick: () => zeigeJahresringe() }, 'Das Jahr in Ringen') : null;
  const jahr = el('div', { class: 'jahresraster', role: 'img', 'aria-label': 'Schreibtage der letzten ' + rasterWochen + ' Wochen' });
  for (const spalte of raster.spalten) {
    const sp = el('div', { class: 'jr-woche' });
    for (const z of spalte) sp.append(el('i', { class: 'jr-tag stufe-' + z.stufe + (z.heute ? ' heute' : ''), title: z.worte === null ? '' : z.tag + ' · ' + z.worte + (z.worte === 1 ? ' Wort' : ' Wörter') }));
    jahr.append(sp);
  }
  const schreibtage = Object.values(D.stats.tage).filter((v) => v > 0).length;
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Zahlen'),
    el('div', { class: 'karte' },
      el('div', { class: 'jahresraster-kopf' }, el('span', {}, rasterWochen === 53 ? 'Das letzte Jahr' : 'Das letzte halbe Jahr'), el('span', { class: 'jr-legende' }, schreibtage + (schreibtage === 1 ? ' Schreibtag' : ' Schreibtage') + ' insgesamt')),
      ringeKnopf, jahr,
      balken,
      el('div', { class: 'zahlenreihe' },
        el('div', { class: 'z' }, el('b', {}, gesamt.toLocaleString('de-DE')), el('span', {}, 'Wörter insgesamt')),
        el('div', { class: 'z' }, el('b', {}, String(D.stats.tage[tagKey()] || 0)), el('span', {}, 'heute')),
        el('div', { class: 'z' }, el('b', {}, String(straehne())), el('span', {}, 'Tage in Folge')),
        zaehlwerk
      )
    )));

  /* Papierkorb */
  const korbKarte = el('div', { class: 'karte' });
  async function baueKorb() {
    korbKarte.innerHTML = '';
    const alle = (await dbAlle('papierkorb')).sort((a, b) => b.wann - a.wann);
    if (!alle.length) {
      korbKarte.append(el('div', { style: 'color:var(--blass);font-size:14.5px' }, 'Leer. So soll es sein.'));
      return;
    }
    for (const b of alle.slice(0, 30)) {
      korbKarte.append(el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, (b.name || b.typ),
          el('div', { style: 'font-size:12px;color:var(--blass)' },
            b.docs.length + (b.docs.length === 1 ? ' Ding · ' : ' Dinge · ') + vorZeit(b.wann)
            + (() => {
              const w = (b.docs || []).reduce((n, d) => n + worte(d && d.text || ''), 0);
              return w ? ' · ' + w.toLocaleString('de-DE') + ' Wörter' : '';
            })())),
        el('button', {
          class: 'knopf', style: 'padding:6px 12px', onclick: async () => {
            await holeZurueck(b.id); toast('Wieder da.'); baueKorb();
          }
        }, 'Zurückholen')
      ));
    }
    korbKarte.append(el('div', { style: 'margin-top:12px' },
      el('button', {
        class: 'knopf zart', onclick: async () => {
          if (await frage('Papierkorb endgültig leeren? Das ist die eine Stelle, an der Löschen wirklich löscht.', { ja: 'Endgültig leeren', gefahr: true })) {
            await papierkorbLeeren();
            baueKorb();
          }
        }
      }, 'Endgültig leeren')));
  }
  baueKorb();
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Papierkorb'),
    el('div', { style: 'font-size:13.5px;color:var(--blass);margin:-6px 0 10px' }, 'Gelöschtes liegt hier, 30 Tage lang mindestens. Nichts verschwindet einfach so.'),
    korbKarte));

  /* Sicherung — mit Datei und ohne (Zwischenablage, Kopplungscode) */
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Sicher ist sicher'), ankommenKarte()));

  /* Goodnotes bleibt ein eigener, stiller Bestand. */
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Goodnotes hereinholen'),
    el('div', { class: 'karte' },
      el('div', { style: 'font-size:14px;color:var(--blass);line-height:1.6;margin-bottom:14px' },
        'Importierte Notizbücher bleiben als ganze Originaldateien in einem eigenen Raum. Sie erzeugen keine Schnipsel, Blätter oder Suchtreffer in deinen anderen Ansichten.'),
      el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap' },
        el('button', { class: 'knopf voll', onclick: () => importiereGoodnotes() }, el('span', { html: ik('buchzu'), style: 'display:flex' }), 'PDF, Goodnotes oder ZIP wählen'),
        vomTyp('goodnote').length ? el('button', { class: 'knopf', onclick: () => { location.hash = '#/goodnotes'; } }, 'Zum Archiv (' + vomTyp('goodnote').length + ')') : null),
      el('div', { class: 'goodnotes-exporttipp' },
        'Für die beste, im PDF später durchsuchbare Kopie: In Goodnotes „Exportieren → PDF → Reduziert“ wählen und „Handschrifterkennung“ einschalten. Exportierte Ordner-ZIPs bleiben als ein ruhiges Archivpaket zusammen.'))));

  /* Eine Installation bleibt dieselbe App. Updates brauchen nie ein neues Icon. */
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'App auf dem Home-Bildschirm'),
    el('div', { class: 'karte apppflege' },
      el('div', { class: 'apppflege-kern' },
        el('span', { class: 'apppflege-icon' }, 'V'),
        el('span', {}, el('b', {}, 'Ein Icon genügt für immer.'),
          el('small', {}, 'Solange die Web-Adresse gleich bleibt, ersetzen neue Fassungen die App hinter demselben Icon. Nicht nach jedem Update erneut „Zum Home-Bildschirm“ wählen.'))),
      el('div', { class: 'apppflege-schritte' },
        el('b', {}, 'Wenn das alte Icon kein Minus/X zeigt:'),
        el('span', {}, '1. Icon lange halten → „App entfernen“.'),
        el('span', {}, '2. Fehlt das: Einstellungen → Bildschirmzeit → Beschränkungen → iTunes & App Store-Käufe → Apps löschen → Erlauben.'),
        el('span', {}, '3. Bei einem verwalteten iPad: Einstellungen → Allgemein → VPN & Geräteverwaltung prüfen. Dann kann nur die Verwaltung das Icon freigeben.')),
      el('div', { class: 'fussreihe' },
        el('button', { class: 'knopf voll', onclick: () => sucheAppUpdate(true) }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'VANI jetzt aktualisieren'),
        el('button', { class: 'knopf zart', onclick: () => sichereAlles() }, 'Vor dem Entfernen sichern')))));

  /* Das Profil ist eine lokale Tür. Der Inhalts-Tresor bleibt davon getrennt
     und wird nur über einen bewussten Kopplungscode mit anderen Geräten geteilt. */
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Mein Profil'),
    el('div', { class: 'karte profil-einstellungen' },
      el('div', { class: 'profil-einst-kopf' },
        el('span', { class: 'profil-monogramm' }, (AKTIVES_PROFIL && AKTIVES_PROFIL.name || '?').slice(0, 1).toUpperCase()),
        el('span', {}, el('b', {}, AKTIVES_PROFIL && AKTIVES_PROFIL.name || 'Dieses VANI'),
          el('small', {}, 'Passwortgeschützt auf diesem Gerät · eigener Bestand · eigener Sync-Bereich'))),
      el('div', { class: 'einstellzeile' },
        el('span', { class: 'ename' }, 'Automatisch sperren', el('small', {}, 'Wenn VANI im Hintergrund liegt.')),
        (() => {
          const s = el('select');
          for (const [wert, name] of [[0, 'Nie'], [2, 'Nach 2 Min.'], [10, 'Nach 10 Min.'], [30, 'Nach 30 Min.']]) s.append(el('option', { value: String(wert) }, name));
          s.value = String(D.einst.sperreNachMinuten || 0);
          s.addEventListener('change', () => { D.einst.sperreNachMinuten = Number(s.value); speichereEinst(); });
          return s;
        })()),
      el('div', { class: 'fussreihe' },
        el('button', { class: 'knopf', onclick: () => profilPasswortAendern() }, 'Passwort ändern'),
        el('button', { class: 'knopf', onclick: () => profilWechseln() }, 'Profil wechseln oder anlegen')))));

  /* Ein privater Bereich pro Person. Der Server bewahrt nur Geheimtext auf. */
  const sinfo = syncInfo();
  const [sname, stext] = syncStatusWorte(sinfo.status);
  const syncKarte = el('div', { class: 'karte sync-karte' },
    el('div', { class: 'sync-kopf' },
      el('span', { class: 'sync-siegel ' + (sinfo.status.art || 'aus'), html: ik('verbinden') }),
      el('span', { class: 'ename' }, sinfo.verbunden ? sinfo.name : 'Privater Bereich',
        el('div', { class: 'sync-status' }, el('i', { class: sinfo.status.art || 'aus' }), el('b', {}, sname), ' · ', stext))),
    sinfo.verbunden
      ? el('div', { class: 'sync-inhalt' },
          el('p', {}, 'Texte, Hefte, Projekte, Schnipsel, Verknüpfungen, Fotos und Einstellungen laufen verschlüsselt zwischen deinen gekoppelten Geräten. Gleichzeitiges und Offline-Schreiben wird beim Wiederverbinden zusammengeführt.'),
          el('div', { class: 'sync-geheimnis' },
            el('b', {}, 'Nur deine Geräte können hineinsehen.'),
            el('span', {}, 'Der Kopplungscode ist wie ein Hausschlüssel. Schicke ihn nur direkt an ein Gerät, das in genau diesen Bereich gehört.')),
          el('div', { class: 'fussreihe' },
            el('button', { class: 'knopf voll', onclick: async () => { toast('Gleiche ab …'); await syncJetzt(); zeichne(); } }, el('span', { html: ik('wieder'), style: 'display:flex' }), 'Jetzt abgleichen'),
            el('button', { class: 'knopf', onclick: () => kopiereSyncKopplungscode() },
              el('span', { html: ik('verbinden'), style: 'display:flex' }), 'Weiteres Gerät koppeln'),
            el('button', { class: 'knopf zart', onclick: async () => {
              if (!await frage('Nur dieses Gerät vom Bereich trennen? Die Inhalte bleiben hier erhalten; die anderen Geräte und der Bereich bleiben unberührt.', { ja: 'Dieses Gerät trennen' })) return;
              await syncTrennen(); toast('Dieses Gerät arbeitet wieder nur für sich.'); zeichne();
            } }, 'Gerät trennen')),
          el('div', { class: 'einstellzeile sync-goodnotes' },
            el('span', { class: 'ename' }, 'Goodnotes-Originaldateien mitsenden', el('div', { style: 'font-size:12.5px;color:var(--blass)' }, 'Aus heißt: Archiv-Titel und Notizen reisen mit, sehr große PDF/Goodnotes-Dateien bleiben auf ihrem Gerät.')),
            el('button', { class: 'schalter' + (D.einst.goodnotesSync ? ' an' : ''), onclick: (e) => {
              D.einst.goodnotesSync = !D.einst.goodnotesSync; e.currentTarget.classList.toggle('an', D.einst.goodnotesSync);
              speichereEinst(); if (D.einst.goodnotesSync) syncMedienAbgleich().catch(() => {});
            } }, el('i'))),
          el('small', { class: 'sync-servername' }, 'Bereich: ' + sinfo.vault.slice(0, 6) + '… · Dienst: ' + (() => { try { return new URL(sinfo.server).host; } catch (e) { return sinfo.server; } })()))
      : el('div', { class: 'sync-inhalt' },
          el('p', {}, 'Du und deine Cousine bekommt jeweils einen eigenen Bereich. Ein Bereich wird nur zwischen den Geräten gekoppelt, die wirklich denselben Bestand sehen sollen.'),
          el('div', { class: 'sync-wege' },
            el('button', { class: 'sync-weg', onclick: () => neuerSyncBereich() },
              el('span', { html: ik('plus') }), el('b', {}, 'Neuen privaten Bereich'), el('small', {}, 'Nimmt alles mit, was gerade auf diesem Gerät liegt.')),
            el('button', { class: 'sync-weg', onclick: () => vorhandenenSyncBereichKoppeln() },
              el('span', { html: ik('verbinden') }), el('b', {}, 'Mit Bereich verbinden'), el('small', {}, 'Kopplungscode von iPad oder Laptop verwenden.'))),
          el('small', { class: 'sync-hinweis' }, 'Wichtig: Deine Cousine legt auf ihrem iPad ihren Bereich an. Du legst auf deinem Gerät deinen eigenen an. Nur gleiche Kopplungscodes führen zum gleichen Bestand.')));
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'iPad ↔ Laptop ↔ weitere Geräte'), syncKarte));

  /* Faden holen — verschluesselt, ohne Datei-Dialog */
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Den Faden holen'),
    el('div', { class: 'karte' },
      el('div', { style: 'font-size:14px;color:var(--blass);line-height:1.6;margin-bottom:14px' },
        'Der alte Chat kommt verschlüsselt herein: auf einem gekoppelten Gerät von selbst über deinen privaten Bereich, sonst einmal mit Passwort aus der Desktop-App oder der Fadendatei.'),
      el('button', { class: 'knopf voll', onclick: () => holeFaden() },
        el('span', { html: ik('faden'), style: 'display:flex' }), 'Faden hereinholen'))));

  /* Frisch anfangen */
  inhalt.append(el('div', { class: 'abschnitt' }, el('h2', {}, 'Frisch anfangen'),
    el('div', { class: 'karte' },
      el('div', { style: 'font-size:14px;color:var(--blass);line-height:1.6;margin-bottom:14px' },
        'Setzt die Zählungen zurück: Wörter pro Tag, Strähne, Schreibfeuer. Texte, Hefte, Projekte und der Faden bleiben unangetastet.'),
      el('button', {
        class: 'knopf', onclick: async () => {
          if (!await frage('Alle Zählungen auf null? Geschriebenes bleibt, nur das Feuer fängt neu an.', { ja: 'Auf null' })) return;
          D.stats = { tage: {}, letzte: {}, letzteSicherung: D.stats.letzteSicherung };
          for (const d of D.docs.values()) D.stats.letzte[d.id] = worte(d.text || '');
          speichereStats();
          toast('Frisch. Der erste Satz macht wieder Feuer.');
          zeichne();
        }
      }, 'Zählungen auf null'))));

  /* Kleingedrucktes */
  inhalt.append(el('div', { class: 'kleingedruckt' },
    el('div', { class: 'wortmarke' }, 'VANI'),
    el('div', { style: 'margin-top:6px' }, 'Handgemacht. Offline. Meins.'),
    el('div', {}, sinfo.verbunden ? 'Ohne Konto. Ende-zu-Ende verschlüsselt. Offline weiter benutzbar.' : 'Kein Konto, keine Cloud, kein Abo — alles bleibt hier.'),
    el('button', { class: 'knopf zart', style: 'margin-top:14px', onclick: () => location.reload() }, 'Frisch durchatmen (neu laden)')
  ));

  haupt.append(inhalt);
};

/* ----- Sicherung ----- */
function blobZuDataURL(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}
function dataURLZuBlob(durl) {
  if (typeof durl !== 'string' || durl.length > 360 * 1024 * 1024) throw new Error('Ungültige Mediendatei');
  const treffer = durl.match(/^data:([^;,]{1,120});base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!treffer) throw new Error('Ungültige Mediendatei');
  const mime = treffer[1] || 'application/octet-stream';
  if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(mime)) throw new Error('Ungültiger Dateityp');
  const daten = treffer[2].replace(/[\r\n]/g, '');
  if (!daten.length || daten.length % 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(daten)) throw new Error('Ungültige Mediendatei');
  const bin = atob(daten);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function sichereAlles() {
  toast('Packe alles ein …');
  const paket = await baueSicherungsPaket({ mitMedien: true });
  const name = 'vani-sicherung-' + tagKey() + '.vani';
  const ok = await teileDatei(name, JSON.stringify(paket), 'application/json');
  if (ok) {
    D.stats.letzteSicherung = Date.now();
    speichereStats();
  }
}

function leseSicherung() {
  const inp = el('input', { type: 'file', accept: '.vani,.json,application/json,text/plain', style: 'display:none' });
  document.body.append(inp);
  inp.addEventListener('change', async () => {
    const datei = inp.files && inp.files[0];
    inp.remove();
    if (!datei) return;
    if (datei.size > 600 * 1024 * 1024 && !await frage(
      'Diese Sicherung ist sehr groß (' + formatBytes(datei.size) + '). Das Öffnen kann auf einem älteren iPad viel Arbeitsspeicher brauchen. Trotzdem versuchen?',
      { ja: 'Trotzdem öffnen' }
    )) return;
    let paket;
    try { paket = JSON.parse(await datei.text()); } catch (e) { toast('Das ist keine VANI-Sicherung.'); return; }
    if (!pruefeSicherung(paket)) { toast('Das ist keine VANI-Sicherung.'); return; }
    /* Einspielen und Zusammenfassung teilen sich Datei und Zwischenablage. */
    await sicherungAnnehmen(paket, datei.name);
  });
  inp.click();
}

function alleTexteAlsText() {
  const teile = [];
  for (const p of vomTyp('projekt')) {
    teile.push('══ PROJEKT: ' + p.titel + ' ══');
    for (const k of kinder(p.id, 'kapitel')) {
      teile.push('\n— ' + k.titel + ' —');
      for (const s of kinder(k.id, 'szene')) {
        if (s.titel) teile.push('· ' + s.titel);
        if ((s.text || '').trim()) teile.push(s.text.trim());
      }
    }
    teile.push('');
  }
  for (const h of vomTyp('heft')) {
    teile.push('══ HEFT: ' + h.titel + ' ══');
    for (const s of kinder(h.id, 'seite')) {
      if (s.titel) teile.push('· ' + s.titel);
      if ((s.text || '').trim()) teile.push(s.text.trim());
      for (const z of kinder(s.id, 'zettel')) if ((z.text || '').trim()) teile.push('[Zettel] ' + z.text.trim());
    }
    teile.push('');
  }
  const schnipsel = vomTyp('schnipsel').sort((a, b) => a.angelegt - b.angelegt);
  if (schnipsel.length) {
    teile.push('══ SCHNIPSEL ══');
    for (const s of schnipsel) if ((s.text || '').trim()) teile.push(fmtDatum(s.angelegt) + ': ' + s.text.trim());
  }
  return teile.join('\n');
}

/* Datei hinausgeben: Teilen-Menü → Download → Zwischenablage */
async function teileDatei(name, inhalt, typ = 'text/plain') {
  const blob = new Blob([inhalt], { type: typ + ';charset=utf-8' });
  const datei = new File([blob], name, { type: typ });
  if (navigator.canShare && navigator.canShare({ files: [datei] })) {
    try { await navigator.share({ files: [datei] }); return true; }
    catch (e) { if (e && e.name === 'AbortError') return false; }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: name, style: 'display:none' });
    document.body.append(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
    toast('Gespeichert — schau in „Dateien“ nach.');
    return true;
  } catch (e) {}
  try {
    await navigator.clipboard.writeText(inhalt);
    toast('Ging nicht als Datei — liegt jetzt in der Zwischenablage.');
    return true;
  } catch (e) {
    toast('Das hat leider nicht geklappt.');
    return false;
  }
}

/* ----- Faden entschluesseln und einlesen -----
   Die verschlüsselte Fadendatei liegt bewusst nicht mehr öffentlich im Netz.
   Sie kommt aus der Desktop-App, die sie mitbringt, oder wird einmal von Hand
   gewählt. Auf schon gekoppelten Geräten reist der Faden über den Tresor. */
async function fadenPaketHolen() {
  try {
    const antwort = await fetch('faden.enc', { cache: 'no-store' });
    if (antwort.ok) return await antwort.json();
  } catch (e) {}
  const wahl = await menue([
    { text: 'Fadendatei von Hand wählen', icon: 'runter', wert: 'datei' },
    { text: 'Doch nicht', icon: 'kreuz', wert: null }
  ], 'Der Faden liegt auf diesem Gerät nicht bereit');
  if (wahl !== 'datei') {
    toast('Auf gekoppelten Geräten kommt der Faden über deinen privaten Bereich mit.', 5200);
    return null;
  }
  return new Promise((res) => {
    const inp = el('input', { type: 'file', accept: '.enc,.json,application/json', style: 'display:none' });
    document.body.append(inp);
    let fertig = false;
    inp.addEventListener('change', async () => {
      fertig = true;
      const datei = inp.files && inp.files[0];
      inp.remove();
      if (!datei) return res(null);
      if (datei.size > 200 * 1024 * 1024) { toast('Diese Datei ist zu groß für den Faden.'); return res(null); }
      try { res(JSON.parse(await datei.text())); }
      catch (e) { toast('Das ist keine Fadendatei.'); res(null); }
    });
    inp.addEventListener('cancel', () => { if (!fertig) { inp.remove(); res(null); } });
    inp.click();
  });
}

async function holeFaden() {
  const passwort = await eingabe({ titel: 'Das Passwort für den Faden', platzhalter: 'wort-wort-zahl-wort-wort', ok: 'Holen' });
  if (!passwort) return;
  toast('Hole den Faden …', 4000);
  let paket = await fadenPaketHolen();
  if (!paket) return;
  let klartext;
  try {
    const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    const basis = await crypto.subtle.importKey('raw', new TextEncoder().encode(passwort), 'PBKDF2', false, ['deriveKey']);
    const schluessel = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(paket.salz), iterations: 600000, hash: 'SHA-256' },
      basis, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const roh = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(paket.iv) }, schluessel, b64(paket.daten));
    klartext = JSON.parse(new TextDecoder().decode(roh));
  } catch (e) { toast('Das Passwort passt nicht. Nochmal?'); return; }
  if (!pruefeSicherung(klartext)) { toast('Der Faden ist beschaedigt.'); return; }
  let dazu = 0;
  for (const roh of klartext.docs) {
    const d = sauberesDokument(roh);
    if (!d) continue;
    if (D.docs.has(d.id)) continue;
    D.docs.set(d.id, d);
    D.stats.letzte[d.id] = worte(d.text || '');
    if (!(await sicherSpeichern('docs', d))) { D.docs.delete(d.id); continue; }
    dazu++;
  }
  speichereStats();
  raumConfig();
  const f = D.einst.raeume.find((x) => x.id === 'faden');
  if (f) f.an = true;
  speichereEinst();
  baueLeiste();
  toast(dazu ? 'Da ist er. ' + dazu + ' Dinge sind angekommen.' : 'War schon alles da.', 4000);
  setTimeout(() => { location.hash = '#/faden'; }, 900);
}
