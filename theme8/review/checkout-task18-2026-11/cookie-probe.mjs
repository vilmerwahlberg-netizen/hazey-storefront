// Endast läsande: cookiebanner, knappar och vad som laddas/sätts före samtycke.
// Färsk webbläsare per körning; "Neka" klickas bara i den lokala testwebbläsaren.
import { chromium, ctxFor, url } from "./lib.mjs"; import fs from "node:fs";
const TRACK = /google-analytics|googletagmanager|gtag|doubleclick|facebook|fbevents|connect\.facebook|tiktok|hotjar|clarity|snap|pinterest|bing|adservice|pulse-tracker|trustpilot|klaviyo|recaptcha/i;
const b = await chromium.launch(); const R = {};
for (const [w, h] of [[393, 852], [1440, 900]]) {
  for (const target of ["/sv", "/sv/checkout"]) {
    const ctx = await ctxFor(b, w, h); const p = await ctx.newPage(); const reqs = [];
    p.on("request", r => { if (TRACK.test(r.url())) reqs.push({ t: Date.now(), u: r.url().replace(/\?.*/, "").slice(0, 110) }); });
    await p.goto(url(target), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(7000);
    const banner = await p.evaluate(() => {
      const btns = [...document.querySelectorAll("button, a")].filter(e => e.offsetParent && /godkänn|acceptera|neka|avvisa|endast nödvändiga|inställningar|anpassa|spara/i.test(e.textContent)).map(e => {
        const c = getComputedStyle(e), r = e.getBoundingClientRect();
        return { text: e.textContent.trim().replace(/\s+/g, " ").slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), bg: c.backgroundColor, color: c.color, border: c.borderTopWidth + " " + c.borderTopColor, weight: c.fontWeight, size: c.fontSize, root: (e.closest("[class*=cookie],[id*=cookie],[class*=consent],[id*=consent]") || {}).className || "" };
      });
      const root = document.querySelector("[class*=cookie],[id*=cookie],[class*=consent],[id*=consent]");
      return { btns, text: root ? root.innerText.replace(/\s+/g, " ").slice(0, 600) : null };
    });
    const preCookies = (await ctx.cookies()).map(c => c.name + "@" + c.domain);
    const preReqs = [...new Set(reqs.map(r => r.u))];
    const tag = `${w}${target.replace(/\//g, "-")}`;
    await p.screenshot({ path: `theme8/review/checkout-task18-2026-11/runs/cookie-${tag}.png` });
    let after = null;
    const neka = p.locator("button, a").filter({ hasText: /^\s*(Neka|Avvisa|Endast nödvändiga|Neka alla)\s*$/i }).first();
    if (await neka.count()) { const n0 = reqs.length; await neka.click(); await p.waitForTimeout(5000); after = { newReqs: [...new Set(reqs.slice(n0).map(r => r.u))], cookies: (await ctx.cookies()).map(c => c.name + "@" + c.domain) }; }
    const consentState = await p.evaluate(() => (window.dataLayer || []).filter(e => e && (e[0] === "consent" || e["0"] === "consent")).map(e => JSON.stringify([...e].slice(0, 3))).slice(0, 6));
    R[tag] = { banner, preReqs, preCookies, afterNeka: after, consentState };
    console.log(tag, JSON.stringify(R[tag], null, 1).slice(0, 2600));
    await ctx.close();
  }
}
fs.writeFileSync("theme8/review/checkout-task18-2026-11/runs/cookies.json", JSON.stringify(R, null, 1)); await b.close();
