// TASK 11 -- jämför reg-before.json och reg-after.json: DOM-signatur
// (rubriker, kortordning, modulkort, köpknappar, sidmarkörer, överflöd,
// konsolfel) + pixeldiff av fullsidesbilderna (pixelmatch, threshold .1).
// Skriver runs/compare.json och diffbilder runs/shots/diff-reg-*.png.
// node compare.mjs
import fs from "node:fs"; import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
const DIR = new URL(".", import.meta.url).pathname;
const A = JSON.parse(fs.readFileSync(`${DIR}runs/reg-before.json`)), B = JSON.parse(fs.readFileSync(`${DIR}runs/reg-after.json`));
const R = {};
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k]; if (!b) { R[k] = { missing: true }; continue; }
  const diff = {};
  for (const f of new Set([...Object.keys(a), ...Object.keys(b)])) if (f !== "height" && JSON.stringify(a[f]) !== JSON.stringify(b[f])) diff[f] = { before: a[f], after: b[f] };
  const r = { domEqual: !Object.keys(diff).length, diff, height: [a.height, b.height] };
  const fa = `${DIR}runs/shots/before-reg-${k}.png`, fb = `${DIR}runs/shots/after-reg-${k}.png`;
  if (fs.existsSync(fa) && fs.existsSync(fb)) {
    const ia = PNG.sync.read(fs.readFileSync(fa)), ib = PNG.sync.read(fs.readFileSync(fb));
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const crop = im => { if (im.width === w && im.height === h) return im.data; const o = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y++) im.data.copy(o, y * w * 4, y * im.width * 4, y * im.width * 4 + w * 4); return o; };
    const out = new PNG({ width: w, height: h });
    const n = pixelmatch(crop(ia), crop(ib), out.data, w, h, { threshold: 0.1 });
    r.px = { size: [`${ia.width}x${ia.height}`, `${ib.width}x${ib.height}`], diff: n, pct: +(100 * n / (w * h)).toFixed(3) };
    if (n) fs.writeFileSync(`${DIR}runs/shots/diff-reg-${k}.png`, PNG.sync.write(out));
  }
  R[k] = r;
}
fs.writeFileSync(`${DIR}runs/compare.json`, JSON.stringify(R, null, 1));
for (const [k, r] of Object.entries(R)) console.log(k.padEnd(22), r.domEqual ? "DOM =" : "DOM ≠ " + Object.keys(r.diff).join(","), r.px ? `px ${r.px.pct}% ${r.px.size.join(" / ")}` : "");
