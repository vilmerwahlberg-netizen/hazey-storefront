// Växterna vid papperskapitlet (och Om-bilden): helt inom fönstret,
// ingen sidledsscroll, ingen överlappning med text. Bilder -> shots/r5-leaves/.
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(DIR, "shots", "blad"); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = {};
for (const [w, h] of [[393, 852], [430, 932], [1440, 900], [1920, 1080]]) {
  const ctx = await ctxFor(b, w, h, { scale: w < 768 ? 2 : 1 });
  const p = await open(ctx, URL_("/sv/products/thc-x-vape-hero-core-2ml"));
  await p.waitForSelector(".hz8-pcx-sum__leaf", { timeout: 30000 }); await p.waitForTimeout(4500);
  R[w] = await p.evaluate(() => {
    const rr = e => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top + scrollY), b: Math.round(r.bottom + scrollY) }; };
    const texts = [...document.querySelectorAll("#hz8-pcx-sum h2, #hz8-pcx-sum .hz8-pcx-sum__lead, #hz8-pcx-sum .hz8-pcx-sum__cues li, #hz8-pcx-strains h2, #hz8-pcx-strains .hz8-pcx-sa__head p")].map(rr);
    const leaves = [...document.querySelectorAll(".hz8-pcx-sum__leaf")].map(rr);
    // Bladmassan: nedre ~70 % och vänstra ~70 % av rutan (spegelvänt för höger)
    const mass = (L, i) => { const W = L.r - L.l, H = L.b - L.t; return i === 0 ? { l: L.l, r: L.l + W * .55, t: L.t + H * .35, b: L.b - H * .2 } : { l: L.r - W * .55, r: L.r, t: L.t + H * .35, b: L.b - H * .2 }; };
    const hit = (a, c) => a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t;
    return { vw: innerWidth, docW: document.documentElement.scrollWidth, leaves, insideViewport: leaves.every(L => L.l >= 0 && L.r <= innerWidth), textOverlap: leaves.some((L, i) => texts.some(t => hit(mass(L, i), t))) };
  });
  const s = R[w].leaves[0], e = R[w].leaves[1];
  const top = Math.min(s.t, e.t) - 60, bot = Math.max(s.b, e.b) + 30;
  await p.setViewportSize({ width: w, height: Math.max(h, bot + 50) }); await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(OUT, `r5-${w}-papper-hornen.jpg`), clip: { x: 0, y: Math.max(0, top - 200), width: w, height: bot - top + 200 }, type: "jpeg", quality: 86 });
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "leaves.json"), JSON.stringify(R, null, 1));
for (const w in R) console.log(w, "docW", R[w].docW, "inom fönstret", R[w].insideViewport, "överlapp text", R[w].textOverlap, JSON.stringify(R[w].leaves));
await b.close();
