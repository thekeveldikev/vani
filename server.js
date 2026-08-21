// Winziger Server ohne Abhängigkeiten — für Vorschau und LAN.
const http = require('http');
const fs = require('fs');
const path = require('path');

const WURZEL = __dirname;
const PORT = Number.parseInt(process.env.PORT, 10) || 4321;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

function baueServer() {
  return http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  let p;
  try { p = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch (e) { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('kaputte Adresse'); return; }
  if (p === '/') p = '/index.html';
  const datei = path.resolve(WURZEL, '.' + p.replace(/\\/g, '/'));
  const imProjekt = datei === WURZEL || datei.startsWith(WURZEL + path.sep);
  if (!imProjekt || p.includes('\0')) { res.writeHead(403); res.end(); return; }
  fs.readFile(datei, (err, inhalt) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('nicht da'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(datei).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Opener-Policy': 'same-origin'
    });
    res.end(req.method === 'HEAD' ? undefined : inhalt);
  });
  });
}

if (require.main === module) {
  baueServer().on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? 'Port ' + PORT + ' ist schon belegt.' : e.message);
    process.exitCode = 1;
  }).listen(PORT, '0.0.0.0', () => console.log('VANI läuft auf http://localhost:' + PORT));
}

module.exports = { baueServer };
