// TASK 01D-R (kopia av 01D:s shoot.mjs + utsnittet "cmp": förankrat i
// quizkortets/sökfältets underkant, -230..+290 px, för facit/före/efter).
// TASK 01D -- övergången hero -> produkter på de fyra hz8-cat-pilot-
// familjerna. Per rutt/bredd: utsnitt runt heronederkanten, valfri
// helsida genom footern, geometri för hero/guide-CTA/verktygsrad/första
// kort, överflöd och konsolfel.
// node shoot.mjs before|after <route,..> <width,..> [full] [zoom]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", rs = "alla-vapes", ws = "393", full = "", zoom = ""] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const z = zoom ? 2 : 0;
  // 200 % zoom = halverad CSS-viewport med DPR 2 (1440 px-fönster -> 720 px CSS).
  const cw = z ? w / 2 : w;
  const ctx = await ctxFor(b, cw, z ? 450 : (w < 768 ? 852 : 900), { which, zoom: z });
  const p = await open(ctx, ROUTES[route]); await ready(p, 5000);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })); await p.waitForTimeout(400);
  const g = await p.evaluate(() => {
    const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) }; };
    const html = document.documentElement, pl = document.querySelector(".hz8-cat-hero__plaster"), art = document.querySelector(".hz8-cat-hero__art");
    return { cls: [...html.classList].filter(c => /cat-pilot|cat-portal|sh-pilot|hz8-sf|series-hub/.test(c)).join(" "), shell: html.getAttribute("data-hz8-shell"),
      hero: R(".hz8-cat-hero"), anchor: R(".hz8-pguide") || R(".hz8-pq"), art: R(".hz8-cat-hero__art"), guide: R(".hz8-pguide"), guideCta: R(".hz8-pguide a, .hz8-pguide button"), tool: R(".hz8-ptool"), card: R(".product-card, .hz8-card, .product-list .product"),
      artMask: art && getComputedStyle(art).maskImage.slice(0, 80), artBg: art && getComputedStyle(art).backgroundImage.split("/").pop().slice(0, 60),
      plasterBefore: pl && getComputedStyle(pl, "::before").content, plasterMask: pl && getComputedStyle(pl).maskImage.slice(0, 60),
      overflowX: html.scrollWidth > innerWidth + 1, count: (document.querySelector(".hz8-pcount") || {}).textContent || "",
      // Kontroller ovanpå/under kanten ska träffas av ett tryck i mitten.
      vw: innerWidth, hits: ["guideCta", "filterBtn"].map(k => { const e = k === "guideCta" ? document.querySelector(".hz8-pguide a, .hz8-pguide button") : document.querySelector(".hz8-ptool__filter, .hz8-ptool button"); if (!e) return k + ":none"; const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return k + ":offscreen"; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return k + ":" + (t && (t === e || e.contains(t)) ? "ok" : "BLOCKED " + (t && t.className)); }) };
  });
  const tag = `${which}-${route}-${w}${z ? "-z200" : ""}`;
  if (g.hero) {
    const mob = cw < 768, y0 = Math.max(0, g.hero.bottom - (mob ? 320 : 260)), h = mob ? 470 : 420;
    await p.screenshot({ path: `${OUT}/${tag}-edge.png`, clip: { x: 0, y: y0, width: cw, height: h }, fullPage: true });
  }
  if (cw < 768 && g.anchor) await p.screenshot({ path: `${OUT}/${tag}-cmp.png`, clip: { x: 0, y: Math.max(0, g.anchor.bottom - 230), width: cw, height: 520 }, fullPage: true });
  if (cw >= 768) await p.screenshot({ path: `${OUT}/${tag}-top.png` });
  if (full) {
    // Lazy-bilder laddas: scrolla igenom sidan först.
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 120)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${tag}-full.jpg`, fullPage: true, type: "jpeg", quality: 60, scale: "css" });
  }
  const row = { which, route, w, zoom: !!z, ...g, errors: p.errors }; rows.push(row); console.log(JSON.stringify(row));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/shoot-${which}${process.env.TAG ? "-" + process.env.TAG : ""}-${rs.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}${full ? "-full" : ""}${zoom ? "-z200" : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
