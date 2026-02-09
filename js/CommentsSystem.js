// comments.js
import { auth, db, messaging, bannedWords } from "./FirebaseConfig.js";
import { ref, push, set, onValue, runTransaction, child, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getToken } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging.js";

const allowLinks = false;
const cooldownMs = 15000;

let pageId = "";
let lastCommentTime = 0;

const commentsContainer = document.getElementById("comments");
const commentInput = document.getElementById("commentInput");

document.getElementById("sendBtn").onclick = () => AddComment();

// -----------------------
onAuthStateChanged(auth, user => {
    document.getElementById("loginWarn").style.display = user ? "none" : "block";
    document.getElementById("sendBtn").style.display = user ? "block" : "none";
});

// -----------------------
function filterText(text) {
  bannedWords.forEach(w => {
    const reg = new RegExp(w, "gi");
    text = text.replace(reg, "***");
  });
  return text;
}

function containsBadWords(text) {
  return bannedWords.some(w => text.includes(w));
}

function containsLink(text) {
  return /(https?:\/\/|www\.)/.test(text);
}

// -----------------------
async function initFCM() {
    try {
        if(!messaging) return;

        const perm = await Notification.requestPermission();
        if (perm !== "granted") return;

        const token = await getToken(messaging, { 
            vapidKey: "BDg-u7A5_L24gsB2jCW28EBPNIJ1Jw9kMic1KnFhLkN_vFQL8o7-rpQdS7luVOmbz2neipiXfgOYFh226meO4zQ" 
        });

        const user = auth.currentUser;
        if(user) await set(ref(db, `fcmTokens/${user.uid}`), token);
    } catch(e) { console.log(e); }
}

// -----------------------
async function getUserDataByUID(uid){
    const snap = await get(child(ref(db), `users/${uid}`));
    return snap.exists() ? snap.val() : {};
}

async function canComment(uid){
    const data = await getUserDataByUID(uid);
    return data.canComment ?? true;
}

// -----------------------
async function AddComment(parentId = null, text = null){
    const user = auth.currentUser;
    if(!user) return alert("يجب تسجيل الدخول أولاً");

    const now = Date.now();
    if(now - lastCommentTime < cooldownMs)
      return alert("انتظر قليلاً قبل التعليق مرة أخرى");

    let content = text || commentInput.value.trim();
    if(!content) return;

    content = filterText(content);

    if(containsBadWords(content)) return alert("تعليق غير مسموح");
    if(!allowLinks && containsLink(content)) return alert("ممنوع الروابط");

    if(!(await canComment(user.uid))) return alert("غير مسموح لك بالتعليق");

    lastCommentTime = now;

    const DataUser = await getUserDataByUID(user.uid);

    const commentRef = push(ref(db, `comments/${pageId}`));
    await set(commentRef, {
      content,
      parentId,
      pageId,
      userId: user.uid,
      userName: DataUser.name || "مستخدم",
      userAvatar: DataUser.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      likes: 0,
      likedBy: {},
      verified: false,
      time: now
    });

    commentInput.value = "";
}

// -----------------------
function canDelete(uid){
    const user = auth.currentUser;
    return user && user.uid === uid;
}

function buildTree(data){
    const map = {};
    Object.entries(data).forEach(([id, c])=>{
        c.id = id; c.children = []; map[id] = c;
    });

    const roots = [];
    Object.values(map).forEach(c=>{
        if(c.parentId && map[c.parentId]) map[c.parentId].children.push(c);
        else roots.push(c);
    });

    roots.sort((a,b)=>b.time - a.time);
    return roots;
}

// -----------------------
function toggleLike(id){
    const user = auth.currentUser;
    const key = `like_${pageId}_${id}`;
    const commentRef = ref(db, `comments/${pageId}/${id}`);

    if(user){
        runTransaction(commentRef, c=>{
            if(!c) return c;
            c.likedBy = c.likedBy || {};
            if(c.likedBy[user.uid]){
                c.likes--; delete c.likedBy[user.uid];
            } else {
                c.likes++; c.likedBy[user.uid]=true;
            }
            return c;
        });
    } else {
        if(localStorage.getItem(key)) return;
        runTransaction(ref(db, `comments/${pageId}/${id}/likes`), v=>(v||0)+1);
        localStorage.setItem(key, 1);
    }
}

// -----------------------
function renderComments(list, container, level=0){
    list.forEach(c=>{
        const div = document.createElement("div");
        div.className = "comment" + (level ? " reply" : "");

        div.innerHTML = `
            <div class="meta">${c.userName} • ${new Date(c.time).toLocaleString()}</div>
            <div>${c.content}</div>
            <div class="actions">
                <button class="like-btn" onclick="toggleLike('${c.id}')">
                    <img src="like.png" /> ${c.likes}
                </button>
                ${canDelete(c.userId) ? `<button onclick="deleteComment('${c.id}')">حذف</button>` : ""}
            </div>
        `;

        container.appendChild(div);

        if(c.children.length) renderComments(c.children, container, level+1);
    });
}

// -----------------------
export function LoadComments(PageID){
    pageId = PageID;
    const pageRef = ref(db, `comments/${pageId}`);
    onValue(pageRef, snapshot=>{
        commentsContainer.innerHTML = "";
        const data = snapshot.val()||{};
        const tree = buildTree(data);
        renderComments(tree, commentsContainer);
    });

    initFCM();
}