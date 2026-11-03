/* Produktbildernas bildtyp (TASK 17B, 2026-11-03). Ett gemensamt,
   datadrivet bildsystem för kort, rälsar och PDP: varje produktbild
   klassas ur sina egna pixlar (Nyehandels CDN skickar
   Access-Control-Allow-Origin: *) och bildytan behandlas efter typen --
   aldrig en universell overlay.

     transparent  verkligt frilagt packshot (minst halva kanten genomskinlig)
     white        jämn vit studiobakgrund
     embedded     jämn inbakad bakgrund i annan ton (t.ex. Magic Sauce-beige)
     environment  riktig miljöbild (ojämn kant) -- visas hel, utan mask
     unverified   bilden kunde inte läsas -- originalet visas orört

   För white/embedded mäts produktens marginal mot varje kant (pixlar som
   avviker från kanttonen). Kanten tonas ut i bildytan BARA inom den
   marginalen, med säkerhetsavstånd -- produktens pixlar ändras aldrig och
   inget frilägges eller ritas om. Saknas marginal på en sida tonas den
   sidan inte. Resultatet sätts som data-hz8-media + CSS-variabler på
   bildytan (96-product-media.css). Cache per bild-URL i sessionStorage. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var SIZE = 128;             // analysupplösning (kanten = 2 px-ring = 1,6 %)
  var UNIFORM = 16;           // p90 avvikelse i kantringen (0-255)
  var FG = 30;                // pixel = produkt när den avviker mer än så
  var SAFE = 0.012;           // säkerhetsavstånd mellan tonzon och produkt
  var MAX_FADE = 0.12;        // tonzonen är högst 12 % av bildsidan
  var KEY = "hz8-media-v2:";
  var memo = {};
  var CONTAINERS = [
    ".product-card__image",           // Nyehandels kort (grid, rälsar, PDP-relaterade)
    ".hz8-bs-card__media",            // startsidans bästsäljarkort
    ".hz8-spot__art",                 // startsidans spotlight
    ".hz8-pcard__media",              // startsidans produkthylla
    "#product-thumbnails .thumb"      // PDP-miniatyrer
  ].join(",");

  function pct(x) { return Math.round(x * 1000) / 10 + "%"; }
  function analyse(img) {
    var c = document.createElement("canvas");
    c.width = SIZE; c.height = SIZE;
    var x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0, SIZE, SIZE);
    var d = x.getImageData(0, 0, SIZE, SIZE).data;
    var ring = [], clear = 0;
    for (var j = 0; j < SIZE; j += 1) for (var i = 0; i < SIZE; i += 1) {
      if (i > 1 && j > 1 && i < SIZE - 2 && j < SIZE - 2) continue;
      var k = (j * SIZE + i) * 4;
      if (d[k + 3] < 16) clear += 1; else ring.push([d[k], d[k + 1], d[k + 2]]);
    }
    var ringN = clear + ring.length;
    if (clear / ringN >= 0.5) return { kind: "transparent" };
    var mean = [0, 1, 2].map(function (ch) { return ring.reduce(function (a, p) { return a + p[ch]; }, 0) / ring.length; });
    var dev = function (r, g, b) { return Math.max(Math.abs(r - mean[0]), Math.abs(g - mean[1]), Math.abs(b - mean[2])); };
    var devs = ring.map(function (p) { return dev(p[0], p[1], p[2]); }).sort(function (a, b) { return a - b; });
    if (devs[Math.floor(devs.length * 0.9)] > UNIFORM) return { kind: "environment" };
    var minX = SIZE, minY = SIZE, maxX = -1, maxY = -1;
    for (var y = 0; y < SIZE; y += 1) for (var xx = 0; xx < SIZE; xx += 1) {
      var q = (y * SIZE + xx) * 4;
      if (d[q + 3] >= 16 && dev(d[q], d[q + 1], d[q + 2]) > FG) {
        if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    var white = mean.every(function (v) { return v > 236; });
    var out = { kind: white ? "white" : "embedded", edge: mean.map(Math.round) };
    if (maxX < 0) return out; // ingen mätbar produkt: ingen tonzon
    var side = function (m) { return Math.max(0, Math.min(m - SAFE, MAX_FADE)); };
    out.fade = { t: side(minY / SIZE), r: side((SIZE - 1 - maxX) / SIZE), b: side((SIZE - 1 - maxY) / SIZE), l: side(minX / SIZE) };
    return out;
  }
  function classify(src) {
    if (memo[src]) return memo[src];
    var hit = null;
    try { hit = JSON.parse(sessionStorage.getItem(KEY + src) || "null"); } catch (e) { hit = null; }
    if (hit) return (memo[src] = Promise.resolve(hit));
    return (memo[src] = new Promise(function (resolve) {
      var probe = new Image();
      probe.crossOrigin = "anonymous";
      probe.decoding = "async";
      probe.onload = function () {
        var res;
        try { res = analyse(probe); } catch (e) { res = { kind: "unverified" }; }
        try { sessionStorage.setItem(KEY + src, JSON.stringify(res)); } catch (e) { /* full eller blockerad */ }
        resolve(res);
      };
      probe.onerror = function () { resolve({ kind: "unverified" }); };
      probe.src = src;
    }));
  }
  function apply(box, res) {
    box.setAttribute("data-hz8-media", res.kind);
    var f = res.fade;
    if (f && (f.t || f.r || f.b || f.l)) {
      box.style.setProperty("--hz8-mf-t", pct(f.t));
      box.style.setProperty("--hz8-mf-r", pct(f.r));
      box.style.setProperty("--hz8-mf-b", pct(f.b));
      box.style.setProperty("--hz8-mf-l", pct(f.l));
      box.setAttribute("data-hz8-media-fade", "");
    } else {
      ["--hz8-mf-t", "--hz8-mf-r", "--hz8-mf-b", "--hz8-mf-l"].forEach(function (p) { box.style.removeProperty(p); });
      box.removeAttribute("data-hz8-media-fade");
    }
    if (res.edge) box.style.setProperty("--hz8-media-edge", "rgb(" + res.edge.join(",") + ")");
    else box.style.removeProperty("--hz8-media-edge");
  }
  /* En bildyta: klassa dess aktuella bild (ny klassning när src byts). */
  function sync(box, img) {
    img = img || box.querySelector("img");
    if (!img) return;
    var src = img.currentSrc || img.src;
    if (!src || /^data:/.test(src)) return;
    if (box.getAttribute("data-hz8-media-src") === src) return;
    box.setAttribute("data-hz8-media-src", src);
    if (!box.hasAttribute("data-hz8-media")) box.setAttribute("data-hz8-media", "pending");
    classify(src).then(function (res) { if (box.getAttribute("data-hz8-media-src") === src) apply(box, res); });
  }
  HZ8.productMedia = { classify: classify, sync: sync, apply: apply };

  function scan() {
    document.querySelectorAll(CONTAINERS).forEach(function (box) { sync(box); });
    /* PDP: den aktiva bilden styr scenen (strainbyte = annan slide). */
    var media = document.querySelector(".product-detail__media");
    if (media) {
      var img = media.querySelector("#product-slides .slide.is-active img, #product-slides .slide.active img") || media.querySelector("#product-slides .slide img");
      if (img) sync(media, img);
    }
  }
  HZ8.register("product-media", function () {
    HZ8.watch(scan);
    /* Lata bilder (loading=lazy) får sin src/currentSrc först vid laddning,
       och sliderns bildbyte ändrar bara klasser -- fånga båda. */
    document.addEventListener("load", function (e) { if (e.target && e.target.tagName === "IMG") scan(); }, true);
    document.addEventListener("click", function () { window.requestAnimationFrame(scan); }, true);
    document.addEventListener("transitionend", function (e) { if (e.target.closest && e.target.closest(".product-detail__media")) scan(); }, true);
  });
})();
