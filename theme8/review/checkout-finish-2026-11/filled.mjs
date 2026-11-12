// Kassans slutkontroll (2026-11-12): fylld korg (1 vanlig vara + Magic Sauce 2 ml 3-pack
// blandat) köpt via PDP:ns riktiga knappar i Theme 8-previewn. Kassans CSS INJICERAS
// (simulerad inklistring i Theme 8:s CSS-fält -- adminåtkomst saknas). Ingen order,
// inget fylls i Kustom-ramen, korgen töms efteråt.
// Kör: node theme8/review/checkout-finish-2026-11/filled.mjs [393,768,1440,1920] [none]
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url, ROOT } from "../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const NATIVE = process.argv[3] === "none";
const CSS = fs.readFileSync(path.join(ROOT, "dist/theme8/hazey-theme8-checkout.css"), "utf8");
const VPS = (process.argv[2] || "393,768,1440,1920").split(",").map(Number);
const H = { 393: 852, 768: 1024, 1440: 900, 1920: 1080 };
const HOME = "/sv/products/vape-magic-sauce-magic-farmers-2ml";
const sp = t => String(t || "").replace(/[  ]/g, " ").replace(/‑/g, "-").replace(/\s+/g, " ").trim();
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const go = async (p, u) => { for (let i = 0; ; i++) { try { return await p.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 }); } catch (e) { if (i >= 3) throw e; await p.waitForTimeout(6000 * (i + 1)); } } };
const closeCart = async p => { await p.keyboard.press("Escape").catch(() => { }); await p.evaluate(() => { const b = document.querySelector("#cartAside .close-cart, #cartAside [aria-label*='Stäng']"); if (b && document.querySelector("#cart-side-wrap.is-active")) b.click(); }); await p.waitForTimeout(600); };
const kTotal = async p => sp((await p.frameLocator("#klarna-checkout-iframe").locator("body").innerText().catch(() => "")).match(/Totalbelopp\s*([\d\s ]+kr)/)?.[1]);
const b = await chromium.launch(); const ALL = {};
for (const w of VPS) {
  const h = H[w] || 900, R = ALL[w] = { fails: [] };
  const MUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
  const ctx = await ctxFor(w < 768 ? { newContext: o => b.newContext({ ...o, userAgent: MUA }) } : b, w, h, { which: "after" });
  const p = await open(ctx, HOME); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  await p.locator(".hz8-pp__choice:not([hidden])").waitFor({ timeout: 30000 });
  // 3-pack blandat
  await p.locator('.hz8-pc[data-qty="3"]').click(); await p.waitForTimeout(400);
  for (const [i, n] of ["Gorilla Cookies", "Gorilla Cookies", "Tinky Winky"].entries()) { await p.locator(`.hz8-up select[data-upslot="${i}"]`).selectOption({ label: n }); await p.waitForTimeout(150); }
  await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500); R.msg3 = await p.locator(".hz8-pp__msg").textContent().catch(() => null); await closeCart(p);
  // vanlig vara (1 st)
  await p.locator('.hz8-pc[data-qty="0"]').click(); await p.waitForTimeout(400); await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500); R.msg1 = await p.locator(".hz8-pp__msg").textContent().catch(() => null); await closeCart(p);
  R.cart = ((await api(p, "GET", "cart")).json?.data?.items || []).map(i => ({ name: i.name, total: sp(i.formatted_total), pkg: (i.package_items || []).length > 0 }));
  // Kassa
  await go(p, url("/sv/checkout")); await p.waitForSelector("main.checkout", { timeout: 40000 });
  await p.frameLocator("#klarna-checkout-iframe").getByText("Betala köp").first().waitFor({ state: "visible", timeout: 60000 }).catch(() => R.fails.push("Kustom ej redo"));
  await p.waitForTimeout(3000);
  if (!NATIVE) { await p.addStyleTag({ content: CSS }); await p.waitForTimeout(900); }
  const tag = (NATIVE ? "native-" : "") + w;
  R.items = await p.evaluate(() => [...document.querySelectorAll(".checkout-items-summary article.item")].map(a => {
    const st = a.querySelector(".content a > strong"), m = a.querySelector(".media"), img = m && m.querySelector("img"), r = a.getBoundingClientRect();
    return { name: st ? st.textContent.trim().slice(0, 60) : null, after: st ? getComputedStyle(st, "::after").content : null, tile: m ? getComputedStyle(m, "::after").content : null,
      img: img ? { vis: getComputedStyle(img).visibility, w: Math.round(img.getBoundingClientRect().width), loaded: img.complete && img.naturalWidth > 1, noimg: /no-image/.test(img.src) } : null,
      total: (a.querySelector(".total") || {}).textContent?.trim(), parts: [...a.querySelectorAll(".item__package .option")].map(o => o.textContent.replace(/\s+/g, " ").trim()),
      box: { y: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width), visible: r.width > 0 && r.height > 0 } };
  }));
  R.totals = await p.evaluate(() => [...document.querySelectorAll(".totals .row, .checkout-total")].map(x => x.textContent.replace(/\s+/g, " ").trim()));
  R.total = sp(await p.evaluate(() => document.querySelector(".checkout-total")?.textContent)); R.kustomTotal = await kTotal(p);
  R.shipping = await p.evaluate(() => [...document.querySelectorAll(".shipping .options label, .shipping .option")].map(x => x.innerText.replace(/\s+/g, " ").trim()).slice(0, 4));
  R.layout = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
    return { overflowX: document.documentElement.scrollWidth - innerWidth, header: q("header.checkout"), summary: q(".checkout-items-summary"), totalEl: q(".checkout-total"), kustom: q("#kustom-checkout"), coupon: q("#coupon_code"), main: q("main.checkout") }; });
  if (R.layout.overflowX > 0) R.fails.push("överflöd " + R.layout.overflowX);
  if (R.total !== R.kustomTotal) R.fails.push(`total ${R.total} ≠ Kustom ${R.kustomTotal}`);
  const pk = R.items.find(i => i.parts.length), reg = R.items.find(i => !i.parts.length);
  if (!pk || !reg) R.fails.push("saknar paket eller vanlig rad");
  if (!NATIVE && pk && (!/3.pack/.test(pk.after || "") || !/×/.test(pk.tile || ""))) R.fails.push("paketidentitet " + JSON.stringify(pk));
  if (reg && (!reg.img || reg.img.vis !== "visible" || !reg.img.loaded)) R.fails.push("vanlig bild " + JSON.stringify(reg.img));
  if (R.items.some(i => !i.box.visible)) R.fails.push("osynlig rad");
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: path.join(DIR, "shots", tag + "-fold.png") });
  await p.screenshot({ path: path.join(DIR, "shots", tag + "-full.png"), fullPage: true });
  // Tangentbord: Tab från toppen, hoppa förbi Kustoms ram
  await p.evaluate(() => { document.activeElement?.blur(); document.body.setAttribute("tabindex", "-1"); document.body.focus(); document.body.removeAttribute("tabindex"); });
  const seq = []; let lastY = -1, upJumps = 0;
  for (let i = 0; i < 26; i++) {
    await p.keyboard.press("Tab"); await p.waitForTimeout(700); // Nyehandels mjuka scroll
    const a = await p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return { t: (e.getAttribute("aria-label") || e.textContent || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 28), tag: e.tagName, y: Math.round(r.top + scrollY), vis: r.width > 0 && r.bottom > 0 && r.top < innerHeight, ring: cs.outlineStyle !== "none" || cs.boxShadow !== "none" }; });
    seq.push(a);
    if (a.tag === "IFRAME") { await p.evaluate(() => { const f = document.querySelector("#kustom-checkout"); let n = f; const all = [...document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter(x => !f.contains(x) && (f.compareDocumentPosition(x) & 4)); (all[0] || document.body).focus(); }); seq.push({ t: "(förbi Kustom)", y: null }); }
  }
  R.tab = seq.map(s => s.t + (s.y != null ? "@" + s.y + (s.vis ? "" : "!") + (s.ring === false ? "(ingen ring)" : "") : "")).join(" → ");
  R.hiddenFocus = seq.filter(s => s.y != null && s.vis === false && s.tag !== "BODY").map(s => s.t);
  // Rabattkod via tangentbord (ogiltig)
  const inp = p.locator("#coupon_code"); R.couponVisible = await inp.isVisible().catch(() => false);
  if (R.couponVisible) { await inp.focus(); await p.keyboard.type("HZTESTKOD"); await p.keyboard.press("Tab"); R.couponBtn = await p.evaluate(() => document.activeElement.getAttribute("aria-label") || document.activeElement.textContent.trim());
    await p.keyboard.press("Enter"); await p.waitForTimeout(3500);
    R.couponMsg = sp(await p.evaluate(() => document.querySelector(".coupon-code")?.innerText)); R.totalAfterCoupon = sp(await p.evaluate(() => document.querySelector(".checkout-total")?.textContent));
    const bb = await p.locator(".coupon-code").boundingBox(); if (bb) await p.screenshot({ path: path.join(DIR, "shots", tag + "-coupon.png"), clip: { x: 0, y: Math.max(0, bb.y - 200), width: w, height: Math.min(h, bb.height + 260) } }).catch(() => { });
  } else R.fails.push("rabattkod ej synlig");
  // Töm korgen
  await go(p, url(HOME)); await p.waitForTimeout(1500);
  for (const it of ((await api(p, "GET", "cart")).json?.data?.items || [])) await api(p, "DELETE", "cart/item/" + it.id);
  R.cleaned = ((await api(p, "GET", "cart")).json?.data?.items || []).length === 0; if (!R.cleaned) R.fails.push("ej tömd");
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource|klarna|kustom/i.test(e)).slice(0, 5);
  R.pass = !R.fails.length;
  console.log(`\n### ${tag}: ${R.pass ? "PASS" : "FAIL"}\n` + JSON.stringify(R, null, 1));
  await ctx.close();
}
fs.mkdirSync(path.join(DIR, "runs"), { recursive: true });
fs.writeFileSync(path.join(DIR, "runs", `filled-${NATIVE ? "native" : "css"}-${VPS.join("_")}.json`), JSON.stringify(ALL, null, 1));
await b.close();
