// SEO-regression efter mobilkorrigeringen: blockets initiala HTML mot KARTLAGGNING.md
// och mot blocket före korrigeringen (git: 7913ef1). Läser bara filer.
import fs from "node:fs"; import path from "node:path"; import { execSync } from "node:child_process";
import { TITLE, META, SLUG } from "./verify.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const now = fs.readFileSync(path.join(DIR, "../../blocks/rattslage.html"), "utf8");
const before = execSync("git show 7913ef1:theme8/blocks/rattslage.html", { cwd: DIR, encoding: "utf8" });
const karta = fs.readFileSync(path.join(DIR, "KARTLAGGNING.md"), "utf8");
const plain = h => h.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const links = h => [...h.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<a [^>]*href="([^"]+)"/g)].map(m => m[1]);
const P = plain(now);
const r = {
  htmlIdentical: now === before,
  h1: (now.match(/<h1>([^<]*)<\/h1>/) || [])[1],
  titleInKarta: karta.includes(TITLE.replace(/\|/g, "\\|")), metaInKarta: karta.includes(META), slug: SLUG,
  queries: {
    "laglig cannabis": P.includes("Finns det laglig cannabis i Sverige?") && P.includes("Lagen undantar hampa av vissa EU-godkända sorter"),
    "lagliga droger 2026": P.includes("Klassningarna sedan 2023") && P.includes("14 juli 2026") && P.includes("Kontrollerad mot förordningarna 16 november 2026"),
    "cannabinoider sverige": P.includes("Cannabinoider i Sverige"),
    "lagliga cannabinoider": P.includes("Vilka cannabinoider är lagliga i Sverige?") && P.includes("Vilka cannabinoider är narkotika eller hälsofarliga varor i Sverige")
  },
  rows: (now.match(/<tr data-hz8-terms/g) || []).length,
  guideLinks: ["/sv/page/thca", "/sv/page/thcb", "/sv/page/thch", "/sv/page/hhc"].map(g => [g, links(now).filter(h => h === g).length]),
  linksBefore: links(before).length, linksNow: links(now).length,
  textBefore: plain(before).length, textNow: P.length
};
console.log(JSON.stringify(r, null, 1)); fs.writeFileSync(path.join(DIR, "seo-regression.json"), JSON.stringify(r, null, 1));
