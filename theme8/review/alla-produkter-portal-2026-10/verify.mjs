// TASK 03 (Hybrid H) – Alla produkter: samlad verifiering, sekventiellt.
// node verify.mjs after [widths]   -> tillstånd, bilder, kontroller (lokal build)
// node verify.mjs before [widths]  -> före-bilder (BASE = HEAD-build)
// node verify.mjs small            -> 320/430/640 (= 200 % zoom av 1280) + 1280/1512
// node verify.mjs external [widths] -> samma kontroller mot extern preview (ingen injektion)
import fs from "node:fs"; import path from "node:path";
import { launch, open, settle, scrollAll, DIR, H } from "./lib.mjs";
const [mode = "after", wArg = "393,1440,1920"] = process.argv.slice(2);
const ROUTE = "/sv/categories/alla-produkter";
// external = den publicerade Theme 8-previewn utan lokal injektion.
const build = mode === "before" ? process.env.BASE : mode === "external" ? null : path.join(DIR, "../../../dist/theme8");
const OUT = path.join(DIR, "shots", mode); fs.mkdirSync(OUT, { recursive: true });
const b = await launch(); const R = [];
const ok = (n, c, info) => { R.push({ n, pass: !!c, info }); console.log((c ? "PASS " : "FAIL ") + n, JSON.stringify(info ?? "").slice(0, 320)); };
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const state = p => p.evaluate(() => {
  const q = new URLSearchParams(location.search);
  const cards = [...document.querySelectorAll(".hz8-series-results .product-card")];
  const inp = document.getElementById("hz8-pq-input");
  return {
    q: q.get("q"), typ: q.get("typ"), filters: q.get("filters"), sort: q.get("sort"), serie: q.get("serie"),
    input: inp ? inp.value : null,
    tabs: [...document.querySelectorAll(".hz8-pfam__tab[aria-pressed='true']")].map(t => t.textContent.trim()),
    count: (document.querySelector(".hz8-ptool__count") || {}).textContent || "",
    cards: cards.length, more: (document.querySelector(".hz8-pmore__text") || {}).textContent || "",
    names: cards.map(c => { const n = c.querySelector(".name"); return n ? n.getAttribute("data-hz8-full") || n.textContent : ""; }),
    chips: [...new Set(cards.map(c => (c.querySelector(".hz8-pcardchip") || {}).textContent).filter(Boolean))],
    h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()),
    empty: !!document.querySelector(".hz8-series-results .hz8-cat-empty"),
    emptyBtns: [...document.querySelectorAll(".hz8-pempty__actions button")].map(x => x.textContent.trim()),
    live: (document.querySelector('[data-pt="live"]') || {}).textContent || "",
    mark: window.__hz8mark || 0, y: Math.round(scrollY), ov: document.documentElement.scrollWidth - innerWidth
  };
});
async function waitIdle(p, ms = 1500) {
  await p.waitForTimeout(350);
  try { await p.waitForFunction(() => !document.querySelector("#store-main [aria-busy='true']"), null, { timeout: 45000 }); } catch {}
  await p.waitForTimeout(ms);
}
const toSel = (p, sel, off = 120) => p.evaluate(([sel, off]) => { const t = document.querySelector(sel); if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - off, behavior: "instant" }); }, [sel, off]);
const clickTab = (p, label) => p.evaluate(l => { const t = [...document.querySelectorAll(".hz8-pfam__tab")].find(x => x.textContent.trim() === l); t.scrollIntoView({ block: "nearest", inline: "nearest" }); t.click(); }, label);
async function typeQuery(p, text) { await p.click("#hz8-pq-input"); await p.fill("#hz8-pq-input", ""); await p.keyboard.type(text, { delay: 35 }); await waitIdle(p, 1200); }
const totalOf = s => parseInt(s.count, 10);

if (mode === "small") {
  for (const w of [320, 430, 640, 1280, 1512]) {
    const { p, ctx } = await open(b, w, ROUTE, { build }); await settle(p);
    await shot(p, `w${w}-top`);
    await typeQuery(p, "thca buds");
    await shot(p, `w${w}-search`);
    const s = await state(p);
    const touch = await p.evaluate(() => [...document.querySelectorAll(".hz8-pfam__tab, .hz8-ptool__mob button, .hz8-pmore button, .hz8-pq__clear, .hz8-pq__opt")].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().height)));
    ok(`search-${w}`, s.q === "thca buds" && s.cards > 0 && s.names.every(n => norm(n).replace(/ /g, "").includes("thca")), { q: s.q, cards: s.cards });
    ok(`overflow-${w}`, s.ov === 0, s.ov);
    if (w < 768) ok(`touch-44-${w}`, touch.every(h => h >= 44), touch);
    ok(`no-errors-${w}`, !p.errs.length, p.errs);
    await ctx.close();
  }
} else for (const w of wArg.split(",").map(Number)) {
  const m = w < 768, first = m ? 24 : 48;
  // A) Första vy, grid, slut, helsida
  { const { p, ctx } = await open(b, w, ROUTE, { build }); await settle(p);
    await shot(p, `${w}-1-top`);
    await toSel(p, mode === "before" ? "#category-products, .designer-category" : ".hz8-pgridhead", 100); await p.waitForTimeout(600); await shot(p, `${w}-2-grid`);
    await scrollAll(p); await p.waitForTimeout(2000);
    await toSel(p, mode === "before" ? ".pagination, .load-more-products" : ".hz8-pmore", H[w] * 0.45); await p.waitForTimeout(700); await shot(p, `${w}-9-more`);
    await toSel(p, "footer.hz8-footer", H[w] * 0.62); await p.waitForTimeout(700); await shot(p, `${w}-10-footer`);
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/${w}-0-full.jpg`, fullPage: true, type: "jpeg", quality: 60 });
    if (mode !== "before") {
      const s = await state(p);
      const ui = await p.evaluate(() => ({ ph: document.getElementById("hz8-pq-input").placeholder, role: document.getElementById("hz8-pq-input").getAttribute("role"), sortBtn: (document.querySelector('.hz8-ptool [data-pt="sort"] .hz8-psort-label') || {}).textContent, gridSort: (document.querySelector(".hz8-pgridhead__sort") || {}).textContent, guideCta: !!document.querySelector(".hz8-pgridhead__guide, .hz8-pguide"), seal: !!document.querySelector(".hz8-pdecor") }));
      ok(`initial-${w}`, s.h1.join() === "Alla produkter" && /^\d+ produkter$/.test(s.count) && s.tabs.join() === "Alla" && s.cards === first && s.more === `Visar ${first} av ${s.count}` && s.ov === 0, s);
      ok(`hybrid-h-top-${w}`, ui.ph === `Sök bland ${s.count}` && ui.role === "combobox" && (m || ui.sortBtn === "Nyast") && ui.gridSort === "Sorterat på nyast" && !ui.guideCta && !ui.seal, ui);
      const order = await p.evaluate(() => { const y = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; }; return { search: y(".hz8-pq"), tool: y(".hz8-ptool"), head: y(".hz8-pgridhead"), grid: y(".hz8-series-results"), routes: y(".hz8-proutes"), about: y(".hz8-pabout"), foot: y("footer.hz8-footer"), service: y(".hz8-cat-guide") }; });
      ok(`page-order-${w}`, order.search < order.tool && order.tool < order.head && order.head < order.grid && order.grid < order.routes && order.routes < order.about && order.about < order.foot && order.service === null, order);
      const tabsReach = await p.evaluate(() => { const row = document.querySelector(".hz8-pfam"); const tabs = [...row.querySelectorAll(".hz8-pfam__tab")]; const startMore = row.classList.contains("is-more"); row.scrollLeft = row.scrollWidth; return new Promise(r => setTimeout(() => { const rr = row.getBoundingClientRect(); const last = tabs[tabs.length - 1].getBoundingClientRect(); r({ n: tabs.length, labels: tabs.map(t => t.textContent.trim()), startMore, endMore: row.classList.contains("is-more"), lastVisible: last.right <= rr.right + 1 && last.left >= rr.left - 1, sbH: row.offsetHeight - row.clientHeight }); }, 300)); });
      ok(`format-tabs-reachable-${w}`, tabsReach.n === 6 && tabsReach.lastVisible && !tabsReach.endMore && tabsReach.sbH === 0 && (!m || tabsReach.startMore), tabsReach);
      ok(`no-errors-load-${w}`, !p.errs.length, p.errs);
    }
    await ctx.close(); }
  if (mode === "before") continue;

  // B) Sökning: vanlig, förslag (tangentbord + Escape), inga nätverksanrop per tangent, mus + tillbaka, rensa
  { const { p, ctx } = await open(b, w, ROUTE, { build }); await settle(p);
    await p.evaluate(() => { window.__hz8mark = 1; });
    await p.click("#hz8-pq-input"); await p.waitForTimeout(5000); // serietillhörighet laddas en gång vid fokus
    const reqs = []; const onReq = r => { if (/hazeyse\.nyehandel\.se/.test(r.url()) && ["document", "fetch", "xhr"].includes(r.resourceType())) reqs.push(r.url()); };
    p.on("request", onReq);
    await p.keyboard.type("magic sauce", { delay: 45 }); await waitIdle(p, 1200);
    p.off("request", onReq);
    let s = await state(p);
    const hist = await p.evaluate(() => history.length);
    ok(`search-basic-${w}`, s.q === "magic sauce" && s.mark === 1 && s.cards > 0 && s.names.every(n => norm(n).includes("magic sauce")) && s.h1.join() === "Alla produkter" && /produkter? visas/.test(s.live), { q: s.q, cards: s.cards, count: s.count, live: s.live });
    ok(`search-no-network-per-key-${w}`, reqs.length === 0, reqs.slice(0, 5));
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(200);
    const sug = await p.evaluate(() => { const i = document.getElementById("hz8-pq-input"); const opts = [...document.querySelectorAll("#hz8-pq-list [role=option]")]; return { expanded: i.getAttribute("aria-expanded"), ad: i.getAttribute("aria-activedescendant"), n: opts.length, sel: opts.filter(o => o.getAttribute("aria-selected") === "true").map(o => o.id), names: opts.map(o => o.querySelector(".hz8-pq__name").textContent) }; });
    ok(`suggestions-keyboard-${w}`, sug.expanded === "true" && sug.n > 0 && sug.n <= 5 && sug.ad === "hz8-pq-opt-1" && sug.sel.join() === "hz8-pq-opt-1" && sug.names.every(n => norm(n).includes("magic sauce")), sug);
    await toSel(p, ".hz8-pq", 140); await p.waitForTimeout(300); await shot(p, `${w}-3-suggestions`);
    await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    const esc = await p.evaluate(() => ({ hidden: document.getElementById("hz8-pq-list").hidden, value: document.getElementById("hz8-pq-input").value, expanded: document.getElementById("hz8-pq-input").getAttribute("aria-expanded") }));
    ok(`suggestions-escape-keeps-text-${w}`, esc.hidden && esc.value === "magic sauce" && esc.expanded === "false", esc);
    await toSel(p, ".hz8-pgridhead", 100); await p.waitForTimeout(400); await shot(p, `${w}-4-search-result`);
    // Mus: ett förslag öppnar en riktig produkt; tillbaka återställer sökningen
    await toSel(p, ".hz8-pq", 140); await p.click("#hz8-pq-input"); await p.waitForTimeout(600);
    const target = await p.evaluate(() => document.querySelector("#hz8-pq-list .hz8-pq__opt .hz8-pq__name")?.textContent);
    await p.click("#hz8-pq-list .hz8-pq__opt"); await p.waitForURL(/\/products\//, { timeout: 60000 });
    const pdp = p.url();
    await p.goBack({ waitUntil: "domcontentloaded" }); await p.waitForFunction(() => document.documentElement.classList.contains("hz8")); await settle(p); await waitIdle(p);
    s = await state(p);
    ok(`suggestion-mouse-and-back-${w}`, /\/products\//.test(pdp) && !!target && s.q === "magic sauce" && s.input.trim() === "magic sauce" && s.cards > 0 && s.names.every(n => norm(n).includes("magic sauce")), { pdp, target, q: s.q, input: s.input, cards: s.cards });
    // Rensa via X
    await toSel(p, ".hz8-pq", 140); await p.click(".hz8-pq__clear"); await waitIdle(p);
    s = await state(p);
    const focusAfter = await p.evaluate(() => document.activeElement && document.activeElement.id);
    ok(`search-clear-${w}`, s.q === null && s.input === "" && s.cards === first && focusAfter === "hz8-pq-input", { q: s.q, cards: s.cards, focusAfter });
    ok(`search-one-history-step-${w}`, hist <= 3, { historyLength: hist });
    ok(`no-errors-search-${w}`, !p.errs.length, p.errs);
    await ctx.close(); }

  // C) Kombinerat: sök + format + I lager + fullfilter + sortering; reload
  { const { p, ctx } = await open(b, w, ROUTE, { build }); await settle(p);
    await typeQuery(p, "thca");
    await clickTab(p, "Buds"); await waitIdle(p);
    if (m) { await p.evaluate(() => document.querySelector('.hz8-ptool [data-pt="sheet"]').click()); await p.waitForTimeout(700); await p.evaluate(() => { const s = document.querySelector('#hz8-pfilter [data-acc="stock"] .hz8-pacc__btn'); if (s && s.getAttribute("aria-expanded") !== "true") s.click(); }); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector("#hz8-pfilter .hz8-pstock-opt").click()); await waitIdle(p, 2500); await shot(p, `${w}-5-combined-filter-open`); await p.keyboard.press("Escape"); await p.waitForTimeout(400); }
    else { await p.evaluate(() => document.querySelector('.hz8-ptool [data-pt="stock"]').click()); await waitIdle(p, 2500); await p.evaluate(() => document.querySelector('.hz8-ptool [data-pt="all"]').click()); await p.waitForTimeout(800); await shot(p, `${w}-5-combined-filter-open`); await p.keyboard.press("Escape"); await p.waitForTimeout(400); }
    if (m) { await p.evaluate(() => document.querySelector('.hz8-ptool [data-pt="sheet"]').click()); await p.waitForTimeout(700); await p.evaluate(() => { const s = document.querySelector('#hz8-pfilter [data-acc="sort"] .hz8-pacc__btn'); if (s && s.getAttribute("aria-expanded") !== "true") s.click(); }); await p.waitForTimeout(300); }
    else { await p.evaluate(() => document.querySelector('.hz8-ptool [data-pt="sort"]').click()); await p.waitForTimeout(400); }
    await p.evaluate(m => { const scope = m ? document.getElementById("hz8-pfilter") : document.querySelector(".hz8-ptool"); [...scope.querySelectorAll(".hz8-psort")].find(x => x.dataset.native === "Lägsta pris").click(); }, m);
    await waitIdle(p, 3000);
    let s = await state(p);
    const prices = await p.evaluate(() => [...document.querySelectorAll(".hz8-series-results .product-card")].map(c => { const pr = c.querySelector(".price"); const cur = pr && (pr.querySelector("ins") || pr); const all = cur ? cur.textContent.replace(/\s+/g, " ").match(/\d[\d ]*(?:[.,]\d+)?(?=\s*kr)/g) : null; return all ? parseFloat(all[all.length - 1].replace(/ /g, "").replace(",", ".")) : null; }));
    const sold = await p.evaluate(() => document.querySelectorAll(".hz8-series-results .hz8-psold").length);
    ok(`combined-search-format-stock-sort-${w}`, s.q === "thca" && s.typ === "buds" && /in-stock/i.test(s.filters || "") && s.sort === "price_low" && s.cards > 0 && s.chips.every(c => c === "Buds") && s.names.every(n => norm(n).replace(/ /g, "").includes("thca")) && sold === 0 && prices.every((v, i) => i === 0 || v >= prices[i - 1]) && (s.cards === first || totalOf(s) === s.cards), { q: s.q, typ: s.typ, filters: s.filters, sort: s.sort, cards: s.cards, count: s.count, sold, prices: prices.slice(0, 6) });
    await toSel(p, ".hz8-ptool", 140); await p.waitForTimeout(400); await shot(p, `${w}-6-combined-result`);
    const before = s;
    await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForFunction(() => document.documentElement.classList.contains("hz8")); await settle(p); await waitIdle(p, 2000);
    s = await state(p);
    ok(`reload-restores-${w}`, s.q === before.q && s.typ === before.typ && s.filters === before.filters && s.sort === before.sort && s.input === "thca" && s.count === before.count && s.tabs.join() === "Buds", { s: { q: s.q, typ: s.typ, sort: s.sort, count: s.count, input: s.input }, before: before.count });
    ok(`no-errors-combined-${w}`, !p.errs.length, p.errs);
    await ctx.close(); }

  // D) Back/forward i sidan: sök -> format -> bakåt -> bakåt -> framåt (utan omladdning)
  { const { p, ctx } = await open(b, w, ROUTE, { build }); await settle(p);
    await p.evaluate(() => { window.__hz8mark = 1; });
    await typeQuery(p, "magic");
    await clickTab(p, "Carts"); await waitIdle(p);
    const a = await state(p);
    await p.goBack(); await waitIdle(p); const b1 = await state(p);
    await p.goBack(); await waitIdle(p); const b2 = await state(p);
    await p.goForward(); await waitIdle(p); const f1 = await state(p);
    ok(`back-forward-${w}`, a.q === "magic" && a.typ === "carts" && a.cards > 0 && b1.q === "magic" && b1.typ === null && b1.input === "magic" && b2.q === null && b2.input === "" && b2.tabs.join() === "Alla" && f1.q === "magic" && f1.input === "magic" && f1.mark === 1, { a: [a.q, a.typ, a.cards], b1: [b1.q, b1.typ, b1.input], b2: [b2.q, b2.typ, b2.input], f1: [f1.q, f1.typ, f1.input, f1.mark] });
    await toSel(p, ".hz8-ptool", 140); await p.waitForTimeout(300); await shot(p, `${w}-7-back-forward`);
    ok(`no-errors-history-${w}`, !p.errs.length, p.errs);
    await ctx.close(); }

  // E) Tomt resultat och varje återhämtningsväg
  { const { p, ctx } = await open(b, w, ROUTE, { build, query: "&q=zzqxy&typ=buds" }); await settle(p); await waitIdle(p, 2500);
    let s = await state(p);
    ok(`empty-state-${w}`, s.empty && s.h1.join() === "Alla produkter" && s.emptyBtns.join("|") === "Rensa sökning|Ta bort Buds|Rensa alla filter" && !s.more, { empty: s.empty, btns: s.emptyBtns, count: s.count });
    await toSel(p, ".hz8-ptool", 140); await p.waitForTimeout(400); await shot(p, `${w}-8-empty`);
    await p.evaluate(() => [...document.querySelectorAll(".hz8-pempty__actions button")].find(x => x.textContent === "Rensa sökning").click()); await waitIdle(p);
    s = await state(p);
    ok(`empty-clear-search-${w}`, s.q === null && s.typ === "buds" && s.cards > 0 && s.input === "", { q: s.q, typ: s.typ, cards: s.cards });
    await ctx.close(); }
  { const { p, ctx } = await open(b, w, ROUTE, { build, query: "&q=zzqxy&typ=buds" }); await settle(p); await waitIdle(p, 2500);
    await p.evaluate(() => [...document.querySelectorAll(".hz8-pempty__actions button")].find(x => /^Ta bort/.test(x.textContent)).click()); await waitIdle(p);
    const s = await state(p);
    ok(`empty-remove-last-filter-${w}`, s.typ === null && s.q === "zzqxy" && s.empty && s.emptyBtns.join("|") === "Rensa sökning", { typ: s.typ, q: s.q, btns: s.emptyBtns });
    await ctx.close(); }
  { const { p, ctx } = await open(b, w, ROUTE, { build, query: "&q=zzqxy&typ=buds" }); await settle(p); await waitIdle(p, 2500);
    await p.evaluate(() => [...document.querySelectorAll(".hz8-pempty__actions button")].find(x => x.textContent === "Rensa alla filter").click()); await waitIdle(p);
    const s = await state(p);
    ok(`empty-clear-all-${w}`, s.typ === null && s.q === null && s.input === "" && s.cards === first && s.tabs.join() === "Alla", { typ: s.typ, q: s.q, cards: s.cards });
    ok(`no-errors-empty-${w}`, !p.errs.length, p.errs);
    await ctx.close(); }

  // F) Visa fler, produkt och tillbaka (visat antal + scroll), sticky-lager, tangentbord
  { const { p, ctx } = await open(b, w, ROUTE, { build }); await settle(p);
    const s0 = await state(p);
    await p.evaluate(() => document.querySelector(".hz8-pmore__btn").click()); await p.waitForTimeout(900);
    const s1 = await state(p);
    ok(`show-more-step-${w}`, s0.cards === first && s1.cards === Math.min(first * 2, totalOf(s1)) && s1.more === `Visar ${s1.cards} av ${s1.count}`, { first: s0.cards, after: s1.cards, more: s1.more });
    const idx = first + 3;
    await p.evaluate(i => document.querySelectorAll(".hz8-series-results .product-card")[i].scrollIntoView({ block: "center" }), idx); await p.waitForTimeout(2500);
    await p.evaluate(i => document.querySelectorAll(".hz8-series-results .product-card")[i].scrollIntoView({ block: "center" }), idx); await p.waitForTimeout(800);
    const probe = i => p.evaluate(i => { const c = document.querySelectorAll(".hz8-series-results .product-card")[i]; const y = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; }; return { y: Math.round(scrollY), cardTop: c ? Math.round(c.getBoundingClientRect().top) : null, grid: y(".hz8-series-results"), tool: y(".hz8-ptool"), head: y(".hz8-pgridhead") }; }, i);
    const y0 = await probe(idx);
    await p.evaluate(i => document.querySelectorAll(".hz8-series-results .product-card")[i].querySelector("a[href*='/products/']").click(), idx);
    await p.waitForURL(/\/products\//, { timeout: 60000 }); await p.waitForTimeout(1500);
    await p.goBack({ waitUntil: "domcontentloaded" }); await p.waitForFunction(() => document.documentElement.classList.contains("hz8")); await settle(p); await waitIdle(p, 2000);
    const s2 = await state(p); const y2 = await probe(idx);
    ok(`product-back-restores-${w}`, s2.cards === s1.cards && y0.cardTop != null && Math.abs(y2.cardTop - y0.cardTop) < 80, { cards: s2.cards, expected: s1.cards, before: y0, after: y2 });
    if (!m) {
      await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await p.waitForTimeout(700);
      const top = await p.evaluate(() => document.querySelector(".hz8-pdock").classList.contains("is-shown"));
      await toSel(p, ".hz8-series-results", -600); await p.waitForTimeout(900);
      const mid = await p.evaluate(() => { const t = document.querySelector(".hz8-ptool").getBoundingClientRect(); return { shown: document.querySelector(".hz8-pdock").classList.contains("is-shown"), toolBottom: Math.round(t.bottom) }; });
      ok(`desktop-dock-no-overlap-${w}`, !top && mid.shown && mid.toolBottom <= 0, { top, mid });
    } else {
      const stick = await p.evaluate(() => ({ pos: getComputedStyle(document.querySelector(".hz8-ptool")).position, dock: !!document.querySelector(".hz8-pdock.is-shown") }));
      ok(`mobile-no-sticky-tool-${w}`, stick.pos !== "sticky" && stick.pos !== "fixed" && !stick.dock, stick);
    }
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await p.evaluate(() => document.querySelector(".hz8-pfam__tab").focus()); await p.keyboard.press("Tab");
    const f = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { cls: a.className, outline: cs.outlineStyle + " " + cs.outlineWidth, fv: a.matches(":focus-visible") }; });
    await p.focus("#hz8-pq-input");
    const fs2 = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector(".hz8-pq__field")); return cs.outlineStyle + " " + cs.outlineWidth; });
    ok(`keyboard-focus-${w}`, /hz8-pfam__tab/.test(f.cls) && f.fv && /solid/.test(f.outline) && /solid [23]px/.test(fs2), { f, field: fs2 });
    ok(`no-errors-more-${w}`, !p.errs.length, p.errs);
    await ctx.close(); }
}
fs.writeFileSync(path.join(DIR, `verify-${mode}.json`), JSON.stringify(R, null, 1));
console.log(`${R.filter(r => r.pass).length}/${R.length} passed`);
await b.close();
