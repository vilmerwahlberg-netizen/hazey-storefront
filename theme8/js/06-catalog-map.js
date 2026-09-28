/* Central kategori- och relationskarta (format x serie x tillverkare).

   EN källa för kategorisidornas format-/serienavigation, seriehubbarnas
   produktrader och framtida tillverkar-/startsidesrader.

   - Härleds ur headerns verifierade kategorikarta (HZ8.navContent,
     05-header.js): grupp-CTA = formatets egen sida, SERIER-länkar =
     serie x format-routes. Headern och den här kartan kan därför aldrig
     säga emot varandra.
   - Kompletteras bara med verifierade routes som headern saknar
     (inventerade 2026-09-28 mot Theme 8-previewen, alla HTTP 200):
     carts-kombinationer, seriernas egna hubbsidor och Nyehandels
     native "Serie"-attributvärde.
   - INGA produktantal eller tillverkare hårdkodas: antal läses vid
     körning ur respektive sidas #products_count (HZ8.categoryInfo),
     tillverkare ur Nyehandels egen filterpanel (Varumärke) på sidan.
   - Taxonomierna hålls isär: FORMAT (vapes, carts, buds, hasch,
     batterier), SERIE (Magic Sauce, THCaB, ...), TILLVERKARE (Varumärke).
     Cannabinoid-/CBD-familjen (headerns "CBD"-grupp) är en egen dimension
     och ingår inte i format-/serienavigationen. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var BASE = "https://hazeyse.nyehandel.se/sv/categories/";

  /* Formatens ordning i navigationen. `from` pekar på var i headerns
     karta formatets egen sida finns. Pre-rolls och Refill finns inte i
     sortimentet (headern har dem som "kommer snart", href null) och
     utelämnas därför helt. */
  var FORMAT_DEFS = [
    { key: "vapes", label: "Vapes", group: "vapes", cta: true },
    { key: "carts", label: "Carts", group: "vapes", formatLabel: "Carts" },
    { key: "buds", label: "Buds", group: "buds", cta: true },
    { key: "hasch", label: "Hasch", group: "hasch", cta: true },
    { key: "batterier", label: "Batterier & tillbehör", short: "Batterier", group: "vapes", formatLabel: "510-batterier & tillbehör", seriesless: true }
  ];

  /* Serier: namn som i headern + verifierade tillägg. `attr` = Nyehandels
     native Serie-attribut (för filter-routes), `hub` = seriens egen
     kategorisida (null = ingen finns). `extra` = verifierade serie x
     format-routes som headern inte listar. */
  var SERIES_DEFS = [
    { name: "Magic Sauce", attr: "Magic Sauce", hub: "magic-sauce", extra: { carts: "alla-cartridges?filters=Serie_Magic%20Sauce" } },
    { name: "THCaB", hub: "thca", extra: { carts: "thca-carts" } },
    { name: "THCbA", hub: "thcb", extra: { carts: "thcb-carts" } },
    { name: "Core", attr: "Core", hub: null },
    { name: "D10", hub: "10-oh-thc" },
    { name: "Nano-11", aliases: ["Nano11"], attr: "Nano11", hub: "nano-11" },
    { name: "THCV", hub: "thcv", extra: { carts: "thcv-carts" } },
    { name: "HHCPM", hub: "hhcpm" },
    { name: "THCNM", hub: "thcnm" }
  ];

  function norm(label) { return String(label || "").toLowerCase().replace(/[^a-z0-9åäö]/g, ""); }
  function abs(route) { return /^https?:/.test(route) ? route : BASE + route; }

  var built = null;
  function build() {
    if (built) return built;
    var nav = HZ8.navContent || {};
    var formats = FORMAT_DEFS.map(function (d) {
      var group = nav[d.group] || {};
      var href = null;
      if (d.cta && group.cta) href = group.cta.href;
      (group.groups || []).forEach(function (g) {
        (g.links || []).forEach(function (l) { if (d.formatLabel && l.label === d.formatLabel && l.href) href = l.href; });
      });
      return { key: d.key, label: d.label, short: d.short || d.label, href: href, seriesless: !!d.seriesless };
    }).filter(function (f) { return !!f.href; });

    var series = SERIES_DEFS.map(function (d) {
      var names = [d.name].concat(d.aliases || []).map(norm);
      var routes = {};
      FORMAT_DEFS.forEach(function (fd) {
        var group = nav[fd.group];
        if (!group || fd.seriesless || fd.key === "carts") return;
        (group.groups || []).forEach(function (g) {
          if (!/serier/i.test(g.heading || "")) return;
          (g.links || []).forEach(function (l) { if (l.href && names.indexOf(norm(l.label)) !== -1) routes[fd.key] = l.href; });
        });
      });
      Object.keys(d.extra || {}).forEach(function (k) { routes[k] = abs(d.extra[k]); });
      return { name: d.name, attr: d.attr || null, hub: d.hub ? abs(d.hub) : null, routes: routes };
    }).filter(function (s) { return Object.keys(s.routes).length || s.hub; });

    built = { formats: formats, series: series };
    return built;
  }

  function samePath(a, b) {
    var pa = HZ8.path(a), pb = HZ8.path(b);
    return pa === pb;
  }

  /* Vilken kontext beskriver den aktuella URL:en?
     - "series-hub": seriens egen sida (t.ex. /magic-sauce)
     - "combo": serie x format (t.ex. /thca-vapes, /hasch?filters=Serie_...)
     - "format": formatets egen sida (t.ex. /alla-vapes)
     - null: kartan beskriver inte sidan (t.ex. CBD-familjen, tillverkare). */
  function contextFor(href) {
    var map = build();
    var i, j, keys;
    for (i = 0; i < map.series.length; i += 1) {
      var s = map.series[i];
      if (s.hub && samePath(s.hub, href)) return { type: "series-hub", series: s, format: null };
      keys = Object.keys(s.routes);
      for (j = 0; j < keys.length; j += 1) {
        if (samePath(s.routes[keys[j]], href)) return { type: "combo", series: s, format: formatByKey(keys[j]) };
      }
    }
    for (i = 0; i < map.formats.length; i += 1) {
      if (samePath(map.formats[i].href, href)) return { type: "format", series: null, format: map.formats[i] };
    }
    return null;
  }

  function formatByKey(key) {
    return build().formats.filter(function (f) { return f.key === key; })[0] || null;
  }

  /* Serier som har en route i ett visst format (utom `except`). */
  function seriesWithFormat(formatKey, except) {
    return build().series.filter(function (s) { return s.routes[formatKey] && s !== except; });
  }

  /* Seriens mest relevanta landningssida: egen hubb, annars samma format
     som nu, annars första tillgängliga format. */
  function landingFor(series, formatKey) {
    if (series.hub) return series.hub;
    if (formatKey && series.routes[formatKey]) return series.routes[formatKey];
    var first = Object.keys(series.routes)[0];
    return first ? series.routes[first] : null;
  }

  /* Riktig filter-route för "alla produkter från tillverkaren" (server-
     filtrerad, beständig och delbar -- verifierad med Varumärke-filter). */
  function manufacturerRoute(brand) {
    return BASE + "alla-produkter?filters=" + encodeURIComponent("Varumärke_" + brand);
  }

  /* Butikens eget varumärke i Nyehandel (egna/omärkta produkter i alla
     kategorier) -- ingen tillverkare i relationsmening. */
  var HOUSE_BRANDS = ["Hazey.se"];
  function isHouseBrand(name) { return HOUSE_BRANDS.map(norm).indexOf(norm(name)) !== -1; }

  /* Cannabinoidvokabulär = etiketterna i headerns verifierade
     "CANNABINOIDER"-grupp (t.ex. CBD, CBG, CBN) -- ingen egen lista. */
  function cannabinoids() {
    var out = [];
    var nav = HZ8.navContent || {};
    Object.keys(nav).forEach(function (k) {
      (nav[k].groups || []).forEach(function (g) {
        if (!/cannabinoid/i.test(g.heading || "")) return;
        (g.links || []).forEach(function (l) { if (l.label && out.indexOf(l.label) === -1) out.push(l.label); });
      });
    });
    return out;
  }

  /* Försiktig produktfamilj för produkter utan serie: de cannabinoider
     ur vokabulären som står som egna ord i produktnamnet, i namnets
     ordning. Endast om ALLA produkter ger exakt samma uppsättning --
     annars null (anroparen faller tillbaka på en neutral etikett). */
  function familyLabel(names) {
    var vocab = cannabinoids();
    if (!vocab.length || !names.length) return null;
    var sets = names.map(function (name) {
      var found = [];
      vocab.forEach(function (c) {
        var re = new RegExp("(^|[^A-Za-z0-9])" + c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![A-Za-z0-9])");
        var m = re.exec(name);
        if (m) found.push({ c: c, at: m.index });
      });
      return found.sort(function (a, b) { return a.at - b.at; }).map(function (f) { return f.c; }).join(" + ");
    });
    return sets[0] && sets.every(function (x) { return x === sets[0]; }) ? sets[0] : null;
  }

  HZ8.catalog = {
    isHouseBrand: isHouseBrand,
    familyLabel: familyLabel,
    build: build,
    contextFor: contextFor,
    formatByKey: formatByKey,
    seriesWithFormat: seriesWithFormat,
    landingFor: landingFor,
    manufacturerRoute: manufacturerRoute
  };
})();
