# sagiden-search プロジェクトマップ

迷惑電話・詐欺電話のクラウドソース型データベース。
ユーザー投稿 + jpnumber.com スクレイプ + Gemini AI 自動要約で危険度6段階判定。

## アーキテクチャ概要

```
Vercel (Next.js フロント)
    ↕ HTTPS API
Kagoya (PHP + MySQL 5.7 バックエンド)
    ↑
Windows Task Scheduler → scraper/ (Node.js + Playwright)
```

## ディレクトリ構成

```
sagiden-search/
├── src/
│   ├── app/
│   │   ├── page.tsx              トップページ（ランキング4種 + 新着番号）
│   │   ├── layout.tsx            GA4(G-T48QLR1ETG)統合、共通レイアウト
│   │   ├── tel/[number]/page.tsx 電話番号詳細ページ（+番号はplusプレフィックス）
│   │   ├── danger-rank/page.tsx  危険度ランク説明（C/B/A/S/SS/SSS）
│   │   ├── guide/*/page.tsx      AdSense対策の独自解説ガイド6本（対処法・ブロック方法・詐欺の手口・被害後の相談窓口・高齢家族の守り方・番号漏洩の理由）
│   │   ├── api/comment/route.ts  コメント投稿API（Gemini審査・Rate limit付き）
│   │   └── sitemap.ts            動的サイトマップ（revalidate 1時間、中身のある番号のみ）
│   ├── components/
│   │   ├── SearchBox.tsx         検索ボックス（+番号→plusプレフィックス変換）
│   │   ├── CommentForm.tsx       コメント投稿（call_type選択・着信日時挿入ボタン付き）
│   │   ├── DangerBadge.tsx       危険度バッジ（6段階色分け）
│   │   └── DangerRankPopover.tsx 危険度説明ポップオーバー
│   └── lib/
│       ├── api.ts                KagoyaAPI呼び出し・型定義・fetchPhone(React cache)
│       └── resummary.ts          Gemini要約パイプライン・triggerResummarize
├── scraper/
│   ├── hourly_new_reviews.js     ★新着口コミ巡回（毎日9-19時90分おき8回）
│   ├── daily_scrape.js           ★日次スクレイプ（未完了番号50件・3ページまで）
│   ├── summarize.js              ★AI要約生成（needs_resummary=1の番号20件）
│   ├── run_new_reviews.bat       hourly_new_reviews用バッチ（コンソール表示）
│   ├── run_new_reviews_silent.vbs Task Scheduler用（ウィンドウなし）
│   ├── run_daily.bat             daily_scrape用バッチ
│   ├── notify_tweet.py           X(Twitter)新着通知メール送信
│   ├── post_trending.py          トレンド自動投稿
│   ├── check_comment.py          コメント確認（管理者用）
│   └── last_seen.json            hourly_new_reviews重複防止リスト（自動生成）
├── kagoya-php/                   ★本番バックエンド（KAGOYAサーバーにFTPデプロイ）
│   ├── db.php                    DB接続設定（gitignore対象）
│   ├── helpers.php               normalize_phone()・json_response()
│   ├── api_phone.php             番号検索・登録・検索ログ記録
│   ├── api_comment.php           コメント保存（call_type対応）
│   ├── api_trending.php          ランキング（24h/7d/30d/danger）
│   ├── api_lists.php             新着番号リスト（created_at降順・要約済み）
│   ├── api_exists.php            番号存在確認（hourly_new_reviews用）
│   ├── api_scrape.php            スクレイプ結果保存
│   ├── api_unscraped.php         スクレイプ未完了番号取得（daily_scrape用）
│   ├── api_pending.php           needs_resummary=1番号取得（summarize用）
│   ├── api_summary.php           AI要約保存（danger_rank更新）
│   ├── api_sitemap.php           サイトマップ生成用
│   ├── approve_comment.php       コメント承認（管理者用・現在404で無効化済み）
│   ├── reset_resummary.php       needs_resummaryフラグ一括リセット（管理者用・ロック番号は対象外）
│   ├── admin_resummary_lock.php  AI再要約の永久ロック管理（一覧・lock・unlock）
│   └── _migrate_*.php            DBマイグレーション用（実行済み・触らない）
└── db/
    └── schema.sql                DBテーブル定義
```

## データフロー

```
【自動パイプライン】
hourly_new_reviews.js
  → jpnumber.com/newcomment/ を1ページだけ巡回
  → api_exists.php で重複確認 → 新規のみ INSERT + needs_resummary=1

daily_scrape.js
  → api_unscraped.php で未スクレイプ番号取得（最大50件）
  → jpnumber.com を Playwright でスクレイプ（3ページまで）
  → api_scrape.php で保存 + needs_resummary=1

summarize.js
  → api_pending.php で needs_resummary=1 を20件取得
  → Gemini 2.5 Flash-Lite で要約生成
  → api_summary.php で danger_rank・summary を保存

【ユーザーアクセス時】
検索 → /tel/{number} → api_phone.php → triggerResummarize()（バックグラウンド）
コメント投稿 → /api/comment → Gemini審査 → api_comment.php → needs_resummary=1
```

## 重要な実装メモ

- **+番号のURL**: Vercelが`%2B`を`+`に正規化してルーティング失敗するため、`+18770233681` → `/tel/plus18770233681` に変換。SearchBox・page.tsx両方で対応済み
- **スクレイピング**: jpnumber.comはCloudflareで保護されているためVercel・KAGOYAからは弾かれる。Windowsローカルのみで実行
- **口コミ取得ページ数**: `hourly_new_reviews.js` は1ページのみ、`daily_scrape.js` は最大3ページ
- **KAGOYAへのデプロイ**: kagoya-php/ を編集したらFTPでアップロードが必要（git pushでは反映されない）
- **AI再要約の永久ロック**: 業務用電話等で「詐欺ではない」と申し立てがあり内容を人手で確定させた番号は`resummary_locked=1`にする。ユーザー投稿・スクレイプ・`reset_resummary.php`の一括リセット、いずれもロック番号にはneeds_resummaryを立てない。`admin_resummary_lock.php`で一覧・lock・unlock
- **Geminiモデル**: `gemini-2.5-flash-lite-preview-06-17`（Flash無印と間違えるとコスト6倍超になる）

## 環境変数

```
# .env.local（フロント・scraper/.env.local も同様）
API_BASE=https://api.sagiden-search.com
API_SECRET=sgd_2026_xK9mPqR4vLzN
GEMINI_API_KEY=（Gemini API Key）
ADMIN_KEY=（管理者キー）
```

## デプロイ先

| 対象 | 場所 | デプロイ方法 |
|------|------|------------|
| フロントエンド | Vercel | git push（要確認） |
| PHPバックエンド | Kagoya (api.sagiden-search.com) | FTPアップロード |
| スクレーパー | Windows ローカル | Task Scheduler で自動実行 |

## Task Scheduler 登録済みタスク

- **sagiden-new-reviews**: `run_new_reviews_silent.vbs` を毎日9:00〜19:30、90分おき8回実行

## このファイルの更新ルール

ファイルを追加・削除・役割変更したときは必ずこのファイルも更新すること。
