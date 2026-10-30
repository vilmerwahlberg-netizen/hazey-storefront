// TASK 15: jämförelseblad (facit v4 mot efter, före mot efter, tillstånd).
// node sheets.mjs  -> sheets/*.png
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const F = n => `file://${DIR}/concepts-codex/webp/${n}`;
const A = n => { const f = `${DIR}/after/${n}.png`; return fs.existsSync(f) ? f : `${DIR}/after/${n.replace(/-full$/, "-top")}.png`; }, B = n => `${DIR}/before/${n}.png`;
const ex = f => fs.existsSync(f);
const css = `body{margin:0;padding:28px;background:#e9e3da;font:14px/1.35 -apple-system,Helvetica,Arial,sans-serif;color:#23231d}
h1{font:600 22px/1.2 Georgia,serif;margin:0 0 6px}p.sub{margin:0 0 20px;color:#5c5a52;max-width:1500px}
.row{display:flex;gap:22px;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap}
figure{margin:0;display:grid;gap:6px}figcaption{font:600 12.5px/1.3 -apple-system,Helvetica,sans-serif;max-width:480px}figcaption small{display:block;font-weight:400;color:#5c5a52}
.frame{background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.12);overflow:hidden}
.crop{overflow:hidden;direction:rtl}.crop img{direction:ltr;display:block}
.tag{display:inline-block;padding:1px 6px;border-radius:4px;background:#323d25;color:#fff;font-size:11px;margin-right:6px}.tag.f{background:#b8865a}.tag.b{background:#8a8579}`;
function fig(src, cap, opt = {}) {
  if (!src || (!src.startsWith("file://") && !ex(src))) return `<figure><div class="frame" style="width:${opt.w || 393}px;height:120px;display:grid;place-items:center;color:#999">saknas</div><figcaption>${cap}</figcaption></figure>`;
  const url = src.startsWith("file://") ? src : "file://" + src;
  const img = `<img src="${url}" style="width:${opt.imgW ? opt.imgW + "px" : (opt.w || 393) + "px"};${opt.maxH ? "" : ""}">`;
  const inner = opt.crop ? `<div class="crop" style="width:${opt.w}px;${opt.maxH ? "max-height:" + opt.maxH + "px" : ""}">${img}</div>` : `<div style="${opt.maxH ? "max-height:" + opt.maxH + "px;overflow:hidden" : ""}">${img}</div>`;
  return `<figure><div class="frame">${inner}</div><figcaption>${cap}</figcaption></figure>`;
}
const D = (n, cap, maxH) => fig(A(n), cap, { crop: true, w: 475, imgW: 1440, maxH });
const M = (n, cap, maxH) => fig(A(n), cap, { w: 393, maxH });
const sheets = {
  "01-main-v4-vs-after": { t: "Huvudvyn: v4-facit mot implementation", s: "Facit (orange tagg) bredvid riktig rendering i Theme 8-preview (grön tagg). Implementationen visar Nyehandels riktiga data: Magic Sauce 99 % 2 ml (id 91), som har en migreringsplan i paketregistret. Faraoh 2 ml (id 57) saknar plan, se rapporten. Paketen är i granskningsläge (?hz8-pkg-review=1, paketprodukt saknas, inga priser), målmätaren i ?hz8-goals-review=1 (reglerna är inte aktiva i kassan). Inget pre-roll-tillägg: alla fyra pre-rolls är slutsålda i Nyehandel.",
    rows: [[fig(F("minicart-v4-desktop.webp"), '<span class="tag f">FACIT</span>Desktop v4', { w: 480 }), D("1440-pkg3-top", '<span class="tag">EFTER</span>1440 · 3-pack valt (granskning)'), fig(F("minicart-v4-mobile.webp"), '<span class="tag f">FACIT</span>Mobil v4', { w: 400 }), M("393-pkg3-full", '<span class="tag">EFTER</span>393 · hela drawern')],
      [D("1440-multi-full", '<span class="tag">EFTER</span>1440 · flera rader, standardläge (mål dolda) + batteritillägg'), D("1440-couponApplied-top", '<span class="tag">EFTER</span>1440 · rabattkod applicerad (SIMULERAD cart_coupon)'), M("393-goalsBonusOpen-full", '<span class="tag">EFTER</span>393 · mätare i granskning, fri frakt nådd'), M("393-addonCart-full", '<span class="tag">EFTER</span>393 · batteri i korgen → cart')]] },
  "02-strain-v4-vs-after": { t: "Strainvyn: v4-facit mot implementation", s: "Barnvy i samma drawer. Slots öppnar en lista med produktens riktiga strains; slutsålda syns men går inte att välja. Spara är spärrad tills alla platser är valda. Variantbilder visas bara där Nyehandel har dem.",
    rows: [[fig(F("strain-editor-v4-desktop.webp"), '<span class="tag f">FACIT</span>Desktop v4', { w: 480 }), D("1440-strainComplete-top", '<span class="tag">EFTER</span>1440 · komplett 3-pack'), fig(F("strain-editor-v4-mobile.webp"), '<span class="tag f">FACIT</span>Mobil v4', { w: 400 }), M("393-strainComplete-top", '<span class="tag">EFTER</span>393 · komplett')],
      [fig(F("strain-editor-v4-incomplete-5pack.webp"), '<span class="tag f">FACIT</span>Ofullständigt 5-pack', { w: 390 }), M("393-strainIncomplete-top", '<span class="tag">EFTER</span>393 · ofullständigt (hela kollektionen, 3 slutsålda)'), M("393-strainSlot-full", '<span class="tag">EFTER</span>393 · plats öppen, slutsålda inaktiva'), D("1440-strainSaved-top", '<span class="tag">EFTER</span>1440 · efter Spara (granskning, varukorg oförändrad)')]] },
  "03-before-after-393": { t: "Före / efter, 393 px", s: "Före = origin/dev 648a551 (Task 15-audit). Efter = denna implementation, standardläge.",
    rows: ["multi", "variant", "sale", "empty", "stocklimit", "apierr", "loading"].map(k => [fig(B("393-" + k + "-top"), `<span class="tag b">FÖRE</span>393 · ${k}`, { w: 393 }), M("393-" + k + "-top", `<span class="tag">EFTER</span>393 · ${k}`), k === "loading" ? fig(B("393-loading-during"), '<span class="tag b">FÖRE</span>under väntan', { w: 393 }) : "", k === "loading" ? M("393-loading-during", '<span class="tag">EFTER</span>under väntan') : ""]) },
  "04-before-after-1440": { t: "Före / efter, 1440 px (drawern)", s: "",
    rows: [["multi", "variant", "sale"], ["empty", "stocklimit", "apistock"]].map(ks => ks.flatMap(k => [fig(B("1440-" + k + "-top"), `<span class="tag b">FÖRE</span>1440 · ${k}`, { crop: true, w: 475, imgW: 1440 }), D("1440-" + k + "-top", `<span class="tag">EFTER</span>1440 · ${k}`)])) },
  "05-widths": { t: "Bredder: 320, 430, 1920 och 200 % zoom", s: "200 % zoom = 720 × 450 CSS-px (DPR 2). Under 720 px höjd ligger bara kassaknappen (med total) fast.",
    rows: [["320-multi-top", "320-long-full", "430-multi-top", "430-strainIncomplete-top"].map(n => M(n, `<span class="tag">EFTER</span>${n}`)),
      [fig(B("z200-multi-top"), '<span class="tag b">FÖRE</span>200 % · multi', { w: 720 }), fig(A("z200-multi-top"), '<span class="tag">EFTER</span>200 % · multi', { w: 720 }), fig(A("z200-pkg3-top"), '<span class="tag">EFTER</span>200 % · paket', { w: 720 })],
      [fig(A("1920-multi-top"), '<span class="tag">EFTER</span>1920 · multi', { crop: true, w: 480, imgW: 1920 }), fig(A("1920-strainSlot-top"), '<span class="tag">EFTER</span>1920 · strain', { crop: true, w: 480, imgW: 1920 }), fig(A("1920-couponApplied-top"), '<span class="tag">EFTER</span>1920 · rabattkod (simulerad)', { crop: true, w: 480, imgW: 1920 })]] }
};
const all = ["empty", "simple", "variant", "multi", "long", "sale", "bonus", "goalsShip", "goalsBonusOpen", "goalsBonusDone", "addonBattery", "addonCart", "addonNone", "couponForm", "couponInvalid", "couponApplied", "plus", "remove", "removeLast", "stocklimit", "netfail", "apierr", "apistock", "loading", "pkgSingle", "pkg3", "strainComplete", "strainSlot", "strainIncomplete", "strainSaved"];
sheets["06-states-393"] = { t: "Alla tillstånd, 393 px (första vyn)", s: "", rows: [all.map(k => fig(A("393-" + k + "-top"), k, { w: 260, imgW: 260 }))] };
sheets["07-states-1440"] = { t: "Alla tillstånd, 1440 px (drawern, första vyn)", s: "", rows: [all.map(k => fig(A("1440-" + k + "-top"), k, { crop: true, w: 300, imgW: 909 }))] };
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2100, height: 1000 } });
for (const [name, sh] of Object.entries(sheets)) {
  const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><h1>${sh.t}</h1><p class="sub">${sh.s}</p>${sh.rows.map(r => `<div class="row">${r.join("")}</div>`).join("")}`;
  const f = `${DIR}/sheets/${name}.html`; fs.writeFileSync(f, html);
  await p.goto("file://" + f); await p.waitForTimeout(800);
  await p.screenshot({ path: `${DIR}/sheets/${name}.png`, fullPage: true });
  fs.unlinkSync(f); console.log(name);
}
await b.close();
