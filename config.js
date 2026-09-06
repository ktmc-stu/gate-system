/* ==========================================================
   config.js — 由 Firebase Console 複製設定貼入下面
   Firebase Console → Project Settings → Your apps → SDK setup
   ========================================================== */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKAuHlhH-bLbY9dzO0a2bIqHEYIPrZt90",
  authDomain: "ktmc-gate-system.firebaseapp.com",
  databaseURL: "https://ktmc-gate-system-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ktmc-gate-system",
  storageBucket: "ktmc-gate-system.firebasestorage.app",
  messagingSenderId: "693237112593",
  appId: "1:693237112593:web:caa8867e73186e3a5cf6b0",
  measurementId: "G-M6D104RPS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
/* 共用職員登入帳號（喺 Firebase → Authentication 開設，
   密碼就係所有頁面通用的密碼） */
const STAFF_EMAIL = "gate@ktmc.edu.hk";
