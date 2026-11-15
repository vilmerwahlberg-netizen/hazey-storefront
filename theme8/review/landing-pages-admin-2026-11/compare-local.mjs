// Lokal fixtur-test (granskningsbilder i repot) | riktig Content-sida i preview.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname); const R = path.resolve(DIR, "..");
const pick = (...c) => c.map(f => path.join(R, f)).find(f => fs.existsSync(f));
const uri = f => `data:image/${f.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(f).toString("base64");
const LOCAL = {
  thcx: t => pick(`thcx-landing-2026-11/shots/thcx-${t}-fold.png`, `thcx-landing-2026-11/shots/thcx-${t}-fold.webp`),
  engangsvape: t => pick(`engangsvape-landing-2026-11/shots/eng-${t}-fold.webp`, `engangsvape-landing-2026-11/shots/eng-${t}-fold.png`),
  thca: t => pick(`thca-knowledge-2026-11/shots/thca-${t}-fold.webp`, `thca-knowledge-2026-11/shots/thca-${t}-fold.png`)
};
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage();
for (const slug of Object.keys(LOCAL)) for (const t of ["393", "1440"]) {
  const loc = LOCAL[slug](t); const live = path.join(DIR, process.env.LIVE_DIR || "shots", `${slug}-${t}-fold.png`);
  if (!loc || !fs.existsSync(live)) { console.log("saknas", slug, t, loc); continue; }
  const W = t === "393" ? 1000 : 2000; await p.setViewportSize({ width: W, height: 800 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">/sv/page/${slug} – första skärmen ${t}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start"><figure style="margin:0"><figcaption style="font-weight:400;margin:0 0 8px">Lokalt test (fixtur)</figcaption><img style="width:100%" src="${uri(loc)}"></figure><figure style="margin:0"><figcaption style="font-weight:400;margin:0 0 8px">Riktig sida i Theme 8-preview (2026-11-15)</figcaption><img style="width:100%" src="${uri(live)}"></figure></div></body>`);
  await p.waitForTimeout(300); await p.screenshot({ path: path.join(DIR, "shots", `${process.env.LIVE_DIR ? "jamfor-rattad" : "jamfor-lokal"}-${slug}-${t}.png`), fullPage: true });
}
await b.close();
