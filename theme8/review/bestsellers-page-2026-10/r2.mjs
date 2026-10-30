// TASK 11 korrigering 2 -- fokuserad verifiering (efter), 393 + 1440:
//   seq       Alla: 12 -> 24 -> 36 -> Visa färre -> 12 (fokus, ?visa=, ingen historikpost, inget scrollhopp)
//   buds      filter > 24 (Buds): Visa fler tills allt visas -> knappen hidden, Visa färre kvar
//   carts     filter <= 12: inga expansionskontroller
//   history   reload med ?visa=36; Alla 24 -> Buds (push) 24 -> bakåt/framåt
//   h1        exakt 1 H1 i DOM = Nyehandels h1.nh-bs-hero__title i heron; fail-open (JS avbruten / syntaxfel)
//   keyboard  Tab: Visa fler -> Visa färre; Enter/Space; fokusring; reduced motion = omedelbar scroll
// node r2.mjs [step]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const only = process.argv[2]; const R = {};
const ROUTE = "/sv/page/vara-bastsaljare";
const b = await chromium.launch();
const shot = (p, n, full) => p.screenshot({ path: `${DIR}/runs/shots/after-r2-${n}.jpg`, type: "jpeg", quality: 74, fullPage: !!full });
const ST = () => {
  const head = document.getElementById("hz8-bs-list"), a = document.activeElement, more = document.querySelector(".hz8-bs-more");
  const btn = document.querySelector(".hz8-bs-more__btn"), less = document.querySelector(".hz8-bs-more__less");
  const reserve = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hz8-header-reserve")) || 0;
  return {
    url: location.search.replace(/[?&]preview=[^&]+/, "").replace(/^&/, "?"), hist: history.length, y: Math.round(scrollY),
    cells: document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length,
    tab: (document.querySelector('.hz8-pfam__tab[aria-pressed="true"]') || {}).textContent || null,
    control: more.hidden ? null : { text: more.querySelector(".hz8-bs-more__text").textContent, more: btn.hidden ? null : btn.textContent.trim(), moreExp: btn.getAttribute("aria-expanded"), moreVisible: btn.getClientRects().length > 0, less: less.hidden ? null : less.textContent.trim(), lessVisible: less.getClientRects().length > 0 },
    focus: a === head ? "list-heading" : a.closest("[data-hz8-path]") ? "cell#" + [...document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]")].indexOf(a.closest("[data-hz8-path]")) : a === document.body ? "BODY" : a.tagName.toLowerCase() + "." + String(a.className).split(" ")[0],
    fv: a.matches(":focus-visible"), headTop: Math.round(head.getBoundingClientRect().top), reserve,
    h1: [...document.querySelectorAll("h1")].map(h => h.className + "|" + h.textContent.trim() + "|" + (h.closest("article.hz8-bs-desc") ? "hero" : h.closest(".store-page") ? "admin" : "other"))
  };
};
const loaded = p => p.waitForFunction(() => { const g = document.getElementById("hz8-bs-grid"); const t = (document.querySelector(".hz8-bs-more__text") || {}).textContent || ""; return g && !g.getAttribute("aria-busy") && document.querySelectorAll(".hz8-bs-fmt").length > 0 && (/av \d+/.test(t) || document.querySelector(".hz8-bs-more").hidden); }, null, { timeout: 40000 }).catch(() => {});
async function page(w, opts = {}) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after", jsFail: opts.jsFail });
  const p = await open(ctx, ROUTE + (opts.q || "")); if (opts.reduced) await p.emulateMedia({ reducedMotion: "reduce" });
  await ready(p, 2500); if (!opts.jsFail) await loaded(p); await p.waitForTimeout(1200);
  await p.evaluate(() => { window.__same = 1; });
  p.same = () => p.evaluate(() => window.__same === 1).catch(() => false);
  return { p, ctx };
}
const clickMore = async p => { const l = p.locator(".hz8-bs-more__btn"); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(250); const y = await p.evaluate(() => scrollY); await l.click(); await p.waitForTimeout(800); return y; };
const clickLess = async p => { const l = p.locator(".hz8-bs-more__less"); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(250); await l.click(); await p.waitForTimeout(1400); };
for (const w of [393, 1440]) {
  if (!only || only === "seq") {
    const { p, ctx } = await page(w); const r = { steps: [] };
    r.steps.push(await p.evaluate(ST));
    for (let i = 0; i < 2; i++) { const y = await clickMore(p); const s = await p.evaluate(ST); s.yBefore = Math.round(y); r.steps.push(s); if (i === 1) await shot(p, `seq36-${w}`); }
    await clickLess(p); r.steps.push(await p.evaluate(ST)); await shot(p, `seq-less-${w}`);
    r.same = await p.same(); r.errors = p.errors;
    const [s0, s1, s2, s3] = r.steps;
    r.ok = s0.cells === 12 && s0.control.more && !s0.control.less && s0.control.moreExp === "false"
      && s1.cells === 24 && /visa=24/.test(s1.url) && s1.hist === s0.hist && Math.abs(s1.y - s1.yBefore) <= 2 && s1.focus === "cell#12" && s1.control.more === "Visa fler bästsäljare" && s1.control.less === "Visa färre" && s1.control.moreExp === "true" && s1.control.text === "Visar 24 av 103"
      && s2.cells === 36 && /visa=36/.test(s2.url) && s2.hist === s0.hist && Math.abs(s2.y - s2.yBefore) <= 2 && s2.focus === "cell#24" && s2.control.text === "Visar 36 av 103"
      && s3.cells === 12 && !/visa=/.test(s3.url) && s3.hist === s0.hist && s3.focus === "list-heading" && s3.headTop >= s3.reserve && s3.headTop <= s3.reserve + 40 && !s3.control.less && s3.control.more && r.same;
    R[`seq-${w}`] = r; console.log("seq", w, r.ok, JSON.stringify(r.steps.map(s => [s.cells, s.url, s.hist, s.y, s.yBefore, s.focus, s.control && s.control.text, s.control && s.control.more, s.control && s.control.less, s.headTop, s.reserve]))); await ctx.close();
  }
  if (!only || only === "buds") {
    const { p, ctx } = await page(w, { q: "?typ=buds" }); const r = { steps: [await p.evaluate(ST)] };
    for (let i = 0; i < 6; i++) { if (!(await p.locator(".hz8-bs-more__btn").isVisible())) break; await clickMore(p); r.steps.push(await p.evaluate(ST)); }
    await shot(p, `buds-all-${w}`);
    const last = r.steps[r.steps.length - 1]; const total = +last.control.text.match(/av (\d+)/)[1];
    r.total = total; r.counts = r.steps.map(s => s.cells); r.errors = p.errors; r.same = await p.same();
    r.ok = total > 24 && last.cells === total && last.control.more === null && !last.control.moreVisible && last.control.less === "Visa färre" && last.focus !== "BODY" && last.focus !== "button.hz8-bs-more__btn" && r.counts.every((c, i) => c === Math.min(12 * (i + 1), total)) && r.same;
    R[`buds-${w}`] = r; console.log("buds", w, r.ok, JSON.stringify({ counts: r.counts, total, last: [last.focus, last.control] })); await ctx.close();
  }
  if (!only || only === "carts") {
    const { p, ctx } = await page(w, { q: "?typ=carts" }); const r = await p.evaluate(ST); r.errors = p.errors;
    r.ok = r.cells > 0 && r.cells <= 12 && r.control === null;
    R[`carts-${w}`] = r; console.log("carts", w, r.ok, r.cells, JSON.stringify(r.control)); await ctx.close();
  }
  if (!only || only === "history") {
    const { p, ctx } = await page(w, { q: "?visa=36" }); const r = {};
    r.reload36 = await p.evaluate(ST);
    await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 1500); await loaded(p); await p.waitForTimeout(1200); r.reloadAgain = await p.evaluate(ST);
    await p.locator(".hz8-bs-more__less").scrollIntoViewIfNeeded(); await p.locator(".hz8-bs-more__less").click(); await p.waitForTimeout(900);
    await p.evaluate(() => { window.__same = 1; });
    await clickMore(p); r.alla24 = await p.evaluate(ST);
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await p.locator('.hz8-pfam__tab[data-fam="buds"]').click(); await p.waitForTimeout(800); r.buds12 = await p.evaluate(ST);
    await clickMore(p); r.buds24 = await p.evaluate(ST);
    await p.goBack(); await p.waitForTimeout(1200); r.back = await p.evaluate(ST);
    await p.goForward(); await p.waitForTimeout(1200); r.fwd = await p.evaluate(ST);
    r.same = await p.same(); r.errors = p.errors;
    r.ok = r.reload36.cells === 36 && r.reload36.control.more && r.reload36.control.less && r.reloadAgain.cells === 36 && /visa=36/.test(r.reloadAgain.url)
      && r.alla24.cells === 24 && r.buds12.cells === 12 && r.buds12.tab === "Buds" && r.buds12.hist === r.alla24.hist + 1 && r.buds24.cells === 24 && r.buds24.hist === r.buds12.hist
      && r.back.tab === "Alla" && r.back.cells === 24 && /visa=24/.test(r.back.url) && r.fwd.tab === "Buds" && r.fwd.cells === 24 && /typ=buds/.test(r.fwd.url) && /visa=24/.test(r.fwd.url) && r.same;
    R[`history-${w}`] = r; console.log("history", w, r.ok, JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => !/ok|same|errors/.test(k)).map(([k, v]) => [k, [v.tab, v.cells, v.url, v.hist]])))); await ctx.close();
  }
  if (!only || only === "h1") {
    const { p, ctx } = await page(w); const r = { on: await p.evaluate(ST) };
    r.on.h1Style = await p.evaluate(() => { const c = getComputedStyle(document.querySelector("h1")); return [c.fontFamily.split(",")[0], c.fontSize, c.fontWeight, c.lineHeight, c.letterSpacing, c.color].join(" "); });
    r.adminIntact = await p.evaluate(() => ({ hero: !!document.querySelector(".nh-bs-hero"), heroInner: (document.querySelector(".nh-bs-hero__inner") || {}).childElementCount, filters: document.querySelectorAll(".nh-bs-filters [data-cat]").length, source: document.querySelectorAll("[data-nh-source]").length }));
    await ctx.close();
    for (const jsFail of ["abort", "syntax"]) {
      const o = await page(w, { jsFail });
      r[`fail-${jsFail}`] = await o.p.evaluate(() => { const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden" && parseFloat(getComputedStyle(document.body).opacity) > 0; return { h1: [...document.querySelectorAll("h1")].map(h => h.className + "|" + h.textContent.trim() + "|" + vis(h)), adminHero: vis(document.querySelector(".nh-bs-hero")), adminFilters: vis(document.querySelector(".nh-bs-filters")), products: [...document.querySelectorAll(".store-page .product-card")].filter(vis).length, bsPage: document.documentElement.classList.contains("hz8-bs-page") }; });
      await o.p.screenshot({ path: `${DIR}/runs/shots/after-r2-failopen-${jsFail}-${w}.jpg`, type: "jpeg", quality: 70 });
      await o.ctx.close();
    }
    r.ok = r.on.h1.length === 1 && /^nh-bs-hero__title title\|Bästsäljare\|hero$/.test(r.on.h1[0]) && r.adminIntact.hero && r.adminIntact.filters > 0 && r.adminIntact.source > 0
      && ["abort", "syntax"].every(k => r[`fail-${k}`].h1.length === 1 && /nh-bs-hero__title\|Bästsäljare\|true/.test(r[`fail-${k}`].h1[0]) && r[`fail-${k}`].adminHero && r[`fail-${k}`].adminFilters && !r[`fail-${k}`].bsPage); // produktkort: nativesidan renderar inga själv, varken före (a9081ee) eller efter -- se failopen.mjs
    R[`h1-${w}`] = r; console.log("h1", w, r.ok, JSON.stringify({ on: r.on.h1, style: r.on.h1Style, admin: r.adminIntact, abort: r["fail-abort"], syntax: r["fail-syntax"] }));
  }
  if (!only || only === "reduced") {
    const { p, ctx } = await page(w, { reduced: true, q: "?visa=36" }); const r = {};
    await p.locator(".hz8-bs-more__less").scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await p.locator(".hz8-bs-more__less").click(); await p.waitForTimeout(40); r.y40 = await p.evaluate(() => Math.round(scrollY));
    await p.waitForTimeout(1200); r.after = await p.evaluate(ST); r.errors = p.errors;
    r.ok = Math.abs(r.y40 - r.after.y) <= 2 && r.after.focus === "list-heading" && r.after.headTop >= r.after.reserve && r.after.headTop <= r.after.reserve + 40;
    R[`reduced-${w}`] = r; console.log("reduced", w, r.ok, r.y40, r.after.y, r.after.focus, r.after.headTop, r.after.reserve); await ctx.close();
  }
}
if (!only || only === "keyboard") {
  const { p, ctx } = await page(1440); const r = {};
  await p.focus(".hz8-bs-more__btn"); await p.keyboard.press("Enter"); await p.waitForTimeout(800); r.enterMore = await p.evaluate(ST);
  await p.focus(".hz8-bs-more__btn"); r.tabOrder = [];
  for (let i = 0; i < 2; i++) { await p.keyboard.press("Tab"); r.tabOrder.push(await p.evaluate(() => { const a = document.activeElement, c = getComputedStyle(a); return a.className.split(" ")[0] + "|" + a.textContent.trim().slice(0, 24) + "|fv=" + a.matches(":focus-visible") + "|ring=" + (c.outlineStyle !== "none"); })); }
  await p.focus(".hz8-bs-more__less"); await p.keyboard.press("Space"); await p.waitForTimeout(1400); r.spaceLess = await p.evaluate(ST);
  r.errors = p.errors;
  r.ok = r.enterMore.cells === 24 && r.enterMore.focus === "cell#12" && r.enterMore.fv && /^hz8-bs-more__less\|Visa färre\|fv=true\|ring=true$/.test(r.tabOrder[0]) && r.spaceLess.cells === 12 && r.spaceLess.focus === "list-heading";
  R.keyboard = r; console.log("keyboard", r.ok, JSON.stringify({ enter: [r.enterMore.cells, r.enterMore.focus, r.enterMore.fv], tab: r.tabOrder, space: [r.spaceLess.cells, r.spaceLess.focus] })); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/r2-after${only ? "-" + only : ""}.json`, JSON.stringify(R, null, 1));
await b.close();
