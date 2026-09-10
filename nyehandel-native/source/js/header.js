/* Hazey — native header behavior, Nyehandel template 8.
   Intentionally empty this round: [#navbar]/[#search]/[#account-icon]/
   [#basket-icon]/[#hamburger] are native Nyehandel slots — the platform
   already powers their open/close, dropdown, and mobile-menu behavior
   itself once the slots render. The whole point of the native
   migration is that no custom JS (no DOM cloning/reparenting, no
   external hazey.min.js loader) is needed to reproduce that behavior,
   unlike the current CSS/JS reskin.
   Kept as an empty, ready-to-fill file for later, purely cosmetic
   additions (if any turn out to be needed after live verification in
   Nyehandel admin) — build-native.js skips empty source files, so this
   contributes nothing to dist/ yet. */
