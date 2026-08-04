/* Nexus Gaming — SEO helpers: meta tags + schema.org JSON-LD (vanilla JS, file:// safe) */
(function () {
  "use strict";

  var SITE_NAME = "Nexus Gaming";
  var SITE_URL = "https://vital-game-nexus.lovable.app";
  var LOGO = SITE_URL + "/assets/img/gta-vi.png";

  function abs(path) {
    if (!path) return SITE_URL + "/";
    if (/^https?:\/\//i.test(path)) return path;
    return SITE_URL + "/" + String(path).replace(/^\.?\//, "");
  }

  /* current page URL relative to site root, e.g. "game.html?slug=x" */
  function currentPath() {
    var file = location.pathname.split("/").pop() || "index.html";
    if (file === "index.html") file = "";
    return file + (location.search || "");
  }

  function upsert(selector, attrs, tag) {
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(tag);
      document.head.appendChild(el);
    }
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function meta(nameOrProp, content, isProperty) {
    if (!content) return;
    var key = isProperty ? "property" : "name";
    upsert(
      "meta[" + key + '="' + nameOrProp + '"]',
      (function () { var o = { content: content }; o[key] = nameOrProp; return o; })(),
      "meta"
    );
  }

  /**
   * setMeta({ title, description, image, url, type, keywords, robots, publishedTime })
   */
  function setMeta(o) {
    o = o || {};
    var url = abs(o.url || currentPath());
    var title = o.title || document.title;
    var desc = o.description || (document.head.querySelector('meta[name="description"]') || {}).content;
    var img = o.image ? abs(o.image) : "";

    if (o.title) document.title = title;
    if (desc) meta("description", desc);
    if (o.keywords) meta("keywords", o.keywords);
    meta("robots", o.robots || "index, follow, max-image-preview:large, max-snippet:-1");
    upsert('link[rel="canonical"]', { rel: "canonical", href: url }, "link");

    meta("og:site_name", SITE_NAME, true);
    meta("og:locale", "en_US", true);
    meta("og:type", o.type || "website", true);
    meta("og:title", title, true);
    meta("og:description", desc, true);
    meta("og:url", url, true);
    if (img) meta("og:image", img, true);

    meta("twitter:card", img ? "summary_large_image" : "summary");
    meta("twitter:title", title);
    meta("twitter:description", desc);
    if (img) meta("twitter:image", img);
    if (o.publishedTime) meta("article:published_time", o.publishedTime, true);
  }

  /* ---------- JSON-LD ---------- */
  function jsonLd(obj, id) {
    if (!obj) return;
    var key = id || "nexus-jsonld-" + (document.querySelectorAll('script[type="application/ld+json"]').length + 1);
    var el = document.getElementById(key);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = key;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(obj);
    return el;
  }

  function organization() {
    return {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: SITE_NAME,
      url: SITE_URL + "/",
      logo: { "@type": "ImageObject", url: LOGO },
      email: "ammarlaw143@gmail.com",
      telephone: "+92 348 4986124",
      sameAs: [
        "https://x.com/nexusgaming",
        "https://www.youtube.com/@nexusgaming",
        "https://discord.gg/nexusgaming",
        "https://www.twitch.tv/nexusgaming"
      ]
    };
  }

  function website() {
    return {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      name: SITE_NAME,
      url: SITE_URL + "/",
      inLanguage: "en",
      publisher: { "@id": SITE_URL + "/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: SITE_URL + "/games.html?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    };
  }

  /** breadcrumb([{name, path}, ...]) */
  function breadcrumb(items) {
    return {
      "@type": "BreadcrumbList",
      "@id": abs(currentPath()) + "#breadcrumb",
      itemListElement: (items || []).map(function (it, i) {
        return { "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) };
      })
    };
  }

  function platformNames(list) {
    var map = { PC: "PC", PS5: "PlayStation 5", PS4: "PlayStation 4", Xbox: "Xbox Series X|S", Switch: "Nintendo Switch", Mobile: "Mobile", Web: "Web Browser" };
    return (list || []).map(function (p) { return map[p] || p; });
  }

  /** Full schema.org Game (+ VideoGame) node for a game record */
  function gameSchema(g, imageUrl) {
    if (!g) return null;
    var url = SITE_URL + "/game.html?slug=" + g.slug;
    var node = {
      "@type": "VideoGame",
      "@id": url + "#game",
      additionalType: "https://schema.org/Game",
      name: g.title,
      url: url,
      mainEntityOfPage: url,
      description: (g.longDescription && g.longDescription[0]) || g.description,
      inLanguage: "en",
      image: imageUrl ? abs(imageUrl) : undefined,
      genre: g.genres,
      gamePlatform: platformNames(g.platforms),
      datePublished: g.releaseDate,
      applicationCategory: "Game",
      operatingSystem: platformNames(g.platforms).join(", "),
      author: g.developer ? { "@type": "Organization", name: g.developer } : undefined,
      creator: g.developer ? { "@type": "Organization", name: g.developer } : undefined,
      publisher: g.publisher ? { "@type": "Organization", name: g.publisher } : undefined,
      contentRating: g.ageRating,
      gameEdition: g.dlc,
      playMode: /Co-op|MMORPG|MOBA|Battle Royale|Multiplayer/i.test((g.genres || []).join(" ")) ? ["SinglePlayer", "MultiPlayer", "CoOp"] : ["SinglePlayer"],
      numberOfPlayers: g.players ? { "@type": "QuantitativeValue", description: g.players } : undefined,
      fileSize: g.fileSize,
      inLanguageOfContent: undefined
    };

    if (g.franchise) node.isPartOf = { "@type": "CreativeWorkSeries", name: g.franchise };
    if (g.engine) node.gameEngine = g.engine;

    if (typeof g.rating === "number") {
      node.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: g.rating,
        bestRating: 10,
        worstRating: 0,
        ratingCount: Math.max(50, Math.round((g.popularity || 50) * 137))
      };
    }

    var isFree = g.price === "Free" || g.price === 0;
    node.offers = {
      "@type": "Offer",
      url: g.storeUrl || url,
      price: isFree ? 0 : Number(g.price),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      category: isFree ? "Free to play" : "Premium"
    };
    if (g.officialUrl) node.sameAs = g.officialUrl;

    Object.keys(node).forEach(function (k) { if (node[k] === undefined) delete node[k]; });
    return node;
  }

  /** schema.org NewsArticle node for a news record */
  function newsArticleSchema(a, imageUrl) {
    if (!a) return null;
    var url = SITE_URL + "/article.html?slug=" + a.slug;
    var words = (a.body || []).join(" ").split(/\s+/).filter(Boolean).length;
    var node = {
      "@type": "NewsArticle",
      "@id": url + "#article",
      headline: a.title,
      name: a.title,
      description: a.excerpt,
      articleBody: (a.body || []).join("\n\n"),
      articleSection: a.category,
      keywords: [a.category, a.tag, "gaming news"].filter(Boolean).join(", "),
      url: url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      datePublished: a.date,
      dateModified: a.date,
      inLanguage: "en",
      wordCount: words || undefined,
      timeRequired: a.readTime ? "PT" + a.readTime + "M" : undefined,
      image: imageUrl ? [abs(imageUrl)] : undefined,
      author: { "@type": "Person", name: a.author || "Nexus Gaming Staff" },
      publisher: { "@id": SITE_URL + "/#organization" },
      isPartOf: { "@id": SITE_URL + "/#website" }
    };
    Object.keys(node).forEach(function (k) { if (node[k] === undefined) delete node[k]; });
    return node;
  }

  /** itemList([{name, url}], name) — for collection pages */
  function itemList(items, name) {
    return {
      "@type": "ItemList",
      name: name,
      numberOfItems: (items || []).length,
      itemListElement: (items || []).map(function (it, i) {
        return { "@type": "ListItem", position: i + 1, name: it.name, url: abs(it.url) };
      })
    };
  }

  /** faq([{q, a}]) */
  function faq(pairs) {
    return {
      "@type": "FAQPage",
      mainEntity: (pairs || []).map(function (p) {
        return {
          "@type": "Question",
          name: p.q,
          acceptedAnswer: { "@type": "Answer", text: p.a }
        };
      })
    };
  }

  /** graph(nodes...) — emit one @graph document */
  function graph() {
    var nodes = [];
    Array.prototype.slice.call(arguments).forEach(function (n) {
      if (!n) return;
      if (Array.isArray(n)) nodes = nodes.concat(n.filter(Boolean));
      else nodes.push(n);
    });
    return jsonLd({ "@context": "https://schema.org", "@graph": nodes }, "nexus-schema-graph");
  }

  /** Convenience: base site graph (Organization + WebSite) on every page */
  function base(extra) {
    var nodes = [organization(), website()];
    if (extra) nodes = nodes.concat(Array.isArray(extra) ? extra : [extra]);
    return graph(nodes);
  }

  window.NexusSEO = {
    SITE_NAME: SITE_NAME,
    SITE_URL: SITE_URL,
    abs: abs,
    setMeta: setMeta,
    jsonLd: jsonLd,
    graph: graph,
    base: base,
    organization: organization,
    website: website,
    breadcrumb: breadcrumb,
    gameSchema: gameSchema,
    newsArticleSchema: newsArticleSchema,
    itemList: itemList,
    faq: faq
  };
})();
