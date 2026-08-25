import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { baueServer } = require('../server.js');
let server, port;

before(async () => {
  server = baueServer();
  await new Promise((res, rej) => { server.once('error', rej); server.listen(0, '127.0.0.1', res); });
  port = server.address().port;
});
after(async () => { if (server) await new Promise((res) => server.close(res)); });

function anfrage(pfad, method = 'GET') {
  return new Promise((res, rej) => {
    const req = http.request({ host: '127.0.0.1', port, path: pfad, method }, (antwort) => {
      const teile = [];
      antwort.on('data', (d) => teile.push(d));
      antwort.on('end', () => res({ status: antwort.statusCode, headers: antwort.headers, body: Buffer.concat(teile) }));
    });
    req.on('error', rej); req.end();
  });
}

test('Server: Startseite, HEAD und Sicherheitsheader sind korrekt', async () => {
  const get = await anfrage('/?cache-bust=1');
  assert.equal(get.status, 200);
  assert.match(get.headers['content-type'], /^text\/html/);
  assert.equal(get.headers['x-content-type-options'], 'nosniff');
  assert.equal(get.headers['referrer-policy'], 'no-referrer');
  assert.equal(get.headers['x-frame-options'], 'DENY');
  assert.ok(Number(get.headers['content-length']) > 100000);
  assert.ok(get.body.includes(Buffer.from('<title>VANI')));
  const head = await anfrage('/index.html', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body.length, 0);
});

test('Server: Methoden, kaputte Kodierung, Traversal und fehlende Dateien bleiben eingefangen', async () => {
  const post = await anfrage('/', 'POST');
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
  assert.equal((await anfrage('/%E0%A4%A')).status, 400);
  assert.equal((await anfrage('/..%5C..%5CWindows%5Cwin.ini')).status, 403);
  assert.equal((await anfrage('/gibt-es-nicht-' + Date.now())).status, 403);
  assert.equal((await anfrage('/manifest.json')).headers['content-type'], 'application/json; charset=utf-8');
  assert.equal((await anfrage('/vendor/wasm/openjpeg.wasm')).headers['content-type'], 'application/wasm');
});

test('Server: nur App-Dateien sind öffentlich — Bestand, Git und lokale Altlasten bleiben privat', async () => {
  for (const pfad of ['/src/30-core.js', '/package.json', '/.git/config', '/faden.enc', '/einlesung/einlesung.json', '/CODEX-UEBERGABE.md']) {
    const r = await anfrage(pfad);
    assert.equal(r.status, 403, pfad);
    assert.equal(r.headers['x-content-type-options'], 'nosniff');
  }
  assert.equal((await anfrage('/einlesung/umschlag.json')).status, 200);
  assert.equal((await anfrage('/einlesung/einlesung.enc')).status, 200);
});

test('Server: parallele Lesezugriffe führen weder zu Aussetzern noch Zustandskorruption', async () => {
  const antworten = await Promise.all(Array.from({ length: 80 }, (_, i) => anfrage(i % 2 ? '/manifest.json' : '/icons/icon-192.png')));
  assert.ok(antworten.every((r) => r.status === 200 && r.body.length > 0));
});
