/* Produktbildernas bildtyp (TASK 17B, 2026-11-03; statiskt manifest
   TASK 17C, 2026-11-05). Ett gemensamt, datadrivet bildsystem för kort,
   rälsar och PDP: bildytan behandlas efter bildens typ -- aldrig en
   universell overlay.

     transparent  verkligt frilagt packshot
     white        jämn vit studiobakgrund
     embedded     jämn inbakad bakgrund i annan ton (t.ex. Magic Sauce-beige)
     environment  riktig miljöbild -- visas hel, utan mask
     unverified   bilden finns inte i manifestet -- originalet visas orört

   Typen, kanttonen och tonzonen per sida mäts EN gång ur bildens pixlar
   av theme8/tools/media-manifest.mjs och ligger i HZ8.mediaManifest
   (03b-media-manifest.js), nycklad på bildfilens hash -- samma nyckel för
   alla storlekar Nyehandels CDN levererar. Ingen bild hämtas eller läses
   i besökarens webbläsare, och typen sätts innan bilden laddats (inget
   synligt stilbyte). Resultatet sätts som data-hz8-media + CSS-variabler
   på bildytan (96-product-media.css). */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var KINDS = { t: "transparent", w: "white", e: "embedded", v: "environment" };
  var HASH = /-([0-9a-f]{8})\.(?:jpe?g|png|webp|gif)(?:$|[?#])/i;
  var CONTAINERS = [
    ".product-card__image",           // Nyehandels kort (grid, rälsar, PDP-relaterade)
    ".hz8-bs-card__media",            // startsidans bästsäljarkort
    ".hz8-spot__art",                 // startsidans spotlight
    ".hz8-pcard__media",              // startsidans produkthylla
    "#product-thumbnails .thumb"      // PDP-miniatyrer
  ].join(",");
  var parsed = {};

  /* Bildfilens hash ur både original-URL:en och CDN:ens storleks-URL:er
     (base64-kodad JSON med "key" som första sökvägssegment). */
  function keyOf(src) {
    var m = HASH.exec(src);
    if (m) return m[1];
    try {
      var seg = new URL(src, location.href).pathname.split("/")[1] || "";
      if (seg.indexOf("eyJ") !== 0) return null;
      m = HASH.exec(JSON.parse(atob(seg.replace(/-/g, "+").replace(/_/g, "/"))).key || "");
      return m ? m[1] : null;
    } catch (e) { return null; }
  }
  function lookup(src) {
    var key = keyOf(src);
    if (!key) return { kind: "unverified" };
    if (parsed[key]) return parsed[key];
    var raw = ((HZ8.mediaManifest || {}).images || {})[key];
    var p = raw ? raw.split(" ") : [];
    var res = { kind: KINDS[p[0]] || "unverified" };
    if (p[1]) res.edge = "#" + p[1];
    if (p.length > 5) res.fade = { t: +p[2], r: +p[3], b: +p[4], l: +p[5] };
    return (parsed[key] = res);
  }
  function apply(box, res) {
    box.setAttribute("data-hz8-media", res.kind);
    var f = res.fade;
    if (f && (f.t || f.r || f.b || f.l)) {
      box.style.setProperty("--hz8-mf-t", f.t + "%");
      box.style.setProperty("--hz8-mf-r", f.r + "%");
      box.style.setProperty("--hz8-mf-b", f.b + "%");
      box.style.setProperty("--hz8-mf-l", f.l + "%");
      box.setAttribute("data-hz8-media-fade", "");
    } else {
      ["--hz8-mf-t", "--hz8-mf-r", "--hz8-mf-b", "--hz8-mf-l"].forEach(function (v) { box.style.removeProperty(v); });
      box.removeAttribute("data-hz8-media-fade");
    }
    if (res.edge) box.style.setProperty("--hz8-media-edge", res.edge);
    else box.style.removeProperty("--hz8-media-edge");
  }
  /* Lata bilder: vilken URL som helst till samma bildfil räcker för
     nyckeln, så data-src/srcset läses innan bilden laddats. */
  function srcOf(img) {
    var s = img.currentSrc || img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
    s = s.trim().split(/\s+/)[0];
    return /^data:/.test(s) ? "" : s;
  }
  /* En bildyta: sätt typen för dess aktuella bild (bara när bilden byts). */
  function sync(box, img) {
    img = img || box.querySelector("img");
    if (!img) return;
    var src = srcOf(img);
    if (!src || box.getAttribute("data-hz8-media-src") === src) return;
    box.setAttribute("data-hz8-media-src", src);
    apply(box, lookup(src));
  }
  HZ8.productMedia = { lookup: lookup, sync: sync, apply: apply, keyOf: keyOf };

  /* PDP: den aktiva bilden styr scenen (strainbyte/miniatyr = annan slide). */
  function syncStage() {
    var media = document.querySelector(".product-detail__media");
    if (!media) return;
    var img = media.querySelector("#product-slides .slide.is-active img, #product-slides .slide.active img") || media.querySelector("#product-slides .slide img");
    if (img) sync(media, img);
  }
  function syncIn(node) {
    if (node.matches(CONTAINERS)) sync(node);
    node.querySelectorAll(CONTAINERS).forEach(function (box) { sync(box); });
  }

  /* Endast det som ändrats: tillagda noder, bytt bildkälla och bytt aktiv
     slide. Klick, rullning och övriga DOM-ändringar startar ingen
     omskanning av sidan. */
  var queued = [], stage = false, raf = 0;
  function flush() {
    raf = 0;
    var nodes = queued; queued = [];
    nodes.forEach(function (n) {
      if (!n.isConnected) return;
      if (n.tagName === "IMG") { var box = n.closest(CONTAINERS); if (box) sync(box, n); }
      else syncIn(n);
    });
    if (stage) { stage = false; syncStage(); }
  }
  function queue(n) {
    queued.push(n);
    if (!raf) raf = window.requestAnimationFrame(flush);
  }
  HZ8.register("product-media", function () {
    var root = document.getElementById("store-instance") || document.body;
    syncIn(root);
    syncStage();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i += 1) {
        var m = ms[i], t = m.target;
        if (m.type === "childList") {
          for (var j = 0; j < m.addedNodes.length; j += 1) if (m.addedNodes[j].nodeType === 1) queue(m.addedNodes[j]);
          if (t.closest && t.closest("#product-slides")) stage = true;
        } else if (t.tagName === "IMG") {
          queue(t);
          if (t.closest("#product-slides")) stage = true;
        } else if (t.classList && t.classList.contains("slide") && t.closest("#product-slides")) {
          stage = true;
        }
      }
      if (stage && !raf) raf = window.requestAnimationFrame(flush);
    }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "srcset", "data-src", "class"] });
  });
})();
