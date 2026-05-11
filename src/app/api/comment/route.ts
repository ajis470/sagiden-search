import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

async function moderate(body: string): Promise<"published" | "pending"> {
  const prompt = `迷惑電話・詐欺電話の情報共有サイトに投稿された口コミを審査してください。
投稿者は電話を受けた被害者・目撃者であり、他のユーザーへの注意喚起が目的です。

【掲載OK（published）】
- 受けた電話の内容・手口・状況の説明
- 「詐欺だった」「個人情報を聞き出そうとした」「強引な勧誘だった」等の体験報告
- 主観的・感情的な表現でも体験に基づく内容

【非掲載（pending）】
- 特定の個人（電話をかけた人物）への人身攻撃・誹謗中傷
- 投稿者自身の個人情報（氏名・住所・口座番号等）が含まれる
- 意味不明・スパム・電話と無関係な内容

【口コミ】
${body}

"published" または "pending" の一単語のみで答えてください。`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();
    console.log("[moderate] gemini response:", text);
    if (text.includes("published") || text.includes("掲載ok") || text.includes("掲載可")) {
      return "published";
    }
    return "pending";
  } catch (e) {
    console.error("[moderate] gemini error:", e);
    return "pending";
  }
}

export async function POST(req: NextRequest) {
  const { number, body } = await req.json();
  if (!number || !body?.trim()) {
    return NextResponse.json({ message: "入力内容を確認してください" }, { status: 400 });
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
  return NextResponse.json(json, { status: res.status });
}
