# Wsrna（多言語クローズ問題復習アプリ）

## プロジェクトの概要

Wsrna は、OpenAI と Supabase を活用した「多言語クローズ問題生成＆復習」アプリです。ユーザーは任意のトピック・言語ペアでクローズ問題を自動生成し、保存・復習（忘却曲線ベース）・進捗管理ができます。PWA 対応・スマホ UI 固定。

---

## プロジェクトの技術スタック

- Next.js (App Router, TypeScript)
- SCSS（BEM 記法・共通化重視）
- Supabase（認証・DB・API）
- OpenAI API（GPT-4o）
- PWA 対応
- モバイルファースト UI（PC でもスマホフレーム固定）

---

## プロジェクトのディレクトリ構成

```
wsrna/
├── src/
│   ├── app/           # Next.js App Routerページ
│   ├── components/    # 再利用可能なReactコンポーネント
│   ├── lib/           # Supabase/OpenAIクライアント等
│   ├── prompts/       # OpenAIプロンプトテンプレート
│   └── styles/        # SCSS（BEM設計・共通化）
├── public/            # 静的ファイル・PWAアイコン
├── .env.local         # 環境変数（Supabase, OpenAIキー等）
├── README.md
└── ...
```

---

## プロジェクトの実行方法

1. **リポジトリをクローン**
   ```sh
   git clone <このリポジトリのURL>
   cd wsrna
   ```
2. **依存パッケージをインストール**
   ```sh
   pnpm install
   # または npm install / yarn install
   ```
3. **環境変数を設定**
   `.env.local` を作成し、以下を記入
   ```env
   NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase anonキー
   OPENAI_API_KEY=あなたのOpenAI APIキー
   ```
4. **開発サーバーを起動**
   ```sh
   pnpm dev
   # または npm run dev / yarn dev
   ```
   ブラウザで http://localhost:3000 を開く

---

## プロジェクトの開発環境

- Node.js 18 以上推奨
- pnpm（推奨）/npm/yarn
- Supabase プロジェクト（無料枠で OK）
- OpenAI API キー（gpt-4o 推奨）

---

## サーバーの起動方法

```sh
pnpm dev
# または npm run dev / yarn dev
```

---

## データベースのマイグレーション方法

1. Supabase 管理画面（https://app.supabase.com/）でプロジェクトを作成
2. SQL Editor で下記テーブルを作成

---

## データベースのテーブル構造

### quizzes（問題本体）

| カラム名             | 型        | 説明                    |
| -------------------- | --------- | ----------------------- |
| id                   | uuid      | 主キー（自動生成）      |
| user_id              | uuid      | ユーザー ID（外部キー） |
| topic                | text      | トピック                |
| level                | text      | 難易度                  |
| question             | text      | 問題文                  |
| answer               | text      | 正解                    |
| sentence_translation | text      | 文全体訳                |
| dictionary           | jsonb     | 辞書オブジェクト        |
| hint_levels          | jsonb     | 4 段階ヒント配列        |
| created_at           | timestamp | 作成日時（自動）        |

### quiz_reviews（復習進捗・スケジューラ）

| カラム名         | 型        | 説明                    |
| ---------------- | --------- | ----------------------- |
| id               | uuid      | 主キー                  |
| user_id          | uuid      | ユーザー ID（外部キー） |
| quiz_id          | uuid      | クイズ ID（外部キー）   |
| last_reviewed_at | timestamp | 最終復習日時            |
| next_review_at   | date      | 次回復習日              |
| interval_days    | int       | 現在の間隔（日数）      |
| correct_streak   | int       | 連続正解数              |
| created_at       | timestamp | 作成日時                |

---

## データベースのデータ投入方法

- クイズ生成・保存・復習は全てアプリ UI から操作可能
- 必要に応じて Supabase 管理画面や SQL Editor で直接データ投入・編集も可能

---

## その他

- PWA 対応：スマホホーム画面追加可
- PC でもスマホ UI を中央固定フレームで再現
- SCSS は BEM 記法・共通化重視
- 問題・進捗・復習サイクルは全て Supabase で一元管理

---

ご不明点・質問は開発メンバーまで！
