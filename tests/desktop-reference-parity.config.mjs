// Config for the desktop-reference-parity tool (see
// tests/desktop-reference-parity.mjs). Fully separate from
// tests/parity-sections.mjs / tests/golden(-impl)/ — this tool never reads
// or writes those, and must never be relied on to gate the existing mobile
// facit-parity suite.
//
// REFERENCE_Y is read directly off the reference PNG's real pixels (not
// guessed from the section descriptions) via a column-color-scan script
// (see STATUS.md "desktop-reference-parity — Fas 1" entry for the exact
// method and raw sample dump). Native reference image size: 724x2172px
// (verified with `sips -g pixelWidth -g pixelHeight`).
//
// Method: sampled RGB at x=6 (left margin), x=w/2 (center), x=3w/4, and
// x=w-6 (right margin) at every 2-4px down the image, looking for a
// sustained (not single-row) color-tone change consistent with a real
// section boundary (page background shifting between cream/sand/beige-light
// tones, or a section transitioning into/out of full-bleed photography).
// Boundaries between two sections that share the exact same flat
// background color (Featured Magic Sauce → Verifierade omdömen, both
// plain cream) were instead read from where the reviews section's
// right-column editorial photo starts (a real, unambiguous pixel event),
// since no background-color edge exists there.
export const REFERENCE_IMAGE = "preview/ai-direction/hazey-dadgrass-westcoast-concept-v1.png";
export const REFERENCE_NATIVE_WIDTH = 724;
export const REFERENCE_NATIVE_HEIGHT = 2172;

export const IMPL_URL = "https://hazeyse.nyehandel.se/";

// GitHub Pages dev build (see blocks/loader-dev.html) — same asset base the
// real tema 6 dev-loader sets, so v2/* images referenced by the current
// homepage-v2 code actually resolve instead of silently falling back to the
// pinned production tag (see js/18b-homepage-v2.js NH_ASSET_BASE comment,
// and STATUS.md for the round where this exact gotcha was first hit).
export const NH_ASSET_BASE_DEV = "https://vilmerwahlberg-netizen.github.io/hazey-storefront/assets/";

export const DEFAULT_WIDTH = 1440;

export const SECTIONS = [
  {
    id: "header-hero",
    label: "Header + hero",
    referenceY: [0, 505],
    // Header is position:fixed and visually overlays the hero (negative
    // margin-top pull-up, see nhInitHomeHeroHeader) — for a page-flow
    // screenshot the combined "header+hero" block is the region from the
    // very top of the page down to the bottom of the hero section itself.
    implTopSelector: null, // top = 0 (page top), not measured
    implBottomSelector: "#nhHero",
  },
  {
    id: "populara-serier",
    label: "Populära serier",
    referenceY: [505, 824],
    implTopSelector: "#populara-serier",
    implBottomSelector: "#populara-serier",
  },
  {
    id: "bastsaljare",
    label: "Bästsäljare i lager",
    referenceY: [824, 1191],
    // nhBestsellersHtml() emits <section class="nh-featured" id="nh-featured">
    // — a legacy internal name ("featured"), NOT the same thing as the
    // reference's "Featured Magic Sauce" panel (that's nh-spotlight below).
    implTopSelector: "#nh-featured",
    implBottomSelector: "#nh-featured",
  },
  {
    id: "bonfire",
    label: "Bonfire / Good People Higher Moments",
    referenceY: [1191, 1461],
    implTopSelector: "#nh-bonfire",
    implBottomSelector: "#nh-bonfire",
  },
  {
    id: "trustremsa",
    label: "Trustremsa",
    referenceY: [1461, 1529],
    // .nh-trustblock (yttre sektionen) bär cream-padding runt den
    // faktiska mörkgröna ytan (.nh-tb-inner) -- mäta den yttre sektionen
    // räknade in den ljusa marginalen som "sektionshöjd" och gav en
    // missvisande avvikelsesiffra mot referensens rena, kant-i-kant
    // mörkgröna remsa. Mäter den riktiga inre ytan i stället.
    implTopSelector: ".nh-tb-inner",
    implBottomSelector: ".nh-tb-inner",
  },
  {
    id: "featured-magic-sauce",
    label: "Featured Magic Sauce",
    referenceY: [1529, 1783],
    // nhSpotlightHtml() — kicker text is "Featured" in the current impl.
    implTopSelector: "#nh-spotlight",
    implBottomSelector: "#nh-spotlight",
  },
  {
    id: "reviews",
    label: "Verifierade omdömen + editorial",
    referenceY: [1783, 2042],
    implTopSelector: ".nh-reviews",
    implBottomSelector: ".nh-reviews",
  },
  {
    id: "footer",
    label: "Referensens footer",
    referenceY: [2042, 2172],
    // Confirmed real selector (see tests/tema6-smoke.spec.mjs "startsida:
    // hero + footer renderas") — not guessed.
    implTopSelector: ".nh-footer",
    implBottomSelector: ".nh-footer",
  },
];

// >5% section-height deviation OR >24px landmark deviation at 1440px is a
// reportable flag per the masteruppdrag's own thresholds.
export const HEIGHT_DEVIATION_FLAG_PCT = 5;
export const LANDMARK_DEVIATION_FLAG_PX = 24;
