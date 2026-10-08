/* "Hjälp oss göra Hazey bättre" (2026-10-08): feedbackmodul mellan
   kundomdömena och FAQ. Referens (art direction, inte data):
   theme8/review/approved-references-2026-10/feedback-approved-postcard.png

   MOTTAGARE SAKNAS (kontrollerat 2026-10-08, read-only):
   Kontaktsidan /sv/page/kontakt har bara HTML-formulär med
   action="mailto:hej@hazey.se" (namn och e-post obligatoriska). Nyehandel
   exponerar ingen kontakt-/formulär-endpoint i sitt frontend-API, och
   mailto/externa formulärtjänster får inte användas. Därför är
   submit-adaptern nedan isolerad med ENDPOINT = null: formuläret
   validerar och visar en ärlig dev-status, men skickar ingenting och
   visar aldrig ett lyckat resultat utan en riktig serverrespons.
   För att göra formuläret verkligt behövs en server-endpoint (Nyehandel
   eller egen) som tar emot { type, subject, message, email } via POST
   med plattformens CSRF-skydd och egen spamhantering/rate limit på
   servern -- sätt då ENDPOINT och kontrollera svarsformatet.

   Säkerhet: användartext renderas aldrig som HTML (bara value/
   textContent), loggas inte, lagras inte i localStorage och skickas inte
   till analytics. Dolt honeypot-fält. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var ENDPOINT = null;
  var TYPES = {
    site: { label: "Förbättra hemsidan", subject: "[Webbfeedback]", placeholder: "Vad kan vi göra tydligare eller bättre?" },
    product: { label: "Föreslå en produkt", subject: "[Produktförslag]", placeholder: "Vilken produkt eller kategori saknar du?" }
  };
  var PRIVACY = "/sv/page/integritetspolicy";
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  /* Submit-adapter: enda stället som pratar med en mottagare. */
  function send(payload) {
    if (!ENDPOINT) return Promise.reject({ code: "no-endpoint" });
    return fetch(ENDPOINT, { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw { code: "http", status: r.status }; return true; })
      .catch(function (e) { throw e && e.code ? e : { code: "network" }; });
  }

  function sectionHtml() {
    return '<section class="hz8-home__section hz8-fb" aria-labelledby="hz8-fb-title">' +
      '<div class="hz8-fb__intro">' +
      '<p class="hz8-fb__eyebrow">Din åsikt gör skillnad</p>' +
      '<h2 class="hz8-fb__title" id="hz8-fb-title">Hjälp oss göra Hazey bättre</h2>' +
      '<p class="hz8-fb__lead">Saknar du en produkt eller något på sidan?<br>Vi läser varje förslag.</p>' +
      /* Dekor ur referensen: handskriven fras och liten sol (aria-hidden). */
      '<p class="hz8-fb__script" aria-hidden="true"><span>Same</span><span>Good</span><span>Days</span><span>Ahead</span>' +
      '<svg class="hz8-fb__sun" viewBox="0 0 64 30" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M18 24a14 14 0 0 1 28 0"/><path d="M2 26c20-1.5 40-1.5 60 0M32 2v6M17 7l3.5 5M47 7l-3.5 5M8 15l5 3M56 15l-5 3"/></svg></p></div>' +
      /* Lager: pappersark, tyg (pointer-events: none) och formuläret
         överst -- tyget ligger över arkets nedre högra kant men under alla
         kontroller. Valflikarna sitter på arkets överkant. */
      '<div class="hz8-fb__card">' +
      '<span class="hz8-fb__sheet" aria-hidden="true"></span>' +
      '<span class="hz8-fb__fabric" aria-hidden="true"></span>' +
      '<form class="hz8-fb__form" novalidate>' +
      '<fieldset class="hz8-fb__types"><legend class="hz8-visually-hidden">Vad gäller ditt förslag?</legend>' +
      Object.keys(TYPES).map(function (k, i) {
        return '<label class="hz8-fb__type"><input type="radio" name="type" value="' + k + '"' + (i === 0 ? ' checked' : '') + '><span class="hz8-fb__radio" aria-hidden="true"></span><span>' + TYPES[k].label + '</span></label>';
      }).join("") + '</fieldset>' +
      '<div class="hz8-fb__field"><label class="hz8-fb__label" for="hz8-fb-message">Ditt förslag</label>' +
      '<textarea class="hz8-fb__input hz8-fb__message" id="hz8-fb-message" name="message" rows="4" maxlength="2000" required aria-describedby="hz8-fb-message-error" placeholder="' + TYPES.site.placeholder + '"></textarea>' +
      '<p class="hz8-fb__error" id="hz8-fb-message-error" hidden>Skriv ditt förslag innan du skickar.</p></div>' +
      '<div class="hz8-fb__field"><label class="hz8-fb__label" for="hz8-fb-email">E-post (valfritt)</label>' +
      '<input class="hz8-fb__input" id="hz8-fb-email" name="email" type="email" inputmode="email" autocomplete="email" aria-describedby="hz8-fb-privacy hz8-fb-email-error">' +
      '<p class="hz8-fb__error" id="hz8-fb-email-error" hidden>Kontrollera e-postadressen, eller lämna fältet tomt.</p></div>' +
      '<div class="hz8-fb__hp" aria-hidden="true"><label>Lämna detta fält tomt<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<button type="submit" class="hz8-fb__submit"><span class="hz8-fb__submit-label">Skicka förslag</span>' + ARROW + '</button>' +
      '<p class="hz8-fb__privacy" id="hz8-fb-privacy">Du behöver inte ange namn eller e-post. <a href="' + HZ8.esc(HZ8.link(PRIVACY)) + '">Integritetspolicy</a></p>' +
      '<div class="hz8-fb__status" role="status" aria-live="polite"></div>' +
      '</form></div></section>';
  }

  function wire(section) {
    var form = section.querySelector(".hz8-fb__form");
    var message = form.querySelector("#hz8-fb-message");
    var email = form.querySelector("#hz8-fb-email");
    var msgErr = form.querySelector("#hz8-fb-message-error");
    var mailErr = form.querySelector("#hz8-fb-email-error");
    var button = form.querySelector(".hz8-fb__submit");
    var label = button.querySelector(".hz8-fb__submit-label");
    var status = form.querySelector(".hz8-fb__status");

    function type() { var c = form.querySelector('input[name="type"]:checked'); return c ? c.value : "site"; }
    form.addEventListener("change", function (e) {
      if (e.target.name === "type") message.setAttribute("placeholder", TYPES[type()].placeholder);
    });
    function setError(field, el, on) {
      el.hidden = !on;
      if (on) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
    }
    function setStatus(kind, text) {
      status.className = "hz8-fb__status" + (kind ? " is-" + kind : "");
      status.textContent = text;
    }
    message.addEventListener("input", function () { if (message.value.trim()) setError(message, msgErr, false); });
    email.addEventListener("input", function () { if (!email.value.trim() || email.checkValidity()) setError(email, mailErr, false); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (button.getAttribute("aria-busy") === "true") return;
      var text = message.value.trim();
      var mail = email.value.trim();
      var badText = !text;
      var badMail = !!mail && !email.checkValidity();
      setError(message, msgErr, badText);
      setError(email, mailErr, badMail);
      if (badText || badMail) { setStatus("", ""); (badText ? message : email).focus(); return; }
      if (form.elements.website.value) return; /* honeypot: botar får inget svar */

      button.setAttribute("aria-busy", "true");
      button.disabled = true;
      label.textContent = "Skickar…";
      setStatus("", "");
      send({ type: type(), subject: TYPES[type()].subject, message: text, email: mail || null })
        .then(function () {
          /* Endast efter en lyckad serverrespons. */
          form.reset();
          message.setAttribute("placeholder", TYPES.site.placeholder);
          setStatus("success", "Tack! Ditt förslag är skickat.");
        })
        .catch(function (err) {
          /* Texten ligger kvar i fälten i alla fellägen. */
          if (err.code === "no-endpoint") setStatus("info", "Formulärets mottagare kopplas innan publicering. Ditt förslag har inte skickats.");
          else setStatus("error", "Det gick inte att skicka förslaget. Kontrollera anslutningen och försök igen – din text finns kvar.");
        })
        .then(function () {
          button.removeAttribute("aria-busy");
          button.disabled = false;
          label.textContent = status.classList.contains("is-error") ? "Försök igen" : "Skicka förslag";
        });
    });
  }

  HZ8.register("homepage-feedback", function (context) {
    if (!context.home) return;
    var holder = document.createElement("div");
    holder.innerHTML = sectionHtml();
    var section = holder.firstChild;
    var reviews = context.home.querySelector(".hz8-rv");
    if (reviews && reviews.parentNode) reviews.parentNode.insertBefore(section, reviews.nextSibling);
    else context.home.appendChild(section);
    wire(section);
    /* Bakgrundsplåtar och tyg laddas först när sektionen närmar sig. */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); section.classList.add("is-lit"); }
      }, { rootMargin: "1200px 0px" });
      io.observe(section);
    } else section.classList.add("is-lit");
  });
})();
