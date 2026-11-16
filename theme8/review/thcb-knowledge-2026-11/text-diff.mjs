// Textdiff R2 -> R3: synlig text (utan kommentarer) per mening, rubriker,
// FAQ, länkar och ankare. Kör: node .../text-diff.mjs <r2.html> [r3.html]
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const [a, b = path.join(DIR, "../../blocks/thcb.html")] = process.argv.slice(2);
const ent = s => s.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
const strip = h => h.replace(/<!--[\s\S]*?-->/g, "");
const txt = h => ent(strip(h).replace(/<\/?span[^>]*>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const sentences = h => [...new Set(strip(h).split(/<\/(?:p|li|dd|dt|summary|h[1-6]|strong|a)>/).map(x => txt(x)).join(" ").split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 2))];
const pick = (h, re) => [...strip(h).matchAll(re)].map(m => txt(m[1] || m[0]));
const info = h => ({
  h1: pick(h, /<h1[^>]*>([\s\S]*?)<\/h1>/g), h2: pick(h, /<h2[^>]*>([\s\S]*?)<\/h2>/g), h3: pick(h, /<h3[^>]*>([\s\S]*?)<\/h3>/g),
  faq: pick(h, /<summary[^>]*>([\s\S]*?)<\/summary>/g),
  links: [...new Set([...strip(h).matchAll(/href="([^"]+)"/g)].map(m => m[1]))],
  ids: [...new Set([...strip(h).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))],
  words: txt(h).split(" ").length, sentences: sentences(h)
});
const A = info(fs.readFileSync(a, "utf8")), B = info(fs.readFileSync(b, "utf8"));
const diff = k => ({ removed: A[k].filter(x => !B[k].includes(x)), added: B[k].filter(x => !A[k].includes(x)) });
const out = { words: { r2: A.words, r3: B.words }, h1: diff("h1"), h2: diff("h2"), h3: diff("h3"), faq: diff("faq"), links: diff("links"), ids: diff("ids"), sentences: diff("sentences") };
fs.writeFileSync(path.join(DIR, "text-diff-r2-r3.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
