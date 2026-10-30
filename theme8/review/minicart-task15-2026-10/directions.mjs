// Två riktningar för hela minicarten, renderade från runs/realdata.json.
// Statiska mockups (inte produktionskod). node directions.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const D = JSON.parse(fs.readFileSync(`${DIR}/runs/realdata.json`, "utf8"));
const kr = s => parseFloat(String(s).replace(/[\s ]/g, "").replace("kr", "").replace(",", "."));
const fmt = v => { const r = Math.round(v * 100) / 100; return r.toLocaleString("sv-SE", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " kr"; };
const clean = s => s.replace(/&amp;/g, "&").replace(/ - /g, " – ");
const items = D.cart.items.map(i => {
  const t = D.tiers[i.id].tiers; const next = t.filter(x => x.min > i.qty)[0]; const cur = t.filter(x => x.min <= i.qty).pop();
  let up = null;
  if (next) { const nowTot = kr(i.total), newTot = next.min * kr(next.unit); up = { min: next.min, unit: next.unit, extra: newTot - nowTot, save: next.min * (kr(cur.unit) - kr(next.unit)) }; }
  const variant = i.opt.map(o => o[1]).join(" · ");
  return { ...i, name: clean(i.name), variant, up, tiers: t };
});
/* A: högst ett tips per korg -- raden med minst steg till nästa nivå, sedan störst besparing. */
const hintId = (items.filter(i => i.up).sort((a, b) => (a.up.min - a.qty) - (b.up.min - b.qty) || b.up.save - a.up.save)[0] || {}).id;
const total = kr(D.cart.total), saved = items.reduce((s, i) => s + (i.cmp ? kr(i.cmp) - kr(i.total) : 0), 0);
const TOK = `:root{--ink:#23231d;--olive:#323d25;--neutral:#ede9e8;--beige:#e4d1bf;--cta:#d2691e;--red:#f03322;
--surface:color-mix(in srgb,var(--neutral) 38%,#fff);--sand:color-mix(in srgb,var(--beige) 26%,var(--surface));
--muted:color-mix(in srgb,var(--ink) 74%,var(--neutral));--line:color-mix(in srgb,var(--ink) 13%,var(--neutral));--line-s:color-mix(in srgb,var(--ink) 28%,var(--neutral));
--cta-fill:color-mix(in srgb,var(--cta) 82%,var(--ink));--sale:color-mix(in srgb,var(--red) 72%,var(--ink));
--disp:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--ui:"Helvetica Neue",Arial,-apple-system,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--ui);color:var(--ink);background:#d9d2c8}
button{font:inherit;color:inherit;border:0;background:none;cursor:pointer}`;

/* ---------------- Riktning A: Öppen kvittolista ---------------- */
function rowA(i) {
  return `<article class="row">
  <div class="media"><img src="${i.img}" alt=""></div>
  <div class="info"><a class="name">${i.name}</a>${i.variant ? `<p class="var">${i.opt[0][0] === "strain" ? "Strain" : i.opt[0][0]} · ${i.variant}</p>` : ""}<p class="unit">${i.price} / st</p></div>
  <div class="sum">${i.cmp ? `<del>${i.cmp}</del>` : ""}<b class="${i.cmp ? "is-sale" : ""}">${i.total}</b></div>
  <div class="ctrl"><div class="step"><button aria-label="Minska">−</button><span>${i.qty}</span><button aria-label="Öka">+</button></div><button class="rm">Ta bort</button></div>
  ${i.up && i.id === hintId ? `<p class="tier"><span>Ta ${i.up.min} st: ${i.up.unit}/st${i.up.save >= .5 ? ` · du sparar ${fmt(i.up.save)}` : ""}</span><button>Ändra till ${i.up.min} st</button></p>` : ""}
</article>`;
}
function A(mobile) {
  return `<style>${TOK}
.drawer{position:absolute;right:0;top:0;bottom:0;width:${mobile ? "100%" : "440px"};background:var(--sand);display:flex;flex-direction:column;box-shadow:0 24px 60px -24px rgba(35,35,29,.45);border-radius:${mobile ? 0 : "18px 0 0 18px"}}
.hd{display:flex;align-items:baseline;gap:10px;padding:${mobile ? "18px 16px 10px" : "24px 28px 12px"}}
.hd h2{font:600 ${mobile ? 24 : 26}px/1 var(--disp);color:var(--olive)}.hd small{font:600 13px/1 var(--ui);color:var(--muted)}
.x{margin-left:auto;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:20px;color:var(--olive);align-self:center}
.list{flex:1;overflow:hidden;padding:${mobile ? "0 16px" : "0 28px"}}
.row{display:grid;grid-template-columns:${mobile ? 64 : 72}px 1fr auto;gap:4px 14px;padding:16px 0;border-top:1px solid var(--line)}
.row:first-child{border-top:0}
.media{grid-row:span 2;width:${mobile ? 64 : 72}px;height:${mobile ? 64 : 72}px;border-radius:10px;background:color-mix(in srgb,var(--beige) 55%,var(--surface));overflow:hidden}
.media img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
.name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 15.5px/1.25 var(--disp);color:var(--ink)}
.var{margin-top:3px;font:500 12.5px/1.3 var(--ui);color:var(--muted)}.unit{margin-top:2px;font:500 12px/1.3 var(--ui);color:var(--muted)}
.sum{text-align:right;white-space:nowrap}.sum b{display:block;font:700 15px/1.2 var(--ui)}.sum del{display:block;font:500 12px/1.2 var(--ui);color:var(--muted)}.sum .is-sale{color:var(--sale)}
.ctrl{grid-column:2/4;display:flex;align-items:center;justify-content:space-between;margin-top:8px}
.step{display:inline-grid;grid-template-columns:44px 36px 44px;height:40px;border:1.5px solid var(--line-s);border-radius:10px;background:var(--surface);align-items:center;text-align:center;font:700 15px/1 var(--ui)}
.step button{height:100%;font-size:19px;color:var(--olive)}
.rm{font:600 13px/1 var(--ui);color:var(--muted);text-decoration:underline;text-underline-offset:3px;min-height:44px}
.tier{grid-column:2/4;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;padding:8px 0 0;border-top:1px dashed var(--line);font:500 12.5px/1.3 var(--ui);color:var(--ink)}
.tier button{flex:none;min-height:36px;padding:0 12px;border-radius:9px;border:1.5px solid var(--olive);color:var(--olive);font:700 12.5px/1 var(--ui)}
.xs{margin:6px ${mobile ? 16 : 28}px 14px;padding-top:12px;border-top:1px solid var(--line)}
.xs h3{font:700 11.5px/1 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.xs ul{display:grid;gap:0;list-style:none}
.xs li{display:grid;grid-template-columns:48px 1fr auto;grid-template-rows:auto auto;gap:2px 12px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font:600 12.5px/1.25 var(--ui)}.xs li:first-child{border-top:0}
.xs li .m{grid-row:span 2;width:48px;height:48px;border-radius:9px;background:color-mix(in srgb,var(--beige) 55%,var(--surface));overflow:hidden}.xs li img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
.xs li span{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.xs li b{grid-column:2;font-size:12.5px}
.xs li button{grid-column:3;grid-row:1/3;min-height:40px;padding:0 12px;border:1.5px solid var(--line-s);border-radius:9px;font:700 12px/1 var(--ui);color:var(--olive)}
.ft{padding:${mobile ? "14px 16px 18px" : "18px 28px 24px"};background:var(--surface);border-top:1px solid var(--line);box-shadow:0 -14px 30px -22px rgba(35,35,29,.35)}
.ln{display:flex;justify-content:space-between;font:500 13px/1.5 var(--ui);color:var(--muted)}
.tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:6px}.tot span{font:700 16px/1 var(--ui)}.tot b{font:700 24px/1 var(--ui)}
.tot em{font-style:normal;font:700 12.5px/1 var(--ui);color:var(--olive);margin-left:8px;padding:4px 8px;border-radius:99px;background:color-mix(in srgb,var(--olive) 9%,var(--surface))}
.vat{text-align:right;font:500 12px/1.4 var(--ui);color:var(--muted)}
.go{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:54px;margin-top:12px;border-radius:12px;background:var(--cta-fill);color:#fff;font:700 16px/1 var(--ui);box-shadow:0 10px 22px -14px var(--cta-fill)}
.meta{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font:500 12px/1.3 var(--ui);color:var(--muted)}
.meta a{color:var(--ink);font-weight:600;text-decoration:underline;text-underline-offset:3px;min-height:44px;display:inline-flex;align-items:center}
.body{flex:1;min-height:0;overflow:hidden}.list{overflow:visible!important}.tall .drawer{position:relative;height:auto}.tall .body{overflow:visible}
</style>
<aside class="drawer"><div class="hd"><h2>Varukorg</h2><small>${D.cart.count} varor</small><button class="x" aria-label="Stäng">✕</button></div>
<div class="body"><div class="list">${items.map(rowA).join("")}</div>
<section class="xs"><h3>Passar till din order</h3><ul>${D.xsell.map(x => `<li><div class="m"><img src="${x.img}" alt=""></div><span>${clean(x.name)}</span><b>${x.price}</b><button>${x.variants ? "Välj" : "Lägg till"}</button></li>`).join("")}</ul></section></div>
<footer class="ft"><div class="ln"><span>Frakt</span><span>Beräknas i kassan</span></div>
<div class="tot"><span>Totalt${saved >= .5 ? `<em>Du sparar ${fmt(saved)}</em>` : ""}</span><b>${D.cart.total}</b></div><p class="vat">inkl. moms ${D.cart.vat}</p>
<button class="go">Till kassan <span aria-hidden="true">→</span></button>
<div class="meta"><span>Skickas från Sverige · Diskret förpackning</span><a>Fortsätt handla</a></div></footer></aside>`;
}

/* ---------------- Riktning B: Paketstation ---------------- */
function rowB(i) {
  const segs = i.tiers.map(t => { const on = t.min === i.qty; const tot = t.min * kr(t.unit); return `<button class="seg${on ? " on" : ""}"><b>${t.min} st</b><span>${fmt(tot)}</span><small>${t.unit}/st</small></button>`; }).join("");
  const custom = !i.tiers.some(t => t.min === i.qty);
  return `<article class="card">
  <div class="top"><div class="media"><img src="${i.img}" alt=""></div>
  <div class="info"><a class="name">${i.name}</a>${i.variant ? `<p class="var">${i.variant}</p>` : ""}
  <p class="price">${i.cmp ? `<del>${i.cmp}</del> ` : ""}<b class="${i.cmp ? "is-sale" : ""}">${i.total}</b>${i.cmp ? ` <span class="tag">Rea</span>` : ""}</p></div>
  <button class="rm" aria-label="Ta bort">✕</button></div>
  <div class="pk"><div class="segs">${segs}</div>${custom ? `<p class="custom">Ditt antal: <b>${i.qty} st</b> · <button>Ändra</button></p>` : `<p class="custom">Annat antal? <button>Ändra</button></p>`}</div>
</article>`;
}
function B(mobile) {
  return `<style>${TOK}
.drawer{position:absolute;right:0;top:0;bottom:0;width:${mobile ? "100%" : "500px"};background:color-mix(in srgb,var(--beige) 34%,var(--neutral));display:flex;flex-direction:column;box-shadow:0 24px 60px -24px rgba(35,35,29,.45);border-radius:${mobile ? 0 : "20px 0 0 20px"};overflow:hidden}
.hd{display:flex;align-items:center;gap:10px;padding:${mobile ? "16px 16px 12px" : "22px 24px 14px"}}
.hd h2{font:600 ${mobile ? 24 : 28}px/1 var(--disp);color:var(--olive)}.hd small{font:600 13px/1 var(--ui);color:var(--muted);padding:5px 9px;border-radius:99px;background:var(--surface)}
.x{margin-left:auto;width:44px;height:44px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-size:18px;color:var(--olive)}
.list{flex:1;overflow:hidden;padding:${mobile ? "0 12px" : "0 20px"};display:grid;gap:10px;align-content:start}
.card{background:var(--surface);border-radius:18px;padding:12px;box-shadow:0 1px 0 color-mix(in srgb,var(--ink) 6%,transparent)}
.top{display:grid;grid-template-columns:${mobile ? 64 : 76}px 1fr 36px;gap:12px}
.media{width:${mobile ? 64 : 76}px;height:${mobile ? 64 : 76}px;border-radius:12px;background:color-mix(in srgb,var(--beige) 50%,var(--surface));overflow:hidden}.media img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
.name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 15.5px/1.25 var(--disp)}
.var{margin-top:3px;font:600 12px/1.3 var(--ui);color:var(--olive)}
.price{margin-top:5px;font:700 15px/1 var(--ui)}.price del{font-weight:500;font-size:12.5px;color:var(--muted)}.is-sale{color:var(--sale)}.tag{font:700 10.5px/1 var(--ui);color:#fff;background:var(--sale);padding:3px 6px;border-radius:5px;vertical-align:2px}
.rm{width:36px;height:36px;border-radius:50%;color:var(--muted);font-size:14px;background:color-mix(in srgb,var(--olive) 6%,var(--surface))}
.pk{margin-top:10px}.segs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.seg{display:grid;gap:2px;padding:8px 4px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);text-align:center}
.seg b{font:700 12.5px/1.1 var(--ui)}.seg span{font:700 13px/1.1 var(--ui)}.seg small{font:500 10.5px/1.1 var(--ui);color:var(--muted)}
.seg.on{border-color:var(--cta-fill);box-shadow:inset 0 0 0 1px var(--cta-fill);background:color-mix(in srgb,var(--cta) 6%,var(--surface))}
.custom{margin-top:6px;font:500 12px/1.3 var(--ui);color:var(--muted)}.custom button{font:600 12px/1 var(--ui);color:var(--olive);text-decoration:underline;min-height:32px}
.xs{padding:${mobile ? "14px 12px 10px" : "16px 20px 12px"}}
.xs h3{font:600 18px/1 var(--disp);color:var(--olive);margin-bottom:10px}
.xs ul{display:flex;gap:8px;list-style:none;overflow:hidden}.xs li{flex:0 0 ${mobile ? "62%" : "46%"};display:grid;grid-template-columns:52px 1fr;gap:4px 10px;align-items:center;padding:8px;border-radius:14px;background:var(--surface);font:600 12px/1.25 var(--ui)}
.xs li .m{grid-row:span 2;width:52px;height:52px;border-radius:10px;background:color-mix(in srgb,var(--beige) 50%,var(--surface));overflow:hidden}.xs li img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
.xs li span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ft{padding:${mobile ? "16px 16px 18px" : "20px 24px 24px"};background:var(--olive);color:#fff;border-radius:22px 22px 0 0}
.ln{display:flex;justify-content:space-between;font:500 13px/1.6 var(--ui);color:rgba(255,255,255,.76)}
.tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:4px}.tot span{font:600 20px/1 var(--disp)}.tot b{font:700 26px/1 var(--ui)}
.sv{text-align:right;margin-top:4px;font:700 12.5px/1 var(--ui);color:var(--beige)}
.go{display:flex;align-items:center;justify-content:space-between;width:100%;height:56px;margin-top:14px;padding:0 20px;border-radius:14px;background:var(--cta-fill);color:#fff;font:700 16px/1 var(--ui)}
.meta{display:flex;justify-content:center;gap:16px;margin-top:10px;font:500 12px/1.3 var(--ui);color:rgba(255,255,255,.76)}.meta a{color:#fff;text-decoration:underline;font-weight:600}
.body{flex:1;min-height:0;overflow:hidden}.list{overflow:visible!important}.tall .drawer{position:relative;height:auto}.tall .body{overflow:visible}.tall .xs ul{flex-wrap:wrap}
</style>
<aside class="drawer"><div class="hd"><h2>Din varukorg</h2><small>${D.cart.count} varor</small><button class="x">✕</button></div>
<div class="body"><div class="list">${items.map(rowB).join("")}</div>
<section class="xs"><h3>Passar bra med</h3><ul>${D.xsell.map(x => `<li><div class="m"><img src="${x.img}" alt=""></div><span>${clean(x.name)}</span><b>${x.price}</b></li>`).join("")}</ul></section></div>
<footer class="ft"><div class="ln"><span>Frakt</span><span>Beräknas i kassan</span></div><div class="ln"><span>Varav moms</span><span>${D.cart.vat}</span></div>
<div class="tot"><span>Totalt</span><b>${D.cart.total}</b></div>${saved >= .5 ? `<p class="sv">Du sparar ${fmt(saved)}</p>` : ""}
<button class="go"><span>Till kassan</span><span>${D.cart.total} →</span></button>
<div class="meta"><span>Skickas från Sverige · Diskret förpackning</span><a>Fortsätt handla</a></div></footer></aside>`;
}
const bgs = { 1440: fs.readFileSync(`${DIR}/runs/backdrop-1440.png`).toString("base64"), 1920: fs.readFileSync(`${DIR}/runs/backdrop-1920.png`).toString("base64") };
const page = (inner, w, h, desktop, tall) => `<!doctype html><html><head><meta charset="utf-8"></head><body class="${tall ? "tall" : ""}" style="width:${w}px;${tall ? "" : `height:${h}px;`}position:relative;overflow:hidden">${desktop ? `<img src="data:image/png;base64,${bgs[w]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:left top;filter:none"><div style="position:absolute;inset:0;background:rgba(35,35,29,.46)"></div>` : ""}${inner}</body></html>`;
const b = await chromium.launch();
const shots = [["A", A], ["B", B]];
for (const [k, fn] of shots) for (const [w, h, m, dsf] of [[393, 852, true, 2], [393, 0, true, 2], [320, 640, true, 2], [430, 932, true, 2], [1440, 900, false, 1], [1920, 1080, false, 1]]) {
  const tall = !h; const pg = await b.newPage({ viewport: { width: w, height: h || 852 }, deviceScaleFactor: dsf });
  const html = page(fn(m), w, h, !m, tall); fs.writeFileSync(`${DIR}/directions/${k}-${w}x${tall ? "full" : h}.html`, html.replace(/data:image\/png;base64,[^"]+/, "../runs/backdrop-" + w + ".png"));
  await pg.setContent(html, { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${DIR}/directions/${k}-${w}x${tall ? "full" : h}.png`, fullPage: tall }); await pg.close();
}
await b.close(); console.log("ok", items.map(i => i.name + " up=" + (i.up && fmt(i.up.extra))).join(" | "), "saved", saved);
