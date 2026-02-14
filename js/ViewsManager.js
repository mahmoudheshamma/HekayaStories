// views.js
import { database } from './FirebaseConfig.js';
import {
  ref,
  onValue,
  off,
  runTransaction,
  get,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* ===============================
   التخزين الداخلي
   =============================== */
const _viewsCallbacks = {};
const _listeners = {};

/* ===============================
   تنظيف الـ ID
   =============================== */
function safeId(id) {
  return id.replace(/[.#$[\]]/g, "_");
}

/* ===============================
   الاشتراك في التحديثات
   =============================== */
export function onViewsUpdate(path, callback, itemId) {
  if (!path || !itemId || typeof callback !== "function") return;

  const key = `${path}_${safeId(itemId)}`;

  if (!_viewsCallbacks[key]) _viewsCallbacks[key] = [];
  _viewsCallbacks[key].push(callback);
}

/* ===============================
   زيادة المشاهدات بشكل آمن
   =============================== */
export async function initViews(path, itemId) {
  if (!path || !itemId) return;

  const id = safeId(itemId);
  const key = `${path}_${id}`;

  // مسار المشاهدات داخل القصة نفسها
  const storySeenRef = ref(database, `${path}/${id}/seen`);
  // مسار المشاهدات للـ Analytics منفصل
  const analyticsRef = ref(database, `views/${path}/${id}/count`);
  const lastUpdateRef = ref(database, `views/${path}/${id}/lastUpdate`);

  /* ===============================
     منع التكرار خلال 24 ساعة
     =============================== */
  const localKey = `viewed_${key}`;
  const lastSeen = Number(localStorage.getItem(localKey) || 0);
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  if (now - lastSeen > DAY) {
    try {
      // زيادة المشاهدات في القصة نفسها
      await runTransaction(storySeenRef, current => (current || 0) + 1);
      // زيادة المشاهدات في Analytics منفصل
      await runTransaction(analyticsRef, current => (current || 0) + 1);
      // تحديث آخر وقت مشاهدة
      await runTransaction(lastUpdateRef, () => serverTimestamp());

      localStorage.setItem(localKey, now.toString());
    } catch (err) {
      console.error("Views transaction error:", err);
    }
  }

  /* ===============================
     منع تكرار الـ Listener
     =============================== */
  if (_listeners[key]) return;

  const callback = snap => {
    const count = snap.val() || 0;

    if (_viewsCallbacks[key]) {
      _viewsCallbacks[key].forEach(cb => {
        try { cb(count); }
        catch (e) { console.error("Callback error:", e); }
      });
    }
  };

  onValue(analyticsRef, callback);
  _listeners[key] = { ref: analyticsRef, callback };
}

/* ===============================
   جلب عدد المشاهدات فقط (سريع)
   =============================== */
export async function getViews(path, itemId) {
  if (!path || !itemId) return 0;

  try {
    // قراءة المشاهدات من Analytics
    const snap = await get(ref(database, `views/${path}/${safeId(itemId)}/count`));
    return snap.val() || 0;
  } catch (err) {
    console.error("Get views error:", err);
    return 0;
  }
}

/* ===============================
   إلغاء الاستماع (مهم للأداء)
   =============================== */
export function destroyViews(path, itemId) {
  if (!path || !itemId) return;

  const key = `${path}_${safeId(itemId)}`;

  if (_listeners[key]) {
    off(_listeners[key].ref, "value", _listeners[key].callback);
    delete _listeners[key];
  }

  delete _viewsCallbacks[key];
}