import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

export async function POST(req: NextRequest) {
  const { number, body } = await req.json();
  if (!number || !body?.trim()) {
    return NextResponse.json({ message: "入力内容を確認してください" }, { status: 400 });
  }

  const res = await fetch(`${API_BASE}/api_comment.php`, {
    method: "POST",
    headers: {
      "X-API-Secret": API_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: number, body }),
  });

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
