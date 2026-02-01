// views.js
import { database } from './FirebaseConfig.js';
import { ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* متغير عام */
export let STORY_VIEWS = 0;

/* منع تكرار التهيئة */
const _activeViewStories = new Set();

/* Callbacks عند التحديث */
const _viewsCallbacks = [];

/* ===============================
   تشفير SHA-256
   =============================== */
async function _hash(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ===============================
   LocalStorage Helpers
   =============================== */
function _hasViewed(key) {
  return localStorage.getItem("v_" + key) === "1";
}

function _markViewed(key) {
  localStorage.setItem("v_" + key, "1");
}

/* ===============================
   الاشتراك في التحديثات
   =============================== */
export function onStoryViewsUpdate(callback) {
  if (typeof callback === "function") {
    _viewsCallbacks.push(callback);
  }
}

/* ===============================
   النظام الرئيسي
   =============================== */
export async function initStoryViews(rawStoryId) {
  if (!rawStoryId) return;

  if (_activeViewStories.has(rawStoryId)) return;
  _activeViewStories.add(rawStoryId);

  const storyKey = await _hash(rawStoryId);
  const storyRef = ref(database, `story/${storyKey}/seen`);

  // زيادة المشاهدة مرة واحدة لكل جهاز
  if (!_hasViewed(storyKey)) {
    runTransaction(storyRef, v => (v || 0) + 1);
    _markViewed(storyKey);
  }

  // الاستماع للتحديثات Realtime
  onValue(storyRef, snap => {
    STORY_VIEWS = snap.val() || 0;
    _viewsCallbacks.forEach(cb => cb(STORY_VIEWS));
  });
}

/* ===============================
   Getter عام
   =============================== */
export function getStoryViews() {
  return STORY_VIEWS;
}