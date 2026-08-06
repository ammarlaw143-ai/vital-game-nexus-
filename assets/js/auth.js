// Nexus Gaming — local account system (sign up / sign in / guest mode)
// 100% static: accounts live in this browser's localStorage. No server needed.
(function(){
  const USERS_KEY = "nexus:users";
  const SESSION_KEY = "nexus:session";

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const users = () => read(USERS_KEY, []);
  const saveUsers = (a) => write(USERS_KEY, a);
  const session = () => read(SESSION_KEY, null);

  async function hash(str){
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("nexus:" + str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
    } catch {
      let h = 0; for (let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) | 0; }
      return "fallback" + h;
    }
  }

  const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  async function signUp({ name, email, password }){
    name = (name||"").trim(); email = (email||"").trim().toLowerCase();
    if (name.length < 2) throw new Error("Enter your gamer tag (2+ characters).");
    if (name.length > 32) throw new Error("Gamer tag must be under 32 characters.");
    if (!emailOk(email)) throw new Error("Enter a valid email address.");
    if ((password||"").length < 6) throw new Error("Password must be at least 6 characters.");
    const list = users();
    if (list.some(u => u.email === email)) throw new Error("An account already exists for that email.");
    const user = { id: "u" + Date.now().toString(36), name, email, pass: await hash(password), created: new Date().toISOString() };
    list.push(user); saveUsers(list);
    write(SESSION_KEY, { id: user.id, name: user.name, email: user.email, guest: false });
    mount(); return session();
  }

  async function signIn({ email, password }){
    email = (email||"").trim().toLowerCase();
    const user = users().find(u => u.email === email);
    if (!user || user.pass !== await hash(password||"")) throw new Error("Email or password is incorrect.");
    write(SESSION_KEY, { id: user.id, name: user.name, email: user.email, guest: false });
    mount(); return session();
  }

  function continueAsGuest(){
    write(SESSION_KEY, { id: "guest", name: "Guest", guest: true });
    mount(); return session();
  }

  function signOut(){ localStorage.removeItem(SESSION_KEY); mount(); }

  // ---------- UI ----------
  function chipHTML(){
    const s = session();
    if (!s) return `<button class="auth-chip" onclick="NexusAuth.open('signup')">Sign up</button>`;
    const initial = (s.name || "?").trim().charAt(0).toUpperCase();
    return `<div class="auth-chip-wrap">
      <button class="auth-chip is-user ${s.guest?'is-guest':''}" onclick="NexusAuth.togglePanel()" aria-haspopup="true">
        <span class="auth-avatar">${initial}</span><span class="auth-name">${s.name}</span>
      </button>
      <div class="auth-panel" id="authPanel">
        <p class="auth-panel-title">${s.guest ? "Guest mode" : s.name}</p>
        <p class="auth-panel-sub">${s.guest ? "Browsing without an account. Favorites stay on this device only." : (s.email||"")}</p>
        <a href="favorites.html" class="auth-panel-item">My favorites</a>
        ${s.guest ? `<button class="auth-panel-item" onclick="NexusAuth.open('signup')">Create an account</button>` : ``}
        <button class="auth-panel-item danger" onclick="NexusAuth.signOut()">${s.guest ? "Exit guest mode" : "Sign out"}</button>
      </div>
    </div>`;
  }

  function mount(){
    document.querySelectorAll("#authSlot").forEach(el => { el.innerHTML = chipHTML(); });
    const s = session();
    document.querySelectorAll("[data-auth-name]").forEach(el => { el.textContent = s ? s.name : "Guest"; });
  }

  function togglePanel(){
    const p = document.getElementById("authPanel");
    if (p) p.classList.toggle("open");
  }

  function modalHTML(mode){
    const isUp = mode !== "signin";
    return `<div class="auth-modal-card">
      <button class="auth-close" aria-label="Close" onclick="NexusAuth.close()">&times;</button>
      <p class="auth-kicker">Nexus Gaming</p>
      <h3>${isUp ? "Create your account" : "Welcome back"}</h3>
      <p class="auth-lead">${isUp ? "Save favorites, track games and keep your setup in sync on this device." : "Sign in to get back to your favorites."}</p>
      <form id="authForm" class="auth-form" novalidate>
        ${isUp ? `<label>Gamer tag<input name="name" type="text" autocomplete="nickname" placeholder="NeonRider" maxlength="32" required></label>` : ``}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
        <label>Password<input name="password" type="password" autocomplete="${isUp?'new-password':'current-password'}" placeholder="At least 6 characters" required></label>
        <p class="auth-error" id="authError" hidden></p>
        <button type="submit" class="btn btn-primary auth-submit">${isUp ? "Sign up" : "Sign in"}</button>
      </form>
      <div class="auth-sep"><span>or</span></div>
      <button class="btn btn-ghost auth-guest" onclick="NexusAuth.guest()">Continue as guest</button>
      <p class="auth-switch">${isUp
        ? `Already have an account? <button onclick="NexusAuth.open('signin')">Sign in</button>`
        : `New here? <button onclick="NexusAuth.open('signup')">Create an account</button>`}</p>
      <p class="auth-note">Accounts are stored locally in this browser — we never send your details anywhere.</p>
    </div>`;
  }

  function open(mode){
    let m = document.getElementById("authModal");
    if (!m){
      m = document.createElement("div");
      m.id = "authModal";
      m.className = "auth-modal";
      m.addEventListener("click", e => { if (e.target === m) close(); });
      document.body.appendChild(m);
    }
    m.innerHTML = modalHTML(mode);
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    const form = document.getElementById("authForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = document.getElementById("authError");
      const btn = form.querySelector(".auth-submit");
      const data = Object.fromEntries(new FormData(form).entries());
      err.hidden = true; btn.disabled = true;
      try {
        if (mode === "signin") await signIn(data); else await signUp(data);
        close();
      } catch (ex) {
        err.textContent = ex.message; err.hidden = false;
      } finally { btn.disabled = false; }
    });
    setTimeout(() => { const i = m.querySelector("input"); if (i) i.focus(); }, 30);
  }

  function close(){
    const m = document.getElementById("authModal");
    if (m) m.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  document.addEventListener("click", e => {
    const p = document.getElementById("authPanel");
    if (p && p.classList.contains("open") && !e.target.closest(".auth-chip-wrap")) p.classList.remove("open");
  });

  window.NexusAuth = { signUp, signIn, guest: () => { continueAsGuest(); close(); }, signOut, session, open, close, mount, togglePanel, isGuest: () => !!(session()||{}).guest };

  document.addEventListener("DOMContentLoaded", mount);
  window.addEventListener("load", mount);
})();
