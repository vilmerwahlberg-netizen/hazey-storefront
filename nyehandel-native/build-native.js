// Build the copy-paste-ready Nyehandel template 8 field files from
// nyehandel-native/source/ into nyehandel-native/dist/.
//
// source/fields/*.html -> one dist/<name>.html per field, copied as-is
//   (these are pasted whole into a Nyehandel admin field, so no
//   concatenation/minification — literal field content, byte for byte).
// source/css/*.css     -> concatenated (fixed order below) -> dist/styles.css
//   (pasted into Nyehandel's native CSS admin field, never Head).
// source/js/*.js        -> concatenated (fixed order below) -> dist/scripts.js
//   (only created if at least one JS source file has real content).
//
// A field or asset file that is empty (or contains only an HTML/CSS/JS
// comment — i.e. a scaffold placeholder for a future round, see
// nyehandel-native/README.md) is skipped and does NOT produce a dist/
// file. This is what makes this the same command to rerun after future
// changes: fill in a currently-empty source file (e.g. source/css/hero.css
// once hero porting starts) and rerun `node build-native.js` — no script
// changes needed, the new content is picked up automatically and a new
// dist/ file appears (or an existing one gains a new section).
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "source");
const DIST = path.join(ROOT, "dist");

fs.mkdirSync(DIST, { recursive: true });

// Marker used verbatim in every not-yet-in-scope scaffold stub (see e.g.
// source/fields/footer.html, source/css/hero.css). A file that carries
// this marker is a placeholder for a future round and never produces
// dist/ output, regardless of what else it contains.
const SCAFFOLD_MARKER = "NOT part of this delivery";

function isScaffoldStub(text) {
  // Comments wrap the marker phrase across lines (see e.g.
  // fields/footer.html: "NOT part of this\n  delivery."), so collapse
  // all whitespace runs to a single space before searching — a plain
  // substring check would miss the line-wrapped phrase.
  return text.replace(/\s+/g, " ").includes(SCAFFOLD_MARKER);
}

// Fields (HTML) are pasted whole into a Nyehandel admin field, so a
// field that is 100% documentation comment (e.g. fields/head.html, an
// intentionally near-empty "clean Head field" deliverable) is still a
// REAL field this round, not a scaffold stub — comment-stripping would
// wrongly treat it as empty. CSS/JS assets are different: a source
// file that is 100% comment truly contributes zero functional
// styling/behavior, so those ARE correctly treated as not-yet-built
// regardless of the scaffold marker.
function hasRealFieldContent(text) {
  if (isScaffoldStub(text)) return false;
  return text.trim().length > 0;
}
function hasRealAssetContent(text) {
  if (isScaffoldStub(text)) return false;
  // CSS and JS source files here only ever use /* ... */ block
  // comments (see the stub files) — no // line comments.
  return text.replace(/\/\*[\s\S]*?\*\//g, "").trim().length > 0;
}

// ---- fields/*.html -> dist/<name>.html (one file per field, verbatim) ----
const fieldsDir = path.join(SRC, "fields");
const fieldFiles = fs.existsSync(fieldsDir)
  ? fs.readdirSync(fieldsDir).filter((f) => f.endsWith(".html")).sort()
  : [];

const builtFields = [];
const skippedFields = [];
for (const file of fieldFiles) {
  const full = path.join(fieldsDir, file);
  const content = fs.readFileSync(full, "utf8");
  if (hasRealFieldContent(content)) {
    fs.writeFileSync(path.join(DIST, file), content);
    builtFields.push(file);
  } else {
    skippedFields.push(file);
  }
}

// Explicit load order (tokens must precede the files that use them, for
// readability — CSS custom properties actually resolve regardless of
// declaration order, but keeping tokens.css first avoids any confusion
// when reading dist/styles.css). A future file not listed here is
// appended after these, alphabetically, so the build never silently
// drops a new file.
const CSS_ORDER = ["tokens.css", "header.css", "hero.css"];
const JS_ORDER = ["header.js", "hero.js"];
function inDeclaredOrder(files, order) {
  const known = order.filter((f) => files.includes(f));
  const rest = files.filter((f) => !order.includes(f)).sort();
  return known.concat(rest);
}

// ---- css/*.css -> dist/styles.css (concatenated, non-empty files only) ----
const cssDir = path.join(SRC, "css");
const cssFiles = fs.existsSync(cssDir)
  ? inDeclaredOrder(fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")), CSS_ORDER)
  : [];

const cssParts = [];
const builtCss = [];
const skippedCss = [];
for (const file of cssFiles) {
  const full = path.join(cssDir, file);
  const content = fs.readFileSync(full, "utf8");
  if (hasRealAssetContent(content)) {
    cssParts.push("/* ---- " + file + " ---- */\n" + content.trimEnd() + "\n");
    builtCss.push(file);
  } else {
    skippedCss.push(file);
  }
}
if (cssParts.length) {
  fs.writeFileSync(path.join(DIST, "styles.css"), cssParts.join("\n"));
}

// ---- js/*.js -> dist/scripts.js (concatenated, non-empty files only) ----
const jsDir = path.join(SRC, "js");
const jsFiles = fs.existsSync(jsDir)
  ? inDeclaredOrder(fs.readdirSync(jsDir).filter((f) => f.endsWith(".js")), JS_ORDER)
  : [];

const jsParts = [];
const builtJs = [];
const skippedJs = [];
for (const file of jsFiles) {
  const full = path.join(jsDir, file);
  const content = fs.readFileSync(full, "utf8");
  if (hasRealAssetContent(content)) {
    jsParts.push("/* ---- " + file + " ---- */\n" + content.trimEnd() + "\n");
    builtJs.push(file);
  } else {
    skippedJs.push(file);
  }
}
if (jsParts.length) {
  fs.writeFileSync(path.join(DIST, "scripts.js"), jsParts.join("\n"));
}

// ---- report ----
console.log("nyehandel-native build");
console.log("  fields built:  ", builtFields.length ? builtFields.join(", ") : "(none)");
console.log("  fields skipped:", skippedFields.length ? skippedFields.join(", ") : "(none)", "(empty/placeholder — not yet in scope)");
console.log("  css built:     ", builtCss.length ? builtCss.join(", ") + " -> dist/styles.css" : "(none)");
console.log("  css skipped:   ", skippedCss.length ? skippedCss.join(", ") : "(none)");
console.log("  js built:      ", builtJs.length ? builtJs.join(", ") + " -> dist/scripts.js" : "(none — no JS needed for native slots yet)");
console.log("  js skipped:    ", skippedJs.length ? skippedJs.join(", ") : "(none)");
