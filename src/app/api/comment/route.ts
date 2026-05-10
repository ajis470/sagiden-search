import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

async function moderate(body: string): Promise<"published" | "pending"> {
  const prompt = `以下の口コミを審査してください。

【掲載OK（published）】
- 迷惑電話・詐欺電話に関する具体的な体験談
- 注意喚起・情報共有として有益な内容
- 主観的な表現でも事実に基づく内容（「詐欺だと思う」「最悪だった」等）

【非掲載（pending）】
- 誹謗中傷・罵詈雑言（特定の人物への攻撃）
- 個人情報（氏名・住所・口座番号等）を含む
- 意味不明・スパム・関係のない内容

【口コミ】
${body}

"published" または "pending" の一単語のみで答えてください。`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();
    return text.includes("published") ? "published" : "pending";
  } catch {
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
