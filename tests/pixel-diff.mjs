// Small PNG/pixelmatch helpers shared by home-parity.spec.mjs. Kept
// separate from parity-sections.mjs so that file stays a pure config/data
// module (section map + page setup), not diffing mechanics.
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "fs";
import path from "path";

export function readPng(buffer) {
  return PNG.sync.read(buffer);
}

export function writePngFile(png, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

/**
 * Pads a PNG onto a canvas of exactly (width, height), anchored top-left,
 * filled with `fill` ({r,g,b}) elsewhere. Needed because pixelmatch
 * requires two equal-size buffers, and expected/actual section screenshots
 * routinely differ in size (that size difference is itself a real,
 * reportable signal — not something to crop away).
 */
export function padTo(png, width, height, fill = { r: 255, g: 0, b: 255 }) {
  const out = new PNG({ width, height });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = fill.r;
    out.data[i + 1] = fill.g;
    out.data[i + 2] = fill.b;
    out.data[i + 3] = 255;
  }
  PNG.bitblt(png, out, 0, 0, Math.min(png.width, width), Math.min(png.height, height), 0, 0);
  return out;
}

/**
 * Diffs two PNG buffers of possibly different sizes. Returns
 * { diffPixels, totalPixels, diffRatio, diffPng }.
 */
export function diffPngBuffers(expectedBuf, actualBuf, { threshold = 0.1 } = {}) {
  const expectedPng = readPng(expectedBuf);
  const actualPng = readPng(actualBuf);
  const width = Math.max(expectedPng.width, actualPng.width);
  const height = Math.max(expectedPng.height, actualPng.height);

  const expectedPadded = padTo(expectedPng, width, height);
  const actualPadded = padTo(actualPng, width, height);
  const diffPng = new PNG({ width, height });

  const diffPixels = pixelmatch(
    expectedPadded.data,
    actualPadded.data,
    diffPng.data,
    width,
    height,
    { threshold, includeAA: false }
  );

  const totalPixels = width * height;
  return {
    diffPixels,
    totalPixels,
    diffRatio: totalPixels ? diffPixels / totalPixels : 0,
    diffPng,
    expectedSize: { width: expectedPng.width, height: expectedPng.height },
    actualSize: { width: actualPng.width, height: actualPng.height },
    canvasSize: { width, height },
  };
}
