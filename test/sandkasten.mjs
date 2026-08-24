/* Baut die App-Logik in einer Node-Sandbox auf: echte Quelldateien,
   gefälschte Browser-Umgebung, In-Memory-IndexedDB. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');

function fakeIndexedDB() {
  const datenbanken = {};
  return {
    _alles: datenbanken,
    open(name, version) {
      const req = {};
      queueMicrotask(() => {
        let db = datenbanken[name];
        const neu = !db;
        if (neu) {
          db = datenbanken[name] = {
            stores: {},
            objectStoreNames: { contains: (n) => n in db.stores },
            createObjectStore(n) { db.stores[n] = new Map(); return {}; },
            transaction(storeName, modus) {
              const tx = { oncomplete: null, onerror: null, onabort: null, error: null };
              tx.objectStore = (n) => {
                const map = db.stores[n];
                const op = (fn) => { const r = {}; r.result = fn(); return r; };
                return {
                  put: (wert, key) => op(() => { map.set(key !== undefined ? key : wert.id, wert); }),
                  get: (key) => op(() => map.get(key)),
                  delete: (key) => op(() => { map.delete(key); }),
                  getAll: () => op(() => [...map.values()]),
                  clear: () => op(() => map.clear())
                };
              };
              queueMicrotask(() => { if (tx.oncomplete) tx.oncomplete(); });
              return tx;
            }
          };
        }
        req.result = db;
        if (neu && req.onupgradeneeded) req.onupgradeneeded({ target: req });
        if (req.onsuccess) req.onsuccess({ target: req });
      });
      return req;
    }
  };
}

export function baueSandkasten() {
  const kontext = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    queueMicrotask, Promise, JSON, Math, Date, Array, Object, String, Number,
    RegExp, Map, Set, Infinity, NaN, undefined, crypto: webcrypto,
    TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, DataView, Blob, URL, URLSearchParams,
    DecompressionStream: globalThis.DecompressionStream, Response: globalThis.Response, ReadableStream: globalThis.ReadableStream,
    atob, btoa,
    indexedDB: fakeIndexedDB(),
    localStorage: (() => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })(),
    sessionStorage: (() => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })(),
    document: {
      addEventListener() {}, removeEventListener() {},
      querySelector: () => null, querySelectorAll: () => [],
      documentElement: { dataset: {}, style: { setProperty() {} } }
    },
    window: { addEventListener() {}, removeEventListener() {} },
    navigator: {},
    location: { hash: '', search: '', protocol: 'file:', origin: 'null', hostname: '', pathname: '/' }
  };
  kontext.globalThis = kontext;
  vm.createContext(kontext);
  for (const datei of ['30-core.js', '29-profile.js', '32-sicherheit.js', '33-scrollleiste.js', '35-richtext.js', '36-caret.js', '34-inhalt.js', '40-router.js', '41-zuhause.js', '42d-goodnotes.js', '31-sync.js', '43-hefte.js', '47-woerter.js', '48-suche.js', '50-audio.js', '53-ambience.js', '44-projekte.js', '52-anleitung.js', '49b-ankommen.js', '43b-sticker.js', '45b-kerze.js', '43c-kritzel.js', '43d-ton.js', '43e-deckel.js', '47b-karteikarten.js', '48b-spotlight.js', '54b-schreibtisch-malerei.js', '54d-tischzitate.js', '54e-tischblaetter.js', '54f-jahreszeiten.js', '54-schreibtisch.js', '54c-schreibtisch-leben.js', '55-lesestapel.js', '55b-epub.js', '56e-salon-kenntnis.js', '56d-salon-einlesung.js', '56a-salon-stimmen.js', '56f-salon-gespraech.js', '56g-salon-mehr.js', '56h-salon-lernen.js', '56i-salon-personenblatt.js', '56-salon.js', '57c-katze.js', '57-orte.js', '57b-schreibmaschine.js', '45c-diktat.js', '58-sitzung.js', '45d-textlupe.js', '59-jahresringe.js', '61-kalender.js', '61b-kalender-ansicht.js', '62-album.js', '62d-album-mehr.js', '63-stammbaum.js', '63b-stammbaum-teppich.js', '63d-stammbaum-sippe.js', '63c-stammbaum-blatt.js', '65-stadtplan.js', '65d-stadtplan-netz.js', '65e-stadtplan-hafen.js', '65b-stadtplan-karte.js', '65f-stadtplan-zierrat.js', '65c-stadtplan-blatt.js', '64-kabinett.js']) {
    vm.runInContext(readFileSync(join(wurzel, 'src', datei), 'utf8'), kontext, { filename: datei });
  }
  /* Top-Level-const/let landen im lexikalischen Scope, nicht am Global —
     hier holen wir alles heraus, was die Prüfungen brauchen. */
  const exporte = vm.runInContext(
    '({ worte, uid, D, el, anfuegen, localStorage, dbPut, dbGet, dbDel, dbAlle, esc, entprellt, tagKey, fmtDatum, fmtZeit, vorZeit, zaehl, genitiv, zufall, normalisiere, fastGleich, teileText, klugeZeichen, zweiFingerZoom, zugKnopf, schrittMerken, schrittMerkenMitHinweis, schrittZurueck, schrittVor, schritteVergessen, zugStand, zugTastenAnmelden, pruefeSicherung, saubererSyncMarker, sauberesDokument, uebernehmeEinstellungen, begrenze, freieSchnipselPosition, freieFlaechenGrenzen, seitenUmbruch, verbindeDocs, trenneDocs, beziehungenFuer, blattInHeft, seiteZuBlatt, merkeFadenZiel, findeWiederEchos, wiederFunde, eigeneFunken, goodnotesArt, goodnotesFingerabdruck, blobsGleich, formatBytes, profilSaubererName, profilSaubereRegistry, profilGleich, profilErstelle, profilPruefePasswort, profilLadeRegistry, richReinerText, richAusText, sauberesRichHTML, heftDeckelDaten, wortkisten, wortlisteAusText, woerterInKiste, fuegeWoerterHinzu, wortInKiste, loescheWortkiste, wortZufallsgriff, saubereMischung, mischungAnwenden, audioUnterstuetzt, audioZustand, audioNeuStarten, audioFreigeben, audioProbe, audioLautheitsKurve, neueWerkbank, IK, SAATWORTE, FUNKEN, FUNKE_FRAGEN, FUNKE_FORMEN, FUNKE_SAETZE, ALLE_RAEUME, speichereEinst, speichereStats, THEMEN, positioniere, leseLetzteSuchen, kritzelZeichneStrich, schlagwortIndex, startAuftrag, jahresRaster, FUNKE_ARTEN, FUNKE_FIGUREN, FUNKE_WENDUNGEN, FUNKE_WER, FUNKE_WO, FUNKE_ABER, neuerFunke, PAPIERFARBEN, ZETTELFARBEN, papierKlassen, ambienceKatalogSetzen, alleAmbiences, ambienceFinde, ambienceKategorien, saubereAmbienceMischung, saubereAmbienceFeinheit, ambienceSchluessel, klangbildFuer, klangbildBinden, klangbildLoesen, manuskriptText, FIGUR_ARTEN, ANLEITUNG, anleitungSuche, anleitungHervorheben, syncStandardServer, SYNC_STANDARD_DIENST, VANI_HAUPTADRESSE, vaniAdresseArt, whatsappZerlegen, markdownZerlegen, vaniTextZerlegen, erkenneEinfuegeInhalt, ankunftZusammenfassen, sicherungEinspielen, baueSicherungsPaket, entitaetenReparieren, kurzschriftZuHTML, verbindeWeicheUmbrueche, einfuegeAusText, stickerZuschneiden, kerzeStand, kerzeFlammenBreite, kerzeZufall, punktInPolygon, strichBox, stricheImLasso, stricheVerschieben, formErkennen, strichVerdichten, saubereStriche, gliederungAusHTML, tonFormat, saubererDeckel, DECKEL_STOFFE, DECKEL_ETIKETTEN, HEFTE_ANSICHTEN, karteikartenReihenfolge, karteikartenBilanz, saubererTisch, TISCH_PLATTEN, saubererSchreibtisch, mondphase, briefIstOffen, buchFortschritt, saubereLeseEinstellung, SCHREIBTISCH_HOELZER, schnurSchritt, leuchterStand, schreibtischJahreszeit, schreibtischTageslicht, schreibtischHimmelFarben, schreibtischSonnenzeiten, schreibtischTageszeitInfo, TAGESZEIT_WAHLEN, JAHRESZEIT_WAHLEN, buchStatistikWorte, isbnZu10, isbnAusText, saubererAutor, caretZiel, feuerStaerke, feuerScheite, feuerBild, schreibtischAlter, leuchterWoche, teelichterWoche, leseSerie, saubereKleckse, zipEintraege, zipLies, istEpub, spotlightTreffer, TASTENKUERZEL, staendeAutomatisch, syncFremdAktiv, SALON_AUTOREN, SALON_FEST, SALON_GAESTE, salonThemaAusFrage, SALON_THEMEN, salonRat, salonRatDesTages, salonVorrat, salonHash, salonZufall, saubereOrte, orteRaumFuer, ORTE_RAEUME, diktatSaeubern, wortDiff, wortDiffBilanz, sitzungFundsatz, textLupe, jahresringeDaten, jahresringeJahre, jahresringeSVG, heuteVorEinemJahr, saubereSalonBriefe, SALON_GAESTE_MEHR, SALON_RAT_EN, salonRatZweisprachig, salonStimmeDe, saubereSchreibmaschine, schreibmaschineZeilen, schreibmaschineGlocke, schreibmaschineSchlag, schreibmaschineTaste, orteUmbruch, orteText, SM_BREITE, katzeZustand, katzeNaechsteTat, katzeSatz, katzeSVG, salonAnrede, salonTonAn, kenntnisSaetze, kenntnisSammeln, kenntnisFrage, kenntnisTexte, kenntnisSignatur, gespraechAntwort, gespraechFuellen, gespraechListe, gespraechKurz, GESPRAECH_STIMMEN, GESPRAECH_DE, salonEinlesung, einlesungDa, einlesungFrage, einlesungFigur, einlesungNotiz, einlesungOrt, einlesungBegriff, einlesungStimmenZu, SALON_UEBER, SALON_MEHR_THEMEN, SALON_MEHR_KERN, SALON_MEHR_AUFGABEN, salonAufgabeKategorie, SALON_AUFGABEN_KATEGORIEN, lesungStand, lesungVergleich, lesungFaellig, lesungNotiz, LESUNG_SAETZE, personenblattDaten, personenblattSatz, speicherZustand, sicherSpeichern, rettungSchreiben, rettungLesen, rettungLoeschen, rettungPruefen, protokollSchreiben, protokollLesen, protokollLoeschen, bytesLesbar, sicherungAutoFaellig, SICHERUNG_ABSTAND, loesche, holeZurueck, toast, rettungEinsetzen, KAL_ARTEN, KAL_MONATE, KAL_TAGE_KURZ, KAL_JAHR_VON, KAL_JAHR_BIS, KAL_ZEIGE_VON, kalZeigeVon, kalZeit, kalArt, kalTeile, kalGueltig, kalDatum, kalAusText, kalMonatAus, kalJahrAus, kalSchaltjahr, kalMonatstage, kalWochentag, kalWoche, kalHeute, kalJahreszeit, kalAlter, kalAlterText, saubererTermin, kalTermine, kalSortiert, kalAmTag, kalMonatsZaehlung, kalRaster, kalGeburtVon, kalTodVon, kalLeute, kalLebensalter, kalWidersprueche, kalLesbar, kalKurz, kalSatz, kalJahrestage, kalJahresZaehlung, kalJahreMitInhalt, KAL_ICONS, KAL_ICON_IDS, kalIcon, kalIconName, kalStricheSVG, saubereStricheEinfach, TISCHZITAT_MODI, tischzitatModus, tischzitatFrei, saubererTischplatz, tischzitatPlatz, tischzitate, tischzitatAnlegen, tischzitatKandidaten, TISCHBLATT_MODI, tischblattModus, tischblattName, tischblattArt, saubereTischblattWahl, tischblaetter, tischblattWaehlbar, JAHRESZEIT_DEKO, jahreszeitMonat, jahreszeitDeko, jahreszeitAn, diktatSaeubern, diktatIstApfel, ALBUM_FELDER, ALBUM_FELD_IDS, ALBUM_GRUPPEN, ALBUM_WESEN, ALBUM_WESEN_ALLE, ALBUM_FARBEN, ALBUM_ZETTEL_MAX, ALBUM_ZETTELTOENE, albumFeld, albumBeschriftung, saubereAlbumFigur, albumFiguren, albumVergleich, albumSuche, albumStuecke, albumIstLeer, albumZettel, albumFuelle, albumFehlt, albumVerweisName, albumVerweisRolle, albumFindeFigur, albumBeziehungen, albumHash, albumDreh, albumFarbe, albumBuchstabe, albumRegister, albumAlterText, albumFadenErledigt, albumFadenText, albumFadenSetzen, albumFaeden, albumOffeneFaeden, albumIstWortzeichen, albumFundstelle, albumErwaehnungen, albumZeitleiste, albumWidersprueche, albumFehlendeFiguren, albumHatBild, albumMonogramm, ALBUM_ORDNUNGEN, albumOrdnungName, albumGeordnet, albumGeschichten, albumInGeschichte, albumAuswahl, ALBUM_NICHT_ABSCHREIBEN, albumAbschrift, albumGegenueber, albumAehnlichkeit, albumZwillinge, ALBUM_NETZ_ARTEN, albumNetz, ALBUM_FRAGEN, albumFrage, albumTitelDaten, albumStapel, albumBlattAnzahl, albumBlattArt, albumFigurBei, albumBlattVon, albumBildnisAn, FADEN_GRUPPEN, FADEN_ARTEN, FADEN_ART_IDS, FADEN_STRICHE, FADEN_FARBEN, fadenArt, fadenSatz, TEPPICH_STOFFE, teppichStoff, TEPPICH_ZEICHEN, TEPPICH_ZEICHEN_IDS, TEPPICH_SPRUCH_VORSCHLAEGE, TEPPICH_MAX_LEUTE, TEPPICH_MAX_FAEDEN, stammbaeume, saubererStammbaum, teppichName, teppichJahre, teppichAlbumFigur, teppichFaedenVon, teppichNachbarn, TEPPICH_GERUEST, TEPPICH_BLUT, teppichEltern, teppichKinder, teppichPaare, teppichGenerationen, teppichInseln, teppichOrdnung, teppichAuffaelligkeiten, teppichZahlen, teppichSuche, teppichHash, teppichDreh, teppichZufall, TEPPICH_GESCHLECHTER, TEPPICH_GESCHLECHT_IDS, sippeWort, sippeOrdnung, sippeMale, sippeUr, sippeVorfahren, sippeGemeinsam, sippeBlutwort, sippeArtikel, sippeUeberZieh, teppichVerwandtschaft, teppichWegZwischen, teppichWegSatz, teppichHaeuser, teppichHausVon, teppichUmkreis, KABINETT_FAECHER, PLAN_GROESSE, PLAN_PAPIERE, PLAN_FARBWELTEN, PLAN_ZUSCHNITTE, PLAN_ANLAGEN, planNetzStrahlend, planNetzSchachbrett, planBloeckeTeilen, PLAN_WASSER, PLAN_ALTER, PLAN_GROESSEN, PLAN_VIERTELARTEN, PLAN_MARKEN, PLAN_MARKENGRUPPEN, PLAN_MARKEN_IDS, PLAN_ZEICHEN, planPapier, planFarbwelt, planAlterWert, planGroesse, planViertelart, planMarke, planHash, planZufall, planStreu, saubererPlan, stadtplaene, planWasser, planStadt, planUmland, planBauen, planSignatur, planZahlen, planSuche, planStrassenname, planViertelnameVon, planTornameVon, planWegzeit, planZeitText, planMarkenNah, planViertelAn, planAuffaelligkeiten, planTrockeneWege, planKranzGlaetten, planFundstelle, planNachbarnZeichnen, planGassenname, planViertelname, planTorname, planStadtname, planNeueSaat, strecke, bilinear, vierecksFlaeche, NETZ_RASTER, netzWinkel, netzFlaeche, netzMitte, netzImPolygon, netzPunktDrin, netzBauen, netzFlaechen, planNetzWachsen, planBlockBebauen, planStrassendorf, planHausUmriss, planUferlinien, planUferNormalen, planUferAnStadt, planHafen, planHafenname, planMuehle, planInseln, PLAN_TINKTUREN, PLAN_TEILUNGEN, PLAN_WAPPENBILDER, planTinktur, planWappenbild, planWappen, planBlason, PLAN_FELDER, PLAN_FELD_BUCHSTABEN, PLAN_FELD_RAND, planFeldGroesse, planFeldVon, planFelderVon, planFelderText, planNachbarorte, planNachbarname, planLandstrassen, planHimmelsrichtung, PLAN_HIMMEL, planBildWerfall, planBildWemfall, planWappenbildName, planTinkturStriche, planSchildPfad, planWappenFelder, planWappenSVG, planWappenbildPfad, planLegendeSVG, planLegendeZeichen, planHafenZeichnen, planMuehleZeichnen, planInselnZeichnen, planSchiff, planMarktplatz, planMarktZeichnen, planGradnetz, planRundgangZeichnen, KT_EBENEN, planLegende, planWasserwort, planRundgang, FADEN_STRICH_NAMEN, fadenFarbeSauber, saubereFadenart, fadenBibliothek, fadenBibliothekSetzen, fadenBibliothekHinzu, fadenHeimat, fadenAlleArten, FADEN_BIBLIOTHEK_MAX })',
    kontext);
  Object.assign(kontext, exporte);
  return kontext;
}

export const mikrotasksLeeren = () => new Promise((r) => setTimeout(r, 5));
