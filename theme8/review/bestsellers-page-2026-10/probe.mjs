// Sondering: native DOM för /sv/page/vara-bastsaljare och efter-builden. node probe.mjs [which] [w]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs";
const [which = "after", w = "1440"] = process.argv.slice(2); const W = +w;
const b = await chromium.launch();
const ctx = await ctxFor(b, W, W < 768 ? 852 : 900, { which }); const p = await open(ctx, "/sv/page/vara-bastsaljare"); await ready(p, 8000);
const r = await p.evaluate(() => {
  const skip = document.getElementById("skip-to-main-content");
  const tree = (el, d) => d > 3 ? "" : [...el.children].map(c => "  ".repeat(d) + c.tagName.toLowerCase() + (c.id ? "#" + c.id : "") + (c.className && typeof c.className === "string" ? "." + c.className.trim().split(/\s+/).slice(0, 4).join(".") : "") + (getComputedStyle(c).display === "none" ? " [none]" : "") + "\n" + tree(c, d + 1)).join("");
  return { html: document.documentElement.className, page: document.documentElement.dataset.hz8Page, tree: skip ? tree(skip, 0) : "no skip", crumbs: [...document.querySelectorAll(".designer-breadcrumbs li")].map(l => l.textContent.trim()), cards: document.querySelectorAll("#hz8-bs-grid .product-card").length, more: (document.querySelector(".hz8-bs-more__text") || {}).textContent, tabs: [...document.querySelectorAll(".hz8-pfam__tab")].map(t => t.textContent), h: document.documentElement.scrollHeight };
});
console.log(JSON.stringify({ ...r, tree: undefined }, null, 1)); console.log(r.tree.slice(0, 5000)); console.log("errors", p.errors);
await p.screenshot({ path: `${DIR}/runs/shots/probe-${which}-${W}-first.jpg`, type: "jpeg", quality: 70 });
await p.screenshot({ path: `${DIR}/runs/shots/probe-${which}-${W}.jpg`, fullPage: true, type: "jpeg", quality: 60 });
await b.close();
