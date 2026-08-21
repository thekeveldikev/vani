import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import * as Y from 'yjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
function clientKern() {
  const c = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Date, Math, JSON, Object, Array, Set, Map, String, Number, RegExp,
    Uint8Array, TextEncoder, TextDecoder, URL, Promise,
    crypto: webcrypto, VaniY: { Y },
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    window: { addEventListener() {}, dispatchEvent() {} },
    document: { addEventListener() {}, visibilityState: 'visible' },
    location: { protocol: 'https:', origin: 'https://vani.example' },
    navigator: { onLine: true }
  };
  c.globalThis = c;
  vm.createContext(c);
  vm.runInContext(readFileSync(join(wurzel, 'src/31-sync.js'), 'utf8'), c, { filename: '31-sync.js' });
  return vm.runInContext('({ syncB64, syncBytes, syncServerAdresse, syncSaubereConfig, syncKopplungscode, syncLeseKopplungscode, syncVerschluessle, syncEntschluessle, syncTextSetzen, setConfig: (c) => { _sync.config = c; } })', c);
}
function config() {
  return { v: 1, name: 'Test', server: 'https://sync.example', vault: 'v'.repeat(24), token: 't'.repeat(48), key: 'a'.repeat(43) };
}

test('Sync-Client: nur HTTPS (außer localhost) und streng begrenzte Geheimnisse', () => {
  const k = clientKern();
  assert.equal(k.syncServerAdresse('https://sync.example///?token=leak#x'), 'https://sync.example');
  assert.equal(k.syncServerAdresse('http://sync.example'), '');
  assert.equal(k.syncServerAdresse('javascript:alert(1)'), '');
  assert.equal(k.syncServerAdresse('http://localhost:8787/'), 'http://localhost:8787');
  assert.ok(k.syncSaubereConfig(config()));
  assert.equal(k.syncSaubereConfig({ ...config(), token: 'kurz' }), null);
  assert.equal(k.syncSaubereConfig({ ...config(), server: 'https://ok.example@evil.example'.replace('https://', 'http://') }), null);
});

test('Sync-Client: Kopplungscode rundreist, Verstümmelung und Größenangriff scheitern', () => {
  const k = clientKern();
  k.setConfig(config());
  const code = k.syncKopplungscode();
  assert.match(code, /^VANI1-/);
  assert.equal(k.syncLeseKopplungscode(code).vault, config().vault);
  assert.equal(k.syncLeseKopplungscode(code.slice(0, -5)), null);
  assert.equal(k.syncLeseKopplungscode('VANI1-' + 'A'.repeat(2000)), null);
});

test('Sync-Client: AES-GCM ist verlustfrei und erkennt manipulierte Pakete', async () => {
  const k = clientKern();
  const c = config();
  c.key = k.syncB64(webcrypto.getRandomValues(new Uint8Array(32)));
  k.setConfig(c);
  const klar = new TextEncoder().encode('Umlaute äöü · ' + 'x'.repeat(10000));
  const paket = await k.syncVerschluessle(klar);
  assert.deepEqual([...await k.syncEntschluessle(paket)], [...klar]);
  const mitte = Math.floor(paket.ciphertext.length / 2);
  const boese = { ...paket, ciphertext: paket.ciphertext.slice(0, mitte) + (paket.ciphertext[mitte] === 'A' ? 'B' : 'A') + paket.ciphertext.slice(mitte + 1) };
  await assert.rejects(() => k.syncEntschluessle(boese));
});

test('Sync-Client: gleichzeitige Texteingaben konvergieren ohne verlorenen Zusatz', () => {
  const k = clientKern();
  const a = new Y.Doc(), b = new Y.Doc();
  const ta = a.getText('text'), tb = b.getText('text');
  k.syncTextSetzen(ta, 'Hallo');
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  k.syncTextSetzen(ta, 'Hallo A');
  k.syncTextSetzen(tb, 'Hallo B');
  const ua = Y.encodeStateAsUpdate(a), ub = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, ub); Y.applyUpdate(b, ua);
  assert.equal(ta.toString(), tb.toString());
  assert.match(ta.toString(), /A/);
  assert.match(ta.toString(), /B/);
});
