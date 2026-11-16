// Länkarna åt båda håll i riktig Theme 8-preview (läser bara):
// guide -> hubb: länken finns, syns, går att nå med tangentbord och leder till hubbens H1;
// hubb -> guide: hubbens länk till guiden leder till guidens H1. Vid 393 och 1440.
// Kör: node theme8/review/rattslage-hub-2026-11/check-tillbaka.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname); const OUT = path.join(DIR, "shots-live"); fs.mkdirSync(OUT, { recursive: true });
const BASE = "https://hazeyse.nyehandel.se", PV = "v9kzdmqz4w60l5n", HUB = "/sv/page/lagliga-cannabinoider-sverige";
const GUIDES = { thca: "THCA", thcb: "THCB", thch: "THCH", hhc: "HHC" };
const b = await chromium.launch({ channel: "chrome" }); const out = [];
const settle = p => p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 45000 }).catch(() => {}).then(() => p.waitForTimeout(2500));
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const m = w < 768; const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
  for (const [slug, H1] of Object.entries(GUIDES)) {
    const p = await ctx.newPage(); const errors = []; p.on("pageerror", e => errors.push(String(e)));
    await p.goto(`${BASE}/sv/page/${slug}?preview=${PV}`, { waitUntil: "domcontentloaded", timeout: 60000 }); await settle(p);
    const info = await p.evaluate(HUB => {
      const as = [...document.querySelectorAll(`a[href^="${HUB}"]`)];
      const a = as[0]; const vis = !!(a && a.offsetWidth);
      return { count: as.length, text: a ? a.textContent.replace(/\s+/g, " ").trim() : null, visible: vis, list: a ? a.closest("ul")?.className : null,
        h1: [...document.querySelectorAll("h1")].filter(e => e.offsetWidth).map(e => e.textContent.trim()), overflowX: document.documentElement.scrollWidth - innerWidth };
    }, HUB);
    // Tangentbord: fokusera länken och tryck Enter
    const a = p.locator(`a[href^="${HUB}"]`).first();
    await a.scrollIntoViewIfNeeded(); await a.screenshot({ path: path.join(OUT, `tillbaka-${slug}-${w}.png`) }).catch(() => {});
    await a.focus(); const focused = await p.evaluate(HUB => document.activeElement?.getAttribute("href") === HUB, HUB);
    await Promise.all([p.waitForNavigation({ timeout: 60000 }), p.keyboard.press("Enter")]); await settle(p);
    const landed = await p.evaluate(() => ({ path: location.pathname, preview: /preview=/.test(location.search) || null, h1: [...document.querySelectorAll("h1")].filter(e => e.offsetWidth).map(e => e.textContent.trim()) }));
    // Tillbaka: hubbens länk till just den här guiden
    const g = p.locator(`.hz8-lp a[href="/sv/page/${slug}"]`).first(); const gCount = await p.locator(`.hz8-lp a[href="/sv/page/${slug}"]`).count();
    await g.scrollIntoViewIfNeeded().catch(() => {});
    let back = null;
    if (gCount) { const href = await g.getAttribute("href"); await p.goto(`${BASE}${href}?preview=${PV}`, { waitUntil: "domcontentloaded" }); await settle(p); back = await p.evaluate(() => ({ path: location.pathname, h1: [...document.querySelectorAll("h1")].filter(e => e.offsetWidth).map(e => e.textContent.trim()) })); }
    const prob = [];
    if (info.count !== 1) prob.push(`${info.count} länkar till hubben`); if (!info.visible) prob.push("länken syns inte");
    if (info.overflowX > 0) prob.push("sidledsscroll " + info.overflowX); if (!info.h1.includes(H1)) prob.push("guide-H1 " + info.h1);
    if (!focused) prob.push("fokus"); if (landed.path !== HUB || !landed.h1.includes("Cannabinoider i Sverige")) prob.push("guide->hubb landar " + JSON.stringify(landed));
    if (!gCount) prob.push("hubben saknar länk till guiden"); else if (back.path !== `/sv/page/${slug}` || !back.h1.includes(H1)) prob.push("hubb->guide landar " + JSON.stringify(back));
    if (errors.length) prob.push("fel: " + errors.join(" | ").slice(0, 120));
    const r = { slug, w, ...info, focused, landed, hubLinksToGuide: gCount, back, ok: !prob.length, problem: prob }; out.push(r);
    console.log(`${slug.padEnd(5)} ${w}`, r.ok ? "ok" : "FEL: " + prob.join("; "), `| "${info.text}" i ${info.list} | hubben -> ${slug}: ${gCount} länkar`);
    await p.close();
  }
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "check-tillbaka.json"), JSON.stringify({ checkedAt: new Date().toISOString(), results: out }, null, 1));
await b.close();
