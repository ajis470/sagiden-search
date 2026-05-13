import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { waitUntil } from "@vercel/functions";
import { triggerResummarize } from "@/lib/resummary";

const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.replace(/^﻿/, "").trim());
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
- 「不在着信がありました」「電話がありました」などの短い事実報告（着信の存在を知らせるだけでも有益な情報）

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

export async function POST(req: NextRequest) {
  const { number, body, call_type } = await req.json();
  if (!number || !body?.trim()) {
    return NextResponse.json({ message: "入力内容を確認してください" }, { status: 400 });
  }
  if ([...body].length < 5 || [...body].length > 1000) {
    return NextResponse.json({ message: "本文は5〜1000文字で入力してください" }, { status: 400 });
  }
  const validCallTypes = ["call", "sms", "missed", "voicemail"];
  const sanitizedCallType = validCallTypes.includes(call_type) ? call_type : null;

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
    body: JSON.stringify({ phone_number: number, body, status, call_type: sanitizedCallType }),
  });

  const json = await res.json();
  const response = NextResponse.json({ ...json, status_moderation: status }, { status: res.status });

  if (res.ok && status === "published") {
    const cookieOpts = { httpOnly: true, path: "/", sameSite: "lax" as const };
    response.cookies.set("last_comment_at", String(now), { ...cookieOpts, maxAge: 60 });
    const newDates = [...dailyDates, todayStr];
    response.cookies.set("comment_dates", JSON.stringify(newDates), { ...cookieOpts, maxAge: 60 * 60 * 24 });
    waitUntil(triggerResummarize(number));
  } else if (res.ok) {
    const cookieOpts = { httpOnly: true, path: "/", sameSite: "lax" as const };
    response.cookies.set("last_comment_at", String(now), { ...cookieOpts, maxAge: 60 });
    const newDates = [...dailyDates, todayStr];
    response.cookies.set("comment_dates", JSON.stringify(newDates), { ...cookieOpts, maxAge: 60 * 60 * 24 });
  }

  return response;
}
