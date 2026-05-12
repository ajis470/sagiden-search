"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-6 px-4">
      <p className="text-gray-600">一時的なエラーが発生しました。しばらく待ってから再試行してください。</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700"
        >
          再試行
        </button>
        <Link href="/" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          トップへ
        </Link>
      </div>
    </div>
  );
}
