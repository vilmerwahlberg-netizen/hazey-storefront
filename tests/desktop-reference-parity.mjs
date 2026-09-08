#!/usr/bin/env node
// Reusable desktop-reference-parity tool.
//
// Compares the LIVE tema-6-equivalent implementation (real hazeyse.nyehandel.se
// + locally-built hazey.css/hazey.min.js injected, same safe method used
// throughout this project — see CLAUDE.md "KRITISKT") against the LOCKED
// visual reference image, section by section, at real measured pixel
// coordinates (see desktop-reference-parity.config.mjs for how those were
// read off the reference PNG's actual pixels).
//
// Fully independent of tests/parity-sections.mjs / tests/golden(-impl)/ —
// never reads or writes those directories, never gates the mobile facit
// parity suite, and must not be treated as a replacement for it.
//
// Usage:
//   node tests/desktop-reference-parity.mjs [--width=1440] [--out=tests/results/desktop-reference-parity]
//
// Output (per section, under --out/<section-id>/):
//   reference.png       — reference image crop, scaled to --width
//   implementation.png  — live implementation crop at --width
//   side-by-side.png    — reference | implementation, same canvas
//   overlay.png          — 50/50 alpha blend of both
//   diff.png             — pixelmatch diff
// Plus --out/measurements.json and --out/measurements.md (human-readable).
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";
import {
  SECTIONS,
  REFERENCE_IMAGE,
  REFERENCE_NATIVE_WIDTH,
  REFERENCE_NATIVE_HEIGHT,
  IMPL_URL,
  NH_ASSET_BASE_DEV,
  DEFAULT_WIDTH,
  HEIGHT_DEVIATION_FLAG_PCT,
  LANDMARK_DEVIATION_FLAG_PX,
} from "./desktop-reference-parity.config.mjs";
import { readPng, writePngFile, padTo, diffPngBuffers } from "./pixel-diff.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  })
);
const WIDTH = parseInt(args.width || DEFAULT_WIDTH, 10);
const OUT_DIR = path.resolve(ROOT, args.out || "tests/results/desktop-reference-parity");
const SCALE = WIDTH / REFERENCE_NATIVE_WIDTH;

async function acceptCookies(page) {
  for (const t of ["Godkänn alla", "Godkänn", "Acceptera alla"]) {
    try {
      await page.click(`button:has-text("${t}")`, { timeout: 800 });
      break;
    } catch (e) {
      /* not present */
    }
  }
}

async function stripStaleInjectedContent(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".nh-footer").forEach((el) => el.remove());
    const pf = document.querySelector(".page-footer");
    if (pf) pf.style.display = "";
    document.querySelectorAll("style").forEach((el) => {
      if (el.textContent.includes("nh-footer") || el.textContent.includes("--primary-color")) el.remove();
    });
  });
}

async function waitFontsAndImages(page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener("load", res, { once: true });
              img.addEventListener("error", res, { once: true });
              setTimeout(res, 4000);
            })
      )
    );
  });
}

/**
 * The homepage uses a scroll-triggered (IntersectionObserver) reveal system
 * (translateY(24px)+opacity fade, see CLAUDE.md "Reveal/scroll-animation" and
 * tests/parity-sections.mjs settleForCapture) — a page.screenshot({fullPage:
 * true}) stitches the page WITHOUT ever scrolling it the way a real visitor
 * would, so sections below the fold never intersect and stay in their
 * pre-reveal (often opacity:0 / hidden-by-async-fetch-callback) state,
 * producing a blank crop even though the section is really populated (found
 * live: #nh-spotlight measured hidden:false with real fetched product data
 * after scrolling, but rendered fully blank in the first fullPage capture —
 * not a real bug, a capture-methodology gap). Scrolling down in steps before
 * the final screenshot triggers every observer + the async product-fetch
 * callbacks it gates, same as a real visitor scrolling the page once.
 */
async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    const step = 400;
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
  });
  await page.waitForTimeout(1300); // longest reveal transition + stagger, see CLAUDE.md
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

/**
 * The hero has autoplay (see nhInitHeroCarousel) -- caught live: a first
 * full run's header-hero crop showed the SECOND campaign slide (real
 * Magic Sauce product photo + "Upptäck Magic Sauce." copy) instead of the
 * evergreen West Coast slide the locked reference actually depicts,
 * because autoplay advanced the cube during this script's own wait/scroll
 * time. Not a site bug (the real product photo is genuine, correct data
 * for that slide) -- a test-tool reliability gap: comparing the WRONG
 * slide's content against the reference makes the side-by-side/diff
 * images misleading even though the section's measured HEIGHT stays
 * valid either way. Clicking prev/next (see js/18b-homepage-v2.js
 * onManualInteraction) also permanently disables autoplay for the rest
 * of the page's lifetime, so this both fixes the current slide AND
 * prevents it drifting again later during scrollThroughPage.
 */
async function resetHeroToFirstSlide(page) {
  const prevBtn = await page.$(".nh-hero-arrow--prev");
  if (!prevBtn) return; // no carousel controls -- only one slide, nothing to reset
  for (let i = 0; i < 4; i++) {
    const onFirst = await page.evaluate(() => {
      const first = document.querySelector(".nh-hero-slide");
      return first ? first.getAttribute("aria-hidden") === "false" : true;
    });
    if (onFirst) break;
    await prevBtn.click();
    await page.waitForTimeout(500);
  }
}

async function captureImplementation(browser) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push("[pageerror] " + err.message));

  await page.setViewportSize({ width: WIDTH, height: 1000 });
  await page.addInitScript((base) => {
    window.NH_ASSET_BASE = base;
  }, NH_ASSET_BASE_DEV);
  await page.route("**/cdn.jsdelivr.net/gh/Oliverforss8/**", (route) => route.abort());

  const css = fs.readFileSync(path.join(ROOT, "hazey.css"), "utf8");
  const js = fs.readFileSync(path.join(ROOT, "hazey.min.js"), "utf8");

  await page.goto(IMPL_URL, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1000);
  await acceptCookies(page);
  await stripStaleInjectedContent(page);
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: js });
  await page.waitForTimeout(1000);
  await waitFontsAndImages(page);
  await page.waitForTimeout(400);
  await resetHeroToFirstSlide(page);
  await scrollThroughPage(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );

  const bounds = await page.evaluate((sections) => {
    function rectFor(sel) {
      if (!sel) return null;
      const els = Array.from(document.querySelectorAll(sel));
      const el = els.find((e) => e.offsetWidth > 0 || e.offsetHeight > 0) || els[0];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, width: r.width, height: r.height };
    }
    return sections.map((s) => {
      const top = s.implTopSelector ? rectFor(s.implTopSelector) : { top: 0 };
      const bottom = rectFor(s.implBottomSelector);
      return {
        id: s.id,
        top: top ? top.top : null,
        bottom: bottom ? bottom.bottom : null,
        measuredWidth: bottom ? bottom.width : null,
        selectorFound: !!bottom,
      };
    });
  }, SECTIONS);

  // Autoplay's pause-on-interaction is TEMPORARY (scheduleResume(), see
  // js/18b-homepage-v2.js) -- resetting once, earlier, isn't enough: it
  // can resume and advance again during this function's own multi-second
  // wait/scroll time (caught live: the first fix attempt still landed on
  // slide 2 here). Reset again right before the actual screenshot, the
  // one place that matters.
  await resetHeroToFirstSlide(page);
  const fullPageBuffer = await page.screenshot({ fullPage: true });
  await page.close();
  return { fullPageBuffer, bounds, consoleErrors, overflow };
}

async function captureReferenceScaled(browser) {
  const refAbsPath = path.join(ROOT, REFERENCE_IMAGE);
  const scaledHeight = Math.ceil(REFERENCE_NATIVE_HEIGHT * SCALE);
  const page = await browser.newPage();
  await page.setViewportSize({ width: WIDTH, height: scaledHeight });
  // A page loaded via page.setContent() lives on a non-file:// origin, and
  // Chromium blocks a non-file:// document from loading a local file://
  // image (confirmed live: the <img> silently never painted, leaving an
  // almost-blank reference crop — caught by eyeballing the first
  // side-by-side.png output, not guessed). Writing a real temp .html file
  // and navigating to it via file:// puts the document on the SAME file://
  // origin as the image, which Chromium permits.
  const tmpHtml = path.join(OUT_DIR, "_reference-render.html");
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:#fff;}
    img{display:block;width:${WIDTH}px;height:${scaledHeight}px;}
  </style></head><body><img src="file://${refAbsPath}"></body></html>`;
  fs.writeFileSync(tmpHtml, html);
  await page.goto("file://" + tmpHtml);
  await page.evaluate(async () => {
    const img = document.querySelector("img");
    if (!img.complete) await new Promise((res) => img.addEventListener("load", res, { once: true }));
  });
  await page.waitForTimeout(300);
  const fullPageBuffer = await page.screenshot({ fullPage: true });
  await page.close();
  fs.unlinkSync(tmpHtml);
  return { fullPageBuffer, scaledHeight };
}

function cropPngBuffer(buffer, top, bottom) {
  const src = readPng(buffer);
  const y0 = Math.max(0, Math.round(top));
  const y1 = Math.min(src.height, Math.round(bottom));
  const h = Math.max(1, y1 - y0);
  const out = new PNG({ width: src.width, height: h });
  PNG.bitblt(src, out, 0, y0, src.width, h, 0, 0);
  return PNG.sync.write(out);
}

function sideBySide(bufA, bufB) {
  const a = readPng(bufA);
  const b = readPng(bufB);
  const gap = 8;
  const width = a.width + gap + b.width;
  const height = Math.max(a.height, b.height);
  const out = new PNG({ width, height });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255;
    out.data[i + 1] = 0;
    out.data[i + 2] = 255;
    out.data[i + 3] = 255;
  }
  PNG.bitblt(a, out, 0, 0, a.width, a.height, 0, 0);
  PNG.bitblt(b, out, 0, 0, b.width, b.height, a.width + gap, 0);
  return PNG.sync.write(out);
}

function overlayBlend(bufA, bufB) {
  const aRaw = readPng(bufA);
  const bRaw = readPng(bufB);
  const width = Math.max(aRaw.width, bRaw.width);
  const height = Math.max(aRaw.height, bRaw.height);
  const a = padTo(aRaw, width, height, { r: 255, g: 255, b: 255 });
  const b = padTo(bRaw, width, height, { r: 255, g: 255, b: 255 });
  const out = new PNG({ width, height });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = Math.round(a.data[i] * 0.5 + b.data[i] * 0.5);
    out.data[i + 1] = Math.round(a.data[i + 1] * 0.5 + b.data[i + 1] * 0.5);
    out.data[i + 2] = Math.round(a.data[i + 2] * 0.5 + b.data[i + 2] * 0.5);
    out.data[i + 3] = 255;
  }
  return PNG.sync.write(out);
}

async function main() {
  console.log(`desktop-reference-parity: width=${WIDTH}px scale=${SCALE.toFixed(4)} out=${OUT_DIR}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const [refCap, implCap] = await Promise.all([captureReferenceScaled(browser), captureImplementation(browser)]);
  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, "_impl-fullpage.png"), implCap.fullPageBuffer);
  fs.writeFileSync(path.join(OUT_DIR, "_reference-fullpage-scaled.png"), refCap.fullPageBuffer);

  const results = [];
  for (const section of SECTIONS) {
    const dir = path.join(OUT_DIR, section.id);
    fs.mkdirSync(dir, { recursive: true });

    const [refY0, refY1] = section.referenceY;
    const refTopScaled = refY0 * SCALE;
    const refBottomScaled = refY1 * SCALE;
    const refHeightScaled = refBottomScaled - refTopScaled;

    const implBoundsEntry = implCap.bounds.find((b) => b.id === section.id) || {};
    const implTop = section.implTopSelector ? implBoundsEntry.top : 0;
    const implBottom = implBoundsEntry.bottom;
    const implHeight = implTop != null && implBottom != null ? implBottom - implTop : null;

    const refCrop = cropPngBuffer(refCap.fullPageBuffer, refTopScaled, refBottomScaled);
    fs.writeFileSync(path.join(dir, "reference.png"), refCrop);

    let implCrop = null;
    if (implTop != null && implBottom != null) {
      implCrop = cropPngBuffer(implCap.fullPageBuffer, implTop, implBottom);
      fs.writeFileSync(path.join(dir, "implementation.png"), implCrop);
      fs.writeFileSync(path.join(dir, "side-by-side.png"), sideBySide(refCrop, implCrop));
      fs.writeFileSync(path.join(dir, "overlay.png"), overlayBlend(refCrop, implCrop));
      const diff = diffPngBuffers(refCrop, implCrop, { threshold: 0.1 });
      writePngFile(diff.diffPng, path.join(dir, "diff.png"));

      const heightDeviationPct = refHeightScaled ? ((implHeight - refHeightScaled) / refHeightScaled) * 100 : null;
      results.push({
        id: section.id,
        label: section.label,
        selectorFound: implBoundsEntry.selectorFound,
        referenceNativeY: section.referenceY,
        referenceHeightScaledPx: Math.round(refHeightScaled),
        implementationHeightPx: Math.round(implHeight),
        implementationMeasuredWidthPx: implBoundsEntry.measuredWidth ? Math.round(implBoundsEntry.measuredWidth) : null,
        heightDeviationPct: heightDeviationPct != null ? Math.round(heightDeviationPct * 10) / 10 : null,
        diffRatio: Math.round(diff.diffRatio * 10000) / 100,
        flagged:
          (heightDeviationPct != null && Math.abs(heightDeviationPct) > HEIGHT_DEVIATION_FLAG_PCT) ||
          Math.abs(implHeight - refHeightScaled) > LANDMARK_DEVIATION_FLAG_PX,
      });
    } else {
      results.push({
        id: section.id,
        label: section.label,
        selectorFound: false,
        error: `DOM-selektorn '${section.implBottomSelector}' hittades inte i implementationen — sektionen kunde inte mätas.`,
      });
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "measurements.json"), JSON.stringify({ width: WIDTH, scale: SCALE, overflow: implCap.overflow, consoleErrors: implCap.consoleErrors, sections: results }, null, 2));

  const md = [
    `# desktop-reference-parity — mätrapport`,
    ``,
    `Bredd: ${WIDTH}px · skala mot referens: ${SCALE.toFixed(4)} · horisontell overflow: ${implCap.overflow}px · konsolfel: ${implCap.consoleErrors.length}`,
    ``,
    `| Sektion | Ref-höjd (skalad) | Impl-höjd | Avvikelse % | Pixel-diff % | Flaggad |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...results.map((r) =>
      r.error
        ? `| ${r.label} | — | — | — | — | ⚠️ ${r.error} |`
        : `| ${r.label} | ${r.referenceHeightScaledPx}px | ${r.implementationHeightPx}px | ${r.heightDeviationPct}% | ${r.diffRatio}% | ${r.flagged ? "🚩 JA" : "nej"} |`
    ),
    ``,
    `Diff-bilder maskerar INGET (ingen text-/dynamisk-innehåll-maskning implementerad i v1) — en hög pixel-diff% kan alltså bero på förväntad, avsiktlig skillnad (riktiga produktbilder/priser i stället för referensens AI-genererade motiv, klass 2 i projektets 5-klass-taxonomi i CLAUDE.md) snarare än ett verkligt fel. Läs alltid diff.png/side-by-side.png visuellt innan en avvikelse klassas.`,
    implCap.consoleErrors.length
      ? `\n## Konsolfel\n\n${implCap.consoleErrors.map((e) => `- ${e}`).join("\n")}`
      : "",
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "measurements.md"), md);

  console.log(md);
  console.log(`\nKlart. Se ${OUT_DIR} för alla bilder + measurements.json/.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
