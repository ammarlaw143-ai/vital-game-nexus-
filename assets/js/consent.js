/* Nexus Gaming — GDPR-style cookie consent (vanilla JS, file:// safe)
   Loads Google AdSense only after the visitor grants advertising consent,
   and drives Google Consent Mode v2 for analytics/ads signals. */
(function () {
  var KEY = "nexus_cookie_consent";
  var VERSION = 1;
  var ADS_CLIENT = "ca-pub-3595791569047109";

  /* ---------- consent mode defaults (must run before gtag config) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || p.version !== VERSION) return null;
      return p;
    } catch (e) { return null; }
  }

  function save(prefs) {
    var payload = {
      version: VERSION,
      necessary: true,
      analytics: !!prefs.analytics,
      ads: !!prefs.ads,
      updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch (e) {}
    return payload;
  }

  function pushConsent(p) {
    var granted = function (v) { return v ? "granted" : "denied"; };
    gtag("consent", "update", {
      analytics_storage: granted(p.analytics),
      ad_storage: granted(p.ads),
      ad_user_data: granted(p.ads),
      ad_personalization: granted(p.ads)
    });
    window.dataLayer.push({
      event: "cookie_consent_update",
      consent_analytics: !!p.analytics,
      consent_ads: !!p.ads,
      consent_updated_at: p.updatedAt
    });
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", "cookie_consent", {
          consent_analytics: !!p.analytics,
          consent_ads: !!p.ads
        });
      } catch (e) {}
    }
  }

  var adsLoaded = false;
  function loadAds() {
    if (adsLoaded || document.querySelector("script[data-nexus-ads]")) return;
    adsLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADS_CLIENT;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-nexus-ads", "1");
    document.head.appendChild(s);
  }

  function apply(p, opts) {
    pushConsent(p);
    if (p.ads) loadAds();
    else if (opts && opts.reloadOnRevoke && adsLoaded) location.reload();
  }

  /* ---------- banner UI ---------- */
  var el = null;

  function close() { if (el) { el.classList.remove("open"); setTimeout(function () { if (el) el.style.display = "none"; }, 200); } }

  function build() {
    if (el) return el;
    el = document.createElement("div");
    el.className = "cookie-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Cookie consent");
    el.innerHTML =
      '<div class="cookie-inner">' +
        '<div class="cookie-copy">' +
          '<h4>We use cookies</h4>' +
          '<p>Nexus Gaming uses cookies to keep the site working, to measure traffic, and to show advertising through Google AdSense. Advertising and analytics cookies load <strong>only</strong> after you accept. You can change your choice any time from “Cookie settings” in the footer. Read our <a href="privacy.html">Privacy Policy</a>.</p>' +
          '<div class="cookie-opts">' +
            '<label class="cookie-opt disabled"><input type="checkbox" checked disabled/> <span>Strictly necessary <em>always on</em></span></label>' +
            '<label class="cookie-opt"><input type="checkbox" id="ckAnalytics" checked/> <span>Analytics <em>Google Analytics</em></span></label>' +
            '<label class="cookie-opt"><input type="checkbox" id="ckAds" checked/> <span>Advertising <em>Google AdSense</em></span></label>' +
          '</div>' +
        '</div>' +
        '<div class="cookie-actions">' +
          '<button class="btn btn-primary" data-ck="all">Accept all</button>' +
          '<button class="btn btn-outline" data-ck="selected">Save choices</button>' +
          '<button class="btn btn-ghost" data-ck="reject">Reject non-essential</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ck]");
      if (!b) return;
      var mode = b.dataset.ck;
      var prefs = mode === "all" ? { analytics: true, ads: true }
                : mode === "reject" ? { analytics: false, ads: false }
                : { analytics: el.querySelector("#ckAnalytics").checked, ads: el.querySelector("#ckAds").checked };
      apply(save(prefs), { reloadOnRevoke: true });
      close();
    });
    return el;
  }

  function open() {
    var p = read();
    build();
    el.style.display = "block";
    var a = el.querySelector("#ckAnalytics"), d = el.querySelector("#ckAds");
    if (p) { a.checked = !!p.analytics; d.checked = !!p.ads; }
    requestAnimationFrame(function () { el.classList.add("open"); });
  }

  /* ---------- boot ---------- */
  var saved = read();
  gtag("consent", "default", {
    analytics_storage: saved && saved.analytics ? "granted" : "denied",
    ad_storage: saved && saved.ads ? "granted" : "denied",
    ad_user_data: saved && saved.ads ? "granted" : "denied",
    ad_personalization: saved && saved.ads ? "granted" : "denied",
    wait_for_update: 500
  });

  function boot() {
    if (saved) apply(saved);
    else open();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.NexusConsent = {
    open: open,
    get: read,
    set: function (prefs) { var p = save(prefs); apply(p, { reloadOnRevoke: true }); return p; },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} open(); }
  };
})();
