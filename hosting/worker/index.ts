import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  FILES: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): { transform(options: Record<string, unknown>): { output(options: { format: string; quality: number }): Promise<{ response(): Response }> } };
  };
}
interface ExecutionContext { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void; }

const ID_RE = /^[A-Za-z0-9_-]{20,100}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{40,180}$/;
const B64_RE = /^[A-Za-z0-9_-]+$/;
const VANI_HAUPTADRESSE = "https://thekeveldikev.github.io/vani/";
const VANI_DATEIEN = new Set(["/index.html", "/rettung.html", "/manifest.json", "/sw.js", "/faden.enc", "/robots.txt"]);
const rate = new Map<string, { seit: number; zahl: number }>();
let schemaBereit: Promise<void> | null = null;

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
}
function json(status: number, body: unknown) { return Response.json(body, { status, headers: cors() }); }
function fehler(status: number, code: string) { return json(status, { fehler: code }); }
function hex(bytes: ArrayBuffer) { return [...new Uint8Array(bytes)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
async function sha(text: string) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))); }
function gleich(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function bearer(request: Request) {
  const h = request.headers.get("authorization") || "";
  return /^Bearer [A-Za-z0-9_-]{40,180}$/.test(h) ? h.slice(7) : "";
}
async function body(request: Request, max: number) {
  const laenge = Number(request.headers.get("content-length") || 0);
  if (laenge > max) throw Object.assign(new Error("zu_gross"), { status: 413 });
  const text = await request.text();
  if (text.length > max) throw Object.assign(new Error("zu_gross"), { status: 413 });
  try { return JSON.parse(text || "{}"); }
  catch { throw Object.assign(new Error("kaputtes_json"), { status: 400 }); }
}
function rateOk(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || "lokal";
  const jetzt = Date.now();
  let r = rate.get(ip);
  if (!r || jetzt - r.seit > 60000) r = { seit: jetzt, zahl: 0 };
  r.zahl++; rate.set(ip, r);
  if (rate.size > 5000) for (const [k, v] of rate) if (jetzt - v.seit > 120000) rate.delete(k);
  return r.zahl <= 360;
}
async function schema(env: Env) {
  if (!schemaBereit) schemaBereit = (async () => {
    await env.DB.batch([
      env.DB.prepare("CREATE TABLE IF NOT EXISTS vaults (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created_at INTEGER NOT NULL) STRICT"),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS updates (seq INTEGER PRIMARY KEY AUTOINCREMENT, vault_id TEXT NOT NULL, update_id TEXT NOT NULL, iv TEXT NOT NULL, object_key TEXT NOT NULL, cipher_length INTEGER NOT NULL, created_at INTEGER NOT NULL, UNIQUE(vault_id, update_id)) STRICT"),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_updates_vault_seq ON updates(vault_id, seq)"),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS blob_chunks (vault_id TEXT NOT NULL, blob_id TEXT NOT NULL, chunk_no INTEGER NOT NULL, iv TEXT NOT NULL, object_key TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(vault_id, blob_id, chunk_no)) STRICT"),
    ]);
  })();
  return schemaBereit;
}
async function autorisiert(request: Request, env: Env, vault: string) {
  const token = bearer(request);
  if (!token) return false;
  const row = await env.DB.prepare("SELECT token_hash FROM vaults WHERE id = ?").bind(vault).first<{ token_hash: string }>();
  return !!row && gleich(row.token_hash, await sha(token));
}
async function api(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (!url.pathname.startsWith("/v1/")) return null;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (!rateOk(request)) return fehler(429, "zu_viele_anfragen");
  if (request.method === "GET" && url.pathname === "/v1/health") return json(200, { ok: true, dienst: "vani-sync", version: 1 });
  await schema(env);
  if (request.method === "POST" && url.pathname === "/v1/vaults") {
    try {
      const b = await body(request, 16 * 1024) as { vaultId?: string; token?: string };
      if (!ID_RE.test(b.vaultId || "") || !TOKEN_RE.test(b.token || "")) return fehler(400, "ungueltiger_bereich");
      const alt = await env.DB.prepare("SELECT id FROM vaults WHERE id = ?").bind(b.vaultId).first();
      if (alt) return fehler(409, "bereich_existiert");
      await env.DB.prepare("INSERT INTO vaults(id, token_hash, created_at) VALUES (?, ?, ?)").bind(b.vaultId, await sha(b.token!), Date.now()).run();
      return json(201, { ok: true });
    } catch (e) { return fehler((e as { status?: number }).status || 500, (e as Error).message === "kaputtes_json" ? "kaputtes_json" : "serverfehler"); }
  }
  const updateMatch = url.pathname.match(/^\/v1\/vaults\/([A-Za-z0-9_-]{20,100})\/updates$/);
  if (updateMatch) {
    const vault = updateMatch[1];
    if (!await autorisiert(request, env, vault)) return fehler(401, "nicht_berechtigt");
    if (request.method === "POST") {
      try {
        const b = await body(request, 24 * 1024 * 1024) as { id?: string; iv?: string; ciphertext?: string };
        if (!ID_RE.test(b.id || "") || !b.iv || b.iv.length < 16 || b.iv.length > 32 || !B64_RE.test(b.iv) ||
            !b.ciphertext || b.ciphertext.length < 20 || b.ciphertext.length > 22 * 1024 * 1024 || !B64_RE.test(b.ciphertext)) return fehler(400, "ungueltiges_update");
        const alt = await env.DB.prepare("SELECT seq FROM updates WHERE vault_id = ? AND update_id = ?").bind(vault, b.id).first<{ seq: number }>();
        if (alt) return json(200, { ok: true, seq: alt.seq });
        const objekt = `updates/${vault}/${b.id}/${await sha(b.ciphertext)}`;
        await env.FILES.put(objekt, b.ciphertext, { httpMetadata: { contentType: "text/plain" } });
        await env.DB.prepare("INSERT OR IGNORE INTO updates(vault_id, update_id, iv, object_key, cipher_length, created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(vault, b.id, b.iv, objekt, b.ciphertext.length, Date.now()).run();
        const row = await env.DB.prepare("SELECT seq FROM updates WHERE vault_id = ? AND update_id = ?").bind(vault, b.id).first<{ seq: number }>();
        return json(200, { ok: true, seq: row?.seq || 0 });
      } catch (e) { return fehler((e as { status?: number }).status || 500, (e as Error).message === "kaputtes_json" ? "kaputtes_json" : "serverfehler"); }
    }
    if (request.method === "GET") {
      const afterText = url.searchParams.get("after") || "0";
      const limitText = url.searchParams.get("limit") || "200";
      if (!/^\d{1,16}$/.test(afterText) || !/^\d{1,4}$/.test(limitText)) return fehler(400, "ungueltiger_marker");
      const after = Math.min(Number(afterText), Number.MAX_SAFE_INTEGER), limit = Math.max(1, Math.min(500, Number(limitText)));
      const rows = await env.DB.prepare("SELECT seq, update_id AS id, iv, object_key, cipher_length FROM updates WHERE vault_id = ? AND seq > ? ORDER BY seq ASC LIMIT ?")
        .bind(vault, after, limit).all<{ seq: number; id: string; iv: string; object_key: string; cipher_length: number }>();
      const updates: Array<{ seq: number; id: string; iv: string; ciphertext: string }> = [];
      let gesamt = 0;
      for (const row of rows.results) {
        if (updates.length && gesamt + row.cipher_length > 10 * 1024 * 1024) break;
        const objekt = await env.FILES.get(row.object_key);
        if (!objekt) return fehler(500, "paket_fehlt");
        const ciphertext = await objekt.text();
        updates.push({ seq: row.seq, id: row.id, iv: row.iv, ciphertext }); gesamt += ciphertext.length;
      }
      const latest = await env.DB.prepare("SELECT COALESCE(MAX(seq), 0) AS seq FROM updates WHERE vault_id = ?").bind(vault).first<{ seq: number }>();
      const letzter = updates.length ? updates[updates.length - 1].seq : after;
      return json(200, { updates, latest: latest?.seq || 0, more: (latest?.seq || 0) > letzter });
    }
    return new Response(null, { status: 405, headers: { ...cors(), Allow: "GET, POST, OPTIONS" } });
  }
  const blobMatch = url.pathname.match(/^\/v1\/vaults\/([A-Za-z0-9_-]{20,100})\/blobs(?:\/([A-Za-z0-9_-]{1,200})\/(\d{1,6}))?$/);
  if (blobMatch) {
    const vault = blobMatch[1];
    if (!await autorisiert(request, env, vault)) return fehler(401, "nicht_berechtigt");
    if (request.method === "POST" && !blobMatch[2]) {
      try {
        const b = await body(request, 2 * 1024 * 1024) as { blobId?: string; chunk?: number; iv?: string; ciphertext?: string };
        const chunk = Number(b.chunk);
        if (!/^[A-Za-z0-9_-]{1,200}$/.test(b.blobId || "") || !Number.isInteger(chunk) || chunk < 0 || chunk > 100000 ||
            !b.iv || b.iv.length < 16 || b.iv.length > 32 || !B64_RE.test(b.iv) || !b.ciphertext || b.ciphertext.length < 20 || b.ciphertext.length > 1500000 || !B64_RE.test(b.ciphertext)) return fehler(400, "ungueltiger_block");
        const alt = await env.DB.prepare("SELECT object_key FROM blob_chunks WHERE vault_id = ? AND blob_id = ? AND chunk_no = ?").bind(vault, b.blobId, chunk).first();
        if (!alt) {
          const objekt = `blobs/${vault}/${b.blobId}/${chunk}/${await sha(b.ciphertext)}`;
          await env.FILES.put(objekt, b.ciphertext, { httpMetadata: { contentType: "text/plain" } });
          await env.DB.prepare("INSERT OR IGNORE INTO blob_chunks(vault_id, blob_id, chunk_no, iv, object_key, created_at) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(vault, b.blobId, chunk, b.iv, objekt, Date.now()).run();
        }
        return json(200, { ok: true });
      } catch (e) { return fehler((e as { status?: number }).status || 500, (e as Error).message === "kaputtes_json" ? "kaputtes_json" : "serverfehler"); }
    }
    if (request.method === "GET" && blobMatch[2]) {
      const chunk = Number(blobMatch[3]);
      const row = await env.DB.prepare("SELECT iv, object_key FROM blob_chunks WHERE vault_id = ? AND blob_id = ? AND chunk_no = ?").bind(vault, blobMatch[2], chunk).first<{ iv: string; object_key: string }>();
      if (!row) return fehler(404, "nicht_da");
      const objekt = await env.FILES.get(row.object_key);
      if (!objekt) return fehler(500, "block_fehlt");
      return json(200, { iv: row.iv, ciphertext: await objekt.text() });
    }
    return new Response(null, { status: 405, headers: { ...cors(), Allow: "GET, POST, OPTIONS" } });
  }
  return fehler(404, "nicht_da");
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const apiAntwort = await api(request, env, url);
    if (apiAntwort) return apiAntwort;
    /* Sites ist ab VANI 5.2.1 ausschließlich der verschlüsselte Hintergrund.
       Seine frühere App-Startseite erzeugt keinen zweiten lokalen Datenbestand
       mehr. Ein bewusst aufgerufener Rettungsmodus lässt alte Origin-Daten noch
       sichern, ohne sich erneut als PWA zu installieren. */
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: VANI_HAUPTADRESSE,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    if (url.pathname === "/rettung.html") {
      const antwort = await env.ASSETS.fetch(new Request(new URL("/rettung.html", request.url), request));
      const headers = new Headers(antwort.headers);
      headers.set("Cache-Control", "no-store");
      headers.set("X-Robots-Tag", "noindex, nofollow");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Referrer-Policy", "no-referrer");
      return new Response(antwort.body, { status: antwort.status, headers });
    }
    if (url.pathname === "/sw.js") {
      const stilllegung = [
        "self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));",
        "self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x)))),self.registration.unregister(),self.clients.claim()])));",
      ].join("\n");
      return new Response(stilllegung, {
        headers: {
          "Content-Type": "text/javascript; charset=utf-8",
          "Cache-Control": "no-store",
          "Service-Worker-Allowed": "/",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (p) => env.ASSETS.fetch(new Request(new URL(p, request.url))),
        transformImage: async (b, { width, format, quality }) => (await env.IMAGES.input(b).transform(width > 0 ? { width } : {}).output({ format, quality })).response(),
      }, allowedWidths);
    }
    const statik = url.pathname;
    if (VANI_DATEIEN.has(statik) || statik.startsWith("/icons/")) {
      const antwort = await env.ASSETS.fetch(new Request(new URL(statik, request.url), request));
      const headers = new Headers(antwort.headers);
      headers.set("X-Content-Type-Options", "nosniff"); headers.set("Referrer-Policy", "no-referrer");
      if (statik === "/index.html" || statik === "/sw.js" || statik === "/manifest.json") headers.set("Cache-Control", "no-cache");
      return new Response(antwort.body, { status: antwort.status, headers });
    }
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
