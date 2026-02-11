import { database, auth } from "./FirebaseConfig.js";
import { setUserImageToImg, getUserDataByUID, getUserProfileImage, doesUserExist } from './DatabaseUser.js';

let userData = [];

const logoutBtn = document.getElementById("logoutBtn");
const profilePhoto = document.getElementById("profilePhoto");
const verifyEl = document.getElementById("verify-badge");
const nameEl = document.getElementById("name");
const usernameEl = document.getElementById("username");
const titleEl = document.getElementById("title");
const roleEl = document.getElementById("role");
const followersEl = document.getElementById("followers");
const likesEl = document.getElementById("likes");
const itemList = document.getElementById("itemList");

////////////

const params = new URLSearchParams(window.location.search);
let id = params.get("id");

init();

async function init() {
    try {
        if (id) {
            userData = await getUserDataByUID(id);
        } else {
            const loggedIn = window.isLoggedIn();
            if (loggedIn) {
                id = window.getCurrentUID();
                userData = await getUserDataByUID(id);
            } else {
                window.location.href = "../html/error.html";
                return;
            }
        }
    } catch (err) {
        window.location.href = "../html/error.html";
        return;
    }

    if (userData) {
        RenderDataUser();
    } else {
        window.location.href = "../html/error.html";
    }
}

/////////

logoutBtn.addEventListener("click", async () => {
  try {
    logout();
  } catch (error) {
    
    alert("حدث خطأ أثناء تسجيل الخروج!");
    window.location.href = "../html/error.html";
  }
});


///////////

function RenderDataUser() {

    setUserImageToImg(userData.uid, profilePhoto);
    
    verifyEl.style.display = userData?.verify ? "block" : "none";
    
    nameEl.textContent = `${userData.name}`;
    usernameEl.textContent = `@${userData.username}`;
    titleEl.textContent = `${userData.title}`;
    /*
    roleEl.textContent = `${userData.role}`;
    */
    followersEl.textContent = `${userData.followers}`;
    likesEl.textContent = `${userData.likes}`;
    
hideLoading();
    
}