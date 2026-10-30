// TASK 11 korrigering 2 -- blad i proof/correction-2/: före (runda 1) | efter. node sheet-r2.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SH = `${DIR}/runs/shots`, OUT = `${DIR}/proof/correction-2`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 72 }); await p.close(); fs.unlinkSync(tmp);
}
await sheet("01-full-1440", "Helsida 1440 · före (runda 1) | efter", [["FÖRE", `${SH}/r1-page-1440-full.jpg`], ["EFTER", `${SH}/after-page-1440-full.jpg`]], 1900);
await sheet("02-full-393", "Helsida 393 · före (runda 1) | efter", [["FÖRE", `${SH}/r1-page-393-full.jpg`], ["EFTER", `${SH}/after-page-393-full.jpg`]], 1100);
await sheet("03-expanded-1440", "Expanderad 1440 (?visa=24, helsida) · före: bara Visa färre | efter: Visa fler + sekundär Visa färre", [["FÖRE", `${SH}/r1-ref-expanded-1440.jpg`], ["EFTER", `${SH}/after-ref-expanded-1440.jpg`]], 1900);
await sheet("04-sequence-1440", "1440 · 36 visade (efter två klick) | Visa färre -> 12 + fokus på listrubriken | Buds 53 av 53 (Visa fler borta)", [["36", `${SH}/after-r2-seq36-1440.jpg`], ["Visa färre", `${SH}/after-r2-seq-less-1440.jpg`], ["Buds, allt visat", `${SH}/after-r2-buds-all-1440.jpg`]], 2400);
await sheet("05-sequence-393", "393 · före: expanderad (runda 1) | efter: 36 visade | Visa färre -> 12 | Buds 53 av 53", [["FÖRE expanderad", `${SH}/r1-int-expanded-393.jpg`], ["36", `${SH}/after-r2-seq36-393.jpg`], ["Visa färre", `${SH}/after-r2-seq-less-393.jpg`], ["Buds, allt visat", `${SH}/after-r2-buds-all-393.jpg`]], 2000);
await sheet("06-guide-active", "Vald formatruta (Hasch) · före: 2 px grön kontur | efter: 1 px inre olivlinje", [["FÖRE 1440", `${SH}/r1-int-guide-hasch-1440.jpg`], ["EFTER 1440", `${SH}/after-int-guide-hasch-1440.jpg`], ["FÖRE 393 (Hasch)", `${SH}/r1-ref-filter-hasch-393.jpg`], ["EFTER 393 (Hasch)", `${SH}/after-ref-filter-hasch-393.jpg`]], 2400);
await sheet("07-first-view-h1", "Första vy (native H1 flyttad in i heron) · före | efter, 1440 + 393", [["FÖRE 1440", `${SH}/r1-page-1440-first.jpg`], ["EFTER 1440", `${SH}/after-page-1440-first.jpg`], ["FÖRE 393", `${SH}/r1-page-393-first.jpg`], ["EFTER 393", `${SH}/after-page-393-first.jpg`]], 2400);
await sheet("08-fail-open", "Fail-open (Theme 8-JS avbruten / syntaxfel): nativesidan med sin H1 och adminblock", [["JS avbruten 1440", `${SH}/after-r2-failopen-abort-1440.jpg`], ["Syntaxfel 1440", `${SH}/after-r2-failopen-syntax-1440.jpg`], ["JS avbruten 393", `${SH}/after-r2-failopen-abort-393.jpg`]], 2000);
await sheet("09-controls-closeup", "Utökningsrad · 12 (bara Visa fler) | 24 av 103 (Visa fler + sekundär Visa färre) | Hasch 15 av 15 (Visa fler borta) · 1440 och 393", [["12 · 1440", `${SH}/after-r2-ctl-12-1440.png`], ["24 · 1440", `${SH}/after-r2-ctl-24-1440.png`], ["allt · 1440", `${SH}/after-r2-ctl-all-1440.png`], ["12 · 393", `${SH}/after-r2-ctl-12-393.png`], ["24 · 393", `${SH}/after-r2-ctl-24-393.png`], ["allt · 393", `${SH}/after-r2-ctl-all-393.png`]], 2400);
await sheet("10-guide-active-closeup", "Vald formatruta (Hasch) närbild · efter, 1440 | 393", [["1440", `${SH}/after-r2-guide-hasch-1440.png`], ["393", `${SH}/after-r2-guide-hasch-393.png`]], 2000);
await b.close(); console.log(fs.readdirSync(OUT).length, "blad");
