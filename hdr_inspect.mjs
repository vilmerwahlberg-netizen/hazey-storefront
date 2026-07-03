import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await p.goto('https://hazeyse.nyehandel.se/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.waitForTimeout(2500);
for (const t of ['Godkänn alla','Godkänn','Acceptera alla']) { try { await p.click(`button:has-text("${t}")`, { timeout: 800 }); break; } catch(e){} }
const info = await p.evaluate(()=>{
  const sh = document.querySelector('#store-header');
  const cs = sh ? getComputedStyle(sh) : {};
  const navlink = document.querySelector('#store-header .navbar-link:not(.is-arrowless)');
  const after = navlink ? getComputedStyle(navlink, '::after') : null;
  const main = document.querySelector('#store-header .main');
  const navbar = document.querySelector('#store-header .navbar');
  return {
    storeHeaderPos: cs.position, storeHeaderTop: cs.top, storeHeaderZ: cs.zIndex,
    mainPos: main? getComputedStyle(main).position : null,
    navbarPos: navbar? getComputedStyle(navbar).position : null,
    navlinkText: navlink? navlink.textContent.trim().slice(0,20): null,
    navlinkPadRight: navlink? getComputedStyle(navlink).paddingRight : null,
    caretRight: after? after.right : null, caretPos: after? after.position : null,
    bodyScrollHeight: document.body.scrollHeight,
  };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
