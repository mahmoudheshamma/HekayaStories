import { database } from "./FirebaseConfig.js";
import { ref, get, query, orderByChild, equalTo }
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* ===============================
   🔹 جلب قصة بواسطة ID
================================ */
export async function getStoryById(id) {
    if (!id) return null;

    try {
        const snapshot = await get(ref(database, `story/${id}`));
        return snapshot.exists() ? { id, ...snapshot.val() } : null;
    } catch (e) {
        console.error("getStoryById error:", e);
        return null;
    }
}

/* ===============================
   🔹 جلب قصة بواسطة slug
   (مثال: story-title-here)
================================ */
export async function getStoryBySlug(slug) {
    if (!slug) return null;

    try {
        const q = query(
            ref(database, "story"),
            orderByChild("slug_story"),
            equalTo(slug)
        );

        const snapshot = await get(q);

        if (!snapshot.exists()) return null;

        const data = snapshot.val();
        const key = Object.keys(data)[0];

        return { id: key, ...data[key] };
    } catch (e) {
        console.error("getStoryBySlug error:", e);
        return null;
    }
}
