// TASK 20 — granskningsläge: öppnar ett SYNLIGT Chromium-fönster mot Theme 8-previewn där
// Theme 8-CSS/JS levereras från den LOKALA builden (dist/theme8) i den här worktreen.
// Inget pushas och inget i Nyehandel-admin ändras. Kör från worktreens rot:
//   CI=1 node build-theme8.js && node theme8/review/core3-pdp-upsell-2026-11/evidence/open-preview.mjs [393]
// Lägger du något i varukorgen skapas en riktig (tom-bar) testkorg i Nyehandel -- ingen order.
// Stäng fönstret för att avsluta.
import { chromium, ctxFor, open } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const W = +(process.argv[2] || 1440), M = W < 768;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const b = await chromium.launch({ headless: false });
const ctx = await ctxFor(M ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, W, M ? 852 : 900, { which: "after" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml?hz8-pkg-pilot=1");
console.log("Öppen:", p.url(), "\nStäng fönstret när du är klar.");
await new Promise(r => b.on("disconnected", r));
