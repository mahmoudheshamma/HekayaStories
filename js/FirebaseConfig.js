import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAwYs3xZW84Yy0Z2_DXk8FLUBJtShDQUoA",
    authDomain: "story-1cfce.firebaseapp.com",
    databaseURL: "https://story-1cfce-default-rtdb.firebaseio.com",
    projectId: "story-1cfce",
    storageBucket: "story-1cfce.appspot.com",
    messagingSenderId: "982243872156",
    appId: "1:982243872156:web:203a1901a90ee8af998c59"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);