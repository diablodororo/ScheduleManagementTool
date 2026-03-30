# 工作排程系統（甘特圖）

基於 Vite + React + TypeScript + Tailwind CSS 的甘特圖工作排程系統。

## 專案結構

```
ScheduleManagementTool/
├── index.html                  # Vite 入口 HTML
├── package.json                # 依賴與腳本
├── vite.config.ts              # Vite 設定（含 GitHub Pages base path）
├── tsconfig.json               # TypeScript 設定
├── tailwind.config.js          # Tailwind CSS 設定
├── postcss.config.js           # PostCSS 設定
├── .gitignore
├── src/
│   ├── main.tsx                # React 入口
│   ├── App.tsx                 # 主應用元件（狀態管理、事件處理）
│   ├── index.css               # 全域樣式（Tailwind + 自訂 CSS）
│   ├── types.ts                # TypeScript 型別定義
│   ├── constants.ts            # 常數與初始資料
│   ├── vite-env.d.ts           # Vite 環境型別
│   ├── components/
│   │   ├── Toolbar.tsx         # 頂部工具列（今天按鈕、視圖切換）
│   │   ├── HorizontalView.tsx  # 橫式甘特圖視圖
│   │   ├── VerticalView.tsx    # 直式甘特圖視圖
│   │   ├── TaskPool.tsx        # 底部待分配任務池
│   │   ├── AddTaskModal.tsx    # 新增工作 Modal
│   │   ├── EditTaskModal.tsx   # 編輯工作 Modal
│   │   └── ColorPicker.tsx     # 顏色選擇器元件
│   ├── hooks/
│   │   └── useResize.ts        # 拖曳縮放 Hook
│   └── utils/
│       ├── date.ts             # 日期工具函數
│       └── lanes.ts            # 泳道演算法（任務排列避免重疊）
└── dist/                       # build 輸出目錄
```

## 指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（預設 http://localhost:5173）
npm run dev

# 產出生產版本
npm run build

# 本機預覽生產版本
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

## Build 輸出位置

生產版本輸出至 `dist/` 目錄。

## GitHub Pages 部署方式

### 前置設定

1. `vite.config.ts` 中的 `base` 已設為 `'/ScheduleManagementTool/'`，請確認與你的 GitHub repo 名稱一致。若 repo 名稱不同，請修改此值。

2. `package.json` 已包含 `gh-pages` 套件及部署腳本。

### 部署步驟

```bash
# 1. 確保所有變更已提交
git add .
git commit -m "feat: 重構為 React + Vite 專案"

# 2. 推送到 GitHub
git remote add origin https://github.com/<你的帳號>/ScheduleManagementTool.git
git push -u origin main

# 3. 一鍵部署（自動 build + 發布到 gh-pages 分支）
npm run deploy
```

### GitHub 設定

部署後到 GitHub repo → **Settings** → **Pages**：
- Source 選擇 **Deploy from a branch**
- Branch 選擇 **gh-pages** / **(root)**
- 儲存後即可在 `https://<你的帳號>.github.io/ScheduleManagementTool/` 存取

## 功能

- 橫式 / 直式雙視圖切換
- 拖放任務分配至同仁與日期
- 拖曳邊緣調整任務起訖日
- 待分配任務池
- 新增 / 編輯 / 刪除 / 複製任務
- 截止日期標記
- 無限捲動自動延伸時間軸
- 今日標記線
