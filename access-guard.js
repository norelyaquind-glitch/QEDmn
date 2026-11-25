// access-guard.js — shared by Sets, AlgStructures, Polynomials and Exams pages.
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const CONTENT_ENDPOINT = "https://script.google.com/macros/s/AKfycbwj3smI6BJPukgB_qFQcVVJ5Zl8fS4ra5bYPIvTChAI3LRy7b96O1oYCUz080imiD7pDQ/exec";
const PLANS_URL = "index.html#join%20us";

// ---------- What this student can open ----------
const ALL = ["LOGIC", "SETS", "ALGSTRUCT", "POLY"];
function legacyParts(tier) {
  const lessons = ALL.map(c => "lessons:" + c);
  const td = ALL.map(c => "td:" + c);
  if (tier === "basic") return lessons;
  if (tier === "standard") return [...lessons, ...td];
  if (tier === "premium") return [...lessons, ...td, "exams"];
  return [];
}
function resolveParts(data) {
  if (Array.isArray(data.parts) && data.parts.length) return data.parts;
  return legacyParts(data.tier);
}

// ---------- Session cache (10 minutes) ----------
const CACHE_KEY = "qedmn_access_v2";
const CACHE_MS = 10 * 60 * 1000;
function getCachedParts(email) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (c.email !== email || !Array.isArray(c.parts) || Date.now() - c.t > CACHE_MS) return null;
    return c.parts;
  } catch (e) { return null; }
}
function cacheParts(email, parts) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ email, parts, t: Date.now() })); } catch (e) {}
}

// ---------- Screens ----------
function showMessage(title, html) {
  document.getElementById("checking").style.display = "none";
  document.getElementById("pendingTitle").textContent = title;
  document.getElementById("pendingText").innerHTML = html;
  document.getElementById("pending").style.display = "block";
}

// Case 1: not paid / not approved
function showNotJoined() {
  showMessage(
    "You haven't joined QEDMN yet!",
    "Pick a plan to get access. If you already paid, please allow a little time for approval. " +
    "<br><br><a href='" + PLANS_URL + "'>See the plans</a>"
  );
}

// Case 3: has a plan, but this chapter is not in it
function showNotInPlan() {
  showMessage(
    "This chapter is not included in your plan.",
    "You can add it to your plan. <br><br><a href='" + PLANS_URL + "'>See the plans</a>"
  );
}

// Case 2: approved -> show what the plan includes
function showAccess(parts) {
  document.getElementById("checking").style.display = "none";

  let any = false;
  document.querySelectorAll("[data-need]").forEach(block => {
    const ok = parts.includes(block.dataset.need);
    block.style.display = ok ? "" : "none";
    if (ok) any = true;
  });
  document.querySelectorAll("[data-lock]").forEach(box => {
    box.style.display = parts.includes(box.dataset.lock) ? "none" : "";
  });

  if (!any) { showNotInPlan(); return; }

  document.getElementById("app").style.display = "block";
  if (window.AOS) {
    window.AOS.init({ duration: 700, once: true, offset: 60 });
    window.setTimeout(() => window.AOS.refresh(), 50);
  }
}

function goToLogin() {
  const target = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
  window.location.href = "access.html?redirect=" + target;
}

// ---------- Rotating quotes while "Checking your account..." ----------
const CHECKING_QUOTES = [
  { text: "اللهم لا سهل إلا ما جعلته سهلاً، وأنت تجعل الحزن إذا شئت سهلاً", dir: "rtl" },
  { text: "رب اشرح لي صدري ويسر لي أمري", dir: "rtl" },
  { text: "اللهم اجعل هذا العلم حجة لي لا علي، ويسر لي فهمه وارزقني فهم الأنبياء", dir: "rtl" },
  { text: "من جد وجد، ومن زرع حصد", dir: "rtl" },
  { text: "Patience is bitter, but its fruit is sweet.", dir: "ltr" },
  { text: "The expert in anything was once a beginner.", dir: "ltr" },
  { text: "Mathematics is not about numbers, equations, or algorithms: it is about understanding.", dir: "ltr" }
];
let quoteIndex = 0;
let quoteTimer = null;
const quoteEl = document.getElementById("checkingQuote");

function showNextQuote() {
  if (!quoteEl) return;
  quoteEl.classList.remove("visible");
  window.setTimeout(() => {
    const q = CHECKING_QUOTES[quoteIndex % CHECKING_QUOTES.length];
    quoteEl.textContent = q.text;
    quoteEl.setAttribute("dir", q.dir);
    quoteEl.classList.add("visible");
    quoteIndex++;
  }, 350);
}
function stopQuoteRotation() { if (quoteTimer) { window.clearInterval(quoteTimer); quoteTimer = null; } }
showNextQuote();
quoteTimer = window.setInterval(showNextQuote, 3200);

// ---------- Main flow ----------
let finished = false;
let safety = null;
function done() { finished = true; stopQuoteRotation(); window.clearTimeout(safety); }

safety = window.setTimeout(() => {
  if (finished) return;
  finished = true;
  stopQuoteRotation();
  showMessage("This is taking too long",
    "<a href='javascript:location.reload()'>Try again</a> or <a href='access.html'>log in</a>.");
}, 12000);

onAuthStateChanged(auth, async (user) => {
  // Not logged in -> login page (then back here)
  if (!user) { done(); goToLogin(); return; }

  const cached = getCachedParts(user.email);
  if (cached) { done(); showAccess(cached); return; }

  try {
    const idToken = await user.getIdToken();
    const url = CONTENT_ENDPOINT + "?idToken=" + encodeURIComponent(idToken);

    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 10000);
    const response = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    window.clearTimeout(t);
    const data = await response.json();
    done();

    if (data.error) { goToLogin(); return; }
    if (data.emailVerified === false) { goToLogin(); return; }

    const parts = resolveParts(data);
    if (!data.tier && parts.length === 0) { showNotJoined(); return; }

    cacheParts(user.email, parts);
    showAccess(parts);
  } catch (error) {
    done();
    showMessage("Couldn't check your account",
      "<a href='javascript:location.reload()'>Try again</a> or <a href='access.html'>log in</a>.");
  }
});