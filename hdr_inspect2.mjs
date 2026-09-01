import { chromium } from 'playwright';

async function run(viewport, label) {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport, deviceScaleFactor: 1 });
  await p.goto('https://hazeyse.nyehandel.se/', { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(2000);
  for (const t of ['Godkänn alla', 'Godkänn', 'Acceptera alla']) {
    try { await p.click(`button:has-text("${t}")`, { timeout: 800 }); break; } catch (e) {}
  }
  await p.waitForTimeout(500);

  const info = await p.evaluate(() => {
    function outer(sel, max) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const html = el.outerHTML;
      return html.length > (max || 4000) ? html.slice(0, max || 4000) + '…[TRUNCATED]' : html;
    }
    const sh = document.querySelector('#store-header');
    const links = Array.from(document.querySelectorAll('#store-header nav.navbar a, #store-header .navbar a'))
      .map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.getAttribute('href') }))
      .filter(l => l.text);
    const searchEl = sh ? sh.querySelector('input[type="search"], input[type="text"], form[action*="search"], .search, [class*="search"]') : null;
    return {
      hasStoreHeader: !!sh,
      mainLeft: outer('#store-header .main .left', 1500),
      mainCenter: outer('#store-header .main .center', 2500),
      mainRight: outer('#store-header .main .right', 2000),
      topbar: outer('#store-header .topbar', 2000),
      navbarOuterStart: outer('#store-header nav.navbar', 6000),
      searchElOuter: searchEl ? searchEl.outerHTML.slice(0, 800) : null,
      navLinks: links.slice(0, 40),
      hamburgerCandidates: Array.from(document.querySelectorAll('#store-header button, #store-header [class*="burger"], #store-header [class*="toggle"]'))
        .map(b => ({ cls: b.className, aria: b.getAttribute('aria-label'), text: b.textContent.trim().slice(0,30) })),
      cartCandidates: Array.from(document.querySelectorAll('#store-header [id*="cart" i], #store-header [class*="cart" i], #store-header [class*="basket" i]'))
        .map(b => ({ tag: b.tagName, id: b.id, cls: b.className })),
      accountCandidates: Array.from(document.querySelectorAll('#store-header [id*="account" i], #store-header [class*="account" i], #store-header [href*="account" i], #store-header [href*="login" i]'))
        .map(b => ({ tag: b.tagName, id: b.id, cls: b.className, href: b.getAttribute('href') })),
    };
  });
  console.log('===== ' + label + ' =====');
  console.log(JSON.stringify(info, null, 2));
  await b.close();
}

await run({ width: 1400, height: 900 }, 'DESKTOP 1400px');
await run({ width: 390, height: 844 }, 'MOBILE 390px');
