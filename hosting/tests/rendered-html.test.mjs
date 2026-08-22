import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Hosting-Build enthält Umzugsseite, Rettungsraum und keinen zweiten Service Worker", async () => {
  const [index, rettung, serviceWorker, manifest, worker, hosting] = await Promise.all([
    readFile(new URL("public/index.html", root), "utf8"),
    readFile(new URL("public/rettung.html", root), "utf8"),
    readFile(new URL("public/sw.js", root), "utf8"),
    readFile(new URL("public/manifest.json", root), "utf8"),
    readFile(new URL("worker/index.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
  ]);
  assert.match(index, /VANI hat jetzt ein einziges Zuhause/);
  assert.match(index, /https:\/\/thekeveldikev\.github\.io\/vani\//);
  assert.match(index, /rettung\.html\?rettung=1&amp;kein-sw=1/);
  assert.doesNotMatch(index, /rel=["']manifest["']/);
  assert.match(rettung, /const APP_VERSION = '5\.9\.0'/);
  /* Die Rettungsfassung muss den Umzugshelfer und den dateilosen Weg kennen —
     sonst steht jemand mit altem Bestand auf einem Schul-iPad ohne Ausweg da. */
  assert.match(rettung, /function umzugsHelfer/);
  assert.match(rettung, /In die Zwischenablage sichern/);
  /* Die Umzugsseite leitet nicht mehr blind nach fünf Sekunden weiter. */
  assert.match(index, /indexedDB\.open/);
  assert.match(index, /Alten Bestand retten/);
  assert.doesNotMatch(index, /\),5000\)/, 'der blinde 5-Sekunden-Redirect ist zurück');
  assert.match(rettung, /Privater Bereich/);
  assert.match(rettung, /Wem gehört dieses VANI/);
  assert.match(rettung, /Funkenkiste/);
  assert.match(rettung, /richTeileFuerHoehe/);
  assert.match(serviceWorker, /self\.registration\.unregister/);
  assert.doesNotMatch(serviceWorker, /fetch/);
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
  assert.match(worker, /url\.pathname === "\/rettung\.html"/);
  assert.match(worker, /self\.registration\.unregister/);
});
