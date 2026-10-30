// TASK 11 -- jämförelseblad i proof/: före | efter (fullsida 393/1440),
// referens | efter (references/final/), tillstånd. node sheet.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SH = `${DIR}/runs/shots`, REF = path.resolve(DIR, "../storefront-task-system/needs-prep/task-11-bastsaljare/references/final"), OUT = `${DIR}/proof`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 72 }); await p.close(); fs.unlinkSync(tmp);
}
await sheet("01-before-after-1440-full", "Bästsäljare 1440 · före (a9081ee, native adminsida) | efter", [["FÖRE", `${SH}/before-page-1440-full.jpg`], ["EFTER", `${SH}/after-page-1440-full.jpg`]], 1900);
await sheet("02-before-after-393-full", "Bästsäljare 393 · före (a9081ee) | efter", [["FÖRE", `${SH}/before-page-393-full.jpg`], ["EFTER", `${SH}/after-page-393-full.jpg`]], 1100);
await sheet("03-ref-after-1440-first", "1440 första vy · referens | efter", [["REFERENS", `${REF}/desktop-1440-first-view.jpg`], ["EFTER", `${SH}/after-page-1440-first.jpg`]], 1900);
await sheet("04-ref-after-1440-full", "1440 helsida · referens | efter (nedre moduler efter guiden enligt kontraktet)", [["REFERENS", `${REF}/desktop-1440-full.jpg`], ["EFTER", `${SH}/after-page-1440-full.jpg`]], 1900);
await sheet("05-ref-after-1920", "1920 · referens | efter (första vy + helsida)", [["REF första vy", `${REF}/desktop-1920-first-view.jpg`], ["EFTER första vy", `${SH}/after-page-1920-first.jpg`], ["REF helsida", `${REF}/desktop-1920-full.jpg`], ["EFTER helsida", `${SH}/after-page-1920-full.jpg`]], 2400);
await sheet("06-ref-after-393", "393 · referens | efter (första vy + helsida)", [["REF första vy", `${REF}/mobile-393-first-view.jpg`], ["EFTER första vy", `${SH}/after-page-393-first.jpg`], ["REF helsida", `${REF}/mobile-393-full.jpg`], ["EFTER helsida", `${SH}/after-page-393-full.jpg`]], 1900);
await sheet("07-ref-after-1440-expanded", "1440 expanderad (24 kort, Visa färre) · referens | efter", [["REFERENS", `${REF}/desktop-1440-expanded.jpg`], ["EFTER", `${SH}/after-ref-expanded-1440.jpg`]], 1900);
await sheet("08-ref-after-1440-carts", "1440 Carts (7 kort, ingen knapp) · referens | efter", [["REFERENS", `${REF}/desktop-1440-filter-carts.jpg`], ["EFTER", `${SH}/after-ref-filter-carts-1440.jpg`]], 1900);
await sheet("09-ref-after-393-hasch-empty", "393 Hasch + tomt format · referens | efter", [["REF Hasch", `${REF}/mobile-393-filter-hasch.jpg`], ["EFTER Hasch", `${SH}/after-ref-filter-hasch-393.jpg`], ["REF tomt format", `${REF}/mobile-393-empty-format.jpg`], ["EFTER tomt format", `${SH}/after-ref-empty-format-393.jpg`]], 1900);
await sheet("10-widths", "Övriga bredder · 320 | 430 | 200 % (720 CSS-px) · efter, första vy", [["320", `${SH}/after-page-320-first.jpg`], ["430", `${SH}/after-page-430-first.jpg`], ["200 %", `${SH}/after-page-200-first.jpg`]], 1900);
await sheet("11-states-1440", "Tillstånd 1440 · tomt | fel | 3 kort | skeleton", [["Tomt (0)", `${SH}/after-state-empty-1440.jpg`], ["Fel", `${SH}/after-state-error-1440.jpg`], ["3 kort", `${SH}/after-state-short3-1440.jpg`], ["Skeleton", `${SH}/after-state-skeleton-1440.jpg`]], 2400);
await sheet("12-states-393", "Tillstånd 393 · tomt format | fel | 6 kort | skeleton", [["Tomt format", `${SH}/after-state-empty-format-393.jpg`], ["Fel", `${SH}/after-state-error-393.jpg`], ["6 kort (7 källkort, 1 utan varumärke)", `${SH}/after-state-short7-393.jpg`], ["Skeleton", `${SH}/after-state-skeleton-393.jpg`]], 1900);
await sheet("13-interaction-1440", "Interaktion 1440 · expanderad | Visa färre -> listrubrik | guide Hasch | Lägg till -> varukorg", [["Expanderad", `${SH}/after-int-expanded-1440.jpg`], ["Visa färre", `${SH}/after-int-less-1440.jpg`], ["Guide -> Hasch", `${SH}/after-int-guide-hasch-1440.jpg`], ["Lägg till", `${SH}/after-int-buy-1440.jpg`]], 2400);
await sheet("14-interaction-393", "Interaktion 393 · expanderad | Visa färre | guide Hasch | Lägg till | TrustBox blockerad", [["Expanderad", `${SH}/after-int-expanded-393.jpg`], ["Visa färre", `${SH}/after-int-less-393.jpg`], ["Guide -> Hasch", `${SH}/after-int-guide-hasch-393.jpg`], ["Lägg till", `${SH}/after-int-buy-393.jpg`], ["TrustBox-fallback", `${SH}/after-int-trust-fallback-393.jpg`]], 2400);
await b.close(); console.log(fs.readdirSync(OUT).length, "blad");
