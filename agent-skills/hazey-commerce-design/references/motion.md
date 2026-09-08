# Motion system

## Thesis

Motion should feel like a well-produced record sleeve coming alive: confident transitions, tactile response, and controlled reveals. It must orient and reward, not turn shopping into a demo reel.

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

## Timing language

- Immediate feedback: 100–160 ms.
- Routine state change: 160–280 ms.
- Layout or carousel continuity: 280–500 ms.
- Authored focal motion: 500–800 ms.

Use confident deceleration. Avoid bounce/elastic easing unless the accepted art direction specifically earns it.

## Hero cube

The complete hero card is a face: image, overlay, copy, CTAs, radius, and visual depth move together. Preserve crop and dimensions; never fake depth with zoom. The next complete face occupies the adjacent side, manual direction is respected, looping normalizes internal rotation, and vertical page scrolling remains native.

## Scroll reveal

Use section-level reveal to articulate chapter changes. Use child stagger only for genuine lists/grids, cap the total delay, and never pre-reveal the full page via a short timeout. The reveal must remain visible once completed. Include failure and reduced-motion fallbacks.

## Verification

Record representative transitions, not only final screenshots. Verify interrupted input, repeated use, touch direction lock, tab visibility, resize, slow image loading, reduced motion, and low-end mobile behavior. If removing an effect loses no meaning or character, remove it.
