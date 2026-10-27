// TASK 01E -- flöden på Alla Vapes 393: 2 ml via arket (dual 1+1 ml med),
// aktivt antal i dockan, bakåt/framåt/omladdning, äldre URL-värden och
// cookierutan. node flows.mjs before|after
import { chromium, ctxFor, open, url, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const out = { which };
const names = p => p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 800) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); } scrollTo({ top: 0, behavior: "instant" }); return [...document.querySelectorAll(".hz8-series-results .name, .product-list .name, .name")].filter(e => e.getClientRects().length).map(e => e.textContent.trim()).filter((v, i, a) => v && a.indexOf(v) === i); });
const state = p => p.evaluate(() => { const d = document.querySelector(".hz8-mdock"); return { search: location.search, count: (document.querySelector(".hz8-pcount") || {}).textContent, badge: d ? d.querySelector(".hz8-mdock__n").textContent : null, badgeHidden: d ? d.querySelector(".hz8-mdock__n").hidden : null, pressed: [...document.querySelectorAll('#hz8-pfilter [data-pt-dim="volym"] .hz8-popt')].filter(o => o.querySelector("button").getAttribute("aria-pressed") === "true").map(o => o.getAttribute("data-value")) }; });
const dockN = async p => { await p.evaluate(() => scrollTo({ top: 1500, behavior: "instant" })); await sleep(700); const r = await p.evaluate(() => { const d = document.querySelector(".hz8-mdock"); return { on: d.classList.contains("is-shown"), n: d.querySelector(".hz8-mdock__n").hidden ? "" : d.querySelector(".hz8-mdock__n").textContent }; }); await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(400); return r; };
{
  const ctx = await ctxFor(b, 393, 852, { which }); const p = await open(ctx, ROUTES["alla-vapes"]); await ready(p, 5000);
  out.start = await state(p);
  await p.click(".hz8-ptool__mob .hz8-ptool__filter"); await sleep(800);
  await p.evaluate(() => { const b = document.querySelector('#hz8-pfilter [data-acc="volume"] .hz8-pacc__btn'); if (b.getAttribute("aria-expanded") !== "true") b.click(); }); await sleep(400);
  const opt = p.locator('#hz8-pfilter [data-pt-dim="volym"] .hz8-popt[data-value="2ml"] button');
  out.has2ml = await opt.count();
  if (out.has2ml) { await opt.click(); await sleep(2500); }
  await p.click("#hz8-pfilter .hz8-pshow"); await sleep(1500);
  out.after2ml = await state(p); out.after2ml.dock = await dockN(p);
  const n2 = await names(p); out.after2ml.names = n2; out.after2ml.dualListed = n2.filter(n => /dual/i.test(n));
  await p.goBack(); await sleep(3000); out.back = await state(p); out.back.dock = await dockN(p);
  await p.goForward(); await sleep(3000); out.forward = await state(p); out.forward.dock = await dockN(p);
  await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 5000); out.reload = await state(p); out.reload.dock = await dockN(p);
  // Äldre/otillåtna URL-värden ignoreras (inget filter aktivt).
  for (const v of ["1+1ml", "0-5ml"]) { await p.goto(url(ROUTES["alla-vapes"] + "?volym=" + encodeURIComponent(v)), { waitUntil: "domcontentloaded" }); await ready(p, 5000); out["legacy_" + v] = await state(p); out["legacy_" + v].dock = await dockN(p); }
  out.errors = p.errors; await ctx.close();
}
{
  // Cookierutan: ingen godkänd samtycke -> dockan får inte ligga på rutan.
  const ctx = await ctxFor(b, 393, 852, { which }); const p = await ctx.newPage();
  await p.goto(url(ROUTES["alla-vapes"]), { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-settling"), null, { timeout: 60000 }).catch(() => {});
  await sleep(4000);
  const c = await p.evaluate(() => { const vis = [...document.querySelectorAll("#cc-main, .cm-wrapper, .cm, [class*='cookie'], [id*='cookie'], [class*='consent']:not(html):not(body)")].filter(e => { const r = e.getBoundingClientRect(); return r.height > 20 && r.bottom > 0 && getComputedStyle(e).visibility !== "hidden"; }).map(e => { const r = e.getBoundingClientRect(); return (e.id || String(e.className)).slice(0, 30) + ":" + Math.round(r.top) + "-" + Math.round(r.bottom); }); return { htmlCls: document.documentElement.className.match(/show--consent|cc--\S+/g), banner: vis.slice(0, 4) }; });
  await p.evaluate(() => scrollTo({ top: 1500, behavior: "instant" })); await sleep(800);
  c.dockWithBanner = await p.evaluate(() => { const d = document.querySelector(".hz8-mdock"); return { shown: d.classList.contains("is-shown"), yield: d.classList.contains("is-yield"), rect: (r => [Math.round(r.top), Math.round(r.bottom)])(d.getBoundingClientRect()) }; });
  await p.screenshot({ path: `${DIR}/runs/frames/${which}-alla-vapes-393-cookie.png` });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  await sleep(900); await p.evaluate(() => scrollTo({ top: 1600, behavior: "instant" })); await sleep(800);
  c.dockAfterAccept = await p.evaluate(() => { const d = document.querySelector(".hz8-mdock"); return { shown: d.classList.contains("is-shown"), yield: d.classList.contains("is-yield") }; });
  out.cookie = c; await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/flows-${which}.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1).slice(0, 4000));
await b.close();
