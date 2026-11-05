// TASK 17C — lokal granskningskoppling för frilagda original. Ingenting laddas upp till Nyehandel:
// i Playwright-kontexten byts varje CDN-hämtning av en granskad bild (alla storlekar, samma bildhash)
// mot den lokala WebP:n med alfa, och den lokala bundlens manifestpost för hashen byts mot
// manifestposten mätt ur WebP:n (cutouts.json, skriven av cutout-prep.mjs). Produktionskoden är orörd.
import fs from "node:fs"; import path from "node:path";
import { DIR, BUILDS } from "./harness.mjs";
const HASH = /-([0-9a-f]{8})\.(?:jpe?g|png|webp|gif)$/i;
export function keyOfUrl(u) {
  const p = new URL(u).pathname.slice(1); let m = HASH.exec(p); if (m) return m[1];
  const seg = p.split("/")[0]; if (!seg.startsWith("eyJ")) return null;
  try { m = HASH.exec(JSON.parse(Buffer.from(seg, "base64").toString("utf8")).key || ""); return m ? m[1] : null; } catch { return null; }
}
export function loadCutouts(only) {
  const f = path.join(DIR, "cutouts/cutouts.json"); if (!fs.existsSync(f)) return {};
  const all = JSON.parse(fs.readFileSync(f, "utf8"));
  return Object.fromEntries(Object.entries(all).filter(([, v]) => !only || only.includes(v.slug)));
}
/* review(ctx): används som harness-opts.review. which = bygget vars bundle ska få manifestposterna. */
export const reviewImages = (cutouts, which = "after") => async ctx => {
  const keys = Object.keys(cutouts); if (!keys.length) return;
  ctx.reviewHits = 0;
  await ctx.route(/cloudfront\.net\//, r => {
    const k = keyOfUrl(r.request().url()); const c = k && cutouts[k];
    if (!c) return r.continue();
    ctx.reviewHits++;
    return r.fulfill({ path: path.join(DIR, c.webp), contentType: "image/webp", headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" } });
  });
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => {
    let js = fs.readFileSync(path.join(BUILDS[which].build, "hazey-theme8.min.js"), "utf8");
    for (const k of keys) js = js.replace(new RegExp(`(["']?${k}["']?\\s*:\\s*)"[^"]*"`), (m, a) => a + JSON.stringify(cutouts[k].entry));
    return r.fulfill({ body: js, contentType: "application/javascript" });
  });
};
