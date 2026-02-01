// views.js
import { database } from './FirebaseConfig.js';
import { ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* متغير عام */
export let STORY_VIEWS = 0;

/* Callbacks عند التحديث */
const _viewsCallbacks = [];

/* ===============================
   الاشتراك في التحديثات
   =============================== */
export function onStoryViewsUpdate(callback) {
  if (typeof callback === "function") _viewsCallbacks.push(callback);
}

/* ===============================
   النظام الرئيسي باستخدام LocalStorage
   =============================== */
export async function initStoryViews(rawStoryId) {
  if (!rawStoryId) return;

  // استخدام ID مباشرة كمفتاح
  const safeStoryId = rawStoryId.replace(/[.#$[\]]/g, "_"); // اجعل المسار صالح إذا فيه رموز ممنوعة
  const storyRef = ref(database, `story/${safeStoryId}/seen`);

  // تحقق محليًا إذا تم مشاهدة القصة من قبل
  const localKey = `story_seen_${safeStoryId}`;
  const hasSeen = localStorage.getItem(localKey);

  if (!hasSeen) {
    // لم يشاهد من قبل → زيادة المشاهدة
    await runTransaction(storyRef, current => (current || 0) + 1);
    // تخزين الحالة محليًا
    localStorage.setItem(localKey, "true");
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