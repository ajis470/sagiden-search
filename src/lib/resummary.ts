import { GoogleGenerativeAI } from "@google/generative-ai";

const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.replace(/^﻿/, "").trim());
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

function buildJpnumberUrl(number: string): string | null {
  if (number.length === 11 && /^(090|080|070|050)/.test(number)) {
    return `https://www.jpnumber.com/numberinfo_${number.slice(0, 3)}_${number.slice(3, 7)}_${number.slice(7)}.html`;
  }
  if (number.length === 10 && /^(0120|0800|0570|0990)/.test(number)) {
    return `https://www.jpnumber.com/freedial/numberinfo_${number.slice(0, 4)}_${number.slice(4, 7)}_${number.slice(7)}.html`;
  }
  return null;
}

function parseJpnumberComments(html: string): string[] {
  const matches = [...html.matchAll(/<div class="content autonewline">\s*<dt>([\s\S]*?)<\/dt>/g)];
  return matches
    .map((m) => m[1].replace(/<BR\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim())
    .filter((t) => t.length >= 5);
}

const THIN_DATA_THRESHOLD = 3;

async function generateSummary(phoneNumber: string, comments: string[]) {
  const isThin = comments.length <= THIN_DATA_THRESHOLD;
  const commentText = comments.map((c, i) => `${i + 1}. ${c}`).join("\n");

  const thinNote = isThin
    ? `【注意】口コミが${comments.length}件しかないため、情報が限られています。要約の末尾に必ず「情報が少ないため正確な判定が難しい状況です。皆様からの情報をお待ちしています」と追記してください。また危険度は情報不足を考慮して慎重に判定してください。`
    : "";

  const prompt = `電話番号「${phoneNumber}」に関する口コミ（${comments.length}件）を分析してください。
${thinNote}

【口コミ一覧】
${commentText}

危険度ランクの基準：
- C: 正規企業・公的機関・情報不十分・安全確認できず（デフォルト）
- B: 軽度の営業・勧誘（しつこさが低い）
- A: しつこい営業・解約妨害
- S: 架空請求・偽サポート詐欺（実害が出る前）
- SS: アポ電・家族構成や資産を聞き出す情報収集電話
- SSS: オレオレ詐欺・還付金詐欺など特殊詐欺の実行犯

以下のJSON形式のみで回答してください。余分なテキストは不要です：
{
  "summary": "何者で、どんな手口かを客観的な事実として3行以内で要約。「この電話番号は」で始めない。情報が少ない場合は末尾に指定のメッセージを追記。",
  "recommended_action": "発信元が詐欺・フィッシングとほぼ判断できる場合は着信拒否を推奨してよい。正規の企業・機関と判断できる場合は着信拒否を推奨しない（なぜなら受信者に非がある場合が想定されるので）。判断が難しい場合は「悪質と感じた場合は着信拒否も選択肢の一つです」と添える。この電話を受けた人への有益な案内を1〜2行で書く。",
  "danger_rank": "C/B/A/S/SS/SSSのいずれか1つ",
  "highlights": [
    "口コミの中で特に参考になる情報を、第三者が書いた客観的な文章として書き直したもの（1〜5件）"
  ]
}`;

  const result = await getModel().generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSONが見つかりません");
  return JSON.parse(jsonMatch[0]);
}

export async function triggerResummarize(number: string) {
  try {
    // 1. jpnumber.com の個別ページをスクレイプ
    const jpUrl = buildJpnumberUrl(number);
    if (jpUrl) {
      const jpRes = await fetch(jpUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(10000),
      });
      if (jpRes.ok) {
        const html = await jpRes.text();
        const scraped = parseJpnumberComments(html);
        // スクレイプ結果の有無に関わらず force_resummary=true でフラグをセット
        await fetch(`${API_BASE}/api_scrape.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: API_SECRET,
            phone_number: number,
            comments: scraped,
            source: "scraped",
            source_site: "jpnumber.com",
            force_resummary: true,
          }),
        });
        console.log(`[resummary] jpnumber scraped: ${scraped.length}件`);
      }
    } else {
      // URL構築不可の番号も needs_resummary=1 をセット（既存コメントで要約）
      await fetch(`${API_BASE}/api_scrape.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: API_SECRET,
          phone_number: number,
          comments: [],
          source: "scraped",
          source_site: "jpnumber.com",
          force_resummary: true,
        }),
      });
    }

    // 2. needs_resummary=1 の番号一覧から対象を取得
    const pendingRes = await fetch(`${API_BASE}/api_pending.php?secret=${API_SECRET}&limit=50`);
    const pendingJson = await pendingRes.json();
    const entry = pendingJson.data?.find((e: { phone_number: string }) => e.phone_number === number);
    if (!entry || entry.comments.length === 0) {
      console.log(`[resummary] ${number}: コメントなし、スキップ`);
      return;
    }

    // 3. Gemini で要約生成
    const summary = await generateSummary(number, entry.comments);
    console.log(`[resummary] ${number}: 危険度=${summary.danger_rank}`);

    // 4. 保存
    await fetch(`${API_BASE}/api_summary.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: API_SECRET,
        phone_number_id: entry.id,
        summary: summary.summary,
        recommended_action: summary.recommended_action,
        danger_rank: summary.danger_rank,
        highlights: summary.highlights ?? [],
      }),
    });
    console.log(`[resummary] ${number}: 保存完了`);
  } catch (e) {
    console.error(`[resummary] ${number}: エラー`, e);
  }
}
