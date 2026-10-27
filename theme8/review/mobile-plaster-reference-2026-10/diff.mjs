// TASK 01D -- pixeldiff före/efter för utsnitt som ska vara oförändrade
// (desktop, seriehubb, serie x format). node diff.mjs <suffix,..>
import fs from "node:fs"; import { PNG } from "pngjs"; import pixelmatch from "pixelmatch"; import { DIR } from "./lib.mjs";
const S = `${DIR}/runs/shots`; const out = [];
for (const f of fs.readdirSync(S).filter(f => f.startsWith("before-") && f.endsWith(".png"))) {
  const a = f.replace(/^before-/, "after-"); if (!fs.existsSync(`${S}/${a}`)) continue;
  const A = PNG.sync.read(fs.readFileSync(`${S}/${f}`)), B = PNG.sync.read(fs.readFileSync(`${S}/${a}`));
  if (A.width !== B.width || A.height !== B.height) { out.push({ f, sizeDiff: [A.width, A.height, B.width, B.height] }); continue; }
  const n = pixelmatch(A.data, B.data, null, A.width, A.height, { threshold: .1 });
  out.push({ f: f.replace(/^before-/, ""), changedPx: n, pct: +(100 * n / (A.width * A.height)).toFixed(3) });
}
console.table(out); fs.writeFileSync(`${DIR}/runs/diff.json`, JSON.stringify(out, null, 1));
