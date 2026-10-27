// TASK 04C-B -- granskningsark per familj.
//  full: referens (helsida) | efter (helsida), desktop 1440 och mobil 393.
//  top:  före | efter, första vyn, 393 och 1440.
//  resp: efter 320/393/430/200 % (första vyn).
// node sheet.mjs <family> <refPrefix> <ut-katalog>
import { chromium } from "playwright"; import fs from "node:fs"; import { DIR, ROOT } from "./lib.mjs";
const [fam, ref, outDir] = process.argv.slice(2);
const S = `${DIR}/runs/shots`, R = `${ROOT}/theme8/review/storefront-task-system/needs-prep/task-04c-category-template-rollout/series-hub-rollout/references/full-page`;
fs.mkdirSync(outDir, { recursive: true });
const src = f => `data:${f.endsWith(".png") ? "image/png" : "image/jpeg"};base64,${fs.readFileSync(f).toString("base64")}`;
const img = (f, w, cap) => `<figure style="margin:0"><figcaption style="font:600 14px Arial;color:#ddd;margin-bottom:4px">${cap}</figcaption>${fs.existsSync(f) ? `<img src="${src(f)}" style="display:block;width:${w}px">` : `<div style="color:#f66">saknas ${f.split("/").pop()}</div>`}</figure>`;
const page = async (html, out, width) => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width, height: 600 } }); await p.setContent(`<body style="margin:0;padding:14px;background:#1d1d1b">${html}</body>`); await p.waitForTimeout(500); await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 72 }); await b.close(); console.log(out); };
const row = items => `<div style="display:flex;gap:16px;align-items:flex-start">${items.join("")}</div>`;
await page(row([img(`${R}/${ref}-desktop-full.png`, 620, "Referens desktop"), img(`${S}/after-${fam}-1440-full.jpg`, 620, "Efter 1440 (livedata)"), img(`${R}/${ref}-mobile-full.png`, 300, "Referens mobil"), img(`${S}/after-${fam}-393-full.jpg`, 300, "Efter 393 (livedata)")]), `${outDir}/reference-vs-after-full.jpg`, 1920);
await page(row([img(`${S}/before-${fam}-1440-top.png`, 720, "Före 1440 (äldre generisk hubb)"), img(`${S}/after-${fam}-1440-top.png`, 720, "Efter 1440"), img(`${S}/before-${fam}-393-top.png`, 200, "Före 393"), img(`${S}/after-${fam}-393-top.png`, 200, "Efter 393")]), `${outDir}/before-after-first-view.jpg`, 1920);
await page(row([img(`${S}/after-${fam}-320-top.png`, 320, "Efter 320"), img(`${S}/after-${fam}-393-top.png`, 393, "Efter 393"), img(`${S}/after-${fam}-430-top.png`, 430, "Efter 430"), img(`${S}/after-${fam}-1440-z200-top.png`, 720, "Efter 200 % zoom (720 CSS-px)"), img(`${S}/after-${fam}-1920-top.png`, 760, "Efter 1920")]), `${outDir}/responsive-after.jpg`, 2740);
