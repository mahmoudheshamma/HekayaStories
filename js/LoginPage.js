import { database, auth, app } from "./FirebaseConfig.js";
import { createUserInDB } from "./DatabaseUser.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

// تسجيل دخول ايميل
window.loginEmail = async () => {
  await signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
  location.href = "../index.html";
};

// إنشاء حساب
window.signupEmail = async () => {
  const res = await createUserWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
  await createUserInDB(res.user);
  location.href = "../index.html";
};

// تسجيل جوجل
window.loginGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  await createUserInDB(res.user);
  location.href = "../index.html";
};

// تسجيل فيسبوك
window.loginFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const res = await signInWithPopup(auth, provider);
  await createUserInDB(res.user);
  location.href = "../index.html";
};

// تسجيل خروج
window.logout = async () => {
  await signOut(auth);
  location.href = "../index.html";
};

// نسيت كلمة المرور
window.resetPassword = async () => {
  if (!emailEl.value) return alert("اكتب الايميل أولاً");
  await sendPasswordResetEmail(auth, emailEl.value);
  alert("تم إرسال رابط الاستعادة إلى بريدك الإلكتروني");
};

// التحقق من تسجيل الدخول
onAuthStateChanged(auth, (user) => {
  if (!user && location.pathname.includes("home")) {
    location.href = "../index.html";
  }
});
