// TASK 10B-4 -- jämförelseblad i proof/ ur runs/shots.
// node sheet.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SH = `${DIR}/runs/shots`, OUT = `${DIR}/proof`, REF = path.resolve(DIR, "../pdp-universal-redesign-2026-10"), FAR = path.resolve(DIR, "../pdp-final-handoff-2026-10");
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 72 }); await p.close(); fs.unlinkSync(tmp);
}
const R = { 88: "R1 enkel utan paket · CBD 30 % Tequila Sunrise (id 88)", 91: "R2 strain, PDF per strain, delvis slut · Magic Sauce 99 % 2 ml (id 91)", 84: "R3 familj, verifierad PDF, Fler i serien · Samurai Jack (id 84)", 17: "R4 slutsåld, Vikt · Great White Shark (id 17)" };
// Helsidor R1–R4: före (generisk mall) | efter (universell adapter)
for (const id of [88, 91, 84, 17]) for (const w of [393, 1440])
  await sheet(`full-R-${id}-${w}`, `${R[id]} · ${w}px · helsida`, [["FÖRE (6ab37b5, generisk mall)", `${SH}/before-${id}-${w}-full.jpg`], ["EFTER (universell adapter)", `${SH}/after-final-${id}-${w}-full.jpg`]], w < 768 ? 1000 : 1900);
// Accepterad riktning -> efter (91 = samma produkt som faithful-referensen)
await sheet("faithful-vs-after-1440", "Faithful-referensen (Magic Sauce, med paketpriser ur mockup) | efter (riktiga data, paket BLOCKED) · 1440 helsida", [["FACIT faithful-1440-full.png", `${REF}/faithful-1440-full.png`], ["EFTER id 91", `${SH}/after-final-91-1440-full.jpg`]], 1900);
await sheet("faithful-vs-after-393", "Faithful-referensen | efter · 393 helsida", [["FACIT faithful-393-full.png", `${REF}/faithful-393-full.png`], ["EFTER id 91", `${SH}/after-final-91-393-full.jpg`]], 1000);
await sheet("faithful-vs-after-first", "Första vy: faithful | efter (1440 och 393)", [["FACIT 1440", `${REF}/faithful-1440.png`], ["EFTER 1440", `${SH}/after-final-91-1440-first.jpg`], ["FACIT 393", `${REF}/faithful-393.png`], ["EFTER 393", `${SH}/after-final-91-393-first.jpg`]], 1900);
await sheet("faraoh-57", "Faraoh (id 57, accepterad pilot): före | efter -- regression", [["FÖRE 1440", `${SH}/before-57-1440-full.jpg`], ["EFTER 1440", `${SH}/after-final-57-1440-full.jpg`], ["FÖRE 393", `${SH}/before-57-393-full.jpg`], ["EFTER 393", `${SH}/after-final-57-393-full.jpg`]], 1900);
// Första vy, bredder
for (const id of [88, 91, 84, 17]) {
  await sheet(`widths-mobile-${id}`, `${R[id]} · första vy 320 / 430 / 768`, [["320", `${SH}/after-final-${id}-320-first.jpg`], ["430", `${SH}/after-final-${id}-430-first.jpg`], ["768", `${SH}/after-final-${id}-768-first.jpg`]], 1500);
  await sheet(`widths-desktop-${id}`, `${R[id]} · första vy 1280 / 1512 / 1920 / 200 %`, [["1280", `${SH}/after-final-${id}-1280-first.jpg`], ["1512", `${SH}/after-final-${id}-1512-first.jpg`], ["1920", `${SH}/after-final-${id}-1920-first.jpg`], ["200 % zoom", `${SH}/after-final-${id}-1440-z200-first.jpg`]], 1900);
}
// Tillstånd
await sheet("state-sticky-393", "Mobil köpzon (91 @393): vila | CTA lämnat vyn -> sticky | kapitel -> docka i stället", [["Vila", `${SH}/after-state-sticky-rest-393.jpg`], ["Sticky köpzon", `${SH}/after-state-sticky-on-393.jpg`], ["Kapiteldocka", `${SH}/after-state-dock-on-393.jpg`]], 1500);
await sheet("state-variant-out", "Slutsåld strain vald (91): Bevaka i stället för köp, PDF följer strain", [["393", `${SH}/after-state-variant-out-91-393.jpg`], ["1440", `${SH}/after-state-variant-out-91-1440.jpg`]], 1900);
for (const id of [91, 84]) for (const w of [393, 1440]) {
  const n = id === 91 ? 3 : 3;
  await sheet(`package-review-${id}-${w}`, `Paket i spärrat granskningsläge (?hz8-pkg-review=1) · id ${id} · ${w}px · BLOCKED`, Array.from({ length: n }, (_, i) => [`Steg ${i + 1}`, `${SH}/after-pkgreview-${id}-${w}-step${i + 1}.jpg`]), w < 768 ? 1500 : 1900);
}
await sheet("stale-sold-out", "Tar slut efter sidladdning (84): köpzonen blir Slutsåld, inget i varukorgen", ["state-zero", "sold-normal", "button-removed"].flatMap(m => [[`${m} 393`, `${SH}/after-stale-${m}-393.jpg`], [`${m} 1440`, `${SH}/after-stale-${m}-1440.jpg`]]).slice(0, 6), 1900);
// Övriga kontroller
const OTH = { 2: "Färg (CCELL M3 Plus)", 87: "doft -> Strain, utan omdömen/analys", 78: "delvis slut, rea", 92: "cart, PDF per strain", 72: "lång titel", 3: "saknad bild, slutsåld", 119: "rea, felkopplad PDF dold", 27: "slutsåld cart", 20: "tjänstepost utan varumärke: ingen adapter" };
for (const id of Object.keys(OTH)) await sheet(`control-${id}`, `Kontroll id ${id} · ${OTH[id]} · före | efter (1440 och 393)`, [["FÖRE 1440", `${SH}/before-${id}-1440-first.jpg`], ["EFTER 1440", `${SH}/after-final-${id}-1440-first.jpg`], ["FÖRE 393", `${SH}/before-${id}-393-first.jpg`], ["EFTER 393", `${SH}/after-final-${id}-393-first.jpg`]], 1900);
// Regression
for (const [k, t] of [["category", "Alla Vapes"], ["hub", "Magic Sauce-hubben"], ["search", "Sök"]]) for (const w of [393, 1440])
  await sheet(`reg-${k}-${w}`, `Regression · ${t} · ${w}px · före | efter`, [["FÖRE", `${SH}/before-reg-${k}-${w}.jpg`], ["EFTER", `${SH}/after-reg-${k}-${w}.jpg`]], w < 768 ? 1000 : 1900);
await sheet("reg-cart-checkout", "Regression · varukorg och kassa · före | efter", [["FÖRE varukorg", `${SH}/before-reg-cart-1440.jpg`], ["EFTER varukorg", `${SH}/after-reg-cart-1440.jpg`], ["FÖRE kassa", `${SH}/before-reg-checkout-1440.jpg`], ["EFTER kassa", `${SH}/after-reg-checkout-1440.jpg`]], 1900);
await b.close(); console.log(fs.readdirSync(OUT).length, "blad");
