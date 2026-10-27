// TASK 01D-R3: kopia ur mobile-plaster-reference-2026-10.
// TASK 01G: kopia av TASK 01E:s verify.mjs (mobil filtersanning och bottendocka), återkörd efter familjeskalet.
// node verify.mjs before|after <route,..> <width,..> [zoom] [tag]
// width 720z = 200 % zoom (1440-fönster, 720 px CSS, DPR 2).
import { chromium, ctxFor, open, url, ready, DIR, ROUTES, acceptCookies } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", rs = "alla-vapes", ws = "393", tag = ""] = process.argv.slice(2);
const OUT = `${DIR}/runs/frames`; fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const rows = [];
const STATE = () => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== "hidden" && +c.opacity > .5 && r.bottom > 0 && r.top < innerHeight; };
  const tool = document.querySelector(".hz8-ptool"), d = document.querySelector(".hz8-mdock"), area = document.querySelector(".designer-category");
  const tr = tool.getBoundingClientRect();
  // Raden räknas som synlig när någon del av dess knappar ligger i vyn.
  const rowBtn = [...tool.querySelectorAll(".hz8-ptool__mob .hz8-ptool__btn, .hz8-ptool__mob")].find(e => e.getBoundingClientRect().height > 0);
  const rb = rowBtn ? rowBtn.getBoundingClientRect() : tr;
  const dockOn = !!d && d.classList.contains("is-shown") && !d.classList.contains("is-yield") && vis(d);
  const dr = d && d.getBoundingClientRect();
  return { y: Math.round(scrollY), rowVisible: rb.bottom > 0 && rb.top < innerHeight && rb.height > 0, dockOn, dockRect: dr && [Math.round(dr.left), Math.round(dr.top), Math.round(dr.width), Math.round(dr.height)],
    areaBottom: area ? Math.round(area.getBoundingClientRect().bottom) : null, vh: innerHeight, n: d ? (d.querySelector(".hz8-mdock__n") || {}).textContent : null,
    toolPos: getComputedStyle(tool).position, stuck: tool.classList.contains("is-stuck") };
};
for (const route of rs.split(",")) for (const wsx of ws.split(",")) {
  const zoom = wsx.endsWith("z"); const w = parseInt(wsx);
  const ctx = await ctxFor(b, w, zoom ? 450 : 852, { which, zoom: zoom ? 2 : 0 });
  const p = await open(ctx, ROUTES[route]); await ready(p, 5000);
  await p.evaluate(() => { window.__to = y => window.scrollTo({ top: y, left: 0, behavior: "instant" }); });
  const st = () => p.evaluate(STATE);
  const row = { which, route, w, zoom, errors: p.errors };
  const tagf = `${which}-${route}-${w}${zoom ? "z" : ""}`;
  const shot = async name => { if (w === 393 && !zoom) await p.screenshot({ path: `${OUT}/${tagf}-${name}.png` }); };
  // 1. Optionssanning i filterarket (öppnat som besökaren gör).
  await shot("01-row");
  row.atTop = await st();
  await p.click(".hz8-ptool__mob .hz8-ptool__filter"); await sleep(900);
  row.truth = await p.evaluate(async () => {
    const sh = document.querySelector("#hz8-pfilter");
    const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
    const expand = async k => { const b = sh.querySelector(`[data-acc="${k}"] .hz8-pacc__btn`); if (b && b.getAttribute("aria-expanded") !== "true" && shown(b)) b.click(); await new Promise(r => setTimeout(r, 400)); };
    const focusInSheet = sh.contains(document.activeElement);
    await expand("series");
    const series = [...sh.querySelectorAll('[data-pt-series] .hz8-popt')].filter(shown).map(o => o.getAttribute("data-hz8-series") + " " + (o.querySelector(".hz8-popt__count") || {}).textContent);
    const search = shown(sh.querySelector('[data-acc="series"] .hz8-psearch'));
    const otherFormats = [...sh.querySelectorAll(".hz8-pother")].filter(shown).map(a => a.querySelector(".hz8-pother__name").textContent);
    await expand("volume");
    const r = {
      sheetOpen: !sh.hidden,
      search, otherFormats, series,
      volumeSection: shown(sh.querySelector('[data-acc="volume"]')),
      volumes: [...sh.querySelectorAll('[data-pt-dim="volym"] .hz8-popt')].filter(shown).map(o => (o.querySelector(".hz8-rail__label") || {}).textContent + " " + (o.querySelector(".hz8-popt__count") || {}).textContent),
      focusInSheet
    };
    return r;
  });
  await shot("02-filter-sheet");
  await p.keyboard.press("Escape"); await sleep(500);
  row.truth.focusBackOnRow = await p.evaluate(() => !!document.activeElement && document.activeElement.closest(".hz8-ptool") !== null);
  // 2. Scrollskanning: rad och docka aldrig samtidigt; docka bara inom produktområdet.
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const samples = [];
  for (let y = 0; y <= H; y += 140) { await p.evaluate(y => __to(y), y); await sleep(380); samples.push(await st()); }
  row.scan = { n: samples.length, both: samples.filter(s => s.rowVisible && s.dockOn).length, dockOnAt: samples.filter(s => s.dockOn).length,
    dockBeyondArea: samples.filter(s => s.dockOn && s.areaBottom != null && s.areaBottom < s.vh).length, stuck: samples.filter(s => s.stuck).length, toolPos: samples[0].toolPos,
    firstDockY: (samples.find(s => s.dockOn) || {}).y, lastDockY: ([...samples].reverse().find(s => s.dockOn) || {}).y };
  // Precis efter dockans entré och nära sidans slut (bilder).
  if (row.scan.firstDockY != null) { await p.evaluate(y => __to(y), row.scan.firstDockY); await sleep(500); await shot("03-dock-entry"); row.dockRect = (await st()).dockRect; }
  if (row.scan.lastDockY != null) { await p.evaluate(y => __to(y + 280), row.scan.lastDockY); await sleep(600); await shot("07-page-end"); row.pageEnd = await st(); }
  // 3. Snabb upp/ned-scroll: per ram, aldrig båda.
  row.fast = await p.evaluate(async (STATE_SRC) => {
    const STATE = new Function("return (" + STATE_SRC + ")()");
    const H = document.documentElement.scrollHeight - innerHeight; let both = 0, frames = 0;
    for (const target of [Math.min(H, 3200), 0, Math.min(H, 1600), 200, Math.min(H, 2600), 0]) {
      const from = scrollY; const t0 = performance.now();
      // Varje ram: läs först (föregående rams scroll + dockans uppdatering), scrolla sedan.
      await new Promise(res => { const step = () => { const s = STATE(); frames++; if (s.rowVisible && s.dockOn) both++; const k = Math.min(1, (performance.now() - t0) / 260); __to(from + (target - from) * k); k < 1 ? requestAnimationFrame(step) : setTimeout(res, 320); }; requestAnimationFrame(step); });
      const s = STATE(); frames++; if (s.rowVisible && s.dockOn) both++;
    }
    return { frames, both };
  }, STATE.toString());
  // 4. Dockans knappar öppnar rätt ark; fokus fångat och återställt.
  if (row.scan.firstDockY != null) {
    for (const k of ["filter", "sort"]) {
      await p.evaluate(y => __to(y + 200), row.scan.firstDockY); await sleep(600);
      const before = await st();
      if (!before.dockOn) { row["open_" + k] = { error: "dock not shown" }; continue; }
      await p.click(`.hz8-mdock [data-md="${k}"]`); await sleep(800);
      const o = await p.evaluate(k => { const fsh = document.querySelector("#hz8-pfilter"), ss = document.querySelector("#hz8-psortsheet"); const sortSec = fsh.querySelector('[data-acc="sort"] .hz8-pacc__btn'); return { filterOpen: !fsh.hidden, sortOpen: ss ? !ss.hidden : false, sortSectionOpen: sortSec ? sortSec.getAttribute("aria-expanded") === "true" : null, focusInDialog: !!document.activeElement.closest(".hz8-psheet"), dockYield: document.querySelector(".hz8-mdock").classList.contains("is-yield") }; }, k);
      if (w === 393 && !zoom) await shot(k === "filter" ? "05-dock-filter-sheet" : "06-dock-sort-sheet");
      // Tab runt i dialogen stannar i dialogen
      for (let i = 0; i < 25; i++) await p.keyboard.press("Tab");
      o.focusStillInDialog = await p.evaluate(() => !!document.activeElement.closest(".hz8-psheet"));
      await p.keyboard.press("Escape"); await sleep(700);
      o.afterClose = await p.evaluate(() => ({ focusOnDock: !!document.activeElement.closest(".hz8-mdock"), focused: document.activeElement.textContent.trim().slice(0, 20), dockOn: document.querySelector(".hz8-mdock").classList.contains("is-shown") && !document.querySelector(".hz8-mdock").classList.contains("is-yield") }));
      row["open_" + k] = o;
    }
  }
  row.overflowX = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  rows.push(row); console.log(JSON.stringify(row).slice(0, 1500));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/verify-${which}-${rs.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}${tag ? "-" + tag : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
