// TASK 25c — samma komponent: hubbens D10 vape-ruta (facit) mot buds-/hasch-rutan på Magic Sauce-PDP:erna.
// Helsida + närbild per ruta, sida-vid-sida-montage, uppmätta kortstilar, 4 kort på desktop, svep på mobil,
// hela bilder och inga överlappande etiketter. Lokal build, Theme 8-preview, inga korgar. Kör: VP=393|1440 node compare.mjs
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname), SHOTS = path.join(DIR, "shots");
const VP = +(process.env.VP || 1440), M = VP < 768, SUF = "-" + VP;
const cat = JSON.parse(fs.readFileSync(path.join(DIR, "probe-catalog.json"), "utf8"));
const b = await chromium.launch();
const BOXES = [
  { id: "vapes-hubb", route: "/sv/categories/magic-sauce", box: ".hz8-sh .hz8-sh-more", cat: null },
  { id: "buds-pdp", route: "/sv/products/magic-sauce-buds-grape-gasoline", box: ".hz8-pp-sibling .hz8-sh-more", cat: "d10-buds" },
  { id: "hasch-pdp", route: "/sv/products/magic-sauce-hash-kitkat-5g", box: ".hz8-pp-sibling .hz8-sh-more", cat: "d10-hash" }
];
const measure = (p, box) => p.evaluate(box => {
  const sec = document.querySelector(box), region = sec.querySelector(".hz8-sh-more__region"), list = region.querySelector(".hz8-prail__list");
  const cs = (e, props) => { if (!e) return null; const c = getComputedStyle(e); return Object.fromEntries(props.map(k => [k, c[k]])); };
  const T = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "color"];
  const cards = [...region.querySelectorAll(".product-card")];
  const c0 = cards[0], sold0 = cards.find(c => c.classList.contains("hz8-is-soldout"));
  const r = e => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height }; };
  const lr = r(list);
  const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).display !== "none";
  const overlaps = []; const cut = [];
  cards.forEach(c => {
    const parts = [".ribbon", ".hz8-pstock", ".brand", ".name", ".price", ".hz8-card-pill", ".hz8-psold", ".product-card__image img"].flatMap(s => [...c.querySelectorAll(s)].filter(vis).map(e => [s, e]));
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const [sa, a] = parts[i], [sb, bb] = parts[j]; if (a.contains(bb) || bb.contains(a)) continue;
      if ((sa === ".ribbon" && sb === ".product-card__image img") || (sb === ".ribbon" && sa === ".product-card__image img")) continue; // etikett på bilden är avsett
      const A = r(a), B = r(bb); const ix = Math.min(A.r, B.r) - Math.max(A.l, B.l), iy = Math.min(A.b, B.b) - Math.max(A.t, B.t);
      if (ix > 1 && iy > 1) overlaps.push(c.querySelector(".name").textContent.trim() + ": " + sa + " × " + sb);
    }
    const img = c.querySelector(".product-card__image img"), well = c.querySelector(".product-card__image");
    const I = r(img), W = r(well), fit = getComputedStyle(img).objectFit;
    if (!(img.complete && img.naturalWidth) || I.l < W.l - 1 || I.r > W.r + 1 || I.t < W.t - 1 || I.b > W.b + 1 || !/contain|scale-down/.test(fit)) cut.push(c.querySelector(".name").textContent.trim() + " fit=" + fit);
  });
  return {
    title: sec.querySelector(".hz8-sh-more__t").textContent, tag: sec.querySelector(".hz8-sh-more__tag")?.textContent,
    railClass: region.querySelector(".hz8-prail").className,
    n: cards.length, fullyVisible: cards.filter(c => { const x = r(c); return x.l >= lr.l - 1 && x.r <= lr.r + 1; }).length,
    list: { w: Math.round(lr.w), sw: list.scrollWidth, cw: list.clientWidth, gap: getComputedStyle(list).columnGap, ox: getComputedStyle(list).overflowX, snap: getComputedStyle(list).scrollSnapType },
    card: c0 && { w: Math.round(r(c0).w), radius: getComputedStyle(c0).borderRadius, bg: getComputedStyle(c0).backgroundColor },
    image: c0 && { w: Math.round(r(c0.querySelector(".product-card__image")).w), h: Math.round(r(c0.querySelector(".product-card__image")).h), radius: getComputedStyle(c0.querySelector(".product-card__image")).borderRadius, bg: getComputedStyle(c0.querySelector(".product-card__image")).backgroundImage.slice(0, 60) },
    brand: cs(c0?.querySelector(".brand"), T), name: cs(c0?.querySelector(".name"), T), price: cs(c0?.querySelector(".price ins, .price"), ["fontFamily", "fontSize", "fontWeight"]),
    // samma läge jämförs: första slutsålda kortet (facit har bara slutsålda)
    stock: cs(sold0?.querySelector(".hz8-pstock"), ["fontSize", "fontWeight", "color"]),
    button: cs(sold0?.querySelector(".hz8-psold"), ["height", "fontSize", "fontWeight", "borderRadius", "backgroundColor", "color"]),
    pill: cs(cards.find(c => vis(c.querySelector(".hz8-card-pill")))?.querySelector(".hz8-card-pill"), ["height", "fontSize", "fontWeight", "borderRadius"]),
    chips: cards.some(c => vis(c.querySelector(".hz8-pcardchips")) && c.querySelector(".hz8-pcardchips").textContent.trim()),
    clipped: cards.filter(c => { const n = c.querySelector(".name"); return n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1; }).map(c => c.querySelector(".name").textContent.trim()),
    overlaps, cut,
    cards: cards.map(c => ({ name: c.querySelector(".name").textContent.trim(), overline: c.querySelector(".brand").textContent.trim(), full: c.querySelector(".name").getAttribute("data-hz8-product"), price: c.querySelector(".price").textContent.replace(/\s+/g, " ").trim(), stock: c.querySelector(".hz8-pstock:not([hidden])")?.textContent.trim() || null, href: new URL(c.querySelector("a[href*='/products/']").href).pathname, buy: vis(c.querySelector(".hz8-card-pill")), sold: vis(c.querySelector(".hz8-psold")) }))
  };
}, box);
const out = {};
for (const B of BOXES) {
  const ctx = await ctxFor(b, VP, M ? 852 : 1000, { which: "after" }); const p = await open(ctx, B.route); await ready(p, 8000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 1500 }); } catch { }
  for (let i = 0; i < 40 && !(await p.locator(B.box).count()); i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(500); }
  const btn = p.locator(B.box + " .hz8-sh-more__btn").first();
  await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  await btn.click(); await p.waitForTimeout(2500);
  // lata bilder: låt alla kort passera vyn, tillbaka till start
  await p.evaluate(async box => { const l = document.querySelector(box + " .hz8-prail__list"); for (let x = 0; x <= l.scrollWidth; x += 150) { l.scrollLeft = x; await new Promise(r => setTimeout(r, 120)); } l.style.scrollBehavior = "auto"; l.scrollLeft = 0; l.style.scrollBehavior = ""; }, B.box);
  await p.waitForTimeout(1200);
  // rutans överkant strax under headern: hela rutan fri från PDP:ns fasta kapitelrad i närbilden
  await p.evaluate(s => { const y = document.querySelector(s).getBoundingClientRect().top + scrollY - (innerWidth < 768 ? 96 : 110); window.scrollTo({ top: y, behavior: "instant" }); }, B.box); await p.waitForTimeout(700);
  const m = await measure(p, B.box);
  m.boxFree = await p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); const hit = document.elementFromPoint(r.left + 20, r.bottom - 6); return !!hit && !!hit.closest(s); }, B.box);
  await p.locator(B.box).screenshot({ path: path.join(SHOTS, "C-" + B.id + "-narbild" + SUF + ".png") });
  await p.screenshot({ path: path.join(SHOTS, "C-" + B.id + "-helsida" + SUF + ".png"), fullPage: true });
  // svep (mobil): touch, CDP
  if (M) {
    await p.locator(B.box + " .hz8-prail__list").scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    const box = await p.locator(B.box + " .hz8-prail__list").boundingBox(); const cdp = await ctx.newCDPSession(p);
    const before = await p.evaluate(s => document.querySelector(s + " .hz8-prail__list").scrollLeft, B.box);
    await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(box.x + box.width - 30), y: Math.round(Math.min(box.y + box.height / 2, (M ? 852 : 1000) - 120)), xDistance: -260, yDistance: 0, gestureSourceType: "touch", speed: 1200 });
    await p.waitForTimeout(900);
    m.swipe = { before, after: await p.evaluate(s => document.querySelector(s + " .hz8-prail__list").scrollLeft, B.box) };
    await p.locator(B.box).screenshot({ path: path.join(SHOTS, "C-" + B.id + "-svept" + SUF + ".png") });
  }
  // stäng
  await btn.click(); await p.waitForTimeout(500);
  m.closedAgain = await p.evaluate(s => { const x = document.querySelector(s); return x.querySelector(".hz8-sh-more__btn").getAttribute("aria-expanded") === "false" && x.querySelector(".hz8-sh-more__region").hidden; }, B.box);
  // kortlänk (PDP-rutorna)
  if (B.cat) {
    await btn.click(); await p.waitForTimeout(800);
    const first = m.cards[0].href;
    await p.locator(B.box + " .product-card a.product-card__image").first().click();
    await p.waitForURL(u => u.pathname === first, { timeout: 20000 }).catch(() => { });
    m.link = { want: first, got: new URL(p.url()).pathname };
  }
  out[B.id] = m; await ctx.close();
}
// sida-vid-sida
const img = id => "data:image/png;base64," + fs.readFileSync(path.join(SHOTS, "C-" + id + "-narbild" + SUF + ".png")).toString("base64");
const pg = await (await b.newContext({ viewport: { width: M ? 1300 : 1500, height: 900 }, deviceScaleFactor: 1 })).newPage();
await pg.setContent(`<body style="margin:0;padding:16px;background:#2a3420;font:600 15px system-ui;color:#fff;display:${M ? "flex" : "grid"};gap:16px;${M ? "align-items:flex-start" : ""}">` + BOXES.map(B => `<figure style="margin:0;${M ? "width:400px" : ""}"><figcaption style="margin:0 0 6px">${B.id} · ${VP}px</figcaption><img src="${img(B.id)}" style="display:block;max-width:100%;${M ? "width:400px" : "width:1460px"}"></figure>`).join("") + "</body>");
await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(SHOTS, "C-sida-vid-sida" + SUF + ".png"), fullPage: true });
// kontroller
const ref = out["vapes-hubb"], keys = ["brand", "name", "price", "stock"];
const same = (a, c) => JSON.stringify(a) === JSON.stringify(c);
for (const id of ["buds-pdp", "hasch-pdp"]) {
  const m = out[id], B = BOXES.find(x => x.id === id), exp = cat[B.cat].cards;
  m.checks = {
    // Kolumnformeln är hubbens; PDP:ns innehållsyta kan vara några px bredare (sidmarginal 12 vs 16 px på mobil) -> <3 %.
    rail: m.railClass === ref.railClass, card: Math.abs(m.card.w / ref.card.w - 1) < .03 && m.card.radius === ref.card.radius && m.card.bg === ref.card.bg,
    image: Math.abs(m.image.w / ref.image.w - 1) < .03 && Math.abs(m.image.h / m.image.w - ref.image.h / ref.image.w) < .02 && m.image.radius === ref.image.radius && m.image.bg === ref.image.bg,
    gap: m.list.gap === ref.list.gap, typography: keys.every(k => same(m[k], ref[k])), button: same({ ...m.button }, { ...ref.button }),
    chipsHiddenLikeRef: m.chips === ref.chips,
    fourOnDesktop: M ? true : m.fullyVisible >= 4 && ref.fullyVisible >= 4, swipe: M ? m.swipe.after > m.swipe.before : true,
    imagesWhole: !m.cut.length, noOverlap: !m.overlaps.length, namesWhole: !m.clipped.length,
    products: same(m.cards.map(c => c.href).sort(), exp.map(c => c.path).sort()), prices: m.cards.every(c => { const e = exp.find(x => x.path === c.href); return e && e.price === c.price; }),
    stock: m.cards.every(c => (c.stock === "I lager" && c.buy && !c.sold) || (c.stock === "Slutsåld" && !c.buy && c.sold)),
    open_close: m.closedAgain, boxFree: m.boxFree, link: m.link.want === m.link.got
  };
  m.pass = Object.values(m.checks).every(Boolean);
  console.log(id, VP, m.pass ? "PASS" : "FAIL", JSON.stringify(m.checks));
}
console.log("facit", VP, JSON.stringify({ n: ref.n, fullyVisible: ref.fullyVisible, overlaps: ref.overlaps, cut: ref.cut, clipped: ref.clipped, swipe: ref.swipe }));
for (const id of ["buds-pdp", "hasch-pdp"]) console.log(id, VP, out[id].cards.map(c => c.overline + " | " + c.name + " | " + c.price + " | " + c.stock).join("  ;  "));
fs.writeFileSync(path.join(DIR, "compare" + SUF + ".json"), JSON.stringify(out, null, 1));
await b.close();
