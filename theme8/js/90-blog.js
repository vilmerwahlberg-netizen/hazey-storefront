/* Blogg: index (/sv/posts) och artikel (/sv/posts/{slug}). TASK 17, 2026-11-12.
   Vald riktning: "A Tidskrift" (theme8/review/blog-seo-2026-11/concepts/).

   Datakällor -- inget hårdkodat:
   - Artiklarna läses ur Nyehandels egen bloggmarkup (.store-posts,
     .post-card, verifierad 2026-11-12 med 75 riktiga inlägg). Tolkningen
     är markup-agnostisk: varje unik länk till /post(s)/{slug} är en artikel.
   - Arkivet hämtar ALLA Nyehandels indexsidor (?page=N, 8 per sida) så att
     bläddring, ämnesfilter och sökning (titel + ingress) omfattar samtliga
     artiklar. Artikelsidorna laddas inte ner för sökningen.
   - Ämneschipp = serier, format och CBD-gruppens cannabinoider ur headerns
     kategorikarta (HZ8.catalog, pausade exkluderade) som nämns i titel
     eller ingress. Ämne med 0 artiklar visas inte.
   - Föregående/nästa och "Läs vidare" på artikelsidan kommer ur samma index.
   - Datum visas bara när sidan anger ett fullständigt datum (arkivkortens
     "06 Mar" saknar år och visas inte); lästid räknas ur texten.
   Om tolkningen inte hittar något lämnas Nyehandels markup orörd. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];
  var POST_RE = /\/posts?\/([^/?#]+)\/?$/;
  var ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function slugOf(href) { var m = HZ8.path(href).split("?")[0].match(POST_RE); return m ? m[1] : null; }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9åäö]/g, ""); }

  /* Datum: <time datetime>, ISO-datum eller "12 juli 2026" i texten. */
  function parseDate(root) {
    var t = root.querySelector("time[datetime]");
    var raw = t ? t.getAttribute("datetime") : "";
    var m = (raw || text(root)).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return { iso: m[0], label: +m[3] + " " + MONTHS[+m[2] - 1] + " " + m[1], node: dateNode(root, m[0]) };
    m = text(root).match(new RegExp("(\\d{1,2})\\s+(" + MONTHS.join("|") + ")\\s+(\\d{4})", "i"));
    if (m) {
      var mo = MONTHS.indexOf(m[2].toLowerCase()) + 1;
      return { iso: m[3] + "-" + (mo < 10 ? "0" : "") + mo + "-" + (+m[1] < 10 ? "0" : "") + +m[1], label: +m[1] + " " + m[2].toLowerCase() + " " + m[3], node: dateNode(root, m[0]) };
    }
    return null;
  }

  /* Minsta element vars text bara är datumet (för att dölja dubbletten). */
  function dateNode(root, needle) {
    var t = root.querySelector("time[datetime]"); if (t) return t;
    var hit = null;
    Array.prototype.forEach.call(root.querySelectorAll("span, time, p, div, small"), function (el) {
      if (!hit && !el.children.length && text(el).indexOf(needle) !== -1 && text(el).length < needle.length + 24) hit = el;
    });
    return hit;
  }

  /* Varje unik /posts/{slug}-länk i listan -> artikel. Kortbehållaren är
     länkens högsta förfader inom listan som inte innehåller någon annan
     artikels länk. */
  function readList(list) {
    var seen = {}, out = [];
    Array.prototype.forEach.call(list.querySelectorAll("a[href]"), function (a) {
      var slug = slugOf(a.getAttribute("href"));
      if (!slug || seen[slug]) return;
      var card = a;
      while (card.parentElement && card.parentElement !== list) {
        var p = card.parentElement, other = false;
        Array.prototype.forEach.call(p.querySelectorAll("a[href]"), function (b) { var s = slugOf(b.getAttribute("href")); if (s && s !== slug) other = true; });
        if (other) break;
        card = p;
      }
      seen[slug] = 1;
      var h = card.querySelector("h1,h2,h3,h4");
      var img = card.querySelector("img");
      var paras = Array.prototype.filter.call(card.querySelectorAll("p"), function (p) { return text(p).length > 40; });
      var title = text(h) || a.getAttribute("title") || text(a);
      if (!title) return;
      out.push({
        slug: slug, href: a.getAttribute("href"), title: title,
        img: img ? (img.getAttribute("src") || img.getAttribute("data-src")) : null, alt: img ? img.getAttribute("alt") || "" : "",
        /* Datum bara ur kortets datumelement, aldrig ur ingressens text. */
        excerpt: paras.length ? text(paras[0]) : "", date: (function () { var d = card.querySelector("time, .published-at, .date"); return d ? parseDate(d) : null; })()
      });
    });
    return out;
  }

  /* Ämnen ur headerns kategorikarta (HZ8.catalog): serier som är kund-
     destinationer, format (Vapes, Carts, Buds ...) och cannabinoiderna i
     headerns CBD-grupp. Pausade/legacy-serier ingår aldrig. Ett ämne visas
     bara om minst en artikel nämner det i titel eller ingress. */
  function topicDefs() {
    if (!HZ8.catalog) return [];
    var C = HZ8.catalog.build(), defs = [], seen = {};
    function add(name, keys, href) {
      var k = norm(name); if (!k || seen[k]) return; seen[k] = 1;
      defs.push({ name: name, keys: keys.map(norm).filter(function (x) { return x.length > 1; }), href: href });
    }
    C.series.filter(HZ8.catalog.discoverable).forEach(function (s) { add(s.name, [s.name].concat(s.attr ? [s.attr] : []), HZ8.catalog.landingFor(s)); });
    C.formats.forEach(function (f) { var l = f.short || f.label; add(l, [l, l.replace(/s$/i, "")], f.href); });
    /* Headerns cannabinoidgrupp (rubrik "Cannabinoider" i CBD-menyn). */
    var nav = HZ8.navContent || {};
    Object.keys(nav).forEach(function (k) {
      ((nav[k] && nav[k].groups) || []).forEach(function (g) {
        if (!/cannabinoid/i.test(g.heading || "")) return;
        (g.links || []).forEach(function (l) { if (l.href) add(l.label, [l.label], l.href); });
      });
    });
    return defs;
  }
  function topicsFor(title, defs) {
    var t = norm(title);
    return defs.filter(function (d) { return d.keys.some(function (k) { return k && t.indexOf(k) !== -1; }); });
  }

  function thumb(x, cls) {
    return '<span class="' + cls + '"' + (x.img ? "" : ' data-empty="1"') + ">" +
      (x.img ? '<img src="' + HZ8.esc(x.img) + '" alt="' + HZ8.esc(x.alt) + '" loading="lazy" decoding="async">' : '<span aria-hidden="true">Hazey</span>') + "</span>";
  }
  function meta(x) { return x.date ? '<time class="hz8-blog__meta" datetime="' + x.date.iso + '">' + x.date.label + "</time>" : ""; }
  /* Nyehandels ingress börjar ofta med titeln (artikelns första rubrik). */
  function cleanExcerpt(x) {
    var e = x.excerpt || "";
    if (norm(e).indexOf(norm(x.title)) === 0) {
      var words = x.title.split(/\s+/).length; e = e.split(/\s+/).slice(words).join(" ");
    }
    return e.replace(/\s*(\.\.\.|…)\s*$/, "…");
  }
  /* Sökning: små bokstäver, utan diakritik på a-z (å/ä/ö behålls) och utan
     bindestreck/mellanslag-skillnader i ord som "THC-A"/"thca". */
  function fold(s) { return String(s || "").toLowerCase().replace(/[éè]/g, "e").replace(/[-‐–—_/.]/g, "").replace(/\s+/g, " "); }

  /* ---------------- Alla indexsidor (riktig Nyehandel-data) ---------------- */
  var INDEX_KEY = "hz8-blog-index-v2";
  function indexHref() { return location.pathname.replace(/\/posts?(\/[^/]+)?\/?$/, "/posts"); }
  function lastPage(doc) {
    var n = 1;
    Array.prototype.forEach.call(doc.querySelectorAll(".pagination a[href], nav[role='navigation'] a[href]"), function (a) {
      var m = (a.getAttribute("href") || "").match(/[?&]page=(\d+)/); if (m) n = Math.max(n, +m[1]);
    });
    return Math.min(n, 40);
  }
  function parseIndex(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var root = doc.querySelector(".store-posts .blog-posts") || doc.querySelector(".store-posts");
    return { doc: doc, posts: root ? readList(root) : [] };
  }
  function fetchPage(n) {
    var u = indexHref() + (n > 1 ? "?page=" + n : "");
    return fetch(HZ8.link(u), { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : ""; }).then(parseIndex);
  }
  /* Alla sidor i Nyehandels egen ordning. Sidan man står på (om given)
     återanvänds; övriga hämtas parallellt (3 åt gången). Cache 10 min. */
  function loadIndex(current) {
    try { var c = JSON.parse(sessionStorage.getItem(INDEX_KEY) || "null"); if (c && Date.now() - c.at < 6e5 && c.posts.length) return Promise.resolve(c.posts); } catch (e) {}
    var first = current ? Promise.resolve(current) : fetchPage(1).then(function (r) { return { page: 1, posts: r.posts, last: lastPage(r.doc) }; });
    return first.then(function (f) {
      var pages = {}; pages[f.page] = f.posts;
      var todo = []; for (var i = 1; i <= f.last; i += 1) if (!pages[i]) todo.push(i);
      function worker() {
        var n = todo.shift(); if (n == null) return Promise.resolve();
        return fetchPage(n).then(function (r) { pages[n] = r.posts; }, function () { pages[n] = []; }).then(worker);
      }
      return Promise.all([worker(), worker(), worker()]).then(function () {
        var all = [], seen = {};
        Object.keys(pages).map(Number).sort(function (a, b) { return a - b; }).forEach(function (k) {
          pages[k].forEach(function (p) { if (!seen[p.slug]) { seen[p.slug] = 1; all.push(p); } });
        });
        try { sessionStorage.setItem(INDEX_KEY, JSON.stringify({ at: Date.now(), posts: all })); } catch (e) {}
        return all;
      });
    });
  }

  /* ---------------- Arkiv ---------------- */
  var BATCH = 24;
  function rowHtml(x, n) {
    return '<li><a class="hz8-blog__row" href="' + HZ8.esc(HZ8.link(x.href)) + '">' +
      '<span class="hz8-blog__n" aria-hidden="true">' + (n < 10 ? "0" : "") + n + "</span>" +
      '<span class="hz8-blog__row-body"><h3>' + HZ8.esc(x.title) + "</h3>" + (x.lead ? "<p>" + HZ8.esc(x.lead) + "</p>" : "") + meta(x) + "</span>" +
      thumb(x, "hz8-blog__thumb") + "</a></li>";
  }
  function leadHtml(x) {
    return '<a class="hz8-blog__lead" href="' + HZ8.esc(HZ8.link(x.href)) + '">' + thumb(x, "hz8-blog__lead-media") +
      '<span class="hz8-blog__lead-body"><span class="hz8-blog__kicker">Senaste</span><h2>' + HZ8.esc(x.title) + "</h2>" +
      (x.lead ? "<p>" + HZ8.esc(x.lead) + "</p>" : "") + meta(x) + '<span class="hz8-blog__read">Läs artikeln' + ARROW + "</span></span></a>";
  }

  function mountIndex(root) {
    var list = root.querySelector(".blog-posts") || root;
    if (root.querySelector(".hz8-blog")) return;
    var posts = readList(list);
    var h1 = root.querySelector("h1");
    var wrap = document.createElement("div");
    wrap.className = "hz8-blog";
    if (!posts.length) {
      wrap.innerHTML = '<div class="hz8-blog__head"><p class="hz8-blog__kicker">Hazey Journal</p><div class="hz8-blog__h1slot"></div></div>' +
        '<div class="hz8-state hz8-blog__empty"><p>Här samlar vi guider och fördjupning om cannabinoider, format och lagstiftning. Inga artiklar är publicerade ännu.</p>' +
        '<a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a></div>';
      list.parentNode.insertBefore(wrap, list);
      if (h1) { wrap.querySelector(".hz8-blog__h1slot").appendChild(h1); h1.classList.add("hz8-blog__title"); }
      else wrap.querySelector(".hz8-blog__h1slot").outerHTML = '<h1 class="hz8-blog__title">Guider &amp; fördjupning</h1>';
      root.setAttribute("data-hz8-blog", "empty");
      return;
    }
    var params = new URLSearchParams(location.search);
    var pageNo = Math.max(1, parseInt(params.get("page"), 10) || 1);
    var defs = topicDefs();
    var state = { all: posts, ready: false, q: params.get("q") || "", topic: "", shown: BATCH };

    wrap.innerHTML =
      '<div class="hz8-blog__head"><p class="hz8-blog__kicker">Hazey Journal</p><div class="hz8-blog__h1slot"></div>' +
      '<p class="hz8-blog__lede">Guider och fördjupning om cannabinoider, format och lagstiftning.</p></div>' +
      '<div class="hz8-blog__tools" role="search">' +
        '<label class="hz8-blog__search"><span class="hz8-visually-hidden">Sök bland artiklarna</span>' +
        '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
        '<input type="search" name="q" autocomplete="off" enterkeyhint="search" placeholder="Sök på titel eller ingress" aria-controls="hz8-blog-results"></label>' +
        '<div class="hz8-blog__chips" role="group" aria-label="Filtrera på ämne" hidden></div></div>' +
      '<p class="hz8-blog__status" role="status" aria-live="polite"></p>' +
      '<div id="hz8-blog-results" class="hz8-blog__results"></div>';

    /* Sidans riktiga H1 (Nyehandels) flyttas in i huvudet -- en H1. */
    if (h1) { wrap.querySelector(".hz8-blog__h1slot").appendChild(h1); h1.classList.add("hz8-blog__title"); }
    else wrap.querySelector(".hz8-blog__h1slot").outerHTML = '<h1 class="hz8-blog__title">Guider &amp; fördjupning</h1>';
    list.parentNode.insertBefore(wrap, list);
    /* Native lista + paginering ligger kvar i DOM:en (crawlbara länkar). */
    list.classList.add("hz8-blog__native");
    var pager = root.querySelector(".pagination, nav[role='navigation']");

    var input = wrap.querySelector("input"), status = wrap.querySelector(".hz8-blog__status");
    var results = wrap.querySelector(".hz8-blog__results"), chipsEl = wrap.querySelector(".hz8-blog__chips");
    input.value = state.q;

    function prepare(all) {
      all.forEach(function (x) {
        x.lead = cleanExcerpt(x);
        x.topics = topicsFor(x.title + " " + x.lead, defs).map(function (d) { return d.name; });
        x.hayTitle = fold(x.title); x.hay = fold(x.title + " " + x.lead);
      });
    }
    function renderChips() {
      var counts = {};
      state.all.forEach(function (x) { x.topics.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
      var chips = defs.filter(function (d) { return counts[d.name]; });
      chipsEl.hidden = !chips.length;
      chipsEl.innerHTML = '<button type="button" data-topic="" aria-pressed="' + (!state.topic) + '">Alla <small>' + state.all.length + "</small></button>" +
        chips.map(function (c) { return '<button type="button" data-topic="' + HZ8.esc(c.name) + '" aria-pressed="' + (state.topic === c.name) + '">' + HZ8.esc(c.name) + " <small>" + counts[c.name] + "</small></button>"; }).join("");
    }
    function matches() {
      var terms = fold(state.q).split(" ").filter(Boolean);
      var hits = state.all.filter(function (x) {
        if (state.topic && x.topics.indexOf(state.topic) === -1) return false;
        return terms.every(function (t) { return x.hay.indexOf(t) !== -1; });
      });
      if (terms.length) hits.sort(function (a, b) {
        var sa = terms.filter(function (t) { return a.hayTitle.indexOf(t) !== -1; }).length, sb = terms.filter(function (t) { return b.hayTitle.indexOf(t) !== -1; }).length;
        return sb - sa;
      });
      return hits;
    }
    function render() {
      var filtered = !!(state.q.trim() || state.topic);
      var hits = matches();
      var html = "";
      if (!hits.length) {
        html = '<div class="hz8-state hz8-blog__nohits"><p>Inga artiklar matchar ' + (state.q.trim() ? "”" + HZ8.esc(state.q.trim()) + "”" : "ämnet") + (state.topic && state.q.trim() ? " inom " + HZ8.esc(state.topic) : "") + ".</p>" +
          '<button type="button" class="hz8-btn hz8-btn--secondary" data-clear>Visa alla artiklar</button></div>';
      } else {
        var lead = !filtered && pageNo === 1 ? hits[0] : null;
        var rest = lead ? hits.slice(1) : hits;
        var limit = filtered ? rest.length : Math.min(rest.length, state.shown);
        html = (lead ? leadHtml(lead) : "") +
          '<ol class="hz8-blog__list" start="' + (lead ? 2 : 1) + '">' + rest.slice(0, limit).map(function (x, i) { return rowHtml(x, i + (lead ? 2 : 1)); }).join("") + "</ol>" +
          (limit < rest.length ? '<div class="hz8-blog__more"><button type="button" class="hz8-btn hz8-btn--secondary" data-more>Visa fler artiklar <small>(' + (rest.length - limit) + " kvar)</small></button></div>" : "");
      }
      results.innerHTML = html;
      status.textContent = !state.ready ? "Hämtar alla artiklar …" :
        filtered ? hits.length + (hits.length === 1 ? " artikel" : " artiklar") + (state.q.trim() ? " för ”" + state.q.trim() + "”" : "") + (state.topic ? " inom " + state.topic : "") :
        state.all.length + " artiklar";
      /* När alla artiklar är hämtade ersätter arkivet Nyehandels paginering
         (som finns kvar i serverns HTML, crawlbar för sökmotorer). */
      if (pager) pager.classList.toggle("hz8-blog__native", state.ready);
    }

    prepare(state.all); renderChips(); render();
    if (pager) wrap.appendChild(pager);

    var t = null;
    input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value; render(); syncUrl(); }, 120); });
    input.addEventListener("keydown", function (e) { if (e.key === "Escape" && input.value) { e.preventDefault(); input.value = ""; state.q = ""; render(); syncUrl(); } });
    wrap.querySelector("form, .hz8-blog__tools").addEventListener("submit", function (e) { e.preventDefault(); });
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-topic]"); if (!b) return;
      state.topic = b.getAttribute("data-topic");
      Array.prototype.forEach.call(chipsEl.querySelectorAll("button"), function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      render();
    });
    results.addEventListener("click", function (e) {
      if (e.target.closest("[data-more]")) {
        var before = results.querySelectorAll(".hz8-blog__row").length;
        state.shown += BATCH; render();
        var next = results.querySelectorAll(".hz8-blog__row")[before]; if (next) next.focus();
      } else if (e.target.closest("[data-clear]")) {
        input.value = ""; state.q = ""; state.topic = ""; renderChips(); render(); syncUrl(); input.focus();
      }
    });
    function syncUrl() {
      try { var u = new URL(location.href); if (state.q.trim()) u.searchParams.set("q", state.q.trim()); else u.searchParams.delete("q"); history.replaceState(history.state, "", u); } catch (e) {}
    }

    var current = { page: pageNo, posts: posts, last: lastPage(document) };
    results.setAttribute("aria-busy", "true");
    loadIndex(current).then(function (all) {
      results.removeAttribute("aria-busy");
      state.all = all.length ? all : posts; state.ready = true;
      prepare(state.all); renderChips(); render();
    }, function () { results.removeAttribute("aria-busy"); state.ready = true; render(); });
    root.setAttribute("data-hz8-blog", "index");
  }

  /* ---------------- Artikel ---------------- */
  /* Brödtexten = det element som rymmer flest av sidans stycken, utan
     att innehålla H1. */
  function findBody(root, h1) {
    var ps = root.querySelectorAll("p, li");
    var best = null, bestN = 0;
    Array.prototype.forEach.call(root.querySelectorAll("div, article, section"), function (el) {
      if (h1 && el.contains(h1)) return;
      var n = 0; Array.prototype.forEach.call(ps, function (p) { if (el.contains(p)) n += 1; });
      if (n > bestN || (n === bestN && best && best.contains(el))) { best = el; bestN = n; }
    });
    return bestN >= 2 ? best : null;
  }

  function mountArticle(root) {
    if (root.querySelector(".hz8-post")) return;
    var h1 = root.querySelector("h1");
    var body = findBody(root, h1);
    if (!h1 || !body) return;
    var slug = slugOf(location.pathname);
    var title = text(h1);
    var heroImg = null;
    Array.prototype.forEach.call(root.querySelectorAll("img"), function (img) { if (!heroImg && !body.contains(img)) heroImg = img; });
    var date = parseDate(root.querySelector("time") ? root : (h1.parentElement || root));
    if (date && date.node && !body.contains(date.node)) date.node.classList.add("hz8-blog__native");
    var words = text(body).split(" ").length;
    var minutes = Math.max(1, Math.round(words / 200));
    var defs = topicDefs(), topics = topicsFor(title, defs);

    /* Första rubriken i brödtexten som bara upprepar titeln döljs visuellt. */
    var firstH = body.querySelector("h1, h2");
    if (firstH && norm(text(firstH)) === norm(title)) firstH.classList.add("hz8-visually-hidden");
    /* Säkerhetsnät: en H1 i brödtext (importerat innehåll) blir H2. */
    Array.prototype.forEach.call(body.querySelectorAll("h1"), function (h) {
      var h2 = document.createElement("h2"); h2.innerHTML = h.innerHTML; h2.className = h.className; h.parentNode.replaceChild(h2, h);
    });

    var post = document.createElement("div");
    post.className = "hz8-post";
    post.innerHTML =
      '<div class="hz8-post__head"><nav class="hz8-post__crumb" aria-label="Brödsmulor"><a href="' + HZ8.esc(HZ8.link("/sv/posts")) + '">Guider &amp; fördjupning</a></nav>' +
      (topics[0] ? '<p class="hz8-blog__kicker">' + HZ8.esc(topics[0].name) + "</p>" : "") +
      '<div class="hz8-post__h1slot"></div><p class="hz8-post__meta">' + (date ? '<time datetime="' + date.iso + '">' + date.label + "</time> · " : "") + minutes + " min läsning</p></div>" +
      '<div class="hz8-post__hero" hidden></div>' +
      '<div class="hz8-post__grid"><nav class="hz8-post__toc" aria-label="I artikeln" hidden></nav><div class="hz8-post__bodyslot"></div><aside class="hz8-post__aside"></aside></div>' +
      '<div class="hz8-post__after" data-hz8-defer></div>';
    post.querySelector(".hz8-post__h1slot").appendChild(h1);
    h1.classList.add("hz8-post__title");
    if (heroImg) {
      var hero = post.querySelector(".hz8-post__hero");
      hero.hidden = false; hero.appendChild(heroImg);
      heroImg.setAttribute("fetchpriority", "high"); heroImg.removeAttribute("loading");
    }
    body.classList.add("hz8-post__body");
    var host = body.parentNode;
    host.insertBefore(post, body);
    post.querySelector(".hz8-post__bodyslot").appendChild(body);
    /* Native behållare som tömts (rubrik, datum, bild flyttade) döljs så att de
       inte lämnar tom yta; behållare med kvarvarande innehåll rörs inte. */
    Array.prototype.forEach.call(host.children, function (el) {
      if (el === post) return;
      var visibleText = Array.prototype.some.call(el.querySelectorAll("*"), function (n) { return !n.children.length && !n.classList.contains("hz8-blog__native") && text(n); }) || (!el.children.length && text(el));
      if (!visibleText && !el.querySelector("img, iframe, video")) el.classList.add("hz8-blog__native");
    });

    /* Innehållsförteckning ur artikelns egna H2:or (minst 3). */
    var hs = Array.prototype.filter.call(body.querySelectorAll("h2"), function (h) { return !h.classList.contains("hz8-visually-hidden") && text(h); });
    if (hs.length >= 3) {
      var toc = post.querySelector(".hz8-post__toc");
      toc.innerHTML = '<p class="hz8-blog__kicker">I artikeln</p><ol>' + hs.map(function (h, i) {
        if (!h.id) h.id = "avsnitt-" + (i + 1);
        return '<li><a href="#' + h.id + '">' + HZ8.esc(text(h)) + "</a></li>";
      }).join("") + "</ol>";
      toc.hidden = false;
    }
    /* Relaterat i butiken: seriens riktiga landningssida. */
    if (topics[0] && topics[0].href) {
      post.querySelector(".hz8-post__aside").innerHTML = '<p class="hz8-blog__kicker">I butiken</p><a class="hz8-post__shop" href="' + HZ8.esc(HZ8.link(topics[0].href)) + '">Se ' + HZ8.esc(topics[0].name) + ARROW + "</a>";
    }

    addSchema(title, date, heroImg);

    var after = post.querySelector(".hz8-post__after");
    after.setAttribute("aria-busy", "true");
    loadIndex().then(function (all) {
      after.removeAttribute("aria-busy");
      var i = -1; all.forEach(function (p, k) { if (p.slug === slug) i = k; });
      var prev = i >= 0 ? all[i + 1] : null, next = i > 0 ? all[i - 1] : null;
      var others = all.filter(function (p) { return p.slug !== slug && p !== prev && p !== next; });
      var related = others.filter(function (p) { return topics.length && topicsFor(p.title, topics).length; });
      var more = related.concat(others.filter(function (p) { return related.indexOf(p) === -1; })).slice(0, 8);
      function pn(p, label, cls) { return p ? '<a class="' + cls + '" href="' + HZ8.esc(HZ8.link(p.href)) + '" rel="' + (cls.indexOf("prev") > -1 ? "prev" : "next") + '"><span class="hz8-blog__kicker">' + label + "</span><b>" + HZ8.esc(p.title) + "</b></a>" : "<span></span>"; }
      after.innerHTML = (prev || next ? '<nav class="hz8-post__pn" aria-label="Fler artiklar">' + pn(prev, "Föregående", "hz8-post__prev") + pn(next, "Nästa", "hz8-post__next") + "</nav>" : "") +
        (more.length ? '<section class="hz8-post__more" aria-labelledby="hz8-more-t"><div class="hz8-post__more-head"><h2 id="hz8-more-t">Läs vidare</h2><a href="' + HZ8.esc(HZ8.link("/sv/posts")) + '">Alla artiklar' + ARROW + "</a></div>" +
          '<ul class="hz8-post__rail">' + more.map(function (p) { return '<li><a href="' + HZ8.esc(HZ8.link(p.href)) + '">' + thumb(p, "hz8-blog__thumb") + meta(p) + "<h3>" + HZ8.esc(p.title) + "</h3></a></li>"; }).join("") + "</ul></section>" : "");
    }).catch(function () { after.removeAttribute("aria-busy"); });
    root.setAttribute("data-hz8-blog", "article");
  }

  /* BlogPosting + BreadcrumbList. Nyehandels egen BlogPosting har datum i
     icke-ISO-format ("2025-03-06 18:01:59") och mainEntityOfPage = /sv/posts
     (verifierat 2026-11-12); den ersätts då av en korrekt. En native-schema
     med ISO-datum och rätt sida lämnas orörd. Endast fakta som finns på sidan. */
  function addSchema(title, date, img) {
    var nativeOk = false;
    Array.prototype.forEach.call(document.querySelectorAll('script[type="application/ld+json"]:not([data-hz8])'), function (s) {
      var d; try { d = JSON.parse(s.textContent); } catch (e) { return; }
      if (d && (d["@type"] === "BlogPosting" || d["@type"] === "Article")) {
        var me = typeof d.mainEntityOfPage === "string" ? d.mainEntityOfPage : (d.mainEntityOfPage || {})["@id"];
        var here = location.origin + location.pathname.replace(/\/+$/, "");
        /* Godkänd bara med ISO 8601-datum och rätt sida; annars ersätts den. */
        if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(d.datePublished || "") && me === here) nativeOk = true; else s.parentNode.removeChild(s);
      }
      if (d && d["@type"] === "BreadcrumbList" && !nativeOk) s.parentNode.removeChild(s);
    });
    if (nativeOk) return;
    var url = location.origin + location.pathname.replace(/\/+$/, "");
    var desc = document.querySelector('meta[name="description"]');
    var art = { "@context": "https://schema.org", "@type": "BlogPosting", headline: title, mainEntityOfPage: url, url: url,
      publisher: { "@type": "Organization", name: "Hazey" }, inLanguage: "sv-SE" };
    if (date) art.datePublished = date.iso;
    if (img && img.src) art.image = img.src;
    if (desc && desc.content && desc.content.trim()) art.description = desc.content.trim();
    var crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: location.origin + "/sv" },
      { "@type": "ListItem", position: 2, name: "Guider & fördjupning", item: location.origin + "/sv/posts" },
      { "@type": "ListItem", position: 3, name: title, item: url }] };
    [art, crumbs].forEach(function (o) {
      var s = document.createElement("script"); s.type = "application/ld+json"; s.setAttribute("data-hz8", "blog");
      s.textContent = JSON.stringify(o); document.head.appendChild(s);
    });
  }

  /* "Publicerad … av " utan författarnamn (inläggen saknar författare):
     avslutande "av" tas bort i Nyehandels egna datumrader (beslut 2026-11-12). */
  function trimAuthor(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".published-at"), function (el) {
      var t = el.textContent.replace(/\s+/g, " ").trim();
      if (/\sav$/.test(t)) el.textContent = t.replace(/\s+av$/, "");
    });
  }

  HZ8.blog = { readList: readList, topicsFor: topicsFor, findBody: findBody };

  HZ8.register("blog", function (context) {
    if (context.page !== "blog" && context.page !== "post") return;
    var root = document.querySelector(".store-posts, .store-post, #skip-to-main-content");
    if (!root) return;
    try { trimAuthor(root); if (context.page === "blog") mountIndex(root); else mountArticle(root); }
    catch (e) { if (window.console) console.error("Theme 8 blog failed:", e); }
  });
})();
