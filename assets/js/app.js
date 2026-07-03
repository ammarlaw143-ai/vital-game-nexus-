// Nexus Gaming — shared app JS
(function(){
  const games = window.NEXUS_GAMES || [];
  const news = window.NEXUS_NEWS || [];
  const mods = window.NEXUS_MODS || [];
  const cmds = window.NEXUS_COMMANDS || [];

  // ---------- favorites ----------
  const FAV_KEY = "nexus:favs";
  const getFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } };
  const setFavs = (a) => localStorage.setItem(FAV_KEY, JSON.stringify(a));
  const toggleFav = (slug) => {
    const f = getFavs();
    const i = f.indexOf(slug);
    if (i >= 0) f.splice(i,1); else f.push(slug);
    setFavs(f); return f.includes(slug);
  };
  window.NexusFavs = { get: getFavs, toggle: toggleFav, has: s => getFavs().includes(s) };

  // ---------- icons ----------
  const heart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`;
  const star = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`;
  const search = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;

  // ---------- header ----------
  function renderHeader(active){
    const navItems = [
      ["Home","index.html"],["Games","games.html"],["News","news.html"],
      ["Minecraft","minecraft.html"],["GTA","gta.html"],["Favorites","favorites.html"]
    ];
    return `<header class="site-header"><div class="container inner">
      <a href="index.html" class="logo"><span class="diamond"></span>Nexus<span style="color:var(--neon)">.</span></a>
      <nav class="nav-links">${navItems.map(([l,h])=>`<a href="${h}" class="${active===h?'active':''}">${l}</a>`).join('')}</nav>
      <div class="search-wrap">
        <span class="icon">${search}</span>
        <input id="globalSearch" type="search" placeholder="Search games, news…" autocomplete="off"/>
        <div id="searchResults" class="search-results hidden"></div>
      </div>
    </div></header>`;
  }

  function renderFooter(){
    const cols = [
      ["Platforms",[["PC Gaming","games.html?platform=PC"],["PlayStation","games.html?platform=PS5"],["Xbox","games.html?platform=Xbox"],["Nintendo","games.html?platform=Switch"],["Mobile","games.html?platform=Mobile"]]],
      ["Discover",[["Trending","games.html?filter=trending"],["Top Rated","games.html?filter=top-rated"],["New Releases","games.html?filter=new"],["Upcoming","games.html?filter=upcoming"],["Free Games","games.html?filter=free"]]],
      ["Minecraft",[["Mods","mods.html"],["Commands","commands.html"],["Hub","minecraft.html"]]],
      ["Company",[["About","about.html"],["Contact","contact.html"],["Privacy","privacy.html"],["Terms","terms.html"],["Disclaimer","disclaimer.html"]]]
    ];
    return `<footer class="site-footer"><div class="container">
      <div class="cols">
        <div class="brand">
          <div class="logo" style="margin-bottom:1.25rem"><span class="diamond"></span>Nexus<span style="color:var(--neon)">.</span></div>
          <p style="font-size:.875rem;color:rgba(255,255,255,.5);max-width:20rem;line-height:1.65;margin:0 0 1.5rem">Where Every Gamer Belongs. The ultimate destination for news, guides, and the world's biggest gaming database.</p>
          <div class="socials">${["X","DC","YT","TW","IG"].map(s=>`<div>${s}</div>`).join('')}</div>
        </div>
        ${cols.map(([t,ls])=>`<div><h5>${t}</h5><ul>${ls.map(([l,h])=>`<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`).join('')}
      </div>
      <div class="bottom">
        <p>© ${new Date().getFullYear()} Nexus Gaming. All rights reserved.</p>
        <p>Not affiliated with any game publisher. Trademarks belong to their respective owners.</p>
      </div>
    </div></footer>`;
  }

  // ---------- cards ----------
  // Curated cover art for popular titles (Wikipedia / official press kits, hot-linkable).
  const COVERS = {
    "cyberpunk-2077": "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
    "elden-ring": "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
    "elden-ring-nightreign": "https://upload.wikimedia.org/wikipedia/en/6/68/Elden_Ring_Nightreign_cover.jpg",
    "grand-theft-auto-v": "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png",
    "grand-theft-auto-vi": "assets/img/gta-vi.png",
    "minecraft": "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    "minecraft-legends": "https://upload.wikimedia.org/wikipedia/en/a/a1/Minecraft_Legends_cover_art.jpg",
    "minecraft-dungeons": "https://upload.wikimedia.org/wikipedia/en/9/9e/Minecraft_Dungeons_cover.png",
    "red-dead-redemption-2": "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg",
    "red-dead-redemption": "https://upload.wikimedia.org/wikipedia/en/1/12/Red_Dead_Redemption.jpg",
    "baldur-s-gate-3": "https://upload.wikimedia.org/wikipedia/en/d/db/Baldur%27s_Gate_3_cover_art.jpg",
    "baldurs-gate-3": "https://upload.wikimedia.org/wikipedia/en/d/db/Baldur%27s_Gate_3_cover_art.jpg",
    "the-witcher-3-wild-hunt": "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
    "the-witcher-4": "https://upload.wikimedia.org/wikipedia/en/6/6f/The_Witcher_4_cover.jpg",
    "the-legend-of-zelda-tears-of-the-kingdom": "https://upload.wikimedia.org/wikipedia/en/4/49/Tears_of_the_Kingdom_cover.jpg",
    "the-legend-of-zelda-breath-of-the-wild": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg/220px-The_Legend_of_Zelda_Breath_of_the_Wild.jpg",
    "the-legend-of-zelda-echoes-of-wisdom": "https://upload.wikimedia.org/wikipedia/en/5/5c/The_Legend_of_Zelda_-_Echoes_of_Wisdom.jpg",
    "hogwarts-legacy": "https://upload.wikimedia.org/wikipedia/en/3/32/Hogwarts_Legacy_cover.jpg",
    "starfield": "https://upload.wikimedia.org/wikipedia/en/6/6e/Starfield_cover.jpg",
    "fortnite": "https://upload.wikimedia.org/wikipedia/en/5/5a/Fortnite_Battle_Royale_cover.jpg",
    "valorant": "https://upload.wikimedia.org/wikipedia/en/f/fc/Valorant_cover.jpg",
    "league-of-legends": "https://upload.wikimedia.org/wikipedia/en/7/77/League_of_Legends_cover.jpg",
    "teamfight-tactics": "https://upload.wikimedia.org/wikipedia/en/7/7b/Teamfight_Tactics_logo.png",
    "wild-rift": "https://upload.wikimedia.org/wikipedia/en/4/44/League_of_Legends_Wild_Rift_cover.jpg",
    "counter-strike-2": "https://upload.wikimedia.org/wikipedia/en/8/89/Counter-Strike_2_cover_art.jpg",
    "dota-2": "https://upload.wikimedia.org/wikipedia/en/3/37/Dota_2_cover_art.jpg",
    "apex-legends": "https://upload.wikimedia.org/wikipedia/en/7/7e/Apex_legends_cover.jpg",
    "call-of-duty-modern-warfare-iii": "https://upload.wikimedia.org/wikipedia/en/4/42/Call_of_Duty_Modern_Warfare_III_Cover_Art.jpg",
    "call-of-duty-warzone": "https://upload.wikimedia.org/wikipedia/en/c/c3/Call_of_Duty_Warzone_cover.jpg",
    "call-of-duty-black-ops-6": "https://upload.wikimedia.org/wikipedia/en/6/6b/Call_of_Duty_Black_Ops_6_cover.jpg",
    "overwatch-2": "https://upload.wikimedia.org/wikipedia/en/5/56/Overwatch_2_cover_art.jpg",
    "diablo-iv": "https://upload.wikimedia.org/wikipedia/en/2/28/Diablo_IV_cover_art.png",
    "diablo-iii": "https://upload.wikimedia.org/wikipedia/en/b/b6/Diablo_III_cover.png",
    "world-of-warcraft": "https://upload.wikimedia.org/wikipedia/en/6/6d/WoW_Box_Art1.jpg",
    "hearthstone": "https://upload.wikimedia.org/wikipedia/en/e/e6/Hearthstone_logo.png",
    "starcraft-ii": "https://upload.wikimedia.org/wikipedia/en/9/97/StarCraft_II_-_Box_Art.jpg",
    "spider-man-2": "https://upload.wikimedia.org/wikipedia/en/4/4e/Marvel%27s_Spider-Man_2_cover.jpg",
    "marvel-s-spider-man-2": "https://upload.wikimedia.org/wikipedia/en/4/4e/Marvel%27s_Spider-Man_2_cover.jpg",
    "marvel-s-wolverine": "https://upload.wikimedia.org/wikipedia/en/9/9e/Marvels_Wolverine_teaser.jpg",
    "god-of-war-ragnarok": "https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg",
    "horizon-forbidden-west": "https://upload.wikimedia.org/wikipedia/en/6/6f/Horizon_Forbidden_West_cover_art.jpg",
    "the-last-of-us-part-ii": "https://upload.wikimedia.org/wikipedia/en/4/4f/TLOU_P2_Box_Art_2.png",
    "ghost-of-tsushima": "https://upload.wikimedia.org/wikipedia/en/b/b6/Ghost_of_Tsushima.jpg",
    "ghost-of-yotei": "https://upload.wikimedia.org/wikipedia/en/2/2f/Ghost_of_Yotei_cover.jpg",
    "death-stranding-2": "https://upload.wikimedia.org/wikipedia/en/6/6f/Death_Stranding_2_On_the_Beach_cover.jpg",
    "halo-infinite": "https://upload.wikimedia.org/wikipedia/en/1/14/Halo_Infinite.png",
    "forza-horizon-5": "https://upload.wikimedia.org/wikipedia/en/d/d6/Forza_Horizon_5_cover_art.jpg",
    "fable": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Fable_2025_cover_art.jpg/220px-Fable_2025_cover_art.jpg",
    "the-elder-scrolls-vi": "https://upload.wikimedia.org/wikipedia/en/thumb/7/78/The_Elder_Scrolls_VI_logo.png/220px-The_Elder_Scrolls_VI_logo.png",
    "super-mario-odyssey": "https://upload.wikimedia.org/wikipedia/en/8/8d/Super_Mario_Odyssey.jpg",
    "super-mario-bros-wonder": "https://upload.wikimedia.org/wikipedia/en/9/97/Super_Mario_Bros._Wonder_cover.jpg",
    "mario-kart-8-deluxe": "https://upload.wikimedia.org/wikipedia/en/1/17/Mario_Kart_8_Deluxe.jpg",
    "splatoon-3": "https://upload.wikimedia.org/wikipedia/en/6/6f/Splatoon_3_cover.jpg",
    "animal-crossing-new-horizons": "https://upload.wikimedia.org/wikipedia/en/1/1f/Animal_Crossing_New_Horizons.jpg",
    "stardew-valley": "https://upload.wikimedia.org/wikipedia/en/f/fd/Logo_of_Stardew_Valley.png",
    "hades-ii": "https://upload.wikimedia.org/wikipedia/en/4/44/Hades_II_cover.jpg",
    "hades": "https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg",
    "palworld": "https://upload.wikimedia.org/wikipedia/en/0/0e/Palworld_cover_art.jpg",
    "helldivers-2": "https://upload.wikimedia.org/wikipedia/en/7/70/Helldivers_2_cover_art.jpg",
    "alan-wake-2": "https://upload.wikimedia.org/wikipedia/en/3/3e/Alan_Wake_2_cover_art.jpg",
    "resident-evil-4-remake": "https://upload.wikimedia.org/wikipedia/en/f/fd/Resident_Evil_4_remake_cover_art.jpg",
    "resident-evil-9": "https://upload.wikimedia.org/wikipedia/en/e/ec/Resident_Evil_Requiem_cover.jpg",
    "final-fantasy-xvi": "https://upload.wikimedia.org/wikipedia/en/0/0b/Final_Fantasy_XVI_cover_art.jpg",
    "final-fantasy-vii-rebirth": "https://upload.wikimedia.org/wikipedia/en/6/68/Final_Fantasy_VII_Rebirth_cover_art.jpg",
    "genshin-impact": "https://upload.wikimedia.org/wikipedia/en/e/ec/Genshin_Impact_cover.png",
    "roblox": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Roblox_Logo.svg",
    "pok-mon-scarlet": "https://upload.wikimedia.org/wikipedia/en/2/2e/Pokemon_Scarlet_EN_boxart.png",
    "pok-mon-violet": "https://upload.wikimedia.org/wikipedia/en/9/9f/Pokemon_Violet_EN_boxart.png",
    "pok-mon-legends-arceus": "https://upload.wikimedia.org/wikipedia/en/9/9a/Pokemon_Legends_Arceus.jpg",
    "pok-mon-legends-z-a": "https://upload.wikimedia.org/wikipedia/en/5/56/Pokemon_Legends_ZA_boxart.jpg",
    "pok-mon-go": "https://upload.wikimedia.org/wikipedia/commons/5/53/Pokemon_Go_logo.svg",
    "pok-mon-unite": "https://upload.wikimedia.org/wikipedia/en/4/49/Pokemon_Unite_cover.jpg",
    "metroid-prime-remastered": "https://upload.wikimedia.org/wikipedia/en/7/7d/Metroid_Prime_Remastered_cover_art.jpg",
    "metroid-prime-4": "https://upload.wikimedia.org/wikipedia/en/5/57/Metroid_Prime_4_Beyond_key_art.jpg",
    "pikmin-4": "https://upload.wikimedia.org/wikipedia/en/1/1a/Pikmin_4_cover_art.jpg",
    "fire-emblem-engage": "https://upload.wikimedia.org/wikipedia/en/f/f3/Fire_Emblem_Engage_cover.jpg",
    "kirby-and-the-forgotten-land": "https://upload.wikimedia.org/wikipedia/en/8/86/Kirby_and_the_Forgotten_Land_cover.jpg",
    "xenoblade-chronicles-3": "https://upload.wikimedia.org/wikipedia/en/5/54/Xenoblade_Chronicles_3.jpeg",
    "bayonetta-3": "https://upload.wikimedia.org/wikipedia/en/8/86/Bayonetta_3_cover.jpg",
    "astro-bot": "https://upload.wikimedia.org/wikipedia/en/1/1d/Astro_Bot_cover.jpg",
    "bloodborne": "https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg",
    "candy-crush-saga": "https://upload.wikimedia.org/wikipedia/en/7/79/Candy_Crush_Saga_logo.png",
    "clash-royale": "https://upload.wikimedia.org/wikipedia/en/7/71/Clash_Royale_official_icon.png",
    "far-cry-7": "https://upload.wikimedia.org/wikipedia/en/0/06/Far_Cry_7_logo.jpg",
    "mass-effect-5": "https://upload.wikimedia.org/wikipedia/en/c/c9/Mass_Effect_5_teaser.jpg"
  };
  // Image source helpers with multi-step fallback chain.
  function steamImg(appid){
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`;
  }
  function bingImg(query, w, h){
    return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(query)}&w=${w}&h=${h}&c=7&rs=1&p=0&pid=Api`;
  }
  function ddgImg(query){
    return `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent('https://www.bing.com/th?q='+query)}`;
  }
  function placeholderImg(text, w, h){
    return `https://placehold.co/${w}x${h}/0a0a14/00f0ff?text=${encodeURIComponent(text)}`;
  }
  function gameImg(g, w, h){
    if (!g) return placeholderImg("Game", w, h);
    // Prefer curated Wikipedia box art (authoritative), then Steam library, then remote search.
    if (COVERS[g.slug]) return COVERS[g.slug];
    if (g.appid) return steamImg(g.appid);
    if (g.image) return g.image;
    return bingImg(`${g.title} video game cover art`, w, h);
  }
  function newsImg(a, w, h){
    if (a && a.image) return a.image;
    const subject = a && a.category ? `${a.title} ${a.category} gaming` : `${a && a.title || 'gaming'} news`;
    return bingImg(subject, w, h);
  }

  // Multi-step image fallback. Each <img> carries data-fallback-step.
  window.NexusImgFallback = function(el){
    const step = parseInt(el.dataset.fallbackStep || "0", 10) + 1;
    el.dataset.fallbackStep = String(step);
    const title = el.dataset.title || "";
    const slug = el.dataset.slug || "";
    const appid = el.dataset.appid || "";
    const w = parseInt(el.dataset.w || "480", 10);
    const h = parseInt(el.dataset.h || "640", 10);
    if (step === 1 && appid) { el.src = steamImg(appid); return; }
    if (step <= 2) { el.src = bingImg(`${title} video game cover art`, w, h); return; }
    if (step === 3) { el.src = ddgImg(`${title} game cover`); return; }
    el.onerror = null;
    el.src = placeholderImg(title.slice(0,16), w, h);
  };

  function imgTag(src, alt, slug, title, w, h, appid){
    return `<img class="cover-img" src="${src}" alt="${alt}" loading="lazy"
      data-slug="${slug}" data-title="${(title||'').replace(/"/g,'&quot;')}" data-w="${w}" data-h="${h}" data-appid="${appid||''}"
      onerror="NexusImgFallback(this)"/>`;
  }

  function priceLabel(g){
    if (g.price === "Free") return "FREE";
    if (g.upcoming || g.price === 0 || g.price == null) return "TBA";
    return `$${Number(g.price).toFixed(2)}`;
  }

  function gameCardHTML(g){
    const price = priceLabel(g);
    const fav = window.NexusFavs.has(g.slug);
    return `<a class="game-card" href="game.html?slug=${g.slug}">
      <div class="cover">
        ${imgTag(gameImg(g, 480, 640), g.title, g.slug, g.title, 480, 640, g.appid)}
        <div class="cover-grad" style="background:${g.gradient};mix-blend-mode:overlay;opacity:.28"></div>
        <div class="cover-grid grid-bg" style="opacity:.25"></div>
        <div class="cover-fade"></div>
        <div class="top-bar">
          <span class="price-badge ${g.price==='Free'?'free':''}">${price}</span>
          <div style="display:flex;gap:.35rem">
            <button class="fav-btn ${fav?'active':''}" data-fav="${g.slug}" aria-label="Favorite">${heart}</button>
            <button class="fav-btn info-btn" data-info="${g.slug}" aria-label="Details" title="Details" style="font-weight:900;font-size:1.25rem;line-height:.6;padding-bottom:.35rem;color:#fff;background:rgba(0,0,0,.55)">⋮</button>
          </div>
        </div>
        <div class="meta">
          ${g.rating>0?`<div class="rating">${star}<span>${g.rating.toFixed(1)}</span></div>`:''}
          <h3>${g.title}</h3>
          <p class="genres">${g.genres.slice(0,2).join(' • ')}</p>
        </div>
      </div>
      <div class="footer"><span>${g.platforms.slice(0,3).join(' / ')}</span><span>${new Date(g.releaseDate).getFullYear()}</span></div>
    </a>`;
  }

  function newsCardHTML(a, variant){
    const v = variant || "default";
    if (v === "compact") {
      return `<a class="news-compact" href="article.html?slug=${a.slug}">
        <img class="thumb" src="${newsImg(a, 160, 160)}" alt="${a.title}" data-title="${a.title}" data-slug="${a.slug}" data-w="160" data-h="160" onerror="NexusImgFallback(this)"/>
        <div style="min-width:0">
          <span class="badge ${a.tag||'neon'}">${a.category}</span>
          <h4>${a.title}</h4>
          <p style="margin-top:.25rem;font-size:.625rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.4)">${new Date(a.date).toLocaleDateString()} • ${a.readTime} min</p>
        </div>
      </a>`;
    }
    const w = v==='feature'?1280:800, h = v==='feature'?720:500;
    return `<a class="news-card ${v==='feature'?'feature':''}" href="article.html?slug=${a.slug}">
      <div class="cover">
        <img class="cover-img" src="${newsImg(a, w, h)}" alt="${a.title}" loading="lazy" data-title="${a.title}" data-slug="${a.slug}" data-w="${w}" data-h="${h}" onerror="NexusImgFallback(this)"/>
        <div class="cover-grad" style="background:linear-gradient(135deg,var(--violet),var(--neon));mix-blend-mode:overlay;opacity:.45"></div>
        <div class="cover-fade"></div>
        <div class="body">
          <span class="badge ${a.tag||'neon'}">${a.category}</span>
          <h3>${a.title}</h3>
          ${v==='feature'?`<p class="excerpt line-clamp-2">${a.excerpt}</p>`:''}
          <p class="byline">${a.author} • ${new Date(a.date).toLocaleDateString()} • ${a.readTime} min read</p>
        </div>
      </div>
    </a>`;
  }

  // ---------- mount layout ----------
  function mountLayout(active){
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");
    if (header) header.innerHTML = renderHeader(active);
    if (footer) footer.innerHTML = renderFooter();
    wireFavButtons();
    wireSearch();
    wireInfoButtons();
  }

  function wireInfoButtons(){
    if (window.__nexusInfoWired) return;
    window.__nexusInfoWired = true;
    // modal container
    const modal = document.createElement("div");
    modal.id = "nexusInfoModal";
    modal.style.cssText = "position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(0,0,0,.75);backdrop-filter:blur(6px)";
    modal.innerHTML = `<div id="nexusInfoBody" style="background:#0d0f19;border:1px solid rgba(255,255,255,.12);border-radius:.9rem;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)"></div>`;
    document.body.appendChild(modal);
    const close = () => { modal.style.display = "none"; };
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-info]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const slug = btn.getAttribute("data-info");
      const g = games.find(x => x.slug === slug);
      if (!g) return;
      const price = g.price === "Free" ? "Free to play" : (g.price == null || g.price === 0 ? "TBA" : `$${Number(g.price).toFixed(2)}`);
      const img = (window.Nexus && Nexus.gameImg) ? '' : '';
      const rows = [
        ["Release", g.releaseDate ? new Date(g.releaseDate).toLocaleDateString() : "TBA"],
        ["Price", price],
        ["Rating", g.rating > 0 ? `${g.rating.toFixed(1)} / 10` : "Unrated"],
        ["Developer", g.developer || "—"],
        ["Publisher", g.publisher || "—"],
        ["Platforms", (g.platforms||[]).join(", ") || "—"],
        ["Genres", (g.genres||[]).join(", ") || "—"],
        ["Status", g.upcoming ? "Upcoming" : (g.newRelease ? "New Release" : "Available")],
      ];
      document.getElementById("nexusInfoBody").innerHTML = `
        <div style="position:relative;height:180px;background:${g.gradient||'#1a1d2e'};border-radius:.9rem .9rem 0 0;overflow:hidden">
          <img src="${gameImg(g,600,300)}" alt="${g.title}" style="width:100%;height:100%;object-fit:cover;opacity:.85" data-slug="${g.slug}" data-title="${(g.title||'').replace(/"/g,'&quot;')}" data-w="600" data-h="300" data-appid="${g.appid||''}" onerror="NexusImgFallback(this)"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(13,15,25,.95))"></div>
          <button id="nexusInfoClose" aria-label="Close" style="position:absolute;top:.6rem;right:.6rem;width:2rem;height:2rem;border-radius:50%;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:1.1rem;cursor:pointer;line-height:1">✕</button>
          <div style="position:absolute;left:1.2rem;right:1.2rem;bottom:.9rem">
            <p style="font-size:.65rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.7);margin:0">${g.developer||''}</p>
            <h2 style="font-family:Rajdhani,sans-serif;font-size:1.6rem;text-transform:uppercase;margin:.15rem 0 0;line-height:1.1">${g.title}</h2>
          </div>
        </div>
        <div style="padding:1.1rem 1.25rem 1.4rem">
          <p style="color:rgba(255,255,255,.8);font-size:.9rem;line-height:1.55;margin:0 0 1rem">${g.description||'No description available.'}</p>
          <div style="display:grid;grid-template-columns:1fr;gap:0">
            ${rows.map(([k,v])=>`<div style="display:flex;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:.85rem"><span style="color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.15em;font-size:.7rem">${k}</span><span style="font-weight:600;text-align:right">${v}</span></div>`).join('')}
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1.2rem">
            <a href="game.html?slug=${g.slug}" class="btn btn-primary" style="flex:1;min-width:8rem;text-align:center">Full page</a>
            ${g.storeUrl?`<a href="${g.storeUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="flex:1;min-width:8rem;text-align:center">Store</a>`:''}
          </div>
        </div>`;
      modal.style.display = "flex";
      document.getElementById("nexusInfoClose").addEventListener("click", close);
    });

  function wireFavButtons(){
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-fav]");
      if (!btn) return;
      e.preventDefault();
      const slug = btn.getAttribute("data-fav");
      const on = window.NexusFavs.toggle(slug);
      document.querySelectorAll(`[data-fav="${slug}"]`).forEach(b => b.classList.toggle("active", on));
    });
  }

  function wireSearch(){
    const input = document.getElementById("globalSearch");
    const results = document.getElementById("searchResults");
    if (!input || !results) return;
    const close = () => { results.classList.add("hidden"); results.innerHTML=""; };
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) return close();
      const gMatches = games.filter(g => g.title.toLowerCase().includes(q)).slice(0,5);
      const nMatches = news.filter(n => n.title.toLowerCase().includes(q)).slice(0,3);
      if (!gMatches.length && !nMatches.length) { results.innerHTML = `<div style="padding:.75rem 1rem;font-size:.85rem;color:rgba(255,255,255,.5)">No results</div>`; results.classList.remove("hidden"); return; }
      results.innerHTML =
        gMatches.map(g => `<a href="game.html?slug=${g.slug}"><strong>${g.title}</strong> <span style="color:rgba(255,255,255,.4);font-size:.7rem;margin-left:.5rem">${g.genres[0]}</span></a>`).join('') +
        nMatches.map(n => `<a href="article.html?slug=${n.slug}"><strong>${n.title}</strong> <span style="color:rgba(255,255,255,.4);font-size:.7rem;margin-left:.5rem">News</span></a>`).join('');
      results.classList.remove("hidden");
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) close(); });
  }

  // ---------- expose ----------
  window.Nexus = {
    games, news, mods, cmds,
    mountLayout, gameCardHTML, newsCardHTML, gameImg, newsImg,
    findGame: s => games.find(g => g.slug === s),
    findArticle: s => news.find(n => n.slug === s),
    qs: (k) => new URLSearchParams(location.search).get(k),
  };
})();
