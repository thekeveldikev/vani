import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsDateien = [
  'src/30-core.js', 'src/29-profile.js', 'src/32-sicherheit.js', 'src/33-scrollleiste.js', 'src/31-sync.js', 'src/35-richtext.js', 'src/36-caret.js', 'src/34-inhalt.js', 'src/38-media.js',
  'src/39-beziehungen.js', 'src/40-router.js', 'src/41-zuhause.js',
  'src/42-schnipsel.js', 'src/42b-blaetter.js', 'src/42c-faden.js',
  'src/42d-goodnotes.js', 'src/43-hefte.js', 'src/43b-sticker.js', 'src/43c-kritzel.js', 'src/43d-ton.js', 'src/43e-deckel.js', 'src/44-projekte.js',
  'src/45-schreibraum.js', 'src/45b-kerze.js', 'src/45c-diktat.js', 'src/45d-textlupe.js', 'src/46-cluster.js', 'src/47-woerter.js', 'src/47b-karteikarten.js',
  'src/48-suche.js', 'src/49-feinheiten.js', 'src/49b-ankommen.js', 'src/50-audio.js',
  'src/53-ambience.js', 'src/51-klangraum.js', 'src/52-anleitung.js', 'src/48b-spotlight.js', 'src/54b-schreibtisch-malerei.js', 'src/54d-tischzitate.js', 'src/54e-tischblaetter.js', 'src/54-schreibtisch.js', 'src/54c-schreibtisch-leben.js', 'src/55-lesestapel.js', 'src/55b-epub.js', 'src/56e-salon-kenntnis.js', 'src/56d-salon-einlesung.js', 'src/56a-salon-stimmen.js', 'src/56f-salon-gespraech.js', 'src/56g-salon-mehr.js', 'src/56h-salon-lernen.js', 'src/56i-salon-personenblatt.js', 'src/56-salon.js', 'src/56b-salon-malerei.js', 'src/57c-katze.js', 'src/57-orte.js', 'src/57b-schreibmaschine.js', 'src/58-sitzung.js', 'src/59-jahresringe.js', 'src/61-kalender.js', 'src/61b-kalender-ansicht.js', 'src/62-album.js', 'src/62d-album-mehr.js', 'src/63-stammbaum.js', 'src/63b-stammbaum-teppich.js', 'src/63d-stammbaum-sippe.js', 'src/63c-stammbaum-blatt.js', 'src/65-stadtplan.js', 'src/65d-stadtplan-netz.js', 'src/65e-stadtplan-hafen.js', 'src/65b-stadtplan-karte.js', 'src/65f-stadtplan-zierrat.js', 'src/65c-stadtplan-blatt.js', 'src/64-kabinett.js', 'src/62b-album-buch.js', 'src/62c-album-blatt.js', 'src/60-boot.js'
];
const lies = (p) => readFileSync(join(wurzel, p), 'utf8').replace(/\r\n/g, '\n');
const js = [lies('vendor/vani-sync.js'), ...jsDateien.map(lies)].join('\n');
const style = lies('src/10-style.css');
const shell = lies('src/05-shell.html');
const index = [lies('src/00-head.html'), '<style>', style, '</style>', '</head>', '<body>', shell, '<script>', js, '</script>', '</body>', '</html>', ''].join('\n');
const artifact = ['<title>VANI</title>', '<style>', style, '</style>', shell, '<script>', js, '</script>', ''].join('\n');

writeFileSync(join(wurzel, 'index.html'), index);
writeFileSync(join(wurzel, 'artifact.html'), artifact);
console.log('index.html:    ' + Buffer.byteLength(index) + ' Bytes');
console.log('artifact.html: ' + Buffer.byteLength(artifact) + ' Bytes');
