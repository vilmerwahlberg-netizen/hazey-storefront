// Sammanfattning av probe-<which>-<ws>.json: en rad per produkt/bredd.
import fs from "node:fs"; const [f] = process.argv.slice(2);
for (const r of JSON.parse(fs.readFileSync(f))) { const t = r.top, s = r.scrolled;
  const vars = r.state && r.state.variants ? r.state.variants.map(v => (v.buyable ? "B" : "-") + (v.stock > 0 ? "S" : "0")).join("") : "?";
  console.log(String(r.id).padEnd(3), String(r.w).padEnd(5), "vars", vars.padEnd(17), "out", String(t.htmlOut).padEnd(5), "stock", (t.stock && t.stock.text || "").padEnd(18), "native", (t.native ? (t.native.visible ? "VISIBLE" : "present") : "none").padEnd(8), "buybar", s.buybar ? (s.buybar.inViewport ? "SHOWN" : "hidden") : "none", "activeVisible", [...t.activeBuyCtas, ...s.activeBuyCtas].filter(x => x.visible).map(x => x.cls).join(",") || "-", "err", r.errors.length, "ox", t.overflowX, "h1", t.h1s); }
