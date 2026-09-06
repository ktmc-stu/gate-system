# Gate Pass System 陸運會／水運會 封閉區進出記錄系統

## 設定步驟
1. **Firebase Console**（console.firebase.google.com）→ Add Project
2. **Authentication → Sign-in method**：開啟 Email/Password，新增一個職員帳號
   （例如 `gate@school.edu.hk`），密碼即全系統通用密碼。建議關閉自行註冊。
3. **Realtime Database → Create Database**
4. **Rules 分頁**：貼上 `rules.json` → Publish
5. **Project Settings → Your apps → Web app**：複製設定貼入 `config.js`，修改 `STAFF_EMAIL`
6. 全部檔案上傳 GitHub repo → Settings → Pages → Deploy from branch (main)
7. 等 1–2 分鐘，到 `https://<user>.github.io/<repo>/`

## 活動當日流程
1. 開場前：`admin.html` → Settings → 揀場景（Sports Day 陸運會／Swimming Gala 水運會）→ Save，
   再按「開始活動」（清除殘留外出狀態，全部學生視為在內）。多日活動每日早上按一次。
2. 閘口裝置開 `gate.html`（登入一次後長期有效）：
   - 出口裝置設「OUT Only 只登記外出」，入口裝置設「IN Only 只登記返回」；只有一部機用「雙模式」
   - 場景名稱由 Admin 統一派發，所有裝置即時同步
   - 拍卡機（USB 鍵盤模式）插任何閘口裝置即可；iPad 需 USB 轉接器，建議開 Guided Access
3. 老師用 `enquiry.html` 查詢邊個喺外面、去咗幾耐。
4. 收場後：`admin.html` → Records → 揀日期 → 匯出記錄（每行有「活動」欄）／匯出統計。

## 安全須知
- 未登入嘅人完全讀寫唔到資料庫（規則 `auth != null`）
- 系統只存卡號／學號／班別／學號／社，唔存姓名
- 定期喺 Firebase Console 更換通用密碼
