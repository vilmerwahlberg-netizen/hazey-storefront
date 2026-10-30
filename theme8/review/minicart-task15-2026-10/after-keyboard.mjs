// TASK 15 efter: tangentbord, fokus, Escape, scroll-lås, rerender, ta bort,
// strainvyns tangentbordsflöde (inga varukorgsanrop i granskningsläge),
// kassan spärrad under väntan, lagergräns, reduced motion, riktig PDP-köpväg.
import { chromium, ctxFor, open, add, openCart, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const R = {};
const desc = () => { const e = document.activeElement; if (!e || e === document.body) return "body"; const inCart = !!e.closest("#cartAside"); return (inCart ? "[cart] " : "[page] ") + e.tagName.toLowerCase() + (e.getAttribute("aria-label") ? ' "' + e.getAttribute("aria-label") + '"' : ' "' + e.textContent.replace(/\s+/g, " ").trim().slice(0, 40) + '"') + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""); };
const counts = () => { const a = document.getElementById("cartAside"); const q = s => a.querySelectorAll(s).length; return { goal: q(".hz8-goal"), count: q(".hz8-cart-count"), pack: q(".hz8-pack"), addon: q(".hz8-addon"), ledger: q(".hz8-ledger"), coupon: q(".hz8-coupon"), trust: q(".hz8-trust"), items: q("article.item"), live: document.querySelectorAll("#hz8-cart-live").length, label: a.querySelector(".button.buy")?.getAttribute("data-hz8-label"), sum: a.querySelector(".sum")?.textContent.replace(/\s+/g, " ").trim() }; };
const track = ctx => { const w = []; ctx.on("request", r => { if (/frontend-api\/(cart|coupon)/.test(r.url()) && r.method() !== "GET") w.push(r.method() + " " + r.url().replace(/^.*frontend-api/, "")); }); return w; };
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h); const res = {};
  const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 130, 1); await add(p, 197, 1);
  await p.evaluate(() => scrollTo(0, 600)); await p.waitForTimeout(500);
  res.scrollBefore = await p.evaluate(() => scrollY);
  const trig = w < 768 ? "#store-header .basket-icon button, #store-header .cart-button, #cart-button" : "#cart-button";
  await p.focus(trig).catch(() => {});
  res.trigger = await p.evaluate(desc);
  await p.keyboard.press("Enter"); await p.waitForTimeout(1600);
  res.open = await p.evaluate(() => !!document.querySelector("#cart-side-wrap.is-active"));
  if (!res.open) { await p.evaluate(() => HZ8.store().dispatch("cart/open")); await p.waitForTimeout(1500); }
  await p.waitForTimeout(3500);
  res.focusOnOpen = await p.evaluate(desc);
  res.a11y = await p.evaluate(() => { const a = document.getElementById("cartAside"); const lb = a.getAttribute("aria-labelledby"); return { role: a.getAttribute("role"), modal: a.getAttribute("aria-modal"), labelledby: lb, name: lb && document.getElementById(lb)?.textContent.replace(/\s+/g, " ").trim(), label: a.getAttribute("aria-label") }; });
  res.tab = [];
  for (let i = 0; i < 26; i++) { await p.keyboard.press("Tab"); await p.waitForTimeout(70); res.tab.push(await p.evaluate(desc)); }
  res.ctaTabIndex = res.tab.findIndex(x => /Till kassan/.test(x)) + 1;
  res.focusRing = await p.evaluate(() => { const b = document.querySelector("#cartAside .button.buy"); b.focus(); const cs = getComputedStyle(b); return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset }; });
  await p.mouse.move(Math.round(w * 0.2), 400); await p.mouse.wheel(0, 900); await p.waitForTimeout(500);
  res.scrollAfterWheel = await p.evaluate(() => scrollY);
  res.rerender = [await p.evaluate(counts)];
  for (const lbl of ["Öka antalet", "Öka antalet", "Minska antalet"]) { await p.locator(`#cartAside article.item .button[aria-label^="${lbl}"]`).first().click(); await p.waitForTimeout(2800); res.rerender.push(await p.evaluate(counts)); }
  for (let i = 0; i < 3; i++) { await p.evaluate(() => HZ8.store().dispatch("cart/close")); await p.waitForTimeout(500); await p.evaluate(() => HZ8.store().dispatch("cart/open")); await p.waitForTimeout(1200); }
  res.reopen = await p.evaluate(counts);
  // Ta bort första raden med tangentbord -> fokus till nästa rads länk.
  await p.focus('#cartAside article.item .button[aria-label^="Ta bort varan"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(3500);
  res.focusAfterRemove = await p.evaluate(desc);
  res.live = await p.evaluate(() => document.getElementById("hz8-cart-live")?.textContent);
  await p.keyboard.press("Escape"); await p.waitForTimeout(800);
  res.closedAfterEsc = await p.evaluate(() => !document.querySelector("#cart-side-wrap.is-active"));
  res.focusAfterEsc = await p.evaluate(desc);
  res.scrollAfterClose = await p.evaluate(() => scrollY);
  await p.keyboard.press("Tab"); res.tabAfterClose = await p.evaluate(desc);
  res.closedVisibility = await p.evaluate(() => getComputedStyle(document.getElementById("cartAside")).visibility);
  res.errors = p.errors.filter(e => !/favicon|trustpilot|gtm|recaptcha|ERR_ADDRESS/i.test(e));
  R["kb-" + w] = res; console.log("kb", w, JSON.stringify(res).slice(0, 1800));
  await ctx.close();
}
// Strainvyn med tangentbord (granskningsläge, inga varukorgsanrop).
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h); const writes = track(ctx); const res = {};
  const p = await open(ctx, "/sv/products/vape-magic-sauce-99-2ml?hz8-pkg-review=1");
  await add(p, 191, 1); await openCart(p); await p.waitForTimeout(3500);
  writes.length = 0;
  await p.focus('.hz8-pack__step[data-hz8-step="strain:3"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(700);
  res.afterStep = await p.evaluate(desc);
  res.pressed = await p.evaluate(() => [...document.querySelectorAll(".hz8-pack__step")].map(b => b.textContent.trim() + ":" + b.getAttribute("aria-pressed")));
  await p.focus(".hz8-pack__edit"); await p.keyboard.press("Enter"); await p.waitForTimeout(700);
  res.editorFocus = await p.evaluate(desc);
  res.editorTab = []; for (let i = 0; i < 9; i++) { await p.keyboard.press("Tab"); await p.waitForTimeout(60); res.editorTab.push(await p.evaluate(desc)); }
  await p.focus('.hz8-slot__btn[data-hz8-slot="0"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
  res.slotOpenFocus = await p.evaluate(desc);
  res.optionStates = await p.evaluate(() => [...document.querySelectorAll(".hz8-opt")].map(o => o.textContent.trim() + " checked=" + o.getAttribute("aria-checked") + " disabled=" + o.getAttribute("aria-disabled")));
  await p.locator(".hz8-opt.is-out").first().click({ force: true }); await p.waitForTimeout(300);
  res.soldOutClickIgnored = await p.evaluate(() => document.querySelector('.hz8-slot__btn[data-hz8-slot="0"]')?.textContent.replace(/\s+/g, " ").trim());
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  res.escCloseList = { focus: await p.evaluate(desc), editorOpen: await p.evaluate(() => !!document.querySelector(".hz8-strains")) };
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  res.escBack = { focus: await p.evaluate(desc), editorOpen: await p.evaluate(() => !!document.querySelector(".hz8-strains")), drawerOpen: await p.evaluate(() => !!document.querySelector("#cart-side-wrap.is-active")) };
  // Ofullständigt paket kan inte sparas.
  await p.locator('.hz8-pack__step[data-hz8-step^="collection:"]').click(); await p.waitForTimeout(500);
  await p.locator(".hz8-pack__edit").click(); await p.waitForTimeout(600);
  res.incomplete = await p.evaluate(() => ({ save: document.querySelector(".hz8-strains__save").textContent, disabled: document.querySelector(".hz8-strains__save").getAttribute("aria-disabled") }));
  await p.locator(".hz8-strains__save").click({ force: true }); await p.waitForTimeout(400);
  res.incompleteStillOpen = await p.evaluate(() => !!document.querySelector(".hz8-strains"));
  await p.locator(".hz8-strains__random").click(); await p.waitForTimeout(400);
  res.afterRandom = await p.evaluate(() => ({ count: document.querySelector(".hz8-strains__count").textContent, save: document.querySelector(".hz8-strains__save").textContent }));
  res.checkoutBlockedInEditor = await p.evaluate(() => document.querySelector("#cartAside .button.buy")?.getAttribute("aria-disabled"));
  await p.locator(".hz8-strains__cancel").click(); await p.waitForTimeout(500);
  res.writes = writes.slice();
  res.errors = p.errors.filter(e => !/favicon|trustpilot|gtm|recaptcha|ERR_ADDRESS/i.test(e));
  R["strain-" + w] = res; console.log("strain", w, JSON.stringify(res).slice(0, 1800));
  await ctx.close();
}
// Kassan under väntan + lagergräns + reduced motion.
{
  const ctx = await ctxFor(b, 1440, 900); const writes = track(ctx); const res = {};
  const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 130, 1); await openCart(p); await p.waitForTimeout(3000);
  ctx.failMode = "slow";
  await p.locator('#cartAside .button[aria-label^="Öka antalet"]').first().click(); await p.waitForTimeout(800);
  res.during = await p.evaluate(() => ({ label: document.querySelector("#cartAside .button.buy").getAttribute("data-hz8-label"), disabled: document.querySelector("#cartAside .button.buy").getAttribute("aria-disabled"), busy: document.getElementById("cartAside").getAttribute("aria-busy") }));
  const url0 = p.url();
  await p.locator("#cartAside .button.buy").click({ force: true }); await p.waitForTimeout(600);
  res.navigatedDuringBusy = p.url() !== url0;
  await p.waitForTimeout(8000); ctx.failMode = null;
  res.after = await p.evaluate(() => ({ label: document.querySelector("#cartAside .button.buy").getAttribute("data-hz8-label"), disabled: document.querySelector("#cartAside .button.buy").getAttribute("aria-disabled"), sum: document.querySelector("#cartAside .sum").textContent.replace(/\s+/g, " ").trim() }));
  R.busy = res; console.log("busy", JSON.stringify(res));
  await ctx.close();
}
{
  const ctx = await ctxFor(b, 393, 852); const writes = track(ctx); const res = {};
  const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 183, 7); await openCart(p); await p.waitForTimeout(3000);
  writes.length = 0;
  await p.locator('#cartAside .button[aria-label^="Öka antalet"]').first().click(); await p.waitForTimeout(4000);
  res.first = { writes: writes.slice(), msg: await p.evaluate(() => [...document.querySelectorAll(".hz8-row-msg")].map(m => m.getAttribute("role") + ": " + m.textContent)), plusDisabled: await p.evaluate(() => document.querySelector('#cartAside .button[aria-label^="Öka antalet"]').getAttribute("aria-disabled")), qty: await p.evaluate(() => document.querySelector("#cartAside input[name=quantity]").value) };
  writes.length = 0;
  await p.locator('#cartAside .button[aria-label^="Öka antalet"]').first().click({ force: true }); await p.waitForTimeout(2500);
  res.secondPlusWrites = writes.slice();
  writes.length = 0;
  await p.locator('#cartAside .button[aria-label^="Minska antalet"]').first().click(); await p.waitForTimeout(3500);
  res.afterMinus = { writes: writes.slice(), msg: await p.evaluate(() => document.querySelectorAll(".hz8-row-msg").length), plusDisabled: await p.evaluate(() => document.querySelector('#cartAside .button[aria-label^="Öka antalet"]').getAttribute("aria-disabled")) };
  R.stock = res; console.log("stock", JSON.stringify(res));
  await ctx.close();
}
{
  const ctx = await ctxFor(b, 393, 852, { reducedMotion: "reduce" }); const res = {};
  const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 130, 1); await openCart(p); await p.waitForTimeout(3000);
  res.transitions = await p.evaluate(() => ({ row: getComputedStyle(document.querySelector("#cartAside article.item")).transitionDuration, fill: document.querySelector(".hz8-goal__fill") ? getComputedStyle(document.querySelector(".hz8-goal__fill")).transitionDuration : null }));
  R.reduced = res; console.log("reduced", JSON.stringify(res));
  await ctx.close();
}
// Riktig köpväg från Faraoh-PDP:n (Nyehandels egen köpknapp).
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h); const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await p.locator(".hz8-pp__cta").first().click(); await p.waitForTimeout(4500);
  R["pdp-add-" + w] = await p.evaluate(() => ({ drawer: !!document.querySelector("#cart-side-wrap.is-active"), focus: document.activeElement && (document.activeElement.getAttribute("aria-label") || document.activeElement.className), items: document.querySelectorAll("#cartAside article.item").length, label: document.querySelector("#cartAside .button.buy")?.getAttribute("data-hz8-label"), live: (document.getElementById("hz8-cart-live") || {}).textContent, msg: (document.querySelector(".hz8-pp__msg") || {}).textContent }));
  await p.screenshot({ path: `${DIR}/after/${w}-pdp-add-real.png` });
  console.log("pdp-add", w, JSON.stringify(R["pdp-add-" + w]));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/after-keyboard.json`, JSON.stringify(R, null, 1));
await b.close();
