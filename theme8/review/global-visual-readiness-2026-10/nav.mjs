// TASK 01C -- navigering, historik, återställd scroll, reload och funktion.
// node nav.mjs <before|after> <width[,..]>
// Kedja: Alla Vapes -> (klick) Allt Hasch -> (klick) Magic Sauce -> (klick)
// Magic Sauce Vapes, scrolla 1200 px -> (klick) produkt -> back -> back ->
// forward -> reload (med scroll). Varje dokument mäts med samma
// tidslinje som verify.mjs. Därefter funktion på filtrerade Magic Sauce
// Carts: öppna/stäng filterpanelen (och Escape), header-dropdown
// (desktop) eller mobilmeny (mobil), samt sökfältet.
import { chromium, ctxFor, url, ROUTES, DIR, acceptCookies } from "./lib.mjs";
import { measure, newPage, cleanErrors } from "./verify.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after";
const widths = (process.argv[3] || "393,1440").split(",").map(Number);
const H = { 393: 852, 1440: 900, 1920: 1080 };
const OUT = `${DIR}/runs`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
const log = (w, step, m, extra = {}) => { const row = { which, w, step, ...m, ...extra }; rows.push(row); console.log(JSON.stringify({ ...row, ctrlChangedList: (row.ctrlChangedList || []).slice(0, 2) }).slice(0, 600)); };
async function clickHref(p, re) {
  const ok = await p.evaluate(src => { const rx = new RegExp(src);
    const as = [...document.querySelectorAll("#store-main a[href], #store-header a[href]")].filter(a => rx.test(a.getAttribute("href") || ""));
    const vis = as.find(a => { const r = a.getBoundingClientRect(); return r.width && r.height && getComputedStyle(a).visibility !== "hidden"; }) || as[0];
    if (!vis) return false; vis.scrollIntoView({ block: "center" }); vis.click(); return vis.getAttribute("href"); }, re.source);
  await p.waitForLoadState("domcontentloaded").catch(() => {});
  return ok;
}
for (const w of widths) {
  const ctx = await ctxFor(b, w, H[w], { which }); const p = await newPage(ctx, {}, false);
  await p.goto(url(ROUTES["alla-vapes"]), { waitUntil: "domcontentloaded", timeout: 90000 });
  log(w, "load alla-vapes", await measure(p)); await acceptCookies(p);
  for (const [step, re] of [["click -> hasch", /\/categories\/hasch(\?|$)/], ["click -> magic-sauce", /\/categories\/magic-sauce(\?|$)/], ["click -> m-s-vapes", /\/categories\/m-s-vapes(\?|$)/]]) {
    const href = await Promise.all([p.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null), clickHref(p, re)]).then(x => x[1]);
    log(w, step, await measure(p), { href, path: new URL(p.url()).pathname });
  }
  await p.evaluate(() => window.scrollTo(0, 1200)); await p.waitForTimeout(800);
  const yBefore = await p.evaluate(() => Math.round(scrollY));
  const href = await Promise.all([p.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null), clickHref(p, /\/products\//)]).then(x => x[1]);
  log(w, "click -> product", await measure(p), { href, path: new URL(p.url()).pathname });
  await p.goBack({ waitUntil: "domcontentloaded" }); log(w, "back -> m-s-vapes (restored scroll)", await measure(p), { yBefore, path: new URL(p.url()).pathname });
  await p.goBack({ waitUntil: "domcontentloaded" }); log(w, "back -> magic-sauce", await measure(p), { path: new URL(p.url()).pathname });
  await p.goForward({ waitUntil: "domcontentloaded" }); log(w, "forward -> m-s-vapes", await measure(p), { path: new URL(p.url()).pathname });
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(600);
  await p.reload({ waitUntil: "domcontentloaded" }); log(w, "reload m-s-vapes (scroll 900)", await measure(p), { path: new URL(p.url()).pathname });
  const navErrors = cleanErrors(p.errors); await p.close();

  // Funktion efter beredskap.
  const q = await newPage(ctx, {}, false);
  await q.goto(url(ROUTES["ms-carts"]), { waitUntil: "domcontentloaded", timeout: 90000 });
  const m0 = await measure(q); await acceptCookies(q); await q.waitForTimeout(500);
  const sbState = () => q.evaluate(() => { const sb = document.querySelector("#sidebar"); if (!sb) return null; const r = sb.getBoundingClientRect(); const s = getComputedStyle(sb);
    return { active: sb.classList.contains("is-active"), vis: s.visibility, left: Math.round(r.left), inView: Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)), focusInside: sb.contains(document.activeElement) }; });
  const f = { closed0: await sbState() };
  // Öppna via Theme 8:s egen väg (filterknappen -> "Alla filter"), annars Nyehandels knapp.
  const opened = await q.evaluate(() => { const fs = document.querySelector(".hz8-sf-fs__btn, .hz8-sf-fs > button"); const all = document.querySelector(".hz8-sf-fs__all");
    const nb = document.querySelector(".category-sort .product-filter-button"); if (fs && all) { fs.click(); return "theme8"; } if (nb) { nb.click(); return "native"; } return null; });
  await q.waitForTimeout(300);
  if (opened === "theme8") await q.evaluate(() => { const all = document.querySelector(".hz8-sf-fs__all"); if (all && !all.hidden) all.click(); else document.querySelector(".category-sort .product-filter-button")?.click(); });
  await q.waitForTimeout(600); f.open = await sbState(); f.openedVia = opened;
  await q.keyboard.press("Escape"); await q.waitForTimeout(600); f.afterEscape = await sbState();
  if (f.afterEscape && f.afterEscape.active) { await q.evaluate(() => document.querySelector("#sidebar .sidebar__close")?.click()); await q.waitForTimeout(600); }
  await q.evaluate(() => document.querySelector(".category-sort .product-filter-button")?.click()); await q.waitForTimeout(600); f.reopen = await sbState();
  await q.evaluate(() => document.querySelector("#sidebar .sidebar__close")?.click()); await q.waitForTimeout(600); f.closeBtn = await sbState();
  // Tab genom sidan: fokus får aldrig hamna i den stängda panelen.
  let tabInside = 0; for (let i = 0; i < 40; i++) { await q.keyboard.press("Tab"); if (await q.evaluate(() => { const sb = document.querySelector("#sidebar"); return !!sb && !sb.classList.contains("is-active") && sb.contains(document.activeElement); })) tabInside++; }
  f.tabIntoClosedSidebar = tabInside;
  if (w >= 768) { const trig = await q.$("#store-header .hz8-header-nav [aria-haspopup], #store-header .hz8-header-nav button"); if (trig) { await trig.hover(); await q.waitForTimeout(700); }
    f.dropdownOpen = await q.evaluate(() => !!document.querySelector("#store-header [aria-expanded='true']")); }
  else { await q.evaluate(() => (document.getElementById("mobile-nav-menu") || document.querySelector("#store-header .hamburger"))?.click()); await q.waitForTimeout(700);
    f.drawerOpen = await q.evaluate(() => { const d = document.getElementById("hz8MobileDrawer"); return !!d && (d.classList.contains("is-open") || d.getAttribute("aria-hidden") === "false" || getComputedStyle(d).visibility === "visible"); });
    await q.keyboard.press("Escape"); await q.waitForTimeout(500); }
  f.overflowX = await q.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  log(w, "function ms-carts", m0, { f, navErrors, errors: cleanErrors(q.errors).slice(0, 4) });
  await ctx.close();
}
fs.writeFileSync(`${OUT}/nav-${which}-${widths.join("_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
