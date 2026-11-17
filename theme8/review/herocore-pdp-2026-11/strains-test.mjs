// Strainmodulen: grupper om tre, pilar, val, slutsålda, tangentbord, svep.
// Närbilder av grupp 1, 2 och 3 vid 1440 och 393 -> shots/r4-strains/.
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(DIR, "shots", "strains"); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = {};
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h, { scale: w < 768 ? 2 : 1 });
  const p = await open(ctx, URL_("/sv/products/thc-x-vape-hero-core-2ml"));
  await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5000);
  const sec = p.locator("#hz8-pcx-strains"); await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  const state = () => p.evaluate(() => {
    const L = document.querySelector(".hz8-pcx-sa__list"), lr = L.getBoundingClientRect();
    const vis = [...L.querySelectorAll(".hz8-pcx-sa__item")].filter(b => { const r = b.getBoundingClientRect(); const vis = Math.min(r.right, lr.right) - Math.max(r.left, lr.left); return vis / r.width > .95; }).map(b => b.querySelector(".hz8-pcx-sa__name").textContent + (b.getAttribute("aria-pressed") === "true" ? "*" : "") + (b.getAttribute("aria-disabled") ? "(slut)" : ""));
    const a = document.querySelectorAll(".hz8-pcx-sa__arrow");
    return { visible: vis, pos: document.querySelector(".hz8-pcx-sa__pos").textContent, prevDisabled: a[0].disabled, nextDisabled: a[1].disabled, scrollY: Math.round(scrollY), docW: document.documentElement.scrollWidth, native: document.querySelector("#product-variants select")?.selectedOptions[0]?.textContent.trim() };
  });
  const r = R[w] = { groups: [] };
  for (let g = 0; g < 4; g++) {
    await p.waitForTimeout(700);
    const s = await state(); r.groups.push(s);
    if (g < 3) await sec.screenshot({ path: path.join(OUT, `hc-${w}-grupp-${g + 1}.jpg`), type: "jpeg", quality: 86 });
    if (s.nextDisabled) break;
    await p.locator(".hz8-pcx-sa__arrow[data-dir='1']").click();
  }
  // Välj en strain i lager i grupp 1 och kontrollera att sidan inte hoppar
  await p.locator(".hz8-pcx-sa__arrow[data-dir='-1']").click(); await p.waitForTimeout(600);
  await p.locator(".hz8-pcx-sa__arrow[data-dir='-1']").click({ trial: false }).catch(() => {}); await p.waitForTimeout(600);
  const y0 = await p.evaluate(() => scrollY);
  await p.locator(".hz8-pcx-sa__item", { hasText: "Melon Haze" }).click(); await p.waitForTimeout(900);
  r.selectTinky = { ...(await state()), jump: (await p.evaluate(() => scrollY)) - y0 };
  // Slutsåld: klick ska inte ändra valet
  /* Hero's Core har ingen slutsåld strain i dag: slutsåld-klicket provas i MS-testet. */
  r.clickSoldOut = await state();
  // Bläddra framåt och tillbaka: markeringen ligger kvar
  await p.locator(".hz8-pcx-sa__arrow[data-dir='1']").click(); await p.waitForTimeout(700);
  await p.locator(".hz8-pcx-sa__arrow[data-dir='-1']").click(); await p.waitForTimeout(700);
  r.afterPaging = await state();
  // Tangentbord: fokus på kort 3 -> pil höger -> grupp 2
  await p.locator(".hz8-pcx-sa__item").nth(2).focus(); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(800);
  r.keyboard = { ...(await state()), focused: await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 30)) };
  await p.locator(".hz8-pcx-sa__arrow[data-dir='-1']").focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(700);
  r.keyboardArrow = await state();
  // Svep (touch) på mobil
  if (w < 768) {
    const box = await p.locator(".hz8-pcx-sa__list").boundingBox();
    await p.evaluate(() => { const L = document.querySelector(".hz8-pcx-sa__list"); L.scrollBy({ left: L.clientWidth * .7 }); }); await p.waitForTimeout(1200);
    r.swipe = await state();
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "strains-test.json"), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1)); await b.close();
