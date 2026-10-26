// TASK 01F -- runtime-diagnos av semi-sticky-headern. Per animationsram:
// hz8-header-hidden, headerns beräknade transform (translateY), transition-
// värden och getAnimations(). Visar om övergången faktiskt interpoleras.
// node diag.mjs before|after|external 393,1440 [route] [reduce]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import { webkit } from "playwright"; import fs from "node:fs";
const ENGINE = process.env.ENGINE || "chromium";
const which = process.argv[2] || "after";
const widths = (process.argv[3] || "393,1440").split(",").map(Number);
const route = process.argv[4] || "alla-vapes";
const reduce = process.argv[5] === "reduce";
const browser = await (ENGINE === "webkit" ? webkit : chromium).launch();
const out = [];
for (const w of widths) {
  const ctx = await ctxFor(browser, w, w < 768 ? 852 : 900, { which });
  const p = await open(ctx, ROUTES[route]);
  if (reduce) await p.emulateMedia({ reducedMotion: "reduce" });
  await ready(p, 3000);
  const r = await p.evaluate(async () => {
    const h = document.getElementById("store-header"), html = document.documentElement;
    const cs = getComputedStyle(h);
    const static_ = {
      reduceMQ: matchMedia("(prefers-reduced-motion: reduce)").matches,
      position: cs.position, transitionProperty: cs.transitionProperty, transitionDuration: cs.transitionDuration,
      transitionTimingFunction: cs.transitionTimingFunction, transitionDelay: cs.transitionDelay,
      transform: cs.transform, willChange: cs.willChange,
      glassBg: getComputedStyle(h.querySelector(".main"), "::before").backgroundColor,
      backdrop: getComputedStyle(h.querySelector(".main"), "::before").backdropFilter
    };
    // Matchande regler för transition/transform på #store-header (källa).
    const rules = [];
    for (const sh of document.styleSheets) {
      let rs; try { rs = sh.cssRules; } catch { continue; }
      const walk = list => { for (const r of list) { if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; } if (!r.selectorText) continue; try { if (!h.matches(r.selectorText)) continue; } catch { continue; } const t = r.style.getPropertyValue("transition") || r.style.getPropertyValue("transition-duration") || r.style.getPropertyValue("transition-property"); const tf = r.style.getPropertyValue("transform"); if (t || tf) rules.push({ sel: r.selectorText.slice(0, 120), src: (sh.href || "inline").split("/").pop().split("?")[0], transition: r.style.getPropertyValue("transition"), prio: r.style.getPropertyPriority("transition") || r.style.getPropertyPriority("transition-duration"), transform: tf, media: r.parentRule && r.parentRule.conditionText || "" }); } };
      walk(rs);
    }
    window.scrollTo(0, 400); await new Promise(r => setTimeout(r, 600));
    const log = []; const t0 = performance.now();
    let y = 400;
    const ty = () => { const m = getComputedStyle(h).transform; if (m === "none") return 0; const v = m.match(/matrix(3d)?\(([^)]+)\)/)[2].split(",").map(Number); return Math.round(v.length === 16 ? v[13] : v[5]); };
    await new Promise(res => {
      const step = () => {
        const t = performance.now() - t0;
        // 0-300 ms upp (visar), 300-800 vila, 800-1400 ned 6 px/ram,
        // 1400-1700 vila, 1700-2100 upp 6 px/ram, sedan vila.
        if (t < 300) y -= 4; else if (t > 800 && t < 1400) y += 6; else if (t > 1700 && t < 2100) y -= 6;
        window.scrollTo(0, y);
        log.push({ t: Math.round(t), y: Math.round(scrollY), hidden: html.classList.contains("hz8-header-hidden"), ty: ty(), anims: h.getAnimations().map(a => a.transitionProperty || a.animationName).join(",") });
        if (t < 2700) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    const firstHide = log.findIndex(l => l.t > 800 && l.hidden), firstShow = log.findIndex((l, i) => i > firstHide && !l.hidden);
    const settle = (from, target) => { for (let i = from; i < log.length; i++) if (Math.abs(log[i].ty - target) < 1) return log[i].t - log[from].t; return null; };
    const hiddenTy = Math.min(...log.map(l => l.ty));
    const intermediateHide = firstHide < 0 ? 0 : log.slice(firstHide, firstHide + 40).filter(l => l.ty < -1 && l.ty > hiddenTy + 1).length;
    const intermediateShow = firstShow < 0 ? 0 : log.slice(firstShow, firstShow + 40).filter(l => l.ty < -1 && l.ty > hiddenTy + 1).length;
    return { static_, rules, hiddenTy, hideAt: firstHide >= 0 ? log[firstHide].t : null, hideSettleMs: firstHide >= 0 ? settle(firstHide, hiddenTy) : null, showSettleMs: firstShow >= 0 ? settle(firstShow, 0) : null, intermediateHide, intermediateShow, log };
  });
  out.push({ which, w, route, reduce, ...r, errors: p.errors });
  console.log(JSON.stringify({ which, w, route, reduce, ...r.static_, hiddenTy: r.hiddenTy, hideSettleMs: r.hideSettleMs, showSettleMs: r.showSettleMs, intermediateHide: r.intermediateHide, intermediateShow: r.intermediateShow, rules: r.rules }));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/diag-${ENGINE}-${which}-${route}-${widths.join("_")}${reduce ? "-reduce" : ""}.json`, JSON.stringify(out, null, 1));
await browser.close();
