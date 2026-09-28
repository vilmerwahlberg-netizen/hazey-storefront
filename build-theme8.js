const fs = require("fs");
const path = require("path");
const terser = require("terser");

const ROOT = path.join(__dirname, "theme8");
const OUT = path.join(__dirname, "dist", "theme8");

function concatDir(name, ext) {
  const dir = path.join(ROOT, name);
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .sort()
    .map((file) => fs.readFileSync(path.join(dir, file), "utf8"))
    .join("\n");
}

async function build() {
  fs.mkdirSync(OUT, { recursive: true });

  const css = concatDir("css", ".css");
  const js = concatDir("js", ".js");
  const minified = await terser.minify(js, {
    compress: false,
    mangle: false,
    format: { comments: false }
  });

  if (minified.error || !minified.code) {
    throw minified.error || new Error("Theme 8 produced empty JavaScript");
  }

  fs.writeFileSync(path.join(OUT, "hazey-theme8.css"), css);
  fs.writeFileSync(path.join(OUT, "hazey-theme8.js"), js);
  fs.writeFileSync(path.join(OUT, "hazey-theme8.min.js"), minified.code);
  /* Kassan kör inte temats JS-loader -- den här filen är avsedd att
     klistras in i Theme 8:s CSS-fält (se theme8/blocks/CHECKOUT.md):
     bara tokens + kassans regler, med absoluta bild-URL:er eftersom
     relativa sökvägar inte fungerar i ett inklistrat CSS-fält. */
  const CHECKOUT_ASSET_BASE = process.env.HZ8_CHECKOUT_ASSET_BASE ||
    "https://vilmerwahlberg-netizen.github.io/hazey-storefront/theme8/assets/";
  const checkoutCss = ["00-foundation.css", "01-base.css", "86-checkout.css"]
    .map((file) => fs.readFileSync(path.join(ROOT, "css", file), "utf8"))
    .join("\n")
    .replace(/url\("assets\//g, 'url("' + CHECKOUT_ASSET_BASE);
  fs.writeFileSync(path.join(OUT, "hazey-theme8-checkout.css"), checkoutCss);

  fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), {
    recursive: true,
    force: true
  });

  console.log("Theme 8 build complete:", OUT);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
