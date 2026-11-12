// TASK 25b — D10-rutan på Magic Sauce buds-/hasch-PDP. Lokal build, Theme 8-preview. Inga korgar.
// Kör: VP=393|1440 node ui-sibling.mjs [filter]
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const VP = +(process.env.VP || 1440), M = VP < 768, SUF = "-" + VP;
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const cat = JSON.parse(fs.readFileSync(path.join(DIR, "probe-catalog.json"), "utf8"));
const expectPaths = k => cat[k].cards.map(c => c.path).sort();
const b = await chromium.launch();
const page = async route => { const ctx = await ctxFor(b, VP, M ? 852 : 1000, { which: "after" }); const p = await open(ctx, route); await ready(p, 8000); try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 1500 }); } catch { } return { ctx, p }; };
const findBox = async p => { for (let i = 0; i < 30; i++) { if (await p.locator(".hz8-pp-sibling .hz8-sh-more").count()) return true; await p.mouse.wheel(0, 900); await p.waitForTimeout(600); } return false; };
const state = p => p.evaluate(() => {
  const sec = document.querySelector(".hz8-pp-sibling .hz8-sh-more"); if (!sec) return null;
  const btn = sec.querySelector(".hz8-sh-more__btn"), region = sec.querySelector(".hz8-sh-more__region"), list = region.querySelector(".hz8-prail__list");
  const cards = [...region.querySelectorAll(".product-card")];
  const order = [...document.querySelectorAll(".hz8-ppc > *")].map(e => e.className.split(" ")[0] + (e.id ? "#" + e.id : ""));
  return { title: sec.querySelector(".hz8-sh-more__t")?.textContent, tags: [...sec.querySelectorAll(".hz8-sh-more__tag")].map(t => t.textContent), support: sec.querySelector(".hz8-sh-more__s")?.textContent.trim(),
    expanded: btn.getAttribute("aria-expanded"), hidden: region.hidden, order,
    scroll: list ? { sw: list.scrollWidth, cw: list.clientWidth, left: list.scrollLeft } : null,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    cards: cards.map(c => { const img = c.querySelector(".product-card__image img"); const a = c.querySelector("a[href*='/products/']"); const r = c.getBoundingClientRect();
      return { name: c.querySelector(".name")?.textContent.trim(), brand: c.querySelector(".brand")?.textContent.trim(), price: c.querySelector(".price")?.textContent.replace(/\s+/g, " ").trim(), path: a ? new URL(a.href).pathname : null, img: img?.getAttribute("src"), imgOk: !!img && img.complete && img.naturalWidth > 0, stock: c.querySelector(".hz8-pstock:not([hidden])")?.textContent.trim() || null, sold: c.classList.contains("hz8-is-soldout"), pill: !!c.querySelector(".hz8-card-pill"), w: Math.round(r.width) }; }) };
});
const SC = {};
for (const [id, route, fmt] of [["B1-buds-pdp", "/sv/products/magic-sauce-buds-grape-gasoline", "d10-buds"], ["B2-buds-pdp-2", "/sv/products/blommor-magic-sauce-buds-tinky-winki-5-gram", "d10-buds"], ["H1-hasch-pdp", "/sv/products/magic-sauce-hash-kitkat-5g", "d10-hash"], ["H2-hasch-pdp-2", "/sv/products/magic-sauce-dubai-chocolate-istallet-for-thc-a-hash", "d10-hash"]]) {
  SC[id] = async () => {
    const { ctx, p } = await page(route);
    if (!(await findBox(p))) { await ctx.close(); return { pass: false, error: "ingen ruta" }; }
    const btn = p.locator(".hz8-pp-sibling .hz8-sh-more__btn").first();
    await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    const closed = await state(p);
    await p.screenshot({ path: path.join(DIR, "shots", id + "-stangd" + SUF + ".png") });
    await btn.click(); await p.waitForTimeout(2500);
    await p.locator(".hz8-pp-sibling .product-card img").last().scrollIntoViewIfNeeded().catch(() => { });
    await btn.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -80)); await p.waitForTimeout(1500);
    const opened = await state(p);
    await p.locator(".hz8-pp-sibling").screenshot({ path: path.join(DIR, "shots", id + "-oppen" + SUF + ".png") });
    // horisontell scroll: från start, mobil = touchsvep (CDP), desktop = scrollBy; alla kort passerar vyn (lata bilder laddas)
    await p.evaluate(() => { const l = document.querySelector(".hz8-pp-sibling .hz8-prail__list"); l.style.scrollBehavior = "auto"; l.scrollLeft = 0; l.style.scrollBehavior = ""; }); await p.waitForTimeout(600);
    const box = await p.locator(".hz8-pp-sibling .hz8-prail__list").boundingBox();
    const before = await p.evaluate(() => document.querySelector(".hz8-pp-sibling .hz8-prail__list").scrollLeft);
    if (M) { const cdp = await ctx.newCDPSession(p); for (let i = 0; i < 4; i++) { await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(box.x + box.width - 30), y: Math.round(box.y + 120), xDistance: -300, yDistance: 0, gestureSourceType: "touch", speed: 1200 }); await p.waitForTimeout(700); if (i === 0) await p.locator(".hz8-pp-sibling").screenshot({ path: path.join(DIR, "shots", id + "-svept" + SUF + ".png") }); } }
    else await p.evaluate(async () => { const l = document.querySelector(".hz8-pp-sibling .hz8-prail__list"); l.scrollBy({ left: 400, behavior: "instant" }); await new Promise(r => setTimeout(r, 500)); });
    await p.waitForTimeout(1500);
    const scrolled = await p.evaluate(() => { const l = document.querySelector(".hz8-pp-sibling .hz8-prail__list"); return { after: l.scrollLeft, sw: l.scrollWidth, cw: l.clientWidth }; }); scrolled.before = before;
    const imgs = (await state(p)).cards.map(c => c.imgOk);
    const sv = await state(p);
    // stäng
    await btn.click(); await p.waitForTimeout(500); const reclosed = await state(p);
    // kortlänk: öppna igen, klicka första kortets bildlänk
    await btn.click(); await p.waitForTimeout(800);
    const first = opened.cards[0];
    await p.locator(".hz8-pp-sibling .product-card a.product-card__image, .hz8-pp-sibling .product-card .details a[href*='/products/']").first().click();
    await p.waitForURL(u => u.pathname === first.path, { timeout: 20000 }).catch(() => { });
    await p.waitForTimeout(2500);
    const landed = await p.evaluate(() => ({ path: location.pathname, h1: document.querySelector(".product-detail__information h1")?.textContent.trim() }));
    await ctx.close();
    const exp = expectPaths(fmt), got = opened.cards.map(c => c.path).sort();
    const catByPath = Object.fromEntries(cat[fmt].cards.map(c => [c.path, c]));
    const priceOk = opened.cards.every(c => catByPath[c.path] && c.price.replace(/\s/g, "").includes(catByPath[c.path].price.split(" kr").slice(-2, -1)[0].replace(/\s/g, "").trim()));
    const nameOk = opened.cards.every(c => catByPath[c.path] && catByPath[c.path].name === c.name);
    const r = { route, title: closed.title, tags: closed.tags, support: closed.support, order: closed.order, closed: { expanded: closed.expanded, hidden: closed.hidden }, open: { expanded: opened.expanded, hidden: opened.hidden }, reclosed: { expanded: reclosed.expanded, hidden: reclosed.hidden },
      cards: opened.cards, expected: exp, scroll: scrolled, landed, overflow: opened.overflow || closed.overflow };
    const fmtWord = fmt === "d10-buds" ? "buds" : "hasch";
    r.checks = { title: closed.title === "Fler " + fmtWord + " från Magic Farmers", closedFirst: closed.expanded === "false" && closed.hidden, open: opened.expanded === "true" && !opened.hidden, reclosed: reclosed.expanded === "false" && reclosed.hidden,
      products: JSON.stringify(exp) === JSON.stringify(got), names: nameOk, prices: priceOk, images: imgs.every(Boolean), stock: opened.cards.every(c => c.stock === "I lager" || c.stock === "Slutsåld"),
      noForeign: opened.cards.every(c => !/vape|cart|pack|pre.?roll|ml\b/i.test(c.name + " " + c.path)), scroll: scrolled.sw > scrolled.cw ? scrolled.after > scrolled.before : true, scrollable: scrolled.sw > scrolled.cw, link: landed.path === first.path && !!landed.h1, noOverflow: !r.overflow, afterSimilar: closed.order.indexOf("hz8-pp-sibling") === closed.order.findIndex(x => /hz8-prail|hz8-pp-similar/.test(x)) + 1 };
    r.pass = Object.entries(r.checks).every(([k, v]) => v || (k === "scrollable"));
    return r;
  };
}
// Kontroller: ingen ruta på vape-PDP:n (D10-rutan för vapes är hubbens), pre-rolls (ligger i MS Buds/Hash) och den felplacerade Charas.
for (const [id, route] of [["N1-vape-pdp", "/sv/products/vape-magic-sauce-magic-farmers-2ml"], ["N2-prerolls-pdp", "/sv/products/magic-sauce-pre-rolls-1g"], ["N3-charas-pdp", "/sv/products/magic-sauce-hash-charas-5-gram"], ["N4-d10-buds-pdp", "/sv/products/d10-buds-white-widow-5g"]]) {
  SC[id] = async () => { const { ctx, p } = await page(route); const has = await findBox(p); const s = has ? await state(p) : null; const rel = await p.evaluate(() => [...document.querySelectorAll(".related-categories a")].map(a => a.textContent.trim())); await ctx.close(); return { route, box: has, title: s && s.title, rel, pass: id === "N3-charas-pdp" ? true : !has }; };
}
const all = {};
for (const k of Object.keys(SC)) { if (only && !only.test(k)) continue; try { all[k] = await SC[k](); } catch (e) { all[k] = { pass: false, error: String(e).slice(0, 300) }; } console.log(k, all[k].pass ? "PASS" : "FAIL", JSON.stringify(all[k].checks || { box: all[k].box, title: all[k].title, error: all[k].error })); }
fs.writeFileSync(path.join(DIR, "ui-sibling" + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
