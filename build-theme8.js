const fs = require("fs");
const path = require("path");
const terser = require("terser");

const ROOT = path.join(__dirname, "theme8");
const OUT = path.join(__dirname, "dist", "theme8");

function concatDir(name, ext, transform) {
  const dir = path.join(ROOT, name);
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .sort()
    .map((file) => { const t = fs.readFileSync(path.join(dir, file), "utf8"); return transform ? transform(file, t) : t; })
    .join("\n");
}

/* TASK 25c: hubbens kortregler får en PDP-gren för tillverkarrutan på
   Magic Sauce-PDP:erna (samma komponent och kort som på hubben). Se
   theme8/tools/scope-sibling-cards.js. */
function siblingCardScope(file, text) {
  const S = require(path.join(ROOT, "tools", "scope-sibling-cards.js"));
  if (S.FILES.indexOf(file) === -1) return text;
  const r = S.scopeCss(text);
  if (!r.count) throw new Error("scope-sibling-cards: inga kortselektorer i " + file);
  return r.css;
}

/* TASK 17C: bildmanifestet (theme8/js/03b-media-manifest.js) uppdateras
   först -- inkrementellt, bara nya produktbilder klassas. I CI, utan nät
   eller utan webbläsare behålls det incheckade manifestet och bygget
   fortsätter; se theme8/tools/media-manifest.mjs. */
function mediaManifest() {
  const { spawnSync } = require("child_process");
  const r = spawnSync(process.execPath, [path.join(ROOT, "tools", "media-manifest.mjs"), "--build"], { stdio: "inherit" });
  if (r.status !== 0) console.warn("bildmanifest: generatorn misslyckades -- använder incheckat manifest");
}

/* TASK 21: kassan kör inte temats JavaScript, så paketradernas kundnamn
   och bildruta kan bara sättas med CSS där. Reglerna genereras ur samma
   tabell som PDP:n och minicarten använder (theme8/js/03c-package-table.js),
   nycklade på paketets egen länk (href). Inga produktbild-URL:er i CSS --
   paketrutan blir en lugn textruta tills paketet har en egen bild i admin. */
function packageCheckoutCss() {
  const vm = require("vm");
  const sandbox = { window: { HZ8: {} } };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js", "03c-package-table.js"), "utf8"), sandbox);
  const T = sandbox.window.HZ8.packageTable || {};
  const q = (t) => JSON.stringify(String(t));
  const S = "body.checkout-page .checkout-items-summary article.item";
  const out = ["/* GENERERAD av build-theme8.js ur theme8/js/03c-package-table.js (TASK 21) -- redigera tabellen, inte detta block. */"];
  Object.keys(T).forEach((pid) => {
    T[pid].packs.forEach((e) => {
      const a = `a[href$=${q(e.route)}]`;
      const name = `${T[pid].label}\u00a0·\u00a0${e.qty}\u2011pack`;
      out.push(
        `${S} ${a} > strong { visibility: hidden; font-size: 0 !important; line-height: 0 !important; }`,
        `${S} ${a} > strong::after { content: ${q(name)}; visibility: visible; display: block; color: var(--hz8-ink); font: 600 18px/1.25 var(--hz8-font-display); }`,
        `${S}:has(${a}) .media img[src$="/images/no-image.png"] { visibility: hidden; }`,
        `${S}:has(${a}) .media { position: relative; }`,
        `${S}:has(${a}) .media::after { content: ${q(e.qty + "×")} / ""; position: absolute; inset: 0; display: grid; place-items: center; border-radius: inherit; background: color-mix(in srgb, var(--hz8-beige) 55%, var(--hz8-surface)); color: var(--hz8-olive); font: 600 24px/1 var(--hz8-font-display); }`
      );
    });
  });
  /* Nyehandels paketdelar upprepar basproduktens namn per rad -- visa
     bara antal och strain ("1 Styck x Gelato - Indica"). Gäller alla
     paketrader (bara de har .item__package). */
  out.push(
    `${S} .item__package__items > div { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 6px; }`,
    `${S} .item__package__items a > strong { display: none !important; }`,
    `${S} .item__package__items .option { margin-top: 0 !important; }`,
    `${S} .item__package__items .option > span { display: none; }`,
    `@media (max-width: 767px) { ${S} a[href*="/products/"] > strong::after { font-size: 16.5px; } }`
  );
  return out.join("\n") + "\n";
}

async function build() {
  fs.mkdirSync(OUT, { recursive: true });
  mediaManifest();

  const css = concatDir("css", ".css", siblingCardScope);
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
  fs.writeFileSync(path.join(OUT, "hazey-theme8-checkout.css"), checkoutCss + "\n" + packageCheckoutCss());

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
