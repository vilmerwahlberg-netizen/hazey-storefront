// Lokal, skrivskyddad preview: besöker den RIKTIGA publika sajten som en
// vanlig besökare (ingen inloggning, ingen admin, ingen Kodläge-åtgärd) och
// injicerar VÅR lokalt byggda hazey.css + hazey.min.js klient-sidan i en
// Playwright-styrd webbläsarflik. Ingenting sparas till nyehandel — det här
// motsvarar att klistra in samma kod i webbläsarens devtools-konsol.
// Se STATUS.md/CLAUDE.md för varför den här metoden är säker.
import { chromium } from "playwright";
import fs from "fs";

const css = fs.readFileSync("hazey.css", "utf8");
const js = fs.readFileSync("hazey.min.js", "utf8");

async function acceptCookies(p) {
  for (const t of ["Godkänn alla", "Godkänn", "Acceptera alla"]) {
    try { await p.click(`button:has-text("${t}")`, { timeout: 800 }); break; } catch (e) {}
  }
}

async function shoot(p, viewport, label, actions) {
  await p.setViewportSize(viewport);
  await p.waitForTimeout(400);
  if (actions) await actions(p);
  await p.screenshot({ path: `preview/${label}.png`, fullPage: false });
}

fs.mkdirSync("preview", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: false });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
page.on("console", (msg) => console.log("[console." + msg.type() + "]", msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
await page.goto("https://hazeyse.nyehandel.se/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);
await acceptCookies(page);
await page.waitForTimeout(500);

// Lokal QA-asset-bas: pekar mot den redan körande lokala previewservern
// (samma cors_server.py på port 8767 som redan servar prototypens egna
// assets-mapp direkt från sin rot — verifierat 2026-09-01 med curl att
// /hero-westcoast-v4.jpg -> 200, /assets/hero-westcoast-v4.jpg -> 404,
// alltså INGET /assets-suffix här). Sätts INNAN hazey.min.js körs, så att
// nhHeroQfindHtml() läser window.NH_ASSET_BASE i stället för att falla
// tillbaka till produktionens jsDelivr-URL. Rör INTE produktionsvärdet i
// js/18b-homepage-v2.js — bara denna lokala previewkörning.
await page.evaluate(() => {
  window.NH_ASSET_BASE = "http://127.0.0.1:8767/";
});

await page.addStyleTag({ content: css });
await page.addScriptTag({ content: js });
await page.waitForTimeout(800);

await shoot(page, { width: 1400, height: 900 }, "desktop-header-hero");
await shoot(page, { width: 1400, height: 1400 }, "desktop-populara-vagar", async (p) => {
  await p.evaluate(() => document.getElementById("populara-vagar")?.scrollIntoView({ block: "center" }));
});
await shoot(page, { width: 1400, height: 900 }, "desktop-nav-dropdown-vapes", async (p) => {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(150);
  await p.hover('[data-nh-cat="vape"] .cat-link');
  await p.waitForTimeout(200);
});
await shoot(page, { width: 1400, height: 900 }, "desktop-hitta-ratt", async (p) => {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(150);
  await p.click('.cat-link.find');
  await p.waitForTimeout(300);
});
await page.click("#hrClose", { force: true }).catch(() => {});
await page.waitForTimeout(200);

await shoot(page, { width: 390, height: 844 }, "mobile-header-hero");
await shoot(page, { width: 390, height: 900 }, "mobile-menu-open", async (p) => {
  await p.click(".nh-burger", { force: true });
  await p.waitForTimeout(250);
});
await page.click("#nhMobileMenuClose", { force: true }).catch(() => {});

// Lämna fönstret i ett städat, användbart läge om det ska stå kvar öppet —
// tillbaka till desktopbredd och toppen av sidan, inte mitt i en mobiltest-vy.
await page.setViewportSize({ width: 1440, height: 900 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.bringToFront();

console.log("Screenshots sparade i preview/.");
if (process.env.NH_KEEP_OPEN === "1") {
  console.log("Chrome-fönstret lämnas öppet (NH_KEEP_OPEN=1) — stäng det manuellt när du är klar.");
} else {
  await browser.close();
}
