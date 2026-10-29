// Sammanfattning av runs/verify-*.json (verify.mjs): en rad per steg.
import fs from "node:fs";
for (const f of process.argv.slice(2)) { const R = JSON.parse(fs.readFileSync(f)); console.log("=== " + f);
  for (const [k, v] of Object.entries(R)) { if (v.error) { console.log(k, "ERROR", v.error.slice(0, 150)); continue; }
    const bar = x => x ? (x.hidden ? "dold" : x.cta) : "ingen";
    if (k.startsWith("soldout")) console.log(k, "out", v.top.out, "| synlig köp", v.top.enabledBuyVisible.length + v.scrolled.enabledBuyVisible.length, "fokuserbar köp", v.top.enabledBuyFocusable.length, "| köpbar", bar(v.scrolled.buybar), "| Tab till köp", v.tabBuy.length, "| varukorgsanrop", v.cartPosts, "| pris", v.top.price, "liknande", v.top.similar, "| CLS", v.top.cls, "overflow", v.top.overflowX, "H1", v.top.h1, "fel", v.errors.length);
    else if (k.startsWith("variants")) console.log(k, v.chose.join(" -> "), "| slutsåld variant: out", v.soldVariant.out, "köpbar", bar(v.soldVariant.buybar), "synlig/fokuserbar köp", v.soldVariant.enabledBuyVisible.length + "/" + v.soldVariant.enabledBuyFocusable.length, "| köpbar variant: out", v.okVariant.out, "köpknapp fokuserbar", v.okVariant.nativeBuy && v.okVariant.nativeBuy.focusable, "köpbar", bar(v.okVariant.buybar), "| fel", v.errors.length);
    else if (k.startsWith("history")) console.log(k, Object.entries(v).filter(([a]) => /20|84/.test(a)).map(([a, s]) => a + ":" + (s.out ? "Slutsåld" : "köpbar") + "/synligKöp" + s.enabledBuyVisible).join(" "), "fel", v.errors.length);
    else if (k.startsWith("buy")) console.log(k, v.chose || "", v.via, "anrop", JSON.stringify(v.cartPosts), "klick->POST ms", v.clickToPostMs, "låda", JSON.stringify(v.drawer), "fel", v.errors.length);
    else if (k.startsWith("stale")) console.log(k, "via", v.via, "| anrop", JSON.stringify(v.cartPosts), "rader i korgen", v.cartRows ?? "-", "| efter: out", v.after.out, "köpbar", bar(v.after.buybar), "synlig köp", v.after.enabledBuyVisible.length, "fel", v.errors.length);
    else console.log(k, JSON.stringify(v)); } }
