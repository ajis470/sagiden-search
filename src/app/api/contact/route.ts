import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SCORE_THRESHOLD = 0.5;

export async function POST(req: NextRequest) {
  const { token, phoneNumber, issueType, detail, email } = await req.json();

  if (!token || !issueType || !detail) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  // reCAPTCHA v3 検証
  const verifyRes = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
  });
  const verifyData = await verifyRes.json();

  if (!verifyData.success || verifyData.score < SCORE_THRESHOLD) {
    return NextResponse.json({ error: "スパムと判定されました。時間をおいて再度お試しください。" }, { status: 400 });
  }

  // メール送信
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"sagiden-search お問い合わせ" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `【sagidenお問い合わせ】${issueType}`,
    text: [
      `問題の種類: ${issueType}`,
      `対象電話番号: ${phoneNumber || "未入力"}`,
      `詳細:\n${detail}`,
      `返信先メール: ${email || "未入力"}`,
      `reCAPTCHAスコア: ${verifyData.score}`,
    ].join("\n\n"),
  });

  return NextResponse.json({ success: true });
}
