// Genererar ett frilagt, skarpt bladverk (smala bambu-/pilliknande blad, inga
// cannabisblad) och en separat varm kastskugga med samma geometri och samma
// ljusriktning (ljus uppe till vänster -> skugga ned/höger). Deterministiskt
// (seedad slump). node leaf-gen.mjs <utkatalog>
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const out = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: true }); const p = await b.newPage();
const res = await p.evaluate(() => {
  let s = 20261117; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const W = 1400, H = 1000;
  /* Kvist med tre noder; vid varje nod en solfjäder av hängande blad
     (som bambu/pil). Bredden varieras för förkortning (blad som vrider sig). */
  const P0 = [60, 980], P1 = [360, 760], P2 = [700, 520], P3 = [1010, 300];
  const stem = t => { const u = 1 - t; return { x: u*u*u*P0[0] + 3*u*u*t*P1[0] + 3*u*t*t*P2[0] + t*t*t*P3[0], y: u*u*u*P0[1] + 3*u*u*t*P1[1] + 3*u*t*t*P2[1] + t*t*t*P3[1] }; };
  const leaves = [];
  const nodes = [[.34, 5, -0.6], [.66, 6, -0.75], [1.0, 7, -0.9]];
  for (const [t, n, dir] of nodes) {
    const b0 = stem(t);
    for (let i = 0; i < n; i++) {
      const spread = (i / (n - 1) - .45) * 2.1;              // ca -0.95 .. +1.15 rad
      const a = dir + spread + (rnd() - .5) * .22;
      const L = 250 + rnd() * 190 - Math.abs(spread) * 40;
      const fore = .45 + rnd() * .55;                        // förkortning
      leaves.push({ x: b0.x + (rnd() - .5) * 14, y: b0.y + (rnd() - .5) * 14, a, L, w: (38 + rnd() * 12) * fore, bend: .12 + rnd() * .22, depth: rnd(), under: fore < .6 });
    }
  }
  leaves.sort((a, b) => a.depth - b.depth);
  const leafPath = (g, f) => {
    // lansettlik form i lokala koordinater (x längs bladet), lätt böjd
    g.beginPath(); g.moveTo(0, 0);
    g.lineTo(f.L * .05, -f.w * .08);
    g.bezierCurveTo(f.L * .18, -f.w * 1.0, f.L * .62, -f.w * .62 + f.bend * f.L * .16, f.L, f.bend * f.L * .3);
    g.bezierCurveTo(f.L * .62, f.w * .42 + f.bend * f.L * .16, f.L * .2, f.w * .78, f.L * .05, f.w * .08);
    g.closePath();
  };
  /* mirror: kvisten spegelvänd, men skuggan faller ändå ned/höger
     (samma ljusriktning som den ospeglade). */
  const make = (shadow, mirror) => {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    if (shadow) { g.filter = "blur(9px)"; g.translate(44, 62); }
    if (mirror) { g.translate(W, 0); g.scale(-1, 1); }
    // stjälk
    g.lineCap = "round";
    g.beginPath(); for (let t = 0; t <= 1.0001; t += .02) { const q = stem(t * .98); t ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
    g.strokeStyle = shadow ? "rgba(96,58,22,.9)" : "#4d5f2a"; g.lineWidth = shadow ? 8 : 7; g.stroke();
    for (const f of leaves) {
      g.save(); g.translate(f.x, f.y); g.rotate(f.a);
      leafPath(g, f);
      if (shadow) { g.fillStyle = "rgba(96,58,22,.92)"; g.fill(); g.restore(); continue; }
      // fyllning: mörkare bas -> motljus mot spetsen, ljusare översida (ljus uppifrån vänster)
      const lg = g.createLinearGradient(0, 0, f.L, 0);
      const dk = (0.72 + f.depth * .28) * (f.under ? 1.08 : 1);
      lg.addColorStop(0, `rgb(${46 * dk|0},${78 * dk|0},${30 * dk|0})`);
      lg.addColorStop(.45, `rgb(${92 * dk|0},${132 * dk|0},${48 * dk|0})`);
      lg.addColorStop(1, f.under ? `rgb(${150 * dk|0},${172 * dk|0},${104 * dk|0})` : `rgb(${168 * dk|0},${190 * dk|0},${86 * dk|0})`);
      g.fillStyle = lg; g.fill();
      // halvan mot ljuset ljusare (genomlysning)
      g.save(); g.clip();
      const sg = g.createLinearGradient(0, -f.w, 0, f.w);
      sg.addColorStop(0, "rgba(255,236,160,.38)"); sg.addColorStop(.5, "rgba(255,236,160,0)"); sg.addColorStop(1, "rgba(20,40,10,.22)");
      g.fillStyle = sg; g.fillRect(0, -f.w * 1.2, f.L * 1.05, f.w * 2.4);
      // parallella nerver
      g.strokeStyle = "rgba(30,50,15,.16)"; g.lineWidth = 1.1;
      for (let k = -2; k <= 2; k++) { if (!k) continue; g.beginPath(); g.moveTo(f.L * .04, k * f.w * .16); g.quadraticCurveTo(f.L * .5, k * f.w * .2 + f.bend * f.L * .1, f.L * .96, f.bend * f.L * .29); g.stroke(); }
      // fin struktur
      for (let n = 0; n < 220; n++) { g.fillStyle = `rgba(${rnd() > .5 ? "255,250,210" : "20,40,10"},${.03 + rnd() * .05})`; g.fillRect(rnd() * f.L, (rnd() - .5) * f.w * 1.8, 1.6, 1.6); }
      g.restore();
      // mittnerv
      g.beginPath(); g.moveTo(2, 0); g.quadraticCurveTo(f.L * .5, f.bend * f.L * .1, f.L * .97, f.bend * f.L * .29);
      g.strokeStyle = "rgba(226,232,160,.55)"; g.lineWidth = 2; g.stroke();
      // ljuskant på den sida som vetter mot ljuset
      leafPath(g, f); g.strokeStyle = "rgba(255,226,150,.35)"; g.lineWidth = 1.2; g.stroke();
      g.restore();
    }
    return c.toDataURL("image/png");
  };
  return { "leaves-l": make(false, false), "shadow-l": make(true, false), "leaves-r": make(false, true), "shadow-r": make(true, true) };
});
for (const [k, v] of Object.entries(res)) fs.writeFileSync(path.join(out, `ms2ml-sprig-${k}-src.png`), Buffer.from(v.split(",")[1], "base64"));
// WebP-varianter i två storlekar (desktop/mobil)
for (const [k] of Object.entries(res)) for (const [w, suf] of [[1400, "1400"], [700, "700"]]) {
  const src = "data:image/png;base64," + fs.readFileSync(path.join(out, `ms2ml-sprig-${k}-src.png`)).toString("base64");
  const url = await p.evaluate(async ([s, w]) => { const im = new Image(); im.src = s; await im.decode(); const c = document.createElement("canvas"); c.width = w; c.height = Math.round(im.naturalHeight * w / im.naturalWidth); const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, 0, 0, c.width, c.height); return c.toDataURL("image/webp", .9); }, [src, w]);
  fs.writeFileSync(path.join(out, `ms2ml-sprig-${k}-${suf}.webp`), Buffer.from(url.split(",")[1], "base64"));
}
await b.close(); console.log("ok");
