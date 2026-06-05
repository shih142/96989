# 🌍 GAIA-CORE 雲端部屬指南 (Cloud Deployment Guide)

本專案是一個採用 **React (Vite) + Express (Node.js)** 的全端（Full-Stack）架構，並已整合了 Gemini / Ollama 模型。
為了將網站上傳並部屬至其他雲端平台，您可以使用我們為您建立的 `Dockerfile` 配置。以下是各大熱門平台的部屬教學：

---

## 🛠️ 第一步：匯出專案代碼

您需要先將目前 AI Studio 的代碼下載為 ZIP 檔案或同步至 GitHub：
1. 在 AI Studio 開發介面右上角，點選 **齒輪 / 設定 (Settings) ⚙️**
2. 點選 **「匯出為 ZIP (Export as ZIP)」**，或選擇 **「同步至 GitHub 儲存庫 (Export to GitHub)」**。
3. 如果是下載為 ZIP，請解壓縮並上傳至您自己的 GitHub 帳號下建立的公開/私有專案儲存庫（Repository）中。

---

## 🚀 平台一：Render (最推薦的免費/便宜託管)

Render 可以直接偵測 `Dockerfile` 或 Node.js 專案並進行自動雲端部屬，非常友善。

### 步驟：
1. 註冊並登入 [Render](https://render.com/)。
2. 進入 Dashboard，點選 **「New」** -> **「Web Service」**。
3. 連結您的 GitHub 帳號並選取您的專案儲存庫。
4. 設定部屬細節：
   * **Language**: 選擇 **`Docker`** (Render 會自動使用專案中的 `Dockerfile` 進行最高效的容器編譯，避免 Node 版本衝突)。
   * **Region**: 建議選擇靠近您的區域（例如新加坡 `singapore` 或是俄勒岡 `oregon`）。
5. 展開「Advanced」設定環境變數（Environment Variables）：
   * `GEMINI_API_KEY` = `[您的 Google Gemini API 金鑰]`
6. 點選 **「Create Web Service」**。
7. Render 將自動開始拉取代碼、編譯、運行，完成後會提供您一個專屬的網址（例如 `https://your-app.onrender.com`）。

---

## 🚀 平台二：Railway (最快、最無腦的部屬體驗)

Railway 不需要任何設定，只要連上 GitHub，它就會自動讀取 `Dockerfile` 並快速完成部署。

### 步驟：
1. 註冊並登入 [Railway](https://railway.app/)。
2. 點選右上角的 **「New Project」**。
3. 選擇 **「Deploy from GitHub repo」**，並授予存取您該專案儲存庫的權限。
4. 點選 **「Deploy Now」**。
5. 進入專案頁面後，點選該服務的 **「Variables」** 分頁，填入環境變數：
   * `GEMINI_API_KEY` = `[您的 Google Gemini API 金鑰]`
6. 進入 **「Settings」** 分頁，在 **Networking** 下方點選 **「Generate Domain」** 來為服務生成一個公開網址。
7. 部屬完成後，即可直接透過該網址訪問！

---

## 🚀 平台三：Google Cloud Run (最安全、高效能的企業級託管)

因為本應用程式原生在 Google Cloud 生態（與 AI Studio 精準契合），使用 Google Cloud Run 可以享受到極高的連線速度與「沒人造訪時自動縮減到 0 個容器」的完全免費方案（Scale-to-zero）。

### 使用 Google Cloud SDK (gcloud) 快速部署：
若您在本地端已安裝好 `gcloud` CLI，只需要在專案根目錄下輸入單行指令即可完成容器化與部署：

```bash
gcloud run deploy gaia-monitor-app \
  --source . \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="GEMINI_API_KEY=您的金鑰"
```

部屬完畢後，終端機將會直接顯示一個安全的 `https://...` 開頭之 Cloud Run 運行網址。

---

## 🚀 平台四：Fly.io (開發者超喜愛的全球分散式部署)

Fly.io 擁有極低延遲的優勢，使用專屬的命令列工具（CLI）十分鐘即可上雲。

### 步驟：
1. 安裝 Fly.io 命令行工具：
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 | iex
   # macOS / Linux
   curl -L https://fly.io/install.sh | sh
   ```
2. 在專案根目錄執行初始化設定：
   ```bash
   fly launch
   ```
   * 工具會偵測到您的 `Dockerfile`
   * 輸入您的 App 名稱、選擇偏好的部署區域。
   * 會生成 `fly.toml` 配置檔。
3. 設定安全金鑰/環境變數：
   ```bash
   fly secrets set GEMINI_API_KEY=你的GeminiKey
   ```
4. 執行部署上雲：
   ```bash
   fly deploy
   ```

完成後，您可以透過 `fly open` 隨時在新視窗中瀏覽您的網站！
