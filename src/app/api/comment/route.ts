"use server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { waitUntil } from "@vercel/functions";

const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

async function moderate(body: string): Promise<"published" | "pending"> {
  const prompt = `迷惑電話・詐欺電話の情報共有サイトに投稿された口コミを審査してください。
投稿者は電話を受けた被害者・目撃者であり、他のユーザーへの注意喚起が目的です。

基本方針：迷惑電話の体験報告は積極的に掲載する。疑わしい場合は掲載する。

【必ず "pending" にする場合のみ】
- 実在する特定個人（氏名付き）への人身攻撃・脅迫
- 投稿者自身の個人情報（氏名・住所・口座番号等）が含まれる
- 完全に無意味な文字列・スパム

【それ以外は全て "published"】
- 電話の内容・手口・状況の説明
- 感情的な表現・悪口・怒りの言葉も含む体験報告
- 「詐欺」「しつこい」「迷惑」「出るな」等の警告

【口コミ】
${body}

"published" または "pending" の一単語のみで答えてください。`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();
    console.log("[moderate] gemini response:", text);
    if (text.includes("pending") || text.includes("非掲載")) {
      return "pending";
    }
    return "published";
  } catch (e) {
    console.error("[moderate] gemini error:", e);
    return "published";
  }
}

// jpnumber.com の個別ページURLを構築
function buildJpnumberUrl(number: string): string | null {
  if (number.length === 11 && /^(090|080|070|050)/.test(number)) {
    return `https://www.jpnumber.com/numberinfo_${number.slice(0, 3)}_${number.slice(3, 7)}_${number.slice(7)}.html`;
  }
  if (number.length === 10 && /^(0120|0800|0570|0990)/.test(number)) {
    return `https://www.jpnumber.com/freedial/numberinfo_${number.slice(0, 4)}_${number.slice(4, 7)}_${number.slice(7)}.html`;
  }
  // 10桁市外局番系（03/06等）は番号体系が複雑なためスキップ
  return null;
}

// jpnumber.com のHTMLからコメントを抽出
function parseJpnumberComments(html: string): string[] {
  const matches = [...html.matchAll(/<div class="content autonewline">\s*<dt>([\s\S]*?)<\/dt>/g)];
  return matches
    .map((m) => m[1].replace(/<BR\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim())
    .filter((t) => t.length >= 5);
}

// Gemini で要約生成
async function generateSummary(phoneNumber: string, comments: string[]) {
  const commentText = comments.map((c, i) => `${i + 1}. ${c}`).join("\n");
  const prompt = `電話番号「${phoneNumber}」に関する口コミ（最大50件）を分析してください。

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
  "summary": "何者で、どんな手口かを客観的な事実として3行以内で要約。「この電話番号は」で始めない。番号自体には言及せず、発信元の正体や手口から書き始める。",
  "recommended_action": "この電話を受けた人が取るべき具体的な行動を1〜2行で",
  "danger_rank": "C/B/A/S/SS/SSSのいずれか1つ",
  "highlights": [
    "口コミの中で特に参考になる情報を、第三者が書いた客観的な文章として書き直したもの（3〜5件）"
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSONが見つかりません");
  return JSON.parse(jsonMatch[0]);
}

// published コメント投稿後にバックグラウンドで実行
async function triggerResummarize(number: string) {
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
        if (scraped.length > 0) {
          await fetch(`${API_BASE}/api_scrape.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secret: API_SECRET,
              phone_number: number,
              comments: scraped,
              source: "scraped",
              source_site: "jpnumber.com",
            }),
          });
          console.log(`[resummary] jpnumber scraped: ${scraped.length}件`);
        }
      }
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

export async function POST(req: NextRequest) {
  const { number, body } = await req.json();
  if (!number || !body?.trim()) {
    return NextResponse.json({ message: "入力内容を確認してください" }, { status: 400 });
  }
  if ([...body].length < 5 || [...body].length > 1000) {
    return NextResponse.json({ message: "本文は5〜1000文字で入力してください" }, { status: 400 });
  }

  // レートリミット
  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);

  const lastAt = Number(req.cookies.get("last_comment_at")?.value ?? 0);
  if (now - lastAt < 60 * 1000) {
    return NextResponse.json({ message: "投稿は1分に1回までです" }, { status: 429 });
  }

  const dailyRaw = req.cookies.get("comment_dates")?.value ?? "[]";
  const dailyDates: string[] = JSON.parse(dailyRaw).filter((d: string) => d === todayStr);
  if (dailyDates.length >= 10) {
    return NextResponse.json({ message: "1日の投稿上限（10件）に達しました" }, { status: 429 });
  }

  const status = await moderate(body);

  const res = await fetch(`${API_BASE}/api_comment.php`, {
    method: "POST",
    headers: {
      "X-API-Secret": API_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: number, body, status }),
  });

  const json = await res.json();
  const response = NextResponse.json(json, { status: res.status });

  if (res.ok) {
    const cookieOpts = { httpOnly: true, path: "/", sameSite: "lax" as const };
    response.cookies.set("last_comment_at", String(now), { ...cookieOpts, maxAge: 60 });
    const newDates = [...dailyDates, todayStr];
    response.cookies.set("comment_dates", JSON.stringify(newDates), { ...cookieOpts, maxAge: 60 * 60 * 24 });

    // published のときだけバックグラウンドで再要約
    if (status === "published") {
      waitUntil(triggerResummarize(number));
    }
  }

  return response;
}
