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
    await signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value);

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
    await signInWithPopup(auth, provider);

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
  const isHome = location.pathname.includes("home");

  if (!user && isHome) {
    location.href = "../index.html";
  }
});