/* Delad laddare för koncept-prototyperna (endast granskning, ej produktion).
   Data: concepts/data.json (genererad ur WP-inventeringen, 75 riktiga inlägg)
   Brödtext: data/import/<slug>.html (importpaketet, ordagrant). */
window.C = (function () {
  var MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function date(d) { var p = d.split("-"); return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0]; }
  function clean(x) {
    var ex = x.excerpt;
    if (ex.indexOf(x.title) === 0) ex = ex.slice(x.title.length).trim();
    x.lead = ex.replace(/\s+\S*$/, "") + "…";
    return x;
  }
  /* Ämnen härleds ur artiklarnas eget innehåll (substansflaggorna i
     inventeringen), aldrig ur en fast lista; ämnen med < 3 artiklar visas inte. */
  /* Prototyp: ämnen utan publik kategori i Nyehandel (route-matrix + sitemap
     2026-11-12) visas inte som chip. I produktion härleds samma sak live ur
     headerns kategorilänkar (06-catalog-map.js), ingen fast lista. */
  var ACTIVE = { THCA: 1, THCB: 1, THCV: 1, H4CBD: 1, Nano: 1, "Magic Sauce": 1, CBD: 1, CBN: 1 };
  function topics(list) {
    var n = {};
    list.forEach(function (x) { x.subs.forEach(function (s) { if (ACTIVE[s]) n[s] = (n[s] || 0) + 1; }); });
    return Object.keys(n).filter(function (k) { return n[k] >= 2; }).sort(function (a, b) { return n[b] - n[a]; }).map(function (k) { return { name: k, count: n[k] }; });
  }
  function load() {
    var q = new URLSearchParams(location.search);
    return fetch("data.json").then(function (r) { return r.json(); }).then(function (list) {
      list = list.map(clean);
      var slug = q.get("a") || "vad-ar-nano11-laglig-cannabis-i-sverige";
      var i = list.findIndex(function (x) { return x.slug === slug; });
      var art = list[i];
      return fetch("../data/import/" + slug + ".html").then(function (r) { return r.text(); }).then(function (body) {
        body = body.replace(/^<!--[^]*?-->\s*/, "");
        /* Första H2 som upprepar titeln döljs (mallens H1 bär titeln). */
        var tmp = document.createElement("div"); tmp.innerHTML = body;
        var h = tmp.querySelector("h2");
        if (h && h.textContent.trim() === art.title) h.remove();
        return { list: list, view: q.get("view") || "index", art: art, idx: i, prev: list[i + 1], next: list[i - 1], body: tmp.innerHTML, topics: topics(list) };
      });
    });
  }
  function toc(root) {
    return Array.prototype.map.call(root.querySelectorAll("h2"), function (h, i) { h.id = "s" + i; return { id: h.id, text: h.textContent.trim() }; });
  }
  return { esc: esc, date: date, load: load, toc: toc };
})();
