import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { erzeugeSyncDienst } from '../sync-server/server.mjs';

let server, basis, temp;
const vaultA = 'A'.repeat(24), vaultB = 'B'.repeat(24);
const tokenA = 'a'.repeat(48), tokenB = 'b'.repeat(48);
const update = (id, text = 'geheim') => ({ id, iv: 'i'.repeat(16), ciphertext: Buffer.from(text).toString('base64url').padEnd(20, 'A') });
async function api(pfad, { method = 'GET', token, body, roh } = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(basis + pfad, { method, headers, body: roh !== undefined ? roh : body === undefined ? undefined : JSON.stringify(body) });
}

before(async () => {
  temp = mkdtempSync(join(tmpdir(), 'vani-sync-test-'));
  server = erzeugeSyncDienst({ datenbankPfad: join(temp, 'sync.sqlite'), statikWurzel: join(import.meta.dirname, '..') });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  basis = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  rmSync(temp, { recursive: true, force: true });
});

test('Sync-Server: Gesundheit, Eingabegrenzen und getrennte Bereiche', async () => {
  let r = await api('/v1/health');
  assert.equal(r.status, 200);
  assert.equal((await r.json()).dienst, 'vani-sync');
  r = await api('/v1/vaults', { method: 'POST', body: { vaultId: 'kurz', token: tokenA } });
  assert.equal(r.status, 400);
  for (const [vaultId, token] of [[vaultA, tokenA], [vaultB, tokenB]]) {
    r = await api('/v1/vaults', { method: 'POST', body: { vaultId, token } });
    assert.equal(r.status, 201);
  }
  r = await api('/v1/vaults', { method: 'POST', body: { vaultId: vaultA, token: tokenA } });
  assert.equal(r.status, 409);
});

test('Sync-Server: falsche Schlüssel, fremde Bereiche und kaputte Marker bleiben draußen', async () => {
  assert.equal((await api(`/v1/vaults/${vaultA}/updates`)).status, 401);
  assert.equal((await api(`/v1/vaults/${vaultA}/updates`, { token: tokenB })).status, 401);
  assert.equal((await api(`/v1/vaults/${vaultA}/updates?after=-1`, { token: tokenA })).status, 400);
  assert.equal((await api(`/v1/vaults/${vaultA}/updates`, { method: 'POST', token: tokenA, roh: '{' })).status, 400);
  assert.equal((await api(`/v1/vaults/${vaultA}/updates`, { method: 'POST', token: tokenA, body: { id: 'x'.repeat(24), iv: '*kaputt*', ciphertext: 'x'.repeat(30) } })).status, 400);
});

test('Sync-Server: Deduplizierung, Reihenfolge und Bereichsisolation', async () => {
  const p = update('u'.repeat(24), 'eins');
  let r = await api(`/v1/vaults/${vaultA}/updates`, { method: 'POST', token: tokenA, body: p });
  const seq = (await r.json()).seq;
  r = await api(`/v1/vaults/${vaultA}/updates`, { method: 'POST', token: tokenA, body: p });
  assert.equal((await r.json()).seq, seq);
  const a = await (await api(`/v1/vaults/${vaultA}/updates?after=0`, { token: tokenA })).json();
  const b = await (await api(`/v1/vaults/${vaultB}/updates?after=0`, { token: tokenB })).json();
  assert.equal(a.updates.length, 1);
  assert.equal(b.updates.length, 0);
  assert.equal(a.updates[0].ciphertext, p.ciphertext);
});

test('Sync-Server: parallele Schreiber verlieren und duplizieren nichts', async () => {
  const anzahl = 80;
  const antworten = await Promise.all(Array.from({ length: anzahl }, (_, i) => api(`/v1/vaults/${vaultB}/updates`, {
    method: 'POST', token: tokenB, body: update(('p' + i.toString(36).padStart(6, '0')).padEnd(24, 'x'), 'wert-' + i)
  })));
  assert.ok(antworten.every((r) => r.status === 200));
  const alle = await (await api(`/v1/vaults/${vaultB}/updates?after=0&limit=500`, { token: tokenB })).json();
  assert.equal(alle.updates.length, anzahl);
  assert.equal(new Set(alle.updates.map((x) => x.id)).size, anzahl);
  assert.deepEqual(alle.updates.map((x) => x.seq), [...alle.updates].map((x) => x.seq).sort((a, b) => a - b));
});

test('Sync-Server: verschlüsselte Dateiblöcke sind authentifiziert und isoliert', async () => {
  const block = { blobId: 'foto-1', chunk: 0, iv: 'z'.repeat(16), ciphertext: 'q'.repeat(100) };
  assert.equal((await api(`/v1/vaults/${vaultA}/blobs`, { method: 'POST', token: tokenA, body: block })).status, 200);
  let r = await api(`/v1/vaults/${vaultA}/blobs/foto-1/0`, { token: tokenA });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ciphertext, block.ciphertext);
  assert.equal((await api(`/v1/vaults/${vaultA}/blobs/foto-1/0`, { token: tokenB })).status, 401);
  assert.equal((await api(`/v1/vaults/${vaultB}/blobs/foto-1/0`, { token: tokenB })).status, 404);
});

test('Sync-Server: übergroße Körper werden früh und sauber abgewiesen', async () => {
  const zuGross = JSON.stringify({ blobId: 'x', chunk: 0, iv: 'z'.repeat(16), ciphertext: 'q'.repeat(2 * 1024 * 1024) });
  const r = await api(`/v1/vaults/${vaultA}/blobs`, { method: 'POST', token: tokenA, roh: zuGross });
  assert.equal(r.status, 413);
});
