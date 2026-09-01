// Reusable, read-only typography and icon comparison utilities extracted
// from the mobile header calibration work (2026-09-01, see STATUS.md
// "Mobilheader: sista strikta kalibreringsomgången"). Every real
// deviation found across that round's several passes traced back to one
// of two repeatable failure classes:
//
//   1. Nyehandel's native, !important-tagged tag-level CSS resets
//      (font-family/size/weight/line-height/letter-spacing on
//      body,p,li,span,input,button,label,td,a) silently winning over our
//      own non-!important text rules — invisible in a screenshot diff
//      until you actually read getComputedStyle() on both sides.
//   2. Hand-copied SVG icon paths/stroke-widths that were never diffed
//      against facit's real <path d> data, so a "close enough by eye"
//      icon shipped with the wrong geometry.
//
// These helpers make both checks mechanical and repeatable for every
// future component blueprint (see tests/blueprints/) instead of
// re-deriving the same live-inspection scripts from scratch each round.
// Read-only: nothing here writes to a page, a golden file, or production
// code — callers decide what to do with the returned diff.

export const TYPOGRAPHY_PROPERTIES = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "color",
  "opacity",
];

/**
 * Reads the full typography signature of `selector` (relative to the
 * whole document) via getComputedStyle — never getBoundingClientRect()
 * math, never a value read out of source CSS. Optionally also reads any
 * descendants matching `childSelectors` (e.g. a `<b>` or `<a>` nested
 * inside a text row), keyed by the selector string used to find them, so
 * a single call captures an entire text node's real signature including
 * its inline-emphasis children. Returns `{ self, children }`; `self` is
 * `null` if `selector` doesn't match anything.
 */
export async function measureTypography(page, selector, childSelectors = []) {
  return page.evaluate(
    ({ selector, childSelectors, props }) => {
      function read(el) {
        if (!el) return null;
        const cs = getComputedStyle(el);
        const out = {};
        for (const p of props) out[p] = cs[p];
        out.text = el.textContent.trim().slice(0, 80);
        return out;
      }
      const el = document.querySelector(selector);
      const result = { self: read(el), children: {} };
      for (const csel of childSelectors) {
        result.children[csel] = el ? read(el.querySelector(csel)) : null;
      }
      return result;
    },
    { selector, childSelectors, props: TYPOGRAPHY_PROPERTIES }
  );
}

/**
 * Diffs two measureTypography() results property-by-property. Returns an
 * array of `{ node, property, facit, impl }` for every mismatch — an
 * empty array means an exact typographic match on every property this
 * module checks. `node` is `"self"` or the child selector string that was
 * passed to measureTypography, so a caller can say immediately which
 * element diverged without re-deriving it.
 */
export function diffTypography(facit, impl) {
  const mismatches = [];
  function compareNode(node, f, i) {
    if (!f && !i) return;
    if (!f || !i) {
      mismatches.push({ node, property: "(existence)", facit: !!f, impl: !!i });
      return;
    }
    for (const p of TYPOGRAPHY_PROPERTIES) {
      if (f[p] !== i[p]) mismatches.push({ node, property: p, facit: f[p], impl: i[p] });
    }
  }
  compareNode("self", facit.self, impl.self);
  const keys = new Set([...Object.keys(facit.children || {}), ...Object.keys(impl.children || {})]);
  for (const k of keys) compareNode(k, facit.children?.[k], impl.children?.[k]);
  return mismatches;
}

export const ICON_PROPERTIES = ["viewBox", "renderedWidth", "renderedHeight", "fill", "stroke", "strokeWidth"];

/**
 * Reads an icon's full geometry+style signature: SVG viewBox, attribute
 * and rendered width/height, computed fill/stroke/stroke-width, every
 * `<path d>` (and basic-shape equivalents) inside it when the markup is
 * ours to inspect, and its vertical placement relative to its immediate
 * parent's box (a practical baseline-alignment proxy — good enough to
 * catch "icon sits N px off from the text it sits next to", not a
 * typographically exact font-baseline calculation).
 *
 * `selector` may point at the `<svg>` itself or at a wrapper containing
 * exactly one `<svg>` (e.g. an icon span) — both are resolved the same way.
 */
export async function measureIcon(page, selector) {
  return page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const svg = el.tagName.toLowerCase() === "svg" ? el : el.querySelector("svg");
    if (!svg) return { found: false };
    const rect = svg.getBoundingClientRect();
    const cs = getComputedStyle(svg);
    const paths = Array.from(svg.querySelectorAll("path, circle, rect, polygon, line")).map((p) => ({
      tag: p.tagName.toLowerCase(),
      d: p.getAttribute("d"),
      cx: p.getAttribute("cx"),
      cy: p.getAttribute("cy"),
      r: p.getAttribute("r"),
      x1: p.getAttribute("x1"),
      y1: p.getAttribute("y1"),
      x2: p.getAttribute("x2"),
      y2: p.getAttribute("y2"),
    }));
    const parent = el.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    return {
      found: true,
      viewBox: svg.getAttribute("viewBox"),
      attrWidth: svg.getAttribute("width"),
      attrHeight: svg.getAttribute("height"),
      renderedWidth: rect.width,
      renderedHeight: rect.height,
      fill: cs.fill,
      stroke: cs.stroke,
      strokeWidth: cs.strokeWidth,
      color: cs.color,
      paths,
      offsetTopFromParent: parentRect ? rect.top - parentRect.top : null,
      offsetCenterYFromParentCenterY: parentRect
        ? rect.top + rect.height / 2 - (parentRect.top + parentRect.height / 2)
        : null,
    };
  }, selector);
}

/**
 * Diffs two measureIcon() results. `comparePathData` defaults to true —
 * set it to false when the icon markup on the implementation side is NOT
 * ours (see PLATFORM_MANAGED_SELECTORS below) and comparing raw path data
 * would just document a difference we're not allowed to fix, not find a
 * real bug.
 */
export function diffIcon(facit, impl, { comparePathData = true } = {}) {
  const mismatches = [];
  if (!facit?.found || !impl?.found) {
    mismatches.push({ property: "(existence)", facit: !!facit?.found, impl: !!impl?.found });
    return mismatches;
  }
  for (const p of ICON_PROPERTIES) {
    if (String(facit[p]) !== String(impl[p])) mismatches.push({ property: p, facit: facit[p], impl: impl[p] });
  }
  if (comparePathData) {
    const fp = JSON.stringify(facit.paths);
    const ip = JSON.stringify(impl.paths);
    if (fp !== ip) mismatches.push({ property: "path-data", facit: facit.paths, impl: impl.paths });
  }
  const baselineDiff = Math.abs(
    (facit.offsetCenterYFromParentCenterY ?? 0) - (impl.offsetCenterYFromParentCenterY ?? 0)
  );
  if (baselineDiff > 1) {
    mismatches.push({
      property: "baseline-offset",
      facit: facit.offsetCenterYFromParentCenterY,
      impl: impl.offsetCenterYFromParentCenterY,
    });
  }
  return mismatches;
}

/**
 * Selectors/DOM regions genuinely owned by Nyehandel's own Vue app — not
 * ours to mutate for pixel parity, because Vue's own re-render silently
 * overwrites the change on the next state update. Concrete incident this
 * documents: the header's empty-cart "0" badge and the account/cart icon
 * markup, both deliberately left un-mutated across every mobile-header
 * calibration round (see tests/blueprints/mobile-header-port.md §A and
 * STATUS.md) precisely because they live inside this kind of node.
 *
 * Extend this list as new platform-managed regions are identified in
 * future blueprints — don't silently work around one without adding it
 * here first, so the next blueprint author doesn't have to rediscover it.
 */
export const PLATFORM_MANAGED_SELECTORS = [
  "#store-header .right .cart-button", // Vue cart icon + conditional badge
  "#store-header .right .account", // Vue account icon
  "#cartAside", // Vue cart drawer, re-rendered on every cart mutation
];

export function isPlatformManaged(selector) {
  return PLATFORM_MANAGED_SELECTORS.some((s) => selector === s || selector.startsWith(s + " "));
}

/**
 * The five closing classes every remaining visual deviation must be
 * sorted into before a component can be approved — see CLAUDE.md
 * "Klassificering av kvarvarande avvikelser" for the full rule and
 * tests/blueprints/mobile-header-port.md "KORRIGERING 3" for worked
 * examples of each. A passing diffRatio/size-tolerance check is not
 * itself a classification — "Ett grönt procenttest räcker inte ensamt."
 */
export const DEVIATION_CLASSES = {
  FIXABLE: "korrigerbar implementation",
  DYNAMIC_CONTENT: "dynamiskt innehåll",
  PLATFORM_MANAGED: "plattformshanterad funktion",
  BROWSER_RENDERING: "webbläsarens textrendering",
  PRODUCT_DECISION: "medvetet produktbeslut",
};
