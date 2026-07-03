// Build hazey.min.js + hazey.min.html from hazey.html (the JS source).
// terser with compress:false + mangle:false keeps the output predictable
// (names/strings intact) — required because the code is written mangle-safe
// for the platform's global-JS field. Run: `npm run build`.
const terser = require("terser");
const fs = require("fs");

let body = fs.readFileSync("hazey.html", "utf8");
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
