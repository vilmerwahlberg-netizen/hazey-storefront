// Build hazey.css + hazey.html (JS source) from the modular css/ and js/
// fragment files, then run hazey.html through terser to produce
// hazey.min.js + hazey.min.html.
//
// css/*.css  -> concatenated in filename order (numeric prefix) -> hazey.css
// js/*.js    -> concatenated in filename order (numeric prefix), wrapped in
//               <script>...</script> -> hazey.html
//
// The js/ fragments are NOT independently valid JS — they are slices of one
// shared function scope (nhBoot). Order matters only for the 00-core-open.js
// (must be first: defines shared helpers + the self-repair patch) and
// 19-core-close.js (must be last: the explicit init*() boot calls + closing
// braces). Every fragment in between is a set of `function initX(){}`
// declarations, which JS hoists — so their relative order does not affect
// correctness. New feature files should be added with a two-digit prefix
// between 00 and 19 (e.g. 04b-my-new-thing.js sorts fine as a string, but
// prefer renumbering neighbors for a clean sequence).
const fs = require("fs");
const path = require("path");
const terser = require("terser");

function concatDir(dir, ext) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort();
  return files.map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("");
}

// ---- CSS ----
const css = concatDir("css", ".css");
fs.writeFileSync("hazey.css", css);
console.log("hazey.css", Buffer.byteLength(css, "utf8"), "bytes (from", fs.readdirSync("css").filter(f=>f.endsWith(".css")).length, "files)");

// ---- JS ----
const jsBody = concatDir("js", ".js");
fs.writeFileSync("hazey.html", jsBody);

let body = jsBody;
body = body.replace(/^﻿?<script>\s*\n/, "").replace(/\n<\/script>\s*$/, "");

terser
  .minify(body, { compress: false, mangle: false, format: { comments: false } })
  .then((r) => {
    if (r.error) {
      console.error("TERSER_ERR", r.error);
      process.exit(1);
    }
    fs.writeFileSync("hazey.min.js", r.code);
    fs.writeFileSync("hazey.min.html", "<script>\n" + r.code + "\n</script>");
    const bytes = Buffer.byteLength(r.code, "utf8");
    console.log("hazey.min.js", bytes, "bytes", bytes < 65535 ? "(fits inline)" : "(external only)");
  });
