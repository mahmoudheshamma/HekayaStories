/* ===============================
   Realtime Views System
   =============================== */

/* المتغير العام (تستدعيه من أي مكان) */
window.STORY_VIEWS = 0;

/* ===============================
   تشفير النص (SHA-256)
   =============================== */
async function _hash(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ===============================
   Local Storage Helpers
   =============================== */
function _hasViewed(key) {
  return localStorage.getItem("v_" + key) === "1";
}

function _markViewed(key) {
  localStorage.setItem("v_" + key, "1");
}

/* ===============================
   النظام الرئيسي
   =============================== */
window._activeViewStories = new Set();

async function initStoryViews(rawStoryId) {

  if (window._activeViewStories.has(rawStoryId)) return;
  window._activeViewStories.add(rawStoryId);

  const storyKey = await _hash(rawStoryId);
  const ref = firebase.database().ref("stories/" + storyKey + "/views");

  if (!_hasViewed(storyKey)) {
    ref.transaction(v => (v || 0) + 1);
    _markViewed(storyKey);
  }

  ref.on("value", snap => {
    window.STORY_VIEWS = snap.val() || 0;
  });
}

/* ===============================
   دالة جاهزة للاستخدام الخارجي
   =============================== */
window.getStoryViews = () => window.STORY_VIEWS;