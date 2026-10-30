// TASK 11 -- interaktionsbevis på /sv/page/vara-bastsaljare (efter), 393 + 1440:
//   expand    Visa fler -> +12, fokus på första nya kortet, aria-expanded,
//             ?visa=24 via replaceState (ingen historikpost), inget scrollhopp,
//             ingen navigering; Visa färre -> 12, fokus på listrubriken
//   filter    flik Carts (pushState ?typ=carts), I lager (filters=...),
//             back/forward/reload återställer, expansion + reload (?visa=24)
//   guide     formatruta -> filter + scroll till listrubriken under headern,
//             ingen navigering; reduced motion -> omedelbar scroll
//   buy       Lägg till -> Vuex/cart-API, Välj -> PDP-href
//   trust     TrustBox-iframe; blockerad widget -> fallbacklänk
//   keyboard  1440: tabbordning genom flikar, växel, kort, knapp, guide, details
// node interact.mjs [step]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const only = process.argv[2]; const R = {};
const ROUTE = "/sv/page/vara-bastsaljare";
const b = await chromium.launch();
const shot = (p, n) => p.screenshot({ path: `${DIR}/runs/shots/after-int-${n}.jpg`, type: "jpeg", quality: 74 });
const ST = () => {
  const head = document.getElementById("hz8-bs-list"), hdr = document.getElementById("store-header");
  const a = document.activeElement;
  return {
    url: location.pathname + location.search.replace(/[?&]preview=[^&]+/, "").replace(/^&/, "?"), hist: history.length, y: Math.round(scrollY),
    cells: document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length, busy: document.getElementById("hz8-bs-grid").getAttribute("aria-busy"),
    tab: (document.querySelector('.hz8-pfam__tab[aria-pressed="true"]') || {}).textContent || null,
    stock: (document.querySelector('[data-bs="stock"]') || {}).getAttribute?.("aria-checked"),
    more: document.querySelector(".hz8-bs-more").hidden ? null : { text: document.querySelector(".hz8-bs-more__text").textContent, btn: document.querySelector(".hz8-bs-more__btn").hidden ? null : document.querySelector(".hz8-bs-more__btn").textContent.trim(), exp: document.querySelector(".hz8-bs-more__btn").getAttribute("aria-expanded"), less: document.querySelector(".hz8-bs-more__less").hidden ? null : document.querySelector(".hz8-bs-more__less").textContent.trim() },
    state: (document.querySelector(".hz8-bs-state p") || {}).textContent || null,
    soldShown: document.querySelectorAll("#hz8-bs-grid .hz8-is-soldout").length,
    headTop: Math.round(head.getBoundingClientRect().top), hdrBottom: hdr ? Math.round(hdr.getBoundingClientRect().bottom) : null,
    focus: a === head ? "list-heading" : a.closest("[data-hz8-path]") ? "cell#" + [...document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]")].indexOf(a.closest("[data-hz8-path]")) : a.tagName.toLowerCase() + "." + String(a.className).split(" ")[0],
    live: (document.querySelector(".hz8-bs-page [role=status]") || {}).textContent || ""
  };
};
const loaded = p => p.waitForFunction(() => { const g = document.getElementById("hz8-bs-grid"); return g && !g.getAttribute("aria-busy") && (!document.querySelector(".hz8-bs-more") || /av \d+/.test(document.querySelector(".hz8-bs-more__text").textContent) || document.querySelector(".hz8-bs-more").hidden) && document.querySelectorAll(".hz8-bs-fmt").length > 0; }, null, { timeout: 40000 }).catch(() => {});
async function page(w, opts = {}) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" });
  if (opts.blockTp) await ctx.route(/widget\.trustpilot\.com/, r => r.abort("blockedbyclient"));
  const p = await open(ctx, opts.route || ROUTE); if (opts.reduced) await p.emulateMedia({ reducedMotion: "reduce" });
  await ready(p, 3000); await loaded(p); await p.waitForTimeout(1500);
  // Riktig navigering/omladdning = dokumentet byts (markören försvinner);
  // pushState/replaceState räknas inte (Playwrights framenavigated gör det).
  await p.evaluate(() => { window.__hz8Same = 1; });
  Object.defineProperty(p, "nav", { get: () => p.evaluate(() => (window.__hz8Same === 1 ? 0 : 1)).catch(() => 1), configurable: true });
  return { p, ctx };
}
for (const w of [393, 1440]) {
  if (!only || only === "expand") {
    const { p, ctx } = await page(w); const r = {};
    await p.locator(".hz8-bs-more__btn").scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    r.before = await p.evaluate(ST);
    await p.locator(".hz8-bs-more__btn").click(); await p.waitForTimeout(900);
    r.expanded = await p.evaluate(ST); await shot(p, `expanded-${w}`);
    // Korrigering 2: Visa fler finns kvar; Visa färre är en egen sekundär knapp.
    await p.locator(".hz8-bs-more__less").scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await p.locator(".hz8-bs-more__less").click(); await p.waitForTimeout(1400);
    r.less = await p.evaluate(ST); await shot(p, `less-${w}`);
    r.nav = await p.nav; r.errors = p.errors;
    r.ok = r.expanded.cells === 24 && r.expanded.hist === r.before.hist && /visa=24/.test(r.expanded.url) && Math.abs(r.expanded.y - r.before.y) <= 2 && r.expanded.more.exp === "true" && r.expanded.focus === "cell#12" && r.expanded.more.btn === "Visa fler bästsäljare" && r.expanded.more.less === "Visa färre" && !r.less.more.less
      && r.less.cells === 12 && !/visa=/.test(r.less.url) && r.less.more.exp === "false" && r.less.focus === "list-heading" && r.less.headTop >= r.less.hdrBottom - 1 && r.nav === 0;
    R[`expand-${w}`] = r; console.log("expand", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "filter") {
    const { p, ctx } = await page(w); const r = {};
    r.start = await p.evaluate(ST);
    await p.locator('.hz8-pfam__tab[data-fam="carts"]').click(); await p.waitForTimeout(800); r.carts = await p.evaluate(ST); await shot(p, `carts-${w}`);
    await p.locator('[data-bs="stock"]').click(); await p.waitForTimeout(800); r.cartsStock = await p.evaluate(ST);
    await p.locator('.hz8-pfam__tab[data-fam="buds"]').click(); await p.waitForTimeout(800); r.budsStock = await p.evaluate(ST);
    r.nav = await p.nav;
    await p.goBack(); await p.waitForTimeout(900); r.back1 = await p.evaluate(ST);
    await p.goBack(); await p.waitForTimeout(900); r.back2 = await p.evaluate(ST);
    await p.goForward(); await p.waitForTimeout(900); r.fwd = await p.evaluate(ST);
    r.navHistory = await p.nav;
    // Alla + expansion -> reload
    // Formatbyte behåller lagerväxeln (PAGE-COVERAGE): Alla + I lager.
    await p.locator('.hz8-pfam__tab[data-fam=""]').click(); await p.waitForTimeout(700);
    r.allKeepsStock = await p.evaluate(ST);
    await p.locator(".hz8-bs-more__btn").scrollIntoViewIfNeeded(); await p.locator(".hz8-bs-more__btn").click(); await p.waitForTimeout(700);
    r.preReload = await p.evaluate(ST);
    await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 2000); await loaded(p); await p.waitForTimeout(1500); r.reload = await p.evaluate(ST);
    r.errors = p.errors;
    r.ok = /typ=carts/.test(r.carts.url) && r.carts.hist === r.start.hist + 1 && r.carts.tab === "Carts" && /smart-filter_in-stock/.test(r.cartsStock.url) && r.cartsStock.stock === "true" && r.cartsStock.soldShown === 0
      && r.budsStock.tab === "Buds" && r.budsStock.stock === "true" && r.back1.tab === "Carts" && r.back1.stock === "true" && r.back2.tab === "Carts" && r.back2.stock === "false" && r.fwd.stock === "true" && r.nav === 0
      && r.allKeepsStock.stock === "true" && r.reload.tab === "Alla" && r.reload.stock === "true" && r.reload.cells === r.preReload.cells && /visa=24/.test(r.reload.url);
    R[`filter-${w}`] = r; console.log("filter", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "guide") {
    for (const reduced of [false, true]) {
      const { p, ctx } = await page(w, { reduced }); const r = {};
      await p.locator(".hz8-bs-guide").scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
      const y0 = await p.evaluate(() => scrollY);
      await p.locator('.hz8-bs-fmt[data-fam="hasch"]').click();
      await p.waitForTimeout(60); r.y60 = await p.evaluate(() => Math.round(scrollY));
      await p.waitForTimeout(1500); r.after = await p.evaluate(ST); r.y0 = Math.round(y0); r.nav = await p.nav; r.errors = p.errors;
      await shot(p, `guide-hasch-${w}${reduced ? "-reduced" : ""}`);
      r.ok = r.after.tab === "Hasch" && /typ=hasch/.test(r.after.url) && r.nav === 0 && r.after.headTop >= r.after.hdrBottom && r.after.headTop <= r.after.hdrBottom + 40 && (!reduced || Math.abs(r.y60 - r.after.y) <= 2);
      R[`guide-${w}${reduced ? "-reduced" : ""}`] = r; console.log("guide", w, reduced, JSON.stringify(r)); await ctx.close();
    }
  }
  if (!only || only === "buy") {
    const { p, ctx } = await page(w); const r = { posts: [] };
    p.on("response", res => { if (/frontend-api\/cart/.test(res.url()) && res.request().method() !== "GET") r.posts.push(res.request().method() + " " + res.status()); });
    const add = p.locator("#hz8-bs-grid button.hz8-card-pill:not([disabled])").first();
    r.addName = await add.evaluate(b => b.closest(".product-card").querySelector(".name").textContent.trim());
    await add.scrollIntoViewIfNeeded(); await add.click(); await p.waitForTimeout(4500);
    r.cart = await p.evaluate(() => ({ drawer: !!document.querySelector("#cart-side-wrap.is-active"), rows: [...document.querySelectorAll("#cartAside article.item")].map(a => a.textContent.replace(/\s+/g, " ").trim().slice(0, 60)) }));
    await shot(p, `buy-${w}`);
    r.choose = await p.evaluate(() => { const a = document.querySelector("#hz8-bs-grid a.hz8-card-pill"); return a ? { text: a.textContent.trim(), href: new URL(a.href).pathname } : null; });
    r.nav = await p.nav; r.errors = p.errors;
    r.ok = r.posts.some(x => /POST 2\d\d/.test(x)) && r.cart.rows.length > 0 && !!r.choose && /^\/sv\/products\//.test(r.choose.href) && r.nav === 0;
    R[`buy-${w}`] = r; console.log("buy", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "trust") {
    for (const blockTp of [false, true]) {
      const { p, ctx } = await page(w, { blockTp }); await p.waitForTimeout(blockTp ? 1000 : 4000);
      const r = await p.evaluate(() => { const t = document.querySelector(".hz8-bs-trust"); const a = t.querySelector("a"); return { iframe: !!t.querySelector("iframe"), iframeH: t.querySelector("iframe") ? t.querySelector("iframe").getBoundingClientRect().height : 0, fallback: a && a.getClientRects().length ? a.textContent : null, h: Math.round(t.getBoundingClientRect().height) }; });
      r.errors = p.errors.filter(e => !/trustpilot/i.test(e)); r.ok = blockTp ? r.fallback === "Omdömen på Trustpilot" : r.iframe;
      if (blockTp) await shot(p, `trust-fallback-${w}`);
      R[`trust-${w}${blockTp ? "-blocked" : ""}`] = r; console.log("trust", w, blockTp, JSON.stringify(r)); await ctx.close();
    }
  }
}
if (!only || only === "keyboard") {
  const { p, ctx } = await page(1440); const seen = [];
  await p.evaluate(() => { const h = document.getElementById("hz8-bs-title"); h.tabIndex = -1; h.focus(); });
  for (let i = 0; i < 60; i++) {
    await p.keyboard.press("Tab");
    const f = await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { el: a.tagName.toLowerCase() + "." + String(a.className).split(" ")[0], text: a.textContent.replace(/\s+/g, " ").trim().slice(0, 28), fv: a.matches(":focus-visible"), ring: cs.outlineStyle !== "none" || cs.boxShadow !== "none", vis: r.width > 0 && r.height > 0, zone: a.closest(".hz8-ptool") ? "tool" : a.closest("#hz8-bs-grid") ? "grid" : a.closest(".hz8-bs-more") ? "more" : a.closest(".hz8-bs-guide") ? "guide" : a.closest(".hz8-lmods") ? "lower" : a.closest(".hz8-bs-trust") ? "trust" : "other" }; });
    seen.push(f); if (f.zone === "lower" && /Alla vanliga/.test(f.text)) break;
  }
  // Tangentbordsaktivering: flik med Enter, växel med Space, details med Enter.
  await p.focus('.hz8-pfam__tab[data-fam="buds"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(600);
  const tabKey = await p.evaluate(() => document.querySelector('.hz8-pfam__tab[aria-pressed="true"]').textContent);
  await p.focus('[data-bs="stock"]'); await p.keyboard.press("Space"); await p.waitForTimeout(600);
  const swKey = await p.evaluate(() => document.querySelector('[data-bs="stock"]').getAttribute("aria-checked"));
  await p.focus(".hz8-lmod__qa summary"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  const det = await p.evaluate(() => ({ open: document.querySelector(".hz8-lmod__qa").open, answer: document.querySelector(".hz8-lmod__qa p").textContent.trim().slice(0, 80) }));
  const zones = [...new Set(seen.map(s => s.zone))];
  R.keyboard = { seen, zones, tabKey, swKey, det, noRing: seen.filter(s => s.fv && !s.ring).map(s => s.el), errors: p.errors };
  R.keyboard.ok = tabKey === "Buds" && swKey === "true" && det.open && ["tool", "grid", "more", "guide", "lower"].every(z => zones.includes(z)) && seen.every(s => s.vis);
  console.log("keyboard", JSON.stringify({ ...R.keyboard, seen: seen.map(s => s.zone + ":" + s.text + (s.fv ? "" : "!fv")) }));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/interact-after${only ? "-" + only : ""}.json`, JSON.stringify(R, null, 1));
await b.close();
