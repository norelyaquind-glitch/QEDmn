// Shared Firebase setup — imported by login.html, signup.html, and lessons.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA2ttydS481m81JlOqdbC2VhhEiYPfkhb4",
    authDomain: "my-lessons-site.firebaseapp.com",
    projectId: "my-lessons-site",
    storageBucket: "my-lessons-site.firebasestorage.app",
    messagingSenderId: "340678416529",
    appId: "1:340678416529:web:422efcf4852399ac348730",
    measurementId: "G-WYEFF6EZL8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);