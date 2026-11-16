// SEO-paritet: gamla https://www.hazey.se/thcb/ (serverns HTML, hämtas läsande)
// mot nya theme8/blocks/thcb.html + föreslagen title/meta (verify.mjs).
// Mäter bara vad som står var i levererad HTML. Det säger ingenting om
// varför den gamla sidan rankar; det är en jämförelse av innehåll.
// Kör: node theme8/review/thcb-knowledge-2026-11/seo-parity.mjs
import fs from "node:fs"; import path from "node:path";
import { TITLE, META } from "./verify.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const BLOCK = fs.readFileSync(path.join(DIR, "../../blocks/thcb.html"), "utf8");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const ent = s => s.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#8211;|&ndash;/g, "–").replace(/&#8217;/g, "’").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const text = h => ent(h.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/g, " ").replace(/<\/?span[^>]*>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const all = (h, re) => [...h.matchAll(re)].map(m => text(m[1]));

function outline(html, { title, meta }) {
  const noComments = html.replace(/<!--[\s\S]*?-->/g, "");
  return {
    title, meta: meta || "",
    h1: all(noComments, /<h1[^>]*>([\s\S]*?)<\/h1>/g),
    h2: all(noComments, /<h2[^>]*>([\s\S]*?)<\/h2>/g),
    h3: all(noComments, /<h3[^>]*>([\s\S]*?)<\/h3>/g),
    faq: all(noComments, /<summary[^>]*>([\s\S]*?)<\/summary>/g),
    p: all(noComments, /<(?:p|dd|li)[^>]*>([\s\S]*?)<\/(?:p|dd|li)>/g),
    links: [...noComments.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({ href: m[1], text: text(m[2]) })),
    words: text(noComments).split(/\s+/).filter(Boolean).length
  };
}

// Gammal sida: bara innehållsdelen (H1 "THCB" till sidfotens "Betala Tryggt"), utan meny och sidfot.
const res = await fetch("https://www.hazey.se/thcb/", { headers: { "user-agent": UA } });
const oldHtml = await res.text();
const oldTitle = text((oldHtml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
const oldMeta = (oldHtml.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/) || [])[1] || "";
const start = oldHtml.search(/<h1[^>]*>(?:\s|<[^>]+>)*THCB(?:\s|<[^>]+>)*<\/h1>/); const end = oldHtml.indexOf("Betala Tryggt");
const oldMain = oldHtml.slice(start, end);
// Artikelutdragen (22 st, samma på många sidor) räknas separat från sidans egen text.
const exStart = oldMain.indexOf("Här nedan är korta utdrag"), exEnd = (() => { const i = oldMain.indexOf("Är THCB säkert?"); return i < 0 ? -1 : oldMain.lastIndexOf("<h3", i); })();
const oldOwn = exStart > 0 && exEnd > exStart ? oldMain.slice(0, exStart) + oldMain.slice(exEnd) : oldMain;
const OLD = outline(oldOwn, { title: oldTitle, meta: oldMeta });
OLD.wordsInclExcerpts = outline(oldMain, {}).words;
const NEW = outline(BLOCK, { title: TITLE, meta: META });

const has = (s, re) => re.test(s);
const T = { thcb: /\bthcb\b/i, thcB: /\bthc b\b/i, thcDashB: /\bthc-b\b/i, vape: /\bvape|\bvapes\b|vapen/i, hash: /\bhasch|\bhash\b/i, sverige: /\bsverige\b/i };
const QUERIES = [
  ["thcb", "480 / 3 585", s => has(s, T.thcb)],
  ["thc b", "119 / 396", s => has(s, T.thcB)],
  ["thc-b", "59 / 302", s => has(s, T.thcDashB)],
  ["thcb vape", "58 / 586", s => (has(s, T.thcb) || has(s, T.thcDashB)) && has(s, T.vape)],
  ["thcb hash", "28 / 155", s => (has(s, T.thcb) || has(s, T.thcDashB)) && has(s, T.hash)],
  ["thcb sverige", "18 / 499", s => (has(s, T.thcb) || has(s, T.thcDashB)) && has(s, T.sverige)]
];
const where = (o, test) => {
  const out = [];
  if (test(o.title)) out.push("title"); if (test(o.meta)) out.push("meta");
  if (o.h1.some(test)) out.push("H1"); if (o.h2.some(test)) out.push(`H2×${o.h2.filter(test).length}`);
  if (o.h3.some(test)) out.push(`H3×${o.h3.filter(test).length}`); if (o.faq.some(test)) out.push(`FAQ×${o.faq.filter(test).length}`);
  const ps = o.p.filter(test).length; if (ps) out.push(`stycken×${ps}`);
  const ls = o.links.filter(l => test(l.text)).length; if (ls) out.push(`länktext×${ls}`);
  return out.join(", ") || "–";
};
const rows = QUERIES.map(([q, gsc, test]) => ({ q, gsc, old: where(OLD, test), new: where(NEW, test) }));
const internal = o => [...new Set(o.links.map(l => l.href).filter(h => /^\/|hazey\.se/.test(h)).map(h => h.replace(/^https?:\/\/(www\.)?hazey\.se/, "")))];
const result = {
  fetched: new Date().toISOString(), oldStatus: res.status,
  identity: {
    old: { title: OLD.title, meta: OLD.meta || "(saknas)", h1: OLD.h1, h2: OLD.h2, h3: OLD.h3, words: OLD.words, wordsInclExcerpts: OLD.wordsInclExcerpts, internalLinks: internal(OLD).length },
    new: { title: NEW.title, meta: NEW.meta, h1: NEW.h1, h2: NEW.h2, h3: NEW.h3, faq: NEW.faq, words: NEW.words, internalLinks: internal(NEW).length, externalSources: NEW.links.filter(l => /^https?:/.test(l.href) && !/hazey/.test(l.href)).length }
  },
  queries: rows,
  links: { old: internal(OLD), new: internal(NEW) }
};
fs.writeFileSync(path.join(DIR, "seo-parity.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result.identity, null, 1));
console.table(rows);
