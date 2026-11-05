// TASK 17C — PERF.md ur runs/perf-{base,runtime,after}.json + runs/perf-{runtime,after}-paint.json.
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const rd = f => { const p = path.join(DIR, "runs", f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")).rows : []; };
// Kall/varm: den rena, varvade körningen (r3: sida för sida, base -> runtime -> after, inget annat jobb igång).
// Fast 3G: samma rena, varvade upplägg (r3g). Tidigare kall/varm-körningar (perf-<v>.json, -paint.json) gick delvis parallellt med
// andra jobb och visade upp till 10x brus i TBT -- de ligger kvar i runs/ men används inte här.
const r3 = (v, t = "r3") => fs.readdirSync(path.join(DIR, "runs")).filter(f => f.startsWith(`perf-${v}-${t}-`)).flatMap(f => rd(f));
const g3 = v => { const c = r3(v, "r3g"); return c.length ? c : rd(`perf-${v}.json`).filter(r => r.mode === "fast3g"); };
const V = Object.fromEntries(["base", "runtime", "after"].map(v => [v, [...r3(v), ...g3(v)]]));
const PAINT = { runtime: r3("runtime"), after: r3("after") };
const NAME = { base: "före bildsystemet (f0ac3be)", runtime: "runtime-klassning (6f31f3e)", after: "statiskt manifest (17C)" };
const KEYS = ["home", "bestsellers", "buds", "pdp-yoda"], W = [393, 1440];
const PAGE = { home: "Startsida", bestsellers: "Bästsäljare", buds: "Alla Buds", "pdp-yoda": "PDP Yoda" };
const get = (v, k, w, m) => V[v].find(r => r.key === k && r.w === w && r.mode === m);
const sum = (v, m, f) => KEYS.flatMap(k => W.map(w => get(v, k, w, m))).filter(Boolean).reduce((a, r) => a + f(r), 0);
const med = a => { const s = a.filter(x => x > 0).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
let md = `# Bildsystemets kostnad — före/efter (TASK 17C, ${new Date().toISOString().slice(0, 10)})\n\n`;
md += `Mätt med \`perf.mjs\` mot Theme 8-previewen: 4 sidor × 393/1440 × kall, varm och Fast 3G (1,6 Mbit/s, 562 ms RTT, 4× CPU). Loadern och bundlen byts lokalt via CDP Fetch (HTTP-cachen förblir på, så varm laddning är verklig). Kall och varm laddning: en ren, varvad körning (sida för sida: före → runtime → manifest, inget annat jobb igång). Fast 3G: likadant varvat, en körning per bygge och cell. räknarna (anrop, klassificeringar, omskanningar, stilbyten) är deterministiska, medan tiderna (TBT, script, LCP) brusar ±30–50 % mellan körningar och bara bör läsas som storleksordning.\n\n`;
md += `## Sammanfattning, kall laddning (summa 8 sidvyer)\n\n| | ${Object.values(NAME).join(" | ")} |\n|---|---:|---:|---:|\n`;
const rowS = (label, m, f) => `| ${label} | ${Object.keys(V).map(v => sum(v, m, f)).join(" | ")} |\n`;
md += rowS("CDN-bildanrop", "cold", r => r.imgRequests);
md += rowS("varav CORS-sonder (extra hämtning för pixelläsning)", "cold", r => r.corsProbes);
md += rowS("dubbla nätverkshämtningar (samma URL)", "cold", r => r.dupNetwork);
md += rowS("klassificeringar (canvas getImageData)", "cold", r => r.classify);
md += rowS("dokumentvida omskanningar under laddning", "cold", r => r.scans);
md += rowS("omskanningar av 10 klick per sida", "cold", r => r.clicks.scans);
md += `| bilder målade obehandlade och sedan omstylade | – (inget bildsystem) | ${["runtime", "after"].map(v => PAINT[v].filter(r => r.mode === "cold").reduce((a, r) => a + r.seenUntreated, 0)).join(" | ")} |\n`;
md += rowS("long tasks", "cold", r => r.longtasks);
md += rowS("TBT ms", "cold", r => r.tbt);
md += `| CLS (max) | ${Object.keys(V).map(v => Math.max(...V[v].map(r => r.cls)).toFixed(3)).join(" | ")} |\n`;
md += `\nPDP, 3 miniatyrklick: omskanningar ${Object.keys(V).map(v => KEYS.includes("pdp-yoda") ? W.map(w => (get(v, "pdp-yoda", w, "cold") || {}).pdp?.scans ?? "–").join("/") : "").join(" · ")} (före/runtime/manifest, 393/1440), klassificeringar ${Object.keys(V).map(v => W.map(w => (get(v, "pdp-yoda", w, "cold") || {}).pdp?.classify ?? "–").join("/")).join(" · ")}. Scenen följer aktiv bild: ${W.map(w => (get("after", "pdp-yoda", w, "cold") || {}).pdp?.follows).join("/")} (manifest).\n\n`;
for (const m of ["cold", "warm", "fast3g"]) {
  md += `## ${{ cold: "Kall laddning", warm: "Varm laddning (samma flik, HTTP-cache + sessionStorage)", fast3g: "Fast 3G + 4× CPU (kall)" }[m]}\n\n| Sida | Bredd | Bildanrop (nät) b/r/m | CORS-sonder r/m | Klass. r/m | Skan r/m | Long tasks b/r/m | TBT ms b/r/m | LCP ms b/r/m | CLS b/r/m |\n|---|---:|---|---|---|---|---|---|---|---|\n`;
  for (const k of KEYS) for (const w of W) {
    const [b, r, a] = ["base", "runtime", "after"].map(v => get(v, k, w, m) || {});
    const f = (fn, ...xs) => xs.map(x => (x.key ? fn(x) : "–")).join(" / ");
    md += `| ${PAGE[k]} | ${w} | ${f(x => `${x.imgRequests} (${x.imgNetwork})`, b, r, a)} | ${f(x => x.corsProbes, r, a)} | ${f(x => x.classify, r, a)} | ${f(x => x.scans, r, a)} | ${f(x => x.longtasks, b, r, a)} | ${f(x => x.tbt, b, r, a)} | ${f(x => x.lcp || "ej mätt", b, r, a)} | ${f(x => x.cls.toFixed(3), b, r, a)} |\n`;
  }
  md += "\n";
}
md += `## Bildsystemets egen CPU-tid (manifest)\n\nUppmätt i sidan (instrumenterad MutationObserver-callback + rAF-flush i 03a-product-media.js, kall laddning + rullning): **0,3–1,8 ms** observer och **0,3–1,7 ms** flush per sida (Bästsäljare, Alla Buds, startsida, PDP vid 393/1440). En forcerad omsynk av alla bildytor (11–25 st) tar 1–15 ms inklusive stilomräkning. TBT-skillnaderna mellan byggena ovan (några hundra ms över 8 sidvyer) är alltså inte bildsystemet utan brus från den levande sajten (Trustpilot, GTM, Nyehandels egen Vue-rendering).\n\n`;
// Alla Buds efter hämtningsfixen (seriesMemberRoutes: hubb + egen formatroute), två varvade Fast 3G-körningar.
const r4 = v => [1, 2].flatMap(i => rd(`perf-${v}-r4g${i}-buds.json`));
if (r4("after").length) {
  md += `## Alla Buds: seriehärledningens hämtningar (fynd i Fast 3G-mätningen)\n\nMed 4× CPU hade båda 17B-byggena 3,7–5,2 s TBT på Alla Buds mot 1,3–2,3 s före (tabellen ovan, mätt före fixen). Orsaken var inte bildsystemet (0 klassningar i manifestbygget), utan att 17B:s seriehärledning hämtade och tolkade seriernas hubb **och alla** deras serie×format-routes, alltså också vapes, carts och hasch: 29 kategorisidor. 17C hämtar bara hubben och sidans egen formatroute, vilket ger 20 sidor (före-bygget hämtade 16 men härledde serierna ur headerlänkar och missade Core). Mängderna är oförändrade: buds-filter PASS vid 1440/393, och Allt Hasch och Alla Vapes är identiska med 17B.\n\n| Fast 3G + 4× CPU, Alla Buds | TBT ms (körning 1 / 2) | Long tasks |\n|---|---|---|\n`;
  for (const v of ["base", "runtime", "after"]) for (const w of W) { const rs = r4(v).filter(r => r.w === w); md += `| ${NAME[v]} ${w} | ${rs.map(r => r.tbt).join(" / ")} | ${rs.map(r => r.longtasks).join(" / ")} |\n`; }
  md += `\nBruset är stort (före-bygget 2,1–6,3 s), men manifestbygget med fixen ligger nu inom före-byggets intervall, och runtime-bygget ligger över det.\n\n`;
}
md += `LCP "ej mätt": Chromium rapporterade ingen LCP-post före mätpunkten på kategorisidorna vid kall laddning (likadant i alla tre byggen). Varm laddning ger värden där.\n`;
fs.writeFileSync(path.join(DIR, "PERF.md"), md); console.log(md.split("\n").slice(0, 18).join("\n"));
