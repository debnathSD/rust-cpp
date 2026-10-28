import { PHASES, TRACKS } from "./roadmap.js";
import { firebaseConfig } from "./firebase-config.js";

// Firebase's own browser builds, pinned so a new SDK release never changes the app underneath you.
const SDK = "https://www.gstatic.com/firebasejs/12.19.0";
const BASE_PACE = 10;
const PACES = [6, 8, 10, 15, 20];
const DEFAULT_START = "2026-11-02";

const $ = id => document.getElementById(id);
const fresh = () => ({ done: {}, start: DEFAULT_START, pace: BASE_PACE });
let state = fresh();
const phaseItems = {}; // phase id -> [item ids]

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }

function adopt(s) {
  state = {
    done: (s.done && typeof s.done === "object") ? { ...s.done } : {},
    start: /^\d{4}-\d{2}-\d{2}$/.test(s.start || "") ? s.start : DEFAULT_START,
    pace: PACES.includes(Number(s.pace)) ? Number(s.pace) : BASE_PACE
  };
}

/* ---------- Rendering ---------- */

function itemLi(pid, id, html) {
  phaseItems[pid].push(id);
  return `<li class="item" data-row="${id}"><input type="checkbox" id="c-${id}" data-item="${id}"><label for="c-${id}">${html}</label></li>`;
}

function renderPhase(p) {
  phaseItems[p.id] = [];
  const chips = p.tracks.map(t => `<span class="chip t-${t}">${TRACKS[t]}</span>`).join("");
  const learn = p.learn.map((x, i) => {
    const o = typeof x === "string" ? { t: x } : x;
    const tag = o.tag ? `<span class="tag t-${o.tag}">${o.tag === "cpp" ? "C++" : "FFI"}</span>` : "";
    return itemLi(p.id, `${p.id}-l-${i}`, tag + rich(o.t));
  }).join("");
  const read = p.read.map((r, i) => itemLi(p.id, `${p.id}-r-${i}`,
    `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.t)}</a>${r.book ? '<span class="badge">book</span>' : ""}<span class="note"> · ${rich(r.note)}</span>`
  )).join("");
  const build = p.build ? `
    <div class="build">
      <h3>Build</h3>
      <p class="pname">${esc(p.build.name)}</p>
      <p>${rich(p.build.desc)}</p>
      <ul class="checks">${p.build.steps.map((s, i) => itemLi(p.id, `${p.id}-b-${i}`, rich(s))).join("")}</ul>
    </div>` : "";
  const checks = p.checks.map((c, i) => {
    const id = `${p.id}-x-${i}`;
    phaseItems[p.id].push(id);
    return `<li data-row="${id}"><input type="checkbox" id="c-${id}" data-item="${id}"><label for="c-${id}"><span class="tn">test ${esc(c.n)}</span> <span class="dim">...</span><span class="td">${rich(c.t)}</span></label><span class="st" data-st="${id}">pending</span></li>`;
  }).join("");
  const diag = p.diag ? $("diag-tpl").innerHTML : "";
  return `
  <section class="phase" id="phase-${p.n}" data-phase="${p.id}">
    <div class="ph-head">
      <div>
        <div class="ph-kicker"><span class="pn">Phase ${p.n}</span>${chips}</div>
        <h2>${esc(p.name)}</h2>
        <div class="ph-meta" data-meta="${p.id}"></div>
      </div>
      <div class="ph-prog">
        <div class="meter"><span data-bar="${p.id}"></span></div>
        <div class="ph-count" data-count="${p.id}"></div>
      </div>
    </div>
    <p class="why">${rich(p.why)}</p>
    ${diag}
    <div class="cols">
      <div class="col"><h3>${esc(p.learnTitle || "Learn")}</h3><ul class="checks">${learn}</ul></div>
      <div class="col"><h3>Read &amp; practice</h3><ul class="checks">${read}</ul></div>
    </div>
    ${build}
    <div class="term exit">
      <h3>Exit checks</h3>
      <div><span class="dim">$</span> cargo test --test phase_${p.n}_exit</div>
      <div class="dim">running ${p.checks.length} tests</div>
      <ul>${checks}</ul>
      <div class="res" data-res="${p.id}"></div>
    </div>
  </section>`;
}

function segsHtml(linked) {
  return PHASES.map(p => linked
    ? `<a class="seg t-${p.tracks[0]}" href="#phase-${p.n}" data-seg="${p.id}" aria-label="Phase ${p.n}: ${esc(p.name)}"><span class="seg-n">${p.n}</span><span class="seg-bar"><i data-segfill="${p.id}"></i></span></a>`
    : `<span class="seg t-${p.tracks[0]}" style="flex:${p.weeks} 1 0px"><span class="seg-n">${p.n}</span><span class="seg-bar"></span></span>`
  ).join("");
}

function buildPage() {
  $("phases").innerHTML = PHASES.map(renderPhase).join("");
  $("segs").innerHTML = segsHtml(true);
  $("gate-segs").innerHTML = segsHtml(false);
  const weeks = PHASES.reduce((n, p) => n + p.weeks, 0);
  $("gate-span").textContent = `8 phases · ${weeks} weeks at 10 h/week`;
  $("rail").innerHTML =
    `<a class="plain" href="#howto">How to use this plan</a><hr>` +
    PHASES.map(p => `<a href="#phase-${p.n}" data-rail="${p.id}"><span class="rn">${p.n}</span><span>${esc(p.short)}</span><span class="rc" data-railc="${p.id}"></span></a>`).join("") +
    `<hr><a class="plain" href="#kit">Hardware kit</a><a class="plain" href="#expert">What expert looks like</a>`;
}

function parseStart() {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(state.start) || /^(\d{4})-(\d{2})-(\d{2})$/.exec(DEFAULT_START);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const fmtDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fmtFull = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
function fmtRange(a, b) { return `${a.getFullYear() === b.getFullYear() ? fmtDay.format(a) : fmtFull.format(a)} – ${fmtFull.format(b)}`; }

function updateSchedule() {
  const start = parseStart();
  let wk = 0;
  PHASES.forEach(p => {
    const w = Math.max(1, Math.round(p.weeks * BASE_PACE / state.pace));
    const s = wk; wk += w;
    const a = addDays(start, s * 7), b = addDays(start, (s + w) * 7 - 1);
    const weeks = w === 1 ? `Week ${s + 1}` : `Weeks ${s + 1}–${s + w}`;
    document.querySelector(`[data-meta="${p.id}"]`).textContent =
      `${weeks} · ${fmtRange(a, b)} · about ${w * state.pace} h${p.ongoing ? ", then ongoing" : ""}`;
    const seg = document.querySelector(`[data-seg="${p.id}"]`);
    seg.style.flex = `${w} 1 0px`;
    seg.title = `Phase ${p.n} · ${p.name} · ${fmtRange(a, b)}`;
  });
  const end = addDays(start, wk * 7 - 1);
  $("tl-dates").textContent = `${fmtFull.format(start)} → ${fmtFull.format(end)}`;
  $("overall-span").textContent = `${wk} weeks · about ${wk * state.pace} h`;
  $("start").value = state.start;
  $("pace").value = String(state.pace);
}

function updateProgress() {
  let all = 0, allDone = 0;
  PHASES.forEach(p => {
    const ids = phaseItems[p.id];
    let d = 0;
    ids.forEach(id => {
      const on = !!state.done[id];
      if (on) d++;
      $("c-" + id).checked = on;
      document.querySelector(`[data-row="${id}"]`).classList.toggle("done", on);
      const st = document.querySelector(`[data-st="${id}"]`);
      if (st) st.textContent = on ? "ok" : "pending";
    });
    all += ids.length; allDone += d;
    const pct = ids.length ? Math.round(d / ids.length * 100) : 0;
    document.querySelector(`[data-bar="${p.id}"]`).style.width = pct + "%";
    document.querySelector(`[data-count="${p.id}"]`).textContent = `${d} of ${ids.length} · ${pct}%`;
    document.querySelector(`[data-segfill="${p.id}"]`).style.width = pct + "%";
    const rc = document.querySelector(`[data-railc="${p.id}"]`);
    rc.textContent = `${d}/${ids.length}`;
    rc.classList.toggle("full", d === ids.length);
    const passed = p.checks.filter((_, i) => state.done[`${p.id}-x-${i}`]).length;
    const left = p.checks.length - passed;
    document.querySelector(`[data-res="${p.id}"]`).innerHTML = left === 0
      ? `<span class="dim">test result:</span> <b class="ok">ok</b>. ${passed} passed; 0 pending. Phase ${p.n} complete.`
      : `<span class="dim">test result:</span> <b>pending</b>. ${passed} passed; ${left} to go`;
  });
  const pct = all ? Math.round(allDone / all * 100) : 0;
  $("overall-count").innerHTML = `<strong>${allDone}</strong> of ${all} done · ${pct}%`;
  $("overall-meter").setAttribute("aria-valuenow", String(pct));
  $("overall-meter").firstElementChild.style.width = pct + "%";
}

function watchRail() {
  if (!("IntersectionObserver" in window)) return;
  const links = {};
  document.querySelectorAll("[data-rail]").forEach(a => { links[a.dataset.rail] = a; });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      Object.values(links).forEach(a => a.classList.remove("active"));
      links[en.target.dataset.phase]?.classList.add("active");
    });
  }, { rootMargin: "-35% 0px -60% 0px" });
  document.querySelectorAll(".phase").forEach(s => io.observe(s));
}

/* ---------- Sign-in screen ---------- */

function gateMessage(text, isError = false) {
  const el = $("gate-msg");
  el.textContent = text;
  el.classList.toggle("error", isError);
}

function authError(e) {
  const code = (e && e.code) || "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "Sign-in was cancelled. Try again when you're ready.";
  if (code === "auth/unauthorized-domain") return `This address can't sign in yet. Add ${location.hostname} in Firebase under Authentication → Settings → Authorized domains.`;
  if (code === "auth/operation-not-allowed") return "Google sign-in is turned off for this Firebase project. Turn it on under Authentication → Sign-in method.";
  if (code === "auth/network-request-failed") return "Couldn't reach Google. Check your connection and try again.";
  return `Sign-in failed (${code || "unknown error"}). Try again.`;
}

/* ---------- Saving ---------- */

const STATUS = {
  loading: "Loading your progress…",
  saving: "Saving…",
  saved: "Saved to your account",
  offline: "Offline. Your changes will sync when you reconnect.",
  denied: "This account isn't allowed to save progress here.",
  error: "Couldn't save your progress. Reload the page to try again."
};
function setStatus(kind) {
  const el = $("save-status");
  el.dataset.kind = kind === "denied" ? "error" : kind;
  el.textContent = STATUS[kind];
}

let fb = null;          // { auth, db, authMod, fsMod } once Firebase has loaded
let ref = null;         // this person's progress document: users/<uid>
let unsubscribe = null;
let timer = null;
let dirty = false;      // a local change is waiting for its debounced write

function queueSave() {
  if (!ref) return;
  dirty = true;
  setStatus("saving");
  clearTimeout(timer);
  timer = setTimeout(save, 600);
}

function save() {
  if (!ref) return;
  dirty = false;
  const { fsMod } = fb;
  // Firestore applies the write locally at once and queues it while offline.
  fsMod.setDoc(ref, { done: { ...state.done }, start: state.start, pace: state.pace, updatedAt: fsMod.serverTimestamp() })
    .catch(e => setStatus(e && e.code === "permission-denied" ? "denied" : "error"));
}

function openUser(user) {
  const { db, fsMod } = fb;
  clearTimeout(timer);
  dirty = false;
  state = fresh();
  updateSchedule();
  updateProgress();
  $("who").textContent = user.email || user.displayName || "Signed in";
  $("gate").hidden = true;
  $("app").hidden = false;
  setStatus("loading");
  ref = fsMod.doc(db, "users", user.uid);
  unsubscribe?.();
  unsubscribe = fsMod.onSnapshot(ref, { includeMetadataChanges: true }, snap => {
    // Ignore echoes of our own writes and anything that arrives while a change is still queued.
    if (!dirty && !snap.metadata.hasPendingWrites) {
      if (snap.exists()) adopt(snap.data()); else state = fresh();
      updateSchedule();
      updateProgress();
    }
    if (dirty || snap.metadata.hasPendingWrites) setStatus("saving");
    else setStatus(snap.metadata.fromCache ? "offline" : "saved");
  }, e => setStatus(e && e.code === "permission-denied" ? "denied" : "error"));
}

function closeUser() {
  unsubscribe?.();
  unsubscribe = null;
  ref = null;
  clearTimeout(timer);
  dirty = false;
  state = fresh();
  updateProgress();
  $("app").hidden = true;
  $("gate").hidden = false;
  $("sign-in").disabled = false;
  gateMessage("");
}

async function signIn() {
  const { auth, authMod } = fb;
  const provider = new authMod.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  $("sign-in").disabled = true;
  gateMessage("Opening Google sign-in…");
  try {
    await authMod.signInWithPopup(auth, provider);
  } catch (e) {
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
      await authMod.signInWithRedirect(auth, provider);
      return;
    }
    gateMessage(authError(e), true);
    $("sign-in").disabled = false;
  }
}

async function startFirebase() {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    gateMessage("Setup needed: add your Firebase web config to assets/firebase-config.js. The README walks through it.", true);
    return;
  }
  let appMod, authMod, fsMod;
  try {
    [appMod, authMod, fsMod] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-auth.js`),
      import(`${SDK}/firebase-firestore.js`)
    ]);
  } catch (e) {
    gateMessage("Couldn't load sign-in. Check your connection and reload the page.", true);
    return;
  }
  const app = appMod.initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  let db;
  try {
    // A local cache lets you tick items offline and opens instantly on return visits.
    db = fsMod.initializeFirestore(app, { localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }) });
  } catch (e) {
    db = fsMod.getFirestore(app);
  }
  fb = { auth, db, authMod, fsMod };

  $("sign-in").addEventListener("click", signIn);
  $("sign-out").addEventListener("click", () => authMod.signOut(auth));
  authMod.getRedirectResult(auth).catch(e => gateMessage(authError(e), true));
  authMod.onAuthStateChanged(auth, user => (user ? openUser(user) : closeUser()));
}

/* ---------- Start ---------- */

document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches("input[data-item]")) {
    if (t.checked) state.done[t.dataset.item] = true; else delete state.done[t.dataset.item];
    updateProgress();
    queueSave();
  } else if (t.id === "start" && /^\d{4}-\d{2}-\d{2}$/.test(t.value)) {
    state.start = t.value;
    updateSchedule();
    queueSave();
  } else if (t.id === "pace") {
    state.pace = PACES.includes(Number(t.value)) ? Number(t.value) : BASE_PACE;
    updateSchedule();
    queueSave();
  }
});

buildPage();
updateSchedule();
updateProgress();
watchRail();
startFirebase();
