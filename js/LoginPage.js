import { database, auth } from "./FirebaseConfig.js";

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

function loginEmail(){auth.signInWithEmailAndPassword(emailEl.value,passwordEl.value)}

function signupEmail(){
  auth.createUserWithEmailAndPassword(emailEl.value,passwordEl.value)
  .then(res=>createUserInDB(res.user,true))
}

function loginGoogle(){
  const p=new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(p).then(res=>createUserInDB(res.user,false))
}

function loginFacebook(){
  const p=new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(p).then(res=>createUserInDB(res.user,false))
}

function logout(){auth.signOut().then(()=>location.href="index.html")}

function resetPassword(){
  if(!emailEl.value)return alert("اكتب الايميل");
  auth.sendPasswordResetEmail(emailEl.value).then(()=>alert("تم الارسال"))
}
