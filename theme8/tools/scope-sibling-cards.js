/* TASK 25c: tillverkarrutan ("Fler buds/hasch från Magic Farmers") på
   Magic Sauce-PDP:erna ska vara SAMMA komponent och kortdesign som D10-
   rutan på Magic Sauce-hubben. Hubbens kortregler (80-category.css,
   81-series-hub.css, 96-product-media.css) är skrivna för kategorisidan:
     html.hz8.hz8-sh-pilot[data-hz8-page="category"] #store-main .hz8-sh ...
   Bygget ger varje sådan kortselektor en PDP-gren:
     :is(<hubbprefix>, :where(html.hz8.hz8-pdp-pilot #store-main .hz8-pp-sibling)) ...
   - :where() bidrar inte till specificiteten, så hubbens regler har exakt
     samma specificitet som förut (ingen ändring på hubben), och PDP-rutan
     får hubbens specificitet -- samma kaskad, samma kort.
   - Bara selektorer vars resterande del gäller kort/rail (TOKEN) berörs;
     hubbens övriga layout (hero, nav, hyllrubriker utanför rutan) gör inte.
   - Nya kortregler i källfilerna följer automatiskt med.
   Källfilerna redigeras som vanligt; den här modulen ändrar bara bygget. */
"use strict";

const PDP_MAIN = "html.hz8.hz8-pdp-pilot #store-main .hz8-pp-sibling";
const PREFIXES = [ // [hubbprefix, PDP-motsvarighet] -- längsta först
  ['html.hz8:is(.hz8-cat-pilot, .hz8-sh-pilot, .hz8-sf)[data-hz8-page="category"] #store-main', PDP_MAIN],
  ['html.hz8.hz8-sh-pilot[data-hz8-page="category"] #store-main .hz8-sh', PDP_MAIN],
  ['html.hz8:not(.hz8-bs-page)[data-hz8-page="category"] #store-main', PDP_MAIN],
  ["html.hz8.hz8-sh-pilot #store-main .hz8-sh", PDP_MAIN],
  ["html.hz8.hz8-sh-pilot #store-main", PDP_MAIN, /^\s+(:is\()?\.hz8-sh-shelf/],
  ["html:is(.hz8-cat-pilot, .hz8-sh-pilot, .hz8-sf)", "html.hz8-pdp-pilot .hz8-pp-sibling"],
  ["html.hz8.hz8-sh-pilot .hz8-sh", "html.hz8.hz8-pdp-pilot .hz8-pp-sibling"],
  ["html.hz8-sh-pilot", "html.hz8-pdp-pilot .hz8-pp-sibling", /^\s+\.hz8-sh-shelf(?!s)/]
];
const TOKEN = /product-card|hz8-pstock|hz8-pcardchip|hz8-psold|hz8-card-pill|hz8-prail|hz8-sh-shelf(?!s)/;
const FILES = ["80-category.css", "81-series-hub.css", "96-product-media.css"];

function splitTop(s) {
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "[") depth += 1;
    if (ch === ")" || ch === "]") depth -= 1;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}

function scopeSelector(sel) {
  const lead = sel.slice(0, sel.length - sel.trimStart().length), s = sel.trim();
  const tail = sel.slice(sel.trimEnd().length);
  for (const [hub, pdp, restTest] of PREFIXES) {
    if (!s.startsWith(hub) || (s.length > hub.length && !" :.[>".includes(s[hub.length]))) continue;
    const rest = s.slice(hub.length);
    if (!TOKEN.test(rest) || (restTest && !restTest.test(rest))) return { sel, n: 0 };
    return { sel: lead + ":is(" + hub + ", :where(" + pdp + "))" + rest + tail, n: 1 };
  }
  return { sel, n: 0 };
}

/* En CSS-fil -> samma fil med PDP-grenar. Hanterar kommentarer, @media/
   @supports-block och selektorlistor; deklarationer lämnas orörda. */
function scopeCss(text) {
  let out = "", buf = "", i = 0, inRule = 0, count = 0;
  while (i < text.length) {
    if (text.startsWith("/*", i)) { const j = text.indexOf("*/", i) + 2; buf += text.slice(i, j); i = j; continue; }
    const ch = text[i];
    if (ch === "{") {
      const m = buf.match(/^(\s*(?:\/\*[\s\S]*?\*\/\s*)*)([\s\S]*)$/);
      let lead = m[1], sel = m[2];
      if (!inRule && !sel.trim().startsWith("@")) {
        sel = splitTop(sel).map((p) => { const r = scopeSelector(p); count += r.n; return r.sel; }).join(",");
      }
      if (!sel.trim().startsWith("@")) inRule += 1;
      out += lead + sel + "{"; buf = ""; i += 1; continue;
    }
    if (ch === "}") { out += buf + "}"; buf = ""; if (inRule) inRule -= 1; i += 1; continue; }
    if (ch === ";" && !inRule) { out += buf + ";"; buf = ""; i += 1; continue; }
    buf += ch; i += 1;
  }
  return { css: out + buf, count };
}

module.exports = { FILES, scopeCss };
