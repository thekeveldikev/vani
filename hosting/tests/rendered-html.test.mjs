import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Hosting-Build enthält die echte VANI-PWA statt des Starters", async () => {
  const [index, manifest, worker, hosting] = await Promise.all([
    readFile(new URL("public/index.html", root), "utf8"),
    readFile(new URL("public/manifest.json", root), "utf8"),
    readFile(new URL("worker/index.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
  ]);
  assert.match(index, /const APP_VERSION = '5\.2\.1'/);
  assert.match(index, /Privater Bereich/);
  assert.match(index, /Wem gehört dieses VANI/);
  assert.match(index, /Funkenkiste/);
  assert.match(index, /richTeileFuerHoehe/);
  assert.equal(JSON.parse(manifest).id, "./");
  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.equal(JSON.parse(hosting).r2, "FILES");
  assert.match(JSON.parse(hosting).project_id, /^appgprj_/);
  assert.match(worker, /ciphertext|token_hash/);
  assert.doesNotMatch(index + worker, /codex-preview|SkeletonPreview/);
});

test("Hosting-Worker trennt Metadaten und verschlüsselte Dateiblöcke", async () => {
  const worker = await readFile(new URL("worker/index.ts", root), "utf8");
  assert.match(worker, /idx_updates_vault_seq/);
  assert.match(worker, /env\.FILES\.put/);
  assert.match(worker, /nicht_berechtigt/);
  assert.match(worker, /timing|function gleich/);
  assert.match(worker, /zu_viele_anfragen/);
  assert.match(worker, /24 \* 1024 \* 1024/);
  assert.match(worker, /VANI_HAUPTADRESSE = "https:\/\/thekeveldikev\.github\.io\/vani\/"/);
  assert.match(worker, /url\.searchParams\.get\("rettung"\) !== "1"/);
  assert.match(worker, /self\.registration\.unregister/);
});
