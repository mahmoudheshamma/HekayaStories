import { database } from "./FirebaseConfig.js";
import { ref, get, set, remove, child } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";


export async function createUserInDB(user) {
  const userRef = ref(database, `users/${user.uid}`);

  await set(userRef, {
    uid: user.uid,
    title: "",
    role: "user",
    likes: 0,
    followers: 0,
    username: "",
    verify: false,
    premium:  false,
    block: false,
    canComment: true,
    name: user.displayName || "مستخدم غير معروف",
    email: user.email || "",
    photo: user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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

  if (data?.photo) return data.photo; // ← هنا استخدم photo وليس photoURL
  if (authUser?.photoURL) return authUser.photoURL;

  return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

export async function doesUserExist(uid) {
  try {
    const userRef = ref(database);
    const snapshot = await get(child(userRef, `users/${uid}`));
    return snapshot.exists();
  } catch (error) {
    // console.error("حدث خطأ أثناء التحقق من المستخدم:", error);
    return false;
  }
}


// وضع صورة المستخدم داخل عنصر img باستخدام الـ id
export async function setUserImageToImg(uid, imgElement, authUser = null) {
  try {
    if (!imgElement) return;

    const photoURL = await getUserProfileImage(uid, authUser);
    imgElement.src = photoURL;
  } catch (error) {
    console.error("خطأ أثناء تحميل صورة المستخدم:", error);
  }
}


export async function deleteUserAccount(authUser) {
  try {
    if (!authUser) throw new Error("لا يوجد مستخدم مسجل دخول");

    const uid = authUser.uid;

    // 1️⃣ حذف بيانات المستخدم من قاعدة البيانات
    await remove(ref(database, `users/${uid}`));

    return true;
  } catch (error) {
    console.error("خطأ أثناء حذف الحساب:", error);
    return false;
  }
}