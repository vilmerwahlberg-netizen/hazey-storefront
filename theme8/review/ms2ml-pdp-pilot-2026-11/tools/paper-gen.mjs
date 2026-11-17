// Pappersarkets kontur som statiska SVG:er (deterministisk slump):
// överkant fin deckel, sidor nästan raka, nederkant något rivare.
// Tre filer per storlek: form (mask), kant (1,5 px större, ljus fiberkant) och skugga.
import fs from "node:fs"; import path from "node:path";
const out = process.argv[2];
let s = 7; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
function edge(n, amp, notch) { // n punkter längs en kant, värde i px
  const v = []; let a = 0;
  for (let i = 0; i <= n; i++) { a = a * .55 + (rnd() - .5) * amp; let y = a + Math.sin(i * .07) * amp * .25; if (notch && rnd() < .018) y += amp * (1.2 + rnd()); v.push(y); }
  return v;
}
function build(W, H, m, top, bottom, side, step) {
  const nx = Math.round((W - 2 * m) / step), ny = Math.round((H - 2 * m) / step);
  const T = edge(nx, top, true), B = edge(nx, bottom, true), L = edge(ny, side), R = edge(ny, side);
  const pts = [];
  for (let i = 0; i <= nx; i++) pts.push([m + i * step, m + Math.abs(T[i]) ]);
  for (let i = 1; i <= ny; i++) pts.push([W - m - Math.abs(R[i]), m + i * step]);
  for (let i = nx; i >= 0; i--) pts.push([m + i * step, H - m - Math.abs(B[i])]);
  for (let i = ny - 1; i >= 1; i--) pts.push([m + Math.abs(L[i]), m + i * step]);
  return "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z";
}
const svg = (W, H, d, extra) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" ${extra}/></svg>`;
for (const [name, W, H, m, top, bottom, side, step] of [["desktop", 1360, 330, 5, 2.6, 3.6, .5, 2.5], ["mobile", 390, 440, 4, 2.1, 2.8, .45, 2]]) {
  const d = build(W, H, m, top, bottom, side, step);
  fs.writeFileSync(path.join(out, `ms2ml-paper-${name}.svg`), svg(W, H, d, 'fill="#000"'));
  fs.writeFileSync(path.join(out, `ms2ml-paper-${name}-rim.svg`), svg(W, H, d, 'fill="#000" stroke="#000" stroke-width="3.2" stroke-linejoin="round"'));
  fs.writeFileSync(path.join(out, `ms2ml-paper-${name}-shadow.svg`), svg(W, H, d, 'fill="#5c3c1c"'));
}
console.log("ok");
