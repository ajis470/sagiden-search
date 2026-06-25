"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

const ISSUE_TYPES = [
  "虚偽・不正確な情報",
  "誹謗中傷・個人攻撃",
  "プライバシー侵害",
  "その他",
];

export default function ContactPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [issueType, setIssueType] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const token = await new Promise<string>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).grecaptcha.ready(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).grecaptcha
            .execute(SITE_KEY, { action: "contact" })
            .then(resolve)
            .catch(reject);
        });
      });

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, phoneNumber, issueType, detail, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "送信に失敗しました");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
        strategy="afterInteractive"
      />

      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            ← トップ
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-900 text-sm">
            みんなの迷惑電話番号データベース
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">掲載内容の問題を報告</h1>
        <p className="text-sm text-gray-500 leading-7 mb-6">
          掲載情報に誤りや問題がある場合はこちらからご報告ください。内容を確認のうえ対応いたします。
        </p>

        {status === "done" ? (
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-8 text-center flex flex-col gap-3">
            <p className="text-lg font-bold text-gray-900">送信しました</p>
            <p className="text-sm text-gray-500">お問い合わせありがとうございます。内容を確認のうえ対応いたします。</p>
            <Link href="/" className="mt-2 text-sm text-blue-600 underline">
              トップに戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                問題の種類 <span className="text-red-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                対象の電話番号
                <span className="ml-2 text-xs font-normal text-gray-400">任意</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="例：0120000000"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                詳細 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                required
                rows={5}
                placeholder="問題の詳細をご記入ください"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                返信先メールアドレス
                <span className="ml-2 text-xs font-normal text-gray-400">任意</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="返信が必要な場合はご入力ください"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-gray-900 text-white text-sm font-bold rounded-lg px-4 py-3 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {status === "sending" ? "送信中..." : "送信する"}
            </button>

            <p className="text-xs text-gray-400 leading-5">
              このフォームはreCAPTCHA v3で保護されています。
              Googleの
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline ml-1">プライバシーポリシー</a>
              と
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline ml-1">利用規約</a>
              が適用されます。
            </p>
          </form>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>みんなの迷惑電話番号データベース</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy-policy" className="underline">プライバシーポリシー</Link>
        </div>
      </footer>
    </div>
  );
}
