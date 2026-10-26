// Vilka CSS-regler styr #sidebar (visibility/left/transform/transition/shadow)?
import { chromium, ctxFor, ROUTES, url } from "./lib.mjs";
const [which = "before", r = "ms-carts", w = "1280"] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await ctxFor(b, +w, 800, { which }); const p = await ctx.newPage();
await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded" });
await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 });
await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate(() => { const sb = document.querySelector("#sidebar"); const out = [];
  for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch { continue; }
    const walk = list => { for (const ru of list) { if (ru.cssRules && !ru.selectorText) { walk(ru.cssRules); continue; } if (!ru.selectorText) continue;
      let m = false; try { m = sb.matches(ru.selectorText); } catch {} if (!m) continue;
      const props = ["visibility", "left", "transform", "transition", "box-shadow", "translate", "display", "pointer-events"].filter(k => ru.style.getPropertyValue(k)).map(k => k + ":" + ru.style.getPropertyValue(k) + (ru.style.getPropertyPriority(k) ? "!" : ""));
      if (props.length) out.push((ss.href || "inline").split("/").pop().slice(0, 30) + " | " + ru.selectorText.slice(0, 90) + " | " + props.join("; ")); } };
    walk(rules); }
  const cs = getComputedStyle(sb); return { cls: sb.className, rules: out, cs: { vis: cs.visibility, left: cs.left, tf: cs.transform, sh: cs.boxShadow, inert: sb.inert, ariaHidden: sb.getAttribute("aria-hidden") }, focusables: sb.querySelectorAll("a[href],button,input").length }; }), null, 1));
await b.close();
