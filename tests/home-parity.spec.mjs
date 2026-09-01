// Component-based visual-parity test: startsidan, facit (lokal prototyp)
// vs. implementation (riktiga Nyehandel-sajten + injicerad hazey.css/
// hazey.min.js, skrivskyddad, samma metod som preview.mjs). Sparar
// ingenting till Nyehandel admin.
//
// Två lägen, styrda av PARITY_MODE:
//   PARITY_MODE=update  -> npm run parity:update
//     Besöker ENDAST facit, skriver/uppdaterar tests/golden/<key>.png + .json.
//     Kräver att den lokala facit-servern (localhost:8765) körs.
//   PARITY_MODE=compare (default) -> npm run parity
//     Besöker ENDAST implementationen, jämför varje sektion mot det LÅSTA
//     facit i tests/golden/. Kräver INTE att facit-servern körs.
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  SECTIONS,
  VIEWPORT,
  DEVICE_SCALE_FACTOR,
  GOLDEN_DIR,
  gotoFacit,
  gotoImpl,
  hasHorizontalOverflow,
  measureTops,
  goldenPngPath,
  goldenMetaPath,
  resultDir,
} from "./parity-sections.mjs";
import { diffPngBuffers, writePngFile, readPng } from "./pixel-diff.mjs";

const MODE = process.env.PARITY_MODE === "update" ? "update" : "compare";

// Deliberately NOT test.describe.configure({mode:"serial"}) — serial mode
// skips every remaining test after the first failure, which would hide the
// other 11 sections' real results. workers:1 in playwright.config.mjs
// already keeps these running one at a time in file order; we just don't
// want a failure to short-circuit the rest.
let page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
  if (MODE === "update") {
    await gotoFacit(page);
  } else {
    await gotoImpl(page);
  }
});

test.afterAll(async () => {
  await page?.close();
});

if (MODE === "update") {
  fs.mkdirSync(GOLDEN_DIR, { recursive: true });

  for (const section of SECTIONS) {
    test(`golden: ${section.order}. ${section.label}`, async () => {
      const loc = page.locator(section.facitSelector);
      await expect(loc, `Facit-selektorn "${section.facitSelector}" för "${section.label}" saknas`).toHaveCount(1);

      const box = await loc.boundingBox();
      const buf = await loc.screenshot();
      writePngFile(readPng(buf), goldenPngPath(section.key));
      fs.writeFileSync(
        goldenMetaPath(section.key),
        JSON.stringify(
          {
            key: section.key,
            label: section.label,
            facitSelector: section.facitSelector,
            width: box.width,
            height: box.height,
            top: box.y,
            capturedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
      await test.info().attach(`${section.key}-golden.png`, { body: buf, contentType: "image/png" });
    });
  }

  // Both checks below use their OWN freshly-navigated page rather than the
  // shared, by-now-heavily-scrolled `page` from the capture loop above.
  // Empirically, Chromium starts returning inconsistent (non-monotonic)
  // getBoundingClientRect() values for this facit page's elements after
  // many prior scroll-triggered .screenshot() calls on the same page — a
  // fresh, unscrolled page avoids that entirely. See session report.
  test("facit: sektionsordning (sanity vid update)", async ({ browser }) => {
    const freshPage = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
    await gotoFacit(freshPage);
    const pairs = SECTIONS.map((s) => [s.key, s.facitSelector]);
    const tops = await measureTops(freshPage, pairs);
    await freshPage.close();
    const sorted = [...tops].sort((a, b) => a[1] - b[1]).map((t) => t[0]);
    const actual = tops.map((t) => t[0]);
    expect(actual, "Facits egen sektionsordning matchar inte SECTIONS-listan — uppdatera ordningen i parity-sections.mjs").toEqual(sorted);
  });

  test("facit: ingen horisontell overflow", async ({ browser }) => {
    const freshPage = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
    await gotoFacit(freshPage);
    const overflow = await hasHorizontalOverflow(freshPage);
    await freshPage.close();
    expect(overflow).toBe(false);
  });
} else {
  for (const section of SECTIONS) {
    test(`${section.order}. ${section.label}`, async () => {
      const loc = page.locator(section.implSelector);
      await expect(loc, `Implementation-selektorn "${section.implSelector}" för "${section.label}" saknas`).toHaveCount(1);

      const metaPath = goldenMetaPath(section.key);
      const goldenPath = goldenPngPath(section.key);
      if (!fs.existsSync(metaPath) || !fs.existsSync(goldenPath)) {
        throw new Error(
          `Inget låst facit för "${section.label}" (${section.key}). Kör "npm run parity:update" först.`
        );
      }
      const golden = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      const goldenBuf = fs.readFileSync(goldenPath);

      const box = await loc.boundingBox();
      const actualBuf = await loc.screenshot();

      const dir = resultDir(section.key);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "expected.png"), goldenBuf);
      fs.writeFileSync(path.join(dir, "actual.png"), actualBuf);

      const widthDiff = Math.abs(box.width - golden.width);
      const heightDiff = Math.abs(box.height - golden.height);
      const sizeOk = widthDiff <= section.sizeTolerancePx.w && heightDiff <= section.sizeTolerancePx.h;

      let diffRatio = null;
      let diffOk = true;
      if (section.pixelDiff !== false) {
        const diff = diffPngBuffers(goldenBuf, actualBuf, { threshold: 0.1 });
        diffRatio = diff.diffRatio;
        diffOk = diff.diffRatio <= section.maxDiffRatio;
        writePngFile(diff.diffPng, path.join(dir, "diff.png"));
      }

      const summary = {
        key: section.key,
        label: section.label,
        pixelDiff: section.pixelDiff !== false,
        expected: { width: golden.width, height: golden.height },
        actual: { width: box.width, height: box.height },
        sizeTolerancePx: section.sizeTolerancePx,
        sizeOk,
        diffRatio,
        maxDiffRatio: section.pixelDiff !== false ? section.maxDiffRatio : null,
        diffOk,
        structuralNote: section.structuralNote || null,
        verdict: sizeOk && diffOk ? "PASS" : "FAIL",
      };
      fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify(summary, null, 2));

      console.log(
        `[parity] ${summary.verdict} ${section.key} — expected ${golden.width.toFixed(0)}x${golden.height.toFixed(0)} ` +
          `actual ${box.width.toFixed(0)}x${box.height.toFixed(0)} (tol w:${section.sizeTolerancePx.w} h:${section.sizeTolerancePx.h}) ` +
          (section.pixelDiff !== false
            ? `diff ${(diffRatio * 100).toFixed(1)}% (max ${(section.maxDiffRatio * 100).toFixed(0)}%)`
            : "(structural-only)")
      );

      await test.info().attach(`${section.key}-expected.png`, { path: path.join(dir, "expected.png"), contentType: "image/png" });
      await test.info().attach(`${section.key}-actual.png`, { path: path.join(dir, "actual.png"), contentType: "image/png" });
      if (section.pixelDiff !== false) {
        await test.info().attach(`${section.key}-diff.png`, { path: path.join(dir, "diff.png"), contentType: "image/png" });
      }
      await test.info().attach(`${section.key}-summary.json`, { body: JSON.stringify(summary, null, 2), contentType: "application/json" });

      expect(sizeOk, `Storlek utanför tolerans: förväntad ${golden.width.toFixed(0)}x${golden.height.toFixed(0)}, faktisk ${box.width.toFixed(0)}x${box.height.toFixed(0)} (tolerans w:${section.sizeTolerancePx.w}px h:${section.sizeTolerancePx.h}px)`).toBe(true);
      if (section.pixelDiff !== false) {
        expect(diffOk, `Pixelavvikelse ${(diffRatio * 100).toFixed(1)}% överskrider tröskeln ${(section.maxDiffRatio * 100).toFixed(0)}%`).toBe(true);
      }
    });
  }

  test("implementation: sektionsordning", async ({ browser }) => {
    const freshPage = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
    await gotoImpl(freshPage);
    const pairs = SECTIONS.map((s) => [s.key, s.implSelector]);
    const tops = await measureTops(freshPage, pairs);
    await freshPage.close();
    const sorted = [...tops].sort((a, b) => a[1] - b[1]).map((t) => t[0]);
    const actual = tops.map((t) => t[0]);
    expect(actual, `Sektionerna kommer i fel ordning på implementationen: ${actual.join(" > ")} (förväntat: ${sorted.join(" > ")})`).toEqual(sorted);
  });

  test("implementation: ingen horisontell overflow", async ({ browser }) => {
    const freshPage = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
    await gotoImpl(freshPage);
    const overflow = await hasHorizontalOverflow(freshPage);
    await freshPage.close();
    expect(overflow, "document.documentElement.scrollWidth > clientWidth — horisontell overflow på 390px").toBe(false);
  });
}
