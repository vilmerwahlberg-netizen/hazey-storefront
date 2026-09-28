/* Preview-propagation för Theme 8 (endast förhandsvisning).

   När sidan är öppnad med ?preview=<Theme 8-token> behåller interna
   butikslänkar samma preview-parameter, så att man kan klicka runt i
   hela butiken utan att lämna Theme 8-förhandsvisningen.

   - Aktiveras BARA om den aktuella URL:en innehåller Theme 8:s token
     (läses vid varje interaktion). När Theme 8 är aktivt tema och URL:en
     saknar parametern gör filen ingenting -- ingen rollback behövs.
   - Click-time via event delegation på document (capture): precis innan
     webbläsaren följer en länk (pointerdown / click / Enter / mitten-
     och högerklick) sätts preview på länkens href. Ingen preventDefault,
     så Vue-händelser, Cmd/Ctrl-klick, ny flik och högerklick fungerar
     som vanligt och ingen dubbelnavigation kan uppstå. Dynamiskt skapade
     länkar täcks automatiskt; ingen MutationObserver behövs.
   - Befintliga query-parametrar och hash bevaras; bara "preview" läggs
     till. Allt som inte är en vanlig intern sidlänk lämnas orört.
   Ta bort hela filen för att stänga av funktionen. */
(function () {
  "use strict";

  var TOKEN = "v9kzdmqz4w60l5n"; // Theme 8-previewens token (ALDRIG Theme 6)

  /* Sökvägar där en extra query-parameter kan störa eller inte hör hemma. */
  var SKIP_PATH = /^\/(?:admin|wp-admin|wp-login|frontend-api|api|modules|oauth|auth)(?:\/|$)|\/(?:logout|log-out|signout|sign-out)(?:\/|$)|\/account\/(?:logout|verify|reset)/i;
  var SKIP_EXT = /\.(?:pdf|zip|csv|xlsx?|docx?|pptx?|jpe?g|png|gif|webp|avif|svg|mp4|mov|webm|mp3|json|xml|txt)$/i;

  function active() {
    try { return new URLSearchParams(location.search).get("preview") === TOKEN; } catch (e) { return false; }
  }

  function withPreview(anchor) {
    var raw = anchor.getAttribute("href");
    if (!raw || raw.charAt(0) === "#") return null;               // saknas / ren ankarlänk
    if (anchor.hasAttribute("download")) return null;             // nedladdning
    var url;
    try { url = new URL(raw, location.href); } catch (e) { return null; }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null; // mailto:, tel:, javascript: m.fl.
    if (url.hostname !== location.hostname) return null;         // extern domän (inkl. betalning)
    if (SKIP_PATH.test(url.pathname) || SKIP_EXT.test(url.pathname)) return null;
    var params = url.searchParams;
    if (params.has("preview")) return null;                       // har redan en (egen/annan) preview
    if (params.has("theme") || params.has("theme_id") || params.has("preview_theme")) return null;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return null; // ankare på samma sida
    params.set("preview", TOKEN);
    return url.href;
  }

  function prepare(event) {
    if (!active()) return;
    var target = event.target;
    var anchor = target && target.closest ? target.closest("a[href]") : null;
    if (!anchor) return;
    var next = withPreview(anchor);
    if (next && next !== anchor.href) anchor.setAttribute("href", next);
  }

  function onKey(event) {
    if (event.key === "Enter") prepare(event);
  }

  ["pointerdown", "mousedown", "click", "auxclick", "contextmenu"].forEach(function (type) {
    document.addEventListener(type, prepare, true);
  });
  document.addEventListener("keydown", onKey, true);
})();
