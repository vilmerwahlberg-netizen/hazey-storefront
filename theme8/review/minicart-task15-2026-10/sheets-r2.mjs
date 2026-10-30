// TASK 15 runda 2 (värme, PostNord, lagerfeedback): kompakta före/efter-blad.
// Före = runda 1 (before-r2/), efter = after/. node sheets-r2.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const pick = (dir, n) => { for (const s of ["", "-full", "-top"]) { const f = `${DIR}/${dir}/${n}${s}.png`; if (fs.existsSync(f)) return f; } return null; };
const css = `body{margin:0;padding:28px;background:#e9e3da;font:13px/1.35 -apple-system,Helvetica,Arial,sans-serif;color:#23231d}h1{font:600 21px/1.2 Georgia,serif;margin:0 0 6px}p.sub{margin:0 0 18px;color:#5c5a52;max-width:1400px}
.row{display:flex;gap:18px;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap}figure{margin:0;display:grid;gap:6px}figcaption{font-weight:600}.tag{display:inline-block;padding:1px 6px;border-radius:4px;background:#323d25;color:#fff;font-size:11px;margin-right:6px}.tag.b{background:#8a8579}.tag.f{background:#b8865a}
.box{overflow:hidden;position:relative;box-shadow:0 2px 10px rgba(0,0,0,.12);background:#fff}.box img{position:absolute;display:block}`;
/* crop: visa ett utsnitt (css-px) ur en bild som ritas i bredd imgW. */
function fig(file, cap, { w, h, imgW, x = 0, y = 0, bottom = false, natH = null }) {
  if (!file) return `<figure><div class="box" style="width:${w}px;height:60px;display:grid;place-items:center;color:#999">saknas</div><figcaption>${cap}</figcaption></figure>`;
  const st = bottom ? `left:${-x}px;bottom:0;width:${imgW}px` : `left:${-x}px;top:${-y}px;width:${imgW}px`;
  return `<figure><div class="box" style="width:${w}px;height:${h}px"><img src="file://${file}" style="${st}"></div><figcaption>${cap}</figcaption></figure>`;
}
const B = (n) => pick("before-r2", n), A = (n) => pick("after", n);
const mob = (f, cap, h = 852) => fig(f, cap, { w: 393, h, imgW: 393 });
const desk = (f, cap, h = 900) => fig(f, cap, { w: 470, h, imgW: 1440, x: 970 });
const S = {
  "r2-01-glow": { t: "Värme och glöd: runda 1 mot runda 2", s: "Samma tillstånd och data. Glöd längs kanter och hörn (sand/beige + återhållsam terrakotta ur Theme 8-tokens), lugnt krämcentrum bakom text och kontroller, fin brusstruktur via inline-SVG. Den fasta kassabandet målar samma nedre glöd (ingen skarv).",
    rows: [[mob(B("393-pkg3-top"), '<span class="tag b">FÖRE</span>393 · paket (granskning)'), mob(A("393-pkg3-top"), '<span class="tag">EFTER</span>393 · paket (granskning)'), desk(B("1440-multi-top"), '<span class="tag b">FÖRE</span>1440 · flera rader'), desk(A("1440-multi-top"), '<span class="tag">EFTER</span>1440 · flera rader')],
      [mob(B("393-strainComplete-top"), '<span class="tag b">FÖRE</span>393 · strainvy'), mob(A("393-strainComplete-top"), '<span class="tag">EFTER</span>393 · strainvy'), desk(B("1440-empty-top"), '<span class="tag b">FÖRE</span>1440 · tom korg'), desk(A("1440-empty-top"), '<span class="tag">EFTER</span>1440 · tom korg')]] },
  "r2-02-trust": { t: "Trygghetsraden: PostNord-ruta ersatt av lastbil + text", s: "Ingen godkänd PostNord-bilasset finns (sökt i projektet, Task 15-referenserna, tidigare prototyp-/WooCommerce-material och hazey.se, där PostNord bara är text). Theme 8:s befintliga outline-lastbil (HZ8.icon) står bredvid texten PostNord. Swish-logotypen är oförändrad. Vid ≤ 340 px två rader, samma textstorlek.",
    rows: [["320", 320], ["393", 393]].map(([w, cw]) => [fig(B(w + "-variant-full") || B(w + "-variant-top"), `<span class="tag b">FÖRE</span>${w}`, { w: cw, h: 130, imgW: cw, bottom: true }), fig(A(w + "-variant-full") || A(w + "-variant-top"), `<span class="tag">EFTER</span>${w}`, { w: cw, h: 130, imgW: cw, bottom: true })]).flat().concat([fig(B("1440-variant-top"), '<span class="tag b">FÖRE</span>1440', { w: 470, h: 120, imgW: 1440, x: 970, bottom: true }), fig(A("1440-variant-top"), '<span class="tag">EFTER</span>1440', { w: 470, h: 120, imgW: 1440, x: 970, bottom: true })]).reduce((rows, f, i) => { (rows[Math.floor(i / 2)] = rows[Math.floor(i / 2)] || []).push(f); return rows; }, []) },
  "r2-03-stock": { t: "Lagergräns: ett meddelande i taget", s: "Äkta 406 (7 i lager, +). Före: Theme 8:s rad och Nyehandels toast samtidigt. Efter: medan toasten syns ligger Theme 8:s rad bara i tillgänglighetsträdet (toasten saknar role/aria-live); när den försvunnit syns raden. Utan toast (simulerad 422) syns raden direkt. + förblir spärrad och korgen läses om.",
    rows: [[mob(B("393-stocklimit-top"), '<span class="tag b">FÖRE</span>393 · två meddelanden'), mob(A("393-stock-with-toast"), '<span class="tag">EFTER</span>393 · med toast'), mob(A("393-stock-after-toast"), '<span class="tag">EFTER</span>393 · toast borta'), mob(A("393-stock-no-toast"), '<span class="tag">EFTER</span>393 · ingen toast')],
      [desk(B("1440-stocklimit-top"), '<span class="tag b">FÖRE</span>1440'), desk(A("1440-stock-with-toast"), '<span class="tag">EFTER</span>1440 · med toast'), desk(A("1440-stock-after-toast"), '<span class="tag">EFTER</span>1440 · toast borta')]] }
};
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2000, height: 1000 } });
for (const [name, sh] of Object.entries(S)) {
  const f = `${DIR}/sheets/${name}.html`;
  fs.writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>${css}</style><h1>${sh.t}</h1><p class="sub">${sh.s}</p>${sh.rows.map(r => `<div class="row">${r.join("")}</div>`).join("")}`);
  await p.goto("file://" + f); await p.waitForTimeout(700); await p.screenshot({ path: `${DIR}/sheets/${name}.png`, fullPage: true }); fs.unlinkSync(f); console.log(name);
}
await b.close();
