/**
 * AI要約パイプライン
 * needs_resummary=1 の番号を取得し、Gemini 2.5 Flash-Liteで要約を生成してDBに保存する
 *
 * 実行方法: node summarize.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_BASE   = 'https://api.sagiden-search.com';
const API_SECRET = 'sgd_2026_xK9mPqR4vLzN';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const MODEL      = 'gemini-2.5-flash-lite';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });

// 危険度ランクの判定基準（プロンプトに含める）
const RANK_GUIDE = `
危険度ランクの基準：
- C: 正規企業・公的機関・情報不十分・安全確認できず（デフォルト）
- B: 軽度の営業・勧誘（しつこさが低い）
- A: しつこい営業・解約妨害
- S: 架空請求・偽サポート詐欺（実害が出る前）
- SS: アポ電・家族構成や資産を聞き出す情報収集電話
- SSS: オレオレ詐欺・還付金詐欺など特殊詐欺の実行犯
`.trim();

async function generateSummary(phoneNumber, comments) {
  const commentText = comments.map((c, i) => `${i + 1}. ${c}`).join('\n');

  const prompt = `
電話番号「${phoneNumber}」に関する口コミ（最大50件）を分析してください。

【口コミ一覧】
${commentText}

【${RANK_GUIDE}】

以下のJSON形式のみで回答してください。余分なテキストは不要です：
{
  "summary": "何者で、どんな手口かを客観的な事実として3行以内で要約。「この電話番号は」で始めない。番号自体には言及せず、発信元の正体や手口から書き始める。例：「ソフトバンクを名乗り〜」「自動音声で電力会社を装い〜」「闇金業者とみられる〜」",
  "recommended_action": "この電話を受けた人が取るべき具体的な行動を1〜2行で",
  "danger_rank": "C/B/A/S/SS/SSSのいずれか1つ",
  "highlights": [
    "口コミの中で特に参考になる情報を、第三者が書いた客観的な文章として書き直したもの（3〜5件）",
    "例：「自動音声で電力会社のアンケートと称して個人情報を聞き出そうとする」",
    "例：「折り返すと繋がらない、または別の番号に転送される」"
  ]
}

highlightsの注意：
- 元の口コミをそのままコピーしない。必ず自分の言葉で書き直す
- 誹謗中傷・感情的な表現は除外し、事実ベースの情報のみ抽出する
- 重複する内容はまとめて1件にする
- 3〜5件に絞る
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // JSONを抽出（コードブロックで返ってきた場合も対応）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`JSONが見つかりません: ${text.substring(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

async function main() {
  console.log('=== AI要約パイプライン開始 ===');

  // 要約待ち番号を取得
  const res = await fetch(`${API_BASE}/api_pending.php?secret=${API_SECRET}&limit=20`);
  const json = await res.json();

  if (json.status !== 'success' || json.data.length === 0) {
    console.log('要約待ちの番号はありません');
    return;
  }

  console.log(`${json.data.length}件を処理します`);

  for (const entry of json.data) {
    console.log(`処理中: ${entry.phone_number}（コメント${entry.comments.length}件）`);

    if (entry.comments.length === 0) {
      console.log('  コメントなし、スキップ');
      continue;
    }

    try {
      const summary = await generateSummary(entry.phone_number, entry.comments);
      console.log(`  危険度: ${summary.danger_rank}`);
      console.log(`  要約: ${summary.summary.substring(0, 60)}...`);

      // 結果をDBに保存
      const saveRes = await fetch(`${API_BASE}/api_summary.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret:             API_SECRET,
          phone_number_id:    entry.id,
          summary:            summary.summary,
          recommended_action: summary.recommended_action,
          danger_rank:        summary.danger_rank,
          highlights:         summary.highlights ?? [],
        }),
      });
      const saveJson = await saveRes.json();
      console.log(`  保存: ${saveJson.status}`);

    } catch (e) {
      console.error(`  エラー: ${e.message}`);
    }

    await sleep(1000); // Gemini APIレート制限対策
  }

  console.log('=== AI要約パイプライン完了 ===');
}

main();
