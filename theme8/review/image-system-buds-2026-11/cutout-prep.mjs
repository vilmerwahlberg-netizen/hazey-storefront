// TASK 17C — frilagt original -> storefront-WebP med alfa + manifestpost, bara för en GODKÄND matchning
// ur runs/cutout-match.json (cutout-match.mjs). PNG:n är master och lämnas orörd.
// WebP: längsta sida högst 1200 px (CDN:ens största PDP-storlek), kvalitet 90, alfa förlustfri.
// Manifestposten mäts ur WebP:n med samma analys som bildmanifestet (theme8/tools/media-manifest.mjs).
// Kör: node cutout-prep.mjs <png> [<png>...]  ->  cutouts/<slug>-<imageId>.webp + cutouts/cutouts.json
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process"; import crypto from "node:crypto";
import { classifyUrls, encode, keyOf } from "../../tools/media-manifest.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "../catalog-reconciliation-2026-11/runs/nh.json"), "utf8")).products;
const MATCH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/cutout-match.json"), "utf8"));
const OUT = path.join(DIR, "cutouts"); fs.mkdirSync(OUT, { recursive: true });
const JSONF = path.join(OUT, "cutouts.json");
const reg = fs.existsSync(JSONF) ? JSON.parse(fs.readFileSync(JSONF, "utf8")) : {};
for (const f of process.argv.slice(2).map(x => path.resolve(x))) {
  let m = MATCH.find(x => path.resolve(x.file) === f && x.verdict === "godkänd kandidat");
  // Beskuren variant (cutout-trim.mjs): ärver originalets godkända matchning om beviset visar att bara
  // helt transparenta pixlar togs bort och att varje kvarvarande pixel är byte-identisk. (En ny matchning
  // av den beskurna filen samplas om på ett annat rutnät och ger då ett något annat mätfel.)
  const proofF = f.replace(/\.png$/i, ".json"), proof = /-trim\.png$/i.test(f) && fs.existsSync(proofF) ? JSON.parse(fs.readFileSync(proofF, "utf8")) : null;
  if (!m && proof && proof.cutPixelsWithAlpha === 0 && proof.changedValues === 0) {
    const orig = MATCH.find(x => path.basename(x.file) === proof.source && x.verdict === "godkänd kandidat");
    if (orig) m = { ...orig, file: path.relative(process.cwd(), f), inheritedFrom: proof.source, trim: proof };
  }
  if (!m || m.verdict !== "godkänd kandidat") { console.log(path.basename(f), "hoppas över:", m ? m.verdict : "inte matchad"); continue; }
  const prod = NH.find(n => n.slug === m.best.slug), im = prod.state.images.find(i => i.id === m.best.imageId);
  // Samma foto uppladdat flera gånger på produkten (byte-identiska filer på CDN:en) ersätts alla.
  const md5 = async u => crypto.createHash("md5").update(Buffer.from(await (await fetch(u)).arrayBuffer())).digest("hex");
  const ref = await md5(im.url), twins = [];
  for (const o of prod.state.images) if (o.id === im.id || await md5(o.url) === ref) twins.push(o);
  const webp = path.join(OUT, `${m.best.slug}-${m.best.imageId}.webp`);
  const dims = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", f]).toString().match(/\d+/g).slice(-2).map(Number);
  const resize = Math.max(...dims) > 1200 ? (dims[0] >= dims[1] ? ["-resize", "1200", "0"] : ["-resize", "0", "1200"]) : [];
  execFileSync("cwebp", ["-quiet", "-q", "90", "-alpha_q", "100", "-m", "6", ...resize, f, "-o", webp]);
  const res = Object.values(await classifyUrls(["data:image/webp;base64," + fs.readFileSync(webp).toString("base64")]))[0];
  if (res.kind !== "transparent") { console.log(path.basename(f), "WebP:n klassas", res.kind, "-- inte transparent, används inte"); fs.rmSync(webp); continue; }
  for (const t of twins) reg[keyOf(t.url)] = { slug: m.best.slug, name: m.best.name, nhId: m.best.nhId, imageId: t.id, matchedImageId: m.best.imageId, identicalTo: twins.length > 1 ? "byte-identisk med bild " + im.id : null, cdn: t.url, master: path.relative(DIR, f), webp: path.relative(DIR, webp),
    webpKB: Math.round(fs.statSync(webp).size / 1024), masterKB: Math.round(fs.statSync(f).size / 1024), entry: encode(res), match: { err: m.best.err, ratio: m.ratio, coverage: m.coverage, inheritedFrom: m.inheritedFrom || null }, trim: m.trim || null };
  console.log(path.basename(f), "->", path.relative(DIR, webp), Math.round(fs.statSync(webp).size / 1024), "kB", encode(res), "ersätter bilderna", twins.map(t => t.id + " " + keyOf(t.url)).join(", "), m.best.slug);
}
fs.writeFileSync(JSONF, JSON.stringify(reg, null, 1));
