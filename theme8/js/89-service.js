/* Servicesidor -- en gemensam sidfamilj ("West Coast concierge"):
   Kontakt, Vanliga frågor, Leverans och retur, sökning, Om Hazey och
   dokumentmallen för villkor/integritet. Facit:
   preview/info-pages-redesign/final/ (form och hierarki, aldrig fakta).

   Delat skal (HZ8.service):
   - masthead: mörk golden-hour-yta (godkänd kategoribild) eller olivband,
     med sidans EGNA brödsmulor, H1 och ingress flyttade in (en H1),
   - hjälpkolumn (kontaktvägar + relaterade sidor), ämnesnavigation,
     ikonrader, knappar och fält ur Theme 8-tokens.
   Data: butikens egna FAQ-frågor, adminsidornas texter, headerns
   verifierade kategorier, riktiga produktbilder ur kategorisidorna och
   frakt-/landsregler ur HZ8.commerce. Inget hittas på.

   Kontaktformuläret skickar till Nyehandels egen ärendefunktion
   (POST /frontend-api/contact-form: namn, e-post, meddelande, reCAPTCHA
   -- samma som plattformens Kontaktformulär-komponent). */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8 || HZ8.service) return;

  var esc = function (v) { return HZ8.esc(v); };
  var link = function (h) { return HZ8.link(h); };
  var locale = function () { return (window.config && window.config.locale) || "sv"; };

  /* ---------- Ikoner (linje, 24px, currentColor) ---------- */
  var ICONS = {
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    truck: '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
    ret: '<path d="M9 7H4V2"/><path d="M4.5 7A8 8 0 1 1 4 12"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    store: '<path d="M4 10v10h16V10"/><path d="M3 5h18l-1.5 5h-15z"/><path d="M9 20v-5h6v5"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2z"/><path d="M20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    cart: '<path d="M3 4h2l2.4 11h10.2l2-8H6.3"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5v.01"/>',
    pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>'
  };
  function icon(name, cls) {
    return '<svg class="hz8-svc-ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }

  /* ---------- Kontaktvägar (butikens egna adresser) ---------- */
  var CONTACT = [
    { key: "service", icon: "mail", address: "hej@hazey.se", label: "Kundservice" },
    { key: "reseller", icon: "store", address: "butik@hazey.se", label: "Återförsäljare" }
  ];
  /* Ärendetyper. Nyckeln används i ?arende= och i formulärets meddelande. */
  var TOPICS = [
    { key: "order", icon: "box", label: "Fråga om min order" },
    { key: "produkt", icon: "doc", label: "Fråga om en produkt" },
    { key: "retur", icon: "ret", label: "Retur eller reklamation" },
    { key: "annat", icon: "chat", label: "Annat ärende" }
  ];
  function contactUrl(topic) { return link("/sv/page/kontakt" + (topic ? "?arende=" + topic : "")); }

  /* ---------- Masthead ---------- */
  /* Sidans egna brödsmulor (Nyehandel) klonas in; originalet döljs
     visuellt men finns kvar. Saknas de byggs Hem / sidnamn. */
  function crumbs(fallback) {
    var nav = document.querySelector(".designer-breadcrumbs .breadcrumb");
    var items = nav ? Array.prototype.map.call(nav.querySelectorAll("li"), function (li) {
      var a = li.querySelector("a");
      return { href: a && !li.classList.contains("is-active") ? a.getAttribute("href") : null, text: li.textContent.replace(/\s+/g, " ").trim() };
    }).filter(function (c) { return c.text; }) : [];
    if (items.length < 2 && fallback) items = [{ href: "/sv", text: "Hem" }, { href: null, text: fallback }];
    else if (fallback && items.length) items[items.length - 1].text = fallback;
    if (!items.length) return "";
    return '<nav class="hz8-svc-crumbs" aria-label="Brödsmulor"><ol>' + items.map(function (c, i) {
      var t = esc(i === items.length - 1 && c.text === c.text.toUpperCase() && /[A-ZÅÄÖ]{3}/.test(c.text) ? c.text.charAt(0) + c.text.slice(1).toLowerCase() : c.text);
      return "<li>" + (c.href && i < items.length - 1 ? '<a href="' + esc(link(c.href)) + '">' + t + "</a>" : '<span aria-current="page">' + t + "</span>") + "</li>";
    }).join("") + "</ol></nav>";
  }
  /* opts: variant "photo" | "band", h1 (befintlig nod eller text), lead
     (nod eller text), crumb (fallback-namn), aside (HTML), below (HTML). */
  function mast(opts) {
    var main = document.getElementById("store-main");
    if (!main || main.querySelector(".hz8-svc-mast")) return main && main.querySelector(".hz8-svc-mast");
    var sec = document.createElement("section");
    sec.className = "hz8-svc-mast hz8-svc-mast--" + (opts.variant || "photo") + (opts.aside ? " has-aside" : "");
    sec.innerHTML = '<div class="hz8-svc-mast__inner"><div class="hz8-svc-mast__copy">' + crumbs(opts.crumb) + '<div class="hz8-svc-mast__head"></div>' + (opts.below || "") + "</div>" +
      (opts.aside ? '<div class="hz8-svc-mast__aside">' + (opts.aside.trim() ? opts.aside : "") + "</div>" : "") + "</div>";
    var head = sec.querySelector(".hz8-svc-mast__head");
    [opts.h1, opts.lead].forEach(function (n, i) {
      if (!n) return;
      if (typeof n === "string") head.insertAdjacentHTML("beforeend", i === 0 ? "<h1>" + n + "</h1>" : '<p class="hz8-svc-mast__lead">' + n + "</p>");
      else { if (i === 1) n.classList.add("hz8-svc-mast__lead"); head.appendChild(n); }
    });
    var bc = main.querySelector(".designer-breadcrumbs");
    if (bc) bc.classList.add("hz8-svc-crumbs-native");
    main.insertBefore(sec, main.firstChild);
    document.documentElement.classList.add("hz8-svc");
    return sec;
  }

  /* Hjälpkolumn: rubrik, text, primär knapp, kontaktvägar, relaterade. */
  function helpRail(opts) {
    opts = opts || {};
    /* Radvariant (FAQ-facit): e-post, kontaktformulär, återförsäljare. */
    if (opts.rows) {
      return '<aside class="hz8-svc-help hz8-svc-help--rows" aria-labelledby="hz8-svc-help-title">' +
        (opts.icon ? '<span class="hz8-svc-help__mark">' + icon(opts.icon) + "</span>" : "") +
        '<h2 id="hz8-svc-help-title">' + esc(opts.title) + "</h2>" + (opts.text ? "<p>" + esc(opts.text) + "</p>" : "") +
        '<ul class="hz8-svc-ways">' +
          '<li>' + icon("mail") + '<div><span class="hz8-svc-ways__title">E-post</span><a href="mailto:hej@hazey.se">hej@hazey.se</a><span>Kundservice</span></div></li>' +
          '<li>' + icon("chat") + '<div><span class="hz8-svc-ways__title">Kontaktformulär</span><a href="' + esc(contactUrl()) + '">Skicka ett meddelande</a><span>Via vårt formulär</span></div></li>' +
          '<li>' + icon("store") + '<div><span class="hz8-svc-ways__title">Återförsäljare</span><a href="mailto:butik@hazey.se">butik@hazey.se</a><span>För befintliga och blivande återförsäljare</span></div></li>' +
        "</ul></aside>";
    }
    return '<aside class="hz8-svc-help" aria-labelledby="hz8-svc-help-title">' +
      (opts.icon ? '<span class="hz8-svc-help__mark">' + icon(opts.icon) + "</span>" : "") +
      '<h2 id="hz8-svc-help-title">' + esc(opts.title || "Har du frågor?") + "</h2>" +
      (opts.text ? "<p>" + esc(opts.text) + "</p>" : "") +
      (opts.cta ? '<a class="hz8-svc-btn hz8-svc-btn--cta" href="' + esc(contactUrl()) + '">' + icon("chat") + "<span>" + esc(opts.cta) + "</span>" + icon("arrow") + "</a>" : "") +
      '<h3 class="hz8-svc-help__sub">Andra kontaktvägar</h3>' + ways() +
      (opts.related ? '<h3 class="hz8-svc-help__sub">Relaterade sidor</h3><ul class="hz8-svc-lines">' + opts.related.map(function (r) {
        return '<li><a href="' + esc(r.href) + '"><span>' + esc(r.label) + "</span>" + icon("chev") + "</a></li>";
      }).join("") + "</ul>" : "") + "</aside>";
  }
  function ways(extra) {
    return '<ul class="hz8-svc-ways">' + CONTACT.map(function (c) {
      return '<li>' + icon(c.icon) + '<div><a href="mailto:' + c.address + '">' + c.address + "</a><span>" + c.label + "</span></div></li>";
    }).join("") + (extra || "") + "</ul>";
  }

  /* ---------- FAQ: klassning av butikens EGNA frågor ---------- */
  var FAQ_TOPICS = [
    { key: "bestallning", label: "Beställning", short: "beställning", icon: "cart", re: /beställ|order|åldersgräns|18 år|konto/i },
    { key: "leverans", label: "Leverans", short: "leverans", icon: "truck", re: /leverans|skick|spårning|paket|diskret|frakt|hur snabbt|får jag min/i },
    { key: "produkter", label: "Produkter", short: "produkter", icon: "box", re: /produkt|laglig|labb|thc|cannabinoid|sortiment/i },
    { key: "betalning", label: "Betalning", short: "betalning", icon: "card", re: /betal|swish|klarna|kassa/i },
    { key: "retur", label: "Retur och reklamation", short: "returer", icon: "ret", re: /ångra|retur|reklam|byt/i }
  ];
  /* Frågan avgör i första hand (svaret nämner ofta frakt/villkor). */
  /* Prioritet vid klassning: det mest specifika ämnet först ("Hur
     snabbt får jag min beställning?" är en leveransfråga). */
  var CLASSIFY_ORDER = ["retur", "betalning", "leverans", "produkter", "bestallning"];
  function classify(q, a) {
    var ordered = CLASSIFY_ORDER.map(topicByKey);
    var t = ordered.filter(function (x) { return x.re.test(q); })[0] ||
      ordered.filter(function (x) { return x.re.test(a); })[0];
    return t ? t.key : "produkter";
  }
  function topicByKey(k) { return FAQ_TOPICS.filter(function (t) { return t.key === k; })[0]; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFC"); }

  /* ---------- Tabbar/ämnesnav: aktiv länk efter scroll ---------- */
  function spy(links, targets) {
    if (!("IntersectionObserver" in window) || !targets.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { var on = l.getAttribute("href") === "#" + e.target.id; l.classList.toggle("is-active", on); if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }
  /* Hash-länkar till element som skapas efter laddning. */
  function scrollToHash(root) {
    if (!location.hash) return;
    var t = root.querySelector(location.hash.replace(/[^#\w-]/g, ""));
    if (t) window.requestAnimationFrame(function () { t.scrollIntoView({ block: "start" }); });
  }

  HZ8.service = {
    icon: icon, mast: mast, helpRail: helpRail, ways: ways, TOPICS: TOPICS, CONTACT: CONTACT,
    FAQ_TOPICS: FAQ_TOPICS, classify: classify, topicByKey: topicByKey, contactUrl: contactUrl, norm: norm, spy: spy, scrollToHash: scrollToHash
  };

  /* =====================================================================
     1. KONTAKT
     ===================================================================== */
  var cfSeq = 0;
  function field(id, label, control, opt) {
    return '<div class="hz8-field' + (opt ? " is-optional" : "") + '"><label for="' + id + '">' + label + (opt ? ' <span>(valfritt)</span>' : "") + "</label>" + control +
      '<p class="hz8-field__err" id="' + id + '-err" hidden></p></div>';
  }
  function buildForm(preset) {
    var n = ++cfSeq, p = "hz8-cf" + n;
    var opts = '<option value="">Välj ett ämne</option>' + TOPICS.map(function (t) {
      return '<option value="' + t.key + '"' + (t.key === preset ? " selected" : "") + ">" + esc(t.label) + "</option>";
    }).join("");
    return '<form class="hz8-cform" id="' + p + '" novalidate aria-labelledby="' + p + '-title">' +
      '<h2 id="' + p + '-title">Skicka ett meddelande</h2>' +
      '<p class="hz8-cform__summary" role="alert" tabindex="-1" hidden></p>' +
      '<div class="hz8-cform__pair">' + field(p + "-topic", "Ärende", '<div class="hz8-select"><select id="' + p + '-topic" name="topic" required aria-describedby="' + p + '-topic-err">' + opts + "</select>" + icon("chev", "hz8-select__chev") + "</div>") +
      field(p + "-order", "Ordernummer", '<input id="' + p + '-order" name="order" type="text" inputmode="text" autocomplete="off" maxlength="40" placeholder="t.ex. 12345" aria-describedby="' + p + '-order-err">', true) + "</div>" +
      '<div class="hz8-cform__pair">' +
      field(p + "-name", "Namn", '<input id="' + p + '-name" name="name" type="text" autocomplete="name" required maxlength="120" aria-describedby="' + p + '-name-err">') +
      field(p + "-email", "E-post", '<input id="' + p + '-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="160" placeholder="din@epost.se" aria-describedby="' + p + '-email-err">') +
      "</div>" +
      field(p + "-message", "Meddelande", '<textarea id="' + p + '-message" name="message" required minlength="10" maxlength="900" rows="4" placeholder="Skriv ditt meddelande här" aria-describedby="' + p + '-message-err"></textarea>') +
      '<div class="hz8-field hz8-cform__captcha"><div class="hz8-cform__captcha-box" id="' + p + '-captcha"></div><p class="hz8-field__err" id="' + p + '-captcha-err" hidden></p></div>' +
      '<button type="submit" class="hz8-svc-btn hz8-svc-btn--cta hz8-cform__submit"><span>Skicka meddelande</span>' + icon("arrow") + "</button>" +
      '<p class="hz8-cform__status" role="status" aria-live="polite"></p>' +
      "</form>";
  }
  function setErr(form, name, msg) {
    var ctl = form.querySelector('[name="' + name + '"]');
    var box = form.querySelector("#" + form.id + "-" + (name === "g-recaptcha-response" ? "captcha" : name) + "-err");
    if (ctl) { if (msg) ctl.setAttribute("aria-invalid", "true"); else ctl.removeAttribute("aria-invalid"); }
    if (box) { box.textContent = msg || ""; box.hidden = !msg; }
  }
  function wireForm(form) {
    var widget = null, busy = false;
    var captcha = form.querySelector(".hz8-cform__captcha-box");
    var status = form.querySelector(".hz8-cform__status");
    var summary = form.querySelector(".hz8-cform__summary");
    var submit = form.querySelector(".hz8-cform__submit");
    var key = window.config && window.config.rcsk;
    function renderCaptcha() {
      if (widget !== null || !key) return;
      if (window.grecaptcha && window.grecaptcha.render) {
        try { widget = window.grecaptcha.render(captcha, { sitekey: key, hl: "sv" }); } catch (e) { widget = null; }
      }
    }
    if (window.grecaptcha && window.grecaptcha.ready) window.grecaptcha.ready(renderCaptcha); else renderCaptcha();
    form.addEventListener("focusin", renderCaptcha, { once: true });
    if (!key) {
      submit.disabled = true;
      status.textContent = "Formuläret kan inte skickas just nu. Mejla hej@hazey.se så hjälper vi dig.";
    }
    form.addEventListener("input", function (e) { if (e.target.name) setErr(form, e.target.name, ""); });
    form.addEventListener("change", function (e) { if (e.target.name) setErr(form, e.target.name, ""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      var v = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
      var errs = [];
      var topic = TOPICS.filter(function (t) { return t.key === v("topic"); })[0];
      if (!topic) errs.push(["topic", "Välj vad ärendet gäller."]);
      if (!v("name")) errs.push(["name", "Skriv ditt namn."]);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) errs.push(["email", "Skriv en giltig e-postadress, t.ex. namn@exempel.se."]);
      if (v("message").length < 10) errs.push(["message", "Skriv minst 10 tecken så att vi förstår ärendet."]);
      var token = widget !== null && window.grecaptcha ? window.grecaptcha.getResponse(widget) : "";
      if (!token) errs.push(["g-recaptcha-response", "Bekräfta att du inte är en robot."]);
      ["topic", "name", "email", "message", "g-recaptcha-response"].forEach(function (n) { setErr(form, n, ""); });
      if (errs.length) { showErrors(errs); return; }
      busy = true; submit.setAttribute("aria-busy", "true"); submit.disabled = true;
      status.textContent = "Skickar …";
      var message = "Ärende: " + topic.label + (v("order") ? "\nOrdernummer: " + v("order") : "") + "\n\n" + v("message");
      fetch("/frontend-api/contact-form", {
        method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(),
        body: JSON.stringify({ name: v("name"), email: v("email"), phone: "", message: message, "g-recaptcha-response": token })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
      }).then(function (res) {
        if (res.ok) { success(v("email")); return; }
        var map = { name: "name", email: "email", message: "message", "g-recaptcha-response": "g-recaptcha-response" };
        var list = Object.keys((res.data && res.data.errors) || {}).map(function (k) { return [map[k] || "message", [].concat(res.data.errors[k])[0]]; });
        if (!list.length) list.push(["message", "Meddelandet kunde inte skickas (" + res.status + "). Försök igen, eller mejla hej@hazey.se."]);
        showErrors(list);
      }).catch(function () {
        showErrors([["message", "Ingen kontakt med servern. Kontrollera anslutningen och försök igen, eller mejla hej@hazey.se."]]);
      }).then(function () {
        busy = false; submit.removeAttribute("aria-busy"); submit.disabled = false;
        if (widget !== null && window.grecaptcha && !form.classList.contains("is-sent")) window.grecaptcha.reset(widget);
      });
    });
    function showErrors(list) {
      list.forEach(function (x) { setErr(form, x[0], x[1]); });
      status.textContent = "";
      summary.textContent = list.length === 1 ? "Kontrollera fältet som är markerat." : "Kontrollera de " + list.length + " fält som är markerade.";
      summary.hidden = false;
      var first = form.querySelector('[aria-invalid="true"]') || captcha;
      if (first && first.focus) first.focus();
    }
    function success(email) {
      form.classList.add("is-sent");
      form.innerHTML = '<div class="hz8-cform__done" tabindex="-1">' + icon("check", "hz8-cform__done-ic") +
        '<h2>Tack! Ditt meddelande är skickat.</h2><p>Vi svarar till <strong>' + esc(email) + "</strong>. Hittar du inte svaret, titta i skräpposten.</p>" +
        '<a class="hz8-svc-btn hz8-svc-btn--ghost" href="' + esc(link("/sv/page/faq")) + '">Till vanliga frågor</a></div>';
      form.querySelector(".hz8-cform__done").focus();
    }
    return {
      select: function (key) {
        var s = form.querySelector('[name="topic"]');
        if (!s) return;
        s.value = key; setErr(form, "topic", "");
        var msg = form.querySelector('[name="' + (key === "order" || key === "retur" ? "order" : "message") + '"]');
        form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        if (msg) window.setTimeout(function () { msg.focus({ preventScroll: true }); }, 250);
      }
    };
  }

  function initContact(page) {
    var root = page.querySelector(".nh-contact");
    if (!root || document.querySelector(".hz8-contact")) return;
    var h1 = root.querySelector("h1");
    var lead = root.querySelector(".nh-contact__hero p");
    /* Facitets hierarki: desktop och mobil har olika rubrik; en H1 med
       två varianter (den dolda är display:none och läses inte upp). */
    if (h1) h1.innerHTML = '<span class="hz8-v hz8-v--d">Vi finns här<br>för dig</span><span class="hz8-v hz8-v--m">Vad kan vi hjälpa dig med?</span>';
    if (lead) lead.innerHTML = '<span class="hz8-v hz8-v--d">Har du en fråga om din order, en produkt eller behöver hjälp med en retur? Skicka ett meddelande så hjälper vi dig.</span><span class="hz8-v hz8-v--m">Välj ett ämne nedan eller fyll i formuläret.</span>';
    var preset = (function () { try { return new URLSearchParams(location.search).get("arende"); } catch (e) { return null; } })();
    var points = [
      { icon: "truck", title: "Order och leverans", text: "Frågor om din beställning och leverans.", href: "/sv/page/faq#leverans" },
      { icon: "box", title: "Produkter", text: "Frågor om våra produkter och kategorier.", href: "/sv/page/faq#produkter" },
      { icon: "ret", title: "Retur och reklamation", text: "Hjälp med retur eller reklamation.", href: "/sv/page/faq#retur" }
    ];
    var below = '<ul class="hz8-svc-points">' + points.map(function (p) {
      return '<li><a href="' + esc(link(p.href)) + '">' + icon(p.icon) + "<span><strong>" + esc(p.title) + "</strong>" + esc(p.text) + "</span></a></li>";
    }).join("") + "</ul>";
    var sec = mast({ variant: "photo", h1: h1, lead: lead, crumb: "Kontakt", below: below, aside: " " });

    var wrap = document.createElement("div");
    wrap.className = "hz8-contact";
    wrap.innerHTML =
      '<div class="hz8-contact__panel">' +
        '<section class="hz8-contact__topics" aria-labelledby="hz8-ct-title"><h2 id="hz8-ct-title">Välj ett ämne</h2><ul class="hz8-svc-lines hz8-svc-lines--icons">' +
          TOPICS.map(function (t) { return '<li><button type="button" data-topic="' + t.key + '">' + icon(t.icon) + "<span>" + esc(t.label) + "</span>" + icon("chev") + "</button></li>"; }).join("") +
        "</ul></section>" +
        buildForm(TOPICS.some(function (t) { return t.key === preset; }) ? preset : "") +
        '<section class="hz8-contact__ways" aria-labelledby="hz8-cw-title"><h2 id="hz8-cw-title">Andra kontaktvägar</h2>' +
          ways('<li>' + icon("pin") + "<div><span class=\"hz8-svc-ways__static\">Stockholm, Sverige</span><span>Adress</span></div></li>") + "</section>" +
      "</div>" +
      '<nav class="hz8-svc-dest" aria-label="Genvägar"><h2 class="hz8-svc-dest__title">Gå direkt till vanliga destinationer</h2><ul>' +
        [{ icon: "box", t: "Beställning", s: "Order och bekräftelse", h: "/sv/page/faq#bestallning" },
         { icon: "truck", t: "Leverans", s: "Frakt, spårning och diskret paket", h: "/sv/page/faq#leverans" },
         { icon: "ret", t: "Retur", s: "Retur och reklamation", h: "/sv/page/faq#retur" },
         { icon: "book", t: "Köp- och leveransvillkor", s: "Våra fullständiga villkor", h: "/sv/page/kop-och-leveransvillkor" }].map(function (d) {
          return '<li><a href="' + esc(link(d.h)) + '">' + icon(d.icon) + "<span><strong>" + esc(d.t) + "</strong>" + esc(d.s) + "</span>" + icon("chev") + "</a></li>";
        }).join("") + "</ul></nav>";
    var note = root.querySelector(".nh-contact__note");
    if (note) { note.classList.add("hz8-contact__note"); wrap.appendChild(note); }
    root.parentNode.insertBefore(wrap, root);
    root.classList.add("hz8-contact-replaced");
    /* Formulärpanelen hör till mastheaden (facit: ovanpå bilden på
       desktop, direkt under rubriken på mobil). */
    var panel = wrap.querySelector(".hz8-contact__panel");
    if (sec) sec.querySelector(".hz8-svc-mast__aside").appendChild(panel);
    var ctl = wireForm(panel.querySelector(".hz8-cform"));
    panel.querySelector(".hz8-contact__topics").addEventListener("click", function (e) {
      var b = e.target.closest("[data-topic]");
      if (b) ctl.select(b.getAttribute("data-topic"));
    });
    document.documentElement.classList.add("hz8-svc-contact");
  }

  /* =====================================================================
     2. VANLIGA FRÅGOR
     ===================================================================== */
  function initFaq(page) {
    var items = Array.prototype.slice.call(page.querySelectorAll("details.nh-faq__item, .nh-faq details"));
    if (!items.length || document.querySelector(".hz8-faq")) return;
    var titleEl = page.querySelector(".nh-faq__title");
    var groups = {};
    items.forEach(function (d) {
      var q = (d.querySelector("summary") || d).textContent.trim();
      var a = d.textContent.replace(q, "");
      var k = classify(q, a);
      (groups[k] = groups[k] || []).push(d);
      d.classList.add("hz8-faq__item");
      var s = d.querySelector("summary");
      if (s && !s.querySelector(".hz8-faq__chev")) s.insertAdjacentHTML("beforeend", icon("chev", "hz8-faq__chev"));
    });
    var topics = FAQ_TOPICS.filter(function (t) { return groups[t.key]; });
    var names = topics.map(function (t) { return t.short || t.label.toLowerCase(); });
    var lead = "Här har vi samlat svar på vanliga frågor om " + (names.length > 1 ? names.slice(0, -1).join(", ") + " och " + names[names.length - 1] : names[0]) + ".";
    mast({ variant: "photo", h1: titleEl ? titleEl.textContent.trim() : "Vanliga frågor", lead: lead, crumb: "Vanliga frågor" });
    if (titleEl) titleEl.classList.add("hz8-visually-hidden");

    var root = document.createElement("div");
    root.className = "hz8-faq";
    root.innerHTML =
      '<nav class="hz8-faq__nav" aria-label="Ämnen"><p class="hz8-faq__nav-title">Alla ämnen</p><ul>' + topics.map(function (t) {
        return '<li><a href="#' + t.key + '">' + icon(t.icon) + "<span>" + esc(t.label) + "</span>" + icon("chev", "hz8-faq__nav-chev") + "</a></li>";
      }).join("") + "</ul></nav>" +
      '<div class="hz8-faq__main"><div class="hz8-faq__search" role="search">' + icon("search") +
        '<label class="hz8-visually-hidden" for="hz8-faq-q">Sök bland vanliga frågor</label>' +
        '<input id="hz8-faq-q" type="search" placeholder="Sök bland vanliga frågor" autocomplete="off" aria-describedby="hz8-faq-count">' +
        '<p id="hz8-faq-count" class="hz8-faq__count" aria-live="polite"></p></div>' +
        topics.map(function (t) {
          return '<section class="hz8-faq__group" id="' + t.key + '" aria-labelledby="hz8-faq-h-' + t.key + '"><h2 id="hz8-faq-h-' + t.key + '">' + esc(t.label) + '</h2><div class="hz8-faq__list"></div></section>';
        }).join("") +
        '<div class="hz8-faq__empty" hidden><h2>Ingen fråga matchar din sökning</h2><p>Prova ett annat ord, eller kontakta oss så hjälper vi dig.</p><a class="hz8-svc-btn hz8-svc-btn--ghost" href="' + esc(contactUrl()) + '">Kontakta oss</a></div>' +
      "</div>" +
      helpRail({ rows: true, icon: "help", title: "Hittar du inte svaret?", text: "Kontakta oss så hjälper vi dig. Välj det sätt som passar dig bäst." });
    topics.forEach(function (t) {
      var list = root.querySelector("#" + t.key + " .hz8-faq__list");
      groups[t.key].forEach(function (d) { list.appendChild(d); });
    });
    var host = page.querySelector(".nh-faq") || items[0].parentNode;
    host.parentNode.insertBefore(root, host);
    host.classList.add("hz8-faq-source");
    page.querySelectorAll(".hz8-faq-tools, .hz8-faq-contact, .hz8-page-head").forEach(function (n) { n.remove(); });

    var input = root.querySelector("#hz8-faq-q");
    var count = root.querySelector("#hz8-faq-count");
    var empty = root.querySelector(".hz8-faq__empty");
    function update() {
      var q = norm(input.value.trim());
      var shown = 0;
      topics.forEach(function (t) {
        var sec = root.querySelector("#" + t.key), n = 0;
        groups[t.key].forEach(function (d) {
          var hit = !q || norm(d.textContent).indexOf(q) !== -1;
          d.hidden = !hit;
          if (hit) n += 1;
          if (q && hit && !d.open) { d.open = true; d.setAttribute("data-hz8-auto-open", "1"); }
          if (!q && d.getAttribute("data-hz8-auto-open")) { d.open = false; d.removeAttribute("data-hz8-auto-open"); }
        });
        sec.hidden = n === 0;
        shown += n;
      });
      count.textContent = q ? shown + (shown === 1 ? " fråga" : " frågor") + " matchar" : items.length + " frågor";
      empty.hidden = shown > 0;
    }
    input.addEventListener("input", update);
    update();
    /* Mobil (facit): ett ämne i taget, första frågan öppen. Desktop:
       alla ämnen, navigeringen scrollar. */
    var mob = window.matchMedia("(max-width: 767px)");
    var navLinks = Array.prototype.slice.call(root.querySelectorAll(".hz8-faq__nav a"));
    function showTopic(key, openFirst) {
      topics.forEach(function (t) { root.querySelector("#" + t.key).classList.toggle("is-current", t.key === key); });
      navLinks.forEach(function (l) { var on = l.getAttribute("href") === "#" + key; l.classList.toggle("is-active", on); if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
      var first = openFirst && root.querySelector("#" + key + " .hz8-faq__item");
      if (first && !root.querySelector("#" + key + " .hz8-faq__item[open]")) first.open = true;
    }
    function syncMode() {
      var filter = mob.matches && !input.value.trim();
      document.documentElement.classList.toggle("hz8-faq-filter", filter);
      if (filter) { var cur = root.querySelector(".hz8-faq__group.is-current"); showTopic(cur ? cur.id : (location.hash.slice(1) && topicByKey(location.hash.slice(1)) ? location.hash.slice(1) : topics[0].key), true); }
    }
    root.querySelector(".hz8-faq__nav").addEventListener("click", function (e) {
      var a = e.target.closest("a[href^='#']");
      if (!a || !mob.matches) return;
      e.preventDefault();
      if (input.value) { input.value = ""; update(); }
      showTopic(a.getAttribute("href").slice(1), true);
      document.documentElement.classList.add("hz8-faq-filter");
      if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
      a.scrollIntoView({ block: "nearest", inline: "center" });
    });
    input.addEventListener("input", syncMode);
    if (mob.addEventListener) mob.addEventListener("change", syncMode);
    syncMode();
    if (!mob.matches) spy(navLinks, topics.map(function (t) { return root.querySelector("#" + t.key); }));
    if (!mob.matches) scrollToHash(root);
    document.documentElement.classList.add("hz8-svc-faq");
  }

  /* =====================================================================
     3. DOKUMENTMALL (villkor, integritet, andra långa dokument)
     ===================================================================== */
  function initDocument(page) {
    if (document.querySelector(".hz8-doc")) return true;
    var heads = Array.prototype.filter.call(page.querySelectorAll("h2, h3"), function (h) { return /^\d+\.\s+\S/.test(h.textContent.trim()); });
    if (heads.length < 5 || (page.textContent || "").length < 2000) return false;
    var h1 = page.querySelector("h1");
    /* Varumärket står redan i sidans header och titel -- den synliga
       rubriken visar bara dokumentnamnet (texten i övrigt orörd). */
    if (h1 && /\s[–-]\s*Hazey\.se\s*$/i.test(h1.textContent)) h1.textContent = h1.textContent.replace(/\s[–-]\s*Hazey\.se\s*$/i, "").trim();
    mast({ variant: "band", h1: h1 });
    var body = document.createElement("div");
    body.className = "hz8-doc";
    var toc = heads.map(function (h, i) {
      if (!h.id) h.id = "avsnitt-" + (i + 1);
      h.classList.add("hz8-doc__h");
      var m = h.textContent.trim().match(/^(\d+)\.\s+(.*)$/);
      if (m && !h.querySelector(".hz8-doc__num")) h.innerHTML = '<span class="hz8-doc__num">' + esc(m[1]) + '.</span> <span>' + esc(m[2]) + "</span>";
      return { id: h.id, num: m ? m[1] : String(i + 1), text: m ? m[2] : h.textContent.trim() };
    });
    body.innerHTML =
      '<nav class="hz8-doc__toc" aria-label="Innehåll på sidan"><details class="hz8-doc__toc-box"><summary class="hz8-doc__toc-title"><span>På denna sida</span><span class="hz8-doc__toc-count">' + toc.length + " avsnitt</span>" + icon("chev", "hz8-doc__toc-chev") + "</summary><ol>" + toc.map(function (t) {
        return '<li><a href="#' + t.id + '"><span class="hz8-doc__toc-num">' + esc(t.num) + ".</span><span>" + esc(t.text) + "</span></a></li>";
      }).join("") + "</ol></details></nav>" +
      '<div class="hz8-doc__text"></div>' +
      helpRail({ title: "Har du frågor?", text: "Kundservice hjälper dig gärna med frågor om beställningar, leveranser, returer och produkter.", cta: "Kontakta kundservice",
        related: [{ label: "Fråga om min order", href: contactUrl("order") }, { label: "Fråga om en produkt", href: contactUrl("produkt") }, { label: "Retur eller reklamation", href: contactUrl("retur") }, { label: "Vanliga frågor om leverans", href: link("/sv/page/faq#leverans") }] });
    var text = body.querySelector(".hz8-doc__text");
    /* Dokumentets egna block flyttas oförändrade in i läskolumnen. */
    Array.prototype.slice.call(page.children).forEach(function (n) {
      if (n.classList.contains("hz8-page-head") && !n.querySelector("h1")) { n.remove(); return; }
      if (n.classList.contains("hz8-toc")) { n.remove(); return; }
      text.appendChild(n);
    });
    page.appendChild(body);
    /* Index: alltid öppet på desktop (sticky lista), hopfällt på mobil
       så att inga avsnitt klipps av i en horisontell rad. */
    var box = body.querySelector(".hz8-doc__toc-box");
    var wide = window.matchMedia("(min-width: 768px)");
    var syncToc = function () { box.open = wide.matches; };
    syncToc();
    if (wide.addEventListener) wide.addEventListener("change", syncToc);
    box.addEventListener("click", function (e) { if (e.target.closest("a") && !wide.matches) box.open = false; });
    /* "Uppdaterad: …" (dokumentets egen rubrik) visas som metarad. */
    Array.prototype.forEach.call(text.querySelectorAll("h2, h3, h4, p"), function (el) {
      if (/^\s*Uppdaterad:/i.test(el.textContent) && el.textContent.length < 60) el.classList.add("hz8-doc__meta");
    });
    /* Admininnehållet (inklistrat från WooCommerce) har inline-färg och
       -storlek på länkar; bara presentationen tas bort, texten rörs inte. */
    text.querySelectorAll("a[style]").forEach(function (a) { a.style.removeProperty("color"); a.style.removeProperty("font-size"); });
    spy(Array.prototype.slice.call(body.querySelectorAll(".hz8-doc__toc a")), toc.map(function (t) { return document.getElementById(t.id); }));
    document.documentElement.classList.add("hz8-svc-doc");
    return true;
  }

  /* =====================================================================
     4. SÖKNING
     ===================================================================== */
  function searchQuery() { try { return (new URLSearchParams(location.search).get("query") || "").trim(); } catch (e) { return ""; } }
  function searchUrl(q) { return link("/" + locale() + "/search?query=" + encodeURIComponent(q)); }
  function initSearch() {
    var head = document.querySelector(".search-result__header");
    if (!head || document.querySelector(".hz8-svc-mast")) return;
    var q = searchQuery();
    var countText = (head.querySelector("p") || {}).textContent || "";
    var n = parseInt((countText.match(/\d+/) || [])[0], 10);
    var none = q && n === 0;
    var title = !q ? "Sök i sortimentet" : none ? "Inga produkter hittades" : 'Sökresultat för <span class="hz8-svc-q">”' + esc(q) + "”</span>";
    var lead = !q ? "Sök bland produkter, serier och varumärken." : none ? 'Vi hittade inga produkter som matchar <strong class="hz8-svc-q">”' + esc(q) + "”</strong>." : (isNaN(n) ? "" : n + (n === 1 ? " produkt hittades." : " produkter hittades."));
    var form = '<form class="hz8-sform" role="search" action="/' + locale() + '/search" method="get">' +
      '<div class="hz8-sform__field">' + icon("search") + '<label class="hz8-visually-hidden" for="hz8-sform-q">Sök produkter</label>' +
      '<input id="hz8-sform-q" name="query" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" value="' + esc(q) + '" placeholder="Sök produkter, serier, varumärken">' +
      '<button type="button" class="hz8-sform__clear" aria-label="Rensa sökningen"' + (q ? "" : " hidden") + ">" + icon("close") + "</button></div>" +
      '<button type="submit" class="hz8-svc-btn hz8-svc-btn--cta">Sök</button></form>' +
      (none ? '<p class="hz8-sform__hint">Kontrollera stavningen eller prova ett annat sökord.</p>' : "");
    var sec = mast({ variant: "photo", h1: title, lead: lead, crumb: "Sökresultat", below: form });
    head.classList.add("hz8-search-native-head");
    var f = sec.querySelector(".hz8-sform"), inp = f.querySelector("input"), clr = f.querySelector(".hz8-sform__clear");
    inp.addEventListener("input", function () { clr.hidden = !inp.value; });
    clr.addEventListener("click", function () { inp.value = ""; clr.hidden = true; inp.focus(); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = inp.value.trim();
      if (!v) { inp.value = ""; inp.focus(); return; }
      location.href = searchUrl(v);
    });
    document.documentElement.classList.add("hz8-svc-search");
    if (none) searchEmpty(head);
  }
  /* Kategoriplattor: headerns verifierade kategorier; bild = första
     riktiga produktbilden på respektive kategorisida. Utan bild visas
     ett olivfält (ingen påhittad bild). */
  function searchEmpty(head) {
    var want = ["Vapes", "Buds", "Hasch", "CBD"];
    var cats = (HZ8.navCategories || []).filter(function (c) { return want.indexOf(c.label) !== -1 && c.href; });
    cats.sort(function (a, b) { return want.indexOf(a.label) - want.indexOf(b.label); });
    var best = (HZ8.navCategories || []).filter(function (c) { return /bästsälj/i.test(c.label); })[0];
    var all = (HZ8.navCategories || []).filter(function (c) { return /alla produkter/i.test(c.label); })[0];
    /* Sökexempel = riktiga serienamn ur relationskartan (inga påhittade
       "populära" sökningar -- Nyehandels popular_searches är tom). */
    var examples = [];
    try {
      examples = HZ8.catalog.build().series.filter(function (x) { return x.hub && !/^thc[ab]/i.test(x.name); }).map(function (x) { return x.name; }).slice(0, 5);
    } catch (e) { examples = []; }
    var box = document.createElement("section");
    box.className = "hz8-sempty";
    box.setAttribute("aria-labelledby", "hz8-sempty-title");
    box.innerHTML = '<p class="hz8-svc-eyebrow">Populära kategorier</p><h2 id="hz8-sempty-title">Utforska sortimentet</h2>' +
      '<p class="hz8-sempty__lead">Hitta det du söker bland våra kategorier – eller få hjälp av kundservice.</p>' +
      '<ul class="hz8-sempty__tiles">' + cats.map(function (c) {
        return '<li><a href="' + esc(link(c.href)) + '" data-src="' + esc(c.href) + '"><span class="hz8-sempty__img" aria-hidden="true"></span><span class="hz8-sempty__label">' + esc(c.label) + "</span>" + icon("chev") + "</a></li>";
      }).join("") + "</ul>" +
      '<div class="hz8-sempty__cta">' +
        (best ? '<a class="hz8-svc-btn hz8-svc-btn--dark" href="' + esc(link(best.href)) + '">' + icon("star") + "<span>Se våra bästsäljare</span>" + icon("arrow") + "</a>" : "") +
        (all ? '<a class="hz8-svc-btn hz8-svc-btn--ghost" href="' + esc(link(all.href)) + '">' + icon("grid") + "<span>Alla produkter</span></a>" : "") +
      "</div>" +
      (examples.length ? '<div class="hz8-sempty__examples"><p class="hz8-sempty__ex-title">Sök till exempel</p><ul>' + examples.map(function (x) {
        return '<li><a href="' + esc(searchUrl(x)) + '">' + icon("search") + "<span>" + esc(x) + "</span></a></li>";
      }).join("") + "</ul></div>" : "") +
      '<aside class="hz8-sempty__help hz8-svc-help" aria-labelledby="hz8-sempty-help-title"><h2 id="hz8-sempty-help-title">Fick du inga träffar?</h2>' +
        "<p>Kontakta oss så hjälper vi dig att hitta rätt, eller läs svaren på vanliga frågor.</p>" +
        '<a class="hz8-svc-btn hz8-svc-btn--cta" href="' + esc(contactUrl("produkt")) + '">' + icon("chat") + "<span>Skicka ett meddelande</span>" + icon("arrow") + "</a>" +
        '<h3 class="hz8-svc-help__sub">Fler sätt att få hjälp</h3><ul class="hz8-svc-lines hz8-svc-lines--icons">' +
        '<li><a href="mailto:hej@hazey.se">' + icon("mail") + "<span>hej@hazey.se</span>" + icon("chev") + "</a></li>" +
        '<li><a href="' + esc(link("/sv/page/faq")) + '">' + icon("doc") + "<span>Vanliga frågor</span>" + icon("chev") + "</a></li>" +
        '<li><a href="' + esc(link("/sv/categories/alla-produkter")) + '">' + icon("grid") + "<span>Alla produkter</span>" + icon("chev") + "</a></li></ul></aside>" +
      '<ul class="hz8-svc-trio">' +
        [{ i: "chat", t: "Kundservice", s: "Hör av dig om du har frågor om produkter, en order eller retur.", h: "/sv/page/kontakt" },
         { i: "doc", t: "Vanliga frågor", s: "Svar om beställning, leverans och betalning.", h: "/sv/page/faq" },
         { i: "book", t: "Köp- och leveransvillkor", s: "Frakt, retur och reklamation.", h: "/sv/page/kop-och-leveransvillkor" }].map(function (x) {
          return '<li><a href="' + esc(link(x.h)) + '">' + icon(x.i) + "<span><strong>" + esc(x.t) + "</strong>" + esc(x.s) + "</span></a></li>";
        }).join("") + "</ul>";
    head.parentNode.insertBefore(box, head.nextSibling);
    /* Varje platta: första produktbilden i kategorin som inte redan
       används av en tidigare platta. */
    var anchors = Array.prototype.slice.call(box.querySelectorAll("a[data-src]"));
    Promise.all(anchors.map(function (a) {
      return HZ8.fetchPage(a.getAttribute("data-src"), HZ8.categoryCards).catch(function () { return []; });
    })).then(function (lists) {
      var used = {};
      anchors.forEach(function (a, i) {
        var img = a.querySelector(".hz8-sempty__img"), url = null;
        (lists[i] || []).some(function (c) { var m = c.html.match(/<img[^>]+src="([^"]+)"/); if (m && !used[m[1]]) { url = m[1]; return true; } return false; });
        if (!url) { a.classList.add("is-plain"); img.innerHTML = icon("grid"); return; }
        used[url] = true;
        img.style.backgroundImage = 'url("' + url.replace(/"/g, "%22") + '")';
        a.classList.add("has-img");
      });
    });
  }

  /* =====================================================================
     5–6. BLOCK: Om Hazey, Leverans och retur (theme8/blocks/*.html)
     Blockets egen masthead ([data-hz8-mast]) lyfts upp ovanför sidans
     innehåll; commerce-värden och FAQ-utdrag fylls från riktiga källor.
     ===================================================================== */
  function liftBlockMast(page) {
    var m = page.querySelector("[data-hz8-mast]");
    if (!m || document.querySelector(".hz8-svc-mast")) return;
    var h1 = m.querySelector("h1"), lead = m.querySelector("p");
    var aside = m.querySelector("[data-hz8-mast-aside]");
    var sec = mast({ variant: m.getAttribute("data-hz8-mast") || "photo", h1: h1, lead: lead, aside: aside ? " " : "" });
    if (aside && sec) sec.querySelector(".hz8-svc-mast__aside").replaceChildren(aside);
    if (sec && m.getAttribute("data-hz8-mast-image")) sec.classList.add("hz8-svc-mast--" + m.getAttribute("data-hz8-mast-image"));
    if (sec && page.querySelector(".hz8-about2")) sec.classList.add("hz8-svc-mast--about");
    m.remove();
  }
  function fillCommerce(root) {
    var C = HZ8.commerce;
    if (!C) return;
    var R = C.rules, on = C.goalsEnabled();
    root.querySelectorAll("[data-hz8-fact]").forEach(function (el) {
      var k = el.getAttribute("data-hz8-fact");
      var t = k === "free" ? "Fri frakt från " + R.freeShippingFrom + " kr" : k === "fee" ? R.shippingFee + " kr under gränsen" : k === "country" ? "Endast Sverige" :
        k === "rule" ? "Fri frakt från " + R.freeShippingFrom + " kr – gränsen räknas på varuvärdet efter rabatt. Under gränsen är frakten " + R.shippingFee + " kr." : "";
      /* Frakt-/prislöften följer lanseringsspärren i 02a-commerce.js. */
      if (!on && (k === "free" || k === "fee" || k === "rule")) { (el.closest("li") || el).hidden = true; return; }
      el.textContent = t;
    });
  }
  function initTabs(root) {
    var list = root.querySelector('[role="tablist"]');
    if (!list || list.getAttribute("data-hz8-bound")) return;
    list.setAttribute("data-hz8-bound", "1");
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    }
    list.addEventListener("click", function (e) { var t = e.target.closest('[role="tab"]'); if (t) select(t); });
    list.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
      if (j === null) return;
      e.preventDefault();
      select(tabs[(j + tabs.length) % tabs.length], true);
    });
    var hashTab = location.hash && tabs.filter(function (t) { return "#" + t.getAttribute("aria-controls") === location.hash || "#" + t.id === location.hash; })[0];
    select(hashTab || tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
  }
  /* Utdrag ur butikens riktiga FAQ (samma klassning som FAQ-sidan). */
  function faqExcerpt(root) {
    var host = root.querySelector("[data-hz8-faq-topic]");
    if (!host || host.getAttribute("data-hz8-filled")) return;
    host.setAttribute("data-hz8-filled", "1");
    var topic = host.getAttribute("data-hz8-faq-topic");
    HZ8.fetchPage("/sv/page/faq", { key: "faq-items", run: function (doc) {
      return Array.prototype.map.call(doc.querySelectorAll("details"), function (d) {
        var s = d.querySelector("summary");
        return { q: s ? s.textContent.trim() : "", a: d.innerHTML.replace(s ? s.outerHTML : "", "") };
      });
    } }).then(function (list) {
      var picked = list.filter(function (x) { return x.q && classify(x.q, x.a.replace(/<[^>]+>/g, " ")) === topic; }).slice(0, 5);
      if (!picked.length) { host.hidden = true; return; }
      host.querySelector(".hz8-faq__list").innerHTML = picked.map(function (x) {
        var tmp = document.createElement("div"); tmp.innerHTML = x.a;
        tmp.querySelectorAll("script, style, [on]").forEach(function (n) { n.remove(); });
        return '<details class="hz8-faq__item"><summary>' + esc(x.q) + icon("chev", "hz8-faq__chev") + '</summary><div class="hz8-faq__a">' + tmp.innerHTML + "</div></details>";
      }).join("");
    }).catch(function () { host.hidden = true; });
  }
  /* Leverans (mobil): flikarna ska ligga direkt under mastheaden, före
     tidslinjen -- flyttas mellan sina två platser efter bredd. */
  function placeDeliveryTabs() {
    var tabs = document.querySelector(".hz8-dlv .hz8-tabs, .hz8-svc-mast .hz8-tabs");
    var aside = document.querySelector(".hz8-svc-mast__aside");
    var home = document.querySelector(".hz8-dlv > div:first-child");
    if (!tabs || !aside || !home) return;
    var mq = window.matchMedia("(max-width: 767px)");
    var place = function () {
      if (mq.matches && tabs.parentNode !== aside) aside.insertBefore(tabs, aside.firstChild);
      else if (!mq.matches && tabs.parentNode !== home) home.insertBefore(tabs, home.firstChild);
    };
    place();
    if (mq.addEventListener) mq.addEventListener("change", place);
    aside.addEventListener("click", function (e) {
      var t = e.target.closest('[role="tab"]');
      if (t && mq.matches) { var p = document.getElementById(t.getAttribute("aria-controls")); if (p) p.scrollIntoView({ block: "start" }); }
    });
  }
  function initBlocks(page) {
    if (!page.querySelector("[data-hz8-mast]")) return false;
    page.querySelectorAll("[data-hz8-icon]").forEach(function (el) {
      if (!el.firstChild) el.outerHTML = icon(el.getAttribute("data-hz8-icon"));
    });
    page.querySelectorAll("[data-hz8-help]").forEach(function (el) {
      el.outerHTML = helpRail({ title: "Hittar du inte svaret?", text: "Kundservice hjälper dig gärna med frågor om leverans, retur och reklamation.", cta: "Kontakta oss" });
    });
    liftBlockMast(page);
    var main = document.getElementById("store-main");
    fillCommerce(main);
    initTabs(main);
    placeDeliveryTabs();
    if (main.querySelector(".hz8-steps")) document.documentElement.classList.add("hz8-svc-dlv");
    faqExcerpt(main);
    return true;
  }

  HZ8.service.initContact = initContact;
  HZ8.service.initFaq = initFaq;
  HZ8.service.initDocument = initDocument;
  HZ8.service.initSearch = initSearch;
  HZ8.service.initBlocks = initBlocks;
})();
