// ========================== IMPORTS ==========================
import { auth, db, bannedWords } from "./FirebaseConfig.js";
import { 
  ref, onValue, child, get, push, set, runTransaction 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ========================== GLOBAL VARIABLES ==========================
let storyId = "";        
let pageId = "";         
let lastCommentTime = 0; 
const cooldownMs = 15000; 
const allowLinks = false; 

// ========================== DOM ELEMENTS ==========================
const commentsContainer = document.getElementById("comments");
const noComments = document.getElementById("noComments");
const loadingIndicator = document.getElementById("loadingIndicator");
const loginWarn = document.getElementById("loginWarn");
const sendBtn = document.getElementById("sendBtn");
const commentInput = document.getElementById("commentInput");

// ========================== AUTH STATE ==========================
onAuthStateChanged(auth, user => {
  if (!loginWarn || !sendBtn) return;
  loginWarn.style.display = user ? "none" : "block";
  sendBtn.disabled = !user;
});

// ========================== UTILITY FUNCTIONS ==========================
function filterText(text) {
  bannedWords.forEach(w => {
    const reg = new RegExp(w, "gi");
    text = text.replace(reg, "***");
  });
  return text;
}

function containsLink(text) {
  return /(https?:\/\/|www\.)/.test(text);
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showAlert(msg, type = "error") {
  alert(msg);
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "الآن";
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "الآن";
  if (min < 60) return `قبل ${min} دقيقة`;
  if (hr < 24) return `قبل ${hr} ساعة`;
  if (day < 7) return `قبل ${day} يوم`;
  return new Date(timestamp).toLocaleDateString("ar-EG");
}

// ========================== USER DATA FUNCTIONS ==========================
async function getUserDataByUID(uid){
  const snap = await get(child(ref(db), `users/${uid}`));
  return snap.exists() ? snap.val() : {};
}

async function canComment(uid){
  const data = await getUserDataByUID(uid);
  return data.canComment ?? true;
}

// ========================== COMMENT ACTIONS ==========================
async function deleteComment(commentId) {
  const user = auth.currentUser;
  if (!user) return alert("يجب تسجيل الدخول");

  const snap = await get(ref(db, `comments/${pageId}/${commentId}/userId`));
  if (snap.val() !== user.uid) return alert("لا تملك صلاحية حذف هذا التعليق");

  if (confirm("هل تريد حذف هذا التعليق؟")) {
    await set(ref(db, `comments/${pageId}/${commentId}`), null);
  }
}

async function editComment(commentId) {
  const user = auth.currentUser;
  if (!user) return alert("يجب تسجيل الدخول");

  const snap = await get(ref(db, `comments/${pageId}/${commentId}`));
  const comment = snap.val();
  if (!comment || comment.userId !== user.uid) return alert("لا تملك صلاحية تعديل هذا التعليق");

  const newText = prompt("تعديل التعليق:", comment.content);
  if (newText && newText.trim() !== "") {
    await set(ref(db, `comments/${pageId}/${commentId}/content`), newText.trim());
  }
}

// ========================== LIKE FUNCTIONS ==========================
async function toggleLike(commentId) {
  const user = auth.currentUser;
  if (!user) return showAlert("يجب تسجيل الدخول للقيام بالإعجاب");

  const commentRef = ref(db, `comments/${pageId}/${commentId}`);
  await runTransaction(commentRef, c => {
    if (!c) return c;
    c.likedBy = c.likedBy || {};
    if (c.likedBy[user.uid]) {
      c.likes--;
      delete c.likedBy[user.uid];
    } else {
      c.likes++;
      c.likedBy[user.uid] = true;
    }
    return c;
  });
}

// ========================== ADD COMMENT ==========================
async function addComment(parentId = null) {
  const user = auth.currentUser;
  if (!user) return showAlert("يجب تسجيل الدخول أولاً");

  if (Date.now() - lastCommentTime < cooldownMs) {
    return showAlert("يرجى الانتظار قليلاً قبل التعليق مرة أخرى");
  }

  const allowed = await canComment(user.uid);
  if (!allowed) return showAlert("تم منعك من التعليق");

  let text = commentInput.value.trim();
  if (!text) return showAlert("لا يمكن إرسال تعليق فارغ");
  if (!allowLinks && containsLink(text)) return showAlert("الروابط غير مسموح بها");

  text = filterText(text);

  try {
    const commentsRef = ref(db, `comments/${storyId}`);
    const newCommentRef = push(commentsRef);
    const userData = await getUserDataByUID(user.uid);

    await set(newCommentRef, {
      content: text,
      userId: user.uid,
      verified: userData.verified || false,
      parentId: parentId,
      likes: 0,
      likedBy: {},
      time: Date.now()
    });

    commentInput.value = "";
    lastCommentTime = Date.now();
    showAlert("تم نشر التعليق بنجاح", "success");
  } catch (error) {
    console.error(error);
    showAlert("حدث خطأ أثناء إرسال التعليق");
  }
}

// ========================== LOAD & DISPLAY COMMENTS ==========================
export function loadAllComments(id) {
  if (!id) return;
  storyId = pageId = id;
  if (loadingIndicator) loadingIndicator.style.display = "block";

  const commentsRef = ref(db, `comments/${storyId}`);
  onValue(commentsRef, async snapshot => {
    const data = snapshot.val() || {};
    if (loadingIndicator) loadingIndicator.style.display = "none";
    if (Object.keys(data).length === 0) {
      if (noComments) noComments.style.display = "block";
      if (commentsContainer) commentsContainer.innerHTML = "";
      return;
    }
    if (noComments) noComments.style.display = "none";
    await displayComments(data);
  });
}

async function displayComments(commentsData) {
  if (!commentsContainer) return;
  commentsContainer.innerHTML = "";

  const commentsArray = Object.entries(commentsData).map(([id, c]) => ({ id, ...c }));
  commentsArray.sort((a, b) => b.time - a.time);

  for (const comment of commentsArray) {
    if (!comment.parentId) {
      const commentEl = await createCommentElement(comment, commentsData);
      commentsContainer.appendChild(commentEl);
    }
  }
}

// ========================== CREATE COMMENT ELEMENT ==========================
async function createCommentElement(comment, allComments) {
  const userdata = await getUserDataByUID(comment.userId);

  const div = document.createElement('div');
  div.className = 'comment-card';
  div.id = `comment-${comment.id}`;

  // Header
  const header = document.createElement('div');
  header.className = 'comment-header';

  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  avatar.src = userdata.photo || "default-avatar.png";
  avatar.alt = userdata.name || "User";

  const meta = document.createElement('div');
  meta.className = 'comment-meta';

  const name = document.createElement('span');
  name.className = 'user-name';
  name.textContent = userdata.name || "غير معروف";

  const verified = document.createElement('span');
  verified.className = 'verified';
  verified.textContent = userdata.verify ? '✔' : '';

  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = formatTimeAgo(comment.time);

  meta.append(name, verified, time);
  header.append(avatar, meta);

  // Content
  const content = document.createElement('div');
  content.className = 'comment-content';
  content.innerHTML = escapeHTML(comment.content);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'comment-actions';

  const likeBtn = document.createElement('button');
  likeBtn.className = 'like-btn';

  const heartImg = document.createElement('img');
  heartImg.className = 'like-icon';
  heartImg.src = '../img/LikeDisable.png';

  const likeCount = document.createElement('span');
  likeCount.className = 'like-count';
  likeCount.textContent = comment.likes || 0;

  likeBtn.append(heartImg, likeCount);
  actions.append(likeBtn);

  // التحديث الفوري لكل تعليق
  const commentRef = ref(db, `comments/${pageId}/${comment.id}`);
  onValue(commentRef, snapshot => {
    const data = snapshot.val() || {};
    const liked = data.likedBy?.[auth.currentUser?.uid];
    heartImg.src = liked ? '../img/LikeEnable.png' : '../img/LikeDisable.png';
    likeCount.textContent = data.likes ?? 0;
  });

  likeBtn.addEventListener('click', () => toggleLike(comment.id));

  // أزرار أخرى
  const replyBtn = document.createElement('button');
  replyBtn.className = 'reply-btn';
  replyBtn.textContent = 'رد';
  replyBtn.addEventListener('click', () => replyComment(comment.id));

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = 'تعديل';
  editBtn.addEventListener('click', () => editComment(comment.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'حذف';
  deleteBtn.addEventListener('click', () => deleteComment(comment.id));

  actions.append(replyBtn, editBtn, deleteBtn);

  // Replies
  const repliesDiv = document.createElement('div');
  repliesDiv.className = 'replies';
  const replies = Object.values(allComments)
    .filter(c => c.parentId === comment.id)
    .sort((a,b)=>a.time-b.time);

  for (const reply of replies) {
    const replyEl = await createCommentElement(reply, allComments);
    replyEl.classList.add('reply-card');
    repliesDiv.appendChild(replyEl);
  }

  div.append(header, content, actions, repliesDiv);
  return div;
}

// ========================== REPLY ==========================
function replyComment(parentId) {
  commentInput.focus();
  commentInput.dataset.replyTo = parentId;
}

// ========================== SEND BUTTON ==========================
if (sendBtn) {
  sendBtn.addEventListener("click", () => {
    const parentId = commentInput.dataset.replyTo || null;
    addComment(parentId);
    delete commentInput.dataset.replyTo;
  });
}