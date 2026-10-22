# Motion system

## Thesis

Motion should feel like a well-produced record sleeve coming alive: confident transitions, tactile response, and controlled reveals. It must orient and reward, not turn shopping into a demo reel.

## Decision gate

Most candidates should be rejected. Before proposing motion, answer all four:

1. **Frequency:** high-frequency navigation gets no spatial spectacle; routine controls get only near-immediate feedback; rare focal moments may carry more character.
2. **Purpose:** name feedback, spatial continuity, state indication, explanation, or prevention of a jarring swap. "It looks cool" is not a purpose.
3. **Budget:** routine UI must remain under 300 ms. If an idea only works slowly, it does not belong in the purchase path.
4. **Function:** motion must not move information while the visitor is trying to read, compare, swipe, or buy.

## Hierarchy

1. **Focal motion:** at most one authored signature interaction per surface, such as the hero's physical cube/prism transition.
2. **Continuity:** carousel, accordion, drawer, and shared-state transitions explain where content went.
3. **Feedback:** buttons, links, cards, filters, and cart actions acknowledge input quickly.
4. **Atmosphere:** restrained image or section reveals support scroll rhythm; they are not the design thesis.

## Runtime rules

- Prefer CSS transforms/opacity or Web Animations API in the existing vanilla stack.
- Do not add GSAP, Motion, canvas, WebGL, or a physics library unless the user approves a measured benefit that native code cannot deliver cleanly.
- Never animate layout-driving dimensions during scroll when a transform can express the same relationship.
- Do not apply transforms to children inside horizontal swipe/scroll-snap containers when this risks vertical touch behavior.
- Pause nonessential autoplay when offscreen, when the document is hidden, or after manual interaction for a bounded interval.
- Content is present in initial DOM and visible without JavaScript. Arm hidden reveal states only after the observer system is active.
- Far-below-fold content reveals on approach, not on a global timer after page load.
- `prefers-reduced-motion` removes spatial spectacle while preserving state and feedback.
- Never use `transition: all`. Name the properties that are allowed to animate.
- Trigger-anchored dropdowns, popovers, and panels move from their trigger or entering edge, not an arbitrary center. Modals remain centered.
- Do not enter from `scale(0)`. When scale supports the transition, begin around `0.95–0.98` with opacity.
- Gate hover movement behind `@media (hover:hover) and (pointer:fine)` so touch taps do not leave false hover states.
- Rapidly repeated interactions must retarget from their current state. Prefer CSS transitions or WAAPI over restarting keyframes.
- Exit usually completes faster than entrance. System feedback should feel faster than the deliberate action that triggered it.

## Timing language

- Immediate feedback: 100–160 ms.
- Tooltip or small anchored surface: 125–200 ms.
- Dropdown, select, or routine state change: 150–280 ms.
- Drawer, layout, or carousel continuity: 220–500 ms.
- Authored focal motion: 500–800 ms.

Use confident deceleration such as `cubic-bezier(.16,1,.3,1)` for arrivals or the established Hazey curve `cubic-bezier(.25,.46,.45,.94)` for calm reveals. Avoid `ease-in` for UI entrances and avoid bounce/elastic easing unless the accepted art direction specifically earns it.

## Hazey interaction recipes

- **Buttons and cards:** immediate press acknowledgment around `scale(.98)`; restrained hover lift only on fine pointers. Do not make the whole grid bob.
- **Semi-sticky header:** fixed geometry plus vertical `transform`; never animate height, padding, or document flow. Respect the established scroll-distance threshold and reveal only after meaningful upward intent.
- **Desktop filter dock:** enter horizontally from the left only after the in-flow filters have left view. The dock and original row are never visible together; opening its panel holds the header stable.
- **PDP package and strain selection:** selection feedback may combine border/color with a small content transition, but price, stock, and CTA remain immediately readable. Mixed-package controls must not resize the gallery.
- **Sticky mobile purchase bar:** enter once its source purchase action leaves view, yield to chapter navigation according to the accepted priority, and never cover the footer.
- **Carousels:** motion explains horizontal position and selection. Manual input interrupts cleanly; no forced autoplay; no transforms on swipe-container children that compromise vertical scrolling.
- **Accordions:** preserve spatial continuity without making long SEO content perform a theatrical reveal. State, focus, and anchor position remain stable.

## Hero cube

The complete hero card is a face: image, overlay, copy, CTAs, radius, and visual depth move together. Preserve crop and dimensions; never fake depth with zoom. The next complete face occupies the adjacent side, manual direction is respected, looping normalizes internal rotation, and vertical page scrolling remains native.

## Scroll reveal

Use section-level reveal to articulate chapter changes. Use child stagger only for genuine lists/grids, cap the total delay, and never pre-reveal the full page via a short timeout. The reveal must remain visible once completed. Include failure and reduced-motion fallbacks.

Generic fade-and-rise on every section is not a signature motion. One authored focal transition is worth more than twenty identical reveal effects.

## Verification

Record representative transitions, not only final screenshots. Review them at normal speed and frame-by-frame. Verify interrupted and rapidly repeated input, touch direction lock, keyboard-triggered actions, tab visibility, resize, slow image loading, reduced motion, and low-end mobile behavior. Check the browser performance trace when blur, backdrop-filter, large shadows, or several layers animate together. If removing an effect loses no meaning or character, remove it.
