# Gate Pass System 校園進出記錄系統

## 設定步驟
1. **Firebase Console**（console.firebase.google.com）→ Add Project
2. **Build → Authentication → Sign-in method**：開啟 Email/Password，
   在 Users 新增一個帳號（例如 `gate@school.edu.hk`），密碼即全系統通用密碼。
   （建議同時喺 Settings 關閉「允許自行註冊」，只保留呢個帳號。）
3. **Build → Realtime Database → Create Database**（選 region，鎖定模式起步无所谓，因為我會用規則）
4. **Rules 分頁**：貼上 `rules.json` 內容 → Publish
5. **Project Settings → Your apps → Web app**：複製 config，貼入 `config.js`，
   並修改 `STAFF_EMAIL` 為你第 2 步的帳號。
6. 全部檔案上傳到 GitHub repo → Settings → Pages → Deploy from branch (main)
7. 等 1–2 分鐘，到 `https://<user>.github.io/<repo>/` 即可。

## 各裝置使用
- 每個閘口裝置開 `gate.html`，登入一次後長期有效；按右上角 ⚙ 設定閘口名稱與模式
  （雙模式＝一部機拍卡後揀出/入；只出／只入＝一個閘口兩部機時用）。
- 拍卡機（USB 鍵盤模式）插任何一部閘口裝置即可，系統輸入框常態化，隨時拍卡都收到。
- iPad 建議開「引導使用模式 Guided Access」鎖定喺 gate.html。
- 管理員用 `admin.html` 匯入學生（欄目次序：卡號、學生編號、班別、學號、社；可下載範本）。
- 老師用 `enquiry.html` 查詢。

## 安全須知
- 未登入（無通用密碼）的人完全讀寫唔到資料庫（規則 `auth != null`）。
- 系統只存卡號／學號／班別／學號／社，唔存姓名。
- 請定期喺 Firebase Console 更換密碼（改完後各裝置重新登入一次）。
