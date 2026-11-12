import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
for (const c of ["a-tidskrift", "b-arkiv", "c-lasflode"]) for (const view of ["index", "article"]) for (const w of [393, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: w < 500 ? 852 : 900 }, deviceScaleFactor: 1 });
  await p.goto(`http://127.0.0.1:8787/concepts/${c}.html?view=${view}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await p.screenshot({ path: `concepts/shots/${c}-${view}-${w}.png`, fullPage: false });
  await p.screenshot({ path: `concepts/shots/${c}-${view}-${w}-full.png`, fullPage: true });
  console.log(c, view, w, "overflowX", ov);
  await p.close();
}
await b.close();
