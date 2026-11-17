// Pappersark v2: lätt sliten kant runt om -- låg, mjuk vågighet (arket är
// inte helt plant), fina fibrer och enstaka små hack. Kortsidorna är också
// lätt ojämna men lugnare än lång- sidorna. Deterministisk (seedad).
import fs from "node:fs"; import path from "node:path";
const out = process.argv[2];
let s = 20261117; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
function edge(n, fine, wave, notchP) {
  const ph = rnd() * 6.28, ph2 = rnd() * 6.28, v = []; let a = 0;
  for (let i = 0; i <= n; i++) {
    a = a * .5 + (rnd() - .5) * fine;                         // fina fibrer
    let y = Math.abs(a) + wave * (1 + Math.sin(i / n * 6.28 * 1.7 + ph) * .55 + Math.sin(i / n * 6.28 * 4.3 + ph2) * .25); // mjuk vågighet
    if (rnd() < notchP) y += fine * (1.2 + rnd() * 1.4);      // litet hack
    v.push(y);
  }
  return v;
}
function build(W, H, m, top, bottom, side, step) {
  const nx = Math.round((W - 2 * m) / step), ny = Math.round((H - 2 * m) / step);
  const T = edge(nx, top[0], top[1], .012), B = edge(nx, bottom[0], bottom[1], .016), L = edge(ny, side[0], side[1], .006), R = edge(ny, side[0], side[1], .006);
  const pts = [];
  for (let i = 0; i <= nx; i++) pts.push([m + i * step, m + T[i]]);
  for (let i = 1; i <= ny; i++) pts.push([W - m - R[i], m + i * step]);
  for (let i = nx; i >= 0; i--) pts.push([m + i * step, H - m - B[i]]);
  for (let i = ny - 1; i >= 1; i--) pts.push([m + L[i], m + i * step]);
  return "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z";
}
const svg = (W, H, d, extra) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" ${extra}/></svg>`;
// [namn, W, H, marginal, [fin, våg] överkant, [fin, våg] nederkant, [fin, våg] sidor, steg]
for (const [name, W, H, m, top, bottom, side, step] of [["desktop", 1360, 300, 7, [2.4, 1.6], [3.0, 2.0], [.9, .9], 2.5], ["mobile", 390, 400, 5, [2.0, 1.1], [2.4, 1.4], [.8, .7], 2]]) {
  const d = build(W, H, m, top, bottom, side, step);
  fs.writeFileSync(path.join(out, `ms2ml-paper-${name}-v2.svg`), svg(W, H, d, 'fill="#000"'));
  fs.writeFileSync(path.join(out, `ms2ml-paper-${name}-v2-rim.svg`), svg(W, H, d, 'fill="#000" stroke="#000" stroke-width="2.4" stroke-linejoin="round"'));
  fs.writeFileSync(path.join(out, `ms2ml-paper-${name}-v2-shadow.svg`), svg(W, H, d, 'fill="#5c3c1c"'));
}
console.log("ok");
