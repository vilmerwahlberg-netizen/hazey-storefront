// Genererar Theme 8:s bildmanifest (theme8/js/03b-media-manifest.js) ur Nyehandels riktiga produktbilder.
// TASK 17C, 2026-11-05: ersätter pixelklassningen i besökarens webbläsare (TASK 17B). Samma analys som
// då -- nu en gång här, i stället för en extra CORS-hämtning + canvas-läsning per bild och besök.
//
// Källor (bara GET + Nyehandels egen läsande POST /frontend-api/product/state, inget skrivs):
//   produktsitemap + Alla produkter (listade men ej i sitemap) -> produktsida -> product/state.images.
// Analys per bild (400 px-miniatyren, nedskalad till 128x128 i Chromium):
//   transparent  minst halva kantringen genomskinlig (verkligt frilagt packshot)
//   white        jämn kantring, alla kanaler > 236
//   embedded     jämn kantring i annan ton (inbakad bakgrund, t.ex. Magic Sauce-beige)
//   environment  ojämn kantring (riktig miljöbild)
// För white/embedded mäts produktens marginal mot varje kant (pixlar som avviker > FG från kanttonen);
// tonzonen = marginal - SAFE, högst MAX_FADE. Produktens pixlar ändras aldrig.
//
// Kör:  node theme8/tools/media-manifest.mjs            (live katalog)
//       node theme8/tools/media-manifest.mjs --file x.png (analysera en lokal bild, skriver inget)
// Kräver playwright (repots node_modules).
import fs from "node:fs"; import path from "node:path"; import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT = path.join(ROOT, "theme8/js/03b-media-manifest.js");
const O = "https://hazeyse.nyehandel.se";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const P = { SIZE: 128, UNIFORM: 16, FG: 30, SAFE: 0.012, MAX_FADE: 0.12 };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Körs i Chromium. Identisk med TASK 17B:s analyse() i 03a-product-media.js (d2cf40e). */
function analyse(img, P) {
  const { SIZE, UNIFORM, FG, SAFE, MAX_FADE } = P;
  const c = document.createElement("canvas"); c.width = SIZE; c.height = SIZE;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0, SIZE, SIZE);
  const d = x.getImageData(0, 0, SIZE, SIZE).data;
  const ring = []; let clear = 0;
  for (let j = 0; j < SIZE; j++) for (let i = 0; i < SIZE; i++) {
    if (i > 1 && j > 1 && i < SIZE - 2 && j < SIZE - 2) continue;
    const k = (j * SIZE + i) * 4;
    if (d[k + 3] < 16) clear++; else ring.push([d[k], d[k + 1], d[k + 2]]);
  }
  if (clear / (clear + ring.length) >= 0.5) return { kind: "transparent" };
  const mean = [0, 1, 2].map(ch => ring.reduce((a, p) => a + p[ch], 0) / ring.length);
  const dev = (r, g, b) => Math.max(Math.abs(r - mean[0]), Math.abs(g - mean[1]), Math.abs(b - mean[2]));
  const devs = ring.map(p => dev(p[0], p[1], p[2])).sort((a, b) => a - b);
  if (devs[Math.floor(devs.length * 0.9)] > UNIFORM) return { kind: "environment" };
  let minX = SIZE, minY = SIZE, maxX = -1, maxY = -1;
  for (let y = 0; y < SIZE; y++) for (let xx = 0; xx < SIZE; xx++) {
    const q = (y * SIZE + xx) * 4;
    if (d[q + 3] >= 16 && dev(d[q], d[q + 1], d[q + 2]) > FG) { if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const out = { kind: mean.every(v => v > 236) ? "white" : "embedded", edge: mean.map(Math.round) };
  if (maxX < 0) return out;
  const side = m => Math.max(0, Math.min(m - SAFE, MAX_FADE));
  out.fade = { t: side(minY / SIZE), r: side((SIZE - 1 - maxX) / SIZE), b: side((SIZE - 1 - maxY) / SIZE), l: side(minX / SIZE) };
  return out;
}
/* Kompakt post: "<t|w|e|v>[ <hex> [<t> <r> <b> <l> i procent]]" */
export function encode(res) {
  const k = { transparent: "t", white: "w", embedded: "e", environment: "v" }[res.kind];
  if (!res.edge) return k;
  const hex = res.edge.map(v => v.toString(16).padStart(2, "0")).join("");
  const f = res.fade; if (!f) return `${k} ${hex}`;
  return `${k} ${hex} ${[f.t, f.r, f.b, f.l].map(v => +(v * 100).toFixed(1)).join(" ")}`;
}
export const keyOf = u => (String(u).match(/-([0-9a-f]{8})\.(?:jpe?g|png|webp|gif)$/i) || [])[1] || null;

export async function classifyUrls(urls) {
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto(O + "/robots.txt");
  const out = {};
  for (const u of urls) {
    out[u] = await p.evaluate(async ([u, src, P]) => {
      const analyse = new Function("return " + src)();
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = u;
      try { await img.decode(); return analyse(img, P); } catch (e) { return { kind: "unverified", error: String(e) }; }
    }, [u, analyse.toString(), P]);
  }
  await b.close(); return out;
}

async function catalogImages() {
  let ck = {};
  const keep = r => { for (const c of r.headers.getSetCookie()) { const [kv] = c.split(";"); const i = kv.indexOf("="); ck[kv.slice(0, i)] = kv.slice(i + 1); } };
  const req = async (u, opt = {}) => {
    for (let a = 0; ; a++) {
      try { const r = await fetch(u.startsWith("http") ? u : O + u, { ...opt, headers: { "User-Agent": UA, Cookie: Object.entries(ck).map(([k, v]) => `${k}=${v}`).join("; "), ...(opt.headers || {}) } }); keep(r); await sleep(150); return { status: r.status, text: await r.text() }; }
      catch (e) { if (a >= 2) return { status: 0, text: "" }; await sleep(2500); }
    }
  };
  const slugs = new Set([...(await req("/channel/1/products/1/sitemap.xml")).text.matchAll(/<loc>[^<]*\/sv\/products\/([^<]+?)\/?<\/loc>/g)].map(m => decodeURIComponent(m[1])));
  for (let pg = 1; pg < 15; pg++) {
    const h = (await req(`/sv/categories/alla-produkter?page=${pg}`)).text; const n = slugs.size;
    for (const m of h.matchAll(/href="(?:https:\/\/hazeyse\.nyehandel\.se)?\/sv\/products\/([^"?#]+)"/g)) slugs.add(decodeURIComponent(m[1]).replace(/\/$/, ""));
    if (slugs.size === n) break;
  }
  const images = new Map(); let products = 0;
  for (const slug of [...slugs].sort()) {
    const h = (await req("/sv/products/" + slug)).text;
    const id = +((h.match(/viewProduct\(.(\d+)/) || [])[1] || 0); if (!id) continue;
    const st = await req("/frontend-api/product/state", { method: "POST", body: JSON.stringify({ product_id: id, variant_ids: [null] }),
      headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": decodeURIComponent(ck["XSRF-TOKEN"] || "") } });
    let prod; try { prod = JSON.parse(st.text).product; } catch { prod = null; } if (!prod) continue;
    products++;
    for (const im of prod.images || []) { const k = keyOf(im.image_url); if (k && !images.has(k)) images.set(k, { thumb: im.thumb_url || im.image_url, product: slug }); }
    process.stdout.write(".");
  }
  return { images, products };
}

const fi = process.argv.indexOf("--file");
if (fi > 0) {
  const f = path.resolve(process.argv[fi + 1]);
  const res = await classifyUrls(["data:image/" + (/\.webp$/i.test(f) ? "webp" : "png") + ";base64," + fs.readFileSync(f).toString("base64")]);
  const r = Object.values(res)[0]; console.log(JSON.stringify({ file: f, ...r, entry: r.kind === "unverified" ? null : encode(r) }));
} else if (import.meta.url === `file://${process.argv[1]}`) {
  const { images, products } = await catalogImages();
  console.log(`\n${products} produkter, ${images.size} bilder`);
  const list = [...images.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const res = await classifyUrls(list.map(([, v]) => v.thumb));
  const entries = {}, tally = {}, failed = [];
  for (const [k, v] of list) { const r = res[v.thumb]; tally[r.kind] = (tally[r.kind] || 0) + 1; if (r.kind === "unverified") { failed.push(v.product); continue; } entries[k] = encode(r); }
  const date = new Date().toISOString().slice(0, 10);
  const body = `/* GENERERAD av theme8/tools/media-manifest.mjs ${date} -- redigera inte för hand.
   Bildtyp per produktbild (nyckel = bildfilens 8-tecken hash), mätt ur
   bildens pixlar: ${Object.entries(tally).map(([k, n]) => `${k} ${n}`).join(", ")} (${products} produkter).
   Post: "<t|w|e|v> [kantton] [tonzon topp höger botten vänster, %]".
   Bilder som saknas här (nya produkter) visas orörda tills manifestet
   genereras om. Läses av 03a-product-media.js. */
(function () {
  "use strict";
  window.HZ8.mediaManifest = { generated: "${date}", images: ${JSON.stringify(entries).replace(/","/g, '",\n    "').replace(/^\{/, "{\n    ").replace(/\}$/, "\n  }")} };
})();
`;
  fs.writeFileSync(OUT, body);
  console.log(tally, failed.length ? "ej lästa: " + failed.join(", ") : "", "->", path.relative(ROOT, OUT), Buffer.byteLength(body), "byte");
}
