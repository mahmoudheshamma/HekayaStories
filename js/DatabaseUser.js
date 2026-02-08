import { database } from "./FirebaseConfig.js";
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


export async function createUserInDB(user) {
  const userRef = ref(database, `users/${user.uid}`);

  await set(userRef, {
    uid: user.uid,
    title: "",
    role: "user",
    likes: 0,
    followers: 0,
    name: user.displayName || "مستخدم غير معروف",
    email: user.email || "",
    photo: user.photoURL || "",
    time: Date.now()
  });
}

// جلب بيانات مستخدم بالـ UID
export async function getUserDataByUID(uid) {
  const snapshot = await get(child(ref(database), `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// جلب صورة الملف الشخصي
export async function getUserProfileImage(uid, authUser) {
  const data = await getUserDataByUID(uid);

  if (data?.photoURL) return data.photoURL;
  if (authUser?.photoURL) return authUser.photoURL;

  return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}