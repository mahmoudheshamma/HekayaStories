import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
  import { getDatabase, ref, push, set, onValue, runTransaction, child, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
  import { isSupported, getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging.js";

const firebaseConfig = {

  apiKey: "AIzaSyAwYs3xZW84Yy0Z2_DXk8FLUBJtShDQUoA",
  authDomain: "story-1cfce.firebaseapp.com",
  databaseURL: "https://story-1cfce-default-rtdb.firebaseio.com",
  projectId: "story-1cfce",
  storageBucket: "story-1cfce.firebasestorage.app",
  messagingSenderId: "982243872156",
  appId: "1:982243872156:web:203a1901a90ee8af998c59",
  measurementId: "G-M19HVL0RZ2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const database = getDatabase(app);

export const bannedWords = [];

export let messaging = null;

isSupported().then(supported => {
    if (supported) {
        const messaging = getMessaging(app);

        onMessage(messaging, (payload) => {
            alert(payload.notification.title + "\n" + payload.notification.body);
        });
    } else {
        // console.warn("Messaging not supported on this browser");
    }
});