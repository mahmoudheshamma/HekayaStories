import { database, auth, messaging} from "./FirebaseConfig.js";

let pageId = "";
let writerId = "";

const UID =  auth.currentUser ? auth.currentUser.uid : null;

auth.onAuthStateChanged(user => {

// التحقق اذا تم تسجيل الدخول من قبل مستخدم
    document.getElementById("loginWarn").style.display = user ? "none":"block";
    document.getElementById("btnComment").style.display = user ? "block" : "none";
    
});

async function canComment() {
    
    const snap = getUserDataByUID(UID);
    return snap.canComment;
}

async function AddComment(parentId=null,text=null) {
    
    const user = auth.currentUser;
    
    if (!user) {
    // not signed
        return;
        
    }
    
    const DataUser = getUserDataByUID(UID);
    
    if (!(await canComment(user.uid))) {
        // can't comment
        return;
    }
    
    const content = text || commentInput.value.trim();
    
    if(!content) {
        // comment empty
        return;
    }
    
    const ref = db.ref(`comments/${pageId}`).push();
    
    await ref.set({
        content,
        parentId,
        pageId,
        userId:user.uid,
        userName:DataUser.name || "مستخدم",
        userAvatar:DataUser.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        likes:0,
        likedBy:{},
        verified:false,
        time:Date.now()
    });

    commentInput.value="";
}