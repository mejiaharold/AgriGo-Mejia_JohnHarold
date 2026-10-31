/* =====================================================================
   AgriGO – Splash → Login / Sign Up → Home → Sign Out
   Front-end prototype: accounts live in this browser's LocalStorage.
   (Replace the "Accounts" section with fetch() calls to your PHP/MySQL
    or other backend when you are ready – the screens stay the same.)
   Depends on script.js: DB, save, go, cur, hist, toast, openSheet,
   closeSheet, initials, fld, check, esc, $, $$
   ===================================================================== */
'use strict';
const Auth = (() => {

  /* ---------- storage keys ---------- */
  const USERS_KEY = 'agrigo_users';      // all accounts on this device
  const SES_KEY   = 'agrigo_session';    // who is logged in
  const LAST_KEY  = 'agrigo_last_id';    // last identifier typed with "Remember me"
  const MIN_SPLASH = 2300;               // ms the splash is shown at least
  // true  = real checks (required fields, correct password, duplicate accounts)
  // false = DEMO MODE: Login / Sign Up go straight to Home, even with empty fields
  const STRICT = false;

  const rd = (k, st = localStorage) => { try { return JSON.parse(st.getItem(k)); } catch (e) { return null; } };
  const wr = (k, v, st = localStorage) => { try { st.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- icons (match the reference: thin dark-green outline) ---------- */
  const P = {
    mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    lock:'<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.1" fill="currentColor" stroke="none"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    phone:'<path d="M5 3.5h3.6l1.7 4.3-2.2 1.4a11 11 0 0 0 5.7 5.7l1.4-2.2 4.3 1.7V18a2.5 2.5 0 0 1-2.7 2.5C10.3 20 4 13.7 3.5 6.2A2.5 2.5 0 0 1 5 3.5z"/>',
    eyeoff:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>',
    eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    arrow:'<path d="M4 12h16M14 6l6 6-6 6"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>',
    chev:'<path d="M6 9l6 6 6-6"/>',
    lockS:'<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>'
  };
  const svg = (n, c = '') => `<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  const FB = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#1877F2"/><path fill="#fff" d="M33.3 30.9l1.1-6.9h-6.6v-4.5c0-1.9.9-3.7 3.9-3.7h3V10c0 0-2.7-.5-5.3-.5-5.4 0-9 3.3-9 9.3V24h-6v6.9h6V48c1.2.2 2.4.3 3.7.3s2.5-.1 3.7-.3V30.9h5.5z"/></svg>';

  /* ---------- helpers ---------- */
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  // Accepts 09xxxxxxxxx, 9xxxxxxxxx, +63 9xx xxx xxxx, 639xxxxxxxxx → returns 09xxxxxxxxx or null
  const normPhone = v => { const d = String(v).replace(/\D/g, ''); if (/^639\d{9}$/.test(d)) return '0' + d.slice(2); if (/^9\d{9}$/.test(d)) return '0' + d; if (/^09\d{9}$/.test(d)) return d; return null; };
  const rid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  async function hashPw(pw, salt) {
    try { if (window.crypto && crypto.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } } catch (e) {}
    let h = 5381; const s = salt + ':' + pw; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return 'f' + h.toString(16);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- Accounts (swap these for your backend later) ---------- */
  const users = () => rd(USERS_KEY) || [];
  const saveUsers = u => wr(USERS_KEY, u);
  const findUser = id => { const v = id.trim().toLowerCase(), ph = normPhone(id); return users().find(u => (u.email && u.email.toLowerCase() === v) || (ph && u.phone === ph)); };
  async function seedDemo() {
    const OLD = '09617032973', NEW = '09123456789', us = users();
    if (us.some(u => u.phone === OLD)) { us.forEach(u => { if (u.phone === OLD) u.phone = NEW; }); saveUsers(us); }
    if (us.length) return;
    const salt = rid();
    saveUsers([{ id: 'u_demo', name: 'John Harold', phone: '09123456789', email: 'demo@agrigo.ph', salt, hash: await hashPw('agrigo123', salt) }]);
  }

  /* ---------- session ---------- */
  const session = () => rd(SES_KEY, sessionStorage) || rd(SES_KEY);
  const startSession = (u, remember) => { wr(SES_KEY, { uid: u.id }, remember ? localStorage : sessionStorage); (remember ? sessionStorage : localStorage).removeItem(SES_KEY); };
  const endSession = () => { sessionStorage.removeItem(SES_KEY); localStorage.removeItem(SES_KEY); };
  const currentUser = () => { const s = session(); return s && users().find(u => u.id === s.uid); };

  /* ---------- screen markup ---------- */
  const field = (id, icon, ph, type = 'text', auto = '', extra = '') => `
    <div class="au-grp"><div class="au-f" data-f="${id}">${svg(icon, 'au-ic')}
      <input id="${id}" type="${type}" placeholder="${ph}" autocomplete="${auto}" ${extra}>
      ${type === 'password' ? `<button type="button" class="au-eye" data-eye="${id}" aria-label="Show password">${svg('eyeoff')}</button>` : ''}
    </div><span class="au-em" id="${id}-em"></span></div>`;
  const socials = (tag) => `<button type="button" class="au-soc" data-soc="Google">${GOOGLE}Continue with Google</button>
      <button type="button" class="au-soc" data-soc="Facebook">${FB}Continue with Facebook</button>`;
  const LOGO = '<img class="au-logo" src="assets/agrigo-logo.png" alt="AgriGo – Ani mo, Hatid ko!">';
  const LEAF = '<img class="au-leaf" src="assets/leaves-tl-dark.svg" alt="">';
  const LAND = '<img class="au-land" src="assets/landscape.svg" alt="">';

  const loginHTML = `<section class="au-scr" id="au-login" aria-label="Log in"><div class="au-in">${LOGO}
    <h1>Welcome Back!</h1><p class="au-sub">Log in to your AgriGo account</p>
    <form class="au-form" id="f-login" novalidate>
      ${field('li-id', 'mail', 'Phone Number / Email', 'text', 'username', 'inputmode="email" autocapitalize="off" spellcheck="false"')}
      ${field('li-pw', 'lock', 'Password', 'password', 'current-password')}
      <div class="au-row"><label class="au-chk"><input type="checkbox" id="li-rem"><i>${svg('check')}</i>Remember me</label><button type="button" class="au-link" id="li-forgot">Forgot Password?</button></div>
      <button class="au-btn" type="submit"><span>Login</span>${svg('arrow')}<span class="au-spin"></span></button>
    </form>
    <div class="au-or">OR</div>${socials()}
    <p class="au-switch">Don’t have an account?<button type="button" data-to="signup">Sign Up</button></p>${LAND}</div></section>`;

  const signupHTML = `<section class="au-scr su off-r" id="au-signup" aria-label="Create account"><div class="au-in">${LOGO}
    <h1>Create Account</h1><p class="au-sub">Join AgriGo and be part of our farming community</p>
    <form class="au-form" id="f-signup" novalidate>
      ${field('su-name', 'user', 'Full Name', 'text', 'name')}
      ${field('su-phone', 'phone', 'Phone Number', 'tel', 'tel', 'inputmode="tel"')}
      ${field('su-email', 'mail', 'Email Address', 'email', 'email', 'autocapitalize="off" spellcheck="false"')}
      ${field('su-pw', 'lock', 'Password', 'password', 'new-password')}
      ${field('su-pw2', 'lock', 'Confirm Password', 'password', 'new-password')}
      <button class="au-btn" type="submit"><span>Sign Up</span>${svg('arrow')}<span class="au-spin"></span></button>
    </form>
    <div class="au-or">OR</div>${socials()}
    <p class="au-switch">Already have an account?<button type="button" data-to="login">Login</button></p>${LAND}</div></section>`;

  /* ---------- field error helpers ---------- */
  const setErr = (id, msg) => { const f = $(`[data-f="${id}"]`), m = $('#' + id + '-em'); f.classList.add('err'); void f.offsetWidth; m.textContent = msg; };
  const clrErr = id => { const f = $(`[data-f="${id}"]`); if (f) f.classList.remove('err'); };
  const clearAll = root => $$('.au-f.err', root).forEach(f => f.classList.remove('err'));
  const busy = (btn, on) => { btn.classList.toggle('busy', on); btn.disabled = on; };

  /* ---------- navigation between login and sign-up ---------- */
  let screen = 'login';
  function show(name) {
    const L = $('#au-login'), S = $('#au-signup'); screen = name;
    L.classList.toggle('off-l', name === 'signup'); L.classList.remove('off-r');
    S.classList.toggle('off-r', name === 'login'); S.classList.remove('off-l');
    (name === 'login' ? L : S).scrollTop = 0;
  }
  function resetForms() {
    ['f-login', 'f-signup'].forEach(id => { const f = $('#' + id); f.reset(); clearAll(f); });
    $$('[data-eye]').forEach(b => { const i = $('#' + b.dataset.eye); i.type = 'password'; b.innerHTML = svg('eyeoff'); });
    const last = rd(LAST_KEY); if (last) { $('#li-id').value = last; $('#li-rem').checked = true; }
  }
  const openAuth = (name = 'login') => { resetForms(); show(name); $('#auth').classList.add('show'); };

  /* ---------- enter the app (Home) ---------- */
  function enter(u, msg) {
    DB.profile = { ...DB.profile, name: u.name, phone: u.phone || '', email: u.email || '', avatar: initials(u.name) };
    save(); hist = []; go('home', null, false);
    $('#auth').classList.remove('show');
    setTimeout(() => toast(msg), 380);
  }

  /* ---------- handlers ---------- */
  async function doLogin(e) {
    e.preventDefault();
    const f = e.currentTarget, btn = $('.au-btn', f), id = $('#li-id').value.trim(), pw = $('#li-pw').value;
    clearAll(f);
    if (STRICT) {
      let ok = true;
      if (!id) { setErr('li-id', 'Enter your phone number or email.'); ok = false; }
      else if (!isEmail(id) && !normPhone(id)) { setErr('li-id', 'Enter a valid email or PH mobile number (09XXXXXXXXX).'); ok = false; }
      if (!pw) { setErr('li-pw', 'Enter your password.'); ok = false; }
      if (!ok) return;
    }
    busy(btn, true); await wait(STRICT ? 650 : 550);
    let u = findUser(id);
    if (STRICT) {
      if (!u) { busy(btn, false); return setErr('li-id', 'No account found. Tap Sign Up to create one.'); }
      if (u.hash !== await hashPw(pw, u.salt || '')) { busy(btn, false); $('#li-pw').select(); return setErr('li-pw', 'Incorrect password. Please try again.'); }
    }
    u = u || users()[0];                                   // demo mode: anything (or nothing) works
    const rem = $('#li-rem').checked; startSession(u, rem);
    if (rem && id) wr(LAST_KEY, id); else localStorage.removeItem(LAST_KEY);
    busy(btn, false); enter(u, `Welcome back, ${u.name.split(' ')[0]}! 🌿`);
  }

  async function doSignup(e) {
    e.preventDefault();
    const f = e.currentTarget, btn = $('.au-btn', f);
    const name = $('#su-name').value.trim().replace(/\s+/g, ' '), phRaw = $('#su-phone').value.trim(), email = $('#su-email').value.trim(), pw = $('#su-pw').value, pw2 = $('#su-pw2').value;
    const ph = normPhone(phRaw); clearAll(f);
    if (STRICT) {
      let ok = true;
      if (name.length < 2) { setErr('su-name', 'Please enter your full name.'); ok = false; }
      if (!ph) { setErr('su-phone', 'Enter a valid PH mobile number (09XXXXXXXXX).'); ok = false; }
      if (!isEmail(email)) { setErr('su-email', 'Enter a valid email address.'); ok = false; }
      if (pw.length < 6) { setErr('su-pw', 'Password must be at least 6 characters.'); ok = false; }
      if (pw2 !== pw || !pw2) { setErr('su-pw2', 'Passwords do not match.'); ok = false; }
      if (!ok) return;
    }
    busy(btn, true); await wait(STRICT ? 700 : 600);
    const all = users(); let u;
    if (STRICT) {
      if (all.some(x => x.phone === ph)) { busy(btn, false); return setErr('su-phone', 'This phone number is already registered.'); }
      if (all.some(x => x.email && x.email.toLowerCase() === email.toLowerCase())) { busy(btn, false); return setErr('su-email', 'This email is already registered.'); }
    }
    if (name || phRaw || email) {                          // something typed → use it for the profile
      u = all.find(x => (ph && x.phone === ph) || (email && x.email && x.email.toLowerCase() === email.toLowerCase()));
      if (!u) { const salt = rid(); u = { id: rid(), name: name || 'AgriGO User', phone: ph || '', email, salt, hash: pw ? await hashPw(pw, salt) : '' }; all.push(u); saveUsers(all); }
    } else u = all[0];                                     // nothing typed → demo account
    startSession(u, true);
    busy(btn, false); enter(u, 'Account created! Welcome to AgriGO 🌿');
  }

  /* ---------- Google / Facebook sign-in screens ----------
     Visual replicas of the real sign-in pages (opened like an in-app browser).
     They are NOT real OAuth – typing anything (or nothing) continues to Home. */
  const oaBar = (title, host) => `<div class="oa-bar"><button type="button" class="oa-x" data-oa-close aria-label="Close">${svg('x', 'oa-ic')}</button>
    <div class="oa-ttl"><b>${title}</b><small>${svg('lockS', 'oa-ic')}${host}</small></div><span class="oa-dots" aria-hidden="true">⋮</span></div>`;

  const googleHTML = () => `<div class="og">${oaBar('Sign in – Google Accounts', 'accounts.google.com')}<div class="og-ld" id="og-ld"><i></i></div>
    <div class="og-wrap"><div class="og-track" id="og-track">
      <form class="og-pane" id="og-f1" novalidate>
        <div class="og-g">${GOOGLE}</div><h2>Sign in</h2><p class="og-s">to continue to AgriGO</p>
        <div class="og-in"><input id="og-id" type="text" placeholder=" " autocomplete="off" autocapitalize="off" spellcheck="false"><label for="og-id">Email or phone</label></div>
        <button type="button" class="og-a">Forgot email?</button>
        <p class="og-gu">Not your computer? Use Guest mode to sign in privately. <button type="button" class="og-a">Learn more about using Guest mode</button></p>
        <div class="og-act"><button type="button" class="og-t">Create account</button><button type="submit" class="og-b">Next</button></div>
      </form>
      <form class="og-pane" id="og-f2" novalidate>
        <div class="og-g">${GOOGLE}</div><h2>Welcome</h2>
        <button type="button" class="og-chip" id="og-chip"><i id="og-av">A</i><span id="og-em"></span>${svg('chev', 'oa-ic')}</button>
        <div class="og-in"><input id="og-pw" type="password" placeholder=" " autocomplete="off"><label for="og-pw">Enter your password</label></div>
        <label class="og-sh"><input type="checkbox" id="og-show"><i>${svg('check', 'oa-ic')}</i>Show password</label>
        <div class="og-act"><button type="button" class="og-t">Forgot password?</button><button type="submit" class="og-b" id="og-go">Next</button></div>
      </form>
    </div></div>
    <div class="og-ft"><span class="og-lang">English (United States) ${svg('chev', 'oa-ic')}</span><span><a>Help</a><a>Privacy</a><a>Terms</a></span></div></div>`;

  const facebookHTML = () => `<div class="of">${oaBar('Log in to Facebook', 'm.facebook.com')}
    <div class="of-pg"><div class="of-lang">English (US)</div><div class="of-logo">${FB}</div>
      <form id="of-f" novalidate>
        <div class="of-in"><input id="of-id" type="text" placeholder=" " autocomplete="off" autocapitalize="off" spellcheck="false"><label for="of-id">Mobile number or email</label></div>
        <div class="of-in"><input id="of-pw" type="password" placeholder=" " autocomplete="off"><label for="of-pw">Password</label><button type="button" class="of-eye" data-ofeye aria-label="Show password">${svg('eyeoff', 'oa-ic')}</button></div>
        <button type="submit" class="of-login"><span>Log in</span><i class="of-spin"></i></button>
        <button type="button" class="of-forgot">Forgot password?</button>
      </form>
      <div class="of-fill"></div><button type="button" class="of-create">Create new account</button><div class="of-meta">∞ Meta</div></div></div>`;

  const nameFrom = (id, prov) => {
    if (isEmail(id)) { const n = id.split('@')[0].split(/[._\-+\d]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' '); if (n.length > 1) return n; }
    return prov + ' User';
  };
  function finishOauth(provider, id) {
    const email = isEmail(id) ? id : '', ph = normPhone(id) || '', all = users();
    let u = id ? all.find(x => (email && x.email && x.email.toLowerCase() === email.toLowerCase()) || (ph && x.phone === ph)) : all[0];
    if (!u) { u = { id: rid(), name: nameFrom(id, provider), phone: ph, email, salt: '', hash: '', provider }; all.push(u); saveUsers(all); }
    startSession(u, true); closeOauth(); enter(u, `Signed in with ${provider} ✓`);
  }
  function closeOauth() { const el = $('#oauth'); el.classList.remove('show'); setTimeout(() => { if (!el.classList.contains('show')) el.innerHTML = ''; }, 500); }
  function oauth(provider) {
    const el = $('#oauth'), G = provider === 'Google'; el.innerHTML = G ? googleHTML() : facebookHTML();
    void el.offsetWidth; el.classList.add('show');
    $('[data-oa-close]', el).onclick = closeOauth;
    if (G) {
      const track = $('#og-track'), f1 = $('#og-f1'), f2 = $('#og-f2');
      let id = '';
      f1.onsubmit = e => { e.preventDefault(); id = $('#og-id').value.trim();
        const shown = id || 'agrigo.user@gmail.com'; $('#og-em').textContent = shown; $('#og-av').textContent = shown[0].toUpperCase();
        track.classList.add('s2'); setTimeout(() => $('#og-pw').focus(), 380); };
      $('#og-chip').onclick = () => { track.classList.remove('s2'); setTimeout(() => $('#og-id').focus(), 380); };
      $('#og-show').onchange = e => { $('#og-pw').type = e.target.checked ? 'text' : 'password'; };
      f2.onsubmit = async e => { e.preventDefault(); const b = $('#og-go'); b.disabled = true; $('#og-ld').classList.add('on'); await wait(1300); finishOauth('Google', id); };
      setTimeout(() => $('#og-id') && $('#og-id').focus(), 450);
    } else {
      $('[data-ofeye]', el).onclick = () => { const i = $('#of-pw'), h = i.type === 'password'; i.type = h ? 'text' : 'password'; $('[data-ofeye]').innerHTML = svg(h ? 'eye' : 'eyeoff', 'oa-ic'); };
      $('#of-f').onsubmit = async e => { e.preventDefault(); const b = $('.of-login', el); b.classList.add('busy'); b.disabled = true; await wait(1100); finishOauth('Facebook', $('#of-id').value.trim()); };
    }
  }

  function forgotSheet() {
    openSheet('Reset Password',
      `<div class="card"><p class="note" style="margin-bottom:12px">Prototype reset: no SMS/email code is sent. Enter your account and a new password.</p>
       ${fld('fp-id', 'Phone number or email *', $('#li-id').value.trim(), { ph: '09XXXXXXXXX or you@example.com' })}
       ${fld('fp-pw', 'New password *', '', { type: 'password', ph: 'At least 6 characters' })}
       ${fld('fp-pw2', 'Confirm new password *', '', { type: 'password', ph: 'Re-enter password' })}</div>
       <button class="btn" id="fp-go">Update Password</button>`,
      () => { $('#fp-go').onclick = async () => {
        const a = check('fp-id', v => isEmail(v) || !!normPhone(v), 'Enter a valid email or phone'), b = check('fp-pw', v => v.length >= 6, 'At least 6 characters'), c = check('fp-pw2', v => v === $('#fp-pw').value && v, 'Passwords do not match');
        if (!(a && b && c)) return;
        const all = users(), id = $('#fp-id').value.trim(), v = id.toLowerCase(), ph = normPhone(id);
        const u = all.find(x => (x.email && x.email.toLowerCase() === v) || (ph && x.phone === ph));
        if (!u) { const f = $('#fp-id').closest('.fld'); f.classList.add('err'); (f.querySelector('.em') || f.appendChild(Object.assign(document.createElement('span'), { className: 'em' }))).textContent = 'No account found.'; return; }
        u.salt = rid(); u.hash = await hashPw($('#fp-pw').value, u.salt); saveUsers(all);
        closeSheet(); $('#li-id').value = id; $('#li-pw').value = ''; toast('Password updated. You can log in now.');
      }; });
  }

  /* ---------- sign out ---------- */
  function confirmSignOut() {
    openSheet('Sign Out', `<div class="card" style="text-align:center"><p style="font-size:15px;margin-bottom:4px"><b>Sign out of AgriGO?</b></p><p class="note" style="margin:0">You can log back in anytime with your phone/email and password.</p></div>
      <div class="acts"><button class="btn out" data-close>Cancel</button><button class="btn bad" id="so-ok">Sign Out</button></div>`,
      () => { $('#so-ok').onclick = signOut; });
  }
  function signOut() {
    endSession(); closeSheet(); openAuth('login');
    setTimeout(() => { hist = []; go('home', null, false); }, 500);   // next login starts fresh on Home
    setTimeout(() => toast('You have been signed out'), 250);
  }

  /* ---------- splash ---------- */
  function runSplash() {
    const splash = $('#splash'), bar = $('#spBar'), t0 = performance.now();
    const logoReady = new Promise(r => { const im = $('.sp-logo', splash); if (im.complete) r(); else { im.onload = im.onerror = r; } });
    const fontsReady = (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).catch(() => {});
    let ready = false; Promise.all([logoReady, fontsReady]).then(() => ready = true);
    setTimeout(() => ready = true, MIN_SPLASH + 1200);                // safety: never hang on a slow/blocked asset
    let done = false;
    (function tick(now) {
      const el = now - t0, k = Math.min(1, el / MIN_SPLASH), eased = 1 - Math.pow(1 - k, 2.2);   // fast start, gentle finish
      bar.style.width = ((ready ? eased : Math.min(.9, eased)) * 100).toFixed(1) + '%';
      if (el >= MIN_SPLASH && ready && !done) { done = true; bar.style.width = '100%'; return setTimeout(finish, 320); }
      requestAnimationFrame(tick);
    })(t0);
    function finish() {
      const u = currentUser();
      if (u) { DB.profile = { ...DB.profile, name: u.name, phone: u.phone || '', email: u.email || '', avatar: initials(u.name) }; save(); go('home', null, false); }
      else openAuth('login');
      splash.classList.add('out'); setTimeout(() => splash.remove(), 700);
    }
  }

  /* ---------- init ---------- */
  function init() {
    $('#auth').innerHTML = loginHTML + signupHTML;
    const A = $('#auth');
    $('#f-login').addEventListener('submit', doLogin);
    $('#f-signup').addEventListener('submit', doSignup);
    $('#li-forgot').onclick = forgotSheet;
    A.addEventListener('click', e => {
      const to = e.target.closest('[data-to]'); if (to) return show(to.dataset.to);
      const eye = e.target.closest('[data-eye]'); if (eye) { const i = $('#' + eye.dataset.eye), hide = i.type === 'password'; i.type = hide ? 'text' : 'password'; eye.innerHTML = svg(hide ? 'eye' : 'eyeoff'); eye.setAttribute('aria-label', hide ? 'Hide password' : 'Show password'); return i.focus(); }
      const so = e.target.closest('[data-soc]'); if (so) oauth(so.dataset.soc);
    });
    A.addEventListener('input', e => { const f = e.target.closest('.au-f'); if (f) f.classList.remove('err'); });
    const last = rd(LAST_KEY); if (last) { $('#li-id').value = last; $('#li-rem').checked = true; }
    seedDemo().then(runSplash);
  }
  init();
  return { confirmSignOut, signOut, show };
})();
