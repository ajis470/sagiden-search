# sagiden-search.com 引き継ぎメモ

---

## 運用メモ

### 口コミの削除
1. 削除したいコメントのIDを確認する
   - `https://www.sagiden-search.com/tel/[番号]?admin=ID` を開くと各コメントに `#ID` が表示される
2. ClaudeCodeに「#XXXを削除して」と伝える
   - ClaudeがKAGOYAのAPIエンドポイント（`api_comment_delete.php`）をcurlで叩いて削除する

### 口コミの承認スキーム
- 投稿時にVercel上でGemini Flash-Liteが審査し、`published`/`pending`を自動判定
- `published`は即時表示。`pending`は「この口コミは審査中です」と表示（本文は非表示）
- レートリミット（クッキーベース）：1分に1回・1日10件まで。超過時はGeminiを呼ばずに弾く
- バリデーション順序：文字数チェック（5〜1000文字）→ レートリミット → Gemini審査
- `pending`コメントのDBへの保存は維持される（荒らし大量発生時はClaudeに一括削除を依頼）

---

> 作成日: 2026-05-06

---

## プロジェクト概要

- **サービス名:** みんなの迷惑電話番号データベース
- **ドメイン:** sagiden-search.com
- **コンセプト:** concept.md 参照

---

## 技術スタック（確定）

| レイヤー | 技術 |
|---|---|
| Frontend / Backend | Next.js（このフォルダ） |
| DB / API | KAGOYA MySQL + PHP |
| AI Engine | Gemini 2.5 Flash-Lite |
| Infrastructure | Vercel（既存Proプラン） |

### KAGOYAのPHP API構成について
- 既存サイト（av-act-name-site / womens-av）と同じパターン
- VercelのNext.jsからKAGOYAのPHPスクリプトをfetchで叩く
- PHPスクリプトの置き場: `api.sagiden-search.com`（KAGOYAサブドメイン）
- 参考実装: `C:\dev\av-act-name-site\src\lib\dmm.ts`

---

## DNS設定状況

| 設定場所 | 内容 | 状態 |
|---|---|---|
| お名前.com | ネームサーバーをVercelに変更済み | ✅ 完了 |
| Vercel DNS管理 | `api` Aレコード → `133.18.34.28`（KAGOYAウェブサーバー） | ✅ 完了 |
| KAGOYA管理画面 | サブドメイン `api.sagiden-search.com` 追加（ディレクトリ: `/public_html/sagiden-search`） | ✅ 完了 |
| KAGOYA管理画面 | Let's Encrypt SSL発行申請 | ✅ 完了（2026-05-09） |
| Vercel | sagiden-search.comをプロジェクトに紐づけ | ✅ 完了 |

### IPアドレスに関する注意（重要）
- KAGOYAのウェブサーバーIP: **`133.18.34.28`**
- `210.134.60.132` はKAGOYAのネームサーバー（ns0.kagoya.net）のIPであり、ウェブサーバーではない
- ウェブサーバーIPはKAGOYA管理画面に明示されていないため、同じアカウントで動いている既存ドメインのIPを `Resolve-DnsName` で調べること
  ```
  Resolve-DnsName it-tech-jp.net → 133.18.34.28
  ```

### DNS設定完了後の次のアクション

---

## 設計方針（確定）

### DBテーブル構成（4テーブル）✅ 作成済み（2026-05-10）
- `sagiden_phone_numbers`：電話番号マスタ。danger_rank(C/B/A/S/SS/SSS)、comment_count、search_count_24h等
- `sagiden_comments`：ユーザー投稿＋スクレーピングコメント。status(published/pending)、source(user/scraped)
- `sagiden_ai_summaries`：AI生成の要約・推奨アクション・危険度判定。1番号1レコード
- `sagiden_search_logs`：炎上中判定用の検索ログ
- DB名：`ajis470kagoya_sagiden`（KAGOYA共用サーバー）
- DDL：`db/schema.sql`

### 電話番号ページのSEO方針
- **全番号の事前生成はしない**（空ページ大量生成はGoogleの薄いコンテンツ判定でドメイン評価を下げる）
- **スクレーピングで初期データのある番号だけをページ化してsitemapに提出**
- **未知の番号は初回アクセス時にphone_numbersレコードをINSERTしてページ生成**（sitemapには入れない）
- ページ生成時にGoogle Search Console APIで即時インデックス申請を投げる
- 制約として「未知の詐欺番号への最初の口コミ投稿者を捕まえにくい」問題は構造的に残る。サイトの知名度向上で緩和する方針

### 初期SEO戦略
1. スクレーピングで既知の人気番号のコンテンツを揃える → Google上位を取る
2. サイトの存在を認知させる
3. 未知の番号への投稿が自然に増える

---

## 次のアクション（実装）

- [x] VercelにGitHubリポジトリを連携してプロジェクト作成・ドメイン紐づけ
- [x] SSL（api.sagiden-search.com Let's Encrypt）✅ 2026-05-09
- [x] KAGOYAのDBテーブル作成（ajis470kagoya_sagiden）✅ 2026-05-10
- [x] KAGOYAにPHP APIスクリプト作成・稼働確認 ✅ 2026-05-10
  - `api_phone.php`：番号検索・初回INSERT・search_logs記録
  - `api_comment.php`：コメント投稿
  - `api_trending.php`：炎上中一覧
  - 配置先：`/public_html/sagiden-search/`
  - 動作確認URL：`https://api.sagiden-search.com/api_phone.php?number=0120000000` → JSON返却OK
- [x] スクレーピング対象サイトの選定・HTML構造確認 ✅ 2026-05-10
  - **jpnumber.com のみ採用**（週間アクセス数・口コミ数ランキング TOP10×2 = 最大20番号）
  - telnavi.jpはランキングページなし。同番号の追加取得用途としては可能だが今は見送り
  - スクレーパー: `scraper/scrape_jpnumber.js`（Playwright + Node.js、週1ローカル実行）
  - 動作確認済み：12番号・約2,700件取得成功
- [x] AIによる口コミ要約パイプライン実装 ✅ 2026-05-10
  - モデル: `gemini-2.5-flash`
  - エンドポイント: `api_pending.php`（要約待ち番号取得）、`api_summary.php`（要約保存）
  - スクリプト: `scraper/summarize.js`
  - 動作確認済み: 12番号の要約・危険度判定を正常生成
- [x] Windowsタスクスケジューラ登録 ✅ 2026-05-10
  - タスク名: sagiden-scraper
  - スケジュール: 毎週月曜日 06:00
  - 実行: `scraper/run.bat`（スクレーピング→AI要約を連続実行）
  - ログ: `scraper/scraper.log`
- [x] Next.jsの画面実装
- [ ] **次回作業：Google Indexing API実装**
  - 新規ページ生成時にGoogleへ即時インデックス申請を投げる
  - 必要な準備：Google Cloud Consoleでサービスアカウント作成 → JSONキー取得 → Search Consoleにオーナー追加

---

## 変更履歴

### 2026-05-11（追記）
- **`pending`コメントを「審査中」として表示するよう修正**（実装漏れ）
  - `api_phone.php`：`published`のみ取得 → `published`＋`pending`両方取得するよう変更
  - `src/lib/api.ts`：`Comment`型に`status`フィールドを追加
  - `src/app/tel/[number]/page.tsx`：`pending`コメントは本文非表示・「この口コミは審査中です」を表示
- **Geminiを呼ぶ前にバリデーションを実行するよう修正**（順序が逆だった）
  - 文字数5未満・1000超をGemini呼び出し前に弾くよう`route.ts`を修正
- **クッキーベースのレートリミット実装**
  - 1分に1回・1日10件まで。超過時は`429`を返しGeminiを呼ばない
  - `CommentForm.tsx`：サーバーからのエラーメッセージを画面に表示するよう修正
- **Gemini応答のログ追加**
  - `console.log`でGemini応答を記録。Vercelログで審査結果を確認可能に
  - 日本語応答（「掲載OK」「掲載可」）にも対応

### 2026-05-11
- **口コミ投稿バグ修正（`kagoya-php/api_comment.php`）**
  - シークレット認証の不一致修正：`$input['secret']`→`$_SERVER['HTTP_X_API_SECRET']`（Next.jsがヘッダーで送っていた）
  - `body_hash`（MD5）をINSERT文に追加（NOT NULL制約違反で保存できていなかった）
  - 重複投稿時はエラーではなくsuccessを返すよう修正
- **口コミ自動審査（Gemini）実装（`src/app/api/comment/route.ts`）**
  - 投稿時にGemini 2.5 Flash-Liteで審査し`published`/`pending`を自動判定
  - Vercel環境変数に`GEMINI_API_KEY`を追加（スクレーパー用とは別キーで管理）
  - プロンプトを「投稿者は被害者・警告目的」という文脈を明示する内容に調整（初版は誤判定多数）
- **管理者モード実装（`src/app/tel/[number]/page.tsx`）**
  - `?admin=ID`付きアクセス時のみ各コメントに`#ID`を表示
  - 管理者モード時は`noindex`を付与（クローラー対策）
  - Vercel環境変数に`ADMIN_KEY=ID`を追加
- **口コミ削除エンドポイント追加（`kagoya-php/api_comment_delete.php`）**
  - GETパラメータ`id`＋`secret`で指定コメントを削除
  - `published`コメント削除時は`comment_count`を自動デクリメント

---

## 既存サイトとの関係

| プロジェクト | フォルダ | Vercelプロジェクト名 |
|---|---|---|
| AV女優名鑑（男性向け） | C:\dev\av-act-name-site | av-act-name-site |
| AV女優名鑑（女性向け） | （別フォルダ） | womens-av |
| 迷惑電話DB（本プロジェクト） | C:\dev\sagiden-search | sagiden-search（未作成） |

KAGOYAのPHP APIはすべて `it-tech-jp.net` に現在置かれているが、
本プロジェクトは `api.sagiden-search.com` に独立させる方針。
