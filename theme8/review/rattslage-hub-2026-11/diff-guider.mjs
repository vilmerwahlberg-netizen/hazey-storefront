// Läser bara: jämför guidernas block i repot med sidorna i Nyehandel, rad för rad,
// så att det syns exakt vad en uppdatering skulle ändra. Kör: node diff-guider.mjs
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
import { api, PAGES } from "../landing-pages-admin-2026-11/nh-pages.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const ROOT = path.resolve(DIR, "../../..");
const ids = { thca: 14, thcb: 15, thch: 16, hhc: 17 }; const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || "/tmp", "nhdiff-"));
for (const [slug, id] of Object.entries(ids)) {
  const r = await api("GET", `/pages/${id}`); const d = r.json?.data || r.json;
  const a = path.join(tmp, slug + ".nyehandel.html"), b = path.join(ROOT, PAGES[slug].file);
  fs.writeFileSync(a, (d.description || "").trimEnd() + "\n");
  let out = ""; try { execFileSync("diff", ["-u", a, b], { encoding: "utf8" }); out = "(identiskt)"; } catch (e) { out = e.stdout; }
  console.log(`===== ${slug} (id ${id}) Nyehandel -> repo =====\n${out.split("\n").filter(l => /^[-+](?![-+])/.test(l)).join("\n")}`);
}
