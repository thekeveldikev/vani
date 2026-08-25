// Winziger Server ohne Abhängigkeiten — für Vorschau und LAN.
const http = require('http');
const fs = require('fs');
const path = require('path');

const WURZEL = __dirname;
const ECHTE_WURZEL = fs.realpathSync(WURZEL);
const PORT = Number.parseInt(process.env.PORT, 10) || 4321;
const HOST = process.env.VANI_HOST || '127.0.0.1';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.opus': 'audio/ogg',
  '.wav': 'audio/wav',
  '.enc': 'application/octet-stream'
};
const OEFFENTLICHE_DATEIEN = new Set(['index.html', 'manifest.json', 'sw.js', 'robots.txt']);
const OEFFENTLICHE_ORDNER = new Set(['icons', 'vendor', 'klang', 'sticker', 'autoren', 'buecher']);
const OEFFENTLICHE_EINLESUNG = new Set(['einlesung/einlesung.enc', 'einlesung/umschlag.json']);
const SICHERHEITSHEADER = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=()'
};

function oeffentlicherPfad(p) {
  const relativ = String(p || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const teile = relativ.split('/');
  if (!relativ || relativ.includes('\0') || teile.some((x) => !x || x === '.' || x === '..')) return null;
  if (teile.length === 1 && OEFFENTLICHE_DATEIEN.has(relativ)) return relativ;
  if (OEFFENTLICHE_EINLESUNG.has(relativ)) return relativ;
  return OEFFENTLICHE_ORDNER.has(teile[0]) ? relativ : null;
}

function kleinAntwort(res, status, text, extra = {}) {
  const inhalt = Buffer.from(text || '');
  res.writeHead(status, { ...SICHERHEITSHEADER, 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': inhalt.length, ...extra });
  res.end(inhalt);
}

function baueServer() {
  return http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { kleinAntwort(res, 405, '', { Allow: 'GET, HEAD' }); return; }
  let p;
  try { p = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch (e) { kleinAntwort(res, 400, 'kaputte Adresse'); return; }
  if (p === '/') p = '/index.html';
  const relativ = oeffentlicherPfad(p);
  if (!relativ) { kleinAntwort(res, 403, 'nicht erlaubt'); return; }
  const datei = path.resolve(WURZEL, relativ);
  const imProjekt = datei === WURZEL || datei.startsWith(WURZEL + path.sep);
  if (!imProjekt) { kleinAntwort(res, 403, 'nicht erlaubt'); return; }
  fs.realpath(datei, (realErr, echteDatei) => {
    const echteErlaubt = !realErr && (echteDatei === ECHTE_WURZEL || echteDatei.startsWith(ECHTE_WURZEL + path.sep));
    if (!echteErlaubt) { kleinAntwort(res, realErr ? 404 : 403, realErr ? 'nicht da' : 'nicht erlaubt'); return; }
    fs.stat(echteDatei, (err, st) => {
      if (err || !st.isFile()) { kleinAntwort(res, 404, 'nicht da'); return; }
      res.writeHead(200, {
        ...SICHERHEITSHEADER,
        'Content-Type': MIME[path.extname(echteDatei).toLowerCase()] || 'application/octet-stream',
        'Content-Length': st.size,
        'Cache-Control': 'no-store',
      });
      if (req.method === 'HEAD') { res.end(); return; }
      const strom = fs.createReadStream(echteDatei);
      strom.on('error', () => res.destroy());
      strom.pipe(res);
    });
  });
  });
}

if (require.main === module) {
  baueServer().on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? 'Port ' + PORT + ' ist schon belegt.' : e.message);
    process.exitCode = 1;
  }).listen(PORT, HOST, () => console.log('VANI läuft auf http://' + (HOST === '0.0.0.0' ? 'localhost' : HOST) + ':' + PORT));
}

module.exports = { baueServer, oeffentlicherPfad };
