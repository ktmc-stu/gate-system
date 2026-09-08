/* config.js */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBKAuHlhH-bLbY9dzO0a2bIqHEYIPrZt90",
  authDomain: "ktmc-gate-system.firebaseapp.com",
  databaseURL: "https://ktmc-gate-system-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ktmc-gate-system",
  storageBucket: "ktmc-gate-system.firebasestorage.app",
  messagingSenderId: "693237112593",
  appId: "1:693237112593:web:caa8867e73186e3a5cf6b0"
};

/* 職員帳號：index / admin / enquiry 進入密碼＋gate 內設定鎖／手動返回驗證 */
const STAFF_EMAIL = "你而家用緊嘅職員電郵";

/* 新增：gate 專用自動登入帳號（Firebase Auth → Users → Add user 建立） */
const KIOSK_EMAIL = "kiosk@ktmc.edu.hk";
const KIOSK_PASSWORD = "設一個kiosk專用密碼";
