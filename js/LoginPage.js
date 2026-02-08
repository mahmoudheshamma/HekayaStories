import { auth } from "./FirebaseConfig.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { createUserInDB } from "./DatabaseUser.js";

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

/* ========= رسائل الأخطاء ========= */
function getErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "البريد الإلكتروني غير صحيح";
    case "auth/user-not-found":
      return "المستخدم غير موجود";
    case "auth/wrong-password":
      return "كلمة المرور غير صحيحة";
    case "auth/email-already-in-use":
      return "البريد مستخدم مسبقاً";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة جداً";
    case "auth/popup-closed-by-user":
      return "تم إغلاق نافذة تسجيل الدخول";
    default:
      return "حدث خطأ غير متوقع: " + error.message;
  }
}

/* ========= تحقق من الإدخال ========= */
function validateInputs() {
  if (!emailEl.value || !passwordEl.value) {
    alert("اكتب البريد وكلمة المرور أولاً");
    return false;
  }
  return true;
}

/* ========= تسجيل دخول بالبريد ========= */
window.loginEmail = async () => {
  if (!validateInputs()) return;

  try {
    const res = await signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value);

    await createUserInDB(res.user);

    location.href = "../index.html";
  } catch (error) {
    alert(getErrorMessage(error));
    console.error(error);
  }
};

/* ========= إنشاء حساب ========= */
window.signupEmail = async () => {
  if (!validateInputs()) return;

  try {
    const res = await createUserWithEmailAndPassword(
      auth,
      emailEl.value,
      passwordEl.value
    );

    await createUserInDB(res.user);

    location.href = "../index.html";
  } catch (error) {
    alert(getErrorMessage(error));
    console.error(error);
  }
};

/* ========= تسجيل دخول Google ========= */
window.loginGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);

    await createUserInDB(res.user);

    location.href = "../index.html";
  } catch (error) {
    alert(getErrorMessage(error));
    console.error(error);
  }
};

/* ========= تسجيل خروج ========= */
window.logout = async () => {
  try {
    await signOut(auth);
    location.href = "../index.html";
  } catch (error) {
    alert("فشل تسجيل الخروج");
    console.error(error);
  }
};

/* ========= إعادة تعيين كلمة المرور ========= */
window.resetPassword = async () => {
  if (!emailEl.value) return alert("اكتب الايميل أولاً");

  try {
    await sendPasswordResetEmail(auth, emailEl.value);
    alert("تم إرسال رابط الاستعادة إلى بريدك الإلكتروني");
  } catch (error) {
    alert(getErrorMessage(error));
    console.error(error);
  }
};

/* ========= حماية الصفحات ========= */
onAuthStateChanged(auth, (user) => {
  const isHome = location.pathname.includes("index");

  if (!user && isHome) {
    location.href = "../index.html";
  }
});

window.isLoggedIn = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // إلغاء الاشتراك فور الحصول على النتيجة
      if (user) {
        resolve(true);  // المستخدم مسجل دخول
      } else {
        resolve(false); // لا يوجد مستخدم مسجل دخول
      }
    });
  });
};


window.getCurrentUID = () => {
  const user = auth.currentUser; // المستخدم الحالي
  if (user) {
    return user.uid;
  } else {
    console.warn("لا يوجد مستخدم مسجل دخول حالياً");
    return null;
  }
};