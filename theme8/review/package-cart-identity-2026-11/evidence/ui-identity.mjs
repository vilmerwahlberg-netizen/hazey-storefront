// TASK 21 — paketradens identitet i minicart och kassa. Lokal build i Theme 8-previewn. Per familj två sessioner:
// A = 3-pack blandat + 5-pack upprepat + vanlig produkt, B = 3-pack upprepat + 5-pack blandat. Köp via PDP:ns knapp,
// minicart (namn, bild, länk, aria, PR #4-sammanfattning, bildhämtningar), kassa med kassans CSS INJICERAD (simulerad
// inklistring i Theme 8:s CSS-fält -- den är inte inklistrad i admin). Korgen töms. Ingen order.
// Kör: node ui-identity.mjs [filter]   VP=393 för mobil.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url, ROOT } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const CHECKOUT_CSS = fs.readFileSync(path.join(ROOT, "dist/theme8/hazey-theme8-checkout.css"), "utf8");
const FAM = {
  core: { home: "/sv/products/thc-x-vape-hero-core-2ml", label: "Hero's Core 2\u00a0ml", pkg: { 3: [263, 467, "1 920 kr"], 5: [265, 469, "3 135 kr"] } },
  ms2: { home: "/sv/products/vape-magic-sauce-magic-farmers-2ml", label: "Magic Sauce 3.0 2\u00a0ml", pkg: { 3: [266, 470, "1 599 kr"], 5: [267, 471, "2 530 kr"] } },
  ms5: { home: "/sv/products/magic-sauce-vape-5ml", label: "Magic Sauce 3.0 5\u00a0ml", pkg: { 3: [268, 472, "2 950 kr"], 5: [269, 473, "4 450 kr"] } }
};
const N = { GEL: "Gelato - Indica", MEL: "Melon Haze", COC: "Coconut Cake - Indica", STR: "Strawberry Kush - Sativa", PIN: "Pineapple Express -Sativa", SLH: "Super Lemon Haze",
  GOR: "Gorilla Cookies", TIN: "Tinky Winky", SPA: "This is Sparta", KOW: "Kowa Bunga", CHU: "La Chupacabra", BRU: "Bruce Banner OG", YOD: "Yoda Ice Cream" };
const SC = {
  "core-A": { fam: "core", buys: [[3, ["GEL", "MEL", "COC"]], [5, ["STR", "STR", "STR", "STR", "STR"]]], single: true },
  "core-B": { fam: "core", buys: [[3, ["PIN", "PIN", "PIN"]], [5, ["GEL", "GEL", "MEL", "SLH", "COC"]]] },
  "ms2-A": { fam: "ms2", buys: [[3, ["GOR", "GOR", "TIN"]], [5, ["GOR", "GOR", "GOR", "GOR", "GOR"]]], single: true },
  "ms2-B": { fam: "ms2", buys: [[3, ["GOR", "GOR", "GOR"]], [5, ["GOR", "GOR", "GOR", "TIN", "TIN"]]] },
  "ms5-A": { fam: "ms5", buys: [[3, ["SPA", "KOW", "CHU"]], [5, ["BRU", "BRU", "BRU", "BRU", "BRU"]]], single: true },
  "ms5-B": { fam: "ms5", buys: [[3, ["SPA", "SPA", "SPA"]], [5, ["SPA", "KOW", "CHU", "BRU", "YOD"]]] }
};
const VP = +(process.env.VP || 1440), MOBILE = VP < 768, SUF = "-" + VP;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const sp = t => String(t || "").replace(/[  ]/g, " ").replace(/‑/g, "-").replace(/\s+/g, " ").trim();
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const go = async (p, u) => { for (let i = 0; ; i++) { try { return await p.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 }); } catch (e) { if (i >= 3) throw e; await p.waitForTimeout(6000 * (i + 1)); } } };
const closeCart = async p => { await p.keyboard.press("Escape").catch(() => { }); await p.evaluate(() => { const b = document.querySelector("#cartAside .close-cart, #cartAside [aria-label*='Stäng']"); if (b && document.querySelector("#cart-side-wrap.is-active")) b.click(); }); await p.waitForTimeout(600); };
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
for (const [name, s] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  const F = FAM[s.fam]; const R = all[name] = { buys: [] };
  const ctx = await ctxFor(MOBILE ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, VP, MOBILE ? 852 : 1000, { which: "after" });
  const p = await open(ctx, F.home); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  await p.locator(".hz8-pp__choice:not([hidden])").waitFor({ timeout: 30000 });
  for (const [q, picks] of s.buys) {
    await p.locator(`.hz8-pc[data-qty="${q}"]`).click(); await p.waitForTimeout(400);
    for (let i = 0; i < picks.length; i++) { await p.locator(`.hz8-up select[data-upslot="${i}"]`).selectOption({ label: N[picks[i]] }); await p.waitForTimeout(150); }
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500);
    R.buys.push({ q, msg: await p.locator(".hz8-pp__msg").textContent() });
    await closeCart(p);
  }
  if (s.single) { await p.locator('.hz8-pc[data-qty="0"]').click(); await p.waitForTimeout(400); await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500); await closeCart(p); }
  const cart = (await api(p, "GET", "cart")).json.data;
  R.cart = cart.items.map(i => ({ id: i.id, product: i.product_id, variant: i.variant_id, name: i.name, total: sp(i.formatted_total), image: i.image_url, parts: (i.package_items || []).flatMap(x => Array(+x.quantity).fill(x.option_values[0].name)) }));
  // Minicart: öppna och läs. Bildhämtningar räknas från öppningen.
  const imgReq = []; const onReq = rq => { if (rq.resourceType() === "image") imgReq.push(rq.url().replace(/^https:\/\/[^/]+/, "").slice(0, 120)); };
  p.on("request", onReq);
  await p.evaluate(() => window.HZ8.store().dispatch("cart/reload").then(() => window.HZ8.store().dispatch("cart/open"))); await p.waitForTimeout(3500);
  R.minicart = await p.evaluate(() => Array.from(document.querySelectorAll("#cartAside article.item")).map(a => {
    const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden";
    const imgs = Array.from(a.querySelectorAll("figure.media img")).filter(vis);
    const link = a.querySelector(".content a");
    return { cls: a.className, text: a.innerText.replace(/\s+/g, " ").trim().slice(0, 260), name: (a.querySelector(".hz8-pack-name") || {}).textContent || null, strongVisible: vis(a.querySelector(".content a > strong")),
      img: imgs.map(i => ({ src: i.getAttribute("src").replace(/^https:\/\/[^/]+/, "").slice(0, 120), w: Math.round(i.getBoundingClientRect().width), loaded: i.complete && i.naturalWidth > 0 })), href: link && link.getAttribute("href"),
      aria: Array.from(a.querySelectorAll("[aria-label]")).map(e => e.getAttribute("aria-label")).join(" | "), strains: (a.querySelector(".hz8-pack__strains") || {}).textContent || null, nativeParts: vis(a.querySelector(".item__package")) };
  }));
  R.minicartImageRequests = imgReq.slice();
  R.minicartOverflow = await p.evaluate(() => { const a = document.getElementById("cartAside"); return a.scrollWidth > a.clientWidth + 1; });
  await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart.png") });
  p.off("request", onReq);
  // Kassa med kassans CSS injicerad (simulerad inklistring).
  await go(p, url("/sv/checkout")); await p.waitForTimeout(8000);
  R.checkoutNative = await p.evaluate(() => document.querySelector(".checkout-items-summary") ? document.querySelector(".checkout-items-summary").innerText.replace(/\s+/g, " ").slice(0, 300) : null);
  await p.addStyleTag({ content: CHECKOUT_CSS }); await p.waitForTimeout(800);
  R.checkout = await p.evaluate(() => Array.from(document.querySelectorAll(".checkout-items-summary article.item")).map(a => {
    const st = a.querySelector(".content a > strong"), m = a.querySelector(".media"), img = m && m.querySelector("img");
    return { href: (a.querySelector(".content a") || {}).getAttribute ? a.querySelector(".content a").getAttribute("href").replace(/^https:\/\/[^/]+/, "") : null, after: st ? getComputedStyle(st, "::after").content : null, strongVis: st ? getComputedStyle(st).visibility : null,
      imgVis: img ? getComputedStyle(img).visibility : null, imgSrc: img ? img.getAttribute("src").slice(-30) : null, tile: m ? getComputedStyle(m, "::after").content : null, total: (a.querySelector(".total") || {}).textContent, parts: Array.from(a.querySelectorAll(".item__package .option")).map(o => o.textContent.replace(/\s+/g, " ").trim()) };
  }));
  R.checkoutOverflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const box = await p.evaluate(() => { const e = document.querySelector(".checkout-items-summary"); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; });
  if (box) await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-kassa.png"), fullPage: true, clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: Math.min(VP, box.w + 16), height: Math.min(box.h + 16, 2600) } });
  await go(p, url(F.home)); await p.waitForTimeout(1500);
  for (const it of ((await api(p, "GET", "cart")).json.data.items || [])) await api(p, "DELETE", "cart/item/" + it.id);
  R.cleaned = (await api(p, "GET", "cart")).json.data.items.length === 0;
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e)).slice(0, 5);
  // Bedömning
  const fails = [];
  for (const [q, picks] of s.buys) {
    const [pid, vid, price] = F.pkg[q], want = F.label + "\u00a0·\u00a0" + q + "\u2011pack";
    const ci = R.cart.findIndex(x => x.variant === vid);
    if (ci < 0) { fails.push(q + ": saknas i korgen"); continue; }
    const c = R.cart[ci], m = R.minicart[ci], k = R.checkout[ci];
    if (c.total !== price) fails.push(q + ": pris " + c.total);
    if (JSON.stringify(c.parts.slice().sort()) !== JSON.stringify(picks.map(x => N[x]).sort())) fails.push(q + ": delar " + c.parts);
    if (!m || m.name !== want || m.strongVisible) fails.push(q + ": minicart-namn " + (m && m.name));
    if (!m || /PILOT|blandbart/i.test(m.text) || /PILOT|blandbart/i.test(m.aria)) fails.push(q + ": adminnamn syns i minicart");
    if (!m || m.img.length !== 1 || /no-image/.test(m.img[0].src) || !m.img[0].loaded) fails.push(q + ": minicart-bild " + JSON.stringify(m && m.img));
    if (!m || m.href !== F.home + "?hz8-pack=" + q) fails.push(q + ": länk " + (m && m.href));
    const groups = {}; picks.forEach(x => groups[N[x]] = (groups[N[x]] || 0) + 1);
    if (!m || !Object.entries(groups).every(([n, k2]) => sp(m.strains || "").includes(k2 + " × " + n)) || m.nativeParts) fails.push(q + ": PR4-sammanfattning " + (m && m.strains));
    if (!k || k.after !== JSON.stringify(want) || k.strongVis !== "hidden" || k.imgVis !== "hidden" || !/×/.test(k.tile || "") || sp(k.total) !== price || k.parts.length < 1) fails.push(q + ": kassa " + JSON.stringify(k));
  }
  if (s.single) {
    const ci = R.cart.findIndex(x => !x.parts.length), m = R.minicart[ci], k = R.checkout[ci];
    if (ci < 0 || !m || m.name || !m.strongVisible || m.img.length !== 1 || !m.img[0].loaded || /hz8-pack-named/.test(m.cls)) fails.push("vanlig produkt påverkad i minicart " + JSON.stringify(m));
    if (!k || k.after !== "none" || k.strongVis !== "visible" || k.imgVis !== "visible" || k.tile !== "none") fails.push("vanlig produkt påverkad i kassan " + JSON.stringify(k));
  }
  const extraImgs = R.minicartImageRequests.filter(u => !/no-image\.png|cloudfront/.test(u));
  if (R.minicartOverflow || R.checkoutOverflow) fails.push("överflöd");
  if (!R.cleaned) fails.push("ej tömd"); if (R.errors.length) fails.push("konsolfel " + R.errors);
  R.fails = fails; R.pass = !fails.length;
  console.log(`\n### ${name}${SUF}: ${R.pass ? "PASS" : "FAIL"}`);
  console.log(JSON.stringify({ fails, minicart: R.minicart.map(m => [m.name || "(vanlig)", m.img.map(i => i.src.slice(-40)).join(","), m.href && m.href.replace(/^https:\/\/[^/]+/, ""), m.strains]), imgRequests: R.minicartImageRequests, checkout: R.checkout.map(k => [k.after, k.tile, k.imgVis, k.total]) }));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "identity-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
