// Statiska sidlänkar (2026-11-13): startsidans "Utvalda serier" och
// "Guider & aktuellt" i Theme 8-previewn, före (origin/dev, XD_BASE) och
// efter (arbetskopian), 393 och 1440 px. Samlar alla renderade
// /page/-länkar och provar deras status. Inget skrivs till Nyehandel.
//   XD_BASE=<före-build-katalog> node theme8/review/static-page-links-2026-11/check.mjs
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs";

const OUT = path.join(DIR, "evidence"); fs.mkdirSync(OUT, { recursive: true });
const SIZES = [[393, 852], [1440, 900]];
const result = {};
const status = {};
async function probe(href) {
  const u = new URL(href, "https://hazeyse.nyehandel.se"); u.searchParams.delete("preview");
  const k = u.pathname; if (k in status) return status[k];
  const r = await fetch("https://hazeyse.nyehandel.se" + k, { redirect: "manual" });
  return (status[k] = r.status + (r.status >= 300 && r.status < 400 ? " -> " + r.headers.get("location") : ""));
}

const browser = await chromium.launch({ channel: "chrome" });
for (const which of ["before", "after"]) {
  for (const [w, h] of SIZES) {
    const ctx = await ctxFor(browser, w, h, { which });
    const p = await open(ctx, "/");
    await ready(p, 6000);
    // Låt fördröjda moduler (verifiedGuides, lazy sektioner) hinna montera.
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
    await p.waitForTimeout(3000);
    const data = await p.evaluate(() => {
      const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
      const sedu = document.querySelector(".hz8-sedu");
      const cards = sedu ? [...sedu.querySelectorAll(".hz8-sedu-card")].map(c => ({
        name: c.querySelector(".hz8-sedu-card__name")?.textContent,
        noInfo: c.querySelector(".hz8-sedu-card__actions").classList.contains("no-info"),
        links: [...c.querySelectorAll(".hz8-sedu-card__actions a")].map(a => ({ text: a.textContent.trim(), href: a.getAttribute("href"), size: r(a) }))
      })) : null;
      const gd = document.querySelector(".hz8-gd");
      const guides = gd ? [...gd.querySelectorAll(".hz8-gd-card__cta")].map(a => ({ text: a.getAttribute("aria-label"), href: a.getAttribute("href") })) : null;
      const pageLinks = [...new Set([...document.querySelectorAll('a[href*="/page/"]')].map(a => a.getAttribute("href")))];
      return { cards, guides, gdPresent: !!gd, nlPresent: !!document.querySelector(".hz8-nl"), order: [...document.querySelectorAll(".hz8-gd, .hz8-nl, .hz8-footer")].map(e => e.className.split(" ")[0]), pageLinks, overflowX: document.documentElement.scrollWidth - innerWidth };
    });
    data.pageLinkStatus = {};
    for (const href of data.pageLinks) data.pageLinkStatus[href] = await probe(href);
    data.errors = p.errors.filter(e => !/recaptcha|trustpilot|gtm|facebook|analytics/i.test(e));
    const sedu = p.locator(".hz8-sedu");
    if (await sedu.count()) { await sedu.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await sedu.screenshot({ path: path.join(OUT, `sedu-${which}-${w}.png`) }); }
    if (w < 768 && await sedu.count()) {
      // Mobilkarusellen: sista kortet (Nano11) också.
      await p.locator("[data-hz8-sedu-dot='3']").click(); await p.waitForTimeout(1200);
      await sedu.screenshot({ path: path.join(OUT, `sedu-${which}-${w}-card4.png`) });
    }
    const gd = p.locator(".hz8-gd");
    if (await gd.count()) { await gd.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await gd.screenshot({ path: path.join(OUT, `guides-${which}-${w}.png`) }); }
    const foot = p.locator(".hz8-footer");
    if (await foot.count()) { await foot.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await foot.screenshot({ path: path.join(OUT, `footer-${which}-${w}.png`) }); }
    result[`${which}-${w}`] = data;
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, "check.json"), JSON.stringify(result, null, 2));
for (const [k, d] of Object.entries(result)) {
  const dead = Object.entries(d.pageLinkStatus).filter(([, s]) => !s.startsWith("200"));
  console.log(k, "| sedu read-knappar:", d.cards?.filter(c => !c.noInfo).length, "| guider:", d.gdPresent ? d.guides.length : "dold", "| /page/-länkar:", d.pageLinks.length, "| ej 200:", JSON.stringify(dead), "| overflowX:", d.overflowX, "| fel:", d.errors.length);
}
