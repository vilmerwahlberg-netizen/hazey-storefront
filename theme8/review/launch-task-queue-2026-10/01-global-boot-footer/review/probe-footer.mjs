// Footerkant: mäter vad som ligger efter den synliga footern.
// node probe-footer.mjs <before|after> [route,...] [width,...]
import { chromium, ctxFor, open, ready, ROUTES as R0, EXTRA, DIR } from "./lib.mjs"; const ROUTES = { ...R0, ...EXTRA }; import fs from "node:fs";
const which = process.argv[2] || "after";
const routes = process.argv[3] ? process.argv[3].split(",") : Object.keys(R0);
const widths = process.argv[4] ? process.argv[4].split(",").map(Number) : [393, 1440, 1920];
const H = { 393: 852, 1440: 900, 1920: 1080 };
const out = path => `${DIR}/footer-end/${which}-${path}.png`;
fs.mkdirSync(`${DIR}/footer-end`, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const r of routes) for (const w of widths) {
  const ctx = await ctxFor(b, w, H[w] || 900, { which });
  const p = await open(ctx, ROUTES[r]); await ready(p, 5000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, document.documentElement.scrollHeight); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const de = document.documentElement; const sy = scrollY;
    const foot = [...document.querySelectorAll(".hz8-footer")].find(e => e.offsetParent) || document.querySelector("footer");
    const fr = foot ? foot.getBoundingClientRect() : null;
    const docH = de.scrollHeight; const footBottom = fr ? Math.round((fr.bottom + sy) * 10) / 10 : null;
    const footTop = fr ? Math.round((fr.top + sy) * 10) / 10 : null;
    // Element vars ruta når nedanför footern.
    const below = [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.height + r.width > 0 && r.bottom + sy > (footBottom || 1e9) + 0.5 && getComputedStyle(e).position !== "fixed" && !e.closest(".hz8-footer"); })
      .slice(0, 8).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.classList.length ? "." + [...e.classList].slice(0, 2).join(".") : ""} ${Math.round(r.top + sy)}-${Math.round(r.bottom + sy)} ${getComputedStyle(e).position}`; });
    const chain = []; for (let e = foot; e && e !== de; e = e.parentElement) { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); chain.push(`${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.classList.length ? "." + [...e.classList].slice(0, 2).join(".") : ""} b=${Math.round(r.bottom + sy)} pb=${cs.paddingBottom} mb=${cs.marginBottom} bg=${cs.backgroundColor}`); }
    // Strip ovanför footern: färgen 4 px ovanför vs. ytan ovan.
    return { docH, footTop, footBottom, gapBelow: footBottom == null ? null : Math.round((docH - footBottom) * 10) / 10, ov: de.scrollWidth - innerWidth, page: de.getAttribute("data-hz8-page"), cls: de.className, htmlBg: getComputedStyle(de).backgroundColor, bodyBg: getComputedStyle(document.body).backgroundColor, footBg: foot ? getComputedStyle(foot).backgroundColor : null, footMt: foot ? getComputedStyle(foot).marginTop : null, below, chain: chain.slice(0, 6) };
  });
  // Pixelfärger: viewportens sista rad och rad 4 px ovanför footern.
  const shot = await p.screenshot({ path: out(`${r}-${w}`) });
  const vb = await p.evaluate(fb => ({ vh: innerHeight, footTopVp: fb.footTop - scrollY, footBottomVp: fb.footBottom - scrollY }), m);
  rows.push({ which, route: r, w, ...m, ...vb, errors: p.errors.filter(e => !/recaptcha|trustpilot|favicon|ERR_|net::/i.test(e)).slice(0, 3) });
  console.log(JSON.stringify(rows.at(-1)));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/footer-end/${which}-measure${process.argv[3] ? "-" + routes.join("_") : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
