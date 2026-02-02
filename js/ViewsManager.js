// views.js
import { database } from './FirebaseConfig.js';
import { ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* ===============================
   تخزين Callback لكل مسار
   =============================== */
const _viewsCallbacks = {};

/* ===============================
   الاشتراك في التحديثات لأي مسار
   =============================== */
export function onViewsUpdate(path, callback) {
  if (!path || typeof callback !== "function") return;

  if (!_viewsCallbacks[path]) _viewsCallbacks[path] = [];
  _viewsCallbacks[path].push(callback);
}

/* ===============================
   زيادة المشاهدات لأي مسار مع LocalStorage
   =============================== */
export async function initViews(path, itemId) {
  if (!path || !itemId) return;

  // اجعل المعرف صالحًا
  const safeItemId = itemId.replace(/[.#$[\]]/g, "_");
  const fullRef = ref(database, `${path}/${safeItemId}/seen`);

  // تحقق من LocalStorage إذا تمت المشاهدة
  const localKey = `${path.replace(/\//g, "_")}_seen_${safeItemId}`;
  const hasSeen = localStorage.getItem(localKey);

  if (!hasSeen) {
    await runTransaction(fullRef, current => (current || 0) + 1);
    localStorage.setItem(localKey, "true");
  }

  // الاستماع للتحديثات Realtime
  onValue(fullRef, snap => {
    const count = snap.val() || 0;
    if (_viewsCallbacks[path]) {
      _viewsCallbacks[path].forEach(cb => cb(count));
    }
  });
}

/* ===============================
   الحصول على عدد المشاهدات لأي عنصر
   =============================== */
export async function getViews(path, itemId) {
  if (!path || !itemId) return 0;
  const safeItemId = itemId.replace(/[.#$[\]]/g, "_");
  const fullRef = ref(database, `${path}/${safeItemId}/seen`);

  let value = 0;
  await runTransaction(fullRef, current => {
    value = current || 0;
    return current; // لا نغير القيمة
  });
  return value;
}