/* VANI Sync-Dienst: speichert ausschließlich bereits verschlüsselte CRDT-Pakete. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const STANDARD_WURZEL = path.resolve(HIER, '..');
const MAX_UPDATE_BODY = 24 * 1024 * 1024;
const MAX_BLOB_BODY = 2 * 1024 * 1024;
const MAX_KLEIN_BODY = 16 * 1024;
const ID_RE = /^[A-Za-z0-9_-]{20,100}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{40,180}$/;
const B64_RE = /^[A-Za-z0-9_-]+$/;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm',
  '.opus': 'audio/ogg', '.wav': 'audio/wav', '.enc': 'application/octet-stream'
};
const OEFFENTLICHE_DATEIEN = new Set(['index.html', 'manifest.json', 'sw.js', 'robots.txt']);
const OEFFENTLICHE_ORDNER = new Set(['icons', 'vendor', 'klang', 'sticker', 'autoren', 'buecher']);
const OEFFENTLICHE_EINLESUNG = new Set(['einlesung/einlesung.enc', 'einlesung/umschlag.json']);

export function oeffentlicherPfad(p) {
  const relativ = String(p || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const teile = relativ.split('/');
  if (!relativ || relativ.includes('\0') || teile.some((x) => !x || x === '.' || x === '..')) return null;
  if (teile.length === 1 && OEFFENTLICHE_DATEIEN.has(relativ)) return relativ;
  if (OEFFENTLICHE_EINLESUNG.has(relativ)) return relativ;
  return OEFFENTLICHE_ORDNER.has(teile[0]) ? relativ : null;
}

function tokenHash(token) { return createHash('sha256').update(token).digest(); }
function gleich(a, b) {
  const aa = Buffer.isBuffer(a) ? a : Buffer.from(a || '');
  const bb = Buffer.isBuffer(b) ? b : Buffer.from(b || '');
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
function json(res, status, wert, extra = {}) {
  const inhalt = Buffer.from(JSON.stringify(wert));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': inhalt.length, ...extra });
  res.end(inhalt);
}
function fehler(res, status, code, extra = {}) { json(res, status, { fehler: code }, extra); }
function bodyFehler(e) {
  return e && (e.message === 'kaputtes_json' || e.message === 'zu_gross') ? e.message : 'serverfehler';
}
function liesBody(req, max) {
  return new Promise((resolve, reject) => {
    const angekuendigt = Number(req.headers['content-length'] || 0);
    if (Number.isFinite(angekuendigt) && angekuendigt > max) {
      req.resume();
      reject(Object.assign(new Error('zu_gross'), { status: 413 })); return;
    }
    const teile = [];
    let laenge = 0, zuGross = false;
    req.on('data', (teil) => {
      laenge += teil.length;
      if (laenge > max) { zuGross = true; teile.length = 0; return; }
      if (!zuGross) teile.push(teil);
    });
    req.on('end', () => {
      if (zuGross) { reject(Object.assign(new Error('zu_gross'), { status: 413 })); return; }
      try { resolve(JSON.parse(Buffer.concat(teile).toString('utf8') || '{}')); }
      catch (_) { reject(Object.assign(new Error('kaputtes_json'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
function bearer(req) {
  const h = req.headers.authorization || '';
  return /^Bearer [A-Za-z0-9_-]{40,180}$/.test(h) ? h.slice(7) : '';
}
function sichereHeader(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
}

export function erzeugeSyncDienst({ datenbankPfad, statikWurzel = STANDARD_WURZEL, erlaubteOrigins = '*' } = {}) {
  const dbPfad = datenbankPfad || path.join(process.env.VANI_DATA_DIR || path.join(STANDARD_WURZEL, 'vani-sync-data'), 'vani.sqlite');
  if (dbPfad !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(dbPfad)), { recursive: true });
  const db = new DatabaseSync(dbPfad, { timeout: 5000 });
  const statikBasis = fs.realpathSync(path.resolve(statikWurzel));
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA synchronous=FULL;
    CREATE TABLE IF NOT EXISTS vaults (
      id TEXT PRIMARY KEY,
      token_hash BLOB NOT NULL,
      created_at INTEGER NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS updates (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      vault_id TEXT NOT NULL,
      update_id TEXT NOT NULL,
      iv TEXT NOT NULL,
      ciphertext TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(vault_id, update_id),
      FOREIGN KEY(vault_id) REFERENCES vaults(id) ON DELETE CASCADE
    ) STRICT;
    CREATE INDEX IF NOT EXISTS idx_updates_vault_seq ON updates(vault_id, seq);
    CREATE TABLE IF NOT EXISTS blob_chunks (
      vault_id TEXT NOT NULL,
      blob_id TEXT NOT NULL,
      chunk_no INTEGER NOT NULL,
      iv TEXT NOT NULL,
      ciphertext TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY(vault_id, blob_id, chunk_no),
      FOREIGN KEY(vault_id) REFERENCES vaults(id) ON DELETE CASCADE
    ) STRICT;
  `);
  const qVault = db.prepare('SELECT token_hash FROM vaults WHERE id = ?');
  const qInsertVault = db.prepare('INSERT INTO vaults(id, token_hash, created_at) VALUES (?, ?, ?)');
  const qInsertUpdate = db.prepare('INSERT OR IGNORE INTO updates(vault_id, update_id, iv, ciphertext, created_at) VALUES (?, ?, ?, ?, ?)');
  const qUpdate = db.prepare('SELECT seq FROM updates WHERE vault_id = ? AND update_id = ?');
  const qUpdates = db.prepare('SELECT seq, update_id AS id, iv, ciphertext FROM updates WHERE vault_id = ? AND seq > ? ORDER BY seq ASC LIMIT ?');
  const qLatest = db.prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM updates WHERE vault_id = ?');
  const qInsertChunk = db.prepare('INSERT OR IGNORE INTO blob_chunks(vault_id, blob_id, chunk_no, iv, ciphertext, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  const qChunk = db.prepare('SELECT iv, ciphertext FROM blob_chunks WHERE vault_id = ? AND blob_id = ? AND chunk_no = ?');
  const limits = new Map();

  function originFuer(req) {
    const origin = String(req.headers.origin || '');
    if (erlaubteOrigins === '*') return '*';
    const erlaubt = Array.isArray(erlaubteOrigins) ? erlaubteOrigins : String(erlaubteOrigins).split(',').map((x) => x.trim()).filter(Boolean);
    return erlaubt.includes(origin) ? origin : '';
  }
  function autorisiert(req, vaultId) {
    const zeile = qVault.get(vaultId);
    const token = bearer(req);
    return !!(zeile && token && gleich(zeile.token_hash, tokenHash(token)));
  }
  function rateOk(req) {
    const jetzt = Date.now();
    const ip = String(req.socket.remoteAddress || 'unbekannt');
    let r = limits.get(ip);
    if (!r || jetzt - r.seit > 60000) r = { seit: jetzt, zahl: 0 };
    r.zahl++;
    limits.set(ip, r);
    if (limits.size > 10000) for (const [k, v] of limits) if (jetzt - v.seit > 120000) limits.delete(k);
    return r.zahl <= 360;
  }

  const server = http.createServer(async (req, res) => {
    const origin = originFuer(req);
    const cors = sichereHeader(origin || 'null');
    const fail = (status, code) => fehler(res, status, code, cors);
    if (!origin && req.headers.origin) { fail(403, 'origin_nicht_erlaubt'); return; }
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    if (!rateOk(req)) { fail(429, 'zu_viele_anfragen'); return; }
    let url;
    try { url = new URL(req.url || '/', 'http://vani.local'); }
    catch (_) { fail(400, 'kaputte_adresse'); return; }

    if (req.method === 'GET' && url.pathname === '/v1/health') {
      json(res, 200, { ok: true, dienst: 'vani-sync', version: 1 }, cors); return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/vaults') {
      try {
        const body = await liesBody(req, MAX_KLEIN_BODY);
        if (!ID_RE.test(body.vaultId || '') || !TOKEN_RE.test(body.token || '')) { fail(400, 'ungueltiger_bereich'); return; }
        try { qInsertVault.run(body.vaultId, tokenHash(body.token), Date.now()); }
        catch (e) {
          if (String(e.message).includes('UNIQUE')) { fail(409, 'bereich_existiert'); return; }
          throw e;
        }
        json(res, 201, { ok: true }, cors);
      } catch (e) { if (!res.headersSent) fail(e.status || 500, bodyFehler(e)); }
      return;
    }
    const treffer = url.pathname.match(/^\/v1\/vaults\/([A-Za-z0-9_-]{20,100})\/updates$/);
    if (treffer) {
      const vaultId = treffer[1];
      if (!autorisiert(req, vaultId)) { fail(401, 'nicht_berechtigt'); return; }
      if (req.method === 'GET') {
        const afterText = url.searchParams.get('after') || '0';
        const limitText = url.searchParams.get('limit') || '200';
        if (!/^\d{1,16}$/.test(afterText) || !/^\d{1,4}$/.test(limitText)) { fail(400, 'ungueltiger_marker'); return; }
        const after = Math.min(Number(afterText), Number.MAX_SAFE_INTEGER);
        const limit = Math.max(1, Math.min(500, Number(limitText)));
        const updates = qUpdates.all(vaultId, after, limit);
        const latest = Number(qLatest.get(vaultId).seq || 0);
        const letzter = updates.length ? Number(updates[updates.length - 1].seq) : after;
        json(res, 200, { updates, latest, more: latest > letzter }, cors); return;
      }
      if (req.method === 'POST') {
        try {
          const body = await liesBody(req, MAX_UPDATE_BODY);
          if (!ID_RE.test(body.id || '') || typeof body.iv !== 'string' || body.iv.length < 16 || body.iv.length > 32 || !B64_RE.test(body.iv) ||
              typeof body.ciphertext !== 'string' || body.ciphertext.length < 20 || body.ciphertext.length > 22 * 1024 * 1024 || !B64_RE.test(body.ciphertext)) {
            fail(400, 'ungueltiges_update'); return;
          }
          qInsertUpdate.run(vaultId, body.id, body.iv, body.ciphertext, Date.now());
          const zeile = qUpdate.get(vaultId, body.id);
          json(res, 200, { ok: true, seq: Number(zeile.seq) }, cors);
        } catch (e) { if (!res.headersSent) fail(e.status || 500, bodyFehler(e)); }
        return;
      }
      res.writeHead(405, { Allow: 'GET, POST, OPTIONS', ...cors }); res.end(); return;
    }
    const blobTreffer = url.pathname.match(/^\/v1\/vaults\/([A-Za-z0-9_-]{20,100})\/blobs(?:\/([A-Za-z0-9_-]{1,200})\/(\d{1,6}))?$/);
    if (blobTreffer) {
      const vaultId = blobTreffer[1];
      if (!autorisiert(req, vaultId)) { fail(401, 'nicht_berechtigt'); return; }
      if (req.method === 'POST' && !blobTreffer[2]) {
        try {
          const body = await liesBody(req, MAX_BLOB_BODY);
          const chunk = Number(body.chunk);
          if (!/^[A-Za-z0-9_-]{1,200}$/.test(body.blobId || '') || !Number.isInteger(chunk) || chunk < 0 || chunk > 100000 ||
              typeof body.iv !== 'string' || body.iv.length < 16 || body.iv.length > 32 || !B64_RE.test(body.iv) ||
              typeof body.ciphertext !== 'string' || body.ciphertext.length < 20 || body.ciphertext.length > 1500000 || !B64_RE.test(body.ciphertext)) {
            fail(400, 'ungueltiger_block'); return;
          }
          qInsertChunk.run(vaultId, body.blobId, chunk, body.iv, body.ciphertext, Date.now());
          json(res, 200, { ok: true }, cors);
        } catch (e) { if (!res.headersSent) fail(e.status || 500, bodyFehler(e)); }
        return;
      }
      if (req.method === 'GET' && blobTreffer[2]) {
        const chunk = Number(blobTreffer[3]);
        if (!Number.isInteger(chunk) || chunk < 0 || chunk > 100000) { fail(400, 'ungueltiger_block'); return; }
        const zeile = qChunk.get(vaultId, blobTreffer[2], chunk);
        if (!zeile) { fail(404, 'nicht_da'); return; }
        json(res, 200, zeile, cors); return;
      }
      res.writeHead(405, { Allow: 'GET, POST, OPTIONS', ...cors }); res.end(); return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD', ...cors }); res.end(); return; }
    let relativ;
    try { relativ = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'; }
    catch (_) { fail(400, 'kaputte_adresse'); return; }
    relativ = oeffentlicherPfad(relativ);
    if (!relativ) { fail(403, 'nicht_erlaubt'); return; }
    const datei = path.resolve(statikBasis, relativ);
    if (datei !== statikBasis && !datei.startsWith(statikBasis + path.sep)) { fail(403, 'nicht_erlaubt'); return; }
    fs.realpath(datei, (realErr, echteDatei) => {
      const erlaubt = !realErr && (echteDatei === statikBasis || echteDatei.startsWith(statikBasis + path.sep));
      if (!erlaubt) { fail(realErr ? 404 : 403, realErr ? 'nicht_da' : 'nicht_erlaubt'); return; }
      fs.stat(echteDatei, (err, st) => {
        if (err || !st.isFile()) { fail(404, 'nicht_da'); return; }
        res.writeHead(200, { ...cors, 'Content-Type': MIME[path.extname(echteDatei).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size });
        if (req.method === 'HEAD') { res.end(); return; }
        const strom = fs.createReadStream(echteDatei);
        strom.on('error', () => res.destroy());
        strom.pipe(res);
      });
    });
  });
  server.headersTimeout = 15000;
  server.requestTimeout = 120000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 1000;
  server.on('close', () => { try { db.close(); } catch (_) {} });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Math.max(1, Math.min(65535, Number.parseInt(process.env.PORT || '8787', 10) || 8787));
  const origins = process.env.VANI_ORIGINS || '*';
  const server = erzeugeSyncDienst({ erlaubteOrigins: origins });
  server.on('error', (e) => { console.error(e.message); process.exitCode = 1; });
  server.listen(port, '0.0.0.0', () => console.log('VANI mit verschlüsseltem Sync läuft auf Port ' + port));
}
