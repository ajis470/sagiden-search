"use client";

import Link from "next/link";

export default function TelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4 px-4 text-center">
      <p className="text-2xl">📡</p>
      <p className="font-bold text-gray-900">一時的に情報を取得できませんでした</p>
      <p className="text-sm text-gray-500">
        サーバーが混み合っている可能性があります。もう一度お試しください。
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-full bg-red-600 text-white font-bold px-6 py-2 text-sm hover:bg-red-700 transition-colors"
        >
          再試行する
        </button>
        <Link
          href="/"
          className="rounded-full border border-gray-300 text-gray-700 font-bold px-6 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
