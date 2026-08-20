// Winziger Server ohne Abhängigkeiten — für Vorschau und LAN.
const http = require('http');
const fs = require('fs');
const path = require('path');

const WURZEL = __dirname;
const PORT = process.env.PORT || 4321;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const datei = path.join(WURZEL, path.normalize(p).replace(/^([.][.][\\/])+/, ''));
  if (!datei.startsWith(WURZEL)) { res.writeHead(403); res.end(); return; }
  fs.readFile(datei, (err, inhalt) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('nicht da'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(datei).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(inhalt);
  });
}).listen(PORT, '0.0.0.0', () => console.log('VANI läuft auf http://localhost:' + PORT));
