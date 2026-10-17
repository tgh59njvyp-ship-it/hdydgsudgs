# Pinterest ボード画像一括ダウンローダー (Pinterest Board Image Batch Downloader)

PinterestのボードURLを入力すると、ボード内の全画像（オリジナル・最高解像度）を取得し、連番付きZIPファイルとして一括保存できるWebアプリケーションです。

---

## 🚀 主な機能

1. **Pinterest ボードURL入力 & 自動検証**
   - 日本版 (`https://www.pinterest.jp/ユーザー名/ボード名/`) および 国際版 (`https://www.pinterest.com/username/board-name/`) のボードURLに対応。
   - 不正なURL形式や個別ピンURLの入力を自動検知し、日本語で分かりやすいエラーメッセージを表示。
   - ワンクリックでお試しできるサンプルボードを搭載。

2. **ボード情報の自動解析 & 画像抽出**
   - サーバーサイドAPI（`/api/pinterest/board`）でユーザー名とボード名を安全に解析。
   - **Pinterest API v5** によるピン一覧取得とページネーション（Bookmark）に対応。
   - 公開RSSフィードおよびWebページ自動解析によるフォールバック機構を搭載（トークン未設定でも利用可能）。
   - サムネイルではなく、原寸無圧縮の最高解像度（`originals` / `1200x`）URLを自動検出・取得。
   - 画像が取得できないピンのスキップ件数表示。
   - 取得上限（最大500件）対応と警告メッセージ。

3. **画像グリッドプレビュー & 選択操作**
   - レスポンシブなグリッドレイアウト（モバイル2列〜デスクトップ6列）。
   - 各画像のチェックボックスによる個別選択。
   - 「全選択」/「全解除」ボタンと、リアルタイムの選択件数カウント。
   - 連番インデックスバッジ（`#001`, `#002`...）および解像度表示。
   - クリックによる拡大ライトボックス表示（左右キーボード送り、個別ダウンロード対応）。

4. **高速並列ダウンロード & JSZipによるZIP一括生成**
   - **JSZip** によるブラウザインメモリZIP圧縮。
   - ZIPファイル名: `{board-name}_{YYYY-MM-DD}.zip`（例: `japan-travel_2026-10-16.zip`）。
   - ZIP内のファイル名: 連番付き（`001.jpg`, `002.png`, `003.webp` など、MIMEタイプと拡張子を自動識別）。
   - 同一URLの重複画像は自動除外。
   - リアルタイム進捗モーダル（取得件数/全件数、パーセンテージ、処理中ファイル名を表示）。
   - 耐障害性: 一部の画像が通信エラーになっても停止せず、スキップして残りをZIP化し、完了時に失敗件数を表示。

5. **セキュリティ & レートリミット対策 (非機能要件)**
   - **SSRF (Server-Side Request Forgery) 対策**: 画像プロキシAPI（`/api/proxy-image`）にて、`i.pinimg.com` や Pinterest公式ドメインに厳格制限。ローカルIPやプライベートネットワーク（`127.0.0.1`, `192.168.*`, `10.*` など）へのアクセスを完全遮断。
   - **CORS回避**: サーバー経由でバイナリ取得するため、ブラウザのCORS制限を受けません。
   - **同時実行数制御**: 並列ワーカープールにより、同時リクエスト数をデフォルト5件に制限（3〜10件で設定変更可能）。

6. **洗練されたUI/UX**
   - ダークモード / ライトモードのワンクリック切り替え（ローカルストレージに設定永続化）。
   - モバイル・タブレット・デスクトップ完全対応のレスポンシブデザイン。
   - 完全日本語UI。

---

## 🛠 技術スタック

- **フロントエンド**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **ZIP生成**: JSZip
- **バックエンド**: Node.js, Express, tsx
- **ビルドツール**: Vite

---

## 📁 ディレクトリ構成

```text
├── .env.example                  # 環境変数テンプレート (PINTEREST_ACCESS_TOKEN等)
├── index.html                    # HTMLエントリーポイント
├── metadata.json                 # AI Studio メタデータ設定
├── package.json                  # パッケージ設定 & スクリプト
├── server.ts                     # Express サーバー (APIルート + 画像プロキシ + SSRF対策 + Vite)
├── tsconfig.json                 # TypeScript 設定
├── vite.config.ts                # Vite & Tailwind CSS 設定
└── src/
    ├── App.tsx                   # メインアプリケーションコンポーネント
    ├── main.tsx                  # React エントリーポイント
    ├── index.css                 # グローバルスタイル (Tailwind CSS)
    ├── types/
    │   └── index.ts              # 型定義 (PinterestPin, BoardInfo, DownloadProgress等)
    ├── utils/
    │   ├── pinterest-url.ts      # URL検証、解像度置換、連番名生成、重複排除ユーティリティ
    │   ├── pinterest-url.test.ts # Node 22 native test runner による単体テスト
    │   └── zip-downloader.ts     # 並列ダウンロード & JSZip 圧縮エンジン
    └── components/
        ├── Header.tsx            # ブランドヘッダー、テーマ切替、設定ボタン
        ├── UrlInputForm.tsx      # URL入力欄、エラー表示、サンプルチップ
        ├── BoardHeader.tsx       # ボード情報、全選択/解除、ZIP保存ボタン
        ├── ImageGrid.tsx         # 画像グリッドサムネイル & チェックボックス
        ├── ImageModal.tsx        # 拡大ライトボックスモーダル
        ├── DownloadProgressModal.tsx # ZIPダウンロード進捗バーモーダル
        ├── ApiTokenModal.tsx     # Pinterest API 連携手順モーダル
        ├── SettingsModal.tsx     # 並列数・上限件数・画質設定モーダル
        └── EmptyState.tsx        # 初回ガイダンス・機能紹介
```

---

## 🔑 Pinterest Developer App の作成とトークン取得手順

本アプリはトークン未設定でも公開フィード・Web解析・サンプル機能で動作しますが、**プライベートボードの取得や500件の大規模一括取得**を行う場合は、以下の手順で公式APIトークンを設定できます。

### ステップ 1: Pinterest 開発者ポータルにアクセス
1. [Pinterest Developers](https://developers.pinterest.com/) にアクセスします。
2. Pinterest ビジネスアカウントでログインします（通常アカウントの場合は無料でビジネスアカウントに切り替え可能です）。

### ステップ 2: アプリケーションの作成
1. 右上のアカウントメニューまたはダッシュボードから「**My Apps**」を選択します。
2. 「**Create App**」をクリックします。
3. アプリ名（例: `My Pinterest Downloader`）と概要を入力し、作成を完了します。

### ステップ 3: 権限スコープ（Scope）の設定
アプリの設定画面で、以下のスコープを有効化します:
- `boards:read` (ボード情報の読み取り)
- `pins:read` (ピンおよび画像URLの読み取り)

### ステップ 4: アクセストークンの発行
1. 「**Generate access token**」または OAuth 設定より、開発用アクセストークン（`pina_...` で始まる文字列）を生成・コピーします。

### ステップ 5: 環境変数への設定
プロジェクトルートに `.env` ファイルを作成（または `.env.example` をコピー）し、以下のように記載します:

```bash
PINTEREST_ACCESS_TOKEN="pina_your_access_token_here"
```

サーバーを起動すると、自動的に Pinterest API v5 経由で確実・高速に全件取得が行われます。

---

## 💻 セットアップと起動手順

### 1. 依存パッケージのインストール
```bash
npm install
```

### 2. 単体テストの実行
Node.js 組み込みのテストランナーを使用して、URLバリデーションや連番生成ロジックのテストを実行します:
```bash
node --test src/utils/pinterest-url.test.ts
```

### 3. 開発サーバーの起動
```bash
npm run dev
```
起動後、ブラウザで `http://localhost:3000` にアクセスしてください。

### 4. 本番ビルドと実行
```bash
npm run build
npm start
```
