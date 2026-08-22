import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsDateien = [
  'src/30-core.js', 'src/29-profile.js', 'src/31-sync.js', 'src/35-richtext.js', 'src/34-inhalt.js', 'src/38-media.js',
  'src/39-beziehungen.js', 'src/40-router.js', 'src/41-zuhause.js',
  'src/42-schnipsel.js', 'src/42b-blaetter.js', 'src/42c-faden.js',
  'src/42d-goodnotes.js', 'src/43-hefte.js', 'src/43b-sticker.js', 'src/44-projekte.js',
  'src/45-schreibraum.js', 'src/46-cluster.js', 'src/47-woerter.js',
  'src/48-suche.js', 'src/49-feinheiten.js', 'src/49b-ankommen.js', 'src/50-audio.js',
  'src/53-ambience.js', 'src/51-klangraum.js', 'src/52-anleitung.js', 'src/60-boot.js'
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
