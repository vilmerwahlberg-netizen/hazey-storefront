// TASK 02: Cannabinoider + sök. Lokal build i Theme 8-previewn (dev-loadern utbytt,
// inget i admin). Kör: node theme8/review/header-cannabinoids-search-2026-11/header.mjs
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const MUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const ROUTE = "/"; // kategorisidan laddar om sig en gång efter start (80-category), startsidan gör det inte
const shot = (p, n, o = {}) => p.screenshot({ path: path.join(DIR, "shots", n + ".png"), ...o });
const b = await chromium.launch(); const R = { fails: [] }; const fail = m => { R.fails.push(m); console.log("FAIL", m); };
const ctxW = (w, h) => ctxFor(w < 768 ? { newContext: o => b.newContext({ ...o, userAgent: MUA }) } : b, w, h, { which: "after" });
const cleanErr = p => p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource|ERR_FAILED/i.test(e));

// WIDTHS=393,1180,1440 begränsar körningen.
const ONLY = process.env.WIDTHS ? process.env.WIDTHS.split(",").map(Number) : null;
const want = w => !ONLY || ONLY.includes(w);
// 1. Passform 1180-1920
R.fit = {};
for (const w of [1180, 1280, 1328, 1440, 1512, 1920].filter(want)) {
  const ctx = await ctxW(w, 900); const p = await open(ctx, ROUTE); await ready(p, 1500);
  const m = await p.evaluate(() => {
    const main = document.querySelector("#store-header .main").getBoundingClientRect();
    const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), cy: Math.round(r.top + r.height / 2) }; };
    const trig = document.querySelector('.hz8-cat-item[data-hz8-cat="cbd"] > .hz8-cat');
    const navItems = [...document.querySelectorAll(".hz8-header-nav > a, .hz8-header-nav > .hz8-cat-item > .hz8-cat")].map(e => ({ t: e.textContent.trim(), ...(() => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right) }; })() }));
    return { main: { l: Math.round(main.left), r: Math.round(main.right), cy: Math.round(main.top + main.height / 2) }, nav: q(".hz8-header-nav"), search: q("#search-container .search-field"), account: q(".account-button"), cart: q(".basket-icon .cart-button"), logo: q(".brand.header-logo a"),
      trigger: trig && { text: trig.textContent.trim(), tag: trig.tagName, clipped: trig.scrollWidth > trig.clientWidth + 1 }, navItems, overflowX: document.documentElement.scrollWidth - innerWidth };
  });
  m.gapNavSearch = m.search ? m.search.l - m.nav.r : null;
  m.searchOffsetY = m.search ? m.search.cy - m.main.cy : null;
  R.fit[w] = m;
  if (!m.trigger || m.trigger.text !== "Cannabinoider" || m.trigger.tag !== "BUTTON" || m.trigger.clipped) fail(w + ": trigger " + JSON.stringify(m.trigger));
  if (m.gapNavSearch < 16) fail(w + ": nav→sök glapp " + m.gapNavSearch);
  if (m.cart.r > m.main.r || m.overflowX > 0) fail(w + ": utanför bubblan/överflöd");
  for (let i = 1; i < m.navItems.length; i++) if (m.navItems[i].l < m.navItems[i - 1].r + 8) fail(w + ": nav överlapp " + m.navItems[i].t);
  if (w === 1180 || w === 1440 || w === 1920) await shot(p, `d${w}-closed`, { clip: { x: 0, y: 0, width: w, height: 110 } });
  if (w === 1180 || w === 1440) {
    // 2. Panel via tangentbord
    await p.evaluate(() => document.querySelector(".hz8-header-nav a").focus());
    let guard = 0; while (guard++ < 12 && !(await p.evaluate(() => document.activeElement.matches('[data-hz8-cat="cbd"] > .hz8-cat')))) await p.keyboard.press("Tab");
    await p.keyboard.press("Enter"); await p.waitForTimeout(400);
    const k = await p.evaluate(() => { const it = document.querySelector('[data-hz8-cat="cbd"]'); const d = it.querySelector(".hz8-dropdown").getBoundingClientRect(); return { open: it.classList.contains("is-open"), exp: it.querySelector(".hz8-cat").getAttribute("aria-expanded"), panel: { l: Math.round(d.left), r: Math.round(d.right), b: Math.round(d.bottom), w: Math.round(d.width) }, links: [...it.querySelectorAll(".hz8-dropdown a")].map(a => [a.textContent.trim().slice(0, 40), a.getAttribute("href")]), headings: [...it.querySelectorAll(".hz8-dropdown__heading")].map(h => h.textContent), missing: it.querySelectorAll("[aria-disabled]").length }; });
    R["panel" + w] = k;
    if (!k.open || k.exp !== "true") fail(w + ": Enter öppnar inte panelen");
    if (k.panel.l < 0 || k.panel.r > w) fail(w + ": panel utanför fönstret " + JSON.stringify(k.panel));
    if (k.missing) fail(w + ": kommer snart i panelen");
    if (!k.links.some(l => l[0] === "THCaB")) fail("THCaB saknas");
    // Magic Sauce under "Serier och blandningar", aldrig under "Cannabinoider"; höjd utan intern scroll
    const ms = await p.evaluate(() => { const it = document.querySelector('[data-hz8-cat="cbd"]'); const d = it.querySelector(".hz8-dropdown");
      const groups = [...it.querySelectorAll(".hz8-dropdown__group")].map(g => ({ h: g.querySelector(".hz8-dropdown__heading").textContent, links: [...g.querySelectorAll("a")].map(a => [a.textContent.trim(), a.getAttribute("href")]) }));
      const r = d.getBoundingClientRect(); return { groups, h: Math.round(r.height), bottom: Math.round(r.bottom), vh: innerHeight, scrolls: d.scrollHeight > d.clientHeight + 1 }; });
    R["groups" + w] = ms;
    const ser = ms.groups.find(g => g.h === "Serier och blandningar"), can = ms.groups.find(g => g.h === "Cannabinoider");
    if (!ser || !ser.links.some(l => l[0] === "Magic Sauce" && l[1] === "/sv/categories/magic-sauce")) fail(w + ": Magic Sauce saknas i Serier och blandningar " + JSON.stringify(ser));
    if (can && can.links.some(l => /Magic Sauce|D10|Nano/.test(l[0]))) fail(w + ": serie under Cannabinoider");
    if (ms.bottom > ms.vh - 8 || ms.scrolls) fail(w + ": panelhöjd " + JSON.stringify({ h: ms.h, bottom: ms.bottom, scrolls: ms.scrolls }));
    // Fokus: Tab genom alla panellänkar, var och en synlig med fokusring inne i panelen
    await p.evaluate(() => document.querySelector('[data-hz8-cat="cbd"] .hz8-dropdown a').focus());
    const walk = [];
    for (let i = 0; i < 14; i++) {
      const f = await p.evaluate(() => { const a = document.activeElement, d = document.querySelector('[data-hz8-cat="cbd"] .hz8-dropdown'); const r = a.getBoundingClientRect(), pr = d.getBoundingClientRect(); const cs = getComputedStyle(a);
        return { t: a.textContent.trim().slice(0, 24), inPanel: d.contains(a), visible: r.width > 0 && r.top >= pr.top - 1 && r.bottom <= pr.bottom + 1, ring: cs.outlineStyle !== "none" || cs.boxShadow !== "none" || cs.color !== "" }; });
      if (!f.inPanel) break; walk.push(f); await p.keyboard.press("Tab"); await p.waitForTimeout(60);
    }
    R["focusWalk" + w] = walk.map(f => f.t);
    if (walk.length < 13 || walk.some(f => !f.visible) || !R["focusWalk" + w].includes("Magic Sauce")) fail(w + ": fokusgång " + JSON.stringify(walk));
    await p.waitForTimeout(400); // initDropdowns stänger med CLOSE_DELAY 220 ms
    if (await p.evaluate(() => document.querySelector('[data-hz8-cat="cbd"]').classList.contains("is-open"))) fail(w + ": panelen stängs inte när fokus lämnar den");
    await p.evaluate(() => document.querySelector('[data-hz8-cat="cbd"] > .hz8-cat').focus()); await p.keyboard.press("Enter"); await p.waitForTimeout(350);
    await shot(p, `d${w}-cannabinoider`, { clip: { x: 0, y: 0, width: w, height: Math.min(900, k.panel.b + 24) } });
    await p.keyboard.press("ArrowDown"); await p.waitForTimeout(200);
    R["arrow" + w] = await p.evaluate(() => document.activeElement.textContent.trim());
    // Pil ned från triggern i öppet läge flyttar inte (triggern har inte fokus) -> fokusera trigger och testa
    await p.evaluate(() => document.querySelector('[data-hz8-cat="cbd"] > .hz8-cat').focus()); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(200);
    R["firstLink" + w] = await p.evaluate(() => document.activeElement.textContent.trim());
    if (R["firstLink" + w] !== "THCaB") fail(w + ": Pil ned -> " + R["firstLink" + w]);
    await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    const esc = await p.evaluate(() => ({ open: document.querySelector('[data-hz8-cat="cbd"]').classList.contains("is-open"), focus: document.activeElement.textContent.trim() }));
    if (esc.open || esc.focus !== "Cannabinoider") fail(w + ": Escape " + JSON.stringify(esc));
    // Mus: hover öppnar, klick behåller öppet
    await p.hover('[data-hz8-cat="cbd"] > .hz8-cat'); await p.waitForTimeout(450);
    const hov = await p.evaluate(() => document.querySelector('[data-hz8-cat="cbd"]').classList.contains("is-open"));
    await p.click('[data-hz8-cat="cbd"] > .hz8-cat'); await p.waitForTimeout(250);
    const afterClick = await p.evaluate(() => document.querySelector('[data-hz8-cat="cbd"]').classList.contains("is-open"));
    if (!hov || !afterClick) fail(w + ": hover/klick " + hov + "/" + afterClick);
    await p.mouse.move(w / 2, 600); await p.waitForTimeout(500);
    // Länkstatus
    if (w === 1440) {
      R.linkStatus = await p.evaluate(async links => { const o = {}; for (const [t, h] of links) { const r = await fetch(h, { credentials: "same-origin" }); const d = new DOMParser().parseFromString(await r.text(), "text/html"); o[t] = { h, status: r.status, final: new URL(r.url).pathname, count: (d.querySelector("#products_count") || {}).textContent?.trim() || null }; } return o; }, k.links);
      for (const [t, v] of Object.entries(R.linkStatus)) if (v.status !== 200 || (v.h.includes("/categories/") && !v.count && !/alla-produkter/.test(v.h)) ) fail("länk " + t + " " + JSON.stringify(v));
      // THCaB synligt även i Vapes-panelen
      R.vapesThcab = await p.evaluate(() => [...document.querySelectorAll('[data-hz8-cat="vapes"] .hz8-dropdown a')].some(a => a.textContent.trim() === "THCaB"));
      if (!R.vapesThcab) fail("THCaB borta ur Vapes");
    }
  }
  if (w === 1440) {
    // 3. Desktop-sök
    const searchReqs = []; p.on("request", r => { if (/search\/product/.test(r.url())) searchReqs.push(r.url().split("query=")[1]); });
    await p.click("#search-input"); await p.waitForTimeout(600);
    const s0 = await p.evaluate(() => { const d = document.getElementById("hz8DesktopSearch"); const r = d.firstChild.getBoundingClientRect(); const f = document.querySelector("#search-container .search-field").getBoundingClientRect(); const nd = document.querySelector(".store-search__dropdown");
      return { open: !d.hidden && d.classList.contains("is-open"), rect: { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, fieldRight: Math.round(f.right), fieldBottom: Math.round(f.bottom), nativeVisible: !!(nd && nd.getClientRects().length), text: d.innerText.replace(/\s+/g, " ").slice(0, 300), exp: document.getElementById("search-input").getAttribute("aria-expanded") }; });
    R.searchEmpty = s0;
    if (!s0.open || s0.nativeVisible || s0.exp !== "true") fail("sök tomt läge " + JSON.stringify(s0));
    await shot(p, "d1440-search-empty", { clip: { x: 0, y: 0, width: 1440, height: Math.min(900, s0.rect.t + s0.rect.h + 24) } });
    await p.keyboard.type("magic", { delay: 60 }); await p.waitForTimeout(1800);
    const s1 = await p.evaluate(() => { const d = document.getElementById("hz8DesktopSearch"); const r = d.firstChild.getBoundingClientRect(); const nd = document.querySelector(".store-search__dropdown");
      return { hits: d.querySelectorAll(".hz8-msearch__hit").length, imgs: [...d.querySelectorAll(".hz8-msearch__hit img")].filter(i => i.complete && i.naturalWidth > 0).length, prices: d.querySelectorAll(".hz8-msearch__price").length, cats: d.querySelectorAll(".hz8-msearch__cats a").length, all: (d.querySelector(".hz8-msearch__all") || {}).textContent, status: document.getElementById("hz8DsearchStatus").textContent, h: Math.round(r.height), scroll: d.firstChild.scrollHeight > d.firstChild.clientHeight, nativeVisible: !!(nd && nd.getClientRects().length) }; });
    R.searchMagic = s1; R.searchReqsAfterTyping = searchReqs.slice();
    if (!s1.hits || !/Visa alla \d+ träffar/.test(s1.all || "") || s1.nativeVisible) fail("sök träffar " + JSON.stringify(s1));
    if (searchReqs.length > 2) fail("dubbla sökanrop " + searchReqs.join(","));
    await shot(p, "d1440-search-results", { clip: { x: 0, y: 0, width: 1440, height: 900 } });
    await p.keyboard.press("ArrowDown"); await p.waitForTimeout(150); const f1 = await p.evaluate(() => document.activeElement.textContent.trim());
    await p.keyboard.press("ArrowDown"); await p.waitForTimeout(150); const f2 = await p.evaluate(() => document.activeElement.textContent.trim());
    await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp"); await p.waitForTimeout(150); const f0 = await p.evaluate(() => document.activeElement.id);
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("Escape"); await p.waitForTimeout(250);
    const esc = await p.evaluate(() => ({ open: !document.getElementById("hz8DesktopSearch").hidden, focus: document.activeElement.id, hidden: document.documentElement.classList.contains("hz8-header-hidden") }));
    R.searchKeys = { f1, f2, f0, esc };
    if (!f1 || f1 === f2 || f0 !== "search-input" || esc.open || esc.focus !== "search-input") fail("sök tangentbord " + JSON.stringify(R.searchKeys));
    // inga träffar
    await p.fill("#search-input", ""); await p.keyboard.type("qqxzv", { delay: 40 }); await p.waitForTimeout(1600);
    R.searchNone = await p.evaluate(() => ({ open: !document.getElementById("hz8DesktopSearch").hidden, text: document.getElementById("hz8DsearchResults").innerText.replace(/\s+/g, " ") }));
    if (!/Inga träffar/.test(R.searchNone.text)) fail("inga träffar " + JSON.stringify(R.searchNone));
    await shot(p, "d1440-search-none", { clip: { x: 700, y: 0, width: 740, height: 420 } });
    // nätverksfel
    await p.route(/search\/product/, r => r.abort("failed"));
    await p.fill("#search-input", ""); await p.keyboard.type("core", { delay: 40 }); await p.waitForTimeout(1600);
    R.searchError = await p.evaluate(() => document.getElementById("hz8DsearchResults").innerText.replace(/\s+/g, " "));
    if (!/kunde inte laddas/.test(R.searchError)) fail("fel-läge " + R.searchError);
    await shot(p, "d1440-search-error", { clip: { x: 700, y: 0, width: 740, height: 420 } });
    await p.unroute(/search\/product/);
    // klick utanför
    await p.mouse.click(300, 600); await p.waitForTimeout(300);
    if (await p.evaluate(() => !document.getElementById("hz8DesktopSearch").hidden)) fail("klick utanför stänger inte");
    // Enter -> resultatsidan
    await p.click("#search-input"); await p.fill("#search-input", "magic"); await p.waitForTimeout(400);
    await Promise.all([p.waitForURL(/\/search\?query=magic/, { timeout: 30000 }).catch(() => fail("Enter navigerar inte")), p.keyboard.press("Enter")]);
    R.enterUrl = p.url(); await p.waitForTimeout(4000);
    R.resultPage = await p.evaluate(() => ({ h1: (document.querySelector("h1") || {}).textContent?.trim(), count: (document.querySelector("#products_count") || {}).textContent?.trim() || null, cards: document.querySelectorAll(".product-card, .hz8-pc-card, [class*=product-card]").length, body: document.body.innerText.match(/\d+\s+(produkter|träffar|resultat)/i)?.[0] || null }));
    if (!/preview=/.test(R.enterUrl)) fail("Enter tappar preview");
  }
  const e = cleanErr(p); if (e.length) { R["errors" + w] = e.slice(0, 4); fail(w + ": konsolfel"); }
  await ctx.close();
}

// 4. Mobil 393 + kompakt 768
for (const w of [393, 768].filter(want)) {
  const ctx = await ctxW(w, w < 768 ? 852 : 1024); const p = await open(ctx, ROUTE); await ready(p, 1500);
  await p.click("#mobile-nav-menu, #store-header .hamburger"); await p.waitForTimeout(600);
  const acc = p.locator('#hz8MobileDrawer .hz8-mobile-accordion[data-hz8-cat="cbd"] .hz8-mobile-accordion__trigger');
  const label = (await acc.textContent()).trim();
  if (label !== "Cannabinoider") fail(w + ": mobil etikett " + label);
  await acc.click(); await p.waitForTimeout(600);
  const m = await p.evaluate(() => { const s = document.querySelector('#hz8MobileDrawer [data-hz8-cat="cbd"]'); return { exp: s.querySelector("button").getAttribute("aria-expanded"), links: [...s.querySelectorAll("a")].map(a => a.textContent.trim().slice(0, 30)), missing: s.querySelectorAll("[aria-disabled]").length, overflow: document.querySelector(".hz8-mobile-drawer__panel").scrollWidth > document.querySelector(".hz8-mobile-drawer__panel").clientWidth + 1 }; });
  R["drawer" + w] = m;
  if (m.exp !== "true" || !m.links.includes("THCaB") || !m.links.includes("Magic Sauce") || m.missing || m.overflow) fail(w + ": drawer " + JSON.stringify(m));
  const dm = await p.evaluate(() => { const s = document.querySelector('#hz8MobileDrawer [data-hz8-cat="cbd"]'); const pan = s.querySelector(".hz8-mobile-accordion__panel");
    const g = [...s.querySelectorAll(".hz8-mobile-accordion__group")].map(x => ({ h: x.querySelector("h3").textContent, links: [...x.querySelectorAll("a")].map(a => [a.textContent.trim(), a.getAttribute("href")]) }));
    const tiny = [...s.querySelectorAll("a")].filter(a => a.getBoundingClientRect().height < 44).map(a => a.textContent.trim().slice(0, 20));
    return { groups: g, panelH: Math.round(pan.getBoundingClientRect().height), tiny }; });
  R["drawerGroups" + w] = dm;
  const ser = dm.groups.find(x => x.h === "Serier och blandningar");
  if (!ser || !ser.links.some(l => l[0] === "Magic Sauce" && l[1] === "/sv/categories/magic-sauce")) fail(w + ": mobil Magic Sauce " + JSON.stringify(ser));
  if (dm.tiny.length) fail(w + ": tryckytor < 44 px " + dm.tiny);
  // Fokus: Tab från accordionknappen genom länkarna når Magic Sauce, synligt
  await p.evaluate(() => document.querySelector('#hz8MobileDrawer [data-hz8-cat="cbd"] .hz8-mobile-accordion__trigger').focus());
  const mw = [];
  for (let i = 0; i < 6; i++) { await p.keyboard.press("Tab"); await p.waitForTimeout(250); mw.push(await p.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return { t: a.textContent.trim().slice(0, 20), vis: r.top >= 0 && r.bottom <= innerHeight }; })); }
  R["drawerFocus" + w] = mw;
  if (!mw.some(f => f.t === "Magic Sauce") || mw.some(f => !f.vis)) fail(w + ": mobil fokusgång " + JSON.stringify(mw));
  const msStatus = await p.evaluate(async () => { const r = await fetch("/sv/categories/magic-sauce"); return r.status; });
  if (msStatus !== 200) fail(w + ": magic-sauce status " + msStatus);
  await p.evaluate(() => { const s = document.querySelector('#hz8MobileDrawer [data-hz8-cat="cbd"]'); s.scrollIntoView({ block: "start" }); });
  await p.waitForTimeout(300); await shot(p, `m${w}-drawer-cannabinoider`);
  // tangentbord i drawern: Escape stänger och fokus tillbaka
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  // sök
  await p.click("#mobile-search-trigger"); await p.waitForTimeout(700);
  const st = await p.evaluate(() => document.getElementById("hz8MsearchResults").innerText.replace(/\s+/g, " "));
  if (!/cannabinoider/i.test(st) || !/THCaB/.test(st)) fail(w + ": mobilsök saknar cannabinoidgenvägar");
  const sg = await p.evaluate(() => { const out = {}; let cur = null; document.querySelectorAll("#hz8MsearchResults .hz8-msearch__label, #hz8MsearchResults .hz8-msearch__cats a").forEach(n => { if (n.classList.contains("hz8-msearch__label")) { cur = n.textContent; out[cur] = []; } else if (cur) out[cur].push(n.textContent.trim()); }); return out; });
  R["msearchGroups" + w] = sg;
  if (!(sg["Serier och blandningar"] || []).includes("Magic Sauce") || (sg["Cannabinoider"] || []).includes("Magic Sauce")) fail(w + ": sökgenvägar " + JSON.stringify(sg));
  await shot(p, `m${w}-search-empty`);
  await p.keyboard.type("nano", { delay: 60 }); await p.waitForTimeout(1800);
  const hits = await p.evaluate(() => document.querySelectorAll("#hz8MobileSearch .hz8-msearch__hit").length);
  if (!hits) fail(w + ": mobilsök inga träffar");
  await shot(p, `m${w}-search-results`);
  await p.route(/search\/product/, r => r.abort("failed"));
  await p.fill("#hz8MsearchInput", ""); await p.keyboard.type("d10", { delay: 50 }); await p.waitForTimeout(1500);
  const er = await p.evaluate(() => document.getElementById("hz8MsearchResults").innerText);
  if (!/kunde inte laddas/.test(er)) fail(w + ": mobil fel-läge");
  await shot(p, `m${w}-search-error`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  R["msearchClose" + w] = await p.evaluate(() => ({ hidden: document.getElementById("hz8MobileSearch").hidden, focus: document.activeElement.id }));
  if (!R["msearchClose" + w].hidden) fail(w + ": Escape stänger inte mobilsök");
  const e = cleanErr(p); if (e.length) { R["errors" + w] = e.slice(0, 4); fail(w + ": konsolfel"); }
  await ctx.close();
}
R.pass = !R.fails.length;
fs.writeFileSync(path.join(DIR, "runs/header.json"), JSON.stringify(R, null, 1));
console.log(R.pass ? "ALL PASS" : "FAILS:\n" + R.fails.join("\n"));
console.log(JSON.stringify({ fit: Object.fromEntries(Object.entries(R.fit).map(([w, m]) => [w, { gap: m.gapNavSearch, searchDy: m.searchOffsetY, nav: [m.nav.l, m.nav.r], search: m.search && [m.search.l, m.search.r] }])), searchMagic: R.searchMagic, keys: R.searchKeys, links: R.linkStatus }, null, 1));
await b.close();
